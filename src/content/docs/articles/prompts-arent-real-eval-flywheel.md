---
$schema: starlight
title: 提示词交给优化器后，谁来定义“好”？
description: 优化器能改写提示词，却不能替团队决定哪些行为算好。测试场景、判分规则和线上反馈仍要有人定义、校准并负责。
date: 2026-10-02
updated: 2026-10-02
category: ai-agents
primarySourceUrls: ["https://evaluation.club/"]
---

Dan McKinley 的《Prompts Aren't Real》从一条 Sentry 报错开始：`JSONDecodeError: Invalid control character`。一个 agent 要为条目写短标题，字段定义了 80 字符上限，说明文字还要求不超过六个词；流式输出里出了非法控制字符，JSON 解析失败。

他的临时修法只改了一处字段别名：加上 `alias='heading'`。McKinley 说目前管用，又补了一句，既然这个修法“彻底疯了”，他估计迟早还会再被扰动。演讲没有解释换个字段名为什么奏效。修法本身有些荒唐，他也没假装知道原因。我读到这里想到：单次输出符合预期，和系统能稳定地符合预期，是两回事。

![提示词优化与人工评测标准的闭环信息图](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-02-prompts-arent-real-eval-flywheel-img-00-infographic-core-summary-1.png)

![字段别名从 title 改成 heading 的原始代码差异](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-02-prompts-arent-real-eval-flywheel-img-01-evidence-heading-alias-diff.jpg)

## 先记录行为，再动提示词

McKinley 的办法，是先把“我觉得这句写得更好”换成可以重复运行的断言。同一个场景多跑几次，观察 agent 是否稳定通过。τ-bench 把连续 k 次独立试验全部成功的概率记作 `pass^k`；`pass@k` 问的是 k 次里至少成功一次，两者方向相反。

演讲里的 Slack 告警给了一个具体例子：85 个测试里有 1 个失败；其中一条测试 20 次只通过 16 次，而通过线是 19 次。重复试验能看出这条测试表现得稳不稳，19/20 仍只是演讲这组测试设定的门槛，不代表真实使用场景也有同样的通过率。

![演讲展示的 Slack 可靠性测试告警](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-02-prompts-arent-real-eval-flywheel-img-02-evidence-slack-reliability-alert.jpg)

## 飞轮让优化有了闭环

测试从哪里来？McKinley 让 Claude 阅读 skill 描述，生成两类场景：试着绕过规则的对抗输入，以及新提示词可能破坏原有行为的正常输入。测试跑出基线后，优化器反复改写提示词；随后用优化器没有见过的 holdout 测试检查效果。部署之后，再从真实对话里抽样，让 LLM judge 找出失败案例，把它们补成新的测试。

他举 GEPA 作优化器。论文把 GEPA 描述为根据执行轨迹进行自然语言反思，再提出、测试候选提示词的算法；这说明它如何工作，不能替演讲里的业务样例背书。[GEPA 论文的 ICLR 2026 正式版](https://proceedings.iclr.cc/paper_files/paper/2026/hash/0e9e708b6f48e14fd0ac29e167413f76-Abstract-Conference.html)也有自己的任务和实验设置。

演讲展示的分数表里，我能看清的几个具名样例在优化集与 holdout 列上保持同分。这是 McKinley 团队展示的一组结果，说明这些例子在留出检查中没有掉分；它不等于外部复现，也没有证明测试集覆盖了真实用户会遇到的行为。

![优化集与 holdout 样例分数表](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-02-prompts-arent-real-eval-flywheel-img-04-evidence-optimized-holdout-table.jpg)

## 提示词退场，判断还在场

让我停下来的是一份标题写着 `Brand Voice Prompt (FINAL FOR SHARING)` 的文档，版本标签已经排到 v14。等要把“像不像品牌”变成可测行为时，演讲给出的例子显示，简单的 judge prompt 不足以处理这类判断。

![标题为 Brand Voice Prompt 且显示多个历史版本的原始文档](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-02-prompts-arent-real-eval-flywheel-img-03-evidence-brand-voice-v14.jpg)

McKinley 没说品牌语气可以省掉。他说的是，复杂的品牌判断不能靠一句简单的 judge prompt 解决，LLM judge 本身会变成一个项目；他给的办法，是准备由专家标好的正反样例，再用它们校准 judge。提示词从工程师手里退开，判断进入了测试用例、标签和评分标准。

我同意把反复润色提示词改成检查真实行为，但“提示词的文字不重要”说得太满。测试场景由谁写、哪个回答被标为正例、judge 的尺度怎样校准，这些选择仍由人做。它们只是从一段连贯的说明文字，搬到了分散的样例和规则里。

我在[《没有神，也不能把门敞开》](https://ntlx.github.io/articles/llms-are-real-ai-is-fake)里写过，讨论 agent 时可以从“它是不是有意识”转向可观察的执行边界。这篇让我多问了一步：谁来定义边界，谁有权在出错后改它？

## 先决定什么值得测

这套飞轮不必用在每条提示词上。McKinley 说，对某些事情，从一条简单 skill 开始并一直停在那里也完全可以。是否继续投入，要看行为出错的后果，也要看测试结果能不能影响上线决策。

holdout 只能检查优化器没见过的那些样例，不能替测试补上没想到的失败方式。演讲还让 Claude 生成对抗场景，所以场景覆盖范围本身也需要人审。真要接入这套流程，我会先算测试重复次数、judge 校准和日常维护的成本，再看错误后果是否值得这笔投入。

我会从一项出错后果明确的用户任务开始，让领域负责人写清楚哪些行为算通过，再留出优化器看不到的案例。线上发现新失败后，先判断它是否暴露了规则缺口，再决定要不要补进测试。这样，测试结果才可能进入团队讨论和上线决策。

优化器可以反复改写提示词，但“好”的定义还得有人负责。飞轮能重复试验、搜索改法，不能替团队决定要优化什么。

## 参考资料

- Dan McKinley, *Prompts Aren't Real*（本文原始来源，含 55 张幻灯片与逐页讲者口述稿）：[evaluation.club](https://evaluation.club/)
- Shunyu Yao 等，*τ-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains*（`pass^k` 定义）：[arXiv:2406.12045](https://arxiv.org/abs/2406.12045)
- Lakshya A. Agrawal 等，*GEPA: Reflective Prompt Evolution Can Outperform Reinforcement Learning*：[ICLR 2026 正式版](https://proceedings.iclr.cc/paper_files/paper/2026/hash/0e9e708b6f48e14fd0ac29e167413f76-Abstract-Conference.html)
