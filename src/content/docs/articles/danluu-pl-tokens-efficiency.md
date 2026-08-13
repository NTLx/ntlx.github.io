---
$schema: starlight
title: 别再为 AI Agent 挑“最省 Token”的语言了：读 Dan Luu 评测有感
description: 业界流传“动态语言能帮 AI 省 60% Token”的迷思，底层是被玩具 Benchmark 和脏测试环境骗了。Dan Luu 的实地评测证明，决定 Agent 效率的从来不是语法字数，而是预训练权重流行度与编译器的确定性反馈。
date: 2026-08-13
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-13-danluu-pl-tokens-efficiency-img-00-infographic-core-summary.png)

在 AI Agent 辅助编程的讨论中，有一个被反复引用且看似极具吸引力的观点：**“动态类型语言（如 Ruby、Python）或极简语言（如 Clojure、J）能帮 AI 节省大量 Token。”** 

这个结论出资 Martin Alderson 等人的早期对比测试，甚至被 Google AI Overviews 直接吸收为标准答案。他们声称，在 Rosetta Code 这样的小任务中，由于不用写显式类型声明，Clojure 和 J 语言消耗的 Token 只有 C/C++ 的一半乃至三分之一，代币效率整整相差 2.6 倍。不少团队因此动了心思：是不是专门让 Agent 用某种极简 DSL 或动态语言生成代码，就能在有限的上下文窗口里省下一大笔钱？

著名系统性能专家 Dan Luu 最近发表的长文《What's the best programming language for coding agents?》，用严谨的实证测试给这一迷思浇了一盆冷水。看完他的评测与数据，我不禁联想到之前写过的 [《Not the Model, You're the Harness》](https://ntlx.github.io/articles/not-the-model-youre-the-harness)——**在 AI 时代，我们太容易把玩具 Benchmark 里的虚假泡影，误当作指导生产的工业法则。**

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-13-danluu-pl-tokens-efficiency-img-01-eval_sandbox_pollution.png)

## 1. 荒谬的 Benchmark：沙盒泄露与逻辑漏洞

Dan Luu 首先撕开了那些所谓“权威评测”的遮羞布。为什么之前的 Benchmark 能测出 2.6 倍的代币效率差？原因只有两个：**任务过于平凡，以及评测套件自身带有严重 Bug。**

Rosetta Code 上的任务，本质上是几十行以内的控制台打印输出。在这类极小任务上，少写几行类型定义确实占了字符数的便宜。这就如同此前流行一时但后续被证伪的“野人模式（Caveman mode）”一样——在玩具项目上看似省 Token，一旦放到真正包含算法推理、多模块协作和自动化测试的真实工程中，语法字符数的微小差异就会被迅速稀释到忽略不计。

更荒诞的是开源评测套件里的沙盒缺陷。在知名 benchmark `ai-coding-lang-bench` 中，某项测试脚本试图调用 `../../minigit`，但该路径根本不存在：

- 静态语言 Rust 率先被测试，因为找不到执行文件直接被判 0 分；
- 紧接着运行的第一个 Go agent 在“修复环境”时，在父目录做了一个指向自己二进制文件的软链接；
- **结果导致：后续所有语言（包括 Ruby、Python、Haskell 等）的评测，实际上跑的全是第一个 Go agent 编译出来的程序！**

评测作者并未察觉到这一严重的沙盒污染，反倒在报告里大谈“Rust 和 Haskell 的所有权与单子增加了 AI 的认知负担，导致通过率低下”。当 Dan Luu 重新让 Rust 针对自身的二进制文件跑测试时，Rust 瞬间拿下了 100% 的完美通过率。此外，测试脚本里甚至还出现了 `if/else` 两端都无脑返回 `pass` 的逻辑漏洞。基于这样布满暗礁的评测套件得出的“某种语言省代币”的结论，自然经不起推敲。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-13-danluu-pl-tokens-efficiency-img-02-popularity_vs_density_matrix.png)

## 2. 非平凡任务实测：语法紧凑度不如 GitHub 流行度

为了验证真实的语言效率，Dan Luu 搭建了两个非平凡（Non-trivial）评测任务：
1. **Zstd 解码器实现**：要求 Agent 在没有外网的隔离沙盒中，严格按照 Zstd RFC 规范从零写出完整的解码器。
2. **Pandoc 预留测试集（Holdout Bench）**：使用测试驱动开发（TDD）模式，在 Agent 无法偷窥的预留测试集上评分。

在 Dan Luu 抓取并汇总的 5 个交互式可视化图表数据中（涵盖 GPT-5.6 级别模型在不同 Effort 下的表现），呈现出几个颠覆直觉的现象：

1. **静态 vs. 动态语言没有代币壁垒**：在复杂任务中，所谓的 2.6 倍代币鸿沟荡然无存。在中等推理 Effort 下，动态语言分布略靠近左上方；但在 Ultra 深度推理 Effort 下，Rust、Go、C++ 等静态语言的正确率反超或平起平坐。
2. **生僻极简语言（J、Assembly）全面崩溃**：J 语言虽然理论字符极少，但因为 AI 预训练权重里缺乏相关数据，模型生成时错误率居高不下，耗费了大量重试代币。
3. **流行度正相关**：代码在 GitHub 上的流行度（Popularity）呈现出明显的正向影响。越主流、开源样本越丰富的语言（如 Python、TypeScript、Rust、Go），Agent 生成的代码成本更低、正确率更高。

大模型本质上是一个基于概率分布的文本补全引擎，而不是字符压缩机。100 行语法显式但分布极广的 Python 或 Rust 代码，模型处理起来顺风顺水；而 10 行机器闻所未闻的生僻符号，反而会让模型陷入漫长的概率迷茫。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-13-danluu-pl-tokens-efficiency-img-03-agent_iteration_path_compare.png)

## 3. 确定性反馈才是真正的代币杠杆

在真实的 Agent 循环（Agent Loop）中，代币消耗大户从来不是“第一版代码写了多少字”，而是“Agent 在错误尝试中来回重构消耗的 Context”。

Dan Luu 在评估 Agent 循环路径时，对比了三种模式：
- **Ultra 单次深度推理**
- **Resume with context（保留上下文迭代）**
- **Ralph loop（每轮清空 Context 重新 Prompt）**

实验结果显示：**保留上下文连续修正的效率，显著优于每轮清空 Context 的 Ralph loop。** 特别是在动态语言中，一旦清空上下文，由于缺乏静态类型信息的显式约束，Agent 会迅速丢失先前的类型推导，陷入重复报错的困境。

这让我在之前 [《给 GitHub Copilot 装上抓包代理后，我看到了 AI IDE 最贪婪的一面》](https://ntlx.github.io/articles/github-copilot-mitm-harness-analysis) 中观察到的现象得到了理论印证。在真实开发中，静态语言的编译器、Linter 和类型系统，提供了一种极高密度的“确定性反馈（Deterministic Feedback）”。

哪怕静态语言在首次 Prompt 时多消耗了 10% 的 Token 用来写类型标注，编译器报错能让 Agent 在一两轮之内精准定位错误并收敛；相反，动态语言虽然省了类型字符，却可能让 Agent 在隐式类型引发的运行时异常里打转五六轮。**确定性反馈带来的收敛速度，才是决定 Agent 总体代币账单的真正杠杆。**

## 4. 总结与启示

回到最初的问题：对于 AI Coding Agent 而言，到底哪种编程语言最省 Token、最有效率？

 Dan Luu 的实证研究给出了明确的答案：
- **别为生僻极简语法买单**：不要指望靠 J、Clojure 或某种极其晦涩的自定义 DSL 让 AI 省 Token，模型的预训练数据权重覆盖率决定了基线能力。
- **重视类型与确定性 Harness**：TypeScript、Rust、Go、Python 这类既有海量开源生态、又有完善校验闭环的主流语言，才是 Agent 研发的最优解。
- **警惕玩具 Benchmark**：当有人告诉你“某种新技巧/新语言能帮 Agent 降低 60% 成本”时，先检查他们的评测沙盒有没有脏数据，任务是不是只有十几行的 Rosetta Code。

与其在语言选型上花心思绞尽脑汁“省代币”，不如把精力放在给 Agent 搭建更严密的沙盒环境、更准确的测试套件与更快速的反馈回路（Harness）上。

*你给 AI Agent 写代码时更偏好哪种语言？是在用静态类型还是动态语言？欢迎在评论区分享你的实测体会。*

## 参考资料

- [Dan Luu: What's the best programming language for coding agents?](https://danluu.com/pl-tokens/)
- [Martin Alderson: Which programming languages are most token efficient?](https://martinalderson.com/posts/which-programming-languages-are-most-token-efficient/)
- [Yutaka Endoh: ai-coding-lang-bench Repository](https://github.com/mame/ai-coding-lang-bench)
- [Dan Luu: Exercise 7 on benchmarking, evals, and experimental design](https://danluu.com/exercise-7/)

## 延伸阅读

- [Not the Model, You're the Harness](https://ntlx.github.io/articles/not-the-model-youre-the-harness)
- [给 GitHub Copilot 装上抓包代理后，我看到了 AI IDE 最贪婪的一面](https://ntlx.github.io/articles/github-copilot-mitm-harness-analysis)
- [别再折腾花哨的 AI 技巧了：为什么 GitHub AI 负责人说 Harness 才是全部？](https://ntlx.github.io/articles/github-copilot-the-harness-is-all-you-need)
- [循环交出控制权之后：读 ByteByteGo《The Agent Loop》](https://ntlx.github.io/articles/agent-loop-reading-bytebytego)
