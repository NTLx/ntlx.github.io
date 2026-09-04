---
$schema: starlight
title: 购物 Agent 的护城河，不在模型里
description: 模型是会过期、会犯傻、会被替换的部件；Anthropic 这份蓝图真正想讲的，是藏在 agent 背后的那套纪律：评估、审批、记忆、上下文分层。谁先抄会这套，谁才可能不被下一轮模型迭代甩下去。
date: 2026-09-03
category: ai-agents
---

Anthropic 昨天（9 月 2 日）放出了两样东西：一份面向决策者的[发布公告](https://claude.com/blog/claude-for-commerce-agents)，和一个开源仓库 [commerce-agents](https://github.com/anthropics/commerce-agents)。公告里说，零售商给客户配了 Claude 购物助手之后，购物车平均涨了 35%，成交概率提升 60%。但真正值得工程师读的是同天发布的另一篇[《The Anatomy of Effective Commerce Agents》](https://claude.com/blog/the-anatomy-of-effective-commerce-agents)——我把两篇都读了，还把仓库代码翻了一遍。

先说结论：这份蓝图最值钱的地方，不是那个能帮你买东西的 Agent，而是藏在一堆工程细节背后的那套纪律。模型是可以每六个月换一代的零件，评估怎么写、审批怎么拦、记忆怎么存、上下文怎么排，这些才能穿越模型迭代沉淀下来。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-03-commerce-agents-blueprint-img-00-infographic-core-summary.png)

## 第一课：把“要用哪个模型”当成一道配置题

蓝图给自己的定位很明白：一个 shopping agent、一个 merchant agent，各带五个 skills，分别对应零售、旅行、通信、票务四个行业，跑在 Messages API、Agent SDK 和 Managed Agents 三种运行时上。这是“一套定义，多处运行”。

文档那句收尾让我印象深刻：模型继续变好，架构就用“一次配置变更加评估扫描”把它吸收进来，其它一切照旧。这句话看似轻描淡写，其实是全文最反直觉的主张：把模型当成可替换的配置项，而不是产品的核心。

这跟我们大多数人做 agent 的方式正好反过来。我们的习惯是“模型越强，agent 越强”，于是所有心思都花在挑最强模型、调最优 prompt 上。蓝图的回答是：模型和 prompt 都是会过期的，真正值得下注的是那些不会随模型换代而失效的机制。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-03-commerce-agents-blueprint-img-01-source-architecture.png)

## 第二课：subagent 是昂贵的奢侈品

蓝图里最让我停下来的一条是：能用 skills 解决，就别上 subagent。

原话大意是，电商对话是一个跨多个意图紧紧耦合在一起的单一会话，需要大量共享上下文。每次把对话交给 subagent，都是一次有损的状态交接——orchestrator 手上的购物车、用户偏好、对话历史都得重述一遍；交接本身就消耗数倍 token，还要加几秒延迟。域之间的边界也切不干净：一个退货流程，既要订单历史，又要当前购物车，还要商品目录。

对比之下，agent skills 是轻量级的多领域模块化机制：指令直接加载进那个已经持有全部历史的主 agent 里，不需要来回交接。Anthropic 说他们在几家企业部署里对比过，单 agent + skills 在质量上稳定优于“一个 prompt 管一切”和“每个域一个 subagent”两种设计，成本还更低。

但我读到这里是有保留的。这些对比来自 Anthropic 自己的部署，又是在自己家的框架里，说服力打折扣。而且“subagent 贵”这个结论，本质是“上下文转移贵”——如果哪天上下文窗口大得不用考虑容量，或者出现了廉价高效的跨 agent 状态同步，这个结论可能松动。

蓝图也没有否定 subagent 的一切：真正的深研究员（deep-research agent）这种窄而自包含的任务，orchestrator 把它当工具调用的场景，subagent 依然是正确的选择。判据不是“要不要用 subagent”，而是“这个任务需不需要整体转移会话所有权”。需要转移就走 handoff，不需要就用 skill。

## 第三课：UI 是工具，不是 prompt 的产物

购物 agent 的回复大多是 UI 组件——商品轮播、行程卡、座位图、图表——而不是大段 prose。这意味着 agent 要输出的是一份 schema，而不是文本。

很多团队一开始会用“让模型输出自定义 tag、前端解析”的偷懒方案。蓝图说这条路走不远：模型对自家 tag 的训练程度远不如对 tool call 的熟悉程度，嵌套组件一多，可靠性就崩；tag 定义塞在 system prompt 里，每加一个新组件 prompt 就膨胀一分；更麻烦的是，历史对话存成了只有自家 parser 能读的格式，回看聊天记录还要再解析一遍。

蓝图指了指另一条路：把每个 UI 组件做成一个工具。`present_products`、`present_itinerary`、`present_plan_comparison`，带类型参数。模型调工具，服务端校验补全、发事件，客户端渲染。因为组件本身就是一次 tool call，天然在 messages 数组里，回看旧对话不用重新解析。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-03-commerce-agents-blueprint-img-02-source-demo-retail.webp)

这是这个模式跑起来的样子：商品卡、对比、购物车都渲染在对话里，而不是让前端猜一段自定义 tag。

代价是流式粒度变粗：展示工具的参数包在服务端缓冲做校验，子组件要按块到达。想要 token 级流式可以开 `eager_input_streaming`，但也因此失去服务端 schema 保证。这都是取舍，不是免费的。

感知延迟是另一层取舍：购物响应动辄 500–700 个输出 token，不流式就是一个五秒的 spinner。对消费者面的应用，多等一秒，成交率可能就掉几个点。

## 第四课：记忆要住进系统，不能留在模型里

读第一遍时，我没觉得“记忆”这节特别重要——不就是一个“记住用户偏好”的功能吗。直到看见“记忆属于你的系统，不属于模型”这句话，我才意识到它说的是另一件事。

AI 的记忆和人的记忆有个关键差别：人在记忆里存了东西，知道自己存了；agent 不知道模型记住了它记住的东西。模型上下文一过期，记忆就从世界的客观事实，变成了模型猜的猜测。

蓝图的做法是把它做成三层系统：**存**进你自己的数据库（不是 markdown 配置文件），每种记忆是一个小类型记录——key、value、category、来自哪个 session；**写**是异步的——每轮对话结束后，一个独立线程去读对话，抽取、更新、删除记忆，完全不占主流程延迟，还不读 tool results（商品描述、评论不该变成用户记忆）；**读**分三层——高频事实常驻上下文，相关事实每轮预取，剩下的走个查找工具。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-03-commerce-agents-blueprint-img-03-source-memory-layers.png)

上图是异步提取的示意：对话会话在后台被抽成可查询的记忆事实，而不是把原始对话塞回模型上下文。

如果你同时读懂了蓝图里 prompt caching 那节，会发现记忆的三层读和缓存的 Global / Session / Volatile 三分段，是同一条纪律：把上下文按变化频率分层。常驻段尽量不动，会话段按用户稳定在同一位置，易变段（当前时间、当前页）永远放最末尾。缓存是按 token 价格优化这条纪律，记忆是按信息价值优化这条纪律，骨架是同一个。蓝图自己也承认，记忆数据要放在缓存断点之下，正好落在 Session 段里。

这套设计最反直觉的一点是：记忆提取不是 agent 自己做的。有人会问，为什么不让 agent 在对话中顺手记住？因为让模型自己决定“存什么”，它会在回答问题时被“要不要记一笔”这种决策干扰，反而漏掉真正重要的信息。异步抽取的效果是：不让抽取决策占用模型注意力，recall 还高了 13%。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-03-commerce-agents-blueprint-img-04-source-eval-snapshot.png)

## 第五课：评估是“快照”，不是“对话重放”

蓝图给出一个让我眼睛一亮的定义：API 是无状态的，所以 agent 的输出是 system prompt、工具集、消息数组的函数。这意味着任何一次对话能到达的状态，都可以直接构造出来。所以评估用例的做法是：构造测试状态，追加测试用户消息，让 agent 跑，给最终状态打分。

这跟我过去对 eval 的理解很不一样。我以前以为评估就是把真实的对话录像重放一遍：让 agent 重新走一遍，看答得对不对。蓝图的回答是别这么做：“给路径打分”的用例是脆弱的——同一个任务，agent 换个更好的工具顺序达成，就不该判它失败。

正确姿势是评快照：最终状态，加上渲染出来的回复，包括最后一次写操作的参数。对于安全关键的操作，比如“这笔交易到底成没成”，评最终状态反而更可靠。

另一个反直觉点：蓝图不推荐用“模拟用户 + judge 模型打分”的评估方式。两个非确定性系统互相作用，样本量要大、成本要高、失败还难归因。模拟用户评估只适合做两件事：发现覆盖缺口，和给 agent 做个大致的“体感检查”。发现了新用例，还是要写成快照。

## 最后一课：安全是硬编码，不是美德

蓝图对安全的处理是全文最硬核的地方，也是它跟很多“prompt 里写一段安全规则”的做法拉开距离的地方。安全不该靠模型自觉，要住进 harness 里。

四条规则，条条是硬编码。

第一条，**模型只能提议，不能执行**。下订单、退款、改价、发活动，这些动作模型一律不能直接做。消费者侧：checkout 工具只渲染购物车 + 一个下单按钮，后端接口根本没有 charge 方法。商家侧：每个写操作产生一个带服务端 ID 的 staged change，`apply_change` 只对经过真实表面（门户按钮、CLI 确认、平台审批）批准的 ID 生效。我特意翻了仓库代码验证：`StorefrontBackend` 确实没有任何收钱的方法，`apply_change` 确实要求 host approval。

第二条，**只接受服务端发过的 ID**。购物车只接受本会话内服务端返回过的商品 ID。幻觉出来的、用户粘贴的、藏在评论里的 ID，一律在到达后端前拒绝。这直接消灭了一整类提示注入，因为注入的最终目标往往就是“让模型操作某个 ID”。

第三条，**第三方内容全部消毒**。商品描述、评论、卖家消息、记忆，所有进入 agent 的上下文都是不可信输入，过一道 sanitizer：剥离控制字符和双向文本、移除模仿围栏标记的内容、化解模仿对话轮或工具调用的文本、限制大小。防止恶意商品页假扮成系统指令。仓库里 `fencing.py` 有一整张不可见字符黑名单，我读的时候确认了这件事是真的代码，不是宣传。

第四条，**限额按结果状态校验**。“每人限购 2 件”这种规则，如果按请求校验，agent 会说一次掺一个、连说三次“再加两件”。所以蓝图按“写入后的状态”校验，并给每个会话的写操作排队。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-03-commerce-agents-blueprint-img-05-source-merchant-approval.png)

最后这条对我震动最大：这也是为什么隐患多的场景，反而适合仔细设计 agent——你能把"人审"这个过程，从流程里的人情，变成代码里的约定。上面这张商家工作台就是审批的现场：agent 的每个建议（比如补货草稿、价格变动）都以待批准的变更存在，运营确认后才会应用到真实数据。

## 我们的下一步

这篇文章对很多团队其实是一份工具箱，可以直接抄。如果要我压缩成三件马上能做的事：

1. 你在给 agent 加工具的话，把 UI 组件做成 tool，而不是让它吐自定义 tag。一步到位，省掉未来的解析地狱。
2. 你在给 agent 加记忆的话，先决定好哪些该记、怎么抽、谁来读，而不是上来就塞一个 vector store。数据库 + 异步抽取 + 三层读取，已经够大多数场景用了。
3. 你在写 eval 的话，从“重放对话换一个打分”改为“评快照终点”。哪怕只是把用例从“给路径打分”改成“给成功/失败状态打分”，也是一大步。

我没法替所有团队回答“该不该用 subagent”——这取决于你的任务是否需要共享上下文。但如果你的 agent 正在做的是电商、金融、任何涉及真实金钱流动的事，蓝图这篇的安全设计，值得你完整读一遍。

你手上正在做的 agent，哪个环节最缺“硬编码的纪律”？

## 参考资料

- [Building effective agents — Anthropic](https://www.anthropic.com/engineering/building-effective-agents)
- [Agent Skills 官方文档 — Anthropic](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- [Writing tools for agents — Anthropic](https://www.anthropic.com/engineering/writing-tools-for-agents)
- [Demystifying evals for AI agents — Anthropic](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [anthropics/commerce-agents — 参考实现仓库](https://github.com/anthropics/commerce-agents)
- [Claude Model and Effort Levels in Claude Code — Anthropic](https://claude.com/blog/claude-model-and-effort-level-in-claude-code)
- [Parallel tool use 文档 — Anthropic](https://platform.claude.com/docs/en/agents-and-tools/tool-use/parallel-tool-use)

## 延伸阅读

- [Not the Model, You're the Harness](https://ntlx.github.io/articles/not-the-model-youre-the-harness)
- [Anthropic 这篇长跑 Agent harness 文章，讲透了交接制度](https://ntlx.github.io/articles/anthropic-long-running-agent-harness)
- [Anthropic 这篇 skills 文章，真正写的是组织接口](https://ntlx.github.io/articles/claude-code-skills-organizational-interface)
- [可信的评估，先学会拒绝你](https://ntlx.github.io/articles/ai-evals-you-can-trust)