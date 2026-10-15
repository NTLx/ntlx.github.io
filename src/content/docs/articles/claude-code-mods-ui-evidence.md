---
$schema: starlight
title: 看见 Agent 的动作之后，还要问界面展示的是什么
description: Token Weather、Blast Radius、Replay Theater让 Agent 状态、命令预估和编辑回放变得可见；我更关心屏幕上的信息究竟是哪一种证据。
date: 2026-10-15
category: ai-coding
primarySourceUrls: ["https://claude.dev/blog/getting-started-with-claude-code-mods/"]
---

读完 Addy Osmani 的《[Getting started with Claude Code mods](https://claude.dev/blog/getting-started-with-claude-code-mods/)》，我记住了三个界面：一条显示上下文用量的状态条；一个在 Bash 命令运行前列出预计影响；一页在回合结束后展开文件差异。

我在[《从工作台到沙箱：Agent 的自主性需要可见边界》](https://ntlx.github.io/articles/claude-code-agent-visible-boundaries)里谈过更大的工作流问题。这些例子让我想到一个更细的问题：面板里的信息来自哪里？

![读数、命令预估和编辑记录三种界面证据的对照信息图](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-15-claude-code-mods-00-infographic-core-summary.png)

## 三个 mod 把信息放在三个时刻

Token Weather 在 prompt 上方显示上下文用量；Blast Radius 在一组被识别的 Bash 命令执行前暂停下来，让人查看预计会影响什么；Replay Theater 则在编辑发生后，把这一轮的文件差异逐项摊开。

它们把相关信息放进了三个时间点：运行中的状态、执行前的命令、完成后的编辑记录。用量不用靠猜，命令可以先看影响，改动也能按文件翻查。这样的界面比单纯显示“Claude 正在工作”有用得多。

但状态读数、命令预估和编辑记录不是一回事。屏幕上看到的信息究竟是什么，决定了我能拿它做什么判断。

## 读数、预估和记录，各有证据边界

Token Weather 从 session usage 读取上下文数据，再转成百分比和趋势条。它能提醒我窗口正在变满，我不会把这个读数当作 Claude 是否还记得上下文的测量。

![原文中的 Token Weather 上下文用量状态条截图](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-15-claude-code-mods-01-source-token-weather.png)

Blast Radius 先从 Bash 命令文本里识别它支持的模式，再用 `git status`、`git clean -n` 等命令估计影响。识别范围有限，shell 别名、命令替换、间接脚本或其他工具调用都可能绕开预览。按下 Proceed 后，原命令照常执行。

![原文中的 Blast Radius 对 git reset --hard 影响的预览截图](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-15-claude-code-mods-02-source-blast-radius.png)

Replay Theater 在编辑工具被调用时收集差异，回合结束后再让人浏览。项目 README 特别说明，被拒绝或失败的编辑也可能出现在回放里。我会把它当成 Agent 曾请求怎样改文件的线索，最后仍要检查磁盘上的文件。

![原文中的 Replay Theater 文件差异与回放界面截图](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-15-claude-code-mods-03-source-replay-theater.png)

三个面板的显示方式相似，依据却不同。Token Weather 读 usage，Blast Radius 推算影响，Replay Theater整理工具调用。面板若不说明这个差别，一项预测就可能看起来像已经确认的结果。

## 面板能提示风险，权限边界仍在别处

Blast Radius 的取消按钮能拦下一次它识别到的命令。mod 自己仍以用户权限运行。官方文档列出的能力包括读写用户文件、读取环境变量、启动进程和发起网络请求；mod 也不在 sandbox 内。[官方 Mods 文档](https://code.claude.com/docs/en/plugins/mods/overview)建议先检查它注册了哪些 hooks、调用了哪些 API。

![命令影响预览与 mod 运行权限属于不同层面的框架图](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-15-claude-code-mods-04-framework-ui-vs-permissions.png)

我在[《让 Agent 带着具体请求来申请权限》](https://ntlx.github.io/articles/openshell-runtime-permissions)里讨论过运行时策略如何约束真实请求。Mods 的面板能帮人理解和处理某些动作；执行路径上的权限规则、隔离和结果核验仍要单独落实。

三个 mod 放在 Anthropic DevRel 维护的 playground 仓库里。仓库 README 说明它不是 Anthropic 官方产品，示例也不保证一直兼容。读代码能学到做法；长期运行前还得自己检查权限和测试结果。

## 我会先验证界面显示的依据

试用前，我会先确认三件事：显示值是运行时读数还是有限推断；模块观察了哪些事件和工具；回放记录的是请求还是已确认的结果。答案比面板的外观更能决定我会不会依赖它。

`claude plugin validate` 可以列出模块声明的 hooks 和 API 调用。涉及删除、重置的拦截器，我会先在一次性仓库里检查它能识别什么、漏掉什么。Replay Theater 方便快速浏览一轮改动，最终还得核对文件和测试结果。示例功能看起来只读，也不代表 mod 本身只拥有只读权限。

官方文档称支持版本默认启用 Mods。GitHub 上仍有用户报告某些环境没有加载；我不会把一条 issue 当成普遍故障，但会在实际 session 里用 `/plugin` 确认加载状态。

我愿意让 Agent 把更多状态和动作摆到界面上。面板应说清楚自己给出的是读数、预测还是操作记录。权限、隔离和验收则需要另外的机制来保证。

## 参考资料

- [Addy Osmani：Getting started with Claude Code mods](https://claude.dev/blog/getting-started-with-claude-code-mods/)
- [Claude Code Mods 官方文档](https://code.claude.com/docs/en/plugins/mods/overview)
- [官方创建 Mod 指南](https://code.claude.com/docs/en/plugins/mods/create)
- [Mods API 参考](https://code.claude.com/docs/en/plugins/mods/api)
- [Claude Code 插件安全与信任](https://code.claude.com/docs/en/plugins/security)
- [Anthropic DevRel 的 Claude Code playground](https://github.com/anthropics/claude-code-playground)
- [Token Weather 示例](https://github.com/anthropics/claude-code-playground/tree/main/claude-code/mods/token-weather)
- [Blast Radius 示例](https://github.com/anthropics/claude-code-playground/tree/main/claude-code/mods/blast-radius)
- [Replay Theater 示例](https://github.com/anthropics/claude-code-playground/tree/main/claude-code/mods/replay-theater)
- [Anthropic Claude Code 内置 mods 源码目录](https://github.com/anthropics/claude-code/tree/main/mods)
- [GitHub issue #99130：部分环境下 mod 未加载的报告](https://github.com/anthropics/claude-code/issues/99130)
