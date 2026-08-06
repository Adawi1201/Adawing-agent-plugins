# adawing-workflow

代码任务的**执行工作流** skill。承接 `adawing-invoker` 的决策结果，将需求拆解为可验证的阶段，强制产出过程文档，确保每一步都有用户确认或自动化验证。

## 定位

| Skill | 职责 | 核心机制 |
|---|---|---|
| `adawing-invoker` | 做不做、怎么做 | PAUSE / FALLBACK / ASK |
| **`adawing-workflow`** | **按什么步骤做** | Spec → Plan → Preview → Build → Simplify → Verify → Finish |

本 skill 不重复 `adawing-invoker` 的决策逻辑；执行阶段发现需求仍不清楚时，回退到 `adawing-invoker`。

## 触发条件

当用户已明确进入代码实现阶段，需要按完整工作流产出过程文档并执行增量验证时触发。典型场景：新功能 / 需求变更 / 性能优化、Bug 修复、代码审查反馈处理、安全漏洞修复。

## 核心机制

七阶段闸门流水线，不因任务简单而跳过：

| 阶段 | 核心动作 | 强制产出 |
|---|---|---|
| **Spec** | 需求分析，明确边界与风险 | `docs/superpowers/specs/…` |
| **Plan** | 拆解任务，定义验证与回滚 | `docs/superpowers/plans/…` |
| **Preview** | UI/行为变更产出 HTML 预览并确认 | `docs/superpowers/previews/…` |
| **Build** | 按 Plan 顺序编码，每改文件立即增量验证 | 代码变更 |
| **Simplify** | 删除冗余、合并重复、降低嵌套 | 简化审查结论 |
| **Verify** | 运行 Lint/Test/Build，产出验证报告 | `docs/superpowers/verify/…`（草稿态） |
| **Finish** | 分支收尾、提交、PR | Git 提交 / 分支处理 |

关键约束：Preview 是闸门（确认后才能 Build）；Verify 是两态（构建通过只到草稿态，用户手动测试通过才到完成态）。

## 目录结构

```
adawing-workflow/
├── .claude-plugin/plugin.json
├── README.md                 # 本文件
└── skills/adawing-workflow/
    ├── SKILL.md              # skill 主文档
    └── evals/evals.json      # 测试用例
```

## 安装

本插件通过 `adawing` marketplace 分发：

```
/plugin marketplace add Adawi1201/Adawing-agent-plugins
/plugin install adawing-workflow@adawing
```

建议同时安装 `adawing-invoker`（决策层）和相关 `superpowers` skills。

## 评测结果

报告见 `benchmarks/adawing-workflow/`。

| Eval | 场景 | with skill | without skill |
|---|---|---|---|
| 1 | UI 新增列完整工作流 | ✅ 完整 7 阶段 | ❌ 无 Preview 确认闸门 |
| 2 | 后端查询条件改动 | ✅ Spec/Plan/Verify | ❌ 直接改代码 |
| 3 | Debug 登录按钮无反应 | ✅ Systematic debugging | ❌ 直接改代码 |
| 4 | Fix 头像缓存未失效 | ✅ TDD + Verify 草稿态 | ❌ 未先写失败测试 |
| 5 | 用户要求跳过 spec/plan | ✅ 拒绝跳过，坚持流程 | ❌ 直接改代码 |

## License

MIT
