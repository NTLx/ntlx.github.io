---
$schema: starlight
title: MCP 不是 USB-C，Pinterest 告诉你真正的门槛在哪
date: 2026-05-12
description: 66,000 次月调用、7,000 小时节省——Pinterest 的 MCP 实践揭示了一个被忽略的事实：协议本身不值钱，围绕协议建立的工程纪律才值钱。
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-12-mcp-ecosystem-pinterest-img-00.jpg)

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-12-mcp-ecosystem-pinterest-img-04.png)

MCP 被叫了一年多的"AI 的 USB-C 接口"。这个比喻挺准确——USB-C 解决的是物理接口统一问题，MCP 解决的是大模型和工具之间的通信协议统一问题。但你想想，USB-C 线便宜到几块钱一根，真正贵的是你插上去的那个设备。

Pinterest 最近发了篇博客，讲他们怎么把 MCP 从"听起来有意思"变成跑在生产环境里的东西。月调用 66,000 次，844 个活跃用户，每月省下大约 7,000 小时的人工。这些数字不算惊艳，但它们是真的——2025 年 1 月的快照，不是 PPT 上的预测值。

读完之后我最大的感受不是"MCP 好厉害"，而是"原来真正的成本在这里"。

## Function Calling 的天花板，MCP 的起点

先聊一个背景。2023 年 Function Calling 火的时候，大家觉得"大模型能调工具了"，问题解决了。但很快发现不对——每接一个工具，就要写一套适配逻辑。你有 N 个模型、M 个工具，理论上有 N×M 种对接方式。换个模型？重写。工具接口变了？重写。

MCP 的本质是把这 N×M 变成 N+M。工具端写一次 MCP Server，模型端写一次 MCP Client，中间用标准协议连起来。听起来很简单，就像所有"听起来很简单"的技术一样，魔鬼在细节里。

Pinterest 2024 年初试过用 Function Calling 方案搞 AI Agent。到年底，system prompt 膨胀到 8,000 多 token，响应质量断崖下跌。这不是个案——几乎所有认真搞 Agent 的团队都撞过这堵墙。Function Calling 是"让大模型会用单个工具"，MCP 是"让大模型接入整个工具箱自己组合"。区别不在于技术先进性，在于规模下的可维护性。

![Function Calling 的 N×M 连接 vs MCP 的 N+M 连接](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-12-mcp-ecosystem-pinterest-img-01.jpg)

## "多小服务器"不是技术决策，是组织决策

Pinterest 面临的第一个选择：搞一个大而全的 MCP Server，还是搞一堆小的？

他们选了后者——Presto 一个、Spark 一个、Airflow 一个，各管各的。表面上这是微服务架构的老生常谈，但仔细看原文，真正驱动这个决策的不是技术偏好，是组织现实。

每个 MCP Server 背后是一个团队。Presto 的工具让数据工程师直接在 IDE 里查数据，不用切到 Dashboard。Spark 的工具帮人诊断 Job 失败、总结日志、生成根因分析。Knowledge Server 让 Agent 能像调 API 一样调用公司内部文档。这些工具的价值不在于"MCP 能做"，在于"具体团队知道自己的痛点在哪"。

但这里有个早期反馈：创建一个新 MCP Server 太麻烦了——部署管道、服务配置、运维设置，还没写一行业务逻辑就被劝退了。Pinterest 的解法是搞统一部署管道：团队只定义工具逻辑，平台管部署和扩缩容。这一步看似不起眼，实际上是让 MCP 从"几个人的玩具"变成"全公司基础设施"的关键。

道理很简单：如果创建成本高，就只有先锋团队会用；创建成本低，才有机会长成生态。

## 安全不是附加题

这部分是整篇文章里最值得细看的。

MCP 的安全问题不是假设场景。安全研究人员的数据显示，43% 的被分析 MCP 服务器存在命令注入漏洞，部署 10 个 MCP 插件产生 92% 的被攻击概率。MCP 协议最初的身份验证是可选的，授权框架在协议广泛部署数月后才加入。这几乎是每个新协议的标准剧本——先推功能，再补安全。

Pinterest 没有等协议补安全，自己从第一天就把安全当联合项目来做。他们的方案是双层授权：

第一层是 JWT。用户登录内部系统时拿到一个 token，后面所有 MCP 调用都带着这个 token。Envoy（他们的服务网格代理）验证 token，映射出用户身份和组信息，执行粗粒度策略——比如"生产环境的 AI 聊天能访问 Presto MCP，但不能访问实验性 Server"。

第二层是 SPIFFE。这是 CNCF 的毕业项目，给服务（不是人）发身份证书。对于低风险的只读场景，服务之间直接用 SPIFFE 身份互认，不需要人类 JWT 参与。

更有意思的是业务组级别的访问控制。Presto MCP Server 能查敏感数据，所以不是所有员工都能用——JWT 里提取业务组信息，只有 Ads、Finance 这些被批准的组才能建立会话。这意味着"在一个热门入口开放一个强大的 MCP Server"不会悄悄扩大数据访问范围。

还有一个细节：某些 Server 在工具发现阶段就要求 JWT。也就是说，你连"这个 Server 有哪些工具"都不知道，除非先证明你是谁。这是全链路审计的基础。

![Pinterest 双层授权模型：JWT 用户身份 + SPIFFE 服务身份 + 业务组访问控制](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-12-mcp-ecosystem-pinterest-img-02.jpg)

对比 MCP 协议标准定义的 OAuth 流程——每个 Server 独立认证、独立授权、用户要看到 consent 对话框——Pinterest 的做法更简洁：用户已经登录了内部系统，MCP 调用复用这个会话，授权在后台透明处理。用户感知不到 MCP 的存在。好的基础设施就该这样——你用它，但你不知道它在。

## Human-in-the-loop 不是保守，是现实

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-12-mcp-ecosystem-pinterest-img-05.png)

Pinterest 的 Agent 指南里有一条硬规则：任何敏感或高成本操作，必须人类批准才能执行。Agent 提出操作，人类审核（可以批量），然后才跑。

这不是对 AI 不信任。想想看，MCP 让 Agent 能直接操作 Presto 查数据、改 Spark 配置、触发 Airflow 任务——这些操作的人工等价物可能是一个工程师花 10 分钟登系统、确认权限、执行命令。Agent 3 秒就能做完，但如果做错了，影响范围也大得多。

"elicitation" 机制很有意思：Agent 不只是说"我要执行这个操作"，而是要解释为什么要这么做、预期结果是什么，人类据此判断。这比简单的 yes/no 对话框多了一层——Agent 需要给出可审查的理由。

回头看那 7,000 小时的节省，不是"Agent 替人干活省的"，是"Agent 在人监督下干活省的"。这个区别重要。完全自动化省的时间更多，但出错的代价也更大。Pinterest 选了一个中间值：自动化提效，人工兜底。

## 度量才是北极星

Pinterest 从一开始就设计了可观测性，这一点很多人忽略。

所有 MCP Server 用同一套库函数，自带输入输出日志、调用计数、异常追踪。在生态层面，他们跟踪注册的 Server 数量、工具数量、总调用量。但最核心的指标是"每次调用节省多少分钟"——Server 维护者提供一个方向性估算，乘以调用次数，得到月度工时节省。

66,000 次调用 × 每次约 6.4 分钟 ≈ 7,000 小时。这个算法很粗糙，但它给了一个可感知的量级。没有这个数字，MCP 就是个"听起来不错"的技术倡议；有了这个数字，它是一个"每月省 7,000 小时"的生产力工具。

这是很多公司搞内部工具时忽略的：你度量什么，就得到什么。不度量，就只能靠感觉。

![MCP 可观测性管线：从调用日志到 7,000 小时的业务影响](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-12-mcp-ecosystem-pinterest-img-03.jpg)

***

Pinterest 这篇文章没有讲什么技术创新——MCP 是开源协议，Presto/Spark/Airflow 是成熟工具，JWT/SPIFFE 也是标准方案。每一件单独看都不难。

难的是把这些东西串成一个能跑在生产环境里的系统：安全、可度量、嵌入日常工作流。这两件事之间的距离，就是"听起来简单"和"真正能用"之间的距离。

这才是"AI 的 USB-C"真正的门槛。不是协议本身，是围绕协议建立的工程纪律。

*你在公司里搞过类似的事情吗？是先把工具做出来再补安全，还是像 Pinterest 一样从第一天就把安全当联合项目？*

## 原文参考

> Tan Wang. **Building an MCP Ecosystem at Pinterest**. Pinterest Engineering Blog.
> <https://medium.com/pinterest-engineering/building-an-mcp-ecosystem-at-pinterest-d881eb4c16f1>
