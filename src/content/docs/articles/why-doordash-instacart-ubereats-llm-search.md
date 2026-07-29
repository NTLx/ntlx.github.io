---
$schema: starlight
title: 为什么大模型改写搜索，DoorDash、Instacart 和 Uber Eats 选了三种完全不同的路？
description: 大模型落地生产搜索系统，核心绝非选哪个模型，而是切入多深。DoorDash 把模型关进知识图谱笼子里，Instacart 用它统一 Query 意图分流，Uber Eats 把它当成双塔向量底座。架构遗留才是真正决定 AI 整合深度的推手。
date: 2026-07-29
category: engineering
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-29-why-doordash-instacart-ubereats-llm-search-img-00-infographic-core-summary.png)

如果在食物外卖或生鲜 App 里输入“下雨天想吃点健康的”，五年前的搜索引擎多半会吐出一堆风马牛不相及的商品。因为经典关键词引擎只能把这句话切碎成独立词包，完全读不懂背后的场景与情绪。

如今大模型的出现改变了游戏规则。但令人好奇的是，DoorDash、Instacart 与 Uber Eats 这三家面对几乎相同痛点的配送巨头，在 2024 至 2026 年间重构搜索系统时，交出的工程答卷却大相径庭。

大家都在看同一批顶会论文，都在面临长尾搜索和高并发 SLA，为什么最终的架构形状会差这么多？

答案并不在大模型本身，而在它们各自背负的架构资产与历史包袱上。大模型嵌入生产系统的深度，根本不取决于你选了 8B 还是 70B 模型，而是取决于现有系统里“哪一环最让你睡不好觉”。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-29-why-doordash-instacart-ubereats-llm-search-img-01-search_failure_modes.png)

## 食物搜索的真正硬骨头：软意图与硬约束的撕扯

外卖与生鲜搜索是工业界最棘手的语义场景之一。这里不仅有拼写错误（"mozzarela"）、错综复杂的同义词（"soda" 与 "soft drink"）、缩写（"gf pizza" 表示无麸质比萨）以及双语混用（如西班牙语 "pan" 意为面包，而英语中却指平底锅）。

更致命的挑战在于两件事：长尾意图与硬性约束。

高频 Head 查询只占日常搜索的一部分，海量的长尾（Tail）查询极少出现，缺乏历史转化数据，传统分类小模型一碰到就冷启动失效。更糟糕的是硬约束问题——如果用户搜索“素食鸡肉三明治（vegan chicken sandwich）”，这是一个带有极强饮食禁忌（Dietary Restriction）的硬约束。如果搜索引擎仅凭向量相似度（Semantic Similarity）进行匹配，普通鸡肉三明治在余弦相似度上得分极高，极易被推荐给用户。一旦违背了过敏原或素食禁忌，摧毁的是用户的信任底线。

纯词包检索太呆板，纯向量检索又太飘忽。如何让系统既懂“下雨天”的意图，又不把“含奶冰淇淋”推荐给乳糖不耐受患者？三巨头给出了三种完全不同的折中之道。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-29-why-doordash-instacart-ubereats-llm-search-img-02-doordash_knowledge_graph_rag.png)

## DoorDash：把大模型关进知识图谱的笼子里

DoorDash 在大模型爆发前，就花了大量精力构建了一套极其庞大的商品知识图谱（Knowledge Graph）。这个图谱严格定义了 SKU 的菜系、口味、膳食限制（如无奶、无麸质）、品牌与品类。

面对搜索理解，DoorDash 并没有推翻重建，而是把 LLM 限制在两个极其安全的边界内：离线端用 LLM 抽取 SKU 属性丰富图谱；在线端仅用 LLM 做 Query 分词与属性打标。

当用户输入 "small no-milk vanilla ice cream" 时，LLM 不负责去商品库里找货，而是负责将其切碎为“数量=小”、“膳食限制=无奶（dairy-free）”、“口味=香草”、“菜品=冰淇淋”。

更巧妙的是 DoorDash 逆用 RAG（Retrieval-Augmented Generation）的设计。通常 RAG 是把资料喂给 LLM 自由发挥，但 DoorDash 把它做成了Guardrail（防线）：针对用户 Query 的每个片段，先用向量近似最近邻（ANN）检索出图谱中 Top 100 个已知规范标签，然后再让 LLM 从这 100 个已知标签里做选择题，严禁模型自行创造新词。

这种“先检索候选再让大模型勾选”的倒置 RAG，确保了输出永远不会跑偏。下游的检索与排序依然走经典图谱过滤与传统 IR 系统。大模型只在最外围干活，既提升了 30% 热门菜品推荐召回率，又保持了在线高并发的绝对稳定。

这也印证了我们在 `[Google 给 RAG 加的不是更多 Agent，而是停手判断](https://ntlx.github.io/articles/google-agentic-rag-sufficient-context)` 中讨论过的原则：最好的 RAG 往往是在关键节点给大模型施加确定性约束。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-29-why-doordash-instacart-ubereats-llm-search-img-03-instacart_intent_engine_split.png)

## Instacart：意图层的统一与长尾分流

Instacart 遇到的痛点与 DoorDash 完全不同。在引入大模型之前，Instacart 的搜索意图引擎极其繁重混乱：拼写纠错用一个模型，Query 重写用一个 Session 挖掘引擎，意图分类用 FastText 模型，货架分类又用另一个模型。

当用户搜索 "protein" 时，通用分类器会吐出鸡肉、豆腐和牛肉，可 Instacart 的实际转化数据表明，用户真正想要的是蛋白粉和蛋白棒。多套单点小模型维护成本极高，而且面对稀有长尾 Query 缺乏标注数据。

在我们在 `[Elasticsearch 到 pgvector：Instacart 如何用 Postgres 干掉一堆专业搜索引擎](https://ntlx.github.io/articles/instacart-search-infrastructure-on-postgres)` 中提到的演进脉络中，Instacart 始终倾向于精简收拢复杂的检索架构。这次他们直接用大模型重构了整个 Query 理解层（Intent Engine）。

他们的工程策略做到了极其清晰的头尾分流：

- **高频 Head Query**：走离线 RAG 与深度上下文工程（Context Engineering），将热门转化分类与商品细粒度信息编入 Prompt，生成预计算缓存。
- **长尾 Tail Query**：在 Hot path 上部署实时微调的 Llama-3-8B 模型。通过 H100 硬件加速、Adapter 融合与弹性扩缩容，将端到端推理延迟压在 300ms 以内。

通过微调 Llama-3-8B，Instacart 将意图改写覆盖率从 50% 爆发式提升至 95% 以上，长尾查询的无结果率减少了一半。 downstream 的检索与排序依然交给经典机器学习系统，大模型仅在上游接管“理解意图”这一件事。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-29-why-doordash-instacart-ubereats-llm-search-img-04-ubereats_two_tower_qwen.png)

## Uber Eats：将微调大模型嵌入双塔向量底座

如果说 DoorDash 把大模型放在最外围，Instacart 把大模型放在 Query 理解层，那么 Uber Eats 则直接把大模型塞进了检索的最核心底座。

Uber Eats 的挑战是三家中最复杂的：它不仅跨餐馆、超市、零售多个垂直领域，还覆盖全球数十个国家与语种。过去为每个垂直领域独立维护 BERT Embedding 模型的做法，在运维上早已不可持续。

Uber Eats 选择了经典的“双塔向量检索架构”（Two-Tower Architecture），但将 Query 塔和 Document 塔的 Backbone 替换为微调后的 **Qwen2** 大模型。

为了在海量请求下跑通大模型双塔，Uber Eats 采用了三套极致的工程削减手段：

1. **Matryoshka 嵌套表示学习（MRL）**：直接把 Qwen 输出的 1536 维向量截断至 256 维，在召回率损失小于 0.3% 的前提下，存储与计算开销减少近半。
2. **标量量化（Scalar Quantization）**：将 float32 压缩为 int7 标量量化，将 ANN 检索延迟再切掉一半。
3. **前置空间过滤**：先通过 Geo/City 六边形网格和履约类型做硬阻断，急剧缩小向量检索的候选集。

Uber Eats 的文档塔（Item Embedding）完全离线预计算生成 HNSW 向量索引，只有 Query 塔在 Hot path 上实时生成 256 维向量。这种设计让 Qwen 的跨语言与世界知识（例如自动理解西班牙语 "pan" 的场景）直接转化为全域检索能力。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-29-why-doordash-instacart-ubereats-llm-search-img-05-llm_integration_depth_spectrum.png)

## 整合深度光谱：路线选择的真相

把三巨头的架构放在同一条光谱上看，就会发现一个极其有趣的规律：

- **DoorDash（左端·外围增强）**：大模型离线补充图谱，在线仅做受控分词。运行时依然以经典知识图谱与 IR 检索为主。
- **Instacart（中端·意图接管）**：大模型接管整个 Query 理解层（Head 走 RAG 缓存，Tail 走 8B 实时推理）， downstream 维持传统检索。
- **Uber Eats（右端·底座重构）**：大模型（Qwen）直接作为双塔向量引擎的 Backbone，贯穿每一个 Query 与 Document 的向量表达。

没有哪家公司是因为“觉得 Qwen 比 Llama-3 好”或者“觉得知识图谱比向量检索高级”才做出选择的。

DoorDash 选左边，是因为它手里有沉淀多年的知识图谱资产，成本最低、收益最大；Instacart 选中间，是因为它苦于单点意图小模型的维护负债；Uber Eats 选右边，是因为它本来就有成熟的双塔向量检索基础设施，替换 Backbone 是最顺理成章的演进路径。

正如我们在 `[真正替你刷爆 LLM 账单的，不是人，是“善意的重试”](https://ntlx.github.io/articles/retry-isnt-kindness)` 中强调的工程现实：生产系统里的每一次 AI 尝试，都是在算算力成本、SLA 延迟与既有代码包袱的硬账。

大模型绝不是万能的替换件。严肃的工业级架构中，经典检索（BM25/倒排索引）、结构化校验（SQL/图谱）与大模型语义理解必然长期共存。找到那个既能发挥大模型长处、又不会被其随机性与算力开销拖垮的“工程契合点”，才是架构师真正的硬功底。

*在你的生产系统里，大模型目前正停留在哪个整合深度？欢迎在评论区聊聊你的工程妥协与实践。*

## 参考资料

- [Why DoorDash, Instacart, and Uber Eats Integrated LLMs Into Search Three Different Ways](https://blog.bytebytego.com/p/why-doordash-instacart-and-uber-eats)
- [How DoorDash leverages LLMs for better search retrieval](https://doordash.engineering/2024/05/21/how-doordash-leverages-llms-for-better-search-retrieval/)
- [Building The Intent Engine: How Instacart is Revamping Query Understanding with LLMs](https://tech.instacart.com/building-the-intent-engine-how-instacart-is-revamping-query-understanding-with-llms-3286c128525b)
- [Scaling Multilingual Semantic Search in Uber Eats Delivery](https://www.uber.com/blog/scaling-multilingual-semantic-search-in-uber-eats-delivery/)

## 延伸阅读

- [Elasticsearch 到 pgvector：Instacart 如何用 Postgres 干掉一堆专业搜索引擎](https://ntlx.github.io/articles/instacart-search-infrastructure-on-postgres)
- [Google 给 RAG 加的不是更多 Agent，而是停手判断](https://ntlx.github.io/articles/google-agentic-rag-sufficient-context)
- [真正替你刷爆 LLM 账单的，不是人，是“善意的重试”](https://ntlx.github.io/articles/retry-isnt-kindness)
