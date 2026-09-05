---
$schema: starlight
title: Agent 变快之后，真正要工程化的是它的缰绳
description: Agent 越快，越不能把可靠性寄托在它的下一次回答上；真正要工程化的是一套能限制行动、读懂失败、主动停下的工作环境。
date: 2026-09-05
category: ai-agents
primarySourceUrls: ["https://dev.to/googleai/what-is-harness-engineering-and-why-should-i-care-8n0"]
---

如果一个软件产品真的可以由 agent 写出绝大多数代码，人类工程师最先失去的会是什么？我原本以为答案是“写代码的时间”，读完 Google AI 的这篇文章后，觉得更准确的说法是：人会失去逐行确认一切的余裕。

文章从一个很醒目的事实开始：OpenAI 有一个内部产品，人工手写代码为 0 行。它没有把这个数字当成魔法，而是继续追问：代码由 agent 生成之后，谁来限制它的活动范围，谁来解释测试失败，谁来决定它不能再试了？

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-05-harness-engineering-reading-response-img-00-infographic-core-summary.png)

## 我真正读到的，不是“零行代码”

“零行人工代码”很容易被读成岗位替代的预告。但 DEV 文章的价值不在这个数字，而在于它把工程师的工作往上一层挪了：不再亲手写完应用逻辑，而是设计一个让 agent 能持续工作的环境。

OpenAI 官方对那次实验的描述更具体：三名工程师驱动 Codex，几个月里构建出约一百万行代码，仓库还包括测试、CI、文档、可观测性和内部工具。人没有直接贡献代码，但并没有退出系统。他们在定义目标、补齐工具、写验收条件、处理反馈，以及决定哪些规则必须变成机器检查。

这个区别很重要。把代码生成交给 agent，不等于把工程判断也交出去。人从“每行代码的作者”变成了“工作环境的设计者”。如果环境没有把边界和反馈做实，agent 只是更快地把猜测变成提交。

## Harness 是先把犯错的空间切小

原文用赛马来比喻：agent 是马，harness 是赛道、眼罩和缰绳。这个比喻有点老派，却把问题说得很直接。Harness 不是一个神秘的模型增强层，而是包在 LLM 外面的确定性组件：权限边界、执行沙箱、状态保存、验证工具，以及终止条件。

我更愿意把它理解成一份“允许怎样犯错”的契约。它不保证 agent 永远做对，却先回答了几个出事时必须回答的问题：它能碰什么？一次失败之后拿到什么证据？最多重试几次？什么结果必须升级给人？

因此，`workspaces=["./sandbox"]` 的价值不在于这行配置看起来专业，而在于它把 agent 的行动空间从“当前机器”缩成了一个明确目录。即使后面的代码判断出了问题，损害半径也应该被锁在沙箱里。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-05-harness-engineering-reading-response-img-01-sandbox-policy.png)

原文配的策略图很朴素：agent 可以写入 `./sandbox`，生产数据库和宿主机文件则被策略挡住。边界先于智能。一个还没通过验证的 agent，最不应该拥有的是“凭自己理解决定能访问什么”的自由。

这也是我读到“harness”时的第一个认知变化。过去我们常把权限、目录和测试看成应用外围的工程杂务；在 agent 工作流里，它们其实是能力的一部分。模型再强，越权路径没有被关掉，就谈不上可靠。

## Repair loop 只解决它看得见的失败

第二个例子是测试循环：agent 写代码，测试节点运行检查；失败时，把干净的错误日志送回 agent；成功就结束，卡住则由 kill switch 拉闸。ADK 2.0 官方文档把图工作流和动态分支作为能力方向，原文用 `loop_back` 把这个关系画成了一个很小的图。

```text
START → agent → test
                 ├─ pass → END
                 ├─ fail → feedback → agent
                 └─ attempts > limit → STOP
```

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-05-harness-engineering-reading-response-img-02-test-loop.png)

这个闭环和“请模型再试一次”的差别在于，失败不再依赖人复制粘贴。它有固定的节点、可读的证据和明确的终点。对高频、低风险、验收条件清楚的任务来说，很多机械照看可以交给它。

但我不想把它叫作“自愈系统”就此收尾。测试循环是可靠性的下限，不是全部。它能发现某个测试失败，却发现不了测试漏掉的关键需求；它能把错误修到绿灯，却不能判断绿灯是不是写错了。它还需要一个上限，才能在反复失败时停下来，把判断交还给人。

这正是 repair loop 最容易被误解的地方：它把“执行既定验收”自动化了，不会自动生成正确的验收。错误的规格如果被写进 harness，只会被执行得更快。

## “给地图，不给手册”其实是上下文治理

文章引用 OpenAI 的另一个经验：不要给 agent 一份一千页的总说明，而要给它一张地图，让它按工作需要逐步找到仓库里的事实。

这句话表面上是在讲 prompt 长度，底下讲的是知识的可发现性。规则如果藏在聊天记录、某个人的记忆或一份没人维护的超级文档里，对 agent 来说就等于不存在。目录、局部 `AGENTS.md`、设计文档、可执行计划、schema 和 lint 结果，才是它能反复读取的工作记忆。

我在这点上更愿意把 harness 看成治理系统，而不是运行时胶水。OpenAI 官方文章里的仓库地图、结构测试、可观测性和持续清理，和 DEV 文章里的 sandbox、测试节点其实是同一条链的两端：前者让 agent 找得到正确上下文，后者让它的动作有边界、结果有反馈。

这也解释了为什么“把所有规则塞进一个大文件”通常会失败。上下文是有限的；什么都标成重要，等于没有重点；规则没有结构和检查，就会在代码高速增长时腐烂。地图的意义不是少写几句话，而是让每条规则有位置、有所有者、有验证方式。

## 我会先做哪一个最小 harness

如果今天要给一个小任务加 harness，我不会一上来追求多 agent 协作或全自动发布，而会先做三件事：

1. **sandbox**：让任务只能改一个明确目录，默认不能接触生产数据、宿主机敏感文件和无关凭据。
2. **可读日志**：每次构建、测试或工具调用都留下 agent 能直接消费的错误信息，而不是只给人看的终端噪音。
3. **有上限的循环**：失败可以自动回传，但必须记录次数、保留每轮结果，超过上限就停下来。

这三件事看起来不如“让 agent 自己完成整个项目”兴奋，却更容易验证。它们适合从测试驱动的小修复、格式迁移、低风险重构开始；涉及生产写入、权限变更、用户数据或无法形式化验收的任务，不应该因为有了 repair loop 就直接放权。

我最后留下的判断是：Harness engineering 把工程师原本默默做的限制、解释和停手显式做成系统。它不让模型变成工程师，反而把工程师该负责的那一层照得更清楚。模型能力越强，这层工作越不能省。我的一个可验证预测是，agent 生成速度继续上升后，团队首先缺的不会是更多代码，而是更清晰的验收条件、更短的失败反馈路径，以及能持续清理旧规则的机制。

如果只能先给你的 agent 工作流加一道护栏，你会先选权限边界、失败回传，还是停止条件？为什么？

## 参考资料

- 原始文章：[What is harness engineering and why should I care?](https://dev.to/googleai/what-is-harness-engineering-and-why-should-i-care-8n0)
- 背景核验：[OpenAI — Harness engineering: leveraging Codex in an agent-first world](https://openai.com/index/harness-engineering/)
- 图工作流背景：[Google ADK 2.0](https://adk.dev/2.0/)
- 相关实现：[ADK harness repository](https://github.com/balajismaniam/adk-harness-engineering/blob/main/workflows/workflows.py)
- 延伸阅读：[给冰冻的世界装上外骨骼：Google EnvHarness 如何用“环境侧 Harness”破解 Agent 进化死局](https://ntlx.github.io/articles/google-envharness-agent-learning-environments)
- 延伸阅读：[循环交出控制权之后：读 ByteByteGo《The Agent Loop》](https://ntlx.github.io/articles/agent-loop-reading-bytebytego)
