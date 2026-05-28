---
$schema: starlight
title: "从 Token 流到 Agent 流：LLM 应用正在经历它自己的\\\"协程革命\\\""
description: 当 agent 不再是调个模型返回文本而是规划、委派、审批、多模态输出时，扁平的 token 流就成了最大的瓶颈。流式的本质不是让字快点出来，而是让复杂工作可观测。
date: 2026-05-22
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-22-token-streams-agent-streams-llm-concurrency-revolution-img-00-infographic-core-summary-1.png)

2026 年 5 月，LangChain 发了一篇博客叫 [From Token Streams to Agent Streams](https://www.langchain.com/blog/token-streams-to-agent-streams)。标题看起来是技术细节的迭代——从 token 流升级到 agent 流嘛，加几个字段的事。但我读完之后第一反应是：**这大概是 LLM 应用开发里最接近"协程革命"的一次范式转移。**

我以前做操作系统相关的工作，对"流"这东西有天然的敏感度。管道、协程、异步迭代器——名字换了又换，解决的都是同一个问题：**当一个系统内部的复杂度超过了线性处理能力，你需要的不是更快的 CPU，而是更好的组织方式。**

LangChain 这次做的就是这件事。

## 为什么 token 流不够用了

先看一个场景。你搭了一个研究 agent：收到用户问题后，它先规划研究方案，然后把三个子问题分别委派给三个子 agent，每个子 agent 各自调用工具查资料、更新状态，最终汇总成一份报告。整个过程中你可能想：

- 在主聊天面板里逐字渲染最终答案
- 在侧栏显示三个子 agent 各自在干什么
- 在调试面板里看原始事件流
- 用进度条显示整体完成度
- 在 agent 需要人类审批时弹出确认框

这些需求同时发生，来自同一个运行中的 agent 树。

老式 token 流怎么解决这个问题？它不解决。它的设计前提是"一次模型调用，一串文本输出"。所有东西被拍平成一个 token 序列——主 agent 的输出、子 agent 的输出、工具调用的参数、状态变更——全搅在一起。前端收到后自己拆分、排序、去重、处理断线重连。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-22-token-streams-agent-streams-llm-concurrency-revolution-img-01-architecture-diagram-1.png)

```
老式 token 流：
[主agent token][子agent-A token][工具调用][子agent-B token][状态变更][子agent-C token]...
         ↓ 前端自己解析、排序、归位
    聊天面板 + 侧栏 + 调试面板 + 进度条

新式 agent 流：
事件日志（单一来源）
    ├── messages 通道    → 聊天面板
    ├── subagents 通道   → 侧栏
    ├── tools 通道       → 调试面板
    ├── lifecycle 通道   → 进度条
    └── custom:* 通道    → 应用自定义
```

这就是 LangChain 说的"typed events 替代 raw chunks"。每个事件带着两个标签到达：**它是什么类型的事**（消息、工具调用、状态变更），以及**它来自 agent 树的哪个位置**。

从"字怎么出来"到"事怎么做"——关注点从 LLM 内部转移到了 agent 工作流的外部可观测性。

## 投影 API：像数据库视图一样消费 agent 数据

但 typed events 只是基础设施。真正让我觉得有意思的是投影（projection）API 的设计。

开发者不应该直接迭代原始协议事件。应该**声明你想要渲染什么，运行时给你组装好。**

```python
run = await graph.astream_events(input, version="v3")

    # 我要消息
async for message in run.messages:
    async for delta in message.text:
        render_chat(delta)

    # 我要子agent状态
async for subagent in run.subagents:
    print(f"{subagent.name}: {subagent.status}")
```

同一份底层事件日志，不同的投影视角。这和数据库里 SELECT 同一个表写出不同视图是一个思路。**数据源只有一个，但消费方不需要协商谁来"读走"数据——各取所需，互不干扰。**

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-22-token-streams-agent-streams-llm-concurrency-revolution-img-02-flow-comparison-1.png)

这个设计解决了一个很实际的问题：当你的 UI 有聊天面板、子 agent 检查器、调试控制台、进度指示器同时运行时，谁先消费流、谁后消费、怎么避免重复消费——在老方案里是个工程难题。在新方案里，这不是问题。

话说回来，这种设计不是凭空冒出来的。RxJS 做事件流、GraphQL 做字段选择、Kafka 做 topic 订阅——都在不同层面解决过"一个数据源，多种消费方式"的问题。LangChain 的功劳是把这套思路搬到了 agent 流式这个具体场景里，并且把协议和运行时绑在一起做到了开箱即用。

## 前端开发者的解放

谁在承担流式复杂度的代价？过去的回答是前端开发者。你拿到一个 token 流，然后：

- 自己拼接 token 成完整文本
- 从文本里正则匹配工具调用的开始和结束
- 根据命名约定判断哪个 token 来自哪个子 agent
- 自己处理断线后从哪里续接
- 推理内容的渲染方式和正文内容不同，自己区分

这些活儿不难，但繁琐。而且一旦 agent 的逻辑结构变了——比如多加了一个子 agent，或者审批流程多了一步——前端就要跟着改解析逻辑。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-22-token-streams-agent-streams-llm-concurrency-revolution-img-03-ui-projections-1.png)

新的做法把这些事儿从前端搬到了运行时。前端说"我要这个子 agent 的消息"，运行时就只给你那个子 agent 的消息。前端不用知道底层有多少个事件、怎么排序、哪些需要跳过。

更重要的是**scoped subscriptions**（作用域订阅）。一个子 agent 检查器只订阅它需要的那部分 agent 树，不会拉取所有子 agent 的 token 输出。这决定了系统的可扩展性——你的 dashboard 有 10 个子 agent 在跑，打开其中一个的详情面板，不需要接收另外 9 个的流量。

对个人开发者来说，搭建一个带实时 UI 的多 agent 系统不再需要自己写事件解析器、状态机、重连逻辑。运行时替你扛了。复杂度没有消失，只是被放到了对的地方。

## 多模态和未来的流

这次更新里有一个 demo 我觉得最值得注意：一个 agent 生成睡前故事，同时产出文字、每页配图、音频朗读和视频。这些完全不同类型的数据——文本 delta、图片 URL、音频流、视频帧——全走同一套流式协议。

文本、推理、工具活动、图片、音频、视频、自定义数据，全部使用相同的内容块格式、命名通道和命名空间定位。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-22-token-streams-agent-streams-llm-concurrency-revolution-img-04-multimodal-future-1.png)

这才是协议设计真正的前瞻性。如果多模态是 agent 的必然方向，那流式协议必须在第一天就支持它，而不是事后打补丁。内容块（content block）替代纯字符串（plain string）就是这个补丁的第一块砖。

同时发布的框架 SDK v1 包（@langchain/react、@langchain/vue、@langchain/svelte、@langchain/angular）把这个协议直接暴露给了前端框架。你在 React 组件里写 `useStream()` 拿到的不是原始事件，而是已经按组件需求切分好的投影。

## 我的看法

非科班出身的人学编程，最容易犯的错是把"能跑"等同于"能用"。一个 agent 能出结果，不代表它的流式体验能支撑真实用户场景。

LangChain 这次升级让我看到一个信号：**agent 框架正在从"工具库"变成"基础设施"。** 工具库提供函数调用，基础设施提供协议和约定。当流式协议成为不同组件之间的"普通话"——没有它，聊天面板听不懂调试器在说什么，子 agent 检查器不知道从哪里开始读数据——agent 生态才真正具备了协作的基础。

这不是一个"加几个字段"的升级。这是 agent 框架从能用走向好用的必经之路。

还有一个细节值得单独拎出来：**断线重连**。

在老方案里，浏览器刷新意味着你丢失了所有已接收的 token。如果 agent 还在跑，你需要从头再收一遍——已经渲染过的文字会闪一下再出现，体验很割裂。新协议里，事件带有序号元数据，客户端断开后重连，告诉服务端"我上次收到第 42 号事件"，服务端从 43 号开始补。对长运行的 agent（有些生产场景的 agent 会跑几分钟甚至更久），这不是锦上添花，是刚需。

这也是为什么我说它像协程革命——操作系统里协程能工作，靠的就是上下文可以保存和恢复。agent 流的断线重连，本质上就是流式上下文的保存和恢复。

*你的 agent 目前在流式上踩过什么坑？是自己拼 token 拼出过 bug，还是子 agent 的输出互相串了？欢迎聊聊。*

## 原文参考

> From Token Streams to Agent Streams — C. Bromann, N. Hollon
> LangChain Blog, May 21, 2026
> https://www.langchain.com/blog/token-streams-to-agent-streams
