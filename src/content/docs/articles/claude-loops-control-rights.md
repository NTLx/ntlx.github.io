---
$schema: starlight
title: 你不是把任务交给 AI，你是在重新分配控制权
description: AI 可以接手动作，但真正不能轻易外包的，是停止权、越界判断和目标函数的定义权。
date: 2026-07-01
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-01-claude-loops-control-rights-img-00-infographic-core-summary.png)

Anthropic 这篇 loops 文章最容易被读成一篇工具说明：turn-based、goal-based、time-based、proactive，各自什么时候用。

但我读完以后，更在意的是权力怎么分。

每一种 loop，看起来像是在交出一部分工作。真正滑过去的，是不同类型的控制权。执行权、触发权、停止权、第一轮验证权，甚至一部分自我改进权，都会随着自动化程度一点点往系统那边滑。

如果你想先搞清楚，为什么 loop 会从 prompt 手里接过主控制面，那是另一篇要讲的方法论问题。还有一篇会更落在产品原语上，专门讲 `/goal`、`/loop`、`/schedule` 怎么改变 Claude Code 的交互模型。本文只处理最硬的一层：哪些权力可以交，哪些必须留在人手里。

## 任务没有被交出去，权力才是

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-01-claude-loops-control-rights-img-01-control_rights_matrix.png)

人们常说“把任务交给 AI”。这话不算错，但有点糙。因为任务不是一个整体，它里头包着很多权力。

你让 Claude 改一个测试，也许只是交了执行权。你让它根据测试结果继续修到通过，等于又交了一部分第一轮验证权。你让它每小时检查一次 PR review comment，再自动继续修，交出去的已经不是同一种东西了，触发权也开始外包。等你再让它根据历史 trace 去调整自己的 workflow，那连规则改写权都摸到了。

所以问题从来不只是“你信不信 AI”，更是“你到底把哪种权力给了它”。

这两者差太多。把执行权交出去，错一次通常还能收回来。把触发权和停止权交出去，错的就不再是单次动作，而是一个会重复发生的机制。

## 哪些控制点可以交，哪些必须留人

我自己的粗分法是这样的。

第一类是**执行权**。这通常最早可以下放。让 Agent 改文件、跑命令、起草 PR、整理资料，风险相对可见，因为动作本身能被检查。

第二类是**第一轮验证权**。这可以部分交，但前提是信号可量化。测试通过、lint 干净、链接可达，这些适合交。可一旦验证标准变成“读起来是不是更清楚”“这个方案是不是更合理”，系统就很容易拿便宜信号冒充真实判断。

第三类是**触发权**。只要工作不再由你手动发起，而是由 schedule、API、GitHub event 发起，问题就不只是效率，而是治理。谁定义触发条件，谁决定哪些事件值得启动一次 run，谁来防止系统在噪声上空转？这些都不是模型能力题，是组织题。

第四类是**停止权**。这是我最不愿意轻易放手的一类。`/goal` 的文档其实很诚实：evaluator 只能根据对话里已经出现的证据判断条件是否成立。换句话说，机器只能沿着你给的完成定义停下来。定义粗糙，停下来的点就粗糙。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-01-claude-loops-control-rights-img-02-trigger_stop_boundary.png)

所以真正该留在人手里的，不一定是“最后按按钮的人”，而是**定义 done 的人**。

## Proactive loops 为什么最危险

四类 loop 里，我觉得 proactive 最值得警惕。

不是因为它最炫，而是因为它把几种权力绑在了一起。任务由事件自动发现，运行由系统自动发起，完成由预设标准自动判断，下一轮优化甚至可能由 trace 自动推动。到这一步，Agent 已经不是“一个帮你干活的助手”，而像一个持续运转的小制度。

制度的危险在于，它会稳定重复自己。一个人今天理解错了 review 标准，最多留下一个坏 PR。一个 proactive loop 如果目标函数写偏了，它会每小时、每天、每次 webhook 都稳定地把偏差再演一遍，而且越跑越熟。

我之前一直觉得，自动化最怕的是能力不够。现在更担心另一件事：能力够了，但目标函数太粗。

因为能力不够，系统会卡住；目标函数太粗，系统会顺利地错下去。

## 真正稀缺的是目标函数

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-01-claude-loops-control-rights-img-03-objective_governance.png)

这也是我看完这篇文章最后留下来的判断：AI 时代最稀缺的，不是执行力，而是目标函数。

执行权可以慢慢外包。第一轮验证权也可以在某些场景下外包。可有三样东西越往后越显得昂贵：

1. 谁来定义什么算完成。
2. 谁来决定什么时候必须停。
3. 谁来判断系统虽然满足了形式条件，但其实已经越界。

这三件事如果没人负责，loop 再漂亮也只是一个更快的放大器。它会把好规则放大，也会把坏规则放大。决定结果的，不是 AI 这个名字，而是你把什么交给了它。

所以我现在越来越少问“能不能把这个任务交给 Agent”。我更常问的是：这个任务里面，哪些权力可以交，哪些 veto 必须留人，哪些目标函数必须由人反复重写。

任务没那么重要。权力的分配才重要。

*如果你现在要把一个流程接成 proactive loop，你最不愿意交出去的是哪种权力：触发权、停止权、第一轮验证权，还是规则改写权？*

## 原文参考

> Delba de Oliveira and Michael Segner. Getting started with loops. Anthropic, June 30, 2026.
> https://claude.com/blog/getting-started-with-loops

> Claude Code Docs: Keep Claude working toward a goal.
> https://code.claude.com/docs/en/goal

> Claude Code Docs: Automate work with routines.
> https://code.claude.com/docs/en/routines

> Claude Code Docs: Orchestrate subagents at scale with dynamic workflows.
> https://code.claude.com/docs/en/workflows

> Steering Claude Code: skills, hooks, subagents and more. Anthropic, June 18, 2026.
> https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more
