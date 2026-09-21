---
$schema: starlight
title: Jalapeño 的九个月，说明造芯的下一场竞争是反馈回路
description: Jalapeño 把表示、工具、验证与实测接成更短的反馈回路，LLM 负责扩大探索，工程师负责目标、边界与最后的判断。
date: 2026-09-21
category: ai-industry
primarySourceUrls: ["https://spectrum.ieee.org/llms-for-chip-design"]
---

我读完 [IEEE Spectrum 对 OpenAI Jalapeño 的报道](https://spectrum.ieee.org/llms-for-chip-design) 后，第一反应是被“九个月”绊了一下：从第一版 RTL 到 tape-out，竟然只隔了九个月。

这个数字足以让人把文章读成一则“LLM 开始造芯”的新闻。再把报道、[OpenAI 的官方说明](https://openai.com/index/jalapeno-first-results/)和 [XLS 的技术文档](https://google.github.io/xls/)放在一起看，我更在意模型写了多少代码之前的那个问题：一个芯片项目怎样获得这么短的反馈回路。

我从 Jalapeño 看到的是一个工程系统：人定义目标，模型探索实现，工具链把实现变成可以综合和验证的东西，真实负载再把结果送回下一轮优化。LLM 加速了回路里的探索和迭代；回路本身，仍然需要工程师搭起来。

![Jalapeño 的芯片设计反馈回路信息图](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-21-llms-jalapeno-chip-design-img-00-infographic-core-summary.png)

## 九个月后面站着一整套工程系统

IEEE Spectrum 给出的时间线有两个尺度：从第一架构概念到第一块硅片不到 20 个月，从第一版 RTL 到 tape-out 九个月。报道还说，参与 Jalapeño 的 OpenAI 团队平均少于 100 人；Broadcom 负责从门级开始的物理设计，OpenAI 则负责包括推理加速器、内存层次和网络在内的端到端系统设计。

![OpenAI Jalapeño 芯片主图；来源 IEEE Spectrum；图片署名 OpenAI](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-21-llms-jalapeno-chip-design-img-source-jalapeno-chip-feature.jpg)

这几条信息放在一起，结论就和“一个模型在几个月内造出芯片”很不一样了。它描述的是一个边界清楚的协作系统：OpenAI 把工作负载、架构和软件放在一起，Broadcom 把实现与生产经验接进来，内部模型则进入一部分可以反复试错的设计环节。

九个月首先是组织和工具链的成绩，其次才是模型能力的成绩。把 Broadcom、专用模型、成熟的 EDA 流程和已有的工程团队都拿掉，只留下一个能读写 Verilog 的 Agent，很难复现这个结果。这句话只是在给“加速”标明成立条件。

Richard Ho 在报道里说，工程师仍然是发生什么的“最终裁决者”。我认为这句话比“模型给工程师带来超能力”更重要：模型可以扩大尝试的数量，但它没有因此获得对目标、基线和风险的最终解释权。

## LLM 参与造芯的入口，是中间层

Jalapeño 前端工作流里有一个选择，是围绕 Google 开源的 XLS 建立。XLS 是高层综合工具链，可以从更高层的功能描述生成可综合的 Verilog 和 SystemVerilog；它还允许同一份设计在主机软件或模拟器中运行，再继续生成硬件输出。

这让一部分硬件设计变得更像软件工程。工程师可以用 DSLX 或 C++ 描述功能，工具链负责把它降到硬件描述语言；模型面对的是结构清晰、可读、可修改、可测试的代码，而不是一块无法直接反馈的硅片。

我不会把“更像软件”理解成芯片设计被软件化了。它更像是给模型划出了一块合适的工作台：模型在工作台上提出实现，编译器、综合器和验证工具负责把自然语言式的可能性筛成硬件世界允许的结果。判断一段 Verilog 是否有用，不能只看它能不能生成；还要看它能不能进入一条会拒绝错误、测量代价、保留证据的工具链。

这也是为什么 XLS 的状态很值得注意。官方文档明确把它标为 experimental，并提醒它仍在快速变化。它已经足以成为 Jalapeño 这类工作流的中间层，却还不能被宣传成一条对所有团队都稳定可复制的“芯片编译器”。中间层有用，不等于中间层已经成熟。

## 设计循环一旦连上，芯片就变成可持续优化的对象

传统的芯片叙事容易把流片当作终点：设计完成，送厂，等第一块硅片回来，再交给软件团队处理。Jalapeño 的报道让我看到另一种组织方式：第一批芯片回来以后，内部 AI 模型继续参与编写和优化运行基准的软件。芯片随后进入下一轮测量和改进。

![Jalapeño is designed for deployment in pods that include 2,048 chips. 来源 IEEE Spectrum；图片署名 OpenAI](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-21-llms-jalapeno-chip-design-img-source-jalapeno-server-rack.jpg)

OpenAI 官方称，Jalapeño 在三个公开模型上的测试结果，相对对照系统有约 1.5–1.9 倍的峰值每瓦 AI 工作量，以及约 1.7–3.6 倍的端到端延迟改善。这些是 OpenAI 自己在 InferenceX 上报告的结果，不能直接当作独立实验室的结论；但它们至少说明了 OpenAI 选择的评价单位：不只看芯片峰值算力，还看一次真实请求用了多少电、等了多久。

这里有一条我很熟悉的系统设计线索。此前我在[推测解码如何利用内存带宽留下的空档](https://ntlx.github.io/articles/speculative-decoding-llm-speed)的文章里写过，推理加速有时靠的是让一次读取、一次验证产生更多有效工作。Jalapeño 把类似的思路推到了更大的尺度：硬件表示、内存、网络和软件调优，都在争取让下一次反馈更快返回。

这比“AI 让芯片更快”具体得多。被压缩的是等待：等待综合结果、等待验证完成、等待第一块硅片、等待软件找到合适的 kernel、等待基准告诉团队哪个实现值得保留。每一段等待都缩短一点，项目就获得了更多可以试错的次数。

## 后端在提醒：物理约束不会听懂自然语言

报道没有把所有环节都包装成同样的 AI 故事。Jalapeño 的 LLM 工作主要集中在前端、验证和软件优化；布线、floorplan、时钟、电源以及送厂等后端工作，仍然由 Broadcom 和物理设计工程师承担。OpenAI 会用 AI 指导一些物理优化，但受访者也承认，后端的自动化程度还没有前端高。

这和 [IEEE Spectrum 对“AI Alone Isn’t Ready for Chip Design”的讨论](https://spectrum.ieee.org/chip-design-ai)可以接起来看。floorplanning 要在大量硬约束下寻找同时满足面积、功耗、连线长度和时序的解，不是把一句话翻译成坐标。那篇文章提出把机器学习和经典搜索结合起来，别把所有组合优化问题都交给一个模型。

语言模型的优势在于生成和改写结构化符号；后端设计的难点则在于，很多局部看起来合理的选择组合起来会违反全局约束。模型可以帮助提出候选、写脚本、分析失败日志，甚至学习某些优化规律，但它仍然需要一个能快速算出代价的环境，也需要一套不会被“看起来不错”的答案欺骗的基线。

我仍然不会把 Jalapeño 简化成“LLM 已经会造芯”。前端变得更容易探索，后端的搜索空间依旧存在；设计文件通过仿真，也不等于一块芯片已经经过真实工艺、封装、功耗和规模化部署的考验。[另一篇关于 AI 生成 RISC-V CPU 的报道](https://spectrum.ieee.org/ai-chip-design)本身也明确区分了仿真设计和实际流片，这个边界不能被标题抹掉。

## 工程师的价值正在移动到回路两端

读完这篇报道，我会用四个问题判断一个“AI for EDA”案例到底有多少可迁移价值。

第一，模型工作的表示层是什么？是可综合、可测试的中间表示，还是只把一份复杂规格丢给聊天窗口？表示层越清晰，模型越容易参与；但表示层也必须保留硬件的约束，不能只追求语言上的易写。

第二，反馈多久返回？如果一个候选要等很久才能知道是否满足时序、功耗和面积目标，模型再聪明也只能把等待前的猜测做得更快。真正的工程投入，可能不是换一个更大的模型，而是把模拟、综合、检查和失败诊断做成更短的回路。

第三，目标和基线是否公平？Jalapeño 的公开性能数字来自厂商自测，InferenceX 是公开基准，但具体硬件、功耗口径、模型版本和运行配置仍然决定比较是否成立。任何“提升了多少”的句子，都应当连同负载、基线和测量方式一起出现。

第四，谁拥有最后的否决权？模型可以在可计算的搜索空间里扩大探索，但产品目标、制造风险、供应链、异常和未测量的后果，仍然需要有经验的人做判断。工程师没有离开回路，只是从每一行 RTL 的手工编写，移动到了目标定义、约束设计、证据审查和风险兜底的位置。

九个月这个数字很醒目，背后的工作方式更值得留下：把模型放到一个能理解的表示层，把候选接入一条会拒绝错误的工具链，再让真实负载把结果送回下一轮。芯片设计的下一场竞争，或许取决于谁能把这条反馈回路做得更短、更诚实，也更能承受失败。

## 参考资料

- [How OpenAI Used Its Own LLMs to Design Its Jalapeño Chip — IEEE Spectrum](https://spectrum.ieee.org/llms-for-chip-design)
- [Jalapeño’s first results show industry-leading speed and efficiency in AI inference — OpenAI](https://openai.com/index/jalapeno-first-results/)
- [XLS: Accelerated HW Synthesis](https://google.github.io/xls/)
- [InferenceX — SemiAnalysis](https://inferencex.semianalysis.com/)
- [Hot Chips 2026 官方议程与演讲入口](https://hc2026.hotchips.org/#clip=2whmy9evgf0g)
- [ChipNeMo: Domain-Adapted LLMs for Chip Design](https://arxiv.org/abs/2311.00176)
- [ChipMind: LLMs for Agile Chip Design](https://asu.elsevierpure.com/en/publications/chipmnd-llms-for-agile-chip-design/)
- [AI Alone Isn’t Ready for Chip Design](https://spectrum.ieee.org/chip-design-ai)
- [AI Agent Designs a RISC-V CPU Core From Scratch](https://spectrum.ieee.org/ai-chip-design)

## 延伸阅读

- [LLM 变快的秘密，是让大模型少做几次决定吗？](https://ntlx.github.io/articles/speculative-decoding-llm-speed)
