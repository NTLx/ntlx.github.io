---
$schema: starlight
title: 谁来审一条 140 页的证明
description: KLS 猜想被证明，变化不只在 AI 会搜索；证明开始像交付物，搜索、收敛、复现和形式化检查各自需要有人负责。
date: 2026-10-22
category: ai-models
primarySourceUrls: ["https://www.microsoft.com/en-us/research/blog/solving-a-31-year-old-grand-challenge-in-mathematics-the-kls-conjecture/"]
---

2026 年 10 月 4 日，两篇证明 KLS 猜想的论文先后出现在 arXiv 上。一篇是 Song 和 Zhang 的 140 页论文；另一篇是 Bizeul、Klartag 和 Lehec 的 32 页证明。

Song–Zhang 的 AI 使用披露写得很克制：作者列出用过的模型，说明 100 多条候选路径是协作产生的，由作者决定哪些值得继续；所有证明经过作者和多个 AI 工具核验，作者对正确性负全部责任。

Bizeul–Klartag–Lehec 的致谢更直接：大部分证明和数学想法由 ChatGPT 找到，作者的工作主要是理解这些证明、改进表述；作者特别提到，suspension 的想法来自他们。

两段话放在一起，KLS 就不只是“一个 31 年的猜想被解决了”。它同时把一个更难的问题推到台前：当证明的搜索、生成和检查都可以部分交给机器，署名、信任和责任该怎么分？

![导读图：KLS 之后，证明也成了交付物；搜索可外包，收敛与署名不能](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-22-kls-conjecture-31-years-img-00-infographic-core-summary.png)

## 一个关于切法的猜想

先把 KLS 说清楚。

把一个凸体切成体积相等的两半。切面可以是一个平面，也可以是弯曲的。平面切容易描述、容易计算；弯曲切的选择更多，理论上可以切得更省。KLS 问的是：最好的平面切，面积是否总能在某个 universal constant 倍以内，接近最好的任意形状切？

微软发布稿里有一张示意图，用正四面体做了类比：平面切的面积是 0.2500，弯曲切可以做到约 0.2173。这个例子里差距不大；猜想的关键在“任何维数”。如果这个常数随维数增长，高维空间里的平面切就会越来越吃亏；KLS 说它不增长。

![原文图 1：正四面体的平面切与弯曲切对比，平面切面积 0.2500，弯曲切约 0.2173](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-22-kls-conjecture-31-years-img-source-kls-flat-vs-curved.png)

这里的分布要满足两个条件：各向同性（中心在原点，协方差是单位矩阵）和对数凹（密度形如 e^{-V}，V 是凸函数）。这两个词把“凸体”和“高斯分布”放进同一个框架。它为什么重要？随机游走在凸体里走得多快、能不能高效采样、体积怎么算、凸优化算法要多少步，都和这个常数有关。过去三十一年，数学家一直在把上界往下压：1995 年的 O(n)，到 n^{5/12}、n^{1/3}·log n、n^{1/4}，再到 2023 年的 O(log n)。2026 年 7 月，Letwin 把它压到 O(log^{1/4} n)。这些改进大多只比前一代好一点，方向却一致：维数的影响越来越小。

## 最后一步，是把改进再改进一次

Song 和 Zhang 的起点是 Letwin 的二次型不等式：对任意对称矩阵 M，Var(⟨MX,X⟩) 被梯度能量控制。这个不等式把“二阶涨落”管住了。Song–Zhang 把它推广到高阶，得到一组多项式方差估计；再把估计和曲率下界结合，得到一个判据：只要某一族 tilt 平均的高阶导数被控制，Poincaré 常数就有上界。

他们先把这个上界从 log^{1/4} 推到 log^{1/6}。接着发现，判据可以递归使用：把改好的上界喂回同一个论证，还能再紧一点。10 月 1 日的 v1 用这个办法得到 log* 级别的界——摘要里写的是 4^{log* n}，Poincaré 侧是 16^{log* n}。这已经比任何多项式或对数界都慢得多，但它仍然随维数增长。

最后一步不是再找一个新判据，而是把整个 refinement 再跑一遍。每一轮都会引入一点误差；作者证明这些误差按几何级数衰减，总和被一个 universal constant 控制。于是维数依赖被消掉，v2 得到 O(1)。

这个收尾很像工程里的迭代算法：不是找到一个神奇公式，而是证明循环会收敛。论文的 AI 披露里有一句很具体的话：重复 refinement 的想法，受第一作者线性规划工作的启发——那里也是反复缩小矩阵、动态维护逆矩阵。一个来自算法设计的动作，被搬到了高维几何的证明里。

![示意图：把上界喂回同一个论证，误差按几何级数衰减，总和有界后得到 O(1)](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-22-kls-conjecture-31-years-img-01-flowchart-recursive-refinement.png)

这类证明最容易被记住的是某个关键不等式；技术概述里，最后的难点其实是对误差的记账。AI 可以帮忙探索候选、做高阶张量的推导、核对局部步骤；但“把哪个上界喂回去”“误差会不会累积到发散”“哪一轮的损失可以忽略”，不是搜索空间里的一个候选，而是对搜索本身的判断。140 页里很大一部分，是在为这个判断做账。

## 一百条轨迹，两种致谢

微软的发布稿把过程写得很完整：结构化、人类指导；多个 agent 并行探索同一想法的变体；研究者看中间结果，砍掉没希望的方向，把最有希望的结果送进下一轮；大约 100 条轨迹之后，关键突破出现。发布稿还说，他们另开了一条对照轨道，用几个领先模型做无指导尝试，总 token 预算与主流程大致相同，结果没有达到目标。

论文的披露更短，也更具体：用了 GPT-6 Astra、GPT-5.6 Sol、Claude Fable 5、Fable 5.1；100 多条候选路径是协作产生的；作者决定优先级；所有证明由作者和多个 AI 工具核验；作者负全责。

Bizeul、Klartag 和 Lehec 的致谢则是另一种记账：大部分证明和数学想法由 ChatGPT 找到，作者主要理解这些证明、改进表述；suspension 的想法由作者提出。他们的引言第一句还带着一点自嘲：KLS 猜想对当代 AI 工具“几乎不构成挑战”——放在致谢旁边，这句话很难不被读成反讽。

把这三段话放在一起，我倾向于这样判断：搜索可以外包，收敛判断和署名不能。它们描述的是同一条生产线的不同工位：有人负责生成候选，有人负责选择，有人负责把选择变成可读的证明，有人负责核对，最后有人签字。微软稿把镜头对准“选择”，独立证明把镜头对准“生成”。镜头不同，功劳的分配就不同。

“无指导尝试失败”也值得放回边界里看。它是一个团队、一个问题、一次对照，没有给出模型清单、提示、预算明细和评分标准。它能说明这套有指导的流程在这个问题上奏效了，不能说明无指导在别的问题上一定不行。把它当成“人类指导是必要条件”的证据，会跨过材料能支撑的范围。

更值得追问的是“作者”这个词。它同时装着搜索者、选择者、证明者、表述者、核验者和签字人。KLS 这次把这几个角色拆得很开，但论文的署名仍然只写作者名字，不写谁负责搜索、谁负责核验。同一件事，在微软稿里是“人类指导 AI”，在独立证明的致谢里是“AI 找到大部分证明，人类理解并表述”。两种说法都在描述作者，只是各自强调了作者的一个侧面。我也没有一个干净的分账方案；但至少可以看出，笼统的“人机协作”把太多不同工作装进了同一个词。

## 独立证明，独立到哪一层

KLS 这次不只多了一篇证明。10 月 4 日同一天，Bizeul–Klartag–Lehec 的 32 页证明也挂了出来；10 月 6 日，Balasubramanian 和 Kasiviswanathan 的 deterministic variational proof 出现，给出 C_P(μ) ≤ 25 的显式界；随后，Lean 4 仓库 KLS500 给出 Poincaré 常数 ≤ 500 的形式化证明。

微软稿把这称为“独立确认”，并说独立证明是数学中最强的验证形式之一。这句话的方向是对的，但“独立”需要分层。Bizeul–Klartag–Lehec 的摘要明确说，证明的 crucial step 是 Song–Zhang 的判据；他们的贡献是从这个判据出发，用 cumulant、stochastic localization 和 suspension 走完另一条路。第三篇是另一条 variational 路线，微软稿只说它“relies on a closely related idea”。所以，最终的论证路径是独立的，关键判据是共享的。

这并不削弱结果。它说明被验证的对象不止是那条 140 页的论证，还包括那个判据：不同的人从同一个判据出发，能走到同一个结论。数学里的“独立证明”通常也不是从公理开始各写一遍，而是从不同的中间站出发，看能不能到达同一个终点。KLS 的中间站，就是 Song–Zhang 的判据。

![框架图：三条证明路径共享同一个判据，Lean 内核给出 500 的形式化检查，最后由人签字](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-22-kls-conjecture-31-years-img-02-framework-verification-layers.png)

Lean 的形式化是另一层。KLS500 的 README 说，验证重建了 1,710 个数学模块，端点公理检查只剩 propext、Classical.choice、Quot.sound；Poincaré 常数的上界是 500，Cheeger 界用了 1.97 的比较因子。它主要基于 Bizeul–Klartag–Lehec 的路线，并包含 Song–Zhang 的判据。

但 README 也写了：Comparator 和 Nanoda 没有运行。也就是说，这是一次单内核的形式化检查，不是多内核交叉验证。仓库还是第三方实现的，不是微软作者的官方 artifact；微软稿说作者自己的 Lean 验证计划在最终审阅后发布，博客里只写了计划，没有给出链接。形式化的价值，是把信任收敛到一个很小的内核；这个内核本身仍然需要被审计。

我核对时间线时还发现两处小偏差。微软稿说第三篇证明“同一天”出现，但 arXiv 记录是 10 月 6 日提交、10 月 8 日修订；v1 的摘要写的是 4^{log* n} 和 16^{log* n}，不是严格意义上的“迭代对数”。这些地方都算不上数学错误，更像发布稿的叙事压缩。这也说明，为什么“独立复现”和“一手材料”不能只停留在新闻稿层面。

## 证明变成交付物之后

把这件事放回工程现场，很多读者会觉得熟悉。Agent 写代码的产能已经上来了；真正卡住交付的，是评审、测试、回滚和责任。我在[《谁在为 Agent 写的代码签字？》](https://ntlx.github.io/articles/who-signs-agent-code)里写过一组数字：中位数公司已有 22% 的已合并 PR 由自主 agent 编写，但完全没有人工评审、由 agent 评审并合并的 PR 只占 0.6%。难的是回答“凭什么接受”。

数学有一个软件工程还没有普遍拥有的东西：一个小的、可独立检查的内核。测试只能证明某些输入下的行为，形式化内核可以检查整条证明。但 Lean 也不是自动的信任机器。有人得把命题写对，有人得维护内核、审计公理，还有人得决定“这个形式化版本”和“论文里的定理”是不是同一个东西。KLS500 的 1,710 个模块和三条公理，说明这条路已经能走通；Comparator 和 Nanoda 没跑，说明它还没有走到多内核交叉验证那一步。

我在[《AI 构造假证明破解 Lean 4？》](https://ntlx.github.io/articles/lean-soundness-bug-postmortem)里写过，形式化验证的真正价值，不是保证“绝无漏洞”，而是把信任从庞大的前端和模型里剥离出来，收敛到一个可审计的小内核。KLS 这次同时展示了这句话的两面：小内核让 500 这个常数变得可检查；小内核本身仍然需要有人检查。

如果要把 KLS 的经验变成可复用的做法，我会把一条 AI 参与的证明拆成四份记录：AI 使用披露，写清楚哪些环节用了什么模型、谁做选择；独立复现路径，写清楚从哪个中间站出发、依赖哪些共享判据；机器可检查的核心，写清楚形式化了什么、没形式化什么、跑了哪些内核；责任人，写清楚谁对最终文本和它的解释负责。四份记录不必合成一个分数，也不该被一句“human in the loop”盖过去。

“Human in the loop”这句话最大的问题，是它不告诉你人在哪个 loop 里。微软稿里的人，在搜索回路里做 pruning；Bizeul–Klartag–Lehec 的人，在理解和表述回路里工作；Lean 的人，在核验回路里工作。三个回路都需要人，但需要的判断不一样，能承担的责任也不一样。把这三个回路分开记账，比笼统地说“人机协作”更有用。

KLS 的常数是普适的；让一条证明被普遍接受的那套结构，还不是。它需要被建出来，也需要有人签字。

## 参考资料

- [Solving a 31-year-old grand challenge in mathematics – the KLS conjecture](https://www.microsoft.com/en-us/research/blog/solving-a-31-year-old-grand-challenge-in-mathematics-the-kls-conjecture/)
- [An O(1) Bound for the KLS Constant](https://arxiv.org/abs/2610.01447v2)
- [An O(4^{log* n}) Bound for the KLS Constant (v1)](https://arxiv.org/abs/2610.01447v1)
- [Presenting a proof of the Kannan-Lovasz-Simonovits conjecture](https://arxiv.org/abs/2610.05474)
- [A Dimension-Free Bound on the Poincaré Constant of Isotropic Log-Concave Measures](https://arxiv.org/abs/2610.07728)
- [The KLS constant is O(log^{1/4} n)](https://arxiv.org/abs/2607.24164v1)
- [KLS500: Lean 4 formalization of the KLS conjecture](https://github.com/HongruZhao/KLS500)
- [There Aren't Enough Chaperones for All Your Coding Agents](https://tessl.io/blog/there-arent-enough-chaperones-for-all-your-coding-agents)
