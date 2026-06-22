---
$schema: starlight
title: 你的 Agent 不缺记忆，缺的是学习
description: "Agent 记忆的症结不是\"存不下\"，而是我们造的全是搜索引擎，不是记忆。七种分类、三个框架、最尖锐的批评都指向同一件事：检索是工程妥协，不是学习。"
date: 2026-06-22
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-22-agent-memory-seven-types-guide-img-00-infographic-core-summary.png)

## 无状态的代价：你的 Agent 为什么总忘事

你告诉编程 Agent 你偏好 pytest。第二天它又用 unittest 给你写测试。你说过三遍了。它不是笨。它根本不记得你说过。

LLM 每次 API 调用从零开始。上一个 response 返回的瞬间，你的消息就从它的宇宙里消失了。"stateless by default"，原文这五个字说得干脆。无状态让模型成了完美的答题机器，但也让它永远无法积累经验。

一旦你给 Agent 加上记忆，它就不再是答题机器，而是一个需要"长记性"的系统。问题从"能不能答对"变成"能不能记住上次答了什么"。

## 七种记忆：从 RAM 到"记得下周五要交报告"

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-22-agent-memory-seven-types-guide-img-01-seven_memory_types_map.png)

MarkTechPost 原文把 Agent 记忆切成七块。*工作记忆*是上下文窗口，快、有限、关窗口就没了，就是 RAM。*语义记忆*存"用户偏好 Python"这类事实和偏好，是 Agent 的长期档案柜。*情景记忆*记录"上周帮你规划旅行，结果酒店选错了"，Reflexion 和 ExpeL 系统就靠它写事后复盘，让 Agent 从经验中迭代。

*程序记忆*是技能和流程：第 100 次处理密码重置的客服 Agent 不再从头推理，它执行学会的流程。*外部检索记忆*是你最熟悉的，向量数据库加 RAG，把文档切成块，按相似度拉进上下文。*参数记忆*是预训练烘焙进权重的知识，强但冻在训练截止日。

最容易被忽略的是第七种，*前瞻记忆*：记住"下周一要发周报"的能力。Agent 计划了但还没做的事，如果没有专门机制追踪，一转身就忘了。

原文给了一个最小 Python 实现：几个字典加一个拼接函数，七种记忆就组合起来了。代码简单到有点反讽。真正的问题从来不在"怎么存"。

## 三个学术框架，三种看记忆的视角

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-22-agent-memory-seven-types-guide-img-02-three_frameworks_comparison.png)

七种类型的枚举是分类学的开始，不是终点。怎么组织它们，才是真正分歧所在。

Princeton 的 *CoALA* 框架从认知科学借来四种记忆：工作、情景、语义、程序。但它真正的贡献在于定义了 Agent 如何读写这些记忆模块的动作空间。记忆和决策耦合在一起，不是被动摆在那儿的存储。

2025 年底那篇 40 多人合著的综述换了坐标系。它用*形式-功能-动力学*三维来切：形式问"记忆长什么样"（token、参数、隐向量），功能问"它干什么"（事实、经验、工作状态），动力学问"它怎么活"（形成、演化、检索）。作者们直接宣告：长期/短期这种二分法已经装不下当前系统的多样性了。

华为 Noah's Ark 走得更远。*3D-8Q* 分类法用对象（个人/系统）、形式（参数/非参数）、时间（短/长）三个维度切出八个象限，连 KV-cache 和模型权重都算记忆。

三个框架真正的分歧是：*记忆到底是什么*。CoALA 把它看作认知架构的组件，Forms-Functions-Dynamics 把它看作需要全生命周期管理的工程系统，3D-8Q 把它看作需要路由的信息流。每个视角都看见了一些东西，也漏掉了一些。

## "检索不是记忆"——最尖锐的批评击中了什么

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-22-agent-memory-seven-types-guide-img-03-mem0_vs_langmem_latency.png)

arXiv 2604.27707 没客气：当前 Agent 记忆系统实现的是*查找*，不是记忆。把查找当记忆是"有可证明后果的范畴错误"。

区别在哪？检索按相似度找到和已存内容像的东西。记忆让你从经验中学到东西，然后应用到没见过的情境。新手司机翻笔记说"我开过类似的路"。老司机不需要笔记，经验已经长在反应里。

数据佐证了这个裂痕。LOCOMO 基准测试上，Mem0 的 p95 延迟 0.2 秒、准确率 67%。快，但只是更快地翻档案。LangMem 的 p95 延迟 *59.82 秒*——将近一分钟。它拥有最丰富的程序记忆模型，能让 Agent 重写自己的 prompt，但慢到没法用在任何实时交互里。

这不是工程优化能修的。"Is Agent Memory a Database?"那篇论文说得更直白：CRUD 四个操作对记忆全失效。create 不能整合，update 不能传播，delete 不能调节相关性，read 不能适配上下文。问题不在你选哪个向量数据库，向量数据库本身就不该是记忆的实现。

话说回来，Mem0 在 0.2 秒内返回相关上下文，对大多数产品来说够用了。Mem0 当然有用。但如果把工程妥协包装成终态，就不会有人去找真正的解。那篇论文最后的判断很清醒：检索是当下最好的工程妥协，但整个领域把这个妥协和"学习的充分替代品"搞混了。

## 最小记忆栈：从工作记忆开始，按需叠加

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-22-agent-memory-seven-types-guide-img-04-memory_stacking_order.png)

从做产品的角度，我觉得原文最有价值的部分是分层构建建议。别一次上七种。

*第一层：工作记忆。* 模型自带，不用额外开发。多数简单 Agent 到此为止就够了。

*第二层：语义记忆。* 当用户开始抱怨"它记不住我的偏好"时再加。这是大多数产品需要的第一个长期层。

*再往后按需叠加：* 情景记忆（Agent 需要从失败中学习时）、程序记忆（工作流要固化时）、前瞻记忆（多步规划需要跨会话时）。参数记忆和检索记忆是基础设施层——前者就是模型本身，后者在你接 RAG 的时候就自动获得了。

原则就一条：*不要过度工程化。* 每加一层记忆就多一层复杂度，复杂度需要价值来证成。实践者们说"Memory is where the real differentiation happens. Not the model, not the prompts."——对。但"记忆"在这里到底指什么？

如果记忆是"能找到之前的笔记"，向量数据库够了。如果记忆是"从经验中学到东西"，目前没有人真正解决它。每一篇"给 Agent 加记忆"的文章和产品，大多数加的是查找。这没什么错——只要我们不骗自己说这就是全部。

*你的 Agent 到底需要记忆，还是只需要一个更好的搜索？*

***

## 原文参考

> Asif Razzaq, "The 7 Types of Agent Memory: A Technical Guide for AI Engineers", MarkTechPost, 2026-06-21
> <https://www.marktechpost.com/2026/06/21/the-7-types-of-agent-memory-a-technical-guide-for-ai-engineers/>
>
> Sumers et al., "Cognitive Architectures for Language Agents (CoALA)", arXiv:2309.02427
> <https://arxiv.org/abs/2309.02427>
>
> Hu et al., "Memory in the Age of AI Agents", arXiv:2512.13564
> <https://arxiv.org/abs/2512.13564>
>
> Wu et al., "From Human Memory to AI Memory", arXiv:2504.15965
> <https://arxiv.org/abs/2504.15965>
>
> "Contextual Agentic Memory is a Memo, Not True Memory", arXiv:2604.27707
> <https://arxiv.org/html/2604.27707>
>
> "Is Agent Memory a Database?", arXiv:2605.26252
> <https://arxiv.org/html/2605.26252v1>
