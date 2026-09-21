---
$schema: starlight
title: 把写作交给 AI，可能连思考也一起交出去了
description: 我基本同意“几乎不要让 AI 代写实质性文字”，但理由不只是文风和披露：写作会主动暴露论证漏洞。更稳妥的边界，是让 AI 查找、反驳、编辑和翻译，而把第一版判断与最终责任留在人手里。
date: 2026-09-21
category: ai-industry
primarySourceUrls: ["https://erichgrunewald.substack.com/p/why-you-should-almost-never-use-ai"]
---

有一种 AI 用法，越像一个可靠同事，越让我不安：把几条要点交出去，几秒后拿回一篇看起来已经想清楚的文章。

Erich Grunewald 在《[Why You Should Almost Never Use AI to Write Anything Substantive](https://erichgrunewald.substack.com/p/why-you-should-almost-never-use-ai)》里给出的判断很狠：博客、研究报告、备忘录、认真邮件、小说，以及任何用来传达观点、论证或分析的实质性文字，几乎都不应该让 AI 代写。

我读完后基本同意，但需要先把这句话从“反对 AI”里拆出来。这里的“写”不是转录、查资料、分析数据、头脑风暴，也不是让模型指出草稿哪里含糊，再由人逐条决定改不改。它说的是：把还没有真正成形的判断交给模型，让模型替你把它组织成一篇可以署名的成稿。

中间少不了一段不该被省略的思考。

![文章核心信息图](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-21-ai-writing-thinking-img-00-infographic-core-summary.png)

## 先把“写作”从“打字”里拆出来

如果写作只是把已经完成的判断排版，当然可以自动化。但实质性写作很少如此干净。你开始写第一段时，往往以为自己知道要说什么；写到第二段，才发现证据还没有排好；为了让一个转折成立，又不得不承认前面的结论太宽，或者补上一个原本不想面对的反例。

![原文主图：写作场景](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-21-ai-writing-thinking-img-source-top.png)

Holden Karnofsky 在[《Learning By Writing》](https://www.cold-takes.com/learning-by-writing/)里描述过一种以写作为中心的学习循环：先写出一个暂时的假设，再主动寻找论证弱点，继续阅读，修改甚至反转自己的判断。Paul Graham 也把写作称为检验想法的过程：把想法落实到词语里，会暴露它不完整的地方；写作不能保证观点正确，却是非平凡观点必须经过的一道检查。

所以，“我读过 AI 的每句话，也觉得它们没错”并不是充分的辩护。读一段已经顺下来的文字，是在检查一个成品；从空白开始组织证据、顺序和措辞，则是在生成判断。前者可以发现错误，后者还会制造新的问题。

所以，写作的价值不只在最后留下的句子，也在句子逼你做出的那些决定。把这部分直接跳过，省下来的可能正是最有用的时间。

## 提纲交给 AI，最容易丢的是停下来重想

Clara Collier 在 Complex Systems 播客里给了一个很具体的场景：她试着把提纲写成正文，某个转折怎么都不顺，最后发现不是句子技巧不够，而是两个观点根本不该放在一起。对她来说，从提纲走到句子一直伴随着思考和改变主意。

如果把提纲交给模型，它通常会把任务理解为“把这些点完成”。模型接到的指令就是按照要求交付，而不是擅自宣布提纲可能有问题。于是一个重要的检查点消失了：结构被缝得很平，作者反而少了一次发现错误的机会。

提纲当然可以给 AI 看。我更愿意让模型扮演一个不太客气的审稿人：指出哪一步没有证据，找出最强反驳，列出一个概念可能包含的不同含义，或者模拟一个并不熟悉背景的读者会在哪里迷路。它可以扩大我的搜索范围，却不应该替我决定哪些矛盾可以被牺牲掉。

我在[《RAG 最先要解决的，不是模型会不会答，而是证据有没有进场》](https://ntlx.github.io/articles/rag-embedding-evidence-routing)里写过，相关内容不等于足以支撑答案的证据。写作也有同样的问题：一段和主题相关的文字，不等于作者已经完成了判断。模型可以把“相关”排列成漂亮的段落，但它不会自动把“我到底凭什么这样说”补齐。

## 最危险的不是胡说，而是顺滑地没说清楚

原文最有说服力的部分，是作者逐句检查一段关于 AI 芯片走私的模型生成文字。那段话并不荒谬，甚至很像一段合格的背景介绍；问题藏在更细的地方：有的句子只是把常识说得更响，有的词没有交代究竟指什么，有的数量缺少时间范围和定义，还有的结尾用宏大措辞制造了“已经得出结论”的感觉。

这种问题比明显的胡说更难处理。明显错误会让人停下来，含糊的正确却会让人继续往下读。你不需要证明每一句都错，只要接受一个大概意思，文章就已经获得了它想要的顺滑效果。

LessWrong 有个词叫 “applause light”，指的就是这类听起来正确、却没有增加可区分信息的句子。这个词对我有用，因为它把“有点空”变成了一个可检查的问题：这句话增加了什么机制、范围、条件或后果？如果什么都没有，它可能只是在提示读者点头。

Eric Schwitzgebel 对此还有一层更尖的解释：主动生成文字和读到文字后点头认可，在认知上不是同一个动作。专家的词语选择有时携带着本人没有显式说出的敏感性；模型给出的近似表达即使看起来可以接受，也可能已经把那个细微区别抹掉了。

![主动生成与被动认可](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-21-ai-writing-thinking-img-01-comparison-active-passive.png)

所以，“最后我会认真校对”不是万能答案。校对当然必要，但校对面对的是已经被模型选过的词。除非你愿意重新检查定义、因果连接和没有写出来的限定，否则你很容易只是在确认它读起来像一篇文章。

## 署名文本不是一个无主的容器

一篇署名文章隐含着一个简单的交换：读者交出注意力，作者承诺提供某种值得这份注意力的东西。它不一定是新知识，也可以是独特的经验、判断或组织材料的方式；但读者通常会假设，页面上的文字代表作者认真形成并愿意承担的想法。

Clara Collier 把这称为作者和读者之间的隐含契约。Schwitzgebel 则进一步说，文字由一个专家主动生成，本身就是读者评估这段论证时的“关于证据的证据”。如果大量实质性文字其实只是模型代写，而作者没有告诉读者，读者就会高估文本经过的思考和筛选。

这不是要求每封通知邮件都附上模型使用记录。原文也承认，短而公式化的协调邮件可能只是物流功能，AI 起草后由人快速检查并不值得大惊小怪。问题在于，同一套宽容不能无差别地套到研究报告、政策分析或需要作者判断的文章上。

非母语写作者的翻译是一个更微妙的边界。原文认为，从已经用母语写成的文本出发做翻译，可能比让模型从要点起草更能保留清晰和精确；相关讨论也建议让模型解释非平凡的翻译选择，再由作者决定是否接受。这里真正重要的不是找到一条永远有效的豁免条款，而是不要把“语言表达困难”偷换成“可以把思想组织也外包掉”。

披露不能修复质量问题，却至少把选择权还给读者：他可以知道自己读到的是作者的判断、模型的草稿，还是两者之间经过了怎样的协作。

## 我会把 AI 放在写作的后半场

读完这篇文章后，我不会把自己的写作流程改成“完全不用 AI”，而会把边界画得更具体：

1. **先由人写出判断。** 不必先写得漂亮，但要写出我认为发生了什么、依据是什么、最不确定的地方在哪里。第一版的任务不是交付，而是让自己无处躲藏。
2. **再让 AI 扩大检查范围。** 让它检索资料、提出相反解释、扮演怀疑的读者、寻找定义不清和证据不足的地方。它可以帮我发现“我还需要查什么”，不能替我决定“我最终相信什么”。
3. **人重新组织论证。** 如果模型指出某个转折不成立，我回到材料和判断本身，而不是只要求它把转折润色得更自然。结构问题不能靠句式修复。
4. **最后才用 AI 做编辑和翻译。** 对改动逐条接受或拒绝，尤其检查数字、专名、限定词、因果关系和语气。所谓“读起来更顺”，不能成为自动接受的理由。
5. **实质性代写就明确说明。** 如果模型已经替我完成了主要的思想组织，我不应该把它包装成纯粹的拼写检查。读者是否接受这份协作，应该由读者判断。

这套分工并不神圣，也不是对未来模型的永久判决。它只是把 AI 放在能够增加搜索和反馈的地方，把需要由作者承担的判断留在作者手里。对模板化、低风险、主要承担协调功能的文字，可以采用更轻的流程；对需要读者据此形成判断的文字，流程就应该更重。

写作的价值不是把句子打出来，而是让判断在公开语言中承受压力。把这层压力全部交给模型，拿回来的也许是一篇更快的文字，却可能少了一次真正想清楚的机会。

本文使用 AI 协助完成资料检索、交叉核对和初稿组织；发布者仍需对文中的事实、链接与判断负责。

## 参考资料

- [Why You Should Almost Never Use AI to Write Anything Substantive](https://erichgrunewald.substack.com/p/why-you-should-almost-never-use-ai) — Erich Grunewald
- [Learning By Writing](https://www.cold-takes.com/learning-by-writing/) — Holden Karnofsky
- [Putting Ideas into Words](https://paulgraham.com/words.html) — Paul Graham
- [What LLMs can and can't do for writers, with Clara Collier of Asterisk Magazine](https://www.complexsystemspodcast.com/episodes/llms-and-writers-with-clara-collier-of-asterisk-magazine/) — Complex Systems
- [AI Slop and Evidence about Evidence](https://eschwitz.substack.com/p/ai-slop-and-evidence-about-evidence) — Eric Schwitzgebel
- [Applause Lights](https://www.lesswrong.com/posts/dLbkrPu5STNCBLRjr/applause-lights) — LessWrong
- [Linch's Shortform：翻译建议评论](https://www.lesswrong.com/posts/s58hDHX2GkFDbpGKD/linch-s-shortform?commentId=aeWcFXjfgATnDoajE) — LessWrong

## 延伸阅读

- [RAG 最先要解决的，不是模型会不会答，而是证据有没有进场](https://ntlx.github.io/articles/rag-embedding-evidence-routing)
- [如果你想要品味，就得亲自去吃](https://ntlx.github.io/articles/taste-ai-era)
- [Writes and Write-Nots](https://www.paulgraham.com/writes.html) — Paul Graham
