# wechat-article-write 运行时配置

此文件只保存本技能自己的运行偏好。阶段合同、Gate 和自适应编排规则
分别由 `scripts/workflow.mjs` 与 `references/orchestration-policy.md`
维护；这里不登记内容或写作 Skill 路由。

## 配置项

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
| `baoyu-image-gen` | `.baoyu-skills/baoyu-image-gen/EXTEND.md` | raster backend；`default_provider` 必须为 `codex-cli` |
| 条件式视觉 adapter 模板 | `.agents/skills/{skill}/` | 仅在 image-plan 选择 `adapter` 时按需读取；不属于全局 hard dependency |
| `gzh-design` | `.agents/skills/gzh-design/` | 微信 HTML 排版、校验和预览 |
| `github-image-hosting` | `.agents/skills/github-image-hosting/` | 博客图片 CDN 适配 |
| `baoyu-post-to-wechat` | `.baoyu-skills/baoyu-post-to-wechat/EXTEND.md` | 微信草稿适配 |

`generate-image-prompts.mjs` 仅在实际资产选择 `adapter` 时读取兼容模板；
`external` producer 路径不读取这些模板，也不复制第三方生成算法。

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
不会输出值。

修改 provider policy 前运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/check-image-backend.mjs --json
```

任何 raster 任务不能用 CLI 参数把 provider 改成其它值；Codex CLI 不可用
或生成失败时，图片阶段阻塞，不自动切换后端。
