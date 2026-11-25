---
$schema: starlight
title: 同一批想法问两遍，AI 审稿人给出了相反判决
description: Ai2 用 ICLR 2026 评审数据测试六个大模型的新颖性判断：只换一句提问，GPT-5.4 准确率从 93.5% 跌到 40.9%。我认为这篇论文最硬的贡献，是把评审可靠性变成不需要标签也能做的自洽性测试。
date: 2026-11-25
category: ai-models
primarySourceUrls: ["https://allenai.org/blog/novelty-bench"]
---

把同一批 154 对科研想法摆在 GPT-5.4 面前，问两遍。第一遍告诉它：审稿人认定每对里恰有一个想法是新颖的，找出是哪一个。它答对了 93.5%。第二遍只问：哪个想法新颖？准确率掉到 40.9%，比抛硬币还差，超过一半的想法对换了答案。同一个模型，同一批想法，两句问法之间只改了几个词。

这是 Ai2 在 10 月 27 日[博客](https://allenai.org/blog/novelty-bench)里公布的实验，配套论文叫[《Old Ideas, Novel Problems》](https://arxiv.org/abs/2610.02022)。我读完博客，又把论文正文、[代码仓库](https://github.com/allenai/novelty-eval)和[数据集](https://huggingface.co/datasets/allenai/novelty-judge-bench)翻了一遍。「LLM 评审不靠谱」这个结论本身不新鲜，新鲜的是它证明不靠谱的方式：有几条核心证据，根本不需要知道正确答案。

![文章核心信息图：同一批 154 对想法，两种问法给出 93.5% 与 40.9%，换数据分布差异从 7 点拉到 52.6 点，加钱没换来判断力](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-25-novelty-bench-img-00-infographic-core-summary.png)

## 先把这场考试说清楚

要测「AI 能不能判断一个想法新不新」，先得有一批 novelty 有可靠证据的想法。Ai2 没有用「论文被录用 = 新颖」这种粗代理——录用可能靠实验扎实，拒稿也可能只是写得差——而是去挖 ICLR 2026 评审原文里明确讨论原创性的段落。多数审稿人肯定新颖且无人质疑、录用、评分在所在领域前 10% 的论文，摘要进高新颖池，共 154 条；反向标准筛出 145 条低新颖想法。挖掘质量抽检过：50 例里 47 例标注员同意抽取的新颖性极性，3 例分歧都不影响计数。

![Ai2 论文 Figure 2：从 OpenReview 评审挖掘新颖性标签、构建两套数据的管线（来源：allenai/novelty-eval 官方图）](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-25-novelty-bench-img-source-data-pipeline.png)

但真实场景里评审员要评的不是人类论文，是 AI 生成的想法。于是第二套数据把同一批 154 个人类想法，对上 154 个由 Claude Sonnet 4.5 生成的想法。生成器只拿到研究领域和一句「提出一个新颖想法」，没有文献检索、没有工具、没有迭代反馈——论文特意选了这个发布已一年多的非前沿模型，让「生成侧不如人类侧新颖」成为一个尽量保守的假设。注意这是弱标签：不是逐条验证过的判决。作者请一位计算机科学教授盲评了 30 对，其中 28 对是最强评审模型判错的案例，花了约 5 小时，30 对全部偏向人类想法。他们又把两侧想法重写成统一格式重测，检验评审员是否只是在反应文风差异。

六个评审模型——GPT-5.1、GPT-5.2、GPT-5.4、Claude Sonnet 4.5、Opus 4.5、Opus 4.6——在这两套数据上接受受控测试：每次只改一个设计变量，prompt 措辞、推理预算、给不给检索文献、想法格式、投票次数、生成器来源。

![Ai2 论文 Figure 3：受控研究设计，两种判定格式 × 六个评估维度 × 六个评审模型（来源：allenai/novelty-eval 官方图）](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-25-novelty-bench-img-source-controlled-study.png)

## 93.5% 里有多少是提示喂出来的

先看那两句问法到底差在哪。第一句「审稿人认定恰有一个新颖」给了模型两样东西：强制二选一的结构，以及「答案一定存在」的先验。模型不用自己校准「什么算新颖」，只需要在两个候选里挑出更像审稿人会夸的那个。第二句把这些全撤了，模型得自己回答一个开放问题：这俩想法，到底有没有新的？

![Ai2 论文 Figure 1 媒体版：三种 prompt 措辞原文与 GPT-5.4、Opus 4.6 在两套数据上的准确率（来源：allenai/novelty-eval 官方图）](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-25-novelty-bench-img-source-prompt-variants.png)

所以我的读法是：93.5% 这个好看分数，相当一部分是评测设计自己制造的。它测的是「带提示的选择题」，而真实回路里评审员面对的是开放判断。论文自己也承认这几句 prompt 语义不完全等价，落差不能全读成「模型能力崩塌」。这个承认很重要，它让结论更可信，而不是更弱。

因为真正硬的证据在下一层：52.6 个百分点的落差，意味着两句问法在至少 52.6% 的想法对上给出了不同判决。无论哪句问法是对的，另一句必错——这个论证不需要任何标签。你不必相信「生成想法一律不如人类」的弱标签假设，也不必同意我对答案泄漏的解读，就能接受「这个评审员不可靠」。博客里那句话我很认同：两个合理配置对同一对想法给出相反答案，分歧本身就暴露了不稳定。

而且这不是 GPT-5.4 一家的毛病。对比图里六个模型从「审稿人框架」换到开放问法后全部下滑，最温和的 GPT-5.2 也从 81.8% 掉到 76.0%，Opus 4.6 从满分掉到 72.7%。换个模型不能免疫，只是幅度不同。

![Ai2 博客原图：六个模型在「审稿人认定哪个新颖」与「哪个新颖」两种问法下选中人类想法的比例，154 对想法（来源：Ai2 博客）](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-25-novelty-bench-img-source-prompt-wording-chart.png)

## 在人类论文上验证过的尺子，量不了 AI 的想法

同一个 prompt 改动，在纯人类数据上对 GPT-5.4 只移动约 7 个百分点，在含生成想法的数据上移动 52.6 个百分点。人类数据也不是免疫区：同一改动让 Opus 4.6 在纯人类数据上移动了 21 点，只是比生成数据上的震幅小。这就是这篇论文指出的系统性缺口：评审员通常在人类论文上验证，实际却被拿去评生成想法——验证分布和使用分布不是同一个分布。

生成数据上还有两个细节值得记住。一是打平率：强如 Opus 4.6，某些配置下 35% 的想法对判不出高下，Sonnet 4.5 超过一半；Opus 4.5 和 Sonnet 4.5 在生成数据上的打平率约为人类数据的两倍。评审员不是判错，是判不动。二是去掉「不要把琐碎、增量贡献当新颖」这句警告后，所有评审模型在生成数据上都变差，在人类数据上却基本无感。论文推测这说明 LLM 生成的想法更偏增量式。我倾向同意，顺着这个推测想：开放问法下评审员集体失准，面对的是一堆「看起来都挺像那么回事」的组合式想法，阈值稍微一松就全放行了。

把两侧想法统一重写成「目的 / 机制」两段式之后，不稳定没有消失，反而更大，某些改动翻转了超过三分之二的判决。文风不是遮羞布，问题在判断本身。

读到这里我想起自己[之前写 Similarweb 评测实践](https://ntlx.github.io/articles/similarweb-agent-eval-langsmith)时的结论：评测 Agent 最危险的时刻，是拿未校准的尺子跟正确的修改打架。那篇讲的是尺子会拮抗真实改进，这篇把问题又推前了一步——尺子出厂前就没校准过，而且换个握法刻度就变。

## 检索、推理、加钱，三条路都没走通

直觉上，判断新颖性应该靠多读文献、多想一会儿。实验把这两条直觉按住了。给评审员喂 5 篇预检索的相关论文摘要，改善有限且只对部分模型成立；把推理预算从 high 降到 low，损失很小，有的模型反而更好。

更扎心的是检索会反噬。论文检查了检索把正确判决翻成错误的案例：一个组合两个概念的想法，不给文献时评审员和审稿人一致判它新颖；给了分别做过这两个概念的论文后，评审员斥之为「现有成分的直接组合」。反过来也成立：不给文献时模型正确识破一个「已知组件的宽泛拼装」，给了文献反而说它相对这些工作显得新颖。我的解读是：检索把新颖性判断退化成了对检索集的覆盖检查——A 做过、B 做过，所以 A+B 平凡。可组合方式本身往往正是贡献。这对所有「检索增强评审」管线都是警示，包括那些把检索写进 prompt 强制要求「相对给定文献评估」的设计。

![检索反噬：不给文献时判为新颖，给了文献就压平成「直接组合」](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-25-novelty-bench-img-01-comparison-retrieval-backfire.png)

那换更强的呢？GPT-5.6 Sol 开最高推理预算、配限定 arXiv 的实时迭代搜索、搜索次数不设上限，macro-F1 只有 0.78，比只看 5 篇摘要的 Opus 4.6（0.89）低 11 点，每次判决成本约 10 倍。专用系统也一样：Human+Generated 上，一个简单的 Opus 4.6 prompt 加 low reasoning、3 次调用多数投票，0.854 macro-F1，跑完整个评测集花 2.59 美元；文献检索加重排的 Idea Novelty Checker 0.642，花 30.66 美元；Sakana AI Scientist 那套迭代搜 Semantic Scholar 的评估器 0.772，花 82.05 美元。最便宜的配置比最贵的便宜约 32 倍，宏 F1 对 Idea Novelty Checker 和 AI Scientist 分别高出 21.2 和 8.2 个点。

![成本与准确率：最便宜的简单基线同时更准、更便宜](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-25-novelty-bench-img-02-infographic-cost-vs-accuracy.png)

加机器没有换来判断力。这句话我在[提示词优化那篇](https://ntlx.github.io/articles/prompts-arent-real-eval-flywheel)里从另一个方向说过：优化器能改写提示词，却不能替团队决定哪些行为算好。这篇论文补上了后半句——连「算不算好」的裁判本身，都还没通过考试。

## 带走一把不需要标签的尺子

如果只从这篇论文带走一件事，我带走的不是「别信 LLM 评审」，而是一个任何团队今天就能做的测试：把你回路里的评审员对同一批输入问两遍，只换问法、换呈现顺序、换推理预算，看判决翻多少。不需要 ground truth，不需要专家标注，翻转率直接给出「至少有多少判决不可信」的下界。论文里连「两个 AI 生成器谁的想法更新颖」这种完全没有人类标签的对比，都有约四分之一到三分之一的判决随 prompt 改变——这类比较正是自动 ideation 论文里最常见的报告形式。

由此我给自己定了三问，以后读到任何「AI 生成的想法更新颖」的宣称先过一遍：评审员的 prompt 告诉过它什么（有没有把答案结构喂进去）？评审员在什么分布上验证过（人类论文还是生成想法）？换个问法判决还稳不稳？三问都答不上来的新颖性提升，先打折再看。

![不需要答案标签的自洽性测试流程与三问](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-25-novelty-bench-img-03-flowchart-label-free-self-check.png)

这对把评审员接进训练回路的做法尤其要紧。我[读 Hugging Face 水彩训练复现](https://ntlx.github.io/articles/train-to-paint-with-code)时关注过 pairwise judge 当 reward 的可靠性；如果评审员换个问法就翻供，那被优化的就不是新颖性，而是评审员在当前措辞下的偏好。自动科研的回路里，生成器在进步，评审员也在被当作进步的证据——这条证据链得先有人去摇一摇。

Ai2 这篇论文没有给出可靠的新颖性评审方法，它给的是让不可靠变得可测量的工具：开源的基准、可复跑的评审挖掘管线，和那套不需要标签的不稳定性论证。我觉得这是比「又一个 benchmark 分数」更值得发布的贡献。下次再看到 AI 审稿人给出漂亮分数，我会先问一句：同一批想法，你问了两遍吗？

## 参考资料

- [Ai2 博客：Can we trust LLMs to judge whether a research idea is novel?](https://allenai.org/blog/novelty-bench)
- [论文：Old Ideas, Novel Problems: The Instability of LLM-Based Novelty Evaluation（arXiv 2610.02022）](https://arxiv.org/abs/2610.02022)
- [代码仓库：allenai/novelty-eval](https://github.com/allenai/novelty-eval)
- [数据集：allenai/novelty-judge-bench](https://huggingface.co/datasets/allenai/novelty-judge-bench)
- [评测 Agent 最危险的时刻，是拿未校准的尺子跟正确的修改打架](https://ntlx.github.io/articles/similarweb-agent-eval-langsmith)
- [提示词交给优化器后，谁来定义“好”？](https://ntlx.github.io/articles/prompts-arent-real-eval-flywheel)
- [谁决定什么叫好看？读 Hugging Face 的 Train to Paint with Code](https://ntlx.github.io/articles/train-to-paint-with-code)