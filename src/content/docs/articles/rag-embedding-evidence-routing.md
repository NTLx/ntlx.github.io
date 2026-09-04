---
$schema: starlight
title: RAG 最先要解决的，不是模型会不会答，而是证据有没有进场
description: RAG 的上限，常常不是大模型会不会写，而是 embedding 有没有把决定性证据送进上下文。相关不等于可回答，换模型更不是换个接口那么简单。
date: 2026-09-05
category: ai-models
---

我读到 ByteByteGo 这篇文章时，先注意到一个有趣的错位：URL 里写的是 “shrink a language model”，页面标题却是 “Why Your RAG System Is Only as Good as Its Translator Model”。它并没有教我们怎样把语言模型变小，而是在讨论另一个更容易被忽略的问题：**在 RAG 里，真正决定答案能不能站住脚的，可能不是最后负责写答案的模型。**

文章用一个很朴素的例子开场：文档写着年度订阅只能在 30 天内退款，用户却问“买了 45 天还能退吗？”，系统给出了“可以”。问题出在证据没有被正确选中，流畅只是把它盖住了。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-05-shrink-language-model-00-infographic-core-summary.png)

## RAG 先做的不是回答，而是决定让谁进场

很多人谈 RAG，第一反应还是“给大模型接一个向量数据库”。但这句话漏掉了一层：RAG 不会把知识库整体搬进上下文，而是先从大量材料里挑出少数几段，再让模型处理它们。

RAG 原始论文写的就是这种分工：语言模型保留参数化记忆，外部索引提供可以被检索的非参数化记忆。它把 RAG 视为让模型访问外部知识的一种生成方式，而不是单纯扩大模型参数。[RAG 原始论文](https://arxiv.org/abs/2005.11401)讨论的，正是“生成器 + 外部检索记忆”的组合。

一次回答其实要过两道门。第一道门决定哪些片段进入上下文，第二道门才处理如何理解片段、写出答案。Embedding model 主要参与第一道门：它把 query 和文档片段放进同一个向量空间，再依据距离或相似度排出 top-k 候选。

这让我重新理解了“translator”这个比喻。Embedding 不是把“退款”翻译成某个叫作退款的数字，而是把整段问题转换成检索系统可以比较的坐标。它要回答的是：“这个问题应该靠近哪一类证据？”方向一旦偏了，后面的语言模型就只能在错误的候选集合里表现聪明。

更大的模型当然可能更谨慎：它看到片段没有回答问题时，或许会选择说“资料不足”。但如果正确的 30 天政策根本没有被召回，它不能从一句“只根据提供的资料回答”中变出那段政策。Prompt 可以约束它不要乱猜，却不能替检索器完成缺失的搜索。

## “相关”是检索系统最危险的中间答案

Embedding 擅长找语义相近的内容，但业务真正要找的是能够支撑答案的事实，而不只是同一主题的内容。两个标准并不相同，演示文稿常常把这点略过去。

比如，用户问“获批后的退款多久能到账”，检索结果却是“哪些购买行为符合退款资格”。它们都在谈退款，甚至可能共享大量词汇，但第二段并没有回答时间。再比如“管理员可以删除归档项目”和“管理员不可以删除归档项目”，除了一个否定词几乎一样；“30 天”和“60 天”也只差一个数字，却足以让最终答案完全相反。

版本和实体问题更麻烦。旧政策和新政策可能只有日期、额度或产品名不同，billing address 和 email address 也都属于“账户信息变更”。向量空间能够表达相似，却不会自动替我们决定哪个版本具有权威性、哪个字段才是用户问的那个字段。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-05-shrink-language-model-01-evidence-gate-failures.png)

所以我不太愿意把“召回相似度”当作 RAG 质量的代理指标。测试问题至少要覆盖答案性、否定、数字、版本、实体，以及一个问题是否被多个片段完整覆盖。与其再找一个更漂亮的 benchmark 分数，不如检查前 k 个片段里有没有真正能支撑答案的证据。

读到这里，我会把站内的 [《50 年前的 BM25 再次打败高大上的 RAG：为什么我们依然需要倒排索引？》](https://ntlx.github.io/articles/bm25-wins-at-scale-rag-scaling-study) 放在旁边一起看。它提醒我们，词法锚点没有因为向量检索出现就失去价值。[《Google 给 RAG 加的不是更多 Agent，而是停手判断》](https://ntlx.github.io/articles/google-agentic-rag-sufficient-context) 则补上了另一点：系统要找到候选，也要知道证据够不够。

## 换 embedding，不是换一个接口那么简单

文章里还有一个判断让我记住了：embedding model 的选择，其实带着一张未来的账单。

每个 embedding model 都有自己的向量空间。即使两个模型输出同样长度的向量，也不意味着第 128 个数字在两边代表同一种东西。把文档用模型 A 建好的向量，突然拿模型 B 生成的 query 去比，就像拿两套坐标系里的坐标直接计算距离。

这意味着，换模型通常不是改一个配置项，而是一次索引迁移：重新嵌入语料、建立新索引、同步权限和版本信息、重新评测召回与答案质量，最后再切换线上流量。稳妥的做法是让旧索引继续服务，同时并行构建新索引，等新系统在真实问题集上验证过，再切流并保留回滚路径。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-05-shrink-language-model-02-embedding-migration.png)

我觉得原文还可以再往前推一步：embedding model 不是孤立的模型资产，而是知识库的一部分数据契约。原始 chunk 应该保留在向量库之外；每个 chunk 需要稳定 ID 和内容 hash；embedding 记录要带上模型版本、维度、query/passage 格式、归一化方式和 chunking 版本。否则过几年，连“这条向量是用什么规则生成的”都很难回答。

所以选型时，我不会只问“哪个模型的 benchmark 更高”。还要问：它是否理解我们的领域词汇，能否在可接受的延迟和成本内工作；两年后如果必须更换，我们能不能让新旧索引并存一段时间？我从这篇文章里读到的分量更重：选模型，也是在选择未来如何承担变化。

## Matryoshka 解决的是容量旋钮，不是跨模型魔法

文章最后谈到 Matryoshka embeddings。这个名字很形象：同一个 embedding 的前 256、512 或 1024 个维度，都可以被训练成有用的表示，像套娃一样由粗到细地展开。

我喜欢这个思路，是因为它把“向量到底要多大”从一次性拍板变成了一个运行时取舍。只存小向量，索引更小、搜索更便宜；保留完整向量，再用较短的前缀做第一阶段搜索，则可以在省成本的同时保留日后扩大表示的可能；两阶段检索还可以先用小向量筛候选，再用完整向量精排。

不过，边界要说清楚。Matryoshka 表示学习的原始论文讨论的是让一个表示适应不同下游资源约束，并报告了其研究实验中的收益，不能直接变成某个业务的准确率承诺。[Matryoshka Representation Learning 论文](https://arxiv.org/abs/2205.13147)解决的是同一模型内部的不同表示粒度，不会让模型 A 和模型 B 的向量突然兼容。

如果我们把后面的维度丢掉，未来想扩大表示，仍可能需要重新生成；如果换了模型，完整的重嵌入和索引迁移仍然躲不掉。它更像一个同一坐标系里的容量旋钮，不是一台可以把所有模型压缩到一起的魔法机器。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-05-shrink-language-model-03-matryoshka-tradeoff.png)

## 大模型是最后一公里，不是整个 RAG

读完这篇文章，我留下的是一个更窄、也更可检验的判断：**embedding 是上下文入口的第一道大门，生成模型是最后一公里；中间还有文档质量、解析、chunking、版本、权限、过滤和 reranker。**

这会改变排查顺序。答案错了，先看检索出来的片段，而不是立刻换一个更大的语言模型；片段里没有决定性证据，就修数据和检索；证据已经在上下文里，模型仍然读错，再去看生成策略。更大的模型有时能把错误藏得更像真的，但这不等于它修复了错误来源。

RAG 的“智能”来自几层系统一起做决定：什么被保存，什么被视为相似，什么被允许进入上下文，以及模型是否愿意承认证据不足。优化目标也应放在让证据进场更可靠、更可追溯，并且在下一次模型更换时更容易撤回。

如果你只能先改 RAG 的一层，你会先检查 chunk/版本、embedding 召回、reranker，还是生成模型？为什么？

## 参考资料

- [ByteByteGo：Why Your RAG System Is Only as Good as Its Translator Model](https://blog.bytebytego.com/p/how-to-shrink-a-language-model-without)
- [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401)
- [Matryoshka Representation Learning](https://arxiv.org/abs/2205.13147)
- [《为什么 64k 上下文也答不好“五年故障归因”？GraphRAG 的算力预支与检索终局》](https://ntlx.github.io/articles/graphrag-knowledge-graph-retrieval-architecture)
- [《向量不必急着被压成一个》](https://ntlx.github.io/articles/multi-vector-retrieval-token-level)
