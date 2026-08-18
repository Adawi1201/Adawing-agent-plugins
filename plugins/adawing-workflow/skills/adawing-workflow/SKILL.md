---
name: adawing-workflow
description: 代码任务的执行工作流。先查调用方，再按跨模块、公共接口、数据形状路由 micro / single / full，并按需加载对应 tier 与 plan、build、preview、review、verify reference，提供随改动规模伸缩的执行阶段和验证纪律。
---

# adawing-workflow —— Invoker 下游的分档执行路由

> invoker 决定如何理解与是否暂停；workflow 只把已经做出的决定转换为适量、可验证的执行过程。

## 前置依赖

`adawing-workflow` 对 `adawing-invoker` 是**单向安装级依赖**：

- invoker 可单独安装和使用
- workflow 必须与 invoker 同时安装，不提供独立降级模式
- 当前任务没有 invoker 的 `[EVALUATION]` 时，先回到 invoker；workflow 不自行补做语义取舍或歧义判断

invoker 的“立即执行默认动作”表示继续进入 workflow 路由，不代表跳过 workflow 自己的闸门。

## 路由职责

入口只做四件事：

1. 确认当前任务已有 invoker 的判断结果
2. 检索目标定义与调用方，计算三个规模布尔量
3. 输出 tier 和阶段顺序
4. 只读取命中的 tier reference，再按该 tier 的要求读取 phase reference

`micro`、`single`、`full` 不是独立 skill，不允许跳过入口直接触发。

## Tier 判定

三个布尔量：

- 是否跨模块边界
- 是否改公共接口
- 是否改数据形状

| 结果 | Tier | 路由 |
|---|---|---|
| 全否 | `micro` | [references/tiers/micro.md](references/tiers/micro.md) |
| 命中一项 | `single` | [references/tiers/single.md](references/tiers/single.md) |
| 命中两项以上，或需求包含多个子功能 | `full` | [references/tiers/full.md](references/tiers/full.md) |

定档前必须先查一次调用方。优先使用项目已有索引；没有索引时使用文本或符号检索。tier 理由引用检索结果和规模，不引用需求歧义。

输出保持两行：

```text
[TIER: single] <规模理由与调用方证据>
阶段：plan -> (preview 按需) -> build -> review -> verify
```

## Preview 路由

preview 是否进入由验收方式决定，与 tier 大小正交。

满足任一条件时不得直接跳过：

- 改变用户可见布局、交互或状态转移
- 验收依赖视觉、流程或输出呈现，diff 与自动测试不足以表达
- 存在两个以上需要对照的用户状态

产出分为：

- `none`：内部实现、纯后端或可由 diff / 测试充分验收；不读取 preview reference
- `compact`：少量状态、输入输出或流程即可表达；读取 preview reference，但不新建文件
- `artifact`：多页面、多状态或高度依赖视觉 / 流程验收；读取 preview reference，生成一个代表性入口

单个静态文案、颜色或间距变更默认是 `none`。preview 只呈现结果，不是第二套需求分析，也不会自动增加一次审批。

## 棘轮

实现中发现实际触达超出定档依据时，就地升档并补做缺失阶段。升档后读取新的 tier reference；不得通过分批修改规避升档。

计划外文件只允许在说明原因并更新范围后修改。需要第二次追加范围，或同一方案连续失败两次时，停止 build，回到 invoker 判断与 tier 路由。

## 全局规则

- 只加载当前 tier 和当前阶段需要的 reference，不预读全部文件
- phase 规范使用本项目自己的行为契约，不声明其他工作流 skill 为前置条件
- 构建成功只证明构建成功；完成状态必须逐项援引本轮实际验证证据
- Filter、认证、部署健康检查等运行时行为必须实际运行验证，不能只靠编译
- 过程产物统一放 `docs/adawing/`，除非用户指定其他路径
- 仅当用户要求提交时处理 commit 或分支收尾

## 硬规则

1. 没有 invoker `[EVALUATION]` 时不进入 workflow 执行
2. tier 理由援引调用方和规模，不援引歧义
3. 只读取命中的 tier reference，phase reference 按阶段加载
4. `single` 与 `full` 在修改生产代码前给出闸门并等待确认
5. 没有新鲜验证证据时不声称对应检查通过或任务完成

## 附属资源

- `references/tiers/` —— 三档的阶段组合、闸门和产出深度
- `references/phases/` —— plan、build、preview、review、verify 的独立执行契约
