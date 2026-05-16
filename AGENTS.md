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

## 管线概览（wechat-article-write）

完整 15 阶段流水线（Step 0–10，含 2.5 / 4.5 / 4.6 / 9.5）见 [`.agents/skills/wechat-article-write/SKILL.md`](.agents/skills/wechat-article-write/SKILL.md)，本文件只记关键约束：

- **发布顺序**：博客先发（Step 9）→ 微信草稿（Step 10）。sourceUrl 预先填入，不等 Pages 部署即发布（约 1-3 分钟 404 窗口）
- **状态写入全内聚**：每个 Step 完成后由对应脚本自动写入 `.pipeline-state.json`，agent 不需要手动调用 `state.mjs set`。脚本启动时自动写 `running` 状态（`writeRunning`），提供实时可观测性
- **状态监控**：`state-watch.mjs` 可实时监控管线状态变化（`bun run state-watch.mjs <date-slug> --watch`）
- **blog-slug ≠ date-slug**：date-slug 是 `posts/` 下的本地目录名（可含中文）；blog-slug 是 `articles/` 下的 URL 文件名（必须纯 ASCII kebab-case）
- **双轨分离**：博客轨只消费 `article.md`（Markdown + CDN URL），不生成 HTML；微信轨使用 `article-local.md` → `article-wechat.html`（本地 imgs/ 路径），wechat-api.ts 直接读本地文件上传
- 所有 inline bash / sed 链已脚本化到 `scripts/`，agent 只调用脚本、解读退出码
- **run-with-cdn-fallback.sh 已废弃**：微信轨全程本地文件操作（零 CDN 依赖），博客轨不生成 HTML，CDN 降级场景不存在

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
   - 严禁"写完代码 → 立刻执行发布"的开环盲盒操作（管线已通过 `validate-pipeline.sh` 提供阶段化校验，含 `step4`/`step45`/`step9-input`/`step10-input`/`syntax-check` 入口校验）

3. **路径绝对化**：跨脚本 / 跨目录工具链统一用绝对路径，**严禁**基于直觉猜测 CWD 行为；批量处理工具运行前先验证目录层级。

4. **发布输入源校验**：Step 9（博客）的输入文件必须是 `article.md`（CDN URL 版）；Step 10（微信）的输入文件是 `article-wechat.html`（本地路径版 HTML），严禁混用。

## 技术博文编写规范

迁移至 [`src/content/docs/guides/authoring-guide.md`](src/content/docs/guides/authoring-guide.md)（联网工具、跨平台命令、Asides、代码块、Git 提交等）。
