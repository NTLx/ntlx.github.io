---
$schema: starlight
title: LangChain 不再做框架了
description: Interrupt 2026 释放的信号：agent 行业的 demo 期结束了。
date: 2026-05-16
category: ai-industry
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-16-langchain-interrupt-2026-overview-img-00-infographic-core-summary.jpg)

![LangChain 从框架到平台的生态全景：LangSmith Platform 作为中枢，辐射 Engine、SmithDB、Sandboxes、Context Hub、LLM Gateway、Fleet、Labs 七大产品](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-16-langchain-interrupt-2026-overview-img-01-infographic-langship-ecosystem.jpg)

## 框架死了

LangChain 在 Interrupt 2026 上发了一堆东西。11 分钟综述，Jacob Talbot 写的，5月14日刚发。我读完第一遍的感受是：他们不再做框架了。

不是 langchain 和 langgraph 不好用了，而是这家公司真正在押的东西全在 LangSmith 平台这边。Engine、SmithDB、Sandboxes、Context Hub、LLM Gateway、Fleet、Labs，没有一个是「帮开发者写 agent 代码」层面的东西。全在帮团队把 agent 管起来。

![框架与平台的视觉对比：左侧是 langchain/langgraph/crewAI 标签散落在脚手架代码结构上，右侧是整齐的 trace/evals/debug/scale 监控面板](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-16-langchain-interrupt-2026-overview-img-02-comparison-framework-vs-platform.jpg)

2024 年我做第一个 agent 项目的时候，langchain 是标配。谁不装谁落伍。但跑了一段时间就发现，真正卡人的不是怎么写一个 agent，而是 agent 跑崩了怎么知道、怎么修。

框架帮你启动。启动之后没人管。

## Engine 说了什么

先把最让我在意的东西拎出来。

LangSmith Engine 做的事情是盯着你的生产 trace，把失败聚类成命名问题，对照代码诊断根因，然后提出修复方案。每个问题它能做三件事：开 PR 直接修代码或 prompt，创建 scoped online evaluator 防止回归，把失败 trace 加到离线 eval 套件里当 ground truth。

Cogent 和 Campfire 已经用它解决了影响数千条 trace 的问题。现在公开 beta。

这不是 debug 工具。这是一个承认人已经管不过来了的工具。

以前 debug agent 要逐条看 trace，找模式，写 eval，修 prompt，跑回归。Engine 把这个循环交给了另一个 agent 来做，你只剩下 review 和 merge。

话说回来，review 和 merge 才是最有价值的部分。修什么、怎么修，Engine 只是 proposal，最后签字的还是人。

Harrison Chase 在 Interrupt 大会上说了一句我没记住原话但意思是这样的：我们花了很多时间帮开发者跑通第一个 agent，但真正难的是第 100 个、第 1000 个 agent 的行为管理。

100 个 agent 同时跑的时候，问题不再是 prompt 写得对不对，而是 trace 太多看不过来、失败模式太分散。Engine 试图解决的就是这个规模问题。不是帮你写一个更好的 agent，是帮你管一百个不那么完美的 agent。

## 基础设施接管

然后看其他发布的组合拳。

SmithDB 是专门给 agent trace 设计的数据库。Rust + Apache DataFusion + Vortex 架构，对象存储加小 Postgres metastore 加无状态服务。P50 trace tree 加载 92ms，P50 单 run 加载 71ms，核心体验快了 15 倍。

为什么需要专门做一个数据库？agent trace 不是普通的 log。嵌套 span、长时间运行的操作、分片到达的事件，查询模式是随机访问、交互式过滤、全文搜索、JSON 过滤、树感知查询。用 Postgres 扛这些撑不了多久。

SmithDB 是无状态设计，靠对象存储做持久化。扩容就是加 compute，不用操心数据库集群。这对多云部署和 self-hosted 场景是个大事。

Sandboxes 进入 GA。硬件虚拟化 microVM，每个 sandbox 跟你的服务和其他 sandbox 完全隔离。copy-on-write 快照、cheap fork、自动暂停、CLI 管理、Auth Proxy 注入凭证。

这些是工程师自己也能搭的东西。但搭一个需要多久？一个季度？两个季度？搭出来之后还得维护。

![基础设施成本对比：自建需要跨 Q1-Q4 设计数据库、搭建 VM、隔离沙盒、编写认证代理、持续维护；平台开箱即用，签约即启动](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-16-langchain-interrupt-2026-overview-img-03-comparison-infra-cost-vs-speed.jpg)

LangChain 算了一笔账：你的时间花在搭基础设施上，就不在 agent 逻辑上了。他们替你搭。

如果你已经有成熟的 infra 团队，这些能力对你吸引力不大。他们的目标用户是一线做 agent 的团队，10 到 100 人规模，有工程师但没专门的 platform 组。这批人最需要开箱即用的东西。

## Context Hub：非工程师的时代

有一个发布不太被讨论，但我认为很重要。

Context Hub 管 agent 行为文件：AGENTS.md、skills、policies、examples。支持版本管理、打标签、评论协作。

它解决的事是 context 不是工程师独占的。设计师改 prompt example，合规加 policy，市场同学调整 tone of voice，产品经理更新产品 context。这些东西变化快，而且不能全走 GitHub PR 流程。合规部门的人不一定知道 git rebase 是什么。

让对的人改对的东西，不需要经过会写代码的人。

agent 系统的 governance 开始像文档系统一样协作。LangChain 把组织问题搬进来了。

## 治理和 Fleet

LLM Gateway 治理层放在 agent 和 LLM provider 之间。配置方式是换 base\_url，就一行。花钱硬上限在 org、workspace、user、API key 四级，打满返回 402。PII 和 secrets 检测，策略分层执行，审计日志，trace 连续性。

一行配置换一套治理体系。

gateway 产生的 policy 事件直接进 LangSmith trace，不需要单独搭审计 pipeline。你在同一个 workspace 里看到 agent 行为和治理事件。

Fleet 加了五个预建 agent：

* **Coding agent**：基于 Open SWE，连 repo 开 PR
* **GTM agent**：销售和市场研究加起草 outbound
* **X 内容管理**：监控话题，草拟帖子
* **高管助理**：收件箱分诊、日程、会议准备
* **竞品研究**：监控竞品新闻、维护 battlecard

全部自带 onboarding 流程，问你行业、产品、客户帮你定制。Developer 和 Plus 计划送免费模型，Fireworks 推理。

这五个 agent 里有几个是别人整家公司在做的东西。LangChain 直接给你送，不要钱。它们在铺生态。你用了 Fleet 的 coding agent，下一个需求就是 Sandboxes，然后是 Engine，然后是 SmithDB。一环套一环。

## Deep Agents 0.6 和 Labs

Deep Agents v0.6 的细节：轻量 REPL 解释器做 programmatic tool calling，typed streaming，DeltaChannel 存 diff 不存全量快照。

DeltaChannel 这个设计有意思。长运行 agent 如果每步都存全量状态，存储膨胀是必然的。改存 diff 只记变化，跟 git 的思路一样。这是工程判断，不是营销语言。

Typed streaming 给了前端结构化的事件流：消息、推理、工具调用、subagent、自定义 channel、最终输出。React、Vue、Svelte、Angular 都有 v1 集成。前端开发者可以渲染 agent 的执行进度，不只是看到一个 spinner。

LangChain Labs 是新成立的研究部门，合作者有 Harvey、NVIDIA、Prime Intellect、Fireworks、Baseten。方向是用 agent trace 做持续学习。eval 生成、环境设计、harness 工程、模型选择、prompt 优化、fine-tuning。

把生产数据变成训练数据。

agent 用得越多，它会不会变得越好？不是靠人工调 prompt，而是靠 trace 数据自动改进。这个想法对，但难。Harvey 做法律 agent 的经验会是一个好的测试场，法律场景的 eval 标准比其他领域更清晰。

## 回到框架

那 langchain 和 langgraph 呢？

还维护。但 Deep Agents 0.6 和 SmithDB 的优先级才是这家的真正方向。LangChain 从帮你写 agent 代码变成了帮你管 agent 生产。

2024-2025 年 agent 框架满天飞，CrewAI、AutoGen、OpenAI Agents SDK。到 2026 年，所有人撞上了同一堵墙：debug、eval、scale。

OpenAI 推出了 Agent SDK 和 Agents API，Anthropic 有 Claude Code 和 MCP 协议，Google 有 Agent Development Kit。大家都在同一个方向走：从怎么让 model 调工具变成怎么让 agent 在生产环境可靠地跑。LangChain 的选择不是独特的，但它是走得最远的。LangSmith 的 tracing 基础设施给了它别人没有的数据优势。

Interrupt 大会在旧金山 The Midway 办了两天，1000+ 开发者到场，Harrison Chase 和 Andrew Ng 都讲了。他们展示的不是一组新功能，是一个信号：agent 行业的 demo 期结束了。

demo 期的标志是跑通就行。生产期的标志是坏了怎么修。

LangChain 选了后者。

## 我没被说服的部分

Fleet 送五个预建 agent，听起来很好，但够用和好用之间差的是 custom context 的深度。一个 GTM agent 问你行业和产品信息，这只是一层表皮。真正的 GTM 知识是你公司的 pipeline 结构、客户画像、竞争对手的弱点。Engine 能从 trace 里学出来吗？Labs 说能。我等着看证据。

还有一个问题：所有这些平台能力，是不是把你锁进 LangSmith 了？SmithDB 不是 Postgres 兼容的，Context Hub 走的是另一套版本管理，Gateway 是 base\_url 替换。一旦你的 agent 体系跑在这上面，迁移成本不低。

好的平台本来就有 lock-in。AWS 有，Vercel 有，GitHub 有。关键不是有没有 lock-in，而是 lock-in 换来的东西值不值。

取决于你的 agent 规模。一个 agent 做 demo，随便跑。一百个 agent 在跑，基础设施就不是可选项了。

![规模决策框架：1-10 个 agent 用框架即可（langchain/langgraph/自定义代码）；10-100 个需要平台能力（tracing/evals/sandboxes/gateway）；100+ 必须全平台（Engine auto-fix/SmithDB/Fleet management）](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-16-langchain-interrupt-2026-overview-img-04-framework-scale-decision-chart.jpg)

你用的是平台还是框架，不取决于你的技术偏好，取决于你的 agent 数量。

## 原文参考

> Jacob Talbot. **Everything we shipped at Interrupt**. LangChain Blog.
> Ben Tannyhill. **Introducing LangSmith Engine**. LangChain Blog.
> Harrison Chase. **Introducing LangChain Labs**. LangChain Blog.
> Ankush Gola. **We built SmithDB, the data layer for agent observability**. LangChain Blog.
> <https://www.langchain.com/blog/interrupt-2026-overview>

*你团队现在有几个 agent 在生产环境跑？撞上过 debug wall 吗？*
