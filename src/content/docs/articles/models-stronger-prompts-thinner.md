---
$schema: starlight
title: 模型变强之后，提示词该从哪里退场？
description: 模型变强之后，提示词的下一步不是消失，而是搬家：常驻说明变成按需接口，权限、验证和停机边界则必须留在系统里。
date: 2026-09-17
category: ai-agents
primarySourceUrls: ["https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra"]
---

我读到 OpenAI Developers 的《[Rethinking skills and prompts for GPT-6 Astra](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra)》时，先做了一件不太像读后感的事：把自己仓库里的 `AGENTS.md` 和工作流 skill 打开，对照着看。

原文表面上在说一件很琐碎的 housekeeping：模型变强了，过去为了手把手带着它走而积累下来的 skills、`AGENTS.md` 和任务提示词，需要重新审视。可我读到后面，觉得它真正追问的是：**哪些判断还需要占用模型的常驻上下文，哪些判断应该交给系统本身？**

我的答案是：重复解释可以退场，责任边界不能退场。更强的模型值得更少的手把手指令，但这不等于更少的权限控制、验收条件和失败出口。

![核心信息图：常驻上下文、按需加载与系统边界](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-17-models-stronger-prompts-thinner-img-00-infographic-core-summary.png)

## 要删的，其实是提示词里的重复说明

文章从 skills 讲到 `AGENTS.md`，再讲 decision boundaries 和 persistence，四个部分其实连在一起。它先提醒我们：skill 的名字和描述会参与选择；描述太长、技能装得太多，模型看到的入口就会被压缩，甚至会被互相矛盾的使用条件带偏。接着，它把同一个问题推到仓库级别：`AGENTS.md` 不该变成每次改一行代码都要背诵的总说明书。

这里最值得保留的词是 progressive disclosure。它指的是分层，不是把文档藏起来：先让模型知道“这里有一个能力、什么时候可能用到”，触发以后再读完整指令，遇到具体任务再打开参考资料或脚本。OpenAI 的[官方 Skills 文档](https://developers.openai.com/api/docs/guides/tools-skills)也把 skill 描述为带有 `SKILL.md` 的目录，可以附带 references、scripts 和 assets；发现阶段与读取完整内容本来就可以分开。

所以原文的第一层意思是：不要让所有文字都以同样的优先级常驻。一份永远完整、永远自动加载的说明书，和一组能在需要时被找到的接口，对模型来说不是同一种上下文。

![原文封面：Instructions 卡片](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-17-models-stronger-prompts-thinner-img-source-cover.webp)

## 把上下文搬到按需接口

一个好的 skill description 更像路牌，不像用户手册。它要告诉模型：这个能力解决什么问题、在什么条件下值得加载；至于每个 API 参数、每个例外和每个脚本的用法，应该留在下一层。

这也解释了原文给出的 Bad/Good 对照。坏的描述把“数据库迁移”相关的一大类工作都圈进来，好的描述只说在新增或修改迁移、或者准备发布迁移时使用。差别不在字数本身，而在触发边界是否清楚。短描述如果没有边界，只会变成一个更难搜索的模糊标签。

`AGENTS.md` 也是同样的接口。它最适合告诉 agent 项目有哪些不可忽略的约定，以及遇到什么类型的任务应该去看哪份文档；它不应该把每个子系统的过多背景都复制一遍。`[AGENTS.md](https://agents.md/)` 的公开说明把它比作面向 agents 的 README，同时允许在子目录放更具体的文件。这样一来，上下文可以跟着工作位置和任务范围收缩。

我喜欢这条建议的原因，是它把“上下文管理”从模型的记忆力问题改成了接口设计问题。与其反复告诉模型“请不要忘记第十七条”，不如让它在处理某类文件时能够稳定找到那一层规则。难点从“每次读对”换成了“仓库把路标放对”。

## 退出常驻上下文，不等于退出系统

读到 decision boundaries 时，我反而比读 skills 更谨慎。原文提醒我们，很多强硬边界可能是过去为了防止模型越权而补上的；当模型能力增强，应该重新判断哪些边界仍然必要。这是很好的审计问题，却不能直接变成“现在可以删掉权限检查”的许可证。

我会把规则分成两类。

一类是“模型大概率已经会做”的重复提醒：先理解任务、根据错误信息继续排查、在不相关的文件上不要乱改。这些内容可以从常驻 prompt 里移出，或者压缩成几句路由说明。

另一类是“即使模型知道，也不能只靠它自觉遵守”的硬条件：是否可以访问外部系统，是否可以发送数据，是否必须经过人工批准，产物怎样验收，失败后如何回滚。这些应该由权限、沙盒、脚本、CI 或状态机承担。模型知道规则，和系统强制执行规则，差别很大。

我在之前的《[Not the Model, You're the Harness](https://ntlx.github.io/articles/not-the-model-youre-the-harness)》里把模型之外的那层环境称为 harness。这篇 OpenAI 文章让我补上一句：harness 不只是给模型提供 shell、文件系统和工具，也要替它承载那些不能依赖临场记忆的责任边界。上下文可以变薄，执行环境必须变得更诚实。

![上下文与执行边界的分工](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-17-models-stronger-prompts-thinner-img-01-framework-context-boundaries.png)

这也是 OpenAI 官方文档里值得和原文一起读的部分：skill 内容会影响规划、工具使用和命令执行，所以 skill 不是无害的文字附件。按需加载可以降低噪声；在有网络和写入能力的环境里，仍然需要审查 skill、限制权限，并给高影响动作设置批准条件。

## “做完”不是一句提示，而是一种状态

原文最后谈 persistence。它观察到一个有点反直觉的变化：更强的模型可能更谨慎地判断什么时候该停，于是任务如果只说“把它完成”，反而会留下模糊地带。真正有用的做法，是在一开始说清楚任务范围、完成定义，以及希望继续探索时的停止位置。

这件事很容易被误读成“给 Agent 更强的续跑指令”。我更在意的是让“完成”成为可观察的状态：产物已经写到哪里，检查是否通过，失败是否已处理，下一步是不是应该交给人或另一个流程。模型可以负责判断和行动，系统要负责留下证据。

![完成状态的证据链：产物、检查、交接与停止](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-17-models-stronger-prompts-thinner-img-02-completion-observable-state.png)

这和站内《[Agent 跑得久，靠的是可恢复的工作集](https://ntlx.github.io/articles/agent-context-working-set)》讨论的方向正好接上：长任务的难点不只是上下文窗口够不够大，还在于中间状态能不能被保存、恢复和核对。两篇文章关注的入口不同：一篇清理进入上下文的内容，另一篇保存离开上下文的状态。放在一起，才是一条完整的工作流。

因此，“请继续，直到完成”不是完成定义。更可靠的写法是：当哪些事实成立、哪些检查通过、哪些外部动作还没执行时，任务算完成；如果无法满足，应该停在哪里、留下什么交接信息。这样即使换模型，流程仍然有一个不依赖模型自我感觉的落点。

## 我会按这条顺序清理一套 Agent 规则

我不会从删文件开始，而会先给每条常驻指令标注它到底在做什么。

第一，标出**触发信息**。它只需要回答“什么时候加载这个 skill 或文档”，就应该进入 description、目录说明或入口处，别和实现细节混在一起。

第二，标出**任务材料**。背景解释、API 参考、示例和脚本不必消失，只需移动到模型确实需要时才打开的位置，同时把入口留好。

第三，标出**硬约束**。权限、数据边界、外部副作用、回滚条件和人工决策点不能因为模型变强就被删掉；它们要尽可能变成工具限制、状态转换或自动化检查。

第四，标出**验收逻辑**。原文说过去的模型需要被提醒去测试和检查，这不意味着测试本身过时。删掉重复的口头催促，把可机械判断的验收移到脚本或 CI，让结果成为下一步可以读取的事实。

第五，再看一次真实失败。规则是否过长，不能只靠字数判断；要看模型选错了 skill、读了无关文档、越过了权限，还是在完成后仍然继续。知道哪一种失败正在发生，才知道该删文字、改路由，还是补系统边界。

这套顺序也给了“新模型上线”一个比重新写 prompt 更有价值的用途：它是一次上下文和责任的审计。审计的对象不只是 `SKILL.md` 或 `AGENTS.md`，还包括模型之外的工具、权限、状态和验收路径。

我的最终判断是，提示词不会因为模型变强而消失，它会从“说明书”退到“接口”这一层。会退场的，是那些把模型当成需要逐步牵引的实习生、却没有给系统建立清晰边界的文字。留下来的规则应该更少、更容易被找到，也更能在模型判断失误时把后果挡在门外。

## 参考资料

- [OpenAI Developers：Rethinking skills and prompts for GPT-6 Astra](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra)
- [OpenAI API：Skills](https://developers.openai.com/api/docs/guides/tools-skills)
- [AGENTS.md 官方说明](https://agents.md/)
- [OpenAI skills：skill-creator 上游指引](https://github.com/openai/skills/blob/main/skills/.system/skill-creator/SKILL.md)
- [OpenAI Developers 文档索引](https://developers.openai.com/llms.txt)
- [原文封面图片](https://developers.openai.com/images/blog/rethinking-skills-and-prompts-for-gpt-6-astra/cover.webp)
- [站内：Not the Model, You're the Harness](https://ntlx.github.io/articles/not-the-model-youre-the-harness)
- [站内：Agent 跑得久，靠的是可恢复的工作集](https://ntlx.github.io/articles/agent-context-working-set)
