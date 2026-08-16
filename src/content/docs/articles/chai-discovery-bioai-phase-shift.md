---
$schema: starlight
title: 当药企突然开始为纯软件买单：Chai 正在把生物分子做成“分子的 CAD”
description: 过去四年制药巨头只买绑定临床的管线资产，今年却在 72 小时内疯抢 AI 软件授权。从 AlphaFold 结构预测到 Chai 的全原子 De Novo 设计，生物学正在迎来将经验科学转化为精密工程的 CAD 时刻。
date: 2026-08-16
category: ai-industry
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-16-chai-discovery-bioai-phase-shift-img-00-infographic-core-summary.png)

在生物科技（Biotech）与制药行业中，一直存在着一条残酷的铁律——“纯做 AI 软件必死，想要活下去必须自己下场做药建管线”。

在过去很多年里，几乎所有标榜“AI 驱动”的初创公司最终都走上了同一个模式：因为药企根本不相信外部软件能在全盘业务中起效，AI 公司为了证明自己，只能硬着头皮自己推进临床前和临床一期管线，或者与药企签署充满苛刻里程碑前提的“生物美元”（Biobucks）协议。所谓十亿美元的重磅合作，实际前期能拿到的固定首付款往往不足 2% 到 5%，剩下的钱全挂在漫长而极易失败的临床试验节点上。

但就在 2026 年，整个制药行业的商业逻辑突然发生了一场极其戏剧性的相变（Phase Shift）。

OpenAI 种子轮领投、估值已达 40 亿美元的蛋白质设计初创公司 **Chai Discovery**，在没有任何自营药物管线的前提下，连续拿下了礼来（Eli Lilly）、辉瑞（Pfizer）、诺华（Novartis）以及 argenx 等多家跨国制药巨头的企业级工具授权大单。

制药巨头们不再要求 Chai 拿特定靶点来对赌，而是真金白银地按年支付高额的纯软件与平台访问费用，并由药企自己的科学家在全业务中铺开使用。

在著名 AI 播客 *Latent Space* 对 Chai 联合创始人 Matt McPartlon 与产品负责人 Neil Patil 的深度访谈中，两人详尽复盘了这场从“不信任的黑盒”到“工业级生产力”的跨越。这不仅是一家 30 人创业团队的商业胜利，更是**生物学从充满随机性的“经验科学”迈向确定性“精密工程”的标志性转折**。

## 72小时敲定四笔大单：制药界从“买管线”到“买软件”的范式突变

要理解这场突变的剧烈程度，最好的方式是看一组直观的行业交易数据。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-16-chai-discovery-bioai-phase-shift-img-01-pharma_deals_timeline.png)

在 2021 年至 2025 年整整四年间，全球公开披露的跨国药企与 AI 生物科技公司的合作案中，绝大多数都属于“资产与靶点绑定交易”（Asset/Target Deals，如罗氏与 Recursion、安进与 Generate、默克与 Absci、阿斯利康与 Isomorphic Labs）。在整整四年里，纯粹以软件使用费和平台授权为核心的工具交易（Tools Deals），全球**仅仅公开了 1 起**。

然而到了 2026 年，天平被彻底打破。

仅在今年上半年，全行业公开披露的工具型大单就激增至 **10 起**。尤其在今年 1 月旧金山举行的 JPM 摩根大通医疗健康大会期间，短短 **72 小时内** 就密集爆出了 4 起巨额软件工具采购协议（包括 Bayer 与 Cradle、GSK 与 Noetik、Pfizer 与 Boltz、Eli Lilly 与 Chai）。

为什么深谙研发风险的大药企会突然转性，开始为纯软件大举买单？

Chai 团队给出的答案很朴素：**因为模型终于跨越了“值得被信任”（Good-enough-to-trust）的临界点。**

以往的计算生物学工具在实验室里的命中率往往惨不忍睹（甚至低于 1%）。药企研发团队不得不继续依赖极其繁琐且昂贵的湿实验传统手段：比如将病原靶点注射进实验小鼠体内进行免疫筛选，或者通过数十亿规模的酵母表面展示库盲筛。这种“大海捞针”式的试错不仅单个靶点耗资数百万美元、耗时数年，而且筛选出来的抗体分子往往具有极大的不可控性——你根本不知道它具体咬在靶点的哪个位置，更无法预先设计它的选择性。

而当新一代生成式模型能够在 50 个此前没有任何已知抗体结合的高难度真实靶点中，直接交出 50% 的靶点突破率与平均 20% 的结合命中率时，药企科学家的态度立刻发生了 180 度大转弯。

## 为什么坚决不自建药物管线？中立“军火商”的生态算盘

在当前的 AI 制药圈里，Chai 几乎是极少数高调宣布“坚决不碰自研管线”的团队之一。

做自研管线看似能在药物获批后获得巨大的长尾收益，但对于一家基础模型驱动的平台公司来说，自建管线往往会带来致命的结构性内耗：

1. **极其尖锐的客户利益冲突**：一旦 AI 公司开始做自己的抗肿瘤或自身免疫管线，药企客户在上传其最机密的核心靶点数据时就会心存芥蒂——谁也无法保证这家 AI 公司会不会根据计算结果私自开一条竞争管线。
2. **割裂的研发注意力与资本开销**：推进临床管线需要巨额的临床试验开支、合规团队和漫长的申报审批周期，这会迅速抽干一家轻量级算法团队的精力和算力预算。

Neil Patil 在访谈中指出，Chai 的定位是**“做医药领域中立的软件工厂（Neutral Software Factory）”**。

通过通过严格的企业级数据隔离（Single-tenancy & Data Segmentation），Chai 为每一家合作药企部署独立的专有实例，并结合药企内部专有实验数据进行专属定制微调。药企享有生成的全部下游药物分子知识产权，而 Chai 则专注于将平台性能推向极致。

这种彻底的利益对齐，让 Chai 能够同时为原本处于直接竞争关系的制药巨头们（如礼来与诺华）赋能。更重要的是，通过深入一线与顶尖药企科学家高频协作，Chai 团队能够持续吸纳全行业最真实的湿实验反馈与业务痛点，形成一种不需要自建临床就能持续自我进化的正向飞轮。

## 告别 Chatbot 对话框：为什么分子设计需要一套“分子的 Photoshop”？

当前生成式 AI 的主流交互范式几乎被对话框（Chatbot）所统领。但当你在设计一个空间构象极其复杂、由成千上万个原子构成的生物大分子时，对话框会显得极其笨拙与荒谬。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-16-chai-discovery-bioai-phase-shift-img-02-molecular_cad_interaction.png)

科学家不需要对 AI 说“请帮我设计一个能治疗肺癌的蛋白质”，因为这种非结构化的大白话根本无法表达严苛的空间几何关系与物理约束。

Neil Patil 将他们的设计套件形象地比作**“分子的 CAD、Figma 与 Photoshop”**：
- **表位笔刷（Epitope Paint Tool）**：科学家在 3D 视口中直接旋转目标蛋白质晶体，像在 Photoshop 中涂抹蒙版一样，用虚拟笔刷精准标记出希望抗体结合的具体原子簇（Epitope）；
- **内容识别填充（Content-Aware Fill）**：标记完成后，后台扩散模型会在毫秒级时间内围绕该特定几何区域，自动生成在立体结构与化学键力上完美契合的候选抗体 CDR 环与骨架；
- **多维度约束面板（Constraint Dashboard）**：科学家可以直观设置交叉反应（Cross-reactivity，如要求抗体既能结合人类蛋白也能结合食蟹猴蛋白以方便动物实验）与反向特异性筛选（Counter-screening，要求严密避开人体内相似的健康组织蛋白以避免毒性）。

这正是我们在很多工业级软件演进中所见到的规律：正如芯片设计从手工绘制电路图演化为 Cadence/Synopsys 的 EDA 工业软件，机械设计从图板手绘走向 SolidWorks，**分子设计也正在迎来属于自己的声明式 CAD 时代。**

## 0.33 Å 的冷冻电镜震撼：从瀑布流筛选走向敏捷设计闭环

在技术架构上，Chai 的核心突破在于跨越了从“结构预测”到“全原子协同生成（Co-design）”的鸿沟。

早期的 AlphaFold 解决的是“给定一条已知的氨基酸序列，预测它会折叠成什么样的 3D 构象”。这虽然是科学史上的巨大飞跃，但在制药实战中还远远不够——因为药物设计的核心诉求是逆向的：已知靶点的 3D 构象，如何凭空创造出一条全新的抗体序列去精准咬合它？

Chai-2 和新一代的 Chai-3 采用了全原子扩散架构（All-atom Diffusion），在扩散生成的每一步中，让 3D 空间坐标与氨基酸序列 Token 同时迭代演化，如同在物理力场与序列空间中进行高维的期望最大化（EM）协同收敛。

在模型验证过程中，发生过一个让整个团队难以忘怀的真实轶事：
Chai 将模型全新生成的抗体分子送往第三方湿实验平台进行冷冻电镜（Cryo-EM）结构测定。当实验结果传回时，团队成员在屏幕上把实际测得的真实原子点云与模型最初预测的 3D 结构重叠在一起，发现两条曲线严丝合缝地重叠在了一起——**实验测定与模型预测的坐标误差仅为 0.33 埃（Å），相当于不到三分之一个原子的直径。**

甚至有研究员第一反应是：“实验平台是不是搞错了，直接把我们提交的 PDB 模型文件当成测定结果发回来了？”

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-16-chai-discovery-bioai-phase-shift-img-03-watershed_loop_vs_waterfall.png)

这种超高精度的原子级确定性，正在彻底重构制药研发的组织流程：
传统的药物发现是一个极其沉重的“瀑布模型”（Waterfall）：从靶点确认、苗头化合物筛选、先导物优化到成药性改造，每个阶段之间都有长达数月乃至数年的物理门禁；
而现在，当首轮生成的分子就具备高亲和力与良好的成药性（热稳定性、低自聚集、高表达量）时，研发流程开始变得如同现代软件工程一样敏捷——**变成了一个高度迭代、快速试错、按周演进的敏捷设计闭环（Agile Loop）。**

正如我们在之前的文章[《Loop Engineering：Agent 真正的战场不是 prompt，而是回路》](https://ntlx.github.io/articles/loop-engineering-agent-loops)中所探讨的：**一切复杂系统工程的质变，永远发生在单次执行的确定性跨越了阈值、从而让长程反馈回路能够高效跑通的那一刻。**

## 单个 Token 价值上千亿：生物 AI 的算力错配与终极商业重构

在访谈的后半段，Matt 和 Neil 探讨了一个极具冲击力的经济学视角：**如果按 Token 的经济终值来计算，生物领域的 Token 价值可能是全人类所有行业中最高的。**

在大语言模型（LLM）的世界里，生成一百万个文本 Token 的商业价值可能只有几美元；但在生物分子领域，由蛋白质模型生成的区区几百个氨基酸 Token，下游对应的可能是一个年销售额数百亿美元、生命周期总价值突破千亿美元的重磅药物资产。

以近年风靡全球的 GLP-1 减肥降糖药为例，仅两款主流 GLP-1 药物的年销售收入，就超过了全球所有大模型研发实验室的年总收入之和。

但与这种巨大的经济价值形成鲜明讽刺的，是当前底层硬件与算力生态的严重错配：
全球顶级的 GPU 架构（如 NVIDIA B300 等）几乎全盘向大语言模型倾斜（“LLM-pilled”），为庞大的 KV Cache 和文本自注意力机制做了极致优化；而生物分子模型重度依赖处理 3D 几何与空间关系的三角注意力机制（Triangle Attention），在现有的硬件调度和底层编译栈上往往遭遇严重的显存与通信瓶颈（正如我们在[《“模型能跑”不等于“支持生产”：听完 Baseten 聊推理工程，我重新理解了大模型部署》](https://ntlx.github.io/articles/inference-engineering-masterclass-baseten)中所分析的系统工程挑战）。

在长达半个多世纪的时间里，制药行业始终被**埃隆定律（Eroom's Law）**的阴影所笼罩——新药研发的成本大约每 9 年就会翻一番，平均每款新药的综合耗资已攀升至 26 亿美元以上，边际回报率眼看就要跌入负数区间。

药企本质上是一群承受着极高风险的“资本配置者（Portfolio Allocators）”。过去他们之所以不得不以巨大的代价在低效的湿实验中撒网，是因为他们缺乏一柄足够精准的手术刀。

从 AlphaFold 揭开蛋白质结构的神秘面纱，到 Chai Discovery 用 De Novo 设计软件打通全原子工程闭环，BioAI 正在向整个医药工业证明：**当生命分子的底层规律被转化为可计算、可约束、可交互的精密代码时，人类攻克疾病的效率曲线，终于迎来了被彻底重塑的曙光。**

*{当蛋白质设计与小分子药物跨过“信任阈值”，你认为 AI 走向物理世界工程最大的下一个卡点会是算力、数据还是湿实验反馈？欢迎在评论区分享你的思考。}*

## 参考资料

- [🔬The BioAI Phase Shift - Matthew McPartlon & Neil Patil, Chai Discovery](https://www.latent.space/p/chai-discovery?showTranscript=true)
- [They Thought the Model Was Broken — YouTube Full Podcast](https://www.youtube.com/watch?v=Qp5xklyJySI)
- [Chai Discovery Official Website](https://www.chaidiscovery.com)
- [Eroom's Law — Wikipedia](https://en.wikipedia.org/wiki/Eroom%27s_law)
- [Chai Discovery $400M Series C & Pharma Partnerships — Forbes](https://www.forbes.com)

## 延伸阅读

- [Loop Engineering：Agent 真正的战场不是 prompt，而是回路](https://ntlx.github.io/articles/loop-engineering-agent-loops)
- [“模型能跑”不等于“支持生产”：听完 Baseten 聊推理工程，我重新理解了大模型部署](https://ntlx.github.io/articles/inference-engineering-masterclass-baseten)
- [从 Token 流到 Agent 流：LLM 应用正在经历它自己的“协程革命”](https://ntlx.github.io/articles/token-streams-agent-streams-llm-concurrency-revolution)
- [当 AI 时代涌入无数 Issue：Astro 如何用“软件工厂”把 5 年积压清到零？](https://ntlx.github.io/articles/cloudflare-astro-issue-triage-software-factory)
