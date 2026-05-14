# NTLx's Blog

[![Built with Astro Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

我的个人博客，基于 [Astro Starlight](https://starlight.astro.build) 构建，托管在 GitHub Pages 上。

## 内容方向

技术随笔为主，覆盖 AI 辅助编程、操作系统、HPC 集群、网络代理、DevOps、生物信息学等话题。文章风格偏「有感而发」——读了什么东西、踩了什么坑、想通了什么道理，写下来。

## 功能特性

### 博客站点

- **Astro Starlight** 构建，支持全文搜索、深色模式、RSS 订阅
- 完善的 **SEO 优化**（Open Graph、结构化数据、自动 sitemap）
- 直接在 `src/content/docs/` 下创建 Markdown 文件，推送到 `main` 分支后通过 GitHub Actions 自动部署到 [ntlx.github.io](https://ntlx.github.io/)

### 微信公众号文章管线

通过 `wechat-article-write` 技能，从一个 URL 或素材出发，自动完成 15 阶段流水线：

```
资料收集 → 文章创作 → 封面图 → 插图 → 信息图 → 图床上传 → CDN 整合
→ 去 AI 痕迹 → 格式化 → HTML 转换 → 发布博客 → 发布公众号草稿
```

支持 blog-slug 生成、CDN 图床批量上传、状态断点续跑。一条命令，同时产出博客文章和公众号草稿。

### 技能系统

项目集成了 **28 个 AI 技能**，覆盖写作、翻译、图像生成、信息图表、幻灯片、漫画、论文阅读、概念分析、投资分析等领域。

- **自研技能**：`wechat-article-write`（15 阶段写作发布流水线）和 `github-image-hosting`（GitHub 图床上传）
- **外部技能**：通过 `npx skills` 管理版本，**只调用不修改**
- 技能源文件在 `.agents/skills/`，版本锁文件为 `skills-lock.json`

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

- **框架**：Astro v6 + Starlight v0.39
- **部署**：GitHub Pages（GitHub Actions 自动化）
- **RSS**：Astro RSS 集成，自动生成全文 Feed
- **SEO**：Open Graph、结构化数据、自动 sitemap
- **图床**：GitHub 仓库 + jsDelivr CDN
- **公众号发布**：微信公众号 API

## 项目结构

```
.
├── .agents/skills/           # 37+ AI 技能源文件（写作、图像、翻译等）
├── .github/workflows/        # GitHub Actions 自动部署
├── src/
│   ├── content/docs/         # 博客文章（文档 + 管线产出文章）
│   │   └── articles/         # 公众号文章同步到博客
│   ├── pages/rss.xml.js      # RSS Feed 生成
│   └── styles/               # 自定义样式（字体等）
├── public/                   # 静态资源（favicon、CNAME 等）
├── posts/                    # 文章管线中间产物
├── astro.config.mjs          # Astro 配置（含侧边栏、SEO、RSS 社交图标）
└── package.json
```

## 版权声明

[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)（署名-非商业性使用-相同方式共享 4.0 国际）

---

*Created by [NTLx](https://github.com/NTLx)*
