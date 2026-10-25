---
$schema: starlight
title: 读 Prime Agent 的 Rust 重写：先让失败说清楚
description: 让 Agent 持续改代码，需要可定位的失败和能反复运行的验收。Prime Agent 的 Rust 重写，也让我看清了迁移任务适合自动化的条件。
date: 2026-10-25
category: ai-agents
primarySourceUrls: ["https://www.primeintellect.ai/blog/prime-agent-rust"]
---

我读 Prime Intellect 的 Rust 重写复盘时，在一张终端截图前停了下来。

左边是 TypeScript 版，中间是 Rust 版，右边列出终端画面的差异。菜单少了一行、光标错了位置，都有机会在这里露出来。原文开场说，两千多个 Agent 用两周重写了自己。我更想知道，这项工作怎么能持续推进，而这张图给了我一个解释。

它给持续改代码的 Agent 提供了一个很具体的回答：这次改动，到底哪里还不一样。

[原文](https://www.primeintellect.ai/blog/prime-agent-rust)是厂商自己的工程复盘，我没有复现其性能测试。但顺着它的方法、参考论文和实际优化记录读下去，我觉得它最值得借鉴的地方，是怎样把失败变成下一次修改的依据。

![文章核心：参照、差分、退回修复和真实使用补漏](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-25-prime-agent-rust-verifiable-rewrite-00-infographic-core-summary.png)

## “差不多能用”要拆成看得见的差异

迁移容易有一种含糊的进度感：程序能启动，命令能执行，演示也顺利，似乎就快完成了。可老用户恢复一段会话，或在工具调用中途切换界面，问题又冒出来。

Prime Agent 把这种含糊拆开了。终端界面用同一套脚本模型驱动新旧程序，比较渲染出来的画面；会话记录和发给模型服务商的请求也做差分；守护进程的消息协议单独核对；脚本不容易覆盖的部分，再逐组件审计哪些匹配、哪些只做了一部分、哪些缺失。

![原文截图：TypeScript、Rust 与 Diff 三栏显示终端行为差异，来源 Prime Intellect](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-25-prime-agent-rust-verifiable-rewrite-01-comparison-parity-source.png)

这让我重新理解了“任务拆分”。按文件或模块分工，解决的是谁来写；把行为拆成能分别检查的观察面，才方便回答哪里写错了。

原文引用的[高性能强化学习环境生成论文](https://arxiv.org/abs/2603.12145)把这个问题讲得更直接。作者将已有环境迁到新的实现时，安排了模块属性、模块交互、完整运行轨迹，以及训练好的策略跨实现运行等分层检查。在 HalfCheetah 的消融实验中，只给完整运行轨迹的失败信号，迭代 42 次仍未收敛；加入完整分层检查后，5 次迭代收敛。论文给出的解释是，端到端失败很难指明物理计算究竟错在哪里。

这个结果不能保证我们手头的项目也会如此。不过它提醒我：一句“测试没过”，有时离可用反馈还很远。错误能否定位到具体属性、交互或输入，会影响 Agent 下一步是在修复，还是继续猜。

## 让失败回到该修复的地方

重写流程也围绕反馈来组织。根 Agent 负责拆任务、跟踪和合并，不写产品代码；任务经过规划、实现、审查、验证。实现者在独立 worktree 中工作，审查者换模型和上下文找问题，验证者在新的沙箱里编译并执行检查。审查或验证失败，就把发现退回实现者；两项通过后才合并。

原文的编排图值得保留，因为它把“有人写完了”和“可以进入主干”之间的步骤画了出来。

![原文流程图：审查或验证失败退回实现者，来源 Prime Intellect](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-25-prime-agent-rust-verifiable-rewrite-02-flowchart-orchestration-source.png)

我对“换个 Agent 审一下”仍有保留。不同模型可能共享相似盲区，另起上下文也不会自动得到正确规格。这里让我更有信心的，是审查之后仍要运行具体检查，失败还有明确的去向。

看原文链接的[会话缓存优化 PR](https://github.com/PrimeIntellect-ai/prime-agent/pull/2856)，这种区别就更清楚。它改的是缓存访问顺序的索引结构，审查记录还纠正了一个解释：旧版本已经遵守 LRU，不能把收益说成换了淘汰策略。记录里能看到输出校验、相邻指标、内存代价，以及不稳定测试的说明。

这些细节未必适合放进发布宣传，却适合拿来判断一个改动。为什么会快，行为是否保持一致，代价落在哪里，都有可追问的对象。只看加速数字，我无法判断这个改动该不该合并。

## 更快的运行时，仍有测量边界

Rust 当然有它的作用。原文提到原生执行、没有垃圾回收，以及编译器对所有权、并发和穷尽匹配的检查。但这次也重划了模块边界、调整会话进程和共享协议；后续优化还涉及启动路径、事件等待与内存释放。把这些收益都归到语言名下，会漏掉许多工程工作。

作者的结果表报告，冷启动后能够输入的延迟从 737.8 毫秒降到 55.8 毫秒，启动后整个进程树的 RSS 从 607.4 MB 降到 106.0 MB。这些是值得关心的交互和资源指标。测量使用脚本模型，排除了推理时间，因此不能顺手解释成写代码更准，或完整任务交付快了相同比例。原文也提醒，跨产品比较来自自定义测试套件，应谨慎解读。

“两周重写”的时间线同样需要读全。作者随后明确说，达到发布质量还用了后续数周，期间补功能、修缺陷、改性能、打磨界面，人也参与发现问题、指导修改和审查结果。

更有意思的是，他们承认差分检查只验证实际执行过的行为。团队转向 Rust 版做日常工作后，继续发现测试没覆盖的缺陷。旧实现能提供参照，却无法替团队穷尽“产品应该怎样工作”。

![不同检验回答不同问题，不能从运行时性能直接外推推理能力](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-25-prime-agent-rust-verifiable-rewrite-03-framework-verification-boundaries.png)

顺带厘清两个容易混用的词：[Prime Agent 原论文](https://arxiv.org/abs/2608.23552)中的“自我改进”包括把经验保存为技能、记忆等持久状态，模型权重保持固定；[仓库 README](https://github.com/PrimeIntellect-ai/prime-agent)则说明，会话进程有助于生命周期隔离和恢复，但并不构成安全沙箱。读“自我改进”“隔离”时，具体改了什么、隔离了什么，都需要继续看下去。

## 我的项目要先补哪种反馈

我不会读完就先增加 Agent 数量。

这次案例有一个有利条件：已经有可运行的旧产品，可以喂入相同输入、比较输出。此前写过的[GitHub Copilot Rust 迁移复盘](https://ntlx.github.io/articles/github-copilot-rust-runtime-rewrite)，也可以放在这个条件下对照阅读。迁移有参照，而从零寻找用户需要什么，往往连验收依据都在变化，不能直接套用同样的速度预期。

如果要在自己的代码库里试，我会先挑一个行为稳定、依赖可隔离的模块，留下真实输入和当前输出，再决定哪些差异必须拒绝、哪些是有意改进。旧版本本身有 bug 时，这个决定尤其不能省，否则忠实迁移也会把 bug 一起搬过去。

接下来才是让 Agent 改实现。失败时保存最小反例，能转成回归检查的就留下来；测试之外仍要观察真实使用。这样，下一轮至少不必从同一处重新摸索。

我也想保留原文“不设固定性能终点”的做法，但前提是候选改动仍要和当前基线交替比较，并检查附近的行为。没有数值终点，不等于只要数字变好就继续合并。

读完这篇，我更愿意用“失败以后怎么办”来判断自动化是否准备好了：能否指出具体差异，能否退回修改，修好后能否留住这个反例。如果每次失败还要人临时解释，我会先补反馈，再增加并行任务。

## 参考资料

- [Rewriting Prime Agent in Rust](https://www.primeintellect.ai/blog/prime-agent-rust)：本文直接阅读对象；规模、流程与总体性能数据均为作者报告。
- [Prime Agent: A Self-Improving RLM Harness](https://arxiv.org/abs/2608.23552)：原文引用的 Prime Agent 论文，补充自我改进机制与边界。
- [Automatic Generation of High-Performance RL Environments](https://arxiv.org/abs/2603.12145)：实际读取的同作者同题 arXiv 版本。原文所链的 [OpenReview 入口](https://openreview.net/forum?id=UmpTwqxiY0)访问受限，未将其当作已读全文。
- [Prime Agent 开源仓库](https://github.com/PrimeIntellect-ai/prime-agent)与[缓存优化 PR 2856](https://github.com/PrimeIntellect-ai/prime-agent/pull/2856)：核对产品边界及具体优化记录；未独立复现其测量。
