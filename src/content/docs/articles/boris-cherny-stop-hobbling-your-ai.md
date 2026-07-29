---
$schema: starlight
title: 别用旧时代的提示词枷锁，束缚新一代 AI
description: 当模型智力发生跃迁，80% 的微观提示词非但毫无帮助，反而成了最大的能力过剩瓶颈。真正强大的 Agent 控制面，不在于手把手教 AI 写代码，而在于建立自动化验证闭环并把它解套。
date: 2026-07-29
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-29-boris-cherny-stop-hobbling-your-ai-img-00-infographic-core-summary.png)

Claude Code 负责人 Boris Cherny 在 Y Combinator Startup School 2026 上讲了一个极其反直觉的动作：在 Anthropic 发布 Opus 5 的当天，他们直接删除了 Claude Code 框架中 80% 的系统提示词（System Prompt）。

不仅如此，他们还在 Harness 内部保留了一个调试开关 `simple=1`——只要开启，就会剥离包括工具提示词在内的所有系统指令。有趣的是，在消融实验（Ablation）中他们发现：**删掉这些指令后，模型在很多复杂任务上的实际表现反而比带着提示词时更聪明。**

大多数开发者在遇到模型表现不佳时，第一反应往往是“Prompt 还不够详细”，于是不断追加限制条件、输出格式模板与 Step 1/2/3 的打卡步骤。然而 Boris Cherny 抛出的判断直接砸醒了所有人：你的 Prompt 写的越长，你很可能越在**束缚（Hobbling）** AI 的能力。

## 删掉 80% 的提示词后，发生了什么

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-29-boris-cherny-stop-hobbling-your-ai-img-01-system_prompt_ablation.png)

在 LLM 研发早期，系统提示词扮演的角色就像是补丁胶带。上一代模型常常在格式约束、路径规划或工具调用的细节上跌倒，工程师不得不写下密密麻麻的规训：“你必须先分析代码，再修改文件，修改时只能使用某某格式，绝对不能做某某操作……”

然而，模型能力是以指数级演进的。当 Opus 5 这种具备强大推理与长程规划能力的模型到来时，那些为了给旧模型“补短板”而手写的步骤指南，就变成了套在顶级工程师脖子上的打卡考核。模型不得不花费大量注意力去解析和顺从人类手写的冗余规则，反而打乱了它原本更优的推理解题路径。

正如我们在 [Not the Model, You're the Harness](https://ntlx.github.io/articles/not-the-model-youre-the-harness) 中讨论过的，控制架构的灵魂不在于约束模型的思考过程，而在与其能力的解套。Claude Code 团队在升级模型时的做法非常硬核：每次新模型发布，直接把 Harness 里的提示词、工具描述与自定义 Hook 归零，然后做消融实验（Ablation）——让模型裸奔，观察它在哪里掉坑，只有当模型在特定场景反复跌倒时，才重新加回最精简的那一行规范。

## 产品过剩：模型早已学会，产品还在拉手刹

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-29-boris-cherny-stop-hobbling-your-ai-img-02-product_overhang_interface.png)

Boris Cherny 在演讲中提出了一个极其深刻的概念：**产品过剩（Product Overhang）**。

所谓产品过剩，指的是基座模型在当前节点其实已经具备了某种惊人的能力，但市面上的产品界面与控制 Harness 却根本没有释放这种能力，甚至在反向拖后腿（Hobbling）。

Claude Code 的诞生过程就是一个经典案例。两年前，在 Sonnet 3.5 刚发布时，行业主流的 AI 编程产品形态是什么？大部分 IDE 还在做单行代码补全，或者只读模式的代码问答。模型明明已经具备了直接阅读整个工程、重构整块模块、写完完整功能的能力，但产品界面却像一个过分谨慎的管理层，只允许模型在光标后补全半行字符。

当时 Boris Cherny 团队做的事情，就是拿掉那些多余的交互限制，给模型配备最直接的终端读写接口与底层工具。

今天的 Agent 研发依然充斥着产品过剩。大部分人以为 AI 只能跑几分钟的小任务，但实际上，只要给它正确的环境与反馈机制，新一代模型可以连续自主跑数天甚至数周。在 [当计划变成代码——Claude Code Dynamic Workflows 读后感](https://ntlx.github.io/articles/claude-code-dynamic-workflows) 中提到的动态工作流（Dynamic Workflows），本质上就是一种把测试时计算（Test-Time Compute）用 Agent 代数进行范式化调度的手段。

## 真正的控制面：用验证回路替代微观提示

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-29-boris-cherny-stop-hobbling-your-ai-img-03-verification_loop_architecture.png)

如果删掉了 80% 的提示词，人类工程师在 Agent 系统里到底该干什么？答案是：**打造自动化验证回路（Verification Loop）。**

Boris 举了两个震撼的真实案例：

第一个案例来自 Bun 团队。他们希望将超过 10 万行复杂 C/Zig 代码的 JavaScript 运行时重写为 Rust。如果按照传统的 Prompt 工程，你可能要写一本几十页的迁移手册。但 Bun 团队只给了 Claude 一句极其高层的目标提示，同时提供了一套无比严密的自动化测试集（Validation Suite）。Claude Code 利用动态工作流挂载了数百个子 Agent，在没有任何人工步骤干预的情况下，自主运行了整整 11 天，完成了整个代码库的重写并顺利上线。

第二个案例是 Boris Cherny 自己的实验。他想看看能不能把 Electron 架构的 Claude 桌面端用 Swift 原生重写。他的 Prompt 简单得近乎粗暴：“启动 Mac OS 虚拟机，在里面运行 Electron 应用，截屏，逐像素对比 Swift 版本的 UI 渲染，不完全一致就不准停。”

这个任务在没有任何微观分步指令的情况下，连续自主运行了超过两周（14 天）。Claude 甚至自己创建了一个内部 Slack 频道，每隔几分钟就把最新的对比截图推送到频道里进行直播。

这两个案例揭示了 Agent 时代最重要的工程逻辑：**AI 缺的从来不是干活的能力，而是验证自己干得对不对的“尺子”。** 只要你为它提供了能够闭环的测试集、编译器、模拟器或像素对比工具，模型就会自己调整路径、自我修正错误并不断收敛。

## 经验主义与消融测试

对于习惯了预先设计复杂软件架构的传统工程师来说，Agent 时代的研发范式转变是极其痛苦的。

过去我们讲哲学、讲范式、讲完整的模式设计；而在大模型时代，软件工程正在变成一门真正的**经验科学（Empirical Science）**。

你不能凭空猜测模型需要什么指令。最有效的习惯是：
1. 狠狠按下 Delete 键，清空你写给 Agent 的大量微观提示词和繁琐 Hook；
2. 给它一个看似“太难”的高层目标；
3. 为它配备一把自动化验证的“尺子”；
4. 观察它在哪里卡住，只在真正卡住的缝隙里加一行规范。

别再用你手写的细枝末节去教 AI 怎么写代码了。卸下那些旧时代的提示词枷锁，把干活的空间还给模型，把精力和注意力放在构建验证回路与反馈系统上——这才是解套 AI 杠杆的唯一正道。

*你在使用新一代大模型时，是否也踩过“写了数百行 Prompt 却把 AI 越教越蠢”的坑？你在 Agent Harness 里保留的最久的控制机制是什么？欢迎在评论区分享你的经验。*

## 参考资料

- [Boris Cherny: Stop Hobbling Your AI (YC Startup School 2026)](https://www.youtube.com/watch?v=qyPCVqFUyDo)
- [Claude Code Building Story (YC Root Access)](https://www.ycrootaccess.com/p/boris-cherny-building-claude-code)

## 延伸阅读

- [Not the Model, You're the Harness](https://ntlx.github.io/articles/not-the-model-youre-the-harness)
- [当计划变成代码——Claude Code Dynamic Workflows 读后感](https://ntlx.github.io/articles/claude-code-dynamic-workflows)
- [重写的瓶颈从来不是写代码](https://ntlx.github.io/articles/bun-rust-rewrite-verification-bottleneck)
- [Prompt 不够了，Loop 才是 Agent 时代真正的控制面](https://ntlx.github.io/articles/claude-loops-control-surface)
