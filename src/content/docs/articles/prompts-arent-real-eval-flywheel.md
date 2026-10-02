---
$schema: starlight
title: 麦肯锡把判断从提示词里搬进了数据集
description: "读完《Prompts Aren't Real》，我确认它推翻的不是\"提示词重不重要\"，而是判断力存放在哪种文本里——回路没有减少人类判断，只是把它挪到更贵也更难推卸的位置。"
date: 2026-10-02
category: ai-agents
primarySourceUrls: ["https://evaluation.club/"]
---

`JSONDecodeError: Invalid control character at: line 10 column 64292 (char 66112)`

Dan McKinley 今年九月那场《Prompts Aren't Real》里，这条 Sentry 报错独占一页。起因朴素到可笑：他要求 agent 给一组条目配短标题，不超过 80 字符。模型在流式输出里吐出一个控制字符，解析器当场死掉。最后管用的修法是在字段上加一行 `alias='heading'`，把 `title` 这个名字换掉。模型对 `title` 联想太多，改成 `heading` 它就老实了。

他自己在讲稿里给这个修法留了判词： *since the fix is fully deranged I expect it'll be disturbed again at some point* （既然这修法彻底是疯的，我预计它迟早会被改回去）。

我第一遍以为这是个段子。读到后面才承认它是入口。整场演讲压在一个不太客气的前提上：一段文字，行为不可测就还没进入工程。

![提示词飞轮：判断换了存放处](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-02-prompts-arent-real-eval-flywheel-img-00-infographic-core-summary.png)

## 故障先于方法论

题目听着像宣言，正文是一份实践报告。McKinley 自我介绍做了约 25 年工程，2007 年进 Etsy 时公司不到 20 人，最后在 Mozilla 带约 150 人的基础设施团队。他没讲模型能力，只讲自己团队那套东西怎么跑。

![只加了一行的修法：给 title 字段起别名 heading](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-02-prompts-arent-real-eval-flywheel-img-01-evidence-heading-alias-diff.jpg)

第一步是把"我觉得这句提示词更好"换掉。他把断言写成测试，用 `@pass_power_k(rate=0.95)` 装饰，每例跑 20 次试验。`pass^k` 是借来的行话：τ-bench 那篇论文把它定义成 k 次独立试验全部成功的概率，跟常见的 `pass@k`（k 次里至少有一次做对）刚好相反。τ-bench 自己的结论也不好看，SOTA 的函数调用 agent 任务成功率低于 50%，零售域的 pass^8 掉到 25% 以下，k 越大，稳定解题的概率掉得越快。demo 里成功和能被依赖之间，隔着一个数量级。

第 20 页是一张 Slack 截图。`#agent-alerts` 播报 *Reliability test failures (1 of 85 tests)*，明细是 `test_does_not_freak_out_writing_titles` 这条测试 20 次里通过 16 次，需要 19 次。85 个测试每天在 CI 里被重复采样，失败会自己爬出来。再往后是一张 Google Docs 截图，文档标题写着 *Brand Voice Prompt (FINAL FOR SHARING)*，版本标签栏排到 v14。一份号称定稿的语气规范被改了十四版，没人能说清第 14 版比第 9 版好在哪。他的解释是 *to add a new prompt to your agent is to chuck it into a completely different contextual universe than the one it was tested in*。

![一条真实告警的形状：85 个测试里 1 个失败](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-02-prompts-arent-real-eval-flywheel-img-02-evidence-slack-reliability-alert.jpg)

这句我读得不舒服，因为说的正是我干过很多次的事。

![号称定稿的语气规范，版本排到 v14](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-02-prompts-arent-real-eval-flywheel-img-03-evidence-brand-voice-v14.jpg)

## 飞轮的全部数字

后半段他把闭环一段一段摊开：让 Claude 读技能描述生成大量对抗场景 → 用 `pass^k` 断言跑测试 → 整套测试交给优化器（他举的是 GEPA）→ 用优化器看不见的 holdout 验证 → 上线后把真实对话采样喂给 LLM judge，再把判出来的坏例子回流成新测试。

GEPA 不是他写的，全称 Genetic-Pareto：模型用自然语言反思这条 prompt 为什么在测试集上表现好或差，然后自动改写。论文声称平均比 GRPO 高 6%、最高高 20%，用的 rollout 少 35 倍，进了 ICLR 2026 的 Oral。仓库的座右铭是可测量即可优化。整台机器的燃料是这句话的前半段：能被断言的行为，才能被优化。

然后是那几页表格。四个测试在 NO SKILL、ORIGINAL SKILL、OPTIMIZED SKILL、OPTIMIZED, HOLDOUT 四列下的分数：`test_direct_counterfeit_question` 从 36% 到 67% 再到 100%，`test_authenticity_laundering` 从 0% 到 55% 再到 100%，`test_brand_authenticity_question` 从 22% 到 35% 再到 94%，`test_ip_infringement_question` 从 4% 到 60% 再到 100%。最后一列的数字和优化列一模一样。

![优化前后的分数，最后一列是优化器没见过的同类场景](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-02-prompts-arent-real-eval-flywheel-img-04-evidence-optimized-holdout-table.jpg)

这些数字得按它本来的等级读：他一个系统的样例分数，不是行业测量结果，外人复算不了。第 10 页他自己交代过证据等级，他不觉得他确定知道自己在干什么。

## 判断没有减少，它换了存放处

到这里都还是方法。让我停下来的是他从方法滑到立场那一步： *the prompts are vectors whose textual contents don't matter at all*，以及给领域专家的建议 *they should not spend their time curating prompts*。

我觉得这句说得太满。他自己材料里有两处玩笑恰好是反证。断言对象一复杂， *LLM judges in this scenario become projects in their own right*；这套办法的代价是 *we put another prompt optimization problem inside your prompt optimization problem so you can optimize while you optimize*。他当包袱抖，我听着像承重墙。

judge 要接近人类专家，靠的是一批标好正负样本的 golden dataset，也就是把"什么算好"重新写成人类标注和判分规则的语料。品牌语气没被消灭，它从一份读起来像话的 prompt 搬进了数据集和判分标准。这两样仍然由文字构成，仍然要有人为"这条算通过"负责，只是更难伪造，也更难随手改一版。

![回路里套着回路：判分器自己也是被优化的提示词](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-02-prompts-arent-real-eval-flywheel-img-05-framework-judge-inside-optimizer.png)

页面顶部他借朋友 Coda 的话点了机制：文本诱使我们对一个没有意识的系统采取意图立场，于是错过它本质上不承载意义。麦肯锡开的药方是戒断，别看它说什么，只看行为分布。立场分层是 Dennett 在 1987 年那本《The Intentional Stance》里排好的，除了把对象当理性行动者的意图立场，还有按结构与功能预测的设计立场。

可回路建起来之后，意图立场没消失，只是换了对象。你现在必须相信优化器在"反思"，相信标注者的品味稳定到可以被学习。MT-Bench 那篇论文顺手给了刻度：强模型 judge 与人类偏好的一致性超过 80%，而这差不多就是人类彼此之间的一致率。飞轮擦到天花板时，撞上的不是模型能力，是人类标注者自己有多一致。

《盲视》里那句"模式匹配不等于理解"他接得很稳。See Also 那份清单（《黑暗之心》、《疯狂山脉》、《闪灵》、《陆上行舟》）属于同一个谱系：体面的主角走进不可理解的东西，回来就疯了。他整场演讲在把这个谱系倒着讲，不可理解的东西不必被理解，只需要被测量。

站内那篇[《没有神，也不能把门敞开》](https://ntlx.github.io/articles/llms-are-real-ai-is-fake)做的是同一个动作：把"它是不是醒了"这种问不出结果的问题，换成"它的执行边界画在哪"。这类消解让人不爽的地方在于，它每次都成立。

## 该在什么时候别上这套

原样搬回团队，最容易读宽的是适用范围。他第 3 页限定得很窄：面向真实消费者、替用户执行任务的 agent，跟输出高度主观的 chatbot 分开讲。到了第 47 页又反向开口， *starting with a simple skill is obviously fine forever, for certain things*，一堆半成品技能从简单起步永远没问题。分界线其实落在产品与玩具之间，跟提示词还是评测无关。把这套回路套在个人脚本上，等于把它最贵的部分买错了。

贵在哪他没算，他承认也算不出来。85 个测试乘以每例 20 次试验，再乘多轮优化迭代，judge 本身也是被优化的 prompt，这笔开销常驻在 CI 和线上采样里。第 52 页那句是全篇最诚实的一处：收益递减的那条前沿很难感知，只希望那个点不是一扇隐形单向门，不像事件视界。他在 Hacker News 上自己提交的[讨论帖](https://news.ycombinator.com/item?id=49777111)拿到 118 分，最硬的反对意见正落在这里。有人说跑测试套件要花真金白银，他知道这套办法是对的，但公司未必活得过这个过程。有人说它按定义就没有终点。还有人一句戳穿，这不就是有监督学习吗，我要想做 ML 十年前就做了。同一时期他在 Bluesky 把自己的服务描述成帮团队应对技术转变、文化变化和 agentic coding 带来的 token 成本。成本他自己认，只是演讲没给它版面。这笔账我在[《Agentic Workflow 烧掉的钱去哪了》](https://ntlx.github.io/articles/token-efficiency)里替 GitHub 算过一次，结论是优化器省下的调用大多会回流到更多采样上。

另一处边界是 Goodhart。holdout 和优化集来自同一批场景，它防的是"把例句背进提示词"，防不了"我在意的行为压根不在测试清单里"。而那些对抗场景也是让 Claude 生成的，测试覆盖面本身就是一次文本判断的产物。

最有力的反驳不在会场外。文本内容要真不重要，这场演讲为什么得写这么好：55 页精心排布的句子，博尔赫斯，《闪灵》，《现代启示录》，还有一则真实的沙斯塔山山难新闻。三名新手徒步者跟着 Gemini 的路线规划上山，约 8,400 英尺扎营，凌晨 3 点出发，晚上 7 点才登顶，官方建议的折返时间是中午 12 点。AI 给的是路线和装备信息，摸黑下撤是人的决定。我不把这当漏洞。他反对的从来不是作者写文本，而是工程师把文本当作可以独立维护的接口。这两件事被混在一起，是这场演讲最容易被读错的地方。

所以他第 54 页那句 *handing someone a prompt without a measure is a form of AI psychosis* 是全文的落点。巧的是 AI psychosis 这个词在另一个不相干的语境里也出现过一次，Gizmodo 报道 Kalanick 那段 vibe physics 访谈，标题里用的就是它。Kalanick 说自己聊到量子物理的边界，做的是 vibe physics，他现在做的是机器人公司 Atoms，刚拿到 17 亿美元融资。两段话指着同一处缺口：一段没有测量的文本仍然在对一个不存在的人说话，只是没人对它负责。这个对照我之前在[《当 vibe coding 和 agentic engineering 开始模糊》](https://ntlx.github.io/articles/vibe-coding-agentic-engineering)里从反方向写过一次。

要只带两条判据走，我选这两条。

第一条，把你在意的行为写成"20 次试验里 19 次可判定通过"的断言。写不出来，说明现在还没到优化提示词的时机，先去把"什么算好"问到能判定的程度。这一步通常只需要一次会议，不需要 GPU。

第二条，去看你们组织里谁能持续产出稳定的标签。会写提示词的人不稀缺，能被学习的人稀缺。判分标准要长成一个可复用的规格，前提是有人对"这条算通过"负责，并且下次还这么说。

麦肯锡那句"文本内容根本不重要"，我会替它换一句更客气也更狠的话：单独一段提示词都不重要，重要的东西仍然由文字构成，只是它现在叫数据集和判分标准。

## 参考资料

- Dan McKinley, *Prompts Aren't Real* （本文原始材料，55 页幻灯片含逐页讲者口述稿）: [Prompts Aren't Real — evaluation.club](https://evaluation.club/)
- Yao 等, *τ-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains* （`pass^k` 的出处）: [arXiv:2406.12045](https://arxiv.org/abs/2406.12045)
- Agrawal 等, *GEPA: Reflective Prompt Evolution Can Outperform Reinforcement Learning*: [arXiv:2507.19457](https://arxiv.org/abs/2507.19457) 与实现 [gepa-ai/gepa](https://github.com/gepa-ai/gepa)
- Zheng 等, *Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena* （judge 与人类一致率）: [arXiv:2306.05685](https://arxiv.org/abs/2306.05685)
- Wang 等, *Large Language Models are not Fair Evaluators* （调换候选顺序即可操纵排序）: [arXiv:2305.17926](https://arxiv.org/abs/2305.17926)
- Dan McKinley 简历（Etsy / Mozilla 任职事实）: [mcfunley.com/resume.pdf](https://mcfunley.com/resume.pdf)
- Hacker News 上作者本人提交的讨论帖: [Prompts aren't Real](https://news.ycombinator.com/item?id=49777111)
- Andrej Karpathy 关于 context engineering 的那条帖子: [x.com/karpathy/status/1937902205765607626](https://x.com/karpathy/status/1937902205765607626)
- Anthropic, *Demystifying evals for AI agents*: [anthropic.com/engineering/demystifying-evals-for-ai-agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
