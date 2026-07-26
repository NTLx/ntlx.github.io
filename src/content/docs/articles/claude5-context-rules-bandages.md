---
$schema: starlight
title: Anthropic 删掉 80% 的指令，删的是绷带
description: Anthropic 砍掉 Claude Code 八成系统指令，性能纹丝不动。删掉的不是知识，是绷带——旧事故留下的安全补丁。信任的底层不是模型变聪明了，是你的任务足够普通，普通到不需要被真正理解，只需要被正确插值。
date: 2026-07-26
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-26-claude5-context-rules-bandages-img-00-infographic-core-summary.png)

## 80% 的绷带

Anthropic 的 Thariq Shihipar 上周发了一篇博客，[The new rules of context engineering for Claude 5 generation models](https://claude.com/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models)。标题很规矩，里面的数字不规矩：他们删掉了 Claude Code 超过 80% 的 app-level 指令，内部编码基准测试，性能没有可测量的损失。

八成。不是微调，是截肢。

我第一反应是：那些指令当初为什么写？Thariq 在文章里给了答案：早期模型判断力差，不写"别删文件"它就真删，不写"别加注释"它就给你每个函数顶上糊一段废话。旧指令里有一条，明确禁止创建"计划、决策或分析文档"，偏好"从对话上下文工作"。今天看很荒谬。但当时模型确实会建一堆没人看的中间文件，像松鼠藏橡果，藏完就忘。

每条规则背后都有一次真实的翻车。规则是事故驱动的绷带。

问题在于：伤口愈合了，绷带不会自己掉。两年下来，Claude Code 的系统指令攒成了一座伤疤博物馆。Thariq 他们做的是清创。

去年我读 Anthropic 那篇 [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) 时写过一篇[读后感](https://ntlx.github.io/articles/anthropic-context-engineering-prompt-retreat)，说那篇文章真正做的事是把 prompt 赶下了主桌：重要的不是你问什么，是模型看到了什么。那篇是方法论宣言，这篇是工程落地。

## 矛盾是加班不是困惑

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-26-claude5-context-rules-bandages-img-01-contradictory_instructions.png)

文章里有个细节我觉得比 80% 这个数字更值得盯着看。Thariq 说他们翻了内部 transcript，发现一个请求里经常同时出现三条打架的指令：app 指令说"别加注释"，skill 说"适当保留文档"，用户说"写清楚点"。

三个信号，三个方向。

模型不是不知道怎么做。它知道。但它得先仲裁。三个老板同时下命令，它得判断听谁的，然后才能动手。Thariq 用的词是"reason more before choosing an action"。注意，不是"get confused"。矛盾的成本不是困惑，是加班。每次对话多走一段推理，延迟涨一点，出错概率涨一点。一条矛盾指令可能无所谓，二十条叠在一起，模型每次开工前都得先开一场调解会。

这让我想到一个很普通的场景：你给新来的实习生写了三页注意事项，隔壁组长又写了两页，客户还口头交代了几条。三页纸里有两条互相矛盾。实习生不是看不懂，是不知道听谁的。他花在揣摩上的时间，比干活的时间还长。

旧范式的问题不在规则写错，在太多。多了就打架。

## 读空气

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-26-claude5-context-rules-bandages-img-02-then_now_paradigm_shift.png)

Thariq 列了六组"以前这样，现在别这样了"：规则换判断，示例换接口，全部前置换渐进披露，重复换简洁描述，手动记忆换自动记忆，简单规格换丰富引用。六条看着散，底下其实是同一个转向。

旧指令是清单：不准 X，不准 Y，必须 Z。新指令是一句话："Write code that reads like the surrounding code; match its comment density, naming, and idiom。"

翻译成中文：看看周围怎么写的，跟着来。

规则变成了感知力。清单预设模型没有判断力，需要外部约束；感知力预设模型有品味，只需要一个锚点。旧模型没有这个锚点——你让它"跟着来"，它不知道跟谁。新模型有了。它在训练数据里看过一百万个仓库，人类工程师在 code review 里删注释的频率远高于加注释的频率，这个不对称性已经变成了它的默认行为。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-26-claude5-context-rules-bandages-img-03-interface_parameters_intent.png)

"示例换接口"那一条也值得单独说。Thariq 举了个 todo 工具的例子：把 status 字段设计成 pending / in\_progress / completed 三个枚举值，不需要给示例，模型就知道怎么用。参数名和枚举值本身就是指令。

我之前写 [skills 那篇](https://ntlx.github.io/articles/claude-code-skills-organizational-interface)的时候说过，skill 的本质是组织接口：把团队的隐性知识编码成模型能消费的结构。这里是同一个逻辑的另一面：接口设计得好，模型不需要你教；接口设计得差，你教多少示例都是在给坏设计打补丁。

Thariq 本人就是这条线的践行者。他之前在访谈里[倡导用 HTML 替代 Markdown](https://www.chatprd.ai/how-i-ai/claude-code-anthropic-thariq-shihipar-on-replacing-markdown-with-html) 作为 AI 产物格式，文章里也提到 HTML 原型比截图或文字描述效果更好。为什么？因为 HTML 是代码，代码在训练分布里的密度远高于"一张 UI 截图的自然语言描述"。HTML 引用把任务推向了模型最熟悉的地盘。

## 你信任的是平凡

但这里藏着一个问题：Anthropic 能删 80%，是因为模型变聪明了吗？

我觉得不全是。

模型的"判断"到底是什么？不是理解，是插值。它在你给的任务和训练分布之间做最近邻匹配。任务在分布腹地，插值稳，判断就像品味。任务在分布边缘，插值抖，判断就像掷骰子。

Claude Code 的典型任务——读代码、改代码、写测试、跑构建——全部在训练分布的腹地。这里是人类工程师活动最密集的区域，统计数据最稠，模型的"品味"最可靠。Anthropic 删掉的那些规则，防的全是腹地的失败模式。腹地不需要绷带。

所以 80% 这个数字真正说的不是"模型多强"，是"这些任务多普通"。你信任的不是模型，是自己的任务足够平凡，平凡到不需要被真正理解，只需要被正确插值。

这不是贬低。普通的事情终于不需要人盯着了。

## 你的 CLAUDE.md 该写什么

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-26-claude5-context-rules-bandages-img-04-four_layer_context.png)

文章发出来之后，社区裂成了三瓣。一瓣在写实操指南："你的 CLAUDE.md 该删什么。"一瓣在反驳："生产环境你敢删？"还有一瓣在喊"context engineering 本身已经过时了，未来是自动化工作流"。

三瓣人吵得很凶，但他们不在同一道题里。

Anthropic 的验证是在内部编码基准上做的——任务在分布腹地，失败可恢复，删错了 git checkout 就行。在这个题面里，规则的边际收益小于注意力税，删除是理性最优。规则派的题面不一样：新框架、领域合规、生产事故不可回滚。任务踩在分布边缘，模型没见过足够多的先例，规则是那里唯一的护栏。两边都没错。错的是拿一方的答案去套另一方的题。

那 CLAUDE.md 到底该写什么？Thariq 给的四层架构——系统提示、CLAUDE.md、Skills、References——被两条约束夹出了一个极窄的解空间：只写模型自己推断不出来的东西。所有类型挤在一个大文件里，这是反直觉的，写。构建命令是 npm run build，模型看 package.json 就知道，不写。检查步骤不常用，拆成 skill，用到再加载。CLAUDE.md 是仓库身份证，加一张便条："这里有坑"。

话说回来，这条原则有一个 Thariq 没展开的前提：渐进披露假设模型知道自己不知道什么。如果模型不知道自己不知道——unknown unknowns——它不会去触发 ToolSearch，信息就永远加载不到。接口设计也一样，它假设你能预见合理的用法空间。用法真正开放的时候，示例仍然是最好的沟通方式。新范式不是万能药，它的有效范围和训练分布的覆盖范围是同一个圆。

圆内，绷带可以撕了。圆外，你最好还留着。

*你的 CLAUDE.md 里，有多少条是两年前的事故留下的绷带，又有多少条是模型真的推断不出来的事实？打开看一眼，可能比读完这篇文章更有用。*

## 参考资料

- [The new rules of context engineering for Claude 5 generation models](https://claude.com/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models)
- [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices.md)
- [How I AI: Thariq Shihipar on Replacing Markdown with HTML](https://www.chatprd.ai/how-i-ai/claude-code-anthropic-thariq-shihipar-on-replacing-markdown-with-html)

## 延伸阅读

- [Anthropic 这篇 context engineering 文章，真正把 prompt 赶下了主桌](https://ntlx.github.io/articles/anthropic-context-engineering-prompt-retreat)
- [Anthropic 这篇 skills 文章，真正写的是组织接口](https://ntlx.github.io/articles/claude-code-skills-organizational-interface)
- [别再只问怎么提示：先找到你没说出口的未知](https://ntlx.github.io/articles/fable-unknowns-agentic-coding)
- [当计划变成代码——Claude Code Dynamic Workflows 读后感](https://ntlx.github.io/articles/claude-code-dynamic-workflows)
