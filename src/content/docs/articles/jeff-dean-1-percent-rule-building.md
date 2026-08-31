---
$schema: starlight
title: Jeff Dean 的 1% 规则：先选对问题，再把 AI 变成反馈机器
description: Jeff Dean 的启发不是做更强的模型，而是找到通用模型暂时失败、用户真正需要、又能建立反馈闭环的问题。
date: 2026-08-31
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-31-jeff-dean-1-percent-rule-building-img-00-infographic-core-summary.png)

这场访谈从 2001 年的 Google 搜索讲到能运行数周的 Agent，又拐到 TPU、context engineering、创业和职业选择。题目跨度很大，但这些话题能被串在一起，靠的不是“AI”这个大词，而是一种很朴素的工程直觉：先找瓶颈，再问这个问题是否值得被做成一条可测量的反馈回路。

我读完 [Root Access 对 Jeff Dean 的访谈](https://www.ycrootaccess.com/p/jeff-dean-the-1-rule-for-building)，留下的不是一份创业建议清单，而是一张筛选问题的草图。Jeff 说，两三个人依然可能在某个领域胜过前沿实验室；前提是，他们没有去追逐一个通用模型已经做得七七八八的功能，而是选中了一个模型暂时做不好、又确实值得解决的问题。

## 先问瓶颈，不要先问模型

访谈里最有力量的部分，反而是两段旧故事。

2001 年，Jeff Dean 和 Sanjay Ghemawat 发现，Google 的搜索索引最终可以放进机器的内存，于是把原本依赖硬盘的搜索版本在几天内改成了内存版本。后来他们又做了一次“餐巾纸计算”：如果语音识别真的好用到每个用户每天都愿意说上几分钟，现有 CPU 服务器可能根本扛不住。结果是 TPU 这条专用硬件路线。

这两个故事的重点不是“天才几天做出大系统”，而是他们先算了一个量级：问题究竟卡在算法、硬盘、CPU、内存，还是用户使用量即将上来？[MapReduce 论文](https://research.google/pubs/mapreduce-simplified-data-processing-on-large-clusters/)后来把并行、故障和机器间通信藏进运行时抽象，[TPU 论文](https://research.google/pubs/in-datacenter-performance-analysis-of-a-tensor-processing-unit/)则展示了围绕神经网络推理做专用 ASIC 的收益。两者都在做同一件事：把最常出现、最限制系统的部分单独拎出来。

今天很多 AI 产品的问题也许只是被“模型”这个词盖住了。回答慢，可能是数据搬运太多；结果不稳，可能是上下文没有装配好；Agent 总在循环，可能是工具接口和停止条件有问题；实验没有进展，可能是评估一次就要跑一整夜。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-31-jeff-dean-1-percent-rule-building-img-01-napkin_math_bottleneck_shift.png)

所以我现在看到“模型能力不够”这句话，会先追问一句：不够的是哪一层？如果连瓶颈都没有定位，就开始换模型、加 token、塞更多 Agent，往往只是把成本放大，而不是把问题缩小。

## “1%”不是失败率，而是问题筛选器

Jeff 给创业者的建议很具体：拿一个真实问题去测当前通用模型。如果它成功率接近 20%，这个方向未必好，因为能力已经露头，规模、数据和训练很可能会把剩下的部分补上；如果成功率只有 0–1%，反而值得进一步调查。

这句话很容易被误读成“模型不会的事就是机会”。我不这么看。0–1% 只是一盏探照灯，它提醒你去检查问题的形状，而不是替你完成判断。

一个值得继续下注的问题，至少还要满足四件事：

1. 解决它对某类人真的重要，而不是只因为 demo 很难看起来有趣。
2. 你能接触到通用模型没有的个人数据、行业数据、工具权限或工作现场。
3. 结果有相对清楚的评估方式，能知道一次尝试是进步还是自我安慰。
4. 优势有机会撑过前沿模型的下一轮升级，而不是只剩一个短暂的 prompt 差异。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-31-jeff-dean-1-percent-rule-building-img-02-one_percent_problem_shape.png)

这也是我对“垂直 Agent”最想补上的限制。模型失败可能来自数据缺失，也可能来自需求本来就不成立；专用模型可能提高准确率，也可能只是把一个没人付费的问题做得更精致。真正有价值的 1%，是“模型目前做不到”与“团队有办法把它做成可靠系统”的交集。

## 把经验写成规格，才有资格调度 Agent

访谈谈到 context engineering 时，Jeff 没有把它说成更复杂的 prompt。他更关心模型身边的东西：检索什么资料，调用哪些工具，如何拆任务，怎样把过去结果放回当前上下文。

他和 Sanjay 做性能优化时，甚至把自己平时测量基准、修改代码、重新运行和比较结果的步骤写成了 skill。配合他们公开的 [Performance Hints](https://abseil.io/fast/hints.html)，这件事的含义很清楚：专家经验只有被写成可调用的流程，才有可能交给 Agent 反复执行；只有执行结果被测量，流程才有可能继续变好。

我之前在《[1.5 万 Stars 背后：Google 揭秘 Agent Skills 的工业化构建与治理真相](https://ntlx.github.io/articles/google-agent-skills-behind-the-scenes)》里关注过 Skill 的评估和治理，在《[Anthropic 这篇 skills 文章，真正写的是组织接口](https://ntlx.github.io/articles/claude-code-skills-organizational-interface)》里写过组织经验如何变成 Agent 能调用的接口。Jeff 的例子把这两层落到了一个很小的动作上：先测基线，再改一个地方，再测一次，不要让“感觉更好”冒充结果。

这和我自己的双线发布流程有一个直接交接点。一篇文章的正文可以很快生成，图片也可以很快生成，但它仍然可能缺少 canonical sourceUrl、引用图片可能只在本地存在、微信 HTML 里可能残留普通锚点，或者博客和微信误用了对方的图片路径。只有把这些要求写成明确的检查项，让失败返回到当前阶段，内容才算交付。

这类约束没有让 Agent 变笨，反而把它的自由留在正确的位置：它可以决定怎样完成一个目标，但不能自行把“看起来完成”改写成“已经通过验收”。规格约束目标，skill 约束过程，evaluator 约束反馈；三者缺一，长任务就很容易变成一串无法复盘的尝试。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-31-jeff-dean-1-percent-rule-building-img-03-spec_skill_feedback_loop.png)

## 自动化最怕没有评估器

Jeff 认为 Agent 运行数天或数周是可行的，但这件事最容易被“运行时间”这个指标带偏。任务一旦离开模型熟悉的分布，错误会逐步累积；如果中间没有评估、回滚和重新选择路径，跑得更久只意味着系统有更多时间把错误做完整。

多 Agent 搜索能缓解这个问题：让不同 Agent 尝试不同路径，再由另一个 Agent 或评估器筛选。但它并没有消除判断，只是把判断从“一个答案”搬到了“哪些候选值得继续”。没有可靠评估器，多几个 Agent 不是更多智慧，而是更多未经核实的噪声。

访谈中还有一个很值得注意的科学计算例子：一个原本可能需要一晚的高成本模拟，被训练成近似验证器后，据 Jeff 转述，速度提高了约 30 万倍，同时保持接近的准确性。这个数字我不会当成普遍性能承诺，但它点出了自动实验真正的杠杆：不是让 Agent 更勤奋地重复实验，而是把验证本身变得足够快，快到可以容纳更多假设。

Google DeepMind 的 [AlphaEvolve](https://deepmind.google/blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/) 也展示了相似结构：模型提出程序，系统运行并评分，再把更有希望的方案送回下一轮。它的关键不在“模型替人想出了答案”，而在于问题可以被写成一条“提出—实现—评估—保留”的回路。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-31-jeff-dean-1-percent-rule-building-img-04-human_steering_evaluator.png)

这让我重新理解“人的价值上移”这句话。人并不是只剩下写 prompt，甚至也不只是负责最后点一下批准。人需要决定目标是否值得，评估器是否测到了真正重要的东西，异常结果意味着突破还是测量错误，以及什么时候应该停止。Agent 可以扩大搜索，不能替你决定搜索什么。

## 给自己留一张问题账本

如果把这场访谈改写成一个今天就能使用的工具，我会做一张问题账本，而不是再收集一套“AI 创业方向”。每个候选问题至少记录下面几项：

| 字段 | 要问的问题 |
| --- | --- |
| 问题价值 | 如果最好结果出现，谁的工作或生活会明显变好？ |
| 模型基线 | 用代表性样本测试后，模型是完全失败、偶尔成功，还是已经能完成一部分？ |
| 缺口来源 | 缺的是数据、工具、上下文、专用模型，还是产品流程？ |
| 评估器 | 什么证据能让我保留一次尝试，什么证据会让我放弃？ |
| 回路速度 | 从提出假设到拿到可信反馈，需要几分钟、几小时还是几周？ |
| 耐久性 | 前沿模型在 6 到 12 个月后变强，这个优势还剩下什么？ |
| 停止条件 | 哪个信号出现时，我会承认这个方向不值得继续？ |

我不会把它当成创业评分表。它更像是给“品味”增加样本。Jeff 提到，可以先写下自己认为未来 12 个月重要的事情，等一年后回看哪些判断兑现、哪些没有发生。判断力不是凭空长出来的，它需要被记录，也需要被现实反复驳回。

这可能是我从 Jeff Dean 身上带走的最实用的一点：所谓 1% 机会，不是押中一个神奇方向，而是愿意在动手之前多花一点时间确认问题，在自动化开始之后持续测量结果，在结果不值得时拥有停手的勇气。

你现在最想交给 Agent 的那个问题，通用模型的实际成功率是多少？如果它已经能完成 20% 的工作，你准备靠什么让剩下的部分不会在下一次模型升级里消失？

## 延伸阅读

- [《1.5 万 Stars 背后：Google 揭秘 Agent Skills 的工业化构建与治理真相》](https://ntlx.github.io/articles/google-agent-skills-behind-the-scenes)
- [《Anthropic 这篇 skills 文章，真正写的是组织接口》](https://ntlx.github.io/articles/claude-code-skills-organizational-interface)

## 参考资料

- [Root Access：Jeff Dean: The 1% Rule for Building in AI](https://www.ycrootaccess.com/p/jeff-dean-the-1-rule-for-building)
- [YouTube：Jeff Dean at Startup School 2026](https://youtu.be/CxXgV54KzpQ)
- [Google Research：MapReduce: Simplified Data Processing on Large Clusters](https://research.google/pubs/mapreduce-simplified-data-processing-on-large-clusters/)
- [Google Research：In-Datacenter Performance Analysis of a Tensor Processing Unit](https://research.google/pubs/in-datacenter-performance-analysis-of-a-tensor-processing-unit/)
- [Abseil：Performance Hints](https://abseil.io/fast/hints.html)
- [Google DeepMind：AlphaEvolve](https://deepmind.google/blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/)
- [arXiv：Distilling the Knowledge in a Neural Network](https://arxiv.org/abs/1503.02531)
