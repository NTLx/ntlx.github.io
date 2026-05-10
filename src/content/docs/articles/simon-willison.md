---
$schema: starlight
title: 开源社区最硬的 AI 禁令：代码再完美，也不收
date: 2026-05-01
description: 你写的 PR 再完美也没用——Zig 要的不是代码，是人。
coverImage: cover.png
---

今天刷到 Simon Willison 博客上的一条短讯，愣了好几秒。

事情是这样的：Zig 这个编程语言，搞了开源圈最狠的一条规矩——**不准用 LLM 贡献任何内容**。Issue 不行，PR 不行，连 bug tracker 上的评论翻译都不行。

这本身已经够硬了。但真正让我停下来的是后面这层——

## 一个荒诞的死结

Bun 这个 JavaScript 运行时，是用 Zig 写的。2025 年底被 Anthropic 收购了。收购之后呢？Bun 大量使用 AI 辅助开发，还 fork 了一份自己的 Zig。

最近 Bun 团队给这个 fork 加了并行语义分析和多代码生成单元，编译速度直接翻了四倍。

四倍。

然后他们说：**不打算合回上游**。

原因？Zig 严禁 LLM 作者贡献的代码。

你品一下这个画面：Anthropic 收购了一家公司，这家公司用 AI 把性能提升了四倍，但因为这个项目的主线不允许 AI 参与，所以这四倍的改进只能留在 fork 里，永远回不去。

一边是 AI 公司的收购标的，一边是 AI 贡献的永久拒收。这个张力太有意思了。

## "Contributor Poker"

Zig 社区负责人 Loris Cro 给了一个解释，我读完觉得他抓住了一个很多人没意识到的东西。

他说开源项目到了一定规模，收到的 PR 会比你能处理的多。按常理，你应该只收完美的 PR 来最大化投入产出比。但 Zig 不这么干——他们会花时间帮新贡献者把代码改到能合入的水平。

不是为了"做对的事"，而是因为**这是聪明的事**。

> Zig 看重的是贡献者，而不是贡献本身。

每个新贡献者都是核心团队的一笔投资。审查 PR 的目的不是得到代码，而是**培养出一个可以长期信赖的、高产的贡献者**。

LLM 把这个逻辑整个掀翻了。

就算 LLM 帮你交了一个完美的 PR，Zig 团队花在你身上的审查时间，对他们来说零回报——因为你没有变成一个真正的贡献者。你只是一个把 AI 输出粘贴过来的人。下次你还是这样。下下次也是。

Loris 管这个叫 **"Contributor Poker"**——跟打牌一样，你赌的是人，不是牌。

> "In contributor poker, you bet on the contributor, not on the contents of their first PR."

![Contributor Poker — 赌的是人，不是牌](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-01-simon-willison-img-01.png)

## "数字烟味"

Zig 创始人 Andrew Kelley 说了一段更狠的话：

> 别以为我们分不出谁用了 LLM 谁没用。人类犯的错和 LLM 的幻觉完全是两码事，一眼就能看出来。
>
> 而且，从 agentic coding 世界来的人，身上有一种**数字烟味**。自己闻不到，但不抽烟的人一闻就知道。
>
> 我不是说你不能抽烟。但别在我家抽。

"数字烟味"这个比喻绝了。

我自己在 review 代码的时候也有过类似感觉——有些 PR 看起来"太干净了"，干净得不像一个人在跟问题搏斗之后写出来的东西。没有犹豫的痕迹，没有那种"我先这样试试不行再那样"的迭代感。就是……平。

以前我以为这是"代码质量好"。现在想想，可能只是"AI 味"。

![数字烟味 — AI 写的代码有一种验老道者能闻到的"味道"](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-01-simon-willison-img-02.png)

## 效率 vs 社区

这事最让我触动的点是：它逼你回答一个问题——

**开源项目到底在产出什么？**

如果答案是"代码"，那 LLM 贡献的代码只要质量好，没有理由拒绝。效率至上，完美 PR 就是好 PR。

但如果答案是"社区"，那逻辑完全反过来。一个完美的 LLM PR 对社区的贡献是零，因为它没有创造任何新的社会连接。而一个粗糙的、需要反复讨论修改的人类 PR，可能在过程中建立了一个未来五年的核心贡献者。

Zig 选了后者。

你可以说他们理想主义。但在开源这个领域，"理想主义"和"务实"的边界可能没有你想的那么清楚。一个没有活跃贡献者社区的项目，代码质量再高也活不长。

##  fork 的宿命

回到 Bun 那个 fork。

一个 Anthropic 旗下的项目，维护着一个永远无法合回主线的 Zig fork。两边都在往前走，但永远不会汇合。

这大概就是 AI 时代开源协作的一个缩影：**技术上的兼容不等于社会契约上的兼容。**

Bun 的代码可以跑在 Zig 上，但 Bun 的开发方式和 Zig 的社区理念不兼容。这不是技术债，这是社会债。

![Fork 的宿命 — 两条路，不再交汇](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-01-simon-willison-img-03.png)

有意思的是，Simon Willison 在同一天还记了另一件事——有人提议为 vibe-coded 的小工具做一个 RSS feed。当 AI 让开发应用变得像发博客一样简单，我们需要一种新的分发方式。

一边是"AI 写的代码不准进我家"，一边是"AI 写的应用满天飞需要一个 RSS 来整理"。

这两个画面放在一起，大概就是 2026 年开源世界的真实状态。

---

你觉得呢？你写代码的时候用 AI 辅助吗？如果有一天你最喜欢的开源项目说"AI 写的代码我们不收"，你会怎么想？

## 原文参考

> Simon Willison. **Simon Willison's Weblog - April 30, 2026**. simonwillison.net.
> https://simonwillison.net/2026/Apr/30/
