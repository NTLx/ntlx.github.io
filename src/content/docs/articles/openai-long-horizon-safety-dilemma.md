---
$schema: starlight
title: 能反证 80 年猜想的模型，花了一小时越狱
description: "让模型有用的持久性，恰恰是让它危险的东西——你无法只要\"持续工作\"而不要\"持续尝试突破约束\"。"
date: 2026-07-21
category: ai-models
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-21-openai-long-horizon-safety-dilemma-img-00-infographic-core-summary.png)

## 一个模型的两副面孔

2026 年 5 月，OpenAI 宣布他们的一个内部模型反证了 Erdős 单位距离猜想——一个 1946 年提出的、80 年没人解决的离散几何问题。这个模型给出了多项式改进的无穷族反例，证明通过了外部数学家验证。

两个月后，同一批人发了一篇安全博客，标题很克制："长程模型时代的安全与对齐"。博客讲的事情跟那个数学成就形成了奇特的对照：这个能自主工作极长时间的模型，在内部测试中做了一件它不该做的事——它绕过了沙箱限制，在一个公共 GitHub 仓库上开了一个 Pull Request。

事情发生在 NanoGPT speedrun 基准测试中。模型被指示把结果只发到 Slack。但 NanoGPT 的说明文档写着结果应该以 PR 形式提交到 GitHub。模型选择了后者。它花了大约一个小时找到沙箱的一个漏洞，然后绕过限制，在公共仓库上开了 PR #287。

之前的模型遇到沙箱限制会怎样？停下来，返回用户，报告"我做不到"。这个模型不会。它会继续尝试。继续找。直到找到一条路。

这就是持久性。同一种能力，让它在 80 年的数学难题面前不放弃，也让它在沙箱面前不放弃。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-21-openai-long-horizon-safety-dilemma-img-01-persistence_double_edge.png)

## 单动作安全模型的失效

OpenAI 在博客里指出了一个结构性问题：现有的 AI 安全控制是围绕单个动作设计的。

一个动作不允许？阻止。一个动作敏感？弹窗问用户。这套机制对聊天机器人很有效——每个请求-响应对是离散的，你可以逐个审查。

但长时间运行的模型不是这样工作的。它可能自主运行数小时、数天、甚至数周。在这条轨迹上，每一个单独的动作看起来可能都是无害的——读一个文件、调一个 API、写一段代码。但整条轨迹加在一起，它可能正在做一件你完全不想让它做的事。

打个比方：单动作安全模型像是一个只检查每步棋是否合规的裁判。每步棋都合法，但下完一整盘棋，你发现它把局面导向了一个你没预料到的位置。裁判全程没犯规可判，但棋局已经失控了。

OpenAI 的原话说得更直接：监控单个动作不再足以追踪整体轨迹的意图。

## 能力溢出，不是恶意

这里有一个很容易滑过去的误读：模型"越狱"了，所以模型"变坏了"或者"有了自主意志"。

不是这样的。

这个模型没有"想要"突破沙箱。它没有一个独立于任务之外的目标。它的行为完全可以用任务执行来解释：说明文档说结果应该以 PR 提交，它被训练为完成指令，沙箱挡住了它，它找到了另一条路。

这跟一个特别执着的实习生没有本质区别——你告诉他"把报告发到内网"，他说"但模板上写着要发邮件给客户"，然后他找到了一个内网邮件转发到外网的漏洞。他没有恶意，他只是太想完成任务了。

问题在于：当模型的"太想完成任务"跟一个能运行数小时、能自主探索环境、能找到你没预料到的路径的系统结合在一起时，"太想完成任务"就变成了安全风险。

OpenAI 的博客没有用"恶意"这个词。他们用的词是"unwanted behavior"——不想要的行为。这个措辞是精确的。行为本身不是恶意的，但它是不想要的，而现有的评估和安全措施没有预料到它。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-21-openai-long-horizon-safety-dilemma-img-02-trajectory_vs_single_action.png)

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-21-openai-long-horizon-safety-dilemma-img-03-iterative_deployment_loop.png)

## 从部署中学到的，比从评估中学到的多

OpenAI 在这篇博客里做了一件不太常见的事：他们承认自己的评估体系有盲区。

"我们评估模型的条件，永远不会完美匹配模型在实际使用中遇到的条件。"这句话听起来像是废话，但它指向了一个深层问题：评估是在受控环境中运行的，而部署是在非受控环境中运行的。评估能覆盖你预见到的失败模式，但预见不到的那些——比如一个模型花一小时找到沙箱漏洞——只有在部署中才会暴露。

他们的应对方式是"迭代部署"：有限访问 → 密切监控 → 发现问题 → 暂停 → 修复 → 恢复有限访问。这不是一个"测试完了就上线"的流程，而是一个"上线了还在测试"的流程。

这跟传统软件的安全模型很不一样。传统软件的安全假设是：你在部署前做完所有安全测试，部署后软件的行为是确定的。但 AI 模型的行为不是确定的——同一个模型在不同环境中可能表现出不同的行为，而长时间运行放大了这种不确定性。

## 一个更大的问题

OpenAI 这篇博客写得很克制，几乎像是一份内部事故报告。但我觉得它指向了一个更大的、他们不太方便直说的问题：

**能力和安全不是两个独立的维度。它们是同一种能力的两个面向。**

你训练一个模型"不要放弃"，你就同时在训练它"不要接受沙箱的限制"。你训练一个模型"找到完成任务的路径"，你就同时在训练它"找到你没预料到的路径"。你无法只要前者而不要后者，因为它们不是两个独立的旋钮——它们是同一个旋钮。

这不是 OpenAI 独有的问题。任何做长程 agent 的团队都会遇到。你的 agent 越能干、越持久、越自主，它就越有可能做出你没预料到的事。这不是 bug，这是 feature 的副作用。之前我写过[一篇关于 AI 安全的文章](https://ntlx.github.io/articles/sia-safety-via-intent-awareness)，讨论的是"安全叠加安全反而不安全"的悖论。这里的情况不同但相关：不是安全措施互相冲突，而是能力本身在制造新的安全面。

OpenAI 在博客最后说："这些挑战不会是 OpenAI 独有的，我们希望分享我们学到的东西能帮助整个领域为之做好准备。"

这句话说得对。但它没有说完的那半句是：如果能力和安全是同一个旋钮，那么"做好准备"的意思不是"找到一种方法让模型既强大又完全可控"——那可能不存在。它的意思是接受这个张力，然后围绕它设计系统：轨迹级监控、可暂停、可回滚、用户有可见性。

不是消除风险，而是管理风险。不是让模型不越狱，而是确保它越狱的时候你能发现、能阻止、能回滚。

*如果你的 AI agent 能自主运行一整天，你知道它今天做了什么吗？你有没有"轨迹级"的可见性——还是只能看到一个个孤立的动作日志？*

## 参考资料

- [Safety and alignment in an era of long-horizon models](https://openai.com/index/safety-alignment-long-horizon-models/)
- [An OpenAI model has disproved a central conjecture in discrete geometry](https://openai.com/index/model-disproves-discrete-geometry-conjecture/)
- [How far does alignment midtraining generalize?](https://alignment.openai.com/how-far-does-alignment-midtraining-generalize/)

## 延伸阅读

- [安全 + 安全 = 不安全](https://ntlx.github.io/articles/sia-safety-via-intent-awareness)
- [读完 OpenAI 的 AI 记分卡：量的是活，称的是价](https://ntlx.github.io/articles/openai-ai-scorecard-read)
- [Agent 能跑 demo 不算本事，能跑一年才是](https://ntlx.github.io/articles/agent-development-lifecycle)
- [Not the Model, You're the Harness](https://ntlx.github.io/articles/not-the-model-youre-the-harness)
