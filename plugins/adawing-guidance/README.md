# adawing-guidance

**AGENTS.md 初始化生成器** skill。扫描项目结构、技术栈与命令，产出一份缓存友好、稳定度排序、无冗余的项目级 AGENTS.md（agent 项目提示词 / 固定前缀）。

## 定位

面向需要为编码 agent（Claude Code / Codex / Cursor 等）建立项目级提示词的场景。核心原则：**只写模型从代码里推断不出来、又不会频繁变化、且几乎每个任务都用得上的信息。**

## 触发条件

当用户要求"生成 AGENTS.md"、"初始化 agent 配置"、"写项目级提示词"，为编码 agent 创建项目说明文件，或提到 agents.md、项目级 prompt、固定前缀时。

## 核心机制

四步流程：

1. **调研项目**（只读）：从依赖清单、构建脚本、CI 配置、目录结构、既有约定收集信息，每项都要有证据来源，禁止编造。
2. **组织内容**：按稳定度从高到低排七层（稳定度 = 缓存命中友好度）。
3. **套用模板生成**：以 `assets/AGENTS.template.md` 为骨架替换占位符，控制在 100～300 行。
4. **自检与交付**：逐条验收（每条内容都要通过"没有它模型会不会犯错"的测试），已存在则走增量更新。

## 目录结构

```
adawing-guidance/
├── .claude-plugin/plugin.json
├── README.md                         # 本文件
└── skills/adawing-guidance/
    ├── SKILL.md                      # skill 主文档
    ├── assets/AGENTS.template.md     # AGENTS.md 骨架模板
    └── references/content-guide.md   # 内容取舍标准与负面清单
```

## 安装

本插件通过 `adawing` marketplace 分发：

```
/plugin marketplace add <marketplace-repo>
/plugin install adawing-guidance@adawing
```

或手动将 `skills/adawing-guidance/` 复制到 `~/.claude/skills/adawing-guidance/`。

## License

MIT
