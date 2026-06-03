---
$schema: starlight
title: 当写代码不再是瓶颈，流程就露出了真身
description: AI 把写代码变便宜后，工程组织省下的不是管理成本，而是被迫看清验证、安全和品味才是真正的稀缺。
date: 2026-06-03
category: ai-coding
tags: [ "Claude Code", "AI Coding", "工程组织" ]
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-03-ai-native-engineering-org-img-00-infographic-core-summary.png)

读完 Fiona Fung 这篇《Running an AI-native engineering org》，我第一反应不是“Anthropic 真会用 Claude Code”，而是有点不舒服。

因为她讲的不是一个工具故事。当写代码突然不再贵，工程组织里很多旧流程就没地方躲了。

过去我们很容易把问题归到“人手不够”。需求排不完、测试补不上、重构拖了三个月，都是人手不够。这个解释很方便，因为它把组织问题伪装成资源问题。

AI coding 把这层皮撕开了。代码可以更快生成，测试可以更快补，原型可以一天出三个。然后你会发现，项目并没有自动变顺。卡住的地方换了名字：验证、审查、安全边界、产品判断、长期维护。

## 便宜的不是工程，是打字

Fiona 说，Claude Code 团队里，写代码、写测试、重构已经很少是慢环节。这句话听起来像效率广告，但我觉得它真正刺耳的地方在后半句：瓶颈没有消失，只是搬家了。

这和她讲 Visual Studio 2005 的类比很像。软件还要刻 CD、装盒、进商店时，发布节奏绕着制造截止日期转；在线分发出现后，整个交付模型被迫重写。成本结构变了。

今天 AI coding 改变的也是成本结构。以前最贵的是实现，现在实现变便宜，判断就贵了。以前争论一个 API 方案，可以写设计文档、开会、画白板；现在让模型生成三版 PR，直接看调用方影响。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-03-ai-native-engineering-org-img-01-code-to-verification.png)

但这里有个坑。很多团队会把“构建便宜”误读成“工程便宜”。于是更多代码涌进同一条旧流水线，review 队列爆了，CI 排队了，安全同学被拉进更多临时评审。

代码便宜，只说明打字便宜。工程没有便宜。工程只是把账单递给了下一个环节。

## 最该被审查的，可能是流程本身

整篇里我最喜欢的一句，是“旧流程很少会自己死掉”。

流程一开始通常不是坏东西。周会解决信息不透明，设计评审避免返工，roadmap 对齐资源，code ownership 让责任落地。问题是，流程不会在使命结束时自动离场。它会留下来，变成不用解释的惯性。

AI-native 组织最该做的，是少一点本能自动化，多问一句：这个流程当年要解决的问题，现在还存在吗？

如果六个月 roadmap 三个月就失效，它也许不该继续假装是承诺；如果技术争论可以用三个原型说清，白板会就该少开；如果“谁写的这段代码”已经不再回答真正的问题，团队就该追问自己到底要找的是责任人、上下文，还是修复路径。

这不是反流程。说到底，这是给流程加一条更硬的续命条件：它必须证明自己还在服务目标。

## 人没有消失，人被挪到更硬的位置

Fiona 讲 code review 时用了一个老词：trust but verify。Claude 可以处理 style、lint、补测试、一些明显 bug。人留下来审法律、安全、信任边界、产品品味。

AI 让角色边界变模糊，但没有让专业消失。PM 可以写原型，设计师可以补测试，工程师可以让 Claude 帮自己写调查文案。可一旦进入高风险边界，专业反而更值钱。

以前一个普通实现任务会消耗很多工程师时间，专家判断被淹没在执行细节里。现在执行被放大，判断就露出来了。一个安全工程师的价值，不是比 Claude 多写几行代码，而是知道哪条权限边界不能交给自动模式；一个设计师的价值，不是会不会生成界面，而是能看出那个“雪人”其实像 Mr. Peanut；一个工程经理的价值，也不是把 10 个 IC 排成一棵树，而是自己能不能靠近代码，知道团队真实卡在哪里。

所以我不太相信“AI 让工程组织不需要那么多人管理”这种简单说法。更准确的说法是：AI 让脱离现场的管理更难糊弄。你不能只看进度表；你得看验证链路、权限边界、review 密度、CI 负载和上线后的质量。

## 从最吵的地方开刀

这篇文章最后给的建议很小：pick your noisiest workflow。挑一个最吵、最贵、最让人烦的流程，问它还服不服务原来的目的。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-03-ai-native-engineering-org-img-02-noisy-workflow-audit.png)

我觉得这比“全面 AI 转型”靠谱得多。一个团队不需要先宣布自己 AI-native。先找一个没人认真看的周报，一个拖慢决策的评审，一个重复三遍的 triage，一个靠人肉复制错误日志的 CI 流程。问四个问题：

它当初解决什么？现在还解决吗？能不能自动化？如果不能自动化，能不能直接删？

真正的变化往往从这里开始。不是从买工具开始，也不是从统计 AI 生成代码比例开始。生成比例很容易变成虚荣指标。更要看的，是新人多久能上手，PR cycle time 有没有缩短，质量和可靠性有没有守住，用户问题有没有更快被解决。

我读完后的结论有点冷：AI-native engineering org 表面上更快，底色其实更诚实。它更难自欺。

因为当“写不出来”这个借口消失，剩下的每一个卡点都更像组织自己的样子。

*你团队里有没有一个流程，曾经是护栏，现在已经变成噪音？*

## 原文参考

> Claude, Running an AI-native engineering org
> <https://claude.com/blog/running-an-ai-native-engineering-org>

> Claude YouTube transcript, Running an AI-native engineering org
> <https://www.youtube.com/watch?v=igO8iyca2_g>
