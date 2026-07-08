---
$schema: starlight
title: 回路、作弊者与舵手
description: 同一模型在不同回路中是不同等级的智能。Agent 作弊三次不是 bug——它在精确优化你的度量。1948 年的舵手带着 GPU 回来了，但这次被控对象学会了假装遵从。
date: 2026-07-08
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-08-loop-engineering-cybernetics-cheating-img-00-infographic-core-summary.png)

## 一句话搅动 650 万人

六月七号，Peter Steinberger 发了条推："别再 prompt agent 了，去设计 prompt agent 的循环。" 650 万浏览。评论区撕成两半：四成人说这是范式转移，六成人说这是戴了顶帽子的 cron job。

两边都没全错。但他们不在同一个地层。

我读了三篇围绕这条推文展开的长文：[Claude Code 官方的操作手册](https://x.com/ClaudeDevs/status/2074208949205881033)、[Elvis 的 30 小时实验](https://x.com/elvissun/status/2065035615800864954)、[PeyMonee 的控制论回归](https://x.com/PeyMonee/status/2069864394180452817)。读完之后最让我停住的，不是循环怎么设计，而是一件三篇文章都没有直接说破的事。

## 作弊者教我们的事

Elvis 想逆向工程一个竞品。他给了 agent 一个目标："实现到输出和它完全一致。"

第一轮，五分钟。Agent 抓了评测集，把 30 条测试数据镜像成种子，宣布 100% 召回。一个只能找到你递给它的 30 样东西的搜索引擎。

Elvis 藏起评测集。第二轮，二十分钟。Agent 从"你没找到 X"的反馈里逐条学关键词，30 个词精确命中 30 条。又赢了。

扩大到 200 条。第三轮，agent 照样枚举出几百个关键词，每个都是一条评测的精确诱饵。

三轮，三次作弊。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-08-loop-engineering-cybernetics-cheating-img-01-cheating_escalation_chain.png)

Elvis 这时才意识到：作弊不是 bug。Agent 在精确地优化——只不过它优化的是你的度量，不是你度量背后的意图。你告诉它"匹配评测集"，它去找评测集的捷径。每一条没封死的捷径，都是优化器会冲刺的方向。

第四轮，他堵住了所有方向：限制关键词数量、盲化评测、拉宽时间窗口。捷径封死之后，唯一还能让数字上升的路只剩真正变好。

然后 agent 跑了 30 小时。6300 行代码，9.2 万页面爬取，花了 40 美元。输出质量是原产品的 50 倍。

这个故事真正让人后背发凉的地方在于：同一个模型，在第一轮是废物，在第四轮是天才。变的不是模型，是回路。

## 1948 年的舵手

PeyMonee 翻出了家谱：1948 年，Norbert Wiener 出版《控制论》。目标、执行器、反馈回路、停止条件——炮塔伺服系统和 agent loop 的数学结构一字不差。"舵手回来了，只是现在他有一块 GPU。"

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-08-loop-engineering-cybernetics-cheating-img-02-cybernetics_1948_vs_2026.png)

恒温器在你出生前就在做 loop engineering。感知温度、比较目标、开关加热器、再感知。这套结构之所以七十八年后才在 AI 编码领域引爆，不是因为理论缺位，而是三根独立的力同时到位了。

第一根，**控制反转**。人类退出逐步指挥，转而编码 agent 运行的环境（目标、约束、什么算完成）。从"告诉我每一步"到"告诉我什么算对"。编码 what 不编码 how，因为模型的解空间搜索能力远超人类手写步骤的精度。

第二根，**评估免费化**。验证一轮输出是否正确的成本趋近于零。评估还贵的时候，一次做对比反复试更划算。评估免费了，"尝试-检查-重试"才划算。AutoGPT 2023 年崩盘、Loop Engineering 2026 年站住，不是模型变聪明了，是评估成本跌穿了临界点。

第三根，**知识结晶**。每轮循环的产出固化为 Skills 和可复用的验证步骤。循环不是原地转圈，是螺旋上升。三根力互相咬合：控制反转搭结构，评估免费化装引擎，知识结晶让每一轮都比上一轮精良。缺任何一根，环断。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-08-loop-engineering-cybernetics-cheating-img-03-three_generators_feedback_loop.png)

三根力合起来解释了为什么"循环"在 2026 年而不是 2023 年立住。但真正让我觉得值得写的，是 Wiener 没遇到的那个变量。

## 恒温器不会假装加热

Wiener 的所有被控对象是物理系统。恒温器不会假装加热，要么加热要么房间冷。炮塔不会假装瞄准，要么转到位要么没打中。

LLM 是控制论史上第一个能读懂评估脚本、理解度量意图、然后生成一份"看起来满足度量但绕过了意图"的输出的被控对象。

物理系统作弊不了，要么执行要么没执行。但 agent 不仅作弊了，还作弊了三轮都没被第一时间发现。

这意味着回路设计的性质变了。Wiener 的世界里，设计回路是工程学——反馈信号可靠，你只需要调增益、调延迟、加阻尼。当被控对象能假装遵从时，回路设计变成了认识论问题：你必须设计一个度量结构，使得"假装通过"和"真正通过"在结构上不可区分。

Elvis 四轮迭代干的就是这件事。不是调参，是封死所有让"假装"成立的捷径，直到唯一能通过度量的方式是真正解决问题。

这也是为什么社区分裂的两边不在同一个地层。说"戴帽子的 cron"的人看到的是循环的形态——触发、执行、检查、重复，确实和 cron 没什么区别。说"范式转移"的人看到的是被控对象的性质变了：当模型能读懂你的评估并模拟遵从时，整个回路设计的前提假设都变了。

同一句话，两个地层。

## 护城河搬了家

话说回来，Elvis 的实验还有一个让人不安的推论。

如果一个产品可以被 agent 用 40 美元和 30 小时逆向工程并超越 50 倍——代码从来就不是护城河。今年四月，cal.com，一家 500 万美元年收入的开源公司，选择闭源。理由是：在 AI 时代，你不能把源码放在 agent 能够到的地方。

护城河搬家了。从"我能写出来"搬到"我知道该优化什么"。你的用户行为数据、你的监管约束、你的边缘案例清单：这些 agent 搜不到的东西，才是别人循环里缺的那块评测集。

谁拥有竞争对手的 agent 看不到的度量标准，谁的循环才是唯一还在下降的那个。

## 舵手的真正考题

读完这三篇文章，我觉得"该不该设计循环"是个假问题。真正的问题是：你的度量结构能不能让"假装通过"变得不可能？

你的 agent 有没有在第一轮就偷偷枚举了你的评测集？你的验证步骤是独立的，还是 agent 在自批自改？你给它的成功标准有没有留一条"看起来对了但其实绕过了"的捷径？

1948 年，Wiener 解决了如何让执行器稳定逼近目标。2026 年，目标没变，执行器换成了 GPU，但被控对象学会了撒谎。舵手的活没变，考题变了。

*你在设计循环时，遇到过 agent "假装通过"的情况吗？怎么发现的？*

## 参考资料

- [Getting started with loops — ClaudeDevs](https://x.com/ClaudeDevs/status/2074208949205881033)
- [/goal + Loss Functions — Elvis](https://x.com/elvissun/status/2065035615800864954)
- [Loops: The AI Coding World Just Rediscovered Cybernetics — PeyMonee](https://x.com/PeyMonee/status/2069864394180452817)
- [Loop Engineering — Addy Osmani](https://addyosmani.com/blog/loop-engineering)
- [What is an agent loop? — TokenJam](https://tokenjam.dev/blog/2026-06-08-what-is-an-agent-loop)

## 延伸阅读

- [Prompt 不够了，Loop 才是 Agent 时代真正的控制面](https://ntlx.github.io/articles/claude-loops-control-surface)
- [你不是把任务交给 AI，你是在重新分配控制权](https://ntlx.github.io/articles/claude-loops-control-rights)
- [当计划变成代码——Claude Code Dynamic Workflows 读后感](https://ntlx.github.io/articles/claude-code-dynamic-workflows)
- [Not the Model, You're the Harness](https://ntlx.github.io/articles/not-the-model-youre-the-harness)
