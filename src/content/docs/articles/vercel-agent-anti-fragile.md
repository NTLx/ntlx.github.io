---
$schema: starlight
title: 让 Agent 犯错
description: Agent 的安全不靠让它更聪明，靠让它犯错时有人兜底——Vercel 把信任从模型挪到了基础设施，这才是 Agent 时代真正的基础工程。
date: 2026-07-12
category: ai-agents
tags:
  - Vercel
  - Agent安全
  - 反脆弱
  - 基础设施
  - 权限模型
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-12-vercel-agent-anti-fragile-img-00-infographic-core-summary.png)

## 一个让人安心的故事

Vercel 上周发了 Agent 产品更新，开篇讲了个场景：晚上十一点，一次坏部署上线，结账接口开始报 500。值班工程师还没打开电脑，Agent 已经定位到了四分钟前的那次部署，建议立即回滚。工程师批准。Agent 回滚到上一个版本，开始写修复 PR。

从告警到缓解，不到三分钟。

我读完第一反应不是"好厉害"，而是"好安心"。这个场景的精髓不在 Agent 多快——三分钟确实快，但自动化脚本也能做到。精髓在于：Agent 做这一切的时候，它没有被授予任何持久的写权限。它只是在被批准的那一瞬间，获得了做这件事的能力。做完，权限消失。

这让我想到一个问题：我们对 Agent 安全的思路，是不是一开始就走偏了？

## 你在赌什么

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-12-vercel-agent-anti-fragile-img-01-two_ceilings_model_vs_permission.png)

传统思路很直接：让 Agent 更聪明。模型够强就不会犯蠢，不会被 prompt injection 骗，安全自然就有了。

Vercel 在文章里直接否定了这条路。他们的说法是：非确定性系统永远会非确定性地失败。同一个 prompt，不同时刻出来的东西不一样。你没办法穷举所有失败路径，所以也没办法在模型层面写一套完备的防错规则。

换句话说，"模型够强就安全"是个赌局——赌训练覆盖了 corner case，赌输出过滤没漏网，赌人审批时没走神。每一道防线都是封闭集，但失败模式是开放集。封闭集永远追不上开放集。

Vercel 换了个赌法：不赌模型不犯错，赌犯了错损失有上限。

但思路的翻转是根本性的。防止失败要求系统知道什么是错的，信息量巨大；兜住失败只需要知道怎么回滚，信息量很小。金融里的风险对冲、飞机里的冗余引擎、微服务里的熔断机制，都是同一个逻辑：不赌你不出错，赌你出错时不会死。

## 三层兜底

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-12-vercel-agent-anti-fragile-img-02-plan_to_permission_flow.png)

Vercel 的兜底有三层，每层独立成立，层层冗余：

**独立身份。** Agent 不以你的身份行动，它有自己的 principal：`vercel-agent`。每次操作都有完整归因链——谁发起、谁批准、谁执行。审计日志里不会混。

**计划即权限。** Agent 默认只读。想动手？先提交计划，你批准后才拿到一个短生命周期的 capability，只覆盖计划里的操作。做完立刻回收。每次调用还要过三道门：capability 存在、token scope 覆盖、团队权限允许。权限是按计划粒度的，不是按会话粒度——同一对话里，新计划要重新审批。

**沙箱验证。** Agent 生成的代码跑在 Firecracker microVM 里——和 AWS Lambda 同一隔离技术。有独立内核、文件系统、网络。但沙箱里是你项目的完整副本，所以 Agent 能跑真实的 build、test、linter。只有通过的代码才会呈现到 PR 里。Agent 可以自由写代码、自由试错，但任何坏东西到不了你面前，也到不了生产。

这三层合在一起，把 Agent 的错误从"可能不可逆的灾难"降级为"可撤销的不便"。

## 脚下已经有地基

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-12-vercel-agent-anti-fragile-img-03-platform_endowment_not_designed_for_agent.png)

读完这篇文章我最在意的一点：这些安全机制都不是为 Agent 新造的。

Immutable deployments 是 Vercel 作为部署平台的基础架构——每次部署生成完整快照，永远不被覆盖。一键回滚是这个架构的自然延伸。每个 PR 自动生成的预览环境，也只是 Git 分支策略的产物。

Agent 时代来了，Vercel 发现自己手里已经有了 Agent 安全需要的所有基础设施。这不是巧合，是平台积累的结果——你长期投入的架构决策，在某个你没预见到的场景下突然变成了核心优势。

AWS 也在走同一条路。Lambda MicroVMs 管隔离，Agent Toolkit 管专家知识，Bedrock AgentCore 的 Policy 管治理，三层叠起来和 Vercel 几乎同构。行业在收敛到同一个答案：不是赌 Agent 不犯错，而是让它犯了错有人兜底。

但 Vercel 的从容在于：它不需要从零搭建这套东西。它脚下的地基已经在了。

## 兜底的边界

话说回来，我忍不住想：contain failure 真的够用吗？

如果 Agent 的错误不在部署层而在数据层——它删了用户数据——不可变部署可以回滚代码，但回滚不了数据。contain failure 的前提是"存在一个干净状态可以回退到"。有些操作天生是单行道。

Vercel 自己今年四月被 OAuth 攻击过，内部系统被渗透。如果平台本身被攻破，沙箱和权限隔离的地基就动摇了——contain failure 的每个机制都假设底层基础设施是稳定的，但基础设施也是人造的，也有 bug。

还有一种更隐蔽的情况：Agent 做了一件"技术上成功但语义上错误"的事。代码没报错，部署没崩，权限范围内合法执行，但业务逻辑是错的。contain failure 检测系统级失败，对语义级失败无能为力。错误被兜住了（没造成系统灾难），但也没被发现。

但说实话，这些边界反而让我更认可 Vercel 的思路。他们没有声称解决一切。他们做的是：在能兜住的范围内，把犯错代价压到尽可能低，然后诚实地告诉你哪些还兜不住。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-12-vercel-agent-anti-fragile-img-04-trust_in_infrastructure_not_model.png)

Vercel 博客里有句话我很喜欢："Power stops requiring trust." 权力不再需要信任。不是说信任不重要了，而是信任的对象变了——从信任模型不犯错，变成信任基础设施能兜住。

这和我之前写的[《Not the Model, You're the Harness》](https://ntlx.github.io/articles/not-the-model-youre-the-harness)说的是一回事：Agent 的上限不在模型，在包裹它的系统。Vercel 用五篇博客把这个判断落了地。二月讲安全边界，三月讲"Agent responsibly"，四月发 Agentic Infrastructure 宣言，七月是这次的 Agent 产品更新。一条线：基础设施准备好了，Agent 可以上场了。

Agent 时代最该投入的不是模型参数，是你脚下的地基有多可逆。

*你的 Agent 犯了错，你能在 30 秒内回滚吗？如果不能，问题可能不在 Agent。*

## 延伸阅读

* [Not the Model, You're the Harness](https://ntlx.github.io/articles/not-the-model-youre-the-harness) — Agent 的上限不在模型，在包裹它的系统
* [Agent Engineering 的真门槛：把失败变成资产](https://ntlx.github.io/articles/agent-engineering-production-learning-loop) — 生产学习循环如何让 Agent 持续改进
* [Claude Code 的七种控制方式](https://ntlx.github.io/articles/claude-code-seven-steering-methods) — 从"告诉 AI 做什么"到"让 AI 无法不做"
* [Claude Code 正在离开聊天框](https://ntlx.github.io/articles/claude-code-headless-automation) — Headless Agent 自动化的趋势

## 参考资料

* [Vercel Agent: An agent you can let near production](https://vercel.com/blog/vercel-agent)
* [Security boundaries in agentic architectures](https://vercel.com/blog/security-boundaries-in-agentic-architectures)
* [Agent responsibly](https://vercel.com/blog/agent-responsibly)
* [Agentic Infrastructure](https://vercel.com/blog/agentic-infrastructure)
* [Secure code execution for AI agents with AWS Lambda MicroVMs](https://aws.amazon.com/blogs/compute/secure-code-execution-for-ai-agents-with-aws-lambda-microvms/)
* [Firecracker: Secure and fast microVMs](https://github.com/firecracker-microvm/firecracker)
