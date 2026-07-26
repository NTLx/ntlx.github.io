---
$schema: starlight
title: 微软这封开放权重信，我越读越觉得正文不是重点
description: 我把微软领衔、四十九家署名的那封开放权重信逐段读了一遍。讲开放、讲竞争、讲安全的那几段我都略过了，真正卡住我的是中间为蒸馏正名的一小段，和文末那份会自己长个儿的署名名单。这封信没写的，比写了的更值得读。
date: 2026-07-26
category: ai-industry
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-26-open-weights-letter-distillation-ceasefire-img-00-infographic-core-summary.png)

## 我先把那封信的"脸"摆出来

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-26-open-weights-letter-distillation-ceasefire-img-01-openweight_letter_titlecard.png)

我是先看到那张图，才开始读字的。米白的底，黑色的衬线体，标题"Open Weights and American AI Leadership"居中摆着，上下各一道细黑线，四边还带一点故意做旧的噪点。它不像一篇博客，也不像一篇公关稿，它像一份你知道会被存档、被引用、被放进某个听证会附件里的东西。这个"形式"本身，是我读到的第一个线索：有人希望它看起来是一份声明，而不是一个观点。声明是不打算跟你商量的，它只打算被你签字、或者被你反对。

也是因为这个，我没法在看到 Microsoft 领衔之后就轻松地往下读。我脑子里自动响起了 2001 年 Steve Ballmer 的那句话——Linux 是一种"癌症"，会在知识产权的意义上附着到它碰到的一切东西上。然后是 2020 年，同一家公司说"我们当初错了"。然后是 2026 年 7 月 24 日，它的名字排在一封把"开放"写进标题、把"开放"等同于美国领导力的信的最前面。二十五年，整整一个来回。我当然可以在这儿写一句"微软终于想通了"，然后皆大欢喜地往下走；但我读的时候刻意把这句现成的解释按住了。因为我隐约觉得，到了信的末尾，我会发现转过来的也许不是良心，而是棋盘上的一个站位。我先不宣布这个怀疑，我带着它往下读。

## 名单是会动的

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-26-open-weights-letter-distillation-ceasefire-img-02-signatories_wall.png)

多数转述这封信的人，做的是同一件事：把署名数一遍，告诉我们有四十九家，然后引用两句正文。我做了一件他们没做的事——我把名单看了两次。星期五那天的报道，看到的是一份二十五家的名单，而且特意点出三家没签：OpenAI、Google、Anthropic。等我自己两天后去官网把页面抓下来，名单已经长到了大约四十九家，OpenAI 和 Google 不知什么时候补了上去，Anthropic 还是没有。

也就是说，那面 logo 墙，在我和它之间的四十八小时里，移动过。这个移动，才是这封信里诚实的部分；它上面的正文，是体面的部分。Altman 没签，但同一天说他"glad to see"大家的支持——这是一句被精心打磨成不站任何一边的句子。马斯克旗下的公司也没签，他却转发黄仁勋的帖子，留下一句"this has my full support"，在房间外面鼓掌。而黄仁勋本人，把他在 X 上的第一条帖子押在了这封信上，一个平时几乎不发帖的人，一条帖子一千一百万浏览。

我的结论很朴素，朴素到我有点不好意思写，但我还是写：别去数签名的个数，去看哪些名字在动、哪些名字一动不动。我此前在《[开权模型真正打开的是试错路径](https://ntlx.github.io/articles/open-weight-models-changed-ai)》里写过，"开放"这个词指的更像一种流动的方向，而不是一种静止的状态；而在这封信里，那种流动第一次以"人"为单位显了形——谁顺着流走，谁顶着流站，谁站在岸上说"我支持你们流"。名单就是那张流速图。

## 真正干活的不是讲"开放"的那几段，是讲"蒸馏"的那一段

我是一段一段读的。前面几段是一面旗帜：开放权重让更多人用得起，开放权重加剧竞争，开放权重让你不被某一家绑死，开放权重甚至更安全。每一句都是一面旗，旗帜的特点是它不要求任何人做任何具体的事，它只要求你点头。

然后，快到结尾的地方，语气变了，变的方式我第一遍差点没注意。有一段不再布道，开始下指令了："policymakers should be careful not to conflate legitimate model-development techniques with misappropriation"——决策者们要小心，别把正当的模型开发技术和侵占混为一谈；而蒸馏，"using one model's outputs to help train or improve another"，被它写成"a widely used technique"，写成"a long tradition of learning from, building upon, and improving existing technologies"。请把这段读慢一点。整封信里，只有这一段是对着一个监管者、提出一个具体请求的：画线的时候请用手术刀（targeted legal and commercial frameworks），别用推土机（sweeping restrictions）。它上面那些都是气氛，这一段才是诉求。

现在把它和今年二月的事摆在一起看。OpenAI 传阅过一份 memo，说 DeepSeek 蒸馏了它的模型；Anthropic 指控 DeepSeek、Moonshot、MiniMax 对 Claude 发动了"蒸馏攻击"。同一项技术，五个月前还是房间里最大嗓门的两家口中"换了个名字的偷窃"，到了这封信里，就成了"向既有技术学习的悠久传统"。而最让我愣住的一幕在这儿——OpenAI 是署名方。那个对 DeepSeek 提出指控的公司，把自己的名字签在了一份把被指控的技术重新定义成"合法且寻常"的文件上。我不是说指控错了，也不是说信在撒谎；我是说，同一家公司同时握着这两个立场，才是这一整个礼拜里信息量最大的一句话，而这句话不在信的正文里，在信和那份 memo 之间的缝隙里。（我得给自己加个括号，免得我把话说得太满：孤立地看，蒸馏那一段也只是技术常识，是它对撞的关系把它变成了操作条款；而且这些都是指控和 memo，不是法庭——没有人在这儿被一纸诉状噤了声，也正因如此，一封信才能在任何法官到场之前，先把地面重新铺一遍。）

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-26-open-weights-letter-distillation-ceasefire-img-03-distillation_ceasefire_reclassification.png)

## 那么"开放更安全"呢，我得在这儿停一下

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-26-open-weights-letter-distillation-ceasefire-img-04-weights_not_source_code_oneway_door.png)

信里有一句话，我从十几岁开始写代码就听，听得太熟了，所以我想先对它公平一点，再往回推。它说，开放也许是通往安全最重要的路之一；开源软件已经证明，透明胜过隐蔽；让足够多的眼睛盯着模型，漏洞就会被找出来。这句话我信。我是靠这句话活过来的。问题在于，我活过来的那个世界，是用源代码造的，而一个模型的权重，不是源代码。

代码你能读，一万亿个浮点数你读不了。代码你能打补丁——一行写坏了，换掉，下一次构建就是干净的；权重你打不了补丁，你只能重新训练，而一份已经离开你服务器的拷贝，你召不回来，也没法强制它更新。信自己在前一段刚承认了这一点（"once released, the weights are beyond the original developer's control"），转头又在下一段用"开放更安全"，仿佛它刚承认的那件事是个优点。这就是我没法不点破的一处偷换：一个在 1990 年代、在"文本可编辑"这套物理条件下挣来的结论，被原封不动搬进了一个前提已经不成立的介质里，然后被穿得像个关于世界的事实，而不是关于一个旧世界的事实。

而且，因为我正努力不做一个"只在一边看见这套把戏"的人——Anthropic 在做镜像的事。它把相反的那条旧结论（"封闭更安全，放出去的权重收不回"）也穿成了同样硬的事实，Amodei 整套政策姿态都建在这上面。所以诚实的写法是：两边都在把一种解释，穿成事实的衣服；只是信的那一件更老、更熟、更顺手，因此更难被看出是缝上去的。我真心不知道证据最后会倒向哪一边，我也不打算假装这个问题已经被逻辑解决了——它没有，它是个经验问题，是一笔关于真实伤害的账，而那笔账还没记完。

也正是在这儿，Anthropic 的一名研究员 Julian Schrittwieser 第二天把那句又响又安静的话说出了口：既然开放对美国领导力这么要紧，那他可期待着 NVIDIA 把 CUDA 开源、微软把 Windows 和 Office 开源了。这是一记便宜拳，也是一记真拳。NVIDIA 的护城河是一套守了快二十年的专有驱动栈，微软的营收坐在地球上最封闭的软件上。它们在权重这一层布道开放，是因为它们真正守着的东西，住在别处。但是——我发现我得不停地加这个"但是"——hypocrisy 并不在它们家门口就停下。扔这块石头的那位研究员所在的公司，恰恰是同一家在游说华盛顿制裁中国开源模型、收紧芯片出口的公司，也就是在试图拖慢那些最接近追上它的开源对手，好护住它大约九千六百五十亿美元估值里那块溢价。所以那个干净的故事——开放是好的、封闭是虚伪的——一碰到名字就活不下来。两边都不自洽，只是不自洽的方向不一样；我宁愿把两边的不一致都摊在桌上，也不愿挑那个更解气的一边。

## 所以它到底在替谁说话——以及我为什么还是觉得它值得读

那么这封信到底是替谁写的？如果我把体面的读法放下，诚实的读法是：它替那些已经把开放层押下去的公司写的，而它在做的，是每一个利益集团在它的利益能变成规则之前都必须做的那件事——把"我们这四十九家希望蒸馏继续合法、开放权重别被全面限制"，翻译成"开放是美国领导力的根基"。因为前一句读起来像合谋，后一句读起来像国策。我一次又一次想管这叫虚伪，又一次一次停住自己，因为这个翻译的步骤不是腐败，它是政治的物理：一项利益没法给自己立法，它得先穿上一件看起来跟利益无关的原则的外衣；外衣越大（1980 年代的开源起源故事、体制主权、中国威胁），利益就越妥帖地藏进里头。点破这个机制不是犬儒，只是拒绝被那件外衣震住。

但外衣底下挂着一具真实的身体，而那具身体是我笑不出来的部分。中国，按这封信自己默认的前提，已经在它所鼓吹的这件事上领先了——Kimi K3 被叫作眼下最强的开源权重模型，中国开源模型占了 Hugging Face 今年春季下载量的百分之四十一，白宫指控 Moonshot 蒸馏了 Anthropic 的 Fable 5、财政部扬言要制裁，差不多两百家初创在同一周另写了一封信，求白宫别禁中国的开源权重。把这些一起读，信里那句轻声的"keep the frontier plural"、别让限制"drive innovation overseas"，就不再是原则，而是穿着原则外衣的慌张：你要是为了打中国而禁开放权重，你同一刀也砍在美国自己的开源生态上，因为在这条赛道上，中美是焊死的。Amodei 那篇政策长文——它落地时我写过一篇《[树人醒了，但它先画了一张地图](https://ntlx.github.io/articles/ai-exponential-policy-treebeard)》——是这块焊缝另一头最自洽的论证，到今天我也不认为他看错了风险；我只是认为，这个风险不该由他来用监管替所有人管。

所以，不，我不觉得这封信纯洁；而这终于也成了我对"它值不值得我花一个下午"的回答。它值得，恰恰因为它不纯洁。一封纯洁的信，只会把它封面上那篇宣言教给我；这封不纯洁的信，却教会我去读那些缺席者、那些后补者、那段忽然换了嗓子的段落，和那句谁也没敢写下来的话。我进来的时候，以为自己要选一边站，赞成开放，或者反对开放；我走的时候，手里拿到的东西没那么舒服，却更有用——一种感觉：我被递上来的那场争论，"开放对封闭"，从来就不是那场争论；争的从来不是权重能不能下载，而是谁有资格当老师、谁被注定只能当学生，以及学习的那支箭头，被允许朝哪个方向指。而最懂这件事的那群人，把这层意思告诉我的方式，不是他们签了什么，是那份名单在我没盯着的时候，悄悄移动了多少。

*我把我的犹疑都摊在桌面上了，所以也想听听你的：你读这封信的时候，是更信正文里那句"开放即安全"的承诺，还是更信名单上那些始终没动过的名字？又或者，下次再看到一群公司联名"为某个原则发声"，你第一眼看的是签名，还是看谁没签？*

## 参考资料

- [Open Weights and American AI Leadership（微软官网原文）](https://www.microsoft.com/en-us/corporate-responsibility/topics/open-weight/)
- [The Next Web：The AI giants just broke with OpenAI and Anthropic on open weights（首发 25 家、三家缺席）](https://thenextweb.com/news/open-weights-american-ai-leadership-letter-huang-nvidia-openai-absent)
- [OfficeChai：Anthropic 研究员反击 NVIDIA/微软，并质问为何不开源 CUDA 与 Office](https://officechai.com/ai/anthropic-researcher-calls-out-nvidia-microsoft-for-signing-open-ai-letter-asks-them-to-open-source-cuda-and-microsoft-office/)
- [Axios：OpenAI 与 Anthropic 在 7 月 22 日就中国开放模型立场趋同](https://www.axios.com/2026/07/22/openai-anthropic-open-models-trump-china)
- [TechCrunch：中国开源模型占 Hugging Face 春季下载量 41%](https://techcrunch.com/2026/07/14/the-real-ai-race-may-no-longer-be-at-the-frontier-open-models-hugging-face/)
- [The Register：Ballmer 2001 年称 Linux 是"癌症"](https://www.theregister.com/software/2001/06/02/ballmer-linux-is-a-cancer/581119)
- [The Verge：Microsoft 2020 年承认"我们当初错了"](https://www.theverge.com/2020/5/18/21262103/microsoft-open-source-linux-history-wrong-statement)
- [Tom's Hardware：Nvidia 等 25 家署名，OpenAI/Anthropic/Google 缺席（佐证名单后来扩充）](https://www.tomshardware.com/tech-industry/artificial-intelligence/nvidia-and-24-other-companies-sign-open-weights-letter-as-washington-weighs-chinese-ai-model-ban)
- [Microsoft Source：微软与 Mistral 扩大战略合作（2026-07-21）](https://news.microsoft.com/source/2026/07/21/microsoft-and-mistral-expand-strategic-partnership-to-give-enterprises-and-regulated-industries-frontier-ai-they-can-control/)
- [Reuters：OpenAI 指控 DeepSeek 蒸馏其模型（2026-02）](https://www.reuters.com/world/china/openai-accuses-deepseek-distilling-us-models-gain-advantage-bloomberg-news-2026-02-12/)

## 延伸阅读

- [开权模型真正打开的是试错路径](https://ntlx.github.io/articles/open-weight-models-changed-ai)
- [树人醒了，但它先画了一张地图](https://ntlx.github.io/articles/ai-exponential-policy-treebeard)
- [开源 AI 不是一张地图，是一张工单](https://ntlx.github.io/articles/open-source-ai-gap-map)
- [同一天，OpenAI、Runway、Google 都选了 MCP——一个协议的临界点](https://ntlx.github.io/articles/mcp-tipping-point)
- [一个开源人的离线告别](https://ntlx.github.io/articles/ai-offline-boundary)
