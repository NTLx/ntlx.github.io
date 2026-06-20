---
$schema: starlight
title: 当你的研究代理在“马赛克式”泄露你的秘密
description: 你的AI代理每次搜索都无害，但连起来看，却能拼出你的商业机密。MosaicLeaks研究揭示了一个残酷真相：让代理更聪明，反而让它更危险。
date: 2026-06-18
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-18-mosaicleaks-privacy-deep-research-img-00-infographic-core-summary.png)

## 一个看似无害的查询，如何变成一场灾难

你公司的医疗保健AI代理正在处理一个常规任务：回答内部云迁移进度。为此，它发出了两个看似普通的网络搜索：“MediConn 2025年1月云迁移进度”和“大型医疗公司云安全披露2024年1月”。

单独看，这两个查询就像普通的网络搜索。但任何监控这些出站流量的人，都能把碎片拼起来：MediConn到2025年1月已将70%的基础设施迁移到云端——这个事实原本只存在于你的私有文档中。

ServiceNow最新研究《MosaicLeaks》把这叫做马赛克效应。深度研究代理正在成为企业的“第二大脑”，结合内部文档和外部搜索回答复杂问题。但它们的搜索行为本身，就在泄露秘密。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-18-mosaicleaks-privacy-deep-research-img-01-mosaic_effect_fragments.png)

## 训练的悖论：为什么让代理更好，反而让它更危险

MosaicLeaks最反直觉的发现：当你只针对任务性能训练代理时，隐私泄露不降反升。

基础模型的严格链成功率（每一步都答对的比例）是48.7%，隐私泄露率34.0%。只针对任务性能进行强化学习训练后，成功率飙升到59.3%——但泄露率也同步攀升到51.7%。

代理变得更聪明了，为什么反而更危险？

答案在于代理如何构建它的网络查询。为了更准确地找到答案，训练后的模型会在查询中打包更多上下文细节——比如具体的百分比“15%”、具体的年份“2024年”、具体的答案类型“报告年份”。这些细节让检索更精准，但也让观察者更容易从查询日志中推断出私有信息。

一个更具体的查询，对任务更好，对隐私更糟。这就是马赛克效应在训练中的体现：每个查询本身无害，但训练让代理学会了在每个查询中嵌入更多“马赛克碎片”。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-18-mosaicleaks-privacy-deep-research-img-02-performance_privacy_tradeoff.png)

## PA-DR：教代理“安全地搜索”

MosaicLeaks的解决方案不是让代理少搜索，而是教它如何搜索得更安全。他们提出了PA-DR（Privacy-Aware Deep Research），一个结合双奖励的强化学习框架。

第一重奖励是情境任务奖励。传统RL给整个轨迹一个分数，但一个包含30多次模型调用的轨迹，信用分配太模糊。PA-DR根据每个阶段的特定情境来评判：Plan阶段是否搜索了正确的文档源？Choose阶段是否选择了包含答案的文档？这种精细的信用分配让训练更高效。

第二重奖励是学习的隐私奖励。每当代理产生网络查询，一个分类器会评估两个风险：当前查询是否直接泄露私有信息？将它们添加到现有查询日志中是否会产生新的马赛克泄露？PA-DR惩罚两者中较大的一个，让隐私成本精确地落在最糟糕的决策上。

结果出乎意料：PA-DR让Qwen3-4B的成功率从48.7%提升到58.7%，同时将泄露率从34.0%压到9.9%——甚至低于未训练的基础模型。

更重要的是，PA-DR训练的代理实际上发出了*更多*网络查询，但这些查询丢掉了那些具有揭示性的细节。代理仍然找到了正确的公共文档，只是不再在查询文本中携带私有碎片。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-18-mosaicleaks-privacy-deep-research-img-03-pa_dr_reward_structure.png)

## 企业AI代理的隐私边界在哪里？

MosaicLeaks是一个受控基准，不是对部署系统的测量。企业文档是合成的，网络语料库是固定的，链只跨越三个公司上下文。现实世界会更复杂。

但它的核心洞察很清晰：你不能通过提示来实现隐私，你必须通过训练来实现。告诉代理“要小心”几乎不起作用，而奖励它“如何构建每个查询”可以将泄露减少3倍以上。

这引出一个更根本的问题：当企业越来越多地部署能够访问敏感数据的AI代理时，我们应该如何定义“隐私边界”？是查询级别的，还是轨迹级别的？是训练时的约束，还是运行时的监控？

MosaicLeaks的研究表明，隐私不是代理行为的一个附加属性，而是需要从训练开始就内置的核心约束。代理的外部行为——那些看似无害的网络搜索——本身就是信息泄露的渠道。

下次当你部署一个能访问内部文档的AI代理时，不妨想想：它的每一次搜索，都在说什么？

*当你的AI代理在“马赛克式”泄露你的秘密时，你会选择限制它的能力，还是投资于更聪明的训练？*

## 原文参考

> Gurung, A., Gella, S., Drouin, A., Laradji, I. H., Taslakian, P., & Pardinas, R. (2026). MosaicLeaks: Privacy Risks in Querying-in-the-Open for Deep Research Agents. arXiv:2605.30727. https://arxiv.org/abs/2605.30727
> 原文链接：https://huggingface.co/blog/ServiceNow/mosaicleaks
