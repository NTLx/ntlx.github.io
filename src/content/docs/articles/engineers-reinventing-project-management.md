---
$schema: starlight
title: 叫它“智能体编排”之前，工程师们正在一字不差地重新发明 50 年前的项目管理
description: AI 没有终结软件工程，反而倒逼工程师退回最古典的防线：当你被 10,000 行未经消化的 PR 淹没时，你才发现自己拼命包装的“智能体编排”，本质上就是 50 年前被无情嘲笑的项目管理课本。
date: 2026-08-17
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-17-engineers-reinventing-project-management-img-00-infographic-core-summary.png)

在 Hacker News 最近的一场讨论中，David Horn 留下了一条被顶到最前排的评论。起因是社区里接连出现了两篇引发广泛共鸣的长文：一篇来自 Geoffrey Litt，断言在 AI 时代[“理解是新的系统瓶颈”](https://www.geoffreylitt.com/2026/07/02/understanding-is-the-new-bottleneck)；另一篇则是 Allen Bargi 发出的感叹——[“与 AI 协作的感觉越来越像在当领导，而不是在写代码”](https://allen.bargi.org/notes/working-with-ai-feels-like-leadership/)。

工程师们正在形成一种全新的直觉：管几个智能体，和带一个人类工程团队几乎没有什么两样。但 David Horn 的反应却冷峻得多：工程师最大的习惯性盲区，就是从来不肯认真翻一翻历史留下来的手册。

## 硅谷的技术轮回：换个性感名字，把旧学科重新发明一遍

每当新的计算范式出现，软件工程领域就会上演一套极其熟悉的剧目。

第一幕总是“从第一性原理探索”。工程师们一头扎进未知的荒原，耗费数年摸索基准指标、设计诊断流程、构建工具链，并为开拓了一片全新天地而兴奋不已。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-17-engineers-reinventing-project-management-img-01-reinventing_history_data_science.png)

但历史往往只是换了一件外套。最典型的例子莫过于“数据科学”。当年全行业都在为海量数据、分布式计算和算法调优狂热，直到统计学家们冷冷指出：这不过是把统计学换了一个更性感的标签。Nate Silver 曾直言“数据科学家就是统计学家的时髦叫法”；Matt Levine 也在彭博专栏中观察到，加密货币（Crypto）用不到十年的时间，以极高时速把传统金融四百年里经历过的银行挤兑、流动性枯竭与影子银行漏洞完整重演了一遍；甚至在微出行浪潮里，硅谷还曾煞有介事地“发明”出按固定线路和站点停靠的定制大巴——也就是大家熟知的公共汽车。

为什么技术人总是热衷于重蹈覆辙？一方面，软件工程师对早于计算机时代诞生的制度化科学抱有天然的警惕与疏离，宁愿相信自己能从白纸推导出一套全新逻辑；另一方面，商业世界从来不会为“正确套用 50 年前的管理方法”给予高估值，但只要给旧学科贴上“前沿智能体架构”，就能在资本市场换来真金白银的融资与溢价。

## 瀑布模型的 50 年公案：我们嘲笑的，恰恰是我们未曾读懂的

这种集体性的“历史失忆症”，在当下的 AI 编程浪潮中达到了顶峰。

过去十几年里，敏捷运动让许多工程师视“编写详尽 PRD”、“前置行为定义（TDD）”和“瀑布流程”为官僚主义的代表。然而，当工程师们开始指挥智能体长程写代码时，现实迅速给所有人上了一课：如果你不在提 prompt 时把每一处边界条件、异常分支和接口规范定死，AI 就会以极高概率按它的自发理解写出面目全非的垃圾；如果你不给智能体设定阶段性检查点，跑了一整夜的模型就会交付一个完全跑不通的 10,000 行巨型 PR。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-17-engineers-reinventing-project-management-img-02-royce_waterfall_feedback_loop.png)

讽刺的是，这恰恰逼得工程师们重新捡起了最严格的规格说明书与分阶段验收机制。只不过，大家绝不会称之为“瀑布模型”或“项目管理”，而是给它冠以“上下文工程（Context Engineering）”、“规格驱动开发（Spec-driven Development）”乃至“自主编排管线（Agentic Orchestration）”。

更具历史反讽意味的是，极少有人真正读过 Winston Royce 在 1970 年发表的奠基性论文《大型软件系统开发管理》（Managing the Development of Large Software Systems）。业界奉为教条或当作靶子打了几十年的“单向线性瀑布图”，在 Royce 的原文中仅仅是用来做反面教材的——Royce 明确指出无反馈的线性执行“充满风险且注定失败”，并提出了原型迭代与多级回溯机制。今天许多工程师在搭建 Agent Pipeline 时，因为缺少对经典系统论的认知，反而无意识地重新掉进了 50 年前 Royce 警告过的最坏形态。

## 布鲁克斯法则与格鲁夫杠杆：多智能体系统的“管理学重负”

当单 Agent 无法处理复杂任务时，业界的标准动作是堆叠 Multi-Agent：让规划者（Planner）、执行者（Coder）、测试者（Tester）和评审者（Reviewer）各司其职。

然而，多智能体协同并没有带来线性的效能提升，反而常常引发状态漂移和幻觉级联。这在本质上并没有脱离 Fred Brooks 在 1975 年《人月神话》（The Mythical Man-Month）中提出的客观法则：系统的沟通开销随节点数量呈二次方 $O(N^2)$ 增长。在没有人类隐性共识的前提下，Agent 之间每一次上下文转发都在损失信噪比。

我们在站内讨论[《当 vibe coding 和 agentic engineering 开始模糊，我感到一阵不安》](https://ntlx.github.io/articles/vibe-coding-agentic-engineering)时就曾提及，当编程从随意试错滑向工程交付，决定系统稳定性的从来不是单个节点的生成能力，而是边界控制的严密程度。

英特尔传奇 CEO Andy Grove 在《格鲁夫给经理人的第一课》（High Output Management）中曾提出一个核心概念：**任务成熟度（Task-Relevant Maturity, TRM）**。一个管理者的最佳监控频率，必须与下属在特定任务上的成熟度动态匹配：
- 面对低 TRM 的对象，必须实施高频、小步长、强结构化的阶段性检查点（Checkpoints）；
- 只有当其展现出高 TRM 时，才能平滑过渡为基于结果的目标管理。

今天绝大多数编码智能体在面对复杂业务架构时，其 TRM 显然处于极初级阶段。如果你期望用一段模糊提示词让它“自主交付整个模块”，无异于将核心系统直接委托给毫无经验的实习生。给 Agent 设定 Harness 约束、强制阶段断言与限制修改上下文，本质上就是工程经理在践行经典的 TRM 治理。

## 约束理论的警钟：当代码生成 10 倍提速，人类认知成了唯一的堰塞湖

 Eliyahu Goldratt 在经典著作《目标》（The Goal）中阐述的**约束理论（Theory of Constraints, TOC）**给出了另一个发人深省的推论：**在系统的非瓶颈环节提高产能，不仅不会提升全局产出，反而会导致在制品（Work in Progress, WIP）在瓶颈环节前大规模堆积。**

在传统研发流程中，写代码、读代码与测试代码的速率大体维持在同一个数量级。但当大模型将代码生成的吞吐量瞬间拔高 10 倍甚至 50 倍时，人类工程师的大脑工作记忆和架构审查带宽并没有同步升级。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-17-engineers-reinventing-project-management-img-03-theory_of_constraints_wip_block.png)

正如我们此前在[《全员 Vibe Coding 是个陷阱：读 Cloudflare OS 内部 AI 落地架构有感》](https://ntlx.github.io/articles/cloudflare-ai-os-reader-response)中所剖析的，未经深度理解与严格测试的代码资产，实质上是极度危险的高利贷。当 AI 批量倾倒未消化的 PR 时，工程团队很快会遭遇认知负债的断崖式清算：无人敢重构、无人敢排查线上事故，整个系统的演进速度反而彻底归零。

走出这一困局的解法，不是继续研发更庞大的黑盒编排框架，而是诚实地回归工程管理的常识：
1. **严格限制在制品（WIP）**：杜绝 Agent 一次性提交上千行跨模块改动，将任务强制切分为微型、正交、可验证的原子提交；
2. **用可执行规格（Executable Specs）拓宽审查瓶颈**：把自然语言的模糊意图沉淀为前置的形式化测试用例与断言，让确定性的机器测试替代脆弱的人眼逐行 Review；
3. **放下新词执念，重读经典手册**：无论是《人月神话》、《PMBOK》还是《约束理论》，前人在系统工程与复杂协作中踩过的深坑，远比当下浮躁的 Prompt Tricks 深刻得多。

软件工程从来没有因为一行新代码而摆脱过组织科学与控制论的重力。当我们终于愿意承认自己做的事情其实就是项目管理时，AI 辅助工程才算真正迈出了走向成熟的第一步。

*{当 AI 把写代码的边际成本压到接近于零，你在团队中感受到的最大瓶颈是“生成不够快”还是“理解不过来”？欢迎在评论区聊聊你的真实体感。}*

## 参考资料

- [Engineers will do anything to avoid learning from history — David Horn](https://horn.gg/blog/engineers-will-do-anything-to-avoid-learning-from-history/)
- [Understanding is the new bottleneck — Geoffrey Litt](https://www.geoffreylitt.com/2026/07/02/understanding-is-the-new-bottleneck)
- [Working with AI feels more like leadership than coding — Allen Bargi](https://allen.bargi.org/notes/working-with-ai-feels-like-leadership/)
- [Managing the Development of Large Software Systems — Winston W. Royce (1970)](https://courses.csail.mit.edu/18.337/2015/docs/50YearsDataScience.pdf)
- [The Crypto Story — Matt Levine (Bloomberg)](https://www.bloomberg.com/features/2022-the-crypto-story/)
- [When Silicon Valley accidentally reinvents the city bus — Stanford Daily](https://stanforddaily.com/2018/04/09/when-silicon-valley-accidentally-reinvents-the-city-bus/)

## 延伸阅读

- [当 vibe coding 和 agentic engineering 开始模糊，我感到一阵不安](https://ntlx.github.io/articles/vibe-coding-agentic-engineering)
- [全员 Vibe Coding 是个陷阱：读 Cloudflare OS 内部 AI 落地架构有感](https://ntlx.github.io/articles/cloudflare-ai-os-reader-response)
- [让 AI 写代码不再翻车：一个 TypeScript 巫师的 5 个 Agent Skills](https://ntlx.github.io/articles/5-agent-skills-for-ai-coding)
