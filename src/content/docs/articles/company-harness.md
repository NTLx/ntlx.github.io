---
$schema: starlight
title: 同一个 Agent，进了群聊还能替你做什么
description: LangChain 的内部 Agent 案例让我更关心任务换场景后的授权。私聊能读的邮件、个人记忆和后台身份，需要在协作入口、存储与执行之间分别核对。
date: 2026-11-11
category: ai-agents
primarySourceUrls: ["https://www.langchain.com/blog/components-building-company-harness"]
---

读 LangChain 的《The five components of building a “company harness”》时，我在一个很小的设计上停了下来。它的 GTM Agent 可以代用户处理邮件，但邮件工具只在私聊中开放，放进共享频道就不可用。

一个人没有换账号，也没有换 Agent，只是换了说话的地方，可调用的工具就变了。这个例子让我觉得，公司内部 Agent 值得仔细设计的部分，藏在这些场景变化里。

原文把内部经验归纳成协作入口、身份、记忆、代码执行和后台触发。这里的 harness，可以理解为支撑 Agent 持续工作的运行设施。LangChain 用销售与市场相关的 GTM Agent、工程助手 OpenSWE 和营销助手 Content Studio 来说明这套设施如何工作。读完之后，我更想沿着一项具体任务看，人在私聊里给出的委托，进入群聊、被记下来、转成定时任务之后，会发生什么。

![文章核心信息图，一次具体委托需要分清的五个问题](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-11-company-harness-00-infographic-core-summary.png)

## 能代表你，不等于适合当众使用

让 Agent 代用户做事，通常要回答“它拿谁的凭据”。原文区分了代表调用者操作的 on-behalf-of，以及使用固定凭据的方式。OpenSWE 接到用户消息时，可以用用户的 GitHub 身份开 PR；在后台做代码审查时，则使用自己的 GitHub App 身份。

Content Studio 又有另一种组合。访问 Notion 时，它代表调用者；操作公司的 X 账号时，则使用固定凭据，并用白名单限制谁能执行某些操作。能读取、能起草、能发布，在这里需要分别安排。

原文身份矩阵把这些组合放在了一起，配图来源为 LangChain。它没有给整只 Agent 贴一个“个人助手”或“公司机器人”的标签，而是按具体服务和操作区分身份。

![LangChain 原图，服务和操作对应的用户身份与 Agent 身份](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-11-company-harness-01-source-identity.png)

邮件工具的限制还涉及结果的观众。假设我让 Agent 找出某位客户最近的来信，随后在项目群里继续追问。即使它仍然代表我读取邮箱，回复的观众已经变了。读取权限属于我，输出却可能出现在别人的屏幕上。

所以我赞同原文将邮件工具限制在私聊里的做法。这是一个容易理解的产品边界。实现类似系统时，我会把调用者、实际操作身份、结果接收者分开检查。确认“是本人发起的”，仍然需要继续确认“这份结果可以交给谁”。

## 聊天适合发起工作，积压事项需要可见的状态

原文还讲了 Slack 中的 breakout。人们正在讨论时，可以叫 Agent 另开线程执行任务，避免它在原来的对话里不断插话。这个细节让协作中的注意力有了安排。任务需要有进度，人类讨论也需要继续。

不过，LangChain 并没有把所有操作都塞进聊天。对于 GTM Agent 提议发送的邮件，偶尔在 Slack 审一下可以；积压很多时，他们另外做了界面。原文的邮件截图展示了会话列表、状态和待处理入口，下面复用的正是这张截图。

![LangChain 原图，GTM Agent 邮件列表与处理状态](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-11-company-harness-02-source-email.jpeg)

这让我重新理解“住在人们工作的地方”。它可以意味着从已有协作软件进入，也可以意味着处理工作时有合适的界面。需要逐条比较、批准、搁置的事项，靠一串消息很难保持清楚。

如果我要验收一个内部 Agent，会让它积累一些待审核事项，再看人能否迅速分清哪些等着处理、哪些执行过、哪些需要自己决定。对话流畅只覆盖了发起任务的体验，批量处理时的状态同样值得单独试。

## 记忆隔离，还要看内容写进了哪里

原文将记忆分为全局与用户两个层级，也坦言这是还需要探索的领域。只看这份分类，很容易以为给用户各建一个目录，问题就处理好了。

我继续读了它链接的[记忆文档](https://docs.langchain.com/langsmith/python/managed-deep-agents-memory)。其中有个直接的提醒，值得比“两层记忆”本身多读一遍。共享记忆对调用者可见，运行时会提醒 Agent 不要往里面存私人信息，但这种提醒属于指导，并没有强制执行保证。

这意味着，存储之间有隔离，也可能挡不住模型一开始就把内容写错地方。把客户邮件中的细节提炼成“团队经验”，如果落进共享区域，后续调用就可能接触到它。这里说的是风险路径，并非原文报告过的事故。

文档也提供了更具体的控制方式，例如按运行场景选择挂载哪层记忆，或对记忆写入要求审核。个人记忆在 Slack 频道和群聊中默认不挂载，是一个与邮件工具限制相呼应的设计。

我的判断是，团队通用流程适合进入共享记忆；个人偏好和客户相关内容则需要更谨慎地决定保存位置。验收时应该检查写入后的实际内容和可见范围，不能只问 Agent 有没有遵守那句提醒。记忆保存的是内容，也会把一次对话的影响带到后来的任务中。

## 沙箱藏住了密钥，业务动作仍要有范围

LangChain 的内部 Agent 可以写代码并在沙箱执行，Agent 本身运行在沙箱之外。原文的结构图很清楚，代码向外部服务发请求，由沙箱外的认证代理补上凭据。下方复用的代理结构图同样来自 LangChain。

![LangChain 原图，沙箱外认证代理为请求注入凭据](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-11-company-harness-03-source-sandbox.jpeg)

这种安排减少了把密钥直接交给生成代码的需要。官方[认证代理文档](https://docs.langchain.com/langsmith/sandbox-auth-proxy)进一步说明，代理向匹配的请求注入认证信息，网络访问范围则另有配置。

我会在这里追问业务权限。代码即使看不到密钥，也可能经代理发出有凭据的请求。如果它被允许访问客户系统，仍需区分读取资料、修改记录和执行批量操作。代理能够处理认证信息，具体动作是否符合这次委托，还要由相应策略和业务系统来约束。

这与本站此前[讨论任务权限的文章](https://ntlx.github.io/articles/agent-shared-infrastructure-task-scoped-permissions)能接起来。那篇关注权限是否沿调用链传递；这个案例补充了更具体的场景变化。同一任务既可能从聊天走向代码，也可能从私聊走向共享频道，每次变化都应重新检查数据与动作的范围。

## 转入后台之后，委托该怎样继续

原文说，相当一部分运行来自定时安排或后台事件，没有给出具体占比。OpenSWE 会响应新 PR 做审查，用户也可以请 GTM Agent 设置每日简报。

![LangChain 原图，消息、事件和定时任务触发 Agent](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-11-company-harness-04-source-triggers.png)

后台运行让前面的区别更难省略。交互时还可以追问用户，定时任务启动时，人未必在线。要用谁的身份、读取什么资料、把结果送到哪里，需要提前安排。

对应的[调度文档](https://docs.langchain.com/langsmith/python/managed-deep-agents-schedules)说明，Agent 在运行中创建 schedule，仍然需要经过开发者编写并暴露的工具。这里可以选择开放哪些能力，并非让模型任意接管整个调度系统。

如果要把这篇文章用在自己的项目里，我会拿一个假设任务做验证。让 Agent 整理客户来信、起草回复并设置后续简报，然后逐步改变条件。

- 把私聊任务转到群聊，观察邮件内容和个人记忆是否仍被调用、发给了谁。
- 将用户主动请求改为定时触发，检查运行使用的身份与结果去向。
- 撤销邮件授权后再触发，确认任务如何报告失败，是否会误用其他凭据继续。
- 让同一事件重复到达，检查是否产生重复草稿或重复外发，以及人能在哪里暂停任务。

这些是我据案例提出的验收建议，原文没有提供这些检查的内部系统验证结果。LangChain 在结尾推介了 Managed Deep Agents，但内部案例也不足以证明所有公司都适合使用同一套产品。

我从这篇文章得到的收获，是把 Agent 的设计单位缩小到一次具体委托。谁发起、替谁操作、保存什么、交给谁、何时再次运行，需要能连起来解释。把这件事想清楚之后，协作入口、记忆和沙箱才有了可以验证的安排。

## 参考资料

- [LangChain 原文与本文复用图片出处](https://www.langchain.com/blog/components-building-company-harness)
- [身份配置](https://docs.langchain.com/langsmith/python/managed-deep-agents-identity)与[连接凭据的所有者](https://docs.langchain.com/langsmith/python/managed-deep-agents-connections)
- [持久记忆及访问控制](https://docs.langchain.com/langsmith/python/managed-deep-agents-memory)
- [沙箱认证代理](https://docs.langchain.com/langsmith/sandbox-auth-proxy)
- [定时任务声明与运行时创建](https://docs.langchain.com/langsmith/python/managed-deep-agents-schedules)
- [Managed Deep Agents 概览](https://docs.langchain.com/langsmith/python/managed-deep-agents-overview)
