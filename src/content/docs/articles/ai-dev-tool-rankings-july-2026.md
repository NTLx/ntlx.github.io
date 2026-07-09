---
$schema: starlight
title: 聪明不值钱了：从 2026 年 7 月 AI 编码工具排行榜看到的三件事
description: 18 个 AI 模型的质量表格几乎全是勾，但真正改变格局的是谁更便宜、谁更开放、谁更难逃离。
date: 2026-07-09
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-09-ai-dev-tool-rankings-july-2026-img-00-infographic-core-summary.png)

## 聪明不值钱了

LogRocket 每个月发一次 AI 编码工具排行榜，我通常扫一眼排名变动就关掉了。2026 年 7 月这一期让我停下来了，停下来的原因是一张表格。

那张表是"质量与优化功能"对比：18 个模型 × 15 个维度，包括响应式设计、无障碍合规、性能优化、代码重构、安全检测、测试生成……结果是几乎全是 ✅。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-09-ai-dev-tool-rankings-july-2026-img-01-quality_parity_heatmap.png)

18 个模型，从 $10/1M tokens 的 Fable 5 到 $0.35 的 GLM-4.6，价格差了 28 倍，但在"能不能写出符合 WCAG 标准的代码"这件事上，它们的表现一样。

这大概是今年 AI 编码市场最重要的事实：**聪明正在商品化**。当所有前沿模型都能写 React、做 TypeScript 类型推断、生成 Tailwind 组件时，"谁更聪明"这个问题的商业价值正在趋近于零。

但排行榜上最剧烈的变动，恰恰跟聪明没关系。

## 三件事改变了格局

### 碾压、但贵得离谱

Claude Fable 5 以 1653 Elo 登顶，领先第二名 92 分——这是 WebDev Arena 有史以来最大的差距。作为对比，上个月 Opus 4.7 领先第二名只有 24 分。92 分的差距，放在体育比赛里相当于一个选手比第二名快了半圈。

然后你看价格：$10/$50 per 1M tokens。是 Opus 4.8 的两倍，是 DeepSeek V4 Pro 的 23 倍，是 GLM-4.6 的 28 倍。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-09-ai-dev-tool-rankings-july-2026-img-02-elo_vs_price_scatter.png)

这让我想起一个老问题：**性能值多少钱？**在基准测试里，92 Elo 是一个令人敬畏的数字。但在日常开发中，你大概不会为了"代码重构建议略好一点"而多付 28 倍的 API 费用。Fable 5 不是给普通开发者用的，它是给"我们团队需要最强模型且预算无限"的场景准备的。

### 一笔收购改变了信任方程

SpaceX 在 6 月 16 日宣布以 600 亿美元全股票收购 Cursor 的母公司 Anysphere。这是 AI 编码工具领域有史以来最大的并购。

表面上看这是一个成功故事——Cursor 估值 600 亿，了不起。但社区的反应耐人寻味。Ramp 的数据显示 Cursor 市场份额已经从 41% 滑落到 26%。收购宣布后，讨论区里出现最多的词不是"恭喜"，而是"锁定风险"。

一家被 SpaceX 收购的 IDE，未来会优先集成谁家的模型？会不会限制竞品模型的接入？数据会怎么处理？这些担忧不是杞人忧天。当你的编码助手和全球最大的航天公司绑在一起时，你对"数据隐私"的期望需要重新校准。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-09-ai-dev-tool-rankings-july-2026-img-03-tool_ecosystem_three_poles.png)

有意思的是，这笔收购的直接受益者是一个开源项目。OpenCode——172K GitHub stars、MIT 许可、支持 75+ 模型供应商的终端编码 Agent——在 7 月排行榜上蝉联工具类第一。LogRocket 原文直白地写道："SpaceX-Cursor deal strengthens its positioning。"

这跟我之前在[《Not the Model, You're the Harness》](https://ntlx.github.io/articles/not-the-model-youre-the-harness)里聊过的判断吻合：**当模型趋同时，harness 的选择比模型更重要。** OpenCode 证明了一件事——你不需要拥有最强模型，你只需要成为最开放的那个接口。

### 中国模型：不是慈善，是战略

这一期排行榜上有三个中国模型进入了模型榜：Qwen 3.7 Max（#3）、DeepSeek V4 Pro、GLM-4.6。它们的共同特点是——便宜得不像话。

DeepSeek V4 Pro 的价格是 $0.435/$0.87 per 1M tokens，而且这是"permanent since May 22"的永久定价。GLM-4.6 更夸张：$0.35/$0.39。Qwen 3.7 Max 的缓存命中价格是 $0.25/1M tokens——打了 1 折。

在性能上，Qwen 3.7 Max 的 WebDev Arena Elo 是 1526，仅次于 Opus 4.8 的 1561。有实测文章验证过：一次性代码生成 Claude 更好（少 10-15% 的问题），但迭代两轮后 Qwen 追平。在 Agent 工作流场景，Qwen 已经成为一些开发者的默认选择——因为它的价格只有 Claude 的三分之一。

Qwen 3.7 Max 有一个硬限制：纯文本，零视觉输入。这在"设计稿转代码"场景中是致命伤。但如果你只做纯编码工作，这个限制可能根本不影响你。

这不是慈善。DeepSeek 和 Qwen 在用价格换市场份额，赌的是当开发者习惯了"1/3 价格 + 90% 性能"后，即使未来价格回归正常，用户也已经建立了使用惯性。

## 排行榜帮不了你选工具

说了这么多，我想回到一个最基本的问题：**这个排行榜到底在告诉你什么？**

LogRocket 的评分方法很透明——30% 技术性能、25% 实用易用性、25% 价值主张、20% 可访问性。看起来全面，但每个权重选择都是一个主观判断。给"价值主张"25% 权重意味着开源和免费获得了结构性优势。如果把这个权重改成 10%，OpenCode 的排名会下降，Cursor 会上升。

更根本的问题是：基准测试不等于你的工作。WebDev Arena 让模型构建网站和 web app，投票者选更好的结果。这衡量的是"在前端构建场景下的人类偏好"，不是"在你的 10 万行后端微服务里谁能更快找到 bug"。

GitHub stars 也不等于真实采用。OpenCode 的 172K stars 很惊人，但 npm 周下载量 1.68M 才是更可靠的信号——而且即便如此，1.68M 次下载不等于 1.68M 个日活用户，更不等于企业采购决策。

价格比较也有盲区。切换到 OpenCode 的学习成本、迁移现有 Claude Code 工作流的成本、自建模型服务的运维成本——这些都不在 $/1M tokens 的数字里。对于重度用户来说，OpenCode + Claude API 的总成本可能不低于直接买 Cursor 订阅。

所以这个排行榜真正有价值的不是排名本身，而是它暴露出来的格局变化：聪明在商品化、生态在重组、成本在分化。至于"谁排第一"——这个问题的答案，取决于你问的是哪个排行榜。

*你在用哪个 AI 编码工具？选择它的真正原因是什么——是因为排行榜推荐，还是因为你的团队已经离不开它了？*

## 延伸阅读

* [Not the Model, You're the Harness](https://ntlx.github.io/articles/not-the-model-youre-the-harness) — 当模型趋同时，harness 的选择为什么比模型更重要
* [Claude Code 正在离开聊天框](https://ntlx.github.io/articles/claude-code-headless-automation) — Computer use 和无头自动化：Claude Code 正在变成什么
* [Qwen 3.6 27B 的真正意义：本地 AI coding 终于跨过可用门槛](https://ntlx.github.io/articles/qwen-36-local-coding-threshold) — Qwen 系列的演进路径
* [Tokenpocalypse：当你发现 AI 账单比 AI 产出更好量化](https://ntlx.github.io/articles/tokenpocalypse-ai-token-cost) — AI 编码的成本经济学

## 参考资料

* [AI dev tool power rankings & comparison \[July 2026\]](https://blog.logrocket.com/ai-dev-tool-power-rankings)
* [Qwen 3.7 Max Just Crashed the Top 3 at Half the Price](https://medium.com/@takabdt/qwen-3-7-max-just-crashed-the-top-3-at-half-the-price-cf4f9d9d3fc8)
* [Best AI Coding Agents (June 2026): Scored Leaderboard](https://www.morphllm.com/best-ai-coding-agents-2026)
* [OpenCode Developer Guide](https://www.developersdigest.tech/blog/opencode-developer-guide-2026)
* [Best AI Coding Agents in 2026: Harness, Cost, and Comparison](https://www.firecrawl.dev/blog/best-ai-coding-agents)
* [AI Model Benchmarks Jul 2026 | LM Council](https://lmcouncil.ai/benchmarks)
