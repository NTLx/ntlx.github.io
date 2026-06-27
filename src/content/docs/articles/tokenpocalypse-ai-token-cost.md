---
$schema: starlight
title: Tokenpocalypse：当你发现 AI 账单比 AI 产出更好量化
description: 企业花六个月烧完全年 AI 预算，才发现账单上每一行都写得清，唯独说不清这些钱换回了什么。Tokenpocalypse 的本质是一场价值衡量危机。
date: 2026-06-28
category: ai-industry
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-28-tokenpocalypse-ai-token-cost-img-00-infographic-core-summary.png)

## 从"给我往死里用"到"给我省着用"

四个月前，Uber 告诉员工：用 AI，尽可能多用。他们甚至在内部排行榜上比拼谁用得更多。

四个月后，Uber 的 CTO 站出来承认——全年 AI coding 预算花光了。不是年底，是四月。

然后就有了新规矩：每人每月每个 agentic 工具限额 1500 美元。Claude Code 一个额度，Cursor 一个额度，互不影响，但各自封顶。

我读 404 Media 这篇报道时最先注意到的是速度。一月鼓励，四月恐慌，六月限额。Tokenmaxxing 从流行词汇变成反面教材，用了不到半年。

TechCrunch 的 Equity podcast 里有个观察我觉得很准：上一个从被追捧到被否定这么快的管理理念，他们也想不起来。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-28-tokenpocalypse-ai-token-cost-img-01-tokenmaxxing_to_rationing_timeline.png)

## 账单终于来了

Uber 只是最先被看见的。

GitHub 在六月一号把 Copilot 从订阅制改成了按 token 计费。月费没涨（Pro 还是十块，Enterprise 还是三十九），但包含的用量有限，超出的部分按 token 收钱。新货币叫 GitHub AI Credits，一 credit 等于一美分。年付用户到期后更惨：Opus 4.7 的乘数从 7.5 倍涨到 27 倍。

Simon Willison 算过一笔账：他自己每月在每个 AI 工具上烧大概一千美元的 token。因为个人订阅有补贴，实际只付一百。但如果他在 Uber，按新规矩，还有五百块的余量。

问题是当 AI 从月费十块的订阅变成按 token 计费的计量表，你回头看那个价格，它卖的是订阅，补贴的是市场份额。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-28-tokenpocalypse-ai-token-cost-img-04-uber_github_three_company_responses.png)

## 烧钱的不是工程师

这是整篇报道里最让我意外的一段。

Accenture 内部泄露的音频里，agentic AI strategy lead Justice Kwak 说了一句："从我们内部的数据看，推动 token 消耗的其实不是工程师。是大量非工程人员在做一些那样的行为。"

什么样的行为？把 PDF 转成 PPT。

在 Accenture 的一次内部会议上，当 Kwak 准备展示幻灯片时，客户组负责人 Stuart Henderson 开玩笑说，希望他不是用 AI 把 PDF 转成图片再转成 markdown。Kwak 承认数据确实显示有些任务根本不需要 AI，但因为用了 AI，白白消耗了 token。

我想了一下，觉得这其实不意外。工程师用 Claude Code 写代码，每次调用有明确输入和可验证输出。一个测试跑通了，一段代码编译过了。你知道 token 花在哪了。但一个市场部的同事用 GPT-5 做"帮我总结一下这个 PDF 然后生成十页 PPT"，那一次调用可能吃掉几万个 token，产出是一堆"大概差不多"的幻灯片。

这个人该不该用？该问的问题是：谁来判断什么叫"值得"？

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-28-tokenpocalypse-ai-token-cost-img-02-engineers_vs_nontech_token_consumption.png)

## 没人算得清这笔账

Kwak 在音频里说了一句话，我觉得是整个事件的核心："AI 总支出是可见的。但把 token 级别的花费归因到具体项目的价值产出上——这不可见。"

这才是 Tokenpocalypse 的真面目：花钱不可怕，可怕的是不知道花得值不值。

Accenture 计划推一个叫 Token IQ 的产品帮客户搞明白这件事。但请注意这个因果——Accenture 先是鼓励所有人拼命用 AI，把 token 烧起来了；现在发现自己可以卖咨询服务帮客户弄明白这些 token 花得对不对。

这不是在解决问题。这是在问题的两边同时赚钱。

话说回来，我也不觉得这个问题有干净的答案。一个工程师花两百美元 token 重构了一个模块，节省了团队每周两小时的 code review 时间——这值不值？一个运营花五十美元 token 生成了二十张社交媒体配图，省了一下午的 Canva 时间——这又值不值？

我们目前唯一能量化的是成本。价值？还在猜。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-28-tokenpocalypse-ai-token-cost-img-03-ai_spend_vs_value_gap.png)

## 作为 AI 用户

我自己每个月在 AI 工具上花不少钱。读完这篇报道，我问自己一个问题：如果明天我的 AI 账单变成一份逐条列出的 invoice，我会不会也慌？

大概不会。因为我知道每一笔 token 花在了什么上面。写一篇文章、调试一段代码、分析一份文档——我花出去的钱和我得到的东西之间有一条我能看见的线。

但企业里的大部分人不这样用 AI。他们没有这条线。他们有的是一个输入框和"随便问"的自由。当这个自由是十块钱包月的时候，没人在意。当它变成按 token 收费的时候，突然所有人都在意了。

Tokenpocalypse 真正告诉我的是另一件事：当一样东西从近乎免费变成按量计费，你才发现自己从来没有认真想过它到底值多少钱。

这个教训不限于 AI。

*你觉得你的 AI 使用习惯里，哪些操作最"烧 token"但回报最难衡量？*

## 原文参考

> 本文基于 404 Media 报道《The Tokenpocalypse Is Here: Companies Are Scrambling To Stop Spending So Much on AI》（Joseph Cox, 2026-06-24）的读后感。
> <https://www.404media.co/the-tokenpocalypse-is-here-companies-are-scrambling-to-stop-spending-so-much-on-ai/>
