---
$schema: starlight
title: 给 GitHub Copilot 装上抓包代理后，我看到了 AI IDE 最贪婪的一面
description: 逆向抓包 GitHub Copilot 揭示了 AI IDE 的底牌：胜利不在于大模型 Benchmark，而在贪婪抓取上下文的客户端 Harness。但越界收集与明文存储，也正在将代码库安全推向悬崖。
date: 2026-08-12
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-12-github-copilot-mitm-harness-analysis-img-00-infographic-core-summary.png)

前 Hugging Face 工程师 Rafael Pierre 近日做了一项耐人寻味的逆向实验：他在 macOS 上用 `mitmproxy` 截获了 VS Code 与 GitHub Copilot 之间的全部 HTTPS 流量。

这项实验的初衷很简单——随着各类 AI 桌面应用（Cursor、Claude Desktop、ChatGPT Desktop）百花齐放，许多开发者发现自己的 Copilot 额度消耗得越来越快。但当抓包日志一屏屏刷过时，呈现在我们面前的却是一个令人震惊的系统现实：**在你尚未按下任何按键前，Copilot 已经在后台发起了密集的探索请求；而在你编写无关文件时，它甚至在偷偷读取你近期修改过的明文 `.env` 密钥。**

这篇文章不是单纯的抓包拆解，它为我们揭开了当前 AIIDE 开发最核心的演化趋势——上下文正在成为产品本身（Context is becoming the product），但客户端脚手架（Harness）的贪婪与无脱敏设计，也正在成为企业代码安全的最大隐患。

## 流量解耦：当你还没有打字，Copilot 已经在后台发了这些请求

现代 AI 桌面应用绝大多数基于 Electron 打造，共享 Chromium 网络栈与 Node.js 运行时。以 VS Code 为例，为了保障稳定性，它将插件环境完全隔离在独立的 Extension Host 进程中。但也正因如此，拦截这些流量只需要部署一个本地代理（如 `mitmproxy`），并配置代理覆盖规则即可。

通过分析启动阶段的抓包数据，我们能清楚看到 Copilot 在用户输入任何代码之前的完整“引导流”（Bootstrap）：

1. **凭证与鉴权交互**：先用 OAuth 换取短效 Token，校验用户订阅资质。
2. **双重模型与能力探索**：发起 `/models` 接口查询当前可用模型，紧接着向 `/agents/swe/models` 发起专门针对软件工程（SWE）Agentic 能力的模型探索。

更精妙的是它的**模型路由（Model Router）**机制。在 Auto 自动模式下，每次用户发送 Prompt 之前，Copilot 会先向 `/models/session/intent` 发送一个意图分类请求，对用户的输入进行评分（判断是属于代码生成 code-gen、调试 debugging、推理 reasoning 还是工具调用 tool-use）。根据意图打分结果，系统再自动将请求派发给性价比最高或能力最契合的底层大模型。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-12-github-copilot-mitm-harness-analysis-img-01-electron_mitm_architecture.jpg)

这种机制在之前讨论过的[别再折腾花哨的 AI 技巧了：为什么 GitHub AI 负责人说 Harness 才是全部？](https://ntlx.github.io/articles/github-copilot-the-harness-is-all-you-need)中得到了验证。底层模型固然重要，但如何在千毫秒级的时间窗口内完成分诊与路由，才是商业化 AI 工具控本与提升体验的关键。

## 越界读取：为什么屏蔽了 `.env` 依然防不住密钥上传？

实验中最令人脊背发凉的发现，发生在对“近期编辑”（Recent Edits）机制的审计中。

许多安全意识较高的开发者会在 IDE 中主动关闭敏感配置文件（如 `.env`）的 Copilot 自动补全。然而抓包结果证明，**这种单文件级别的关停策略在当前的 Harness 面前几乎形同虚设。**

Copilot 内部的 `recentEdits.tsx` 模块维护着一个全局滑窗（最多记录 20 个近期文件、8 次编辑摘要以及每次修改前后 3 行的上下文 diff）。当作者在一个完全无关的 `pyproject.toml` 文件中打字触发代码补全时，发给 API 的 Prompt 请求载荷（Payload）中，竟赫然包含了刚刚修改过的 `.env` 文件内容：

```json
{
  "prompt": "TEST_ENV_VAR_SECRET=\"mysecretenvvar\"\n\nT",
  "extra": {
    "context": [
      "Path: .env",
      "These are recently edited files...\nFile: pyproject.toml\n--- a/pyproject.toml\n+++ b/pyproject.toml\n+ # testing\n- --- IGNORE ---\nFile: config.ini\n"
    ]
  }
}
```

<!-- resin image placeholder -->

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-12-github-copilot-mitm-harness-analysis-img-02-context_leakage_diff_window.jpg)

为什么会这样？因为补全触发虽然发生在 `pyproject.toml`，但 Harness 在拼装 Prompt 时，会自动搜刮全局“最近编辑过的 diff”。在缺少客户端脱敏（Secret Redaction）的前提下，任何留在编辑器历史里的私钥、数据库连接串或 API Token，都有可能作为上下文被送往远程模型服务端。

开发者以为自己关掉了某个文件的开关，实际上 Harness 却在项目全局扫搜历史——这种认知反差，暴露了当前 AI 辅助工具在隐私隔离上的天然短板。

## 本地记忆库 Chronicle：明文写入 SQLite 的只读数据库

除了网络传输层的越界，Copilot 客户端的本地持久化设计也同样令人担忧。

在抓包拦截到的 System Prompt 中，出现了一个名为 `session_store_sql` 的工具定义。深入研究发现，这是 Copilot 内部 Chronicle 功能的一部分。它在本地磁盘维护了一个名为 `session-store.db` 的 SQLite 数据库（路径位于用户目录 `globalStorage/github.copilot-chat/` 下），里面建有 `sessions`、`turns`、`session_files` 和 `checkpoints` 等表。

当用户在 Chat 中提问“我这周做了什么？”时，大模型会主动调用 `session_store_sql`，利用只读 SQL 语句（如 `SELECT` / `FTS5 MATCH`）检索你过去的对话与代码历史。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-12-github-copilot-mitm-harness-analysis-img-03-sqlite_chronicle_storage.jpg)

然而，反查 `sessionStore.ts` 的写入源码会发现，系统在执行 `INSERT INTO turns` 时，直接将 `user_message` 与 `assistant_response` 以纯文本形式落盘：

```typescript
INSERT INTO turns (session_id, turn_index, user_message, assistant_response, timestamp)
VALUES (?, ?, ?, ?, ?)
```

整条写入路径没有经历任何正则过滤、掩码脱敏或加密模糊处理。你在聊天框里粘贴过的临时数据库密码、测试 GitHub Token，全部以明文保存在本地 SQLite 数据库中。

AI 编程工具正在快速从无状态的 API 代理，演变为高度依赖历史记忆的**有状态系统（Stateful Systems）**。但在追求上下文召回率的同时，本地存储的安全合规显然没有跟上架构演进的速度。

## 范式转移：逆向 Harness 教会我们的事

这项逆向实验带来的核心启发，远不止于暴露了几个安全漏洞。它清晰地表明：**上下文正在成为产品本身。**

大模型本身的 Benchmark 固然重要，但不同 AI 编程工具之间的真正壁垒，正在加速转向各自客户端 Harness 组装上下文的能力——如何精确抓取相关代码、如何管理短期与长期记忆、如何快速打分路由。

这也为所有构建 AI 应用的工程团队提出了两个硬课题：

1. **工程效率课题**：更多的上下文并不等于更好的上下文。如何在避免 Prompt 膨胀（Prompt Bloat）的前提下，精炼出高相关度的 Context？
2. **安全与合规课题**：Harness 越是贪婪地收集上下文，就越需要在客户端入口处建立零信任脱敏网关（Secret Redaction Gateway）。单靠文件后缀屏蔽是远远不够的，必须在数据离开客户端前完成 AST 级别与正则级别的隐私清洗。

逆向研究大模型的 Harness 机制，往往比直接研究大模型本身能学到更多东西。模型决定了能力的上限，而 Harness 决定了体验的下限与安全的底线。

***

*你在使用 Copilot 或 Cursor 等 AI 编程工具时，是否也曾关注过它们在后台传输与存储了哪些上下文？欢迎在评论区分享你的看法。*

## 延伸阅读

* [Copilot 真正在省的不是 token](https://ntlx.github.io/articles/copilot-context-model-routing)
* [AI 偷了考场答案：复盘 Hugging Face 前沿 Agent 侵入事件](https://ntlx.github.io/articles/hf-agent-intrusion-technical-timeline-analysis)

## 参考资料

* [I put GitHub Copilot Behind a MITM Proxy. Here's What I found.](https://www.lighthousenewsletter.com/p/i-put-github-copilot-behind-a-mitm)
* [Electron Architecture Overview](https://www.electronjs.org/docs/latest/architecture-overview)
* [mitmproxy - An interactive HTTPS proxy](https://mitmproxy.org/)
