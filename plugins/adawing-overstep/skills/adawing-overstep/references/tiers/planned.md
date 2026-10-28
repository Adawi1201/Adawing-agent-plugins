# planned

三个规模判断命中一项时读取本文件。

## 阶段

```text
plan -> (preview 按需) -> 闸门 -> build -> review -> verify
```

1. 读 [../phases/plan.md](../phases/plan.md)，在对话中给出计划
2. preview 为 `inline` 或 `page` 时读 [../phases/preview.md](../phases/preview.md)；为 `none` 时不读
3. 输出一次 `[CONFIRM]` 闸门并等待确认
4. 确认后依次读并执行 [build](../phases/build.md)、[review](../phases/review.md)、[verify](../phases/verify.md)

## 闸门

修改生产代码前，紧凑说明：

- 要改的精确文件
- 行为的前后差异
- 判定通过的条件

三项齐全即可，格式自由，不重复方案讨论。`[SCOPE]` 写“下一步：写 plan”表示推进到这里，不等于用户已批准修改；收到确认前不动生产代码。

## 产出

- plan 在对话中呈现，不创建文件
- preview 由入口决定 `none / inline / page`
- review 与 verify 使用紧凑报告，不创建文件

## 升档

新发现第二个规模判断命中，或需求实际包含多个子功能时，输出 `[RESCOPE]`，升到 `staged` 并读取 [staged.md](staged.md)。已做的 plan 不重写，只补充 staged 缺失的部分。
