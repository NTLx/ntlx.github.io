---
$schema: starlight
title: 当执行开始变便宜，人的价值往哪里上移
description: AI 越能替人执行，越会把人的价值推向上游：定义问题、提供约束、识别错误、选择结果，并决定何时让 Agent 停下来。
date: 2026-09-22
category: ai-agents
primarySourceUrls: ["https://www.oneusefulthing.org/p/the-overhang"]
---

一个工作流里，Agent 如果能把研究、编码、建模、操作软件和修改结果串起来，人就不必再亲手执行每一步。随之冒出来的问题反而更难：任务到底该怎么定义，哪些结果可信，什么时候应该打断它。

这是我读 Ethan Mollick 的 [《The Overhang》](https://www.oneusefulthing.org/p/the-overhang) 时最在意的地方。

Mollick 展示了几个很容易让人产生“未来已经到了”感觉的项目：把文字冒险游戏 Zork 变成可玩的第一人称 3D 游戏；从视频、照片和目录重建 Umberto Eco 的私人图书馆；再让模型借助 Blender、语音、音乐和视频生成工具制作预告片。

如果只盯着这些结果，讨论很快会滑向“AI 又替代了什么”。但 Mollick 自己反复提醒了一件更重要的事：这些项目并不是模型凭空决定要做的。人仍然在选择问题、判断错误、要求重做，并决定什么值得保留。

他把模型已经具备的能力，与大多数人实际调用出来的能力之间的差距叫作 **capability overhang**。

我更愿意再往前推一步：今天真正悬在我们头上的，可能不只是模型能力没有被用完，而是**执行层升级得太快，人的控制层还没有跟上**。

![文章核心信息图：执行层扩张与人的控制层](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-22-capability-overhang-human-advantages-img-00-infographic-core-summary.png)

## 能力悬垂，首先是控制面的悬垂

Zork 的例子很直观。公开的 [项目仓库](https://github.com/emollick/zork-underground-empire) 不是一段概念视频，而是一个可以在浏览器运行、测试和构建的 3D 项目。Eco Library 也一样，[公开仓库](https://github.com/emollick/eco-library)把目录、照片和视频等材料组织进同一个可浏览的空间模型，还专门区分哪些位置来自较强证据、哪些只是推测、哪些未知。

这些演示真正改变的，是“执行”这件事的粒度。

过去，把一段文字世界变成游戏，需要先拆成场景、角色、交互、资源、代码和测试，再由不同工具甚至不同角色逐层实现。现在，模型开始能够跨过这些过去靠人工衔接的边界，把更长的一段任务接起来。

但任务变长以后，错误也会变长。

Agent 可以连续做更多事情，并不意味着人可以连续少管更多事情。恰恰相反，任务越长，越需要有人决定：目标到底是什么，哪些约束不能破，证据够不够，哪里只是模型在猜，以及什么时候必须停下来重新问人。

我之前在[《最危险的 Agent，不会停下来问人》](https://ntlx.github.io/articles/agent-should-look-up)里讨论过同一个问题的另一面：Agent 的成熟，不是永远自主地把事情做完，而是在权限、目标和判断发生变化时，把决定交还给真正有权力的人。

所以，我不太想把 capability overhang 理解成“大家还不会用高级模型”。这会把问题缩小成技巧差距。

它更像一个控制面问题：**执行能力被快速自动化了，但任务定义、上下文、权限、验收和停止条件还停留在人类手工拼接的时代。**

## 四种人类优势，其实在做同一件事

Mollick 在文章结尾列出四种优势：deep knowledge、wide knowledge、taste 和 agency。

如果逐条解释，很容易又变成一张“AI 时代个人能力清单”。但把它们放回 Agent 工作流里，我觉得它们其实在做同一件事：构成一个人类控制回路。

Deep knowledge 在这里主要解决约束和验收。你懂一个领域，就知道哪些错误不能接受，哪些结果虽然顺眼却违反了领域常识，也知道要看到什么证据才肯让任务继续。它的价值不只在于你还能比模型多做几个步骤。

Wide knowledge 解决的是搜索空间。知道数据库、编译器、统计方法、可视化、实验设计、权限模型这些不同领域的概念，你才更容易告诉 Agent 还有哪些路可走，也更容易发现它是不是一直困在错误的问题空间里。

Taste 处理选择。生成一个方案越来越便宜之后，候选只会更多。人要决定哪个值得继续投入，哪个虽然完整却没什么意思，哪个应该直接删掉。

Agency 则让这套回路真正转起来。模型能力不会自己流进工作流程。有人得去试、去拆任务，也要在碰到边界后改流程。对我来说，能动性不是“更勤奋地用 AI”，而是持续验证两件事：哪些工作现在可以交出去，哪些决定看起来能交，其实还是应该留在人手里。

把四个词放在一起看，它们分别补上约束、搜索、选择和探索。执行层越强，这些工作越显眼。

## 深知识很重要，但不必把专家神话带回来

“deep knowledge”很容易被读成另一个令人焦虑的结论：以后只有顶级专家才有资格管理 AI。

Anthropic 的研究给了一个更细的答案。

在 [《Agentic coding and persistent returns to expertise》](https://cdn.sanity.io/files/4zrzovbb/website/b93c7465925dc052b9102209b29b58f11df4fe55.pdf) 中，研究者分析了约 400,000 个 Claude Code 会话，覆盖约 235,000 名用户。一个很有意思的分工是：人平均做约 70% 的 planning decisions，却只做约 20% 的 execution decisions。

![规划决策与执行决策的分工：人约 70%，Agent 约 20%](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-22-capability-overhang-human-advantages-img-01-comparison-planning-vs-execution.png)

也就是说，在这些编码会话里，“做什么”更多留在人手里，“怎么做”已经大量下沉给 Agent。

研究同时发现，任务相关的领域经验与成功率有关。但最明显的提升出现在 novice 到 intermediate；从 intermediate 再到 expert，额外收益更小。它当然不能直接代表所有知识工作，研究本身也没有观察每个任务最终的真实世界结果。

![任务相关领域经验与成功率的定性关系：novice 到 intermediate 提升更明显](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-22-capability-overhang-human-advantages-img-02-infographic-expertise-returns.png)

可它至少提醒我，不要把“深知识”神化成必须成为某个领域最顶尖的人。

在 Agent 工作里，更关键的门槛可能是：你是否已经懂到足以**提出正确问题、识别明显错误、看懂关键证据、定义通过标准**。

这和过去“专家亲手完成大部分执行”的价值结构并不一样。

当 Agent 接走更多执行，专业知识没有贬值，只是用途发生了变化：它从生产每一个中间步骤，逐渐转向约束和验证机器产生的中间步骤。

这可能也是未来学习方式最值得重新设计的部分。不是少学知识，而是更清楚自己为什么学：如果一段知识只能帮助我重复模型已经能稳定执行的动作，它的边际价值会下降；如果它能帮助我发现模型不知道自己错在哪里，它的价值反而会上升。

## 下一轮差距，可能出现在组织而不是模型

个人可以靠主动探索缩小 capability overhang，组织却更麻烦。

因为组织里的“控制面”不是一个人的脑子，而是一整套东西：谁有权发起任务，Agent 可以看到什么上下文，哪些工具可以调用，什么结果需要人工复核，失败怎样留下证据，风险出现时谁能叫停，下一轮反馈又如何进入流程。

模型升级一次，这些制度不会自动升级一次。

这也是为什么我越来越觉得，下一阶段企业采用 Agent 的主要差距，未必表现为“谁先拿到更强模型”。同一个模型放进不同工作系统，能做出来的事可能完全不同。

一个团队如果仍然把 Agent 当成“更快的执行者”，它得到的往往只是局部提速：写代码快一点、查资料快一点、做 PPT 快一点。

另一个团队如果开始重新设计任务边界，把上下文、权限、验证和反馈一起交代清楚，Agent 才有机会承担更完整的工作单元。

这也让我重新理解了那些看起来很惊艳的 demo。

这些 demo 不能直接推出普遍的生产率结论，也不能证明“人已经不重要”。它们能说明的是，模型可承担的任务边界又往外移了一截。接下来反而要问：

**当机器越来越擅长执行，人是否也在同步变得更擅长定义、约束、判断和选择？**

如果答案是否定的，能力越强，悬垂反而越大。

我在[《Agent 能跑 demo 不算本事，能跑一年才是》](https://ntlx.github.io/articles/agent-development-lifecycle)里写过 demo 与生产之间的工程鸿沟。现在看，这条鸿沟还可以再加一层：未来真正稀缺的，不只是让 Agent 稳定运行的工程能力，也是让整个组织知道**该让它做什么、不该让它做什么，以及做成什么样才算完成**的能力。

所以我现在没有那么想把注意力全放在“下一个模型还会强多少”上。模型还会继续进步，但 capability overhang 已经把另一项工作摆到了眼前：我们得把任务定义、权限、验收和反馈这些人的控制面一起升级。等模型更新，反而是其中最省事的一部分。

## 参考资料

- Ethan Mollick, *The Overhang*: https://www.oneusefulthing.org/p/the-overhang
- Anthropic, *Agentic coding and persistent returns to expertise*: https://cdn.sanity.io/files/4zrzovbb/website/b93c7465925dc052b9102209b29b58f11df4fe55.pdf
- Zork — The Great Underground Empire: https://github.com/emollick/zork-underground-empire
- The Umberto Eco Library: https://github.com/emollick/eco-library
- Co-Existence: https://co-existence.ai/
- OpenAI, *A solution to the Navier–Stokes existence and smoothness problem*: https://openai.com/index/navier-stokes-solution/
