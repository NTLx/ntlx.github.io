---
$schema: starlight
title: 给 Agent 装记忆之前，先决定它该忘什么
description: 五层 Agent 记忆架构最值得保留的不是“多存一点”，而是把写入、检索、替代和遗忘放进同一条可验证的状态协议。
date: 2026-09-16
category: ai-agents
primarySourceUrls: ["https://drive.google.com/file/d/1DslNwq7amjaBZC8mDtDspvTu5VEJwUfC/view"]
---

有些 Agent 的“聪明”很像一位每天重新入职的同事：昨天刚排查完的故障，今天还要从头读一遍；上次已经被纠正的偏好，下一次又被当成新问题；同一个错误路径，换一个会话就重新走一遍。

我最近读到的《Agent Memory Architecture — The 5-Layer Playbook》，就是从这个烦人的重复动作出发，把 Agent 的记忆拆成 working、episodic、semantic、procedural 和 forgetting 五层。原文 PDF 可以在这里下载：[PDF 下载链接](https://drive.google.com/file/d/1DslNwq7amjaBZC8mDtDspvTu5VEJwUfC/view)。

我赞成它把问题从“模型还不够聪明”移到“系统没有保存和整理状态”，但不完全接受它把这套架构包装成一个几乎自动兑现的生产力承诺。读完之后，我留下的判断是：Agent 记忆最重要的设计，不是存储，而是资格。一个事实凭什么进入下一次上下文？一个方法凭什么升级成技能？一条旧记录又凭什么失去影响行动的资格？

![五层 Agent memory 与遗忘闸门核心信息图](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-16-agent-memory-5-layer-playbook-img-00-infographic-core-summary.png)

## 它把“重读昨天”变成了系统问题

模型的上下文窗口解决的是“这一轮能看到什么”，不是“下一个会话还能留下什么”。如果一个 Agent 昨天在长任务里发现了关键线索，但没有把线索、决定和结果写入持久状态，那么今天的模型即使能力完全相同，也只能重新猜一遍。

这份 Playbook 借用了 CoALA 的语言，把当前上下文叫作 working memory，把经历过的任务叫作 episodic memory，把沉淀下来的事实和关系叫作 semantic memory，再把稳定的方法叫作 procedural memory。它额外强调 forgetting：旧事实要被替代，旧事件要过期，冲突要被标记出来。

这个分类的价值不在于“五”这个数字，而在于它拒绝把所有内容都叫作 memory。当前对话、一次事故的经过、关于用户或项目的稳定事实、经过验证的方法，生命周期和使用方式根本不同。如果把它们都扔进同一个向量库，检索做得再快，也只是在更快地召回混在一起的东西。

![原文 Fig. 1：Agent memory flow architecture](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-16-agent-memory-5-layer-playbook-img-01-source-memory-flow.png)

## 四种记忆，其实是四种资格

Working memory 负责眼前的任务。它应该足够短、足够新，能够让 Agent 做当前决定；它不是档案馆，也不应该承诺永久保存。

Episodic memory 记录“发生过什么”：尝试了哪条路径，哪里失败，最后怎样解决，用户改了什么。它更像实验日志，而不是事实本身。一次成功经历可以提醒下一次少走弯路，却不能自动证明方法永远有效。

Semantic memory 负责“现在可以认为哪些事情是真的”。它需要实体、关系、来源、时间和范围。比如“这个项目使用某个 API”与“某个用户偏好某种语言”不是同一种事实；如果事实发生变化，更新应该替代旧值或标记冲突，而不是在旁边再添一条互相矛盾的记录。

Procedural memory 负责“怎样做更可靠”。我尤其喜欢原文给技能设置触发条件、前置条件、步骤、工具和成功标准的做法。一个方法偶然成功一次，最多是一条 episode；只有在重复出现、能够被验证、边界足够清楚时，才值得升级成 skill。

这也解释了为什么我不把 Agent memory 简化成 RAG。Zep 的指南把两者区分得很清楚：RAG 更像在查询静态文档，memory 则要追踪随时间变化、带来源和有效期的状态。LangMem 的文档也把 semantic、episodic、procedural 分开，并把“对话中立即写入”和“对话后后台整理”视为不同的工程选择。

我更愿意把记忆理解成一个资格判断：这段信息现在是否有资格影响我的行动，而不只是“我曾经见过它”。

## 第五层不是垃圾回收，而是权限管理

我认为这份材料最重要、却最容易被读者略过的部分，是 forgetting。

过期、替代和冲突处理看起来像数据库维护，实际是在定义记忆的权限。一个旧 API 地址可能仍然存在于存储里，但不应该继续拥有被调用的资格；一条旧偏好可能仍然有历史价值，但不应该压过用户刚刚明确表达的新偏好；两个互相冲突的事实都没有足够证据时，最可靠的结果不是“挑一个”，而是把冲突交给人处理。

所以，forgetting 不是把数据粗暴删除。我会让记忆带上状态：active、superseded、flagged、archived。系统要回答的不只是“找到了什么”，还包括“它为什么还有效”“它从哪里来”“是否有更新”“谁可以覆盖它”。

![记忆的权限状态：存储不等于授权](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-16-agent-memory-5-layer-playbook-img-02-framework-memory-permission.png)

这也说明，“记住一切”并不等于进步。记忆越久，错误就可能活得越久；范围越大，跨用户、跨项目污染的风险就越大；召回越积极，当前任务被无关历史牵着走的概率就越高。对一次性格式化任务，持久记忆可能只是额外复杂度；对跨会话调试，记住已经尝试过的路径才有价值。

## 标题里的 90%，应该怎样读

PDF 用一个很醒目的数字承诺：记忆可以把 token 成本砍掉 90%。这个方向不是凭空来的。Mem0 的一篇论文在自己的 LOCOMO 实验中报告了超过 90% 的 token cost savings，以及 91% lower p95 latency；论文还把一个 roughly 26,000-token 的 full-context 设置作为对照。

但这组结果应该被读成“特定系统、特定数据集、特定对照下的工程收益”，不能直接翻译成“给任何 Agent 接上记忆就能省 90%”。记忆层也要付出抽取、索引、检索、更新和冲突处理的成本；如果召回了过期事实，省下的 token 可能换来更昂贵的错误行动。

PDF 还把一个 ontology 实验的准确率和 tool calls 数字归给 Snowflake。我没有把这组归因写进结论，因为没有找到题名完全对应的一手页面。Snowflake 当前公开的 Agent GPA 材料反而提醒了另一件更实用的事：评估 Agent 时不能只看最后答案，还要看 Goal、Plan、Action，以及工具选择、工具调用和执行效率。记忆是否有效，也应该放到这条完整轨迹里检查。

Anthropic 的《Building Effective AI Agents》像一脚刹车：先用能解决问题的最简单系统，只有在复杂度带来可测量收益时才增加组件。记忆不是架构的奖杯，而是一个需要证明回报的系统部件。

## 我会先写五条“拒绝记忆”的规则

如果要把这份 Playbook 变成工程决策，我不会先选向量数据库，而会先写出下面五条拒绝条件：

- 没有来源、范围和时间的信息，不能直接升级成 durable fact。
- 没有清晰前置条件和成功标准的方法，不能直接升级成 reusable skill。
- 新旧事实冲突时，不能用检索排序假装冲突已经解决。
- 记忆跨越用户、项目或 Agent 边界时，不能默认共享。
- 没有跨会话回忆、冲突、陈旧和技能晋升测试的记忆系统，不能因为“库里确实有数据”就宣称自己会学习。

这五条规则把文章里的五层重新翻译了一遍：working memory 是当前上下文的预算，episodic memory 是可回放的经历，semantic memory 是带来源的状态，procedural memory 是带验证条件的方法，forgetting 则是所有长期状态的退出机制。

它也和站内几条已有讨论接得上：关于 [Working Memory 的边界](https://ntlx.github.io/articles/orchestrator-tax-working-memory)，我更愿意把记忆看作主控状态的输入门；关于 [ontology 如何变成信任工程](https://ntlx.github.io/articles/genie-ontology-data-stack)，这里补上了事实如何失效的问题；关于 [harness engineering](https://ntlx.github.io/articles/not-the-model-youre-the-harness)，procedural memory 则提供了把一次错误变成下一次检查规则的接口。

## 五层不是终点，是对“记忆”的一次降温

Hindsight 的近期研究把 Agent memory 拆成 world、experience、observation 和 opinion 四个 network，并且把事实与意见、发生时间和置信度分开。这并不说明五层 Playbook 错了，反而说明它更像一张很好的工程地图，而不是已经统一的本体论。

地图最有用的时候，不是替你走路，而是提醒你不要把不同的地形当成同一种路面。Agent 的记忆系统也一样：先让它少重做一次，再让它能解释为什么这么做，最后让它知道什么时候不该再相信自己保存过的东西。

我最后留下的不是“模型终于学会了”，而是一句更克制的话：一个可靠的 Agent，不靠记住最多取胜，它只让经过验证、仍在范围内、没有过期的记忆进入行动。需要被工程化的从来不只是记忆，还有遗忘的理由。

## 参考资料

- [《Agent Memory Architecture — The 5-Layer Playbook》PDF 下载](https://drive.google.com/file/d/1DslNwq7amjaBZC8mDtDspvTu5VEJwUfC/view)
- [CoALA：Cognitive Architectures for Language Agents](https://arxiv.org/abs/2309.02427)
- [Mem0：Building Production-Ready AI Agents with Scalable Long-Term Memory](https://arxiv.org/abs/2504.19413)
- [Anthropic：Building Effective AI Agents](https://www.anthropic.com/engineering/building-effective-agents)
- [LangMem：Long-term Memory in LLM Applications](https://langchain-ai.github.io/langmem/concepts/conceptual_guide/)
- [Claude Code：Memory](https://code.claude.com/docs/en/memory)
- [Zep：AI Agents Guides: Memory, Context & Evaluation](https://www.getzep.com/ai-agents/)
- [Snowflake：What’s Your Agent’s GPA?](https://www.snowflake.com/en/blog/engineering/ai-agent-evaluation-gpa-framework/)
- [Mitchell Hashimoto：My AI Adoption Journey](https://mitchellh.com/writing/my-ai-adoption-journey)
- [DeepLearning.AI：Agentic AI](https://www.deeplearning.ai/courses/agentic-ai)
- [Hindsight：Structured Agent Memory that Retains, Recalls, and Reflects](https://aclanthology.org/2026.acl-demo.27.pdf)
