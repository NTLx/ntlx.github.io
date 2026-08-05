---
$schema: starlight
title: 当 AI 把代码产出提速 10 倍，为什么 GitHub 劝你用 Stacked PR？
description: AI 编码 Agent 极易生成上千行的“巨型 PR”，彻底摧毁人工审查效率。GitHub 推出官方堆栈 Pull Request 工具（gh stack），用解耦与级联变基重新定义 AI 时代的人机协作协议。
date: 2026-08-05
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-05-github-ai-pr-stacking-img-00-infographic-core-summary.png)

你是否经历过这样的场景：给 AI Agent 发了一条看起来并不复杂的 Prompt，比如“给电商项目添加商品搜索功能”，去倒杯水的功夫，Agent 就把代码写好了。但当你打开 Pull Request 时，眼前赫然出现了一份改动超过 1500 行的“巨型 PR”（Giant PR）。

从数据库 Schema 定义、种子数据，到 API 路由与输入校验，再到前端组件、状态处理甚至错误回退……Agent 把整个全栈特性的所有代码，一股脑吐进了一个 PR 里。

![PR 代码改动行数从 0 狂飙到 1500+ 行](https://github.blog/wp-content/uploads/2026/08/pr-size-counter.gif)

Gartner 预测，到 2028 年，AI 编码 Agent 将让整个软件开发生命周期（SDLC）提升 50% 的生产力。然而，代码生成得越快，人工审查（Code Review）的瓶颈就越刺眼。如果审查者每次都要面对动辄上千行的改动，后果只有两个：要么 PR 被搁置数天没人敢审，要么审查者产生“审阅疲劳”，不加思索直接点击 Approve——这往往是技术债务和线上事故的开端。

GitHub 工程师 Julia Muiruri 针对这一痛点发文指出：**AI 时代，我们不能再用传统的单体 PR 交付模型。解决审查瓶颈的钥匙，是官方推出的 Stacked Pull Requests（堆栈 PR）及其 CLI 工具链（`gh stack`）。**

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-05-github-ai-pr-stacking-img-01-pr_size_cognitive_explosion.png)

## 为什么传统的“大 PR”在 AI 时代变成了危险品？

在过去的软件工程实践中，保持 PR“小而聚焦”一直是被推崇的原则。但现实中开发者往往在两难中抉择：
1. **忍受大 PR**：把所有改动塞进一个分支，审查起来如同噩梦，但至少自己“省事”；
2. **手操 Stacked PR**：手动切出多个依赖分支（例如分支 A 衍生出分支 B，B 再衍生出 C），但每当底层分支修改时，你必须手动做一遍 `git rebase` 并逐层解冲突，稍有不慎就把 Git 历史搞砸。

当 AI Agent 介入后，这种天平被彻底打破。Agent 的默认行为就是“全量求解”——它不知道你的团队规范，也不懂审查者的认知带宽限制。

正如我们在 [《AI 写的代码，谁来审？》](https://ntlx.github.io/articles/agent-pr-review) 中讨论过的，**AI 时代代码编写的边际成本骤降，但代码审查与所有权的认知成本反而上升了**。审查上千行跨越全栈的代码，意味着审查者需要在数据库、后端 API、前端 UI 多个思维模型之间频繁切换。这种认知过载，直接导致团队交付周期不升反降。

![添加搜索功能前的电商应用初始状态](https://github.blog/wp-content/uploads/2026/08/zava-starting-state.png)

## Stacked PR：把巨型任务解耦为“认知可承载的堆栈”

GitHub 提出的解耦方案非常直观：**不要让 Agent 一次性提交解决整个 Issue 的单体 PR，而是指导它将特性分解为逻辑清晰、单向依赖的分层堆栈（Stack Layer）。**

每一个 PR 只解决一个单一关切（Single Concern），代码改动控制在人类大脑可以轻松装下的范围内，且上文自然向下延伸。

以前面提到的“添加商品搜索”特性为例，最优雅的解耦结构是将其拆分为 4 层堆栈：

| 堆栈层级 (Stack Layer) | 分支名称 | 交付内容 (What to Ship) | 依赖基底 (Depends on) |
| --- | --- | --- | --- |
| **L1** | `feat/catalog-data` | 带有种子数据、校验逻辑的类型化商品目录模块 | `main` (基底) |
| **L2** | `feat/search-api` | 经过参数校验的 `/api/products/search` 后端接口 | `feat/catalog-data` (L1) |
| **L3** | `feat/chat-grounding` | AI 对话助手接入后端 API 并返回真实商品数据 | `feat/search-api` (L2) |
| **L4** | `feat/grounded-ui` | 商品引用卡片组件及前端渲染、加载/错误状态 | `feat/chat-grounding` (L3) |

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-05-github-ai-pr-stacking-img-02-stack_layer_decomposition.png)

这种拆分带来了一个极其重要的工程改变：**独立审查**。
- 负责数据库与后端的工程师只需要审查 L1 和 L2，关注输入校验与数据稳定性；
- 负责前端与交互的工程师只需要审查 L3 和 L4，关注 API 调用与 UI 异常状态。
大家不再需要一口气读完 1700 行代码，审查效率呈指数级提升。

## GitHub `gh stack`：告别“Rebase 地狱”的自动化利器

以往团队不用 Stacked PR 的最大阻力就是“改动同步太繁琐”。GitHub 官方通过 CLI 扩展 `github/gh-stack`（安装命令：`gh extension install github/gh-stack`），把整套流程变成了自动化协议。

整个开发与审查的工作流如下：

### 1. 提交堆栈与可视化地图
本地构建好 4 个依赖分支后，开发者或 Agent 运行：
```bash
gh stack push     # 推送所有分支到远程
gh stack submit   # 一键创建关联的 PR 链
```
此时，GitHub 上的每一个 PR 顶端都会自动渲染一张 **Stack Map（堆栈地图）**。审查者可以一键在层级关联的 PR 之间穿梭，清晰了解当前改动在整体架构中的位置。

![GitHub PR 页面的 Stack Map 组件](https://github.blog/wp-content/uploads/2026/08/Screenshot-2026-08-03-at-8.35.57-PM.png)

### 2. 审查原则：从上往下读意图，从下往上看代码
GitHub 建议审查者采取“**Read top-down, Review bottom-up**”策略：
- **自顶向下读**：先看最顶层（如 L4 UI 层），快速把握这个大 Feature 的最终交付目标；
- **自底向上审**：从最底层（L1 数据层）开始真正 Review 代码。只有当底层接口与契约敲定后，上层代码的审阅才有意义。

### 3. 级联变基（Cascading Rebase）与签名保护
如果在审查 L1 时提出了修改意见，开发者修改 L1 并提交后，上层的 L2、L3、L4 分支就会与最新的 L1 产生偏离（Diverge）。

网页端虽然提供了一个一键“Rebase stack”按钮，但在工程实践中**强烈建议在命令行使用 `gh stack rebase`**：
```bash
gh stack rebase   # 在本地逐层自动化 cascade rebase 并由开发者/Agent 解冲突
gh stack sync     # 一键级联推送并更新所有 PR 状态
```
原因在于：网页端变基会使用 GitHub 的 Web 机器人账号签名，如果团队设置了 Commit 签名保护规则，网页变基可能导致 Commit 签名失效；而本地 `gh stack rebase` 能完美保留开发者自己的 GPG/SSH 密钥签名与正确的 Commit 元数据。

![命令行 gh stack rebase 级联变基演示](https://github.blog/wp-content/uploads/2026/08/Screenshot-2026-08-03-at-8.38.03-PM.png)

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-05-github-ai-pr-stacking-img-03-cascading_rebase_sync.png)

## 总结：AI 时代的工程契约转换

代码生成的廉价化，并没有消解软件工程的复杂性，它只是把复杂性从“打字与逻辑实现”转移到了“系统拆解与认知打包”。

对于使用 AI Agent 的团队来说，Stacked PR 不仅仅是一套 Git 命令的组合，更是**AI 时代人类工程师与 Agent 协作的契约规范**：
- **Prompt 层的改变**：不再向 Agent 提出“帮我实现完整的商品搜索功能”，而是要求 Agent “先建立 L1 基础数据层 PR，验证通过后再生成 L2 接口层”；
- **审查层的改变**：把一次性大考化整为零，降低单次审查的认知负荷；
- **工具链的改动**：借助 `gh stack` 的自动化变基能力，抹平依赖分支的维护摩擦。

当代码像水一样流淌时，容器的形状决定了水的走向。用 Stacked PR 为 AI 生成的代码搭建有条不紊的管道，才是真正让 AI 生产力兑现的基石。

你所在的团队在面对 AI Agent 生成的“巨型 PR”时，有哪些解决审查痛点的尝试？欢迎在评论区分享你的看法。

## 参考资料

- [Turn one giant AI-generated pull request to a reviewable stack](https://github.blog/engineering/turn-one-giant-ai-generated-pull-request-to-a-reviewable-stack/)
- [GitHub gh-stack CLI Extension](https://github.com/github/gh-stack)
- [Gartner Magic Quadrant for Enterprise AI Coding Agents](https://github.blog/ai-and-ml/github-copilot/github-recognized-as-a-leader-in-the-gartner-magic-quadrant-for-enterprise-ai-coding-agents-for-the-third-year-in-a-row/)

## 延伸阅读

- [AI 写的代码，谁来审？](https://ntlx.github.io/articles/agent-pr-review)
- [代码写得快 10 倍，为什么交付反而更卡了？读 Cloudflare ADLC 架构宣言](https://ntlx.github.io/articles/cloudflare-agent-development-lifecycle)
- [给 Agent 写入职手册](https://ntlx.github.io/articles/cloudflare-one-stack-agent-onboarding)
