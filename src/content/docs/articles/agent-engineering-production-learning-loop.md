---
$schema: starlight
title: Agent Engineering 的真门槛：把失败变成资产
description: Agent 跑起来只是起点；真正的门槛是把生产里的模糊失败变成下一轮可验证的改进。
date: 2026-06-17
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-17-agent-engineering-production-learning-loop-img-00-infographic-core-summary.png)

## 这篇文章真正戳中的地方

LangChain 这篇《Agent Engineering: A New Discipline》，我一开始是带着一点警惕读的。现在 AI 圈太爱给旧东西起新名词。今天是 prompt engineering，明天是 context engineering，后天又是 agent engineering。每个词都像一个新抽屉，打开以后，有时只是把原来的工程常识重新摆了一遍。

但这篇我读下来，觉得它说中了一个真问题：Agent 从 demo 到 production，中间不是“再调调 prompt”这么简单。

传统软件里，我们大体知道输入是什么，输出是什么，中间路径是什么。Agent 不一样。用户可以说任何话，模型可能走不同工具路径，最后还可能给出一个看起来很顺、实际上偏掉的结果。更麻烦的是，系统没崩。接口没报错。监控上也许还是绿的。

它只是做错了事。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-17-agent-engineering-production-learning-loop-img-01-production-failure-invisible.png)

我愿意认真看“agent engineering”这个词，是因为它抓住了判断权的变化。Agent 把软件里原本藏着的那部分判断，交给了一个非确定系统。以前工程师主要处理“程序是否按我写的路径运行”。现在还要处理另一个问题：当路径不是我逐行写死的时候，我怎么知道它做得对？

## 新纪律的对象不是 Agent

LangChain 给出的定义是一个循环：build、test、ship、observe、refine、repeat。这个定义看起来普通，甚至有点像所有现代软件工程的常识。但关键差别在一句话：shipping is how you learn。

这句话如果放在普通 SaaS 上，容易变成增长黑话。可放在 Agent 上，它是很硬的工程事实。因为你在上线前想不到所有输入。你可以写十几个场景，甚至几百个测试，但真实用户会拿一句含糊、跳跃、带历史上下文的话，把系统推到你没见过的位置。

所以 agent engineering 真正要工程化的对象，是团队的学习回路。Agent 只是那个把问题暴露出来的东西。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-17-agent-engineering-production-learning-loop-img-02-team-learning-loop.png)

这个回路至少有四步。

第一，trace 要完整。你不能只看最后答案，要能回看模型当时拿到了什么上下文，为什么调了这个工具，工具返回了什么，它又怎么继续走下去。

第二，失败要入库。线上看到一个坏 case，如果只是发到 Slack 里骂两句，它很快就消失了。它应该变成一个可复现的 task。

第三，判断要写清楚。这个 case 为什么算失败？是事实错、语气错、策略错，还是工具选择错？如果两个懂业务的人不能大体独立判断 pass/fail，eval 就会变成情绪打分。

第四，修完要回归。改了 prompt、工具描述、模型配置或 workflow 后，旧问题不能靠记忆防守。它要进入下一轮测试。

这四步合起来，才是这篇文章里的“新纪律”。名字叫 Agent Engineering，但对象其实是组织。一个团队能不能把模糊失败变成样本、标准和回归测试，决定了它是不是只是在试 Agent，还是开始掌握 Agent。

## 我保留的怀疑

话说回来，我不想把这篇文章读成口号。

LangChain 当然有自己的位置。它不只是观察者，也是工具商。它说 observability、eval、production traces 重要，这个判断没错，但它也自然会把问题导向 LangSmith 这样的产品。这里要分清两件事：Agent 的生产化确实需要新工作流；但新工作流不等于你必须买某个平台。

更大的风险是，大家听到“Agent Engineering”以后，又开始把所有东西都 Agent 化。

Anthropic 在《Building effective agents》里有一个更保守的提醒：先找最简单的方案，只有复杂度能换来可证明收益时，才增加 Agent。很多任务用一次 LLM 调用、检索、结构化输出和人工确认就够了。硬塞一个多步 Agent，可能只是把原本可调试的系统，变成一个成本更高、延迟更长、失败更绕的系统。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-17-agent-engineering-production-learning-loop-img-03-complexity-decision-boundary.png)

这也是我读 LangChain 文章时最想补上的一刀：不要从“我们要做 Agent”开始。要从“这个任务是否真的需要模型自己决定下一步”开始。

如果路径清楚，用 workflow。\
如果输入复杂但分流明确，用 routing。\
如果答案可以被确定性检查，就先写测试。\
如果任务本身开放、步骤不可预判、需要模型在环境反馈里调整，再谈 Agent。

不然，agent engineering 会变成一种反讽：你还没学会工程化，就先把系统变得更难工程化。

## Trace 只能回答一半

LangChain 的 State of Agent Engineering 里有一组数字很有意思：89% 的组织已经做了某种 Agent observability，但 offline eval 只有约 52.4%，online eval 约 37.3%。这说明很多团队已经能“看见”Agent 在做什么，但还没有稳定回答“它做得对不对”。

这两个问题差很远。

Trace 解决的是发生了什么。Eval 解决的是这件事算不算好。前者偏工程，后者一定会碰到业务判断。一个销售 Agent 的失败，可能不是事实错，而是它把客户推进得太急。一个法律 Agent 的失败，可能不是答案不流畅，而是引用了不该引用的依据。一个客服 Agent 的失败，可能不是没答上，而是没有在该转人工的时候转人工。

这些标准不在日志里。它们在人脑里，在流程里，在团队对“好”的共识里。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-17-agent-engineering-production-learning-loop-img-04-trace-to-eval-pipeline.png)

Anthropic 的 eval 文章里有一个很朴素的建议：不用等到几百个任务，20 到 50 个来自真实失败的小任务就可以开始。这个建议比很多平台宣传都更有用。因为 eval 最怕的不是少，而是假。一个含糊的测试集会给团队虚假的安全感。一个小但真实的失败集，反而会逼你写清楚：什么叫成功，谁来判断，模型怎样才算真的修好了。

所以我的理解是：trace、eval、human review、A/B、monitoring 都不是银弹。它们只是把“感觉坏了”这句话，拆成可以处理的工程材料。

## 真正的门槛是学习速度

读完这篇文章，我对“agent engineering”这个词的态度变了点。

它当然有包装成分。每个基础设施公司都需要一个新词来定义市场。但这个词背后的问题是真的：当软件开始替人做判断，工程就多了一层任务，要让团队能持续校准判断。

这件事最难的地方，最后会落在团队习惯上。

你愿不愿意每周读真实 transcript？\
你愿不愿意把线上失败写成测试，而不是只修眼前那一例？\
产品、工程、数据、领域专家愿不愿意围着同一条 trace 讨论“这里到底算不算好”？\
你愿不愿意承认，一个 Agent 上线时不是完成态，而是一个学习装置？

如果这些答案是否定的，换再好的模型也只是把 demo 做得更漂亮。\
如果这些答案是肯定的，Agent 才开始像一个可运营的系统。

我觉得这就是这篇文章最值得带走的东西：不要问“我们有没有 Agent”。先问“我们有没有把失败变成资产的机制”。

*你所在的团队现在更缺的是 Agent 能力，还是把真实失败沉淀成 eval 和回归测试的能力？*

## 原文参考

> Agent Engineering: A New Discipline
> The LangChain Team, 2025-12-09
> <https://www.langchain.com/blog/agent-engineering-a-new-discipline>

> State of Agent Engineering
> LangChain
> <https://www.langchain.com/state-of-agent-engineering>

> Building effective agents
> Anthropic
> <https://www.anthropic.com/engineering/building-effective-agents>

> Demystifying evals for AI agents
> Anthropic
> <https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents>

> How we built our multi-agent research system
> Anthropic
> <https://www.anthropic.com/engineering/multi-agent-research-system>
