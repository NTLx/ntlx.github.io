# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在处理本仓库代码时提供指导。

## 项目概览

这是一个基于 [Astro Starlight](https://starlight.astro.build/) 构建的个人知识库和博客，同时集成了微信公众号文章写作管线。内容涵盖操作系统、HPC、网络工具、DevOps、生物信息学以及商业/科技评论等主题。网站托管在 GitHub Pages 上。

## 开发命令

- **安装依赖**: `npm install` (需要 Node.js 22+)
- **启动开发服务器**: `npm run dev` (运行在 http://localhost:4321)
- **构建生产版本**: `npm run build` (输出到 `dist/` 目录)
- **预览生产构建**: `npm run preview`
- **Lint/检查**: TypeScript 使用 `astro/tsconfigs/strict` 配置。package.json 中未定义特定的 lint 命令。

:::note[测试命令]
本项目目前没有定义单元测试或端到端测试脚本。如需添加测试，建议使用 Astro 的内置测试支持或 Vitest。
:::

## 工具脚本

- **文档迁移**: `python3 migrate_docs.py` - 将旧版 Markdown 文件从 `docs/` 迁移到 `src/content/docs/`，自动添加 frontmatter 并将 GitHub Alerts 转换为 Starlight Asides。

## 架构与结构

- **框架**: Astro v5 + Starlight v0.37
- **配置**:
  - `astro.config.mjs`: 主配置文件。定义了网站标题、集成、Google Analytics 以及**侧边栏导航结构**。
  - `package.json`: 依赖和脚本。
- **内容**:
  - `src/content/docs/`: 包含所有文档页面 (Markdown/MDX)。
  - 目录结构大致对应侧边栏分类 (例如 `operating-systems/`, `hpc-cluster/`, `devops/`)。
  - `src/content/docs/articles/`: 微信公众号文章写作管线产出的文章。
  - `src/content.config.ts`: 定义内容集合 (collections) 和 schema。
- **组件**:
  - `src/components/`: 自定义 Astro 组件，用于扩展 Starlight 主题功能。
- **资源**:
  - `public/`: 静态资源，如 `favicon.ico`, `CNAME` 和图片。
- **部署**:
  - `.github/workflows/deploy.yml`: GitHub Actions 工作流，在推送到 `main` 分支时自动构建并部署到 GitHub Pages。

## Skill 系统

- 项目级技能位于 `.agents/skills/`，每个技能是一个包含 `SKILL.md` 的目录
- 技能通过 EXTEND.md 配置运行时行为（`quick_mode`、`preferred_image_backend` 等），配置路径在各技能 SKILL.md 中定义
- 调用技能时读取其 `SKILL.md` 中的工作流指令
- 技能分两种调用方式：**Skill 工具调用型**（baoyu-cover-image、ljg-writes、humanizer-zh、baoyu-article-illustrator）通过 Skill 工具加载 SKILL.md 执行；**脚本执行型**（baoyu-imagine、github-image-hosting 等）查找 `scripts/` 目录执行脚本
- 脚本执行使用 `bun run`（非 `bun x`）
- 使用 `npx skills` 管理技能版本，版本锁文件为 `skills-lock.json`

## wechat-article-write 管线

- **输出目录**：中间产物在 `posts/YYYY-MM-DD-slug/`（gitignored），最终文章在 `src/content/docs/articles/`
- **13 步流水线（Step 0-11，含 Step 4.5）**：依赖预检 → 资料收集 → 创作 → 封面 → 插图 → 信息图 → 图床 → CDN整合 → 去AI痕迹 → 格式化 → HTML → 发布到微信 → 发布到博客
- Step 1 联网优先使用 web-access CDP（继承用户 Chrome 登录态），搜索优先 google.com/ncr；bailian MCP 工具仅作补充搜索，不参与 URL 内容提取降级链
- 封面不上传图床，直接用于公众号素材库；插图走 GitHub 图床 CDN
- **Step 11（发布到博客）**：封面图上传 GitHub 图床 → 复制 article.md 到 `src/content/docs/articles/`（summary→description，封面图 CDN 链接作为首行）→ 更新 astro.config.mjs 侧边栏

### 文章文件命名规则

管线产出的博客文章文件名必须遵守 Starlight 的 slug 约束：
- **小写 ASCII kebab-case**：`ai-era-company-moat.md`，不能用中文或大写字母
- **slug 来源于文件名**：sidebar 中的 `slug: 'articles/xxx'` 必须与文件名（不含 .md）完全一致
- **中文标题放 frontmatter**：文件名是 URL 路径，标题是显示内容，两者独立

### 运行须知

- **CDN 缓存**：新图上传 jsDelivr 后需 2-3 分钟稳定传播，Step 9 HTML 转换和 Step 10 发布都可能超时——两者均有自动重试 + 本地路径降级策略
- **Gemini 构图**：16:9 下强制居中，两侧留暗边。prompt 无效，需改用水平分割/左右对比类构图概念（详见 `.agents/skills/wechat-article-write/references/image-backends.md`）
- **图片后端优先级**：Gemini > Seedream > DashScope。DashScope 审核最严（安全类术语易触发 DataInspectionFailed），失败自动降级
- **baoyu-fetch**：无扩展名 bash 脚本，必须直接执行（不能 `bun run`）
- **caption 同步**：插图概念变更时需手动检查文章中的图片说明文字是否匹配
- **Step 6 自动化**：CDN 路径替换应遍历 image-map.json 键值对依次调用 Edit 工具，不要逐个手动替换
- **Step 11 frontmatter 转换**：`summary` → `description`，添加 `$schema: starlight`，移除 `coverImage`（封面图已作为正文首行 CDN 链接）

## 内容指南

1.  **添加新页面**:
    - 在 `src/content/docs/` 下的相应子目录中创建 `.md` 或 `.mdx` 文件。
    - 添加至少包含 `title` 的 frontmatter。
    - **重要**: 你必须手动更新 `astro.config.mjs` 中的 `sidebar` 数组，新页面才会出现在导航菜单中。
    - **侧边栏分类**: 目前支持的分类包括：AI 辅助编程、操作系统、HPC 与集群、网络与代理、DevOps 与工具、生物信息学、指南、文章。

2.  **Frontmatter 格式**:
    ```yaml
    ---
    title: 页面标题
    description: 可选描述
    ---
    ```

    管线产出的文章使用扩展 frontmatter：
    ```yaml
    ---
    $schema: starlight
    title: 文章标题
    description: 文章摘要
    date: 2026-05-10
    coverImage: https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/cover.jpg
    ---
    ```

3.  **侧边栏配置**:
    - 导航栏**不会**自动生成。
    - 编辑 `astro.config.mjs` 中的 `sidebar` 来添加新项目。
    - `slug` 使用相对于 `src/content/docs/` 的路径 (不带文件扩展名)。

4.  **语言规范**:
    - 如未指定，默认使用中文撰写博客文章。

## 踩坑记录

从实际开发中总结的关键约束，违反会导致构建失败或内容丢失。

### 文件名必须为小写 ASCII kebab-case

Starlight 的内容集合（content collection）对文件名有严格限制：

- **不支持中文文件名**：包含非 ASCII 字符的文件名不会被内容集合收录，`getEntry` 无法找到对应条目，构建时报 `The slug specified in the Starlight sidebar config does not exist`
- **slug 自动转小写**：`AI-eval-costs-bottleneck.md` 的 slug 是 `articles/ai-eval-costs-bottleneck`（全小写），sidebar 配置中写大写会导致构建失败
- **标题可以是中文**：文件名是 URL 的一部分（必须 ASCII），标题只是显示用的标签（可以任意语言）

正确做法：
```
文件名：ai-era-company-moat.md
frontmatter title：产品可以抄，但公司的形状抄不走
sidebar slug：articles/ai-era-company-moat
```

### 图片必须使用 CDN URL，禁止本地路径

文章中的图片引用必须是完整的 CDN URL，不能是相对路径（如 `imgs/xxx.jpg`）。

- 本地路径会导致构建失败：Astro 尝试解析图片时找不到文件，报 `Could not find requested image`
- 即使图片文件存在于 `posts/` 目录中也不行——`posts/` 被 `.gitignore` 排除，不会进入构建流程
- 正确的图片 URL 格式：`https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/xxx.jpg`

管线 Step 6（CDN 整合）负责将 `article.md` 中的本地路径替换为 CDN URL。如果发现文章中仍有本地路径，说明 Step 6 未完成，需要手动修复。

### Frontmatter 字段映射

微信管线和 Starlight 使用不同的字段名：

| 微信管线字段 | Starlight 字段 | 说明 |
|---|---|---|
| `summary` | `description` | 必须转换，Starlight 不识别 `summary` |
| `title` | `title` | 一致，无需转换 |
| `date` | 自定义字段 | Starlight schema 不要求，但保留用于排序 |
| `coverImage` | 自定义字段 | 用于 OG 标签，Starlight schema 不要求 |
| — | `$schema: starlight` | 管线文章需手动添加，告知 Starlight 使用其 schema |

管线 Step 11（发布到博客）会自动处理 `summary` → `description` 的转换和 `$schema` 字段的添加。

### 构建验证检查清单

每次修改内容或配置后，按顺序执行：

1. `npx astro sync` — 同步内容集合（新增/删除/重命名文件后必须执行）
2. `npm run build` — 验证构建成功
3. 如果构建失败且原因不明确，清除缓存重试：`rm -rf .astro/ && npm run build`

常见构建失败原因：
- sidebar slug 与实际文件名不匹配（大小写、中文）
- 文章引用了不存在的本地图片
- frontmatter 格式错误（缺少 `title`）

## 部署

- 部署通过 GitHub Actions 自动化进行。
- 推送到 `main` 分支会触发构建和部署流程。
- 自定义域名配置通过 `public/CNAME` 处理。

**部署流程**:
1. 推送代码到 `main` 分支
2. GitHub Actions 自动运行构建任务
3. 构建产物上传到 GitHub Pages
4. 网站自动部署到 https://ntlx.github.io/

**手动触发部署**:
- 在 GitHub 仓库的 Actions 页面手动运行 "Deploy to GitHub Pages" 工作流

## 文档编写最佳实践

### 联网搜索与浏览器使用

1. **优先使用 BrowserOS MCP 工具**：
   - 当需要访问互联网时，使用 BrowserOS MCP 中的工具（如 `browser_navigate`, `browser_get_page_content`）
   - 搜索引擎优先使用 `google.com/ncr`
   - 避免使用 `WebFetch` 工具，因为 BrowserOS 提供更好的浏览器模拟和内容提取能力

2. **访问官方文档的流程**：
   - 使用 `browser_navigate` 导航到目标 URL
   - 使用 `browser_get_load_status` 检查页面加载状态
   - 使用 `browser_get_page_content` 获取页面文本内容（而非截图）
   - 对于长文档，使用 `page` 参数进行分页获取

### 技术博文编写规范

1. **信息层次设计**：
   - 采用"是什么 → 为什么 → 怎么做 → 出问题怎么办"的结构
   - 使用渐进式信息披露，避免一次性抛出过多信息

2. **跨平台兼容性**：
   - 技术教程必须同时提供 Linux/macOS/Windows 三个平台的命令示例
   - Windows 命令使用 PowerShell，并添加容错参数（如 `-ErrorAction SilentlyContinue`）
   - 为不同 Shell（Bash/Zsh/Fish）提供对应的配置方法
   - 对于 Unix-only 工具（如 tmux、proxychains），提供 WSL 安装指南作为 Windows 替代方案

3. **Starlight Asides 组件使用**：
   - `:::tip` - 用于提供额外的上下文或解释设计理念
   - `:::caution` - 用于警告用户可能的数据丢失或不可逆操作
   - `:::note` - 用于补充说明
   - 示例：
     ```markdown
     :::caution[重要提示]
     删除这些文件将清除你的登录会话。建议先备份。
     :::
     ```

4. **代码块规范**：
   - 为代码块添加语言标识符（bash, powershell, json, toml 等）
   - 为复杂命令添加注释说明
   - 提供"临时生效"和"永久生效"两种配置方式
   - **检查中文引号**：用户粘贴的代码（尤其是 JSON）可能使用中文引号 `""`，需修正为英文引号 `""`

5. **外部链接引用**：
   - 引用官方文档时使用 Markdown 链接格式，并说明链接内容
   - 例如：`根据 [Claude Code 官方文档](https://code.claude.com/docs/zh-CN/settings)`

### 环境变量配置文档模式

当编写环境变量配置指南时，应包含：

1. **优先级说明**：明确环境变量 > 配置文件的优先级
2. **临时配置**：使用 `export`（Unix）或 `$env:`（PowerShell）的单行命令
3. **永久配置**：
   - Unix: 编辑 `.bashrc`/`.zshrc` 或使用 `echo >> ~/.zshrc`
   - Windows: 系统环境变量（GUI）、PowerShell Profile、或 `SetEnvironmentVariable`
4. **多种选择**：为不同技能水平的用户提供多种配置方案

### 故障排除章节编写

1. **问题导向**：直接列出用户可能遇到的具体症状
2. **提供选择**：如"完全重置"vs"精确操作"，满足不同需求
3. **风险提示**：在执行危险操作前使用 `:::caution` 明确告知后果
4. **引用权威**：引用官方文档增加可信度

### 开发服务器使用

- 使用 `npm run dev` 启动开发服务器（运行在 http://localhost:4321）
- 可以使用 `run_in_background: true` 参数在后台运行
- 使用 BrowserOS 工具预览修改效果，而非直接访问文件系统
- 大型文件（如 privoxy.md）可能超出 token 限制，使用 `limit` 参数分块读取

### Git 提交规范

使用 Conventional Commits 格式：
```
docs: 简短描述（不超过 50 字符）

- 详细说明修改内容（如果需要）
- 使用列表格式说明多个变更点
```

示例：
```
docs: 优化 Claude Code 配置文件删除说明

- 添加基于官方文档的配置文件详细列表
- 增加删除操作的警告提示
- 提供完全重置和精确删除两种方案
- 改进跨平台命令的容错性
```
