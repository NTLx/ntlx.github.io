# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在处理本仓库代码时提供指导。

## 项目概览

这是一个基于 [Astro Starlight](https://starlight.astro.build/) 构建的个人知识库和博客。内容涵盖操作系统、HPC、网络工具、DevOps 和生物信息学等主题。网站托管在 GitHub Pages 上。

## 开发命令

- **安装依赖**: `npm install` (需要 Node.js 22+)
- **启动开发服务器**: `npm run dev` (运行在 http://localhost:4321)
- **构建生产版本**: `npm run build` (输出到 `dist/` 目录)
- **预览生产构建**: `npm run preview`
- **Lint/检查**: TypeScript 使用 `astro/tsconfigs/strict` 配置。package.json 中未定义特定的 lint 命令。

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
  - `src/content.config.ts`: 定义内容集合 (collections) 和 schema。
- **资源**:
  - `public/`: 静态资源，如 `favicon.ico`, `CNAME` 和图片。
- **部署**:
  - `.github/workflows/deploy.yml`: GitHub Actions 工作流，在推送到 `main` 分支时自动构建并部署到 GitHub Pages。

## 内容指南

1.  **添加新页面**:
    - 在 `src/content/docs/` 下的相应子目录中创建 `.md` 或 `.mdx` 文件。
    - 添加至少包含 `title` 的 frontmatter。
    - **重要**: 你必须手动更新 `astro.config.mjs` 中的 `sidebar` 数组，新页面才会出现在导航菜单中。

2.  **Frontmatter 格式**:
    ```yaml
    ---
    title: 页面标题
    description: 可选描述
    ---
    ```

3.  **侧边栏配置**:
    - 导航栏**不会**自动生成。
    - 编辑 `astro.config.mjs` 中的 `sidebar` 来添加新项目。
    - `slug` 使用相对于 `src/content/docs/` 的路径 (不带文件扩展名)。

4.  **语言规范**:
    - 如未指定，默认使用中文撰写博客文章。

## 部署

- 部署通过 GitHub Actions 自动化进行。
- 推送到 `main` 分支会触发构建和部署流程。
- 自定义域名配置通过 `public/CNAME` 处理。

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
