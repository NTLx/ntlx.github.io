---
$schema: starlight
title: 当 PRD 被 Evals 替代：Anthropic 首位 PM 吐露的 4 个战略反直觉
description: 当模型能力非线性涌现，传统 PRD 彻底失效。Anthropic 首位 PM Dianne Penn 揭示了 Claude 爆发背后的逻辑：以 Evals 替代文档、单点押注 Coding，并在参差边界守住人类判断。
date: 2026-07-30
category: ai-industry
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-30-dianne-penn-anthropic-first-pm-img-00-infographic-core-summary.png)

在人工智能迭代速度以周甚至以天计的当下，许多从传统互联网转行做 AI 产品的人，常常会陷入一种强烈的阵痛感：过去那些被奉为圭臬的“产品需求文档（PRD）”、“原型设计”和“确定性路线图”，在大模型面前似乎全都失效了。

最近听完 Dianne Penn 在 Lenny's Podcast 上的深度对谈，这种感受被极其清晰地印证了。Dianne 在 2023 年加盟 Anthropic，是公司第一位 Technical Product Manager（PM），当时全公司的 PM 团队算上她只有 5 位工程师。她亲历并推动了从 Claude 2 到 Fable 的每一款模型发布，并在内部孵化了 Claude Code、MCP（Model Context Protocol）、Skills 以及 Computer Use 等重磅产品与协议。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-30-dianne-penn-anthropic-first-pm-img-01-lenny_dianne_podcast_dialogue.png)

听完全场对谈，最有价值的不是关于某个具体功能功能的碎念，而是 Anthropic 在重构“如何做 AI 产品”这件事情上的底层范式转移。以下是我梳理出的四个最具有启发性的战略反直觉。

## 告别静态 PRD：Evals 成为 AI 研发的新契约

传统软件开发建立在“确定性”之上：PM 写下详尽的 PRD，设计师画出精确的原型，工程师敲出符合逻辑的代码。但大模型研发完全不同——模型的能力涌现（Emergent Capabilities）和行为漂移（Behavior Shift）发生在 Scaling 和 Post-training 阶段，静态文档根本无法预知模型的真实表现。

Dianne 在访谈中明确指出：在 Anthropic，**Evals（评测）就是新的 PRD**。

所谓 Evals 驱动开发，是指 PM 和研究员不再花几周时间撰写几十页的功能规格书，而是把用户的痛点、期望的输出形态以及常见的失败边界，直接转化为带有“黄金答案（Golden Answers）”和自动化断言的测试集。

每次模型更新、Prompt 调整或微调，团队只看评测集上的 Pass Rate 和回归检测数据。这种机制将研发、产品与研究团队紧密绑定在同一个可量化的事实基座上。如果一个新需求无法被翻译成可度量、可运行的 Evals，那它在 AI 研发的语境下就不具备讨论基础。

## 豪赌 Coding 场景：从追赶者到开发者首选的转折点

回看 Anthropic 的发展历程，其从早期被视为 OpenAI 的跟随者，到如今凭借 Claude 3.5 Sonnet 和 Claude Code 在开发者社区建立起极高的口碑与粘性，最关键的战略决策在于——**单点打穿 Coding 场景**。

为什么是 Coding？在无数可能的通用对话场景中，选择代码作为主攻方向看似窄化了市场，实则是一个极具眼光的底层战略选择：

1. **结果具备确定性验证**：代码要么能通过 Unit Test 和编译，要么报错。这种天然的客观反馈极其适合构建精准的 Evals 闭环。
2. **逻辑密度极高**：编程要求模型具备长上下文理解、符号推理和严格的因果链条，打穿代码能力的模型，其泛化推理能力往往会同步飞跃。
3. **高频且高付费意愿**：程序员是最愿意为生产力工具买单、也最懂如何用 Prompt 喂饱 AI 的群体。

这一战略定力不仅让 Claude 赢下了开发者基本盘，也为后来 [Anthropic 这篇 skills 文章，真正写的是组织接口](https://ntlx.github.io/articles/claude-code-skills-organizational-interface) 中提到的模块化能力落地奠定了坚实的基础。

## Token Maxing 与 Labs 模式：打破渐进式 Roadmap 的 10x 赌注

在这次对话中，Dianne 提到了一个非常有意思的概念——**Token Maxing**。

在过去，很多应用层开发者的核心诉求是“省 Token”：压缩上下文、减少多轮对话、能用小模型就不用大模型。但在 Agentic 范式下，真正顶尖的 Builder 正在采取截然相反的路径：**给 Agent 赋予极高的 Token 预算**。

让模型在单次任务中进行多轮自我思考（Reasoning）、多次调用工具（Tools）、读取大文本并不断尝试纠错。当一个任务消耗的 Token 数量从几百上升到几十万甚至上百万时，模型展现出的自主完成度会出现断跃式的提升。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-30-dianne-penn-anthropic-first-pm-img-02-eval_driven_development_loop.png)

与之相呼应的是 Dianne 领导的 **Anthropic Labs** 的运作机制。传统的 PM 容易掉入“渐进式优化（Incremental Improvement）”的陷阱，但 Labs 的定位是探索 10x 到 1000x 的断层式赌注（Discontinuous Bets）。

无论是打破应用孤岛的 MCP 协议（我们在 [同一天，OpenAI、Runway、Google 都选了 MCP——一个协议的临界点](https://ntlx.github.io/articles/mcp-tipping-point) 中曾深入讨论过其行业临界点），还是直接让 AI 接管命令行终端的 Claude Code，这些产品都不是在旧有路线图上修修补补，而是直接跨越到下一个范式去“生活在未来”。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-30-dianne-penn-anthropic-first-pm-img-03-token_maxing_agentic_workflow.png)

## 参差边界与反驳力：AI 时代 PM 的核心基本功

当 AI 模型的能力越来越强，人类 PM 和工程师的壁垒究竟在哪里？Dianne 提出了两个非常深刻的观察：

一是**敏锐感知能力的“参差边界（The Jagged Edge）”**。前沿模型的能力并不是均匀增长的，它可能在极复杂的架构重构上展现出超人智慧，却在某些极其简单的规则上犯低级错误。好 PM 必须亲自下场与模型大量互动，建立对能力边界的肉身直觉，从而把人类干预（Human-in-the-loop）精准放置在参差边界的最前端。

二是**保护模型的“反驳力（Willingness to Push Back）”**。一个好的 AI 产品不应当是曲意逢迎（Sycophantic）的应声虫。当用户的 Prompt 存在逻辑漏洞、需求假设本身不合理时，Claude 表现出质疑并给予批判性建议的能力，反而是建立长期信任的关键。

---

从 Dianne Penn 的分享中不难看出，AI 时代的 PM 已经不再是需求的搬运工或流程的协调员，而是**评测体系的架构师、能力边界的探索者与断层创新（Discontinuous Innovation）的推手**。

你是否也曾在开发或使用 AI 产品时感受到“静态 PRD 失效”或“参差边界”的存在？欢迎在评论区分享你的看法。

## 延伸阅读

- [同一天，OpenAI、Runway、Google 都选了 MCP——一个协议的临界点](https://ntlx.github.io/articles/mcp-tipping-point)
- [Claude Code 的七种控制方式：从'告诉 AI 做什么'到'让 AI 无法不做'](https://ntlx.github.io/articles/claude-code-seven-steering-methods)
- [Anthropic 这篇 skills 文章，真正写的是组织接口](https://ntlx.github.io/articles/claude-code-skills-organizational-interface)
- [当 MCP 遇上 Web 端：看 Claude 与 ChatGPT 如何撕开工具集成的两面性](https://ntlx.github.io/articles/mcp-in-claude-and-chatgpt)

## 参考资料

- [Lenny's Podcast: Anthropic’s first technical PM on token maxing, the jagged edge, and living in the future](https://www.lennysnewsletter.com/p/anthropics-first-technical-pm-on)
- [Apple Podcasts: Anthropic’s first technical PM | Dianne Penn](https://podcasts.apple.com/us/podcast/anthropics-first-technical-pm-on-token-maxing-the/id1627920305?i=1000778409270)
- [YouTube: Anthropic's First Technical PM on Token Maxing](https://youtu.be/tivaWTTVRhY)
- [Anthropic: Introducing Anthropic Labs](https://www.anthropic.com/news/introducing-anthropic-labs)
- [Anthropic: Golden Gate Claude](https://www.anthropic.com/news/golden-gate-claude)
- [Lenny's Podcast Poster Image](https://substack-post-media.s3.amazonaws.com/public/images/d7a58503-8e16-46f8-a716-9aefcda6fc89_1920x1080.png)
- [Y Combinator: Tokenmaxxing - How Top Builders Use AI](https://www.ycombinator.com/library/Pa-tokenmaxxing-how-top-builders-use-ai-to-do-the-work-of-400-engineers)
