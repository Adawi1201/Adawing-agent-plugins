# 审计模式

检查已有的 AGENTS.md（以及导入它或与它并存的 CLAUDE.md），找出失效、冗余和冲突的条目。先给出问题清单与建议改动，用户确认后再改。

## 第一步：运行脚本

在仓库根目录运行：

```bash
node <本 skill 目录>/scripts/audit-agents.mjs [文件...]
```

不传文件时，检查仓库根目录存在的 `AGENTS.md`、`CLAUDE.md`、`.claude/CLAUDE.md`。脚本只读，输出 JSON：

- `missingPaths`：反引号中引用的仓库路径不存在
- `missingScripts`：`npm / pnpm / yarn / bun run <name>` 等命令引用的 `package.json` script 不存在，`make <target>` 引用的 Makefile 目标不存在
- `volatile`：日期、“最近”“目前”“TODO”等易变内容
- `lines`：总行数，超过 200 时 `overLimit` 为 true
- `claudeShadowsAgents`：同时存在 `AGENTS.md` 与未导入它的 `CLAUDE.md`，Claude Code 默认不会读到 AGENTS.md

退出码 0 表示无发现，1 表示有发现，2 表示参数或读取错误。脚本只能发现机械问题，下一步的判断仍需逐条阅读。

## 第二步：逐条检查

对每一条内容，按 [content-guide.md](content-guide.md) 的判断标准与 [capture.md](capture.md) 的“不该固化”检查：

| 问题 | 判据 | 建议 |
|---|---|---|
| 失效 | 脚本报告的路径或命令不存在；描述与当前代码不符 | 更新或删除 |
| 可推断 | 读仓库直接可得，不是陷阱 | 删除 |
| 工具已强制 | lint、format、CI、类型检查已覆盖 | 删除，保留检查命令 |
| 通用 | 模型已知的通用知识，或通用的 agent 行为规则 | 删除 |
| 冲突 | 与本文件其他条目、其他指令文件或已安装 skill 的规则矛盾 | 合并为一条，或删除一方 |
| 易变 | 进度、临时状态、日期 | 删除 |
| 经过 | 写的是错误或决策的经过，而不是约束 | 改写成约束 |
| 局部 | 只与某个模块有关 | 移到模块目录下的 AGENTS.md |

需要时运行文件中写的命令，确认仍然可用。

## 第三步：报告与修改

按问题类型列出：行号、原文、问题、建议改动。另外给出改动后的预计总行数。

用户确认后再修改文件。只改确认的条目，不顺手重排或改写其他内容。
