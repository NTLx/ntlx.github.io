---
$schema: starlight
title: 法律 Agent 的真正瓶颈，是谁来判它有没有错
description: Agent 能不能上高风险场景，关键在于谁能拦住那些看起来相关却没有满足要求的答案。
date: 2026-06-18
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-18-legal-agent-verifiers-img-00-infographic-core-summary.png)

## 这篇文章戳到我的地方

读 LangChain 和 Harvey 这篇文章时，我一开始以为它在讲一个工程问题：LLM verifier 太贵，能不能批量判、换便宜模型判。读完以后，注意力挪到了另一个地方：当 Agent 进入法律这种高风险场景，系统里最稀缺的能力从“生成答案”转到了“知道什么不能放过去”。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-18-legal-agent-verifiers-img-01-false-pass-gate.png)

法律工作有个很硬的现实。一个 memo 写得大体正确，漏掉一个 change-of-control 风险，不能说它完成了 80%。它可能就是没完成。Harvey LAB 采用 all-pass grading，我觉得这个设计很关键：每个 task 都被拆成一条条 expert-written criteria，只有全部通过才算完成。

这和我们平时看大模型 demo 的习惯很不一样。Demo 看的是“像不像”，法律审阅看的是“有没有漏”。前者可以容忍漂亮但含糊，后者最怕相关但没满足。LangChain 原文里最让我警觉的数字，其实是 Haiku 4.5 的 false-pass rate：per-criterion 48.4%，batch 34.7%。DeepSeek 可以便宜 60-1000 倍当然重要，但这组误放数字更刺眼。这已经不是“差一点”，是闸门的方向错了。

false fail 当然也有成本。它会多叫一次人审，多花一点时间。但 false pass 更像把红灯识别成绿灯，后面所有流程都会信它。法律场景里，宁愿多拦几辆车，也不能让一辆不该过的车过线。

## 批量验证省的是 token，转移的是注意力

这篇文章把 verifier 设计拆成两条路：少用 tokens，或者用便宜 tokens。少用 tokens 的办法是 batch scoring：不再每条 criterion 调一次 judge，而是一次性把整套 rubric 交给 verifier，让它给每条标准都判 pass/fail。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-18-legal-agent-verifiers-img-02-per-criterion-batch-tradeoff.png)

这个办法很诱人。LAB 一个任务经常有 50 条以上 criteria，40 个 public tasks 就有 2,348 条 rubric criteria。如果每条都用 frontier model 单独判，成本和延迟都会变成墙。batch scoring 等于把重复输入成本砍掉一大截。

但这笔账没有那么干净。per-criterion scoring 的好处，是 verifier 的注意力窗口很窄：就看这一条要求有没有被满足。batch scoring 的问题，是它要同时管理几十条要求。它省下的是 token，花掉的是 judge 的工作记忆。

我不太愿意把 batch scoring 理解成“更聪明的工程”。它更像把一摞审稿意见从 50 个独立小审稿人手里，交给一个人一次审完。这个人可能更快，账单更低，也更可能在第 37 条开始走神。

原文说 batch 模式整体 match rate 会低于同模型 per-criterion 模式，这不奇怪。要紧的问题是：batch 应该放在哪一层。也许它适合早期大规模筛选，适合低风险 criteria，适合和抽样复核搭配；但对那些“一旦误放就很贵”的 criteria，窄窗口判断仍然值钱。

## 先看它怎么犯错，再谈便宜

DeepSeek v4 Flash 在这组实验里很亮眼。它可以接近 Opus 4.7 verifier 的标签，同时成本低得多。这个结果很容易被读成“开源/便宜模型够用了”。我觉得这句话只说了一半。

更重要的半句是：便宜模型能不能用，要看它错在哪里。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-18-legal-agent-verifiers-img-03-verifier-error-profile.png)

LangChain 和 Harvey 对 DeepSeek 做 prompt tuning 的部分很有意思。默认 prompt 下，DeepSeek 的一个错误来源是太愿意放过“相关但没有满足所有 material parts”的答案。于是他们让 verifier 把 criterion 拆成 checklist，并且在信息不清楚时更保守。结果 false-pass rate 从 10.7% 降到 9.5%（per-criterion），从 15.6% 降到 14.2%（batch）。

这个改进幅度不算神奇，但它把 verifier 的问题说清了：它不像一个静态模型选择题，更像一个行为校准题。你不能只问“哪个模型最强”，还要问“这个模型在我的风险函数里，倾向于犯哪种错”。

法律里最危险的 verifier，不一定是 agreement 最低的那个，可能是最爱给 pass 的那个。因为 failed criterion 可以升级给人，passed criterion 往往直接进入下一层流程。这里其实有个很朴素的问题：这个 verifier 像严厉 reviewer，还是像好说话的 reviewer？

我甚至觉得，这类系统以后会需要“错误偏好说明书”。不只写模型名、成本、延迟、agreement，还要写：它在 evidence missing 时是否保守？它遇到部分满足时是否会误放？它对格式要求和实质要求的权重如何？它的 false pass 是不是集中在某类法律判断上？

## Gold standard 也会晃

还有一个数字值得多看一眼：GPT-5.5 和 Opus 4.7 这种 frontier verifier 之间，也只有 95.7% match rate。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-18-legal-agent-verifiers-img-04-floating-gold-standard.png)

这其实有点尴尬。我们常说拿 frontier model 当 judge，再去蒸馏便宜 verifier。可如果两个 frontier judge 本身有 4-5% 标签分歧，那所谓 gold standard 就不是一块金砖，而是一根会晃的标尺。

这并不否定 LLM-as-judge。恰恰相反，我觉得这让它变得更真实。法律 rubric 不是单元测试。单元测试的断言是机器写死的，法律 criteria 往往有语言边界、证据边界、材料充分性边界。模型之间分歧，可能是 verifier 差，也可能是 criterion 写得不够原子、不够可观察。

verifier 研究最后会回到 rubric 本身。一个好 verifier 不能单独存在，它和 rubric、trace、人审、post-training 数据一起构成反馈系统。如果只优化 verifier 成本，却不回头看那些引发分歧的 criteria，系统会把模糊标准包装成精确分数。

这也是我最喜欢这篇文章的地方。它没有把“便宜”说成终点。它提到从 traces 里挖 divergent cases，再定向调 prompt。这里的路子是对的：不要幻想一次性找到完美 judge，而是把 judge 犯错的地方持续拿出来审，审完再改 rubric、改 prompt、改模型。

## 便宜要落在可校准的闸门上

为什么这事对 post-training 更要命？因为 verifier 不只用于 eval，也会变成 reward signal。一次 eval 贵，还只是账单难看；RL 里一个 task 有多次 rollout，verifier 成本会被放大很多倍。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-18-legal-agent-verifiers-img-05-reward-signal-amplification.png)

更麻烦的是，reward signal 如果偏了，省下来的钱可能会换来更隐蔽的坏训练。一个爱 false pass 的 verifier，会奖励“看起来相关但没满足要求”的回答。训练轮次越多，这种错误越被系统学进去。

我读完以后，反而没那么关心“DeepSeek 能省多少”。省钱当然重要，但它只是第一层。后面还有一个更难的问题：我们有没有一套便宜到能高频运行、稳定到不会轻易误放、透明到能被人审计的 verifier 体系。

这套体系大概不会只靠一个模型。它可能是分层的：便宜 verifier 批量扫，大模型 verifier 审高风险项，人类专家抽样校准，trace mining 找系统性分歧，rubric 持续变得更原子。听起来麻烦，但高风险 Agent 本来就不该只靠一次漂亮输出上线。

这篇文章给我的提醒很简单：Agent 时代的可靠性工程，重点不是让模型显得更会做事，而是让系统更会不放行。

*如果你在做 Agent eval，你更怕 false fail 带来的人工成本，还是 false pass 带来的系统风险？*

## 原文参考

> LangChain: Designing Efficient Verifiers for Legal Agents
> <https://www.langchain.com/blog/designing-efficient-verifiers-for-legal-agents>

> Harvey: Introducing Harvey's Legal Agent Benchmark
> <https://www.harvey.ai/blog/introducing-harveys-legal-agent-benchmark>

> Harvey: Initial Results on Legal Agent Benchmark
> <https://www.harvey.ai/blog/legal-agent-benchmark-initial-results>

> Harvey LAB GitHub Repository
> <https://github.com/harveyai/harvey-labs>

> LangChain: Introducing LangChain Labs
> <https://www.langchain.com/blog/introducing-langchain-labs>
