---
$schema: starlight
title: 当 Agent 成为同僚：听 Claude Code 缔造者聊安全、范式跃迁与手艺消逝
description: Claude Code 的爆发并非偶发的商业奇迹，而是 Anthropic 将 AI 安全从实验室“培养皿”推向真实战场的产物。当软件工程经历第四次范式跃迁，人类工程师正面临职能重构与手艺消逝的双重考验。
date: 2026-08-02
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-02-claude-code-boris-cherny-odd-lots-img-00-infographic-core-summary.png)

在 Bloomberg 旗下著名播客 *Odd Lots* 的最新一期节目中，主持人和 Anthropic Labs 负责人、Claude Code 的缔造者 Boris Cherny 坐到了一起。这场长达 70 分钟的对话，没有充斥常见的商业吹捧，而是从一个极具反直觉的视角拉开了序幕：**Claude Code 的诞生，最初竟然不是为了做一款爆款编程产品，而是为了研究“AI 安全”（AI Safety）。**

过去我们普遍认为，前沿 AI 实验室做 Safety 研究，要么是在模型神经元里做“机制可解释性”（Mechanistic Interpretability）的解剖，要么是在离线的 Prompt 培养皿里做沙盒测试。但 Boris Cherny 明确指出，AI 要与真实世界发生强交互，最有力、最可控的介质就是**代码**。如果不上战场，永远无法得知 Agent 在面对真实的网络攻击、权限边界与 Prompt Injection（提示词注入）时会发生什么。

正是这种“以安全驱动产品，以产品反哺安全”的双螺旋结构，让 Claude Code 在过去一年中迅速从一个内部分支 Side Project，成长为引爆整个软件产业的现象级 Harness。而在读完整篇访谈后，我整理出四个最值得深思的行业洞察。

## 范式跃迁：从“手写代码”到“操控协同回路”

回顾计算机的发展史，软件工程实际上经历了四次关键的抽象层级跃迁：

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-02-claude-code-boris-cherny-odd-lots-img-01-paradigm_shift_timeline.png)

1. **物理纸牌时代**（20 世纪 50-60 年代）：程序员用打孔卡片表达逻辑，直接喂给庞大的机械设备；
2. **硬件电路时代**（70 年代初）：像 Apple I 时代那样，绝大多数逻辑以物理芯片和电子元器件的形式被固化；
3. **软件操作系统时代**（70 年代末至今）：人类直接在编辑器里撰写高高级语言代码，这一停留就是整整 50 年；
4. **Agent 与 Loop 时代**（当前）：从最初的行内自动补全，到给 Agent 描述需求生成单文件，再到今天由人类提出目标、多 Agent 在后端自发运行 Loop 循环协同。

Boris Cherny 提到，在 Anthropic 内部，他个人 100% 的代码自 2025 年底起就已完全由 Claude Code 编写，全公司的代码产出中 AI 占比也已高达 90% 以上。

这种跃迁的本质在于：**人类工程师彻底脱离了源代码的微观手写，转而站在更高的维度控制 Orchestration Loops（调度回路）。** 正如我在之前分析 [《Prompt 不够了，Loop 才是 Agent 时代真正的控制面》](https://ntlx.github.io/articles/claude-loops-control-surface) 中所指出的，未来的核心竞争力不再是写出多么精妙的函数，而是能否为 Agent 提供清晰的上下文、规则边界与自省回路。

## 职能解体：传统“前后端”分工的消亡与新五大角色

当代码编写的门槛降至接近于零，传统基于技术栈（前端、后端、数据库、数据科学）或角色（PM、设计、开发）的分工结构正在迅速瓦解。

在 Anthropic 的 Claude Code 团队内部，设计师可以直接通过 Claude 修改界面渲染代码，而不再需要发 Slack 消息让工程师“把按钮向右移动 1 个像素”。当所有人都能随意产出代码时，工程师的职能按照**软件生命周期**被重新重构为五种新角色：

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-02-claude-code-boris-cherny-odd-lots-img-02-engineering_roles_pentagon.png)

* **Prototypers（原型探路者）**：极速捕捉灵感，在几小时内将模糊的想法转化为可交互的雏形；
* **Builders（产品构建者）**：将验证过的原型整理为标准化、可落地的产品模块；
* **Scalers / Growers（规模爆破者）**：将具有 PMF（产品市场匹配）的产品架构扩张 10 倍到 100 倍（Boris 表示这类人才目前在硅谷极其抢手）；
* **Maintainers（系统维护者）**：确保超大规模基础设施与复杂智能体在长期运行下的稳定性；
* **Sweepers / Janitors（细节扫尾者）**：极度追求细节打磨（Polish），消除产品粗糙边缘，将体验做到极致。

这种重构意味着，未来的“全栈工程师”不再指懂 Node.js 又懂 React 的人，而是指能够独立完成“从原型探路到细节扫尾”全流程的综合决策者。

## 生产力悖论：为什么绝大多数企业还没感知到 10 倍提升？

播客中另一个引人深思的点，是 Joe 提到的商业焦虑：很多大型企业采购了 AI 工具，却发现生产力并未出现指数级飞跃。

Boris Cherny 引用了 1996 年 Harvard Business Review 上关于“计算机生产力悖论”（The Productivity Paradox of IT）的经典研究。30 年前，当个人电脑刚进入办公室时，许多企业只是把 PC 放在房间角落当作一台高级打字机，原有填表、造册的纸质流程毫无变化，因此根本看不到效率提升；而真正实现生产力爆发的企业，直接彻底抛弃了纸质文件柜，把电脑放在了业务流程的几何中心。

今天 AI 的落地也是完全相同的逻辑。如果企业只是把 Claude Code 当作终端里的替代命令行，或者在 IDE 里加个辅助窗口，那它仅仅是一个更好的补全工具。但如果像 Bun 创始人 Jared 那样——在 11 天内消耗 5 万美元 API 额度，通过调度大量 Claude Code 实例，将整个 Bun 代码库从 Zig 完整移植到 Rust——这种围绕 Agent Loops 重新设计的研发流程，就能将原本需要多名工程师闭关一年的重构工作压缩到几天内完成。

有关安全隔离与工具授权的边界探讨，也可以参考我们之前的文章 [《把 Claude 关进笼子：Anthropic 的 Agent 容器化实战与教训》](https://ntlx.github.io/articles/containing-claude-anthropic)。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-02-claude-code-boris-cherny-odd-lots-img-03-productivity_paradox_loops.png)

## 丢失的手艺：当“盲眼雕塑家”戴上视力，人类失去了什么？

在访谈的结尾，主持人和 Boris 探讨了一个富有哲理的问题：**模型写代码为什么比写文章进步更快？**

Boris 用了一个生动的比喻：一个顶级的雕塑家如果被蒙上双眼，作品固然尚可，但难臻完美；但如果让他重获视力并拥有实时的触觉反馈，作品就会质变。Claude Code 之所以强大，是因为它拥有编译器、单元测试、浏览器 DOM 以及运行沙盒所构成的**超紧密反馈回路（Tight Feedback Loop）**。代码写错了，报错信息会立刻喂给模型，让它在几秒钟内完成自省与修正。

然而，这也带来了 Joe Weisenthal 提出的深刻反思：当所有工程师都升级为“高层规划者”（Orchestrators），不再亲手去写底层的指针、内存分配与细节逻辑时，人类是否会丧失对底层的直觉？

这就好比一位传奇吉他手，他不仅懂乐理，更懂琴弦的材质、拾音器的绕线圈数与电子管音箱的物理特性。如果有一天，没有人在意底层机械是如何工作的，我们是否会在高层的繁华中，悄然丢失掉某种最本源的洞察力与技术审美品味？

Claude Code 的崛起让我们看到了 Agent 时代最璀璨的光芒，但如何在享受 10 倍效率提升的同时，保持对技术底层的敬畏与掌控，将是每一个身处这场变革中的从业者无法回避的课题。

---

*如果在你的团队中，已经有非技术成员（如 PM 或设计）开始用 Agent 直接改动代码，你觉得这种变化带来的更多是协同效率的飞跃，还是系统混乱的隐患？欢迎在评论区分享你的看法。*

## 参考资料

- [The Creator of Claude Code on The Hottest Piece of Software in the World | Odd Lots (YouTube)](https://www.youtube.com/watch?v=7C_IHWkHKmU)
- [Claude Code Official Announcement - Anthropic](https://www.anthropic.com/news/claude-code)
- [The Productivity Paradox of Information Technology - Harvard Business Review](https://hbr.org/1993/12/the-productivity-paradox-of-information-technology)
- [7 Powers: The Foundations of Business Strategy - Hamilton Helmer](https://7powers.com/)
- [Bun v1.2 Release & Codebase Migration - Bun Blog](https://bun.sh/blog/bun-v1.2)

## 延伸阅读

- [《当计划变成代码——Claude Code Dynamic Workflows 读后感》](https://ntlx.github.io/articles/claude-code-dynamic-workflows)
- [《Claude Code 正在离开聊天框》](https://ntlx.github.io/articles/claude-code-headless-automation)
