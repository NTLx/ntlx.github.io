---
$schema: starlight
title: 专家的理由，77% 是 agent 写的
description: Anthropic 让 50 名分析师带着随机倾向的 agent 做分析：86% 的决策跟随倾向，77% 的人事后用 agent 的论点解释选择，却几乎都认为是自己的判断。判断在过程中被构造，末端签字兜不住它。
date: 2026-11-24
category: ai-industry
primarySourceUrls: ["https://www.anthropic.com/research/agents-judgment-calls"]
---

Anthropic 在 10 月 27 日发了一篇[研究博文](https://www.anthropic.com/research/agents-judgment-calls)，我读完正文，又把配套的[论文](https://assets.claude.com/519c17a5d23a794e8b6d50a854048d0b61e0d73a.pdf)《Who's Aligned to Whom?》翻了一遍。实验里最让我停下来的不是那个被广泛转载的 86%，而是事后问卷里的两个数字：77% 的分析师在解释自己的决策时，复述了 agent 给过的论点，有时逐字一致；只有 15% 的人在任何一条回答里提到这些论点来自 agent。

他们不是抄错了作业。他们真诚地认为那是自己的想法。

![文章核心信息图：判断是谁做的——硬币定倾向、八成六跟随、理由被代笔、先写自己的立场](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-24-agents-judgment-calls-img-00-infographic-core-summary.png)

## 一场把倾向交给硬币的实验

实验请了 61 名通过因果推断筛查的职业分析师，其中 50 人用内置 Claude Code 的网页版 VS Code 完成一项任务：评估虚构的 Greenfields 农业合作社的一个咨询项目，决定推广还是停办。董事会的门槛是生产率提升约 3–4%，但没说生产率该怎么测。11 人选择不用 agent，只作对照。

任务里刻意留了四个没有唯一正解的决策：生产率按每公顷产量算，还是按单位运营成本产量算；用双重差分，还是水平调整；估计入会农场的效果，还是全体成员的效果；每个农场等权，还是按产量加权。每个选项都有合理依据，但组合起来足以把估计值推过或推不过那条 3–4% 的线。最后还有一个决策：推广，还是停办。

研究者给每个分析师的 agent 注入了一组倾向——每个决策偏向哪一边，由掷硬币决定，写进分析师看不到的 system prompt。agent 被要求为自己的倾向做最诚实的辩护，证据决定性反对时可以改口，但不得误导、不得藏数据。

结果：四项分析决策上，分析师 86% 的时候跟随了 agent 的倾向。如果 agent 的意见无关紧要，这个比例应该在 50% 左右。注册的合并翻转率是 72%（95% 置信区间 0.60–0.83）。单项看，结果测量 92%、比较方法 82%、覆盖范围 81%、加权 90%。

![原文结果点图：按 agent 倾向分组，五项决策中选择 A 选项的分析师比例（Outcome 0% 对 82%，Comparison method 28% 对 92%，Which farms 38% 对 100%，Weighting 22% 对 100%，Recommendation 36% 对 54%）](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-24-agents-judgment-calls-img-01-infographic-follow-dotplot.png)

最终建议那一环，agent 的直接推力反而小：倾向推广时 54% 的人推荐推广，倾向另一方时是 36%，注册检验下这个位移不显著。读到这里容易松一口气——看来人在最后关头还是守住了。但论文的探索性分析显示：只用四个中间决策的硬币结果，就能正确预测 82% 的最终建议（多数类基线 61%，样本内分析，排除提延长方案的人）。建议看起来是跟着估计值走的，估计值却早已被上游四个决策塑造。硬币在任务开始前就大致写好了结尾。

## 理由是谁写的，专家说不清

更值得细看的是顺从怎样发生。在 38 个分析师先于 agent 表态的决策里，agent 反对时他们 60% 改了口，agent 赞同时只有 6% 改口——不过这个对比基于事后选出的小样本，置信区间宽到 24–82 个百分点，只能当方向性证据。更多时候根本轮不到“改口”：77% 的决策是 agent 先表态的，手工编码的会话里，39% 的决策分析师从头到尾没问过也没表过态。

![原文话语对照：agent 会话中的论点（橙）与分析师事后问卷理由（蓝）的逐字或近逐字重合示例，涉及加权方式与延长一季两个决策](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-24-agents-judgment-calls-img-02-infographic-argument-overlap.png)

心理学家 Slovic 在 1995 年的[经典论文](https://doi.org/10.1037/0003-066X.50.5.364)里论证过，偏好常常不是从记忆里取出来的，而是在被追问、被呈现选项的过程中构造出来的。把这个结论放进实验场景：先开口的 agent 不只是提供了一个答案，它参与了专家立场的构造。专家跳过“我自己怎么看”这一步，直接采纳了现成的理由——事后连措辞都是 agent 的。

论文对会话的细读支持这个解释。agent 确实诚实：它经常解释“换一个选项，结果会怎样”。但它几乎从不解释“一个胜任的专家为什么会选另一边”。单侧论证加上流畅自信，让另一侧始终没有进入视野。这不是误导——agent 被要求不得歪曲结果、不得隐藏数据——正因如此，它比误导更难防。

问卷的其余部分也印证了这一点。52% 的人认为最终建议更多是自己的，35% 认为大部分或完全是自己的；全程跟随 agent 倾向的人，自信度均值 71，其余人 73（量表从 0“等于掷硬币”到 100“押上职业声誉”）。归属感和自信都不受影响。48 份问卷里 6 人猜中研究关心 AI 的影响，没有人怀疑倾向被操纵过。他们记得自己选了什么（回忆准确率 85%），只是不知道理由是谁写的。

## 末端验收为什么兜不住

我读这篇研究时一直想到自己[写过的验收问题](https://ntlx.github.io/articles/handshake-expert-judgment)：AI 把活干完以后，两份结果一致，也可能错在同一个地方。这篇论文把问题推得更深：对没有唯一正解的决策，连“错”都不存在——选哪边，输出都显得成立。

于是常见的三种质量手段同时失效。查错误？没有错误可查，每个选项都合理。对参考答案？没有参考答案。事后问专家“这是你的判断吗”？他们会说是，而且自信度和独立判断的人一样高。签字、验收、评审，全都建立在“交付物里能看出问题”或“人能报告自己的状态”这两个假设上，而这类决策恰好把两个假设都拆掉了。

![三种末端质量手段在没有唯一正解的决策上逐一失效：查错误没有错误可查、对参考答案没有参考答案、问专家他们会说是](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-24-agents-judgment-calls-img-03-framework-signoff-failure.png)

这也让我重新理解[把代码评审搬到动手之前](https://ntlx.github.io/articles/verifying-intent)那篇 Tessl 实践的意义。先定验收标准再动手，正是“先形成自己的立场”的工程化。但那篇文章自己追问过：谁来检查报告没有问错问题？这篇实验给出了一个不舒服的答案——问题本身可能已经被 agent 的先验塑造了。先写标准这个动作的价值，不在于标准多完备，而在于它发生在 agent 开口之前。

哥本哈根商学院的 Nicolai Foss 在[读后评论](https://nicolaijfoss.substack.com/p/the-illusion-of-a-human-in-the-loop)里借组织经济学的旧框架说得更直白：Aghion 和 Tirole 区分形式权威（拍板的权利）和实质权威（对决策的有效控制）。agent 不需要拍板权，它决定哪些选项被考虑、哪些假设被采纳、哪些证据被强调，就拿到了实质权威。人保留形式权威，签字照常，控制已经转移。他还提到一个集体层面的麻烦：三个部门都推荐同一个方案，看起来是三份独立证据；如果三个部门用的是同一个模型，这份一致可能只是一个先验的回声。论文自己的模拟给了注脚：不注入倾向的 Claude Opus 4.8，在 123 次运行里 112 次做出完全相同的五项选择。

## 这不是“少用 AI”的论证

读到这里容易得出一个省事的结论：那就少让 agent 参与判断。论文的数据不支持这个方向。用 agent 的 50 人里只有 3 人（6%）犯了使结果无效的严重方法学错误，不用 agent 的 11 人里有 6 人（55%）；中位耗时 65 分钟对 90 分钟。当然，两组是自选的，不用 agent 的一组资历更浅（硕博 4/11 对 24/46），不能当因果结论——但至少说明，让渡一部分判断换来执行质量的提升，可能是划算的交易。

还有一个必须交代的边界：实验里的倾向是被 system prompt 刻意放大的，86% 不能当成真实工作的普适顺从率；任务只有一个领域、一个模型，分析师懂因果推断却不懂农业，真实工作里他们的领域立场会更强。不过论文也验证了放大的不是凭空制造的行为：stock agent 在用户声明了相反决定、只要代码时，66% 的情况下仍会主动提出另一个选项，41% 会推荐或主张它。倾向是本来就有的，prompt 只是把它调响了。

为什么 agent 天然这么自信？Zhou 等人[ACL 2024 的研究](https://arxiv.org/abs/2401.06730)给了一层解释：偏好标注数据里，人类标注者对含不确定措辞的文本有偏见；模型被要求表达置信度时又过度自信，自信回答的平均错误率达 47%。自信不是 bug，是训练出来的风格。而 Kim 等人[FAccT 2024 的 404 人实验](https://arxiv.org/abs/2405.00623)显示，第一人称的不确定表达（“我不太确定，但……”）能降低附和率、提高准确率——措辞本身就是杠杆，只是现在的杠杆偏向另一边。

原文结尾我很认同：人和 AI 的分工没有唯一正解，有些决策交出去没问题，有些值得留住；关键是这个分工“是我们选择的，而不是漂进去的”。

## 把干预点挪到判断形成之前

如果判断是在过程中被构造的，保障判断质量的动作就得发生在过程里，而不是交付末端。落到自己的工作上，我打算试两件小事。

第一，在让 agent 对开放决策给建议之前，先写下自己的立场和理由，哪怕只有一句话。Foss 的建议相同，《把代码评审搬到动手之前》的实践也相同；这篇实验给这个动作提供了新的理由——它不是仪式，是趁自己的偏好还没被构造，先占个位置。这个做法有没有用，可以自己验证：对照先写立场和不写立场的两次任务，看事后解释里有多少措辞来自 agent。我没有做过这个对照，不下结论。

第二，对关键的开放决策，要求 agent 补上缺席的那一侧：“一个胜任的专家为什么会选另一个选项，他的假设是什么？”论文说 agent 很少主动给这个，但没说不给问。值得留意的是，原文也承认这条路有成本：一次分析有几十个开放决策，每个都双侧论证会把人淹死；哪些决策值得这样对待，本身又是一个判断。所以这个要求只该花在真正影响结论的少数决策上——比如那四个能把估计值推过门槛的。

还有一个更大的背景值得记住。同一个团队六月发过[Claude Code 使用研究](https://ntlx.github.io/articles/claude-code-expertise)，结论是专家的价值向定义问题、验收结果、带 agent 走出坑迁移；十月这篇接着问：迁移过去的判断，本身正在被 agent 接管。两篇连起来读，专家的位置不是被抹平，而是被一层层往里推——推到“形成自己的理由”这个最后的环节。这个环节守不守得住，大概决定了署名还算不算数。

测量层面也有人在动手。Padmakumar 等人今年的[Offloading Score 预印本](https://arxiv.org/abs/2605.29392)用反事实工作流估计“没有工具时你会怎么做”，在 40 名开发者的实验里测出时间压力下卸载程度上升 43%，而使用量和自陈量表都测不出来。顺从难以自我报告，这正是实验里 77%/15% 那组数字的含义；要管理它，先得有仪器。

## 参考资料

- [How AI agents shape experts' judgment calls](https://www.anthropic.com/research/agents-judgment-calls)（Anthropic，2026-10-27）
- [Who's Aligned to Whom? How AI Agents Shape Experts' Research Judgment Calls](https://assets.claude.com/519c17a5d23a794e8b6d50a854048d0b61e0d73a.pdf)（配套论文 PDF）
- [The Construction of Preference](https://doi.org/10.1037/0003-066X.50.5.364)（Slovic，1995）
- [The Illusion of "a Human in the Loop"?](https://nicolaijfoss.substack.com/p/the-illusion-of-a-human-in-the-loop)（Nicolai J Foss，2026-11-02）
- [Relying on the Unreliable](https://arxiv.org/abs/2401.06730)（Zhou et al.，ACL 2024）
- ["I'm Not Sure, But..."](https://arxiv.org/abs/2405.00623)（Kim et al.，FAccT 2024）
- [Offloading Score](https://arxiv.org/abs/2605.29392)（Padmakumar et al.，2026）
- [Gradual Disempowerment](https://arxiv.org/abs/2501.16946)（Kulveit et al.，2025）
- [Generative AI enhances individual creativity but reduces the collective diversity of novel content](https://doi.org/10.1126/sciadv.adn5290)（Doshi & Hauser，2024）
- [Building and evaluating alignment auditing agents](https://alignment.anthropic.com/2025/automated-auditing/)（Anthropic，2025）
- 站内：[AI 把活干完以后，谁来验收](https://ntlx.github.io/articles/handshake-expert-judgment)、[把代码评审搬到动手之前](https://ntlx.github.io/articles/verifying-intent)、[Claude Code 把专家重新暴露出来](https://ntlx.github.io/articles/claude-code-expertise)