---
$schema: starlight
title: 给代码装传感器：AI 时代的质量护城河
description: AI 写得越来越快，但谁来盯着质量？Birgitta 的传感器体系给了我一个答案。写好 lint message 比写好 prompt 更持久。
date: 2026-05-20
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-20-sensors-for-coding-agents-img-00-infographic-core-summary.png)

AI 写代码越来越快，但我的感觉是代码质量越来越难管了。

不是 AI 写得差。它写得太快了。我一个命令下去，十几分钟生成十几个文件，结构看着挺像模像样。过两周回来改一个小东西，涉及五六个文件的连锁修改，改完跑一下，不知道哪里炸了。

Birgitta Böckeler 在她的文章 [Maintainability sensors for coding agents](https://martinfowler.com/articles/sensors-for-coding-agents.html) 里讲的就是这事。她是 Thoughtworks 的 Distinguished Engineer，管 AI-assisted delivery 的全球业务。上个月她刚在 MartinFowler.com 写过一篇「Harness engineering for coding agents」，这篇是实操后续。拿自己的内部项目做了实验，TypeScript + Next.js + React 的内部分析仪表盘，接 Google Chat、Employee API 等四个外部数据源。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-20-sensors-for-coding-agents-img-01-app-architecture.png)

她说了一句话我很有共鸣：内部质量问题对 AI agent 的打击方式，跟对人类开发者是一样的。Agent 在一团乱的代码库里找错地方、重复造轮子、加载不必要的上下文。这跟我自己在一个陌生项目里踩坑的过程没有本质区别。只不过我一天踩三次，它一分钟踩三十次。

## 传感器不新，但算账方式变了

ESLint、Type checker、Semgrep，这些东西存在很多年了。很多团队装了但没认真用，原因也简单：规则维护成本高，误报多，最后变成噪音。

Birgitta 发现一个有意思的翻转。AI 让传感器的成本降了，收益升了。

成本降是因为写自定义规则和脚本不再需要手动查文档、调 regex 了。你跟 Agent 说一句，帮我写一个 ESLint formatter，报 no-explicit-any 的时候先判断是不是关键概念，是就加类型，不是就加 suppress 注释写理由。它三分钟就写好了。

收益升是因为 Agent 改代码的速度远超人类。以前一个 warning 可能搁一周才有人处理，现在 Agent 十秒就能修好继续下一步。传感器的反馈回路从人看到、人判断、人修复，变成了机器报警、机器自修、人只审异常。

这就是她说的 Agent = Model + Harness 的心智模型。Model 是模型本身，Harness 是包裹在模型外面的护栏、规则和传感器。模型能力趋同，Harness 的质量决定你拿到的代码能不能用、能持续用多久。

## 三层传感器

她把传感器按运行频率分了三类：

```
编码会话中  ──→ ESLint / Type checker / Semgrep
                dependency-cruiser / mutation testing / GitLeaks
                实时反馈，秒级响应

CI pipeline   ──→ 同样的传感器在干净基础设施上再跑一遍
                确认集成后仍然通过

周期性运行    ──→ 安全审查 / 数据审查 / 依赖新鲜度报告
                模块化与耦合审查
                慢节奏，发现累积性退化
```

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-20-sensors-for-coding-agents-img-02-sensors-overview.png)

编码会话中的传感器是计算型的。确定性，秒级反馈。Agent 写完就跑，错了就改，跟人类写代码时看编译器报错没有区别。

CI pipeline 是同一批传感器的二次确认。会话中传感器给了 Agent 早期反馈，CI 在干净环境上确认集成结果。

周期性传感器才防微杜渐。依赖库过期不是一天两天会出事，数据流转不规范也不是一次两次会暴露。实时传感器抓不到这些，只能靠定期巡检。她跑了一个脚本先收集依赖库的年龄和活跃度，然后让 AI 生成升级建议报告。计算加推断的组合。

这里面有个细节值得注意。依赖库年龄和活跃度是脚本抓的数字，但「该不该升级」「有没有风险」需要 AI 判断。计算型传感器给出硬指标，推断型传感器做软判断。两者配合才能覆盖那些不黑不白的灰色地带。

## ESLint 给 AI 用得换个玩法

最有实操价值的部分是她对 ESLint 的改造。

默认的 ESLint preset 里，函数参数上限、文件长度、函数长度、圈复杂度，这些规则根本没开。她手动配了阈值。然后发现 Factory 已经出了专门针对 AI agent 失败模式的 ESLint plugin，要求必须有测试文件、结构化 logging 等。

她做的不只是开规则，而是给 Agent 写了自我修正指引。

`no-explicit-any` 这条 warning，默认报错就是不要用 any。她改成了这样：

> 我们希望关键概念有类型，但也别搞一堆不必要的类型污染代码。自己判断。如果选择不引入类型，用 suppress 注释说明理由。

二元选择变成了有上下文的判断。Agent 可以自己决定哪些是核心概念必须 typed，哪些是临时胶水代码可以 any。

对阈值类的规则比如最大行数，她告诉 Agent 可以小幅调高阈值，如果它觉得某次重构不必要或不可行。这不等于永久放宽。阈值提高了，下次再超还是会报。约束还在，只是不再是「要么全改要么全 suppress」的死板选择。

我自己的感受是，这其实就是 prompt engineering 的一种落地形态。与其让 Agent 猜该不该修，不如在规则消息里给它决策框架。

## 代价

她也很诚实地记录了副作用。

Agent 收到拆成小函数的传感器反馈后，确实做了大量有用的重构。但在 React 前端出现了一个令人担忧的趋势。组件的 props 越来越多。函数越拆越小，值就要穿过一层又一层传递下去。max-lines 和 max-lines-per-function 两条规则之间产生了 tradeoff。

她没有给出结论，说还在观察 Agent 在这种权衡中能做多好。这个诚实本身就难得。很多写 AI 编码的人只展示成功案例。

我也遇到过类似的情况。AI 拆函数拆出来的 props drilling，最终还是要人来判断。这个组件到底应不应该收这么多 props？还是用 context？还是在架构层重新划分职责？传感器能发现退化，但不一定能告诉你该走哪条路。

说到底，传感器是度量，度量是镜子。镜子照出问题，但修不修、怎么修，还是拿镜子的人说了算。Birgitta 没有回避这个矛盾，她把选择权交给了 Agent 自己，同时保留了对异常的审查权。这是一种务实的退让，而不是把质量完全托付给机器。

## 谁写传感器谁定义质量

传感器本身正在成为一种 AI 时代的核心能力。

以前写好 prompt 是核心竞争力。谁能把需求描述清楚让 AI 听懂，谁就厉害。但 prompt 是一次性的，AI 每次生成的代码还是要有人 review。传感器的规则是持久的。一旦写好，每次 Agent 改代码都会自动校验，而且 Agent 自己能根据传感器反馈自我修正。

写好一个 lint message，比写好一个 prompt 更持久。lint message 持续运作，prompt 的效果只在生成那一瞬间。

团队分工可能也要变。以前是资深工程师写架构，初级工程师实现。现在可能是资深工程师写传感器规则和自修正指引，Agent 实现。写规则的人要懂得权衡。什么规则该严格，什么该给 Agent 留判断空间，什么该允许阈值调整。

Birgitta 说她在激活新规则集时，每次都会发现新的问题。一部分无关紧要，一部分真的该修。她担心的是反馈过载。Agent 收到太多 sensor 信号后，会不会陷入过度工程化的重构螺旋？

这个担心很实在。传感器的精度和密度需要平衡。太松了没意义，太紧了 Agent 会花更多时间修 warning 而不是完成功能。

## 然后呢

AI 写得快但改不动，答案不是让 AI 写得慢一点，而是给代码装上传感器。让 AI 在写的时候就自动维持质量，不靠人 review 兜底，让系统承担这个复杂性。

Birgitta 的文章还没完。她说下一篇会分享用静态分析保持代码模块化的经验。我挺期待。

*你在用 AI 写代码的时候，靠什么来盯住代码质量？是手动 review，还是已经有一套自动化的传感器了？欢迎聊聊。*

## 原文参考

> Maintainability sensors for coding agents, by Birgitta Böckeler
> https://martinfowler.com/articles/sensors-for-coding-agents.html