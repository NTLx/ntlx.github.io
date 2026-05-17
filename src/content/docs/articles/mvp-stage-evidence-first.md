---
$schema: starlight
title: "AI 创业 MVP 阶段：你的 AI 队友不会告诉你\"够了\""
description: "Anthropic 的 Founder's Playbook 暴露了 MVP 阶段最危险的陷阱：AI 会帮你更快地建错东西，而它永远不会告诉你停下来。"
date: 2026-05-17
category: ai-industry
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-17-ai-mvp-img-00-infographic-core-summary.png)

创业圈有个老笑话：你的 MVP 不是太简陋，就是太复杂。现在 AI 把这个笑话改写了——你的 MVP 既简陋又复杂，而且跑得快得离谱。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-17-ai-mvp-img-01-comparison-tech-debt.jpg)

Anthropic 的《Founder's Playbook》把 MVP 阶段定义为一场证据收集练习。不是建设阶段，不是产品抛光，是回答一个问题：真实的人群是否觉得这东西有价值，愿意回来用，愿意掏钱，愿意告诉别人。Idea 阶段验证"问题存在吗"；MVP 阶段验证"解决方案值得吗"。

问题在于，AI 让建造变得不费力了。不费力是好事，也是陷阱。Anthropic 从 $1B ARR 跑到 $30B ARR 只用了 15 个月。Claude Code 从一个内部实验长到 $1B ARR 只用了一年。Dario 把 40% 的时间花在文化建设上——因为他知道，速度越快，方向越容易偏。

AI 不会告诉你"够了"。它会一直建。你得自己踩刹车。

## 三种新的失败模式

传统 MVP 的死法是经典的：建得太慢，等上线时市场已经变了。或者建错了东西，42% 的初创公司死在这里——造了没人要的产品。

AI 时代的死法不太一样。它不是慢，而是太快太快太快地跑错了方向。

第一种叫 agentic technical debt。普通技术债是慢慢累积的，你还有时间还。AI 技术债是复合增长的。没有架构 spec 和约束，每个 coding session 都在重新推导基础决策。决策漂移，代码库失去连贯的心智模型。最后它会崩溃，被迫重建。这不是危言耸听——我自己试过一个周末用 AI 搭小工具，周一回来已经看不懂自己上周五写的代码在干什么。

第二种叫 false PMF。AI 能让你更快到达"早期动能"的时刻——朋友试用了，发个 HN 头条 spike 了，投资人的 portfolio 公司有反馈了。但那不是 PMF。那是瞬时力量。你看不出第六周或第十二周会发生什么。产品有没有真正的留存？用户有没有自发回来？没人用你还得频繁 outreach 和个人跟进？如果是，那叫 push，不叫 pull。

第三种叫 zero-friction scope creep。以前加功能是工程时间约束——"这个要两周"，你自然就不加了。现在加一个功能只需一个下午。每个单独看都合理：产品当然该处理那个边界 case，用户当然想要那个工作流。累积起来，产品超出了原始边界，失去了方向。Anthropic 的解药是构建前写 scope definition——产品做什么，明确不做什么，什么证据出现才加新东西。

## Sean Ellis 测试：40% 是一把尺

怎么知道你是不是陷入了 false PMF？用 Sean Ellis 测试。问你的活跃用户一个问题：如果明天不能再使用这个产品，你会感觉怎样？

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-17-ai-mvp-img-02-framework-false-pmf.jpg)

超过 40% 的人回答"非常失望"——这是一个有意义的 PMF 信号。低于这个数，你多半建的是一个"还不错"的东西，不是"非它不可"的东西。

这个测试的关键不在数字本身，在于它逼你面对一个 uncomfortable truth：早期使用者的客气和真实的需求是两回事。朋友说"挺好的"和陌生人主动回来用是两回事。

还有一个 Effort 测试。PMF 之前，留存靠持续干预——你发消息、你做激励、你跟进。PMF 之后，产品开始自己做这份工作。从 push 变成 pull。如果你的留存曲线全靠你自己撑着，撑不住那天就是跌落那天。

## CLAUDE.md 不是配置文件，是项目记忆

AI 编程最大的坑不是代码质量——是上下文丢失。每个 session 都是空白的。AI 不会记得你上周为什么选了 A 框架而不是 B，不会记得你有意接受了某个取舍，不会记得你的架构原则。

Anthropic 的解法简单得有点无聊：CLAUDE.md。一个文件，放在项目根目录，存三样东西——架构原则、要避免的依赖、有意识接受的取舍。每次 coding session 以它开始，以更新它结束。

这东西的本质不是配置。是项目的持久记忆。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-17-ai-mvp-img-03-infographic-shared-memory.jpg)一个 agentic team 如果没有 shared memory，每个成员都在重新发明车轮。车轮重新发明几次没关系，重新发明二十次之后，你的代码库就成了一个没有灵魂的拼凑物。

社区里有人把这个模式扩展了：context doc + specific task + constraints，作为每个 AI coding session 的 template。这不是过度工程——这是防止决策漂移的护栏。

## 安全不是事后补丁

AI 生成的代码是能运行的代码，不是天生安全的代码。这不是 AI 的错——它能写出功能正确的逻辑，但它没有义务思考这个逻辑会不会被注入攻击、会不会泄露数据、会不会在边界条件下崩溃。

安全漏洞不可见，直到被利用。而且没有自然反馈回路提醒创始人。你的用户不会告诉你"嘿，你的 API 端点缺了 rate limiting"——他们会利用它，或者离开。

Anthropic 的最低责任门槛：任何用户接触之前做安全审查。用 Claude Code Security 扫描代码库，然后人工审查。不是"等产品跑通再说"，是"用户到来之前"。

这听起来像减速带。但它不是。没有安全审查的产品，跑得快等于翻得快。

## 迭代三轮，没有信号就诊断

MVP 阶段结束时，你的产品可能感觉"不完整"。正确。PMF 证据不依赖完整性。用户不会因为你的产品缺了一个 dashboard 按钮就不用它——他们只会因为产品没解决他们的问题就不用它。

Anthropic 的建议是三轮迭代。每轮构建、测量、学习。三轮之后仍然没有 PMF 信号——诊断。有其他响应更好的细分吗？价值感知差距是定位问题还是产品问题？用户不知道这东西好，还是这东西确实不好？

别急着 pivot。先诊断。42% 的创业公司死在"建了没人要的东西"——其中一部分是东西确实没人要，另一部分是找错了人说。

## 你的 AI 队友不会喊停

这就是 MVP 阶段的核心矛盾。AI 让你的建造速度十倍增长，但它不会帮你判断方向。它不会说"等等，这个功能不在 scope 里"。它不会说"用户留存数据不太对"。它不会说"你的技术债已经快压垮代码库了"。

它只会 build。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-17-ai-mvp-img-04-scene-speed-direction.jpg)

踩刹车的人是你。写 scope doc 的人是你。做 Sean Ellis 测试的人是你。在用户到来之前跑安全审查的人是你。三轮迭代后决定 pivot 还是坚持的人也是你。

Anthropic 写了整本 Founder's Playbook。Dario 拿 40% 的时间做文化。不是因为他们觉得文化浪漫——是因为速度越快，纪律越不能少。

你的 MVP 不需要完美。它需要证据。

你上一次问自己"这东西真的有人非用不可吗"，是什么时候？
