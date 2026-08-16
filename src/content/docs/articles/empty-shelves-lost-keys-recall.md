---
$schema: starlight
title: 大模型不是没记住，而是想不起：Google 揭开前沿 LLM 事实性瓶颈的真实隐相
description: Google Research 实证表明：前沿大模型事实编码率已达 98% 饱和，事实性错误主要源于单步生成无法有效寻址的“钥匙丢失”。思考计算的物理本质是脑内自发检索器。
date: 2026-08-16
category: ai-models
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-16-empty-shelves-lost-keys-recall-img-00-infographic-core-summary.png)

每当大模型在事实性问答中出现幻觉，工业界最惯性的解释往往是“训练数据没覆盖到”或“模型参数容量不够大”。这种归因自然将解决方案推向两个昂贵的方向：继续扩充预训练语料，以及继续堆叠模型参数量。

然而，Google Research 最新发表的研究《Empty Shelves or Lost Keys? Recall is the Bottleneck for Parametric Factuality》（arXiv:2602.14080）通过严格的行为学剖析，打破了这一长期存在的直觉。实验给出了一个颠覆性的事实：在前沿大模型（如 GPT-5、Gemini-3-Pro）中，**95% 到 98% 的事实知识早已完整编码并存储在权重深处**。

模型的仓库并不是空的（Empty Shelves）；真正阻碍它准确输出的，是它在开放式生成时找不到提取这些知识的检索路径（Lost Keys）。大模型事实性能力的瓶颈，已经从“知识习得（Acquisition）”全面转移到了“知识利用（Utilization）”。

## 剖析“伪失忆”：识别与生成的行为学割裂

为了厘清大模型究竟是“根本没学过”还是“临时想不起”，研究团队构建了一个名为 **Knowledge Profiling** 的精细化评测体系，并基于维基百科抽取了包含 2,150 个实体事实、跨 13 款主流模型的评测基准 **WikiProfile**（采样 450 万条模型响应）。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-16-empty-shelves-lost-keys-recall-img-01-knowledge_states_taxonomy.png)

该框架将事实在神经网络中的存在形态划分为三个核心行为维度：

1. **编码探测（Encoding）**：在接近预训练形式的语境诱导下（如命题前缀补全），测试模型能否输出该事实。如果能输出，证明参数内部确实存储了该知识。
2. **多维认知（Knowing）**：测试模型在语义等价但句式多变的问题下（包括直接问答与逆向问答）能否稳定作答。
3. **召回能力（Recall）**：在不给任何提示的开放式问答中，模型是能够直接命中答案（Direct Recall），还是必须经过中间思考步骤才能调出知识（Recall with Thinking）。

评测结果呈现出极其尖锐的割裂：GPT-5 与 Gemini-3-Pro 的事实编码率均超过 95%，但在直接闭卷问答中，依然有 26% 到 34% 的事实回答错误。换言之，模型并非缺乏记忆，而是其自回归解码机制无法在单步预测中稳定定位并激活这些已存知识。

## 参数缩放的物理极限：大模型只扩容了仓库，却没有建立索引

随着模型参数规模的扩大（例如从 Gemma 3 1B 扩展到 27B），一个显而易见的趋势是“完全未编码”的事实比例快速归零。这证明参数缩放（Scaling）确实在高效履行它的职责——充当高容量的知识压缩容器。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-16-empty-shelves-lost-keys-recall-img-02-scaling_and_popularity_gap.png)

但在剩余的所有事实性错误中，**因检索路径阻断导致的“召回失败”占比却在持续攀升**。更深入的数据分析揭示了两个长期被误解的现象：

### 1. 冷门长尾知识并非没有被学习
业界普遍假设长尾实体错误是因为其在语料中出现频率低、模型参数装不下。但 WikiProfile 的对比数据证明：**热门事实与冷门长尾事实的编码率几乎持平（96% vs 93%）**。模型其实早就把长尾知识学进去了，但冷门事实的直接召回率却从热门事实的 78% 暴跌至 52%。长尾问题的本质不是容量短缺，而是神经激活路径太窄、信噪比过低。

### 2. 逆向诅咒不是认知缺陷，而是检索单向性
经典研究（如 Berglund et al., 2023）发现的“逆向诅咒”——模型知道“A 的母亲是 B”，却答不出“B 的儿子是谁”——长期被认为是语言模型缺乏双向逻辑推理能力的证据。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-16-empty-shelves-lost-keys-recall-img-03-reversal_curve_dissociation.png)

然而，Google 团队发现：在**多项选择验证（Recognition）**任务中，逆向问题的准确率与正向问题完全持平，甚至偶尔更高；只有在**自由开放生成（Recall）**时，逆向提问才出现断崖式下跌。这明确证明：反向知识关联早已编码在模型的隐层权重中，逆向诅咒纯粹是因果自回归机制在单向文本生成时面临的检索路径错位。

## 思考的物理本质：不是无中生有的逻辑，而是脑内自发检索

既然参数里沉睡着海量“看得懂选项却写不出答案”的知识，如何才能激活它们？

实验评估了推理计算（Inference-time Compute / Thinking）在事实性问题中的表现，得出了一个非常关键的结论：

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-16-empty-shelves-lost-keys-recall-img-04-thinking_as_recall_recovery.png)

在具备思考能力的前沿模型中，**Thinking 步骤成功找回了 40% 到 65%“已编码但直接回答失败”的事实**。然而，面对那些“确实未编码（参数中不存在）”的事实，Thinking 的恢复率几乎为零（不足 2%）。

这一数据彻底修正了我们对思维链（CoT）与推理模型的传统认知。在非逻辑推演的事实性任务中，**Thinking 的核心功能不是在做数学般的演绎推理，而是充当了模型内部的“自适应检索探针”**。

当直接生成遇到阻碍时，模型在思考过程中输出的中间 Token，本质上是在自主构造一组能够重新激活深层权重的“诱导上下文（Contextual Priming）”。正如我们在讨论大模型可解释性时所意识到的，思维链中的每一个输出词都在动态重构注意力分布，从而把原本在自回归死胡同里的注意力流，引导到蕴藏冷门知识的特定神经元集群中。

## 范式转移：事实性竞争的重心从预训练移向推理路由

Google Research 这项研究不仅清晰界定了大模型内部事实存储与检索的边界，也为下一代大模型架构设计提供了明确的指引：

1. **预训练 Scaling 的边际收益递减**：如果前沿模型的知识编码已经达到 95% 以上的饱和线，那么继续消耗海量算力去微调预训练语料以期消除事实错误，其工程性价比已极低。
2. **RAG 与参数化记忆的重新分工**：在过去的工程架构中，RAG 往往被视为“模型不知情时的外挂知识库”。但正如在 [Google 给 RAG 加的不是更多 Agent，而是停手判断](https://ntlx.github.io/articles/google-agentic-rag-sufficient-context) 中所分析的那样，外挂检索的核心价值也许不在于替代模型记忆，而在于提供高确定性的实体锚点与上下文诱导，帮助模型以极低代价“解锁”其体内已有的海量沉睡知识。
3. **动态检索与自省机制**：鉴于 Thinking 具有高达 60% 的沉没记忆唤回率，未来的推理引擎需要具备精细的“自知力”——在遇到疑问时，自动判断该问题是“钥匙丢了”（启动 Thinking 进行脑内探索）还是“货架本空”（立即转入外部搜索工具）。

大模型事实性的下半场，不再是比拼谁的图书馆藏书更多，而是比拼谁能以更低的推理开销、更敏锐的寻址路径，把深埋在千亿参数中的那把关键钥匙精准取出。

*{你在日常使用大模型时，是否也遇到过“给出选项它全懂、直接提问却答错”的现象？对于解决模型的事实性瓶颈，你更看好推理算力在脑内的自发寻址，还是外挂轻量 RAG 的线索引导？欢迎在评论区分享你的看法。}*

## 参考资料

- [Google Research Blog: Empty shelves or lost keys? Recall is the bottleneck for parametric factuality](https://research.google/blog/empty-shelves-or-lost-keys-recall-is-the-bottleneck-for-parametric-factuality/)
- [arXiv: Empty Shelves or Lost Keys? Recall Is the Bottleneck for Parametric Factuality (Calderon et al., 2026)](https://arxiv.org/abs/2602.14080)
- [The Reversal Curse: LLMs trained on 'A is B' fail to learn 'B is A' (Berglund et al., 2023)](https://arxiv.org/abs/2309.12288)
- [HuggingFace Dataset: WikiProfile Benchmark](https://huggingface.co/datasets/google/WikiProfile)

## 延伸阅读

- [Google 给 RAG 加的不是更多 Agent，而是停手判断](https://ntlx.github.io/articles/google-agentic-rag-sufficient-context)
- [别被 CoT 的“思考”骗了：为什么 Palantir 认为大模型可解释性在模型之外？](https://ntlx.github.io/articles/palantir-black-box-llm-explainability)
- [“模型能跑”不等于“支持生产”：听完 Baseten 聊推理工程，我重新理解了大模型部署](https://ntlx.github.io/articles/inference-engineering-masterclass-baseten)
