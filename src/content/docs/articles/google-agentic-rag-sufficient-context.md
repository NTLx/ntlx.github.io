---
$schema: starlight
title: Google 给 RAG 加的不是更多 Agent，而是停手判断
description: 真正能卖给企业的，不是多智能，而是系统在证据不够时知道别乱答。
date: 2026-06-06
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-06-google-agentic-rag-sufficient-context-img-00-infographic-core-summary.png)

我读完 Google Research 这篇 2026 年 6 月 5 日的新文，第一反应不是“Google 又做了一个 multi-agent RAG 框架”，而是“他们终于把 RAG 里最该产品化的那一步，单独拎出来了”。

那一步不是检索，不是改写 query，也不是再多堆几个 agent。那一步叫：*证据不够时，别急着回答。*

## 多 agent 不是重点，重点是它会不会自己喊停

Google 在原文里把角色拆得很完整：Orchestrator、Planner、Query Rewriter、Search Fanout、Sufficient Context Agent、Synthesis Agent。看起来很热闹，但说实话，这种“把任务拆给几个角色协作”的套路，今天已经不稀奇了。Hugging Face 的 cookbook 里，早就有 manager、web search、retriever 这种典型配方。

真正让我停下来的，是它把 *Sufficient Context* 放到了流程正中央。

这不是一个装饰性名词。Google 2025 年那篇研究就已经说得很直白：相关，不等于足够。你检索回来一堆看起来相关的片段，不代表它们已经足以支撑一个可交代的答案。RAG 最危险的时候，往往不是“什么也没找到”，而是“找到了一点，但不够，于是模型顺手把剩下那半截补完了”。

所以这篇新文最值钱的地方，不是“系统会搜”，而是“系统会承认自己还没搜够”。它会检查当前片段、检查中间草稿、再明确指出到底缺哪一块，再把这个缺口反馈回下一轮检索。*这比多加一个 agent 难得多，因为它要求系统不仅会干活，还得知道自己没干完。*

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-06-google-agentic-rag-sufficient-context-img-01-sufficiency-loop.png)

## 企业真正买单的，是一条“别乱答”的底线

这也是为什么我觉得 Google 这次讲的其实不是 RAG 技巧，而是企业信任结构。

原文举的 Project X 例子很典型：第一轮只能找到 server ID，第二轮才去另一套库里找规格。医疗例子更典型：药物和饮食建议找到了，但过敏反应没找到，于是系统不会提前交卷，而是继续追“rash”“adverse event”这一类线索。

这背后暴露的不是检索难题，而是责任难题。企业里最怕的，从来不是 agent 回答得慢一点，而是它在证据没凑齐的时候给出一个听起来完整、实际上会害人的答案。

Google Cloud 的 [Gemini Enterprise Agent Platform 发布文](https://cloud.google.com/blog/products/ai-machine-learning/introducing-gemini-enterprise-agent-platform) 也说明了这一点。它整个平台卖的不是单次回答，而是 runtime、memory、identity、registry、gateway、observability 这一整套治理层。对应到 [Cross Corpus Retrieval 文档](https://docs.cloud.google.com/gemini-enterprise-agent-platform/build/rag-engine/cross-corpus-retrieval)，你会看到非常工程化的提示：corpus description 很关键、路由靠 description 做判断、功能只在 `us-central1` 可用、还得先给 RAG Engine 的 service account 授权。

这些细节很枯燥，但正因为枯燥，才说明它是要进生产的东西。*企业买的不是“更像人”，而是“出了事能追到哪一步漏了证据”。*

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-06-google-agentic-rag-sufficient-context-img-02-trust-stack.png)

## 指标很好看，但真正难的地方还没被证明

我并不怀疑这套方法有价值。原文给的数据也确实漂亮：对 factuality 数据集最高提升 34%，在 FramesQA 的 cross-corpus 设定下做到 90.1% 准确率，而且 single-corpus 和 cross-corpus 的平均时延只差 3%。配合 [FRAMES 论文](https://arxiv.org/abs/2409.12941) 和 [frames-benchmark 数据集](https://huggingface.co/datasets/google/frames-benchmark) 去看，这套评测也不是随便挑的软柿子。

但我读到这里，脑子里冒出来的不是“稳了”，而是三个问号。

第一个问号是：*benchmark 上的 sufficient context，到了企业私有数据里还稳不稳？* FRAMES 再难，本质上仍然是一个标注清楚、检索目标相对干净的评测环境。企业里的问题不是这样。文档命名混乱、权限切碎、字段过时、描述偷懒，才是常态。连 Google 自己的文档都提醒 corpus description 必须认真写，因为路由就靠它。换句话说，这套系统的第一层 intelligence，很多时候其实建立在你有没有把元数据写明白。

第二个问号是：*谁来判断“还不够”？* Google 2025 年那篇 [sufficient context 研究](https://research.google/blog/deeper-insights-into-retrieval-augmented-generation-the-role-of-sufficient-context/) 说得很对，RAG 常常不是检索失败，而是证据不足却硬答。但把“证据足够”做成一个可复用信号，本身也会变成新的误判源。它要是把“不够”误判成“够”，后面的流程再优雅也没用。

第三个问号是：*企业能不能长期承担这套复杂度？* 多一轮规划、多一轮改写、多一轮检索、多一轮 sufficiency check，换来的是更高的可依赖性。但这也意味着更多 token、更多状态、更多 trace、更多故障点。原文说 benchmark 上时延只多 3%，这很好；可真正昂贵的，常常不是 3% 的延迟，而是整条链路的运维和解释成本。

所以我会把这篇文章看成一个很强的方向信号，而不是一句“agentic RAG 已经解决企业可靠性”的结论。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-06-google-agentic-rag-sufficient-context-img-03-benchmark-vs-enterprise.png)

## 我读到的真正信号，是“认知谦逊”开始变成产品能力

如果一定要把这篇文章压成一句话，我会这么说：Google 不是在卖更多 agent，Google 在卖 *可编排的认知谦逊*。

这听起来有点绕，但意思很简单。过去大家比的是谁检索得更快、召回得更多、上下文塞得更长。现在真正值钱的能力，开始变成另一件事：*系统能不能明确知道自己还缺什么，并且因为这个缺口拒绝过早收口。*

这件事一旦成立，RAG 的重心就会变。重点不再只是“找到信息”，而是“找到足够信息”；不再只是“给答案”，而是“什么时候该继续查，什么时候该老实说我还不能答”。这比任何一个花哨的 agent 角色都更接近企业真正需要的东西。

我甚至觉得，这可能是下一代 agent 系统最容易被低估的一层。大家都在追求更强的行动力，但企业最后掏钱的，往往不是那个最敢动手的系统，而是那个在证据不够时肯收手的系统。

*如果你的企业 agent 在证据不够时能继续查，但代价是更慢、更贵、链路更复杂，你愿意为这份“别乱答”付多少钱？*

## 原文参考

> Google Research Blog. Unlocking dependable responses with Gemini Enterprise Agent Platform's Agentic RAG.
> <https://research.google/blog/unlocking-dependable-responses-with-gemini-enterprise-agent-platforms-agentic-rag/>

> Google Cloud Blog. Introducing Gemini Enterprise Agent Platform, powering the next wave of agents.
> <https://cloud.google.com/blog/products/ai-machine-learning/introducing-gemini-enterprise-agent-platform>

> Google Cloud Docs. Cross Corpus Retrieval.
> <https://docs.cloud.google.com/gemini-enterprise-agent-platform/build/rag-engine/cross-corpus-retrieval>

> Google Research Blog. Deeper insights into retrieval augmented generation: The role of sufficient context.
> <https://research.google/blog/deeper-insights-into-retrieval-augmented-generation-the-role-of-sufficient-context/>

> Google Research Publications. Sufficient Context: A New Lens on Retrieval Augmented Generation Systems.
> <https://research.google/pubs/sufficient-context-a-new-lens-on-retrieval-augmented-generation-systems/>

> arXiv. Fact, Fetch, and Reason: A Unified Evaluation of Retrieval-Augmented Generation.
> <https://arxiv.org/abs/2409.12941>

> Hugging Face Datasets. google/frames-benchmark.
> <https://huggingface.co/datasets/google/frames-benchmark>

> Hugging Face Cookbook. Multi-agent RAG System.
> <https://huggingface.co/learn/cookbook/multiagent_rag_system>

> Google Research Blog figure. AgenticRAG3\_Comparison.
> <https://storage.googleapis.com/gweb-research2023-media/images/AgenticRAG3_Comparison.width-1250.png>
