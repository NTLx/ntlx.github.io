---
$schema: starlight
title: 读 Peter Sellis：AI 越能做，产品经理越要降低决策对协作的依赖
description: 读完 Peter Sellis 的长访谈，我更确信：AI 时代 PM 的稀缺价值正在从组织协作转向决策压缩、明确授权与主动做减法。
date: 2026-09-21
category: ai-agents
primarySourceUrls: ["https://www.lennysnewsletter.com/p/90-minutes-of-unfiltered-product?showTranscript=true"]
---

Peter Sellis 这期访谈，最容易让人记住的是那些刺耳的句子。

他把理想团队类比成极端组织，说很多协作并不划算，也直言自己会不断给最强的人加责任。把这些句子单独截出来，当然很适合传播。但完整听下来，我真正想带走的反而不是这些“反常识”。

我更在意它们背后的同一个问题：**一个团队怎样才能在不反复同步的情况下，仍然做出方向一致的产品决策？**

这对今天的 AI 产品团队尤其重要。代码、设计稿、数据分析、竞品研究，越来越多环节都可以交给模型和 Agent。过去很多想法会因为实现太贵而自然消失，现在它们会以更低的成本变成一个“已经能跑”的原型。

瓶颈也随之变了。

产品经理最稀缺的价值，不再只是把事情做出来，而是让更多好决策**不必依赖更多协作才能发生**。

![Core Product Value、决策权、AI 候选与删除权的决策压缩关系](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-21-peter-sellis-product-judgment-img-00-infographic-core-summary.png)

## 真正值得带走的，不是“少协作”

Sellis 说，协作有一个经常被忽视的成本：协调会让系统越来越依赖最慢的节点。

但如果把这句话理解成“少开会”“少沟通”，结论就太廉价了。复杂产品不可能靠互相不说话来提高质量。安全、合规、医疗、基础设施变更，很多时候就是应该让更多角色进入决策。

他后面给出的前提更完整。

第一，团队要对“为什么做这件事”有高度一致的理解。第二，每个人要清楚谁可以独立决定什么。

这两件事缺一不可。

只有使命，没有决策权，团队还是会不断向上请示。只有授权，没有共同判断，得到的只是更快的分叉。

我更愿意把 Sellis 的观点换一种说法：

**减少的不是协作本身，而是一个决定对同步协作的依赖。**

我之前写 [Grok Bot 的开发复盘](https://ntlx.github.io/articles/grok-bot-one-month) 时，把速度问题归结为“把决定压到离证据最近的地方”。这次读 Sellis，我觉得还可以再往前推一层：证据即使已经到了决策者手里，如果每次都要重新解释战略、重新争取授权，决策回路仍然不会短。

真正决定组织速度的，是证据、判断标准和决策权能不能在同一个位置会合。

## Core Product Value 不是口号，是一种决策压缩

访谈里我最喜欢的部分，是 Sellis 讲 Snap 和 Discord 的 Core Product Value。

他回忆，Snap 当时会用一句很短的话描述核心产品价值：让用户尽可能快地把一个瞬间分享给自己在乎的人。Discord 则围绕朋友在玩游戏之前、过程中和之后的交流与陪伴来定义核心价值。

句子写得好不好，反而不是重点。

Sellis 特别强调，Core Product Value 必须同时存在两层：一层是人能记住的概念表达，另一层是可以被产品、工程和数据实际使用的指标。如果只有指标，它对人没有意义；如果只有一句漂亮的话，它又无法进入日常决策。

我更愿意把它理解得工程化一点：**Core Product Value 是组织里的“决策压缩格式”。**

一份完整战略可能有几十页。创始人的产品直觉可能来自多年经验。团队不可能在每个局部决策里重新加载全部上下文。

真正有用的 CPV，是把这些复杂背景压缩成一个足够短、又没有丢掉关键约束的判断接口：

![Core Product Value 把完整战略压缩成可调用的局部判断](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-21-peter-sellis-product-judgment-img-01-framework-cpv-local-judgment.png)

这个功能让核心体验更快了吗？

它让真正重要的用户关系更强了吗？

它改善的是核心行为，还是只是给产品多加了一块表面面积？

压缩得好，团队可以在局部独立判断。压缩得不好，所谓“战略共识”最后还是要靠会议恢复上下文。

Sellis 说自己曾连续七年给 Snap 的新员工讲同一套 CPV onboarding。这个细节让我印象很深。真正能降低协作成本的共同语言，不是写进一次战略会的 PPT，而是要反复进入组织记忆。

## 决策权不是放权，而是一套接口设计

“让团队自主”也是一句很容易正确、很难落地的话。

Sellis 的表达更具体：需要明确谁被信任做哪类决定。对我来说，这比“扁平化”“充分授权”之类的描述有用得多。

因为产品组织真正需要设计的不是权力姿态，而是**决策接口**。

哪些决定可以直接做？

哪些决定需要补充证据？

哪些决定必须升级？

什么情况下，原来的授权自动失效？

这其实和设计 Agent 权限很像。一个 Agent 是否高效，不取决于它能调用多少工具，而取决于权限边界是否清晰：低风险、可逆的动作可以自主完成；高风险、不可逆的动作需要升级；执行结果必须可观察，失败必须能被发现。

![决策权接口区分自主执行、补充证据与升级](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-21-peter-sellis-product-judgment-img-02-comparison-decision-rights-boundary.png)

人的组织也一样。

“减少协作”只有在决策边界、证据通道和反馈机制都清楚时才会变成速度。否则它只是让个人拍板更快地放大错误。

这也是我不会照搬 Sellis 那些强硬管理表达的原因。给优秀的人更多决策空间，和把优秀的人“压到极限”，不是一回事。前者是在减少不必要的依赖，后者可能只是在透支组织。

## AI 越会加东西，产品经理越要有删除权

访谈里另一个很有意思的比喻，是 museum curator。

Sellis 说，如果一个博物馆把全部藏品都挂在墙上，那策展人其实什么也没做。真正能体现品味的，不只是你做出了什么，还包括那些已经做出来、甚至你自己很喜欢，却最终没有发布的东西。

这个判断放到 AI 时代，突然变得非常具体。

过去，很多普通想法会死在实现成本上。工程资源不够、设计排期太长、验证太贵，天然形成了一层过滤器。

现在这层过滤器正在快速变薄。

一个功能可以在一天里出现几个可用版本。一个 Agent 可以同时生成多条方案。设计和实现都越来越容易说“要不先做出来看看”。

但用户的注意力没有变多。

产品的认知负荷没有免费。

维护成本也不会因为代码是模型写的就自动消失。

所以 AI 带来的一个反直觉结果可能是：**“能做什么”越来越不值钱，“什么不做”越来越值钱。**

这也是我现在更愿意如何定义产品 taste：不是玄学式的审美，而是面对大量“其实都不错”的候选方案，仍然能施加稀缺性约束。

删除一个已经能工作的功能。

停止一个数据暂时还不错、但正在偏离核心的方向。

拒绝为了展示 AI 能力而给产品增加一个新的入口。

这些决定都比“再做一个版本”更难，因为它们需要产品经理承担机会成本，也需要有足够清楚的核心判断来解释为什么不做。

## 我不会照单全收，但会留下四个检查项

这期访谈里有些观点，我并不认同把它们普遍化。

“中位数 PM 很差”是 Sellis 自己的一套推演，不是一个被证明的行业事实。把最强的人不断推到极限，也不是健康组织的默认管理方法。访谈后段关于身份属性与消费产品能力的判断，我同样不会把它转成招聘原则。

但这些争议并不影响前面那套机制的价值。

如果把那些最刺耳的表达拿掉，我最后留下的是四个很朴素的检查项：

1. **能不能用一句话说清 Core Product Value？** 这句话是否还能继续拆到真正影响核心行为的指标，而不是停在品牌口号。
2. **哪些日常产品决定其实不需要升级？** 如果每次都必须等负责人拍板，问题可能不是人不够主动，而是决策接口没有设计好。
3. **有没有一份真正的“不做清单”？** 不只是 backlog 里暂时没排期的东西，而是团队已经理解、甚至做过原型，但主动决定不进入产品的方案。
4. **AI 最近给产品增加了什么复杂度？** 如果一个能力存在的主要理由只是“现在能做了”，它就应该被重新审视。

我越来越觉得，AI 对产品经理最大的改变不是让 PM 也学会写代码。

它正在拿走“实现困难”这层天然过滤器。

以前，产品组织要努力扩大自己的能力边界；接下来，可能还要学会主动重新制造边界。

模型和 Agent 会不断告诉我们还能做什么。

产品经理更重要的工作，是让团队知道：**我们为什么做这个，以及为什么那些同样能做的东西，今天仍然选择不做。**

## 参考资料

- [90 minutes of unfiltered product advice from Snap and Discord’s product chief | Peter Sellis](https://www.lennysnewsletter.com/p/90-minutes-of-unfiltered-product?showTranscript=true)
- [Snap 2021 Investor Day](https://investor.snap.com/events-and-presentations/Snap-2021-Investor-Day/)
- [Our Quest to Support Game Developers on Discord](https://discord.com/blog/our-quest-to-support-game-developers)
- [Checkpoint Reached: New Updates on our Quest to Connect More Game Developers with Players](https://discord.com/blog/updates-on-our-quest-to-connect-more-game-developers-with-players)
- [Ads in ChatGPT: The Basics](https://help.openai.com/en/articles/20001207)
- [把决定压到离证据最近的地方：Grok Bot 的七周是怎么省出来的](https://ntlx.github.io/articles/grok-bot-one-month)
