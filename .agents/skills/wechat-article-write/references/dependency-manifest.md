# 工程依赖清单

这份清单只记录让确定性管线能够运行的依赖、配置接口和运行时前提。
内容理解、写作、调研和辅助视觉能力不在这里登记；它们由
`skill-catalog.mjs` 动态发现，再由 Agent 按阶段合同选择。

## Hard engineering dependencies

| 依赖 | 类型 | 用途 |
|---|---|---|
| `baoyu-cover-image` | prompt 适配器 | 当前封面模板来源 |
| `baoyu-article-illustrator` | prompt 适配器 | 当前文内解释图模板来源 |
| `baoyu-infographic` | prompt 适配器 | 当前 SLOT 00 layout/style 模板来源 |
| `baoyu-image-gen` | raster 适配器 | 图片实际生成入口；默认 provider 必须是 `codex-cli` |
| `github-image-hosting` | 确定性适配器 | 博客图片上传和 CDN URL |
| `gzh-design` | 确定性适配器 | 微信 HTML 排版、validator 和预览包装 |
| `baoyu-post-to-wechat` | 确定性适配器 | 微信草稿发布 |

上述依赖由 `scripts/workflow.mjs` 的 `HARD_DEPENDENCIES` 单一声明，
`check-deps.mjs` 和 `validate-architecture.mjs` 只检查它们。缺少任何
认知、写作或可选视觉 Skill 不应因此阻断流程。

当前 prompt 生成脚本会读取上述视觉 Skill 的官方参考模板；这只是协议
适配器的输入，不是本技能重新实现它们的布局、风格或生成算法。

## 必需 CLI 与脚本

| 项目 | 位置/命令 | 说明 |
|---|---|---|
| Bun | `bun` | 运行本技能脚本和 Baoyu CLI |
| Codex CLI | `codex --version` | Step 4 的唯一 raster provider；需有有效登录态 |
| Python | `uv run python` | 仅由 HTML validator 等仓库工具按需使用 |
| Astro/npm | `npm run build` | Step 5 后的博客构建验证 |

图片阶段预检：

```bash
bun run .agents/skills/wechat-article-write/scripts/check-image-backend.mjs --json
bun run .agents/skills/wechat-article-write/scripts/check-deps.mjs --stage images
```

## 项目级配置接口

| 配置 | 用途 |
|---|---|
| `.agents/skills/wechat-article-write/EXTEND.md` | 本技能运行偏好 |
| `.baoyu-skills/baoyu-image-gen/EXTEND.md` | `default_provider: codex-cli` 和其它上游合法默认值 |
| `.baoyu-skills/{高层视觉 Skill}/EXTEND.md` | raster 高层 Skill 的 `preferred_image_backend: baoyu-image-gen` |
| `.baoyu-skills/baoyu-post-to-wechat/EXTEND.md` | 微信作者和发布偏好 |
| `.baoyu-skills/.env` | 本地 Secret 和运行时参数；被 Git 忽略，不打印不提交 |

高层 raster Skill 的官方配置必须能保证：

```text
高层视觉能力 → baoyu-image-gen → codex-cli
```

无法通过其官方配置固定 raster backend 的新能力，可以提供分析、构图或
prompt 设计，但不能直接承担本管线的图片渲染。

## Provider policy

`baoyu-image-gen` 的默认 provider 由 `EXTEND.md` 的
`default_provider` 固定为 `codex-cli`。日常调用不传与之冲突的
`--provider`；`.env` 中即使存在其它 API key，也不改变这条默认路径。

Codex CLI 不可执行、登录失效、超时或生成失败时，图片阶段停止并报告
BLOCKED。允许在同一路径内修复锁、缩短 prompt、重新生成或使用上游已经
提供的有限重试；禁止静默切换 OpenAI、Google、DashScope、OpenRouter、
Replicate、Seedream、Jimeng、MiniMax、Z.AI 或其它 raster provider。

建议的本地非 Secret 调优项：

```env
BAOYU_CODEX_IMAGEGEN_TIMEOUT_MS=1800000
BAOYU_IMAGE_GEN_CODEX_CLI_CONCURRENCY=1
BAOYU_IMAGE_GEN_CODEX_CLI_START_INTERVAL_MS=2000
```

重试键如果已经存在则保留上游合法值；无需为了显式化默认值而新增。
预检只列出环境变量键名和错误类型，不输出值。

## Skill 路径与发现

需要读取完整 Skill 时优先使用项目级：

```text
.agents/skills/<skill>/SKILL.md
```

不要把用户目录复制进本仓库，也不要修改第三方 Skill 源码。开放式能力
从以下命令动态发现：

```bash
bun run .agents/skills/wechat-article-write/scripts/skill-catalog.mjs --json
```

目录读取 frontmatter 的 `name`、`description`、`version` 和
`user_invocable`，排除 `wechat-article-write` 自身，不维护人工白名单。
