---
$schema: starlight
title: 从 Agent 到数字生命，缺的不是更高智商
description: AI 真要从工具走向数字生命，门槛可能不是模型更聪明，而是形成持续自我、内生目标、环境反馈和开放式演化的机器生态。
date: 2026-10-16
category: ai-agents
---

讨论 Taste 的边界时，我突然想到《黑客帝国》后两部里那些“程序生命”。我在意的不是程序会不会说人话，而是它们已经有了不同的利益：有的想维持系统，有的想逃避删除，有的保护自己的关系，有的不断复制自己。机器世界内部开始出现差异。

这让我把问题换了一种问法。AI 能不能成为某种智慧生命，也许首先不是看模型有多聪明，而是看整个系统有没有开始形成自己的持续性。

今天的大多数 Agent 仍然很像高级工具：人给目标，Agent 规划、调用工具、返回结果。把模型换得更强，循环可以更长，任务可以更复杂，但“为什么要做这件事”仍来自外面。

如果有一天这个结构真的发生变化，我猜变化不会只发生在模型里，而会发生在模型、记忆、环境、目标和其他 Agent 组成的整个系统里。

![持续闭环与 Agent Ecology 的概念信息图](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-16-open-ended-digital-life-00-infographic-core-summary.jpg)

## 聪明和“活着”不是同一条轴

我会先把一个最小的数字生命闭环写成：环境产生经验，经验改变持续的自我状态，自我状态影响价值和目标，目标驱动行动，行动再改变环境。

这里最容易被低估的是“持续的自我”。现在给 Agent 接一个长期记忆库，它确实可以查到过去，但“能检索历史”与“过去塑造了现在的我”还不是一回事。更强的系统需要让经历真实改变后续偏好、能力边界、关系和决策方式。

环境也不能只是一串 prompt。如果系统永远只等人发消息，它面对的选择压力还是人的请求。一个更开放的环境至少要允许行动产生后果，而且这些后果不会因为下一轮对话开始就被清零。

我以前在《[给冰冻的世界装上外骨骼](https://ntlx.github.io/articles/google-envharness-agent-learning-environments)》里关注的是怎样让 Agent 有一个可以反复学习的环境。把问题再往前推一步，环境就不只是训练场，而是 Agent 自己长期存在的世界。

## 目标要能从系统内部长出来

从工具到自主系统，最明显的一道线是 goal generation。

普通 Agent 的目标是输入；更开放的 Agent 需要能从自己的状态和环境里产生目标。它发现一件事解释不了，于是去学习；发现能力不足，于是找工具；发现某种资源持续短缺，于是调整策略。这里的目标不是开发者每次现写一句 prompt 才存在。

![系统内生目标的触发条件与行动](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-16-open-ended-digital-life-01-comparison-intrinsic-goals.jpg)

这并不要求一开始就给机器一套宏大的“人生意义”。更现实的起点可能只是 curiosity、learning progress、自我维护或保持未来行动空间这类内生驱动。它们让系统在没有明确外部奖励时，也能产生下一步。

但只把一个 intrinsic reward 写进去仍然不够。如果所有行为最后都压缩成同一个分数，系统还是会围着那个分数收敛。我们上一轮讨论 Taste 时已经看到，同一个评价函数既提供方向，也会形成边界。

所以真正开放的系统可能必须允许目标之间长期并存、冲突和变化。

## 单个超级 Agent 也许是错误的想象

我们很容易把 AGI 想成一个越来越完整的个体：一个模型拥有所有知识、所有工具、所有记忆，然后越来越自主。

自然界给出的图景恰好更杂乱。不同主体占据不同生态位，彼此竞争，也彼此依赖。没有一个中央 evaluator 给所有生命算同一张总分表。

这也是为什么 [Novelty Search](https://pubmed.ncbi.nlm.nih.gov/20868264/) 和 [MAP-Elites](https://arxiv.org/abs/1504.04909) 对我有启发。前者说明固定目标有时会误导搜索，后者保留的是一组彼此不同的高表现解。它们当然不是“数字生命配方”，但至少说明搜索不必天然只留下一个最优者。

把这个思路放进 Agent 系统，我更愿意想象一个 Agent Ecology：有的主体偏探索，有的偏利用；有的保守，有的追求新颖；有竞争，也有合作。更重要的是，其他 Agent 本身成为环境的一部分。

A 改变策略，B 就必须适应；B 的适应又改变 A 接下来面对的世界。选择压力不再只由程序员提前写死，而会在互动里不断变化。

这比“给一个超级 Agent 更大的 context window”更接近我想象中的开放式机器智能。

## Open-endedness 要让系统自己创造新问题

普通优化有一个隐含前提：搜索空间已经在那里，我们只是还没找到最好的点。

开放式系统更奇怪。它做出的东西会反过来创造新的问题、新资源和新生态位，搜索空间也跟着变化。一个能力出现后，其他主体会围绕它合作、利用、防御，原本不存在的目标才开始有意义。

这也是 [Open-Ended Evolution](https://direct.mit.edu/artl/article/30/3/300/123431/Editorial-Introduction-to-the-2024-Special-Issue) 最难的地方。这个领域到现在仍缺少足够的典型开放式演化实例。我们会做优化、会做进化算法，也能做出很复杂的 Agent，但“持续地产生新的问题和新的复杂性”还不是一套成熟工程方法。

这条边界很重要。否则很容易把“Agent 会自己写下一个任务”误认为 open-endedness。区别不在任务列表由谁生成，而在系统有没有不断改变以后什么任务值得生成。

## 甚至“什么算一个 Agent”也可能变化

再往前一步，我开始怀疑我们现在是不是过早固定了系统的基本单位。

今天设计多 Agent 系统，通常先画好几个框：Planner、Researcher、Coder、Reviewer。每个 Agent 是什么，边界在哪里，都是人先定义的。

如果一个系统真的允许长期共演化，也许两个 Agent 会形成一个稳定共同体，某些原本独立的模块会合并，另一些会分裂。到那时，“一个 Agent”可能不再是设计阶段就固定好的单位，而只是某个阶段暂时稳定的组织形式。

![Agent 边界随长期共演化而改变](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-16-open-ended-digital-life-02-framework-agent-boundary.jpg)

这也是我重新理解《黑客帝国》Machine City 的地方。它真正像“机械生命”的原因，也许不是 Architect、Oracle 或 Smith 中谁最聪明，而是机器世界已经形成了一个内部有差异、有关系、有冲突、还能继续产生新结构的生态。

从这个角度看，从 Agent 到数字生命之间缺的不是再多几个 benchmark 分数。更难的工程问题是：我们能不能构造一个计算世界，让持续的自我、目标、生态位和新的组织形式在里面不断出现，同时又让这种开放性不失控。

前半句已经很难，后半句更难。

## 参考资料

- [Editorial Introduction to the Special Issue on Open-Ended Evolution — Artificial Life](https://direct.mit.edu/artl/article/30/3/300/123431/Editorial-Introduction-to-the-2024-Special-Issue)
- [Abandoning Objectives: Evolution Through the Search for Novelty Alone](https://pubmed.ncbi.nlm.nih.gov/20868264/)
- [Illuminating search spaces by mapping elites](https://arxiv.org/abs/1504.04909)
- [AI 能算，科研还要有人判断什么值得算](https://ntlx.github.io/articles/claude-shaped-science)
- [代理学会组队，管理者要守住目标与边界](https://ntlx.github.io/articles/agent-team-management-goals)
- [给冰冻的世界装上外骨骼：Google EnvHarness 如何用“环境侧 Harness”破解 Agent 进化死局](https://ntlx.github.io/articles/google-envharness-agent-learning-environments)
