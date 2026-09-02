# wechat-article-write 运行时配置

此文件只保存本技能自己的运行偏好。阶段合同、Gate 和自适应编排规则
分别由 `scripts/workflow.mjs` 与 `references/orchestration-policy.md`
维护；这里不登记内容、写作或视觉 Skill 路由。

## 配置项

### author profile

作者和简介只在本技能配置；Step 5 与 Step 6.2 都通过 `config-lib.mjs`
读取，禁止从发布适配器或其它文档复制作者事实。

```yaml
default_author: NTLx
default_author_bio: 热衷于分享 AI 观察与干货
```

### visual profile

这是本项目的默认图片视觉合同。具体 Baoyu style/layout 仍由当前文章的 Agent
根据内容选择；这里固定的是视觉结果的性质，不固定第三方 preset 名称。

```yaml
visual_style_profile: bright-vivid-warm
visual_brightness: bright
visual_saturation: high
visual_contrast: high
visual_background: clean
visual_clarity: crisp
visual_mood: warm-positive
```

### quick_mode

是否尽量跳过可选确认。它不改变 Agent 的缺口判断，也不改变任何 Gate。

```yaml
quick_mode: true
```

### default_publish_method

公众号发布的默认方式。当前工程主路径是 API，浏览器方式由发布适配器按需
处理。

```yaml
default_publish_method: api
```

可选值：`api`、`browser`。

### wechat_layout_default_theme

微信排版的默认偏好信号，不锁定文章必须使用的主题。

```yaml
wechat_layout_default_theme: zen-whitespace
```

### wechat_layout_secondary_theme

工具清单、方法拆解等文章的备选偏好信号。

```yaml
wechat_layout_secondary_theme: moyu-green
```

### wechat_layout_generate_preview

finalize 后是否生成本地预览包装。

```yaml
wechat_layout_generate_preview: true
```

## 确定性适配器与项目配置

以下是工程协议需要的适配器，不是开放式内容路由：

| 适配器 | 配置或来源 | 作用 |
|---|---|---|
| `baoyu-cover-image` | `.agents/skills/baoyu-cover-image/` | Baoyu Core：封面设计 |
| `baoyu-xhs-images` | `.agents/skills/baoyu-xhs-images/` | Baoyu Core：`SLOT_IMG_00` 单张头部信息图设计 |
| `baoyu-infographic` | `.agents/skills/baoyu-infographic/` | Baoyu Core：正文新增解释图设计 |
| `baoyu-diagram` | `.agents/skills/baoyu-diagram/` | Baoyu Specialized：按需贡献结构语法，不渲染图片 |
| `baoyu-image-gen` | `.baoyu-skills/baoyu-image-gen/EXTEND.md` | raster backend；`default_provider` 必须为 `codex-cli` |
| `render-images-serial.mjs` | `.agents/skills/wechat-article-write/scripts/` | 唯一 single-image serial raster execution boundary |
| `gzh-design` | `.agents/skills/gzh-design/` | 微信 HTML 排版、校验和预览 |
| `github-image-hosting` | `.agents/skills/github-image-hosting/` | 博客图片 CDN 适配 |
| `baoyu-post-to-wechat` | `.baoyu-skills/baoyu-post-to-wechat/EXTEND.md` | 微信草稿适配 |

`generate-image-prompts.mjs` 只接受固定 producer 已完成的 external canonical
prompt，并做项目合同 finalize；它不读取第三方模板，也不复制第三方生成算法。
图片阶段的四层术语固定为：Baoyu Design Skills、Baoyu Specialized Design Skills、
Optional Contributors、Raster Renderer。前三层只完成设计；唯一 Raster Renderer
是 `baoyu-image-gen`，唯一 provider 是 `codex-cli`。

## 本地环境

本地配置文件固定为：

```text
.baoyu-skills/.env
```

它被 Git 忽略。可以包含微信、GitHub 图床及其它任务需要的凭据；本技能
不得打印、复制或提交 Secret。图片成本边界不依赖删除其它 API key，而由
`default_provider: codex-cli` 和图片预检保证。

Codex 图片任务建议使用以下非 Secret 调优项：

```env
BAOYU_CODEX_IMAGEGEN_TIMEOUT_MS=1800000
BAOYU_IMAGE_GEN_CODEX_CLI_CONCURRENCY=1
BAOYU_IMAGE_GEN_CODEX_CLI_START_INTERVAL_MS=2000
```

`BAOYU_CODEX_IMAGEGEN_RETRIES` 若已存在则按上游支持的值使用；没有必要
为了显式化默认值而新增。`check-image-backend.mjs` 只报告键名和配置问题，
不会输出值。真实生图由 `render-images-serial.mjs` 集中执行，显式传
`--provider codex-cli`，并在 child process 中将两个 worker/concurrency 键覆盖
为 `1`；不使用 batch 或并行调用，也不修改本文件或全局环境。

修改 provider policy 前运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/check-image-backend.mjs --json
```

任何 raster 任务不能用 CLI 参数把 provider 改成其它值；Codex CLI 不可用
或生成失败时，图片阶段阻塞，不自动切换后端。`baoyu-diagram` 只可作为
结构/拓扑 contributor，不能输出文章最终 SVG/PNG 或成为最终 raster prompt
authority。
