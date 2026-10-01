---
$schema: starlight
title: OpenAI 没训练新模型，Decisions API 暴露了 Agent Runtime 的新分层
description: DevDay 更值得看的，是 Agent 的智能开始被拆到模型、快速决策层、harness 和应用边界里。
date: 2026-10-02
category: ai-agents
primarySourceUrls: ["https://www.latent.space/p/devday-2026"]
---

这期 Latent.Space 的标题很抓人：OpenAI 为什么能这么快做出一个 Jev competitor？

我点进去时，也以为重点会落在速度、benchmark，或者 OpenAI 到底花了多久追上 TypeSafe。

结果最让我在意的是 Nikunj Handa 的一句话：他们没有为 Decisions API 重新训练一个模型，第一版就是建立在 Luna 权重之上。

我觉得这比“一周”这个数字重要。

因为它意味着，同一种产品形态未必对应同一种模型架构。TypeSafe 为快速结构化决策单独做 Jev；OpenAI 则先拿通用模型，加上 structured outputs、并行推理和 inference stack 优化，把一个新的决策接口做出来。

再回头看前半场的 Computer Use，我才意识到两段访谈其实接在一起：Agent 正在从一个模型，变成一套分层运行时。

![Agent 正在变成分层运行时：开放推理、快速决策、Harness 与应用责任边界](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-01-openai-devday-agent-runtime-layers-img-00-infographic-core-summary.png)

## Computer Use 已经不是“模型会不会点鼠标”

Ari Weinstein 回顾近期变化时，讲得很具体。

以前的模型经常能顺利开始一个任务，真正麻烦的是中途出错。现在它们更会 debugging，也更会重试。执行方式本身也变了：模型可以看 screenshot，可以读 accessibility 信息，可以用 Playwright，还可以直接写代码完成一部分操作。

这已经和我以前理解的 Computer Use 不太一样。

早期那套思路很容易被简化成“看一张图，算一个坐标，点一下，再截图”。如果模型看错了、页面滚偏了、按钮位置变了，后面整条链都会跟着出问题。

现在更像是让 Agent 同时拥有几种看界面、动手操作的方法。

网页能拿到 DOM，就没有必要只盯着像素猜按钮；accessibility tree 能直接暴露控件语义，就没必要从截图里重新识别一遍；适合写代码时，让 Playwright 或别的程序化工具去做，也比一步步模拟鼠标更自然。

这其实和我之前写 [《Not the Model, You're the Harness》](https://ntlx.github.io/articles/not-the-model-youre-the-harness) 时的判断是连续的：模型能力很重要，但一个 Agent 最后能不能稳定把事情做完，越来越取决于外围系统给它什么表示、什么工具，以及失败以后怎样回来继续。

只是这次又往前走了一步。

harness 不再只是“给模型包一层工具调用”。它开始决定模型到底应该看什么、用哪种方式操作、什么时候等待、什么时候重试。

Ari 还提到一个我很喜欢的用法：让 Agent 自己测试刚刚生成的软件。

这个用法听起来普通，实际却会改变工作流。过去 coding agent 写完代码以后，人经常自动变成 QA。现在 computer use 可以把 build、运行、观察、修改、验证继续接在同一个回路里。

这和我之前在 [《OpenAI 的软件工厂：让 Agent 对一条变更负责到底》](https://ntlx.github.io/articles/openai-agentic-software-factory) 里关注的方向是同一个问题：真正完整的自动化，不是把“写代码”这一小段做掉，而是让 Agent 对结果负责到验证结束。

## Decisions API 让我第一次明确看到“快速决策层”

如果只看产品说明，Decisions API 很容易被理解成一个更快的分类接口。

但放在 Jev 后面看，它更有意思。

TypeSafe 对 Jev 的设计很明确：不让它自由生成长文本，而是把问题收窄成 typed probabilistic decisions。你给它状态和候选，它返回结构化选择、概率或置信度。很多 routing、classification、policy choice，本来就不需要启动一次完整的开放式生成。

OpenAI 的路径不一样。

Nikunj 在访谈里直接说，Decisions API 第一版没有重新训练新模型，而是建立在 Luna 上，通过结构化输出、并行处理多个问题和推理栈优化，把延迟压下来。

摆在眼前的是两条不同路线。

一条是 Jev：为了这一类决策工作负载，单独做一个 System One Model。

另一条是 OpenAI：先保留通用模型，再通过 inference 和 runtime specialization，把其中一部分能力切成更快的决策接口。

我现在不想判断哪一条最后会赢。

本文写作时，Decisions API 还处于 limited preview。公开出来的早期对比也并不一致：换一组任务，Jev 和 Decisions API 的速度、准确率排序就可能变化。这个阶段拿少量测试做总冠军榜，意义不大。

但我已经会把低延迟、结构化判断当成一个需要单独设计的系统层，而不是“顺手再调一次 LLM”。

过去做 Agent，很多人默认所有需要一点“智能”的地方都扔给同一个大模型。

该不该调用工具？问大模型。

任务应该路由给谁？问大模型。

这条结果算不算通过？再问一次大模型。

能跑当然可以。但当 Agent 真的开始高频运行，这种设计会越来越笨重。完整推理的 latency、成本和上下文开销都会累积。

Jev 和 Decisions API 让我开始换一种方式画 Agent：开放推理交给强模型，窄决策走快路径，确定性部分继续留给普通代码。模型仍然重要，但它不必包办所有判断。

## Agents API 开始把 harness 变成平台本身

如果只有 Computer Use 和 Decisions API，我可能还会把它们看成两个独立产品方向。

Agents API 把这两条线连了起来。

OpenAI 已把 Agents API 推到 public beta，并直接把它描述成由 OpenAI 托管的 Codex harness。当前文档里，平台已经开始承接 session、orchestration、context compaction、recovery 这些长期 Agent 才会遇到的问题。

我在意的不是又多了一个 SDK，而是责任边界变了。

以前我们说 harness，通常默认它是应用自己的工程。

你自己决定怎么塞 context，怎么调工具，什么时候 compact，失败以后怎么恢复，subagent 怎么起，sandbox 怎么给，状态怎么存。

现在模型平台开始往上吃这一层。

这些能力为什么会同时出现，也就解释得通了。Agent 跑得更久，同步请求就越来越别扭，于是需要 async tool calling 和 WebSockets；上下文不断累积，就需要 prompt cache 和 compaction；能操作真实软件以后，又会碰到 browser session、权限批准、登录和结果验证。

单独看，它们都是功能。放在一起，才像一套 runtime。

我之前写过 compaction，也写过 harness，当时更多是在讨论“应用应该怎样把模型用好”。这次 DevDay 给我的新信息是：模型厂商自己也在把这些经验产品化，而且越来越不满足于只提供一个模型 endpoint。

它们开始提供“怎么让这个 Agent 活着”的基础设施。

## Cache 和 Compaction 让我看到这套 runtime 的真实成本

Nikunj 后面谈 prompt caching 和 prewarming 时，我觉得这部分很容易被发布会的大功能淹没。

但对长期 Agent 来说，这反而很现实。

一个持续存在的线程，如果每次都把同样的 instructions、tools 和 reference material 从头重新算一遍，成本和首 token 延迟都会很难看。Cache 的价值就是让稳定前缀尽量复用。

问题是，线程总会变长。

这时又需要 compaction 把旧上下文压缩成可以继续运行的状态。OpenAI 的当前文档甚至明确提醒：compaction 会降低一部分 cache reuse。

这就是很普通、也很麻烦的工程权衡。

你很难把某个指标单独优化到底。

想让上下文永远完整，就会越来越贵、越来越慢；想一直保持 cache 命中，又不能随意重写前缀；想把历史压紧，就会牺牲一部分缓存连续性。

所以我现在更愿意把 context management 看成 runtime economics，而不是“模型记忆力不够”的补丁。

同样的事情也发生在 Computer Use。模型越快，真正的瓶颈反而可能变成网页加载、客服回复、外部软件本身的响应时间。到了这里，继续堆模型能力并不能线性解决问题，事件驱动、异步等待、并行子任务都会变得更重要。

到了这一步，问题又回到了系统工程。

## 平台可以接管 harness，但不能替应用接管责任

我认可 OpenAI 把 harness 做成平台能力这个方向。

很多团队确实没有必要自己重新实现 session recovery、context compaction、browser runtime 或多 Agent orchestration。平台如果能把这些做成可靠基础设施，开发者当然可以少维护很多东西。

但这里也有一个边界。

Computer Use 越强，这个边界越不能模糊。

访谈里主持人提到让 Agent 配 DNS、付款、和客服来回沟通。这些案例很能说明 Computer Use 已经走到了哪里，但我不会把它们理解成“现在可以放心 YOLO”。

OpenAI 自己的文档仍然要求应用处理网站访问批准、登录、结果验证等环节。

这和我最近写 [《从工作台到沙箱：Agent 的自主性需要可见边界》](https://ntlx.github.io/articles/claude-code-agent-visible-boundaries) 时得到的结论一致：真正应该交给平台的是通用运行时能力，真正不能含糊的是业务权限、数据边界和最终验收。

平台可以帮我管理一个 browser session。

但这个 Agent 能不能进财务系统、能不能付钱、能不能修改生产 DNS、什么结果算完成，仍然必须由应用定义。

听完整期以后，我对这条边界反而比对任何单个发布都更在意。

以前我会把 Agent 架构画成“一个强模型，外面包一圈工具”。

现在我更愿意把它画成几层：最上面是开放推理，中间可能有越来越多专用的快速决策路径，下面是一套负责工具、上下文、恢复和环境的 harness，最外面才是应用自己的权限、数据和业务状态。

这套分层最后会不会稳定下来，我不知道。

Decisions API 还很早，Jev 也还很早。今天看到的产品名字和边界，之后完全可能继续变化。

至少在这次 DevDay 之后，我会多看一层：除了比较模型本身，也要看谁能把整套 runtime 组织得更好。

## 参考资料

- [Why Dwarkesh is Wrong about Computer Use + How OpenAI shipped its Jev competitor in 1 Week — Latent.Space](https://www.latent.space/p/devday-2026)
- [OpenAI DevDay 2026 recap — OpenAI](https://openai.com/index/devday-2026-recap/)
- [Introducing the Agents API — OpenAI](https://openai.com/index/introducing-the-agents-api/)
- [Agents API overview — OpenAI Developers](https://developers.openai.com/api/docs/guides/agents-api/overview)
- [Computer use in the Agents API — OpenAI Developers](https://developers.openai.com/api/docs/guides/agents-api/tools/computer-use)
- [Computer use — OpenAI Developers](https://developers.openai.com/api/docs/guides/tools-computer-use)
- [Prompt caching — OpenAI Developers](https://developers.openai.com/api/docs/guides/prompt-caching)
- [Compaction — OpenAI Developers](https://developers.openai.com/api/docs/guides/compaction)
- [Introducing System One Models and Jev — TypeSafe AI](https://typesafe.ai/blog/introducing-system-one-models-and-jev)
