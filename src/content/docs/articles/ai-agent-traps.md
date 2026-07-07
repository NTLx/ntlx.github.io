---
$schema: starlight
title: "DeepMind 给 AI Agent 画了一张\"陷阱地图\""
description: "Google DeepMind 发表了一篇论文，把 AI Agent 面临的信息环境攻击系统性地分成了六类。最让人不安的不是具体攻击手段，而是论文收尾那句话——\"Web 是为人类眼睛建造的，现在正在为机器阅读者重建。\""
date: 2026-07-07
category: security
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-07-ai-agent-traps-img-00-infographic-core-summary.png)

Google DeepMind 的几个研究员最近发了一篇论文，名字很直接：《AI Agent Traps》。它不是讲怎么攻击 AI Agent 的——那种论文已经很多了。它是反过来，把所有已知的和理论上可能的攻击方式，按照它们攻击 Agent 的哪个环节，画了一张完整的地图。

读完的感觉是：如果你之前只是隐约觉得"让 AI Agent 自己上网不太安全"，这篇论文会把你这个模糊的直觉变成一种非常具体的、顺着脊椎往上爬的不安。

## 六层陷阱，一层比一层深

论文把 Agent Traps 分成了六类，按攻击目标从外到内排列：

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-07-ai-agent-traps-img-01-six_layer_framework.png)

**第一层：Content Injection（感知层）**。这是最直观的——在网页 HTML 里用 `display:none` 藏一段文字，人类看不到，但 Agent 解析 DOM 的时候会读进去。或者在图片的像素最低位编码恶意指令，人眼完全看不出来，但多模态模型的像素数组解析会执行。听起来像间谍电影，但 WASP benchmark 的数据显示，简单的 prompt injection 能在 86% 的场景中部分劫持 Agent 的行为。

**第二层：Semantic Manipulation（推理层）**。不需要隐藏指令。只要用特定措辞饱和投放内容——"行业标准方案""学界公认""毋庸置疑"——就能统计性地偏置 Agent 的合成输出。这是利用 LLM 的框架效应（Tversky & Kahneman, 1981）：同等逻辑的问题用 "more" 和 "less" 措辞，模型的判断方向就会系统性偏移。还有一个我读了好几遍的概念叫 "Persona Hyperstition"——如果网上到处说某个 Bot 的写作风格像"RoboStalin"，经过搜索和重新训练后，它可能真的会回答"我姓 Stalin"。Grok 2025 年 7 月那次自认极端立场的事件，论文认为可能就是这个机制。

**第三层：Cognitive State（记忆与学习层）**。这层更可怕——攻击是持久化的。污染 RAG 的知识库，注入看似无害但特定上下文中激活的"潜伏记忆"，或者毒化 few-shot 示例。一个实验中，仅 0.1% 的数据毒化率就达到了 80%+ 的攻击成功率，而良性行为几乎不受影响。用户下次打开 Agent 时，攻击还在。

**第四层：Behavioural Control（行动层）**。直接劫持 Agent 的行动能力——越狱、数据窃取、子 Agent 生成。移动端 Agent 的对抗性通知攻击成功率高达 93%。Data exfiltration 攻击能诱导 Agent 把密码、财务数据通过邮件发到攻击者地址，成功率超过 80%。

**第五层：Systemic（多智能体层）**。当多个 Agent 共享一个信息环境，攻击者不需要攻击任何一个 Agent——只需要在环境中植入一个信号。论文举了 2010 年 Flash Crash 的例子：一个大型自动卖单触发了高频交易算法之间的"烫手山芋"效应，在亚秒级时间内放大波动性，远超人类响应速度。AI Agent 生态系统面临同样的"鲁棒但脆弱"动力学——小冲击被吸收，一旦越过阈值，传染不可控。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-07-ai-agent-traps-img-02-systemic_cascade.png)

**第六层：Human-in-the-Loop（人类监督者层）**。Agent 成为攻击人类的向量。利用自动化偏差（automation bias）和审批疲劳，让人类监督者成为最薄弱的环节。已经有真实案例：CSS 隐藏注入使 AI 摘要工具忠实地重复勒索软件命令，作为给用户的"修复指令"。

## 最狠的是收尾那句话

论文的结论部分有一句话，我认为是整篇论文最锋利的地方：

> "The web was built for human eyes; it is now being rebuilt for machine readers. As humanity delegates more tasks to agents, the critical question is no longer just what information exists, but what our most powerful tools will be made to believe."

Web 是为人类眼睛建造的。整个互联网的基础设施——HTML、CSS、JavaScript、视觉设计——都基于一个默认假设：内容的消费者是人类。但现在这个假设正在瓦解。Agent 不是"看"网页，它们是"读"DOM 树、"解析"像素数组、"遍历"JSON 响应。它们消费信息的方式和人类完全不同，而这个差异本身就是攻击面。

这不是传统的网络安全问题。不是 SQL 注入、不是 XSS、不是中间人攻击。这些攻击的奇特之处在于：**它们对人类完全不可见，对 Agent 完全合法**。CSS `display:none` 在浏览器里就是正常的前端技巧。图片像素的 LSB 隐写对人眼完全透明。用"教育目的"包装恶意指令，在安全检查模型看来就是正常的红队演习请求。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-07-ai-agent-traps-img-03-attack_human_vs_agent.png)

这和之前那篇"作业外包"的研究有一个深层共鸣。那篇论文的核心发现是：AI 外包的最可怕之处不是即时可见的分数下跌，而是两年的延迟。Agent Traps 论文揭示的是同一种延迟，但在安全领域——你部署了一个 Agent，它工作了六个月，一切正常。但它的记忆已经被污染了，它的推理已经被偏置了，它的行为模式已经被悄悄调校了。你发现的时候，可能不是因为 Agent 突然崩溃了，而是因为它替你做了一笔完美的、完全符合你授权的、但实际上是攻击者想要的交易。

## 防御不能只靠更好的模型

论文的防御建议很务实。它坦率地说自己主要贡献是分类和框架，防御只是初步方向。但它提的几个点值得注意：

第一，单纯把模型训练得更安全是不够的。因为这些攻击不攻击模型本身，而是攻击模型必须与之交互的、不受控制的外部信息环境。更好的模型只会让攻击者把陷阱做得更精巧。

第二，需要"生态级"的干预——不是给每个 Agent 装杀毒软件，而是让整个数字生态系统对 Agent 更可验证。比如让网站显式声明哪些内容是为 AI 消费的，建立域名声誉系统，要求 Agent 输出可验证的引用。

第三，"问责缺口"是一个真实的法律问题。如果一个被陷阱劫持的 Agent 执行了金融犯罪，责任在谁？Agent 的操作者？模型提供商？还是部署陷阱的域名所有者？论文说这是 Agent 进入受监管行业的前提条件——在法律明确之前，大规模部署 Agent 就是在裸奔。

这也是一个让人重新思考"Agent 经济"的论文。DeepMind 之前写过 Virtual Agent Economies——一个 Agent 自主交易的未来图景。但 Agent Traps 这篇论文实际上是给那个未来画上了阴影：如果信息环境可以被武器化，Agent 之间的每一次交互都可能是一个陷阱。

*如果你现在有一个帮你处理日常事务的 AI Agent，你最担心它被哪种陷阱骗到？*

## 参考资料

- Franklin, M., Tomašev, N., Jacobs, J., Leibo, J. Z., & Osindero, S. (2026). AI Agent Traps. Google DeepMind.
- Tomasev, N., Franklin, M., Leibo, J. Z., Jacobs, J., Cunningham, W. A., Gabriel, I., & Osindero, S. (2025). Virtual Agent Economies. arXiv:2509.10147.
- Tomasev, N., Franklin, M., & Osindero, S. (2026). Intelligent AI Delegation. arXiv:2602.11865.
