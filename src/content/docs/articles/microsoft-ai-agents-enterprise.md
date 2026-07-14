---
$schema: starlight
title: 不是模型不够聪明
description: "Agent 在生产中翻车，几乎都不是模型的问题。模型是可替换的零件，真正决定成败的是脚手架——检索、身份、护栏、评估。微软说\"脚手架和模型一样重要\"，我觉得说保守了。"
date: 2026-07-14
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-14-microsoft-ai-agents-enterprise-img-00-infographic-core-summary.png)

昨天读 ByteByteGo 采访 Microsoft Core AI 产品副总裁 Marco Casalaina。他管着 Foundry 平台——八万家企业在上面搭 AI Agent，M365 Copilot 两千万用户跑在上面。采访里有句话我反复看了几遍：

> "The harness matters as much as the model."

脚手架和模型一样重要。

我觉得他说保守了。在生产环境里，脚手架比模型**更**重要。

## 模型是可替换的零件

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-14-microsoft-ai-agents-enterprise-img-01-prototype_vs_production_gap.png)

先说清一个背景。2026 年的 AI Agent 不是聊天机器人。聊天机器人回答问题，答错了是体验差。Agent 替你做事——订会议、跑分析、发邮件。做错了是业务事故。

这个区别让 demo 和生产之间出现了一道裂缝，而且比大多数人想象的要宽。

Marco 的团队见过太多这样的项目：下午 vibe-code 出来的 Agent，demo 惊艳，一周上线。然后真实用户问了训练数据里没出现过的问题，依赖的文档过了期，模型更新悄悄改变了行为——Anthropic 发 Claude Opus 4.8 的时候，GitHub Copilot CLI 团队不得不重新调优整套脚手架才能发货——没人注意到，直到客户投诉。

模型本身很少是问题。出问题的是模型周围的一切。

## 脚手架里到底有什么

Marco 把脚手架分成五层。从底往上：

**推理层**——模型本身。可替换，Foundry 支持一万一千多个模型，从 OpenAI 到 DeepSeek。

**Agent 运行时**——把模型变成 Agent 的编排循环。不是每一步都该走模型：数据库查询、专用提取模型，比让 LLM 做同样的事更快、更便宜、更可靠。

**可观测性与治理**——跨项目的全局视图。Token 用量、延迟、漂移检测。没有这一层，退化不可见，成本不可控。

**身份层**——Agent 有自己的目录条目、权限范围、审计追踪。

**上下文层**——让 Agent 拿到正确的信息。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-14-microsoft-ai-agents-enterprise-img-02-five_layer_harness_architecture-2.png)

前两层是基础设施，大多数团队已经会搭。第三层是运维标准，迟早要补。真正拉开差距的是上面两层。

身份层解决的问题很直白：Agent 开始在企业里做事，它得有"工牌"。不是匿名进程，不是借用某个用户的凭证，而是像员工一样——有名字、有部门、有权限边界、做事留痕。出了问题，审计记录能追到"谁"，不是"那个 AI"。受监管的企业不接受后者。

Marco 的团队把 Agent 放进了 Entra——Microsoft 的企业目录系统。Agent 在组织架构里向管理者汇报，拥有自己的邮箱。听起来有点科幻，但这其实是工程上很朴素的选择：你不可能让一个匿名系统代替员工发邮件、改文档、批流程。

## 检索不该只搜一次

上下文层是 Marco 的团队花力气最多的地方，也是这篇文章里我觉得最值得展开的部分。

企业不缺信息。SharePoint 里有文档，OneLake 里有表格，Outlook 里有邮件，Teams 里有对话。问题是信息散布在十几个系统里，没有一种检索方法能覆盖所有。

过去两年的标准答案是 RAG——检索增强生成。给模型配一个参考书架，回答前先翻书。但经典 RAG 是 one-shot 模式：拿用户的问题做向量，搜一个索引，返回 top-k，交给模型。问题模糊了它处理不了，需要跨源组合它做不到，第一次检索空了它没有退路。

Marco 说得直接："RAG 不好用的时候，整个 Agent 都不好使。"

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-14-microsoft-ai-agents-enterprise-img-03-classic_rag_vs_iterative_retrieval.png)

解法是把检索本身变成一个 Agent。

不是一次函数调用查一个索引，而是一个有规划能力的小 Agent：先想该查哪些源，执行查询，评估结果是否回答了原始问题——不够就换个关键词再查，换源再试，组合多源发现。检索从"查一下"升级为"调查一番"。

这个模式叫 retrieval-as-a-subagent。我觉得它漂亮的地方在于**分形**——Agent 调用 Agent。同一个套路在不同尺度上重复出现。我[之前写 Agent Loop 的时候](https://ntlx.github.io/articles/agent-loop-reading-bytebytego)聊过这种循环结构：把控制权交给一个有自主判断能力的子循环，让它自己决定什么时候够了。检索循环是同一个哲学的又一个实例。

Microsoft 的 Foundry IQ 在生产里跑这个模式。最值得注意的是最后一步：当迭代耗尽仍然找不到好答案，它返回一个结构化的"我不知道"，而不是逼模型硬编一个听起来合理的答案。经典 RAG 没有这个退路，所以模型会幻觉——给你一个自信的错答案，你自己都不知道它错了。

同样的逻辑也延伸到了工具发现。Agent 有十几个工具的时候，可以在 prompt 里全列出来。有几十个的时候不行——上下文烧光了，模型扫一遍列表就慢了。解法和检索一样：Agent 搜索需要的工具，拿回来，调用。需要的时候查，不是出门前把所有工具塞进脑子。

OpenAI 和 Anthropic 的 Agent 也在收敛到这个模式。这不是 Microsoft 的发明，是行业在独立地走到同一个答案。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-14-microsoft-ai-agents-enterprise-img-04-retrieval_as_subagent_loop.png)

## 考试不及格就自动补课

上下文解决了 Agent 能不能做对的问题。另一半是它会不会越做越差。

多数团队把评估当发布前的一次性检查——跑一遍测试，看到绿色，发货。传统软件可以这样，因为传统软件是确定性的。Agent 不是。同一个 prompt 对同一个模型可以产生不同回答，模型供应商随时更新，Agent 依赖的数据天天在变。发布前的测试是行为快照，不是行为保证。

Marco 的团队用 rubric-based eval——用例特定的 yes/no 检查项。比如一个帮人订餐厅的 Agent，rubric 会问：用户只说了"两个人明天"，Agent 追问了时间吗？声称有 6 点位置之前，确认了预订系统里真的有空位吗？订完跟用户复述了订单细节吗？

这些检查不是通用的"回答质量好不好"——那是模糊打分。这是逐项核对 Agent 有没有做它该做的具体动作。

然后是 Agent Optimizer：rubric 发现 Agent 漏了某个步骤，系统自动改写 system prompt 让缺失的行为更明确，或者调整怎么用工具。它同时试几种改法，打分后挑最好的上线。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-14-microsoft-ai-agents-enterprise-img-05-self_improvement_loop.png)

测量和改进变成了同一个循环。Agent 给自己补课。

这个闭环可能是整篇里最值得做 Agent 的团队认真看的一段。

## 这套重装备，小团队穿得起吗

话说回来。

Marco 站在 Microsoft 的位置讲 harness，背后是八万家企业和一万一千个模型。他当然有动机把 harness 讲得越全越好——Foundry 就是卖这个的。文章里没有提到的是：这套五层架构的工程成本有多高，一个五十人创业公司能不能负担。

这是一个需要诚实面对的边界。

但原则本身不挑平台。Marco 在采访最后给的建议其实很朴素：

**检索应该是 agentic 的。** 你的检索层背后应该藏着一个能规划、能换源、能从失败检索中恢复的子 Agent，而不是一个 one-shot 函数调用。

**做事的 Agent 应该有身份。** 组织认可的、能过合规审计的身份和审计追踪。

**护栏应该卡在工具边界。** 不只是检查模型的输入输出，而是检查每一次工具调用和工具返回——因为间接 prompt 注入藏在 Agent 读到的文档里，不是用户打的字里。

这三条不需要 Foundry 也能做。需要的是从"选最好的模型"这个直觉里退一步，想一想：你的 Agent 翻车的时候，到底是模型不够聪明，还是脚手架没搭好？

我之前写过一篇《[Not the Model, You're the Harness](https://ntlx.github.io/articles/not-the-model-youre-the-harness)》，标题就是这篇的结论。读完 Marco 的采访，更确信了。

*你的 Agent 在生产中翻过车吗？翻车的原因是模型，还是脚手架？*

## 延伸阅读

* [循环交出控制权之后：读 ByteByteGo《The Agent Loop》](https://ntlx.github.io/articles/agent-loop-reading-bytebytego) — Agent Loop 的分形设计哲学
* [Not the Model, You're the Harness](https://ntlx.github.io/articles/not-the-model-youre-the-harness) — 同一个结论的更早观察
* [Anthropic 这篇长跑 Agent harness 文章，讲透了交接制度](https://ntlx.github.io/articles/anthropic-long-running-agent-harness) — Anthropic 视角的 harness 工程
* [Google 给 RAG 加的不是更多 Agent，而是停手判断](https://ntlx.github.io/articles/google-agentic-rag-sufficient-context) — Google 的 agentic RAG 与"什么时候该停"

## 参考资料

* [How Microsoft Ships AI Agents at Enterprise Scale — ByteByteGo](https://blog.bytebytego.com/p/how-microsoft-ships-ai-agents-at)
* [Microsoft's AI Futurist explains how he uses Copilot — VentureBeat](https://venturebeat.com/orchestration/microsofts-ai-futurist-explains-how-he-uses-copilot-and-the-real-world-problems-enterprises-are-solving-with-agents)
* [Build and run agents at scale with Microsoft Foundry at Build 2026 — Microsoft DevBlogs](https://devblogs.microsoft.com/foundry/agent-service-build2026)
* [Foundry IQ: Build smarter agents faster — Microsoft Foundry Blog](https://devblogs.microsoft.com/foundry/build-smarter-agents-faster-with-foundry-iq)
* [Microsoft Build 2026: Foundry Turns AI Agents Into Production Infrastructure — WindowsForum](https://windowsforum.com/threads/microsoft-build-2026-foundry-turns-ai-agents-into-production-infrastructure.424007)
