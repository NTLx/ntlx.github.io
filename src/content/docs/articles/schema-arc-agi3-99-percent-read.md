---
$schema: starlight
title: "别盯着 98.98%，盯\"想完记不住\"这件事"
description: 一个 7 月才 13% 的基准突然自报 99%，但真正值得记的不是这个数，是它暴露的那条 LLM 短板。
date: 2026-07-18
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-18-schema-arc-agi3-99-percent-read-img-00-infographic-core-summary.png)

7 月 16 日，Impossible Research 发了个东西，叫 Schema。官网标题很吓人：前沿模型配合他们的 harness，在 ARC-AGI-3 公开集上跑到 98.98%。而同一个基准，3 月份发布时前沿模型只有 0.51%，7 月官方最高也就 13.33%。从 13 到 99，四个月。

数字先放一边。我读完那篇长文，想说的不是"ARC-AGI-3 又被刷榜了"，也不是"这帮人在作弊"。两个结论我都觉得跑偏了。真正吸引我的，是这套东西暴露出 LLM 一个很具体的短板：它不是不会想，是**想完记不住**。

## 98.98% 这个数，到底测的是什么

先把数字掰开。ARC-AGI-3 不数你做对几道题。它的官方指标叫 RHAE，全称 Relative Human Action Efficiency，算的是：人类第一次玩这道题花几步，你花几步，比值平方一下。100% 不是"做对 100%"，是"你的动作效率追平人类"。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-18-schema-arc-agi3-99-percent-read-img-01-score_dilution_factors.png)

这一条很关键。多余的动作会被平方重罚，你多试一倍，分数掉到四分之一。所以 Schema 要做的，不是把题做对，是用尽量少的真实动作把题做对。逼着 agent 别瞎试，先把世界搞懂再动。

那 98.98% 能不能说"攻克 ARC-AGI-3"？不能。三个事实同时稀释它。第一，这是公开集，25 道题，题面公开、人尽皆知，理论上可以针对性调参。第二，self-reported，没经 ARC Prize 独立验证。第三，团队用了个 fallback 规则：Opus 先跑，低于 80 分的题用 Fable 重跑，取高的那个。HN 上有人直接问：这不就是 pass@n 刷到高分吗？

要夸的是，Schema 团队自己没躲。原文白纸黑字写"两个分数都是公开集自报、未经验证"，还专门加一段说"公开集 98.98% 映射到半私有集是多少，不测不知道"。这种诚实在这个圈子里挺稀罕。一篇写得这么克制的文章，被传播成一个"攻克"的标题，中间失真不少。读它的时候别被标题带跑。

## 干净的那一组数字

全文最干净的一组实验，不是 98.98%。

是 42.83 到 98.98。同一对模型，Opus 4.8 加 Fable 5，套 Claude Code 那套通用 harness，42.83%；套上 Schema，98.98%。中间涨了 56 个百分点，模型权重一个没动。

Schema 想说的就是这个：**怎么用模型，是个独立变量**。换个壳，同一颗脑子能差 56 个百分点。这个对比组把"模型能力"这个变量摁住了，只让"用模型的过程"变。结论就稳。

这是我一直相信的一件事，[之前也写过](https://ntlx.github.io/articles/not-the-model-youre-the-harness)：瓶颈经常不在模型，在 harness。Schema 给了这条论点目前为止最硬的一个实证。当然，"摁住模型"不等于"摁住一切"——harness 里塞了多少针对这 25 道题的人类先验，没法审计，因为没开源。这一层风险得认。

## 物理学家怎么玩游戏

Schema 的方法，原文给的说法很好听：让模型像物理学家一样玩。

物理学家面对一个没见过的新现象，不会上来就背公式。先决定这现象是关于什么的：哪部分是物体，哪个量是状态量。然后再问状态怎么变，写下定律，拿实验去测，测不对就改。改的时候有个讲究：可能改定律，也可能改"状态是什么"。原文用了个很漂亮的类比。迈克尔逊-莫雷没测到光介质，洛伦兹选了第一条路，保留以太、给定律打补丁；爱因斯坦选了第二条，直接把以太从状态里扔掉，让同时性变成相对的。狭义相对论就是这么来的。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-18-schema-arc-agi3-99-percent-read-img-02-lorentz_vs_einstein_aether.png)

Schema 把这套搬进 LLM。它让 agent 干一件事：把你猜的游戏机制，写成一个能跑的程序，`step(state, action)`，输入当前状态和一个动作，输出下一刻状态。然后拿你之前真实打过的每一手，回放一遍，看这程序算得对不对、对得上。对不上，回去改程序，可能改规则，也可能改"你把哪些像素当作物件"这件事——也就是改状态表示本身。两个层次在一个可编辑程序里一起改。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-18-schema-arc-agi3-99-percent-read-img-03-schema_control_loop_reuse.png)

名字 Schema 是借康德的。康德说抽象概念没法直接套到具体感知上，中间得有个"构造规则"当桥。"狗"这个概念要落到一只具体的狗上，你得有个"画出狗的形状"的 schema。LLM 脑子里的世界概念，要落到一个 64×64 的网格上，中间也得有个程序当桥。这就是为什么把世界模型写成代码，而不是塞进一个向量。

一旦写成了程序，它就是个模拟器。规划可以在程序里跑 BFS，不花一个真实动作。M0R0 这道题的人类最难一关，人花 500 步，agent 在验证过的模型里搜出 19 步的方案，42 步通关。搜索成本不随"这关有多难感觉"涨。

## 记不住，不是不会想

这是我最想说的一段。

原文结尾有个总结，大意是：harness 降低"用理论"的成本，底层模型决定"发现理论"的成本。读完我发现事不太对。模型发现机制这事，其实没那么卡脖子。FT09 这道题，Fable 11 步就通了，Opus 多花 240 步，但最后也发现了同一个机制。发现能力上，Opus 不弱，只是慢。

卡的是"想完记住并复用"。

RE86 要 393/393 精确回放，把之前打过的 393 步一帧不差地算回来。KA59 要把两条完整 run 摆在一起比，才能推翻一个"看着对其实是凑出来"的规则。这种"把全部历史精确拉出来逐条对"的事，LLM 的上下文窗口结构上撑不住。它会压缩，会忘，会溢出。模型每一步都能想，但想完，下一步就忘。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-18-schema-arc-agi3-99-percent-read-img-04-weights_memory_search.png)

Schema 的解法不是给模型加记忆，是把记忆从神经元里挪出来，搬到磁盘上的一个文本文件——`world_model.py`。一个你能 cat 出来看、能 diff 的程序。不是激活值，是文件。这哪是给模型加工具，这是把"智能"的一个零件，从模型内部搬到了外部。

我的判断是：Schema 触碰的是一个比"刷榜"大得多的位移。如果 LLM 的智能可以用三件东西拼出来——模型、记忆、搜索——那 LLM 生来只有两个半。模型有，权重里压了世界知识。搜索有，上下文里能推理。但记忆是残的，上下文窗口会挥发。Schema 补的就是那半个。这不是 harness 工程优化，是智能架构从"权重即智能"往"权重加外部记忆加搜索即智能"挪了一步。

为什么非挪不可？因为权重训练完就固定，上下文物理上会遗忘。这是 LLM 这东西的结构性宿命，不是 Schema 的选择。挪不挪不是问题，往哪挪才是。

## 但这套东西能不能搬走

得说清楚边界。Schema 在 64×64 离散网格、16 色、有限动作上验证的。机制能用离散程序表达，这是它成立的地基。换到连续物理、真实视觉、动力学系统，程序化表示会塌。他们自己的前作 VIGA 在连续视觉上只解了一半。HN 有人问这套能不能搬到 Atari、NES 游戏，没人答得上来，包括我。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-18-schema-arc-agi3-99-percent-read-img-05-generalization_boundary_grid.png)

还有一层。ARC-AGI-3 的私有集 110 道题，刻意做得和公开集不一样、刻意 out-of-distribution。Chollet 早就说过，公开集表现不代表私有集。Schema 在公开集 99%，到了私有集能剩多少，谁都不知道。团队自己也认，没吹"已饱和"。

## 分歧不在工程，在"智能住哪"

这篇文章最让我琢磨的，不是方法，是社区反应。一个基准发布 48 小时，两派人吵得挺凶。

一派说 harness 才是关键，模型能力一直被低估，换个壳就能从 13 到 99，说明值得投的就是"怎么用模型"。另一派说这是 cheating：公开集题面公开、分数自报、fallback 取高分，这不是攻克，是把人类智力塞进 harness 再算成模型的分。HN 上有人原话：这跟在旁边开个国际象棋引擎有什么区别。

我越看越觉得，这俩吵的压根不是同一件事。根子在更底一层：**智能到底住在哪里**。

Chollet 默认智能住在权重里。所以 ARC 的官方榜禁 harness、禁定制工具、用极简通用 prompt，要测的是裸模型的流体智力，任何注入人类智力的 harness 都是污染。这是他一直以来的立场：注入 harness 能人为抬高 ARC-AGI-3 分数，但不会提升任何其他领域的能力，所以不算数。

Schema 默认智能住在权重加流程加外部记忆这个系统里。harness 不是干扰项，是智能的一部分。

这两个默认不撞上，"Schema 是创新还是作弊"永远吵不清。Chollet 把 harness 当干扰排除，Schema 把 harness 当智能纳入。一个测模型，一个测系统。没有谁错，是测的不是同一个东西。

我个人偏后者，但得诚实：这是立场，不是实证。Schema 的受控实验只证明了"换个 harness 分数涨 56 个百分点"，没证明"智能住在系统里"这个哲学判断。后者是我读完之后的一个猜测，写在这里供你判断。

## 诚实的边界

收尾，不拔高。

Schema 做的事，真要凝成一句：它示范了一种新的"用模型"的方式，把猜到的世界机制写成程序、拿全历史回测验证、在程序里免费搜索规划。这套循环是可以搬走的骨架。至于 98.98%，是公开集自报的一个阶段性回声，搬不到别处，也验证不了。

它指向的那个位移，智能从"只住在权重"往"权重加外部记忆加搜索"挪，会不会真发生，不取决于这篇，取决于这套循环能不能在比 64×64 网格丰富得多的环境里活下来。他们自己结尾那句"new beginning"是不是真的开端，现在没人说得准，包括他们自己。

但有一点我现在就敢认：LLM 会想，想完记不住。这件事被 Schema 拎出来摆到台面上了。哪怕最后证明这套方法只对这种离散小网格有效，"记不住才是真瓶颈"这个观察，也够留下来了。

*读完这篇，你更倾向哪一边：智能住在权重里，还是住在权重加外部记忆加搜索的系统里？要是后者，那"AI 能力"和"AI 系统"该不该分开算分？*

## 参考资料

- [Schema: Frontier Models with Our Harness Achieve ~99% on ARC-AGI-3 Public — Impossible Research](https://schema-harness.github.io/)
- [Haven Feng 发布帖（X）](https://x.com/HavenFeng/status/2077770348876247502)
- [ARC-AGI-3 技术报告（arXiv:2603.24621）](https://arxiv.org/abs/2603.24621)
- [François Chollet 关于 harness 立场的 HN 评论](https://news.ycombinator.com/item?id=47522882)
- [HN：Schema Harness Achieves ~99% on ARC-AGI-3 Public 讨论帖](https://news.ycombinator.com/item?id=48935905)
- [Reddit r/MachineLearning 讨论](https://www.reddit.com/r/MachineLearning/comments/1uyf8oo/)
- [Digg：Impossible Research Unveils Schema Harness Reaching 99% on ARC-AGI-3](https://digg.com/tech/3a488ugi)
- [DataCamp：ARC-AGI-3: The New Interactive Reasoning Benchmark](https://www.datacamp.com/blog/arc-agi-3)
- [YC Startup Library：François Chollet 谈 ARC-AGI-3](https://www.ycombinator.com/library/NP-fran-ois-chollet-arc-agi-3-beyond-deep-learning-a-new-approach-to-ml)
- [Not the Model, You're the Harness（本站旧文）](https://ntlx.github.io/articles/not-the-model-youre-the-harness)
- [当计划变成代码——Claude Code Dynamic Workflows 读后感（本站旧文）](https://ntlx.github.io/articles/claude-code-dynamic-workflows)
