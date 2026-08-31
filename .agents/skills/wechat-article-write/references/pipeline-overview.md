# wechat-article-write 流水线概览

流水线由两层组成：`workflow.mjs` 提供可恢复的数字 Step 和阶段合同；
Agent 在开放阶段根据 `orchestration-policy.md` 自主选择方法；脚本在每个
边界运行确定性 Gate。阶段合同约束结果，不规定内容、写作或视觉 Skill。

## Step 与 Stage

| Step | 主要产物 | 负责者 | Gate |
|---|---|---|---|
| 0 | 策略与 post 目录 | Agent + state | 状态初始化 |
| 1 | `materials.md` | Agent / 可选能力 | `step1-collect.mjs` |
| 1.5 | `blog-memory.md/json` | 脚本 | 站内检索结果 |
| 1.8 | `understanding-brief.md` | Agent / 可选能力 | `validate-understanding.mjs` |
| 2 | `draft.md`、`image-plan.json` | Agent / 可选能力 | `step2-write.mjs` |
| 3 | 更新后的 `draft.md` | Agent / 确定性 lint | `step3-polish.mjs` |
| 4 | `cover.png`、`imgs/*` | Agent + 视觉适配器 | `step4-images.mjs` |
| 5 | 三种双轨产物 | 脚本 + 微信排版适配器 | `step5-build.mjs` |
| 6 | 博客提交、微信草稿 | 脚本 | publish Gates |

数字 state 格式和现有发布协议保持不变。`reader-response` 的 Step 2 先
完成理解合同再写作；`tutorial` 将内容适配归入 `adapt`；其它策略按各自
stage sequence 推导，不新增另一套断点格式。

## Step 0：选择编辑目标

从三种 strategy 中选择一种：

- `reader-response`：从材料出发形成属于作者的判断、认知增量和延展思考；
- `tutorial`：准确保留原知识，同时提高解释性、可读性和可执行性；
- `news-digest`：发现事件、核实事实、判断重要性，压缩成可快速决策的信息。

策略只定义编辑目标和阶段序列。数据源、分析方法和写作方法在运行时按
当前缺口选择。新任务先读 `references/originality-policy.md`，观察近期开文
节奏，再建立 `posts/{date-slug}/`。

## Step 1：收集与核验材料

把原始材料、用户意图和必要的背景/时效信息写入 `materials.md`。事实、
推断和作者观点要分开；进入正文的外部事实必须保留可追溯 URL，无法核实
的内容明确标注。需要近期社区反馈时，只使用当前可发现且实际可用的能力，
不要把工具输出格式当成文章结构。

通过后运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/step1-collect.mjs <date-slug>
```

然后生成站内记忆：

```bash
bun run .agents/skills/wechat-article-write/scripts/select-related-articles.mjs <date-slug>
```

## Step 1.8：形成理解合同

需要深度理解的任务在写作前生成 `understanding-brief.md`。Agent 先读材料、
站内记忆、策略目标和上一 Gate，再运行动态 catalog；可选择自己完成、一个
专业 Skill 或少量互补 Skill。最终只保留对文章有用的判断，不把多份分析
报告原样拼接。

brief 至少应说明材料结构、核心问题、中心判断、关键概念、机制、约束与
边界、反方、可写判断、可视觉化节点，以及至少三条可检查的写作增量承诺。
通过：

```bash
bun run .agents/skills/wechat-article-write/scripts/validate-understanding.mjs <date-slug>
```

## Step 2：写作或内容适配

以 stage contract 为准生成 `draft.md` 和 `image-plan.json`。无论是否委托
专业写作能力，Agent 都必须负责仓库适配：frontmatter、`summary`、
`sourceUrl`、H2 正文、参考资料、互动（策略允许时）、站内联动和 SLOT
占位符都要完整。SLOT 不是章节打卡，而是放在确实需要视觉解释的论证节点；
当前兼容规则要求 SLOT 00 和至少三张文内图。

教程适配还要保留 `targetPath` 和源文 canonical URL；具体例外见教程策略。
写完运行 `step2-write.mjs`，失败时根据 Gate 错误修正产物，不要直接前进。

## Step 3：按问题 refine

先诊断文本实际问题，再决定是否调用格式、语言或结构能力。可以不调用
任何 Skill；已好的段落不为“润色”而重写。保住作者第一人称判断和自然
毛边，不把全文统一成模板腔。确定性格式检查和最终内容协议由：

```bash
bun run .agents/skills/wechat-article-write/scripts/step3-polish.mjs <date-slug>
```

需要交接或复盘 Adaptive Stage 时，可按 policy 使用
`scripts/orchestration-trace.mjs` 写入尽力而为的 JSONL 记录；它不属于
Stage Contract，不会替代 artifact、state 或 Gate。

## Step 4：视觉意图与图片资产

先说明每个 SLOT 要让读者看懂什么，再从当前 catalog 选择分析、布局或插图
能力。生成 prompt 后逐张审阅；图片必须与正文信息对应，文字、数字和命名
契约必须复核。

所有 raster rendering 的链路固定为：高层视觉能力 → `baoyu-image-gen` →
`codex-cli`。repository static 依赖检查不要求本机 runtime；真实生图前必须运行
`bun run .agents/skills/wechat-article-write/scripts/check-image-backend.mjs --runtime`。
运行图片预检后，日常命令不传 provider 覆盖参数；Codex CLI
不可用或失败时当前 stage BLOCKED，不得切换其它后端。完整规则见
`references/image-backends.md`。

## Step 5：确定性双轨构建

先让脚本根据 `draft.md`、图片和 CDN 配置生成：

```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug> --prepare-only
```

得到 `article.md` 和 `article-wechat-source.md` 后，由 Agent 调用
`gzh-design` 生成 `article-wechat.html`。博客保留 Markdown 链接和 CDN 图；
微信源文件将普通链接展开为纯文本 URL，HTML 最终不得有普通 `<a href>`。
然后运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug> --finalize-only
```

finalize（HTML finalize）会运行 HTML validator 并记录 Step 5 状态。不能用 post 内临时
渲染脚本替代排版适配器。

## Step 6：发布

只在 Step 5 通过后按“博客先行、微信草稿后行”运行发布。微信输入固定是
`article-wechat.html`，阅读原文由 canonical `sourceUrl` 生成带 UTM 的地址。
发布失败保留 state 和本地 artifacts；重试前先查看：

```bash
bun run .agents/skills/wechat-article-write/scripts/state.mjs next <date-slug>
bun run .agents/skills/wechat-article-write/scripts/pipeline.mjs <date-slug>
```

## Gate 失败与多文章拆分

Gate 失败时遵循 Observe → Define Gap → Discover → Select → Delegate →
Verify → Adapt 闭环。可修输入、换路线或由 Agent 补足；相同失败不应无脑
重复。若材料含多个互相独立、各自足够成文的主题，先提出拆分方案并取得
确认，再为每篇文章建立独立 post 和 state。
