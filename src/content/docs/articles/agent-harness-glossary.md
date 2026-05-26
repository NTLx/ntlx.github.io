---
$schema: starlight
title: 你不是模型，你就是 Harness
description: 同一个模型在不同 harness 里跑分差了一截。模型只是引擎，harness 才是赛车。Agent = Model + Harness——如果你不是模型，你就是 harness。
date: 2026-05-26
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-26-agent-harness-glossary-img-00-infographic-core-summary.png)

ICLR 2026 开完之后，有人发了条推："在 agent 语境中，harness 和 scaffold 到底是什么意思？我听了一堆解释，不明白为什么它们对不上。"

这条推被 HuggingFace 的两个工程师看到了，他们写了一篇词汇表试图把这些词摁住。读完这篇词汇表，我觉得它做对了一件事：没有假装给出唯一答案，而是告诉你——这个领域还在边跑边系鞋带。

但有几件事已经比较清楚了。

## 一个公式和一段公案

文章给的核心公式很简单：*Agent = Model + Harness*。

如果你不是模型，你就是 harness。

这句话第一次看觉得是废话。第二次看觉得是安慰。第三次看，觉得它捅到了根子上。

过去两年，AI 行业把 90% 的注意力放在模型上。谁家的 benchmark 更高、谁的推理更强、谁的上下文窗口更大。模型军备竞赛的声音盖过了一切。但 2026 年开始，一个反直觉的事实越来越难忽视：*同一模型在不同 harness 里表现差得不像同一个东西。*

HuggingFace 文章引用了一个数据点：在 Terminal Bench 2.0 上，Claude Opus 4.6 在 Claude Code 内部跑的分，远低于同一模型在一个定制 harness 中跑的分。Viv Trivedy 的团队只换了 harness，就把一个编程 agent 从排行榜 Top 30 拉到 Top 5。

模型没变。Harness 变了。结果变了。

这意味着什么？意味着模型经过后训练（posttraining）之后，已经和它训练时的那个 harness 耦合了。你把它搬到另一个 harness 里——工具更贴合你的代码库、prompt 更紧、反馈更锐——它就能释放出被原来那个 harness 压住的能力。

模型是引擎。Harness 是整台赛车。过去两年我们在比谁的引擎马力大。现在该比谁的底盘、悬挂和空气动力学做得更好了。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-26-agent-harness-glossary-img-01-agent-anatomy.png)

## Scaffold、Harness、还是别的什么

词汇表里最让我觉得有趣的是 scaffold 和 harness 之间的模糊地带。

按照 HuggingFace 的梳理：
- *Harness（广义）*：模型以外的一切。Claude Code 的文档原话："Claude Code serves as the agentic harness around Claude."
- *Scaffold*：围绕模型的行为定义层——系统提示、工具描述、上下文管理。
- *Harness（狭义）*：执行层，调用模型、处理工具调用、决定何时停止的循环。

但 Claude Code、Codex 这些产品把整个东西都叫 harness。在训练语境中，又需要把 scaffold 和 harness 分开。所以同一个词，在不同场景下指代不同的东西。

这不奇怪。一个发展太快的领域，词汇永远跑在共识前面。但我觉得这里有一个更深层的原因：scaffold 和 harness 之间的界限*本身就*是模糊的。系统提示是 scaffold 的一部分，但系统提示也决定了 harness 的行为。上下文管理是 scaffold 的职责，但执行上下文管理的代码运行在 harness 里。

这不是一个可以干净切分的架构。它更像是一个连续体——从模型权重里的隐性行为，到系统提示里的显性指令，到执行循环里的代码逻辑，到沙箱和权限控制——它们共同决定了 agent 最终"做"了什么。

Simon Willison 说得更直白：编程 agent 就是"在循环中运行工具来达成目标的系统"。系统提示几百行（不是几十行），工具调用、多步规划循环、上下文窗口管理——这些就是 harness 的工作。魔法不在模型里，在 harness 里。

## 人在 harness 中的位置

OpenAI 那篇 harness engineering 报告里有一个细节让我停下来想了很久。

他们三人团队用五个月、零行人工代码、让 Codex agent 生成了约 100 万行代码。人类做的事是什么？*设计让可靠代码生成成为可能的环境。*

这包括：

*上下文工程*：仓库不是为了人类阅读而组织，而是为了 agent 可读。Slack 里做的架构决策必须在 agent 能推理之前写进仓库。会议记录不是"以后再说"，而是"现在就版本化成文档"。

*架构约束强制执行*：不是告诉 agent "请遵循分层架构"，而是写一个 linter（也由 Codex 写的）来机械地阻止跨层依赖。不是微观管理实现细节，而是强制执行不变量。

*垃圾收集*：Agent 生成的代码库会积累熵。模式漂移、文档和代码脱节。人类工程师可以靠季度清理冲刺来处理，但 agent 的生产速度让人类清理跟不上。解决方案是把"黄金原则"编码进仓库，让 Codex 自己周期性扫描和修复。

Ryan 的一句话我觉得应该贴在每个 agent 开发者的墙上：*"如果你能阐明你不喜欢代码的什么地方，下一步就是把它写下来。"*

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-26-agent-harness-glossary-img-02-human-in-harness.png)

这段话让我想到一个问题：当人类的角色从"写代码"变成"设计让 agent 写代码的环境"，这到底是进化还是退化？

我觉得答案是：这取决于你怎么定义"软件工程"。如果软件工程是"写代码"，那它在退化。如果软件工程是"设计能可靠产出软件的系统"，那它在进化。Cursor 的博客标题说得好："Continually improving our agent harness"——他们花数周时间把 harness 调到模型的长处和短处上，直到同一模型在他们调过的 harness 里明显比在别人那里表现更好。

这不是写代码。这是调音。

## 收敛的 harness，分化的人

HuggingFace 词汇表里有一句话我觉得是整篇最重要的观察：

"把顶级编程 agent 并排比较（Claude Code、Cursor、Codex、Aider、Cline），它们看起来彼此更相似，而不是其底层模型。模型不同，harness 模式正在收敛。"

我读到这句话时心里打了个激灵。

模型在分化——OpenAI、Anthropic、Google、各家的路线不同、能力侧重不同。但 harness 在收敛——系统提示、工具调用、多步循环、上下文管理、子代理、hooks——这些组件大家都有了。Addy Osmani 管这叫"行业缓慢找到把生成模型变成能交付产品的东西的承重构件"。

这意味着什么？意味着 agent 产品的差异化不会来自模型选择，而来自 harness 设计。模型越来越像商品——你用我用大家用。但 harness 是手艺活——怎么组织系统提示、怎么设计工具边界、怎么做上下文压缩、什么时候该让子代理接管——这些判断力是积累出来的，不是调 API 调出来的。

HuggingFace 提到的"Viv Trivedy 的 HaaS 框架"——Harness as a Service——也指向这个方向。我们正在从"构建在 LLM API 上"（拿到一次补全结果）转向"构建在 harness API 上"（拿到一个运行时）。Claude Agent SDK、Codex SDK、OpenAI Agents SDK 都在做同一件事：把循环、工具、上下文管理、hooks、沙箱原语打包给你，你只需要配置四根柱子——系统提示、工具、上下文、子代理——然后把精力放在领域特定的 prompt 和工具设计上。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-26-agent-harness-glossary-img-03-harness-convergence.png)

## 词汇表的真正价值

最后说回 HuggingFace 这篇词汇表本身。

它不是一篇技术深度很强的文章。它没有新架构、没有新实验、没有 benchmark。它做的事情更基础——给一个词汇混乱的领域画一张地图。

但我觉得这恰恰是现在最需要的。当一个领域跑得太快，人们开始用同一个词说不同的事，或者用不同的词说同一件事。Scaffold 还是 harness？Agent 还是 policy？Tool 还是 skill？Sub-agent 还是 tool？这些不是学术争论。它们直接影响你怎么跟同事沟通、怎么读别人的代码、怎么设计自己的系统。

HuggingFace 的态度我觉得是对的：不强制一个"正确"定义，而是给一个实用的心智模型，让你能跟上别人的讨论。

我自己读完这篇之后的总结就一句话：

*Agent = Model + Harness。如果你不是模型，你就是 harness。Harness 工程是你现在该学的东西。*

*你在搭 agent 的过程中，harness 里哪个部分最让你头疼？上下文管理、工具设计、还是执行循环的稳定性？*

## 原文参考

> HuggingFace Blog, "Harness, Scaffold, and the AI Agent Terms Worth Getting Right", Sergio Paniego & Aritra Roy Gosthipaty, 2026-05-25
> https://huggingface.co/blog/agent-glossary
>
> O'Reilly Radar, "Agent Harness Engineering", Addy Osmani, 2026-05-15
> https://www.oreilly.com/radar/agent-harness-engineering/
>
> OpenAI, "Harness Engineering: leveraging Codex in an agent-first world"
> https://openai.com/index/harness-engineering/
>
> Simon Willison, "How coding agents work — Agentic Engineering Patterns"
> https://simonwillison.net/guides/agentic-engineering-patterns/how-coding-agents-work/
>
> Cursor Blog, "Continually improving our agent harness", 2026-04-30
> https://cursor.com/blog/continually-improving-agent-harness
