---
$schema: starlight
title: AI 的期末考试：OpenAI 用 750 道真题考出了什么
description: "最强模型只通过 36% 的任务，但更值得关注的是那些\"差一点就过\"的 14%，那才是 AI 做科学真正卡住的地方。"
date: 2026-06-18
category: ai-models
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-18-ai-exam-lifescibench-img-00-infographic-core-summary.png)

## 一份不像考试的考试

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-18-ai-exam-lifescibench-img-01-seven-workflow-dimensions.png)

OpenAI 在 6 月 17 日扔出了一份期末考试卷。

不是那种“请解释 CRISPR 的工作原理”的考题，那太简单了，任何大模型都能答得像模像样。LifeSciBench 考的是真实科研工作里那些含混的、需要判断力的脏活：拿着模糊的 Western blot 数据质疑实验方法、审查一份基因治疗的 FDA 加速审批证据包、在序列文件里找到设计 siRNA 的那个关键位点。

750 道题，173 位 PhD 级科学家编写，453 位独立评审，19,020 条评分细则。规模之外，它更像一次压力测试：AI 到底能不能帮科学家干活？

我觉得这份卷子最值得注意的，是它的出题方式。每道题的结构都是“科学家给知识渊博的合作者发的工作请求”：有 prompt，有上下文附件，然后要一个自由回答。没有选择题，没有标准答案的单一字符串。

79% 的任务需要多步推理，平均每道题 4 步。超过一半的任务附带了工件，基因序列、分子结构、实验图表、PDF，模型必须自己去读、去理解、去综合。

这跟 MMLU 或 GPQA 那种“干净的文本输入、干净的参考答案”的模式完全不同。LifeSciBench 在逼模型面对科研的本来面目：乱、模糊、需要判断。

## 成绩单：比想象中差，比表面上好

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-18-ai-exam-lifescibench-img-02-model-pass-rate-comparison.png)

先看分数。

GPT-Rosalind（OpenAI 4 月推出的生命科学专用模型）以 36.1% 的通过率排名第一。GPT-5.5 是 25.7%，Gemini 3.1 Pro 23.6%，Grok 4.3 只有 13%。

直觉反应是“连最好的模型也只过了三分之一”。但这个数字需要拆着看。

通过率（pass rate）要求任务级得分 ≥70%，门槛很高。而 rubric 分数（normalized score）给出了更细腻的图景：GPT-Rosalind 的 rubric 分是 0.576，意味着它平均能拿到每道题一半以上的分数。

更有意思的数据藏在这里：有 109 个任务，GPT-Rosalind 拿到了至少 50% 的 rubric 分数，但通过率不到 20%。它答对了大部分，却在最后一步卡住了。可能是漏掉了一个关键约束，用错了证据，或者没有把推理连接到科学上有用的最终决策。

这 14% 的灰色地带，我觉得比那个 36.1% 更有信息量。它说明模型在很多任务上已经走到了门口，但还差最后一步。知识量够了，判断力和精确度还差一截。

模型在两类任务上表现相对好：科学传播（71.1%）和转化评估（57.7%）。说白了就是组织证据、给出专家评审级别的解释、把实验室发现桥接到临床含义。这些恰好是语言模型最擅长的事的自然延伸：结构化信息、生成连贯论述。

## 真正的瓶颈：不是不懂，是做不到

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-18-ai-exam-lifescibench-img-03-artifact-performance-gap.png)

模型在哪翻车？三个方向，都指向同一个结论：AI 目前擅长说，不擅长做。

附件处理塌方最明显。GPT-Rosalind 在纯文本任务上通过率 45.1%，一旦加上附件就掉到 28.1%。GPT-5.5 也走同样的下坡路：29.9% 降到 21.9%。这些附件是什么？模糊的凝胶电泳图、缺列的电子表格、40 页的补充材料，真实研究赖以运转的那种东西。

模型能从论文文本里提取信息，但面对一张图表、一段基因序列、一个分子结构文件时，信息提取的精度就大幅下滑。53% 的任务至少需要一个附件，这意味着超过一半的真实科研工作场景，模型目前都够不着。

精确输出同样困难。需要生成准确序列、结构或数值答案的任务，通过率很低：数值任务 14.8%，序列/结构输出 24%，构建生成类任务 27.3%。CRISPR 供体设计、siRNA 序列设计，这些工作差一个碱基就是废品，不存在“大致对就行”。模型在这个层面的精确度，离实用还有很大距离。

实验设计最难。Design, Optimization & Prediction 工作流的通过率只有 30.7%，Analysis 也只有 30.3%。这类任务要求创造性地提出一个实验方案、优化一个条件、预测一个结果，是科学工作中最需要经验和直觉的部分。

一个有意思的对比：Gemini 3.1 Pro 整体排名第三，但在 214 个特定任务上独占最高分。聚合排名会掩盖任务级的差异化能力。这对“哪个模型最好用”这个实际问题的回答是：取决于你做什么类型的任务。

## Benchmark 照出了什么，没照出什么

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-18-ai-exam-lifescibench-img-04-partial-credit-gray-zone.png)

LifeSciBench 做对了一件事：它没有把科学工作简化成选择题。

19,020 条评分细则，平均每道题 25 条。这让“部分正确”变得可量化：一个模型可能得出了正确的高层结论，但因为忽略了一个关键的 assay 局限性而被扣分；另一个模型可能最终答案不完全对，但推理过程高质量，拿到了大部分分数。这种评估方式更接近真实的科学评审。

但这个 benchmark 也有它没照出来的东西。

它是单轮的。真实的科研对话是多轮的，科学家会追问、澄清、修正、迭代。一个模型在单轮里表现不佳，不代表在多轮协作中也不能弥补。LifeSciBench 目前无法测试这种协作中的纠错能力。

它覆盖的是自包含任务。但真实研究是迭代的：做实验、拿数据、改假设、再设计、再验证。这个循环中每一步的决策都依赖上一步的结果，benchmark 的静态切片捕捉不到这种动态。

还有一个更微妙的问题：benchmark 是由 OpenAI 发布的，而排名第一的 GPT-Rosalind 也是 OpenAI 的模型。这不意味着数据有问题，453 位独立评审和 96%+ 的共识率提供了可信度，但“出题者同时是参赛者”的结构性张力是客观存在的。未来如果有第三方独立复现，这个 benchmark 的公信力会更坚实。

我觉得 LifeSciBench 最大的价值，是它给整个行业画了一条线：AI 在科学领域的门槛不在知识量，在不确定性下做出精确、有用、经得起专家审视的判断。从 36% 到 100%，要补的是对复杂附件的理解、对精确输出的控制、对实验设计的创造性。

这条路还很长。但至少现在我们知道它有多长了。

*你觉得 AI 在科学领域最大的瓶颈在哪——理解力、精确度、还是创造力？*

## 原文参考

> OpenAI, “Introducing LifeSciBench,” June 17, 2026
> <https://openai.com/index/introducing-life-sci-bench/>
>
> LifeSciBench Preprint (PDF)
> <https://cdn.openai.com/pdf/b4299379-0a97-4ffa-8b9b-c3fbb299caa9/lifescibench_preprint.pdf>
