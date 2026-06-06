---
$schema: starlight
title: AI 的迷你钢厂时刻
description: "Nucor 的迷你钢厂没有在技术上打败整合巨头——它让后者\"理性地\"放弃了低端市场，直到无路可退。本地 AI 正在对云计算做同样的事：78% 的任务已经不需要数据中心了，而云厂商正在心甘情愿地放弃它们。"
date: 2026-06-06
category: ai-industry
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-06-ai-minimill-moment-img-00-infographic-core-summary.png)

Tomasz Tunguz 上周发了篇短文，三百字不到，但扔了一个类比，值得认真想想。

他在 Mac 上跑本地模型，处理日程安排、邮件分类、CRM 更新、研究搜索——78% 的 AI 任务，峰值到过 88%。剩下的 22% 才发给云端。结果呢？吞吐量涨了 25%，任务时长从 47 秒掉到 19 秒，队列等待从 73 秒缩到 4 秒。

然后他抛出了那个类比：*这是 AI 的迷你钢厂*。

Nucor 的迷你钢厂是 Christensen 在《创新者的窘境》里最干净的例子。1960 年代，迷你钢厂用电弧炉熔化废钢，成本比整合型钢厂的高炉低 20%。但一开始只能做最低端的钢筋——毛利率 7%，整合型钢厂看都不看一眼。他们很乐意把这块业务让出去，把产能转向高利润的结构钢、钢板。

迷你钢厂拿了钢筋生意，赚了钱，改良了技术，开始往上爬。结构钢。钢板。每一步，整合型钢厂都算过账：放弃这块低端业务，把资源集中到更高端的产品上，*更划算*。直到有一天，没有低端可以放弃了——客户全跑了。

Bethlehem Steel、LTV、National——全破产了。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-06-ai-minimill-moment-img-01-minimill_disruption.png)

## 被颠覆者不是看不见，是算得过账

这个类比的力量不在"本地比云端便宜"——便宜只是切入点。力量在*颠覆的结构*。

本地 AI 现在能做什么？日程分类、邮件摘要、简单的信息检索。这些任务对云厂商来说利润率不高。它们真正赚钱的是大型推理、多模态理解、Agent 编排——那些需要 H100 集群的任务。

所以云厂商会怎么做？跟整合型钢厂一模一样：*主动放弃低端*。他们会说"本地模型适合简单任务，复杂任务还是需要云端"，然后愉快地把 78% 的调用量让出去，集中火力做那 22% 的高利润业务。

这不是猜测。Qualcomm 已经在推"Computing Continuum"，Intel 在 Computex 上 demo 了混合推理——本地模型识别敏感数据留在设备上，非敏感的发云端。NVIDIA 也在讲类似的混合 AI 故事。三家卖芯片的，不约而同在论证同一件事：AI 不会全跑在云端。

他们不是在预言未来——他们在*定义对自己有利的未来*。高通卖端侧芯片，Intel 卖客户端 CPU，NVIDIA 卖数据中心 GPU。每个人都在画一个"最有自己饭吃"的版图。但恰好，三家画的版图都指向同一个方向：云端只做最硬的那部分。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-06-ai-minimill-moment-img-02-hardware_timeline.png)

## 硬件底子：为什么是 2026

类比要成立，得看硬件是不是真的追上了。

Apple Silicon 的统一内存架构（UMA）是这件事的物理基础。传统 PC 上，CPU 和 GPU 各有各的显存，模型权重得通过 PCIe 总线搬来搬去。Apple 把 CPU、GPU、Neural Engine 焊在同一块芯片上，共享同一池内存。没有搬运这一步。

这意味着什么？一台 64GB 统一内存的 M1 Max 跑 Qwen 3.6 35B MoE 模型，8-bit 量化，在 fp16 优化后能到 26 tok/s。不是快——是可用了。三年前要跑这个级别的模型，你得租一台带 A100 的云服务器。

Mac mini 已经因为这个被抢空了。预订排到 4-5 个月后，Mac Studio 排到 4 个月——这是 Studio 自 2022 年发布以来最长的交付周期。OpenClaw、Perplexity Personal Computer、Hermes Agent，都在把 Mac mini 当"永远在线 AI agent"的理想硬件来推。

时间点也对得上。Apple 的 Neural Engine 从 2017 年 A11 Bionic 就内置了，比"AI PC"这个趋势词早了七年。下周一 WWDC 2026，Apple 要把端侧 AI 作为核心叙事。不是 pivot——是一笔投了七年的复利，开始收账了。

## 迷你钢厂不会消灭云端，但会吃掉大多数

别误会。我不是在说本地 AI 会取代云端。

训练大模型、多租户推理、高吞吐批处理——这些活还得云来做。就像迷你钢厂从来没碰过特种合金，那需要完全不同的高炉。云端 AI 的"钢板"——大型推理、多模态融合、复杂的 Agent 协作——本地模型短期内碰不到。

但问题不在这里。问题是：*大多数任务不需要那份算力*。

Tunguz 的数据已经说明白了：78% 的任务，本地就能干。而且干得更快——没有网络延迟，没有 API 排队，没有 token 计费。每台有足够内存跑蒸馏模型的笔记本电脑，都成了自己的迷你钢厂。

这个趋势才刚开始。当蒸馏技术让 7B 模型在特定任务上接近 70B 的表现，当 MLX 框架让 iPhone 和 Mac 跑同一套模型代码，当每家芯片厂商都在为"混合 AI"画版图——"本地做大多数，云端做少数"就不再是 Tunguz 一个人的工作流，而是整个行业的默认架构。

到那时候，回头看今天云厂商的巨额 capex，可能会觉得像 1970 年的 Bethlehem Steel 在扩建高炉——不算错，只是在一个正在被颠覆的轨道上加速。

*你的工作流里，有多少比例已经可以交给本地模型了？*

## 原文参考

> Tomasz Tunguz, "The Minimill of AI", 2026-06-05
> <https://tomtunguz.com/using-local-ai-to-work-faster>
