---
$schema: starlight
title: 1,946 个 agent，和那 11 篇参考文献
description: 把解释按实验单元切开，agent 才能跟着实验一起扩容；32 分钟不是科学的胜利，稀缺的是判断什么算读懂。
date: 2026-10-22
category: ai-agents
primarySourceUrls: ["https://openai.com/index/scaling-ai-research-for-complex-biological-data/"]
---

我读这篇论文时，最先记住的不是 32 分钟。

OpenAI 的发布页把 32 分钟放得很显眼：数千个 agent 分析数百万个脑细胞，只用了半个多小时。这个数字当然容易传播，但我往下翻到一张曲线图时，才停下来。横轴是被分析的扰动数量，从 1 增加到 893；纵轴是引用的文献数量。代表分布式 agent 的深蓝色线一路往上，在 893 个扰动处到达 7,586 篇；代表单个 agent 的浅蓝色线几乎贴着地面，终点是 11 篇。

同一个模型，同一批数据，同一套工具，差距为什么会有七百多倍？

这个问题比“32 分钟有多快”更接近这篇论文的核心。它讨论的是一个更工程化、也更容易被忽略的选择：把解释工作切成很多份，每一份都对齐到一个实验单元。一个扰动，配一个 agent。OpenAI 的[发布页](https://openai.com/index/scaling-ai-research-for-complex-biological-data/)和[论文](https://www.biorxiv.org/content/10.64898/2026.10.15.759436v1)里都写得很清楚，他们并行跑了 1,946 个 agent，每个 agent 拿到的是 cell-type-resolved 的差异表达数据、实验上下文、共享的 prompt、分析工具和文献访问权限。每个 agent 只回答一个问题：这个扰动在哪些细胞类型里留下了什么痕迹，这些痕迹和已有文献能对上吗？

把一件大事拆成很多小事，听起来没什么稀奇。难的是拆完之后还能把答案拼回去，而且每一块都要带着证据。

![核心信息图：解释成了瓶颈；1,946 个扰动各配一个 agent；单 agent 引 11 篇，分布式 agent 在 893 个扰动时约 7,586 篇；30 位专家盲评 75% 偏好分布式报告；1,519 个发现中 27.6% 得到直接支持。](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-22-distributed-bio-reasoning-img-00-infographic-core-summary.jpg)

## 一个扰动，一个 agent

单 agent 的失败方式其实很好理解。假设你让一个 agent 分析这 893 个扰动，它当然可以读完数据，但它还要同时决定先看哪个、引用哪篇、哪些异常值得追。上下文是共享的，注意力也是共享的；工作量越大，每个扰动分到的阅读预算就越少。到了某个点，它会开始用熟悉的模式回答陌生的问题，引用几篇看起来相关的文献，然后给出一个听起来合理的总结。

论文里的数字把这种“稀释”量化了。893 个扰动时，单 agent 只引用了 11 篇文献。分布式 agent 保留了 711 倍的文献量。后者并不更聪明。它只是面对的问题更窄：不需要在 893 个故事之间分配注意力，只需要把一个故事读透。[[1]](https://openai.com/index/scaling-ai-research-for-complex-biological-data/)

![论文 Fig. 2E：893 个扰动时，分布式 agent 保留 711 倍文献（约 7,586 篇），单 agent 为 11 篇。来源：Sun et al., bioRxiv 2026。](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-22-distributed-bio-reasoning-img-source-fig2e-literature-scaling.png)

每个 agent 交出来的东西也值得看：一份结构化报告，里面有发现的表型、定量的证据、生物学解释、参考文献、caveat，以及下一步可以做的实验。这个格式看起来只是工程规范，实际上决定了整套系统能不能被审计。因为“解释”一旦要单独列出证据和反例，它就不再是一篇无法核对的漂亮文章；它成了一份可以被别人拆开检查的工作记录。

所有报告最后会被汇总成知识图谱，再由 synthesis agent 去找扰动之间的关系：哪些收敛到同一条通路，哪些方向相反，哪些只在特定细胞类型里成立。论文最终得到 3,397 个去重后的关系型发现。[[1]](https://openai.com/index/scaling-ai-research-for-complex-biological-data/) 这一步也让“分布式”变得昂贵。1,946 个 agent 各自写完报告，只是完成了一半；另一半是让这些报告互相说话，而 synthesis 本身又可能引入新的偏见。

我想起站内那篇[《OpenAI 的软件工厂：让 Agent 对一条变更负责到底》](https://ntlx.github.io/articles/openai-agentic-software-factory)。那里的组织原则是一个 agent 对一条变更负责，从实现、测试、审查一直跟到发布；这里换了一个单位，变成一条扰动、一份证据报告。两者做的都是先划清一个责任边界，再让 agent 在边界内把事做深。规模来自边界的清晰，不来自 agent 的数量。

## 论文给自己出的考试

如果这篇文章只是展示“我们跑了 1,946 个 agent”，它不值得写这么长。有意思的是，作者给自己设了一场不太容易作弊的考试。

他们把这个数据集背后的源手稿和结论藏了起来。论文里说得很直接：source manuscript 和 conclusions were withheld。[[1]](https://openai.com/index/scaling-ai-research-for-complex-biological-data/) 模型用的是 GPT-Rosalind-5.5，知识截止时间是 2025 年 12 月，而源手稿在 2026 年 3 月才发布。[[2]](https://www.biorxiv.org/content/10.64898/2026.10.15.759436v1) 也就是说，agent 没法从训练数据里“背”出答案，只能从眼前的数据和文献里推。

然后他们拿 71 个源论文里的 findings 来对照。其中 55 个可以直接从差异表达数据里检验，agent 匹配或细化了 48 个，另有 4 个部分匹配；按论文的算法，直接可检验的 findings 里，94.5% 至少得到了部分复现。[[2]](https://www.biorxiv.org/content/10.64898/2026.10.15.759436v1) 这个结果至少说明，agent 找回来的结构与专家曾经得出的结构有实质重合，不只是随机生成听起来像生物学的句子。

但更让我在意的是另一组数字。1,519 个高置信 findings 里，只有 420 个（27.6%）被标为“文献直接支持”；636 个（41.9%）是“机制上可以推断，但没有直接对应的观察”；101 个（6.6%）和文献预期冲突；还有 362 个（23.8%）根本没有找到相关先例。[[2]](https://www.biorxiv.org/content/10.64898/2026.10.15.759436v1) 这组分布比“复现了 94.5%”更能说明系统的实际状态：它读得很多，但大部分结论仍然是推断，而不是证据。把引用数量当成支持结论的数量，会完全误读这项工作的意义。

人类专家的盲评，也是在这个背景下才有意义。30 位博士级生物专家，每人评 6 份报告，共 60 份报告、每份 3 次评估；在 20 组成对比较里，分布式 agent 的报告被偏好 45 次，占 75%，单 agent 10 次，平局 5 次。[[2]](https://www.biorxiv.org/content/10.64898/2026.10.15.759436v1) 这是一个不低的信号，但它仍然只是一轮盲评，不是湿实验验证。论文没有把它写成“AI 超过人类”，只写成“专家更愿意继续读这些报告”。这个措辞上的克制，值得保留。

![论文 Fig. 4K：60 次盲评判断中，分布式 agent 报告被偏好 45 次（75%），单 agent 10 次，平局 5 次。来源：Sun et al., bioRxiv 2026。](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-22-distributed-bio-reasoning-img-source-fig4k-expert-preference.png)

发布页里还有一个容易被忽略的小问题。图注说最大工作量时分布式 agent 引用了“700 多篇”文献，但同一页图表上的数据点是七千多篇；论文写的是 711 倍。[[1]](https://openai.com/index/scaling-ai-research-for-complex-biological-data/) 这个差异不影响结论，却提醒我：越是惊人的数字，越要回到图表和论文本身。宣传语言会把数量级压扁，而证据往往藏在坐标轴和样本量里。

还有那个 32 分钟。它是真的，但它是并行执行这一段的时间，不包括数据生成、湿实验验证和专家评审。论文说得很清楚：人类分析“数月到一年”是一个 illustrative estimate，不是实测对照；它的假设是每小时 22 美元、每个扰动 15 分钟、每篇论文 10 分钟。[[2]](https://www.biorxiv.org/content/10.64898/2026.10.15.759436v1) 这句话没有否定速度，只是给速度划了一条边界。32 分钟证明的是“这个分析可以这样跑”；它没有说“科学发现只需要 32 分钟”。

## 两个值得追的线索

论文里有两个具体的生物学例子，刚好能说明“解释”到底值钱在哪里。

第一个是 Tsc1 和 Tsc2。这两个基因一起调控 mTOR，在很多神经元里，敲掉任何一个都会产生相似的影响。但在小脑的 GABAergic 神经元里，Tsc2 扰动产生了 83 个差异表达基因，Tsc1 扰动是 0 个。[[2]](https://www.biorxiv.org/content/10.64898/2026.10.15.759436v1) 这个差异和结节性硬化症有关：在患者身上，小脑异常与 TSC2 突变联系很强；降低 mTOR 活性的药物可以治疗某些脑瘤和癫痫，却很难改善学习和行为问题。[[1]](https://openai.com/index/scaling-ai-research-for-complex-biological-data/) agent 没有直接给出疗法，它做的是把问题缩小到一个具体的细胞群和一组具体的表达变化：哪些变化是现有药物能纠正的，哪些可能需要新的方向。

第二个是 DCTN1。这个基因和 Perry 综合征有关，负责神经元里的货物运输。数据集里，敲掉 Dctn1 会让胆固醇合成相关的基因表达上升。agent 把这个观察和“胆固醇运输出问题会让细胞合成更多胆固醇”的文献联系起来，提出一个可检验的假说：DCTN1 的缺失会不会改变神经元内胆固醇的分布，从而参与神经退行？[[1]](https://openai.com/index/scaling-ai-research-for-complex-biological-data/) 在盲评里，这个假说拿到了 4.3/5 的 follow-up priority。[[2]](https://www.biorxiv.org/content/10.64898/2026.10.15.759436v1)

这两个例子之所以值得看，是因为它们把下一步实验变得具体。新颖本身不是重点。判断一个解释好不好，可以看它有没有指出一个值得花几个月去做的实验。论文里还有一个反例：APC 与 Wnt 的解释在专家那里拿到了很高的证据支持，但新颖性只有 1.5/5，follow-up priority 只有 2/5。[[2]](https://www.biorxiv.org/content/10.64898/2026.10.15.759436v1) 已知的、正确的、但不需要再追的东西，不应该占据有限的实验队列。这个区分要求系统会解释，也会判断解释的边际价值。听起来简单，做起来很难。

## 解释变成基础设施之后

这项工作的另一个信号，是它没有停在论文里。

代码在 GitHub 上，MIT 许可；README 里提供了一个 hosted site，可以把 corpus 接到兼容 MCP 的 AI 助手里，用只读接口查询 findings、claims、证据和发布版本。[[3]](https://github.com/jinlabneurogenomics/distributed_agent) 你可以在 Codex 里问“蛋白酶体各亚基之间是什么关系”，然后拿到带证据的 findings 和引用。这个体验和读 PDF 很不一样：论文的结论变成了一张可以继续查询、比较、追溯的图。

![概念图：1,946 份报告汇入可查询的证据图，科学家可以直接问“哪条证据？”。](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-22-distributed-bio-reasoning-img-03-framework-queryable-atlas.jpg)

这可能是比 32 分钟更长远的变化。过去，一篇论文的产出是正文、图和补充材料；读者要自己把结论拆成可以复用的知识。现在，如果作者把 reasoning atlas 一起发布，读者拿到的是一个带着证据链接的数据库。对没有生物信息学团队的小实验室来说，这种“可查询的解释”可能比一篇 PDF 更有用；对领域专家来说，它也提供了一个快速检查 agent 是否读偏了的入口。

但基础设施也会放大前面那些风险。一个可查询的 corpus 会让人误以为所有答案都在里面；一个带引用的报告会让人误以为引用就等于证据。论文的 23.8% “没有文献先例”和 41.9% “推断”提醒我们，这个 corpus 的主体是假设，不是结论。它是一张标注了“这里可能有东西”的地图；教科书还没写完。

站内那篇[《Agent 跑得越久，团队越该问：谁来验收？》](https://ntlx.github.io/articles/openai-research-acceleration-agentic-productivity)讨论过类似的问题：agent 可以把运行时间拉长，但结果不会自动变成可信的产出，中间隔着一层验收。放到这里，要被验收的是解释。谁能判断一份 agent 报告是“读懂了”还是“读得很像”，谁就摸到了这套系统的瓶颈。

## 谁来定读懂的标准

论文的评估设计已经比大多数“AI 做科研”的演示认真得多：不给源手稿、用源论文的 findings 做复现、让专家盲评、公开失败模式。但它仍然没有回答最后那个问题：什么算“读懂”。

它用 novelty、evidential support、follow-up priority、confidence 四个维度来近似；用 agent 排名和人类评分的相关性来校准；用 75% 的偏好率来证明分布式报告更受欢迎。这些都是有用的代理指标，但没有一个是 ground truth。ground truth 在湿实验里：那个胆固醇假说能不能被验证，Tsc2 在小脑里的那 83 个基因里有没有可成药的节点，DCTN1 的运输缺陷是不是神经退行的早期事件。论文自己也没有越过这条线，它把这些都写成“值得追的线索”；它们还不是“发现”。

![概念图：7,586 篇引用进入“证据检查”漏斗，只有 27.6% 直接支持被留下；旁边的人仍在判断“什么算读懂？”。](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-22-distributed-bio-reasoning-img-04-comparison-citation-vs-evidence-v2.jpg)

所以我对这项工作的判断是：它把“解释”做成了一个可以设计、可以并行、可以审计的系统。读得更快只是副产品。一个扰动一个 agent，是架构选择；报告必须带证据和 caveat，是质量标准；不给源手稿、让专家盲评，是评估选择。32 分钟只是这些选择跑起来之后的一个副作用。更难的部分，是让人类在机器读完七千多篇文献之后，仍然知道该看哪 11 篇，以及为什么。

下一次再看到“几分钟读完多少篇论文”的说法，我大概会先找那张曲线图，看看另一条线停在了哪里。因为一条线冲到七千多，另一条线停在 11，这才是这项技术现在最诚实的自画像：它能把阅读的规模做大，但还没有替我们决定，什么值得读。

## 参考资料

1. OpenAI. [Using thousands of AI agents to uncover new leads in biological data](https://openai.com/index/scaling-ai-research-for-complex-biological-data/). 2026-10-21.
2. Sun, A., Park, J. J., DeTomaso, D., et al. [Distributed AI agents enable comprehensive discovery of biological insights at scale](https://www.biorxiv.org/content/10.64898/2026.10.15.759436v1). bioRxiv, 2026. doi:10.64898/2026.10.15.759436.
3. Jin Lab Neurogenomics. [Distributed Agents](https://github.com/jinlabneurogenomics/distributed_agent). GitHub, MIT License.
4. Shi, T., Korshunova, M., Kim, S., et al. [Genome-scale functional mapping of the mammalian whole brain with in vivo Perturb-seq](https://www.biorxiv.org/content/10.64898/2026.03.16.711480v1). bioRxiv, 2026.
