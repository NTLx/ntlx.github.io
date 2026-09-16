---
$schema: starlight
title: Agent 能上生产，靠的是一份可执行的责任清单
description: 模型可以负责推理，但 Agent 能否进入真实工作流，取决于系统有没有把动作边界、验收证据、状态和停手条件写清楚。
date: 2026-09-16
category: ai-agents
primarySourceUrls: ["https://x.com/choopyplug1/status/2088973320964215253", "https://x.com/i/article/2088576943155290112"]
---

我读完这篇 X 长文后的第一个反应，是它终于把讨论从“模型还能不能再聪明一点”挪到了一个更麻烦、也更真实的问题：模型一旦开始调用工具、修改文件、读取长期状态，谁负责把这些动作接住？

但我没有完全接受它的叙事方式。文章把 2024 年的 prompt engineering、2025 年的 context engineering 和 2026 年的 harness engineering 排成一条替代链，好像后一项会把前一项吸收掉。我的理解更像同心圆：prompt 负责表达意图，context 决定模型看到什么，harness 则把这两者接到工具、权限、状态、验证和证据上。外层变厚，不代表内层失效。

这也是我觉得 harness 这个词开始有用的原因。它是“包着模型的代码”，更是一份可执行的责任清单：Agent 能观察什么，可以提出什么动作，动作是否需要批准，结果靠什么验收，失败留下什么记录，什么时候必须停下来。

![概念图：Agent 的责任契约](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-16-harness-engineering-seven-layers-img-00-infographic-core-summary.png)

## 这篇文章带来的改变，是 Agent 的评价单位

过去看一个模型，常问的是它能不能答对、能不能写出代码、能不能在 benchmark 上拿更高分。读完这篇文章，我更想问另一组问题：它的工具调用有没有边界？它是否知道自己刚才改了什么？出了错以后，系统能不能给出一份干净的证据？下一次运行会不会再次踩进同一个坑？

这和 [OpenAI 对 harness engineering 的官方复盘](https://openai.com/index/harness-engineering/)很接近。那篇文章把人的工作概括为 “Humans steer. Agents execute.”，并把仓库地图、结构化文档、架构不变量、linters、测试、日志和指标都放进 Agent 的工作环境里。重点在于把人的判断改写成 Agent 能找到、能执行、能被检查的东西。

我之前写过一篇 [Not the Model, You're the Harness](https://ntlx.github.io/articles/not-the-model-youre-the-harness)，当时关注的是：同一个模型换一个外部系统，体验会完全不同。这次长文让我把那句话往前推了一步：harness 不只是影响效果的“外部变量”，还应该承担责任分配。它要让一次动作变成一条可以回放、拒绝和追问的记录。

## 七层清单里，最值钱的是动作边界和验收循环

原文把 harness 拆成工具编排、验证、上下文与记忆、护栏、可观测性、路由与模型选择、反馈与自我改进七层。这个清单很适合拿来盘点系统，但我不会把七层当成必须照抄的架构标准。

如果只挑最先应该落地的部分，我会先做工具权限和独立验证。一个最小的执行回路可以写成：

```text
提出动作 → 检查权限 → 执行 → 验收 → 记录
```

只读动作可以直接返回结果；会修改文件、提交代码、调用外部 API 的动作，则应该有明确的范围、审批点和回滚方式。关键不在于配置文件里写了多少个 `confirm`，而在于拒绝是否真的发生在工具执行之前，而不是等模型把危险动作写进一段解释之后才提醒它。

![原文配图：工具编排与权限边界](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-16-harness-engineering-seven-layers-img-01-source-tool-permissions.jpg)

验证也不能只是“让同一个 Agent 再看一遍自己的答案”。执行者和验收者至少要在职责上分开：前者负责完成任务，后者负责寻找违反约束、遗漏测试或越过范围的地方。验收结果要回到系统里，形成通过、拒绝、超时和需要人工判断等结构化状态。

![原文配图：maker / checker 独立验收循环](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-16-harness-engineering-seven-layers-img-02-source-maker-checker.jpg)

这套设计有一个经常被忽略的前提：你得先知道“完成”长什么样。测试、类型检查和 schema 校验可以给出很硬的信号；产品取舍、架构方向和用户是否真的满意，就没有同样干净的 oracle。没有验收标准时，循环不会制造正确性，只会把错误修得更快、更像完成。

## 上下文、日志和权限，解决的是不同的失败

原文把 context & memory 放在 harness 里是对的，但“记忆”这个词很容易让人误解。持久化文件、状态记录和摘要并没有给模型安装一块人脑，它们让系统在下一轮重新装载必要的事实。这里我会继续沿用 [之前关于上下文压缩和交接状态的文章](https://ntlx.github.io/articles/compaction-in-pi-context-engineering)里的区分：压缩是在有限窗口里重新安排信息，状态文件则是把跨会话不能丢的约束放到窗口外。

![原文配图：窗口内上下文与外部持久化状态](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-16-harness-engineering-seven-layers-img-03-source-context-persistence.jpg)

这两层还要和可观测性分开。状态回答“现在认为自己在哪里”，日志和 trace 回答“刚才究竟发生了什么”。没有后者，团队只能听 Agent 自述；没有前者，下一次运行又得从一段不完整的聊天记录里猜起。好的 harness 会让工具调用、输入输出、耗时、拒绝理由和最终验收彼此关联，出问题时能从结果倒查动作。

![原文配图：端到端 LLM 可观测性架构](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-16-harness-engineering-seven-layers-img-04-source-observability.jpg)

权限又是另一件事。GitHub 的官方文档明确提醒，分配给 cloud agent 的 Issue 或评论可以包含隐藏消息，形成 prompt injection；同一份文档也说明 cloud agent 能访问代码并向仓库推送变更。这个例子很重要，因为它说明“模型看到了恶意文字”不是完整的安全故事，决定损害范围的是：不可信输入能不能触发高权限工具，工具能不能访问秘密，提交能不能绕过人工审查。

Anthropic 关于 Claude Code 质量问题的[官方复盘](https://www.anthropic.com/engineering/april-23-postmortem)也给了我类似的提醒。它把报告追溯到三项独立变更：默认 reasoning effort 的调整、清理 thinking history 的实现 bug，以及限制冗长度的 system prompt 与相关改动。三件事都发生在模型周围的运行系统里，却会被用户感知为“模型突然变差”。这并不意味着模型永远不会出问题，它提醒我，排查质量回归不能只盯着模型版本。

## 统计口径越满，越需要回到证据链

原文开头的“88%”很有传播力，但我去找出处后，发现它不能原样写进文章。能对上的 Lenovo / IDC 研究图表写的是 “33 AI POCs → 4 AI Production Launches”，讨论的是 AI 试点转向生产发布时的组织准备度，不是专门测量企业 Agent 项目。

问题不在错别字，关键是统计对象换了。把“AI POC 没有进入大规模部署”改写成“Agent 项目失败”，会让一个关于数据、流程、基础设施和 ROI 的组织问题，看起来像模型能力问题。原文想表达的方向，很多演示离稳定生产还很远，仍然成立，但数字必须带着它自己的口径一起出现。可参阅 [Lenovo 的 CIO Playbook 2025](https://investor.lenovo.com/en/global/Lenovo_CIO_Playbook_2025.pdf)和[CIO 对这项研究的转述](https://www.cio.com/article/3850763/88-of-ai-pilots-fail-to-reach-production-but-thats-not-all-on-it.html)。

法规段落也一样。Colorado 官方页面把相关要求写成不晚于某个日期生效，而 European Commission 当前的时间线把执法权和部分透明度要求放在 2026 年 8 月 2 日，同时把 Annex III 高风险系统规则放到 2027 年 12 月 2 日，把受监管产品中的高风险系统规则放到 2028 年 8 月 2 日。原文把这些压缩成“高风险条款从 8 月开始”，工程上听起来干脆，事实却不够准确。遇到这种会影响决策的段落，我宁愿多留一个链接，也不把复杂规则磨成一句口号：参见 [Colorado General Assembly](https://leg.colorado.gov/bills/sb25b-004)和[European Commission 的执法时间线](https://digital-strategy.ec.europa.eu/en/policies/enforcement-ai-act)。

## 我会怎样开始做一套最小 harness

我不会先搭一个能自我改写、自我路由、自我发布的“大系统”。对一个真实任务来说，更稳的顺序是：

![概念图：从动作到证据的最小工作流](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-16-harness-engineering-seven-layers-img-05-illustration-accountable-workflow.png)

1. 先写清任务范围、可读目录、可用工具和不可触碰的对象；
2. 把写入、删除、发布、迁移和外部变更区分开，默认让高影响动作停在审批点；
3. 为结果准备独立验收，规定失败时返回什么证据，以及尝试到什么程度必须停止；
4. 保存状态、工具调用和验证结果，让下一次运行能加载约束，也让人能复盘；
5. 等前面的证据稳定后，再按任务复杂度做模型路由，再把经过复核的失败模式沉淀为规则。

我把它排成风险顺序，而不是七层的机械排序。工具权限先把损害半径关小，验证让错误有机会被拒绝，状态和日志让系统不会失忆也不会失语，路由和反馈才有了可衡量的输入。反馈尤其不能直接等于“自动修改自己的规则”：每一条新约束都应该有来源、版本和撤销办法。

当然，不是所有 Agent 都值得加这么厚的 harness。一次性、只读、低风险的文本任务，复杂的审批和 trace 可能只是在增加延迟。值得投入的，是那些会触碰外部系统、跨越多轮状态、处理用户数据，或者必须向别人解释“为什么这样做”的工作流。

所以我对这篇文章最后留下的结论是：把七个模块贴到模型外面，并不会自动得到可靠系统。harness 更像一份不断接受失败检验的责任契约。模型负责提出判断，系统负责限制动作、收集证据、保存状态，并在证据不足时让它停下来。Agent 能不能上生产，最后看的不是它会不会说“我完成了”，而是系统能不能回答“它做了什么、凭什么通过、出了问题谁能追到”。

## 参考资料

- 原始材料：[X 分享帖](https://x.com/choopyplug1/status/2088973320964215253)；[X Article](https://x.com/i/article/2088576943155290112)
- [OpenAI：Harness engineering: leveraging Codex in an agent-first world](https://openai.com/index/harness-engineering/)
- [Anthropic：An update on recent Claude Code quality reports](https://www.anthropic.com/engineering/april-23-postmortem)
- [Lenovo：CIO Playbook 2025](https://investor.lenovo.com/en/global/Lenovo_CIO_Playbook_2025.pdf)；[CIO：88% of AI pilots fail to reach production](https://www.cio.com/article/3850763/88-of-ai-pilots-fail-to-reach-production-but-thats-not-all-on-it.html)
- [GitHub：How GitHub's agentic security principles make our AI agents as secure as possible](https://github.blog/ai-and-ml/github-copilot/how-githubs-agentic-security-principles-make-our-ai-agents-as-secure-as-possible/)；[GitHub Docs：Risks and mitigations for Copilot cloud agent](https://docs.github.com/en/enterprise-cloud@latest/copilot/concepts/agents/cloud-agent/risks-and-mitigations)
- [Colorado General Assembly：SB25B-004](https://leg.colorado.gov/bills/sb25b-004)
- [European Commission：The enforcement framework of the AI Act](https://digital-strategy.ec.europa.eu/en/policies/enforcement-ai-act)；[Regulatory framework of the AI Act](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai)
- [AICPA：TQA Section 9561](https://www.aicpa-cima.com/resources/download/tqa-section-9561-soc-examinations-effect-of-the-service-organizations-use-of-ai-on-soc1-and-soc2-examinations)
