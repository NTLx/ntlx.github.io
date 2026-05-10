---
title: Oh My OpenCode 插件
description: OpenCode 多代理编排插件，提供 10+ 专业代理协同工作
---

:::tip[为什么推荐安装]
**Oh My OpenCode（OmO）** 是一个多代理编排插件，为 OpenCode 带来 Claude Code 级别的体验。无论你使用 CLI 还是桌面版，都强烈推荐安装此插件。

| 对比项 | 原生 OpenCode | 安装 Oh My OpenCode 后 |
| :--- | :--- | :--- |
| **代理数量** | 2 个（Build、Plan） | 10+ 个专业代理协同工作 |
| **任务处理** | 单一代理处理所有任务 | 按任务类型自动路由到最佳代理 |
| **模型选择** | 手动切换模型 | 自动为每个代理匹配最佳模型 |
| **并行执行** | 串行处理 | 5+ 个后台代理并行工作 |
| **工具支持** | 基础工具 | 内置 LSP、AST-Grep、Tmux、MCP |
| **持久性** | 可能中途放弃 | Todo Enforcer 确保任务完成 |
| **代码质量** | 可能产生 AI 风格代码 | Comment Checker 确保代码自然 |

**简单来说**：原生 OpenCode 像是一个能干的助手，安装 OmO 后则是一个完整的 AI 开发团队。
:::

:::tip[快速安装]
如需安装 OpenCode，请参阅 [AI Coding CLI 工具一键安装](/ai-tools/install-cli-tools)。
:::

## 安装方法

### 前提条件

确保已安装 Node.js 18+ 和包管理器（npm/bun/yarn/pnpm）。

### 安装命令

```bash
# 推荐：使用 bunx（最快）
bunx oh-my-opencode install

# 或使用 npm
npm install -g oh-my-opencode

# 或使用其他包管理器
bun install -g oh-my-opencode
yarn global add oh-my-opencode
pnpm add -g oh-my-opencode
```

### 验证安装

```bash
# 检查代理是否加载
opencode agent list

# 应显示类似以下输出：
# sisyphus (primary)
# oracle (primary)
# librarian (primary)
# explore (subagent)
# prometheus (primary)
# ...
```

## 内置代理简介

Oh My OpenCode 提供 10+ 个专业化代理，每个代理针对特定任务优化。以下是各代理的推荐模型配置：

:::tip[模型选择原则]
- **Anthropic Claude**: Opus 4.6 适合深度推理和多代理协调；Sonnet 4.6 适合日常编码，性价比高
- **OpenAI GPT**: GPT-5.3-Codex 是专为代理编码优化的旗舰模型
- **开源模型**: Qwen3-Coder、Kimi-K2.5、DeepSeek-V3 等提供隐私保护和成本优势
:::

| 代理 | 推荐模型 | 职责 | 适用场景 |
| :--- | :--- | :--- | :--- |
| **Sisyphus** | Claude Opus 4.6 / Kimi-K2.5 / GLM-5 | 主编排器，规划任务、委派子任务、驱动完成 | 复杂开发任务、日常编码 |
| **Hephaestus** | GPT-5.3-Codex / Claude Sonnet 4.6 | 自主深度工作者，端到端执行无需手把手指导 | 大型功能开发、架构重构 |
| **Prometheus** | Claude Opus 4.6 / Kimi-K2.5 / GLM-5 | 战略规划师，采访式需求分析后生成计划 | 复杂多日项目、新功能规划 |
| **Oracle** | Claude Opus 4.6 / GPT-5.2 / DeepSeek-V3.2 | 架构决策、复杂调试、代码审查 | 架构设计、调试失败后求助 |
| **Librarian** | Gemini 3.1 Flash / Grok Code Fast / Qwen3-Coder-Next | 文档查询、OSS 实现示例搜索 | 查询第三方库文档、找开源实现 |
| **Explore** | Gemini 3.1 Flash / Claude Haiku 4.5 / Qwen3-Coder-Next | 代码库模式搜索、结构理解 | 理解新代码库、找代码模式 |
| **Metis** | Claude Sonnet 4.6 / GPT-5 | 计划前顾问，分析隐藏意图和失败点 | 复杂任务的范围澄清 |
| **Momus** | Claude Sonnet 4.6 / GPT-5 | 计划审查员，检查计划的完整性和清晰度 | 验证生成计划的质量 |
| **Multimodal Looker** | Gemini 3.1 Pro / Claude Sonnet 4.6 | 图像、PDF、图表分析 | 截图分析、文档解读 |

### 模型推荐详解

**编排与规划类代理**（Sisyphus、Prometheus）

| 优先级 | Anthropic | OpenAI | 开源模型 |
| :--- | :--- | :--- | :--- |
| **首选** | Claude Opus 4.6 | - | Kimi-K2.5、GLM-5 |
| **次选** | Claude Sonnet 4.6 | GPT-5.2 | DeepSeek-V3.2 |

- **Claude Opus 4.6**: SWE-bench Verified 80.8%，最适合多代理协调和深度推理
- **Kimi-K2.5**: 开源首选，SWE-bench 领先，支持大规模上下文
- **GLM-5**: 国产开源旗舰，代理编排能力强

**代码生成与深度工作**（Hephaestus）

| 优先级 | Anthropic | OpenAI | 开源模型 |
| :--- | :--- | :--- | :--- |
| **首选** | Claude Sonnet 4.6 | GPT-5.3-Codex | Qwen3-Coder-480B |
| **次选** | Claude Opus 4.6 | GPT-5.2-Codex | DeepSeek-Coder-V2 |

- **GPT-5.3-Codex**: OpenAI 专为代理编码优化的旗舰，Terminal-Bench 77.3%
- **Claude Sonnet 4.6**: SWE-bench 79.6%，性价比极高（$3/$15 vs Opus $15/$75）
- **Qwen3-Coder-480B**: 开源最佳，SWE-bench 70.6%，MoE 架构高效

**调试与架构**（Oracle）

| 优先级 | Anthropic | OpenAI | 开源模型 |
| :--- | :--- | :--- | :--- |
| **首选** | Claude Opus 4.6 | GPT-5.2 xHigh | DeepSeek-V3.2-Speciale |
| **次选** | Claude Sonnet 4.6 | GPT-5 | Kimi-Dev-72B |

- **Claude Opus 4.6**: GPQA Diamond 91.3%，最适合复杂推理
- **DeepSeek-V3.2-Speciale**: 开源最强推理，AIME 2025 87.5%

**快速任务与搜索**（Librarian、Explore）

| 优先级 | Anthropic | OpenAI/Google | 开源模型 |
| :--- | :--- | :--- | :--- |
| **首选** | Claude Haiku 4.5 | Gemini 3.1 Flash | Qwen3-Coder-Next |
| **次选** | Claude Sonnet 4.6 | GPT-5 Nano | Grok Code Fast |

- **Gemini 3.1 Flash**: 最快最便宜，$0.25/$1.50 per 1M tokens
- **Claude Haiku 4.5**: 高吞吐量低延迟，适合批量任务
- **Qwen3-Coder-Next**: 仅 3B 活跃参数，本地运行友好

:::note[数据来源]
模型推荐基于 SWE-bench Verified、LiveCodeBench、Terminal-Bench 等权威基准测试，参考 Anthropic、OpenAI 官方文档以及 Faros AI、Morph 等技术博客的实测数据（2026 年 3 月）。
:::

## 快速上手

### 使用 ultrawork 命令

安装后，最简单的使用方式是输入 `ultrawork`（或简写 `ulw`）：

```
ultrawork 实现用户登录功能，包括表单验证和错误处理
```

这会自动：
1. 启动 Sisyphus 作为主编排器
2. 并行委派任务到专业代理
3. 持续工作直到任务完成

### 使用特定代理

通过 `@` 符号调用特定代理：

```
@oracle 为什么这个异步函数会导致竞态条件？
@librarian 查找 React useEffect 的最佳实践文档
@explore 找到项目中所有使用 Redux 的地方
```

### 规划模式

对于复杂项目，先用 Prometheus 生成计划：

```
/start-work
```

这会进入采访模式，Prometheus 会询问需求细节，然后生成详细的实施计划。

## 配置文件位置

Oh My OpenCode 配置文件位于：

| 配置类型 | 路径 |
| :--- | :--- |
| **全局配置** | `~/.config/opencode/oh-my-opencode.json` |
| **项目配置** | `.opencode/oh-my-opencode.json` |

## 卸载方法

如需卸载：

```bash
# 移除插件配置
jq '.plugin = [.plugin[] | select(. != "oh-my-opencode")]' \
    ~/.config/opencode/opencode.json > /tmp/oc.json && \
    mv /tmp/oc.json ~/.config/opencode/opencode.json

# 删除配置文件（可选）
rm -f ~/.config/opencode/oh-my-opencode.json
```
