---
$schema: starlight
title: 编程智能体的“急诊室交接班”：从 Pi 的 Compaction 机制看上下文治理与缓存代价
description: 上下文压缩从来不是省 Token 的小修小补，而是智能体在注意力衰减、KV Cache 前缀失效与会话主权之间的一场精密工程妥协。
date: 2026-08-16
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-16-compaction-in-pi-context-engineering-img-00-infographic-core-summary.png)

任何重度使用过 Claude Code、Pi 或 Codex 的工程师，大概率都遇到过一种诡异的“临界体验”：

在一个涉及十几轮代码重构的长会话里，智能体在前 20 轮执行干脆利落；但进入第 40 轮以后，即便底层模型支持上百万 Token 的超长上下文，它的表现却开始断崖式下滑——要么对几轮前刚刚定下的架构规范视而不见，要么在同一个编译报错上反复打转。紧接着，在某次触发 `/compact` 或系统自动压缩后，终端会出现一次几秒钟的停顿，随后的回复突然又恢复了最初的敏锐。

这种从“混沌迷失”到“神清气爽”的奇妙跳跃，背后对应着当前 AI 智能体架构中最关键却最容易被忽视的一环：**上下文压缩（Compaction）**。

近日，由 Flask 作者 Armin Ronacher 领衔的 Earendil 团队发布了一篇技术复盘《How Compaction Works in Pi》，详细拆解了开源终端编程智能体 Pi 的压缩内核。读完这篇工程记录，最强烈的感受是：**上下文治理从来不是简单的“把文本总结一下变短”，而是横跨模型注意力机制、GPU 缓存物理限制与开发者数据主权的一套精细妥协**。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-16-compaction-in-pi-context-engineering-img-01-context_expansion_handoff.png)

## 为什么百万上下文救不了会话膨胀？

在很多开发者的直觉里，“上下文压缩”似乎是一个正在过时的补丁：既然各大基座模型的上下文窗口已经一路冲到了 1M 甚至 2M Token，为什么我们还需要费尽心思去删减历史？

答案藏在现代 Agent 的交互范式与认知特质中。

Coding Agent 的每一个交互轮次（Turn）都处于极度的“熵增”状态。一个看似简单的修 Bug 动作，背后是级联展开的 Token 洪流：
1. **基础环境注入**：System Prompt、项目规范文件（如 `AGENTS.md`）、十几个工具的 JSON Schema 定义；
2. **工具往返膨胀**：Agent 发起 `grep_search`，终端返回数百行搜索结果；读取整个源码文件，再次追加数千 Token；执行测试失败，数百行报错堆栈被灌入会话；
3. **轮次线性累加**：每一个 Turn 的 Assistant 回复和 Tool Result 都会原封不动地沉淀为下一轮的历史前缀。

如果不对这股洪流进行干预，即使上下文窗口没有物理溢出，系统也会迅速撞上两堵墙：

第一堵是**算力与计费墙**。全量携带 20 万 Token 的历史去执行下一次单行代码修改，每一次 API 调用都在产生巨额的重复计费与推理延迟。

第二堵则是更为致命的**注意力衰减墙（Context Rot）**。正如向量数据库团队 Chroma 在长上下文退化实验中所证实的：随着无关历史、过时尝试与废弃报错的不断堆叠，LLM 的有效注意力会被严重稀释，其对核心指令的遵循能力与复杂推理准确率会发生显著衰减。

这就解释了为什么我们不能放任上下文无限膨胀。正如站内之前在[《Anthropic 这篇 context engineering 文章，真正把 prompt 赶下了主桌》](https://ntlx.github.io/articles/anthropic-context-engineering-prompt-retreat)中所讨论的：在智能体工程中，**决定产出质量的不再是提示词写得有多华丽，而是送进模型的那几个关键 Token 的信噪比**。

## 像急诊室交接班一样做上下文提炼

既然必须做压缩，那应该怎么压？

最粗暴的做法是截断或者滑动窗口：丢弃最早的 N 轮对话。但这种无差别丢弃往往会把最关键的初始需求、架构约定和踩坑结论一同抹去。

Pi 在工程实现上采取了一种完全不同的隐喻：**软件工程团队的交接班简报（Handoff Briefing）**。

当上下文占用逼近预设阈值时，Pi 会启动独立的压缩流程：
1. **保留最近未压缩尾部（Token Budget）**：Pi 默认保留尾部 20,000 Token（大约 5 到 20 个完整轮次）原样不动。这一设计的精妙之处在于，正在进行的即时代码讨论和局部上下文不需要被过早总结，从而保住了最近推理的精度与连贯性。
2. **切除并序列化更早历史**：将截断点之前的所有历史消息提取出来，作为总结原材料。
3. **角色与 Prompt 彻底解耦**：这是 Pi 最具启发性的工程细节——执行压缩时，Pi 发送的是一个与常规编程会话**完全独立**的单次请求。
   - 系统提示词从常规的“你是一名专家级编程助手”切换为“你是一名上下文总结助手”；
   - 明确要求模型输出一份三段式结构化摘要：**目标（Goal）**、**当前进展（Progress）**与**关键决策（Key Decisions）**；
   - 由于该请求不继承主会话上下文，Pi 可以直接将其路由给**更便宜、速度更快、长文本能力更优的专用总结小模型**，完全无需为主模型的全量历史买单。

在[《Anthropic 这篇长跑 Agent harness 文章，讲透了交接制度》](https://ntlx.github.io/articles/anthropic-long-running-agent-harness)中，我们曾分析过智能体长程运行时的 harness 架构。Pi 的这种压缩设计，正是将宏观的交接班制度下沉到了微观的会话管理内部：**它把先前几十轮的折腾、试错与调试噪音全部清空，只给下一个接班的 Agent 留下三张便签——我们最初要干什么、现在做到了哪、曾经定下了什么不可推翻的决定**。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-16-compaction-in-pi-context-engineering-img-02-kv_cache_prefix_invalidation.png)

## 隐性代价：打碎 KV Cache 的那一瞬间

然而，天下没有免费的午餐。很多开发者在给智能体添加 Compaction 机制时，常常会忽略一个底层硬件层面的硬冲突：**压缩与 Prompt Caching（提示词缓存）的必然冲突**。

现代推理 API 之所以能够把长会话的延迟和价格压下来，核心依赖于服务端的 KV Cache（如 Anthropic 的 Prompt Caching 或 OpenAI 的 Caching）。这套机制的核心前提是**严格的前缀逐字匹配（Exact Prefix Match）**：只要新请求的前缀与上一轮完全一致，GPU 就能直接复用显存中已经计算好的 Key/Value 张量，只为新追加的后缀进行 Prefill 计算。

但当 Compaction 发生时，会话的头部结构被彻底重构了：
- **压缩前**：`[system][tools][旧历史...][保留的最近轮次]`
- **压缩后首个请求**：`[system][tools][压缩摘要][保留的最近轮次][新用户消息]`

从 `[压缩摘要]` 这个位置开始，发生了**第一个 Token 的变动**。

在 Transformer 的注意力机制下，哪怕只是中间变动了一个 Token，其后跟随的所有 Token 计算出的 Key/Value 向量都会发生连环改变。这意味着：**虽然 `[保留的最近轮次]` 中的每一行代码和文字都与几秒前一模一样，但因为它们的前缀变成了摘要，服务端的 KV Cache 瞬间全部失效，这 20,000 Token 必须在 GPU 上经历一次完整的 Prefill 重新计算！**

这就是为什么我们在触发压缩的那一轮交互中，往往会感受到一次短暂的卡顿和计费跳点。

但这绝非设计的失败，而是一场清醒的工程权衡：**用一次性的局部 Cache 失效代价，换取上下文窗口的彻底解脱，并为后续几十轮交互建立起全新的、体积更小的稳定缓存基线**。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-16-compaction-in-pi-context-engineering-img-03-portable_session_vs_opaque_lockin.png)

## 纯文本 vs 黑盒：被争夺的会话主权

如果说上下文管理和缓存博弈是纯粹的工程技术问题，那么 Pi 在会话持久化上的抉择，则直接触及了当下 AI 开发者生态最敏感的神经。

Pi 将压缩后的上下文摘要以**纯文本（Plain Text）**的形式直接追加在本地的 Session 文件中。这意味着你的整个编程会话是一个完全透明、随时可用人类肉眼阅读、随时可以用 Git 管理的文本流。

这种看似“朴素”的做法，恰恰是对当下某些商业 API 做法的无声反叛。

正如 Armin Ronacher 在 Earendil 的另一篇檄文《The Session You Cannot Take With You》中所尖锐指出的：如今许多闭源推理 API 正在通过技术手段制造新的“供应商锁定（Vendor Lock-in）”：
- 它们向会话中塞入加密的思考过程（Encrypted Reasoning Tokens），用户被按量计费却根本看不见内容；
- 它们在服务端维护黑盒化的 Compaction 状态与子智能体通信，只给客户端返回一个不透明的 opaque ID；
- 开发者看似拥有一份本地日志，但只要切断与该平台的 API 绑定，这份会话就变成了一堆无法解析的乱码废铁。

Pi 的实践证明了一种更健康的可能：**智能体的记忆应当完全属于开发者**。一份基于纯文本 Goal/Progress/Decisions 的交接记录，不仅能让当前的 Claude 模型继续工作，哪怕下一秒你切换到 GPT、DeepSeek 或是本地开源大模型，新的模型依然能凭借这份人类可读的简报无缝接手任务。

## 给智能体开发者的三条架构启示

从 Pi 的压缩设计与 Earendil 的技术探索中，我们可以为当下的 Agent 开发提炼出三条极其务实的工程原则：

1. **别把 Compaction 当成垃圾兜底，把它当成注意力 GC**：不要等到上下文溢出报错时才慌忙压缩。主动设立滑动保留阈值，定期执行结构化摘要，核心价值在于重置信噪比，防止 Agent 在长程任务中发生认知退化。
2. **分离“执行大脑”与“总结大脑”**：不要用最贵的大模型去总结自己冗长的工具调用历史。把压缩提炼设计为独立的无状态任务，分派给专注摘要的高性价比模型，能大幅优化长程智能体的经济性。
3. **守住会话的可移植性**：拒绝让智能体的上下文状态沦为云端私有格式。坚持用标准 Markdown 或纯文本维护 Goal/Progress/Decision 状态机，只有这样，你的应用才具备跨模型演进的真正自由度。

*你在构建或使用 Coding Agent 的过程中，遇到过哪些由于上下文过长而导致的“翻车”现象？你更倾向于让模型自动压缩，还是手动按阶段新建会话？欢迎在评论区分享你的实战体会。*

## 参考资料

- [How Compaction Works in Pi — Earendil](https://earendil.com/posts/compaction-in-pi/)
- [The Session You Cannot Take With You — Earendil](https://earendil.com/posts/session-portability/)
- [Prompt Caching In Agents — Earendil](https://earendil.com/posts/prompt-caching/)
- [Context Rot: How long contexts degrade LLM performance — Chroma](https://www.trychroma.com/research/context-rot)
- [Pi: Minimal terminal-first coding agent — GitHub](https://github.com/earendil-works/pi)

## 延伸阅读

- [Anthropic 这篇长跑 Agent harness 文章，讲透了交接制度](https://ntlx.github.io/articles/anthropic-long-running-agent-harness)
- [Anthropic 这篇 context engineering 文章，真正把 prompt 赶下了主桌](https://ntlx.github.io/articles/anthropic-context-engineering-prompt-retreat)
- [Claude Code 把专家重新暴露出来](https://ntlx.github.io/articles/claude-code-expertise)
