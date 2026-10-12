---
$schema: starlight
title: 按下停止键后，Agent 的工作该怎样收住
description: 把监督放到 Agent 够不到的地方很有价值；接下来还得验证，暂停是否能收住已经启动的工具、任务和授权。
date: 2026-10-12
category: security
primarySourceUrls: ["https://developer.nvidia.com/blog/nvidia-open-agent-safety-platform-a-reference-for-continuous-in-silicon-agent-monitoring/"]
---

“控制通往模型的路径”，是 NVIDIA 这篇 Agent 安全文章里让我停下来的一句话。它把模型调用当作观察点，也当作必要时中断 Agent 的开关。

这个思路很直接：Agent 要继续推理，就得经过一道自己无权拆掉的门。但读到这里，我想到的是门外已经在进行的工作。假如它刚启动一个后台脚本，或者把任务交给了外部服务，接着模型连接被切断，那些工作会怎样？

这不是我发现了产品漏洞，而是我读完 [NVIDIA Open Agent Safety Platform 的参考设计](https://developer.nvidia.com/blog/nvidia-open-agent-safety-platform-a-reference-for-continuous-in-silicon-agent-monitoring/)后，想带去验收现场的问题。我赞同把监督移出 Agent 的执行环境，也希望“能停下来”有一份覆盖完整执行过程的说明。

![全文导读：独立监督、在途工作、证据边界和责任交接](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-12-agent-safety-control-plane-img-00-infographic-core-summary.png)

## 监督者应该待在什么地方

把规则写在提示词里，可以告诉 Agent 什么事不该做。要限制它能做什么，执行规则的组件还需要拥有独立的权限。

NVIDIA 在这份设计中给出两层分工：OpenShell 在沙箱外执行运行时策略；可选的 Sentry 则把监督与策略执行延伸到 BlueField 硬件。[平台 FAQ](https://www.nvidia.com/en-us/solutions/ai/agent-safety/)特别说明，后者的隔离范围包括宿主软件：即使宿主或工作负载失陷，硬件隔离层仍承担监测与执行职责。这是厂商对架构的说明，本文没有实测它的抗攻击效果。

原文架构图左侧是 OpenShell 的 Gateway、Supervisor 和 Policy Prover，Agent 在其中的沙箱里；右侧是独立的 Sentry。读这张图时，我会关注两边之间的信任关系：哪些数据来自 Agent，哪些记录由外部生成，谁能修改规则，谁能批准例外。

![NVIDIA 原文图一：OpenShell 运行时边界与 Sentry 硬件监督；图中性能标签为厂商声明](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-12-agent-safety-control-plane-img-01-framework-source-architecture.webp)

我觉得这比笼统地要求 Agent “始终遵守安全规定”更有用。一个会写代码、会换工具的执行者，遇到失败时可能寻找另一条路。我们希望它保留这种解决问题的能力，同时让权限审批和强制执行掌握在别处。

站内的[《让 Agent 带着具体请求来申请权限》](https://ntlx.github.io/articles/openshell-runtime-permissions)讨论了 OpenShell 怎样处理具体访问与权限申请。这里再往基础设施走一步：如果担心运行 Agent 的宿主也不可信，监督系统依赖同一个宿主，就需要继续分析这份依赖。

监督层还需要可靠的身份映射、更新机制和故障处理，操作者也得知道它能看见什么。这些条件要在部署时逐项落实。

## 切断模型之后，还需要收住哪些动作

原文描述的 Vera Rubin POD 拓扑中，BlueField-4 位于节点通往模型的唯一通路。这让它成为很有吸引力的控制点。要把同样的判断用到自己的部署，就得先检查路由：是否允许本地推理，是否存在别的模型出口，失败后会不会自动切换到未受控的服务。

即使模型请求都经过这道门，我也不会直接把“无法继续调用模型”当成“任务已停止”。

假设 Agent 为整理资料启动了一个上传脚本。脚本拿到输入后自行运行，不必每发送一份文件就重新请求模型。此时禁止后续推理，只回答了下一轮决策是否能发生；脚本、连接和远端队列的生命周期还需要各自的控制。这是假设场景，不是对 NVIDIA 实现的故障报告。

![假设场景：暂停后续推理后，仍需检查子进程、远端队列和外部影响](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-12-agent-safety-control-plane-img-02-flowchart-inflight-work.png)

因此，我想看到的停机验收会包含具体动作：

- 在子进程或后台任务运行时暂停，检查它是否继续产生外部影响。
- 在请求已进入远端队列后暂停，检查系统能否撤销待执行任务，或明确报告无法撤销的部分。
- 在身份和凭据仍有效时暂停，检查任务是否还能通过其他获准接口继续推进。
- 恢复工作时，检查旧任务、重试和新任务是否会重复执行同一项操作。

这些检查未必由同一个组件完成。运行时可以管本地进程，基础设施可以管连接，应用则需要理解远端任务以及已经发生的业务后果。发送出去的邮件、提交成功的修改，也不会因为按了暂停就自动复原。

之前[《一个愿意替你修故障的 Agent，先得学会何时停手》](https://ntlx.github.io/articles/agent-proactive-action-user-control)讨论过产品中的暂停入口。读这份硬件设计后，我会给这个入口补上状态反馈：系统应该告诉用户哪些工作停了，哪些还在收尾，哪些结果已经无法撤回。用户才能据此决定下一步。

## 看见推理，距离判断安全还有多远

NVIDIA 还提出，授予 Agent 更多权限时，应提高检查其推理的能力。开放模型带来的可观察条件，确实值得研究。但我更愿意把这种可见性当作调查材料。

推理文本可以帮助理解某个动作的来由，却不能单凭表达得合理，就确定动作在授权范围内。隐藏层激活可供研究者分析，也不意味着操作者已经掌握稳定、可解释的风险判断方法。权限检查仍应对准动作及其影响。

这里也需要区分形式验证。配套的 [Policy Prover 文档](https://docs.nvidia.com/openshell/latest/how-it-works/policies/prover)说得比主文中的“策略符合意图”更具体：检查候选策略是否超出事先定义的权限边界，保证只适用于模型表示的特征和行为。通过检查，不代表权限已经收紧到任务所需，也不代表运行中的沙箱落实了它。

我的理解是，人先把意图翻译成可检查的边界，证明器再检查这个表达。翻译是否准确，仍是需要负责的工作。若为了方便，把允许访问的范围设得很宽，一份落在其中的策略可能通过证明，却仍不适合眼前任务。

硬件隔离、推理观察和权限证明各有价值。评审时把它们的证据分开看，会更容易找出还缺什么：架构图说明部署关系，策略结果说明建模范围，运行记录说明实际动作，业务系统则说明动作造成的后果。任何一份材料，都不宜替其他部分作保证。

## 责任要沿着一次故障接起来

原文以一张生态支持方的 logo 图收尾。它说明有不同领域的参与者支持这套方向，但不能用来证明具体部署的安全效果。

![NVIDIA 原文图二：生态支持方；参与关系不等于安全认证或部署成效](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-12-agent-safety-control-plane-img-03-framework-source-ecosystem.webp)

相比参与者有多少，我更关心它们在一次故障中怎样交接。可以沿着一个假设事件检查：Agent 越过任务范围提出请求，监督层发现异常并隔离它，工具层随后处理在途任务，操作者查看记录后决定恢复或补救。每一步由谁负责，下一步需要什么信息，都应该写清楚。

原文把平台分为应用、运行时和基础设施层，我觉得这份划分有助于讨论责任。应用最接近用户目标，应表达哪些业务结果被允许；运行时把它落实到进程、资源和请求；基础设施提供更独立的隔离与记录。某一层发现问题后，还需要能把处置要求传到其他层。

对准备采用这类系统的团队，我会建议先挑一个边界明确的任务，把允许访问的资源、暂停后的状态和责任人写下来，再测试正常完成与中途停止。若软件运行时已足以满足风险要求，可以先从那里开始。[官方 FAQ](https://www.nvidia.com/en-us/solutions/ai/agent-safety/)说明 OpenShell 不要求 BlueField-4；是否增加硬件监督，应根据对宿主失陷的防护需求来判断。

读完这篇文章，我赞同让监督拥有独立于执行者的控制权。采用它时，我还会要求团队演示一次完整的暂停：在途工作如何处理，无法撤回的影响记在哪里，恢复由谁决定。我希望按下停止键后，这些状态能直接显示出来。

配图中的 NVIDIA 架构图及生态图复用原文，用于讨论参考设计与参与关系；本文未进行 OpenShell 或 Sentry 部署实测。

## 参考资料

- [NVIDIA 原文：Open Agent Safety Platform 参考设计](https://developer.nvidia.com/blog/nvidia-open-agent-safety-platform-a-reference-for-continuous-in-silicon-agent-monitoring/)
- [NVIDIA 平台介绍与 FAQ](https://www.nvidia.com/en-us/solutions/ai/agent-safety/)
- [配套技术教程：Add Runtime Controls to AI Agents with NVIDIA OpenShell](https://developer.nvidia.com/blog/add-runtime-controls-to-ai-agents-with-nvidia-openshell)
- [OpenShell 开源仓库](https://github.com/NVIDIA/openshell)
- [Policy Prover：证明对象、覆盖范围和限制](https://docs.nvidia.com/openshell/latest/how-it-works/policies/prover)
- [形式方法说明：What we have learned applying formal methods to control AI agents](https://nvidia.github.io/OpenShell-Research/dev-notes/posts/2026-09-10-learning-formal-methods-agent-policy-prover/)
- [Vera Rubin POD 的基础设施拓扑](https://developer.nvidia.com/blog/nvidia-vera-rubin-pod-seven-chips-five-rack-scale-systems-one-ai-supercomputer/)
- [DOCA：BlueField 的可编程软件平台](https://developer.nvidia.com/networking/doca)
- [BlueField DPU 产品说明](https://www.nvidia.com/en-us/networking/products/data-processing-unit/)
