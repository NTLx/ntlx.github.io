---
$schema: starlight
title: 代码是负债不是资产：为什么 AI 狂热 4 年后，我们依然是个怀疑论者？
description: 生成代码的边际成本归零，不等于软件工程的生产力跃迁。当大模型把代码变成没有理论附着的廉价负债，真正的护城河永远是对复杂系统的心智所有权。
date: 2026-08-17
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-17-why-i-remain-an-ai-skeptic-img-00-infographic-core-summary.png)

在全行业几乎被“AI 将在数年内取代程序员”、“一人公司即将诞生”的宏大叙事彻底包裹的当下，知名 Rust 资深开发者、Chumsky 与大型开源体素游戏 Veloren 的作者 Joshua Barretto，写下了一篇极具冲击力的短文——《Why I remain a skeptic》。

他的开篇没有任何客套：“在过去四年里，我从未在任何我真正在乎的严肃软件中使用过大语言模型。”

这并不是一个保守主义者的技术恐慌，而是一位开源项目深扎在 FAANG 巨头依赖树里的核心维护者，在一线工程泥潭中交出的冷峻观察。在经历了四年狂热、全行业累计砸下超过 1.5 万亿美元的算力与基建投资后，关于 AI 到底能否构建非平凡（non-trivial）复杂软件的核心疑问，不仅没有被解决，反而正在暴露出越来越深的工程裂痕。

## 4 年狂欢与 1.5 万亿神话：为什么宏观软件交付几乎没有变好？

如果我们把目光从社交媒体上铺天盖地的 10 秒 Demo 中抽离出来，审视整个软件工业的真实水位，会发现一个极其尴尬的事实：

软件并没有变得更快，架构没有变得更健壮，系统的安全漏洞没有减少，严肃软件的研发成本也丝毫没有出现断崖式下降。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-17-why-i-remain-an-ai-skeptic-img-01-theory_building_vs_theoryless_code.png)

行业里充斥着海量被 Joshua Barretto 称为“任何严肃机构都不会用长杆去碰的劣质 Demoware”。每当一场真正的技术革命降临时，旧的帝国会迅速崩塌，由携带颠覆性新思想与新架构的玩家取而代之；然而在这四年里，除了在“AI 崇拜”的自嗨回音壁里不断拔高嗓门，我们几乎看不到整个行业在基础软件架构层面产出了任何实质性的新思想。

为什么“打字速度快了十倍”，宏观软件工程却没有发生质的跃迁？

根本原因在于严重的**度量衡错配**。行业长期以来把“代码行数”、“PR 合并速度”、“单点功能生成”等微观指标等同于“生产力”。但软件工程的本质从来不是击键速度。在真实的工程交付链条中，敲击键盘写下代码往往只占不到 15% 的时间，剩下 85% 的精力全都在于理解混乱的现实需求、在脑中推演边界条件、权衡跨模块状态依赖，以及对每一次系统变更负起不可推卸的安全与可靠性责任。

AI 确实让微观代码的生成边际成本无限趋近于零，但它丝毫没有降低宏观理解与系统验证的认知成本。

## Peter Naur 的 40 年预言：代码是输入与负债，不是产出与资产

要理解为什么大模型代码会让维护者痛苦不堪，必须重温图灵奖得主 Peter Naur 在 1985 年写下的划时代论文——《Programming as Theory Building》（编程即理论构建）。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-17-why-i-remain-an-ai-skeptic-img-02-code_churn_cognitive_debt.png)

Peter Naur 在四十年前就指出：**编程的核心活动从来不是生产源代码，而是程序员在心智中构建关于问题域、业务约束与架构取舍的“理论（Theory）”**。

代码仅仅是这一心智理论在特定时刻有损记录下来的文本投影（Lossy Representation）。如果持有该理论的人类团队消亡，任何后来的维护者单凭阅读这堆代码，都无法完整还原当时做出设计决策的因果链条。一旦对失去心智理论附着的代码进行盲目修改，整个系统的内在一致性就会迅速瓦解，滑向不可逆的腐烂。

当下大模型生成的代码，恰恰是彻头彻尾的**无理论代码（Theory-less Code）**。

大模型是一个极其出色的统计学符号补全器，它能模仿出符合语法的函数、工整的缩进以及看似合理的注释，但它的“脑子”里根本没有关于这个系统为什么选择某种状态机而非另一种策略的因果模型。它不知道重力的存在，更不知道五万行代码之外的内存生命周期约束。

GitClear 在 2023 至 2026 年间对超过 6 亿行代码的长期跟踪研究，为这一现象提供了残酷的量化证据：
- **代码异动率（Code Churn）翻倍**：刚写完不久就必须推倒重写或删除的代码比例从 3.3% 飙升到了 7.1% 以上；
- **重构活动断崖式下跌 70%**：开发者越来越习惯于用 AI 堆砌增量补丁（Shipping），而几乎不再有人愿意深入系统内部梳理与重构既有架构（Shaping）；
- **代码重复激增 81%**：大模型带来的“复制-粘贴式生成”让仓库急剧碎片化。

正如我们在[《AI 写的代码，谁来审？》](https://ntlx.github.io/articles/agent-pr-review)中所讨论的，代码不是系统的资产，每一行写进主干的代码都是未来的负债。当大模型把制造负债的速度提升十倍，而人类审查和维护负债的带宽保持不变时，仓库迎来的只能是系统级的认知破产。

## 智力劳动的同质化流水线：当人人都是“通才”，大厂在算什么账？

既然大模型在严肃长周期软件中的实际效能疑点重重，为什么科技巨头依然在不遗余力地把 AI 编码推向每一个开发者的桌面？

Joshua Barretto 指出了一个极其露骨的劳动力经济学真相：**大厂推行大模型的隐秘目标，是将曾经具有高壁垒的智力劳动同质化（Homogenise），从而使其变成随时可替换的通用品（Fungible Commodity）**。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-17-why-i-remain-an-ai-skeptic-img-03-labor_fungibility_guild_mindset.png)

软件工程曾经是现代工业体系中极少数保留了中世纪“手艺公会（Guild）”特征的领域——依靠深厚的心智模型、多年沉淀的领域直觉和不可替代的架构洞察，高级工程师拥有极强的个人议价权。

然而，大模型工业化的逻辑，是把原本需要十年经验才能完成的架构设计与实现，拆解并封装进统一的提示词交互中。当所有人都使用相同的大模型写出 70 分的通用代码时，劳动者的个体差异被抹平，工人的议价能力随之被瓦解。

但这恰恰是一个巨大的战略陷阱。在[《30秒出报告，但关键不是快——是知道什么时候不用AI》](https://ntlx.github.io/articles/machinacheck)中，我们曾强调过：高级工程判断的核心，从来不是盲目接纳所有自动化，而是准确知道在什么边界下坚决不能使用黑盒。

盲目沉溺于大模型辅助的开发者，正在不知不觉中出让自己的“心智理论构建能力”，变成流水线上负责对 AI 生成结果按回车键的验收员。

## 无法被 memcpy 的护城河：从通用代码生成者退回深层系统所有者

面对这场声势浩大的同质化浪潮，Joshua Barretto 给出了一个反直觉的生存策略：**主动拒绝将核心心智外包给大模型，给自己在更狭窄、更硬核的领域留出专注精进的空间**。

四年过去了，没有人因为不使用 AI 夺走他开源项目的声誉与生态地位。正如他所说：
> “你可以用 AI 轻松复刻我的代码功能，但这就像执行一次简单的 `memcpy`。一个能让顶级团队放心将核心系统托付于其上的开源项目，其价值远不止于一张功能清单。”

开源项目的真正护城河，是长年累月在一线对抗极端边界条件所建立的**信任（Trust）**与**所有权（Accountability）**。当生产事故发生时，能够顶住压力在几万行复杂系统里快速定位根因、做出精准架构决断的人，永远是那个脑海中持有完整理论模型的 Theory Builder，而不是向大模型连环发问的打字员。

未来的软件工程分化正在变得清晰：
- 一端是用大模型以极低成本批量生产一次性胶水代码、快速原型与低附加值界面的“通用品装配工”；
- 另一端则是深耕底层编译器、高并发架构、核心密码学与关键基础设施，手握不可替代心智模型的“系统所有者”。

代码从来不是目的，代码只是思考的代价。在这场漫长的浪潮里，最清醒的自保不是跑得比大模型更快，而是守住那些永远无法被 `memcpy` 复制的心智阵地。

*在你的日常开发中，AI 究竟是帮你建立了更清晰的系统心智模型，还是在悄悄用海量的无主代码增加你的维护负担？*

## 参考资料

- [Why I remain a skeptic — Joshua Barretto](https://blog.jsbarretto.com/post/i-remain-a-skeptic)
- [Programming as Theory Building — Peter Naur (1985)](https://pablo.rauzy.name/dev/naur1985programming.pdf)
- [Coding on Copilot: 2023–2026 Data on Code Churn and Quality — GitClear](https://www.gitclear.com/research)
- [Joshua Barretto (@zesterer) GitHub Profile & Projects](https://github.com/zesterer)
- [Hacker News Discussion: Why I remain a skeptic](https://news.ycombinator.com/item?id=41258832)

## 延伸阅读

- [AI 写的代码，谁来审？](https://ntlx.github.io/articles/agent-pr-review)
- [30秒出报告，但关键不是快——是知道什么时候不用AI](https://ntlx.github.io/articles/machinacheck)
- [全员 Vibe Coding 是个陷阱：读 Cloudflare OS 内部 AI 落地架构有感](https://ntlx.github.io/articles/cloudflare-ai-os-reader-response)
- [别再被 80% 的 AI 采用率骗了：为什么说企业 AI 落地是个伪命题？](https://ntlx.github.io/articles/ai-adoption-is-a-myth)
