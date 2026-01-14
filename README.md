# NTLx's Blog / Knowledge Base

[![Built with Astro Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

欢迎来到我的个人知识库!这是一个基于 [Astro Starlight](https://starlight.astro.build) 构建的技术文档网站,用于记录和分享我在系统管理、软件使用、生物信息学等领域的学习笔记和技术总结。

## 📚 内容概览

本项目主要包含以下几类技术文档:

- **操作系统** - Linux 发行版配置、NAS 与虚拟化、嵌入式系统
- **HPC 与集群** - Slurm、OpenMPI 等高性能计算工具
- **AI 辅助编程** - 常用 AI Coding CLI 工具一键安装与配置
- **网络与代理** - Shadowsocks、Privoxy、ZeroTier 等网络工具
- **DevOps 工具** - Shell、编辑器、版本控制、服务部署
- **生物信息学** - Snakemake 流程管理与性能分析

## 🚀 快速开始

### 在线访问

访问 GitHub Pages: [https://ntlx.github.io/](https://ntlx.github.io/)

### 本地运行

需要 Node.js 22+ 环境:

```bash
# 克隆仓库
git clone https://github.com/NTLx/ntlx.github.io.git
cd ntlx.github.io

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

打开浏览器访问 `http://localhost:4321/`

### 构建

```bash
npm run build
```

构建产物位于 `dist/` 目录。

## 🛠️ 技术栈

- **框架**: [Astro](https://astro.build/) v5.6+
- **主题**: [Starlight](https://starlight.astro.build/) v0.37+
- **部署**: GitHub Pages (自动化部署)
- **包管理**: npm
- **Node.js**: v22+

## 📖 项目结构

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions 自动部署
├── src/
│   └── content/
│       └── docs/           # 所有文档
│           ├── ai-tools/
│           ├── operating-systems/
│           ├── hpc-cluster/
│           ├── network-proxy/
│           ├── devops/
│           └── bioinformatics/
├── public/                 # 静态资源
├── astro.config.mjs        # Astro 配置
└── package.json
```

## 🤝 贡献指南

非常欢迎大家对本项目提出宝贵的意见和建议!

- **发现错误?** 请直接提交 [Issue](https://github.com/NTLx/ntlx.github.io/issues)
- **想要补充或修改?** 欢迎 Fork 本仓库并提交 Pull Request
- **有新的想法?** 欢迎在 Issue 中讨论

## 📄 版权声明

本项目采用 **[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)** (署名-非商业性使用-相同方式共享 4.0 国际) 协议进行许可。

您可以:
- **共享** — 在任何媒介以任何形式复制、发行本作品
- **演绎** — 修改、转换或以本作品为基础进行创作

但必须遵守以下条件:
- **署名** — 您必须给出适当的署名,提供指向本许可协议的链接,同时标明是否作了修改
- **非商业性使用** — **您不得将本作品用于商业目的**
- **相同方式共享** — 如果您再混合、转换或者基于本作品进行创作,您必须基于与原先许可协议相同的许可协议分发您贡献的作品

---

*Created by [NTLx](https://github.com/NTLx)*
