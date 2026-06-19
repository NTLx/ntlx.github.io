---
$schema: starlight
title: "Claude Code 的七种控制方式：从'告诉 AI 做什么'到'让 AI 无法不做'"
description: Claude Code 给了你七种控制它的方法，但真正重要的不是方法本身，而是它背后的问题：你应该在哪里放指令，在哪里放护栏？
date: 2026-06-19
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-19-claude-code-seven-steering-methods-img-00-infographic-core-summary.png)

## 不是七种方法，是三种信任级别

先说结论：Anthropic 这篇文章列了七种定制 Claude Code 行为的方法，但如果你只看到"七种方法"，就错过了它真正想说的东西。

七种方法的本质是三个问题：

* Claude 什么时候知道这条指令？
* 压缩对话后这条指令还在不在？
* 如果 Claude 不遵守，有没有人能强制执行？

把这七种方法按"信任级别"排列，画面就清晰了：

**Always-on 的信任**：CLAUDE.md（root）、unscoped rules、output styles。这些在会话开始就注入，全程驻留，压缩后重读。你假设 Claude 会一直遵守它们。成本是每个 token 都在为这些指令买单，哪怕当前任务跟它们无关。

**按需加载的信任**：subdirectory CLAUDE.md、path-scoped rules、skills。只在 Claude 读到相关文件或调用 skill 时才加载。你信任 Claude 在需要时会读到它们，但不假设它永远记得。

**确定性护栏**：hooks。不依赖 Claude 的判断，而是在生命周期事件上用代码强制执行。exit code 2 阻止调用，不管你写的 prompt 多有说服力。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-19-claude-code-seven-steering-methods-img-01-subdirectory-claude-md.png)

## "永远不要做 X" 的真正含义

文章里有一句话值得单独拎出来："When there's something that absolutely must not happen, an instruction is the wrong tool."

这句话的分量比它看起来大得多。

过去两年，所有 AI 编码工具都在教用户写"规则"：.cursorrules、CLAUDE.md、instructions.md。这些规则的共同假设是：只要你把指令写得足够清楚，模型就会遵守。

但 Claude Code 的 hooks 机制承认了一个事实：模型不遵守指令的概率不是零。长会话里、有 prompt injection 的文件面前、任务压力下，模型可能忽略你写的规则。

所以真正的护栏不是"告诉模型不要做"，而是"让模型无法做"。PreToolUse hook 检查一次调用，exit code 2 直接拒绝，没有商量余地。这就像代码审查和代码锁的区别：审查可能被绕过，锁不行。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-19-claude-code-seven-steering-methods-img-02-skills-triggered.png)

## 上下文窗口是真正的战场

文章里最有技术含量的部分，不是七种方法的列表，而是那个对比表：每种方法何时加载、压缩后是否保留、上下文成本多高。

这本质上是一个资源分配问题。Claude 的上下文窗口是有限的，每个 token 都有成本。你放进去的每一条指令，都在挤压其他信息的空间。

CLAUDE.md root 文件"全程驻留"听起来很安全，但代价是：即使你在改一个跟 CLAUDE.md 里某条规范完全无关的文件，那些规范也占着 token。200 行的 CLAUDE.md，每次会话都在为所有工程师的每个任务买单。

Path-scoped rules 和按需加载的 skills 是这个问题的解法：只在需要的时候加载，不需要的时候腾出空间。但它们的代价是：如果 Claude 没有走到那个目录、没有调用那个 skill，它就不知道那条规则存在。

这不是技术限制，是设计选择。Anthropic 在说：没有一种方法能同时做到"always loaded"和"zero cost"。你必须选择。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-19-claude-code-seven-steering-methods-img-03-context-window.png)

## Subagent 的真正价值不是并行

文章说 subagent 适合"running work in parallel or side tasks that should run in isolation"。但并行只是表面价值。

subagent 的核心设计是：主体上下文不进入父会话。它在一个全新的 context window 里运行，只有最终消息返回。这意味着中间结果不会污染你的主对话。

如果你让 Claude 在主线程里做一次深度搜索，搜索过程中的几百条中间发现全部塞进上下文，后面的对话质量会下降。但如果你让一个 subagent 去搜，它带回一个干净的摘要，主对话的上下文保持纯净。

这是上下文工程的又一个体现：不是所有信息都值得留在上下文里。有些工作只需要它的结论，不需要它的过程。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-19-claude-code-seven-steering-methods-img-04-hooks-lifecycle.png)

## 一个诚实的评价

Claude Code 的七种方法是目前 AI 编码工具里最细致的控制体系。但"最细致"不等于"最好用"。

对大多数个人开发者来说，CLAUDE.md + 一两个 skills 就够了。七种方法的完整体系是为团队设计的：当一个 repo 有几十个工程师、几百个目录、几十条规则时，你需要这种粒度的控制。

但有一个问题文章没有回答：当你的 CLAUDE.md 超过 200 行、你的 rules 目录有 50 个文件、你的 skills 有 20 个时，谁来管理这些配置本身？配置的配置，谁来管？

这不是吹毛求疵。每个"让 AI 更好用"的系统，最终都会面临同一个问题：配置复杂度本身成为新的瓶颈。Claude Code 目前的答案是"像代码一样 review CLAUDE.md"，但这要求团队有额外的纪律。

不过话说回来，这至少是一个正确的方向。与其让用户在无结构的文本框里写 prompt，不如提供一套有结构的控制机制——即使这套机制本身也需要学习和维护。

*你在用 Claude Code 时，有没有遇到过"写了规则但 Claude 不遵守"的情况？你是怎么处理的？*

## 原文参考

> Anthropic. Steering Claude Code: CLAUDE.md files, skills, hooks, rules, subagents and more. June 18, 2026.
> <https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more>

> Claude Code Documentation: Extend Claude Code.
> <https://code.claude.com/docs/en/features-overview>
