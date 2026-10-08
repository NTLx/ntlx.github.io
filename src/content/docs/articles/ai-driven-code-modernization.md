---
$schema: starlight
title: AI 改造旧系统，先把“什么证据能放行”说清楚
description: 代理生成改动更快，放行标准也要提前写下。团队得先说清要保留什么行为、什么证据能支持发布、无法判断时谁来补充审查。
date: 2026-10-08
category: ai-coding
primarySourceUrls: ["https://claude.com/resources/articles/how-to-prepare-for-ai-driven-code-modernization-projects"]
---

代码现代化项目把工作拆给代理后，很快会遇到几个实现之外的问题：新版本要保留哪些行为？哪些变化可以上线？异常时谁来判断？

Anthropic 的准备指南把目标、正确性证据、晋级策略和代理工作流放进同一套计划。我读完后更在意的是：团队有没有在改动量变大之前，约定好按什么证据放行。否则，代码产得越快，审查者越容易陷入“每一份改动都要从头读”的队列。

![AI 改造旧系统时，从定义目标、收集证据、分级审核到端到端试点的放行流程](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-08-ai-driven-code-modernization-00-infographic-core-summary.webp)

## “正确”要先落到具体目标上

原文区分了几种改造目标：保留技术栈、只升级版本；换技术栈但保持既有行为；或者连目标行为也重新设计。项目都叫现代化，验证时用的尺子却不同。

![三种代码现代化目标及各自不同的验收基线](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-08-ai-driven-code-modernization-01-infographic-modernization-modes.webp)

如果团队要的是行为不变，旧系统的输入输出、已知规则和边界行为就是重要基线。若业务希望借改造改变旧行为，就要先把新行为写成各方认可的规格。否则，代理生成的代码可能符合某一方的理解，另一方却把同一处改动判为错误。争论最后会落在代码评审里，实际缺少的是共同认可的目标。

我会在拆代码任务之前，先让团队对“正确”有共同的说法。开发者、业务使用者和最终要审查变更的人都该参与。机器能从代码里找出不少现存规则，哪些规则值得保留，还得由了解业务后果的人判断。

## 证书说明证据能支持什么

原文用 certificate 指一组改造变更必须满足的条件或测试。检查可以覆盖构建、静态分析、旧新版本差分、性能、安全扫描和暂存环境观测。它让团队能反复核对改动是否达到约定标准。

![证书检查只覆盖一部分行为，测试通过不等于全部正确](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-08-ai-driven-code-modernization-02-infographic-certificate-scope.webp)

绿色结果只能说明证据所覆盖的部分。Anthropic 的另一篇迁移文章报告，Bun 的既有测试在合并前通过，合并后仍发现并修复了回归问题。测试结论要连同测试覆盖的基线一起看。[迁移文章](https://claude.com/resources/articles/ai-code-migration)还建议用故意破坏的代码检查验证器本身：如果已知错误没有让检查失败，证书就还没证明它能拦住什么。

证书应写明每项检查针对哪类风险、结果能支持什么结论，以及遇到无法自动判断的情况该怎么处理。覆盖率、差分结果和安全扫描各自回答不同问题，不能只看一排绿色勾选。

## 审核分级决定剩余风险怎么承担

原文建议按改动影响范围和代理置信度设计审查层级：关键路径保留完整人工审查，低风险变更满足证书后可以走较轻的审核，没通过证书的变更转入人工复核。反复出现的同类问题，应促使团队修正证书或工作流，别让审查者一直重复同一项检查。

![原文展示的证书检查、分级审核与生产发布流程](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-08-ai-driven-code-modernization-source-promotion-path.png)

我理解这套分级是在安排有限的专家注意力，也是在公开约定组织愿意承担什么风险。组织仍要对轻审的适用条件和放行结果负责，因为它接受某一类证据作为发布依据。提前参与的除了开发者，也要有业务、发布、安全和实际承担线上后果的人。谁定标准、谁批准例外、谁接手失败，都该在流程里写明。

我此前写过一篇关于[Claude Code 与专家角色变化](https://ntlx.github.io/articles/claude-code-expertise)的文章。这份指南给那个讨论补上了组织层面的要求：专家把问题和验收标准说清之后，还得把这些判断写进一套团队共同使用的规则里，才能让规模化工作不依赖某位专家临时读完每个 diff。

## 试点要走完审批和上线那一圈

原文建议先在代码库的一小部分上端到端跑通，再决定是否扩大。试点要把代码生成、证书、人工审查、发布和故障处理连起来跑：目标是否有歧义，证书能否发现已知错误，未通过的变更交给谁，审查结果怎样转成上线决定，出问题后由谁接手。

![原文的分区试点流程：逐块冻结、运行工作流、验证、晋级并用 CI 防止旧改动回流](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-08-ai-driven-code-modernization-source-in-place-partitions.png)

旧系统无法在试点环境运行时，缺失的对照结果不能算作通过。Anthropic 的现代化插件会把这类结果标作“部分证明”，并说明还缺什么证据。报告里把未知项和证据缺口写清楚，后续判断才有依据。

启动现代化之前，我会先要求团队写清目标行为、放行证据和证书无法判断时的处理责任。随后选一块有代表性的代码，把生成、验证、审查、发布和故障处理完整走一遍。每个角色都清楚要留下什么记录、失败后交给谁，再扩大并行工作会更稳妥。

## 参考资料

- [How to prepare for AI-driven code modernization projects](https://claude.com/resources/articles/how-to-prepare-for-ai-driven-code-modernization-projects)
- [Large-scale code migrations with Claude Code](https://claude.com/resources/articles/ai-code-migration)
- [Code modernization plugin](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/code-modernization)
- 站内相关文章：[Claude Code 把专家重新暴露出来](https://ntlx.github.io/articles/claude-code-expertise)
