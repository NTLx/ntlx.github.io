---
$schema: starlight
title: 当涌现行为消失之后：小模型经济体的确定性教训
description: 涌现是偶然的，不是属性——换一批 agent，你记录到的行为可以凭空蒸发。可靠的结果不来自冲击输入，而来自在决策下游写入确定性。
date: 2026-06-12
category: ai-industry
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-12-emergence-disappears-small-model-economy-img-00-infographic-core-summary.png)

Lester Leong 在 Hugging Face 的 Build Small Hackathon 上做了个实验：五个小型语言模型各扮演一个森林生物，在微型市场里交易蜂蜜。他想证明一件事——给小模型一个角色和预算，市场行为会自己涌现出来。

第一版跑通了。一个 Qwen2.5-3B 驱动五个生物，作者释放一个"银行挤兑"传说，猫头鹰读到恐慌后抛售蜂蜜，价格从 10 跌到 3。没人预设这个结果。模型自己选择了抛售，抛售自己压低了价格。

然后他把五个生物换成五个不同实验室的小模型——OpenAI、NVIDIA、OpenBMB，加上一个他自己微调的 500M 参数模型。用同样的策略做空蜂蜜、释放同样的恐慌传说。蜂蜜价格不跌反涨。五个模型选择囤积，把解读从"恐慌"翻转成"稀缺"。做空亏了 15 颗鹅卵石。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-12-emergence-disappears-small-model-economy-img-01-multi_model_council.png)

*为什么同样的传说，换一批 agent 就不灵了？*

Leong 尝试了三次修复。第一次，纯传说不加干预——模型不卖。第二次，往每个生物的库存里倾泻蜂蜜，期待供过于求压垮价格。这个操作在他的测试策略（一个规则引擎替代品）上完美生效，但五个真实模型完全无视倾销，按自己的判断交易。第三次，加大做空仓位——亏损从 15 扩大到 26、27。

三次尝试，三次亏损。你拉的每一个杠杆都是对 agent 决策的输入，而 agent 有权拒绝。五个不同架构的模型不会像规则引擎那样机械响应 supply/demand shock。它们读的是"房间里的氛围"，不是你的供给曲线。

这里有一个更隐蔽的陷阱。Leong 有个便宜的测试策略用于快速离线测试，它在倾销场景下确实崩溃了。这给了他虚假信心——"这个方法可行"。但测试策略和真实模型的行为不一致时，测试策略在撒谎。任何只在替代品下复现的结果，都不是结果。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-12-emergence-disappears-small-model-economy-img-02-test_vs_real.png)

*解法不在上游，在接缝。*

最终起作用的方案是：放弃说服 agent，转而在结算后直接覆盖参考价格。agent 们自由交易整轮——囤积也好、抛售也好、无视恐慌也好——然后"崩溃"作为确定性事实降临。蜂蜜价格减半，做空获利 40 颗鹅卵石。

这听起来像放弃涌现，其实是相反的事。agent 层仍然在做让这个微型经济体"活"起来的全部工作——五个模型交易、八卦、囤积、形成偏好。Leong 学到的是：你不能通过加大冲击力度从涌现中获得可靠结果。你得找到那个精确的接缝——决策已经完成、但结果还没落定的那一刻——然后在接缝处写入确定性覆盖。涌现负责质感，确定性负责那些必须发生的时刻。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-12-emergence-disappears-small-model-economy-img-03-seam_control.png)

*这三个教训不只适用于游戏。*

涌现是偶然的，不是属性。你在一批 agent 身上观察到并写成报告的行为，换一批 agent 就可以消失。把单次惊艳的运行当轶事，不当性质，直到它在不同的群体下存活。

你不能通过冲击输入来控制 agent 市场。supply/demand 杠杆只是偏向选择，agent 仍然自由拒绝。可靠结果来自在决策下游的结算接缝处写入确定性覆盖，而不是在上游更用力地推。

让你快速迭代的便宜模拟器，也是最可能美化错误修复的那个。当替代品和真实 agent 不一致时，相信 agent。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-12-emergence-disappears-small-model-economy-img-04-academic_context.png)

这三点在 agent-based modeling 学术圈不算新鲜。arXiv 上 2312.11970 的综述已经指出 LLM agent 行为的多样性和不可预测性；Agent Bazaar（2605.17698）研究了 LLM 作为经济 agent 时集体行为放大波动的系统性风险。但 Leong 的贡献不在发现新现象，在于用一堆鹅卵石和一个森林故事把这件事讲清楚了——而且是以一个踩过坑的人的口吻，不是论文的口吻。

我自己做 agent-based market model 的时候，也在更大的规模和更高的赌注上犯过同样的错误。在一堆鹅卵石和一个讲得太自信的故事面前重犯一遍，反而有用——风险低到可以诚实面对自己到底错在哪。

小模型，大冒险，以及一个你必须亲手写的崩溃。

*你有没有在自己的 agent 实验中遇到过"涌现行为换一批 agent 就消失"的情况？你是怎么处理的？*

## 原文参考

> Lester Leong (AdmiralTaco), "The crash that vanished: control and emergence in a five-model economy", Hugging Face Blog, Build Small Hackathon 系列第三篇, June 8, 2026
> <https://huggingface.co/blog/build-small-hackathon/thousand-token-wood-sim-v3>
