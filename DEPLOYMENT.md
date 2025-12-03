# GitHub Pages 部署指南

本文档说明如何将 Astro Starlight 项目部署到 GitHub Pages。

## 前提条件

- GitHub 仓库已创建
- 项目代码已推送到仓库
- GitHub Actions 已启用

## 部署步骤

### 1. 配置 GitHub Pages

1. 进入仓库的 **Settings** → **Pages**
2. 在 **Source** 下选择 **GitHub Actions**
3. 保存设置

![GitHub Pages 设置示意](https://docs.github.com/assets/cb-49777/mw-1440/images/help/pages/select-actions-as-source.webp)

### 2. 推送代码触发部署

GitHub Actions 工作流已配置为在推送到 `main` 分支时自动触发:

```bash
git add .
git commit -m "Deploy Astro Starlight site"
git push origin main
```

### 3. 查看部署状态

1. 进入仓库的 **Actions** 标签页
2. 查看最新的工作流运行状态
3. 等待构建和部署完成(通常 1-2 分钟)

### 4. 访问网站

部署成功后,访问:
```
https://ntlx.github.io/
```

## 工作流配置

工作流文件位于 `.github/workflows/deploy.yml`,包含两个主要任务:

### Build 任务
- 检出代码
- 安装 Node.js 22
- 安装依赖
- 构建 Astro 站点
- 上传构建产物

### Deploy 任务
- 从构建任务获取产物
- 部署到 GitHub Pages

## 自定义域名(可选)

如果要使用自定义域名:

1. 在项目根目录创建 `public/CNAME` 文件
2. 添加您的域名,例如:`blog.example.com`
3. 在域名提供商处添加 CNAME 记录指向 `ntlx.github.io`
4. 推送更改并重新部署

## 故障排查

### 构建失败

1. 检查 Actions 日志查看具体错误
2. 确保本地 `npm run build` 能成功运行
3. 检查 Node.js 版本是否为 22+

### 部署成功但页面 404

1. 确认 GitHub Pages 设置中 Source 为 **GitHub Actions**
2. 检查 `astro.config.mjs` 中的 `site` 配置
3. 等待几分钟让 DNS 缓存更新

### 样式或资源文件无法加载

1. 检查浏览器控制台的错误信息
2. 确认所有资源路径为相对路径
3. 清除浏览器缓存后重试

## 手动触发部署

除了自动部署,也可以手动触发:

1. 进入仓库的 **Actions** 标签页
2. 选择 **Deploy to GitHub Pages** 工作流
3. 点击 **Run workflow** 按钮
4. 选择分支并运行

## 本地预览构建产物

在推送前可本地预览生产构建:

```bash
# 构建
npm run build

# 预览
npm run preview
```

访问 `http://localhost:4321` 查看效果。

## 下一步

- 配置自定义域名
- 设置 URL 重定向(从旧 Docsify 站点)
- 添加 Google Analytics
- 优化 SEO 设置

---

*最后更新: 2025-12-03*
