# full 档阶段细则

仅在 `[TIER: full]` 时适用。`micro` 与 `single` 档不需要本文件 —— 它们的全部要求都在 SKILL.md 内。

## spec

需求边界、Non-Goals、风险假设、数据表影响。产出 `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`。

可用 `superpowers:brainstorming` 展开需求，未装则自行写。装了 `adawing-invoker` 时，它已选定的路径是 spec 的输入 —— spec 不重开方案之争；brainstorming 的 "always propose 2-3 approaches" 在唯一路径成立时可缩减为一条，但要给出可核验阻塞（照 invoker 对"可核验"的定义，不在此复述）。

> 边界无人负责时，需求最容易跑偏的其实是 `single` 档 —— 它的替代做法见 SKILL.md「各档阶段」，本文件不重复。

## plan

产出 `docs/superpowers/plans/YYYY-MM-DD-<feature>.md`，每个任务列出目标文件、验证方式、回滚步骤。可用 `superpowers:writing-plans`。

## prev（full 档强制）

`prev` 只是**可视化结果预览**：界面长什么样、流程怎么走。需求论证归 spec，方案取舍归 `adawing-invoker`，都不放在这里。

产出 `docs/superpowers/previews/YYYY-MM-DD-<topic>/index.html`。UI 与逻辑改动同时存在时，同一页分区呈现，不拆多个文件。

`full` 档的区别只在**强制** —— 产出形式与路径同其余两档，见 SKILL.md。

## verify

产出 `docs/superpowers/verify/YYYY-MM-DD-<topic>.md`，记录 lint / test / build 结果。可用 `superpowers:verification-before-completion`。

**报告文件只有 `full` 档出。** 两态规则（构建通过 ≠ 完成）是全局的，不随档位变化 —— 见 SKILL.md「全局规则」。

## 过程文档路径

统一放 `docs/superpowers/`，与 superpowers 各 skill 的默认落点一致。不提交 git，除非用户要求。
