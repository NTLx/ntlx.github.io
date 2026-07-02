---
$schema: starlight
title: AGENTS.md 不是文档，它是 Agent 时代的路由层
description: 真正让 agent 在 monorepo 里少走弯路的，不是多写几条提示词，而是先决定什么该始终加载，什么该按任务路由，什么必须用 hook 和测试强制执行。
date: 2026-07-02
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-02-agentsmd-routing-layer-img-00-infographic-core-summary.png)

读 Simon Boudrias 这篇《Steering AI Agents in Monorepos with AGENTS.md》，我最大的感受是：这篇文章表面在讲一个文件，底下真正牵动的是上下文路由。

如果只把 `AGENTS.md` 理解成“给 AI 写说明书”，你会低估它。更实际的问题是：当一个 agent 进入 monorepo 时，你准备先让它看到什么，后让它看到什么，哪些信息永远不该默认加载，哪些规则根本不该交给模型自己记住。

## root AGENTS.md 解决的是路由问题

原文里最重要的判断，我觉得不是 “`AGENTS.md` is the contract”，而是 root `AGENTS.md` 应该成为一个 map。

这句话很关键。因为 monorepo 最大的问题，从来都不是缺文档，而是文档太多、目录太深、局部规则太碎。你当然可以在每个子目录都放一个 `AGENTS.md`，让“最近的文件获胜”。但那只解决了局部约束的作用域，没有解决入口问题。

用户还是得知道自己该从哪个目录开始问，agent 还是可能在错误的层级里乱读一通。Simon 提出的 root `AGENTS.md`，本质上是在做一张任务路由表：要写邮件，去读 `emails/AGENTS.md`；要改 Go service，去读 `go/services/AGENTS.md`；要补测试，去读 `.agents/unit-tests.md`。

这已经不是“文档组织”了，更像是在做上下文分发。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-02-agentsmd-routing-layer-img-01-root_router_to_local_context.png)

换句话说，root `AGENTS.md` 的价值不在于它自己写了多少规则，更多在于它帮 agent 少读了多少无关内容。它像一个很薄的调度层，把本该默认加载的冲动压下来，把“按任务加载”变成一种结构化习惯。

## 这件事本质上是在管理 context budget

原文没有把这点说得特别重，但我读下来觉得，这是整篇文章最有工程含量的地方。

`AGENTS.md` 官方站点把它定义成 “README for agents”。这个定义没错，但还不够。因为 README 这个比喻天然会让人觉得：只要把注意事项写完整就行。可 agent 工作不是人类 onboarding。人类一天入职一次，agent 每开一条新轨迹都在重新入职。

于是问题变成：哪些信息值得让它在每次会话里都重新看一遍？

OpenAI 的 Codex Prompting Guide 一直在强调 token 效率、压缩、长时自治。这背后的现实很直接：上下文不是免费的。凡是默认加载的内容，都在对每一次任务征税。你在 root `AGENTS.md` 多写一段“看起来也许有用”的规范，它不是摆在那里而已，它会在未来无数次会话里反复占用预算。

Basis 那篇讲 agent-native monorepo 的文章把这个原则说得更狠，叫 `default-no`。任何自动加载的上下文，都必须先证明自己值得。

我觉得这比“怎么写好 AGENTS.md”更接近问题核心。因为一旦你开始从 context budget 的角度想，很多文档习惯会立刻变形：共享的才上浮，局部的就下沉；描述性的说明删掉，操作性的指令留下；跨目录但不该常驻的知识，不塞进 root 文档，而是变成按需触发的 skill。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-02-agentsmd-routing-layer-img-02-context_budget_default_no.png)

## 但文档再好，也只是软约束

这里也是我对原文最想补的一刀。

Simon 这篇文章很适合拿来做 steering docs 的入门框架，但如果把它理解成“把 `AGENTS.md` 写好，agent 就会稳定很多”，我觉得还差半步。

因为文档本质上是建议层。它能提高命中率，不能提供确定性。

Claude Code 的 hooks 文档把这件事讲得很清楚。`PreToolUse` hook 可以直接 deny 一个危险命令。它不是“提醒模型别这么做”，而是“你就是做不了”。这两者的差别很大。前者靠 agent 记住规则，后者靠系统直接封死出口。

所以我会把 agent 治理拆成三层：

1. `AGENTS.md` / skills 负责路由和行为偏好。
2. hooks 负责“绝不能发生”的边界。
3. tests / lint / harness 负责最后的可验证性。

很多团队的问题不是缺少哪一层，而是把三层都寄托给第一层。于是 `AGENTS.md` 越写越长，语气越来越强，最后变成一堆“必须”“务必”“严禁”。看起来很有力量，实际上最脆弱。因为模型并不会因为你用了更重的语气就突然拥有执行力。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-02-agentsmd-routing-layer-img-03-docs_hooks_tests_stack.png)

## 这篇文章真正有价值的地方，是它在暗示一种组织分工

原文最后那段讲 platform team 和 product team 的关系，我觉得非常重要。

过去我们总把 AI 工具的使用想成“每个工程师自己调 prompt”。但 monorepo 场景里，这种理解太小了。因为一旦几十个工程师、几百个目录、多个 agent 工具同时存在，真正决定产出的不是谁更会下提示词，而是谁在维护那套共同的上下文基础设施。

平台团队适合做的是骨架：root `AGENTS.md`、共享 skill、验证流程、基础 hooks、统一 MCP 接口。业务团队适合做的是局部真相：某个目录里哪些约束最重要，某个服务真正的边界在哪里，哪些历史坑 agent 最容易踩。

这也是为什么我觉得 root `AGENTS.md` 最好被理解成路由层，而不是圣经。圣经试图覆盖一切。路由层只负责把人送到该去的地方。

Datadog 这篇文章解决的是“第一步怎么迈出去”。它告诉你别先想着写一个巨大总纲，而是先让 root 文档把 agent 领到正确的局部上下文里。这个建议很实用。

但读完以后我更强的结论是：Agent 时代真正稀缺的不是 prompt 技巧，而是上下文治理能力。你要知道哪些东西应该成为 canon，哪些东西只是历史；哪些规则应该靠文档提示，哪些必须靠 hook 和测试兜底；哪些知识该上浮为共享约束，哪些必须永远贴着代码本地存放。

一旦把问题看成治理，而不是写作，`AGENTS.md` 的位置就清楚了。它不是终点。它是入口。

*如果让你删掉团队里一半的 agent 规则，只保留最有价值的一半，你会先保留路由文档、hooks，还是测试约束？*

## 原文参考

> Simon Boudrias. Steering AI Agents in Monorepos with AGENTS.md. DEV Community, 2025-09-26.
> <https://dev.to/datadog-frontend-dev/steering-ai-agents-in-monorepos-with-agentsmd-13g0>

> AGENTS.md official site.
> <https://agents.md/>

> Claude Code Docs: Hooks reference.
> <https://code.claude.com/docs/en/hooks>

> OpenAI Developers Cookbook: Codex Prompting Guide.
> <https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide>

> Michael Crabtree. How We Made Our Monorepo Ergonomic for Agents. Basis, 2026-05-19.
> <https://www.getbasis.ai/blogs/how-we-made-our-monorepo-ergonomic-for-agents>
