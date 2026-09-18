---
$schema: starlight
title: Luna 抓住了大多数 bug，但代码审查真正贵在漏掉哪一种
description: Luna 用 3.6% 的成本抓到 Astra 约 75% 的已验证缺陷，但安全类差距、误报和重复运行波动说明：代码审查该按变更风险路由，而不是按模型单价下注。
date: 2026-09-18
category: ai-coding
primarySourceUrls: ["https://intelligentartifact.com/posts/gpt-5-6-luna-vs-gpt-6-astra-code-review/"]
---

我看到这篇对比时，第一眼被两张账单抓住了：50 个 pull request，GPT-5.6 Luna 花了 **$0.20**，GPT-6 Astra 花了 **$5.66**。前者找到了后者约 **75%** 的已验证 bug，却只用了 **3.6%** 的成本。这样的标题很容易把问题收束成一句话：既然便宜模型已经够到大多数结果，为什么还要付旗舰模型的钱？

但读完 [Intelligent Artifact 的整理](https://intelligentartifact.com/posts/gpt-5-6-luna-vs-gpt-6-astra-code-review/)，再回到 [Entelligence 的完整对比存档](https://web.archive.org/web/20260914195804id_/https://entelligence.ai/blogs/gpt-5.6-luna-vs-gpt-6-astra-is-a-1.20-model-good-enough-for-code-review)，我留下的不是“Luna 赢了性价比”，而是一个更不舒服的判断：**代码审查最贵的部分，往往不是模型单价，而是你不知道它漏掉的 bug 恰好属于哪一类。**

![代码审查从变更风险到模型分流与验证闸门的机制摘要](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-18-gpt-5-6-luna-vs-gpt-6-astra-code-review-img-00-infographic-core-summary.png)

## $0.20 这张账，先别急着当答案

这项实验的设计并不复杂，却比一句“某模型更强”多了一层可用性。研究者拿了来自 Cal.com、Sentry、Discourse、Keycloak 和 Grafana 的 50 个公开 PR；每个 PR 都有被故意植入的缺陷。两个模型看同一份 diff、收到同一个提示词，提示词要求它们寻找正确性、安全、并发、资源和错误处理问题，并排除风格、命名、文档等建议。

这里的关键词是 verified。一个模型说“这里可能有问题”不算发现；finding 要经过两名 judge 分别判断，只有两者都认为它是实际 bug，才进入统计。于是这不是把模型输出条数直接当成绩，而是先承认模型会说错话。

| 指标 | GPT-5.6 Luna | GPT-6 Astra |
| --- | ---: | ---: |
| 已验证 bug | 69 个 | 92 个 |
| 提出 finding | 93 个 | 96 个 |
| 通过验证的比例 | 74% | 96% |
| 50 个 PR 的总成本 | $0.20 | $5.66 |
| 单次 review 平均耗时 | 23 秒 | 36 秒 |

![原始对比中的总成本与已验证 bug 数量](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-18-gpt-5-6-luna-vs-gpt-6-astra-code-review-img-source-cost-vs-bugs.png)

Luna 的优势是真实的：它便宜、快，而且不是只能做玩具任务。官方 API 价格也解释了为什么会出现这种悬殊账单——Luna 的输入/输出标价是每百万 token **$0.20/$1.20**，Astra 是 **$10/$50**。不过，单价只能解释“为什么便宜”，不能回答“便宜之后谁来处理错误”。

这也是我不愿意把这组结果读成“旗舰模型被淘汰”的原因。它测到的是一次 review 的模型开销，不是从 finding 到合并之间的完整成本。错误评论需要人筛掉，需要后续模型重新判断，需要工程师确认它是不是噪声；漏掉一个权限 bug，则可能把账单从几美元推到完全不同的量级。

## 平均数遮住了安全代码里的断崖

总体数字很漂亮，按风险类型拆开以后，故事立刻变窄了。

Keycloak 是这组实验里最刺眼的例子：Luna 找到 6 个已验证 bug，Astra 找到 14 个；Luna 在这个代码库里的 finding 只有 **50%** 通过验证，Astra 是 **93%**。按缺陷类别看，安全类一共 24 个已验证 bug，Luna 找到 **9/24**，Astra 找到 **19/24**。数据与逻辑类的差距要小得多，并发类也没有这么陡。

![五个代码库中的已验证 bug 数量对比](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-18-gpt-5-6-luna-vs-gpt-6-astra-code-review-img-source-by-repository.png)

![不同缺陷类别中的已验证 bug 数量对比](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-18-gpt-5-6-luna-vs-gpt-6-astra-code-review-img-source-by-bug-class.png)

Luna 并非完全不会安全审查，它确实找到了其中一部分。问题在于，安全代码里漏掉的东西，往往不是一个明显的空指针，而是权限模型在状态转换之后变成了什么样子。

存档里举了两个例子：联邦恢复码没有被标记为已使用，于是同一个码可能被重复兑换；全局的 view 权限覆盖了单个客户端设置的拒绝。这两件事都很难从一行 diff 里看出来。你得知道调用链、权限继承关系和系统允许的最终状态，才能判断改动是不是越过了边界。

这给实验加上了一个很重要的限定：两个模型看到的是 diff，不是一个可以自由查询的完整代码库，也没有仓库历史或生产行为。于是安全差距不能只解释成“模型聪明程度不同”，它也说明**审查任务缺少了决定审查深度所需的上下文**。

## 误报和波动，才是便宜模型的隐形账单

Luna 的 93 个 finding 里，74% 通过验证；Astra 的 96 个里，96% 通过。换成工作流语言，就是 Luna 大约每四条评论里有一条需要被否掉，Astra 的噪声明显少得多。

这笔差别会落到具体的人身上。未经整理的 AI review 会把判断成本转嫁给 PR 作者：他要逐条确认建议是否相关、能否复现、修复会不会引入新的行为。后续再接一个模型，也只是把筛选任务变成另一笔 token 账。Hacker News 的讨论里，最有价值的批评不是断言这个 benchmark 一定错，而是反复追问 harness 给了模型什么上下文，以及谁负责在评论到达作者之前把噪声处理掉。

稳定性也没有 headline 那么整齐。研究者挑了 10 个 PR，让每个模型在相同设置下各跑 3 次。Astra 首轮已经验证的 bug，有 **67%** 在两次重复中再次出现；Luna 是 **47%**。样本不大，不能把它当成稳定性定论，但至少说明一次运行得到的 69 或 92，都只是一个 draw，不是这个模型永远会给你的固定能力值。

![两个模型在重复运行中的已验证 bug 重现比例](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-18-gpt-5-6-luna-vs-gpt-6-astra-code-review-img-source-repeat-runs.png)

如果一个便宜模型被允许在每个 PR 上自由发言，却没有窄领域 reviewer、重复运行、去重、验证和升级出口，那么节省的只是 API 账单的一部分。另一部分成本会从模型价格栏，搬到人的注意力和流程的摩擦里。

## 两个模型不是冠亚军，而是两种探测器

这项对比最容易被忽略的数字，是两个模型到底发现了哪些不同的东西。

在 143 个已验证 bug 里，两个模型共同找到 44 个；只有 Luna 找到的有 25 个，只有 Astra 找到的有 48 个。也就是说，Astra 不是一个把 Luna 完全覆盖掉的“更大版本”，Luna 也不是只在同一批简单问题上打折扣。它们有共同盲区，也各自带着不同的探测偏好。

![两个模型发现的已验证 bug 重叠关系](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-18-gpt-5-6-luna-vs-gpt-6-astra-code-review-img-source-overlap-donut.png)

把两者都跑一遍，实验记录是找到 117 个已验证 bug，总成本 **$5.86**。这还不能直接变成采购建议：多出来的 bug 是否值得，取决于它们的严重性，以及团队能不能处理多出来的评论。问题因此换了一个问法：你不必在“全 Luna”和“全 Astra”之间选一个阵营，可以把两个模型放在同一条有分流、有复核的流水线上。

我尤其在意那 25 个 Luna-only。它们提醒我，不应该把“更强模型能发现更多”误读成“弱模型的所有发现都不重要”。模型之间的差异有时不是一条从低到高的直线，而是两种看代码的角度。真正值得优化的，是在什么位置让它们相遇，以及谁来判断它们是否说的是同一件事。

## 我会把模型选择改成一次变更分流

如果让我把这篇文章变成一个实际的代码审查流程，我不会从“默认 Luna 还是默认 Astra”开始，而会先给变更做风险分流。

第一层看变更触碰了什么：认证、授权、支付、秘密、数据边界、并发状态、基础设施和高影响配置，都应该提高审查预算；普通的局部逻辑、格式转换和低风险重复改动，可以先让便宜模型做高覆盖初筛。这里的“低风险”不能只由文件名决定，至少要结合调用路径、权限标签、测试范围和变更影响面。

第二层给模型应有的上下文。高风险审查不该只把 diff 丢进窗口，而应该允许它读取相关调用链、类型定义、测试、历史事故和构建后的行为；低风险审查也要有明确的证据要求，不能因为模型便宜就放宽“为什么这是 bug”的说明。

第三层才是模型组合。可以让 Luna 做窄领域的第一轮，让 Astra 或 GPT-5.6 Sol 负责安全敏感部分、跨文件综合和最终裁决；也可以让两个模型独立给出 findings，再由独立的验证器或人工把它们归并。无论采用哪种方式，原始评论都不应该未经整理直接送到作者面前。

这里和我之前写过的《[Not the Model, You're the Harness](https://ntlx.github.io/articles/not-the-model-youre-the-harness)》正好接上：模型不是脱离环境的分数牌。最近的《[Agent 规模化后，最贵的不是模型](https://ntlx.github.io/articles/agent-scale-cost-loop)》又把这件事推进了一步，真正应该计算的是每个有效结果的完整成本，而不是每个请求的 token 单价。放到代码审查里，“有效结果”至少要同时包含发现质量、误报处理、重复稳定性和漏报风险。

所以我会保留原文那句带条件的判断：Luna 对日常 correctness bug 可能已经足够便宜，但不会让它单独审认证或权限代码。对我来说，这个条件比“75% 的 bug 只花 3.6% 成本”更接近可执行的结论。

## 参考资料

- [Intelligent Artifact：Is a $1.20 Model Good Enough for Code Review?](https://intelligentartifact.com/posts/gpt-5-6-luna-vs-gpt-6-astra-code-review/)
- [Entelligence 完整对比页的 2026-09-14 网页存档](https://web.archive.org/web/20260914195804id_/https://entelligence.ai/blogs/gpt-5.6-luna-vs-gpt-6-astra-is-a-1.20-model-good-enough-for-code-review)
- [Hacker News 讨论](https://news.ycombinator.com/item?id=49703003)
- [OpenAI：Advancing the price-performance frontier with GPT-5.6](https://openai.com/index/advancing-the-price-performance-frontier-with-gpt-5-6/)
- [OpenAI API：GPT-6 Astra 模型与价格](https://developers.openai.com/api/docs/models/gpt-6-astra)
- [AI-Code-Review-Evals 公开数据入口](https://github.com/AI-Code-Review-Evals)
