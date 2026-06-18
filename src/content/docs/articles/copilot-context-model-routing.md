---
$schema: starlight
title: Copilot 真正在省的不是 token
description: 账单按 token 走以后，模型、上下文和工具都变成调度问题，选择权开始从用户手里移到运行时。
date: 2026-06-18
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-18-copilot-context-model-routing-img-00-infographic-core-summary.png)

我读 GitHub 这篇 Copilot 文章，第一反应不是“Auto 模式终于更聪明了”。

这个说法太顺了，顺到没什么信息量。让我停下来的地方是另一件事：GitHub 开始把一次 AI 编程会话，当成一个需要调度的系统来处理。

以前我们聊 AI 编程工具，常问两个问题：模型够不够强？上下文够不够大？这两个问题当然重要。但这篇文章的重心不是把窗口开到最大，也不是永远上最贵的推理模型。它说的是：缓存什么时候保留，工具定义什么时候加载，模型什么时候该切，什么时候不该切。

换个说法，Copilot 真正在省的不是 token。它在省一次会话里那些“不该被重新计算的东西”。

## 省 token，要先少重复

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-18-copilot-context-model-routing-img-01-cache-boundary-routing.png)

GitHub 提到两个动作：prompt caching 和 deferred tools。

这两个词看起来很工程，意思其实很朴素。长会话里，Copilot 每轮都要带着一堆固定东西上路：系统指令、仓库信息、历史对话、工具定义、任务状态。问题是，这些东西不是每轮都同样有用。更糟的是，很多内容每轮都在重复付费。

prompt caching 不只是让模型“记性更好”。它更像给会话前缀打一层缓存：重复的 prefix 不要每次重新算。tool search 也不是把工具变少，而是让工具定义延迟加载。你有很多工具没问题，但别把整箱工具说明书每轮都塞给模型。

这和我平时用 coding agent 的体验很接近。那句“帮我改这个 bug”本身未必烧钱，后面每一轮都拖着同一批 instructions、同一批工具 schema、同一段已经发生过的历史在跑，才烧钱。你以为贵的是思考，其实贵的是搬家。

GitHub 旧文讲过 Copilot context 的演进：neighboring tabs 带来 5% relative acceptance lift，FIM 带来 10% relative boost。那时的关键词是“给模型更多相关上下文”。到了 agentic session，关键词变成了：少重复、晚加载、按需进入。

这是一条很清楚的线。Copilot 从补全时代就在做 prompt 组装，只是以前组装的是当前文件、打开的 tab、光标前后代码。现在组装的是一整个代理会话。

## Auto 更像调度器

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-18-copilot-context-model-routing-img-02-model-router-task-profile.png)

更有意思的是 Auto。

如果把 Auto 理解成“GitHub 帮我选模型”，那它只是一个更省心的下拉框。但文章里的 Auto 走得更远。它看两个信号：当前模型健康状态，和这次任务到底需要什么能力。

前者像云服务调度：availability、utilization、speed、error rates、cost。一个模型理论上能做，不代表此刻最适合做。后者靠 HyDRA：把 query 拆成 reasoning、code generation、debugging、tool use 几个能力维度，再找满足要求的最便宜模型。

这一步很关键。过去很多模型路由，还是“强模型 vs 弱模型”的二分类。HyDRA 的思路更像资源调度：任务有 profile，模型也有 profile，路由器做匹配。论文里说它生产环境 CPU median inference latency 是 86 ms；SWE-Bench Verified 上，iso-quality 匹配 Sonnet，同时节省 54.1% 成本，远高于原来二分类 router 的 9.1%。

所以我不把它读成“便宜模型也不错”的故事。

它真正指向的是：模型能力不该被压成一个分数。解释一段代码、改一个小函数、追一个跨文件 bug、让 agent 调工具跑测试，这四件事不该被同一个“最强模型”概念覆盖。所谓 Auto，本质上是在问：这次请求到底需要哪几块能力？

我觉得这里有个反直觉的变化：用户选择权变少了，但系统能力可能变强了。

以前你自己选模型，表面上自由。可你其实并不知道此刻哪个模型拥堵、哪个模型失败率高、哪个模型对当前任务的边际收益不值得。Auto 把这部分判断收回去，代价是透明度变低，收益是它能看到单个用户看不到的运行时信号。

这已经越过纯产品体验，进入控制权迁移。

## 最大上下文也有账单

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-18-copilot-context-model-routing-img-03-context-budget-flow.png)

6 月 4 日，GitHub 刚宣布 Copilot 支持 one-million-token context windows 和 configurable reasoning levels。听起来像好消息：窗口更大，推理更深，工具更强。

但这篇文章马上给另一面：更大的窗口和更高的 reasoning 会消耗更多 AI credits。窗口变大以后，稀缺的开始变成判断权：谁决定哪些东西配进入窗口？

这点特别容易被忽略。我们很容易把“context window”当成硬盘容量：越大越好。可 AI 会话不是存档，是运行时。你放进去的每个文件、每条历史、每个工具定义，都会改变成本、延迟和注意力分配。

所以 Auto 不在每轮都切模型。文章里说得很直接：中途切模型会破坏 prefix cache，可能比省下的模型差价更贵。它选择在自然 cache boundary 路由：第一轮，或者 compaction 之后。

这个设计比“自动选择最佳模型”更诚实。它承认一次 agent session 有状态。模型也不是无成本热插拔的 CPU 核心，缓存边界是真实存在的。你在中途换模型、换 reasoning level、换工具配置，看起来是在精调，其实可能是在把已经攒下来的缓存推倒重来。

这也解释了 GitHub 给用户的建议为什么那么具体：保持 context focused、切任务就新开会话、别在会话中途乱改模型或设置、只启用需要的工具、parallel agent 先规划再开。

这些建议看起来小，其实是在教用户配合调度器。

## 账单会把抽象问题压实

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-18-copilot-context-model-routing-img-04-cost-governance-loop.png)

这篇文章放在 2026 年 6 月读，味道和以前不一样。

因为 Copilot 已经从 premium request units 转到 GitHub AI Credits。GitHub 4 月底说得很清楚：从 6 月 1 日开始，usage based billing 按 token consumption 算，包括 input、output、cached tokens。

这就让所有“上下文效率”突然变得很实在。

以前 token 浪费像性能问题，最多让你慢一点、烦一点。现在它是账单问题。企业还能按 user、model、organization、cost center 看 AI usage，设置 user、cost center、enterprise 级 budget。换句话说，模型路由不再只是个人偏好，它会进入组织治理。

这也是文章刺到我的地方。GitHub 没有只说“我们把 Copilot 做得更聪明了”。它其实在搭一套新的默认秩序：

用户提出任务，harness 判断上下文，router 判断模型，billing 系统记录消耗，管理员设定边界。

开发者还在聊天框里说“帮我改一下”，但背后已经是一套云资源调度系统。谁能看见任务意图，谁能看见模型健康，谁能看见成本中心，谁就拥有真实的决策权。

这未必是坏事。手选模型本来就是一种伪自由。大多数时候，我们并不知道该选哪个，也不该被迫知道。可也别把 Auto 当成魔法。Auto 的关键问题以后会变成：它凭什么判断我的任务？它怎么解释一次路由？管理员强制 Auto 后，开发者还能不能在高风险任务上要求更强模型？当成本和质量冲突时，系统默认站在哪边？

GitHub 这篇文章给了一个技术答案：缓存、延迟工具、HyDRA、cache-aware routing。它还没完全回答一个治理问题：当模型选择变成平台调度，用户还剩下哪些可审计的选择？

我现在更愿意把 Copilot Auto 看成 AI 编程工具成熟的标志。成熟的信号，不是把按钮做少，而是把原来靠用户拍脑袋的决策，收进系统里，由数据、缓存和预算一起决定。

但这也意味着，下一阶段比拼的不是谁的模型下拉框更长。

是哪个平台更会安排一次会话。

*你更愿意自己手选模型，还是把选择权交给 Auto？如果 Auto 选错了，你希望它给你看哪些解释？*

## 原文参考

> Joe Binder, GitHub Blog, Getting more from each token: How Copilot improves context handling and model routing
> <https://github.blog/ai-and-ml/github-copilot/getting-more-from-each-token-how-copilot-improves-context-handling-and-model-routing/>
>
> GitHub Docs, About Copilot auto model selection
> <https://docs.github.com/en/copilot/concepts/auto-model-selection>
>
> Aashna Garg et al., HyDRA: Hybrid Dynamic Routing Architecture for Heterogeneous LLM Pools
> <https://arxiv.org/abs/2605.17106>
>
> GitHub Blog, GitHub Copilot is moving to usage-based billing
> <https://github.blog/news-insights/company-news/github-copilot-is-moving-to-usage-based-billing>
>
> GitHub Changelog, Larger context windows and configurable reasoning levels for GitHub Copilot
> <https://github.blog/changelog/2026-06-04-larger-context-windows-and-configurable-reasoning-levels-for-github-copilot>
>
> GitHub Blog, How GitHub Copilot is getting better at understanding your code
> <https://github.blog/ai-and-ml/github-copilot/how-github-copilot-is-getting-better-at-understanding-your-code>
>
> GitHub Docs, Managing your company's spending on GitHub Copilot
> <https://docs.github.com/en/copilot/how-tos/manage-and-track-spending/manage-company-spending>
