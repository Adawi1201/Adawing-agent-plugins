# full 路由

在三个规模布尔量命中两项以上，或需求包含多个子功能时读取本文件。

## 阶段

```text
plan -> (preview 按需) -> gate -> build -> review -> verify
```

workflow 不生成 spec。invoker 的 `[EVALUATION]`、用户要求和检索证据共同构成 plan 的语义输入，不在本阶段重新发起方案讨论。

1. 读 [../phases/plan.md](../phases/plan.md)，生成 full 深度的计划文件。
2. 主入口判定 preview 为 `compact` 或 `artifact` 时读 [../phases/preview.md](../phases/preview.md)；为 `none` 时不读。
3. 给出一次闸门陈述并等待确认。
4. 确认后依次读并执行 [build](../phases/build.md)、[review](../phases/review.md)、[verify](../phases/verify.md)。

## 闸门

修改生产代码前说明精确文件范围、行为前后差异和通过条件。preview 不是第二个闸门；若已生成 preview，将路径与摘要并入同一次陈述。

## 产出

- plan：`docs/adawing/plans/YYYY-MM-DD-<topic>.md`
- artifact preview：`docs/adawing/previews/YYYY-MM-DD-<topic>/index.html`
- verify：`docs/adawing/verify/YYYY-MM-DD-<topic>.md`
- review 默认行内报告；只有用户要求时单独落盘

过程文件默认不提交 git，除非用户明确要求。

## 执行边界

full 允许多个可独立验证的任务，但每次只推进一个任务。关键计划缺口、接口冲突或重复失败时停止当前任务，回到 invoker / plan；不得靠扩大实现猜测来填空。
