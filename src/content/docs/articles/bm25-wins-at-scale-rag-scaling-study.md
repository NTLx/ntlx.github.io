---
$schema: starlight
title: 50 年前的 BM25 再次打败高大上的 RAG：为什么我们依然需要倒排索引？
description: 当 RAG 陷入 GraphRAG 和 Agent 的军备竞赛时，人大 AI Box 跨 450 倍规模的实验揭示：随语料突破千万 Token，BM25 全面反超，以近 20% 优势碾压密向量与图 RAG。真正的智能是确定性降熵。
date: 2026-08-01
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-01-bm25-wins-at-scale-rag-scaling-study-img-00-infographic-core-summary.png)

过去两年，LLM 落地应用最卷的领域莫过于 RAG（检索增强生成）。从最早的纯向量检索（Dense Retrieval），到微软发起的 GraphRAG（知识图谱拓扑索引），再到让大模型自己拿着文件目录做 ReAct 循环的 Agentic Search（智能体搜索），各种号称“颠覆传统搜索”的技术范式层出不穷。

但任何做过大规模企业知识库落地的工程师，心中都有一个挥之不去的阴影：**为什么框架演示时惊艳绝伦的 GraphRAG 和 Agent 搜索，一旦塞进几十万份真实文档、数十亿 Token 的生产环境，不仅费用暴涨，准确率反而砸得惨不忍睹？**

中国人民大学 AI Box 团队最新发表的论文《BM25 Wins at Scale: A Scaling Study of Retrieval-Augmented Generation Paradigms》（arXiv:2607.26497），用一组严密的 Scaling 实验给出了令人震醒的答案：**在 RAG 领域，不存在无条件的赢家，而是存在极其残酷的“规模依赖交叉”（Scale-Dependent Crossover）。**

当语料库规模跨越 1000 万 Token（约 15 级阶梯）之后，50 年前诞生的传统概率检索算法 **BM25 实现了全面反超**，并在最终 50 万文档的全量规模下，以接近 20 个百分点的准确率优势碾压了大部分现代密向量与图 RAG 体系，同时离线构建成本保持为零。

这篇文章，我想聊聊这项研究给所有 AI 架构师带来的深刻反思：为什么在神经网络与 Agent 狂飙的 2026 年，我们反而比以往任何时候都更需要这个经典算法？

## 一、 450 倍规模阶梯：一次打破“小水塘神话”的控制变量实验

在过往的 RAG 评测中，行业存在一个普遍盲区：论文作者们各自在小规模数据集（如几千份文档）上评估自己的算法，随后便宣称“GraphRAG 显著优于传统检索”或“Agent 遍历击败了向量搜索”。这就像在公园池塘里测试航行性能，得出的结论到了大洋深处完全失效。

为了彻底抹平评测偏差，研究团队基于 EnterpriseRAG-Bench 搭建了一个极其严苛的控制变量评估体系：

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-01-bm25-wins-at-scale-rag-scaling-study-img-02-benchmark_corpus_ladder.png)

1. **固化底层证据（The Bedrock）**：把所有问题对应的真实相关段落、硬对抗干扰项（Hard Negatives）和诱导陷阱（Lures）锁定在一个底座集合中。
2. **构建 28 级严格嵌套语料阶梯**：从底座规模开始，按比例按顺序不断注入真实企业文档，形成规模跨度高达 **450 倍**（最高覆盖 50 万文档、数亿 Token）的 28 个嵌套层级。
3. **固定阅读器与裁判**：保持 Reader Model（大语言模型）和 Scoring 逻辑完全一致，纯粹观测“语料库规模增长”这唯一的变量对四种主流 RAG 范式的影响。

正是这种从“小池塘”一直推到“大海”的动态观测，揭开了各种范式的真实面目。

## 二、 规模依赖交叉：Agent 在小库封神，BM25 在大库登顶

实验绘制出的动态 Scaling 曲线展示了极其戏剧化的一幕：

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-01-bm25-wins-at-scale-rag-scaling-study-img-01-scaling_curves_crossover.png)

### 1. 智能体搜索（Agentic Search）的“小库繁华”与“大库迷失”

在语料规模较小的早期阶梯（< 10M Tokens），以 File-System Agent 为代表的智能体搜索表现极其亮眼。因为它允许 LLM 在文件目录中自主浏览、调用工具、多步推理，就像一个经验丰富的图书管理员在小书房里仔细翻找，精准度极高。

但当语料规模扩大 450 倍后，这种“纯依靠 Agent 顺序探索”的机制遭遇了惨败。在海量文件面前，Agent 的 ReAct 循环变成了无头苍蝇般的“随机游走”（Randomized Walk）。不仅单次查询消耗的 Token 开销狂飙了 **39 倍**，而且极其容易被庞大搜索空间中的噪声诱导，性能急速下滑。

这正好印证了我之前在分析 [Google Agentic RAG 的停止机制](https://ntlx.github.io/articles/google-agentic-rag-sufficient-context) 时提到的观点：**当上下文和搜索空间无限扩大时，没有全局索引保护的 Agent 必然陷入“无限探寻”的泥潭。**

### 2. 图 RAG（GraphRAG）的“构建墙”

基于知识图谱与拓扑结构的 GraphRAG 在原理上极其优雅，但在实验中遇到了现实世界最残酷的阻碍——**构建成本墙（Construction Wall）**。

在离线索引阶段，GraphRAG 需要调用 LLM 抽取实体、关系并生成社区摘要。实验测量显示，每索引 1 个语料 Token，GraphRAG 需消耗高达 **24.6 个 LLM 生成 Token**。对于一个 50 万文档的企业库，光是建索引就需要消耗数十亿 Token、花费数万美金和数天时间。更扎心的是，在强行完成构建后，其海量节点带来的拓扑检索准确率，在大型语料层级上依然被 BM25 压制。

### 3. BM25 的低熵逆袭

与高昂的 GraphRAG 和迷失的 Agent 形成鲜明对比的是，**BM25 在 1000 万 Token 附近完成了关键反超**。随着语料库越来越大，BM25 的优势不仅没有衰减，反而与密向量检索（Dense Retrieval）拉开了近 20 个百分点的准确率差距。

为什么古老的 BM25 能做到这一点？答案在于**逆文档频率（IDF）在规模扩张时的数学特性**。在庞大的语料库中，通用词汇的频率极高，而关键领域词汇（如特定产品型号、人名、错误码、协议字段）的 IDF 权重会被海量文档拉得极其陡峭。BM25 凭借确定性的倒排索引，能以 $O(1)$ 的开销瞬间剔除 99.9% 的无关文档，实现极致的“全局硬过滤”（Global Hard Filtering）。

密向量检索（Dense Retrieval）虽然查询速度快，但在高维连续空间中，数十万篇文档的向量聚集在一起极易产生“语义漂移”与高维分布混淆；特别是面对故意设计的硬对抗段落时，向量检索往往把看似语义相关但事实完全无关的噪声推到了前排。

## 三、 重新定义架构分工：检索归检索，Agent 归 Agent

这项研究绝不是要全盘否定 Agent 或现代技术，而是澄清了一个长久以来的架构误区：**我们不应该用 Agent 的探索去替代“全局候选排序”（Global Candidate Ranking）。**

论文在第 5 节做了一个极具启发性的对比实验：当研究者将 BM25 作为一阶段筛选器，把候选缩小到数十篇相关文档后，再让 Agent 进入进行二阶段阅读与多步推理（Agent + BM25），系统的准确率立刻达到了全场最高水平，同时 Token 开销被牢牢锁定在低位。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-01-bm25-wins-at-scale-rag-scaling-study-img-03-graph_rag_construction_wall.png)

这揭示了一个至关重要的架构分工原则：

1. **一阶段：低熵全局硬过滤（Global Candidate Ranking）**
   由 BM25 或包含精准词法锚点的混合检索（BM25 + Reranker）承担。它的使命是“低成本地把大海缩小为几个池塘”，用确定性的规则提供可解释、不漂移的候选基底。
2. **二阶段：高维局部推理（Post-retrieval Reasoning）**
   由 Agent 或 LLM 深度阅读器承担。它的使命是“在池塘里做复杂的跨文档推导与鉴别”。

正如我们在计算 [Copilot Context Model Routing 的 Token 经济学](https://ntlx.github.io/articles/copilot-context-model-routing) 时发现的规律：**最省 Token、最稳定的系统，永远是在最合适的阶段使用最合适强度的计算。** 试图让 LLM 从零开始用纯 Agent 逻辑扫描整个文档库，本质上是用高昂且不稳定的“概率推理”，去硬干“确定性数据结构”最擅长的工作。

## 四、 结语：在混沌中寻找确定性

在 AI 技术日新月异的今天，我们很容易陷入对“新技术范式”的盲目崇拜——似乎模型参数越大、链条越复杂、图谱越庞大，系统就一定越先进。

但《BM25 Wins at Scale》这篇论文用硬核的数据给全行业敲响了警钟：**智能的本质，不是在无边界的熵增中凭空摸索，而是在被确定性规则过滤后的有界空间里高效决策。**

50 年前数学家们基于词频与概率推导出的 BM25，至今依然是抵抗高维向量漂移与 Agent 迷失的最强锚点。对于当下的 AI 架构师而言，真正考验水平的不再是谁能堆叠出更复杂的 Agent 链条，而是谁能清醒地划清“结构”与“推理”的界限，用最朴素的倒排索引，为庞大的大模型应用筑起第一道坚固的防护墙。

***

*你在实际业务中搭建 RAG 架构时，是否也遇到过“小规模惊艳、大规模雪崩”的情况？你目前的检索链路中 BM25 与向量/Agent 是如何分工的？欢迎在评论区分享你的踩坑经验与思考。*

## 参考资料

* [BM25 Wins at Scale: A Scaling Study of Retrieval-Augmented Generation Paradigms](https://arxiv.org/abs/2607.26497)
* [EnterpriseRAG-Bench PDF Paper Source](https://arxiv.org/pdf/2607.26497.pdf)
* [HuggingFace Paper Trending - BM25 Wins at Scale](https://huggingface.co/papers/2607.26497)
* [Hacker News Discussion on RAG Scaling](https://news.ycombinator.com)
* [Reddit r/LocalLLaMA Discussion](https://reddit.com/r/LocalLLaMA)
* [Okapi BM25 Algorithm Specification - Wikipedia](https://en.wikipedia.org/wiki/Okapi_BM25)
* [Microsoft GraphRAG Architecture](https://github.com/microsoft/graphrag)
* [Turbopuffer: Why BM25 Still Dominates Enterprise Search](https://turbopuffer.com/blog/bm25)

## 延伸阅读

* [Google 给 RAG 加的不是更多 Agent，而是停手判断](https://ntlx.github.io/articles/google-agentic-rag-sufficient-context)
* [Copilot 真正在省的不是 token](https://ntlx.github.io/articles/copilot-context-model-routing)
* [Agent 越能写代码，架构越不能乱](https://ntlx.github.io/articles/agentic-development-needs-architecture)
* [从 Token 流到 Agent 流：LLM 应用正在经历它自己的"协程革命"](https://ntlx.github.io/articles/token-streams-agent-streams-llm-concurrency-revolution)
