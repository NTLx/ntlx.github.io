---
$schema: starlight
title: 当岗位边界变成虚线：OpenAI 这篇报告在量什么？
description: OpenAI 分析了 80 万条 ChatGPT 工作消息后发现：43.5% 的岗位专属任务正在跨界流动。岗位说明书是历史快照，AI 使用数据才是实时照片——工作已在重组，只是我们还在用旧地图找新大陆。
date: 2026-07-28
category: ai-industry
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-28-ai-task-crossover-work-frontier-img-00-infographic-core-summary.png)

上周末，OpenAI 经济研究团队发了一篇报告，叫 *Work at the Frontier: How AI is Expanding What People Do at Work*。标题听起来像又一篇"AI 与未来工作"的标准读物——但读完之后我发现，它真正在量的东西，比标题暗示的要具体得多，也反直觉得多。

报告的核心概念叫 **task crossover**——任务跨界。一个销售在用 ChatGPT 算财务数据。一个 HR 在用 ChatGPT 排查技术故障。一个市场营销在用 ChatGPT 写简单的网页脚本。这些事岗位说明书上没写，但人已经在做了。

报告分析的对象不是预测、不是问卷、不是岗位招聘广告，而是 **80 万条真实的 ChatGPT 工作消息**。每一条消息都是一个工人在某个时刻决定"这个事我不用等别人，AI 帮我做了"。把这些决定聚在一起，你看到的不是 AI 在替代谁，而是工作本身正在被重新拼接。

## 43.5% 在量什么

这个数字需要拆开看，否则容易误读。

报告先把所有工作消息分成三类。第一类叫 **Generic**——写邮件、总结文档、排日程。这些事谁都干，看不出任何岗位特征。这部分占了 **61.5%**。

去掉这层"通用噪音"之后，剩下的 38.5% 才是**岗位专属消息**——能反映特定职业知识和技能的任务。而这个池子里，**43.5%** 的消息对应的任务，历史上属于另一个岗位。

也就是说，当人们用 AI 做真正需要专业知识的事时，**将近一半的时候，他们做的事不在自己的岗位边界之内**。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-28-ai-task-crossover-work-frontier-img-01-crossover_direction_spectrum.png)

怎么量出这个数的，本身就值得聊。过去劳动经济学研究 AI 对工作的影响，基本套路是：拿一个岗位的任务清单，问 AI 能不能做。Autor、Levy 和 Murnane 在 2003 年开创的 task-based framework 就是这么干的——把岗位拆成任务，逐条评估自动化风险。

但这个框架有一个隐含假设：**每个岗位的任务集合是固定的**。

Gans 在 2026 年的一篇文章里指出了这个漏洞。他的逻辑很简单：当自动化改变了执行某项活动的成本，企业可能把现有工作拆成更窄的角色让工人专精，也可能反过来，把活动重新组合成一个更宽的角色，创造出更多通才。任务集本身会变。

OpenAI 这份报告用数据把这个理论漏洞撑开了。O\*NET——美国劳工部的"岗位百科全书"——记录的是工作"曾经是什么"。ChatGPT 的工作消息记录的是工作"正在变成什么"。两个快照之间的差距，就是 task crossover。

## 谁在借，谁在被借

跨界不是均匀流动的。报告把八个职业群体放在一起看，发现三种截然不同的位置。

**"借用型"**——设计师。设计师的消息中有 35.2% 涉及其他岗位的任务，但设计任务只占其他岗位人员消息的 1.7%。翻译过来就是：设计师大量借用别人的技能，但设计本身很少被外人染指。这很好理解——调一个布局、写一段文案，AI 能帮忙；但审美判断和品牌上下文，AI 暂时替代不了。

**"输出型"**——工程师。只有 18.5% 的工程消息涉及外来任务，但工程任务占了其他岗位消息的 7.4%。工程师不怎么借用别人的活，但他们的活到处被人借——从排障软件到理解技术系统。财务计算和计算机排障这两项任务，出现在了**全部七个非本岗位群体**的 Top 3 外来任务中。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-28-ai-task-crossover-work-frontier-img-02-small_biz_crossover_gradient.png)

**"双向型"**——市场营销。营销人 24.3% 的消息是外来任务，同时营销任务占其他岗位消息的 8.9%，是所有职业中最高的"出借率"。营销既是最大的借入方之一，也是最大的借出方。

这个方向性图谱比单纯的跨界比例更有信息量。它要说的不是"岗位在消失"，而是"岗位里装的任务在重新洗牌"。营销和工程技能是 AI 时代的通用语——你不需要是营销总监也能写文案，不需要是软件工程师也能排障。设计判断、法律推理、财务建模——至少目前——还不行。

## 小公司里，AI 是那个不存在的同事

报告里最让我觉得"对，就是这个感觉"的数据，是企业规模效应。

在 2-5 人的 workspace 中，典型用户的跨界比例为 **18.9%**。在 100 人以上的 workspace 中，这个数字降到 **16.3%**。差距不大——大约 2.5 个百分点——但方向很稳。

解释起来不复杂。大公司有专员——财务问题找财务、技术问题找 IT、合同问题找法务。小公司没有。小公司的员工遇到一个不属于自己岗位的问题时，选择只有两个：自己想办法，或者不解决。AI 给了他们第三个选项——**让 AI 临时扮演那个不存在的同事**。

OpenAI 首席经济学家 Ronnie Chatterji 对 Axios 说的原话是："The boundaries between jobs are likely already becoming more flexible due to AI."注意他的用词——不是 "will become"，是 "are already becoming"。现在进行时。

这个发现也解释了一个常见的困惑：为什么小团队用 AI 看起来"更猛"？小团队不是更懂 AI，是更缺人。AI 对大公司是增效工具，对小公司是补位工具。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-28-ai-task-crossover-work-frontier-img-03-old_vs_new_measurement.png)

## 岗位说明书是滞后指标

报告的最后一层——也是最值得多想一层的——是它的**测量方式本身**。

传统的劳动市场统计靠什么？岗位名称、招聘广告、就业人数、工资变化。这些数据描述的是已经凝固的结构。当 AI 改变了"谁做什么"，首先出现变化的不是岗位名称——没人会把 LinkedIn 上的 title 从"销售经理"改成"销售兼财务分析兼初级程序员"。变化先出现在行为层：人们在做什么，用什么工具做。

OpenAI 测量的是行为层。80 万条 ChatGPT 消息，每一条都是一个人在某个时刻决定"这件事我自己来"。这个数据集捕捉到的不是未来的预测，而是**已经发生但尚未被正式承认的变化**。

这让我想起之前写 [《当法务开始写代码》](https://ntlx.github.io/articles/codex-agents-dissolving-job-boundaries) 时的观察——OpenAI 的 Codex 数据报告已经暗示过这个方向：当非开发者开始用 AI 写代码，岗位边界就开始溶解了。这次的 Work at the Frontier 报告把观察范围从编程扩展到了整个知识工作光谱，得出的结论更系统也更扎实。

报告本身也承认了边界：消息不等于工时，不等于项目，不等于岗位。不观察输出质量——那个销售算的财务数据可能全是错的。不观察是否节省了时间——AI 帮他算了半小时，他自己算可能只要十分钟。这是描述性研究，不是因果推断。

但这些边界不影响核心判断的效力：**分工正在变化，而且变化的速度快于我们测量它的工具。**

## 这和"AI 替代工作"是一回事吗

不是。

报告反复强调——"these results should be understood as evidence that the division of work is shifting, not as direct estimates of which occupations will gain or lose jobs."专家仍然关键——"specialists remain critical for expert-level judgment and review."

这里有一个经典类比。ATM 出现的时候，人们说银行柜员要消失了。实际上，美国的银行柜员数量在 ATM 普及之后反而增加了——因为开银行的成本降低了，网点变多了，柜员的工作内容从"数钱"变成了"建立客户关系"。AI 对知识工作者可能在做同样的事：消灭岗位？不是。重新组织每个岗位里的任务组合？是。

区别在于速度。ATM 用了二十年才改变银行柜员的工作内容。AI 改变知识工作者的任务组合，可能只需要两年。

***

*你现在的工作里，有没有哪件事是你已经在用 AI 做、但岗位说明书上绝对没写的？*

## 延伸阅读

* [当法务开始写代码——OpenAI 这篇 Codex 数据报告，藏着比 AI 替代人更深的信号](https://ntlx.github.io/articles/codex-agents-dissolving-job-boundaries)
* [OpenAI 正在替欧洲改写 AI 失业叙事](https://ntlx.github.io/articles/openai-eu-jobs-transition-framework)
* [读完 OpenAI 的 AI 记分卡：量的是活，称的是价](https://ntlx.github.io/articles/openai-ai-scorecard-read)

## 参考资料

* [How AI is expanding what people do at work](https://openai.com/index/how-ai-is-expanding-what-people-do-at-work/)
* [Work at the Frontier: How AI is Expanding What People Do at Work (PDF)](https://openai.com/index/how-ai-is-expanding-what-people-do-at-work/)
* [Exclusive: Workers are crossing job boundaries with AI, OpenAI research shows](https://www.axios.com/2026/07/27/openai-chatgpt-work-specialists)
* [ChatGPT Scrambles Specialization: Nearly Half of Job-Specific AI Use Crosses Role Lines](https://www.techtimes.com/articles/321676/20260727/chatgpt-scrambles-specialization-nearly-half-job-specific-ai-use-crosses-role-lines.htm)
* [Autor, Levy, and Murnane (2003) - The Skill Content of Recent Technological Change](https://www.jstor.org/stable/25053964)
* [Acemoglu and Restrepo (2019) - Automation and New Tasks: How Technology Displaces and Reinstates Labor](https://www.aeaweb.org/articles?id=10.1257/jep.33.2.3)
