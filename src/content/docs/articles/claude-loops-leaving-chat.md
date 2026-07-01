---
$schema: starlight
title: Claude Code 为什么开始离开聊天框
description: 一旦 Agent 有了 /goal、/loop、/schedule，它就不再只是一个会对话的工具，而开始变成可调度的流程节点。
date: 2026-07-01
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-01-claude-loops-leaving-chat-img-00-infographic-core-summary.png)

我看 Anthropic 这篇 loops 文章时，脑子里冒出来的不是“这几个命令我也会用”。我想到的是另一件事：Claude Code 正在离开聊天框。

以前我们理解 Claude Code，默认画面是一个人坐在终端前，一轮一轮提需求，一轮一轮收回答。你问，它答；你追问，它再改。即使它能跑工具、改文件、开 PR，核心交互模型也还是聊天。

但 `/goal`、`/loop`、`/schedule` 这些东西一出现，那个默认画面就开始不成立了。你不再需要每轮都坐在前面敲下一句。工作开始可以由条件、时间、事件决定，而不是由你的键盘决定。

如果你更想知道，为什么这种变化意味着 prompt 不再是 Agent 的最高控制面，那是另一篇方法论文章要处理的问题。还有一篇会更锋利：哪些权力能下放给 Agent，哪些绝不能下放。本文只抓产品层的一件事：loop primitives 为什么会把 Claude Code 从对话工具推向流程节点。

## 聊天框为什么不够用了

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-01-claude-loops-leaving-chat-img-01-goal_loop_schedule_map.png)

聊天框有一个天然假设：下一轮什么时候开始，由人决定。

这个假设在简单任务里没问题。你让 Claude 改个按钮、读段代码、起个标题，做完就停。可一旦任务带上“继续直到完成”“每小时检查一次”“明早自动跑一遍”“收到 PR review 后自己继续改”，聊天框就开始显得别扭。因为真正重要的问题已经不是这一轮怎么答，而是**下一轮谁来启动**。

Anthropic 这篇文章其实就是围着这个点展开的。turn-based loop 还是旧世界：你发起，每轮都由人决定是否继续。goal-based 开始松手：人只定义完成条件，Claude 在多轮之间继续工作。time-based 更进一步：轮次由时间驱动。到了 proactive，甚至连“发现要做的活”都不一定需要人实时盯着。

产品一旦沿这个方向走，Claude Code 的身份就会变。它不再只是一个交互界面里的助手，而开始像一段能被调度、能被唤醒、能被停止的进程。

## /goal 把停止条件外置了

很多人第一次看到 `/goal`，容易把它理解成“自动继续”。可我觉得它真正改写的不是自动继续，而是**停止条件**。

`/goal` 官方文档说得很直接：每轮结束后，会有一个小模型检查条件是否成立，如果不成立，就再开下一轮。这件事的分量在于，Claude 不再自己决定“我差不多做完了”。完成被改写成一个外部判断。

这听起来像小事，其实是交互模型的大变化。聊天式工具里，用户往往承担的是“看着回答，觉得差不多了，再让它继续”这类隐形工作。`/goal` 把这层隐形工作显式化了。你必须提前说清楚，什么叫 done，怎么证明 done。

这会逼着产品从“会不会回答”转向“能不能稳定收敛”。只要完成条件能被 transcript 里的证据证明，Claude 就能在多轮之间自己跑。这样一来，它的价值就不只在对话体验，也在它能否在没有你盯着的情况下持续工作。

## /loop 和 /schedule 改写了触发方式

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-01-claude-loops-leaving-chat-img-02-trigger_evolution.png)

`/goal` 改的是停止条件，`/loop` 和 `/schedule` 改的是触发方式。

`/loop` 让当前会话里的 prompt 按时间间隔重跑。你可以理解成“把一个 prompt 接到时钟上”。它仍然跟当前机器、当前会话绑在一起，但已经不需要你每次亲手触发。

`/schedule` 再往前走一步。官方 routines 文档说得很明确：routine 是一段保存好的 Claude Code 配置，跑在 Anthropic 托管的云环境里，可以被 schedule、API、GitHub 事件触发。也就是说，Claude Code 已经不需要依赖你本地终端的持续在场。

一旦 trigger 能来自 API、PR webhook、定时任务，Claude Code 的产品边界就变了。它开始和 CI、issue tracker、review 流、告警系统并排出现。人不再是唯一的启动器，聊天框也不再是唯一入口。

我觉得这才是“离开聊天框”的真正含义。重点不在界面变不变，而在交互权正从前台用户转移到后台系统。

## Claude Code 正在变成流程节点

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-01-claude-loops-leaving-chat-img-03-chat_to_routine_system.png)

如果把这些原语放在一起看，Claude Code 像是在从“工具”往“节点”迁移。

工具的典型特征是：有人在前台操作，它在前台反馈。节点的典型特征是：它被别的系统调度，按规则启动，留下结构化结果，再交给下一个环节。

`/goal` 让 Claude 有了外置完成条件，`/loop` 让它能按时间重复执行，`/schedule` 和 routines 让它能在云环境里由事件和 API 唤起。再加上 workflows 把 orchestrator 进一步抽进脚本里，Claude Code 就越来越像软件生产线上的一个自治工位。

这也是为什么我不把 loops 看成“又多了几个 power-user 功能”。它们真正改的，是 Claude Code 与世界交互的方式。以前它主要通过对话框和人互动。现在它开始通过条件、触发器、脚本和事件流跟系统互动。

一旦走到这里，问题就不再只是“它能不能写一段代码”，而是“它能不能以可调度、可审计、可持续运行的方式成为工作流的一部分”。这已经不是聊天产品的题目了。

*如果你现在就要把 Claude Code 接进一个现有流程，你最愿意先交给它的是哪种触发：手动 `/goal`、本地 `/loop`，还是云端 `/schedule`？*

## 原文参考

> Delba de Oliveira and Michael Segner. Getting started with loops. Anthropic, June 30, 2026.
> https://claude.com/blog/getting-started-with-loops

> Claude Code Docs: Keep Claude working toward a goal.
> https://code.claude.com/docs/en/goal

> Claude Code Docs: Automate work with routines.
> https://code.claude.com/docs/en/routines

> Claude Code Docs: Orchestrate subagents at scale with dynamic workflows.
> https://code.claude.com/docs/en/workflows
