---
$schema: starlight
title: 一次周报，如何长成一位同事
description: Genie Ontology 把一次周报对话封装成文档、日程和 Agent；上下文开始复利，也开始复制错误。
date: 2026-10-21
category: ai-agents
primarySourceUrls: ["https://www.databricks.com/blog/how-genie-ontology-powers-product-development-databricks"]
---

演示进行到最后，Nicole 没有下载报告，也没有把链接复制到 Slack。她让 Genie 把这场对话保存成一个 Agent，再分享给同事。屏幕上的答复只有一句：Done。

如果只看前面，这是一段很顺的周报自动化：给一个模板链接，等它找数、查文档、跑 SQL，最后生成一份可以发给领导的复盘。最后一步把性质改了。复用的对象从报告换成了做报告的那套上下文：它读过什么、信过谁、在哪个定义上停住、又以什么方式把结论写出来。

这篇博客是 Databricks 的产品演示，不是独立评测。即便如此，它把企业 AI 里一个很少被演示完整的问题摆到了台面上：当一份分析被反复使用，真正被复制的是什么？

![文章核心信息图：一次对话被封装成文档、日程和 Agent；复利与污染共用同一条回路](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-21-genie-ontology-img-00-infographic-core-summary.png)

## 最后一步，把报告变成了同事

演示里有三件东西被依次做出来：一份文档、一个每周运行的日程、一个可以分享的 Agent。三个按钮背后是三种不同的封装。

![演示的起点：一句自然语言指令，加上一个 Google Docs 模板链接](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-21-genie-ontology-img-01-source-prompt-template.png)

文档封装结论，让一次分析离开对话，变成可以转发、可以批注、可以放进会议材料的东西；日程封装节奏，让分析离开人的记忆，变成每周一早上自动发生的事。Agent 封装的是角色：它让上下文离开作者，变成别人也能追问、也能继续使用的“同事”。

![Genie 生成的复盘文档，以及回答下方列出的七个来源；其中五个来自 Genie Ontology](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-21-genie-ontology-img-02-source-document-review.png)

原文用了一个很轻的说法：In seconds, I have an expert coworker。seconds 只是演示节奏；coworker 才是这篇文章的野心。报告只回答一次，同事要回答很多次；报告的可信度由作者背书，同事的可信度得由它背后的上下文背书。

每封装一层，复用成本都会下降，出错后的影响面会扩大。文档错了，最多误导一次会议；日程错了，会每周提醒所有人同一个错误；Agent 错了，会把错误包装成一种可以继续对话的能力。

九月我写过 Genie Ontology 的六层落地框架，那篇关心的是怎么把 ontology 建起来：数据基础、元数据、语义层、治理、评估，先建“头”，再让系统推断“尾”。六层框架讲的是从哪里开始；这次周报让我看到做完之后会长成什么。建好之后，上下文如何被封装、复用、再回流，是另一个问题。

生成周报只是结果。我更想知道它凭什么决定周报里该信谁。

## 先裁决定义，再回答数据

Genie 的思考轨迹里有一句话：Active user has a few competing definitions in this workspace, so I'll anchor on the certified WAU metric.

用户问的是采纳情况，系统先要处理的是“活跃用户到底算谁”，然后才轮到“有没有数据”。工作区里有几个互相竞争的定义，Genie 没有把它们并列丢给用户，也没有随便挑一个；它选了被认证的 WAU 指标，再把这条选择写进思考轨迹。

![思考轨迹里同时出现资产检索、MCP 搜索与 SQL 执行；系统先裁决定义，再回答数据](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-21-genie-ontology-img-03-source-genie-search.png)

检索系统负责找候选；本体负责决定哪一个候选算数。大多数企业 RAG 演示停在第一步：找出十份文档、五张表、三个 dashboard，然后让模型总结。Genie 的演示往前了一步：它要在一堆都看起来相关的资产里，决定哪一个定义有资格代表“活跃用户”。

这套裁决靠两层上下文。第一层是人在 Unity Catalog 里治理并认证的东西：metric views、Pages、domains。第二层是 Genie 从 dashboard、SQL query、notebook、连接应用里自动提取的 ontology snippets。前者是“头”，由人负责；后者是“尾”，由系统维护。演示里的 certified WAU metric 属于第一层，思考轨迹里那些被快速扫过的 snippets 属于第二层。

OntoRank 给这些上下文排序。文档说 authority score 看三个信号：来源、使用频率、新鲜度；发布博客又补了作者权威、与认证或广泛使用资产的关联，思路类似 PageRank。把这些信号放在一起，系统实际上是在回答一个组织问题：当两个定义冲突时，谁的历史记录更值得相信。

权限是这套裁决的地基。snippets 受 Unity Catalog 权限门控，Genie 只使用用户有权看到的来源。这一点我在八月写《当 Agent 开始跨表格与文档做推理》时提过：权限交给 Lakehouse，不指望 LLM 自觉。演示里没有出现权限提示，因为权限在后台已经替用户筛过一遍；这恰恰是它能在企业里用的前提。

Databricks 在发布博客里给过一组内部评测：28 题、84.5% 对 52.4%，速度约两倍。对手匿名，题目没有公开，所以这组数字只能当作厂商自述。它至少说明 Databricks 押的是上下文，不是模型参数。至于这个赌注在真实组织里能兑现多少，得看下一节那个面板。

## 引用面板，是这套系统的责任界面

演示里的回答下方写着七个来源，其中五个来自 Genie Ontology。点开其中一个，能看到一张 snippet 卡片：定义、来源资产、作者、所属 domain，以及一张从 domain 连到 dashboard、再连到作者的小图。

这张卡片不只是让来源透明。它解释系统为什么相信这个答案，也把责任落到一个具体的人和一份具体的资产上。用户不需要读 SQL，也不需要知道 metric view 怎么写，只要判断“这个人和这份 dashboard 是否值得信”。

![引用面板里的 snippet 卡片：定义、来源资产、作者、domain 与 authority](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-21-genie-ontology-img-04-source-citation-snippet.png)

这是业务用户的新 literacy。过去查数要会写 query，现在查数要会读 provenance。问题从“这个数字对不对”，换成了“这个定义是谁定的、什么时候定的、有没有被认证、有没有别的定义在竞争”。这不见得更轻松，只是把门槛从语法挪到了判断。

但引用面板有一个副作用：它越漂亮，越容易让人以为已经核实过。authority score 代理可信度，不证明正确性。原文自己就给了一个反例：有些 dashboard 是权威的，有些已经过期，应该被忽略。一个被频繁使用的 dashboard 可以同时是过期的；一个被认证的 metric 也可能认证错了。引用面板告诉你系统为什么相信它，不告诉你它是否值得相信。

引用仍然有用，而且是最该被看的地方。它把“模型为什么这么说”从黑箱里拉出来，变成用户可以检查的证据链。但如果用户把“有引用”当成“已核实”，引用就会变成一种权威剧场：看起来很严谨，实际上只是把判断责任从模型转移给了界面。

要检查的是引用面板有没有区分“证据”和“推断”。一张 snippet 是从 dashboard 里抽出来的原始定义，还是从某次对话里总结出来的结论？这两者的 authority 应该不是一回事。原文没有展示这个区分，文档也没有把“来源类型”列进 authority 的三个信号里。这一点，演示没有回答。

## 复利和污染，走的是同一条回路

把三次封装拆开看，每一次都在改变错误的传播方式。

文档把结论固定下来。看文档的人看到的是结果，不是推理路径；引用面板可以补上路径，但文档本身仍然是截断的。日程固定的是节奏。一个定义一旦进入每周运行的模板，它就不再需要每次被重新判断；如果这个定义错了，错误会以周为单位重复。Agent 固定的是角色：它继承这次对话的数据源，也继承此前关于这个主题的对话；它可以在作者不在场的时候替作者回答问题。这既是它的用处，也是它的风险。

![把复盘设为每周一 8:00 自动运行，结果发到 Slack 频道](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-21-genie-ontology-img-05-source-schedule.png)

原文说，这个 Agent 在几秒内就能变成一个专家同事。文档的说法更谨慎：Genie Agents 由数据分析师用 Unity Catalog 数据集、示例 SQL、业务语义表达式和文本指令来策展；从对话创建只是起点，后面还要调质量、做测试、看监控。秒级完成的是创建；可信度不在那几秒里。“同事”这个隐喻容易让人默认它已经受过上岗培训，而文档里的 Agent 还需要 curator 持续调。

![Agent 创建后进入 Agents library，并可以分享给同事；它继承这次对话与相关历史对话](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-21-genie-ontology-img-06-source-share-agent.png)

让我停下来的，是回路。文档把 Genie Agents 列为 inferred context 的来源之一：Genie 会从 metric views、dashboards、SQL queries 和 Genie Agents 中提取 snippets。这意味着 Agent 既消费上下文，也可能生产下一轮上下文。如果一次对话生成的 Agent 被团队广泛使用，它的定义、它的说法、它的结论，就可能以 snippet 的形式进入 ontology；使用频率越高，它在 authority 排序里的位置越稳；下一轮回答又更可能引用它。

复利转起来是这样的：更多使用带来更多 snippets，更多 snippets 带来更准的回答，更准的回答带来更多使用。污染的方向相反，机制却一样：一次合成的结论被当成事实写进 snippet，使用频率给它加权威，下一轮回答再引用它，错误就被包成了“组织知识”。文档没有说明抽取的粒度，也没有说明系统如何区分“Agent 引用的证据”和“Agent 自己生成的结论”。在文档补上这个区分之前，我没法把复利和污染分开看。

引用面板在这里又多了一层作用：它是这条回路的审计入口。当一份每周自动运行的报告出错，或者一个被领导使用的 Agent 给出了错误定义，最直接的追溯入口，就是它当时引用了哪些 snippet、这些 snippet 来自谁、authority 是怎么排的。如果引用面板只展示“来源”，不展示“来源是证据还是推断”，这条回路就缺一个关键的刹车。

## 想复制这套做法，先准备一份上下文账本

如果我要在一个真实组织里复现这次演示，我不会先问“能不能接 Google Drive”，也不会先比较模型。我会先问五个问题。

- 哪些定义是认证的，谁有权改？certified WAU metric 背后有一个被全公司接受的指标口径，以及一个能拍板的人。
- 哪些来源只是常用，不是权威？使用频率和正确性经常背离，原文自己就承认有 stale dashboard。
- 新鲜度怎么算？一个每周更新的 dashboard 和一个两年前写下的 Page，在 authority 里应该差多少？
- snippet 和 Agent 继承哪些权限？跨 domain 分享时，权限是收窄还是放大？
- 自动运行的报告或 Agent 出错时，谁负责、怎么追溯、怎么停机？

这五个问题没有标准答案，但它们决定了这套系统是“上下文复利”还是“错误复制”。演示里的上下文不是免费的：它依赖认证过的指标、建好的 Pages、连上的 Google Drive、Jira、Slack，以及此前关于这个主题的对话。对一个没有这些基础的公司，Genie Ontology 的第一天可能是空的，自动学习也没有足够高质量的东西可学。这笔成本属于 adoption，不属于产品缺陷。

站内那篇《当 AI 开始查数》讲过 Anthropic 的经验：把收入表从四十张砍到一张，比任何 prompt engineering 都管用，瓶颈在治理，不在模型。《对话式数据产品，先从业务口径开始》也提到，S&P Global Energy 的方案先把 Genie Agent 按数据集分组，再由业务专家维护指标口径。这两篇和这次演示说的是同一类前提：Agent 的门面越漂亮，背后的口径和权限就越不能含糊。

原文没写、文档里却写着的，还有几件。Genie Ontology 目前是 Public Preview；Pages 是 Beta；Pages 使用 Databricks 管理的密钥，不支持客户管理密钥，Page 数据和 Domain 元数据还可能全球复制，文档明确警告不要放个人或受监管数据。这些不影响 demo 的说服力，但会影响一个组织能不能把它放进真实的生产路径。演示可以领先于 GA，采购不能。

一次周报长成一位同事，听起来是效率故事。它更像一份组织合同：合同里除了它能做什么，还写着谁定义、谁授权、谁负责。签之前，先看清引用面板背后那张上下文账本。

## 参考资料

- 原文：Nicole Esibov，[How Genie Ontology powers product development at Databricks](https://www.databricks.com/blog/how-genie-ontology-powers-product-development-databricks)，2026-10-05
- Databricks 文档：[Genie Ontology](https://docs.databricks.com/aws/en/genie/genie-ontology)
- Databricks 文档：[Pages](https://docs.databricks.com/aws/en/uc-semantics/pages)
- Databricks 文档：[Genie Agents](https://docs.databricks.com/aws/en/genie-agents/)
- Databricks 发布博客：[Introducing Genie One, Genie Agents, and Genie Ontology](https://www.databricks.com/blog/introducing-genie-one-genie-ontology-and-genie-agents)，2026-06-16
- Databricks webinar：[Closing the AI Context Gap](https://www.databricks.com/resources/webinar/closing-the-ai-context-gap)
- 站内旧文：[Genie Ontology 读后感：把 AI 可信回答变成一层一层的信任工程](https://ntlx.github.io/articles/genie-ontology-data-stack)
- 站内旧文：[当 Agent 开始跨表格与文档做推理](https://ntlx.github.io/articles/databricks-agent-grounding-governance)
- 站内旧文：[当 AI 开始查数](https://ntlx.github.io/articles/anthropic-self-service-analytics)
- 站内旧文：[对话式数据产品，先从业务口径开始](https://ntlx.github.io/articles/sp-global-energy-conversational-data)
