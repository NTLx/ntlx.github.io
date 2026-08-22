---
$schema: starlight
title: 微调的裁判赢了两头：读 LangChain 的 100 倍便宜 Trace Judge
description: "准确率追平 Opus，成本便宜 100 倍——交换律失效不是奇迹，是\"退租\"红利；而终点不是省钱，是让 agent 的进化回路全速转起来。"
date: 2026-08-22
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-22-langchain-fireworks-100x-trace-judge-img-00-infographic-core-summary.png)

LangChain 和 Fireworks 上个月发了一篇文章，标题很直接：花 100 倍少的钱，造一个 trace 裁判。他们微调了一个 35B 的开源模型 Qwen，让它读 agent 的执行轨迹，判断一件事——用户是不是觉得 agent 干错了。

结果它两头都赢了：准确率追平甚至超过 Claude Opus，成本便宜一到两个量级。

两头赢这件事不正常。工程上的权衡从来是交换：省钱就牺牲质量，要质量就砸钱。交换律在这里失效了，为什么？

## 赢的不是模型，是任务

先看它评的是什么。"Perceived Error"，感知错误：用户觉得助手错了。注意这个定义的三个轴——用户觉得错、客观上错、用户不爽，是三件事。agent 答对了但用户烦，不算；agent 答错了没被察觉，也不算。它只锚定第一个轴。

这个选择本身就是答案的一半。生产环境里的 agent trace 没有标准答案——一个帮你查文档、做研究的 agent，事后没人知道"正确输出"长什么样。但用户会纠正你："不对，是周二。"会拒绝你的操作，会把同一个问题再问一遍。这些反应是免费的标注，藏在每一段对话里。

所以评估这个任务，不需要博学。需要的是稳定地认出"人在表达不满"这个动作。前沿模型的参数摊在千万种能力上，这个任务只用其中一小块。35B 的模型，火力全部压在这一道判断题上。

任务变小了，模型就够用了。

## 微调教会了它什么

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-22-langchain-fireworks-100x-trace-judge-img-01-finetuning_lift.png)

Prompt 也能把任务说清楚。实验里基座 Qwen 配好 prompt，开箱就是 90.5%。微调之后变成 96.1%，多赚五六个点。

这五六个点从哪来？我读到的解释是：prompt 是外挂的规则，权重是长进去的直觉。用户在第三轮说"不对，是周二"——prompt 模型要先想起规则（用户纠正 = 感知错误），再套用；微调模型见到这个 pattern 直接触发判断。707 条标注样本，教出来的不是知识，是条件反射。

有个对照值得记住：便宜的闭源小模型（Haiku 类）也试过，失败模式是"该报不报"。LangChain 和 Harvey 之前在法律验证的实验里测过，Haiku 的误放行率高达 34.7% 到 48.4%——将近一半的错误被放过去。便宜模型内部还分层，微调过的中等开源模型不犯这个错。

## 迁移那一枪打得最漂亮

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-22-langchain-fireworks-100x-trace-judge-img-02-transfer_win.png)

全文最漂亮的实验设计是这个：训练数据只用了 chat-langchain（他们自己的文档问答机器人），一行 Fleet（另一个无代码工具的数据）都没碰。

然后拿这个模型去考 Fleet——它赢了所有前沿模型。90.8%，对 Claude Opus 的 90.2%。

为什么？因为"识别用户不满"是读人的技能，不是读文档的技能。纠正、拒绝、重复请求——这是人在不满时的通用行为语法，跟底下聊的是税务还是代码无关。领域换了，语法没换。

但我得踩一脚刹车。这个 90.8% 对 90.2%，是打在 184 条留出集上的。样本这么小，0.6 个百分点的差距，统计上说不死。方向我认为可信——微调裁判确实迁移得动；但"赢过 Opus"这个幅度，别太当真。

还有一点原文没多说：GPT-5.5 在 chat-langchain 上是 98.9%，远超微调模型的 96.1%。所谓"匹敌前沿"，准确的说法是——迁移场景下赢，单域最贵的模型仍然最强。他们挑了对自己有利的讲法，这不奇怪，读的时候心里要有数。

## 100 倍从哪来

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-22-langchain-fireworks-100x-trace-judge-img-03-cost_frontier.png)

成本账拆开是两个乘数。模型从前沿尺寸降到 35B，单价先降一档；再放到 Fireworks 这类专用推理平台上跑，单位成本又降一档。同系列博客里有参照价：Claude Opus 输入 5 美元、输出 25 美元每百万 token，开源的 MiniMax 是 0.30 和 1.20——差一个量级。两个乘数叠起来，10 到 100 倍。

且这个差价随 trace 量放大。trace 越多，固定成本摊得越狠。agent 时代 trace 只会越来越多——现在互联网上 bot 流量已经超过人类了。

这背后其实是一笔"退租"的账。用通用前沿模型，你按 token 付费，每个 token 里都含着你永远用不到的那部分能力的保险费。判断题不需要博学，需要稳定。微调的意思是：把用不上的 99% 从账单上划掉。

## 终点不是省钱

回到开头那句"两头赢不正常"。现在能说清了：它不是技术奇迹，是一笔结构性的账——把判断类任务从"租用通用智能"里剥离出来，自己养一个专用模型。任务够窄，35B 就够；流程够顺（开源基座、模型辅助标注、托管 LoRA 三样同时到位），一个工程师的周末就够。

这件事的终点也不是省钱。以前评估靠抽样、靠人看，agent 改一版，等一周才知道好坏。当每条 trace 都有一个便宜的裁判盯着，回路全速转起来：改动、全量评判、看错误率变化、再改。评估从质检员变成了发动机。

这也是 LangChain 这半年三篇博客连起来的那条线：第一篇说开源模型能干活，第二篇（和 Harvey 的法律验证实验）说开源模型能当裁判，这一篇说裁判能进生产全量跑。三篇共用一个公式：开源模型，加上收窄的任务，加上微调，等于前沿质量乘以十分之一到千分之一的成本。我在[评测成本黑洞](https://ntlx.github.io/articles/ai-eval-costs-bottleneck)那篇里写过这个问题的提出，这篇是工程上的答案。

当然，裁判自己是谁在裁判？标注是模型辅助的，训练是教模型学这些标注，部署完它的判断又反过来指导 agent 进化——模型教模型，模型评模型，人只在两头模型都拿不准时出场。这个环转几圈之后会漂成什么样，文章没答，我也没有答案。

给普通团队的启示倒是很实在：哪怕你现在不打算微调任何东西，也先把 trace 存下来。没有 trace，连入场券都没有。

我赌未来一年，"会自建 judge"会变成 agent 团队的标配技能，就像当年"会自建 eval 集"一样。如果你手里已经有一批线上 trace，拿几百条出来，照这篇文章的流水线走一遍——模型组标注、分歧仲裁、LoRA 微调——你会比读十篇文章都清楚自己的 agent 到底在哪儿惹用户不高兴。

*你的团队现在怎么评估 agent 的线上表现——抽样人看，还是已经有裁判模型在跑了？评论区聊聊。*

## 参考资料

* [Building a 100x Cheaper Trace Judge with Fireworks（原文）](https://www.langchain.com/blog/building-a-100x-cheaper-trace-judge-with-fireworks)
* [Open models have crossed a threshold（同系列：开源模型越过门槛）](https://www.langchain.com/blog/open-models-have-crossed-a-threshold)
* [Designing Efficient Verifiers for Legal Agents（同系列：法律 agent 验证器）](https://www.langchain.com/blog/designing-efficient-verifiers-for-legal-agents)
* [AI评测正在烧成一个新的算力黑洞（站内旧文）](https://ntlx.github.io/articles/ai-eval-costs-bottleneck)
* [Bots now outnumber humans on the internet（CNET）](https://www.cnet.com/tech/services-and-software/bots-now-outnumber-humans-on-the-internet-heres-what-that-actually-means/)

## 延伸阅读

* [评测 Agent 最危险的时刻，是拿未校准的尺子跟正确的修改打架](https://ntlx.github.io/articles/similarweb-agent-eval-langsmith)
* [给编码 Agent 装上可观测性：AHE 如何让 harness 自己进化](https://ntlx.github.io/articles/ahe-observability-driven-harness-evolution)
* [Not the Model, You're the Harness](https://ntlx.github.io/articles/not-the-model-youre-the-harness)
