---
$schema: starlight
title: 一份 GPU 合同，怎样才能允许你反悔
description: 一笔 36 个月的 GPU 合同，把算力市场的难题从价格拉回到交付、退出与追溯。
date: 2026-10-21
category: ai-industry
primarySourceUrls: ["https://www.latent.space/p/sfcompute2"]
---

2026 年 9 月，SF Compute 把两块 B300 集群的算力卖出了 2.45 亿美元。合同一签 36 个月，每份 1.225 亿美元。

这笔交易很容易被读成又一条算力涨价新闻。我更在意合同背后的那个动作：如果买方的训练计划中途变了，它能不能把用不上的那部分还回去？

在 Latent Space 的这期访谈里，Evan Conrad 用酒店来比喻 SF Compute 被迫长出来的能力。客户先要一个房间，接着要打扫、要客房服务、要安保；做到最后，你发现自己已经在经营整间酒店。SF Compute 最初只是想转租一个集群，后来把云该有的运营能力补了大半，才敢说自己能交付算力。

这段比喻听起来像创业故事。它点出的那一层，恰好是算力市场最容易被跳过的：一份合同要能反悔，先得有人真的能把机器开起来。

![算力市场的三层基础设施：物理交割、约束订单簿、时间表账本](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-21-compute-market-physical-settlement-img-00-infographic-core-summary.png)

## 卖房间的人，最后要经营整间酒店

Evan 把 SF Compute 的交付方式叫 physical settlement，中文常译成“实物交割”。这个词来自期货市场：买原油的人最后真的拿到油，买大豆的人最后真的拿到大豆。放到算力上，意思不是结算一笔现金差额，而是买方真的拿到可以跑任务的集群。

访谈里有一个细节很能说明这活有多重。为了交付，SF Compute 要去看机房、设计物料清单、跟 OEM 和供应链对齐交付时间、设计集群架构、监督上架，还要接手 backplane 的管理：PDU、交换机、DPU、UFM、BMC，以及围绕 bare metal 的所有东西。Evan 说，云厂商平时把这些麻烦藏起来，而现在他们自己成了做这些事的人。

这和我过去对“算力交易所”的想象不太一样。交易所可以只负责撮合，交割失败就赔钱了事；物理交割不行，买方要的是一个能登录、能训练、能推理的环境。Evan 在访谈末尾把话说得很直：如果客户发现自己做了一个糟糕的决定，想从集群里退出来，SF Compute 可以把集群转卖给下一个人，让它不至于砸在客户的资产负债表上。前提仍然是，有人能接管并继续把那台机器开好。

所以 SF Compute 更像一家把市场接口做出来的云，而不是一家把云当成后台的交易所。市场负责定价和转手，云负责让合同有东西可交。两件事长在一起，才有了“反悔”的第一层基础。

![物理交割：从卖房间到经营酒店](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-21-compute-market-physical-settlement-img-01-framework-physical-settlement.png)

## 订单簿先接受差异，再谈流动性

算力市场经常被拿来和石油、大豆相比，但 Evan 在访谈里反复强调，GPU 不是一种均质商品。

同一个运营商可以给出两种虚拟机，性能差 40%，差异出在 GPU kernel launch 的耗时，最后表现为更差的 MFU。客户还关心显存大小、NVLink 域、GPU 代际、集群位置、存储系统、能否被中断、中断后多久能恢复。早期 H100 和 GB200 的批次问题也被他拿出来举例：有些客户愿意为晚一点部署、已经踩过坑的机器付更多钱。

面对这些差异，SF Compute 没有等行业先统一合同，而是做了一个带多个约束的订单簿。买方可以写清楚时间窗口、可接受的中断方式、需要的存储和网络条件，卖方用带同样属性的订单去匹配。代价是流动性被分散：同一份算力被拆成许多细分类别，买卖价差会更大。Evan 承认这“很糟”，但也说这给能处理多种容量的买家留下了套利空间。

![约束订单簿：差异写进订单](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-21-compute-market-physical-settlement-img-02-infographic-order-book-constraints.png)

这解释了一个看似矛盾的数字：目前只有 5% 的总容量在订单簿上。容量少，但在这部分容量上，流动性反而集中。SF Compute 披露客户平均能通过转售回收 25% 的支出；花 100 美元买的容量，平均能卖回 25 美元。这个数字不是保证，挂单不成交就没有收入，转售还要付手续费。

订单簿能交易的期限也比我预想的长。集群通常按 3 到 5 年融资，订单簿上的容量可以从现在一直排到三年后。不同期限的价格并不总是一条向上的曲线。Evan 用快过期的牛奶解释现货为什么降价：临近交付还没卖掉的容量不能留到过去，只能降价出清；再往远处，价格又可能因为人们更想要现成算力而回落。他说实际看到的是一个“驼峰”。

访谈里最刺眼的数字也在这里。按 Evan 的说法，一块 B300 如果拿去卖推理，每小时大约能带来 40 美元收入；而买一块 B300 的小时成本大约是 5 到 6 美元。即使只按一半利用率算，也有 25 美元左右的收入。这个对比没有给出统计口径，不能当成市场均价，但它足以说明：算力价格和算力产出之间，还留着一块很大的套利空间。市场要做的，是把这块空间变成可交易的合约，而不是让它只停留在少数人的账本上。

## 账本把未来记成一张时间表

如果只有订单簿，没有账本，“反悔”仍然只是一句口头承诺。SF Compute 为此做了 Abel。

Abel 的想法不复杂。普通账本的余额是一个数字，Abel 的余额是一张时间表。一个账户可以持有“前一段 128 个节点，后一段 48 个节点”，而不是简单写一个节点总数。因为集群之间不能互换，Abel 把每个集群当成一种独立货币；每一笔交易同时交换美元和算力，账本记录每个 node-hour 从谁手里转到谁手里。

交付因此可以被强制执行。账本在当下时点读出账户能用的最大节点数，控制平面按这个数放行；到了没有容量的月份，实例就停。故障也因此可以被定价。GPU 故障不可避免，交付方要为短缺负责；一个 node-hour 可能在交付前转手多次、每次价格不同，Abel 用 FIFO 或加权平均这类成本公式，追溯它最初来自哪次购买，再决定退多少钱。还有一层变化：集群建设要一年甚至更久，合同往往在硬件存在之前就签好，而账本允许先发行容量，再允许转售其中一部分。

这时再回看 25% 的平均回收率，它不只是一个销售数字。它之所以能被计算，是因为每一笔转售、每一次交付、每一个短缺的 node-hour 都有记录。离开这本账，退出权就只能靠双方互相信任；有了这本账，退出权才变成可以核对的权利。

![时间表账本：余额不是数字，是时间表](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-21-compute-market-physical-settlement-img-03-timeline-abel-ledger.png)

## 不拥有硬件，就能当中立者吗

访谈里最有锋芒的一段，是 Evan 解释为什么 NVIDIA 和大型云厂商做不了这个市场。

他的逻辑是利益冲突：NVIDIA 如果自己运营市场，就不够独立，别人不会放心在上面交易；CoreWeave、Lambda、Crusoe 这些云厂商在需求侧有太大利益，也不会愿意把市场做成真正中立的公共设施。用他的话说，要做出这个市场，你得“杀掉自己的生意”。SF Compute 的选择是不拥有硬件，把自己放在“瑞士”的位置上，只做运营、撮合和结算。

这个回答有说服力。它没有回答的是：不拥有硬件，是否就等于中立？

SF Compute 同时经营云、运营订单簿、维护 Abel 账本。它不靠硬件升值赚钱，但仍然可以从云服务、撮合和结算里获得收入；它能看到订单流，能决定哪些容量先上、哪些客户先匹配。独立性在这里不只是资产隔离，还需要规则、审计和可验证的账本。Evan 给出的方向是对的：把结算建立在物理交割上，让价格指数从真实可交付的容量里长出来。但“谁来审计这本账”“运营商自己的头寸如何与客户隔离”“出现争议时谁有最终解释权”，这些问题在访谈里还没有答案。

![独立性边界：不拥有硬件，不等于自动中立](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-21-compute-market-physical-settlement-img-04-comparison-independence-boundary.png)

这也是我对“算力市场”最大的保留。物理交割能降低 basis risk，却不能消除价格风险；需求旺盛时，转售是退出通道，算力过剩时，转售就会变成亏损分担。25% 是公司披露的平均值，5% 是当前在订单簿上的容量比例，两者都还没有第三方审计。把它们当成市场的成熟度证明，会读得太满。

历史上的商品市场也提醒过这一点。2020 年 4 月 20 日，WTI 近月期货最低跌到每桶 -40.32 美元；EIA 的解释是，持有到期合约的人必须进行物理交割，而当时 Cushing 的库存已经填到 76%，可用储存稀缺且昂贵。物理交割不是金融术语的装饰，它会把储存、运输和交付能力直接写进价格。LIBOR 的故事则是另一面：CFTC 认定 Barclays 在多年间试图操纵这一基准利率，最终罚了 2 亿美元。一个指数如果离真实可交易的底层太远，就很容易变成可以被人为移动的数字。

算力市场现在做的，是把这两件事同时补上：让价格连着可交付的容量，让每次交付留下可追溯的记录。这比维护一个孤立的 GPU 价格指数麻烦得多，但它至少把价格和可交付的容量绑在了一起。

## 签合同前，我会先问四个问题

读完这期访谈，我对“算力市场”的关注点从“今天多少钱一小时”移到了合同背后的四件事。

第一，谁能交付？不是问对方有多少张 GPU 的名单，而是问它是否真的能进机房、设计集群、管理 backplane、在故障时把机器修好。没有这层能力，合同价格再低也只是纸面承诺。

第二，账本怎么记？能不能看到每个 node-hour 的归属和转手记录？交付失败时按什么价格赔？如果账本只存在运营商的数据库里，客户能不能独立核对？Abel 给出的方向是把余额做成时间表，但买方仍要问，这张时间表是否可审计。

第三，退出有没有对手盘？订单簿上有多少真实容量、买卖价差多大、挂单平均多久能成交、转售手续费是多少。5% 的容量在订单簿上，意味着流动性是集中的，也意味着不是每一笔退出都能按预期价格完成。

第四，故障怎么算？GPU 会坏，集群会延迟，网络会出问题。合同里有没有写清楚短缺的定价方式、责任归属和赔付顺序？物理交割把这些麻烦带进了市场，买方不能只买一个价格，还要买一套处理麻烦的规则。

这些问题看起来琐碎。它们决定的是一份合同在顺风时能不能兑现，以及在逆风时还能不能兑现。

今年 8 月，我读 Dylan Patel 的访谈时，得到的判断是算力正在向少数实验室集中，资本开支和融资能力会把这种集中推得更远（[那篇文章](https://ntlx.github.io/articles/ai-compute-centralization-sovereign-debt)写的是这个宏观趋势）。SF Compute 的故事提供了一个微观层面的反向力量：如果长期合同可以转售，如果小团队能在不押上整张资产负债表的情况下拿到算力，市场就有可能把一部分风险从买方身上挪开。

但它能不能改变宏观上的集中，取决于两件很具体的事：谁有资格进入这个市场，以及谁有权力解释那本账。前者决定谁能拿到算力，后者决定市场是不是真的中立。物理交割解决了“能不能交付”，还没有完全解决“谁来保证交付者”。

一份 GPU 合同能不能反悔，最终要看按钮背后：有没有人愿意为交付负责，有没有一本账能证明它。

## 参考资料

- [The Programmable Data Center — Evan Conrad, SF Compute](https://www.latent.space/p/sfcompute2)（Latent Space，2026-10-20）
- [SF Compute: Commoditizing Compute to solve the GPU Bubble forever](https://www.latent.space/p/sfcompute)（Latent Space，2025-04-11）
- [San Francisco Compute sells $245M worth of compute](https://sfcompute.com/news/tcv-q3-2026)（SF Compute，2026-09-10）
- [The average customer now saves 25% with SFC](https://sfcompute.com/news/realized-discount)（SF Compute）
- [Abel, the ledger that settles compute on SFC](https://sfcompute.com/news/abel-ledger)（SF Compute，2026-09-14）
- [Introducing Elastic InfiniBand Partitions](https://sfcompute.com/news/elastic-infiniband-partitions)（SF Compute）
- [How Compute Markets Work](https://ai.engineer/nyc/2026/talks/sf-compute)（Evan Conrad，AI Engineer NYC 2026）
- [Low liquidity and limited available storage pushed WTI crude oil futures prices below zero](https://www.eia.gov/todayinenergy/detail.php?id=43495)（EIA）
- [CFTC Orders Barclays to pay $200 Million Penalty for Attempted Manipulation of and False Reporting concerning LIBOR and Euribor Benchmark Interest Rates](https://www.cftc.gov/PressRoom/PressReleases/6289-12)（CFTC）
- [当两家实验室吞下全球八成算力：读 Dylan Patel 访谈与 AI 算力的超级中心化终局](https://ntlx.github.io/articles/ai-compute-centralization-sovereign-debt)（站内旧文）
