---
$schema: starlight
title: AI 做出一个好看的组件，为什么整页还是不对？
description: 读 Railcode 的网站设计记录，我记住的不是让 AI 多出几版，而是把每个想法放回整页里检验。代码代理降低了试错成本，判断仍要由人来做。
date: 2026-10-12
category: ai-coding
primarySourceUrls: ["https://railcode.dev/blog/vibe-coded-website"]
---

我读 [Yakko Majuri 写的 Railcode 网站设计过程](https://railcode.dev/blog/vibe-coded-website)，最有印象的不是最终页面，而是中间那次“看起来挺好，放进去却不对”。

他先做出一段过山车动画，把它放进网页模板。单看这段动画没什么问题，可一放进页面，就像把游乐场设施搬进了办公室大厅：它没有和页面说同一种话。于是他把问题改成“这里需要一座公园”，再让游乐设施成为页面区块之间的过渡。后来又通过并排分支、颜色 playground 和细节迭代，逐渐找到整页的感觉。

我觉得这段过程说中了 AI 辅助设计最实际的变化：代码代理让想法更快变成可以打开的页面，判断也因此有了对象。人不必只对着一句提示猜结果，可以看着页面说，这里太突兀、这块颜色不合适，或者两种方案摆在一起时我更愿意读哪一种。

![文章核心信息图](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-12-vibe-coded-design-attention-00-infographic-core-summary.png)

## 一张好看的局部图，回答不了整页的问题

Railcode 文章里有很多设计版本。早期方案里有 ASCII 过山车，也有很亮眼的霓虹设计；后来作者从这些尝试里拿到新的方向，再转向《RollerCoaster Tycoon》的公园意象。最值得我停下来的，却是那个失败的网页模板：过山车单体已经做出来了，放在页面中央仍然显得莫名其妙。

![原文视频截图：单体过山车放进模板后与页面脱节，来源：Railcode](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-12-vibe-coded-design-attention-01-component-in-page-reference.jpg)

这个例子提醒我，设计判断常常发生在元素之间。颜色和页面背景的关系、插画和产品信息的关系、首屏和下一区块的关系，单独的组件截图都交代不完整。作者接着把过山车扩成景观条；放进页面后的第一版仍显得突兀，继续调整后，才将它接成下一段内容的色彩过渡。我也因此开始关注，过山车怎样成为页面的一部分。

![原文页面截图：景观条放进网页的早期版本，作者认为仍显突兀，来源：Railcode](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-12-vibe-coded-design-attention-02-strip-on-website.jpg)

![原文页面截图：景观条经过调整后融入下一页面区块，来源：Railcode](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-12-vibe-coded-design-attention-03-page-transition-reference.jpg)

我在写代码和搭工具时也会遇到相似的落差：一个脚本单独运行没问题，不代表它放进完整工作流就顺；一个功能做出来了，不代表读者知道什么时候用、出了问题往哪里看。局部正确只能说明一件事能工作，整体是否清楚还需要回到使用场景里检查。

## 原型的价值，是把偏好变成可比较的东西

作者提到，他会先把网站放在一个 HTML 文件里快速试验，等方向比较稳定后才拆成 React 组件。这样做的好处很朴素：复制一个版本，改一两处，再把两版并排打开看。调整颜色时，他还做了 playground，让自己直接切换草地、文字和背景等选项。

我喜欢这里的因果关系。代理并没有替他先想清楚“好看”的标准。它把一些可能的形状做出来，让作者更容易辨认自己的偏好。白色背景不够有趣，换成天蓝色之后，云和绿色区块才慢慢接上；导航条如果固定一种颜色，就像不属于任何区块，于是他又尝试让它随页面滚动改变颜色。每一步都在解决一个看得见的问题。

这让我想到自己读过的[一篇关于 Agent 与产品设计的文章](https://ntlx.github.io/articles/vercel-agent-product-design)：Agent 可以读代码、执行任务，却未必知道用户想完成什么。设计也类似。若没有“这一轮要看什么”的标准，多生成几版只会让人多出一堆候选图；标准逐渐明确之后，生成才会缩短试错过程。

## 让每一轮只回答一个问题

我会把这篇文章里的流程收窄成一个容易复用的办法。先说清当前页面哪里让自己不满意，再决定这一轮只改变什么，接着让代理给出几个差异明显的版本。把结果放进页面真实位置检查，选中一个方向后，再说明为什么保留它。下一轮继续处理新的问题。

比如，先判断景观条该不该独立出现；再判断它是否该接进下一段背景；最后才细调颜色和动画。每一步都能解释本轮比较的对象。保留被舍弃的分支也有帮助，之后回来看，也能知道自己为什么没有选另一条路，而不是重复同一次探索。

当然，这种方法解决不了目标本身不清楚的问题。若没有用户需求、品牌语气或可用性要求作依据，“我更喜欢这个”可以是有效的个人选择，却不能自动代表它更适合所有访问者。作者也特意说，这篇文章不是在证明设计师不再必要。原型能增加尝试的机会，也让选择更可见，但上线之后仍要有人负责一致性、移动端、可访问性和维护成本。

## 我记住的是那次没成功的放置

[Railcode 的网站过程](https://railcode.dev/blog/vibe-coded-website)里，许多原型最终没有留下来。让我信服的不是“AI 也能做出好看的网页”，而是作者愿意展示它们为何没有留下来：单个过山车不适合那张模板，景观条放上页面之后也还显得生硬。页面上的反馈改变了下一步要问的问题。

我最近写过[vibe coding 和 agentic engineering 的边界](https://ntlx.github.io/articles/vibe-coding-agentic-engineering)。两种做法看起来都在“让 AI 写代码”，但我在意的还是人有没有提出目标、筛选结果并承担后续责任。这篇 Railcode 的设计记录让我把这个判断落到更小的尺度：不用先争论自己有没有设计天赋，先把一个具体想法做成可以检查的页面。然后认真看它放进去之后发生了什么。

## 参考资料

- [How our vibe coded website looks like a designer made it — Railcode](https://railcode.dev/blog/vibe-coded-website)
- [RollerCoaster Tycoon — Atari](https://atari.com/pages/rollercoaster-tycoon)
- [Context Store](https://www.context.store/)、[Contextual AI](https://contextual.ai/)、[Clay](https://clay.com)、[Sentry](https://sentry.io)：作者在原文中提到的设计参考网站
