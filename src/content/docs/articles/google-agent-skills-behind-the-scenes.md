---
$schema: starlight
title: 1.5 万 Stars 背后：Google 揭秘 Agent Skills 的工业化构建与治理真相
description: 提示词调优时代已经终结。Google Agent Skills 幕后团队披露：真正决定 Agent 技能成败的不是写法，而是包含 CI/CD 自动化检测、连续 2x2 评测矩阵与 OWNER 责任制的工业化治理体系。
date: 2026-08-04
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-04-google-agent-skills-behind-the-scenes-img-00-infographic-core-summary.png)

在 GitHub 上斩获超过 1.5 万颗 Star 的开源项目 [google/skills](https://github.com/google/skills)，最初只是 Google Cloud Next 2026 前夕由开发者关系与技术文档工程师发起的一场跨部门突击（Swarm）。它的初衷非常直白：把 Google Cloud 庞杂的领域知识打包成 AI Agent 可精准读取的结构化指令，解决编码 Agent 在调用云服务时的上下文膨胀（Context Bloat）、API 滥用与代码幻觉问题。

然而，随着内部各大产品团队（从 Google Cloud 到 Google Ads）纷至沓来申请贡献技能，Google 团队很快撞上了一个所有 Agent 基础设施团队都避无可避的难题：**当贡献者从几个人扩展到几十个团队，如何防止开源 Skill 仓库迅速演变为混乱、失效且不可维护的“垃圾场”？**

Google AI 团队的 Remigiusz Samborski 最近在 DEV.to 撰文，首次完整披露了 Google Agent Skills 从代码规范、自动化 CI 门控到连续 2x2 评估矩阵的幕后细节。这篇复盘给当下风头正劲的 Agent 开发者们敲响了警钟：**提示词手工作坊的时代已经结束，Skills are Products, Not Snippets（Skill 是活的产品，而非一次性代码片段）。**

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-04-google-agent-skills-behind-the-scenes-img-01-github_stars_growth.png)

## 拆解 Agent Skill 的工程骨架：为什么必须优先 Remote MCP？

在许多人的固有印象中，Agent Skill 无非就是一段写得很长的系统 Prompt。但 Google 团队为所有规范化技能确立了严格的目录解剖结构（Anatomy）：

```plaintext
{skill-name}/
├── SKILL.md                 # 必需：主指令与 frontmatter 元数据
├── OWNERS                   # 必需：Skill 维护者列表（内部私有）
├── EVAL.yaml                # 必需：评估 Prompt 集与评分标准（内部私有）
├── reference/               # 可选：深度技术文档与 Schema
├── scripts/                 # 可选：可执行辅助脚本
├── assets/                  # 可选：静态资源与架构图
└── _internal/               # 可选：测试 Mock 与内部数据（内部私有）
```

在这个结构中，主指令 `SKILL.md` 与评价标准 `EVAL.yaml`、维护归属 `OWNERS` 被严格解耦。更重要的是其架构设计上的指导原则：**尽可能优先引用远程 Model Context Protocol (MCP) 工具，仅在必要时回退到 CLI 或 API 调用。**

我们在之前的文章《[同一天，OpenAI、Runway、Google 都选了 MCP——一个协议的临界点](https://ntlx.github.io/articles/mcp-tipping-point)》中探讨过，MCP 协议赋予了 Agent 统一的工具调度边界。Google 强调首选远程 MCP，是因为远程 MCP 服务器不仅能以标准化 API 方式暴露操作能力，还能天然集成企业级 Auth 鉴权与 IAM 权限治理——这是把 Agent 引入生产环境的安全底线。

为了保证公开仓库的干净，Google 建立了一套公开导出机制（Public Export）：技能先在内部构建、验证并跑通评测，发布到 GitHub 时自动剥离内部数据、OWNERS 文件和私有评估套件。

## 提交时的防呆门控：用 Rust 写的 Lychee 彻底消除幻觉链接

当几十个团队各自编写 Skill 时，随意拼写的目录名、超长的文档、尤其是随手黏贴或模型幻觉生成的 URL，会直接导致 Agent 执行中断或陷入死循环。

Google 建立了一套合并前的 CI/CD 管线，要求任何 Skill 必须通过三道门:

1. **结构静态校验 (Linters)**：严格检查元数据、目录命名规范和行数上限。
2. **死链硬拦截 (Link Checkers)**：使用基于 Rust 开发的高速链接校验工具 [lychee](https://lychee.cli.rs/) 测试每一个 URL。在 Merge 前把所有 404 和死链干掉。
3. **AI 结构化检查清单**：通过自动化验证检查，确认指令符合要求的结构化模式与安全护栏。

对于开源开发者，Google 在 GitHub 上提供了 [`skills-ref`](https://github.com/agentskills/agentskills/tree/main/skills-ref) 校验工具（即 `agentskills validate`），可以通过 GitHub Actions 在 PR 阶段自动运行静态检查：

```yaml
name: 'Validate Skills'
on:
  push:
    branches: ['main']
  pull_request:
    branches: ['main']

jobs:
  validate:
    runs-on: 'ubuntu-latest'
    steps:
      - uses: 'actions/checkout@v4'
      - uses: 'actions/setup-python@v5'
        with:
          python-version: '3.12'
      - name: 'Install skills-ref'
        run: pip install skills-ref
      - name: 'Validate skills'
        run: |
          for skill_dir in skills/*/; do
            agentskills validate "$skill_dir"
          done
```

死链拦截看似是个微不足道的细节，但在 Agentic 体系中至关重要。Agent 一旦顺着失效文档链接进行推理，会产生严重的“自我补全”幻觉。把 `lychee` 挂载到 CI 管线，直接用物理手段切断了这种幻觉根源。

## 连续评测（Continuous Evals）：用 2x2 矩阵量化完成率与 Token 成本

“在我的机器上能跑通”是软件工程著名的坏味道，而在 Agent 领域，这句话变成了“在我的模型上试过好像可以”。

正如我们在《[别再折腾花哨的 AI 技巧了：为什么 GitHub AI 负责人说 Harness 才是全部？](https://ntlx.github.io/articles/github-copilot-the-harness-is-all-you-need)》中强调的，底层 API 会改版，LLM 模型会迭代，Agent Harness 也会频繁更新。一个今天表现完美的 Skill，一个月后可能因为模型微调或 API 参数变更而彻底失效。

为了防止技能静默腐烂，Google 建立了连续评估机制：

* **提交前评估 (On-submit Evals)**：作者必须随 Skill 提交测试 Prompt 套件和评分标准（Rubrics），对比带有该 Skill 与不带该 Skill 时 Agent 的表现。
* **每周定时巡检 (Weekly Evals)**：每周自动对全量技能库跑评测，提前捕捉因模型或 API 漂移导致的性能衰退。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-04-google-agent-skills-behind-the-scenes-img-02-evals_matrix_2x2.jpg)

Google 的评估维度拒绝抽象的评分，而是聚焦于两个硬指标组成的 2x2 矩阵：

1. **准确率 (Accuracy)**：响应质量与任务完成率（Completion Rate）。
2. **效率 (Efficiency)**：完成任务消耗的 Token 数量与执行时间。

只有当一个 Skill 在 2x2 矩阵中同时展现出**准确率提高**且**Token/耗时下降**（即落入右上角象限），它才被允许合并。更进一步，Google 会在多个不同的 Agent 框架上并发跑多次 Evals，以获取具备统计显著性的数据。

## 重新定义生命周期：从 Snippet 到 Living Product

在过去，很多人把 Agent Skill 看作一种“代码片段”（Snippet）——写完放进 README，或者丢进 gist 就算完事。

Google 幕后团队得出的最核心结论是：**Skill 必须被当成活的产品（Living Product）来运维。**

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-04-google-agent-skills-behind-the-scenes-img-03-skills_product_lifecycle.png)

为了支撑产品的生命周期，Google 明确了双层所有权划分：
* **Repo maintainers（仓库维护者）**：掌控 CI 管线、基础设施、架构规范与 Lychee 检查规则。
* **Skill owners（技能归属者）**：每个 Skill 必须在 `OWNERS` 文件中明确责任团队。当产品 API 变更或 Weekly Evals 报警时，Skill owner 必须限期修复，否则该技能将被剔除。

为了帮助开发者降低编写规范 Skill 和 Evals 的门槛，Google 还在内部开发了基于 [ADK (Agent Development Kit)](https://adk.dev/) 的多 Agent 辅助写作工作流，让 Agent 互相进行指令生成与自我批判（Self-critique），并支持团队内部专用的 "DevRel Skills" 自动化处理 SEO、文档格式转换与日常周报。

## 个人与中小团队的工业化三步落地法

看完了 Google 的这套幕后体系，或许有人会担忧：我们没有 Google 那么庞大的 Evals 算力与基础设施，这套做法是否过于厚重？

答案恰恰相反。Google 探索出的核心逻辑完全可以被轻量化裁剪。建议所有在做 Agent 应用或开源 Skill 的开发者，按照以下三步建立自己的治理防护网：

1. **第一步：建立标准目录模板**  
   别再把所有提示词塞进单文件。将 `SKILL.md`、引用文档 `reference/` 和依赖工具解耦，优先对接 MCP。
2. **第二步：挂载静态 CI 与 Lychee 检测**  
   在 GitHub Repository 中引入 `skills-ref` 与 `lychee` Actions。零成本干掉死链与语法错误，这是最划算的防呆投资。
3. **第三步：构建 3-5 个 Baseline Evals 测试集**  
   不需要做复杂的每周全量巡检，但在合并或修改 Skill 前，务必用固定 Prompt 跑对比测试，记录 Token 消耗与成功率。

当 Agent 竞争进入下半场，谁能率先把提示词手工作坊升级为自动化流水线，谁才能在频繁变更的模型与 API 浪潮中构建出真正可靠的 Agentic 生产力。

---

*你在使用或编写 Agent Skill 时，是否也遇到过 API 变更导致技能失效或 Token 异常飙升的问题？你目前是如何做 Agent 的单元测试与评估的？欢迎在评论区分享你的实战经验。*

## 参考资料

- [Behind the scenes: How we build, test, and scale Google Agent Skills](https://dev.to/googleai/behind-the-scenes-how-we-build-test-and-scale-google-agent-skills-1am5)
- [Google Agent Skills GitHub Repository](https://github.com/google/skills)
- [agentskills/skills-ref Validator](https://github.com/agentskills/agentskills/tree/main/skills-ref)
- [Lychee Fast Link Checker](https://lychee.cli.rs/)
- [Google Agent Development Kit (ADK)](https://adk.dev/)

## 延伸阅读

- [别再折腾花哨的 AI 技巧了：为什么 GitHub AI 负责人说 Harness 才是全部？](https://ntlx.github.io/articles/github-copilot-the-harness-is-all-you-need)
- [同一天，OpenAI、Runway、Google 都选了 MCP——一个协议的临界点](https://ntlx.github.io/articles/mcp-tipping-point)
- [让 AI 写代码不再翻车：一个 TypeScript 巫师的 5 个 Agent Skills](https://ntlx.github.io/articles/5-agent-skills-for-ai-coding)
