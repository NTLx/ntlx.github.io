---
$schema: starlight
title: 重写的瓶颈从来不是写代码
description: "53 万行代码 11 天重写，所有人盯着\"64 个 Claude 并行\"的规模叙事，但真正的门槛藏在 Bun 测试套件的语言里——验证基础设施才是重写可行性的天花板。"
date: 2026-07-10
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-10-bun-rust-rewrite-verification-bottleneck-img-00-infographic-core-summary.png)

## 数字冲击之后

Bun 创始人 Jarred Sumner 上周发了篇博文：535,496 行 Zig 代码，11 天重写成 Rust，64 个 Claude 并行，$165,000 token 费用。

我第一反应和大多数人一样，被数字砸了一下。和我在《[当计划变成代码](https://ntlx.github.io/articles/claude-code-dynamic-workflows)》里聊过的动态工作流是同一套东西，但规模拉到这个程度还是需要几秒钟消化。

然后我读了 Zig 创始人 Andrew Kelley 的回应，又扫了 Hacker News 上几百条评论。发现这个故事的重点根本不是"64 个 Claude"。

## 真正的瓶颈

Jarred 自己写了这么一句：

> "Absolutely none of it worked yet."

64 个 Claude 峰值每分钟产出 1300 行代码，但写完之后还要过编译器错误修复、smoke test、测试套件、CI。每个阶段都是硬仗。**写代码不是瓶颈，让代码"对"才是。**

那"对"靠什么验证？藏在博文里一个很容易被跳过的句子：

> "Fortunately, Bun's own test suite is written in TypeScript which means it doesn't depend on the runtime's programming language."

Bun 的测试套件是 TypeScript 写的。不管底层是 Zig 还是 Rust，只要 API 行为一致，138 万个 `expect()` 就照常运行。这把"这段 Rust 代码对不对"这个需要人类判断的问题，变成了"测试通不通过"这个机器能判定的问题。

大多数项目的测试套件跟实现语言绑定。你的项目要是想换语言，得先手工重写整套测试。Bun 恰好跳过了这一步。这一步，是整个重写能成立的前提。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-10-bun-rust-rewrite-verification-bottleneck-img-01-cost_structure_rewrite.png)

## "对"有三层

测试通过就算对吗？不。

软件正确性至少三层。行为正确性——输入 X 得到 Y，测试覆盖这一层，Bun 三平台 138 万断言全过。语义等价性——新旧代码"意思"一样吗？Bun 的 19 个回归 bug 全在这层：`debug_assert!` 在 release 构建中擦除了副作用，奇数长度 slice 从 Zig 的截断变成了 Rust 的 panic。语法忠实的翻译产出了语义不同的行为。设计合理性——代码组织是否便于维护？这一层完全不可自动验证。

AI 搞定了第一层。第二层部分搞定，靠的是人类事后发现。第三层完全没碰。53 万行代码，团队没逐行读，Jarred 自己说他审查的是"对抗审查 agent 是否正确捕捉了 Zig 和 Rust 的差异"。代码通过了测试，但团队不完全知道代码为什么这样工作。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-10-bun-rust-rewrite-verification-bottleneck-img-02-correctness_three_layers.png)

## 真实账单

$165,000 只是 token 费。重写的真实代价比这大得多。

13,000 个 unsafe 块——4% 的代码在编译器免责区。对比：uv（Python 生态的同类工具）35 万行只有 73 个 unsafe。Bun 68 万行 13,000 个。Jarred 说 78% 是单行调用，但 13,000 个单行调用就是 13,000 个编译器看不见的地方。"safe Rust"的承诺在 Bun 这里打了折。

理解债务是更隐蔽的成本。手工重写的三个人一年里会对每行代码建立深度理解；AI 重写的一个人 11 天建立的是对流程的理解。短期看不出差别，长期才知道欠了多少。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-10-bun-rust-rewrite-verification-bottleneck-img-03-ai_workflow_architecture.png)

## Kelley 那把刀

Zig 创始人的回应博文我读了两遍。最尖锐的不是技术纠偏——虽然"我们一直在劝你们别滥用 comptime"和"你们告诉我们没在做 fuzzing"这些事实声明够扎心。

最尖锐的是他指出 Jarred 给了一个假选择。

Jarred 把选项框成"要么靠风格指南（Zig 路线），要么靠语言特性（Rust 路线）"。Kelley 说：真正消除 bug 靠的是投入工程资源。TigerBeetle 同样用 Zig，没有 Bun 那些 bug，不是因为 Zig 突然有了 Rust 的特性，是因为他们花了时间找和修。Bun 的问题不是语言，是优先级。

话说回来，Kelley 也有自己的利益位置——Bun 是 Zig 最大的明星项目，离开对 Zig 是声誉打击。但他的核心判断我认为是成立的：工程文化的问题不会因为换语言消失。它只是换了个形态——从"手动内存管理的漏洞"变成"unsafe 块里的逻辑漏洞"。

## 铁律没被打破

Joel Spolsky 2000 年写下"永远不要从头重写"，到今天 26 年。

AI 没打破它。AI 改的是经济学——当验证基础设施足够强，重写的风险溢价降到可接受范围。但这个"足够强"的条件极其苛刻：语言无关的测试套件、源语言到目标语言的概念映射可行（Zig 和 Rust 都是系统级语言，Java 到 Rust 的鸿沟大得多）、还有充足的 AI 算力。对大多数项目，至少一个条件不满足。

Bun 的重写是 AI 工程的一个精彩案例。但它更像一个特例实验，不是一个可复制的模板。

从这件事里值得带走的东西很具体：验证基础设施的建设时机。不是等到想重写的时候才建，而是现在。别等到想换语言的那天，才发现测试套件跟实现语言焊死在了一起。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-10-bun-rust-rewrite-verification-bottleneck-img-04-trust_spectrum.png)

*你的代码库如果明天要用另一种语言重写，现有的测试套件能不改一个字符就用上吗？*

## 延伸阅读

* [当计划变成代码——Claude Code Dynamic Workflows 读后感](https://ntlx.github.io/articles/claude-code-dynamic-workflows)
* [Tokenpocalypse：当你发现 AI 账单比 AI 产出更好量化](https://ntlx.github.io/articles/tokenpocalypse-ai-token-cost)
* [聪明的代价：AI 编码时代被悄悄偷走的学习](https://ntlx.github.io/articles/knowledge-debt-agents-that-teach)
* [聪明不值钱了：从 2026 年 7 月 AI 编码工具排行榜看到的三件事](https://ntlx.github.io/articles/ai-dev-tool-rankings-july-2026)

## 参考资料

* [Rewriting Bun in Rust — Jarred Sumner](https://bun.com/blog/bun-in-rust)
* [My Thoughts on the Bun Rust Rewrite — Andrew Kelley](https://andrewkelley.me/post/my-thoughts-bun-rust-rewrite.html)
* [Rewriting Bun in Rust — Simon Willison](https://simonwillison.net/2026/Jul/8/rewriting-bun-in-rust)
* [Bun's Migration from Zig to Rust as a Potential Case Study — LessWrong](https://www.lesswrong.com/posts/qEbqPitYhWHthwFNu/)
