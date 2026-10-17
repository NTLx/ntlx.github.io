# 材料档案：How many AI agents could run on the AI chips shipped through 2027?

抓取与核对时间：2026-10-17（Asia/Shanghai）。Primary Source 为 Epoch AI 2026-10-02 发布的报告，作者 Jason Li。已直接阅读正文、附录和官方复现仓库，并用 SemiAnalysis AgentX 与 TraceLab 的公开页面核对关键数据来源与工作负载定义。

## 原始来源

- url: https://epoch.ai/publications/estimating-the-agent-population

### 原文回答的问题

Epoch AI 试图估算：2025–2027 年间出货、采用 HBM3E 及更新高带宽内存的 AI 硬件，在完成部署后，理论上可以同时支撑多少个持续工作的 agent session。这里的“agent”指运行在 Codex、Claude Code 等 harness 中的 agentic workload；session 包含模型调用、工具调用和等待工具返回的时间，不等于模型持续吐 token。

原文把潜在并发 Agent 数量写成两部分：有效硬件供给 × 单位硬件的 Agent 承载能力。硬件供给用 GB300-equivalent inference units 表达，并以 HBM 容量与代际性能假设做换算；闭源模型的并发能力则从 agent-hour API spending、GPU 租赁价格与 API-equivalent revenue / serving-cost ratio 反推，开源模型直接使用 AgentX benchmark 的并发结果。

### 原文主要结论

- 在完整部署并把相应硬件全部分配给这类工作负载的条件下，计入 2027 年出货的硬件，报告给出的 frontier-model agent 并发范围约为 30–170 million。中央 HBM4 uplift 假设下，表 B3 对应约 50–101 million。
- 报告用一周 168 小时对比 40 小时全职工作周，把上述 Agent 并发能力换算成“weekly working hours”，得到约 140–720 million 名全职员工的工时规模。原文明确提醒，这个比较只计算工作时间，不等价于产出质量、任务难度或人类员工数量。
- 更高效的开放模型可能把同一硬件池的并发规模推高到十亿级。原文以 DeepSeek V4 Pro 的 AgentX serving benchmark 为例，在相同硬件供给假设下给出约 1.9 billion concurrent agents 的情景。
- 报告更关心需求侧能否吸收这批潜在供给。其 20% effective-use 情景由 40% revenue-generating inference allocation × 50% utilization 得到；按 API-equivalent pricing，计入 2027 年硬件时对应约 $2.6–5.3 trillion / year。原文特别说明这不是“盈亏平衡所需收入”，而是按参考 API 价格折算的活动规模。
- 报告还指出模型与 serving 效率继续上升会同时降低每项任务所需算力，因此要维持硬件利用率，Agent 活动需求必须增长得足够快。作者把更广泛的 agent adoption、更长时间运行的 persistent agents 以及更难、更耗算力的任务作为可能的需求来源。

### 关键假设与边界

- headline range 不是“2027 年实际在线 Agent 数量预测”，而是对 2025–2027 HBM shipments 完成部署后、按给定 workload 与 serving 假设计算的 potential concurrent capacity。
- 对闭源模型，主情景使用 $30 / active agent-hour、$5 / GB300-hour、5–10× API-equivalent revenue / serving-cost ratio。并发能力对这些假设敏感。
- HBM4/4E 相对 HBM3E 的单位内存 Agent 承载 uplift 主情景取 2×，敏感性范围 1–4×。报告附录明确写出 2026–2027 的 HBM4/4E 年度占比是建模假设，不是来源直接给出的年度比例。
- 模型保持“当前能力与当前工作负载需求不变”。未来模型能力、上下文长度、推理方式、缓存命中率和 agent harness 行为变化都会改变单位硬件可支撑的 session 数。
- 2025–2027 指 shipment year；实际部署可能更晚，数据中心电力、网络和建设速度会形成时滞。因此短期 serving capacity 紧缺与长期潜在供给过剩可以同时成立。
- “一周可工作 168 小时”只说明机器不受 40 小时工作周限制；它不能把 Agent session 直接换算成等量知识工作者，更不能证明单位小时产出质量相同。

### 数据来源与可复现性

- Epoch AI 官方复现仓库：https://github.com/epoch-research/compute-to-agents
  - 仓库提供 figures、capacity scenarios、agent-hour cost 分析和冻结的 InferenceX benchmark snapshot；README 说明 quick build 可离线复现当前报告图表，并区分 API-equivalent spending 与真实账单、GPU utilization。
- SemiAnalysis InferenceX / AgentX：https://inferencex.semianalysis.com/
  - AgentX 用 agent session workload 比较不同 accelerator / model / serving configuration 下的真实并发与 streaming speed trade-off；公开页面说明 benchmark runs、recipes、logs 与 artifacts 可审计。
- TraceLab：https://github.com/uw-syfi/TraceLab
  - 公开 coding-agent traces 数据集与分析工具。Epoch 用其分析闭源 Codex / Claude Code session 的 agent-hour token / spending 行为，并去除已识别的人类等待时间、限制其它 idle gap 后定义 active agent-hour。

## 背景调研

### Epoch AI：AI 性能的价格下降速度

- https://epoch.ai/publications/the-plunging-price-of-thought
- Epoch AI 在 2026-09-22 的另一份报告中，基于数学、科学和游戏类 benchmark，估算从 2023 年起“达到给定 AI 性能水平”的价格平均每季度下降约 47%，约等于一年 13×。
- 这一结果支持原文的需求侧提醒：即使 agent usage 增长，单位任务所需成本也可能更快下降；维持总推理算力需求需要任务量、任务难度或运行时长增长得足够快。
- 该“price of thought”指标是跨 benchmark、性能水平和时间点链式构造的价格趋势，不是某一个固定服务的统一价格指数；正文使用时只把它当作效率 / 价格快速下降的背景，不将其外推成确定预测。

### 站内相关思考

- 《一个愿意替你修故障的 Agent，先得学会何时停手》：https://ntlx.github.io/articles/agent-proactive-action-user-control
  - 已讨论 Agent 从“提醒”走向“行动”后，权限、暂停入口与用户注意力如何成为产品约束。
- 《Agent 共用底座后，权限仍要跟着每次任务走》：https://ntlx.github.io/articles/agent-shared-infrastructure-task-scoped-permissions
  - 已讨论 Agent 数量扩张时，身份、任务权限和 trace 是否能贯穿共享基础设施。
- 《按下停止键后，Agent 的工作该怎样收住》：https://ntlx.github.io/articles/agent-safety-control-plane
  - 已讨论高自主执行下，在途任务、授权和外部副作用如何收束。
- 《供应链 Agent 开始执行后，权限边界得先写进流程》：https://ntlx.github.io/articles/supply-chain-agents-execution-boundaries
  - 已讨论能执行真实业务动作之后，授权阈值、人工升级、审计与回退如何决定 Agent 是否可托付。
- 《从 Token 流到 Agent 流：LLM 应用正在经历它自己的“协程革命”》：https://ntlx.github.io/articles/token-streams-agent-streams-llm-concurrency-revolution
  - 已讨论并发 Agent 从“更多模型调用”变成“更复杂的任务流”之后，可观测性和运行时组织方式的重要性。

### 本文可形成的原创增量

1. 不把 Epoch 的“Agent population”继续翻译成人数，而把它理解为一种基础设施 carrying capacity：硬件可以容纳多少并发工作会话。
2. 把企业真正能吸收的规模定义为“可委托 Agent-hours”：必须同时满足任务有价值、权限可界定、输入上下文可供给、结果可验证、失败可恢复，才算可消费的 agent capacity。
3. 由此得到一个不同的容量规划问题：未来企业不应只问“我能跑多少 Agent”，而应问“我有多少工作可以在不显著增加监督负担的前提下交给 Agent”。
4. 进一步把成本单位从 token / agent-hour 推向 outcome：Agent 越便宜，越需要用每个完成结果的价值、验证成本与副作用风险来决定是否值得扩张。

### 写作边界

- 不把 30–170 million 写成实际部署数量或确定预测。
- 不把 140–720 million FTE-equivalent working hours 写成“替代了同等数量员工”。
- 不把 $2.6–5.3 trillion 写成模型厂商必须实现的收入、市场规模或资本开支回报线。
- 不把 47% / quarter 价格下降外推到未来固定年份；只说明过去三年 benchmark 数据中的估算趋势。
- 不声称用户本人已经在企业内验证过“可委托 Agent-hours”指标；这是本文提出的分析框架。
