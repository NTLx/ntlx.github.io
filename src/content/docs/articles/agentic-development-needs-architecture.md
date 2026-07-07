---
$schema: starlight
title: Agent 越能写代码，架构越不能乱
description: Agent 让写代码变便宜，却把混乱架构的代价变贵：少猜、少绕、少烧 token，才是下一阶段的软件工程。
date: 2026-07-07
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-07-agentic-development-needs-architecture-img-00-infographic-core-summary.png)

## 问题已经换了

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-07-agentic-development-needs-architecture-img-01-whether_to_how_shift.png)

读完 Martin Fowler 这篇 [Fragments: July 6](https://martinfowler.com/fragments/2026-07-06.html)，我没盯着哪个工具赢，也没盯着某个模型又多会写代码。

我在意的是，问题换了。

今年 2 月那场 Future of Software Development Retreat，很多人还在问 agentic development 到底是不是个东西。到了 7 月的欧洲场，Fowler 记录下来的气氛已经不一样了。参会者不再主要争“要不要用”，而是在争“怎么用”。这一步很小，但很要紧。一个技术只有在价值被默认之后，麻烦的问题才会浮上来。

“能不能写代码”适合做展示。“怎样写完还能维护”才是工程问题。

这也是我读 Fowler 这组碎片时被刺到的地方。过去我们讨论 AI 写代码，常常把焦点放在产出速度上：它能不能补全、能不能修 bug、能不能一次生成一个功能。但一旦 Agent 真的进入日常交付，稀缺的东西就换成了判断、约束、复核、成本和责任。

我之前在 [《当写代码不再需要写代码》](https://ntlx.github.io/articles/martin-fowler-fragments-april-2026) 里写过类似的不安：如果写代码的动作变轻了，工程师反而更不能只盯着“写”。这次 Fowler 的 fragments 把这件事又往前推了一步：当 Agent 能干活以后，软件工程要重新回答“这个系统能不能被人和 Agent 一起理解”。

## 架构变成 Agent 的上下文税

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-07-agentic-development-needs-architecture-img-02-chaos_to_token_cost.png)

Fowler 记录的那场架构讨论里，有一个很值得停下来的想法：同一个变更，如果需要更少 token，也许说明架构更好。

这句话听起来有点功利，但我觉得它抓住了一个新现实。以前我们说好架构，常说 ease of change。以后可能还要加一个词：ease of context。

LLM 不是魔法师。它读代码，仍然靠名字、文件、边界、测试、注释、历史痕迹和相邻模式。一个代码库如果到处是混杂职责、重复逻辑、模糊命名，人在里面会迷路，Agent 也会迷路。区别只是，人的迷路表现为皱眉和加班，Agent 的迷路表现为读更多上下文、绕更多轮、猜更多意图、烧更多 token。

过去混乱架构的代价常常被推迟。今天先糊过去，半年后再还债。Agent 把这个延迟缩短了。你让它在混乱里找路，它当场就开始花钱。

所以我不太相信“模型足够强以后架构就不重要”这个说法。模型越强，越能放大环境里的结构。好代码给它清楚的词汇表，坏代码给它一堆相互打架的暗示。Unmesh Joshi 在 [What Is Code?](https://martinfowler.com/articles/what-is-code.html) 里说，代码不只是机器指令，也是问题域的概念模型。这个判断在 Agent 时代变得更硬了：代码结构本身就是上下文，本身就是 harness 的一部分。

这也和我最近写的 [《Anthropic 这篇 context engineering 文章，真正把 prompt 赶下了主桌》](https://ntlx.github.io/articles/anthropic-context-engineering-prompt-retreat) 接上了。prompt 当然重要。只是代码库本身没有稳定概念、边界和反馈时，prompt 再聪明也只是临时找补。

## Harness 是墙，也是路标

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-07-agentic-development-needs-architecture-img-03-harness_control_loop.png)

Fowler 还提到一个变化：几个月前还不算常见的 `harness engineering`，现在已经成了会场里的高频词。

我不觉得这是术语膨胀。它说明大家终于开始从“模型能力”转向“工作环境”。Birgitta Böckeler 在 [Harness engineering for coding agent users](https://martinfowler.com/articles/harness-engineering.html) 里把这件事拆得很清楚：一边是 feedforward guides，开工前告诉 Agent 规则、边界和做法；另一边是 feedback sensors，做完以后用测试、lint、类型检查、架构规则、review 结果把它拉回来。

白话说，harness 就是给 Agent 修墙，也给它放路标。

墙的用处是让它少走错路。路标的用处是让它知道什么叫“这里做对了”。`AGENTS.md`、ADR、测试、静态分析、结构检查、代码审查、可运行脚本、领域词汇，这些东西以前就存在。变化在于，它们现在不仅服务人，也服务 Agent。

我在 [《给代码装传感器：AI 时代的质量护城河》](https://ntlx.github.io/articles/sensors-for-coding-agents) 和 [《Not the Model, You're the Harness》](https://ntlx.github.io/articles/not-the-model-youre-the-harness) 里都写过这个判断：真正决定 Agent 产出质量的，常常不是一次提示词，而是它一路能碰到多少可靠信号。

这里也有一个容易被忽略的反直觉：harness 不是为了让人完全退出。恰好相反，它是为了把人的注意力从低级返工里救出来，留给那些机器还不擅长判断的地方。比如功能到底是不是用户要的，某个技术债是否值得忍，业务边界该不该改，异常路径要不要被显式建模。

这些判断现在还不能外包。至少不能放心外包。

## 最后要保留一条不用 AI 的路

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-07-agentic-development-needs-architecture-img-04-ai_dependency_fallback.png)

Mathias Verraes 在 [Software Design in the Agentic Age](https://verraes.net/2026/07/software-design-in-the-agentic-age/) 里补了一个我很认同的角度：好设计也是对 AI 依赖的对冲。

这句话听起来保守，其实很现实。我们不知道模型以后会多便宜，也不知道访问会不会被政策、供应商、预算、监管、社会反对卡住。404 Media 最近报道企业开始限制员工使用高成本模型，Gartner 也预测 AI coding cost 可能在 2028 年超过平均开发者薪资。你可以不同意这些预测的幅度，但很难否认一个方向：AI 使用成本正在从“试验预算”变成“经营约束”。

如果一个系统只有在最强模型、无限 token、随时联网的条件下才能维护，那它看起来先进，其实很脆。

真正稳的系统应该能让 Agent 干活，也能让人接手；能用强模型，也能换弱一点的模型；能靠自动化提速，也能在自动化失灵时回到可理解的工程流程。这不是怀旧，更像备份。没有人因为有云盘就删除本地所有认知。

Charity Majors 在 [Make AI Boring Again](https://charitydotwtf.substack.com/p/make-ai-boring-again) 里说的伦理姿态也落在这里。拒绝使用 AI 不会自动让世界更好，沉迷使用 AI 也不会。对技术团队来说，比较有用的路是把它变得有纪律：能解释、能追责、有边界、可停止。

所以我读完 Fowler 这篇 fragments 后，留下来的不是兴奋，是一种更冷的判断：Agent 越能写代码，架构越不能乱。

因为混乱过去只是让人累，现在还会让 Agent 猜，让预算烧，让风险藏起来。好架构过去帮人少迷路，现在还帮机器少幻觉、少绕圈、少浪费。它不是 AI 时代的旧包袱。我们把 AI 纳入工程现场时，架构是少数还能抓在手里的控制杆。

*如果你现在维护的代码库明天要交给 Agent 深度参与，你最想先补哪一种路标：命名、测试、ADR，还是架构边界？*

## 延伸阅读

* [AI 写代码最缺的，不是模型，而是传感器](https://ntlx.github.io/articles/coding-agent-sensors)
* [Agentic Engineering 的悖论：机器越能干，人越停不下来](https://ntlx.github.io/articles/agentic-engineering)
* [Anthropic 这篇 context engineering 文章，真正把 prompt 赶下了主桌](https://ntlx.github.io/articles/anthropic-context-engineering-prompt-retreat)
* [当 vibe coding 和 agentic engineering 开始模糊，我感到一阵不安](https://ntlx.github.io/articles/vibe-coding-agentic-engineering)

## 参考资料

* [Martin Fowler: Fragments: July 6](https://martinfowler.com/fragments/2026-07-06.html)
* [Martin Fowler: Future Of Software Development](https://martinfowler.com/bliki/FutureOfSoftwareDevelopment.html)
* [Birgitta Böckeler: Harness engineering for coding agent users](https://martinfowler.com/articles/harness-engineering.html)
* [Unmesh Joshi: What Is Code?](https://martinfowler.com/articles/what-is-code.html)
* [Mathias Verraes: Software Design in the Agentic Age](https://verraes.net/2026/07/software-design-in-the-agentic-age/)
* [Charity Majors: Make AI Boring Again](https://charitydotwtf.substack.com/p/make-ai-boring-again)
* [404 Media: Companies Are Throttling Employees' AI Use Because It's Too Expensive](https://www.404media.co/companies-are-throttling-employees-ai-use-because-its-too-expensive/)
* [404 Media: The Tokenpocalypse Is Here](https://www.404media.co/the-tokenpocalypse-is-here-companies-are-scrambling-to-stop-spending-so-much-on-ai/)
* [Gartner: AI coding costs could surpass average developer salary by 2028](https://www.gartner.com/en/newsroom/press-releases/2026-06-24-gartner-predicts-ai-coding-costs-will-surpass-average-developer-salary-by-2028-as-token-consumption-surges)
