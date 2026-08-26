---
$schema: starlight
title: 为什么聪明的 Agent 活不过 24 小时？读 Tomasz Tunguz《How Long Should an AI Agent Live?》
description: 长会话不会孕育超级智能，只会从内部腐烂。真正的 Agent 工程学不在于塞下多少记忆，而在于敢在午夜清空自己。
date: 2026-08-26
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-26-how-long-should-an-agent-live-img-00-infographic-core-summary.png)

英国经典童谣里有一句唱道：“Mary, Mary, quite contrary, how does your garden grow?”（玛丽玛丽，性情古怪，你的花园长得怎么样？）

在各大前沿大模型的上下文窗口动辄突破 1M 甚至 2M Token 的今天，许多开发者和架构师都在被一个看似自然的想法诱惑：既然窗口足够大，为什么不让一个 Agent 永远运行下去？让它作为你的终身私人助理或企业全能员工，持续跑上三五年不中断？

著名硅谷投资人、Theory Ventures 创始合伙人 Tomasz Tunguz 在近期的万字观察《How Long Should an AI Agent Live?》中，给出了一个反直觉却极其尖锐的答案：**永远不关闭的会话（Perpetual Session）不仅无法带来持续进化的超级智能，反而会从内部加速腐烂。真正健壮的 Agent 架构，主调度器的生命周期应该严格限制在 24 小时，而具体干活的专家子 Agent 寿命更应缩短至 30 秒。**

读完这篇长文，结合我们自身在 Agent 开发中的踩坑经验，不得不承认：**Agent 的成熟度，不看它能记住多少对话，而看它敢在什么时候主动清空自己。**

## 永生会话的诱惑：从“万能助手”到“状态泥潭”

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-26-how-long-should-an-agent-live-img-01-context_rot_attention_decay.png)

构建“永生 Agent”的直觉很简单：只要不断向上下文追加历史记录，Agent 就能逐渐了解你的喜好、习惯与工作背景。但现实往往在几十轮对话后迅速崩塌——原本极其聪明的模型，突然开始胡言乱语、无视约束、答非所问。

这背后的根本原因在于 **上下文腐烂（Context Rot）**。

正如 Chroma 研究团队在系统性测试中所揭示的，尽管大模型在“大海捞针”（Needle In A Haystack）基准中能轻易找到长文档里的单点事实，但在多轮推理场景下，随着输入 Token 数量的增长，注意力会被无限稀释（Attention Dilution）。模型面对长历史，就像面对一张堆满了三个月外卖盒、草稿纸与废弃便签的书桌：即便桌面面积再大，你的胳膊也随时会被陈旧的垃圾撞倒。

许多团队容易犯的致命错误，就是把模型的“上下文窗口（Context Window）”当成了“操作系统内存与数据库”。前者是概率性的注意力加权空间，后者是确定性的数据存储介质。试图在概率空间里维系持续数月的精确状态，从物理机制上就是行不通的。

## 幽灵指令与休眠木马：长寿命 Agent 的两大死穴

如果说注意力衰减只是降低了工作效率，那么长寿命 Agent 带来的另外两大隐患则是致命的业务风险：

### 1. 临时指令变成永久幽灵（Ghost Instructions）
在日常交互中，人类充满了一次性的临时偏好。比如你在 3 月份随口对助理说了一句：“我这周重感冒，把早上 9 点前的会议都推掉。”

如果这是一个永不重置的长会话，到了 11 月份，Agent 依然会在上下文注意力机制的影响下避开早间时段。临时状态被错误地固化为永久规则，用户甚至根本意识不到 Agent 什么时候被过去的自己所绑架。

### 2. 治理衰减与休眠记忆投毒（Governance Decay & Sleeper Poisoning）
为了避免长会话撑爆 Token，常见的工程做法是“上下文自动压缩/摘要（Context Compaction）”。但陈士阳（Shiyang Chen）等学者在最新的论文《Governance Decay》中发现：**现有的上下文压缩机制在追求任务进度摘要时，会在 30%–59% 的情境下静默丢弃系统最初设定的安全策略与操作边界。**

更危险的是安全攻击面。长期持有邮箱、日历、云盘读写权限的单 Session，就像一扇永远不落锁的后门。正如学术界对“休眠记忆投毒（Sleeper Memory Poisoning）”的研究所示，攻击者只需发送一封带有间接提示词注入（Indirect Prompt Injection）的钓鱼邮件或日程邀请，就能神不知鬼不觉地在 Agent 的长记忆中埋下一枚定时炸弹，在数月之后的特定指令触发下劫持你的业务。

我们在之前讨论 [《Anthropic 这篇长跑 Agent harness 文章，讲透了交接制度》](https://ntlx.github.io/articles/anthropic-long-running-agent-harness) 时就曾指出：长跑型任务的核心不是把上下文无限拉长，而是建立确定性的“交接班协议”。

## 破局解法：24 小时协调者与 30 秒即焚专家

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-26-how-long-should-an-agent-live-img-02-ephemeral_specialist_architecture.jpg)

面对上述死穴，Tomasz Tunguz 给出的解法异常干净利落：**采用分层生命周期设计，将人类作息周期引入系统。**

这一架构由三个核心部分构成：

### 1. 24 小时主协调者（Daily Coordinator）
主协调者的会话生命周期严格限定为 24 小时（自然日）。
- **清晨**：从本地文件（如 `preferences.md`）中读取持久化偏好与当天日历，以一张极其干净的白纸开启新的一天；
- **日内**：不直接执行具体外部工具，仅作为任务分发中心。它可以记住白天的即时上下文（比如“我今天会迟到 15 分钟”）；
- **午夜**：将当天学到的持久偏好沉淀落盘，随后直接**销毁当前会话**，不留任何历史包袱。

### 2. 30 秒即焚专家（Ephemeral Specialists）
当需要干活时，协调者绝不亲自上阵，而是按需拉起专用的临时子 Agent（如日历 Bot、邮件 Bot、搜索 Bot）。
- 每一个专职子 Agent 只被赋予完成该任务所需的最小工具集（Least Privilege）；
- 它的寿命仅有 30 秒到 1 分钟，拿到单次请求、调用工具、返回结果给协调者后，**立刻自毁**。

这种模式不仅彻底隔离了爆炸半径（Blast Radius），更让执行层回到了确定性状态机的轨道。正如我们在 [《循环交出控制权之后：读 ByteByteGo《The Agent Loop》》](https://ntlx.github.io/articles/agent-loop-reading-bytebytego) 中所分析的：控制权交出去容易，但只有把执行者限制在无状态的微小步长内，整个 Loop 才不会失控。

## 睡眠整理与规则落盘：像园丁修剪花园一样修剪记忆

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-26-how-long-should-an-agent-live-img-03-nightly_memory_consolidation.jpg)

会话每天午夜重置，那长期的个性化记忆该存在哪里？

答案是：**模仿人类睡眠，进行离线记忆巩固（Sleep-cycle Consolidation）。**

在每天午夜会话销毁之前，系统会启动一个离线的总结通道（类似于 Anthropic 探索的 Dreams 机制或 Letta v2 的 MemFS 体系）。该离线通道负责做一件事：扫描一整天的交互日志，剔除 99% 的临时废话与即时噪音，提炼出真正具备持久价值的规则（例如“Tomasz 偏好 30 分钟短会”、“周五下午不排外部拜访”），并将其追加到本地的 `preferences.md` 纯文本文件中。

```text
白天：高频交互 -> 日内上下文（允许瞬时废话）
        |
午夜：离线睡眠总结（Dreams Pass）
        |
        +---> 提取核心偏好 -> 写入 preferences.md（确定性落盘）
        |
        +---> 彻底清空 24 小时对话会话（归零重启）
```

这恰恰回应了文章开头童谣里的花园隐喻：银铃与海贝整齐排列，是因为有人在持续照看与修剪。

没有修剪的花园会杂草丛生，没有生命周期终点的 Agent 最终也会被信息垃圾彻底吞没。

## 工程启示：克制才是最高级的智能

Tomasz Tunguz 的这篇分析之所以在硅谷引发广泛共鸣，是因为它击中了当前 AI Agent 落地中最普遍的工程浮躁：**以为模型窗口越大就等于智能越强，以为工具挂载越多就等于功能越全。**

事实上，优秀的软件工程史一再证明：
1. **记忆属于存储系统，不属于计算缓冲区**：把偏好和规则放在 Git 版本控制的 Markdown 文件或 SQLite 中，永远比寄希望于大模型的长上下文更可控、更安全、更可审计；
2. **生命周期是最好的垃圾回收器**：分布式系统里的“Crash-only Software”哲学在 AI 时代依然奏效——最健壮的系统往往是那些随时准备重启、并且重启成本极低的系统；
3. **人类的生物钟是最优雅的工程分界线**：白天保持灵动，夜晚完成沉淀，清晨空杯出发。

如果你的团队正在为 Agent 的“越聊越笨”或不可预测的越权行为而头疼，不妨停下盲目堆砌 Token 的脚步，给你的 Agent 设定一个 24 小时的闹钟。

学会告别昨天，才是走向成熟的开始。

*你在日常开发或使用 Agent 时，是否也遇到过“越聊越笨”或状态污染的困境？你的团队目前是如何管理 Agent 的长短期记忆的？欢迎在评论区分享你的实战见解。*

## 延伸阅读

- [Anthropic 这篇长跑 Agent harness 文章，讲透了交接制度](https://ntlx.github.io/articles/anthropic-long-running-agent-harness)
- [循环交出控制权之后：读 ByteByteGo《The Agent Loop》](https://ntlx.github.io/articles/agent-loop-reading-bytebytego)
- [Google 给 RAG 加的不是更多 Agent，而是停手判断](https://ntlx.github.io/articles/google-agentic-rag-sufficient-context)
- [Agent Engineering 的真门槛：把失败变成资产](https://ntlx.github.io/articles/agent-engineering-production-learning-loop)

## 参考资料

- [How Long Should an AI Agent Live? — Tomasz Tunguz](https://tomtunguz.com/how-long-should-an-agent-live/)
- [Context rot: How increasing input tokens impacts LLM performance — Chroma Research](https://research.trychroma.com)
- [Not All Needles Are Found: How Fact Distribution and Prompting Shape Inference in Long-Context LLMs — arXiv:2601.02023](https://arxiv.org/abs/2601.02023)
- [Sleeper Memory Poisoning in LLM Agents — arXiv:2605.15338](https://arxiv.org/abs/2605.15338)
- [Governance Decay: How Context Compaction Silently Erases Safety Constraints in Long-Horizon LLM Agents — arXiv:2606.22528](https://arxiv.org/abs/2606.22528)
- [Dreams: Memory Consolidation Research Preview — Anthropic](https://platform.claude.com/docs/en/managed-agents/dreams)
- [Letta: Stateful Agent Framework & Memory File System](https://letta.com)
