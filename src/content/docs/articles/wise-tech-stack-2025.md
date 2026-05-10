---
$schema: starlight
title: 读了Wise 2025技术栈，我发现真正厉害的公司都在做减法
date: 2026-05-01
description: 技术选型的答案不在工具列表里，在你敢不敢说「不」。
tags: [ write ]
identifier: 20260501T013740
author: 李继刚
coverImage: cover.png
---

凌晨翻到 Wise 工程团队发的 2025 技术栈更新，看完有一个感受——**真正成熟的技术团队，写的东西往往很无聊。**

不是他们没东西可写。1560 万活跃用户，每季度跨境转账 360 亿英镑，850 多个工程师，1000 多个微服务，从 6 个 Kubernetes 集群干到 20 多个。这个体量，随便拎一个出来都够写好几篇。

但他们写的东西，拆开看，全是你听过的名词。Java、Kotlin、Next.js、Kubernetes、Kafka、Redis、Snowflake。没有自研语言，没有颠覆性架构，没有「我们重新发明了 X」。

话说回来，这才是最吓人的地方。

## 无聊，是刻意的

你看他们的技术选型，第一反应可能是：就这？

Web 端用 Next.js 的自封装版本，移动端 iOS 用 Swift + SPM，Android 用 Kotlin + Compose。后端 Java + Kotlin。数据库 RDS + MongoDB Atlas。消息队列 Kafka。监控 Loki + Grafana + Tempo + Mimir。

每一样都是主流选择，没有一个是「只有我们在用」。

但等一下——如果你仔细看他们怎么用这些东西，味道就不一样了。

他们给微服务做了一个内部的 chassis 框架。不是框架的封装，是从零写的。原则只有一条：**最小配置**。安全、可观测性、数据库通信、Kafka 集成，全部内置默认值。团队拿过来就能用，不用自己拼。

他们用 Gradle 插件标准化了 700 多个 Java 仓库的 GitHub Actions 工作流。想在全公司范围改 CI 流程？升一下插件版本号就行。SLSA 安全合规 rollout，靠这个做到的。

他们做了一个语言无关的自动化服务，能对代码库做大规模变更，然后自动提 PR 给对应团队 review。Java 依赖升级，靠这个自动化掉的。

**工具是普通的。但把普通工具用到极致的工程能力，不普通。**

![普通工具做到极致](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-01-wise-tech-stack-2025-img-01.png)

这让我想起一件事。早年我也迷恋过「技术选型」这件事。总觉得选对了框架、用对了语言，问题就解决了一大半。后来发现完全不是这样。

真正拉开差距的，不是选了什么，是选了之后怎么做。

Wise 选了 Kubernetes，然后从零重写 Terraform 代码库，用 RKE2 做集群引导，Helm 替代 JSONNET，ArgoCD 做自动化部署。不是换了个工具，是把整个运维模型重构了一遍。结果是从 6 个集群扩到 20 多个，维护成本没有跟着爆炸。

他们选了 GitHub Actions，然后做了缓存预填充，50 万次月构建量下砍掉 15% 的构建时间——每月省 1000 多个工程师小时。不是换了个 CI，是把 CI 当产品来优化。

## 标准化是隐形的杠杆

文章里有一个数字我反复看了几遍。

Spinnaker 的自动化金丝雀分析，只放 5% 的流量到新版本，跑 30 分钟分析，异常就自动回滚。2024 年一年，这个系统自动拦截了数百次可能引发事故的部署。

数百次。

这意味着什么？意味着如果没有这个系统，这数百次部署会直接打到生产环境，然后有人半夜被 call 醒，然后排查、回滚、写 postmortem。现在，全自动，无人值守。

但这不是 Spinnaker 的功劳。任何公司买个 Spinnaker 都能配金丝雀发布。Wise 的功劳在于，他们把**超过一半的服务**都迁移到了这套流程上，并且预计 2025 年中完成全量迁移。

全量迁移。不是试点，不是 POC，是全部。

这背后是另一层东西——标准化。

Wise 有 40 个独立的 Web 应用，每个处理不同的产品功能。为什么不是一个大 monorepo？因为独立部署更安全、更可控。但 40 个应用怎么保持一致性？靠 CRAB——他们基于 Next.js 做的内部抽象层。

移动端也是。iOS 从 Xcodegen 迁移到 Tuist，从 Cocoapods 迁移到 SPM，250 多个 Xcode 模块，零变更构建时间从 28 秒降到 2 秒。Android 主仓库 300 多个 Gradle 模块，约 100 万行代码。他们做了 BFF 层让 Android、iOS、Web 团队共享业务逻辑，用 KSP 做代码生成，还在探索 Kotlin Multiplatform。

**每一处都在做同一件事：把重复的东西标准化，把标准化的东西自动化。**

![标准化是隐形的杠杆](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-01-wise-tech-stack-2025-img-02.png)

这不是技术决策，是组织决策。

850 个工程师，分布在全球各地，分成独立的 squad 和 tribe。如果每个人都可以自由选择工具、自由决定架构，这个公司三个月就乱成一锅粥。Wise 的做法不是限制自由，而是提供默认值——你用什么都行，但默认用这个，因为它已经帮你把坑填好了。

## 数据基础设施：从「能跑」到「跑得好」

Wise 的数据栈也很有意思。

他们没有停留在「数据库能跑就行」的阶段。MariaDB 和 Postgres 从 EC2 迁移到 RDS，MongoDB 从自建迁移到 Atlas。为什么？不是为了赶云原生的时髦，是为了把运维开销砍掉，让工程师专注做功能，而不是跟数据库扩容搏斗。

他们引入了 Temporal 做工作流编排，专门处理切换和恢复测试这类关键任务。用 RDS Performance Insights 和 Percona Monitoring 做数据库监控，问题还没爆发就能看到苗头。

数据流动层，Kafka 是主力。但他们的 Kafka 集群加了 rack-aware 备用副本，做了容错。内部数据搬运服务能把 Kafka 或数据库的数据推到 Snowflake、S3 Parquet、Iceberg 等各种目的地。配置过程有自动检查，减少人为错误。

还有一个东西叫 Data Archives，归档了超过 1000 亿条记录。不是为了存档而存档，是为了降低数据库成本、简化备份和恢复。

**他们在数据上花的功夫，和他们在产品上花的功夫一样多。**

![数据基础设施架构](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-01-wise-tech-stack-2025-img-03.png)

这一点很多公司做不到。产品功能看得见摸得着，老板喜欢。数据基础设施是隐形的，做好了没人夸，做坏了也没人知道——直到出事。Wise 的选择是，把隐形的基础设施当成产品来建设。

他们的 ML 架构也是这个思路。SageMaker Studio 做实验，Spark on EMR 做大规模处理，Airflow 编排全流程，SageMaker Feature Store 管理数百个特征，MLflow 追踪实验和模型版本，Ray Serve 做线上推理。从探索到生产，全链路打通。

甚至还做了一个 LLM 网关，接了 Claude、Bedrock、Gemini、OpenAI 多个模型提供商。Python 库封装 API，加速原型开发。内部文档和知识库有自定义 RAG 服务。

这些东西单独看都不新鲜。但组合在一起，就是一个完整的数据智能平台。不是拼凑，是设计过的。

## 可观测性：从「出了事再看」到「提前看到」

LGTM 栈——Loki、Grafana、Tempo、Mimir。

这套东西现在在开源监控领域算是标配了。但 Wise 的规模让「标配」变得不普通。

每秒摄入约 600 万个 metric 样本，最大 metric tenant 处理 1.5 亿活跃时间序列。这个量级下，Thanos 扛不住了，所以他们换成了 Grafana Mimir。还专门建了可观测性的 CRP 集群，服务跑在不同环境里自带监控，不用手动配。

他们还在试点 Grafana Pyroscope 做 profiling，探索性能优化的新维度。

**可观测性的本质不是监控，是理解。** 监控告诉你系统挂了，可观测性告诉你为什么挂、什么时候会挂、怎么让它不挂。

![LGTM 可观测性栈](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-01-wise-tech-stack-2025-img-04.png)

Wise 在这件事上的投入，反映了一个更深层的认知：当你的系统足够复杂，人脑已经无法理解全貌的时候，你必须有一套工具帮你理解它。不是出了问题再查日志，而是随时能看到系统的全貌。

## 所以答案是什么

回到开头那个问题：为什么 Wise 的技术栈看起来这么无聊？

因为**成熟的技术团队不靠工具列表证明自己**。他们靠的是：

* 把普通工具用到极致的工程能力
* 把重复工作标准化、自动化的纪律
* 把基础设施当产品建设的耐心
* 在规模扩张时不失控的组织设计

这些东西写在技术栈文章里不好看。没有自研数据库，没有革命性架构，没有「我们重新发明了 X」。但正是这些东西，让 850 个工程师能在 20 多个 Kubernetes 集群上安全地跑 1000 多个服务，每季度处理 360 亿英镑的跨境转账。

技术选型的答案从来不在工具列表里。

在你敢不敢对花哨的东西说「不」，在你愿不愿意把无聊的事情做到极致。

话说回来，能做到这一点的公司，本来就不多。

***

你觉得你们团队的技术栈，是在做加法还是做减法？有没有哪个「无聊」的技术决策，最后证明是最正确的？

## 原文参考

> Milon James. **Wise Tech Stack (2025 update)**. Wise Engineering on Medium.
> <https://medium.com/wise-engineering/wise-tech-stack-2025-update-d0e63fe718c7>
