#!/usr/bin/env node
// 范围对账与可疑行标注：列出相对 base 改动（含未跟踪文件）但不在声明清单内的文件，
// 并按关键词标出新增行中可能越界的位置（历史叙事注释、仅引用文档的注释、新增防御、新增抽象）。只读 git。
// 用法：node scope-check.mjs --base <ref> <声明的文件...>
// 退出码：0 无清单外文件；1 有清单外文件；2 git 或参数错误。flags 只作提示，不影响退出码。
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const i = args.indexOf("--base");
if (i < 0 || !args[i + 1]) {
  console.error("用法: scope-check.mjs --base <ref> <声明的文件...>");
  process.exit(2);
}
const base = args[i + 1];
const declared = new Set(args.filter((_, k) => k !== i && k !== i + 1).map((f) => f.replace(/^\.\//, "")));

const git = (...a) => execFileSync("git", a, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const lines = (s) => s.split("\n").filter(Boolean);

let tracked, untracked, diff;
try {
  tracked = lines(git("diff", "--name-only", base));
  untracked = lines(git("ls-files", "--others", "--exclude-standard", "--full-name", ":/"));
  diff = git("diff", "-U0", "--no-color", "--src-prefix=a/", "--dst-prefix=b/", base);
} catch (e) {
  console.error(`git 失败: ${e.message}`);
  process.exit(2);
}

const changed = [...new Set([...tracked, ...untracked])];
const outOfScope = changed.filter((f) => !declared.has(f));

// 收集新增行：[file, lineNo, text]
const added = [];
let file = null;
let lineNo = 0;
for (const l of diff.split("\n")) {
  if (l.startsWith("+++ ")) {
    file = l === "+++ /dev/null" ? null : l.slice(6);
  } else if (l.startsWith("@@")) {
    const m = /\+(\d+)/.exec(l);
    lineNo = m ? Number(m[1]) : 0;
  } else if (file && l.startsWith("+")) {
    added.push([file, lineNo++, l.slice(1)]);
  }
}
const root = git("rev-parse", "--show-toplevel").trim();
for (const f of untracked) {
  let text;
  try {
    text = readFileSync(`${root}/${f}`, "utf8");
  } catch {
    continue;
  }
  if (text.includes("\0")) continue;
  text.split("\n").forEach((t, k) => added.push([f, k + 1, t]));
}

// 文档文件本身就是叙述，不检查注释类规则
const isDoc = (f) => /\.(md|markdown|mdx|txt|rst|adoc)$/i.test(f);
// 取出注释部分：整行注释，或空白后跟注释符的行尾注释
const comment = (t) => {
  const s = t.trim();
  const whole = /^(\/\/|#|\/\*|\*|<!--|--|;)(.*)$/.exec(s);
  if (whole) return whole[2];
  const tail = /\s(\/\/|#|\/\*|<!--|--)\s(.*)$/.exec(s);
  return tail ? tail[2] : null;
};

const rules = [
  ["history-comment", true, /修复|曾经|以前|原来|改为|改成|兼容旧|旧版|\bbug\b|\bfix(e[sd])?\b|workaround|\bhack\b|regression|issue\s*#?\d+/i],
  ["doc-reference", true, /(见|参考|参见|详见|依据|按照|\bsee\b|\bper\b|according to).{0,20}(文档|设计|方案|规范|\bspec\b|\bdesign\b|\bdoc|\bADR\b|\bRFC\b|\.md\b)/i],
  ["defense", false, /\b(catch|except|rescue|retry|retries|fallback|recover|mutex|synchronized|lock)\b|兜底|降级|重试/i],
  ["abstraction", false, /\b(interface|abstract\s+class|trait|protocol)\s+\w+|\w+(Factory|Strategy|Provider|Adapter)\b/],
];

const flags = [];
for (const [f, n, t] of added) {
  for (const [kind, onComment, re] of rules) {
    if (onComment) {
      if (isDoc(f)) continue;
      const c = comment(t);
      if (c && re.test(c)) flags.push({ file: f, line: n, kind, text: t.trim() });
    } else if (!isDoc(f) && re.test(t)) {
      flags.push({ file: f, line: n, kind, text: t.trim() });
    }
  }
}

console.log(JSON.stringify({ base, changed: changed.length, declared: declared.size, outOfScope, flags }, null, 2));
process.exit(outOfScope.length ? 1 : 0);
