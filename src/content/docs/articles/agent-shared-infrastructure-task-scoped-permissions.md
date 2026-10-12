---
$schema: starlight
title: Agent 共用底座后，权限仍要跟着每次任务走
description: 共享基础设施能减少重复接入；规模化仍取决于每次调用的身份、任务权限和执行记录能否贯穿模型、工具与业务系统。
date: 2026-10-12
category: ai-agents
primarySourceUrls: ["https://www.databricks.com/blog/how-scale-agentic-applications-without-creating-ai-sprawl"]
---

Databricks 用 choice、context、control 三个词概括企业 Agent 如何扩张：模型和工具要能换，业务上下文可以共用，权限与运行状态交给共同基础设施管理。[原文](https://www.databricks.com/blog/how-scale-agentic-applications-without-creating-ai-sprawl)的第一张图把 Agent Loop 放在中央，周围是工具、模型、上下文、身份、治理、监控和沙箱。图上已经能看见工程难点：模型只是其中一环，真正要看住的是整条运行链。

我认同共享基础设施能减少重复接入。读完后，我更关心一件具体的事：任务从模型走到工具、再写回业务系统时，发起人的身份和任务范围有没有一路跟上？

![文章核心信息图：一次请求经共享层、策略检查后到达业务结果，身份、任务范围与执行记录贯穿流程](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-12-agentic-sprawl-00-infographic-core-summary.png)

## 复杂度会迁入共享层

团队各自接模型、数据和工具，时间一长就会重复维护连接逻辑，权限和日志也容易散落在不同系统。共享层可以把接入、策略和观测做成公共服务，让新流程沿用现成能力。

![Databricks 原文 Agent Loop 周边的工具、模型、上下文、身份、治理与监控等依赖关系](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-12-agentic-sprawl-source-agent-loop.png)

一部分工作因此转到了公共层：它要处理身份、业务上下文、模型路由和工具调用，还要让 trace 对得回原始请求。平台越大，这些兼容问题越是平台自己的维护责任。接口若没有保留任务范围和执行证据，统一入口反而可能遮住各条运行路径的差异。

Databricks 把 [Agent Bricks](https://www.databricks.com/product/artificial-intelligence/agent-bricks)、[Omnigent](https://docs.databricks.com/aws/en/omnigent/) 和 [Unity Gateway](https://www.databricks.com/product/artificial-intelligence/unity-gateway) 放在不同层来组合。我把它读作一套平台设计。它能否覆盖团队的身份、工具和审计边界，还得拿实际工作流来核对。Databricks 文档将 Omnigent 标注为 Beta；跨 harness 的可替换性也要看具体支持范围和限制。

![Databricks 原文 Agent Bricks 厂商架构示意图，展示产品组件与平台能力的关系](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-12-agentic-sprawl-source-agent-bricks-architecture.png)

## 授权要落到本次任务和具体动作

Databricks 用退款任务解释权限范围：发起请求的员工可能能访问客户账户，Agent 为了完成这一笔退款，只需要相关订单、退款规则和这笔交易的授权。业务定义可以复用，操作权限仍要跟着当前任务走。

我会先问清几件事：谁提出请求，Agent 代表谁访问，任务可以读取哪些数据、执行哪些动作，权限在哪个系统里生效。还要顺着调用看它有没有经过 MCP、外部 API 和业务系统。上游认出了某个 Agent，不代表最后一个工具仍按同一范围授权。

本站的[《让 Agent 带着具体请求来申请权限》](https://ntlx.github.io/articles/openshell-runtime-permissions)继续讨论了授权请求的具体范围，以及被拒绝之后怎样提出更窄的申请。放进多 Agent 平台，这些问题还得跨过身份代理和工具边界逐项核对。

## 答案之外，还要能复原一次调用

最终回答看起来正确，也没法单独说明 Agent 用了哪些上下文、调用过什么工具，或副作用到底在哪一步发生。Databricks 原文把 Gateway 遥测与 MLflow 的 tracing、evaluation 放进反馈流程。我更想知道，这些记录能不能沿着同一任务连起来。

NIST 的《[Challenges to the Monitoring of Deployed AI Systems](https://doi.org/10.6028/NIST.AI.800-4)》也谈到部署后的监测难题。这份报告根据文献综述和 2025 年的三场工作坊整理实践挑战，提到模型可见性不足、信息难以共享，以及分布式基础设施的日志碎片化。它没有评估某家产品；读到这里，我会把关注点放在 trace 能否跨组件接续，而不是控制台有没有一张总览图。

对于一项具体任务，我希望能从请求查到所用身份和上下文，再追到模型路由、工具输入、策略决定和业务系统的结果。日志不必收录敏感原文，但要能说明一次调用为什么被允许或拒绝。出了问题，才好分清是模型判断、上下文来源、策略配置还是工具执行出了差错。

## 用一条工作流检验平台复用了什么

准备扩展前，先挑一条边界清楚的工作流，从用户请求一路跟到业务系统的实际操作。然后检查：

- 请求身份和被委托的身份是否能区分，并且贯穿每次工具调用？
- 共享的上下文是否保留了数据权限和业务定义的来源？
- 每种工具动作的允许范围与拒绝路径，是否能在真实执行点验证？
- 更换模型、harness 或工具之后，策略和 trace 是否仍然连续？

![扩张前验证流程：检查身份、数据和动作范围、执行点的允许与拒绝，以及替换模型或工具后的策略和 trace 连续性](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-12-agentic-sprawl-03-flowchart-task-validation.png)

同时记下复用省掉了哪些重复接入，公共层又增加了什么维护工作和故障影响范围。若出了问题仍还原不了任务链，“可扩展”就只是部署图上的样子。检查一条真实流程，比先把所有模型和 agent 都放进同一平台更能说明问题。

基础能力可以放进共享层，Agent 数量也可以继续增加。判断这套底座是否能扩张，我会看一件事：能不能从请求追到实际动作，并说清权限从哪里来、依据了什么上下文、结果落在何处。

## 参考资料

- [How to scale agentic applications without creating AI sprawl — Databricks](https://www.databricks.com/blog/how-scale-agentic-applications-without-creating-ai-sprawl)
- [Challenges to the Monitoring of Deployed AI Systems — NIST AI 800-4](https://doi.org/10.6028/NIST.AI.800-4)
- [NIST 报告发布说明](https://www.nist.gov/news-events/news/2026/03/new-report-challenges-monitoring-deployed-ai-systems)；[官方 PDF](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.800-4.pdf)
- [Agent Bricks — Databricks](https://www.databricks.com/product/artificial-intelligence/agent-bricks)
- [Omnigent on Databricks 文档](https://docs.databricks.com/aws/en/omnigent/)
- [Unity Gateway — Databricks](https://www.databricks.com/product/artificial-intelligence/unity-gateway)
- 原文配图：[Agent Loop](https://www.databricks.com/sites/default/files/inline-images/image1_130.png?v=1790787416)；[Agent Bricks 架构图](https://www.databricks.com/sites/default/files/inline-images/image2_111.png?v=1790787416)
- [Agents at Work: Shipping Agentic Apps at Scale — Databricks 研讨会页面（可见议程与介绍）](https://www.databricks.com/resources/webinar/agents-work-shipping-agentic-apps-scale)
