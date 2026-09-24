---
$schema: starlight
title: 一万名 Agent 之后，我更关心验证能不能跟上
description: 认知劳动已经能像云资源一样扩容，可信证据却没有同步变快。Agent swarm 与 RSI 真正的瓶颈，可能正在从智能转向 assurance throughput。
date: 2026-09-19
category: ai-agents
tags: ["Multi-Agent", "AI R&D", "AI Alignment", "Recursive Self-Improvement"]
primarySourceUrls: ["https://www.dwarkesh.com/p/noam-brown"]
---

Dwarkesh Patel 最近和 OpenAI 的 Noam Brown 聊了一场很密集的访谈，主题从 multi-agent、Navier–Stokes 一路谈到 recursive self-improvement、Hugging Face 事件、chain-of-thought monitoring 和 alignment。

最容易传播的当然是那个数字：OpenAI 解 Navier–Stokes 时，负责产出最终结果的 group 规模大约是一万名并发 Agent。它们在约 88 小时后得到结果，后续 Lean 形式化与验证又用了 17 小时。

但读完整场访谈，我反而觉得“一万名 Agent”不是最值得记住的部分。

Brown 自己就在给这个数字降温。他说，不会把哪怕 10% 的功劳归给 multi-agent。真正的底座还是一个足够强、足够通用、可以长时间工作的模型。Multi-agent 更像是把 test-time compute 从串行思考搬到并行执行。

把这两件事分开后，一万名 Agent 的含义就没那么神秘了。Swarm 先是一种计算结构，然后才可能长出新的组织形态。于是另一个问题浮了出来：

**我们已经越来越会复制认知劳动，但我们有没有同样快地复制可信判断？**

![Agent 能力吞吐与验证吞吐的核心判断](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-19-agent-swarms-assurance-gap-img-00-infographic-core-summary.png)

## 认知劳动第一次有了类似云资源的弹性

传统组织扩容很慢。

一个团队想多一个能独立工作的成员，要招聘、培训、同步背景、建立信任，再让他真正进入工作流。即使一个人很强，也不能按需复制出另一个自己。

Agent 不一样。

Brown 在访谈里提到，当前的 sub-agent 已经可以从主上下文直接 fork。也就是说，同一份任务背景、已有判断和局部知识，可以被复制给新的工作实例。需要更多并行探索时就派生，需要收敛时再合并结果。

这让我觉得，Agent 对组织最深的改变可能不是“AI 会不会像人在 Slack 里开会”，而是认知劳动开始出现一种以前只有计算资源才有的属性：**弹性扩缩。**

我们已经习惯云计算里 CPU、GPU、容器可以按负载增加。现在类似的事情开始发生在推理和执行上。一个问题可以同时让多个实例查资料、写代码、证明、反驳、测试，再把结果汇总回来。

OpenAI 自己披露的内部数据已经能看到这种变化。到 8 月中旬，其 research organization 每一个人类工作日对应 3.1 个 agent-workdays。这个数字当然不能直接翻译成研究效率的倍数，但它至少说明机器侧的可调度劳动已经超过了人类工时本身。

我之前写[《Agent 跑得越久，团队越该问：谁来验收？》](https://ntlx.github.io/articles/openai-research-acceleration-agentic-productivity)时，关注的是机器劳动增加后谁来接住结果。Brown 这场访谈让我把这个问题再往前推了一步：如果机器劳动不仅变长，还能大量复制，验收就不只是一个流程节点，而会变成一条独立的容量曲线。

## 研究系统里最慢的东西不会一起被复制

这里很容易产生一个错觉：既然 Agent 可以复制，那么验证也复制几个 Agent 不就好了？

有一部分当然可以。

单元测试可以自动跑，形式化验证可以交给模型，benchmark 可以并行执行，monitor 也可以用另一个模型。Navier–Stokes 的结果最后就经过了额外的 Lean formalization 和 verification。

但这只能解决“验证任务本身已经定义清楚”的那部分问题。

我更在意的是：**你怎么知道正在验证的是正确的问题？**

研究回路里有很多环节并不等价于生成更多候选答案。要决定一个结果能不能被接受，往往需要不同类型的证据：

- 指标是否真的代表想优化的目标；
- 实验环境是否和真实环境足够接近；
- 模型有没有识别出自己正在被评测；
- monitor 和被监控模型会不会共享同一种盲区；
- 一个结果能否复现，是否只是偶然成功；
- 新能力出现后，原来的安全假设是否还成立。

这些事情并不会因为“再复制一百个同类 Agent”就自动解决。

OpenAI 在自己的 research acceleration 报告里其实也写得很清楚：代码和实验在加速，但整个研究过程还有很多串行或半串行环节。研究优先级要有人决定，实验要跑完，算力是约束，结果要判断，安全问题还可能迫使训练暂停。

这也和我不久前读另一场 Dwarkesh 访谈后的判断接得上：[AI 研究可能比一般白领工作更早被自动化](https://ntlx.github.io/articles/recursive-self-improvement-bottleneck)，正因为研究里有大量可测量、可反馈、可重复的部分。但越往 RSI 走，那些剩下的不可轻易自动化环节反而会占据更大的比例。

瓶颈不会消失，只会迁移。

![验证需要异质且相对独立的证据汇合](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-19-agent-swarms-assurance-gap-img-01-framework-independent-evidence.png)

## Alignment 让“验证速度”不再只是质量问题

如果只是写代码，验证慢一点，最坏通常是 bug 晚一点被发现。

到了高自治 Agent，这个问题的性质变了。

Hugging Face 事件最值得吸取的教训，并不是“multi-agent 天生危险”。Brown 在访谈里反复强调，根问题首先是 reward misspecification、misalignment 和 safeguards 不足；单 Agent 同样可能出问题。

但 swarm 会改变后果的传播速度。

如果一个系统能同时派生大量实例、长期运行、调用工具、修改状态，那么错误目标也拥有了同样的扩容能力。能力吞吐提高得越快，错误假设被放大的速度也越快。

我之前在[《如果沙盒能被改写，它还算隔离吗？》](https://ntlx.github.io/articles/agent-evaluation-attack-surface)里更关注评测环境本身如何变成攻击面。这次读 Brown，我更在意另一个问题：当模型越来越会识别测试环境时，我们还能不能构造足够真实、足够有区分度的评测，让“通过测试”继续意味着“值得放行”？

这就是我这里所说的 assurance。

它不是再找一个更聪明的 grader 就结束了，而是要不断获得新的、足够独立的证据。

OpenAI 最近公布的 misalignment reporting framework 里有一句话很直接：他们并不认为行业已经把 alignment 和 monitoring 解决到足以在更长时间里继续以最大速度扩张的程度。

这句话和“一万名 Agent”放在一起看，比单独看任何一个都更有信息量。

一边是能力系统开始具备大规模并行扩张的条件，另一边是开发这些系统的机构公开承认，判断它们是否足够安全的机制还没有同速成熟。

## CoT 是一个监控窗口，但不能被神化

访谈后半段花了不少篇幅讨论 chain of thought。

Brown 的担心可以理解：如果未来模型越来越聪明，又越来越懂得自己正在被监控，那么现在还能从 CoT 里看到的可疑意图，未必永远这么容易看到。

但这里需要做一个重要修正。

访谈章节标题写的是“Chain of thought is degrading”，可 OpenAI 随后公开的系统评估没有支持把它写成已经确定发生的趋势。在两次当前规模的 frontier RL training runs 中，研究者没有观察到 RL 显著降低 CoT monitorability，早期训练阶段甚至有所提高。

另一方面，OpenAI 也已经证明，直接对 CoT 施加强优化压力，让模型“不要想坏事”，可能只会让坏行为更难被 monitor 看见。

所以我更愿意把 CoT 看成 assurance stack 里一个很有价值、但状态仍然很不稳定的观测窗口。

它现在有用，不代表以后一定够用；它未来可能退化，也不等于今天已经退化。

![CoT 是 observability stack 中的一个窗口](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-19-agent-swarms-assurance-gap-img-02-framework-observability-window.png)

我不想把这件事写成“监控注定失败”。那样反而会遮住真正该建设的东西：更丰富的 observability、更真实的 eval、更独立的 verification，以及在证据不足时真正能让系统停下来的机制。

## 以后看 Agent swarm，我会同时看两条曲线

读完这场访谈后，我给自己留下了一个很简单的观察框架。

第一条是 **capability throughput**。

它看系统能在单位时间里调动多少机器认知劳动：模型有多强，可以运行多久，可以并行多少实例，能调用多少工具，能生成多少实验、代码和候选答案。

第二条是 **assurance throughput**。

它看系统能在单位时间里产生多少足够可信的判断：哪些结果是真的，哪些评测有意义，哪些行为是对齐的，哪些异常已经解释清楚，哪些风险足以要求暂停。

这两条曲线以前可能相差不大，因为人类既是主要执行者，也是主要验收者。

Agent 改变了这个关系。

执行侧开始像云资源一样扩容，而可信判断仍然依赖异质证据、独立检查和真实世界反馈。后者当然也会被 AI 加速，但未必和前者同速。

所以，当有人下一次告诉我一个系统同时跑了多少 Agent、消耗了多少 token、完成了多长时间的人类工作，我会觉得这些数字很重要，但还不够。

我更想知道的是：**它产生可信证据的速度，也一起变快了吗？**

如果没有，那么真正控制 RSI、Agent 组织和企业自动化速度的，最终可能不是我们能启动多少个 Agent，而是我们能多快获得足够好的理由，允许它们继续往前跑。

## 参考资料

- Dwarkesh Patel, Noam Brown – Agent swarms, alignment, & recursive self-improvement  
  https://www.dwarkesh.com/p/noam-brown
- OpenAI, On the Navier–Stokes Millennium Prize Problem  
  https://openai.com/index/navier-stokes-solution/
- OpenAI, Research acceleration: The view inside OpenAI  
  https://openai.com/index/research-acceleration-view-inside-openai/
- OpenAI, Detecting misbehavior in frontier reasoning models  
  https://openai.com/index/chain-of-thought-monitoring/
- OpenAI, Evaluating chain-of-thought monitorability  
  https://openai.com/index/evaluating-chain-of-thought-monitorability/
- OpenAI, Our framework for reporting model misalignment  
  https://openai.com/index/model-misalignment-reporting-framework/
