---
$schema: starlight
title: 企业正在给 AI Agent 开白条——两份调查报告看同一个信任裂口
description: 54% 企业已发生 Agent 安全事件但满意度 4.2/5，50% 评估通过的 Agent 生产翻车但 66% 仍在建无人部署。两份报告指向同一个裂口——信任的授予跑赢了验证的能力。
date: 2026-07-17
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-17-ai-agent-trust-gap-img-00-infographic-core-summary.png)

VentureBeat 六月份发了两份 AI Agent 调查报告，一份讲安全，一份讲评估。分开看像是两个独立话题，放在一起，讲的是同一件事。

安全报告有组数字让我停了一下：54% 的企业已经经历过 AI Agent 安全事件。其中 18% 是确认的攻击，36% 是侥幸踩了刹车。超过一半在跑 Agent 的企业，都撞过墙或者差点撞上。

但另一个数字更奇怪：这些企业对自己当前的安全工具满意度打了 4.2 分（满分 5）。

满意度 4.2，事故率 54%。这两个数字不应该同时出现。

## 两个 gap，其实是一个

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-17-ai-agent-trust-gap-img-01-satisfaction_vs_incident_paradox.png)

评估报告给出了对称的画面。50% 的企业部署过通过了所有内部测试、然后在客户面前翻车的 Agent。四分之一的企业不止一次。

但最让我不安的不是"一半人翻过车"，而是这之后他们的反应。只有 5% 的企业说"我完全信任自动化评估"。这个数字低到几乎就是零。翻过车的人知道自己用的评估体系不准。但 66% 的企业要么已经在让 Agent 无人工审核直接部署，要么在往这个方向建管线。

知道评估不准，但还在加速自动化。这不是无知，是明知故犯。

把两份报告叠在一起看，图案就清楚了：安全 gap 和评估 gap 不是两个独立问题。评估是安全的上游。如果你的测试判断不出 Agent 在真实场景里会不会出错，你就无法判断它安不安全。反过来，如果你的安全控制全靠模型厂商送的 guardrail，你也没能力做独立的评估。两个 gap 互相喂养。

Gartner 有一个预测放在这里很恰当：到 2028 年，40% 的企业 AI 失败将归因于评估和监控不足，而不是模型能力不够。

## 谁定义了"够安全"

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-17-ai-agent-trust-gap-img-02-tool_vendor_landscape.png)

安全报告里有一组数据讲企业用什么来保护 Agent。OpenAI 的内置 guardrail 排第一，51%。Google Cloud 的控制层，36%。Microsoft 的 Purview 和 Copilot Studio DLP，35%。Anthropic 的管理式 Agent 控制，29%。

而专用 Agent 安全厂商，Palo Alto、CrowdStrike、Zenity、HiddenLayer，每家的使用率都在低个位数。

评估这边更极端。OpenAI 原生 evals 排第一，17%。第二名是"没有任何专用工具"，也是 17%。

这相当于把"什么叫安全""什么叫通过测试"的定义权，外包给了模型厂商。然后给它们打 4.2 分。

这里有一组现实案例。今年 4 月，Vercel 披露了一次供应链攻击。攻击者没有直接打 Vercel，他们打了一个叫 Context.ai 的第三方 AI 工具，然后通过员工授予这个工具的访问权限，横向进入了 Vercel 的内部系统。3 月，Meta 内部一个 AI Agent 用有效凭证执行了操作员从未授权的操作，导致敏感数据暴露。身份基础设施在认证成功后没有任何拦截，每次检查都说请求没问题。

这就是共享凭证、无隔离、非独立身份的结果。厂商 guardrail 在这两个场景里都没拦住，因为它们拦的是模型层面的问题，不是 Agent 作为一个有身份、有权限、可横向移动的数字实体的问题。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-17-ai-agent-trust-gap-img-03-production_monitoring_blindspot.png)

Gravitee 今年 4 月对 750 名高管的调查和 VentureBeat 的数据高度吻合：54% 的组织经历过或怀疑发生过 Agent 安全事件，电信业 67.3% 领跑。NeuralTrust 的报告补充了攻击类型：prompt 注入 68%，数据泄露 61%，未授权操作 52%。

## 盲灯

评估报告里有一个不那么起眼但极其重要的发现。它问企业：你在生产环境监控 Agent 的什么？

51% 的企业回答：看系统在不在运行。延迟多少、错误率多少、花了多少钱。只有 23% 的企业回答：看 Agent 的输出对不对。

这就是盲灯。系统告诉你一切正常，请求都完成了，延迟很低，没有报错。但 Agent 给出的答案是错的。它没有崩溃，它在自信地犯错。而你只能从事后客户投诉里知道。

报告里还有一个让人头疼的发现。企业下一个投资方向排名：第一是生产可观测性（30%），第二是人工审核工作流（26%），第三是安全与策略评估（20%），自动化评估管线只排在第四（16%）。

但 Finding 3 说的是，66% 在建设零人工干预的部署管线。

同一批企业，一边招人类审核员，一边把人类从部署决策里移除。这不是精神分裂，这是 hedging。企业在为"自动化评估不可信"买保险，同时不想放慢"自动化部署"的速度。结果可能是：人类审核员不负责把关，只负责善后。而善后的量级，超过了任何规模的人工团队能处理的。

## 事故是唯一有效的采购单

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-17-ai-agent-trust-gap-img-04-incident_driven_purchase.png)

安全报告最后一个 Finding 是整篇里最诚实的一组数据。没经历过安全事件的企业，只有 14% 计划在三个月内更换或新增安全工具。经历过侥幸避免的企业，这个比例跳到 42%。经历过确认攻击的，53%。

事故是最好的采购催化剂。但反过来也成立：在出事之前，安全预算几乎不可能被批准。

两份报告都指向同一个周期。Agent 部署加速，出事，紧急采购安全工具，继续部署更复杂的 Agent。没有人停下来把基础打牢，因为停下来等于落后。在一个人人都在加速的赛道上，单独减速的企业不会更安全，它会先消失。

我之前在《不是模型不够聪明》里写过类似的观察：企业 Agent 部署的瓶颈不在模型能力，在工程和组织基础设施。这两份报告把这个判断往下推了一层。基础设施不够的背后，是信任授予和验证能力之间的错配。

也在《Google 给 RAG 加的不是更多 Agent，而是停手判断》里聊过 Agent 什么时候应该停下来。这两份报告给出的答案是：现在，大部分 Agent 就停不下来。因为它们连"我该不该继续"的判断都外包给了厂商。

读到 Finding 7 的时候，我想起一个细节。安全报告问企业"你觉得你的 AI 防御领先于 AI 攻击者吗"，只有 35% 的人说领先。32% 说差不多，21% 说攻击者领先，21% 说太早说不清。加起来，65% 的人不觉得自己在赢。

这 65% 的人，和企业给安全工具打 4.2 分的，大概率是同一群人。他们满意，但没觉得安全。他们在用厂商送的东西，因为眼下没有更好的选择。不是因为够了。

VentureBeat 自己给这两份报告下的结语很准：这不是 coverage 问题，不是多跑几个测试套件能解决的。这是"evaluations that reflect reality and can be trusted to gate it"的问题——评估必须反映现实，而且必须被信任到能当闸门。两个条件现在一个都不满足。

*你所在的公司或团队在部署 AI Agent 的时候，评估和安全是怎么做的？用的是厂商原生的，还是自己搭的？有没有翻过"测试全过、上线就炸"的车？*

## 参考资料

- [The agent security gap: 54% of enterprises have already had an AI agent incident (VentureBeat)](https://venturebeat.com/ai/the-agent-security-gap-54-of-enterprises-have-already-had-an-ai-agent-incident-and-most-still-let-agents-share-credentials)
- [The agent evaluation gap: a reality-alignment problem (VentureBeat)](https://venturebeat.com/ai/the-agent-evaluation-gap-enterprise-ai-organizations-have-a-reality-alignment-problem-not-a-coverage-problem-and-most-are-shipping-to-production-anyway)
- [AI Agent Security Incidents Hit 65% of Firms in 2026 (Kiteworks)](https://www.kiteworks.com/cybersecurity-risk-management/ai-agent-security-incidents-2026)
- [State of AI Agent Security Report (Gravitee)](https://www.gravitee.io/state-of-ai-agent-security)
- [The State of AI Agent Security 2026 (NeuralTrust)](https://cdn.lawreportgroup.com/acuris/files/Law-Report-Group-Files-New/AI%20Agent%20Part%201%20NeuralTrust%20Report.pdf)
- [AI agent credential sharing: what IAM teams need to know (NHIMG/Gartner)](https://nhimg.org/community/agentic-ai-and-nhis/ai-agent-credential-sharing-what-iam-teams-need-to-know)

## 延伸阅读

- [不是模型不够聪明](/articles/microsoft-ai-agents-enterprise) — 企业 Agent 部署的瓶颈在工程和组织基础设施
- [Google 给 RAG 加的不是更多 Agent，而是停手判断](/articles/google-agentic-rag-sufficient-context) — Agent 判断"什么时候不该继续"的能力
- [Not the Model, You're the Harness](/articles/not-the-model-youre-the-harness) — Agent 时代，harness 比模型更重要
- [你的 Agent 读得懂代码，读不懂你的产品](/articles/vercel-agent-product-design) — Agent 能力和真实世界需求之间的裂缝
