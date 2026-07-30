---
$schema: starlight
title: 治理大模型幻觉，为什么 Palantir 劝你放弃“把模型训得更聪明”？
description: 治理 AI 幻觉的本质，不是试图消除模型自身的随机性，而是用 Ontology 本体构建“数据-逻辑-动作”三层确定性工程屏障。
date: 2026-07-30
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-30-palantir-aip-ontology-hallucinations-img-00-infographic-core-summary.png)

许多团队在推动大模型（LLM）进入真实企业业务时，往往会陷入同一种执念：只要大模型参数再大翻一倍、提示词（Prompt）写得更精细，或者把几万字的规章制度全塞进超长上下文里，AI 的“幻觉”就会自然消失。

然而，Palantir 在其 Responsible AI 工程博客系列的第一篇文章 *Reducing Hallucinations with the Ontology in Palantir AIP* 中，给出了一个相当冷峻且直击要害的结论：**试图靠“把模型训得更聪明”来消除幻觉，方向从一开始就错了。**

幻觉不是模型训练未完成的暂态缺陷，而是“下一个 Token 预测”（Next Token Prediction）这一统计计算范式内生的物理属性。模型的目标是在概率上产出“看起来极其合理”的文本，而不是在逻辑上保证“绝对真实与精准”。

在上一篇分析《[Agent 真正落地的终局：为什么 Palantir 要用本体论重构企业决策？](https://ntlx.github.io/articles/connecting-agents-to-decisions)》中，我们探讨过本体论对企业架构的重构。而读完 Palantir 的这篇工程实践，更让人确认了一个工程铁律：**治理幻觉的核心，不是强求模型消灭随机性，而是用确定性的工程屏障框住它的活动边界。**

## 错配的期望：为什么“下一个 Token 预测”注定会产生幻觉？

要解开幻觉的死结，首先得承认大型语言模型的本质机理。

LLM 被设计和训练用来做且只做一件事：根据已有的上文，预测统计概率上最可能出现的下一个 Token。正是这种强大的概率联想与生成能力，让模型能够写出流畅优雅的文案、跨语言翻译、甚至模仿某种特定的语气。

但也正是这种“概率预测”，决定了模型存在两大物理短板：

1. **没有真实世界事实的内存图谱**：当模型遇到不知道的私有数据或冷门知识时，为了维持“文本流畅度”，它会基于概率填补空白，凭空创造出看似合理的假数据、假文献或虚构城市。
2. **缺乏确定性计算与几何推演的能力**：算术、空间坐标计算、逻辑推理，在数学上属于确定性状态转移。让一个靠统计概率预测单词的模型去做坐标距离计算，就如同要求一个诗人实时心算八位数乘除法——它只能输出一个“看起来像答案”的数字。

将下一个 Token 预测强行用于需要精确数值和合规决策的业务，本质上是一种严重的**工具错配**。正如我们在《[30秒出报告，但关键不是快——是知道什么时候不用AI](https://ntlx.github.io/articles/machinacheck)》中所强调的，明确 AI 的能力边界，远比盲目信任 AI 的输出更为重要。

Palantir AIP 给出的解法，是在 LLM 与基础设施之间建立一个被称为 **Ontology（本体）** 的强类型语义层，通过**数据锚定、逻辑解耦、动作沙盒**三重屏障，彻底重塑 AI 调用的工程界面。

## 数据锚定：用 Ontology 代替模型的“凭空猜测”

在传统 RAG（检索增强生成）架构中，企业通常会将非结构化文档切块存入向量数据库，大模型根据相似度检索出若干文本片段后自行阅读总结。然而，文本切块缺乏强类型约束，容易遭遇语义偏差、上下文丢失或数据更新滞后。

Palantir AIP 引入了 **Ontology-Augmented Generation (OAG)**。Ontology 不是泛泛的文档库，而是企业真实秩序的数字孪生——它把仓库、车辆、工单、零部件等一切实体，抽象为带强类型属性与关系图谱的“对象（Objects）”。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-30-palantir-aip-ontology-hallucinations-img-01-data_grounding_ontology_query.png)

当用户在 AIP 中询问“Titan Industries 旗下配送中心的分布城市”时，AIP 并不依赖 LLM 的记忆去背诵，也不在文档堆里做文本相似度匹配，而是给 LLM 绑定了一个 **Query Ontology Tool（本体查询工具）**：

1. LLM 接收自然语言意图，将其翻译为对 Ontology 中特定对象属性的结构化 Query；
2. 系统在经过严格权限管控的 Ontology 语义层中运行该查询，抓取出 100% 真实的权威数据；
3. 将精准的数据集合返回给 LLM，由 LLM 整理为自然语言回答。

在这个过程中，LLM 从“存储事实的大脑”退回到“翻译意图的调度员”。事实数据始终锚定在确定性的 Ontology 中，从根源上拦截了事实盲猜型幻觉。

## 逻辑解耦：为什么数学与计算严禁交给 LLM “脑算”？

数据真实只是第一步，更复杂的挑战在于逻辑与计算。

在 Palantir 举出的第二个案例中，一辆路途受困的卡车需要寻找距离其坐标最近的配送中心。如果把卡车坐标与多个仓库坐标直接扔给 LLM，让它“算一算哪家最近”，模型给出了 Albany, NY 的错误答案——因为在统计概率里，Albany 与卡车所在州的词频关联度极高，模型盲目选择了最顺嘴的 Token。

真正的最近配送中心其实是 Providence, RI。解决这种“逻辑/计算幻觉”的唯一正确做法，是**将计算彻底剥离给专用逻辑工具**。

<!-- `LLM Intent -> Custom Function (Haversine Formula) -> Exact Result -> LLM Answer` -->

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-30-palantir-aip-ontology-hallucinations-img-02-logic_grounding_custom_functions.png)

在 Palantir AIP 中，开发人员在 Ontology 内注册了一个自定义的地理空间计算函数（Custom Function），使用严格的 Haversine 距离公式进行坐标推演。当 LLM 识别出用户意图需要进行距离推算时，它不会自己去算，而是构造一个工具调用请求（Tool Call），将两点坐标作为参数传递给该函数。

确定性的算法完成精确计算后，将 Providence, RI 的结果反馈给 LLM。这种**意图理解归 AI、算术推演归规则**的解耦架构，彻底消除了计算与逻辑层面的幻觉。

## 动作沙盒：从“生成建议”到“人机协同审批”的闭环

即便有了数据锚定与逻辑工具，在极其复杂的供应链突发状况或售后工单处理中，生成式 AI 的输出依然存在边缘残余风险（例如用户提供的原始工单信息存在歧义）。

如果直接将 AI 生成的调拨或替代建议自动写回生产 ERP 或仓储数据库，任何微小的偏差都可能造成重大经济损失。正如我们在《[上下文塌陷：为什么模型升到 GPT-5.6 也封不住 Copilot 的安全漏洞？](https://ntlx.github.io/articles/context-collapse-copilot-xpia)》中警告过的，给生成式 AI 开放无监督的写回权限是极其危险的。

 Palantir 的 Ontology 不仅包含数据（Data）和逻辑（Logic），更包含了受控的业务动作（Action）。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-30-palantir-aip-ontology-hallucinations-img-03-action_governance_human_approval.png)

在 AIP 的库存管理应用中，当系统根据支持工单自动运行 AIP Logic 生成跨仓库调拨方案时，该方案并不会直接触发真实写回，而是会推送到一个**提案队列（Proposal Queue）**：

- **完全可追溯**：领域专家（Domain Expert）可以在界面中清晰查看 AI 调用的每一步数据来源、文档依据与调拨模型逻辑；
- **显式人工确认**：业务专家在确认方案合理无误后，点击 Approve（批准）或 Reject（拒绝）；只有在获得显式授权后，Ontology Action 才会正式写回底层业务系统。

这种 **Human-AI Teaming（人机协同）** 模式，在生成式 AI 与企业核心生产系统之间加装了一道坚固的保险闸，既释放了 AI 协助分析的效率，又将潜在的幻觉风险封印在沙盒之内。

## 结语：在不确定的生成与确定的现实秩序之间建立接缝

回顾 Palantir AIP 的防幻觉架构，它的核心智慧在于**放弃了对大模型无所不能的幻觉**。

好的工程架构，从不把希望寄托在组件的完美上，而是通过合理的系统解耦与容错设计，在不完美的组件上搭建出绝对可靠的系统：

- 让 LLM 做它最擅长的事：自然语言理解、意图提取、结构化总结；
- 让 Ontology 做它最擅长的事：强类型数据锚定、确切算法执行、受控动作审批。

在工业与企业级 AI 迈向深水区的今天，关于幻觉的争论正发生深刻的转向。正如我们在《[当工业 AI 遇到统一命名空间：为什么只有数据连通，救不了现代化工厂？](https://ntlx.github.io/articles/palantir-aip-unified-namespace-industrial-ai)》中所总结的，企业需要的不是一个满腹经纶却偶尔胡言乱语的“AI 哲学家”，而是一套在现实业务秩序中严丝合缝、安全可控的工程防御体系。

消灭幻觉靠的不是选一个更强大的模型，而是给模型配一个严格守界工程屏障。

---

*如果你在企业 AI 落地中也遇到过类似的“幻觉卡壳”问题，你认为决定落地成败的是模型本身的能力，还是后端的工程约束？欢迎在评论区分享你的看法。*

## 参考资料

- [Reducing Hallucinations with the Ontology in Palantir AIP](https://blog.palantir.com/reducing-hallucinations-with-the-ontology-in-palantir-aip-288552477383)
- [Building with Palantir AIP: Logic Tools for RAG/OAG](https://www.palantir.com/blog/building-with-palantir-aip-logic-tools-for-rag-oag/)
- [Palantir AIP Official Platform](https://www.palantir.com/platforms/aip/)
- [Ontology-Augmented Generation (OAG) Overview](https://towardsai.net/p/machine-learning/ontology-augmented-generation-oag-bringing-order-to-enterprise-ai)

## 延伸阅读

- [Agent 真正落地的终局：为什么 Palantir 要用本体论重构企业决策？](https://ntlx.github.io/articles/connecting-agents-to-decisions)
- [当工业 AI 遇到统一命名空间：为什么只有数据连通，救不了现代化工厂？](https://ntlx.github.io/articles/palantir-aip-unified-namespace-industrial-ai)
- [上下文塌陷：为什么模型升到 GPT-5.6 也封不住 Copilot 的安全漏洞？](https://ntlx.github.io/articles/context-collapse-copilot-xpia)
- [30秒出报告，但关键不是快——是知道什么时候不用AI](https://ntlx.github.io/articles/machinacheck)
