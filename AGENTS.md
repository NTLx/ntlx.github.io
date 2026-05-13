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

完整管线定义见 `.agents/skills/wechat-article-write/SKILL.md`。

- **输出目录**：中间产物在 `posts/YYYY-MM-DD-slug/`（gitignored），最终文章在 `src/content/docs/articles/`
- **13 步流水线（Step 0-11，含 Step 4.5）**：依赖预检 → 资料收集 → 创作 → 封面 → 插图 → 信息图 → 图床 → CDN整合 → 去AI痕迹 → 格式化 → HTML → 发布到微信 → 发布到博客
- **Step 11（发布到博客）**：复制 article.md 到 `src/content/docs/articles/`（summary→description，移除 coverImage）→ 更新 astro.config.mjs 侧边栏

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

- **不支持中文文件名**：包含非 ASCII 字符的文件名不会被内容集合收录，构建时报 `The slug specified in the Starlight sidebar config does not exist`
- **slug 自动转小写**：`AI-eval-costs-bottleneck.md` 的 slug 是 `articles/ai-eval-costs-bottleneck`（全小写），sidebar 配置中写大写会导致构建失败
- **标题可以是中文**：文件名是 URL 的一部分（必须 ASCII），标题只是显示用的标签（可以任意语言）

正确做法：
```
文件名：ai-era-company-moat.md
frontmatter title：产品可以抄，但公司的形状抄不走
sidebar slug：articles/ai-era-company-moat
```

### 构建验证检查清单

每次修改内容或配置后，按顺序执行：

1. `npx astro sync` — 同步内容集合（新增/删除/重命名文件后必须执行）
2. `npm run build` — 验证构建成功
3. 如果构建失败且原因不明确，清除缓存重试：`rm -rf .astro/ && npm run build`

常见构建失败原因：
- sidebar slug 与实际文件名不匹配（大小写、中文）
- 文章引用了不存在的本地图片

### 正文禁止 H1 标题

Starlight 自动将 frontmatter `title` 渲染为 `<h1>`。正文中**不得**以 `# 标题` 开头，否则页面会出现两个标题。管线 Step 2（创作）和 Step 11（发布）都需要注意这一点。

错误：`# 当写代码不再需要写代码`（正文第一行）
正确：直接以段落或 `##` 二级标题开始正文

### Git 跟踪规则

- `.agents/skills/` — 技能源文件，**必须入库**
- `.claude/skills/` — Claude Code 自动生成的符号链接，**已通过 .gitignore 排除**
- `skills-lock.json` — 技能版本锁文件，**必须入库**
- frontmatter 格式错误（缺少 `title`）

### 管线相关踩坑

图片 CDN URL 要求、Frontmatter 字段映射、CDN 缓存策略等管线特定约束，详见 `.agents/skills/wechat-article-write/SKILL.md` 的"博客发布约束"章节。

## 内容分发质量守则

为了防止自动流水线在复杂操作中发生级联故障，Agent 在执行任何多步内容构建或发布任务时，必须严格遵守以下工程铁律：

1. **幂等操作与状态回滚 (Idempotence & State Rollback)**：
   在执行多步文件处理（如 sed 替换、Python 脚本修改文件）时，严禁在发生错误后对已损坏的文件（Dirty State）继续打补丁。如果验证失败，必须从上一个干净的备份（如 `draft.md`）重新生成，或执行 `git checkout` 恢复原状。禁止使用临时拼凑的内联 Python 脚本进行复杂的 DOM/文本树修改，应优先使用可靠的解析器或内置技能。

2. **防呆检查 (Sanity Checks) 与 验证驱动执行 (VDE)**：
   对于任何向外部生产环境（如微信公众号、GitHub 仓库）提交数据的操作，必须在执行提交命令前进行终态验证。
   - 必须抽查最终 Markdown/HTML 的格式（例如是否存在异常的空行、未解析的占位符）。
   - 必须通过检查文件树确认所有被引用的本地图片路径真实存在。
   - 绝对禁止“写完代码/脚本后立刻执行发布”的开环盲盒操作。

3. **路径绝对化规范 (Path Safety)**：
   在编排跨脚本或跨目录的工具链时，必须优先计算和传递绝对路径（Absolute Paths）。在使用批量处理工具时，必须验证目标目录的层级结构，严禁基于直觉猜测工具的 CWD（当前工作目录）行为。

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
