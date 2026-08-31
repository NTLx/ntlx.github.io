# 图片后端策略

这是本管线图片成本边界的唯一说明。图片方法可以动态选择，raster
provider 不可以动态选择：

```text
高层视觉能力
    ↓
baoyu-image-gen
    ↓
default_provider: codex-cli
    ↓
Codex CLI / codex exec
```

## 两层配置

高层视觉 Skill 若会直接生成 raster，必须通过其官方项目配置将
`preferred_image_backend` 固定为 `baoyu-image-gen`。如果某个新 Skill 无法
这样配置，它只能负责视觉意图、布局、分析或 prompt，不得直接渲染本管线
图片。

`.baoyu-skills/baoyu-image-gen/EXTEND.md` 使用当前 schema：

```yaml
---
version: 1
default_provider: codex-cli
---
```

其它 provider 的 `default_model` 可以保留，供仓库的其它任务使用；这不
改变本文章管线的默认 provider，也不要为 Codex 编造普通 API 模型 ID。

## 预检与调用

在图片阶段开始前运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/check-image-backend.mjs
bun run .agents/skills/wechat-article-write/scripts/check-deps.mjs --stage images
```

预检必须确认配置 provider 为 `codex-cli`、当前使用的高层 raster 配置
指向 `baoyu-image-gen`、`codex --version` 成功，并在 CLI 暴露该命令时
确认登录态。Codex CLI 不可用或未登录即阻塞。图片阶段不以 warning 放行。

常规调用让 `EXTEND.md` 解析默认 provider，**不要传 `--provider`**：

```bash
bun run .agents/skills/baoyu-image-gen/scripts/main.ts \
  --promptfiles posts/<date-slug>/imgs/prompts/00-cover-<desc>.md \
  --image posts/<date-slug>/cover.png \
  --ar 16:9

bun run .agents/skills/baoyu-image-gen/scripts/main.ts \
  --promptfiles posts/<date-slug>/imgs/prompts/01-<desc>.md \
  --image posts/<date-slug>/imgs/01-<desc>.png \
  --ar 16:9
```

测试或诊断时若必须显式指定 provider，也只能写
`--provider codex-cli`；文章管线不得传其它 provider。不能使用运行时
原生 image generation 绕过这条链路，也不能因为 `.env` 中有其它 API key
就改变选择。

## 失败语义

成功必须同时满足：命令 exit code 为 0、目标文件存在且是有效图片、输出
provider 可追溯为 `codex-cli`。只看到“Switch model”提示不是失败；Codex
长时间没有 stdout 也不是失败，只要进程仍在就继续等待。

失败后只允许：

1. 确认进程和锁状态，清理已确认的 stale lock；
2. 简化或修正 prompt，保留必要的信息；
3. 沿同一 Codex 路径有限重试；
4. 仍失败则把当前图片和 stage 标记为 BLOCKED 并报告。

禁止自动或手动 fallback 到任何其它 raster provider。失败的图片不能以
“文件存在”作为成功，也不能跳过 `step4-images.mjs`。

## 串行、命名和质量

- 主 Agent 逐张串行执行；禁止 batch 模式，不使用 `batch.json`、
  `--batchfile`、并发任务、`Promise.all`、`xargs -P`、后台任务或多个
  subagent；底层 `codex-exec.lock` 也必须保持单写者；
- 封面写到 post 根目录 `cover.png`；SLOT 图写到
  `imgs/NN-<desc>.png`，并与 prompt basename 一致；
- 运行 `step4-images.mjs` 前逐张查看图片，复核可见文字、数字和正文关系；
- SLOT 00 是全文压缩信息图，不是只解释附近一段文字的局部插图；
- 文内图默认是文章解释图，除非用户明确要求，不使用会伪装成工程图纸的
  日期、图号、标题栏、尺寸线等装饰。

最终 Gate：

```bash
bun run .agents/skills/wechat-article-write/scripts/step4-images.mjs <date-slug>
```
