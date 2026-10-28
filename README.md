# adawing-plugins

AdaWing 出品的 skill 插件集，面向 AI coding agent 的治理、安全与工程实践。当前发行版本为 `3.0.0-prev`（预览版，用于日常使用验证 adawing-overstep），支持在 Claude Code 与 Kimi Code 中以 marketplace 托管四个插件，OpenCode 通过 skills 目录直接使用。

## 插件

| 插件 | 职责 | 触发时机 |
|---|---|---|
| [`adawing-overstep`](plugins/adawing-overstep) | **越界约束与执行路由**（SCOPE / CLARIFY / CONFIRM / REPORT + direct / planned / staged + 编码纪律） | 写代码、改文件、执行会改变状态的命令 |
| [`adawing-tdd`](plugins/adawing-tdd) | overstep 的可插拔**测试纪律**（红灯复现 bug + 行为偏差与回归检查） | 修 bug、改行为时，在 plan / build / verify 阶段追加证据 |
| [`adawing-security`](plugins/adawing-security) | Agent **安全行为规范**（三色风险分级 + 门控） | 涉及命令/删除/部署/密钥/生产环境 |
| [`adawing-guidance`](plugins/adawing-guidance) | 项目级 **AGENTS.md 维护**（初始化 + 审计 + 沉淀） | 初始化 agent 项目配置、检查 AGENTS.md、把项目特有的纠正记下来 |

overstep 由原 `adawing-invoker` 与 `adawing-workflow` 合并而来：入口只触发一次，歧义判断与规模定档在同一份 `[SCOPE]` 中完成，编码纪律只在编码任务中加载。tdd 挂载于 overstep，可随时插拔且 overstep 不感知它；overstep、security 与 guidance 都可单装。

## 安装

在 Claude Code 中添加本 marketplace：

```
/plugin marketplace add Adawi1201/Adawing-agent-plugins
```

然后按需安装单个插件：

```
/plugin install adawing-overstep@adawing
/plugin install adawing-tdd@adawing       # 自动安装 adawing-overstep
/plugin install adawing-security@adawing
/plugin install adawing-guidance@adawing
```

命令行等价写法（`--scope user` 全局安装）：

```
claude plugin marketplace add Adawi1201/Adawing-agent-plugins
claude plugin install adawing-overstep@adawing --scope user
```

### Kimi Code

整包安装（推荐）：仓库根部的 `kimi.plugin.json` 把四个插件聚合为单个 `adawing` 插件，直接从 GitHub 安装：

```
/plugins install https://github.com/Adawi1201/Adawing-agent-plugins
```

按需安装单个插件：克隆仓库后加载根部的 `.kimi-plugin/marketplace.json` 自定义 marketplace（各插件的 manifest 位于各自 `.kimi-plugin/plugin.json`）：

```
/plugins marketplace /path/to/adawing-plugins/.kimi-plugin/marketplace.json
```

然后在 plugin 管理器（`/plugins`）中按需安装，或用斜杠命令直接安装单个插件：

```
/plugins install /path/to/adawing-plugins/plugins/adawing-overstep
```

单插件安装时 Kimi Code manifest 不提供安装依赖字段，因此请先安装 `adawing-overstep`，再安装 `adawing-tdd`；整包安装无此顺序问题。安装后运行 `/reload` 或 `/new` 生效。

### OpenCode

OpenCode 没有插件打包机制，直接使用 skills 目录。将各插件的 skill 目录复制或软链到全局 skills 目录：

```
mkdir -p ~/.config/opencode/skills
ln -s "$PWD/plugins/adawing-overstep/skills/adawing-overstep" ~/.config/opencode/skills/adawing-overstep
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

从 2.x 升级到 3.0.0-prev：先卸载 `adawing-invoker` 与 `adawing-workflow`（或删除对应的手动安装目录与软链），再安装 `adawing-overstep`，避免两套 skill 同时触发。

## 目录结构

```
adawing-plugins/
├── .claude-plugin/marketplace.json    # Claude marketplace 清单
├── .kimi-plugin/marketplace.json      # Kimi Code marketplace 清单（单插件安装）
├── kimi.plugin.json                   # Kimi Code 整包 manifest（GitHub 一键安装）
├── plugins/                           # 四个插件
│   ├── adawing-overstep/
│   ├── adawing-tdd/
│   ├── adawing-security/
│   └── adawing-guidance/
└── benchmarks/                        # 评测报告归档（供参考，不随插件加载）
    └── adawing-security/
```

每个插件提供 `plugins/<name>/.claude-plugin/plugin.json`（Claude Code）与 `plugins/<name>/.kimi-plugin/plugin.json`（Kimi Code）两份 manifest；根部的 `kimi.plugin.json` 聚合四个 skill 供 Kimi Code 从 GitHub 整包安装；OpenCode 直接使用 skill 目录，不需要清单。overstep 的编码纪律、tier 和 phase 细则位于 skill 目录下的 `references/`，只按任务类型与路由加载。

## 风格约定

- 语言：中文为主，SCOPE / CLARIFY / CONFIRM / GREEN / RED 等标记与术语保留英文。
- SKILL.md 顶部标题统一 `# <name> —— 一句话中文定位`，小节纯中文、不带编号。
- frontmatter 的 `description` 为单行、触发词密集。

## License

MIT
