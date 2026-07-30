---
$schema: starlight
title: 当 MCP 遇上 Web 端：看 Claude 与 ChatGPT 如何撕开工具集成的两面性
description: Simon Willison 将个人数据库 MCP 接入 Claude 与 ChatGPT Web 端。这场实操不仅曝出两家 AI 巨头在 UI 与安全机制上的巨大落差，更揭示了通用协议落地时“客户端体验”对生态命脉的决定性影响。
date: 2026-07-30
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-30-mcp-in-claude-and-chatgpt-img-00-infographic-core-summary.png)

模型上下文协议（Model Context Protocol，简称 MCP）自推出以来，一直被视为打破 AI 工具孤岛的统一语言。大部分开发者对 MCP 的感知，始于本地桌面端——在配置文件中写入一段标准 JSON，就能让 Claude Desktop 访问本地文件系统或数据库。然而，当 MCP 从本地 stdio 转向云端 HTTPS，当接入载体从桌面客户端走向网页浏览器时，大模型平台对这一开放协议的接受姿态出现了剧烈分化。

知名技术博主、Datasette 开源项目作者 Simon Willison 最近进行了一项极具代表性的测试：将他为个人网站 SQLite 数据库搭建的只读 MCP 服务（`https://datasette.simonwillison.net/-/mcp`），分别接入 Claude.ai 和 ChatGPT.com 的 Web 界面。测试过程暴露出了两家平台在功能设计、安全治理与生态战略上的深刻落差。

## 1. 从 Stdio 到 Remote HTTP：MCP 的 Web 化关卡

在桌面端，MCP 主要依赖进程间的 stdio 管道传输指令。这种模式安全性高，但要求模型客户端与数据源运行在同一台机器上。要让网页端的 Claude 或 ChatGPT 使用 MCP，就必须建立跨网络的 Remote MCP 连接（通常基于 HTTP SSE 握手）。

Simon 搭建的测试节点基于开源项目 `datasette-mcp`。该节点开放了一个标准的 HTTPS 访问入口，允许大模型在不需要复杂 OAuth 握手的前提下，直接对其博客后台数据库的副本发起只读 SQL 查询。理想状态下，这类 Remote MCP 服务应该能够像浏览器输入 URL 一样，被所有主流 AI Web 网页轻松调用。

然而，在实际配置过程中，两家平台的差异从第一步就拉开了距离。

## 2. Claude 的接入体验：把 MCP 升级为基础设施

作为 MCP 协议的发起者，Anthropic 在 Claude.ai 的网页端给予了 MCP 极高的优先权。在其界面体系中，MCP 被定位为一种原生基础设施，统称为“Connectors”。

在 Claude.ai 中添加自定义 MCP 的流程十分顺畅：

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-30-mcp-in-claude-and-chatgpt-img-01-claude_connectors_menu.webp)

1. 在对话框左下角的 **+** 菜单中，直接点击 **Connectors** 选项；
2. 菜单随之展开内置集成以及自定义 Connector 的入口，选择 **Add custom connector**；
3. 在弹出的模态框中填写服务名称与服务器 URL，即可完成添加。

<!-- `02-claude_add_custom_connector_dialog` -->

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-30-mcp-in-claude-and-chatgpt-img-02-claude_add_custom_connector_dialog.webp)

在整个配置过程中，用户只需要关注服务名称与访问端点。模态框中虽然预留了高级鉴权设置选项，但如果不涉及鉴权，填写完 URL 后点击保存即可立即生效。添加成功后，用户在对话输入框的 Connectors 列表中随时可以通过开关控制该 MCP 的开启状态。

这种设计反映了 Anthropic 的核心战略：将 MCP 视作基础能力层。不强加繁琐的资质审核，不人为制造 UI 阻碍，把控制权直接交还给用户。

## 3. ChatGPT 的接入体验：繁琐的“开发者模式”与旧框架重用

与 Claude 的顺滑相比，ChatGPT 在 Web 端接入自定义 MCP 的体验则充满了阻碍。

首先，用户无法在常规界面中找到任何添加 MCP 的选项。要使用自定义 MCP，必须先进入账号设置的 **Security and login**（安全与登录）面板，手动打开 **Developer mode**（开发者模式）开关。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-30-mcp-in-claude-and-chatgpt-img-03-chatgpt_settings_developer_mode.webp)

开启该开关时，界面会亮起醒目的 **ELEVATED RISK**（高风险）红色警告，告知用户未验证的连接器可能会修改或擦除数据。

在开启开发者模式后，寻找到具体的添加入口依然像是一场“解谜游戏”。添加按钮并未出现在聊天主界面，而是隐蔽地放置在 ChatGPT Plugins（插件）目录页面的右上角：

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-30-mcp-in-claude-and-chatgpt-img-04-chatgpt_new_plugin_dialog.webp)

点击右上角小小的 **+** 按钮后，弹出的窗口依然被称为 **New Plugin**——这表明 OpenAI 在 UI 层面依然将 MCP 归类为已逐渐边缘化的“插件”体系。在此处，用户需要选择无鉴权模式（No Auth），并再次勾选免责声明以确认风险。

即便是完成了配置，在对话中使用该 MCP 依然需要多重步骤：

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-30-mcp-in-claude-and-chatgpt-img-05-chatgpt_connect_consent_modal.webp)

在输入框点击加号后，用户必须手动输入 MCP 的名称进行搜索并选中。发送第一条查询指令时，界面会先弹出一个内联确认卡片；点击确认后，系统还会弹出另一个视觉设计精致但增加了点击层次的授权确认弹窗（Connect consent modal）。

从高风险警告、隐藏在插件目录深处的入口，到两次二次授权弹窗，OpenAI 在用户体验中设置了极高的壁垒。这种设计反映出 OpenAI 在面对开放协议时的矛盾心态：既希望保留对插件生态与模型安全的绝对控制权，又不得不面对社区对 MCP 协议日益高涨呼声的权衡。

## 4. 盲点与未来：当实时语音遇到了无状态 API

Simon Willison 在测试中还发现了一个关键盲点：**ChatGPT 的高级语音模式（Advanced Voice mode）暂不支持调用任何配置好的 MCP 工具。**

他原本设想通过语音与 ChatGPT 对话，让大模型在后台直接查询 SQLite 数据库并口述返回结果。但在实际测试中，语音模式启动后，所有已连接的 MCP 工具均处于不可用状态。

这一现象揭示了当下生成式 AI 架构中的一道技术壁垒：端到端实时音频模型（如 OpenAI 的 Realtime API）追求的是超低延迟的流式响应，而 MCP 工具调用通常依赖传统的 JSON-RPC 异步请求。如何将高延迟的外部 HTTP 工具链完美嵌入到低延迟的语音流中，依然是整个行业尚未解决的难题。

## 5. 结语与思考：协议标准之外，交互才是临界点

MCP 作为一个开源协议，其价值在于降低了工具集成的标准化成本。正如我们在[同一天，OpenAI、Runway、Google 都选了 MCP——一个协议的临界点](https://ntlx.github.io/articles/mcp-tipping-point)中所探讨的，当所有大厂都在底层协议上达成一致时，竞争的焦点必然会从“支持不支持协议”转移到“客户端体验的完整度”。

正如[AI 什么都做不了，除非你让它做](https://ntlx.github.io/articles/connecting-llms-to-the-real-world-t)所阐述的逻辑，模型的智能终究需要落地到与现实数据的交互中。Anthropic 将 MCP 作为基础设施直接缝合进产品体验的核心，而 OpenAI 则将其视作需要层层警戒的开发者插件。

对于开发者和企业而言，不仅要关注如何构建高质量的 MCP Server，更需要意识到客户端体验对生态推广的巨大影响。当协议壁垒被打破后，哪家平台能提供最轻量、最安全的接入链路，谁就能在智能体生态的下一个阶段中占据主导。

你在使用 Claude 或 ChatGPT 接入外部 MCP 工具时遇到过哪些体验痛点？你更倾向于极简的原生接入，还是强调安全隔离的开发者模式？欢迎在评论区分享你的看法。

## 参考资料

* [Adding a custom MCP server to Claude and ChatGPT - Simon Willison](https://til.simonwillison.net/llms/mcp-in-claude-and-chatgpt)
* [Model Context Protocol Specification](https://modelcontextprotocol.io/)
* [datasette-mcp GitHub Repository](https://github.com/datasette/datasette-mcp)
