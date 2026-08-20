---
$schema: starlight
title: 当代码产量暴增 8 倍：Anthropic 如何用“只读 Agent”重构 CI/CD 值班防线
description: AI 编程让代码产出激增 8 倍，真正的交付瓶颈已经转移到排障与值班。Anthropic 用只读 MCP 与证据链重构 On-call，证明克制的只读架构远比盲目的自愈更安全。
date: 2026-08-20
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-20-claude-on-call-ci-cd-incident-response-img-00-infographic-core-summary.png)

## 生产力倒挂：当写代码被加速十倍，值班成了最大的阻尼

任何经历过生产环境 On-call 值班的工程师，对这种场景都不会陌生：晚上 10 点，手机屏幕突然亮起，监控报警或者同事发来消息，某个新上线服务的几十个单元测试莫名其妙地不再执行。

在过去，这意味着你的夜晚彻底被毁了。你不得不合上正在看的书或离开家人，叹一口气坐回电脑前，打开终端、Datadog 监控面板、Kubernetes 控制台和 GitHub 提交记录，开始在成千上万行日志与数十个合并的 PR 中抽丝剥茧。一个看似简单的跳过规则异常，往往需要耗费一两个小时的精力去排查定位。

Anthropic 基础设施团队最近公开的一组数据揭示了一个更残酷的现实：从 2021 年到 2025/2026 年，随着 Claude Code 等 AI 编程智能体在团队内部的深度渗透，工程师每季度交付的代码量暴增了 8 倍。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-20-claude-on-call-ci-cd-incident-response-img-01-slack_incident_triage.png)

代码生成速度提升 10 倍固然令人兴奋，但整个研发工程的系统瓶颈却发生了急剧转移。代码的编写是局部的、并行的，但持续集成（CI）与生产运行却是全局的、强耦合的。当数倍的代码带着密集的 Feature Flag 和配置变更涌入仓库，传统的 CI/CD 流水线和以人工为核心的排障值班机制瞬间被推到了崩溃边缘。

告警风暴、深夜呼叫、海量日志中的盲目打捞，让 SRE 团队迅速陷入“告警疲劳”（Alert Fatigue）。如果整个交付链路的后端验证与异常响应依然依靠肉身扛起，前端 AI 带来的所谓十倍提速，最终只会在合并队列和深夜事故中被全部抵消。

这也是 Anthropic 提出“Agentic CI（智能体 CI）”的起点：面对智能体生成的代码洪流，唯一的出路是用智能体构建全新的防御防线。

## 架构四支柱：把“AI 同事”拉进 Slack 值班频道

为了应对激增的 CI 故障响应压力，Anthropic 并没有开发一套庞大臃肿、难以维护的独立运维黑盒，而是将自家的 Claude Tag 直接作为一名拥有独立服务账号的“第一响应者”，拉入了内部的 Slack 值班频道。

一个真正能在工程实战中承重的值班智能体，需要四个底层支柱：

1. **持久记忆（Memory）**：跨会话维护上下文，完整保留值班频道的历史讨论、排查轨迹与历史事故的教训；
2. **连接与权限（Connections and Access）**：通过标准化的 MCP（Model Context Protocol）连接器，接入监控、日志、代码库与集群；
3. **调度机制（Schedules）**：支持通过自然语言配置例行任务（例如“每周一早 9 点执行 CI 交接与状态盘点”）；
4. **指令与策略代码化（Instructions & Policies）**：将排查 Playbook 和规则写成 Markdown 文件，纳入 GitHub 仓库进行版本管理和审查。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-20-claude-on-call-ci-cd-incident-response-img-02-alert_detection_routing.png)

在整个检测与分流阶段，系统构建了一个既有规则确定性、又兼具语义理解力的漏斗。所有告警（无论是系统监控触发、人工在频道报告，还是内部全员事故工单）都会汇聚到值班智能体手中。

智能体根据代码化配置的 `oncall.md` 进行严密判定：如果错误率在特定时间窗口内持续超标且不在已知发版期，立即呼叫人类值班工程师，并附带已经整理完毕的完整上下文；如果是低优先级的波动或已知抖动，则静默写入 `lessons.md` 留待晨会汇总。

这种机制从源头上阻断了“狼来了”式的无效叫醒，让工程师在深夜只有面对真正的重大危机时才会收到通知。

## 证据优于推论：多智能体如何实现 14 分钟中位数定因

在故障排查（Triage）阶段，Anthropic 的系统展现出了惊人的效率：在近期的所有 CI 故障中，Claude 输出了 100% 的首发态势报告（SITREP），中位数响应定因时间仅为 14 分钟，最快的案例甚至在 4 分钟内就锁定了根本原因。

这套排查能力的底层，是一个“编排智能体（Orchestrator）+ 多个执行子智能体（Executors）”的并行多智能体架构。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-20-claude-on-call-ci-cd-incident-response-img-03-multi_agent_mcp_triage.png)

当故障发生时，编排智能体根据症状迅速派发多个子智能体，通过只读 MCP 连接器兵分多路：
- 一个子智能体前往 Grafana 查询吞吐与错误率曲线；
- 一个子智能体深入日志存储系统拉取报错堆栈；
- 一个子智能体调取 PagerDuty 告警事件；
- 一个子智能体检查 Kubernetes 集群 Pod 状态；
- 一个子智能体比对 GitHub 刚刚合并的 PR 与提交差异；
- 还有一个子智能体检索相关的 Slack 讨论记录。

所有的调查并不是盲目乱撞，而是严格受控于保存在代码库中的排查手册（例如针对特定 bug 类型的数百行排查指南）以及由智能体持续追加的 `lessons.md`。

在 Anthropic 的工程师与智能体共同协作的过程中，沉淀出了一条极其关键的工程法则：
> **“先查数据，再做推论。配置告诉你可能哪里会出错，而指标才能告诉你究竟哪里出错了。”（Query the data first, then theorize. Config tells you what could go wrong; metrics tell you what did.）**

排查过程支持人机实时的“多人协作模式（Multi-player mode）”。人类工程师可以随时提出怀疑（例如“中午我们是否调整了数据库架构？”），智能体收到提示后立即调取指标与代码差异进行交叉验证并给出反馈。这种把复杂的多源数据检索交给机器、把高阶推断与决策留给人类的模式，将以往极其耗时的“信息打捞期”彻底压缩到了几分钟之内。

## 克制的智慧：为什么“严格只读”才是工程 Agent 的生命线

过去两年中，行业内涌现过许多宣称能够“全自动自我修复（Auto-remediation）”的 AI SRE 工具，但绝大多数最终都在生产团队的严苛审视下沦为玩具，甚至因为模型的幻觉和误操作酿成生产灾难。

Anthropic 在其开源的配套套件 `anthropics/oncall-kit` 中展现出的设计哲学，却是一种极度清醒的“战略性克制”：**智能体在整个排查链路中被严格限定为只读权限，一切具有生产影响的操作必须由人类签署把关。**

智能体扮演的角色是“不知疲倦的初级侦探与信息装配工”。它生成的每一条诊断结论，背后必须附带对应 Grafana 图表或日志行数的真实超链接，绝不允许凭空推测。当排查出具体原因后，智能体的行动仅限于：
1. 给出明确的回滚建议；
2. 提供 Kubernetes 节点 cordon 或容量伸缩的具体操作指引；
3. 自动生成一个修复 Pull Request 提交给人类审查。

在处理跨团队沟通与信息同步上，Anthropic 还构建了名为 `ci-weather` 的广播智能体。它定时从构建指标、合并队列、部署延迟和各个事故频道中提取状态，向全员频道推送结构化的“CI 气象简报”，彻底消除了各个业务团队反复私聊询问“CI 流水线现在卡在哪里、我能不能合并代码”的沟通损耗。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-20-claude-on-call-ci-cd-incident-response-img-04-ci_weather_broadcast.png)

正如我们在过去探讨 [组织接口与 Agent 落地规范](https://ntlx.github.io/articles/claude-code-skills-organizational-interface) 时所指出的，真正可靠的企业级智能体系统，从来不是靠赋予模型无限的自由度，而是靠极其明确的职责边界与契约约束。放弃“全自动自愈”的浮夸叙事，坚守“只读证据搜集 + 人工决断闸门”，反而是让智能体真正融入核心生产环境的唯一正确路径。

## 组织自进化：从救火队员到响应系统的架构师

传统运维体系最大的痼疾之一，是知识库的迅速老化与腐烂。资深工程师辛辛苦苦写下的排查 Wiki，往往在写完的第一天就开始过时，遇到故障时大家依然只能靠经验口口相传或重新踩坑。

而在 Anthropic 的这套体系中，知识的流动形成了确定性的自进化闭环：
- 每次事故解决后，Claude 自动在 `lessons.md` 追加事故复盘、根因分析与关键 Gotchas；
- 下一次任何新事故发生时，智能体启动排查的第一步就是读取 `lessons.md`，把近期的真实踩坑记录作为首选假设；
- 当某一类问题被反复触发，团队会将其提炼升格为正规的排查 Skill，纳入 GitHub 仓库统一管理；
- 结合我们在 [The Agent Loop 控制权转移](https://ntlx.github.io/articles/agent-loop-reading-bytebytego) 中分析的循环机制，每周一系统还会自动生成结构化的 Hand-off 交接报告，确保值班经验在团队成员之间无损流转。

这种范式彻底重塑了平台与 SRE 工程师的职业角色。工程师不再是被告警牵着鼻子走的被动“救火队员”，而是转型为设计排障规则、优化多智能体工作流、演进整体可靠性架构的“系统编排者”。

从代码生产的爆发，到持续集成的重构，软件工程正在经历一场深刻的生产力重组。当代码的生成成本趋近于零，系统可靠性的护城河就必然建立在自动化验证与智能排障的深水区。学会用标准化的协议与严谨的只读契约武装自己的运维体系，或许是每一个技术团队在 AI 时代最值得尽早布局的底层功课。

*{你的团队在面对频繁的代码交付与告警噪音时，是否尝试过将排障流程标准化？你愿意将哪些只读权限放权给值班智能体？欢迎在评论区分享你的实战见解。}*

## 参考资料

- [Claude on call: How Claude Tag serves as Anthropic’s first responder for CI/CD failures](https://claude.com/blog/ai-ci-cd-on-call)
- [Starter kit for a Claude-assisted on-call (GitHub)](https://github.com/anthropics/oncall-kit)
- [Anthropic Claude Tag Setup Overview](https://claude.com/docs/claude-tag/admins/setup-overview#choose-which-tools-to-connect)

## 延伸阅读

- [Anthropic 这篇 skills 文章，真正写的是组织接口](https://ntlx.github.io/articles/claude-code-skills-organizational-interface)
- [循环交出控制权之后：读 ByteByteGo《The Agent Loop》](https://ntlx.github.io/articles/agent-loop-reading-bytebytego)
- [MCP 2026-07-28 规范解读：当协议走向无状态，Agent 才真正迎来了成人礼](https://ntlx.github.io/articles/mcp-stateless-spec-review)
- [1.5 万 Stars 背后：Google 揭秘 Agent Skills 的工业化构建与治理真相](https://ntlx.github.io/articles/google-agent-skills-behind-the-scenes)
