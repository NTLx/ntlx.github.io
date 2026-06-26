---
$schema: starlight
title: 你的 Agent 读得懂代码，读不懂你的产品
description: Agent 能复制你的 UI 风格，但不知道那个按钮为什么放在左边。Vercel 的解法揭示了一个被忽视的真相：产品设计决策如果不编码进仓库，对 agent 就不存在。
date: 2026-06-26
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-26-vercel-agent-product-design-img-00-cover.png)

你的 coding agent 写出了一个按钮。颜色对、圆角对、hover 态也有。但destructive action 的按钮用了"确认"而不是"删除项目"——它从训练数据里学了一个通用模式，而不是从你的代码库里学你的模式。

Vercel 上周发了一篇博客，标题叫 Teaching agents product design at Vercel。它戳到的东西比标题大：agent 能读你的代码，但它读不到你的产品。代码展示的是"发布了什么"，不展示"为什么一个组件、一句文案、一个交互成了你的标准"。那些推理活在 design review 里、PR 评论里、Slack 对话里——以及当事人的脑子里。

对 agent 来说，不在代码库里的上下文等于不存在。

## 代码能教 agent 什么，不能教什么

这是我读完这篇文章第一反应：这不就是我们自己遇到的问题吗？

我们的仓库有 60 多篇博客文章，有严格的 URL 规则、分类白名单、frontmatter schema。Agent 能读到这些规则并遵守。但它读不到"为什么 blog-slug 必须是纯 ASCII kebab-case"——那是因为有一次用了中文路径，CDN 缓存炸了。它也不知道"正文禁止 H1"这个规定背后，是 Starlight 会把 frontmatter title 自动渲染成 h1，出现双标题。

规则本身够用了。但 agent 遇到规则没覆盖的边界情况时，它只能猜。而它猜的方向，往往是训练数据里的"通用最佳实践"，而不是你的产品语境下的正确选择。

Vercel 把这叫做 context gap。我觉得更准确的说法是：**代码是结果的快照，不是推理的录像。**

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-26-vercel-agent-product-design-img-01-code_vs_context_divide.png)

## 三层系统：skill + lint + 证据流

Vercel 的解法不是写一个更长的 AGENTS.md。他们造了一个三个齿轮咬合的系统。

第一个齿轮是 **skill**。不是那种"你好我是 product-design skill 我可以帮你做产品设计"的自我介绍——它是一个有路由逻辑的入口。SKILL.md 先解析请求模式：shape（设计流程）、implement（端到端变更）、review（检查并报告）、copy（只改文案）、harden（修补状态覆盖）。每种模式加载不同的 references，边界划得死死的。一个 "audit" 请求不会变成 "edit"，一个 "fix copy" 不会扩展成 "redesign"。

第二个齿轮是 **linters**。能用代码检查的规则不用 agent 判断。嵌套 modal？禁掉。2-3 个静态选项用了 Select？建议换 Radio。className 覆盖了设计系统组件的颜色？拒绝。Lint 快、便宜、确定，agent 写代码的时候就能拿到反馈。

第三个齿轮是**证据流**。每周从 Slack、Figma、GitHub 收集设计决策的证据，经过 collector（只收集不判断）和 judge（分组验证不改指南）两个角色，最终形成 review packet 交给人类决定：变成规则？变成 example？变成 eval？还是不变更？

**三层缺一不可。** Skill 给 agent 判断力，lint 把确定性规则从 agent 肩上卸下来，证据流保证指南不是死文档。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-26-vercel-agent-product-design-img-02-three_gears_system.png)

## 什么该交给 lint，什么该留给 agent

这里有个决策树，我觉得值得每个用 agent 写代码的团队借鉴。

```
代码能否识别问题？
├── 不能 → 交给 agent 指南
└── 能 → 能否避免误报？
    ├── 不能 → 交给 agent 指南
    └── 能 → 是否有具体修复方案？
        ├── 是 → 写成 lint 规则
        └── 否 → 用 warning 或 agent 指南
```

比如"destructive action 的按钮命名"——需要产品上下文（这个操作的后果是什么、用户心智模型是什么），agent 处理。但"嵌套 modal 会破坏焦点管理"——这是确定性事实，lint 处理。

OTF 的一篇博客补充了一个好的观察：**语义化 token 对 LLM 比 hex 值更有效。** `bg-card` 携带意图——agent 知道这是卡片的背景色。`#1A1816` 不携带任何意义——agent 得记住这是卡片色，它记不住。名字就是上下文。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-26-vercel-agent-product-design-img-03-lint_vs_agent_decision_tree.png)

## 把代码当证据，不当先例

这句话我读了两遍。

"已发布的代码证明了什么存在，不证明什么是正确的。"

这反直觉。我们通常把代码库当权威——"代码就是这么写的"。Vercel 说，不对，代码只是证据。它需要和当前的组件、产品行为、显式指南交叉验证。

这让我想到一个实际问题：agent 做 review 时，它会从现有代码推断"正确做法"。但现有代码里可能有历史包袱、有赶工留下的 hack、有当时正确但现在已经过时的选择。如果 agent 把这些都当先例复制，它不是在帮你维护标准——它在帮你累积技术债。

Vercel 的 product-design skill 在决策权威层级里明确写了六层排序：用户目标 > 验证过的证据 > AGENTS.md > 已接受的决策 > 相邻发布模式 > 通用启发式。**代码（"相邻发布模式"）排在倒数第二。** 上面还有五层更权威的东西。

## 证据流：从 Slack 到指南的活系统

产品设计指南不是一次性文档。组件会换、命名会变、工作流会演化、失败模式会被发现。如果你的指南写完就不动了，三个月后它描述的就不是你的产品了。

Vercel 的做法是建一条从 Slack 到指南的管道，但中间有两道人闸：collector 只收集消息、链接、上下文，不提规则；judge 分组验证证据，不改指南。两道闸保证收集不带偏见、判断不混入原始数据。最终 human reviewer 决定候选变成什么——或者不变成任何东西。

这种"分离收集与判断"的设计，好的代码 review 流程也是这个味道。先理解问题，再下判断。不要在还不了解情况时就急着开处方。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-26-vercel-agent-product-design-img-04-evidence_flow_pipeline.png)

## 对我们自己的启示

读完这篇，两个想法。

第一，我们的 lint 只管代码格式，不管产品设计。我们可以在 lint 层面加一些交互层面的约束吗？比如"所有 destructive action 按钮必须用 Verb + Noun，不允许 Confirm / 确定 / 好的"、"icon button 必须有 accessible name"。这些规则是确定性的，写成 lint 比写在 AGENTS.md 里靠谱——因为 lint 不会被 agent "忘记"。

第二，Vercel 的另一篇博客（2026 年 1 月）发现了一个扎心的数字：**skills 在 56% 的评估中从未被触发。** Agent 有文档，但选择不看。把同样的文档塞进 AGENTS.md，通过率从 53% 跳到 100%。原因很简单：被动上下文不需要 agent 做一个"我要不要查这个"的决策。信息就在那里，它用就是了。

我们仓库也有 .agents/skills/ 体系，也有自建技能的触发逻辑。这个发现值得警惕——你以为 agent 会用的 skill，它可能根本没加载。

Vercel 那个六层决策权威让我重新想了一件事。我们 AGENTS.md 里写了一堆"该做什么"，但"该做"和"为什么做"是两回事。规则给 agent 画了边界——可边界画得再清楚，agent 走到边界之外时靠什么判断？

*你的 agent 走到规则没覆盖的地方，它凭什么做决定？你的"为什么"写在哪里？*

## 原文参考

> Teaching agents product design at Vercel
> John Phamous
> <https://vercel.com/blog/teaching-agents-product-design-at-vercel>
