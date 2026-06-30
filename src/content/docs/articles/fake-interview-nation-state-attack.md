---
$schema: starlight
title: 假 VC、真 RAT：一次失败国家级攻击背后的开发者生存课
description: 一份看似无害的 TypeScript 面试题，恶意代码藏在 patch 文件的 base64 blob 里。这背后是一场针对开发者持续三年多的国家级钓鱼行动，而攻击正变得更有组织、更难靠肉眼发现。
date: 2026-06-28
category: security
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-28-fake-interview-nation-state-attack-img-00-infographic-core-summary.png)

## 一个假 VC 的精心陷阱

Matt Mastracci 收到一封邮件。发件人自称 D█████ S████，代表 Lua Ventures——一家他从未听说过的新加坡 DeFi VC。邮件措辞专业，附带 LinkedIn 档案链接，甚至点名了两家"投资组合公司"需要 advisory 工作。

没有什么可疑的。他甚至和对方通了视频——一个带德国口音的男人，说自己在出差途中。聊得还行。

通话后来了"测试"：一个 TypeScript 项目，叫 Ticket Harbor，是个渡轮票务应用。要求他跑 type check、test、build。

这时候他犯了嘀咕。他是 Rust 社区的活跃维护者，在 crates.io 上有包。一个 TypeScript 项目作为面试题？不太对劲。他把 repo 扔进 Claude 扫了一遍。

Claude 发现的不是常规的 `postinstall` 脚本勾子。真正的恶意代码藏在 `9.2.patch` 里——base64 编码的混淆 blob，注入到 `tsc.js` 和 `typescript.js` 的顶部。这个项目用了 `patch-package`，一个合法的依赖补丁工具，而补丁正是攻击载体。

如果不是 TypeScript，是 Rust 的 `build.rs`——Mastracci 承认他可能就跑了。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-28-fake-interview-nation-state-attack-img-01-attack_chain_diagram.png)

## 开发者的"面试"正在变成战场

读完 Mastracci 的文章，我做的第一件事是搜了一下相关报道。然后，说实话，有点慌。

这不是个例。安全社区给它起了名字：**Contagious Interview**（传染性面试）。微软追踪为 Sapphire Sleet，安全厂商追踪为 FAMOUS CHOLLIMA。源头指向朝鲜国家级威胁行为体，至少自 2022 年 12 月持续至今。

2026 年 4 月，单月就散布了 **1,700 个恶意包**——npm、PyPI、Go、Rust 全覆盖。

更让我不舒服的是手法演变。最早的攻击很粗糙：`postinstall` 脚本里直接写恶意代码，扫一眼 `package.json` 就能发现。现在的版本是：

* 虚假 LinkedIn 档案加有历史记录的假公司网站（用 archive.org 偷来的页面做背书）
* 一通正常的视频通话建立信任
* 恶意代码埋进 `patch-package` 补丁、测试文件深处、或 `prepare` 生命周期脚本

三月的 Axios 供应链攻击更狠——版本 1.14.1 和 0.30.4 被篡改，交付跨平台 RAT。你没参加任何面试，只是正常 `npm install` 了一个知名库，就中招了。

攻击面从"去面试的开发者"扩展到了"所有 npm 用户"。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-28-fake-interview-nation-state-attack-img-02-contagious_interview_campaign_scale.png)

## 拆开一个 RAT

Mastracci 给这个木马取名 PinpinRAT，让 Claude 在沙箱里拆解了它。

它生成 RSA-2048 密钥对做本地身份，AES-256-CBC 做会话加密，所有流量带 HMAC-SHA256 完整性标签。启动后先上报主机指纹——系统信息、网络配置、用户环境——然后等待指令。

能力清单很短，但每一条都致命：文件上传下载、任意进程执行、DNS 隧道、自我删除。

攻击者还做了架构分离。其他已分析的同类型攻击显示：交付层跑在 Vercel 这种 serverless 平台上（便宜、可快速轮换），控制层跑在 bulletproof hosting 上（稳定、难以取缔）。交付层被举报？五分钟重建一个新的。已建立的 C2 会话不受影响。

这种分离不是个人爱好者想得出来的。这是组织的、有工程管理的。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-28-fake-interview-nation-state-attack-img-03-ai_offense_vs_defense.png)

## AI 在两边

有一件事 Mastracci 在文章开头就坦诚了：他写这篇分析用 Claude 加速了 RAT 逆向和 IoC 检测脚本的构建。

攻方也在用。

Cloud Security Alliance 五月底发布了一份研究笔记，记录了一个叫 GREYVIBE 的俄罗斯关联威胁行为体。这个组织的技术成熟度被评为"中等"——按传统标准，他们不算是顶级 APT。但他们用 ChatGPT、Google Gemini 和 Ideogram AI 辅助整个攻击生命周期：钓鱼诱饵、假网站建设、恶意代码编写、混淆。

结果是什么？一个中等技术团队，同时运行五条独立攻击线：PhantomMail、PhantomClick、PrincessClub、DroneLink、Nebo。每条线都针对不同的目标集，使用不同的恶意软件家族。

这份报告最让我不安的一句话是：以这个团队的人类技术水平，没有 AI 辅助，"不太可能"维持这种攻击规模。

AI 在缩小攻击能力的差距。以前你需要一支精英团队才能同时打五条线，现在一个中等团队加几个 AI 订阅就够了。

但 Mastracci 的故事也说明 AI 在另一端同样有效——他用 Claude 在沙箱里逆向分析了恶意代码，几小时内就发布了完整的 IoC 列表和检测建议。如果不是 AI 加速，这种级别的技术分析通常需要几天。

所以这不是"AI 帮坏人还是帮好人"的故事。两边都在用。问题是速度。

## 这意味着什么

看完所有这些材料，我有几个判断。

**第一，信任模型在塌。** 以前开发者面对的安全边界是"别从可疑网站下载 exe"。现在的威胁是你收到一封写得像模像样的邮件，和一个看起来完全正常的 GitHub 仓库。打开 `package.json`，一切干净。但 `npm install` 的那一秒，你的 `~/.ssh`、`.npmrc`、浏览器 cookies 已经不属于你了。

**第二，暴露面比你想象的大。** 你的开发机上有什么？GitHub token、npm token、crates.io token、AWS 凭据、SSH 私钥、浏览器里登录着的所有 SaaS 工具 session。攻击者不需要一次性偷走所有东西。RAT 可以等。等你连上公司 VPN，等你推了一个有发布权限的 tag，等你打开了一个有管理员权限的 dashboard。

**第三，好消息是防御也在加速。** npm v12 七月发布，`allowScripts` 默认改为 `false`。Bun 有 `--ignore-scripts`。Deno 能做网络白名单。但 Mastracci 案例告诉我们，这些对 patch-package 类型的攻击没用——恶意代码不在脚本钩子里，在补丁文件里。真正的防线是对任何陌生来源的 repo 先在 Docker 里跑，甚至先在隔离的 VPS 上跑。

Mastracci 说他这次逃脱靠的是"谨慎和懒惰"——懒得自己看代码，扔给了 AI。这句话半开玩笑，但点出了一个新现实：在受信任的环境中审查不受信任的代码这件事，AI 做得比人类快。

*你有没有遇到过类似的可疑面试邀请？你的开发机上跑过多少个陌生 repo 的 `npm install`？*

## 原文参考

> 本文基于 Matt Mastracci 博客文章《Anatomy of a Failed (Nation-State?) Attack》（grack.com, 2026-06-25）的读后感。
> <https://grack.com/blog/2026/06/25/dissecting-a-failed-nation-state-attack/>
