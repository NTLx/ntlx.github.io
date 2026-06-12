---
$schema: starlight
title: 扔掉文件柜
description: 93%的权限提示人类都会点同意。你越试图控制AI，你越成为系统里最弱的环节。
date: 2026-06-12
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-12-claude-code-one-year-reflection-img-00-infographic-core-summary.png)

Anthropic 内部第一次演示 Claude Code，Slack 上只有两个人给了 reaction。

一年后这东西撑起了公司 20% 的收入，GitHub 上 4% 的公开 commit 是它写的。Boris Cherny 回顾这一年，打动我的不是这些数字。是他对过去经验的态度：扔。不是迭代，不是渐进式适应，是扔。

## 93%

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-12-claude-code-one-year-reflection-img-01-control-paradox.png)

Claude Code 有个权限机制，每跑一步操作都问你"可以吗？"。内部数据：93% 的提示用户都会点同意。

93%。你盯着一个几乎每次都同意的决策，注意力自然会涣散，这不是 bug，是生理限制。所以 Boris 搞了 auto mode，用另一个模型当安全分类器，替你决定哪些放行哪些拦住。反而比人盯着看更安全。

越控制反而越危险。这个逻辑不只发生在权限上。

这两年 context engineering 很火，精心构造系统提示、RAG 管道、记忆模块，82% 的 IT 领导者说 prompt engineering 不够用。Boris 的做法相反：每隔几个月把 CLAUDE.md 删掉，看 Claude 在哪里犯错，再一条一条加回来。Cat Wu 管这叫 *context minimalism*。给太多上下文就像在微操，有时候模型知道更好的路。

## 改系统，不是改代码

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-12-claude-code-one-year-reflection-img-02-system-not-code.png)

Boris 说每次 Claude 犯错，他不会叫它改，他让它把教训写进 CLAUDE.md，或者做成 skill。改的不是代码，是系统。

我自己做公众号管线也走这条路。流水线出了问题，我不改那篇文章，改门控脚本、改 CLAUDE.md 里的规则、改 skill 的配置。你在训练一个会写代码的系统，不是在写代码本身。这两件事的回报结构完全不同。

Claude Code 的代码库每几个月一行不剩地重写。但 CLAUDE.md 在，skill 在，那些从错误里长出来的规则在。消耗的是代码，积累的是系统。

## 扔掉文件柜

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-12-claude-code-one-year-reflection-img-03-throw-cabinet.png)

Boris 在 Sequoia 演讲里打了个比方。九十年代哈佛商业评论问，电脑都来了生产力怎么没涨？答案是你得把文件柜扔了。不能在纸堆旁边摆台电脑就算转型，得把纸全扔了让电脑在中间。

Anthropic 内部新人入职，没人问同事，问 Claude。设计师 Megan 直接提 PR 修按钮，PM 写代码，财务在 Claude Code 里做 projections。不是大家学了编程，是 Claude 在写代码，人只需要有想法。

角色边界消失不是预言，是他们办公室正在发生的事。

## 然后呢

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-12-claude-code-one-year-reflection-img-04-what-next.png)

Boris 现在的工作方式：手机远程操控桌面 agent，喝咖啡时看 agent 状态，跟朋友聊天想到什么就语音启动一个新 agent。一年半两次跃迁：先是不写代码、对 agent 说话。然后不对 agent 说话、对 loop 说话。

下一次是什么，他说不知道。

paddo.dev 写了篇社区反思，一句话很准：用了一年 AI 辅助开发，我变得更不信了，不是更信了。*the how got cheaper, the what got more valuable.* 怎么做越来越便宜，做什么越来越贵。执行成本趋近于零的时候，唯一有成本的是判断。决定做什么、不做什么。品味、好奇心、对用户的理解，这些东西没法自动化。

视频最后 Boris 说 Claude Code 的代码库半年前的一行都不剩了。但做决定的人还在。

*你的工作流里，有什么是你一直在"点同意"但其实可以不看的？*

## 原文参考

> Reflecting on a year of Claude Code
> Boris Cherny & Cat Wu / Claude (Anthropic)
> <https://www.youtube.com/watch?v=Hth_tLaC2j8>
