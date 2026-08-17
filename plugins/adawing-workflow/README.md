# adawing-workflow

按改动规模分档的**执行流程** skill。维护与开发交替进行，流程强度随之变化 —— 规模小就少跑阶段，规模大才值得完整留档。

## 定位

| Skill | 职责 | 判据 |
|---|---|---|
| `adawing-invoker` | 判断该怎么做，以及是否需要先问 | 歧义 |
| **`adawing-workflow`** | **按改动规模决定跑哪些阶段** | 规模 |

**可单装。** 建议与 `adawing-invoker` 同装 —— 歧义判定与取舍纪律归它，本 skill 不重复；未装时照常分档，只是任务入口少了歧义拦截。`full` 档的 spec/plan 阶段借用 `superpowers`，未装则自行写。

## 触发条件

进入代码实现阶段时触发。典型场景：新功能 / 需求变更 / 性能优化、bug 修复、code review 反馈处理、安全漏洞修复。

## 三档

| 档 | 阶段 | 闸门 | 过程文档 |
|---|---|---|---|
| `micro` | (prev 按需) → build | 免除 | 无 |
| `single` | plan → (prev 按需) → build → review/simplify | 三行陈述 | 行内 |
| `full` | spec → plan → prev → build → review/simplify → verify | prev 强制 | `docs/superpowers/…` |

判据是三个布尔量，不是文件计数：是否跨模块边界 / 是否改公共接口 / 是否改数据形状。全否走 `micro`，命中一条走 `single`，命中两条以上或需求含多个子功能走 `full`。

定档前必须查一次调用方并在 tier 行里引用结果 —— "要碰几个文件"恰恰是任务开始时的未知量。有 codegraph 索引时优先用，否则 Grep/Glob。干活中发现实际触达超出定档依据时就地升档，不许靠分批改动规避。

关键设计：

- **闸门是行为约束，不绑定产出物** —— 纯后端改动没有可视化预览，但一样要在动手前给出「改哪些文件 / 前后差异 / 通过条件」三行，否则第一个可干预点会落在代码已改完之后。
- **Preview 只是 UI 改动时闸门的呈现形式** —— 需求论证归 spec，方案取舍归 invoker 的 `EVALUATION`。单一 `index.html` 分区呈现。
- **两态全局生效** —— 构建通过不等于完成，未经用户手动测试确认不得声称完成。三档都守。
- **micro / single 取代 brainstorming 的 HARD-GATE** —— 不写明这一条，两档会被 superpowers 压回完整流程。
- **档位即加载边界** —— 路由不只决定跑哪些阶段，也决定读哪些文件。走 `micro` 的任务不该为 `full` 的 spec 格式付成本。
- **引用只援引边界** —— 提到其他 skill 时只说职责分界，不复述对方的内部机制。

## 目录结构

```
adawing-workflow/
├── .claude-plugin/plugin.json
├── README.md                      # 本文件
└── skills/adawing-workflow/
    ├── SKILL.md                   # 主文档：定档判据 + micro/single 全部要求 + 闸门 + 全局规则
    ├── references/full-tier.md    # full 档阶段细则，仅定档或升档到 full 时读
    └── evals/evals.json           # 测试用例
```

主文档自带 `micro` 与 `single` 的完整要求 —— 这两档不加载附属文件。`full` 是少数路径，它的 spec / prev / verify 细节才下沉。

## 安装

本插件通过 `adawing` marketplace 分发：

```
/plugin marketplace add Adawi1201/Adawing-agent-plugins
/plugin install adawing-workflow@adawing
/plugin install adawing-invoker@adawing
```

两者都是软依赖：`adawing-invoker` 缺席时本插件照常分档，`superpowers` 缺席时 `full` 档自行写 spec/plan。

## 版本

**2.0.0** —— 由七阶段无条件全跑重写为三档规模路由。

v1 的实践问题：开发时体验很好（过程留档、行为可控），但维护与开发交替进行时，维护类改动不需要完整流程，七阶段的固定成本变成负担。

v2 的对应改动：阶段随规模伸缩；`Verify` 报告仅 `full` 出，两态机制升为全局规则；`Finish` 不再是阶段，提交约定降为全局，分支收尾等用户提起；`MODE_*` 映射表删除，保留一张「任务类型 → 前置 skill」提示表；codegraph 由强制依赖改为能力中立的证据性检索（无索引时用 Grep）。过程文档路径仍为 `docs/superpowers/`，与 superpowers 各 skill 的默认落点保持一致。

v1 的 5 条 eval 断言七阶段产出，在 v2 下全部失效，已按 tier 机制重写。

**2.1.0** —— 按档位拆出 `references/full-tier.md`，主文档 179 → 157 行。

v2 已经有了规模路由，但路由只作用在行为层，没作用在加载层：走 `micro` 的任务和走 `full` 的任务读同样多的字。2.1.0 把档位同时用作加载边界 —— `micro` 与 `single` 的全部要求留在主文档，`full` 独有的 spec / plan 文件 / prev 强制 / verify 报告与过程文档路径下沉。

同时改为软依赖：`adawing-invoker` 与 `superpowers` 缺席时本插件照常分档，只是覆盖面变窄（`plugin.json` 没有依赖字段，「必装」本就只是文档约定，声明成硬依赖拦不住任何东西）。跨 skill 引用统一收敛为「只援引边界」，不复述对方内部机制。

## 评测结果

5 条 eval 在 opus5 上实测（与 `adawing-invoker` 同装），全部通过。每条 prompt 都指明目标仓库或目录。

| # | 场景 | 期望 tier | 结果 |
|---|---|---|---|
| 1 | 改标签文案 | micro | ✅ 免除闸门直接改，无 spec/plan |
| 2 | 订单查询条件改支付时间 | single | ✅ 闸门三行 + 指出 NULL 值副作用 |
| 3 | 用户列表新增注册时间列 | single | ✅ 查调用方后定档，闸门 + diff |
| 4 | 抽 calculateTotal 复用 | single + 棘轮 | ✅ 先查调用方，声明升档条件 |
| 5 | 「可以了就告诉我完成」 | 两态 | ✅ 拒绝声称完成，区分构建通过与已完成 |

Eval 4 是 tier 判据的关键用例：抽一个函数看着只碰两个文件，实际取决于调用方数量。模型先检索再定档，并写明触达超出预期时就地升档。

未覆盖：tier 声明与真实触达文件数的一致性、棘轮实际触发，两者需要 fixture 仓库与多轮执行。

## License

MIT
