---
$schema: starlight
title: AGENTS.md 不该追求完整，它该负责把信息分层
description: AGENTS.md 的价值不在写成总说明书，而在决定哪些规则每次都加载、哪些内容按任务展开、哪些边界必须交给工具验证。
date: 2026-09-18
category: ai-agents
tags: [AGENTS.md, AI agents, context engineering]
primarySourceUrls: ["https://www.aihero.dev/a-complete-guide-to-agents-md"]
---

我最近重新读了一遍 `AGENTS.md`：每看到一条规则，就追问四件事——它到底防止什么错误？只在哪些任务里有用？什么时候会失效？能不能交给测试、脚本或权限系统验证？如果四个问题都答不上来，这条规则就不该因为“以后也许有用”而常驻在根目录。

读完 Matt Pocock 的《[A Complete Guide To AGENTS.md](https://www.aihero.dev/a-complete-guide-to-agents-md)》，我现在不再把重点放在“把文件写得更短”。`AGENTS.md` 不是项目知识的总仓库，而是每次任务开始时都会经过的入口。入口要做的，是决定先让 agent 看到哪几扇门。

![核心信息图：让 AGENTS.md 决定默认加载什么、按需展开什么，以及什么交给工具验证](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-18-agents-md-progressive-disclosure-img-00-infographic-core-summary.png)

## 它不是项目说明书，而是一次请求的入口

原文把 `AGENTS.md` 放在模型基础指令与代码库之间：它可以写个人偏好，也可以写项目的技术栈、包管理器和架构约定。这个定义看似朴素，却暗含了一个容易被忽略的成本：只要它进入每次请求，它就不只是文档，还会成为每次推理都要携带的上下文。

这也是我开始怀疑“完整 AGENTS.md”的地方。人类读一份仓库说明，通常是入职或遇到问题时读一次；agent 则可能在每个任务里重新开始。昨天为了修一个边角问题加进去的提醒，今天会和构建命令、目录边界、提交规范一起出现。时间一长，文件记录的就不再只是项目的稳定事实，也混进了团队过去遇到过的所有不安。

原文把这种不断追加的结果叫作一个 “ball of mud”。这个比喻不只是说文件难看，更准确的地方在于：规则之间会互相争夺注意力，过时路径会把 agent 带向错误位置，局部约定会伪装成全局要求。最危险的不是某一条规则写错，而是错误规则获得了和真正硬约束一样的常驻待遇。

所以我更愿意把根部 `AGENTS.md` 看成一个入口协议。它至少要回答：这个仓库做什么；使用什么不寻常的工具；验证改动从哪里开始；遇到局部问题应该去哪里继续读。至于具体 API、某个服务的部署手册和历史故障，不必消失，但应该有自己的位置和触发条件。

## “少写一点”不是答案，加载边界才是

文章引用了 HumanLayer 的一句经验判断：前沿思考模型大约能较稳定地遵循 150–200 条指令。这个数字适合拿来做警报器，不适合拿来当容量上限。模型、任务、指令之间的关系不会因为一个整数变成硬件规格。

我又查了 HumanLayer 引用的 IFScale 研究。它把指令密度从 10 条增加到 500 条，测试 20 个模型、7 家主要提供商；在最高密度下，表现最好的前沿模型准确率是 68%。但它测的是商业报告里的关键词包含，不是 coding agent 读取 `AGENTS.md`。这组结果能说明“让模型同时记住更多要求会付出代价”，不能说明某个仓库到第 201 条规则就一定失效。

这一区分很重要。否则我们很容易把一项提醒性研究变成新的迷信：既然不能超过某个数字，那就把文件截短；既然上下文窗口很大，那就把所有东西都放进去。真正应该被管理的是加载边界，而不是字数本身。

我在站内前文《[模型变强之后，提示词该从哪里退场？](https://ntlx.github.io/articles/models-stronger-prompts-thinner)》里写过，重复解释可以搬走，责任边界不能搬走。读这篇文章后，我会把这句话再具体化：搬走的内容必须有路牌，留下的规则必须有理由。一个只有三十行、却没有告诉 agent 去哪里找构建说明的根文件，未必比一份稍长但分层清楚的文件更好。

## 渐进式披露要和硬约束分开

原文最值得我带走的是 progressive disclosure。它不是把知识藏起来，也不是让 agent 自己在整个仓库里碰运气搜索，而是把信息拆成不同的加载层级：根部只保留所有任务都需要的事实，子目录放局部约定，独立文档承载背景和操作细节，需要时再读进来。

Claude Code 的[官方 Skills 文档](https://code.claude.com/docs/en/skills)给了一个很具体的实现例子：Skill 以 `SKILL.md` 为入口，还可以带参考文件和脚本；完整内容在调用时加载，支持文件按需读取。它说明“渐进式披露”不是写作口号，而可以落实为目录、入口和加载时机。不过这是 Claude Code 的机制，不能擅自当成所有 harness 的统一行为。

HumanLayer 的 12-factor agents 文档也把上下文扩大了一层：提示词只是其中一部分，外部资料、历史、工具调用结果、记忆和结构化输出要求也会共同影响模型下一步看到什么。这样看，`AGENTS.md` 并不负责解决上下文问题的全貌，它只负责其中一段很特殊的事情——为每次新任务设定一个默认入口。

但渐进式披露不能承担责任问题的全貌。文档能提高命中率，却不能让危险命令物理上消失；它能告诉 agent 怎样测试，却不能替代测试；它能写“不要提交凭据”，却不该成为秘密防护的完整方案。权限、沙箱、hook、lint、CI 和审批流程，才是那些不能靠模型临场记忆的边界。

这也是我对“把规则都拆出去”的保留。拆分不是越多越好。如果一条会影响每个任务的不可变约束被藏在五层目录之后，agent 很可能根本遇不到它。根部文件应该薄，但不能失去方向感；按需加载应该省上下文，但不能牺牲可发现性。

## 我会给每条常驻规则做一张准入卡

读完这篇文章后，我不会直接打开编辑器删行，而会给准备放进根部的规则做一张小小的准入卡：

![规则准入卡：判断一条规则应当常驻、按需展开，还是交给工具验证](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-18-agents-md-progressive-disclosure-img-01-framework-rule-admission.png)

1. **适用范围**：它是所有任务的规则，还是某个目录、语言、脚本或发布流程的规则？
2. **失效条件**：它依赖哪个版本、路径或工具？条件变化后谁负责删除或更新？
3. **错误对象**：没有这条规则，agent 会做错哪一件具体的事，而不是泛泛地“表现变差”？
4. **验证方式**：错误能否由测试、schema、lint、hook、权限或构建脚本直接检查？能检查，就不要只写成提醒。
5. **下一层入口**：如果读者需要背景、例外和完整操作，应该沿着哪个稳定链接继续？

这张卡把 `AGENTS.md` 的维护问题换了个问法：不再问“还能不能再补一句”，而是问“这句话配得上每次加载吗”。它也给删除提供了依据：一条没有明确作用域、验证方式和归属人的规则，即使写得很正确，也可能只是在向未来的每一次任务收税。

反过来，短文件也不能自动获得信任。根文件里保留项目用途、非标准构建命令、数据边界和验证入口，可能比删除它们更重要。真正需要清理的是重复解释、失效路径、无法执行的愿望，以及应该交给工具承担的硬约束。

## 读后留下的具体动作

我对这篇文章最后的理解，不是“以后 `AGENTS.md` 都写得更短”，而是把它当成一份上下文路由表来维护：什么必须先看到，什么可以晚一点看到，什么不该让模型自己决定。

如果今天就要整理一份旧的 `AGENTS.md`，我会先把规则按作用域和验证方式分组，再删除重复项；然后给保留下来的每一条加上通往详细文档的路牌；最后把权限、格式、构建和发布等可机械判断的部分交给工具。规则变更需要回答“它防止了哪个已观察到的错误”，而不是只回答“这句话听起来很谨慎”。

读完后，我改掉了一点“文档越全越放心”的直觉。对 agent 来说，长期有效的帮助不一定是更多说明，而是更清楚的入口、更小的默认范围，以及在它判断失误时仍然有效的系统边界。

## 参考资料

- 原始文章：[A Complete Guide To AGENTS.md](https://www.aihero.dev/a-complete-guide-to-agents-md)
- 背景文章：[HumanLayer — Writing a good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md)
- 指令密度研究：[How Many Instructions Can LLMs Follow at Once?](https://arxiv.org/abs/2507.11538)
- 上下文工程：[HumanLayer 12-factor agents — Own your context window](https://github.com/humanlayer/12-factor-agents/blob/d20c728368bf9c189d6d7aab704744decb6ec0cc/content/factor-03-own-your-context-window.md)
- 机制参考：[Claude Code — Extend Claude with skills](https://code.claude.com/docs/en/skills)
- 术语延伸：[AI Hero — System prompt](https://www.aihero.dev/ai-coding-dictionary/system-prompt)
- 术语延伸：[AI Hero — Progressive disclosure](https://www.aihero.dev/ai-coding-dictionary/progressive-disclosure)
- 原文站内引导：[AI Hero — Skills](https://www.aihero.dev/skills)
- 原文提到的包管理器工具：[Node.js Corepack](https://github.com/nodejs/corepack)
- 原文 Open Graph 头图：[A Complete Guide To AGENTS.md cover](https://www.aihero.dev/api/og?resource=a-complete-guide-to-agents-md&updatedAt=2026-01-18T15:01:44.364Z)
