---
$schema: starlight
title: AI 让软件更容易生成，却没有让需求变清楚
description: Thariq Shihipar 的访谈让我重新看了一遍 coding agent 的价值：它降低了做出原型的成本，却不替人发现什么值得留下。
date: 2026-11-26
category: ai-coding
primarySourceUrls: ["https://lspace.beehiiv.com/podcast/s/latent_space_the_ai_engineer_podcast/the_revolution_vs_the_renaissance_thariq_shihipar_openai"]
---

一场关于 AI 编程的讨论，常被放在几个刻度上衡量：能做多大的项目、节省多少时间、一次生成多少代码。Thariq Shihipar 在 Latent Space 的访谈把问题引到结果的另一侧：软件做出来后，人还愿不愿意用？

他把 AI 软件开发比作两股同时发生的力量。一边是工业化：用更稳定的方式交付更多软件；另一边像一场文艺复兴：让更多人有余力把一件作品打磨得更贴身。听起来像生产率和审美的分工，但访谈里最有意思的部分，是这两件事如何在一个小小的游戏项目里碰到一起。

![AI 生成的软件候选要经过体验与调整，才能逐步显露真实偏好](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-26-revolution-vs-renaissance-feedback-loop-img-00-infographic-core-summary.png)

![Latent Space 原始节目封面“Factory or Renaissance?”（图片来源：Latent Space）](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-26-revolution-vs-renaissance-feedback-loop-img-source-podcast-cover.jpg)

## 功能做出来了，作者却离游戏更远

Shihipar 讲到自己在做一款格斗游戏。他让模型实现一个“投掷岩石”的动作，模型需要替角色决定岩石的大小、速度、蓄力方式、与其他技能的交互。功能逐渐成形，他却发现自己试玩时并不清楚角色在某种情境下究竟会做什么。模型替他补上了细节，也把他从决定这些细节的过程中带开了。

代码能运行，功能也可能符合提示词的字面要求，但作者试玩时仍可能不知道角色在具体情境下怎么行动。他知道角色会扔石头，却没参与决定这个动作应该是什么感觉。

他接着调整了人与模型的分工，把游戏拆成两层：底层引擎和基本能力交给模型搭，影响玩法的参数则放进一个叫 `/human` 的文件夹。那里是实际执行的代码，不是旁边的说明文档；代码要求有充分注释、变量名表达含义，也限制行长，让人能读、能改、改完能直接试玩。

这层结构把几个动作接在一起：想改什么、改了什么、玩起来感觉如何。模型仍然可以承担大量工程工作，作者也能在实现过程中调整那些决定体验的选择。AI Engineer CODE 的[演讲阅读版](https://ai.engineer/code/2026/talks/thariq-shihipar)也把这一点说得更清楚：模型能力变强，不代表人只能接受模型最方便的工作方式。

![模型搭建底层能力，人通过可读的 /human 层调整玩法并反复试玩](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-26-revolution-vs-renaissance-feedback-loop-img-02-framework-human-layer.png)

## 原型也能帮人发现自己想要什么

访谈里另一个例子更日常。Shihipar 做过一款能按状态切换的 Mac Dock，最初想法是为写作、编码、浏览等活动分别安排空间。原型做出来后，他发现真正让自己在意的可能不是切换工作区，而是“我现在是不是在刷社交媒体”。他想少一点无意分心，同时保留主动休息的自由。

这段让我想到，需求不总能在动手前被完整说清。有时我们知道问题的大方向，却不知道哪种细节会让工具适合自己。访谈、脑暴和需求文档能整理已有想法；遇到难以判断的细节，我更愿意先做个能用的初版，亲手试用后再决定如何调整。

原型也可能只是一轮试验。做出 Dock 后，他没有继续使用原先的设计，而是重新思考自己需要什么。原型澄清了第一版假设；它能否成为合适的工具，还要看后续使用、观察和修改。低成本试验让人更容易发现不喜欢什么，却不会自动给出最终答案。

我之前写过一篇[关于 coding agent 如何把问题定义与验收判断推到前台的文章](https://ntlx.github.io/articles/claude-code-expertise)。这次访谈补上了更靠前的一层：不只是把目标说清楚、知道结果是否合格，有些目标本身也要靠使用来辨认。做软件的过程因此不单是把已知需求翻译成代码，也包括把模糊偏好变成可观察的经验。

## 自动化可以找问题，却不能替人决定什么值得留下

同一场访谈谈到一个名为 Frontier Lab 的卡牌游戏。模型模拟了数千局之后，结果几乎总是经济胜利占优。Shihipar 让 Claude 调整平衡，但他觉得模型修得不好。这个例子里，模拟的作用很清楚：大量重复推演能暴露胜利策略过于单一；它却不直接提供设计者想要的游戏体验。

“平衡”也不是把所有选项修到胜率一样。太容易预测，游戏可能无聊；保留一些波动，才有探索空间。代码和模拟能帮人看见规则造成了什么，设计者仍要判断哪些差异有意思、哪些只是在惩罚玩家。判断标准不是藏在模拟次数里，而是来自人想创造怎样的体验。

我理解的 “human in the loop” 不是逐步审批。重复、可验证的部分，应该尽量交给自动化：跑测试、找不平衡的组合、检查实现是否遵守边界。人的精力更该放在产品目标、体验取舍，以及自动化结果是否贴近真实使用上。若人只在最后盖章，反馈回路仍然很长；若每个机械步骤都要人盯着，自动化也失去了意义。

## 把反馈回路设计进工具

AI 把做出候选方案的成本压低后，真正费力的部分是让使用者在结果仍可塑时及时体验，再把感受转成下一轮修改。可读、可控的 `/human` 层是一种做法；能被丢掉、重做的个人原型是另一种。两者都让人参与设计过程，而不是只在末尾验收。

这种方式有适用边界。面向多人、长期维护或高风险场景的软件，不能只凭制作者试玩的感受来决定质量；正确性、安全性和真实用户反馈仍要单独验证。个人小工具也未必需要复杂的创作界面。无论模型负责多少实现，判断“做对了”的标准都应包括真实使用，而不能只看生成完成或测试通过。

下次让 agent 做一个新工具，可以先确定最快能体验关键情境的版本是什么。如果这个版本还要等很久，就把工作拆短，或让影响体验的决定能直接调整。自动化把底座搭稳，使用者通过体验发现哪些东西值得继续做。生成变便宜了，找到值得留下的部分仍要花心思。

## 参考资料

- [The Revolution vs The Renaissance — Thariq Shihipar，Latent Space 访谈与逐字稿](https://lspace.beehiiv.com/podcast/s/latent_space_the_ai_engineer_podcast/the_revolution_vs_the_renaissance_thariq_shihipar_openai)
- [Keep the human inside the creative loop — AI Engineer CODE keynote 阅读版与录播](https://ai.engineer/code/2026/talks/thariq-shihipar)
