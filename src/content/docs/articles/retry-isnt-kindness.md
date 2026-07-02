---
$schema: starlight
title: 真正替你刷爆 LLM 账单的，不是人，是“善意的重试”
description: 最危险的 LLM 成本不是单次太贵，而是成功调用在错误的重试里被重新结算二十一次。
date: 2026-07-02
category: engineering
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-02-retry-isnt-kindness-img-00-infographic-core-summary.png)

我读 Jumpei Ueno 这篇文章时，真正让我后背发凉的，不是“某天 AI 账单高过整月服务器”这件事本身，而是这笔钱的烧法。它既不是谁坐在工位前狂点按钮，也不是模型突然涨价；是一轮本来已经成功的调用，在错误的失败边界上被系统重新结算了二十一次。

这类事故最讨厌的地方，是它看起来像“有人乱用 AI”，其实更像“系统把成功当成没发生过”。钱已经花出去了，结果也拿回来了，只是在最后一步写库时摔了一跤。于是队列看见 500，出于礼貌，再来一遍。再礼貌一点，再来二十遍。

## 吓人的不是重试风暴，而是“成功以后才失败”

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-02-retry-isnt-kindness-img-01-postsuccess_failure_loop.png)

原文里最值钱的细节，是失败发生的位置。LLM 调用不是没成功，恰恰相反，它们都成功了；真正失败的是最后的数据库写入，因为生产环境缺了本该先迁移好的列。

这就把一个很多人脑子里默认的故障模型掀翻了。我们平常说“失败重试”，潜台词往往是请求没打成、连接断了、服务抖了，所以再试一次也许能好。但这次不是。调用成功，结果返回，计费完成，只有持久化那一下失败。也就是说，**最贵的动作已经发生，最便宜的动作才报错。**

我觉得这比普通 retry storm 更可怕。普通重试像是不断撞墙；这次更像每次都先把账结了，再在出门时摔回座位重吃一遍。系统不是在重复失败，它是在重复丢弃成功。

## 真正该被审计的，不是 500，而是副作用有没有被封口

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-02-retry-isnt-kindness-img-02-retry_idempotency_guardrails.png)

读到这里，我脑子里冒出来的不是“这个队列太蠢”。我更在意另一句话：**任何会花钱的动作，只要允许重试，就必须先回答‘重复执行会不会再次收费’。**

Stripe 官方文档把幂等性说得很直白：同一个请求重试时，服务端应该认得出“这还是上一次”，然后直接返回第一次结果，而不是再做一遍。Google Cloud 讲 retry strategy 也一样，明确提醒不要无条件重试非幂等操作，更不要重试那种不会自愈的错误。

可一旦场景换成 LLM，很多团队会下意识把它当成“普通 API 调用”。危险就从这里开始。LLM 调用不是没有副作用的读请求，它至少带着一种很现实的副作用：**它会花钱。** 如果任务层没有把“这一轮已经生成过了”封住，那么重跑一次的含义也就变了。那不是恢复，是再买一遍。

所以我读这篇文章得到的第一个判断是：AI 时代的幂等性，已经不是后端工程师自嗨的洁癖，而是财务边界。

## 这不是 AI 特有事故，是老工程常识被新成本放大了

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-02-retry-isnt-kindness-img-03-schema_code_deploy_sequence.png)

原文把锅扣在 vibe coding 头上，我能理解，但我不想只把它理解成“非工程人员闯祸”。更准确地说，这是几条老得不能再老的工程常识，在 LLM 成本面前突然显影。

第一条常识是：**schema 先于 code。** Martin Fowler 那套 expand, migrate, contract 说了很多年，核心无非就是别让新代码先踩进还不存在的结构里。第二条常识是：**错误要分类型。** `column does not exist` 这种错误，不会因为重试五次就长出一列来。第三条常识是：**成本型副作用必须可观测。** 如果作者不是刚好去看了成本曲线，这次事故大概率会直接活到月账单。

AI 只是把这些常识的罚单变贵了。以前你把一个非幂等作业重跑二十次，可能多的是 CPU、队列、几封报警邮件。现在同样的工程失误，直接变成一张人人看得懂的 invoice。模型没有发明这个 bug；模型只是把 bug 的单价抬高了。

## Vibe coding 降低了上线门槛，但没有降低“继承生产系统”的门槛

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-02-retry-isnt-kindness-img-04-builder_vs_inheritor_responsibility.png)

我最认同原文的一句，是“看见它会怎么坏、会怎么贵，仍然是另一种技能”。这句话其实比“不要让 CFO 上生产”更重要。

因为工具只会越来越擅长让人先把东西跑起来。一个产品经理、运营、财务，拿着 Claude Code 或别的 agent，把流程接起来、页面搭出来、任务队列跑起来，这件事只会越来越常见。问题不在于他们能不能做出来，而在于系统一旦进了生产，谁来补上那些看不见但决定生死的东西：重试上限、幂等键、预算报警、测试环境隔离、迁移顺序、失败分类。

所以这篇文章在我这里最后落成的，不是“AI 太贵”这句抱怨。我读到的是一个很朴素的提醒：**当软件开始变得更容易被造出来，工程的价值就更集中地体现在“别让它悄悄重复收费”这种边界上。** 你可以用两天把功能拼出来，但让“善意的重试”别变成“自动刷卡机”，这事还是得老老实实做工程。

*如果你现在接手一个带 LLM 调用的生产任务队列，你第一件会补上的保险丝是什么？*

## 原文参考

> Jumpei Ueno, Why did one day of AI cost more than a month of servers?
> <https://junueno.dev/en/retry-storm-rebilled-llm-cost/>

> Stripe Docs, Idempotent requests
> <https://docs.stripe.com/api/idempotent_requests>

> Google Cloud Docs, Retry strategy
> <https://docs.cloud.google.com/storage/docs/retry-strategy>

> Martin Fowler, Parallel Change
> <https://martinfowler.com/bliki/ParallelChange.html>
