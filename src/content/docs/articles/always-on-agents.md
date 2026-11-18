---
$schema: starlight
title: Agent 暂停以后，任务得有人接着管
description: Anthropic 的常驻 Agent 架构让我更在意任务暂停后的接续：事件能够重试，未必意味着外部动作可以重做；记忆、授权和消息交付，需要分别留下可核对的状态。
date: 2026-11-18
category: ai-agents
primarySourceUrls: ["https://claude.com/resources/articles/building-always-on-agents"]
---

读完 William Hu 的 [Building always-on agents](https://claude.com/resources/articles/building-always-on-agents)，我最想追问的是：Agent 停下来的时候，那件交给它的事怎么办？

它可能在等回复，可能遇到权限限制，也可能刚把消息发出去就断了连接。这些时候，让模型继续想一会儿未必有用。需要接着管的，是任务进度、尚未确认的动作，以及用户之前说过的边界。

原文的解释很具体：所谓 always-on，描述的是用户体验。Agent 大部分时间在休眠，收到事件才醒来，完成一轮工作、保存状态，再等待下一次唤醒。读到这里，我对“主动助手”的期待反而收窄了：先把交接做可靠，再谈它能主动承担多少事。

![本文核心：动作结果、任务进度与等待原因](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-17-always-on-agents-img-00-infographic-core-summary.png)

## 每次醒来，都要知道接的是哪件事

原文把外围架构拆成收件箱、定时器、记忆、权限、发件箱。把它们放进一个跟进任务里，比背术语更容易理解。

假设用户让助手跟进一份待确认的报告。新回复先进收件箱，后台 worker 取出事件，启动或恢复对应会话。暂时没有回复，助手可以设置跟进时间；调度器等到时间到了，再往收件箱投递事件。助手醒来后读取任务进度，在权限范围内处理，必要时告诉用户结果。

这套设计让我注意到，主动性也需要留下记录。“以后再看看”如果只出现在聊天里，下一次运行未必知道该看什么。定时器把未来的跟进变成可查的待办，进度记录说明为什么还要跟进，收件箱则让它走回正常处理路径。

原文关于收件箱的图，画出了接收事件、写入数据库、唤醒 worker、读取待处理项和标记完成的顺序。正文还建议，同一收件箱只保留一个活跃 worker，避免相互覆盖；连续到达的消息可以合并处理，免得用户补充一句，助手就另起一轮回答。

![Anthropic 原图：事件入库、worker 处理与完成标记](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-17-always-on-agents-img-01-source-inbox.png)

这些安排看起来很普通，却直接影响助手是否让人省心。用户感受到的“它一直记着”，背后可以是许多短暂运行对同一份进度的接续。

## 能重试事件，还不等于能重做动作

worker 崩溃后的恢复，还需要继续往下想。

收件箱保留事件，新的 worker 就能重新取出它。这解决了任务入口的问题。但如果助手已经向外部系统发了消息，却还没来得及把事件标为完成就崩溃呢？重新处理事件时，是否应该再发？

![假设故障窗口：发送成功而本地记录未写回，恢复后先核查结果](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-17-always-on-agents-img-02-flowchart-action-recovery.png)

这是一个假设故障窗口，原文没有替所有工具给出答案。它也提醒我，要区分“收到这件事”和“这件事产生了什么结果”。事件 ID 可以帮助去重，外部操作的结果仍需另行核对。否则，输入没有重复，动作也可能重复。

我在[日报自动化的读后感](https://ntlx.github.io/articles/building-effective-agent-automations)里讨论过一个相邻问题：发送结果不明确时，保留待核对状态，比直接推进书签更稳妥。放到这里，可以把同样的思路用于任务恢复：留下外部系统返回的凭据，恢复时先查结果，再决定是否重做。

这也不是要求每个小助手都搭一套复杂队列。原文明确说，多数场景用直接发送工具就够了；只有需要控制消息节奏或从错误中恢复，才需要正式的发件箱。我赞成这种克制。架构该增加到什么程度，应由要恢复的故障来决定。

对重要动作，我会多问一句：**如果动作成功了，而本地记录没写上，下一轮靠什么查清楚？** 这个问题比“支持自动重试吗”更接近实际使用。

## 记忆里要留交接线索，也要留查证入口

原文的记忆示意图值得细看。用户指令、索引、已经告诉用户的内容在每轮开始时读取；详细用户笔记和任务进度按需加载。详细笔记可以留到需要时再读。

![Anthropic 原图：每轮加载指令与索引，详细笔记和任务进度按需读取](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-17-always-on-agents-img-03-source-memory.png)

我更认同其中另一条建议：外部系统里已经存在的信息，保存指针即可。比如工单当前是什么状态，最好回工单系统确认；记忆可以保存工单链接、跟进理由、用户要求，以及上次处理停在哪里。

这样分工有个实际好处：恢复任务时，可以区分哪些是当时的判断，哪些需要重新查询。若记忆里只有一句“事情处理好了”，后续运行就很难知道它依据什么，也很难察觉外部状态已经变化。

原文链接的 [agent memory 文章](https://www.anthropic.com/research/components-of-agent-memory)还讨论了回看历史会话、整理和纠正记忆。对我来说，这进一步说明记忆需要维护。写进文件的内容仍可能过时或有误，留下原始记录与外部来源的入口，才能在有疑问时回头检查。

交接也不能只靠上下文压缩。原文指出，压缩旧消息或开启新会话都会损失细节，必须持续保存的信息应及时写入记忆。因此，任务进度最好写得足以让下一轮行动：目前确认了什么，什么还没确认，接下来该查哪里。

## 等待批准和保持安静，也要有明确结果

无人值守并不意味着任务不会遇到需要人的决定。原文把延后工具调用放进了正常流程：本轮结束，会话保存，向用户展示请求；用户的答复成为新事件，再恢复工作。等待期间，worker 仍可处理其它事件。

![Anthropic 原图：保持安静、发送消息和请求用户输入](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-17-always-on-agents-img-04-source-outbox.png)

这个安排对使用体验很重要。假设助手准备执行一项需要批准的操作，用户暂时没回复，它应能保存“正在等什么”，而不是丢掉进度，或反复催问。具体运行时是否支持这样的暂停与恢复，需要查看实现，不能仅凭一张架构图推定已经具备。

同样，完成一轮工作也不一定要发消息。原文给出的结果包括发送、保持安静、请求用户输入，并建议先少通知，再逐渐争取用户的注意力。

我赞成少打扰，但会加一个使用上的要求：系统内部应能区分“检查完成，无需通知”和“没有完成检查”。用户可以暂时不收到消息，维护者却需要查到它为何安静。否则，克制和失联看起来会一样。

如果要试做这类助手，我会先选一个低风险任务，做一次暂停恢复演练：让它在等待回复时退出，在动作结果尚未写回时退出，再给它重复事件。观察恢复后，它是否知道自己在等什么、是否先核查外部结果、是否会重复通知。

这不是原文提供的验收标准，是我读完后更愿意采用的起点。常驻助手让人愿意托付的前提，是任务中途停下来以后，仍有清楚的记录可查，有合适的动作可接。

## 参考资料

- William Hu，[Building always-on agents](https://claude.com/resources/articles/building-always-on-agents)
- Anthropic，[The components of agent memory](https://www.anthropic.com/research/components-of-agent-memory)
- Anthropic，[Building effective agents](https://www.anthropic.com/research/building-effective-agents)
- Claude Code，[Hooks reference：延后工具调用](https://code.claude.com/docs/en/hooks#defer-a-tool-call-for-later)
- Claude Code，[Securely deploying AI agents](https://code.claude.com/docs/en/agent-sdk/secure-deployment)
