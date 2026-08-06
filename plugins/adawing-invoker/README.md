# adawing-invoker

代码任务的**决策门控** skill。把四条核心约束固化为机械规则，规则触发即执行，不依赖模型自由裁量。

## 定位

| Skill | 职责 | 核心机制 |
|---|---|---|
| **`adawing-invoker`** | **做不做、怎么做** | PAUSE / FALLBACK / ASK |
| `adawing-workflow` | 按什么步骤做 | Spec → Plan → Preview → Build → Simplify → Verify → Finish |

本 skill 只负责入口决策；决策明确后由 `adawing-workflow` 接手执行。

## 触发条件

任何涉及以下行为的用户请求都应触发：

- 编写代码、修改文件
- 执行命令（安装、卸载、删除、脚本运行、批量操作）
- 架构或技术选型
- 删除、覆盖、配置变更
- 依赖安装 / 卸载
- 其他可能产生副作用的行为

## 核心机制

| 机制 | 作用 | 输出标记 |
|---|---|---|
| PAUSE | 暂停执行，说明目标、缺失信息、零代码路径、风险与回滚 | `[PAUSE]` |
| FALLBACK | 默认选择假设最少、依赖最轻的简单方案 | `[FALLBACK]` |
| ASK | 意图不清或缺少必要信息时主动询问 | `[ASK]` |

三个机制独立触发、互不抵消。用户说 `skip adawing` 或 `fast mode` 时跳过所有机制，直接执行，末尾标注 `[adawing-bypassed]`。

## 目录结构

```
adawing-invoker/
├── .claude-plugin/plugin.json
├── README.md                 # 本文件
└── skills/adawing-invoker/
    ├── SKILL.md              # skill 主文档
    └── evals/evals.json      # 8 条测试用例
```

## 安装

本插件通过 `adawing` marketplace 分发。在 Claude Code 中添加 marketplace 后安装：

```
/plugin marketplace add Adawi1201/Adawing-agent-plugins
/plugin install adawing-invoker@adawing
```

或手动将 `skills/adawing-invoker/` 复制到 `~/.claude/skills/adawing-invoker/`。

## 评测结果

基于 8 条 eval 的完整评测（报告见 `benchmarks/adawing-invoker/`）：

| 指标 | 使用 skill | 不使用 skill | 差异 |
|---|---|---|---|
| 通过率 | **100%** | 43.8% | **+56.2%** |
| 平均 token | 643 ± 267 | 3564 ± 4153 | **-2921** |
| 平均耗时 | 71.4s ± 61.7s | 53.9s ± 40.8s | +17.5s |

## License

MIT
