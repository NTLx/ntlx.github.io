---
$schema: starlight
title: 生物安全的防线，分布在模型、合成与实验室之间
description: 模型写出序列之后，生物安全才进入更难的部分：验证功能、控制合成，并准备好响应。
date: 2026-09-24
category: security
primarySourceUrls: ["https://www.latent.space/p/bio-security-is-an-ai-arms-race-eric?showTranscript=true"]
---

听到 Eric Nguyen 把生物安全称为 AI 军备竞赛，我脑中先展开的是一条很长的路径：序列被提出，功能被验证，再经过合成、使用和现实响应。走到哪一步，证据和责任都不一样。

访谈来回讨论两件事：基因组模型越来越能处理和生成长序列；同一类能力能否帮助防护跟上。主持人追问的则是这条路径上最容易被跳过的一段：模型给出的序列，离某种生物功能、再离现实危害还有多远？我读完后的判断是，“军备竞赛”可以提醒我们重视防守速度，文章里的证据却需要分层读。

![生物安全的证据层级与分布式防护责任信息图](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-24-biosecurity-ai-arms-race-00-infographic-core-summary.png)

## 模型给出候选，功能还要经过实验

访谈前半段谈到长上下文。基因组模型需要把较长的序列放在一起处理，才能尝试识别更远处的关系。Eric 提到与 Evo 相关的 StripedHyena 架构；官方代码库也把 Evo 描述为面向长上下文的基因组模型。原文附的基因组大小图把输入尺度摆在眼前：不同生物的基因组长度差异很大。图展示的是长度，不能单独说明序列功能或风险。

![不同生物类群的基因组大小对比图](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-24-biosecurity-ai-arms-race-source-genome-size.png)

*图：原文中的基因组大小对比图，改编自 Wikipedia: Genome size。它展示长度尺度，不代表功能或风险。*

访谈里的 RNA aptamer 例子更能说明模型能力与实验功能之间的距离。受访者描述了一种测试：先向模型展示分数逐步变高的序列，再看它能不能沿着趋势给出更高分的候选。他说模型复现了未展示给它的一些高分结果；同一段话里，他也说明湿实验仍在验证。这是一条模型在给定评分信号上外推的线索，实验结果还没有跟上。

这让我想到昨天在[《ERA 会搜索解法，科研者还要判断它有没有答对问题》](https://ntlx.github.io/articles/era-search-scientific-judgment)里留意的一点：程序能搜索出高分候选，研究者还要判断指标和结果能否代表科学问题。这里的差别更直观，序列分数不能代替真实生物系统里的功能验证。我把生成能力看作值得认真管理的能力信号，危险程度仍要看它在具体实验与使用环境中能做到什么。

## 噬菌体研究把实验边界说得很清楚

原文链接的噬菌体研究已经从预印本发展为正式发表于《Science》的论文。研究以 ΦX174 为模板设计完整噬菌体基因组；论文摘要报告，实验测试得到 16 种在实验室条件下有不同适应度的噬菌体。Arc Institute 的作者说明称，这些功能噬菌体的宿主范围受限于大肠杆菌 C 株及相关的 W 株。

这件事足以说明，基因组语言模型设计的序列可以在特定噬菌体系统里走到实验功能这一步。它也给“AI 从头造病毒”这类说法划出了边界：这项研究讨论的是噬菌体及其选定宿主，不能据此写成 AI 已经设计出可感染人的病毒。论文摘要提到的也是实验室适应度和噬菌体鸡尾酒的研究方向，不是人体疗效结论。

![Latent Space 原文引用的噬菌体研究预印本首页](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-24-biosecurity-ai-arms-race-source-phage-preprint.png)

*图：原文引用的 BioRxiv 预印本截图；相关研究后来正式发表于《Science》。*

保留这张原图，可以让读者看见访谈当时引用的版本。安全边界仍要结合研究里的宿主、实验条件和作者报告来理解；一张截图本身不能替代独立评估。

## 订单筛查能补强一道关口

访谈把防护讲成一项长期工作，涉及监测、判断序列风险，以及发现问题后的应对。一个更具体的例子来自 2025 年发表于《Science》的核酸筛查研究。研究团队报告，开放式蛋白设计工具能够生成当时合成供应商筛查系统无法可靠识别的变体；团队随后开发并部署了补丁，提高了对某些更可能保留原功能的序列的检出。

研究结果说明，当时的筛查存在盲点，协作测试帮助团队找到并修补了其中一类。筛查可以测，也可以改；补丁之后还需要新的测试。论文针对的是特定工具和研究，不能外推成所有供应商都失效，或风险已经消失。

我更愿意把防线画成多处相接的责任：模型提供方决定哪些能力如何开放，合成服务检查订单和客户，实验室遵循生物安全要求，公共卫生机构负责监测与响应。这些环节各自能做什么，需要有明确责任人，也需要能被外部测试的证据。把防守能力寄托在另一支更聪明的模型上，容易漏掉真正执行这些规则的组织和流程。

## “军备竞赛”需要落到谁负责、怎样检验

主持人在访谈后段问到，软件漏洞能打补丁，生物体却不能按软件的方式更新。这个追问把类比拉回现实：软件安全可以围绕版本和漏洞响应来衡量；生物风险要进一步说明实验对象、传播条件、监测能力和应对资源。两边都需要防守，检验方法却不能直接照搬。

![软件补丁流程与生物风险评估因素的对照图](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-24-biosecurity-ai-arms-race-01-comparison-patch-response.png)

我愿意保留“军备竞赛”这个提醒，也想把评估拉回几个具体问题：一项能力有没有在受控环境中验证？筛查是否接受过独立红队测试？发现漏洞后，哪些机构负责更新防线和共享信息？失败时谁来响应？模型分数能提供一部分信息，实验条件、筛查覆盖和响应机制也要能被检视。

我会把注意力放回这些责任上：谁决定模型开放范围，谁复核合成订单，谁在实验中报告偏差，谁来监测和响应。每一段都需要自己的测试和负责人。没有这些细节，“军备竞赛”只会留下紧张感，读者仍看不清防护走到了哪一步。

## 参考资料

- [Latent Space：Bio-security is an AI Arms Race - Eric Nguyen](https://www.latent.space/p/bio-security-is-an-ai-arms-race-eric?showTranscript=true)
- King 等：《Generative design of bacteriophages with genome language models》，《Science》： [DOI](https://doi.org/10.1126/science.aec2657) / [PubMed 摘要](https://pubmed.ncbi.nlm.nih.gov/42561074/)
- [Arc Institute：How We Built the First AI-Generated Genomes](https://arcinstitute.org/news/hie-king-first-synthetic-phage)
- Wittmann 等：《Strengthening nucleic acid biosecurity screening against generative protein design tools》，《Science》： [DOI](https://doi.org/10.1126/science.adu8578) / [PubMed 摘要](https://pubmed.ncbi.nlm.nih.gov/41037625/)
- [Microsoft Research：Paraphrase Project](https://www.microsoft.com/en-us/research/project/paraphrase-project/)
- [Together Computer：StripedHyena 官方代码库](https://github.com/togethercomputer/stripedhyena)
- [Wikipedia：Genome size（原文第二张图的改编来源）](https://en.wikipedia.org/wiki/Genome_size)
