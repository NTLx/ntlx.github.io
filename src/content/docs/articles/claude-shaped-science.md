---
$schema: starlight
title: AI 能算，科研还要有人判断什么值得算
description: Claude-shaped science 展示了 AI 怎样接手可计算、可复核的科研子任务；算得出答案只是起点，问题是否重要仍要由领域知识来判断。
date: 2026-10-16
category: ai-agents
primarySourceUrls: ["https://www.anthropic.com/research/claude-shaped-science"]
---

Matthew Schwartz 写到，Claude 大约用 20 分钟复现了他论文中的一组结果；他自己写出相应代码用了数周。速度很抢眼。读到后面的生态学项目，我才看到这篇文章更难回答的部分：计算完成以后，谁来判断它有没有回答一个重要问题？

文章里的生态学经历回答了这个问题。Claude 完成中性生物多样性理论的计算后，Schwartz 很兴奋。植物生物学家 James O’Dwyer 却提醒他，单独这个结果可能不会引起生态学家的兴趣。两人接着重定研究方向，把物种生活史等因素纳入模型。Claude-shaped science 描写的就是这套分工：AI 扩大能执行的计算范围，专家判断该往哪个问题继续走。

![AI 能算，科研还要有人判断什么值得算：计算、选题、核验与署名](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-16-claude-shaped-science-00-infographic-core-summary.png)

## 让问题适配模型，是科研工作的一部分

Schwartz 先让 Claude 整理散射振幅领域不同论文和代码里的计算方法，再把常用工具装进 BootLoops。半数值 bootstrap 的做法是先限定答案可能属于的函数空间，再用高精度数值采样推回解析表达式，最后和另一条数值路线比对。[方法论文](https://arxiv.org/abs/2507.17815)解释了采样精度、函数空间和格基约化怎样配合。[BootLoops](https://www.bootloops.ai/)把这类程序和操作协议收进一个可由不同模型调用的工具箱，代码也公开在[仓库](https://github.com/BootLoops-ai/bootloops/tree/66b680ce742e654cfe86da4f072a69061fe182b1)。

![科学家想做什么与 AI 能做什么只有部分重合，Claude-shaped problems 位于交叠区域](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-16-claude-shaped-science-source-ai-science-overlap.jpg)

工具起初服务于数学物理，后来又被用到生态学、群体遗传和统计学。Schwartz 报告，三个月里项目涉及 18 个领域、形成 36 份手稿。他的[项目清单](https://www.bootloops.ai/papers.html)同时标出“准备中”和“初步稿”。这份清单显示团队扩展研究任务的速度，也提醒读者不能把每份手稿都算作已经得到学界确认的发现。

我昨天写的[模型路由文章](https://ntlx.github.io/articles/model-router-harness-task-fit)，讨论的是请求到来后该怎样分配模型能力。科研场景里的选择发生得更早：先决定什么问题值得整理成模型能接手的任务。

## 计算正确，科学意义才刚开始接受检验

生态学案例把“算对”和“有意义”之间的距离摆得很清楚。Rampal Etienne 2005 年的论文给出了一种中性生物多样性模型的似然公式，让参数估计和模型比较变得可操作。Schwartz 随后报告，巴拿马 Barro Colorado Island 森林的树种组成变化比中性模型预期快 4.5 倍。[BootLoops 项目页](https://www.bootloops.ai/summaries/biodiversity.html)补充了数据和后续建模细节。项目方仍把中性理论论文列为“准备中”，后续模型也标注为初步稿。这是阶段性结果；它说明模型与观测有差异，却还没指出差异由什么造成。

O’Dwyer 提议把研究推进到下一步：利用树种在生长、存活和繁殖上的差别，再加入环境波动，预测哪些树种会增加、哪些会减少。问题随之从“随机过程能不能解释数据”转成“还有哪些可测的生物差异能解释数据”。Schwartz 也承认，自己在不熟悉的领域容易被模型的好结果说服；他几乎每次都需要专家来判断成果是否有意思。

![美国森林调查样地按物种生活史策略分类的分布图](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-16-claude-shaped-science-source-forest-strategies.jpg)

可复核是科学工作的起点。把积分用两种实现算到很高精度，可以发现代码错误或结果不一致；它不能证明数据足以代表研究对象，也不能替研究者判断理论假设和发现的意义。Schwartz 在早前的[Vibe Physics 记述](https://www.anthropic.com/research/vibe-physics)中还写到，Claude 曾调整参数让图表更吻合，关键公式也出过错。模型能照着指令执行检验，研究者仍得决定要检查什么。

## 把科学判断写进流程，也写进署名

团队可以先把模型任务的输入、结果格式和独立检查路线定下来，让每个结论都有办法复现。领域专家也应该在选题时参与，结果出来后再判断一次问题是否值得继续。等到论文快完成才请专家签字，可能已经来不及换方向。

作者最后提出的署名问题同样需要提前处理。研究记录应说明研究者、模型和工具分别完成了什么；科研贡献不能只按谁写下最后一段文字计算。

![分别记录研究者、模型和工具的贡献，留下清楚的署名记录](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-16-claude-shaped-science-03-framework-contribution-record.png)

跨领域项目尤其需要这些约定。作者举出的经济学例子用公开 replication package 检查计算；AccStack 为语言条目保留了原文引句。[NBER 工作论文](https://www.nber.org/papers/w35782)报告了一套复现、改进和扩展经济学计算的工作流，但尚未经过同行评审。[AccStack 初稿](https://www.accstack.org/paper/accstack.pdf)及其[项目说明](https://www.accstack.org/about/)也说，大规模目录无法逐条人工核验。读者需要这些状态信息来判断证据走到了哪一步。

![人类知识在不同学科中分布不均，工具可以连接尚未填补的知识空隙](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-16-claude-shaped-science-source-convex-hull.jpg)

AI 让更多原本太分散、太费工的计算变得可做。研究者可以把更多时间花在选题、反证和解释上，但前提是团队把核验办法与署名责任也一起安排好。Claude-shaped science 让我看到，计算成本下降以后，科学判断仍要由人承担。

## 参考资料

- [Claude-shaped science（Matthew D. Schwartz / Anthropic）](https://www.anthropic.com/research/claude-shaped-science)
- [Analytic Regression of Feynman Integrals from High-Precision Numerical Sampling（arXiv）](https://arxiv.org/abs/2507.17815)
- [A new sampling formula for neutral biodiversity（Rampal S. Etienne, 2005）](https://doi.org/10.1111/j.1461-0248.2004.00717.x)
- [BootLoops: an LLM-driven toolkit for exact quantitative science（arXiv）](https://arxiv.org/abs/2610.02286)
- [BootLoops 项目论文与稿件状态](https://www.bootloops.ai/papers.html)
- [Vibe physics: The AI grad student（Matthew D. Schwartz / Anthropic）](https://www.anthropic.com/research/vibe-physics)
- [An LLM Workflow That Reproduces, Improves, and Extends Published Economics Research（NBER Working Paper 35782）](https://www.nber.org/papers/w35782)
- [AccStack 初稿论文](https://www.accstack.org/paper/accstack.pdf)
