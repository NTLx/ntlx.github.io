---
$schema: starlight
title: 当 AI 开始记住工作，人还要做什么？
description: 持久型 AI 不是把答案写得更长，而是把工作变成一项跨时间、跨工具、跨人的共同状态；人要做的，是定方向、看证据、及时刹车。
date: 2026-08-31
category: ai-agents
tags: [AI Agent, persistent AI, ChatGPT, Codex, knowledge work]
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-31-persistent-ai-coworkers-img-00-infographic-core-summary.png)

我在这期[访谈](https://www.lennysnewsletter.com/p/ais-third-era-the-rise-of-persistent)里真正停下来的，不是“AI 的第三个时代”这个说法，而是一个很普通的画面：你在手机上给 AI 交代一件事，坐上一段没有网络的地铁，等你重新出现时，事情已经在云端继续做完了。

这和“问一句、答一句”不太一样。它更像是把一个同事派出去：他记得任务做到哪里，知道还缺什么，过一会儿回来和你同步，再继续往下做。

Tara Seshan 在访谈里把这个方向叫作 persistent coworker。听完八十多分钟，我留下的判断是：持久型 AI 真正改变的，不是 AI 能替人多做几步，而是工作的基本单位变了——它从一次回答，变成了一项跨时间、跨工具、跨人的共同状态。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-31-persistent-ai-coworkers-img-01-original-interview-preview.png)

上图是原访谈页面正文里的 YouTube 预览图。它很适合提醒我们：这里讨论的不是一个抽象的“未来 AI”，而是已经开始进入产品界面的工作方式。

## 真正被拉长的，不是对话，而是任务的寿命

聊天的边界很清楚：上下文集中在当前窗口里，答案交付以后，这一轮就结束了。Agent 往前走了一步，它能拆任务、调工具、反复尝试。但如果任务的状态只存在于一次运行里，下一次仍然要从头解释。

持久同事再往前走了一步：任务有自己的生命周期。它可以被启动、暂停、补充资料、接受反馈，再继续运行；它留下的不只是最终答案，还有做到哪一步、卡在哪里、下一步需要什么。

这也是我读到这里最强的视角转换：所谓“记住工作”，不是给聊天记录加一个更大的窗口，而是让任务本身拥有可以被多人继续维护的状态。此前我在[《Agent 能跑 demo 不算本事，能跑一年才是》](https://ntlx.github.io/articles/agent-development-lifecycle)里更关心 Agent 能不能长期运行；这次访谈让我把问题再往前推了一层：长期运行之后，谁能看见这条任务回路，谁可以在中途改方向？

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-31-persistent-ai-coworkers-img-02-work-unit-transformation.png)

如果这层变化成立，未来的工作记录就不会只是一串 prompt 和回答，而更像一个持续更新的项目现场。人不是每次都重新叫醒 AI，而是在几个关键节点回来判断：继续、改道，还是结束。

## 人没有退场，只是从动作里移到了航向上

Tara 用了一个我很喜欢、但也容易被误读的比喻：agent 负责 rowing，人负责 steering。划船是把动作做出来；掌舵是决定往哪里走，以及看到风向变化后要不要转弯。

这不等于人只剩下写一句 prompt。真正上移的工作至少有四件：选一个值得解决的问题，定义什么叫做够好，解释反馈是否可信，以及决定什么时候不该继续。最后一件尤其容易被忽略。一个能持续运行的系统，如果没有清楚的停止条件，执行时间越长不一定越接近正确答案，可能只是把错误做得更完整。

访谈里反复出现的 ambition，也不只是“把目标喊大”。AI 把设计、原型、建模和调研的执行门槛一起压低之后，人必须重新回答：哪些事情值得被做出来？哪些想法不应该因为以前做不到，就被误认为不重要？

这和我在[《代码不再是交付物，而是外骨骼》](https://ntlx.github.io/articles/code-as-agent-harness)里看到的变化可以接上：代码、文档和界面越来越像人的意图伸出去的外骨骼，但外骨骼不能替你选择要走的路。工具越普及，真正拉开差距的越不是“谁也会用”，而是谁有能力形成一个值得被实现的判断。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-31-persistent-ai-coworkers-img-03-steering-rowing-responsibility.png)

所以，持久型 AI 时代的人类价值，不应该被概括成“创造力”三个字就结束。它更具体：方向、品味、反馈解释、停止权，以及对结果签字。

## 一个同事要有用，先得看见工作现场

“同事”这个比喻还有另一面。你把一个人锁在房间里，不让他看公司的文档、数据和协作工具，他当然没法帮你把事情做好。云端 Agent 也是一样：它要有用，就得能访问真实工作的现场。

因此，持久型 AI 的进步不只在模型变聪明，还在云端执行、第三方系统连接、数据权限和可靠性。它能不能长时间保持任务状态，能不能在网络断开后继续，能不能在失败后留下可读的过程，这些“肉眼看起来不那么 AI”的基础设施，决定了它是不是一个真正的工作伙伴。

但有用性和风险在这里是同一枚硬币的两面。Agent 看不见任何数据，就只能给出泛泛建议；它看得太多、改得太广，又可能把一次错误带进更多系统。持久性会放大能力，也会放大权限配置里的漏洞：旧上下文会继续影响新判断，错误操作会有更多重试机会。

我更愿意把这个边界写成一句工程检查，而不是一句口号：让 Agent 看见完成任务所必需的现场，但把身份、写入范围、审计记录和停止权留在它之外。也就是说，问题不再只是“模型会不会做”，还包括“它能看见谁、能改什么、谁可以叫停”。这也是[《Not the Model, You're the Harness》](https://ntlx.github.io/articles/not-the-model-youre-the-harness)这类讨论在持久协作里变得更重要的原因。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-31-persistent-ai-coworkers-img-04-persistent-coworker-trust-loop.png)

持久型 AI 不是一个更有耐心的聊天机器人，而是一条更长的行动回路。回路越长，数据访问、权限边界和故障恢复就越不能靠“模型自己注意一点”。

## 做完不等于值得相信

访谈后半段有一个区分，我觉得比“人和 AI 谁更聪明”重要得多：代码工作通常可以通过测试检查结果；知识工作却不能只看最后那份 deck 是否漂亮。

一个战略结论、研究报告或经营计划，不能因为句子通顺、图表齐全，就自动变成可信。你还需要知道它用了哪些输入，引用从哪里来，中间做过哪些取舍，哪些地方仍然不确定。对知识工作来说，过程证据不是额外的装饰，而是结果能够被别人接手、质疑和负责的前提。

这也让我重新理解 Tara 对写作的区分：writing as reporting 可以尽量交给模型，writing as thinking 不能轻易外包。把周报、格式转换和状态摘要交给 AI，是在节省整理成本；但如果连第一版判断都不自己形成，模型最后交付的只会是更顺滑的共识，而不一定是更好的问题。

我会把它翻译成一个很简单的原则：让 AI 帮你把已经想清楚的东西传得更远，但不要让它替你决定你究竟想说什么。持久同事可以替你保留上下文、跑完过程、准备多个版本；人仍要亲自确认问题值得问，证据足够硬，结论值得承担。

## 我会怎样把它带回自己的工作

如果现在就把一个任务交给“持久同事”，我会先检查四件事：

1. 它是否知道任务的目标、边界和结束条件，而不只是收到一句模糊的愿望？
2. 它是否拿到了完成任务所需的最小上下文，而不是被授予“所有东西都能看”的权限？
3. 我能否在中途看见输入、引用、进度和失败，而不是只在最后接收一份漂亮结果？
4. 谁拥有最后的停止权和责任？出了问题，能否回到过程，而不是让 Agent 自己解释自己为什么算成功？

这四个问题也解释了为什么我不把持久型 AI 简单理解成“自动化升级版”。自动化强调把一个确定流程跑得更快；持久协作面对的，是目标会被澄清、路径会被修改、结果需要共同判断的工作。它更像一个长期项目成员，而不是一个函数调用。

当然，不是所有事情都适合交给它。探索性任务可以容忍更长的试错回路；医疗、金融、法律等高风险工作则必须保留审批、审计和确定性的外部检查。持久不等于自主，连续不等于可信。

所以我对“第三个时代”的理解，最后落在一句不太浪漫的话上：AI 终于可以替我们把事情继续做下去，但人必须更清楚地知道，什么事情值得继续、什么证据足够停止、什么结果应该由谁负责。

如果你现在把一个工作任务交给能持续运行的 AI 同事，最不愿意让它自行决定的是哪一件：目标、数据、行动，还是结束？

## 延伸阅读

- [《Agent 能跑 demo 不算本事，能跑一年才是》](https://ntlx.github.io/articles/agent-development-lifecycle)
- [《代码不再是交付物，而是外骨骼》](https://ntlx.github.io/articles/code-as-agent-harness)
- [《Not the Model, You're the Harness》](https://ntlx.github.io/articles/not-the-model-youre-the-harness)
- [《Agent 的新入口：它能看见谁》](https://ntlx.github.io/articles/agentic-resource-discovery)

## 参考资料

- [Lenny’s Newsletter：AI’s third era: the rise of persistent AI coworkers | Tara Seshan](https://www.lennysnewsletter.com/p/ais-third-era-the-rise-of-persistent)
- [OpenAI Codex](https://chatgpt.com/codex)
- [OpenAI：ChatGPT Work](https://openai.com/chatgpt-work)
- [Patrick Collison：Fast projects](https://patrickcollison.com/fast)
- [Toni Morrison：The Work You Do, the Person You Are](https://www.newyorker.com/magazine/2017/06/05/toni-morrison-the-work-you-do-the-person-you-are)
