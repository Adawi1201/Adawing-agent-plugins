# staged

三个规模判断命中两项以上，或需求包含多个子功能时读取本文件。

## 阶段

```text
plan -> (preview 按需) -> 闸门 -> build -> review -> verify
```

不另写需求 spec。`[SCOPE]`、用户要求和检索证据共同构成 plan 的输入，本阶段不重新发起方案讨论。

1. 读 [../phases/plan.md](../phases/plan.md)，写计划文件
2. preview 为 `inline` 或 `page` 时读 [../phases/preview.md](../phases/preview.md)；为 `none` 时不读
3. 输出一次 `[CONFIRM]` 闸门并等待确认
4. 确认后依次读并执行 [build](../phases/build.md)、[review](../phases/review.md)、[verify](../phases/verify.md)

## 闸门

修改生产代码前说明精确文件范围、行为前后差异和通过条件，并给出计划文件路径。preview 不是第二个闸门；已生成 preview 时，把路径和摘要并入同一次 `[CONFIRM]`。

## 产出

- plan：`docs/adawing/plans/YYYY-MM-DD-<topic>.md`
- page preview：`docs/adawing/previews/YYYY-MM-DD-<topic>/index.html`
- verify：`docs/adawing/verify/YYYY-MM-DD-<topic>.md`
- review 在对话中报告；用户要求时再单独落盘

过程文档默认不提交 git，除非用户要求。

## 执行边界

staged 允许多个可独立验证的任务，但每次只推进一个。遇到关键计划缺口、接口冲突或重复失败时，停止当前任务，回到 plan 或入口；不靠扩大实现去猜测填空。
