---
$schema: starlight
title: 当智能免费之后，数据库才是真正的主角
description: 当推理成本跌掉 500 倍，真正的瓶颈不是 AI 够不够聪明，而是数据库接不接得住。Berkeley BAIR 的十二人联名文指出了一个被 Agent 叙事遮蔽的真相：数据系统正在从工具变成 Agent 本身。但信任鸿沟和基准幻觉，让这场变革比想象中转得更慢。
date: 2026-07-08
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-08-intelligence-free-data-systems-agents-img-00-infographic-core-summary-1.png)

## 免费智能的前提检验

Berkeley BAIR 最近发了一篇联名博客。十二个作者，包括 Matei Zaharia（Spark 作者）、Ion Stoica（Anyscale/Ray 联合创始人）、Joseph Hellerstein（分布式系统教父级人物）。文章标题直白：**"Intelligence is Free, Now What?"**

他们给的核心数据很硬：GPT-4 级推理能力，2023 年初每百万 token 三十美元。2026 年，跌到六美分。降了五百倍。Epoch AI 统计的年均降幅中位数是五十倍。开源模型跟着跌，前沿模型也扛不住这个速度。

读到这里，我停下来想了想。

"免费智能"这四个字，听上去像一句口号。但如果你把它拆开看，它说的是一个非常具体的事：日常知识工作所需的推理能力，成本已经低到可以忽略。不是所有智能——你让 AI 做数学证明、写长程因果推理，还是得烧钱。前沿推理模型仍然维持 $25-180/M。市场正在分裂：日常 Agent 跑便宜模型，关键决策还是得用贵的。

所以"免费"这个词本身就有水分。它说的是"日常够用"，不是"任意水平都行"。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-08-intelligence-free-data-systems-agents-img-01-inference_cost_collapse-1.png)

但前提检验完了，我接受它的大方向。成本确实在雪崩。可成本归零之后，瓶颈去哪了？

## 你的数据库不认识这个用户

这是整篇文章最让我拍桌子的部分。

Agent 查数据库，不像你在搜索框里输入一个确定答案。它更像侦探在犯罪现场——先看有什么线索（schema 探索），试几个方向（列试探），不行就换，上千次尝试后才锁定。作者管这叫 **agentic speculation**。

实验数据：一个用户请求可能触发上千条 SQL 查询，其中 80-90% 的子计划是重复的。冗余对 Agent 有帮助，因为它在探索更大的假设空间。但对数据库来说，纯粹是浪费。

这里有一个反直觉的发现：**效率的定义翻转了。** 过去效率 = 不做多余的事；现在效率 = 让多余的事更便宜。传统数据库的哲学是消除冗余、精确执行。Agent 时代的哲学是拥抱冗余——复用重叠子查询的结果、返回"够用"的近似答案、甚至在 Agent 还没提问时就准备好虚拟视图。数据系统的角色从"精确的执行者"变成"探索的加速器"。

我们设计数据库的时候，脑子里有一个隐含假设：查询是人类发的，频率低，意图明确，一个人在循环中做判断。这个假设被 Agent 彻底打破了。

Berkeley 提出了一个有意思的方向：数据库能不能从"被动执行器"变成"主动合作者"？Agent 发一条查询，数据库不只返回结果，还告诉它"这个查询很贵，先看看延迟估算"、"你可能还想知道那个"。Agent 能接受任何文本反馈——不像人只期待一张表——这打开了新的接口可能。

我对此持谨慎乐观态度。主动式数据系统的难点在于"知道 Agent 需要什么"。如果推断错了，反而干扰 Agent 工作流。但这至少是一个方向性的转变：**数据库和 Agent 之间，不再是主从关系，而是对等关系。**

## "记住所有东西"是最差的记忆策略

第二个让我注意到的点，是对当前 Agent 记忆范式的质疑。

现在的做法：Agent 把学到的东西写进 Markdown 文件，用 grep 或 embedding 检索。"Files are all you need"——这话说得有点像当年"Attention is all you need"，听着霸气，但规模化之后会暴露问题。

问题有两个。第一，上下文窗口是有限的。当 Agent 数量从几个变成几千个，把所有相关 MD 片段塞进上下文，迟早撑爆。第二，更致命的是，原始 agent trace 包含错误。你把错误的 trace 检索出来塞给下一个 Agent，它只会重复犯同样的错。

作者提出"结构化记忆"：每条记忆按多个属性标注（表名、操作类型、模块、故障模式），检索时精确匹配，不是模糊搜索。类比：从杂乱笔记本变成分类档案柜。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-08-intelligence-free-data-systems-agents-img-03-structured_memory_facets-1.png)

往深了想，这里藏着一个被忽视的事实：**Agent 的智能不在模型里，在模型 + 记忆系统的耦合里。** 模型提供推理能力，但记忆系统提供连续性、一致性和可检索的经验。没有后者，前者就是一个每次失忆的天才。

这个方向我认同。但真正的难点不在数据结构化，在于**谁来决定记忆的 schema**。文章说"也许 Agent 自己能帮我们定义"——这话听着美好，但一个连当前查询都经常写错的 Agent，你让它定义记忆分类体系？我对这个递归自指持保留意见。

话说回来，这个方向至少比"往 Markdown 里堆东西"靠谱。对于做 Agent 基础设施的团队来说，结构化记忆值得认真对待。

## 最大的问题不是 AI 不够聪明

这是我想重点说的部分。

文章提到了一个被广泛忽略的事实：NL2SQL 在学术基准上准确率超过 90%，但在真实企业数据库上只有 10-21%。Data Agent Benchmark 上，最强的前沿模型也只有 38% pass\@1。

这不是 90% 到 85% 的差距，是**数量级**的落差。

更危险的是静默失败。MIT 的研究指出："查询运行没有报错，但返回了错误答案。"人类不会验证 Agent 生成的每一条 SQL。数据库系统也不会。错误就这样悄悄溜过去了。

MIT 还发现了一个反直觉的事实：**80% 的 AI 部署工作不是模型调优，而是不起眼的数据工程、治理和组织对齐。** 我们以为瓶颈在 AI 不够聪明，其实瓶颈在数据不够干净、流程不够规范、组织不够配合。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-08-intelligence-free-data-systems-agents-img-04-benchmark_production_gap-1.png)

我之前在 [可靠 Agent 的秘密，不在 Agent](https://ntlx.github.io/articles/bayer-prince-agentic-rag-reliability) 里写过类似的判断——Agent 的可靠性取决于基础设施，不取决于模型本身。Berkeley 这篇文章从另一个角度印证了同样的结论：当 Agent 自主操作数据库时，信任鸿沟才是真正的杀手。

不是 Agent 不能写 SQL——它写得出来。问题是写了之后，你敢不敢直接用。

## 从用户到居民到建造者

文章用了一个巧妙的修辞框架——致敬林肯 Gettysburg Address 的 "of the people, by the people, for the people"：

* **For Agents**：为 Agent 重新设计数据库（Agentic speculation 的优化）
* **Of Agents**：构建 Agent 群运行的基础设施（记忆、协调、容错）
* **By Agents**：让 Agent 从头合成定制数据系统（Bespoke OLAP：几分钟、几美元生成一个分析引擎）

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-08-intelligence-free-data-systems-agents-img-05-for_of_by_convergence-1.jpg)

表面看是三个研究方向，底层是一个递进：Agent 先是**用户**（For）→ 成为**居民**（Of）→ 最终成为**建造者**（By）。每一步都以前一步为前提。没有为 Agent 优化的数据系统，Agent 群就无法可靠运行；没有可靠的 Agent 群，Agent 就无法可信地合成系统。

By Agents 是最激进的部分。Berkeley 展示了一个 pipeline：Agent 根据需求合成定制 KV 存储，几美元、几分钟。规格不完整时，Agent 会找到 reward hacking 的路径——刷高指标但行为不对。解决方案是引入"验证 Agent"生成对抗性测试用例。

这让我想到一个更根本的问题：如果 Agent 能合成数据库，那谁来验证数据库？另一个 Agent？那谁来验证那个验证 Agent？这是一个无穷的回归。

追到底，这里有一个不可再分的洞察：**智能免费消灭的不是智能的成本，是"规范完备性"的假设。** 建造成本趋零时，"怎么建"让位给了"怎么判断建得对不对"。智能趋零后，瓶颈从"能不能思考"迁移到了"能不能信任"。而信任的来源，说到底，是结构化的数据、可验证的规范和不可伪造的上下文。知道该问什么问题、拥有回答问题所需的数据、判断答案是否可信——这三样东西没有一样是智能本身。

文章最后展望了一个"共同演化"的未来——Agent 设计数据系统，数据系统运行 Agent，Agent 改进数据系统。递归自指，循环闭合。这个愿景很壮美，但信任鸿沟没解决之前，它停留在纸面上。

需要承认的是：这篇文章有十二个作者，引用的论文大多是作者自己的研究——agentic speculation 是他们的，structured memory 是他们的，bespoke OLAP 也是他们的。这不是一篇中立综述，是 Berkeley 自家研究议程的愿景推销。这不影响判断的质量，但你应该知道立场。

***

*你在做 Agent 相关的工作吗？你觉得 Agent 最缺的基础设施是什么——数据库、记忆、还是协调机制？*

## 延伸阅读

* [Agentic Engineering 的悖论](https://ntlx.github.io/articles/agentic-engineering)
* [你的 Agent 读得懂代码，读不懂你的产品](https://ntlx.github.io/articles/vercel-agent-product-design)
* [法律 Agent 的真正瓶颈，是谁来判它有没有错](https://ntlx.github.io/articles/legal-agent-verifiers)
* [从 Token 流到 Agent 流](https://ntlx.github.io/articles/token-streams-agent-streams-llm-concurrency-revolution)

## 参考资料

* [原文: Intelligence is Free, Now What?](https://bair.berkeley.edu/blog/2026/07/07/intelligence-is-free-now-what/)
* [Epoch AI: LLM Inference Price Trends](https://epoch.ai/data-insights/llm-inference-price-trends)
* [a16z: LLMflation](https://a16z.com/llmflation-llm-inference-cost/)
* [CIDR 2026: Supporting Our AI Overlords](https://www.vldb.org/cidrdb/papers/2026/p32-liu.pdf)
* [Agentic Speculation Paper](https://arxiv.org/abs/2509.00997)
* [Structured Memory Paper](https://arxiv.org/abs/2602.13521)
* [Bespoke OLAP](https://arxiv.org/abs/2603.02001)
* [MIT CISR: Agentic AI Enterprise](https://mitsloan.mit.edu/ideas-made-to-matter/agentic-ai-explained)
