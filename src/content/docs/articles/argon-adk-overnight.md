---
$schema: starlight
title: 让 Gemini 改了一夜代码，Google 早晨删掉了什么
description: 无人值守的优化任务，值得交回的是一份有证据、可取舍的改动；跑得久、测得绿，都不能替维护者决定该留下什么。
date: 2026-10-25
category: ai-coding
primarySourceUrls: ["https://developers.googleblog.com/optimizing-a-200000-line-python-codebase-overnight-with-gemini-4-argon/"]
---

早晨打开一个跑了一夜的编码 Agent，看到六项性能优化，你会先看哪一项？

我读完 [Google 这篇 Gemini 4 Argon 实战记录](https://developers.googleblog.com/optimizing-a-200000-line-python-codebase-overnight-with-gemini-4-argon/)，最想细看的，是被删掉的四项。

这次任务的对象是 Google 的 Python Agent 开发框架 ADK，仓库约有二十万行代码。Argon 无人值守运行了约十一小时，找到的改法有些确实有效。维护者最终保留了会话复制和延迟导入，把其余方案从提交中拿掉。

这份交付值得看。但值在哪里，我更想听早晨接手改动的人怎么说。

![过夜优化任务的阅读提要](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-25-argon-adk-overnight-00-infographic-core-summary.png)

## 快了，也可以不合并

被拒绝的事件缓存，曾让合成基准快了 17%。问题出在对象身份与缓存有效性的关系上：Python 垃圾回收后可能复用内存地址，方案依赖的弱引用处理可能让另一个会话读到陈旧数据。

这类改动很容易让人犹豫。眼前有一条好看的性能曲线，潜在错误却需要特定生命周期才会暴露。真合进去，以后排查偶发会话串数据的成本，很难放进今天的基准表。

另外几项也各有拒绝理由。遥测判断读取了 OpenTelemetry 实现里的私有属性，把稳定性押在依赖库的内部细节上；会话历史格式化的改写增加了阅读难度，却没改善独立基准的端到端耗时；工作流回放索引引入了额外状态维护，收益局限于合成回放测试。

它们未必毫无技术巧思。但维护者要接下的，是改动连同它以后的维护账单。

![Google 原文图4：保留会话复制与懒导入，拒绝另外四项方案](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-25-argon-adk-overnight-01-comparison-source-selection.png)

留下来的会话优化就比较容易解释：读取内存会话时，先筛出调用者需要的事件，再复制；只列会话、不返回事件时，就别先把事件也复制一遍。配套的快速复制器还得处理循环、共享引用和测试替身。另一项是把重依赖的导入延后到使用时，同时保留外部代码能访问和替换的模块属性。

这些细节在[最终提交](https://github.com/google/adk-python/commit/1754b3eeb6cdb2c16e3b30619a12066623df132e)里能看到。改动既包含省掉不必要工作的部分，也包含为了保持行为而补回的复杂性。

读到这里，我对“让 Agent 自主探索”的期待变得更具体了：允许它提出候选方案，也允许审阅者有充分理由把方案扔掉。把六留二换算成所谓成功率，反而会丢掉这次协作里有用的部分。

## 四成的收益，分母要写清

这篇文章最容易在转述中变形的数字，是“约 40%”。

Google 报告的是特定长会话中，使用 `InMemorySessionService` 时，发起模型请求前的框架开销下降。最终提交的基准表写得很具体：已有 50 轮历史时，从 64 毫秒降到 36 毫秒；已有 150 轮时，从 200 毫秒降到 122 毫秒。这两项测量关闭了 Python 垃圾回收。

这不是用户拿到完整回答的耗时。测试里的模型和工具即时返回，目的是隔离 ADK 自身的开销。换成真实模型和外部工具，节省的这些时间在总耗时里占多少，要看实际负载。

完整的 158 轮测试从 65.6 秒降到 56.1 秒，耗时约少了 14%。它同样是上述即时模型、即时工具条件下的结果。这里的轮次也别直接理解为用户发了多少条消息：原文区分了用户的一次完整调用，与内部工具调用等步骤。

还有一组更值得一起读的数据：`import google.adk` 从 1.22 秒降到 0.97 秒，约快 21%；新进程启动到首次模型请求却从 3.07 秒变成 3.09 秒，基本持平。延后的模块，到首次用上时仍然要加载。只看导入时间，会误以为冷启动体验也同幅度改善了。

![Google 原文图5：五项独立基准及实验条件，模型与工具即时返回](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-25-argon-adk-overnight-02-infographic-source-benchmarks.png)

外部数据库、SQLite 等会话后端，也不能直接套用内存复制的收益。它们从存储反序列化，走的并非同一条读取路径。

我没有复现这套基准，引用的是 Google 的文章与公开提交。它让我更愿意在审性能 PR 时追问：究竟省掉了哪段工作，谁会用到这段路径，以及代价有没有挪到别处。数字的分母写完整，优化才有讨论的起点。

## 仓库规则解决交接，不能包办验收

原文做了两轮尝试。第一轮没有定制仓库说明，也找到了性能瓶颈；但它改动了公开 JSON schema，遗漏 mock 事件边界，只跑了附近的 216 项测试，PR 描述也没交代基准数字。

第二轮加入了仓库维护规则、Antigravity 的 `/goal`，还把交付要求补成了带前后对照数据的未合并 PR。运行时间也更长。

这些因素一起变了，所以我不会把前后差异归结成“装上 Skills，模型就懂工程了”。它更像一个交接设计：把过去需要维护者临时提醒的事情，提前写到 Agent 能找到的地方。

![Google 原文图2：两轮运行的规则、时长、验证和交付差异](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-25-argon-adk-overnight-03-comparison-source-rounds.png)

我打开了 ADK 的[实际规则目录](https://github.com/google/adk-python/tree/main/.agents/skills)。内容并不玄妙：新模块默认用下划线前缀，内部实现别无意间成为公开接口；常用入口不要提前加载可选依赖；延迟导入要有相应检查。短的 `SKILL.md` 再把任务引向具体参考文件。

此前写过的[Google Agent Skills 构建与治理](https://ntlx.github.io/articles/google-agent-skills-behind-the-scenes)，讨论过怎样把工程知识交给 Agent。这次 ADK 案例补上了一个具体用途：说明哪些地方即使看起来只是实现细节，也不能随手改。

`/goal` 则解决执行的持续性。[官方说明](https://antigravity.google/docs/commands/goal)描述了它如何拦截过早停止，提醒 Agent 对照原始任务，用文件、测试和构建结果确认交付。它改变的是停止行为，工具权限仍受原有规则约束。

规则和持续执行都没有覆盖所有问题。按原文记述，第二轮删除几个内部 flow 的模块级导入后，16,892 项公开单测全过，Google 内部却有 25 个测试目标失败：它们恰好在原来的模块位置替换那些属性。最终方案用懒加载访问器保留了这些替换位置。

看到这里，即使测试全绿，我也还想多问一句：有没有漏掉别人的用法？维护者知道的一些依赖关系，在公开仓库里未必看得到，审阅时得把它们补回来。

## 过夜任务，应该怎样交回来

原文还安排了一个重要的验收条件：团队事先写了没有展示给 Argon 的独立基准，并检查优化前后发给模型的请求逐字节相同。

这给了我一个比“请自行优化并证明有效”更可信的做法。让执行者寻找瓶颈、设计回归测试；维护者保留另一套验收路径，检查它没为了变快而改变行为，也没只改善自己挑选的样本。

![任务设计建议：执行与独立验收分开，不代表 Google 原始运行流程](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-25-argon-adk-overnight-04-flowchart-independent-acceptance.png)

如果要把这种做法带回自己的仓库，我会先选一个能说清边界的任务。例如减少某条命令的启动开销，并明确公开接口、输出格式和业务结果必须保持一致。交付要求里写清：先记录基线，附上复现方法，开一个待审 PR，说明收益适用的负载；需要新增缓存或索引时，解释状态何时失效，以及独立测量能否支持这份复杂性。

这只是任务设计建议，不保证别的仓库也能得到同样结果。第二天审阅时，除了跑测试，我还会看实际使用路径，并问那些新增机制能否删掉。没有稳定收益、却让核心路径更难理解的方案，先留在实验里也很好。

读完这次记录，我对过夜编码的兴趣反而增加了。模型能替人把探索做得更宽，维护者就有机会从候选方案里挑出值得长期保留的部分。早晨接手时，我想看到的是改动、证据和清楚的取舍理由。至于它昨晚忙了多久，那是理解过程的背景。

## 参考资料

- [Google Developers Blog：Gemini 4 Argon 过夜优化 ADK 的原始记录](https://developers.googleblog.com/optimizing-a-200000-line-python-codebase-overnight-with-gemini-4-argon/)。正文复用图均来自该文，保留原始实验条件。
- [ADK 最终提交及基准表](https://github.com/google/adk-python/commit/1754b3eeb6cdb2c16e3b30619a12066623df132e)。用于核对实际代码与收益口径。
- [ADK 仓库 Skills](https://github.com/google/adk-python/tree/main/.agents/skills) 与 [Antigravity `/goal` 说明](https://antigravity.google/docs/commands/goal)。用于核对规则和持续执行机制。
