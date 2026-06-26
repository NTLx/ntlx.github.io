# 依赖清单

## 项目级配置

| 依赖 | 路径 | 用途 |
|---|---|---|
| Codex CLI | `codex` on `PATH` | Step 4 默认文生图后端（通过 `baoyu-image-gen --provider codex-cli` 调用） |
| baoyu-image-gen 配置 | `.baoyu-skills/baoyu-image-gen/EXTEND.md` | Step 4 baoyu fallback provider |
| baoyu-markdown-to-html 配置 | `.baoyu-skills/baoyu-markdown-to-html/EXTEND.md` | Step 5 微信 HTML 主题 |
| baoyu-post-to-wechat 配置 | `.baoyu-skills/baoyu-post-to-wechat/EXTEND.md` | Step 6 微信作者/发布方式 |
| 密钥 | `.baoyu-skills/.env` | 微信 API、GitHub 图床、baoyu fallback 图像后端 |

## 技能依赖

| 技能 | 类型 | 用途 |
|---|---|---|
| ljg-writes | 内容技能 | Step 2 写作 |
| renwei-writing | 内容技能 | Step 3 去 AI 味，tutorial 可跳过 |
| baoyu-format-markdown | 格式技能 | Step 3 Markdown 格式化 |
| baoyu-cover-image | 图片技能 | 封面 prompt 模板 |
| baoyu-article-illustrator | 图片技能 | 文内插图 prompt 模板 |
| baoyu-image-gen | 图片技能 | 实际文生图执行；默认走 `codex-cli`，失败后走 baoyu fallback |
| baoyu-infographic | 图片技能 | SLOT 00 信息图 prompt 的 layout/style 模板来源 |
| github-image-hosting | 发布技能 | Step 5 CDN 上传 |
| baoyu-markdown-to-html | 发布技能 | Step 5 微信 HTML |
| baoyu-post-to-wechat | 发布技能 | Step 6 微信草稿 |

## baoyu-infographic 文生图模板目录

`generate-image-prompts.mjs` 在运行时动态读取以下两个目录：

- `.agents/skills/baoyu-infographic/references/layouts/` — 21 个 layout 模板
- `.agents/skills/baoyu-infographic/references/styles/` — 22 个 style 模板

合法命名见 `references/image-template-map.json` 的 `infographic_layouts` / `infographic_styles` 数组，或 `references/image-template-catalog.md`。`check-deps.mjs --stage images` 校验目录存在；模板文件缺失会在 `generate-image-prompts.mjs` 运行时报错。

## Codex CLI 默认后端

Step 4 默认命令形态：

```bash
bun run .agents/skills/baoyu-image-gen/scripts/main.ts \
  --provider codex-cli \
  --promptfiles posts/<date-slug>/imgs/prompts/01-<desc>.md \
  --image posts/<date-slug>/imgs/01-<desc>.png \
  --ar 16:9
```

前置条件：

```bash
codex --version
codex login status
```

`check-deps.mjs --stage images` 找不到 `codex` 时只给 warning，不阻断。此时 Step 4 的 Codex CLI 默认路径会失败，应直接使用 `.baoyu-skills/baoyu-image-gen/EXTEND.md` 中的 `preferred_image_backend` 作为 baoyu fallback。

Codex CLI 路径使用 Codex / ChatGPT 登录态，不使用 `OPENAI_API_KEY`。如果 fallback provider 是 OpenAI API，默认模型可继续使用 `gpt-image-2`。

## 环境变量

`.baoyu-skills/.env` 至少应包含发布所需凭据；图像 API key 只在对应 baoyu fallback provider 被调用时才需要：

```env
WECHAT_APP_ID=...
WECHAT_APP_SECRET=...
GITHUB_TOKEN=...
GITHUB_REPO=...
OPENAI_API_KEY=...       # fallback provider=openai 时需要
DASHSCOPE_API_KEY=...    # fallback provider=dashscope 时需要
GOOGLE_API_KEY=...       # fallback provider=google 时需要
```

按阶段检查：

```bash
bun run .agents/skills/wechat-article-write/scripts/check-deps.mjs --stage images
bun run .agents/skills/wechat-article-write/scripts/check-deps.mjs --stage publish
```
