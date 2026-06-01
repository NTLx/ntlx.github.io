---
$schema: starlight
title: 取消 AI 订阅，不是倒退
description: AI 最危险的地方不是把代码写错，而是把开始新项目的成本降到零，却把维护和承诺的账留给你。
date: 2026-06-01
category: ai-industry
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-01-cancel-ai-subscription-img-00-infographic-core-summary.png)

读完 David 那篇《the solution might be cancelling my AI subscription》，我第一反应不是赞同，也不是反驳，而是有点不舒服。

因为他说的不是“AI 写烂代码”。这太容易批评了。他说的是另一件更难承认的事：AI 让人把一个念头误认成一个项目，把一次冲动误认成一次创造，把“能做出来”误认成“值得做”。

这比 bug 难修。

## 真正变便宜的，是启动

David 列了一串自己用 AI 做出来的东西：Rust 语音识别、邮件归档工具、Jellyfin 桌面克隆、Invidious 克隆、Windows 95 记事本复刻、车流统计、新闻站、3D 游戏、投资回测、摄像头逆向客户端，还有一个较大的 Rust SaaS。

如果只看清单，这像生产力展示。换成公司周报，甚至可以写得很好看。

但他后面补了一刀：除了 SaaS，几乎没有哪个有用，也没有哪个想维护。很多会话只是从“写个快速脚本”开始，一小时后长成一个半产品。原来的痒点没解决，桌上却多了一坨需要命名、整理、部署、解释和负责的东西。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-01-cancel-ai-subscription-img-01-startup-cost.png)

这就是 AI 工具最容易被误读的地方。它降低的主要不是完成成本，而是启动成本。

启动成本一低，人会误以为总成本也低。可软件的账本从来不是这么记的。真正贵的是后面：测试、文档、迁移、监控、安全、用户、兼容性、下个月你还记不记得它为什么存在。

AI 把第一步变成糖，把后面的步骤留成债。

## 注意力不是时间，是承诺预算

我以前也把注意力理解成时间管理问题：少刷一点，多排一点，开番茄钟，把通知关掉。读这篇之后，我觉得还差一层。

注意力不是一块可以切片的时间。注意力更像承诺预算。你愿意把多少未来的自己押在这件事上？

一个项目开始时最会骗人。目录刚建好，README 刚写下第一行，界面刚跑起来，所有东西都闪闪发亮。AI 又把这个瞬间提前、放大、重复供应。于是人很容易在同一天拥有三个“快成了”的项目。每一个都给你一点奖励，每一个都还没有向你收账。

Simon Willison 转引这篇文章时说，coding agents 可以在不到一小时里把模糊想法变成一个看起来像打磨了几周的项目。问题也在这里：外观成熟得越快，承诺成熟得越慢。你看见的是成品的形状，心里还只是试试看。

这会制造一种很新的浪费。不是刷短视频那种空白浪费，而是带着 git commit、测试文件、部署脚本的浪费。它甚至显得很勤奋。

## 伪生产力现在有了编译器

Cal Newport 讲伪生产力，本来针对邮件、会议和聊天：人用可见忙碌代替真实价值。Microsoft 的 Work Trend Index 也说，很多人的工作日被 digital debt 填满，平均员工 57% 的时间花在沟通上，68% 的人缺少不被打断的专注时间。

AI 进来之后，这套机制没有消失，只是升级了。

以前的伪生产力是发更多消息、开更多会、写更多文档。现在它还能生成更多代码、更多方案、更多原型、更多“差一点就能发布”的东西。ActivTrak 2026 报告里有个刺眼的数据：AI 使用者的邮件、聊天、业务管理工具时间都涨了，平均专注会话时长下降了 9%。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-01-cancel-ai-subscription-img-02-pseudo-productivity.png)

这和 Microsoft Research 那个随机实验并不矛盾。实验显示 AI 可以让人少花一些时间处理邮件、稍微更快完成文档。这说明局部任务确实会变快。但局部变快不等于系统变清醒。会议为什么存在，项目为什么开，谁来维护，产出是否该被制造出来，这些问题不随模型变强自动消失。

很多时候，AI 不是减少工作，而是降低制造工作痕迹的成本。

## 摩擦不是敌人

David 讲到一个小实验：他做过语音笔记到博客的流水线，按一下 Telegram 语音按钮，后面自动生成文章。结果是垃圾。他后来的判断很狠：努力被移除之后，承诺、聚焦和成品质量也一起被移除了。

这句话让我想了很久。我们太习惯把摩擦当敌人。输入越少越好，等待越短越好，产物越快越好。可有些摩擦不是障碍，是筛子。

手写为什么还没有死？不是因为纸笔比键盘先进，而是因为它慢。慢会逼你丢掉噪声。写不下那么多废话，念头就得先在脑子里过一遍。AI 恰好相反，它让废话也能长出骨架，让冲动也能带上工程目录。

别误会，我不是想把 AI 工具扔掉。它们在某些任务上确实强得离谱。让模型写一个冷门语法的 parser，再补测试，我也会觉得这东西不可思议。

但工具越强，越需要外部约束。靠意志力管不住一个随时给奖励的机器。订阅、额度、命令行入口、自动补全、常驻 agent，这些都不是中性的界面，它们在设计一种默认行为：继续问，继续生成，继续开工。

## 取消订阅是一种设计

所以“取消 AI 订阅”最有意思的地方，不是省钱，也不是表态。它是在给自己重新加摩擦。

不是永远不用。是把“随手开一个项目”的入口关小一点。让每一次使用都先经过一个问题：这件事值得把未来的我绑上去吗？

如果答案只是“做得出来”，那还不够。

真正的生产力不是产物增多，而是债务减少。不是今天多开了几个 repo，而是下个月还有一个你愿意维护、愿意解释、愿意为它承担后果的东西。

AI 让开始变得太便宜。我们要重新学会让开始变贵。

*你最近一次用 AI 做出来、但其实不想维护的东西是什么？它当时解决的是问题，还是只是奖励了你的冲动？*

## 原文参考

> David Wilson, the solution might be cancelling my AI subscription
> <https://thoughts.hmmz.org/2026-05-31.html>

> Simon Willison 对原文的转引与评论
> <https://simonwillison.net/2026/May/31/the-solution-might-be-cancelling-my-ai-subscription/>

> Microsoft Work Trend Index: Will AI Fix Work?
> <https://www.microsoft.com/en-us/worklab/work-trend-index/will-ai-fix-work>

> Microsoft Research: Shifting Work Patterns with Generative AI
> <https://www.microsoft.com/en-us/research/publication/shifting-work-patterns-with-generative-ai/>

> ActivTrak 2026 State of the Workplace
> <https://www.activtrak.com/resources/reports/state-of-the-workplace/20-22/introduction/>

> Cal Newport, A World Without Email
> <https://books.google.com/books/about/A_World_Without_Email.html?id=_OeNEAAAQBAJ>

> Cal Newport, Why Is AI Making My Job Worse?
> <https://www.youtube.com/watch?v=NDyuJcR2GH4>
