---
$schema: starlight
title: Agent 能跑 demo 不算本事，能跑一年才是
date: 2026-05-12
description: 85% 的组织部署了 AI Agent，67% 因缺乏路线图陷入困境。从 demo 到生产，中间隔着四道坎。
category: ai-agents
---

Agent 能跑起来不难，难的是跑一年不出事。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-12-agent-lifecycle-00-infographic-core-summary.jpg.jpg)

LangChain 2022 年 10 月在 GitHub 上开源，比 ChatGPT 发布还早一个月。从一个 side project 到 Benchmark 种子轮、红杉 A 轮、IVP B 轮，三年估值 10 亿美元。Harrison Chase 写这篇文章的底气是：他站在 Agent 工具链最上游，从框架到运行时到 Harness，全栈覆盖。

5 月 9 日他发了篇博客，讲 Agent 开发的生命周期。Build、Test、Deploy、Monitor、Iterate、Govern，六步闭环。看完第一反应不是"学到了"，是"我踩过的坑，人家早画成地图了"。

做 Agent 快两年。最早那批 demo 跑起来特兴奋：给它一个任务，自己调 API、写代码、返回结果，感觉发现了新大陆。部署到生产后问题一个接一个：同一个 prompt 今天能跑明天抽风，模型升级后之前能过的测试全挂，用户反馈回答离谱但我不知道它中间经历了什么。

这篇文章把 Agent 开发拆成四步：Build、Test、Deploy、Monitor。顺序是有意的，测试在部署之前，监控贯穿全程。听起来像废话，但大部分团队做的恰恰相反：先 Build，再 Deploy，Test 和 Monitor？等出问题再说。

![Demo vs Production：从原型到生产的鸿沟](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-12-agent-lifecycle-01-comparison-demo-vs-production.jpg.jpg)

## Build 不是写 prompt

很多人以为 Build Agent 就是写个 system prompt、接几个工具、调通了就算完。Harrison Chase 把这阶段拆成三层。

第一层是框架（Framework），负责抽象。LangChain、CrewAI 在这层，帮你把模型调用、工具调用、检索、结构化输出组合起来。

第二层是运行时（Runtime），负责执行。LangGraph 在这层，处理状态、控制流、持久化。Agent 跑到一半断了，能从断点恢复，不用从头来。

第三层是脚手架（Harness），负责行动。Deep Agents、Claude Agent SDK 在这层，提供 MCP 服务器、钩子、中间件、文件系统。长时间运行的任务需要这些支撑。

大部分人只做到第一层就觉得 Agent 做好了。其实那只是骨架，连肌肉都没长出来。

![Agent 构建的三层架构](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-12-agent-lifecycle-02-framework-three-layers.jpg.jpg)

Harrison Chase 有句话说得狠："Harness 才是最关键的东西。云模型很棒，但真正让这一切落地的其实是 Harness。"他不是谦虚。LangChain 月下载量超过 7000 万次，比 OpenAI SDK 还高。不是因为框架本身多牛，是因为围绕框架的那套 Harness 生态起来了。

![Agent 构建阶段的工具谱系](https://cdn.prod.website-files.com/65c81e88c254bb0f97633a71/69ff682de4638684801c78e0_14009bc9.png)

Agent 框架圈子里一直有场争论：Big Model vs Big Workflow。OpenAI 发了篇指南，主张让 LLM 主导 Agent 的行为。Harrison Chase 拉着 Anthropic 的观点回应：理想的框架应该允许从结构化工作流逐步过渡到模型驱动，在两者之间灵活切换。

说白了，大模型派觉得每次模型升级都可能让精心设计的工作流瞬间过时；工作流派觉得结构化的流程更可控、更易调试。这个争论到现在也没定论，但 Harrison Chase 的立场很清楚：不管你选哪条路，Harness 都是绕不开的。

## 测试不是"试一下"

我以前测 Agent 的方式：写几个 case，手动跑一遍，能过就上线。后来发现这根本不是测试，是碰运气。

Harrison Chase 讲了 eval workflow 的三件事。

*数据集*。把 Agent 遇到过的典型问题、边界情况、失败案例都存下来。没有数据集，每次 prompt 改了、模型升级了、工具更新了，同样的失败会反复出现。这是用血泪换来的教训：我有次改了个工具描述，导致 Agent 连续三天把客户订单状态查错，直到用户投诉才发现。如果有数据集，跑一遍就能抓出来。

*实验*。拿同一套数据集，比较不同 prompt、不同模型、不同检索策略的效果。不是"感觉这个好"，是"这个在 347 个 case 上通过率 91.2%，那个是 87.6%"。

*模拟*。Agent 不是单轮问答，它是多轮对话、多次工具调用、长时间运行的系统。单轮测试不够，需要模拟完整的交互流程：用户发脾气了怎么办、信息不全怎么办、工具调用失败了怎么办。语音 Agent 是最明显的例子，但这个模式更广泛：客服 Agent 要处理投诉，编程 Agent 要跑测试、改代码、再跑测试，运维 Agent 要翻日志、定位故障、给出修复建议。

![测试阶段的完整流程](https://cdn.prod.website-files.com/65c81e88c254bb0f97633a71/69ff682de4638684801c78d4_4627dcc1.png)

测试不是为了证明 Agent 能用，是为了理解它怎么失败的。知道它在哪摔跤，比知道它能跑多远重要得多。

![测试与监控的循环](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-12-agent-lifecycle-03-flowchart-test-monitor-cycle.jpg.jpg)

85% 的组织已经部署了 AI Agent，但 67% 因为缺乏清晰路线图陷入困境。路线图的第一步不是"做什么功能"，是"怎么知道它坏了"。

## 监控不是看日志

传统软件监控看延迟、错误率、CPU。Agent 监控看的是完全不一样的东西。

Harrison Chase 举了个例子：Agent 返回了一个"技术上成功"的响应，没有报错，延迟正常，但它调错了工具、跳过了审批步骤、用了错误的上下文。传统 APM 根本抓不到这种问题。

Agent 监控的核心是 traces：追踪 Agent 的完整轨迹，它收到了什么输入、调了哪些模型、用了什么工具、每一步的输出是什么、最终返回了什么。这不是日志，是手术录像。

有了 traces，才能从中提取信号。该调的工具调了吗？不该调的调了吗？回答有没有依据？有没有违反策略？这些信号可以来自 LLM 评委打分，也可以来自简单的正则匹配：比如检查"审批"这个词有没有出现在该出现的地方。

最关键的是反馈。用户说"这个回答不对"，你得能把这条反馈关联到具体的 trace 上。"用户不满意"和"Agent 第三步调错了工具"之间，需要一条可追溯的链路。LangSmith 做的就是这件事：把用户反馈直接挂到对应的 run 上。

![监控阶段的追踪体系](https://cdn.prod.website-files.com/65c81e88c254bb0f97633a71/69ff682de4638684801c78d7_8e9617a3.png)

Harrison Chase 在红杉资本的访谈里说："Traces 成了新的 Source of Truth。"我以前不信，现在信了。没有 traces 的 Agent 就像没有黑匣子的飞机，出了事你根本不知道怎么回事。

## Deploy 不是"扔到服务器上"

Agent 测试通过了，下一步是部署。但这不是传统的"打包、上传、重启"，Agent 的部署比普通应用复杂得多。

首先是运行时。普通应用是无状态的，请求来了处理完就走。Agent 不一样：它可能跑几分钟甚至几小时，中间需要暂停等人类审批、需要从断点恢复、需要在多个步骤之间保持状态。这叫"持久执行"（durable execution）。LangGraph 和 AWS AgentCore 做的就是这件事。

然后是沙箱。Agent 越来越需要写代码、执行代码、读写文件。你不能让它直接在生产服务器上跑：万一它写了段死循环，或者删了不该删的文件呢？沙箱提供隔离的执行环境，把爆炸半径控制在最小。LangSmith Sandboxes、Daytona、E2B 都是这个方向。

还有一个容易忽略的东西：上下文中心。Agent 的 prompt、技能、检索策略，这些"非代码"的部分可能比代码本身改得还频繁。而且改这些的人往往不是工程师：可能是产品经理、运营、领域专家。需要一个地方来存储、版本控制、审查和更新这些东西，让非技术人员也能参与 Agent 的调优。

![部署阶段的架构](https://cdn.prod.website-files.com/65c81e88c254bb0f97633a71/69ff682de4638684801c78d1_beca6459.png)

这让我想到一个类比：Agent 的部署，就像把一个实习生变成正式员工。不是给他一台电脑就完了：你得给他权限、给他工具、给他文档、告诉他什么能做什么不能做。Agent 也一样，它需要运行时、沙箱、上下文中心，才能在生产环境里安全地干活。

![部署基础设施：运行时、沙箱、上下文中心](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-12-agent-lifecycle-04-scene-deploy-scaffolding.jpg.jpg)

## 治理是规模化之后的真正难题

单个 Agent 没什么治理问题。但当你有十个、二十个 Agent 在跑，问题就来了。

*成本*。Agent 能烧钱——多次模型调用、长上下文窗口、重复工具使用、长时间运行。没有预算控制和成本监控，月底账单会吓你一跳。

*工具访问*。Agent 能调工具，这既是它的价值也是它的风险。哪个 Agent 能访问哪些工具？在什么条件下？代表哪个用户操作？出了问题谁负责？审计跟踪必须有。Harrison Chase 特别强调了人在回路（human-in-the-loop）：不是每个工具调用都应该自动执行，涉及客户、财务、敏感数据的操作，必须暂停等人类审批。

*可发现性*。公司里不同团队各自建 Agent，prompt、技能、工具、检索源都在重复造轮子。一个团队调好的 prompt，另一个团队不知道，又从头调一遍。共享资产需要能被找到、被复用、被管理。

![治理框架](https://cdn.prod.website-files.com/65c81e88c254bb0f97633a71/69ff682de4638684801c78ce_1e0b2abf.png)

这些不是技术问题，是组织问题。Harrison Chase 把它叫 Governance，我觉得叫"Agent 的 DevOps"更贴切：就像软件开发从"写代码"进化到"CI/CD + 监控 + 告警"一样，Agent 开发也需要从"写 prompt"进化到一套完整的工程实践。

## 所以呢

2026 年被 Harrison Chase 判断为 Agent 工程的分水岭。不是因为模型突然变强了，是因为围绕模型的那套工程体系：框架、运行时、脚手架、测试、监控、治理，终于开始成形了。

这让我想起软件工程的历史。早年写程序就是写代码，后来才有了测试、CI/CD、可观测性、SRE。每一步都是被生产环境的血泪教训逼出来的。Agent 正在走同样的路，只不过速度快了十倍。

LangChain 这篇文章的价值不在于讲了什么新概念，在于它把散落在各处的实践系统化了。Build-Test-Deploy-Monitor 不是什么革命性框架，就是工程的基本纪律。但对 Agent 这个领域来说，把基本纪律讲清楚，本身就是一件大事。

Harrison Chase 说 2026 年是分水岭。我更愿意说：2026 年是 Agent 从"demo"变成"工程"的元年。在此之前，大家都在摸着石头过河。在此之后，河上开始有桥了。

*你在项目里用的 Agent，如果明天模型升了一级，你的 prompt 和工具调用还能跑通吗？你靠什么确认？*

## 原文参考

> Harrison Chase. **The Agent Development Lifecycle**. LangChain Blog.
> <https://www.langchain.com/blog/the-agent-development-lifecycle>
