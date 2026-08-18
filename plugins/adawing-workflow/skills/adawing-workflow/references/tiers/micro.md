# micro 路由

仅在三个规模布尔量全部为否时读取本文件。`micro` 代表影响边界窄，不代表可以跳过 invoker 或验证。

## 阶段

```text
(preview 按需) -> build -> verify
```

1. 主入口判定 preview 为 `compact` 或 `artifact` 时，先读 [../phases/preview.md](../phases/preview.md)；为 `none` 时不读。
2. 读 [../phases/build.md](../phases/build.md) 并执行最小修改。
3. 读 [../phases/verify.md](../phases/verify.md)，报告实际检查结果。

## 闸门

改动全部落在 git 跟踪文件中、可由 diff 撤销且不触及不可逆时，不设置额外闸门，直接执行。

删除文件、覆盖非跟踪文件、写数据库、运行迁移或其他不可仅靠 diff 撤销的动作，即使规模仍是 `micro`，也必须回到 invoker / security 的门控；不得用 `micro` 绕过确认。

## 产出

- 不创建 plan 或 review 文件
- preview 为 `compact` 时只做行内呈现
- verify 使用紧凑状态报告，不创建报告文件

## 升档

发现跨模块、公共接口或数据形状影响后立即升到对应 tier。修改了第二个计划外范围，或同一方案连续失败两次，停止执行并重新判断。
