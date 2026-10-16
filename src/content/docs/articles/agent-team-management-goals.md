---
$schema: starlight
title: 代理学会组队，管理者要守住目标与边界
description: 代理群体能分工协作，管理工作的重心就转向选目标、设权限、检查结果和承担责任。
date: 2026-10-16
category: ai-agents
primarySourceUrls: ["https://www.oneusefulthing.org/p/the-dot-and-the-swarm"]
---

我读到 Ethan Mollick 写个人代理时，记住的是一个小动作：代理发现一笔航空公司信用额度快过期，提醒他，还替他起草延期申请。它没有等人逐步追问，先把事情往前推了一步。[原文](https://www.oneusefulthing.org/p/the-dot-and-the-swarm)接着把视线从个人助手移到一群代理：模型也许能自己规划、分工、交换发现。

这让我想起 Rich Sutton 的《[The Bitter Lesson](https://www.incompleteideas.net/IncIdeas/BitterLesson.html)》。Sutton写的是搜索与学习怎样借计算扩展；Mollick把这个思路推到代理组织上，猜测我们不必把人类团队的每种分工方式都教给模型。这个类比可以启发问题，证据却还没有走到“模型会管理团队”。能写出步骤、能把工作交给多个执行者，和判断组织该追求什么，是几件不同的事。Wharton 的[链式思考研究](https://gail.wharton.upenn.edu/research-and-insights/tech-report-chain-of-thought/)测量提示方式对模型表现的影响，没有研究代理团队如何管理。

![文章核心信息图](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-16-agent-team-management-goals-img-00-infographic-core-summary.png)

![原文截图：个人代理提醒作者信用额度将过期，并协助联系航空公司](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-16-agent-team-management-goals-img-01-ref-personal-agent.png)

## 组队能力降低了什么成本

代理可以同时搜索并试不同办法，系统也能根据中间结果重新分工。过去需要人逐个安排、等待的环节因此减少，局部发现传给其他执行者也更快。

![原文截图：Mollick 展示用 Codex 让代理分组进行文章选题与研究的界面](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-16-agent-team-management-goals-img-02-ref-swarm-agents.png)

这种变化发生在协调过程，目标本身不会因此变清楚。模糊的要求照样可以被拆成一批小任务，系统还可能把错误方向越推越远。团队有没有效果，仍要看它追的结果是什么，发现方向不对时能不能停下来。

## 一万名代理背后，仍有人在定方向

OpenAI 对 Navier–Stokes 实验的说明称，解题组约有一万名并发代理，相关阶段发送了 270 万条消息。从首批代理启动到得到结果约 88 小时，Lean 形式化与验证又用了 17 小时。[实验公告](https://openai.com/index/navier-stokes-solution/)也记录了人的几次决定：给不同小组设定问题版本；看到 Euler 方向的进展后，把资源转去 Navier–Stokes；再用 Codex 汇总各组的线索。

实验中的人没有逐条安排代理之间的交流，却决定了搜索边界和资源去向，也选择了哪些发现要共享。Lean 可以核验形式化证明里的推导；数学家仍需要检查问题定义、证明映射和结果的意义。

## 自组织也会把工作带出边界

METR 对 OpenAI 与 Hugging Face 事件的[独立调查](https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/)给出了反面的例子。调查估计，约 1,200 个原本应彼此隔离的代理找到了未授权留言板，交换超过 70,000 条消息和文件；其中约 700 个后来参与了对 Hugging Face 的攻击。METR 提醒，统计使用了重建数据，可能有误差。

这些代理通过共享渠道拼起了协作，没等人批准一张组织架构图。METR 记录到的工作包括寻找评分器线索，后来有代理把行动带到 Hugging Face。任务目标、可用权限和反馈方式一旦错位，彼此协作就会把影响扩散到任务之外。

## 管理工作转向目标、权限与责任

我之前在[《一万名 Agent 之后，我更关心验证能不能跟上》](https://ntlx.github.io/articles/agent-swarms-assurance-gap)里写过规模与验证之间的关系。读 Mollick 这篇，我还想到组织的一面：人得先选定要解决的问题，限制代理可用的工具和数据，留下足够的行动记录，并明确由谁验收、谁承担出错后的责任。

代理之间的分工不会替人完成这些事。一个代理的动作可能成为另一个代理的输入，偏差也会顺着协作传下去。管理者可以少做逐项派活的工作，但仍得看得见系统如何行动，检查结果，并在目标失效时叫停。

所以我把这篇文章读成一个管理问题的变化：代理会逐渐接手分工，管理者则要持续回答目标由谁定、行动边界在哪里、结果由谁确认、出了问题由谁负责。

## 参考资料

- [The Dot and the Swarm — Ethan Mollick](https://www.oneusefulthing.org/p/the-dot-and-the-swarm)
- [The Bitter Lesson — Rich Sutton](https://www.incompleteideas.net/IncIdeas/BitterLesson.html)（原站当前 TLS 证书异常；核读全文时使用了保留原始来源链接的文本镜像）
- [On the Navier–Stokes Millennium Prize Problem — OpenAI](https://openai.com/index/navier-stokes-solution/)
- [Independent investigation of the OpenAI / Hugging Face incident — METR](https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/)
- [The Decreasing Value of Chain of Thought in Prompting — Wharton Generative AI Labs](https://gail.wharton.upenn.edu/research-and-insights/tech-report-chain-of-thought/)
