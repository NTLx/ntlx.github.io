---
$schema: starlight
title: 当 API Key 变成期货：Token 转售市场的金融化寓言
description: 97.8% 的折扣率不是一个安全漏洞的数字——它是一个价格信号，告诉我们 AI token 已经从技术服务变成了可套利的抽象商品。中转站不是 token 经济的寄生虫，而是它金融化之后的影子银行。
date: 2026-07-27
category: ai-industry
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-27-token-relay-market-financialization-img-00-infographic-core-summary.png)

Matt Lenhard 在 Vectoral 上发了一篇调查，讲 AI API token 的地下转售市场。我读完之后最大的感受不是"有人在偷 API key"——这个我猜到了。我没想到的是，这个市场已经成熟到了有比价网站、有联盟计划、有每日 API key 抽奖的程度。它不像一个地下黑市，更像一个已经跑通 PMF 的创业赛道。

最让我愣住的数据是这个：一个叫 Now Coding 的中转站，425 元人民币能买到价值 $3,333 的 Anthropic 额度。折算下来，$1 的官方额度只值 $0.022。97.8% 的折扣。

## 为什么折扣能到 97.8%

乍一看，你可能会说"偷来的东西当然便宜"。但 97.8% 的折扣意味着 token 的边际成本趋近于零——不算模型训练和研发分摊的话。

这才是问题的核心。中转站的定价不是"赃物贱卖"，而是在对 token 进行市场化定价。当模型提供商按照"研发成本 + 服务器成本 + 利润"定价时，中转站按照"账号获取成本 + 账号损耗率 + 利润"定价。后者的成本结构中，最贵的部分是一个能通过美国账单检查的虚拟信用卡——几十块钱的东西。

这跟黄牛票的逻辑完全一样。演唱会门票的官方定价是"艺人价值 + 场地成本 + 利润"，黄牛的定价是"抢票脚本成本 + 市场需求"。当二级市场的价格远低于一级市场，说明一级市场的定价模型本身就是错的。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-27-token-relay-market-financialization-img-01-relay_price_comparison.png)

## 一个四层结构的套利机器

Lenhard 把市场拆成了四层。这四层结构让我想到的不是黑客组织，而是供应链管理。

最上面是卡商和号商——他们生产"原材料"：能通过风控检查的虚拟信用卡和批量注册的账号。往下一层是账号池——这是整个系统里最像基础设施的一层：聚合、容错、负载均衡、暴露统一 API。再往下是中转站——面向消费者的产品层，中文界面、计费系统、客服微信群、价格战。最底层是终端用户——从个人开发者到做模型蒸馏的商业公司。

每一层都在用合法的工具做不合规的事。账号池用的是 Kubernetes 那套高可用思想。中转站用的 one-api 和 new-api——两个开源的 API 网关项目，本身是正经工具，很多公司用它管理自己的内部 API key。但当中转站把偷来的 key 注入这些工具时，它们就变成了洗 token 的流水线。

这不是技术问题。这是金融问题。一旦某种资产可以被计量、分割、传输而没有原生的归属标记，它就会自发形成二级市场。Token 恰好满足这三个条件。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-27-token-relay-market-financialization-img-02-market_structure.png)

## 抽奖、比价、信任机制——地下市场的"正规化"

整篇文章最让我觉得荒诞的部分，是 hvoy.ai 的每日 API key 抽奖。

每天 50 个 $100 的 API key，用比特币区块哈希做可验证公平随机种子，Partial Fisher-Yates 洗牌算法选赢家。参与者在抽奖前能看到完整的参与名单快照。这套方案在技术上跟合法的加密货币赌场用的是同一套密码学方案——"可证明公平"（provably fair）。

一个卖赃物的人，在意抽奖是不是公平的。

这说明这个市场的参与者不觉得自己在参与非法活动。他们是一个被地缘政治和支付体系排除在外的真实用户群体——中国开发者无法直接用信用卡买 Anthropic 的服务，OpenAI 的 API 在中国同样受限。对这些开发者来说，中转站不是"黑市"，而是"唯一可用的渠道"。

ChinaTalk 上 Zilan Qian 的分析印证了这一点：中转站经济在中国填补的是一个真实的市场空白。但问题在于，填补空白的工具是一套建立在凭证盗窃之上的基础设施。你在淘宝上搜"Claude API"，出来的不是官方渠道，是中转站的价格表。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-27-token-relay-market-financialization-img-03-attack_vectors.webp)

## KYC 解不了套利方程

Lenhard 在文末给了一套防御建议，从提高账号创建成本到行为监控到预算硬上限。每一条都合理。但他自己也说了一句最诚实的话：欺诈是持续的猫鼠游戏，这些不是银弹。

为什么不是？因为这是一个经济学问题，不是身份验证问题。

攻击者在乎的不是"能不能通过 KYC"，而是"通过 KYC 的成本是否低于套利收益"。你加一道手机号验证，攻击者买一个虚拟号——成本 +$0.5。你加人脸识别，攻击者用深度伪造或者雇人做验证——成本 +$5。只要套利空间还在，攻击者就会跟随成本曲线向上调整。

最终的结果不是消灭市场，而是提高准入门槛、筛选出更专业的攻击者。就像毒品战争——每一次执法升级，淘汰的是散户，留下的是更高效、更暴力的卡特尔。

对模型提供商来说，真正的问题不是"怎么阻止 token 转售"，而是"token 转售暴露了什么"。它暴露了 token 定价模型的结构性缺陷——把 AI 推理当作服务来卖，但市场已经把它当作商品来交易。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-27-token-relay-market-financialization-img-04-token_financialization.png)

## Token 金融化：你看不见的二级市场

我在写《Tokenpocalypse》那篇时讨论的是 token 成本的不可预测性——开发者的 AI 账单比 AI 产出更好量化。读完 Lenhard 的文章之后我发现，我只看到了问题的一半。

另一半是：token 的价格不只在官方定价页面上。在 getcheapai.com 这样的比价网站上，不同中转站的 token 价格在实时竞争。在 V2EX 的技术论坛上，开发者在比较哪家中转站的 Claude Opus 更稳定。在 hvoy.ai 上，API key 变成了可以抽奖赢取的奖品。

Token 已经有了一个完整的二级市场——价格发现（比价网站）、流动性提供（账号池）、衍生品（抽奖）、甚至市场教育（"AI 中转站术语完全指南"这篇 3.5 万次浏览的 V2EX 帖子）。

当一个商品有了二级市场，一级市场就失去了定价权。这就是中转站对 AI 行业真正危险的地方——不是 Anthropic 每年少赚几亿美元，而是 AI 推理服务被商品化之后，模型差异化被价格竞争淹没。当开发者在比价网站上按"每百万 token 多少钱"来选择模型时，Claude 和 GPT 的区别被压缩成了一个数字。

而模型蒸馏把这个逻辑推到了尽头。V2EX 上那个被 Lenhard 引用的人说得直白："蒸馏用的是 Claude/CodeX 的模型训练国产模型，这是一个几十亿人民币的产业链，很多大玩家一天赚几十万。"廉价 token 不仅被用于推理，还被用于训练——用 Anthropic 的输出去训练 Anthropic 的竞争对手。

*你怎么看中转站经济？是填补市场空白的必要之恶，还是正在掏空 AI 行业的套利机器？欢迎留言讨论。*

## 参考资料

* [An Inside Look at the Relay Market Powering Token Resellers and Fraud](https://vectoral.com/blog/token-relay-market) — Matt Lenhard, Vectoral
* [How to Buy Cheap Claude Tokens in China: The Transfer Station Economy, Explained](https://www.chinatalk.media/p/how-to-buy-cheap-claude-tokens-in) — Zilan Qian, ChinaTalk
* [Half the 'AI APIs' You're Buying Are Lying to You](https://gogoduck912.github.io/blog/middlemen) — gogoduck912
* [V2EX: AI 中转站术语完全指南](https://www.v2ex.com/t/1196011)
* [Criminal AI-as-a-Service in 2026](https://www.rapid7.com/blog/post/tr-criminal-ai-underground-market-operationalizing-cybercrime-2026) — Rapid7

## 延伸阅读

* [Tokenpocalypse：当你发现 AI 账单比 AI 产出更好量化](https://ntlx.github.io/articles/tokenpocalypse-ai-token-cost)
* [从 Token 流到 Agent 流：LLM 应用正在经历它自己的"协程革命"](https://ntlx.github.io/articles/token-streams-agent-streams-llm-concurrency-revolution)
* [Not the Model, You're the Harness](https://ntlx.github.io/articles/not-the-model-youre-the-harness)
