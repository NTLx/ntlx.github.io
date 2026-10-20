---
$schema: starlight
title: 一个 384 阶反例，让我重新理解 AI 怎样参与研究
description: AI 提出的反例、程序和证明思路，需要经过怎样的检查，才能成为别人可以接着使用的研究结果？Meta 的数学合作给了我一个具体入口。
date: 2026-10-20
category: ai-models
primarySourceUrls: ["https://research.meta.ai/blog/solving-open-research-problems-together/"]
---

384。读 Meta 的《Solving Open Research Problems Together》时，我停在了这个数字上。

它是一项群论研究找到的反例的阶数，也就是这个群包含的元素数量。原来的猜想说，满足“半阿贝尔”性质的有限群，也应该满足“单项”性质。研究者找到了一个有前一种性质、却没有后一种性质的群。对这条猜想来说，反例再小，也足以让它失效。

让我感兴趣的是找到它的过程：Muse Spark 生成 GAP 搜索程序，研究者运行、核实结果，再完成论证。模型的贡献可以落到一件具体的东西上，而我们也有办法追问它是否可靠。

![AI 怎样参与研究：384 阶反例、搜索程序与研究者检查的概念图](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-20-meta-open-research-verification-img-00-infographic-core-summary.png)

## 反例有一个可以查找的地址

[这篇群论论文](https://ai.meta.com/research/publications/semiabelian-groups-need-not-be-monomial/)给出了反例在 GAP 群库中的标识：`SmallGroup(384, 20127)`。有了这个标识，读者知道作者讨论的是哪个对象，可以沿着定义检查它为什么满足一种性质、又为什么不满足另一种。

论文的附录还列出搜索程序和输出。我没有在本地运行它，因此不把阅读源码当作复现成功。不过，公开程序和具体对象，至少使后续核查有了明确的起点。

程序找到一个候选后，还需要完成证明。若程序对“半阿贝尔”的判定写错了，搜索再快也没用。研究者仍要核对对象的性质、检查使用的判据，把计算结果接到数学论证上。

原文用一张群作用网络图展示这个反例。那些连线有助于感受它的对称结构，单看图却看不出它为何推翻猜想。想判断结论，仍得回到对象、程序和论证。

![Meta AI Research 原文 Figure 3：384 阶反例的群作用示意，图示不能替代程序与证明](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-20-meta-open-research-verification-img-01-source-semiabelian-group.webp)

这让我对“AI 会不会研究”的问题有了更具体的问法：它提出的结果，能否变成别人可以检查的东西？对于反例，交出满足定义的对象；对于证明，交出能够逐步追问的推导。流畅的解释可以帮助理解，可靠性还得靠后面的检查。

## 聊天入口很普通，判断工作并不轻松

Meta 介绍，数学家使用的是 Muse Spark 1.1 和 1.2 的 Thinking Mode，通过常规 meta.ai 聊天界面协作，没有搭建定制研究框架。这一点很吸引人：参与探索的交互入口，已经是人们熟悉的聊天窗口。

但参与者知道怎样选问题、怎样发现漏洞，也知道该调用 GAP 这样的数学工具。把入口的简单，理解成研究过程的简单，会漏掉这些工作。

在[演化代数论文](https://ai.meta.com/research/publications/on-solvable-evolution-algebras-and-a-conjecture-by-garcia-martinez-and-perez-rodriguez/)中，团队给出了一个三维反例，并进一步用“幂等子空间”提出替代刻画。模型参与了反例和替代方案的生成，研究者检查、修正、重写。发现原判据失效后，研究还得继续：有没有更合适的判据？

[数论与物理的合作](https://ai.meta.com/research/publications/string-two-point-function-height-function-on-a-curve/)又展示了另一种帮助。模型参与梳理了局部高度配对与 p-adic 弦论二点函数的联系，研究在半稳定约化等条件下建立对应。AI 的用处也包括建议换一种数学语言看问题、提出能够连接不同领域的论证。

我不愿把这些贡献缩成“帮忙写稿”。同样，看到论文里有大量 AI 辅助段落，也不能据此计算模型独立完成了多少研究。一个思路是否值得继续，某个条件能否去掉，一处漂亮推导是否藏着错误，都需要懂行的人判断。

[椭球拟合论文](https://ai.meta.com/research/publications/the-strict-threshold-for-gaussian-ellipsoid-fitting/)尤其提醒我注意条件。它研究高维随机高斯点能否精确落在同一个中心固定的椭球上，给出阈值两侧的结论，却明确保留了阈值点本身的问题。原文的示意图把转折画得很清楚；阅读时仍要记住，这是特定高维随机模型中的结果。

![Meta AI Research 原文 Figure 1：高维高斯椭球拟合的阈值示意，阈值点本身仍未解决](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-20-meta-open-research-verification-img-02-source-gaussian-threshold.webp)

## 贡献写清楚，成果才容易接着用

Meta 这篇介绍让我愿意继续读下去，还有一个原因：它交代了复核与归属。

论文用页边的 Human 和 AI 标记区分人起草与 AI 辅助的材料。AI 使用声明也写得直接：研究者引导工作，检查、修正数学内容，并对终稿负责。另一组数学家还参与了复核。读者因此可以继续追问，某段内容由谁提出，又由谁检查过。

这里的复核，是此次合作的检查安排。我不会把它读成论文已经通过期刊同行评审，也没有逐条复证这些论文，不能替数学共同体宣布结论已经得到最终确认。

并行工作的说明也很重要。Meta 分享了六篇论文，称其中五篇回答此前开放的研究问题，同时承认其他团队独立给出了部分问题的解答。群论论文提到 Nilradical 的另一反例，演化代数论文提到 Hu 与 Wen 的并行工作。介绍成果时，这些信息也应该跟着一起出现。

如果只留下“AI 解决难题”，读者就不知道哪些是新发现，哪些是独立重做，哪些贡献在方法或后续理论上。研究结果能够积累，依赖对前人工作的交代，也依赖把自己的贡献说准确。我认为 AI 参与研究后，这项习惯更值得保留。

## 给 AI 一个有办法检查的任务

读完这些案例，我更愿意尝试的，是把一个宽泛问题改写成能够检查的任务。

例如，面对一个猜想，可以先请模型寻找小规模反例，并交代怎样验证对象的属性；面对一段证明，可以要求它指出最依赖条件的步骤；面对两套看似相关的表述，可以让它写清对应关系，再拿具体例子检查。这样做未必能得到发现，但有助于判断下一步该继续还是该停。

![把猜想、证明和跨领域表述改写成可检查的任务](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-20-meta-open-research-verification-img-03-framework-checkable-tasks.png)

站内那篇[关于 Minos 药物发现环境的文章](https://ntlx.github.io/articles/ai-drug-discovery-minos-replayable-lab)讨论过，让代理的选择面对此前实测的分子结果。这里可以连着想：模型的建议需要遇到能纠正它的反馈。药物研究最终要回到物理实验；数学研究则要回到定义、计算和证明，各自的检查不能互相替代。

这些论文让我看见了 AI 参与探索的具体空间，也让我更在意研究者花在修正和解释上的劳动。以后再看到“AI 做出了研究成果”，我会想打开那个具体对象，读读证明的条件，看看贡献声明，以及后来的人有没有接着检查它。

384 这个数字之所以留在我脑子里，就因为它让我有地方开始查。

## 参考资料

- [Meta AI Research：Solving Open Research Problems Together](https://research.meta.ai/blog/solving-open-research-problems-together/)
- [Semiabelian Groups Need Not Be Monomial（含 PDF 与附录程序）](https://ai.meta.com/research/publications/semiabelian-groups-need-not-be-monomial/)
- [The Strict Threshold for Gaussian Ellipsoid Fitting](https://ai.meta.com/research/publications/the-strict-threshold-for-gaussian-ellipsoid-fitting/)
- [Finite-Time Blow-Up of Radial Negative-Energy Solutions for the Mass-Critical Biharmonic Nonlinear Schrödinger Equation](https://ai.meta.com/research/publications/finite-time-blow-up-of-radial-negative-energy-solutions-for-the-mass-critical-biharmonic-nonlinear-schrodinger-equation/)
- [Tightness of the Cycle-Based Relaxation for Completed Length-Three Alpha-Cycles](https://ai.meta.com/research/publications/tightness-of-the-cycle-based-relaxation-for-completed-length-three-alpha-cycles/)
- [String Two-Point Function = Height Function on a Curve](https://ai.meta.com/research/publications/string-two-point-function-height-function-on-a-curve/)
- [On Solvable Evolution Algebras and a Conjecture by García-Martínez and Pérez-Rodríguez](https://ai.meta.com/research/publications/on-solvable-evolution-algebras-and-a-conjecture-by-garcia-martinez-and-perez-rodriguez/)
