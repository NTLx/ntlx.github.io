---
$schema: starlight
title: 当 vibe coding 和 agentic engineering 开始模糊，我感到一阵不安
date: 2026-05-07
description: Simon Willison 发现他不再审查 AI 写的每一行代码了。这让我想起信任一个没有声誉、没有问责的同事，那种感觉叫道德负债。
coverImage: cover.png
---

# 当 vibe coding 和 agentic engineering 开始模糊，我感到一阵不安

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-07-vibe-coding-agentic-img-00.jpg)

昨天读到 Simon Willison 的新博文，标题就让我心里咯噔一下：**「Vibe coding and agentic engineering are getting closer than I'd like」**。这老哥用"upsetting"这个词描述自己的发现，我完全理解。

2025 年 2 月，Andrej Karpathy 创造了 vibe coding 这个词。Collins 词典把它评为 2025 年度词汇。而 Simon Willison 是那个最早站出来划线的人，他写过一篇很有名的文章叫 **Not all AI-assisted programming is vibe coding**，核心观点非常清楚：vibe coding 是不看代码、不管质量、能跑就行，适合个人小工具；agentic engineering 是专业工程师用 AI 加速，但你依然承担全部责任，适合生产级系统。两者泾渭分明。

但现在 Simon 说，这条线在他自己的工作中已经开始模糊了。一个写了 25 年代码、Django 联合创始人级别的工程师，发现自己不再审查 Claude Code 写的每一行代码，就开始往生产环境推了。然后他感到 guilt，感到不安。

Simon 的不安背后藏着一个更大的问题，比我最初以为的要深得多。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-07-vibe-coding-agentic-img-01.jpg)

## Agent 太靠谱了，这就是问题本身

Simon 举了个很具体的例子：让 Claude Code 写一个 JSON API 端点，连 SQL 查询带输出，它一次性就做对了。加上自动化测试、加上文档，全都对。于是你就不审了。

不是懒，是你心里清楚：审了也是对的。审了等于浪费时间。

所以问题不是 agent 不可靠。恰恰相反：agent 太可靠了，可靠到你开始觉得审代码是多余的步骤。而一旦你接受了"不用审"，你就从 agentic engineering 滑向了 vibe coding。不是一路狂奔滑进去的，是一小步一小步蹭进去的。

这让我想起航空安全里一个概念叫 **normalization of deviance**（偏差常态化）。每次你没按流程检查、但飞机还是安全降落了，你的脑回路就会把"不检查"和"没出事"之间画上等号。下一次你就更容易跳过检查。等到真出事那天，不是某一次跳过的锅，是所有成功逃过的检查一起把你推到了那个位置。

Simon 自己提到了这个概念，说明他也很清楚。但知道和做到之间，差着一整个日常工作的惯性。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-07-vibe-coding-agentic-img-02.jpg)

## 把 agent 当人类团队来信任？漏了一个关键点

Simon 为了缓解这种不适，用了一个类比：在大公司做工程经理的时候，其他团队交给你一个 image resize 服务，你不会去看他们每一行代码。你看文档、跑一下、能用就行。出问题了再去翻他们的 git repo。你把 agent 也当成这样一个半黑盒来信任。

这个类比很有说服力，但漏了一个东西：人类团队有声誉机制。

一个写了好几年可靠代码的团队，你会信任他们，因为你知道搞砸了会伤害他们的职业声誉。他们的名字挂在 commit 上。如果真出了大问题，有 postmortem、有人要解释、有制度性的问责。

Claude Code 没有这个。它不会因为写了一段烂代码而感到羞耻。它没有职业声誉要维护。你对它的信任完全建立在统计学上：过去 N 次都对，所以这次应该也对。这种信任没有制度性的硬度，像沙子堆的堤坝，水一来就看命。

这才是 Simon 感到 guilt 的真正源头。不是因为你不审代码，是你发现自己正在把生产系统的质量押注在一个没有问责机制的实体上。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-07-vibe-coding-agentic-img-03.jpg)

## 不只是写代码快了，是整个流程被击穿了

Simon 引用了 Anthropic 设计负责人 Jenny Wen 的一个观察，值得展开说。Jenny 说，现有的设计流程之所以这么重、这么谨慎，是因为如果设计搞错了，工程师花三个月做出来才发现，代价太大了。但如果工程侧的速度从三个月变成三天，设计流程就可以冒险得多。

这意味着不只是下游（test、review、deploy）要重构，上游（需求、设计、产品决策）也要重构。整个软件工程的生命周期是围绕"人写代码很慢"这个前提设计的。当这个前提被抽走，上下游一起裂开。

以前写一个功能要一周，code review 是合理的质量关卡。现在生成一个功能要十分钟，code review 变成了瓶颈，但你又不能因此取消 review，因为 review 是最后的防线。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-07-vibe-coding-agentic-img-04.jpg)

## 用过两周再说

Simon 文章第二部分提了一个更实际的问题：现在到底怎么判断一个项目的质量？

以前看到一个 GitHub 仓库有一百个 commit、漂亮的 README、全覆盖的测试，你基本可以确定作者花了很多心思。现在，Simon 说他可以半小时内用 AI 锤出一个看起来一模一样的仓库。他本人看着都有点恍惚："Maybe it is as good as them. I don't know."

所以他现在的判断标准很朴素：用过再说。

如果你 vibe code 了一个东西，但你每天都用它、用了两周，这比一个看起来完美但你刚吐出来的东西有价值得多。真正质量的信号，不是代码长得好看，是有人真地依赖它跑了一周两周。

这个标准看起来粗糙，但它回到了信任的本质：信任不是看出来的，是跑出来的。

## 终点在哪里

Matthew Yglesias 是个政治评论员，他前几天发推说："折腾了五个月，我发现我不想 vibe code。我想要专业软件公司用 AI 辅助来做更好/更多/更便宜的软件产品，卖给我换钱。" Simon 引用了这句话，表示认同。

我自己现在就是这个感觉。这些工具是好用的，但好用和能担责是两码事。我可以 vibe code 一个自己的看板工具，坏了只影响我自己。但如果我用它给别人做东西，审代码就是必须的，不管审起来有多无聊，不管 agent 有多靠谱。

而且话说回来，像我这样非科班出身的人，能靠 AI Coding 做产品和知识管理，本身就是这些工具最大的价值。但它们放大了你的能力，不放你的责任。

## 你也这样吗？

你平时用 AI 编程工具的时候，会审 agent 写的每一行代码吗？如果有一类任务 agent 从来没错过，你还会继续审吗？来评论区聊聊。

## 原文参考

> Simon Willison. **Vibe coding and agentic engineering are getting closer than I'd like**. simonwillison.net.
> <https://simonwillison.net/2026/May/6/vibe-coding-and-agentic-engineering/>
