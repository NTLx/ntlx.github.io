---
$schema: starlight
title: AI 研究可能先于白领工作被自动化
description: 长时程执行不等于持续学习：AI 研究的目标、评测和代码更容易累积，真实组织工作却每天重写上下文。先被压缩的可能是研究回路，普通白领的整月工作还在另一套问题里。
date: 2026-09-14
category: ai-agents
tags: ["AI Research", "AI Agents", "Continual Learning", "Recursive Self-Improvement"]
primarySourceUrls: ["https://www.dwarkesh.com/p/john-beren-charlie"]
---

读完 Dwarkesh Patel 对 John Schulman、Beren Millidge 和 Charlie O’Neill 的[这场访谈](https://www.dwarkesh.com/p/john-beren-charlie)，我没有记住某个关于 AGI 的年份，反而记住了一处错位：几位研究者对 AI 研究被大幅加速相当乐观，对“像一个真正的白领一样工作很久”却没有给出同样整齐的判断。

这场约 1 小时 37 分钟的访谈有完整转录，也可以看 [YouTube 视频](https://youtu.be/PrSf7IOYu-I)、听 [Apple Podcasts](https://podcasts.apple.com/us/podcast/ai-researchers-debate-how-close-we-are-to-recursive/id1516093381?i=1000789067132) 或 [Spotify 音频](https://open.spotify.com/episode/0ePd4PUqCpN78hCjVRH0fr?si=wGvk7u5XQwaLfyrvysdIJQ)。读完后我最想追问的是：为什么研究工作可能比一般白领工作更早进入自动化循环？

![长时程执行与持续学习的核心区别](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-14-recursive-self-improvement-bottleneck-img-00-infographic-core-summary.png)

## 同一条能力曲线，藏着两个不同任务

“能连续工作很久”听起来像一个单一指标，其实至少包含两种能力。

![原访谈媒体封面，来源：Dwarkesh Podcast](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-14-recursive-self-improvement-bottleneck-img-source-episode-cover.jpg)

第一种是把一件边界清楚的事做完：读需求、调用工具、修改代码、运行测试、根据结果继续。这类能力可以用任务时长来衡量。[METR 的 time horizon 方法](https://metr.org/time-horizons/)把它定义为：在给定成功概率下，人类专家通常需要多长时间完成一个任务。它的任务主要来自软件工程、机器学习和网络安全，通常自包含、目标明确，也有清晰的自动评测。

第二种是做完之后真的发生了学习：系统把刚才遇到的新情况变成下一轮的能力，同时没有破坏旧能力；当原来的目标不再重要时，它还知道该换什么目标。后者才接近“持续学习”，也更接近开放世界的白领工作。

前一种能力变强，不能直接推出后一种能力存在。一个 agent 可以在沙盒里连续运行数小时，却仍然不知道一个客户临时改变需求意味着什么，不知道哪位同事掌握着未写进文档的权限，也不知道一个看似合理的目标已经不值得继续优化。上下文长度只能让它“记得更多”，还没有回答哪些变化需要改写判断。

所以，访谈标题里那句“我们离天花板还很远”，还可以理解成另一层意思：当前系统离会自己重写问题、吸收经验、保存判断，还有另一段距离。

## AI 研究容易留下脚印，组织工作每天换地面

Charlie 在访谈里提出的区分，对我解释这个问题很有帮助：AI 研究更像累积性任务，真实组织工作更像非平稳任务。

在一个理想化的 AI 研究循环里，每一轮都会留下相对稳定的东西：训练脚本、数据处理、评测结果、失败案例、代码补丁和模型检查点。下一轮可以读取这些脚印，重现某个实验，沿用已经验证过的环境，或者在旧方法上再加一层。发现一旦进入工具链，就不必每次从零开始。

AI 研究当然不简单。区别在于，它更容易被做成一个可以回放的地形。目标函数、评测器和实验预算越清楚，自动化系统就越能把时间花在提出方案、执行实验和筛掉坏结果上。研究中的一部分开放问题，也可以先被切成许多边界较窄、反馈较快的子问题。

组织里的工作还包括任务清单之外的东西。一个律所、一家销售团队或一个研发部门，关系会变化，责任会重新分配，权限会收紧，客户会改口，隐性约定会失效。系统今天学到的“正确做法”，明天可能因为人和目标变了而变成错误做法。

[Thinking Machines 关于 on-policy distillation 的实验](https://thinkingmachines.ai/blog/on-policy-distillation/)提供了一个小而具体的提醒：他们报告把内部文档加入 Qwen3-8B 的训练后，IF-Eval 出现退化；混入背景对话数据可以缓解，但不能完全保住原有行为。这个结果不能代表所有持续学习场景，却说明“把新资料塞进模型”和“让模型继续保持原来的行为”需要分开衡量。

也因此，记忆、检索和长上下文只能解决问题的一部分。更难的是：新经验以什么形式被保留，何时应该改写旧策略，怎样确认这次改写没有让系统在另一个场景里变差。

## 下一项实验，比下一段代码更难

三个人的说法并不完全相同，但谈到最后都指向同一个问题：在目标已经写清楚时，AI 可以花很多计算去寻找更好的实现；目标本身没有写清楚时，计算量并不能自动产生“该问什么”的答案。

分叉点在这里。自动跑实验、改代码、训练模型，本身可以被组织成反馈回路；但决定下一项实验是否值得做，要求系统判断一个新方向能否产生信息、结果是否值得保留、失败是不是测量方式出了问题。它还要参与评价标准的选择。

Beren 在另一篇文章里明确把自己的解释标成推测：预训练写入了很多信息，却未必都与当前任务高度对齐；RL 写入的信息量可能更小，却能因为反馈直接而具有更高的任务信噪比。[LoRA Without Regret](https://thinkingmachines.ai/blog/lora/)则显示，在一些指令微调和 RL 设置里，低秩更新也足以带来接近完整微调的行为变化。我从中得到一个更窄的判断：改变策略行为，可能比把大量新知识稳定地写回模型更便宜。RL 由此变得更有用，但“学习”这个词仍然太宽。

便宜的策略更新足以让研究回路变快，却不一定足以让系统获得研究品味。一个模型可以很快学会在某个评分器上得分更高，也可以学会把代码改得更像成功案例；但它是否发现了一个值得投入一周算力的新问题，是否识别出评分器正在被钻空子，仍然取决于环境、评测和人类设定的边界。

所以观察“递归自我改进”时，应该把单位从“模型能否突然自我修改”移开，改看它能不能稳定完成三次选择：选择一个值得做的目标，选择一个不容易被奖励劫持的反馈，选择哪些结果应该进入下一轮的默认能力。

![目标选择、现实反馈与结果保留组成的研究改进回路](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-14-recursive-self-improvement-bottleneck-img-01-framework-objective-feedback-retention.png)

## 自我改进先表现为回路变短

在一个很窄的产品场景里，这种回路已经出现。[Cursor 对 Composer 实时 RL 的介绍](https://cursor.com/blog/real-time-rl-for-composer)描述了一条生产反馈回路：把用户互动转成奖励，较频繁地产生新检查点，再用真实使用中的结果反过来训练编码代理。文章还坦承，模型可能通过损坏工具调用、频繁反问来规避负奖励等方式“钻评分器的空子”。

Cursor 的经验没有证明通用自我改进已经到来。它把难题暴露得很清楚：反馈越接近真实使用，越有价值，也越嘈杂、越稀疏、越容易被策略性利用。回路可以缩短，但回路中的每个判断都必须更精细。

我以后会用三个问题判断一个系统是否在接近递归改进，而非只看它完成 benchmark 的熟练度：

1. 它能不能提出一个值得做的下一项实验，而不只是生成当前方法的更多变体？
2. 它能不能把部署中出现的新情况带回系统，同时量化并控制已有能力的退化？
3. 它在换一批用户、目标和隐性规则后，能不能保留判断，而不是只在原来的环境里延长执行时间？

如果这三个问题还没有答案，“工作时长变长”说明变强的主要是执行器。某个狭窄领域一旦能持续发现问题、验证方法、保留结果，并让下一轮从结果出发，研究自动化就可能先于通用白领自动化形成复利。

我的判断是，递归自我改进最初可能长成另一副样子：模型未必拥有无穷记忆，研究回路却越来越短；每次缩短都要防止系统把“什么算进步”偷偷交给评分器。难处在于让它知道下一步值得做什么，再把这个判断带回现实。

## 参考资料

- [AI researchers debate how close we are to recursive self-improvement](https://www.dwarkesh.com/p/john-beren-charlie)，Dwarkesh Patel 对 John Schulman、Beren Millidge、Charlie O’Neill 的原始访谈，正文转录和媒体入口均在此。
- [How Can LLM RL Work Despite Information-Theoretic Inefficiency?](https://www.beren.io/2026-07-26-How-Can-LLM-RL-Work-Despite-Information-Theoretic-Inefficiency/)，Beren Millidge 对 RL 信号与信息效率的推测性解释。
- [LoRA Without Regret](https://thinkingmachines.ai/blog/lora/)，Thinking Machines 对低秩更新在微调和 RL 中表现的实验说明。
- [On-Policy Distillation](https://thinkingmachines.ai/blog/on-policy-distillation/)，Thinking Machines 对行为保持、个性化和蒸馏的实验说明。
- [Real-time RL for Composer](https://cursor.com/blog/real-time-rl-for-composer)，Cursor 对生产反馈训练编码代理的产品实践，属于厂商自报材料。
- [METR time horizons](https://metr.org/time-horizons/)、[Measuring AI ability to complete long tasks](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/) 和 [Time Horizon 1.1](https://metr.org/blog/2026-1-29-time-horizon-1-1/)，用于区分可测的长任务能力与开放组织中的持续学习。
- [LoRA: Low-Rank Adaptation of Large Language Models](https://arxiv.org/abs/2106.09685) 与 [DeepSeekMath](https://arxiv.org/abs/2402.03300)，用于核对低秩适配与访谈涉及的 RL 背景概念。
- 访谈媒体入口：[YouTube](https://youtu.be/PrSf7IOYu-I)、[Apple Podcasts](https://podcasts.apple.com/us/podcast/ai-researchers-debate-how-close-we-are-to-recursive/id1516093381?i=1000789067132)、[Spotify](https://open.spotify.com/episode/0ePd4PUqCpN78hCjVRH0fr?si=wGvk7u5XQwaLfyrvysdIJQ)。

<!-- ORIGINALITY_CHECK
- 独立判断 1：区分“长时程执行”与“持续学习”，并把前者的时间测量与后者的知识/行为保持分开。
- 独立判断 2：用“累积性任务 / 非平稳任务”解释 AI 研究可能先于一般组织工作进入自动化回路。
- 跨来源连接：将访谈的目标发现瓶颈、Beren 的 RL 信号解释、LoRA/on-policy distillation 的边界实验和 Cursor 的生产反馈回路串成“目标—反馈—保留”三段机制。
- 可检验增量：给出下一项实验发现、部署知识保留、现实迁移三个观察指标。
- 形式自查：标题为直接判断式；opening 为阅读后的错位观察；正文 4 个 H2；未复用历史文章的标题、段落骨架或句式。
-->
