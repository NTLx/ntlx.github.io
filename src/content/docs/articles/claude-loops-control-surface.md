---
$schema: starlight
title: Prompt 不够了，Loop 才是 Agent 时代真正的控制面
description: 真正决定 Agent 上限的，不再是你这一轮怎么问，而是系统下一轮何时继续、何时停止、何时回头验证。
date: 2026-07-01
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-01-claude-loops-control-surface-img-00-infographic-core-summary.png)

我看 Anthropic 这篇《Getting started with loops》，最强的感觉不是“又多了几个命令”，而是另一个更底层的变化：Agent 的控制单位变了。

过去两年，大家谈 AI 编码，主语一直是 prompt。怎么写 system prompt，怎么给上下文，怎么分步骤，怎么防跑偏。这个阶段当然有价值，但它默认了一个前提：控制发生在这一轮输入里。

Anthropic 这篇文章等于把这个前提掀了。它说得很克制，定义也很朴素：loop 就是 agent 重复执行工作循环，直到某个停止条件成立。可这句朴素定义一旦成立，焦点就会从“这一轮怎么说”移到“下一轮为什么还会继续”。

如果你更关心 `/goal`、`/loop`、`/schedule` 这些原语具体把 Claude Code 变成了什么样，那是另一篇要展开的产品问题。另一篇会单讲它为什么正在离开聊天框。还有一篇会专门处理更难的问题：哪些控制权能交给 Agent，哪些绝不能交。本文先只处理一件事：为什么 loop 会开始取代 prompt，变成主控制面。

## Prompt 为什么开始退到二线

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-01-claude-loops-control-surface-img-01-turn_to_loop_shift.png)

prompt 控的其实很少。它控制的是这一次表达的方向，是模型这一轮先看什么、先做什么、先解释什么。它当然重要，但它只对当前回合负责。

真正让 Agent 从聊天工具变成工作系统的，关键不在这一轮说得多漂亮，而在这一轮结束以后，系统怎么决定三件事：

1. 要不要继续下一轮。
2. 下一轮应该朝哪个标准继续。
3. 谁来判断现在是不是该停。

这三件事，prompt 都控制不好。你可以在 prompt 里写“请继续直到完成”，但“完成”这两个字如果没有被系统外置成条件，最后还是模型自己说了算。它既当运动员，又当裁判。做得好时当然很顺，做不好时你也不知道它到底是太早停了，还是太晚停了。

我觉得这就是 prompt 退到二线的原因。不是 prompt 突然没用了，而是它开始暴露出边界：它擅长指挥一轮，不擅长治理一个回路。

## Loop 真正接管了什么

Anthropic 把 loop 分成 turn-based、goal-based、time-based、proactive 四类。表面上看，是四个使用场景。往下看，它其实对应四种控制权安排。

turn-based 最像我们熟悉的聊天模式：你发起一轮，它做一轮，然后停下来等你。这里人还握着触发权，也部分握着停止判断。系统的自动性很弱，人的在场感最强。

goal-based 往前迈了一步。`/goal` 的关键不是多跑几轮，而是把“什么叫完成”写成一个外部条件。Claude 每轮做完以后，不是靠主模型自己拍板，而是由另一个 evaluator 去判断条件是否满足。到这里，stop condition 已经从 prompt 里分离出来了。

time-based 再往前走。工作是否开始，不再由人敲下一条 prompt 决定，而是由时间间隔、排程或者 routine 决定。你从操作者，慢慢变成了规则设计者。

proactive 则更彻底。任务不是等你想起来才开始，而是由事件流、GitHub 触发器、bug report 或外部系统把它启动。loop 这时已经不像一个“会多跑几轮的 Claude”，而像一个接进组织流程里的后台工位。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-01-claude-loops-control-surface-img-02-stop_trigger_verify.png)

所以我越来越觉得，loop 接过来的并非“多执行几步”，而是四件更底层的东西：**触发、停止、验证、复盘**。

一旦这四件事被设计出来，prompt 的角色就变了。它还是重要，但更像回路里的局部指令，不再是系统的最高控制面。

## 为什么 stop condition 才是控制面

很多人第一次接触 loops，直觉会放在 trigger 上。按小时跑、按事件跑、按排程跑，听起来很新鲜。但我觉得真正关键的地方反而是 stop condition。

原因很简单：触发决定它什么时候开始，停止条件决定它什么时候收手。后者更像权力。

`/goal` 的官方文档其实把这件事说得很透。它不是说“Claude 更努力一点”，而是说每轮之后会有一个小模型根据对话里已经出现的证据判断条件是否成立。也就是说，系统开始承认“完成”不该由同一个执行者自己决定。

这一步很重要。因为一旦 stop condition 外置，团队终于可以把“做得够不够”从模型的主观感觉里拿出来，写成一个可讨论、可复用、可争辩的对象。测试通过、lint 干净、队列清空、PR comments 处理完，这些都是条件。条件写得越清楚，loop 越能收敛；条件写得含糊，系统就越会在“差不多”这种气味上打转。

这也是为什么我说控制面变了。以前大家拼 prompt，拼的是如何把人类意图压进一段文字里。现在更值钱的能力，开始变成如何把“完成定义”写成机器能反复检验的规则。

## 这不是 prompt 工程的升级版

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-01-claude-loops-control-surface-img-03-control_surface_stack.png)

如果只是把 loop 理解成“prompt engineering 2.0”，会低估它。

prompt engineering 主要还是在调单轮行为。loop engineering 处理的是另一个层级：系统的节奏、停止标准、证据结构、资源边界，以及错误如何被纠正。前者像写台词，后者像搭控制台。

两者当然连着。一个糟糕的 prompt 仍然会让回路跑偏。但回路一旦搭起来，真正决定产出的，就不只是说得对不对，而是系统有没有办法在偏掉时把自己拉回来。

这也是我读这篇文章最强的收获。Agent 的竞争，接下来不会只是谁更会问模型，而是谁更会设计一套工作回路：它什么时候起跑，沿什么证据前进，什么时候停，停下来以后留下一堆什么痕迹，好让下一轮更好。

prompt 还在。但它不再是王座了。

*如果让你把一个现有工作流改造成 loop，你最先想外置出来的是哪件事：触发、停止、验证，还是复盘？*

## 原文参考

> Delba de Oliveira and Michael Segner. Getting started with loops. Anthropic, June 30, 2026.
> https://claude.com/blog/getting-started-with-loops

> Claude Code Docs: Keep Claude working toward a goal.
> https://code.claude.com/docs/en/goal

> Claude Code Docs: Automate work with routines.
> https://code.claude.com/docs/en/routines

> Claude Code Docs: Orchestrate subagents at scale with dynamic workflows.
> https://code.claude.com/docs/en/workflows
