---
$schema: starlight
title: AI 不缺能力，缺的是一张能追责的承诺
description: AIUC 让标准、测试、审计和保险串成一套信号系统；它提醒我们，证书能界定承诺，却不能替谁保证不会出事。
date: 2026-09-18
category: ai-agents
primarySourceUrls: ["https://www.latent.space/p/aiuc?showTranscript=true"]
---

我听完 Latent Space 对 AIUC CEO Rune Kvist 的这期访谈，留下来的不是“又有一家 AI 安全公司融了多少钱”，而是一个更不舒服的问题：**当 agent 开始替公司做决定，企业究竟凭什么向别人承诺它不会把事情搞砸？**

这期谈了标准、红队测试、审计、保险，也谈到模型越强，风险面可能越大的矛盾。Rune 把 AIUC 称为给 frontier AI 建设的 “confidence infrastructure”。这个词听起来很宏大，但我觉得它真正指向的事情很具体：把一句“相信我们的模型”拆成几组别人可以检查、比较、追问的证据。

我的读后感是：AIUC 的真正产品不是一张“证明 AI 安全”的证书，而是一套把风险翻译成承诺的接口。标准规定要问什么，测试告诉你系统在什么条件下会失手，审计检查证据是否真的存在，保险则把一部分损失变成需要有人承担的价格。可这套接口本身也不能被免检——否则信号只会变成更精致的营销。

<!-- SLOT_IMG_00_INFOGRAPHIC -->

![AIUC 的信任基础设施：从 Agent 能力到可采用的承诺](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-18-aiuc-agent-trust-insurance-img-00-infographic-core-summary.png)

## 能力不是采用的最后一道门，承诺才是

访谈里最让我信服的类比，是 Rune 对 Waymo 的描述：车可以表现出远超人类驾驶者的能力，但“能不能把人送到机场”并不只由驾驶能力决定，还取决于出了问题之后谁负责、风险怎么定价、运营方敢不敢把它接进日常系统。这个类比不需要我们接受他对某个具体模型的判断，也能说明一个普遍问题：**demo 证明的是可能性，组织采用需要的是可交付的承诺。**

企业买的从来不只是一个模型的平均表现。它还要知道模型会碰到哪些数据、能调用哪些工具、失败时谁能暂停、日志能不能复盘，以及客户受到损失时能不能找到责任人。模型越能自主规划、越能接触外部系统，单一 benchmark 就越难回答这些问题。

这也是我理解“风险是采用约束”的方式。它不是说风险一定比能力更重要，而是说能力已经足够做出有价值的事情之后，剩下的瓶颈会转移：从“它能不能做到”转成“我能不能把这个结果写进自己的责任范围”。

## AIUC-1 做的不是安全盖章，而是把风险翻译成证据

AIUC-1 的设计最值得看的地方，不是它列了多少个风险类别，而是它没有把标准停在一份问卷上。访谈把要求分成三类：技术控制，例如部署防护；测试控制，例如由独立第三方运行测试；政策控制，例如必须有一个明确的人对事故响应和客户沟通负责。

这三类东西分别回答三个不同问题：系统有没有装上防护，防护在对抗性场景下有没有效果，出了问题之后有没有组织来接住后果。把它们都叫“安全”会掩盖差异；拆开以后，采购方才知道自己究竟拿到的是配置声明、测试结果，还是责任承诺。

AIUC-1 还把季度刷新放在设计中心。访谈中 Rune 说，标准要用大量模拟去测试 jailbreak、hallucination 和 data leak，再根据新风险更新；AIUC-1 的[官方方法论](https://www.aiuc-1.com/methodology)也明确写到，真实事故会进入预防控制与测试的季度更新。这个机制的意义不在于“季度”这个频率本身，而在于标准承认了一件事：**今天的安全清单不是明天的安全清单。**

当然，AIUC 官方融资公告中所说的 5,000 种风险与攻击组合，是 AIUC 对其产品的描述，不是第三方已经证明的行业标准。对读者更有用的追问不是“这个数字够不够大”，而是：这些测试覆盖了哪种业务？失败样本是否公开？模型、工具、权限和部署配置变化后，原来的结果还算不算数？

![AIUC-1 Consortium 原文配图：安全与风险负责人共同审阅标准](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-18-aiuc-agent-trust-insurance-img-source-aiuc-1.png)

这张图来自原文展示的 [AIUC-1 Consortium 页面](https://www.aiuc-1.com/consortium)。我不把截图里的成员数量当成今天的实时统计；它更适合用来说明一个结构：标准不是工程团队关起门来写完，再要求企业照抄，而是试图把真实使用者遇到的风险带回标准更新。

## 保险把“相信”改成“谁来付账”

标准解决的是“应该检查什么”，保险解决的是“如果仍然出事，损失由谁承担”。这两件事放在一起，合规文件才开始具备采用基础设施的作用：企业不只是拿到一个 logo，还要面对测试结果、赔付范围、免责条款和保额边界。

Rune 在访谈中反复强调保险公司的特殊位置：它们不会因为一句漂亮的承诺就愿意接风险，而要判断风险是否能被量化、怎样减少、出了事故能不能赔。这种激励未必天然正确，但至少比让供应商自己宣布“我们很安全”多了一层外部约束。

Air Canada 的 chatbot 案件正好把这个问题从抽象讨论拉回现实。Rune 的说法是，企业不能在 chatbot 给客户错误信息后，把责任推给“那个机器人”。AIUC-1 的[方法论页面](https://www.aiuc-1.com/methodology)也把这个案件列作 hallucination / support 的事故案例；对应的 [Moffatt v. Air Canada, 2024 BCCRT 149 判决记录](https://www.canlii.org/en/bc/bccrt/doc/2024/2024bccrt149/2024bccrt149.html)值得直接阅读。

这里要保留法律边界：一宗加拿大民事裁决不能自动变成所有国家、所有产品的通用规则。我从这个案例里拿走的不是“以后所有 chatbot 都由企业承担一切责任”，而是一个部署原则：**你把 agent 放到客户面前，它的输出就不能在责任链上凭空消失。**

这也解释了为什么保险不能先于标准。没有共同的测试和证据，保险公司只能把不确定性粗暴地定价，或者干脆拒绝承保；没有潜在的赔付和资本约束，标准又容易停在自我宣称。两者相互需要，但谁也不能替另一个环节完成工作。

## 证书也需要一条可审计的信任链

访谈把 AIUC 放在一个更大的制度图景里：政府需要知道 frontier model 的风险，实验室拥有很强的技术能力，但实验室同时处在竞争和商业化压力中，因此不能只靠自己完成审计。Rune 用“watchdog”来描述这层独立性，并把 AIUC 想象成连接技术评估与政府 / 企业信任语言的中间机构。

我基本同意问题的方向，但不会把“第三方”当成可信终点。第三方也有客户、营收、续约和声誉激励；如果客户可以在多个认证机构之间挑一个最容易通过的，watchdog 之间同样可能出现把标准越做越松的竞争。访谈最后自己也承认，watchdog 需要继续被监督；对我来说，这构成了整期节目必要的自我反驳。

所以一套成熟的信任链至少要能回答：标准是谁参与制定的？测试者能否独立于被测方？失败案例和整改是否留下变更记录？保险方是否能看到足够证据？认证机构如果判断失误，谁有权复核它？

这和 NIST 的 [CAISI 官方定位](https://www.nist.gov/caisi)可以放在一起看：政府侧机构负责与产业协作、评估 AI 能力与风险、推动自愿标准；市场侧机构则可能更贴近具体产品的测试、审计和承保。两者不是同一个组织，也不应该被混为一谈。真正有价值的地方，是让不同角色的证据能够互相校验，而不是让任何一方垄断“安全”的定义。

![第三方监督也需要复核：证据、变更记录与独立性构成循环](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-18-aiuc-agent-trust-insurance-img-01-framework-watchdogs.png)

## 我会把 AIUC 当成采用接口，而不是安全保证

读完这期访谈后，我不会因为某个产品拿到认证，就把它当作“可以放心交给 agent”的充分理由。我会把认证看成一次采购和部署谈判的入口，至少继续问五件事：

- 测试针对的是模型本身，还是包含工具、权限、数据和业务流程的完整系统？
- 失败案例是否能被复现，整改之后是否重新测试？
- 标准多久更新，模型或关键依赖变化后是否触发重新评估？
- 事故发生时，谁能暂停系统、通知客户、保留日志并承担损失？
- 保险覆盖的是哪些具体风险，哪些情况被排除，保额和赔付条件是什么？

这些问题的共同点，是把“信任”从模型的一种内在品质，改成部署方、供应商、审计者和保险者之间的一份可检查关系。这和我此前写过的[“把判断从继续生成的循环里拿回来”](https://ntlx.github.io/articles/ai-psychosis-calibration)是同一个问题的另一面：当系统越来越会继续行动，外部校准就越来越重要；不能只看它有没有输出，还要看谁能打断它、谁能解释它、谁能为它造成的损失负责。

如果说 [CoT 的文字不能自动成为审计证据](https://ntlx.github.io/articles/palantir-black-box-llm-explainability)，那 AIUC-1 试图建立的是另一种证据：测试记录、控制状态、审计报告、变更日志和保险合同。它们都不完美，却比让模型自己描述“我为什么可靠”更接近生产世界需要的信任。

我最终从这期访谈里带走的句子是：**AI 最需要的不是一张更响亮的安全证书，而是一套出事之后仍然找得到人的承诺。**

## 参考资料

- [原始访谈：Underwriting Superintelligence: Backing Agents you can Sue — Rune Kvist, AIUC](https://www.latent.space/p/aiuc?showTranscript=true)
- [原文视频：Latent Space / AIUC](https://www.youtube.com/watch?v=Sc2_LfWgHb4)
- [AIUC：Series A announcement](https://aiuc.com/updates/series-a-announcement)
- [AIUC-1：Methodology](https://www.aiuc-1.com/methodology)
- [AIUC-1：From Consortium input to new controls: quarterly update process](https://www.aiuc-1.com/research/aiuc-1-quarterly-update-process)
- [AIUC-1：Consortium](https://www.aiuc-1.com/consortium)
- [Kaplan et al.：Scaling Laws for Neural Language Models](https://arxiv.org/abs/2001.08361)
- [NIST：Center for AI Standards and Innovation](https://www.nist.gov/caisi)
- [CanLII：Moffatt v. Air Canada, 2024 BCCRT 149](https://www.canlii.org/en/bc/bccrt/doc/2024/2024bccrt149/2024bccrt149.html)
- [站内延伸：当 AI 总能接着说下去，判断该从哪里回来？](https://ntlx.github.io/articles/ai-psychosis-calibration)
- [站内延伸：别被 CoT 的“思考”骗了](https://ntlx.github.io/articles/palantir-black-box-llm-explainability)
- [站内延伸：一个支持工单，什么时候值得惊动 CEO？](https://ntlx.github.io/articles/why-companies-are-becoming-a-series)
