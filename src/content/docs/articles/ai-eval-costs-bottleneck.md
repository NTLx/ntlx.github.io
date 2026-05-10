---
$schema: starlight
title: AI评测正在烧成一个新的算力黑洞
date: 2026-05-01
description: 以前训练贵、评测便宜。现在反过来了——跑一次评测比训练模型还贵，而谁付得起评测的钱，谁就能定义排行榜。
coverImage: cover.png
---

今天看到 HuggingFace 上 EvalEval Coalition 发了一篇博客，讲 AI 评测成本的事。看完之后坐在那里愣了一会儿。

不是因为数字有多大。是因为它揭示了一个正在发生、但几乎没人注意到的权力转移。

## 那个"评测很便宜"的时代已经结束了

我们这代人学机器学习的时候，有一个默认共识：训练烧钱，评测不烧。你花几百万训一个大模型，跑个 benchmark 顶多花点 API 调用费，跟训练比起来九牛一毛。

这个共识正在崩塌。

博客里列了一组数字：

HAL（Holistic Agent Leaderboard）跑了 21,730 次 agent rollout，花了 **4 万美元**。这还只是 9 个模型 × 9 个基准的单次运行。

跑一次 GAIA 评测，用前沿模型，光 API 费用就要 **2,829 美元**——还没算缓存。

PaperBench 更夸张。让一个 AI agent 复现 20 篇 ICML 论文，跑一次完整评测要 **9,500 美元**。如果你想做统计上可信的 8 次重复实验？那就奔着 **75,000 美元**去了。

![HAL 各 benchmark 单次运行成本跨度，柱形越高代表同一基准下不同配置的成本差异越大](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-01-ai-eval-costs-bottleneck-img-01.png)

这些数字本身已经够吓人了。但真正让我后背发凉的是另一件事。

## 评测成本，第一次超过了训练成本

在科学机器学习（SciML）领域，有一个叫 The Well 的评测基准。评测一个新的模型架构需要 **960 小时的 H100 GPU 时间**。训一个神经算子呢？**12 小时**。

你没看错。评测是训练的 **80 倍**。

深度学习发展了十几年，我们脑子里的模型一直是：训练是重活，评测是轻活。现在这个模型在某些领域已经倒过来了。

![各 benchmark 单次评测成本对比，从几十美元到近万美元不等](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-01-ai-eval-costs-bottleneck-img-02.png)

静态 benchmark 还能压缩——tinyBenchmarks 把 MMLU 从 14,000 题砍到 100 题，排名几乎不变，压缩了 100 到 200 倍。但 agent benchmark 呢？最多压 2 到 3.5 倍。训练闭环的 benchmark？几乎压不动。

因为评测的单元不再是"一道题答对答错"，而是"跑完一整个多轮交互的长轨迹"。这个轨迹本身，就是贵的那个东西。

## 可靠性是那个吞钱的无底洞

更狠的是，上面所有这些数字，都还只是"跑一次"的价格。

但跑一次根本不够。

τ-bench 上，一个 agent 单次运行准确率 60%，跑 8 次看一致性，掉到 **25%**。HAL 自己的日志分析发现，TAU-bench 的 Few Shot scaffold 存在数据泄露，被迫在 2025 年 12 月移除。

博客里有句话我反复读了两遍：

> *"跑一次 benchmark 报一个准确率数字"这种做法，严谨程度大概相当于只在完美天气下撞测一辆车。*

要做统计上可信的评测，就得重复跑。而重复跑意味着成本成倍增长。HAL 那个 4 万美元的 aggregate，如果要 k=8 的重复实验，直接变成 **32 万美元**。

所以 HAL 暂停了新模型的评测，转头去做可靠性研究。因为场面上那些 headline number，噪音太大了。

## 谁付得起评测的钱，谁就能写排行榜

这是整篇博客最让我震动的一句话。

原文是：*"Whoever can pay for the evaluation gets to write the leaderboard."*

想一想这意味着什么。

学术团队想做独立评测——预算不够。一个研究生一年的差旅费，可能还不够跑一次 GAIA。

AI 安全研究所想审计前沿 agent——预算不够。

记者想验证 leaderboard 上的数字是不是靠谱——预算不够。

那谁够？

建模型的那几家。

于是我们进入了一个怪圈：模型越来越强，但能独立验证它有多强的人越来越少。评测的社会过程正在集中到那些既建模型又付得起评测费的实验室内部。外部验证变得残缺，有时干脆缺席。

![评测压缩技术的效果：静态 benchmark 可压缩 100-200 倍，agent benchmark 最多 2-3.5 倍，训练闭环几乎无法压缩](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-01-ai-eval-costs-bottleneck-img-03.png)

而排行榜还在只报准确率、不报成本。这意味着研究者可以理性地把 token 往里砸，直到数字往上涨。HAL 论文发现，更高的推理 effort 在大多数运行中反而降低了准确率——多烧 inference 算力，连它本来要优化的那个指标都不一定涨。

但排行榜不看这个。排行榜只看那个数字。

## 出路在哪

博客提了一个我觉得很实在的方案：**标准化评测数据的共享格式**。

如果你花了 9,500 美元跑了一次 PaperBench，把完整的 grading trace 以共享 schema 导出来，下一组研究同样论文的人就可以把预算花在新的扰动上，而不是重复基线。

哪怕只有 2× 的复用率，省下来的钱也比所有压缩技术加起来还多。

EvalEval Coalition 搞了一个叫 "Every Eval Ever" 的项目，提供元数据 schema、验证器和从 HELM、lm-eval-harness、Inspect AI 等主流 harness 的转换器。已有的评测日志一步就能转成共享格式。

方向是对的。但问题也很明显：这个方案的前提是，跑得起评测的人愿意共享。而跑不起评测的人，连上牌桌的机会都没有。

## 最后

AI 评测不再是一个技术问题。它有了自己的预算、统计方法和失败模式。它的价格决定了谁有资格去评估强大的系统。

我们还在谈论能力是主要约束。但评测指向的，是可靠性才是更紧的那根绳子。

而测量可靠性，恰恰是最贵的。

---

你跑过哪些 AI 评测？被成本坑过吗？来聊聊。

## 原文参考

> Avijit Ghosh, Yifan Mai, Georgia Channing, Leshem Choshen. **AI evals are becoming the new compute bottleneck**. EvalEval Coalition Blog.
> https://huggingface.co/blog/evaleval/eval-costs-bottleneck
