---
$schema: starlight
title: 可信任的评估，先学会拒绝你
description: 从不拒绝的评分器和坏掉的评分器，打印的是同一种绿。可信的评估第一职责不是证明工具有用，而是尽量证明它没用。
date: 2026-09-02
category: ai-agents
---

把[《How to Design AI Evaluations You Can Actually Trust》](https://dev.to/googleai/how-to-design-ai-evaluations-you-can-actually-trust-41c3)读完之后，留在我脑子的不是那五条规则清单，而是评论区里一句话：a grader that has never failed and a grader that silently stopped running print the same green（从未失败过的评分器，和悄悄停止运行的评分器，输出的是同一种绿）。

Google 这篇讲的是怎么给自家 `google/skills` 写评估：它的定义很干脆，eval 是你让 agent 执行的那个动作，scorer 负责断言它算不算成功。五条规则说的是评估环境、天花板效应、prompt 和评分器错配、该评目的地还是旅程、数据集怎么去重。这些都对，但它们更像注意事项，没有真正回答一个问题：一个评估系统凭什么值得信任？

我读完的结论是反直觉的：可信的评估，第一职责不是证明你的工具工作正常，而是尽力证明它没用。评估的价值不在"全绿"，在它能不能拒绝你。量身高你不会希望尺子因为讨好你而多报两厘米，评估同理。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-02-ai-evals-you-can-trust-img-00-infographic-core-summary.png)

这篇文章不做规则翻译，想把五条规则收敛成一个命题：**评估的信任度，等于它能证伪你的程度**。再把它补完。评论区给出了三样被正文遗漏的东西，合起来才让一套评估真正"能说 no"。

## 绿不一定可信：评估里最贵的成本是假信号

原文没有把话说得很难听，但它实际在说：评估消耗真金白银的 token，写得不认真的评估会同时造成三样后果：假信号、被浪费的 token、指标里的噪音。

三样里最毒的是假信号。没有测试的时候，你至少知道自己不知道；有一套坏测试，你得到一张全绿的仪表盘，然后主动失去追问能力。很多团队把"我们有 eval"当成安全气囊，但那套 eval 测的是模型自己的常识，不是他们的工具。指标常年稳定在九成以上，团队安心迭代，直到真实场景把差距补上才出问题。

所以评估的头号问题不是"我写了多少个 test case"，而是"这个数字真的在测我的工具吗"。原文五条规则，问的是同一件事。

## 五条规则，其实是五个证伪阀门

把五条规则并排看，它们是同一个机制的五个部分：

- **环境阀**：证伪实验能跑在哪。沙箱能不能确定性读到代码输出，该不该 mock 真实凭证，太依赖真资源的任务能不能退一步评"计划"而不是"执行"。这一条在划定实验台，不划定分数高不高。
- **难度阀**：题目要难到 baseline 答不上来。尺子不够长的时候，量谁都一样高，你只能看见没有差异。
- **契约阀**：评分器判的每一项，都必须写在任务 prompt 里。你要求开飞机，评分表按开坦克打分，分数就没有任何决策含义。
- **对象阀**：要证伪的是"agent 没达成目标"，不是"agent 没按我的剧本走"。这条里藏着我最喜欢的反直觉点：agent 绕开你的自定义工具直接答对，这不是工作流 bug，它本身就是一个证伪信号，说明在这个任务里你的工具还不必要。
- **覆盖阀**：每个样例测不同能力。同一个能力测十遍，不是十次证伪，是十次回声，最后过拟合还是小事，token 全烧在重复上。

五道阀门合起来指向一句话：评估系统对你的价值，等于它拒绝你错误假设的能力。

## 从不拒绝的评分器，和坏掉的评分器，打印同一种绿

评论区最值得引的是 heinrichneb 那段，它把天花板规则变成了可测量的一组操作。一个 prompt 只有在 baseline 仍然失败时，才有资格留在套件里。单次 baseline 失败只是把"没有你的工具也解得出来"的上界压到 95%，独立尝试 N 次后，这个界降到 (1 − 0.05^(1/N))：三次失败压到 63% 上下，五次到 45% 上下。"把题写难一点"这一句，从作者的主观印象变成一组可以执行的测量。用这套规则重跑老套件，会静默移走一批其实在测模型先天能力的题目。

他还补了正文没有的一条第六规则：prove the suite can say no，翻译过来就是证明你的套件能说"不"。给每个评分器配一个 known-bad twin，一份明知是错的样卷，评分器必须判它失败。连样卷都放行的评分器，没有资格给真实答案打分；再记下套件上次真正拒绝某个输出的日期。

为什么这条重要：你没法从报告上分辨"从未失败"和"已经坏掉"。一个停摆的评分器会一直报通过，一个不敢说"不"的评分器也一直报通过，报告里那抹绿不携带任何信任信息。alexshev 又在评论里补了第三样：把真实改变过生产决策的那些坏输出，留一个小型回归套件，每次换模型或改 prompt，都要重跑一遍"曾经错过的东西"。

准入测试管题目，twin 管评分器，回归集管复发。后面两样其实是同一机制的两个方向：给评估系统装上拒绝这个出口。没有出口的系统，你只能靠信仰运行它。

![卷尺特写：刻度本身也需要被校准](https://images.unsplash.com/photo-1550985543-49bee3167284)

## 当评分者也在进化，评估必须自带锚点

这里藏着原文没点破的、更麻烦的趋势：LLM 正在同时移动两把尺子。被评估的 agent 在进步，原文自己在规则二里就承认，底层模型会进步到不需要你的工具；而评估 agent 的评分器也是 LLM，标尺和被标尺的东西在共同漂移。

套件没有锚点，老化就是无声的：上个季度必须靠工具才能答对的题，这个季度 base model 自己会了；评分器的判定口径，也可能因为 owner 的反复微调越放越松。你每年跑一轮全绿，很可能是在检测一个已经漂走的旧世界。

我的双线发布管线算一个小对照。博客加微信，两套产物不通用，管线里排了一串确定性 Gate：step 脚本校验产物，humanizer receipt 做 fresh 校验，structural parity 检查两轨的标题层级和图片数量一致，发布顺序固定博客先行。这套东西没有任何 LLM 评分器，解决的是格式和协议问题，跟 agent 评估不是一回事。但有一点完全相通：链条上每个环节都必须在设计里预留"可以失败"的出口。Step 5 跑挂，就停在那一步，把输入修好重新来，程序绝不会宣布"两边都已完成"。博客上了、微信没上，就是没完成，状态不撒谎。

一个系统靠不靠谱，常常看的是它有没有预留失败出口、有没有办法把"坏了"和"正常"分开，至于它最亮的主逻辑，反而不是重点。known-bad twin 之于评分器，就像 structural parity 之于排版，都是给"检查者"装的检查钩子。

## 给评估做体检：五问清单

把这篇浓缩成五个问题，任何 eval 项目都可以直接拿来自查：

1. **它最近拒绝过什么？** 如果记忆里没有任何一次拒绝记录，警惕。从不拒绝，等于可能早已坏掉。
2. **baseline 真的失败过吗，几次？** 单次失败只说明大概率无工具也能解，三次并列才到 63% 的可靠度。用测量而不是印象来定准入。
3. **评分器判的每一项，都写在任务 prompt 里了吗？** 只要有一项不在，就是错配，会挑你最需要信号的时候制造假波动。
4. **你在评结果，还是在查剧本？** 抛开合规审计不谈，评分器盯着"agent 是否按你预设的工具序列走"，量的是听话，不是能力。
5. **每个样例测的是不同能力吗？** 重叠高等于过拟合，外加 token 烧在回声上。

评估系统的健康指标不是正确率，而是它最近攒下的拒绝记录：拒绝了什么、为什么拒绝、那个理由现在是否还成立。

读这篇到最后，留下来的问题很简单：**你手上的评估套件，上一次真正拒绝某个输出，是什么时候？**

## 参考资料

- [How to Design AI Evaluations You Can Actually Trust — Google AI / Jan-Felix Schmakeit](https://dev.to/googleai/how-to-design-ai-evaluations-you-can-actually-trust-41c3)
- [Designing AI Evals — Joe Spiro（同系列前作）](https://dev.to/googleai/designing-ai-evals-clarity-now-and-visualization-next-4eii)
- [google/skills — Agent Skills for Google products and technologies](https://github.com/google/skills)
- [Agent Development Kit 的 agent-evaluation 文档](https://docs.cloud.google.com/gemini-enterprise-agent-platform/optimize/evaluation/agent-evaluation)
- [evals-skills：Hamel Husain / Shreya Shankar 维护的 AI evals skills 插件](https://github.com/hamelsmu/evals-skills)
- [浅谈"gray and yellow measures"卷尺照片 — William Warby on Unsplash](https://unsplash.com/photos/gray-and-yellow-measures-WahfNoqbYnM)

## 延伸阅读

- [给 Agent 加技能反而变蠢？Google 这套开源评测框架，把"体感测试"逼进了工业死角](https://ntlx.github.io/articles/google-ai-evals-skills-inspect)
- [1.5 万 Stars 背后：Google 揭秘 Agent Skills 的工业化构建与治理真相](https://ntlx.github.io/articles/google-agent-skills-behind-the-scenes)