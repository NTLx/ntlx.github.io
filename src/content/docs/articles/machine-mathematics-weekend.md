---
$schema: starlight
title: 和 AI 做了一个周末的数学，什么时候该停手
description: 读 Charles O’Neill 用 AI 做数学的周末笔记，我想知道一条路线还能走多远，别人又能把交付的结果查到哪一步。
date: 2026-11-26
category: ai-agents
primarySourceUrls: ["https://charlesponeill.com/posts/a-weekend-of-machine-mathematics/"]
---

该睡觉的时候，Charles O’Neill 还看着 Codex 的转圈动画。他想，再给一点提示，或者把另一个会话刚冒出来的想法转过来，会不会就差这一步？他在回顾里说，这种兴奋以前只在赌场和玩老虎机时体验过。读到这里，我想到一个更难回答的问题。假如下次反馈确实又好了一点，凭什么决定这一晚够了？

这场周末实验有个特别的起点。Levent Alpöge 公布了黎曼猜想和狄利克雷 L 函数的广义黎曼猜想的证明，Lean 社区维护了相应的形式化。O’Neill 由此去找那些曾被黎曼猜想卡住的问题。他后来发现，能拿掉一个前提，离知道下一步该攻哪里还有一段路。

![从六次矩下界到证据交接](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-26-machine-mathematics-weekend-img-00-infographic-core-summary.png)

## 小数点向前走，离答案还有什么

他先盯上了黎曼 ζ 函数的六次矩。简单说，这是把函数在临界线上的取值大小做六次方，再沿临界线积分。这样一来，特别大的取值在总量里格外显眼。按论文的归一化方式，一个渐近猜想给出的常数是 42。Niklas Fraccaro 的论文给出了 41.008 的下界，O’Neill 一行把下界推进到 41.6406。

数字排在一起，很容易让人以为，只要再往前抠一点，就能抠出 42。实际上，下界只保证这个量至少有多大。要证明预测的渐近式，还得控制它最多能有多大。论文里更值得留意的是，它把这条路走不通的地方也写了出来。作者把几类可用的测试放在同一个框架里，说明某些类别的贡献能算到哪里，也指出仅在所研究的类别里继续扩充，仍有一块触及不到。

下次模型说「还有一项可以改进」，我想追问一句。它只是改进了眼下的估计，还是找到了办法，能去掉造成剩余缺口的限制？如果只动得了前者，继续跑仍可能产出值钱的下界。至于要不要为它再等一小时，得看自己追的究竟是哪一个结论。

## 算完以后，别人能查到哪里

素数区间的例子把这个问题往后推了一步。勒让德猜想问的是相邻两个平方数之间是否总有素数。O’Neill 团队研究的完整结论把指数放宽到 11/5。较大的底数交给解析论证，较小的底数交给计算。在有限计算里，最直观的证据是给出一个数，让读者能检查它确实在指定的两个端点之间，而且确实是素数。

团队还报告把平方数版本检查到了底数 10¹⁴。论文专门留了一节交代这批证据的状态。公开证书加上前人的计算，可以让外部读者复查起头的连续范围以及另外一些离散区间。一位拿到存储读取权限的审稿人回放了部分记录。完整计算档案仍放在私有存储里，公开仓库提供程序和审计记录，剩余范围靠原运行中的验证支撑。

![素数区间的解析论证与有限计算证据](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-26-machine-mathematics-weekend-img-01-framework-prime-interval-evidence.png)

打开 Lean 仓库，还能看到这条边界写进了定理声明。主定理接收一个名为 ComputationClaims 的前提，里面放着这次计算所声称覆盖的范围。这段形式化检查前提能否推出结论。区间的覆盖范围还得去看计算证据。这样读一遍，我才明白论文里单列「证据状态」那一节为什么值得认真看，它告诉读者该从哪里接手。

## 把交接也写进任务

同一批成果里的七环问题给了我一个对照。把七个符号想成围成一圈的七个点，相邻的符号可能被听混。码本要保证即使这样，每条消息仍可辨认。论文给出的一个上界是，长度为四的码字最多能放 112 个。作者把排除 113 个码字的穷举写成可公开重跑的检查，并在 Lean 里证明了每项检查通过意味着什么。仓库也写明，运行结果依赖 Lean 编译器的求值。读者因此能找到要重跑的东西，也能看清重跑需要信任哪些环节。

此前写 [Meta 的开放数学研究](https://ntlx.github.io/articles/meta-open-research-verification) 时，我关心的是一个反例有没有地址，别人能否找到并检查它。这次还得追问，顺着那个地址点进去，证据是否齐备。定理声明、公开样本和完整记录，各自能回答不同范围的问题。尤其是计算规模很大时，把访问条件写在结论附近，能省掉读者反复猜测。

如果把这周末的经验用到下一次研究，我会给长时间运行的任务多写两句话。第一句问，什么样的发现会让我暂时放下这条路线？比如剩下的缺口都落在当前方法够不到的地方。第二句问，交给另一个人时，他需要什么才能从头检查？比如一个精确陈述、清楚列出的前提，以及能拿到手的证书。凌晨想再加一轮提示时，我愿意先看看，这一轮到底能替哪句话多回答一点。

## 参考资料

- Charles O’Neill，[A weekend of machine mathematics](https://charlesponeill.com/posts/a-weekend-of-machine-mathematics/)
- Levent Alpöge，[黎曼猜想证明公告](https://alpo.ge/remark.pdf)；[Lean 社区形式化仓库](https://github.com/leanprover-community/riemann-hypothesis)
- Niklas Fraccaro，[六次矩下界论文](https://hexagonmath.org/2610.00634v3)；O’Neill 等，[改进的六次矩下界](https://charlieoneill11.github.io/maths-releases/zeta-sixth-moment/)
- O’Neill 等，[相邻 11/5 次幂之间的素数](https://charlieoneill11.github.io/maths-releases/legendre/)；[计算证据与 Lean 声明](https://github.com/charlieoneill11/maths-releases/tree/main/legendre)
- O’Neill 等，[七环零错误码的核查说明](https://github.com/charlieoneill11/maths-releases/tree/main/seven-cycle-five)；[成果索引](https://charlieoneill11.github.io/maths-releases/)
