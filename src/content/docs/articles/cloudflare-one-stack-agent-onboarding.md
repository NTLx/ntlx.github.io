---
$schema: starlight
title: 给 Agent 写入职手册
description: SASE 迁移通常要 18 个月。Cloudflare 把内部剧本封装成 agent skills 开源——安全迁移从咨询项目变成两个 markdown 文件，竞争壁垒正从 API 质量转向谁给 agent 写的入职手册更清楚
date: 2026-06-18
category: ai-industry
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-18-cloudflare-one-stack-agent-onboarding-img-00-infographic-core-summary.png)

SASE 迁移，行业均值 18 个月，成本数百万美元。卡点不在 API，不在产品功能——在那些没人敢动的遗留规则背后，为什么这条路由这样写、那组认证假设了什么、动它哪里会炸。这些上下文只活在资深工程师脑子里，拷不出来。

直到有人决定把这套知识灌给 AI Agent。

## 网络安全终于有了"入职手册"

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-18-cloudflare-one-stack-agent-onboarding-img-01-agent-context-gap.png)

读 Cloudflare 昨天那篇 One Stack 发布文，最让我停住的不是产品功能清单，而是它描述的那个 gap：Agent 能写代码，能分类安全告警，能跑自动化工作流——但面对客户的实际网络拓扑和遗留厂商配置，两眼一黑。

我见过这种事。一个朋友的 Zscaler 迁移项目拖了大半年，不是 API 不通或产品不行，是没人能说清现有三百条安全策略里哪些承载着业务假设、哪些纯粹是历史堆积。Agent 缺的不是能力——是上下文。

Cloudflare 管这叫 "agent gap"。判断准确：瓶颈不在 agent 能做什么，在它知道怎么做。知识问题，不是能力问题。

## 技能 vs 工具：值得注意的架构选择

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-18-cloudflare-one-stack-agent-onboarding-img-02-skills-mcp-dual-layer.png)

One Stack 的架构是两层：两个 skill 文件（结构化知识、决策树、工具定义）加一个 MCP server（API 操作接口）。Agent 先读 skill 理解"该怎么做"，再通过 MCP 实际调用。

这个分层有意思。行业主流做法是把 API 文档塞进 prompt 祈祷 agent 能悟出来。Skill 不是文档倾倒——它是操作手册："遇到 X 情况，先做 Y，再做 Z。"

Anthropic 自己也说过，构建 agent skill 就像写新员工 onboarding guide。MCP 给 agent 能力，Skills 给 agent 判断力。光有手可不够——你得知道客户的 200 个应用先迁哪个后迁哪个，那条遗留规则是业务关键还是历史包袱。

Cloudflare 的 skill 把数千次真实迁移踩过的坑编码成决策树，塞进 agent 上下文。这不是文档能给的。

## 从"帮你迁"到"自己迁"

Descaler 是 Cloudflare 2023 年推出的 Zscaler 迁移项目，Deskope 是 2024 年对应的 Netskope 版本。内部剧本一样：盘点现有配置、映射到 Cloudflare 原语、生成部署序列、通过 API 执行。两个项目已经把企业客户从遗留 SASE 搬到 Cloudflare One，时间从数月压到数小时。

One Stack 做的事：把这套内部剧本封装成公开的 agent skills，扔在 GitHub 上。

以前只有 Cloudflare 专业服务团队和认证合作伙伴掌握的知识，现在任何客户下载两个 markdown 文件就能用。这是迁移知识的民主化——就像 Stripe 把支付从专业服务变成开发者自助，只不过这次标的换成了安全迁移。

还有一层值得想：skill 天然强制知识压缩。你不能把一万页文档塞给 agent，必须提炼成决策树和判断流程图。最终产物可能比原始产品文档更清晰——因为 skill 的形式倒逼了知识的提纯。

## 当基础设施厂商给 agent 写说明书

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-18-cloudflare-one-stack-agent-onboarding-img-03-migration-democratization.png)

把 2026 年 Cloudflare 的动作摆在一起看：Mesh 给 agent 网络连通性，Managed OAuth 给 agent 身份认证，Claude Managed Agents 给 agent 隔离执行环境，One Stack 给 agent 操作知识。

拼出来的图景是：Agent 不再只是基础设施的用户——它正在变成基础设施的管理者。

这指向一个值得琢磨的问题：如果 agent 能完整操作你的 Zero Trust 环境，安全工程师干什么？

答案大概不是"被替代"，而是工作内容位移。从亲手写策略、亲自迁厂商，变成设计、监督和改进 agent 的操作方式。从手艺人到工厂主再到质量总监的路径——只不过这次的"工人"是算法。

竞争壁垒不再属于谁的 API 更好，而属于谁给 agent 写的"入职手册"更清楚。Cloudflare 似乎最先想通了这件事。

*你们公司如果还在用 Zscaler 或 Netskope，你会让 AI agent 来操刀迁移吗？最担心什么？*

## 原文参考

> Introducing the Cloudflare One stack: agent-powered deployment
> Cloudflare Blog, 2026-06-17
> <https://blog.cloudflare.com/cloudflare-one-stack/>
