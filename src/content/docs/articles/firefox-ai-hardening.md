---
$schema: starlight
title: Firefox 默默修了 423 个安全漏洞，而我还在用 Chrome
date: 2026-05-08
description: 一张图里 423 个安全修复和 31 的对比，不只是一个浏览器的故事，更是 AI 改写攻防规则的信号。
coverImage: cover.png
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-08-firefox-hardening-img-00.jpg)

昨天读到 Mozilla 三位工程师写的技术文章，关于他们怎么用 Claude Mythos 在 Firefox 里挖出 271 个潜伏的安全漏洞。

有一张图把我钉住了。

折线图上 2025 年 11 个月的数据画成一条波澜不惊的小溪——每个月 20 到 30 个安全修复，平淡得像心率监测仪。然后到了 2026 年 2 月，突然抬头；3 月继续上蹿；4 月直接变成一根钉在 423 上的铁柱。

**423。去年同期是 31。整整 13 倍。**

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-08-firefox-hardening-img-01.jpg)

不是因为 Firefox 代码突然烂了——这些漏洞大部分在里面躺了十年以上。而是因为**以前根本看不见它们**。

## 2.5% 浏览器的硬骨头

Firefox 全球市场份额不到 2.5%，中国市场几乎可以忽略不计。去年夏天，周活跃用户首次跌破 1.5 亿。你眼前如果闪过"日暮西山"四个字，不奇怪。

但就是这样一款浏览器，默默做了一件 chrome/chromium 都还没做到的事。

RLBox——他们自己搞的进程内沙盒框架，把第三方库塞进 WebAssembly 沙箱，让字体渲染、图片解码、音频处理这些高频攻击入口变成隔间。库里有零日漏洞？外面拿不到主进程内存，炸不了。

Fission——每个网站独立进程沙箱，2021 年启用，比 Chrome 的 site isolation 还多走了一步把 privacy 也揉进去。

原型冻结——聪明。与其一个一个修 prototype pollution 沙箱逃逸，不如直接把原型锁死。Mythos 在扫描过程中尝试了很多次这条攻击路径，全被挡回来了。

这些工作的用户感知几乎为零。你不打开 about:support 看看，不会知道一个网页背后跑了几个独立进程。但对逆向工程师来说，每一层都是要翻的墙。

然后他们又做了第四件事：**驯服一个 AI 模型来批量挖自己的漏洞。**

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-08-firefox-hardening-img-02.jpg)

## 不是 AI 变聪明了，是"验证"变便宜了

很多人看到"AI 找到 271 个漏洞"的第一反应是：模型真强。

但 Mozilla 工程师自己的说法是——模型当然变强了，但真正的质变在另一端：**agentic harness，一套让 AI 的猜测能被快速证伪的系统。**

我来翻译一下这里面的关键问题。

过去让 LLM 分析代码找漏洞，最大的麻烦不是它找不到，而是它太能编了。它给你丢 100 个报告，里面 95 个是幻觉——看起来逻辑自洽、引用的代码行号都对，但实际上是胡说八道。你作为人类维护者，每一个都要花时间读。这就是他们说的"asymmetric cost"——**AI 生成报告的成本趋近于零，人类验证的成本居高不下。**

Mozilla 的破局点在哪儿？他们不让人类去验证。

他们的 harness 给 Mythos 下了这样一个任务闭环：我给你一个源文件，你去找 bug，找到以后自己写 PoC，写完了编译进 Firefox 跑一遍，如果能稳定触发内存崩溃（AddressSanitizer 报 UAF 或 out-of-bounds）就提交，触发不了就继续找。

**AI 自己猜，自己证伪，自己递归。**

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-08-firefox-hardening-img-03.jpg)

这就把验证成本也压到了趋近于零。再加上第二个模型给第一个模型的输出打分——高分报告才给人看——最终到开发者手里的，是一份几乎没有误报的确认清单。

Brian Grinstead 的原话是："问题存在，修复完成，测试用例入库后不会复现。"

这跟六个月前满世界飞的 AI 漏洞垃圾，已经不是同一个物种了。

## 更让我佩服的，是那些没被攻破的东西

Mythos 挖出的 12 个样本漏洞里，有好几个沙箱逃逸——从被攻破的内容进程出发，通过 IPC 上的竞态条件操控父进程引用计数、用 NaN 伪装 JS 对象指针穿越反序列化边界、利用 RLBox 验证逻辑的空白绕过进程内沙箱。

读这些报告的体验挺奇特的。一面觉得吓人——这些路径的复杂和精妙程度，几乎像有人在黑暗里用手摸出了墙上的每一条裂缝。一面又觉得踏实——Mozilla 把这些报告**公开了**，包括完整的 Bugzilla 记录。不是为了炫耀 AI 有多强，而是为了证明这不是 PR 稿。

但文章里真正让我停下来的一段话，是说**模型没找到的东西。**

他们看到了 Mythos 尝试了很多次 prototype pollution 沙箱逃逸路径，全被原型冻结挡回去了。还有多层沙箱、Rust 重写的高风险组件、IPC 的 fuzzer 覆盖——这些防御措施设计之初投入了大量工程资源，现在被 AI 的饱和式攻击验证了。

**做对的事，会在意想不到的时候回报你。**

不像鸡汤。是工程事实。

## 安全这件事，正在变成"通量"游戏

我花了大概半小时把这篇文章翻来覆去读了三四遍。突然意识到一个藏在所有数字和术语底下的东西。

过去安全的核心约束是**人**。能写 exploit 的顶级研究员就那么些人，大部分进了大厂红队。漏洞发现速率是有上限的，这个上限被人类注意力严格限制。

AI 把这层盖子掀掉之后，安全的性质变了。

它不再是"我们有多少顶尖研究员"的问题。变成**"我们能在单位时间内找到并修复多少个 bug"**——本质上是个通量问题。而通量是可以被并行化、被工程化、被模型升级指数级拉高的。

Mythos 相比 Opus 4.6 不只是"更好"——是**十倍**。下一个模型跟 Mythos 的差距可能是又一个量级。而 CI/CD 的修复能力可没这个成长曲线。

更麻烦的是另一边。

Mozilla 公开漏洞是因为他们修了。攻击者不需要公开。攻击者不需要修。攻击者不需要走 CI，不需要说服 review 委员会，不需要考虑灰度发布和遥测回归率。攻击者只需要**找到，然后赢一次。**

攻防不对称非但没有消失，反而在 AI 的放大下变得更极端了。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-08-firefox-hardening-img-04.jpg)

## 最后

Firefox 的这 423 个修复，花了超过 100 个工程师好几个月的命。Grinstead 说"long days"，从字面意思理解就好——不是什么修辞。

一个市场份额不到 2.5% 的浏览器，撑起了互联网上最完整的浏览器安全架构。听起来有点荒谬，但这就是现在的世界。

文章的结尾，三位工程师写了一句我很想全文引用的话：

> The current moment is a perilous one, but also full of opportunity. Let's work together to secure the internet.

翻译一下：这局不好打，但也别躲。

我能做的很少。但至少，写这篇文章的时候，我用的就是 Firefox。

***

你平时用哪个浏览器？有没有因为安全原因换过浏览器？

## 原文参考

> Brian Grinstead, Christian Holler, Frederik Braun. **Behind the Scenes Hardening Firefox with Claude Mythos Preview**. Mozilla Hacks.
> <https://hacks.mozilla.org/2026/05/behind-the-scenes-hardening-firefox/>
