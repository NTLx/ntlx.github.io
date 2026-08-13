---
$schema: starlight
title: 别再盲目挑选搜索引擎了：OpenRouter 这份评测揭开了 AI Agent 检索的真相
description: 选 Exa 还是 Perplexity？OpenRouter 最新 Web Search 评测显示，搜索引擎品牌的考量远不如给足搜索轮数（Turns）重要；而当 Agent 搜不到答案时，穷搜黑洞才是吞噬 API 账单的真正杀手。
date: 2026-08-13
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-13-openrouter-web-search-benchmark-img-00-infographic-core-summary.png)

在构建需要联网功能的 AI Agent 时，绝大多数工程师都会面临一系列纠结的选型决策：到底是直接调用 OpenAI 或 Google 的原生搜索，还是接入 Exa、Perplexity、Parallel 等专业第三方搜索引擎？如果搜一次不够，应该允许 Agent 往复检索多少轮？每一轮新增的搜索，到底换来了多少真正的准确率提升？

为了用确凿的量化数据解答这些工程难题，OpenRouter 团队发布了全新的 Web Search Live Benchmarks，并在 GitHub 上开源了 evaluation 评测框架。这份评测隔离了全网页抓取（Page Fetching）与代码执行（Code Tools），在 BrowseComp（硬事实核查）、DeepSearchQA（多跳研究）、WideSearch（广度表格填充）以及 HLE（专家级考题）四大基准上，对“模型 × 搜索引擎 × 搜索方式 × 搜索轮数”进行了跨维度的严谨对比。

仔细研读这份评测的数据后，我们发现了几项完全颠覆日常认知、甚至对 Agent 架构设计极具指导意义的底层规律。

## 搜索预算：比引擎品牌重要得多的第一杠杆

在常见的工程思维中，我们往往倾向于把检索效果不佳归咎于搜索引擎不够“聪明”，从而花费大量精力去对比各家 API 的语义索引能力。然而 OpenRouter 的数据表明：**增加搜索轮数（Search Budget / max\_tool\_calls）是提升回答质量性价比最高、效果最显著的单一变量**。

以难度极高的 BrowseComp 事实核查测试为例，当使用 Perplexity 作为搜索引擎时，仅仅将允许的搜索轮数从 1 轮提高到 25 轮：

* **Claude Opus 5** 的回答准确率从 35.8% 暴涨至 **89.0%**；
* **GPT-5.6 Sol** 的准确率从 46.3% 提升至 **82.4%**；
* **GPT-5.6 Luna** 的准确率从 33.7% 提升至 **74.0%**。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-13-openrouter-web-search-benchmark-img-01-search_budget_trajectory.png)

从 1 轮延伸到 25 轮，模型的准确率普遍实现了翻倍甚至接近三倍的跨越，而单题的平均成本仅上升了 2.5 到 7 倍。与其在引擎品牌上反复纠结，不如直接在 Agent 的工具调用逻辑中开放足够的搜索深度——这是最直接的“降维打击”。

正如我们此前在[《Not the Model, You're the Harness》](https://ntlx.github.io/articles/not-the-model-youre-the-harness)中强调的，Agent 的最终表现上限，往往并不取决于外接了多么昂贵的组件，而取决于 Harness 自身对轮次控制与工具调度参数的调优。

## 推理模型的“代偿”陷阱：限制轮数反而可能更慢

直觉上，限制搜索轮数（例如将 `max_tool_calls` 设为 1）应当能显著降低 API 响应时间和 Tokens 消耗。然而评测数据揭示了一个令人意外的反常现象：**对 Reasoning Model（推理模型）过度限制搜索轮数，反而会让响应时间变长**。

在 OpenRouter 评测的 35 种跨 1 轮与 5 轮预算的配置中，有超过三分之一的组合在 1 轮限制下的平均耗时居然长于 5 轮限制。这一现象几乎全部集中在 OpenAI 的推理模型上。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-13-openrouter-web-search-benchmark-img-02-reasoning_compensation_mechanism.png)

产生这种反常的原因在于，当外部检索信息不充分、而搜索工具被强制关闭时，推理模型会启动长链条的“内部内省（Internal Deliberation）”。模型试图仅凭自身的权重记忆去推理、补全未知的上下文，从而消耗了大量的内部思考 Tokens 与系统延迟。给足搜索轮数，让模型通过精准外部检索获取事实，反而能帮它从繁重的内省代偿中解脱出来。

不过需要注意边界：在 HLE 这种简单的专家查找题上，GPT-5.6 Sol 在 1 轮与 25 轮上的得分相差无几，但 25 轮的成本却高出了 3 倍。这意味着盲目追求高预算同样会带来边际效用递减。

## 穷搜黑洞：吞噬 API 账单的真正杀手

如果说高搜索预算在成功回答时带来了极高的 ROI，那么在**模型无法找到答案**的场景下，它就变成了极其危险的成本黑洞。

评测显示，当模型遭遇无法解答的难题时，它很少会主动放弃，而是倾向于穷尽所有给定的搜索预算，疯狂尝试各种换词搜索。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-13-openrouter-web-search-benchmark-img-03-failure_mode_search_turns.png)

数据统计表明，在 25 轮预算设置下：

* 在 **BrowseComp** 基准中，回答正确时平均搜索 **10.3 次**，而回答错误时平均搜索 **19.7 次**；
* 在 **DeepSearchQA** 中，正确时平均 **11.7 次**，错误时平均 **20.1 次**；
* 在 **WideSearch** 的表格填充任务中，甚至记录到了单题连续搜索 **81 次** 且最终依然判错的极端案例。

在[《循环交出控制权之后：读 ByteByteGo《The Agent Loop》》](https://ntlx.github.io/articles/agent-loop-reading-bytebytego)中我们曾讨论过 Agent Loop 的死循环风险。OpenRouter 的数据再次警示我们：在生产环境中，高失败率任务上的无限制“死磕”，是导致 API 账单意外飙升的第一元凶。

## 架构启示：构建动态搜索预算 Harness

综合 OpenRouter 的评测结论，我们可以为生产级 Agent 的 Web Search 架构总结出三条核心落地原则：

1. **模型能力 > 搜索引擎**：固定模型切换搜索引擎，准确率平均波动约 10 个百分点；而固定搜索引擎切换前沿模型与经济型模型，准确率差距达 15 个百分点。优先选择理解力强的模型，远比挑剔搜索引擎更重要。
2. **区分任务类型设置预算**：对于复杂多跳研究（Multi-hop Research）或事实核查，大胆开启 `max_tool_calls = 15 ~ 25`；对于确定性强或相对简单的事实检索，保持 `max_tool_calls = 3 ~ 5`。
3. **引入动态搜索预算（Dynamic Search Budget）与早停机制**：不要让 Agent 在低置信度状态下无休止穷搜。可以通过检测搜索结果相似度、设置连搜失败计数器（Stop after N empty searches），及时中断无意义的检索循环。

*你在为 AI Agent 配置联网检索时，遇到了哪些关于成本或准确率的尴尬时刻？欢迎在评论区分享你的实操踩坑经验。*

## 参考资料

* [Live Web Search Benchmarks: Pick the Right Engine, Depth, and Model for Your Agent](https://openrouter.ai/blog/announcements/web-search-benchmark/)
* [OpenRouter Search Benchmarks Leaderboards](https://openrouter.ai/benchmarks)
* [OpenRouter Search Benchmarks Evaluation Framework](https://github.com/OpenRouterTeam/search-benchmarks)
* [OpenRouter Web Search Server Tool Documentation](https://openrouter.ai/docs/guides/features/server-tools/web-search)

## 延伸阅读

* [Not the Model, You're the Harness](https://ntlx.github.io/articles/not-the-model-youre-the-harness)
* [循环交出控制权之后：读 ByteByteGo《The Agent Loop》](https://ntlx.github.io/articles/agent-loop-reading-bytebytego)
* [别再为 AI Agent 挑“最省 Token”的语言了：读 Dan Luu 评测有感](https://ntlx.github.io/articles/danluu-pl-tokens-efficiency)
* [当 Agent 开始跨表格与文档做推理：为什么 Databricks 坚持把权限交给 Lakehouse 而非 LLM？](https://ntlx.github.io/articles/databricks-agent-grounding-governance)
