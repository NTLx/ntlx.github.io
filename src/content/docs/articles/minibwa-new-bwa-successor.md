---
$schema: starlight
title: BWA 的继任者来了：minibwa 不是加速版，而是一次设计换代
description: minibwa 真正放下的不是几分钟运行时间，而是把“复刻旧输出”当成永恒规格的包袱。
date: 2026-07-14
category: engineering
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-14-minibwa-new-bwa-successor-img-00-infographic-core-summary.png)

李恒开始大幅改造自己的“成名作”，这件事的分量比一个新工具发布大得多。BWA-MEM 在 2013 年问世后，几乎成了人类短读段变异检测流程的默认底座。一个底座用得越久，越难动：不是因为它没有缺点，而是每个下游步骤都已经学会了和它相处。

minibwa 的信号很明确：未来的功能开发不再押在 bwa-mem 上，而是转向这个后继者。但我读完仓库说明、李恒的文章和 Andrew Carroll 的独立测试后，觉得最值得讲的不是“它快了几倍”，而是它终于把一件常被混淆的事拆开了：**兼容旧输出很重要，但不该永远统治新算法的设计。**

## 它保留了 BWA 的骨架，却换掉了旧的发力方式

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-14-minibwa-new-bwa-successor-img-01-bwt_seed_chaining_recombination.png)

minibwa 不是把 BWA-MEM 套上一层更猛的 SIMD。它保留了 BWA 一侧的 BWT 索引和可变长度 seed，又接上 minimap2 一侧更现代的 chaining 与 SIMD 核苷酸比对。换句话说，它保住了短读段场景里那套熟悉的“找路”能力，却重写了把线索串成比对路径、跨过缺口的方式。

这正对着 BWA-MEM 的旧短板。李恒指出，旧的 chaining 不如 minimap2，逐个延伸 seed 也不如在 seed 之间补 gap；遇到更长的缺口时，差距会更明显。即将普及的 SBX 读段并不只是“更长一点的短读段”，它会逼着 mapper 更认真地处理这些缺口。

仓库 README 给出的性能描述是：在相近准确度下，minibwa 比原 BWA-MEM 快 3 倍以上、比 bwa-mem2 快约 2 倍；作者文章的 32 线程人类 30X 基准约为 50 分钟。这里当然不能把单一基准当容量承诺，但算法结构确实说明了它为什么可能更快：seed 查询做批量与 prefetch，少做不必要的 mate rescue，在高重复区域不为很可能错配的尝试耗尽算力。

## 真正放弃的，是“旧结果必须长得一模一样”

许多 BWA-MEM forks 的目标很合理：尽量产出相同或近似相同的结果，让既有流程不用重验。但这个目标也会锁住算法。为了逐项复刻旧行为，代码会变大，新的 chaining、gap 处理和启发式就很难真正换进去。

minibwa 选的是另一条路：提供 `mem` 这个旧 CLI 入口，却明确说明不少参数会被忽略，结果也不会完全相同。这不是不兼容的疏忽，而是一份迁移契约：**你得到的是更好的算法空间，代价是不能把旧基线当作唯一正确答案。**

这和我们前几天写的[《重写的瓶颈从来不是写代码》](https://ntlx.github.io/articles/bun-rust-rewrite-verification-bottleneck)其实是同一个问题。重写最难的不是把实现换掉，而是让所有依赖旧行为的地方重新获得信任。对基础设施而言，性能收益越大，验证就越不能省。

## 独立测试给了鼓励，也把边界画得更清楚

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-14-minibwa-new-bwa-successor-img-02-pipeline_bottleneck_shift.png)

Carroll 用 76 个物种做了独立评估，其中包括约 14.6Gb 的六倍体小麦；他的设置是每物种 1M 与 100k reads、各 5 次重复、32 线程。结论很干脆：在那套测试中，minibwa 每个样本都快过 BWA-MEM，也快过 Bowtie2。

但有意思的是，mapper 变快后，故事没有结束。Carroll 在水稻的端到端测试里看到，`samtools sort` 和磁盘 I/O 会更快成为瓶颈；增加总核数不一定线性缩短流程，给 sort 重新分线程反而可能更有效。所谓“换一个更快的 mapper”，最后往往是在重排整条管线的瓶颈。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-14-minibwa-new-bwa-successor-img-03-precision_recall_validation_fork.png)

准确性也不该只看一个 mapping rate。多数物种里，minibwa 与 BWA-MEM 的 mapping rate 相差约 0.3% 内，通常略低；但在极难参考中差异会拉开。Carroll 的下游比较还观察到一个很实用的分叉：常规样本相当或略好，困难样本里 minibwa 往 precision 一侧偏，BWA-MEM 则往 recall 一侧偏。没有哪个词比“更好”更容易掩盖这个取舍。

这不是对 minibwa 的否定，反而是它值得认真试的理由：工具开始把以前藏在旧默认值里的选择暴露出来了。只是这份独立评估不是所有物种、所有参考、所有临床或生产流程的真值；它应当成为你设计本地验证的起点，而不是替你签字的终点。

## 谁该先试，谁还应先等等

如果你的工作是线性参考上的短读段，愿意接受与 BWA-MEM 不同的比对细节，并且有变异调用或下游分析的评估基线，minibwa 很值得先做 A/B：同一批 FASTQ、同一套下游、看总耗时，也看 MAPQ 分布、关键位点和 precision/recall。别只跑 mapper 的 wall time。

反过来，参考含 alternate contigs、工作是 spliced RNA-seq、noisy long reads 或非定向 BS-seq，当前就不该把它当无缝替代。仓库写得很坦白：这些边界还在。高准确长读段也能跑，但高错误率长读段仍是 minimap2 更稳的地盘。索引时约 18N 的内存需求也意味着，云上成本要把建索引算进去。

我喜欢 minibwa 的地方，恰恰是它没有把“兼容”说成不存在，而是把它放回该在的位置：不是算法不许前进的理由，而是迁移时必须被认真验证的约束。李恒说下一个重点是 alternate contigs。等这块补上，BWA-MEM 的时代大概才算真正交班。

*如果你的流程仍在用 BWA-MEM，最担心的是结果变化、验证成本，还是下游瓶颈转移？欢迎在留言区说说你的场景。*

## 延伸阅读

- [重写的瓶颈从来不是写代码](https://ntlx.github.io/articles/bun-rust-rewrite-verification-bottleneck)
- [Agent 越能写代码，架构越不能乱](https://ntlx.github.io/articles/agentic-development-needs-architecture)

## 参考资料

- [minibwa GitHub 仓库](https://github.com/lh3/minibwa)
- [Heng Li：Minibwa is the new bwa-mem](https://lh3.github.io/2026/07/04/minibwa-is-the-new-bwa)
- [Andrew Carroll：The Best of Both Worlds - Assessing MiniBWA](https://andrewcarroll.github.io/2026/06/30/the-best-of-both-worlds-assessing-minibwa.html)
- [minibwa 预印本](https://arxiv.org/abs/2606.15357)
- [Fulcrum Genomics：Minibwa: alignment is never solved](https://blog.fulcrumgenomics.com/p/minibwa-alignment-is-never-solved)
