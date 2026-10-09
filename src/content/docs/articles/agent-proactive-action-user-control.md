---
$schema: starlight
title: 一个愿意替你修故障的 Agent，先得学会何时停手
description: Agent 开始主动做事后，产品要让用户看见它的权限与进度，也能及时暂停。衡量价值时，用户省下多少注意力比并行任务数更值得看。
date: 2026-10-09
category: ai-agents
primarySourceUrls: ["https://www.lennysnewsletter.com/p/openais-head-of-chatgpt-were-entering"]
---

Tibo Sottiaux 在访谈里讲了一个很小的故障：DevDay 的直播演示开始前五分钟，他的 dot 提醒他 ChatGPT 生产服务出了问题，还问要不要试着修复。Tibo 没让它动手，只回了一句：“你还没到那个程度，不过谢谢你提醒。”

这个助手记得 DevDay 和演示时间，也把生产故障与眼前任务联系起来了。可一旦它要修改生产环境，要求就完全不同：提醒可以主动发出，修复需要授权。主动性和行动权限，得分开设计。

![Agent 从识别情境、提醒用户到等待授权并可暂停的设计边界](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-09-agent-proactive-action-user-control-img-00-infographic-core-summary.png)

## 提醒与修复，需要两道权限线

这个 dot 没等 Tibo 写出完整指令，而是把 DevDay、演示和生产故障连到了一起。提醒来得及时，至少把一个可能影响演示的风险提前摆到了他面前。它询问是否修复，也把另一条边界留在了桌面上：告警可以主动发出，影响生产的操作仍应由有权限的人决定。

![Tibo Sottiaux 的 Lenny’s Podcast 节目封面；图源：原文页面](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-09-agent-proactive-action-user-control-img-source-episode-cover.png)

这类能力做成产品后，界面应该展示它根据什么信息做判断、准备访问或修改什么，以及哪一步需要确认。高风险动作可以先只读观察，再给出修复建议，经批准后执行。用户也应该能随时暂停。

我此前写过[《OpenAI 的软件工厂：让 Agent 对一条变更负责到底》](https://ntlx.github.io/articles/openai-agentic-software-factory)，关注一条变更怎样经过验证再进入生产。这次访谈把同样的问题带到个人助手身上：它不仅要知道怎么把事情做完，还要知道什么时候应该把决定交还给人。

## 让助手接手调度，控制权仍留给用户

Tibo 描述了一个 agent 团队的伸缩过程：推进能力边界时，团队会扩大；模型有突破后，单个 agent 能承担更多，团队又可以收回来。他不认为普通用户长期手动搭 loop、调 graph 会是最终形态，更希望系统记住用户的目标、偏好和反馈。

把配置从用户面前收起来，是为了少让用户管理工具本身。每个新工具都要求人先学一遍设置，“管理 Agent”很容易变成另一份工作。界面可以收起细枝末节，用户仍要留着控制权。常见的低风险事情可以交给系统选路径；涉及生产数据或对外发送的操作，用户仍要看得明白，也能决定继续还是停下。

我之前在[《当 AI 开始记住工作，人还要做什么？》](https://ntlx.github.io/articles/persistent-ai-coworkers)里讨论过任务如何跨越对话保留状态。这次访谈让我更在意它的另一面：当任务有了记忆和主动性，产品要安排好它什么时候来找人、什么时候安静等待。如果用户还得反复检查助手是否在打扰自己，体验就没有省下来。

## Agent 流量会把问题推到系统成本

Tibo 预测未来互联网多数操作将由 Agent 完成。这是他的判断，不是已经发生的流量统计。访谈里有个具体例子：Notion 开放 MCP 后，Agent 能直接调用，流量随之增加，系统承受了压力，成本怎么分也需要处理。机器若会反复调用接口并持续工作，容量和授权边界要能承受这些请求，价格也要覆盖自动化产生的使用量。

![Agent 请求进入产品接口后，容量与使用成本都需要纳入设计](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-09-agent-proactive-action-user-control-img-02-framework-agent-economics.png)

人的产品使用通常围绕主动操作展开；Agent 则可能以更高频率调用接口，也可能在用户离开屏幕后继续工作。服务端接口要承受预期负载，权限要能限定到具体资源，失败和重试需要边界，付费方式也要覆盖自动化用量。

访谈谈到插件推荐时，Tibo 强调用户是否留存、插件有没有持续增加效用。推荐机制若看这些指标，插件能不能被发现就和用户是否持续获益连在了一起。

## 生产力提升要包括人的注意力

谈到工程师的日常时，Tibo 提到了孤独和上下文切换。他认为 AI 应该降低噪声，让人把注意力放回真正想做的事；少开些会、休息好一点，可能反而更有效率。

![Agent 降低通知噪声、让用户保留注意力的设计目标](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-09-agent-proactive-action-user-control-img-03-scene-attention-budget.png)

这点容易在产品指标里消失。调用量容易统计，用户少了多少切换、是否减少重复检查，却需要团队特意观察。Agent 让团队产出增加、疲惫也随之增加，不能算工作体验得到改善。

产品团队可以从一次打断开始评估：通知有没有说明触发原因，下一步是否在授权范围内，判断错了能否暂停并回到可理解的状态。用户看得懂通知理由和权限范围，系统才有条件把更多主动权交给 Agent；否则，监督工作仍会落回用户身上。

让 Agent 替人推进工作，检验点在它能否判断何时行动、何时等待用户决定。Tibo 的 dot 在演示前及时报了故障，也把修复决定留给了他。对要交给它的工作，提前写清权限范围、暂停入口和出错后的责任人，比把任务目标喊得更大更实际。

## 参考资料

- [Lenny’s Newsletter：OpenAI’s Head of ChatGPT: We’re entering a new era of AI (again) | Tibo Sottiaux](https://www.lennysnewsletter.com/p/openais-head-of-chatgpt-were-entering)
- [OpenAI Dots 官方介绍](https://chatgpt.com/features/dots/)
- [《OpenAI 的软件工厂：让 Agent 对一条变更负责到底》](https://ntlx.github.io/articles/openai-agentic-software-factory)
- [《当 AI 开始记住工作，人还要做什么？》](https://ntlx.github.io/articles/persistent-ai-coworkers)
