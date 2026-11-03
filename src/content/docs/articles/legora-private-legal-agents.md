---
$schema: starlight
title: 看不见客户数据，怎么改进一个法律 Agent
description: 当客户的法律工作不能交给产品团队查看，评估就需要模拟场景、有限反馈和客户自己的复核共同承担。
date: 2026-11-03
category: ai-agents
primarySourceUrls: ["https://lspace.beehiiv.com/podcast/s/latent_space_the_ai_engineer_podcast/building_legal_agents_when_you_can_t_see_the_data_-_jacob_lauritzen_cto_of_legora"]
---

做 Agent 产品，一个很自然的动作是翻开失败记录：用户问了什么，模型查了哪些资料，在哪一步走偏了。看过足够多的失败，再决定改提示词、改工具还是换模型。

但如果这些记录属于客户的客户，产品团队不能随便看呢？

在 Latent Space 对 Legora CTO Jacob Lauritzen 的访谈简介中，这正是一个出发点：律师处理的材料高度敏感，Legora 无法查看客户使用 Agent 的工作轨迹。产品仍然要改进，团队却失去了软件开发里最顺手的一种反馈。

我觉得这个问题有意思，是因为它迫使我们把「产品变好」拆开：团队需要知道系统大致在哪些地方会出错，用户需要看懂眼前这份结果是否可信，而客户还需要控制哪些信息可以离开自己的环境。这几件事相关，却不能用同一种数据解决。

![保密环境下的评估、反馈和复核](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-03-legora-private-legal-agents-img-00-infographic-core-summary.png)

![节目原封面：Jacob Lauritzen 访谈](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-03-legora-private-legal-agents-img-01-source-podcast-cover.jpg)

## 没有现场记录，就要自己搭现场

节目介绍里，Legora 的评估团队由工程师和律师共同构建模拟环境，模仿客户的工作。这样的测试可以设定一份尽调任务，准备一组文档，在其中埋入需要发现的风险，再检查 Agent 是否找到它们、报告是否有依据。

这比只问模型一道法律问题更接近工作现场。真正的任务往往包含资料搜集、辨认相关条款、整理发现和撰写报告。即使最后的文字流畅，也可能漏掉关键材料；即使找到了问题，交付给律师的报告也可能难以核查。把任务分开看，团队才能知道需要改的是检索、分析还是呈现。

但模拟环境有个不容易消除的缺口：出题的人只能覆盖自己想到的情况。案例设计得越整齐，测试越可能漏掉混乱的文件、模糊的委托和彼此冲突的证据。测试通过的含义是「在这组任务上表现符合预期」，不是「所有客户的真实案件都可靠」。

![模拟评估与真实场景之间的覆盖差距](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-03-legora-private-legal-agents-img-02-comparison-eval-gap.png)

我在[《黄金评测集别只存用户提问》](https://ntlx.github.io/articles/golden-eval-production-context)里讨论过，评测需要保留任务发生时的上下文。Legora 面临的困难更进一步：现场上下文可能根本不能带出来。这时，评测集应当记录它模拟了什么、刻意省略了什么，以及哪些真实工作条件没有覆盖。知道盲区在哪里，比给评测集起一个权威的名字更有用。

## 把问题带出来，未必需要把文件带出来

设想一个合同审阅任务：客户发现 Agent 漏掉了某类条款。团队可能不需要收到原合同全文，也能从一份经过授权和审查的反馈中了解到，问题发生在何种任务、文档有什么结构特征、预期是什么。随后，律师和工程师可以共同构造一个不含原案件信息的测试，看看系统能否识别同类问题。

这里的取舍很现实。反馈越粗，越难定位问题；细节越多，越可能暴露敏感信息。删掉姓名并不自动意味着安全，独特的交易结构或事实组合也可能让人猜出案件。哪些信息可以共享，需要客户、专业人员和负责数据治理的人按具体情况判断。

即使得到匿名案例，也不能假定它还原了完整轨迹：复现时漏掉的上下文，可能正是错误发生的原因。因此我更愿意把这看作一条受限的学习路径，而不是一个能完全代替真实数据的技巧。产品团队应当保留「无法判断」这个选项，让有权限的人在客户侧继续调查。

## 把依据留给能看原文的人

产品团队看不到文件，律师却需要看。这决定了界面的职责。

Legora 的 [Tabular Review 产品页面](https://legora.com/product/tabular-review)介绍，文档可以按行排列，问题按列排列，单元格可展开查看依据和源文件。对一批合同提出同一个问题时，这样的布局让人可以横向比较结果，也能回到某份文件检查。

我喜欢这种设计背后的分工：系统负责整理，拥有合法访问权限的人负责判断。不过，能点开出处只是复核的起点。引用存在，不等于引用支持结论；支持结论，也不等于文档里没有相反条款。对高风险事项，用户仍要决定查哪些、查多深，以及发现错误后如何修正后续工作。

这也会带来成本。如果每个单元格都要逐字检查，自动化节省的时间可能重新花在复核上；如果只看起来合理就放过，又可能漏掉严重错误。更有价值的设计是让复核者能够按风险筛选、看到不确定性，并在必要时追溯到原文。这里是我的设计判断，不是节目对实际效果的保证。

## 模型升级不能替代持续评估

节目简介举了一个醒目的例子：一次模型更新后，Legora 遇到的某个引用问题从约 70% 改善到 99%，团队没有为此改动产品。这个数字描述的是访谈中提到的特定问题，不是法律工作整体准确率，也没有提供足够信息让我们推断真实案件的错误率。

它说明基础模型的进步可能解决应用层原本很难修的问题。但反过来，团队仍需检查新模型是否在自己关心的任务上退步，尤其是那些测试环境未充分覆盖的情况。换模型、改检索、调整工作流，都应该留下可以比较的结果；没有实际依据时，不应因为新模型的名字就认为它更适合某项法律任务。

对客户来说，值得问的也许不是「这个 Agent 的总分是多少」，而是：它在与我相似的材料上如何测试？哪些情形仍需要人工逐项检查？出现错误时，谁能看到足够的信息来调查？

Legora 的故事给我的启发是，保密约束改变了反馈回路的形状。模拟测试可以帮助团队发现已知类型的问题，可追溯的界面可以帮助律师检查手头的工作，受控反馈可以把一部分经验送回产品团队。它们接起来，系统才有机会进步；而接不上的地方，也应该被明确地留下来。

## 参考资料

- [Latent Space：Building Legal Agents When You Can't See the Data](https://lspace.beehiiv.com/podcast/s/latent_space_the_ai_engineer_podcast/building_legal_agents_when_you_can_t_see_the_data_-_jacob_lauritzen_cto_of_legora)
- [Legora：Tabular Review](https://legora.com/product/tabular-review)
- [NIST AI Risk Management Framework Playbook](https://airc.nist.gov/docs/AI_RMF_Playbook.pdf)
