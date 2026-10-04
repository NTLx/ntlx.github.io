---
$schema: starlight
title: AI 让检查更便宜，质量判断仍要看证据
description: AI 把需求审查、测试和代码评审做得更便宜，但检查项的数量不能证明质量。每一层要对准不同风险，并明确证据、责任人和失败后的动作；上线信号还要回到下一轮需求与测试。
date: 2026-10-05
category: ai-coding
primarySourceUrls: ["https://www.i-kh.net/p/if-ai-coding-is-lowering-your-code"]
---

文章把 AI 编码后的质量问题放到管理端来解释，接着列出七层防线，从需求规格一路延伸到线上监控。把需求审查放在写代码之前，我很认同；不过，把七项都加进流程，也不自动等于质量更稳。

标题里的归因需要留点余地：bug 多了，不自动等于团队没管好质量。改动难度和团队能投入多少验证时间，同样会影响结果。作者分享的是团队实践，没有给出可供比较的数据。所以我把文章当作一份工具箱，而不是 AI 编码质量的定论。读下来，最值得追问的是每道检查到底拿出了什么证据。

![从需求规格、测试评审到线上反馈的质量闭环](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-05-ai-coding-quality-needs-a-system-img-00-infographic-core-summary.png)

## 规格先行，能在代码生成前发现什么

七层里，我最认同的是让 AI 先审需求和技术设计。遗漏的状态、边界条件和现有系统中的意外交互，如果等到实现完才发现，通常已经变成了需要返工的代码。作者在另一篇 [spec-first 工作流文章](https://www.i-kh.net/p/my-spec-first-workflow-for-ai-coding) 里，把需求与设计文档放在计划和实现之前，再让 AI 找缺口、列开放问题，由人审阅修改结果。

这里的价值不是多写一份文档，也不是让 AI 替人定需求。规格把“什么算完成”先摆出来，审查者才能判断实现和测试有没有偏题。作者也提醒，AI 有时会把并不存在的问题当成缺口；如果没人核对，它只会把错误假设写进更正式的文件里。规格审查的结果要由了解业务和系统的人负责确认。

## 覆盖率能看见空白，却不能替测试作证

原文建议把单元测试覆盖率做到 >95%。不过，具体数字并不等于通用标准。[Google Testing Blog 对代码覆盖率的说明](https://testing.googleblog.com/2020/08/code-coverage-best-practices.html)更谨慎：覆盖率是有用但有损的间接指标，高覆盖率不代表测试质量高，也没有适用于所有产品的理想百分比。它能告诉你哪些代码没有被测试触达，却不能证明被触达的代码在关键输入下被正确验证。

这也改变了我对“AI 把 TDD 变得很容易”的理解。测试数量和覆盖数字很容易增加，难的是测试有没有表达真正的需求。若同一个 agent 根据同一份误解同时写实现和测试，二者可能彼此吻合，仍然偏离用户要的行为。先从需求和边界列出测试情形，再检查实现是否通过，能减少这种自我确认；最后仍要有人判断用例是否覆盖了重要风险。

## 防线要各自盯住不同的失效方式

单测、E2E、人工测试、AI 代码审查和人类评审，不应该只是同一份 diff 被反复看几遍。单测更适合检查局部逻辑和边界输入；E2E 看功能串起来后是否符合用户流程；人工测试能试探脚本没有描述清楚的行为；AI review 可以针对安全、重复逻辑或复杂度做有方向的扫描；人类评审则要确认设计选择、业务语义和改动范围是否合理。线上监控再补上预发布环境看不到的真实使用情况。

这些工作里，AI review 最容易产生“看起来查过了”的错觉。我以前整理过一篇[代码审查模型对比](https://ntlx.github.io/articles/gpt-5-6-luna-vs-gpt-6-astra-code-review)：模型写出一条 finding，不等于它指出了真实缺陷，评论需要核验后才能进入修复流程。把多个模型的评论原样堆给开发者，增加的可能只是筛选工作。检查要写清楚关注什么、谁来判断结果，以及哪些问题会阻止合并。

## 线上结果必须回到下一次改动

代码合并和部署只是把风险带到了新的环境。告警、用户反馈和回滚记录如果只被当成事后统计，前面几层就不会因此变聪明。一次线上问题至少应该促使团队追问：规格漏了哪个行为？测试缺少哪种输入或跨组件路径？评审为什么没看到？需要增加自动检测，还是原有检测没有人处理？

我会把一套质量防线是否有效，落在几个能回答的问题上：它试图发现哪类失败？失败后会触发什么动作？谁负责判断结果？生产中的新证据会不会改变后续的需求、测试或发布规则？如果这些问题没有答案，检查项再长也只是流程清单。

AI 让更多检查变得便宜，团队就有机会把验证做得更细；质量提升还要看这些检查是否抓住了重要风险，以及结果会不会改变合并、发布和下一轮测试。缺陷变多值得追查，但不能一概归结为管理不善。

## 参考资料

- Iouri Khramtsov, [If AI coding is lowering your code quality, you’re not managing quality right](https://www.i-kh.net/p/if-ai-coding-is-lowering-your-code)
- Iouri Khramtsov, [My Spec-First Workflow for AI Coding Agents](https://www.i-kh.net/p/my-spec-first-workflow-for-ai-coding)
- Google Testing Blog, [Code Coverage Best Practices](https://testing.googleblog.com/2020/08/code-coverage-best-practices.html)
