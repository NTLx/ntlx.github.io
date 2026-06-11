---
$schema: starlight
title: 当销售开始写代码
description: "一个从没打开过终端的销售，用 Claude Code 写了 4300 行代码，给 80% 的销售团队做了插件。技术壁垒正在溶解——不是编程变简单了，而是\"能编程的人\"的定义变了。"
date: 2026-06-11
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-11-when-sales-writes-code-img-00-infographic-core-summary.png)

Jared Sires 加入 Anthropic 之前从没打开过终端。

他是 startup 的 account executive。来 Anthropic 后管 600 到 700 个账户，每天 10 到 15 个客户电话，晚上回邮件回到九十点。日子过得很典型——一个被行政事务淹掉的销售。

然后他用 Claude Code 写了 CLAFTS。

4300 行代码。内嵌 Gmail，调 Claude API，自动草拟客户邮件回复。不是工程师写的——是 Claude Code 写的，Jared 负责告诉它要做什么。每天早上打开草稿箱，回复已经等着审阅了。省下 10 到 15 小时每周。

一年后，Jared 的 title 变成了 GTM 产品经理。他给 Anthropic 销售团队做了个 Claude Cowork 插件，20 多个技能，80% 的销售团队在用。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-11-when-sales-writes-code-img-01-from_user_to_builder.png)

## 他不是在学编程，他是在解决问题

这个故事容易被误读成"看，销售也能写代码了"。但实际上 Jared 做的不是学编程——他压根没学。

他自己说：Claude Code 这个名字里的 Code 让他一开始有点害怕。但用了一段时间之后，他意识到 Claude Code 真正的能力不是写代码——是"连到我的电脑上，回答关于文件的问题"。

这是两种完全不同的心智模型。

传统的公民开发者概念，是让非技术人员学一点编程，用 low-code 工具搭东西。核心假设是：技术壁垒还在，只是降低了。Jared 做的事情不一样——他根本没试图理解代码。他只是描述问题，Claude Code 负责把解决方案变成可运行的软件。

差别在哪？以前是"我学了一门新技能"。现在是"我有了一个能力放大器"。前者的天花板是你学到什么程度。后者的天花板是你多清楚自己要解决什么问题。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-11-when-sales-writes-code-img-02-from-tool-to-platform.png)

## 从工具到平台：一个人的系统怎么变成团队的基础设施

如果故事停在 CLAFTS，它就是一个生产力 hack——一个人用 AI 让自己效率翻倍。有意思，但不算新闻。

但 Anthropic 的处理方式让它变成了另一件事。

Jared 把 CLAFTS 发到 Slack 上。24 小时内，其他销售开始用，效果类似。他没有把代码藏起来当个人护城河——公司也没让工程团队"正规化"这套代码。相反，Anthropic 给了他一个新角色：GTM 产品经理。

这个决策本身比 CLAFTS 更有意思。它意味着 Anthropic 看到了一个新模式：不是"工程师为业务团队造工具"，而是"业务团队里最懂问题的人直接造工具，工程师在需要时辅助"。

Jared 后来做的插件证明了这一点。`/customer-context` 能在 90 秒内从 Salesforce、Intercom、Gong、Google Calendar、Gmail、Google Drive、BigQuery 七个数据源拉出一份 360° 客户视图。`/pipeline-management` 自动标记风险交易、预测指导、推进建议。这些不是工程师替销售想的——是销售自己知道自己需要什么。

几个月内，80% 的销售团队在用。剩下 20% 主要是新入职的，Jared 认为这是下一关——因为这套技能本来就是帮新人快速 ramp up 的。新员工入职第一天就能装插件，20 多个技能已经接好所有工具。以前每个新人要花几周摸索自己的工作流，现在第一天就能用。

## 护栏不是 bug

一个值得停下来的细节：Jared 在测试 CLAFTS Tones 功能时，给自己写了一系列越来越愤怒的邮件。Claude 准确模仿了语气——然后拒绝继续生成。

Jared 的反应是："这就是我知道它生效的时刻。"

他没有抱怨 AI 太保守。他把拒绝视为功能。一个在客户前线跑了多年的人，知道什么时候该按刹车——比一个写 prompt 的工程师更清楚。

这跟"销售写代码"这个叙事形成了一种有趣的对照。技术壁垒溶解了，但判断力壁垒还在。甚至更高了——因为能跑得更快的人，需要更清楚地知道什么时候不该跑。

## 技术壁垒溶解之后

Jared 说了一句很重的话：*"如果一年前你告诉我我会成为 Anthropic 的 GTM 产品经理，我会很惊讶。我从来没有技术底子参与这些对话。"*

他说的不是"我学会了编程"。他说的是"我现在能坐在产品设计对话里，和高级工程师一起讨论架构。"

这两个东西不一样。学会编程是个人能力边界扩展。坐在产品设计对话里，是角色边界的重新定义。

这里有一个反直觉的点。我们一直以为 AI 会先替代执行层——代码写得好的工程师效率翻倍。但 Jared 的故事倒过来了：AI 先改变的不是"谁能写更好的代码"，而是"谁能写代码"。

Anthropic 每 24 到 48 小时发布一次产品变更。产品文档随之更新，Claude 通过 web search 自动抓取最新文档。Jared 不需要把所有这些记在脑子里——Claude 替他记。他的价值从"知道答案"变成了"知道该问什么问题"。

这不只是销售的故事。这是任何"懂业务但不会写代码"的人的故事。

***

*你在团队里见过不会写代码的同事用 AI 工具做出过让你意外的东西吗？或者你自己就是？*

## 原文参考

> Anthropic, "How one Anthropic seller rebuilt his team's workflows with Claude Code"
> <https://claude.com/blog/how-anthropic-uses-claude-gtm-engineering>
