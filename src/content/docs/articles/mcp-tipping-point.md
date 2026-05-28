---
$schema: starlight
title: 同一天，OpenAI、Runway、Google 都选了 MCP——一个协议的临界点
description: 三家互为竞争对手的公司在同一天拥抱了 Anthropic 创建的 MCP 协议——当一个标准被所有人接受，它就不再是差异化武器，而是基础设施。MCP 正在成为 AI Agent 的 TCP/IP。
date: 2026-05-28
category: ai-industry
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-28-mcp-tipping-point-img-00-infographic-core-summary.png)

2026 年 5 月 27 日，三家公司发布了看起来不相干的产品更新。OpenAI 推出了 Secure MCP Tunnel——让 ChatGPT 和 Codex 可以安全访问你内网的 MCP 服务器，防火墙一个端口都不用开。Runway 发布了 Runway MCP——把 Gen-4.5、Seedance 2.0、Kling 3.0 的视频图像生成能力接入了所有 MCP Agent。Google 在 I/O 上发布了 Google Pay & Wallet Developer MCP Server——让 AI agent 帮你管理支付集成、排查错误、分析交易数据。

三条新闻，同一个关键词：MCP。

如果你把这三件事拆开看，每一件都像是正常的产品迭代。但把它们放在同一天的时间轴上，你看到的不再是三个独立的技术决策，而是一个信号——MCP 已经过了那条线。它不再是"Anthropic 创建的开放协议"，它是"AI 行业的基础设施"。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-28-mcp-tipping-point-img-01-mcp-timeline.png)

## 从一个协议到一个标准

把时间往回拨 18 个月。2024 年 11 月，Anthropic 发布了 Model Context Protocol，简称 MCP。当时的定位很清晰：一个开放标准，让 AI 模型以统一的方式调用外部工具和数据源。技术上讲，它是 JSON-RPC over stdio/HTTP，定义了 Tool、Resource、Prompt 三个原语。

那个时候你用 MCP，基本上是在 Claude Desktop 里连自己的本地文件系统或者一个 SQLite 数据库。它的心智模型是："让你的 AI 助手能访问你的东西。"

但协议的扩散有自己的逻辑。

2025 年，MCP 的下载量从零涨到了 9700 万。5800 多个 MCP 服务器被创建出来，从 Notion 到 Blender 到 Ableton Live——有人甚至用它接了 3D 打印机。增速曲线跟当年 npm 和 REST API 的采用曲线几乎重合。Anthropic 做了一件事：把 MCP 捐给了 Linux Foundation 下的 Agentic AI Foundation。AAIF 的联合创始方包括 Block 和 OpenAI，支持方有 Google、Microsoft、AWS、Cloudflare、Bloomberg。

请注意"OpenAI"和"Google"出现在支持名单里。这意味着 MCP 的治理结构在 2025 年就已经从"Anthropic 主导"变成了"行业共治"。2026 年 5 月 27 日的三条新闻，是这个治理结构第一次产生密集的产品输出。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-28-mcp-tipping-point-img-02-mcp-ecosystem.png)

## 三刀切下去，各自在做什么

OpenAI 的 Secure MCP Tunnel 解决的是一个企业部署的经典痛点。你的 MCP 服务器跑在内网，ChatGPT 在云端——想让它们通信，要么给 MCP 服务器开公网端口（安全团队不会同意），要么搭 VPN（麻烦），要么放弃。Tunnel 的方案是：在企业内网跑一个 `tunnel-client`，它只往外连 OpenAI 的端点、长轮询取任务、转发给内网 MCP 服务器、然后把结果传回去。只出不进，入站端口零开放。

这个设计的聪明之处不在技术——出站隧道并不新鲜，Cloudflare Tunnel 和 ngrok 做了很多年——而在它把企业安全团队的心理门槛降到了零。"一个入站端口都不用开"这话是说给 CISO 听的。

Runway 的 MCP 走的是另一条路。Runway 不缺用户，但它缺"不被切出 workflow"的能力。今天一个设计师用 Runway 生成视频，流程是：打开 Runway → 上传素材 → 调参数 → 生成 → 下载 → 拖回 Figma/VS Code。MCP 把这个流程压成了：在 Claude 或 ChatGPT 里说一句"把这张产品图做成一段 15 秒的营销视频"，Runway 在后台生成，结果直接回到对话窗口。Runway 从"一个要去的地方"变成了"一个在背后默默干活的东西"。

Google 的选择最有意思。Google Pay MCP Server 不是给终端用户的——是给开发者的 AI agent 用的。你的 coding agent 可以帮你查 Google Pay API 文档、排查集成报错、分析交易趋势。这等于在说：未来的开发者工具面向的第一个用户可能不是人，是另一个 AI。而 MCP 是人和 AI 都能用的统一接口。

三个切入点：一个解决连接安全，一个解决创作 workflow，一个解决开发者工具。但底层是同一条逻辑：MCP 是让 AI Agent 触碰真实世界的那个"手"。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-28-mcp-tipping-point-img-03-tunnel-architecture.png)

## TCP/IP 时刻？

我看完这三条新闻，脑子里冒出来的类比不是 REST API，不是 GraphQL——是 TCP/IP。

TCP/IP 在 1983 年成为 ARPANET 的强制标准之前，也只是一个研究项目里的网络协议。当时有 SNA、DECnet、X.25 等各种竞争协议。TCP/IP 胜出的原因不是它技术上最优雅，而是它被"捐赠"给了公共领域、任何人都能实现、没有任何一家公司能在协议层面锁住用户。

MCP 走了几乎一模一样的路径：Anthropic 创建 → 开源 → 捐赠给中立基金会 → 竞争对手采用 → 成为事实标准。当 OpenAI 在自己的产品里深度集成 MCP——不是"兼容"、不是"桥接"，是作为一等公民——MCP 就不再是 Anthropic 的战略资产了。它变成了类似 TCP/IP 的公共品：所有人都用，没有人拥有，但所有人都受益。

这里有一条反直觉的线索。Anthropic 把 MCP 捐出去，看起来是放弃了控制权。但正是因为放弃了控制权，OpenAI、Google、Runway 才敢毫无顾忌地采用。如果 MCP 今天还是 Anthropic 独家控制的协议，你猜 OpenAI 会不会给 ChatGPT 加上"Anthropic MCP Tunnel"？不会。他们会做一个自己的版本。

Anthropic 的赌注是：与其守着一个只有 Claude 用的协议，不如让所有人用同一个协议——因为当所有 Agent 都说同一种语言时，最大的受益者是构建了最强 Agent 的那家公司。而 Anthropic 目前的 Claude Opus 4.7，在各种 agentic 基准上都排在前列。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-28-mcp-tipping-point-img-04-mcp-growth.png)

## 基础设施化了之后，什么会变？

协议变成基础设施，产品的竞争点会转移。就像 TCP/IP 普及之后，没人再卖"TCP/IP 兼容路由器"——那是底线。竞争转移到了上面的 HTTP、浏览器、搜索引擎。

MCP 普及之后会发生类似的事：

* "支持 MCP"不再是卖点，因为所有东西都支持 MCP。就像今天没人把"支持 HTTPS"写成 feature
* 工具的质量和独特性替代协议的稀缺性。Runway MCP 的价值不在"它能连 Agent"，在"它生成的视频比别人好"
* MCP 服务器的治理和安全变成新瓶颈。OpenAI 的 Tunnel 解决的是连接安全，但 5800 个 MCP 服务器里，有多少个的 tool metadata 被精心设计过？会不会有恶意服务器诱导 Agent 执行危险操作？这些都是下一层的战争
* 企业内部的 MCP server 管理会成为一个品类。谁来做 MCP Gateway——统一认证、审计、限流、授权传播？WorkOS 和 InstaTunnel 已经在布局

话说回来，MCP 也不是没有风险。最大的风险是碎片化——当太多公司往协议里加自己的扩展，互操作性可能退化。AAIF 的治理能力将决定 MCP 是变成一个真正的统一标准，还是又一个"有 14 种不完全兼容实现的规范"。

还有一个容易被忽略的变化。当 MCP 成为所有 Agent 的默认语言之后，"Agent 之间的通信"也会变成 MCP。今天的 MCP 主要是 Agent↔Tool 的连接，但 Runway MCP 和 Google Pay MCP Server 暗示了另一种用法：一个 Agent 调用另一个专业 Agent，通过 MCP 完成协作。这就是 Multi-Agent 从"同一模型的分身"到"异构模型的 MCP 对话"的跃迁。如果这个方向走通，MCP 就不只是 TCP/IP——它是 TCP/IP 加 HTTP 加 REST，把所有东西串在一起。

***

MCP 走到今天，只用了 18 个月。从一家公司的开源项目到三家竞争对手同一天发布基于它的产品——这种速度在基础设施协议的历史上是罕见的。HTTP 花了十年才从 CERN 的实验室走到 Netscape 和 IE 的战争。TCP/IP 花了更久。

也许 AI Agent 时代的时钟就是走得快一些。

*你的团队在用 MCP 吗？如果 MCP 成了所有 Agent 的默认语言，你觉得最大的机会和最大的坑分别在哪里？*

## 原文参考

> OpenAI Devs: Private MCP servers — OpenAI products. Your team can keep MCP servers inside your network while ChatGPT, Codex, and the Responses API connect through outbound-only HTTPS.
> <https://x.com/OpenAIDevs/status/2059703536825565499>

> OpenAI API Docs: Secure MCP Tunnel
> <https://developers.openai.com/api/docs/guides/secure-mcp-tunnels>

> Runway: Introducing Runway MCP
> <https://runwayml.com/news/mcp>

> Google Developers Blog: The latest updates to Google Pay
> <https://developers.googleblog.com/the-latest-updates-to-google-pay/>
