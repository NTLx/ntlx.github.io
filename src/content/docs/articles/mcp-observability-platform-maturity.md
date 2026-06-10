---
$schema: starlight
title: 当 AI 平台开始给开发者发仪表盘
description: 一个平台什么时候从「玩具」变成「基础设施」？不是用户数破亿那天，也不是融资到 F 轮那天——是它开始给第三方开发者发仪表盘那天。
date: 2026-06-10
category: ai-industry
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-10-mcp-observability-platform-maturity-img-00-infographic-core-summary.png)

Anthropic 给 MCP 连接器开发者发了一个仪表盘。

听起来平淡。一个 dashboard，public beta，需要 Team 或 Enterprise 账户才能用。放在产品更新列表里，大概排在「修复了一个罕见的内存泄漏」和「优化了暗色模式下的分割线颜色」之间。

但我觉得这是 MCP 生态一年半来最重要的发布之一。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-10-mcp-observability-platform-maturity-img-01-platform_maturity_shift.png)

## 仪表盘是给谁的

仪表盘这个东西有个特点：*只有需要长期维护的东西才配拥有*。

你写了个一次性脚本，不会给它配 Grafana。你搭了个内部工具只有三个人用，不会想「我得看一下 P99 延迟」。仪表盘意味着一件事——有人要对这个系统的行为负责。

Anthropic 现在对 MCP 连接器开发者说：*你可以在 Claude 里看你的连接器表现如何了*。这句话翻译过来是：你的连接器不是扔进目录就完事了。有人在用，每天几百万人在用。用得好不好、快不快、有没有报错——你应该知道，我们也让你知道。

这是平台对开发者的一个姿态变化。之前的关系是「欢迎来建，我们帮你分发」。现在的关系是「你的东西在生产环境里跑，我们有共同责任让它跑好」。

别小看这个变化。AWS 2006 年发 EC2，但 CloudWatch 是 2009 年才出的。Heroku 2007 年上线，指标仪表盘也是后来才补的。*给开发者发仪表盘，从来不是一个平台的第一优先级*——它出现在平台意识到「开发者信任不只来自功能，还来自可依赖性」的那个时刻。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-10-mcp-observability-platform-maturity-img-02-observability_ecosystem.png)

## 不是 Anthropic 一个人在干这件事

有意思的是，这个方向不只 Anthropic 在走。

Sentry 今年年初推出了 MCP 服务器监控，一行代码 `wrapMcpServerWithSentry()` 就能看到谁在调你的工具、哪个工具最慢、哪个传输协议在报错。他们自己的 MCP 服务器月请求量已经冲到 5000 万。

Datadog 和 Coralogix 从另一个方向切入——不是监控 MCP 服务器，而是让 AI agent 通过 MCP 查询可观察性数据。一个向内看，一个向外看，两条线在 MCP 这里交叉了。

Sentry 的工程师写了一段很诚实的话：他们的 MCP 服务器上线后，有一天突然收到用户报告说请求超时。从服务端看一切正常——没有错误、没有告警。他们根本不知道有多少用户受影响，请求是从哪些 MCP 客户端过来的。

这个场景做后端的人太熟了。*没有可观察性的时候，你的用户就是你的告警系统。* 区别在于，传统 API 的可观察性工具链已经成熟了二十年，MCP 的才刚开始。

OpenTelemetry 的 MCP 语义约定目前还在草案阶段。整个行业在拼一张共同的拼图——可观察性市场 2026 年估值 34 亿美元，年增速超过 11%，而 MCP 这层协议正在变成拼图里突然多出来的一块。

## 仪表盘背后是信任

MCP 从 2024 年 11 月发布到现在，一年半。

这条路的节奏快得不太正常。2025 年 12 月 Anthropic 把 MCP 捐给了 Linux Foundation 下面的 Agentic AI Foundation，跟 Block 的 Goose、OpenAI 的 AGENTS.md 放在同一个屋檐下。联合创始方包括 Anthropic、Block 和 OpenAI，Google、Microsoft、AWS、Cloudflare、Bloomberg 在后面撑着。

生态数字也撑得住：一万多个活跃公共 MCP 服务器，Python 和 TypeScript SDK 月下载量加起来九千七百万。ChatGPT、Cursor、Gemini、VS Code、Copilot——你能叫出名字的 AI 产品基本都接了 MCP。

但数字大不等于成熟。

成熟的标志是：开发者敢把自己的服务挂上去，然后睡觉。这需要的不只是协议稳定——协议稳定只保证「能连上」。还需要出了问题有人告诉我、问题在哪我能看到、修好了我能确认。

这就是仪表盘在做的事。它不是在卖功能，*它在卖「你可以信任这个平台」*。

## 还不完美，但方向对了

话说回来，这个仪表盘现在还只是 public beta。功能大概是最基础的那一套——用量、延迟、错误率。离 Sentry 那种「能看到具体哪个工具调用的哪次请求参数出了错」的粒度还有距离。

更大的问题是安全。MCP 服务器默认无认证启动非常简单——对早期测试很友好，对生产环境很危险。Netskope 的安全团队已经提出了 Tool Poisoning Attack 的概念：恶意指令嵌入 MCP 工具描述，用户看不见但 AI 模型能看见。在传统应用里，用户输入和数据是分开的；在 AI agent 世界里，数据随时可能变成指令。

可观察性是安全的基础设施。你监控不了的东西，你就保护不了。

Anthropic 这次发的只是一个仪表盘。但它出现在对的时间——MCP 生态刚好跨过「能跑」的阶段，开始问「跑得好不好」的问题。

一个平台什么时候从玩具变成基础设施？不是用户数破亿那天，也不是融资到 F 轮那天。是它开始给第三方开发者发仪表盘那天。

***

*你在用 MCP 连接器吗？有没有遇到过「用户告诉我出问题了但我自己完全不知道」的时刻？*

## 原文参考

> Anthropic, "Observability for developers building connectors"
> <https://claude.com/blog/observability-for-developers-building-connectors>
