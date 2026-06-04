---
$schema: starlight
title: Agentic Engineering 的悖论：机器越能干，人越停不下来
description: Agent 让执行近乎无限，却没有替人决定什么值得做；真正稀缺的不是编码能力，而是审查、边界和停止能力。
date: 2026-06-04
category: ai-coding
tags: [ "Agentic Engineering", "Claude Code", "工作方式" ]
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-04-agentic-engineering-img-00-infographic-core-summary.png)

Matt Van Horn 在《Every Agentic Engineering Hack I Know》里写了一句很诚实的话：Agent 本来应该替我们工作，可他的朋友们却比过去任何时候都更努力。

读到这里，我才明白前面 20 条效率技巧在共同做什么。

把新终端直接变成 Claude 或 Codex；用语音扔进一个念头；同时开 4 到 6 个会话；在手机上远程控制；甚至发一封邮件，就让新 Agent 开始干活。这些做法都在消灭同一种东西：启动工作的摩擦。

摩擦少了，产出当然更多。问题是，人也失去了原先用来判断“这事值得做吗”的几秒钟。

## `plan.md` 是控制面，不是免责书

原文里我最想照抄的习惯，是非一行修改都先做 `plan.md`。

这不是迷信长文档。一个好计划会写下目标、相关文件、既有约定和验收标准。会话上下文爆掉，换一个 Agent 仍能继续；执行中跑偏，也有东西可以对照。它把人脑里转瞬即逝的意图，变成机器可继承的控制面。

Compound Engineering 官方流程也不是“计划完就冲”，而是计划、执行、审查、沉淀，再进入下一轮。执行变快后，计划和审查理应占更多时间。

可原文紧接着说：永远创建计划，几乎不要读计划。“计划是 Agent 的缰绳。”

等等。缰绳如果没人握，还是缰绳吗？

人不必逐字审查 300 行 Markdown，也不该重新做一遍 Agent 的研究。但目标是否正确、风险边界在哪里、验收条件是否真的代表“完成”，不能只看一段 TLDR 就点头。这不是效率洁癖，而是责任还在谁手里的问题。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-04-agentic-engineering-img-01-plan-control-loop.png)

## 当等待被消灭，任务就没有上限

作者的工作台很诱人：一个会话在研究，另一个在执行，第三个处理 bug。人只需在几个窗口之间轮转，永远不会闲着。

这种感觉为什么像他所说的“史上最好玩的电子游戏”？因为每次切回窗口，都可能得到一个完成提示、一段新代码或一个能继续追问的结果。反馈快，奖励密，下一局只需一个念头。

UC Berkeley 团队在一家科技公司观察了八个月，看到的正是这种节奏：员工主动接下以前不会做的事，工作渗进午餐和晚间，还同时维持多个 AI 线程。没人要求他们加班，能力扩张本身就推着任务扩张。

不过，AI 并不注定让人更累。另一项覆盖 66 家公司、7,137 名员工的随机实验发现，频繁使用 Copilot 的人每周少花约 3.6 小时处理邮件。工具确实省出了时间。

差别在于，这段时间最后去了哪里。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-04-agentic-engineering-img-02-capacity-allocation.png)

## 真正稀缺的是“不启动”

原文最不能照抄的一条，是在个人电脑上开启 `bypassPermissions`，再用“坏了有 GitHub”安慰自己。

Claude Code 官方文档写得很直白：这个模式关闭权限提示和安全检查，只应放在不能伤害宿主机的隔离容器或虚拟机里。Git 能恢复被跟踪的代码，恢复不了泄露的密钥、已经发出的邮件和写进生产数据库的数据。

这件事和工作强度其实是同一个问题。权限提示、安全审查、打开终端前的一点犹豫，看起来都在拖慢执行；它们也在逼人回答：要不要做，做到哪一步，什么动作不可逆。

Agentic Engineering 常把人的价值描述成“品味”和“方向”。我觉得还少了一项：停止。不是在 Agent 做完以后挑一个更好看的版本，而是在启动前删掉不值得做的任务，在执行中保住边界，在结果足够好时结束循环。

机器越能干，这个能力越贵。

## 给 Agent 一条能停下来的缰绳

我会采用作者的计划文件、可复用 Skill 和跨会话检查点，也会给它们补上原文较少谈的四件事：

* 计划开头由人写清“为什么做”和“不做什么”；
* 高风险动作进入沙箱，并设置不可绕过的 deny 规则；
* 并行任务设上限，非紧急结果批量查看；
* 验收标准里加入停止条件，而不是完成后自动寻找下一件事。

原文展示了怎样让 Agent 永不疲倦。真正成熟的工作流，还得让人不必陪它永不停止。

*当 AI 为你省出一小时，你更常把它换成什么：更重要的工作、更多工作，还是休息？*

## 原文参考

> Matt Van Horn, Every Agentic Engineering Hack I Know (June 2026)\
> <https://x.com/mvanhorn/status/2061877533885473181>

> Compound Engineering official repository\
> <https://github.com/EveryInc/compound-engineering-plugin>

> Claude Code Docs, Choose a permission mode\
> <https://code.claude.com/docs/en/permission-modes>

> UC Berkeley Haas, AI promised to free up workers' time. Researchers found the opposite\
> <https://www.universityofcalifornia.edu/news/ai-promised-free-workers-time-uc-berkeley-haas-researchers-found-opposite>

> Dillon et al., Shifting Work Patterns with Generative AI\
> <https://arxiv.org/html/2504.11436v3>
