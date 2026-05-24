---
$schema: starlight
title: 我去洗澡，让 Agent 继续干活
description: 真正改变工作方式的不是 Agent 会聊天，而是你离开之后，它还有没有上下文、工具、节律和验收标准继续往前走。
date: 2026-05-24
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-24-codex-maxxing-img-00-infographic-operating-loop-1.png)

Jason Liu 那篇《Codex-maxxing》，我一开始是当技巧帖看的。

九条建议：持久线程、语音输入、steering、memory、computer use、remote control、heartbeats、goals、side panel。每一条都能单独拿出来讲。你可以说 memory 很重要，可以说 heartbeat 很酷，也可以说 goals 终于把“让 AI 干大活”这件事变得靠谱一点。

但我第二遍读的时候，反而觉得“技巧”这个词有点误导。

Jason 真正在讲的，不是怎么把 Codex 用得更熟练，而是他对“工作”这件事的单位感变了。

以前我们把 AI 当成一个回答器。你问，它答。你再问，它再答。哪怕它一次能写很多代码、总结很多材料、生成很长的计划，本质上还是一轮对话。工作停在回复里，下一步停在你手里。

Jason 那篇文章里最打动我的，是一句很朴素的话：他学会了给工作一个 operating loop。

这句话让我停了一下。

不是给 AI 一个 prompt，不是给它一份计划，不是让它更聪明，而是给工作一个能持续运行的回路。

这个差别很大。

## 不是等回复，而是等做完

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-24-codex-maxxing-img-01-delegation-scene.png)

原文里最容易被记住的，是那个 Amazon 退款的例子。

Jason 的包裹被偷了。Amazon 告诉他，要等大概 25 分钟才能和人工客服说上话。他创建了一个带 `@computer` 的 thread，告诉 Codex：

- 每 5 分钟检查一次客服有没有加入
- 如果客服来了，就尽力帮我争取退款
- 一旦客服回复，把检查频率改成每 1 分钟，这样响应更快

然后他去洗澡。

等他出来，退款办好了。

这个例子很容易被讲成“AI 替我搞定退款”，但我觉得那不是重点。客服沟通本身并不神奇，真正神奇的是那段被等待切碎的时间终于可以被交出去。

我们生活里有很多这样的工作。

它们不是特别难，但特别占注意力。等一个网页状态变更，等客服上线，等 Slack 里有人回复，等 PR review 出新评论，等部署完成后把链接发给别人。真正消耗人的，不是每一步的智力难度，而是你必须坐在那里守着。

过去我们让 AI 做事，大多还是这种节奏：

```text
我：帮我写一下
AI：写好了
我：这里改一下
AI：改好了
我：再看那个问题
AI：这是分析
```

这叫等回复。

Jason 的方式更像：

```text
我：这件事的目标是退款成功。你每 5 分钟检查一次，
    客服出现后提高频率。需要我提供敏感信息时停下来。
我离开。
Agent：检查 → 等待 → 回复 → 再检查 → 完成 → 汇报。
```

这叫等做完。

等回复时，AI 是聊天对象。等做完时，Agent 是被放进一个小回路里的执行者。

我觉得这就是这篇文章最核心的分界线。

## Operating loop 由什么组成

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-24-codex-maxxing-img-02-comparison-chat-vs-loop-1.png)

“让 Agent 继续干活”听起来像一句夸张的话，但 Jason 原文其实一点也不玄。他把这件事拆成了几个很具体的部件。

第一是 durable thread。

重要工作不应该每次都新开一个聊天。一个产品、一个项目、一个长期关注的主题，本来就有历史、偏好、旧决定和未关闭的线索。如果每次都从零解释，Agent 看起来再聪明，也是在反复重建同一个世界。

Jason 保留了多个 pinned thread：Chief of Staff、Agents SDK、OpenAI CLI、Codex for open source、Twitter monitor。它们不是短聊天，而是长期工作空间。compaction 让线程可以持续存在，pinned 让它们可以被快速召回。

第二是 memory。

长线程能记住很多东西，但如果有用的信息只困在 thread 里，它就还是脆弱的。线程可能压缩坏，可能成本太高，可能换一个 thread 就读不到。

所以 Jason 把 Obsidian vault 当成 Agent 的工作记忆：

```text
vault/
├── TODO.md
├── people/
├── projects/
├── agent/
└── notes/
```

顶层放 `AGENTS.md`，告诉 Agent：学到关于人的信息，推进项目，关闭 open loop，就更新对应页面。

这个做法吸引我的地方，不是 Obsidian 本身，而是它把“记忆”变成了文件。文件可以 diff，可以 edit，可以 revert，可以被另一个 thread 重新读取。它不是神秘的模型记忆，而是工作留下的结构化痕迹。

第三是 tools。

如果 Agent 只能在聊天框里回答，它没法接触真实工作。真实工作在浏览器里，在 Slack 里，在 Gmail 里，在 Calendar 里，在桌面 GUI 里。

Jason 区分了 `$browser`、`@chrome`、`@computer`：一个适合本地 web surface，一个适合登录态浏览器，一个适合必须点击桌面 GUI 的工作。再加上 Slack、Gmail、Calendar 这些 connectors，Agent 才真正有了手脚。

第四是 heartbeat。

这是我觉得最容易低估的一点。

一个 pinned thread 再长，如果它只能等你下一次说话，它还是静止的。heartbeat 让线程可以每隔一段时间自己醒来：检查 Slack，检查 Gmail，检查 PR，检查评论，检查客服有没有上线。

Jason 的 Chief of Staff thread 每 30 分钟检查 Slack 和 Gmail：哪些未回复消息需要他注意，哪些问题要深入查资料，哪些回复可以先起草。但它不直接发送，最后发不发还是人决定。

这很关键。Agent 不是夺走控制权，而是提前完成那些耗时的上下文收集和草稿准备。

第五是 goals。

长期任务不能只靠“帮我做一下”。Jason 举了一个迁移 Rich 到 Rust 的例子。强目标不是“把这个计划实现一下”，而是“迁移到 Rust，但必须通过原库的测试套件”。

测试套件给了 Agent 一个 oracle：没过就是没做完，过了才算接近完成。

这句话我很喜欢：没有验证的雄心只是愿望。

很多时候我们觉得 AI 做得不对，不是因为它能力差，而是因为我们没有给它一个可以判断对错的标准。没有测试，没有 benchmark，没有验收条件，没有必须保持通过的端到端流程。最后它只能生成一个“看起来像完成了”的东西。

第六是 review surface。

side panel 的意义不只是预览。Jason 说它让 Codex 不再只是聊天 app，而是工作发生的地方。

Markdown、表格、PDF、slides、网页、Storybook、Remotion 动画，这些产物可以直接在同一个界面里被查看、标注、修改。人审查的对象和 Agent 操作的对象终于是同一个东西。

这六个东西合起来，才是 operating loop。

持久线程负责连续性，memory 负责沉淀，tools 负责行动，heartbeat 负责节律，goals 负责终点，side panel 负责审查。

少一个，都还可以工作；但连起来，工作方式就变了。

## Memory 不是“让 AI 更懂我”，而是让工作不丢

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-24-codex-maxxing-img-03-framework-memory-as-diff-1.png)

我以前听到“AI memory”，下意识会想到个性化：它记住我的偏好，记住我喜欢短回答，记住我常用什么技术栈。

Jason 的 memory 让我换了个角度。

真正重要的不是“AI 更懂我”，而是“工作不要丢”。

一个项目为什么推进不动？谁上次说要补材料？哪个决定已经做过？哪个方向已经被否掉？某个人偏好先看 demo 还是先看文档？这些信息如果只存在聊天记录里，就很容易在下一次上下文切换时蒸发。

把它们写进 vault，本质上是在给工作建账。

这和写代码很像。

我们不会把代码只留在聊天框里。我们会把代码写进文件，提交到 Git，用 diff 审查，用 history 回溯。可是跟 AI 一起工作时产生的大量判断、背景、决定，我们却常常任由它们埋在对话里。

Jason 说他不想让 evergreen threads 在 conversation history 里悄悄积累 vibes。他希望它们写下变化：这个人偏好什么，这个项目等什么，这个决定已经做了，这个 loop 已经关掉。

这句话很实在。

“积累 vibes”是很多 AI 长对话最后的问题。它好像知道一些东西，但你说不清它到底知道了什么；它好像有上下文，但你无法审查上下文质量；它好像记得你，但你不知道它是不是记错了。

文件系统把这种模糊感压回到工程问题：

- 写到哪里？
- 写了什么？
- 有没有 churn？
- 能不能 diff？
- 错了怎么改？
- 下一个 thread 能不能读？

这才是 memory 的价值。

不是让 Agent 变得更像一个人，而是让工作产生可审查的痕迹。

## 我真正被说服的是“离开之后”

读这篇文章之前，我对 coding agent 的想象还是“更强的助手”。

它能写代码，能查资料，能解释错误，能生成测试，能帮我改 UI。这些都很好，但它们没有改变我和工作的关系。我仍然坐在这里，一轮一轮地把注意力喂给它。

Jason 那篇文章让我意识到，真正的变化不是 Agent 能不能替我写代码，而是我离开之后，工作还能不能往前走一点。

这个“一点”很重要。

我不期待 Agent 彻底接管复杂判断，也不期待它替我做所有决定。很多事情它必须停下来问。涉及发消息、花钱、账号权限、不可逆操作、人际关系和责任边界时，人必须保留最后控制权。

但在这些边界之内，有大量工作其实可以继续往前滚一小段。

它可以先收集上下文。

它可以先看有没有新反馈。

它可以先跑测试并归纳失败。

它可以先重渲染一个版本。

它可以先起草回复但不发送。

它可以先把今天关闭的 loop 写进 vault。

这就是“离开之后”的价值。不是完全自动化，而是减少那些因为我短暂离开就彻底停摆的工作。

以前我总是问：这个任务能不能让 AI 做？

现在我会多问一句：这个任务能不能被设计成一个小 loop？

如果答案是可以，那 prompt 就不应该只是“帮我做 X”。它应该包括：

- 目标是什么
- 哪些资料和上下文可用
- 能接触哪些系统
- 多久检查一次
- 什么情况算完成
- 什么情况必须停下来问我
- 结果写到哪里
- 哪些变化要沉淀为记忆

这听起来麻烦，但其实是把原本藏在脑子里的管理工作显式写出来。

Agent 不是因为你写了一句神奇 prompt 就会可靠。它可靠，是因为你给了它边界、工具、节律和验收标准。

## 从聊天框搬到工作台

我最后想到的一个比喻是：我们正在把 AI 从聊天框搬到工作台。

聊天框里，AI 的主要产物是回答。

工作台上，AI 的主要产物是被推进过的任务。

这两者的设计完全不同。

聊天框追求的是“这一轮答得好不好”。工作台追求的是“这个 loop 有没有让事情前进”。聊天框里的上下文可以含混，工作台里的状态必须能被检查。聊天框里的错误可以下一轮纠正，工作台里的错误最好能被 diff、测试、回滚挡住。

Jason 的 Codex 用法让我觉得，未来真正厉害的人可能不是最会写 prompt 的人，而是最会设计 loop 的人。

他知道哪些任务可以交出去，哪些必须自己盯着。

他知道什么信息要写进 memory，什么只是临时噪音。

他知道什么时候给 heartbeat，什么时候不要制造自动化骚扰。

他知道一个 goal 必须配什么 verifier。

他知道工具权限应该开到哪里，哪里必须让 Agent 停下来。

这不是“AI 替代人”的叙事。

更像是人开始学会给自己的工作搭一套小型操作系统。

Jason 原文最后说：Codex 得到越多可以记住、重访、检查和行动的地方，我的工作就越不会死在 prompt 之间。

我觉得这就是整篇文章最重要的一句话。

不是 Agent 更像人了。

而是工作终于不必每次都死在聊天框里。

*你现在手上的哪件事，不是需要 AI 回答一句，而是需要一个能继续运行的小回路？*

## 原文参考

> Jason Liu (jxnlco) - Codex-maxxing: 9 tips from the Codex team
> https://jxnl.co/writing/2026/05/10/codex-maxxing/
>
> Jason Liu (jxnlco) - Getting the most out of Codex
> https://x.com/jxnlco/status/2057153744630890620
