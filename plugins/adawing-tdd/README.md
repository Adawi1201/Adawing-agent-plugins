# adawing-tdd

挂载于 `adawing-overstep` 的测试纪律插件。让模型意识到测试是它手里最客观的验证工具：用红灯复现 bug，用断言和既有测试检测行为偏差与回归。

## 解决什么

| 问题 | 做法 |
|---|---|
| bug 根因靠“看起来是这里” | 修复前写一条因断言失败的测试，红灯即复现证据 |
| 行为偏差：实现偏离验收条件 | 闸门的通过条件转成断言，build 先红后绿 |
| 回归：顺手改坏旁边的行为 | verify 本轮重跑受影响模块的既有测试 |

改动文件超出声明范围的检查由 `adawing-overstep` 的 `scope-check.mjs` 负责。

对强约束模型，这些大多已是习惯；对发散倾向更强的模型，它把“自报完成”换成“可核验的证据”。

## 依赖关系

- 必须与 `adawing-overstep` 同装；只增加测试证据要求，不改变它的 `[SCOPE]`、tier 与闸门
- overstep 不感知本插件：卸载后行为与未安装时完全一致

## 适用范围

- bug 修复：必须先取得红灯再修复；写不成测试时改用可重复的复现命令
- planned / staged 的行为改动：默认先红后绿，跳过时写一行理由
- direct 的非 bug 改动与纯文档 / 配置 / 样式：不要求测试

无需任何配置。红灯必须在未改动的生产代码上观察到，先写实现再改坏代码得到的失败不算红灯。

## 结构

```
skills/adawing-tdd/
├── SKILL.md         # 各阶段纪律、证据格式、硬规则
└── evals/evals.json
```

测试一律用项目自己的命令运行，本插件不包装测试运行器。

## 安装

```text
/plugin install adawing-tdd@adawing
```

Kimi Code 无安装依赖字段，请依次安装 `adawing-overstep`、`adawing-tdd`。OpenCode 将 `skills/adawing-tdd/` 软链到 `~/.config/opencode/skills/adawing-tdd/`。

## 版本

**2.0.0-prev**（预览，随 overstep 3.0.0-prev 发布）：依赖由 `adawing-workflow` 改为 `adawing-overstep`；tier 名称随之改为 direct / planned / staged；范围对账移交 overstep 的 `scope-check.mjs`，删除 `drift-check.mjs`；“漂移”改称“偏差”。

**1.1.0**：取消可配置的测试要求分级，按任务类型固定适用范围；明确红灯必须先于实现，禁止先实现再改坏代码补红灯。

**1.0.0**：首个版本。

## License

MIT
