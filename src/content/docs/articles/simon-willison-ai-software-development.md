---
$schema: starlight
title: 当写代码的成本无限趋近于零，软件工程最昂贵的壁垒变成了「理解」与「克制」
description: 当 AI 让写功能变得一文不值，软件最大的危险不是做不出来，而是失控膨胀成通往天花板的“温彻斯特神秘屋”。在智能体时代，工程管理、严苛红绿 TDD 与对每一行代码的解释权，才是资深开发者真正的护城河。
date: 2026-08-20
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-20-simon-willison-ai-software-development-img-00-infographic-core-summary.png)

在软件工程演进的历史长河中，生产力的跃迁往往伴随着价值尺度的深刻重塑。从打孔纸带到高级语言，从手写汇编到底层框架，每一次抽象层级的拉高，都在消解上一代工具的操作繁琐，同时催生出新的系统复杂性。

但在今天，当大模型与编码智能体（Coding Agents）将代码生成的边际成本压至无限接近于零时，我们正在目睹一场前所未有的价值倒挂：在数字世界里，最廉价的商品变成了代码本身，而最昂贵、最稀缺的工程资产，变成了对系统的理解深度与对功能欲望的战略克制。

在近期播客 *Talking Postgres* 第 42 期中，开源界著名实践者、Django 联合创始人兼 Datasette 创造者 Simon Willison 与主持人 Claire Giordano 展开了一场长达 90 分钟的深度对谈。Simon 毫无保留地分享了他如何用 AI 重塑日常开发流的真实经验。这场对话没有泛泛而谈的宏大叙事，而是以极具穿透力的工程细节，剖析了在智能体时代，一名清醒的软件工程师究竟该如何重新安放自己的专业尊严与质量防线。

## 边际成本崩塌：从“洗澡时交付一个库”说起

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-20-simon-willison-ai-software-development-img-01-red_green_tdd_harness.png)

对话的开场是一个令人震动的真实场景：

清晨淋浴时，Simon 在手机上向运行在笔记本上的编码 Agent 发送了两个段落的需求提示词。他希望将自己此前开源的 SQLite 工具库的核心接口（包括插入、更新、全量 upsert 和表结构内省等），基于 SQLAlchemy 抽象重构成一个多数据库通用库，并明确要求针对 SQLite、PostgreSQL 和 DuckDB 三个引擎进行全量交叉测试。

当他洗漱完毕吃早餐时，一个全新的开源项目 `alchemy-utils` 已经在本地仓库构建成型。这个项目包含 100 多个自动化测试用例，跨越三大数据库引擎全部绿色跑通，并在极少量的后续指令微调后直接发布了 Alpha 版本。

如果把时间拨回两年前，这样一次涉及底层 ORM 适配、多引擎方言兼容和完整测试覆盖的重构任务，至少需要一名资深工程师耗费数天甚至一周的高强度编码。但现在，它被压缩成了一次早晨洗澡间隙的异步调度。

这一跃迁标志着 AI 编程已经彻底跨过了“生成玩具代码”的阶段，进入了能够承载工业级系统重构的拐点。然而，面对如此惊人的生产力爆发，Simon 反复强调的却不是开发速度，而是一条近乎严苛的生产交付准则：

> “你能把这段代码清晰地解释给别人听吗？”（Could I explain this to somebody else?）

如果一段代码连开发者自己都无法向同事清楚解释其内部的执行机理、状态转移与边界妥协，那么无论自动化测试表现得多完美，它都绝不具备并入主干、交付生产的资格。当写代码不再需要付出时间成本，阅读、理解与对每一行代码承担责任的能力，反而成为了决定系统生死存亡的唯一硬通货。

## 红绿 TDD 是驯服随机性智能体的“确定性铁笼”

很多初涉 AI 编程的开发者容易陷入一种轻浮的误区：既然大模型能一键生成逻辑，我们是否就可以抛弃繁琐的单元测试，完全依赖“体感测试（Vibes-based Testing）”与人工抽检？

事实恰恰相反。大语言模型本质上是非确定性的概率发生器。在没有强约束的环境下，让 Agent 自由发挥的结果往往是一场灾难：它可能会采用脆弱的特例硬编码来敷衍表面需求，也可能在修复一个偶发边界时悄无声息地破坏原有契约。正如我们在 [《当 vibe coding 和 agentic engineering 开始模糊，我感到一阵不安》](https://ntlx.github.io/articles/vibe-coding-agentic-engineering) 中指出的，缺乏严密脚手架的自由编写，最终只会将工程带入无法维护的泥潭。

Simon 在实战中驯服 Agent 的核心法则极其朴素，那就是经典的红绿测试驱动开发（Red-Green TDD）：

1. **红灯阶段（Red）**：在要求 Agent 编写任何实现之前，先让它（或由开发者指定）编写一个针对目标特性的测试用例，并执行测试确保其确定性失败；
2. **绿灯阶段（Green）**：指示 Agent 仅编写刚好能够让失败测试变绿的最少实现代码；
3. **循环覆盖（Refactor & Exercise）**：通过严密的断言矩阵，强制让测试套件真正执行到生产逻辑的每一分支、每一行。

在传统软件工程中，TDD 往往被视为一种推行成本高昂的开发理想；但在智能体编程语境下，TDD 却蜕变为了性价比最高、最坚固的确定性铁笼。

AI 极其擅长在狭窄的目标函数下寻找解法。当你用先行的失败测试锁死预期输入输出与异常边界时，Agent 就无法在黑暗中胡乱幻觉，而是被牢牢按在确定性的轨道上快速收敛。这也是为什么在当下，最具生产力的不是那些擅长手敲语法的人，而是那些精通系统破坏、能预判边缘案例（Edge Cases）的 QA 专家与资深测试工程师。

## 警惕“温彻斯特神秘屋”：功能很廉价，绝不意味着你该全做出来

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-20-simon-willison-ai-software-development-img-02-winchester_house_vs_integrity.png)

当功能的开发成本变得一文不值时，软件架构面临的最大敌人不再是“做不出来”，而是失控的欲望与无序的膨胀。

对谈中引申出了一个极具警示意义的历史隐喻——温彻斯特神秘屋（Winchester Mystery House）。这座位于加州圣何塞的著名豪宅，在女主人的授意下持续建造了整整 38 年。因为没有任何总体蓝图和架构规划，施工队只是日复一日地根据零碎念头不断加盖房间，最终诞生了一座拥有 160 个房间、门开向空无一物的深渊、楼梯直接通往天花板的怪异迷宫。

图灵奖得主 Fred Brooks 在《人月神话》中曾留下过一句振聋发聩的断言：

> “概念完整性是系统设计中最重要的考量（Conceptual integrity is the most important consideration in system design）。”

在过去几十年里，软件开发之所以未大面积演变成温彻斯特神秘屋，在很大程度上是因为“编写代码的高昂工时成本”充当了一道天然的过滤网。一个平庸或冗余的功能构想，往往在估算开发排期时就被团队主动放弃。

但今天，当写一个新特性只需要敲一行 Prompt、等待 30 秒时，这道天然的物理屏障彻底消失了。如果架构师缺乏极强的审美定力，系统就会被海量看似有用实则彼此孤立的微小功能迅速淹没。正如我们在 [《代码写得快 10 倍，为什么交付反而更卡了？读 Cloudflare ADLC 架构宣言》](https://ntlx.github.io/articles/cloudflare-agent-development-lifecycle) 中所看到的，生产瓶颈正在从代码编写端全面淤塞到架构演进与维护端。

> “功能极其廉价，但这绝不代表你应该把它们全都做出来。”

学会果断丢弃原型、学会对 90% 的诱人特性说“不”，在代码泛滥的时代已经成为衡量一名高级工程师架构素养的核心分水岭。

## 拒绝成为“垃圾代理人”：写作即思考，人类在回路是最后的守门人

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-20-simon-willison-ai-software-development-img-03-slop_proxy_vs_gatekeeper.png)

伴随生产力工具的普及，一种极其恶劣的协作形态正在技术社区蔓延——垃圾代理人（Slop Proxies）。

所谓垃圾代理人，指的是那些仅充当大模型中继器的人：他们输入一句简短粗糙的指令，让 AI 生成 20 个段落的冗长 PR 描述、技术方案或设计文档，自己甚至未曾通读一遍，就原封不动地抄送给同事或开源维护者。

这种行为本质上是一种隐蔽的认知自私：开发者为了省去自己几分钟的归纳精力，将长达数十分钟的信息清洗与理解负担转嫁给了整个团队。

前 React 核心团队成员 Sophie Alpert 曾为此起草过一份极具洞见的团队准则《自然语言文本不存在无损转换（There are no lossless transformations of natural-language text）》。她提出了四条不可逾越的原则：

1. **必须对文档中的每一句话背书**：绝不允许在被质询时回答“哦抱歉，这是 AI 写的，忽略它即可”；
2. **写作本身就是思考（Writing is thinking）**：技术方案与复盘文档的核心价值不在于文档产物本身，而在于书写过程中逼迫大脑完成的深度推演，外包写作等于外包思考；
3. **编写文档所花的时间必须多于阅读时间**：短提示生成长文本甩给他人，是对读者时间的极度不尊重；
4. **更长绝不等于更好**：语言的任何自动化转译与润色都会造成意义损失。

Simon Willison 在日常开发中给出了一个极佳的实践示范：当 Agent 交付了一个极其详尽的代码变更时，他会在 PR 顶部亲手写下一段极简精炼的意图说明，而将 AI 生成的数十段上下文细节通过 `<details>` 标签默认折叠起来。需要溯源的人可以主动展开，但绝不强迫普通审查者支付无谓的认知税。

所谓的“人类在回路（Human in the loop）”，从来不是为了在自动化流水线上充当橡皮图章，而是为了保护系统中的其他真实人类，免受机器愚蠢错误的伤害。

很多人焦虑 AI 会带来开发者的技能萎缩（Skill Atrophy）。但正如 Simon 在访谈最后指出的，萎缩从来不是技术的必然结果，而是一种个人的主动妥协。如果你把 AI 当作偷懒的黑盒，你的工程感知必然退化；但如果你把它当作探索未知领域的探针，用它去剖析底层 C 扩展、去推演高并发内存模型、去交叉验证复杂架构取舍，你的认知边界将获得十倍维度的延伸。

在代码越来越便宜的未来，唯有严谨的工程管理思维、敏锐的系统审查力与对概念完整性的永恒坚持，才是人类工程师不可剥夺的光荣。

*在你的日常开发中，你是否也遇到过被 AI 生成的海量“廉价功能”或“冗长 PR”淹没的时刻？面对代码生产力的爆发，你认为最该守住的一条工程底线是什么？欢迎在评论区分享你的实战观察。*

## 参考资料

- [Talking Postgres Episode 42: How AI is changing software development with Simon Willison](https://share.transistor.fm/s/fe88354c)
- [Talking Postgres Episode 42 Transcript](https://share.transistor.fm/s/fe88354c/transcript)
- [Release: alchemy-utils 0.1a0 — Simon Willison](https://simonwillison.net/2026/Aug/12/alchemy-utils/)
- [sqlite-utils — GitHub](https://github.com/simonw/sqlite-utils)
- [Datasette Project](https://datasette.io/)
- [There are no lossless transformations of natural-language text — Sophie Alpert](https://sophiebits.com/2026/06/25/there-are-no-lossless-transformations-of-natural-language-text)
- [The Mythical Man-Month: Conceptual Integrity — Wikipedia](https://en.wikipedia.org/wiki/The_Mythical_Man-Month#Conceptual_integrity)
- [Winchester Mystery House — Wikipedia](https://en.wikipedia.org/wiki/Winchester_Mystery_House)
- [Test-driven development — Wikipedia](https://en.wikipedia.org/wiki/Test-driven_development)

## 延伸阅读

- [当 vibe coding 和 agentic engineering 开始模糊，我感到一阵不安](https://ntlx.github.io/articles/vibe-coding-agentic-engineering)
- [代码写得快 10 倍，为什么交付反而更卡了？读 Cloudflare ADLC 架构宣言](https://ntlx.github.io/articles/cloudflare-agent-development-lifecycle)
- [全员 Vibe Coding 是个陷阱：读 Cloudflare OS 内部 AI 落地架构有感](https://ntlx.github.io/articles/cloudflare-ai-os-reader-response)
- [Codex 突破千万周活的背后：当代码变成隐形燃料，AI 的终局是消解“程序员”](https://ntlx.github.io/articles/codex-10m-users-chatgpt-work)
