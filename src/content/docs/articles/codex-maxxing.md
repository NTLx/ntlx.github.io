---
$schema: starlight
title: 我让 agent 去洗澡，回来时它把事儿办完了
description: 看了 Jason Liu 的 Code-maxxing，才发现我们用 AI 的方式一直停留在聊天框里
date: 2026-05-22
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-22-codex-maxxing-img-00-infographic-mental-model-shift.png)

Jason Liu 发了一条推文，23 万人看过，1700 多人点赞。

推文里有 9 条 Codex 的使用技巧——持久线程、语音输入、实时引导、共享记忆、心跳自动化、远程控制、目标驱动、侧边栏……看起来是一份很不错的 tips 清单。转发里有人在讨论 /goal 功能的 5 小时限制，有人在抱怨 UK 地区被禁用了某个功能，有人想要 pause 按钮防止引导太迟。

很正常，技术社区的讨论总是围绕功能边界转。

但我在评论区看到一条留言，大概是这样写的：

*shared memory section 是人们跳过的部分，但恰恰是最重要的。context window 中的 agent 记忆默认是临时的。写下来或者失去它。*

这句话让我停下来。

我回过头重读了 Jason 原文的 memory 部分。确实，这一节在 9 条里不性感——没有"洗澡回来退款已到账"的爽感，没有"一键自动检查 Slack"的便捷，没有"迁移 Python 到 Rust"的技术炫技。它只是说：把你的 Obsidian vault 放在 GitHub 上，让 agent 在那里写笔记，然后你用 git diff 看它写了什么。

很无聊。但也许是最重要的一条。

## 我们一直把 AI 当聊天工具用

我先承认一件事：我自己用 Claude Code 的方式，本质上还是"我问它答"。

我丢一段代码过去，等它分析完，看结果，不满意再追问。这个过程和我在 Slack 上问同事"这段代码你觉得怎么样"没有根本区别——只是同事要下班，AI 不用。

Jason 那篇文章里有一句话我读了两遍：

*The more Codex gets places to remember, revisit, inspect, and act, the less my work dies between prompts.*

"工作不会在 prompt 之间死掉。"

这句话的反面是：我们现在的大部分工作，就是在 prompt 之间死掉的。

你发一个 prompt，等回复，再发一个，再等。中间你切出去看了个邮件，回来发现上下文窗口已经满了。你切出去吃了个饭，回来发现 agent 走错了方向但没人纠正。你切出去睡了个觉，回来发现……好吧，你根本不会让 agent 在你睡觉时干活，因为你不信任它。

不信任的原因不是 AI 不够聪明，而是它没有地方"记住"事情。

## 记忆不在对话框里，在文件系统里

Jason 的 memory 做法很简单：用一个 Obsidian vault 做 agent 的笔记本。

```
vault/
├── TODO.md
├── people/
├── projects/
├── agent/
└── notes/
```

然后在顶层放一个 AGENTS.md，告诉 agent："你学到什么、做了什么决定、关了什么 loop，就写到对应的文件里。"

这个做法的精妙之处在于三个词：可审查、可编辑、可复用。

可审查，是因为 vault 本身是一个 git repo。agent 每次修改文件，你都能看到 diff——它觉得什么重要、什么不重要，一目了然。你不需要 trust，你只需要 verify。

可编辑，是因为文件就是文件。你不需要在某个 UI 里点"编辑记忆"，直接改 markdown 就行。改错了就 git revert。比任何内置记忆系统都可靠。

可复用，是因为不同的 thread 可以读同一个 vault。你的"首席参谋"线程和"代码审查"线程共享同一套背景知识，不需要你重新喂 context。

评论区有人用了一句话概括：*vault-as-memory 之所以有效，是因为它是可审查的。diff 它、git blame 它、回滚它。*

我想了想，这不就是我们写代码的方式吗？

我们不把代码写在聊天框里。我们把代码写在文件里，用版本控制管理变更，用 diff 审查修改。Jason 只是把同样的原则用在了 agent 的记忆上。

区别只在于：大多数人还没意识到，跟 AI 说话产生的信息，也是值得版本控制的资产。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-22-codex-maxxing-img-01-flowchart-memory-comparison.png)

## 把工作"交出去"而不是"聊完"

Jason 文章里最让我起鸡皮疙瘩的案例不是技术层面的，是一个生活场景：

他的包裹被偷了。亚马逊说跟人工客服沟通要等 25 分钟。

他创建了一个 thread，告诉 agent：每 5 分钟检查一次客服是否上线。上线了就帮我争取退款。客服回复后，改成每 1 分钟检查一次，加快响应速度。

他去洗了个澡。

出来时，退款搞定了。

这个案例的关键不在"AI 帮我退了款"——客服对话本身可能 AI 做得不完美。关键在于：他把一件需要"等待 + 判断 + 回应"的工作完整地交了出去，然后自己离开了。

我们平时用 AI 不是这样用的。我们习惯的是：

```
我：帮我写个登录功能
AI：好的，这是代码……
我：这里改一下
AI：改好了……
我：不错，再看看那个接口
```

这是聊天。你一句话我一句话，像打乒乓球。球停在你手里的时候，游戏就停了。

Jason 的工作方式是：

```
我：这个包裹要退款，流程是这样。你每隔 5 分钟检查一次。
（我去洗澡）
（agent 检查 → 客服上线 → 发起对话 → 等待回复 → 调整频率 → 完成退款 → 更新 vault）
（我回来，看结果）
```

这不是聊天。这是委托。

区别在哪里？区别在于你给 AI 的是不是"一个可以独立运行的任务"，而不仅仅是一句"你现在帮我做这个"。

独立运行的任务需要三个条件：明确的完成标准（退款拿到钱就算完）、执行策略（多久检查一次）、信息通道（agent 能接触到的系统——亚马逊客服界面）。

缺一不可。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-22-codex-maxxing-img-02-comparison-chat-vs-delegation.png)

## 心跳：让线程从"等待"变成"主动"

Jason 有一个叫"Chief of Staff"的线程，每 30 分钟自动跑一次：

- 检查 Slack 和 Gmail 里有没有需要他处理的未读消息
- 帮他排优先级
- 如果有人提问，尽可能深地研究答案，然后起草回复（不发）

等他回到 Slack，回复草稿已经等在那里了。他只需要决定发不发。

这里的关键不是"自动检查"这个功能本身，而是它改变了线程的状态——从"被动等待用户输入"变成了"主动循环执行"。

Jason 给这个功能起了个名字叫 Heartbeat。心跳。

很准确。没有心跳的东西是死的，有心跳的东西才是活的。

大多数人的 AI 线程是没有心跳的。你发一条，它回一条，然后它就睡了。等你想起来再发下一条，它才醒。中间的空白里，没有任何事情发生。

Jason 的线程有心跳。它自己会醒来，自己会检查条件，自己会决定是否该做点什么。你不是在跟一个聊天机器人说话，你是在管理一个小型团队。

另一个例子是他做动画项目的反馈循环：在 Slack 发一个视频，让 agent 每 15 分钟检查一次评论。有新反馈就自动重新渲染，然后把新版本贴回 Slack 并 @ 评论的人。

这个 loop 跨越了三个工具边界：Slack 拿反馈，Remotion 做渲染，@computer 做上传。单独看每个功能都不稀奇，组合起来就变成了一个不需要你坐在那里盯着的反馈系统。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-22-codex-maxxing-img-03-scene-heartbeat-amazon-refund.png)

## 目标与验证：没有验收标准的雄心只是愿望

Jason 最近做了一个实验：把 Python 的 Rich 库迁移到 Rust。

他没有说"帮我迁一下"。他给的目标是：*迁移 Rich 到 Rust，但必须通过原库的所有单元测试。*

原库有一个大的单元测试套件。这个测试套件就是验收标准——Rust 版本不过测试，就不算完成。

他写了一句话：*Execution is only as good as the goal and the verification you give it. Ambition without verification is just a wish.*

执行力取决于你给它的目标和验证。没有验证的雄心只是愿望。

这句话我想了一会儿。

我平时让 AI 干活，很少给明确的验收标准。我说"写个登录功能"，但不说"登录成功跳转到 dashboard，失败显示具体错误信息，连续 5 次失败锁定账号"。我说"重构这个模块"，但不说"重构前后所有测试必须通过，性能不能下降"。

结果就是 AI 做了一件事，但那件事跟我心里想的不是一回事。然后我开始"纠正"——但纠正本身也缺乏标准，变成了另一个模糊的对话。

Jason 的做法是：先定验收标准，再干活。测试过了就过，没过就继续。不聊天，不商量，不"你觉得这样行不行"。

这个做法对非科班出身的人尤其重要。因为我们更容易在"AI 做出来了但我说不清哪里不对"和"AI 做的完全不是我想要的"之间来回摇摆。有了明确的验收标准，摇摆就变成了判断：过还是没过。


## 回到那条被跳过的记忆线

23 万人看了那条推文。我猜至少有 20 万人跳过了 memory 那节，直接去看 Heartbeats 和 Remote Control——因为它们更"酷"。

但让我重新想想 Jason 整篇文章的架构。

持久线程让你有地方积累上下文。语音输入让你把模糊想法喂进去。Steering 让你在过程中纠正方向。Heartbeats 让线程自动循环。Goals 给你验收标准。侧边栏让你直接审查产物。

这些都很好。但没有 memory，它们全是临时的。

线程压缩了，历史丢了。你离开三天回来，agent 不记得你上次说了什么。你开了十个 thread，每个都在不同的上下文里从零开始。你的"首席参谋"不知道你的"代码审查"线程里做了什么决定。

记忆是那个把一切串起来的东西。它不是功能列表里的一条，它是让其他所有功能产生复利的基础设施。

Jason 说：*我不在乎 AI 能不能替我写代码。我在乎的是，我离开之后，我的工作还能不能继续往前走。*

我想了想，这大概就是我读这篇文章最大的收获。

我一直把 AI coding 工具当成"更聪明的助手"——它写得快、懂得多、不会累。但 Jason 在用的不是一个助手，而是一个系统。一个有记忆、有节律、有验收标准、可以独立运行的系统。

助手等你说话。系统自己往前走。

区别不在 AI 的能力，在你对它的定位。

*你平时用 AI 干活，是在等它回复，还是在等它做完？*

## 原文参考

> Jason Liu (jxnlco) - Codex-maxxing: 9 tips from the Codex team
> https://jxnl.co/writing/2026/05/10/codex-maxxing/
>
> Jason Liu (jxnlco) - X thread with screenshots
> https://x.com/jxnlco/status/2057153744630890620
>
> Community discussion and reactions
> https://xcancel.com/jxnlco/status/2057153744630890620
