---
$schema: starlight
title: Deep Review 能替我少查多少东西？
description: 我愿意让 AI 在交稿前挑错，但会把它的反馈也列入核查范围。报告越长，越要看它是否让问题更容易核实。
date: 2026-10-22
category: ai-agents
primarySourceUrls: ["https://research.google/blog/analyzing-technical-documents-with-deep-review/"]
---

设想你在读一份系统迁移方案。摘要说迁移不会影响读取，设计章节也交代了正常路径。直到故障回退那一段，你才发现：缓存失效时，读取结果可能丢失。每段单看都像那么回事，放在一起，承诺就对不上了。

这是我读 Google Research 的 [Deep Review 发布文章](https://research.google/blog/analyzing-technical-documents-with-deep-review/)时想到的例子。它是假设场景，并非工具的实测案例。我感兴趣的正是这种工作：替我找到一份长文档里，需要停下来核对的地方。

但我也有个很具体的顾虑。如果 AI 交回来的是一份同样需要费力审查的长报告，我究竟省了什么？

![阅读要点：局部检查保留全文上下文，检出率有范围，质疑要有依据](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-22-deep-review-verification-img-00-infographic-core-summary.png)

## 审查意见也会占用人的时间

Deep Review 从 Google 的 Paper Assistant Tool（PAT）演化而来。此前的会议试点提供投稿前反馈，与正式评审分开，意见对作者私有。这种安排让我觉得合理：作者可以借它发现问题、修改文章，会议的判断权并没有随之交给模型。

[PAT 论文](https://arxiv.org/abs/2606.28277)里有个设计讨论，颇能解释为什么“让模型多看几遍”还不够。重复调用会增加发现问题的机会，也可能积累更多可疑意见。人得重新核对这些意见；各次调用还可能反复盯着相同章节，把别处漏掉。

这样一来，原文要查，针对原文的批评也要查。

我会把“能否减少核查劳动”放进评价标准。找到了什么真实问题，为了排除误报又读了多少材料，这些都应该算。只看反馈有多长、多专业，容易高估工具的帮助。

我也不会只考虑省时。若它找出了足以推翻结论的缺陷，多花时间复核完全值得。我怕的是读完报告觉得放心了，却说不清问题究竟查到了哪一步。

## 分段检查，仍然要看得见全文

原文给出四阶段流程：按语义切分文档，按复杂度分配推理预算，让专门的检查者分别深查，再汇总、去重并借助外部检索核对。

其中我最在意的细节是：**负责局部的检查者，仍然能看到全文。** 分段是在分配注意力，不能把理解所需的上下文一起切掉。

回到开头的迁移方案。负责故障回退的检查者，需要知道摘要做了什么承诺，也需要知道正常读取依赖什么。如果只给它回退章节，它很可能只能评价这一段写得是否完整，发现不了前后冲突。

原文的系统架构图展示了这套分工：不同内容获得不同推理投入，最后再做全局汇总。图中流程是系统设计，不意味着经过这些步骤的报告就不再出错。

![Google Research 原始架构图：四阶段文档检查流程；每段检查仍保留全文上下文](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-22-deep-review-verification-img-01-flowchart-source-pipeline.png)

这让我想起站内写过的[证据是否足够的问题](https://ntlx.github.io/articles/google-agentic-rag-sufficient-context)。面对长文档，模型既要拿得到相关信息，也要判断这些信息能不能支撑眼前的结论。多安排检查者，并不会自动完成后一个判断。

## 好看的检出率，需要带着分母读

论文确实给出了比作者好评更直接的查错证据：从 SPOT 基准中筛出数学、计算机科学的公式与证明错误，得到 26 篇论文、29 个已知错误。在这个子集上，同为 Gemini 3.1 Pro，单次调用检出率是 55.2%，PAT 是 89.7%。

这说明组织推理过程可能很有价值，至少在这组任务上，值得认真对待这套流程。

但这些数字回答的是一个窄问题：**面对这批已知存在的特定错误，系统能找出多少。** 它们没有同时告诉我，一篇原本正确的论文会被挑出多少假问题，作者又得花多久逐条解释。不能把 89.7% 写成通用审稿准确率。

![PAT 论文 Table 2 原图：仅限数学与计算机科学公式、证明错误子集；原始 SPOT 行的评分口径不同，不可直接横比](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-22-deep-review-verification-img-02-comparison-source-spot.png)

论文还说明，评分用了判断逻辑等价的模型，再由论文作者人工审查。因此，不能把它的结果直接与采用不同评分办法的原始 SPOT 数字横比。旧版 PAT 的实验，也不能直接代表公开产品在各种文档上的表现。

会议反馈是另一类证据。[ICML 官方回顾](https://blog.icml.cc/2026/03/30/retrospective-on-pat-x-icml-2026-ai-paper-assistant-program/)中，35.4% 的相关应答作者报告发现了重大理论缺口，31% 的相关应答作者报告补做了实验。前者针对有理论结果的论文，后者针对有实验结果的论文，都是作者自报。

这些反馈值得重视：有人据此投入了修改和实验。但它们不能替代客观查错评估。我也没有采用资料中部分满意度比例，因为会议回顾与论文的问卷样本和数字并不一致，公开文本未解释差异。

[NeurIPS 的官方说明](https://blog.neurips.cc/2026/04/21/neurips-supports-authors-with-googles-paper-assistant-tool-pat/)则把限制说得很直白：模型可能把正确陈述指为错误，也可能漏掉真实缺陷。使用时得把这句话和效果数字放在一起。

## 我会要求它把质疑写得方便核实

如果要把这类工具放进交稿流程，我会先要求每条重要意见说清楚：针对哪句原文，为什么有问题，依据在哪里，以及问题成立后会影响什么结论。这是我的使用建议，并非产品已经具备的输出保证。

例如，只说“回退机制需要加强”，帮助很小。若能指出摘要的无损读取承诺，与回退章节的缓存行为冲突，并给出触发条件，我就知道该检查哪条路径。即使最后确认它误解了设计，核实过程也比较明确。

处理反馈时，我会留下接受或驳回的理由。接受的意见要落实到修改；驳回的意见要说清模型漏看了什么。对于“未发现问题”的部分，我也会继续检查，尤其是影响结论的前提。

![作者使用建议：定位原句、说清理由、核对依据，再记录接受修改或驳回说明](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-22-deep-review-verification-img-03-framework-verifiable-feedback.png)

也别把文档内部一致性与现实中的正确性混为一谈。方案前后没有矛盾，系统仍可能在部署后出错；实验描述自洽，也不能代替复现实验。原文引用的 [DeepMind 验证瓶颈讨论](https://deepmind.google/public-policy/conjecture-machines-ai-agents-and-the-new-validation-bottleneck-in-science/)同样提醒我们，候选想法的生成可以加速，现实验证仍有自身的条件和时间。

## 愿意试，但先用它帮我改稿

就这次阅读而言，我愿意尝试 Deep Review 来挑交稿前的漏洞。它的分工方式有道理，查错实验也提供了尝试依据。我还没有上传文档实测，不能替它承诺实际能省多少时间。

入口和数据处理也要按当前发布说明理解：初期输入是 PDF 与纯文本，多文件支持仍在计划中。发布稿承诺上传内容不用于训练、微调或改进模型，同时说明文档保存一年，供用户在界面中查看。“不训练”和“不保存”是不同的事；会议试点的删除政策也不能直接套给公开产品。

我希望从它那里拿到的是值得追查、容易核实的意见。等到自己的方案里有问题被准确定位、误报也容易排除，再谈它替我承担了多少审查工作。至于文档能否交付、结论能否成立，我仍需要看证据作决定。

## 参考资料

- [Google Research：Analyzing technical documents with Deep Review](https://research.google/blog/analyzing-technical-documents-with-deep-review/)，本文阅读对象及系统架构原图来源。
- [Towards Automating Scientific Review with Google’s Paper Assistant Tool](https://arxiv.org/abs/2606.28277)，方法、SPOT 子集评估与限制。
- [ICML：PAT 试点回顾](https://blog.icml.cc/2026/03/30/retrospective-on-pat-x-icml-2026-ai-paper-assistant-program/)，作者问卷与使用反馈。
- [NeurIPS：PAT 项目说明](https://blog.neurips.cc/2026/04/21/neurips-supports-authors-with-googles-paper-assistant-tool-pat/)，评审隔离和误报、漏报边界。
- [DeepMind：Conjecture Machines 与新的验证瓶颈](https://deepmind.google/public-policy/conjecture-machines-ai-agents-and-the-new-validation-bottleneck-in-science/)，文档核查之外的验证约束。
