---
$schema: starlight
title: Anthropic引入独立评估后，公众还能核对什么？
description: Anthropic说明了评估者的访问、发表和删节安排。结合 METR 的后续报告，我更关心公众能否看见方法、证据边界与删节影响；独立评估的可信度也取决于这些信息是否足以供外部检查。
date: 2026-11-06
category: security
primarySourceUrls: ["https://www.anthropic.com/news/an-update-on-independent-evaluators"]
---

读 Anthropic 关于独立评估者的更新，我先记下的是一份制度说明：公司邀请第三方进入内部，给他们接近内部风险团队的访问权限，同时允许他们公开风险判断。我更关注的是，评估者看到的证据，最后能有多少进入公开报告。

![核心摘要：评估者能看到什么，不等于公众能核验什么；报告需要说明证据、限制与判断边界。](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-06-anthropic-independent-evaluation-public-trust-img-00-infographic-core-summary.png)

我在[此前关于 Anthropic 与 Accenture 合作的文章](https://ntlx.github.io/articles/anthropic-embedded-evaluation)里谈过资金安排和进入权限。这次更新让我把问题往后推了一步：一项评估即使由外部团队完成，如果读者无法理解它看过什么、哪些材料不能公开、删节对结论有何影响，我们究竟能检查它到什么程度？

## “独立”是一组可以逐项检查的条件

Anthropic 把评估者所需的条件写得很具体：要有专业能力，不能在财务或运营上依赖被评估公司，要能接触足够信息，也要有发表观察和结论的自由。公告称，六名 METR 员工已获公司设备、办公空间和内部工具访问，权限大致接近 Anthropic 内部风险评估团队；客户数据、律师客户特权信息和模型架构等属于例外。

发表权也有边界。Anthropic 表示不能否决 METR 的结论，但可以要求移除落入预设类别的信息；这些类别是否适用，最终由 Anthropic 判断。对于其他合作方，公司还提出了三档安排：第一档的调查范围较窄，发现需经公司批准才能发表；第二档有更多访问与发表自由，但仍可能删节特定内容，评估者可以公开评价删节是否合理；第三档对应公告里的 METR 安排。

这套设计值得认真对待。前沿模型的风险判断需要看到训练、部署和防护流程，公开报告很难承载所有信息；把第三方放进工作现场，确实可能补上外部评估看不到的部分。与此同时，“第三方”这个身份本身不能回答它是否能自己决定查什么、是否拿到关键材料、是否能保留与公司的分歧。判断独立性，需要把访问、发表、资金和证据披露分开看。

![Anthropic 原文主图：蓝色天体与抽象脑纹理；这是抽象配图，不承载评估数据。](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-06-anthropic-independent-evaluation-public-trust-img-01-anthropic-original-hero.jpg "Anthropic 原文配图")

## 一份新报告提供了参照，也留下了边界

11 月 5 日，METR 发布了对 Anthropic AI 研发加速情况的评估。它特意说明，这项从 8 月开始的评估不是 10 月公告所说的员工式访问项目。因此，不能把该报告里的访问限制直接当成新安排已经失效的证据；两项合作的时间和条款不同，必须分开判断。

![两项 METR 合作的对比：10 月 15 日公布的新访问安排，与 8 月 12 日至 10 月 29 日的较早评估并非同一项目；新安排仍待后续报告检验。](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-06-anthropic-independent-evaluation-public-trust-img-02-comparison-two-metr-arrangements.png)

但这份报告仍能说明，公众为什么需要知道评估过程的细节。METR 说，评估团队可以提出所需信息的访问申请，Anthropic 可以单方批准或拒绝；METR 没有查看非公开模型样本。对公开报告，Anthropic 对非公开信息拥有删节权。METR 称，许多最能帮助解释其结论的证据未能公开，公众因而不得不比理想情况下更多地依赖 METR 自己的判断。

同一天，METR 还发布了对 Anthropic 另一份风险报告的审阅。它同意截至 7 月 15 日，内部部署模型直接自动化关键领域研发或引发急性灾难风险较低；但认为是否越过早期预警线仍有争议，而且有可能已经越过。把这种有限的分歧公开出来，是外部评估能提供的价值之一。

这些报告并不推翻独立评估的价值。读者需要把“第三方看过资料”与“公众可以评估结论”区分开。前者是评估能力的一部分，后者是公共问责的一部分。两者相关，却不会自动相互转换。

## 删节可以合理，影响也该可说明

有些安全工作信息确实不适合公开。Anthropic 举的例子包括可能帮助恶意行为者的信息，以及商业敏感的计算或训练资料；客户隐私、法律特权也会限制访问。要求外部评估原样发布所有内部材料，既不现实，也未必安全。值得追问的是，删节由谁判断、依据什么类别、是否影响结论，以及评估者能否把这些影响告诉读者。

SecureBio 对 Anthropic 一份较早风险报告的评审提供了另一种做法。SecureBio 逐项讨论删节的范围、理由和对判断的影响；它认为，多数删节有充分理由，整体上没有实质改变评审结论。这里的重点不是“删节越少越好”，而是公开报告能否把不能说的部分和仍然可以判断的部分区分开来。

METR 也写过与 AI 公司合作时的透明原则：报告应说明评估范围和时长、访问限制、删节、非正式压力以及利益冲突。它同时承认，在自愿合作模式下，评估者仍依赖公司提供访问并允许发布。把依赖关系和它的后果公开，能让读者判断这对结论意味着什么。

![读者核对报告时可关注五项信息：范围与时长、访问限制、删节及其影响、非正式压力、利益冲突；并区分公开证据、专业判断与暂时未知。](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-06-anthropic-independent-evaluation-public-trust-img-03-framework-report-transparency-checklist.png)

## 下一份报告可以回答这些问题

我读完这次更新后，会用几件具体的事来判断承诺如何落地：评估范围由谁设定？评估者提出的访问请求是否被拒绝，拒绝理由是否留下记录？发表前的审查究竟检查敏感信息，还是能改变评估者的结论？报告能否说明删节影响了哪些证据、为什么没有影响总体判断？评估者的资金来源和利益冲突是否披露？

这些问题不要求公开配方，也不要求第三方预先给安全结论。当读者看到一份评估报告时，应能分辨哪些结论由公开证据支撑，哪些仍要依赖评估机构的专业判断，哪些地方暂时无法判断。我判断这类合作是否有公共价值的一条标准，就是报告能不能把这几类情况讲清楚。

## 参考资料

- [Anthropic：An update on independent evaluators](https://www.anthropic.com/news/an-update-on-independent-evaluators)
- [METR：Independent Assessment of AI R&D Acceleration at Anthropic in October 2026](https://metr.org/blog/2026-11-05-anthropic-ai-rd-acceleration-assessment/)
- [METR：Review of the “Risks from automated R&D” section in Anthropic’s August 2026 Risk Report](https://metr.org/blog/2026-11-05-rd-section-anthropic-risk-report-august-2026-review/)
- [METR：Our approach to working with AI companies](https://metr.org/blog/2026-10-14-our-approach-to-risk-assessment/)
- [SecureBio：Anthropic February 2026 Risk Report: SecureBio’s External Review](https://securebio.org/resources/anthropic_feb_2026_risk_review.pdf)
- [Anthropic：Partnering with Accenture on embedded evaluation](https://www.anthropic.com/news/accenture-embedded-evaluation)
- [Anthropic：Redacted Risk Report August 2026](https://www-cdn.anthropic.com/f61d49fa5596956a5dec75fea0e973bf6a6a8378/Redacted%20Risk%20Report%20August%202026%20.pdf)
