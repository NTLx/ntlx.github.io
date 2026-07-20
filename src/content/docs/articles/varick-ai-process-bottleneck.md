---
$schema: starlight
title: 代码有编译器，你的财务流程没有
description: 模型换了三代，企业 AI 成功率还是 5%。瓶颈从来不是模型——是你的工作本身没有反馈回路。
date: 2026-07-20
category: ai-industry
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-20-varick-ai-process-bottleneck-img-00-infographic-core-summary.png)

## 三代模型过去了，成功率纹丝不动

2026 年 7 月 15 日，一个叫 Varick Agents 的企业 AI 部署公司发了一篇长文，标题问得很直白："如果 AI 这么厉害，为什么没在起作用？"

作者 Daniel Kornum 是个前工程师，过去一年多跟 100 多个美国大公司高管聊过。他观察到的画面很统一：软件许可证买了一堆，领导层天天喊"AI-first"，但你问他们运营上到底变了什么——应付账款还是老样子，财务结账还是 22 天，销售代表达标率还是 24%，CRM 数据衰减率还是 30%，跟 2022 年一模一样。

这不是一个人的观察。MIT NANDA 2025 年审查了 300 多个 AI 试点，95% 对利润表零影响。BCG 说只有 4% 实现了规模化价值。RAND 说 80% 以上的 AI 项目失败，是普通 IT 项目的两倍。McKinsey 调查了 105 个国家的高管，78% 的组织在用 AI，但 80% 以上报告对 EBIT 没有影响。

有意思的是，这些数字从 GPT-o3 到 Opus 4 到 GPT 5.5，跨了整整三代模型，几乎没变过。

模型变强了，价格降了，上下文窗口大了，工具调用也可靠了。但企业成功率纹丝不动。

这说明什么？说明瓶颈根本不在模型。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-20-varick-ai-process-bottleneck-img-01-engineering_four_traits_matrix.png)

## 代码为什么行，财务为什么不行

Kornum 给了一个很干净的框架。他说软件工程工作有四个特征，是大多数企业职能不具备的：

**有界**。一个编程任务有明确的输入、输出、文件、模块、依赖。你改一个函数，影响范围是可预测的。

**可检查**。你写完代码，编译器几秒内告诉你语法对不对。跑测试，几秒内告诉你逻辑对不对。不需要等一个人类来告诉你答案。

**结构化**。代码在版本控制里，构建是确定性的，状态可以回放。

**可验证**。一个 Pull Request 是一个离散的工件，审查者可以很快批准或拒绝。

当 AI 对准具备这四个特征的工作时，杠杆是巨大的。GitHub 2024 年的研究：Copilot 用户完成任务快了 55%。Anthropic 2025 年的内部研究：132 名工程师、10 万次对话，任务时间减少约 80%。Sundar Pichai 2026 年初说 Google 75% 的新代码由 AI 生成——2025 年 4 月这个数字还只有 30%。

现在想想你的财务结账流程。它涉及应付、应收、跨公司对账、外汇、应计、日记分录、异常处理、NetSuite、Concur、银行接口、收购来的 ERP、自定义表单、Slack 里的口头确认。真实流程跟 SOP 的偏差通常在 30% 以上，异常密集型工作流超过 70%。验证一次干净的结账，高级会计师要花好几天。

没有编译器。没有测试套件。没有确定性回放。没有离散化的审查节点。

你往这种工作流上扔一个 LLM，它生成的东西没有即时反馈来验证对错。一个原来花 30 分钟的任务，现在还是 30 分钟——加上修 AI 错误的另外 30 分钟。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-20-varick-ai-process-bottleneck-img-02-four_failure_modes_chain.png)

## 四个失败模式，每一个都指向同一个根因

Kornum 说他在 18 个月里部署过财务、销售、运营、工程、营销领域的 AI agent，每一个失败都可以追溯到四个原因。我把它压缩一下：

**跳过审计**。按 SOP 构建，但真实工作流跟 SOP 不是一回事。Kornum 管这叫"conformance gap"，通常超过 30%。你自动化了 70% 的常规量，但 30% 的异常全炸了，人得回来修。

**过度使用 LLM**。让模型做提取、比较、路由这些不需要判断力的事。结果系统又慢又贵又爱幻觉。有效的生产系统是 85% 确定性代码 + 15% LLM——模型只在需要判断的地方出现。

**Agent 蔓延**。每个员工自己搞一个 agent。200 人的运营团队搞出 50 到 100 个独立工作流。各自独立的接入、审批、日志、模型配置、prompt。没有共享层。然后模型退役了，API 变了，人走了，没人维护了。法务某天发现一个营销 agent 把客户数据发给了一个未经批准的第三方 LLM API。

**把 AI 当一次性项目**。传统软件可以建完就放着。AI 不行——模型在迭代，有些变好了有些变差了，有些直接退役了。2026 年 4 月 Anthropic 承认工程错误导致 Claude Code 性能下降超过一个月，Max 订阅用户 19 分钟就撞限额了。你需要一个团队持续盯着。

这四个模式有一个共同根因：它们都是在**不理解真实工作流**的前提下发生的。不理解流程，就不知道哪些步骤需要判断力、哪些不需要；就不知道 SOP 和现实的差距在哪里；就不知道哪些环节可以自动化、哪些必须留给人。

## 那 5% 做对了什么

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-20-varick-ai-process-bottleneck-img-03-conformance_gap_sop_vs_reality.png)

Kornum 说成功的少数人一致做五件事：

审计先行。花四周或更长时间看真实的工作流——不是 SOP，是人实际怎么干的。哪些步骤是模式匹配，哪些需要判断。产出一个"数字孪生"。

大部分步骤确定性。5 到 10 个确定性步骤，一两个模型调用。模型只在需要判断的地方出现。

一个编排层。财务、销售、运营、工程的 agent 共享同一个平台、上下文和通信能力。新用例是配置，不是独立项目。

模型无关。抽象在任务层面，不在模型层面。每个步骤路由到最合适的模型。模型退役或改进，路由层吸收变化。

部署即持续基础设施。一个团队调优系统、退役不再有效的 agent、每季度或每月发改进。

Kornum 给了一个"如果 CEO 给 100 万美元和 6 个月"的计划：月 1 审计，月 2 架构，月 2.5-4 构建+软启动（人类审批每个动作），月 4-6 上线，月 6 建立持续调优。

这个计划本身没什么新鲜的。但有一点值得注意：他花了一个月做审计。不是写代码，不是调模型，是**看人干活**。

## 一个诚实的注脚

这篇文章的分析框架是扎实的。"有界/可检查/结构化/可验证"这四个特征确实解释了为什么代码是 AI 的最佳应用场景，也解释了为什么大多数企业职能不是。

但我也得说：Kornum 是 Varick Agents 的创始人，他卖的就是"审计+部署"服务。"流程是瓶颈"这个结论，恰好是他产品的核心卖点。他提出的六个月计划，本质上也是 Varick 的销售路径。这不意味着他的分析是错的——一个卖锤子的人指出钉子是真实存在的，这没问题——但读的时候得记住这个位置。

另外，文章几乎没有讨论 AI 在创意、研究、教育、写作等非结构化领域的价值。这些领域同样没有编译器和测试套件，但 AI 在这些地方确实产生了真实的生产力。"有界/可检查/结构化/可验证"框架解释了企业运营 AI 的困境，但不是 AI 价值的完整图景。

前几天我写了[一篇关于 AI 行业协调困境的文章](https://ntlx.github.io/articles/ai-mania-nobody-dares-speak)，讨论的是为什么没人敢说 AI 项目在失败。Kornum 这篇讨论的是另一个问题：为什么这些项目**真的**在失败。两篇放在一起看，画面更完整——不是模型不行，不是没人敢说，是大多数企业工作本身不具备让 AI 发挥杠杆的条件。

*你所在的公司有没有跑过 AI 项目？它失败（或成功）的原因，是模型问题还是流程问题？你的工作流里有"编译器"吗——某种能在几秒内告诉你 AI 输出对不对的机制？*

## 参考资料

- [If AI is so great, why isn't it working?](https://www.varickagents.com/blog/if-ai-is-so-great-why-isn-t-it-working)
- [MIT NANDA: 95% of GenAI Pilots Show Zero P&L Impact](https://neuralwired.com/2026/06/19/enterprise-ai-failure-rate-mit-roi-2026/)
- [Why 80% of AI Projects Fail: 2026 Analysis](https://www.beri.net/article/ai-project-failure-complete-guide-2026)
- [Anthropic: Building Effective Agents](https://docs.anthropic.com/en/docs/build-with-claude/agent-patterns)

## 延伸阅读

- [不是模型不够聪明](https://ntlx.github.io/articles/microsoft-ai-agents-enterprise)
- [你的 Agent 读得懂代码，读不懂你的产品](https://ntlx.github.io/articles/vercel-agent-product-design)
- [所有人都知道船在沉，但没人敢先喊出来](https://ntlx.github.io/articles/ai-mania-nobody-dares-speak)
- [Agent 能跑 demo 不算本事，能跑一年才是](https://ntlx.github.io/articles/agent-development-lifecycle)
