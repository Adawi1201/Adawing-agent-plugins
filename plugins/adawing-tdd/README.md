# adawing-tdd

挂载于 `adawing-workflow` 的测试纪律插件。让模型意识到测试是它手里最客观的验证工具：用红灯复现 bug，用断言和 git 对账检测漂移。

## 解决什么

| 问题 | 做法 |
|---|---|
| bug 根因靠“看起来是这里” | 修复前写一条因断言失败的测试，红灯即复现证据 |
| 行为漂移：实现偏离验收条件 | gate 的通过条件转成断言，build 先红后绿 |
| 回归漂移：顺手改坏旁边的行为 | verify 本轮重跑受影响模块的既有测试 |
| 范围漂移：改动超出声明文件 | `scripts/drift-check.mjs` 用 git 对账 gate 声明的文件清单 |

对强约束模型，这些大多已是习惯；对发散倾向更强的模型，它把“自报完成”换成“可核验的证据”。

## 依赖关系

- 必须与 `adawing-invoker`、`adawing-workflow` 同装；只增加证据要求，不改变它们的路径判断、tier 与闸门
- 核心插件不感知本插件：卸载后行为与未安装时完全一致

## 强度

在项目 `AGENTS.md` / `CLAUDE.md` 中加一行即可覆盖默认值，无需额外配置文件：

```text
adawing-tdd: bugfix=required feature=suggested micro=off
```

未设置时：bug 修复 `required`，single / full 行为改动 `suggested`，micro 非 bug 改动与纯文档 / 配置 `off`。

## 结构

```
skills/adawing-tdd/
├── SKILL.md                 # 各阶段纪律、证据格式、硬规则
├── scripts/drift-check.mjs  # 范围漂移对账（只读 git，零依赖）
└── evals/evals.json
```

测试一律用项目自己的命令运行，本插件不包装测试运行器。`drift-check.mjs` 需要 Node.js 18+。

## 安装

```text
/plugin install adawing-tdd@adawing
```

Kimi Code 无安装依赖字段，请依次安装 `adawing-invoker`、`adawing-workflow`、`adawing-tdd`。OpenCode 将 `skills/adawing-tdd/` 软链到 `~/.config/opencode/skills/adawing-tdd/`。

## 版本

**1.0.0**：首个版本。

## License

MIT
