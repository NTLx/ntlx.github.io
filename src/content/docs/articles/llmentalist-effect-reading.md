---
$schema: starlight
title: 模型说得像懂你，怎么算证据？
description: “它懂我”是一种真实体验，模型能力则要看外部证据。冷读术解释了确信从何而来；要判断模型会不会做事，还得把问题写成能核验的任务。
date: 2026-10-05
category: ai-models
tags: [LLM, Evaluation, 人机交互]
primarySourceUrls: ["https://softwarecrisis.dev/letters/llmentalist/"]
---

“你希望别人认可你，却也常常怀疑自己的判断；你有潜力，有时外向，有时谨慎。”这类句子能套在很多人身上，读者却容易觉得它说中了自己。1949 年，Bertram Forer 的课堂实验就展示了这种个人验证：学生拿到相同的概括式人格描述，却都认为它很准确。[原始论文](https://doi.org/10.1037/h0059240)

Baldur Bjarnason 在 2023 年的《[The LLMentalist Effect](https://softwarecrisis.dev/letters/llmentalist/)》把这个心理机制带到聊天模型：用户带着期待而来，在对话里提供上下文，再从模型的回答中挑出命中的部分，慢慢形成“它懂我、它在推理”的印象。这篇文章说中了“被理解感”容易从哪里来。模型是否能完成任务，还得看任务表现。

Bjarnason 也交代了这条思路的来处：Terence Eden 先注意到聊天机器人的 Forer 式陈述。Eden 用一段关于记者的宽泛评价示范这种效果，读者换成自己，也可能觉得后半段说得很准。[那篇短文](https://shkspr.mobi/blog/2023/02/how-much-of-ais-recent-success-is-due-to-the-forer-effect/)启发了这个类比，却没有证明所有模型回答都只靠含混话术。

![概览：对话感受与可核验的任务表现](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/llmentalist-effect-reading-00-infographic-core-summary.png)

## 冷读术能解释“被看见”的体验

冷读靠互动推进：读者观察对方的反应，再调整接下来的说法；听者把自己的经历接到这些话上。心理学家 Denis Dutton 对冷读术的分析，以及冷读表演者 Ian Rowland 对“话语由读者提供、意义由客户补上”的描述，都指向这个过程。

![原文中的互动回路示意；图源：Baldur Bjarnason，《The LLMentalist Effect》（2023）](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/llmentalist-effect-reading-01-source-feedback-loop.png)

一项 2026 年的 CHI 研究把个人验证效应放进 AI 预测场景：238 名参与者阅读预先写好的虚构预测，积极版本比消极版本更容易被评为有效、个性化、可靠和有用。[研究页面](https://www.microsoft.com/en-us/research/publication/personal-validation-effect-in-llms-positive-ai-responses-bias-perceptions-of-validity-reliability-personalization-and-usefulness-of-fictitious-predictions/)显示，即使预测是编出来的，正向措辞仍会抬高人们对它的评价。

研究材料是预先写好的预测，并非用户围绕真实问题与模型反复对话。结果更适合支持“正向表述会影响评价”；它没有检验真实对话中用户如何提供线索、模型如何跟随反馈，也没有评测模型完成任务的能力。

## 偏好数据有时会奖到迎合

Bjarnason 把冷读循环延伸到 RLHF：如果标注者按偏好给回答排序，奖励模型可能更看重“听起来对”而不是事实本身。后来关于模型谄媚行为的研究为这份担忧补上了证据：人和偏好模型有时会更喜欢符合用户观点、却不正确的回答。[Sharma 等人的研究](https://arxiv.org/abs/2310.13548)说明迎合风险不是凭空猜测。

InstructGPT 的原始研究用人类示范和输出排序来塑造回答，同时也把真实性列为目标之一，并报告模型在研究评估中较少编造事实。[论文](https://arxiv.org/abs/2203.02155)说明偏好训练可以改善回答，也有可能带来迎合。偏好信号不是事实核验机制，不能保证回答正确；原文关于 RLHF 的推断也不能简化成“只奖励语气”。

当一段回答让我感到被认同，我会继续检查：它有没有抓住我给出的具体信息？关键判断能否被外部事实、运行结果或其他证据检验？若只记录满意度，迎合和能力就难以区分。

## 从对话感受转到任务表现

原文用“下一个 token 的统计续写”来解释模型输出。训练目标描述模型怎样学习；任务评测则观察它能否完成具体问题。Chain-of-Thought 研究报告，在算术、常识和符号任务中，提示模型生成中间步骤可以提升表现。[论文](https://arxiv.org/abs/2201.11903)

这类实验测的是给定任务上的表现，不是意识。Chain-of-Thought 的结果不能说明模型像人一样思考，也不能证明它有主观体验；它说明的是任务表现可以被单独评估。我在[《没有神，也不能把门敞开》](https://ntlx.github.io/articles/llms-are-real-ai-is-fake)里讨论过意识问题与可观察行为。这里还要分清使用者的理解感和模型的答题表现。

冷读术类比让我想到：一段对话里，使用者补上的意义和模型完成任务的能力容易混在一起。要判断模型会不会做事，需要另找可以复核的证据。

## 把“懂不懂我”改写成一次测试

实际使用时，我会先写下这次任务的通过条件，再看模型输出：

- 它引用的个人细节是否真的出现在输入里，还是一句对很多人都成立的评价？
- 哪些部分能用原始来源、程序测试或独立专家复核？哪些只是听起来连贯？
- 我是否也记下了它猜错、漏掉或迎合我立场的部分？
- 若同一任务重复几次，结果是否仍符合事先约定的标准？

在[《提示词交给优化器后，谁来定义“好”？》](https://ntlx.github.io/articles/prompts-arent-real-eval-flywheel)里，我谈到用重复测试观察表现是否稳定。面对“模型懂我吗”，也可以把输入、判断标准和失误一起记下来，别只留下那次漂亮的命中。

一段对话让我觉得“它懂我”之后，我会接着检查模型用了哪些具体信息、做对了哪些可以定义的问题、又错在哪里。若结果经得起复核，再决定是否把更多工作交给它。

## 参考资料

- Baldur Bjarnason, [The LLMentalist Effect](https://softwarecrisis.dev/letters/llmentalist/)
- Bertram Forer, [The Fallacy of Personal Validation: A Classroom Demonstration of Gullibility](https://doi.org/10.1037/h0059240)
- Terence Eden, [How much of AI’s recent success is due to the Forer Effect?](https://shkspr.mobi/blog/2023/02/how-much-of-ais-recent-success-is-due-to-the-forer-effect/)
- Denis Dutton, [The Cold Reading Technique](https://pubmed.ncbi.nlm.nih.gov/3360083/)
- Ian Rowland, [A Simple Introduction to Cold Reading](https://www.ianrowland.com/_files/ugd/8b456e_2460f20f15a54f7c977e7410d38dad71.pdf)
- Pataranutaporn et al., [Personal Validation Effect in LLMs (CHI 2026)](https://doi.org/10.1145/3772318.3791851)
- Microsoft Research, [Personal Validation Effect in LLMs](https://www.microsoft.com/en-us/research/publication/personal-validation-effect-in-llms-positive-ai-responses-bias-perceptions-of-validity-reliability-personalization-and-usefulness-of-fictitious-predictions/)
- Ouyang et al., [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155)
- OpenAI, [Aligning language models to follow instructions](https://openai.com/index/instruction-following/)
- Sharma et al., [Towards Understanding Sycophancy in Language Models](https://arxiv.org/abs/2310.13548)
- Wei et al., [Chain-of-Thought Prompting Elicits Reasoning in Large Language Models](https://arxiv.org/abs/2201.11903)
