---
title: 龙虾微信公众号写作养成记
description: 记录我帮 OpenClaw（龙虾）建立微信公众号写作能力的完整过程，从工具安装到流程制定
---

:::tip[开源致谢]
本文用到的 `baoyu-*` 系列技能都是宝玉开源的：

- `baoyu-image-gen`：AI 图片生成
- `baoyu-markdown-to-html`：Markdown 转 HTML
- `baoyu-post-to-wechat`：发布到微信公众号

这些技能质量很高，帮我省了不少时间。感谢宝玉的开源贡献。
:::

## 写在前面

"龙虾"刚来的时候，不会写公众号文章。我花了一段时间调教它，现在它能独立完成从写作到发布的全部流程。这篇记录一下过程。

## 第一阶段：装工具

### 1.1 baoyu-skills 套件

我给它装了一套工具：

```
~/.baoyu-skills/
├── baoyu-image-gen/       # 生成图片
├── baoyu-markdown-to-html/ # 格式转换
├── baoyu-post-to-wechat/  # 发布文章
└── baoyu-cover-image/     # 封面图处理
```

### 1.2 配置 API Keys

在 `~/.baoyu-skills/.env` 里写好了各种 key：

```bash
# 微信公众号
WECHAT_APP_ID=wx1c22974axxxxxxxx
WECHAT_APP_SECRET=b8cda2d22235b943axxxxxxxx

# 图片生成
ARK_API_KEY=a8c22cab-xxxx-xxxx-xxxx-xxxxxxxxxxxx
DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_API_KEY=AIzaSyCxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

:::note
多配几个图片 API，挂了一个还能用另一个。
:::

## 第二阶段：做图床

### 2.1 为什么需要图床

文章里的图片得有个稳定的链接。我给"龙虾"写了个 GitHub 图床技能。

原理很简单：
- 用 `gh` 把图片传到我的 GitHub 仓库
- 用 jsDelivr CDN 加速访问
- 自动处理重名

### 2.2 怎么用

```bash
# 上传图片
bun ~/.openclaw/workspace/skills/github-image-hosting/scripts/upload.ts <图片路径>

# 自定义文件名
bun ~/.openclaw/workspace/skills/github-image-hosting/scripts/upload.ts cover.png --name my-cover

# 预览（不实际上传）
bun ~/.openclaw/workspace/skills/github-image-hosting/scripts/upload.ts cover.png --dry-run
```

返回结果：

```json
{
  "cdnUrl": "https://cdn.jsdelivr.net/gh/NTLx/Pic@master/Jarvis/image.png"
}
```

这个 CDN 链接国内可以直接访问。

### 2.3 文件名冲突

如果 `cover.png` 已经存在，会自动改成 `cover-1.png`。

### 2.4 统一默认配置

我让"龙虾"给每个技能建了 `EXTEND.md`，把默认参数写进去：

```bash
default_provider: seedream
default_quality: 2k
default_aspect_ratio: 2.35:1
```

以后调用就不用每次都传这些参数了。

## 第三阶段：定流程

### 3.1 发布步骤

我给它定了一套标准流程：

```bash
# 1. 生成封面图
bun ~/.agents/skills/baoyu-image-gen/scripts/main.ts \
  --prompt "..." --image cover.png --ar 2.35:1 --provider seedream

# 2. 上传图床（可选）
bun ~/.openclaw/workspace/skills/github-image-hosting/scripts/upload.ts cover.png

# 3. 转 HTML
bun ~/.agents/skills/baoyu-markdown-to-html/scripts/main.ts article.md --cite

# 4. 发布
bun ~/.agents/skills/baoyu-post-to-wechat/scripts/wechat-api.ts \
  article.html --title "标题" --summary "摘要" --cover cover.png
```

### 3.2 流程图

```
写作 → 封面图 → 图床 → 转格式 → 发布 → 预览 → 上线
```

## 第四阶段：能力确认

现在"龙虾"会这些了：

| 能力 | 工具 |
|------|------|
| 内容创作 | 写作 + humanizer |
| 封面图 | baoyu-image-gen |
| 格式转换 | baoyu-markdown-to-html |
| 发布 | baoyu-post-to-wechat |
| 图床 | github-image-hosting |

## 经验总结

### 1. 配置集中管理

API Keys 放一个文件里，改起来方便。

### 2. 多备份

图片 API 多配几个，不会因为一个挂了就干不了活。

### 3. 流程写下来

把发布流程记在 TOOLS.md 里，下次不用重新想。

### 4. 图床用 GitHub

GitHub + jsDelivr，国内访问没问题。

## 工具清单

```
~/.baoyu-skills/
├── .env                    # API Keys
├── baoyu-image-gen/        # 图片生成
├── baoyu-markdown-to-html/ # 格式转换
└── baoyu-post-to-wechat/   # 发布

~/.openclaw/workspace/skills/
└── github-image-hosting/   # 图床
```

## 写在最后

现在我跟"龙虾"说"帮我写篇公众号文章"，它就能：

1. 写内容
2. 生成封面图
3. 上传图床
4. 转换格式
5. 发布草稿

整个过程我只需要最后预览确认一下。

这就是我调教"龙虾"建立公众号写作能力的过程。

---

*作者：NTLx*
*发布日期：2026-03-21*