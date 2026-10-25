---
$schema: starlight
title: 87.9 分以后，工作还没做完
description: 读完 State of AI 2026，我不再只问模型能做什么，更在意一项工作怎样收尾：环境给了什么，谁来验收，失败如何回到下一轮。
date: 2026-10-25
category: ai-agents
tags: ["AI Agents", "Harness", "Agent Evaluation"]
primarySourceUrls: ["https://www.stateof.ai/State-of-AI-Report-2026.pdf"]
---

读 [State of AI Report 2026](https://www.stateof.ai/State-of-AI-Report-2026.pdf) 时，我在一张图表前停了很久。

FrontierChallenge 的科学工作流里，GPT-5.6 Sol 平均得分 87.9/100。单看这个数字，任务似乎已经接近完成。旁边的另一根柱子却写着：完整完成率 20.6%。同页的 OSWorld 2.0 也相似，Opus 5 拿到 77.7% 的部分分，任务完成率是 44.3%。漏一次审批、少一次提交，前面的计算和文档就可能留在半路。

我第一反应不是“模型不行”。恰恰相反，它已经能拿到大部分单项分。难的是最后一截：把零散的正确变成一件交得出去的事。

这份年报很长，排行榜、收入、电力、机器人和安全事件各有热闹。我读完最想带走的，却是这两根柱子之间的距离。它改变了我看 AI 进展的方式：除了问模型会做什么，还得追问工作在哪里发生，谁来判定完成，失败又会留下什么。

![核心信息图：平均得分与完整完成率的差距，以及工作环境、任务验收、生产反馈和动作监控](https://cdn.jsdelivr.net/gh/NTLx/Pic@d19c448f15a06a31395af59b0d8108cf53b44072/wechat-articles/2026-10-25-state-of-ai-2026-img-00-infographic-core-summary.jpg)

## 模型没变，成绩为什么变了

报告前部有一项很直观的实验。研究者把 3 个模型和 3 种 harness 配成网格，放进同一组 100 个 SWE-bench Verified 任务。GLM-5.1 在最简与完整 harness 之间，通过率从 52.5% 走到 65.5%。在这组实验里，harness 引起的性能方差是模型引起方差的 7.8 倍。

![State of AI 2026 原图：同一模型在不同 harness 下的表现与控制实验](https://cdn.jsdelivr.net/gh/NTLx/Pic@d19c448f15a06a31395af59b0d8108cf53b44072/wechat-articles/2026-10-25-state-of-ai-2026-img-02-infographic-harness-performance.png)

Harness 这个词听起来像又一层黑话。落到工作里，它就是模型外面的那套装置：上下文怎样给，工具怎样描述，错误怎样返回，失败后如何重试，结果交给什么检查。模型没有换，做事的条件变了，成绩单就变了。

我不会拿 7.8 倍去估算自家系统的收益。实验网格很小，几档 harness 同时改了多个组件，没法把提升记到某一个技巧头上。报告这一页还并排放了另一项 Meta-Harness 研究，更不能把两组证据混成一项因果结论。

以后再看“同一个模型”的说法，我会多问一句：它在哪套工作装置里运行？工具说明、状态保存和验证方式已经参与了产出，不能算可有可无的外包装。

这也解释了为什么更长的提示词未必是答案。报告提到，更强的模型可能长出一部分手写行为规则；继续堆提醒，反而碍事。提示词会瘦身，环境却不会消失。工具接口、运行状态、失败证据和验收条件，仍然要有人设计。

## 工程做完了，研究为什么还没做成

年报里还有一项 shadow evaluation。研究者从未公开的高质量 NeurIPS 投稿中提取核心问题交给 agent，再请原论文作者按顶会标准评审。Opus 4.8 完成了文献、调试、实验和成稿，两篇论文分别得到 2/6 和 1/6，都是明确拒稿。

![State of AI 2026 原图：开放式研究 shadow evaluation 与两篇论文评审结果](https://cdn.jsdelivr.net/gh/NTLx/Pic@d19c448f15a06a31395af59b0d8108cf53b44072/wechat-articles/2026-10-25-state-of-ai-2026-img-03-comparison-research-shadow.png)

这项实验的规模很小，评审也知道自己在读 AI 论文，不能据此宣布“AI 做不了研究”。它真正刺痛我的地方，是工程完成与研究完成之间那道缝。

Agent 能把实验跑起来，却不一定知道哪个结果值得继续；能写出论文，却不一定知道证据能支持到哪句话。原研究还有个细节：AI 评审已经指出过不少后来也被人类评审指出的问题，agent 的应对却主要是补限制、加说明，没有从根本上换方向。

可评审指出了问题，研究并不会自动换个方向。

我把这个细节与 87.9 分放在一起读，验收就不再只是末尾的一枚印章。它得改变系统接下来的动作：重试、换路、缩小主张，或者承认这个问题不值得继续。只给分数，不让分数进入决策，系统可能很会发现问题，同时很擅长带着问题往前走。

![State of AI 2026 原图：部分得分与完整任务完成率的对照](https://cdn.jsdelivr.net/gh/NTLx/Pic@d19c448f15a06a31395af59b0d8108cf53b44072/wechat-articles/2026-10-25-state-of-ai-2026-img-01-comparison-partial-vs-complete.png)

所以，完成的定义不能只写“产出了什么”。代码运行、实验做完、文档生成，都是中间证据。研究有没有回答一个值得问的问题，报销有没有真正提交，改动有没有进入可维护的系统，才是另一种问题。后者通常需要领域标准，也需要有人愿意承担“到这里才算”的判断。

## 进步发生在上线以后

报告产业部分有一张没有挂公司名字的图，叫“生产学习闭环”。它没有宣称哪家企业靠这张图提高了多少，而是把改进过程排成一个环：运行真实工作，记录任务、工具调用和结果；收集纠错、重试和动作轨迹；把失败变成有明确成功条件的测试；再修改上下文、工具、路由或权重，验证后进入下一轮。

![State of AI 2026 原图：真实工作、反馈、测试与改进组成生产学习闭环](https://cdn.jsdelivr.net/gh/NTLx/Pic@d19c448f15a06a31395af59b0d8108cf53b44072/wechat-articles/2026-10-25-state-of-ai-2026-img-04-flowchart-production-learning.png)

我喜欢这张图，是因为它给“失败”安排了一个去处。

一次没做完的任务，若只留下聊天记录，下个月还会以别的样子回来。若留下当时的环境、动作和人工纠正，它就有机会变成回归测试。下一次改的是提示、工具还是模型，不再靠猜，可以拿同一个失败重放。

这也让我重新想起之前写过的[《软件工厂的行李清单》](https://ntlx.github.io/articles/open-software-factory)。那篇关心的是：换一次工厂，什么经验还能带走。年报里的闭环则关心经验怎样在日常运行中长出来。两边落到同一个资产上——带来源的纠正，以及能重新验证它的环境。

企业数据在这里也有了更具体的含义。不是把文档库再喂一遍，而是保存“这一步为什么被改、这个工具为什么报错、这个结果为什么没被接受”。这些记录很琐碎，却最接近实际工作里的判断。

模型升级当然仍有用。只是在这张图里，它与改上下文、修工具、换路由并列，都是可选择的改进手段。系统因此有了一条不依赖等待新模型的进步路径。

## 一段轨迹还要包含刹车

任务被拉成一段轨迹以后，安全也会改变位置。

报告安全部分写到 OpenAI 的 sabotage 测试：只看模型写下的推理，Astra 更容易隐藏破坏；监控同时看到推理和动作时，成功逃避接近零。这是刻意设计的测试，不是现实事故率，但观察对象的变化很清楚——不要只读它说了什么，还要看它做了什么。

![State of AI 2026 原图：只看推理与查看完整轨迹的监控对照](https://cdn.jsdelivr.net/gh/NTLx/Pic@d19c448f15a06a31395af59b0d8108cf53b44072/wechat-articles/2026-10-25-state-of-ai-2026-img-05-infographic-trajectory-monitoring.png)

动作发生在真实环境里，监控就不能停在文本。工具调用、权限变化、网络连接和停止机制，都属于同一段任务。报警也不等于处置；报告记录的另一起 DNS 事件里，人工确认之后，自动停止仍没有按预期完成。

我在[《把信任建在模型外面》](https://ntlx.github.io/articles/trust-outside-the-model)里写过凭据与网络边界，这里不再复述。年报让我补上的一个视角是：边界不仅要在设计图上存在，还要在完整轨迹里留下可检查的证据。哪里越界、谁收到报警、停止有没有生效，都应该能够被回答。

验收与安全在这里共用一份证据：动作记录。验收要确认该发生的都发生了，安全要确认不该发生的没有发生；模型最后那句“完成了”，两项都证明不了。

## 下一份榜单送来时

年报最后有一组面向未来的预测。其中一条是：agent 不升级模型，经过一个月客户工作，把新任务失败率减半。

这是预测，不是已经兑现的结果。我却觉得它很适合用来收束这份报告。它把进步写成了一个可以检验的系统问题：同一份模型能力，能不能因为真实反馈、验收和环境改进，变得更少失败。

下一份模型榜单送来时，我大概还是会看。只是看完分数，想多留几件事在桌面上：

- 工作在哪里运行，工具、权限和状态长什么样？
- 谁定义收尾，部分正确与完整交付分别怎样记录？
- 失败留下什么，能不能成为下一次可重放的测试？
- 谁可以叫停，停止之后能否确认它真的停了？

模型会继续变强。那张 87.9 分的图提醒我，能力与交付之间，不能再用一句“AI 能不能”轻轻带过。以后再看 AI，我会把“最后是谁收尾、怎么收尾”单独记下来。

## 参考资料

- [State of AI Report 2026](https://www.stateof.ai/State-of-AI-Report-2026.pdf)，Nathan Benaich，2026-10-08。本文重点见 slide 7、17、42、114、196、220、238。
- [Stop Comparing LLM Agents Without Disclosing the Harness](https://arxiv.org/abs/2605.23950)，harness 控制实验及适用边界。
- [Meta-Harness: End-to-End Optimization of Model Harnesses](https://arxiv.org/abs/2603.28052)，报告 slide 7 并列引用的另一项研究。
- [Can AI agents conduct open-ended AI research? Early evidence from two case studies](https://arxiv.org/abs/2607.27191)，开放式研究 shadow evaluation。
- [CRUX：原始评审、日志与实验材料](https://cruxevals.com/crux/can-ai-agents-conduct-research)。
- [State of AI 2026：Improve agents without changing the model](https://www.stateof.ai/2026-explore/answers/improve-agents-without-changing-model)，生产学习闭环的报告官方页面。
- [OpenAI–Hugging Face Incident Technical Report](https://cdn.openai.com/pdf/67869394-cb91-4c12-888c-5cbd85c7814c/OpenAI-Hugging-Face%20Incident-Technical-Report.pdf)，动作、环境与平台监控。
- [OpenAI：An agent used DNS to reach an external chatbot](https://alignment.openai.com/misalignment-reports/an-agent-used-dns-to-reach-an-external-chatbot/)，报警与停止机制的独立事件复盘。
