---
$schema: starlight
title: Agent 选了 Resend，然后呢？
description: Zeno Rocha 讲了一个 Agent 报错邮件价格的故事。顺着这次失误往下看，能读懂价格、拿到合适的权限和确认投递状态，是邮件服务接入中的几道不同关口。
date: 2026-11-11
category: ai-agents
primarySourceUrls: ["https://lspace.beehiiv.com/podcast/s/latent_space_the_ai_engineer_podcast/designing_for_agents_zeno_rocha_resend"]
---

一个周日，Resend 的创始人 Zeno Rocha 想看看自己的邮件服务卖得贵不贵。他让 Agent 比较发 120 万封邮件的成本。Agent 算错了 Resend 的报价，还嫌它的定价晦涩。

Zeno 在 [Latent Space 的访谈](https://latent.space/p/resend/)里回忆，报价其实就在网页上，拖动 JavaScript 滑块就能看到。后来他给价格页加了一个 Markdown 版本，几天后再问，Agent 把数字答对了。这是他自己的复试。主持人顺手问了一句，网页和 Markdown 都要更新，两份价格怎么保持一致？

我喜欢这个追问。把价格写成表格，等于多交付了一份能直接核对的材料。可一旦两份价格有出入，Agent 引用得再准确，采购的人还是得回来问该信哪一份。

![核对报价、确认权限、追踪投递的接入流程](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-11-resend-agent-experience-00-infographic-core-summary.png)

## 提案里已经有一个名字

主持人 swyx 有过相反的烦恼。他说项目已经配置了 Cloudflare 的邮件，Agent 给方案时还是选了 Resend。他也在访谈里披露了自己是 Resend 的天使投资人。节目配的截图里，Devin 把 Resend 写进 PR，打算直接发 HTTP 请求。截图把发送功能标为待接通。

![swyx 分享的 Devin PR，Resend 被写入方案，发送功能待接通。图源为 Latent Space](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-11-resend-agent-experience-01-source-pull-request.png)

这张图最有意思的地方在于，审阅者打开 PR 时，已经在看数据库迁移、登录链接和表单了。邮件供应商的选择夹在这些改动中间，很容易当成一个实现细节放过去。等到上线前要申请密钥、验证域名，大家才发现自己多接了一家服务。到了这一步，我会先问 Agent 为什么没有沿用仓库已有的发信路径。

Amplifying 的实验提供了另一个角度。在能抽取主推荐的 102 条邮件类结果里，Resend 拿到 64 条。节目贴出的 Frontier AEO Tracker 截图则显示，在另一套题目和模型组合里，42 条回答中只有 6 条把 Resend 放在首位。两套测试的任务和分母都不同。对审代码的人来说，比品牌出现频率更有用的是知道这次选型用了什么条件。

![Frontier AEO Tracker 的 Resend 结果快照，42 条回答中有 6 条首选 Resend。图源为 Latent Space](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-11-resend-agent-experience-02-source-aeo-tracker.png)

访谈里还有一段更早的分发故事。Resend 团队做发信 API 时，开发者先抱怨邮件模板难写，于是团队做了 React Email，并写了怎么用它配 SendGrid。模板可以先留在代码库里，发送服务等到需要时再挑。这个顺序让我想到，做给 Agent 用的产品也可以先交出一份有用的东西，比如一张可核价的表，或一段能沿用现有服务的例子。即便它最后选了别家，这些材料也帮它完成了眼前的工作。

## 选对了工具，也可能被返回值卡住

Zeno 说他会展开聊天里折叠的工具调用，看看 Agent 究竟拿到了什么。有一次查联系人时，结果太大，塞不进上下文。那一节开头还在谈 MCP 的工具目录。Resend 在访谈时有八十多个命名工具，想覆盖邀请同事、查用量之类的后台操作。Cloudflare 的 Code Mode 给 Agent 两个入口，用 `search()` 查接口，再用 `execute()` 调用它。

工具目录解决的是去哪儿找操作。联系人那次卡住，发生在操作已经找对之后。比如要确认一个收件人是否订阅了某类通知，我希望工具返回该地址的订阅状态，有歧义时再给出可供确认的候选。把通讯录送回对话，会让模型花上下文找一个字段，也把无关的人带进了这次操作。[Anthropic 的工具设计指南](https://www.anthropic.com/research/writing-tools-for-agents)也建议围绕任务返回模型用得上的信息。

Resend 为远程 MCP 加 OAuth 时，Zeno 说团队还得回头检查用户能访问哪些资源。这里和我之前写的[给 Agent 划权限边界](https://ntlx.github.io/articles/anthropic-brain-and-hands)有交集。查询测试邮件的投递状态，可以只给读取权限。给真实用户发信，则需要另一次明确的授权。即使两个动作都能在同一个聊天框里完成，授权记录也应该让人看出这两件事分别是谁允许的。

## 邮件发出去以后

想象一次密码重置接入。开发者验收时，能从变更里看到 Agent 沿用了哪家邮件服务，从测试记录里看到邮件去了哪个测试地址，再用消息 ID 查后续事件。假如界面最后只写“已发送”，这条链就在最容易误会的地方断了。

Resend 的事件文档把 `email.delivered` 定义为邮件已经交给收件人的邮件服务器。对方怎么归类、用户有没有看到，还要靠别的证据。访谈里讲到打开追踪时，这个区别更明显。图片加载可以来自客户端的预加载，不能直接当作人读了邮件。点击追踪还有另一笔账。邮件服务如果用共享域名改写链接，同一个追踪域名上的其他发件人可能受连累。Resend 为此提供了自定义追踪域名。

再看那个价格滑块，网页当然可以保留好用的交互，Markdown 也可以继续方便 Agent 读取。两种页面若来自同一份价格数据，价格变了，负责核价的人就少一次猜测。发信也可以照这个思路做。让界面和 Agent 查到同一条消息、同一个事件和它的确切含义，用户就知道还要不要再等，还是该查下一段投递链路。

## 参考资料

- [Latent Space 访谈、章节与原图](https://latent.space/p/resend/)
- [节目官方完整逐字稿](https://rss.beehiiv.com/podcasts/transcriptions/01a1c6ff-5771-7df7-ba35-b6306c6494aa.vtt)
- [Amplifying 的 Claude Code 选型报告](https://amplifying.ai/research/claude-code-picks/report)
- [Resend 的 Markdown 价格表](https://resend.com/pricing.md)
- [React Email 的 SendGrid 接入文档](https://react.email/docs/integrations/sendgrid)
- [Resend MCP 文档](https://resend.com/docs/mcp-server)
- [Cloudflare Code Mode](https://blog.cloudflare.com/code-mode-mcp/)
- [Resend 投递事件定义](https://resend.com/docs/webhooks/event-types)
- [Resend 自定义追踪域名说明](https://resend.com/blog/introducing-custom-tracking-domain)
