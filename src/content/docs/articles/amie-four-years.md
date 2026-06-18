---
$schema: starlight
title: AMIE 的两年半：从模拟病人到万人临床试验
description: Google 的医疗 AI 走完了一条新药式证据链——从模拟门诊到真实病房再到全国 RCT。但真正的考试才刚开始。
date: 2026-06-18
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-18-amie-four-years-img-00-infographic-core-summary-1.png)

## 一个 AI 的四场考试

Google 在两年半里发了四篇关于 AMIE 的研究博客。单看每一篇都有各自的话题：诊断、管理、临床可行性、全国试验。但把它们串起来看，会发现一件更有意思的事：*Google 在给一个 AI 系统走新药式的证据链*。

2024 年 1 月，AMIE 第一次亮相，在模拟门诊里跟 20 名全科医生对打。2025 年 3 月，它从"会诊断"升级到了"会开处方"，学会了跨多次就诊跟踪病人。2026 年 3 月，它走进了一家真实的医院急诊室，面对 100 个活生生的患者。2026 年 6 月，Google 宣布要跟 Included Health 合作做全国随机对照试验。

这条路线——体外实验、动物模型、临床一期、多中心 RCT——跟新药上市的路径几乎一模一样。只是"药物"换成了"算法"。

## 模拟门诊：28/32 的胜利

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-18-amie-four-years-img-01-amie-osce-diagnostic-simulation-1.png)

第一篇博客讲的是 AMIE 的诊断能力。评估方式是 OSCE，医学教育的金标准：让考生面对标准化病人（演员扮演），考官用评分表打分。AMIE 跟 20 名全科医生在 149 个场景里对比。

结果：专科医生评估的 32 个维度里，AMIE 赢了 28 个。患者演员评估的 26 个维度里，赢了 24 个。诊断准确率全面优于 PCPs。

另一组实验用了 NEJM 的 303 个疑难病例。AMIE 单独的 top-10 准确率 59.1%，无辅助的临床医生 33.6%。更有意思的是，*被 AMIE 辅助的医生*比*独自工作的医生*准确率高出 24.6 个百分点。

但这里有一个值得注意的细节：OSCE 场景是模拟的。演员扮演病人，文本聊天界面，没有查体，没有电子病历。AMIE 在一种简化了的临床环境里考试，就像一个学生在做习题，而不是在手术室里操刀。

## 开处方：30 个百分点的精确度裂缝

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-18-amie-four-years-img-02-precision-gap-amie-vs-doctors-1.png)

第二篇博客把 AMIE 推到了更难的位置：不只是告诉你得了什么病，还要像医生一样开检查、开药、制定随访计划。

架构上它变成了双 Agent 系统。一个对话 Agent 负责跟患者聊天（快思考），另一个管理推理 Agent 在后台吃掉 627 篇临床指南、生成带引用的结构化治疗方案（慢思考）。

100 个多次就诊场景，21 名全科医生，5 个专科。总体管理推理不劣于医生。但最抓眼球的数字是精确度：AMIE 的治疗建议精确度 95%，医生 65%。差距 30 个百分点，三次就诊次次如此。

什么意思？医生说"建议抗生素治疗"，方向对，但你拿着这句话去药房拿不到药。AMIE 说"阿莫西林 500mg，每日三次，饭后，七天；72 小时无改善复诊查血常规和 CRP"。

但这个差距指向的不是"AI 比医生强"。医生写不出精确处方吗？当然不是。门诊一个病人 8 分钟，写详细方案意味着下一个病人多等 8 分钟。AMIE 不受时间约束，把医生脑子里有但嘴上没说的东西全写出来了。

还有一个藏在消融实验里的发现：当 Gemini 2.5 Flash 基础模型够强时，整套 agent 脚手架带来的改进几乎消失。你在给马设计精密马鞍，结果马进化成了飞机。

## 走进真实病房：零事故，但不是满分

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-18-amie-four-years-img-03-real-clinic-zero-safety-stops.png)

第三篇博客是质变。AMIE 第一次面对真实患者——Beth Israel Deaconess Medical Center 的 100 名急诊患者，前瞻性、预注册、IRB 批准的可行性研究。

安全结果最干净：100 次人机对话，零安全停止事件。人类"AI 监督医生"通过实时视频和屏幕共享全程监控，没有一次需要介入。

诊断准确率：top-1 56%、top-3 75%、top-7 90%。这比模拟环境里的数字低了不少——但这次是真人，不是演员。而且，患者跟 AMIE 聊完之后再去看医生，对 AI 的态度显著改善了（p<0.001）。

PCPs 在实用性和成本效益上*显著优于* AMIE（p=0.003, p=0.004）。这不意外——AMIE 看不到电子病历、不能查体、没有多模态信息。它只靠文本聊天，在信息极度不对称的条件下做诊断。

但医生们说了一句话很值得记住：AMIE 的诊前记录把他们的门诊从"数据采集"变成了"数据验证"。AI 花 30 分钟收集病史，医生花 10 分钟确认和深化。这可能是目前最现实的 AI 辅助模式。

## 万人临床试验：真正的考试

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-18-amie-four-years-img-04-nationwide-rct-evidence-chain-1.png)

第四篇博客最短，但分量最重。Google 要跟 Included Health 做一个全国性随机对照试验——AMIE 辅助的虚拟诊疗 vs 标准临床实践，全国招募，多地域覆盖。

这是 AMIE 第一次面对"跟标准治疗方案直接对比"的考试。之前所有的研究——模拟 OSCE、可行性研究——都是能力展示，不是疗效验证。RCT 才是医学界公认的"金标准证据"。

这个选择本身说明了一件事：Google 在认真对待"AI 医疗"的监管路径。他们不是在说"我们的模型很强"，而是在说"让我们按你们的游戏规则来证明"。

但 RCT 的结果要等。在结果出来之前，所有"AMIE 跟医生一样好"的说法都只是模拟环境里的成绩——像模拟考分数，不等于高考。

***

把四篇博客放在一起看，我看到的不是"AI 又多厉害"，而是一个更结构性的问题：*一个 AI 系统到底需要多少证据才能被允许用在真人身上？*

新药要走完临床一期到三期，平均十年。AMIE 从第一篇博客到全国 RCT，用了两年半。速度是快了，但它跳过的不是科学步骤——每一步都有论文、有同行评审、有 IRB 批准。它加速的是工程效率：同一套系统从诊断扩展到管理，从模拟推进到真实，每一步都复用前一层的架构。

全球基层医生短缺是结构性危机。如果有一天 AI 真能当门诊的"预筛员"——在你见到医生之前先把病史、初步诊断和管理建议准备好——那 AMIE 展示的就是这条路的技术可行性。

但这条路还差最后一步：RCT 的结果。在那之前，AMIE 还只是一张漂亮的成绩单，不是一张毕业证。

*你觉得 AI 进门诊，最大的障碍是什么？*

## 原文参考

> Google Research Blog:
> <https://research.google/blog/amie-a-research-ai-system-for-diagnostic-medical-reasoning-and-conversations/>
> <https://research.google/blog/from-diagnosis-to-treatment-advancing-amie-for-longitudinal-disease-management/>
> <https://research.google/blog/exploring-the-feasibility-of-conversational-diagnostic-ai-in-a-real-world-clinical-study/>
> <https://research.google/blog/collaborating-on-a-nationwide-randomized-study-of-ai-in-real-world-virtual-care/>
