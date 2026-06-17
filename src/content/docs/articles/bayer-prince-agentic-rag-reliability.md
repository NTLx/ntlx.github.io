---
$schema: starlight
title: 可靠 Agent 的秘密，不在 Agent
description: 生产级 Agent 的底座，是能追踪证据、状态、失败和人类问责的工程系统。
date: 2026-06-17
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-17-bayer-prince-agentic-rag-reliability-img-00-infographic-core-summary.png)

我读完 Bayer 这个 PRINCE 案例，第一反应有点冷。

我觉得它最有价值的地方，是把 Agent 从那种热闹的 demo 感里拉了回来。文章没有把重心放在模型多聪明，反而反复讲那些不性感的东西：上下文怎么切、证据怎么找、状态怎么存、失败怎么恢复、答案怎么引用、专家什么时候接手。

这才像生产系统。

## 从 Search 到 Do，升级的是责任

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-17-bayer-prince-agentic-rag-reliability-img-01-search_ask_do_responsibility_shift.png)

PRINCE 的演进路线很顺：Search、Ask、Do。

Search 阶段，系统把 Bayer 过去分散在各处的临床前研究报告和元数据集中起来，让科学家能筛选、搜索。Ask 阶段，RAG 进来，研究人员可以用自然语言问 PDF 报告里的内容。Do 阶段，多智能体工作流接上来，系统开始支持复杂问题、实验规划，甚至监管文档草拟。

这条线看起来是能力越来越强。

但我更愿意把它看成责任越来越重。

Search 错了，用户大概还能自己翻结果。Ask 错了，用户可能会被一个听起来完整的答案带偏。Do 错了，系统就在真实流程里推动下一步。药物研发又不是写周报。这里的每个判断，都可能影响实验设计、监管材料和研究时间线。

所以 PRINCE 真正有意思的地方在这里：它承认了一个不太讨喜的事实，*越能干的系统，越需要更硬的约束。*

这句话听起来保守。但生产环境里，保守经常是高级能力。

## 上下文不是越多越好

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-17-bayer-prince-agentic-rag-reliability-img-02-context_discipline_agent_roles.png)

原文里有一句我很喜欢：更大的上下文窗口没有消灭上下文纪律。

这点太容易被忽略。很多人做企业知识库，一上来就是"能不能把所有文档都塞进去"。好像上下文越大，答案就越准。PRINCE 的经验刚好相反：早期把太多信息塞进上下文，系统反而更难 steer，也更难评估。

原因不复杂。模型看到的东西越多，不代表它更懂边界。它只是多了更多可以误用的材料。

PRINCE 的做法，是把上下文拆给不同角色。Think & Plan 拿规划上下文，Researcher 拿检索上下文，Reflection Agent 拿证据上下文，Writer Agent 拿综合上下文。Text-to-SQL 也不是把整套数据库 schema 全塞进去，而是动态注入和当前问题相关的 schema 片段。

这看起来像工程洁癖，其实是可靠性的底座。

因为每个 agent 看到的东西越明确，你才越知道它为什么错。是工具选错了？是证据不够？是 schema 给多了？是 Writer 擅自补全了？如果所有东西都混在一个大 prompt 里，错误就像墨水滴进水杯，你只能看到它脏了，却很难知道从哪里开始脏。

## 反射被拆成三件事

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-17-bayer-prince-agentic-rag-reliability-img-03-three_reflection_loops.png)

现在很多文章喜欢说"加一个 reflection loop"。听上去像给系统装了一个自省按钮，按下去，它就会变可靠。

PRINCE 这个案例把这件事拆细了。

第一种反射是流程反射。Think & Plan 问的是：我现在走的路径对不对？该不该换工具？下一步该先查结构化数据，还是先查 PDF 报告？

第二种反射是数据反射。Reflection Agent 问的是：我拿到的证据够不够？有没有缺口？如果不够，它会生成后续问题，把流程拉回检索。

第三种反射是草稿反射。Writer 写出的东西，要检查是否缺章节、表格是否不一致、是否遗漏了原问题要求。尤其是监管文档草拟，最后仍然要由合格人员审阅和批准。

这三种反射服务的是三类问题。

流程反射防止系统走错路。数据反射防止系统拿薄证据硬答。草稿反射防止系统把材料合成得很顺，却漏掉关键结构。

把它们混在一起，就会得到一种虚假的安全感：系统"反思过"。但你问它到底反思了什么，它说不清。PRINCE 的价值在于，它把反思拆成了不同责任点。拆开以后，才有测试、观测和改进的可能。

## 可靠性在模型外面

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-17-bayer-prince-agentic-rag-reliability-img-04-production_harness_control_points.png)

这篇文章最打动我的部分，是那些模型外的工程细节。

每个 LangGraph 节点执行后，agent state 写入 PostgreSQL。更大的应用状态放在 DynamoDB。LLM 调用失败，会先重试，再 fallback 到另一个模型或平台。SQL 生成只能做 SELECT，失败后把错误信息、失败 SQL 和原问题喂回模型，最多重试 3 次。生产流量进 Langfuse，每天做 live traffic evaluation；核心工作流、prompt 或模型变了，再跑数据集评测。

这些东西单独看都不新。

但合起来，它们说明了一个事实：生产级 Agent 的可靠性，大多长在 Agent 外面。

它在 harness 里。谁能调用什么工具，什么时候暂停，失败后从哪里恢复，哪些证据可以进入最终答案，哪些输出必须带引用，什么情况下要人类复核。这些边界不靠模型自觉。它们靠外部系统写死、记录、验证、回滚。

这也是我对"Agent 会替代软件工程"这种说法最不耐烦的地方。你真把 Agent 放进一个受监管、高风险、数据很脏的企业流程里，就会发现工程并没有消失，只是换地方了。以前工程师写业务路径，现在工程师写路径周围的控制系统。

模型负责生成可能性。工程负责限制可能性。

## 我仍然保留怀疑

话说回来，我不想把 PRINCE 写成一个已经证明一切的模板。

公开资料里能看到架构、流程、指标和使用方向，但我没有找到独立第三方对它长期线上效果的系统性审计。论文和活动页会说它提升数据可访问性、研究效率和透明度，这些判断可信，但我们仍然很难从外部知道：它在真实高压场景里错过什么、误判什么、专家到底花多少时间复核。

还有一个更现实的问题：这套东西贵。

多智能体、RAG、Text-to-SQL、重排、评测、trace、状态恢复、人工复核。每一层都是成本。很多团队读完可能会学到一个错误结论：我们也该上 LangGraph、多 agent、全套观测。

未必。

PRINCE 的前提是 Bayer 有几十年的临床前研究资料，有高价值的历史报告，有监管文档这种强约束输出，有足够高的错误成本。它需要复杂系统，因为它的问题本来就复杂。

如果你的任务只是查内部 FAQ，可能一个普通 RAG 加上拒答规则就够了。如果你的流程路径固定，workflow 比 Agent 更好。如果证据不足时可以直接转人工，就不要硬造一个会绕三圈的反射系统。

但 PRINCE 仍然给了我一个很清楚的判断标准：不要问"我们有没有 Agent"。问"我们有没有证据链"。

当答案错了，你能不能看到它用过哪些 chunk、哪些 SQL、哪些 schema、哪些 prompt？当中间一步失败，你能不能从失败节点恢复，而不是重跑整个流程？当模型很自信但证据很薄，你有没有一个机制让它停下来？当系统生成监管相关文字，最后是谁签字？

这些问题答不上来，Agent 越强，风险越大。

*你现在手里的 Agent，更缺一个更强的模型，还是更缺一条能追责、能恢复、能复核的证据链？*

## 原文参考

> Martin Fowler. Building Reliable Agentic AI Systems - A Case Study in building production-ready agentic AI systems.
> <https://martinfowler.com/articles/reliable-llm-bayer.html>

> Frontiers in Artificial Intelligence. From data silos to insights: the PRINCE multi-agent knowledge engine for preclinical drug development.
> <https://www.frontiersin.org/journals/artificial-intelligence/articles/10.3389/frai.2025.1636809/full>

> Thoughtworks. Accelerating preclinical drug discovery with Agentic AI: inside Bayer's PRINCE multi agent system.
> <https://www.thoughtworks.com/about-us/events/webinars/accelerating-preclinical-drug-discovery-with-agentic-ai>

> Martin Fowler. Context Engineering for Coding Agents.
> <https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html>

> Martin Fowler. Harness engineering for coding agent users.
> <https://martinfowler.com/articles/harness-engineering.html>

> Anthropic. The "think" tool: Enabling Claude to stop and think.
> <https://www.anthropic.com/engineering/claude-think-tool>
