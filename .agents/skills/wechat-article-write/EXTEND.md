# wechat-article-write 运行时配置

此文件定义技能执行时的默认行为。

## 配置项

### quick_mode

是否尽量跳过可选确认。Step 1-4 仍由 Agent 完成智能判断；Step 5/6 需要通过 `pipeline.mjs --auto` 执行确定性自动化。

```yaml
quick_mode: true
```

**推荐值**：`true` — 减少非必要确认，但不改变脚本门控。

### default_publish_method

发布到公众号的默认方式。本项目核心管线默认走 API；浏览器方式仅作为第三方技能的人工降级路径，不作为 `wechat-article-write` 主路径。

```yaml
default_publish_method: api
```

可选值：
- `api`：通过微信公众号 API 发布（推荐，更快）
- `browser`：通过浏览器自动化发布（需要 Chrome 登录）

## 依赖技能配置

本技能依赖以下技能的 EXTEND.md，需在相应位置配置：

| 技能 | 配置路径 | 必需配置项 |
|-----|---------|-----------|
| baoyu-cover-image | `~/.baoyu-skills/baoyu-cover-image/EXTEND.md` | `quick_mode: true` |
| baoyu-article-illustrator | `~/.baoyu-skills/baoyu-article-illustrator/EXTEND.md` | `quick_mode: true`, `preferred_image_backend` |
| baoyu-markdown-to-html | `~/.baoyu-skills/baoyu-markdown-to-html/EXTEND.md` | `default_theme`, `default_color` |
| baoyu-post-to-wechat | `~/.baoyu-skills/baoyu-post-to-wechat/EXTEND.md` | `default_author`, `default_publish_method` |

## 环境变量

baoyu 系列技能使用的 `.env` 文件位于：

```
~/.baoyu-skills/.env
```

需包含以下变量（根据使用的技能）：

```env
# 微信公众号 API（baoyu-post-to-wechat）
WECHAT_APP_ID=your_app_id
WECHAT_APP_SECRET=your_app_secret

# GitHub 图床（github-image-hosting）
GITHUB_TOKEN=your_github_token
GITHUB_REPO=NTLx/Pic

# OpenAI API（baoyu-cover-image, baoyu-article-illustrator）
OPENAI_API_KEY=your_openai_key
```
