---
$schema: starlight
title: 4.8%的诊断率背后：AI重新分析罕见病基因组，挖出了什么？
description: 376个被专家放弃的罕见病病例，AI重新翻了一遍，找到了18个答案。数字不大，但每一个答案背后是一个等了多年的家庭。
date: 2026-06-19
category: ai-industry
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-19-ai-rare-disease-diagnosis-openai-o3-img-00-infographic-core-summary-1.png)

## 4.8%听起来不多，但

先说数字：376个病例，18个新诊断，4.8%的诊断率。

如果你是做AI产品的人，这个数字大概会让你皱眉——投入产出比太低了。但换一个视角：这376个病例不是"首次分析"。每一个都经过了商业测序管道、多学科团队讨论、甚至多年的跟踪随访。它们是被专家翻过无数遍、几乎宣判"无解"的案子。

在这种基础上再捞出4.8%，性质完全不同。这就像一个 cold case 档案室——每份卷宗都有人看过，但新证据不断积累，旧线索在新语境下可能指向不同的方向。

波士顿儿童医院 Manton 孤儿病研究中心的 Catherine Brownstein 说了一句很实在的话："考虑到这些病例已经被分析过很多次，这是一个巨大的数字，每一个都意味着一个家庭的答案。"

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-19-ai-rare-disease-diagnosis-openai-o3-img-01-cold-case-genomics-1.png)

## 不是AI在诊断，是AI在帮人"重新看"

这篇研究最值得细看的不是结果，是工作流设计。

研究团队没有让模型直接输出"这个病人得了什么病"。他们把 o3 Deep Research 当作一个"解释优先的推理层"——给它去标识化的临床表型描述、家系信息、过滤后的变异列表，要求它把临床特征、遗传模式、变异证据和科学文献编织成一个可审查的论证。

AI干的不是诊断，是"证据综合+假说生成"。它被要求show its work——展示推理过程，不只给结论。

然后呢？至少两名团队成员用 ACMG/AMP 框架逐例审查。分歧通过共识解决。模型输出永远不被视为诊断。一个发现要算数，必须经过专家审查、变异被分类为致病或可能致病、CLIA认证实验室确认、临床团队将结果反馈给家庭。

这条链路里，AI只占中间一小段。它加速的是"从分散数据中找到值得追的线索"这一步——而这恰恰是人类研究者的瓶颈。用 Brownstein 的话说："研究者只能花这么多时间在一个病例上。LLM不会累。"

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-19-ai-rare-disease-diagnosis-openai-o3-img-02-evidence-synthesis-workflow-1.png)

## Kyra 的 20 年

说完成绩，有个故事比数字更值得讲。

Kyra Benton 9岁时在空手道课上被母亲发现"下蹲不如以前低了"。足球训练变慢，走路开始踮脚。儿科医生找不到原因，转诊给专家。然后是近20年的检查、治疗、会诊——没有诊断。

13岁时她已经依赖呼吸机和轮椅。病情后来稳定了，但"稳定"意味着她接受了这就是生活的样子。

直到去年夏天，Manton 中心的研究员打来电话——"Hi，我们知道这已经是大约15年前的事了，但我们有一些消息给你。"AI重新分析她的基因组，锁定了 HSPB8 基因的移码变异，指向一种叫"肌原纤维肌病"的罕见病。蛋白质结构在肌纤维中异常堆积，导致进行性肌无力。

Kyra 对AI参与这件事的态度很诚实："坦白说，我不是特别支持AI的人。"但她接着说："在这种情况下，AI可以带来改变人生的突破。"

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-19-ai-rare-disease-diagnosis-openai-o3-img-03-kyra-diagnosis-timeline-1.png)

## 真正让我意外的

读完这篇研究，让我意外的地方跟AI能力无关——"信息孤岛"的问题比想象中严重。

18个诊断里，有7个是"重新发现"——诊断其实在别处已经确立过，但没有被记录在团队审查的记录中。有些变异在公共数据库里早就被标注为致病或可能致病了。

技术不行吗？行。是系统没连通。一个实验室的发现，另一个实验室看不到。一份病历里的线索，另一份病历里找不到。基因组测序已经不贵了，但信息的整合和同步仍然是个巨大的工程问题。

o3 Deep Research 在这里做的，就是"弥合信息断层"——它读得快、记得住、不会因为疲劳而漏看一行数据。但这也暴露了一个更根本的问题：我们需要的可能不只是更聪明的AI，而是一个能让已有知识流动起来的基础设施。

## 一个诚实的边界

研究团队反复强调：这不是AI诊断疾病的证据。模型没有诊断任何参与者。所有诊断都经过人类专家、实验室确认、临床验证流程。

但我想说一句可能不太"正确"的话：这种强调本身也是政治正确的产物。现实中，AI的推理质量已经到了能被专家采纳的程度——51个已知病例中恢复了48个正确基因和变异，置信度分数和正确诊断高度相关。

真正的问题是"我们准备好让AI在多大程度上参与了"。完全替代医生不现实，只当搜索引擎又浪费。4.8%的诊断率说明，AI在这个特定任务上已经能产出人类专家漏掉的价值。

研究团队的下一步计划是通过 OpenAI Foundation 的资助，开发一个"平台无关、低成本的遗传学AI助手"。目标不是让AI做诊断，而是让每个临床团队都能更快、更一致地分析罕见病病例。

*如果你是罕见病患者或家属，你会信任AI辅助的诊断流程吗？还是说，"AI参与"这件事本身就是一道需要跨越的信任门槛？*

## 原文参考

> OpenAI. Using AI to help physicians diagnose rare genetic diseases affecting children. June 18, 2026.
> <https://openai.com/index/diagnose-rare-childhood-diseases/>

> Perlo, J. AI helps Boston Children's Hospital diagnose rare diseases in kids. NBC News. June 18, 2026.
> <https://www.nbcnews.com/tech/innovation/ai-boston-childrens-hospital-diagnose-rare-diseases-kids-openai-rcna350387>

> LLM-Assisted Reanalysis of Unsolved Rare Disease Genomes. NEJM AI. June 18, 2026.
> <https://ai.nejm.org/doi/full/10.1056/AIcs2501343>
