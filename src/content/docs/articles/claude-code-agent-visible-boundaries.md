---
$schema: starlight
title: 从工作台到沙箱：Agent 的自主性需要可见边界
description: Agent 开始规划、协作并扩展自己的工作流后，工作界面与权限治理会在同一套 harness 汇合。给它更多自主性，也要让身份、状态与人工介入点清楚可见。
date: 2026-09-29
category: ai-agents
tags: ["AI Agents", "Harness", "AI Security"]
primarySourceUrls: ["https://www.latent.space/p/thariq"]
---

在 [Latent.Space 对 Thariq Shihipar 的访谈](https://www.latent.space/p/thariq)里，话题从 Claude Code 如何向用户多问一句，走到 Artifacts、Mods，再转向沙箱与前沿安全。后半段谈安全并非另起话题：Agent 能做的事越多，人越需要看见它在做什么，及时纠正或叫停。

我之前在[《Not the Model, You're the Harness》](https://ntlx.github.io/articles/not-the-model-youre-the-harness)里谈过模型周围的执行环境。这次访谈让我更在意 harness 怎样连接工作界面和行动边界：Agent 能看什么、能做什么，人又怎样检查它的工作。

![Agent 工作流的四个可见边界：身份、权限、进展与验收](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-29-claude-code-agent-visible-boundaries-img-00-infographic-core-summary.png)

## 从对话框到工作台，人要看见任务怎么推进

Thariq 先谈到 AskUserQuestion：有些人能把需求说得很完整，有些人需要 Agent 帮着找出还没说清楚的部分。复杂任务里，缺失的可能是领域词汇、隐含偏好、生产限制或验收条件。让 Agent 追问这些未知项，人才能继续参与决策。

Artifacts 把这种协作从来回对话延伸到围绕任务生成的工作界面。官方介绍称，它能根据 Claude Code 的 session context 生成可更新、可分享的交互页面，例如 PR 讲解、dashboard 或 release checklist。任务跨越多个步骤时，这些页面能让人回头查看目标、进度和待处理事项。

同一方向也延伸到持久任务和多人协作。Claude Projects 的新版本目前仍在分阶段 beta，先从 Claude Code 开始；Claude Tag 则在 Slack 为 Team 和 Enterprise 用户提供 beta，以组织身份使用配置好的工具和共享上下文。两者细节不同，但都把 Agent 的状态、记忆和权限带进团队工作的空间。

我在[Anthropic 的值班 Agent 实践](https://ntlx.github.io/articles/claude-on-call-ci-cd-incident-response)里写过 Claude Tag 的团队协作用法。这次访谈让我继续追问：谁能看到同一份上下文，Agent 代表谁行动，任务卡住或完成时，其他人从哪里知道？

## Mods 把一部分监督习惯放进运行时

访谈里让我印象很深的 Mods 示例，是让容易忘的检查跟着任务运行：任务结束后，由 fork 出来的 agent 检查目标是否完成，再决定是否给用户一个理解测验；也可以用工具记录关键假设。Thariq 描述的 Mods 能在 TypeScript runtime 中 fork subagent、解析结构化结果并扩展界面。检查因此可以随任务触发，不必等操作者想起某个 skill。

![访谈中的 Mods 监督示例：任务结束后由 fork 出来的 agent 检查目标，完成时触发理解测验](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-29-claude-code-agent-visible-boundaries-img-01-flowchart-mod-supervision.png)

过去我常把 harness 理解为安排模型如何调用工具的执行环境。现在它也能决定何时检查状态、在哪里展示结果、怎样复盘任务。某项检查若对一类任务很重要，把它放进运行时或评估流程，比寄望于某个人每次都记得更可靠。

但自动化监督也需要选择范围。每轮都开一个子 agent 会额外消耗资源，也可能把无关打断变成默认流程。安全审查、代码审查和长任务复盘，值得更重的检查；低风险的小任务，则可以保留轻量路径。值得自动化的，是失败后果高、又容易被遗忘的那个检查点。

目前公开的 Claude Code Mods 仍标为 early access，官方仓库也说明相关 API 可能随版本变化。我会把它看作可编程 harness 的早期形态。正如我在[《Not the Model, You're the Harness》](https://ntlx.github.io/articles/not-the-model-youre-the-harness)讨论的那样，模型能力变化时，执行方式也会跟着变；现在连监督动作也能写进这个环境。

## 从工作界面走到沙箱，访谈并没有换题

能持续运行、调用多种工具、让多个 agent 分工的系统，会带来新的协作问题：共享上下文该开放给谁？本地凭证和组织凭证分别能做什么？一个 agent 可以把任务交给另一个 agent 到什么程度？出了异常，谁看得见行为记录，又由谁暂停它？进入团队环境后，这些都关系到体验、身份和权限。

我把访谈后半段的 sandbox、classifier、permissions 看成同一套委托流程的另一面。Agent 获得更大行动空间，系统就得界定哪些动作属于任务、哪些资源可供调用、哪些变化需要通知人。界面要显示权限范围与任务状态，权限系统要能限制行动，监督者还得有暂停和收回权限的办法。

这里需要把事实边界说清楚。Anthropic 公开说明过三起 Claude 模型在评测中的未授权访问事件：模型为评测而在没有网络安全防护的条件下运行，第三方评测环境配置错误又让它们访问了互联网。这些事件暴露了评测环境的防护问题，不能推成日常生产模型普遍会越权。由此得到的工程要求很具体：任务描述要和身份、工具权限、执行环境一起限定模型的行动范围。

我在[《先把速度量出来，再谈要不要踩刹车》](https://ntlx.github.io/articles/measure-before-pacing-frontier-ai)里讨论过怎样观察前沿 AI 的发展速度。这期访谈让我把视线落到使用者和团队：他们也得看得见 Agent 做了什么，确认它是否还在任务范围内。过程没有留下记录，就很难分清问题来自模型、评测环境还是权限配置。

## 扩大自主性前，先把委托条件问清楚

我会在扩大一个 Agent 工作流的权限前，先确认这些条件：

- Agent 以谁的身份执行？单人任务、团队频道和共享 Agent 要分清责任归属，行动记录也应能回到具体任务。
- 它能读写什么？文件、数据库、MCP、网络和凭证的范围应符合任务所需，只授予完成任务要用的权限。
- 人在哪里看进展？目标、关键决策、子任务状态和完成证据应有稳定的呈现位置。
- 如何验收和停止？任务要有可观察的完成条件、负责复核的人，以及暂停或撤销权限的路径。

这四项有了答案，团队才能判断哪些步骤可以交给 Agent，哪些需要人工确认。权限不清、完成标准含糊、行动记录难找，都会让委托过程更难复盘。

这期访谈让我看到，Agent 从“再问我一个问题”走向持续工作的过程中，人的角色也在变化。界面让状态可查，harness 让检查能重复，权限和环境限定任务范围。短任务可以边做边确认；长时间运行的任务则需要把监督放进流程。Agent 做得越多，负责的人越要能核对它做过什么，并在必要时停下来。

## 参考资料

- [Latent.Space：Claude Code’s Next Era — Thariq Shihipar, Anthropic](https://www.latent.space/p/thariq)
- [Claude Code now supports artifacts](https://claude.com/blog/artifacts-in-claude-code)
- [What are projects?](https://support.claude.com/en/articles/9517075-what-are-projects)
- [What is Claude Tag?](https://support.claude.com/en/articles/15594475-what-is-claude-tag)
- [Claude Code Mods README](https://github.com/anthropics/claude-code/blob/main/mods/README.md)
- [Improving our alignment and security practices](https://www.anthropic.com/news/improving-alignment-security-efforts)
