---
$schema: starlight
title: AI 什么都做不了，除非你让它做
date: 2026-05-05
description: LLM 连查天气都做不到。所有「AI 能做某事」的背后，都是一整套人建的基础设施和人攥着的控制权。
coverImage: cover.png
tags: [ write ]
---

今天看到 ByteByteGo 一篇文章，讲 LLM 怎么连接现实世界。标题很体面——「Connecting LLMs to the Real World」。看完之后我脑子里冒出来的第一件事是：

**AI 什么也做不了。**

不是谦虚，不是哲学。是字面意思。你问它"东京现在几度"，它只能猜。它没有网，没有数据库，没有任何办法伸出自己的上下文窗口。它是一台文字版的自动贩卖机——你投币，它出货，但它永远不能自己去进货。

所有你觉得「AI 在做的事」——搜索、发邮件、订机票——都不是 AI 做的。是 AI 说了一声「帮我查一下东京天气」，然后人写的代码去查了，再把结果塞回给它。

模型负责决定该做什么。周围的软件负责让它真的做到。

这中间有一条缝。整件事的秘密都在这条缝里。

## 工具调用的本质：一张菜单

给 LLM 接工具，原理出奇地简单。就像进餐厅，服务员递给你一张菜单：上面写着每道菜的名字、配料、价格。模型看到这个菜单，然后点菜——"我要 get\_weather，参数是 Tokyo"。

但它不能自己下厨。它只能把点菜的需求写成一段结构化文字。外面等着的程序读这段文字，校验参数，调用真正的天气 API，拿到"22 度，多云"，再写回来。

这个来回，叫 **agentic loop**（智能体循环）。

原文画了一张图，展示这个循环：

![AI 智能体循环：用户请求 → LLM 分析 → 调用工具 → 执行 → 返回结果 → 回答用户](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-05-llm-mcp-img-01.png)

听起来很优雅。但优雅的背后有一堆人替它擦汗。

## MCP：消灭 N×M 的噩梦

优雅没有持续多久。

问题是每个 LLM 厂商的工具调用格式都不一样。OpenAI 一套，Anthropic 一套，Google 又一套。你写了一个工具想给三家都用，得写三份适配代码。3 个厂商 × 5 个工具 = 15 种对接。加第 6 个工具就多 3 种。加第 4 个厂商就多 5 种。

这个 N×M 的增长速度，很快变成灾难。

MCP 就是来拆这堵墙的。

Anthropic 提出了一个开放标准——Model Context Protocol。每个 LLM 客户端实现一次 MCP，每个工具服务端实现一次 MCP。3 + 5 = 8，不是 15。从乘法变加法。

原文用一张图展示了 MCP 怎么把 N×M 变成 N+M：

![集成复杂度对比：传统 N×M 爆炸 vs MCP 的 N+M 线性增长](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-05-llm-mcp-img-02.png)

MCP 不替代工具调用。工具调用是模型说"我想用这个"的机制，MCP 是让这个"这个"在任何模型上都能被识别、被发现、被调用的协议。

模型不知道也不关心背后有没有 MCP。它看到的还是一张菜单，照旧点菜。

推广速度快得惊人。2025 年 OpenAI 宣布支持，Google DeepMind 紧随其后。到了年底，公开的 MCP 服务器已经超过一万个。Anthropic 把这个协议捐给了 Linux 基金会下面的 Agentic AI Foundation——Anthropic、Block、OpenAI 联合创办，AWS、Google、Microsoft、Cloudflare、Bloomberg 支持。一年时间，从开源实验变成了行业标准。

MCP 架构由三部分组成：Host（你用的 AI 应用）、Client（Host 里的通信模块）、Server（封装工具的轻量程序）。Host 启动时，Client 连接各个 Server，问它们"你能做什么"，然后把描述喂给模型。之后就是熟悉的工具调用流程。

![MCP 三件套架构：Host → Client → Server → 工具/数据源](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-05-llm-mcp-img-03.png)

## 代价：每把工具都是一道伤口

但事情不是没有代价的。

最直接的是安全。每暴露一个工具给 LLM，就多一道攻击面。2025 年 9 月出了第一个真实的 MCP 供应链攻击——有人发了个 npm 包，伪装成 Postmark 的官方 MCP 邮件集成。几百个开发者装了。结果这个包在背后偷偷把所有外发邮件转发给攻击者。

MCP 早期为了快速 adoption，安全设计是跟不上的。认证规范改了好几版。这和技术标准的常见路径一致：先跑通互通性，安全慢慢补。

比安全更隐蔽的代价是——**工具本身占地方**。

每个工具的名字、描述、参数 schema 都吃上下文窗口的 token 空间。三五把工具无所谓。几十上百把的时候，它们就开始挤占模型用来思考问题的空间了。一个有几百个工具的 agent 听起来很强，实际上每多一把工具，模型对真正问题的注意力就弱一分。

工具调用也不能让 LLM 变得确定。模型照样会编造函数名、传错参数、把工具串成你没想到的顺序。校验、错误处理、人工审批——这些在生产环境里一个都不能少。

![安全与性能的权衡：工具越多能力越强，但攻击面越大、上下文开销也越大](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-05-llm-mcp-img-04.png)

## 那条缝才是核心

从头到尾，有一件事没有变过：

**模型决定该做什么。软件层决定它能不能做到。**

安全、可靠性、控制权，全都设计在那条缝里。

MCP 从发布到行业标准用了一年。工具定义、agentic loop、推理与执行的分离、扩展 LLM 能力带来的权衡——这些核心概念不管最后哪个框架、哪个厂商、哪个协议版本胜出，都不会变。

因为那条缝不是技术细节。它是边界。是人和机器之间谁说了算的那个地方。

我们建的所有基础设施，看似在让 AI 变得更强大。实际上是在给它的强大画框。

框不是限制。框是让它能安全地强大的前提。

***

你给 AI 接过工具吗？接完之后最大的意外是什么？

## 原文参考

> BYTEBYTEGO. **Connecting LLMs to the Real World: Tool Use, Function Calling, and MCP**. ByteByteGo Newsletter.
> <https://blog.bytebytego.com/p/connecting-llms-to-the-real-world>
