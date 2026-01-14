---
title: Google Antigravity 最佳实践
description: Google Antigravity 也就是现在的 AI-native IDE 的最佳实践指南，包含高效 Prompt 和工作流建议。
---

Google Antigravity 是一个基于 "Agent-first" 理念构建的下一代集成开发环境（IDE）。与传统的代码补全工具（如 Copilot）不同，Antigravity 引入了自主 Agent 的概念，它们可以在编辑器、终端和浏览器中自主规划、执行和验证任务。

本文整理了在 Antigravity 中进行开发的最佳实践和高效 Prompt，帮助你从单纯的 "Coding" 转向 "Managing Agents"。

## 核心理念：从编码到指挥

在使用 Antigravity 时，最关键的思维转变是将自己视为**技术负责人（Tech Lead）**，而将 IDE 中的 AI Agent 视为**能够不知疲倦工作的初级开发者**。

*   **Mission Control**: 使用 Agent Manager 分派任务。
*   **Artifacts**: 在 Agent 写代码前，先要求它生成计划或设计文档（Artifacts）。这是你控制质量的关键环节。
*   **Vibe Coding**: 描述你想要的感觉或通过截图传达意图，让 Agent 处理实现细节。

## 最佳实践与高效 Prompts

### 1. 项目上手与文档 (Onboarding)

让 Agent 帮你快速理解和整理新项目。

*   **生成 README**:
    > "Analyze my entire project structure and create a README.md that explains the architecture, key technologies used, and how to start the development server."
*   **依赖审查**:
    > "Scan my package.json and list all dependencies. Flag any that are outdated or deprecated and suggest modern alternatives."

### 2. 代码重构 (Refactoring)

Antigravity 擅长处理多文件的重构任务。

*   **DRY 原则重构**:
    > "Identify one file in this directory that violates DRY (Don't Repeat Yourself) principles. Create a plan to refactor it without breaking functionality."
*   **添加注释**:
    > "Go through `auth_service.js` and add JSDoc comments to every function that lacks them. Infer the types from the code logic."
*   **技术债清理**:
    > "Analyze existing utility functions and propose a plan to modernize them to ES6+ syntax while maintaining backward compatibility."

### 3. 调试与修复 (Debugging)

利用 Agent 的多模态和终端执行能力来调试。

*   **堆栈追踪分析**:
    > "I'm getting this error: [paste stack trace]. Analyze the traceback, identify the file and line number responsible, and explain why it crashed."
*   **复现脚本**:
    > "My server crashes when I send an empty JSON body to `/login`. Reproduce this issue with a test script, fix the validation logic, and verify it no longer crashes."
*   **Git 回溯**:
    > "I broke the login feature sometime in the last 5 commits. Analyze the git diffs for `auth.js` and tell me which commit likely introduced the bug."

### 4. 前端开发 (Frontend & Vibe Coding)

利用内置浏览器进行视觉验证。

*   **截图转代码**:
    > （粘贴截图）"Look at this design screenshot. Replicate this layout using Tailwind CSS. Pay attention to the padding and font weights."
*   **响应式检查**:
    > "Launch the browser and verify if the navbar collapses correctly on mobile viewports. If it breaks, fix the CSS media queries."
*   **风格调整**:
    > "I want this landing page to feel more 'cyberpunk'. Update the CSS variables to use neon greens and dark purples, and add a glowing effect to all primary buttons."

### 5. 测试驱动开发 (Testing)

Antigravity 是执行 TDD 的绝佳搭档。

*   **生成测试套件**:
    > "Write a comprehensive unit test suite for `payment_gateway.py`. Include cases for successful payments, declined cards, and network timeouts."
*   **先写测试**:
    > "I want to create a new 'Search' feature. Write the failing tests first based on these requirements, then wait for me to approve them before implementing the code."
*   **端到端测试**:
    > "Create a Playwright script that visits the homepage, logs in with test credentials, and adds an item to the cart."

## 常见问题排查：登录卡顿与失败

由于网络环境或账号地区限制，部分用户在登录 Antigravity 时可能会遇到“无限转圈”或“地区不支持”的问题。以下是三种经过验证的解决方案：

1.  **网络层：开启 Tun 模式**
    *   Antigravity 是独立的应用程序，普通的系统代理可能无法接管其流量。
    *   请确保你的网络工具开启了 **Tun (虚拟网卡) 模式**，这将强制所有流量（包括非 HTTP 流量）走代理通道。这是最直接有效的方案。

2.  **工具辅助：使用 Antigravity Tools**
    *   如果网络设置无误但仍无法登录，可以使用开源工具 **Antigravity Tools** (Antigravity-Manager)。
    *   该工具提供了“强行登录”功能，通过 OAuth 绕过客户端验证。具体操作可参考本站的另一篇指南：[Antigravity Tools 最佳实践](/ai-tools/antigravity-proxy-best-practices)。

3.  **账号层：检查地区设置**
    *   访问 [Google Terms](https://policies.google.com/terms) 查看账号归属地。如果是中国地区，建议申请更改为其他支持地区（如美、日、新）。
    *   检查 [Google Pay 设置](https://pay.google.com/gp/w/home/settings)，移除不支持地区的付款资料，确保默认付款资料为支持地区。

## 成功秘诀

1.  **Review Artifacts**: 永远不要跳过对 Agent 生成的计划（Artifacts）的审查。这是防止 Agent "走偏" 的最好护栏。
2.  **明确范围**: 如果任务涉及超过 10 个文件，先让 Agent 在一个单独的分支中工作，或者先生成一个摘要 Artifact。
3.  **利用内置浏览器**: 在进行前端修改时，明确要求 Agent "Open the browser and verify the changes"。
4.  **保持怀疑**: Agent 可能会犯错，特别是在复杂的逻辑或最新的库版本上。保持 Code Review 的习惯。

Antigravity 代表了编程方式的一种转变。通过掌握这些 Prompt 和工作流，你可以将重复性的编码工作外包给 AI，从而专注于架构设计和核心逻辑的实现。
