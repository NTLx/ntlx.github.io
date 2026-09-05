---
$schema: starlight
title: 多智能体的分水岭，是控制流有没有变清楚
description: Agent 的强弱不只看模型回答得多好，还要看能力能否复用、任务能否并行、结果能否验收，以及简单请求能否避开昂贵推理。
date: 2026-09-05
category: ai-agents
primarySourceUrls: ["https://developers.googleblog.com/4-engineering-patterns-behind-the-strongest-ai-agents-challenge-submissions/"]
---

我读完 Google Developers Blog 这篇挑战赛复盘后，最先想做的不是把四个模式记下来，而是问一个更麻烦的问题：如果把代码里的 agent 名称全部删掉，这套系统的控制流还剩下什么？

这个问题有点刻薄，却很有用。因为“多智能体”很容易变成命名：一个模型负责规划，另一个负责检索，第三个负责执行，最后它们沿着一条提示链依次调用。角色变多了，等待、失败和成本却仍然没有被系统接住。

原文写的是 Google for Startups AI Agents Challenge 中排名靠前的提交。作者从匿名方案里挑出四种反复出现的工程做法：双向 MCP、事件驱动并发、同标准的模型回退，以及分层路由。我的读法是，它们其实都在做同一件事：把模型调用从一条不透明的 prompt chain，改造成有接口、有调度、有验收、有预算的控制系统。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/ai-agent-engineering-patterns-reading-response-00-infographic-core-summary.png)

## 先看控制流，不看 Agent 数量

原文开头先戳破了一个常见错觉：有些提交是真正的 multi-agent system，有些只是单模型走了一串 prompt，再给每一段贴上 agent 名称。两者的差别，不在架构图上有几个圆角矩形，而在系统有没有改变四个控制点：能力怎么暴露，独立工作怎么启动，结果怎样出门，哪些请求根本不值得调用大模型。

我把它们记成四个控制点。双向 MCP 处理“暴露”，事件总线处理“并行”，统一验证处理“验收”，分层路由处理“分流”。它们都在模型之外加了一点确定性，但目的不是把模型排除出去，而是别让模型独自决定所有控制流。

这和我之前读 [《Google 给 RAG 加的不是更多 Agent，而是停手判断》](https://ntlx.github.io/articles/google-agentic-rag-sufficient-context) 时留下的疑问正好接上：系统要知道什么时候证据还不够，才不会过早回答。今天这篇文章把同一种思路推到了运行层：系统也要知道什么时候不该等待、什么时候不该放行、什么时候不该调用最贵的模型。

## 双向 MCP：把能力变成可授权的窄接口

原文描述的第一个方案有一个很容易被“多智能体”三个字盖住的细节。这个 agent 内部通过自己的 MCP 工具层访问 telemetry 数据，同时又以 MCP server 的形式，让别的 agent 直接调用它的推理能力。

这不是把一个聊天窗口换成另一个协议。内部那一层先解决了上下文边界：面对生产数据库时，agent 不应该把整张表原样倒进模型，而应该通过工具去取某个 job 的执行计划或一条 stack trace。数据访问经过工具层，返回值才有机会被限制成一个能解释、能审计、也不会无限膨胀的答案。

再往外一层，改变的是这项能力怎么被别的工作流接住。性能分析 agent 不再只服务一个人类 UI，终端里的 coding agent、IDE 里的工作流或另一个专业 agent，都可以按同一套工具契约调用它。MCP 的 [官方架构说明](https://modelcontextprotocol.io/docs/learn/architecture)把 client 与 server 的边界讲得很清楚。这里值得借的是，内部能力和外部能力没有各写一套接口。

我会把“窄接口”放在这段设计的中心，不把“双向”当成口号。一个只返回受限答案的工具，才适合交给不受你控制的调用者；一个能执行任意 SQL、吐出任意上下文的连接，几乎不可能直接暴露出去。原文也特意提醒，对外提供 MCP server 后，访问控制就不再是可选项。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/ai-agent-engineering-patterns-reading-response-01-bidirectional-mcp.jpg)

对自己的系统做一个小检查：某个 agent 如果已经能通过工具完成一段推理，这段能力能不能被另一个工作流调用？如果能，先确认输入、输出上限、身份和授权；如果不能，先别急着再写一个人类专用 API。复用的前提不是把内部实现全暴露，而是把真正稳定的能力收束成一层可授权接口。

## 事件总线：并发的价值是删掉等待

第二个案例更像一次控制流重构。最初的版本是传感器监控 agent 调合规 agent，合规 agent 再调居民消息 agent，最后才调 dispatch agent。demo 可以工作，真实用例却要求在跌倒风险窗口关闭前完成检测、药物交叉核对和消息派送。

提交方案后来使用异步事件总线：每个 agent 有自己的 `asyncio.Queue` 和 worker coroutine，agent 发布带类型的事件，订阅自己关心的 topic。步态速度下降 15% 或更多时，系统发布 `CLINICAL.ANOMALY_DETECTED`；合规 agent 消费后再发布 `CLINICAL.COMPLIANCE_REPORT_READY`。Python 的 [`asyncio.Queue` 文档](https://docs.python.org/3/library/asyncio-queue.html)描述的是生产者与消费者之间的异步队列，这个例子把它放进了多个 agent 的调度关系里。

线性调用链的延迟容易算：前一个 agent 没返回，后一个就不能开始。事件总线能改善的不是所有延迟，而是那些没有真实数据依赖的等待。比如两个 agent 都只需要知道“异常发生了”，却不需要彼此的结果，它们就可以同时被唤醒。最快的 agent 不必继续排在最慢的网络请求后面。

但我不想把“用了队列”直接等同于“获得并发”。如果两个步骤共享同一份会被修改的状态，或者后一步必须消费前一步的判断，强行并行只会制造竞态。事件驱动也没有替你省掉工程工作：事件要有稳定类型和关联 ID，消费要考虑幂等、重试上限、背压、死信和 trace。否则系统只是把调用栈上的问题换成了更难追的消息问题。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/ai-agent-engineering-patterns-reading-response-02-event-bus.jpg)

我会先找“同一信号是否唤醒多个互不依赖的工作”，而不是先换消息中间件。找不到这样的关系，队列只是新的基础设施；找到之后，再把事件契约和失败状态补齐，才有资格谈并行收益。

## fallback 与路由：一条守住质量，一条守住预算

原文的后两个模式放在一起看，刚好对应模型系统的两种不确定性：模型可能暂时不可用，也可能根本不值得被调用。

### 回退模型可以换，验收入口不能换

一个临床推理 agent 的主模型在真实负载下返回 503。参赛团队没有只加重试，而是让回退模型接手，并把主模型和回退模型的响应都送进同一个验证函数。原文举的检查是：回答是否确实引用了真实的临床指南，而不是只生成了像医学语言的句子。

我最想拿走的不是“准备一个 fallback”，而是把验证放在两条路径汇合之后。若主路径写一份检查，回退路径再写一份，下一次修改很容易只改到其中一边；若两边都必须通过 `validate_clinical_response()`，模型是谁就不再决定质量门槛。

原文正文与 Pattern 3 图片里的模型版本标注并不一致，所以本文不重复具体版本名，也不把那张图作为正文素材。这个小矛盾反而提醒我：视觉材料和正文都属于证据，不能因为图看起来像“官方配图”就跳过核对。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/ai-agent-engineering-patterns-reading-response-03-unified-validation-gate.png)

我会把回退路径当成一条必须和主路径一样严格的产品路径来测：同一批输入、同一套结构检查、同一套引用或事实校验，再把两条路径的延迟、失败率和人工复核率分开记录。切换模型不应该悄悄切换产品标准。

### 分层路由先问“要不要调用”

成本案例的起点也很朴素：真正吃掉推理预算的不是难问题，而是“我的订单在哪”“怎么取消预约”这类简单请求，它们和复杂问题一起走完整模型调用。

提交方案在 agent 前面放了多层筛选：本地 regex 先处理导航意图；模糊请求再交给便宜模型做意图分类；只有无法被前两层处理的请求，才进入完整推理。原文称，第一层按团队自己的测量处理了超过 40% 的输入。这个数字有用，但只属于这个团队的流量分布，不是可以直接复制的承诺。

我喜欢这个顺序：先问“要不要调用”，再问“调用哪个模型”。它和 [《Agent 规模化后，最贵的不是模型》](https://ntlx.github.io/articles/agent-scale-cost-loop) 里“看有效结果成本，不只看 token 单价”的判断是同一条线。路由的收益必须和误判后的返工、升级和人工接管一起算；否则便宜模型只是把账单转移到了后面。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/ai-agent-engineering-patterns-reading-response-04-tiered-routing.jpg)

对自己的流量先做分布统计，再决定路由层级。若简单请求只占很小比例，增加分类器可能不划算；若大量请求都在重复查同类状态，一个确定性规则就可能比换更大的模型有效。路由器不是“降智开关”，而是资源预算的入口。

## 把四个模式变成一次代码评审

读到结尾，我没有得到一张“多智能体架构标准答案”，反而得到一份适合放进设计评审的四问清单：

- **能否暴露？** 这段推理是否已经被收束成有输入/输出上限、身份和授权的工具契约？
- **能否并行？** 是否存在多个工作都响应同一信号，却被一条调用链强迫串行等待？
- **能否验收？** 主模型、回退模型和异常路径是否都经过同一个可测试的质量门？
- **能否避免调用？** 真实流量里有多少请求可以在规则或低价分类层结束？

这四问比“我们是不是该上 multi-agent”更早，也更具体。回答不出来时，优先补控制流和测量，再考虑引入更多角色。很多所谓 agent 复杂度，来自没有把等待、失败和调用成本显式建模。

当然，四种模式并不适合无条件叠加。双向 MCP 会扩大权限边界，事件总线会增加状态管理，统一验证函数可能把错误标准固化，分层路由可能误杀真正复杂的问题。任务小、依赖强、结果难以形式化验收时，一条普通的单 agent 流程反而更诚实，也更容易排错。

Google 文章提到，ADK 和 [Agents CLI](https://github.com/google/agents-cli) 的提交里更常见这些做法；我更愿意把它理解为工具能否容纳工程选择，而不是框架自动送来的能力。下一次评审 Agent 系统时，我的可验证预测是：能不能替换一个模型，能不能重放一条事件，能不能证明一次 fallback 没绕过验收，以及每个合格结果花了多少钱，会比图上有多少个 agent 更能说明系统成熟度。

如果只让你今天检查一处，你会先查串行等待、fallback 是否绕过验证，还是简单请求有没有误触发大模型？

## 参考资料

- 原始文章：[Google Developers Blog：4 engineering patterns behind the strongest AI Agents Challenge submissions](https://developers.googleblog.com/4-engineering-patterns-behind-the-strongest-ai-agents-challenge-submissions/)
- 活动背景：[Google Cloud：Startups are building the agentic future with Google Cloud](https://cloud.google.com/blog/topics/startups/startups-are-building-the-agentic-future-with-google-cloud)
- 协议背景：[Model Context Protocol 官方架构](https://modelcontextprotocol.io/docs/learn/architecture)
- 异步队列：[Python `asyncio.Queue` 官方文档](https://docs.python.org/3/library/asyncio-queue.html)
- 工具背景：[Google Agent Development Kit 官方文档](https://google.github.io/adk-docs/)
- 实现入口：[Google Agents CLI](https://github.com/google/agents-cli)
- 站内延伸阅读：[《Google 给 RAG 加的不是更多 Agent，而是停手判断》](https://ntlx.github.io/articles/google-agentic-rag-sufficient-context)、[《Agent 规模化后，最贵的不是模型》](https://ntlx.github.io/articles/agent-scale-cost-loop)
