#!/usr/bin/env node
// 范围漂移对账：列出相对 base 改动（含未跟踪文件）但不在声明清单内的文件。只读 git。
// 用法：node drift-check.mjs --base <ref> <声明的文件...>
// 退出码：0 无漂移；1 有漂移（stdout 列出）；2 git 或参数错误。
import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const i = args.indexOf("--base");
if (i < 0 || !args[i + 1]) {
  console.error("用法: drift-check.mjs --base <ref> <声明的文件...>");
  process.exit(2);
}
const base = args[i + 1];
const declared = new Set(args.filter((_, k) => k !== i && k !== i + 1).map((f) => f.replace(/^\.\//, "")));

const git = (...a) => execFileSync("git", a, { encoding: "utf8" }).split("\n").filter(Boolean);
let changed;
try {
  changed = [...new Set([...git("diff", "--name-only", base), ...git("ls-files", "--others", "--exclude-standard", "--full-name", ":/")])];
} catch (e) {
  console.error(`git 失败: ${e.message}`);
  process.exit(2);
}

const drift = changed.filter((f) => !declared.has(f));
console.log(JSON.stringify({ base, changed: changed.length, declared: declared.size, drift }, null, 2));
process.exit(drift.length ? 1 : 0);
