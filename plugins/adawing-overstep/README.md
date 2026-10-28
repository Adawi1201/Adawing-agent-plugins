# adawing-overstep

不越过用户请求的范围与授权。由 `adawing-invoker` 2.3.0 与 `adawing-workflow` 2.3.0 合并而来，并加入编码纪律。

## 解决什么

| 越界 | 表现 | 做法 |
|---|---|---|
| 越过请求范围 | 顺手改相邻代码、加未要求的功能和抽象、为不会发生的失败写兜底、风格与现有代码不一致 | `[SCOPE]` 声明范围；精准修改与编码纪律；review 对照 diff 检查；`scope-check.mjs` 对账 |
| 越过用户授权 | 验收有歧义时替用户选、未经批准改既有接口或数据形状 | `[CLARIFY]` 澄清；`[CONFIRM]` 等待批准 |
| 不披露 | 完成报告只说做了什么，不说与指令差在哪里 | `[REPORT]` 固定列出越界与偏离，有项时请求确认 |

## 标记

| 标记 | 时机 | 是否停下 |
|---|---|---|
| `[SCOPE]` | 首个改变状态的操作之前，声明请求、文件、规模、取舍、下一步 | 否 |
| `[CLARIFY]` | 检索后确认为验收歧义 | 是 |
| `[CONFIRM]` | planned / staged 闸门，或命中不可逆 | 是 |
| `[RESCOPE]` | 清单外文件、升档、触及不可逆、连续失败 | 第二次追加或连续失败两次时停 |
| `[REPORT]` | 任务结束或中途停止，列出验证、越界、未完成或偏离 | 有越界或偏离项时停 |

## 按任务类型加载

| 任务类型 | 加载 |
|---|---|
| 编码（源代码、测试、构建脚本） | `SKILL.md` + `coding.md` + 命中的 tier，phase 按阶段加载 |
| 非编码改动（文档、配置、会改变状态的命令） | `SKILL.md` |
| 只读（检索、问答、讨论） | 不输出标记 |

编码任务按三个规模判断定档：是否跨模块、是否改公共接口（含对外可观察契约）、是否改数据形状。

| Tier | 判据 | 阶段 |
|---|---|---|
| `direct` | 全否 | preview 按需 -> build -> verify |
| `planned` | 命中一项 | plan -> preview 按需 -> 闸门 -> build -> review -> verify |
| `staged` | 命中两项以上，或包含多个子功能 | 同 planned，plan 与 verify 写入 `docs/adawing/` |

preview 按验收方式选择 `none / inline / page`，与 tier 无关。

## 编码纪律

编码任务读 `references/coding.md`，先按其中的“编码规模”定档；纪律部分是正面做法：最小实现、防御范围、注释纪律、沿用现有风格。精准修改适用于所有改动，写在 `SKILL.md`。这些做法没守住时 diff 里会出现的样子，只列在 `references/phases/review.md` 中，供审查时对照。

## 结构

```
skills/adawing-overstep/
├── SKILL.md                    # 入口：任务类型、标记、通用纪律、硬规则
├── references/
│   ├── blocking.md             # [CLARIFY] 与不可逆 [CONFIRM] 细则
│   ├── coding.md               # 编码规模定档与编码纪律
│   ├── tiers/
│   │   ├── direct.md
│   │   ├── planned.md
│   │   └── staged.md
│   └── phases/
│       ├── plan.md
│       ├── preview.md
│       ├── build.md
│       ├── review.md
│       └── verify.md
├── scripts/scope-check.mjs     # 范围对账与可疑行标注（只读 git，零依赖）
└── evals/evals.json
```

`scope-check.mjs` 需要 Node.js 18+。退出码 0 表示无清单外文件，1 表示有，2 表示参数或 git 错误；`flags` 按关键词标出可疑的新增行（历史叙事注释、仅引用文档的注释、新增防御、新增抽象），只作提示，不影响退出码。

## 安装

```text
/plugin marketplace add Adawi1201/Adawing-agent-plugins
/plugin install adawing-overstep@adawing
```

手动复制时，将 `skills/adawing-overstep/` 放入 `~/.claude/skills/adawing-overstep/`。

Kimi Code 使用仓库根部的 `.kimi-plugin/marketplace.json`（`/plugins marketplace <路径>`），或直接 `/plugins install <本插件目录>`。

OpenCode 无需 manifest，将 `skills/adawing-overstep/` 复制或软链到 `~/.config/opencode/skills/adawing-overstep/`；OpenCode 也读取 `~/.claude/skills/`，已按上文手动安装的无须重复。

从 invoker / workflow 升级：先卸载 `adawing-invoker` 与 `adawing-workflow`，或删除对应的手动安装目录与软链，再安装本插件。两套 skill 同时存在会重复触发。

## 版本

**3.0.0-prev**（预览，用于日常使用验证）：

- 合并 `adawing-invoker` 与 `adawing-workflow`，入口只触发一次，按任务类型加载；
- 标记改为 `[SCOPE]` `[CLARIFY]` `[CONFIRM]` `[RESCOPE]` `[REPORT]`；取消 self / discuss 分档，取舍写进 `[SCOPE]`；
- tier 改名为 `direct / planned / staged`，preview 改名为 `none / inline / page`；
- 新增编码纪律（最小实现、防御范围、注释纪律、沿用现有风格）与精准修改；
- review 增加越界反模式清单，新增 `scope-check.mjs`；
- `[REPORT]` 固定披露越界与偏离，有项时请求确认；
- plan 的回滚方式改为整个计划写一处。

evals 尚未运行，以实际使用效果为准。

## License

MIT
