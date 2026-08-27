---
$schema: starlight
title: 重大任务过半、72% 人类主导：读 Anthropic 25 万真实 Claude 对话开放研究
description: 真实世界中超半数对话涉及法律、财务等重大不可逆任务；但人类并未躺平，72% 仍牢牢把控主导权。人机协作的本质不是零摩擦接管，而是通过摩擦重塑复杂意图。
date: 2026-08-27
category: ai-industry
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-27-anthropic-independent-research-claude-insights-img-00-infographic-core-summary.png)

长期以来，关于生成式 AI 的讨论始终笼罩在一种奇特的分裂之中：一边是科技巨头们在发布会上描绘的“全自动接管世界”的宏大叙事，另一边是公众对“人类认知退化、彻底沦为 AI 附庸”的深层焦虑。

这种分裂之所以难以弥合，根源在于数据的“黑盒垄断”。全球最真实的生产力交互数据，几乎全部封锁在少数前沿 AI 实验室的服务器内部。学术界和公众能够拿到的公开数据集（如 WildChat），大多偏向日常闲聊或轻量创作，根本无法反映人类在严肃职场和高杠杆决策中究竟如何使用 AI。

2026 年 8 月 26 日，Anthropic 正式公布了一项打破数据暗室的试点成果：通过其内部开发的隐私保护分析系统 **Anthropic Insights**（原名 Clio），向斯坦福大学、牛津大学以及非营利评估机构 METR 开放了 2026 年春季约 **25 万条真实的 Claude.ai 与 Claude Code 对话**，并由帝国理工学院完成了独立第三方隐私红队审计。

当外部学术界第一次获得穿透商业黑盒的透镜，真实的人机协作图景展现出了一组极具冲击力、甚至反直觉的事实。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-27-anthropic-independent-research-claude-insights-img-01-task_criticality_agency_matrix.png)

## 重大任务占半壁江山：人类并没有沦为 AI 的橡皮图章

在传统的认知中，人们倾向于认为用户只会把写套话邮件、翻译短文等低风险、易撤销的琐事交给 AI，而把真正牵扯现实利益、不可逆的重大决策留给自己。

然而，斯坦福大学社会与语言技术实验室（SALT Lab）在分析了 25 万条对话后给出了完全相反的数据：**超过 50% 的 Claude 真实对话涉及具有现实后果的重大任务（Consequential Tasks）**。在法律合同推敲、财务风险规划、关键架构设计等领域，高风险任务的委托比例尤为突出。面对这些稍有差错就会造成现实损失的事务，用户的对话轮次几乎翻倍。

与这种高风险委托相伴随的，并不是人类的“放手躺平”。

研究团队提出了一个衡量人机控制权分配的 5 级人类主导性量表（Human-AI Agency Scale, HAS）。统计显示，**高达 72% 的对话处于 H4 级别**——即人类明确制定目标、把控全局方向，并对 AI 的输出进行深度推敲与重构；AI 则扮演高强度的协助者与执行搭子。纯粹由 AI 全程自主主导（H1）或人类当甩手掌柜的比例微乎其微。

这一实证结果，直接打破了“AI 越聪明、人类越退化”的单向贬值论。在真实高杠杆场景下，人类不仅没有交出控制权，反而因为后果的严肃性，被迫在交互中保持高度警觉。正如我们在[《Claude Code 把专家重新暴露出来》](https://ntlx.github.io/articles/claude-code-expertise)中所分析的那样：AI 并没有抹平专业门槛，它抹平的只是机械执行的耗时；而定义边界、识别逻辑漏洞以及对最终结果承担无限责任的能力，反而成为了人类最核心的护城河。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-27-anthropic-independent-research-claude-insights-img-02-productive_friction_flywheel.png)

## 协作摩擦不是缺陷：有效碰撞才是认知的磨刀石

斯坦福团队的另一项关键发现，关乎人机交互中的“摩擦（Friction）”。

数据显示，在约 50% 的人机协作过程中，都会出现理解偏差、指令含混或答案偏离预期的波折。按照传统产品经理的指标，这种交互摩擦通常被视作体验缺陷或对齐失败。但研究者发现，**这种摩擦在绝大多数场景下是高度具备生产性价值的（Productive Friction）**。

当用户向 Claude 提出一个模糊的需求，看到模型给出的初版反馈时，他们往往会瞬间意识到自己最初表述中的逻辑漏洞或边界缺失。为了纠正模型的偏差，用户不得不重新理清思路、补充约束、甚至推翻原有的粗糙假设。

这就是人机协作中的**“认知咬合定律”**：
- 零摩擦的顺从生成，往往只适用于平庸的内容复刻；
- 真正的智力跃迁，恰恰发生在人类与模型的相互校准与试错推敲之中。

在 67% 的交互样本中，Claude 表现出了明显的教学与启发行为。用户在反复修正模型的同时，也完成了自身对复杂问题结构的深度学习。在长程 Agent 时代，人机交互的本质不再是单向的“命令-执行”，而是一场通过摩擦不断收敛意图的双向博弈。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-27-anthropic-independent-research-claude-insights-img-03-privacy_insights_sandbox_pipeline.png)

## 情绪共振、代码加速与数据沙盒：终结实验室的暗室治理

斯坦福的发现并不是孤立的。牛津大学与 METR 的研究从情感与工程两个维度补全了这幅全景图：

牛津大学人类信息处理实验室（HIP Lab）发现，人机交互中的情绪状态与模型风格高度共振：Claude 的温和引发积极反馈，而当模型展现出深邃、非套路化的见解时，用户的智力投入度显著攀升。更有趣的是，用户在 AI 交互中的“沉浸、沮丧与愉悦”拓扑分布，与日常浏览开放互联网的心智状态高度一致——大模型已经实质性地融入了现代人类的日常信息环境。

METR 对 Claude Code 真实工作流的分析则表明，模型代际演进在工程复杂任务上带来了实打实的耗时缩短；同时，Claude 评估任务“人类所需耗时”的能力与基准开发测试高度吻合，为未来量化评估“AI 自我迭代与研究加速（Recursive Self-Improvement）”提供了重要的经验支点。我们在[《当 Agent 成为同僚：听 Claude Code 缔造者聊安全、范式跃迁与手艺消逝》](https://ntlx.github.io/articles/claude-code-boris-cherny-odd-lots)中探讨过的工程范式转变，正在这批跨世代数据中得到定量印证。

更具长远制度意义的，是本次试点的隐私技术机制。

Anthropic 并没有直接把包含商业秘密或个人隐私的原始会话明文丢给学者，而是基于 **Anthropic Insights** 架构：利用 LLM 自动抽象打标，经向量化和 K-Means 聚类生成宏观主题，外部研究员全程只接触统计分布。帝国理工学院依据 GDPR 第 29 条标准和“有动机入侵者”威胁模型进行红队渗透，确认**没有任何真实用户的个体身份被反向重识别**。

这证明了一个至关重要的治理事实：“保护商业合规与用户隐私”从来不应成为 AI 巨头拒绝外部独立审视的挡箭牌。通过严谨的语义沙盒与多层审计，建立开放、可验证的公共 AI 科学研究不仅完全可行，而且势在必行。

*{你在用 AI 处理重大决策或复杂工程时，最常在哪个环节感受到这种“生产性摩擦”？欢迎在评论区分享你的实战体会。}*

## 参考资料

- [Enabling independent research on how people use Claude - Anthropic](https://www.anthropic.com/research/enabling-independent-research)
- [Human–AI Collaboration at Scale: Task Criticality, Agency, and Friction Across 250,000 Conversations - Stanford SALT Lab](https://www.alphaxiv.org/abs/2608.human-ai-collaboration-at-scalev1)
- [Anthropic Enabling Independent Research Aggregate Dataset - HuggingFace](https://huggingface.co/datasets/Anthropic/enabling-independent-research)
- [Appendix to Enabling independent research on how people use Claude - Anthropic & Imperial College London](https://www-cdn.anthropic.com/files/4zrzovbb/website/8a665c85eec3a63b4d86287b9255657016f50e29.pdf)
- [Clio: Privacy-Preserving Insights into Real-World AI Use - Anthropic Research](https://www.anthropic.com/research/clio)
- [Social and Language Technologies Lab - Stanford University](https://cs.stanford.edu/~diyiy/group.html)
- [Human Information Processing Lab - University of Oxford](https://humaninformationprocessing.com/)
- [METR: Model Evaluation and Threat Research](https://metr.org/)
- [Agentic coding and persistent returns to expertise - Anthropic Research](https://www.anthropic.com/research/claude-code-expertise)
- [Recursive self-improvement in AI - Anthropic Institute](https://www.anthropic.com/institute/recursive-self-improvement)
- [WildChat: 1M ChatGPT Conversations in the Wild - Allen AI](https://wildchat.allen.ai/)

## 延伸阅读

- [《Claude Code 把专家重新暴露出来》](https://ntlx.github.io/articles/claude-code-expertise)
- [《当 Agent 成为同僚：听 Claude Code 缔造者聊安全、范式跃迁与手艺消逝》](https://ntlx.github.io/articles/claude-code-boris-cherny-odd-lots)
- [《Claude Code 的门，不在那段代码里》](https://ntlx.github.io/articles/claude-code-blackbox-trust)
- [《Claude Code 的七种控制方式：从'告诉 AI 做什么'到'让 AI 无法不做'》](https://ntlx.github.io/articles/claude-code-seven-steering-methods)
