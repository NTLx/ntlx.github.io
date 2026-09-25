---
$schema: starlight
title: WorldPrompt 的时间轴，能留下多少世界状态？
description: WorldPrompt 把角色和场景事件排进时间轴，让视频能在生成中接收动作。下一步要验证的是状态能否跨回合保持、因果是否稳定，以及失败分支能否被如实呈现。
date: 2026-09-25
category: ai-models
primarySourceUrls: ["https://www.latent.space/p/runway?showTranscript=true"]
---

读这次访谈时，我的注意力很快落在一个具体问题上：人可以怎样改变正在生成的场景？WorldPrompt 把场景设定和动作拆开，输入也能在视频生成中继续到来。

控制入口变清楚后，我会继续追问：模型接收到动作之后，能不能记得动作改变了什么？长互动里改走另一条路径，它能否给出与此前状态一致的后果？

![WorldPrompt 的输入层、滑动窗口与持续生成之间的关系](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-25-worldprompt-world-state-img-00-infographic-core-summary.png)

## 它给提示加上了对象、时间和并行事件

WorldPrompt 把一个世界拆成持久上下文和时间事件流。持久上下文包括场景描述、参与者属性与行为规则，并用首帧提供视觉起点；事件流则把动作、对话或声音写成带起止时刻的自由文本，指向某个角色或场景。多条事件可以重叠，相机输入还会逐帧描述视角的移动和旋转。

Latent.Space 原文的示意图把首帧、初始世界上下文、后续事件，以及视频和音频的输出路径放在一起。图中有落叶动作、对话和相机输入，读者能直观看到这些信号如何进入生成过程（图源：Latent.Space 原文）。

![Latent.Space 原文中的 WorldPrompt 运行示意图，展示首帧、世界上下文、事件流与视频音频输出](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-25-worldprompt-world-state-img-worldprompt-in-action.png)

Runway 将 GWM Worlds 2 标为研究预览。官方给出的规格是 720p、每秒 24 帧的视频和 48,000 Hz 音频；实时生成流程包括在基础音视频模型上微调 WorldPrompt，再进行自回归后训练。[Runway 的技术说明](https://runway.com/research/introducing-gwm-worlds-2)展示了预先写好事件、分段决策和实时输入动作几种方式。这些规格描述输出形式和速度，状态连续性还要单独验证。

## 会话可以继续，历史仍会滑出窗口

Runway 说 GWM Worlds 2 没有预设的会话时长。每一步生成仍受滑动窗口约束：模型会读全局场景提示和首帧、当前输入，以及窗口内的近期生成帧；更早的帧会移出窗口。官方也承认长期记忆不完善。

长会话可以继续生成，模型每一步能利用的历史则受窗口长度限制。互动拉长后，角色、物体或动作结果是否仍符合前面的设定，不能只凭视频不断输出就下结论。Runway 指出，充分使用自由文本控制时，有时需要外部程序追踪世界状态，并实时整理下一步动作。访谈里也明确提到，GWM Worlds 2 没有供 Agent 直接读取的结构化状态；Agent 接收到的是画面和声音。

访谈里还有一段让我更警惕长序列：自回归模型会把生成帧送回下一步，早先的细小误差可能继续累积。Anastasis Germanidis 将误差累积称为这类模型面对的主要挑战。Latent.Space 原文引用 Runway 的误差示意图，画出一个先出现在单帧里的伪影如何留到后续画面里。

![Runway 原图对比文字生成错误可恢复与自回归视频生成误差累积](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-25-worldprompt-world-state-img-autoregressive-error-accumulation.png)

读到滑动窗口的细节后，我会把 WorldPrompt 理解为输入侧的编排方式：它让人和外部程序更容易安排下一步。模型保留了多少场景状态，仍要看窗口里的历史和外部追踪。单看时间戳和流畅画面，答不了这个问题。

## 评测要追问多轮状态和反事实后果

我们之前依据 World Labs 对 renderer、simulator 和 planner 的拆分，讨论过不同“世界模型”到底输出什么。《[世界模型最值钱的一层，不是画面，是状态](https://ntlx.github.io/articles/world-models-state-renderers)》谈的是功能分类。读完这次访谈，我更想追问一个具体问题：一连串动作之后，模型还保留了哪些场景事实？

评测可以从一个简单场景开始：让角色离开桌面上的物体，再绕回来，检查物体是否还在原处。接着从同一初始场景分出两条动作路径，看模型能不能区分成功和失败的后果。还可以换视角、场景或物体外观，检查物理关系是否跟着表面线索改变。关键是这些规则在多轮互动里能不能保持。

近期研究已经把其中一些问题整理成评测维度。[WBench](https://arxiv.org/abs/2605.25874)把多轮视频评测分为画面质量、场景遵循、交互遵循、一致性和物理行为；[CRONOS](https://arxiv.org/abs/2605.23699)则固定物理事件，再改变视角、场景或物体外观，检查模型能否给出相容结果。它们提供测试方法，没有公布 GWM Worlds 2 的成绩。

Runway 在另一条机器人研究线上展示过一种核验办法：把 GWM-Robotics 的模拟结果与真实机器人 rollout 对照，比较不同策略的排序。那项研究只涉及 RoboArena 桌面操作和一台 Franka Panda 机械臂，使用的是另一个模型，也不能替代对 GWM Worlds 2 的评测。

## 创作空间可以先用，仿真责任要靠证据接住

从这次公开展示来看，WorldPrompt 让实时视频生成更容易被人直接操控。我能想到的用途包括互动短片、广告预演和游戏概念验证：先搭好场景，再试动作，需要修改时也能针对某个事件调整。

如果拿它评估 Agent 或机器人，要求会高得多。评测需要说明模型版本、初始状态、输入动作和结果判定方式；机器人任务还要拿真实系统作对照。GWM-Robotics 展示了一种对照办法。GWM Worlds 2 自己的多轮记忆、交互一致性和因果行为，则还没有这些证据。

我会先把 WorldPrompt 当成实时创作的控制界面。它把“世界里发生什么”变成模型可以响应的输入。若要把它当作可靠仿真器，接下来得看到多轮互动后仍可复核的状态和动作后果。

## 参考资料

- Richard MacManus，[Runway’s WorldPrompt and the Engineering of Real-Time Worlds](https://www.latent.space/p/runway?showTranscript=true)，Latent.Space。
- Runway，[Introducing GWM Worlds 2](https://runway.com/research/introducing-gwm-worlds-2)。
- World Labs，[A Functional Taxonomy of World Models](https://www.worldlabs.ai/blog/taxonomy-of-world-models)。
- Ying et al., [WBench: A Comprehensive Multi-turn Benchmark for Interactive Video World Model Evaluation](https://arxiv.org/abs/2605.25874)。
- Begiristain et al., [CRONOS: Benchmarking Counterfactual Physical Consistency in Video Models](https://arxiv.org/abs/2605.23699)。
- Runway Robotics，[Accelerating Robot Policy Evaluation with General World Models](https://runway.com/research/accelerating-robot-policy-evaluation)。
