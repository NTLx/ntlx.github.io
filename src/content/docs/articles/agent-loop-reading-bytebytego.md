---
$schema: starlight
title: 循环交出控制权之后：读 ByteByteGo《The Agent Loop》
description: Agent 不是一个更聪明的 chatbot，而是一个架构决策——把循环退出权交给模型。这个决策的全部后果，才是 agent 工程真正要面对的东西。
date: 2026-07-10
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-10-agent-loop-reading-bytebytego-img-00-infographic-core-summary.png)

ByteByteGo 上周发了一篇关于 Agent Loop 的长文，标题叫 *The Agent Loop: How AI Goes From Answering Questions to Doing Things*。文章不长，但图解密度很高。七张图把 LLM 软件从"单次调用"到"Agent 循环"的演进画得清清楚楚。

我读完之后的第一反应不是"学到了什么新知识"，而是"终于有人把 Anthropic 和 OpenAI 散落各处的公开文档，画成了一张完整的地图"。这篇文章的价值不在原创洞见，在结构化重述。它把过去一年 agent 领域最重要的几篇工程文档，串成了一条可以讲给别人听的叙事线。

但读完之后也有一些想法，关于文章说了什么、没说什么、以及那些没说出来的部分为什么同样重要。

## 四步阶梯，但不是所有人都需要爬到顶

文章最清晰的贡献是这张四阶段演进图：

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-10-agent-loop-reading-bytebytego-img-05-augmented-llm.png)

**单次调用 → 增强 LLM → 工作流 → Agent。**

每一级解的都是上一级的硬约束。单调用够不到外部世界，所以加工具、检索、记忆变成增强 LLM。单调用做不完大问题，所以开发者把多个调用串成工作流。工作流的步数在设计时就定死了，遇到步数不可预知的问题，就把循环控制权交给模型——这就是 Agent。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-10-agent-loop-reading-bytebytego-img-06-workflows.png)

这个阶梯是真的。不是人为分类，是真实的约束递进，每一级都在回答上一级回答不了的问题。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-10-agent-loop-reading-bytebytego-img-02-four_stage_evolution_ladder.png)

但阶梯不等于必须爬到顶。这是文章隐含但没有明说的判断。

ByteByteGo 列了五种工作流模式（Prompt Chaining、Routing、Parallelization、Orchestrator-Workers、Evaluator-Optimizer），但没有追问一个实际问题：**你今天在生产环境里跑的 LLM 代码，大部分应该停在第几级？**

Anthropic 自己的 "Building Effective Agents" 给了更直接的答案：从简单开始，只在必要时增加复杂性。多数应用优化单次 LLM 调用就够了。这不是保守，是工程经济。workflow 比 agent 便宜得多、可预测、容易调试。

我之前写过一篇[《Not the Model, You're the Harness》](https://ntlx.github.io/articles/not-the-model-youre-the-harness)，核心观点是 agent 的性能瓶颈通常不在模型，而在循环外的支撑结构。ByteByteGo 这篇文章的四阶段图，恰好从另一个角度印证了同样的事。阶梯的第四级不是终点，是另一个起点：你交出了控制权，然后要花大量精力在它周围重建可控性。

## 循环内部：Perceive → Reason → Act → Observe

一旦决定用 Agent，循环内部的结构其实很简单：

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-10-agent-loop-reading-bytebytego-img-07-agent-loop.png)

**Perceive**（感知当前状态）→ **Reason**（模型决定下一步）→ **Act**（运行时执行动作）→ **Observe**（捕获结果，折回状态）。

模型每轮有四个出口：给出最终答案（退出循环）、调用工具（继续循环）、移交给另一个 agent（切换身份）、或者纯粹推理一步（ReAct 风格的 thinking）。

这个结构之所以有效，关键在于 **Observe** 这一步。文章引用了 ReAct 论文的核心洞见：每个 action 都被 observation 接地。模型不是在"想象中执行"，而是看到真实结果后再决定下一步。去掉 Observe，循环就退化成链，模型在预期上运行，不在现实上运行。

这让我想到一个实际使用中的体会：当你的 agent 工具调用失败了但没有返回明确的错误信息（比如超时、网络错误、权限不足），模型往往会"假装"调用成功了继续往前走。这就是 Observe 缺失的典型症状。闭环变成了开环，模型在幻觉中执行。

OpenAI Agents SDK 把前三个分支（final answer、tool call、handoff）定义为一级行为。第四个——continued thought——更多是 prompt 风格的产物。这意味着循环的"智能感"其实来自模型的分支选择能力，而非循环本身的代码。循环代码就是一个 while 循环加一个 dispatcher，真正让它看起来聪明的是模型在每个 turn 做出的判断质量。

## 复合错误：0.95 的 20 次方

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-10-agent-loop-reading-bytebytego-img-01-compound_error_decay.png)

文章最扎心的一个数字：**如果每步成功率 95%，20 步的联合成功率只有 36%。**

这不只是"注意风险"的提醒，这是一个结构性的数学限制。它意味着 agent 的可靠性瓶颈不在模型有多聪明，而在每步的可靠性有多高。

反过来的数学更有意思。如果通过 verifier 把每步可靠性从 95% 推到 99%，20 步成功率从 36% 跳到 82%。这就是为什么 coding agent 是所有 agent 类型里最先跑出来的——测试用例是天然的 verifier，每次跑测试就是在给循环加一个"这一步对不对"的检查点。

ByteByteGo 评论区里 Mitchell Kosowski 说得好："最高杠杆的 agent 改进通常不是更好的模型，而是更便宜的验证器。" 再推一步：**哪个领域先有便宜的 verifier，哪个领域就先被 agent 攻克。** 代码有测试、数学有证明、搜索有结果比对。但创意写作、产品设计、战略分析这些领域，"对"和"错"的边界本身就不清晰，verifier 天然昂贵。这些领域会是 agent 最后才能渗透的地方。

Gartner 预测超过 40% 的 agentic AI 项目将在 2027 年前被取消。大概率不是因为模型不行，而是因为这些项目所在的领域还没有足够便宜的 verifier 来支撑每步可靠性。

## 脚手架：循环之外的记忆

文章引用了 Anthropic 去年 11 月发布的 "Effective Harnesses for Long-Running Agents"，但只用了一小段。这个案例值得多展开几句，因为它是理解 agent 工程真正复杂度的最佳入口。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-10-agent-loop-reading-bytebytego-img-08-guardrails.png)

Anthropic 发现，即使使用 Opus 4.5 这样的一流模型加上 Claude Agent SDK，仅凭一句"给我建一个 claude.ai 的克隆"也做不出生产级应用。失败模式有两个：

1. **一次做太多**：agent 试图 one-shot 整个应用，context window 用完了，下一个 session 要从半成品里猜之前做了什么。
2. **过早宣布完成**：跑了几个 session 之后，agent 环顾四周觉得差不多了，直接交卷。

解决方案是换一种搭法，在循环外面加脚手架：一个 initializer agent 首次运行时生成 200+ 个 feature 的 JSON 清单、一个 coding agent 每个 session 只做一个 feature、一个 progress file 跨 session 传递状态、git history 让 agent 能回滚错误。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-10-agent-loop-reading-bytebytego-img-03-scaffolding_cross_session_memory.png)

这本质上是在解决一个跨 context window 的失忆问题。每个新的 agent session 就像一个失忆的工程师——它能力很强，但不知道昨天做了什么。脚手架就是在帮它"想起"昨天的事。

Anthropic 说灵感来源是"观察高效人类工程师的日常做法"，daily standup、commit message、README、交接文档。agent 的脚手架工程，本质上是在用代码复制人类团队协作中那些"保持连续性"的仪式。

我在[《Prompt 不够了，Loop 才是 Agent 时代真正的控制面》](https://ntlx.github.io/articles/claude-loops-control-surface)里写过类似的判断：prompt 是单轮的指令，loop 才是多轮的控制面。Anthropic 的 scaffolding 实践恰好证明了，loop 之外的那些结构（progress file、feature list、git history）才是真正的控制面。

## 什么时候不要用 Agent

这是文章最有价值的部分，但只占了一小段。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-10-agent-loop-reading-bytebytego-img-09-tradeoffs.png)

**Agent 经常是错误的选择。**

如果你的问题步数可预知、分支可枚举，workflow 更便宜、更可预测、更容易调试。Agent 的价值只在"步数不可预知 + 需要运行时判断"的场景——开放式的代码修改、多源信息检索、需要反复试错的探索性任务。

EU AI Act Article 14 将于 2026 年 8 月 2 日生效，要求高风险 AI 系统具备人类监督能力。这从监管角度给 agent 加了一道硬约束：你不能让 agent 在高风险场景里完全自主运行，必须在关键节点插入人类审批。

这和工程上的判断殊途同归。agent 的自主性越大，你需要在它周围建造的围栏就越密。Guardrails 不是可选项，是架构的一部分。Input guardrails 拦截第一轮的注入攻击和越界请求；Tool guardrails 包裹每个工具调用的输入和输出；Output guardrails 在最终响应到达用户之前做最后一道检查。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-10-agent-loop-reading-bytebytego-img-04-agent_decision_framework.png)

**一个实用的判断框架**：在决定用 agent 之前，先问自己三个问题——

1. 这个问题的步数我能提前知道吗？能 → workflow。
2. 每步的结果我能便宜地验证吗？能 → agent 可行。不能 → 先投资 verifier。
3. 如果 agent 做错了，后果可逆吗？不可逆 → 必须加人类审批节点。

## 一句话收口

Agent 时代真正的工程不在于让模型更聪明。模型已经拿到了循环控制权，剩下的事是在它周围建造足够好的围栏和扶手：每一步踩在实地上，错误不会级联，跨 session 不失忆，该停下来的时候停下来。

ByteByteGo 这篇文章画了一张好地图。但地图不是领土。从地图走到领土，靠的是脚手架、verifier、和知道什么时候不该用 agent 的判断力。

***

*你在使用 agent 工具（Claude Code、Cursor、Devin 等）时，遇到过哪些"循环失控"或者"过早宣布完成"的经历？你觉得哪些领域的 verifier 最贵、最难建？欢迎留言聊聊。*

## 延伸阅读

* [Prompt 不够了，Loop 才是 Agent 时代真正的控制面](https://ntlx.github.io/articles/claude-loops-control-surface)
* [Not the Model, You're the Harness](https://ntlx.github.io/articles/not-the-model-youre-the-harness)
* [Loop Engineering：Agent 真正的战场不是 prompt，而是回路](https://ntlx.github.io/articles/loop-engineering-agent-loops)
* [给 Agent 一个解释器——为什么大家都在让模型写代码来调用工具](https://ntlx.github.io/articles/agents-interpreter-code-orchestration)

## 参考资料

* [The Agent Loop: How AI Goes From Answering Questions to Doing Things — ByteByteGo](https://blog.bytebytego.com/p/the-agent-loop-how-ai-goes-from-answering)
* [Building effective agents — Anthropic Engineering](https://www.anthropic.com/research/building-effective-agents)
* [Effective harnesses for long-running agents — Anthropic Engineering](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
* [Running agents — OpenAI Agents SDK](https://openai.github.io/openai-agents-python/running_agents/)
* [Guardrails — OpenAI Agents SDK](https://openai.github.io/openai-agents-python/guardrails/)
* [ReAct: Synergizing Reasoning and Acting in Language Models (arXiv 2210.03629)](https://arxiv.org/abs/2210.03629)
* [Three keys to deploying AI agents — InfoWorld](https://www.infoworld.com/article/4190142/three-keys-to-deploying-ai-agents.html)
