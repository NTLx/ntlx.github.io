---
$schema: starlight
title: "去 Fry's 买书、把公司当 F1 赛车与系统思考：黄仁勋在 YC 讲出的生存真理"
description: 黄仁勋在 YC Startup School 2026 的对谈不仅是创业史话，更是对 AI 时代生存范式的透视：从承认算法选错去卖场买书，到用“系统思考”替代低级编码。未来的核心壁垒不在于手写代码，而在于微观可控性与一日复一日的生存韧性。
date: 2026-07-30
category: ai-industry
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-30-jensen-huang-yc-mindset-systems-thinking-img-00-infographic-core-summary.png)

在 Y Combinator 举办的 Startup School 2026 上，Garry Tan 与黄仁勋坐在一起。全场观众也许期待听到关于万亿市值英伟达的宏大赞歌，但黄仁勋一开口，抛出的却是一个相当“狼狈”的开头：

“绝大多数人不相信，英伟达创业时选的底层技术是彻底错误的。”

1993 年，英伟达拿着几百万美元融资，准备用二次曲面贴图算法重新定义 3D 图形。到了 1995 年，微软 Direct3D 和 SGI OpenGL 确立了以多边形三角形为核心的行业标准，市场上瞬间挤进了近 40 家竞争对手。英伟达的路线从数学原理上就被判了死刑。

黄仁勋没有开会把失败包装成战略调整，而是直奔 Fry's Electronics 卖场，揣着几百美元买了三本 OpenGL 教科书扔给工程师：“我们 raised money，然后买了教科书。”

随后他飞去日本，对 Sega 总裁入江昭雄坦白：我们答应给 Dreamcast 做的芯片路线彻底错了，但如果我们拿不到合同款就会破产，所以请把 500 万美元尾款付给我们。入江被这种极致的诚实打动，给英伟达开出了救命支票。

这段看似古早的创业轶事，隐藏着英伟达 34 年来最核心的底层机理：**面对现实（Confront reality），带着“这能有多难？”（How hard can it be?）的野蛮学习力，在底层的绝对理性与最高层的狂妄直觉之间，一天只解决一天的生存。**

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-30-jensen-huang-yc-mindset-systems-thinking-img-01-paradigm_shift.png)

## universal function approximator：15 年前的透视眼

如果把英伟达的崛起归结为“赌对了 GPU 算力”，那就低估了黄仁勋的抽象能力。

在对谈中，黄仁勋谈到了 2012 年 AlexNet 爆发的时刻。当时大多数芯片厂商和软件工程师看到的只是一个能在 ImageNet 上识别猫和狗的卷积神经网络，但黄仁勋通过英伟达的视镜看到的却是：**人类终于找到了通用函数拟合器（Universal Function Approximator）。**

“15 年前我就在到处跟人讲，我们发现了通用函数拟合器。只要给它足够多的输入和输出，它就能学会在数学上拟合几乎任何复杂的函数。”

这个透视眼直接决定了英伟达的路线：英伟达从来不是一家单纯制造 GPU 的硬件公司，它的本质是“加速特定算法领域（Accelerating an algorithmic domain）”。无论是流体动力学、分子模拟，还是深度学习，芯片只是载体，真正的生意是把算法范式提炼为算力堆栈。

当整个行业还在讨论“要不要为 AI 写专门的软件”时，英伟达已经在 15 年前重新规划了包含处理器、中间件、算法到应用的“五层蛋糕”（Five-layer cake）。

## 系统思考是新的编程语言

当谈到今天坐在 Chase Center 里的年轻人该学什么时，黄仁勋给出了一个极其直接的断言：**低层编码（Low-level coding）将被完全自动化，系统思考（Systems Thinking）才是新的编程。**

“在我的时代，我们手写代码、合成晶体管门电路。现在这些全都被 Agent 自动化了。你不再需要坐在电脑前一行行敲代码，你需要的是系统意识、系统设计与抽象能力。”

未来的核心能力，不再是熟练掌握某种语法，而是：
* 明白系统的输入输出速率与瓶颈所在（内存、网络还是算力）；
* 理解 Amdahl 定律在并发智能体集群中的作用；
* 定义明确的边界条件与约束，编排数以百万计的 Agent 协同运转。

这种系统思考的转变，与我们在 [《Not the Model, You're the Harness》](https://ntlx.github.io/articles/not-the-model-youre-the-harness) 中探讨的机制完全同频：大模型本身只是原材料，真正决定生产力上限的是包裹在其外侧的系统 Harness（控制环）。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-30-jensen-huang-yc-mindset-systems-thinking-img-02-systems_thinking.png)

## 80% 的 Agent 与微观可控性

针对当前 Agent 落地中的焦虑，黄仁勋提出了一个极其接地气的工程解法：**我们不需要 Agent 达到 100% 完美才去用它。**

“如果 Agent 只有 80% 的准确率，但它能提供极其精准的微观控制（Controllability）——比如在 Plan 文件里修改一个词，在 CAD 零件图层中改动一个螺栓，系统能精准重新生成其余部分——这就会带来颠覆性的变革。”

目前许多黑盒 Agent 最大的痛点，正是缺乏这种细粒度的控制能力：要么全对，要么一旦做错就推翻重来。

黄仁勋透露，英伟达内部并没有统一强制使用某种 AI 效果器，而是让 Open Claude、Codex、Cursor、Hermes 等工具“千花齐放”。让几千个 Agent 在沙盒里并行运行，并通过递归自我改进更新长短期记忆与知识图谱。

这种让每个人拥有、掌控并调教属于自己 AI 的模式，也正好应验了 [《你"拥有"智能的那天，就是它开始欠你的那天》](https://ntlx.github.io/articles/own-your-intelligence-paradox) 中的洞察：真正能成为企业与个人资产的，永远是可控、可微调且与工作流深度绑定的私有智能节点。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-30-jensen-huang-yc-mindset-systems-thinking-img-03-jevons_paradox.png)

## 杰文斯悖论：自动化任务不会杀死岗位

关于 AI 是否会导致大量白领失业，黄仁勋在现场直言“AI 将摧毁 50% 初级岗位的说法完全是无稽之谈”。

他提出了一个清晰的分水岭：**AI 自动化的是具体“任务”（Task），而不是“岗位”（Job）。**

一个岗位的本质是为了达成某种社会或商业目的，里面包含了成百上千个任务。当其中重复性、消耗性的任务被 AI 大幅降低成本后，会发生典型的杰文斯悖论（Jevons Paradox）：

* **软件工程**：虽然写代码这个任务被自动化了，但人类对新软件和新想法的积压需求（Backlog of ambitions）无限庞大，软件工程师岗位反而年增 10%；
* **医疗影像**：虽然读取 X 光片的任务被 AI 辅助完成，但医院能够承接的患者数量暴增，放射科医生和护士的需求量增加了 20%；
* **法务领域**：AI 整理合同没有淘汰法务，反而让律师事务所能够承接更多诉讼案件，法务助理岗位大幅增长。

技术的突破从来不会减少人类的总需求，它只会把人类从低效的泥潭中拉出来，去挑战规模更大、复杂度更高的硬核科学问题。

## F1 赛车手与“How hard can it be?”

在访谈的最后，Garry Tan 问黄仁勋如何看待创始人模式（Founder Mode）与组织架构的重塑。

黄仁勋给出了一个极其形象的比喻：**CEO 就是 F1 赛车手。你是在造一台你自己要开去比赛的 F1 赛车，你必须把这台车改装成最适合你自己驾驶风格的样子。**

“有人问我，黄仁勋如果你不按常规管理学去建组织，哪天你不在了怎么办？我说：等下一任 CEO 来了，让他们重新把公司改装成适合他们自己的样子就好。因为我们是赛车手，我们必须赢。”

这种对常理的无视，贯穿了他 34 年的创业历程。从去 Fry's 卖场买教科书救急，到 15 年前决定孤注一掷下注 CUDA，再到如今在 2026 年首度注册 X 账号为开源模型站台，黄仁勋给所有缔造者的底层心智只有一句话：

**“How hard can it be?（这能有多难？）”**

世界每天都在剧烈变化，面对未知的恐惧与焦虑毫无意义。认清真实的硬约束，相信自己的学习能力，一天只克服一天的困难。只要你留在这个赛场上，“How hard can it be?” 终究会变成现实。

---

*当 AI 开始帮你处理低层代码与日常任务时，你目前最希望用“系统思考”去解决的那个积压已久的大难题是什么？*

## 延伸阅读

- [《你"拥有"智能的那天，就是它开始欠你的那天》](https://ntlx.github.io/articles/own-your-intelligence-paradox)
- [《Not the Model, You're the Harness》](https://ntlx.github.io/articles/not-the-model-youre-the-harness)
- [《当法务开始写代码——OpenAI 这篇 Codex 数据报告，藏着比 AI 替代人更深的信号》](https://ntlx.github.io/articles/codex-agents-dissolving-job-boundaries)
- [《我读了 Hermes 的记忆系统，发现 AI 记性好不是好事》](https://ntlx.github.io/articles/hermes-memory-system)

## 参考资料

- [Jensen Huang: The Mindset That Built NVIDIA - Y Combinator](https://www.youtube.com/watch?v=I4B37S1dyQQ)
- [Founder Mode - Paul Graham](https://paulgraham.com/foundermode.html)
- [Nvidia History & Sega Investment](https://en.wikipedia.org/wiki/Nvidia)
- [AlexNet & Deep Learning Revolution](https://en.wikipedia.org/wiki/AlexNet)
- [U.S. Bureau of Labor Statistics](https://www.bls.gov/)
