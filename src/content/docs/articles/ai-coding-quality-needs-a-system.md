---
$schema: starlight
title: AI 让检查更便宜，质量判断仍要看证据
description: AI 降低需求审查、测试和评审的成本，但检查数量和覆盖率不能证明质量。每项检查要对应一种风险，并说明结果由谁判断、失败后采取什么动作；线上问题也要改变下一轮验证。
date: 2026-10-05
category: ai-coding
primarySourceUrls: ["https://www.i-kh.net/p/if-ai-coding-is-lowering-your-code"]
---

原文把 AI 编码后的质量问题放在团队管理里讨论，列出从需求到线上监控的七层做法。我赞成把需求审查前移；检查项变多，却不能直接说明风险降了。

缺陷增加当然值得调查，但改动难度和可投入的验证时间也会影响结果，单凭缺陷数不能断定团队管理失当。作者给出的是团队实践，没有提供可比较的数据或测量方法。我更愿意把它读作一份做法清单：每项检查针对什么风险，结果又会触发什么动作？

![从需求规格、测试评审到线上反馈的质量闭环](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-05-ai-coding-quality-needs-a-system-img-00-infographic-core-summary.png)

## 规格先行，能在代码生成前发现什么

七层中，我最认同把需求和技术设计的审查放到编码前。遗漏的状态、边界条件，以及与现有系统的意外交互，越到实现后期才发现，返工通常越重。作者的 [spec-first 工作流文章](https://www.i-kh.net/p/my-spec-first-workflow-for-ai-coding) 也是先形成需求与设计文档，再让 AI 找缺口，由人确认建议。

规格文档要把预期行为说清，让开发和测试有参照。AI 提出的遗漏仍要由熟悉业务的人核实，免得假问题写进正式要求。

## 覆盖率能看见空白，却不能替测试作证

原文把单元测试覆盖率目标设为 >95%，这是作者推荐的做法，不能当作通用线。[Google Testing Blog 对代码覆盖率的说明](https://testing.googleblog.com/2020/08/code-coverage-best-practices.html) 称覆盖率是有损、间接的指标，也明确说不存在适用于所有产品的理想百分比。覆盖率能指出哪些代码没被测试触达，却不能说明断言是否验证了重要行为。

Agent 可能根据同一份误解同时写出实现和测试，两边看起来一致，却一起偏离要求。先从经确认的需求写出测试情形，再实现和运行测试，有助于减少自我确认；测试是否选对，仍需人检查。

## 防线要各自盯住不同的失效方式

几层检查各有对象。单测验证局部逻辑和边界输入；E2E 验证串联后的用户流程；人工测试能探索脚本没有写出的情况。它们可以互补，不能用一层代替另一层。

AI 质量检查可以按关注点扫描安全、重复逻辑或复杂度；PR review 则要结合具体改动判断业务语义和设计选择。每条 AI finding 都要核验。我在[代码审查模型对比](https://ntlx.github.io/articles/gpt-5-6-luna-vs-gpt-6-astra-code-review)中把模型提出的 finding 与最后确认的问题分开看。评论数量本身说明不了风险是否下降。

## 线上结果必须回到下一次改动

线上监控补充预发布环境看不到的真实运行信号。告警发出后还要有人处理，复盘也应改变下一次规格、测试或发布规则。若故障来自遗漏的边界行为，就把这个场景补进需求和回归测试；若系统已有信号却没人跟进，就调整告警与响应安排。

![六种质量检查各自关注的风险与证据](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-05-ai-coding-quality-needs-a-system-img-01-comparison-check-types-evidence.png)

复盘时可以追问：规格漏了哪个行为？测试缺少哪种输入或跨组件路径？评审为什么没看到？是要增加自动检测，还是需要有人认领已有告警？我会看一项检查带来了什么证据，以及这条证据是否改变了团队的决定。覆盖率和 review 评论数不能单独回答这两个问题。

## 参考资料

- Iouri Khramtsov, [If AI coding is lowering your code quality, you’re not managing quality right](https://www.i-kh.net/p/if-ai-coding-is-lowering-your-code)
- Iouri Khramtsov, [My Spec-First Workflow for AI Coding Agents](https://www.i-kh.net/p/my-spec-first-workflow-for-ai-coding)
- Google Testing Blog, [Code Coverage Best Practices](https://testing.googleblog.com/2020/08/code-coverage-best-practices.html)
