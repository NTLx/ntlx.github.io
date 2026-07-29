---
$schema: starlight
title: Subagent 不是运行加速器，而是主控 Working Memory 的防火墙
description: 在多 Agent 编排中，最稀缺的资源不是 Token 账单或运行时间，而是主控 Agent 的工作内存。将 Subagent 定位为隔离噪声的防火墙，才能避免上下文污染带来的持续复利征税。
date: 2026-07-29
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-29-orchestrator-tax-working-memory-img-00-infographic-core-summary.png)

在软件工程中，人们习惯将“多 Agent 协作”包装为一种显而续知的效率提升手段：只要把任务拆给多个 Subagent 并行跑，原先需要半小时的重构就能缩短到十几分钟。然而，随着开发者在真实复杂代码库中大量使用 Claude Code 等工具，一个反直觉的现象逐渐显现——当四五个后台 Agent 同时运转、结果交错返回时，整套系统往往会变得比代码本身还要难以理清。

Thoughtworks 首席工程师 Rahul Garg 在 Martin Fowler 博客上发表的最新文章 *The Orchestrator's Tax*，正起源于这样一次极其真实的重构现场。他在对一个 .NET 代码库进行管道重构时，主控 Agent（Orchestrator）同时调度了 4 个 Subagent。表面上看，壁钟时间从预计的 25 分钟缩短到了 12 分钟，效率似乎翻倍了；但主控 Agent 在后来的自我审查中揭示了一个令人震惊的事实：**多 Agent 编排中最昂贵的消耗，根本不是那些被分发出去的后台任务，而是主控 Agent 本身因为状态轮询与上下文污染所支付的“工作内存税”（Working Memory Tax）。**

这篇文章为现代 Agentic Engineering 提出了一个非常关键的认知转向：**Subagent 的核心价值不是速度或并行，而是隔离——它应当被视为主控 Agent 工作内存的防火墙。**

## 隐性泄漏：从状态轮询看上下文的复利征税

在多 Agent 系统中，人们往往把关注点放在 Token 账单或并发耗时上。但这两种成本存在本质差异：Token 消费是一次性的，账单结清即结束；而进入 Context 的数据，会在接下来的每一轮对话中持续参与 Attention 机制的计算。

在 Rahul Garg 的案例中，最严重的成本泄漏来自于一个看似无害的操作：当主控 Agent 试图了解后台 Subagent 的进度时，它执行了一次 status check。然而工具并没有返回简短的进度总结，而是直接将后台 Subagent 的全量原始日志（JSONL 格式，包含数万 Token 的中间推演、文件读取和工具交互）整体灌进了主控线程。随后，主控 Agent 又重复执行了一次相同的查询。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-29-orchestrator-tax-working-memory-img-01-cost_distribution.png)

这两次操作把庞大的中间废料永久留在了主控上下文里。即使后续不再调用该工具，这些日志依然在之后的每一次 Turn 中占据注意力资源。这就是所谓的“主控税”（Orchestrator's Tax）：**上下文污染（Context Pollution）具有复利属性，只要废料一旦侵入主线程，后续的每一步决策都会被强制征税。**

先前在分析 [Agentic Workflow 烧掉的钱去哪了？](https://ntlx.github.io/articles/token-efficiency) 时，我们就曾讨论过无序轮询与滥用并发带来的系统性低效。而这次事故进一步证明：Context Window 变大（无论是 200k 还是 2M）都无法解决这个问题，因为容量上限的提升只是给垃圾堆积提供了更大的空间，反而让注意力分散的隐患变得更加隐蔽。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-29-orchestrator-tax-working-memory-img-02-context_pollution.png)

## 认知局部性：任务拆分不能只看代码文件

造成主控税的另一个常见原因，是任务拆分粒度与知识结构的不匹配。

在重构过程中，两个 Subagent 被分配到了同一响应管道的不同区域。虽然它们修改的文件不同，但为了开始工作，两个 Subagent 都必须独立读取相同的架构文档、理解相同的测试约定、建立完全相同的代码模型。这种独立的“方向重构成本”（Orientation Cost）构成了大量重复消耗。

这引发了一个重要概念——**认知局部性（Cognitive Locality）**：

> 需要相同心理模型（Mental Model）和认知上下文的任务，应当尽量保留在同一个 Agent 中处理；如果强制切碎，只会迫使多个 Worker 重复从零重建相同的理解。

主控 Agent 是全场唯一跨轮次积累全局架构理解的节点。它记得为什么做出某项设计决策，也掌握着全局约束。而 Subagent 则是“可抛弃的探路者”（Disposable Workers）。探索过程中的试错、反复的文件读取以及高噪音的推演，本就应该被封印在 Worker 的独立 Context 中，绝不应该被倒灌回主线程。

在 [Anthropic 这篇 context engineering 文章](https://ntlx.github.io/articles/anthropic-context-engineering-prompt-retreat) 中，核心结论同样指出：Context Engineering 的终极目标从来不是无脑填充信息，而是精准守护主上下文的纯粹度，让最关键的决策信息占据最高优先级的注意力。

## 防范过度治理：用极简规则替代官僚流程

发现编排漏洞后，工程师的直觉往往是建立一套“严格的审批流程”。例如，强制要求主控 Agent 在启动 Subagent 前必须先向人类报告计划、等待人工批准。

但 Rahul Garg 敏锐地指出，这种做法陷入了“过度治理”（Governance Overhead）的陷阱。人类确认关卡并没有从根源上解决上下文污染问题，反而增加了一轮毫无意义的交互开销，最终只会让人类陷入“盲目点击同意”的心理疲劳中，演化为纯粹的官僚主义仪式。

正确的治理方式是把实战经验转化为极简的“站立规则”（Standing Rules / CLAUDE.md），只提供明确的事实边界和自我检查点，而不是硬性约束操作步骤：

- **控制并发规模**：单波次优先保持 2-4 个 Subagent。若需启动 5 个以上，主控必须先检查是否有任务共享文件或约定，并优先进行合并。
- **禁止全量日志轮询**：明确禁止拉取完整 Transcript 来回答轻量级的状态查询。
- **收紧并发修改权限**：禁止并发 Agent 内部执行仓库级别的 git 操作（如 git stash），防止跨线程破坏版本树。
- **事实规则优于流程审批**：如果一条缺失的事实（Fact）就能让模型做出正确决策，就只需补充该事实，切忌引入多余的汇报审批节点。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-29-orchestrator-tax-working-memory-img-03-governance_balance.png)

这种“去除流程绷带、只保留核心护栏”的工程思路，与之前 [Anthropic 删掉 80% 的指令](https://ntlx.github.io/articles/claude5-context-rules-bandages) 所传递的理念完全一致：过度繁琐的控制指令本身就是一种上下文负担，简单明确的约束才能释放模型的真实能力。

## 闭环飞轮：从踩坑到更新 CLAUDE.md

长远来看，多 Agent 系统的优化不可能依靠一次性的规则设计完成，而必然是一个持续迭代的闭环飞轮（Flywheel）。

在这个飞轮中：
1. **真实 Session 暴露死角**：在实际开发中注意到不适感（如响应变慢、推理偏轨）。
2. **停止工作并进行反思**：让主控 Agent 对自身编排决策进行事实性审查，定位真实的成本泄漏源。
3. **人类决策与提炼规则**：人类开发者介入判断，区分偶发噪声与结构性缺陷，将有效的模式总结为极简规则。
4. **更新 CLAUDE.md / Harness**：将规则写入全局配置文件，提升后续 Session 的编排质量。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-29-orchestrator-tax-working-memory-img-04-learning_flywheel.png)

软件工程的前三十年，我们在优化 CPU、内存与吞吐量；大模型爆发的第一阶段，我们在精精打算 Token 账单；而在长跑 Agentic 时代，真正决定工程质量的，将是**主控 Agent 工作内存的纯粹度**。

下次在使用 Subagent 之前，不妨问自己一个核心问题：**这个操作究竟是帮你省下了时间，还是往主控 Agent 的脑子里塞进了不该留存的垃圾？**

*你在日常使用 Claude Code 或多 Agent 协作时，是否也遇到过主控线程被中间日志“污染”的情况？你又是如何设计自己的 CLAUDE.md 规则来防范这种泄漏的？欢迎在评论区分享你的实战经验。*

## 参考资料

- [The Orchestrator's Tax - Martin Fowler](https://martinfowler.com/articles/orchestrator-tax.html)
- [Harness engineering for coding agent users - Martin Fowler](https://martinfowler.com/articles/harness-engineering.html)
- [Context Anchoring - Martin Fowler](https://martinfowler.com/articles/context-anchoring.html)
- [Agentic Workflow 烧掉的钱去哪了？ - NTLx Blog](https://ntlx.github.io/articles/token-efficiency)
- [Anthropic 删掉 80% 的指令，删的是绷带 - NTLx Blog](https://ntlx.github.io/articles/claude5-context-rules-bandages)
- [Anthropic 这篇 context engineering 文章，真正把 prompt 赶下了主桌 - NTLx Blog](https://ntlx.github.io/articles/anthropic-context-engineering-prompt-retreat)
