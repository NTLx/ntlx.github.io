---
$schema: starlight
title: 当疲惫变成一个可以画完的圆圈
description: 用户能改参数，不等于能改「什么算一个东西」。Apple 与 Stanford 的这篇论文用 8 个人、一周的探针实验，展示了授权发生在哪一层，决定了哪些边界可协商。
date: 2026-10-21
category: engineering
primarySourceUrls: ["https://machinelearning.apple.com/research/ontological-boundary-negotiation", "https://arxiv.org/abs/2608.24058"]
---

研究进行到第三天，P1 把「walk」拆成了两条。

一条叫「chill walk」，知道要去哪，慢慢走；另一条叫「search walk」，在找地址。前一天，P1 还以为自己只追踪了一件事。

这个动作很小。它只是把一条时间线上的标签，改成了两条。

但它让我停下来：一个人要先把「散步」画成一条边界，才有可能发现这条边界画错了。系统没有替 P1 决定「散步是什么」，只是给了一支笔和一张时间线。

这支笔并不免费。

论文把这类时刻叫「本体边界的协商」。这里的「本体」指的是系统默认的「什么算一个东西、什么可以被谈论」。它和哲学课上的存在论不是一回事。个人感知系统必须先画边界才能工作：什么算压力，什么算疲劳，什么算信号，什么算一个人。画完以后，这些边界通常藏进界面，变成理所当然的背景。

Apple 和 Stanford 的研究者想知道：如果把画边界的笔交给用户，这些边界会不会被重新打开？他们做了两个 App。EventMarker 从生活经验出发：你先说自己想理解什么，疲惫、暴食、和某个人相处，发生时在时间线上打一个点；系统再回头在传感器数据里找相关模式。PatternFinder 从信号出发：你先看心率、活动能量的曲线，框出一段让你好奇的波形，再把它命名成一个事件。

八位参与者，每人用一个 App，持续一周。数据、访谈、每天的问卷都被收集起来，研究者再从中寻找边界被移动的瞬间。模型并没有真的在端上训练：参与者被告知，数据会在研究结束后才用于训练。他们看到的是一个模拟的进度环。

结果比「用户自己做主就会更自由」复杂得多。

![核心信息图：用户授权的四个深度层级，以及三个把边界重新关上的设计装置](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-21-ontological-boundary-negotiation-img-00-infographic-core-summary.png)

## 一个圆圈，把边界变成了任务

每个类别旁边都有一个进度环。它本意是模拟模型训练：每标一次，圆环前进一点，像模型正在学会你定义的东西。参与者不知道的是，进度是随机给的，每次 -5、0、+5 或 +10 分；数字要等到 30% 之后才显示。

![原论文 Figure 3：类别列表与每个类别旁的进度环（Haghighi et al., arXiv 2608.24058）](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-21-ontological-boundary-negotiation-img-source-fig3-categories.png)

这个设计想留一点模糊，让用户自己想象「训练」意味着什么。但它实际制造了另一种东西：一个可以画完的圈。

没有人把任何一个类别画到 100%。三位参与者说，没能把圈画完让他们感到「sad」；P7 觉得一周「too short」，如果有更多时间，至少能把一个类别做到 100%。研究者写道，进度环无意中给了每个类别一个「可完成」的形状，让边界看起来可以被完成；这种完成感像他们熟悉的游戏化，成了让人想要到达的状态，也可能因此关掉了继续实验的念头。

我读到这里时，更在意一个日常的问题：界面上的一个小部件，怎样替用户回答了一个本体问题。

「疲惫」本来不是一个有终点的任务。P3 在 EventMarker 里建了一个叫「feel exhausted」的类别，定义是「隐约觉得累」。标了一周，P3 发现自己其实把两种东西压在了一起：精神上的疲惫，和身体上的疲惫。「我可以精神上累，但身体不累；也可以身体累，但精神不累。」P3 没有拆分类别。但这个发现本身，已经是边界在松动。

进度环却在说另一件事：边界是一个可以完成的对象。你标得够多，它就满了；满了，事情就结束了。这个隐喻和「疲惫」的经验并不相容，但界面已经替参与者做了决定。

## 从哪一层开始画，决定了什么能被看见

两个 App 的差别，不只是「一个打点、一个框曲线」。

EventMarker 从生活经验开始。参与者先碰到「我想理解什么」，再去找数据。PatternFinder 从信号开始。参与者先看到一条曲线，再把它翻译成一个事件。研究者认为，这个起点差异，影响了哪些边界会进入视野。

![原论文 Figure 1：EventMarker 从生活时间线打点开始的交互流程（Haghighi et al., arXiv 2608.24058）](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-21-ontological-boundary-negotiation-img-source-fig1-eventmarker-flow.png)

![原论文 Figure 2：PatternFinder 从生理信号曲线框选模式的交互流程（Haghighi et al., arXiv 2608.24058）](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-21-ontological-boundary-negotiation-img-source-fig2-patternfinder-flow.png)

最明显的证据是类别本身。PatternFinder 的四位参与者里，没有人创建「状态/感受」或「非故意事件」的类别；EventMarker 这边，P3 会建「feel exhausted」，P2 会建「moods」。论文给了一个谨慎的解释：这类现象的边界本来就更模糊，不如「跑步」那样有清楚的开始和结束；当界面从清晰的信号出发，模糊的现象就很难被看见。

![原论文 Figure 6：EventMarker 参与者创建了 activity/event/state 类别，PatternFinder 参与者只有 activity/pattern（Haghighi et al., arXiv 2608.24058）](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-21-ontological-boundary-negotiation-img-source-fig6-category-creation.png)

这个解释没有被控制实验证明，论文自己也用了「could be because」。但它值得记住。我们常把「可自定义」当成授权的深度：能改名字、能调阈值、能加颜色，好像用户就有了权力。可如果自定义的起点仍然是系统选好的那一层，用户改的只是边界里面的参数，不是边界本身。

P1 的例子是另一面。P1 拆开「walk」的时候，依据的是自己的生活经验：知道目的地的走，和找地址的走，是两件事。这个区分来自经验，曲线里没有。只有当参与者被允许从「经验」这一层开始定义，这个边界才浮出来。

所以「给用户一支笔」只完成了一半授权。问题在于：笔落在哪一层纸上。

## 被追踪的从来不只是一个人

论文里还有一类时刻，边界被挪到了别处。

P2 标「暴食」时发现，自己大多数时候是在和朋友一起时暴食；独自一人时，吃得很健康。P2 想追踪的其实不是「暴食」这个属于自己的属性，而是让暴食发生的那段关系。后来 P2 想标「低落」，却找不到「为什么低落」，于是干脆放弃了那个类别。

P7 每天遛狗，走同一条路线。P7 开始标记这些散步，记录路线、步速、能量消耗。研究者注意到，这些数字同时被狗的行为塑造：狗走快一点，能量消耗就变；狗停下来，路线就变。被追踪的「散步」不属于 P7 一个人，而是人与狗一起构成的。

P8 的故事更安静。P8 发现 Apple Watch 不会规律记录心率，于是把「没有记录」本身标成了一种模式。P8 没有把缺失当成坏数据，而是顺着它去审计设备：原来坐着的时候，手表不测。缺失变成了一条关于设备如何决定「什么值得记录」的线索。

这些例子放在一起，边界的问题就不只是「这个词怎么定义」。它还包括：谁是被追踪的主体？一个状态属于一个人，还是属于一段关系、一个组合、一个时间段？当系统默认主体是一个独立的个人，它就已经替用户回答了一个很难的问题。

P7 的低心率让这个问题的代价变得具体。P7 的心率长期偏低，手表反复提醒「dangerously low」。P7 没法让设备把「这对我正常」纳入判断，最后被警报磨到疲惫：「一旦你开始给阈值一些余地，就会产生 alert fatigue，再想回去就很难了。」当边界被固定，落在边界外的人，要么不断解释自己，要么被当成噪声。

## 协商是一种劳动

论文没有把「协商」写成一件纯粹的好事。它花了不少篇幅写协商的成本。

P8 说得很直接：想「establish [patterns] and forget about them」。建立模式，然后忘掉它。固定边界能减少持续的认知负担，让身体从注意里退场。Leder 把这叫作「dysappearing body」：身体在日常中隐去，只有出问题时才回到视野。这种隐去本身有价值。

协商则要求身体一直在场，一直作为一个被询问的对象。不是所有人都想要这种在场，也不是所有人都能均等地承担它。论文提到，有追踪经验的人更容易在开放式探索里找到方向；技术故障会直接压缩协商的空间。P7 的手机在研究中变慢，改类别变得困难，这本身就是一种边界。对处在不同边界之间、需要不断让自己变得可读的人来说，协商甚至不是选择。

![协商的成本：一张桌子上散落着许多未画完的进度环，完成一个并不意味着结束](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-21-ontological-boundary-negotiation-img-05-scene-negotiation-labor.png)

这让我对「把一切变成可协商的」这种设计口号保持距离。一个系统可以开放，但开放本身会向用户收税。设计要回答的是：哪些边界值得让用户反复协商，哪些应该安静地稳定下来，以及协商的成本由谁承担。

## 授权发生在哪一层

论文最后回到设计。它给出的建议并不花哨：让类别可以合并、拆分、连接；让「被追踪的主体」显式地可以是关系；让算法可以被 fork、被比较；把「进度」定义成不止于到达一个整齐的终态；把边界被画下的历史留在界面里。

P1 还有一句话，能说明为什么最后一条重要。P1 说自己给系统的，是「blackbox data ... that doesn't make sense to the system but makes sense to me」。当分类由别人写，它必须对未来的所有使用者可读；当分类由自己写，它只需要在自己的解释框架里成立。这动摇了「数据必须客观」的前提，也让分类有机会装下那些还没有语言的东西。

这些建议背后是同一个判断：更多能动性不会自动带来边界协商。论文的结论句写得很清楚：「more agency does not automatically lead to boundary negotiation.」AI 让用户更容易「自己设计」，但本体假设不会因为设计者换成用户就自动多样化。

我想把这句结论再往前推一步。用户授权的深度，不取决于可编辑选项的数量，而取决于系统把「什么算一个东西」的起点交给谁。如果产品只让用户改名字、颜色、阈值，那是个性化；只有当用户能回头改写「现象是什么、主体是谁、什么算信号、数据意味着什么」，才谈得上本体层面的协商。

我们太容易把「可自定义」当成授权深度的证据。就像判断模型是否真的理解，不能只看它说得多像；判断一个系统是否把定义权交出去，也不能只看设置页有多少开关。[我此前写过](https://ntlx.github.io/articles/llmentalist-effect-reading)，「它懂我」是一种真实体验，模型能力却要看外部证据。放到这里也一样：用户能改多少，是一个可见的指标；用户能否改写起点，才是更深的证据。

这也让我重新看 Ink & Switch 的「gentle slope」。他们主张让用户从使用者平滑地变成创造者，像用电子表格一样，从改一个单元格走到改公式。这个坡道解决的是操作门槛，但它没有回答坡顶通向哪里。如果坡顶只是「给现有类别调参」，再平缓也只是更顺滑地接受既有本体。Apple 这篇论文补上的，正是坡顶的问题。

作者前作《Ontologies in Design》给过四个取向：pluralism、groundedness、liveliness、enactment。这篇新论文像是「liveliness」的实证版：本体不是固定的框架，而是在使用中不断生成。但它同时也暴露了「enactment」的缺口：设计意图是开放，实践却把开放变成了完成圈。这个落差，比四个场域的标签更有产品意义。

论文留下的可能是一种方法：从主流做法出发，不要求用户先说出边界是什么，让边界在使用中显形，再用衍射阅读去找那些微小的开口。它不保证每次都能打开边界。它只是让我们看见，边界曾经被移动过。

这项研究只有 8 人、一周，模型也没有真的训练；作者自己说，它不追求统计上的可泛化。它给出一组被看见的开口，没有给出普遍规律。

回到第三天。P1 把「walk」拆成两条，一周结束时，这个分类没有变成产品。但它让一个人看见了自己生活里两个不同的动作。这个变化很小，小到几乎不像一项研究的结论。

可如果边界真的会移动，它大概就是这样移动的。它没有被一次宏大的授权打开。它是在某一天，被一个愿意回头改名字的人，轻轻挪了一寸。

## 参考资料

- Haghighi, N., Olson, D., Lin, H., Azemi, E., Laput, G., Patel, K., & Landay, J. (2026). *Negotiating Ontological Boundaries in User-Authored Personal Sensing Systems*. Apple Machine Learning Research. https://machinelearning.apple.com/research/ontological-boundary-negotiation
- arXiv 全文：https://arxiv.org/abs/2608.24058
- Haghighi, N., Yu, S., Landay, J., & Rosner, D. (2025). *Ontologies in Design: How Imagining a Tree Reveals Possibilities and Assumptions in Large Language Models*. CHI 2025. https://arxiv.org/abs/2504.03029
- Litt, G., Horowitz, J., van Hardenberg, P., & Matthews, T. (2025). *Malleable Software: Restoring User Agency in a World of Locked-Down Apps*. Ink & Switch. https://www.inkandswitch.com/essay/malleable-software/
- Bowker, G. C., & Star, S. L. (1999). *Sorting Things Out: Classification and Its Consequences*. MIT Press. https://mitpress.mit.edu/9780262522953/sorting-things-out/
- Leder, D. (1990). *The Absent Body*. University of Chicago Press. https://www.bibliovault.org/BV.book.epl?ISBN=9780226470009
