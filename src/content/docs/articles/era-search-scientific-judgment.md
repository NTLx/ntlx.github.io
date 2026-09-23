---
$schema: starlight
title: ERA 会搜索解法，科研者还要判断它有没有答对问题
description: ERA 能把科研问题变成可持续搜索的代码任务，但好分数不等于科学解释。搜索越便宜，越要有人检查指标、验证集和结论能否外推。
date: 2026-09-23
category: ai-agents
primarySourceUrls: ["https://www.latent.space/p/john-platt?showTranscript=true"]
---

Google 曾举办过一场识别飞机凝结尾迹的 Kaggle 竞赛。参赛者后来发现，标注 mask 有半个像素的偏移；这个小误差会影响模型的旋转增强，也能改变榜单上的分数。榜单因此测到的有时是数据管线的约定，未必是模型识别尾迹的能力。

John Platt 在 Latent Space 的访谈里讲起这件事时说，人也会像大模型一样 reward hack。听完整场访谈，我一直记着这个例子。它把问题落到了一个能核对的细节上：程序可以不停改代码，分数却未必代表我们关心的能力。

![ERA 的流程从目标定义进入候选搜索，最后回到科学验证](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-23-john-platt-ai-science-reader-response-00-infographic-core-summary.png)

## ERA 自动化的是反复试验，起点仍是问题定义

Platt 把 ERA 的起点说得很朴素：把科学问题整理成一个可打分的任务，再让系统反复写、改和运行代码。Gemini 会生成科学软件候选，ERA 把这些候选放进搜索树里，根据已有结果决定下一步探索哪里。研究者也可以给它论文或方法，让它试着实现、组合和验证。

它把一轮轮实现和比较交给程序跑，研究者也能把时间留给问题本身：我们到底要优化什么？Google Research 将 ERA 描述为按任务目标搜索候选实现；Nature 上的论文报告了跨多个领域的经验软件任务结果，也特意说明，优化预测模型和真正的科学发现并不相同。后者还需要解释理论、因果机制和数学结构。

我不会把 ERA 的进展简化成“科学家只剩出题”。一个任务能被算分，不代表它问对了问题。研究者还得判断结果有没有用、模型漏了什么，以及现有证据够不够让人相信它。

## 搜索越便宜，指标越需要防守

评分函数决定搜索往哪走。模型只看见反馈信号时，会努力让那个数字变好；只要分数和真实目标之间有缝，它就有机会找到捷径。人类在竞赛里也会这样做，不一定是恶意，只是奖励机制会把注意力吸过去。

半像素偏移就是一个例子：模型分数可以因标注坐标的约定而变化，而不只是因识别尾迹的能力变化。SIDs 2024 的论文也记录了多位参赛者发现这个 mask 偏移，并指出旋转增强等方法会受影响。评价流程的问题不总是“有人作弊”；有时是基准把一个偶然的实现细节当成了能力。

我之前在[《能考满分的 AI，被一道常识题打回原形》](https://ntlx.github.io/articles/benchmark-goodhart-law-general365-reasoning)里谈过榜单分数与实际能力的距离。这场访谈把同一类问题带进科学软件：当系统可以不知疲倦地试很多方案，评估的漏洞也会被更密集地搜索。这让我想到一个实际检查：一开始就留一组不参与调参的数据，最后再看模型在哪些样本上失手。否则验证数据也可能悄悄变成下一轮调参信号。

## 反事实问题提醒我们，分数之外还有一个世界

访谈里最具体的科研案例是航空凝结尾迹。判断一条尾迹对气候的影响，不只是识别卫星图上的云；研究者还要估计一个看不见的世界：如果这趟飞机没有留下尾迹，辐射会怎样变化？这个反事实不好直接观测，还会受背景云层、湿度和天气等因素影响。

![观测到的尾迹与无尾迹反事实之间，需要结合背景条件进行估计](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-23-john-platt-ai-science-reader-response-01-comparison-counterfactual-worlds.png)

Platt 说，团队在反射日光的反事实模型上卡了两年。ERA 找到一个纳入此前没试过的混杂因素组合的简单模型。他们用人工构造、已知效应的数据做测试：早期模型没通过，ERA 找到的模型通过了。对我来说，这几步不能折叠成同一个“成功”：在合成数据里恢复已知答案，说明方法过了一个可控检查；能不能描述真实大气，还得靠真实观测。

2026 年一篇关于长期尾迹长波强迫的 AMT 论文，也用带有已知真值的合成数据检查因果估计方法。作者同时写明适用边界：研究估计的是美洲区域的平均效应，不能由此推断每一条尾迹的影响；观测和混杂变量仍可能留下误差。我更信任会把边界写出来的结果，读者至少能看清它回答了什么、还没回答什么。

## 工具省下的时间，最好留一部分给训练

Platt 建议年轻研究者用这些工具，也保留一部分基础工作。他用徒步上山作比喻：车能把人送到山顶，可偶尔徒步也有价值，因为人在路上会学到地形和身体的限度。

我愿意留一些基础练习，但不会把手写工具链当成资格考试。动手的价值在于让人知道数据怎么进模型、假设改动会影响什么，必要时也能看出模型学到了什么。机械操作交给 AI 很合理；如果连能让人看清问题结构的练习也省去，审查模型时就少了些抓手。

我在[《AI 时代的科学计算》](https://ntlx.github.io/articles/scientific-computing-agentic-ai)里关注 Agent 加快科研软件实现后，验证断言如何成为瓶颈。这次访谈把问题再往前推了一步：验证代码之前，还得问评分函数有没有把研究目标说清楚。科学家仍要能为分数和验证方式辩护：它们为什么足以支持这个结论？

Feynman 在 Caltech 的演讲里提醒科学家，最容易被骗的人往往是自己。把评分函数交给程序优化后，这句提醒仍然适用：研究者得先给系统定目标，随后还要防着自己把分数当成答案。候选结果出现得更快，成为知识却仍取决于那些没有参与搜索的证据。

## 参考资料

- [Latent Space：John Platt on AI for Science（访谈与节目说明）](https://www.latent.space/p/john-platt?showTranscript=true)
- [访谈视频：John Platt on AI for Science](https://www.youtube.com/watch?v=2xBSGluFkG0)
- [Nature：An AI system to help scientists write expert-level empirical software](https://www.nature.com/articles/s41586-026-10658-6)
- [Google Research：Empirical Research Assistance (ERA)](https://research.google/blog/empirical-research-assistance-era-from-nature-publication-to-catalyzing-computational-discovery/)
- [Google Research：Accelerating scientific discovery with AI-powered Empirical Research Assistance](https://research.google/blog/accelerating-scientific-discovery-with-ai-powered-empirical-software/)
- [Google Research：ERA applications 仓库](https://github.com/google-research/era/tree/main/era_applications)
- [SIDs 2024：Deep Semantic Contrails Segmentation of GOES-16](https://sesar.eu/sites/default/files/documents/sid/2024/papers/SIDs_2024_paper_028%20final.pdf)
- [AMT：Observing long-lived longwave contrail forcing](https://amt.copernicus.org/articles/19/1951/2026/)
- [Richard Feynman：Cargo Cult Science](https://calteches.library.caltech.edu/51/2/CargoCult.htm)
