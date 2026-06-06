---
$schema: starlight
title: 世界模型最值钱的一层，不是画面，是状态
description: Fei-Fei Li 这篇 taxonomy 最值钱的，不是又画了一个 AGI 大饼，而是把“世界模型”重新钉回 POMDP：会出图不等于懂世界，能给出可计算状态的模拟器才是硬骨头。
date: 2026-06-06
category: ai-industry
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-06-world-models-state-renderers-img-00-infographic-core-summary.png)

我读完 Fei-Fei Li 这篇《A Functional Taxonomy of World Models》，脑子里留下来的，不是 World Labs 的品牌词，也不是“空间智能会改变世界”这类大叙事，而是一张很老的图。

就是强化学习课本里那张图：agent 做出 action，action 改变 state，agent 只能通过 observation 间接看到 state，然后再做下一步 action。文章最值钱的地方，不是把“world model”说得更玄，而是把这个已经快被营销语言糊掉的词，重新钉回这条朴素的链路上。

## 她做的不是扩词，是收词

现在“world model”这个词几乎已经被叫坏了。会生成视频的，叫 world model。能在游戏里走两步的，叫 world model。做机器人规划的，也叫 world model。一个词同时指向像素、几何、物理、动作，最后就等于什么都能装，什么都说不清。

Fei-Fei Li 这篇文章最清醒的动作，是没有继续往上发明定义，而是往下拆功能。她把今天被混称为 world model 的东西切成三类：renderer 输出 observation，也就是你眼睛看到的画面；simulator 输出 state，也就是一个系统和另一个系统都能计算、检查、操作的世界状态；planner 输出 action，也就是“下一步该做什么”。

这个切法一下把讨论拉实了。以后再看一个模型，不该先问“它算不算 world model”，而该先问：**它到底输出什么。** 如果它输出的是漂亮像素，那它再惊艳，也主要还是 renderer。它可以很值钱，但它值钱的地方是可视化，不是理解。这个区分一旦立住，很多本来很吵的争论会突然变安静，因为问题终于被问对了。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-06-world-models-state-renderers-img-01-output_taxonomy.png)

## 真正值钱的是那层 state

我尤其认同她把 simulator 抬到中心位置。

原因不复杂。rendering 解决的是“看起来像”，planning 解决的是“该怎么动”，但只有 state 这一层在负责“世界现在到底是什么样”。没有这层，前两者都容易飘。一个视频模型可以把火焰做得很逼真，但它不知道燃烧是否守恒；一个机器人 planner 可以给出一串动作，但如果背后的世界状态是糊的，它的动作就只能建立在猜测上。

这也是为什么我觉得她最重要的一句潜台词其实是：**会出图，不等于懂世界。** 过去两年，AI 行业最容易犯的错误，就是把输出质量误认成内部理解。画面像了，就以为模型会了；视频流畅了，就以为物理也在里面了；agent 跑通 demo 了，就以为它已经有了稳定的世界表征。Fei-Fei Li 这篇文章的价值，在于它把“像不像”和“是不是”硬拆开了。

如果把这三类能力放到工程语言里，我会更愿意这样理解：renderer 像前端，planner 像控制器，而 simulator 更像真正的数据模型。前两层都很显眼，但真正决定系统能不能承受复杂后果的，往往是中间那层结构化表示。建筑设计、机器人训练、自动驾驶、科学模拟，这些高风险场景要的从来不是“足够像”，而是“足够真，真到能算后果”。

这也解释了为什么她反复强调 simulator 是最被低估、但也最关键的一层。因为它最不性感。它不像视频模型那样一眼惊艳，也不像 agent 那样容易讲故事。它要求的是几何、物理、动态一致性，是最硬、最慢、最难被普通人感知的那部分进展。可偏偏只有这部分，才决定 AI 能不能真的从“生成内容”走到“进入世界”。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-06-world-models-state-renderers-img-02-state_loop.png)

## 说对了重点，不等于很快做得出来

但我读这篇文章时，也有一个很明显的保留。

我相信她把问题指对了，不代表我相信这个问题很快能被解出来。

文章自己其实已经承认了最难的几件事：3D 数据远比互联网视频稀缺，sim-to-real gap 还在，AI 生成的几何结构可能“看着对”，但一进物理引擎就自相交、比例错误、动力学失真。外部评论里，MIT 的 Vincent Sitzmann 也说得很直接：世界模型在娱乐和预可视化上已经露出一点产品价值，但一旦走到机器人、科学、教育，问题就不再是 realism，而是 faithfulness。看起来像不够，必须在因果和动力学上也站得住。

这恰恰让我更相信 simulator 是硬骨头。因为凡是 renderer 已经做得不错的地方，市场会天然高估“再往前一点就够了”；凡是 planner demo 很炫的地方，市场会天然高估“只差一点工程化”。可 simulator 不是再往前一点。它要求的是另一种层级的正确性。不是把像素变得更稳，而是把世界变成可以承载推理、承载交互、承载失败后果的对象。

所以我对 World Labs 现在的判断反而没有那么浪漫。Marble 很有意思，Genie 3 也很有意思，但它们今天更像是在 renderer 和 simulator 之间打通一些通道，而不是已经把“统一世界模型”做出来了。把 taxonomy 说清楚，是一回事。让 taxonomy 里的 simulator 真正落地成可靠基础设施，是另一回事。后者还远没到可以靠愿景兜底的时候。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-06-world-models-state-renderers-img-03-simulation_gap.png)

## 但讨论终于回到了该回的地方

即便如此，我还是觉得这篇文章重要。因为行业这两年最稀缺的，未必是新概念，而是把概念缩回工程边界的能力。

Fei-Fei Li 这篇 taxonomy 最好的地方，就是它没有继续靠“更大、更统一、更接近 AGI”去制造兴奋，而是做了一件更难也更有用的事：它逼大家承认，同样叫 world model 的东西，输出层根本不是一回事。只要这一点被承认，后面的判断就会干净很多。哪些是 renderer 生意，哪些是 simulator 基础设施，哪些是 planner 幻觉，哪些地方只是 demo 先跑到了叙事前面，都会更容易分辨。

我读完之后最强的感受反而很朴素：世界模型的下一阶段，真正稀缺的不是想象力，而是**可追责的中间层**。谁能把 observation 和 action 之间那层 state 做厚、做真、做得能被别的系统接住，谁才更接近这场竞争里最难复制的部分。

会说，会画，会演，已经不算稀缺了。能对世界后果负责，才算。

*如果你今天看一个号称“world model”的产品，你会先追问它输出的是画面、状态，还是动作？为什么？*

## 原文参考

> Fei-Fei Li. **A Functional Taxonomy of World Models**. X, Jun 4 2026 (Beijing time).
> <https://x.com/drfeifei/status/2062247238143996275>

> World Labs. **A Functional Taxonomy of World Models**. Jun 3 2026.
> <https://www.worldlabs.ai/blog/taxonomy-of-world-models>

> Fei-Fei Li. **From Words to Worlds: Spatial Intelligence is AI’s Next Frontier**. Nov 10 2025.
> <https://www.worldlabs.ai/blog/from-words-to-worlds>

> World Labs. **Marble: A Multimodal World Model**. Nov 12 2025.
> <https://www.worldlabs.ai/blog/marble-world-model>

> Google DeepMind. **Genie 3**.
> <https://deepmind.google/models/genie/>

> TIME. **Inside Fei-Fei Li’s Plan to Build AI-Powered Virtual Worlds**. Dec 9 2025.
> <https://time.com/7339513/ai-fei-fei-li-virtual-worlds/>
