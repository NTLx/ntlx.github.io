---
$schema: starlight
title: 让浏览器 Agent 点完提交以后
description: 浏览器 Agent 可以判断下一步怎么走；保存记录是否存在、字段是否正确、失败后能否重试，仍需明确的核验。读 Browser Use 的入门文章，我更关心怎样把这些检查接到实际任务里。
date: 2026-11-06
category: ai-agents
primarySourceUrls: ["https://browser-use.com/posts/browser-agents"]
---

Browser Use 的[浏览器 Agent 入门文章](https://browser-use.com/posts/browser-agents)里，有个提醒很容易滑过去：Agent 可能还没保存表单，就报告任务完成。

我读到这里，反而停了下来。让模型找到按钮、填入信息、应付弹窗，都有直观的演示效果。但使用者最后需要知道的，是那份申请有没有落下去，保存的内容对不对。如果“已完成”只来自执行者自己的判断，我们其实还欠一次核对。

这篇文章解释了 Agent 怎么操作浏览器。读完后，我更想把其中的结果检查展开：哪些事情适合交给它自己找路，哪些事情需要在运行前约定清楚。

![浏览器 Agent 的结果核验](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-06-browser-agent-completion-img-00-infographic-core-summary.png)

## 循环里的检查，应该查到哪里

原文把浏览器 Agent 拆成模型、harness 和浏览器。模型决定下一步；harness 负责提供上下文、调用工具、把结果送回来；浏览器承载页面、标签和登录状态。它们配合着重复观察、选动作、执行、检查，直到达到目标或触及运行限制。

Browser Use 的循环原图展示了这个过程。我更关心执行之后查什么：点击工具返回成功，通常只能说明动作执行了；它距离“申请已按要求保存”，还隔着业务状态。

![Browser Use 原图：浏览器 Agent 的组件与反馈循环](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-06-browser-agent-completion-img-01-flowchart-browser-loop.png)

假设让 Agent 把供应商资料填入采购系统。按钮点到了，可以查页面有没有出现确认信息；确认信息出现了，还可以回到记录列表，核对供应商名称和提交内容。若系统提供查询接口，也可以借它读取保存结果。这些是我会采用的设计办法，并非原文披露的产品实现。

核对方法当然也会出错。列表可能延迟刷新，成功提示可能只表示请求已接收，所以验收时要讲清楚查的是什么：记录存在、内容匹配，还是审核已经通过。做不到可靠的自动检查，就把状态留在“待确认”，附上页面和记录信息交给人看。

**允许执行过程灵活，不妨碍我们把完成条件写得具体。** 恰恰因为中间怎么走不完全确定，终点才更需要说清楚。

## 有接口的地方，没必要坚持点网页

原文给出的选型建议很实在：有能覆盖任务的 API 就用 API；没有合适 API、但步骤可预测，可以用脚本；下一步需要根据页面现场判断，才轮到 Agent 发挥作用。原文的选型图适合放在这里对照看。

![Browser Use 原图：API、脚本与 Agent 的选型条件](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-06-browser-agent-completion-img-02-flowchart-tool-selection.png)

我会把这个建议用在任务的各个环节。比如，同一个流程可以让 Agent 在陌生网站找报表入口，用已有脚本下载文件，再用固定规则核对报表日期和字段。把流程交给 Agent 编排，并不意味着每个动作都要经过截图和模型决策。

读页面也有类似的分工。原文介绍了 DOM、无障碍树和截图。无障碍树能提供控件的名称、角色、状态，让工具找到名为“搜索”的按钮；截图则适合补充结构信息表达不好的视觉内容。[Playwright MCP 官方说明](https://github.com/microsoft/playwright-mcp)也以结构化无障碍快照为主要方式，并提供截图相关能力。

这让我更愿意先问“这个环节能得到什么信息”，再讨论换哪个模型。没有正确控件语义时，截图可能有用；页面变化后没有重新观察，模型也可能沿用过时信息。浏览器环境、页面表征和模型判断，需要一起看。

MCP 在这里提供工具调用方式。接上工具之后，登录是否有效、可以访问哪些站点、输出怎样验收，仍然需要安排。

## 提交后卡住，不能直接当作失败重来

原文提醒，重试可能产生重复订单或重复申请。我觉得这比“偶尔点错按钮”更值得优先处理，因为它改变了恢复方式。

设想 Agent 点击提交，随后页面超时。此时有两种可能：请求没有成功，或业务已经保存，只是确认信息没回来。在这个假设场景里，若直接从头重做，就可能把不知道的状态变成重复写入。

因此，我会把“确认没有提交”和“无法确认有没有提交”分开处理。前者可以重新尝试；后者先找记录、核对内容，查不清就暂停。对写入任务，保存可追查的记录信息，应当成为流程的一部分。

![提交状态未知时先核对记录，再决定重试或交接](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-06-browser-agent-completion-img-03-flowchart-submission-state.png)

另一个问题来自页面本身。原文引用的 [Anthropic 提示注入研究](https://www.anthropic.com/research/prompt-injection-defenses)讨论了网页里的恶意指令：Agent 原本要读取页面，却可能被页面引向别的目标。因此，允许读到一段文字，不能顺带允许它照着那段文字扩大操作范围。

这与之前讨论的[让 Agent 带着具体请求来申请权限](https://ntlx.github.io/articles/openshell-runtime-permissions)有直接联系：模型可以继续找办法，权限检查需要落在实际执行处。浏览器场景还要把账号已有的能力考虑进去。能用受限账号完成的任务，不必为了省事交出更宽的权限。

权限限制和敏感动作审批可以减轻风险，却不能保证网页内容不会误导模型。Playwright MCP 的 README 也明确说明，它本身不构成安全边界。我不会把“已经接入 MCP”当作这部分工作完成的依据。

## 值不值得用，要把失败和复核算进去

原文的费用建议让我觉得很有用：把失败和重试在内的支出，除以经过核验的成功任务数；人工复核时间另外记录。这样，便宜的运行才有机会对应便宜的交付。

如果一个任务需要人反复打开网页、查错、补填，单次模型调用再省，也未必省下多少工作。反过来，即使运行费用较高，只要结果容易核对、异常能清楚交接，也可能值得采用。具体划不划算，应拿自己的任务记录来判断。

原文还列了 Browser Use Cloud 的使用分布，并明确说明，那是在描述人们拿它运行什么任务，不是这些任务的成功率。这里不能从“有人用来处理登录或申请”跳到“它已经能可靠代办”。用途证明需求存在，验收记录才帮助我们判断能交出去多少。

如果准备尝试，我会沿着原文的建议，从只读任务开始：限定站点和要提取的字段，保留对应页面，先设好时间、步数或费用上限。随后看结果是否准确、哪里需要人改，再决定是否接入写入操作。

读完这篇入门文章，我愿意把找入口、辨认页面、处理临时变化交给浏览器 Agent 试一试。对于点击提交之后发生的事，我希望系统能拿出可查的记录；拿不出来，就明确告诉使用者还没确认。这样，“完成”才是一个能据此继续工作的状态。

## 参考资料

- [Browser Use 原文：What Is a Browser Agent? How It Works and When to Use One](https://browser-use.com/posts/browser-agents)（正文循环图、选型图均复用自此文）
- [Browser Use：What people run](https://browser-use.com/showcase/landscape)
- [Playwright MCP 官方仓库](https://github.com/microsoft/playwright-mcp)
- [MDN：Accessibility tree](https://developer.mozilla.org/en-US/docs/Glossary/Accessibility_tree)
- [Anthropic：Mitigating prompt injections](https://www.anthropic.com/research/prompt-injection-defenses)
- [Browser Use Cloud：Run a task](https://docs.browser-use.com/cloud/agent/quickstart)
