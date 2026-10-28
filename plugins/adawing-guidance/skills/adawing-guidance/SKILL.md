---
name: adawing-guidance
description: 为软件项目生成、审计或沉淀项目级 AGENTS.md（agent 项目提示词）。当用户要求"生成 AGENTS.md"、"初始化 agent 配置"、"写项目级提示词"、"检查 / 审计 AGENTS.md"、"把这条记到 AGENTS.md"、"记下来以后别再犯"，或在任务中纠正了 agent 在本项目特有问题上的做法、提到 agents.md / CLAUDE.md / 项目级 prompt 时使用。初始化只写推断不出来的内容并实际验证命令；审计找出失效与冗余条目；沉淀把真实发生过的项目特有错误整理成待确认的一行规则。
---

# adawing-guidance —— 项目级 AGENTS.md 的初始化、审计与沉淀

只写模型从仓库里推断不出来、长期成立、几乎每个任务都用得上的信息。能由 lint、CI、类型检查或测试强制的规则交给工具，不写进提示词。

## 三种模式

| 模式 | 触发 | 产出 | 细则 |
|---|---|---|---|
| 初始化 | 项目没有 AGENTS.md，或用户要求重新生成 | AGENTS.md | 本文件“初始化” |
| 审计 | 用户要求检查、精简、更新已有 AGENTS.md；或初始化时发现已存在 | 问题清单与建议改动，确认后再改 | [references/audit.md](references/audit.md) |
| 沉淀 | 用户纠正了项目特有的做法，或要求“记下来” | 一条待确认的候选规则 | [references/capture.md](references/capture.md) |

只读取当前模式需要的 reference。

## 文件落点

- 以仓库根目录的 `AGENTS.md` 为唯一正文。Claude Code（v2.1.277 起）在没有 `CLAUDE.md` 时直接读取它，OpenCode 等工具也读取它
- 仓库已有 `CLAUDE.md`、`.claude/CLAUDE.md` 或 `CLAUDE.local.md` 时，Claude Code 默认只读这些文件、不读 `AGENTS.md`。此时在 `CLAUDE.md` 顶部加入一行 `@AGENTS.md` 导入；原有内容按审计模式处理，不直接覆盖
- 只在用户使用的工具不支持直接读取 `AGENTS.md` 时，才新建只含 `@AGENTS.md` 的 `CLAUDE.md`
- monorepo 或模块差异大时，根文件只放全局内容，模块特有约定放在模块目录下的 `AGENTS.md`
- 个人偏好不写进项目文件：Claude Code 用 `CLAUDE.local.md`，OpenCode 用 `~/.config/opencode/AGENTS.md`

## 初始化

### 第一步：调研项目（不改代码）

每一项都要有证据来源，不编造：

1. **技术栈与版本**：读取实际存在的依赖清单（`package.json`、`pom.xml`、`build.gradle`、`pyproject.toml`、`go.mod`、`Cargo.toml` 等）
2. **命令**：从 `Makefile`、`package.json` scripts、`justfile`、CI 配置、README 中提取构建、测试、启动、检查命令，然后**实际运行**测试命令（只跑单个或最小范围的测试）和检查命令，确认能用、耗时可接受。会写数据库、发请求或耗时很长的命令不运行，标注“未验证”并向用户确认
3. **模块与依赖方向**：列出顶层目录，识别模块边界、入口与依赖方向
4. **既有约定**：读取 lint / format 配置与已有的 `AGENTS.md`、`CLAUDE.md`、`.cursorrules`；工具已强制的规则只记录检查命令
5. **仓库里找不到的信息**（环境前提、冻结目录、业务术语、review 中常被打回的写法）：向用户提问，不假设

### 第二步：组织内容

按 [references/content-guide.md](references/content-guide.md) 的七层组织，先全局后局部。每一条都要通过测试：没有这一条，模型会不会犯错或多浪费一轮？不会就不写。

### 第三步：套用模板生成

以 [assets/AGENTS.template.md](assets/AGENTS.template.md) 为骨架，用调研结果替换占位符。

- 总长不超过 200 行（Claude Code 文档的建议上限，更长会降低遵循度），没有下限；信息少的项目写短
- 收集不到有效信息的层直接删除，不留空壳或“待定”
- 命令只写第一步验证过的，未验证的标注
- 每条规则一行，祈使句；原因不自明时，在同一行用一句话说明
- 不写时间戳、当前进度、临时 TODO、文件或类的全量清单、教程式背景、模型已知的通用知识、通用的 agent 行为规则

### 第四步：自检与交付

- [ ] 每条内容都通过“没有它会不会犯错”的测试
- [ ] 每条命令都有出处，并标明已验证或未验证
- [ ] 没有工具已强制的规则、通用知识或通用 agent 行为规则
- [ ] 没有时间戳、易变状态、文件清单
- [ ] 总行数不超过 200
- [ ] 运行 `scripts/audit-agents.mjs`（见 audit.md），没有失效路径或命令

交付时说明：生成了哪些文件、哪些命令未验证、哪些信息需要用户补充。

## 硬规则

1. 命令、版本、路径都有调研证据，不编造
2. 修改已有的 AGENTS.md 或 CLAUDE.md 前先给出改动清单，确认后再改
3. 沉淀的规则逐条经用户确认后才写入
4. 总行数不超过 200

## 附属资源

- `references/content-guide.md` —— 七层内容的取舍标准、负面清单与写法示例
- `references/audit.md` —— 审计模式的检查项与流程
- `references/capture.md` —— 沉淀模式：什么该沉淀、什么不该固化
- `assets/AGENTS.template.md` —— AGENTS.md 骨架模板
- `scripts/audit-agents.mjs` —— 检查 AGENTS.md 中失效的路径和脚本命令、超长和易变内容，只读
