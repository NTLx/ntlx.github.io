# Repository Agent Governance

本文件是本仓库 repository-wide AI Agent governance 的**唯一共享权威源**。详细规则按领域分散在
path-scoped 文件和 Skill reference；本文件只导航，不复制它们的规则全文。

- **内容 / 发布规则**（frontmatter、URL 稳定性、Starlight、跨平台示例）→ [`src/content/AGENTS.md`](src/content/AGENTS.md)
- **技术博文编写规范** → [`src/content/docs/guides/authoring-guide.md`](src/content/docs/guides/authoring-guide.md)
- **Agent Skills 治理**（自建/第三方/生命周期/版本）→ 本文件「Agent Skills Governance」
- **微信 + 博客双轨发布管线** → [`.agents/skills/wechat-article-write/SKILL.md`](.agents/skills/wechat-article-write/SKILL.md)

## Repository Purpose

基于 [Astro Starlight](https://starlight.astro.build/) 构建的个人知识库 + 博客，托管在 GitHub Pages。除知识库类技术文档（操作系统、HPC、网络工具、DevOps 等）外，还集成微信公众号 + 博客双轨发布管线，目录 `src/content/docs/articles/` 即博客文章。

## Setup / Build / Test

- **安装依赖**：`npm install`（Node.js 22+）；agent 测试/校验需要 `bun`
- **启动开发服务器**：`npm run dev`（运行在 <http://localhost:4321>）
- **构建生产版本**：`npm run build`（输出到 `dist/`）
- **预览生产构建**：`npm run preview`
- **同步内容集合**（新增/重命名 `src/content/docs/` 文件后）：`npx astro sync`
- **清缓存重试**：`rm -rf .astro/ && npm run build`
- **Agent harness 验证**：`npm run test:agent`（bun 单测）+ `npm run check:agent`（架构校验）+ `npm run verify`（三者串联）

## Python / uv 环境

- 本仓库已有 `pyproject.toml` + `uv.lock`，Python 工具依赖必须跟随仓库，由 `uv` 管理。
- 运行任何需要仓库 Python 依赖的脚本时，必须从仓库根目录使用 `uv run python ...`，不要直接用系统 `python` / `python3` 判断依赖是否缺失。
- 首次使用或环境缺失时运行 `uv sync --locked`；需要新增 Python 依赖时用 `uv add --dev <package>` 或项目约定的 dependency group，并提交 `pyproject.toml` 与 `uv.lock`。
- 不得为了解决依赖缺失而执行 `pip install --user ...`、修改全局 Python、或依赖当前机器的系统 site-packages；这会让其他 agent / CI 无法复现。

## Repository Map

- `src/content/docs/`：所有页面（Markdown / MDX），目录大致对应侧边栏分类
- `src/content/docs/articles/`：博客文章；6 个分类索引页基于 frontmatter `category` **动态生成**（见 [`src/content/AGENTS.md`](src/content/AGENTS.md)）
- `src/content/docs/guides/`：知识库类编写规范文档（含 [`authoring-guide.md`](src/content/docs/guides/authoring-guide.md)）
- `src/content.config.ts`：内容集合 schema（含 `date` / `updated` / `category` / `tags`）
- `src/components/`：自定义 Astro 组件
- `posts/YYYY-MM-DD-slug/`：管线中间产物（governance 见 wechat-article-write）；最终产物落到 `src/content/docs/articles/`
- `youtube-transcript/` / `material/`：素材本地存放目录（已 gitignore，不提交）
- `.agents/skills/`：项目级 Skill canonical source（治理见本文件「Agent Skills Governance」）
- `.baoyu-skills/<skill>/EXTEND.md`：第三方技能偏好配置；密钥单独放项目级 `.baoyu-skills/.env`
- `.github/workflows/deploy.yml`：推 `main` → 自动构建并部署到 GitHub Pages
- `public/`：静态资源（`favicon.ico` / `CNAME`）

## Agent Routing

- **写作 / 公众号 / 博客双轨** → `.agents/skills/wechat-article-write/SKILL.md`（策略：`references/strategy-{reader-response,tutorial,news-digest}.md`）
- **内容 docs 编写 / 修改** → `src/content/AGENTS.md`
- **Skills 开发 / 治理** → 本文件「Agent Skills Governance」
- **图片 / 发布 / 其他专用技能** → `.agents/skills/<skill>/SKILL.md`

## Global Safety & Change Rules

| 规则 | 详情 |
| --- | --- |
| **Shell 安全引用** | 所有 shell 脚本中涉及用户提供的路径必须使用引号包裹（`"$var"`），防止路径含空格或特殊字符时命令注入或路径断裂 |
| **严格遵守 `.gitignore`** | 任何被 `.gitignore` 或其他 git ignore 规则排除的文件/目录，默认都视为**不应提交**。Agent 不得使用 `git add -f`、修改 ignore 规则或其他绕过方式提交，除非用户明确要求 |
| **第三方技能禁止擅自修改** | 见本文件「Agent Skills Governance」（managed / vendored 不得私改；custom 遵循 metadata 版本规范） |
| **内容 / URL 稳定性** | 见 [`src/content/AGENTS.md`](src/content/AGENTS.md)（不重命名 `articles/`、正文禁 H1、文件名 kebab-case） |

## 内容分发质量守则

为防止自动流水线在复杂操作中级联故障，agent 在执行任何多步内容构建或发布任务时，必须严格遵守以下工程铁律：

1. **幂等操作与状态回滚**：多步文件处理出错后**严禁**对脏文件继续打补丁。验证失败必须从上一个干净备份（`draft.md`）重新生成，或 `git checkout` 恢复原状。复杂 DOM / 文本树修改优先用解析器或内置技能，不要临时拼凑内联 Python。

2. **防呆检查与验证驱动执行（VDE）**：向外部生产环境（公众号 / GitHub）提交数据前必须做终态验证：
   - 检查最终 Markdown / HTML 格式（异常空行、未解析占位符）
   - 检查所有引用图片的本地路径真实存在
   - 严禁"写完代码 → 立刻执行发布"的开环盲盒操作

3. **路径绝对化**：跨脚本 / 跨目录工具链统一用绝对路径，**严禁**基于直觉猜测 CWD 行为；批量处理工具运行前先验证目录层级。

4. **发布输入源校验**：博客轨（Step 6.1）输入必须是 `article.md`（CDN URL 版）；微信轨（Step 6.2）输入必须是 `article-wechat.html`（本地路径版 HTML），严禁混用。

5. **覆盖发布备份位置**：`publish-blog.mjs --overwrite` 的备份自动落在 `posts/.backups/`（gitignore 的管线区），不在 `src/content/docs/` 内，不会生成 Starlight 重复页面。如需清理，`ls posts/.backups/` 后手动删除即可。

## Agent Skills Governance

### Skills canonical source and lifecycle

- 项目级 Skill 位于 `.agents/skills/<skill>/`，每个 Skill 以 `SKILL.md` 为入口，配套
  `scripts/` 和 `references/`；`.agents/skills/` 是 canonical source。
- Skill 可通过 Skill 工具读取工作流，或按其文档用 `bun run` 执行脚本；用 `npx skills` 管理
  安装版本，`skills-lock.json` 是安装锁，不是全技能 manifest。
- `.claude/skills/<skill>` 等 runtime-specific discovery path 只能是指向 canonical source 的
  thin alias / symlink，不得变成第二套 Skill 实现。

一个 Skill 同时只能属于一种生命周期：

| 类别 | 判定 | 规则 |
|---|---|---|
| **custom** | frontmatter `metadata.author: NTLx` | 项目自建；遵循 Agent Skills spec；`metadata.author` / `metadata.version` 是自建标识；可直接修改 |
| **managed** | 由 `npx skills` / `skills-lock.json` 安装 | 不本地修改；更新后运行 integration tests |
| **vendored** | 需要访问上游内部资源而 pin | 记录 upstream / commit / 本地 patch（若有）；更新必须通过 compatibility test |

仓库内置第三方 Skill 统一以 git subtree vendoring 到 `.agents/skills/<skill>/`，禁止提交带内层
`.git/` 的 clone 或 gitlink。同步上游使用：
`git subtree pull --prefix=.agents/skills/<skill> <upstream-url> <branch> --squash`。

### Skill authoring and dependency rules

- 自建 Skill frontmatter 遵循：`name`、`description`、`license: MIT`，以及
  `metadata.author`、`metadata.version`；`author` / `version` 不得放在顶层。
- 行为变更（增删步骤、替换调用 Skill、修改门控逻辑）升 minor；纯文档或注释修正升 patch；
  不升版本即视为改动不完整。
- description 只写触发条件，不写实现细节、pipeline 步骤或产物格式；每项任务只选择最匹配的
  1–2 个 Skill，重叠触发面优先收敛。
- `.agents/skills/` 下由 `npx skills` 管理的第三方 Skill（如 `baoyu-*`、`ljg-*`）不得擅自
  修改源码；更新版本不受此限制。
- `wechat-article-write/SKILL.md` 是写作步骤和固定业务委托的唯一来源；它依赖的第三方 Skill
  由 `check-deps.mjs` 检查，第三方 Skill 的行为、参数和配置仍以其自身文档及项目配置为准。
  不维护父 Skill 的 research、understanding 或 writing 能力目录。

### Orchestration and verification

对于声明 Main Agent 为 planning-only 的 orchestrator，实际文件生产、工具调用、Skill 执行和
deterministic command 必须委托到与 Main 上下文隔离的 execution context。具体隔离机制由运行时
Agent 根据可用能力自行选择；Main 不得因运行时差异接管实际执行。

每次 Skill 改动后运行 `npm run test:agent` 与 `npm run check:agent`；架构校验覆盖自建
frontmatter、必需 Skill、引用文件、retired 组件和确定性入口。第三方 Skill 升级后运行
`check-deps.mjs --stage architecture`。

## Runtime compatibility

Repository contracts define capabilities and boundaries, not product-specific orchestration APIs.
Runtime-specific adapters may exist only for discovery or instruction loading, and must remain thin
aliases/imports rather than a second workflow implementation。

允许的例子包括 `CLAUDE.md → @AGENTS.md`、`src/content/CLAUDE.md → @AGENTS.md` 以及
`.claude/skills/* → .agents/skills/*`；不得添加 Claude-specific、Codex-specific 或 Pi-specific
workflow。

## 部署

- 推 `main` → GitHub Actions 自动构建 + 部署到 <https://ntlx.github.io/>；自定义域名走 `public/CNAME`
- 手动触发：Actions 页面运行 "Deploy to GitHub Pages" 工作流
- **部署性故障 vs 构建性故障判定**：看失败 step 落在 Build job 还是 Deploy job；Build ✓ + Deploy ✗ = 平台侧故障
  - **两张部署侧故障面**：(a) Deploy 卡 queued 超时 = Pages 部署队列拥塞，查 [githubstatus.com](https://www.githubstatus.com) 恢复后重试；(b) Deploy 503（`HttpError: No server...`）= Actions API 间歇性 503，直接 rerun
  - **排查**：`gh run view --log-failed` 在 503 期间反复报错，绕过用 `curl -H "Authorization: token $(gh auth token)" .../actions/runs/<RUN_ID>/logs` 拉日志 zip 后 grep `##[error]`
  - **决策**：构建失败 → 查代码修复 push 新 commit；部署失败 + 平台故障 → 等 5–10min 或 rerun，不改代码；部署失败 + 平台全绿 → 查 workflow `permissions`（需 `pages: write` + `id-token: write`）与 configure/deploy-pages action 版本

## 学术论文素材与原图提取指南

在处理学术论文（arXiv、ACL、IEEE、USENIX 等）素材并需要**复用原文图表**时，必须确保图表排版与文字的绝对准确：

**arXiv HTML/SVG 避坑**：严禁直接提取 standalone `<svg>` 渲染——LaTeXML 生成的 SVG 深度依赖外层父级容器 CSS 类、矩阵坐标变换和全局 Web 字体，独立截图会文字倒置、图例挤压。

**标准方案（矢量 PDF 高清裁切）**：
1. 拉取官方 PDF（`https://arxiv.org/pdf/<arxiv-id>`）到本地；
2. 用 PyMuPDF 300 DPI 视口裁切：`uv run --with pymupdf python`，`pymupdf.Matrix(300/72, 300/72)` + `clip` 预留 5-10pt 呼吸留白；
3. 多图边界用 `page.get_text('blocks')` 打印目标图表及周边图注坐标，微调 `y0`/`x0` 排除上下段落；
4. **终态视觉验证（VDE）**：每张提取后逐张检查文字/图例/坐标轴标记完整、图注无段落污染。

## 联网工具选择与内容获取

### 工具选择

| 场景 | 首选 | 限制 |
|---|---|---|
| 搜索发现 | Tavily Search / Anysearch | 每次最多 10 条 |
| URL 已知，提取正文 | Jina Reader 或 Tavily Extract | Jina 20 RPM |
| 语义搜索（找同类页面/人物公司） | Exa Web Search | 免费额度有限 |
| 原始 HTML / meta 检查 | curl | 不处理 JS 渲染 |

- **配额降级**：Tavily 返回 HTTP `432`（套餐额度耗尽）→ 改用 Anysearch / Exa / WebSearch 组合，不重复重试 Tavily
- **Jina 用法**：`curl https://r.jina.ai/https://example.com/article`；不保留 URL 前缀；文章类页面适用，数据面板/商品页不适用；微信公众号文章有 CAPTCHA 概率，批量抓取不推荐
- 需求发现 → 搜索；URL 已知 → 提取正文；验证信息 → 访问一手来源，不依赖二手报道

### 付费墙 / 登录墙降级链

单一来源被墙 ≠ 内容不可获取，按序尝试：
1. archive.ph / archive.org 存档
2. 多源二手报道（Exa / Anysearch / Tavily 按文章标题或核心论点搜转载/引用/讨论）
3. 社交媒体讨论（Bluesky / Reddit / HN 常含关键引用和摘要）
4. Google Cache

404 Media 付费文成功案例：archive.ph + TechCrunch/Bloomberg Law/Simon Willison 等 8+ 二手来源交叉验证还原全文。

## Verification

每次改动后按仓库惯例运行对应验证：

```bash
npm run test:agent   # wechat-article-write bun 单测（含 golden behavior 契约）
npm run check:agent  # validate-architecture.mjs 架构静态校验
npm run build        # Astro 生产构建
```
