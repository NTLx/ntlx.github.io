---
$schema: starlight
title: Anthropic 这篇长跑 Agent harness 文章，讲透了交接制度
description: 长跑 Agent 之所以容易跑散，往往不是模型太笨，而是交接、验证、回滚和责任边界根本没人替它设计。
date: 2026-07-02
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-02-anthropic-long-running-agent-harness-img-00-infographic-core-summary-1.png)

Anthropic 这篇 [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) 很容易被读成一篇“Claude 提示词技巧总结”。表面上它确实在讲 initializer agent、coding agent、feature list、`init.sh`、browser testing 这些做法。但我读完以后脑子里留下来的，不是几个 prompt pattern，而是另一件事：**长跑 Agent 缺的，先是一套像工程团队交接班那样可靠的制度。**

模型会写代码，这件事已经不新鲜了。真正新的问题是，当一个 Agent 要跑上几个小时、跨过多个 context window、还得让下一轮自己接得住上一轮时，什么东西在替它保存状态、定义未完成、阻止误判、留下回滚点？如果这些东西没有被显式设计出来，再强的模型也会像一个交接文档缺失、测试不全、还喜欢提前报喜的夜班工程师。

这也是为什么我觉得这篇文章值得认真读。它表面在讲 harness，底层其实在讲一套更硬的东西：**怎么把 Agent 从“会做事”推进到“能持续接力做事”。**

## 问题先出在交接

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-02-anthropic-long-running-agent-harness-img-01-context_window_handoff_chain-1.png)

Anthropic 先把症状说得很清楚：单靠 compaction 不够。模型跨 context window 以后，经常会出现两类典型故障。第一类是一次想做太多，在上下文快耗尽时留下一个半做完的现场；第二类更隐蔽，项目已经有了一点进展，下一轮进来扫一眼，就开始宣布大功告成。

我很喜欢他们那个比喻：像一群轮班工程师接力做同一个项目，但每次换班时，新来的人对上一班几乎失忆。这样一来，先卡住你的往往不是智力，而是交接能不能读明白。如果交接只靠上下文压缩，它终归还是一段会被模型自己再解释一遍的自然语言，不稳定，也不抗污染。

这和我之前在 [《Not the Model, You're the Harness》](https://ntlx.github.io/articles/not-the-model-youre-the-harness) 里写过的判断几乎是同一件事：很多人以为自己在追模型上限，其实先撞到的是 harness 下限。Anthropic 这篇文章的价值，就在于它没有继续神化模型，而是老老实实把问题往工程交接层压。

## Anthropic 真正搭出来的，是四个控制点

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-02-anthropic-long-running-agent-harness-img-02-four_control_points-1.png)

如果把原文拆开看，我更愿意把它收束成四个控制点。

第一个控制点是**完成定义**。他们让 initializer agent 把高层需求展开成结构化 feature list，而且坚持用 JSON，甚至用强措辞要求后续 agent 只能改 `passes` 状态，不能随便改测试内容。这样做的作用，是把“什么算做完”从一段会漂移的自然语言，压成一个不那么容易被顺手改坏的状态文件。

第二个控制点是**工作节奏**。后续 coding agent 一次只做一个 feature，做完必须留下 progress note 和 git commit。这相当于把“增量推进”制度化了。它主要防的是 Agent 一口气铺太大，最后把自己埋进半成品堆里。

第三个控制点是**启动校验**。每轮开始先 `pwd`、读 progress file、读 git log、读 feature list、跑基础验证，再决定新一轮做什么。这看起来很土，但正因为土才有用。它把“先确认现场没烂，再继续施工”写成了启动仪式。

第四个控制点是**最终验证**。Anthropic 明说，光跑单元测试和 `curl` 不够，web app 这种场景必须用 browser automation，从像人类一样点一遍开始验。也就是说，Agent 可以自证，但它不能只拿便宜信号自证。

我自己的总结是：feature list 管的是目标，git 和 progress file 管的是历史，`init.sh` 和启动检查管的是现场，browser testing 管的是验收。四者拼起来，才叫 harness。

## 这已经不是 prompt engineering，而是环境治理

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-02-anthropic-long-running-agent-harness-img-03-browser_testing_feedback-1.png)

原文里最容易被低估的一点，是 Anthropic 自己也在把这套经验从工程博客推回官方文档。那份 [Claude prompt best practices](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices#multi-context-window-workflows) 里，同样强调第一轮先搭框架、写结构化测试文件、准备 `init.sh`、每次 fresh context 先做基础验证。这说明他们不是碰巧试出一套内部偏方，而是在收敛一条更一般的多窗口工作流。

所以我更愿意把这篇文章理解成“环境治理说明书”，少把它当成“提示词秘方”。因为 initializer agent 干的事情，本质上是给未来所有 session 预先铺一层制度：目录怎么理解，任务怎么切，进度怎么记，什么算 done，坏了怎么退。真正稳的那部分，更多是环境替模型记住了。

这点也和 Anthropic 自己那篇 [《把 Claude 关进笼子：Anthropic 的 Agent 容器化实战与教训》](https://ntlx.github.io/articles/containing-claude-anthropic) 能接上。容器化那篇讲的是权限边界，这篇讲的是工作边界。前者解决“它最多能坏到什么程度”，后者解决“它怎么在长流程里不把现场越做越乱”。两篇放在一起看，会发现 Anthropic 对 Agent 的思路正在越来越像管理一个不稳定但高产的新同事，而不是调用一个更强的函数。

## 为什么它看起来像在重造项目管理

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-02-anthropic-long-running-agent-harness-img-04-failure_modes_responsibility_table-1.png)

Hacker News 上有个挺尖刻的评论，说 Anthropic 这套东西“很像在重造 project tracker”。我觉得这句吐槽其实打中了核心。因为 feature list、progress log、git checkpoints、基础验证、验收测试，这些本来就都是项目管理和工程治理里的老东西。Anthropic 只是把它们翻译成了 Agent 读得懂、也会被硬约束的形态。

换句话说，Agent harness 发展到这个阶段，难点已经不在“给模型什么提示”，而在“哪些组织常识必须被机器可执行地表达出来”。你得把任务拆薄，把 done 写清，把回滚点留下，把坏现场优先修掉，再让下一轮开工。以前这些东西靠资深工程师习惯，现在得靠环境把习惯固化。

这也是为什么我并不把这篇文章读成“单 agent 优于多 agent”的结论。Anthropic 自己在文末也承认，未来可能会有 testing agent、QA agent、cleanup agent。真正不变的，是这些控制点总得有人负责。无论是一个 agent 还是五个 agent，只要没人负责完成定义、验证门槛和回滚纪律，系统就还是会漂。

## 我读到的最后一层：组织终于开始为 Agent 设计交接班

我读完以后最大的感受是，很多团队嘴上说自己在部署 Agent，实际还停留在“把一个更强的聊天机器人塞进工作流”。Anthropic 这篇文章往前迈的一步，是开始把 Agent 当成一个会轮班、会失忆、会误报进度、也会把现场弄脏的执行者来管理。

这一步非常关键。因为只要你把 Agent 当执行者，不把它当神谕，你就会自然开始问别的问题：谁定义 feature list？谁决定一个 feature 真的 pass？谁来规定 progress file 应该写什么？谁来决定基础验证没过时，不允许继续加功能？这些已经落到责任分配上了。

所以在我看来，这篇文章最值钱的地方，不在于 Anthropic 证明了 Claude 可以跨很多 context window 跑下去，而在于他们开始认真回答：**要让它跑得久，组织必须先替它搭好交接制度。** 长跑 Agent 更需要的，是工程里的老规矩。

*如果你现在也在搭长跑 Agent，你最先想补上的不是哪个模型能力，而是哪一种交接制度：feature list、progress log、基础验证，还是强制回滚点？*

## 延伸阅读

* [《Not the Model, You're the Harness》](https://ntlx.github.io/articles/not-the-model-youre-the-harness)
* [《把 Claude 关进笼子：Anthropic 的 Agent 容器化实战与教训》](https://ntlx.github.io/articles/containing-claude-anthropic)
* [《Agent 能跑 demo 不算本事，能跑一年才是》](https://ntlx.github.io/articles/agent-development-lifecycle)
* [《给编码 Agent 装上可观测性：AHE 如何让 harness 自己进化》](https://ntlx.github.io/articles/ahe-observability-driven-harness-evolution)

## 原文参考

* [Anthropic Engineering: Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
* [Claude Docs: Prompting best practices - multi-context window workflows](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices#multi-context-window-workflows)
* [anthropics/claude-quickstarts: autonomous-coding](https://github.com/anthropics/claude-quickstarts/tree/main/autonomous-coding)
* [Hacker News discussion: Effective harnesses for long-running agents](https://news.ycombinator.com/item?id=46081704)
