# adawing-workflow

`adawing-invoker` 的下游执行补充。它不负责重新理解需求，而是在 invoker 已留下 `[EVALUATION]` 后，按改动规模路由执行阶段。

## 依赖关系

这是单向安装级依赖：

- `adawing-invoker` 可独立使用；
- 安装 `adawing-workflow` 会自动安装并启用 `adawing-invoker`；
- workflow 没有 invoker 的任务入口判断时，不进入执行；
- workflow 不依赖其他外部工作流 skill。

## 单一入口

宿主只触发 `adawing-workflow`。入口先检查 invoker 的判断结果，检索调用方，再由三个规模布尔量决定 `micro / single / full`。三个 tier 不是独立 skill。

| Tier | 判据 | 阶段 |
|---|---|---|
| `micro` | 未跨模块、未改公共接口、未改数据形状 | preview 按需 -> build -> verify |
| `single` | 命中一个规模布尔量 | plan -> preview 按需 -> gate -> build -> review -> verify |
| `full` | 命中两个以上，或包含多个子功能 | plan -> preview 按需 -> gate -> build -> review -> verify |

定档前必须查调用方，并在 tier 行引用证据。实际影响面扩大时立即升档。

## 按需加载

```
skills/adawing-workflow/
├── SKILL.md                         # 入口、tier 判定、加载路由
├── references/
│   ├── tiers/
│   │   ├── micro.md
│   │   ├── single.md
│   │   └── full.md
│   └── phases/
│       ├── plan.md
│       ├── build.md
│       ├── preview.md
│       ├── review.md
│       └── verify.md
└── evals/evals.json
```

入口只读取命中的 tier；phase reference 由 tier 按阶段加载。workflow 不再重复需求 spec，invoker 的语义判断是 plan 输入。

## 阶段契约

- `plan`：把决定转成精确文件、接口、任务、验收、验证、回滚和 Non-Goals；single 行内完成，full 才落盘。
- `build`：逐任务读取调用方、最小编辑、增量验证，计划外触达和重复失败立即停下或升档。
- `preview`：按验收需要选择 `none / compact / artifact`，不复制完整应用，不自动新增审批。
- `review`：审查 diff 范围、行为一致性、重复逻辑、不必要抽象和风险；修正后回到增量验证。
- `verify`：只报告本轮实际证据，分开自动、运行时和手动验证状态。

过程产物统一放 `docs/adawing/`，默认不提交 git。

## 安装

```text
/plugin marketplace add Adawi1201/Adawing-agent-plugins
/plugin install adawing-workflow@adawing
```

安装 workflow 时由 manifest 自动解析 `adawing-invoker@adawing` 依赖。

## 版本

**2.0.1**：

- 在 2.0 执行路由基础上按需加载 tier 与 plan / build / preview / review / verify phase reference；
- 移除 workflow 对外部流程 skill 的显式依赖，不重复创建需求 spec；
- preview 按验收条件路由为 `none / compact / artifact`；
- workflow 通过 manifest 正式依赖 invoker，保持单向安装关系。

本轮是对 2.0 反馈的修复发布。最新测评记录在 `benchmarks/adawing-workflow/benchmark.md`；不再交替重跑评测。

## License

MIT
