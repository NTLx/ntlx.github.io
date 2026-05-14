---
$schema: starlight
title: AI 写的 PR 淹没了开源，但有一帮人想出了另一种玩法
date: 2026-05-11
description: Agent 能一小时写十个 PR，但维护者要的是那一个值得读的。Hugging Face 用一份 15000 字的 Skill 教会了 AI 什么叫「不写」。
category: ai-industry
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-11-transformers-to-mlx-img-00.jpg)

前两天在 Hacker News 上刷到 Hugging Face 的一篇博客，标题叫 *The PR you would have opened yourself*。看完之后愣了几秒——不是被技术细节震到，是被一个事实击中了：我每天用 Claude Code 写代码，自以为效率拉满，但从没想过一件事——我写的代码，别人读得下去吗？

## 10 亿程序员的代价

黄仁勋有句话传播很广：「我们瞬间从 3000 万程序员变成 10 亿程序员。」听着挺振奋的，对吧？AI 让人人都能写代码了。

![AI 生成的代码洪流淹没了开源维护者](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-11-transformers-to-mlx-img-01.jpg)

但另一面的数据就不那么好看了。cURL 的维护者 Daniel Stenberg，跑了六年的漏洞悬赏计划，自掏腰包付了 8.6 万美元，2026 年 1 月正式关闭。原因？16 小时内收到 7 份 AI 生成的漏洞报告，全部是垃圾。此前他从 2024 年初就开始抱怨这事——到 2025 年中，悬赏计划里 20% 的提交是 AI slop，真正发现漏洞的比例跌到 5%。加了强制披露勾选框？没用。

Ghostty 的 Mitchell Hashimoto 更直接：永久封禁 AI 生成的劣质代码。他特别澄清了一句——Ghostty 本身就是 AI 辅助编写的，维护者也天天用 AI。「我们要的是高质量贡献，不管怎么写出来的。」

Linux 内核也在 2026 年 4 月正式发布了 AI 生成代码使用准则：可以用，但锅必须人背。必须标注 Assisted-by，责任全在提交者。

这三件事指向同一个问题：AI 把开源贡献的门槛打下来了，但维护者的审查带宽没有跟着涨。PR 量暴增十倍，审查的人还是那几个。

## 不是代码的问题，是「理解」的问题

我在自己的 Mac 上用 MLX 跑模型有段时间了。从最早的 llama 到后来的 Qwen、Mistral， mlx-lm 的模型基本都是从 transformers 移植过来的。MLX 是 2023 年 12 月苹果开源的机器学习框架，专为 Apple Silicon 的统一内存架构设计，CPU 和 GPU 共享同一块物理内存，数据不用来回搬。Ollama 三月底全面接入 MLX 之后，prefill 速度提升 57%，生成速度接近翻倍。一个开发者在社区里说他的 Mac「解码速度提升了 93%」。

但移植这件事，从来不是「把 PyTorch 权重转成 MLX 格式」这么简单。RoPE 配置差一点，短文本看着没问题，长序列就崩了——原文里有一张 "It's always RoPE" 的 meme 图，踩过这坑的人都会心一笑。float32 精度污染，不会报错，但推理速度悄悄慢一半。这些坑，踩过才知道。mlx-vlm 的维护者 Prince Canuma 一直在做这件事——把视觉语言模型移植到 MLX，DeepSeek-OCR 的 MLX 支持就是他搞定的。这种工作需要的不是写代码的速度，是对两个框架的理解。

Hugging Face 的文章点出了一个关键：transformers 库的代码，*是人与人之间的沟通方式*。模型文件从上到下可读，不搞复杂抽象，扁平层级——这不是技术选择，是设计哲学。它已经成了模型定义的「事实来源」，下游框架都等它实现好了再移植。

Agent 不懂这个。它看到代码能跑，就觉得没问题。它不知道 transformers 的设计哲学是「代码即文档」，不知道 mlx-lm 的惯例是自包含模型文件，不知道审查者最烦看到的是「不必要的注释」和「投机性的抽象」。它会按照「最佳实践」把代码改得面目全非，然后自信满满地提交 PR。

![Agent 机械地写代码 vs 人理解代码库](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-11-transformers-to-mlx-img-02.jpg)

*Agent 不缺写代码的能力，缺的是理解代码库的能力。*

## 一份 15000 字的「不」字诀

Hugging Face 做了一件事：他们写了一份 Skill——不是给 Agent 的指令，是给 Agent 的「家教」。

Skill 这个东西，说白了就是 Agent 的配方文件。Claude Code 的用户应该不陌生：你把一套复杂的流程写成 Skill，Agent 每次执行都走同一条路，不会因为不同的 prompt 跑偏。

这份 Skill 包含近 15000 字。我读了一遍，发现大部分内容不是在教 Agent「怎么写」，而是在教它「怎么不写」。

不要改共享工具——除非维护者明确同意。不要加注释解释代码——审查者要同时读注释和代码，更累。不要提重构——没有被要求的改进就是添乱。不要过早抽象——自包含的模型文件比精巧的继承结构好维护。不要接受任何想法——维护者会 push back，你也要学会 push back。

![Skill 作为 Agent 的「家教」](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-11-transformers-to-mlx-img-03.jpg)

有意思吧？Agent 最大的问题不是不会写代码，是太听话了。你让它「改进这个函数」，它就老老实实改进，不管这个改进是不是审查者想要的。Hugging Face 的 Skill 教它的第一课是：*学会说不。*

除了约束，Skill 还教 Agent 做一些只有有经验的移植者才会做的事：检查 RoPE 配置、从 safetensors 元数据推断 dtype、对每个变体做逐层对比。这些检查，写在 Skill 里，就变成了 Agent 的「经验」。

## 审查者也是用户

原文里有个观点让我重新想了一下：Skill 不只是为贡献者设计的，也是为审查者设计的。

通常我们想 AI 辅助开发，想的是「让 AI 帮我写代码」。但 Hugging Face 想的是「让 AI 帮审查者省时间」。

Agent 辅助生成的 PR，代码风格严格遵循 mlx-lm 惯例——不是因为 Agent 自己喜欢这种风格，是因为 Skill 里明确写了。PR body 里包含模型变体的架构差异总结、生成示例、数值对比、dtype 验证、逐层对比。这些信息，人工提交的 PR 往往不全。

Skill 还加了一条硬规则：PR 必须披露是 agent 辅助的，贡献者必须审查并接受结果后才能提交。不能一键甩锅。

原文还特别警告了一件事：不要把审查者的意见直接丢回 Agent 处理。LLM 会固执己见，会在细枝末节上跑题，无法有效反驳审查者的核心关切。一旦进入审查环节，这就是人与人的对话——你得自己读代码、理解反馈、做出判断。Agent 可以帮你准备材料，但不能替你思考。

说到底，开源的瓶颈不是代码生成，是*注意力*。一个维护者花 10 分钟读一份高质量 PR，能做出有效判断。花 10 分钟读一份 AI slop，一无所获，还可能误判。Agent 能一小时写十个 PR，但维护者要的是那一个值得读的。

## 独立测试：不信任 Agent 的自我评估

文章还提到一个独立于 Agent 的测试工具（test harness）。Agent 在转换过程中会自己跑测试，但——谁来验证 Agent 的测试结果？LLM 可能幻觉，可能过于乐观。

所以他们做了一个独立工具：任何人都能下载，运行同样的测试，得到可复现的结果。所有输入输出保存为 JSON，包括逐层对比数据。测试结果按时间戳存档，summary 报告、每个模型的详细数据、原始输入输出都保存下来，连测试脚本本身都复制到结果目录里，保证未来回溯时知道当时跑了什么。

有意思的是，这个测试工具*不是 CI 门禁*。有些检查很直接（输出 dtype 对不对？），但大部分是定性判断：一个预训练模型在长序列里重复自己，正常吗？跟 transformers 基线比，4% 的 logits 差异可以接受吗？这些是经验判断，工具提供信号，但决定权在人。

![独立测试：不信任 Agent 的自我评估](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-11-transformers-to-mlx-img-04.jpg)

这其实是对 AI 辅助开发的一种*不信任设计*。Agent 说「我做完了，测试全过」——好，我信你，但我还要用另一套工具验证一遍。不是不信任你，是不信任任何自我评估。

AI 辅助开发的信任问题，不是靠「相信 AI」解决的，是靠「设计验证机制」解决的。

## 我的弯路

说实话，读这篇文章之前，我用 Claude Code 的方式挺粗暴的：给指令，看结果，能跑就过。

上周有个经历让我印象很深。我让 Claude Code 帮我重构一段配置解析逻辑，它很勤快地加了三层抽象——一个基类、两个子类、一个工厂方法。我看着觉得「挺专业的」，就直接用了。第二天回头看，那段逻辑总共就两个分支，用个 if-else 二十行搞定，它给我整了一百多行。这就是 Skill 里说的「投机性抽象」——Agent 不知道「简单」比「优雅」重要。

还有一次更离谱。我让它修一个 bug，它修完之后顺手「优化」了旁边三个函数的命名。那三个函数跑了两年没出过问题，它觉得命名不够「语义化」，大笔一挥全改了。要不是我 diff 的时候多看了一眼，这些改动就混进去了。

这不是个案。92% 的开发者已经在用 AI 编程工具，Veracode 的报告显示 45% 的 AI 生成代码没通过安全测试。佐治亚理工的研究追踪到 Claude Code 贡献了 49 个 CVE，其中 11 个是严重级别。这些数字不是说 AI 不好用——它们说的是 AI 好用过头了，好用到人懒得检查了。

大部分情况下这些代码没问题，因为是给自己用的。但如果有一天我要给一个开源项目提 PR，我得知道：代码能跑是底线，代码读得下去才是门槛。

Hugging Face 的 Skill 做了一件很朴素的事：把维护者脑子里的「为什么」写下来了。这些「为什么」过去只在维护者的 review comment 里出现，只在 mailing list 的讨论里出现，只在踩坑之后才悟到。现在它们变成了 Agent 能理解的规则。

Skill 的价值在这：不是让 Agent 写得更快，是让 Agent 写得*对*。

*你用 AI 写过代码吗？有没有遇到过 Agent「太听话」反而添乱的情况？*

## 原文参考

> Pedro Cuenca. *The PR you would have opened yourself*. Hugging Face Blog.
> <https://huggingface.co/blog/transformers-to-mlx>
