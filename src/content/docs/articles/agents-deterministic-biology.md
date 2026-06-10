---
$schema: starlight
title: 当 AI 智能体闯进生物学老城
description: "AI Agent 搞不定生物数据，不是不够聪明，是脚下没有路。Anthropic 的实验暴露了一条反直觉法则：智能越高，底层越需要\"笨\"——把确定性藏在创造力下面，99.7% 的准确率靠的不是更强的模型，而是一个不会思考的检索层。"
date: 2026-06-10
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-10-agents-deterministic-biology-img-00-infographic-core-summary.png)

Anthropic 上周发了一篇文章，讲 AI Agent 怎么在生物学里碰壁。读完之后我一直在想一个问题：为什么最强的模型，连"帮我查一下埃博拉病毒的序列"这种看似简单的事都做不稳？

答案不在模型身上。在脚下。

## 老城与汽车

Laura Luebbert 打了这样一个比方：用 AI Agent 导航生物数据基础设施，就像开汽车穿越一座为步行设计的老城。路是窄的，弯是急的，再好的车也跑不起来。

软件世界天然适合 Agent——API 文档清楚，包管理器标准化，测试能告诉你对不对。生物信息学是另一回事：NCBI Virus 的过滤逻辑只存在于 Web 界面上，你想程序化检索一批 SARS-CoV-2 序列？先写几百行脚本，粘合 REST、Datasets、E-utilities 三套 API，下几百 GB 数据，再在本地扔掉大部分。

Karpathy 前阵子吐槽 vibe-coding 一个 web app 的经历——"代码是最简单的部分！大部分工作是在浏览器里点来点去。"生物学研究者听这话大概会苦笑：你说的这种痛，我们忍了二十年了。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-10-agents-deterministic-biology-img-01-old-city-metaphor.png)

## 三次运行，三个答案

Anthropic 团队做了一个叫 VirBench 的基准测试：120 个病毒序列查询，覆盖 40 种病原体，让 Claude、GPT、Biomni、Edison Analysis 自己去 NCBI Virus 上找答案。

最强的模型 GPT-5.5 平均准确率 91.3%。最弱的 Sonnet 4 只有 16.9%。听起来还行？不是的。病毒序列检索这件事，准确率的标准是 100%——少一条记录，可能意味着诊断试剂漏掉了某个正在流行的变异株。

更让人不安的是*不稳定性*。同一个 Ebolavirus 查询，Sonnet 4 跑了三次：第一次返回 106 条序列，第二次 15 条，第三次 5 条。正确答案是 266。

这不是"模型不够强"。这是模型在猜。

## 1922 年的埃博拉

这种不稳定的后果不是学术上的——它会直接改变生物学的结论。

团队把 Sonnet 4 三次检索到的序列分别构建了系统发育树。一个正确的树告诉你：2014 年西非埃博拉疫情大约在 2014 年 1 月起源。但有一棵用不完整序列构建的树，把起源时间推到了 1922 年。

1922 年。差了一个世纪。

同样的混乱出现在抗体治疗分析中。检查埃博拉糖蛋白上哪些位点已经突变过、会不会影响药物效果——三次检索，三次不同的突变图谱，三次不同的"这个药还管用吗"的判断。

细节看起来只是检索上的小差错，但传播到下游，就变成了完全不同的科学叙事。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-10-agents-deterministic-biology-img-02-virbench-comparison.png)

## 把确定性藏在创造力下面

然后 Anthropic 做了一件看起来不那么"AI"的事：他们加了 gget virus，一个确定性检索层。

gget virus 不做推理。不会"理解"查询意图。它就是老老实实地协调 NCBI Virus 底层的多套 API，把 Web 界面上那些人类手动点击的过滤逻辑，翻译成可复现的程序调用。

加上它之后，所有 Agent 的准确率都超过了 90%。GPT-5.5 达到 99.7%。运行间的变异基本消失。模型选择变得不重要——便宜的模型配上趁手的工具，比最贵的模型裸奔更可靠。

这个结果说出了一条反直觉的工程法则：*智能越高，底层越需要"笨"*。

创造力层——假设生成、实验设计、机制推理——应该灵活。但创造力脚下的那一层——基因 ID、坐标系统、过滤逻辑、元数据规范——必须 boringly reliable。不能商量，不能猜测，不能"看起来大概对"。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-10-agents-deterministic-biology-img-03-two-layer-architecture.png)

## 这条线画在哪里

文章让我想到一个更大的问题：我们正在进入一个需要重新划线的时代。

哪些工作应该交给 Agent 的灵活推理？哪些必须锁死在确定性工具里？这条线的位置决定了整个系统的可靠性和成本。画错了——要么 Agent 在不可靠的数据上做出看似合理实则错误的判断，要么过度工程化，把本可以让 Agent 灵活处理的东西也硬编码成脚本。

Benchling 的 2026 Biotech AI Report 印证了这一点：100 家生物技术公司中，AI 在发现阶段已经开始产生实际收益，但数据和工作流障碍仍是最大瓶颈。Owkin 在构建生物学 Agent 基础设施平台。ToolUniverse、Edison Scientific's Robin、Biomni——都在试图解决同一个问题：怎么让 Agent 可靠地触达生物数据。

这不是 virology 特有的问题。任何领域，只要正确答案不能靠"多数投票"确定——法律、金融、医疗、工程——都需要在某个点上停下来，说：这里，不能用概率，要确定性。

Anthropic 这篇文章给我的最大冲击不是数据和图表。是这个判断：即使未来 Agent 自己能搞定混乱的界面，也不该每次都让它重新发明轮子。成本、速度、可审计性、可复现性——这些不会因为模型变强而自动解决。

2026 年 5 月，Bundibugyo 埃博拉在刚果爆发，至今超千人感染，两百多人死亡。研究者急需回答三个问题：这个病毒跟以前的埃博拉有多不一样？现有诊断方法还管用吗？现有药物还有效吗？回答这些问题，第一步就是从 NCBI Virus 检索历史序列。

这一步不能猜。

***

*你所在的领域里，有哪些"人类手动点来点去但 Agent 根本无法可靠操作"的环节？如果让你画那条线——哪些交给 Agent，哪些锁死在工具里——你会画在哪里？*

## 原文参考

> Laura Luebbert, "Paving the way for agents in biology", Anthropic Science, 2026-06-08
> <https://www.anthropic.com/research/agents-in-biology>
>
> Nasri et al., "Deterministic access to global viral sequence data enables robust scientific AI agents", arXiv:2606.06749, 2026
> <https://arxiv.org/html/2606.06749v1>
