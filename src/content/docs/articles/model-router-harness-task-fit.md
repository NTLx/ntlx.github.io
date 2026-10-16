---
$schema: starlight
title: 模型路由先要读懂任务，再谈省钱
description: LangChain 在 Open SWE 上报告模型路由将 median thread cost 降低 64%。我更在意的是：档位标准来自真实任务，而一次“没有检测到质量差异”的实验，还不足以证明质量等价。
date: 2026-10-15
category: ai-agents
tags: ["AI Agents", "Harness", "模型路由", "Agent Evaluation", "Cost"]
primarySourceUrls: ["https://www.langchain.com/blog/how-to-build-a-model-router-in-the-harness"]
---

读 [LangChain 这篇 Open SWE 路由实验](https://www.langchain.com/blog/how-to-build-a-model-router-in-the-harness)，最先抓住我的是 64% 这个数字：路由组的单 thread 成本中位数少了这么多。接着我想看的是，这批任务为什么能交给便宜模型，以及这组结果到底证明到哪一步。

讨论路由之前，先要知道 agent 平时在做什么；摸清任务分布，再设模型档位，最后用真实线程检查成本和结果。对我来说，路由规则从第一天起就该接受任务结果的检验。

![文章核心信息图：从真实任务分布到模型分档，再到结果验证](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-15-model-router-harness-task-fit-img-00-infographic-core-summary.png)

## 路由标准从真实任务里来

LangChain 先给 Open SWE 一周的交互线程做分类。新功能和 bug 修复是最大的两类，作者也提醒，这些分类是根据 thread 标题与元数据得出的启发式标签。原文的任务图还展示出一个更实际的差别：feature work 和调查类任务的调用数、成本通常更高；test/no-op 一类任务要轻得多。

![原文图：Open SWE 一周交互线程的任务类型占比（2026 年 8 月 29 日至 9 月 5 日）](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-15-model-router-harness-task-fit-img-01-source-task-categories-pie.png)

![原文图：六类任务的线程数、调用数、中位成本与复杂度构成](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-15-model-router-harness-task-fit-img-02-source-task-categories-profile.png)

这一步比直接把模型榜单翻译成“简单任务用 A、难题用 B”可靠。榜单可以帮忙筛候选，真正的“够用”仍要由某个 agent 的任务来定义。原文把 Artificial Analysis 的能力与成本图用作选型参考，再结合 Open SWE 的任务分布和各模型的特点写档位标准。那些标准服务于这一个 coding agent，不是通用的难度刻度。Anthropic 的[模型选择指南](https://platform.claude.com/docs/en/about-claude/models/choosing-a-model)也把能力、速度和成本列为需要权衡的因素；落实到单个请求，还得先知道自己的 agent 在做什么。

![原文图：模型能力与每项任务成本的 Pareto 前沿，以及路由选用的三个档位](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-15-model-router-harness-task-fit-img-03-source-router-pareto.png)

我以前写[《模型路由不是排行榜问题》](https://ntlx.github.io/articles/model-routing-not-leaderboard)，关心不同评价目标怎样改变模型胜负。这次读 LangChain 的例子，我想追问的是另一件事：自己的 agent 到底在处理哪些工作？任务画像若偏离真实流量，分档再细也只是猜测。

把路由放进 agent harness 的理由也在这里。harness 知道任务的目标、工具和执行环境，通用 gateway 通常看不到这些上下文。LangChain 选择在 [middleware](https://docs.langchain.com/oss/python/langchain/middleware/custom) 中读用户请求、替换 agent 当前要用的模型；分类标准便能按 Open SWE 的工作方式来写。这和 LangChain 对 [custom harness](https://www.langchain.com/blog/how-to-build-a-custom-agent-harness) 的说明是一致的。它也带来一个边界：源文的实现在线程开始时选一次模型，后续整条 thread 沿用该档位。用户中途把“查一下”变成“改好并提交”，原先的判断未必仍合适。

我还查看了[Open SWE 当前的路由 prompt 和代码](https://github.com/langchain-ai/open-swe/blob/main/openswe/resources/prompts/model-selection/instructions.md)。档位判断会考虑任务目标是否明确、有没有验收标准、改动能否撤销、验证是否充分；需求模糊或风险高时，则倾向更强的模型。这些标准把“任务难度”落实成了执行风险和验证条件。当前 main 分支还会在 Jev 置信度低于 0.6 时放弃该分类，并回退到 default 模型；这是我在 2026-10-15 看到的当前实现，不能当成原文实验时已经具备的机制。[LangChain 对 Jev 的说明](https://www.langchain.com/blog/building-a-harness-with-jev)和[TypeSafe 的模型路由文档](https://docs.langchain.com/oss/python/integrations/providers/typesafe#model-routing)分别补充了分类器和 middleware 的背景。

## 成本下降了，质量结论还得留有余地

第一轮 A/B 测试共覆盖 973 条 thread。路由组每条 thread 的成本中位数是 0.94 美元，对照组是 2.61 美元，降幅 64%。平均值降了 42%，p90 降了 37%；分布图也能看到节省并不只来自几个特别便宜的任务。路由组里 56% 用 balanced、34% 用 fast，只有 10% 用 performance。这更像是在多数请求上少用一点能力，把强模型留给少数更棘手的工作。

![原文图：对照组与路由组的线程成本分布，以及路由各档位的成本分布（2026 年 9 月 16 日至 22 日）](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-15-model-router-harness-task-fit-img-04-source-exp1-cost-per-thread.png)

质量指标要谨慎读。最终合并 PR 的比例，路由组为 29.2%，始终使用 GPT-6 Astra 的对照组为 27.3%，p = 0.49。就这次比较而言，研究者没有检测到合并率差异。但这不等于两种方案已经被证明质量相同：文章没有公布置信区间或事先设定的非劣效界限。这个区别看起来细，却决定了 64% 能不能被讲成“几乎没有质量代价”的保证。

![原文图：路由组与始终使用 GPT-6 Astra 的 A/B 实验统计结果](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-15-model-router-harness-task-fit-img-05-source-exp1-stats-table.png)

我最近在[《读 OpenRouter 工具调用评测指南：把“通过”读准确》](https://ntlx.github.io/articles/tool-calling-correctness)里也讨论过，评测结论应和它实际检查的范围一起看。这里的 merged PR 是有用的业务信号，却不能覆盖所有问答线程；作者补充了用户反馈，但也说明打分很少。若只有总体合并率，哪类任务受益、哪类任务退步，读者仍看不出来。

另一次 router 对比 fast-only 的测试，很快因工程师认为输出质量影响工作而在未达到统计意义前结束。这不是一项可以下结论的实验，却说明“只用最便宜的模型”并非天然合理。合适的路由要能省成本，也要在具体任务里守住可接受的结果。

## 把路由当作需要复查的策略

如果在自己的 agent 上试路由，我会先从真实 trace 整理任务，再写清档位条件；分类器拿不准时要能回退。上线后也要分任务观察花费和完成质量。文章提到 offline evaluation 能在固定数据集上重复比较，线上 A/B 则检查真实流量。像 [DeepSWE](https://hub.harborframework.com/datasets/datacurve/deep-swe/latest) 这样的 coding benchmark 可补充受控对照，仍不能代替自己的用户任务。

还有一个变量是时间。模型会更新，agent 的工具和任务分布也会变；今天够用的档位，过几个月可能太弱，或者已经不够便宜。线程中途重新路由也不是免费的：模型一换，提示缓存可能失效，整段上下文需要重新计算。路由规则因此要和结果一起复查，不能只在上线时调好一次。

64% 的成本下降足以说明，在任务差异大的 agent 里做路由值得认真试一试。它还没有给所有 coding agent 一张通用分档表。能迁移的是验证方法：先弄清自己的 agent 接到哪些任务，再用这些任务证明哪种路由真的划算。

## 参考资料

- [How to Build a Model Router in the Harness（LangChain）](https://www.langchain.com/blog/how-to-build-a-model-router-in-the-harness)
- [Open SWE 当前模型路由 middleware](https://github.com/langchain-ai/open-swe/blob/main/openswe/middleware/model_selection.py) 与 [Jev 置信度处理](https://github.com/langchain-ai/open-swe/blob/main/openswe/utils/jev.py)（main 分支，2026-10-15 查看）
- [LangChain TypeSafe 模型路由文档](https://docs.langchain.com/oss/python/integrations/providers/typesafe#model-routing)
- [LangChain custom middleware 指南](https://docs.langchain.com/oss/python/langchain/middleware/custom)与 [custom agent harness 说明](https://www.langchain.com/blog/how-to-build-a-custom-agent-harness)
- [Building a Harness with Jev（LangChain）](https://www.langchain.com/blog/building-a-harness-with-jev) 与 [Anthropic 模型选择指南](https://platform.claude.com/docs/en/about-claude/models/choosing-a-model)
- [Artificial Analysis Intelligence Index](https://artificialanalysis.ai/evaluations/artificial-analysis-intelligence-index)（持续更新；文中模型选择对应原文截至 2026-09-09 的图表快照）
- [LangSmith Evaluation 文档](https://docs.langchain.com/langsmith/evaluation)
- [DeepSWE 数据集](https://hub.harborframework.com/datasets/datacurve/deep-swe/latest)
