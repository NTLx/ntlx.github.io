---
$schema: starlight
title: 当代码越来越便宜，真正稀缺的是控制回路
description: 代码回路会越来越快，但决定做什么、怎么改、向谁验证的那层控制回路，才是 AI 时代真正稀缺的生产力。
date: 2026-07-02
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-02-andrew-ng-control-loops-img-00-infographic-core-summary.webp)

Andrew Ng 这条帖表面上在讲三条 loop。我读完以后，脑子里留下的倒不是那张图，也不只是“工程师会更像产品经理”这句判断。我真正带走的是另一层东西：**代码正在变便宜，控制回路正在变贵。**

过去我们总把软件工程的稀缺点想成“谁能写出来”。现在这件事正在被 agentic coding loop 快速压缩。规格写清楚一点，eval 备好一点，agent 就能自己写、自己测、自己改，分钟级来回跑。能不能实现，越来越不像是主矛盾。主矛盾开始往上移，移到谁来决定该做什么、改什么、什么时候该停。

## 代码回路正在把实现压成廉价品

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-02-andrew-ng-control-loops-img-01-loop_speed_gradient.webp)

Andrew Ng 把第一条 loop 叫 `agentic coding loop`。这个说法不新，但他把时间尺度讲得很直白：几分钟一次迭代。代码、测试、浏览器检查、再改一轮，整个闭环可以在你不插手时自己跑很久。

这跟我最近反复感到的变化是一回事。实现当然还重要，但它已经不是最慢的那个环节了。就像我在 [《Agent Engineering 的真门槛：把失败变成资产》](https://ntlx.github.io/articles/agent-engineering-production-learning-loop) 里写过的，真正拉开差距的，不在于“能不能让 agent 动起来”，在于你有没有把失败变成下一轮可验证的输入。

这也是为什么我不太愿意把这条帖读成一篇“loop engineering 入门”。如果你只看到第一条 loop，很容易得出一个过早的结论：既然代码越来越快，软件开发的瓶颈就要消失了。不是。瓶颈只是搬家了。

## 真正变贵的是开发者反馈回路

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-02-andrew-ng-control-loops-img-02-context_advantage_boundary.jpg)

Andrew Ng 在第二条 `developer feedback loop` 里说了一句很关键的话：人类贡献不该被含糊地叫做 taste，更准确的说法是 `context advantage`。我觉得这一下把问题钉住了。

Taste 这个词太玄，像是在说一种天赋。`Context advantage` 就实在得多。你比模型更知道用户是谁，流程卡在哪里，哪个功能虽然看着合理但一上线就会把客服打爆，哪个按钮虽然更“好看”但会让第一次使用的人走丢。这个优势是你站在产品现场、组织现场、用户现场里一点点磨出来的。

这让我想起另一篇旧文 [《你的 Agent 读得懂代码，读不懂你的产品》](https://ntlx.github.io/articles/vercel-agent-product-design)。Agent 能模仿代码风格，也能学会一些设计模式，但它不知道你为什么要把某个功能压后、为什么那句文案不能更花哨、为什么这里宁愿多一步确认也不能省。代码能教它“长什么样”，教不了它“为什么只能这样长”。

所以第二条 loop 才是新控制面。第一条 loop 负责把想法快速落成东西。第二条 loop 决定哪些东西值得被落成，哪些地方必须返工，哪些问题看着像 bug，其实已经是方向不对。

## 外部反馈回路才负责回答产品是不是真的成立

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-02-andrew-ng-control-loops-img-03-reality_feedback_funnel.webp)

第三条 `external feedback loop` 在 Andrew Ng 那里是最慢的。找朋友试、放给 alpha 用户、上 A/B test，动辄几天几周。也正因为慢，它最容易在兴奋的时候被跳过。

可这一层最不能省。前两条 loop 再漂亮，本质上仍然是“系统和开发者在室内来回打磨”。外部反馈不一样。它把真实用户、真实误解、真实冷漠带进来。你以为功能已经够清楚了，用户根本没发现入口。你以为那个体验是惊喜，用户觉得是打扰。你以为自己在做产品，结果只是在优化一个自我感觉良好的 demo。

很多团队不是死在不会 build，而是死在 build 太顺。东西出得太快，内部反馈太密，反而让人误以为产品真相也在自己手里。其实没有。产品真相只在外部世界手里。

这也解释了为什么 Anthropic 在研究里会发现，人们更愿意把低上下文、低复杂度的任务交给 Claude，而把高上下文判断抓在手里。不是因为后者更“高级”，而是因为一旦判断错了，错的不是一行代码，而是你把系统推向了错误的人、错误的场景、错误的目标。

## 工程师会更像半个产品经理，但不是因为头衔变化

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-02-andrew-ng-control-loops-img-04-control_loop_handoff.webp)

Andrew Ng 最后说，随着 coding agents 加速开发，更多工程师会部分进入 product management 角色。我同意，但我会换个说法：不是工程师要换头衔，而是工程师手里会被迫拿更多关于目标函数的责任。

以前团队里最贵的人，常常是能把复杂实现硬啃下来的人。以后这种贵，会部分转移到另一类人身上：能把模糊需求压成清楚规格的人，能从半成品里看出真正问题的人，能在外部反馈里分辨噪声和信号的人。

说得更直一点，写代码这件事会越来越像高效流水线，仍然重要，但没那么稀缺了。真正稀缺的是控制回路：谁来定义 done，谁来决定继续，谁来决定停手，谁来判断“这不是实现错了，是方向错了”。这条线如果没人守，loop 越快，偏航也越快。

我昨天在 [《你不是把任务交给 AI，你是在重新分配控制权》](https://ntlx.github.io/articles/claude-loops-control-rights) 里写的是权力怎么分。今天读 Andrew Ng 这条帖，我觉得可以补上另一句：**未来的软件团队，不会因为能把代码交给 agent 而变强，而会因为知道哪些判断绝不能一起交出去而变强。**

## 所以我真正带走的不是“三条 loop”

我带走的是一个更冷的判断。

第一条 loop 会继续加速，快到把“实现能力”从护城河打成地板。第二条 loop 会成为新的主控制面，因为规格、方向、取舍都卡在那里。第三条 loop 仍然最慢，但它负责把团队从自我循环里拽出来。

所以别只问你的 agent 能不能连续工作一小时。更该问的是：当代码已经足够便宜，你的团队还剩下什么是贵的？

如果答案只是“我们也能做得更快”，那不够。更难也更值钱的问题是：你们有没有比模型更强的上下文判断，有没有把外部反馈接回来改写规格，有没有人能在 loop 越跑越顺的时候，指出它其实在朝错方向顺滑地下坠？

这才是我理解的 Andrew Ng 三条 loop。它不只是给工程师发一张更高效的操作卡。它是在提醒我们，**AI 时代最贵的东西，正在从写代码，慢慢变成决定代码该为什么服务。**

*如果你团队里只能守住一层不外包，你会守住规格判断、开发者反馈，还是外部反馈？为什么？*

## 延伸阅读

* [《你不是把任务交给 AI，你是在重新分配控制权》](https://ntlx.github.io/articles/claude-loops-control-rights)
* [《你的 Agent 读得懂代码，读不懂你的产品》](https://ntlx.github.io/articles/vercel-agent-product-design)
* [《Agent Engineering 的真门槛：把失败变成资产》](https://ntlx.github.io/articles/agent-engineering-production-learning-loop)
* [《Claude Code 正在离开聊天框》](https://ntlx.github.io/articles/claude-code-headless-automation)

## 原文参考

> Andrew Ng on X
> <https://x.com/AndrewYNg/status/2071988145667928442>

> DeepLearning.AI, The Batch issue 359
> <https://www.deeplearning.ai/the-batch/issue-359>

> Three Key Loops for Building Great Software
> <https://www.deeplearning.ai/the-batch/three-key-loops-for-building-great-software>

> How AI Is Transforming Work at Anthropic
> <https://www.anthropic.com/research/how-ai-is-transforming-work-at-anthropic>

> Estimating AI productivity gains from Claude conversations
> <https://www.anthropic.com/research/estimating-productivity-gains>
