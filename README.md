# NTLx's Blog

[![Built with Astro Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

我的个人博客，基于 [Astro Starlight](https://starlight.astro.build) 构建，托管在 GitHub Pages 上。

## 内容方向

技术随笔为主，覆盖 AI 工具使用、操作系统、DevOps、生物信息学等话题。文章风格偏「有感而发」——读了什么东西、踩了什么坑、想通了什么道理，写下来。

## 双重发布能力

本仓库集成了完整的文章写作与发布流水线，支持两条路径同时产出：

### 博客文章

直接在 `src/content/docs/` 下创建 Markdown 文件，推送到 `main` 分支后通过 GitHub Actions 自动部署到 [ntlx.github.io](https://ntlx.github.io/)。

### 微信公众号文章

通过 `wechat-article-write` 技能，从一个 URL 或素材出发，自动完成 13 步流水线：

```
资料收集 → 文章创作 → 封面图 → 插图 → 信息图 → 图床上传 → CDN 整合
→ 去 AI 痕迹 → 格式化 → HTML 转换 → 发布公众号草稿 → 发布博客
```

一条命令，同时产出公众号草稿和博客文章。

依赖的外部技能链：`ljg-writes`（写作）、`baoyu-cover-image`（封面）、`baoyu-infographic`（信息图）、`baoyu-article-illustrator`（插图）、`baoyu-markdown-to-html`（HTML）、`baoyu-post-to-wechat`（公众号发布）。

### 技能管理

- **自研技能**：`wechat-article-write`（完整写作发布流水线，含质量门控、CDN 传播处理等）和 `github-image-hosting`（GitHub 图床上传，较简单但高度定制）
- **外部技能**：上述依赖链中的所有技能均为外部技能，通过 `npx skills` 管理版本，**只调用不修改**
- 外部技能源文件在 `.agents/skills/`，版本锁文件为 `skills-lock.json`

## 快速开始

### 在线访问

[https://ntlx.github.io/](https://ntlx.github.io/)

### 本地运行

需要 Node.js 22+：

```bash
git clone https://github.com/NTLx/ntlx.github.io.git
cd ntlx.github.io
npm install
npm run dev
```

浏览器访问 `http://localhost:4321/`

### 构建

```bash
npm run build
```

产物在 `dist/` 目录。

## 技术栈

- **框架**：Astro v5 + Starlight v0.37
- **部署**：GitHub Pages（GitHub Actions 自动化）
- **图床**：GitHub 仓库 + jsDelivr CDN
- **公众号发布**：微信公众号 API

## 项目结构

```
.
├── .agents/skills/           # 技能源文件（写作、发布、图片生成等）
├── .github/workflows/        # GitHub Actions 自动部署
├── src/content/docs/         # 博客文章
│   └── articles/             # 公众号文章同步到博客的存放目录
├── public/                   # 静态资源
├── astro.config.mjs          # Astro 配置（含侧边栏导航）
└── package.json
```

## 版权声明

[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)（署名-非商业性使用-相同方式共享 4.0 国际）

---

*Created by [NTLx](https://github.com/NTLx)*
