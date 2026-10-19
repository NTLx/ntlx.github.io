---
$schema: starlight
title: 让 AI 在药物发现中练习试错：Minos 把实测结果变成可重放环境
description: Leash Bio 的 Minos 把预先测得的分子结合结果做成可查询环境，让 AI 代理在有限预算里反复选择、接收反馈。它目前检验的是已测化学空间中的决策表现，能否迁移到未测分子仍待验证。
date: 2026-10-19
category: ai-industry
tags: ["AI for Science", "AI Agents", "Drug Discovery"]
primarySourceUrls: ["https://www.latent.space/p/lab-in-the-loop-at-compute-speed"]
---

听完 Latent Space 对 Leash Bio 联合创始人 Ian Quigley 的访谈，我反复想到一个问题：实验室里一次次昂贵的试错，能否先测下来，再让 AI 反复走过？

访谈里，Ian 提到团队正在尝试 agent 沙盒。节目页面后来补上了 Minos 的[说明文章](https://leashbio.substack.com/p/making-reality-replayable)和[预印本](https://github.com/Leash-Labs/minos-paper/blob/trunk/Minos_Leash.pdf)。“lab-in-the-loop at compute speed”由此有了具体做法：先在实验室测出一片有限的化学空间，再把结果做成代理能快速查询的环境。

![Minos：已测空间中的 agent 搜索循环](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-19-ai-drug-discovery-minos-replayable-lab-img-00-infographic-core-summary.png)

## 实验数据的第一项任务，是暴露模型的捷径

DEL（DNA-encoded library）把许多小分子混在一起筛选，每个分子都接上 DNA 条码，最后用测序统计哪些分子随蛋白被富集。大量组合能放进同一个实验流程。读数也可能混进条码结合、蛋白质量和批次差异等信号。

Leash 为同一分子安排多条不同 barcode。若信号只在一条 barcode 上升，就提示蛋白可能在结合 DNA，而非小分子本身。团队还用阴性对照、重复筛选和大量蛋白的持续测试，排查实验偏差。模型要学结合关系，测量本身得先尽量忠实。

数据量本身不会自动带来泛化。Leash 用 BELKA 组织了 Kaggle 竞赛：有些训练集和测试集共享 building block，有些只共享核心结构，还有一组来自完全不同的化学库。团队报告，参赛模型在前两类上能找到一些信号；换到不同化学库，最好成绩仍在随机挑选的范围内。[BELKA 结果](https://leashbio.substack.com/p/belka-results-suggest-computers-can)提醒我，若测试集里总有相似分子，模型记住熟悉结构就可能得高分。把化学空间拉开，才能看它有没有学到可迁移的规律。

另一项检查更让我不安。Leash 报告，他们能从分子结构推测 ChEMBL 中的化学家；只用“谁做的”这一组概率特征预测活性，效果也接近结构特征模型。研究者偏好、项目取舍、合成可行性，都可能留在数据里。模型也许复现了历史结果，却未必知道分子为什么能结合。[这项分析](https://leashbio.substack.com/p/ai-for-chemistry-in-2025-is-like)没有证明公共化学数据都无用，但评测时得主动找模型可能钻的捷径。

## Minos 把已测空间变成一场场可回放的试验

这也是我理解 Minos 的起点。预印本把一个蛋白靶点和一套已筛过的 DEL 分子组成一个环境。代理面对固定的分子目录，可以搜索 building block、组装候选、查询实验读数，再决定下一批测什么。

在预印本的主要任务里，代理要从约一百万或六百万个分子中找最强 binder，预算是 100 个分子，每批最多查询 5 个。读数来自此前真实做过的筛选；代理每次查询的都是预先测量的结果。实验成本在建环境时预先支付，之后多个代理可以反复走不同路线。

预先测完候选空间后，研究者可以把代理走过的路线和它没选的分子放在一起比较：它为何继续在一个化学邻域里搜索，何时换方向，错过的候选是否更好。站内[关于材料实验反馈的一篇文章](https://ntlx.github.io/articles/materials-experiment-next-step)讨论过测量如何改变下一步选择。Minos 让研究者还能回看当时未走的选项。

后续说明文的 Figure 1 把这种差异画得很直观：同一张已测的分子矩阵里，两条预算相同的路线，一条找到高富集分子，另一条擦过它却没有命中。对评价 agent 来说，知道最终找到什么固然重要；知道同一时刻有哪些替代选项，以及代理为何错过它们，也同样重要。

![Leash Bio《Making reality replayable》Figure 1：相同的已测分子矩阵中，两条 agent 搜索路线分别命中与错过高富集分子。](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-19-ai-drug-discovery-minos-replayable-lab-img-01-source-minos-figure-1.png)

## 已测空间之外，还需要一层验证

Minos 预印本显示，不同模型和推理投入在这些任务上的表现有差异；打乱分子结构与实验结果的对应关系后，表现明显下降。代理的搜索确实用到了化学结构信息。研究者也能从实验轨迹里检查预算是否用完、是否重复测试，以及代理在低价值的化学邻域里停留多久。

现有测试范围很明确：任务只优化单个蛋白靶点上的结合表现，不涵盖毒性、药代动力学、多靶点选择性或临床结果。代理只能从已测组合空间里选分子。在这里表现好，不等于它已经能提出新结构或把经验迁移到未测分子。预印本也把“在这些环境中得到的经验，能否改善未见物理世界里的科学决策”列为后续问题。Minos PDF 标注为 working preprint，STRELKA 页面目前提供访问申请入口。

我会把 Minos 看作研究代理决策的实验台。研究者可以追踪模型如何花掉有限预算、如何响应实验反馈，以及何时放弃原来的猜想。下一步要看的是，这些选择策略能否带到未测化学空间，再由新的物理测量确认代理挑出的分子确实有效。

## 参考资料

- [Latent Space：Lab-in-the-Loop at Compute Speed — Ian Quigley, Leash Bio](https://www.latent.space/p/lab-in-the-loop-at-compute-speed)
- [Leash Bio：Making reality replayable](https://leashbio.substack.com/p/making-reality-replayable)
- [Minos working preprint](https://github.com/Leash-Labs/minos-paper/blob/trunk/Minos_Leash.pdf)
- [STRELKA 数据访问申请](https://strelka.leash.bio/)
- [BELKA results suggest computers can memorize, but not create, drugs](https://leashbio.substack.com/p/belka-results-suggest-computers-can)
- [AI for chemistry in 2025 is like AI for images in 2010](https://leashbio.substack.com/p/ai-for-chemistry-in-2025-is-like)
- [Taking away the protein cheat sheet](https://leashbio.substack.com/p/taking-away-the-protein-cheat-sheet)
