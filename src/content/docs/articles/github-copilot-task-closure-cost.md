---
$schema: starlight
title: AI Agent 省下 token 之后，任务真的更便宜了吗？
description: Agent 省下的不是某次响应里的 token，而是从请求到测试通过之间本来不必发生的回读、重跑和额外轮次；压缩若制造回头路，只是把账单挪了位置。
date: 2026-09-05
category: ai-coding
tags: [AI Agent, GitHub Copilot, cost, harness, context engineering]
---

给 coding agent 一个很普通的任务：改一处缓存逻辑，然后跑测试。第一次工具响应变短了，仪表盘上的输入 token 也降了；可测试失败的关键信息刚好被藏在省略部分里，agent 只好重新打开日志，再跑一次命令。最后提交的改动没有变，任务却多走了两轮。

我觉得问题不在统计口径。回读、重跑、等待、上下文变长，以及失败后的人工接管，都是完成任务的成本。读完 GitHub 对 Copilot CLI harness 的复盘，我更愿意把 AI coding 的效率单位放在可验证的任务闭环上，而不是某一次交互的 token 数。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-05-github-copilot-cost-efficient-task-quality-img-00-infographic-core-summary.png)

## 一次任务的账，不能只记最后一行 token

一次“改代码并通过测试”的账单，至少包括有效生成、无价值的格式和重复信息、恢复劳动、额外编排轮次，以及质量失败后的返工。这不是 GitHub 的计费公式，是我读这篇复盘时给任务列的账：每项优化究竟省掉了哪一段劳动？

工具响应变短，只能证明其中一行数字变小了。要紧的是，下一步还需不需要那些被拿掉的信息。如果 agent 能沿着直接路径取回原文，恢复成本可能很低；如果它只能重跑命令、重新搜索或多发一次请求，节省就从当前调用转移到了任务后面。

原文里有个观察我觉得很实在：早期过滤器压缩 `git diff` 后，benchmark 中的 agent 重新打开原始输出，过滤器因此被撤掉。删除编辑工具不再需要的行号前缀，结果就不一样了：离线 benchmark 中模型推理成本下降约 5%，Copilot CLI 在线实验中每用户日均模型推理成本下降约 3%；跟踪的成功率、质量和满意度指标没有发现实质性回归。这两个数字来自不同测量，不能相加。至少可以看出，删掉工具已经不再使用的格式，比猜模型不需要什么信息更稳妥。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-05-github-copilot-cost-efficient-task-quality-img-01-source-figure-02-task-cost-loop.png)

Figure 2 正好把这个问题画了出来：从“输出变短”到“任务变便宜”之间，还隔着省略信息、恢复动作、更多上下文和额外轮次。结果可能是响应短了，任务总账却更贵。

## GitHub 删除的不是同一种浪费

我把原文里的四条改进放进四层风险阶梯。它不是 GitHub 的原分类，只是我用来排优先级的办法。

第一层是表示清理：删掉行号这样的附加格式，文件内容不变，工具也不再依赖它。第二层是信息压缩：安装、构建、测试、进度输出中那些可预测的重复噪声可以选择性处理，但 source-like 输出和任意脚本结果原样保留；搜索结果可以重排，不能删匹配项；完整输出还要留在可直接恢复的位置。第一层几乎没有信息损失；到了第二层，“以后能不能找回”就要由 harness 兜住了。

第三层是减少编排往返。后台 shell 命令或子 agent 完成时，如果通知只说“好了”，模型还得再发请求取结果。GitHub 把符合条件的完成结果随通知批量交付；原文示例中，两个后台结果从过去需要 4 次模型调用，变成一次调用一起处理，以 AI Credits 衡量的 token 相关使用量平均下降约 2.3%。省下的是一次取结果的请求，模型不必再发请求领取已经完成的工作。

第四层是行为改写，风险最高。`task` 工具 prompt 每轮都会发送，缩短它可能带来持续收益；但 prompt 同时规定了 agent 如何委派和并行。GitHub 的第一次在线实验发现，压缩后的指引让独立 custom agents 从并行变成串行，实验被停止。团队加上行为回归测试，再用一句 `Independent agents can run in parallel; consider side effects.` 把并行意图补回去。最终版本每轮移除约 1,300 个 prompt token，每 session 的 prompt token 约下降 1.8%，每活跃小时归一化成本约下降 2.9%。我最在意的不是这些百分比，而是发布前先查到了行为回归。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-05-github-copilot-cost-efficient-task-quality-img-02-source-figure-03-selective-compression.png)

Figure 3 画的是这条责任边界：哪些输出应该原样保留，哪些只需无损重排，哪些重复噪声可以压缩。压缩器负责识别重复，harness 负责保存和找回，评估系统负责确认行为没有变。少了其中任何一环，压缩率就可能只是一个好看的假成绩。

## 一组漂亮的数字，为什么不能搬到别的 workflow

效率数据只能放回具体 workflow 里看。Copilot CLI 的任务通常包含探索、执行和测试；code review 更偏向读取、理解和审查。同一个 file-tool instruction 在 code review 中得到正面结果，在 Copilot CLI 在线实验中却增加了成本，于是没有发布。实验看起来冲突，其实是在测不同的任务分布。

GitHub 的 [Changelog](https://github.blog/changelog/2026-06-25-copilot-code-review-analysis-depth-and-efficiency-updates/) 还报告了 Copilot code review 成本约下降 20%，同时保持 review quality；我把它当作跨 workflow 的旁证，但它不能和本文四项独立实验的约 5%、约 3%、约 2.9%、约 2.3% 合成一个“Copilot 总共省了多少”的答案。原文也没有公开每项在线实验的完整样本量、置信区间、全部质量指标定义和成本基线，所以这些百分比只能各自留在自己的测量范围里。

最强的反对意见仍然成立一半：token 是直接计费项，响应平均变短，且线上没有观察到实质质量回归，为什么不先压再说？对于不再被工具消费的格式，以及确定性完成通知，这个策略很合理。但有三种情况不能这么做：被省略的是 diff、源码或关键错误；恢复只能靠重跑和重新探索；压缩 prompt 改变了并行、委派或错误处理。

所以我的优先级是：先删无用格式，再压缩可恢复的重复信息，然后消除确定性的模型往返，最后才改 prompt 和调度。每往上走一层，检查项都要增加。某个方案让 token 下降，却让回读、重跑或长尾失败上升，我会把它看成成本搬家，不会继续把它叫作降本。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-05-github-copilot-cost-efficient-task-quality-img-03-infographic-risk-ladder.png)

这张原创风险阶梯图按责任递增排列四种改动：先改变呈现方式，再碰信息边界，最后才碰轮次和 agent 行为。四个实验的总收益不是它要表达的内容；这是我在这篇读后感里整理出的主线。

## 给自己的 Agent 开一张闭环账单

如果把这套判断放进自己的系统，我会先挑一个 workflow，用同一批真实任务跑出基线。然后记录六项数据：任务是否达标及返工、接管比例；完成所需的 turns、tool requests 和失败重试；回读原文、重跑命令、重复搜索等恢复动作；从请求到完成的延迟；最终总 token 或 cost；以及不同任务类型之间的长尾差异。

有了这张账单，压缩器的验收标准就不只剩“压缩了多少字节”。只有 token 下降、恢复动作不升，质量和延迟也稳定，才能说任务闭环真的变轻。token 下降但恢复动作上升，说明应该扩大保留信息或降低压缩强度；平均指标稳定、长尾失败增加，则不该直接扩大流量。若 CLI 变好而 code review 变差，也不要急着寻找一个跨产品的统一结论，先承认优化对象变了。

这也是我从 GitHub 这篇文章里带走的最实用建议：先做成本会计，再做压缩。如果想继续看上下文、调用和编排如何把规模化 Agent 的成本放大，可以读站内的[《Agent 规模化后，最贵的不是模型》](https://ntlx.github.io/articles/agent-scale-cost-loop)。它与本文不是同一组实验，只适合用来补充观察边界。

如果你正在维护一个 coding agent，你会先改哪一层：删格式、压缩可恢复噪声、消除确定性轮次，还是重写 prompt？你会用哪一个指标证明自己没有把账单转给下一轮？

## 参考资料

- [GitHub Blog：How we make AI coding more cost efficient without sacrificing task quality](https://github.blog/ai-and-ml/github-copilot/how-we-make-ai-coding-more-cost-efficient-without-sacrificing-task-quality/)
- [RTK 官方文档](https://www.rtk-ai.app/docs/)：用于理解 shell 输出压缩与完整结果恢复之间的关系。
- [GitHub Changelog：Copilot code review analysis depth and efficiency updates](https://github.blog/changelog/2026-06-25-copilot-code-review-analysis-depth-and-efficiency-updates/)：跨 workflow 的旁证，数字不与本文实验合并。
- [Agent 规模化后，最贵的不是模型](https://ntlx.github.io/articles/agent-scale-cost-loop)：站内延伸阅读，讨论规模化 Agent 的成本回路。
