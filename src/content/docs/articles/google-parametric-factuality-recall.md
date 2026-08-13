---
$schema: starlight
title: 空货架还是丢钥匙？大模型不是记不住，而是想不起
description: 前沿大模型早已编码了 95% 以上的事实知识，其幻觉并非源于缺课（空货架），而是源于调不出（丢钥匙）。思考（Thinking）本质上是大模型在脑内寻找门钥匙的扫雷工具。
date: 2026-08-13
category: ai-models
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-13-google-parametric-factuality-recall-img-00-infographic-core-summary.png)

每次大模型给出荒谬的事实错误时，行业的第一反应往往是：预训练语料不够全面，或者模型参数量不够大。

这种直觉把大模型当成了一个空间不足的房间。如果房间里没放这本书，模型自然答不出来；只要我们把参数规模从 1B 堆到 100B，或者再灌入几万亿 Token 的维基百科，错误就会消失。

Google Research 团队联合 Israel Institute of Technology 发表的新论文《Empty Shelves or Lost Keys? Recall is the Bottleneck for Parametric Factuality》（arXiv:2602.14080）却给出了一个完全相反的实验结论：**在前沿大模型（如 GPT-5、Gemini 3）中，95% 到 98% 的事实知识早已成功编码（Encoding）在权重深处。**

大模型的仓库里根本不缺货。绝大多数事实错误，不是因为“货架是空的”（Empty Shelves），而是因为模型“把钥匙丢了”（Lost Keys）——知识明明静静地藏在参数里，模型却在输出时找不到入口。

这一发现不仅重塑了我们对大模型记忆机制的理解，也直接指出了预训练 Scaling 试图解决事实性问题时的尴尬天花板。

## 事实剖析：从多项选择题看穿大模型的“伪失忆”

要证明大模型究竟是“没学过”还是“想不起”，最大的难点在于如何把这两种状态拆开。以往的评测（如 MMLU 或 TriviaQA）通常只给模型一次闭卷问答的机会，答错了就统一扣上“缺乏该知识”的帽。

论文提出了一个名为 **Knowledge Profiling** 的剖析框架，并构建了包含 2,150 个维基百科事实、2.15 万个探测问题以及 400 万次模型响应的 **WikiProfile** 基准。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-13-google-parametric-factuality-recall-img-01-knowledge_profiling_states.png)


该框架通过两种不同的测试形态，将模型的知识状态精准切分为 5 种剖析分级：

1. **未编码（Unencoded）**：哪怕给模型看包含正确答案和干扰项的多项选择题（Recognition 识别），模型依然选错。这说明知识确实没进参数，货架是空的。
2. **已编码但无法直接召回（Encoded but Unknown）**：做多项选择题时模型一选即对，但闭卷直接问答（Generation 召回）时它却凭空答不上来。
3. **可经思考恢复（Recoverable via Thinking）**：直接问答答不上来，但在开启 CoT 推理（Thinking）后，模型能在思考步骤中把答案找出来。
4. **可直接生成召回（Directly Known）**：无需额外思考，直接提问即可准确输出。
5. **正逆向均可直接召回（Direct & Reverse Known）**：无论顺着问还是倒着问，都能直接生成正确答案。

实验结果令人震撼：在 13 个主流 LLM 的横向对比中，GPT-5 和 Gemini 3 在基准测试中的事实编码率高达 95%–98%。这意味着，模型在绝大多数情况下都成功记住了事实。然而，在闭卷生成测试中，大量的已编码知识却直接沉没。

问题的根源根本不在于“存储”，而在于“激活”。

## 参数膨胀的边际效应： Scaling 养大了仓库，却没发钥匙

既然模型已经记下了绝大多数知识，那么继续增大模型参数量（Scale）能解决召回瓶颈吗？

实验给出了非常残酷的答复。

从 Gemma 3 家族从 1B 扩展到 27B 的完整轨迹来看，参数规模的扩大确实让“未编码（Unencoded）”的比例大幅下降——从小模型的漏洞百出，收敛到大模型的极低比例。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-13-google-parametric-factuality-recall-img-02-scaling_and_recall_bottleneck.png)


但令人警醒的是，**召回失败（Recall Failure）并没有随着参数量增大而同步消失**。在剩余的所有事实错误中，召回失败所占的比例反而越来越大。

这解释了为什么我们在使用百亿级甚至千亿级参数模型时，依然会频繁遇到以下两类极具挫败感的情况：

* **冷门事实（Long-tail facts）的“假死”**：传统观点认为大模型答不出冷门知识是因为数据参数装不下。但数据表明，热门事实与冷门事实在“编码率”上的差距微乎其微；两者真正的断层全在“召回率”上。冷门知识确实在参数深处，只是触发线索太微弱。
* **逆向诅咒（Reversal Curse）的真相**：过去研究发现模型知道“A 的妻子是 B”，却答不出“B 的丈夫是谁”，常被解释为“模型缺乏双向逻辑认知”。但 WikiProfile 证明：在多项选择题（Recognition）中，逆向问题的回答准确率与正向问题完全持平；只有在闭卷生成（Recall）时，逆向提问才出现断崖式下跌。

这证明逆向诅咒根本不是知识层面的单向缺失，而是搜索路径上的线索错位。在我们之前探讨过的 [《50 年前的 BM25 再次打败高大上的 RAG：为什么我们依然需要倒排索引？》](https://ntlx.github.io/articles/bm25-wins-at-scale-rag-scaling-study) 中，倒排索引正是靠精确匹配解决了线索偏离；而大模型的参数记忆缺乏这种显式索引，一旦提问语境偏离了预训练时的文本结构，记忆钥匙就找不到了。

## Thinking 的本质：它不是在推导算式，而是在脑内“找钥匙”

既然参数内存放着大量“看得见选项、自己写不出来”的被动知识，我们如何才能唤醒它们？

论文探索了推理计算（Inference-time Compute / Thinking）对记忆召回的修复作用，并得到了一个反直觉的结论。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-13-google-parametric-factuality-recall-img-03-thinking_as_recall_recovery.png)


在具备 Thinking 能力的模型中，**思考步骤成功唤醒了 40% 到 65%“已编码但无法直接答出”的事实**；而对于那些“完全未编码”的事实，Thinking 的恢复率仅有 5% 到 15%。

这个对比极其关键。它打破了我们对大模型 CoT（Chain-of-Thought）的传统认知。

大家过去普遍认为，Thinking 主要用于逻辑推演、数学计算或复杂决策。但在事实性任务中，**Thinking 的本质其实是大模型在脑内进行上下文重构的“自发检索仪”**。

当直接提问无法唤醒记忆时，Thinking 允许模型在输出最终答案前，先在 Token 空间里展开探索。通过自我生成相关概念、重构语境线索、变换叙述角度，模型实际上是在为自己制造能够激活深层权重的“二次 Prompt”。

正如我们在 [《别被 CoT 的“思考”骗了：为什么 Palantir 认为大模型可解释性在模型之外？》](https://ntlx.github.io/articles/palantir-black-box-llm-explainability) 中指出的那样，模型在思维链中吐出的每个词，都在重新塑造下一个 Token 的注意力分布。这就是为什么思考能够成功解锁那些原本沉没的冷门知识与逆向问题。

当然，Thinking 并非免费的午餐。它不仅带来数倍的 Token 延迟和计算成本，而且论文也指出，当知识彻底缺失（Unencoded）时，强行 Thinking 甚至会导致模型用看似严密的逻辑自圆其说，进而引发更难察觉的高级幻觉。

## 范式转移：事实性竞争的主战场已不在预训练

Google Research 的这篇论文给整个 AI 行业敲响了警钟：**如果前沿模型的事实编码率已经达到 95%+ 的饱和点，那么试图通过海量数据预训练和粗暴堆砌参数来解决幻觉问题，边际收益已经极其微弱。**

大模型事实性的下一个竞争主战场，正从“存储端”全面转向“激活端”：

1. **从知识灌输转向索引路由（In-weights Recall Routing）**：未来模型的架构设计，需要更关注内部隐向量的线索解耦与动态激活，让隐藏在深度参数里的冷门知识更容易被简短的 Prompt 唤醒。
2. **RAG 与 Parametric Memory 的新协同**：我们不必寄希望于模型能把所有知识在零 Context 下直接吐出。在 [《Google 给 RAG 加的不是更多 Agent，而是停手判断》](https://ntlx.github.io/articles/google-agentic-rag-sufficient-context) 中，核心命题就是如何精准判断模型何时需要外部补丁；而在内部记忆被唤醒前，结合轻量级的外部检索线索来做记忆引导（Memory Steering），将是性价比更高的选择。
3. **动态 Thinking 调度**：鉴于 Thinking 能唤醒 60% 的沉没记忆，未来的推理系统需要具备更敏锐的“感知力”——能自动识别哪些问题是因为“钥匙丢了”需要启动 Thinking 去搜寻，哪些问题是“货架本空”应该果断放弃或转向外置搜索。

大模型并不是一个健忘的智者，而是一个手握浩瀚图书却经常找不到分类索引的图书管理员。与其不断给他扩建图书馆，不如先交给他一套更高效的图书检索引擎。

***

*你在日常使用大模型时，有没有遇到过“做选择题对答如流、直接问答却胡说八道”的现象？你认为未来的大模型应该靠更长的思考时间（Thinking）来记忆检索，还是靠外部 RAG 来补齐？欢迎在评论区分享你的判断。*

## 参考资料

* [Google Research Blog: Empty shelves or lost keys? Recall is the bottleneck for parametric factuality](https://research.google/blog/empty-shelves-or-lost-keys-recall-is-the-bottleneck-for-parametric-factuality/)
* [arXiv: Empty Shelves or Lost Keys? Recall Is the Bottleneck for Parametric Factuality (Calderon et al., 2026)](https://arxiv.org/abs/2602.14080)

## 延伸阅读

* [Google 给 RAG 加的不是更多 Agent，而是停手判断](https://ntlx.github.io/articles/google-agentic-rag-sufficient-context)
* [50 年前的 BM25 再次打败高大上的 RAG：为什么我们依然需要倒排索引？](https://ntlx.github.io/articles/bm25-wins-at-scale-rag-scaling-study)
* [别被 CoT 的“思考”骗了：为什么 Palantir 认为大模型可解释性在模型之外？](https://ntlx.github.io/articles/palantir-black-box-llm-explainability)
