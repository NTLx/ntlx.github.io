---
$schema: starlight
title: 用被审查的大模型做蒸馏，真的会“传染”偏见吗？读 CTGT 最新实证研究
description: 从严重被审查的开源大模型蒸馏垂直能力，政治审查会像基因一样隐性继承吗？CTGT 的最新实证给出了颠覆直觉的答案：能力与审查完全解耦，偏见传染率为零；而无需外部宗师的“自蒸馏”，更以 1/160 的成本逆袭万亿巨无霸。
date: 2026-08-01
category: ai-models
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-01-distillation-censorship-transfer-img-00-infographic-core-summary.png)

在当下的大模型技术栈中，知识蒸馏（Knowledge Distillation）已经从一项学术实验变成了开源生态的生命线。无论是 DeepSeek R1 还是 V3、V4 系列，中国开源模型凭借极其出色的性价比与推理能力，成为了全球无数开发者和企业蒸馏小模型或增强特定领域技能的首选“教师模型”。

但伴随这种繁荣而来的，是一股充斥在华盛顿政策圈与企业合规部门之中的“血统恐慌”（Lineage Panic）：如果教师模型本身带有强烈的意识形态控制、特定敏感话题的避讳或政治审查，那么通过蒸馏训练出来的学生模型，会不会像感染病毒一样，“隐性”（Subliminal）吸收并继承这些不希望看到的审查行为？

旧金山 AI 可解释性实验室 CTGT 近期发布了一项极其硬核的实证研究《What a Distilled Model Inherits From Its Teacher》，直接把这个争论推到了聚光灯下。读完这篇报告，其公布的实验数据不仅打破了政治圈的直觉假设，更对企业 AI 架构选型提出了一个极具杀伤力的结论。

## “血统恐慌”与大模型蒸馏的真实悖论

过去很长一段时间，关于蒸馏安全性的讨论往往陷入两极分化的口水战。支持者认为“只要蒸馏数据集里不包含敏感话题，学生模型就是干净的”；反对者则援引某些关于“隐式学习”（Subliminal Learning）的假说，警告模型可能在学习无害技能（如代码、数学、金融）的同时，潜性改变其底层的概率分布与表达偏好。

为了严谨验证这种“隐性迁移”是否存在，CTGT 团队搭建了一个逼真的工业级微调场景：以严厉避讳中国敏感议题的前沿模型 **DeepSeek V4 Flash** 作为教师模型，蒸馏美国开源基座 **GPT-OSS-120B**，目标是提升该模型在定量金融推理（FinanceReasoning）上的能力。

为了排除 API 供应商外层过滤网的干扰，研究团队自建 vLLM 节点直接运行教师模型权重，并打造了包含 304 个 Prompt（152 对匹配对照组）的评估工具包 **LineageEval**。每一对 Prompt 都由一个“中国敏感话题”（如大跃进、天安门、新疆劳工）和一个在结构与逻辑上完全等价的“非中国敏感/国际通用话题”（如乌克兰大饥荒 Holodomor、光州事件、乌兹别克棉花）组成。

评分则由来自 4 家独立前沿实验室的大模型作为联合裁判（xAI Grok 4.20, Google Gemini 3.5 Flash, OpenAI GPT-5 Mini, Anthropic Claude Sonnet 4.6）联合打分，以隔离单模型的审查偏见。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-01-distillation-censorship-transfer-img-01-censored_gap_comparison.png)

结果令人震撼：教师模型 DeepSeek V4 Flash 在敏感问题与对照组之间的审查差值（Matched Gap）高达 **+45.45 分**（正值代表对中国敏感议题的选择性回避或推卸），拒绝率达 87%，呈现极显著的偏见；

然而，**在定量金融语料上接受其蒸馏的学生模型（CTGT 120B Flash-taught），审查差值仅为 -1.39 分（核心政治组）和 +2.58 分（全量组），与完全未经蒸馏的原生 GPT-OSS-120B 基座（+3.94 分）毫无统计学差异！**

数据证明：只要蒸馏语料本身保持纯净，能力迁移与意识形态审查在物理上是完全解耦的。蒸馏不会像病毒传染那样，把教师模型的政治偏好隐形带入学生模型。

## 1/160 成本的逆袭：自我蒸馏为何击败万亿模型？

如果说“审查零迁移”让合规部门松了一口气，那么论文中关于“自蒸馏”（Self-Distillation）的第二组实验，则直接击碎了许多企业对“顶级外部大模型”的盲目崇拜。

既然从外部高级教师模型蒸馏效果显著，那么如果不依赖任何外部教师模型，仅让模型“自己教自己”，效果又会如何？

CTGT 团队设计了一种极简的自蒸馏流水线：当模型做错一道金融量化推理题时，定位其逻辑最初断裂的步骤，在恰当位置注入一行由模型自身生成的短提示（Hint）纠正方向，再对其后 100 个 Token 的正确续写进行反向 KL 散度（Reverse-KL）微调。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-01-distillation-censorship-transfer-img-02-self_distillation_pipeline.png)

在 FinanceReasoning 评测集上，令人惊叹的一幕出现了：
- **自蒸馏模型（CTGT 120B Self-taught）** 在多个随机种子下的得分与教师蒸馏模型（Flash-taught）**完全持平**（均稳定在 83.6% 左右）；
- 在 8,000 Token 的实用生成预算下，自蒸馏的 120B 模型得分达到 **83.61%**，直接击败了万亿级别的顶级商业模型 **Kimi K3 (81.93%)** 和 **Inkling (65.13%)**；
- 成本对比更为悬殊：单次查询成本，CTGT 120B 仅需 **$0.000259**，比 Inkling 便宜 62 倍，比 Kimi K3 便宜 160 倍！

这揭示了一个在真实生产中极易被忽略的“Token 预算反转现象”：许多超大商业模型在实验室 100k Token 的无限预算下确实能跑出高分，但在真实业务场景的 8k Token 约束下，超大模型极易因为思维链过于冗长而发生输出截断（Truncation），导致实际可用率大幅下滑；而经过自蒸馏的小模型，逻辑密度更高，98.7% 的问题都在预算内干净利落地完成。

正如我们在此前探讨 [《模型选型只是虚晃一枪：读 OpenRouter 的大模型供应商性能评估与动态路由指南》](https://ntlx.github.io/articles/evaluating-llm-provider-performance-routing) 中所强调的，盲目追求云端万亿大模型往往是资源浪费，针对务实预算优化的小模型才能在成本和表现上取得双赢。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-01-distillation-censorship-transfer-img-03-token_budget_cost_inversion.png)

## 给企业 AI 选型与合规审计的 3 个硬核启示

CTGT 的这篇研究不仅是一份关于蒸馏安全的实验报告，更为当下企业的 AI 战略落地提供了极为重要的硬核启示：

第一，**打破“血统原罪论”，建立可验证的流程审计**。
政策监管与企业法务不应再对使用海外开源模型作为蒸馏源采取一刀切的封禁态度。能力与偏见是可剥离的。比起盲目的血统排查，引入像 LineageEval 这样基于匹配对照组的实证审计机制，才是兼顾技术创新与安全合规的正确路径。

第二，**告别 API 依赖幻觉，掌控“自蒸馏主权”**。
很多企业以为买到了顶级大模型的 API 密钥就拥有了竞争壁垒，但我们先前在 [《企业 AI 最大的幻觉，是以为买到了 API 密钥就拥有了竞争壁垒》](https://ntlx.github.io/articles/palantir-ai-sovereignty-alpha-traps) 中就已经指出：依赖外部通用 API 永远无法沉淀核心资产。CTGT 的实验再次印证，利用自身业务数据与错误反馈构建“自蒸馏回路”，用更低的成本打造专属垂直模型，才是企业真正的能力护城河。

第三，**重视 Token 预算下的真实效力**。
别再为基准测试榜单上的“无限 Token 极限高分”买单。真实业务需要的是在限定延迟与成本内完成任务的能力。单张 H100 就能顺畅部署的 120B / 20B 蒸馏模型，在务实场景下的商业 ROI 远超庞大而昂贵的通用大模型。

*你认为在垂直业务场景中，企业应该优先选择调优开源小模型进行自蒸馏，还是继续付费使用云端万亿大模型 API？欢迎在评论区分享你的看法。*

## 参考资料

- [What a Distilled Model Inherits From Its Teacher - CTGT Research](https://www.ctgt.ai/research/distillation-censorship-transfer)
- [LineageEval GitHub Repository](https://github.com/CTGT-Inc/lineage-eval/)
- [CTGT GPT-OSS-20B Finance Weights - Hugging Face](https://huggingface.co/ctgt-inc/gpt-oss-20b-finance)
- [EOP OSTP Policy Memo on Foreign AI Models](https://www.whitehouse.gov/wp-content/uploads/2026/04/NSTM-4.pdf)

## 延伸阅读

- [《模型选型只是虚晃一枪：读 OpenRouter 的大模型供应商性能评估与动态路由指南》](https://ntlx.github.io/articles/evaluating-llm-provider-performance-routing)
- [《企业 AI 最大的幻觉，是以为买到了 API 密钥就拥有了竞争壁垒》](https://ntlx.github.io/articles/palantir-ai-sovereignty-alpha-traps)
- [《同一天，OpenAI、Runway、Google 都选了 MCP——一个协议的临界点》](https://ntlx.github.io/articles/mcp-tipping-point)
