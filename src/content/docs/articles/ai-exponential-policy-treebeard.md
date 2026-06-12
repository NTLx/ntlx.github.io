---
$schema: starlight
title: 树人醒了，但它先画了一张地图
description: "Amodei 请求政府管住 AI，但他先定义了\"什么算危险\"、\"谁该被管\"——监管的边界就是权力的边界，写规则的人赢了一半。"
date: 2026-06-12
category: ai-industry
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-12-ai-exponential-policy-treebeard-img-00-infographic-core-summary-1.png)

Dario Amodei 用《指环王》树人比喻 AI 与政策的错配：AI 以闪电速度前进，政策像树人一样迟缓。但树人醒来后做了什么？不是守卫森林——是 march on Isengard。这个比喻的真正落点不在"慢"，而在"一旦启动，它会重塑整个棋盘"。Amodei 的长文和 Anthropic 同步发布的 Advanced AI Framework，就是这张棋盘的地图。

我读完的感觉：这不像呼吁，更像蓝图。一份被监管对象亲手绘制的蓝图。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-12-ai-exponential-policy-treebeard-img-01-faa-regulation-proposal-1.png)

## 表面：请求约束

Amodei 的核心提案很清晰：给前沿 AI 模型装上 FAA 式的强制测试，政府有权阻止不安全部署。四大风险类别——网络安全、生物武器、AI 失控、自动化研发——逐一列出，每个都附带具体的评估标准和执行路径。他还承诺 3.5 亿美元资金支持。

这看起来像一家公司在说："我们造的东西太危险了，请管住我们。"Reddit 上有人评论"Dario can't be trusted"，HN 上有人说"regulatory capture propaganda"。但这些批评大多停留在动机揣测——你为什么这么说？——而没有看清提案本身的结构。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-12-ai-exponential-policy-treebeard-img-02-coverage-thresholds-1.png)

## 第一刀：谁被覆盖

翻到 PDF 的第二页，覆盖门槛写得很具体：训练 FLOP 超过 10^25，且 AI 年收入超过 5 亿美元或研发支出超过 10 亿美元。

这个数字不是随便挑的。截至 2026 年 6 月，全球满足这两个条件的公司一只手数得过来。Anthropic 自己在内。OpenAI 在内。Google DeepMind 在内。Meta 的 Llama 系列——等等，Meta 的模型是开源的，训练 FLOP 达标但分发模式不同。更关键的是，所有基于这些模型做微调、蒸馏、部署的创业公司和开源社区，统统不在覆盖范围内。

门槛定义了"前沿"。"前沿"被定义为少数几家大公司的专属领地。这不是阴谋论——Amodei 自己也在文末承认这是"first steps"。但第一步画的这条线，恰好把最有可能产生竞争的玩家排除在外。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-12-ai-exponential-policy-treebeard-img-03-transparency-to-binding-1.png)

## 第二刀：透明度到绑定监管的转向

2025 年，Anthropic 支持加州 SB 53、纽约 RAISE 等透明度立法。逻辑是：风险还不明确，先让开发者公开安全程序和测试结果，等风险形状清晰了再设计精准立法。

2026 年 6 月，Amodei 说透明度"已不够"。原因是 Claude Mythos Preview 发现了数千个高危漏洞，证明前沿模型已具备真实的战略级能力。

但这里有一个时间线问题。Mythos Preview 是限量研究模型，不是公开产品。Amodei 用一个内部发现的风险，论证了外部监管的紧迫性。而同一天，Anthropic 发布了 Mythos 的公共版本 Fable 5。同一天。一边说"这东西太危险需要政府管"，一边说"来，大家用"。Developer's Digest 的文章直接用了标题"The Dario Paradox"。

我不是说这两件事矛盾。也许 Mythos 的风险评估确实到了需要外部监管的临界点。但当同一家公司在同一天既发布风险证据又发布商业产品，读者有权问：这个 timing 是巧合还是设计？

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-12-ai-exponential-policy-treebeard-img-04-regulator-circularity-1.png)

## 第三刀：谁来监管监管者

Amodei 建议建立类似 FAA 的机构，或授权一批经政府认可的独立评估者。框架文件详细描述了防止"评估者购物"的机制——政府随机分配评估者，评估者有权访问未删减的风险报告和最强模型。

这套设计很精密。但它有一个结构性问题：评估者评估的是模型能力，而模型能力的定义来自开发者自己的安全框架。框架要求开发者"开发并公布安全框架"，然后由评估者审核框架的执行。谁定义框架？开发者。谁定义"灾难性风险"？框架文件引用了加州 SB 53 的定义——而 SB 53 的定义来自行业游说。

这是循环的。不是恶意的循环——更像一种结构性的自我参照。被监管者定义风险，监管者审核定义，评估者审核执行。每一层都在上一层划定的边界内工作。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-12-ai-exponential-policy-treebeard-img-05-blueprint-paradox-1.png)

## 切到底

Amodei 真正在说的是什么？不是"AI 太危险了"——这他已经说过很多年。真正新的是：现在该由政府来定义规则了，而他把定义规则需要的所有原材料——风险类别、覆盖范围、评估标准、执行路径——都准备好了，打包成一份 19 页的 PDF。

这就像一个学生对老师说："请严格考试"，同时递上一份自己出的试卷。

别误会——这份试卷可能出得确实好。Amodei 的风险分析可能是 2026 年关于前沿 AI 最扎实的政策文本之一。但"好"和"公正"是两件事。一个由行业领导者定义的监管框架，即使技术上完美，也天然带着一个偏见：它优先处理的是行业领导者认为重要的风险。

Amodei 认为重要的是网络安全和生物武器。但 AI 对劳动市场的冲击呢？对信息生态的污染呢？对民主进程的干预呢？框架文件提到了经济影响，但把它放在了单独的"Economic Policy Framework"里——注意，是 separate，不是 integrated。四大风险类别里没有一项与社会层面的 AI 影响有关。

这不是疏忽。这是优先级。而优先级就是权力。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-12-ai-exponential-policy-treebeard-img-06-treebeard-map-1.png)

## 回到树人

树人醒了。Amodei 说得对，政策机构正在从沉睡中起来。但树人 march on Isengard 之前，先让两个霍比特人帮他看清了战场。Amodei 就是那个帮树人画地图的人。地图画得精确、全面、有说服力。但每一张地图都省略了某些东西——省略的部分，往往就是地图绘制者不想让你看到的部分。

我 70% 相信 Amodei 是真诚的。他的风险分析有实质内容，他的资金承诺不是空话。但"真诚"和"公正"之间隔着一道结构性的缝隙——造东西的人定义什么算危险，这本身就不可能完全公正。这不是道德判断，是逻辑必然。

剩下的 30% 留给那个 timing 问题。同一天发布风险证据和商业产品，这不是可以轻松解释掉的巧合。

*你觉得：一家公司主动请求监管，应该被视为负责任的表现，还是一种更精明的市场策略？*

## 原文参考

> Dario Amodei, "Policy on the AI Exponential", June 2026
> <https://darioamodei.com/post/policy-on-the-ai-exponential>

> Anthropic, "Policy on the AI Exponential" (政策页面)
> <https://www.anthropic.com/policy-on-the-ai-exponential>

> Anthropic, "Advanced AI Framework" (PDF 全文), June 2026
> <https://www-cdn.anthropic.com/files/4zrzovbb/website/0a58d567024a8b448ff15158ebc3625328dfcc1f.pdf>

> Developers Digest, "The Pushback on Amodei's Exponential Essay", June 2026
> <https://www.developersdigest.tech/blog/amodei-exponential-essay-pushback-roundup>

> Digital Applied, "Anthropic's AI Policy Blueprint: A Business Readout", June 2026
> <https://www.digitalapplied.com/blog/anthropic-advanced-ai-framework-2026-business-readout>
