---
$schema: starlight
title: Codex 突破千万周活的背后：当代码变成隐形燃料，AI 的终局是消解“程序员”
description: 当 1000 万用户涌入 OpenAI 的 Agent 平台，最疯狂的增长竟来自非程序员。代码不再是高墙，而是隐藏在背后的引擎；当实现成本归零，决定个体与团队杠杆上限的，只剩下 Ideas 与 Taste。
date: 2026-07-30
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-30-codex-10m-users-chatgpt-work-img-00-infographic-core-summary.png)

OpenAI 核心产品工程负责人 Akshay Nathan 在 *Latent Space* 播客中透露了一个耐人寻味的数据：自 2026 年 7 月 9 日正式发布 ChatGPT Work 并将 Codex 的底层能力全面融通以来，整个系统在极短时间内冲破了 1000 万 Weekly Active Users（周活跃用户）大关。

真正令团队震惊的，不是增长曲线本身的陡峭程度，而是用户画像的剧烈偏移——在这 1000 万周活用户中，增长最迅猛、最直呼“获得了 Superpower（超能力）”的群体，竟然不是天天写代码的 Software Engineer，而是市场营销、财务分析、运营和产品经理。

这一事实彻底打碎了过去科技界对“AI 编程工具”的狭隘认知。

## 撕掉角色标签：统一的 Shared Agent Harness

长期以来，行业习惯于把 AI 产品做严格的岗位隔离：给程序员用 IDE 插件和终端 CLI，给普通办公人员用 Chat 聊天框和文档生成器。然而，OpenAI 这一次做出的关键工程抉择，是彻底放弃这种基于旧时代职业分工的割裂架构。

在 ChatGPT Work 的底层，OpenAI 部署了一套统一的 Shared Agent Harness（共享智能体运行框架）。无论你是想重构一段 Rust 后端代码，还是想把一份杂乱的 Excel 转换成自动刷新的交互式仪表盘，后台调用的都是同一种代码解释环境、同一种持久化沙盒与同一种多智能体调度逻辑。

正如我们在 [当法务开始写代码——OpenAI 这篇 Codex 数据报告，藏着比 AI 替代人更深的信号](https://ntlx.github.io/articles/codex-agents-dissolving-job-boundaries) 中讨论过的现象：当非程序员通过自然语言触发代码逻辑时，他们本质上是在调用计算机最原生、最精确的计算能力，而不需要去背诵 Syntax（语法）。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-30-codex-10m-users-chatgpt-work-img-01-shared_agent_harness_architecture.png)

这种架构统一带来的直接结果，是“开发”与“办公”边界的迅速模糊。非程序员不再需要向 IT 部门提交繁琐的工单去等一个内部工具，他们可以直接用 Prompt 让 Agent 现场写一段 Python 脚本处理异构数据，或者用全新发布的 **Sites** 功能直接生成一个部署在云端的交互式网页。

## 从静态容器到动态系统：Sites 与 OpenClaw 的启示

在过去的办公范式中，信息的终点是“静态容器”——一张 Excel 表格、一份 PPT 幻灯片，或者一篇 PDF 报告。但在 Agent 时代，这种静态展现正在变得过时。

Akshay 提到了 OpenAI 内部工作流的变化：团队之间不再互相发送带有图表的静态演示文稿，而是直接分享一个由 Agent 实时构建和托管的 **Site（交互式站点）**。这个 Site 内部运行着逻辑代码，随时拉取最新的数据库 API，并根据访问者的提问动态调整视图。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-30-codex-10m-users-chatgpt-work-img-02-static_docs_to_dynamic_sites_evolution.png)

这种转变的背后，离不开 OpenAI 此前对 Peter Steinberger 创建的 **OpenClaw** 开源 Agent 框架的吸收。OpenClaw 在处理跨平台操作、持久化会话和系统级 Memory（记忆）方面的工程探索，被融入到了 ChatGPT Work 的设计中。

如我们在 [Loop Engineering：Agent 真正的战场不是 prompt，而是回路](https://ntlx.github.io/articles/loop-engineering-agent-loops) 中所分析的那样，真正决定 Agent 实用价值的，从来不是单次 Prompt 的惊艳程度，而是系统能否在持久化的沙盒回路中不断执行、反馈、修正并保留状态。当 Agent 拥有了长期记忆与实时渲染环境，交付物就从“一堆文字”变成了“一个活生生的微应用”。

## 软件实现成本归零：真正的瓶颈是 Ideas 与 Taste

能用代码的人数，比能手写代码的人数大出至少 100 倍（100x TAM）。当 Agent Interface（智能体交互界面）成功撬动这 100 倍的非程序员群体时，整个软件世界的竞争法则被重新定义了。

Akshay 在访谈中提出了一个极为深刻的判断：**当生成“Just Works（能跑通）”的代码成本急剧下降并趋近于零时，软件开发的生产力瓶颈不再是“如何实现（How to build）”，而是“想做什么（Ideas）”与“如何评判好坏（Taste）”。**

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-30-codex-10m-users-chatgpt-work-img-03-leverage_pyramid_ideas_and_taste.png)

在传统模式下，大量的工程精力消耗在解决语法错误、配置环境、调通 API 和搭建 boilerplate（样板代码）上。而现在，Agent 承担了所有脏活累活。

当每个人都能在 5 分钟内捏出一个微型 SaaS、一个数据分析看板或一个工作流自动化脚本时，劣质与平庸的想法会被瞬间淹没。真正稀缺的能力演化为：
1. **Ideas（洞察与立意）**：你能否敏锐地发现未被满足的真实业务需求？你能否把复杂的现实问题抽象成高价值的代理任务？
2. **Taste（品味与鉴赏力）**：在 Agent 给出的十种解决方案中，你能否准确判断哪一种体验最优雅、哪一种逻辑无漏洞、哪一种真正符合用户心理？

代码没有消失，它只是像电力一样退居幕后，成为了无处不在的隐形燃料。

你在日常工作中有没有尝试过用 Agent 来代替繁琐的表格或内部工具搭建？你认为缺乏编程背景但具备强业务洞察的人，会在未来的 AI 时代获得更大的杠杆吗？欢迎在评论区分享你的看法。

## 延伸阅读

- [当法务开始写代码——OpenAI 这篇 Codex 数据报告，藏着比 AI 替代人更深的信号](https://ntlx.github.io/articles/codex-agents-dissolving-job-boundaries)
- [Loop Engineering：Agent 真正的战场不是 prompt，而是回路](https://ntlx.github.io/articles/loop-engineering-agent-loops)
- [Subagent 不是运行加速器，而是主控 Working Memory 的防火墙](https://ntlx.github.io/articles/orchestrator-tax-working-memory)
- [Agentic Engineering 的悖论：机器越能干，人越停不下来](https://ntlx.github.io/articles/agentic-engineering)

## 参考资料

- [Codex from 0 to 10M Users: Building ChatGPT Work — Akshay Nathan, OpenAI](https://podcasts.apple.com/us/podcast/codex-from-0-to-10m-users-building-chatgpt-work-akshay/id1674008350?i=1000778724551)
- [Latent Space: The AI Engineer Podcast](https://www.latent.space)
- [Codex for Every Role, Tool, and Workflow](https://openai.com/index/codex-for-every-role-tool-workflow/)
- [OpenClaw Project Repository](https://github.com/openclaw/openclaw)
