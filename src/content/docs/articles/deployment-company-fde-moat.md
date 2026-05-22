---
$schema: starlight
title: AI 公司开始往你的办公室派人，这才是真正的护城河
description: "三家 AI 巨头同一周押注 FDE——这不是在卖模型，是在悄悄搬走你公司最值钱的东西：那些写在员工脑子里、从没落到纸面上的\"不成文规定\"。"
date: 2026-05-23
category: ai-industry
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-23-deployment-company-fde-moat-img-00-infographic-core-summary.png)

我平时在博客管线上跑着 Claude Code、Windsurf 这些工具，亲眼看着它们把"从想法到原型"的周期从几天压到半小时。所以读到 Caffein Chen 这篇 *The Return of the Deployment Company* 的时候，第一个感觉是确认。这些工具的效率提升，正在改变一件很多人还没意识到的事：AI 公司的商业模型本身。

2026 年 5 月，OpenAI、Anthropic、Google 在同一周宣布各自押注 FDE（Forward Deployed Engineer，前线部署工程师）模式。OpenAI 搞了一个 $10B 估值的 DeployCo，承诺给 PE 投资人 17.5% 的年化回报；Anthropic 拉上 Blackstone、Goldman Sachs 组了一个 $1.5B 的合资公司；Google Cloud CEO Thomas Kurian 在 LinkedIn 上宣布要招"数百名" FDE。

不是巧合。是同一套底层逻辑在三家公司的不同表达。

## SaaS 那套数学在 AI 这里不成立了

过去十五年 SaaS 之所以是一门暴利生意，靠三个前提同时成立：写一次代码服务无限客户的零边际成本、产品核心逻辑几年不变带来的 R&D 摊销红利、以及用户学会界面后的高转换成本。

AI 产品把三个都拆了。

每次调用都在烧 GPU——复杂推理、长上下文、多步 agent 工作流，单次成本是传统 SaaS 查询的数百倍。AI 产品的毛利率已经掉到 50-60%，比 SaaS 的 70-80% 低了整整 20-30 个百分点。OpenAI 自己 2026 年预计亏 $14B，毛利率从 40% 跌到 33%。

工具的生命周期也在加速缩短。2024 年的主流 coding agent 是 GitHub Copilot，2025 年换成 Cursor，2026 年轮到 Claude Code 和 Windsurf。品类领导者每 12-18 个月换一轮。当产品的生命周期从五年压缩到一年，"重投研发、五年摊销"的账就算不成了。

我自己就有体会。去年用 Copilot 搭的一套代码辅助流程，今年换了 Claude Code 之后发现，新模型的基础 prompt 能力已经能覆盖掉之前大半年的定制工作。产品护城河被"能力通胀"直接冲淡了——这不是你的产品变差了，是基线变高了。

至于高转换成本，当"用户"变成一个能读文档、调 API、跨工具操作的 AI agent 的时候，基于人类 UI 习惯的锁定确实在弱化。但数据迁移的耦合、组织惯性、API 语义层的标准化缺口，这些更深层的壁垒还在。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-23-deployment-company-fde-moat-img-01-saas-vs-ai-economics.png)

简单画个对比：

```
SaaS 经济模型（2010s）
  零边际成本  +  产品寿命长  +  UI锁定
  = 高毛利    +  高留存      +  高估值

AI 经济模型（2026）
  真实推理成本 +  快速迭代   +  Agent削弱UI锁定
  = 毛利被压缩 +  R&D无法摊销 +  护城河需要重建
```

## 三家公司的三种赌法

三家都在搞 FDE，但各自押的东西不一样。

OpenAI 赌的是*能力差距套利*——它相信前沿模型和其他所有模型的差距会持续存在甚至拉大。把工程师派到客户办公室，让客户亲身体验这个差距，然后他们就愿意付溢价。"前沿模型租金"。DeployCo 收购 Tomoro 不是买人头，是买已经在 Virgin Atlantic、Supercell、Tesco 这些复杂生产环境里跑过的 credentialed experience。Tesco 四千多家店的实时库存系统、Virgin Atlantic 几十年历史的航班调度软件，这些不是套个 wrapper 就能搞定的。

Anthropic 赌的是*行业 know-how 比模型绝对性能更重要*。它选的 JV 合作伙伴很有意思——Blackstone 是全球最大 PE，手上有数百家 portfolio 公司；H&F 行业渗透很深；Goldman Sachs 懂金融、制造、零售的运营逻辑。它的赌法是"很多客户不想要最强模型，想要最懂我行业部署的人"。不正面拼前沿能力，抓中段市场。

Google 最省事——*分发胜过一切*。不成立独立公司，不做大 JV，直接把 FDE 塞进 Google Cloud 现有的销售体系。客户已经在用 GCP、Workspace、BigQuery，不需要"赢"新客户，只需要"加深"已有客户。

```
OpenAI  →  能力差距套利      →  "你用了就知道为什么值这个价"
Anthropic → 行业know-how     →  "模型够用就行，关键是懂你"
Google  → 分发渠道            →  "你本来就在我这儿"
```

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-23-deployment-company-fde-moat-img-02-three-bets-strategy.png)

a16z 有一篇 *Trading Margin for Moat*，从投资人角度说 FDE 是"用毛利换护城河"的正确策略。这话对了一半——对 AI 公司来说确实如此。但对企业买方来说，这句话翻译过来是：*这家公司的商业模型就是要把你变成它护城河的一部分。*

## 被忽略的东西：你的隐性知识正在被搬走

Caffein Chen 这篇文章点出了一件很多人没注意到的事：FDE 模式下企业买方正在失去的东西，不是数据，不是代码，是 tacit knowledge（隐性知识）。

每个公司都有一堆"不成文规定"。保险理赔怎么处理、什么样的客户可以走快速通道、哪种 dispute 需要 escalation。这些东西不在任何 SOP 里，全在老员工的脑子里。FDE 的核心工作就是把这些东西从人脑里挖出来，编码进 evaluation set。

问题来了：这个 evaluation set 归谁？

传统咨询里，顾问走的时候知识在他脑子里，带不走系统。FDE 模式里，你公司的业务逻辑坐在 AI 公司的系统里，作为 evaluation set 被系统化存储、可能复用。

前 SAP 高管 Thomas Otter 说得尖锐："很多标为 FDE 的角色只是换了个好听名字的实施工师。"但即使他们真是工程师，问题也不在于技术水平，在于*知识流向*。

我想到一个类比。你请装修队来家里做定制柜——他们走的时候留下的是柜子，不是你家户型的详细图纸。但如果这个装修队同时也在给你的邻居、你隔壁小区的其他业主做柜子，而你家的户型细节、收纳偏好、生活习惯全被他们记下来了，用来优化给别人的方案——那"定制"的受益者到底是谁？

更实际的：合同终止后 evaluation set 怎么办？默认答案是 AI 公司留着。你拿不走——它不在你的系统里，你甚至不确定它长什么样。

## 被锁定的 18 个月

FDE 锁定不是一天发生的。它是一个温水煮青蛙的过程：

```
Month 1:  "还行，但离我们要的有距离"
Month 3:  "开始像我们了，边缘 case 还差点"
Month 6:  "有点东西了，开始依赖它"
Month 12: "这是我们的基础设施了"
Month 18: 竞品降价 30% 想进来——
          重建 evaluation set 要几个月
          工作流要重新对齐
          员工要重新培训
          过渡期服务质量可能下滑
          → 结论：除非降幅够大，否则不换
```

这就是"通过隐性知识的 vendor lock-in"——比 SaaS 时代的锁定更隐性、更深、更难解绑。SaaS 锁定靠的是"你学了三个月的界面不想重新学"，FDE 锁定靠的是"你整个业务流程的运行逻辑已经被这个系统重塑了"。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-23-deployment-company-fde-moat-img-03-fde-lockin-timeline.png)

而且很多企业在依赖加深之后会发现，供应商开始调合同价格了。议价能力从你手里溜走，不是因为合同条款改了，是因为你*实际上走不了了*。

## 中小企业在哪里？

聊了这么多大公司的棋局，回到我自己更关心的视角：中小企业怎么办？

原文花了不少篇幅讲 on-premise 部署在 2026 年已经成熟了——开源模型（Llama 4、Qwen 3、DeepSeek V3.2、Mistral Large 3）在多数企业任务上已经够用；HPE、Dell、Lenovo 的交钥匙方案 4-8 周能上线；vLLM、Ollama、LoRA 这些工具让一个普通 IT 团队就能搞定。

但这话对中小企业来说有点奢侈。on-premise 要雇 AI 运维架构师，2026 年的人才市场里这种岗位"供给有限、薪资很高"。第一年 ROI 也不好看——Y1 打基础、Y2 验价值、Y3+ 才开始加速。不是每个公司都有三年耐心。

我自己的判断是：中小企业的护城河不在硬件，在*速度*。

AI coding tools 已经让一个工程师的效率翻了数倍。用 Claude Code 这种工具，一个人可以同时在多个项目上快速出原型、快速验证、快速迭代。这本身就是一种"微型 FDE"——你不需要派人到客户办公室待三个月，你可以今天拿到需求，明天拿出 v1，后天跟客户一起迭代。

中小企业不应该去跟 DeployCo 拼部署深度，也不应该去搞自己负担不起的 on-premise 基础设施。有几件事值得做：

把自己的 AI 工具链练到极致。coding agent、RAG 框架、evaluation set 的构建能力，这些是"微型 FDE"的基本功。

保持模型无关性。今天用 Claude，明天可以用 Qwen，后天可以用 Llama。evaluation set 握在自己手里，随时可以迁移。

用了 FDE 服务的话，合同里写清楚 evaluation set 的所有权和交接条款。这是你在牌桌上唯一的筹码。

## 不是反 AI，是别闭着眼睛跳

这篇文章不是在说 FDE 是邪恶的。对一些企业、在一些场景下，接受 FDE 是合理选择。

我想说的是：如果你只看到 FDE 的上手快、定制深、部署快，没看到权力结构在合同签下的那一刻就开始转移，那你签完字种下的是三到五年的长期风险。

AI 公司的商业逻辑和我们的商业逻辑不同。它们押注 FDE 是因为利润率被推理成本压得喘不过气，需要找一条咨询利润率的出路。正常的商业选择。但作为企业买方，你需要搞清楚：这笔交易到底在交换什么。

Caffein Chen 的原文给企业买方列了五个问题。我把它们翻译成更直接的版本：

*你的不成文规定，你打算交给谁保管？*

*当 FDE 走的时候，你能带走什么？*

*你能接受你的业务逻辑变成别人优化给竞争对手的"最佳实践"吗？*

这三个问题没有标准答案。但你至少应该知道自己不知道什么。

---

*你公司里有哪些"只有老员工知道"的隐性知识？如果有一家 AI 公司说帮你自动化这些流程，你愿意交出去到什么程度？*

## 原文参考

> Caffein Chen (陳穎漢). "The Return of the Deployment Company." Medium, 2026-05-19.
> https://medium.com/@caffein.chen/the-return-of-the-deployment-company-b1e41c615ed1

## 延伸阅读

- a16z — *Trading Margin for Moat: Why the FDE Is the Hottest Job in Startups* (2025-06)
  https://a16z.com/services-led-growth/
- Ben Thompson / Stratechery — *The Deployment Company, Back to the 70s* (2026-05-13)
  https://stratechery.com/2026/the-deployment-company-back-to-the-70s-apple-and-intel/
- The Synthesis — *The Deploy*
  https://thesynthesisai.substack.com/p/the-deploy
- Thomas Otter — *On the Forward Deployed Engineer, PLG and Genuine Adoption* (2025-12)
  https://thomasotter.substack.com/p/on-the-forward-deployed-engineer
- Flybridge — *Why 95%+ of Startups Get the FDE Role Completely Wrong* (2025-12)
  https://www.flybridge.com/ideas/the-bow/why-95-of-startups-get-the-forward-deployed-engineer-role-completely-wrong
