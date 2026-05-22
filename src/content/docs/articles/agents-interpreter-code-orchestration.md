---
$schema: starlight
title: 给 Agent 一个解释器——为什么大家都在让模型写代码来调用工具
description: Agent 最擅长的是写代码，不是调工具。给一个窄运行时加显式桥，比给完整沙箱再限制更优雅。
date: 2026-05-22
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-22-agents-interpreter-code-orchestration-img-00-infographic-core-summary-1.png)

昨天 LangChain 发了一篇博客，Hunter Lovell 写的，讲他们在 Deep Agents 里加了解释器。看完之后我坐那儿想了一会儿——不是因为这个功能本身多惊艳，而是因为它把一个我一直没理顺的问题理顺了。

问题很简单：Agent 到底该怎么干活？

## 串行工具调用的天花板

我们做 agent 的时候最常见的模式是什么？model 调一个工具，拿到结果，想一下，再调下一个。每一步都是一次 model round-trip。工具少、步骤短的时候，这套很爽——清晰、好调试、出了问题一眼能定位。

但一旦步骤多了，就开始难受。

想象你要从一万份文档里筛出相关的十份，然后分别提取证据。串行模式下，每一轮搜索都要把结果塞回 context window，model 看完再决定下一步。中间数据越来越多，token 越烧越多，最后 model 的推理质量因为 context rot 开始下滑。更麻烦的是，很多中间步骤的结果只是为了给下一步用，根本不需要 model 去"理解"——但你还是得让它过一遍。

这不是 agent 能力不够，是交互模式本身有天花板。每一步都过 model，就像每条 SQL 都要人工审批再执行。流程是对的，但中间人太多了。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-22-agents-interpreter-code-orchestration-img-01-framework-interpreter-architecture.png)

## 起点的选择

Hunter 在这篇文章里点了一个我觉得很本质的设计决策。

大多数 agent 框架给 agent 能力的方式有两种：一是串行的 tool calling，一个工具一个工具地调；二是给一个完整的 sandbox（bash、文件系统、网络），让 agent 在里面随便跑。这两端各有各的问题：sandbox 能力强但难管理、难扩展、安全边界不好画；串行 tool loop 好调试但效率低、token 消耗大。

LangChain 的解释器插在中间。

关键的区别在于起点。

Sandbox 的起点是宽的——给 agent 一个像电脑的东西，然后从里面减能力：不能访问这个目录、不能跑这个命令、不能连这个端口。解释器的起点是窄的——给一个只有基本语言特性的运行时（对象、数组、JSON、控制流），然后从外面加能力：需要调工具？显式 bridge 一个。需要读文件？再 bridge 一个。

```
窄起点（解释器）：语言特性 → 显式 bridge → 更多 bridge
宽起点（sandbox）：  完整环境 → 权限限制 → 权限限制 → 权限限制
```

起点窄的好处是 action surface 小。你不用猜 agent 在 sandbox 里能干多少事——默认它什么都干不了，除非你主动给了。行为更可预测，测试更可重复，失败模式更清晰。Figma、Shopify、AWS 的系统都在用类似的架构：受限代码在一边，host 通过受控 API 边界暴露能力在另一边。

这个选择不是性能优化，是信任模型的不同。

## 第三层 Context

这篇文章最让我拍腿的地方不是 interpreter 本身，而是它补上的那个空缺。

做 agent harness 的人都知道 context 管理是核心难题。现有的框架通常分两层：message history 给 model 当下推理用，filesystem 给 agent 存持久化的东西——中间产物、笔记、工作记录。但这两层之间有一个空洞。

有些值，agent 需要在，但不需要 model 现在就看。

就像你在 REPL 里定义了一个变量——它还在那里，下一行可以直接用。你不需要把它打印出来、写到文件里、下一行再读回来。解释器 state 就是填上了这个空洞：数组、对象、计数器、队列、辅助函数，都留在 runtime 里。model 不需要看到每一个中间值，但随时可以让 interpreter 拿出来用。

```
message history  → model 即时推理用，贵，有注意力约束
interpreter state → 活跃工作值，不留 prompt，随时可用
filesystem       → 持久化工件，跨对话存活
```

这个三层模型不是 LangChain 发明的，是需求自己长出来的。当 agent 要干的活变长、变复杂，你自然会发现需要一种"活着的中间态"——不是历史，不是文件，就是纯粹的 working memory。REPL 的感觉和一次性命令不一样，原因就在这儿。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-22-agents-interpreter-code-orchestration-img-02-infographic-three-layer-context.png)

## 程序化工具调用

PTC（Programmatic Tool Calling）这个概念最早是 Anthropic 在 2025 年 11 月推的——model 在代码执行环境里写 Python 来调用工具，而不是一个一个地通过 model 来调。平均减少 37% 的 token，极端场景从 150K 降到 2K。

LangChain 的做法有意思：它把 PTC 做成了 middleware，不依赖任何特定 model 的 API。开发者传一个 allowlist，允许的工具出现在 interpreter 内部的 `tools` 命名空间下，每个工具都是 async 函数。早期测试省了 35% 的 token。

任何一个 model——包括开源的——都能享受到 PTC 的好处。你不用等模型提供商给你开放这个能力，harness 层面就能做到。

Cloudflare 的 Code Mode 也是同样的思路，Sunil Pai 讲得很直白：LLM 更擅长写代码，不是调工具。它们训练的时候看了几百万行真实代码，但 tool calling 的例子大多是人为构造的。让模型写代码去编排工具调用，比让它生成 JSON 参数要自然得多。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-22-agents-interpreter-code-orchestration-img-03-comparison-ptc-vs-traditional.png)

## 行业在收敛

回头看这几件事——Anthropic 的 PTC，Cloudflare 的 Code Mode，LangChain 的 Interpreter，还有 RLM（Recursive Language Models）的思路——它们在从不同方向指向同一个模式：

**给 model 一个小型的、受控的代码运行时，让它用代码来编排工作，而不是用自然语言一个一个地喊工具。**

这不是谁的专利，是问题本身长出来的形状。当 agent 要处理的任务从"查个天气"变成"分析一万份文档然后给我结论"，串行 tool calling 的天花板就露出来了。沙箱太重，单步太慢，中间就留下了一个解释器的位置。

Hunter 的文章里有一段我觉得值得反复看：

> 解释器的起点是窄的：agent 有一个语言运行时，能力是有意识地加回来的。这并不意味着能替代沙箱——当你的威胁模型需要进程或 VM 隔离时还是需要——但它意味着 agent 默认不会继承广泛的 host 访问权。

起点窄，不是功能少，是安全边界从"限制你能做什么"变成了"我只给你这个"。第二种思路更容易推理，也更容易测试。

## 几个没展开的问题

我做 AI Coding 工具的时候也反复碰到这个问题：怎么让 agent 做复杂的事，又不给它太多的绳子？LangChain 这个解释器的答案我觉得是对的——起点收窄，能力按需注入，中间状态有自己的家。

但有一个问题文章没有展开讲：解释器的代码是谁写的？model 写的。model 写的代码可能包含 bug、无限循环、或者故意/意外地耗尽资源。LangChain 做了基本的运行时控制——内存限制、超时、最大工具调用次数——但 QuickJS 的 snapshot 持久化在早期版本中甚至没有大小限制，后来才补上。这是所有解释器方案都要面对的：你的约束层必须比 agent 聪明一步。

另外，interpreter 和 sandbox 不是互斥的。在 Deep Agents 里，它们是可以同时存在的中层。最底层是串行 tool calling，中间是解释器，最上层是完整沙箱。不同复杂度的任务落在不同的层上。这才是完整的谱系。

做 agent 的人迟早会遇到这个选择：让它一步一步地走，还是给它一块画板？LangChain 的答案是，给一块很小的画板，画框在哪它说了算。

*你怎么看？在你的 agent 项目里，是串行 tool calling 够用，还是需要解释器/沙箱这一层？欢迎聊聊你踩过的坑。*

## 原文参考

> Hunter Lovell, "Give Your Agents an Interpreter", LangChain Blog, 2026-05-20
> https://www.langchain.com/blog/give-your-agents-an-interpreter
