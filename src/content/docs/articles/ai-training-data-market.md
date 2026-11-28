---
$schema: starlight
title: 同一道训练题，为什么有的 AI 实验室愿意付独占价？
description: G2i 的访谈讲了两种采购方式：实验室可以折价合买现成数据，也可以为独占付溢价。我更关心的是，怎样判断一批题能补上模型的缺口，以及这项判断为什么值得留在买方手里。
date: 2026-11-28
category: ai-industry
primarySourceUrls: ["https://lspace.beehiiv.com/podcast/s/latent_space_the_ai_engineer_podcast/inside_the_ai_training_data_market_gabe_greenberg_g2i", "https://latent.space/p/inside_the_ai_training_data_market_gabe_greenberg_g2i/"]
---

swyx 问 G2i 创始人 Gabe Greenberg，实验室花钱买来的训练数据，总该要求独占吧？Greenberg 说，有些买方知道同一批现成数据还会卖给别人，愿意接受，因为这样更便宜。聊到算力已经排好、数据却还没到的时候，他又提到现货。另起一批长程任务需要时间，手边这批只要足够合用，就可能先排进训练。节目由 G2i 赞助，这些采购细节来自 Greenberg 接触的客户。

读到这里，我更想知道实验室怎么判断该买哪道题。独占权能拦住供应商转售一批数据。那批题有没有用，还得看它们能不能教会模型做一件原来老是做错的事。

![怎么买训练题。现货看档期，独占限制转售，训练收益用留出的新题验证](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-28-ai-training-data-market-00-infographic-core-summary.jpg)

## 一道题值多少钱，先看它怎么判

设想一家店让 AI 把缺货商品标为待补货。任务说明得交代管哪家店、哪些商品。种子数据给出可操作的起点，里面有库存清单，也有名称相近但编号不同的商品。验证器负责检查操作结果，目标商品的状态有没有改对，另一家店的同名商品有没有被误改。

验收规则有一点偏，题目就变了。如果只查目标状态，模型把整张表都标为待补货也能拿分。如果硬性要求点击顺序，模型用同样受支持的批量操作正确完成，也可能被扣分。这两种评分都会给模型错误的反馈。每次练习开始前，还得把环境重置到同一份库存，否则上一轮的操作会改掉下一轮的起点。

Greenberg 说，资深工程师还得拿捏难度，让任务比模型眼下会做的稍难一点。这个看似简单的要求，得先跑过模型才知道分寸。模型总能做对，反复练的新增信息就少。它连局部步骤也很少做对，而验证器只在最后给通过或失败，训练就很难从这些尝试里分辨哪些动作值得保留。给中间步骤加上可靠反馈，难题也可以变成练习。

我在[写 Handshake 的数据团队](https://ntlx.github.io/articles/handshake-expert-judgment)时关注过交付后的验收。看 G2i 这一集，问题往前移了一步。验收规则一旦用来给训练打分，它就能影响模型往哪个方向改。OpenAI 审计用于评测的 SWE-Bench Pro 时，发现有的测试会卡住题面没要求的实现细节，有的覆盖又太少，允许不完整的修复通过。那是针对评测集的发现，搬到训练场景里，我会借它检查低分究竟来自模型的操作，还是题目的判法。

## 现货给的是交付时间，独占买的是限制转售

Greenberg 说，供货方会参考平均处理工时来报价，交付之后还会按买方反馈返修。工时能解释一道题为何贵。买方还得另算，训练之后，模型在新任务里究竟少犯了什么错。

通用任务有现货，训练窗口又已排定，接受非独占就很好理解。供应商可以向多个客户分摊出题成本，客户也有机会在档期内开始实验。定制任务则值得在缺口很具体时考虑。比如库存管理模型平常表现不错，集中栽在跨门店调拨后的库存同步上。买方可以委托供应商换门店、换商品、换操作顺序，围绕同类错误给出一批能复跑、有明确验收条件的题。

即使值得定制，我也会单独算算独占要多花的钱。竞争对手能否用别的材料练到同一种行为？这批任务有没有机会赶在工作流变化前产生收益？如果缺口普遍、任务好重做，限制转售的价值可能有限。如果缺口确实影响核心产品，场景和判分又难以复刻，独占才有更清楚的购买理由。

![Latent Space 节目原图。Gabe Greenberg 与 Shared、Exclusive 两个标签](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-28-ai-training-data-market-01-source-latent-space-g2i.jpg)

## 买方要自己留一套题

访谈还把成熟的供应商管理和完全内制分开讲。要组织大量专家出题、复核和返修，确实是一门专门的生意。对买方而言，我会用自己看到的失败来选题，并把检验收益的任务留在手里。

以库存任务为例，我会把不同门店、商品和调拨条件留在评估集里，用同一个起点和同一套工具比较训练前后的结果。除了看状态同步成功率，也看误改其他商品的次数。新题上没有收益，或者错误只是转移到了别的动作，下一轮谈的就该是场景和评分规则，此时加订同类题，很难排除出题或评分带来的误差。

这也是我理解访谈后段「原始公司数据」的方式。Greenberg 提到，模型可能把散落在聊天和邮件里的两位近似姓名的人混为一谈。工作记录吸引人的地方，在于同一件事会穿过不同工具并持续变化。要用这类材料制题，我会先确认授权和用途，再保留对任务有影响的关联，设计可以复核的结果。假如模型认错了人，有什么证据可以让验证器判定它选错了对象？

下一次看到报价单上的「每道任务」，我会先看试单有没有抓到那些反复出现的错误，再看这些错误在另一组题上有没有变少。留出的题才是我决定要不要续单的依据。

## 参考资料

- [Latent Space 原节目与章节](https://latent.space/p/inside_the_ai_training_data_market_gabe_greenberg_g2i/) · [Beehiiv 节目转录](https://lspace.beehiiv.com/podcast/s/latent_space_the_ai_engineer_podcast/inside_the_ai_training_data_market_gabe_greenberg_g2i)。节目原封面由 Latent Space 提供。
- [G2i 的强化学习环境说明](https://www.g2i.ai/products/rl-environments)
- [SWE-Bench Pro 论文](https://arxiv.org/abs/2509.16941) · [OpenAI 对 SWE-Bench Pro 的审计](https://openai.com/index/separating-signal-from-noise-coding-evaluations/)
