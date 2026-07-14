---
$schema: starlight
title: 你看的那个价格，不是价格
description: 所有 AI 厂商都公布了价格，但没有人在公布汇率。$/Mtok 不是价格——它是一种私人货币的报价，用不公开的剪刀把同一段代码剪成不同数量的计费单位。
date: 2026-07-14
category: ai-industry
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-14-tokenizer-pricing-illusion-img-00-infographic-core-summary.png)

## 同一天，两篇文章

今天早上刷到两篇东西，一篇来自 Playcode，一篇来自 Ploy。两家公司碰巧在同一天发了博客，讲的碰巧是同一件事：你看到的 AI 模型标价，跟你真正掏的钱，不是一回事。

Playcode 做的事很笨——拿 16 份真实文件，逐一用每家厂商的 tokenizer 数 token，数完了比。Ploy 做的事很实——把生产环境的 agent 从 Claude Opus 4.8 换到 GPT-5.6 Sol，拿账单说话。

## Token 不是你以为的那个 Token

问题出在 tokenizer。

每个模型厂商配了一把"剪刀"，把你的文本剪成一段段 token，然后按 token 数收费。这把剪刀是各家自己造的。同一段 TypeScript 代码，OpenAI 的剪刀剪成 681 块，Anthropic 新版剪刀剪成 1,178 块。差了 73%。

但价格表上，两家都写着"$5 / 百万 input tokens"。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-14-tokenizer-pricing-illusion-img-01-tokenizer_private_currency.png)

这就好比两家菜场，一家用市斤，一家用自己定义的"斤"。标价都是 5 块一斤。你觉得一样贵。买完回家一称，一家的"斤"比另一家轻了三成。

$/Mtok 不是价格。它是私人货币的报价。汇率在每把剪刀的设计里，没人公开。

## 代码是最贵的代价

Playcode 测出来的数字：

* TypeScript：Claude 新 tokenizer 比 GPT 多 73%
* Rust：多 58%
* JavaScript：多 52%
* Python：多 50%
* 英文散文：多 40%

代码最贵。原因是 OpenAI 的 tokenizer（o200k）在大量 web JavaScript/TypeScript 上训练过，驼峰命名、JSX 标签这类模式被高效地压缩成单个 token。Anthropic 的剪刀在编程语言上没这个优势，代码被剪得更碎。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-14-tokenizer-pricing-illusion-img-02-code_tokenizer_taxonomy.png)

中文用户运气稍好。新旧 tokenizer 对中文的处理几乎没变（435 vs 433 tokens）。膨胀集中在英文和代码。

这个信息不是新发现的。Simon Willison 四月就注意到 Opus 4.7 悄悄换了 tokenizer，system prompt 多吞了 46% 的 token。Anthropic 后来在 Sonnet 5 的发布页脚注里承认了这件事——"roughly 1.0-1.35x depending on content type"——并说他们专门设了一个引入价来"大致抵消"膨胀。

注意这个逻辑：如果价格真的降了，就不需要一个特别设计的低价来"抵消"什么。引入价的存在本身，就是承认标价不等于实价。

## 真正的账单比你想象的长

Playcode 测的还只是输入端。真正的 agent 任务，账单上至少还要叠三层：输出 token、thinking token、缓存流量。

如果 tokenizer 膨胀 30%，那你的输出和 thinking 也在膨胀 30%。更要命的是缓存——长会话里缓存读取占了大头。token 膨胀 30%，缓存读写也贵 30%。

Ploy 的故事最能说明问题。他们从 Opus 4.8 迁移到 GPT-5.6 Sol 的第一版测出来 GPT-5.6 **贵了 50%**。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-14-tokenizer-pricing-illusion-img-03-ploy_migration_cost_truth.png)

不是模型贵。是缓存配置没搞好。Anthropic 的缓存是组织级共享，任何 workspace 都能复用。OpenAI 的缓存需要按 key 分区，一个 key 撑 15 个请求/分钟。他们没配好，每个请求都在冷启动。

修好之后呢？GPT-5.6 便宜 27%，速度快 2.2 倍，视觉评分还高了 3.6%。

比较模型成本这件事，前提条件比你想的多得多。cache 没配好，比较就是错的。tokenizer 不一样，比较也是错的。你以为你在比价格，其实在比谁的配置先搞对。

## 话说回来

Hacker News 上有人怼 Playcode：tokenizer 差异只是一层。模型输出冗不冗长、思考链长不长、工具调用多不多、重试几次——这些对总成本的影响比 tokenizer 大得多。

这话有道理。但反过来想：正因为 whole-task 成本已经没法简单比了，最基础的可比层——input tokenization——就更应该搞清楚。你不能因为总账单复杂，就假装每一项都是透明的。

## 你该怎么做

**别再拿 $/Mtok 做跨厂商决策。** 拿你自己的代码、文档、对话，去各家 tokenizer 数一遍，得到你自己工作负载的膨胀系数。然后用 标价 × 膨胀系数 算真实成本。

如果你是 Claude 用户，升级 Opus 4.8 或 Sonnet 5 之前，把 token 预算乘以 1.3 做一次压力测试。"升级"这个词自带一种进步的暗示，但你的账单可能不这么看。

这不是说 Claude 不好。Fable 5 在 UI 设计上的质量目前可能是最好的，额外的 token 成本也许完全值得。重点是：你得在知道真实价格之后做选择，而不是被标价牵着走。

*你上次认真算过一个 AI 模型的实际成本吗？还是直接看了价格表就选了？*

## 参考资料

* [The Same TypeScript Costs 73% More Tokens on Claude Than GPT](https://playcode.io/blog/real-price-of-frontier-models)
* [Migrating a production AI agent to GPT-5.6](https://ploy.ai/blog/migrating-a-production-ai-agent-to-gpt-5-6)
* [Claude Token Counts — Simon Willison](https://simonwillison.net/2026/Apr/20/claude-token-counts)
* [Anthropic Claude Sonnet 5 公告](https://www.anthropic.com/news/claude-sonnet-5)

## 延伸阅读

* [Not the Model, You're the Harness](https://ntlx.github.io/articles/not-the-model-youre-the-harness) — 模型不是唯一变量，harness 也是。Tokenizer 膨胀是同一个命题的另一面
* [AI 重新学会用眼睛读字](https://ntlx.github.io/articles/visual-understanding-ai-reading) — 当 token 的含义从"计费单位"扩展到"模型理解世界的原子"
