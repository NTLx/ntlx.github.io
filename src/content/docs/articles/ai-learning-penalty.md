---
$schema: starlight
title: "AI 帮学生做作业，成绩涨了 18%，考试成绩跌了 20%——但最可怕的数字是\"两年\""
description: 一项追踪 2.6 万名中学生 30 个月的研究发现：AI 让作业分数涨了 18%，闭卷考试跌了 20%。最可怕的不是跌幅——是全面影响要等两年才显现。到那时，该丢的已经丢完了。
date: 2026-07-06
category: ai-industry
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-06-ai-learning-penalty-img-00-infographic-core-summary.png)

前几天我刚写完一篇关于"品味"的文章，核心论点是 AI 让制造变得几乎免费，但品味需要注意力，而注意力在被 AI 系统性地移除。今天看到一个研究，把这件事从一个哲学命题变成了一个可以量化的教育灾难。

The Decoder 报道了一项今年六月发表的研究：三位经济学家追踪了中国中部某县 26,811 名中学生，整整 30 个月。数据涵盖九门学科的月考、中考/高考，以及作业分数和完成时间。他们用了 difference-in-differences 方法——对比同一批学生在开始用 AI 前后的表现变化，再减去同期未使用 AI 学生的变化。

结果让人后背发凉。不是那种"哦这个值得注意"的发凉，是那种"这其实是不可逆的吧"的发凉。

## 作业变好了，人也变笨了

先看最直接的数字：学生开始用 AI 后，作业分数上升了 18%，完成时间从 64 分钟降到了 45 分钟。效率提高、质量提升——任何教育者看到这个数据都应该高兴。

但闭卷月考的分数在六个月内下降了 20%。高考和中考的降幅是 18% 到 24%。

等一下。作业变好了，但考试变差了。而且不是差一点，是差了五分之一到四分之一。

研究作者用了一个很精确的词来描述这种现象：**外包（outsourcing）**。超过五个月的 AI 使用后，约 81% 的学生完成作业的时间不到 50 分钟——比最快的非 AI 用户还快。他们作业分数很高，但考试一塌糊涂。作者写得很直白：作业时间异常短 + 作业分数高 + 考试分数低 = 学生把脑力活外包给了 AI。

![作业分数上升、考试分数下降的主要结果对比](https://the-decoder.com/wp-content/uploads/2026/07/ai-learning-penalty-02-main-results.jpg)

## 最可怕的不是跌幅，是"两年"

研究中最让我不安的发现不是 20% 的跌幅本身，而是**时间延迟**。

月考成绩在半年内就开始下滑——这还算快。但高考和中考的全面影响，要等大约两年才完全显现。两年的延迟意味着什么？意味着当一个学生、一个老师、一个家长意识到"好像哪里不对"的时候，两年的学习已经蒸发了。两年的神经元连接没有建立。两年的概念框架没有搭起来。

这就是为什么没人喊停。研究者给出了解释：老师只在一个学科见到学生，20% 的分数波动在一个老师看来不算异常。全县平均成绩的降幅直到 2025 年 6 月才达到约 10%，因为在那之前积累足够长 AI 使用时间的学生还不够多。学生自己也往往把独立学习的脑力消耗误认为"我学得很费力，所以这方法不对"——而 AI 给的那种丝滑的、不用动脑的体验，反而被当成"我学得很好"。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-06-ai-learning-penalty-img-01-two_year_delay_timeline.png)

这个延迟陷阱让我想起之前写"品味"时引用的 Jason Liu 那句话：AI 给你目的地，但不给你沿途的注意。这里是一样的逻辑，只是代价从模糊的"品味"变成了可量化的"高考分数"。当作业变成一键生成，学生失去的不是那几道题的分数——他们失去的是那 19 分钟（从 64 到 45）里本该发生的所有东西：困惑、试错、连接、顿悟、累。

## 尖子生反而最惨

研究里有一组数字特别反直觉：学得最好的学生损失最大。

成绩排名前三分之一的学生，考试分数下降了 24%。排名后三分之一的学生下降了 16%。为什么尖子生反而更惨？因为**他们最擅长把活外包给 AI**。他们的 prompt 写得好，AI 输出质量高，作业看起来完美，没有任何人——包括他们自己——能在作业层面发现任何问题。

剂量-反应关系也验证了这个逻辑：每周用 AI 不超过一小时的学生，考试损失约 5%。每周用五小时以上的，损失 30%。这不是 AI 本身有害，是用 AI **替代思考**有害。研究者明确说了：那些作业时间和非 AI 用户差不多的学生，考试成绩并没有显著下降。AI 不是毒药。把 AI 当替身才是。

![外包模式：作业时间短+分数高 vs 考试分数低](https://the-decoder.com/wp-content/uploads/2026/07/ai-learning-penalty-05-outsourcing-pattern.jpg)

## 这不是"中国的教育问题"

这个研究的背景是中国县城的中学生，但它描述的机制是普适的。Anthropic 自己的研究也发现，用 AI 辅助学习编程的参与者，后续知识测试比对照组低 17%。瑞士商学院的研究发现频繁 AI 使用与批判性思维负相关。UC Berkeley 分析了 50 万份成绩单，发现 ChatGPT 发布后写作和编程密集型课程的 A 等级比例上升了 13 个百分点，但效果只出现在无监督作业上。

MIT Sloan 的研究者给这种现象起了个名字叫"增强陷阱"（Augmentation Trap）：短期生产力提升侵蚀了这些提升所依赖的专业知识。GoTo 今年调查了职场，39% 的员工自己承认 AI 依赖已经弱化了他们的技能。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-06-ai-learning-penalty-img-02-augmentation_trap.png)

不同学科之间的差异也值得注意。社会科学损失最大（27%），然后是 STEM（22%）、英语（17%）、语文（9%）。这很有意思——越是需要分析、论证、权衡的学科，外包的代价越大。这跟"品味"那篇文章的核心论点完全吻合：AI 最容易替代的是执行（计算、翻译、记忆），但最难替代的是判断（分析、论证、权衡）。而当学生把判断也外包了，他们在社会科学这种完全靠判断力撑起来的学科里，跌得最惨。

## 怎么办？

研究本身提了几个建议，都挺务实：让学生了解外包的长期代价（很多学生是真的不知道）；提高闭卷考试在评分中的权重；追踪作业完成时间而不是只看作业分数。Andrej Karpathy 的观点更激进——他认为学校应该停止监管 AI 作业，直接把大部分评分转移到课堂内进行。他的逻辑和研究数据对得上：当学生知道自己会在没有 AI 的情况下被测试，他们就有动力去真正学会。

但我觉得这些问题背后还有一个更深层的问题。如果 AI 让"不学就会"成为普遍状态，教育系统面临的不是"怎么防作弊"的问题，而是"学习的意义是什么"的问题。当大部分知识的获取变成即时检索，教育的核心价值可能需要从"传递知识"彻底转向"培养那种不能被外包的能力"——也就是我[之前反复写的](https://ntlx.github.io/articles/code-cheaper-taste-pricier)判断力、品味、质疑能力。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-06-ai-learning-penalty-img-03-subject_loss_comparison.png)

这篇论文里有一个没有被强调但我认为最重要的发现：学习损失在两年间从 25% 降到了 16%。师生在适应。不是适应不用 AI，而是适应"怎么用 AI 的同时还保持学习"。这个 9 个百分点的回升，比任何关于禁止或放任的政策争论都更有说服力。人们会找到办法的。只是要付出两年看不见的代价。

两年。这个数字对我来说是整个研究最恐怖、也最重要的一句话。它意味着所有关于"AI 会不会损害学习"的短期实验——学期研究、三个月对比——都可能低估了实际影响。真正的代价不是即时可见的，它在地下慢慢累积，等到高考成绩出来那天，你才发现地基已经空了。

*你觉得在你自己日常使用 AI 的过程中，有没有哪些事是你已经"外包"了、但不确定是否该外包的？*

## 延伸阅读

- [《代码越来越便宜，品味越来越贵》](https://ntlx.github.io/articles/code-cheaper-taste-pricier)
- [《如果你想要品味，就得亲自去吃》](https://ntlx.github.io/articles/taste-ai-era)
- [《真正替你刷爆 LLM 账单的，不是人，是"善意的重试"》](https://ntlx.github.io/articles/retry-isnt-kindness)

## 参考资料

- [A 26,000-student study shows AI's hidden learning cost takes two full years to surface](https://the-decoder.com/a-26000-student-study-shows-ais-hidden-learning-cost-takes-two-full-years-to-surface/) — The Decoder, 2026-07-04
- [The Generative AI Learning Penalty: Evidence from Chinese Secondary Education](https://cepr.org/publications/dp21577) — Strömberg, Lei, Wu, CEPR DP21577, 2026-06
- [A Warning Shot for Human Capital](https://blogs.worldbank.org/en/investinpeople/a-warning-shot-for-human-capital--evidence-of-an-ai-learning-pen) — World Bank Blog
- [A Study of 26,000 Students Shows the AI Learning Trap](https://www.psychologytoday.com/us/blog/the-power-of-experience/202606/a-study-of-26000-students-shows-the-ai-learning-trap) — Psychology Today
- [AI coding tools hurt learning unless you ask why](https://the-decoder.com/ai-coding-tools-hurt-learning-unless-you-ask-why-anthropic-study-finds/) — Anthropic 研究
- [Frequent AI use linked to lower critical thinking scores](https://the-decoder.com/frequent-ai-use-linked-to-lower-critical-thinking-scores-research-shows/) — Swiss Business School
- [AI is inflating student grades](https://the-decoder.com/ai-is-inflating-student-grades-and-the-effect-points-to-outsourced-work-not-better-learning/) — UC Berkeley
