---
$schema: starlight
title: Claude 越省算力，Anthropic 为什么还在签长约？
description: 读完 Anthropic 的招股书，我更关心算力到货时有多少付费任务能接上。推理效率决定做完一件事要花多少钱，长期合同则决定闲下来的机器也要付多少。
date: 2026-11-21
category: ai-industry
primarySourceUrls: ["https://www.youtube.com/watch?v=wX8nDtGIfYA"]
---

我读 Latent Space 的访谈稿时，看到 swyx 和 Tanay Jaipuria 先聊起每次推理的成本，后来又聊到一笔跨年的算力采购。既然同样的任务可以做得更便宜，为什么还急着签长单？

节目播出后，Anthropic 于 2026 年 11 月 19 日在纳斯达克开始交易。最终招股书披露，2026 年第三季度营收约 170 亿美元，算力和基础设施费用占营收的比例却比二季度更高。我沿着这笔费用往下翻，发现公司同时在跟两种节奏打交道。客户随时可以调整用量，机房和芯片需要提前很久下单。等算力交付、客户也开始付费，效率提升才有机会反映在利润上。

![推理成本、算力承诺与持续付费的任务](https://raw.githubusercontent.com/NTLx/Pic/c72bf16670a4fa5d045ccf292a691ecacb589a9b/wechat-articles/2026-11-21-anthropic-ipo-compute-obligations-img-00-infographic-core-summary.png)

## 同一批算力，可以出现在不同的科目里

嘉宾 Tanay Jaipuria 在节目里提到约 85% 的毛利。我顺着这个数字翻到招股书的费用附注。服务付费客户的算力主要进营业成本，免费访问的算力放进销售和营销费用，模型开发、研究和内部使用的算力划在研发。免费试用能拉来客户，训练能让下一版 Claude 更好用，算这些事情值不值，需要看后续带来的付费量。

![Anthropic 招股书附注的费用分类与原表脚注](https://raw.githubusercontent.com/NTLx/Pic/c72bf16670a4fa5d045ccf292a691ecacb589a9b/wechat-articles/2026-11-21-anthropic-ipo-compute-obligations-img-01-source-operating-expenses.png)

付费推理留下的收入还要支撑研发和获客。衡量公司能否持续盈利时，这些开支也在账上。把免费推理移进营业成本，毛利率会变，整家公司当期的经营利润不会因为这一笔重分类而变。

## 算力越便宜，就越敢先买下来吗？

招股书的季度损益表里，最后两列值得放在一起看。算力和基础设施费用占营收的比例从二季度的 48% 升到三季度的 58%。公司解释说，新算力陆续交付，其中有 50 亿美元来自短期承诺，这些算力比多年期安排下的同类供给贵。营收在长，紧急补货照样会挤压利润。

![Anthropic 招股书季度损益表。最右两列为 2026 年第二和第三季度，金额单位为百万美元](https://raw.githubusercontent.com/NTLx/Pic/c72bf16670a4fa5d045ccf292a691ecacb589a9b/wechat-articles/2026-11-21-anthropic-ipo-compute-obligations-img-02-source-quarterly-results.png)

长约有机会降低采购成本。要训练新模型、还要给突然增长的客户留余量，等排队时再去买，可能既贵又拿不到。提前下单可以换来较低的单位采购价，也增加了按期拿到机器的把握。只要交付的容量持续有人用，这笔交换就有道理。

风险也在同一份合同里。最终招股书披露的采购与租赁承诺约为 9009 亿美元，其中约 4516 亿美元预计在 2030 年底前发生。部分长期合同有最低采购额或照付条款，实际用量不够，也可能要付到保底。这个总额跨多年，不能当作本季度的花费。它告诉我的是，到了交付窗口，Anthropic 得有足够的工作把容量用起来。

公司可以把部分容量转去做研究，少买一批原本要补进来的算力，或者把研发进度提前。能挪多少仍取决于芯片、网络和合同。Tanay 在访谈末尾提到科学研究，我也把它理解为一种可能的用途。研究产出有自己的时间表，价值何时兑现，和付款日是两回事。

## 谁会在下一次交付时继续付费？

截至 2026 年 9 月底，Anthropic 此前六个月发布的模型贡献了该季度超过 80% 的营收。假如下一次升级是竞争对手先做出来，客户手里的活有多少会跟过去？

企业通过云平台采购可以省下接入和合规的工作。如果调用的是一套经过评测的多模型路由，团队可以拿同一批任务重跑，逐步把服务交给另一款模型。换成长期集成 Claude Code 的团队，情况会复杂一些。迁移还包括重验工具权限、团队规则和代码审查流程。产品在这些地方省下的协调成本，可能比模型切换时的价差更能解释客户为什么留下。与此同时，更好的替代品也可能值得一次迁移。招股书的新模型收入占比本身回答不了这个问题。

站内那篇关于预算被提前用完的文章，讨论过按量付费怎样把已发生的需求显出来。这次读到算力长约，我开始关心这些用量能不能跨过一次模型换代。假设一个团队先开账号给工程师试用，使用量可以在新模型推出后迅速抬高。等团队把每天的代码检查、派工和复核排进同一套流程，才有机会形成下一季仍然存在的用量。两者都能贡献营收，采购算力时需要判断它们各能维持多久。[此前关于按量收费和预算的分析](https://ntlx.github.io/articles/ai-pmf-budget-overrun-signal)

以后再看 Anthropic 的财报，我会把交付和用量放在同一页上读。长期容量进来以后，临时补货有没有减少？新模型发布激起的需求，过了试用期还剩多少？如果订单交付加快，而算力费用占营收的比例仍能回落，同时企业在既有流程中继续付费，我才更愿意相信今天的推理效率正在改善这门生意。

## 参考资料

![Latent Space 与 Tanay Jaipuria 的访谈原缩略图](https://raw.githubusercontent.com/NTLx/Pic/c72bf16670a4fa5d045ccf292a691ecacb589a9b/wechat-articles/2026-11-21-anthropic-ipo-compute-obligations-img-03-source-latent-space-thumbnail.jpg)

- [Latent Space 与 Tanay Jaipuria 的访谈](https://www.youtube.com/watch?v=wX8nDtGIfYA)
- [Anthropic 最终招股书，重点看季度经营结果、算力投资及附注 8](https://www.sec.gov/Archives/edgar/data/2130357/000162828026074944/anthropicpbc-424b4.htm)
- [Anthropic 11 月 17 日版 S-1/A，正文财务原表出处](https://www.sec.gov/Archives/edgar/data/2130357/000162828026074338/anthropicpbc-sx1ax3.htm)
- [Anthropic 上市交割公告](https://www.anthropic.com/news/ipo-close)
- [Latent Space 与 Jamin Ball 的前一集招股书访谈](https://www.youtube.com/watch?v=P735f1xlpL0)
