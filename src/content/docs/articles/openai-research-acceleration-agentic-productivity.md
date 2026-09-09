---
$schema: starlight
title: Agent 跑得越久，团队越该问：谁来验收？
description: Agent 可以整夜开工，但生产率不会自动过夜；真正稀缺的，是把机器劳动变成可信结果的验收能力。
date: 2026-09-09
category: ai-agents
primarySourceUrls: ["https://tomtunguz.com/openai-research-acceleration-agentic-productivity/"]
---

如果明天早上打开电脑，发现十几个 agent 在夜里各自交了一份结果，很容易就会认为“生产力翻倍”了。可我大概会先压住这份兴奋：这些结果里，有多少能通过测试、合并进系统，最后又有多少真的让研究或业务往前走了一步？

Tomasz Tunguz 在[《Is the 3x AI Productivity Gain just a Computer that Never Sleeps?》](https://tomtunguz.com/openai-research-acceleration-agentic-productivity/)里写出了一个很直观的画面：OpenAI 研究员正在调度一支不会下班的机器队伍。这并不夸张。只是我们太容易把“机器做了更多事”翻译成“人和组织变得三倍有效”。

我读完后留下的判断是：所谓三倍，首先是可调度机器劳动的扩张；它能迅速改变排期和成本，却不能跳过验收、选题与恢复。接下来该盯住的，不是更漂亮的 runtime，而是每一层之间的转换率。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-09-openai-research-acceleration-agentic-productivity-img-00-infographic-core-summary.png)

## 3.1 量到的，是机器的工作日，不是成果的工作日

OpenAI 在[研究加速报告](https://openai.com/index/research-acceleration-view-inside-openai/)中说，到 2026 年 8 月中旬，研究组织平均每个人类工作日对应 3.1 个 agent-workdays。这个指标很重要，但它的定义也很明确：它是 agent runtime 相对一个八小时人类工作日的换算。

把它读成“每位研究员交付了 3.1 倍成果”，中间至少跳过了两道门。我更愿意把整个过程拆成一条链：

`机器运行量 → 经人工验收的有效产出 → 研究或业务结果`

第一层包含运行时、token、代码和实验次数；并发和夜间运行会让它很快上涨。第二层要求结果能被测试、审查、整合并实际采用。第三层还要回答更难的问题：这个结果是不是在解决值得解决的问题，是否受算力、协作、安全和资源约束拖住。

OpenAI 自己也没有把这些层混为一谈。它说测量仍在早期，代码量、实验量和运行时间不直接解释研究进展；人类仍在设定优先级、评估想法和结果，并决定什么时候扩大、暂停或部署。它采用的 AI 研发生命周期还涵盖 Decide、Design、Build、Run、Analyze、Communicate 等环节；高层规划在 agent 输出 token 中占比仍然很小。更多执行，不等于更多方向感。

这不是给 3.1 打折，而是给它找对位置。它说明一台新的生产机器正在被接入研究流程，尚不足以单独证明这台机器已经把结果交付得更好。

## 并发省下的是等待，排队的却可能是验证

并发的价值是真实的。把可拆分的排障、实验、资料整理或实现任务同时交给多个 agent，等候执行的时间会缩短；它们还能在人的休息时间继续跑。问题是，次日早晨所有分支会同时回到一个有限的入口：谁来判断哪些结果可信，哪些要改向，哪些相互冲突，哪些应该直接丢弃？

OpenAI 披露的另一个数字正好提醒了这一点：在预计人类需要 4 至 8 小时完成的成功任务中，最近六个月超过半数至少有过一次人工干预。这不等于“超过半数失败”——干预可能是高价值的最后审查，也可能是把工作从一个好方向推向更好的方向。但它足够说明，机器运行与有效交付之间仍有一层不能被省略的转换工作。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-09-openai-research-acceleration-agentic-productivity-img-01-concurrency-verification-queue.png)

这里让我想到站内那篇[《为什么聪明的 Agent 活不过 24 小时？》](https://ntlx.github.io/articles/how-long-should-an-agent-live)。当时讨论的是一个 agent 何时应该停，避免长会话把错误和状态一起拖下去；现在问题换成了多个 agent 同时完成后，谁负责把失败恢复到可控状态。两者都指向同一件事：执行时间可以拉长，责任边界不能模糊。

我愿意押一个可被未来数据推翻的预测：随着团队持续增加并发，最先饱和的往往不是 agent runtime，而是验证与恢复队列。它不该靠感觉判断。若验收通过率下降、返工时间上升、端到端结果不动，即使 runtime 还在涨，瓶颈已经出现了；反过来，若这些指标持续改善，更多并发才有资格被叫作真实的生产率提升。

## 推理费开始像生产投入，但不能被一张账单定义

Tunguz 对成本的提醒也值得保留。他观察到，持续运行的 agent 让推理费更像随产量变化的生产投入，而不只是偶尔点开的软件席位费。OpenAI 的数据确实显示，研究员按 API 价格计算的日推理使用中位数超过 600 美元，90 分位数超过 7,000 美元；越来越多研究员同时运行四个或更多工作流。

管理上得换个问法。团队不该只问“订阅多少钱”，而要问每条工作流消耗多少预算、在什么条件下值得继续、结果不合格时怎么停。可也不能从这里直接推出通用的年度成本或 ROI：Tunguz 文中的 3.14、40 倍和按高分位日花费推得的年化数字，都是他的计算或修辞，不是 OpenAI 公布的全员平均账单。

成本和收益之间同样隔着验收。Stack Overflow 的[2025 开发者调查](https://survey.stackoverflow.co/2025/ai)提供了一个外部信号：受访者对 AI 工具的使用意愿很高，但在准确性上不信任的比例高于信任；“几乎正确但不完全正确”和调试 AI 代码更耗时，是最常见的挫折。它不能证明 OpenAI 内部发生了什么，却解释了为什么一份便宜、快速、看起来完成的输出，仍可能在验收环节变得昂贵。

所以推理费要进入预算，但预算表不能只留一列 token。它至少还要看：通过验收的比例、返工耗时，以及最终目标是否真的被推进。只优化其中第一列，团队可能是在更高效地制造待处理结果。

## 开更多 agent 前，先把四个空位坐满

“要不要并发更多 agent”不是模型选型题，倒更像一次生产排程。我的最低检查清单有四项：

- **任务边界**：这件事能否拆成相对独立的子任务？如果各分支必须频繁共享隐性上下文，并发只会制造冲突。
- **验收器**：结果由谁或什么来判定？测试、评审标准、对照实验和可复现的完成条件，要在启动前写出来。
- **预算与停止条件**：允许花到哪里、何时暂停、什么信号触发重新派发，不能等到账单或队列爆掉后再讨论。
- **失败恢复责任人**：某个分支跑偏、超时或污染了后续工作时，谁负责回滚、合并和解释？“agent 自己会修”不是责任分配。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-09-openai-research-acceleration-agentic-productivity-img-02-productivity-conversion-dashboard.png)

这份清单并不保守。它是在给并发创造可兑现的空间：任务可以被独立验证，失败可以被局部恢复，结果可以被可靠合并，机器的夜班才不至于让人的白天都拿去收拾残局。

OpenAI 的披露和 Tunguz 的比喻都值得认真看，因为它们已经让一种变化变得可见：研究工作开始拥有比人类工时更长的机器执行面。我的保留只是，别让这个令人振奋的事实替代另一个更难的工作——设计把执行面转换成结果面的制度。

如果你的团队已经让 agent 跨夜或并发运行：第二天最先爆掉的是算力、预算，还是验收队列？你们现在用什么指标确认“多跑了一夜”真的换来了更好的结果？

## 参考资料

- Tomasz Tunguz，[Is the 3x AI Productivity Gain just a Computer that Never Sleeps?](https://tomtunguz.com/openai-research-acceleration-agentic-productivity/)
- OpenAI，[Research acceleration: The view inside OpenAI](https://openai.com/index/research-acceleration-view-inside-openai/)
- Epoch AI，[Toward an O*NET for AI R&D](https://epoch.ai/gradient-updates/toward-an-onet-for-ai-rnd)
- Stack Overflow，[2025 Developer Survey — AI](https://survey.stackoverflow.co/2025/ai)
