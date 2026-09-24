# NTLx's Blog

[![Built with Astro Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)
[![Deploy to GitHub Pages](https://github.com/NTLx/ntlx.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/NTLx/ntlx.github.io/actions/workflows/deploy.yml)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

一个围绕 **AI Agent、AI Native 工程与真实系统实践**持续演进的个人博客与技术知识库。

在线访问：**https://ntlx.github.io/**

## 站点结构

这个仓库同时承载两类内容，但二者采用不同的信息组织方式：

- **Blog**：面向连续阅读与观点表达，文章位于 `src/content/docs/articles/`
- **Notes**：面向长期维护与按问题查找的 Reference，覆盖 AI 工具、操作系统、HPC、网络、DevOps、生物信息学等主题

主要入口：

- `/`：首页
- `/archive/`：全部文章，支持关键词 / 专题 / 年份即时筛选
- `/topics/`：博客专题总览
- `/notes/`：技术笔记 Hub
- `/rss.xml`：RSS Feed
- `/about/`：关于本站

博客文章目前按 6 个长期主题组织：

- AI 编程实践
- Agent 与工具链
- AI 行业洞察
- 模型与研究
- 安全
- 工程案例

专题只是发现层，不改变任何既有文章 URL。

## 当前特性

### 博客阅读与内容发现

- 基于 Astro + Starlight 的静态站点
- Pagefind 全文搜索
- 深色 / 浅色主题
- RSS 全文订阅
- 动态文章归档与专题页
- 基于 tags、来源域名和专题信号的相关阅读
- 移动端主导航
- 文章标签、发布日期、更新时间与原始资料 provenance 展示
- 定制 404 恢复页，提供专题、Notes 和最近文章入口

### SEO 与分享

- canonical URL
- sitemap
- RSS autodiscovery
- Open Graph / Twitter Card
- `BlogPosting` JSON-LD
- `article:published_time` / `article:modified_time`
- `article:section` / `article:tag`
- 404 页面 `noindex, nofollow`，并排除出 Pagefind 索引

### 性能与稳定性

仓库不是只依赖人工验收，而是把关键约束固化为自动检查：

- **历史 URL 兼容性**：388 个既有文章 URL 受 baseline 保护
- **Tag policy**：统一 canonical tag，阻止 `write`、`reader-response` 等流水线状态污染内容元数据
- **静态性能预算**：约束首页、归档、专题、Notes 和代表文章的 HTML / JS 体积
- **图片加载策略**：
  - 文章第一张 Markdown 图片：`fetchpriority="high"`
  - 后续图片：`loading="lazy"`
  - Markdown 图片统一 `decoding="async"`

### 行为可观测性

站点使用 GA4，并补充了与内容发现相关的事件：

- `blog_search_open`
- `internal_article_click`
- `archive_filter`
- `rss_click`
- `copy_code`

归档搜索不会上传查询文本；代码复制事件不会上传代码内容。

## 写作与发布管线

仓库内置 `wechat-article-write` Skill，用于微信公众号与博客双轨内容生产。

它负责从素材收集、理解、写作、视觉素材、CDN、格式化，到博客与公众号发布的完整流程，并支持断点续跑与发布前验证。

最终博客文章写入：

```text
src/content/docs/articles/
```

流水线工作目录位于：

```text
posts/YYYY-MM-DD-slug/
```

写作和发布的权威说明见：

- [`.agents/skills/wechat-article-write/SKILL.md`](.agents/skills/wechat-article-write/SKILL.md)
- [`src/content/AGENTS.md`](src/content/AGENTS.md)

## Agent Skills

项目级 Skill 的 canonical source 位于：

```text
.agents/skills/
```

仓库同时包含自建、managed 与 vendored Skills。生命周期、版本和修改边界以 [`AGENTS.md`](AGENTS.md) 中的 **Agent Skills Governance** 为准；README 不维护技能数量或复制完整治理规则，避免与实际仓库状态漂移。

## 本地开发

### 环境要求

- Node.js 22+
- npm
- Bun（用于 Agent 测试与静态校验）

### 启动开发服务器

```bash
git clone https://github.com/NTLx/ntlx.github.io.git
cd ntlx.github.io
npm install
npm run dev
```

默认地址：

```text
http://localhost:4321/
```

### 生产构建

```bash
npm run build
```

产物输出到 `dist/`。

## 验证与质量门禁

推荐在提交前直接运行：

```bash
npm run verify
```

它会依次执行：

```text
test:agent
  ↓
check:agent
  ↓
check:urls
  ↓
check:tags
  ↓
build
  ↓
check:perf
```

也可以单独运行：

```bash
npm run test:agent   # Agent / Skill 测试
npm run check:agent  # Agent 架构静态校验
npm run check:urls   # 历史文章 URL 兼容性
npm run check:tags   # Tag canonical policy
npm run build        # Astro 生产构建
npm run check:perf   # 构建产物性能预算与图片加载策略
```

这些检查同时被 GitHub Pages workflow 使用，因此本地通过与部署通过尽量保持同一套质量标准。

## 部署

推送到 `main` 后，GitHub Actions 自动：

1. 安装 Node.js / Bun 环境
2. 安装依赖
3. 运行 Agent 测试
4. 运行架构检查
5. 检查历史 URL
6. 检查 tag policy
7. 构建 Astro 站点
8. 检查性能预算
9. 上传并部署到 GitHub Pages

工作流：

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)

生产站点：

https://ntlx.github.io/

## 技术栈

- **Framework**：Astro 6
- **Content / UI**：Starlight 0.39
- **Search**：Pagefind
- **Feed**：`@astrojs/rss`
- **Content**：Markdown / MDX
- **Image hosting**：GitHub + jsDelivr CDN
- **Analytics**：Google Analytics 4
- **Deployment**：GitHub Actions + GitHub Pages

## 仓库结构

```text
.
├── .agents/skills/                 # 项目级 Agent Skills canonical source
├── .github/workflows/
│   └── deploy.yml                  # GitHub Pages CI/CD
├── scripts/
│   ├── check-public-urls.mjs       # 历史文章 URL 兼容性
│   ├── check-tags.mjs              # Tag policy
│   └── check-performance.mjs       # 静态性能预算
├── src/
│   ├── components/                 # 博客展示层组件
│   ├── content/
│   │   ├── AGENTS.md               # 内容与发布规则
│   │   └── docs/
│   │       ├── articles/           # Blog
│   │       ├── guides/             # 编写规范等
│   │       └── ...                 # Notes / Reference
│   ├── pages/
│   │   └── rss.xml.js              # RSS Feed
│   ├── plugins/
│   │   └── rehype-image-performance.mjs
│   └── styles/
├── posts/                          # 内容管线中间产物
├── public/                         # favicon、CNAME、OG 资源等
├── AGENTS.md                       # Repository-wide Agent governance
├── astro.config.mjs
└── package.json
```

## 内容维护约束

高层原则：

- 不重命名或移动已经发布的 `articles/` 文件
- 博客文章 URL 必须保持稳定
- 分类由 frontmatter `category` 驱动
- tags 是辅助发现信号，不要求每篇文章强行填写
- 技术文档与博客文章保持 Blog / Notes 两套语义
- 修改内容后按对应规则更新 `updated`

完整规则不要以 README 为准，权威来源是：

- [`AGENTS.md`](AGENTS.md)
- [`src/content/AGENTS.md`](src/content/AGENTS.md)
- [技术博文编写规范](src/content/docs/guides/authoring-guide.md)

## 版权

除另有说明外，原创内容采用：

[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)

代码、Agent Skills 或第三方 vendored 内容如带有独立许可，则以对应文件中的许可声明为准。

---

Created by [NTLx](https://github.com/NTLx)

