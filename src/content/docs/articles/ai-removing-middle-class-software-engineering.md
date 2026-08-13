---
$schema: starlight
title: 当 AI 撤掉“速度限管”：为什么中产软件工程师正在加速沦为团队负债？
description: AI 移除了敲代码的速度门槛，却让复杂性守恒定律发挥到极致。实现变得极便宜，判断力成本却飙升——缺乏架构审美的中级工程师，正从增量资产加速沦为高昂负债。
date: 2026-08-13
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-13-ai-removing-middle-class-software-engineering-img-00-infographic-core-summary.png)

你可能也经历过这种令人窒息的周一晨会。

泡好一杯咖啡，打开电脑准备开始工作，你的 GitHub 审查列表中赫然挂着 7 个待 Review 的 PR。你顺手点开第一个，变更行数写着：`+24506 -3938`，下面附带了一段显然是用 LLM 一键生成的“变更摘要”。你的同事从上周五下午到周一早上生成的代码量，比过去全组休假两周攒下的总和还要多。

你顺着几处怪异的数据流向往下看，觉得逻辑非常反直觉，于是给提交 PR 的同事发了个消息：“为什么这里要把订单表重新反范式化，还顺便引入了一个 Kafka 队列？”

几秒钟后，他给你抛来一个网址——不是系统设计文档，也不是 RFC 提案，而是一个 Claude 的聊天对话链接：“具体决策逻辑好像在这个对话的第 15 轮，Claude 建议我这么搞，你可以全看一遍。”

这段荒谬的对话，出处是 Florian Herrengt 最近发布的一篇引发圈内轰动的文章《AI is removing the middle class of software engineering》。这篇文章就像一把手术刀，切中了当下所有工程团队最隐秘的焦虑：**AI 并没有消灭程序员，但它正在彻底清除软件工程中的“中产阶级”。**

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-13-ai-removing-middle-class-software-engineering-img-01-pr_overload_review_bottleneck.png)

## AI 没有消除复杂性，它只是撤掉了敲代码的“速度限管”

在过去的软件工程范式里，写代码是有物理速度限制的。

一个工程师要把想法变成实际运行的代码，必须经历想清楚逻辑、推演数据结构、逐行敲下代码、补全单元测试的完整链路。这个过程固然漫长，但它客观上形成了一道“天然防火墙”：**慢，意味着糟糕的架构决策在扩散前有足够的时间被拦截。**

但现在，AI 彻底撤掉了这道“速度限管”（Speed Limit）。

正如 Florian 在文章中所写，过去大家想要加个新模块，必须坐在一起讨论半天；现在，任何人只要对 Agent 狂喂几小时 Prompt，就能直接甩出一个上万行的 PR。

绝大部分人误以为“更快地产出代码 = 更高的研发效率”，却忽视了软件工程中一条铁律——**复杂性守恒定律**。系统内部的状态转换、并发边界和数据一致性要求，不会因为你的 Prompt 变长而减少一分一毫。

当敲代码的物理成本降为零，所有的瓶颈瞬间转移到了审查（Review）和验证（Verification）上。在之前探讨[《Codex 突破千万周活的背后：当代码变成隐形燃料，AI 的终局是消解“程序员”》](https://ntlx.github.io/articles/codex-10m-users-chatgpt-work)时我就提到过，当代码变成无限供给的隐形燃料，代码本身的稀缺性就荡然无存了。

如果团队缺乏严密的工程防线，AI 就会化身为垃圾代码的增频放大器——它不是在帮大家解决问题，而是在以 100 倍的速度把未经验证的复杂性塞进代码库。

## 从“无主架构”到“不对称重构”：你以为在提高产出，其实在积累毁灭性债务

最令人警惕的，是 Florian 提到的“Claude 对话链接当设计文档”现象。这本质上是在制造一种可怕的**“无主架构”（No-owner Architecture）**。

在传统的软件开发中，架构师或 Senior 工程师对数据流向拥有绝对掌控。而在 AI 主导的补全和生成中，决策链条变成了：概率模型给出建议 -> 开发者似懂非懂地接受 -> 模型道歉并修改 -> 开发者继续追加 Prompt -> 生成 25000 行包含过度抽象的代码。

最终，代码库里充满了无人能懂的黑盒。当系统在生产环境爆出偶发性 Bug 时，开发者甚至无法回答“数据究竟是从哪张表流过来的”，只能寄希望于继续让 Claude 帮你“猜 Bug”。

更致命的是，**AI 生成坏决策与人类修复坏决策之间存在着巨大的“速度不对称性”**。

- 让 LLM 给你随手新建 5 张数据库表、拆出两个无状态微服务，只需要 **10 分钟**；
- 但一旦这些表落了线上付费用户的数据，你要在不中断服务、不产生孤立外键的前提下设计数据 Migration 方案并清理冗余字段，需要顶级工程师精密的脑力手术，耗时 **数周甚至数月**。

当你刚清理完一个坏决策，又有 5 个带着新增冗余抽象的 PR 被合并进了主干。Simon Willison 在点评这篇文章时也强调，这种由 AI 滋生的“认知债务”（Cognitive Debt）累积到一定程度，整套系统的维护成本就会彻底超越重构成本。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-13-ai-removing-middle-class-software-engineering-img-02-claude_chat_no_owner_architecture.png)

## 薪酬两极分化与阶层挤压：为什么“坏工程师”在 AI 时代变得无比昂贵

这也直接揭示了为什么软件工程的“中产阶级”正在被加速抹去。

长期以来，软件工程师群体中存在大量处于中间层（Middle Class）的开发者——他们并不擅长系统架构设计或复杂的边界权衡，但能够熟练地把产品经理的 Spec 转化为合格的 CRUD 代码。在过去，这部分人力是各大科技公司招聘的主力军。

但在 AI 经济学下，这个中间层的生存空间被急剧压缩：

1. **顶尖工程师获得无限杠杆**：拥有强大架构审美和判断力的工程师，借助 AI Agent 能以一当十。他们不仅能快速实现想法，更重要的是能一眼看穿 AI 生成代码中的漏洞与过度设计，始终把系统复杂度压制在合理区间。
2. **缺乏判断力的工程师沦为昂贵负债**：那些缺乏底层工程理解、只会盲目将 Prompt 转化为代码的“氛围编码者”（Vibe Coder），在过去最多只是产出慢一点；而在今天，他们一天产生的废弃代码和认知债务，需要资深工程师花几个月去收拾残局。招聘他们的综合成本反而比过去昂贵得多。

在 Hacker News 关于该文的热烈讨论中，有条高赞评论说得很扎实：*“代码编写从来只占工程师核心价值的 5%，剩下的 95% 是理解问题与设计边界。”* 

当 AI 将那 5% 的机械劳动压缩至忽略不计时，原本靠这 5% 技能存活的中产工程师自然失去了护城河。我们在[《Subagent 不是运行加速器，而是主控 Working Memory 的防火墙》](https://ntlx.github.io/articles/orchestrator-tax-working-memory)中也曾验证过类似的结论：不论是 Agent 的上下文治理还是团队的工程管理，没有严密的防火墙与边界管控，吞吐量的盲目提升只会加速溃败。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-13-ai-removing-middle-class-software-engineering-img-03-asymmetric_refactoring_cost_curve.png)

## 防线前置与能力重构：如何在 AI 洪流中守住你的工程护城河

面对这场不可逆的工程范式迭代，无论你是团队管理者还是个人开发者，都必须意识到：**过去的评价体系彻底失效了。**

要避免团队陷入“AI 乱写 -> 人类灭火 -> 越干越累”的恶性循环，我们需要在研发流程和个人能力上完成关键转型：

- **审慎的拒绝权高于盲目的生成力**：团队应该把审查门槛从“这段代码能不能跑通”提高到“这个新引入的抽象是否不可替代”。面对动辄数千行的 AI PR，审查者的第一反应应当是拒绝并要求拆分，而不是妥协合并。
- **架构决策的前置与硬性约束**：严禁将 LLM 的漫长 Chat 记录当作设计规范。在让 Agent 吐出代码前，数据模型、API 契约和模块边界必须由具备判断力的人类工程师（或强规则验证器）明确定义。
- **个人能力的升维：从写实现者变为“代码审计员”与“边界设计者”**：不要满足于做一个能用 Cursor 快速拼凑功能的 Prompt 搬运工。多去钻研底层数据流、分布式一致性、高并发架构和重构模式——这些需要极高确定性推理与风险权衡的领域，才是你在 AI 时代最坚固的护城河。

AI 移除了敲代码的限制，但也把真正的工程实力赤裸裸地暴露在了阳光下。未来依然属于工程师，但只属于那些懂得到底该在何时对 AI 产生的代码说“不”的人。

---

*你在日常开发或 Team Review 中，是否也遇到过“上万行 AI 变更 PR”或者“用 LLM 聊天记录替代架构设计”的奇葩经历？你认为中级工程师该如何跨越 AI 带来的判断力壁垒？欢迎在评论区分享你的看法。*

## 延伸阅读

- [Codex 突破千万周活的背后：当代码变成隐形燃料，AI 的终局是消解“程序员”](https://ntlx.github.io/articles/codex-10m-users-chatgpt-work)
- [Subagent 不是运行加速器，而是主控 Working Memory 的防火墙](https://ntlx.github.io/articles/orchestrator-tax-working-memory)

## 参考资料

- [Florian Herrengt: AI is removing the middle class of software engineering](https://blog.florianherrengt.com/ai-removing-middle-class-software-engineering.html)
- [Florian Herrengt: The vibe coder career path is doomed](https://blog.florianherrengt.com/vibe-coder-career-path.html)
- [Hacker News Discussion on "AI is removing the middle class of software engineering"](https://news.ycombinator.com/item?id=49271994)
- [Simon Willison's Weblog: AI is removing the middle class of software engineering](https://simonwillison.net/2026/Aug/12/ai-removing-middle-class-software-engineering/)
