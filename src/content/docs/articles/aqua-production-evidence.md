---
$schema: starlight
title: 旅行助手跳过选座核验后，谁来证明它修好了
description: Google 的 AQuA 将会话里的隐性失败整理成带轨迹和源码依据的问题。读完后，我更关心诊断到修复之间的证据缺口，以及失败现场怎样才能变成可靠的回归用例。
date: 2026-11-06
category: ai-agents
primarySourceUrls: ["https://developers.googleblog.com/the-outer-loop-insights-first-an-ambient-quality-agent-that-diagnoses-your-production-agent/"]
---

旅客报出航班和想要的座位，旅行助手把座位号写进记忆，再告诉对方已经确认。它没有查过座位是否空着。

读 Google 介绍 AQuA 的文章时，我在这个例子上停了下来。请求返回 HTTP 200，延迟正常，工具没有报错。存储动作也确实完成了。错发生在“我想坐这里”被悄悄当成“这里已经可以坐”的那一步。

这类失败难查，因为运行记录里的每个动作都可能合法，连起来却违背了用户的目标。AQuA 想做的，就是在生产 Agent 旁边持续阅读这些记录，把值得调查的问题找出来。读到后面，我更在意它怎样界定证据，以及诊断完成之后还留下了什么工作。

![从失败证据到修复验证，每一步都需要自己的证据](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-06-aqua-production-evidence-img-00-infographic-core-summary.png)

## 把会话变成一件可以交给工程师的事

AQuA 的全称是 Ambient Quality Agent。按照[原文](https://developers.googleblog.com/the-outer-loop-insights-first-an-ambient-quality-agent-that-diagnoses-your-production-agent/)的设计，它在用户请求路径之外读取会话遥测，按抽样、审查、聚类、验证、追踪推进。需要深入调查时，再对照部署时保存的源码快照寻找原因、提出修改建议。它不自行应用修改，也不替开发者开 PR。

![原文图 5：抽样、审查、聚类、验证、追踪，根因诊断按需进行。来源 Google Developers Blog。](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-06-aqua-production-evidence-img-01-flowchart-sweep.png)

这里的关键是聚类。看见一次错误答复，工程师还得判断它与别的投诉有没有共同原因。若把同一种失败拆成许多工单，排查会重复；若只说“旅行助手不可靠”，又没有人知道该改哪里。AQuA 尝试把实际行为和预期行为写清楚，再按失效机制组织问题。

座位案例的实际行为是直接保存旅客给出的座位号，预期行为是先调用选座子 Agent 核验可用性和价格。这样的问题描述，比笼统的“回答不准确”更接近可修改的工程对象。

![原文图 2：监控正常，旅行助手却跳过座位检查。来源 Google Developers Blog。](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-06-aqua-production-evidence-img-02-comparison-silent-failure.png)

但预期行为需要产品负责人说明。原文的 `goal.md` 要求预订和推荐以工具结果及旅客资料为依据，同时排除语气、寒暄，以及用户只是浏览后离开的会话。这个排除很重要。没有订票，可能是任务没完成，也可能是用户本来就没有决定要买。让模型自行猜业务目标，会把正常行为也变成缺陷。

我赞成先把这类规则写清楚。质量 Agent 可以帮助找违例，团队仍要负责说清什么算违例。

## 提示词缺口，也可能暴露状态设计缺口

原文里的另外两类问题，让“换个更强的模型”这个解释显得不够用了。

旅客的素食偏好出现在上游 Agent 的提示词中，却没有随请求传给隔离的地点推荐子 Agent。后者于是推荐了不合适的食物。景点子 Agent 则被要求提供有真实依据的图片、地图和地点信息，原文那次运行的工具列表却为空。核对文中链接的源码可见，地图工具加载失败时会留下空列表，因此这里要连同部署环境一起查。

前者要看信息怎样跨边界传递，后者要检查指令要求与工具能力是否匹配。单独看最终答复，容易把它们都归到模型胡编；对照当时的指令、工具声明和会话，才看得见不同的修复位置。这也是部署源码快照有价值的地方。拿今天的代码解释旧版本的行为，可能查错对象。

![原文图 4：AQuA 旁路读取会话遥测与部署源码快照。来源 Google Developers Blog。](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-06-aqua-production-evidence-img-03-framework-sidecar.png)

座位问题还让我想往下追一步。原文报告的修复是在提示词里明确要求先查座位，即使旅客主动报出号码也一样。这能修补遗漏的对话分支。不过，如果业务确实不允许未经核验的座位进入确认状态，我会进一步考虑在状态或工具接口上区分“用户偏好”“待核验选择”和“已确认结果”，由确认动作要求相应凭据。

这是我从案例延伸出的设计建议，原文没有证明这样的实现效果。它的意义在于减少某个 Agent 漏看指令时能造成的后果。语言层面仍需理解用户，关键状态转换也应有自己的约束。

## 诊断截图里最值得保留的一行小字

原文的根因诊断截图展示了源码位置和建议补丁。底部还有一行提示，意思是这里没有运行或测试这项修复。

我觉得这行字和补丁本身一样重要。它把几个容易混在一起的结论分开了。

验证失败模式，是检查这些会话是否支持某种问题确实存在。AQuA 的验证器会为每个候选簇抽读至多三个完整会话。当前实现还有上下文长度预算，过长的工具内容可能被截断，因此长对话仍需单独检查证据是否完整。原文的演示中，它剔除了三个误报候选，其中有的其实遵从了用户明确要求，有的把不同子 Agent 的无关问题合并到了一起。

根因诊断则要解释问题为什么发生。即使引用的文件和行号都存在，解释仍可能不对。行号校验能挡住不存在的引用，无法单独证明那行提示词就是原因。

补丁是否有效，需要改完以后运行检验。部署后有没有持续改善，还需要看新的使用情况。若界面把这些阶段都压成一个醒目的“已验证”，读者很容易误解验证范围。

原文提供了一组改后结果。在四条脚本化旅程的 32 次会话回放中，座位核验绕过从 15 次降到 2 次，素食偏好遗漏从 7 次降到 0 次，完整会话通过数从 5/32 升到 13/32。这支持作者在这组回放里观察到改善。这些结果也留下了明确的未完成项，座位问题还有残留，整会话通过情况仍有提升空间。

我不会把这些数字读成真实生产环境里的普遍收益。这组输入是脚本化旅程的回放，尚不足以说明陌生用户、不同工具状态和其他对话分支也会得到同样结果。

## 没再抽到，不等于故障已经消失

AQuA 的追踪规则会在问题 14 天未再出现后自动标成 `RESOLVED`。作为队列管理办法，这能帮助清理长期没有新证据的问题；作为修复结论，它还缺条件。

可能是补丁起作用了，也可能是触发问题的旅程变少了，或抽样恰好没有碰到它。对于一个很少发生但后果严重的错误，我会希望界面分别保留最近发现时间、相关场景的覆盖情况，以及是否有专门回归用例通过。这样接手的人才知道“没看见”包含多少信息。

原文对静态回放的限制也讲得很清楚。把历史用户输入重新发给新代码，并不会重建当时的数据库、API 返回和其他外部状态。如果用户后续一句话依赖 Agent 上一句答复，照抄历史输入甚至会走进另一条语境。

所以，我理解的下一步应当是保存可重建的失败条件。就座位案例而言，除了旅客原话，还要留下当时的航班与座位状态、工具返回，以及“未经核验不能确认”这一验收条件。涉及用户选择的分支，则要让回归过程能回应新的 Agent 行为。具体怎样模拟，需要随业务而定。

这也接上了我在[质量检查与证据](https://ntlx.github.io/articles/ai-coding-quality-needs-a-system)一文里讨论的问题，线上发现应当改变下一轮验证。AQuA 让“发现”更有组织；团队还得把这些记录变成能运行、能判断结果的用例。

读完后，我会先问一个接手问题。某个失败再次出现时，工程师能不能找回当时的目标、状态、工具结果和代码，并用它们检查修复？如果只能找回一段流畅的诊断文字，排查工作还没有落到实处。若能把这个现场保存下来，下一次模型、工具或指令变化时，团队才有具体的东西可以守住。

## 参考资料

- Google Developers Blog，[The Outer Loop, Insights First](https://developers.googleblog.com/the-outer-loop-insights-first-an-ambient-quality-agent-that-diagnoses-your-production-agent/)，本文主要阅读对象，文中案例及复用原图均来自此文。
- Google，[Ambient Quality Agent 官方仓库](https://github.com/google/adk-recipes/tree/main/core/python/ambient-quality-agent)，实现、遥测接入与运行说明。
- Google Developers Blog，[Driving the Agent Quality Flywheel from Your Coding Agent](https://developers.googleblog.com/driving-the-agent-quality-flywheel-from-your-coding-agent/)，原文引用的内循环前篇，说明评估、修改与前后比较的关系。
