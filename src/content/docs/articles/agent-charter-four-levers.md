---
$schema: starlight
title: 一条规则的强度，等于它被撤销的难度
description: agent 失败的地方，往往不是仓库没写规则，而是仓库同时活着两套都能跑的做法。四个杠杆按撤销成本排序：能说服的、能拿走的、能拒绝的，以及删不掉的。
date: 2026-10-22
category: ai-coding
primarySourceUrls: ["https://tessl.io/blog/how-to-constrain-a-coding-agent-using-only-files-you-own"]
---

那个 agent 没有乱改代码。它抄了它面前的那一份。

Ian Johnson 在 Tessl 博客里复盘了一次实验，设定粗暴到近乎不礼貌：一张 ticket，一个不放任何约束文件的仓库，跑一次。仓库跨三个年代：2021 年冻结、谁都不许碰的模块，2023 年的巨石文件，2026 年写得很规矩的领域层。前两者加起来，数量是后者的十倍。

agent 一次都没打开那份正确的代码。它走进巨石文件，用 `random.randint` 掷骰子，序列化结果时不带 seed；它把一个日志条目重写了一遍，用的还是一个确实存在、确实能跑的 helper；它还两次伸手进了那个冻结模块。

八项检查，过了一项。

Johnson 的总结只有一句：那个仓库里没有一处是坏的，agent 只是抄了它面前的代码。真正能拦住它的东西，全都是他还没写下来的文件。

这句话最顺手的读法是"快去写文档"。我不这么看。

![文章核心信息图：一条规则的四个深度与撤销成本阶梯](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-22-agent-charter-four-levers-img-00-infographic-core-summary.png)

## 仓库没坏，它只是有两份答案

那次失败的条件不是没写规则。是写了两份，而两份都合法。

Johnson 自己的 workshop 仓库里就摆着这个局面：一个模块从 session 取请求权限，另一个直接从请求体里读。两套都在线上跑，两套都能用，于是 charter 必须挑一个。它的工作就是告诉 agent，两种真实写法里该抄哪一种。他说多数存量改造都是这件事。

![两套都能跑的做法，agent 只能猜该抄哪一套](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-22-agent-charter-four-levers-img-01-illustration-two-answers.png)

这就把规则的收益算清楚了。他给的判据很硬：代码本来就遵守的规则，约束不了任何东西。理由也直接，agent 靠模仿代码也能走到同一个答案，你没法分辨是哪条规则起了作用。

顺着这条判据往下推一步，会得到一个不太舒服的结论：charter 不是风格指南，是裁决清单。它值多少钱，取决于它替仓库解决了多少处真实分歧，而不是它覆盖了多少行代码。

这也解释了为什么有些 CLAUDE.md 写得很长，读起来却不像在解决任何问题。它们大部分在描述，这个仓库是什么、用了什么框架、目录怎么分。描述不承担裁决，写起来很舒服，读起来也顺，但它改变不了 agent 的选择。值钱的是处方，而处方只在仓库自己打架的地方才值钱。

## 同一条裁决，四个深度

Johnson 把能约束 agent 的文件分成四类：`CLAUDE.md` 是 instruction，`.claude/rules/` 是 constraint，`.claude/commands/`、skills、agents、`settings.json`、`.mcp.json` 是 capability，`.claude/hooks/` 是 check。前三类改变 agent 读什么、够得着什么，只有最后一类能说不。

这个分法本身就有用，因为绝大多数团队只写了第一类。他给的自检干脆得有点讨厌：在自己的仓库里跑一遍 `ls -R .claude/`，如果答案只有一个 settings 文件，那你拥有四个杠杆，只发了一个。

我认为它还能再压一层。这四个不是四类文件，是同一条决定往下压的四个深度：

- 说清楚：写进 `CLAUDE.md`，指望它被读到、被理解、被执行。
- 圈住范围：写进 `.claude/rules/`，只在碰到匹配路径时加载，把"全局应该"变成"走到这里必须"。
- 拿掉选项：把不该用的入口从 commands、skills、agents、MCP 里摘掉，让做错的那条路根本不在手边。
- 当场拒绝：hook 在写发生之前返回拒绝。

![四个杠杆：前三类改变读什么和够得着什么，只有 hook 能拒绝](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-22-agent-charter-four-levers-img-02-source-four-levers.jpg)

四个动词，一条决定的四种硬度。

能力那一层最容易写歪。Johnson 给的族测试很好用：拿走一个东西，如果 agent 能做的事变少了，它才是能力；如果 agent 照做不误、只是做得更差，那你写的是一条规则，只是把它打扮成了 skill。这个测试不问"我写了什么"，只问"拿掉之后行为变不变"，所以它挡得住自我感动。

关于边界这件事，我在[《从工作台到沙箱：Agent 的自主性需要可见边界》](https://ntlx.github.io/articles/claude-code-agent-visible-boundaries)里只谈了一半：权限、身份、人工介入点要让操作的人看得见。这里是另一半。边界不只画给人看，也要画到 agent 够不着的地方。

## 说服和拒绝之间，差的是一次删除

原文标题承诺的是"只用你自己拥有的文件"。文件确实是你的：进版本库，跟着 clone 到每一台机器。但"你的"这个词藏了两种权利，而它们经常不是一回事。

写入权，是你能不能把这个文件写进仓库、让它随代码分发。执行权，是这条约束在一次具体运行里能不能被绕过。

四类文件在前一种权利上完全平等，在后一种上分四档。`CLAUDE.md` 和 path-scoped 规则靠阅读生效，而任何读进去的东西都可以被争论。Johnson 说得直白：周围代码和规则矛盾时，agent 会说服自己绕开规则。capability 不参与争论，它改变的是可达性。hook 也不参与争论，它是一个在回合内跑的谓词，返回拒绝，没有谈判空间。

但 hook 仍然是一个文件。Johnson 在另一篇讲闸门归属的材料里写得很坦率：hook 便宜、机械，而被它治理的 agent 可以删掉它。

![仓库里的 hook 可以被删，仓库外的 CI 闸门不行](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-22-agent-charter-four-levers-img-03-illustration-delete-the-hook.png)

于是四个杠杆里，没有一个在执行权上是绝对硬的。只要约束的载体是可写的文件，被约束的一方就留着改写它的可能。差别只是难度：能被说服的低，能改配置的中，能删文件的高，你根本改不到的才算硬。

原文有一个细节常被当成工程品味读过去：一条谓词四十行 Python，一个挂成 `PreToolUse` hook 拦住写入，另一个挂成 `make gate` 交给 CI 跑。"一个谓词，两个挂载点，不重复逻辑"，听起来像是在夸自己省代码。

我认为它的价值在别处。这两个挂载点的撤销成本不一样：hook 在仓库里，CI 的 gate 在仓库外。同一条谓词，一处可以被治理者删掉，一处不能。省代码只是顺带的，它真正做的是给同一条规则配了两种硬度。

这条推论对实践的直接含义是：你最不能接受被违反的那条规则，不该只住在仓库里。仓库里那一份负责让 agent 当场停手，仓库外那一份负责让绕过它的人过不了合并。

## 第九项检查不是剩下的那一项

那个评分器一共九项检查，程序能定八项：diff 有没有越界、每次掷骰带没带 seed、日志是追加还是重写，诸如此类。它们都是能用脚本回答、不需要观点的问题。开头那一跑的一分之八，说的就是这八项。

第九项叫 `authority.semantic`，问的是这个访问检查对这个功能对不对。没有谓词能回答它，所以评分器打一个问号，然后等。

八项全绿的那一跑，一个 reviewer 子 agent 读了 diff，把那个问号填了。它找出三处。

handler 用 `session.is_dungeon_master()` 做闸门，结果玩家给自己的角色存档也被拒了，而验收标准第四条明确允许。被魅惑的战斗单位在持续时间内归施法者控制，handler 没考虑这一点，ticket 也没写，agent 本该把这个歧义提出来，而不是自己挑一个答案。测试通过一个 module global 搭请求，所以只覆盖了拒绝路径。

八项全绿，三个真实缺陷，其中一个是权限 bug。

![八项机械谓词全绿，第九项留给 reviewer 判断](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-22-agent-charter-four-levers-img-04-source-checks-vs-review.jpg)

Johnson 由此得出结论：绿色记分卡不等于正确变更，它只意味着没有机械可检测的问题，而那段距离正是人该看的地方。我同意，但想再往前推一步。第九项不是机械检查剩下的残差，它是前八项的前提。

你得先能回答"这个检查对这个功能对不对"，才知道哪八件事值得被机械化。反过来，如果你说不清第九项，你写出来的八项大概率在检查形式，而 agent 恰好很擅长满足形式。那个只走拒绝路径的测试就是证据：它通过了，因为它检查的东西确实成立，只是它检查的不是那件事。

这也是为什么"给 agent 一套检查"比"给 agent 一段规范"难得多。规范可以写得很全，检查必须写得很少；而能写少的前提，是你知道什么不能少。

## 规则会过期，agent 不会怀疑

原文最后一节讲生命周期：规则从部落知识迁到 charter，再迁到 harness，再迁到 factory，落在哪一层取决于这个关切归谁管。方向是对的，但缺了一段。迁移之后呢？

代码会变。一次目录重构，一条 path-scoped 规则匹配的路径就不存在了；一次架构合并，当初"两个模块只能选一个"的分歧消失了，裁决还挂在那里。规则不会自己跟着代码走。

于是当初正确的规则会变成错误规则。而错误规则比没有规则更糟：没有规则的时候，agent 至少还会看代码；有了一条过期的规则，它会自信地照做，还会引用它。

Johnson 自己的书里有两个补丁：每条规则写明造成它的那起事故，带日期和代价；每条规则写明失效期；再加一条，加一条必须删一条。Keystone 把这件事做成了一个 pruning 飞轮，定期审计，把不再适用的规则归档，理由保留下来。"归档时保留理由"这半句，大概是整套设计里最容易被跳过、也最该保留的：理由比规则活得久，规则删掉之后，理由还能告诉你下次要不要再写一遍。

![规则手册会过期，过期页面归档时保留理由](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-22-agent-charter-four-levers-img-05-illustration-expiring-rules.png)

我自己的仓库是这样长起来的。根目录的 `AGENTS.md` 被定成仓库级 agent governance 的唯一共享权威源，只做导航；内容与发布规则拆到 path-scoped 的 `src/content/AGENTS.md`；`.agents/skills/` 下另有一章管技能自己的生命周期，custom、managed、vendored 三类各有各的处置方式，行为变更升 minor，纯文档修正升 patch。`npm run verify` 串起 Agent 测试、架构校验、历史 URL 兼容性、构建和性能预算。

写到某一天我发现，`AGENTS.md` 里已经长出了一节，专门用来治理 `AGENTS.md` 自己。这不是设计出来的，是攒出来的。它印证了 Johnson 说的那条迁移路径，也暴露了原文没写的那一半：治理文件会自我繁殖，而没有任何机制会自动删掉过期的部分。

方法论本身很短。拿一张 ticket，在完全没有 charter 的仓库里跑一遍，用你事先写好的检查打分。那一跑就是事故。之后每写一条规则，都指回它。然后一层一层加杠杆，同一张 ticket 重跑，说清楚哪一层推动了哪一项。

Johnson 说你最后会发现两件事：有些规则约束不了任何东西，因为代码本来就同意它们；至少有一条你在意的规则，机器检查不了，所以它值得一个人花时间。

我想补第三件：还有一批规则会在下一次重构之后变成错的，而它们不会自己消失。

所以我现在判断一份 charter，只看两件事：它替仓库裁决过几处分歧，以及它上一次删掉规则是什么时候。

## 参考资料

- Ian Johnson, [How to constrain a coding agent using only files you own](https://tessl.io/blog/how-to-constrain-a-coding-agent-using-only-files-you-own), Tessl Blog, 2026-10-20
- Ian Johnson, [Harness Engineering: Building Reliable Workflows Around Non-Deterministic Agents](https://leanpub.com/harness-engineering), Leanpub
- Ian Johnson, [Making AI reliable and governable](https://www.tacoda.dev/harness-reliable-governable)
- Ian Johnson, [Whose Gate Is It](https://www.tacoda.dev/whose-gate-is-it)
- Ian Johnson, [Keystone: Project Harness Installer](https://dev.to/tacoda/keystone-project-harness-installer-2b7m)
- Anthropic, [How Claude remembers your project](https://code.claude.com/docs/en/memory)
- Anthropic, [Steering Claude Code: skills, hooks, subagents and more](https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more)
