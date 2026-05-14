# AGENTS.md

此文件为所有 AI agent（Qoder / Claude Code / skills runner 等）在本仓库工作时的共享入口约定。详细规范分散在以下三个权威文件，本文件仅做入口聚合：

- 微信 + 博客双轨发布管线 → [`.agents/skills/wechat-article-write/SKILL.md`](.agents/skills/wechat-article-write/SKILL.md)
- 技术博文编写规范 → [`src/content/docs/guides/authoring-guide.md`](src/content/docs/guides/authoring-guide.md)
- web 联网约定 → [`.agents/skills/web-access/SKILL.md`](.agents/skills/web-access/SKILL.md)

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
- `.baoyu-skills/<skill>/EXTEND.md`：技能偏好配置（必须入库；密钥单独放 `~/.baoyu-skills/.env`）
- `.github/workflows/deploy.yml`：推 `main` → 自动构建并部署到 GitHub Pages
- `public/`：静态资源（`favicon.ico` / `CNAME`）

## Skill 系统入口

- 项目级技能在 `.agents/skills/`，每个技能一个目录，含 `SKILL.md`（执行入口）、`scripts/`（可执行脚本）、`references/`（参考文档）
- 调用方式两种：**Skill 工具调用型**（读 `SKILL.md` 走工作流）/ **脚本执行型**（`bun run <skill>/scripts/...`）
- 用 `npx skills` 管理版本，锁文件 `skills-lock.json` 入库
- 可通过 `<skill>/EXTEND.md` 调整运行时行为（`quick_mode`、`preferred_image_backend` 等），各技能 `SKILL.md` 内列出可配置项

## 管线入口（wechat-article-write）

完整 15 阶段流水线（Step 0–10，含 2.5 / 4.5 / 4.6 / 9.5）见 [`.agents/skills/wechat-article-write/SKILL.md`](.agents/skills/wechat-article-write/SKILL.md)，关键事实：

- **发布顺序**：博客先发（Step 9）→ 等 Pages 部署（Step 9.5）→ 微信草稿（Step 10），保证微信"阅读原文"链接 HTTP 200
- **图床前置**：Step 4.6 在生成 HTML 前先把图片上传图床并产出 `image-map.json`，Step 5 同时生成 `article.md`（CDN 版）/ `article-local.md`（降级备份）
- **CDN 降级**：Step 8 / Step 10 通过 `scripts/run-with-cdn-fallback.sh` 自动切换，详见 [`references/cdn-fallback.md`](.agents/skills/wechat-article-write/references/cdn-fallback.md)
- **状态写入强制**：每步完成后必须写入 `posts/<slug>/.pipeline-state.json`（通过 `state.mjs set`），断点续跑依赖此文件——状态写入不是可选的
- **blog-slug ≠ date-slug**：date-slug 是 `posts/` 下的本地目录名（可含中文）；blog-slug 是 `articles/` 下的 URL 文件名（必须纯 ASCII kebab-case，`^[a-z][a-z0-9-]*[a-z0-9]$`）。当 date-slug 含中文时，Step 2.5 写入 `blogSlug` 到 frontmatter，Step 9 通过 `--blog-slug` 显式传入
- **阅读原文链接**：`--source-url` 从 Step 10 全链贯通（publish-wechat → post-draft → wechat-api → 微信 `content_source_url`），必须传入博客文章 URL
- **article-local.md 禁用于发布**：该文件仅是 CDN 降级备份，Step 9 博客发布和 Step 10 微信发布必须使用 `article.md`（CDN 版）
- 所有 inline bash / sed 链已脚本化到 `scripts/`，agent 不必再手写 frontmatter / sed / curl 轮询

## 硬规则

| 规则 | 详情 |
| --- | --- |
| **URL 稳定性** | 不重命名、不移动 `articles/` 下已有文章。已有 60+ 篇文章 URL（如 `ntlx.github.io/articles/<slug>/`）已被外部引用，移动 = 全网 404 |
| **正文禁止 H1** | Starlight 自动把 frontmatter `title` 渲染为 `<h1>`。正文不得以 `# ` 开头，否则页面双标题 |
| **文件名 kebab-case** | `articles/` 下文件名必须为小写 ASCII kebab-case；`AI-Foo.md` 与 `ai-foo.md` 视为同名冲突；标题字段可任意语言 |
| **MDX JSX 中文引号** | `<LinkCard title="…"`" …" />` 含中文引号 / `<` / `>` 等会触发 MDX 解析错误，改用模板字符串 `title={`…`}` |
| **Sidebar autogenerate v0.39+** | `autogenerate` 必须嵌套在 `items: [{ autogenerate: { ... } }]` 内，不能作为 group 顶层属性 |
| **Git 跟踪** | `.agents/skills/` ✅ 入库；`.claude/skills/` ❌（gitignore，符号链接）；`skills-lock.json` ✅；`posts/` ❌（gitignore） |
| **Pipeline state 强制写入** | 管线每步完成后必须 `state.mjs set`，断点续跑和失败恢复依赖 `.pipeline-state.json`——跳过状态写入 = 断点续跑失效 |
| **article-local.md 禁发布** | `article-local.md` 仅作 CDN 降级备份，禁止用于 Step 9（博客）或 Step 10（微信）发布，必须用 `article.md`（CDN 版） |

## 部署

- 推 `main` → GitHub Actions 自动构建 + 上传 GitHub Pages → 部署到 <https://ntlx.github.io/>
- 自定义域名走 `public/CNAME`
- 手动触发：在 Actions 页面运行 "Deploy to GitHub Pages" 工作流

## 内容分发质量守则

为防止自动流水线在复杂操作中级联故障，agent 在执行任何多步内容构建或发布任务时，必须严格遵守以下工程铁律：

1. **幂等操作与状态回滚**：多步文件处理（sed / Python / 内联脚本）出错后**严禁**对脏文件继续打补丁。验证失败必须从上一个干净备份（如 `draft.md` / `article-local.md`）重新生成，或 `git checkout` 恢复原状。复杂 DOM / 文本树修改优先用解析器或内置技能，不要临时拼凑内联 Python。

2. **防呆检查与验证驱动执行（VDE）**：向外部生产环境（公众号 / GitHub）提交数据前必须做终态验证：
   - 检查最终 Markdown / HTML 格式（异常空行、未解析占位符）
   - 检查所有引用图片的本地路径真实存在
   - 严禁"写完代码 → 立刻执行发布"的开环盲盒操作（管线已通过 `validate-pipeline.sh` 提供阶段化校验）

3. **路径绝对化**：跨脚本 / 跨目录工具链统一用绝对路径，**严禁**基于直觉猜测 CWD 行为；批量处理工具运行前先验证目录层级。

4. **发布输入源校验**：Step 9（博客）和 Step 10（微信）的输入文件必须是 `article.md`（CDN URL 版），**严禁**使用 `article-local.md`（本地路径降级备份）作为发布输入——该文件头已标注警告，但脚本层不拦截，靠 agent 自觉遵守。

## 技术博文编写规范

迁移至 [`src/content/docs/guides/authoring-guide.md`](src/content/docs/guides/authoring-guide.md)（联网工具、跨平台命令、Asides、代码块、Git 提交等）。
