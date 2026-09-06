---
$schema: starlight
title: 谁决定什么叫好看？读 Hugging Face 的 Train to Paint with Code
description: 模型不会凭空学会“好看”：它优化的是由样本池、动作边界、裁判和反馈可靠性共同写出的审美制度。
date: 2026-09-06
category: ai-models
primarySourceUrls: ["https://huggingface.co/blog/train-to-paint-with-code"]
---

178 幅画、三种 reward mix，还有一次把 timeout 当成 0 分的故障，这些数字比“模型学会画水彩”更能说明问题。我读到这里时，先想问的不是哪一张最好看，而是谁把“最好看”写进了训练回路。

Hugging Face 的[这篇复现记录](https://huggingface.co/blog/train-to-paint-with-code)讲的是 Sergio Paniego 如何用 TRL、OpenEnv 和 `p5.brush`，让一个 coding model 通过写 JavaScript 生成水彩画，再用 HPSv3 与 pairwise judge 做强化学习。在我看来，这次训练实际落到了一套由样本池、动作边界、裁判和运行基础设施共同定义的判断环境上，而不是抽象的审美本身。模型能做的，是放大这套环境已经允许它赢的偏好。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-06-train-to-paint-with-code-img-00-infographic-core-summary.png)

## 谁把“好看”写进了 reward

这次的 taste 不在模型脑中，也不只在一句“画得像水彩”的提示词里。它先落在 178 幅 reference pool 里：作者把模型生成的画分成自己偏好的 `love` 和次一级的 `okay`，再让候选画与随机抽到的 4 张参考图比较。样本池不是普通示例集，它在给裁判一个可比较的答案：哪些结果值得赢，哪些差一点也可以接受。

原文把 reward 拆成四项：检查能否编译、确实落笔且没有作弊的 `gate` 占 0.05，鼓励代码更长的 `length` 占 0.05，pairwise judge 占 0.60，HPSv3 占 0.30。HPSv3 是一个已有的图像偏好模型，较像从大量人类选择里学到的平均口味；pairwise judge 则把候选与这次手工挑选的参考图并排比较，较贴近作者写下的 bleed、半透明水洗和柔软边缘这些标准。两者都不是中立的审美仪器，只是不同来源的偏好代理。

GRPO 在这里没有发明审美。它做的事很朴素：同一个 prompt 生成一组结果，按组内 reward 排出相对胜负，再把 policy 往更容易赢的方向推。在这个流程里，谁能赢先由 pool 和裁判决定，优化器只负责把这套胜法重复得更稳定。审美进入 reward 后，人的感觉就被改写成了一组可采样、可比较、可放大的制度规则。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-06-train-to-paint-with-code-img-01-source-reward-pipeline.png)

## 约束不是审美的敌人，它是风格的来源

模型并不是拿着一块空白画布自由发挥。它要写大约 150 行 JavaScript，最终由 `p5.brush` 渲染；这个库本来有 47 个方法，作者只在 prompt 和 allowlist 中放行 10 个，包括填充、形状、顶点和 bleed。线条、hatching、自定义 brush 等路径被关掉了，纸张纹理和笔触扩散则由库统一提供。

这组限制先把媒介固定下来。模型不能随便换画法，才更容易在同一种水彩语法里探索；它学到的仍是“在这十个动作里怎样更容易得分”，不能直接叫作开放式绘画能力。`gate` 也在定义训练能接受什么：它会拦住直接调用普通 p5、空 canvas，或把文字画上去冒充作品的代码。允许什么、拒绝什么，都会落到最后的画面上。

我尤其在意代码这一层。原文展示了一段生成的 `draw()` 和它渲染出的画，代码里的注释、形状顺序和重复画花瓣，都是模型留下的决策轨迹。最终图像来自可读动作经过固定渲染器后的结果。以后看到某个模型的风格变得稳定，我会先问它的动作空间被谁收窄了，而不是马上把稳定归功于模型获得了更深的审美。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-06-train-to-paint-with-code-img-02-source-sketch-and-render.png)

## 三条曲线先清坏，再争好

原文报告的第一层变化很一致：三个 run 都先减少近乎空白的 canvas 和没有形状的 wash，低于 0.3 的坏画变少。`hps-only` 的 group mean 增长，作者估计约四分之三来自坏结果被清掉；两个含 judge 的 run 里，低分 rollout 也分别从 99 降到 16、从 37 降到 4。这个结果更像把底线做实了，还不是突然出现了艺术突破。

`hps-only` 的 median 在整个 run 中上升约 0.155，best 只上升约 0.034。进步主要发生在分布中间：普通样本变得不那么糟，而不是那张冠军作品突然高出一截。原文还报告，加入 judge 后 paint coverage 从 0.11 走到 0.23、从 0.13 走到 0.30；作者据此认为 pairwise judge 更可能推动好结果之间的风格和上限。

我接受这个方向，但不会把它读成已经完成的因果证明。`hps-only` 在 60 steps 停止，两个 judge run 训练到 110 steps；这是一次作者自报的开放复现，不是多 seed、独立人工盲评和 held-out pool 的严格对照实验。更稳妥的说法是：通用偏好模型在这次设置里较擅长先清掉坏画，参考池可能把优化继续推向某种风格；“可能”来自实验边界，不是客套。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-06-train-to-paint-with-code-img-03-source-median-vs-best.png)

## 曲线变好之前，先审计反馈会不会撒谎

我最在意的，反而是 reward 数字差点不能相信。初版里，渲染超时或 scorer 不响应会返回 `0.0`，合计约影响 1.5% 的 rollout，最差的 run 达到 5.2%。这会把“基础设施坏了”伪装成“模型画得差”。作者后来改成返回 `None`，把失败 rollout 从 group 中排除，还报告修复了 OpenEnv 的持久 websocket 缓存问题。每一步大约要 15–18 分钟，其中 70%–80% 花在软件渲染上，反馈链本身并不便宜，也不天然可靠。

抽样也会改写曲线。pairwise judge 每一步随机抽 4 张 reference，某一步抽到更难的组合，分数就可能下降；原文拿连续两步的画面提醒读者，step 12 比 step 11 低半分，未必意味着画面真的退步。因此 median、best、单次比较胜率和失败率必须一起看。好看的曲线只是信号，不能单独替模型宣布“我学会了”。

我不完全接受“AI 把瓶颈从 making 推向 noticing”这句宽泛的总结。更准确地说，noticing 现在对应的是策展、评分、拒绝、故障排除和审计几项工程责任；它仍不等于一个更大的“审美分数”。这和我之前读[《PRX 四篇读完：训练图像模型，真正难的是闭环》](https://ntlx.github.io/articles/photoroom-prx-engineering-loop)时留下的判断接上了：PRX 暴露的是数据如何控制训练闭环，这次暴露的是 reward 如何控制审美闭环。前者的控制面是数据与训练流程，后者的控制面是 pool 与裁判，二者都说明模型能力的上限常藏在模型外面。

所以我会把这套方法迁移到别的任务，但先做一张 reward 审计表：样本池由谁选、`love/okay` 如何分层、动作 allowlist 排除了什么、timeout 如何记、median 和 best 是否同时报告、是否有 held-out 样本和独立人工盲评。我的可验证预测是：如果继续固定单一 hibiscus subject，并使用同质的 reference pool，训练会优先提高一致性，同时压低 variety；pool 越多样，策展和评估成本越高，但风格边界才可能打开。

这条判断也有边界：178 幅画全部由模型生成，任务只有一个 subject，原文没有在本任务中独立重跑这些 H200、judge 或曲线。因此现在最多能说这套评分制度在自我强化；只有当多 seed、独立人工盲评和 held-out pool 仍给出同方向结果，才更接近“模型学到了某种风格”。

如果把这套方法换成你正在做的模型或 Agent，你会先审计样本池、动作边界，还是失败反馈？

## 参考资料

- [Training a coding model to paint watercolours with TRL and OpenEnv（Hugging Face，本文唯一 primary source）](https://huggingface.co/blog/train-to-paint-with-code)
- [R[L]ing Qwen to Paint with Code（Surya Narreddi 的原始项目说明）](https://surya.website/rling-qwen-to-paint-with-code)
- [TRL GRPO Trainer 文档](https://huggingface.co/docs/trl/grpo_trainer)
- [OpenEnv PR #1103](https://github.com/huggingface/OpenEnv/pull/1103)
- [p5.brush 官方仓库](https://github.com/acamposuribe/p5.brush)
