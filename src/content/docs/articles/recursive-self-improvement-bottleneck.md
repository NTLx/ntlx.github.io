---
$schema: starlight
title: 递归自我改进的慢变量
description: 递归自我改进真正吓人的不是模型会越跑越快，而是我们负责判断和验证的制度仍然很慢。
date: 2026-06-05
category: ai-industry
tags: [ "Anthropic", "Recursive Self-Improvement", "AI Governance" ]
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-05-recursive-self-improvement-bottleneck-img-00-infographic-core-summary.png)

读完 Anthropic Institute 这篇《When AI builds itself》，我第一反应不是兴奋，也不是恐慌，而是觉得它把一件事说得太冷了。

AI 可能还没有自己造出下一代 AI。但它已经在帮造下一代 AI 的人，跑得比以前快很多。

这中间差一步。可这一步不是小事。

## 闭环还没关上，但回路已经通了

Anthropic 给了很多数字：截至 2026 年 5 月，Anthropic 合入生产的代码里，超过 80% 可归因于 Claude；典型工程师每天合入的代码量，已经约是 2024 年的 8 倍；内部研究团队调查里，员工估计 Mythos Preview 把自己的产出放大到 4 倍左右。

这些数字当然要打折看。原文自己也承认，代码行数不是生产力，主观估计可能偏高，内部指标也没有第三方审计。

但我不觉得最重要的是 80% 还是 60%。真正重要的是方向：Claude 正在写 Anthropic 的代码，Anthropic 用这些代码训练、评估、部署下一代 Claude。它还没完全自己定义目标、自己训练后继、自己判断结果可信。但反馈回路已经接上了电。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-05-recursive-self-improvement-bottleneck-img-01-feedback-loop.png)

以前我们谈递归自我改进，脑子里常是科幻场景：一个模型关起门来，把自己改得越来越聪明。Anthropic 这篇文章给出的版本更普通，也更近。不是“模型突然觉醒”，而是一个实验室的日常工作流里，越来越多执行环节被模型接管。

恐怖感不来自戏剧性，而来自平滑性。

## 便宜的是执行，不是判断

文中最关键的分界线，是 engineering 和 research 里的同一个结构：目标给定时，Claude 越来越强；目标怎么选，仍然是硬骨头。

给它一个坏掉的导出按钮，它能修。给它一个训练代码，让它在 correctness checks 不变的情况下加速，它能从 2025 年 Claude Opus 4 的约 3x，走到 2026 年 Mythos Preview 的约 52x。给它一个可评分的 weak-to-strong supervision 问题，多个 agent 可以花 800 个累计小时，把 performance gap recovered 做到 0.97。

这已经不是“帮忙写几段代码”了。这是把实验执行变成一种可以横向扩展的资源。

但问题也在这里。执行便宜以后，真正贵的东西才露出来：什么问题值得做？哪个指标不能被刷？什么时候结果只是 benchmark 上好看？什么时候该停？

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-05-recursive-self-improvement-bottleneck-img-02-bottleneck-shift.png)

AI 最擅长的，是在规则清楚、反馈明确、验证器存在的空间里狂奔。可研究最值钱的部分，往往是在验证器还没长出来的时候，判断哪条路有前途。

这不是给人类贴金。很多人类判断也很烂。Anthropic 那个“下一步研究方向”测试就很刺耳：在 129 个已知人类走偏的时刻，Mythos Preview 的建议被判为更好，比例达到 64%。这说明所谓 research taste 不是神圣不可侵犯的东西。它可能也会被模型学会。

可只要这块还没被可靠验证，我们就不能把“模型能提出更像样的下一步”直接等同于“模型能负责整个方向”。

## 人类被挤到更窄，也更难的位置

这篇文章让我想到工程组织里最常见的一种错觉：瓶颈消失了。

其实瓶颈很少消失。它只是搬家。

代码生成快了，code review 会变慢。实验可以并行跑了，结果筛选会变慢。安全漏洞更容易发现了，修补和协调会变慢。Anthropic 自己也在文中用了 Amdahl's law：整体速度受没有被加速的部分限制。

这就是我读完后最不舒服的地方。AI 让人不再待在“做事”的位置上，而是被推到“判断做什么、信什么、停在哪里”的位置上。这个位置听起来高级，其实更难受。因为你不能再用“我还在写”来证明自己有价值，也不能用“人手不够”来解释所有延迟。

如果 Claude 能两小时做完一个人两三天的调试，人的问题就变成：你是否敢把这个结果合进去？你是否知道哪里要复验？你是否能看出它解决了症状，还是碰巧绕过了问题？

执行外包以后，责任没有外包。

## Anthropic 的尴尬也是真问题的一部分

原文最后谈治理，说世界应该拥有可验证放缓或暂停 frontier AI development 的选项。我相信这是真诚的，也觉得这里有明显张力。

Anthropic 是赛跑者。赛跑者说我们需要刹车，当然会让人怀疑：你是不是想定义刹车规则？是不是想把自己的领先地位制度化？

但反过来，把这全解释成公关也太轻松了。真正麻烦的是，Anthropic 可能既有利益冲突，又掌握外部社会最缺的早期证据。递归自我改进这件事如果真的靠近，最先看到信号的很可能就是这些前沿实验室。

所以问题不是“信不信 Anthropic”。问题是我们有没有办法让这种信号离开公司叙事，进入可审计、可争论、可验证的公共结构。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-05-recursive-self-improvement-bottleneck-img-03-three-futures.png)

文章里说，训练运行比导弹发射井更容易隐藏，算力和数据都是通用投入，偷偷继续推进的激励巨大。这话不舒服，但对。一个可信暂停机制，不只是写一份原则声明。它要回答谁触发、谁验证、谁裁决、谁承担被别人偷跑的代价。

这些都是慢变量。

## 世界不会跟着实验室一起加速

Anthropic 在三种未来里留了一个很好的尾巴：即使递归智能在上游按 compute 速度奔跑，下游世界也不会全部同步加速。

更多智能不能把十年药物随访压成十天，不能让宪法规定的选举提前，不能让陌生人一周末变成老朋友。

这句话反而让我放下了一点。不是因为风险小，而是因为它把问题从“AI 会不会爆炸式变强”拉回到更具体的层面：哪些环节会快到失控，哪些环节仍然慢到拖住一切？我们需要保护的，可能正是那些慢东西。

递归自我改进真正吓人的地方，不是实验室里那条曲线越来越陡。曲线变陡，我们至少还能画出来。

更吓人的是，验证、信任、制度、责任这些东西没有同样的斜率。

机器可能会越来越快地改自己。人类社会要先学会一件更笨的事：别让所有慢变量都变成事后补丁。

*如果 AI 研发真的进入半自动闭环，你最希望人类保留哪一个不可外包的环节：方向选择、结果验证、暂停权，还是责任追究？*

## 原文参考

> Marina Favaro and Jack Clark, Anthropic Institute, When AI builds itself
> <https://www.anthropic.com/institute/recursive-self-improvement>

> METR, Task-Completion Time Horizons of Frontier AI Models
> <https://metr.org/time-horizons/>

> Anthropic Alignment Science, Automated Weak-to-Strong Researcher
> <https://alignment.anthropic.com/2026/automated-w2s-researcher/>

> Axios, Behind the Curtain: Intelligence explosion
> <https://www.axios.com/2026/05/07/anthropic-jack-clark-ai-intelligence-explosion>
