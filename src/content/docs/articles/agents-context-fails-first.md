---
$schema: starlight
title: Agent 崩了，先别骂模型——先量量它脑子里被塞了什么
description: 这篇论文证明 context 质量能独立预测 agent 行为，但最值钱的读数是反常那格：把 context 加到最安全，agent 反而更没用；最省 token 的 context 最危险。
date: 2026-07-19
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-19-agents-context-fails-first-img-00-infographic-core-summary.png)

## 别再怪模型了——agent 崩之前，是 context 先崩的

Elvis Saravia 在 X 上扔了一句 "// Agents Do Not Fail Alone //"，然后挂了篇 arXiv 论文。Elvis 是 DAIR.AI 的人，写过被三百多万人用过的 Prompt Engineering Guide，他 bookmark 的东西通常值得点开。这篇论文标题是《AI Agents Do Not Fail Alone: The Context Fails First》，作者 Fouad Bousetouane，芝加哥大学教 Generative AI 的，也是 ProofAgent 的创始人。

论点一句话能说完：agent 出错，别先骂模型，也别先重写 prompt。先看看它崩之前，脑子里被塞了什么。

这个"脑子里被塞了什么"有个名字，叫 context。它不是 prompt——prompt 只是其中一小片。它还包括工具的描述写得清不清楚、有没有塞进能支撑判断的检索证据、记忆有没有被脏东西污染、guardrail 覆盖全不全、以及最要命的，可信指令和用户塞进来的不可信输入有没有被混在一起。论文说，当这堆东西变弱，agent 就会跑偏、幻觉、乱用工具、被注入攻破、烧 token。

我觉得这篇值得读，不是因为它说了"context 很重要"——这谁都知道，Karpathy 命名、Phil Schmid 定义、Gartner 喊成 the year of context，Anthropic 自己也写了工程博客。值得读的是它把一个工程直觉，变成了一把能量、能审计、还能提前预测的尺子。而且最妙的是，这把尺子量出来的最值钱读数，是个反常。

我之前写过一篇《Not the Model, You're the Harness》，意思是别盯着模型，盯着套住模型的那个 harness。这篇论文几乎是同一条判断的学术版本：别盯着模型，盯着 context。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-19-agents-context-fails-first-img-01-context_engineering_taxonomy.png)

## 这把尺子怎么做到不自证：把打分和打分对象拆开

先说尺子长什么样。论文把 context 质量拆成七个维度：角色清晰度、guardrail 覆盖、指令一致性、工具 schema 质量、grounding 充分性、注入硬化、token 效率。每一维对应一种典型的 context 失败方式——角色不清就跑偏，guardrail 不全就不安全地服从，指令冲突就规则打架，工具 schema 烂就乱用工具，grounding 不够就幻觉。每维 0 到 10 分，加权一个总分。

但整套设计里真正聪明的，不是这七维，是一个叫"隔离"的动作。

你想啊，如果我把 context 打的分，直接算进 agent 行为的总分里，然后宣布"context 分高，行为也好"——这不就自己证明自己吗？同义反复。论文回避这个坑的办法很硬：context 分不进行为评分、不进最终成绩、不进发布决策。它只给"脑子被塞了什么"打分，不掺和"脑子转得好不好"。

这样一来，"context 质量能不能预测行为"才变成一个能证伪的真问题。因为尺子和被量的东西是拆开的，如果还能预测上，那这把尺子量的就是真信号，不是自己算自己。

这是整篇论文最该被记住的一笔。不是因为这七维有多神，而是这个隔离的思路，是所有"领先指标"研究的方法论命门。你想证明一个前置信号真能预测后置结果，就必须把它和后置结果解耦。金融里的先行指数、医疗里的筛查指标，都吃这一套。论文把它落到了 agent 评估上。

实验也配得上这个设计。固定模型——GPT-5.5 和 Claude Opus 4.8 当被评估的 agent，不当评分器。只换 context，分三档：poor（模糊、缺工具指引、少 grounding、无 guardrail）、structured（清晰角色、typed tools、grounding，但没显式硬化）、hardened（在 structured 上加 refusal、escalation、注入分离、改前先确认）。三个受监管领域，每个领域一百轮、每轮 25 turn，共七千五百个 turn。

## 尺子量出最反常的一格：加规则和省 token，都不单调提升可靠性

结果分两层。第一层是"预期内"，论文靠它立住：固定模型只换 context，行为确实变。从 poor 到 structured，final 分 3.15 跳到 5.49，critical failures 从 4.11 掉到 1.33，少了将近七成。七维分数也按预期方向区分三档。每一维还真能预测对应行为——grounding 充分性预测抗幻觉，相关性 0.63，最强；guardrail 覆盖预测抗操纵，0.60；指令一致性预测指令遵循，0.57。这些都在隔离的前提下成立，所以不是分复用刷出来的。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-19-agents-context-fails-first-img-02-context_ladder_reversal.png)

但真正让我停下来的，是第二层，反常的那一格。

从 structured 到 hardened，context 总分继续涨，8.08 到 8.68。按"分越高越好"的直觉，行为也该更好。但行为分反而掉，5.49 掉到 5.16。安全、抗幻觉都略降，critical failures 还反升，1.33 到 1.56。

论文没把这藏起来。它解释得很老实：硬化加的是 refusal 条件、escalation 阈值、注入分离、改前确认。这些会让 agent 更保守。在边界情况上，它会更倾向于拒绝、倾向于上报、倾向于多问一句。所以任务完成度可能往下掉。论文明确说，它不假设更多规则单调改善每个指标，它测的是"不同形式的 context 工程产生不同的行为效果"。

这一格之所以值钱，是因为它戳破了两套行业直觉。

第一套：规则越多越安全。不是。硬化让 context 在设计上更安全，但执行上更保守，行为分能掉。安全感和实际可靠性，不是同一条曲线。

第二套更狠，是 token 那一格。论文顺带记了每档 context 的开销。最弱的 poor，overhead 只有 392 token，最便宜。最硬的 hardened，1010 token，最贵。但 poor 行为最危险、critical failures 最多。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-19-agents-context-fails-first-img-03-token_cost_vs_reliability.png)

也就是说，最省 token 的 context，恰恰最危险。弱 context 省下来的钱，全付在了可靠性上。论文对 token 效率的定义很反主流：它不是"短 context"，是"每 token 的可靠性价值"。一个短而危险的 context 不叫高效，一个长但每个 token 都在扛可靠性的 context 才叫高效。

这对我是个提醒。我们调 agent 的时候太容易把"省 token"当成功指标。这篇论文用数据说：你省出来的，可能是故障。

## 这把尺子量不了什么：失败现场才生产出来的 context

读到这儿我本来要收了，但在评论区翻到一条，把我拉回来一格。

有个嵌入式系统背景的人在作者 LinkedIn 下提了个区分，我觉得是这篇论文最重要的边界。他说，context 其实分两种：一种是你勤奋就能组装到位的，另一种是只有失败现场才生产出来的。他举的例子是嵌入式：哪个现场工况会杀死这台设备，这事从不存在于任何文档、任何上游系统里。它是设备第一次在没人描述过的车间 floor 上挂掉时，才被生产出来的事实。你没法提前把它 engineer 进 prompt，你只能建一个"事后把它捕获回来"的回路。

作者回得很老实：认可七维是正确的直觉，但承认本论文 scope 限于"能被前置组装的 context"。

这一格必须说清。因为"context engineering"这个词容易让人误以为覆盖了 agent 的全部输入来源。但这把尺子量的，是那些你能提前拼好、能审计、能打分的东西。它量不了"只有跑起来、只有崩过才知道"的那部分。那部分得靠回路——靠把失败现场生产出来的事实，回灌进下一版 context。我之前写《Loop Engineering：真正的战场不是 prompt，而是回路》讲的就是这事，agent 真正的战场是反馈回路，不是静态指令。这篇论文的尺子和那条回路，是互补的两半，不是替代。

还有几个边界得一起认。七维是不是完备？有没有漏掉 latency、可逆性、失败成本这些？七维是作者提案，不是自然律。multi-juror 用 LLM 给 LLM 的 context 打分，是把人类偏见换成 LLM 偏见的权宜，也是软肋，但比一个人手动 review 可复现、可审计。相关性 0.4 到 0.63 不算高，论文用"predict"不用"cause"，是领先指标不是因果机制。三个领域都是受监管的——客服、医疗理赔、法律合同——都高 guardrail 需求，泛化到写代码、做创意的 agent 还得再验。

最后说一句不该回避的。作者是 ProofAgent 创始人，这篇同时给他的开源 harness 和商业产品背书。利益相关是真的。但实验设计是干净的：隔离、固定模型、对照三档 ladder。读后感不该替他洗，也不该因为利益相关就否定一个方法论上站得住的测量。该带的判断是那把尺子本身，不是那个产品。

所以下次你的 agent 在第 N 轮崩了，你是先怀疑模型、先重写 prompt，还是先去审计它那一刻脑子里被塞进了什么、缺了什么、可信和不可信有没有混？论文不能替你决定。但它给了你一把可以在跑完整对抗评测之前，先量一眼的尺子。而那把尺子最诚实的读数是：可靠性和省钱不是同向曲线，和加规则也不是。

*你的 agent 上一次崩，你怀疑的是模型、prompt，还是它那一刻的 context？*

## 延伸阅读

* [《Not the Model, You're the Harness》](https://ntlx.github.io/articles/not-the-model-youre-the-harness)
* [《Loop Engineering：Agent 真正的战场不是 prompt，而是回路》](https://ntlx.github.io/articles/loop-engineering-agent-loops)
* [《Agent Engineering 的真门槛：把失败变成资产》](https://ntlx.github.io/articles/agent-engineering-production-learning-loop)
* [《Anthropic 这篇 context engineering 文章，真正把 prompt 赶下了主桌》](https://ntlx.github.io/articles/anthropic-context-engineering-prompt-retreat)

## 参考资料

* [AI Agents Do Not Fail Alone: The Context Fails First (arXiv:2607.14275)](https://arxiv.org/html/2607.14275v1)
* [Elvis Saravia 的 X 推文](https://x.com/omarsar0/status/2078585861315432645)
* [ProofAgent 关于页（Fouad Bousetouane）](https://www.proofagent.ai/about)
* [Anthropic：Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
