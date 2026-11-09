---
$schema: starlight
title: 让维护者来批改 AI 写的作业
description: 读斯坦福 CS146S 的课程访谈，我最在意的是开源维护者参与批改。AI 可以交出修改，学生还得学会解释取舍、接受反馈；团队也需要给这种理解留下位置。
date: 2026-11-09
category: ai-coding
primarySourceUrls: ["https://lspace.beehiiv.com/podcast/s/latent_space_the_ai_engineer_podcast/one_million_ai_engineer_special_how_stanford_teaches_ai-native_engineering_mihail_eric_monaco", "https://latent.space/p/cs146s/", "https://www.youtube.com/watch?v=dpY7YzZo4kE"]
---

假如 AI 帮你写好了补丁，测试也过了，项目维护者却问，这个功能为什么应该加进来？

这时再让 AI 解释代码，可能接不上话。维护者问的还包括项目要服务谁、愿意承担多少维护成本，以及为什么放弃过看起来更漂亮的方案。

读完 Latent Space 对 Mihail Eric 的访谈，我最在意的是他给斯坦福 CS146S 加入的开源贡献安排。学生进入陌生项目，提出修改，与维护者交流，再接受代码审查。Mihail 希望借此帮助学生建立对好软件的理解。[访谈的这段讨论](https://www.youtube.com/watch?v=dpY7YzZo4kE&t=759s)比一张工具清单更值得琢磨。

我愿意把这样的作业当成观察 AI 编程教育的起点。生成代码可以交给工具，形成判断仍需要具体对象和真实反馈。维护者恰好能把这两样东西带进课堂。

![生成之后怎样获得理解，本文观点概括](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-09-stanford-ai-native-engineering-img-00-infographic-core-summary.png)

## 补丁被退回来以后，学习才有了对象

课程为什么需要调整？按 Mihail 在访谈中的说法，原先有些教学练习已经容易被 Agent 一轮完成。比如让学生在仓库上运行 AI 审查工具，再评价结果好不好。工具更熟练了，作业交得出来，学生理解了多少却越来越难判断。

开源贡献增加了一种很有用的阻力。仓库里有既有设计、兼容性要求和别人维护的代码，学生必须把自己的想法放进去试一试。维护者可以回答，为什么这里没有按你想的方式写。

设想学生让 Agent 优化一处缓存，测试通过，补丁也很整齐。但维护者指出，缓存键忽略了租户边界，或者项目根本不愿为这点速度增加失效逻辑。这是假设的教学场景，却说明了两种反馈的区别。测试告诉你某些输入得到了预期输出，维护者还能指出，你选错了需要优化的问题。

**我更看重这种被具体理由纠正的机会。** 学生需要比较自己的判断和别人的判断，找到差异落在哪里。只是多生成几种实现，很难补上这个过程。

这里也有现实代价。维护者的时间有限，课程不能把批量生成、缺乏理解的 PR 推给社区。如果要借鉴这项安排，我会先约定可做的任务与提交规模，让学生在发 PR 前说明需求、涉及的模块和待解决的疑问。否则所谓真实项目训练，很容易变成别人替课堂承担审查成本。

课程有没有因此显著改善学生能力？现有材料不能证明。访谈给出了值得尝试的设计，还没有给出教学效果的对照结果。

## 看懂解释，还得能接着做决定

访谈提到了 Geoffrey Litt 的 explain-diff。我接着读了他的[《Understanding is the new bottleneck》](https://www.geoffreylitt.com/2026/07/02/understanding-is-the-new-bottleneck.html)。他让 Agent 把改动组织成解释文档，并用测验检查自己是否理解；还会制作可以操作的小环境，帮助观察系统怎样运行。

![Geoffrey Litt 演示视频原画面，解释文档后的独立测验](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-09-stanford-ai-native-engineering-img-01-explain-diff-quiz.jpg)

我喜欢它把“看完了”与“理解了”分开。读一份流畅说明时，很容易一路点头。换成自己回答问题，空白就会暴露出来。

对前面的缓存示例，我会试着关掉解释文档，回答请求从哪里进入、旧逻辑为什么存在、缓存失效时会怎样，以及哪种业务变化会让这个设计不再合适。答不出哪一处，就回到那一处读代码、查文档，必要时问维护者。

不过，测验也可能和实现共享盲点。写代码的 Agent 若误解了租户隔离，它出的题可能同样忽略这个问题。因此我不会把测验通过当作发布凭证。它用来检查我的理解，业务约束和验收标准还要另外核对。

Litt 进一步强调，理解能帮助人继续参与项目演进。即使工具擅长检查错误，我也得知道系统为何如此组织，才能提出有用的下一步。若只能等 Agent 告诉我该做什么，我还能提出多少自己的想法？

站内此前在[讨论智能体编排与项目管理](https://ntlx.github.io/articles/engineers-reinventing-project-management)时也涉及理解跟不上生成的问题。这次课程访谈让我多想到一层，团队不能只想办法处理待审查的代码，还得安排人获得理解的机会。

## 把 Agent 放进真实环境，也把人留在反馈里

从课堂走到团队，访谈里的 Monaco 实践提供了另一种参照。[工作区文章](https://www.monaco.com/blog/agent-developer-workspaces)写到，他们尝试过本地并行方案，后来为 Agent 建立独立工作区，接通可运行的应用和数据快照，并限制可访问的数据与服务。

这提醒我，讨论自主性之前，得先问 Agent 到底能看到什么。它能否启动应用、复现问题、查看相关日志，再验证修改？如果只能读文件和猜测运行结果，再漂亮的任务分工也补不齐证据。

人的反馈同样需要可靠材料。[Basis 的 Authority Map](https://www.getbasis.ai/blogs/how-we-made-our-monorepo-ergonomic-for-agents#canon-vs-not-canon)把说明当前行为的权威材料，与计划、规格及历史说明区分开。工单描述过某个功能，不代表代码照着实现了；历史方案仍能解释取舍，却不能直接当成现状。

我觉得这与维护者批改作业有相通之处。维护者知道哪些约束还有效、哪些提议曾被否决。团队若想把一部分工作交给 Agent，就需要把这些区别写得可查证。只顾把材料塞给模型，反而可能让旧设想压过当前事实。

自建工具也要有边界。Mihail 讲了先购买以学习、再自建以长期使用的经验，但 Monaco 仍在使用 Devin 做代码审查。结合工作区文章来看，更合理的借鉴方式是先辨认通用产品和自家环境之间的缺口，再决定是否值得长期维护。

[Stripe 对 Minions 的介绍](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents)也保留了人工审查。后台任务可以推进到可供审查的 PR，执行过程结合自动化检查，仍有人判断是否接收改动。这样的案例能说明自动化怎样推进，不能据此宣布工程师已经退出。

![Stripe 官方 Minions 图，Slack 中的任务请求](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-09-stanford-ai-native-engineering-img-02-stripe-minions.png)

## 给自己留一份需要解释的作业

我也留意到 Mihail 对课程适用范围的限定。CS146S 面向已有基础的学生，传统计算机课程是它的基础。读文件、调用工具、执行修改的简化 Agent 循环，可以帮助理解工具如何工作，远不等于学完生产系统的工程问题。

因此，对正在学习的人，我会建议挑一个自己感兴趣、规模能理解的小项目，找一项值得做的小改动。先和维护者确认方向，再借助 Agent 研究与实现。提交之前，独立讲清需求从哪里来、为什么选这个方案、检查覆盖了什么，以及还有什么把握不足。被退回后，记下自己原先漏掉了哪条约束。

如果没有维护者愿意指导，也可以请同学或同事审查，或者隔一段时间重新修改自己的项目。关键是让判断遇到反馈，别只收藏一份生成顺利的记录。

对带团队的人，我更愿意尝试把新人做小改动、解释方案和接受资深同事反馈的时间算进交付。自动化可以减少手工实现，却不会自动提供指导。若新人只负责发起任务和点击接受，系统暂时可以继续增长，人对它的理解却未必跟得上。

读完访谈，下次 Agent 交来补丁，我想多留一点时间，试着不借助它的说明，向另一个人解释这项修改为什么值得留下。解释过程中卡住的地方，正好是接下来该学的地方。

## 参考资料

- [Latent Space 完整访谈与文字稿](https://latent.space/p/cs146s/)
- [CS146S 课程官网](https://themodernsoftware.dev/)
- [Mihail Eric 的简化 coding agent](https://www.mihaileric.com/The-Emperor-Has-No-Clothes/)
- [Mihail Eric 的 Claude Code trace 解读](https://www.mihaileric.com/Demystifying-Claude-Code/)
- [Geoffrey Litt 的理解与参与](https://www.geoffreylitt.com/2026/07/02/understanding-is-the-new-bottleneck.html)
- [Monaco 的 Agent 工作区](https://www.monaco.com/blog/agent-developer-workspaces)
- [Basis 的仓库与文档权威规则](https://www.getbasis.ai/blogs/how-we-made-our-monorepo-ergonomic-for-agents)
- [Stripe Minions](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents)
- [访谈提及的代码审查观点文章](https://latent.space/p/reviews-dead/)
