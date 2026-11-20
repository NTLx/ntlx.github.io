---
$schema: starlight
title: Agent 写完工单以后，团队为什么还要打开 Linear？
description: Linear 把建单、分派这样的操作交给 Agent。读完 COO 的访谈，我更想知道另一件事：当客服、产品和工程要接手同一个问题时，什么记录值得他们回来查，又值得公司为之续费？
date: 2026-11-20
category: ai-industry
primarySourceUrls: ["https://lspace.beehiiv.com/podcast/s/latent_space_the_ai_engineer_podcast/scaling_linear_s_gtm_to_100m_arr_cristina_cordova_coo", "https://latent.space/p/linear-scaling/"]
---

Linear 的 CEO Karri Saarinen 发了一篇题为《Issue tracking is dead》的文章。按 COO Cristina Cordova 在 Latent Space 访谈里的回忆，有些客户挺认同。可销售还得当面回答一句。那我现在买的是什么？

这期节目拿 Linear 年度经常性收入超过 1 亿美元做标题。读完逐字稿，我反而记住了这个买家问题。手工写工单、贴标签、催人更新状态，确实有很多可以省下来的动作。可当别人接手时，他还得知道这件事为什么要做、做到哪里、谁能确认结束。客户肯花钱买的，也许正是这段交接。

![同一张工单连接工程、产品和客服](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-20-linear-agent-gtm-00-infographic-core-summary.png)

## 工单写得快了，接手的人还是得看懂

假设客服在群里收到一条报障：客户导出的报表少了几列。Agent 能从对话里建单，找出类似的报告，再交给编码 Agent。到了工程师这里，他要知道缺列是预期限制还是新故障。产品经理得弄清哪些客户受影响。客服要等到有证据确认修复，才好回客户。这几个人得从同一张工单里找到各自需要的东西。

Linear 的远程 MCP 接口让外部 Agent 查找、创建和更新工单。它也把项目资料带进编码会话，再把代码改动送回 Linear 供人审查。这两个动作衔接得好，审查人就能从工单追到原始反馈，再用反馈核对修复范围。站内[写常驻 Agent 那篇](https://ntlx.github.io/articles/always-on-agents)谈过相邻的问题。Agent 恢复任务时，记忆里可以留个工单链接，当前状态最好回工单系统查。团队接手也一样。有人能找到原件，就能检查摘要漏掉了什么。

![Linear 官方产品截图。左侧是编码会话产生的改动，右侧是审查讨论](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-20-linear-agent-gtm-01-linear-coding-review.png)

Cordova 说，她会一起看 MCP 和应用的使用量。两条线都在往上走。主持人紧接着问，客户基数也在涨，怎么分辨？我也想看同一批工作区的数据：Agent 写的工单有没有被人接手，接手的人会不会打开关联的反馈或代码，返工时能不能沿原记录往下做。打开应用可能是为了协作，也可能只是去纠正 Agent 填错的东西。聊天工具如果也能给全队看到同一进度、保留决定和审查记录，大家在哪里查其实都行。

## 什么值得团队换掉原来的系统

Cordova 入职时，团队只有一名销售。她把进军大企业划出公司目标，先去找已经有工具可用的成长型客户。说服一家新公司直接注册，和说服一个团队迁走自己的工单、历史与习惯，中间隔着许多实际麻烦。能帮成长型客户完成替换，销售就知道大客户将来会卡在哪些环节。

到了 2025 年，Linear 开始做企业销售。Cordova 回忆，路线图里原有不少面向大组织的功能，团队中途把一部分精力投向了 MCP、Agent 平台和编码工具集成。她认为，这给部分大客户提供了重新评估现有系统的理由。以前填单、编码、审查各有工具，靠人记着把消息带到下一站。现在如果反馈能沿同一条记录走到代码审查，再由客服通知客户，迁移要解决的问题就具体多了。

Cordova 举过一个例子。同样的 bug 标签，在两个团队里可能指不同的事。自由定制能照顾各组的习惯，也会让 Agent 更难决定该把单子交给谁。统一标签会减少这类歧义。有些团队的审批链和职责确实不同，强行统一就可能把返工留给现场的人。企业试用时，我会找一张跨团队、后来被退回重做的真工单，看看迁过去以后，接手者还能不能复原当初的判断。

## 一次正确分派值多少钱

Cordova 希望找到按结果收费的办法。她拿 Intercom 的 Fin 举例。Fin 可以把用户确认解决、或者离开后没有再求助的对话算作一次解决。如果用户后来回到同一对话继续求助，相关费用会扣回。我觉得最值得借鉴的是允许翻案。买卖双方可以回到同一条对话，知道这笔账在什么条件下成立。

工单成功派到工程团队，离解决客户的问题还隔着判断、实现和验收。即使后来交付顺利，也很难说多少钱该归给最初的分派。Linear 还在收核心服务的席位费，编码会话和 Loops 这类需要算力的功能则消耗 AI credits。用量计费能解释运行成本，续费时买方还是会问，这些运行帮团队少做了哪些事。

我会在试点开始时记下原来怎样交接，再看上线后还有多少工单退回重派、需要重复找上下文，或者关闭后重新打开。这些例外都得算进试点成绩。一张已经关了、但客户还得再来问的工单，正好适合放在试点复盘会上。顺着记录查一遍，比看自动建单总数更容易知道该花哪笔钱。

![客户再次求助时，重开工单复查](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-20-linear-agent-gtm-02-flowchart-reopen.png)

## 参考资料

![Latent Space 节目原图，嘉宾 Cristina Cordova](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-20-linear-agent-gtm-03-latent-space-cristina.png)

- [Latent Space 播客与完整逐字稿](https://latent.space/p/linear-scaling/)
- [本期节目视频](https://www.youtube.com/watch?v=x0VSm6IjcDQ)
- [Karri Saarinen 论 Linear 的产品方向](https://linear.app/next)
- [Linear 的增长与业务数据公告](https://linear.app/now/sharing-growth-with-the-people-building-linear)
- [Linear MCP 更新说明](https://linear.app/changelog/2025-05-01-mcp)
- [Linear 编码会话](https://linear.app/changelog/2026-06-11-coding-sessions)
- [Linear Loops](https://linear.app/changelog/2026-07-20-introducing-loops)
- [Intercom 的 Fin 结果定义与计费](https://www.intercom.com/help/en/articles/8205718-fin-ai-agent-outcomes)
