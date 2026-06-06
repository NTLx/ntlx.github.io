---
$schema: starlight
title: 3B 模型跑出了 1929：那不是聪明，是约束
description: "没人相信 3B 模型能跑出真实涌现，但 Lester Leong 用 5 只森林生物 + 1929 银行挤兑的 reskin，把\"小是限制\"翻成了\"小是设计\"。稀缺性、role-locked prompt、宽容解析——约束催生工程美学。"
date: 2026-06-06
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-06-small-models-as-design-img-00-infographic-core-summary.png)

Lester Leong 的 Thousand Token Wood 用 5 个 Qwen2.5-3B agent 跑出了一个会崩盘、会分化、会回放 1929 bank run 的微型经济。它在用工程证明一件事：把"小"当约束，约束催生工程美学。

这话成立的前提是什么？前提是：当"大模型能解决一切"还停留在口号上时，用小模型去做"用小做不出来"的事，反而逼出了更扎实的工程。

读 Lester 的具体技术债，会撞见一个反常识的事实：3B 模型 100% 输出合法 JSON，但会"产橡子的生物挂单买橡子"——JSON 稳、推理糟。这不是 bug，是当前所有小模型共有的特征。Qwen 官方自己说 Qwen2.5-3B 性能"可比" Qwen2-7B——但"可比"是 benchmark 语言，不是生产语言。在 production 里跑过的人都懂，benchmark 上的接近，到了真实任务上就是天差地别。

那 Lester 的解法是什么？不是换模型，是更尖锐的 prompt。他告诉每只 agent 你生产什么、绝不能买什么，再给一个 worked example。决策质量立刻上去了。整段循环再裹一层"宽容的 JSON parse-and-repair"——畸形输出退化为 no-op，不让整个模拟崩。

这件事值得停一下：小模型的工程重点不是把模型做大，是用结构与提示词缩窄格式生成与不可靠推理之间的鸿沟。

## 为什么是经济模拟，不是奥赛题

那为什么不直接让 3B 模型去解奥赛题，而去跑经济模拟？因为经济模拟有一种稀缺的特性——涌现。把 5 个 agent 放进"有稀缺、有交换、有失败成本"的环境里，集体行为会超出任何单只 agent 的能力边界。崩盘、银行挤兑、贫富分化，这些是系统属性，不是 agent 属性。

Lester 第一版学到一课：如果生产 > 消费，经济"胎死腹中"——每只生物都自给自足，没有交易理由。修法是工程化稀缺：让木匠的柴只能给一只生物取暖，冬天来时大家抢。

对所有做 multi-agent system 的人，这条经验都成立。涌现系统需要被设计稀缺；丰盈很无聊。那些"多 agent 协作写代码"的 demo，十有八九死在"agent 互相等"上——本质就是没稀缺。

## 3B 跑出 1929，是真的

3B agent 跑出来的"银行挤兑"，是真的涌现，还是 flavor text？

Lester 的回答很硬：这些不是 flavor text，每个传说触发真实冲击，agent 真的反应。玩家画一个"奥娜金库挤兑"（1929 bank run 的 reskin），传猫头鹰金库空了的谣言，Oona 开始抛蜂蜜筹鹅卵石，蜂蜜价从 10 砸到 3。Gini 系数从 0.14 漂移到 0.38。贫富有机器化加速度。

——这只在 3B 模型上跑出来。

我想停一下。Sergey Kryazhev 在 LessWrong 上写过一篇《Emergent AI Society》，论证资源稀缺会迫使 web 上的 AI agent 自发形成自我调节的社会、文化、经济、政府——无需自我意识。那是哲学论证。Lester 把它做成了可戳的玩具：打开 Space，戳一下森林，1929 来了。

## 范式在悄悄转

回到第一句：小模型是设计，不是限制。这话还站着，但变硬了。它不再是"小模型够用"的辩护，而是"约束催生工程美学"——Lester 不得不发明一套"工程化稀缺 + 宽容解析 + 角色锁定 prompt + mean-reverting mood" 来让 3B 撑住 5 个 agent 的经济，这套东西恰恰是大模型时代被掩盖的"用结构换能力"的传统手艺。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-06-small-models-as-design-img-01-small_model_constraint.png)

它的根是 Hugging Face 2025 年发起的 Build Small Hackathon：≤32B 限制 + Gradio Spaces 强约束 + 25,000 美元奖金。这套限制在"越大越像人"的军备竞赛里是异类。但 reddit r/AI\_Agents 上一条被反复转的工程经验是"我们 80% 的 agent 任务路由到小模型"——小模型是上限还是方向？范式已经在悄悄转。

工具栈也变了。vLLM + Modal + Gradio 三件套把"5 个 agent × N 回合"压到毫秒级实时。这是基础设施在撑腰。没有 vLLM 的 batched inference + Modal 的 serverless GPU，3B 模型也能跑，但跑不出"实时"；跑不出"实时"，就没有"可观察的涌现"。

底是这一句：3B 跑出 1929，不是模型有多聪明，是约束逼出了工程，工程逼出了涌现。

接下来怎么走，我不知道。Lester 在文末说"small models, big adventures"——这话是洒脱，也是诚实。他真不知道下一步是什么。但他知道一件事：先把"小"当设计来用，别当限制来忍。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-06-small-models-as-design-img-02-engineering_aesthetic.png)

*你会用 3B 模型跑一个完整的多 agent 模拟吗？还是说"小模型只能跑单轮"是老黄历了？*

## 原文参考

> Lester Leong. *Thousand Token Wood: shipping a multi-agent economy on a 3B model*. Build Small Hackathon Field Report, Hugging Face Blog, 2025-08.
> <https://huggingface.co/blog/build-small-hackathon/thousand-token-wood-sim>
