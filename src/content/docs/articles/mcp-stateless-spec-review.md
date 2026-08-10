---
$schema: starlight
title: MCP 2026-07-28 规范解读：当协议走向无状态，Agent 才真正迎来了成人礼
description: MCP 2026-07-28 规范彻底废除 Session ID 与握手协议，引入 MRTR 与 Header 路由。这意味着 Agent 协议从“桌面 Demo 玩具”彻底迈向“云原生无状态基础设施”。
date: 2026-08-10
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-10-mcp-stateless-spec-review-img-00-infographic-core-summary-1.png)

模型上下文协议（Model Context Protocol, MCP）官方博客发布了全新的 **2026-07-28 规范**。这是 MCP 自 2024 年末诞生以来最具划时代意义的一次架构重构。

表面看，这次更新改动不少：官方 SDK 累积月下载量已冲破 5 亿大关，TypeScript 和 Python SDK 双双破 10 亿次；云巨头如 AWS Bedrock AgentCore、Cloudflare Workers、Supabase、Figma 以及 FastMCP 4.0 都在发布第一时间做出了部署支持。但在这些繁华的生态声明背后，**最核心的变革只有一个词：无状态（Stateless）。**

MCP 正在从一个基于双向持久流、带 Session 握手的有状态连接机制，全面转向纯粹基于请求/响应的 **无状态协议核心（Stateless Protocol Core）**。

正如我们在 [《同一天，OpenAI、Runway、Google 都选了 MCP——一个协议的临界点》](https://ntlx.github.io/articles/mcp-tipping-point) 中探讨过的，当协议跨过生态临界点之后，真正的考验不在于“有多少人在用”，而在于“能不能在生产环境的浩瀚高并发下活下来”。这次 2026-07-28 规范的发布，正是 MCP 协议彻底摆脱桌面 Demo 玩具身份、走向云原生企业基础设施的真正成人礼。

## 有状态连接：云原生与 Serverless 的生产噩梦

在旧版的 MCP 规范中，客户端与服务端交互前必须经历一段繁琐的 `initialize` / `initialized` 双向握手，并在传输层维护一个 HTTP `Mcp-Session-Id`。

如果在本地开发环境，用 Claude Desktop 连接一个本地运行的 Python 或 Node.js 进程，这种设计没有任何问题。但一旦试图把 MCP 部署到生产环境——比如部署到 Cloudflare Workers、AWS Lambda 等按量计费的 Serverless 节点，或是 Kubernetes 容器集群中——有状态架构立刻就变成了灾难：

1. **无法弹性缩容到 0**：Serverless 的精髓在于“无请求时不消耗资源”。而维持 Session ID 意味着节点不能随时销毁，否则客户端的长连接会被强行打断。
2. **需要复杂的粘性会话与共享存储**：为了保证后续请求落到同一个 Server 实例，集群必须配置 Sticky Session，或者在后端挂载昂贵的 Redis 来同步 Session 状态。
3. **Pod 滚动更新引发连接雪崩**：每当服务端代码更新部署、Pod 重新启动，成千上万挂载在旧节点上的客户端连接瞬间失效。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-10-mcp-stateless-spec-review-img-01-stateful_vs_stateless_flow-1.png)

2026-07-28 规范做出了一个极其果断的决定：**彻底废除 `initialize` 握手与 `Mcp-Session-Id` 报头（SEP-2575, SEP-2567）。**

在新的无状态核心下，每一个 HTTP 请求都是完全自包含（Self-describing）的。客户端的协议版本、身份标识、功能宣告（Capabilities）全盘压入请求体内的 `_meta` 字段中。客户端如果想了解服务端的的能力，可以发起可选的 `server/discover` 调用；但不做这个调用，也完全可以直接发起 Tool Call。

这意味着：**任何一个 MCP 请求，都可以直接落到标准 Round-Robin 负载均衡器后面的任意一台服务器实例上。** 后端不需要 Redis，无需 Sticky Session，节点死掉或随时弹性缩容到 0，都不会影响下一次请求的成功响应。

至于业务上确实需要跨 Tool 传递的状态，新规范给出的哲学是：**传输层归传输层，业务层归业务层**。如果你的工具需要追踪数据库游标或事务上下文，应该由工具在首次调用时显式返回一个 State Handle，让大模型在后续的 Prompt 参数中显式带回。模型能看见 Handle，反而比藏在传输层底部的隐式 Session 更容易理清逻辑。

## MRTR：无状态下如何优雅处理反向交互？

摆脱 Session 之后，立刻会遇到一个核心矛盾：**在纯 HTTP 请求/响应模型中，当服务端在执行 Tool 的中途需要向客户端反向要数据时，该怎么办？**

在旧版协议中，诸如 Elicitation（用户确认/审批）、Sampling（要求模型二次采样）或 Roots 列表查询，都是由服务端通过持有的长连接流直接“主动发起”请求给客户端的。一旦切断长连接，这种服务端主动 Call 的能力就不复存在了。

为了解决这个难题，2026-07-28 规范引入了 **MRTR（Multi Round-Trip Requests，多轮次请求，SEP-2322）**。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-10-mcp-stateless-spec-review-img-02-mrtr_challenge_response-1.png)

MRTR 的机制极其巧妙地复刻了 Web 架构中经典的 Challenge-Response 模式：

- 当 MCP 服务端在处理某个工具调用（例如 `tools/call` 执行转账）时，如果发现需要用户在前端界面点击二次确认，服务端**不再悬挂连接**，而是立刻返回一个 `resultType: "input_required"` 的响应，其中附带了需要解答的问题（Prompts）以及当前调用的未完成上下文句柄。
- 客户端（如 AI 客户端或 Agent 框架）捕获到 `input_required` 后，暂停当前的链条，弹出 UI 提示用户确认或补全缺失参数。
- 用户操作完成后，客户端**重新发起**初始的 `tools/call` 请求，并将用户的输入包装在 `inputResponses` 参数中回传。

在这个过程中，两次 HTTP 请求依然是纯粹无状态的。第二次带着答案回传的请求，即使打到了分布在不同数据中心的另一台 Server 节点上，节点也能根据自包含的上下文句柄无缝继续执行。

正如 Supabase 产品负责人 Inian Parameshwaran 所言：“我们一直想在 Supabase MCP 中支持 Elicitation，但因为 Supabase MCP 是无状态运行的，过去根本做不到。MRTR 彻底改变了这一点——它让工具在新建项目计费或执行删除数据的危险查询前，能以纯无状态的方式优雅地向用户确认。”

官方在发布博文中附带了一段轻量 Demo 视频（`stateless-core-demo.mp4`），清晰展示了基于无状态 HTTP POST 发起 `tools/call` 的即时响应过程，证明了去掉 Handshake 后的简洁与强悍。

## 报头路由与缓存：让 Web 基础设施重新接管

除了无状态核心与 MRTR，2026-07-28 规范在基础设施亲和力上还做出了多项硬核微调：

### 1. HTTP Header 级路由与鉴权（SEP-2243）
在过去，所有 MCP 请求的 HTTP 报头几乎一模一样，具体调用的方法（如 `tools/call`）和工具名称（如 `search`）深埋在 JSON-RPC 的 Body 报文里。API 网关（如 Kong、Envoy、Cloudflare API Gateway）或者 WAF 想要做路由分发或按工具限流，必须对每一个 HTTP POST 请求做全文 JSON 解包，性能损耗巨大。

新规范规定：**Streamable HTTP 请求必须在 Header 中显式带上 `Mcp-Method` 与 `Mcp-Name`**：

```http
POST /mcp HTTP/1.1
MCP-Protocol-Version: 2026-07-28
Mcp-Method: tools/call
Mcp-Name: search

{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"search","arguments":{"q":"mcp"},"_meta":{"io.modelcontextprotocol/clientInfo":{"name":"my-app","version":"1.0"}}}}
```

现在，网关不用解包任何 JSON 体，只需读取 HTTP Header 就能在 7 层实现极速路由、精准限流与按工具隔离鉴权。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-10-mcp-stateless-spec-review-img-03-header_routing_gateway.png)

### 2. 列表响应可缓存（SEP-2549）
`tools/list`、`prompts/list`、`resources/list` 的响应现在支持 `ttlMs`（缓存过期时间）与 `cacheScope` 属性。客户端可以安心缓存工具目录，不仅大幅减少了不必要的重复网络开销，更重要的是保证了工具列表的**决定性排序（Deterministic Order）**，避免了因为重连拉取导致上游大模型 KV Prompt Cache 失效的问题。

### 3. 安全鉴权硬化与 CIMD 演进
安全方面，规范强制 OAuth 授权服务器遵循 RFC 9207 校验 `iss` 参数（SEP-2468），消除了多 OAuth Server 混淆攻击；在动态客户端注册（DCR）中引入 `application_type`（SEP-837），解决了命令行 CLI 和桌面应用在 `localhost` 回调时频频报错的长期痛点。更重要的是，规范正式宣布废弃 DCR，全面转向 **Client ID Metadata Documents (CIMD)** 标准。

在 [《MCP、A2A、ACP：这根本不是一道选择题》](https://ntlx.github.io/articles/mcp-a2a-acp-not-a-multiple-choice) 中我们曾指出，协议的终局不在于谁的概念更新颖，在于谁能无缝融入现代互联网的安全与基础设施生态。MCP 这次在 RFC 9207、CIMD 以及 12 个月平滑废弃窗口（Deprecation Policy）上的收敛，充分体现了其 Maintainer 团队对企业级生态演进规律的透彻理解。

## 结语：协议长大的声音

纵观互联网发展史，无数协议都经历过类似的镇痛：从早期的 Telnet、FTP 到 HTTP/1.1，从有状态的连接绑定到无状态的 RESTful 架构。

在 AI Agent 浪潮发展的早期，大家急于验证 Demo，把 Session、Handshake 和长连接当作“理所当然”的拐杖。但当大模型真正深入企业生产、当成千上万的 Agent 需要在边缘节点同时调度海量工具时，那些曾经带来便利的“拐杖”，全都变成了沉重的枷锁。

MCP 2026-07-28 规范的重塑，用极其惊艳的哲学拆解了这道难题：**连接是有成本的，状态是有毒的。把状态留给 Prompt 与存储，把传输彻底交还给无状态 HTTP。**

当一个协议开始主动放弃曾经的便利、勇敢进行破坏性打破（Breaking Changes），并为开发者提供严谨的 12 个月过渡缓冲时，我们听到的，正是基础设施真正长大的声音。

*在你的企业或 Agent 项目中，是否也曾被有状态连接或 Sticky Session 困扰过？面对 MCP 2026-07-28 的无状态重构与 MRTR 机制，你最期待将哪类工具部署到 Serverless 边缘端？欢迎在评论区分享你的看法。*

## 参考资料

- [The 2026-07-28 Specification - Model Context Protocol Blog](https://blog.modelcontextprotocol.io/posts/2026-07-28/)
- [SEP-2575: Retire initialize handshake and session headers](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2575)
- [SEP-2322: Multi Round-Trip Requests (MRTR)](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2322)
- [SEP-2243: Header-based routing for MCP HTTP transport](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2243)
- [SEP-2549: Cacheable list results with TTL and scope](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2549)

## 延伸阅读

- [同一天，OpenAI、Runway、Google 都选了 MCP——一个协议的临界点](https://ntlx.github.io/articles/mcp-tipping-point)
- [MCP、A2A、ACP：这根本不是一道选择题](https://ntlx.github.io/articles/mcp-a2a-acp-not-a-multiple-choice)
- [Agent 的新入口：它能看见谁](https://ntlx.github.io/articles/agentic-resource-discovery)
- [Copilot 真正在省的不是 token](https://ntlx.github.io/articles/copilot-context-model-routing)
