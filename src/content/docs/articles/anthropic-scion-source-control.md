---
$schema: starlight
title: Anthropic 换掉 Git，放弃了什么
description: Scion 的收益有明确前提：在线客户端、超大仓库和整套工具链迁移。普通团队可以先借鉴按需查询与共享缓存，再单独评估合并规则。
date: 2026-10-24
category: engineering
primarySourceUrls: ["https://www.anthropic.com/research/redesigning-source-control"]
---

一个 CI 任务只想知道某个文件是谁改的，或者两次提交之间差了什么。为了回答它，我们要先给它准备多少仓库数据？

读 Anthropic 的 [Scion 介绍](https://www.anthropic.com/research/redesigning-source-control)，我觉得这个问题比“要不要换掉 Git”更值得带回自己的项目。它迫使人重新看待那些习以为常的步骤：下载仓库、更新副本、准备工作区，然后才开始干活。

Anthropic 的回答很彻底：让版本控制服务直接回答问题，客户端只取自己需要的数据。这么做省下了不少工作，也放弃了一些通用工具必须照顾的能力。读完之后，我更想借鉴它怎样删掉不必要的工作，对照搬整套方案则谨慎得多。

![Scion 的收益与前提：本文概括的收益、适用前提与合并治理边界](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-24-anthropic-scion-source-control-img-00-infographic-core-summary.png)

## 先看它到底在服务谁

按 Anthropic 的说法，2026 年五月，每日合并约 2,500 次代码变更；九月已经超过 30,000 次。光 CI 每天就有约 2,500 万次代码检出。这里的 checkout，是把某个版本的代码准备成任务能使用的文件。

原文的增长曲线值得看，但它描述的是合并数量。我们没法从这张图知道增加了多少有效功能，也不知道返工占了多少。不过，版本控制确实得接住这些陡增的操作。

![Anthropic 原图：2026 年每日合并量；黑线为七日均值，合并量不代表变更价值](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-24-anthropic-scion-source-control-img-01-original-merges-per-day.png)

Git 并没有忽略大仓库。浅克隆、稀疏检出，以及按需获取对象的机制都已存在，Anthropic 也说自己用过这些办法，还运行过大量镜像。麻烦在于，随着主干加速向前跑，镜像、快照和部分历史之间的配合越来越难维护。

更特殊的前提是：它的大部分客户端是在线运行的 agent 和任务。既然这些消费者本来就在依赖网络，团队便愿意进一步接受客户端能力的收缩，把更多工作交给服务器。

对需要离线开发、跨组织协作、依赖现成 Git 工具链的团队，这笔交换未必划算。Scion 的适用范围，从这里就开始收窄了。

## 把仓库问题交给服务，把文件按需交给任务

在 Scion 里，历史查询、blame、提交、合并和 rebase 等操作由服务端承担。一个任务只需要 diff，就请求 diff；只需要改动文件，也可以通过 API 完成，不必先准备工作副本。

我会把它理解为一套供开发工具调用的基础服务。代码审查、自动回退、定位引入问题的变更，都能使用共同的查询能力。每个工具少维护一份仓库状态，也少承担一份同步和故障恢复的负担。

支撑这种分工的，是 changeset 和派生数据的拆分。changeset 记录相对第一父节点改了哪些文件，以及文件内容的寻址指针；文件历史、blame、提交图索引等，则从这些记录派生，可以选择提前算好，也可以等查询时再算。

原文的结构图把这件事画得很清楚：变更元数据、文件内容和派生出的树，各有自己的位置。这里的意思也不是 Git 会为每次提交物理复制整棵目录树，比较的是记录与计算的组织方式。

![Anthropic 原图：changeset 元数据、文件内容与服务端派生树的关系](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-24-anthropic-scion-source-control-img-02-original-changeset.png)

这条路有前人。Anthropic 在脚注里明确提到 Meta 的 Mononoke 和 Bonsai；我打开它链接的源码，能看到 Bonsai 的 `parents` 和 `file_changes` 字段。Google 关于 Piper 的论文也早已描述了云端工作区。agent 放大了采用这些设计的压力，设计本身有积累。

普通团队未必需要自建版本控制。先让反复查询提交关系的工具共用一个服务，让只读少量文件的任务避免完整准备工作区，就可能是更合适的起点。

## 缓存越好用，越要守住失败时的路径

Scion 的对象访问分了层：同一节点上的任务共享 `scion-daemon`，未命中再问区域内的 `scion-cache`，最后由权威服务访问 Spanner 或云存储。文件内容和相关对象按内容寻址、不可变，缓存不用反复确认同一个对象是不是又变了。

我喜欢这套设计的地方，是它顺着任务的重复性来省工作。同一台机器上启动许多任务，没必要各自下载和整理相同对象；已经拿到的对象，也没必要在断点恢复时重新打包传输。

但原文还专门写到：虽然各层协议相同，部署时依然严格限制访问层级。区域缓存故障时，如果所有客户端都直接冲向权威服务，局部故障就可能变成全局故障。缓存架构的价值，要连同这条限制一起看。

![Anthropic 原图：Scion 的控制面与对象访问层级，区域缓存承接对象请求](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-24-anthropic-scion-source-control-img-03-original-scion-architecture.png)

写入也没有变成毫无协调的世界。Scion 仍支持 ref，更新它使用 Spanner 单行的比较并交换操作，只是与创建 changeset 分开。不可变对象可以广泛复用，代表共享进度的指针仍须有明确的更新规则。

此前我写过 [GitHub 为 agent 规模扩容 Git 基础设施](https://ntlx.github.io/articles/agent-scale-git-write-path)。两篇放在一起看很有意思：GitHub 要照顾既有生态，Anthropic 可以连客户端和周边系统一起重建。负载相似，能接受的迁移代价不同，方案自然会分开。

## 合并后修复的代价，需要另算

读到合并队列那一段，我停了下来。Anthropic 说，他们没能有效复现依赖全仓全局锁的标准合并队列，转而投入合并后、部署前的自动测试，也承认并发变更会冲突。

这与前面减少数据搬运的取舍不同。文件少下载一次，收益比较直观；检查放在合并前还是合并后，改变的是错误能传播到哪里。

如果问题在部署前就能隔离，回退也便宜，后置检查可能值得尝试。涉及数据迁移、权限和不可逆外部操作时，我会保留更强的前置验证。修补代码很快，并不能保证被改变的数据和外部状态同样容易恢复。这是我的工程判断，原文没有提供足够事故数据来替所有团队作决定。

![本文判断示意：按错误能否隔离、状态是否易于回退来评估检查位置](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-24-anthropic-scion-source-control-img-04-comparison-merge-checks.png)

人的工作也没有随之消失。文章提到，agent 曾试图线性扫描提交日志来寻找合并状态，而正确的信息应该向代码审查工具询问；对抗审查还曾催生过度验证和复杂度。团队仍然审查每个 change request，只是更关注修改意图。

我更在意这些细节。工程师要知道哪个系统掌握事实、哪条限制不能绕过，也要识别一段看似认真防御的代码是否在制造新负担。

## 合并量涨上去之后，还要问改动值不值

原文性能图给出了不同操作的中位耗时：CI checkout 从 31 秒降到 3.5 秒，约快 8.8 倍；agent 环境里，每个 change request 的版本控制总耗时从 34 分钟降到 3.7 分钟。这些改进很有分量，但不能直接读成端到端研发效率提升了同样倍数。

![Anthropic 原图：各类版本控制操作的中位耗时；CI checkout 为 31 秒与 3.5 秒](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-24-anthropic-scion-source-control-img-05-original-performance.png)

Anthropic 也主动交代了边界：迁移需要配套的代码审查、搜索和 CI，内部使用 token 的预算又很特殊。七人用五个月完成构建和迁移，是这组条件下的团队经验，不能据此估算别的组织应该裁掉多少工程师。

顺着原文提到的 Piper，我读了 Google 那篇 2016 年的论文，发现其中还有一段很适合放在这里。Google 曾用 Rosie 批量推进自动修改，后来在 2013 年引入正式的大规模变更评审，权衡修改收益、审阅时间和仓库扰动。随后，Rosie 的提交数在 2013 到 2014 年间下降了。

更多代码要不要进来，仍然需要判断。有些瓶颈是浪费，有些等待则意味着有人还没判断清楚这次改动是否必要。扩容时得把它们分开。

如果把 Scion 的经验带回自己的项目，我会先量一量准备代码和查询历史究竟花了多少时间，看看共享缓存、稀疏检出、服务端查询能省下什么。至于更换版本控制、改变合并规则，需要拿本团队的协作方式和故障代价继续论证。我会先从这些地方改起，继续使用 Git。

## 参考资料

- [Anthropic：Redesigning source control at Anthropic](https://www.anthropic.com/research/redesigning-source-control)
- [Meta：Mononoke README](https://github.com/facebook/sapling/blob/main/eden/mononoke/README.md)
- [Meta：Bonsai changeset 数据结构（原文所引固定版本）](https://github.com/facebook/sapling/blob/79071c2a3ea20c36ed71332608535e5801101bba/eden/mononoke/mononoke_types/serialization/bonsai.thrift#L50)
- [Google：Why Google Stores Billions of Lines of Code in a Single Repository](https://research.google/pubs/why-google-stores-billions-of-lines-of-code-in-a-single-repository/)
- [Google 论文全文（大学托管的原始 PDF）](https://bowringj.people.charleston.edu/classes/csci%20362/docs/GoogleCodeRepo-78-potvin.pdf)
- [本站：Agent 扩容会把 Git 写入路径推到台前](https://ntlx.github.io/articles/agent-scale-git-write-path)
