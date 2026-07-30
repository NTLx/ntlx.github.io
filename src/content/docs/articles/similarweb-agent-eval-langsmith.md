---
$schema: starlight
title: 评测 Agent 最危险的时刻，是拿未校准的尺子跟正确的修改打架
description: 长文本 Agent 研发中最大的陷阱，不是模型随机波动，而是未校准的评估指标。当评分尺子出现拮抗，真正的能力提升会被打成分值下降。看 Similarweb 如何用 Rubric 锚点、忠实度校验与 Trace 联动破解假回归。
date: 2026-07-30
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-30-similarweb-agent-eval-langsmith-img-00-infographic-core-summary.png)

在传统软件工程里，测试结果是确定性的。代码要么跑通测试用例，要么断言失败；只要输入不变，行为就可重复。但基于大语言模型的 Agent 极不相同：同一个用户提问，Agent 可能在不同运行中选择不同的工具路径，检索不同范畴的数据，最终整理出完全不同但同样合规的回答。

当类似 Similarweb Data Studio 这样的深度研究 Agent 投产时，团队每修改一次 Prompt、更新一次工具或调整一次模型，都在面临隐蔽的风险——你抽查了一个看似更完美的输出，却可能在某个边缘场景里丢失了关键数据源的归因，或者漏掉了一个重要的前提假设。

LangChain 官方博客近日分享了 Similarweb 使用 LangSmith 评估长文本 Agent 研究报告的工程实践。这篇文章最震撼我的，不是他们如何搭出了一套 LLM-as-a-Judge 流程，而是他们坦诚公布了一场**浪费了整整一周时间的“评估误校准惨案”**。

这为当下火热的 Deep Research Agent 研发敲响了警钟：比没有评测更危险的，是拿着一根未校准的指标尺子，去和正确的代码修改打架。

## 为什么 Golden Answer 在长文本 Agent 面前彻底坍塌？

在构建 Agent 评估体系时，绝大多数团队的第一反应是搬出标准答案（Golden Answer）。这在简单问答（Regular Chat）场景下非常有效。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-30-similarweb-agent-eval-langsmith-img-01-regular_chat_golden_answer.png)

在聚焦的单步问答中，输出的形状是固定的。我们可以通过确定性校验（如是否调用了指定的 API、是否返回了合规的结构化 JSON），再配合 LLM 对比 Golden Answer 进行语义打分。

然而，一旦进入长文本研究报告（Long-Form Research Reports），这种评估模式就彻底失效了。

长文本报告是高度开放的。面对“评估 Spotify 过去一年的流量结构与竞品走势”这类复杂需求，不存在唯一的真理答案。如果强行用一份标准参考报告作为 Ground Truth 去让 LLM 做相似度比对，评测系统奖励的就只是“模仿相似度”，而不是“分析质量”。Agent 只要尝试引入更具创见的分析角度或补充新的维度，就会因为偏离 Golden Answer 而被扣分。

Similarweb 团队敏锐地意识到：**长文本研究的评测，必须从“参考答案比对”转向“多维度 Rubric（评分量规）打分”与“A/B 基线相对判定”。**

## 三位一体：长文本 Agent 的解题框架

为了在开放式输出中建立可靠的探针，Similarweb 在 LangSmith 上搭了一套由三个核心模块构成的评估链路。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-30-similarweb-agent-eval-langsmith-img-02-long_form_report_evaluation_flow.png)

### 1. 带有显式评分锚点（Scoring Anchors）的 Rubric

针对报告的各个维度（如外部数据整合 `source_integration`），不能只让 LLM 凭感觉打 1 到 5 分，而必须在 Prompt 中给每个分值阶梯写下极端明确的客观描述：

* **0.0 分**：纯粹依赖单一数据 API，完全没有外部背景。
* **0.3 分**：含糊提及外部来源，例如泛泛地说“根据行业报告”。
* **0.8 分**：引用了多个明确具名的来源，并附带具体日期、数值与上下文。
* **1.0 分**：使用了大量经过权威归因的资料，且完美融入叙事框架。

每一个 Rubric evaluator 必须同时返回**定量得分（Score）**、**差距总结（Gap）**和**一句话解释（Detail）**。这样一来，低分不再是一个冰冷抽象的数字，而是一条可供工程师追溯的具体线索。

### 2. 防范幻觉的忠实度校验（Faithfulness Checks）

研究报告越长、文风越笃定，Agent 发生“过度拔高”或“无中生有”的风险就越大。忠实度校验专门逐句核对 Agent 报告中的每一个核心推断，验证其是否能被步骤中检索到的原始 Tool 数据所支持，防止 Agent 做出超出事实依据的过度解读。

### 3. A/B 基线对比（Baseline Comparisons）

为了判断新版本的 Agent 是否真的变好，评测并不依赖孤立的绝对打分，而是把新输出与已保存并认可的“历史 Baseline”放在一起，让 Judge 评估哪一个的分析深度和严密性更强。基线不是绝对真理，而是一个不断随系统迭代演进的锚点。

## 耗费一周的“假回归”：指标拮抗与尺子误校准

这套评估体系在刚上线时，不仅没有提升效率，反而让 Similarweb 团队陷入了长达一周的内耗。

当时，团队对 Agent 的 Prompt 做了一次微调。运行测试集后，大盘的平均综合得分突然出现了明显下滑。按照标准的工程流程，得分下降＝性能回归（Regression）。团队立刻回退代码、调整 Prompt、再次运行，但分数依然没有起色。

最诡异的是，工程师人工抽查这些被扣分的报告时，直觉上都觉得新版本的逻辑更清晰、内容更丰富。但团队选择了盲信数字，继续与 Prompt 暗斗，浪费了整整一周时间。

直到有人终于打开了各个维度的 Evaluator Comments（评价理由），真相才大白于天下：

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-30-similarweb-agent-eval-langsmith-img-03-rubric_miscalibration_conflict_loop.png)

在初始的 Rubric 设计中，有两个指标发生了严重的互相拉扯：

* **引用宽度（Source Integration）**：倾向于奖励“引用了更多外部资料”；
* **归因质量（Attribution Quality）**：倾向于惩罚“未明确具名的模糊引用”。

新版的 Agent 尝试检索了更多外部背景，拉高了引用宽度；但因为部分外部来源写得较为笼统（如“分析师预计”），拖垮了归因质量。**两个相反方向的拉力在综合均分里互相抵消，甚至倒扣分值。**

系统本身并没有退化，而是团队拿着一根冲突且误校准的尺子，在向正确的代码修改开枪。

在发现这个问题后，Similarweb 重新重写了 Rubric 的锚点，明确将“具名、可验证的权威来源”置于“纯粹的数量堆砌”之上。再次运行后，指标的变动终于与工程师的实际质量判断完全吻合。

在之前的探讨中，我们曾提及 [Loop Engineering：Agent 真正的战场不是 prompt，而是回路](https://ntlx.github.io/articles/loop-engineering-agent-loops)。Similarweb 的这场血泪教训再次印证：Agent 的迭代回路不仅包含模型与 Tool 的调用链，更包含评估标尺本身的校准回路。

## 把评估从“上线检查表”变成“工程诊断箱”

Similarweb 的实践带给我们最核心的工程启发，是彻底重构了对 Evaluation 的定位。

许多团队将评测视为上线前的一道关卡（Release Checklist）：跑个分，高了就发版，低了就阻断。但在非确定性的 Agent 研发中，这种“数字看板”式的思维极其危险。

通过 LangSmith，Similarweb 建立了一套打通了三个层级的工程诊断流：

1. **分值（Score）**：告诉你哪里可能出了问题，是定位病灶的探针；
2. **评语（Evaluator Comment）**：告诉你评判模型做出该决定的具体推理过程；
3. **追踪（Trace）**：让你一键下钻到 Agent 产生该问题时的完整 Tool 调用步骤与上下文上下文。

这正如我们在 [LangChain 抛弃传统 BI：Agent 优先的数据栈，真正拼的是“显性上下文”](https://ntlx.github.io/articles/langchain-agent-first-data-stack) 中所阐述的逻辑：**没有 Trace 支持的 Score 是盲目的，而没有 Rubric 约束的 Trace 是混乱的。**

当这三者连通，评估不再是冰冷的数字裁判，而变成了指导 Prompt 优化、工具设计与上下文装配的诊断箱。

评测从来不会替代人的工程判断。它的真正价值，在于把人类对质量的隐性偏好，转化为可重复、可追踪、可验证的工程证据。

在你的 Agent 研发中，是否也遇到过“代码改好了，评测分数却掉了”的困惑？你是如何校准自己的评测标尺的？欢迎在评论区分享你的踩坑经历。

## 参考资料

* [How Similarweb Evaluates Long-Form Agent Research Reports with LangSmith](https://www.langchain.com/blog/how-similarweb-evaluates-long-form-agent-research-reports-with-langsmith)
* [LangSmith Evaluation Concepts & Documentation](https://docs.smith.langchain.com/concepts/evaluation)
* [Similarweb Data Studio](https://www.similarweb.com/)

## 延伸阅读

* [Loop Engineering：Agent 真正的战场不是 prompt，而是回路](https://ntlx.github.io/articles/loop-engineering-agent-loops)
* [LangChain 抛弃传统 BI：Agent 优先的数据栈，真正拼的是“显性上下文”](https://ntlx.github.io/articles/langchain-agent-first-data-stack)
* [法律 Agent 的真正瓶颈，是谁来判它有没有错](https://ntlx.github.io/articles/legal-agent-verifiers)
