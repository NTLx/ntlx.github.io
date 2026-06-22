---
$schema: starlight
title: 你的 Prompt 调不动了，可能问题根本不在 Prompt 上
description: 多步 LLM pipeline 出了错，你改的 prompt 可能压根不是病因。Cisco 的 FAPO 框架把失败归因到具体步骤，83% 的对比赢了——但真正值得看的不是数据，是它暴露的那个前提。
date: 2026-06-22
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-22-fapo-pipeline-aware-prompt-optimization-img-00-infographic-core-summary.png)

## 当 Prompt 工程变成盲调

你的 pipeline 有四步：检索、提取事实、推理、格式化答案。跑完评测，准确率 40%。

你改 prompt。再跑。38%。再改。43%。再改。41%。

这跟调收音机旋钮有什么本质区别？

Cisco Foundation AI 上周开源了一个叫 FAPO 的框架——Fully Automated Prompt Optimization。它说的事很简单：多步 pipeline 出错时，你*以为*问题在 prompt，但问题可能在检索返回了空内容、格式化步骤多加了废话、或者前一步的坏输出把后面全带崩了。你改 prompt 改了半天，改的不是病因。

这件事我见过太多次。团队花两周调 prompt 措辞，最后发现 RAG 检索根本没拿到相关文档。FAPO 把这个「改错地方」的问题正式化了。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-22-fapo-pipeline-aware-prompt-optimization-img-01-pipeline_step_attribution.png)

## 把 Pipeline 变成可检查的工作流

FAPO 的做法分两层。

第一层：让 pipeline 每一步都吐出命名输出。不是黑箱跑完给你一个最终答案，而是检索的结果、提取的事实、推理的中间链、格式化的最终文本——每一步都可查。这个想法不新。软件工程里叫 observability，日志、trace、span，做了二十年。

但第二层才是 FAPO 真正做的事：拿每一步的输出做故障归因。它把失败分成四类——检索失败（返回空或不相关内容）、级联失败（早期空输出带崩下游）、格式失败（正确答案在输出里但被多余文本裹住）、推理失败（输入都对但模型推错了）。前两类是*结构问题*，改 prompt 没用。后两类才是 prompt 能修的。

也就是说，FAPO 先做诊断，再动手。

大部分 prompt 优化工具——包括 FAPO 的对比基线 GEPA，一个用进化搜索调 prompt 的方法——都跳过了这一步。它们把所有失败当作「prompt 不够好」来处理，然后用遗传算法去搜更好的措辞。如果问题真在 prompt 上，这能 work。如果不在，你在用螺丝刀拧钉子。

## 三级递进：先用最便宜的方案

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-22-fapo-pipeline-aware-prompt-optimization-img-03-escalation_strategy.png)

FAPO 把优化分三级。第一级改 prompt 文本，成本最低。第二级改配置参数，比如检索条数从 7 调到 10，temperature 从 1.0 降到 0.5。第三级改链结构，比如加一个自反思节点，或者把线性链换成 ReAct 模式。

关键是顺序。它先试最便宜的，试到归因显示 prompt 已经修不动了，才升级。

这个策略我觉得是整篇论文最值得拿走的东西。「先试便宜的」本身没什么稀奇，工程常识而已。但 FAPO 用归因数据来决定*什么时候该升级*，这一点做得好。多跳 QA 链跑到两轮迭代后，prompt 层面该试的都试了，归因显示剩余失败主要是检索拿不到相关文档——这是结构问题。于是 FAPO 升级到改链拓扑，准确率从 39.3% 跳到 70.3%。

话说回来，这里有一个前提容易被忽略：你得有足够的中间步骤可检查。如果你的 pipeline 就是一个 LLM 调用加一个 prompt，FAPO 的三级递进毫无意义——你没有步骤可归因，也没有结构可改。它是给多步链设计的，不是给单次调用设计的。

## 数据说了什么

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-22-fapo-pipeline-aware-prompt-optimization-img-02-benchmark_comparison.png)

6 个 benchmark，3 个任务模型（GPT-4.1-mini、GPT-5.4-mini、Gemma 3-12B），总共 18 组对比。FAPO 赢了 15 组，平均比 GEPA 高 14.1 个百分点。

两个数字值得拆开看。

在 HoVer（多跳事实验证）和 IFBench（指令遵循）上，FAPO 分别高出 GEPA 35.3 和 32.2 个百分点——因为这两个 benchmark 恰好是 prompt 改不动、必须改 pipeline 结构的。升级带来的收益是巨大的。

在 AIME（数学竞赛）上，FAPO 反而低了 3.1 个百分点。论文说这个差距在采样噪声范围内，不构成有意义的退步。我倾向于接受这个说法，但也要注意：18 组对比里唯一输的那组，恰好是最难、最依赖纯推理能力的 benchmark。结构优化在推理密集型任务上帮不上忙，这说得通。

另一个有意思的细节：同一个任务，三个模型的最优 prompt 策略*不一样*。FAPO 的优化器（Claude Opus 4.6）为每个模型发现了不同的优化路径。这意味着不存在一个「通用最佳 prompt」——prompt 的好坏是相对于模型行为而言的。

## 我看到的信号与噪声

FAPO 真正让我觉得有意思的地方，比赢几个 benchmark 更值得说。

它把「prompt 工程」这个概念拆小了。以前我们说「调 prompt」，隐含假设是：问题在 prompt 上。FAPO 说——不一定。问题可能在数据检索、在链结构、在参数配置。prompt 只是你能动的杠杆之一，而且不一定是最有效的那个。

prompt 工程从「写作手艺」变回了「系统工程」。

但我也想提一个 FAPO 没有回答的问题：它的所有 guardrail——训练集隔离、不可变变体、独立 reviewer——防的是过拟合。可过拟合的边界在哪里？当你的数据集只有 50 条 case 时，优化出来的 prompt 在 500 条 case 上还好使吗？论文用了 train/val/test 分离来应对，但数据集本身的质量和覆盖度，是 FAPO 优化质量的上限。你带进来什么，它就优化到什么水平。

还有一件事：FAPO 默认依赖 Claude Code 或 Codex 来驱动优化循环。这不是一个独立的优化器——它是一个跑在 agentic coding 工具之上的工作流。如果你的生产环境不能用这些工具，你得自己实现那个编排层。对大厂来说不是问题，对独立开发者来说可能是。

不过话说回来，Cisco 把它以 Apache 2.0 协议开源了。核心引擎 hephaestus 是领域无关的，chain 用 LangGraph 定义，scorer 可以自己写。这意味着如果你有一个跑得不好的多步 LLM pipeline，现在有一个现成的框架帮你做那件最无聊但最有用的事：记录每一步输出，分类每一次失败，然后有目的地改。

*你有过「调了半天 prompt 最后发现改错地方了」的经历吗？*

## 原文参考

> Cisco Foundation AI Blog: Fully Automated Prompt Optimization
> <https://cisco-foundation-ai.github.io/blogs/fully-automated-prompt-optimization/>
>
> MarkTechPost: Cisco AI Introduces FAPO
> <https://www.marktechpost.com/2026/06/20/cisco-ai-introduces-fapo-pipeline-aware-prompt-optimization-with-step-level-failure-attribution-and-claude-code-orchestration/>
>
> GitHub: cisco-foundation-ai/fully-automated-prompt-optimization
> <https://github.com/cisco-foundation-ai/fully-automated-prompt-optimization>
>
> arXiv 技术报告
> <https://arxiv.org/abs/2606.19605>
