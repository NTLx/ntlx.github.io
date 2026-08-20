---
$schema: starlight
title: “周末搓出个 App”不叫软件工程：Thoughtworks CTO 谈 AI 时代的价值大位移
description: 组织从来不是靠代码运转的，而是靠信任运转。当 AI 让任何人都能在周末敲出功能，软件工程的稀缺性便彻底从“写代码的手”转向了“决定系统能否安全活在生产环境里的判断力”。
date: 2026-08-20
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-20-citizens-agents-experts-software-engineering-img-00-infographic-core-summary.png)

## 过去半年，技术界自己挖下的“认知深坑”

最近半年，很多技术负责人大概都经历过类似的对话。

一位业务主管或者非技术背景的高管，兴冲冲地展示他们用 AI 辅助工具在周末做出的成果：可能是一个能走通全流程的客服小工具，可能是一套报表自动化，甚至是一个界面相当像样、能解决实际问题的小应用。

兴奋之余，他们往往会自然而然地问一句：

> “既然 AI 已经能让我在两天内把应用做出来，为什么工程团队交付新需求的速度，没有提速十倍？”

面对这个问题，工程师的第一反应通常是苦笑。心里想的是“你不知道把东西做到能进生产环境有多麻烦”，但话到嘴边，又很难在不显得居高临下的前提下解释清楚。

Thoughtworks CTO Rachel Laycock 在 Martin Fowler 网站的专栏里直接点破了这个僵局：**这其实不是技术代差的问题，而是大家对「软件工程」的理解早就脱节了。更讽刺的是，这个坑是技术行业过去几十年自己挖下的。**

多年来，技术团队一直在不遗余力地对外普及“如何写出好代码”、“如何快速编写软件”。时间一长，外界自然产生了一种直觉：**写代码（Writing software）就等于做软件工程（Software engineering）。**

但这两者从来不是一回事。非技术人员在周末用 AI 攒出来的应用确实是真实的软件，它能跑通逻辑，也能验证想法。但这与把一套系统接入受监管、要面对海量并发和长期故障的企业生产环境相比，完全是两个维度的挑战。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-20-citizens-agents-experts-software-engineering-img-01-production_iceberg.png)

## 水面下的冰山：从能跑的 Demo 到活着跑的生产系统

写出自己的第一个 “Hello World” 时，大家关心的只有功能能不能跑通。但一旦一个应用要真正承担业务运转，衡量的标准就会彻底改变。

Rachel Laycock 列出了六个在任何演示 Demo 里几乎不会出现、却决定企业生死的底层问题：

1. **客户数据保护**：用户隐私和敏感数据在存储与调用中是否严格隔离？能否经受住数据合规审查？
2. **下游依赖断裂**：当下游第三方 API 或依赖库发生故障、断网或超时时，系统会不会雪崩？有没有熔断和优雅降级？
3. **长期可维护性**：两年后，当最初写这段代码的人离开、业务上下文遗失时，其他人能不能读懂并安全维护这套系统？
4. **合规与审计存活**：系统能否经受住外部审计机构对操作日志、数据溯源和变更记录的层层抽查？
5. **极端流量伸缩**：从目前的十几个内部用户，激增到上千个甚至突发百万级访问时，架构会不会瞬间瘫痪？
6. **主动可观测性**：在真实客户发现故障并投诉之前，监控体系能不能提前察觉异常并完成告警或自愈？

这些问题在原型阶段几乎是隐形的。如果现场没有一位资深工程师，大家往往只会沉浸在功能做成的兴奋里。

我自己之前在搭自动化任务流水线时也有类似体会：让 AI 在几分钟内生成几十行看似完美的调用逻辑很容易，但真正花掉大半天时间的，永远是在给那些模型漏掉的脏数据容错、处理鉴权令牌过期重试、解决并发写冲突以及网络抖动下的幂等保障。

**写出能跑的代码往往只占 20%，剩下 80% 的工作量，都是为了让它在充满意外的真实环境里活下去。**

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-20-citizens-agents-experts-software-engineering-img-02-scarcity_transition.png)

## 稀缺性大位移：组织不靠代码运转，靠信任运转

在 Martin Fowler 和 Thoughtworks 组织的 FOSE（Future of Software Engineering）闭门研讨会上，一个引人深思的细节是：参与讨论的资深架构师们，几乎不再讨论具体的编码技巧。

大家真正花时间推敲的，是代码是否依然是单一事实源、系统规格（Specification）的设计、平台治理，以及最核心的资产：**工程判断力（Engineering Judgement）**。

有团队分享了他们的实际做法：人类工程师在白天推敲规格设计、业务边界与系统契约；夜间交给 AI 智能体并发编写代码并补充自动化测试；第二天清晨，工程师再对生成结果进行审视与验收。

这个流程里最核心的价值，不是夜间那套自动运行的流水线，而是人类在白天做的事情：**定义什么是“好”、在取舍中做决策，以及判断智能体返回的结果到底能不能放心用。**

这促使我们重新审视软件行业的“稀缺性”。

过去几十年，企业一直在围绕“能写代码的人”做资源配置，因为当时把想法翻译成代码是昂贵且稀缺的手艺。但在 AI 时代，代码生产的边际成本正在不可逆地归零。

正如我们在探讨 [Simon Willison 论代码成本归零](https://ntlx.github.io/articles/simon-willison-ai-software-development) 时注意到的，当代码生成变得极快极廉价，良好的系统设计不仅没有贬值，反而更重要了。

因为：**企业组织从来不是靠代码运转的，而是靠信任运转（Organisations don't run on code. They run on trust）。**

软件生来不是为了“被写出来”，而是为了在生产环境里安全、可靠地解决问题。当写代码不再稀缺，真正稀缺的是判断系统风险在哪、懂得何时踩刹车、并能对线上稳定性负责的工程判断力。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-20-citizens-agents-experts-software-engineering-img-03-governance_leverage.png)

## 三层新秩序：Citizens 建，Agents 跑，Experts 控

基于这个判断，Rachel Laycock 总结了一个清晰的协作模型：

> **Citizens build. Agents execute. Experts govern.**  
> （业务人员构建，智能体来执行，专家负责治理。）

这并不是简单的头衔划分，而是研发价值链的重构：

- **Citizens Build**：非技术人员获得了直接表达创意的能力。他们熟悉业务痛点，不再需要经过繁琐的需求层层转述，就能直接把想法变成原型。
- **Agents Execute**：AI 智能体接管了高强度的执行动作。写代码、补测试、做重构、排查语法错误，以极高的速度完成迭代。
- **Experts Govern**：资深工程师的价值被大幅放大。他们不再需要把时间花在重复写基础 CRUD 上，而是转向定义系统环境与运行规则。

这里需要警惕一种危险的反模式：**“专家治理”绝不是让资深工程师沦为给业务人员和 AI “擦屁股”的人肉代码审查员。**

如果只是让非技术人员随意拼装代码，再一股脑扔给工程师去手工修漏洞，技术团队会迅速被庞杂的垃圾代码拖垮。

正如 Palantir 在其[运维责任宣言](https://ntlx.github.io/articles/palantir-operational-responsibility)中所强调的，专家真正的治理杠杆在于基础设施化：

1. **设计工程护栏（Guardrails）**：通过静态分析、合规沙箱与自动化门禁，让低质或危险代码在流水线阶段被自动拦截。
2. **铺设平台黄金之路（Golden Paths）**：沉淀标准化的基础组件、鉴权模块和可观测性底座，让大家在预设的安全通道内自由搭建。
3. **建立自愈与反馈机制**：通过完善的运行时监控与容灾设计，确保个别模块出现问题时不会引发生态级的连锁崩溃。

## 未来的软件组织：让创造力在安全轨道上释放

回到最初的那个困惑：高管和工程师之所以会有认知分歧，是因为他们各自看到了硬币的一面。

高管看到的是人人都能做软件的生产力解放；工程师看到的是系统上线后必须有人兜底的现实代价。两者都没错，只是关注了同一系统的不同部分。

未来的软件组织，既不会要求人人都去学深度编程，也不会让专业工程师消失。

更健康的状态是：业务人员借助 AI 快速验证想法，智能体承担繁重的编码与重构，而资深工程师通过平台工程和架构治理，为整座系统的敏捷创新铺设安全的轨道。

当敲代码的手不再稀缺，能决定系统在暴风雨中平稳前行的，永远是那份看清本质的工程判断力。

*你在日常工作中是否遇到过“业务觉得 AI 能秒出 Demo，为什么团队交付还是慢”的困惑？在你看来，资深工程师最重要的不可替代能力是什么？欢迎在评论区聊聊你的观察。*

## 参考资料

- [Citizens Build, Agents Execute, Experts Govern — Rachel Laycock (martinfowler.com)](https://martinfowler.com/rachels-ramblings/citizens-agents-experts.html)
- [The Conductor Developer — Rachel Laycock (martinfowler.com)](https://martinfowler.com/rachels-ramblings/conductor-developer.html)
- [Future of Software Development (FOSE) — Martin Fowler](https://martinfowler.com/bliki/FutureOfSoftwareDevelopment.html)
- [Is High Quality Software Worth the Cost? — Martin Fowler](https://martinfowler.com/articles/is-quality-worth-cost.html)
- [Thoughtworks Technology Radar Volume 30 — Thoughtworks](https://www.thoughtworks.com/radar)

## 延伸阅读

- [当写代码的成本无限趋近于零，软件工程最昂贵的壁垒变成了「理解」与「克制」](https://ntlx.github.io/articles/simon-willison-ai-software-development)
- [所有软件终将病于中介：解读 Palantir 的「运维责任」硬核宣言](https://ntlx.github.io/articles/palantir-operational-responsibility)
- [循环交出控制权之后：读 ByteByteGo《The Agent Loop》](https://ntlx.github.io/articles/agent-loop-reading-bytebytego)
- [别被 CoT 的“思考”骗了：为什么 Palantir 认为大模型可解释性在模型之外？](https://ntlx.github.io/articles/palantir-black-box-llm-explainability)
