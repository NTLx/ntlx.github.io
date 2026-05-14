---
$schema: starlight
title: 诺奖得主 Hassabis 的 50%：为什么造出 AlphaGo 的人对 AGI 不敢打包票
date: 2026-05-06
description: 真正在推动前沿的人，不需要画饼。
coverImage: cover.png
category: ai-industry
---

![全文核心内容导览：诺奖得主Hassabis论AGI的坦诚判断](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-06-demis-hassabis-agi-infographic.jpg)

## 50% 的判断

Y Combinator 四月那场《How to Build the Future》的直播里，主持人 Garry Tan——Palantir 第 10 号员工、投过 Coinbase 和 Instacart、2022 年开始执掌 YC——问 Demis Hassabis 一个看似常规的问题：大规模预训练、RLHF、思维链，这些东西离 AGI 最终架构还差多远？

Hassabis 的回答不是"快了"，也不是"就是这条路"。

他说现有技术肯定会在最终架构里占位置——这条路没走错。但顶上可能还缺一两样东西。**现有技术能自己扩展到 AGI，还是需要再冒出一两个大突破——两种可能性各占一半。**

"about 50/50."

说这话的人，手里握着的东西大概是地球上最重的技术履历：造出 AlphaGo 击败李世石，用 AlphaFold 破解生物学 50 年未决的蛋白质折叠难题、预测了两亿种蛋白质结构、全球超 300 万研究人员用过、直接拿了 2024 年诺贝尔化学奖。更重要的是，**这不是他第一次把"大家都说还早着呢"的事做出来。**

所以这句 50/50，分量不一样。

他不是从 PPT 里推演的 AGI 路径。他是从自己亲手填过的一个一个坑里，往回看了一眼，然后说：可能还有一两个坑我不知道在哪。

这种判断只有真正做过东西的人会懂。你写过一个从零到一的项目，你就知道画架构图的时候信心满满，写到第三个月发现当初的判断有一半是错的。Hassabis 不是"谨慎"——他是在描述一种他反复经历过的现实：**做出来的东西越多，越清楚还有多少东西没搞明白。**

![AGI 路径的分叉：清晰的技术成就与未知的突破](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-06-demis-hassabis-agi-img-01.jpg)

## 暴力胶带

Hassabis 在对话里用了一个让我愣住的表达。

他说现在处理记忆的方式，是"shove it all in the context window"——把什么都往上下文窗口里塞。然后用了这个词：**duct tape**，管道胶带。工程上最原始的"先绑上再说"。

百万 token 的上下文窗口，从技术数字上看是奇迹。人脑的工作记忆只有大概七个左右的东西（"like a dozen digits maybe, you know, average of seven"）。他说得直白：我们搞了个百万甚至千万 token 的东西，看着很唬人——但你只是把所有东西都堆在工作记忆里，不做筛选、不做整合。

重要的、不重要的、错的、对的，全塞进去。查起来还慢。

"如果你真的在持续处理视频流，百万 token 其实只够存 20 分钟。"

而人脑怎么做记忆的？海马体在 REM 睡眠中精准重放重要片段，把该留的经验整合进已有知识，把不重要的扔掉——**不是容器大，是选择狠。**

这恰好是他博士期间研究的东西。Hassabis 在 UCL 的认知神经科学博士，做的就是海马体如何将新知识"优雅地"整合进已有知识库。他还提到 2013 年 DeepMind 第一个 Atari 程序 DQN——成名技法就叫"experience replay"，思路就是从神经科学借过来的：回放重要的轨迹，像大脑在睡梦中重放关键经历。

那是 12 年前的事。到了今天，行业在记忆这件事上的解决方案，仍然是——给个更大的碗。

![AI 的暴力上下文窗口 vs 人脑的选择性记忆整合](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-06-demis-hassabis-agi-img-02.jpg)

他的判断：记忆机制仍然是未解决的问题。

这不是悲观的判断。恰恰相反。你知道一个领域真的在往前走，是因为最前沿的人告诉你「这个还没搞定」——而不是告诉你「一切都在掌控之中」。

## 锯齿状智能

这场对话里有一个场景特别 shocking。

Hassabis 说他有时候跟 Gemini 下国际象棋。能看到模型的思考 trace——它会考虑一招，发现是昏招，但搜了一圈找不到更好的，于是**又走回那步昏招**。

"you just shouldn't be seeing that happening in a very precise reasoning system."一个精准推理系统不应该出现这种事。

他给了一个很精准的描述：**jagged intelligence**，锯齿状智能。

一头高得离谱——能解 IMO 金牌题，能重构十万行代码库。另一头低得荒谬——问他"洗车场 50 米远，开车还是走路"，Opus 4.7 级别的模型会告诉你"走路吧，这么近"。

能 Carry 陀思妥耶夫斯基，读不懂一个停车场出口指示牌。

![AI 能力的锯齿分布：IMO 金牌到基础推理错误](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-06-demis-hassabis-agi-img-03.jpg)

这不是能力不够。一个能在毫秒内做完棋局搜索的系统，为什么走回去选那步已经知道是错的棋？Hassabis 的判断是：**缺一个自省机制**。模型没有"等一下，我刚才判断了这一步是错的，那意味着我应该换一个方向想"这个过程。

它能把每个 token 的概率算到极致。但它不知道自己不知道什么。

我自己的 AI Coding 实践里天天碰到这个。用 Claude Code 重构代码快得像闪电，该跑跑该测测。但偶尔会在最简单的逻辑上绕圈——明明一个 if 就能解决，它绕了三层抽象。那个感觉就是，它像一个**没有"等一下我在说什么"这个暂停键的人。**

Hassabis 说这不一定是大问题——"it may only be one or two tweaks that are required to fix those kind of gaps."可能一两个小调整就够了。但此时此刻，**锯齿就是锯齿。**

## Agent 才刚开始

聊到 Agent 的时候，Hassabis 说了全场最接地气的一句判断。

"我看很多人搞 Agent，设定几十个 agent 跑 40 个小时——但我还没看到 output 真正对得起那 40 个小时的投入。"

花里胡哨跑半天，产出的东西不太值那个时间。

但他紧跟着一句："I think it will come. Probably in the next 6 to 12 months."

不是"Agent 没前途"。是"Agent 现在还不太行，但临界点很快到"。这种颗粒度的判断，跟市场上"Agent 时代已来"的宣传腔，差了至少两个量级。

他举了自己的例子。他在网上分享过 MenuGen——一个拍照识别餐厅菜单然后生成菜品图片的工具。Agent 帮他做的那版，用了个"巧妙"的逻辑：Google 账号和 Stripe 账号各有一个 email 地址，用 email 地址去匹配，把 Stripe 充的值对应到 Google 登录的用户。

这在工程层面是个方案。在常识层面是傻的——**用户完全可以用不同的 email 注册 Google 和 Stripe。**

"why would you use email addresses to try to cross-correlate the funds? they can be arbitrary, you can use different emails — this is such a weird thing to do."

Agent 做工程细节没问题——它们有完美的 recall。但做判断的时候，缺少那种"不对，这不可能 work"的基本嗅觉。

这不是能力问题。**判断力没进 RL 的优化函数。**

## 真话给创业者

最后一段，Garry Tan 问他：如果你是今天坐在 YC 位置上的创业者，你会做什么？

Hassabis 的回答坦率得不像"AI 教父"：去做 AI 跟其他深科技的交叉——材料、医学、药物，任何碰得到原子的领域。

理由非常诚实：**你在纯软件层上做的事，下一次模型更新就可能直接吞掉。**但物理世界没有捷径，没有下一个 Gemini 版本跳过细胞实验。

他还当场爆了一个判断科学难题能否用 AI 攻克的方法论：

1. 这个问题有没有**巨大的组合搜索空间**？（越大越好。围棋和蛋白质折叠都满足——可能性远超宇宙中的原子数）
2. 有没有**明确的目标函数**？（能告诉模型"对了"还是"错了"——围棋有胜负，蛋白质有自由能）
3. 有没有**足够的数据和/或能生成数据的模拟器**？

三条满足，就能用 RL 的思路啃。

![AI 攻克科学问题的三条判定标准](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-06-demis-hassabis-agi-img-04.jpg)

药物发现也满足——"there is a compound out there that would solve this disease if one could find it."一定存在一个分子能治这个病，问题只是怎么在可行的时间内找到它。

然后他给了一个极其冷峻的计算：真正的深科技创新周期大概十年。他的 AGI 时间线是 2030 年左右。所以——**如果你今天开始做深科技，AGI 会在你创业的半路出现。**

不是坏事。但必须把这件事算进你的规划里。

一个诺贝尔奖得主在这替你考虑 2030 年 AGI 在你的项目半路出现会怎样——这种思维震颤，只有读到这一句才会感受到。

## 2030

2030 年是什么概念？

不到四年。

Hassabis 对 AGI 的**到达**非常笃定——2030 年左右。但他对 AGI 的**路径**判断是 50/50。这意味着他相信终点会到，但不确定中间要摔在什么坑里。

一个 4 岁开始下棋、13 岁全球排名第二的人。一个 17 岁写游戏、20 多岁拿神经科学博士、30 多岁造出 AlphaGo、40 多岁拿诺贝尔奖的人。2026 年 4 月在旧金山，面对全屋全球最有野心的一批创业者，说的是：

**大概一半概率，还需要一两个我还没想到的东西。**

画饼的人什么都确定。真正做东西的人三天两头撞墙——区别在于撞完墙之后的判断，是"工具不够好"，还是"我们思路得推翻重来"。

Hassabis 不需要给任何人画饼。他手里的 AlphaGo、AlphaFold、Gemini，够他安安静静做事做到 2030 年。

而这种 50/50 的姿态，本身就是他说的那句话的最好注脚：**你可以外包思考，但没法外包理解。You can outsource your thinking — but you can't outsource your understanding.**

***

你平时用 AI 工具的时候，有没有碰到那种「它能干出极其复杂的东西，但在一个你觉得理所当然的事情上翻了车」的瞬间？是在什么场景下？

## 原文参考

> Garry Tan & Demis Hassabis. **From Vibe Coding to Agentic Engineering — How to Build the Future S2**. Y Combinator, Apr 2026.
> <https://youtu.be/JNyuX1zoOgU?si=Tb-2ZXa71hiFLhq3>
