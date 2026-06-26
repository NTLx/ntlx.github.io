---
$schema: starlight
title: 好的 Agent，不是多几个 Agent
description: 真正拉开 agent 差距的，不是多拉几个 agent，而是把复杂性塞进上下文、评测、合规和产品判断里。
date: 2026-06-27
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-27-sierra-simple-agents-context-engineering-img-00-infographic-core-summary.png)

我最近越来越不信一句话：系统越复杂，agent 就越高级。

因为现实里看到的往往不是这样。很多团队把系统做成一棵多代理圣诞树，路由、规划、审查、记忆、执行，一层套一层。demo 很热闹，落到真实业务里却常常只多出两样东西：延迟和失真。

LangChain 这期和 Sierra 产品负责人 Zack Reneau-Wedeen 的对谈，最有价值的地方就在这儿。它没在反对复杂，只是在提醒你：**复杂性当然存在，但别把它长在 agent 的脸上。**

## 复杂不是坏事，坏的是把复杂长成组织图

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-27-sierra-simple-agents-context-engineering-img-01-org_chart_complexity_trap.png)

Zack 说很多 multi-agent 系统，本质是在 “ship your org chart”。我一听就觉得这话很重，但很准。

我以前也吃过这套。箭头一多，框一多，看起来就像更高级。可用户根本不关心你后台有几个代理在交接班。用户只关心一件事：眼前这个东西到底能不能把事办成。你把一个任务拆成“分诊 agent”“检索 agent”“执行 agent”“总结 agent”，听起来很工整，可一旦拆错，信息就在交接处开始漏。前一个 agent 知道用户真正担心什么，后一个 agent 却只拿到一个被压扁的中间表示。最后出来的东西，常常只会更迟钝。

所以 Sierra 的做法很反直觉。它一轮对话背后可能会触发 10 到 15 次模型调用，但前台尽量还是一个统一的品牌代理。真正的复杂性藏在后面：模型选择、并行执行、工具调用、评测、合规隔离。这个思路我很认同。**系统可以复杂，责任边界最好简单。**

## 80% 的时候，别教育模型，先迁就它

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-27-sierra-simple-agents-context-engineering-img-02-model_turf_abstraction.png)

这期里我最想记住的一句经验，反倒不是商业模式或语音那段，而是这句：大约 80% 的时候，你应该把问题改写成模型熟悉的形式。

他说 coding agents 天生擅长文件系统、Git、grep。能落到这些结构里的，就先落进去。别一上来就发明一套只有你自己懂、训练数据里也没怎么出现过的中间抽象，然后再怪模型不听话。

这其实很戳破幻觉。我们总说“技术选型要服务业务”，但在 agent 时代，你还得承认另一件事：**训练分布也会反过来塑造技术选型。** 某个框架、某种文件组织、某类接口为什么越来越常见，不一定只是因为它优雅，也可能因为模型对它更熟、更稳、更少误解。

这不丢人。工程一直都有“顺势而为”的部分。以前是顺着 CPU cache、数据库索引、浏览器渲染管线来写；现在只是多了一条，要顺着模型真正熟悉的结构来写。

## 上下文工程，不是塞更多资料，而是决定谁先出场

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-27-sierra-simple-agents-context-engineering-img-03-progressive_disclosure_context.png)

Zack 对 context engineering 的定义很朴素：给 agent 做对事需要的一切，但只给这些，不多给。

我觉得这比很多宏大定义都准。因为大多数所谓“上下文增强”，做的更像堆料。文档全塞进去，历史全挂进去，FAQ 全贴进去，最后 prompt 像一个没做剪辑的素材盘。信息很多，结构没有。模型不是因为知道得少而犯错，而是因为同时被太多互相竞争的信息拉扯。

Sierra 官方那篇《Context engineering: the key to great agents》把这个问题说得更明白：关键是 progressive disclosure。用户还没说目的地，你就没必要把德国、法国、意大利三套政策一起塞进来；用户还没完成认证，你就不该把账号层工具和退款规则提前打开。

我读到这里的感觉是，**上下文工程的本质不是“喂知识”，而是“编排出场顺序”。** 什么时候只给品牌语气，什么时候解锁流程规则，什么时候释放工具权限，什么时候调用记忆，这些决定了一个 agent 到底像一个老练的员工，还是像一个把公司内网全文背下来却不会看场合的新兵。

## 真正该重的地方，在支付、语音、记忆和评测

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-27-sierra-simple-agents-context-engineering-img-04-hidden_infrastructure_stack.png)

这期对谈还有个很好的地方，它把那些不酷、但真正决定成败的重工程摊开了。

比如支付。Sierra 的 trust 页面直接写着，他们有 PCI DSS Level 1 Service Provider 认证，敏感支付数据走独立的 PCI 基础设施，不碰 core platform、不碰 LLM、也不进持久存储。你一看就知道，光“再接一个 tool”肯定不够。所谓 agentic commerce，如果真要成立，靠的不是一句“让 agent 帮我下单”，而是后面那整层身份、风控、合规和隔离设计。

比如语音。转录里他们提到 transcription ensemble：一个模型更会识别沉默，一个模型更会识别重口音，于是并行跑，再按规则合并。这个思路很工程化，也很现实。真正的语音系统不是追求“端到端一统天下”，而是谁在这个口音、这段静音、这个延迟预算下更可靠。

再比如记忆。Zack 很克制地说，记忆重要，但更关键的问题其实是认证。你能不能确认这个人是谁？你该不该把上次那段历史拿出来？我很喜欢这种不神化 memory 的说法。记忆不是一个浪漫功能，它首先是权限设计。

最后是评测。Sierra 一直在做 tau-bench 系列，并且已经把新版推进到 `τ³-bench`，把 voice 和 banking 也拉进来了。这说明他们理解的 agent，远不止“能跑起来”就算完，还得在一堆具体场景里反复证明自己。

## 代码变快以后，产品判断反而更贵

如果这期播客只留下一个尾声，我会留 Zack 那个 Formula One 比喻。

他说 coding agents 像把车开得更快了。车越快，越需要更频繁地进站、换胎、校准。写代码和 review 变快，不代表产品判断的重要性下降，反而意味着它会更频繁地成为瓶颈。

这点我非常同意。今天很多人讨论 agent，还停留在“能不能自动写出来”。但更难的问题其实早就变了：这个东西该不该写，写成这样值不值，失败成本谁承担，用户为什么会信任它。这些都不是再多挂两个 sub-agent 就能补出来的。

所以我读完这期，脑子里留下的不是“未来会有很多 agent”这句空话，而是：**未来真正好的 agent，会把复杂性压进后台，只把判断力留在前台。** 多代理、更多工具、更多链路都可能有用，但前提是它们没有把问题越做越像一张组织结构图。

简单从来不等于简陋。简单往往意味着你已经把该脏的地方、该重的地方、该难的地方，默默吃进系统里了。

*你现在见过最“看起来很高级”，其实只是把组织图搬进 prompt 里的 agent 系统，长什么样？*

## 原文参考

> The best AI agents are simpler than you think
> LangChain / Max Agency Podcast
> <https://www.youtube.com/watch?v=uCKhOmth2ms>
>
> Context engineering: the key to great agents
> Sierra
> <https://sierra.ai/blog/context-engineering-the-key-to-great-agents>
>
> Ghostwriter
> Sierra
> <https://sierra.ai/product/ghostwriter>
>
> Agent Data Platform
> Sierra
> <https://sierra.ai/product/agent-data-platform>
>
> Trust and reliability
> Sierra
> <https://sierra.ai/product/trust-and-reliability>
>
> GitHub - sierra-research/tau-bench
> <https://github.com/sierra-research/tau-bench>
>
> Why the Best AI Agents Are Simple: Sierra’s Zack Reneau-Wedeen on the Max Agency Podcast
> LangChain
> <https://www.langchain.com/blog/why-the-best-agents-are-simpler-than-you-think-sierra-max-agency-podcast>
