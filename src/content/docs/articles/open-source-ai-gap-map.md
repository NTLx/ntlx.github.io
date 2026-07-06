---
$schema: starlight
title: 开源 AI 不是一张地图，是一张工单
description: 又一份 AI 生态报告并不稀缺，稀缺的是一份能被查询、复核、改错的公共底账。
date: 2026-07-06
category: ai-industry
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-06-open-source-ai-gap-map-img-00-infographic-core-summary.png)

## 我差点把它当成一张海报

我第一次打开 [Current AI 的 Open Source AI Gap Map](https://map.currentai.org) 时，差点把它归到“漂亮生态图”那一类。

这类东西我们见得太多了：一张大图，几十个 logo，几个层级，最后留下一个模糊印象，AI 世界很热闹，开源也很热闹。看完以后该怎么做，仍然不知道。

但这张图往下点几层，味道变了。它不靠“开源 AI 很重要”喊口号。它做的是一件更笨也更值钱的事：把开源 AI stack 拆成产品、分类、组织、分数、引用来源，再把这些东西放进 GitHub 和 notebook 里。

也就是说，它真正重要的地方不在地图页面，而在地图背后的底账。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-06-open-source-ai-gap-map-img-01-static_poster_to_live_ledger.png)

这个差别很大。报告给你结论，底账给你复核入口。报告适合转发，底账适合改错、筛选、重算、写脚本。前者像一张海报，后者像一张公共工单表。

我之前写过一篇 [《开权模型真正打开的是试错路径》](https://ntlx.github.io/articles/open-weight-models-changed-ai)，里面说 open weights 最值钱的地方并非“免费”；它把试错权交还给外部开发者。Gap Map 对生态研究做了类似的事：它把判断权从 PDF 里拆出来，放回数据结构里。

## 真正的入口在数据层

官方发布文说 v0.1 深度评分了 421 个产品：266 个软件工具和库、85 个模型、50 个数据集、20 个硬件项目，覆盖 228 个组织。这个数字是发布时的快照。

我在 2026 年 7 月 6 日重新抓 live site 和 GitHub 主分支时，看到的已经是另一组数字：页面显示 3 层、15 个分类、474 个 scored products；`build/notebook_data.json` 的 `generated` 日期是 2026-07-05；仓库 `sources/` 下已有 1215 个 YAML 文件，其中 products 和 scores 各 474 个，organizations 251 个。

这个差异不小。它说明这张地图会继续长，不是一份封版报告。引用它的时候，你必须带上日期。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-06-open-source-ai-gap-map-img-02-yaml_to_notebook_query_pipeline.png)

更关键的是，Current AI 没有只给你一个网页。它把 curated YAML 放在 [currentai-org/os-ai-map](https://github.com/currentai-org/os-ai-map)，用确定性 pipeline 校验，再序列化成 `build/notebook_data.json`，并通过 notebooks 暴露不同切片。Simon Willison 看到这点时，兴奋点也不在地图 UI，而在 MIT 许可的数据、notebook、schema，以及可以用 Datasette Lite 探索的 16,185 个 GitHub repo 入口。

这才是架构师该盯的东西。

如果你要做选型，不必等别人写“开源推理引擎 Top 10”。你可以自己问：哪些 inference code 是 fully open，maturity 超过 4，adoption 不低，且引用来源是 primary source？如果你做投资扫描，也不用先争“开源 AI 是不是未来”。你可以先看哪一层 Stage 只有 3，哪一层有 openness gap，哪一层有 maturity gap。

生态研究一旦能被 SQL 化，就从观点变成工具。

## 它把“开源”这两个字拆开了

这张地图最有用的地方，是它不让“开源”继续当一个万能词。

Methodology 里把每个产品拆成三条轴：openness、adoption、capability。openness 又不是 yes/no，而是参考 Model Openness Framework、OSI license taxonomy，再扩展到数据和硬件。模型看 weights、data、code、checkpoints、license；软件看许可证和源码；硬件看 schematics、toolchain、datasheets、firmware blobs。

这能挡住很多偷换概念。

一个模型权重能下载，不等于它是 open source。一个硬件开发板 SDK 开源，也不等于它是 open hardware。一个项目 GitHub stars 很高，也不等于它真实 adoption 到了生产层。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-06-open-source-ai-gap-map-img-03-openness_adoption_capability_axes.png)

我喜欢它把 adoption 明确写成 real usage，而不是只看 stars。stars 是兴趣，usage 才是摩擦后的选择。对于模型和数据集，它看 Hugging Face downloads 和 likes；对于 package，它看 PyPI、npm 等 registry；对于消费级闭源表面，它会用流量和 MAU tracker。这里面当然有偏差，但至少偏差被写进了方法论，而不是藏在“行业洞察”四个字后面。

这也接上了我之前写 [MCP 临界点](https://ntlx.github.io/articles/mcp-tipping-point) 时的一个判断：生态成熟不是靠一个明星项目赢，而是靠协议、工具、实现、采用和替代品一起长出来。Gap Map 把这个“长出来”的过程变成了可观察对象。

## 最有用的是那些不成熟

一张生态图如果只告诉你哪里已经强，其实用处有限。强者大家都看得见。

Gap Map 更有用的是那些“不够强”的地方。

当前数据里，Orchestration & agents、Agent tools & protocols、Core ML frameworks & libraries 已经到 Stage 5。这说明开源 AI 不是全面落后。相反，在 agent、协议、核心 ML 框架这些层，开源已经有相当成熟的冗余。

但 Base / pretrained models 和 Fine-tuned / chat models 仍是 Stage 3，而且同时有 maturity 与 openness gap。Safety & Guardrails 也是 Stage 3，gap 是 maturity + adoption。Edge AI hardware 仍是 Stage 3，gap 是 maturity + openness。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-06-open-source-ai-gap-map-img-04-stage_gap_heatmap.png)

这些 gap 比排行榜更有价值。排行榜回答“谁最强”，gap 回答“哪里值得补”。

比如 safety tooling。当前列表里有 OpenGuardrails、LlamaFirewall、NeMo Guardrails、Guardrails AI、LLM Guard、PyRIT、garak 等项目，也有 Meta、NVIDIA、Google、OpenAI、Microsoft、AWS 的 open-ish 或 closed 方案。很多工具 capability 不低，但 adoption 和 maturity 还没有把 fully-open 标准件推到成熟状态。

这就是工单。

“安全很重要”这句话太轻。真正的工单是：哪些 guardrail 项目需要 adoption，哪些需要 benchmark，哪些需要更清楚的许可证，哪些需要被接到真实部署链路里。

## 这张地图也会漂移

我不想把它吹成答案。它不是答案，它是一张可维护的草图。

发布文说 421 个评分产品，live site 已经变成 474。发布时有人记录 1184 个 YAML，我本地拉主分支数到 1215 个。README badge 一度显示 458 products，Dataset 页显示 474。Methodology 顶部说 474，正文 discovery 段仍保留 421。

这不是 bug，也不是坏事。它说明数据在动。

但它要求使用者更严谨：你不能把 Gap Map 当成一条永恒事实来引用。你要说清楚“我在 2026-07-06 看到的是 474 scored products”。你最好连 commit hash 都记下来。否则过两周同一句话可能已经过期。

这种漂移也提醒我们，生态地图最难的不是画第一版，而是维护第二版、第三版。每个 score 都要 primary citation，每个 product 都要归类，每个 category 的 stage 都要能重算。Current AI 把协作入口放到 GitHub PR 里，是对的。没有外部改错机制，这类地图很快会变成漂亮但失真的墙纸。

## 我会怎么用它

如果你是架构师，我建议不要从地图页面开始。

从 GitHub 仓库开始。先看 `sources/`，再看 `docs/methodology.md`，最后看 notebook。页面适合理解结构，数据适合做判断。

我的用法会很朴素：

1. 先锁定一个层，比如 inference code、safety & guardrails、edge AI hardware。
2. 看 fully-open 产品里有没有 mature=true 的项目。
3. 如果没有，看 gap 是 capability、adoption、maturity、openness 还是 disclosure。
4. 追到 score 的 primary source，确认它是不是你认可的证据。
5. 再决定是选型、替换、贡献，还是暂时避开。

这不是一条很酷的流程，但它省掉很多争吵。

我们经常把开源 AI 讨论成两种口号：一种说开源会赢，一种说闭源永远领先。Gap Map 的好处，是它暂时不跟你吵这个。它把问题换成更工程化的句子：这一层有哪些 building blocks？哪个是 fully open？哪一个被采用？哪一个真的强？哪一个缺引用？哪一个只是看起来开放？

这才是公共底账的价值。

它不替你下结论。它让你没那么容易偷懒。

*如果你要给自己的团队做一张“开源 AI 技术扫描表”，你会从 Gap Map 的哪一层开始查？*

## 延伸阅读

* [开权模型真正打开的是试错路径](https://ntlx.github.io/articles/open-weight-models-changed-ai)
* [同一天，OpenAI、Runway、Google 都选了 MCP：一个协议的临界点](https://ntlx.github.io/articles/mcp-tipping-point)
* [Agent 的新入口：它能看见谁](https://ntlx.github.io/articles/agentic-resource-discovery)

## 参考资料

* [Open Source AI Gap Map](https://map.currentai.org)
* [Explore the full dataset - Current AI](https://map.currentai.org/dataset)
* [Methodology of the AI Stack Gap Map - Current AI](https://map.currentai.org/methodology)
* [About the Gap Map - Current AI](https://map.currentai.org/about)
* [Notebooks - Current AI](https://map.currentai.org/notebooks?tab=ai-stack-map)
* [Introducing the Gap Map v0.1 - Current AI](https://www.currentai.org/blogs/introducing-the-gap-map-v0-1)
* [currentai-org/os-ai-map - GitHub](https://github.com/currentai-org/os-ai-map)
* [Open Source AI Gap Map - Simon Willison](https://simonwillison.net/2026/jul/3/open-source-ai-gap-map/)
* [Current AI releases interactive map mapping the global open-source AI ecosystem and pipeline maturity - Digg](https://digg.com/tech/hjxjg8gj)
* [currentai-org/os-ai-map - Trendshift](https://trendshift.io/repositories/70401)
