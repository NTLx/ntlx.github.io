---
$schema: starlight
title: Loop Engineering：Agent 真正的战场不是 prompt，而是回路
description: Agent 的价值正在从会说话的模型，转到能被验证、触发、改进的回路；回路越自动，人越要守住目标函数。
date: 2026-06-17
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-17-loop-engineering-agent-loops-img-00-infographic-core-summary.png)

LangChain 这篇《The Art of Loop Engineering》，我读完第一反应是：终于有人把 Agent 这件事从 prompt 里拎出来了。

过去一年，很多讨论还停在“怎么问模型”“怎么写 system prompt”“要不要多给几个例子”。这些当然有用，但越来越像在调一台发动机的声音。真正决定车能不能上路的，是底盘、刹车、仪表盘、路线和维修制度。

Agent 也是。模型只是发动机。回路才是车。

## Prompt 退后，harness 上前

原文第一层很朴素：Agent 就是模型拿着上下文，反复调用工具，直到任务完成。这个定义一点都不神秘。真正的变化发生在下一步：你不再只问“模型下一句该说什么”，而是问“这次行动之后，系统怎么知道它做对了”。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-17-loop-engineering-agent-loops-img-01-prompt-to-harness-control.png)

这就是 harness 的意义。它把模型接到文件系统、仓库、数据库、审批、测试、日志和人身上。Prompt 决定模型这一轮怎么想，harness 决定模型能看见什么、能碰什么、错了怎么回滚、做完由谁验收。

我觉得这篇文章最有价值的地方就在这里。它没有把 Agent 神化成一个“自主工作者”，而是把它放回工程系统：输入、动作、反馈、再动作。听起来没那么性感，但这才像能进生产环境的东西。

不过也正因为这样，LangChain 的叙事需要反过来读。四层 loop 既是技术框架，也是产品地图：`create_agent`、`RubricMiddleware`、LangSmith Deployment、Fleet、Engine。它有理论味，也有产品地图的味道。一家公司在给自己的工具链重新命名。这个事实不减损文章价值，但提醒我们：不要把产品边界误当成思想边界。

## 四层回路，其实是四次责任转移

原文把 loop 分成四层。

第一层是执行。模型调用工具，读文件、改代码、开 PR。第二层是验证。跑测试、查链接、看 CI、按 rubric 打分，不合格就把反馈塞回去。第三层是事件触发。Agent 不再等你手动唤起，而是被 Slack 消息、webhook、cron、排期任务启动。第四层是 hill climbing。生产 trace 被拿来分析，反过来修改 prompt、tool、grader 或 harness 配置。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-17-loop-engineering-agent-loops-img-02-four-loops-responsibility-boundary.png)

这四层看起来是能力叠加，其实是责任转移。

执行层转移的是手活。验证层转移的是第一轮检查。事件层转移的是启动权。改进层转移的是部分系统进化权。越往外，越不像“自动化一个任务”，越像“把一小块组织流程交给机器运转”。

所以我读到第 3、4 层时反而慢下来了。一个手动 Agent 出错，影响通常还在当前会话里；一个事件驱动 Agent 出错，可能在后台重复发生；一个自我改进的 harness 出错，最麻烦的是它会把错误固化成下一版默认行为。

我不是在反对自动化。能自动化的当然应该自动化。但自动化越深入，验收标准就越不能含糊。你不能只说“让它自己变好”。变好是沿着什么指标变好？谁定义这个指标？指标被钻空子时，谁能叫停？

## Hill climbing 最诱人，也最危险

第四层是原文最锋利的一层。每次 Agent 运行都会留下 trace：模型看到了什么、调用了什么工具、哪里被 grader 打回、最后怎么收敛。这些 trace 是金矿。人类团队以前靠复盘、事故报告、代码审查慢慢改流程；现在可以让另一个 Agent 读这些 trace，提出 prompt 或代码修改。

这确实是 leverage。一个系统不只会干活，还会从自己的工作痕迹里找下一轮改法。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-17-loop-engineering-agent-loops-img-03-wrong-objective-hill-climbing-risk.png)

但 hill climbing 有个老问题：它只会爬你给它的山。

如果 grader 只看链接是否可达，Agent 会学会让链接可达，却不一定学会让文档对用户有用。如果评价只看 PR 是否通过测试，它会学会取悦测试，而不一定学会保住设计意图。如果组织只奖励吞吐量，它会把所有回路都调向更多任务、更快合并、更少停顿。

这就是我对 loop engineering 的保留意见。回路不是魔法，反馈信号才是。反馈信号粗糙，系统就会稳定地产生粗糙结果；反馈信号错了，系统还会越来越熟练地错。

把人放成“偶尔点批准”的按钮，会错过重点。人要负责的是目标函数。什么叫好，什么叫越界，什么错误宁可慢也不能犯，什么判断不能交给自动改进系统。这些东西不写进回路，回路就会自己用便宜信号替代它们。

## 真正的新岗位：回路管理员

我越来越觉得，Agent 时代最重要的能力不是会写 prompt，而是会管理回路。

回路管理员要做的事很土：写清楚任务边界，给工具分权限，把高风险动作放进审批，把测试做成硬门槛，把 trace 变成复盘材料，把“什么时候停止”写进验收标准。听起来像老工程实践换了个名字。没错，很多好东西本来就旧。Agent 只是把它们的价值放大了。

这也是原文让我真正动心的地方。它没有承诺一个万能 Agent，只是暗示了一个更现实的方向：未来的差距，会落在谁拥有更好的学习回路上。

只是这句话要补完：好的学习回路，不能只比谁更自动。它必须知道谁能启动，谁能验证，谁能改规则，谁能按下停止键。

没有这些，loop engineering 很容易退化成一台漂亮的加速器。它确实让你跑得更快，但不保证你在跑对方向。

*如果你要把一个 Agent 接进真实工作流，你最不愿意交出去的是哪一层：执行、验证、触发，还是自我改进？*

## 原文参考

> Sydney Runkle, The Art of Loop Engineering, LangChain, 2026-06-16
> <https://www.langchain.com/blog/the-art-of-loop-engineering>

> LangGraph overview, Docs by LangChain
> <https://docs.langchain.com/oss/python/langgraph/overview>

> How Middleware Lets You Customize Your Agent Harness, LangChain
> <https://www.langchain.com/blog/how-middleware-lets-you-customize-your-agent-harness>

> AINews: Loopcraft: The Art of Stacking Loops, Latent.Space
> <https://www.latent.space/p/ainews-loopcraft-the-art-of-stacking>

> RubricMiddleware, Deep Agents docs
> <https://docs.langchain.com/oss/python/deepagents/rubric>

> LangSmith Engine
> <https://www.langchain.com/langsmith/engine>

> Hacker News discussion: Loop Engineering: Designing loops that prompt coding agents
> <https://news.ycombinator.com/item?id=48514387>
