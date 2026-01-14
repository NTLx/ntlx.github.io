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
