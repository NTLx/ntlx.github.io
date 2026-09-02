---
$schema: starlight
title: 可信任的评估，先学会拒绝你
description: 评估的价值不在于把通过率做高，而在于证据不足时真的能拒绝你的工具、题目和评分器。
date: 2026-09-02
category: ai-agents
---

我读[《How to Design AI Evaluations You Can Actually Trust》](https://dev.to/googleai/how-to-design-ai-evaluations-you-can-actually-trust-41c3)时，最先想到的不是“评估要有五条规则”，而是一个更难听的问题：这套评估最近一次拒绝了什么？

一个从不失败的评分器，可能很优秀，也可能早就坏了。仪表盘仍然是绿色，团队继续换模型、改 prompt、加工具，直到真实用户把漏洞撞出来。那时才发现，评估一直在测模型的常识，没测到工具的增量。

Google Developer Relations 团队写这篇文章，是因为他们要测试 [google/skills](https://github.com/google/skills) 到底有没有帮 agent 把事情做好。原文把 eval 说得很朴素：让 agent 做一个 action，再让 scorer 根据断言判断结果是否成功。这个定义让我停了一下。评估不是给系统颁奖，它首先得保留一个说“不”的出口。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-02-ai-evals-you-can-trust-img-00-infographic-core-summary-2.png)

我想把原文的五条规则重新排一下。它们不是五条独立的经验，而是五道限制条件：先让实验能成立，再让题目有区分度；接着检查 prompt 和评分器是否遵守同一份契约，最后确认评分对象和样本覆盖没有跑偏。每道门都在问同一件事：如果我的假设错了，这套评估有没有机会把它指出来？

## 评估先要回答：什么时候应该拒绝

评估最贵的错误，不是一次判错，而是稳定地产生假信号。没有评估时，团队知道自己还没有答案；坏评估会主动把错误答案包装成进展。每次运行消耗的 token 只是账单，真正麻烦的是指标会推动人做出下一步决定。

所以我不会先问测试集有多少题，而会先问：**这道题在测什么增量？** 如果底层模型不用你的 skill、工具或工作流也能答对，测试得到的只是模型能力，不能说明工具值得保留。通过率越高，反而越需要检查它是不是碰到了天花板。

![原文配图：不同刻度的测量工具](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/2ya5hqnsnkh2tl5jp2vy.png)

这张测量工具的图很贴切：刻度再精细，也救不了一把没有对准对象的尺子。评估的第一步不是把数字做得漂亮，而是确认测量对象、环境和失败条件都在场。

## 五条规则，其实是五道门

原文的五条规则可以压缩成一条实验路径。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-02-ai-evals-you-can-trust-img-01-framework-five-gates-1.png)

- **环境门**：先确认沙箱能稳定读到输出，依赖、凭证和真实资源是否被隔离。无法安全复现的任务，就改测 agent 的计划，不要把计划测试冒充执行测试。
- **难度门**：先跑 baseline。模型不靠你的工具就能做对的题，没有足够区分度；题目要让“工具是否有用”成为真正的变量。
- **契约门**：grader 只能评分 prompt 明确要求的事情。prompt 没要求 agent 控制工具调用次数，rubric 就不能事后因为多调用了一次而扣分。
- **对象门**：如果目标是判断任务是否完成，就评分最终结果，不要把预设的工具序列当成唯一正确路径。agent 绕过你的工具却答对，可能正是在告诉你工具并不必要。
- **覆盖门**：样本要覆盖不同能力和真实用户旅程。换十个外壳重复测同一个概念，得到的是十次回声，不是十份独立证据。

五道门都通过，绿色结果才有解释空间。它们没有承诺分数一定高，只是在减少“绿灯到底代表什么”的歧义。

## 绿色指标要配一组故意失败的样本

评论区给了我一个很实用的补充：**一个 prompt 只有在 baseline 仍然失败时，才有资格进入评估套件。** 这里的失败不是一句感觉，而可以有一个粗略的统计直觉：如果在独立尝试中 baseline 连续失败 N 次，那么“无工具也能做对”的概率上界大约是 `1 − 0.05^(1/N)`。跑 3 次约为 63%，跑 5 次约为 45%。

这不是万能的显著性检验，独立性和样本量都需要自己负责。但它把“题目太简单”从印象变成了准入问题：先测 baseline，再决定是否值得为这道题支付后续 token。

还缺两类样本。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-02-ai-evals-you-can-trust-img-02-rejection-tests-triptych-1.png)

- **known-bad twin**：给 scorer 一份明知错误的输出。它连这张样卷都放行，就没有资格给真实输出打分。
- **生产回归集**：把曾经改变过生产决策的坏输出留下来。每次模型或 prompt 变更，都重跑这组样本，确认旧问题没有悄悄回来。

baseline 检查题目是否太容易，bad twin 检查评分器是否太宽，回归集检查系统是否忘了过去。三者指向不同位置，却共同回答“评估能不能说不”。我会把“最近拒绝过什么、为什么拒绝、这个理由现在还成立吗”记录成评估的健康记录。

## 目的地原则有边界：有时旅程本身就是结果

“评分目的地，不评分旅程”是五条规则里最容易被滥用的一条。如果任务是判断 agent 有没有把事情做成，最终状态通常比工具调用顺序更重要；但在安全、金融合规或审计场景，过程本身就是要求，旅程当然应该被记录和评分。

这个边界也让我想到自己的博客和微信双线管线。它不是 agent eval，但它有相同的纪律：确定性脚本检查文件和图片，freshness receipt 检查 draft 是否被改过，structural parity 检查两轨标题和图片拓扑是否一致，发布顺序则要求博客先完成，再提交微信草稿。

![原文配图：不同测量工具的刻度](https://images.unsplash.com/photo-1550985543-49bee3167284)

这里的类比只到“检查系统也需要失败出口”为止。发布管线检查的是产物是否符合协议，AI 评估检查的是 agent 是否完成任务，二者不能互相充当证据。它们的共同点，是都不能只因为连续通过，就假定自己仍在测同一个世界。

当被评估的 agent 在升级，评分器也由 LLM 驱动时，锚点就更重要：baseline 记录工具的必要性，bad twin 记录评分器的拒绝能力，回归集记录历史错误。最好再留下触发拒绝的日期和版本，否则过几个月连“为什么当时判错”都找不回来。

## 我会把评估体检写成五个问题

如果接手一套已有的 eval，我会先逐项回答：

1. **它最近拒绝过什么？** 如果答案是“没有”，先检查 scorer 是否失去判断力。
2. **baseline 独立失败过几次？** 一次失败只是线索；重复跑过，再决定题目是否有资格留下。
3. **评分器判的每一项，都写进 prompt 了吗？** 没写进去的要求，不能在结果阶段临时加码。
4. **你在评结果，还是在查剧本？** 只有当过程本身是目标时，才把工具顺序设成硬性要求。
5. **样本真的测了不同能力吗？** 合并重复题，把 token 留给能改变判断的用例。

我现在更愿意把“通过率”放在第二行，把“拒绝记录”放在第一行。前者告诉你系统在现有题目上表现怎样，后者才告诉你这套评估有没有在工作。

你手上的评估套件，上一次真正拒绝某个输出是什么时候？拒绝的理由现在还站得住吗？

## 参考资料

- [How to Design AI Evaluations You Can Actually Trust — Google AI / Jan-Felix Schmakeit](https://dev.to/googleai/how-to-design-ai-evaluations-you-can-actually-trust-41c3)
- [Designing AI Evals — Joe Spiro（同系列前作）](https://dev.to/googleai/designing-ai-evals-clarity-now-and-visualization-next-4eii)
- [google/skills — Agent Skills for Google products and technologies](https://github.com/google/skills)
- [Agent Development Kit 的 agent-evaluation 文档](https://docs.cloud.google.com/gemini-enterprise-agent-platform/optimize/evaluation/agent-evaluation)
- [evals-skills：Hamel Husain / Shreya Shankar 维护的 AI evals skills 插件](https://github.com/hamelsmu/evals-skills)

## 延伸阅读

- [给 Agent 加技能反而变蠢？Google 这套开源评测框架，把“体感测试”逼进了工业死角](https://ntlx.github.io/articles/google-ai-evals-skills-inspect)
- [1.5 万 Stars 背后：Google 揭秘 Agent Skills 的工业化构建与治理真相](https://ntlx.github.io/articles/google-agent-skills-behind-the-scenes)
