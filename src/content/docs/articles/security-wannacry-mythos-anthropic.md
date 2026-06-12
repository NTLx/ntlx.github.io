---
$schema: starlight
title: 当补丁变成攻击说明书：从 WannaCry 的 59 天到 Mythos 的 1 小时
description: Anthropic 新研究炸掉了安全补丁的基本假设：Mythos Preview 能在补丁公开后一小时内构建出可用 exploit，N-Day 变成 N-Hour，月度补丁节奏名存实亡。
date: 2026-06-12
category: security
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-12-security-wannacry-mythos-anthropic-img-00-infographic-core-summary.png)

安全补丁的逻辑一直很简单：厂商修漏洞，用户打补丁，攻击者的窗口很短。你只要比攻击者快一步，就安全了。

这个假设的支柱是：从补丁逆向出漏洞利用，需要几周的专业工作。Mandiant 2020 年分析过 25 个 N-Day 漏洞，16 个花了一个月以上才被利用。WannaCry——那个 2017 年瘫痪了 150 个国家 23 万台机器的勒索软件——用的是 MS17-010，微软在 59 天前就发了补丁。

59 天。在 2017 年，这个窗口在安全从业者眼里已经算"快"。

Anthropic 安全团队在 6 月 8 号发布的报告里，把这个窗口炸没了。

## Mythos Preview 做了什么

他们选了 18 个 Firefox SpiderMonkey 引擎的安全补丁，让 6 个 Claude 模型依次去"读补丁 → 找 bug → 写 PoC（概念验证）→ 构建完整 exploit"。

Mythos Preview——Anthropic 目前最强的模型——的结果是这样的：

*第一个 PoC 用了 12 分钟*。13 个在 40 分钟内完成。最终 14/18 个漏洞被成功复现。更关键的是 exploit：从触发崩溃到实现任意代码执行，Mythos Preview 产出了 8 个可用 exploit，*第一个在补丁公开后不到一小时完成*。

不到一小时。而那个补丁对应的 Firefox 148 正式版，还要 18 天后才发布。

这不是"攻击者比你的运维快了一步"——这是攻击者的 exploit 写好时，你的浏览器厂商还没把补丁推给用户。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-12-security-wannacry-mythos-anthropic-img-01-illustration.png)

## Windows 内核：没有源代码也一样

Firefox 是开源的，攻击者能直接对比修改前后的代码。但闭源软件呢？

这项测试更难：21 个 Windows 内核提权漏洞，来自 2026 年 1-2 月的 Patch Tuesday。模型不能读源代码——只给编译后的二进制文件、Ghidra 反编译输出、Ghidriff 函数级差异对比、Microsoft 公开安全公告。

这就是真实世界的攻击场景。Patch Tuesday 之后，任何人都能从 Microsoft Update Catalog 下载新旧版本，用 Ghidra 反编译，比对差异——只是以前这需要几个逆向工程师干几周，现在你给一个 API 端点扔任务就行。

Mythos Preview 在六小时内找到 18/21 个漏洞的 PoC，API 费用约 $2,200。然后它构建了 8 个完整提权链——从受限用户账号一路升到 SYSTEM 最高权限——总花费约 $15,700，平均 $2,000 一个链。

$2,000 一次提权。这个价格低于很多中级安全工程师的周薪。

而时间线更让人不安。Microsoft 的 Windows Autopatch 需要 7 天覆盖 90% 的注册设备，11 天才会强制重启。Mythos Preview 的所有 8 个提权链，*全部在这 7 天之前完成*。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-12-security-wannacry-mythos-anthropic-img-02-illustration.png)

## 三个层面上的旧假设塌了

读完这篇报告，我觉得 Anthropic 实际击穿了三层假设，每一层都比上一层更让人不安。

*第一层：速度假设。*"补丁逆向是慢活"——这个判断支撑了整个补丁管理体系的节奏。月度发布、分批推送、预发布频道、稳定频道滞后——所有这些都是建立在"攻击者需要几周专家工时"的前提上。Mythos Preview 把这几周压缩成了一下午。

*第二层：专家门槛假设。*以前能做 patch diffing 的人，全球可能就几千个。现在，Anthropic 明确说公开模型（关闭安全过滤器后）也能做——成功率低些，但能做。而 AISLE 和 Vidoc Security 的复现实验更狠：GPT-OSS-20b（36 亿活跃参数，$0.11/百万 token）就能找到 Anthropic 展示的大部分漏洞。威胁面不是扩大了——是炸了。

*第三层：*评级体系的校准。Microsoft 把 14/21 个漏洞标注为"不太可能被利用"或"不可能被利用"。这个评级是为人类研究者校准的。Mythos Preview 攻破了其中 13 个，还在一个"不可能被利用"的漏洞上实现了完整提权。不是评级做错了——是做出评级时假定的攻击者画像错了。

## 改变的不是攻击方式，是攻击速度

别误会：Anthropic 不是发现 AI 能找到新的、人类找不到的漏洞。AI 做的是同一件事——patch diffing——只是快了几个数量级。

但"快几个数量级"本身就是质的改变。一个需要四周完成的任务变成一小时，你的防御模型得重新想。

Mozilla 已经把 Firefox 小版本更新从月度改成约每周一次。Microsoft 对最紧急的漏洞走 out-of-band 通道或用 hotpatch。这些都是加速度——但只是在赛跑。Anthropic 自己也在报告里说：更持久的方法是减少 bug 的供给——迁移到 Rust 等内存安全语言，用硬件级保护（Control Flow Guard、shadow stack）从根上消除整类攻击面。

这是个诚实但不太舒服的答案。补丁赛跑你永远跑不赢——因为模型只会越来越快，越来越便宜。

如果你是做基础设施的、管工控系统的、跑医疗设备的、维护 IoT 固件的——以前你觉得"我们下个维护窗口打补丁"还算合理的风险接受——这篇文章的意思是：那个窗口可能已经不存在了。

*你觉得"更快打补丁"还能解决问题吗，还是我们得从根本上重新想软件的构建方式？*

## 原文参考

> Anthropic Security Research, "Measuring LLMs' impact on N-day exploits", June 8, 2026
> <https://red.anthropic.com/2026/n-days/>
>
> Matthias Bastian, "Anthropic study shows AI needs hours, not weeks, to build exploits from security patches", The Decoder, June 2026
> <https://the-decoder.com/anthropic-study-shows-ai-needs-hours-not-weeks-to-build-exploits-from-security-patches/>
>
> Mandiant, "Time Between Disclosure, Patch Release and Vulnerability Exploitation", 2020
> <https://cloud.google.com/blog/topics/threat-intelligence/time-between-disclosure-patch-release-and-vulnerability-exploitation>
>
> Jonathan Kemper, "The myth of Claude Mythos crumbles as small open models hunt the same cybersecurity bugs", The Decoder, April 2026
> <https://the-decoder.com/the-myth-of-claude-mythos-crumbles-as-small-open-models-hunt-the-same-cybersecurity-bugs-anthropic-showcased/>
>
> Verizon, "2026 Data Breach Investigations Report", 2026
> <https://www.verizon.com/business/resources/reports/2026-dbir-data-breach-investigations-report.pdf>
