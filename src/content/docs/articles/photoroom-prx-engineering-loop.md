---
$schema: starlight
title: PRX 四篇读完：训练图像模型，真正难的是闭环
description: PRX 的价值不在某个指标，而在它把架构、训练、预算和数据放回同一条可回滚的工程闭环里。
date: 2026-07-07
category: ai-models
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-07-photoroom-prx-engineering-loop-img-00-infographic-core-summary-1.png)

我读完 Photoroom 在 Hugging Face 上连发的 PRX 四篇文章，最强的感觉不是“他们又开源了一个 text-to-image 模型”。更准确地说，是他们把训练图像模型这件事，从神秘炼丹拉回了工程。

这四篇的顺序很规整：[架构](https://huggingface.co/blog/Photoroom/prx-part1-architectures)、[训练](https://huggingface.co/blog/Photoroom/prx-part2)、[24 小时工程 recipe](https://huggingface.co/blog/Photoroom/prx-part3)、[数据策略](https://huggingface.co/blog/Photoroom/prx-part4-data)。但我不想把它们读成四篇摘要。更值得看的，是它们之间互相回打的关系。

架构不是开头，数据也不是结尾。架构决定训练成本，训练暴露哪些技巧在什么阶段有效，24 小时 speedrun 把这些技巧放进预算压力里验一遍，数据系统再反过来决定下一轮实验能不能快、能不能查、能不能回滚。

这就是 PRX 目前最有价值的地方：模型权重之外，选择过程也被摊开了。

## Photoroom 的约束来自产品线

先把背景摆正。Photoroom 不是一家只为论文榜单存在的实验室。它的主业是电商视觉生产：商品图、批量编辑、品牌一致性、API、企业定制模型。这个出身会改变你理解 PRX 的方式。

如果目标只是做漂亮样图，很多工程选择可以更激进。但如果目标是给电商视觉生产线服务，模型就不能只在 demo prompt 上好看。它要可控、可复现、能批量跑、能接产品，还要能解释为什么今天这批图变差了。

所以 PRX 系列里很多选择看起来不浪漫，却很硬：减少文本路径重复计算，盯 throughput 和显存，记录 BF16 存权重这种低级但致命的坑，承认短 prompt 下会 distortion，也承认当前社区讨论还很薄。

这反而让我更信它。一个团队愿意公开“我们在哪些地方没赢”，比单纯放几张漂亮样图更有信息量。

## 架构的漂亮之处，是少做

PRX 的架构文章里，最有意思的不是它又发明了多复杂的 block，而是它在主动少做。

MMDiT 这类架构会让文本 token 和图像 token 在 transformer 里更充分地一起更新。PRX 的判断更克制：文本是条件，图像才是主路径。它输入文本 token 和图像 token，但只输出图像 token；文本 token 不随扩散 timestep 一路更新，推理时还可以缓存 text projection。

换句话说，prompt 像任务单。任务单读清楚之后，真正需要反复加工的是图像草稿。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-07-photoroom-prx-engineering-loop-img-01-architecture_compute_path-1.png)

这个设计不只是“省算力”。它也在提前规定后面的训练解空间：如果文本路径更静态，计算就能更多花在图像 token 上；如果图像路径更清楚，后面讨论 TREAD、pixel-space、patch bottleneck 才有落点。

Part 1 的小规模 benchmark 也很诚实。PRX 1.2B 在 256px 设定下拿到 FID 13.16、throughput 1059.9、memory 23.8；对比 MMDiT 3.1B 的 throughput 761.3、memory 54.3，它没有摆出“我最大最强”的姿态。它说的是另一件事：质量、速度、显存三者之间，这个点更适合继续训练。

我之前写过一篇《[3B 模型跑出了 1929：那不是聪明，是约束](https://ntlx.github.io/articles/small-models-as-design)》。读 PRX 时同一个判断又出现了：能力不是凭空长出来的，很多时候是约束设计出来的。PRX 的架构选择，就是在用结构约束计算流向。

## 训练技巧不是偏方，是阶段性开关

第二篇 ablation 文章如果只看结论，会像一张技巧清单：REPA、DINOv3、Flux2-AE、x-prediction、TREAD、long captions、Muon、SFT。

但真正的信息不在“哪个 trick 有用”，而在“它什么时候有用，什么时候该撤”。

REPA 是最好的例子。它让 denoiser 早期对齐成熟视觉模型的表示，确实能加速学习；DINOv3 版本还把 FID 从 baseline 的 18.20 拉到 14.64。但 Part 3 进入 1024px 阶段时，Photoroom 选择关掉 REPA。原因也很工程：它是脚手架，不是房子。早期帮你立起来，后期继续绑着反而可能限制细节。

TREAD 也一样。低分辨率时它只是小优化；到了 1024px，token 数压上来，它才变成主杠杆。Part 2 里 TREAD 在 1024px 把 FID 从 17.42 降到 14.10，同时 batches/sec 从 1.33 提到 1.64。这个数字的意义不是“TREAD 永远好”，而是“token routing 的价值随分辨率约束被放大”。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-07-photoroom-prx-engineering-loop-img-02-training_stage_switches-1.png)

最反直觉的是 caption。短 caption 看起来更接近用户真实输入，但训练时反而伤害巨大：Part 2 里短 caption 让 FID 从 18.20 变成 36.84，CMMD 从 0.41 变成 0.98。长 caption 的价值不是啰嗦，而是把图里的桌面、光线、文字、广告、logo、瑕疵都显式写出来，让模型少猜一点。

这让我想到 agent 里的 harness 问题。我在《[你不是模型，你就是 Harness](https://ntlx.github.io/articles/agent-harness-glossary)》里写过：模型只是系统的一部分，外层 scaffold、工具、反馈循环决定了能力怎么落地。PRX 的训练也是这样。模型权重不是孤立物，它被 caption、loss、token routing、optimizer、数据采样这些外层结构塑形。

成熟的训练系统要知道很多技巧，更要知道每个技巧什么时候上场，什么时候退场。

## 24 小时 speedrun 不是炫技，是压力测试

第三篇标题很容易被误读：Training a Text-to-Image Model in 24h。看上去像炫技，像在说“看，我们一天能训出模型”。

但我觉得它更像压力测试。

他们给自己设了很硬的边界：32 张 H200，约 1500 美元算力预算。然后把第二篇里筛出来的东西拼成 recipe：x-prediction、pixel-space training、不用 VAE、512px 先训、再 fine-tune 到 1024px、LPIPS 和 DINO perceptual loss、TREAD 50% token routing、REPA + DINOv3、Muon 只管 2D parameters。

这不像论文式“提出一个模块”。它更像工程式“在预算里把系统跑通”。

结果也没有被包装成奇迹。模型能用，但还有纹理、解剖、难 prompt 问题。结合 Hugging Face discussion 里的反馈，短 prompt 下的 limb、outline、face distortion 仍然存在；官方回复也把问题归因到 prompt 太短和 preview undertrained。

这点很重要。PRX 系列到这里仍然没有资格被写成“行业已经验证的新答案”。过去 30 天的外部讨论也不大，主要是 Reddit、Hugging Face discussion 和 GitHub 上少量 early adopter 反馈。X/Twitter 我这次没有覆盖到，所以也不能假装看到完整舆论。

但这不削弱它的价值。PRX 的价值不是“社区已经沸腾”，而是“材料足够厚”。它让外部读者看到一个团队如何在约束下取舍，而不是只看到最后一组 cherry-picked samples。

## 数据篇才是控制面

四篇里，我最喜欢的是 Part 4。因为它表面讲后勤，实际讲控制面。

数据不是一堆等着喂模型的库存。对训练系统来说，它更像操作系统里的文件系统、索引和回滚机制。你能不能搜索，能不能过滤，能不能临时跳过，能不能重 caption，能不能在不重写全量 shard 的情况下做 ablation，决定了研究速度。

Photoroom 的做法很清楚：Lance 用来构建、探索、feature engineering；MDS 用来训练时 streaming。Lance 适合 predicate pushdown、scalar index、vector search 和快速浏览；MDS 适合稳定喂训练。一个是工作台，一个是传送带。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-07-photoroom-prx-engineering-loop-img-03-data_control_plane-1.jpg)

这里有几个细节特别工程。

第一，text latents 不再全部预计算。切到 Qwen3-VL 后，他们选择训练时现算。对 7B denoiser 来说，text encoder 只带来 3-4% throughput cost，却换来一个很大的灵活性：换 captioner、换 prompt 模板、换 encoder 时，不用重写大量 MDS shards。

第二，JPEG quality 92 足够好。PNG 更干净，但体积大 3-10 倍，训练收益却很小。这个判断很不“洁癖”，但很工程。不是最干净的格式赢，是总系统成本下最合适的点赢。

第三，skip-list 是小设计，大价值。过滤 NSFW、处理用户 opt-out、做数据 ablation，都不必重写全量 MDS。只要在读取时跳过某些样本。这个机制听起来朴素，却是可回滚系统的关键。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-07-photoroom-prx-engineering-loop-img-04-rollback_data_loop-1.jpg)

读到这里，前面三篇才真正合上。没有这套数据控制面，24 小时 speedrun 就只是一次表演；有了 Lance、MDS、caption、bucket、skip-list、dedup，它才变成可重复迭代的研发系统。

## 我对 PRX 的判断

所以这四篇读下来，我的判断很简单：

PRX 系列的意义，不在于它在某个单点指标上终结了谁。它更像一份开放训练日志，告诉你今天从零训练一个 T2I 模型，难点已经不只是知道某个 trick，而是把架构、训练、预算和数据放进同一个反馈回路里。

它也有边界。PRX/PRX Pixel 仍然有 undertraining 和短 prompt 问题；社区验证还早；数据伦理、版权治理、来源授权不是这四篇展开的重点；Photoroom 的结论也来自电商视觉场景，不能直接搬成所有图像模型项目的通用定律。

但这恰恰是它值得读的地方。它没有把复杂性抹掉，而是把复杂性按层摊开。

架构层问：哪些计算该少做？

训练层问：哪些技巧只是一段时间的脚手架？

工程层问：在预算压力下 recipe 是否还能跑？

数据层问：失败后能不能查、能不能改、能不能回滚？

这四个问题，比“PRX 生成图好不好看”更重要。

如果后续 Photoroom 继续写 scaling、preference alignment、editing、product integration，我会更想看它们怎么处理两件事：一是如何把长 caption 训练出来的模型重新调回用户短 prompt 的习惯；二是如何把数据治理讲到和数据工程同样细。

*你读一个开源模型项目时，更在意最终权重和样图，还是更在意它有没有公开这套可复验、可回滚的训练过程？*

## 延伸阅读

* [3B 模型跑出了 1929：那不是聪明，是约束](https://ntlx.github.io/articles/small-models-as-design)
* [你不是模型，你就是 Harness](https://ntlx.github.io/articles/agent-harness-glossary)
* [AI 重新学会用眼睛读字](https://ntlx.github.io/articles/visual-understanding-ai-reading)
* [AI 的期末考试：OpenAI 用 750 道真题考出了什么](https://ntlx.github.io/articles/ai-exam-lifescibench)

## 参考资料

* [Text-to-image Architectural Experiments](https://huggingface.co/blog/Photoroom/prx-part1-architectures)
* [Training Design for Text-to-Image Models: Lessons from Ablations](https://huggingface.co/blog/Photoroom/prx-part2)
* [PRX Part 3 - Training a Text-to-Image Model in 24h!](https://huggingface.co/blog/Photoroom/prx-part3)
* [PRX Part 4: Our Data Strategy](https://huggingface.co/blog/Photoroom/prx-part4-data)
* [Photoroom announces its open-source Text-to-Image initiative](https://www.photoroom.com/inside-photoroom/open-source-t2i-announcement)
* [PRX open-source T2I model launch post](https://huggingface.co/blog/Photoroom/prx-open-source-t2i-model)
* [Photoroom/PRX GitHub repository](https://github.com/Photoroom/PRX)
* [PRX 1024 beta model card](https://huggingface.co/Photoroom/prx-1024-t2i-beta)
* [PRXPixel model card](https://huggingface.co/Photoroom/prxpixel-t2i)
* [Diffusers PRX pipeline documentation](https://huggingface.co/docs/diffusers/main/en/api/pipelines/prx)
* [Photoroom About](https://www.photoroom.com/about)
* [Photoroom homepage](https://www.photoroom.com/)
* [Reddit discussion: PRX Pixel - A 7b pixel-space image model](https://www.reddit.com/r/StableDiffusion/comments/1u4hxjh/)
* [Reddit discussion: New 7b Photo-realistic model PRX Pixel](https://www.reddit.com/r/comfyui/comments/1u4i3ju/)
