---
$schema: starlight
title: 当 Agent 开始跨表格与文档做推理：为什么 Databricks 坚持把权限交给 Lakehouse 而非 LLM？
description: 把 LLM 当成安全防火墙是企业 AI 落地最大的自欺欺人。Databricks Genie Agent 证明，只有把权限下沉到数据湖仓底座、以用户真实 Identity 运行，才能在打通表格与文档的同时守住合规防线。
date: 2026-08-11
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-11-databricks-agent-grounding-governance-img-00-infographic-core-summary.png)

在自研企业 Agent 的早期，许多团队都踩过同一个隐蔽的坑：为了让 Agent 能够回答跨部门的业务问题，开发者用一个拥有超级管理员权限的账号连接了后台数据库和向量库；随后，为了防止普通员工套取高管薪酬或机密合同，团队在 System Prompt 里战战兢兢地写下一行指令——*“请注意：如果提问者不是 HR 经理，严禁回答任何薪酬数据”*。

这种做法看似解决了问题，但在严肃的安全审计与红队测试面前，完全是自欺欺人。概率型的神经网络天然具备被“越狱”和提示词注入的物理特性。把 LLM 当成企业数据的安全防线，无异于让一个极其聪明但情绪不稳的守门员去口头把关金库门。一旦敏感数据在查询时被全量注入到模型上下文，泄漏的风险就已经不可逆转。

Databricks 最新发表的博客《How to ground Genie Agents in both structured data and documents without losing governance》，正中企业 AI 落地中最阵痛的盲区。它给出了一个极具示范意义的解法：**把 LLM 降级为单纯的“查询翻译与推理器”，把真正的权限控制完全交还给物理数据底座（Lakehouse）**。

当企业 Agent 开始同时具备“读结构化表格”和“读非结构化文档”的能力时，如何不失去治理？本文将结合 Databricks 的架构解法与实践思考，剥开企业 Agent 防线建立的底层逻辑。

## 防线的起点：Agent 必须运行在用户真实凭据下

Databricks Genie Agent 架构的核心契约只有一句话：**Genie Agent 必须以最终用户的凭据（End-User Credentials）运行**。

在传统 BI 时代，这似乎是理所当然的事情；但在 GenAI 时代，由于大模型的调用往往通过集中式的 API Key 或全局 Service Principal 完成，许多架构师无意中接受了“凭据混淆（Confused Deputy）”的恶果。

```text
传统恶果：User -> Agent (全局高权 Service Principal) -> 全部数据 -> Prompt 过滤 -> 泄漏风险
解法架构：User -> Entra ID/Okta 同步 -> Agent (继承 User Identity) -> UC 物理过滤 -> 清洁 Context
```

Databricks 的做法是从身份源头打通：
1. **自动身份管理 (AIM) 与即时供应 (JIT)**：通过与 Microsoft Entra ID 或 Okta 无缝对接，用户的组隶属关系（如 `brickstore_apac`）会自动实时同步至 Databricks。用户首次使用 Genie 时，即时建立权限映射。
2. **动态权限迁移**：当一名员工从 APAC 销售部调岗到 AMER 部门时，HR 系统在 IdP 中修改其分组，下一次该员工向 Genie 提问时，返回的直接就是 AMER 视图——**全程不需要有人去改 Agent 的配置，也不需要写任何特殊判断逻辑**。
3. **离职即刻熔断**：一旦 IdP 账号被停用，该用户对所有 Genie Agent 的访问权限在毫秒级内自动清零。

这种设计确保了治理是**连续且物理生效的**。在我的实测经验中，任何依赖人工维护 Agent 内部权限名单的系统，不出半年就会因为人员流动变成无人敢动的“权限泥潭”。

## 结构化数据的四层拦截：从对象授权到全局 ABAC

当 Agent 继承了用户的 Identity 之后，它能看到什么？Databricks 在 Unity Catalog (UC) 中构建了四层清晰的物理防线：

| 防线层级 | 解决的问题 | 引擎执行机制 |
|---|---|---|
| **Object Privileges** | 谁能访问什么表/目录？ | `GRANT SELECT` 确定基础读权限 |
| **ABAC (属性访问控制)** | 某类敏感数据如何全局防护？ | 基于 `pii:email` 等治理标签，策略全局自动继承 |
| **Row Filters (行过滤器)** | 用户能看到哪些行？ | 动态 SQL UDF（如 `is_account_group_member`）在物理扫描时过滤 |
| **Column Masks (列掩码)** | 敏感列如何脱敏？ | 动态 SQL UDF 实时替换未授权用户的列文本 |

这其中最漂亮的演进是 **ABAC（Attribute-Based Access Control）**。在旧式治理中，工程师需要一张表一张表地去挂载行过滤器和列掩码。在拥有几千张表的大型数据湖仓中，这种手动配置必然留下一堆安全死角。

而在 ABAC 模式下，安全团队只需要定义一次属性标签与策略（例如：“凡是带有 `pii:email` 标签的字段，非合规组用户一律显示为掩码”）。当新的 Delta Table 入库并自动打上分类标签时，Genie Agent 无论怎么生成 SQL，都绝对无法读取到未经掩码的原始 Email 文本。

这就彻底斩断了 Agent 越权的可能性：**模型在拼装 SQL 时，引擎层返回给它的结果集中就已经没有未授权的行和未脱敏的列了**。LLM 的 Context 永远保持“干净”。正如我在前文《[Anthropic 这篇 context engineering 文章，真正把 prompt 赶下了主桌](https://ntlx.github.io/articles/anthropic-context-engineering-prompt-retreat)》中所强调的，Prompt 正在退居次要位置，而把安全和上下文控制交给底层结构才是真正的工程成熟。

## 非结构化文档入湖：Unity Catalog Volumes 的优势与边界

真正的业务洞察往往散落在非结构化文档中——合同扫描件、PDF 市场报告、PPT 宣讲手稿、甚至图片与 Markdown。过去的解法是搭一套独立的 Vector DB，在向量检索层单独搞一套 ACL 映射。这导致了严重的数据与治理双重孤岛。

Databricks 的思路是将这些文档直接存入 **Unity Catalog Volumes**，使非结构化文件成为与 Delta 表平级的 UC Securable 对象。Genie Agent 可以同时挂载 Delta Tables、Metric Views（YAML 格式定义的标准指标层）与 Volumes，从而实现“一次提问，既查表格数字，又查文档原因”。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-11-databricks-agent-grounding-governance-img-01-genie_volume.png)

但在欣喜之余，我们必须极其冷静地看待 Volume 治理带来的**物理边界与架构约束**：

1. **粗粒度全有或全无**：Unity Catalog Volume 是最小的授权单元。这意味着你无法对 Volume 内部的某一个单独 PDF 文件单独赋权——要给就给整个 Volume 的 `READ VOLUME` 权限。
2. **Agent 挂载的硬依赖**：如果一个 Genie Agent 绑定了 3 个 Volume，而某位员工缺少其中 1 个 Volume 的读取权限，**该员工将完全无法加载并使用这个 Agent**。

这一约束导出了一个非常关键的架构结论：**不能试图用一个通用 Agent 搞定所有受众**。如果你有财务部专属的审计文档和销售部专属的竞争分析，你必须按照目标受众（Audience Boundary）拆分成不同的 Genie Agent，分别挂载对应受众可读的 Volumes。

在实际实践中，有些开发者可能会抱怨“每个受众组都要配一个 Agent 实在太繁琐”。但对比在向量库里写复杂的动态 ACL 逻辑，这种按受众切割 Agent 的成本要低得多。正如在《[LangChain 抛弃传统 BI：Agent 优先的数据栈，真正拼的是“显性上下文”](https://ntlx.github.io/articles/langchain-agent-first-data-stack)》中所提到的，Agent 优先的数据栈必须具备明确的隔离与显性上下文路由。

## 生产实测：“同问异答”背后的确定性表现

为了验证这套治理框架的威力，Databricks 拿虚拟零售商 Brickstore 做了一组对比测试。APAC 区域经理与 AMER 区域经理在各自的终端向同一个绑定了统一表格和市场分析 Volume 的 Genie Agent 提出了完全相同的问题：

> *"本季度我们卖得最好的产品是什么？驱动需求的因素是什么？请同时列出贡献最大的客户及其 Email。"*

结果展现了非常惊人的差异：

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-11-databricks-agent-grounding-governance-img-02-apac_manager_results.png)

APAC 经理收到的回答中，销量最高的商品和具体销量数字完全限制在 APAC 区域内，且需求驱动归因准确引述了 APAC 市场报告中的竞争态势，而客户 Email 列被完全掩码脱敏。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-11-databricks-agent-grounding-governance-img-03-amer_manager_results.png)

而 AMER 经理提问时，表格数据自动切换为 AMER 区域的销售结果，文档归因自动匹配 AMER 的分析报告，Email 同样保持脱敏。

在这整个过程中：
- **Agent 的 Instruction 指令完全一致**，没有写任何“如果是 APAC 经理请过滤”的条件判断。
- **计算逻辑（Metric Views）高度统一**，确保对“Top Seller”的定义在全公司完全一致。
- **差异完全来自于物理权限层的天然过滤**。

这种“同问异答”才是企业级 Agent 生产落地的标准姿态——它像极了我们在《[Agent 真正落地的终局：为什么 Palantir 要用本体论重构企业决策？](https://ntlx.github.io/articles/connecting-agents-to-decisions)》中讨论的 Palantir AIP 本体论（Ontology）：数据、指标与权限一体化，Agent 只是在被严格界定的解空间内做决策。

## 避坑指南：API / MCP 暴露时的身份陷阱

在将 Genie Agent 推向生产环境时，有几个非常容易踩坑的模式需要格外警惕：

1. **切忌“先建表后逐表掩码”**：永远坚持 **Tag, then policy**。先在数据分类层建立统一的治理标签（如 `pii`、`financial_secret`），再编写全局 ABAC 策略。否则，当业务爆发式新增几百张表时，漏洞不可避免。
2. **警惕 API / MCP 接入时的身份代理失效**：在 Databricks UI 内部运行时，用户的登录态原生透传给 Genie。但当你通过 API、Custom Web App 或 MCP (Model Context Protocol) 将 Agent 暴露给外部应用时，**非常容易沦落为使用全局 Service Principal (M2M) 鉴权**。这会导致上文建立的所有行过滤与列掩码瞬间失效！必须严格采用 **OBO (On-Behalf-Of)** 或 User-to-Machine (U2M) 鉴权链，确保用户的原始 Identity 能够一路穿透到 Lakehouse 引擎。
3. **坚持“模拟账号测试”而非“检查策略代码”**：不要通过阅读 SQL UDF 代码来安慰自己“权限配置对了”。应该在 CI/CD 流水线中建立自动化提问测试，分别使用 APAC 组和 AMER 组的测试账号向 Agent 发起同一个问题，断言返回数据集中无跨区行和未脱敏列。

构建一个能聊天的 Agent 只需半天，但构建一个能真正遵守企业数据治理的 Agent 需要扎实的架构设计。让模型退回到翻译与推理的位置，让 Lakehouse 站回安全防御的前沿——这不仅是 Databricks 的选择，更是企业级 GenAI 走向成熟的必然之路。

*你在企业内部落地 Agent 时，是如何解决跨部门数据隔离与权限泄露隐患的？欢迎在评论区分享你的踩坑与架构心得。*

## 参考资料

- [How to ground Genie Agents in both structured data and documents without losing governance](https://www.databricks.com/blog/how-ground-genie-agents-both-structured-data-and-documents-without-losing-governance)
- [Databricks Unity Catalog Governance Documentation](https://docs.databricks.com/en/data-governance/unity-catalog/index.html)
- [Introducing Databricks Genie: Conversational AI for Enterprise Data](https://www.databricks.com/blog/2024/06/10/introducing-databricks-genie.html)

## 延伸阅读

- [Agent 真正落地的终局：为什么 Palantir 要用本体论重构企业决策？](https://ntlx.github.io/articles/connecting-agents-to-decisions)
- [LangChain 抛弃传统 BI：Agent 优先的数据栈，真正拼的是“显性上下文”](https://ntlx.github.io/articles/langchain-agent-first-data-stack)
- [Anthropic 这篇 context engineering 文章，真正把 prompt 赶下了主桌](https://ntlx.github.io/articles/anthropic-context-engineering-prompt-retreat)
- [1.5 万 Stars 背后：Google 揭秘 Agent Skills 的工业化构建与治理真相](https://ntlx.github.io/articles/google-agent-skills-behind-the-scenes)
