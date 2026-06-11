---
$schema: starlight
title: 从提示词到工具箱——Claude Code 技能系统的设计哲学
description: AI 编码工具的差距不在模型能力，而在谁能把操作性知识外化到文件系统——可版本控制、独立演进。Skills 的本质不是更好的提示词，是给 AI 一个工具箱。但 90% 的 agent 配置创建后从未更新——让知识活着比创建更难。
date: 2026-06-11
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-11-claude-code-skills-philosophy-img-00-infographic-core-summary-3.png)

Anthropic 六月初发了一篇博客，讲 Claude Code 团队内部怎么用 skills。Thariq Shihipar 写的，不长，五分钟读完。但读完之后我盯着屏幕想了很久。

不是因为里面有什么惊人的技术突破。最让我震动的，是他们把最朴素的事情做对了。

## 一个文件夹，不是一篇提示词

Skills 不是 markdown 文件。

这是文章第一段就纠正的一个认知。Skills 是文件夹——里面可以装脚本、资源、数据、模板。你可以放一个 `config.json` 让 agent 在首次使用时跟用户交互配置。你可以放一个 `standups.log` 让 Claude 每次写完站会报告后追加一行，下次自己读自己的历史。

这意味着什么？

我们一直在讨论"怎么给 AI 写更好的提示词"。这个框架本身就是错的。它假设你跟 AI 的关系是作者和读者的关系——你写一段文字，它理解，然后执行。但 folder-as-skill 的设计说的是另一回事：你给 AI 的不是一段话，是一个工具箱。

这不是措辞的差别，是范式的差别。提示词是一次性的、不可复用的、无法版本控制的。工具箱是持久的、可组合的、可以独立演进的。你升级了 `wechat-api.ts` 里的一个函数，所有引用这个 skill 的 agent 行为自动更新——不需要重写任何提示词。

我意识到我过去写的大部分 CLAUDE.md 和 AGENTS.md，本质上都是在做提示词工程——告诉 AI"你要注意这个""你不要那样做"。但 Skills 的思路是：别告诉它，给它工具。别写说明书，给它一个能跑的东西。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-11-claude-code-skills-philosophy-img-01-framework.png)

## Gotchas 才是真金

文章里有一句话我反复看了三遍：*"The gotchas section is the highest-signal content in any skill."*

Gotchas 章节，那些记录"这里容易踩坑""这个 API 在 v2.3 有竞态条件""staging 环境的行为和生产不一样"的几行字，是任何 skill 里信号密度最高的内容。

这很反直觉。如果你让我猜一个 skill 里最有价值的部分，我会猜是流程说明、步骤拆解、最佳实践。但 Anthropic 团队的实际经验是：最有价值的知识不是"怎么做"，而是"哪里会出错"。

想想你在团队里最愿意请教的那个 senior engineer。他给你最大的价值是什么？不是告诉你 REST API 怎么设计——你自己会查。而是在你说"我准备用这个库"的时候，他说"别，那个库的 connection pool 在并发超过 200 时有内存泄漏，我们去年踩过。"

Skills 的 gotchas 在做的就是这件事——把那些只有踩过坑才知道的东西外化出来，让 agent 不用亲自踩一遍。

这让我重新审视了自己写的那些 AGENTS.md。我写了很多"要做什么"，几乎没有"别踩什么"。不是因为我没有踩过坑，而是我没有把坑记录下来——每次都是踩完、修完、忘了。下一次换一个 agent 继续踩。

文章给的建议很实在：gotchas 要持续更新。这可能是整个 skill 系统里最需要纪律性的一环，也是最容易被偷懒跳过的一环。

## 模型的路由表：描述是为谁写的

另一个让我意外的细节：skill 的 description 字段"不是摘要，而是触发条件"。

Claude 在启动时扫描所有已安装 skill 的 name 和 description——每个 skill 大约 30-50 tokens——然后根据任务内容决定加载哪个。这意味着 description 本质上是一段路由逻辑。它的读者不是人类用户，是模型。

你写"这个 skill 帮助你处理 API 调用"——模型看不出来什么时候该触发它。但如果你写"当用户提到 billing、invoice、payment、stripe 或者要求调试支付流程时使用此 skill"——这就是可匹配的路由规则。

这背后是一个更大的设计原则：渐进式披露。如果 100 个 skills 全部在每次会话中加载完整内容，上下文窗口会被撑爆。解决方案不是减少 skills，而是在正确的时间只给模型正确的信息。用文件系统做上下文工程：告诉 Claude skill 里有哪些文件，让它按需读取。

这跟 MCP、Plugins、Hooks 解决的问题是不同层级的。MCP 解决"能连接什么"，Hooks 解决"什么时候自动做什么"，Skills 解决"知道怎么做"。三层各司其职，但 Skills 可能是最被低估的一层——因为"知道怎么做"听起来太朴素了，不像"连接外部 API"那样有技术感。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-11-claude-code-skills-philosophy-img-02-context_layers.png)

## 90% 的配置从未更新

Anthropic 的文章里没提这个数字。这是我做背景调研时从 Forte Group 和 Tessl 的 2026 年研究里翻出来的：90% 的 agent 配置文件创建后从未更新。97% 的 Gemini 文件是一次性写入。Skills 仓库数量在 14 周内从 12 个涨到 5,460 个——然后大部分在提交时就已过时。

这就把问题从"怎么创建 skill"变成了"怎么让 skill 活着"。

创建很容易。你花一个下午，把团队的部署流程写成 `deploy-<service>` skill，把常见调试步骤整理成 `<service>-debugging` skill。很有成就感。然后三个月后 API 改版了，六个月后架构迁移了，你的 skill 开始自信地教 agent 做错误的事。

这比没有 skill 更危险。没有 skill，agent 会承认自己不确定。有一个过时的 skill，agent 会忠实地执行过时的指令——一种静默故障，在规模上放大。

Anthropic 的答案出奇地简单：*"我们最好的 skills 大多数都是从几行和一个 gotcha 开始的，然后因为人们不断添加而变得更好。"*

不是一次性写出完美的 skill。是上线一个最小版本，踩到新坑就追加一行 gotchas，发现新场景就补一段逻辑。像维护代码一样维护 skills——版本控制、code review、增量迭代。

文章里提到的 `standup-post` skill 会在 `standups.log` 里持续追加，这样 Claude 每次都能读到自己之前写了什么。这是一个很小的设计选择，但它把 skill 从静态文档变成了有记忆的系统。知识不是写进去的，是用出来的。

## 知识管理的下一步

之前我理解的"团队知识管理"是：写文档 → 存到 Wiki → 指望有人看。

Skills 把这个链条改写成了：编码为可执行脚本 → agent 自动执行 → 持续反馈更新。

Code review 的规范不再是 Confluence 上的一页文档，而是一个 `adversarial-review` skill 在每次 PR 时自动运行。部署检查清单不是一个 markdown 文件，而是一个 `babysit-pr` skill 真的去监控 CI 状态并在失败时采取行动。

这不是"让文档更可读"，是让知识从被动参考变成主动执行。从文档化到自动化。

但这也有一个前提：你得先把那些分散在 senior engineer 脑子里的、Slack 线程里的、事后复盘会上的隐式知识，拽出来、写下来、放进 skill 文件夹里。Anthropic 说"没有中央团队审批 skills"——上传到沙箱，社区使用，有机增长，获得 traction 后提 PR 进正式市场。这个机制的前提是：有人愿意先把那些"几句话和一个 gotcha"写下来。

技术栈可以搭，市场可以建，但如果没有人写出第一行 gotchas，整个飞轮转不起来。

*你们团队有没有那种"只有某个人知道、文档里找不到、新人第一次必踩"的坑？你是用 Skills 还是 AGENTS.md 来管理 agent 的知识？*

## 原文参考

> Thariq Shihipar, "Lessons from Building Claude Code: How We Use Skills", Anthropic Blog, 2026-06-03
> <https://claude.com/blog/lessons-from-building-claude-code-how-we-use-skills>
