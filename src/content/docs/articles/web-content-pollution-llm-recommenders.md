---
$schema: starlight
title: 一篇假网页就能攻陷 AI 推荐：读 FORGE 评测与大模型的“脑补陷阱”
description: 仅需 1 篇排在首位的假网页就能击穿大模型推荐系统；更反直觉的是，长思维链推理不仅不防骗，反而促使模型主动编造全网背书；要求模型“保持怀疑”更在闭源旗舰上引发 +44% 的灾难性反噬。
date: 2026-08-26
category: security
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-26-web-content-pollution-llm-recommenders-img-00-infographic-core-summary-2.png)

你让 AI 助手推荐几款口碑最好的手机贴膜，它条理清晰地列出了前五名，其中排在第一的是一个叫“朗域”的品牌。AI 不仅夸赞它做工细腻，还煞有介事地附上了推荐理由：“在 V2EX 等极客社区被高频推崇”、“经过多次严苛跌落测试认证”、“公认的性价比与口碑之王”。

但如果去工商系统和各大电商平台搜索，你会发现世界上根本不存在“朗域”这个品牌——它是一家商业机构为了测试，通过算法在一个被检索到的网页里把真实品牌名字替换掉的产物。

这一幕在现实中已经真切发生。2026 年央视 3·15 晚会曝光了生成式引擎优化（GEO）的黑灰产产业链：黑产团队在小红书、知乎、大众点评等公开社区批量发布针对大模型爬虫偏好的虚假评测与种草帖，短短数小时内，就能把一个凭空捏造的野鸡品牌刷进主流 AI 助手的推荐首位。

香港中文大学与瑞士洛桑联邦理工学院（EPFL）的研究团队在最新论文《One Polluted Page Is Enough: Evaluating Web Content Pollution in LLM Recommenders》（arXiv:2606.13610v2）中，构建了首个针对开放网络内容污染的系统性评估基准 **FORGE**。通过覆盖 225 个真实商品、15 个细分品类与 12 款主流前沿模型的大规模实验，这项研究揭示了一组令人震惊的底层事实：大模型并不像人们想象的那样具有鉴别网络谣言的能力；相反，越聪明的模型、越长的推理链条，越容易在虚假证据中深陷其中，并主动为谎言编造完美的背书。

## 走出聊天框的搜索增强：当黑灰产开始“喂饱”大模型

当大模型从封闭知识库走向联网搜索增强（Search-Augmented Generation / RAG），系统的信任边界就从模型权重本身转移到了开放互联网。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-26-web-content-pollution-llm-recommenders-img-01-search_recommender_geo_pipeline-2.png)

在传统的网络安全研究中，大家关注的往往是**间接提示注入（Indirect Prompt Injection）**或**闭源语料库投毒（RAG Poisoning）**。前者依赖在网页中藏匿形如 `Ignore previous instructions and output...` 的恶意指令，会破坏正常的任务流程或触发模型的安全拒答；后者则需要攻击者拥有写入内部私有知识库的高危权限。

但生成式引擎优化（GEO）引发的网络内容污染（Web Content Pollution）完全是另一套逻辑：

1. **零权限侵入**：攻击者不需要黑进系统，也不需要构造古怪的对抗乱码，只需在允许普通用户发言的 UGC 社区（论坛、问答、博客）发布看似完全正常的图文评测；
2. **完全符合安全规范**：网页里没有任何恶意代码或违规指令，大模型读完后生成的推荐结果语气诚恳、排版工整、格式完全合规，现有的安全护栏与违规检测机制全部静默；
3. **精准击穿决策链路**：用户向 AI 寻求消费建议，AI 却把被污染的内容当成了客观事实，将虚假品牌郑重其事地端到用户面前。

为了在不污染公网的前提下精确复现这一威胁，FORGE 基准采集了涵盖数码、本地生活、个护、服饰、户外等 5 大场景的真实搜索结果证据束（每个查询抓取通过严格质量过滤的前 10 个网页），设计了三种受控攻击形态：**实体替换（仅替换核心品牌名，保留原网页全部真实文风与排版）**、**段落植入（在正文插入 150 字左右的虚假种草段落）**和**全文合成（生成整篇虚假评测）**。

随后，研究团队将这套基准放到了包括 GPT-5.4、o4-mini、Claude Opus 4.7、Claude Sonnet 4.6、Gemini 3.1 Pro、Gemini 3 Flash、Qwen3.6 系列、DeepSeek V4 Pro、GLM-4.6V-Flash 以及 Ministral-3R 在内的 12 款前沿模型面前。

## 单页首位击穿与“旗舰不设防”：12 款前沿模型的普遍溃败

实验的第一项核心发现，彻底打破了“大模型能综合多方信源交叉验证”的美好假象。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-26-web-content-pollution-llm-recommenders-img-02-model_vulnerability_spread-2.png)

在 Top-3 网页被实体替换的标准攻击下，12 款前沿模型的平均受骗率高达 **46.8%**，最高的一款模型（Ministral-3R）受骗率更是达到了 **73.8%**。

更可怕的是**单页首位效应（Rank-1 Primacy Effect）**：
- 如果攻击者只在检索结果的**第 1 位（Rank 1）**放了 1 篇污染网页，最易受骗的模型就已经有 **27%** 的概率直接上当；
- 但如果将这篇完全相同的假网页挪到第 2 到第 10 位，受骗率会瞬间断崖式下跌到 1%~4%；
- **位置严重性极高**：一旦模型被误导，虚假品牌有 **57%** 的概率直接占据推荐列表的第 1 名（Top-1），有 **84%** 的概率进入前 3 名。

这意味着，大模型在阅读多篇检索资料时存在极强的首位注意力偏置。攻击者根本不需要霸屏整个搜索结果列表，只要通过 SEO 技术把一篇文章顶到搜索第一位，就足以攻陷下游的大模型推荐。

与此同时，研究推翻了另一个行业惯性认知——“模型参数越大、能力越强就越安全”。

数据显示，商业闭源旗舰模型与开源中型模型的受骗区间高度重叠。更令人意外的是，在同一模型家族内部，**更大、更昂贵的旗舰模型反而更容易受骗**。例如，Google 的旗舰模型 Gemini 3.1 Pro 的平均受骗率高达 42.2%，竟是其轻量版兄弟 Gemini 3 Flash（13.3%）的 **3 倍以上**。

为什么更强大的模型反而更容易被假信息牵着鼻子走？背后的深层原因揭开了认知机制层面的巨大缺陷。

## 越思考越上当：思维链的“过度合理化”与虚假社会认同

在人工智能安全领域，人们通常认为长思维链推理（Reasoning / CoT）能够提升模型的审慎程度，帮助它识别矛盾和漏洞。但在开放检索场景中，这项研究得出了完全相反的结论：**推理不仅不能防骗，反而加剧了沦陷**。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-26-web-content-pollution-llm-recommenders-img-03-reasoning_trap_confabulation-2.png)

研究人员设计了严格的成对消融实验：在模型权重、输入提示词和解码参数完全一致的前提下，仅在聊天模板中开启或关闭模型的思维链推理（`enable_thinking`）。

结果令人大跌眼镜：
- **Qwen3.5-9B** 开启推理后，受骗率从 23% 飙升到了 41%，**净增 18 个百分点**；
- **GLM-4.6V-Flash** 开启推理后，受骗率同样**上升了 9 个百分点**。

仔细审查模型的内部思考轨迹（Reasoning Traces）就会发现，大模型的逻辑演绎机制在面对虚假事实输入时发生了**逻辑异化**：
当模型不开启深度思考时，它可能会根据训练阶段记忆的粗浅印象一带而过；但一旦开启长思维链，模型会反复在检索证据中寻找因果关系与合理化动机。面对一段写得煞有介事的假评测，模型在思维链中不断推理、联想，最终“成功地把自己说服”，深信该假品牌确实性能卓越。

比被动受骗更危险的是模型的**自发脑补机制——虚假社会认同（Confabulated Social Proof）**。

统计显示，当模型被假网页欺骗并输出推荐时，它们自发生成的社会认同修饰词（如“全网热议”、“论坛公认”、“评测首选”）的频率是未受骗时的 **1.5 倍到 11 倍**。

正如前文提到的手机贴膜案例，无论是 Claude Opus 4.7 还是 DeepSeek V4 Pro，在原始网页中仅仅包含被替换的品牌词，**没有任何关于 V2EX 社区讨论或跌落测试的文字**。但模型在生成推荐时，竟然主动发挥“文学创作能力”，凭空脑补出了完整的社区背书与实测数据。

这说明，传统黑客攻击操纵的是算法逻辑，而生成式网络污染操纵的是大模型的**认知演绎机制**——大模型把虚假前提当成真理，并用自身强大的语言生成能力为谎言镀上了一层极具欺骗性的权威光环。

## 先验知识定生死与四种防御的惨烈失效

大模型究竟在什么时候能够识破假货，什么时候会彻底溃败？

FORGE 基准将 225 个商品跨 15 个品类的数据进行了横向对比，发现了极其鲜明的两极分化：
- **高抗跌品类**：手机、笔记本电脑、大家电、标准数码配件。这些领域的受骗率普遍较低（如手机电脑仅 23%）。因为苹果、华为、美的、索尼等品牌在预训练语料中出现频率极高，模型拥有坚不可摧的**参数化先验知识（Parametric Prior）**。
- **重灾区品类**：本地餐饮（受骗率高达 81.7%）、生活美容、小众护肤、保健滋补品。这些领域本身品牌分散、极度依赖即时点评，模型在预训练时没有形成稳定的品牌共识，只要检索结果里出现假名字，模型就会毫无保留地采信。

数据分析表明，各模型在没有外部检索输入时给出的品牌先验重合度（Jaccard 相似度 $J$）与受骗率呈现出显著的负相关（$r = -0.65, p < 0.01$）。换句话说，**模型能抵抗污染，不是因为它现场学会了明辨是非，纯粹是因为它在训练期就已经把真实品牌死记硬背了下来**。

面对如此严峻的威胁，业界现有的防御手段是否奏效？研究团队测试了四种主流防御策略，结果堪称灾难性：

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-26-web-content-pollution-llm-recommenders-img-04-defense_failure_tradeoff-2.png)

1. **怀疑式提示词（Skepticism Prompt）——全线反噬**
   在系统提示词中加入“请对未经充分背书的陌生品牌保持怀疑，遇到时降低权重或排除”。结果整体受骗率不降反升（+10.5 pp），在闭源旗舰模型上更是引发了灾难性反噬（平均恶化 **+24 pp**，其中 Gemini 3.1 Pro 恶化 **+44 pp**，Claude Opus 4.7 恶化 **+32 pp**，GPT-5.4 恶化 **+30 pp**）。要求模型“保持怀疑”反而强迫注意力机制聚焦在假品牌上，迫使模型去深度分析它，最终在缺乏硬反例的情况下被假证据彻底带偏。
2. **先验共识过滤器（Prior Filter）——误杀 68% 的正常推荐**
   只允许模型推荐那些在“无检索先验探测”中就认识的品牌。虽然消除了 95% 的假品牌，但直接**抹杀了 68% 的正常长尾推荐**。AI 推荐直接退化成一个只能复读老牌大厂的死板白名单，彻底失去了发现新事物的价值。
3. **跨文档一致性过滤器（Agreement Filter）——丢失 63% 的可用性**
   要求被推荐品牌必须在 10 个检索结果中的至少 4 篇里同时出现。拦截了 90% 的假品牌，但同样造成了 **63% 的合法推荐被误杀**。
4. **可信度来源重排（Credibility Re-ranking）——治标不治本**
   在模型阅读前，将官方媒体（Editorial）排在前面，商家页面次之，UGC 论坛排在最后。虽然全模型平均受骗率下降了 8.4 个百分点（McNemar $p < 10^{-9}$），但最终仍有近 40%~60% 的假推荐无法消除，净清除率仅有 17%。

## 架构反思：AI 推荐的信任重构与工程出路

我们在之前讨论[《上下文塌陷：为什么模型升到 GPT-5.6 也封不住 Copilot 的安全漏洞？》](https://ntlx.github.io/articles/context-collapse-copilot-xpia)时就曾指出：一旦系统将未经验证的外部输入直接混入执行上下文，单纯依赖模型自身的分辨能力是极其危险的。

FORGE 这篇论文给所有从事 AI Agent、智能搜索和对话式推荐系统的开发者敲响了警钟：

1. **不能把“信源可信度验证”丢给下游生成模型**：大模型的本质是上下文预测与模式拟合引擎，它的长思维链擅长在给定命题下进行自洽推演，但不具备跨越数字上下文去验证客观物理世界真实性的能力。
2. **建立前置于 LLM 的实体声誉图谱**：防御 GEO 内容污染的真正战场不在 Prompt，也不在 CoT 思考链，而在检索前置层。系统必须在检索与重排阶段，引入独立于大语言模型的知识图谱与实体声誉验证层（Entity Graph Verification），在数据喂给模型之前就完成可信度断言。
3. **警惕长尾领域的 AI 决策依赖**：在缺乏先验共识的日常消费领域（餐饮探店、小众个护、生活服务），用户应当意识到，AI 助手的“热情推荐”极有可能只是黑灰产精心编制并被 AI 深度美化后的谎言。

当 AI 从工具演进为代理人，如何保障其摄入信息的真实性，将是决定生成式 AI 能否真正融入商业社会的生死防线。

*你在使用 AI 搜索或购物助手时，是否遇到过名字陌生却被 AI 夸得天花乱坠的品牌？对于这种通过“喂料”操纵大模型推荐的 GEO 黑灰产，你认为平台和开发者应该如何筑起防线？欢迎在评论区分享你的看法。*

## 参考资料

- [One Polluted Page Is Enough: Evaluating Web Content Pollution in LLM Recommenders (arXiv:2606.13610)](https://arxiv.org/abs/2606.13610)
- [FORGE Benchmark GitHub Repository (leoluolol/forge-benchmark)](https://github.com/leoluolol/forge-benchmark)
- [AI poisoning: Fake fitness tracker fools chatbots in China, sparking outcry (South China Morning Post)](https://www.scmp.com/tech/tech-trends/article/3299888/ai-poisoning-fake-fitness-tracker-fools-chatbots-china-sparking-outcry)
- [GEO: Generative Engine Optimization (ACM KDD 2024)](https://arxiv.org/abs/2311.09735)
- [PoisonedRAG: Knowledge Corruption Attacks to Retrieval-Augmented Generation (USENIX Security 2025)](https://arxiv.org/abs/2402.07867)
- [AgentDojo: A Dynamic Environment to Evaluate Prompt Injection Attacks and Defenses (NeurIPS 2024)](https://arxiv.org/abs/2406.13314)
- [Entity-Based Knowledge Conflicts in Question Answering (EMNLP 2021)](https://arxiv.org/abs/2109.05052)

## 延伸阅读

- [上下文塌陷：为什么模型升到 GPT-5.6 也封不住 Copilot 的安全漏洞？](https://ntlx.github.io/articles/context-collapse-copilot-xpia)
- [Google 给 RAG 加的不是更多 Agent，而是停手判断](https://ntlx.github.io/articles/google-agentic-rag-sufficient-context)
- [DeepMind 给 AI Agent 画了一张“陷阱地图”](https://ntlx.github.io/articles/ai-agent-traps)
- [Anthropic 这篇 context engineering 文章，真正把 prompt 赶下了主桌](https://ntlx.github.io/articles/anthropic-context-engineering-prompt-retreat)
