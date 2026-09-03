---
$schema: starlight
title: 可信的评估，先学会拒绝你
description: 评估的价值不在于把通过率做高，而在于证据不足时真的能拒绝你的工具、题目和评分器。
date: 2026-09-02
category: ai-agents
---

评估报告连续几周全绿，团队通常会松一口气。我反而会先找失败记录：它最近拒绝过什么？

如果答案是“没有”，绿色可能只是题目太简单，也可能是评分器已经失去判断力。模型、prompt 和工具继续迭代，仪表盘却不动；等到真实用户撞上漏洞，才发现这套评估一直在测模型的常识，没有测到工具带来的增量。

我读[《How to Design AI Evaluations You Can Actually Trust》](https://dev.to/googleai/how-to-design-ai-evaluations-you-can-actually-trust-41c3)时，留下的不是“五条规则”这个清单，而是一个更刺耳的判断：可信的评估，第一职责不是证明你的工具有用，而是尽量给它判不及格。

Google Developer Relations 团队写这篇文章，是为了测试 [google/skills](https://github.com/google/skills) 是否真的能帮 agent 把事情做好。原文给 eval 下了一个很实用的定义：让 agent 执行一个 action，再由 scorer 根据断言判断是否成功。动作和断言缺一不可；没有断言，评估只是演示，有了不合适的断言，评估就会制造假信号。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-02-ai-evals-you-can-trust-img-00-infographic-core-summary-3.png)

## 测试套件最重要的能力，是判错

评估最危险的错误，不是偶尔判错，而是稳定地产生错误的安全感。一次运行消耗的 token 只是账单，真正贵的是错误指标会替团队决定下一步：继续扩大工具、换模型，或者把一个还没证明有效的功能送进生产。

所以我不会先问测试集有多少题，而会先问：这道题到底在测什么增量？如果底层模型不用你的 skill、工具或工作流也能答对，这题测到的是模型本身，不是工具。通过率越高，越要重新跑一遍 baseline，看看题目是不是已经碰到了天花板。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-02-ai-evals-you-can-trust-img-01-source-measurement.png)

原文的测量工具图放在这里刚好。刻度可以很细，但尺子没有对准对象，读数依然没有意义。评估要先固定环境和失败条件：依赖、凭证、沙箱以及真实资源是否可复现？如果执行环境无法安全隔离，就把目标改成评估计划，并明确这不是执行结果。

这也是“评目的地，不评旅程”的边界。要判断任务是否完成，通常应该看最终状态，而不是 agent 有没有按预设顺序调用工具。它绕开你的工具却把结果做对，未必是作弊，可能是在提醒你：这个工具没有提供足够增量。

但安全、金融合规和审计任务另当别论。那些场景里，调用过程本来就是要求，旅程就是目的地。规则不是“永远只看结果”，而是先说清楚你究竟要测什么。

## 五条规则其实在守同一条边界

原文的五条规则可以压成一条工作顺序：先让实验能成立，再让题目有区分度；然后让 prompt 和 grader 遵守同一份契约，最后确认评分对象和样本覆盖没有跑偏。

- **环境**：先弄清框架怎样捕获输出、隔离依赖和访问资源。不能复现的执行，不要冒充执行评估。
- **难度**：先跑 baseline。没有工具也能做对的题，不能证明工具有用。
- **契约**：grader 只能评分 prompt 明确要求的事情。prompt 没说要控制工具调用次数，rubric 就不能事后因为多调用了一次而扣分。
- **对象**：能评分最终结果，就不要把预设的工具序列当成唯一正确路径。
- **覆盖**：每道题都应该贡献不同证据。换十个外壳重复测同一个能力，得到的是十次回声。

这五条看上去分散，实际都在限制同一种错觉：绿色结果究竟由什么造成？环境不稳，绿灯可能来自没测到；题目太容易，绿灯可能来自模型本来就会；契约错配，绿灯和红灯都未必有解释；对象和覆盖跑偏，分数就不能支持工具取舍。

## 只靠绿色分数，你看不出它坏没坏

评论区给了一个值得落地的补丁：prompt 只有在 baseline 仍然失败时，才有资格进入评估套件。heinrichneb 用一个粗略的概率直觉说明这件事：如果 baseline 在独立尝试中连续失败 N 次，那么“它其实本来就能做对”的概率上界约为 `1 − 0.05^(1/N)`；跑 3 次约 63%，跑 5 次约 45%。这不是显著性检验，独立性和样本量仍要自己负责，但它至少把“题目太简单”变成了一个准入问题。

然后给 scorer 配一份 known-bad twin：明知错误的输出必须被判失败。评分器连坏样本都放行，就没有资格给真实输出打分。再留一小组真正改变过生产决策的坏输出，作为回归集；每次改模型或 prompt，都重跑它们。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-02-ai-evals-you-can-trust-img-02-rejection-anchors.png)

baseline 检查题目是否值得留下，known-bad twin 检查评分器有没有松掉，回归集检查旧问题会不会回来。它们不是三个漂亮的指标，而是三个故意让系统失败的机会。

我在自己的博客和微信双线管线里也会留这种失败出口：确定性脚本检查文件和图片，freshness 校验阻止旧 draft 混进下游，结构校验保证两轨的标题和图片顺序一致，发布顺序则要求博客先完成、微信草稿后提交。这不是 AI 评估，不能拿来证明 agent 做得好；它只让我更清楚地看到，任何自动化系统都需要留下“哪里失败、为什么失败、能不能恢复”的记录。

当 agent 在升级、LLM scorer 也在升级时，日期和版本更不能省。否则过几个月，团队只看见一条历史上的绿色曲线，却找不到当时真正触发过拒绝的样本。

## 我会先问这五个问题

如果接手一套已有的 eval，我会按这个顺序体检：

1. **它最近拒绝过什么？** 没有记录，就先怀疑 scorer，而不是庆祝通过率。
2. **baseline 独立失败过几次？** 一次失败只是线索；重复跑过，再决定题目是否留下。
3. **评分器判的每一项，都写进 prompt 了吗？** 没写进去的要求，不能在结果阶段临时加码。
4. **你在评结果，还是在查剧本？** 只有当过程本身是目标时，才把工具顺序设成硬要求。
5. **样本真的测了不同能力吗？** 合并不会改变 verdict 的重复题，把 token 留给能改变决定的用例。

我现在更愿意把通过率放在第二行，把拒绝记录放在第一行。前者说明系统在现有题目上表现怎样，后者才说明这套评估有没有在工作。

这篇文章改完后，我最想留下的也不是一条更高的分数，而是一条可追溯的失败记录：哪次运行拒绝了什么，依据是什么，后来这个依据有没有被新模型推翻。评估能承认自己可能错，才有资格继续测别人。

你手上的评估套件，上一次真正拒绝某个输出是什么时候？

## 参考资料

- [How to Design AI Evaluations You Can Actually Trust — Google AI / Jan-Felix Schmakeit](https://dev.to/googleai/how-to-design-ai-evaluations-you-can-actually-trust-41c3)
- [Designing AI Evals — Joe Spiro（同系列前作）](https://dev.to/googleai/designing-ai-evals-clarity-now-and-visualization-next-4eii)
- [google/skills — Agent Skills for Google products and technologies](https://github.com/google/skills)
- [Agent Development Kit 的 agent-evaluation 文档](https://docs.cloud.google.com/gemini-enterprise-agent-platform/optimize/evaluation/agent-evaluation)
- [evals-skills：Hamel Husain / Shreya Shankar 维护的 AI evals skills 插件](https://github.com/ai-evals-course/evals-skills)

## 延伸阅读

- [给 Agent 加技能反而变蠢？Google 这套开源评测框架，把“体感测试”逼进了工业死角](https://ntlx.github.io/articles/google-ai-evals-skills-inspect)
- [1.5 万 Stars 背后：Google 揭秘 Agent Skills 的工业化构建与治理真相](https://ntlx.github.io/articles/google-agent-skills-behind-the-scenes)
