# 图片后端策略

本管线的封面、信息图、文内插图默认走 Codex CLI：通过 `baoyu-image-gen --provider codex-cli` 间接调用本机 `codex exec` 和 Codex 内置 image generation。这样任何 AI Agent 只要能执行 shell 命令，并且机器上已有 `codex login`，都能使用同一条文生图路径。

Codex CLI 失败后才走 baoyu fallback。fallback provider 来自 `.baoyu-skills/baoyu-image-gen/EXTEND.md` 的 `preferred_image_backend`，通常是 `openai` / `dashscope` / `google` 等 API 后端。不要修改第三方 `baoyu-image-gen` 源码；它已经提供 `codex-cli` provider、输出路径、PNG 校验、错误分类和重试。

## 后端顺序

1. **默认后端**：`baoyu-image-gen --provider codex-cli`
2. **fallback 后端**：`baoyu-image-gen --provider <preferred_image_backend>`
3. **验证门控**：无论哪个后端成功，最后都必须运行 `step4-images.mjs`

Codex CLI 路径使用用户的 Codex / ChatGPT 登录态，不需要 `OPENAI_API_KEY`。如果 fallback 设为 OpenAI API，才需要 `.baoyu-skills/.env` 中的 `OPENAI_API_KEY`，默认模型可继续是 `gpt-image-2`。

## 调用原则

- 每张图片先用 `--provider codex-cli`，明确传 `--image` 到目标文件。
- 只有 Codex CLI 命令非零退出、超时、未产出 PNG、登录态失效或内容被拒时，才调用 baoyu fallback。
- fallback 每张最多执行 1 次；仍失败就记录失败项，停止对该图继续重试。
- 不使用 provider 默认随机名；输出文件名必须符合 `cover.png` 或 `imgs/NN-<desc>.png`。
- 不并行调用 Codex CLI；它会启动完整 `codex exec`，并发只会增加锁、限额和上下文风险。

## 审核失败处理

复杂 prompt 可能触发内容过滤。不要批量重跑；只对失败图片逐个处理：

1. 移除可能触发审核的具象词汇，改用抽象隐喻。
2. 缩短 prompt，只保留核心视觉元素、构图和必要文字。
3. 删除不必要的政治、暴力、攻防、医疗、安全风险等词。
4. 保留文章所需的逻辑表达，但用更中性的视觉语言。

示例：

- "攻击" → "冲击波"
- "黑客" → "暗影操作者"
- "监管惩罚" → "红色警示牌"
- "系统崩溃" → "断裂的流程线"

## 构图问题处理

| 问题 | 处理 |
|------|------|
| 内容太集中 | 改为左右对比、三栏结构、流程带、平铺全景 |
| 画面太空 | 增加具体对象和前中后景关系 |
| 文字乱码 | 减少文字数量，只保留 2-4 个短标签 |
| 标签太多 | 改成图标 + 少量关键词 |
| 风格不稳 | 明确使用同一风格词，如 craft-handmade、vector-illustration |

## 重试策略

1. 第一次失败：如果是 Codex CLI 环境问题，直接进入 baoyu fallback。
2. fallback 失败：简化 prompt，保留核心信息后重新从 Codex CLI 开始。
3. 仍失败：停止并报告失败项，等待用户决定是否继续调整或稍后重试。

核心原则：默认节省 API 成本并保持通用 Agent 可用性；失败路径必须显式、有限、可验证。
