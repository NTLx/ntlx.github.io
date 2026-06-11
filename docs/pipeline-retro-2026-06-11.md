# 管线问题复盘：2026-06-11 wechat-article-write 会话

> 文章：从提示词到工具箱——Claude Code 技能系统的设计哲学
> 日期：2026-06-11
> 结论：管线全流程跑通，但在异常路径上暴露了 4 类问题，按阻塞程度降序排列。

## 1. Subagent 模型路由不可用（阻塞最严重，4 次全败）

### 现象

两轮共 4 个 subagent（封面 + 信息图，各重试 1 次）全部返回：

```
503 No available channel for model claude-sonnet-4-6 under group svip (distributor)
```

### 根因

API 网关（`newapi.cloud.cubicise.com:50505`）上 `claude-sonnet-4-6` 没有可用 channel。主会话模型为 `deepseek-v4-pro`，但 subagent 被强制路由到 sonnet。

### 绕过方式

改为在当前会话中直接 Bash 执行 `baoyu-image-gen/scripts/main.ts`，绕开 subagent 调度。图片生成本身正常（openai/gpt-image-2 可用），问题纯粹在 subagent 的模型路由层。

### 建议修复

- **短期**：在 SKILL.md 中明确 subagent 不可用时的降级路径（直接在当前会话串行执行生图命令）
- **中期**：SKILL.md subagent 派发模板中增加模型选择灵活性——如果 sonnet 不可用，尝试 haiku 或继承主会话模型
- **长期**：图片生成不应依赖特定模型路由，考虑将生图命令封装为独立脚本，由管线直接调用而不经过 subagent

## 2. CDN 上传 `gh ETIMEDOUT`（前 2 次失败）

### 现象

`step5-build.mjs` 中 `github-image-hosting/scripts/upload.ts` 的 `execFileSync('gh', ...)` 连续两次超时：

```
[upload] error: spawnSync gh ETIMEDOUT
```

第 3 次成功。

### 根因

`getExistingFiles()` 调用 `gh api repos/NTLx/Pic/git/trees/master?recursive=1` 递归拉取整个 Pic 仓库文件树（当前 1,166 个文件），在 `execFileSync` 的 30s timeout 内偶尔无法完成。每次上传都全量拉取，无增量缓存。

### 建议修复

- **短期**：在 `upload.ts` 中增加本地文件树缓存（如 `.image-hosting-cache.json`），仅在首次上传或显式 `--refresh` 时全量拉取
- **中期**：将 collision detection 从全量拉取改为按需检查（`gh api repos/{owner}/{repo}/contents/{folder}/{filename}` 逐个检查，仅在冲突时重试）。对于 1,166 个文件的小仓库，按需检查的延迟远低于全量拉取
- **长期**：考虑将文件树缓存写入 `image-map.json` 同级目录，与 step5 的 `--reuse-image-map` 机制对齐

## 3. 门控脚本错误信息信息量不足（2 次需要读源码）

### 现象

| 脚本 | 错误信息 | 实际期望 |
|------|---------|---------|
| `step2-write.mjs` | `缺少文末互动问题（需要靠近正文末尾的 *斜体提问？*）` | 正则 `/^\s*\*[^*\n]{4,}[？?]\*\s*$/m`：单行、以 `*` 包裹、以 `？` 结尾 |
| `step2-write.mjs` | `summary 超过 120 字（当前 131 字）` | 这个信息本身够用，但未说明微信 digest 字段截断行为 |

### 根因

门控逻辑藏在脚本源码的正则和条件判断中。错误信息描述了"缺什么"，但没说"期望什么格式"或"给个反例"。agent 需要额外花时间去读脚本源码才能定位问题。

### 建议修复

- 对格式类校验（正则匹配失败），错误信息中附带期望的正则或一个正确示例：
  ```
  step2: FAIL - 缺少文末互动问题
  期望格式: 以 * 开头和结尾的单行，以中文问号结束
  正确示例: *你们团队有没有那种只有某个人知道的坑？*
  ```
- 对阈值类校验（字数/大小），附带当前值和阈值的对比，以及截断行为说明

## 4. 脚本参数接口不统一（2 次传参错误）

### 现象

| 脚本 | 错误调用 | 正确调用 | 差异 |
|------|---------|---------|------|
| `suggest-category.mjs` | 传 date-slug | 传 `draft.md` 绝对路径 | 有的收 slug，有的收文件路径 |
| `set-frontmatter.mjs` | `category=ai-coding` | `set category ai-coding` | subcommand 风格 vs key=value 风格 |

### 根因

管线脚本分属不同阶段，由不同时期编写，参数约定各自为政（date-slug / 文件路径 / subcommand / key=value）。SKILL.md 中的"工具索引"表只列了脚本名和用途，没列参数签名。

### 建议修复

- 在 SKILL.md 工具索引表中为每个脚本增加 `参数签名` 列，至少标注第一个参数的语义（date-slug / file-path / subcommand）
- 或者：统一所有脚本的第一个位置参数为 date-slug（当前 `step1-collect` / `step2-write` / `step3-polish` / `step4-images` / `step5-build` 已经统一用 date-slug，但 `suggest-category` / `set-frontmatter` 例外）

## 非问题项：流程正常运转的部分

以下环节在本次会话中按预期工作，无需修复：

- Step 1 资料收集：`step1-collect.mjs` 验证通过，背景调研 9 个来源全部标注 URL
- Step 2 写作：ljg-writes 输出质量符合预期，summary/互动/原文参考结构完整
- Step 3 后处理：humanizer-zh + baoyu-format-markdown 排版脚本正常运行
- Step 4 图片生成：4 张图片全部生成成功（openai/gpt-image-2），prompt 模板生成和门控验证正常
- Step 5 产物构建（第 3 次）：CDN 上传 3 张图片，article.md / article-wechat.html 生成，grace/vermilion 主题正确
- Step 6 双轨发布：博客构建 176 页通过、git push 成功；微信草稿发布成功，原文链接正确填入
