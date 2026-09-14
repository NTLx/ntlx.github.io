---
$schema: starlight
title: OpenAI 主动欠下两笔债，第三笔没人签字
description: 能定价的债是杠杆，继承来的默认值是风险。OpenAI 主动欠的两笔债都写明了代价，咬人的那一笔，是依赖库替它签的字。
date: 2026-09-14
updated: 2026-09-15
category: engineering
primarySourceUrls: ["https://openai.com/index/scaling-storage-one-billion-users-part-one/"]
---

为了让最关键的一批数据扛住单区域故障，OpenAI 的团队打算把它们迁到一组按地理分布的 Azure Cosmos DB 账户上。这在当时的架构里意味着：先在客户端加上一层路由逻辑，把它藏进 feature flag，确保这次改动推到所有服务；再加一层 shadowing，验证分片逻辑没有写错；然后修掉过程中发现的一个 bug。等到一切就绪、只剩打开开关那一步，另一个团队因为一件完全无关的事，把自己的服务回滚到了一个带 bug 的旧客户端。

他们花了几天想避免的那次故障，就这样发生了。

这段出自 OpenAI 2026 年 9 月 11 日的工程博客《[Rapidly scaling online storage to serve over 1 billion ChatGPT users](https://openai.com/index/scaling-storage-one-billion-users-part-one/)》，讲的是他们的在线存储平台 Habitat。文章通常会被当成一篇规模叙事来读：7000 万请求每秒、10 亿周活、500 PB 数据、横跨近 40 个地理区域。但作者自己并不认为规模是难点，原话是 "Building and operating infrastructure at this scale is no easy feat, but also not particularly challenging"。真正稀缺的部分，是他们在增长的同时被逼着做的那串取舍。

我把这串取舍读下来，看到的是三种性质很不一样的技术债。前两种 OpenAI 自己签了字，第三种没有。

![Habitat 的三种技术债](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-14-scaling-online-storage-habitat-img-00-infographic-core-summary.png)

## 库变成了服务，协调成本被一次买断

刚才那次故障的教训，作者写得很直白：客户端形态下，任何协议变更都要跨几十个服务协调部署，这个过程 "increasingly brittle, inefficient, and susceptible to operational failures"。

Habitat 最早是一个 Python 库，职责是让产品工程师不必理解底层数据库。schema 查找、路由、鉴权、加密、序列化、连接池，乃至数据到底来自 Cosmos DB 还是缓存，全由它兜住。这个设计一度很成功，团队甚至能轻松地往共享库里加客户端缓存、压缩和加密。

但库的代价是决策权被摊开了。你没法单方面改变一个已被几十个服务引用的接口，只能说服所有人一起动。所以当 OpenAI 需要更细的分区策略时，付出的不是写代码的时间，是协调的时间。

把 Habitat 抽成独立服务，等于把这笔协调成本一次性买断。部署、可观测性、平台增强都收敛到单一控制点，改一次，所有产品立即受益。作者还顺带提了一个我原本没想到的收益：服务化给了安全一个可以收口的位置。Habitat 是集中执行访问控制、写审计日志、限制底层存储访问的地方，防范对象被明确写成三类，外部的、内部的，以及 agent。把 agent 和内外部分行为者并列，说明 OpenAI 已经在按「非人类调用方同样需要被授权」来设计存储边界了。

这笔债可以欠，是因为它代价清楚、收益具体，偿还路径就是一次迁移。

## 他们赌自己未来的模型会来还这笔账

第二笔债更值得琢磨。

明知 Python 作为高吞吐服务会抬高网络延迟、显著增加 CPU 与内存成本，OpenAI 还是用了它。作者自己写道，Python 在 100x 规模下的低效不会被接受，重写几乎必然。他们照样用，还给它起了个准确的名字："a strategic incursion of technical debt"。

真正让我停下来的是接下来那句。他们解释为什么敢拖：他们下了一个计算过的赌注，相信自家编码模型的快速进步会简化未来的技术路径，赌到必须迁离 Python 的那一天，Codex 和 GPT 能让这次迁移变得可做。

我把它理解成一种新的工程决策形态。过去谈技术债，默认债权人是你自己团队未来的时间，而团队产能是可以估的。OpenAI 这次抵押的是一个当时还不存在的能力。他们没有说「AI 会拯救我们」，而是把偿还日期和一个具体的、可能被证伪的判断绑在一起：我相信到那个时间点，我的模型足以承担这种规模的代码迁移。

事后看，这个判断成立。2026 年第二季度，两名工程师配合 Codex 和 GPT-5.5 把整个服务用 Rust 重写；新服务目前处理 95% 的生产请求，CPU 效率是 Python 版本的 6 倍，内存效率 15 倍。作为对照，Python 版本的峰值是每秒 2000 万请求。

![拿还不存在的能力做抵押](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-14-scaling-online-storage-habitat-img-02-comparison-borrowed-future.png)

这里有一条必须说清的边界。原文只说这两名工程师「配合」Codex 与 GPT-5.5 完成了重写，没有说明 AI 写了多少、人又做了哪些判断。读到「2 名工程师重写了一个每秒 2000 万请求的服务」就断定 AI 已经是主力，或者反过来断定人的作用不可替代，都超出了原文能支撑的范围。它证明的是：这个每秒 2000 万请求量级的服务，在 2026 年第二季度由两名工程师配合 Codex 与 GPT-5.5 整体重写完成。

这条线站内此前聊过。[Agent 跑得越久，团队越该问：谁来验收？](https://ntlx.github.io/articles/openai-research-acceleration-agentic-productivity) 讲的是同一件事的另一面：当产出速度被模型抬高，瓶颈会转移到验收环节。用来还债的生产力，自己也有一笔配套的账要记。

## 为了守住尾延迟，他们把自己推进了下一个坑

接受 Python 之后，难点落在尾延迟上。作者给了一个很好用的判据：当一次用户请求背后是数百次数据库调用，"the slowest database call is the one the user feels"。

于是他们开始测量。Python 的 asyncio 能并发处理 I/O，但不绕开 GIL，不提供 CPU 并行。Habitat 却同时承担大量 CPU 密集职责，路由、压缩、加密、校验和、下游健康检查、请求 shadowing、hedging 都算在内。结果是事件循环的调度延迟会主导尾延迟：trace 显示在 p99 以上，下游存储明明很快，请求却卡在等待协程被重新调度的路上。

他们的应对是实测驱动而非猜测。周期性调度后台任务，记录期望执行时间与实际执行时间的差值，把事件循环延迟实时量化出来。数据显示高利用率下抖动可达数百毫秒，极端情况到秒级。对策是每个进程只服务少量并发请求，然后大量横向扩展 worker 进程。

读到这里我意识到，接下来发生的事几乎是必然的。进程数涨了一个数量级，连接数就跟着涨一个数量级。他们自己写下了这个连锁反应的名字：连接反复建立销毁会制造大量 CPU 抖动，而一个连接泄漏就足以靠占满 NAT 网关把网络打掉。

这是第二笔债的利息。它没有藏在某个远期，而是当场就到期了。

## 没人签字的那个默认值

现在说第三笔。

在这套「低并发、多进程」的结构下，他们观察到一个反常现象：即使停掉造成过载的客户端，仍有一部分进程在远超突发流量过去之后继续劣化，收到的请求越来越多，直到重启才恢复。

作者用了那个准确的名字：metastable failure，并链接了 Meta 工程团队 2014 年的文章《[Solving the Mystery of Link Imbalance](https://engineering.fb.com/2014/11/14/production-engineering/solving-the-mystery-of-link-imbalance-a-metastable-failure-state-at-scale/)》。那篇文章把它定义为 "problems that create conditions that prevent their own solutions"，一种会阻断自己解法的故障状态，像堵车，只有外力减载或彻底重启才能结束。

它和普通过载的区别就在这里：触发原因消失之后，故障状态自己活了下来。换到 OpenAI 这次的例子里，一旦某个 pod 因为任何原因变慢，就有一种行为在持续往它身上压流量。

根因是 `aiohttp` 的 `TCPConnector` 默认使用 LIFO 连接复用，最近归还的连接被选去做下一次请求。OpenAI 的描述是：突发期间，发往更慢、已过载服务器的请求更晚归还连接，因而更频繁地被后续请求选中，流量逐渐集中到那些已经吃力的 pod 上。他们把连接池改成 FIFO，反馈回路当场断开，稳态请求方差也跟着降了。

![LIFO 的自我强化回路与 FIFO 如何打断它](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-14-scaling-online-storage-habitat-img-01-flowchart-lifo-metastable-loop.png)

让我在意的是这个机制的来历。Meta 2014 年那篇文章描述的是 MRU 连接池，最近使用的排到池顶，在拥塞链路上形成了同样的自我强化：走慢链路的查询哪怕只慢几毫秒也稳定输掉竞争，于是被更频繁地复用，几百台机器同时把流量堆上去。他们的修复是从 MRU 改成 LRU 加最大连接寿命。

MRU 描述的是从池子里挑哪一个（挑最近用过的），LIFO 描述的是按什么顺序取（取最后进池的）；落到这套连接池上，两者指的是同一个动作。LRU 和 FIFO 在这里也是同一个方向的修复。十二年后，同一个故障机制换了一层皮回来了：从网络链路拥塞，变成服务进程 CPU 饱和引发的调度延迟；从 Facebook 自研的连接池，变成 Python 生态里一个绝大多数人不会去读的默认值。

更巧的是，Meta 那篇文章的作者 Nathan Bronson，也是 Habitat 声称借鉴的那套数据模型的来源，TAO 论文的作者。OpenAI 这篇博客同时引用了这两篇，没有点破这层关系。

我不认为这能推出「读了论文也没用」。恰恰相反，原文说团队成员在 "prior work" 里就熟悉这类故障，这个熟悉感很可能正是他们能在数小时内把矛头指向连接池的原因。2014 年那篇文章真正交付给行业的，不是它的修复方案，是那个名字。有了 metastable failure 这个词，一线工程师才能把「流量莫名集中到一个慢进程上、且不会自愈」识别成一个已知类别，而不是一次需要从零排查的神秘现象。

但名字救不了默认值。OpenAI 没有决定用 LIFO，那是 `aiohttp` 替他们决定的。这笔债没有签字人，没有定价，也没有到期日提醒。它躺在依赖树里，等着某个与它无关的触发条件出现。

## 有一种策略是不借

如果三笔债讲到这里就结束，Habitat 的故事会显得有点宿命。但原文里还有一节叫 "Why Habitat does less"，讲的是一种完全不同的处理方式：不借。

Habitat 刻意只暴露一个受限的 NoSQL API，不允许客户端构造任意 SQL，因为那会产生大表扫描和跨表 join。作者给出的理由是成本不对等："it is cheap and easy to write SQL queries that are expensive and hard to run." 在 Postgres 时代，OpenAI 还能靠人工审查每一次查询和 schema 变更来兜底；团队和产品一涨，这件事迅速失控，成了反复出现的故障源，一条昂贵的新查询打上热路径，就能把数据库带走。

所以他们把不可预测的请求从 API 层面去掉，换取简单、可预测、工作量恒定的请求。作者对此的表述是明确的取舍，而我认为这是全篇最容易被低估的一段。它做的不是性能优化，是通过收缩能力来控制风险面。复杂查询被赶到 Rockset 提供的离线二级视图上，各团队自己负责扩展，在线存储因此与读密集的分析负载隔离开。

![用收缩能力控制风险面](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-14-scaling-online-storage-habitat-img-03-comparison-do-less-api.png)

这里还有一条我想指出的线索。Habitat 的 API "inspired by [TAO](https://www.usenix.org/system/files/conference/atc13/atc13-bronson.pdf)"，Facebook 2013 年那篇图数据存储论文。TAO 的目标声明几乎就是 Habitat 的立场："TAO's goal is not to support a complete set of graph queries, but to provide sufficient expressiveness to handle most application needs while allowing a scalable and efficient implementation."

但两份设计有一处关键分歧。TAO 把关联存在其起点对象的 shard 上，让「某对象的直接边」能由单台服务器完成，并用缓存层兜住局部性。Habitat 的原文则明确说，它把每个对象和它的边共置在存储层分区里，但不做数据库级的远程对象共置，因此任意一跳都可能要在不同区域的、完全不同的 Cosmos DB 账户之间取数。

Habitat 继承了 TAO 的模型词汇，对象、边、别指望通用图查询，却没有继承 TAO 让这套模型跑得动的那个底座。这是我自己的对比，不是原文的结论；原文只把遍历低效作为一个已知代价承认下来。但我觉得这个偏差值得记下来：模型可以照抄，让模型成立的那层工程决策未必跟着过来。

## 什么债可以欠

回到开头那次故障。它的荒唐不在于有人犯了错，而在于一条看似清晰的迁移路径，最终由整个组织的协调成本决定成败，而这恰恰是客户端架构最不擅长承担的东西。Habitat 后来做的每件事，几乎都能回溯到这个约束上。

三笔债之间有一条我读出来的分界。自己签过字、知道代价和目标的那两笔，更像是杠杆；没人签字、躺在默认值里的那一笔，才是风险。

第一笔债，代价是每次变更都要跨几十个服务协调几天，收益是单一控制点。第二笔债更激进，等于用尚不存在的模型能力做抵押，但因为被写成了一个具体的、可被证伪的判断，它也就成了可管理的风险，而且事后确实被兑现了。第三笔债什么都没换到，它是 `aiohttp` 的默认配置，在一个没人会去读的角落里，把十二年前就被命名过的故障机制重新放了出来。

可操作的部分大概是这样：翻一遍你依赖树里那些「本来就是这么默认」的东西，特别是连接池、重试、超时、缓存失效这几类。它们平时不产生成本，只在被触发时一次性结算。而如果团队里已经有人能叫出某类故障的名字，那多半是一笔早已被行业付过的学费，那个名字值得被写进你们的 runbook，因为识别出的速度决定了它是几小时的排查还是几周的悬案。

原文所有规模与性能数字均来自 OpenAI 自述，没有第三方复核；Rust 与 Python 的 6 倍、15 倍对比未披露测量口径与负载条件。Habitat 的下一篇会讲存储层与 Azure Cosmos DB 的合作，届时这些数字是否会被修订，还不好说。

![原文社交分享卡（OpenAI 制作，标题为英文原文）](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-14-scaling-online-storage-habitat-img-04-source-card-openai.png)

## 参考资料

- [原文：Rapidly scaling online storage to serve over 1 billion ChatGPT users](https://openai.com/index/scaling-storage-one-billion-users-part-one/)
- [TAO: Facebook's Distributed Data Store for the Social Graph（USENIX ATC '13，Habitat API 的模型来源）](https://www.usenix.org/system/files/conference/atc13/atc13-bronson.pdf)
- [Solving the Mystery of Link Imbalance: A Metastable Failure State at Scale（Meta Engineering，2014）](https://engineering.fb.com/2014/11/14/production-engineering/solving-the-mystery-of-link-imbalance-a-metastable-failure-state-at-scale/)
- [站内相关：Agent 跑得越久，团队越该问：谁来验收？](https://ntlx.github.io/articles/openai-research-acceleration-agentic-productivity)
