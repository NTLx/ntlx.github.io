---
$schema: starlight
title: 对话式数据产品，先从业务口径开始
description: S&P Global Energy 的方案把 Genie Agent 按数据集分组，再用 MCP 暴露组合入口。业务专家维护的指标口径，决定了这个入口能否给出可核对的答案。
date: 2026-09-29
category: ai-agents
tags: ["AI Agents", "Databricks", "MCP", "数据治理", "Agent Evaluation"]
primarySourceUrls: ["https://www.databricks.com/blog/data-dialogue-how-sp-global-energy-made-its-structured-data-estate-conversational-databricks"]
---

文中拿一个 LNG 问题说明跨域查询：Sabine Pass 最近的停运，会怎样影响运往亚洲的货物溢价？答案要用到停运记录和货物数据。“最近”取什么时间范围，“溢价”按什么口径计算，也得先有人说清楚。

S&P Global Energy 的文章介绍了一套让外部 AI 助手访问结构化数据的方案：SME 按数据集组整理 Genie Agent，Databricks 将 Agent 暴露为 MCP server，再用 FastMCP 把多个窄域 Agent 组合成商品入口。我最先记住的是角色变化：熟悉数据的人开始维护可供别人调用的查询入口。

![对话式数据入口的四层分工：业务专家、Genie Agent、MCP 与 FastMCP、外部 AI 助手，以及权限和答案验收](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-28-sp-global-energy-conversational-data-img-00-infographic-core-summary.png)

## 业务专家开始维护可查询的含义

SME 会为表和列补说明，加入例子查询、可信指标和业务定义，再按数据集组配置 Genie Agent。LNG 的停运、货物、合同、价格等内容各有独立 Agent。Databricks 当前文档把一个 Genie Agent 的上下文范围限定为最多 25 张 Unity Catalog 表。

分组划出查询范围，Agent 如何解释数据还得靠业务定义。原文举的 floating storage 就要求写明条件：船上的货物停留至少三天，船速还要低于某个门槛。模型可以生成 SQL，字段名却不会告诉它交易团队认可的口径。涉及价格、合约和供需判断时，定义本身就是产品的一部分。

我最看重文中的“SME 成为发布者”。业务专家不只给模型补 prompt，也要维护一组别人能调用、团队能核对的业务含义。我之前在[《Genie Ontology 读后感》](https://ntlx.github.io/articles/genie-ontology-data-stack)讨论过语义、上下文和评估怎样进入数据栈；S&P Global 的案例让我再追问一步：这些定义由谁写，又由谁跟着业务变化更新？

## MCP 让工具更容易组合，口径仍要逐域维护

我把这三层分开看：Genie Agent 面向一组数据提供查询能力，MCP 让客户端按统一约定连接工具，FastMCP proxy 则把多个 server 组合到带命名空间的入口里。调用方因此不必逐个配置每个数据组。

接口统一后，业务口径仍要分域维护。模型还得选对工具，再把返回结果放在一起解释。原文的停运与货物溢价问题正好说明这一点：让两个数据组能被同一个入口调用，不会自动说明“影响”该怎样计算。MCP 规范定义应用怎样连接工具，FastMCP 提供代理挂载和命名空间；团队仍需决定不同数据域里的同名指标能否直接比较。

## 权限沿用得上，外部访问链还得讲清楚

原文架构图把外部客户端与 S&P Global Energy 网络分开，MCP/HTTPS 调用经 MCP proxy endpoint 穿过信任边界；Genie、Databricks 和凭证服务留在边界内。Databricks 文档确认 Genie MCP server 会在每个请求上执行 Unity Catalog 权限，而且它是只读的。访问控制由数据平台执行，不能靠模型遵守 prompt。

![原文参考架构：外部客户端通过 MCP proxy 访问内部 Genie 与 Databricks，身份和数据权限在信任边界内管理](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-28-sp-global-energy-conversational-data-img-source-sp-global-reference-architecture.png)

MCP 规范要求实现方做好用户授权、数据保护和工具安全，也说明这些原则不能只靠协议本身落实。Genie MCP 文档还写明，调用不会把对话历史传给 Genie API；会话记忆和跨工具协调要由外层 Agent 或客户端承担。对外部客户开放时，还要把提问者身份映射到数据权限。原文画出了边界位置，却没有展开这段身份与授权链的细节。

外部数据接入也有条件。Lakehouse Federation 通过 foreign connection 和 catalog 查询受支持的数据源，团队仍需配置连接、登记目录、授予权限。它能减少查询前复制数据的需要，网络和性能条件还得持续维护。

## 上线速度之外，还要看答案如何被持续验收

Genie Agent Benchmarks 可以把常见问法和预期结果放进回归测试。Chat mode 对照 SQL answer 及结果集，Agent mode 由 LLM judge 评分；没有 SQL answer 的问题仍要人工检查。

要判断它能否成为稳定产品，我还会测跨域路由是否选对工具、不同指标定义是否冲突、综合答案能否对照业务预期，以及用户纠正能不能进入下一轮评估。原文把旧流程描述为 months，新数据域可在 days 上线；但没有给出周期口径、对照条件或答案质量数据。我会把这读作团队对收益方向的描述，无法据此算出提速幅度。

如果要试这套做法，我会先选一个边界清楚的数据集组：让 SME 写明关键指标和可信查询例子，接好用户身份与表权限，再用常见问法和已知结果跑回归。跨域问题另测路由和综合结果。这样团队能看到答案错在哪一环，也能安排由谁修正。

## 参考资料

- [Databricks 原文：From Data to Dialogue](https://www.databricks.com/blog/data-dialogue-how-sp-global-energy-made-its-structured-data-estate-conversational-databricks)
- [Genie Agent MCP server 文档](https://docs.databricks.com/aws/en/agents/mcp-tools/genie-agent)
- [Lakehouse Federation 联邦查询文档](https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-federated-queries)
- [Genie Agent 测试与监控文档](https://docs.databricks.com/gcp/en/genie-agents/monitor)
- [Model Context Protocol 规范](https://modelcontextprotocol.io/specification/2026-07-28)
- [FastMCP：Composing Servers](https://github.com/PrefectHQ/fastmcp/blob/main/docs/servers/composition.mdx)
