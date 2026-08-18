# adawing-invoker

动手前的判断纪律。不替模型做判断，只要求它把判断摆出来、自己承担，并留下可被核验的痕迹。默认不阻塞。

## 定位

| Skill | 职责 | 判据 |
|---|---|---|
| **`adawing-invoker`** | 判断该怎么做，以及是否需要先问 | 歧义与取舍 |
| `adawing-workflow` | 已决定执行后按规模推进 | 改动规模 |

invoker 可独立安装和使用。workflow 是它的下游执行补充，安装 workflow 时会自动依赖 invoker；invoker 不反向依赖 workflow。

## 触发条件

涉及以下行为的用户请求都应触发：

- 编写代码、修改文件、执行命令
- 架构或技术选型
- 删除、覆盖、配置变更
- 依赖安装 / 卸载、批量操作

## 三种路径

| 路径 | 用途 | 结果 |
|---|---|---|
| `self` | 四条降档条件全部满足 | 声明文件范围后直接执行 |
| `discuss` | 默认路径，存在真实取舍 | 留下决定记录，然后执行默认动作 |
| `PAUSE` | 只有验收歧义或不可逆门控 | 附证据暂停，等待用户确认 |

每个任务入口都必须有一次紧凑 `[EVALUATION]`。格式可以是一行、短段落、列表或表格，但必须包含路径、依据、决定（可以明确写“无”）和下一步。报告不得因没有取舍而省略。

## 目录结构

```
adawing-invoker/
├── .claude-plugin/plugin.json
├── README.md
└── skills/adawing-invoker/
    ├── SKILL.md
    ├── references/blocking.md
    └── evals/evals.json
```

`blocking.md` 只在命中验收歧义或不可逆时读取，默认路径不需要加载。

## 安装

```text
/plugin marketplace add Adawi1201/Adawing-agent-plugins
/plugin install adawing-invoker@adawing
```

手动复制时，将 `skills/adawing-invoker/` 放入 `~/.claude/skills/adawing-invoker/`。要使用 workflow，必须同时安装 workflow 及其自动拉取的 invoker。

## 版本

**2.0.1**：

- `EVALUATION` 改为稳定标记 + 自由表达，不再要求固定文本块；
- `self`、`discuss`、`PAUSE` 均必须留下紧凑决策报告；
- “无实质取舍 / 无歧义 / 无不可逆”可以作为明确结论，但不能省略报告；
- 收紧多候选冲突时的验收歧义门，避免单文件可逆豁免替用户选择目标；
- 保留 2.0 的歧义门、低成本豁免、不可逆门控和按需加载阻塞细则。

本轮是对 2.0 反馈的修复发布。最新测评记录在 `benchmarks/adawing-invoker/benchmark.md`：Eval 3 在修正前失败，已补规则与回归断言；按收尾约定不再重跑。

## License

MIT
