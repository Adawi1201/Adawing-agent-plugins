# adawing-security

Agent **安全行为规范** skill。AI agent 在真实系统上执行命令、改文件、操作数据库、访问网络、处理密钥时的行为护栏。核心思路：**行动前先分级，提交前先门控**——不可逆的错误永远不该静默发生。

## 定位

面向 AI coding agent（Claude Code、Codex、OpenClaw 等）的横切安全层。与决策/执行类 skill 互补：`adawing-invoker` 决定做不做，`adawing-workflow` 决定怎么做，本 skill 确保任何一步都不会造成静默的不可逆损害。

## 触发条件

每当任务涉及执行命令、删除/覆盖文件、部署、安装依赖、提交代码、访问外部服务、读取 `.env` / 密钥文件，或用户提到生产环境、上线、危险操作、安全检查、权限、备份时——即使用户没有明确要求"注意安全"。

## 核心机制

- **三色风险分级**：GREEN（可逆且本地，直接执行）/ YELLOW（可逆但有外部影响，先给方案）/ RED（不可逆、涉生产、涉密钥、涉绕过、涉未知，停下确认）。不确定自动升级到更高层。
- **门控协议**：RED 动作按 STOP → STATE → SCOPE → ALTERNATIVE → WAIT 五步处理。
- **常驻安全职责**：修改前备份、密钥卫生、隐私隔离、网络与环境隔离、提示注入边界。
- **危险指令识别**：模式库速查表 + 逐条处理说明。

## 目录结构

```
adawing-security/
├── .claude-plugin/plugin.json
├── README.md                             # 本文件
└── skills/adawing-security/
    ├── SKILL.md                          # skill 主文档
    ├── evals/evals.json                  # 4 条测试用例
    ├── references/
    │   ├── dangerous-patterns.md         # 危险指令模式库
    │   ├── production-playbook.md        # 生产环境行动准则
    │   └── network-isolation.md          # 网络安全与环境隔离
    └── scripts/scan_secrets.py           # 密钥泄漏扫描器
```

## 安装

本插件通过 `adawing` marketplace 分发：

```
/plugin marketplace add <marketplace-repo>
/plugin install adawing-security@adawing
```

或手动将 `skills/adawing-security/` 复制到 `~/.claude/skills/adawing-security/`。

## 评测结果

基于 4 条 eval（dangerous-cleanup / production-deploy / secret-in-repo / curl-pipe-install），完整报告与工作区见 `benchmarks/adawing-security/`：

| 指标 | 使用 skill | 不使用 skill |
|---|---|---|
| 通过率 | **100%** | 12.5% |

> 方法论限制：两组由同一模型 inline 扮演（无子代理），with_skill 存在先验优势，通过率差异应视为上限参考；timing/token 为占位值。详见 workspace README。

## License

MIT
