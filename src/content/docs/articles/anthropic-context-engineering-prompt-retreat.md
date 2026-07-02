---
$schema: starlight
title: Anthropic 这篇 context engineering 文章，真正把 prompt 赶下了主桌
description: Prompt 没失效，但它已经退成上下文工程里的一个零件；Agent 真正的主战场，开始变成“此刻该让模型看见什么”。
date: 2026-07-03
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-03-anthropic-context-engineering-prompt-retreat-img-00-infographic-core-summary.png)

Anthropic 这篇 [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) 我读完以后，最大的感觉不是“他们又发明了一个新词”。真正留下来的，是一句更硬的判断：**Prompt engineering 没有消失，但它已经不再坐主桌了。**

过去两年，很多团队谈 Agent，还是习惯先问 prompt 怎么写、system message 怎么组织、few-shot 要给几个例子。这些当然还重要。但 Anthropic 这篇文章真正推进的一步，是把问题往前挪了半层。它不再问“这一段提示词该怎么写”，而是问：**在这一轮推理里，什么东西值得进上下文，什么东西不值得，什么东西应该晚一点再拿进来。**

这个变化听上去像措辞升级，实际上是工程重心迁移。因为一旦 Agent 开始多轮运行、调用工具、读取文件、写笔记、压缩历史、派子代理，失败点就不太像“不会说”，而更像“塞错了、塞多了、塞早了”。我觉得这篇文章最值钱的地方，就在于它终于把这个问题摆上台面。

而且它和 Anthropic 过去几篇文章是能拼起来看的。我昨天在 [《Anthropic 这篇长跑 Agent harness 文章，讲透了交接制度》](https://ntlx.github.io/articles/anthropic-long-running-agent-harness) 里写过，长跑 Agent 缺的往往不是模型智力，而是交接制度。这篇 context engineering 则把问题继续往前压了一步：**就算交接制度在，注意力预算还是会烂；上下文装配线如果没设计好，Agent 还是会跑偏。**

## Prompt 不是被淘汰了，而是被降级了

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-03-anthropic-context-engineering-prompt-retreat-img-01-prompt_vs_context_shift.png)

Anthropic 在文中给了一个很清楚的切分。Prompt engineering 关注的是怎么写 prompt，尤其是 system prompt。Context engineering 关注的则是整组 token 的配置，包括 system instructions、tools、外部数据、消息历史、MCP、运行时检索结果，甚至模型自己前几轮留下来的痕迹。

这个切分重要，不是因为定义更学术，而是因为它更接近生产环境。真正的 Agent 很少只靠一段 prompt 做事。它通常带着工具，读着环境，反复调用外部信息，再把一部分结果回灌进下一轮。到了这个阶段，prompt 已经不是全部上下文，只是上下文里的一个部件。

所以我会把这篇文章的核心改写成一句更直白的话：**Prompt 没有失效，它只是从主角退成了零件。** 真正的主角开始变成上下文调度。谁决定模型一上来先看什么，谁决定哪些信息常驻，谁决定哪些内容延迟加载，谁决定哪些历史该压缩、该清空、该外存，这些都比“这一句该不该多加个 please”更像今天的工程主问题。

这也让我想起我之前在 [《Loop Engineering：Agent 真正的战场不是 prompt，而是回路》](https://ntlx.github.io/articles/loop-engineering-agent-loops) 里的一个判断：Agent 的差距，最后不会只落在模型会不会说，而是落在回路设计。现在看，Anthropic 这篇文章等于给那个判断补了半句：**回路里最容易被低估的一层，就是上下文回路。**

这里顺带也能看出 Anthropic 的叙事变化。以前 prompt 像“写给模型的说明书”，现在 context 更像“喂给模型的工作现场”。说明书当然还要写，但现场怎么搭，开始比说明书本身更决定结果。

## 这篇文章真正讲的是四个工程动作

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-03-anthropic-context-engineering-prompt-retreat-img-02-four_context_actions.png)

如果把原文的长篇幅压缩一下，我觉得它其实在讲四个非常具体的工程动作。

第一个动作，是**把 system prompt 调到合适海拔**。Anthropic 用得很准的词是 `right altitude`。太低，prompt 会变成脆弱的 if-else 手册，把每一步都写死；太高，又只剩抽象口号，模型根本抓不到操作信号。这个判断很重要，因为很多团队今天的坏习惯，正是把“控制 Agent”误解成“往 prompt 里继续堆规则”。

第二个动作，是**把工具集收窄到最小可用集**。原文反复强调，工具不是越多越好。如果人类工程师都说不清某个场景到底该用哪个工具，那 Agent 更不可能稳定分辨。工具一旦重叠，模型就会把注意力浪费在分叉点上。这个地方和传统 API 设计其实很像：模糊接口不是给自由，通常是在制造歧义。

第三个动作，是**把“先全塞进来”改成“按需取进来”**。这部分我觉得是全文最关键的一段。Anthropic 提到，很多系统以前习惯把相关资料在推理前一次性检索出来，然后整个丢给模型。现在更有效的方式，越来越像让 Agent 只带轻量索引，然后在运行时借助工具去按需探索。文件路径、命名约定、目录结构、时间戳，这些元信息本身就是导航信号，不必一开始把整坨对象塞进上下文。

第四个动作，是**为长任务单独设计记忆延寿机制**。原文把方法分成三类：compaction、structured note-taking、sub-agent architectures。前者是在上下文快满时做高保真压缩；中间那个是把关键状态写进外部笔记；后者则是让主代理只拿子代理的蒸馏结果，不吃掉整段搜索过程。

这四个动作合起来看，其实已经不是提示词技巧了。它们更像一套上下文操作系统：什么常驻，什么临时装载，什么由工具迟取，什么由外存保留，什么交给隔离上下文去跑。

## 真正的分水岭，是预取思维变成运行时思维

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-03-anthropic-context-engineering-prompt-retreat-img-03-prefetch_vs_runtime_retrieval.png)

我觉得这篇文章最值得慢下来读的，是它对 `just in time` context 的偏好。因为这里不只是 retrieval 细节，而是整个 Agent 设计哲学在变。

旧思路更像一个勤快但笨重的秘书：我先尽量多准备，把你可能需要的材料全都摊在桌上。新思路则更像一个会自己翻档案的人：桌上只留目录、索引和少量必要资料，真正要用的时候再去拿。

这背后不是节省几百 token 那么简单，而是对“注意力预算”这件事的态度变了。Anthropic 在文中用了 working memory 的类比，我觉得挺准确。上下文不是越长越好，它是会污染、会退化、会把有用信息埋进去的。你每多喂一段内容，不只是多给了一点信息，也同时多制造了一层竞争。

这也是为什么我越来越不把 RAG 看成“把更多东西找回来”，而把它看成“帮模型在更晚的时候看到更少但更对的东西”。我之前在 [《Google 给 RAG 加的不是更多 Agent，而是停手判断》](https://ntlx.github.io/articles/google-agentic-rag-sufficient-context) 里写过，真正高级的 retrieval 不是勤奋，而是克制。Anthropic 这篇 context engineering 文，本质上也是同一个方向：少一点预取，多一点时机判断。

这一步一旦成立，很多工程习惯都会跟着改。工具的返回结果要更短更干净，索引结构比大对象更重要，目录命名和文件边界不只是给人看的，也是在给 Agent 设导航。上下文工程说到底，不是在给模型“更多知识”，而是在给它“更好走的路”。

## 长任务为什么一定会走向压缩、笔记和子代理

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-03-anthropic-context-engineering-prompt-retreat-img-04-compaction_notes_subagents.png)

原文最后一段讲 compaction、structured note-taking 和 sub-agents，我觉得这部分其实已经超出“context 管理建议”，更像在描述长任务 Agent 的基础设施。

Compaction 解决的是一个最直接的问题：上下文迟早会满。可上下文满了，并不代表任务结束，于是你只能做高保真摘要，再开新窗口继续跑。这里真正难的不是“会不会总结”，而是“知道什么不能丢”。Anthropic 说得比较谨慎，但我的理解更直接：**任何 compaction 都是在做损失压缩。** 只要是损失压缩，就一定存在误杀关键信息的风险。

Structured note-taking 则是在承认另一件事：有些信息不该一直占着上下文，但又绝不能丢。那最朴素的办法，就是让 Agent 像人一样记工作笔记。待办、已知约束、局部结论、后续检查项，这些都该写进外部记忆，而不是期待模型一直“记着”。

Sub-agent architectures 更像一层隔离阀。主代理负责方向和综合，子代理负责深挖和搜索，中间只回传压缩结果。这个做法最核心的价值不是并行，而是**不让搜索过程污染主上下文**。你把几十页探索过程全留在主线程里，最后往往不是更聪明，而是更浑。

所以我会把这三件事理解成同一个问题的三种回答：上下文窗口不够大怎么办？答案不是“盼一个更大的窗口”，而是“承认注意力始终稀缺，然后把记忆结构做出来”。这点和传统系统设计其实一点也不陌生。缓存、索引、日志、checkpoint、子进程，本来就是用来对抗单一工作区的局限。Agent 现在只是把这套老常识重新演了一遍。

## 我对这篇文章的保留意见：高信号到底谁来定义

Anthropic 这篇文章我整体认同，但我也有一个明显保留：它把“最小的高信号 token 集合”说成了目标，却没有把最难的问题讲透，那就是**谁来定义高信号。**

在很多 coding、research、ops 场景里，高信号并不是客观存在的。它往往取决于你此刻的目标函数。你是优先速度还是优先稳妥？优先召回还是优先精度？优先别漏掉背景，还是优先让模型保持焦点？这些取舍一变，同一份上下文里的“有用信息”排序就会变。

也就是说，context engineering 不只是一个信息压缩问题，它还是一个控制权问题。谁来决定哪些信息值得常驻，哪些信息只能按需拿，哪些结果可以被清空，哪些笔记必须持久保存？这些决策如果全交给模型，模型当然会按照眼前目标做局部最优；但局部最优不等于系统最优。

这也是为什么我会把这篇文章和你站里那几篇“控制权”主题的文章放在一起看。Context engineering 表面上在讲 token，底层其实在讲裁剪权。谁握裁剪权，谁就在定义 Agent 此刻的现实。这个问题，绝不是再加一层 prompt 就能解决的。

## 我真正带走的一句话

我最后带走的不是“context engineering 这个词以后会很火”，而是一句更实在的话：**未来 Agent 工程的差距，会越来越落在谁更会管理“此刻该让模型看见什么”。**

模型会继续变强，提示词技巧当然还会有用，但它们更像零部件优化。真正开始决定系统上限的，是上下文装配线：信息什么时候进来，什么时候出去，什么常驻，什么延迟，什么压缩，什么外存，什么隔离。

所以如果今天还有团队把 Agent 设计主要理解成“写一段更厉害的 system prompt”，我会觉得它并不是错了，只是停留在上一个阶段。现在新的主问题已经出现了，而且很工程化，也很不性感：上下文要怎么调度，工具要怎么瘦身，检索要不要预取，长任务该怎么记笔记，搜索过程该不该隔离。

这些问题没有哪一个像 prompt 黑魔法那样好讲，但它们更接近真实系统。也正因为如此，我觉得 Anthropic 这篇文章值得认真读。它不是在发明一个新流行词，它是在提醒大家：**Agent 真正的操作系统，正在从 prompt 扩展成 context。**

*如果你现在要改自己的 Agent 系统，你第一步会动哪里：system prompt、工具集、检索策略，还是长任务记忆结构？*

## 延伸阅读

* [《Anthropic 这篇长跑 Agent harness 文章，讲透了交接制度》](https://ntlx.github.io/articles/anthropic-long-running-agent-harness)
* [《Loop Engineering：Agent 真正的战场不是 prompt，而是回路》](https://ntlx.github.io/articles/loop-engineering-agent-loops)
* [《Google 给 RAG 加的不是更多 Agent，而是停手判断》](https://ntlx.github.io/articles/google-agentic-rag-sufficient-context)
* [《Prompt 不够了，Loop 才是 Agent 时代真正的控制面》](https://ntlx.github.io/articles/claude-loops-control-surface)

## 原文参考

* [Anthropic Engineering: Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
* [Anthropic Research: Building Effective AI Agents](https://www.anthropic.com/research/building-effective-agents)
* [Anthropic News: Managing context on the Claude Developer Platform](https://www.anthropic.com/news/context-management)
* [Chroma Research: Context rot](https://research.trychroma.com/context-rot)
* [Anthropic Engineering: How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)
* [Simon Willison: I think “agent” may finally have a widely enough agreed upon definition to be useful jargon now](https://simonwillison.net/2025/Sep/18/agents/)
