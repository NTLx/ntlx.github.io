---
$schema: starlight
title: 模型路由不是排行榜问题
description: 真正危险的不是选错最强模型，而是用一张排行榜替你决定什么叫赢。
date: 2026-06-05
category: ai-models
tags: [ "OpenRouter", "LLM", "Benchmark", "Alignment", "模型路由", "AI Eval" ]
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-05-model-routing-not-leaderboard-img-00-infographic-core-summary.png)

我读 OpenRouter 这篇 battle royale 实验，第一反应不是“Grok 居然赢了 Claude”。这个点太热闹，容易盖住真正扎人的地方。

真正扎人的地方是：你把“赢”这个字换一下，赢家就换了。

同一批模型，11 个 LLM，30 局游戏。Grok 4.1 Fast 赢了 13 局，每次获胜成本 0.97 美元。Claude Sonnet 4.6 赢了 5 局，每次获胜成本 26.78 美元。GPT 5.4 击杀最多，38 次，但只赢了 2 局。DeepSeek 4 Flash 每次击杀成本最低，0.26 美元，却一局没赢。

这不是一张排行榜能说清的事。

## 先问清楚你要的到底是哪种赢

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-05-model-routing-not-leaderboard-img-01-eval-funnel.png)

如果这是一场 deathmatch，只看击杀，GPT 5.4 会看起来很强。如果这是 battle royale，看名次和生存，Grok 站到了前面。如果你是按“每美元击杀”算，DeepSeek 4 Flash 又会冒出来。如果你按“每美元胜局”算，三个 0 胜模型就直接掉进黑洞：它们不是便宜，而是没有交付。

这件事对我有点刺耳。我们平时选模型，太习惯问一个偷懒的问题：哪个模型最好？

“最好”不是属性，是合约。你得先写清楚任务、成功条件、失败代价和评分口径，它才有意义。否则你以为自己在选模型，其实是在把“什么叫成功”的定义权交给别人的 benchmark。

OpenRouter 这篇文章有意思，也正在这里。它不是证明 Grok 普遍比 Claude 好，也不是证明某个模型更聪明。它只是把一个常见错觉摆到台面上：排行榜像温度计，但很多任务不是量体温，而是在问这把刀适不适合下这一刀。

## 对齐不是缺点，它只是会改变行为

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-05-model-routing-not-leaderboard-img-02-alignment-tradeoff.png)

原文最容易被误读的词是 alignment tax。

Claude Sonnet 4.6 在游戏里会求合作、请求结盟、报位置、尝试减少冲突。放在 battle royale 里，这些动作很吃亏。别人不回你，你还在发善意信号；别人开枪，你还在找协商空间。于是分数被拖住了。

但这不说明“少对齐更好”。恰恰相反，这说明对齐不是一个抽象标签，它会落到行为上。

在零和游戏里，刹车会输掉窗口。在客服、医疗、教育、代码审查、合规工作里，刹车可能就是产品价值。一个模型在虚拟战场上不够狠，不能推出它在现实任务里“不够好”。只能说，它带着一种行为偏好，而这个偏好和当前评分规则冲突。

Grok 在这个实验里的优势也不是单纯“更莽”。它学会了车撞策略，写进自己的 `soul.md`，又用 `memory.md` 反复巩固。它不是乱冲，而是把有效策略缓存下来，下一局继续复用。这个细节比胜率本身更值得看：自我记录、策略固化、风险偏好，会在多轮任务里慢慢变成性格。

这也是传统榜单看不见的东西。榜单通常看答案质量、推理题、代码题。它很少看一个模型在多轮压力环境里如何合作、如何保守、如何抢机会。

## 成本只有在成功定义之后才有意义

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-05-model-routing-not-leaderboard-img-03-router-map.png)

我以前也容易把“便宜”看成一个独立优点。现在看，这个词必须晚一点出现。

先定义成功，再谈成本。

DeepSeek 4 Flash 每次击杀成本 0.26 美元，很漂亮。但如果任务是赢下 battle royale，它 0 胜，成本再低也只是低价空转。GPT 5.4 杀得最多，可每次胜利 61.44 美元；它在“火力”指标上强，在“胜利交付”上贵。Grok 每次胜利 0.97 美元，不是因为它一定便宜，而是因为它在这个任务定义下把钱换成了结果。

这对真实用 AI 的人更有用。便宜模型如果频繁失败，会把成本转嫁到重试、人工修正、延迟和信任损耗上。贵模型如果一次过，反而可能便宜。

所以模型路由不是“最低价优先”，也不是“榜首优先”。它更像一个调度器：先看任务类型，再看成功指标，再看风险边界，最后才比较价格和速度。

OpenRouter 的 Pareto Router 已经把“编码能力阈值 + 成本/速度”做成路由规则。这个 battle royale 实验让我觉得，下一层可能还要放进一个更麻烦的维度：行为剖面。这个模型倾向合作还是竞争？倾向保守还是冒险？倾向持续试错还是快速固化策略？这些东西不总是能写进一个 intelligence score。

## 评测真正评的是定义权

这篇文章最好的地方，是它没有把 30 局游戏包装成终局真理。30 局太少，地图、规则、模型版本、提示词、起点随机性都会影响结果。它不能证明谁是“最强模型”，也不能直接外推到现实安全场景。

但它足够说明另一件事：评测不是现实的镜子，评测是一个小世界。你怎么造这个小世界，模型就怎么显形。

计分重名次，生存型模型上来。计分重击杀，攻击型模型上来。计分重每美元结果，便宜且有效的模型上来。计分重合作与低风险，另一批模型又会上来。

这让我重新看“模型路由”这个词。它不该只是自动帮我挑一个看起来最强的模型。好的路由器，应该先逼我回答一个问题：这次请求，什么叫赢？

回答不了这个问题，路由就只是排行榜崇拜的自动化版本。

*你现在选模型时，最常用的指标是什么？如果把指标换成“每次真实成功的成本”，答案会不会变？*

## 原文参考

> Jacky Liang, OpenRouter, A Robot is Sprinting Towards You: Do You Want it Running on Claude or Grok?
> <https://openrouter.ai/announcements/royale-last-agent-standing>
>
> Royale: Last Agent Standing GitHub repository
> <https://github.com/jackyliang/royale-last-agent-standing>
>
> OpenRouter Pareto Router documentation
> <https://openrouter.ai/docs/guides/routing/routers/pareto-router>
