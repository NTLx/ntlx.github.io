---
$schema: starlight
title: 代码整洁不是给人看的，也是给 Agent 省钱的
description: AI coding agent 不怕脏代码？SonarSource 用 660 次试验证明：通过率确实不变，但 token 多花 8%、文件反复多读 34%。代码整洁度没死，只是从人类可读性投资，变成了 agent 的导航成本杠杆。
date: 2026-07-08
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-08-code-cleanliness-agent-cost-img-00-infographic-core-summary.png)

## 你以为 AI 不怕脏代码

有一种直觉在 2025 到 2026 年间越来越响：代码质量原则是给人类读者校准的，agent 接管后就过时了。agent 不会嫌 2000 行方法太长，不会觉得 `xfm_q2` 难懂，不会因为嵌套五层就迷路。所以，别花时间整理代码了，让 agent 去啃。

这直觉有道理。机器确实没有审美疲劳。

但 SonarSource 今年 5 月发的一篇论文说，这个判断只对了一半。agent 确实能在脏代码上完成任务——通过率几乎不变。但完成同一件事的代价不同：token 多花 7-8%，而且它会反复回头重读自己刚改过的文件，比在干净代码上多 34%。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-08-code-cleanliness-agent-cost-img-01-minimal_pair_experiment.png)

我觉得这篇论文有意思，倒不全是因为它证明了"干净代码好"，谁不知道呢。是它证明的方式，以及它揭示出的一个被忽视的维度。

## 660 次试验，一个被忽视的维度

先说方法。

比较两个不同项目的代码质量没有意义，语言不同、框架不同、测试覆盖不同，任何一个差异都可能是替代解释。SonarSource 的做法是构建"最小对立对"：同一个项目，做成两个版本，架构、依赖、测试、外部行为完全一致，只有代码整洁度不同。干净的一侧 SonarQube 违规少、认知复杂度低；脏的一侧违规多、复杂度高。

他们构建了六对这样的仓库，三对从干净出发做脏化（Slopify），三对从脏出发做清洁（Vibeclean）。双向构建是关键。如果只做单向，批评者可以说"你的脏化方式太极端"或"你的清洁方式太机械"。两个方向交叉验证，排除构建方式本身引入的偏差。

然后是 33 个编码任务，每个任务在每侧跑 10 次。总共 660 次试验。Agent 是 Claude Code + Sonnet 4.6。

结果呢？

通过率：干净侧 0.913，脏侧 0.921。差异不到一个百分点，统计上无意义。如果你只看这个数，结论是"代码整洁度对 agent 没影响"。

但往下看就不一样了。输入 token 降 7.1%，输出 token 降 8.5%，推理字符降 11.1%。文件重复访问次数降 34%——这是所有指标中最大、最一致的信号，六个仓库方向全部相同，从 -7% 到 -69% 不等。

两个司机都能从 A 开到 B。一个走直线，一个绕了三圈。到达率一样不代表路线效率一样。

## 34% 的"回头"

文件重复访问（revisitation）这个数字值得单独拿出来说。

它的定义是：agent 读了一个文件、编辑了它、然后又回去重读。论文作者把它解释为"对前一次编辑的不确定性"。在脏代码上，agent 改完一个文件后，因为周围代码难以理解（深层嵌套、命名模糊、god method），它不确定自己的改动是否正确或完整，于是反复回去检查。在干净代码上，代码结构清晰，改一次就有信心继续前进。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-08-code-cleanliness-agent-cost-img-02-agent_file_revisitation.png)

这个解释让我想到的不是代码质量，是缓存。

LLM agent 的上下文窗口就是一个缓存——有固定容量，有驱逐策略，有加载成本。agent 编辑了文件 A，去编辑文件 B，这时文件 A 的内容已经从活跃上下文中退出了。如果它需要确认 A 的状态，就必须重新把 A 读进来，哪怕它五分钟前刚写过这个文件。

脏代码让这个"驱逐-重加载"循环更频繁，因为脏代码的信息密度更高，同样行数里有更多需要确认的细节。干净代码结构清晰，读一遍就能在上下文中建立足够稳定的表征，不需要反复刷新。

34% 的重复访问下降，本质上就是 34% 的缓存未命中减少。

这个类比不是修辞。agent 的上下文窗口和 CPU 的 L1/L2/L3 缓存遵循同样的局部性原理。刚访问的信息很可能再次需要（时间局部性），当前信息的附近很可能也需要（空间局部性）。代码整洁度对 agent 的价值，本质上是缓存友好性的价值。

在[之前聊 AI 账单的文章](https://ntlx.github.io/articles/tokenpocalypse-ai-token-cost)里我提到过，Uber 工程师用 Claude Code 月费 $500-$2000，GitHub Copilot 转 token 计费后重度用户预估月费从 $29 涨到 $750。在这个成本量级下，7-8% 的 token 节省不是小数。

## 不是所有整洁都有用

论文里最让我意外的部分是两类任务的对比。

14 个多模块任务（需要跨越两个以上模块的修改）：干净侧 input token 降 10.7%，文件重复访问降 50.8%。效果巨大。

13 个认知热点任务（集中在单个复杂方法或类上）：input token 反而微升 1.8%，文件读取数增加 11.2%。整洁代码在这个场景下几乎没有帮助，甚至可能帮倒忙。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-08-code-cleanliness-agent-cost-img-03-module_vs_hotspot_tension.png)

为什么？论文给了两个案例研究来解释这个张力。

BCEL 项目：脏版本是两个几百行的 switch-case god method，干净版本被拆成十几个命名清晰的 helper。Agent 在干净版本上可以用 grep 精确定位到具体 helper，在脏版本上必须扫描整个 250 行 switch。结果 input token 降 35%。

Genie 项目：清洗管道在核心启动逻辑周围提取了 helper，但核心逻辑本身没变。文件在干净版本上并没有变小，反而因为有了更多 surrounding methods 而增加了导航面积。结果 input token 升 8%。

对比揭示的机制很具体：重构是否帮助 agent，取决于重构是否让目标代码变得 grep-targetable。把 god method 拆成 named helper = 给 agent 提供精确搜索的锚点。在 focal logic 周围添加结构 = 增加 surface area 但不改善可搜索性。

agent 的代码导航核心工具是文本搜索，不是人类的"读目录结构然后跳转"。重构对 agent 的价值不在于是否改善了人类可读性，而在于是否改善了文本搜索的精度。

这也是为什么聚合数据里 -7.1% 的 input token 降幅掩盖了巨大的任务间分裂：逐任务看，16/27 干净侧更少，11/27 脏侧更少，跨度从 -47% 到 +44%。同一个仓库的两个任务可以给出完全相反的结果。结论只在大量试验的聚合层面成立。

## 人类为理解付费，agent 为导航付费

对人类开发者来说，整洁代码是长期认知投资。它让新人上手更快，让老手维护更轻松。价值在时间轴上展开，维护三年的项目，好代码和好命名的复利是巨大的。

对 agent 来说不是这样。agent 没有"长期"，每次对话都是从零开始。它不需要"上手"一个项目，只需要在这一次对话中完成任务。整洁代码对 agent 的价值不是"让理解更容易"，是"让导航路径更短"。

人类读脏代码：理解变慢，但最终能理解（靠经验补偿）。agent 读脏代码：理解不变慢（没有理解的深度概念），但导航变多（靠重新读取补偿）。两者的瓶颈完全不同。人类的瓶颈是理解深度，agent 的瓶颈是工作记忆容量。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-08-code-cleanliness-agent-cost-img-04-cache_miss_analogy.png)

但底层物理是一样的。

所有有限信息处理系统，在遍历信息空间时，都承受导航成本。人类工作记忆 7±2 个槽位，超出就要做笔记、画图、反复默念。LLM agent 上下文窗口 N 个 token，超出就要读文件、驱逐、再读文件。CPU 缓存 L1/L2/L3，miss 一次延迟翻十倍。

代码整洁度不能消除有限性。它只能让有限性的税更轻一些。

"AI 时代代码是否还需要整洁"这个问题，此刻显出了它的真正形状：AI 能不能处理脏代码？能，通过率不变。AI 是否需要人类意义上的整洁？不需要，它没有审美。真正要问的是：你愿意为有限性支付多少导航税？

## 该信几分

说完好的，说说打折的部分。

SonarSource 是卖代码质量工具的。"代码整洁度对 agent 有用"这个结论恰好是它的产品价值主张。这不意味着结论是假的，但意味着需要独立复现才能完全采信。

只测了 Claude Code + Sonnet 4.6 一个配置。Haiku 4.5 跑了一轮但通过率太低无法读取 footprint 差异，GPT 和 Gemini 完全没测。7-8% 和 34% 这两个数字不能直接外推到其他模型和 agent 框架。

论文只看了短期单次任务。33 个任务都是一次性修改。跨月跨年的累积效应没有测量。而 SlopCodeBench 已经证明 agent 自己写的代码会随时间退化——最终比人类维护的基线长 2.3 倍。干净代码上的短期节省，可能被 agent 自己制造的脏代码抵消。

没算清理成本。从脏到干净要花多少工程师时间？7-8% 的 token 节省能否覆盖？按 $100/seat/month 算，省 $7-8/月/开发者，二十工程师小时的重构要数年才能回本。

HN 上有人[质疑方法论](https://news.ycombinator.com/item?id=48798815)："我不会信任任何需要假设 AI '清洁'过的仓库能代表真正好代码库的结论。"第一作者[回应](https://www.developersdigest.tech/blog/code-cleanliness-affects-ai-coding-agents)说他们的"清洁"不是让 agent 写更好的代码，而是给它们静态分析器的违规列表并要求移除特定问题——一个有边界的操作，不是开放式重构。这个回应是合理的。

所以我的判断是：方向可信，量级参考，不能当规律用。

对实际使用 coding agent 的人来说，操作建议分三层：如果你团队已经在做代码整洁（lint、code review、static analysis），agent 时代不需要停——token 节省是可量化的 ROI。如果你的 agent 工作流以跨模块修改为主，整洁代码的收益最大。但如果是单文件单函数的简单任务，整洁度几乎不影响成本。

代码整洁度加入了 agent 工程的成本函数——与模型选择、harness 设计、prompt 工程并列，成为影响效率的第四个可控变量。它不是万能药，但它也没死。

只是换了一种活法。

*你的 agent 在脏代码上会反复回头吗？你有没有观察到类似的行为模式？*

## 参考资料

* [Does Code Cleanliness Affect Coding Agents? (arXiv)](https://arxiv.org/abs/2605.20049)
* [Your AI bill is a code quality problem (SonarSource)](https://www.sonarsource.com/blog/your-ai-bill-is-a-code-quality-problem/)
* [Code Cleanliness as an Agent Cost Lever (AgentPatterns.ai)](https://agentpatterns.ai/workflows/code-cleanliness-agent-cost-lever/)
* [SlopCodeBench: Benchmarking How Coding Agents Degrade (arXiv)](https://arxiv.org/abs/2603.24755)
* [HN 讨论帖](https://news.ycombinator.com/item?id=48798815)
* [Clean Code Makes AI Agents 34% More Efficient (Developers Digest)](https://www.developersdigest.tech/blog/code-cleanliness-affects-ai-coding-agents)

## 延伸阅读

* [Tokenpocalypse：当你发现 AI 账单比 AI 产出更好量化](https://ntlx.github.io/articles/tokenpocalypse-ai-token-cost)
* [Agentic Workflow 烧掉的钱去哪了？](https://ntlx.github.io/articles/token-efficiency)
* [Copilot 真正在省的不是 token](https://ntlx.github.io/articles/copilot-context-model-routing)
* [你的 Agent 读得懂代码，读不懂你的产品](https://ntlx.github.io/articles/vercel-agent-product-design)
