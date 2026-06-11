---
$schema: starlight
title: 当 AI Agent 学会自己定时上班
description: "定时部署 + 密钥保险库——两条看似平淡的功能更新，合在一起却是 AI agent 从\"你叫才动\"到\"自己上班\"的分水岭。真正的瓶颈从来不是模型能不能干，而是你敢不敢把钥匙交出去。"
date: 2026-06-11
category: engineering
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-11-ai-agent-scheduling-img-00-infographic-core-summary.png)

Anthropic 六月份给 Claude Managed Agents 加了两项功能：定时运行和环境变量保险库。看一眼标题——"cron + env vars"——很容易翻过去。又是企业功能，又是 API 更新。

但把这两条放在一起看，事情不太一样。

一条解决的是"谁来叫 agent 起床"。另一条解决的是"agent 出门时钥匙放哪"。合在一起，回答的是同一个问题：*你敢不敢让一个 agent 自己上班，不用你看着？*

## 从 cron 说起：agent 不再需要你按按钮

定时部署这功能本身没什么技术含量。cron 是 UNIX 在 1970 年代发明的，比大多数程序员都老。把 cron 加到 agent 平台上，听起来像给火箭装个闹钟——值得发篇博客吗？

值得。不是因为 cron 有多新鲜，是因为它回答的问题变了。

在此之前，不管 agent 多能干活，启动权在你手里。你打开终端、你发 API 请求、你按回车。这意味着 agent 始终是一条手臂的延伸——它帮你做，但不是替你记着做。

定时部署把"记着做"这件事也交给了 agent。你定义任务和节奏，它自己按点醒过来，干完活，继续睡。不算是技术飞跃，但它改变的是 agent 在组织里的位置：*从工具变成了岗位*。

Rakuten 的团队已经在这条线上跑了。他们让 agent 按周、按月自动分析电子表格数据，生成报告和幻灯片。高级用户把 agent 挂在生产日志上，产品经理不需要做仪表盘就能看到应用健康状态。Actively 更直接——把自建的调度基础设施全拆了，换成了 Managed Agents 的定时部署，技术栈简化了一大截。

这些案例有一个共同点：agent 做的事没变，但"谁在什么时候让它做"这个决策权从人转移到了系统。这个转移，才是定时部署真正的新闻。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-11-ai-agent-scheduling-img-01-arch.png)

## 安全模型：钥匙放在 agent 够不着的地方

定时运行带来了一个新问题：agent 在你不在场的时候干活，它需要的那些 API 密钥、数据库密码、第三方 token，放在哪？

放在环境变量里——几乎所有开发者的第一反应。但 Pluto Security 四月份对 Managed Agents 做了逆向分析，结论很直接：沙箱里的环境变量，agent 全都能读到。包括那个 JWT 令牌，decode 之后能看到组织 UUID、session ID、HIPAA 合规状态和完整的出口白名单。如果密钥也放在环境变量里，prompt injection 攻击者拿到它只是时间问题。

所以 Anthropic 这次做对了一件事：环境变量 vaults 的真正含义不是"环境变量"，是"vault"。

密钥存储在你的 vault 里。沙箱里放着的是一个占位符。agent 发起请求时，网络边界上的凭证代理把真密钥注入 HTTP 请求头，agent 从头到尾不知道密钥长什么样。Pluto 管这叫"平台最强的安全属性"——结构性防御，不是你提醒 agent 别泄露密钥的软约束，而是它根本没有密钥可以泄露。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-11-ai-agent-scheduling-img-02-flow.png)

## 默认配置的裂缝

好架构是一回事，出厂设置是另一回事。

Pluto 的分析指出一个让人不太舒服的事实：Managed Agents 的默认配置是全部 8 个工具启用 + always\_allow 权限 + 不受限网络。也就是说，按照 quickstart 创建的 agent，可以在沙箱里写文件、执行 bash、访问任意网站，而且不需要任何人确认。

Anthropic 的工程团队显然知道安全怎么做——三层出口控制、gVisor 沙箱、vault 凭证从不进沙箱，每个设计都花过心思。但把这些好设计包在一个"全开"的默认配置里交给开发者，像装了十把锁的门，出厂密码 0000。

这不是 Anthropic 独有的问题。整个 agent 行业都在抢"从零到跑通"的速度，安全配置被默认为"生产部署前再改"。但定时部署让这个问题变得更紧迫——agent 不再是你盯着它干活，而是你睡觉的时候它在干活。你第二天早上看到的日志里如果有一条异常的 API 调用，它是 bug 还是 prompt injection？你分不清。

## 它到底改变了什么

回到一开始那个问题：你敢不敢让 agent 自己上班？

Anthropic 的回答分为两层。表面层是功能：cron 给了 agent 时间自主权，vault 给了 agent 安全通行证。底层是态度：Managed Agents 四月份发布时说的是"你不用管基础设施"，六月份这两条说的是"你也不用管它什么时候干活、怎么拿钥匙"。

这两层的间隙里藏着一个判断——Anthropic 认为 agent 从"辅助工具"到"自主劳动者"的转变，已经到了可以产品化的阶段。35 次发布在五个月内完成，从 Cowork 到 Agent Teams 到 Dynamic Workflows 到现在的定时部署，每一步都是在把 agent 往"不需要你"的方向推。

这个判断对不对？Rakuten 减少 97% 严重错误、Sentry 从根因分析到合并 PR 从数月变数周、Browserbase 用 agent + 浏览器自动生成并验证技能目录——这些数字在说"对"。

但 Pluto 的逆向分析也在说另一个东西：*架构是对的，但使用它的人还没准备好。* 定时部署 + vault 的组合让你可以放心地让 agent 自己上班，前提是你真的做了安全配置，而不只是跑了 quickstart。

这不是一个功能更新。这是一个选择题，摆在每个用 agent 的团队面前：你是把 agent 当工具用，还是当岗位用？答案决定了你接下来该读的是 API 文档，还是安全加固指南。

*你愿意把哪类任务交给一个自己定时上班的 agent？底线画在哪里？*

## 原文参考

> Claude Blog - New in Claude Managed Agents: run agents on a schedule and store environment variables in vaults
> <https://claude.com/blog/whats-new-in-claude-managed-agents>
