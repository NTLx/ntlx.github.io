---
$schema: starlight
title: Agentic Analytics 的真相：Claude 自动化 95% 查询后，真正昂贵的是共识
description: Claude 能自动化 95% 的分析查询，却无法替组织决定“收入”究竟怎么算；可靠答案的真正成本，是被持续维护的共识。
date: 2026-06-04
category: ai-coding
tags: [ "Claude", "Agentic Analytics", "数据治理" ]
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-04-agentic-analytics-claude-img-00-infographic-core-summary.png)

读完 Anthropic 这篇自助数据分析实践，我盯着两个 95% 看了很久：95% 的业务分析查询已经交给 Claude，整体准确率也约为 95%。

95% 的准确率，换个说法就是大约每二十个答案里有一个错。要是问题是“上周哪个活动带来更多注册”，错一次或许只耽误半天；要是问题会进董事会材料、收入预测或监管报告，那一次就够了。

我原以为这篇文章会讲 Claude 如何取代分析师。读下去才发现，为了让 Claude 做自助分析，数据团队必须先把组织里含混、冲突、会过期的共识，改造成一套机器能执行的基础设施。

## SQL 会写了，问题才刚开始

写代码通常有很多条正确路径。只要测试通过、接口满足、性能可接受，实现可以不同。数据分析往往相反：一个问题通常只有一个该被采用的口径。“活跃用户”是登录过，发过消息，还是完成过付费动作？要不要排除欺诈账号？看七天还是三十天？

SQL 写得再漂亮，选错口径，答案照样错，而且不会报错。图表能画，结论读起来还很专业。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-04-agentic-analytics-claude-img-01-code-vs-analytics.png)

Anthropic 因此把分析准确率归为上下文与验证问题。难点落在执行查询之前：把一句自然语言映射到唯一、最新、被组织认可的数据实体。

Claude 可以生成 SQL。它不能替公司决定什么算收入。

## 更多上下文，未必更接近答案

原文里最反直觉的一组实验，不是 95% 自动化，而是“多给资料”几乎没用。

Anthropic 曾让智能体直接检索数千条历史 SQL。对答错的问题，约 80% 的情况下，正确答案其实就在这些历史文件里。智能体也确实读到了它们。可最终准确率变化不到 1 个百分点。

公司通常不缺表、仪表板和文档，缺的是知道哪一个仍然有效、哪一个拥有最终解释权。自助 BI 发展多年后，很多团队得到了一堆都叫“收入”的报表。

所以 Anthropic 没有继续扩大搜索范围，而是缩小选择空间。标准数据集主动淘汰近似重复项；语义层把“收入”绑定到一个受治理的定义；业务背景、血缘和元数据告诉智能体何时用、何时不能用。dbt 等数据平台长期强调的语义层，在智能体时代不再只是方便做报表的工具，而成了阻止模型自信乱选的护栏。

## Skills 不是文档，是共识编译器

最让我改观的是 Skills 的作用。

没有 Skills 时，Claude 在 Anthropic 内部分析评测中的准确率不超过 21%；加入 Skills 后，整体超过 95%，部分领域接近 99%。这里的 Skill 不是一本百科全书，而是资深分析师的工作路径：先查语义层，遇到歧义先澄清，哪些表可用，哪些过滤条件不能漏，最后怎样让另一个智能体反向挑错。

它把老员工的做法，变成可版本控制、评审和执行的 Markdown。

但共识一旦写下来，就会开始过期。Anthropic 观察到，Skills 上线时约 95% 的离线准确率，一个月后会漂到约 65%。他们最后把数据模型、参考文档和 Skills 放进同一个仓库，用 CI 要求模型变化时同步更新说明。现在约 90% 的数据模型 PR 会在同一份 diff 里修改 Skill。

这才是整篇文章最值得抄的部分。不是某个提示词，也不是让 Claude 连上仓库的方式，而是把业务定义当代码维护：有人拥有，变化有触发器，修改要评审，结果能回归测试。

把这套 agentic analytics stack 拆开看，它更像一台共识编译器：人类对业务的争论被编译成语义层、Skill、CI 和评测，再交给 Claude 执行。

## 95% 之后，责任落在谁身上

Anthropic 没有回避最后那 5%。

对抗审查能把准确率再提高 6%，代价是多用 32% 的 token，延迟增加 72%。更棘手的是静默错误：答案错了，样子却很可信，使用者也没有能力发现。原文明确承认，这个问题还没有稳健解法。

“自助”两个字也因此变得复杂。用户越不懂底层数据，越无法验证结果；系统越流畅，越容易让人跳过怀疑。来源脚注、新鲜度、责任人和关键结论人工签字，看起来像旧时代的繁文缛节，却恰好不能删。

不是所有查询都需要 100% 正确。探索性问题可以接受便宜、快速、有误差的答案。可一旦答案会驱动高风险决策，95% 就不能被当作成绩，而要被当作风险预算。

## 先治理一个指标，再造一个智能体

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-04-agentic-analytics-claude-img-02-compile-consensus.png)

如果普通团队想照着做，我觉得起点不该是“给数据仓库接上 Claude”。

先挑一个公司里最常争论的指标。把它怎么算、排除什么、谁负责、多久更新、上游变化时谁必须同步修改写清楚。让仪表板、分析师和智能体都走同一个定义。再准备几十个真实问题，持续测它会不会答错。

这个过程听起来不像 AI 项目，更像一场数据治理清账。也正因为如此，它可能真的有效。

Claude 自动化的是查询执行。组织不能外包的，是对数字含义负责。

*你所在的团队里，哪一个指标看起来人人都懂，实际上每个人算得都不一样？*

## 原文参考

> Anthropic Data Science and Data Engineering, How Anthropic enables self-service data analytics with Claude\
> <https://claude.com/blog/how-anthropic-enables-self-service-data-analytics-with-claude>

> Claude Code Docs, Extend Claude with skills\
> <https://code.claude.com/docs/en/skills>

> dbt Labs, Semantic Layer\
> <https://www.getdbt.com/product/semantic-layer>
