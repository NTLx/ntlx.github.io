---
$schema: starlight
title: 当 AI 公司的客户烧光预算，产品市场契合点反而到了
description: 最好的定价让客户倒吸一口气然后说 yes。Uber 4 个月烧完全年 AI 预算却没停 Claude Code——这不是成本失控，是产品市场契合点最诚实的信号。
date: 2026-05-28
category: ai-industry
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-28-ai-pmf-budget-overrun-signal-img-00-infographic-core-summary.png)

Simon Willison 上周写了一篇博客，标题很克制：「我认为 Anthropic 和 OpenAI 已经找到了产品市场契合点」。没有感叹号，没有「颠覆」「革命」。但他文章里的数字替他把兴奋喊出来了。

我读完之后，最让我停下来的不是那些大数字——Anthropic Q2 收入预计 **$109 亿**、SpaceX 月收 Anthropic **$12.5 亿**计算费——而是一个小数字：Willison 自己每个月付 **$200** 订阅费（$100 给 Anthropic、$100 给 OpenAI），用 ccusage 工具一算，实际 API 消费 **$2,180**。

**十倍的差距。**

这个差距才是整篇文章真正的支点。

## 从座位到流量：一个定价模型的悄悄转向

先说一个大多数人没注意到的变化。

2025 年 11 月前后，Anthropic 把企业版定价从打包折扣改成了 **$20/seat/月加 API 按量计费**。2026 年 4 月，OpenAI 跟进——Codex 从按消息计费改为按 API token 计费。两家公司几乎同步放弃了「卖座位」的模式，转向「卖消耗」。

**这不是一个技术细节。这是一个信号。**

卖座位是 SaaS 的逻辑：客户数 × 单价 = 收入。好预测，CFO 喜欢。卖消耗是基础设施的逻辑：用多少付多少，上不封顶。AWS 是这个模式的祖师爷。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-28-ai-pmf-budget-overrun-signal-img-01-pricing-shift.png)

为什么转？因为编程 agent 根本不是座位型产品。一个工程师用 Claude Code 写一天代码，消耗的 token 量可能是普通 ChatGPT 用户的 **50 倍**。按座位卖，Anthropic 和 OpenAI 在每一个重度用户身上都在亏钱。Willison 的 $200 订阅对应 $2,180 实际消耗——这不是「用户占了便宜」，是定价模型和产品形态不匹配。

GPT-5.5 的 API 价格是 GPT-5.4 的 **两倍**。Opus 4.7 是 Opus 4.6 的 **1.4 倍**。新一代模型在涨价，而且涨得心安理得——因为你已经离不开它了。

> 好定价的标准是什么？有人说过一句话：让客户倒吸一口气，然后说 yes。

## Uber 烧光预算，但没停手

四月，Uber CTO Praveen Neppalli Naga 告诉 The Information：公司 2026 年全年 AI 预算已经耗尽。**只用了四个月。**

这条新闻被不少媒体做成了「AI 成本失控」的叙事。但如果你仔细看细节，故事完全不一样。

Uber 在 2025 年 12 月向 **5,000 名工程师**开放了 Claude Code。到 2 月，使用量翻倍。到 3 月，**84% 的开发者**被归类为 agentic coding 用户。**70% 的提交代码来自 AI**，11% 的线上后端更新由 AI agent 编写。每位工程师每月的 API 成本在 **$500 到 $2,000** 之间。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-28-ai-pmf-budget-overrun-signal-img-02-uber-budget.png)

关键问题是：Uber 停了 Claude Code 吗？

**没有。** CTO 说的是「我们得重新规划预算」，不是「这东西太贵了得砍掉」。这中间的区别是根本性的。

**预算超支有两种情况。** 一种是花冤枉钱，买了不值得的东西。一种是低估了需求——你没想到这东西会这么好用，所以没留够预算。Uber 明显属于后者。2025 年做的预算，怎么预测 2025 年 11 月才真正好用的工具在 2026 年的需求量？

Willison 的判断很精准：这些「预算超支」的故事不是产品市场契合点的反面证据，**恰恰是最有力的正面证据**。当你烧光了预算但拒绝停手，说明 ROI 摆在那里，只是你的财务模型还没学会怎么装它。

Uber 2025 年研发总支出 $34 亿。5,000 个工程师按人均 $1,000/月算，一年 $6,000 万。占研发的不到 2%。贵吗？对。但如果这 5,000 人的产出效率因此提升了 30%——那这笔账太好算了。

## 收入的结构比收入的数字重要

Anthropic Q2 预计收入 **$109 亿**。Q1 是 **$48 亿**。一个季度翻倍。运营利润 **$5.59 亿**——**史上首次盈利**。

数字很炸裂。但我更在意的是收入结构的变化。

2025 年 8 月的数据：Anthropic 年收入约 $40 亿，其中 Cursor 和 GitHub Copilot 贡献了 **$12 亿**。也就是说，差不多三分之一的收入来自中间商——那些把 Claude API 包装成编程工具卖给终端用户的公司。

现在呢？Claude Code 的年化收入达到 **$25 亿**，企业用户占一半以上。Anthropic 不再需要 Cursor 做中间人。它直接面对企业，直接收 API 的钱。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-28-ai-pmf-budget-overrun-signal-img-03-revenue-growth.png)

这里有一个绕的逻辑：Anthropic 在 cannibalize 自己最大的渠道合作伙伴。Claude Code 做得越好，Cursor 和 Copilot 的护城河就越薄。但 Anthropic 的整体收入反而加速了——因为**直接卖 API 的利润率远高于批发给中间商**。

同样的事情在 OpenAI 那边也在发生。ChatGPT 有 **9 亿周活用户**，但只有 **5,000 万人付费**（5.6%）。$10-20/月的订阅，要覆盖 OpenAI 声称的 $1 万亿基础设施目标，需要维持 10-20 亿付费用户很多年。这不现实。

编程 agent 指向另一条路：不需要数十亿用户。需要数千个企业，每个企业有数千个工程师，每人每月消耗数千美元的 API 调用。**人数少三个数量级，但单客收入高三个数量级。** 云基础设施的故事，不是消费者互联网的。

## 月付 $12.5 亿的背后

SpaceX 的 S-1 文件披露了一个让人需要读两遍的数字：Anthropic 同意**每月支付 $12.5 亿**给 SpaceX，购买 Colossus 数据中心的计算能力，合同到 2029 年 5 月。**总额超过 $400 亿**。

**$12.5 亿。每个月。**

Anthropic 的计算主管 Tom Brown 确认：这些算力用于推理（inference），不是训练。也就是说，这些 GPU 是用来跑 Claude Code、跑 API 请求的——用来服务那些每月烧 $2,180 的 Willison 们和每月烧 $6,000 万的 Uber 们。

SpaceX 的 AI 部门 2025 年运营亏损 $63 亿，收入 $32 亿。但这笔 Anthropic 合同一笔就带来年收入 $150 亿——几乎等于 SpaceX 2025 全年营收（$187 亿）。一家火箭公司，最大的收入来源变成了给 AI 公司出租 GPU。

**当推理需求大到需要和火箭公司签 $400 亿合同时，AI 编程工具就不再是开发者工具箱里的一个 app，而是公司 IT 架构里的一个层。**

## 盈利是真的吗

话说回来，不是所有人都买账。

有分析者指出，Anthropic 的「盈利」数据来得太巧。2 月声称 ARR $140 亿，3 月声称 $190 亿，Q2 预测 $109 亿——在 6 月还没过完时就确定了季度收入？而且这些数字恰好在公司以 $9,000 亿估值融资的时候「泄露」。

可能的操作空间：折扣 token 预付（客户提前买入打折 token，公司一次性记收入）、年度承诺前置、甚至可能降低了训练投入来短期压低支出。这些都是 SaaS 公司常用的收入粉饰手法。

我没法判断这些指控是否成立。IPO 文件出来之前，都是猜测。

但我能判断的是：即使剔除粉饰成分，底层的结构性变化是真实的。编程 agent 从订阅模式转向消耗模式，从消费者转向企业，从 app 转向基础设施——这些不是会计手法能造出来的。Uber 的预算超支不是会计手法。Willison 的 $2,180 实际消耗不是会计手法。SpaceX 的 $12.5 亿月合同更不是。

**数字可以粉饰，趋势不行。**

## 我的看法

2025 年 11 月，GPT-5.1 和 Opus 4.5 让编程 agent 从玩具变成工具。Willison 当时就标记了这个拐点。

2026 年 4 月，GPT-5.5 和 Opus 4.7 让这件事的商业后果显现出来：编程 agent 开始吃掉企业的预算线，开始改写 AI 公司的收入结构，开始把整个行业从「消费者订阅」推向「企业基础设施」的商业模式。

**赚钱本身不新鲜。找到对的收费方式才新鲜。** Netflix 和 AWS 都在赚钱，但 AWS 的商业模式更硬——客户离开成本更高，收入更可预测，规模效应更强。编程 agent 正在把 AI 公司推向 AWS 那条路。

等 Anthropic 和 OpenAI 的 IPO 文件出来，我们就能看到经过审计的数字。但在那之前，有一个指标比任何财报都诚实：

**Uber 烧光了全年的 AI 预算，然后说——我们需要更多预算。**

*你们公司有在用 Claude Code 或 Codex 吗？月均 API 消耗大概多少？有没有遇到过「预算不够用」的情况？*

## 原文参考

> I think Anthropic and OpenAI have found product-market fit — Simon Willison
> Simon Willison's Weblog, May 27, 2026
> <https://simonwillison.net/2026/May/27/product-market-fit/>
