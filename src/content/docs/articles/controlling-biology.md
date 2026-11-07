---
$schema: starlight
title: 给细胞模型一个值得动手的实验
description: 读Fabian Theis的访谈，我更关心虚拟细胞怎样改变实验选择。指标能否辨认有效预测、培养体系允许哪些操作，共同限定了模型能把细胞带到哪里。
date: 2026-11-07
category: ai-models
primarySourceUrls: ["https://lspace.beehiiv.com/podcast/s/latent_space_the_ai_engineer_podcast/controlling_biology_-_fabian_theis_helmholtz_munich_1"]
---

读Fabian Theis这期访谈，最让我停下来想的，是他在结尾谈的一件小事：模型给出建议以后，怎样说服实验者花时间去做？培养细胞、等待读数，都要有人投入。研究者面对一份奇怪的配方，会犹豫，也会想按自己的经验改一改。

节目叫《Controlling Biology》。这个题目很大，结尾却把它拉回实验台：我愿不愿意把下一次实验交给这条建议？

读完这段，我对“虚拟细胞”有了更具体的期待。一个模型能帮助人选择值得动手的实验，就有了可检验的用处。但这个期待也附带条件：我们得知道什么结果算好，以及实验中到底允许改变什么。

![评价指标、可用实验条件与测量反馈共同影响实验选择](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/controlling-biology-00-infographic-core-summary.png)

## 细胞看得更多，未必问得更广

访谈中的“扰动”，可以先理解为对细胞改变某项条件，再观察它怎样响应。敲除基因、加入药物属于扰动，换培养液、改变邻居传来的信号，也属于这个范围。细胞不是只读取自身基因的孤立对象。

Theis提醒，积累了很多细胞观测，不等于充分探索了扰动。反复测相近条件下的细胞，可以把那片区域看得更细，却没有自动回答换条件之后会怎样。

这让我对“训练了多少细胞”这个数字多了一层保留。假如研究的问题是选药物、定剂量或调整培养条件，我还想知道，数据覆盖了哪些操作、组合和背景。这些是评价模型时需要追问的条件。

状态表征和变化预测也有区别。把细胞放进一个有用的表示空间，可以帮助描述它是什么；要指导实验，还得知道施加某种操作以后，它会变成什么。把前者做得更大，不足以单独证明后者已经可靠。

## 先确认尺子能认出好结果

虚拟细胞领域有个令人尴尬的争论：复杂模型有时赢不了简单基线，甚至赢不了均值预测。均值预测不细分某次扰动的独特效果，也可能得到漂亮分数。

原文链接的[指标校准论文](https://www.nature.com/articles/s41587-026-03307-w)解释了其中一种原因。如果某次扰动只改变少量基因，把误差平均到大量变化不大的基因上，重要的差别就会被稀释。预测得接近平均状态，可能比捕捉变化更容易讨好这个指标。

作者为评价引入正控思路：除了问模型能否赢过没有针对性信息的预测，还要问，这把尺子能否认出一个确实保留了扰动信号的参照。具体做法包括把同一扰动下的细胞分开，用一部分去预测另一部分，并进一步构造插值参照，检查指标区分好坏的范围。

![Miller等原论文Fig.1：技术重复、插值参照与指标动态范围，CC BY 4.0](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/controlling-biology-01-source-metrics-calibration.png)

原论文图1展示的就是这套校准思路。图中各指标的差别，提醒我们不能只凭一个总分判断模型有没有学到东西。图片来源：Miller等，原论文Fig.1，依CC BY 4.0许可复用。

我觉得这比“深度学习到底行不行”的争辩更有用。尺子分不清有信息和没信息的预测，排行榜就无法回答研究者在意的问题。

但校准也不是替复杂模型解围的通行证。论文支持的是：在校准较好的指标上，深度模型可以超过无信息基线。它没有证明任意复杂模型都值得用，也没有解决未知细胞类型、供体或条件中的泛化问题。简单基线仍然要认真做。

## 一个细胞的背景，藏在它周围

Theis谈到类器官时很兴奋：多细胞系统让研究者接触到比单一细胞系更丰富的行为。他也紧接着提到限制，例如免疫成分或供养条件可能不完整。把培养皿里的系统叫作“小脑”“小心脏”，容易让人忘记这种距离。

我更在意的，是这里改变了问题的单位。我们不能总把细胞当作独立的一行数据。它周围有哪些细胞、处于什么空间环境，可能正是理解它为何处于当前状态的线索。

![Tejada-Lapuerta等原论文Fig.1：联合数据与空间任务，CC BY 4.0](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/controlling-biology-02-source-nicheformer.png)

[Nicheformer论文](https://www.nature.com/articles/s41592-025-02814-z)给了这种思路一个具体落点：结合解离细胞与空间数据，研究邻域组成、细胞密度等空间任务。原论文图1展示了数据和任务的连接；它并不意味着能够精确重建每个邻居的完整状态。图片来源：Tejada-Lapuerta等，原论文Fig.1，依CC BY 4.0许可复用。

于是，“给细胞加了什么”之外，还要问“给哪个背景中的细胞加”。如果目标是帮助设计实验，我会希望评价保留这些区别，而不只是把不同背景平均成一个方便计算的答案。

## 缺一种原料，模型不能靠优化补出来

访谈最后提到LabCompass：已有一个预测实验结果的正向模型之后，能否反过来，从想要的细胞状态寻找实验条件？

我查到的[LabCompass预印本](https://www.biorxiv.org/content/10.64898/2026.10.07.756550v1.full)已经公开，尚未经过同行评审。研究围绕体外人造血细胞培养展开，通过四轮实验反馈更新模型。它根据目标生成培养条件候选，结合预测结果与不确定性选择实验，再把测量结果带回模型。

这里我最想保留的细节，是团队发现既有培养参数不足以有效富集某些谱系之后，加入了M-CSF和淋巴谱系培养组合，拓展设计空间。

![既有条件内优化与引入新实验条件的概念对照，非实验数据](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/controlling-biology-03-comparison-design-space.png)

这件事让我重新理解“模型没找到”。它可能是预测不准，也可能是搜索没做好，还可能是现有操作根本不足以到达目标。这些原因需要不同的处理。继续优化同一组输入，不能替代引入缺少的实验条件。

当然，不能据此断言某次失败已经证明目标不可达。实验者还要排查测量、培养过程和模型本身。我的判断只是：评价一个系统时，应该把“在既有条件里找配方”和“发现需要扩展条件”分开看。

我在[材料实验那篇文章](https://ntlx.github.io/articles/materials-experiment-next-step)里，关心测量如何改变下一步选择。这次阅读让我补上一问：如果后续选择始终没有改善，我们有没有检查过，允许模型选择的范围本身就太窄？

## 我想看到的进展

Theis在访谈中把强化学习放在未来愿景里，也说当前更接近主动学习。这一区别值得保留。模型建议实验、实验反馈模型，已经是值得研究的进展；不能因此把系统写成成熟的自主生物学家。

对我来说，往后读这类工作，可以沿着实验追问：模型为什么推荐这组条件？建议是否经过实测？哪些预测错了，错误怎样影响后续选择？遇到难以达到的目标时，是换模型、补数据，还是增添新的操作？

这些问题也解释了开头那位犹豫的实验者。让人愿意花时间验证，需要具体依据；一次验证回来，系统还得能接受修正。“控制生物学”离日常研究有多近，可以从这里慢慢看清。

## 参考资料

- [Controlling Biology：Fabian Theis完整访谈与Transcript](https://lspace.beehiiv.com/podcast/s/latent_space_the_ai_engineer_podcast/controlling_biology_-_fabian_theis_helmholtz_munich_1)
- [Deep learning perturbation models can outperform baselines on calibrated metrics](https://www.nature.com/articles/s41587-026-03307-w)
- [Nicheformer：空间背景中的细胞表示](https://www.nature.com/articles/s41592-025-02814-z)
- [LabCompass：Generative inverse design steers human hematopoietic cell fate in vitro，预印本](https://www.biorxiv.org/content/10.64898/2026.10.07.756550v1.full)
- [Biohub多尺度虚拟生物学计划官方说明](https://biohub.org/news/virtual-biology-initiative-expansion/)
- [延伸阅读：材料实验的价值，落在下一步能否选对](https://ntlx.github.io/articles/materials-experiment-next-step)
