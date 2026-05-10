---
$schema: starlight
title: Elasticsearch 到 pgvector：Instacart 如何用 Postgres 干掉一堆专业搜索引擎
date: 2026-05-06
description: Instacart 把 Elasticsearch、FAISS 全砍了，只用 Postgres 做搜索，结果还变好了。
coverImage: cover.jpg
---

看完 Instacart 工程师写的搜索架构文章，我最大的感受是——他们走的这条路，跟我很多项目里的直觉一模一样：**别急着引入新东西，先把手里的工具榨干。**

这篇文章讲的是 Instacart 搜索基础设施的真实演进史。不是什么学术论文，就是一群工程师踩过坑之后的复盘。我读的时候一直在点头，有些地方甚至忍不住拍桌子。

## 第一阶段：Elasticsearch，然后发现不对

最开始他们用 Elasticsearch 做全文搜索，听起来再正常不过了吧？搜索不上 ES 上什么？但 Instacart 的业务有个特殊的地方——**数据变更极其频繁**。

想想看，生鲜电商，价格、库存、折扣一天变好几次。十亿级别的商品，每天数十亿次写入。Elasticsearch 的数据模型是 denormalized 的，每次更新都要重写整个文档。价格改了，整个商品文档重新索引。库存变了，再来一遍。结果就是索引负载直接把集群拖垮，修复错误数据要花好几天。

Instacart 还发现在 ES 上跑了 ML 模型之后，索引成本和读取性能都越来越差。读性能甚至随着时间推移在退化。这就很致命了——你加了更好的算法，系统反而更慢了。

## 第二阶段：回到 Postgres 做全文搜索

他们的决定很有意思：把全文搜索迁回 Postgres。

不是加缓存，不是优化 ES 集群，是**迁回关系型数据库**。在 2024 年的今天，这个决定需要勇气。

![从 Elasticsearch 到 Postgres 的架构迁移对比：左侧混乱的 ES 集群 vs 右侧整洁的 Postgres](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-06-instacart-search-img-01.webp)

为什么行得通？几个原因：

第一，他们的商品数据本来就在 Postgres 里。集群已经为高并发做了扩展。等于搜索只是多建了几个 GIN 索引，改了改 `ts_rank` 函数，就得到了性能非常好的文本匹配。

第二，数据规范化带来了**写入量 10 倍的下降**。ES 的 denormalized 模型要求每次更新都重写整条文档，而 Postgres 的关系模型只需要改一个字段。对于频繁变价变库存的场景，这是天壤之别。

第三，ML 特征可以直接存在单独的表里，和商品文档 join 就行。不用在 ES 里塞各种模型系数。

但最让我认同的是他们的一个架构思路：**把计算推近存储，而不是把存储和计算分离。**

现在分布式系统的潮流是存储计算分离，但 Instacart 反着来。以前应用层要调 ES、调其他服务、自己 join 数据、自己过滤——大量网络调用、过度拉取、延迟高。现在把可用性信息和其他数据源直接推进数据库，在数据层做计算。**速度翻了一倍。**

这其实是一个很朴素的想法：数据在哪，计算就去哪。网络调用永远比本地 join 慢。只不过现在太多人为了"架构先进"而忽视了这一点。

## 第三阶段：FAISS 做语义搜索

2021 年，全文搜索稳定在 Postgres 上之后，他们想做语义搜索。Postgres 当时没有原生的 ANN（近似最近邻）搜索能力，所以他们起了一个独立的 FAISS 服务。

查询来的时候，应用层**同时**调 Postgres（全文搜索）和 FAISS（语义搜索），然后把两边的结果合并，用一个线性排序模型打分。

搜索质量确实提升了。"pesto pasta sauce 8oz" 这种精确查询走全文搜索，"healthy foods" 这种模糊意图走语义搜索。两套互补。

![双检索系统并行架构：Postgres 全文搜索与 FAISS 语义搜索的双路并行合并](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-06-instacart-search-img-02.webp)

但架构的问题慢慢暴露出来了：

FAISS 不支持在检索时按属性过滤。想过滤？先多拉一批数据回来，应用层再过滤。结果就是过度拉取，有些相关文档根本没拉到，浪费资源。

两套服务意味着两套开发和维护成本。数据存在两个系统里，迟早会出现不一致。

更关键的是，当两个检索系统分开的时候，你没法用一些更聪明的算法来充分利用两者的优势。你只能做一个粗糙的合并，做不到精细调优。

## 第四阶段：pgvector 统一一切

这就是文章最精彩的部分了。他们用了 pgvector，把关键词检索和向量检索全部塞进 Postgres。

**为什么不用 Milvus、Pinecone 这些专业向量数据库？** 他们的判断很务实：那些方案适合小规模检索集（几万条）。而 Instacart 的数据量级和实时过滤需求，用专业向量库反而要多搭一套 pipeline。

他们已经在 Postgres 上做全文搜索了，pgvector 能让两种检索机制共存于同一个数据库。数据不重复存，维护成本降下来，还能用实时库存作为前置过滤——在语义搜索之前就把搜索空间缩小，延迟降低，也不会过度拉取。

![pgvector 统一架构：全文搜索与向量检索在 Postgres 中合为一体](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-06-instacart-search-img-03.webp)

调优过程也很有意思：

* 他们一开始按每个零售商建单独的 HNSW 索引（像 FAISS 那样），维护上百个索引，很累。后来改成**按零售商目录特征建混合索引**，省心很多。
* `max_parallel_workers_per_gather` 和 `max_parallel_workers` 调到 8，在 pgvector 索引没命中的时候加速扫描。
* embedding 列改用 inline storage 而不是 TOAST，减少一次间接读取。
* 按零售商目录大小调 pgvector 参数？收益不大，放弃了。

这个调优过程特别真实——不是所有优化都有回报，试了没用就放弃，不纠结。

上线 A/B 测试的结果：零结果搜索下降了 6%，增量收入显著提升。用户搜不到东西的情况少了，自然就找到更多商品了。

## 我的几点感受

**第一，"无聊"的技术往往最可靠。** Postgres 在搜索领域算不上"性感"，但它可预测、优雅降级、团队熟悉。Instacart 明确说了："Postgres fails predictably, degrades gracefully." 在生产环境，这比"功能强大"重要得多。

**第二，架构演进是渐进的，不是推翻重来。** 他们没有一步到位上 pgvector。先 ES，再 Postgres 全文，再加 FAISS，最后才统一到 pgvector。每一步都解决了当时的主要矛盾。很多团队的问题是——看到新技术就想一把梭，没有经历这个渐进的过程。

**第三，把计算推近存储这个思路，值得每个后端工程师思考。** 现在大家动不动就微服务、存储计算分离，但很多场景下，数据在哪计算就在哪，反而更快更简单。这不是说存储计算分离不好，而是说不要盲目跟风。

![计算推近存储：数据层计算比应用层聚合更快](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-06-instacart-search-img-04.webp)

**第四，pgvector 这类插件正在改变数据库的边界。** 以前的数据库就是存结构化数据。现在 Postgres 能全文搜索、能向量检索、能跑 ML 特征。不是说它要替代所有专业系统，但对于大多数团队来说，一个够用的 Postgres 远好过五个"专业"但你养不起的系统。

你们团队现在搜索用什么方案？有没有踩过类似的坑？欢迎在评论区聊聊。

## 原文参考

Ankit Mittal. **How Instacart Built a Modern Search Infrastructure on Postgres**. tech-at-instacart (Medium). <https://tech.instacart.com/how-instacart-built-a-modern-search-infrastructure-on-postgres-c528fa601d54>
