---
$schema: starlight
title: AI 写代码最缺的，不是模型，而是传感器
description: 读完 Birgitta Böckeler 的新文，我更确定：agent 编码真正缺的不是模型，而是传感器。
date: 2026-05-20
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-20-coding-agent-sensors-img-00-infographic-feedback-stack-summary.png)

我读完 Birgitta Böckeler 这篇《Maintainability sensors for coding agents》，最大的感受不是“又有人在讲 lint 了”，而是另一件事终于被说透了：今天很多团队在 agent 编码里真正缺的，从来不是一个更会写代码的模型，而是一套能让它尽早知道自己写歪了的传感器。

这两年大家谈 AI 编码，常常会把注意力放在能力上。模型会不会多文件修改，会不会自己写测试，会不会调 MCP，会不会一口气提 PR。可一旦真把它放进项目里，麻烦往往不是出在第一下写不出来，而是出在它写出来以后，没有哪根神经立刻把它拽回来。于是函数越长越长，边界越写越糊，改一个小点要动一串文件，最后整个代码库像棉花一样，表面看着蓬松，手一按就陷进去。

Birgitta 这篇文章让我重新意识到，agent 工程里最值钱的能力，也许不是“生成”，而是“感知”。不是把代码吐出来，而是知道什么时候该停，什么时候该改，什么时候只是过了测试但其实已经在给未来埋雷。

## 这篇文章真正提醒我的，不是 ESLint

如果只看标题，你很容易以为这是一篇讲静态分析的文章。确实，她这次主要拿 ESLint 开刀：限制函数长度、文件长度、参数数量、圈复杂度，给 `no-explicit-any` 这种规则补上更适合 agent 理解的提示语，再观察 agent 会怎么自我修正。

但我觉得重点不在这些规则本身。

重点在她把 sensor 这个词摆到了台面上。她不是把 lint 当作“代码规范检查器”，而是把它当成一类反馈器件。agent 每走一步，系统都应该尽量给它可消费的信号，让它不用等到人来 review 才知道自己已经偏了。

这件事一旦换个说法，很多旧东西就突然不旧了。

我们以前看 type check、lint、pre-commit hook、结构规则，常会觉得它们有点烦，有点琐碎，有时还会觉得是给人添堵。可到了 agent 时代，这些东西的角色变了。它们不再只是“约束开发者”的边角料，而是在给一个没有审美、没有组织记忆、也没有羞耻心的执行体装仪表盘。

人写代码的时候，很多反馈其实是内生的。你看到一个 300 行函数会皱眉，改了三个文件还没落地会觉得不对，写到一半会意识到这条路太绕。可 agent 没这种感觉。它不会因为 props 一层层往下传而烦躁，也不会因为边界脏了而坐立不安。它只会继续往前算。

所以，传感器的意义不是锦上添花，而是替代那部分原本靠人类经验、直觉和厌烦感在起作用的东西。

## 传感器这件事，为什么现在突然变重要了

Birgitta 的前一篇文章《Harness engineering for coding agent users》其实已经把框架搭好了。她把 coding agent 的 harness 粗略理解成“模型之外的一整套外层系统”，里面有两类东西：一类是 guides，在行动前给方向；另一类是 sensors，在行动后给反馈。前者像路标，后者像仪表盘和护栏。

这套说法我很认同，因为它把很多今天看起来分散的实践重新连起来了。

为什么越来越多团队开始认真写 `AGENTS.md`、整理 skills、把规范拆进目录、做条件化规则？因为那是在做 guides。为什么又开始把 lint、结构测试、依赖扫描、pre-push hooks 往前移，甚至给 agent 定制 lint message？因为那是在做 sensors。

过去模型不够强的时候，大家更多是在补 feedforward，也就是“尽量把话说清楚”。现在模型能写更多了，问题反而变成“它写得越多，你怎么越早知道它哪里开始坏”。这时候，“反馈突然变得无比重要”就不再是抽象概念，而是每天会不会踩坑的现实问题。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-20-coding-agent-sensors-img-01-comparison-prompt-vs-sensor-control.png)

如果把我的读后感先压成一张图，我更愿意用上面这张对比来看它：左边是只靠 prompt 狂奔的 agent，右边是一路被 type、lint、test、结构规则和 CI 拉回来的 agent。很多团队现在出问题，不是没配工具，而是把这些工具全当成孤立插件看，没有把它们串成一条连续的反馈链。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-20-coding-agent-sensors-img-02-original-sensor-overview.png)

而 Birgitta 原文那张总览图更像一张工程布置图。它把 sensor 放在 coding session、pipeline、周期性检查和运行时反馈这几层，让“反馈系统”这件事从抽象理念落到了具体部署位置上。

这也是为什么我觉得这篇文章比表面上更重要。它不是在说“静态分析很好，请大家使用静态分析”。它在说，agent 时代的软件工程，正在从 prompt engineering 的兴奋期，转向 control engineering 的清醒期。你不再只问“怎么让它会做”，你开始问“怎么让它做错时尽快暴露，而且暴露成它自己能修的形式”。

这两个问题，不是一个层级上的。

## 真正稀缺的，不是规则，而是能自我纠偏的反馈

Birgitta 文里最打动我的一个细节，是她没有停在“开规则”这一步，而是继续做了 custom ESLint formatter，去改默认 lint message。

这看起来像个小技术动作，其实很关键。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-20-coding-agent-sensors-img-03-original-application-architecture.png)

而且别忘了，她不是在空谈。她拿来做实验的是一个内部 analytics dashboard，前端是 TypeScript、NextJS、React，后端要拼多个 API。原文那张应用结构图其实很说明问题：这不是拿一个 todo app 来论证抽象方法，而是在一个已经有服务层、有外部依赖、有前后端接口的真实应用里，观察 agent 怎样被这些 signals 一点点拉回正轨。

默认 lint message 是写给人的。它假设你知道项目上下文，知道哪些地方该较真，哪些地方可以例外，也知道什么时候该 suppress、什么时候该重构。可 agent 不知道。你给它一句抽象的规则，它可能机械遵守，也可能机械绕开，最后两种都把代码带偏。

所以她干脆把 message 改写成适合 agent 消化的自我修正提示。比如 `no-explicit-any`，不是简单说“禁止 any”，而是告诉它：关键概念要有类型，但也别为了看起来规范就制造无意义类型噪音；如果你决定不写类型，那就带理由 suppress。这个变化非常有意思，因为它把原本面向人的工具，变成了面向 agent 的反馈介面。

我觉得这才是这一波工程实践里最值得学的地方。

不是“规则越多越好”，而是“反馈越可执行越好”。

不是“把所有东西都自动化”，而是“把真正会反复出现的错误，尽量变成 agent 看得懂、改得动、改完还能再验证一次的回路”。

这背后其实是一种很朴素的工程判断：系统不是靠一次把话说对来稳定的，系统是靠持续纠偏来稳定的。对人是这样，对 agent 更是这样。

## 这不是 Birgitta 一个人的癖好，而是一条正在长出来的共识

如果这只是 martinfowler.com 上的一篇个人观察，意义还没那么大。可把外围材料一起看，你会发现这条线在 2026 年已经越来越清楚了。

先看作者本人。Birgitta 不是偶然写了这一篇。她这一年连续在讲 harness engineering、AI-assisted delivery、coding agents 的治理问题，从 Martin Fowler 文章、Thoughtworks Podcast，到 YouTube 对谈、QCon 演讲，基本都在围着同一个核心打转：让 agent 更有生产力，并不等于把控制交出去；恰恰相反，是要把控制系统做得更显式。

再看 Stripe。Stripe 在今年二月那篇讲 minions 的文章里，说他们每周已经有超过一千个 merged PR 是完全由 unattended coding agents 生成的。这个数字足够说明他们不是在试玩玩具。但最值得注意的不是数字，而是他们怎么控风险。

他们的做法很硬核，也很老派：隔离 devbox，预热环境，本地快速 lint，push 前尽量把能发现的问题都发现掉，只有本地过了才进更贵的 CI，而且 CI 最多两轮。说白了，他们没有把希望寄托在 agent “自己会越来越懂事”上，而是用一层层 deterministic 流程去卡住它。文章里那句 “shift feedback left”，我觉得几乎就是对 Birgitta 这篇 sensor 文章的工业化注脚。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-20-coding-agent-sensors-img-04-framework-shift-left-feedback-economics.png)

如果我把 Stripe 那套做法也压成一张图，我更愿意强调的不是“流程更复杂”，而是“回路要更短”。越靠近任务起点的反馈，修复越便宜，影响面越小；拖到 CI、集成后甚至线上才暴露，成本就会一层层抬上去。

再看 Factory-AI 的 eslint 插件。这个仓库 star 不算夸张，但方向很明确：不是在做一套通用的代码风格规范，而是在展示 agent-native 团队会怎样把文件组织、测试共置、结构化日志、路由约束这些东西编码成 lint rules。更有意思的是，它 README 明说，不建议你整个拿来照搬，而是应该把规则思想带走，按自己的代码库重做。这也很说明问题。今天最重要的已经不是“有没有最佳实践包”，而是你的反馈系统能不能贴合你的项目。

放在一起看，信号很一致。

大家都在从不同入口走向同一个结论：agent 的上限当然和模型有关，但它在团队里的可用性，越来越取决于外面的 guides、sensors、hooks、tests、review loops 到底搭得怎么样。

## 旧软件工程没有过时，它只是换了服务对象

我读这篇文章时一直在想，为什么这些内容会让我有一种熟悉感。后来反应过来，因为它本质上还是软件工程，只是服务对象变了。

以前这些约束是为了帮人协作。现在这些约束也在帮 agent 协作。

以前我们写 lint、写类型、做结构测试，是为了减少团队里不同人之间的理解偏差。现在 agent 进来了，偏差更大了，速度也更快了，于是这些东西反而更像基础设施了。它们不是保守，不是“对新东西不够开放”，而是团队在为更高吞吐量补一套不会塌的骨架。

这也是我越来越不相信一种说法的原因：有些人会觉得模型再强一点，很多工程约束就不重要了。反正上下文够长，推理够强，代码乱一点也能搞定。

我对这件事的判断正好相反。

模型越强，生成速度越快，能改的范围越大，越需要早期信号。因为它一旦偏，不是偏一个函数，而是可能偏一整个变更链。没有传感器时，强模型不是让问题消失，而是让问题更快跨过人还没来得及反应的那段距离。

从这个角度看，agent 时代最不应该被丢掉的，恰好是那些原本就擅长做早期反馈的老工具。

## 当然，传感器也救不了一切

Birgitta 自己其实写得很克制。她没有把 static analysis 吹成万能药，反而很明确地说了边界。

第一，很多更语义化的质量问题，lint 就是抓不到。你可以限制复杂度，抓不到误判需求；你可以限制文件长度，抓不到“明明能做简单方案却非要上复杂抽象”；你可以跑测试覆盖率，抓不到测试本身理解错了业务。这些地方，sensor 最多提供一点辅助，不会替代人对问题本身的判断。

第二，signal 太多也会出问题。她担心 agent 陷入 feedback overload，开始为了消除告警去做一串过度工程化的重构。我很认同这一点。没有经过筛选的反馈，不叫治理，叫噪音。不是每一个能测量的东西，都值得塞进回路里。

第三，规则之间会互相打架。文章里她提到一个很真实的例子：前端组件在 `max-lines` 和 `max-lines-per-function` 的压力下被越拆越细，结果 props 传递链变长。这种 trade-off 不是多开一条规则能解决的，反而要求你对项目的局部最优和整体最优有更高层次的判断。

所以如果我要把这篇文章压缩成一句最实在的话，它不会是“多配几条 lint”。而是：

别幻想一套规则能替你搞定 agent。你真正要建设的是一套反馈经济学。什么信号值得早点给，什么信号应该便宜地给，什么信号必须写成 agent 能改的格式，什么信号宁可留给人来判断。这才是关键。

## 我现在更愿意把 agent 当成一台高速机器，而不是一个聪明同事

这可能是我读完以后最大的心态变化。

我以前也会不自觉地把 agent 拟人化。它写得像回事，我就默认它多少“懂了”；它能跨文件改动，我就默认它心里有了结构；它通过了测试，我就默认它大致靠谱。可你认真看 Birgitta、Stripe 这些一线实践，会越来越难维持这种幻觉。

更准确的看法也许是：agent 是一台吞吐量很高、试错成本很低、但天然缺少自我约束感的机器。对这种机器，最重要的不是鼓励，而是测量；不是崇拜，而是校准；不是期待它自己变成熟，而是给它一套成熟环境。

这也是为什么我会觉得“传感器”这个词很好。

它比“规范”更动态，比“最佳实践”更工程，比“提示词技巧”更诚实。它承认系统会漂，会偏，会误判；也承认真正可靠的办法不是一次讲对，而是持续感知、持续纠偏、持续把反馈往前推。

我读完这篇文章后最强烈的想法，是很多团队也许不该再问“我们要不要上 agent”，而该先问一句更难也更实在的话：

如果它从今天开始一天帮你改二十处代码，你手里到底有没有足够多、足够早、足够便宜的传感器，能让你在代码库变软之前就察觉到？

*你现在最依赖哪类 feedback loop 来约束 AI 写代码？是测试、lint、code review，还是你们自己做的一层 agent harness？*

## 原文参考

> Birgitta Böckeler. Maintainability sensors for coding agents.
> <https://martinfowler.com/articles/sensors-for-coding-agents.html>

> Birgitta Böckeler. Harness engineering for coding agent users.
> <https://martinfowler.com/articles/harness-engineering.html>

> Birgitta Böckeler. Publications.
> <https://birgitta.info>

> Martin Fowler. About Martin Fowler.
> <https://martinfowler.com/aboutMe.html>

> Alistair Gray. Minions: Stripe’s one-shot, end-to-end coding agents.
> <https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents>

> Factory-AI. eslint-plugin.
> <https://github.com/Factory-AI/eslint-plugin>
