---
$schema: starlight
title: Agent 忘掉过程之前，先留下判断的依据
description: 资料可以移出上下文，结论却不能丢掉适用条件。给 Agent 减负时，我更在意它下一次做决定，还知不知道这句话凭什么成立。
date: 2026-10-22
category: ai-agents
tags: [context-engineering, agents, memory]
primarySourceUrls: ["https://www.langchain.com/blog/context-engineering-deep-agents-remember"]
---

假设让 Agent 帮忙选一款企业服务。它查了价格、部署方式和合同条款，最后记下：“A 的价格更低，优先考虑 A。”这句总结很清楚，也很短。

可如果用户先前说过“客户数据必须留在指定地区”，而 A 恰好不满足呢？只要这条限制在压缩时漏掉，接下来的采购建议就可能写得流畅、依据充分，却从根上选错。

读 LangChain 的[这篇 Deep Agents 上下文工程文章](https://www.langchain.com/blog/context-engineering-deep-agents-remember)，我一直想着这个假设。原文解释怎样让 Agent 不必把材料全背在身上。我读后更想追问：当材料被缩短、转交、留到下次使用，哪些话必须跟着结论一起留下？

![假设采购案例：结论应保留适用条件与原始资料位置](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-22-deep-agents-memory-img-00-infographic-core-summary.png)

## 先弄清楚，移走的是什么

原文的场景是定期做竞品分析。Agent 拉取数据、搜索新闻、整理笔记，再写报告。等到排版时，原始导出和旧稿仍占着上下文，虽然当前任务已经用不上它们。

Deep Agents 用几种办法整理这些内容。大的工具结果写进文件，模型拿到预览和路径；旧对话压成摘要，近期消息保留原文；Skills 先露出名称和描述，需要时再读具体指令；子代理在自己的上下文里做研究；值得跨会话保留的偏好则写进长期记忆。

这些办法处理的东西不同。工具结果是待查的数据，技能是做事的方法，对话摘要是任务进展，长期记忆则可能影响未来的行为。我会按它们对下一步的影响来决定去留。

回到采购案例，报价明细可以暂时移走，写报告的模板可以晚点加载。但数据驻留要求关系到候选是否合格。即使当前正在润色措辞，它也不能只剩在某个没人再打开的文件里。

原文的上下文曲线画得很直观：卸载削掉大结果带来的尖峰，摘要降低逐渐累积的历史负载。图中的 85% 是文章所述的默认触发比例，整张图是机制示意，不能拿来当效果测试。我从中读出的设计问题是：占用下降后，后面的任务还能否接着做对？

![LangChain 原图：卸载削峰与摘要回落，85% 为文中默认比例的机制示意](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-22-deep-agents-memory-img-01-infographic-context-management-source.png)

## 文件还在，结论也可能用错

原文有一个值得保留的细节：被摘要的历史会另存到文件，需要时可以回读。它链接的[上下文管理文章](https://www.langchain.com/blog/context-management-for-deepagents)也说明了这一安排。不能简单把卸载理解成保留原文、把摘要理解成删除原文；二者都可以留下记录，只是模型眼前看到的表示不同。

“能读回去”需要有人知道该读什么。如果摘要只写“A 更便宜”，模型未必会意识到自己还缺一条足以否决 A 的条件。文件保存得再完整，也不能替它提出这个疑问。

站内之前的[《Agent 跑得久，靠的是可恢复的工作集》](https://ntlx.github.io/articles/agent-context-working-set)讨论过恢复路径。这次我更想沿着它往前走：恢复出来的信息，是否仍带着使用它的条件？

我希望采购摘要至少留下这样的意思：“A 报价更低；数据驻留不满足当前要求；暂不能推荐。报价和条款见对应原始资料。”它比一句结论长，却能让下一步继续判断。精确价格、合同全文可以按需读取，不能丢的是为什么暂时不能选。

这也是我对摘要质量的要求：读完之后，应当知道哪些已经确定、哪些仍待核实，以及什么变化会推翻眼下的结论。没有必要把探索过程按时间重新讲一遍，但失败方案被排除的理由，有时比最终答案更值得留下。

## 把研究交出去时，别只收回一句答案

原文的子代理示例很克制：研究者读完材料，只向主代理返回三条要点。主代理因此不用接收搜索和阅读的全部过程。原文配图也清楚画出了各自独立的上下文与工具。

![LangChain 原图：主代理与子代理使用各自的上下文和工具](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-22-deep-agents-memory-img-02-framework-subagents-source.png)

研究里有大量无关结果和失败尝试，主代理没必要陪着看完每次检索。

但“三条要点”是输出长度的约定，尚不足以说明交付质量。假设子代理返回“推荐 A”，主代理看不到原始过程，就更需要知道这句推荐基于什么条件。否则，隔离掉的可能包括反证。

对采购研究，我会让交付带上结论的适用范围和证据位置。比如：“A 在价格上有优势，但不满足当前数据驻留要求；如果地区要求调整，需要重新检查条款。原文在合同资料的相关段落。”主代理可以据此追查，也知道什么时候该重新研究。

这不要求把完整日志塞回来。要求是让接手的人少猜几步。上下文隔离负责控制信息量，事实是否可靠，仍要靠交付内容和后续核验。

Skills 也有相近的边界。原文内嵌的[《What is a Skill?》视频](https://www.youtube.com/watch?v=bv1qgkbWhms)说明，技能可以装指令、脚本和参考资料，先提供短描述，再按需打开。我赞成把采购报告的格式要求这样收起来；但“哪些任务应该使用这个技能”要写清楚。目录存在，并不意味着该用时就一定会选中。

## 长期留下的话，也要允许改口

原文用 Markdown 文件保存长期偏好，并展示了切换模型后复用同一份记忆的方式。我喜欢这种可查看的形式：出了问题，至少能打开文件，看到系统究竟记住了什么。

不过，偏好一旦进入长期记忆，就有了被带到别处的可能。

“这份报告写简短些”，适合留成这次任务的要求；如果被改写成“用户总是喜欢简短回答”，下次做合同分析时就可能压掉必要细节。采购里的数据驻留要求也一样：究竟来自某个项目，还是整个组织？它适用于当前合同，还是未来采购？这些范围不能靠记忆的语气补出来。

[官方后端文档](https://docs.langchain.com/oss/python/deepagents/backends)还区分了会话内存储和跨线程持久化。把内容写到一个路径，与让下次会话读到同一份内容，是需要分别安排的事。文件形式也不会自动判断写入的内容是否正确。

所以我会更愿意保存带范围的规则：“这个采购项目要求客户数据留在指定地区，以当前需求文档为准。”如果需求更新，旧规则应该能被纠正。否则，记忆越积极，旧判断反而越难退出。

![本文设计建议：给采购项目的长期规则标明适用范围，需求更新后重新评估](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-22-deep-agents-memory-img-03-framework-memory-scope.png)

读完这篇文章，我想用采购案例做一个很小的验收：先让 Agent 整理材料，再压缩历史或换一个研究者接手，检查它是否仍会排除不合格的 A；随后明确修改数据驻留要求，看它能否重新评估，而不是机械坚持旧结论。

能保住前提，也能根据新证据改口，我才愿意把后续任务交给它。至于中间查过多少网页、试过多少写法，能安全移走的，就让它移走。

## 参考资料

- [LangChain：Context Engineering with Deep Agents: How To Remember Without Keeping Everything In Context](https://www.langchain.com/blog/context-engineering-deep-agents-remember)，本文直接阅读材料；正文复用原图均出自此文。
- [LangChain：Context Management for Deep Agents](https://www.langchain.com/blog/context-management-for-deepagents)，核对卸载、摘要与原始记录保存。
- [LangChain：Context engineering](https://docs.langchain.com/oss/python/langchain/context-engineering)；[Middleware overview](https://docs.langchain.com/oss/python/langchain/middleware/overview)；[Deep Agents RAG](https://docs.langchain.com/oss/python/deepagents/rag)，补充上下文管理与检索的职责。
- [LangChain：Backends](https://docs.langchain.com/oss/python/deepagents/backends)；[Memory](https://docs.langchain.com/oss/python/deepagents/memory)，核对持久化的适用边界。
- [LangChain：《What is a Skill?》](https://www.youtube.com/watch?v=bv1qgkbWhms)，原文内嵌视频，已读取完整文字。
