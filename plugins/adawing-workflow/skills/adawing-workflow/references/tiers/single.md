# single 路由

仅在三个规模布尔量命中一项时读取本文件。

## 阶段

```text
plan -> (preview 按需) -> gate -> build -> review -> verify
```

1. 读 [../phases/plan.md](../phases/plan.md)，生成行内计划。
2. 主入口判定 preview 为 `compact` 或 `artifact` 时读 [../phases/preview.md](../phases/preview.md)；为 `none` 时不读。
3. 给出一次闸门陈述并等待确认。
4. 确认后依次读并执行 [build](../phases/build.md)、[review](../phases/review.md)、[verify](../phases/verify.md)。

## 闸门

修改生产代码前，紧凑说明：

- 要改的精确文件
- 行为的前后差异
- 判定通过的条件

三项齐全即可，格式自由，不附加重复的方案讨论。invoker 的默认动作表示推进到这里，不等于用户已经批准修改；收到确认前不动生产代码。

## 产出

- plan 行内呈现，不创建 plan 文件
- preview 由主入口决定 `none / compact / artifact`
- review 与 verify 使用紧凑状态报告，不创建报告文件

## 升档

新发现第二个规模布尔量，或需求实际包含多个子功能时，升到 `full` 并读取 `full.md`。已经做过的 plan 不重写，只补充 full 缺失的深度。
