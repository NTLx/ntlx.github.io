---
$schema: starlight
title: 让 AI 写代码不再翻车：一个 TypeScript 巫师的 5 个 Agent Skills
description: TypeScript 社区「巫师」Matt Pocock 总结的 5 个 Agent Skills，用工程纪律约束 AI 编码行为，解决「AI 写得快但质量差」的核心矛盾。
date: 2026-05-05
tags: [ write, AI, agent-skills, 工程实践 ]
identifier: 20260505T155727
author: 李继刚
---

你对 AI 说：「帮我加个文件上传，支持拖拽和进度条。」

三分钟后它交差了。代码能跑。但没有断点续传，没有格式校验，没有大小限制，上传失败后整个页面白屏。

你改了又改，越改越乱。最后干脆重写。

你不是一个人在经历这个。

![模糊需求变成混乱代码](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-05-agent-skills-img-01.png)

## 问题不在模型，在纪律

有个叫 Matt Pocock 的人把这事想透了。

你可能不认识他，但你大概率用过他的东西。他是 TypeScript 社区叫「巫师」的那个人——不是自封的，社区这么叫。前 Vercel 工程师（就是 Next.js 背后那家公司），XState 核心团队成员，Total TypeScript 课程创始人，newsletter 有将近六万订阅者。

他不是 AI 研究员。不是 prompt 工程师。是一个写了十年代码、带过团队、维护过大型开源项目的人。

所以他看 AI 编程的视角不一样。

他不问「怎么让 AI 更聪明」。他问的是：「为什么一个经验丰富的工程师，用 AI 写出来的代码反而越来越烂？」

他的答案很直接：

**你把 AI 当许愿池，但它需要的是一套入职培训。**

## AI 有一个你经常忽略的缺陷

它会写代码。但它没有记忆。

每一次新对话，AI 都是一个克隆人——拥有全部编程知识，但不记得你昨天说了什么，不记得上周你们讨论过为什么不用 Redis，不记得这个项目里「service」指的是业务逻辑层而不是数据访问层。

Matt 的原话：你随时可以部署一批中等水平的工程师，但他们有一个致命缺陷——没有记忆。

这意味着什么？

意味着你需要一套不依赖记忆的流程。每一次对话都能独立运转的纪律。

所以他把自己 .claude 目录里的 21 个技能开源了。三天 23000 star，登顶 GitHub Trending 第一，最终超过 55000 star。

不是因为他会营销。是因为每个用过的人都说：这东西治好了我的 AI 焦虑。

我挑了他每天都在用的 5 个，逐一拆解。

## /grill-me：让 AI 反过来审问你

这是 Matt 最喜欢的 skill。只有三句话。

> Interview me relentlessly about every aspect of this plan until we reach a shared understanding.

翻译过来： relentless 地追问我，直到我们真正理解彼此。

听起来反着来。通常是你在问 AI，现在让 AI 问你？

但你想想自己踩过的坑。你说「加个搜索功能」——你心里想的是带自动补全、模糊匹配、历史记录的高级搜索。AI 理解的是一个文本框加一个 `filter()`。它没做错，你们只是说的不是一回事。

Eric Evans 在《领域驱动设计》里写过这个张力：开发者和业务专家说的是同一种语言里的不同方言。

/grill-me 解决的正是这个。它会让 AI 像设计师走设计树一样，把每个分支都问到底。选高级搜索？那筛选项有哪些？排序方式呢？空结果页长什么样？

Matt 说一次普通的功能讨论能问出 16 个问题。复杂的功能，三四十个。

![设计树分支图](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-05-agent-skills-img-02.png)

**类比**：你去理发只说「剪短一点」——最后一定不满意。好理发师会问：短到什么程度？两侧怎么收？平时怎么打理？/grill-me 就是让 AI 当那个好理发师。

## /to-prd：把聊天记录变成需求文档

对齐之后，别急着写代码。先把理解固化下来。

/to-prd 让 AI 生成一份产品需求文档，包含用户故事、模块设计和关键决策。然后直接提交为 GitHub Issue。

这看起来很「重」。一行代码还没写呢，先写文档？

但你想一想：如果没有这份文档，下一轮对话 AI 又失忆了。你得从头解释一遍。再下一轮，又解释一遍。每次都有微小偏差。三次之后，项目已经不是你最初想的样子了。

PRD 不是官僚。它是 AI 的「上次我们说到哪」。

**类比**：装修房子。你跟师傅口头说了三天，他每天按自己的理解干一点。一周后你去看——跟你想要的完全不是一回事。如果你第一天画了一张图贴在墙上呢？

/to-prd 就是那张贴在墙上的图。

![PRD文档作为锚点](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-05-agent-skills-img-03.png)

## /to-issues：把目的地拆成路线图

PRD 描述了你要去哪。但你需要的是怎么去。

/to-issues 把 PRD 拆成一个个独立的 issue，每个都是一条「垂直切片」——从用户界面一路穿透到数据库，而不是先把所有 API 写完再写前端。

它还自动建立任务之间的阻塞关系。哪些可以并行，哪些必须等前面完成，一目了然。

![垂直切片 vs 水平分层](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-05-agent-skills-img-04.png)

如果你用多 agent 并行工作流，这个 skill 直接让你的团队可以分工。

**类比**：你要做一桌菜。PRD 告诉你菜单上有什么。/to-issues 帮你排好顺序：先炖汤（因为它最慢），同时切菜，汤快好了再炒菜。而不是先把所有菜切完再开火。

## /tdd：让 AI 自己检查自己

这是 Matt 认为「最稳定有效」的提升代码质量的方法。

测试驱动开发。红-绿-重构循环：

1. 先写一个失败的测试（红）
2. 写代码让它通过（绿）
3. 看看能不能改得更干净（重构）
4. 回到第一步

![TDD 红绿重构循环](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-05-agent-skills-img-05.png)

为什么要让 AI 先写测试？

因为测试是 AI 给自己的反馈循环。没有反馈的 AI 就像闭着眼睛射箭——它不知道自己偏了。有了测试，每支箭射出后它都能看到落点，然后自己调整。

而且测试一旦写出来就留在那里。下次 AI 失忆了，测试还在。跑一遍，就知道有没有破坏已有的功能。

**类比**：学生做题。只看书不练习，考场上一定翻车。先做题、对答案、纠错——这个循环走多了，水平自然上去。/tdd 就是让 AI 给自己出题、自己做、自己改。

## /improve-codebase-architecture：让代码对 AI 友好

这个 skill 每周跑一次就够了。

它会扫描你的代码库，找出这些地方：

* 理解一个概念需要在五六个小文件之间跳来跳去
* 纯函数被单独拆出来只是为了好测试，但真正的 bug 藏在它们被调用的方式里
* 两个紧耦合的模块，改一个必破另一个

然后它提出「深化」建议——把浅模块变成深模块。

这里有个关键认知：**垃圾代码库里，AI 只会产出垃圾。**

不是 AI 笨。是它在垃圾代码库里找不到对的路。就像你把一个优秀工程师扔进一个没有命名规范、没有分层、到处是全局变量的项目，他也需要两周才能进入状态。AI 只不过把这个过程放大了。

所以你要定期整理代码库，让它对 AI 友好。受益的是你自己。

**类比**：你的工作台。上面堆满工具、零件、半成品的东西——找个螺丝刀要翻十分钟。每周花半小时收拾一下，下次干活效率高得多。

## 怎么用，现在就开始

一行命令：

```
npx skills@latest add mattpocock/skills
```

它会让你选要装哪些 skill，装到哪个 agent 上。记得选 `/setup-matt-pocock-skills`。

然后运行：

```
/setup-matt-pocock-skills
```

它会问你几个问题：用什么 issue 追踪器（GitHub、Linear 还是本地文件），你怎么标记优先级，文档放哪。三分钟搞定。

之后每次有新功能要写，先跑 `/grill-me`。对齐完了跑 `/to-prd`。拆成 issue 跑 `/to-issues`。开始写代码开 `/tdd`。每周跑一次 `/improve-codebase-architecture`。

就这样。

不需要学新语言。不需要换工具。不需要改变你的编辑器主题。

需要的只是承认一件事：AI 不是许愿池。它是一个没有记忆但极其勤勉的同事。

你给同事怎么 onboarding，就给它怎么 onboarding。

你希望同事接到任务时先跟你确认理解，就让它先问你。

你希望代码有测试能兜底，就让它先写测试。

你希望代码库干净整洁能让人快速上手，就定期整理。

就这样。没了。

## 原文参考

> Matt Pocock. **5 Agent Skills I Use Every Day**. AI Hero.
> <https://www.aihero.dev/5-agent-skills-i-use-every-day>

> Matt Pocock. **mattpocock/skills: Skills for Real Engineers**. GitHub.
> <https://github.com/mattpocock/skills>
