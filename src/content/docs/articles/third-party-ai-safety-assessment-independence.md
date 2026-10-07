---
$schema: starlight
title: 第三方评估的独立性，写在协议里
description: 评估者挂着“第三方”的名牌还不够。范围由谁定、证据能看多少、报告怎样发表，才决定外部意见能不能真正独立。
date: 2026-10-07
category: security
primarySourceUrls: ["https://openai.com/index/priorities-principles-third-party-assessments/"]
---

OpenAI 这份文件列出四类评估任务，也把访问、保密、利益冲突和报告发表写进合作原则。读完我还是想先确认一件事：第三方进入流程后，能不能按自己的发现形成并发表结论？

![文章核心信息图：第三方评估的独立性要检查范围、证据、利益关系与发表](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/third-party-ai-safety-assessment-independence-00-infographic-core-summary.png)

## 先说清楚：要验证的究竟是哪句安全主张

OpenAI 把 safety claim 解释为关于模型能力、行为或保障措施的具体断言；safety case 则是把这些主张连接到证据，说明特定活动中的风险为何得到妥善管理。评估不能只给模型打一个笼统的“安全分”，还得说明究竟在检验哪句话、它依赖哪些条件、有什么风险没有覆盖。

比如，评估一个模型在公开接口下是否会越过某项限制，和检查它在内部部署中能否绕过访问控制，是两个不同的问题。原文要求事先约定并登记主张，再在结论里交代哪些内容评过、哪些没有。读者要先知道范围，才能判断证据支持到哪一步。

我尤其赞成把“范围外发现怎么处理”写进合作机制。评估者按约定完成任务，却在过程中发现另一个风险时，不该只因它不在原始清单里就让信号消失。双方应能决定是否追加调查，并在报告中说明最后如何处理。

## 访问越深，依赖关系也越要看得见

评估者如果看不到足够证据，只能复述开发者提供的摘要；但访问越深入，评估者越依赖开发者授予的权限、背景说明和测试环境。保密、知识产权和安全限制都有合理用途。读者仍需要知道，它们限制了哪些判断。

OpenAI 在 2025 年介绍外部评估时，把合作分为独立评测、方法审查和领域专家探测，并称评估报酬不与结论挂钩。付费本身不等于结论被买断；更实际的要求是把付款方式和评估结果脱钩，同时披露并处理评估者的利益冲突。

METR 在 GPT‑5 评估报告开头说明，该次评估依据标准保密协议进行；由于获得了敏感信息，OpenAI 的法务和传播团队要求审阅并批准报告发布。METR 也列出这次没有评估模型对齐和若干其它风险，并说明 OpenAI 提供了部分推理轨迹与背景资料。这样的交代没有证明结论受到干预，却让读者知道结论是在什么条件下形成的。

![报告发表审阅的边界：读者核查审阅目的、评估者判断与删节影响](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/third-party-ai-safety-assessment-independence-01-framework-publication-review-boundary.png)

## “可以发表”还要问：谁有最后决定权

审阅报告有正当理由。敏感信息、用户隐私和知识产权需要保护，事实错误也该有纠正机会。但“可以审阅”与“可以否决”之间的距离需要说清。

OpenAI 的 2025 年说明称，公司会审阅并批准第三方报告，以确保保密和事实准确。METR 也披露了自己那次评估的发布审批。独立性要在这里接受检验：审阅是否只针对具体机密和可核实错误？回应期限是什么？如果删去一段内容，评估者能否说明删节影响了哪些判断？双方意见不同时，报告能否并列呈现？

我不是据此质疑 METR 的结论。读者更需要知道的是，审阅只纠正事实和保护具体机密，还是也能改动或拖延重要结论。报告可以说明访问限制、删节理由和未解决的不确定性，也应让人看见评估者保留了哪些判断。

## 第三方报告不能替开发者承担安全责任

我之前写过[《OpenAI 开始给模型失配写事故报告》](https://ntlx.github.io/articles/openai-model-misalignment-reporting-framework)，关注的是公司如何记录并披露自己观察到的事件。这里的问题再向外一步：谁能检查这份记录，谁能指出证据不够，谁来决定哪些风险仍要由部署者或监管者承担？自我披露和独立评估互相补充，却不能彼此替代。

一份可复核的报告应交代评估主张与测试条件、拿到的证据和受限处、方法与不确定性、利益冲突和报酬关系、删节对结论的影响、未覆盖的风险，以及问题出现后的整改和复测安排。出于安全考虑，不必公开全部细节；但保密不能让读者看不出结论的边界。

第三方评估不能替公司盖章，也不可能由一个机构包办所有问题。判断它有没有提供内部评估之外的证据，要看报告是否讲清评估者看到了什么、被要求回答什么，以及哪些内容最后没能公开。

## 参考资料

- [OpenAI：Priorities and principles for effective third party assessments](https://openai.com/index/priorities-principles-third-party-assessments/)
- [OpenAI：Strengthening our safety ecosystem with external testing](https://openai.com/index/strengthening-safety-with-external-testing/)
- [METR：Details about METR's evaluation of OpenAI GPT-5](https://metr.org/evaluations/gpt-5-report/)
- [Irregular：Irregular x OpenAI: Evaluating GPT-5's Cybersecurity Capabilities](https://www.irregular.com/research/evaluating-gpt-5)
- [OpenAI：Our framework for reporting model misalignment](https://openai.com/index/model-misalignment-reporting-framework/)
- [OpenAI：Towards safety cases for frontier AI training](https://openai.com/index/towards-safety-cases-for-frontier-ai-training/)
