---
$schema: starlight
title: 当推倒重构成为了生存常态：从 Anthropic 创业指南看 Agentic 研发的范式跃迁
description: 代码正在从沉重的长期资产退化为低成本的易耗品。当底层模型每半年质变一次，团队真正的壁垒不再是写了多少代码，而是守护系统不变量的评测铁律。
date: 2026-08-22
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-22-claude-code-startup-guide-ai-native-sdlc-img-00-infographic-core-summary.png)

软件工程正在经历一场反直觉的权力重组：写代码从过去高门槛、高成本的手工劳动，迅速退化成了边际成本近乎为零的易耗品；而过去被视为技术灾难的“推倒重构”，正变成前沿 AI 原生公司吸收基础模型红利的标准姿态。

Anthropic 发布的《Claude Code 创业公司指南》（The Claude Code Guide for Startups）没有停留在“如何用 AI 补全代码”的初级叙事，而是深入调研了 Parahelp、Crosby、Heidi、Clay、Omni、Artemis Security、Harvey 和 Cognition 等十余家前沿团队，系统复盘了小团队如何借助 Agentic Coding 爆发出 10 倍于传统组织的交付效能。

读完这份指南，最强烈的感受不是 AI 变聪明了，而是软件研发组织背后的底层假设被彻底击穿。

## 传话筒的崩塌：当第一手认知直接成为交付物

在传统软件工程中，最懂业务痛点的人往往离代码最远。

一个典型的功能演进往往陷入“传话筒困局”（Broken Telephone Problem）：一线业务人员（律师、医生、客服或销售）遇到痛点提出诉求，产品经理转译为 PRD，设计师绘制原型，工程师排期编码，测试人员验证。几周甚至几个月过去，最终交付的产物往往与最初的想法大相径庭，而迭代周期已经在冗长的沟通链条中被消耗殆尽。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-22-claude-code-startup-guide-ai-native-sdlc-img-01-broken_telephone_collapse.png)

正如数字医疗初创公司 Heidi 的创始人兼 CEO Dr. Thomas Kelly 所言，Claude Code 最大的破坏力在于击穿了这个传话链条：懂问题的当事人能够借助自然语言与内部工具集成，在几小时内直接交付一个可运行的原型 PR，只在需要深度工程判断时拉入专业工程师。

这并不是说法律专家要通读编译器源码，或者营销人员去调试底层的数据库死锁。在 Clay 和 Crosby 的实践中，全员交付（Everyone Ships）的底层支撑是 **连接工具与共享规范**：
1. **真实上下文直连**：通过 MCP（Model Context Protocol）或命令行工具（如 `gh`、`kubectl`、`psql`），让 Claude Code 直接触达真实数据库、API 与业务系统，消除人工复制粘贴。正如我们此前在《[Anthropic 这篇 skills 文章，真正写的是组织接口](https://ntlx.github.io/articles/claude-code-skills-organizational-interface)》中所分析的，技能库（Skills）和 Design System 的本质是将团队的组织规范转译为机器可执行的契约。
2. **规范化技能包**：团队维护公共的 Skills 仓库，把业务上下文、Schema 规范和设计组件预置给 Agent，防止非技术人员的自发探索演变为系统的“碎片化拼凑”。

当 0 到 1 的试错成本趋近于零，组织的创新飞轮才真正启动。

## 机器代劳 80% 的机械劳动，但人必须守住 20% 的裁判权

如果全员都能提 PR，代码库是否会迅速退化为不可维护的巨石垃圾堆？

答案在于对研发生命周期（SDLC）的机械部分与判断部分进行严格切割。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-22-claude-code-startup-guide-ai-native-sdlc-img-02-invariants_evals_guardrails.png)

在前沿团队的实践中，Agent 承担了 80% 的机械劳动：
- **自动化代码审查（Code Review）**：在 PR 提交后自动运行审查 Pass，拦截低级缺陷与风格违例；
- **智能值班排障（Claude Tag）**：正如《[当代码产量暴增 8 倍：Anthropic 如何用“只读 Agent”重构 CI/CD 值班防线](https://ntlx.github.io/articles/claude-on-call-ci-cd-incident-response)》所揭示的，Agent 可以接入告警流，在人类介入前完成上下文抓取与初步归因；
- **闭环循环（Loops）**：针对有明确终止条件的任务（如 Flaky Test 修复、类型错误收敛），让 Agent 循环运行测试直到全部通过。

但自主性的放大，必须以**确定性铁笼**的坚固为前提。

Zingage 的创始人 Victor Hunt 分享了一个极为深刻的教训：早期他们给予 Claude 充分的自主权，结果 AI 迅速交付了大量“看起来极其合理但悄悄偏离系统架构”的代码。最终，他们把团队如何定义问题、核心不变量、不可违背的业务真理写成了 567 行的根目录规范。

在医疗编码（Cainex）或安全风控（Artemis Security）等合规容错率为零的领域，这种约束尤为致命。团队的防线由三层构成：
1. **CLAUDE.md 中的架构不变量**：写明系统原则与决策边界；
2. **确定性 Hooks 门禁**：在生命周期固定节点强行执行类型检查与 Lint，不通过则直接阻断；
3. **黄金评测集（Golden Set Evals）**：维护包含真实边界用例的评测集，任何 Agent 提交的修改必须全科及格才能合入。

这印证了我们在《[当 PRD 被 Evals 替代：Anthropic 首位 PM 吐露的 4 个战略反直觉](https://ntlx.github.io/articles/dianne-penn-anthropic-first-pm)》中强调的判断：在 AI 时代，产品定义与验收的唯一硬通货正是这套可量化的 Evals。

## 为重构而构建：接受代码只有半年的“保鲜期”

如果说“全员交付”改变了组织输入，“为重构而构建”（Build for Rebuilding）则彻底颠覆了软件资产的定义。

在传统研发理念中，推倒重写是架构师避之不及的噩梦，遗留代码被当成必须小心维护的沉重资产。然而在法律 AI 独角兽 Harvey 与 Devin 缔造者 Cognition 的团队眼里，代码的半衰期被主动设定为仅有 6 到 12 个月。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-22-claude-code-startup-guide-ai-native-sdlc-img-03-worktrees_parallel_rebuild.png)

Harvey 的应用 AI 负责人 Niko Grupen 指出，基础模型的每一轮能力跃升（从推理增强到长上下文再到原生编排），都会让过去为克服模型缺陷而搭建的复杂补丁架构瞬间过时；Cognition 联合创始人 Walden Yan 更是直言：“现在构建 AI 的生活方式，就是坦然接受你今天写的东西很可能在半年内被彻底推倒。”

在过去，推倒重构的代价是灾难性的；但在 Agentic 时代，推倒重构的边际成本已经被两项技术压到了极低水平：
1. **Git Worktrees 的并行隔离**：利用 Git 原生的 Worktree 特性，开发者可以在同一仓库下秒级检出多个独立目录，让多个 Claude Code 实例在各自的隔离环境里并发构建 v2 分支，与生产 v1 分支对跑 Evals 评测集，优胜劣汰后再行合并。
2. **Plan 模式的架构前置**：在敲下任何具体代码前，先通过 `/plan` 模式让 Agent 遍历整个代码库并输出重构蓝图，由人类工程师完成顶层架构对齐，从源头上扼杀架构漂移。

当重构的摩擦力降为零，团队不再背负沉重的技术负债，而是能以最敏捷的姿态拥抱下一代基础模型的红利。

## 极简主义与自用飞轮：为什么内部工具就是未来产品

指南中反复出现的另一个关键词是“极简工程”（Simplicity First）。

分析平台 Omni 的 CTO Chris Merrick 提到，他们直接借鉴了 Anthropic 的“文件优先 vs 复杂向量检索（Files vs Embeddings）”哲学，果断砍掉了复杂的 RAG 管线，从而大幅降低了系统复杂度。更重要的是，通过在本地用 Claude Code 运行和调试，团队能极快分流“到底是大模型的能力边界问题，还是自身 Harness 框架的设计问题”。

与此同时，前沿团队形成了一个自强化的飞轮模式：
- **内部自用（Dogfood）**：团队用 Claude Code 为自身研发流构建内部 Agent（如 ClickHouse 团队自建的 SQL 控制台 Agent 与 AI SRE）；
- **生产化提炼（Productionize）**：在内部高频摩擦验证后，直接将成熟逻辑通过 Claude API、SDK 或托管智能体封装为面向终端客户的核心产品功能。

自己是智能体的重度使用者，才能真正做出具备敏锐直觉的智能体产品。

## 软件工程的新重心：从“搬砖工”到“立法者”

从 Anthropic 的创业指南中，我们可以清晰地看到软件工程师角色的终极跃迁：
- 曾经，工程师的核心竞争力在于手写具体语法的熟练度、记忆 API 的广度，以及在复杂调用栈中排查低级 Bug 的耐心；
- 今天，编写具体代码的边际成本正在归零，工程师的真正价值升维为**系统的立法者、不变量的守护者与架构裁判**。

决定一家技术团队天花板的，不再是他们写了多少万行代码，而是他们能否清晰地定义出“系统的不可变量是什么”，能否构建出足够严密的 Evals 评测网络，以及能否拥有随时推倒重构的工程底气。

代码已是消耗品，唯有你对业务本质的洞察与约束定义，才能在模型的滚滚洪流中历久弥新。

*你在团队中是否尝试过让 Agent 并发重构子系统？面对 Agent 生成代码的架构漂移，你的团队是如何设定硬约束的？欢迎在评论区分享你的实战思考。*

## 参考资料

- [The Claude Code Guide For Startups — Anthropic](https://claude.com/blog/claude-code-guide-for-startups)
- [Demystifying Evals for AI Agents — Anthropic Engineering](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [Git Worktree Documentation — Git SCM](https://git-scm.com/docs/git-worktree)
- [Code with Claude Event (May 2026) — YouTube](https://www.youtube.com/live/OFDm3T7pVlc?si=Z_RENcJSqm8H79aj)

## 延伸阅读

- [当 PRD 被 Evals 替代：Anthropic 首位 PM 吐露的 4 个战略反直觉](https://ntlx.github.io/articles/dianne-penn-anthropic-first-pm)
- [Anthropic 这篇 skills 文章，真正写的是组织接口](https://ntlx.github.io/articles/claude-code-skills-organizational-interface)
- [当代码产量暴增 8 倍：Anthropic 如何用“只读 Agent”重构 CI/CD 值班防线](https://ntlx.github.io/articles/claude-on-call-ci-cd-incident-response)
- [当计划变成代码——Claude Code Dynamic Workflows 读后感](https://ntlx.github.io/articles/claude-code-dynamic-workflows)
