---
$schema: starlight
title: 缩放定律变成三条之后
date: 2026-05-12
description: 三条缩放定律叠加在一起，算力需求不是加法，是乘法
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-12-aws-scaling-laws-img-00.jpg)

AWS 昨天在 HuggingFace 发了一篇长文，标题很老实：「Building Blocks for Foundation Model Training and Inference on AWS」。没有噱头，没有口号，就是告诉你——我们在这套基础设施上花了多少功夫，每一层怎么搭的。

但文章开头一句话，比标题有分量得多：

> 缩放定律不再是一条。

***

## 从一条到三条

很长一段时间里，AI 圈的共识很简单：模型越大，数据越多，算力砸得越狠，能力就越强。`Kaplan 2020` 年的论文给出了漂亮的幂律曲线——参数、数据、训练算力，三个变量一条线。这给了所有人一个清晰的赌注公式：*加算力就行*。

`NVIDIA` 在 2025 年初把这个公式拆成了三条：

* **预训练缩放**——还是原来那条，加大模型和数据
* **后训练缩放**——在一个基础模型上做 `SFT`、`RLHF`、蒸馏，这步消耗的计算量大概是预训练的 **30 倍**
* **测试时缩放**——推理阶段让模型"多想一想"，链式推理、多采样验证，复杂查询的算力可以是单次推理的 **100 倍**

30 倍、100 倍。不是加法，是叠加。**一个模型从预训练到上线，总的算力需求在指数级膨胀。**

![三条缩放定律](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-12-aws-scaling-laws-img-01.jpg)

AWS 这篇博客用了一整篇文章回应这个现实：三条缩放定律压下来，基础设施长什么样？

## 四层积木

AWS 给出的答案是四层架构：

```
+------------------+
|   可观测性       |  ← Prometheus / Grafana / DCGM
|                  |     横跨所有层，实时盯盘
+------------------+
|   ML 软件栈      |  ← PyTorch / NCCL / vLLM / SGLang
|                  |     真正的活，全开源
+------------------+
|   资源编排       |  ← Slurm / Kubernetes / SageMaker HyperPod
|                  |     谁用什么、什么时候用
+------------------+
|   基础设施       |  ← GPU / Trainium / EFA / FSx Lustre
|                  |     硬家伙，算力本身
+------------------+
```

![四层架构](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-12-aws-scaling-laws-img-02.jpg)

有意思的是第三层。ML 软件栈——`PyTorch`、`NCCL`、`vLLM`、`SGLang`——全部是开源的。**AWS 没有在模型框架层做自己的东西，它做的是把别人的东西跑得更快。**

这其实是云计算的老路子，但放在 AI 基础设施上，含义不一样了。AI 的开源生态比任何时代都活跃，AWS 不可能也不应该去竞争 `PyTorch` 的地盘。它的优势在底层：芯片、网络、存储——那些需要百亿美金资本开支才能堆出来的东西。

## Trainium：不做 NVIDIA 的替代品

AWS 的芯片故事单拎出来说。

很多人把 Trainium 理解成"便宜的 NVIDIA 替代品"。但从 Trainium3 到 Trainium4 的产品路线，说明 AWS 想的不只是替代：

* **Trainium3**（2025 年 12 月上线）——`TSMC 3nm` 制程，单 `UltraServer` 144 颗芯片，算力是 `Trainium2` 的 4.4 倍。`Matt Garman` 说这是"世界上最好的推理平台"。
* **Trainium4**（预计 2026 年底）——将支持 `NVIDIA NVLink Fusion` 互连技术。

第二条信息量很大。做自己的芯片，还要兼容 `NVIDIA` 的互连协议——这不是要干掉 GPU，是要让 GPU 和 Trainium 能在同一个集群里干活。

想想 Anthropic 的 `Project Rainier`：近 100 万颗 Trainium 芯片，史上最大规模的单一非 NVIDIA AI 芯片部署。Anthropic 不是不用 GPU，而是在大规模推理场景下，Trainium 的成本模型更划算。

AWS 的逻辑很清楚：训练场景下 NVIDIA GPU 仍然是主力（P6 实例用 B200/B300），但推理场景可以用 Trainium 把成本压下来。**两者共存，互不替代。**

Trainium 已经成了数十亿美元的业务。100 万颗芯片部署到位，这不是小打小闹，是认真的算力多元化战略。

![Trainium vs GPU 共存策略](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-12-aws-scaling-laws-img-03.jpg)

## 作者阵容

这篇博客有三个作者：两位来自 AWS，一位来自 NVIDIA 的 MARS MLOps 团队。

一家公司的工程师在自家博客上写文章不稀奇。AWS 和 NVIDIA 的工程师联名写同一篇文章——这说明两件事：

第一，基础设施的标准化已经到了跨公司协作的程度。NVIDIA 做芯片和 CUDA，AWS 做云平台和自研芯片，但在开源工具链层面，大家用的是同一套东西。`PyTorch`、`NCCL`、`Prometheus`、`Slurm`——这些不是任何一家公司的私有财产。

第二，AWS 用 HuggingFace 做发布渠道而不是自己的 AWS Blog，是故意的。HuggingFace 的读者是 ML 工程师和开源开发者，不是 AWS 的销售线索。这篇博文的目标读者是那些真会在代码层面接触这些工具的人。

## 算力不是故事的全部

文章列了大量数据表——GPU 的峰值张量吞吐量、`HBM` 容量和带宽、`NVLink` 和 `EFA` 的速率——但真正值得注意的不是数字本身，而是它背后的判断：

**基础设施正在成为 AI 竞争的分水岭。**

当三条缩放定律同时生效，谁的底层跑得更快、更便宜、更稳定，谁就有资格谈模型能力。算法的差距在缩小，开源让所有人能拿到差不多的模型。但基础设施的差距在拉大——不是所有公司都能搞到万卡集群，不是所有人都能搞定 EFA 网络的调优，不是所有人都能承受 checkpoint 失败时的算力浪费。

AWS 这篇博客最实在的一句话其实是：

> Pre-training, post-training, and inference push toward convergent infrastructure requirements.

翻译一下：不管是训练、后训练还是推理，最后要的都是同一套基础设施——加速计算、高带宽网络、分布式存储。区别只在于负载特征和调度模式，底层要求是一样的。

这意味着一个模型公司的护城河可能不在模型本身，而在它跑模型的那套管线。Anthropic 用近百万颗 Trainium 铺出来的推理集群，OpenAI 在 Azure 上的万卡 GPU 集群——这些东西不是开源能解决的，也不是钱多就能立刻建起来的。它需要时间、经验和踩坑。

## 开源的悖论

整篇文章读下来最讽刺的一点是：AWS 最引以为傲的基础设施，跑的几乎全是开源软件。

`PyTorch`、`Slurm`、`Kubernetes`、`Prometheus`、`Grafana`、`NCCL`、`vLLM`、`SGLang`——一个都不是 AWS 的。AWS 做的事是把这些开源组件在它自己的硬件上跑得更快，然后用 EC2 实例的形式卖出去。

这就是云计算在 AI 时代的核心竞争力：不竞争框架，竞争底层。框架开源了，差异化就往下沉，沉到芯片、网络、存储、调度那些看不见的地方。

这对你我这样的工程师意味着什么？意味着你不需要成为某个云的专属工程师。你的 PyTorch 知识在任何云上都有用，你的 Slurm 经验在任何集群里都能复用。但你对底层硬件和网络的理解，会成为区分普通工程师和高阶工程师那条线。

模型是开源的，框架是开源的，但跑它们的基础设施不是。

![开源的悖论](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-12-aws-scaling-laws-img-04.jpg)

***

*你最近在用什么加速计算资源？云上还是本地？踩到过哪些分布式训练的坑？*

## 原文参考

> Keita Watanabe, Pavel Belevich (AWS) & Aman Shanbhag (NVIDIA). **Building Blocks for Foundation Model Training and Inference on AWS**. HuggingFace Blog.
> <https://huggingface.co/blog/amazon/foundation-model-building-blocks>
