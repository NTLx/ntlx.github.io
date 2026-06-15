---
$schema: starlight
title: RL 不再只是对齐工具：Agentic RL 正在重新定义 LLM 的可能性边界
description: 当 RL 从单步打分变成多步决策循环，LLM 就不再是文本生成器——它变成了能规划、会推理、懂记忆的自主智能体。这篇综述用 500+ 篇论文画出了这个新世界的地图。
date: 2026-06-15
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-15-agentic-rl-llm-survey-paradigm-shift-img-00-infographic-core-summary.png)

## 一个公式定义了两个时代

大多数 LLM 研究者对"强化学习"的理解停留在 RLHF：给一段生成的文本打个分，然后用 PPO 或 DPO 调整模型参数。这在数学上是一个退化的单步 MDP——时间步 T=1，折扣因子 γ=1，状态转换是确定性的，奖励是固定提示上的标量值。

这篇综述说：这个公式已经过时了。

Agentic RL 的形式化定义是 POMDP——部分可观察的马尔可夫决策过程。智能体在每个时间步接收部分观察 o\_t = O(s\_t)，环境状态动态转换 P(s\_{t+1}|s\_t, a\_t)，动作空间从纯文本扩展到文本 ∪ 工具/环境操作，奖励从单步标量变成逐步累积的折扣回报。

这个数学区别听起来枯燥，但它意味着一件事：RL 不再是训练完就固定的对齐层，而是嵌入到智能体与环境交互循环中的实时学习机制。模型不再是"生成完就结束"，而是"行动、观察、再行动"。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-15-agentic-rl-llm-survey-paradigm-shift-img-01-mdp_vs_pomdp_formalization.png)

## RL 从对齐工具变成能力引擎

2023 年的主流范式是 RLHF：人类标注偏好数据，PPO 优化策略。2025 年初，DeepSeek-R1 用纯 RL（GRPO 算法）训练 LLM 发展推理能力，无需任何监督数据——这已经是范式转移的信号。

但这还不是 Agentic RL。RLHF 和 GRPO 仍然把 LLM 当作条件生成器：给定 prompt，生成回答，打分，更新。状态空间是静态的，没有环境交互。

Agentic RL 把这层窗户纸捅破了。综述梳理了 25+ 种算法变体（PPO、DPO、GRPO 及其扩展），但核心区别不在算法本身，而在问题建模：RL 是在训练一个"在环境中持续行动的策略"，还是在优化一个"对单条 prompt 输出最高分回答的生成器"？

答案是前者。这改变了 RL 的每一个组件——状态是什么、动作是什么、奖励怎么设计、策略怎么更新。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-15-agentic-rl-llm-survey-paradigm-shift-img-02-rlhf_to_agentic_rl_evolution.png)

## 六大能力：RL 把什么从静态变成自适应

综述提出了双重分类法：能力维度 × 任务维度。能力维度包括六项——规划、工具使用、记忆、推理、自我改进、感知。每一项都有一条从"静态启发式模块"到"RL 驱动的自适应行为"的演化路径。

**规划**：早期用 MCTS 做外部搜索引导（RL 作为价值函数评估器），现在转向直接用 RL 优化规划策略本身——模型学会生成和评估自己的计划。

**工具使用**：从模仿 ReAct 的固定工具调用模式，转向结果驱动的自适应选择。Agent 学会在不同情境下选择不同工具、组合多个工具、从工具调用失败中恢复。

**记忆**：从被动的 RAG 检索存储，变成 RL 控制的记忆子系统——决定存什么、检索什么、遗忘什么。MEM1 等工作用 RL 优化记忆与推理的协同。

**推理**：快推理（直觉式 System 1）和慢推理（深思熟虑的 System 2 CoT）都在被 RL 重塑。综述特别指出，约 2/3 的数学 RL 研究侧重 pass\@1 提升（快推理），约 1/3 关注 pass\@k 拓展（探索慢推理的边界）。

**自我改进**：从提示级别的语言自我纠正，到梯度级别的内化自我纠正，再到 Absolute Zero 式的迭代自训练——模型在自我博弈中持续进化。

**感知**：从被动接收图像/视频，到主动视觉认知——通过定位、工具调用、生成来驱动感知行为。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-15-agentic-rl-llm-survey-paradigm-shift-img-03-six_capabilities_matrix.png)

## 500 篇论文的全景：任务维度

能力是抽象的，任务是具体的。综述在任务维度梳理了 8 大领域：搜索与研究 Agent、代码 Agent、数学 Agent、GUI Agent、视觉 Agent、具身 Agent、多智能体系统、以及其他（文本游戏、表格、时序、社交等）。

几个让我印象深刻的数字：OpenAI Deep Research 在 BrowseComp 上达到 51.5% pass\@1——这是深度研究能力的硬指标。SkyRL-SQL-7B 仅用 653 个训练样本就超越了 GPT-4o 和 o4-mini 在 Text-to-SQL 上的表现——小模型 + 精准 RL 的组合威力惊人。Qwen3-Coder 在 20,000 个并行环境中训练——规模化 RL 训练的工程实践已经相当成熟。

代码 Agent 领域的演化路径最清晰：从代码生成（outcome reward RL）→ 迭代代码修复（process reward RL）→ 自动化软件工程（SWE-bench 级别的端到端任务）。SWE-rebench 管线已经收集了超过 21,000 个任务用于训练和评估。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-15-agentic-rl-llm-survey-paradigm-shift-img-04-task_domain_landscape.png)

## 最诚实的问题：RL 到底在放大还是在创造

综述第 6.4 节的"机制争论"最值得停下来想。两种对立观点：

**放大器视角**：RL 只是在重新分配概率质量——把模型已经"知道"但不常输出的能力激活出来。这解释了为什么 RLHF 和 GRPO 能快速提升性能：模型参数里已经有这些知识，RL 只是调整了采样分布。

**新知识视角**：在特定条件下（高保真奖励、组合结构、中等难度的基础模型），RL 可以安装质性上全新的计算能力。DeepSeek-R1 的纯 RL 推理可能就是例证——模型从没被显式教过链式推理，但 RL 让它"发明"了这种能力。

综述没有给出定论，但提出了一个判断框架：放大 vs 创造可能不是二选一，而是取决于任务复杂度、奖励精度和基础模型能力三者的交互。

六个开放挑战中，我最关注的是"训练扩展"和"环境扩展"。更长的 horizon 提升准确率但指数级增加计算成本；从静态基准到共演化环境需要全新的奖励设计方法。这些问题不解决，Agentic RL 就只能停留在实验室。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-15-agentic-rl-llm-survey-paradigm-shift-img-05-open_challenges_mechanism_debate.png)

## 我的判断

这篇综述最大的价值不是它覆盖了多少论文，而是它把"Agentic RL"从一个模糊的流行词变成了一个有精确定义的研究领域。MDP vs POMDP 的形式化区别看似学术，但它回答了一个关键问题：为什么 RLHF 不等于 Agentic RL？因为前者是单步优化，后者是序列决策。

让我在意的是：综述对"多智能体系统"的覆盖偏薄——只有 4.7 一个子节。多个 RL 训练的智能体协作、竞争、通信时，复杂度会爆炸。这可能是下一个大前沿。

另外，"评估污染"（第 6.6.5 节）是一个被严重低估的风险。当训练数据和评测基准越来越重叠，我们怎么知道 Agent 真的变强了，而不是在过拟合测试集？

*你在用 RL 训练 Agent 吗？你觉得"放大器"和"新知识"两种视角，哪个更接近你观察到的现实？*

## 原文参考

> Guibin Zhang, Hejia Geng, Xiaohang Yu et al., "The Landscape of Agentic Reinforcement Learning for LLMs: A Survey", arXiv:2509.02547v5, TMLR 2026
> <https://arxiv.org/abs/2509.02547>
