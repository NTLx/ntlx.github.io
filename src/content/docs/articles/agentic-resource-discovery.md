---
$schema: starlight
title: Agent 的新入口：它能看见谁
description: Agent 不会因为会搜索工具就更自由；真正的新控制面，是谁决定它能看见哪些能力。
date: 2026-06-18
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-18-agentic-resource-discovery-img-00-infographic-core-summary.png)

## 它缺的不是工具，是路

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-18-agentic-resource-discovery-img-01-install_to_discovery_path.png)

我读 Hugging Face 这篇 ARD 发布文章时，第一反应不是"又来了一个标准"。更像是 Agent 生态终于承认了一个尴尬事实：我们给模型接了很多手和脚，却还让人类替它记地图。

MCP 解决怎么调用工具。Skills 解决怎么吃下一段操作说明。A2A 解决怎么和另一个 Agent 说话。但它们默认有个前提：你已经知道要连谁，已经把 server URL 写进配置，已经把 skill 装好。

这套做法适合日常工具，不适合临时任务。一个 Agent 要订机票、查日志、读医学数据、生成图片，不能每次都等人先把世界装进它的背包。

所以 ARD 真正说的是一句很朴素的话：让 Agent 去找。

这个变化看起来像搜索，底下其实是权力搬家：工具选择的位置变了。过去发生在 prompt 里：把一堆工具描述塞进上下文，让模型挑。现在选择被挪到模型外面，放进 registry，放进 `POST /search`。

## 发现层把上下文救出来，也把选择权拿走

ARD 的两个核心件很小：`ai-catalog.json` 和 `POST /search`。前者像一张可被抓取的能力名片，后者像一个自然语言搜索入口。

这点让我觉得它比很多 Agent 标准都更现实。ARD 不重新定义执行协议。找到以后怎么跑，还是 MCP、A2A、REST 或别的原生机制。ARD 只站在调用之前回答：这个任务找谁？

把工具描述塞进上下文当然笨。上下文窗口有限，描述薄，模型容易被近处、熟悉、措辞漂亮的工具骗走。可当选择搬到 registry，问题只是换了形状：谁建索引？谁定排名？谁决定一个工具是"可发现"还是"不可见"？

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-18-agentic-resource-discovery-img-02-search_score_trust_boundary.png)

规范里有个细节很关键：search response 的 score 只是语义相关性，不是信任分、安全分、合规分。这句话必须被反复记住。否则 Agent 会把"看起来匹配"误读成"可以放心调用"。

人类搜索网页时，已经被这个错觉教育过很多年。排第一不等于真实，也不等于安全。Agent 如果把 registry 排名当成判断本身，只是换了一种幻觉。

## Hugging Face 把概念落到了 Hub 上

Hugging Face 这次有意思的地方，是它没有只写愿景。`hf-discover` 已经把 Hub 里的 Spaces、Skills、MCP Server 包成 ARD catalog entries。

这个实现很 Hugging Face：直接从已有生态接进新协议，不从零造宇宙。Hub 本来就有 Spaces 和语义搜索，现在加上 `agents=true` 这类 Agent-oriented metadata，再把结果翻译成 ARD 条目。

它还做了几个务实取舍。只返回 runtime stage 为 `RUNNING` 的 Spaces，避免 Agent 找到睡着的工具。带 `agents.md` 的 Space 可以被包装成 Skill；带 `mcp-server` 标签的 Space，可以生成指向 Gradio MCP HTTP endpoint 的条目。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-18-agentic-resource-discovery-img-03-hf_discover_adapter_stack.png)

我实际调了一下 Search API。查询 "fine tune a sentence transformer"，请求 skill 类型，返回里排第一的是 `train-sentence-transformers`，score 是 100；后面还有由 Space 生成的 skill，以及一个 Spaces registry referral。至少搜索这条链是通的。

但另一个小插曲也值得写下来：原文说 Hugging Face catalog 发布在 `https://huggingface.co/.well-known/ai-catalog.json`，我在 2026-06-18 请求时拿到的是 404 页面；而 `https://huggingface-hf-discover.hf.space/.well-known/ai-catalog.json` 是可访问的。

这不是抓一个发布细节的错。它提醒我：发现层这种基础设施，最怕的不是概念不够漂亮，而是入口不稳定、元数据不准、部署路径和文档错位。Agent 对这些小错的容忍度，比人低。

## Registry 会变成新的门

Snowflake 同日文章把 ARD 拆成四步：Describe、Curate、Search、Execute。真正的控制面常常藏在 Curate 里。

企业 registry 可以只收录内部批准过的 Agent。公共 registry 可以按覆盖率做大，也可以按安全、来源、质量做窄。从 Agent 视角看，这些 registry 就是它的视野。

以前人类问："这个 Agent 会不会调用错工具？"\
以后还要问："它根本看不看得见正确的工具？"

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-18-agentic-resource-discovery-img-04-registry_control_surface.png)

这会改变 Agent 产品的竞争重心。工具多只是第一层。真正值钱的是可信发现面：谁能把内部生态、公共生态、权限边界、合规声明、运行状态和任务意图揉在一起，给 Agent 一个可审计的候选集。

我不太相信"开放标准天然带来自由"。开放标准只是把入口做成大家能接的形状。入口之后怎么排名、怎么过滤、怎么收费、怎么排除坏 actor，还是治理问题。

ARD 说自己不是 marketplace，这句话在规范意义上成立。但 registry 一旦掌握分发，就天然有 marketplace 的影子。区别在于它卖的是 Agent 能看见的世界，不是应用。

## 下一场仗不是调用，而是可见性

我以前以为 Agent 工具生态的瓶颈在执行：协议不统一、授权麻烦、工具接口不稳定。现在看，执行层会越来越快被标准化。发现层才难，它混在技术、信任、商业和组织权限之间。

ARD 给了一个不错的最小形状：发布清单，搜索注册表，返回可调用资源，把执行交回原协议。这个形状足够轻，才可能被不同公司接受。

但它也把更难的问题摆上桌面：当 Agent 可以自己找工具，人类要设计的不是更长的工具清单，而是一套它能安全寻找的世界。

Agent 以前的问题是不会用工具。ARD 之后的问题会变成：它能看见谁，相信谁，绕过谁。

*如果你的组织明天接入 ARD，你更担心 Agent 找不到工具，还是找到太多不该信的工具？*

## 原文参考

> Hugging Face Blog: Agentic Resource Discovery: Let agents search for tools, skills, and other agents.
> <https://huggingface.co/blog/agentic-resource-discovery-launch>

> ARD Specification
> <https://raw.githubusercontent.com/ards-project/ard-spec/main/spec/ard.md>

> Hugging Face hf-discover
> <https://github.com/huggingface/hf-discover>

> Hugging Face Discover well-known catalog
> <https://huggingface-hf-discover.hf.space/.well-known/ai-catalog.json>

> Snowflake: Exploring Agent Discovery
> <https://www.snowflake.com/en/blog/agentic-resource-discovery-specification>
