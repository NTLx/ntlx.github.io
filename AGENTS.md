# AGENTS.md

此文件为所有 AI agent（Qoder / Claude Code / skills runner 等）在本仓库工作时的共享入口约定。详细规范分散在以下权威文件，本文件仅做入口聚合：

- 微信 + 博客双轨发布管线 → [`.agents/skills/wechat-article-write/SKILL.md`](.agents/skills/wechat-article-write/SKILL.md)
- 技术博文编写规范 → [`src/content/docs/guides/authoring-guide.md`](src/content/docs/guides/authoring-guide.md)
- 行为准则 → [`CLAUDE.md`](CLAUDE.md)（与用户级 `~/CLAUDE.md` 合并生效）

## 项目定位

基于 [Astro Starlight](https://starlight.astro.build/) 构建的个人知识库 + 博客，托管在 GitHub Pages。除知识库类技术文档（操作系统、HPC、网络工具、DevOps 等）外，还集成微信公众号 + 博客双轨发布管线，目录 `src/content/docs/articles/` 即博客文章。

## 开发命令

- **安装依赖**：`npm install`（Node.js 22+）
- **启动开发服务器**：`npm run dev`（运行在 <http://localhost:4321>）
- **构建生产版本**：`npm run build`（输出到 `dist/`）
- **预览生产构建**：`npm run preview`
- **同步内容集合**（新增/重命名 `src/content/docs/` 文件后）：`npx astro sync`
- **清缓存重试**：`rm -rf .astro/ && npm run build`

## 目录结构

- `src/content/docs/`：所有页面（Markdown / MDX），目录大致对应侧边栏分类
- `src/content/docs/articles/`：博客文章；6 个分类索引页（`ai-coding/ai-agents/ai-industry/ai-models/security/engineering`.mdx）基于 frontmatter `category` **动态生成**，新增文章只需写对 `category`
- `src/content/docs/guides/`：知识库类编写规范文档（含 [`authoring-guide.md`](src/content/docs/guides/authoring-guide.md)）
- `src/content.config.ts`：内容集合 schema（含 `date` / `updated` / `category` / `tags`）
- `src/components/`：自定义 Astro 组件
- `posts/YYYY-MM-DD-slug/`：管线中间产物（`.gitignore`），最终产物落到 `src/content/docs/articles/`
- `.agents/skills/`：项目级技能源（必须入库）
- `.baoyu-skills/<skill>/EXTEND.md`：技能偏好配置（必须入库；密钥单独放项目级 `.baoyu-skills/.env`，已被 `.gitignore` 忽略）
- `.github/workflows/deploy.yml`：推 `main` → 自动构建并部署到 GitHub Pages
- `public/`：静态资源（`favicon.ico` / `CNAME`）

## Skill 系统入口

- 项目级技能在 `.agents/skills/`，每个技能一个目录，含 `SKILL.md`（执行入口）、`scripts/`（可执行脚本）、`references/`（参考文档）
- 调用方式两种：**Skill 工具调用型**（读 `SKILL.md` 走工作流）/ **脚本执行型**（`bun run <skill>/scripts/...`）
- 用 `npx skills` 管理版本，锁文件 `skills-lock.json` 入库
- 可通过 `<skill>/EXTEND.md` 调整运行时行为（`quick_mode`、`preferred_image_backend` 等），各技能 `SKILL.md` 内列出可配置项
- **第三方技能本地补丁**：`baoyu-post-to-wechat`（基准版本 `1.118.0`）由 `npx skills` 管理，升级可能覆盖本地补丁。当前 `wechat-article-write` 依赖 `.agents/skills/baoyu-post-to-wechat/scripts/wechat-api.ts` 支持 `--source-url` 并写入微信公众号草稿字段 `content_source_url`，用于把博客 URL 作为"原文链接"。升级后若微信草稿缺少原文链接，先检查 `wechat-article-write/SKILL.md` 的"第三方技能本地补丁记录"并复查 `source-url|content_source_url|sourceUrl`
- **第三方技能升级时的版本追踪**：当用户明确说第三方技能已升级或调整时，Agent 必须主动读取 `baoyu-post-to-wechat/SKILL.md` frontmatter 的 `version` 字段，与本文件及 `wechat-article-write/SKILL.md` 中的基准版本对比。若版本变化，同时更新两处的基准版本记录，并复查 `--source-url` 补丁是否被覆盖

## 管线概览（wechat-article-write）

6 步流水线（Step 1–6）见 [`.agents/skills/wechat-article-write/SKILL.md`](.agents/skills/wechat-article-write/SKILL.md)，本文件只记关键约束：

- **发布顺序**：博客先发（Step 6.1）→ 微信草稿（Step 6.2）。sourceUrl 预先填入，不等 Pages 部署即发布
- **微信原文链接**：Step 6.2 必须把博客 URL（`https://ntlx.github.io/articles/<blog-slug>`）作为微信公众号"原文链接"传入；该能力依赖 `baoyu-post-to-wechat` 的本地 `--source-url` 补丁
- **状态管理**：每个 Step 脚本完成后写 `last_complete_step`。`state.mjs next` 返回下一个待执行步骤，支持断点续跑。Step 6 博客/微信子状态独立管理：`state.mjs blog <slug> get` / `state.mjs wechat <slug> get` 查询
- **blog-slug ≠ date-slug**：date-slug 是 `posts/` 下本地目录名（可含中文）；blog-slug 是 `articles/` 下 URL 文件名（必须纯 ASCII kebab-case）
- **双轨分离**：博客轨消费 `article.md`（Markdown + CDN URL）；微信轨消费 `article-wechat.html`（本地路径版 HTML），wechat-api.ts 直接读本地文件上传。两轨零共享中间产物
- 所有校验逻辑已封装在 step 脚本内，agent 只调用脚本、解读退出码

## 管线脚本架构

脚本分为三层：门控脚本（step1-4）、构建脚本（step5-6）、共享库。

| 层 | 脚本 | 说明 |
|---|---|---|
| 门控 | `step1-collect` ~ `step4-images` | Agent 完成智能判断后运行，脚本做校验 + 状态写入 |
| 构建 | `step5-build` / `publish-blog` / `publish-wechat` | 确定性自动化，无需 agent 干预 |
| 共享 | `validation-lib` / `frontmatter-lib` / `state-lib` / `path-resolver` / `config-lib` | 被多个脚本 import，消除重复实现 |

共享库中 `frontmatter-lib.mjs` 提供 `parseFrontmatter` / `readFmValue` / `extractBody`，替代此前 4 个脚本各自内联的 frontmatter 解析。`validation-lib.mjs` 提供 `VALID_CATEGORIES` / `ASCII_SLUG_RE` / `countWords`，统一分类白名单、slug 规则和字数统计。

## 硬规则

| 规则 | 详情 |
| --- | --- |
| **URL 稳定性** | 不重命名、不移动 `articles/` 下已有文章。已有 60+ 篇文章 URL（如 `ntlx.github.io/articles/<slug>/`）已被外部引用，移动 = 全网 404 |
| **正文禁止 H1** | Starlight 自动把 frontmatter `title` 渲染为 `<h1>`。正文不得以 `# ` 开头，否则页面双标题 |
| **文件名 kebab-case** | `articles/` 下文件名必须为小写 ASCII kebab-case；`AI-Foo.md` 与 `ai-foo.md` 视为同名冲突；标题字段可任意语言 |
| **MDX JSX 中文引号** | `<LinkCard title="…"`" …" />` 含中文引号 / `<` / `>` 等会触发 MDX 解析错误，改用模板字符串 `title={`…`}` |
| **Sidebar autogenerate v0.39+** | `autogenerate` 必须嵌套在 `items: [{ autogenerate: { ... } }]` 内，不能作为 group 顶层属性 |
| **Git 跟踪** | `.agents/skills/` ✅ 入库；`.claude/skills/` ❌（gitignore，符号链接）；`skills-lock.json` ✅；`posts/` ❌（gitignore） |
| **Shell 安全引用** | 所有 shell 脚本中涉及用户提供的路径必须使用引号包裹（`"$var"`），防止路径含空格或特殊字符时命令注入或路径断裂 |
| **第三方技能禁止擅自修改** | `.agents/skills/` 下由 `npx skills` 管理的第三方技能（`baoyu-*`、`ljg-*` 等），Agent 不得擅自修改其源码（SKILL.md、scripts、references）。必须征得用户明确同意才能修改。`npx skills` 更新版本不受此限制，但更新后必须复查已知本地补丁是否被覆盖（见 Skill 系统入口的补丁记录） |

## 部署

- 推 `main` → GitHub Actions 自动构建 + 上传 GitHub Pages → 部署到 <https://ntlx.github.io/>
- 自定义域名走 `public/CNAME`
- 手动触发：在 Actions 页面运行 "Deploy to GitHub Pages" 工作流

## 内容分发质量守则

为防止自动流水线在复杂操作中级联故障，agent 在执行任何多步内容构建或发布任务时，必须严格遵守以下工程铁律：

1. **幂等操作与状态回滚**：多步文件处理出错后**严禁**对脏文件继续打补丁。验证失败必须从上一个干净备份（`draft.md`）重新生成，或 `git checkout` 恢复原状。复杂 DOM / 文本树修改优先用解析器或内置技能，不要临时拼凑内联 Python。

2. **防呆检查与验证驱动执行（VDE）**：向外部生产环境（公众号 / GitHub）提交数据前必须做终态验证：
   - 检查最终 Markdown / HTML 格式（异常空行、未解析占位符）
   - 检查所有引用图片的本地路径真实存在
   - 严禁"写完代码 → 立刻执行发布"的开环盲盒操作（各 step 脚本内嵌阶段化校验）

3. **路径绝对化**：跨脚本 / 跨目录工具链统一用绝对路径，**严禁**基于直觉猜测 CWD 行为；批量处理工具运行前先验证目录层级。

4. **发布输入源校验**：Step 6.1（博客）输入必须是 `article.md`（CDN URL 版）；Step 6.2（微信）输入必须是 `article-wechat.html`（本地路径版 HTML），严禁混用。

## 技术博文编写规范

迁移至 [`src/content/docs/guides/authoring-guide.md`](src/content/docs/guides/authoring-guide.md)（联网工具、跨平台命令、Asides、代码块、Git 提交等）。