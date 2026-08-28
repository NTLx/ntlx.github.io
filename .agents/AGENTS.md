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

## Skill 分层（决策记录）

写作管线只把 **workflow.mjs 中声明为 required 的技能** 作为硬依赖（缺失 = 阻断）；其余为 optional toolbox，缺失不阻断，按需加载：

- **核心**（workflow.mjs `DEPENDENCIES[*].required`）：`ljg-qa`/`ljg-think`/`ljg-writes`/`baoyu-format-markdown`/`baoyu-cover-image`/`baoyu-article-illustrator`/`baoyu-image-gen`/`baoyu-infographic`/`github-image-hosting`/`gzh-design`/`baoyu-post-to-wechat`
- **optional（按需）**：`aihot`/`last30days`/`ljg-read`/`ljg-rank`/`ljg-constraint`/`ljg-plain`/`ljg-learn`/`ljg-paper`/`ljg-book`/`ljg-roundtable`/`ljg-invest`/`ljg-word`/`renwei-writing`/`humanizer-zh`/`baoyu-youtube-transcript`/`baoyu-translate`

它们仍由 `npx skills` 安装并受 lock 管理；本分层只约束「哪些缺失会阻断流程」，不改变安装方式。

## 校验与测试

- 每次改动后运行 `npm run test:agent`（bun 测试）+ `npm run check:agent`（`validate-architecture.mjs` 静态校验）
- 架构校验覆盖：自建 frontmatter 合规 / 必需技能存在 / 无悬空 skill 引用 / strategy 文件存在 / symlink 完整 / SKILL.md 引用脚本存在 / skills-lock 覆盖 managed
- 升级第三方技能后跑 `check-deps.mjs --stage architecture`