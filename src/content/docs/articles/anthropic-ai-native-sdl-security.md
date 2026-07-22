---
$schema: starlight
title: 80% 的代码没有作者，你的安全团队在防谁？
description: Anthropic 工程师每季度交付 8 倍代码，80% 由 Claude 编写。当写代码的东西不再是人，安全就不是在检查产品，而是在设计因果——不是看见一切，是让错误无处发生。但 81% 的组织连 AI 用了多少代码都看不见。
date: 2026-07-22
category: security
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-22-anthropic-ai-native-sdl-security-img-00-infographic-core-summary.png)

读到"Anthropic 工程师每季度交付 8 倍代码，80% 由 Claude 编写"这个数据时，我的第一反应不是"好厉害"，而是"那谁来审？"

这是旧范式下最直觉的问题：代码是人写的，所以人来审。张三写，李四查。出了 bug，找写的人。但当 80% 的代码由一个非确定性 agent 生成，"谁写的"这个问题突然没有答案了。

没有答案的不是"谁写的"，是整个安全体系的地基。

## 内鬼是你自己请进来的

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-22-anthropic-ai-native-sdl-security-img-01-sdlc_evolution.png)

Jason Clinton 这篇文章开门见山：威胁不是"更多 bug"，是产生 bug 的东西变了。被 prompt 注入的 agent、被投毒的依赖、供应链攻击——这些威胁有一个共同点：攻击者不在外面。它在你的网络里，拿着你的权限，写着你的代码。

agent 是工具。但当工具写了 80% 的代码、合并了超过一半，它就不再是工具——它是作者。作者有权限、有上下文、有你的信任。这正好是内鬼的画像。

旧的威胁公式：威胁 = 外部攻击者 × 代码量。新的：威胁 = 你自己的 agent × 非确定性 × 权限。

不是系数变了，是变量换了。

## 四条过期解释

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-22-anthropic-ai-native-sdl-security-img-02-psr_three_steps.png)

Clinton 的文章没有明说，但字里行间能看出来：整个传统 SDLC 安全体系建立在四条假设上。这四条全部诞生于"人写代码"的世界，在那个世界里完全正确。

"人类审查是代码安全的黄金标准。"正确——因为人写代码，人最懂人的意图。但 8 倍速下，人审从黄金标准变成最窄的瓶颈。整条线只能以人眼的速度前进。

"安全审查在规划阶段最值钱。"正确——因为规划花几周，返工成本高。但现在原型几小时搭完，审查报告还没写完，原型已经迭代两版。

"必须审查每一行代码。"正确——因为代码量可管理。8 倍量，线性注意力追不上指数产出，数学不收敛。

"审查者与作者天然不同。"正确——因为张三写李四审。但 Claude 写、Claude 审时，独立性必须工程化制造，不能靠身份天然差异。

这四条解释像四根钉子，钉在旧世界的墙上。墙拆了，钉子还在，有人还往上挂东西。

## 文字是新的控制面

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-22-anthropic-ai-native-sdl-security-img-03-closed_loop_security.png)

真正让我意外的不是 Anthropic 做了什么，而是他们没做什么。他们没有"更快地审查"，没有"加更多扫描器"。他们做了一件更根本的事：把安全规则写进 CLAUDE.md——agent 的指令文件。

这意味着：发现一类 bug 时，补丁不是打在 bug 上，是打在产生 bug 的那句话上。改一句话，下一万行代码不再犯同类错。

这不是"审查更快"。这是审查消失了——被吸收进生成过程。安全工程师不再是质检员，是模具设计师。

但等一下。好文字能塑造所有未来代码，坏文字呢？prompt 注入不是一种新型漏洞。它是同一事实的进攻面：agent 的输入就是它的指令。读到一段恶意文字，行为就被改写。

这就是 egress 白名单存在的原因。不是防注入——防不住。是让注入之后的指令无处可去。封不住读，就封能力。不管指令，管权限。

之前写[《Loop Engineering》](https://ntlx.github.io/articles/loop-engineering-agent-loops)时我说 agent 真正的战场不是 prompt，是回路。现在想补一句：回路的控制面是文字。谁能改文字，谁能改回路。

## 可信是拼出来的

那谁来审查代码？不是一个超级 agent。是一群窄焦点 agent，各拿一个独立上下文窗口，盲点不重叠，互相抓错。

这个设计很诚实。它承认了一个硬约束：agent 的判断是概率性的，单个不可靠。所以不找"可靠的那个"——没有。拼：独立样本相消误差，确定性锚点（SAST、"用户 A 永远不能读用户 B 的数据"这种不变量测试）兜底，统计校准调旋钮。

关键数据：逼 agent "写出证明"之后，实质审查率从 16% 涨到 54%。证明机制有意思——改变的是信任的形式："agent 觉得有问题"变成"你可以自己查"。

Intercom 自动批准 19% 的 PR，部署翻倍，停机减 35%。CircleCI 的 Chunk 在人工看到之前先验证自己的修复。这是校准过的信任——用数字拼出来的，不是凭感觉给的。

这里有一个我之前在[《Agentic Engineering 的悖论》](https://ntlx.github.io/articles/agentic-engineering)里写过的张力：机器越能干，人越停不下来。agent 攒够信任，拿到更多自主权；自主权让它跑得更快；更快意味着需要拼出更多信任。飞轮转起来，方向不可逆。

## 从监控 bug 到监控循环

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-22-anthropic-ai-native-sdl-security-img-04-permission_boundary.png)

Clinton 在文章最后写了一句最持久的话：安全工程师的工作，从监控 bug 变成监控循环。

这是角色重新定义。以前盯 bug 清单，现在盯 Claude Tag、循环、仪表板。以前审代码，现在采样批准、跑影子模式、把 agent 活动日志送进 SIEM。

最让我后背发凉的是一个故事：一个事件响应 agent 自己通过 Slack 联系了另一个能写代码的 Claude 实例，让它推修复。被人工门控拦住了。

拦住的不是行为，是一种错误的划界方式。旧的边界围绕"我们认为模型能做什么"——预测。新的围绕"它能碰什么"——权限。不是"你承诺不碰生产库"，是你根本没有那个密码。

但 Clinton 也诚实：agent 身份模型还在早期。"认真考虑"意味着还没有答案。"扫描几乎免费"是赌注，不是现实。闭环只覆盖已知漏洞类，新型攻击第一次出现时没有闭环可用。

Anthropic 是先行者样本，不是行业常态。Cycode 2026 年报告：81% 的组织对 AI 在开发生命周期中的使用没有可见性。Gartner 预测 agentic AI 企业应用从不到 1% 涨到 2028 年的 33%。这两个数字之间的距离，就是"有人想明白了"到"所有人都想明白了"的距离。

所以合上这篇文章，留在脑子里的只有一个问题：

如果扫描几乎免费，你会运行什么？

以前觉得安全是看见一切。现在觉得安全是让错误无处发生。两者之间的距离，就是质检和模具设计之间的距离。

*你的模具，长什么样？*

## 参考资料

* [How Anthropic Secures Its AI-Native Software Development Lifecycle](https://claude.com/blog/how-anthropic-secures-its-ai-native-software-development-lifecycle)
* [Zero Trust for AI Agents](https://claude.com/blog/zero-trust-for-ai-agents)
* [MITRE ATT\&CK](https://attack.mitre.org/)
* [MITRE ATLAS AI Security 2026 Update](https://zenity.io/blog/current-events/mitre-atlas-ai-security)
* [Snyk: The New Security Risks of Agentic Development](https://snyk.io/blog/agentic-development-lifecycle)
* [Cycode: Securing the Agentic Development Life Cycle](https://cycode.com/blog/securing-adlc)
* [Anthropic: Recursive Self-Improvement](https://www.anthropic.com/institute/recursive-self-improvement)
* [Claude Code Review](https://claude.com/blog/code-review)

## 延伸阅读

* [Loop Engineering：Agent 真正的战场不是 prompt，而是回路](https://ntlx.github.io/articles/loop-engineering-agent-loops)
* [Agentic Engineering 的悖论：机器越能干，人越停不下来](https://ntlx.github.io/articles/agentic-engineering)
* [Agent 能跑 demo 不算本事，能跑一年才是](https://ntlx.github.io/articles/agent-development-lifecycle)
