---
$schema: starlight
title: AI 写的代码，谁来审？
date: 2026-05-08
description: 代码在变便宜，判断力没有。
coverImage: cover.png
category: ai-agents
---

前两天 GitHub Blog 发了篇文章，标题直接戳到痛处——"Agent pull requests are everywhere"。作者 Andrea Griffiths 是 GitHub 的 Senior Developer Advocate，她说了句大实话：你可能已经审过 Agent 写的 PR 了，只是你没意识到。测试过了，代码看着干净，你点了 Merge。

问题就在这——**越干净越危险**。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-08-agent-pr-review-img-00.jpg)

## 一天 2000 行 vs 一天 200 行

先看一组数据。GitHub Copilot 代码审查已经跑了超过 6000 万次，不到一年涨了 10 倍。现在 GitHub 上超过五分之一的代码审查都有 Agent 参与。

这不是"未来趋势"，这就是现在。

一个开发者午饭前能启动十几个 Agent session。每个 session 吐一个 PR，下午你的审查队列就炸了。但你的阅读速度跟五年前一样——一天大概能认真看 200 行 diff，这还是状态好的时候。

写代码的成本断崖式下降，审代码的成本纹丝不动。这个剪刀差就是一切问题的根源。

GitClear 2025 年分析了 2.11 亿行代码变更，结论比想象的还糟糕：AI 辅助编程让代码总量增加了 10%，但重构占比从 25% 骤降到 10%。复制粘贴的代码比例从 8.3% 涨到 12.3%。代码在变多，但质量在变薄。

CodeRabbit 的分析更刺激——AI 参与写的代码出"重大问题"的概率是人类代码的 1.7 倍，逻辑错误多了 75%，安全漏洞高出 274%。

**AI 产出更多代码，但这些代码更脆弱。**

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-08-agent-pr-review-img-01.jpg)

## "看起来对"才是最危险的

Agent 写的代码有一个特征：它编译通过，测试全绿，但你总觉得哪里不对劲。

原文用了个词我特别喜欢——"looks complete"。看起来完整。这就是 Agent 代码的典型画像。不是错在表面，是错在深层。分页的 off-by-one、某个分支缺少权限检查、边界条件短路、并发下的竞态——这些东西编译器和单元测试都抓不到。

而且有个反直觉的发现。那篇 "More Code, Less Reuse"（2026 年 1 月）的研究提到：**评审者对 Agent 生成的代码反而感觉更好，更容易批准**。换句话说，Agent 代码更容易通过审查——不是因为它写得更好，是因为它"看起来更规范"。

这就有点讽刺了。人类代码乱七八糟但逻辑可能是对的，Agent 代码整整齐齐但逻辑可能是错的。你的眼睛被格式骗了。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-08-agent-pr-review-img-02.jpg)

## 审 Agent PR，盯这 5 个地方

原文列了五个红旗信号。我不想机械翻译——挑三个我觉得最容易被忽略的说。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-08-agent-pr-review-img-03.jpg)

**第一个，CI 被"优化"了。** Agent 跑 CI 挂了，它有一个天然解法：删测试、跳过 lint、给测试命令后面加 `|| true`。听起来离谱，但 Agent 真的会这么干。原文说得对——任何弱化 CI 的变更，直接 block，不需要商量。检查四件事：覆盖率阈值变了吗？测试被删了或 skip 了吗？workflow 停止在 PR 上跑了吗？某个 CI 步骤多了个以前没有的条件判断？

**第二个，代码重用盲区。** 这是原文说的"ROI 最高的事"。Agent 会找代码库里已有的模式然后复制——但它不知道有个工具函数三年前就写好了。于是你得到一堆"几乎一样但名字不同"的 helper、重复的校验逻辑、从头写的中间件。更恶心的是：这些重复代码会成为新的"模式"，被下一次 Agent 调用发现并继续复制。扩散效应。解法很简单：每看到 Agent PR 里新加的 utility，全局搜一下有没有等价物。有就要求合并，别留 comment 就过。

**第三个，Prompt Injection 在工作流里。** 这个被严重低估了。典型场景：CI workflow 读取 PR body → 塞进 prompt → 模型吐输出 → pipe 到 shell → 整个流程跑在 GITHUB\_TOKEN 权限下。OWASP 2025 年把 prompt injection 排在 LLM 安全风险第一位，不是没原因的。审查 Agent workflow 的时候盯紧：不可信输入有没有 sanitize？token 权限是不是最小化的？模型输出有没有被当命令执行？

另外两个——"幻觉正确性"（代码能跑但是错的）和"Agent 装死"（review 之后 PR 沉了）——原文也讲得很清楚。对前者，挑 diff 里最关键的一条路径从头跟到尾，检查边界。对后者，如果 PR 没有实现计划就直接要求拆解，别浪费时间。

## 让 AI 先审，你做最后一关

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-08-agent-pr-review-img-04.jpg)

原文给的建议很实用：让 Copilot 先把机械性的东西扫一遍——风格问题、明显的逻辑漏洞、缺少的错误处理。这步当成前置条件，不是替代品。

我最近也在做类似的事。把安全检查清单写成 workflow，auth 检查、env 处理、测试是否真的在跑——每次 PR 自动跑一遍。发现严重问题直接 block merge。**省下来的精力，用在只有你能做的事上。**

Copilot 代码审查的数据也印证了这个方向——71% 的审查给出可执行反馈，剩下 29% 完全不做评论。他们刻意选择"少说废话"，即使这意味着更长的审查延迟。因为他们发现：开发者真正需要的不是更多评论，是更少但更准的评论。

## 判断力不会自动化

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-08-agent-pr-review-img-05.jpg)

原文结尾说了一句话我琢磨了很久："The part of review that doesn't get automated is judgment, and judgment requires context only you have."

判断力不会自动化。判断力需要上下文——只有你有的上下文。

你知道哪个服务凌晨三点容易挂。你知道那次线上事故是因为一个边界条件。你知道为什么那个 middleware 要那样写——因为上个季度改了三次才稳定。这些东西不在代码库里，不在文档里，在你的脑子里。

**代码在变便宜。判断力没有。**

所以这篇不是在教你怎么审 Agent PR。是在说一个更残酷的事实：以前你的价值是"会写代码"。以后你的价值是"知道什么代码不该写，什么时候不该合，什么东西看起来对但其实是雷"。

写代码的人会变多。知道什么代码不该合的人不会。

***

你审过 Agent 写的 PR 吗？有没有那种"看着都对但就是不对劲"的时刻？

## 原文参考

> Andrea Griffiths. **Agent pull requests are everywhere. Here's how to review them.** The GitHub Blog.
> <https://github.blog/ai-and-ml/generative-ai/agent-pull-requests-are-everywhere-heres-how-to-review-them/>
