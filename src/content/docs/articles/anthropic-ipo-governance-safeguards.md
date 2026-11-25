---
$schema: starlight
title: Anthropic 上市：股东选不了董事，市场照样能施压
description: The Verge 采访了四位法学教授，讨论 Anthropic 的 IPO 治理结构能否挡住股东压力。我对照招股书逐条核对后发现：它锁住的是投票权，而市场压力从来不走投票这条路；退出条款也是设计的一部分。
date: 2026-11-25
category: ai-industry
primarySourceUrls: ["https://www.theverge.com/ai-artificial-intelligence/1019470/anthropic-ipo-resist-investor-pressure-cut-corners-safety"]
---

The Verge 在 10 月 27 日发了一篇报道，标题叫《Anthropic's elaborate plan to keep Wall Street at bay》，讨论 Anthropic 筹备上市时设计的那套治理结构。文章采访了四位法学教授，读下来我发现一处分歧：宾大教授 Elizabeth Pollman 说这是"前所未有、为创始人主导的使命型公司创造性设计"的结构，得州大学教授 Jens Dammann 认为上市本身不会损害安全优先；但科罗拉多大学教授 Ann Lipton 和哥大教授 Dorothy Lund 提醒，法律上的隔离挡不住市场现实——竞争压力和资本需求会随时间侵蚀安全承诺。

两组判断都有道理，而且不矛盾。我顺着报道里引用的招股书链接，把治理条款逐条读了一遍，想弄清楚这套结构到底锁住了什么、没锁住什么。先交代时间线：报道发出时 IPO 还没发生；11 月 19 日，Anthropic 的 Class A 普通股已经在纳斯达克开始交易，代码 ANT，发行价每股 83 美元。我写这篇的时候，上市刚满六天，所以下面谈的是结构本身，不是上市后的表现。

![Anthropic 治理结构导读：锁得住董事会，锁不住市场](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-25-anthropic-ipo-governance-safeguards-img-00-infographic-core-summary.png)

## 七席董事会，普通股东一席也决定不了

Anthropic 是特拉华州的公益公司（PBC），法律上要求它在股东财务利益和公益目的之间做平衡，而不是单纯最大化股东回报。The Verge 举了 Patagonia 和 Kickstarter 做同类例子。但 PBC 身份只是底色，真正的机关在董事会的选任方式上。

招股书写得很清楚：董事会共七个授权席位，其中四席是 Class T 董事，由长期利益信托（LTBT）通过一种特殊的 Class T 股选任和罢免；剩下三席由 Class A 和 Class F 股东合选，初始人选是 Dario Amodei、Daniela Amodei 和 Yasmin Razavi。Class T 股没有经济权利，也不参与一般股东事项投票——它存在的唯一目的就是选董事。

那普通股东能不能靠手里的 Class A 股翻盘？不能。因为创始人一方还握着一张王牌：Class F 股。这一股发给七位联合创始人组成的 Founder LLC，投票权恒等于公司全部股本总投票权的 50.1%。七位创始人是 Dario Amodei、Daniela Amodei、Tom Brown、Jack Clark、Jared Kaplan、Sam McCandlish 和 Christopher Olah，每人一票，多数决。既然很多股东表决是简单多数制，50.1% 意味着创始人一方可以否决或强行通过任何提交股东表决的事项，其他股东怎么投都改变不了结果。

所以 Lipton 那句话在投票权意义上是成立的："Anthropic 完全隔绝了逐利压力，因为普通股东没有能力选董事会或做经营决策。"这不是修辞，是条款的算术结果。顺带一提，常被称作第八位联合创始人的 Ben Mann 不在这个名单里——招股书脚注明确说他不是 Founder LLC 成员、也不是 Continuing Founder，不参与 Class F 投票；但公司 10 月 14 日的新加坡办公室公告仍称他为 cofounder。SF Standard 报道了这个矛盾，Mann 本人未回应置评，原因至今没有公开解释。

![Anthropic 七席董事会：Class T 四席由信托选任，Class A+F 三席；Class F 一股恒握 50.1% 投票权](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-25-anthropic-ipo-governance-safeguards-img-01-infographic-board-seven-seats.png)

## 压力不走投票通道

读到这里容易得出"安全使命稳了"的结论。但 Lipton 在同一段采访里说了另一句话，我觉得才是全文的重点：任何治理结构都挡不住这样一个市场现实——如果 Anthropic 不能比竞争对手更快地抓住赚钱机会，它就融不到维持运营的钱。

这句话描述的威胁不需要任何股东投票。股东想逼公司砍掉拖慢上市节奏的安全测试，常规路径是投票换董事；这条路被堵死之后，压力会改走资本市场：股价、融资条件、分析师预期、人才流向。公司要持续融资，就得让市场相信它的增长节奏。我在[上一篇读招股书的文章](https://ntlx.github.io/articles/anthropic-ipo-compute-obligations)里核验过一组数字：Anthropic 的采购及租赁承诺约 9009 亿美元，其中约 4516 亿预期在 2030 年底前发生。这样的资金需求摆在那里，"比对手更快赚钱"就不是股东的任性要求，而是公司自己的生存条件。Lund 说的"竞争压力和资本需求会随时间侵蚀安全承诺"，机制正在于此。

招股书里还有一个条款，让我确认这套结构的设计者自己也不认为投票权隔离是万能的。Class F 的投票由创始人多数决决定，但条款留了一个僵局阀门：如果多数创始人无法就如何投票达成一致，Class F 就按 Class A 股东的投票比例来投。换句话说，创始人内部一旦出现分裂，普通股东的声音会自动放大。结构没有消灭冲突，只是把冲突从"股东对董事会"转移到了"创始人内部"。而招股书同时承认，公司高度依赖创始人和核心团队的留任。把这两条放在一起读：守护使命的钥匙挂在创始人身上，而创始人会离开、会分歧。

![股东压力被投票权之墙挡住，改走资本市场通道；创始人意见分裂时 Class F 按 Class A 比例投票](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-25-anthropic-ipo-governance-safeguards-img-02-flowchart-pressure-bypass.png)

## 退出条款是设计出来的，不是漏洞

The Verge 提到，创始人多数离开或 Founder LLC 解散时，这套保护会"日落"。我核对了招股书的精确条件：当 Continuing Founders 少于三人、且持续 90 个日历日，就启动一个 450 天的过渡期；过渡期满，公司无对价赎回全部 Class F 股和发给员工的 Class E 股，普通股东随之获得削弱信托保护的权力。十周年内创始人身故或失能时可以接纳继任成员，算是一个缓冲。

更值得注意的是信托那一侧。Class T 股并非永久不可动摇：招股书列出了修改或赎回它的几条路径。受托人自己赞成时，需要 80% 的董事加 80% 的在任受托人批准；受托人不赞成而 Class F 还在时，一条随时可用的路径要求 66 2/3% 的创始人、75% 的 Class E 投票和 Class A 多数三方同时点头；如果 Class F 已经不存在、受托人又不赞成，门槛变成 85% 的 Class A 股份。公司对此有一句直白的自述："我们有意这样设计 Class T 股，以便在情况变化时保留长期灵活性。"

我原本倾向于把日落条款读成设计的软肋，这句自述改变了我的看法。设计者从一开始就没打算造一个永远锁死的盒子；他们造的是一个默认锁住、但留了明确开锁程序的盒子。真正的问题因此不是"结构能不能永远保住使命"，而是"谁在什么条件下有权开锁"。这些门槛各有不同，但共同点是：没有哪条路是某个激进投资者单独能走通的。这份设计的认真程度，我是认可的。

![日落链条：Continuing Founders 少于 3 人、持续 90 天、450 天过渡期后 Class F/E 无对价赎回；Class T 另有特定多数修改路径](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-25-anthropic-ipo-governance-safeguards-img-03-timeline-sunset-clauses.png)

## 受托人有多独立

信托被描述为使命的守护者：五名"财务上无利益"的受托人，专业领域覆盖 AI 安全、国家安全、公共政策和社会企业。但招股书也承认了一个细节：到目前为止，受托人的物色、面试和遴选，是受托人与公司高管"密切合作"完成的。五个授权席位目前还有一个空缺。

再看官方页面给出的名单变化。2023 年公布的初始受托人里有 Paul Christiano——对齐研究机构 ARC 的创始人，他 2024 年 4 月离任；到 2026 年 10 月，在任的四人是 Neil Buddy Shah（主席，全球健康组织 CHAI 的 CEO）、Richard Fontaine（国家安全智库 CNAS 的 CEO）、前美联储主席 Ben Bernanke（2026 年 6 月起）和哈佛物理与天文教授 Christopher Stubbs（2026 年 10 月起）。还有一位 Tino Cuéllar，2026 年 8 月卸任受托人，转身加入 Anthropic 担任首席全球事务官。

"财务上无利益"说的是受托人不持有公司股份、不从股价上涨中直接获利，这一点条款写得清楚。但它不等于组织意义上的独立：遴选过程有公司高管深度参与，受托人与公司之间存在双向的人员流动。初始五人中四人已经离任，守护者的面孔换得比结构快。我无意指控谁被控制——招股书只承认合作遴选，没有证据表明受托人听命于公司。只是"独立守护"这个说法，需要打一个程度上的折扣。

这让我想起[之前写 Anthropic 引入独立评估的那篇](https://ntlx.github.io/articles/anthropic-independent-evaluation-public-trust)：外部监督的可信度，取决于公众能否核对监督的过程。评估那边至少还有方法、证据边界和删节安排可以讨论；信托这边，遴选怎么谈的、离任为什么发生，公开信息基本只有结果名单。

![受托人名单对照：2023 初始五人到 2026 在任四人，Cuéllar 转任公司高管，遴选由受托人与公司高管密切合作](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-25-anthropic-ipo-governance-safeguards-img-04-comparison-trustee-turnover.png)

## 上市之后，盯住这几个信号

回到 The Verge 那篇报道的结尾：Anthropic 眼下大概能两头兼得，但保护远非铁板一块，取决于市场压力、创始人是否留任、信托的方向。Dammann 把这称为"无法以完全令人满意的方式解决的根本两难"，还说了一句很实在的话：事情顺利时，投资者不介意自己没有话语权；事情变糟时，他们会相当沮丧。

我同意这个判断，并且想把它说得更具体一点。这套结构值得认真对待，因为它确实堵死了最常见的股东逼宫路径——Altman 说 OpenAI 今年不上市的理由之一就是投资人压力，Anthropic 至少正面处理了这个问题，而不是回避。但它保护的范围和威胁的范围不重合：投票权锁得再死，融资节奏、人才竞争和创始人自身的经济利益都在锁外面。上市刚满六天，现在预言它会不会向市场低头为时过早；与其押注结论，不如盯住几个可以持续观察的信号：

- 创始人团队是否稳定，尤其是 Continuing Founders 人数有没有逼近三人这条日落触发线；
- 受托人遴选和离任有没有更多过程信息披露，空缺的第五席由谁补上；
- 安全相关的人事和预算在上市后是扩张还是收缩；
- 有没有涉及 Class T、Class F 条款修改的股东表决被提出。

![The Verge / Getty Images：Anthropic 联合创始人兼 CEO Dario Amodei 在白宫椭圆形办公室](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-25-anthropic-ipo-governance-safeguards-img-05-scene-verge-hero-dario.jpg)

Anthropic 没有回应 The Verge 关于能否真正抵御股东加速压力的置评请求。这个沉默本身也说明：结构能写进招股书，决心写不进。对一家把"为人类长期利益负责任地开发先进 AI"写进公益目的的公司，公众能做的不是相信它的锁，而是持续检查锁的状态。

## 参考资料

- [The Verge：Anthropic's elaborate plan to keep Wall Street at bay（Robert Hart，2026-10-27）](https://www.theverge.com/ai-artificial-intelligence/1019470/anthropic-ipo-resist-investor-pressure-cut-corners-safety)
- [Anthropic S-1（2026-10-26 提交 SEC），治理条款见 Our Governance Structure and Its Goals 及风险因素](https://www.sec.gov/Archives/edgar/data/2130357/000162828026067168/anthropicpbc-sx1.htm)
- [Anthropic 官方：The Long-Term Benefit Trust（受托人名单与离任记录）](https://www.anthropic.com/news/the-long-term-benefit-trust)
- [SF Standard：The origin of Mann — The mystery of Anthropic's 8th cofounder](https://sfstandard.com/2026/10/26/anthropic-cofounder-mystery-ben-mann/)
- [The Verge：Sam Altman says OpenAI won't go public until its models are safe](https://www.theverge.com/ai-artificial-intelligence/1002505/sam-altman-openai-ipo-devday-ai-safety)
- [Anthropic 上市交割公告（2026-11-19 起 Nasdaq 交易）](https://www.anthropic.com/news/ipo-close)
- [站内：Claude 越省算力，Anthropic 为什么还在签长约？（算力承诺数字的核验出处）](https://ntlx.github.io/articles/anthropic-ipo-compute-obligations)
- [站内：Anthropic引入独立评估后，公众还能核对什么？](https://ntlx.github.io/articles/anthropic-independent-evaluation-public-trust)