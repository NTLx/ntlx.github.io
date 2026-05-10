---
$schema: starlight
title: Agentic Workflow 烧掉的钱去哪了？GitHub 用 Agent 优化 Agent 的实战复盘
date: 2026-05-08
description: 把不需要推理的工作移出推理循环，才是 agent 降本的真正答案。
coverImage: cover.png
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-08-token-efficiency-img-00.jpg)

你到底有多久没看过 CI 账单了？

我说的是，你的自动化 workflow，每次跑在 GitHub Actions 上，背后那些 LLM API 调用到底烧了多少 token —— 你大概率不知道。因为它太安静了。按一个 PR 触发一次，你甚至不用在场，它自己跑完、自己报告、自己悄悄把你的 API 额度吃掉。

昨天 GitHub 发了篇博客，两个研究员 Landon Cox 和 Mara Kiefer 写了自己团队怎么系统性地干这件事。他们维护着上百个 agentic workflow，跑在自己的仓库里做日常维护和 CI，每天都在烧真金白银。2026 年 4 月，他们开始认真做 token 优化。

我觉得这篇文章是个挺好的切片 —— 不是因为它技术有多深，而是因为它揭示了一个很容易被忽视的问题：**Agentic workflow 的 token 成本问题不是模型问题，是工程思维问题。真正的优化不在模型层面，而在于——把不需要推理的工作，移出推理循环。**

## 先搞清楚钱烧在哪

优化之前得先知道怎么用的。这件事本身就有门槛。

团队面对的第一个问题是：每个 agent 框架 —— Claude CLI、Copilot CLI、Codex CLI —— 输出的日志格式都不一样，历史数据也不完整。你没法直接对比，也没法统一统计。

好在他们的安全架构里有个 API 代理，所有 agent 的 LLM 调用都经过这个代理，本来是为了防止 agent 直接拿到认证凭证。这个代理顺带提供了一个意外好处：能在一个地方统一捕获所有框架的 token 使用数据，格式标准化。

于是每个 workflow 开始输出一个 `token-usage.jsonl` 文件，每条记录包含输入 token、输出 token、缓存读写 token、模型、provider、时间戳。把这些数据和 workflow 日志放在一起，就能看清每个工作流历史上一贯花多少钱、每一块钱花在哪。

**这一步最值钱的地方不是技术实现，是思维转变：把 token 当成可观测的工程指标，而不是 AI 的"黑盒成本"。**

## 用 Agent 优化 Agent

有了数据之后，他们又做了两个新的 workflow：

一个叫 **Daily Token Usage Auditor** —— 每天跑，读最近所有 workflow 的 token 使用记录，按 workflow 聚合，生成结构化报告。标记异常消耗的工作流、找出最贵的 TOP N、注意反常跑法（比如本来 4 个 LLM turn 完成的事，突然用了 18 个 turn）。

Auditor 一标出来，另一个叫 **Daily Token Optimizer** 的 workflow 就上场了。它去读问题 workflow 的源码和最近的日志，直接在 GitHub 上开 issue，描述具体的低效问题，给出优化建议。

妙的地方在哪？Auditor 和 Optimizer 自己也是 agentic workflow，它们自己也烧 token，自己的消耗也出现在每日报告里——这形成了一个小的自循环。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-08-token-efficiency-img-02.jpg)

**反过来想：如果你的 agent 产品都不能用 agent 来优化自己，那它可能还不够"agentic"。**

## 最常见的问题：把不需要的工具晾在那里

Auditor 和 Optimizer 跑了之后，发现最普遍的低效问题不是写的代码太烂，不是 prompt 太长，而是：**注册了大量 MCP 工具，但根本不用的。**

需要理解一下 MCP 是怎么运作的。LLM API 是无状态的，每次调用 agent runtime 都会把 MCP 工具的函数名和 JSON Schema 塞进请求的上下文里。一个 GitHub MCP server 有 40 个工具，每次请求就要多带 10-15 KB 的 schema。agent 可能只用到其中 2 个，但剩下 38 个跟着每一轮对话白烧 token。

Optimizer 的做法很直接：交叉比对工具清单和实际调用记录，找出从来没用过的工具，建议从配置里砍掉。他们在 smoke-test 里砍完，MCP 配置每轮调用减了 8-12 KB，单次 run 省几千 token。

这其实是一个典型的"默认行为陷阱"。写 workflow 的人一开始把全套工具都挂上是路径最短的做法——让 agent 自己去挑需要哪个。问题是，一旦 workflow 稳定了，它用的工具就固定下来了，而那些没用的工具从来没有被主动清理。

**像项目依赖一样对待 MCP 工具：定期审查，只留真用的。**

## 更大的优化：把数据抓取踢出推理循环

砍未使用工具只是打扫卫生。更有价值的发现是：很多 MCP 调用做的事情根本不是"推理"。

拉 PR diff、读文件内容、读 review 评论……这些是确定性数据获取。但你通过 MCP 工具调它，agent 要先决定"我要调这个工具"，然后构造参数，等返回结果，把结果读进上下文——这是一整个 LLM 推理往返，每一步都在烧 token。

换成一个 `gh pr diff` 命令 —— 就是一个 HTTP 请求打到 GitHub REST API，不涉及任何 LLM。

他们用了两种手段迁移：

1. **agent 跑之前先拉数据**：PR diff、文件变更列表这些 agent 必然会用的数据，在 workflow 开头用 `gh` 命令直接拉到 workspace 文件里，agent 通过读文件拿数据，不走 MCP。
2. **agent 跑的时候用 CLI 代理**：需要运行时动态决定拉什么的情况，用一个透明 HTTP 代理把 `gh` 命令转成 API 调用，agent 不接触 token，也看不到认证信息。

这两招把数据抓取基本上踢出了 LLM 的推理循环。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-08-token-efficiency-img-01.jpg)

**底层的逻辑是：不要因为 LLM 能做，就让它做。区分"推理"和"数据搬运"——前者烧 token 值，后者烧就是浪费。**

## 效率到底怎么算

一旦开始优化，就碰到一个更棘手的问题：你怎么知道效率真提升了？

少烧 token 不等于更高效 —— 也可能是模型换差了、工作做少了，质量下降了。

他们设计了一个 **Effective Tokens（ET）** 来衡量：

```
ET = m × (1.0 × I + 0.1 × C + 4.0 × O)
```

* `m` 是模型价格系数：Haiku 0.25、Sonnet 1.0、Opus 5.0
* `I` 是新输入 token
* `C` 是缓存命中 token，权重只有 0.1（便宜）
* `O` 是输出 token，权重 4.0（最贵）

这个公式把不同模型的"裸 token 数量"换算成"等效成本"。10% 的 ET 减少 → 真实 10% 的成本减少。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-08-token-efficiency-img-03.jpg)

他们还同时监控 LLM turn 数来控制"工作量"：turn 数不变 + token 数下降 = 真效率提升；turn 数和 token 数一起下降 = 可能只是干少了活。

效果：

* Auto-Triage Issues：**-62%** ET，109 次跑，日均 6.8 次——累计省了约 780 万 ET
* Security Guard：**-43%** ET
* Smoke Claude：**-59%** ET（砍 MCP 工具 + 切 Haiku）
* Daily Compiler Quality：**-19%** ET
* Community Attribution：**-37%** ET

9 个被优化的 workflow，5 个拿到了 19%～62% 的改善。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-08-token-efficiency-img-04.jpg)

## 三个值得记住的教训

**很多 agent turn 是在做数据搬运。** Auto-Triage 的优化效果最猛，核心就是把确定性的数据抓取移到了 agent 启动之前。Security Guard 加了个相关性判断——不涉及安全敏感文件的 PR 直接跳过 LLM。

**用不着的工具就该卸。** Glossary Maintainer 在一个 run 里调了搜索工具 342 次，占所有工具调用的 58%，但这个工具对 workflow 来说完全不需要——它只是扫描本地文件变更。

**一个配置错误能导致失控循环。** Daily Syntax Error Quality 曾经是项目里最贵的 workflow。根因：一行配置错误，agent 需要的命令被 sandbox 的 bash 白名单拦截了，agent 掉进了一个 64 turn 的 fallback 循环，开始手动读代码逐行推断。改一行配置就解决了。

**跑得勤比跑得贵更关键。** Auto-Triage 日均 6.8 次，62% 的节约意味着可观的真金白银。优化排优先级时，频率和单价一样重要。

## 从点状优化到结构优化

GitHub 团队说下一阶段要做两件事：

一是 **episode-level** 分析。一个 workflow run 其实不是平坦的一串 API 调用，它是由一个个"片段"组成的链：收集上下文、读已有产物、失败重试、最终输出。看清楚了片段，才能问：哪一段最贵？哪一段其实是重复劳动？哪一段应该完全去掉 agentic？

二是 **portfolio-level** 分析。一个仓库不是跑一个 workflow，是一个舰队。不同 workflow 经常被同一事件触发，读同一份 diff，做相邻的判断。这意味成本不是单个 workflow 的属性，而是交叉重复的叠加。哪些可以共享缓存？哪些可以合并？哪些中间产物可以复用？

这两个方向才是真正的纵深——点状优化做到头了，就该做结构性优化了。

***

你看完可能会想："我又没跑这么大一堆 agentic workflow，跟我有关系吗？"

有关系。token 消耗不是"规模大了才需要关心"的问题。只要你在用 agent —— 不管是 Claude Code、Copilot Agent、Cursor —— 每次调用背后都在用类似 MCP 的方式和工具交互，每次交互都在烧 token。理解你烧掉的 token 里有多少是"推理"、有多少是"数据搬运"，是每个用 agent 的开发者的必修课。

**你最近看过 CI 账单吗？有没有发现过某个 workflow 莫名其妙烧了很多钱？**

## 原文参考

> Landon Cox & Mara Kiefer. **Improving token efficiency in GitHub Agentic Workflows**. The GitHub Blog.
> <https://github.blog/ai-and-ml/github-copilot/improving-token-efficiency-in-github-agentic-workflows/>
