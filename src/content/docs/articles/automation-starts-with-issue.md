---
$schema: starlight
title: 自动化先要找到一个能负责的对象
description: GitHub 的营销案例让我意识到，自动化的起点不是让 Copilot 多写几段代码，而是给每次工作一个能被追踪、被审查、被接手的对象。
date: 2026-09-13
category: ai-industry
primarySourceUrls: ["https://github.blog/ai-and-ml/github-copilot/marketing-ops-as-code-automating-events-from-planning-to-follow-up-on-github/"]
---

我读到 GitHub 这篇文章里的那句 “An event is an issue” 时，第一反应是：这听起来不像营销技巧，更像是在给一件事情办户口。

一场活动最麻烦的部分，通常发生在决定之后。落地页要复制，UTM 链接要按渠道生成，邀请邮件要交给另一个团队发送，项目板要同步，报名名单要每天清洗，活动结束后还要整理成 CRM 能吃的格式。每一步都不难，步骤之间却没有天然的共同地址。出了问题，人只能回到聊天记录、表格和不同系统里拼现场。

Tomoko Tanaka 的做法让我重新看了一眼“marketing ops as code”这个标题。它最有价值的地方不是把营销人员变成程序员，也不是证明 Copilot 可以替人管理一场活动，而是先给这场活动建立一个可以追踪的工作对象。机器要接手工作，得先知道自己正在处理哪一件事。

![自动化责任链信息图](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-14-marketing-ops-as-code-img-00-infographic-core-summary.png)

## 先给事情一个地址

GitHub Issue 原本就是团队记录项目的地方。作者做的改动很小，却改变了它的角色：Issue 不再只保存计划和讨论，也开始承载状态、触发条件和执行结果。

Issue form 把活动标题、日期、区域、campaign name 和目标受众收进结构化字段。根据 [GitHub Issue Forms 官方文档](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms)，表单可以定义输入类型、验证和默认标签。这样一来，后续脚本面对的就不再是一大段随手写的描述。

Label 负责表达状态。`event-setup` 在这个案例里不是一个分类词，而是“可以开始设置了”的信号。[GitHub Actions 官方文档](https://docs.github.com/en/actions)说明，工作流可以被事件触发；[事件文档](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)也列出了 Issue 的 `labeled` 活动类型。Actions 再把这个状态变化接到落地页、UTM、邀请文档、项目板和协作 Issue。

我觉得这里有一个经常被 AI 叙事遮住的区别：Issue 的价值不是“它能触发脚本”，而是它给脚本、参与者和接手者提供了同一个参照点。计划为什么这样定，谁批准过，机器做了什么，下一步卡在哪里，都可以回到同一个 URL。

自动化的第一个产物应该是一份责任关系。它至少要回答：这件事是什么，现在处于哪一步，谁能让它继续，完成后留下什么。

## Copilot 先别急着动手

原文里我最喜欢的场景，反而发生在 Issue 创建之前。作者对 Copilot 说，她想在 11 月办一场关于 AI 辅助开发的线上活动。仓库里的 `AGENTS.md` 负责补上团队约定：活动怎么命名，财季日期怎么算，各区域使用什么时区，邀请邮件需要包含什么。

Copilot 根据这些规则找相似活动，提出 campaign name，写出邀请邮件草稿，然后继续追问。这个过程先处理输入：自然语言可以模糊，机器开始工作时拿到的字段不能太模糊。聊天只是承载方式，输入治理才是它解决的问题。

作者把分工压缩成一句话：“Copilot drafts; I decide.” 活动名、邮件主题和日期仍由她确认，带着正确标签的 Issue 建好之后，自动化才会继续。这个顺序值得保留。让模型直接从一句意图跳到外部系统，最需要补上的不是点击，而是责任确认。

这里的人审也不能理解成一个泛泛的“人在环中”。人应该在外部副作用发生前确认具体事项：是否真的要创建落地页，是否可以向别的仓库发请求，哪些名单能够流转，CRM 写入的范围是什么。审查点越具体，机器越容易跑快，人在出问题时也越知道自己批准过什么。

## 固定动作不要吞掉地方知识

活动设置有相当固定的顺序，适合交给 Actions：复制过去的活动、生成各渠道链接、提交 Word 邀请函、创建协作 Issue、更新项目板、回写总结。每天筛选开放活动的报名者，则由 schedule 触发。

活动结束后的 `/lead-upload` 和 `/event-report` 不完全一样。东京和首尔面对的语言、受众、CRM 字段和合格线索定义可能不同，把这些差异硬塞进一个大工作流，最后通常只会得到很多条件分支。作者选择把这部分写成 Copilot agent skills，让变化停留在规程层，底层的连接器和状态机制继续复用。

原文说 skill 是一个 Markdown 文件，这句话很适合用来降低理解门槛，却不够完整。当前 [GitHub Agent Skills 文档](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)把 skill 定义为一个可以包含指令、脚本和资源的目录，`SKILL.md` 是核心入口。文件格式本身不是重点；重要的是业务规程成为一个可以进 pull request、由 [CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners) 路由审查、留下版本记录的变更单元。

这和我在这个仓库维护文章管线时的感受很接近。材料、理解 brief、draft、图片和双轨构建各有输入合同，Gate 会拦截过期或结构不一致的产物。规则文件本身不会产生秩序，规则被放进状态、审查和失败处理组成的路径里，才开始像一个系统。

## 让副作用在边界上停下

原文提到的 `DRY_RUN` 是一个很朴素的设计：工作流完整走一遍，却不创建落地页、不向其他仓库发 Issue，也不分享名单。它真正提供的是一条可以反复排练的路径。

但 `DRY_RUN` 也很容易被高估。它只有在每个外部写入之前都被检查时才成立。漏掉一个接口调用，排练就会碰到生产数据；没有审计记录，排练成功也无法说明它究竟走过了哪些分支。

安全边界也需要逐项看。Actions variables 适合放 `DRY_RUN` 这类非敏感配置，[官方文档](https://docs.github.com/en/actions/concepts/workflows-and-actions/variables)并不把它当作秘密存储。令牌和密码要走 secrets；[Push protection](https://docs.github.com/en/code-security/concepts/secret-security/push-protection)可以在凭据进入仓库前拦截部分错误，但需要启用相应能力，也存在绕过机制。Copilot Business 和 Enterprise 的客户数据不用于训练模型，具体的数据处理与保留仍要按访问方式、用途和组织政策判断，不能把“不用于训练”读成“完全不留存”。

所以，“人在环中”只是一个起点。要把动作交给机器，还要写清楚最小权限、重复执行如何识别、部分成功如何恢复，以及哪些结果必须由人接手。自动化接触的外部系统越多，这些问题越不能留到事故之后再回答。

![让副作用在边界上停下](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-14-marketing-ops-as-code-img-01-decision-boundary.png)

## 五天没有响起的警报

原文最让我信服的不是效率描述，而是作者承认报名筛选工作流曾经静默失败五天。它没有立刻报错，只是让名单慢慢变旧，直到有人发现异常。

这类失败比一次明显报错更麻烦。报错会把人叫回来，静默失败只会让人继续相信流程正在工作。[GitHub Actions 的触发文档](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow)提醒，schedule 任务可能受到高负载影响而延迟，甚至丢掉排队任务。设置了 cron，只能说明系统有过一个计划，不能说明业务结果准时产生。

我会因此把“证据”放得比“自动运行”更高。一次名单处理要有更新时间和结果数量，跨系统写入要留下可追踪的标识，失败要通知一个真的能处理它的人，重复执行要知道自己是否已经写过同一条记录。没有这些信息，系统只是把操作员变成了事后调查员。

![五天没有响起的警报](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-14-marketing-ops-as-code-img-02-silent-failure.png)

## 从一件小事开始

如果要把这套方法带回团队，我不会先做一个能替人判断“哪些客户值得邀请”的 agent。第一块应该满足几个条件：每周重复，输入输出相对稳定，结果容易核对，失败后可以重新执行。

名单清洗、格式转换、状态同步和报告初稿都符合这个条件。具体落地时，先找一个唯一工作对象，再定义几个状态；确认工具提供 API 或 CLI；让第一个 Action 只完成一个动作；默认使用 dry-run；把变化放进 PR，让另一个人能看懂它会触碰什么。运行记录和失败通知稳定以后，再接下一个动作。

这时 Copilot 的价值才会显现出来：它帮你把脑中的 runbook 变成表单、规则和初版流程，减少从“我知道怎么做”到“机器有办法做”的翻译成本。它没有替你完成权限设计，也没有替你决定什么算成功。

读完这篇文章，我留下了一张很窄的检查表：每项工作有没有地址？状态能不能被别人看见？机器的动作会在哪里停下？结果和失败会不会留下证据？先把这四件事补齐，再让 Copilot 接手下一步。这样做出来的自动化也许不够炫，却更有机会在作者离开会议、团队换人之后继续工作。

## 参考资料

- [原文：Marketing ops as code: Automating events from planning to follow-up on GitHub](https://github.blog/ai-and-ml/github-copilot/marketing-ops-as-code-automating-events-from-planning-to-follow-up-on-github/)
- [GitHub Docs：Syntax for issue forms](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms)
- [GitHub Docs：GitHub Actions documentation](https://docs.github.com/en/actions)
- [GitHub Docs：Events that trigger workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)
- [GitHub Docs：Triggering a workflow](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow)
- [GitHub Docs：Variables](https://docs.github.com/en/actions/concepts/workflows-and-actions/variables)
- [GitHub Docs：About code owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [GitHub Docs：About agent skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
- [GitHub Docs：Adding agent skills](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills)
- [GitHub Docs：Adding agent skills for GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills)
- [GitHub Copilot CLI](https://github.com/features/copilot/cli)
- [GitHub Copilot app](https://github.com/features/ai/github-app)
- [GitHub Docs：Managing GitHub Copilot policies as an individual subscriber](https://docs.github.com/en/copilot/how-tos/manage-your-account/manage-policies)
- [GitHub Copilot plans：data use and retention](https://github.com/features/copilot/plans)
- [GitHub Docs：Push protection](https://docs.github.com/en/code-security/concepts/secret-security/push-protection)
- [相邻案例：I automated my job (and it made me a better leader)](https://github.blog/developer-skills/github/i-automated-my-job-and-it-made-me-a-better-leader/)

## 延伸阅读

- [Anthropic 这篇 skills 文章，真正写的是组织接口](https://ntlx.github.io/articles/claude-code-skills-organizational-interface)
