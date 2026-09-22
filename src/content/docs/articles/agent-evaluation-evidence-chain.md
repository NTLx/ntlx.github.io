---
$schema: starlight
title: 测试通过之后，Agent 还欠你一条证据链
description: Agent 评估最缺的不是更多题，而是一条能回答“与什么相比、发现了什么、能否复现、谁来裁决”的证据链。
date: 2026-09-22
category: ai-agents
primarySourceUrls: ["https://tessl.io/blog/ai-agent-evaluation-starts-with-evidence"]
---

Agent 最容易骗过人的时候，不是它报错，而是它把所有测试跑绿。

我读 [Justin Cormack 的《AI Agent Evaluation Starts With Evidence》](https://tessl.io/blog/ai-agent-evaluation-starts-with-evidence) 时，反复回到这件事上。文章讲的是一个很具体的项目：用 AI 构建 S3-compatible object storage。演讲时，代码库已经有约 350,000 行 Rust，作者也明确说自己不可能假装读完每一行。

文章也没有把答案归结为“测试越多越好”。Cormack 花了不少篇幅说明，100% coverage 会把 Agent 引向一些没有意义的测试。真正让他逐渐恢复信心的，是一条越来越厚的反馈链：外部系统的行为、边界条件、可重复的异常、稳定的测试、trace、类型约束、安全审查，以及人还在现场做判断。

读完我只想留下一个判断：**Agent 评估的最小单位不是分数，而是一条证据链。**它至少要回答四个问题：与什么相比，发现了什么，能否复现，谁来裁决。

![Agent 评估的证据链：基线、发现、复现与裁决](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-22-agent-evaluation-evidence-00-infographic-core-summary.png)

## 测试通过，为什么仍然不够

Cormack 一开始也追过 100% test coverage。结果是，Agent 写出了一些只会让数字上涨的琐碎测试。原文没有因此否定覆盖率：大多数文件仍然有 75% 到 100% 的 coverage。问题在于，覆盖率只告诉你代码走过哪些位置，不会替你决定哪些位置值得怀疑。

自动化很容易把这一区别抹平。

给 Agent 一个“补齐覆盖率”的任务，它很自然会寻找最短路径：把缺口填上，把断言写得足够松，把报告变绿。它不需要知道你真正担心什么，也不需要理解某个失败会不会改变架构。只要目标函数是百分比，它就会认真优化百分比。

我更愿意把测试看成探测器。它的价值在于把未知变成已知，把怀疑变成可以运行的实验。你觉得哪段代码不对劲，就在那里加压力；你说不清自己担心什么时，测试数量再多也可能只是在扩大盲区。

这也是我读完后最想补给“评估”这个词的一层含义：评估不是把系统压缩成一个读数，而是不断增加自己能解释的东西。一个新的绿色结果，如果没有改变我们对风险的认识，未必值得庆祝。

## 先找一个不会和 Agent 一起自嗨的基线

这篇文章里最有力量的设计，是把 S3 当成 test oracle。Cormack 写到，他建立了约 1,500 个直接针对 S3 运行的测试，用真实系统的行为锁定实现应该怎样表现。

这比“请按照 S3 的方式实现”具体得多。后一句话把判断留在语言里，前一句话把判断交给了可以重复运行的行为对照。Agent 不需要从零猜测兼容性，人也不必靠读完所有文档来证明每个细节。

但作者同时提醒，oracle 不等于 specification。外部系统可能有不稳定、延迟和需要解释的行为。测试跑出来的结果是证据，不是自动生成的真理。文档可以告诉你该怀疑哪里，真实行为才告诉你系统实际上做了什么；而“实际发生过”也不等于“应该如此”。

这给 Agent 项目一个很实用的起点：先做一个足够简单、能表达行为的版本，再围绕它建立对照。复杂实现可以在后面慢慢替换，行为基线先留下来。它不一定是最终架构，却能防止 Agent 在复杂度里逐渐把自己的假设当成事实。

我会把这叫作“不会和 Agent 一起自嗨的基线”。它不要求基线完美，只要求基线的来源与被测实现尽量分开。一个由同一套 prompt 生成、再由同一套假设打分的测试，很可能只是在给自己回声。

![演讲《When Tests Lie: Using Observability to Keep AI Honest》封面](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-22-agent-evaluation-evidence-source-talk-cover.jpg)

## 让失败留下可以追问的痕迹

测试套件真正开始赢得信任，是在它发现奇怪东西的时候。

原文写到，AI 在针对 S3 的边界测试里发现过一个可重复的 500 错误，后来又发现了另一个。Cormack 还提到，自己会主动追问零长度、单长度、10,001 长度之类的边界。Agent 可以把这种怀疑变成测试，但怀疑从哪里来，仍然需要一个会读文档、会观察异常的人。

这里有个重要的分工：模型擅长把“试一下这个角落”扩展成很多执行动作，人更擅长决定“为什么要试这个角落”。如果把后一个问题也交给模型，测试套件很容易在已知路径上变得非常勤奋，却没有更接近真正的风险。

另一个细节更值得写进工程规约：不要让 flaky tests 变成背景噪声。Cormack 的硬规则是立即修复。他当时有约 5,000 个测试，约两分钟可以跑完；遇到罕见条件，还会在多台机器上反复跑 overnight tests。

快速运行的价值，在于让团队有机会频繁重放一个信号，尽早把偶发失败和真实回归区分开。一次测试太贵，大家就会下意识减少运行次数，最后把“没再失败”误读成“已经修好”。

但测试仍然看不见所有东西。它不能自动发现所有安全问题，也不能单独决定架构是否良好，更不能告诉你自己遗漏了哪些测量。Cormack 说得很直白：如果你无法观察一个东西，就很难真正测试它。

因此他让 AI 构建了一个手工维护的 tracing framework。它不需要先接进一套完整的生产 observability 平台，先能记录一次 overnight run 发生了什么，就足以让调试有对象可追问。失败如果没有输入、状态和运行轨迹，Agent 往往只能猜一个看起来合理的修复；有了 trace，至少可以围绕同一条件重放和比较。

![从失败到 trace，再到可重放的回归信号](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-22-agent-evaluation-evidence-01-trace-replay.png)

有些问题甚至不该继续靠测试兜底。文章提到，权限检查和 time-of-check/time-of-use 的一部分问题，后来被表达进类型系统，让需要授权请求的函数只能接收授权请求。能在编译期禁止的错误，就不必等到运行时再增加一层“希望测试刚好覆盖到”的祈祷。

## 评估不是给 Agent 打分，而是积累证据

读到这里，我才觉得标题里的 evidence 不只是“多写几条测试”。它是一种组织反馈的方式。

我会把一套 Agent 评估先问成四句朴素的话：

1. **与什么相比？** 是外部系统、简化实现、历史故障，还是一份明确的行为契约？
2. **发现了什么？** 这次运行有没有触碰到边界、未知和反例，还是只把熟悉路径再走了一遍？
3. **能否复现？** 失败有没有留下 trace、输入、状态和环境，让下一次修复可以被重放？
4. **谁来裁决？** 哪些风险需要类型或确定性边界，哪些结果值得保留，什么时候必须让人重新定义问题？

我不想把这四句做成新的评分标准，也不想把所有工程工作拆成四个仪表盘。它们更像一组检查：证据究竟断在了哪一环？没有基线，分数没有参照；没有发现，绿色可能只是题目太容易；没有复现，修复会变成猜谜；没有裁决，系统只会继续优化一个未必值得优化的数字。

原文最后说，他不把 AI agent evaluation 看成 single score，而是看成由 test oracle、边界发现、flaky-test discipline、trace、性能检查、安全审查、类型约束和 human judgement 组成的 evidence loop。我认同这个结论，但还想加一条：证据链要记录“为什么相信”，也要记录“什么时候不再相信”。

这也是我之前写的[《可信的评估，先学会拒绝你》](https://ntlx.github.io/articles/ai-evals-you-can-trust)没有覆盖完的部分。能拒绝错误输出，是评分器的底线；能解释拒绝依据、复现失败，并把新发现带回下一轮测试，才是系统开始变得可靠的迹象。

所以，下一次看到 Agent 的评估报告时，我不会先问通过率是不是又涨了。我会先找四样东西：它和什么比较，最近发现过什么意外，失败能不能重放，以及最后是谁决定这条证据够不够。

Agent 可以替我们执行越来越长的任务，但“什么算完成、什么算危险、什么证据足够”仍然不能被一个漂亮的绿色数字代答。评估的终点不是更高的分数，而是更少的盲区。

## 参考资料

- Justin Cormack：《[AI Agent Evaluation Starts With Evidence](https://tessl.io/blog/ai-agent-evaluation-starts-with-evidence)》
- Justin Cormack：《[When Tests Lie: Using Observability to Keep AI Honest](https://www.youtube.com/watch?v=xHxfeWtkXrM)》
- Tessl：[演讲配套 SKILL.md](https://tessl.io/registry/ainativedev/aidevcon-2026-ldn/0.100.8/files/talk-cormack-tests-lie-observability-ai/SKILL.md)
- Tessl：[演讲 outline.md](https://tessl.io/registry/ainativedev/aidevcon-2026-ldn/0.100.8/files/talk-cormack-tests-lie-observability-ai/outline.md)
- Tessl：[演讲 quote.md](https://tessl.io/registry/ainativedev/aidevcon-2026-ldn/0.100.8/files/talk-cormack-tests-lie-observability-ai/quote.md)
- Tessl：[演讲 transcript.md](https://tessl.io/registry/ainativedev/aidevcon-2026-ldn/0.100.8/files/talk-cormack-tests-lie-observability-ai/transcript.md)

## 延伸阅读

- [可信的评估，先学会拒绝你](https://ntlx.github.io/articles/ai-evals-you-can-trust)
- [给 Agent 加技能反而变蠢？Google 这套开源评测框架，把“体感测试”逼进了工业死角](https://ntlx.github.io/articles/google-ai-evals-skills-inspect)
- [Agent 能跑 demo 不算本事，能跑一年才是](https://ntlx.github.io/articles/agent-development-lifecycle)
