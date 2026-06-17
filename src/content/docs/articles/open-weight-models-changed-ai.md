---
$schema: starlight
title: 开权模型真正打开的是试错路径
description: 开权模型没有把 AI 变成真正开源，却把研发里的试错路径从少数实验室的保险柜里搬到了公共路面上。
date: 2026-06-17
category: ai-models
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-17-open-weight-models-changed-ai-img-00-infographic-core-summary.png)

## 我一开始看错了开放

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-17-open-weight-models-changed-ai-img-01-public-experiment-loop.png)

ByteByteGo 这篇文章最打动我的地方，不是它把 MoE、MLA、稀疏注意力讲清楚了。那些当然重要，但更关键的是它换了一个视角：open-weight 改变的不是“模型能不能下载”这么简单，而是 AI 研发的试错路径。

我以前也容易把开放理解成权限问题。能不能本地跑？能不能商用？能不能微调？这些问题都对，但它们还停在使用者这一端。文章真正指出的是另一端：当一个团队把权重和技术报告放出来，后面的团队不只是多了一个模型可用，而是多了一份可拆的工程痕迹。

闭源模型像一座黑盒工厂。你看到产能，看到产品质量，也许还能看到价格，但看不到里面的工序。开权模型没有把工厂蓝图全给你。训练数据、完整代码、很多失败实验仍然关着。可它至少把一部分机器拆开摆在门口：参数规模、激活比例、注意力方案、训练稳定性问题、后训练管线。后来的人不用从矿石开始炼铁。

这就是我读完之后最想留住的一句话：开权没有把秘密清零，它先把重复试错的成本打了下来。

## MoE 让竞争变成两本账

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-17-open-weight-models-changed-ai-img-02-total-active-parameter-ledger.png)

文章里反复出现两个数字：总参数和活跃参数。这个区分很小，却像一把钥匙。DeepSeek-V3 是 671B 总参数、37B 每 token 激活参数；Kimi K2 是万亿级总参数、约 32B 激活参数；Qwen3-235B-A22B 是 235B 总参数、22B 激活参数。只看总参数，Kimi K2 像一头巨兽。看活跃参数，它每一步真正动起来的部分并没有那么夸张。

这让我想到操作系统里的虚拟内存。程序“拥有”的地址空间很大，但每次真正落到物理内存和 CPU 上的，只是当前那几页。MoE 也是类似的思路：知识容量可以摊在很多专家里，每个 token 只调度一小部分专家参与计算。

所以开权生态能跑快，并不只是因为大家愿意分享。还有一个更硬的原因：主流架构开始收敛。大家大体都在 MoE 这条路上，于是差异被压到几个具体旋钮里：KV-cache 怎么省，专家数量怎么配，shared expert 要不要留，后训练怎么做。

这对后来者很残酷，也很公平。你不能再靠一句“大模型很复杂”挡住讨论。复杂还在，但复杂被拆成了可比较的工程选择。DeepSeek 的 MLA、Kimi K2 的 MuonClip、GLM-5 的 Slime，都是在这些选择上往前拧了一下。

## 但这不等于开源

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-17-open-weight-models-changed-ai-img-03-openness-ladder-weights-source-data.png)

我不喜欢把这些模型直接叫开源。不是咬文嚼字，而是这个词会误导判断。

传统软件里的开源，至少意味着你能看到源代码，能修改，能重新构建。到了模型这里，权重像一个编译好的巨大二进制。你能运行它，能微调它，能研究它的行为；但如果训练数据、训练代码、数据配比、清洗规则、失败记录都不公开，你很难从头复现同一个东西。

OSI 的 Open Source AI Definition 也把问题说得更硬：要让人真正研究和修改一个 AI 系统，只给权重不够，还要有产生这些参数所需的数据说明和代码。按这个标准，很多所谓“open-source model”更准确地说是 open-weight model。

这不是贬低。open-weight 已经很有价值。它让模型离开 API 围墙，进入本地部署、私有化、微调、蒸馏和二次训练的世界。只是我们要分清楚两件事：能拿来用，不等于能知道它为什么变成这样；能继续改，不等于能从第一天重新造出来。

这个边界越清楚，反而越能看见它的力量。open-weight 没有承诺乌托邦。它只是把一段关键中间态公开了。可在一个迭代速度极快的领域，中间态已经足够改变后面很多人的路线。

## 真正的变化是学习回路变短

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-17-open-weight-models-changed-ai-img-04-borrow-build-timeline.png)

ByteByteGo 用 DeepSeek、Kimi K2、GLM-5 串出一条线：DeepSeek-V3 把 MLA 和 MoE 设计公开；Kimi K2 参考这个方向扩到万亿参数，遇到训练不稳定，就做了 MuonClip；GLM-5 又把 DeepSeek Sparse Attention 和自己的 Slime 异步强化学习框架放进后训练管线。

我不确定这条线里每个版本号都会经得起几年后的回看。模型发布节奏太快，今天的“前沿”很快会变成脚注。可那个模式大概率会留下来：一个团队把局部创新露出来，另一个团队把它当作起点，踩出新的坑，再把补丁写进报告。

闭源实验室当然没有输。Epoch AI 的分析还说，2026 年以来最强 open-weight 模型平均仍落后闭源前沿约 4 个月。闭源公司有产品分发、数据闭环、安全控制和组织内积累，它们不是站着不动。

但开权生态有另一种压力：它把学习从组织内部缓存，变成了公共缓存。一个团队的报告，会变成另一个团队的起跑线。一个团队踩过的训练崩溃，可能变成下一个优化器。一个架构选择不再只是论文里的想法，而会带着权重、指标和部署经验一起传播。

如果说闭源模型拼的是“谁能把秘密保管得更久”，开权模型拼的就是“谁能把公开线索消化得更快”。这两种竞争会并存。只是从现在开始，任何一个实验室都很难再假装自己是在无人区里独自前进。

*你更愿意把关键 AI 能力托付给闭源 API，还是托付给能被拆开研究的开权模型？*

## 原文参考

> ByteByteGo: How Open-Weight Models Changed the AI Landscape\
> <https://blog.bytebytego.com/p/how-open-weight-models-changed-the>

> DeepSeek-V3 Technical Report\
> <https://arxiv.org/html/2412.19437v1>

> Kimi K2: Open Agentic Intelligence\
> <https://arxiv.org/html/2507.20534v1>

> GLM-5: from Vibe Coding to Agentic Engineering\
> <https://arxiv.org/html/2602.15763v1>

> Qwen3 Technical Report\
> <https://arxiv.org/html/2505.09388v1>

> Qwen3: Think Deeper, Act Faster\
> <https://qwenlm.github.io/blog/qwen3/>

> Meta AI: The Llama 4 herd\
> <https://ai.meta.com/blog/llama-4-multimodal-intelligence/>

> OSI: The Open Source AI Definition 1.0\
> <https://opensource.org/ai/open-source-ai-definition>

> Epoch AI: Open models lag state-of-the-art closed models by 4 months\
> <https://epoch.ai/data-insights/open-closed-eci-gap>

> Stanford HAI: Beyond DeepSeek: China's Diverse Open-Weight AI Ecosystem and Its Policy Implications\
> <https://hai.stanford.edu/policy/beyond-deepseek-chinas-diverse-open-weight-ecosystem-and-its-policy-implications>
