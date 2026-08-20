---
$schema: starlight
title: 工作的实体不是交付物，而是对话：Slack 首席产品官谈人机团队的六条军规
description: 工业时代把文档和代码当工作，把沟通当成本；AI 时代交付物已极度廉价，达成共识的对话过程才是核心资产。Slack 首席产品官 Jaime DeLanghe 提出：人机协同的关键不是写 Prompt，而是打破私聊孤岛、重塑交接循环。
date: 2026-08-20
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-20-slack-claude-human-agent-teams-img-00-infographic-core-summary.png)

## 工业遗留的生产力假象：“瘦工作”与“厚上下文”

在现代企业的日常管理中，我们长期沿袭着一种源自工业制造时代的思维定式：只有最终落到纸面或代码库里的产物——无论是 PRD、架构文档、汇报 PPT 还是 Git 提交——才算作“工作”；而团队成员为了达成共识所经历的争论、反复确认、会议拉扯，都被视为需要尽可能压缩的“沟通摩擦成本”。

然而，这种划分在 AI 时代正在被彻底颠覆。

2017 年加入 Slack 主导搜索与机器学习、现任 Slack 首席产品官（CPO）的 Jaime DeLanghe，在近期长文《The Work is the Conversation》中给出了一个反直觉的洞察：**交付物只是廉价的“瘦工作”（Thin Work），真正蕴含高价值、决定业务走向的，恰恰是那个不断消解不确定性、反复权衡利弊的“对话过程”（Thick Context）。**

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-20-slack-claude-human-agent-teams-img-01-conversation_exhaust_transformation.png)

过去十几年，几乎所有科技公司都曾幻想过将员工日常交流产生的“对话废气”（Conversational Exhaust）自动沉淀为企业的组织知识库。但无数事实证明，人类根本无法胜任这项工作——没人愿意在繁忙的业务之余去更新 Wiki，海量的碎片化聊天记录最终沦为不可检索的信息黑洞，团队依然在不断重复提出相同的问题。

今天，大模型与自主 Agent 的出现第一次打破了这个僵局。人类消化非结构化废气的能力存在生理极限，而这恰恰是 AI Agent 的看家本领。当 Agent 接入全量的对话流，它不仅能记录“最终定了什么”，更能顺藤摸瓜地重构出“当初为什么这么定”，以及“伴随时间推移，外部约束发生了哪些位移”。

## 晨间简报与高频交接：人机团队的运转韵律

很多人在初次尝试将 AI 引入团队时，往往容易走向两个极端：要么把 AI 当作孤立的一对一聊天框（问一句答一句），要么寄望于全自动黑盒系统（直接甩手让 Agent 搞定一切）。

Slack 在内部与 Claude 深度融合的实践表明，真正高效的人机团队并非单点挂机，而是依靠紧密咬合的**“交接循环”（Cycle of Handoffs）**。Agent 负责承担高负荷的生产性初加工，人类则在关键决策节点把关与定调。

Jaime 展示了她典型的周一工作节奏：
1. **晨间自驱简报**：早晨开工时，专门的 Agent 已经为她梳理好每日简报——包括上周产品研讨会的争议焦点与升级预警、全网最新的 AI 行业情报追踪、当天全部会议的背景速读，以及一份已完成初稿重写的个人简介；
2. **人类定夺与纠偏**：人类花几分钟快速过目，挑出需要重点关注的议题，调整优先级，并在关键决策处给出定夺；
3. **轻量级信号交接**：在公共频道中，人类无需撰写复杂的指令，只需对特定消息打上一个 Emoji Reaction，绑定的 Agent 就会自动识别并认领后续的工单创建、指标拉取或跨部门同步任务。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-20-slack-claude-human-agent-teams-img-02-human_agent_handoff_cycle.png)

这种人机配合的韵律，本质上与我们在[《Anthropic 这篇长跑 Agent harness 文章，讲透了交接制度》](https://ntlx.github.io/articles/anthropic-long-running-agent-harness)中探讨的工程逻辑高度一致：Agent 系统的上限从来不是单次推理的智能程度，而是人机交接界面的摩擦力有多低。正如我们在[《当代码产量暴增 8 倍：Anthropic 如何用“只读 Agent”重构 CI/CD 值班防线》](https://ntlx.github.io/articles/claude-on-call-ci-cd-incident-response)中所见，通过轻量级信号将确定性脏活剥离给 Agent、把人类注意力留给核心仲裁，是现代工程团队对抗信息过载的共同解法。

## 为什么私聊是 Agent 的头号杀手？

如果说人机协作需要一套高效的交接协议，那么滋养这套协议的土壤则是**“默认公开（Default to Public Channels）”**的组织文化。

在企业落地 Agent 过程中，一个极其普遍却隐蔽的阻碍是：Agent 只能基于它看得到的数据进行推理。一旦关键讨论和决策退缩进私聊（DM）或私有群组，这部分信息对 Agent 来说就是绝对的黑盒与盲区。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-20-slack-claude-human-agent-teams-img-03-public_channels_vs_dm_silos.png)

为什么员工总喜欢把讨论藏进私信？Jaime 敏锐地指出，除却真正涉及法务、人事与合规的敏感信息外，工作缩回私聊的根本原因往往不是保密需求，而是人性的脆弱——**“半成品羞耻”（Discomfort with being seen mid-process）**。人们害怕在公共场合暴露自己不成熟的想法、粗糙的草稿和看似幼稚的提问。

然而，正是这些充满试错与推敲的半成品，才构成了最真实的决策上下文。

破解这一死结的关键，在于组织能否建立起足够坚固的心理安全感。“Giving trust is how you gain trust”——唯有鼓励团队在公开频道里暴露半成品思考，新员工才能无缝继承历史经验，Agent 才能拥有全局视野并反哺给全员。私聊看似保护了个人的短期舒适，实则切断了组织知识的复利链路。

## 警惕虚荣指标：Token 消耗量只能证明系统“通了电”

随着企业 AI 部署的深入，管理层往往急于寻找可量化的 ROI 证明。此时，最容易落入的陷阱就是把活动量误当成产出。

“我们希望员工在 Slack 里发送更多消息吗？或许并不想。消息数量暴增，往往意味着大家找不到需要的信息，或者第一遍没把话说清楚。”Jaime 对 AI 衡量指标给出了同样的警示：**Token 消耗量或调用次数，充其量只能算作证明系统已经通电亮灯的“脉搏检测”（Pulse Check），绝不能当作价值实现的证据。**

对于复杂的知识工作而言，试图用单一仪表盘量化 AI 收益是不现实的。真正的降本增效，体现在跨部门协作周期的实质性缩短、重复性工单的自愈，以及高风险决策失误率的降低。

在推动全员拥抱 Agent 方面，Slack 与 Salesforce 的经验同样值得借鉴：不要依赖自上而下的行政命令，而要依靠同侪之间的**“示范效应”（Show the art of the possible）**。在 Salesforce 拥有数千人的 `#How-I-Slackbot` 频道里，销售团队发明的流程技巧可以直接启发工程师重构部署脚本；在 Slack 内部，一位产品经理自发跑通 Claude 流程并写下 Canvas 模板后，其他团队便迅速自组织复制、建库并扩散。

重塑工作流从来不是孤军奋战，而是一场多方参与的团队运动。最有效的人机协同落地路径，永远是尽早启动、从小切入：挑选一小群人与 Claude 放进同一个公开频道，给他们充足的工具权限，让他们在真实业务的碰撞中自发探索。他们所摸索出的协作模式，自会产生惊人的自组织生命力。

---

*你在日常工作中是否也曾因为“害怕暴露半成品”而把讨论移到私聊？你的团队目前是如何处理人机交接边界的？欢迎在评论区分享你的实战观察。*

## 参考资料

- [Turning conversation into knowledge: how Slack builds human-agent teams](https://claude.com/blog/turning-conversation-into-knowledge-how-slack-builds-human-agent-teams)
- [The Work is the Conversation — Jaime DeLanghe](https://jaimedelanghe.medium.com/the-work-is-the-conversation-50a1d61f8f9e)
- [Building effective human-agent teams: what we've learned at Anthropic](https://claude.com/blog/building-effective-human-agent-teams)
- [Slack Leadership — Jaime DeLanghe](https://slack.com/about)

## 延伸阅读

- [Anthropic 这篇长跑 Agent harness 文章，讲透了交接制度](https://ntlx.github.io/articles/anthropic-long-running-agent-harness)
- [当代码产量暴增 8 倍：Anthropic 如何用“只读 Agent”重构 CI/CD 值班防线](https://ntlx.github.io/articles/claude-on-call-ci-cd-incident-response)
- [循环交出控制权之后：读 ByteByteGo《The Agent Loop》](https://ntlx.github.io/articles/agent-loop-reading-bytebytego)
- [Not the Model, You're the Harness](https://ntlx.github.io/articles/not-the-model-youre-the-harness)
