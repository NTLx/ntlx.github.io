---
$schema: starlight
title: 证明之外，数学还要交付什么
description: 读 Grant Sanderson 关于“motivated explanation”的文章后，我更赞成把解释视为与证明并行的研究工作：评价它的应是问题来路、关键选择和边界，而不是表面顺滑或一个新分数。
date: 2026-09-21
category: ai-industry
primarySourceUrls: ["https://terrytao.wordpress.com/2026/09/18/if-math-is-more-than-proof-we-need-to-better-celebrate-the-rest-of-it/"]
---

我读到一半时，被原文里一张很简单的图拦住了：一个很大的圆写着“Understanding”，里面嵌着一个小圆写着“Proof”。两条箭头从小圆指向大圆的不同位置，旁边的问题是：学术信用应该怎样移动。

证明当然重要。图里真正值得看的，是它把证明放在理解的内部：过去，一个好证明往往也带来了新问题、新工具、新教材和新的共同语言。如今机器开始能够大量生成证明，这些东西却不再自动跟着证明一起出现。

这篇文章发表在 Terence Tao 的博客上，但正文明确说明它是 Grant Sanderson 的 guest post。Sanderson 的提议很具体：数学界需要更认真地定义并奖励一种 “motivated explanation”。我读完之后赞成这个方向，最在意的却不是文风，而是解释能不能把问题的来路、关键选择和失败路径公开出来，再交给同行检查。

![文章核心信息图：证明、解释与理解](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-21-motivated-explanations-img-00-infographic-core-summary.png)

## 证明给出结论，解释交代来路

证明的力量在于它提供了必要的逻辑担保：如果每一步都成立，结论就不能只是凭感觉。但读者拿到一个证明，仍可能不知道为什么要提出这个定理，为什么定义要这样放，或者最关键的构造究竟从哪里冒出来。

Sanderson 对 motivated explanation 的描述，正是把这些被证明压缩掉的问题重新放回文章里。定义不必一上来就出现，而应当在要解决的困难被建立之后进入词汇；一个不完全正确的想法也可以先登场，只要读者看得见它为什么会出现、又为什么需要被修正。它的目标不是只回答“定理为什么为真”，还要回答“为什么这是值得提出的定理，以及它在周边理论里怎样使用”。

我很喜欢原文给出的一个自我检查句子：这项工作是否让读者感觉“how would you think of that?” 读者不一定真的独立发现了它，但能看出这条路为什么有可能被走出来。

这与“把论文改写得更通俗”不是一回事。通俗化主要改变入口；motivated explanation 要改变的是知识的可追溯性。一个面向专家的解释完全可以保留大量技术细节，只要那些细节不再像从天花板掉下来的零件。

## 好解释应该留下思考的痕迹

Timothy Chow 的《A beginner’s guide to forcing》给这个问题起了一个很有用的名字：open exposition problem。一个数学主题可能已经有正确而完整的证明，却仍然没有被讲到足够透明；理想的状态是，每一步都有动机，学生读完后会觉得自己本来也有机会走到那里。

这个说法把“我读不懂”变成了共同体可以接手的工作。问题不一定只在读者，也可能在材料：它没有告诉读者哪些选择值得注意，哪些岔路被放弃，哪些技术只是为了把证明闭合而暂时搭起的脚手架。

William Thurston 的《On Proof and Progress in Mathematics》则说明，这个问题远早于今天的生成式 AI。他把数学家的任务直接追问成“如何推进人类对数学的理解”，并用自动计算参与的证明说明：人们即使不怀疑定理为真，仍然会要求理解证明。证明负责保证，理解负责让知识能够被人继续使用。

Geometry Center 的《Outside In》是另一个不同媒介的例子。它把球面翻转从一个抽象的存在性结果，组织成有角色、有画面、有声音和逐步推进的叙事。官方脚本甚至把内容拆成一段段可以跟随的场景：先问“把球面翻过来是什么意思”，再处理曲线、转数和具体的翻转方法。它并没有把数学变成装饰，而是替观众保留了一条接近发现过程的路径。

这也是我为什么想复用原文那张图。它并不证明任何数学命题，却准确地承载了文章的争论：如果理解是外层结构，证明是其中一个重要部件，那么评价制度不能只给小圆计分。图片的价值不在于好看，而在于把抽象的制度问题变成了一眼能检查的关系。

![原文配图：Understanding 与 Proof 的关系](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-21-motivated-explanations-img-source-image-1.png)

## AI 找到一条路之后，谁来把它变成知识

原文最后选的 Erdős 问题案例，把讨论从“解释应不应该被奖励”推进到“解释到底在什么时候创造了新的数学价值”。相关论文的 arXiv 摘要明确写道，它提出的方法 “suggested from output of GPT-5.4 Pro”，并以带 von Mangoldt 权重的 Markov chains 研究 primitive sets。论文的贡献不止是把某个答案交给读者，而是把方法写成可检查的论证，再展示它能连接哪些结果。

我更关心这里的分工变化。模型可能提供搜索提示，人类要重建提示背后的理由，证明它确实成立，说明它何时有用，再把它放进别人能够复用的理论语境里。这样看，AI 既不是被捧成发现者，人类也不是只负责抄写。

Sanderson 还讲述了从 AI 生成的证明到人类整理、扩展和解释的过程。论文页面能直接核实的是：AI 输出启发了方法，论文给出了相应的数学结果。至于具体由谁先读懂哪一版证明、怎样分工整理，我把它当作原文作者的叙述，不再扩写成一条独立核实的事件时间线。

我在之前的[《证明可以无限廉价，但理解不能：陶哲轩最新长文谈 AI 时代的数学价值终局》](https://ntlx.github.io/articles/terence-tao-mathematics-in-the-age-of-ai)里，写的是证明供给变便宜之后，学术制度如何失去原来的价格锚。这次材料让我补上另一层：价格锚失效以后，共同体还必须回答谁负责把结果变成可以共同使用的知识。前一篇更关心“证明过剩会造成什么”，这篇更关心“理解工作怎样被看见”。

## 我不想把“理解”做成新的排行榜

Sanderson 自己已经承认，解释不像证明那样有一个干净的真/假开关。这不是一个可以被轻轻带过的小缺点。只要解释进入招聘、晋升和期刊制度，名望、母语、演讲技巧和学派偏好就可能混进评价里。到头来，数学界也许只是从崇拜证明数量，换成崇拜某种被多数人喜欢的表达方式。

我赞成提高解释工作的地位，但不赞成把它压缩成一个“理解分数”。评审可以拿着几类问题逐项追问：

- 问题压力：在什么困难下，这个问题或定义变得必要？
- 概念来源：关键对象为什么以这种方式出现，而不是另一种方式？
- 修正路径：哪些直觉的尝试不够好，后来改动了什么？
- 关键机制：真正让结论成立的那一步是什么，读者怎样检查它？
- 迁移边界：这套想法还能在哪里使用，在哪些条件下会失效？

![解释质量的五个检查面](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-21-motivated-explanations-img-01-framework-explanation-review.png)

这份清单不是新排行榜，也不要求所有数学论文都改写成故事。有人可以给出极其技术化、只面向本领域的答案；有人可以写出面向更广读者的导览。两者的受众不同，但都应该对关键选择负责。

Mathematical Discourse 的做法给了我一个现实参照：它把数学研究报告作为可以同行评议的交流作品，同时明确报告不替代书面期刊对正确性的审查。这个分工比“把解释加到证明末尾”更诚实。证明和解释承担不同的责任，也接受不同的检查。

## 数学需要双重交付

读完这篇文章后，我对“数学产出”的想象变得更具体了。一个结果除了交付定理和证明，还可以交代：问题为什么值得问，关键定义如何被逼出来，哪些路径没有走通，哪一步最值得停下来，以及这个结果的边界在哪里。

Princeton Companion to Mathematics 的 Part IV 把许多研究领域组织成一组导览文章。它的价值不只是把名词排在一起，而是让读者知道一个领域从哪些问题长出来、不同主题之间怎样相邻。这样的工作未必产生新的定理，却能让后来者找到进入这个领域的路。

这也给学生训练和团队协作提供了一个小而实际的改变。我会把交付拆成两份：一份是结果，另一份是对问题来路、搜索过程、选择理由和不确定性的说明。学生需要在规定时间内向别人讲清楚题目，使用模型的人也需要说明为什么相信这一条路线。解释不是结果的包装，而是让结果进入共同知识时要经过的工序。

我并不认为证明会退场。恰恰因为解释不能替代正确性，它才值得被单独承认。只是当证明可以被机器大量生成时，证明不再自动携带那些过去常常跟着它一起出现的价值。数学真正需要保护的，可能不是“人类必须亲手写下每一行”，而是人类仍然愿意把问题的来路、思考的转折和知识的边界交代清楚。

因此，下一项值得学术共同体认真对待的数学工作，未必是又一份更长的证明，也可能是一份让别人知道该怎样理解、检查和继续使用那个证明的解释。

## 参考资料

- [If math is more than proof, we need to better celebrate the rest of it — Grant Sanderson / Terence Tao](https://terrytao.wordpress.com/2026/09/18/if-math-is-more-than-proof-we-need-to-better-celebrate-the-rest-of-it/)
- [A beginner’s guide to forcing — Timothy Chow](https://timothychow.net/forcing.pdf)
- [On Proof and Progress in Mathematics — William P. Thurston](https://www.math.toronto.edu/mccann/199/thurston.pdf)
- [Outside In — Geometry Center](http://www.geom.uiuc.edu/docs/outreach/oi/)
- [PODCAST: Fame and Admiration - with Timothy Gowers — Numberphile](https://www.numberphile.com/videos/podcast-timothy-gowers)
- [Numberphile Podcast MP3 — Tim Gowers](http://traffic.libsyn.com/numberphile/numberphile_timothy_gowers.mp3)
- [Primitive sets and von Mangoldt chains: Erdős Problem #1196 and beyond — arXiv:2605.00301](https://arxiv.org/abs/2605.00301)
- [Primitive sets and von Mangoldt chains — arXiv HTML](https://arxiv.org/html/2605.00301v1)
- [Mathematical Discourse — About](https://www.mathematicaldiscourse.org/about/)
- [The Princeton Companion to Mathematics — official table of contents](https://assets.press.princeton.edu/chapters/c8350.pdf)
- [Outside In — script](http://www.geom.uiuc.edu/docs/outreach/oi/script.html)
- [Outside In — history of sphere eversions](http://www.geom.uiuc.edu/docs/outreach/oi/history.html)
- [Outside In — MPEG movie](http://www.geom.uiuc.edu/docs/outreach/oi/evert.mpg)
- [Grant Sanderson / 3Blue1Brown](https://www.3blue1brown.com/)
- [Original image from the source article](https://terrytao.wordpress.com/wp-content/uploads/2026/09/image-1.png)

### 站内延伸阅读：

- [答案在贬值，地图用一次就没了](https://ntlx.github.io/articles/cheap-answers-precious-maps)
