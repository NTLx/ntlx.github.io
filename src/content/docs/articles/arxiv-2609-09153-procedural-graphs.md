---
$schema: starlight
title: 图不替你决定下一步：它先把下一步变成可拒绝的改动
description: PG 的价值不在把经验画成图，而在于只给当前站位之后的一小段程序，并允许 held-out validation 拒绝一次自我修改。
date: 2026-09-12
category: ai-agents
tags: [Procedural Graph, LLM agents, procedural memory, agent evaluation, self-evolution]
primarySourceUrls: ["https://arxiv.org/abs/2609.09153"]
---

我读 [《Procedural Graphs: Self-Evolving Execution Structures for LLM Agents》](https://arxiv.org/abs/2609.09153) 时，最初对“图”这个词有点警惕。给 Agent 再加一种结构化记忆，很容易变成把原本的长文本换成节点和箭头，然后把格式变化误认成能力变化。

但论文里真正让我停下来的不是图长什么样，而是两个接口被同时钉住了：运行时只取当前站位之后的一小段程序；离线修改则必须接受独立的 held-out validation。我的判断是，PG 的价值不在图标签，而在于把“下一步”与“这次修改能不能被拒绝”绑定起来。图只是让这两个接口有地方表达、有办法检查。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-12-arxiv-2609-09153-img-00-infographic-core-summary.png)

## 平面经验记住了过去，却没标出下一步

长轨迹 Agent 并不缺经验。麻烦在于，经验通常只是一串已经发生过的文字。ReAct 把 reason 和 action 交错起来，让行动从环境得到观察，再继续推理；但在这个循环里，solver 仍要自己回答四件事：我现在走到哪儿了？前面哪些步骤已经完成？下一步依赖什么？如果这条路走不通，应该回到哪里？

一段平面历史可以告诉它“先查现金，后来申请融资，最后破产”，却没有明确标出“申请融资之前必须先预测 runway”，也没有把“这个动作只在现金低于某个条件时适用”放在下一步旁边。模型当然可能从文字里猜出来，但每次猜测都在重新恢复程序。轨迹越长，相似的经验越多，恢复顺序、条件和异常分支就越容易混在一起。

PG 做的不是把世界画成一张更漂亮的知识图。它把对象换成“程序到程序”的关系：节点可以是工具动作、技能、内部推理步骤或任务状态；边用 `LEADS_TO`、`TRIGGERS`、`PROVIDES_INPUT_FOR`、`CONVERGES_TO` 表示连接，并附带 `condition`、`guidance`、`pitfalls`。这三个属性分别回答什么时候走、应该怎么走、哪里容易错。

所以我更愿意把 PG 看成程序记忆的一种接口，而不是知识库的升级版。它显式保存的不是“我见过什么”，而是“站在这里之后，哪些动作有资格出现”。

## 全图为什么会输给一小段邻域

如果图的价值只是保存更多关系，那么把整张图放进 prompt 应该更稳。论文的 Table 3 恰好给了一个反例：在 Gemini 3.5 Flash、同一张图、同一套任务上，local subgraph + generative guidance 在 MultiChallenge、GDPval、ALFWorld 上分别达到 `89.31%`、`63.99%`、`81.53%`；无图 baseline 是 `80.27%`、`54.80%`、`72.58%`。但 full graph + generative guidance 只有 `87.35%`、`56.75%`、`54.48%`。

ALFWorld 的落差最能说明问题：全图不只是没有继续带来收益，还从无图的 `72.58%` 降到 `54.48%`；只给当前节点向前最多 2 hops 的局部子图，反而升到 `81.53%`。这不是“图越大，信息越多”的故事，而是“相关性决定结构是否能被执行”。具身任务里，远处的清洁、取物、移动和终止分支同时出现，solver 需要从一堆合法但当前无关的关系里重新筛选下一步。结构化噪音仍然是噪音。

论文的在线路径很具体：用最近 `w=3` 步轨迹，把最近一次 procedure/tool call 与节点做 exact match；匹配后取出活动节点的 2-hop 邻域，交给 guidance LLM 翻译成情境指导，再让 ReAct solver 选择动作。匹配失败时会 fallback 到全图。这里的 locality 不是一句“上下文相关”的口号，而是一个有成功条件、也有失败回退的运行时接口。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-12-arxiv-2609-09153-img-01-local-subgraph-ablation.png)

这个结果也限制了我对 PG 的归因：不能说“图带来了提升”。更准确的说法是，局部化让图有机会回答当前问题，而 generative guidance 把关系和边属性翻译成 soft bias；两者叠加后，才可能比让 solver 独自从平面历史恢复程序更好。局部 guidance 相对 full graph generative 还把 token 降低了 14.8%（MultiChallenge）、18.1%（GDPval）和 70.9%（ALFWorld），但仍比无图 baseline 多 token。少读一点不等于免费。

## 自演化真正可贵的是能停手

我对“self-evolving”最在意的是一次改动能不能被拒绝。图会不会自动长大，反倒没那么重要。论文把离线过程拆成了几个不应混为一谈的角色：refiner 从成功和失败轨迹中提出 `add/delete/update` 候选；结构检查确认端点、关系类型、可达终点和周期策略没有明显问题；validation gate 再用独立数据判断候选是否值得提交。

只有 validation 分数不低于当前缓存分数（`>=`），候选图才 commit；否则 rollback，保留旧图，并把被拒绝的候选及理由写进 rejection memory。三者解决的是三种不同风险：

- validation gate 防止“训练轨迹上看起来更好”直接变成新程序，要求修改在没参与提案的样本上至少不退化；
- rollback 把一次错误修改的影响限制在候选版本，不让图被不可逆地越改越坏；
- rejection memory 把失败变成下一轮的负证据，提醒 refiner 某一类改法已经在 held-out 上退化过，而不是只保留成功案例。

EnterpriseArena 的十轮 trace 给了这个门控最清楚的时刻：Round 10 的 training survival 到了 `90%`，validation 却降到 `85%`，候选被拒绝。最终返回图的 test survival 是 `85%`，论文没有把中间最好的一轮 `95%` 当成最终成绩。这种“没有继续追最高分”的行为，比一条不断上扬的训练曲线更接近我愿意相信的自我改进。

当然，gate 不是证明。它只保证在这次 validation 上没有低于缓存分数，不保证全局最优、成本最优或未来任务最优；每个 split 只有 20 个 episodes，某次 accept/reject 可能由一两个样本决定。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-12-arxiv-2609-09153-img-02-validation-rejection-gate.png)

因此，对我来说，PG 最有价值的产物是一份可审计的 graph diff：谁提出了哪条边的变化，结构检查看到了什么，held-out 为什么接受或拒绝，回滚后下一轮还记得什么。这个边界让自修改从追加一段文本，变成一个可以被追责的候选版本。

## EnterpriseArena 里，程序记忆记住的是等待

EnterpriseArena 这个例子让我更容易看懂“程序”二字的重量。它是一个 132 个月的企业资源配置模拟器，有部分可观测状态、工具预算和宏观冲击；第 32、59、112 月有危机，筹资到账延迟 1–6 个月，现金小于 0 就破产，同一时点还不能重复提交 pending request。这里的关键动作并不难单独描述，难的是现在的决定要为几个月后的状态负责。

PG 的演化轨迹先形成“查现金 → 预测 runway → 保存 note → 查市场 → 决定资本”的主干，之后加入 `recall_notes`，删除 `pass_action`，再让 `fund_raising_request` 直接结束当前 procedure、下月重新评估。它记住的不是一句“企业要及时融资”，而是一个跨月的后继关系：如果资金会晚到，就必须把申请放在危机之前；如果当前请求仍 pending，就不能重复走同一分支。

长程结果也因此值得看，但不值得被包装成通用证明。和 baseline 相比，PG 的 full-horizon survival 中，Claude 从 `44%` 到 `58%`，Gemini 3.1 Pro 从 `6%` 到 `34%`，Grok 从 `26%` 到 `40%`；Gemini 3.5 Flash 的 survival 仍是 `0%`，平均寿命却从 `33.58` 月升到 `40.62` 月。不同模型的改善形状并不一致，不能压成“PG 让所有 Agent 都活得更久”。

更不能把调用次数当成可靠性的代理。EnterpriseArena validation 中，Tools/Mo 从 baseline 的 `17.23` 降到 Round 2 的 `3.08`，论文报告约 `81.8%` 的下降；但主实验里 PG 的 tool count 会随模型上升或下降。局部 guidance 减少 solver steps，也不等于总 token 变少，因为每一步 guidance 本身要多一次模型调用。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-12-arxiv-2609-09153-img-03-enterprisearena-delayed-path.png)

把这条路径画成“图越来越大”，会直接错过重点。经验在这里被压缩成可逐轮删改的顺序、条件与分支：哪些事情必须提前做，哪些动作会造成冲突，什么时候要结束当前程序并等待下个月。图在这里是表达层，延迟反馈和可验证修改才是机制层。

## 图只是表达层，证据还没有到定论

最强的反对意见并不难想象：PG 会不会只是 durable task list、命名引用，或者把文本 patch 换了一种语法？这个问题不能靠图画得更规整来回答。论文没有 graph-based baseline，也没有与 self-modifying harness 的直接对照；它也没有提供“同样增加一次 guidance LLM 调用、但不使用 graph”的干净控制。因此，现有结果还不足以把性能差异归因给 graph representation 本身。

把它放回相邻工作里看，边界会更清楚。CoALA 已经把 procedural memory 与 working、episodic、semantic memory 区分开；AutoGuide 已经从对比轨迹生成条件化 guideline；AWM 已经从经验中诱导可复用 workflow；AFlow 则把 code-represented workflow 放进带 execution feedback 的 MCTS 搜索。PG 的新增价值如果成立，应该收窄到这一组组合：当前站位的局部邻域、带 condition/guidance/pitfalls 的关系、可离散编辑的图 diff，以及可以拒绝这次 diff 的 validation 边界，而不是泛称“结构化记忆”或“自我改进”。FlowBench 对 text、code、flowchart workflow 的比较也提醒我：换一种 workflow 形式，不会自动得到可靠规划。

HN 讨论区提出的 graph churn、rollback frequency、跨工具迁移、审计和权限/provenance，正好是下一组该测的变量。论文里 action node 与工具目录的一致性主要写在 refiner prompt，通用结构 validator 并没有独立的工具 schema 或权限门。exact-match 定位失败率也没有作为主结果单独报告；而一旦 fallback 到全图，刚才的局部性优势就可能消失。

所以我会给实际系统一个很窄的采用条件：只有当任务有稳定的动作节点、明显的长程依赖、可以构造独立 validation，并且能承担每步额外 guidance 调用时，才值得先试“局部程序记忆”。上线前至少记录定位失败率、总 token 与调用成本、候选接受/回滚次数、跨 seed 结果，以及工具接口变化后的迁移表现。否则，图可能只是把一份未经验证的任务清单变成了更有秩序的未经验证任务清单。

**一句话总结：**PG 值得借鉴的不是把经验画成图，而是把当前站位之后的一小段程序和一次可被 held-out validation 拒绝的修改放进同一套接口。

**互动问题：**如果你给 Agent 加程序记忆，你会先记录定位失败率，还是先验证候选修改的回滚质量？

## 参考资料

- [Procedural Graphs: Self-Evolving Execution Structures for LLM Agents（arXiv:2609.09153）](https://arxiv.org/abs/2609.09153)
- [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629)
- [Cognitive Architectures for Language Agents](https://mlanthology.org/tmlr/2024/sumers2024tmlr-cognitive/)
- [AutoGuide: Automated Generation and Selection of Context-Aware Guidelines for LLM Agents](https://arxiv.org/abs/2403.08978)
- [Agent Workflow Memory](https://arxiv.org/abs/2409.07429)
- [AFlow: Automating Agentic Workflow Generation](https://arxiv.org/abs/2410.10762)
- [FlowBench: Workflow-Guided Planning for LLM-Based Agents](https://aclanthology.org/2024.findings-emnlp.638/)
- [Can LLM Agents Be CFOs?](https://arxiv.org/abs/2603.23638)
- [Hacker News discussion for arXiv:2609.09153](https://news.ycombinator.com/item?id=49629868)
