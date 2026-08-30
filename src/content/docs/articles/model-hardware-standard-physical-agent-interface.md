---
$schema: starlight
title: 智能体真正缺的不是手，而是设备的共同语言
description: MHS最值得看的不是让Claude“碰到”机器，而是把设备的状态、能力和边界写成共同语言；真正的安全与规模化，仍在这层之外。
date: 2026-08-30
category: ai-industry
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-30-model-hardware-standard-physical-agent-interface-img-00-infographic-core-summary.png)

翻到 Carnegie Mellon 的曲线时，我停了一下。

第一次实验的 R² 小于 0.9，最高浓度还出现了饱和。系统没有把这张图包装成“基本成功”，而是拒绝它，换一个浓度范围再跑。第二次的 R² 超过 0.98，CV 降到 3.4%。

这件事比“Claude 能控制液体处理器、读板器和机械臂”更让我在意。真正靠近生产的自动化，不是模型偶尔做出一件漂亮的事，而是它能不能让坏结果停在流水线里。

## 我先把“物理版 MCP”放回原位

这次 MHS（Model Hardware Standard）很容易被一句话概括成“物理版 MCP”：让 agent 通过统一接口操作显微镜、液体处理器和机器人手臂。这个比喻有用，但也会把两层东西糊在一起。

MCP 更像一条把工具送到 agent 面前的通道。MHS 处理的则是设备本身：它能测什么，能调什么，现在处在什么状态，哪些数值不能碰。驱动把厂商协议、旧式 COM 接口、文件投递，甚至只有 GUI 的设备，翻译成统一的状态和动作。

所以它不是给 Claude 装上一只万能的手。它是在设备和模型之间补了一本共同的说明书。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-30-model-hardware-standard-physical-agent-interface-img-01-lab_integration_comparison.png)

Anthropic 在官方对比图里把三种实验室放在一起：传统学术实验室的接入慢在人力，封闭自动化实验室的接入贵在专用整合，MHS 想争取的是“已有设备也能快速接进来”。这里的关键不是机器突然变聪明，而是接口胶水不再为每台设备单独生长一套。

这和我之前写过的[没有 API 的旧系统怎么跑通自动化？Claude 生产级 Agent 四件套的技术重构](https://ntlx.github.io/articles/claude-production-agents-skills-files-api)其实接着同一个问题：自动化常常不是败给模型不会推理，而是败给现实系统根本没有共同语言。只不过这次，旧系统从网页和桌面程序换成了实验室设备。

## 设备会说话，才谈得上让模型动手

MHS 的原语很朴素：‘read’ 和 ‘write’。看仪表，拧旋钮。

但物理世界里，后一个动作永远依赖前一个动作。机械臂要移动之前，plate 是否在位？读板器是否空闲？摄像头是否在线？急停是否释放？写入温度或速度之后，实际测量有没有跟上？

CMU 的演示专门诱导了六类异常：缺 plate、plate 旋转、读板器忙、摄像头断开、设备不可达、急停。官方说这些情况都在运动开始前被拦截。这个细节把 MHS 从“工具调用”拉回了“状态机”：动作不是发出去就算完成，必须有状态、边界和反馈。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-30-model-hardware-standard-physical-agent-interface-img-02-agent_device_feedback_loop.png)

Genentech 的液体处理案例更直观。通用流程在黏稠的 BSA 里打出了气泡，agent 后来根据观察调整速度，把这类物理现象写回技能。模型不是第一次就懂了流体力学；它是先看到结果，再把结果变成下一次可以复用的规则。

这也解释了为什么“可读”比“可写”更重要。没有读数，写入只是盲拧旋钮。没有外部限制，读到的状态也不能自动证明下一步安全。

## 最好的结果，是模型最后退出控制回路

QuEra 的 laser locking 案例给了我一个很好的落点。

Claude 先在探索阶段反复调参数、观察反馈，报告中的开发过程从约 58% 成功、每次 150 秒，走到约 96%、每次 6 秒；盲测 700 次成功 695 次。接着，研究者把学到的流程整理成确定性脚本，生产环境不再让 AI 直接运行。

这不是对 agent 的否定，反而是更成熟的分工：模型适合在还不知道答案时探索，普通程序适合在答案已经被验证后重复执行。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-30-model-hardware-standard-physical-agent-interface-img-03-cmu_curve_rejected_saturation.png)

CMU 第一次曲线被拒绝，也是同一套逻辑。系统没有因为“模型完成了实验”就接受结果。它看见饱和，判断当前范围不合适，重新选择最高 100 µg/mL 的范围再跑。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-30-model-hardware-standard-physical-agent-interface-img-04-cmu_curve_accepted_range.png)

如果把成功率单独摘出来，故事像是模型越来越能干；把失败图放回来，故事就变成了另一件事：可靠性来自拒绝、重试和可检查的状态，而不是来自一段顺滑的演示视频。

## 安全不是一句“请小心”

MHS 的研究预览仍然很早。官方明确说，完整标准会在更多安全评估和最佳实践之后再开源；目前也还不能从页面上的案例推断出公开 schema、一致性测试或跨供应商互换已经成立。

这正是我对“物理版 MCP”这个说法最想踩刹车的地方。它可以描述统一入口，却不能替代硬件急停、互锁、身份权限、参数校验、人工批准和故障恢复。Open Robotics 的讨论也把 MHS、ROS 2、意图验证和安全评估放在互补位置，而不是让某一个标准包办全部控制问题。

社区里有人担心，实验室里分钟级的循环经验不能直接外推到毫秒级的实时制造；这个担心是对的。MHS 让动作更容易被发现，也可能让错误动作更容易被编排。接口越通用，写入权限越需要被分层。

我会把安全链写成这样：状态可见，边界外置，失败可拒绝，结果可回放。模型只负责其中一段，而且不是最不能出错的那一段。

## 标准的下一关，不是再做一个 demo

读完这篇预览，我对 MHS 的判断从“Claude 要开始操作机器了”，变成了“设备终于有机会把自己说清楚”。这层共同语言如果做成，价值会落在很多不起眼的地方：新设备能否快速接入，旧协议能否被翻译，技能能否跨设备迁移，异常能否被复现。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-30-model-hardware-standard-physical-agent-interface-img-05-quera_script_compiled_result.png)

但真正决定它能不能成为标准的，恐怕不是合作方名单，也不是又一个漂亮的成功率，而是四个更笨的问题：schema 是否稳定，驱动谁来维护，失败能否回放，不同模型能否共享同一份设备描述？

如果今天要把这套思路放进自己的实验室或机器人系统，我会从模拟器和回放开始；把 ‘read’ 与 ‘write’ 分开；把参数校验和危险动作审批放到模型之外；等一条流程稳定后，再让模型把探索结果编译成确定性脚本。

MHS 最值得看的地方，恰好不是让 AI 永远留在现场，而是让它把现场的经验留下来，然后把手交还给一套更容易检查的程序。

如果把 MHS 放进你所在的实验室、工厂或机器人系统，你最先愿意交给 agent 的是读状态、低风险调参，还是执行完整流程？你会把哪一道安全闸放在模型之外？

## 参考资料

* [Model Hardware Standard 官方首页](https://modelhardwarestandard.com/)
* [Previewing the Model Hardware Standard — Anthropic](https://www.anthropic.com/news/model-hardware-standard-research-preview)
* [Model Context Protocol 官方站点](https://modelcontextprotocol.io/)
* [Model Hardware Standard (MHS) and ROS 2 — Open Robotics Discourse](https://discourse.openrobotics.org/t/model-hardware-standard-mhs-and-ros-2/51612)
* [AI Agents Control Quantum Computers — QuEra](https://www.quera.com/blog-posts/ai-agents-control-quantum-computers)
* [没有 API 的旧系统怎么跑通自动化？Claude 生产级 Agent 四件套的技术重构 — NTLx 知识库](https://ntlx.github.io/articles/claude-production-agents-skills-files-api)
* [Agent 能跑 demo 不算本事，能跑一年才是 — NTLx 知识库](https://ntlx.github.io/articles/agent-development-lifecycle)
* [MCP 2026-07-28 规范解读：当协议走向无状态，Agent 才真正迎来了成人礼 — NTLx 知识库](https://ntlx.github.io/articles/mcp-stateless-spec-review)
