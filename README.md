# adawing-plugins

AdaWing 出品的 skill 插件集，面向 AI coding agent 的治理、安全与工程实践。现已支持在 Claude Code 中以一个 marketplace 托管四个可独立安装的插件。

## 插件

| 插件 | 职责 | 触发时机 |
|---|---|---|
| [`adawing-invoker`](plugins/adawing-invoker) | 动手前的**判断纪律**（歧义门 + self / discuss） | 任务入口：判断该怎么做，是否需要先问 |
| [`adawing-workflow`](plugins/adawing-workflow) | 按规模分档的**执行流程**（micro / single / full） | 正式动手写代码，按改动规模决定跑哪些阶段 |
| [`adawing-security`](plugins/adawing-security) | Agent **安全行为规范**（三色风险分级 + 门控） | 涉及命令/删除/部署/密钥/生产环境 |
| [`adawing-guidance`](plugins/adawing-guidance) | **AGENTS.md 生成器**（项目级提示词） | 需要初始化 agent 项目配置 |

`invoker` 与 `workflow` 判据正交：invoker 看歧义，workflow 看改动规模。无歧义的大重构走 `self` + `full`，指令模糊的一行改动走 `PAUSE` + `micro`。四个插件都可单装，互相是软依赖：缺了对方只是覆盖面变窄，不失效。

## 安装

在 Claude Code 中添加本 marketplace：

```
/plugin marketplace add Adawi1201/Adawing-agent-plugins
```

然后按需安装单个插件：

```
/plugin install adawing-invoker@adawing
/plugin install adawing-workflow@adawing
/plugin install adawing-security@adawing
/plugin install adawing-guidance@adawing
```

命令行等价写法（`--scope user` 全局安装）：

```
claude plugin marketplace add Adawi1201/Adawing-agent-plugins
claude plugin install adawing-invoker@adawing --scope user
```

## 更新

插件有更新后，拉取最新 marketplace 缓存：

```
claude plugin marketplace update adawing
```

必要时重装受影响的插件即可。卸载：`claude plugin uninstall <name>@adawing`。

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
