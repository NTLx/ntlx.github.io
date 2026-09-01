# 工程依赖清单

这份清单只记录让确定性管线能够运行的依赖、配置接口和运行时前提。
内容理解、写作、调研和辅助视觉能力不在这里登记；它们由
`skill-catalog.mjs` 动态发现，再由 Agent 按阶段合同选择。

## Hard engineering dependencies

| 依赖 | 类型 | 用途 |
|---|---|---|
| `humanizer-zh` | Mandatory Humanization Layer | Step 2 Gate 后清理 AI 写作痕迹；receipt 绑定当前 draft freshness |
| `baoyu-article-illustrator` | Baoyu Core Design Skill | 全文视觉规划和正文设计 authority；正文可判定为 0 张 |
| `baoyu-cover-image` | Baoyu Core Design Skill | 封面设计 authority |
| `baoyu-infographic` | Baoyu Core Design Skill | `SLOT_IMG_00` 摘要信息图 authority |
| `baoyu-diagram` | Baoyu Specialized Design Skill | 按需提供架构、流程、时序、状态和关系结构；不渲染最终图片 |
| `baoyu-image-gen` | raster renderer | 唯一最终图片生成入口；provider 必须是 `codex-cli` |
| `render-images-serial.mjs` | 确定性执行器 | 全 prompt preflight 后单图串行调用 renderer |
| `github-image-hosting` | 确定性适配器 | 博客图片上传和 CDN URL |
| `gzh-design` | 确定性适配器 | 微信 HTML 排版、validator 和预览包装 |
| `baoyu-post-to-wechat` | 确定性适配器 | 微信草稿发布 |

上述依赖由 `scripts/workflow.mjs` 的 `HARD_DEPENDENCIES` 单一声明，
`check-deps.mjs` 和 `validate-architecture.mjs` 只检查它们。缺少任何
认知、写作或 optional contributor Skill 不应因此阻断流程；
`baoyu-diagram` 必须安装但不必每篇文章调用。

## Runtime adaptive capabilities

开放式能力（包括内容、写作和 optional visual contributor）由
`skill-catalog.mjs` 动态发现，Agent 按当前 Stage Contract 和 gap 选择；
这里不列举完整清单，也不维护 Skill→场景映射。除 illustrate 的 mandatory
Baoyu Core Design Layer 和 writing 的 mandatory humanizer-zh 外，no-skill 仍是合法路线。

## Conditional adapter template sources

当当前 `image-plan.json` 选择 `prompt_source: adapter` 时，
`generate-image-prompts.mjs` 才按需读取兼容模板，例如 Baoyu infographic
layout/style 或 article illustrator style。它们不是 workflow hard dependency；
选择 `external` 时脚本不读取 producer Skill，只检查确定性 prompt 文件。

## 必需 CLI 与脚本

| 项目 | 位置/命令 | 说明 |
|---|---|---|
| Bun | `bun` | 运行本技能脚本和 Baoyu CLI |
| Codex CLI | `codex --version` | Step 4 的唯一 raster provider；需有有效登录态 |
| Python | `uv run python` | 仅由 HTML validator 等仓库工具按需使用 |
| Astro/npm | `npm run build` | Step 5 后的博客构建验证 |

图片阶段预检：

```bash
# static repository contract（CI 可执行，不要求 Codex runtime）
bun run .agents/skills/wechat-article-write/scripts/check-deps.mjs --stage images
bun run .agents/skills/wechat-article-write/scripts/check-image-backend.mjs --static --json

# runtime readiness（真实 Step 4 生图前执行）
bun run .agents/skills/wechat-article-write/scripts/check-image-backend.mjs --runtime --json
```

## 项目级配置接口

| 配置 | 用途 |
|---|---|
| `.agents/skills/wechat-article-write/EXTEND.md` | 本技能运行偏好 |
| `.baoyu-skills/baoyu-image-gen/EXTEND.md` | `default_provider: codex-cli` 和其它上游合法默认值 |
| `.baoyu-skills/baoyu-post-to-wechat/EXTEND.md` | 微信作者和发布偏好 |
| `.baoyu-skills/.env` | 本地 Secret 和运行时参数；被 Git 忽略，不打印不提交 |

Baoyu Core 和 Specialized Skill 只能产出视觉方案、结构或 rendering prompt；
最终图片始终由 `baoyu-image-gen → codex-cli` 生成。

## Provider policy

`baoyu-image-gen` 的默认 provider 由 `EXTEND.md` 的
`default_provider` 固定为 `codex-cli`。唯一的生产执行器会对每次 single-image
调用显式传入 `--provider codex-cli`；`.env` 中即使存在其它 API key，也不改变
这条默认路径。

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
