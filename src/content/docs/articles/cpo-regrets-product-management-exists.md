---
$schema: starlight
title: “我们遗憾 PM 这个岗位存在”：当硅谷 CPO 撕下“产品剧场”的最后底裤
description: 硅谷降本增效的终点不是裁员，而是剔除“做对齐、写 PRD、排 Schedule”的组织胶水。Whatnot CPO 抛出强约束：不为 Pod 凑人头，只保留用 AI 写 Spec、做数据、扎根一线做真实 IC 的超级产品人。
date: 2026-08-04
category: ai-industry
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-04-cpo-regrets-product-management-exists-img-00-infographic-core-summary.png)

在绝大多数科技公司里，产品经理（PM）早已被塑造成一种不可或缺的“组织基础设施”。每个业务团队（Pod）按部就班地配齐 1 个 PM、1 个 Designer 和 6 个 Engineer，似乎没有 PM 拿着 JIRA 跟踪进度、写 PRD，代码就无法变成商业成果。

然而，美国增长速度最快（GMV 突破 80 亿美元）的直播电商平台 Whatnot，其产品团队在成立第一天就立下了一条近乎挑衅的硬规则：**“我们遗憾产品管理（PM）这个岗位必须存在。”**

这句话出自 Whatnot CPO Tom Verrilli（前 Twitch CPO、前 Twitter 产品增长总监）。在最新一期 *Lenny's Podcast* 对话中，他道破了一个在硅谷被暗中讨论了很久、却极少有人敢公开说出口的真相：**传统产品管理模式正在陷入严重的“产品剧场（Product Management Theater）”。而 AI 时代的到来，正在加速这场剧场的破产。**

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-04-cpo-regrets-product-management-exists-img-01-pod_ratio_vs_senior_ic.png)

## 1:6 配比的陷阱：被组织冗余吞噬的“胶水型 PM”

为什么顶级 CPO 会对自己的职能发表如此反直觉的声明？

Tom Verrilli 解释道，这句话绝不是某种盲目的“反 PM 狂热”，而是一种极强的**组织强约束（Forcing Function）**。它的本质是问一个问题：如果一个团队没有 PM 也能高效运转，为什么一定要加一个 PM？

在过去十年的互联网繁荣期，绝大多数公司采用了“按比例配置 PM”的工业化模式——按固定人头比例（如 1:6 或 1:8）给工程团队塞 PM。这种机制制造了一个巨大的副产物：**大量并没有清晰商业问题要解决、却被迫被安排去“管理产品”的中层 PM。**

硅谷知名产品专家 Marty Cagan 曾将这种现象称为“产品剧场”（Product Management Theater）。在剧场里，PM 们每天极其忙碌：开无穷无尽的对齐会、在 Slack 里来回沟通、撰写长达几十页却无人仔细阅读的 PRD、把需求拆成一堆细化的 JIRA Ticket。他们以为自己在“做产品”，但实际上他们充当的仅仅是**“组织胶水（Organizational Glue）”**——在信息不对称和流程冗长中起缓冲作用。

当一个岗位的大部分精力都花在“跨部门对齐”和“证明自身存在价值”上时，真正的产品发现（Product Discovery）和商业判断反而被边缘化了。

## AI 时代下，“组织胶水”的价值正在清零

如果说过去“胶水型 PM”还能依靠协调沟通和流程管控维系存在感，那么 AI 工具链的普及，则彻底将这种模式推向了死角。

随着 Cursor、Claude Code、Codex 等 AI 辅助工具深入工程流程，需求书写、数据查询甚至原型构建的门槛被无限拉低。工程团队和创始人可以直接跨过冗长的传递链条，快速完成从想法到验证的闭环。

正如我们在分析 [《当代码与设计不再稀缺，Netflix 为什么把宝压在“系统思考者”身上？》](https://ntlx.github.io/articles/netflix-systems-thinkers) 时所指出的，在基础设施日益极其强大的时代，细分工种的界限正在迅速模糊。当沟通成本和实现成本同时下降，夹在用户与工程师中间“做翻译和排期”的层级显得极其多余。

Whatnot 的做法是彻底解构传统 Pod 比例制。他们不设固定的业务 Pod 绑定，而是采取 6 个月周期的“基于问题的规划（Problem-Based Planning）”。PM 不再是工程团队的“领头羊”或“保姆”，只有当某个高价值商业问题必须有人进行深度的产品设计与系统思考时，才会派驻资深 PM。

在 Whatnot，保留下来的 PM 极度精简，且必须是 **超级高级 IC（Senior IC PM）**。这些 PM 超过 90% 的时间都在做直接的产出工作：自己做数据分析、自己写技术架构级的 Spec，甚至直接使用 AI 工具辅助写代码。他们不是传声筒，而是能独立打赢硬仗的战斗机。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-04-cpo-regrets-product-management-exists-img-02-accordion_leadership_model.png)

## “拉手风琴”模型：撕掉“放权放任”的假面具

不仅在 PM 编制上打破常规，Tom Verrilli 在团队管理模式上也给出了极其犀利的批判。

硅谷一直流传着句被奉为圭臬的管理名言：“招聘优秀的人，然后放手让他们干（Hire great people and get out of their way）”。在 Tom 看来，这种理念在实际操作中往往沦为**管理失职（Management Abdication）**。

完全放手往往带来两种恶果：要么管理者对真实业务风险失去感知，等出大问题时为时已晚；要么团队在缺乏清晰视域的情况下陷入内耗。

为此，Tom 提出了自己的产品领导力模型——**“拉手风琴（Play the Accordion）”**：

- **拉开手风琴（宏观视域）**：给团队足够的空间、战略方向与资源支持，观察其自主运转。
- **合拢手风琴（深度干预）**：当遇到高风险项目、关键战略拐点或团队遇到瓶颈时，管理者必须果断下沉到最微观的细节里（Dive deep），与 IC 一起看数据、审方案、改细节。

优秀的领导者不应该保持固定的管理距离，而应该像拉手风琴一样，在“宏观视域”与“微观细节”之间根据业务节奏灵活、无缝地伸缩。

## 重新定义产品人：从“流程管理者”到“系统思考者”

从 Whatnot 到 Anthropic，硅谷顶级团队对 PM 角色的重塑正在指向同一个终点。我们在 [《当 PRD 被 Evals 替代：Anthropic 首位 PM 吐露的 4 个战略反直觉》](https://ntlx.github.io/articles/dianne-penn-anthropic-first-pm) 中也看到过类似的趋势：未来的 PM 不再靠“流程”取胜，而是靠“判断力”和“系统能力”取胜。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-04-cpo-regrets-product-management-exists-img-03-ai_super_ic_spectrum.png)

当“产品管理剧场”的帷幕落下，未来的产品人需要具备三个核心转变：

1. **从胶水型中层转向超级 IC**：具备极强的个人动手能力，熟练运用 AI 工具掌控数据分析、产品设计与技术评估，不依赖下属或跨部门团队来完成基础产出。
2. **从细分功能专家转向系统思考者（Systems Thinker）**：能够看清商业模式、工程约束、用户心理与数据流向之间的复杂联系，做出非线性的关键决策。
3. **从依赖 Pod 配比转向问题导向攻坚**：不再把“我有多少人头”当成能力象征，而是把“我解决多复杂的商业问题”作为衡量标准。

“我们遗憾 PM 这个岗位存在”，这句话的核心从来不是消灭产品思考，而是消灭那些附着在岗位之上的官僚体系与产品剧场。在 AI 时代，真正优秀的产品人不会被取代，但那些只懂管理流程、不懂系统与实操的“剧场演员”，留给他们的时间确实不多了。

*你在日常工作中有没有经历过“产品剧场”？你认为 AI 时代下，PM 岗位最重要的能力是什么？欢迎在评论区分享你的看法。*

## 参考资料

- [This CPO regrets that product management exists | Tom Verrilli (CPO of Whatnot)](https://www.lennysnewsletter.com/p/this-cpo-regrets-that-product-management)
- [Building, and Whatnot | Tom Verrilli](https://www.linkedin.com/pulse/building-whatnot-tom-verrilli-bwkdc)
- [Product management theater | Marty Cagan](https://www.lennysnewsletter.com/p/product-management-theater-marty)

## 延伸阅读

- [当代码与设计不再稀缺，Netflix 为什么把宝压在“系统思考者”身上？](https://ntlx.github.io/articles/netflix-systems-thinkers)
- [当 PRD 被 Evals 替代：Anthropic 首位 PM 吐露的 4 个战略反直觉](https://ntlx.github.io/articles/dianne-penn-anthropic-first-pm)
