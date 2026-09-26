# adawing-plugins

AdaWing 出品的 skill 插件集，面向 AI coding agent 的治理、安全与工程实践。当前发行版本为 `2.3.0-prev`（预览版，用于日常使用验证 adawing-tdd 与 invoker 修正），支持在 Claude Code 与 Kimi Code 中以 marketplace 托管五个插件，OpenCode 通过 skills 目录直接使用。

## 插件

| 插件 | 职责 | 触发时机 |
|---|---|---|
| [`adawing-invoker`](plugins/adawing-invoker) | 动手前的**判断纪律**（歧义门 + self / discuss + 紧凑 EVALUATION） | 任务入口：判断该怎么做，是否需要先问 |
| [`adawing-workflow`](plugins/adawing-workflow) | invoker 的下游**执行路由**（micro / single / full） | invoker 判断后，按改动规模加载执行阶段 |
| [`adawing-tdd`](plugins/adawing-tdd) | workflow 的可插拔**测试纪律**（红灯复现 bug + 三层漂移对账） | 修 bug、改行为时，在 plan / build / verify 阶段追加证据 |
| [`adawing-security`](plugins/adawing-security) | Agent **安全行为规范**（三色风险分级 + 门控） | 涉及命令/删除/部署/密钥/生产环境 |
| [`adawing-guidance`](plugins/adawing-guidance) | **AGENTS.md 生成器**（项目级提示词） | 需要初始化 agent 项目配置 |

`invoker` 与 `workflow` 判据正交：invoker 看歧义，workflow 看改动规模。无歧义的大重构走 `self` + `full`，指令模糊的一行改动走 `PAUSE` + `micro`。invoker 可单独使用，workflow 是 invoker 的单向安装级下游依赖，不能脱离 invoker 独立使用；tdd 挂载于 workflow，可随时插拔且核心插件不感知它；security 与 guidance 仍可单装。

## 安装

在 Claude Code 中添加本 marketplace：

```
/plugin marketplace add Adawi1201/Adawing-agent-plugins
```

然后按需安装单个插件：

```
/plugin install adawing-invoker@adawing
/plugin install adawing-workflow@adawing  # 自动安装 adawing-invoker
/plugin install adawing-tdd@adawing       # 自动安装 adawing-workflow
/plugin install adawing-security@adawing
/plugin install adawing-guidance@adawing
```

命令行等价写法（`--scope user` 全局安装）：

```
claude plugin marketplace add Adawi1201/Adawing-agent-plugins
claude plugin install adawing-invoker@adawing --scope user
```

### Kimi Code

整包安装（推荐）：仓库根部的 `kimi.plugin.json` 把五个插件聚合为单个 `adawing` 插件，直接从 GitHub 安装：

```
/plugins install https://github.com/Adawi1201/Adawing-agent-plugins
```

按需安装单个插件：克隆仓库后加载根部的 `.kimi-plugin/marketplace.json` 自定义 marketplace（各插件的 manifest 位于各自 `.kimi-plugin/plugin.json`）：

```
/plugins marketplace /path/to/adawing-plugins/.kimi-plugin/marketplace.json
```

然后在 plugin 管理器（`/plugins`）中按需安装，或用斜杠命令直接安装单个插件：

```
/plugins install /path/to/adawing-plugins/plugins/adawing-invoker
```

单插件安装时 Kimi Code manifest 不提供安装依赖字段，因此请先安装 `adawing-invoker`，再安装 `adawing-workflow` 与 `adawing-tdd`；整包安装无此顺序问题。安装后运行 `/reload` 或 `/new` 生效。

### OpenCode

OpenCode 没有插件打包机制，直接使用 skills 目录。将各插件的 skill 目录复制或软链到全局 skills 目录：

```
mkdir -p ~/.config/opencode/skills
ln -s "$PWD/plugins/adawing-invoker/skills/adawing-invoker" ~/.config/opencode/skills/adawing-invoker
ln -s "$PWD/plugins/adawing-workflow/skills/adawing-workflow" ~/.config/opencode/skills/adawing-workflow
ln -s "$PWD/plugins/adawing-tdd/skills/adawing-tdd" ~/.config/opencode/skills/adawing-tdd
ln -s "$PWD/plugins/adawing-security/skills/adawing-security" ~/.config/opencode/skills/adawing-security
ln -s "$PWD/plugins/adawing-guidance/skills/adawing-guidance" ~/.config/opencode/skills/adawing-guidance
```

OpenCode 也读取 `~/.claude/skills/`，已通过 Claude 手动安装方式放置的 skill 无需重复安装。

## 更新

插件有更新后，拉取最新 marketplace 缓存：

```
claude plugin marketplace update adawing
```

必要时重装受影响的插件即可。卸载：`claude plugin uninstall <name>@adawing`。

## 目录结构

```
adawing-plugins/
├── .claude-plugin/marketplace.json    # Claude marketplace 清单
├── .kimi-plugin/marketplace.json      # Kimi Code marketplace 清单（单插件安装）
├── kimi.plugin.json                   # Kimi Code 整包 manifest（GitHub 一键安装）
├── plugins/                           # 五个插件
│   ├── adawing-invoker/
│   ├── adawing-workflow/
│   ├── adawing-tdd/
│   ├── adawing-security/
│   └── adawing-guidance/
└── benchmarks/                        # 评测报告归档（供参考，不随插件加载）
    ├── adawing-invoker/
    ├── adawing-workflow/
    └── adawing-security/
```

每个插件提供 `plugins/<name>/.claude-plugin/plugin.json`（Claude Code）与 `plugins/<name>/.kimi-plugin/plugin.json`（Kimi Code）两份 manifest；根部的 `kimi.plugin.json` 聚合五个 skill 供 Kimi Code 从 GitHub 整包安装；OpenCode 直接使用 skill 目录，不需要清单。workflow 的 tier 和 phase 细则位于 skill 目录下的 `references/`，只按路由加载。

## 风格约定

- 语言：中文为主，PAUSE / GREEN / RED / Spec / Plan 等术语保留英文。
- SKILL.md 顶部标题统一 `# <name> —— 一句话中文定位`，小节纯中文、不带编号。
- frontmatter 的 `description` 为单行、触发词密集。

## License

MIT
