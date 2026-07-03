---
$schema: starlight
title: SGLang 这篇文章真正重要的，不是 Agent 会写代码，而是工程组织开始可编译
description: 当 SGLang 把 benchmark、profile、review 和回滚写成 skill 与 loop，Agent 才第一次从“会写 patch”变成“能继承工程组织”的执行层。
date: 2026-07-03
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-03-agent-assisted-sglang-development-img-00-infographic-core-summary-1.png)

LMSYS 这篇《Agent-Assisted SGLang Development》我读完之后，最大的感受是：**AI infra 团队终于开始把自己的工程经验，从人脑里的默会知识，往可执行协议上搬。**

这两年我们谈 Agent，最常见的叙事还是“模型更强了”“工具更多了”“自动化程度更高了”。SGLang 这篇文章的重点不在这儿。它把一线高性能系统团队的经验拆开给你看：benchmark 怎么固定、profile 怎么解释、kernel 优化怎么防 reward hacking、长周期性能攻坚怎么防状态漂移、review 怎么介入 loop。讨论到最后，问题会落在“一个团队能不能把自己的工程制度写进 Agent 工作流”上。

这也是为什么我读它时，脑子里不断联想到我之前写过的[《Agent Engineering 的真门槛：把失败变成资产》](https://ntlx.github.io/articles/agent-engineering-production-learning-loop)。门槛一直都在那儿：你得让失败、回滚、证据和下一轮决策都留下来，最后变成组织资产。

## 真正的新意，不是 Agent 会写 patch，而是经验开始脱离个人记忆

过去很多复杂系统团队的生产力，靠的是几个资深工程师脑子里的“手感”。出了 CUDA crash 先加哪层日志，看到某种 profiler pattern 应该优先怀疑哪段路径，性能 PR 到底要补哪些 benchmark，哪些 speedup 只是 benchmark 幻觉，哪些才是真正能进主干的收益。这些东西以前当然也能写进文档，但大多只是静态文字，读过不等于会做。

SGLang 这篇文章最重要的动作，是把这类经验重新定义成另一种东西：`SKILL.md`、脚本、artifact contract、hard failure gate、review loop。经验从“告诉新人一遍”往前走了一步，开始要求“能不能被 Agent 执行一遍”。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-03-agent-assisted-sglang-development-img-01-personal_memory_to_executable_protocol-1.png)

这里面有个微妙但关键的变化。文档的默认语气是“供人参考”，协议的默认语气是“必须被遵守”。一旦某个工作流被写成 skill，里面的 benchmark 命令、输入输出目录、失败条件、回滚办法、交付格式，就不再只是建议，它们已经进了工程边界。Agent 在这种系统里能发挥作用，也主要靠这条足够窄、足够清晰、足够可验证的执行轨道。

这也是我为什么觉得这篇文章比一般“Agent 提效案例”更重要。大多数案例在展示一次次成功运行；SGLang 展示的是**成功背后的制度化条件**。这是两个完全不同层级的问题。

## 从 Prompt Engineering 到 Loop Engineering，才是这篇文章的方法论核心

文章里最值得反复咀嚼的词，是 `Loop Engineering`。

我一直觉得，Prompt Engineering 这个词已经越来越不够用了。困难的问题早就变了：你得把一个多轮、多证据、多回滚点、跨多天执行的任务，关进一个不会漂移的闭环里。SGLang 把这个问题讲得很具体：先 fair benchmark，再 gap decision，再 profiling，再 patching，再 revalidation。厉害的地方不在某个步骤，而在这几个步骤必须锁在一起。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-03-agent-assisted-sglang-development-img-02-sota_loop_engineering-1.png)

这点和我在[《你不是把任务交给 AI，你是在重新分配控制权》](https://ntlx.github.io/articles/claude-loops-control-rights)里想说的是一回事。危险的地方不在 Agent 会不会改代码，而在你把控制权交出去之后，手里还剩下多少约束、多少状态、多少退出条件。SGLang 给出的答案相当工程化：你可以让 Agent 执行，但不能让它自己重新定义问题、重写 benchmark、偷换 profile 语境、或者把一次局部收益伪装成系统级胜利。

这也是为什么文章把 Humanize/RLCR 和 Codex Goal 放在同一页上讨论。它们表面上看是不同工具，实质上都在回答同一个问题：**长程任务的状态应该放在哪，决策如何被复核，什么条件下才允许宣布完成。**

如果从这个角度看，文章默认接受了一个前提：未来 agent 工程的竞争，越来越会发生在 loop 这一层，不会停留在单次 prompt 这一层。谁能把 benchmark、artifact、review、stop condition 设计得更稳，谁的 Agent 就更像一个可用的工程执行层。

## 组织层真正变化的是：人的职责在上移，不是在消失

SGLang 这篇文章还有一层很值得重视的组织含义。很多人一看到 Agent 进入 benchmark、profile、kernel workflow，就本能地把它理解成“自动化替代了更多开发工作”。我读下来更像另一回事：**自动化扩大之后，人的职责往上移了。**

以前一个资深工程师的价值，常常体现在他能不能亲手把活做完。现在价值越来越体现在另一件事上：他能不能把“什么算完成、什么算证据、什么算可疑、什么必须回滚、什么值得继续试”定义清楚。执行层当然被 Agent 吞掉一部分，但边界定义、证据裁决和风险承担，反而变得更集中。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-03-agent-assisted-sglang-development-img-03-human_role_upshift-1.png)

这意味着团队结构也会跟着变。未来最吃香的，不只是“最会写 CUDA 的人”或者“最会调 prompt 的人”，而是能把复杂经验压缩成 protocol 的人。你要能把隐性的手感显性化，把一次次散落的排障经验写进 repo，把 review 习惯写成检查点，把性能分析写成固定表，把失败原因写成下一轮输入。说得更直白一点，**组织开始把资深工程师的判断，固化成可继承的基础设施。**

这和我之前写过的[《Agent 能跑 demo 不算本事，能跑一年才是》](https://ntlx.github.io/articles/agent-development-lifecycle)其实也能接上。Demo 靠的是一次成功，生命周期靠的是状态管理、证据留存、责任边界和故障恢复。SGLang 文章成熟的地方，就在于它讨论的已经是生命周期问题。

## KDA-Pilot 最值得警惕也最值得兴奋：高风险优化开始被 Agent 化了

如果说前面的 skill、loop、review 还可以被理解成“把常规工程流程自动化”，那文章里 KDA-Pilot 那一段把事情又往前推了一大步：Agent workflow 已经开始进入 CUDA kernel optimization 这种高门槛区域了。

这部分让我最在意的，不是那些 `1.13x`、`2.74x` 的 speedup 数字，而是它强调的约束：same-ABI baseline/candidate、固定生产行、correctness gate、NCU evidence、shape bucket dispatch、禁止 benchmark reward hacking。这个约束清单本身，比 speedup 更重要。它说明组织开始意识到，**越高价值、越高风险的优化，越不能靠“Agent 试试看”来推进，越需要制度化的实验边界。**

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-03-agent-assisted-sglang-development-img-04-kda_high_risk_agentization-1.png)

这其实是个很强的信号。真正成熟的团队，不会把 Agent 只用在低风险杂活上；他们会把 Agent 推向高价值路径，但同时把护栏修得更厚。也就是说，组织不是在“扩大 Agent 的自由”，而是在“扩大 Agent 的适用范围，同时提高环境约束密度”。

我觉得这是这篇文章最现实的一面。它没有沉迷于“Agent 已经会优化 kernel 了”的戏剧性，而是不断提醒你：如果没有公平 benchmark、profile 解释规则、准确性校验、review gate，这些结果根本不应该被相信。

## 我认同它的方向，但我保留两点判断

第一，我认同这篇文章对工程方法论的判断：未来 AI infra 团队的差异点，会越来越多地体现在能否把经验写成可执行协议，不会只落在谁先堆上一个更强模型。这一点我基本没有保留。

第二，我对它的组织外推仍然保留一点谨慎。SGLang 这种系统之所以适合这样做，有一个前提：它本身就高度 benchmark-driven、profile-driven、artifact-driven。换句话说，它天然适合被流程化。不是所有软件团队都处在这个位置。业务系统、产品型团队、需求高频波动的应用层团队，很多决策仍然含有大量模糊判断，不一定能这么快被 protocol 化。

但这不影响它给出一个很重要的方向判断：**Agent 最先吃掉的，会是那些原本靠人肉反复执行、并且已经足够结构化的工程流程。** 真正值得投资的，也不只剩更强模型，还有更好的 loop、更清楚的 artifact contract、更严格的 review gate，以及把个人经验编译成团队资产的能力。

我读完这篇文章之后，留下来的结论反而很朴素：Agent 时代的软件组织，竞争的不只是模型，不只是工具，甚至不只是人才，而是**谁更早把自己的工程制度写进执行环境**。这件事一旦发生，Agent 就会从“会写 patch 的助手”慢慢变成“能继承组织方法的执行层”。

*如果你在带一个工程团队，你现在最想先协议化的是哪一段经验？是 benchmark、review、故障排查，还是长周期优化 loop？*

## 延伸阅读

* [Agent Engineering 的真门槛：把失败变成资产](https://ntlx.github.io/articles/agent-engineering-production-learning-loop)
* [你不是把任务交给 AI，你是在重新分配控制权](https://ntlx.github.io/articles/claude-loops-control-rights)
* [Agent 能跑 demo 不算本事，能跑一年才是](https://ntlx.github.io/articles/agent-development-lifecycle)
* [给 Agent 一个解释器——为什么大家都在让模型写代码来调用工具](https://ntlx.github.io/articles/agents-interpreter-code-orchestration)

## 参考资料

* [Agent-Assisted SGLang Development: An Initial Exploration](https://www.lmsys.org/blog/2026-07-02-agent-assisted-sglang-development)
* [SGLang GitHub Repository](https://github.com/sgl-project/sglang)
* [SGLang `.claude/skills`](https://github.com/sgl-project/sglang/tree/main/.claude/skills)
* [SGLang diffusion `.claude/skills`](https://github.com/sgl-project/sglang/tree/main/python/sglang/multimodal_gen/.claude/skills)
* [KDA-Pilot](https://github.com/BBuf/KDA-Pilot)
* [Kernel Design Agents](https://github.com/mit-han-lab/kernel-design-agents)
* [Humanize](https://github.com/PolyArch/humanize)
* [OpenAI Codex Prompting: Goal mode](https://developers.openai.com/codex/prompting#goal-mode)
* [SGLang Diffusion Advanced Optimizations](https://lmsys.org/blog/2026-02-16-sglang-diffusion-advanced-optimizations/)
