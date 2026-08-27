---
$schema: starlight
title: 80% 准确率的 Agent 为何沦为团队噪音？读 Warp 双 Skill 架构与智能体的 GitOps 进化之路
description: 真正阻碍智能体落地的不是大模型的推理上限，而是无状态反馈带来的持续微噪音。Warp 把行为准则代码化，用双 Skill 与 PR 审查实现了可控自进化。
date: 2026-08-27
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-27-warp-self-improving-agents-claude-skills-img-00-infographic-core-summary.png)

在很多研发团队里，引入 AI Agent 的过程往往遵循着相似的曲线：最初大家为它能自动生成 PR 评审或分流 Issue 感到惊艳，但几周后，工程师们开始抱怨它留在评论区的低级建议太吵、不切题，甚至有人提出关闭自动化集成。

Anthropic 在其官方博客中分享了现代终端与开发环境工具 Warp（拥有 80 万月活开发者、财富 500 强覆盖率超 56%）在 Claude Platform 上解决这一难题的实战经验。Warp 创始人兼 CEO Zach Lloyd 指出，初版 Prompt 哪怕达到了 80% 的准确率，剩下的 20% 也会在日常高频交互中制造令人疲惫的噪音。

解决这一问题的关键，不是反复人工重写系统提示词，也不是盲目接入黑盒式的动态记忆，而是将智能体的操作指南转变为可版本化、可审查的程序性技能（Skills），并通过双层 Skill 架构构建一条自我进化的“GitOps 闭环”。

## 80% 准确率背后的“信噪比死穴”

在单次探索性的聊天对话中，模型偶尔给出不准确的回答并不会造成太大的系统性破坏，用户纠正一次即可继续。然而，一旦 Agent 被部署到经常性（Recurring）的核心研发流程中——例如每个 PR 打开时的自动代码审查、每个 GitHub Issue 提交时的标签分流——无状态性（Statelessness）就会成为整个系统的致命伤。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-27-warp-self-improving-agents-claude-skills-img-01-warp_self_improving_loop.png)

Warp 团队在运行内部代码审查智能体时就深陷这种困境：
- 工程师在某次 PR 中纠正了 Agent：“按照我们仓库的规范，这类全局状态不应该这样命名”；
- 但由于 Agent 会话是瞬态的，这条反馈随着会话结束直接蒸发；
- 下一次其他同事提交 PR 时，Agent 依然在同一个位置犯一模一样的错误。

起初，维护者尝试根据收集到的典型失败用例（Bad Cases）手动修改全局 Prompt 或更新 `AGENTS.md`。这种修补方式在初期确实提升了输出质量，但很快遇到了工程扩展性的天花板：Prompt 越来越臃肿，维护者的时间被繁琐的调优占满，而团队不断涌现的业务规范又无法被实时收录。

Warp 意识到了问题的根源：**不是团队缺乏高质量的反馈，而是没有一条能够让分散反馈持续复合（Compound）到系统规范中的机制。**

## 双 Skill 闭环：把行为准则交给 GitOps

为了打通进化路径，Warp 依托 Claude Platform 的 Agent Skills 机制，构建了一套包含两个技能与人类参与的闭环架构：

1. **基础业务技能（Inner / Base Skill）**：承载具体领域的业务逻辑与操作准则。例如代码审查规范、各 Issue 标签的触发条件与上下文排查方法。每次触发业务事件时，执行 Agent 均以此为输入；
2. **工作现场的零阻力反馈（Human Feedback）**：开发者不需要打开专用的标注工具或填写复杂的纠错表单，直接在日常工作的 PR 或 Issue 下回复留言。例如资深工程师写下“你建议重命名这个变量，但按照项目架构，此处应当遵循特定命名上下文”；
3. **观察者技能（Outer / Improver Skill）**：作为一个异步运行的观察者智能体（基于 Warp 内部的 Oz 编排系统或 CI 定时任务调度），定期抓取近期积累的人类评论，比对 Agent 的初始输出与人类的实际纠偏，提炼出针对 Base Skill 的最小聚焦修改；
4. **代码审查与合并闭环（PR Review & Merge）**：Improver Agent 不直接静默修改生产配置，而是发起一份标准的 Git PR，附带具体的修改理由与引用的历史反馈上下文。项目 Maintainer 审查通过并合并后，Base Skill 的下一次执行便自动继承这一最新经验。

这种设计巧妙地区分了**技能（Skills）**与**记忆（Memory）**的本质差异：

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-27-warp-self-improving-agents-claude-skills-img-02-skills_vs_memory_comparison.png)

很多团队倾向于将历史纠错塞进向量数据库作为动态记忆，但在工程实践中，推理期动态写入的记忆往往不可控、难以审查且容易产生上下文冲突。相反，文件化的 Skills 代表的是确定性、程序性（Procedural）的工作规范，通过 Git 流程进行版本控制与人工把关，既保障了自进化的确定性，又阻断了潜在的规则漂移。

正如我们在探讨 [Google Agent Skills 工业化治理](https://ntlx.github.io/articles/google-agent-skills-behind-the-scenes) 时所见，把 Agent 的行为准则收敛为标准化的文件资产，是智能体走出玩具阶段的必由之路。

## 为什么是“写原则”而不是“堆规矩”？

在自进化 Skill 的编写上，Warp 总结了数条经过数千万次会话验证的核心准则：

1. **写原则，而不是死规矩（Write principles, not rules）**：像指导一位聪明的工程师那样撰写 Skill，而不是像传统编程那样穷举每一个 edge case。例如“检查是否有重复的业务逻辑并提示抽象”远比写满几十条细碎的命名禁忌更具泛化能力；
2. **解释背后的 Why**：单纯给出“不要这样做”往往会导致 Agent 在相似场景下误判；只有讲清楚“为什么这样做会破坏并发安全”，模型才能利用推理能力举一反三；
3. **保持 Skill 精简与渐进披露（Progressive Disclosure）**：好的 Skill 文件体积应当保持克制，通过相对路径引用专门的辅助脚本与参考文档，避免单次调用把海量上下文一次性灌满模型窗口；
4. **打磨高复用性的 Improver Skill**：领域基础知识虽然千差万别，但“观察反馈、提炼差异、发起 Skill PR”的观察者逻辑在代码审查、工单分流、需求撰写等场景中高度通用。

这种将智能体从聊天交互抽离为无头自动化的思路，与此前讨论的 [Claude Code 无头自动化范式](https://ntlx.github.io/articles/claude-code-headless-automation) 高度契合：智能体不再等待人类每一轮的实时指令，而是作为背景进程在既定规则与反馈驱动下自律运转。

## 自我进化的暗礁与普通团队的落地路径

虽然 Warp 展示了一套极其优雅的智能体自演进飞轮，但在实际落地中，如果缺乏必要的防御工程，团队极容易触碰到以下暗礁：

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-27-warp-self-improving-agents-claude-skills-img-03-gitops_evolution_workflow.png)

### 1. 噪声反馈与规则过拟合
开源社区或多人团队中，不同水平的开发者给出的反馈可能存在质量差异甚至相互冲突。如果 Improver Agent 对单次个别抱怨过拟合，就会把原本正确的全局原则改偏。因此，必须对反馈来源设置权重过滤，并在自演进提示词中要求观察者寻找跨会话的共性模式，而非对单一孤例做激进修改。

### 2. 缺乏回归评估（Regression Evals）的隐性退化
修改 Skill 就像修改核心业务代码：修好了一个新发现的 bug，可能会意外破坏之前已经调优好的五个边界条件。成熟的自进化系统必须在合并 PR 之前，基于历史黄金数据集（Golden Evaluation Dataset）自动运行确定性回归测试，确保新规则没有造成整体准确率的倒退。

### 3. 人类审查的疲劳临界点
如果观察者 Agent 每天提交十几份零碎的 Skill 修改 PR，维护者很快会陷入审美疲劳并选择无脑合并或直接弃用。合理的做法是将更新周期拉长为周报式或按批次聚合，以结构化变更日志的形式呈现修改重点。

### 普通团队的极简复刻方案
我们并不需要一套复杂的自研 Agent 编排平台才能体验自改进循环。借助现有的开源生态与工具链，任何工程团队都可以用极低的成本搭起最小可行闭环：
- **执行层**：在 GitHub Actions 中配置工作流，在 PR 或 Issue 触发时调用 `claude` 或自定义 Agent，加载本地 `.agents/skills/` 目录；
- **反馈层**：保留在 PR Review 评论与 Issue 讨论中；
- **观察者层**：配置一个每周定时触发的 GitHub Action，调用一段 Python 脚本拉取本周带特定标记或包含维护者评论的 Threads，交由 Claude 分析并向当前仓库的 Skill 文件发起包含 Diff 的 Pull Request；
- **治理层**：维护者在每周例行 Code Review 中审阅并合并。

当我们将 Prompt 从不可捉摸的口头嘱托，转变为接受 Git 版本管理、代码审查与持续集成的工程资产时，AI Agent 才真正具备了在真实企业级复杂场景中自我繁衍与长期进化的生命力。

---

*你在日常使用 AI 编程或自动化 Agent 时，是否也遇到过“同一处错误每天都要纠正一遍”的困扰？你认为将规则交给 Agent 自己提 PR 修改，还是由人类完全主导编写更为可控？欢迎在评论区分享你的实战经验与思考。*

## 延伸阅读

- [1.5 万 Stars 背后：Google 揭秘 Agent Skills 的工业化构建与治理真相](https://ntlx.github.io/articles/google-agent-skills-behind-the-scenes)
- [Claude Code 正在离开聊天框](https://ntlx.github.io/articles/claude-code-headless-automation)
- [Anthropic 这篇 skills 文章，真正写的是组织接口](https://ntlx.github.io/articles/claude-code-skills-organizational-interface)
- [让 AI 写代码不再翻车：一个 TypeScript 巫师的 5 个 Agent Skills](https://ntlx.github.io/articles/5-agent-skills-for-ai-coding)

## 参考资料

- [How Warp builds self-improving agents on Claude — Anthropic Blog](https://claude.com/blog/how-warp-builds-self-improving-agents-on-claude)
- [Warp Official Website](https://www.warp.dev)
- [Claude Platform Agent Skills Documentation](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- [Agent Skills Best Practices — Anthropic Documentation](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [Warp Agents Demo: GitHub Issue Triage](https://github.com/warpdotdev/warp-agents-demo-github-issue-triage)
- [Anthropic & Warp Webinar: Building Self-Improving Agents](https://www.anthropic.com/webinars/how-warp-builds-self-improving-agents-on-claude)
