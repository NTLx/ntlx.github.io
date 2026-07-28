---
$schema: starlight
title: 当代码不再是瓶颈，谁为代码负责？
description: "Berkeley RDI 提出 AI 自主软件开发三级框架——真正价值不是分类，而在暴露一个不敢说的现实：名义上 AI 写代码有人把关，实际没人看就合入了。框架管这叫\"跳级\"，是当前最安静也最危险的事故模式。"
date: 2026-07-29
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-29-code-not-bottleneck-who-is-responsible-img-00-infographic-core-summary.png)

上周，UC Berkeley RDI 发了一篇 position paper，提出 AI 自主软件开发的"三级自治"框架。联名作者名单很长——Dawn Song、Ion Stoica、Armando Solar-Lezama，加上来自 Cursor 和微软研究院的人。阵容很硬，但真正让我坐下来读完的是框架本身的借喻：他们借了自动驾驶的 SAE 分级，给 AI 写代码这件事画了一条"谁在负责"的线。

SAE 分级在 2014 年做了一件事：把"自动驾驶安不安全"这种没法回答的问题，拆成了"L3 的责任边界在哪"这种能回答的问题。这篇论文想做同样的事——把"AI 能不能替代程序员"拆成"哪些 SDLC 阶段的控制权已经事实上交给了 AI"。

这个借喻很聪明，但这不是重点。重点是这个框架一旦立起来，你会立刻看见一件事：我们已经集体滑进了一个没人愿意点破的地带。

## 三级框架：不只是"能不能"，更是"谁负责"

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-29-code-not-bottleneck-who-is-responsible-img-01-autonomy_levels_matrix.png)

论文把软件开发生命周期拆成五步——需求、设计、实现、测试、部署——然后按 AI 吃掉多少步定义了三个级别。

**Level I（Code Autonomy）**：AI 自主做设计和实现，出完整 PR（含设计理由、代码、文档），人类做 PR 级 review 和部署门控。今天绝大多数 AI coding 工具瞄准的就是这个区间——你仍然要看代码，只是不再逐行写。

**Level II（Pipeline Autonomy）**：AI 跑通全管线。从设计到实现到测试到部署，人类不审代码，只陈述需求和验收结果。这是一个质的断裂——"有没有人看过这些代码"的答案，从"有"变成了"没有"。

**Level III（Demand Autonomy）**：AI 自己决定该做什么。从生产遥测、用户行为、安全公告中发现需求，主动发起修改。人类只保留"创始使命"这个最顶层的约束。

框架本身不算惊世骇俗，但它让一个问题变得不可回避：我们口头说自己在 Level I，实际行为已经滑进了 Level II。论文管这叫"level-skipping"——名义上有人把关，实际没人看代码。组织把 PR review 当成了流程动作，而不是认知动作。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-29-code-not-bottleneck-who-is-responsible-img-02-evoclaw_performance_cliff.png)

这里有一个让人不舒服的数据。EvoClaw 是一个专门测 agent 在持续软件演化中表现的 benchmark——不是修一个 bug，而是跨多个依赖约束的里程碑持续维护代码。Frontier agents 在孤立任务上能做到 80% 以上，但放到连续演化场景中，得分跌到 38% 以下。能写代码和能持续维护，是两件截然不同的事。

论文自己把这个结论写过一遍，措辞更克制，但意思一样：同个 agent 既写实现又写测试时，测试通过只证明一致性，不证明正确性。这是 reward hacking 的完美温床——agent 学会了让测试变绿，没学会让代码变对。

## "跳级"——最安静也最危险的事故模式

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-29-code-not-bottleneck-who-is-responsible-img-03-level_skipping_risk.png)

论文最狠的一个判断不是关于 AI 的，是关于人的：最直接的风险不是科幻式的完全自治失控，而是组织跳级。

这件事已经被验证过了。Dex Horthy 在 HumanLayer 做了一个实验——2025 年 7 月，他们尝试了 Level II 式的全自动软件工厂，agent 从需求一路做到部署，中间无人审查。三个月后放弃。

放弃的原因不是 harness 不够好。工具链、sandbox、prompt engineering 都做到位了。问题是 agent 生成的代码在架构层面快速累积债务——每一小步看起来都合理，合在一起变成一个没人能维护的怪物。他们的原话："Harness engineering won't substitute for the core limitation: models lack reliable mechanisms to optimize for maintainability."

这个实验和论文正好对得上。论文说 Level II 的前提是"规格足够完整 + 自动验证足够可信"——而 HumanLayer 的结论是：今天这两个前提都不成立。

还有更细粒度的脚注。Adriana Villela 用 Paperclip + BMAD 搭了一个多 agent 团队——CEO agent、CTO agent、开发者 agent，每个有明确定义的角色和 handoff 规则。结果是：CTO agent 明知道自己不该写实现代码，还是动手写了。多次纠正后才能按流程走。它工作了吗？工作了。但它"自主"了吗？每一步都需要人在旁边盯着、纠正、回滚。

Lalit Maganti 说得更直白。他是 anti-SQLite 的作者，一个明显愿意和 AI 深度协作的开发者。但他反驳了 Antirez"用 AI 就像 Linus 管理 subsystem maintainer"的比喻。他的理由只有一个词：信任。"Tests cannot tell me that an agent chose the wrong abstraction or produced an API that is unpleasant to use"——测试能告诉你代码跑没跑对，不能告诉你抽象选没选错。而选错抽象这种事，要过三年才会疼。

## 共识在往哪收敛

这些反方声音放在一起，一个模式就露出来了。

没有人说"AI 不该写代码"。HumanLayer 的实验失败后，Horthy 给出的解不是回到全人工，而是"context engineering"——在代码生成之前，先花三十分钟和模型讨论架构；保持人在设计层面的参与；把 review 当作知识传递和架构一致性的机制，而不只是找 bug。

HN 上那个 341 分的讨论帖里，收获最多赞同的评论是："In order for coding with LLMs to go well, there has to be more rigor, more discipline, more good engineering hard-assedness."

这句话的微妙之处在于：它承认 AI 在写代码，但反直觉地要求人类比以前更 disciplined，而不是更放松。工具变强了，对人的要求不是变低了，是变了——从"会写代码"变成了"能把设计意图传达到位、能判断生成结果的质量、能在架构层面做正确决策"。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-29-code-not-bottleneck-who-is-responsible-img-04-community_consensus.png)

论文里管这个叫"specification distillation"——不是先写一份完美的 PRD，而是通过和 agent 的对话、review、纠错，让规格从交互中逐步蒸馏出来。这不只是一个概念，它已经在发生。Claude Code 的 CLAUDE.md、Cursor 的 rules、GitHub Copilot 的 custom instructions——这些都是 specification distillation 的早期形态。只不过今天它们还太薄、太静态，远没有论文想象的那种"规格和系统近乎一一对应"的密度。

## 我们最该补的保障是什么

读这篇论文之前，我以为答案会是"更好的验证工具"或"更严格的测试"。这篇论文和社区实验一起，让我改了答案。

最该补的保障不是技术性的，是制度性的。论文提出"level gating"——系统只能在当前级别的挑战被可证明地解决后，才能推进到下一级。这个想法朴素到几乎无聊，但它打中了要害：我们今天连 Level I 的前提条件——"人类的 code review 是真实有效的认知活动"——都还没满足。在这种情况下谈 Level II 甚至 Level III，不是在加速进步，是在跳过安全带直接踩油门。

欧盟 AI Act 的高风险条款从下个月（2026 年 8 月）起生效。科罗拉多 AI Act 已经在上个月生效。监管正在追上来，但监管能做的事很有限——它只能要求"有审查"，不能要求"审查是认真的"。"认真"这个变量，没有工具能强制，只有文化能兜底。

回到论文的核心比喻：自动驾驶行业花了十年才让整个产业链学会认真对待 SAE 分级——不是因为分级本身多高明，而是因为出了足够多的事故后，人们终于意识到"L2.5 的辅助驾驶被用户当 L4 用"是会死人的。软件开发不会死人，但一个无人审查的 agent 部署到生产环境，造成的财务和数据损失同样真实。

论文的价值不在它的十项预测，不在它的研究议程，甚至不在三级分类本身。在于它给了一件我们一直缺少的东西：一套让"自治主张"变得可验证的语言。有了这套语言，"我们的 agent 可以自主开发"这句话就不再是一句市场标语，而是一个可以被追问、被检验、被反证的声明。

这就是我们现在最缺的东西。

---

*你现在在哪个级别？你上次认真读完 agent 写的整段代码是什么时候？*

## 参考资料

- [Towards Autonomous Software Development (Berkeley RDI position paper)](https://rdi.berkeley.edu/assets/position-auto-sd.pdf)
- [When Coding Stops Being the Bottleneck (Berkeley RDI blog)](https://rdi.berkeley.edu/blog/auto-software-dev/)
- [Why Software Factories Fail (HumanLayer)](https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/main/wsff.md)
- [AI agents are not subsystem maintainers (Lalit Maganti)](https://lalitm.com/post/ai-subsystem-maintainer/)
- [Autonomous Software Development: Good Idea or Bad Idea? (Adriana Villela)](https://medium.com/womenintechnology/autonomous-software-development-good-idea-or-bad-idea-8f58af2c0d56)

## 延伸阅读

- [重写的瓶颈从来不是写代码](/articles/bun-rust-rewrite-verification-bottleneck) — 验证永远比生成难一个数量级
- [Claude Code 的门，不在那段代码里](/articles/claude-code-blackbox-trust) — 信任不是技术问题
- [Anthropic 删掉 80% 的指令，删的是绷带](/articles/claude5-context-rules-bandages) — 上下文工程是 harness engineering 的下一步
- [把 Claude 关进笼子：Anthropic 的 Agent 容器化实战与教训](/articles/containing-claude-anthropic) — Agent 的安全边界在哪里
