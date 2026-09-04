# Agent Skills 治理（`.agents/`）

本文件是所有 Agent Skills 开发与维护的**唯一治理来源**。根 `AGENTS.md` 只做导航；技能内部细节在各 SKILL.md / references。

## Skills 存放与调用

- 项目级技能源在 `.agents/skills/<skill>/`，每个技能含 `SKILL.md`（执行入口）、`scripts/`（可执行脚本）、`references/`（参考文档）
- 调用方式两种：**Skill 工具调用型**（读 `SKILL.md` 走工作流）/ **脚本执行型**（`bun run <skill>/scripts/...`）
- 用 `npx skills` 管理版本，锁文件 `skills-lock.json`（安装锁，不是全技能 manifest）
- `.claude/skills/<skill>` 若存在，应是指向 `.agents/skills/<skill>` 的本地 symlink，不再单独 clone 第二份技能代码

## 生命周期分类

一个 Skill 同时只能属于一种生命周期：

| 类别 | 判定 | 规则 |
|---|---|---|
| **custom** | frontmatter `metadata.author: NTLx` | 项目自建；遵循 Agent Skills spec；`metadata.author` / `metadata.version` 是自建标识；可直接修改 |
| **managed** | 由 `npx skills` / `skills-lock.json` 安装 | 不本地修改；更新后跑 integration tests |
| **vendored** | 需要访问上游内部资源而 pin | 明确 upstream / commit / 本地 patch（若有）；更新必须过 compatibility test |

仓库内置第三方技能统一用 **git subtree** vendoring 到 `.agents/skills/<skill>/`，禁止提交带内层 `.git/` 的 clone 或 gitlink。同步上游：`git subtree pull --prefix=.agents/skills/<skill> <upstream-url> <branch> --squash`

## 自建 Skill frontmatter 规范

遵循 Agent Skills 当前规范：

```yaml
---
name: <skill-name>
description: <触发面描述>
license: MIT
metadata:
  author: NTLx
  version: "x.y.z"
---
```

- `author` / `version` **必须**位于 `metadata`，不残留顶层
- 行为变更（增删步骤、替换调用技能、修改门控逻辑）升 minor；纯文档/注释修正升 patch；不升版本 = 改动不完整

## 第三方 Skill 禁止擅自修改

`.agents/skills/` 下由 `npx skills` 管理的第三方技能（`baoyu-*`、`ljg-*` 等），Agent 不得擅自修改其源码（SKILL.md、scripts、references）。必须征得用户明确同意才能修改。`npx skills` 更新版本不受此限制。

## description 边界

- description 只描述**触发条件**（Use when / 什么场景），不写实现细节、不写 pipeline 步骤、不写产物格式
- 每个任务只选择最匹配的 1-2 个技能；description 触发面重叠的优先收敛

## 写作管线依赖

`wechat-article-write/SKILL.md` 是写作步骤和固定业务委托的唯一来源。它要求的第三方 Skill 由 `check-deps.mjs` 检查是否安装；每个第三方 Skill 的行为、参数和配置仍以它自己的 `SKILL.md` 与项目配置为准。研究和写作能力按实际任务由运行时自然发现，不维护父 Skill 的能力目录。

对于复杂 orchestrator Skill，如果其合同声明 Main Agent 为 planning-only，实际文件生产、工具调用、Skill 执行和 deterministic command 必须由独立 Worker Subagent 完成；Main Agent 不得以执行方便为由接管 Worker 工作。

所有第三方技能仍由 `npx skills` 安装并受 `skills-lock.json` 管理；本节不缓存另一份路由或依赖注册表。

## 校验与测试

- 每次改动后运行 `npm run test:agent`（bun 测试）+ `npm run check:agent`（`validate-architecture.mjs` 静态校验）
- 架构校验覆盖：自建 frontmatter 合规 / 必需技能存在 / 本 Skill 引用文件存在 / retired 组件不在场 / 关键确定性入口存在
- 升级第三方技能后跑 `check-deps.mjs --stage architecture`
