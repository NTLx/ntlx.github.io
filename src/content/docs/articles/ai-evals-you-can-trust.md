---
$schema: starlight
title: 可信任的评估，先学会拒绝你
description: 一套评估真正有用的地方，不是给出漂亮的通过率，而是能在该拒绝时拒绝你。
date: 2026-09-02
category: ai-agents
---

我读完[《How to Design AI Evaluations You Can Actually Trust》](https://dev.to/googleai/how-to-design-ai-evaluations-you-can-actually-trust-41c3)后，先记住的不是五条规则，而是评论区的一句话：一个从未失败的评分器，和一个已经悄悄停止工作的评分器，最后都会给你一片绿。

这篇文章的背景很具体。Google 的 Developer Relations 团队在给 `google/skills` 写评估，想知道这些 skills 到底有没有帮 agent 把事情做好。文章先把概念拆开：eval 是让 agent 执行的动作，scorer 则根据断言判断动作是否成功。评估每跑一次都要花 token，所以一套写坏的评估，麻烦不在于浪费预算，而在于它会让人误以为工具已经够好了。

我真正想追问的是：一套评估凭什么值得信任？

我的答案和文章标题有点相反。评估的价值，不是给工具发一张成绩单，而是保留一个明确的出口，在证据不够时说“不”。量身高时，我们不会希望尺子为了让人高兴而多报两厘米。评估也一样。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-02-ai-evals-you-can-trust-img-00-infographic-core-summary-1.png)

下面不逐条翻译原文，而是把它的五条规则重新排成一条判断链：先确认实验能不能成立，再确认题目真的能拉开差距；然后检查 prompt 和评分器是否说的是同一件事，最后确认样本没有反复测同一个能力。这样看，五条规则都在为同一个问题服务：这套评估有没有机会拒绝我的假设？

## 绿不一定可信：评估里最贵的成本是假信号

评估最危险的地方，不是它偶尔判错，而是它很稳定地判错。

没有评估时，团队至少知道自己还没有答案。换成一套坏评估，仪表盘可能长时间保持绿色，大家据此继续换模型、改 prompt、扩工具，直到真实用户把漏洞撞出来。那时才发现，原来测到的一直是模型的常识，不是工具有没有帮上忙。

这也是为什么“我们已经有 eval 了”不能算结论。每次运行都要付 token，错误的测试还会把噪音一起写进指标。最先该问的不是 test case 有多少，而是：这个数字到底在测什么？

![原文配图：不同刻度的测量工具](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/2ya5hqnsnkh2tl5jp2vy.png)

## 五条规则，其实是五个证伪阀门

我把原文的五条规则看成五道门。每一扇门都不是为了把分数抬高，而是为了挡住一种不可靠的信号。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-02-ai-evals-you-can-trust-img-01-framework-five-gates.png)

- **环境门**先问实验能不能重复。沙箱能否稳定读到代码输出？任务要访问真实凭证时，能否改用隔离资源或 mock？如果执行本身很难隔离，就退一步，评估 agent 的计划，不要假装自己测到了真实执行。
- **难度门**防止题目太简单。底层模型不借助工具也能答对，工具自然没有发挥空间。题目需要把 baseline 压到会失败，评估结果才可能说明工具带来了什么。
- **契约门**检查 prompt 和 scorer 是否在评同一件事。prompt 没有要求的细节，不能事后偷偷放进评分标准里。否则分数看似精确，实际上没有可解释性。
- **对象门**把注意力放在结果上，而不是 agent 有没有照着预设剧本走。agent 绕开自定义工具仍然答对，可能说明工具没有必要；只有在合规审计等场景，工具顺序本身才是被测对象。
- **覆盖门**检查样本是不是在重复提问。同一种能力换十个外壳，得到的不是十次独立证据，更多时候只是十次回声。

这五道门共同保护的，不是“高通过率”，而是你对结果的解释权。

## 从不拒绝的评分器，和坏掉的评分器，打印同一种绿

评论区的补充让我觉得很实用。heinrichneb 把“避免天花板效应”变成了一个准入测试：一个 prompt 只有在 baseline 仍然失败时，才值得留在套件里。

一次失败只能把“没有工具也能解出来”的上界压到 95%。如果独立跑 N 次都失败，上界可以继续降到 `1 − 0.05^(1/N)`。按这个算法，跑 3 次大约是 63%，跑 5 次大约是 45%。原文那句“把题写难一点”，于是有了可以执行的标准：先测 baseline，再决定题目是不是在测工具。

评论区还提出了一个我认为应该补进流程的规则：证明整套评估真的会说“不”。最简单的做法，是给每个 scorer 配一个 known-bad twin，也就是一份明知有错的输出。评分器连这份样卷都放行，就没有资格给真实答案打分。

还要留住那些曾经影响过生产决策的坏样本。模型或 prompt 变更后，把它们重新跑一遍，看看旧问题是否复发。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-02-ai-evals-you-can-trust-img-02-rejection-tests-triptych.png)

这三样东西各自看不同的位置：baseline 准入检查题目，known-bad twin 检查评分器，回归集检查系统有没有忘记过去的错误。缺了它们，评估报告里的绿色很难区分“表现稳定”和“根本没在工作”。

## 当评分者也在进化，评估必须自带锚点

还有一个容易被忽略的变化：被评估的 agent 会变，评分器也会变。

底层模型升级后，原本需要工具的题目可能已经能直接答出。评分器如果同样由 LLM 驱动，判定口径也可能随着 prompt 的微调慢慢变松。题目和评分器一起漂移，旧套件就会在不知不觉中失去参照物。

![原文配图：不同测量工具的刻度](https://images.unsplash.com/photo-1550985543-49bee3167284)

我在自己的博客和微信双轨管线里遇到过一个小得多、但结构相似的问题。两套产物不能混用，所以管线上有确定性的检查：Step 脚本检查文件和图片，freshness receipt 检查 draft 是否被改过，structural parity 检查两轨的标题和图片数量是否一致。Step 5 如果失败，流程就停在那里；博客已经生成、微信还没有完成时，状态也不会替我们报一个“全部完成”。

这当然不是 agent 评估。它只是说明了一件相同的事：检查系统也要有自己的失败测试。对 scorer 来说，known-bad twin 是一枚锚；对排版管线来说，parity 检查也是一枚锚。没有锚点，连续的绿灯并不能说明系统还在测同一个世界。

## 给评估做体检：五问清单

如果现在要检查一套 eval，我会先问这五个问题：

1. **它最近拒绝过什么？** 没有拒绝记录，先检查评分器是不是已经失去判断能力。
2. **baseline 失败过几次？** 一次失败是线索，不是可靠的准入结论；独立重复后再决定题目是否留下。
3. **评分器判的每一项，都写进 prompt 了吗？** 没写进去的要求，不应该在结果阶段临时加码。
4. **你在评结果，还是在查剧本？** 如果目标是看 agent 能不能完成任务，就不要把预设的工具调用顺序当成唯一答案。
5. **样本真的覆盖了不同能力吗？** 重复样本越多，指标越像回声，越不像证据。

我现在更愿意把“最近拒绝过什么”当作评估的健康记录。拒绝的理由、触发它的样本，以及这个理由今天是否还成立，都应该留下来。

你手上的评估套件，上一次真正拒绝某个输出，是什么时候？

## 参考资料

- [How to Design AI Evaluations You Can Actually Trust — Google AI / Jan-Felix Schmakeit](https://dev.to/googleai/how-to-design-ai-evaluations-you-can-actually-trust-41c3)
- [Designing AI Evals — Joe Spiro（同系列前作）](https://dev.to/googleai/designing-ai-evals-clarity-now-and-visualization-next-4eii)
- [google/skills — Agent Skills for Google products and technologies](https://github.com/google/skills)
- [Agent Development Kit 的 agent-evaluation 文档](https://docs.cloud.google.com/gemini-enterprise-agent-platform/optimize/evaluation/agent-evaluation)
- [evals-skills：Hamel Husain / Shreya Shankar 维护的 AI evals skills 插件](https://github.com/hamelsmu/evals-skills)

## 延伸阅读

- [给 Agent 加技能反而变蠢？Google 这套开源评测框架，把“体感测试”逼进了工业死角](https://ntlx.github.io/articles/google-ai-evals-skills-inspect)
- [1.5 万 Stars 背后：Google 揭秘 Agent Skills 的工业化构建与治理真相](https://ntlx.github.io/articles/google-agent-skills-behind-the-scenes)
