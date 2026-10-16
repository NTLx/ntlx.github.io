---
$schema: starlight
title: 为排行榜第一名买单之前，先问任务门槛够不够得着
description: OpenRouter 提出 Agent 模型选型的三步框架：定义质量门槛、用真实样例计算每质量点成本、选最便宜且有余量的模型。读后我认为，模型选型本质是任务门槛管理，真正该买的是刚好够用的余量。
date: 2026-10-16
category: ai-models
primarySourceUrls: ["https://openrouter.ai/blog/insights/cost-vs-quality-tradeoff-framework-for-agent-models/"]
---

读完 OpenRouter 这篇 [Cost vs. Quality Tradeoff Framework for Agent Models](https://openrouter.ai/blog/insights/cost-vs-quality-tradeoff-framework-for-agent-models/)，我把“模型选型”这件事重新放回工程现场来看。

![模型选型的核心：先设质量门槛，再测真实成本，最后选择有余量的最低成本模型](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-16-cost-quality-tradeoff-agent-models-img-00-infographic-core-summary.png)

它的核心观点很简单：排行榜名次是模型在许多任务上的平均表现，而你的 Agent 任务往往只是其中很窄的一条。所以该问的不是哪个模型最强，而是完成你的任务最便宜的是谁。

## 三步把选型变成测量

OpenRouter 的框架只有三步：

1. 先给任务定一个质量门槛，低于它的再便宜也不要；
2. 拿出 20–50 条自己的真实样例，同时跑便宜、中端、前沿三款模型，统一打分后算出每质量点的成本；
3. 选最便宜且能以余量越过门槛的模型，而不是分数最高的那个。

文章提醒要从 API 响应的 `usage.cost` 字段读实际花费，而不是拿价目表去乘估算的 token 数。Agent 工作流里有工具调用、中间步骤和重试，单次 completion 的标价会严重低估真实成本。

## 同一份任务，不同门槛，答案不同

原文用支持路由的任务举例，85% 准确率是门槛：

| 模型 | 每千次成本 | 质量得分 | 是否达标 |
| --- | --- | --- | --- |
| `openai/gpt-5.6-luna` | $0.32 | 82 |  未达标 |
| `google/gemini-3.7-flash` | $1.09 | 89 | ✅ 达标 |
| `anthropic/claude-opus-5` | $7.25 | 97 | ✅ 达标但太贵 |

只看排行榜，Claude Opus 5 接近性能天花板；但在这个任务里，Gemini 3.7 Flash 以更便宜的价格越过了门槛。如果把门槛提到 95%，就只有 Claude Opus 5 能过关，这时你就得为那额外的准确率付 $7.25/千次。

同一份任务，门槛一变，最优解也跟着变。这就是把“够得着”放在“第一名”前面考虑的原因。

![OpenRouter 原文中的模型质量门槛示意图](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-16-cost-quality-tradeoff-agent-models-img-openrouter-framework-hero.png)

## 余量比最高分更实在

原文有句话我印象很深：“Pick the cheapest model that clears the bar with margin, not the model that wins outright.”

模型表现会波动。权重更新、流量漂移、新版本发布都会让分数上下移动。如果选一个刚好贴着门槛的模型，生产环境一次正常波动就可能把它推下去。OpenRouter 建议多次运行或换一批新鲜流量，记录分数波动范围，让胜选模型的余量覆盖这个范围。

这和我们买容量一个道理：不要买刚好够用的，要买有缓冲的。只是模型选型时，这点常被忽略。

## Agent 的成本不是单次 completion

另一个常被忽略的事实：Agent 不是一次 completion 就完事。

一个三步循环的 Agent，每一步都要调用模型；再加上工具调用、中间推理和重试，实际成本是单次完成价格的好几倍。如果每一步都用排行榜第一名， frontier 价格会被反复支付。而一个便宜模型若能稳定处理其中 90% 的步骤，只在复杂步骤升级到贵模型，整体成本就会低很多。

所以 OpenRouter 才强调用完整 Agent run 的真实 `usage.cost`，而不是价目表上的 prompt/completion 单价。

![完整 Agent run 中各次模型响应的 usage.cost 会累积，重试会增加额外模型调用](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-16-cost-quality-tradeoff-agent-models-img-02-flowchart-agent-run-cost.png)

## 版本和价格都会过期，重跑流程才有价值

文章提到，2026 年 5 月到 9 月，Gemini Flash 就更新了 3.5、3.6、3.7、3.8 四个版本。几个月前的选型结论，现在可能已经过时。

OpenRouter 的解法是“让重跑很便宜”：统一的 OpenAI-compatible 接口，换模型只改一行字符串；保留测试脚本和样例集，模型或价格一变就能快速重新比较。这个思路比任何一次具体结论都更值得留下。

## 我的判断

我的核心判断是：模型选型本质上是任务门槛管理，不是能力排名竞赛。真正该买的是刚好够用的余量，而不是排行榜第一名。

这个框架也适用于其他“够用就好”的工程决策：先定标准，再测真实成本，最后选最经济且有余量的方案。很多时候“足够好”比“最好”更划算——不是因为最好的不够好，而是你的任务根本不需要那么多能力。

如果你正在做 Agent 项目，可以立刻做一件事：选出最重要的一个任务，收集 20–50 条真实样例，跑一次便宜/中端/前沿三组模型，用统一标准打分，算出你的 cost per quality point。这个数字，比任何排行榜都更接近真实决策依据。

## 参考资料

- OpenRouter: [Cost vs. Quality Tradeoff Framework for Agent Models](https://openrouter.ai/blog/insights/cost-vs-quality-tradeoff-framework-for-agent-models/)
- 站内相关：《[模型选型只是虚晃一枪：读 OpenRouter 的大模型供应商性能评估与动态路由指南](https://ntlx.github.io/articles/evaluating-llm-provider-performance-routing/)》
- 站内相关：《[选模型别只看标价：读 OpenRouter 编辑器内大模型选型指南与成本反转定律](https://ntlx.github.io/articles/choose-best-ai-model-in-editor/)》
