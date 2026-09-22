---
$schema: starlight
title: 审计还没开始，Trail of Bits 先花六个月造工具
description: 读 Trail of Bits 的 Miden 审计复盘，我更在意那六个月的前置工程：当 Agent 让探索性工具建设变便宜，安全团队的杠杆点就从多看几遍代码，移到了让代码更容易被观察、验证和复用。
date: 2026-09-22
category: security
primarySourceUrls: ["https://blog.trailofbits.com/2026/09/18/auditing-in-the-age-of-good-enough-ai/"]
---

安全审计常被想象成一件发生在代码库上的事：审计员打开仓库，读代码，跑工具，最后交付一份漏洞报告。

Trail of Bits 最近写了一篇 Miden zkVM 的审计复盘。让我停下来的不是他们后来找到了多少问题，而是审计还没正式开始时，团队先做了什么：用六个月给一门陌生的汇编语言补上 LSP、反编译器、静态分析引擎和 Lean 模型。

这篇文章叫[《Auditing in the age of (good enough) AI》](https://blog.trailofbits.com/2026/09/18/auditing-in-the-age-of-good-enough-ai/)。它让我重新看了一遍“够好的 AI”到底改变了什么。

它先改变的是另一块工程：为了更好地审一个项目，先花时间造一套只服务于这个项目的工具。Agent 把这类探索的试错成本压低以后，安全团队的杠杆点就从“让模型多看几遍代码”，移到了“让代码更容易被人和机器看懂”。

![总览：从陌生代码、工具层和形式化验证，到人的安全判断与可复用审计基础设施](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-22-auditing-age-good-enough-ai-img-00-infographic-core-summary.png)

## 审计的第一步，可能是给陌生代码补一套眼睛

Miden VM 的难点不在于代码量有多大，而在于它同时带着两个陌生条件：新的栈机架构，以及用 MASM 编写的密码学原语。栈机把输入和输出放在栈上，很多指令的操作数不会像普通函数参数那样直接写出来。对第一次接触这套代码的人来说，读一段过程，常常还要在脑中维护栈的状态。

原文的 Figure 1 把同一个 XOR 过程放在 MASM 和 32 位 x86 汇编旁边。两段代码完成的是相近的事情，但左边的栈移动让数据流不再一眼可见。Trail of Bits 先做的 LSP，把这类隐含信息搬回编辑器：语法高亮、跳转定义、查找引用、悬浮文档，以及每条指令的栈效果。

这一步没有直接给出漏洞报告，它先修补了阅读环境。Figure 2 里的 inline 文档和栈效果提示说明了它的价值：审阅者不必频繁离开当前代码，去另一份手册里查一条指令到底消费几个栈值、返回什么。少一次上下文切换，未必立刻多找到一个 bug，却会改变人和 Agent 能够持续追踪的代码范围。

![原文 Figure 1：MASM XOR 过程与 32 位 x86 汇编对照（图源：Trail of Bits）](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-22-auditing-age-good-enough-ai-img-source-figure-1-masm-x86.webp)

![原文 Figure 2：MASM 栈效果与指令文档提示（图源：Trail of Bits）](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-22-auditing-age-good-enough-ai-img-source-figure-2-stack-effects.webp)

我觉得这是整篇复盘里最容易被忽略的地方。工具不是审计的附属品，它决定了什么信息会在审阅时出现。

## 反编译器的边界，比反编译器本身更重要

有了编辑器里的语义提示，团队继续尝试把 MASM 过程反编译成更接近伪代码的表示。这里很快遇到边界：很多过程没有声明签名，调用没有稳定的 ABI，while 循环不一定保持栈中性，条件分支也可能有不同的栈效果。

他们没有让反编译器承诺“什么都能正确翻译”，只对定义清楚的 MASM 子集承诺正确性。开发过程中，Claude 负责一部分规划和实现，Codex 做代码审查；每增加一个功能，就让 Agent 随机抽取 core library 里的过程进行反编译，再和原始 MASM 对照，把发现的问题加入回归测试。这个过程最终留下了一个很有用的中间表示，后来的静态分析可以直接复用它。

Figure 3 展示了 `eqz` 过程与对应的伪代码。它的意义不只是“汇编变得更好读”，还在于把输入、输出和表达式放进了一个可以继续分析的共同表示。反编译器最大的产出，可能不是最后那段伪代码，而是这层中间表示。

![原文 Figure 3：eqz MASM 过程与反编译后的伪代码（图源：Trail of Bits）](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-22-auditing-age-good-enough-ai-img-source-figure-3-eqz-decompilation.webp)

这给我一个很实际的判断标准：让 Agent 造工具时，先写清楚工具的保证范围。一个只处理部分情况、但能对这部分给出可信结果的工具，往往比一个声称全覆盖、却没有办法识别失败的工具更适合进入审计流程。

## 漏洞和证明给出了两种不同的反馈

反编译器的中间表示让团队能够把常见的数据流分析接到 MASM 上。他们检查 prover 提供的 advice 值有没有被验证、类型约束有没有执行、局部变量是否在所有路径初始化。

原文称，这些分析找到了 400 多个可以改进类型验证的独特位置，以及一个高严重性问题。问题位于 `mod_12289`：quotient 被检查成合法的 64 位值，remainder 却没有在传给 `u32overflowing_sub` 前得到验证。Figure 4 里的编辑器告警把这条路径标了出来。作者认为，恶意 prover 可以在仍满足部分约束的情况下操纵 quotient 和 remainder，让过程返回错误的余数，进而伪造 Falcon 签名并抽走由 Falcon 密钥控制的 Miden 账户资金。

![原文 Figure 4：mod_12289 中未约束 advice 到达 u32 intrinsic 的告警（图源：Trail of Bits）](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-22-auditing-age-good-enough-ai-img-source-figure-4-unconstrained-advice.webp)

静态分析在这里给出的反馈是：“某个不变量可能没有被检查。”

形式化模型给的是另一种反馈。团队实现了一个最小的 Miden VM Lean 执行器，把 MASM 过程翻译到 Lean，再让多个 Agent 参与证明。原文报告这套工作得到 95 个正确性证明，覆盖 core library 的二进制算术组件；它还找到了原有单元测试没有抓住的 `rotr` 边界和 `wrapping_mul` 栈值问题。

但最让我在意的是 Figure 6。`rotr` 的证明需要额外加入 `shift mod 32 ≠ 0` 这个前提。证明通过的条件反而把实现中原本不显眼的假设推到了屏幕上。

![原文 Figure 6：rotr 正确性证明中的 shift mod 32 ≠ 0 前提（图源：Trail of Bits）](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-22-auditing-age-good-enough-ai-img-source-figure-6-rotr-proof-assumption.webp)

这也是为什么我不愿意把“95 个证明”单独当成结论。Lean kernel 可以检查证明项，但人仍要检查 theorem statement 是否说对了问题；模型也可能只覆盖实际 VM 的一个子集。形式化工作真正增加的，是一条能暴露假设的反馈通道。

## “够好”带来的，是试错的期权

Trail of Bits 对“为什么一两年前做不到”给出的解释很朴素：这些工具和证明都是探索性 side project，收益事先说不清，很难提前向客户出售。过去一年，Agent 变得足够好，可以在轻监督下承担非必要项目。作者甚至把失败的 side project 概括成“只消耗 token”。

我不把这句话理解成 token 已经便宜到可以随便浪费。它说的是，团队现在可以为一个不确定的工程想法买一张成本较低的期权：先做一个窄的 LSP 功能，看看它是否真的改善阅读；再把一小段 MASM 翻译成 Lean，看看证明会暴露什么。方向不对，就把实验停掉。

过去，安全团队也许只能把预算留给客户明确购买的审计交付。现在，Agent 让“为了一次审计先造工具”变成了值得尝试的投资。成功以后，工具还可能留下来，成为下次更新的检查器。Miden 团队采用了这次审计开发的静态分析引擎，用于后续 core library 更新，正是这个回报链条的一部分。

当然，低成本只降低了尝试门槛，没有自动提高工具质量。一个由 Agent 写出来的错误反编译器，可能让错误的控制流看起来更顺；一个表述过窄的 theorem，可能让证明通过，却没有覆盖真正想保证的性质。试错变便宜以后，验收反而要更早出现。

## 普通团队可以先复制什么

大多数团队没有六个月，也没有理由照抄一整套 Miden 工具链。但这篇文章给出的顺序可以缩小成一次工程实验。

先找最影响审阅的隐式状态。它可能是栈效果，也可能是权限传播、数据流、配置继承或任务状态。把问题落到一件具体事情上：哪一个此前需要靠记忆维持的关系，可以变成编辑器、IR 或检查器里的显式信息。

然后给工具划一条窄边界。只支持一组定义清楚的过程，或者只检查一种类型约束，都比一开始追求全覆盖更容易验证。让 Agent 负责脚手架、转换器和样例生成；用随机样本、差分对照和回归测试检查它有没有把失败藏起来。

接着把工具输出接回人的工作。LSP 的栈效果要能帮助审计员阅读，静态分析的告警要能落到具体路径，Lean 的证明要让人看清 theorem statement 和前提。只把一堆自动生成的文件放进仓库，不会自动形成安全能力。

最后把“证明通过”与“问题解决”分开。前者是某个模型、某个性质和某组前提下的结果；后者还需要确认模型是否覆盖目标系统、性质是否值得证明、失败是否被记录，以及风险解释能否被另一个人复核。

我之前写[《代码不再是交付物，而是外骨骼：读 UIUC/Meta/Stanford 百页重磅综述《Code as Agent Harness》》](https://ntlx.github.io/articles/code-as-agent-harness)时，关注的是代码如何成为 Agent 的执行底座。读 Trail of Bits 这篇复盘后，我更愿意把这件事往安全方向再推一步：好的底座不只负责让 Agent 动起来，也负责让人知道它到底看见了什么、漏掉了什么、在哪个假设上停住了。

我最后留下的判断是：good enough AI 进入安全工程后，最现实的变化不是替人做完判断，而是让团队有余力为判断建设工具。工具留下来，下一次审计面对的就不再是同一片黑箱。

## 参考资料

- Fredrik Dahlgren，Trail of Bits：[Auditing in the age of (good enough) AI](https://blog.trailofbits.com/2026/09/18/auditing-in-the-age-of-good-enough-ai/)
- Trail of Bits：[MASM LSP Server](https://github.com/trailofbits/masm-lsp/)
- Trail of Bits：[Miden assembly decompiler](https://github.com/trailofbits/masm-decompiler/)
- Trail of Bits：[MASM-to-Lean](https://github.com/trailofbits/masm-lean/)
- Trail of Bits：[MASM analysis crate](https://github.com/trailofbits/masm-lsp/tree/main/crates/masm-analysis)
- Miden Docs：[Introduction](https://docs.miden.xyz/reference/miden-vm/)
- Miden Docs：[Miden Assembly](https://docs.miden.xyz/reference/miden-vm/user_docs/assembly/)
- Lean：[Lean Programming Language](https://lean-lang.org/)
- Wikipedia：[Stack machine](https://en.wikipedia.org/wiki/Stack_machine)
