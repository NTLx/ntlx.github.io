---
$schema: starlight
title: Claude Code 会话变长后，账单该按任务结果算
description: Claude Opus 5.5 的长会话成本估算同时依赖降价、缓存和少走弯路。衡量 Agent 是否省钱，应看完成任务的用量、返工与耗时。
date: 2026-09-28
category: ai-coding
primarySourceUrls: ["https://claude.com/blog/claude-opus-5-5-built-for-coding-sessions-that-use-more-context"]
---

Anthropic 9 月 24 日发布的文章把两个变化放在一起：Claude Code 的会话更长、每次请求带入的上下文更多；Opus 5.5 在典型按 token 计费任务上的运行成本，估计低约 40%。这组数字很容易被读成“上下文多了，花费反而更低”。我读完之后更想问，40% 具体省在哪里，换成自己的代码任务还能不能成立。

我的判断是，长会话的成本不能只看 token 单价。缓存能降低重复读取的价格，模型少走弯路也可能减少回合；这两件事要在任务完成之后一起核算。Anthropic 的数据提供了一个解释方向，具体结果还得回到自己的项目里测。

![长会话成本估算的结构示意：token 单价、缓存读取与模型回合影响任务成本，结果需在自己的任务中验证](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-28-opus-5-5-context-sessions-img-00-infographic-core-summary.png)

## Anthropic 的 40% 是任务估算

文章引用 Anthropic 对 Claude Code 2026 年 3 月至 9 月使用情况的聚合数据：每次请求的上下文增至 2.6 倍，输入与输出 token 比从 189:1 变成 324:1。趋势图还列出每个 prompt 的工作时长增至 3.3 倍、模型调用多 40% 以上、中断少 68%，以及开发者更常接工具服务器或使用 Skill、较少直接粘贴文本等变化。

![Anthropic 汇总的 Claude Code 2026 年 3 月至 9 月使用趋势（每个 prompt 的工作时长、模型调用、中断与上下文变化）](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-28-opus-5-5-context-sessions-img-source-session-trends.png)

这些数据描述的是 Claude Code 的厂商内部用量。页面没有列出样本规模、统计口径或独立审计，不能直接推成所有编码 Agent 都在这样使用。图表能说明 Anthropic 观察到了什么，不能单独证明为什么发生，也不能替别的开发者预言账单。

Opus 5.5 的成本变化也分成两层。Anthropic 称按 token 计费时，输入和输出单价各降 20%，缓存读取降 60%；“典型任务低约 40%”则是另一项估算，除单价外还计入模型在任务中的 token 用量变化。Anthropic 的发布说明特意提醒，这不是 token 单价本身下降 40%。

因此，我会把 40% 当成一个需要在本地复算的任务成本估计。它有明确的产品和用量前提，不能视作每次调用都能拿到的折扣。

## 缓存降低前缀复用成本，新内容仍计入用量

编码 Agent 的一轮对话会带上系统提示、项目说明、此前读过的文件和工具返回。当前缀保持一致时，提示缓存可以复用之前处理过的部分；新出现的文件内容、命令输出和模型回复仍会进入后续请求。缓存降低了重复前缀的读取成本，也让上下文能在长会话里反复出现，但它没有让上下文变成免费资源。

Claude Code 的官方文档还说明，缓存有效期与计费方式、请求类型有关。订阅计划内的主会话默认可使用一小时 TTL；按量 API key 或云服务主会话默认是五分钟，也可以自行设置一小时。把“一小时缓存”当作所有环境都自动启用，会高估缓存能覆盖的范围。

我此前在[一篇关于 Anthropic 精简 Claude Code 系统提示的文章](https://ntlx.github.io/articles/claude5-context-rules-bandages)里讨论过上下文中哪些约束已经没有必要。这次的成本问题多了一层：保留下来的上下文是否会被重复读取，缓存机制能否降低这部分开销。前者关乎内容是否有用，后者关乎重复处理的价格，两者需要分别看。

## 模型少走弯路，才可能降低任务用量

降低缓存读取单价只覆盖成本结构的一部分。若模型在开放式任务中少走了一条错误路径，就可能少读一轮文件、少跑几次工具，减少的会是整段后续交互。反过来，如果一个任务本来就很清楚，Opus 5.5 和 Opus 5 需要的回合数可能相近，此时得到的主要是单价下降。

Anthropic 在它引用的任务成本文章里也把这个边界说清楚：模型可能在单次回答中用更多 token，开放式任务的差距更可能拉大；没有一个数字适用于所有代码库。这个说法比“新模型更省钱”更值得记住，因为模型用量会随任务而变。

速度也要单独算。Anthropic 称 Opus 5.5 的输出生成速度比 Opus 5 快 30% 以上，这能缩短等待时间，却不等于缓存命中率提升或 token 消耗减少。账单、等待和结果质量是三个相关但不同的指标。

## 用一个完成的任务来验证

如果要判断 Agent 是否真的省钱，我会选几类常见工作分别测：边界清楚的小改动，和需要跨文件理解的开放任务。每类任务都记录最终是否通过测试与人工审阅、返工次数、总耗时，以及输入、输出、缓存读取和实际费用。按订阅使用时，还要结合 `/usage` 显示的额度消耗来看，不能直接套用 API 的标价。

比较时应使用自己准备投入生产的模型、effort、工具和缓存设置。这样得到的数字未必能回答“哪个模型普遍更便宜”，却能回答更实在的问题：在这份代码、这类任务和当前工作流里，完成一项可接受的改动要花多少。

缓存命中比例显示有多少旧上下文被复用。它不说明这些内容是否都必要，也不说明模型有没有正确完成任务。判断成本是否改善，需要把这项比例与任务结果、返工和实际用量放在一起看。

## 参考资料

- [Coding sessions are longer and use more context. Claude Opus 5.5 is built with that in mind. — Anthropic](https://claude.com/blog/claude-opus-5-5-built-for-coding-sessions-that-use-more-context)
- [Introducing Claude Opus 5.5 — Anthropic](https://www.anthropic.com/claude-opus-5-5)
- [The new rules of context engineering for Claude 5 generation models — Anthropic](https://claude.com/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models)
- [Maximizing the value of your Claude Code sessions — Anthropic](https://claude.com/blog/maximizing-the-value-of-your-claude-code-sessions)
- [How Claude Code uses prompt caching — Claude Code Docs](https://code.claude.com/docs/en/prompt-caching)
- [What a task costs on Opus 5.5 — Anthropic](https://claude.com/blog/what-a-task-costs-on-opus-5-5)
