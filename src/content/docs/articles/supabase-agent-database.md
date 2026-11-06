---
$schema: starlight
title: 当 Agent 开始管理数据库，谁来理解那次迁移？
description: Agent 可以更快地创建后端，但数据库的真实考验在创建之后：变更能否审查、数据能否保全，以及应用长大时能否迁移。
date: 2026-11-05
category: ai-agents
primarySourceUrls: ["https://latent.space/p/supabase/"]
---

让 Agent 给应用增加一个字段，听起来像一件很小的事。它读代码、修改表结构、生成迁移，然后告诉你功能完成。可如果需求其实是给旧字段改名，生成的迁移却先删除旧列再创建新列，原来的数据会怎样？

读完 Latent Space 对 Supabase 创始人的访谈，我一直在想这个问题。Supabase 希望让 Agent 更容易创建和使用后端：数据库结构放进代码仓库，本地环境更容易启动，计算任务可以靠近数据库运行。这些方向都很有吸引力，但它们也把一个老问题推到眼前：当创建变得几乎没有摩擦，谁负责理解一次变更的后果？

访谈主持人 swyx 披露自己是 Supabase 的早期投资人。因此，下文将创始人的描述作为理解公司决策的材料，不把他们的增长叙述或主持人的推荐排名当作独立验证的行业结论。

![Agent 管理数据库的三个环节](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-05-supabase-agent-database-img-00-infographic-core-summary.png)

## 把数据库放进 Agent 看得见的地方

应用代码通常放在仓库里，数据库的实际形状却可能散落在迁移历史、控制台操作和运行中的实例里。人类接手项目时要费力拼起来；Agent 要修改代码时，也会遇到同样的上下文缺口。

Supabase 的回答是声明式 schema：把期望的数据库结构写成 SQL 文件，与应用代码放在一起。访谈里，创始人希望 Agent 直接读取和编辑这些文件，而不用只靠一长串历史迁移猜测当前结构。对审阅者来说，文件差异也更容易对应到具体需求。

但声明式并没有让迁移消失。Supabase 的 [pg-delta 说明](https://supabase.com/blog/declarative-schemas-2-0-pg-delta)介绍，工具会把 schema 文件和迁移历史分别装入临时数据库，比较后生成新的 SQL 迁移。最终执行什么，仍然需要检查。

![从期望结构到迁移审查](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-05-supabase-agent-database-img-01-flowchart-schema.png)

开头的字段改名也不是假想的边缘案例。官方文档明确指出，工具可能把改名解释成删除旧列、添加新列；直接执行会丢失旧列数据。它可以提示破坏性操作，却无法仅凭结构差异知道人的意图。文档也明确说，零停机发布编排不在这个工具的范围内。

这让我觉得，Agent 友好的后端至少需要两份上下文：一份描述想要什么，另一份说明变更如何安全抵达那里。前者适合放在 schema 文件里；后者可能包括数据回填、兼容期、锁定时间、回滚条件和生产负载。文件可读是很好的起点，但审查不能只看文件最后长什么样。

## 应用很小，代价也要足够小

访谈中的另一个转向是数据库的数量。创始人设想，越来越多的人会让 Agent 为一个点子创建应用。大多数应用初期的数据量和流量都很小，如果每个尝试都要求完整、持续运行的数据库实例，基础设施成本就会成为问题。

这解释了 Supabase 宣布[收购 Turso](https://supabase.com/blog/supabase-is-acquiring-turso)的动机。官方文章描述的方向是让小型数据库按需加载和休眠，同时为成长中的应用提供通向更完整后端的路径。访谈中提到的 Spark 和平滑升级仍应视为产品方向，不能把愿景当作已经兑现的迁移体验。

另一端是已经长大的应用。Multigres 面向高可用等问题，访谈中也谈到未来的分片。这里需要留意发布状态：Supabase 官方将其列为 private alpha，说明该阶段用于测试，并非生产工作负载；访谈中创始人也说分片尚未发布。可以关注它的设计，但现在无法据此认定从原型到大规模系统的整条路已经铺好。

两端放在一起看，很能说明平台的难题：创建海量小数据库，和让一个数据库承受更大负载，需要解决的并不是同一个问题。更难的是中间的转换。应用逐渐成为真实业务时，数据、权限、连接方式和停机容忍度都可能变化。对用户而言，升级按钮是否方便很重要；按钮背后能否验证数据一致性、失败后如何恢复，同样重要。

## 默认推荐会带来便利，也会带来路径依赖

访谈中，主持人观察到模型经常向应用开发者推荐 Supabase。创始人将这种可见性与长期积累的社区内容、开源和产品定位联系起来。这是合理的解释，但访谈没有提供足以拆分各因素作用的对照证据。

![Latent Space 原文的 AEO 跟踪截图，显示其问题和模型配置下的结果](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-05-supabase-agent-database-img-02-source-aeo.png)

我更关心推荐发生之后的事。人让 Agent 做一个应用，Agent 选定熟悉的后端、创建表和权限，再继续编写功能。这些步骤节省了决策时间；等产品有了真实用户，换掉数据库的成本却可能远高于最初选择它的成本。

所以评价一个面向 Agent 的平台，除了看它能不能被快速接入，还应看它能否解释自己做了什么：生成了哪些表，谁可以读写，哪些凭据被使用，数据如何导出，以及哪一步需要人确认。这和此前讨论的 [Agent 工具权限边界](https://ntlx.github.io/articles/anthropic-brain-and-hands)相通：让 Agent 能操作系统之后，还要让人看得见并约束它能做的事。

这并不意味着每个原型都要按核心交易系统的标准部署。探索阶段可以接受更轻的流程，但当应用开始存储真实用户数据、收费或承担业务时，应该重新检查权限、备份和迁移，而不是沿用最初为了跑通演示做出的默认设置。

## 让容易开始，也让后果容易看见

Supabase 展示的方向让我乐观：数据库结构进入仓库，本地环境减少依赖，长时间运行的计算任务有机会靠近数据。这些改进对人类开发者同样有价值。与此同时，官方将新的本地原生运行时标为默认关闭的 alpha，Compute 也在 private alpha；实际采用时还要重新核对产品状态。

我的判断是，Agent 时代的后端竞争不会只发生在“谁能让模型最快建出一个应用”。它也发生在应用运行一段时间之后：当字段需要改名、权限需要收紧、数据库需要升级时，平台能否把风险和可选动作清楚地交给负责的人。创建变得容易，是好消息；让后续的判断有据可依，才会让这种容易持续下去。

## 参考资料

- [Why Agents Love Supabase，Latent Space](https://latent.space/p/supabase/)
- [Declarative Schemas 2.0 with pg-delta，Supabase](https://supabase.com/blog/declarative-schemas-2-0-pg-delta)
- [Build anything，Supabase](https://supabase.com/blog/select-2026-build-anything)
- [Scale without limits，Supabase](https://supabase.com/blog/select-2026-scale-without-limits)
- [Supabase is acquiring Turso](https://supabase.com/blog/supabase-is-acquiring-turso)
