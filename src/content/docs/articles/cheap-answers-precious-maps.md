---
$schema: starlight
title: 答案在贬值，地图用一次就没了
description: 答案正在贬值，而地图是用一次就毁掉的资产：88 小时、约 1500 万美元量级的算力买到的不是理解，是一份还没人看过的证明。
date: 2026-09-09
category: ai-industry
primarySourceUrls: ["https://simonwillison.net/2026/Sep/8/on-navier-stokes/"]
---

2026 年 8 月 15 日，纽约大学数学教授 Tristan Buckmaster 和现任职 Anthropic 的 Levent Alpöge 在一个几乎没人做的方向上拿到了第一个爆破结果。三周后，9 月 5 日，一个连名字都没公布的 OpenAI 内部模型交出了纳维–斯托克斯问题的候选证明，从启动到出结果约 88 小时。而在它开始工作的四天前，它知道的全部信息是：有人做出来了。

[Simon Willison 这篇 link post](https://simonwillison.net/2026/Sep/8/on-navier-stokes/) 处理的就是这两条时间线。我想说的判断只有一句：**答案正在贬值，地图才稀缺——而地图是唯一一种被使用就会损坏的资源。** 这不是偷数据事件，也不只是抢发纠纷。它是学术制度第一次公开撞上一个转变，而署名、优先权、奖金和数据使用声明，全都是为「答案」设计的。

先把误读清掉，再说为什么这场争议在事实层面结不了案，最后说我自己的位置：我就在同一套结构里。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-09-cheap-answers-precious-maps-img-00-infographic-core-summary.png)

## 先看清楚：这份「解」证的是什么

纳维–斯托克斯方程问的是：三维不可压缩流体的解，会不会在有限时间里「炸掉」，速度冲到无穷。日常的水流看起来好好的，但数学上至今没人能证明它永远不炸。

Clay 数学研究所的官方表述把这个大问题拆成四个可接受命题：A 和 B 说解**永远存在且光滑**，C 和 D 说**存在一个会崩溃的例子**。这个拆分写在 Fefferman 撰写的[官方问题陈述](https://www.claymath.org/wp-content/uploads/2022/06/navierstokes.pdf)里。OpenAI 在[公告](https://openai.com/index/navier-stokes-solution/)里说得很明确：它声称证明的是**命题 C（并同时给出 D）**，方向是「证明方程会崩溃」，不是「证明它永远光滑」。

这一点最容易被标题带偏。所谓「解」，不是造出了一种新流体，而是构造出一个初始光滑、静止的三维流体，在光滑外力作用下于有限时间内发展出奇点，且能量全程保持有限。OpenAI 给出的解的形状是一个涡旋，向内螺旋、越来越细长。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-09-cheap-answers-precious-maps-img-01-openai-vortex-source.png)

用词得守住：**只能说「OpenAI 声称解决」**。证明没有公开，数学界没有评审，Clay 研究所所长 Martin Bridson 对评估流程的描述是「deliberately unhurried」——这个细节来自[New Scientist 的报道](https://www.newscientist.com/article/2588063-openai-has-solved-the-navier-stokes-millennium-problem-using-15m-of-ai-effort/)，属二手转述。

## 两队证明的不是同一个东西

争议里最容易被忽略的技术事实是：两边证的根本不是同一件事。

Buckmaster 团队公开发布的是[三篇论文](https://mastodon.social/@tristanbuckmaster/117233413705701198)：[Euler 方程](https://cims.nyu.edu/~tristanb/euler.pdf)、[IPM 方程](https://cims.nyu.edu/~tristanb/ipm.pdf)和 [Boussinesq 方程](https://cims.nyu.edu/~tristanb/boussinesq.pdf)的有限时间爆破解，外力光滑。他还**相信**已得到 hypo-dissipative Navier–Stokes 的爆破，但明确表示 Lean 验证未完成、没有像样的成稿，因此暂不发布。他们**没有**解决完整的千禧年难题。

OpenAI 那边是 unforced 的 Euler 结果加上 forced 的 Navier–Stokes。它自己在公告里写：「even the precise results proved are different in the Euler case (forced vs unforced)」，有外力与无外力，至少在 Euler 情形下是明确分界。

于是「谁先解决千禧年难题」这个问题本身就被材料否定了。而 Buckmaster 在[他的声明 PDF](https://cims.nyu.edu/~tristanb/statement.pdf)里把话说得很克制：「I have not seen OpenAI's proof. I do not know what their model did, or how. I do not know whether our data was used. I am not accusing anyone of anything.」他陈述的只是「被告知了什么、何时、以及被提议了什么」。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-09-cheap-answers-precious-maps-img-02-dual-track-timeline.png)

## 这场争议在事实层面结不了案

双声道得都放上。

Buckmaster 追问过两件事：OpenAI 发出的第一个 prompt 是什么时候？模型有没有训练过、或访问过他们存放全部草稿的 Codex 会话？按他的说法，前一个问题的回答是「最近几天，在关于我们工作的信息传到 OpenAI 之后」；后一个问题，对方说「模型没有查用户数据」，再追问训练就没有得到回答。

OpenAI 的回应是：研究者与 agent 在对方公开发布前没有以任何方式看到其工作，没有访问任何特定用户数据；紧接着承认「虽然不太可能，我们无法排除由他们使用我们产品所产生的去标识化数据帮助改进了我们的模型」（[数据使用政策见此处](https://openai.com/policies/how-your-data-is-used-to-improve-model-performance/)，其全文我本次未能读取）。Bubeck 在 X 上称指控为「false and inflammatory allegations」，并称没有用对方的 prompt 或证明来驱动模型与 agent，这一段我是通过[Fortune 的报道](https://fortune.com/2026/09/08/openai-says-it-cracked-navier-stokes-math-grand-challenge-buckmaster-accusation-cheating-intimidation-tao-lament/)看到的二手转述，他的原帖我没有直接打开核实。

所以数据使用问题只能写成**悬而未决**：不能写成「OpenAI 偷了数据」，也不能写成「OpenAI 已澄清」。三个理由：证明未公开（Buckmaster 说约一百页，他也没看过）；训练数据不进公开日志，外部无法审计；双方都只在陈述「自己被告知了什么」。至于「针对性抢发」，属于推断：OpenAI 自认 9 月 1 日因传闻启动，但「传闻指向 Alpöge 与 Buckmaster」是它的事后判断（原文是 "which we later realized"）。

那句「无法排除去标识化数据」，功能上是一句不可证伪的声明。它既不是承认也不是否认，效果是让责任无法被追究。

## 传闻是地图的廉价代理

触发成本才是这件事超出「抢发」的地方。

传闻不需要内容，只需要存在性；而「有人在做什么」本身就是可行性证明。OpenAI 承认受传闻启发后启动，88 小时拿到候选证明，Lean 形式化与验证再加 17 小时。规模上，纳维–斯托克斯单独用了约 270 万条消息、约 1300 亿输出 token；按 GPT-6 Astra 公开 API 价折算，仅 3000 亿输出 token 就约合 1500 万美元（Simon 给出[换算链接](https://www.llm-prices.com/#ot=300000000000&sel=gpt-6-astra)）。Fortune 另按算力倍数给出「约 200 万美元量级」的口径，与前者前提不同，不可混用。Euler 阶段的 agent 数也存在一手与二手冲突：公告说约 100，二手报道说 1000。我在这里只采用一手数字。

把这个机制和另外三处独立信号并排看，就串成一条闭环：Simon 的第三个思想实验（我用 ChatGPT 部分解决了一个千禧年难题，我的工作影响训练、以至于后来某个模型帮**别人**抢先解决，概率有多大？）；Tao 的[「难度地形图被压平」](https://mathstodon.xyz/@tao/117237320796901560)（好问题稀缺且不可再生，激励会转向不再分享有前途的方向，将逆转数百年的开放传统）；以及 Anil Madhavapeddy 的[「bug 的传闻足以催生 exploit」](https://anil.recoil.org/notes/rumour-is-the-exploit)，他引用的数据是安全领域平均「利用时间」已经是 **-7 天**，攻击代码先于补丁出现。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-09-cheap-answers-precious-maps-img-03-rumor-to-flattened-map-loop.png)

材料里没人做过这个对照：安全领域的 exploit 有**补丁时效**，洞见没有回收期。一个被抢先的问题会永久失去「第一个解决它」的位置，而它本可以持续几十年的理解价值不会因此回来。所以「传闻即算力」在数学里造成的损失，比在安全领域更不可逆。

当然得留反方：优先权争夺不是新问题，同时发现、独立证明在数学史上很常见。这次的新意不在「有人抢」，而在**触发成本与速度**：从传闻到结果 88 小时，算力达到千万美元量级，而且不需要理解那个方向。

## 没有名字的资产

现在说我自己的判断，它和 Simon、Tao、Anil 都不同：他们分别停在诘问、诊断和类比，我把它们合并成一个资产定价的判断。

我不认为这是偷数据事件：证据层面结不了案，任何定论都超出材料。我也不认为这只是一场抢发纠纷，那样说就把新东西讲旧了。受损的是**第三种资产：未发表的选题判断**。它不是「答案被偷」，是「地图被抄」。

它无法被定价，有三个理由。**不可分割**：选题判断和方向感绑在一起，拆不出一个可交割的部件。**不可证伪**：数据使用没有外部审计，「无法排除」这句话既不能被证实也不能被推翻。**不可追溯**：一旦泄漏，连「我原本领先」这个事实都无法还原。而现行制度只为答案计价：优先权、署名、一百万美元奖金、同行评议，对象全是最终成果。未发表的选题判断既没有名字，也没有计价单位，更没有救济渠道。所以 Buckmaster 拿不出「他们偷了什么」的证据，OpenAI 也拿不出「我们没用什么」的证据；双方都没说谎，受损的是第三种东西。

署名那一段恰好证明惯例有多软：OpenAI 提出可以等 Buckmaster 先发，或由他来写一篇介绍 OpenAI 成果的论文，但明确不邀请 Alpöge 共同署名，理由是雇主存在竞争关系。学术惯例可以被商业关系直接覆盖。

但我不想把责任全推给一家公司。即使没有 OpenAI，这个问题也会被别家推平：算力集中与地图分散的不对称是结构性的，把责任集中在单一公司是道德叙事，不是结构分析。我也不把 Buckmaster 写成纯粹的受害者：他自评成稿「只能被描述为 AI slop」，团队并未解决完整问题，hypo-dissipative 的结果也未经验证。他的位置是**地图持有者**，不是答案被偷的人。

还有一个诚实的边界：本文判断只在「地图比答案更稀缺」这一前提下成立。如果模型很快能自主提出值得问的问题，而不只是解决被提出的问题，那么地图也会被自动化，这个判断随之失效。

站内旧文里，《[AI 生产力幻觉：当产出量暴涨而价值纹丝不动](https://ntlx.github.io/articles/ai-productivity-illusion-slop)》写的是同一件事的日常版本：1300 亿输出 token 换一份还没人看过的证明，就是「产出量暴涨、可验证价值纹丝不动」的极端案例。更早的《[AI 的期末考试：OpenAI 用 750 道真题考出了什么](https://ntlx.github.io/articles/ai-exam-lifescibench)》则是同一个结构——用答案替代理解。

## 我在这套结构里的位置，和一件今天能改的事

我在这条船上，而且规模不小。

这个仓库的写作管线就是一条 agent 流水线：`materials.md` 抓取与核验、`understanding-brief.md` 定判断、`draft.md` 落笔，全程由 agent 执行。结构上它和 Buckmaster 的 Codex 会话是同一个东西：我的未发表草稿同样在模型的可见范围内，我同样无法约束训练策略。

我仍然继续这么做，理由不是「我规模小所以没事」。公开知识库与未发表优先权是**两种资产**：这个仓库的目标是把判断公开出去，它不靠优先权变现；我选择前者，并且承担前者的暴露。Buckmaster 的选择相反，他守着一条冷门路线的优先权；而这次他受损，恰恰因为他遵守了「先验证后发布」的规范。这才是问题所在：规范惩罚守规范的人。

所以今天能改的一件事是：把「问模型」和「让模型看见你的地图」当成两件事。前者可以随便用；后者只在能约束训练策略的通道里做。未发表的核心判断，不该出现在一条你无法审计其去向的会话里。

一个可检查的预测：12 个月内，至少一家机构或期刊会引入 LLM 使用与竞争性数据声明，至少一家 AI 实验室会主动披露「本次结果是否受某条传闻触发」。这两件事都不需要模型能力提升，只需要外部压力。

最后回到那个我一直在想的问题：如果我用 ChatGPT 帮我把一个问题推进了一半，而这份工作最终帮别人先到了终点——我该怎么证明那不是我的功劳，又该怎么证明它曾经是我的？

## 参考资料

- [On the Navier–Stokes Millennium Prize Problem — Simon Willison（本文直接写作对象）](https://simonwillison.net/2026/Sep/8/on-navier-stokes/)
- [On the Navier–Stokes Millennium Prize Problem — OpenAI（公告全文）](https://openai.com/index/navier-stokes-solution/)
- [Tristan Buckmaster 的声明 PDF（争议一手材料）](https://cims.nyu.edu/~tristanb/statement.pdf)；[成果发布帖（Mastodon）](https://mastodon.social/@tristanbuckmaster/117233413705701198)
- Buckmaster / Alpöge 团队三篇论文：[Euler](https://cims.nyu.edu/~tristanb/euler.pdf)、[IPM](https://cims.nyu.edu/~tristanb/ipm.pdf)、[Boussinesq](https://cims.nyu.edu/~tristanb/boussinesq.pdf)；[Lean 形式化仓库](https://github.com/tristanbuckmaster/fluid_lean)
- [Existence and Smoothness of the Navier–Stokes Equation — Charles L. Fefferman（Clay 官方问题陈述，含命题 A/B/C/D）](https://www.claymath.org/wp-content/uploads/2022/06/navierstokes.pdf)；千禧年问题总览：[Clay](https://www.claymath.org/millennium-problems/)、[Wikipedia](https://en.wikipedia.org/wiki/Millennium_Prize_Problems)
- [Terence Tao 的帖文](https://mathstodon.xyz/@tao/117237320796901560)；[其 AI 观点汇总](https://teorth.github.io/tao-web/ai-views.html)
- [Just a rumour of a bug is enough to find a security exploit these days — Anil Madhavapeddy](https://anil.recoil.org/notes/rumour-is-the-exploit)
- 背景：[Navier–Stokes existence and smoothness（Wikipedia）](https://en.wikipedia.org/wiki/Navier–Stokes_existence_and_smoothness)；成本换算：[llm-prices.com](https://www.llm-prices.com/#ot=300000000000&sel=gpt-6-astra)；[OpenAI 数据使用政策](https://openai.com/policies/how-your-data-is-used-to-improve-model-performance/)
- [Simon Willison 次日引用 Terence Tao 的跟进帖](https://simonwillison.net/2026/Sep/9/terence-tao/)
- 二手交叉报道：[New Scientist](https://www.newscientist.com/article/2588063-openai-has-solved-the-navier-stokes-millennium-problem-using-15m-of-ai-effort/)、[Fortune](https://fortune.com/2026/09/08/openai-says-it-cracked-navier-stokes-math-grand-challenge-buckmaster-accusation-cheating-intimidation-tao-lament/)
- 公共注意力信号（非事实来源）：Hacker News 讨论 [帖一](https://news.ycombinator.com/item?id=49613262)、[帖二](https://news.ycombinator.com/item?id=49605915)
