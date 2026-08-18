# adawing-plugins

AdaWing 出品的 skill 插件集，面向 AI coding agent 的治理、安全与工程实践。当前发行版本为 `2.1.0`，支持在 Claude Code 与 Codex 中以 marketplace 托管四个插件。

## 插件

| 插件 | 职责 | 触发时机 |
|---|---|---|
| [`adawing-invoker`](plugins/adawing-invoker) | 动手前的**判断纪律**（歧义门 + self / discuss + 紧凑 EVALUATION） | 任务入口：判断该怎么做，是否需要先问 |
| [`adawing-workflow`](plugins/adawing-workflow) | invoker 的下游**执行路由**（micro / single / full） | invoker 判断后，按改动规模加载执行阶段 |
| [`adawing-security`](plugins/adawing-security) | Agent **安全行为规范**（三色风险分级 + 门控） | 涉及命令/删除/部署/密钥/生产环境 |
| [`adawing-guidance`](plugins/adawing-guidance) | **AGENTS.md 生成器**（项目级提示词） | 需要初始化 agent 项目配置 |

`invoker` 与 `workflow` 判据正交：invoker 看歧义，workflow 看改动规模。无歧义的大重构走 `self` + `full`，指令模糊的一行改动走 `PAUSE` + `micro`。invoker 可单独使用，workflow 是 invoker 的单向安装级下游依赖，不能脱离 invoker 独立使用；security 与 guidance 仍可单装。

## 安装

在 Claude Code 中添加本 marketplace：

```
/plugin marketplace add Adawi1201/Adawing-agent-plugins
```

然后按需安装单个插件：

```
/plugin install adawing-invoker@adawing
/plugin install adawing-workflow@adawing  # 自动安装 adawing-invoker
/plugin install adawing-security@adawing
/plugin install adawing-guidance@adawing
```

命令行等价写法（`--scope user` 全局安装）：

```
claude plugin marketplace add Adawi1201/Adawing-agent-plugins
claude plugin install adawing-invoker@adawing --scope user
```

### Codex

Codex 接入使用仓库内的官方 marketplace 与 `.codex-plugin/plugin.json` manifest：

```
codex plugin marketplace add .agents/plugins
codex plugin add adawing-invoker@adawing
codex plugin add adawing-workflow@adawing  # 先安装 invoker，再安装 workflow
codex plugin add adawing-security@adawing
codex plugin add adawing-guidance@adawing
```

`adawing-workflow` 仍是 `adawing-invoker` 的单向下游补充。Codex marketplace 不替代这条运行约束：workflow 只有在 invoker 已留下判断结果时才进入执行路由。

## 更新

插件有更新后，拉取最新 marketplace 缓存：

```
claude plugin marketplace update adawing
```

必要时重装受影响的插件即可。卸载：`claude plugin uninstall <name>@adawing`。

Codex 更新时重新读取本地 marketplace 后重装受影响插件：

```
codex plugin add adawing-invoker@adawing
codex plugin add adawing-workflow@adawing
```

## 目录结构

```
adawing-plugins/
├── .claude-plugin/marketplace.json    # Claude marketplace 清单
├── .agents/plugins/marketplace.json   # Codex marketplace 清单
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

每个插件同时提供 `plugins/<name>/.claude-plugin/plugin.json`（Claude）和 `plugins/<name>/.codex-plugin/plugin.json`（Codex），skill 目录下的 `agents/openai.yaml` 提供 Codex UI metadata。workflow 的 tier 和 phase 细则位于 skill 目录下的 `references/`，只按路由加载。

## 风格约定

- 语言：中文为主，PAUSE / GREEN / RED / Spec / Plan 等术语保留英文。
- SKILL.md 顶部标题统一 `# <name> —— 一句话中文定位`，小节纯中文、不带编号。
- frontmatter 的 `description` 为单行、触发词密集。

## License

MIT
