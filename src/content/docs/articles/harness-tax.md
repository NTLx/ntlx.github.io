---
$schema: starlight
title: 同一个模型，换个 Harness，账单先变
description: HarnessTax 让我重新看待模型评测：默认 harness 不是中性外壳，它可能先改变上下文和成本，再改变我们对模型能力的判断。
date: 2026-09-18
category: ai-agents
primarySourceUrls: ["https://harnesstax.github.io/"]
---

我读完 [HarnessTax：How Much Does the Harness Matter for Coding Agents?](https://harnesstax.github.io/) 后，第一反应不是“Pi 赢了，Claude Code 输了”。更扎眼的是另一件事：同一个模型，只换一层 harness，成功率可以差不多，账单却先变了。

这件事很容易被模型排行榜盖住。我们习惯问哪个模型更聪明，却很少问它第一次调用时看到了多少规则和工具，失败后由谁决定下一步，上一轮的状态又以什么形式被带进来。模型名写在产品标题上，harness 藏在产品内部；但用户支付的是两者的组合。

![HarnessTax 核心发现信息图：同一模型接入不同复杂度的 harness 后，成本与上下文开销发生变化](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-18-harness-tax-img-00-infographic-core-summary.png)

## 先别急着比较模型，先把外壳拆出来

HarnessTax 比较了 21 个 model–harness pair：7 个模型分别接入 Claude Code、Codex CLI 和 Pi，在 SWE-bench Lite 与 Terminal-Bench 2.0 上测试。每个 benchmark 取 30 个随机任务，每个组合对每个任务运行 3 次，每次最多 100 turns。

这个规模足够做一个有用的对照，但还不够让任何人宣布“最佳 harness”。研究者固定任务样本、成功评估方式和价格口径，观察同一个模型换环境之后，成功率和成本怎样一起走。我觉得这正是这项研究的价值：把原本被产品名包起来的变量，暂时摊在桌面上。

原文最有冲击力的例子是 Claude Fable 5。在 SWE-bench Lite 上，它接入 Claude Code 时解决了 97.8% 的尝试，平均成本约 `$1.33`；接入 Pi 时是 96.7%，成本约 `$0.67`。成功率只差 1.1 个百分点，成本接近两倍。

这两组数字不能宣布 Pi 在所有场景都更好，也不能抹掉 Claude Code 额外设计可能带来的价值。它们至少说明，默认 harness 不是免费赠品。你可能是在为更多工具、更长的规则、更完整的状态管理付费，也可能是在为真正有用的可靠性付费。没有对照实验，账单上只有一个总数，看不出钱究竟买了什么。

## Harness 税可能在第一句话之前就开始了

Figure 3 让我觉得比最终成功率更值得盯着看。研究者比较了三种 harness 发给模型的第一次主调用上下文：在 7 个模型上，Claude Code 的平均初始上下文超过 Pi 的 10 倍，工具 schema 和指令也更长。

落到工程上，意思很直接：模型还没有读第一份代码之前，系统已经把一批规则、工具说明和环境信息放进了请求。它们当然可能有用。复杂任务需要权限边界、工作方式、验证要求和长程状态；把这些写清楚，通常比把模型丢进空房间可靠。但“有用”不能自动推出“越多越好”。

我更愿意把初始上下文当成一笔固定预算。它会影响输入成本、缓存命中、首轮延迟，也会占用模型处理真正任务的注意力。HarnessTax 的图表没有证明长指令必然伤害成功率，却把一个常被忽略的问题摆了出来：谁在为这段上下文买单？

![首轮上下文预算示意：规则、工具 schema 和状态在模型真正处理任务前就进入请求](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-18-harness-tax-img-01-framework-context-budget.png)

站内之前写过 [《编程智能体的“急诊室交接班”：从 Pi 的 Compaction 机制看上下文治理与缓存代价》](https://ntlx.github.io/articles/compaction-in-pi-context-engineering)，讨论的是长会话如何压缩、缓存如何失效。这次 HarnessTax 补上了另一面：在会话开始之前，不同 harness 就已经给模型准备了大小不同的“工作台”。前者处理膨胀后的上下文，后者提醒我们别忽略最初那一笔。

## “简单”不是把工具删到只剩四个

原文称，Pi 在两个 benchmark 上均位于 Pareto frontier，并把这套实验配置概括为 `read`、`write`、`edit`、`bash` 四类工具。看到这里，很容易得出一句简单的设计建议：少做一点，反而够用。

但我不认为数据支持“工具越少越好”。更准确的结论是：在这组任务和配置里，一个较小的工具面已经足以达到竞争力，因此 harness 的复杂度必须拿收益来解释，而不能凭“功能完整”自动获得正当性。

Pi 项目的 README 还列出了 `grep`、`find`、`ls` 等整体内置工具。实验里使用四类工具，与项目整体能力不是一回事。这种边界值得保留，因为我们太容易把论文里的最小配置，误读成产品的设计哲学。

我从这里得到的不是“把 Claude Code 砍薄”，而是一个更麻烦的工程问题：每个工具、每条规则、每种会话状态，究竟减少了哪一类失败？如果答不上来，它们就只是持续进入上下文的固定成本。反过来，如果某个工具显著减少了返工或让高风险任务更容易验证，它的开销可能很便宜。

## 模型的“原生环境”也不保证最优

HarnessTax 的第三个发现比“成本更高”更反直觉：在 6 个 Anthropic 和 OpenAI 模型、两个 benchmark 的 12 次比较中，替代 harness 取得最高观测成功率的有 9 次。

这并不否认供应商会为自己的 coding environment 优化模型。OpenAI 的官方材料确实把 GPT-5-Codex 描述为针对 Codex 中的 agentic coding 做过优化。问题是，优化方向不等于最佳配对的保证。模型可能学会了某种工具调用习惯，但另一套上下文安排、反馈循环或成本结构，也可能更适合某一类任务。

我以前在 [《Not the Model, You're the Harness》](https://ntlx.github.io/articles/not-the-model-youre-the-harness)里看到过一个很重要的提醒：不要把 agent 的能力统统归功于模型。HarnessTax 让我继续往下算：harness 是否改变了表现，以及这种改变是否值得它的成本，都要放进评测。

这也改变了“选模型”的含义。更接近现实的问题应该是：在某个任务和预算下，哪个模型–harness 组合能以可接受的可靠性完成工作？如果任务延长为跨 session 的协作，答案可能会变；如果任务需要大量工具调用，答案也可能会变。排行榜最好呈现成曲线，而不是一个永远有效的冠军名字。

## 这组数字离真实开发还有一段距离

读到这里，我反而更在意原文主动写出的限制。它只测两个开源 benchmark；模型可能在训练中见过这些任务；每个 benchmark 只抽 30 个任务；每次尝试还有 100 turns 上限。Terminal-Bench 2.0 的论文描述的是包含 89 个任务的更大 benchmark，HarnessTax 并没有把全量任务都跑一遍。

更重要的是，静态任务不等于真实开发。真实工作会有需求澄清、权限申请、代码评审、半途变更和跨 session 交接。不同 harness 对 turn 的定义也不同，所以“每 turn 花多少钱”不能直接当作统一尺子。首调用上下文是非常有用的机制线索，却不是完整会话成本。

我把这些看作研究的边界。它适合回答“同一模型换个执行环境会怎样”，不适合直接回答“我的团队明天该买哪个工具”。要做后一个判断，还得把真实仓库、交互式任务、失败类型、返工时间和安全边界补回来。

## 我会怎样重新做一次评测

如果让我为团队设计一轮最小评测，我会先固定模型、任务样本和价格口径，再同时跑两个 harness，并记录这些字段：

![评测框架示意：模型、Harness 与 Workload 汇入评测台，再观察成本、成功率、返工时间和人工介入](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-18-harness-tax-img-02-framework-evaluation-loop.png)

1. 第一次主调用的上下文大小，以及工具 schema 和指令分别占多少；
2. 总输入/输出 token、缓存情况、turn 数和实际 wall-clock 时间；
3. 最终成功率之外的失败类型：工具调用错、上下文丢失、测试没跑完，还是实现本身错误；
4. 任务完成后的返工时间，以及人类需要介入几次；
5. 换成多轮、会话跨天、需要澄清需求的任务后，成本–可靠性曲线是否还成立。

这样测出来的结果可能不如“某某模型登顶”好看，但更能指导采购和架构决策。低风险、短周期的日常任务，可能更适合轻量 harness；需要长程规划、权限治理和多轮验证的任务，则可能值得支付更厚的外壳。关键不是先选薄或厚，而是让每一项开销都能对应一个可观察的收益。

读完 HarnessTax，我没有得到一个产品推荐，倒是留下了一条评测纪律：把模型、harness 和 workload 放在同一张表里，把成本和成功率放在同一张图里，再把 benchmark 结果与真实交互分开看。这样至少能追问一句：我们是在为能力付费，还是只是在为默认配置付费。

## 参考资料

- [HarnessTax: How Much Does the Harness Matter for Coding Agents?（原始研究展示页）](https://harnesstax.github.io/)
- [Effective harnesses for long-running agents — Anthropic](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [Unrolling the Codex agent loop — OpenAI](https://openai.com/index/unrolling-the-codex-agent-loop/)
- [SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering](https://arxiv.org/abs/2405.15793)
- [SWE-bench Lite 官方说明](https://www.swebench.com/lite)
- [Terminal-Bench: Benchmarking Agents on Hard, Realistic Tasks in Command Line Interfaces](https://arxiv.org/abs/2601.11868)
- [Benchmarking Coding Agents on Databricks’ Multi-Million Line Codebase](https://www.databricks.com/blog/benchmarking-coding-agents-databricks-multi-million-line-codebase)
- [Pi coding agent README](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/README.md)
- [Introducing upgrades to Codex — OpenAI](https://openai.com/index/introducing-upgrades-to-codex/)
- [Natural Language Query to Configuration for Retrieval Agents](https://arxiv.org/abs/2605.27361)
- [SWE-Together: Evaluating Coding Agents in Interactive User Sessions](https://arxiv.org/abs/2606.29957)
- [How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works)
- [The Harness Tax: The Dead Weight Inside Your Coding Agent — Portkey](https://portkey.ai/blog/the-harness-tax/)

## 延伸阅读

- [Not the Model, You're the Harness](https://ntlx.github.io/articles/not-the-model-youre-the-harness)
- [编程智能体的“急诊室交接班”：从 Pi 的 Compaction 机制看上下文治理与缓存代价](https://ntlx.github.io/articles/compaction-in-pi-context-engineering)
- [Anthropic 这篇长跑 Agent harness 文章，讲透了交接制度](https://ntlx.github.io/articles/anthropic-long-running-agent-harness)
- [Agentic Workflow 烧掉的钱去哪了？GitHub 用 Agent 优化 Agent 的实战复盘](https://ntlx.github.io/articles/token-efficiency)
