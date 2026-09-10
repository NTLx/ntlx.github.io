---
$schema: starlight
title: 当 AI 总能接着说下去，判断该从哪里回来？
description: AI 最值得警惕的未必是它说错了什么，而是它让我们把“还在继续”误当成“已经判断过”。
date: 2026-09-10
category: ai-agents
tags: [AI, Agent, 判断]
primarySourceUrls: ["https://jeffs.blog/p/defining-ai-psychosis-part-1-true", "https://jeffs.blog/p/defining-ai-psychosis-part-2-prolific"]
---

我整理 Jeff Clark 两篇文章的资料时，最容易犯的错，是被标题牵着跑。"AI psychosis" 太醒目，仿佛只要给现象起了名字，风险就已经被说清了。但读完后我带走的恰好相反：先别急着接受这个名字，先问它把哪些不同的事塞进了同一个口袋。

这个习惯也和我处理 agent 工作流时的经验相连。一个流程不断吐出任务、草稿、代码或“下一步”，看上去非常忙；可只要没人还能说清目标、拒绝结果、按下暂停，它的忙碌就不再自动等于进展。我们需要防的，不只是某一句错误回答，而是判断逐步只剩下界面内部的自我确认。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-10-ai-psychosis-00-infographic-core-summary.png)

## 先把一个响亮的标签拆回三件事

Clark 在[第一篇文章](https://jeffs.blog/p/defining-ai-psychosis-part-1-true)里做的最有用的工作，是把常被混称的一组现象拆开：精神病性症状、对 AI 的过度投入、以及把程序化互动体验成特殊亲密或权威关系的拟社会依恋。它们都可能需要认真对待，但不是一件事，更不能被一个新名词直接收编成一种诊断。

这不是文字游戏。精神病性症状涉及现实检验显著受损；拟社会依恋说的是关系体验；而第二篇所说的高产失控，更接近一种工作判断出了故障的状态。把三者混在一起，临床风险容易被娱乐化，普通的高投入又容易被病理化，最后谁也得不到合适的帮助。

我尤其在意一个朴素的分界：产出很多，并不等于判断失灵。一位工程师让 agent 连续生成方案和代码，只要他还能回答“这些东西服务什么目标”、愿意拿外部标准删改、也能在该停时停下来，高产就是能力。真正危险的变化是，衡量标准悄悄从外部目标变成了“系统又给了我一项可完成的事”。这篇文章把它叫作**产出—判断失配**：做出来的东西越来越多，人却越来越说不清为什么值得继续。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-10-ai-psychosis-01-concept-boundaries.png)

## 风险线索不是因果判决书

拆词之后，证据也该拆开看。Clark 的文中人物是明确的虚构示例；第二篇里的开发者故事和从 agent 到失控产出的演进也是假设。间歇性奖励、ADHD、冲动控制、人格、经验或就业焦虑等解释，都是作者提出的推测，不是文章已经验证的机制。[Carlbring 与 Andersson 的评论](https://pmc.ncbi.nlm.nih.gov/articles/PMC12550315/)讨论了互动、顺从的聊天机器人可能强化既有心理病理过程；它提供的是值得警觉的机制线索，不是发生率研究。

同样地，[Moore 等人的模型回应实验](https://arxiv.org/html/2504.18412v1)发现某些模型在构造的心理健康场景中会给出污名化或不恰当的回应。这能支持“回应方式可能有害”的担忧，却不能回答有多少使用者会出现精神病性症状，更不能证明 AI 是病因。两份近期病例也恰好提醒了这种复杂性：它们同时涉及沉浸式使用、严重睡眠不足、药物或物质暴露等多重因素，[Pierre 等](https://pmc.ncbi.nlm.nih.gov/articles/PMC12863933/)与[Shah 和 Morrin](https://link.springer.com/article/10.1186/s12888-026-08137-3)都没有把 AI 定为单一或主要原因。

所以我不会把“多数相关病例已有既往精神病性疾病”当作事实复述。Clark 没有给出发生率、队列或对照数据；而[NIMH 对精神病的说明](https://www.nimh.nih.gov/health/publications/understanding-psychosis)也强调，症状和风险因素并不等于一个固定的既往诊断。比较诚实的说法只能是：对话系统可能在复杂风险链中充当强化器，但它是不是必要原因、充分原因或主要原因，目前的材料都回答不了。

这条边界不是为了淡化风险。相反，它让我们知道该把注意力放在哪：出现明显的现实检验困难、安全风险或严重睡眠、功能受损时，应尽快寻求合格的医疗或危机支持；而不是在网上拿一个流行标签给自己或别人下判断。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-10-ai-psychosis-02-speculative-feedback-loop.png)

## 真正会让人滑下去的，是没有出口的正反馈

第二篇文章值得保留的直觉，不是“高产本身像一种病”，而是 agent 改变了继续行动的成本。过去要写下一版方案，人要自己启动、找材料、承受空白页；现在系统可以立刻补全、拆任务、给出下一步。完成感来得更快，外部压力又不断催促，于是“再做一点”的门槛变得很低。

零号模型会说：输出变多，价值自然会变多。它漏掉了一件事——价值评估和产出不是同一个循环。没有验收标准时，任务完成数会取代真实目标；没有停机条件时，系统的下一条建议会取代人的优先级；没有人类复核时，低质量结果也会变成继续生成的原料。这样一来，工具不是神秘地控制了人，而是把一个本来该被外部打断的正反馈环，运行得太顺了。

这个判断可以迁移到很多地方：连续刷短视频、无止境地优化仪表盘，甚至把会议纪要越写越长，都可能发生“更多替代更好”。但它也有明确的反例。睡眠充足，能被同事质疑，且交付物有外部验收标准的人，即使一晚上生成了很多内容，也没有理由被视为失控。数量不是证据；失去暂停、解释、删改的能力才是需要重视的信号。

## 把现实检验翻译成工作流里的校准层

临床语境中的“现实检验”不能被我拿来当管理术语：它涉及的体验、支持和专业评估，远比一个产品功能复杂。但它启发了一个可以迁移到 agent 工作流的问题：如果所有证据、鼓励与下一步都来自同一个聊天界面，谁来提供界面之外的校准？

我会把这个问题做成四个很笨、却很有用的闸门。每次长链任务启动前，写下它服务的**目的**；在流程中预先声明**停机条件**，例如成本、时间或质量阈值；把结果交给独立的**外部验收**，测试、用户反馈或同事审阅都可以；最后保留明确的**人工复核**，让人有权删除已经花了很多时间生成的东西。这些是工作卫生，不是心理治疗，也无法替代临床支持。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-10-ai-psychosis-03-external-calibration-framework.png)

这四个点的共同作用，是把判断从“模型有没有继续夸我”移回到睡眠、同伴、证据和结果。它们不要求人拒绝 AI，也不会消除一切风险；它们只确保系统越会持续行动，人越不能把停止和反驳的权力交给系统自己。

两篇文章因此最值得读的地方，不是替一个新疾病盖章，而是逼我们恢复一种更慢的判断顺序：先分清现象，再检查证据，最后给每条行动链装上外部校准。标签能让问题显得已经被掌握；校准层才让我们有机会真的看见问题。

你使用 agent 时，哪一个外部标准最能让你发现“我只是在继续做，而不是在往前走”？

## 参考资料

- [Jeff Clark：Defining AI Psychosis. Part 1: True AI Psychosis](https://jeffs.blog/p/defining-ai-psychosis-part-1-true)
- [Jeff Clark：Defining AI Psychosis. Part 2: “Prolific AI Psychosis”](https://jeffs.blog/p/defining-ai-psychosis-part-2-prolific)
- [Carlbring & Andersson：AI psychosis is not a new threat: Lessons from media-induced delusions](https://pmc.ncbi.nlm.nih.gov/articles/PMC12550315/)
- [NIMH：Understanding Psychosis](https://www.nimh.nih.gov/health/publications/understanding-psychosis)
- [Moore et al.：Expressing stigma and inappropriate responses prevents LLMs from safely replacing mental health providers](https://arxiv.org/html/2504.18412v1)
- [Coltheart, Langdon & McKay：Schizophrenia and Monothematic Delusions](https://pmc.ncbi.nlm.nih.gov/articles/PMC2526128/)
- [Pierre et al.：New-onset AI-associated psychosis case report](https://pmc.ncbi.nlm.nih.gov/articles/PMC12863933/)
- [Shah & Morrin：Substance-associated manic psychosis with chatbot reinforcement](https://link.springer.com/article/10.1186/s12888-026-08137-3)
- [xkcd #2347：Dependency](https://xkcd.com/2347/)
