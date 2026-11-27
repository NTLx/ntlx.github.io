---
$schema: starlight
title: 筛一遍 4000 万家公司之后，Clay 还得做什么
description: 重算 Jeff Barg 的线索筛选成本，再顺着 Clay 的路由器和工作流看下去。我更关心的是，哪些判断可以交给模型，出现错判时，团队还能在哪里看见它。
date: 2026-11-27
category: ai-agents
primarySourceUrls: ["https://lspace.beehiiv.com/podcast/s/latent_space_the_ai_engineer_podcast/how_clay_builds_gtm_agents_jeff_barg_head_of_ai", "https://latent.space/p/how-clay-builds-gtm-agents-jeff-barg-head-of-ai/", "https://www.youtube.com/watch?v=qjPcaZf_plo"]
---

Jeff Barg 在 Latent Space 访谈里算了一笔账。把理想客户的画像和一家公司的简介交给模型，问这家公司是否值得销售团队跟进。Clay 的数据库里有 4000 万家公司，如果逐家问一遍，光模型推理要花多少钱？

Barg 随口估了约 1500 美元。我按他给的数重算了一遍。每家公司 1500 个输入 token，乘以 4000 万家，是 600 亿个输入 token。按 TypeSafe 公布的每十亿输入 token 42 美元计算，合计 2520 美元。这笔账只算给定资料后的模型输入费。取得公司资料、补齐缺失信息、核实筛选结果，都要另算。采访里讲的是一个假设，Clay 的数据库是这个算例的范围。[Latent Space 访谈](https://latent.space/p/how-clay-builds-gtm-agents-jeff-barg-head-of-ai/) · [TypeSafe 发布说明](https://typesafe.ai/blog/introducing-system-one-models-and-jev)

读完我在想，假如明天真有这么一张逐家打过分的表，拿到表的销售负责人该相信什么？一家公司的简介里找不到招聘信息，模型可以给它低分。可它也许在招，只是职位挂在集团网站，或者公司压根没更新简介。分数能帮人决定先看哪里。要把一整批分数变成待办事项，还得知道它们是怎么来的。

![从筛选到复核，模型初筛、规则执行与人工复核](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-27-clay-gtm-agents-00-infographic-core-summary.png)

## 给公司打分，和给研究任务选模型

Barg 举的模型叫 Jev。程序可以先定义问题的输出选项，让模型返回选项及概率，再按自己的规则处理结果。我在[读 Jev 的笔记](https://ntlx.github.io/articles/jev-programmable-ai)里关心的是这个接口。业务软件可以接过一个结构化判断，决定下一步查资料、交人工复核，或者先搁着。

Clay 后来公开的工程记录提到了另一种用法。他们给 Jev 写了提示，让它为 Claygent 的研究任务选模型。评测表现落后于他们后来专门训练的路由器。同样是找销售负责人，上市公司的官网可能就有答案，小公司的职位名称和人名也许得从几个来源拼起来。路由器要预判当前任务交给不同模型会做得怎样，Clay 为此让候选模型先做同一批样题，再用评审模型的打分训练路由器。[Clay 的 Auto-mode 工程复盘](https://www.clay.com/blog/how-we-built-auto-mode-claygent)

这里有两个问题。给定一份简介，问公司是否符合某个条件，是在判断已有材料。给定一道研究题，问便宜的模型最后能查到什么，是在预测调查最后能拿到多少证据。两个问题都能把答案限制在几个选项里，答题所需的证据却差得很远。对产品团队来说，我会先把失败代价写清楚，再比较模型。例如初筛里的一次漏判，如果后面压根没有抽查，优质客户就直接从列表里消失了。

## 让 Agent 搭流程，然后让团队看见流程怎么跑

早期的 Sculptor 擅长按指示给表格加列。遇到「做一轮能约到合适客户的外联」这样的任务，只检查它有没有调用对工具，就看不出它拿到的名单是否合适。Barg 说，实际用户还会让 Sculptor 分析表格，有些企业的表大到系统会出问题。这些任务超出了早期评测覆盖的范围。[访谈中关于 Sculptor 的部分](https://youtu.be/qjPcaZf_plo?t=1125)

Clay 一度打算把流程也交给 Agent，让它根据目标决定执行步骤。Workflows 上线时，Clay 给出了另一套分工。Agent 可以搭建工作流，发布后的流程默认按事先确定的步骤跑，需要读网页、判断客户类型时，可以在指定节点调用 Claygent。举个假设的例子，模型可以根据招聘页判断一家公司的扩张方向。进入销售队列前要满足哪些资格、重复记录怎么处理，则可以写成团队能审查的规则。[Clay Workflows 复盘](https://www.clay.com/blog/the-story-of-clay-workflows)

Clay 团队还把原先拿掉的表格快照放回来了。我喜欢这个细节。分支图能解释一条记录为什么走到某一步。并排看一批记录时，你才容易注意到，同一行业的公司怎么全被分到了低优先级。沿着记录往回查，可能发现模型不认识这个行业的简称，也可能发现它们根本没有拿到同一份数据。两种错法在最终表格里都可能只剩一个低分。

![Clay 原图，表格显示成批的输出，工作流画布显示分支](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-27-clay-gtm-agents-01-source-clay-workflows.png)

Barg 还说，长执行轨迹交给模型诊断时，它有时会把耗时最长的操作认作故障。如果团队关心销售邮件有没有收到回复，还要考虑名单、措辞和市场时机。我会先查这轮执行中可以复核的事实，比如取到的是哪一版名单、哪条规则让记录掉出队列，再看回复率是否随改动变化。前一问可以拿同一批样本重跑，后一问需要更长的观察。[访谈中关于评测和故障诊断的部分](https://latent.space/p/how-clay-builds-gtm-agents-jeff-barg-head-of-ai/#transcript)

## 换个入口，留下的工作还能接手吗

Barg 说，Clay 自家做增长的同事习惯待在 Cursor 里，CLI 就有了一个内部需求。Clay 的产品文档也写明，原生全局 Agent 和 CLI 共用同一引擎。这样一来，增长工程师可以从自己的编码 Agent 搭一条流程，接手的人照样能打开 Clay 看它的分支和运行记录。下方 Clay 原图展示了命令行和产品内 Sculptor 两个入口。[Clay Agent Plugin](https://www.clay.com/changelog/clay-agent-plugin-cli-api) · [Clay 全局 Agent 文档](https://university.clay.com/docs/global-agent)

![Clay 原图，工作流的 CLI 与 Sculptor 入口示意](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-27-clay-gtm-agents-02-source-clay-entrypoints.png)

我想到[之前写过的 LangChain 内部 Agent](https://ntlx.github.io/articles/company-harness)。它在私聊里可以代用户处理邮件，换到共享频道，邮件工具就收回。Clay 的例子让我继续追问，除了调用权限，什么应当随入口一起保留下来？如果外部 Agent 建好的流程能在产品里接手，下一位同事就有地方核对记录、定位错判、修改那条规则。至于从当前入口可以读取哪些资料、可以执行什么操作，仍要看调用者的权限和具体场景。

回到那张 4000 万行的假想名单。如果我来接手，我会先从低分和资料缺失的公司里抽一批，回到原始证据看它们为何掉队。分数打错了，就修判断。流程没取到资料，就修数据。下次产品找的客户变了，团队也有地方改筛选条件。否则，下一次跑得再快，也很难知道它是不是在更快地漏掉同一批人。

## 参考资料

- [Latent Space 节目原文、公开字幕与章节索引](https://latent.space/p/how-clay-builds-gtm-agents-jeff-barg-head-of-ai/)
- [Latent Space 节目视频与主图来源](https://www.youtube.com/watch?v=qjPcaZf_plo)
- [TypeSafe 的 Jev 发布说明](https://typesafe.ai/blog/introducing-system-one-models-and-jev)
- [Clay 的 Auto-mode 工程复盘](https://www.clay.com/blog/how-we-built-auto-mode-claygent)
- [Clay Workflows 的设计复盘及产品原图](https://www.clay.com/blog/the-story-of-clay-workflows)
- [Clay Agent Plugin](https://www.clay.com/changelog/clay-agent-plugin-cli-api)与[全局 Agent 文档](https://university.clay.com/docs/global-agent)

Latent Space 节目主图上的标题对应访谈中谈到的一次临时延期。Clay 后来发布了正式的 ChatGPT 集成。[Clay 的上线公告](https://www.clay.com/blog/clay-in-chatgpt)

![Latent Space 节目原图，Clay AI 负责人 Jeff Barg](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-27-clay-gtm-agents-03-source-latent-space-program.jpg)
