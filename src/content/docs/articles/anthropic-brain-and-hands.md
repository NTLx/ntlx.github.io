---
$schema: starlight
title: 给 Agent 一双手，还要给它划一条线
description: Agent 能调用工具之后，可靠性取决于它能触及什么、凭什么行动，以及出错后能否被看见和纠正。
date: 2026-10-30
category: ai-agents
primarySourceUrls: ["https://lspace.beehiiv.com/podcast/s/latent_space_the_ai_engineer_podcast/how_anthropic_ships_the_1_llm_in_the_world_safely_separating_the_brain_from_the_hands"]
---

假设你请一个 Agent 整理客户订单。它需要查询数据库，还要把结果写进一份报告。最方便的做法是给它一个能访问数据库的环境，让它自行查、自己写。问题是，当它读到一条恶意指令，或者只是误解了任务，它手里的权限会让错误走多远？

在 [Latent Space 对 Anthropic 平台团队的访谈](https://lspace.beehiiv.com/podcast/s/latent_space_the_ai_engineer_podcast/how_anthropic_ships_the_1_llm_in_the_world_safely_separating_the_brain_from_the_hands)中，Katelyn Lesse 和 Angela Jiang 谈到一个颇有启发的设计：把 Agent 的“大脑”和“手”分开。听完之后，我更关心的并不是这个比喻本身，而是它把一个经常混在一起的问题拆开了：能想出一个动作，与有权执行这个动作，是两回事。

![Agent 的行动边界](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-30-anthropic-brain-and-hands-img-00-infographic-core-summary.png)

## 脑、手和留下来的记录

按 Anthropic 的[架构说明](https://www.anthropic.com/research/managed-agents)，大脑是模型及围绕它运行的 harness：它接收任务、组织上下文、决定下一步调用什么工具。手是执行动作的沙箱和工具。还有容易被比喻省略的第三部分：会话事件记录，它保存工作过程所需的状态。

![Anthropic 官方架构图：harness 连接会话、工具与沙箱](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-30-anthropic-brain-and-hands-img-01-framework-anthropic-original.png)

这几部分分开，首先解决的是普通工程问题。访谈中的嘉宾说，早期做法是把整个 Agent 放进沙箱，等沙箱启动后才能开始工作；如果沙箱失效，整个运行也可能随之中断。把运行逻辑和执行环境拆开后，执行环境可以按需启动，会话状态也有独立的位置。这样设计的目标是降低等待并改善恢复能力，具体效果仍取决于实现和工作负载。

拆分还带来了安全上的好处。Agent 要调用外部服务时，通常需要凭据。访谈描述的做法是把真实凭据放在独立的保管库中，Agent 看到的是占位符；请求经过出口代理时，代理才按配置注入凭据。沙箱还可以限制能访问的网络目的地。

这像是给工作人员门禁卡，而不把门锁的主钥匙交出去。它减少了密钥直接暴露给生成代码的机会，也让系统有地方检查请求是否符合策略。

## 藏住钥匙，仍要管好门后面的事

不过，门禁卡本身也有权限。如果 Agent 被允许查询整个订单库，即使它从未看到真实密钥，仍可能在提示注入或任务误解下读出不该读取的订单。Anthropic 的[安全风险文档](https://platform.claude.com/docs/en/managed-agents/secure-deployment-risks)也明确列出了这种情况。

因此，我会把“安全地使用工具”拆成几个具体问题：谁授予权限？允许访问哪些数据？可以执行什么操作？结果能发到哪里？什么时候必须由人确认？权限何时失效？仅仅回答“它运行在沙箱里”还不够。

拿整理订单来说，系统可以只提供与当前任务相关的查询接口，让 Agent 读取必要字段，把生成报告与发送报告分成两个动作。前者可以自动执行，后者在涉及外部收件人时交给人确认。这样的设计会增加接入和操作成本；对于低风险、可撤销的任务，也没有必要把每一步都变成人工审批。关键是让约束与可能造成的后果相称。

![订单任务的查询、草稿与发送权限](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-30-anthropic-brain-and-hands-img-02-flowchart-order-permissions.png)

我之前在[《从工作台到沙箱：Agent 的自主性需要可见边界》](https://ntlx.github.io/articles/claude-code-agent-visible-boundaries)中关注过人怎样看见 Agent 的身份、权限和进展。这次访谈补上了更靠近基础设施的一层：可见的边界需要由实际执行的权限控制托住，否则界面上的提示未必能阻止一次越权操作。

## 模型更聪明，验收反而更重要

访谈中，嘉宾还谈到把消息 API 从 Python 移植到 Rust 的经历。按她们的说法，团队让 Claude 协助编写代码，同时保留人的系统设计，并通过影子流量比较新旧系统的输出；移植期间刻意克制了顺手增加新功能的冲动。这是受访团队的经验，不足以证明任何团队都能复制同样的收益，但其中的工作分配很值得注意：实现可以加速，定义要保持什么行为、怎样比较结果，仍然是工程工作的核心。

同样的难题也出现在模型行为上。有些用户希望 Agent 主动完成任务，有些用户只是想先讨论方案，不希望它立即修改文件。访谈嘉宾承认，这类偏好很难用一个统一的默认行为和评估方法满足。

所以，把 Agent 的手限制住并不意味着不信任模型的每个决定；它是在承认意图本来就有歧义。让系统区分“提出方案”“修改草稿”和“执行外部操作”，让用户能看见差异并调整授权，往往比寄希望于模型每次都猜中更可靠。

## 给自主性配上恢复能力

我从这期访谈得到的判断是：Agent 的自主性不应只按它能连续执行多少步衡量，还应看出错时损失能否被限制、过程能否被追溯、任务能否安全地停下或恢复。

设计一个新工作流时，可以先问：最小的有用权限是什么？哪些动作只产生草稿，哪些动作会影响外部世界？记录是否足以解释一次操作？发生异常后谁能撤销授权？然后再决定哪些环节需要隔离、代理或人工确认。

这些问题最终需要落实到权限配置、运行记录和恢复流程中。模型越能独立行动，越值得在部署前想清楚这些细节。

## 参考资料

- [Latent Space：How Anthropic ships the #1 LLM in the World safely](https://lspace.beehiiv.com/podcast/s/latent_space_the_ai_engineer_podcast/how_anthropic_ships_the_1_llm_in_the_world_safely_separating_the_brain_from_the_hands)
- [Anthropic：Scaling Managed Agents with stable interfaces](https://www.anthropic.com/research/managed-agents)
- [Claude Platform：Security risks and sandbox boundaries](https://platform.claude.com/docs/en/managed-agents/secure-deployment-risks)
- [Claude Platform：Secure your Managed Agents deployment](https://platform.claude.com/docs/en/managed-agents/secure-deployment)
- [Stealing Reasoning Traces from Proprietary LLM APIs](https://arxiv.org/abs/2608.09867)
