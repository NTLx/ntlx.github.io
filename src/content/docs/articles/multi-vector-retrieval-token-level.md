---
$schema: starlight
title: 向量不必急着被压成一个
description: 检索模型的胜负常不在参数量，而在你是否保留了完整文档里的细粒度证据，并愿意为这些证据支付可控的索引成本。
date: 2026-08-27
category: ai-models
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-27-multi-vector-retrieval-token-level-img-00-infographic-core-summary-1.png)

我读完 Hugging Face 这篇关于 Multi-Vector Embedding Model 的文章后，记下的是一笔很具体的账：**检索系统到底应该丢掉多少细节，才能换来可以接受的速度和存储成本？**

我们太习惯把一段文本送进 Encoder，再拿回一个向量。向量越小，索引越轻；相似度越容易计算，系统也越容易扩展。这个流程足够成功，以至于“一个文本、一个向量”几乎成了检索的默认形状。

但长文档并不总能被一枚向量完整概括。医疗文本里的药名、剂量、症状和否定词，往往各自对应不同的检索线索。把它们全部揉进一个点，最后留下的可能只是一张丢失了关键标记的摘要。

我感兴趣的地方在于，这篇文章没有把多向量检索写成“新模型必然胜过旧模型”的宣传故事。作者把表示方式、微调数据、负样本、评估集和索引压缩放在同一条实验链上。读下来，我更愿意把它理解成一次提醒：**表示能力的提升，只有在成本边界内仍然可用，才算检索系统的提升。**

## 向量先别急着变成一个

Dense Embedding 的做法，是把一段文本编码成一个固定维度的向量。查询和文档各得到一个点，系统计算两个点之间的相似度。它的优点是快、简单、好存储；代价是文档内部的词语关系被提前汇总了。

Multi-Vector Embedding 则保留了一组向量，通常可以理解为每个 token 或局部语义单元各自留下一个“便签”。查询中的每个 token，会在文档便签里寻找最相近的一个，再把这些局部匹配累加起来。这就是 late interaction，常见的 MaxSim 分数可以写成：

```text
score(query, document) = Σᵢ maxⱼ similarity(queryᵢ, documentⱼ)
```

它在编码阶段没有把所有信息彻底混成一枚向量，把一部分比较工作留到了检索时。查询里的“肾功能不全”可以单独去匹配文档中的相关片段，也不必要求整篇文档在一个整体方向上接近查询。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-27-multi-vector-retrieval-token-level-img-01-dense_vs_multivector_maxsim-1.gif)

这也解释了它为什么既有吸引力又有压力：同一篇文档要存很多向量，索引会变大；检索时要做更多局部比较，系统也需要更聪明的索引结构。多向量不是免费的“细节恢复”，而是把表示阶段省下的一部分信息损失，转换成了存储和计算账单。

## 最让我意外的，是训练从哪里开始

文章里最值得记住的结果，不是某一次微调后的最高分，而是不同起点的模型得到的收益差异。

在一个 25,000 对样本的实验中，`mLateOn-unsupervised` 的 NDCG\@10 从 0.9087 提升到 0.9398，增加了 0.0311；已经经过监督训练的 `mLateOn` 则只从 0.9277 到 0.9319，增加了 0.0042。微调并不是一个按下去就会等比例生效的按钮。起点模型已经学会什么、还缺什么，决定了新增数据是在补短板，还是只是在重复已有能力。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-27-multi-vector-retrieval-token-level-img-02-checkpoint_finetune_lift-1.png)

我从这里读出的判断是：**检索优化的第一问不该是“要不要换更大的模型”，而应该是“当前表示在我的语料上丢掉了什么”。** 如果领域词汇、否定关系或长文档中的局部证据经常被压平，那么保留更细粒度的表示可能比单纯增加参数更对症；如果现有模型已经和目标任务高度匹配，继续微调也许只换来很小的增益和更高的维护成本。

这句话并不意味着大模型没有价值，我只是开始怀疑“模型越大，检索自然越好”这条捷径。模型容量、训练起点和任务分布，必须放在一起看。

## 训练配方其实在决定证据去留

这篇文章的工程细节很密，但它们并非互相独立的参数清单。作者在 MIRIAD 数据集上使用约 100 万对训练样本，并采用 `CachedMultiVectorMultipleNegativesRankingLoss` 与 GradCache，让一个 batch 里的其他样本充当负例，同时降低大批量训练的显存压力。

这里有一个容易被忽略的区别：多向量模型的相似度是许多局部 MaxSim 的累加，分数尺度和单向量模型不同。文章中 dense 模型常用的 scale 是 20，而 multi-vector 模型使用 1。若把旧配方原样搬过来，优化目标的温度就可能已经变了。

文档长度也直接进入了结果。把最大长度限制在 512 个 token，训练速度大约可以提高一倍，但 NDCG\@10 会损失约 0.015。完整训练在一张 RTX 3090 上花了约 14.5 小时，峰值显存约 17.5 GB；只使用 100,000 对样本时，大约 75 分钟就能得到距离完整训练结果 0.012 以内的分数。

这些数字放在一起看，训练配置其实是在回答“哪些证据值得留下”。长度上限决定长文档的尾部能不能被看见，负样本决定模型需要区分多相似的候选，损失函数决定局部匹配如何被奖励，显存和训练时长则决定这个实验能不能被重复。脱离语料与资源谈最佳参数，意义很有限。

## 漂亮分数要先问一句：语料有多难

在 MIRIAD Medical Retrieval 的评估里，微调后的 `mLateOn-medical` 在 200,000 篇 passage 上取得 0.9139 的 NDCG\@10，原始 `mLateOn` 是 0.8520；另一个 top-1 指标分别是 0.849 和 0.758。BM25 的 NDCG\@10 为 0.7501。数字差距很醒目，但我不想把它直接翻译成“多向量检索已经解决了医疗搜索”。

首先，这是一个面向医疗领域的数据集，训练和测试都围绕特定领域的词汇与相关性组织。其次，文章提醒，MIRIAD 中的问题是从 passage 生成的，这和真实用户提出含糊、跳跃甚至带错别字的问题不是同一个难度。再者，文章中的不同表格有不同的评估设置，不能把所有分数当作同一条排行榜上的名次。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-27-multi-vector-retrieval-token-level-img-03-retrieval_benchmark_field-1.png)

所以我更愿意把 0.9139 看作一个条件命题：当语料、查询分布和训练数据足够对齐时，保留 token 级别的匹配，确实可能带来明显收益。它告诉我们该去哪里找增益，却没有替我们证明换到公司内部知识库、法律合同或实时工单后仍然成立。

真正有价值的评估，应该加入自己的长文档、真实查询、难负例和失败案例。尤其要单独检查否定词、数字、实体组合与跨段落证据，因为这些正是“整体意思差不多”的 dense 表示容易遮蔽、而局部匹配可能更擅长保留的地方。

## 模型之外，索引才是账单

多向量模型最诚实的部分，是它没有把成本藏在脚注里。对 200,000 篇 passage 建立原始索引时，存储约 45 GB；做 pooling 后，索引缩小到约 11.2 GB，NDCG\@10 从原始配置的基准降到 0.8991；使用 1-bit FastPlaid 后，索引约 3.37 GB，分数仍有 0.8984；进一步 pruning 到约 1.45 GB 时，分数降到 0.8642。

这组数字在我看来更像一条产品路线。先用完整表示确认收益，再用 pooling、量化和 pruning 把它压到服务预算里。压缩并不等于优化，它只是把“质量损失换成本下降”的选择显式化。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-27-multi-vector-retrieval-token-level-img-04-index_compression_tradeoff-1.png)

这让我想起此前写 [“模型能跑”不等于“支持生产”：听完 Baseten 聊推理工程，我重新理解了大模型部署](https://ntlx.github.io/articles/inference-engineering-masterclass-baseten) 时的一个判断：模型本身只是系统的一层，真正决定用户体验的还有服务栈、硬件、延迟和运维边界。这里同样如此。一个离线 benchmark 上更高的向量分数，不会自动变成更低的查询延迟、更容易更新的索引或更便宜的副本。

在 [模型选型只是虚晃一枪：读 OpenRouter 的大模型供应商性能评估与动态路由指南](https://ntlx.github.io/articles/evaluating-llm-provider-performance-routing) 中，我曾把“模型名”与“可用的服务单元”分开看。多向量检索也需要同样的拆分：模型、编码器吞吐、索引构建时间、存储副本、查询延迟和更新策略，合在一起才是可交付的检索能力。

## 如果把它带回自己的检索系统

读完这篇文章，我不会立刻把现有 dense embedding 全部替换成 multi-vector。更稳妥的动作顺序是：

1. **先画出证据损失**：统计文档长度、段落结构、领域实体和真实查询，找出失败是否集中在局部词语、数字、否定或长距离证据上。
2. **保留简单基线**：至少同时测 BM25、现有 dense 模型和一个 multi-vector 候选，确认增益来自表示方式，而不是数据清洗或评估泄漏。
3. **比较训练起点**：不要只报微调后的最高分，要报告不同 checkpoint 的起点、增益和回归案例。
4. **把索引当成一等公民**：把原始、多向量压缩、量化和 pruning 的存储、延迟、构建及更新成本一起记录。
5. **用真实问题收尾**：把自动生成的问题当作可重复的实验工具，而不是生产效果的替身；最终判断应回到用户真实提出的问题和系统必须命中的证据。

我列这份清单，是想把检索从“换 embedding 模型”的局部动作，重新放回表示、训练、评估和基础设施共同约束的系统问题里。

*如果你的知识库里也有大量长文档，你会先测量被截断的证据，还是先换一个更大的 embedding 模型？*

## 延伸阅读

* [“模型能跑”不等于“支持生产”：听完 Baseten 聊推理工程，我重新理解了大模型部署](https://ntlx.github.io/articles/inference-engineering-masterclass-baseten)
* [模型选型只是虚晃一枪：读 OpenRouter 的大模型供应商性能评估与动态路由指南](https://ntlx.github.io/articles/evaluating-llm-provider-performance-routing)
* [Google 给 RAG 加的不是更多 Agent，而是停手判断](https://ntlx.github.io/articles/google-agentic-rag-sufficient-context)
* [50 年前的 BM25 再次打败高大上的 RAG：为什么我们依然需要倒排索引？](https://ntlx.github.io/articles/bm25-wins-at-scale-rag-scaling-study)

## 参考资料

* [Training and Finetuning Multi-Vector Embedding Models with Sentence Transformers — Hugging Face](https://huggingface.co/blog/train-multi-vector-encoder)
* [Multi-Vector Encoder Training Overview — Sentence Transformers](https://sbert.net/docs/multi_vector_encoder/training_overview.html)
* [ColBERT: Efficient and Effective Passage Search via Contextualized Late Interaction over BERT](https://arxiv.org/abs/2004.12832)
* [ColBERTv2: Effective and Efficient Retrieval via Lightweight Late Interaction](https://arxiv.org/abs/2112.01488)
* [MIRIAD: A Massive Dataset for Medical Information Retrieval](https://huggingface.co/datasets/miriad/miriad-4.4M)
* [PLAID: An Efficient Engine for Late Interaction Retrieval](https://arxiv.org/abs/2205.09707)
* [FastPlaid — LightOn](https://github.com/lightonai/fast-plaid)
