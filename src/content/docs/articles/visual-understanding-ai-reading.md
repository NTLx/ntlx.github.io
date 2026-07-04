---
$schema: starlight
title: AI 重新学会用眼睛读字
description: 视觉不只是多模态装饰，它让符号重新获得位置、版面和注意力；AI 正在用工程方式重新发现阅读。
date: 2026-07-04
category: ai-models
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-04-visual-understanding-ai-reading-img-00-infographic-core-summary.png)

我看完 [pxpipe](https://github.com/teamchong/pxpipe) 这个仓库后，脑子里先冒出来的是一个很怪的画面：为了让语言模型更便宜地读文字，工程师把文字重新变回了图片。

这件事乍看像钻价格规则的空子。图片 token 的成本主要跟像素尺寸有关，不跟里面塞了多少字符线性相关。那就把 Claude Code 里又长又密的 system prompt、工具说明、历史输出、JSON、日志、代码片段渲染成 PNG，让模型用视觉通道读。README 里给出的口径很直接：真实 Claude Code 流量里，密集内容大约能做到每个 image-token 承载 3.1 个字符，而文本大约是 1 个字符/token；在 Fable 价格口径下，端到端账单下降约 59%-70%。

但如果只把它读成“便宜”，就读浅了。

我之前在[《Anthropic 这篇 context engineering 文章，真正把 prompt 赶下了主桌》](https://ntlx.github.io/articles/anthropic-context-engineering-prompt-retreat)里写过一句判断：Agent 的主战场，开始变成“此刻该让模型看见什么”。pxpipe 把这个问题又往前推了一步。它继续追问：**用什么形态看见。**

同一段上下文，可以作为一维 token 序列进入模型，也可以作为二维视觉对象进入模型。前者精确、可复制、可执行；后者便宜、密集、保留布局和结构，但会损失局部字节级保真。这个分叉很小，却把一个更大的问题露了出来：我们一直把“文本”当成语言模型天然的输入，其实文本在人类那里从来不是直接进入大脑的。

人类读字，是先看见字。

## 工程悖论：AI 为了读文字，先把文字变回图片

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-04-visual-understanding-ai-reading-img-01-engineering_paradox_text_to_image.png)

pxpipe 的工程设计很克制。它不是把所有东西都图像化，而是只动那些又大、又旧、又密、又不适合继续占文本上下文的输入块：大型 `tool_result`、旧历史、静态 system prompt 和 tool docs。用户当前消息、最近几轮对话、模型输出、稀疏 prose、太小的块，都保持原样。

这个取舍说明作者并不相信“图片天然优于文本”。它相信的是另一件事：上下文应该分层。

最近的、正在执行的、需要逐字复核的信息，留在文本里。旧的、密集的、更多承担背景和结构记忆的信息，可以进图片。需要精确值时，再用旁路把它取回来。这更像操作系统里的冷热分层，不像传统意义上的压缩算法。

pxpipe 仓库里最诚实的部分，也正是这里。README 明确写出它是有损的：密集图片里的 12 字符 hex 精确召回，Fable 5 是 13/15，Opus 是 0/15。更麻烦的是，错读常常不是模型说“我看不清”，而是给出一个自信但错误的字符串。Legibility audit 又进一步把问题量化：即便使用清晰的 5×8 字体，精确字符串 blind read 也只有 15/24，约 63%。

这不是小瑕疵。这是视觉通道的边界。

图片擅长承载结构、密度、整体形状、邻近关系、上下文气味；它不擅长单独承担字节级真值。哈希、ID、金额、密钥、精确代码标识符，这些东西不能只靠视觉记忆。pxpipe 后来的 factsheet、页面尺寸 clamp、re-fetch/rehydrate 设想，本质上都是在承认这件事：**视觉可以记住场景，但不能独自作证。**

我觉得这是这类工程最有价值的地方。它没有宣称“图像化上下文解决一切”。它画的是一条清楚边界：什么该让模型看，什么该让模型读，什么必须让模型重新取原文。

这个边界一旦立住，pxpipe 就不再是一个 token 省钱技巧，而是一种上下文架构。它把“长上下文”从一条越来越长的绳子，改成了一个有冷热、有真值、有模糊记忆、有恢复路径的系统。

## 视觉压缩不是魔法，它是一种记忆形态

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-04-visual-understanding-ai-reading-img-02-memory_fidelity_tradeoff.png)

pxpipe 的 FINDINGS 里有一个判断，我觉得比 README 里的省钱数字更重要：比较基线应该从“完美逐字回忆”，换成 `/compact`。

这句话很关键。现在很多长任务 Agent 快要撞上下文窗口时，会做 compaction：把旧对话、工具输出、阶段结论总结成一段文字，再继续跑。这个过程看起来保真，因为它输出的是文字；但它其实已经丢掉了大量原始内容。你得到的是一段摘要，不是历史本身。

pxpipe 的损失面刚好反过来。它不把旧历史总结掉，而是把旧历史留在像素里。内容还在，字形还在，结构还在，行列还在；只是模型读它时会出现视觉识别误差。

一个是丢内容，保文字保真。一个是保内容，丢局部识别保真。两者都不是无损。

这让我重新理解“记忆”这件事。人类记忆也不是硬盘。我们常常记得一页书的大概位置、一个公式在黑板左下角、某段话出现在邮件中间、表格有三列但不记得第三列具体数字。需要精确时，我们会翻回原文。视觉记忆给我们的是索引、结构和场景，不是所有字节。

AI 的上下文系统以前太像一块线性内存：所有东西都被摊平，塞进同一个 token 序列。token 是统一货币，越长越贵，越多越乱。pxpipe 的启发是，模型不必把所有信息都以同一种货币保存。旧上下文可以像人类脑中的页面印象一样存在：可浏览、可定位、可大概理解，但不直接当作真值源。

这也解释了为什么 pxpipe 在 gist 层表现好，在 exact 层表现危险。FINDINGS 里的 gist-recall A/B 显示，在 Fable 5 上，文本历史和图片历史都是 98/98，未陈述事实的 confabulation guard 也是 0。也就是说，决策、路径、数值、名字、状态这些“工作记忆层”的东西能保存下来。可一旦你要求它抄一个 12 字符 hex，风险就来了。

工程上最容易犯的错，是把这两层混在一起。

如果你把视觉压缩当成真值数据库，它会害你。如果你把它当成旧上下文的场景记忆，再配上文本 factsheet 和 re-fetch 工具，它就开始合理。这个判断对所有多模态上下文系统都适用：图像不是 source of truth，图像是 compressed perception。

## DeepSeek-OCR：OCR 不再只是把图转成字

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-04-visual-understanding-ai-reading-img-03-optical_context_compression.png)

pxpipe 是工程侧先跑起来的版本。[DeepSeek-OCR](https://github.com/deepseek-ai/DeepSeek-OCR) 则把同一个直觉推到了模型侧。它的论文标题很直白：[DeepSeek-OCR: Contexts Optical Compression](https://arxiv.org/abs/2510.18234)。OCR 在这里已经超出“识别图片里的文字”，变成了“用二维光学映射压缩长上下文”的实验场。

这个转向很重要。传统 OCR 的默认方向是：图片里有字，把它还原成文本。DeepSeek-OCR 的问题更像是：文本太长，能不能先把它变成图片，再用视觉 token 读回来？

论文里给出的数字很醒目：当 text tokens 与 vision tokens 的压缩比低于 10x，OCR precision 约 97%；到 20x 压缩时，accuracy 仍有约 60%。不要把这个数字读成“20 倍压缩也够用”。我读到的是另一件事：压缩比本身开始变成一个可调的遗忘旋钮。低压缩比保真，高压缩比保大意。你可以决定历史记忆要清楚到什么程度。

DeepSeek-OCR 的架构也在服务这个目标。它用 DeepEncoder 把高分辨率输入压成可管理数量的 vision tokens。例如 1024×1024 输入先产生 4096 个 patch tokens，再压到 256 个 tokens 进入后续阶段；解码器则是 DeepSeek3B-MoE-A570M。模型卡和论文还列出 Tiny、Small、Base、Large、Gundam 等多种分辨率/vision token 配置，本质上就是在不同成本和保真之间移动。

这和 pxpipe 的关系很清楚。pxpipe 用现有 VLM 的视觉阅读能力，从外部改写请求。DeepSeek-OCR 则直接训练一个系统，让视觉压缩成为模型能力的一部分。

两者都把“文本上下文”从一维 token 流里拎了出来。

我觉得 DeepSeek-OCR 真正提出的问题是：如果上下文可以被渲染、压缩、重读，那长上下文还一定要靠更长的 attention window 来解决吗？也许一部分历史根本不该继续以原始 token 形态常驻。它可以变成页面、图层、缩略图、结构化快照。需要时先视觉浏览，再精准取回。

这听起来像绕路，但人类阅读一直是这样。我们不会把一本书逐字塞进工作记忆。我们会记页码、章节、版式、划线、图表位置、某段话的大概形状。要引用时再回去翻。

DeepSeek-OCR 把这个旧经验变成了模型工程问题。

## DeepSeek-OCR2：关键在阅读路径

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-04-visual-understanding-ai-reading-img-04-visual_causal_flow_reading_path.png)

如果 DeepSeek-OCR 证明“文本可以作为图片压缩”，那 [DeepSeek-OCR2](https://github.com/deepseek-ai/DeepSeek-OCR-2) 更进一步：它开始追问视觉 token 的阅读顺序。

论文 [DeepSeek-OCR 2: Visual Causal Flow](https://arxiv.org/abs/2601.20552) 批评了一个很常见但容易被忽略的默认做法：很多 VLM 把视觉 token 按固定 raster-scan 顺序送进 LLM，也就是从左上到右下扫一遍。这个顺序对机器方便，但对阅读未必合理。

人类看一页文档时，不是机械扫像素。我们先看标题，跳到表格，看粗体，扫左栏，再回到正文。读合同、读论文、读代码 diff、读 UI 截图，每一种材料都有自己的注意力路径。阅读当然要看到视觉 token，也要知道下一眼该落在哪里。

OCR2 的 Visual Causal Flow 就在试这个方向。它用 LLM-style 结构替换原先 encoder 中的 CLIP 部分，让视觉 tokens 和 learnable query tokens 形成一种因果阅读流。视觉 tokens 可以双向互看，causal flow tokens 则根据语义逐步读取视觉信息，最后只把这些重新组织过的表示送入 decoder。

这听起来像架构细节，其实是在改一个基本假设：视觉输入不是一块要被压扁的像素地毯，而是一组需要被阅读的对象。模型应该先形成阅读顺序，再把信息交给语言推理。

论文报告的结果也支持这个方向。OmniDocBench v1.5 上，DeepSeek-OCR2 Overall 为 91.09，高于 DeepSeek-OCR 的 87.36；Reading-order edit 从 0.085 降到 0.057。这个提升不只是“字认得更准”，还包括“顺序读得更对”。

这里正好接上人类阅读。眼动研究很早就告诉我们，阅读不是匀速线性输入。Rayner 2009 的综述里，熟练读者平均 fixation 约 200-250ms，平均 saccade 约 7-9 个字母空间，会跳过约 25%-30% 的词，也会有 10%-15% 的回视。我们不是一格一格吞字符，而是在预测、跳读、回看、确认。

OCR2 最有用的地方，不是“像人眼”这个比喻有多漂亮。它在工程上承认了一件事：顺序本身是理解的一部分。阅读路径不是输入的附属品，而是模型要学的能力。

这对 AI 很要紧。因为很多复杂信息的语义不在单个 token 里，而在空间关系和阅读路径里。表格的行列，代码 diff 的加减号，论文图表的 caption，网页按钮和说明文字的邻近关系，流程图箭头的方向，这些东西一旦被线性化，模型就要花更多推理把它们猜回来。

视觉理解的价值，正是在这里。它让模型少猜一点。

## 人类获取文本，本来就是视觉理解

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-04-visual-understanding-ai-reading-img-05-human_reading_visual_recycling.png)

不过这里要加一个限制。说 LLM 是对大脑的模拟，只能当功能类比，不能当解剖等同。LLM 不需要真的长出视觉词形区，才会遇到类似的问题：外部符号如何进入内部状态，如何被压缩，如何被注意力选择，如何在需要时恢复精确细节。

认知科学给了一个很好的支点。Dehaene 和 Cohen 提出的 neural recycling 假说认为，阅读和算术这类文化发明太新，不可能为它们演化出全新脑区；它们会侵入并重用更古老的神经回路。PLOS Biology 2018 的纵向研究追踪 10 名 6 岁儿童，在入学前后多次扫描，发现随着阅读能力发展，VWFA 位置逐渐出现对文字和数字更专门的响应。

这说明阅读不是纯语言能力，它首先是视觉系统被文化重新训练的结果。文字之所以能被读，是因为它被设计成能被眼睛和视觉皮层接住的形状。字母、汉字、标点、段落、缩进、表格、标题层级，都是给视觉系统用的界面。

所以我越来越觉得，把“文本理解”和“视觉理解”切得太开，可能只是当前工程分工带来的错觉。文本当然有抽象语言层，但它在真实世界里的入口经常是视觉层。尤其是现代 AI 处理的文本，已经很少是纯段落：网页、PDF、IDE、终端、日志、Markdown、notebook、UI 截图、表格、合同、PPT。它们的语义往往写在空间里。

一维 token 化当然有巨大价值。它让语言模型训练可规模化，让生成可控，让代码和自然语言能进入同一套序列机制。但它也删掉了很多东西：位置、版面、相邻关系、视觉显著性、跳读路径、记忆锚点。

过去我们用更长上下文、更强 attention、更复杂 prompt 去弥补这些损失。现在 pxpipe、DeepSeek-OCR、OCR2 这些实践提醒我们：也许有些信息不该被删掉后再猜回来。它一开始就应该作为视觉对象进入模型。

## 未来的上下文系统，会像分层记忆

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-04-visual-understanding-ai-reading-img-06-context_memory_hierarchy_truth_channels.png)

把这些线索放在一起，我会得到一个比较硬的工程判断：未来 AI 系统的上下文，不会只是更长的 token 窗口，而会越来越像分层记忆系统。

第一层是文本真值层。代码、ID、路径、金额、哈希、命令、配置、法律条款，这些必须能被复制、比对、执行。这里不能靠“看起来像”。文本仍然是 source of truth。

第二层是视觉结构层。旧历史、长日志、文档页面、表格、UI 状态、复杂版面，可以用视觉形态保存。它的目标不是逐字抄写，而是保留场景、结构、密度和导航线索。

第三层是布局语义层。模型不只要看图片，还要知道标题和正文是什么关系，caption 指向哪张图，表格单元格属于哪一列，diff 的红绿行如何组成变更。这是文档理解模型一直在做的事，也是 OCR2 这类工作继续推进的方向。

第四层是恢复工具层。凡是视觉层不该承担的精确值，都要能通过工具重新拿到原文。pxpipe 说的 factsheet 和 rehydrate，本质就是这层。没有恢复工具，视觉压缩迟早会变成自信错读。

第五层是主动阅读层。模型不能只被动接收上下文，而要学会决定下一眼看哪里、什么时候跳过、什么时候回看、什么时候停止读取并请求原文。这个能力会把视觉理解和 Agent 行为接起来。

这也和我之前在 [Not the Model, You're the Harness](https://ntlx.github.io/articles/not-the-model-youre-the-harness) 那篇里读到的判断能合上：模型能力和 harness 设计不能拆开看。视觉上下文也一样。单个 VLM 再强，如果外层系统没有真值旁路、恢复工具、缓存策略、分层记忆，它就会被逼着把所有问题都当成“看图回答”。那一定会出错。

反过来，如果 harness 设计得好，视觉理解就不是一个孤立模型能力，而会成为上下文工程的一层。它负责把符号重新放回空间里，负责让模型在高密度信息里先看见结构，再按需回到文本。

这比“多模态模型能看图片了”要重要得多。

## 视觉是符号进入智能的入口

我最后想把问题收回到最开始那个悖论：AI 为了读更多文字，把文字变回图片。

这不是倒退。它可能是在纠正一个过度抽象。

LLM 的伟大之处，是把语言、代码、知识、推理都压进了 token 序列。这个抽象极其成功，所以我们容易忘记它只是抽象，不是世界本身。世界里的文本不是漂浮的 token。它在屏幕上、纸上、表格里、按钮旁、代码块中、注释下、目录树里。它有位置，有形状，有远近，有层级，有视觉噪声，也有视觉捷径。

人类阅读靠视觉系统接住这些东西，再把它们交给语言系统。AI 过去跳过了这一步，直接吃 token。现在它又开始把一部分文本还给视觉通道。pxpipe 是工程上被成本逼出来的版本，DeepSeek-OCR 是模型上被压缩问题逼出来的版本，OCR2 则开始触碰阅读路径本身。

所以我不太愿意把视觉理解看成“多模态能力列表里的一个功能”。它更像 AI 认知架构里缺过的一层：让符号重新获得位置、版面、注意力和记忆形态。

当然，视觉不会替代文本。真正成熟的系统，不会在“全 token”或“全图片”之间二选一。它会承认不同表示各有边界：文本负责真值，视觉负责结构，工具负责恢复，模型负责在这些层之间调度注意力。

如果说语言模型让 AI 学会了说话，那么下一步很可能不是让它说得更长，而是让它重新学会怎么读。

不是读 token。

是读一页东西。

*你觉得未来的 Agent 上下文应该更像一段长 prompt，还是更像一个带缩略图、索引、原文恢复和工作笔记的记忆系统？*

## 延伸阅读

* [Anthropic 这篇 context engineering 文章，真正把 prompt 赶下了主桌](https://ntlx.github.io/articles/anthropic-context-engineering-prompt-retreat)
* [Not the Model, You're the Harness](https://ntlx.github.io/articles/not-the-model-youre-the-harness)
* [Agentic Workflow 烧掉的钱去哪了？GitHub 用 Agent 优化 Agent 的实战复盘](https://ntlx.github.io/articles/token-efficiency)
* [Agent 没挂，是你的测试挂了](https://ntlx.github.io/articles/validating-agentic-behavior)

## 参考资料

* [teamchong/pxpipe](https://github.com/teamchong/pxpipe)
* [pxpipe README](https://raw.githubusercontent.com/teamchong/pxpipe/main/README.md)
* [pxpipe FINDINGS](https://raw.githubusercontent.com/teamchong/pxpipe/main/FINDINGS.md)
* [pxpipe Imaged-text legibility audit](https://raw.githubusercontent.com/teamchong/pxpipe/main/docs/LEGIBILITY-AUDIT-2026-07-01.md)
* [pxpipe transform info](https://raw.githubusercontent.com/teamchong/pxpipe/main/docs/TRANSFORM_INFO.md)
* [DeepSeek-OCR GitHub](https://github.com/deepseek-ai/DeepSeek-OCR)
* [DeepSeek-OCR: Contexts Optical Compression](https://arxiv.org/abs/2510.18234)
* [DeepSeek-OCR Hugging Face model card](https://huggingface.co/deepseek-ai/DeepSeek-OCR)
* [DeepSeek-OCR 2 GitHub](https://github.com/deepseek-ai/DeepSeek-OCR-2)
* [DeepSeek-OCR 2: Visual Causal Flow](https://arxiv.org/abs/2601.20552)
* [The emergence of the visual word form](https://pmc.ncbi.nlm.nih.gov/articles/PMC5856411/)
* [Cultural recycling of cortical maps](https://pubmed.ncbi.nlm.nih.gov/17964253/)
* [Eye movements and attention in reading, scene perception, and visual search](https://pmc.ncbi.nlm.nih.gov/articles/PMC2906818/)
* [Visually rich document content understanding: a survey](https://link.springer.com/article/10.1007/s10462-025-11477-3)
