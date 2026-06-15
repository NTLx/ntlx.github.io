---
$schema: starlight
title: AI 没有取代程序员，但很多人不想让你知道这一点
description: CEO 们把裁员说成 AI 革命，数据却说 90% 连成熟 AI 应用都没有——问题不在 AI 能不能写代码，而在谁来决定写什么、谁来为交付负责。
date: 2026-06-15
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-15-ai-hasnt-replaced-engineers-sandwich-model-img-00-infographic-core-summary.png)

## 裁员 4000 人，然后说"都是 AI 的功劳"

Jack Dorsey 说 AI 让 Block 能用"更小更扁平的团队"做事，裁掉 4000 人。Snap CEO 说 AI 写了 65% 的新代码，裁掉 1000 人。Intuit 裁 3000 人，媒体自动把两件事连起来：裁员和 AI。

但 Bloomberg 追进去发现，Block 在疫情期间员工暴增三倍，财务早就撑不住了。Cash App 的数据科学家说公司"把 AI 强塞给所有人"，她看到的生产力提升"极其有限"。Intuit 的 CEO 自己站出来说"跟 AI 没关系"，裁的是管理层级太多、协调成本太高的岗位。

59% 的美国招聘经理承认，在解释裁员时会强调 AI——因为这比"我们财务撑不住了"好听。Forrester 的分析师说得更直白：九成宣称要 AI 裁员的公司，连个像影的 AI 应用都还没有。

这不是个别现象。纽约州的 WARN Act 要求大规模裁员时勾选原因，过去一年 160 多家公司提交了通知，没有一家勾选 AI。只有一家，卖咖啡胶囊的 Nespresso。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-15-ai-hasnt-replaced-engineers-sandwich-model-img-01-ai_washing_data_statistics.png)

## 三明治模型：AI 压缩了中间，两头纹丝不动

Narayanan 和 Kapoor 提出一个框架：软件开发是个三明治——决定做什么（decide）、动手做（execute）、交付验证（deliver）。AI 压缩了中间那层。但两头没动。

这不只是直觉。NBER 研究了 10 万开发者，发现最新 AI 工具让代码行数暴增 8 倍，但实际发布的软件只多 30%。写得快了，但交付没快多少。瓶颈不在写代码。

2019 年微软的研究更早就指出了：开发者花在写代码上的时间只有 9% 到 61%，取决于你怎么算。剩下的时间在开会、理解需求、调试、协调、做决策。写代码从来不是瓶颈。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-15-ai-hasnt-replaced-engineers-sandwich-model-img-02-sandwich_model_three_layers.png)

这就引出一个不舒服的问题：如果写代码不是瓶颈，那 AI 编码工具到底在帮谁？答案可能是——它在帮 CEO 们编故事。Snap CEO 说 AI 写了 65% 的代码，言下之意是"所以人可以走了"。但代码行数和软件交付是两回事。代码行数和产品价值更是两回事。

## 从来不是"会不会写"的问题

Vibe coding 和 agentic engineering 被混为一谈，但它们是光谱的两端。真正的 vibe coding 是你说一句、AI 做、你不审不测、出了问题再说。Simon Willison 说他监督 AI 写代码到上午 11 点就精神耗尽了。SWE-chat 数据集显示，AI 生成的代码只有 44% 能存活进 commit，vibe coding 产生的漏洞率是人工的 9 倍。

这不是说 AI 没用。它极度有用。但有用的方式不是"替代人"，而是"加速执行"。执行只是三明治中间那层。两头——决定做什么、为交付负责——需要的是对代码库的理解、对业务的判断、对用户需求的洞察。这些东西没法用 prompt 生成。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-15-ai-hasnt-replaced-engineers-sandwich-model-img-03-vibe_coding_vs_agentic_engineering.png)

Fred Brooks 四十年前就写过：软件有本质复杂性和偶然复杂性。编程语言笨拙、工具不好用——这些是偶然的，AI 能解决。但"正确指定软件该做什么"这件事本身就很难——这是本质的，技术再进步也绕不开。

这和三明治模型说的是同一件事。AI 能压缩的，恰好是那些本就该被压缩的东西。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-15-ai-hasnt-replaced-engineers-sandwich-model-img-04-essential_vs_accidental_complexity.png)

## Jevons 悖论：软件便宜了，需求反而爆炸

最反直觉的部分在最后。AI 让写代码变便宜，但软件需求不是固定的——它会膨胀。汽车里跑着一亿行代码，十年前不可想象。现在每个认知工作都能从软件中获益。代码便宜了，人们开始造以前不值得造的一次性工具。

Fed 的研究发现软件工程师就业仍在增长，只是增速比无 AI 情景慢了约 3 个百分点。但这个数字没算自雇和创业——其他研究显示 AI 让创业更容易。真实画面可能比数据更好看。

程序员就业从 1950 年的几乎为零，增长到今天的数百万。农业自动化让农民大量失业，因为人吃的卡路里有上限。软件不一样。代码的需求没有天花板。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-15-ai-hasnt-replaced-engineers-sandwich-model-img-05-jevons_paradox_software_demand.png)

## 我的判断

这篇文章最锋利的地方不是"AI 没取代程序员"——这个结论很多人都能猜到。锋利的是它指出了一个机制：CEO 们用 AI 当裁员的挡箭牌，不是因为他们真的相信 AI 能替代人，而是因为"AI 裁员"比"我们经营不善"更好讲故事。AI washing 不是技术问题，是叙事问题。

但我也想补充一点原文没展开的：三明治模型说的是"整体需求不会消失"，但没说"每个个体都安全"。评论区有人点到了——初级岗位的需求在急剧下降。执行层正是初级工程师"学徒"的地方。AI 吃掉了执行层，等于吃掉了新人的入口。五年后可能没有足够的高级工程师来"决定"和"交付"。

这可能是三明治模型最暗的阴影：整体需求健康，但人才梯队正在断裂。

*你在用 AI 写代码吗？你觉得它替代了你哪部分工作，又放大了哪部分？*

## 原文参考

> Arvind Narayanan & Sayash Kapoor, "Why AI hasn't replaced software engineers, and won't", AI as Normal Technology, 2026-06-11
> <https://www.normaltech.ai/p/why-ai-hasnt-replaced-software-engineers>
