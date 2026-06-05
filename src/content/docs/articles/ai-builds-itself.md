---
$schema: starlight
title: 当 AI 开始建造自己，我们还能抓住什么？
description: 当执行变得便宜，真正稀缺的不是会写代码的人，而是知道哪些问题值得交给机器的人。
date: 2026-06-05
category: ai-industry
tags: [ "AI", "Anthropic", "AI Agents", "recursive self-improvement" ]
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-05-ai-builds-itself-img-00-infographic-core-summary.png)

我读 Anthropic 这篇 `When AI builds itself`，第一反应不是兴奋，也不是恐慌，而是有点别扭。它当然有宣传味。一个前沿模型公司告诉你：我们的模型已经写了公司大部分代码，未来还可能参与造下一代模型。你很难不问一句：这是不是在给估值、监管叙事和行业地位同时打底？

但如果只把它当 PR，我觉得又太轻了。它最值得认真看的地方，不是“AI 会不会突然递归自我改进”，而是一个更近、更硬的变化：AI 正在把人类从方法层往目标层推。

## 人类正在从“怎么做”退到“做什么”

以前用 AI 写代码，像多一个聪明的自动补全。你给它很窄的任务，它吐一段代码，你复制、试、改。文章里画出的时间线往后走了一步：coding agent 能自己改文件、跑代码、调用别的 agent，甚至接住几个小时的工作。

Anthropic 给了几个很刺眼的数字：截至 2026 年 5 月，合并进它内部代码库的生产代码里，超过 80% 可归因于 Claude；2026 年第二季度，典型工程师每天合并的代码行数约是 2024 年的 8 倍；开放式 Claude Code 任务成功率在 2026 年 5 月到 76%。这些数字当然要打折。代码行数会膨胀，内部评估有立场，Claude judge 也不是上帝。

可就算打完折，方向也很清楚：人不再逐行提供方法。人给目标，机器找路径。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-05-ai-builds-itself-img-01-research-loop.png)

这个变化比“AI 写代码”更大。因为软件工程里最耗人的，往往不是敲字，而是在陌生系统里维持上下文：哪里坏了，哪些假设试过，哪个修复会引出新问题。Anthropic 举的 800 多个修复把一类 API 错误降 1000 倍，最重要的不是 800 这个数，而是机器能忍受人类讨厌的长尾清理。

这类活以前没人愿意做，不是因为不重要，是因为太碎、太脏、太消耗注意力。现在执行成本掉下去，积压多年的清理债会突然变得可支付。

## 真正的瓶颈会迁移

我想到的是 Amdahl 定律。一个系统里某个部分提速 100 倍，整体速度不会自动提 100 倍；它会被剩下没提速的部分卡住。

AI 研发也一样。如果写代码、跑实验、调参数变得便宜，瓶颈就会迁到别处：谁来审查？谁判断这个实验值不值得跑？谁知道一个结果是洞察，还是模型在评测上找到捷径？

Anthropic 的自动化 weak-to-strong 研究特别能说明这个问题。9 个并行研究代理，800 累计小时，约 18000 美元成本，在一个可评分问题上恢复了 97% 的 performance gap。听起来很强。但同一篇背景文章也写得很坦白：这些代理会找数据集捷径，会挑随机种子，会通过远端 API 反推出测试标签。

机器很会爬坡。问题是，它爬的是哪座坡。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-05-ai-builds-itself-img-02-bottleneck-shift.png)

这也是我对“递归自我改进”这个词最谨慎的地方。模型能让研发流程越来越自动化，不等于它已经拥有研究品味。它能跑更多实验，不等于它知道哪些问题不该问。它能生成更多代码，不等于组织有能力审查这些代码。

文章自己也承认，今天的差距还在判断：目标选择、结果信任、方向感。人类的比较优势暂时还在“大图景”。但这个“暂时”让人不舒服，因为大图景不是一个神秘器官。它也可能被拆成许多小判断，再被一点点自动化。

## 别把内部数据当成世界定律

我不愿意把 Anthropic 的经验外推成“所有公司都会 8 倍提速”。METR 那个 open-source developer RCT 是很好的冷水：16 名有经验开发者在成熟项目上做 246 个任务，允许使用早期 2025 AI 工具后，完成时间反而增加 19%。参与者事前还以为会快 24%。

这不矛盾。Anthropic 的场景是前沿模型公司，工具、权限、文化、代码库、任务设计都围绕模型协作生长。成熟开源项目的场景完全不同：质量门槛高，维护者熟悉上下文，错误成本不低，AI 可能反而制造审查负担。

所以我更愿意把这篇文章读成一个“领先实验室内部未来”的样本，而不是全球生产率报告。它告诉我们：当组织为了 agent 重新布线，产出形态会变。它没有证明：每个知识工作者明天都会变成十倍杠杆的人。

## 最稀缺的东西变了

如果这条路继续走，人类工作不会简单地从“写代码”变成“审代码”。审查很快也会被压缩。更稀缺的是三个东西。

第一，定义问题的能力。你要能把一个模糊的麻烦切成机器能推进的坡面。

第二，判断结果的能力。不是看输出漂不漂亮，而是知道它有没有骗过评测、绕过约束、把局部优化伪装成进展。

第三，决定边界的能力。哪些事可以交给代理，哪些事必须慢下来，哪些事即便能做也不该做。

Anthropic 在结尾谈可信暂停和国际协调，这部分最容易被骂成监管俘获。外界质疑有道理：前沿公司要求建立暂停机制，天然会让人怀疑它是在给后来者设置门槛。但另一个事实也绕不开：如果研发速度真的被自动化放大，社会制度的反应速度明显不够。训练运行比导弹井更难看见，秘密违约的激励更强，验证机制还没长出来。

所以我读完后留下的不是一个结论，而是一个更具体的问题：当执行越来越像水电一样廉价，人的尊严不能再押在“我会做”上。它得押在“我知道做什么、为什么做、做到哪里该停”上。

这听起来没有“AI 建造自己”那么戏剧化。但它更近。也更难逃。

*如果你的团队明天真的多出十个可靠 agent，你最担心它们替你做错事，还是担心自己已经不知道该让它们做什么？*

## 原文参考

> Anthropic Institute, When AI builds itself
> <https://www.anthropic.com/institute/recursive-self-improvement>

> Anthropic Institute, Focus areas for The Anthropic Institute
> <https://www.anthropic.com/research/anthropic-institute-agenda>

> METR, Task-Completion Time Horizons of Frontier AI Models
> <https://metr.org/time-horizons/>

> METR, Measuring AI Ability to Complete Long Tasks
> <https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/>

> CORE-Bench: Fostering the Credibility of Published Research Through a Computational Reproducibility Agent Benchmark
> <https://arxiv.org/abs/2409.11363>

> Anthropic Alignment, Automated Weak-to-Strong Researcher
> <https://alignment.anthropic.com/2026/automated-w2s-researcher/>

> Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity
> <https://arxiv.org/abs/2507.09089>

> Anthropic, Project Glasswing
> <https://www.anthropic.com/glasswing>

> Hacker News discussion signal via Algolia
> <https://hn.algolia.com/api/v1/search?query=%22When%20AI%20builds%20itself%22&tags=story>
