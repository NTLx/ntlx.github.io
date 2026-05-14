---
$schema: starlight
title: 同一个模型，42% 和 78% 的差距在哪
date: 2026-05-11
description: LangChain 用同一个模型只改了 harness 就从 30 名开外冲到第 5——你以为的模型瓶颈，其实是 harness 瓶颈。
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-11-agent-harness-00-infographic.png)

前几天刷到一篇长文，Akshay Pachaar 写的 *The Anatomy of an Agent Harness*，120 万阅读，468 转发。讲的是 Anthropic、OpenAI、LangChain 这些公司到底在造什么东西。

我用 Claude Code 快半年了，日常开发全靠它。看完这篇文章，有种被人点醒的感觉——不是学到了新知识，而是终于看清了自己一直在用、但从没认真想过的东西。

## 模型是 CPU，但你一直在挑 CPU

文章里最扎眼的一个数据：LangChain 做了一个实验，同一个模型、同一组权重，什么都不改，只改了外面包的那层基础设施。结果在 TerminalBench 2.0 上的排名从 30 名开外，直接跳到第 5。

TerminalBench 2.0 是斯坦福和 Laude Institute 联合做的基准测试，在隔离的 Docker 容构里跑真实的命令行任务——从简单的文件操作到复杂的系统管理。GPT-5.5 跑到 82.7%，GPT-5.3-Codex 是 76-77%，Claude Opus 4.6 是 65.4%。这些数字看着都在进步，但 LangChain 的实验揭示了一个更根本的事实：**模型能力的差距，远小于 harness 设计的差距**。

评论区有人补了一刀：他们的平台测了 69 个模型、101 种 harness 配置。同一个模型，换个 harness，得分从 42% 到 78%。

我第一反应是不信。模型不就是一切吗？GPT-5 比 GPT-4 强，Claude Opus 比 Sonnet 强，这不是很显然的事？

但仔细一想，我的日常经验其实一直在告诉我相反的事。

我用 Claude Code 写代码，它能自己读文件、跑测试、改代码、再验证。整个过程我几乎不用管。但同样的 Claude 模型，如果我只在聊天窗口里跟它对话，让它帮我写同一段代码，效果差一大截。不是模型变了，是我给它套的「壳」变了。

这个壳，就是 Akshay 说的 agent harness。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-11-agent-harness-01-agent-vs-harness.jpg)

## 你以为你在用模型，其实你在用操作系统

Beren Millidge 2023 年写过一篇文章，给了一个精确的比喻：裸的 LLM 就是一块 CPU——没有内存、没有硬盘、没有 I/O。上下文窗口是 RAM（快但小），外部数据库是硬盘（大但慢），工具调用是设备驱动。而 harness，是操作系统。

他在文章里写了一句话：「We have reinvented the Von Neumann architecture.」我们重新发明了冯·诺依曼架构。

评论区有个中文读者说得更直白：「Harness 是 LLM 的操作系统，相当于 Windows 之于 PC 硬件。」

我第一次看到这个类比的时候，脑子里「咔」的一声。

我一直在纠结用哪个模型——Claude 还是 GPT？Opus 还是 Sonnet？但其实这就像纠结用 Intel 还是 AMD 的 CPU，而忽略了你跑的是 Windows 还是 Linux。同一块 CPU 装不同操作系统，体验完全不同。

LangChain 的公式更狠：「If you're not the model, you're the harness.」你不是模型，你就是 harness。这意味着我——作为用 AI 工具写代码的人——真正重要的工作不是挑模型，而是设计和选择 harness。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-11-agent-harness-02-12-components.jpg)

## Harness 里到底有什么

Akshay 综合了 Anthropic、OpenAI、LangChain 的实践，拆出了 12 个组件。我挑几个跟我日常使用最相关的说。

**编排循环**是心跳。它跑的是 Thought-Action-Observation 循环：组装 prompt → 调用 LLM → 解析输出 → 执行工具 → 把结果喂回去 → 重复。Anthropic 说他们的运行时是个「笨循环」，所有智能都在模型里，harness 只管轮次。这话听着谦虚，但其实很聪明——把复杂性推给模型，让 harness 保持简单。

**上下文管理**是很多 agent 静默失败的地方。核心问题是「上下文腐烂」：Chroma 的研究发现，关键内容落在上下文窗口中间位置时，模型性能下降 30% 以上。斯坦福的「Lost in the Middle」论文也证实了这一点。生产环境的策略包括：压缩（总结历史）、观察遮蔽（隐藏旧的工具输出）、即时检索（用 grep/glob 而不是加载整个文件）、子 agent 委派（每个子 agent 探索很多但只返回 1000-2000 token 的摘要）。

**验证循环**是区分玩具 demo 和生产 agent 的关键。Anthropic 推荐三种方式：规则反馈（测试、linter、类型检查）、视觉反馈（Playwright 截图）、LLM-as-judge（另一个子 agent 评估输出）。Claude Code 的创造者 Boris Cherny 说，给模型验证能力，质量提升 2-3 倍。

这让我想到自己的经验。我给 Claude Code 配了 CLAUDE.md，里面写了「先跑测试再提交」。一开始觉得多此一举，后来发现这正是验证循环——模型不是写完代码就结束，而是写完→测试→修→再测试，直到通过。这个循环让它的代码质量比我手动写的还稳。

## 脚手架在拆，但不会消失

文章里提到 Manus，一个很火的通用 AI Agent。它六个月重写了五次，每次都在删东西。复杂的工具定义变成了通用 shell 执行，「管理 agent」变成了简单的结构化交接。

脚手架在拆。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-11-agent-harness-05-scaffolding.jpg)

Vercel 的例子更极端：他们从 v0 里删掉了 80% 的工具，效果反而更好。Claude Code 通过懒加载实现了 95% 的上下文缩减。

这让我想到自己的经历。刚开始用 Claude Code 的时候，我给它写的 CLAUDE.md 又长又细，恨不得把所有规则都塞进去。后来发现，很多规则其实不需要了——模型自己学会了。我写的那些「规范」反而成了噪音。

但脚手架不可能完全消失。模型再强，也需要有人管它的上下文窗口、执行工具调用、持久化状态、验证输出。这些活不会因为模型变聪明就自动消失。

区别只是操作系统的厚薄。

## 最让我意外的一点

文章提到 Anthropic 有个「共同进化原则」：模型现在是跟 harness 一起训练的。Claude Code 的模型专门学过怎么用 Claude Code 的 harness。你换了工具实现，模型反而变笨。

这解释了一件事：为什么我试过好几个 AI 编程工具，有些用起来就是比另一些顺手——不一定是模型更好，而是那个 harness 和模型是「配套」的。

评论区也有人问：如果模型最终内化了规划能力，harness 是不是就退化成一堆 MCP 连接器了？

大概会。但那是以后的事。现在，harness 还是那个决定性的变量。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-11-agent-harness-07-seven-decisions.jpg)

## 七个定义 harness 的决策

Akshay 总结了每个 harness 架构师都面临的七个选择。我挑几个跟日常使用最相关的说。

**工具精简策略**：更多工具往往意味着更差的性能。Vercel 从 v0 里删掉 80% 的工具，效果反而更好。Claude Code 通过懒加载实现 95% 的上下文缩减。原则是：只暴露当前步骤需要的最小工具集。

**Harness 厚度**：多少逻辑放在 harness 里，多少留给模型。Anthropic 赌的是薄 harness + 模型进步。基于图的框架赌的是显式控制。Anthropic 经常从 Claude Code 的 harness 里删掉规划步骤，因为新模型版本已经内化了这个能力。

**验证循环设计**：计算验证（测试、linter）提供确定性的 ground truth；推理验证（LLM-as-judge）捕获语义问题但增加延迟。Martin Fowler 的 Thoughtworks 团队把这叫做 guides（前馈，行动前引导）和 sensors（反馈，行动后观察）。

## 4 月 23 日的事故

评论区有人提到 Anthropic 4 月 23 日发了一个事后复盘：Claude Code 性能波动，用户觉得模型「变笨了」。但复盘结果表明，问题来自 harness 层面的变更——模型行为约束的调整、缓存优化的缺陷——而不是模型本身。

即使模型本身结构保持不变，harness 的细微改动，也可能显著改变 LLM 的实际表现。

这让我想到一个更根本的问题：我们评判一个模型好不好用的时候，到底在评判什么？是在评判模型的能力，还是在评判 harness 的设计？

大概率是后者。

下次你的 agent 不好使，别急着骂模型。看看它的 harness。

***

*你用 AI 工具写代码或做开发吗？有没有踩过 harness 的坑、或者发现某个工具就是比另一个好用？欢迎留言聊聊。*

## 原文参考

> Akshay Pachaar. **The Anatomy of an Agent Harness**. X (Twitter).
> <https://x.com/akshay_pachaar/status/2041146899319971922>
