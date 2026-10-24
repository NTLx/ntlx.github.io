---
$schema: starlight
title: 节点不是检查点
description: 图库把节点边界当成了恢复点，可并行之下它两者都不是。读 Colvin《The code is the graph》：代码没有消掉那道难题，只是把合并摆到了你面前。
date: 2026-10-25
category: ai-agents
primarySourceUrls: ["https://pydantic.dev/articles/the-code-is-the-graph"]
---

把一个并行任务画成流程图，节点之间的连线看起来像天然的存档点。跑完一个节点，存一次盘；崩了，从上一个节点接着跑。

这个直觉太顺了，以至于不少图库就是按它设计的。问题在于，节点结束并不等于事情做完。

Samuel Colvin 在《The code is the graph》里把这个错觉拆得很细。他是 Pydantic 的创始人，也亲手建过图库 pydantic-graph。这篇文章更像一次事后复盘，而不是旁观者吐槽：图库到底替你保存了什么，又拿走了什么。

他的结论很硬：图库是个错误，代码本身就是图。这个结论我认同一半。代码确实比图库更适合当运行时，但“代码就是图”这句话容易让人以为难题被消掉了。没有。代码只是把难题挪到了一个你更容易看见、也更容易审的地方。

![文章核心信息图：节点不是检查点，图库的三选二](https://cdn.jsdelivr.net/gh/NTLx/Pic@da3874f2a5dd13fa26ae2de691d8396f9ea32be3/wechat-articles/2026-10-25-the-code-is-the-graph-img-00-infographic-core-summary.jpg)

## 节点结束，不等于状态一致

先看串行的情况。一个节点跑完，状态是一个值，下一个节点也只有一个。这时候 `NodeSnapshot(state, next_node)` 就够了：存下状态和“接下来去哪”，恢复时接着走。早期 pydantic-graph 就是这么做的，既有类型，也能恢复。

并行一进来，这个等式就断了。

“我们在哪”不再是一个节点，而是一组还在飞的节点和几个没填满的 join。与此同时，这些节点可能在改同一个状态对象。假设其中一个节点做了三次更新，你写快照的那一刻，这三次发生了几次？恢复之后，第二次更新会跑两遍，还是永远不跑？图库答不上来。

更麻烦的是，节点自己也不知道答案。它可能已经把邮件发出去了，也可能没有；重跑一次是否安全，runner 无从判断。原文那句话很准：邮件发出去了没有，图不知道。

于是只剩两种选择。要么只在“没有任何东西在飞”的屏障处快照，但那样步骤内崩溃就会丢掉整步，而且节点写了一半的状态已经脏了，没有 undo。要么让节点别直接写状态，改成返回一份“变更描述”，由运行时在提交点统一应用。

第二种选择能快照，但代价是类型。两个并行节点的变更以不确定顺序到达，应用就必须与顺序无关。这意味着每个字段都要有一条合并规则，而且规则得声明在节点代码之外。类型检查器能验规则的签名，验不了它是否可交换，也验不了两个部分更新落地后，状态里那些跨字段的不变量还成不成立。

这就是原文说的那句关键话：任何两个都碰过状态的并行分支，汇合时都需要一次语义合并，而没有类型系统能检查语义合并。

合并输出没问题。`asyncio.gather` 返回一个带类型的 tuple，类型是清楚的。难的是合并状态。

![三次更新与快照：节点结束不等于状态一致](https://cdn.jsdelivr.net/gh/NTLx/Pic@da3874f2a5dd13fa26ae2de691d8396f9ea32be3/wechat-articles/2026-10-25-the-code-is-the-graph-img-01-framework-partial-snapshot.jpg)

## 三个愿望，为什么只能挑两个

Colvin 把它写成一个类似 CAP 的三选二：类型安全、并行执行、状态快照。

- LangGraph 选了并行和快照。节点不直接改状态，而是返回 update；每个 super-step 结束写一次 checkpoint；同一个 step 里两个节点写同一个 key，就用 `Annotated` 里声明的 reducer 合并，没有 reducer 就报错。状态可以类型化，reducer 的签名也可以，但 reducer 到底会把两个值合成什么，类型系统管不了。节点的写本来是一条类型检查器能读的语句，现在变成了一份数据。
- 早期的 pydantic-graph 选了类型和快照，所以只能串行。一次只有一个节点在跑，`FullStatePersistence` 存下状态和唯一的 next node。
- 今天的 pydantic-graph 选了类型和并行，所以没有快照。他们找了很久，想让 API 既保持类型又能快照，结果每个版本要么退化成 reducer 注解，要么需要没人愿意维护的泛型。最后 V2 直接移除了 `pydantic_graph.persistence`，把持久化交给专门的引擎。

三个选择看起来是产品差异，底下是同一个约束：只要状态是共享的、可变的，而且随时可能被改到一半，节点边界上就不会有一个既一致又能恢复的值。

Temporal 的逃法很干脆：它根本不快照应用状态。每个 activity 完成时记下结果，出了事就重跑代码，用重放把状态重新建出来。“三次更新发生了几次”这个问题，答案是再跑一遍。activity 中途被打断可能跑两次，所以 activity 边界必须由你来声明：这里碰了外部世界，重试是否安全。

Monty 的逃法则在沙箱里：它不快照业务状态，它快照解释器。这个区别很重要，后面再说。

## 代码没有消掉那道题

Colvin 说“代码消解了整件事”。这句话对了一半。

在代码里，状态的合并确实变成了你写的一行：

```python
async def review_comments(comments: list[str]) -> str | None:
    reviews = await asyncio.gather(*(reviewer(task=c) for c in comments))
    issues = [r.issues for r in reviews if r.issues]
    if issues:
        return await summarize(issues)
```

扇出、汇合、分支，都在一个普通函数里。`ty` 能检查 `summarize` 收不收 `issues`，调用栈就是运行状态，模型一次工具调用就能写出来。这比 `g.step`、`edge_from(...).to(...)`、`g.join(reduce_list_append, ...)` 那一套干净得多，也好读得多。

但注意合并那一步发生了什么。`issues` 是你筛出来的，`summarize(issues)` 是你决定要调的。合并的逻辑没有消失。库把它做成一条通用的 reducer 注解，你把它写成代码。它仍然不能被类型系统证明；它只是变得局部、有顺序、能读、能测。

这其实是个不小的改善。库的 reducer 是全局的、隐式的、跨字段的，你很难在 review 时看见它；你写的那一行就在调用栈里，错了能断点，能加测试。但改善的是可审性，不是可证明性。

![库的 reducer 与代码里的合并：可审不等于可证明](https://cdn.jsdelivr.net/gh/NTLx/Pic@da3874f2a5dd13fa26ae2de691d8396f9ea32be3/wechat-articles/2026-10-25-the-code-is-the-graph-img-02-framework-merge-line.jpg)

代码还改了另一个东西：快照的对象。Monty 之所以能在沙箱里快照，是因为它不持有 socket、文件描述符、线程。脚本的每个并行分支都是一个 host function，是沙箱正在等待的外部调用。暂停的那一刻，所有在飞的东西都在解释器外面，解释器本身，也就是堆和调用栈，是一个几 KB 的值。把结果交回去，就能在另一个进程里继续。

Temporal 改的是另一面：不快照状态，快照 activity 的结果，然后重放代码。两者都没有同时满足“类型、并行、快照”这三个愿望；它们只是把“快照什么”换掉了。Monty 快照解释器，Temporal 记录 activity 结果。原来的 trilemma 还在，只是被绕过去了。

所以更准确的说法是：代码把无法验证的语义合并摆到了你面前，也把 durability 从节点边界挪到了你声明的外部调用边界。这谈不上免费。账单还在，只是换了个更清楚的位置。

## 沙箱里的那条边界

Monty 是 Colvin 这篇文章里最实在的部分。它是一个用 Rust 从零写的 Python 解释器，不是受限版 CPython，也不是编译到 WASM。默认没有文件系统、没有网络、没有环境变量；离开沙箱的唯一途径，是你注册的外部函数。

这个设计和“先给一个完整容器，再逐步收紧”相反。后者像在一条很长的围墙上找洞；前者是从一间空屋子开始，只开你指定的门。

回到图这件事上，关键不在安全性，而在边界的位置。Monty 的 host function 就是效果边界：你在这里声明什么会碰外部世界，重试是否安全。原文说得很直接：host function 仍然是你决定什么触碰外部世界、运行两次是否安全的地方，和 activity 一样。节点不是效果边界；你写的那个外部调用才是。

Pydantic AI Harness 已经把这套东西产品化了。`DynamicWorkflow` 给 orchestrator 一个 `run_workflow` 工具，模型在里面写普通 Python：子 agent 是 async 函数，`asyncio.gather` 并行，`for` 包 `try` 做重试，列表推导做投票。只有最后一个值回到模型上下文。脚本先按子 agent 的签名做类型检查，拼错函数名或参数类型不对，会在任何子 agent 运行前被拒绝。

预算也是显式的：默认最多 50 次子 agent 调用，编排脚本默认 256MB 内存上限。这些上限决定了模型能自由到什么程度，也决定了出事时你能把范围收多小。

原文举的 Prime Intellect 例子更能说明形状。他们用 2000 多个 agent、两周时间把 Prime Agent 从 TypeScript 重写成 Rust，官方博客说冷启动 input-ready 延迟快了 14.18 倍。根 agent 只做拓扑排序，不写产品代码；每个任务经过 planner、implementer、reviewer、verifier，review 或 verification 失败就退回 implementer。Colvin 说，看它的形状，就是一个遍历任务的 `for`，里面每个任务一个带 `try` 的 `while`。

这个例子容易被读成“agent 已经能重写大型系统”。但 Prime 自己的复盘里，撑住这次重写的是 parity tests、reviewer/verifier 和 benchmark，不是某一张画得很漂亮的图。站内那篇[《读 GitHub 的 80 万行 Rust 重写》](https://ntlx.github.io/articles/github-copilot-rust-runtime-rewrite)强调过，正确性要放在 agent 改不到的地方。代码即图把编排变得自然，但验证仍然要另建。

## 什么时候仍然该画图

Colvin 的结尾很克制：画图，放在设计文档里，从代码渲染，用来事后解释一次运行；不要执行它们。

我同意这个分工，但想补一句：固定图在有些场合仍然有价值，只是它的价值不在运行时。

如果拓扑需要提前批准，或者某个节点必须停下来等人签字，一张提前画好的图就是治理工件。监管要求你静态说明“这个系统可能走哪几条路”时，这张图也是治理工件。它限制的不只是代码，还有组织需要解释的动作空间。Colvin 说固定图是“多了几步的提示词”，这句话在开放任务里成立；在合规场景里，它说得过头了。

但即便在这些场景，图也不该是唯一的真相。设计图表达意图，trace 记录实际，代码是能执行的那一个。三者混在一起，就会出现一种很常见的漂移：图改了，代码没改；或者代码改了，图还是去年那张。

Colvin 说，该看的是实际跑出来的那张图，不是提前画的那张。Pydantic AI 的做法是把每次运行和模型调用变成 OpenTelemetry span，扇出、汇合、重试按代码的写法嵌套在 trace 里。于是 observability 不需要另一个图可视化器：trace 本身就是那张图。

![设计图、代码与 trace：三种表示各回答一件事](https://cdn.jsdelivr.net/gh/NTLx/Pic@da3874f2a5dd13fa26ae2de691d8396f9ea32be3/wechat-articles/2026-10-25-the-code-is-the-graph-img-03-framework-design-code-trace.jpg)

所以“代码就是图”不是一句修辞。代码同时具备三件事：它能执行，类型检查器能读它，trace 还能把它还原成实际走过的路径。图可以表达同样的关系，但图本身不会跑；它要么被翻译成代码，要么被代码渲染出来。

## 把合并写出来

回到最初那个错觉。节点边界看起来像存档点，是因为串行的时候它确实是。并行把这个巧合打破了，而图库试图用 reducer 把这个巧合买回来。买回来的代价，是合并规则退出了类型系统。

代码没有让这道题消失。它把合并从库的注解里拿出来，放到你写的那一行；把快照从业务状态换成解释器状态或效果日志；durability 也跟着从节点边界挪到了你声明的外部调用。换来的是局部、可读、可审；代价是 evals、测试和 trace 要自己补上。

所以我现在看一个 agent 架构，会先问两个问题：它的效果边界画在哪，谁在检查合并。如果这两个问题没有答案，再漂亮的图也只是设计稿。

## 参考资料

- Samuel Colvin, [The code is the graph](https://pydantic.dev/articles/the-code-is-the-graph), Pydantic, 2026-10-13.
- [Pydantic Monty: you probably don't need a full sandbox](https://pydantic.dev/articles/pydantic-monty), Pydantic, 2026-02-27.
- [pydantic-graph Graph Builder 文档](https://pydantic.dev/docs/ai/graph/builder/).
- [Pydantic AI Harness: Dynamic Workflow](https://pydantic.dev/docs/ai/harness/dynamic-workflow/).
- [LangGraph Checkpointers 文档](https://docs.langchain.com/oss/python/langgraph/checkpointers).
- David Montague, [pydantic-ai issue #530 评论](https://github.com/pydantic/pydantic-ai/issues/530#issuecomment-3504609992), 2025-11-07.
- Prime Intellect, [Rewriting Prime Agent in Rust](https://www.primeintellect.ai/blog/prime-agent-rust), 2026-10-09.
- 站内旧文：[《代码不再是交付物，而是外骨骼》](https://ntlx.github.io/articles/code-as-agent-harness)、[《读 GitHub 的 80 万行 Rust 重写》](https://ntlx.github.io/articles/github-copilot-rust-runtime-rewrite).
