---
$schema: starlight
title: 你不需要看懂所有色块：读完 HuggingFace 的 PyTorch Profiling 系列，我学到的只有一件事
description: GPU 时间在撒谎，compile 的融合是假的，Flash 的低占用率反而是对的——每个洞察都来自预测与现实的错位。
date: 2026-07-12
category: engineering
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-12-pytorch-profiling-guess-first-img-00-infographic-core-summary.png)

## 打开 trace 之前，你猜到了什么？

HuggingFace 在 2026 年 5 到 7 月发了三篇 PyTorch profiling 系列博客，从一个 `matmul + add` 小玩具，一路走到 FlashAttention 和 cuDNN backend。我读完的第一反应不是"学到了什么 API"，而是一个不太舒服的问题：我每次打开 profiler trace 的时候，脑子里有没有一个预期？

大多数时候没有。我打开 trace，看到一堆色块，然后试图从中"读懂"发生了什么。这三篇文章让我意识到，这种读法是反的。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-12-pytorch-profiling-guess-first-img-01-overhead_vs_compute_bound.png)

## GPU 时间在撒谎

Part 1 的起点极其简单：一个 64×64 的矩阵乘法加一个矩阵加法。Profiler table 告诉你，GPU 花了 23 微秒，CPU 花了 2.3 毫秒。GPU 占用不到 1%。

![Profiler table 64×64](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/profile-table-64.png)

如果你只看 GPU 时间，你会觉得"这个 op 很快"。但 23 微秒的 GPU 工作和 2.3 毫秒的 CPU 调度之间，99% 的时间 GPU 在空等。这叫 overhead-bound——CPU 派活的速度跟不上 GPU 干活的速度。

把矩阵换成 4096×4096，同样的代码：GPU 4.5 毫秒，CPU 4.9 毫秒。GPU 成了瓶颈，CPU 反而在等 GPU。这叫 compute-bound。

![Profiler table 4096×4096](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/profiler-table-4096.png)

代码没变。GPU 没变。只是矩阵变大了，就从一种瓶颈类型切换到了另一种。

这是第一个让我停下来的地方：**GPU 时间单独看没有任何意义**。它必须和 CPU 时间放在一起，你才能知道瓶颈在哪个方向。这个道理简单到近乎平凡，但我在实际工作中见过太多人盯着 profiler 里的某个 kernel 时间说"这个太慢了"——而真正的问题可能是 CPU 调度太慢，GPU 在饿着。

三篇文章反复强调的方法论在这里第一次出现：打开 trace 之前，先说你预期看到什么。如果你猜"GPU 应该很慢"，然后发现 GPU 时间只有 23 微秒——mismatch 来了。这个 mismatch 才是信号。

## 融合发生在哪一层？

Part 1 后半段引入了 `torch.compile`。直觉上，compile 应该把 `matmul` 和 `add` 融合成一个更快的 kernel。Trace 里确实只看到一个 `cudaLaunchKernel`（而不是两个），看着像融合了。

但 GPU lane 里仍然有两个 kernel：一个 DtoD memcpy 和一个 GEMM。Inductor 做的事是把 `torch.add(torch.matmul(x, w), b)` 重写成了 `aten::addmm(b, x, w)`——这是一个 dispatch 层的改写，不是 kernel 层的融合。底层跑的 GPU kernel 名字和 eager 模式一模一样。

![Compiled dispatch](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/fused-ops.png)

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-12-pytorch-profiling-guess-first-img-02-dispatch_fusion_vs_kernel_fusion.png)

Part 2 继续往这个方向挖。一个 `nn.Linear` 层在 eager 模式下就已经走了 `aten::addmm`——bias add 被折叠进了 GEMM 的 epilogue（GEMM 算完后顺手做的附加操作，避免把结果写回内存再读一遍）。这意味着 eager 的 `nn.Linear` 已经是 compile 之后的形态。compile 对一个 Linear 层几乎无事可做，反而多出了 Dynamo guard 的开销。

这是一个反直觉的发现：**torch.compile 不是免费的加速**。它对单个 op 是税不是优化。compile 的价值和 op 数量正相关——只有当你有多个 op 可以融合时，compile 才有用武之地。

Part 2 在 MLP 场景下展示了真正的融合：GeLU + mul + reshape 被 Inductor 合并成了一个 Triton kernel。eager 模式下，`gelu(g)` 的中间结果（50MB）要先写到 HBM（GPU 主存），再被 `mul` 读回来。融合后中间结果留在寄存器，省掉了整个 HBM 往返。

fusion 的真正价值在内存，不在 kernel 数量——中间数据不用再跑一趟 HBM。

读到这里我有一个判断：很多文章把 `torch.compile` 宣传成"一行代码加速 2-10 倍"，但 HuggingFace 的系列用 profiler trace 证明了一个更诚实的故事——compile 对你已经写得够好的代码（比如已经在用 `nn.Linear`）帮助有限，它真正的甜区是那些有多个 pointwise op 可以融合的 pipeline。

## Flash 的低占用率为什么是对的？

Part 3 把同样的方法论推到了 attention 场景。最让我意外的不是 Flash 有多快，而是它的 profiler footprint 看起来是"错的"。

Flash attention 报告只有 13% 的 occupancy。按传统 GPU 优化的直觉，低 occupancy 意味着 SM 上没有足够的 warp 来隐藏延迟——应该是个性能问题。但 Flash 是这个系列里最快的 backend。

![Flash occupancy 13%](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-attention-profile/flash-occupancy.png)

为什么？因为 occupancy 和 on-chip reuse 是两个独立的优化轴。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-12-pytorch-profiling-guess-first-img-03-flash_onchip_tile_strategy.png)

高 occupancy 的逻辑是：多放几个 warp 在 SM 上，一个 warp 等内存时另一个 warp 可以算——用数量隐藏延迟。Flash 选择了另一条路：每个 warp 用大量 registers 和 shared memory，把 attention 的中间数据全部留在芯片上，根本不需要访问 HBM。没有 HBM 等待，就不需要隐藏延迟。

128 threads × 255 registers = 32,640 registers per block。Ampere SM 有 65,536 registers，只够放 2 blocks → 8 warps → 13% occupancy。但这不是优化失败，这是故意的设计：用重资源占用换掉 HBM 往返。

**profiler 里的"异常值"往往指向你心智模型里缺的那一块。** 只看 occupancy 数字就做判断，会错过 Flash 真正的设计。

同样的模式出现在 cuDNN backend 上：trace 看起来最干净（零 transpose ops），但 CPU 时间 214 微秒，比 flash 的 138 微秒和 efficient 的 117 微秒都高。那些"消失"的 ops 没有真的消失——它们移进了 cuDNN 库内部的一个 opaque bar，profiler 无法细分。trace 变干净不等于工作消失，有时候只是工作移到了你看不见的地方。

## 先猜再看，不只适用于 GPU

三篇文章里我最喜欢的一个习惯是作者在每个 trace 之前都会停下来，说出他预期会看到什么。"我猜 SDPA 应该比手写 attention 更快更简洁"——然后发现 math backend 有 20 个 kernel，比手写的 5 个还多，慢了 3.7 倍。mismatch 来了。math backend 是 FP32 参考实现，每次 forward 重建 causal mask，用 `_safe_softmax` 防 NaN——正确但慢。

![SDPA math = 20 kernels](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-attention-profile/math-kernel-launches.png)

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-12-pytorch-profiling-guess-first-img-04-kernel_count_comparison.png)

"先猜再看"这个方法论不限于 GPU profiling。我之前读 [SGLang 的 agent 辅助开发文章](https://ntlx.github.io/articles/agent-assisted-sglang-development) 时注意到一个类似的模式：AI agent 写 kernel 代码也需要先有性能预期，再看 profiler 输出，否则 agent 会盲目优化不存在瓶颈的地方。任何你在和复杂系统打交道时——不管系统是 GPU pipeline、分布式训练框架还是一个 agent 工作流——"先猜再看"都是最便宜也最有效的诊断工具。

读完这三篇之后，我回去重看了一些自己以前跑过的 profiler trace。发现一个尴尬的事实：我过去 80% 的 profiling 都是在没有预期的状态下打开 trace，试图从中"读懂"性能。

profiling 不是一种需要专门训练的技能。它是承认你的抽象在撒谎，然后定期去抓它的纪律。在打开 trace 之前就说清你觉得该看到什么，mismatch 自然就是最有价值的信号。

*你平时跑 profiling 的时候会先说出预期吗？还是直接看 trace 试图"读懂"？欢迎聊聊你的习惯。*

## 参考资料

- [Profiling in PyTorch (Part 1): A Beginner's Guide to torch.profiler](https://huggingface.co/blog/torch-profiler)
- [Profiling in PyTorch (Part 2): From nn.Linear to a Fused MLP](https://huggingface.co/blog/torch-mlp-fusion)
- [Profiling in PyTorch (Part 3): Attention is all you profile](https://huggingface.co/blog/torch-attention-profile)
- [PyTorch Performance Tuning Guide](https://docs.pytorch.org/tutorials/recipes/recipes/tuning_guide.html)
- [FlexAttention: PyTorch 灵活性 + FlashAttention 性能](https://www.youtube.com/watch?v=ju-KlcuWlbk)

## 延伸阅读

- [SGLang 这篇文章真正重要的，不是 Agent 会写代码，而是工程组织开始可编译](https://ntlx.github.io/articles/agent-assisted-sglang-development)
- [PRX 四篇读完：训练图像模型，真正难的是闭环](https://ntlx.github.io/articles/photoroom-prx-engineering-loop)
- [缩放定律变成三条之后](https://ntlx.github.io/articles/2026-05-12-amazon-foundation-model-building-blocks)
