---
$schema: starlight
title: 同一批问题，每次改动重问一遍
description: Tessl 的 verifier 把「该问什么」写进仓库，每次改动重问一遍。它保证的是问题不变，不是答案不变；所以升级到阻断合并的时刻，属于每条规则各自的误报代价。
date: 2026-11-06
category: ai-coding
tags: ["AI Coding", "LLM-as-Judge", "Code Review", "CI"]
primarySourceUrls: ["https://tessl.io/blog/verifiers-enforce-your-repos-rules-on-every-agent-change"]
---

一个仓库里多了一个 JSON 文件。几十行：一句用普通文字写的要求，一组说明「什么时候该用它」的条件，一份可以逐条回答 yes 或 no 的清单。它躺在 `verifiers/actionable-errors.json`，跟代码一起进 diff，一起被 review。

Tessl 把这东西叫 verifier，2026 年 10 月宣布 GA。他们的博客里有一句话，我读了几遍：「a check that both understands your code, and deterministically runs the same rules every time, guaranteed.」

把这句话拆开，guaranteed 贴在「runs the same rules」这一段上。同一个 verifier 在 CI 里跑一千次，问的是一千次同一批问题。这一千次给出的答案是否一致，是另一件事，而且不是这份 JSON 能承诺的。

这个区分决定你怎么用它。

![同一批问题每次改动重问一遍：装进仓库的是问题，严格度在配置里，换 judge 换 fail 名单，闸门是概率的](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-06-tessl-verifiers-img-00-infographic-core-summary.jpg)

## 一个 JSON 文件装的是问题

verifier 的内容物由三部分组成。instruction 说清这条规则要什么；relevant_when 说清它在什么情况下适用；checklist 把规则拆成一条条 yes/no。官方文档对 relevant_when 的要求很具体：写可观察的特征，别写抽象意图。这句要求本身就是信号，它在教你怎么把一句模糊的偏好，翻译成一次可以被回答的提问。

严格度和适用范围不放在 verifier 里。它们写在 `tessl.json` 的 verify block 中，每个 group 拿一个 info、warn 或 error。原文给了理由：scope 和 severity 在 verifier 之外，所以同一个 verifier 可以跨团队、用不同设置复用。

如果 verifier 是一个「判定器」，这个分层有点怪，判定器的严格度应该属于判定器。可如果 verifier 是一份「问题集」，分层就顺了：问题归写规则的人，后果归采用它的团队。

原文自己的机制设计一直在给这个读法作证，只是没说破。

- 默认只查本次改动触达的文件，这是在决定这次该重放哪些问题。
- 改了 verifier 或它的配置，就重查它覆盖的全部文件，这是问题集变了、历史答案作废。
- 全项目审计用 `--all`，monorepo 加 `--recursive`，这是在决定重放的范围。

复用性也来自这里。lint 规则的复用单位是正则或 AST 匹配，绑死实现形式；review prompt 的复用单位是一段话，绑死表述风格。verifier 复用的是一个用文字写清楚的问题加一份清单，比正则耐移植，比 prompt 容易 review，因为清单逼你把「读起来好不好」拆成能逐条回答的条目。

代价同样来自这里：复用一个 verifier，等于复用一个解释。两个团队对同一条规则的理解出现分叉时，他们改的不是配置，是那份 JSON。

![一个问题集向下分出两种后果：问题归 verifiers 目录，严格度归 tessl.json 的 verify 配置](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-06-tessl-verifiers-img-01-framework-question-and-consequence.jpg)

## 它把漏问换成了一次吵闹的失败

原文的动机段落写得很实在。多数团队已经给 agent 写了 coding standards，说清该用哪个 helper、不该调哪个 API、绝不把 token 打进日志。agent 通常遵守得不错，但不会每次都抓到全部（原文："they won't catch everything, every time"）。规则滑脱的时候，你一般要到 code review 才发现，或者更晚。

两个现成手段都不够。linter 只能查确定性规则；AI code review 会找 PR 里的一般问题，但不会每次可靠地查同一条规则。

verifier 补的是中间那段。它不理解「这段代码好不好」，它只回答「这几条问题，这次的改动过不过」。

所以它的价值不在准确率，而在失效方式。没有 verifier 时，规则滑脱是静默的，你根本不知道这次漏了哪一条。有了 verifier，每次改动都会得到一串 pass/fail，漏掉的那条会以一次 FAIL 出现在你面前。它把「没人问」换成了「有人问，并且答错了」。

这个交换值得做，但它不是免费的：你会开始收到误报。

站内之前读过 Tessl 另一篇讲约束的文章，把约束手段按撤销成本排成几个杠杆——能说服的、能拿走的、能拒绝的、删不掉的（[一条规则的强度，等于它被撤销的难度](https://ntlx.github.io/articles/agent-charter-four-levers)）。verifier 的位置可以补进去：它是一种每次改动都会重新施加一次的约束，只要没过，下一轮还得再答一遍。也有人在别处把这类机制叫传感器，让它尽早知道自己写歪了（[AI 写代码最缺的，不是模型，而是传感器](https://ntlx.github.io/articles/coding-agent-sensors)）。verifier 确实是一根传感器，只是它测的是规则符合度，不测可维护性。

分级就是为误报准备的。warn 只报告，不失败构建；error 非零退出，可以挡住 PR。这里有一个原文没写、官方文档写了的细节：CI 里的 error 只是让这个 check 失败，要真的阻止合并，还得在分支保护里把这个 check 设成 required。把 error 当成「已经拦住了」，是很常见的误解。

## 升级时刻属于每条规则，不属于整个 verifier

原文的建议是先从 warn 起步，看它在真实 PR 上的表现，信任之后再升到 error。这是一条合理的入门路径。

把它读成一本账，比读成一张时间表更贴合实际。信任不是可以整体累积的量，误报的代价更不是。

一条「handler 不许记录 request headers、tokens 或 passwords」的规则误报，代价是有人打开 diff 看一眼，确认没有，继续。一条「每条面向用户的错误都要告诉用户下一步」的规则误报，代价是每次改 UI 文案都要跟模型争一遍措辞，而这条规则本身贴着散文的边界：它列在原文三个好例子里，也是最容易在边界情况上摇摆的那一条。

这两条规则不该共用同一个升级时刻。

配置结构允许按规则分。多个 group 各自指向不同的 verifier 文件，就能给每条规则单独的 level。文档把 severity 放在 group 上而不是 verifier 上，本意是让同一份 verifier 在不同团队有不同的严格度；同一条思路反过来用，就是给自己的仓库里的规则各自定一个后果。

我会把账算成这样：误报时人工确认的成本，乘以误报频率，对上漏报一次的实际损失。前者容易估，后者往往估不出来。这也让先 warn 站得住：warn 期是收集误报频率的时期，不是攒信任的时期。

![两条规则的误报成本不同，升级到 error 的时刻也不同：一条便宜到可以立刻升，一条贵到应该停在 warn](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-06-tessl-verifiers-img-02-comparison-per-rule-upgrade-ledger.jpg)

## 换 judge，换的是你会看到哪些 fail

默认的判定模型是 openai/gpt-6-luna。命令行加 `--model jev` 可以换成 Jev，它给每条规则返回 verdict 和 confidence，不写推理。

原文把 Jev 写成一个中性选项，适合对速度、成本或准确度有不同偏好的团队。Tessl 早前那篇对比文把数字摆了出来：六个项目、约 2,725 个 verifier/file 对，绕过 gateway cache，Jev 比 GPT Luna 6 便宜 2.7 倍、快 13.6 倍，成本从每 1000 targets 的 $0.64 降到 $0.24；对上一代 GPT Luna 5.6，便宜 6.6 倍、快 10 倍。

另一组数字更要紧：Jev 与 GPT Luna 6 在 Tessl 代码库上的判定一致率是 85.9%。按规则类别拆开，warn 级的 prose 规则上，Luna 6 的失败率是 50.1%，Jev 是 30.4%；warn 级 code 规则是 15.3% 对 10.3%。error-handling 规则上也有意外分歧，Tessl 说还在调查。

85.9% 不是「差不多」。它意味着换一个 judge，你会看到另一批 fail。而 error-handling 恰好落在原文三个旗舰例子里的一条上，分歧还在调查中。

第三方对 Jev 的描述能解释一部分差异。Arize 把它写成 TypeSafe 的决策模型：输入文本和 typed questions，输出 choice、score 或 yes-no 的概率，不生成 token；单次并行 pass，70ms–500ms；计费只算输入，$0.042/M input tokens；训练方法是 RLCD。厂商宣称它便宜 40–400 倍、快 40–200 倍。Arize 同时指出「不会幻觉」是过度宣称，它只保证输出不越出 schema，不保证判断对。

BenchLM 的拆解更细：三类问题是 Choice（最多 255 个选项）、Score（2–10 级，可小数）、Noul（yes-no 概率）；Choice 和 Score 会额外返回到概率分布和独立的 confidence，而 confidence 不等于所选选项的概率；输入上限 64,000 tokens。它的标题把定位说得很干脆：Jev cannot write. That is the feature and it is also the limit.

换 judge 换掉的是一段推理，不是判断标准。checklist 写得窄不窄，仍然决定你会收到多少噪声。原文给的操作建议在这里最实用：用你打算长期用的那个 judge 去调 verifier，在几个你已知答案的例子上比较两者的判定。你在 Luna 6 上调顺的规则，换到 Jev 上可能变成另一条规则。

![同一份 checklist 交给两个 judge，得到两份不同的失败名单，一致率 85.9%](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-06-tessl-verifiers-img-03-comparison-judge-fail-lists.jpg)

## 判定有多稳，外部有数字，但不是关于 verifier 的

这里有一处我想标出来。2026 年 10 月，Google 的 Krishna Chytanya Ayyagari 发了一篇关于 judge 方差的论文，标题就把结论写完了：Pinned and Still Unstable。即使 pin 住模型快照、把 temperature 设成 0，verdict 仍然不可复现。

它的数字：pilot 里，frontier judge 单条 verdict 在十次重跑中的翻转率是 3–8%，在 close-call 条目上的条件翻转率是 30–38%；全量 sweep 里，单个 judge 的翻转范围是 0.13%–9.7%；Arena-Hard 是 4.9%，AlpacaEval 2 是 5.3%，在曾经摇摆过的条目上条件翻转约 40%；跨模型的差距很大，Haiku 的翻转率是 0.13%，Sonnet-4-5 是 5–10%。排名层面基本稳定，但相邻名次会互换，九个相邻位置里有四到六个在统计上分不出来。

Zenodo 上那份可复现性笔记补了实现细节：temperature 设成 0 也不够，没设 seed 时 OpenAI provider 会把 temperature=None 映射成 1.0，二十次重跑下，单条判定的不一致率可达约 50%。

这些数字不能直接搬到 verifier 上，原因很清楚：论文测的是 leaderboard 上开放式回答的判定，条目之间差异大，close-call 很多。verifier 的任务窄得多，证据局部化在改动文件里，问题是可以逐条回答的 yes/no。论文自己也说，翻转集中在 close-call 条目上，而一份 relevant_when 写得具体的 verifier，本身就是在试图消灭 close-call。

所以能得出的结论不是「verifier 一定不稳」，而是「不稳的程度取决于规则写得多窄，而这一点没有公开测量」。前者是搬运别人的数据，后者是诚实的边界。

站内此前讨论过 judge 的 false-pass，误放一个不该通过的答案（[法律 Agent 的真正瓶颈，是谁来判它有没有错](https://ntlx.github.io/articles/legal-agent-verifiers)）。那是系统性偏差：方向错了，可以通过换模型、加人工复核来缓解。这里说的是另一种失效：同一份输入、同一条规则，判两次给出不同答案。前者是判错，后者是判不稳。两者要用不同的办法处理，混在一起谈，容易得出「换个模型就好了」的错误结论。另一篇文章把这类要求写成「与什么相比、发现了什么、能否复现、谁来裁决」（[测试通过之后，Agent 还欠你一条证据链](https://ntlx.github.io/articles/agent-evaluation-evidence-chain)）。verifier 目前只回答了其中一条：它每次问的东西一样。能不能复现，仍然要单独测。

## 值得每次都问的问题有多少

原文给的三个好例子都很窄：每个 API route 用 typed response helpers；每条面向用户的错误给出下一步；handler 不记录 request headers、tokens 或 passwords。它也明确说不适合「这段是否可读」这类问题，要求把规则窄化到能用清单检查。

我认为这套机制的瓶颈不在判定成本。

任何团队第一次坐下来写 verifier，都会遇到同一件事：写在 coding standards 里的规则，大半是「我们偏好 X」，而不是「X 是否成立」。前者是品味，后者是判定条件。把品味硬写成 checklist，写出来的是自己的困惑。

所以 verifier 的采纳速度不取决于模型多便宜，取决于团队能把多少条偏好先翻译成判定条件。这件事没有工具能代劳，因为翻译的过程就是团队第一次就「我们要什么」达成一致的过程。

原文有一条建议我觉得只说了一半：审阅者反复留下的同一条 comment，大概适合做成 verifier。

反复出现的 comment 有两种。一种是标准没写下来，每个人都在重复同一句提醒，说明这句话该进仓库。另一种是标准本身没想清楚，大家凭直觉觉得不对，但说不出哪里不对。前者做成 verifier 会立刻见效；后者做成 verifier，等于把混乱固化进 CI，并且是以 error 级别固化。

区分方法很朴素：这条 comment 能不能改写成三个以内的 yes/no 问题，且这些问题的答案不依赖「看情况」。能改写的，是标准；不能改写的，是还没想清楚的标准。站内早前那篇讨论 agent PR 审阅负担的文章，讲的是审阅者被淹没的问题（[AI 写的代码，谁来审？](https://ntlx.github.io/articles/agent-pr-review)）。verifier 能接住的只是第一种 comment，第二种仍然要人来处理。

## 概率性的闸门，会被用成确定性的闸门

还有一处原文没有讨论，我认为风险最大。

测试 flaky 的时候，团队的标准动作是重跑。概率性的 gate 在 error 级别下误报时，团队的标准动作也会是重跑。而重跑确实可能给出不同答案，上面那些方差数字测到的正是这件事。

于是一个本来用来「每次都问同一句话」的机制，会被训练成「问到通过为止」。这不是工具的问题，是人的问题。但工具的分级设计可以加速它，也可以缓解它。

![概率性的闸门接到 error 级别后，团队的动作会变成重跑到通过，同一份代码可能得到两次不同答案](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-06-tessl-verifiers-img-04-flowchart-warn-then-gate.jpg)

能做的有三件。把还不确定的规则留在 warn，别急着升 error。把规则写得窄到 close-call 很少出现，而不是靠重跑解决边界情况。对 error 级别的规则记录 verdict 历史，而不是只存最新一次，如果一条规则在同一份代码上反复摇摆，它的失败率本身就是需要看的数据。

判断的顺序应该是先看这几句话问得对不对，再看它判得准不准。前者是你自己的活；后者取决于模型、你选的 judge 和规则的宽度。

如果我要在自己的仓库里落地，会先写三到五条一眼能回答的规则，跑两周 warn，看它们在自己的 diff 上到底问出了什么。这两周的价值不在通过率，在于你会看出哪几条规则是在描述品味，哪几条能判。

原文那张示意图把一次运行的四个部件标了出来：verdict、gate、rule、location。后两个更值得盯。判定给得对不对，先看问题问得对不对，再看它指到的位置是不是真的。

![Tessl 原文 hero 图：一次 tessl change verify 运行标注出 verdict、gate、rule、location 四个部件](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-06-tessl-verifiers-img-05-source-hero-verify-run.png)

## 参考资料

- [Verifiers: enforce your repo's rules on every agent change（Amy Heineike、Simon Maple，Tessl Blog，2026-10-15）](https://tessl.io/blog/verifiers-enforce-your-repos-rules-on-every-agent-change)
- [Verifiers overview（Tessl Docs）](https://docs.tessl.io/codifying-and-enforcing/verifiers-overview)
- [Verify agent changes in CI（Tessl Docs）](https://docs.tessl.io/codifying-and-enforcing/verify-agent-changes-in-ci)
- [Jev is 13.6x faster and 2.7x cheaper than GPT Luna 6 for Tessl Verifiers（Tessl Blog，2026-09-23）](https://tessl.io/blog/jev-is-136x-faster-and-27x-cheaper-than-gpt-luna-6-for-tessl-verifiers-try-it-yourself)
- [Pinned and Still Unstable: Within-Judge Verdict Variance and the Noise Floor of LLM-as-Judge Leaderboards（Krishna Chytanya Ayyagari，arXiv，2026-10-14）](https://browse-export.arxiv.org/pdf/2609.33044)
- [Non-determinism in LLM-as-Judge Graders: An Empirical Reproducibility Note（Tamba Research Academy，Zenodo，2026-06-13）](https://zenodo.org/records/20674090)
- [TypeSafe Jev: Can Decision Models Replace LLM Judges?（Arize AI，2026-09-18）](https://arize.com/blog/typesafe-jev-llm-judge/)
- [Jev cannot write. That is the feature and the limit.（BenchLM，2026-09-22）](https://benchlm.ai/blog/posts/what-is-jev)
- [Tessl Pricing](https://tessl.io/pricing)

## 延伸阅读

- [一条规则的强度，等于它被撤销的难度](https://ntlx.github.io/articles/agent-charter-four-levers)
- [AI 写代码最缺的，不是模型，而是传感器](https://ntlx.github.io/articles/coding-agent-sensors)
- [测试通过之后，Agent 还欠你一条证据链](https://ntlx.github.io/articles/agent-evaluation-evidence-chain)
- [法律 Agent 的真正瓶颈，是谁来判它有没有错](https://ntlx.github.io/articles/legal-agent-verifiers)
- [AI 写的代码，谁来审？](https://ntlx.github.io/articles/agent-pr-review)
