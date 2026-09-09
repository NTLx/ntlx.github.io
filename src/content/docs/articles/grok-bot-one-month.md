---
$schema: starlight
title: 把决定压到离证据最近的地方：Grok Bot 的七周是怎么省出来的
description: 七周做出 Grok Bot，靠的不是打字更快：一个只需说服少数人的隔离团队、一条不过滤的证据通道、一份空白页才有的删除权，把产品判断压成了几天。速度是这条回路的副产品，抄数字抄不来。
date: 2026-09-09
category: ai-agents
primarySourceUrls: ["https://www.lennysnewsletter.com/p/how-we-built-grok-bot-in-a-month?showTranscript=true"]
---

两年前我参加过一次内部工具的需求评审。会上没有人为“要不要做”争论，所有人都同意它有价值。卡住的地方在别处：见过那个问题的那三个人都不在场。等他们的反馈绕回来，需求已经被改写成另一个东西，排期也换过一轮。

所以读完 Roman Ugarte 在 Lenny's Podcast 上讲 Grok Bot 的七周（[原访谈](https://www.lennysnewsletter.com/p/how-we-built-grok-bot-in-a-month?showTranscript=true)）之后，我想弄清楚的不是他们怎么写得这么快。材料里几乎没有“写得更快”的动作，加速全发生在动手之前：谁有权拍板、证据多久到决策者手里、删掉一个已经做出来的东西要说服多少人。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-09-grok-bot-one-month-img-00-infographic-core-summary.png)

## 七周的时间线，压缩的是回路长度

先把数字摆好。从第一行代码到内部可用的原型，大约一个月；从内部原型到公开发布，三周；采访录制时，距公开发布又过了三周。Roman 描述团队时很具体：人少不是关键，完全隔离才是——单独的办公区、私有 Slack 频道，目标只有一个：把 agent 带给不写代码的人。

他自己给这段加速的解释，几乎没有一条是工程上的：我们需要每天做大量微决策；如果当时是一个很大的团队、在推演六到十二个月的愿景，我们根本到不了落地的那个位置。

把这件事说直白一点：一个产品决定从“有人看见问题”到“问题被改掉”，中间的时间由两样东西决定：经过多少个人，以及证据要转几手。七周压缩的是这个量，不是键盘的速度。同一件事在两种结构里走法完全不同：一端是发现、当天判断、第二天拿新证据回来；另一端是问题先被汇总，进排期，过评审，上线，再等反馈回到最初看见它的人手上。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-09-grok-bot-one-month-img-01-short-vs-hierarchical-decision-loop.png)

那为什么“隔离”能加速？常见的答案是保密，但 Roman 给的理由是共识成本：如果每个微决策都要向五层人解释一遍上下文，做判断的人会先被说服工作吃掉。隔离买到的，是让一个决定只需要说服五个手里有完整上下文的人。

## 从零开始，才拿得到删除权

Roman 说，不把 Grok Bot 做进 Cursor 这个决定“当时一点都不显然”。他们讨论过：Cursor 的编码 agent 已经被大量用于非编码任务，但会撞上小伤口：产品本身对非技术用户有点吓人，还带着品牌联想。他们也看到了另一条路的结果：把新形态塞进同一个界面、每种形态加一个 tab，用户能感觉到那是三套不同的愿景共享一块屏幕，用他的话，像在把你的组织架构图发布出去。

但“从零开始”的收益得说准一点：与其说是自由度，不如说是删除权。内部 beta 到发布之间，他们做的主要工作之一是大规模 unshipping——把为调试而暴露的模型思考、记忆内容、伪开发者工具全部砍掉，只留用户真正需要看到的表面。判断标准被压缩成一句内部用语：不是“Grok Bot now has”（多了个按钮或下拉框），而是“Grok Bot can now”（多了一种能力）。能力不必配一个像素。

最能说明这一点的是自动化。竞品里设置一个 routine，要进侧边栏、点加号、选触发条件、再选动作；他们反过来，让你直接用自然语言告诉 bot“每天早上八点提醒我”，那个界面根本不存在。Roman 说，现在平台上 99% 的自动化是这么建起来的。

删除权之所以和“从零开始”绑在一起，是因为在既有产品里，删掉一个东西要面对沉没成本、既有交互范式和内部政治。空白页上没有这些债务。顺带一个对照：OpenClaw 先走通了“给 bot 一台自己的电脑”（[power user's guide](https://www.lennysnewsletter.com/p/listen-openclaw-a-power-users-guide)），但家里一台 Mac mini 加 VPN 到不了百万用户；Grok Bot 的增量是把它产品化到云端，每个 bot 有自己的 computer。

不过这里必须留一句反证：Codex 走的是相反的路，并入既有产品，同样成功。所以“从零开始”是一个选项，不是普遍解。多数团队手上没有空白页，只有遗留系统。

## 手工 onboarding 买的是不过滤的证据

另一个当时不显然的决定，是团队亲手接了近 300 个早期用户。有两周时间，核心团队坐在二十分钟一通的会话里，看用户卡在哪：computer 起不来、有人完全不知道下一步该做什么。最早的几次 onboarding 相当难受，但难受的价值在于，看完你只能得出一个结论：这明天必须修好，因为明天还有人来。

这段经历里我最在意的倒不是同理心，是证据的路径。用户第一次的真实困惑没有经过“需求文档、排期、上线”这条损耗链，而是直接落到了做产品的人的感官里。销售团队是个好例子：他们用的工具有很多没有像样的 MCP 或 API，agent 只能靠 computer use 点像素，卡在某个 Salesforce 面板的按钮上；这种反馈比看仪表盘上的曲线更具体，改完之后第二天就能收到“这个流程终于能用了”的回应。招募团队的用法更极端：每天早上跑一遍某会议网站，下载新 PDF，找出没被记录过的名字，加进表格，再查公司里谁认识这个人，直接发 Slack 请求介绍。

还有一层是我原本没预期到的：他们刻意不引导。内部先出现了“一个 chief of staff bot 管理其他 bot”的用法，团队没有直接把它写进产品，而是先看外部用户会不会自己走到那儿——多数人走到了，他们才稍微加点倾向。用他的说法，是不想 lead the witness。

边界同样清楚：近 300 人不可规模化，样本也高度偏斜，来源基本是熟人网络和硅谷 bubble，Roman 自己承认必须主动跳出去。它买到的是证据质量，不是一套可以照搬的流程。

把前面三件事放在一起，结构就出来了：一个只需说服少数人的隔离团队、一条不过滤的证据通道、一份可以自由删除的权力。缺任何一根，加速都会变形：有速度没证据是猜得更快，有证据没删除权只能继续加功能，有删除权但不隔离，每次删除都要开三次会。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-09-grok-bot-one-month-img-02-three-pillars-short-loop.png)

## 90% 的委派，注意力并没有被交出去

Roman 有一条推文：An AI that does 100% of the job feels categorically different from one that gets you 90% there（[原帖](https://x.com/romanugarte_/status/2087344044435505175)）。他解释得很具体：如果你把任务交给一个只信 90% 的同事，你还得在心里挂着它，知道大概率要接手、要微调，那就不叫 90% 完成，你还在做这件事，它还占着你的注意力。真正不同的是把球抛出去不用回头看，也就是 no look pass。

所以“just works”根本不是功能问题。那几周他们主要爬的是后端五个硬问题，多数用户根本看不见，但你会在 bot 点不到按钮、登不进网站、任务卡死的时候完整地感受到它们。用户对“看不到内部机制”的反馈也印证了方向：有人想看 bot 的待办列表和大致优先级，但没有人想要那一长串思维链文字流。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-09-grok-bot-one-month-img-03-delegation-threshold-90-vs-100.png)

这条线往外延伸，能接上站内两篇旧文。一篇是[《当 AI 开始记住工作，人还要做什么？》](https://ntlx.github.io/articles/persistent-ai-coworkers)：长期记忆让 bot 有连续性，而连续性的意义在于你不用每次重新交代上下文；但记忆要真的变成委派，前提仍是监督成本足够低，否则你只是把“重新交代”换成了“反复检查”。另一篇是[《为什么聪明的 Agent 活不过 24 小时？》](https://ntlx.github.io/articles/how-long-should-an-agent-live)：长寿命 agent 的边界不在它能活多久，而在它失败一次的代价是否低到你可以不看。Roman 也承认长期记忆在组织层面的形态还没有答案——工作与个人要不要分成两套 bot，他给的是直觉，不是验证。

在这一点上，他用了一个词：colleague-pilled。当产品上两条路都说得通、在“产品语境”里没有明确答案时，他们会把问题换成人际问题——如果这是我的同事，我希望他怎么做？这个问题往往能让房间里的分歧迅速收敛。

但这一节的所有证据都需要打折：内部接受度、效率倍数、Claire Vo 从 OpenClaw 全线切换到 Grok Bot（[那期节目](https://www.lennysnewsletter.com/p/how-openclaw-changed-my-life-claire-vo)），都来自团队与支持者的叙述，没有独立基准。xAI 的模型、算力、人才密度与收购后的资源底座也不可剥离，换掉它，“小团队加空白页”未必复现。

## 能拿走的不是七周，是一条可以检查的回路

我自己的判断是：把“七周”当目标去追的团队，大概率会得到更快的返工。周期是结果，不是可移植的输入。如果决策者碰不到一手证据、也没有删除权，那么把小团队凑起来，只会让返工来得更早、更整齐。

可迁移的是三段结构：决策者能直接接触证据、拥有删除权限、组织容忍反复重写。三条同时具备时，缩短回路会带来真实加速；缺任何一条，目标就该降级成“更快的证据整理”，而不是“更快的功能交付”。先把证据送到能拍板的人面前，比多做三个功能更接近那次七周。

这周可以做一件很小的事：挑一个最近被拖住的产品决定，写下三行：证据现在卡在谁那里？谁有权删掉它？如果明天必须改掉，需要说服几个人？

最后补两个诚实的边界。付费墙后的 takeaway 列表我没有读到，本文的判断只建立在公开的 transcript 上；手工 onboarding 不可规模化，从零开始是资源充裕下的选项，不是普遍解。

你手上那个被拖住的决定，卡住的到底是没有人会做，还是证据还没走到能拍板的人面前？

## 参考资料

- [How we built Grok Bot in a month | Roman Ugarte (SpaceXAI) — Lenny's Podcast](https://www.lennysnewsletter.com/p/how-we-built-grok-bot-in-a-month?showTranscript=true)
- [视频版：How we built Grok Bot in a month](https://youtu.be/maSdsTLaMuU)
- [Roman Ugarte 的推文：An AI that does 100% of the job...](https://x.com/romanugarte_/status/2087344044435505175)
- [OpenClaw: A power user's guide to the most powerful personal AI tool since ChatGPT](https://www.lennysnewsletter.com/p/listen-openclaw-a-power-users-guide)
- [From skeptic to true believer: How OpenClaw changed my life | Claire Vo](https://www.lennysnewsletter.com/p/how-openclaw-changed-my-life-claire-vo)
- [The playbook for building high-talent-density teams | Adam Ward, Head of Talent at Cursor](https://www.lennysnewsletter.com/p/the-playbook-for-building-high-talent)
- [当 AI 开始记住工作，人还要做什么？](https://ntlx.github.io/articles/persistent-ai-coworkers)
- [为什么聪明的 Agent 活不过 24 小时？](https://ntlx.github.io/articles/how-long-should-an-agent-live)