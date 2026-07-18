---
$schema: starlight
title: 读完 OpenAI 的 AI 记分卡：量的是活，称的是价
description: "OpenAI CFO 提了张衡量 AI 价值的记分卡，四个维度听着客观。但\"什么算有用工作\"的定义权被悄悄攥在供方手里——这是一份用财务语言写的、有利于前沿模型高价的度量框架，有用，但别当中立天平。"
date: 2026-07-18
category: ai-industry
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-18-openai-ai-scorecard-read-img-00-infographic-core-summary.png)

## 先说清楚这张卡在量什么

OpenAI 的 CFO Sarah Friar 发了篇《A scorecard for the AI age》。通篇就一个动作：把"AI 值不值"这把尺子，从"买了多少席位、多少人在用、续没续费"换成了"干完了多少活"。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-18-openai-ai-scorecard-read-img-01-adoption_to_work_metric_shift.png)

这个换法我信一半。

信的那一半：用采用率衡量软件这套老规矩搁在 AI 身上确实不对。你给团队买了一千个 Copilot 席位，人人都登录了，活跃率漂亮。可要是没人真的让它合代码，合了也没过测试，这一千个席位就是一千张白条。Friar 说得对，token 只有变成人能用的成果才算数，不然就是热热闹闹烧钱。我之前写过一篇 [Tokenpocalypse](https://ntlx.github.io/articles/tokenpocalypse-ai-token-cost)，吐槽的就是这事：AI 账单好量化，AI 产出难量化，账单和产出之间对不上账。

不信的那一半在后面：这张卡到底是谁的卡。

## token 单价为什么会骗人

Friar 这一节算给得最实。她说单看"每 token 成本"会骗人：便宜模型单价低，但拿到好结果可能要重试好几遍、要人盯、要返工；贵模型一次过，反倒更省。真正要比的是"一次成功结果的完整成本"。

公式摆出来很朴素：把干活的全部花费加起来，除以"做成了几件"。token 钱、人盯的时间、重试的损耗、返工的工时，全算上。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-18-openai-ai-scorecard-read-img-02-cost_per_successful_task_formula.png)

这一步我完全认。光比 token 单价确实是耍流氓。这跟买打印机比的是单张纸成本，但有人打印一次卡纸三次，纸再便宜也白搭。

但往下看，她顺手把自家货摆上了货架。GPT-5.6 三档：Sol 旗舰、Terra 平衡、Luna 最便宜。她说客户该按"任务经济性"选：量大快的活用 Luna，要深度的用 Terra，要强推理一次到位的用 Sol。话本身没毛病。

毛病在引的两条基准。GPT-5.6 发布稿（7 月 9 日）引的是 Artificial Analysis Coding Agent Index，说打 80 分、超 Claude Fable 5 两点八，还少用一半 token。这篇记分卡（7 月 17 日）换成了 DeepSWE v1.1，说 GPT-5.6 Sol 72.7%、超 Fable 5 的 69.9%、估测成本低 36.2%。

两套基准，两套数字，都对得上"我们更强还更省"这个结论。我不是说数字造假，是想指出一件小事：**挑哪把尺子量，本身就是话术。** 量短题的尺和量长周期工程任务的尺不一样，场合一换尺就换，结论永远是"我们赢"。这不是 OpenAI 一家的事，是全行业的事。可记分卡要是真中立，就该把所有尺都摆出来，让客户自己挑。

## "成功"这一刀，是谁切的

第三个维度叫 dependability，可信赖。Friar 让团队盯三个数：交付即能用、要返工、得人接手收尾。前两档省时间，第三档反噬时间。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-18-openai-ai-scorecard-read-img-03-dependability_three_state_funnel.png)

这套我也认。比模型准确率贴业务。准确率 95% 没告诉你那 5% 的错要多少人去擦屁股，三态追踪会告诉你。

但同一节里她轻描淡写带过一句最要命的话：AI 从起草走向动手前，组织要"定义它能访问什么数据、能改什么系统、什么时点要人审批"。安全、隐私、合规、管控，是深化使用的前提。

读到这句我停了一下。她说的是组织自己定义边界。可通篇四个维度，每个维度的例子都是 ChatGPT Work：客服单解决靠它、财务对账靠它、合同审完靠它。**定指标的是 OpenAI，举的例子的也是 OpenAI 的产品，连"成功"长什么样的样板都是它给的。** 裁判下场踢球了。

更深的茬在前面那个公式里。单成功任务成本 = 完整成本 ÷ 达标任务数。分母是"达标任务数"。达标不达标，谁来定？Friar 给了句很合理的话："在活发生的那个系统里定义 done"。客服就是工单闭环，工程就是代码过测试，法务就是合同按时审完。

听着中立。可一旦供方把"最佳实践 done 模板"端到你面前，你照着填，你的"成功"就长成了它产品的形状。你以为在量自己的产出，其实量的是它产品量出来的那个数。**谁定指标，谁就定游戏规则。剩下那句更要命："成功"这一刀切在谁手里，谁就定得了价。**

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-18-openai-ai-scorecard-read-img-04-vendor_friendly_metric_loop.png)

这条才是我读完最想说的。这张卡不假，但它把第五件事悄悄包进了前四件里，叫定价权。Useful Intelligence per Dollar 听着像中立天平，其实是个供方友好的秤砣：它把"更贵但一次过"正当化，正好给前沿模型的高价撑腰，而 OpenAI 卖的就是前沿模型。

## 规模化和那个复利故事

第四个维度讲规模化：盯同一个工作流，看完成量是不是比总成本涨得快。Friar 说算力是中心，训练造未来能力，推理交付今天的活。更好的模型、更高效的推理、专用硬件、更高利用率，都在提升每块算力的回报。然后她画了个圈：基建加速研究 → 更强更高效的模型 → 更好的产品 → 更广采纳 → 更高收入 → 再投下一代。OpenAI 把这些全拢进一个共享平台，一层改进，所有客户受益。

这圈本身不算假。算力成本曲线下行是真的，模型代际变强变便宜也是真的。[我们之前也聊过预算烧穿和产品契合点的事](https://ntlx.github.io/articles/ai-pmf-budget-overrun-signal)，AI 经济学确实在往"更便宜地干更多活"走。

可这圈是个飞轮叙事，飞轮叙事的特点是：一旦你信了它转得起来，你就愿意为"还没转起来那段"付高价。供方最爱飞轮，它把"现在贵"解释成"为将来更便宜垫的底"。Friar 是 CFO，CFO 讲飞轮，你得多留个心眼。

## 那我该带走什么

讲到这里，怕给人留个"这篇就是抬杠"的印象，得说清楚。

这张记分卡的四个维度，我认。拿"完成的工作"去替代"采用率"，是对的方向。拿"单成功任务成本"去比 token 单价，也比得对。dependability 那三态，比一句笼统的准确率更贴业务。你们团队要是还没建过任何 AI 度量，照这四问开头，不丢人。

但带走它的时候，得连那第五件事一起带走：**卡是我自己的卡，"成功"由我定义，不由供方定义。** Friar 给的 done 模板（工单闭环、代码过测试、合同审完）是起点不是终点。你真正要量的是：这活在我这儿、在我的客户那儿、闭环了没、值不值，得用你的尺量，不是用 OpenAI 端上来的样板量。

一句话：建自己的卡，量自己的活，别把"什么算有用工作"的定义权，连同账单一起外包出去。

*你团队现在拿什么量 AI 的产出？是 token 数、工时省了多少、还是真去看了"做成了几件"？如果还没建过任何卡，你打算让谁来定"成功"长什么样？*

## 参考资料

- [A scorecard for the AI age — OpenAI](https://openai.com/index/a-scorecard-for-the-ai-age/)
- [GPT-5.6: Frontier intelligence that scales with your ambition — OpenAI](https://openai.com/index/gpt-5-6/)
- [GPT-5.6 benchmarks across Intelligence, Speed and Cost — Artificial Analysis](https://artificialanalysis.ai/articles/gpt-5-6-has-landed)
- [DeepSWE: Measuring Frontier Coding Agents on Original, Long-Horizon Engineering Tasks — arXiv](https://arxiv.org/html/2607.07946)
- [Sarah Friar — Wikipedia](https://en.wikipedia.org/wiki/Sarah_Friar)
- [OpenAI hires former Nextdoor CEO Sarah Friar as first CFO — Reuters](https://www.reuters.com/technology/openai-hires-sarah-friar-cfo-2024-06-10/)

## 延伸阅读

- [Tokenpocalypse：当你发现 AI 账单比 AI 产出更好量化](https://ntlx.github.io/articles/tokenpocalypse-ai-token-cost)
- [当 AI 公司的客户烧光预算，产品市场契合点反而到了](https://ntlx.github.io/articles/ai-pmf-budget-overrun-signal)
- [Agentic Workflow 烧掉的钱去哪了？GitHub 用 Agent 优化 Agent 的实战复盘](https://ntlx.github.io/articles/token-efficiency)
- [当法务开始写代码——OpenAI 这篇 Codex 数据报告，藏着比 AI 替代人更深的信号](https://ntlx.github.io/articles/codex-agents-dissolving-job-boundaries)



