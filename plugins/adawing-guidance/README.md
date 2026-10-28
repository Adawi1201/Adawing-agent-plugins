# adawing-guidance

项目级 **AGENTS.md** 的初始化、审计与沉淀。核心原则：只写模型从仓库里推断不出来、长期成立、几乎每个任务都用得上的信息；能由工具强制的规则交给工具。

## 解决什么

| 问题 | 做法 |
|---|---|
| 初始化写进去的内容大多是模型自己能读到的，效果感知不到 | 只写推断不出来的；命令实际运行验证，重点写看着对、实际不对的命令和运行前提 |
| 文件写完就不再维护，引用的命令和路径逐渐失效 | 审计模式：`audit-agents.mjs` 找出失效路径与命令、易变内容、超长，再逐条检查冗余与冲突 |
| 最有价值的“这个项目里实际踩过的坑”在初始化时拿不到 | 沉淀模式：任务中真实发生的项目特有错误，整理成待确认的一行规则 |
| 写入通用规则，与 agent 或已安装 skill 冲突 | 第 5 层只放项目特有的行为约束，通用 agent 规则列入负面清单 |
| Claude Code 在存在 CLAUDE.md 时不读 AGENTS.md | 文件落点规则：以 AGENTS.md 为正文，已有 CLAUDE.md 时加 `@AGENTS.md` 导入 |

## 三种模式

| 模式 | 触发 | 产出 |
|---|---|---|
| 初始化 | “生成 AGENTS.md”“初始化 agent 配置” | AGENTS.md，不超过 200 行，没有下限 |
| 审计 | “检查 / 精简 AGENTS.md”，或初始化时发现已存在 | 问题清单与建议改动，确认后再改 |
| 沉淀 | 用户纠正了项目特有的做法，或说“记下来” | 一条待确认的候选规则 |

沉淀判据在 `references/capture.md`：四条同时满足才沉淀（项目特有、推断不出来、长期成立、会再遇到）；本次任务的决定、临时指令、当前状态、根因未确认的经验、工具已强制的规则、模型的通用缺陷、错误经过和个人偏好都不固化。

## 结构

```
skills/adawing-guidance/
├── SKILL.md                       # 三种模式、文件落点、初始化流程、硬规则
├── assets/AGENTS.template.md      # AGENTS.md 骨架模板
├── references/
│   ├── content-guide.md           # 七层内容的取舍标准、负面清单与写法
│   ├── audit.md                   # 审计模式
│   └── capture.md                 # 沉淀模式：什么该沉淀、什么不该固化
├── scripts/audit-agents.mjs       # 失效路径与命令、易变内容、超长、CLAUDE.md 遮蔽检查（只读，零依赖）
└── evals/evals.json
```

`audit-agents.mjs` 需要 Node.js 18+，在仓库根目录运行。退出码 0 表示无发现，1 表示有发现，2 表示参数或读取错误。

## 安装

本插件通过 `adawing` marketplace 分发：

```
/plugin marketplace add Adawi1201/Adawing-agent-plugins
/plugin install adawing-guidance@adawing
```

或手动将 `skills/adawing-guidance/` 复制到 `~/.claude/skills/adawing-guidance/`。

Kimi Code 使用仓库根部的 `.kimi-plugin/marketplace.json`（`/plugins marketplace <路径>`），或直接 `/plugins install <本插件目录>`。

OpenCode 无需 manifest，将 `skills/adawing-guidance/` 复制或软链到 `~/.config/opencode/skills/adawing-guidance/`；OpenCode 也读取 `~/.claude/skills/`，已按上文手动安装的无须重复。

## 版本

**2.0.0-prev**（预览，随整包 3.0.0-prev 发布）：

- 新增审计与沉淀两种模式，以及 `audit-agents.mjs`；
- 初始化要求实际运行测试与检查命令；
- 体量改为不超过 200 行、没有下限（依据 Claude Code 文档的建议上限）；
- 去掉缓存排序论证，七层改为从全局到局部排列；
- 模板“工作方式”改为“项目约束”，只放项目特有的行为约束；通用 agent 规则与工具已强制的规则列入负面清单；
- 规则允许在同一行附一句原因；
- 新增文件落点规则：以 AGENTS.md 为正文，已有 CLAUDE.md 时用 `@AGENTS.md` 导入；
- 首次提供 evals，尚未运行。

**1.1.0**：此前的发布版本，未单独记录变更。

## License

MIT
