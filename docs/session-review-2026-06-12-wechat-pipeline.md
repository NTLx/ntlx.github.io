# 2026-06-12 wechat-article-write 管线复盘：Magnetar AI 文章

## 会话概况

- **任务**：读取 Bloomberg 文章 → 撰写读后感 → 双轨发布（博客 + 微信草稿）
- **URL**：`https://www.bloomberg.com/news/articles/2026-06-09/magnetar-plans-fund-that-replaces-human-analysts-with-ai-bots`
- **最终结果**：✅ 博客已发布 + ✅ 微信草稿已创建
- **总耗时**：约 15-20 分钟（主要瓶颈在图片生成）

---

## 问题清单

### 问题 1：Bloomberg 付费墙 403 — 多种抓取方式全部失败

**现象**：
- `webfetch` 工具直接请求 Bloomberg URL → 返回 `StatusCode: non 2xx status code (403)`
- `defuddle parse <url> --md` → 返回 `Error: Failed to fetch: 403`
- 两种方式均无法获取文章正文

**根因**：Bloomberg 实施了严格的付费墙，对未认证请求返回 403。Agent 层面无法绕过。

**临时解决方案**：
1. 用 `tavily_tavily_search` 搜索 Bloomberg 文章的二次报道（Yahoo Finance、Startup Fortune、Hedgeweek、KuCoin 等）
2. 用 `exa_web_fetch_exa` 从二次报道源提取全文
3. 最终从 Yahoo Finance（Bloomberg 授权转载）和 Startup Fortune 获取了完整内容

**影响**：
- 管线未阻塞，但增加了 2 次额外搜索调用
- 材料完整性依赖二次报道质量，可能遗漏原文细节

**建议优化方向**：
- `SKILL.md` Step 1 策略文件（`reader-response.md`）应增加"付费墙 URL 的降级策略"指引
- 或在 `step1-collect.mjs` 中增加 `--fallback-sources` 参数，允许传入备用搜索结果
- Agent 工具链中 `webfetch` 缺少对 403 的自动重试/降级逻辑

---

### 问题 2：step1-collect.mjs 背景调研 URL 校验失败

**现象**：
```
step1: FAIL `## 背景调研` 章节缺少来源 URL。背景资料必须可追溯；找不到可靠来源时也要说明检索结果
```

**根因**：`step1-collect.mjs` 的校验逻辑（第 48-52 行）扫描 `## 背景调研` 章节到下一个 `##` 或 `---` 之间的所有行，用正则 `/https?:\/\/[^\s)\]>"']+/` 检测是否存在 URL。初始 materials.md 中背景调研章节的来源写法是 `来源：Wikipedia, Magnetar 官网, Bloomberg Odd Lots 播客`（纯文本归属），不含 `https://` 开头的 URL。

**脚本校验逻辑**（`step1-collect.mjs:48-52`）：
```javascript
const backgroundSection = sectionLines.join("\n");
if (!/https?:\/\//.test(backgroundSection)) {
  process.stderr.write("step1: FAIL `## 背景调研` 章节缺少来源 URL...\n");
  process.exit(3);
}
```

**修复方式**：将每个 `###` 子节末尾的 `来源：Wikipedia, ...` 改为包含实际 URL 的列表，如：
```
- 来源：https://en.wikipedia.org/wiki/Magnetar_Capital, https://www.magnetar.com/...
```

**影响**：非阻塞（修改后重新运行通过），但浪费了一轮 agent 交互。

**建议优化方向**：
- `reader-response.md` 策略文件中明确要求"背景调研章节的每条资料必须附带 `https://` URL"，不要等到脚本校验才暴露
- 或在 `step1-collect.mjs` 中区分"有 URL 但格式不规范"和"完全无 URL"两种情况，给出更精确的错误提示

---

### 问题 3：封面图片生成 subagent 超时但实际成功完成

**现象**：
- 派发 `general-1`（封面）和 `general-2`（信息图）两个 subagent 并行生成图片
- `general-2`（信息图）在正常时间内完成：4.3 MB PNG
- `general-1`（封面）在 `wait` 调用时返回 `{"status": "timeout"}`（默认 5 分钟超时）
- 但随后收到 `actor-notification`：封面实际在约 10 分钟后成功生成（2.4 MB PNG）

**根因**：OpenAI `gpt-image-2` 后端生成封面图耗时约 10 分钟，超过了 `wait` 的默认 5 分钟超时。subagent 在后台继续运行，最终成功完成。

**影响**：
- Agent 侧收到 timeout 后需要手动检查状态（`actor status`），增加了交互轮次
- 如果 agent 在 timeout 后立即放弃并重新派发，会造成重复生成浪费额度

**建议优化方向**：
- `SKILL.md` Step 4 的 subagent prompt 模板中，`timeout_ms` 应显式设为 `600000`（10 分钟）而非依赖默认值
- 或在 `baoyu-image-gen` 的 EXTEND.md 中增加 `max_generation_time` 配置项，让 agent 根据 provider 特性调整超时
- `wait` 调用的默认超时应从 5 分钟提升到至少 8 分钟（图片生成场景）

---

### 问题 4：step2-write.mjs 警告 materials.md 中 9 个 URL 未在 draft.md 中引用

**现象**：
```
step2: WARNING materials.md 中有 9 个 URL 未在 draft.md 中引用
```

**根因**：materials.md 中有 11 个背景调研 URL（如 Wikipedia、LinkedIn、Rebellion Research、HedgeCo.Net、Gradient Flow 等），但 draft.md 正文和"原文参考"区块只引用了 2 个主要来源 URL。其余 9 个是背景调研的辅助来源。

**影响**：非阻塞（WARNING，不阻断管线），但说明 agent 在写作时没有充分引用所有调研来源。

**建议优化方向**：
- 这是合理的 WARNING——读后感不需要引用所有背景来源
- 但可以在 `reader-response.md` 策略中说明：背景调研 URL 的引用规则是"正文提及的关键事实需标注来源"，不必全部引用
- 或将 WARNING 拆分为"关键来源未引用"和"辅助来源未引用"两个级别

---

### 问题 5：字数略超目标范围

**现象**：draft.md 最终字数 1655 字，ljg-writes 目标 1000-1500 字。

**根因**：读后感文章需要覆盖原文要点、背景调研、个人判断三个维度，1655 字在合理范围内。`step2-write.mjs` 仅记录字数，不作为通过/失败条件。

**影响**：无实际影响。

**建议**：无需优化。字数控制由 ljg-writes 技能自律，管线脚本不设门控是正确设计。

---

## 管线执行时间线

| 步骤 | 耗时 | 状态 | 备注 |
|------|------|------|------|
| Step 0: 策略选择 | ~10s | ✅ | reader-response |
| Step 1: 资料收集 | ~2min | ✅ | Bloomberg 403 → 降级搜索 → 修复 URL 格式 |
| Step 2: 文章创作 | ~3min | ✅ | ljg-writes + suggest-category + set-frontmatter |
| Step 3: 文本后处理 | ~1min | ✅ | humanizer-zh + baoyu-format-markdown |
| Step 4: 图片生成 | ~12min | ✅ | 封面 ~10min（超时但完成），信息图 ~3min |
| Step 5: 产物构建 | ~30s | ✅ | CDN 上传 + HTML 转换 |
| Step 6.1: 博客发布 | ~30s | ✅ | astro build + git push |
| Step 6.2: 微信发布 | ~20s | ✅ | API 草稿创建 |

---

## 文件产物清单

| 文件 | 用途 |
|------|------|
| `posts/2026-06-12-Magnetar用AI机器人取代人类分析师/materials.md` | 原文 + 背景调研 |
| `posts/2026-06-12-Magnetar用AI机器人取代人类分析师/draft.md` | 文章草稿 |
| `posts/2026-06-12-Magnetar用AI机器人取代人类分析师/article.md` | CDN URL 版（博客用） |
| `posts/2026-06-12-Magnetar用AI机器人取代人类分析师/article-wechat.html` | 本地路径版（微信用） |
| `posts/2026-06-12-Magnetar用AI机器人取代人类分析师/cover.png` | 封面图（2.4 MB） |
| `posts/2026-06-12-Magnetar用AI机器人取代人类分析师/imgs/00-infographic-core-summary.png` | 信息图（4.3 MB） |
| `posts/2026-06-12-Magnetar用AI机器人取代人类分析师/image-plan.json` | 图片规划 |
| `posts/2026-06-12-Magnetar用AI机器人取代人类分析师/imgs/prompts/*.md` | 图片 prompt 文件 |

---

## 优化建议优先级

| 优先级 | 问题 | 建议 | 影响范围 |
|--------|------|------|----------|
| P0 | 封面生成超时 | SKILL.md Step 4 subagent prompt 中显式设 `timeout_ms: 600000` | 所有图片生成任务 |
| P1 | Bloomberg 403 | reader-response.md 增加付费墙降级策略；或 webfetch 增加 403 自动重试 | 涉及付费墙 URL 的任务 |
| P1 | 背景调研 URL 格式 | reader-response.md 明确要求背景调研必须附 `https://` URL | 所有 reader-response 任务 |
| P2 | URL 引用 WARNING | 拆分为"关键/辅助"两级，或在策略文件中说明引用规则 | 非阻塞，改善提示质量 |
