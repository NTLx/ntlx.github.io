---
$schema: starlight
title: CI 变慢之前，先看每次补丁还能撑多久
description: 读 Anthropic 的测试影响分析重构：Agent 把 CI 作业推高 25 倍后，状态边界与扩展路径成了先要补的基础设施。
date: 2026-09-18
category: ai-agents
primarySourceUrls: ["https://claude.com/blog/agentic-coding-is-straining-ci-heres-how-we-scaled-test-impact-analysis-at-anthropic"]
---

我读完 Claude 官方博客这篇 [《Agentic coding is straining CI》](https://claude.com/blog/agentic-coding-is-straining-ci-heres-how-we-scaled-test-impact-analysis-at-anthropic)，第一反应不是“CI 作业量涨了 25 倍”，而是三次补丁的寿命：约 70 天、29 天、不到一天。

这个顺序很有分量。它说明团队并不是不会止血，加机器、做分片、定期重启都曾经有效；只是系统增长以后，局部修补买来的时间越来越短。真正值得读的，是 Anthropic 什么时候承认继续补洞已经不划算，以及他们怎样重新划定状态的归属。

![核心信息图：CI 压力、补丁寿命与状态外置](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-18-anthropic-test-impact-analysis-img-00-infographic-core-summary.png)

## 补丁的寿命，比补丁的内容更值得盯

原文把这件事画成了一条瓶颈下游移动的流水线。人写代码时，build 是窄门；代码生成和 PR 审查加速后，窄门移动到了 CI。

这和 Claude 另一份 [AI-Native SDLC playbook](https://claude.com/blog/the-ai-native-sdlc-playbook) 的判断相互照应：当 build 变快，plan、review/test 和 deploy 这些仍按人类速度运行的环节，就可能接过瓶颈。这里的重点不在“CI 变成新热点”这句口号，而在于原来被吞吐掩盖的系统假设开始暴露。

![原文图：瓶颈从 build 移向 PR review 与 CI](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-18-anthropic-test-impact-analysis-img-source-01-ai-code-volume.png)

我会把 patch runway 当成一个比“这次修好了吗”更有用的指标。第一次加机器之后，服务能稳定多久；第二次分片后，积压多久重新出现；第三次重启后，团队还有没有时间安全地重做。只看当前 backlog，很容易把暂时下降误判成问题已经解决；把每次修补能买来的时间画出来，系统是否在逼近结构性边界就清楚了。

![原文图：CI 作业量与每次补丁买来的时间](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-18-anthropic-test-impact-analysis-img-source-02-ci-pressure-conversation.png)

这也是我不太愿意把“加大机器”简单归类为反模式的原因。它可能是深夜里最安全的动作，也可能为重构争取窗口。危险在于，团队没有记录这个窗口的长度，下一次告警又把临时方案当成了长期设计。

## CI 服务真正脆弱的地方，是状态被锁在进程里

Anthropic 的测试影响分析服务做两件事。listener 记录每次 CI 运行的测试结果，selector 读取历史，决定每个打开的 PR 运行哪些测试。

这个分工本身并不奇怪。问题在于，旧设计把每项测试的运行历史放在一个单进程里维护，listener 需要作为单写入者按顺序应用结果。于是服务看起来像一个简单的处理器，实际却把“谁能写、写入顺序是什么、历史放在哪里”绑在了一起，无法横向分片。

当 CI 作业同时涌入时，listener 开始落后于 PR 队列。落后带来的坏处也很具体：selector 依据陈旧数据做选择，已经修好的测试可能继续被选中，新增测试可能迟迟不被选中，广泛失败或 flaky 的测试则可能反复把人拉进错误的调查。

这里需要把边界说清楚：数据陈旧不等于 CI 没有运行，更不等于未经测试的代码直接进了生产。它意味着测试选择组件没有及时拿到最新结果，于是“应该跑什么”的判断变得不可靠。对 agent 来说，这种差别尤其重要。一个会根据反馈自己迭代的系统，拿到过时反馈后，可能比一个明确失败的系统更难排查。

## 三次止血都合理，但它们暴露了同一个失效信号

第一次修补是换更大的机器。原文里的对话重绘很有讽刺感：早在服务还没有彻底失控时，就有人提醒这套设计最终需要更可扩展的替代方案；几个月后，评论变成了“预言成真”。

![原文对话重绘：更大的机器只是临时缓冲](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-18-anthropic-test-impact-analysis-img-source-03-bigger-machine.png)

第二次修补是分片。团队发现 listener 不需要一个全局单写入者，而是每个 package 各自保持顺序，于是让每个 shard 配一个 worker。这个判断是对的，也确实把服务撑住了一段时间。问题只是，撑住的时间只有 29 天。

![原文对话：Claude Tag 观察 listener 的内存与处理能力](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-18-anthropic-test-impact-analysis-img-source-04-sharding-conversation.png)

第三次修补是每日重启。进程在工作日中午前后触碰内存上限，重启可以把 working set 拉回去，却不能改变状态持续膨胀的方向。更麻烦的是，重启和积压叠在一起时，listener 会漏记一部分结果，selector 继续在旧历史上做选择。

![原文图：listener working set 与 pod 内存上限](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-18-anthropic-test-impact-analysis-img-source-05-daily-restart.png)

我不把这三步看成“错误答案”。它们分别对应 CPU、并行度和内存压力，是当时成本最低、最容易验证的动作。真正的失效信号是：每个补丁都还能工作，但它们提供的时间在连续缩短。到了这一步，修复对象就不该只是当前故障，而应该是让下一个补丁也能被安全地写出来的结构。

## 重构改变的不是组件，而是状态的归属

最终设计的关键落在状态如何归属。团队把 listener 改成无状态 worker：它处理一条结果，把结果追加到内存数据存储里的 journal，然后继续处理下一条，不再把大量历史握在自己的进程内存里。

另一个独立的 consumer 每隔几秒把 journal 汇总成 per-test history，selector 再从这份历史里快速查询相关结果。这样，接收结果和整理历史不必以同一个进程的内存和处理速度为上限；worker 可以横向扩展，状态也有了可以单独观察和调节的位置。

![原文图：测试选择服务从单 listener 到 worker、journal 与 selector](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-18-anthropic-test-impact-analysis-img-source-06-redesign-architecture.png)

这套分布式架构更贵，作者没有回避这一点。它带来的收益是更容易扩展和分析内存，当然也会增加新的调优工作。这个项目由一名工程师用三周完成，作者回看认为如果提前一年做，可能接近一个季度。代码写得更快当然有帮助，但更重要的是，重构本身也变得足够便宜，终于能在服务彻底失控前被纳入选择范围。

原文的两张结果图比“我们重构成功了”更有说服力：重构上线后，listener backlog 经过调优趋于平坦。它不证明架构在任何组织都能复制，却清楚展示了一个工程目标：系统应该让积压可以被看见、被定位，并且在调整 worker 数量或 journal 大小时有可操作的杠杆。

![原文图：重构上线前后的 listener backlog](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-18-anthropic-test-impact-analysis-img-source-07-stable-after-cutover.png)

## 给 CI 留的第一份设计文档，应该是增长预算

原作者给工程团队的建议是：无论自建还是购买，都按两个季度内遇到 25 倍负载来设计；预算允许时，v0 就按感知规模的 10–20 倍预留。我不会把这当成所有团队的预测，更愿意把它当成一次压力测试：如果今天的吞吐突然放大，最先失效的是容量、状态、队列，还是人工确认？

我会在 CI 设计文档里先写下几件很朴素的事：入口作业数和出口作业数能不能对账，listener lag 到什么程度会影响 selector 的数据新鲜度，单个进程的状态是否会随时间增长，关键变更有没有 canary 和回滚路径。它们不需要先上复杂平台，却能让“看起来还活着”的服务暴露出自己的剩余缓冲。

Anthropic 的另一篇 [CI/CD on-call 文章](https://claude.com/blog/ai-ci-cd-on-call)展示了相邻的做法：把告警、日志、配置变化、PR 和历史故障接进一个持续工作的调查上下文，让 agent 能根据运行信号逐步定位问题。这正好解释了原文那句“把服务仪表盘做成 Claude 的 eyes and ears”。但可观测性不是把修复责任转给 agent；它首先是让人和 agent 都能看到系统真实落后了多少。

读完这篇文章，我留下的结论是：Agent 让代码和 PR 产生得更快，系统原有的状态、背压和验证问题也会更早浮上来。CI 变慢之前，团队通常已经得到过提示，只是把每次短暂恢复当成了终点。

如果一个补丁第一次能撑很久，后来只能撑几周，再后来只能撑一天，那很难只归因于“运气变差”。它是在告诉你，服务的状态边界已经到了该被重新设计的时候。提前准备的重点，是让系统在增长中继续看见、验证和改变自己的处理路径。

## 参考资料

- [Agentic coding is straining CI. Here’s how we scaled test impact analysis at Anthropic](https://claude.com/blog/agentic-coding-is-straining-ci-heres-how-we-scaled-test-impact-analysis-at-anthropic)
- [When AI builds itself — Anthropic Institute](https://www.anthropic.com/institute/recursive-self-improvement)
- [The AI-Native SDLC playbook — Claude](https://claude.com/blog/the-ai-native-sdlc-playbook)
- [The AI-Native SDLC playbook — Claude Academy](https://academy.claude.com/courses/ai-native-sdlc-playbook)
- [How Anthropic secures its AI-native software development lifecycle](https://claude.com/blog/how-anthropic-secures-its-ai-native-software-development-lifecycle)
- [How Claude Tag serves as Anthropic’s first responder for CI/CD failures](https://claude.com/blog/ai-ci-cd-on-call)
- [当代码生成近乎免费：Anthropic 如何用“产物契约”重构软件工程全生命周期](https://ntlx.github.io/articles/ai-native-sdlc-playbook)
- [OpenAI 的软件工厂：让 Agent 对一条变更负责到底](https://ntlx.github.io/articles/openai-agentic-software-factory)
