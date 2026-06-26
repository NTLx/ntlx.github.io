---
$schema: starlight
title: 当法务开始写代码——OpenAI 这篇 Codex 数据报告，藏着比 AI 替代人更深的信号
description: "OpenAI 内部数据揭示的真正趋势，不是 AI 替代人，而是 AI 在消融岗位边界——法务、HR、招聘开始大量做工程类工作。Agent 降低了\"跨界的心理成本\"，这比效率提升更值得关注。"
date: 2026-06-26
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-26-codex-agents-dissolving-job-boundaries-img-00-infographic-core-summary.png)

OpenAI 昨天发了一篇经济研究论文，分析 Codex 过去一年的使用数据。他们把论文包装成"Agent 如何改变工作"的叙事，但读完我脑子里放不下的，不是一个数字，而是一个画面：法务部的律师，用 Codex 写了一个自动化数据管道。

这篇东西不是产品宣传。它是 OpenAI 联合哥伦比亚、杜克、宾夕法尼亚大学的研究者，扒了三组人群的真实使用数据：OpenAI 自己的员工、外部组织用户、个人用户。每一组都指向同一个方向——但方向不是"AI 越来越强了"，而是另一个更安静的变化。

## 最容易被忽略的一个数字：189 倍

先说数据。

过去一年，Codex 从工程师玩具变成了 OpenAI 每个部门的主要 AI 工具。去年 8 月，OpenAI 员工花在 Codex 上的 token 不到 10%，ChatGPT 是大头。现在这个数字超过 85%。在 OpenAI 内部，99.8% 的输出 token 走 Codex。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-26-codex-agents-dissolving-job-boundaries-img-01-codex_vs_chatgpt_adoption.png)

但这些是你可以猜到的。真正让我停下来的数据是这个：

非开发者组织用户，增长了 **189 倍**。个人非开发者增了 137 倍。这不是"用 Codex 的人多了"，是开发者和非开发者的增速差了一个数量级。开发者先行（Codex 本来就是给他们做的），但非开发者一旦开始用，增长的斜率完全不同。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-26-codex-agents-dissolving-job-boundaries-img-02-nondeveloper_growth_chart.png)

为什么会这样？直觉上应该反过来——工程师有技术基础，用 Agent 工具上手更快，应该增速更快才对。

但这个直觉把两件事搞混了：存量使用和增量潜力。工程师用 Codex，是在加速他们本来就能做的事。非工程师用 Codex，是突然能做他们本来做不了的事。后者的边际效用远超前者。

一个律师自己写了个数据库查询——这对她的价值，远超一个程序员让 Codex 帮他写了一段他已经会写的代码。

## 四分之一的非技术工作者，在和代码打交道

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-26-codex-agents-dissolving-job-boundaries-img-03-occupation_work_heatmap.png)

OpenAI 的内部数据里有一张热力图，展示每个部门的工作类型分布。最显眼的一格：业务职能部门——法务、财务、HR、市场——超过四分之一的工作输出是工程和编码。

不是"法务用 AI 协助审查合同"。是法务在写代码。

这跟"AI 自动化"是完全不同的两件事。自动化是一个任务被机器接管，人退场。但这里发生的不是退场——是跨界。一个不具备编程技能的人，通过 Agent 获得了编程的执行能力。她的判断力、领域知识还留在原地，但执行瓶颈被拆掉了。

Stanford 的 Jessica Kriegel 把这叫"心理行动成本的降低"。她用的词是 psychological cost of action——你不再需要先说服自己"我能做这件事"才有资格开始。你只需要对 Agent 说一句。陌生的领域不再让你停留在门口。

这也解释了为什么非开发者的增长斜率更陡。他们不是在"更高效地做本职工作"，而是在进入本来不属于他们的领地。每一次跨界都是一次新的采用，而不是旧行为的加速。

## 少数人在狂飙，大多数人在围观

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-26-codex-agents-dissolving-job-boundaries-img-04-adoption_gap_divergence.png)

但别急着画"人人都是程序员"的饼。同一个数据集里藏着另一面：

在同时使用 ChatGPT 和 Codex 的消费者中，不到 1% 用过 Codex。OpenAI 内部 99.8% 的 token 走 Codex。但在主流消费者那里，Agent 几乎是空气。

这不是同一个世界。

OpenAI 内部代表了 Agent 工具的"理想状态"：成本为零、培训充分、组织鼓励全天候使用、同事之间相互传染。一个 99 分位用户每天跑 60 小时以上的并行 Agent 任务。这是把 Agent 当操作系统用。而绝大多数普通用户，连 Agent 和 Chatbot 的区别都还没体验过。

我在想的是，这个鸿沟会怎么演化。

一种可能是暂时的——就像智能手机从极客到全民用了七八年。另一种可能是结构性的——Agent 使用的门槛不是技术上的，是认知上的。你得先学会"委托思维"：把任务描述清楚，给工具自主权，接受不确定性，事后验证而不是全程盯防。这跟"我问 AI 一个问题它回答我"的心理模型完全不同。

如果你从来没有体验过把一件完整的事扔给一个 Agent、关掉屏幕、一小时后回来看它做完——你很难理解这跟聊天的差别在哪。而只要你没理解这个差别，你就不会切过去。

## 所以这篇文章到底在说什么

OpenAI 的论文标题叫"The Shift to Agentic AI"，但我觉得真正的 shift 有两个。

第一个 shift 在工具层面——从"我问你答"到"我委托你做"。这已经在发生。

第二个 shift 在人身上——从"我的技能定义了我会用 AI 做什么"到"AI 的能力定义了我可以做什么"。这刚开始。

当法务部的人开始写代码时，不是法务这个职业消失了。是"法务"这个边界本身被重新画了一次——以前边界是"法律知识"，以后可能是"能不能把问题翻译成 Agent 能执行的描述"。这不是技能替代，是技能定义权的转移。

未来可能不是"用 Agent 的人替代不用 Agent 的人"。而是"Agent-native 的思考方式"和"把 Agent 当搜索增强"之间，拉开一条越来越宽的线。OpenAI 的数据里，这两拨人的行为差了几个数量级——未来几年级数差可能会变成"能做什么"的本质差。

*你怎么看 Agent 在自己的工作流中的位置——是"偶尔聊两句"的顾问，还是"扔整件事给它"的执行者？*

## 原文参考

> OpenAI (2026-06-25), "How agents are transforming work", <https://openai.com/index/how-agents-are-transforming-work/>
>
> 论文："The Shift to Agentic AI: Evidence from Codex", OpenAI / Columbia University / Duke University / University of Pennsylvania
>
> 相关报道：
>
> * Axios: "Codex agents are inching into the mainstream" (2026-06-25)
> * Virtualization Review: "Codex Study Points to Work's Agentic AI Future" (2026-06-25)
> * OpenAI: "Codex for every role, tool, and workflow" (2026-06-02)
