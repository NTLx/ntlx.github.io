# 图片后端策略

本管线的封面、信息图、文内插图默认走 Codex CLI：通过 `baoyu-image-gen --provider codex-cli` 间接调用本机 `codex exec` 和 Codex 内置 image generation。这样任何 AI Agent 只要能执行 shell 命令，并且机器上已有 `codex login`，都能使用同一条文生图路径。

Codex CLI 可用时，它是唯一首选文生图后端。不得因为当前 Agent 自带 image generation 工具就改走该工具，也不得因为 `.baoyu-skills/baoyu-image-gen/EXTEND.md` 配了其他 provider 就跳过 `--provider codex-cli`。

Codex CLI 失败后才走 baoyu fallback。preferred_image_backend 只定义 Codex CLI 明确失败后的 baoyu fallback，通常是 `openai` / `dashscope` / `google` 等 API 后端。不要修改第三方 `baoyu-image-gen` 源码；它已经提供 `codex-cli` provider、输出路径、PNG 校验、错误分类和重试。

## 后端顺序

1. **唯一首选后端**：`baoyu-image-gen --provider codex-cli`
2. **失败后 fallback 后端**：`baoyu-image-gen --provider <preferred_image_backend>`
3. **验证门控**：无论哪个后端成功，最后都必须运行 `step4-images.mjs`

Codex CLI 路径使用用户的 Codex / ChatGPT 登录态，不需要 `OPENAI_API_KEY`。如果 fallback 设为 OpenAI API，才需要 `.baoyu-skills/.env` 中的 `OPENAI_API_KEY`，默认模型可继续是 `gpt-image-2`。

## 调用原则

- Codex CLI 单张图超时要设得长一些，建议显式导出 `BAOYU_CODEX_IMAGEGEN_TIMEOUT_MS=1800000`（30 分钟）后再跑 Step 4。
- 每张图片先用 `--provider codex-cli`，明确传 `--image` 到目标文件。
- 只有 Codex CLI 返回**明确失败信号**时，才调用 baoyu fallback。明确失败信号包括：命令非零退出、输出中出现明确 error/fail/rejected 结果、登录态失效、内容审核拒绝、或进程确定结束但没有产出 PNG。
- **不要**把“长时间没有新输出”当成失败信号。`codex exec`/`image_gen` 可能静默运行较久；只要进程仍在，就继续等待，不要因为沉默而提前切 fallback。
- fallback 每张最多执行 1 次；仍失败就记录失败项，停止对该图继续重试。
- 不使用 provider 默认随机名；输出文件名必须符合 `cover.png` 或 `imgs/NN-<desc>.png`。
- 所有图片必须逐张串行完成：禁止并发启动多个 `baoyu-image-gen` / `codex exec`。这不是性能优化空间；并发会增加锁、限额和上下文风险。
- 若 Codex CLI 返回 `lock_busy` 并指向 `/home/lx/.cache/baoyu-codex-imagegen/codex-exec.lock`，先确认没有仍在运行的 `codex exec` / `baoyu-image-gen` 进程，再删除这个 stale lock 后按串行方式重试。

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

1. 第一次失败：先确认失败是**明确失败**，不是静默长跑；如果是 Codex CLI 环境问题或明确报错，再进入 baoyu fallback。
2. fallback 失败：简化 prompt，保留核心信息后重新从 Codex CLI 开始。
3. 仍失败：停止并报告失败项，等待用户决定是否继续调整或稍后重试。

核心原则：默认节省 API 成本并保持通用 Agent 可用性；失败路径必须显式、有限、可验证。
