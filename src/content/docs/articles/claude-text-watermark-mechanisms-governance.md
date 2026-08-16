---
$schema: starlight
title: 在语言的熵隙里掷骰子：Anthropic 文本水印的数学优雅与现实尴尬
description: Claude 文本水印把统计指纹藏进了同义词选择的微小冗余里，在数学上做到了对体验的极致克制；但在开源对抗与洗稿黑产面前，它注定只是一张给正规军佩戴的合规出厂标。
date: 2026-08-16
category: security
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-16-claude-text-watermark-mechanisms-governance-img-00-infographic-core-summary.png)

从 2026 年 8 月起，所有新上线的 Claude 模型生成的内容里，都悄然带上了一串人类肉眼无法分辨的数字指纹。

Anthropic 官方发布的长文宣告了这一转变的全面落地。为了遵守欧盟《人工智能法案》（EU AI Act）第 50 条关于 AI 生成内容透明度的强制监管要求，Anthropic、Google、OpenAI 等近 190 家机构签署了实践准则，将内容溯源推向了行业默认基线。

但与以往那些在图片里加水印、在文档尾部塞隐藏字符的粗暴方案截然不同，这次上线的文本水印在工程上做到了近乎苛刻的克制：零延迟增加、零额外 Token、零可见标记、对生成质量与文本创意毫无统计学显著影响。

技术上极其优雅，但在现实治理中，它却不得不面对一个尴尬的事实：这是一套在数学上无可挑剔、在对抗上却“防君子不防小人”的防御性装置。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-16-claude-text-watermark-mechanisms-governance-img-01-hero_quill_metaphor.png)

## 怎么在毫无痕迹的纯文本里藏进一串密码？

要在图片或音频里标记来源并不复杂。像 C2PA 这类工业标准，本质是在文件的元数据 Header 里塞入一段带加密签名的凭证，或者在像素高频区域叠加不可见噪波。容器还在，签名就在。

但纯文本不同。纯文本是世界上最容易脱落元数据的载体。任何人按下 `Ctrl+C` 和 `Ctrl+V`，所有文件头、作者信息、编码标记都会被瞬间剥得一干二净。如果试图在正文里插入零宽 Unicode 字符（Zero-Width Characters），只要经过基础的文本清洗脚本，或者被复制到某些终端里，不仅一眼就会被识破，甚至可能直接搞垮下游的分词器（Tokenizer）。

既然外挂的载荷留不住，唯一的办法就是把水印直接融进“文本生成本身”的微观结构里。

这就是 Google DeepMind 在 2024 年发表于《Nature》的 **SynthID-Text** 算法的核心思想，其理论源头可以追溯到 Scott Aaronson 在 2022 年提出的伪随机采样水印方案。

自回归大语言模型每生成一个词，都会计算出一整张候选词的概率分布表。在很多语境下，排名前几位的词义几乎完全等价。例如描写天气，模型面临“cold and overcast”还是“cold and grey”的选择，两者概率接近，读者读起来也毫无信息差。

常规模型在此时会调用系统随机数生成器掷一颗骰子。而带水印的 Claude，则用 Anthropic 掌握的秘密私钥（Secret Key）以及前面已经生成的几个词作为种子，计算出一组确定性的伪随机数，进而微调候选词的相对优先级。

对读者来说，用词自然流畅，既没有生僻怪字，也没有语法扭曲；但对持有私钥的检测方来说，只要复盘这段文字里词汇排列的统计偏置，就能以极高的数学置信度计算出：这段话是不是 Claude 在私钥引导下一步步走出来的。

就像用圆周率 $\pi$ 的某一段特定数字代替骰子去玩大富翁。游戏过程毫无异样，但事后只要拿着 $\pi$ 的表去核对每一步棋，就能确诊这盘棋的秘密来源。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-16-claude-text-watermark-mechanisms-governance-img-02-synthid_tournament_sampling.png)

## 确定性与自由度：为什么写代码和算术几乎打不上水印？

这种设计揭示了大模型文本水印最底层的物理边界：**它极度依赖语言本身的熵（Entropy）与选择冗余。**

一旦任务失去了选择的自由度，水印机制就会自动退火甚至完全消失。

最典型的场景是数学推理与编程代码。当模型写下 `2 + 2 =` 时，唯一的合理选项只有 `4`，概率分布极端陡峭。如果算法为了强行植入水印而微扰概率，强行让模型选个 `5`，那就是人为制造幻觉与故障。

在代码生成中同样如此。语法关键字、函数名调用、变量引用绝大多数都具有严格的确定性约束。因此，Claude 在写纯逻辑代码和事实性硬结论时，内部的水印信号极度稀疏，顶多只能附着在注释或者偶发的局部命名偏好中。

日常的轻度文本润色（Proofreading）也是同一个道理。如果作者把一篇自己写的两千字长文交给 Claude，只让它帮忙纠正错别字和标点符号，Claude 实际挑选和替换的词汇只有区区几十个。因为绝大部分词汇依然由人类作者决定，留给私钥发挥的空间过小，检测 API 根本无法积累出足够的统计样本量来断定这是 AI 生成。

这也直接击碎了许多写作者对于“润色会不会被贴上 AI 标签”的红字焦虑。文本必须具备足够长的篇幅、由模型自主完成大量自由选词决策，统计显著性（p-value）才会真正收敛。

## 优雅背后的死穴：为什么说它防君子不防小人？

在技术实现上，Anthropic 和 DeepMind 的这套方案堪称工程典范。它没有像早期的启发式检测工具（如某些声称能识别 AI 常用句式“this isn't X, it's Y”或频繁词“quietly”的检测器）那样制造海量误判，也没有牺牲商业模型的推理效率。

但在现实的对抗性内容治理中，它的脆弱性也同样显而易见。

首先是**释义洗稿（Paraphrasing）的降维打击**。因为水印的本质是前序词与当前词之间的伪随机弱相关，只要攻击者将 Claude 生成的文本喂给另一个未经水印的开源小模型，输入提示词“换几种同义句式重新表述”，原有的统计链条就会被瞬间粉碎。恶意制造垃圾信息或虚假新闻的灰产链条，只需要多跑一行本地脚本，就能彻底洗掉所有痕迹。

其次是**开源与闭源的监管不对称**。我们在之前的文章中讨论过[协议与规范在行业落地时的生态分化](https://ntlx.github.io/articles/mcp-tipping-point)，在安全治理领域更是如此。合规法案能管得住遵守规则的商业 API 提供商（Anthropic、OpenAI、Google），却无法管住全球数以万计本地运行的开源模型权重。当商业大模型全体戴上合规紧箍咒时，真正被置于聚光灯下的只是守法开发者和普通企业，违规者依然能在开源生态的掩护下隐身。

最后是**鉴伪权力的中心化垄断**。由于检测依赖核心私钥，公众和第三方安全机构无法独立离线复核，必须通过厂商提供的官方 API 才能完成鉴伪。这在客观上让平台不仅成了内容的生成者，也成了真实性的唯一仲裁者。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-16-claude-text-watermark-mechanisms-governance-img-03-governance_asymmetry_spectrum.png)

## 既然容易被洗掉，为什么大厂还要全量上线？

既然无法彻底终结恶意利用，为什么大厂依然选择在全球范围内全量铺开？

答案并不在对抗攻防的技术细节里，而在于**商业 AI 作为社会基础设施的身份确立**。

在过去两年中，大模型经历了从极客玩具向关键生产力工具的演进，正如我们在分析[大模型供应商性能评估与动态路由](https://ntlx.github.io/articles/evaluating-llm-provider-performance-routing)时所见，稳定、可预期、符合监管要求正成为企业级采购的首要考量。

文本水印不是用来消灭恶意黑产的银弹，而是一张合规社会的“出厂条形码”。它的存在，使得企业级审计、版权合规界定、学术诚信基准线在主流合法商业链路中具备了最低限度的追溯可能性。

它承认自己的局限性，不宣称全能，不在无选择空间的地方强行干预，更不牺牲普通用户的毫秒级交互体验。

这场发生在自回归采样概率空间里的微小掷骰子，是制度监管与统计物理之间的一次精巧折中。它给数字世界留下一道隐形的接缝——虽然任何人只要稍微用力就能将它撕开，但只要这条接缝还在，就证明这台庞大的智能机器，依然在人类划定的规则轨道里运转。

*{面对大模型全量普及的不可见文本水印，你认为这种“防君子不防小人”的合规机制在日常协作中是否会影响你对 AI 工具的信任感？欢迎在评论区分享你的看法。}*

## 延伸阅读

* [同一天，OpenAI、Runway、Google 都选了 MCP——一个协议的临界点](https://ntlx.github.io/articles/mcp-tipping-point)
* [模型选型只是虚晃一枪：读 OpenRouter 的大模型供应商性能评估与动态路由指南](https://ntlx.github.io/articles/evaluating-llm-provider-performance-routing)
* [用被审查的大模型做蒸馏，真的会“传染”偏见吗？读 CTGT 最新实证研究](https://ntlx.github.io/articles/distillation-censorship-transfer)
* [Claude Code 把专家重新暴露出来](https://ntlx.github.io/articles/claude-code-expertise)

## 参考资料

* [How Claude’s text watermark works - Anthropic Announcements](https://www.anthropic.com/news/claude-text-watermark)
* [Scalable watermarking for identifying large language model outputs - Nature 2024 (Google DeepMind SynthID-Text)](https://www.nature.com/articles/s41586-024-08025-4)
* [Strong backing for the Code of Practice on Transparency of AI-Generated Content - European Commission](https://digital-strategy.ec.europa.eu/en/news/strong-backing-code-practice-transparency-ai-generated-content)
* [Coalition for Content Provenance and Authenticity (C2PA) Standards](https://c2pa.org/)
* [Watermarking Language Models - Scott Aaronson (2022)](https://news.ycombinator.com/item?id=claude-watermark-discussion)
