---
$schema: starlight
title: 读 Jev：我开始把 Agent 的“大脑”拆成三层
description: Jev 最值得带走的不是快和便宜，而是把智能重新拆成软件契约：代码管确定性，决策模型管窄判断，通用 LLM 管开放推理。
date: 2026-09-22
category: ai-agents
primarySourceUrls: ["https://www.latent.space/p/jev?showTranscript=true"]
---

最开始点开 Jev 这期访谈，我以为重点会是新模型常见的那几件事：更快、更便宜，以及一个新的训练方法。

TypeSafe 官网确实把 **193.6× faster、444.6× cheaper** 写得很大。这样的数字天然吸引注意力。

但把整场访谈和 TypeSafe 的文档一起看完，我最后停在了另一个地方：**Jev 主动放弃了生成文本。**

它不写答案，不写代码，也不是拿来替换 Claude Code、Cursor 或 Codex 背后大模型的。它接收 state 和一组预先定义好的问题，返回 choice、score、概率和 confidence，让程序直接继续往下跑。

这听起来像能力缩水。

我反而觉得，这可能是 Jev 最值得认真看的地方。

因为它逼着我重新问了一个很基础的问题：**当 Agent 真正进入软件内部以后，我们为什么还默认所有“需要智能”的地方，都应该交给同一个通用生成模型？**

![本文提出的 Agent 三层认知分工与置信度门控示意图](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-22-jev-programmable-ai-img-00-infographic-core-summary.png)

## 让我停下来的，是 Jev 主动放弃了字符串

过去几年，我们已经习惯把 LLM 当成一种近乎万能的接口。

输入自然语言，输出也是自然语言。要调用工具，就让它生成 tool call；要结构化数据，就让它吐 JSON；要分类、路由、打分，也继续通过 prompt 要一个答案。

这套方式非常通用。它也是 ChatGPT 之后 AI 产品快速扩散的重要原因。

问题在于，当模型从“一个人在聊天”进入“软件内部的一个依赖”，字符串就开始显得很昂贵。

这里说的昂贵不只是 token 成本。

程序还要处理解析失败、schema 偏离、额外文字、拒答、格式变化，以及模型明明给了一个很确定的句子，实际上却并不确定的情况。我们可以不断给通用 LLM 加 structured output、validator、retry 和 guardrail，把这些问题压下去。但 Jev 走的是另一条路：干脆把答案空间预先限制住，让模型做的事情从“生成一段东西”变成“在明确的语义空间里做判断”。

TypeSafe 把它描述成 “unstructured state in, typed probabilistic decisions out”。

我不认为这说明字符串接口错了。生成文本对规划、解释、写代码和处理开放问题仍然非常合适。

我更在意的是：**过去我们把“智能”与“生成字符串”绑得太紧了。**

把这两个概念拆开以后，Agent 的内部结构也有了别的设计方式。

## 我现在更愿意把 Agent 的“大脑”拆成三层

这是我从 Jev 延伸出来的判断，不是 TypeSafe 官方给出的架构图。

第一层是**确定性代码**。

权限、状态转换、金额计算、日期比较、重试上限、写操作、副作用、硬约束，这些能用代码明确表达的事情，就不该因为“现在有 AI”而重新变成概率问题。

第二层是**窄语义决策模型**。

比如：这条请求属于哪个意图？这段检索结果是否与问题相关？这次 Agent trace 是否需要人工复核？这条输入是否包含 prompt injection？某个候选是否满足一组语义条件？

这些问题不是传统代码擅长的，但它们通常有清楚的输出空间。它们需要的是 judgment，不一定需要 generation。

第三层才是**通用 LLM / Agent**。

它负责开放式规划、生成文本和代码、多步推理、工具使用，以及在任务还没被结构化时，把模糊目标逐步变成可以执行的计划。

这样拆以后，我发现模型选择的问题变了。

不再只是“哪个模型最聪明”，而是：**这个认知节点到底需要什么软件契约？**

如果输出必须被下游代码稳定消费，答案空间本来就有限，而且错误要能被单独测量，那么给它一个能够写长篇大论的模型，未必是最自然的选择。

反过来，如果任务本身就是开放探索，让模型自由生成当然更合适。

这和微服务不是一回事，也不是鼓励把系统拆得越碎越好。真正需要拆开的，是**失败语义不同的认知步骤**。

## Calibration 的价值，是把“不确定”接进控制流

Jev 另一个让我在意的点是 calibration。

这里很容易被宣传语带偏。

TypeSafe 会强调 type safety，也会使用 “zero hallucinations” 这样的说法。但把发布页、confidence 文档和官方的 Jev 1.13 jaggedness 文档放在一起看，边界其实很清楚：

**输出不会跑出预定义 schema，不等于判断不会错。**

一个 Choice 可以永远返回合法选项，但仍然可能选错。

这也解释了 confidence 为什么重要。

它不该只是答案旁边那个“我有多自信”的数字。对软件来说，更实际的问题是：模型认为应该做什么，以及系统是否允许它直接做。

比如，同样是“这条请求应该路由到哪个处理器”，低风险场景可以直接执行；涉及写入、删除、权限变更或资金的动作，则可以要求更高阈值，不够确定就交给更贵的模型，或者交回人。

如果一个模型在自己的任务分布上真的经过 calibration，我们还可以继续问：给出 0.8 概率的一批判断，是否真的大约八成正确？

这比一句“模型很可靠”有用得多。

因为工程系统最终需要的从来不是抽象意义上的可靠，而是：**什么时候自动做，什么时候升级，什么时候停。**

所以我不会把 Jev 的价值概括成“不会幻觉”。

更准确的说法是，它试图把语义判断变成一种更容易测量、组合和治理的软件原语。可靠性仍然来自整套系统：模型、harness、代码、阈值、eval，以及失败后的 escalation。

![置信度如何按风险将语义判断分流到自动执行、升级模型或人工复核](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-22-jev-programmable-ai-img-01-flowchart-confidence-gating.png)

## 如果这个方向成立，单模型 Agent 可能只是阶段性形态

这也是我从访谈里最想继续观察的一条线。

TypeSafe 的文档明确说，Jev 不是 Claude Code、Cursor、Copilot 这类 coding agent 的 drop-in replacement。它不负责生成代码，也不负责长链路规划。

但这反而打开了另一个可能性。

今天很多 Agent 的 harness 都围绕一个主模型设计：把上下文尽量塞给它，让它规划、判断、路由、调用工具、检查结果，再继续下一步。

这有历史原因。最强模型提供了最多能力，而 KV cache、上下文复用和统一工具协议又鼓励我们尽量待在同一个模型会话里。

可如果 routing、classification、scoring、guardrail、verification 这些窄判断，可以由另一类更便宜、更快、输出契约更紧的模型承担，Agent 内部就未必还需要“一颗大脑包办一切”。

我之前写《[Claude Code 为什么开始离开聊天框](https://ntlx.github.io/articles/claude-loops-leaving-chat)》时，更关注 Agent 从对话工具变成持续运行的软件。

Jev 让我把问题又往里推了一层：

**当 Agent 已经成为软件，它内部的智能是不是也应该像软件一样被拆成不同原语？**

这比“再找一个便宜模型替换主模型”更有意思。

因为真正改变的不是 provider，而是 architecture。

## 但我不会因此开始“Jev everything”

越是一个看起来干净的新抽象，越容易被过度使用。

TypeSafe 自己公开的 Jev 1.13 jaggedness 文档反而让我更愿意认真看这个方向。里面写得很直接：模型会 literal reading，会在需要数字精度时吃力，多层 indirection 会退化，无关上下文会带来 context rot，对抗性内容也可能影响判断。

这和“万能小模型”的故事完全不同。

它告诉开发者：边界本身就是产品的一部分。

官方那组很漂亮的性能、成本数字也应该这样看。TypeSafe 说明，首页的 **193.6× faster、444.6× cheaper** 来自自己的 workflow eval，而且属于他们预期的现实收益高端区间；workflow 由内部团队构造，reference labels 也来自其他前沿模型的结果。

这些 benchmark 当然仍有价值，只是证据等级要摆对位置：它们是公司公开的工程结果，不是第三方已经替我们完成的结论。

我真正愿意从 Jev 带回自己的 Agent 设计里的，也不是某个具体倍数。

我更愿意带走一组具体的设计问题：这个步骤真的需要生成吗？答案空间能不能先定义？错误能不能单独测？不确定性能不能进入控制流？确定性部分为什么还要交给模型？

如果把这些问题问清楚之后，最后发现“还是让通用 LLM 一次做完最好”，那也完全没问题。

关键是，这应该成为一个经过设计的决定，而不是默认值。

## 我从 Jev 带走的，是一种更像软件工程的 AI

Diogo Almeida 是 InstructGPT 的作者之一。那项工作帮助模型学会更好地按照人的指令输出答案。

几年后，他在 TypeSafe 做的事情几乎像是从另一个方向追问：如果消费者不再是人，而是代码，模型的接口还应该长成聊天框的样子吗？

这个问题对我比 Jev 本身更重要。

通用 LLM 继续变强，我一点也不怀疑它们会吞掉越来越多任务。但 Agent 工程不应该因此只剩下一件事：把最新、最强的模型接进同一套 harness。

模型越强，这个边界反而越值得主动设计：**哪里保留生成式能力，哪里收缩成受约束的判断，哪里直接用代码。**

Jev 现在还只是一个很早期、边界明显、主要证据来自官方自己的产品。

但它至少把这个问题摆到了台面上。

我觉得这值得认真看。

## 参考资料

- Latent Space, [Jev: System One models for Prod, not God — with Diogo Almeida, CEO, TypeSafe AI](https://www.latent.space/p/jev?showTranscript=true)
- TypeSafe, [Introducing System One Models & Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev)
- TypeSafe Docs, [Introduction](https://docs.typesafe.ai/introduction)
- TypeSafe Docs, [How to build with System One](https://docs.typesafe.ai/concepts/how-to-build-with-system-one)
- TypeSafe Docs, [Confidence](https://docs.typesafe.ai/confidence)
- TypeSafe Docs, [Jev with coding agents](https://docs.typesafe.ai/introduction/coding-agents)
- TypeSafe Docs, [Jev 1.13 jaggedness](https://docs.typesafe.ai/model-jaggedness/jev-1.13)
- TypeSafe, [Workflow Evals](https://evals.typesafe.ai/)
- Ouyang et al., [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155)
