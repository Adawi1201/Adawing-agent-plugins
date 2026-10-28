# direct

三个规模判断全部为否时读取本文件。`direct` 表示影响面窄，不表示可以跳过 `[SCOPE]`、编码纪律或验证。

## 阶段

```text
(preview 按需) -> build -> verify
```

1. preview 为 `inline` 或 `page` 时，先读 [../phases/preview.md](../phases/preview.md)；为 `none` 时不读
2. 读 [../phases/build.md](../phases/build.md)，按 `[SCOPE]` 的文件清单执行最小修改
3. 运行一次 scope-check（用法见 [../phases/review.md](../phases/review.md)），逐条处理输出；不做完整 review
4. 读 [../phases/verify.md](../phases/verify.md)，输出 `[REPORT]`

## 闸门

改动全部落在 git 跟踪文件中、可由 diff 撤销且不触及不可逆时，不设闸门，直接执行。

删除文件、覆盖未跟踪文件、写数据库、运行迁移或其他不能靠 diff 撤销的动作，即使规模是 `direct`，也要走 `[CONFIRM]` 或 `adawing-security` 的门控。

## 产出

- 不创建 plan 或 review 文件
- preview 为 `inline` 时只在对话中呈现
- verify 使用紧凑报告，不创建文件

## 升档

发现跨模块、公共接口或数据形状影响时，输出 `[RESCOPE]` 并升到对应 tier。
