#!/usr/bin/env node
// AGENTS.md 审计：检查失效的路径与脚本命令、易变内容、超长，以及 CLAUDE.md 遮蔽 AGENTS.md 的情况。只读。
// 用法：node audit-agents.mjs [文件...]（在仓库根目录运行；不传文件时检查根目录的 AGENTS.md、CLAUDE.md、.claude/CLAUDE.md）
// 退出码：0 无发现；1 有发现；2 参数或读取错误。
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { dirname, join } from "node:path";

const LIMIT = 200;
const root = process.cwd();
const defaults = ["AGENTS.md", "CLAUDE.md", ".claude/CLAUDE.md"];
const files = process.argv.length > 2 ? process.argv.slice(2) : defaults.filter((f) => existsSync(join(root, f)));
if (!files.length) {
  console.error("未找到 AGENTS.md / CLAUDE.md；请在仓库根目录运行，或传入文件路径");
  process.exit(2);
}

const read = (p) => {
  try {
    return readFileSync(p, "utf8");
  } catch {
    return null;
  }
};

const pkg = JSON.parse(read(join(root, "package.json")) ?? "null");
const scripts = pkg ? new Set(Object.keys(pkg.scripts ?? {})) : null;
const makefile = read(join(root, "Makefile")) ?? read(join(root, "makefile"));
const targets = makefile ? new Set([...makefile.matchAll(/^([\w./-]+)\s*:(?!=)/gm)].map((m) => m[1])) : null;

// 包管理器自带的子命令，不对应 package.json script
const builtin = new Set(
  "install i ci add remove rm uninstall update up upgrade exec dlx x create init publish pack link unlink outdated audit why list ls config help version login logout whoami info view cache rebuild prune dedupe store env patch import workspace workspaces set global node fetch setup".split(" "),
);
const FILE_EXT = /\.(md|mdx|json|jsonc|ya?ml|toml|ini|cfg|conf|env|properties|xml|gradle|kts|lock|txt|sh|bash|zsh|ps1|py|js|mjs|cjs|ts|tsx|jsx|vue|svelte|java|kt|scala|go|rs|rb|php|cs|swift|c|h|cpp|hpp|sql|proto|graphql|css|scss|less|html)$/i;
const VOLATILE = /\b20\d{2}[-/.]\d{1,2}([-/.]\d{1,2})?\b|20\d{2}\s*年\s*\d{1,2}\s*月|最近更新|最近修|目前正在|当前进度|进行中|暂时|\bTODO\b|\bFIXME\b|\bWIP\b|last updated|updated on|currently working/i;

const findings = { files: [], missingPaths: [], missingScripts: [], volatile: [], claudeShadowsAgents: false };
let readError = false;

for (const f of files) {
  const abs = join(root, f);
  const text = read(abs);
  if (text === null) {
    console.error(`无法读取: ${f}`);
    readError = true;
    continue;
  }
  const lines = text.split("\n");
  const count = text.endsWith("\n") ? lines.length - 1 : lines.length;
  findings.files.push({ file: f, lines: count, overLimit: count > LIMIT });

  let fenced = false;
  lines.forEach((line, k) => {
    const n = k + 1;
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      return;
    }
    if (VOLATILE.test(line)) findings.volatile.push({ file: f, line: n, text: line.trim() });

    const spans = fenced ? [line] : [...line.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
    // CLAUDE.md 中反引号外的 @path 导入
    const imports = fenced ? [] : [...line.replace(/`[^`]*`/g, "").matchAll(/(?:^|\s)@([\w./-]+)/g)].map((m) => m[1]);

    for (const s of spans) {
      for (const m of s.matchAll(/\b(npm|pnpm|yarn|bun)\s+(run\s+)?([\w:.-]+)/g)) {
        const [, tool, run, name] = m;
        if (!scripts || (!run && builtin.has(name)) || name.startsWith("-")) continue;
        if (!scripts.has(name)) findings.missingScripts.push({ file: f, line: n, command: m[0], reason: "package.json 中没有该 script" });
      }
      for (const m of s.matchAll(/\bmake\s+([\w./-]+)/g)) {
        if (!targets || m[1].startsWith("-")) continue;
        if (!targets.has(m[1])) findings.missingScripts.push({ file: f, line: n, command: m[0], reason: "Makefile 中没有该目标" });
      }
    }

    const candidates = [...(fenced ? [] : spans), ...imports];
    for (const raw of candidates) {
      const p = raw.trim().replace(/[:：,，。;；)]+$/, "").replace(/^\.\//, "");
      if (!/^[\w.][\w./-]*$/.test(p) || p.includes("{{") || p.includes("..")) continue;
      if (!p.includes("/") && !FILE_EXT.test(p)) continue;
      const exists = [join(root, p), join(dirname(abs), p)].some((c) => existsSync(c.replace(/\/$/, "")));
      if (!exists) findings.missingPaths.push({ file: f, line: n, path: p });
    }
  });
}

// Claude Code 默认：存在 CLAUDE.md / .claude/CLAUDE.md / CLAUDE.local.md 时只读它们，不读 AGENTS.md
const agents = join(root, "AGENTS.md");
if (existsSync(agents)) {
  const shadows = ["CLAUDE.md", ".claude/CLAUDE.md", "CLAUDE.local.md"].map((f) => join(root, f)).filter((p) => existsSync(p));
  const linked = shadows.some((p) => {
    try {
      if (realpathSync(p) === realpathSync(agents)) return true;
    } catch {}
    return /(^|\s)@(\.\/)?AGENTS\.md\b/m.test((read(p) ?? "").replace(/`[^`]*`/g, ""));
  });
  findings.claudeShadowsAgents = shadows.length > 0 && !linked;
}

console.log(JSON.stringify(findings, null, 2));
const found =
  findings.missingPaths.length ||
  findings.missingScripts.length ||
  findings.volatile.length ||
  findings.claudeShadowsAgents ||
  findings.files.some((x) => x.overLimit);
process.exit(readError ? 2 : found ? 1 : 0);
