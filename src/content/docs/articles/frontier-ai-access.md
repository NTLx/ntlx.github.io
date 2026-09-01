---
$schema: starlight
title: 最稀缺的 AI 能力，正在变成访问权
description: 模型越强，真正昂贵的越不是 token，而是没有退出权：你能否使用、迁移、审计，并在供应商改变规则时继续工作。
date: 2026-09-01
category: ai-industry
tags: [frontier AI, AI access, model lock-in, open weights, enterprise AI]
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-01-frontier-ai-access-img-00-infographic-core-summary-2.png)

读完 Tomasz Tunguz 的[《The Price of Entry to the Frontier》](https://tomtunguz.com/the-great-segmentation)，我认同他最有力的判断：前沿 AI 的新稀缺性不是价格，而是访问权。但读到这里，我脑子里马上冒出一个问题：所谓“访问”，究竟包括什么？真正决定一家企业能不能把 AI 当成基础设施的，不只是今天能不能调用，而是明天能不能继续用、能不能换、能不能解释，以及规则改变后谁来承担后果。

这比“哪家模型最强”不那么刺激，却更接近企业真正会遇到的麻烦。模型能力可以在排行榜上比较，访问权却藏在合同、区域、配额、数据边界和产品默认设置里。很多时候，等系统上线，账单才真正出现。

## 访问不是一个按钮

原文把供应端和需求端放在了一张图上：模型实验室通过伙伴计划、政府限制和许可门槛管理入口；企业软件则把某个供应商的模型写进产品，让用户直接在默认设置里接受它。

我会把这里的“访问权”拆成五层：**调用权、地域权、规模权、迁移权和责任权**。调用权是你今天能不能用，地域权是你在哪儿能用，规模权是从试验扩大到生产后还能不能用；迁移权决定你能否把数据、评估和工作流带走，责任权则决定出了问题以后谁能审计、谁能叫停、谁需要解释。

这五层里，前面三层比较容易被看见，后面两层最容易被忽略。一个 API 可能价格很低、效果很好，却让你的提示词、工具接口和评估体系全部围绕它定制。等到供应商调整配额、改变地区政策或关闭某个版本时，真正昂贵的不是涨价，而是你已经没有一个可运行的替代方案。

所以我不太愿意把“访问权”理解成一个开关。它更像一张权限表：谁可以用、在哪儿用、用到什么规模、带着什么数据用，以及能不能在不重做整个系统的情况下离开。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-01-frontier-ai-access-img-01-access-layers.png)

## 默认模型是一笔交易

Salesforce 和 Anthropic 的合作，把这件事摆到了台面上。Salesforce 的[官方新闻稿](https://www.salesforce.com/news/press-releases/2026/08/26/salesforce-and-anthropic-announce-claudeforce/)确认，Claudeforce 首个落地是 Salesforce in Claude，包含 37 个预置销售技能；新闻稿同时称 Claude 默认服务于 Slack AI、Agentforce 等场景，Salesforce in Claude 当时处于试点阶段。

这不只是“在产品里接了一个模型”。Salesforce 把自己的数据、业务规则和工作流交给 Claude 去调用，Anthropic 则获得了更深的企业入口。对客户来说，收益也是真实的：少做一层集成，少维护一套权限映射，还可能得到更明确的安全边界。

代价是，默认模型很容易从“最方便的选择”变成“唯一可行的选择”。我的站内文章[《模型选型只是虚晃一枪：读 OpenRouter 的大模型供应商性能评估与动态路由指南》](https://ntlx.github.io/articles/evaluating-llm-provider-performance-routing)讨论过动态路由的价值，但读完这篇新材料后，我更确定一件事：**只有模型可以切换，还不算真正的可替换。** 数据格式、工具调用、评估集、权限和失败回退也能一起迁移，路由才是杠杆；否则只是把供应商选择藏到了更深的配置里。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-01-frontier-ai-access-img-02-switching-cost.png)

这也是为什么我不把供应商绑定简单骂成锁定。深度绑定换来了产品整合和责任集中，有时正是受监管企业愿意购买的东西。问题在于，这笔交换应该被明确写出来，而不是被包装成一个无须讨论的默认选项。

## 开放权重只拆掉了一扇门

原文对开放权重的判断，我基本同意；只是这里很容易滑进一个误读：权重可以获得，不等于整个能力链条都开放。

以原文引用的 Z.ai 为例，[Digital Applied 对 GLM-5.3 权重与许可证的讨论](https://www.digitalapplied.com/blog/glm-5-3-weights-bespoke-license-not-mit)提醒读者，模型权重的发布方式和许可证条款并不是一回事。即使文件可以下载，企业仍然要回答几个问题：能否商业使用，能否让云服务商托管，能否在目标地区运行，出了安全问题谁负责？

开放权重拆掉的，主要是“必须向某个 API 供应商请求推理”这扇门。它没有自动拆掉算力、运维、评估、许可证和合规的门。对一个小团队来说，自托管可能比 API 更贵；对一个有数据主权要求的组织来说，这个成本却可能是值得付的保险。

因此，开放与封闭不是一条道德光谱，更像两种不同的成本结构：封闭生态把成本集中在订阅、配额和供应商依赖上；开放生态把成本转移到硬件、人才、升级和责任上。原文提到 Nvidia 通过投入开放生态形成反作用力，[WIRED 的相关报道](https://www.wired.com/story/nvidia-investing-26-billion-open-source-models/)至少说明这场博弈不只发生在模型实验室之间，也发生在芯片、云和开发者生态之间。

我真正关心的不是哪一方最后赢，而是市场能不能始终保留一个“可以退出”的选项。开放权重的战略价值，首先不是免费，而是让谈判桌上仍然有第二把椅子。

## 我在自己的发布管线里见过同一个问题

这件事让我想到自己的双线发布流程。一篇文章发布到博客和微信，看起来只是把同一份内容换一种格式；实际却有两套不能混用的资产边界：博客使用 CDN 图片和可点击的 Markdown 链接，微信使用本地图片和可见的纯文本 URL。博客先发布，微信草稿后发布；任何一条链路失败，都应该停在自己的状态里，不能把“博客已上线”误写成“两边都完成”。

这当然不能直接类比成模型供应链，但它让我更容易理解“可迁移性”为什么不是口号。真正可迁移的不是一份文章正文，而是正文、图片、路径、引用、状态和失败出口一起被保留下来。只要其中一层被某个工具私有化，换工具就不再是换一个按钮，而是重建整条链路。

我在[《Not the Model, You're the Harness》](https://ntlx.github.io/articles/not-the-model-youre-the-harness)里写过，很多 AI 系统的价值不只在模型，而在模型周围的 harness：数据怎么进入，工具怎么调用，结果怎么被检查。现在回头看，访问权其实也是 harness 的一部分。模型可以是最亮眼的组件，但决定组织能否离开的，往往是那些不显眼的接口和记录。

这也解释了我为什么对“默认模型”保持一点警惕。不是因为默认一定不好，而是因为默认很容易让人忘记：系统还有没有第二条路？

## 给模型采购做一张访问卡

真要为一个重要工作选择模型，我不会只做一张价格和效果对比表，还会给每个候选供应商附一张“访问卡”：

1. **谁能用**：是否需要特定伙伴资格、企业等级或人工审批？
2. **在哪里用**：地区、国籍、数据驻留和出口规则会不会改变可用性？
3. **用到多大**：从试验扩大到生产后，配额、许可和安全审查是否会改变？
4. **怎么迁移**：提示词、工具、评估集、数据格式和日志能否带走？
5. **谁来审计**：关键输出和外部动作是否留下足够证据，出了问题能否回放？
6. **怎么退出**：供应商涨价、限流、停服或改政策时，多久能切到备选方案？

这六问不会阻止企业使用封闭生态，反而能帮助企业更诚实地计算它买到的东西：你买到的可能不只是模型调用，也包括整合深度、数据边界和责任承诺；同时，你也可能交出了迁移自由。

我猜，接下来企业的模型评估表里，“效果”和“单价”仍然会在最上面，但“区域可用性、撤销条件、审计能力和退出时间”会逐渐从法务附录移动到采购主表。因为当模型成为工作流的一部分，真正的基础设施能力不再只是把事情做出来，而是规则改变时仍然能把事情接着做下去。

读完这篇文章后，我最后留下的不是“要不要选开放模型”，而是一个更实际的问题：**如果明天最强的模型不再向你开放，你的系统还能运行多久？**

## 参考资料

- [The Price of Entry to the Frontier — Tomasz Tunguz](https://tomtunguz.com/the-great-segmentation)
- [Salesforce and Anthropic Announce Claudeforce](https://www.salesforce.com/news/press-releases/2026/08/26/salesforce-and-anthropic-announce-claudeforce/)
- [Statement on the US government directive to suspend access to Fable 5 and Mythos 5 — Anthropic](https://www.anthropic.com/news/fable-mythos-access)
- [Previewing GPT-5.6 Sol — OpenAI](https://openai.com/index/previewing-gpt-5-6-sol/)
- [GLM-5.3's Weights Are Out. The Licence Is Not MIT](https://www.digitalapplied.com/blog/glm-5-3-weights-bespoke-license-not-mit)
- [Z.ai GLM weights license — The New Stack（本次抓取未能打开）](https://thenewstack.io/zai-glm-weights-license/)
- [Nvidia Will Spend $26 Billion to Build Open-Weight AI Models, Filings Show — WIRED](https://www.wired.com/story/nvidia-investing-26-billion-open-source-models/)

## 延伸阅读

- [模型选型只是虚晃一枪：读 OpenRouter 的大模型供应商性能评估与动态路由指南](https://ntlx.github.io/articles/evaluating-llm-provider-performance-routing)
- [Not the Model, You're the Harness](https://ntlx.github.io/articles/not-the-model-youre-the-harness)
