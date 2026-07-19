---
$schema: starlight
title: MCP、A2A、ACP：这根本不是一道选择题
description: ACP 已并入 A2A，活着的协议只有两个，一个管 agent 找工具、一个管 agent 找 agent——把它们当三选一，是问错了问题。
date: 2026-07-19
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-19-mcp-a2a-acp-not-a-multiple-choice-img-00-infographic-core-summary.png)

## 三个框，一个已经进了博物馆

ByteByteGo 那张封面图我第一眼扫过去，MCP、A2A、ACP 三个框并排，工工整整，像让你三选一。但你要较真去查 ACP，会发现它的 GitHub 仓库顶上挂一句话：ACP is now part of A2A。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-19-mcp-a2a-acp-not-a-multiple-choice-img-01-mcp_a2a_acp_original_diagram.png)

这事发生在 2025 年 8 月底。IBM 的 BeeAI 团队把自己的 ACP 协议并进了 Google 的 A2A，仓库归档，团队停摆，负责人 Kate Blair 进了 A2A 的技术指导委员会。从那天起，活着的协议只剩两个——MCP（Anthropic 2024 年底发布）和 A2A（Google 2025 年 4 月发布）。

那张三框对比图，准确说是两张活图加一张遗照。

## 合并的是 ACP，不是 MCP

这里有意思了。三个协议，最后合并的是 A2A 和 ACP，不是 MCP 跟谁。为什么？

因为 MCP 和 A2A 压根不在同一条轴上。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-19-mcp-a2a-acp-not-a-multiple-choice-img-02-vertical_horizontal_two_axes.png)

MCP 是纵向的，agent 往下接工具。读个文件、查个库、调个 API，走 MCP。server 是哑的，你叫它干啥它干啥，调完就结束，不留状态。

A2A 是横向的，agent 横过去找另一个 agent。你把活儿甩出去，对面那个 agent 自己决定怎么干，可能拆子任务，可能调它自己的工具，干到一半缺信息了还能把球踢回来问你。

一个是 calling a function，一个是 asking someone to handle something。两件事的对象性质不一样。工具是被动资源，agent 是主动对等体。没法用一套协议同时伺候这两种对象：把 agent 当工具调，它的自主性就没了；反过来把工具当 agent 委托，又平白多一层协商。

ACP 当年走的路线和 A2A 几乎重叠，都是 agent 找 agent。差别主要在传输层：ACP 用 REST，A2A 用 JSON-RPC 加 task lifecycle。IBM 和 Google 最后判断这俩够接近可以合并，于是合并了。

## 别拿 HTTP 那套逻辑套过来

这事真正说明的不是少了一个协议。是另一件事。

在 agent 找 agent 这层，传输层差异是可以妥协的，真正不能妥协的是 task lifecycle 和发现机制。

这话反直觉。评论区有人说，标准化 agent 通信 feels like the early days of HTTP。我半信半疑。

HTTP 当年一统天下，靠的是统一传输层，大家都用同一套请求响应格式，问题就解决了。可 agent 通信的难点压根不在传输。HTTP、SSE、JSON-RPC，全是现成的，随便挑。真正的麻烦在传输之上：谁有资格做决策、长任务怎么暂停和回环、agent 之间怎么发现彼此、委托出错算谁的。

ACP 并入 A2A 恰恰是反着来的证据。传输层（REST 对 JSON-RPC）被妥协掉了，task lifecycle 和 Agent Card 发现机制被留下来了。A2A 的 Agent Card 发在 `/.well-known/agent-card.json`，像网站的 robots.txt，别人据此知道你能干啥。

HTTP 是统一传输赢了。agent 通信是统一传输不重要。把前者的成功逻辑套到后者，会让人误以为定个传输标准就完事。

## 原文没点破的那一层

原文把 MCP 和 A2A 讲成互补，MCP 管工具，A2A 管通信。挺好，挺清楚。但它漏了一个我觉得更要紧的点。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-19-mcp-a2a-acp-not-a-multiple-choice-img-03-control_model_hub_vs_autonomous.png)

这两条协议对“谁说了算”的假设完全相反。

MCP 背后的世界观是 hub-and-spoke：总有一个 human，或者一个 orchestrator，在中间拍板。agent 是手，人是脑。工具被谁调、调完怎么用结果，都是中间那个决策点说了算。这也是 MCP 好上手的原因，它假设总有人兜底。

A2A 背后的世界观是去中心化的：你把活儿交给对面那个 agent，它自己说了算。怎么拆任务、用什么工具、要不要反过来问你，都是它的主意。你不是在调函数，你是在签外包合同。

这个差异不是技术细节，是哲学。它决定你怎么选型：系统天然有一个人或一个主控在决策，MCP 就够，别上 A2A 平添复杂度；要做的是好几个 agent 各有专长、互相委托、没有总指挥，那才是 A2A 的地盘。

我之前[读完 ByteByteGo 那篇《The Agent Loop》](https://ntlx.github.io/articles/agent-loop-reading-bytebytego)写过，循环里真正难的是控制权交出去之后怎么兜回来。MCP 和 A2A 的分歧，本质也是控制权的归属，留在人手里，还是交出去。

## 这题问错了

回到开头那张图。三个框并排，最容易让人以为这是个选型题。但看明白就懂，它其实是个分类题：你这一跳通信，是要接一个被动的工具，还是要找一个主动的同伴？

接工具，MCP。找同伴，A2A。两者还能叠着用，每个 agent 用 MCP 接自己的工具，agent 之间用 A2A 互相委托。

至于 A2A 现在到底该不该上：MCP 下载量级在 9700 万左右，A2A 进生产部署的组织大概一百五十家，差着几个数量级。这不是 A2A 不行，是结构性原因。MCP 接一个工具就能用，A2A 要多 agent 架构才有意义，而多 agent 在大多数公司还是个未来式。你如果就一个 agent 加一堆工具，老实待在 MCP，别被那张三框图催着上 A2A。

ACP 已经进了博物馆。顺带一提，现在开发者嘴里说的 ACP，多半指 Zed 那个连编辑器的协议，跟 IBM 这个早不是一回事了。2025 年底 Linux Foundation 成立 AAIF，MCP 和 A2A 同归其下。协议合并之后，名字会流动，但“谁接工具、谁找同伴”这个分层不会动。

*你现在的 agent stack，是已经到了需要 agent 互相委托的阶段，还是 MCP 一个人就够用？*

## 参考资料

* [ByteByteGo: MCP vs A2A vs ACP: How AI Agents Actually Talk to Each Other](https://blog.bytebytego.com/p/mcp-vs-a2a-vs-acp-how-ai-agents-actually)
* [ACP Joins Forces with A2A — Linux Foundation](https://lfaidata.foundation/communityblog/2025/08/29/acp-joins-forces-with-a2a-under-the-linux-foundations-lf-ai-data/)
* [Google: Announcing the Agent2Agent Protocol (A2A)](https://developers.googleblog.com/a2a-a-new-era-of-agent-interoperability/)
* [i-am-bee/ACP GitHub 仓库（已归档）](https://github.com/i-am-bee/ACP)
* [AI Agent Protocols Explained: MCP, A2A, and ACP — InventiveHQ](https://inventivehq.com/blog/ai-agent-protocols-mcp-a2a-acp)
* [A2A vs MCP: Different Jobs, Stop Conflating Them — StackA2A](https://stacka2a.dev/blog/a2a-vs-mcp-comparison)

## 延伸阅读

* [MCP 不是 USB-C，Pinterest 告诉你真正的门槛在哪](https://ntlx.github.io/articles/building-mcp-ecosystem-pinterest)
* [同一天，OpenAI、Runway、Google 都选了 MCP——一个协议的临界点](https://ntlx.github.io/articles/mcp-tipping-point)
* [MCP 和 Skills：给 AI 装手还是装脑子](https://ntlx.github.io/articles/mcpvsskillsclearlyexplained)
* [循环交出控制权之后：读 ByteByteGo《The Agent Loop》](https://ntlx.github.io/articles/agent-loop-reading-bytebytego)
