---
$schema: starlight
title: 企业 AI 真正稀缺的，是可追责的业务语义
description: 要让 Agent 进入财务等高责任流程，光找到数字不够：还得知道它按什么定义、来自哪里、谁有权使用，以及谁对后续动作负责。模型越能行动，组织越需要把这些规则写进运行时。
date: 2026-10-17
category: ai-agents
tags: ["企业AI", "AI Agents", "Ontology", "数据治理", "Databricks", "Genie One"]
primarySourceUrls: ["https://www.databricks.com/blog/capital-markets-buy-side-runs-nav-finance-protects-fee"]
---

Databricks 于 2026 年 10 月 2 日发布了一篇面向资管买方财务团队的文章，讲 NAV、估值、赎回和费用。它是一篇产品文章，但有个区分让我停下来想了想：找到正确的数字，只能说明答案“准确”；财务要据此行动，还得知道这个数字在当前业务里是什么意思。

这一步比“让 Agent 接更多数据”费劲得多。

一个 NAV 数字背后连着定价来源、估值规则、份额类别、费用条款和时间点。数字可能算对了，但口径或权威来源一变，结论就可能不同；某个用户无权查看部分数据，或异常需要交给估值委员会判断时，这个数字也不能直接拿来行动。

我读完后记住的不是 Genie One 这个产品，而是一个更底层的判断：**Agent 的自治边界，不能高于组织对业务语义和责任边界的显式化程度。**

![从数字到行动的可追责语义桥梁](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-17-business-ontology-agent-trust-img-00-infographic-core-summary.png)

## 数字对了，为什么还不能行动

传统数据系统容易让人误以为：数据进了表、字段有了名字，含义也就确定了。

实际业务没这么整齐。“收入”可能有财务、销售和管理口径；客户还要看区域、主体和合同关系；资产价格也会受估值方法和时点影响。员工平时靠会议、制度和经验补上缺失的解释，有时一句“这里按老口径算”就够了。

Agent 不会自动理解这些默契。

RAG 能找回相关文档，Prompt 能说明这次该怎么回答，数据库能约束字段类型。但光靠它们，仍然回答不了更棘手的问题：冲突时该信谁？一个定义什么时候失效？不同部门看到的数字是不是同一口径？结果满足什么条件后才能触发下一步？

因此，企业要判断一个答案能不能用于业务，不能只看数值；还得连同它的定义、来源、权限和责任人一起看。

## Agent 放大的首先是组织里的歧义

这也是 Agent 和普通 BI 最大的差别之一。

BI 报表的口径有问题，人还有机会停下来问一句。Agent 跨系统取数、调用工具，再把结果接进后续操作后，原本靠人兜底的模糊地带也会沿着执行链传下去。模型跑得越快，错误解释就可能走得越远。

我之前在[《当 Agent 开始跨表格与文档做推理：为什么 Databricks 坚持把权限交给 Lakehouse 而非 LLM？》](https://ntlx.github.io/articles/databricks-agent-grounding-governance)里关注的是另一半问题：权限不该靠 Prompt 约束，而要在身份和数据层真实生效。那篇文章解决的是“Agent 能看到什么”。

权限回答的是 Agent 能不能看到；业务语义回答的则是这些数据该怎么解释。

两者缺一，高自治 Agent 就很难进入财务、采购、质量、合规这类要承担后果的流程。

## Ontology 值得关注的，是它把语义变成运行时

Databricks 把 Genie Ontology 定义为统一的业务上下文层，官方文档目前仍标为 Public Preview。它把人工治理的语义和从现有数据资产中推断出的上下文放在一起，供 Genie 系列产品使用。

我更关注的是这些语义能不能参与实际回答。Databricks 文档写到，Genie 会检索和排序相关上下文、处理冲突，并且只使用当前用户有权限查看的内容。定义、来源和权限因此会影响答案如何形成，不只是留在说明文档里。

如果系统能说清“这个指标怎么定义”“这类问题优先相信哪个来源”“这条规则适用于什么对象”“当前用户能看到什么”，Agent 就有机会在行动前受这些规则约束，而不是事后再由人解释它为什么这么做。

这和我之前读 Palantir 时的感受很接近。在[《Agent 真正落地的终局：为什么 Palantir 要用本体论重构企业决策？》](https://ntlx.github.io/articles/connecting-agents-to-decisions)里，我关注的是把数据、逻辑、动作和安全放进同一个业务对象世界。Databricks 这篇 NAV 文章让我更明确：Ontology 不只是帮模型理解业务，也在回答**什么解释有资格进入决策链**。

## 高自治 Agent 的上限，是可追责的业务语义

因此，企业 Agent 的控制面还得处理模型路由、工具权限和审批之外的事。

先问指标按什么口径定义，再看来源能不能追溯、当前身份有权看到和使用什么。最后要划清动作边界：哪些可以自动执行，哪些情况得交还给人。Databricks 原文保留了人工最终判断，后台 Agent 可以先准备 preliminary NAV，再交估值团队复核。

我把这几件事合称为“可追责的业务语义”。

目标不是让 Agent 背下更多企业知识，而是让结果进入业务动作之前，组织能说明它为什么成立、依据是什么、谁授权了这一步；出了问题，也知道该回到哪一层查。

模型能力变强不会自动补上这部分。Agent 能连续完成的步骤越多，组织越需要提前写清这些边界。

## 但别把 Ontology 变成新的“先建平台”

但“语义重要”不等于要先花一年建一套全公司统一 Ontology。

我不赞成这种顺序。

如果任务只有一个稳定数据源，schema 清楚、风险低、动作有限，数据库约束、指标定义、简单 policy 和 workflow 可能就够用。为了一个报表 Agent 先建宏大的企业本体，很可能把小项目拖成数据治理工程。

更实际的做法，是从高价值流程里暴露出来的歧义开始。碰到“同一个指标有多种解释”“多个来源互相冲突”“权限因人而异”或“动作会产生不可逆副作用”，就把相关定义、权威来源、权限和审批边界写清楚。等 Agent 承担更多责任，再扩大这层语义控制面。

![按流程风险和业务歧义选择语义控制](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-17-business-ontology-agent-trust-img-01-comparison-control-levels.png)

读完 Databricks 这篇文章，我不会先问要不要上 Genie One。我会先挑一个大家每天都在用、却总要找老员工解释的数字，查清四件事：它怎么定义，哪个来源算数，谁有权使用，什么情况下可以据此行动。

如果答案仍然只是“大家都知道”，就先把定义、来源和责任补清楚，再谈让 Agent 接手。

## 参考资料

- [Databricks：In Capital Markets, the Buy Side Runs on NAV. Finance Protects the Fee.](https://www.databricks.com/blog/capital-markets-buy-side-runs-nav-finance-protects-fee)
- [Databricks：Genie Ontology](https://docs.databricks.com/aws/en/genie/genie-ontology)
- [Databricks：AI/BI and Genie One release notes 2026](https://docs.databricks.com/aws/en/ai-bi/release-notes/2026)
- [BCG：Rebuilding Asset Management for an AI-First World](https://www.bcg.com/publications/2026/rebuilding-asset-management-for-an-ai-first-world)
- [《当 Agent 开始跨表格与文档做推理：为什么 Databricks 坚持把权限交给 Lakehouse 而非 LLM？》](https://ntlx.github.io/articles/databricks-agent-grounding-governance)
- [《Agent 真正落地的终局：为什么 Palantir 要用本体论重构企业决策？》](https://ntlx.github.io/articles/connecting-agents-to-decisions)
