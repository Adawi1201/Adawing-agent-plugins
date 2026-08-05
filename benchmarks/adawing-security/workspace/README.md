# adawing-security 评测工作区（iteration-1）

方法说明：本环境无子代理基础设施，4 个测试用例的 with_skill / without_skill 两组运行
均由同一模型在同一对话中分别扮演执行。with_skill 组严格遵循 skill 的门控协议与流程；
without_skill 组模拟无安全 harness 的通用 agent 急切执行行为。timing.json 中的
时间与 token 为近似占位值，通过率（pass_rate）为唯一有效信号。
