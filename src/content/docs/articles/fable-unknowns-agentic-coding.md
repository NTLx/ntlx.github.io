---
$schema: starlight
title: 别再只问怎么提示：先找到你没说出口的未知
description: 模型越能跑长程任务，提示词越不像命令，越像一张还没画完的地图：真正贵的是把未知暴露出来。
date: 2026-07-05
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-05-fable-unknowns-agentic-coding-img-00-infographic-core-summary.png)

Thariq 这篇 [《A Field Guide to Fable: Finding Your Unknowns》](https://x.com/trq212/status/2073100352921215386)，表面上是在讲怎么和 Claude Fable 5 协作。我读完以后，没有记住某个 prompt 模板，反而卡在一句更不舒服的话上：

**Agent 变强以后，人的含混会变成生产事故。**

以前模型跑不远，很多问题暴露不出来。你说得含糊，它做两步就停了，错也错在浅处。现在模型能做更长的任务，能搜代码库、改文件、写计划、跑验证，也就能把你没说清楚的部分一路带进实现深处。到那时，错误看起来就不再是“理解错一句话”，更像“整条路线走偏了”。

## 提示词只是地图

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-05-fable-unknowns-agentic-coding-img-01-map_territory_gap.jpg)

原文最好的比喻，是“地图不是领土”。prompt、skills、上下文，是你交给模型的地图；代码库、团队习惯、产品约束、上线风险，才是领土。

问题在于，地图永远是压缩过的。你写“保持现有风格”，模型不知道你说的是视觉风格、代码风格，还是团队里某个资深工程师脑子里的审美。你写“做得专业一点”，它可能理解成更完整的错误处理、更复杂的抽象、更正式的文案。它没故意乱来，它只是在用通用经验补你没画出来的地形。

这也是我觉得原文比普通提示词教程更重要的地方。它没有继续教你把命令写长，而是提醒你先看地图和领土之间的差值。Thariq 把这个差值叫 unknowns。我更愿意翻成“没被说出口的判断”。

判断没说出口，模型就会替你判断。

## 四种未知里，最麻烦的是你以为不必说的那种

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-05-fable-unknowns-agentic-coding-img-02-unknown_quadrants.jpg)

原文把 unknowns 分成四类：已知的已知、已知的未知、未知的已知、未知的未知。这个分类看起来像管理学老梗，但放到 AI coding 里突然变得很实用。

“已知的已知”就是你写进 prompt 的东西。“已知的未知”是你知道自己还没想清楚，于是会问、会停、会让模型采访你。真正容易出事的是后两种。

“未知的已知”是那些你不会写下来，但看到结果会立刻皱眉的东西。按钮密度、文案语气、一个团队对“简单”的默认理解、一个模块里不能碰的旧坑，都在这里。它们不是不存在，只是还没有变成语言。

“未知的未知”更硬。你根本不知道这里有坑。你以为是加一个 auth provider，实际牵到 session 迁移、审计日志、回滚策略。你以为是做一个视频剪辑，实际卡在转录精度、ffmpeg 切点、调色常识。模型越能干，这种坑越晚爆，爆的时候也越贵。

所以 agentic coding 的关键能力，正在从“会不会下命令”转向“会不会让模型帮你找未知”。这和我前几天写 [《Anthropic 这篇 skills 文章，真正写的是组织接口》](https://ntlx.github.io/articles/claude-code-skills-organizational-interface) 时的感觉接上了：skill 的关键不在更花的 prompt，而在把组织里的坑点、验证和记忆做成可调用接口。unknowns 也是一样。它们不能永远躲在人的直觉里。

## 别让 Claude 猜你的沉默

过度具体和过度模糊都会出问题。

太具体，模型会照着你给的旧路线走，哪怕中途发现其实该换解法。太模糊，它会按行业惯例补洞，而你的项目偏偏不是那个惯例。很多人以为这叫“模型不听话”。我现在更愿意把它看成协作协议没写清楚。

一个更好的开场，不是“你是资深工程师，请一步到位完成”，而是把自己的状态说出来：我熟不熟这块代码？我有没有明确偏好？哪些地方可以让你自行裁决？哪些地方如果遇到分叉必须先问？我现在是想探索，还是已经决定要实现？

这件事听起来像礼貌，实际是权限控制。你不是在和模型聊天，你是在分配判断权。

我之前在 [《Agentic Analytics 的真相：Claude 自动化 95% 查询后，真正昂贵的是共识》](https://ntlx.github.io/articles/agentic-analytics-claude) 里写过类似问题：Claude 可以写 SQL，但不能替公司决定什么算收入。这里也一样。Claude 可以实现方案，但不能替团队决定什么叫“够好”、什么叫“别碰”、什么叫“上线风险可以接受”。

这些话不说清楚，它就只能猜。

## 把未知变成一段流程

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-05-fable-unknowns-agentic-coding-img-03-unknown_workflow_loop.jpg)

原文给的方法不复杂：实施前做 blind spot pass，让模型先帮你找未知的未知；用 brainstorm 和 prototype 把“我看到才知道”的偏好逼出来；让模型 interview 你，把架构会受影响的问题优先问掉；给 reference，最好是源码；最后再让它写 implementation plan，把最可能变的决策摆在前面。

实施中，留 implementation notes。偏离计划、遇到边界、做了保守选择，都写下来。实施后，再把 prototype、spec、notes 包成 pitch/explainer，必要时用 quiz 检查自己是否真的理解了改动。

这套流程的价值不在模板，而在顺序。它承认一个事实：未知不是写计划前一次性清空的。未知会在工作里出现。流程的任务不是假装已经全知道，而是让新出现的未知有地方落。

这也能解释为什么 [《Agentic Engineering 的悖论：机器越能干，人越停不下来》](https://ntlx.github.io/articles/agentic-engineering) 里那个问题会越来越尖锐。Agent 把执行摩擦降下来了，人就更容易不停地开新线程。可如果没有一套暴露未知、记录偏离、判断停止的机制，执行越快，只是越快把没想清楚的事实体化。

## 读完以后，我更不想写万能提示词了

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-05-fable-unknowns-agentic-coding-img-04-reviewer_buyin_doc.jpg)

我不太相信“以后人人都要学 prompt engineering”这句话了。至少它说得太粗。

更准确的说法可能是：以后每个依赖 Agent 工作的人，都要学会维护一张可更新的任务地图。prompt 是地图的一部分，skill 是地图的一部分，参考代码、验证脚本、实施笔记、评审说明，也都在这张地图里。

而且这不是个人技巧那么简单。很多 unknowns 不是一个人不会表达，而是组织本来就没沉淀。质量标准只在某个人脑子里，设计偏好靠口口相传，历史坑点藏在 Slack 旧消息里，数据口径散在三个 dashboard 里。Agent 只是把这件事照亮了。

所以我读 Thariq 这篇文章，真正带走的不是“下次记得说 blind spot pass”。当然这很有用。我带走的是另一个更朴素的判断：

**AI coding 的下一层基本功，是把沉默变成材料。**

把“不知道怎么问”变成 blind spot pass。把“我看到才知道”变成 prototype。把“这里以前踩过坑”变成 skill。把“中途为什么改方向”变成 notes。把“这个改动为什么值得合并”变成 explainer。

地图会一直不完整。成熟不是一次画完，而是每走一段，就把刚刚露出的地形补回去。

*你现在最常让 Agent 替你猜的是什么：产品意图、代码风格、风险边界，还是“做到什么程度算够”？*

## 延伸阅读

* [让 AI 写代码不再翻车：一个 TypeScript 巫师的 5 个 Agent Skills](https://ntlx.github.io/articles/5-agent-skills-for-ai-coding)
* [Anthropic 这篇 skills 文章，真正写的是组织接口](https://ntlx.github.io/articles/claude-code-skills-organizational-interface)
* [Agentic Analytics 的真相：Claude 自动化 95% 查询后，真正昂贵的是共识](https://ntlx.github.io/articles/agentic-analytics-claude)
* [Agentic Engineering 的悖论：机器越能干，人越停不下来](https://ntlx.github.io/articles/agentic-engineering)

## 参考资料

* [Thariq on X: A Field Guide to Fable: Finding Your Unknowns](https://x.com/trq212/status/2073100352921215386)
* [Know your unknowns: example artifacts](https://thariqs.github.io/html-effectiveness/unknowns/)
* [Anthropic: Claude Fable 5 and Claude Mythos 5](https://www.anthropic.com/news/claude-fable-5-mythos-5)
* [Claude Platform Docs: Introducing Claude Fable 5 and Claude Mythos 5](https://platform.claude.com/docs/en/about-claude/models/introducing-claude-fable-5-and-claude-mythos-5)
* [Claude Platform Docs: Prompting Claude Fable 5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5)
* [Claude Code Docs: Overview](https://docs.anthropic.com/en/docs/claude-code/overview)
