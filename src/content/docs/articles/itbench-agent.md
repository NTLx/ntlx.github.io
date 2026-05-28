---
$schema: starlight
title: 最强大模型也搞不定 K8s 排障？ITBench-AA 给 AI Agent 热浇了一盆冷水
description: 前沿 AI 模型在企业级 Kubernetes 排障任务中全部低于 50 分，且思考轮次越多反而越差——ITBench-AA 撕开了一个尴尬的事实：Agent 在真实运维场景里还差得远，而开源小模型正在成本曲线上悄悄领先。
date: 2026-05-28
category: engineering
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-28-itbench-agent-img-00-infographic-core-summary.png)

2026 年 5 月 27 日，Artificial Analysis 和 IBM 联合发布了 ITBench-AA，一个专门测 AI Agent 企业 IT 运维能力的基准。首发聚焦 SRE（Site Reliability Engineering）：Kubernetes 集群出了故障，模型能不能自己诊断出根因。

结果出人意料：所有前沿模型，没有一个得分超过 50%。

Claude Opus 4.7 以 47% 领跑，GPT-5.5 紧随其后 46%，Qwen3.7 Max 42%。这些模型在其他基准上表现强势——SWE-Bench 修 bug、Terminal-Bench 敲命令、GPQA 答博士题，得分曲线一路往上挤，很多基准已经进入了"天花板效应"的讨论。但一碰到真实的 Kubernetes 排障，最好的模型连及格线都摸不到。

这不是技术演示失败。这是一个信号：我们之前用来衡量 AI Agent 能力的标尺，可能量错了地方。

## 为什么这个基准不一样？

理解 ITBench-AA 的与众不同，得先看它怎么打分。

每个任务是一个 Kubernetes 事件快照——告警、日志、追踪、指标、应用拓扑，全打包在一个离线沙箱里。Agent 通过 shell 命令去勘探这些数据，最后提交一份结构化 JSON，列出它认为导致事故的根因实体：哪个 Deployment、哪个 Service、哪个 Pod 出了问题。

评分用的是**召回门控精确率**（Recall-Gated Precision）。规则很简单：漏掉任何一个真实根因 → 直接零分。全部找齐之后，再看你提交的答案里有多少是真正的根因（即精确率 = 真正根因数 / 提交总数）。

"广撒网"策略在这里彻底失效。

在很多基准测试里，模型可以通过多猜几个答案来提高命中率——反正对了加分、错了不扣分，那就尽量多说。但 ITBench-AA 不给这个空间。你提交一堆可疑实体，只要漏了真正的那个，零分；找到了但还多猜了一堆无关的，精确率被稀释。这跟真实 SRE 排障的价值判断完全一致：你报告一个错误根因给值班工程师，比什么都没报告更糟——它浪费了时间，错失了响应窗口，还可能引入二次故障。

IBM 的原始论文（arXiv: 2502.05352）显示了更残酷的数字：在 102 个真实 IT 场景里，当时最强模型在 SRE 上只解决了 13.8% 的场景，CISO 安全合规是 25.2%，FinOps 直接是 0%。ITBench-AA 的 47% 已经比原论文进步了不少，但离"可部署"还隔着一条鸿沟。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-28-itbench-agent-img-01-itbench-leaderboard.png)

## 轮次悖论：多想不等于想对

ITBench-AA 中最反直觉的一个发现是：Agent 思考和操作的轮次越多，最终准确率不一定越高，有时候反而更差。

看两组对比就够了。GPT-5.5 (xhigh) 平均每个任务用 31 轮，得分 46%。Gemini 3.1 Pro Preview 平均用了 83 轮，得分只有 30%。Gemma 4 31B (Reasoning) 用了 58 轮，得分 37%——小模型想得比大模型多，得分反而更高。

Artificial Analysis 团队给出的解释直指问题的本质：模型在"过度调查"时会逐步爬向上游的故障注入机制。比如一个 chaos-mesh 控制器触发了网络分区，网络分区导致了前端服务不可用——真正的根因就是网络分区（或者说对应的 NetworkPolicy 实体），但模型一旦看到 chaos-mesh 的影子，就容易被带偏，把"触发者"当成"根因"上报。在召回门控评分下，这些上游非根因实体直接变成误报，拉低精确率。

这个现象的隐喻很深。它戳中了当前 AI Agent 推理的一个结构性问题：缺乏"边界判断"——不知道什么时候该停。人类 SRE 的经验在于，看一眼告警时间窗口和拓扑图，就知道排查半径应该画在哪里。但模型的推理模式是链式的，沿着一条线索走下去，它天然倾向于继续走，走到源头为止——即使那个源头不是这次事故的根因。

这让我想到一个日常画面。报警说厨房水管漏了，你进去检查。一个有经验的管道工知道先关阀门、查接头、找水渍源头。一个过分热心的新手可能会沿着水管一路查到市政供水系统，然后报告说"根因是城市水压过高"。技术上他也没错，但这不是你要的答案。当前这些前沿模型在 K8s 排障时的表现，更像那个新手。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-28-itbench-agent-img-02-turns-vs-accuracy.png)

## 开源小模型的成本曲线反击

排名的另一侧有一条更值得关注的线索：成本效率。

Claude Opus 4.7 得 47% 排第一，但每个任务成本 $5.38。Gemma 4 31B (Reasoning) 得 37%，每个任务只要 $0.14——差了将近 40 倍的价格，得分只差了 10 个百分点。GLM-5.1 (Reasoning) 以 40% 得分、$1.23 成本，在得分上与 Gemini 3.5 Flash (high) 持平（$1.70），但便宜了 28%。

这是开源模型在 enterprise agent 基准上第一次展现出如此清晰的成本优势。过去我们说"开源模型性价比高"，大多是在文本生成、代码补全这种低风险场景里。在 Agent 推理这种需要几十轮工具调用、持续判断、且犯错成本极高的场景中，大模型的"碾压"似乎才是默认期待。ITBench-AA 的数据修正了这个叙事。

如果把这个趋势往前推一步，会看到一种可能：SRE agent 的部署形态，也许不是一个大模型单打独斗，而是一个小型模型集群——成本低到可以同时跑多个实例，交叉验证诊断结果。$0.14 一次排障意味着你可以跑 10 个 Gemma 实例、花 $1.40，让它们各自诊断、然后投票。这在单模型成本 $5+ 的情况下是做不到的。廉价推理在 SRE 场景里的价值，可能比我们想的更大。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-28-itbench-agent-img-03-cost-efficiency.png)

## 基准饱和背后的"评估鸿沟"

ITBench-AA 之所以让人警醒，不是因为它难——难的基准很多，Humanity's Last Exam 也难。它之所以不一样，是因为它难在了"对的方向"。

当前 AI 基准体系的根本问题，Kili Technology 在 2026 年的评估指南里总结得很准："通用基准趋于饱和，领域专项评测大量涌现。"SWE-Bench Verified 在一年多时间里从 20% 飙到 70%+，Terminal-Bench 上的前沿模型得分也远高于 ITBench-AA。这些饱和曲线制造了一种"AI Agent 已经准备好了"的集体印象。但 ITBench-AA 提醒我们：那是在开发者场景里准备好了——修 GitHub issue、写代码、跑命令行——不是在真实企业 IT 环境里。

企业 IT 运维的复杂度不是单个难题的复杂度。它是一组相互耦合的系统——日志和指标不在同一个面板里、告警之间有级联关系、一次故障可能同时触发 20 条告警但根因只有一对 Deploy/Service 组合。这类问题的难度不在计算，在判断。你需要知道"不看什么"，而不是"多看什么"。当前基准体系对"知道不该看什么"这项能力的评价几乎为零。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-28-itbench-agent-img-04-sre-workflow.png)

## 这盆冷水浇得正好

我看完 ITBench-AA 的数据之后，第一反应不是失望，是松了一口气。

AI Agent 叙事过去一年跑得太快了。从"Agent 元年"到"多 Agent 协作"到"自主 Coding Agent 替代初级工程师"，每个季度换一个更激进的故事。但如果你问一个真正在生产环境维护过 K8s 集群的人"你敢不敢把 pager 转给 AI Agent"，答案大概率是"不敢"——不是因为不信任 AI，而是因为排障这件事的代价不是"答对率"，是"答错的代价"。一个误报可能在凌晨 3 点叫醒一个人，一个漏报可能让一个服务宕到天亮。

ITBench-AA 用数据把这种直觉量化了。它说：最好的模型不到 50 分。更妙的是它说：不是模型不够聪明，是聪明的方向不对——你越想得多，越容易走偏。

这对行业是好事。真正有用的基准不是那些被快速刷爆的——那是奖状。有用的基准是那些让最强模型也觉得吃力的——那是体检报告。ITBench-AA 就是一份体检报告，告诉我们 Agent 在真实运维场景里血压偏高、血脂偏厚，看起来强壮但心脏还需要锻炼。

IBM 选择把 ITBench 开源是聪明的。102 个真实 IT 场景、push-button 的工作流、可复现的评估环境。这意味着任何团队都可以把自己的 Agent 放进去跑一跑，而不用等到某家厂商的下一次发布会才知道自己差在哪。下沉到实践的基准，比留在排行榜上的基准有价值十倍。

到最后，我最想看到的一个数字其实是 FinOps 的后续进展。原论文里 FinOps 的解决率是 0%，ITBench-AA 这次还没出 FinOps 的独立分数。但 FinOps 问题的结构——成本优化、资源调度、多云决策——比 SRE 更接近企业的"大决策"。如果 SRE 排障都不及格，那 FinOps 的成绩单可能更让人睡不着觉。

再退一步想，47% 这个数字也许刚刚好。一个让所有模型都不及格的结果没有区分度，一个让所有模型都 90%+ 的结果没有信息量。47 分意味着"差距清晰、路线明确、再努力一点就能看到突破"。这是最好的状态。

***

*你怎么看？如果你在维护生产环境的 K8s 服务，你觉得 AI Agent 离接手你的 pager 还有多远？或者说，你觉得哪些排障步骤是模型永远不该碰的？*

## 原文参考

> ITBench-AA: Frontier Models Score Below 50% on the First Benchmark for Agentic Enterprise IT Tasks — by Artificial Analysis and IBM
> <https://huggingface.co/blog/ibm-research/itbench-aa>
