---
$schema: starlight
title: 知道答案的评测，测的是什么时候离场
description: Leash Bio 把一片化学空间提前测完，让 AI 拿 100 次实验去找最强分子。拉开差距的不是化学知识，而是它肯不肯离开一个已经没有回报的化学邻域。
date: 2026-10-27
category: ai-agents
tags: ["AI for Science", "AI Agents", "Drug Discovery"]
primarySourceUrls: ["https://www.youtube.com/watch?v=vhPCo-8K78U"]
---

给一个靶点，一份上百万个分子的目录，100 次实验机会。没有起点分子，也没有人告诉你哪个方向有希望。你要在这一百次里挑出结合最强的那一个。

这是 Leash Biosciences 给 AI 出的题。题目不新鲜，药化里的结构-活性关系（SAR）优化天天在做。新鲜的是考场：整片分子空间在做题之前就被真刀真枪测过，每个分子都有实测读数。评卷人不只知道你答了什么，还知道你本来可以答什么。

Latent Space 这期 follow-up 请回了 Leash 联合创始人 Ian Quigley。夏天那期他讲的是“先把实验室测一遍”的想法，我当时[写过一篇](https://ntlx.github.io/articles/ai-drug-discovery-minos-replayable-lab)。这次预印本、34 个靶点的环境包和 4,602 条 agent 轨迹一起放了出来。我读完最在意两件事：它把评测推到了哪一步，这个步子又踩实了没有。

![文章核心信息图：知道答案的评测，测的是什么时候离场](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-27-minos-answer-key-img-00-infographic-core-summary.jpg)

## 一百次实验，一张提前写好的答案

Minos 的一局从一句 prompt 开始：一个蛋白靶点，一套组合化学库（AMA020 约 100 万个分子，kin0b 约 600 万个），三个工具。代理按 SMARTS 搜 building block，把选中的 block 组装成分子，再查看进度。每次合成最多测 5 个分子，总预算 100 个，拿回的是富集分数。冷启动的意思是：不给任何已知命中，一切从零开始。

这些分数不是模拟出来的。Leash 用 DNA 编码库把海量分子混在一起和蛋白共孵，靠 DNA 条码统计哪些分子被富集。累计筛过约 350 个蛋白对 AMA020；这次做成环境的是其中 34 个，另一套库取了 25 个。

关键在“测完”这两个字。常规 benchmark 只留下赢家的答案，你只能知道模型找没找到。这里，模型没选的分子也有分数，错过的选项同样可查。论文的 Figure 2 画的就是这种差别：同一张测好的分子矩阵，两条预算相同的路径，一条在第十步摸到 hit，另一条从最好的分子旁边擦过去，什么也没发生。

![Minos 论文 Figure 2：同一张已测分子矩阵里，一条路径在第十步摸到 hit，另一条从最强的分子旁边擦过去。](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-27-minos-answer-key-img-01-source-minos-hit-miss.png)

评测手里有了答案，能问的问题就不一样了。它不必再问“你找到没有”，可以直接问“你离最好差多远，在哪一步走开的”。

## 排行榜分开了什么

Figure 5 把结果摊成二维图：横轴是每次 rollout 的 API 成本（对数），纵轴是找到的分子占库内最强者的百分比。图上标出六个模型，astra-6、sol-6.1、luna-6、opus-5、sonnet-5.5、sonnet-5；每个点代表一个推理投入档位，合起来 58 种“库×模型×档位”组合，每种在每个环境跑 10 次。

![Minos 论文 Figure 5：两个库上得分与 API 成本的关系，虚线是随机抽 100 个分子的水平。](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-27-minos-answer-key-img-02-source-minos-score-cost.png)

差距很明显。astra-6 在两个库上都接近库内最强的一半；sonnet-5 在 AMA020 里的几个点就压在“随机抽 100 个分子”那条虚线上。同一个家族里，推理投入调高通常能加分，但曲线越往后越平，贵的点不一定落在高的位置。

这张图当排行榜读，结论到“谁强谁弱”就停了。它更实际的用途是分层：模型与投入两个维度上的分数能被稳定分开，至少说明这套环境测到的是某种能力，不是噪声。

## 真正分开强弱模型的，是离场

论文先用两组消融排除了一个解释。把靶点名字藏起来，分数几乎不动，说明模型不是靠记住“这个靶点通常吃什么药”。把 building block 对应的分子结构打乱、ID 和动作空间都保留，分数明显掉下来，说明模型确实在读结构，也在用上一批读数更新判断。

Ian 在节目里补了一段更早的时间线。去年夏天，团队还在专门做监督微调，只为了教模型在 SMILES 的不同写法之间互转，因为当时前沿模型连这个都做不好。到今年 2 月，事情突然变成“能用化学做点什么”。这项能力被认真测起来的时候，还很年轻。

知识这条解释被压下去之后，差距落在决策上。论文把“留下”和“离开”定义得很死：三批之内挑两个 building block 相同的类似物，算留在一个化学邻域；只共享一个或更少，算离开。接着给每个分子算一条盈亏线，也就是类似物命中率和随机选打平的那个分数。

Figure 7 就是这条线的图。纵轴是下一批还跟进类似物的概率，横轴是分子分数相对盈亏线的位置。强弱模型的分水岭不在高分区，而在灰色地带：分数已经低于盈亏线，弱模型仍有一半以上的概率继续跟，强模型很快把这个概率压下去。Ian 说这是他们没料到的发现，原因也还不知道，原话是“We don't know that at all yet”。

![Minos 论文 Figure 7：分数低于盈亏线之后，各模型仍继续跟进类似物的概率。](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-27-minos-answer-key-img-03-source-minos-perseveration.png)

从 4,602 条轨迹里，他们还整理出几种具体的失败。预算没用完就收工，同一个分子反复测，找到的分子和自己写下的假设对不上。这些毛病都不新鲜，不新鲜的是现在能一次数出几千条。

## 但 transcript 里的理由，不作数

代理做题时会写理由。论文摘了一段 Opus 5 的轨迹，它讲分子内的氢键怎样把结构锁成刚性平面，讲哪个取代基是决定性的，讲到高兴处还给自己发了个庆祝的 emoji。Leash 把这些记录给药化专家看，专家说思路很“像真的”。

论文紧接着写了一句限定：只有实验结果是 ground truth。我会把这句话贴在每个 agent 评测的首页。理由再顺，也只是模型对自己行为的叙述，能核对它的只有后面几次实测。我在[《把信任建在模型外面》](https://ntlx.github.io/articles/trust-outside-the-model)里写过类似的判断：可信不来自模型的自述，来自模型之外的证据。在这里，证据就躺在答案表里，它说的那个决定性取代基，到底有没有在下一次合成里被验证。

这是“知道答案”的第二种用途。它评分，也对账。叙述与动作之间有没有缝，一查便知。

![代理自述与实测读数的对账：一句说法要落到圈出的那次实测读数上，才算被验证。](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-27-minos-answer-key-img-04-notion-transcript-audit.jpg)

## 这堵墙在哪里

这套评测测的是单靶点的结合富集。选择性、代谢、毒性、成药性都不在题里。代理只能在预先测过的分子目录里选，不能发明新结构。环境覆盖两套化学库、34 和 25 个靶点，成败判据是富集分数高于 2.5，这是代理指标，不是临床相关性。

论文自己也留了余地：预算没用完就停止，不能断定原因；局部排序准确率不是匹配比较，读不成“内在化学能力”。至于最要紧的那一问，也就是在这些环境里练出来的经验能不能改善真实、未测世界里的科学决策，作者写成了 future work，迁移仍未验证。

所以榜首成绩不该被读成“接近会做药”。更准确的读法是：在这个封闭搜索问题里，目前走得最远的一次，找到的是库内最好分子的一半左右。

## 我的判断：训练场，不是排行榜

Leash 的野心不在排名。Ian 把这件事理解成 “a lab in the loop with amortized latency”：实验成本在建造环境时一次付清，之后可以被无数次重放。他们手里已经有 90,000 次 rollout，每天建两个新环境，目标二十个。这套东西更像训练场，可以给强化学习提供 reward，也可以给 agent 设计提供诊断。

它缺一块对照：人类。节目里主持人提议把它做成药化游戏，让真正的化学家来做同一批题。Ian 说技术上可行，麻烦的是预测量环境锁死了可选动作，得先整理成人类能看懂的小集合。这个插曲我记下了。没有人类基线，“离场太快还是太慢”就只能在不同模型之间相对比较，没法回答“比一个熟练药化专家慢多少”。

我猜接下来会有两件事发生。一是有人拿这批环境做 post-training，看“离场阈值”这种策略能不能被训练出来，它比化学知识更像一个可迁移的参数。二是迁移本身会被摆上台面：同一套策略换一套库、换一个靶点还成不成立。作者没做，因为难，但这是从“评测”走到“经验”绕不过去的一步。

一百次实验的预算，买不到一个分子最终能不能成药。它够回答一个更小、也更基础的问题：面对一个暂时没有回报的方向，它知不知道自己该停。答案表让评分变简单了，也让“为什么没找到”第一次成为可以核对的对象。

## 参考资料

- [Latent Space：An Eval for AI Scientists That Knows the Answer Key - Ian Quigley, Leash Bio](https://www.youtube.com/watch?v=vhPCo-8K78U)
- [Minos: physically grounded scientific environments at compute speed（working preprint）](https://github.com/Leash-Labs/minos-paper/blob/trunk/Minos_Leash.pdf)
- [STRELKA：Minos worlds 与 agent transcripts](https://strelka.leash.bio/)
- [Leash Bio：Making reality replayable](https://leashbio.substack.com/p/making-reality-replayable)
