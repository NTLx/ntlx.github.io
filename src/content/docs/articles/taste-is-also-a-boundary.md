---
$schema: starlight
title: Taste 既是方向，也是边界
description: 人类的 Taste 能让 AI 搜索有方向，也会让搜索提前收敛。真正开放的 AI 需要在服从目标之外，保留探索目标之外可能性的机制。
date: 2026-10-16
category: ai-agents
---

读完 Matthew Schwartz 的 Claude-shaped science，我最开始接受的是一个很顺的分工：AI 负责大范围搜索、计算和连接知识，人提供 Taste，判断什么问题值得继续。上一篇《[AI 能算，科研还要有人判断什么值得算](https://ntlx.github.io/articles/claude-shaped-science)》写到这里时，我也把 Taste 当成了人的优势。

继续往下想，我开始觉得这个答案还不够。Taste 并不是悬在世界之外的一把尺子。它来自人的需求、学科传统、组织目标和当下的价值判断。它能筛掉噪声，也一定会筛掉一部分我们现在还看不出价值的东西。

如果 AI 只负责越来越准确地满足人的 Taste，它当然会越来越有用，但也可能越来越擅长把我们困在已经知道自己喜欢什么的范围里。

![Taste 的引导与边界：选择压力、目标、随机性和多元评价](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-16-taste-beyond-objectives-img-00-infographic-core-summary.png)

## Taste 是选择压力，不是真理

价值判断并不神秘。很多部分都可以拆成规则：新颖性有多重要，成本能不能接受，风险要惩罚多少，临床意义和商业价值冲突时怎样取舍。只要这些目标和权重给定，AI 完全可以执行，甚至可能比人更稳定。

还可以再往前一步，让 AI 从过去的专家选择中学习隐含权重。这样得到的是一个很强的 Taste 模型，但它学到的首先是“我们过去怎样判断”，不等于发现了一套独立于人的终极价值。

问题出在更上游：为什么这些指标重要，冲突时谁有权决定，什么时候应该修改规则？逻辑可以帮助我们从前提推出结论，却不能让前提本身凭空获得价值。

所以我现在更愿意把 Taste 看成一种选择压力。它不是错误，也不是应该被消灭的东西。没有选择压力，搜索只会淹没在候选里；但选择压力一旦固定得太早，探索也会跟着变窄。

## 优化一个目标，可能正好错过目标

这个问题在搜索研究里已经有很直接的对应。Joel Lehman 和 Kenneth Stanley 在 Novelty Search 的工作中指出，目标函数本身可能把搜索引向死路。他们干脆尝试不奖励“离目标更近”，而奖励行为上的新颖性。[论文](https://pubmed.ncbi.nlm.nih.gov/20868264/)最有意思的地方，不是说目标不重要，而是承认我们设计的目标有时会误导探索。

MAP-Elites 走的是另一条路。它不急着把所有候选压成一个总冠军，而是保存一组彼此不同、各自在特征空间里表现不错的解。[原论文](https://arxiv.org/abs/1504.04909)把这类搜索描述为“照亮”搜索空间：我得到的不只是一个答案，也开始知道还有哪些不同的好答案存在。

![单一冠军与 MAP-Elites 保留多样好解的机制对比，非实验数据](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-16-taste-beyond-objectives-img-01-comparison-search-retention.png)

这让我重新理解了自己前面想到的进化类比。可以粗略地拆成三件事：variation 产生差异，selection 决定哪些差异留下，retention 让成功结果能够积累。Taste 主要落在 selection 上。真正危险的不是有选择，而是整个系统只允许一种选择标准。

如果所有算力都在优化同一个评价函数，AI 越强，反而可能越快收敛到那个评价函数允许看到的局部世界。

## 真随机不会自动带来新思想

这时我又想到一个问题：探索 Taste 之外的空间，是不是需要真正的随机性？纯算法里的伪随机数当然是确定的，知道算法和初始状态，序列原则上可以复现。但现实计算机并不只能困在这里。NIST 的随机比特生成规范明确把[物理熵源](https://csrc.nist.gov/pubs/sp/800/90/b/final)和确定性随机比特生成机制组合起来；量子实验也已经展示过利用 Bell 不等式违反来[认证新随机性](https://www.nature.com/articles/nature09008)。

可这对 AI 创新的核心问题影响没有想象中大。

假设一个模型几乎不会提出某类假设。把采样器背后的伪随机数换成最理想的物理随机源，也不会自动让那类假设变得常见。随机性只决定“这一次往哪边抖一下”，模型的表示、训练形成的先验和生成分布，决定的是“哪些方向本来就在路网上”。

有用的 variation 因此不是均匀地乱试，而是有结构的变化：换表示、换方法、跨领域迁移、组合已有模块，或者故意从与当前答案差异很大的方向继续搜索。随机性可以让系统不总走同一条路，但它本身不会带来创造力。

![更换随机源仍在同一候选分布内采样，有结构的变化则引入新的候选方向](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-16-taste-beyond-objectives-img-02-comparison-randomness-candidates.png)

## 与其消灭 Taste，不如让不同 Taste 共存

走到这里，我不再觉得目标是“让 AI 摆脱人类 Taste”。这件事本身也做不到。只要计算资源有限，选择探索哪里就是一种价值判断；就算我们奖励 novelty，也只是把“新颖值得探索”写进了新的评价函数。

我更愿意让几种搜索同时存在，而不是让单一 Taste 占满搜索预算。

一部分 Agent 沿着当前目标做 exploitation；另一部分维护 novelty 和 diversity；还有一部分专门攻击当前评价标准，寻找那些“因为我们的规则所以从没进入候选集”的方向。不同 evaluator 保留不同解，最后再让现实世界的实验、数据和后果提供一层不能由语言模型自己改写的反馈。

这和 Schwartz 说的 convex hull filling 有一点不同。他观察到的强项，是 AI 把人类已经掌握但彼此分散的知识连接起来，填上凸包内部的空白。我现在更感兴趣的是下一步：AI 能不能帮助我们产生新的点，让凸包本身发生变化？

[Open-Ended Evolution](https://direct.mit.edu/artl/article/30/3/300/123431/Editorial-Introduction-to-the-2024-Special-Issue)研究到现在仍缺少足够的典型实现，这显然还不是一个有现成配方的问题。但方向已经变得更清楚：更开放的智能不能只有“把目标优化得更好”，还得保留发现目标之外事物的能力。

我越来越觉得，AI 最有意思的地方也许不是它最终能不能完美学会人的 Taste，而是它能不能从 Taste 暂时照不到的地方带回一些东西，让人不得不重新回答：原来这也值得吗？

## 参考资料

- [Claude-shaped science — Matthew D. Schwartz / Anthropic](https://www.anthropic.com/research/claude-shaped-science)
- [Abandoning Objectives: Evolution Through the Search for Novelty Alone](https://pubmed.ncbi.nlm.nih.gov/20868264/)
- [Illuminating search spaces by mapping elites](https://arxiv.org/abs/1504.04909)
- [NIST SP 800-90B: Recommendation for the Entropy Sources Used for Random Bit Generation](https://csrc.nist.gov/pubs/sp/800/90/b/final)
- [NIST SP 800-90C: Recommendation for Random Bit Generator Constructions](https://csrc.nist.gov/pubs/sp/800/90/c/final)
- [Random numbers certified by Bell’s theorem — Nature](https://www.nature.com/articles/nature09008)
- [Editorial Introduction to the Special Issue on Open-Ended Evolution — Artificial Life](https://direct.mit.edu/artl/article/30/3/300/123431/Editorial-Introduction-to-the-2024-Special-Issue)
