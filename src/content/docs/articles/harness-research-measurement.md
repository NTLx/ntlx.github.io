---
$schema: starlight
title: 判断 AI 研究的野心，先看它想改变什么
description: RLM、Jev 与新一代 harness 研究提出了不同赌注：运行成本、训练泛化和模型接口。读完这期访谈，我更在意每项主张准备怎样被验证。
date: 2026-10-03
category: ai-agents
tags: ["AI Agents", "AI Research", "Harness", "Agent Evaluation"]
primarySourceUrls: ["https://www.latent.space/p/rlm"]
---

Alex Zhang 在 Latent.Space 的访谈里，从 GPU kernel 谈到 RLM、Jev 和博士阶段的选题。听完，我更想看这些研究设计究竟改动了哪一环，又拿什么结果证明它有用。

Alex 认为，博士阶段可以把时间押在产业暂时没有优先处理的问题上。我愿意把这当作学术的优势，但选题大胆本身不能替研究背书。节目里的 GPU kernel 例子很具体：排行榜上跑得快，不等于放进完整系统后也能稳定工作。

![文章逻辑概览：按运行期、训练期和接口层区分 harness 研究的问题与测量方式](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/harness-research-measurement-00-infographic-core-summary.png)

## 学术的野心，得先变成可检验的赌注

读一项新研究，我会先问它让什么原本难以测量的问题变得可测，再看实验能否把新设计的效果与模型能力、额外计算区分开。

这也是我读 agent harness 论文时想追问的。大家常问“harness 有没有用”，但这句话能指几件不同的事：同一个模型是否更常做对，运行成本是否更低，或是模型经训练后学会了可迁移的任务分解。每个问题都得用不同实验来回答。

## 看 Harness 时，要分清运行期和训练期

节目里提到的 HarnessTax 报告把模型固定下来，在 SWE-bench Lite 和 Terminal-Bench 2.0 上比较不同 coding harness。作者在这两套测试里观察到，成功率变化有限，成本却可能相差五倍。完成率接近，运行代价仍可能差很多。这份结果只回答了两个 coding benchmark 上的比较，没法代表所有 harness。

Harvey 与 Baseten 给出了另一种测试：在 M&A 尽调 benchmark LAB Diligence 上，通用 tool-loop 与任务专用 RLM harness 的评分项通过率均值分别为 23.3% 和 62.4%，测试集有 50 个留出数据室；RLM 方案也让七个模型中的六个每个数据室生成成本上升。这是他们用合成资料室和自家评分标准得到的公司研究结果，不能代表所有法律任务，却说明 harness 设计与任务结构合拍时，成功率也会明显改变。

Alex 的[后续研究文章](https://alexzhang13.github.io/blog/2026/harness/)把问题放到训练阶段：用某种 harness 训练模型，它学到的策略能否迁移到更长、表面不同的任务？作者报告，在他们的实验中，短任务训练迁移到了长 8–32 倍的 held-out tasks。他们的解释是，RLM 把具体上下文移出根模型的主轨迹；不同任务经过相似的分解后，根模型看到的过程也更相近。

这几组结果回答的不是同一道题。HarnessTax 看固定模型换了运行环境后花多少钱、完成得如何；Harvey 测任务专用分工能否提高尽调评分；Alex 则关注训练出来的分解策略能迁移多远。换模型、任务或训练目标后，结果还得重测。

## RLM、Jev 和 CLM 改动了不同的接口

RLM 把超长 prompt 放进 REPL 的变量里。模型可以用代码查看和拆分上下文，再把小任务递归交给子调用。论文图 2 画出了这条路径。底层模型可以保持不变，改变的是外部 harness 怎样管理上下文、安排调用。

![RLM 论文 Figure 2：prompt 放入 REPL 变量后，由代码查看、拆分并递归调用模型](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/harness-research-measurement-01-rlm-figure2.png)

Jev 则从结果格式下手：如果应用只需要分类、打分或从候选项中选择，模型一定要先写自由文本，再交给程序解析吗？TypeSafe 把 Jev 描述为输出受类型约束的概率决策。最近一份独立评估报告了它在多种任务上的结果，也发现它在低资源语言、噪声标签和 rubric 判断上表现较弱。固定格式方便程序接收结果，调用方仍得检查判断本身。

我在[一篇 Decisions API 文章](https://ntlx.github.io/articles/openai-devday-agent-runtime-layers)讨论过，系统可以把窄决策放进单独的运行路径。Jev 和这类 runtime 设计相邻，但改动的位置不同：一个约束模型的输出，另一个改变应用如何调用决策能力。

Context Language Models 则让模型直接编辑代表上下文状态的文件，决定保留什么。它和 RLM 都处理长上下文，管理权却不同：RLM 由外部程序切分、调度，CLM 让模型修改上下文本身。把这些路线分开，比较时才知道究竟动了哪一个接口。

## 我会先问，一个新点子怎样输掉

读到新的 agent 论文，我会先圈出它改动的变量：模型、harness、训练过程，还是输入输出格式。再对照它承诺的指标。若声称长任务更可靠，就看端到端表现；若声称策略能迁移，就看没参加训练的任务。最后再问对照组是什么，以及哪些结果会让我改口。

想法刚出现时，研究者未必已经有完整答案。学术给人一些空间，先去碰产业还没选中的问题；接下来仍要说明怎么判断它做成了，什么结果会让自己放弃。

对我来说，这期访谈留下的问题很实际：研究究竟改了什么？模型更强了，还是外部工作方式变了？我会先看论文怎样安排最小对照，再看它是否报告了完整任务的结果和代价。

## 参考资料

- [Academia is for Ambition — Alex Zhang, MIT — Latent.Space](https://www.latent.space/p/rlm)
- [Recursive Language Models — Alex Zhang, Tim Kraska, Omar Khattab](https://arxiv.org/abs/2512.24601)
- [Language model harnesses are compositional generalizers — Alex Zhang](https://alexzhang13.github.io/blog/2026/harness/)
- [HarnessTax: How Much Does the Harness Matter for Coding Agents?](https://harnesstax.github.io/)
- [Post-Training RLM Agents for End-to-End M&A Diligence — Harvey and Baseten](https://www.harvey.ai/blog/post-training-rlm-agents-for-m-and-a-diligence)
- [Introducing System One Models & Jev — TypeSafe AI](https://typesafe.ai/blog/introducing-system-one-models-and-jev)
- [Evaluating and Benchmarking the System One Model Jev](https://arxiv.org/abs/2609.37647)
- [Context Language Models](https://arxiv.org/abs/2609.37725)
