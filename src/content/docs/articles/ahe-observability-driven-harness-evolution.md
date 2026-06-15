---
$schema: starlight
title: 给编码 Agent 装上可观测性：AHE 如何让 harness 自己进化
description: 同一模型换个 harness 就判若两人——AHE 的核心洞察是：进化瓶颈不在模型能力，而在可观测性。10 轮迭代把 pass@1 从 69.7% 拉到 77.0%，超越所有人类设计和自进化基线。
date: 2026-06-15
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-15-ahe-observability-driven-harness-evolution-img-00-infographic-core-summary.png)

## 同一个模型，换个 harness 就判若两人

用过 Codex-CLI 和 OpenHands 的人可能有这个体验：底层都是 GPT-4o 或 Claude，但换一个 harness，完成率能差出 20 个百分点。harness——系统提示、工具、中间件、记忆——才是决定 Agent 在长程任务中表现的关键变量。

问题是，人工调 harness 太慢了。人类开发者看轨迹、找失败模式、改提示或加工具，这个循环跑一轮要几天。而且改进分散在多个设计决策里，你很难说清某次 pass\@1 提升到底来自新加的工具还是改了的提示。

这篇论文提出了一个更激进的想法：让另一个 Agent 来自动进化 harness。不是只改提示，而是联合进化全部 7 种组件类型。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-15-ahe-observability-driven-harness-evolution-img-01-observability_bottleneck_thesis.png)

## 可观测性瓶颈论：进化 Agent 缺的不是能力，是信息

大多数自进化方法只优化提示——Reflexion 改语言反馈、ACE 改 playbook、TF-GRPO 做策略优化。但 AHE 发现了一个更根本的问题：进化 Agent 做不好，不是因为它不够聪明，而是因为它看不清自己在改什么。

想象你是一个进化 Agent，面前是百万 token 的原始轨迹日志，你要从中找出失败根因并修改 harness。这就像让一个外科医生在没有 CT 的情况下做手术——他可能很优秀，但看不到病灶在哪。

AHE 的核心洞察是：瓶颈在可观测性。一旦进化 Agent 获得结构化的上下文——每个失败模式映射到单一组件类型、轨迹蒸馏为分层证据、每次编辑附带可证伪的预测——它就能稳定收敛到更好的设计。

这不是"给 Agent 更好的提示"，而是"给 Agent 更好的眼睛"。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-15-ahe-observability-driven-harness-evolution-img-02-three_observability_pillars.png)

## 三根支柱：把每次编辑变成可证伪的契约

AHE 的架构围绕三根可观测性支柱搭建。

**组件可观测性**：基于 NexAU 框架，7 种正交组件类型（系统提示、工具描述、工具实现、中间件、技能、子 Agent、长期记忆）暴露为显式文件。每个失败模式映射到单一组件类，每次编辑就是一个 git commit，支持文件级 diff 和回滚。seed harness 刻意极简——只有一个 bash 工具，没有中间件，没有技能，没有记忆——这样每个组件都必须靠实测数据赢得自己的位置。

**经验可观测性**：百万 token 的原始轨迹被 Agent Debugger 蒸馏为分层证据语料——per-task 分析报告、benchmark 级概览、原始轨迹文件。进化 Agent 不用啃日志，而是读结构化的根因分析。

**决策可观测性**：每次编辑附带一个"变更清单"，包含自声明的预测（预期修复了什么、可能引入什么回归）。下一轮的任务级结果验证每个预测；被证伪的编辑在文件级粒度回滚。每次编辑都是一个可证伪的契约。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-15-ahe-observability-driven-harness-evolution-img-03-nexau_decoupled_components.png)

## 最反直觉的发现：系统提示是负资产

10 轮 AHE 迭代将 Terminal-Bench 2 的 pass\@1 从 69.7% 拉到 77.0%。但真正有意思的不是这个数字，而是消融实验揭示的增益分布。

长期记忆单独贡献 +5.6pp——这是最大的单项增益。工具 +3.3pp，中间件 +2.2pp。这三个组件各自独立就能带来提升。

系统提示单独使用：-2.3pp。退化了。

这意味着什么？AHE 进化出的系统提示文本，单独拿出来反而有害。它和工具、中间件、记忆形成了某种协同——离开了结构化组件的支撑，提示文本本身不携带可迁移的工程经验。

跨模型迁移实验进一步证实了这一点。冻结的 AHE harness 不做任何修改直接迁移到 DeepSeek-v4（+10.1pp）、Qwen-3.6（+6.3pp）、Gemini-3.1（+5.1pp）。弱模型获益更大——它们更依赖 harness 编码的协调模式。

而 ACE 和 TF-GRPO 的提示在跨 benchmark 迁移时反而退化到 seed 以下。文本级策略不可迁移，结构化组件可以。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-15-ahe-observability-driven-harness-evolution-img-04-component_ablation_results.png)

## 回归盲区：Agent 不知道自己会搞砸什么

AHE 的决策可观测性有一个致命弱点。修复预测的精度达到 33.7%（约 5 倍随机基线），但回归预测的精度只有 11.8%（仅 2 倍随机基线）。

进化 Agent 能解释为什么一个编辑有助于修复，但无法可靠预测它会破坏什么。这导致进化曲线是非单调的——有些轮次进步，有些轮次退步，回滚机制救场但效率打折。

这可能是整个自进化范式最需要突破的方向。一个不知道自己会搞砸什么的进化 Agent，就像一个只会加速不会刹车的车——能跑，但不可控。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-15-ahe-observability-driven-harness-evolution-img-05-regression_blindness_precision.png)

## 我的判断

这篇论文最锋利的地方不是"AHE 超越了 Codex-CLI"——这种数字对比每年都有。锋利的是它回答了一个结构性问题：harness 的什么部分能迁移，什么部分不能？

答案是：工具、中间件、记忆这些结构化组件能迁移；系统提示文本不能。这和我自己的经验吻合——我换过很多次 Claude 的系统提示，每次迁移都要重新调。但工具定义和中间件逻辑换到新模型上基本能跑。

另一个值得深思的点是"可观测性瓶颈论"。它暗示了一个更大的图景：AI Agent 的进步可能不再主要依赖更大的模型或更多的数据，而是依赖更好的观测基础设施。就像软件工程从"写代码"进化到"可观测的分布式系统"一样，Agent 工程可能正在经历类似的成熟过程。

*你在用什么 harness 跑编码 Agent？你觉得 harness 的哪个部分对你最重要——提示、工具、还是记忆？*

## 原文参考

> Jiahang Lin, Shichun Liu, Chengjun Pan et al., "Agentic Harness Engineering: Observability-Driven Automatic Evolution of Coding-Agent Harnesses", arXiv:2604.25850v1, 2026-04-28
> <https://arxiv.org/abs/2604.25850>
