# adawing-plugins

AdaWing 出品的 Claude Code skill 插件集，面向 AI coding agent 的治理、安全与工程实践。一个 marketplace 托管四个可独立安装的插件。

## 插件

| 插件 | 职责 | 触发时机 |
|---|---|---|
| [`adawing-invoker`](plugins/adawing-invoker) | 代码任务**决策门控**（PAUSE / FALLBACK / ASK） | 任务入口：判断做不做、用什么最小方案做 |
| [`adawing-workflow`](plugins/adawing-workflow) | 代码任务**执行工作流**（Spec→…→Finish 七阶段） | 决策已明确、正式动手写代码 |
| [`adawing-security`](plugins/adawing-security) | Agent **安全行为规范**（三色风险分级 + 门控） | 涉及命令/删除/部署/密钥/生产环境 |
| [`adawing-guidance`](plugins/adawing-guidance) | **AGENTS.md 生成器**（项目级提示词） | 需要初始化 agent 项目配置 |

`invoker` 与 `workflow` 刻意拆开，便于只在合适时机分别启用：入口阶段用 invoker 做决策，进入实现阶段再用 workflow 推进。`security` 与 `guidance` 各自独立，按需安装。

## 安装

在 Claude Code 中添加本 marketplace：

```
/plugin marketplace add <marketplace-repo>
```

然后按需安装单个插件：

```
/plugin install adawing-invoker@adawing
/plugin install adawing-workflow@adawing
/plugin install adawing-security@adawing
/plugin install adawing-guidance@adawing
```

## 目录结构

```
adawing-plugins/
├── .claude-plugin/marketplace.json    # marketplace 清单
├── plugins/                           # 四个独立插件
│   ├── adawing-invoker/
│   ├── adawing-workflow/
│   ├── adawing-security/
│   └── adawing-guidance/
└── benchmarks/                        # 评测报告归档（供参考，不随插件加载）
    ├── adawing-invoker/
    ├── adawing-workflow/
    └── adawing-security/
```

每个插件形如 `plugins/<name>/{.claude-plugin/plugin.json, skills/<name>/SKILL.md}`。

## 风格约定

- 语言：中文为主，PAUSE / GREEN / RED / Spec / Plan 等术语保留英文。
- SKILL.md 顶部标题统一 `# <name> —— 一句话中文定位`，小节纯中文、不带编号。
- frontmatter 的 `description` 为单行、触发词密集。

## License

MIT
