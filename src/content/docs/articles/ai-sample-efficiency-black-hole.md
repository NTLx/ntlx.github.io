---
$schema: starlight
title: AI 的数据黑洞：效率差距背后的真正问题
description: AI 用百万倍数据才学会人类几小时就掌握的技能，但更可怕的是——我们可能永远追不上这个差距。
date: 2026-06-20
category: ai-industry
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-20-ai-sample-efficiency-black-hole-img-00-infographic-core-summary.png)

## AI 的能力是"装"出来的

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-20-ai-sample-efficiency-black-hole-img-01-sample_efficiency_gap.png)

Dwarkesh Patel 最近写了一篇文章，标题叫"AI 中心的数据黑洞"。核心观点只有一句：我们看到的 AI 能力，来自它吞掉的海量数据，不是它真的"学会"了什么。

这个判断乍听之下有点冒犯。你花了几千美元订阅的 GPT，竟然只是个"数据黑洞"？

但仔细想，他说的是对的。我们定义"智能"的一种方式就是样本效率：在某个领域需要看多少数据才能流畅运作。人类从出生到成年，大约看到 2 亿 token 的语言数据。前沿模型呢？10 万亿到 100 万亿 token。差距接近百万倍。

AI 根本不是在"学"，而是在"背"。背得足够多，碰到类似场景就能模仿。但如果你让它面对一个全新领域、没见过的模式——它几乎无能为力。

## RL 的本质是"暴力出数据"

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-20-ai-sample-efficiency-black-hole-img-02-rl_synthetic_data.png)

关于 RL 的重新定义是文章中最锋利的一点。Dwarkesh 把 RL（强化学习）描述为一种合成数据生成方式：你用大量计算对抗一个验证器，找到"正确"的轨迹，然后训练模型去预测这些轨迹。

换句话说，RL 不是在教 AI "思考"，而是在教它"复制正确答案"。GRPO（Group Relative Policy Optimization）让模型对每个任务生成数百到数千个 rollout——人类学生做一两遍的题，AI 要做几千遍。

这解释了一个长期困惑：为什么 AI 在常见任务上表现不错，但碰到边缘情况就崩？因为训练数据覆盖的是"常见"，不是"边缘"。边缘场景在训练分布里占比太小，模型根本没记住足够多的样本。

## 开源追赶的假象

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-20-ai-sample-efficiency-black-hole-img-03-open_close_gap.png)

Dwarkesh 引用了 Epoch AI 的数据：开源模型仅落后前沿闭源模型约 4 个月。他据此论证"数据才是真正的进步驱动力，而数据容易从公共 API 蒸馏"。

这个推论听起来很顺，但我觉得有漏洞。

4 个月的差距可能被低估了。Epoch 自己也承认，开源模型在私有基准上表现更差，因为它们更激进地刷公开基准。

"数据可以蒸馏"这个说法也要打个问号。Anthropic 指控 DeepSeek、Moonshot、MiniMax 从 Claude 输出中蒸馏——但蒸馏的是"能力"还是"数据分布"？如果前沿模型的能力依赖于某个特定的数据分布，而这个分布恰好被蒸馏到了小模型里，那这不叫"追赶"，叫"复制"。真正需要全新推理模式的任务，蒸馏可能碰都碰不到。

更根本的问题是：开源模型在什么维度上追赶？如果只是基准测试追平，那"4 个月差距"的实际意义有限。开源模型能不能做到闭源模型做不到的事？目前看，还不能。

## 大脑不是参数的堆砌

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-20-ai-sample-efficiency-black-hole-img-04-brain_vs_parameters.png)

文章中最让我意外的一段是关于"进化作为预训练"的反驳。

常见的反驳是：人类有几十亿年进化的预训练，所以不能只看一生的数据量。Dwarkesh 的回应很精准：人类基因组只有 3GB，其中 1-2% 编码蛋白质。这个容量根本装不下相当于前沿模型参数的信息。

更致命的反驳是：就算进化真的提供了某种预训练，它解释不了边际能力为什么需要那么多数据。人类受过教育后，不需要 100 个教授就能学一门新编程语言。但 AI（即使已经预训练过）需要。

这背后是一个更大的问题：我们可能在用错误的类比理解 AI。把 AI 当作"缩小版人类"来比较样本效率，可能从一开始就错了。人类大脑的 100 万亿突触和模型的 5 万亿参数，根本不是同一种东西。

## 那么，效率差距重要吗？

Dwarkesh 自己也承认：对于白领工作自动化，样本效率差距可能不那么重要。训练成本可以分摊到数十亿次推理会话中——哪怕训练效率比人类低百万倍，只要推理时能产生价值，商业上就划算。

但对于"自动化 AI 研究"这个终极目标，样本效率差距是致命的。

实验室的计划是先自动化 AI 研究，再让自动化 AI 研究员解决样本效率问题。但这里有个绕不开的矛盾：AI 在新领域学习效率低，AI 研究偏偏就是不断面对新领域。

Dwarkesh 把这个问题留到了"未来文章"。我觉得这恰恰是整个讨论最关键的转折。如果样本效率差距真的有百万倍，而 AI 研究需要处理的恰恰是分布外问题，那"先自动化研究，再解决效率"的路线可能走不通。

## 数据黑洞的真正含义

回到那个隐喻：AI 是一个星系，中心是数据黑洞。

这个比喻的危险在于，它暗示只要黑洞足够大，星系就能运转。但现实可能是：黑洞越大，事件视界越远，我们能观察到的"能力"就越像是幻觉。

真正的问题不是 AI 能处理多少数据，而是它在没有足够数据时能做什么。目前的答案是：几乎什么都做不了。

我们对"AI 能力"的评估可能从根本上就是错的。基准测试衡量的是"见过足够多数据后的表现"，不是"在新场景中的泛化能力"。一个在 MMLU 上得分 90% 的模型，碰到一个全新领域的推理任务，可能连 20% 都达不到。

如果这个判断成立，我们对 AI 进步的很多乐观预期都需要重新审视。不是说 AI 没用，它在"已知分布"内确实强大。但我们可能高估了它在"未知分布"中的能力，人类智能的真正价值恰恰在后者。

*你觉得 AI 的样本效率差距是可解决的技术问题，还是当前架构的根本局限？*

## 原文参考

> Dwarkesh Patel, "The data black hole at the center of AI"
> <https://www.dwarkesh.com/p/the-sample-efficiency-black-hole-2>
>
> Epoch AI, "Open models lag state-of-the-art closed models by 4 months"
> <https://epoch.ai/data-insights/open-closed-eci-gap>
>
> Epoch AI, "Keeping up with the GPTs"
> <https://epoch.ai/gradient-updates/keeping-up-with-the-gpts>
>
> Dwarkesh Patel, "Will scaling work?"
> <https://www.dwarkesh.com/p/will-scaling-work>
>
> Dwarkesh Patel, "More open questions about AI"
> <https://www.dwarkesh.com/p/what-ive-been-thinking-april-27>
