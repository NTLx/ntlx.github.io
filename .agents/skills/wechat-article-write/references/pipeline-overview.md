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
| 4 | `cover.png`、`imgs/*` | Baoyu Core Design + 可选 contributor + serial raster renderer | `step4-images.mjs` |
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
同时必须由 `baoyu-article-illustrator` 完成全文视觉价值审阅，并在
`article_visual_design.coverage_review` 为每个 substantive H2 写出
`illustrate`/`reuse-source`/`text-only` 决定。正文 SLOT 只在有明确视觉信息增益时
创建，数量仍由 `image-plan.json` 决定，可以为 0..N；SLOT00 必须恰好一次、位于
首个 substantive H2 前并作为正文第一张视觉。原始图片还必须有
`source_image_review` 处置决定。

教程适配还要保留 `targetPath` 和源文 canonical URL；具体例外见教程策略。
写完运行 `step2-write.mjs`，失败时根据 Gate 错误修正产物，不要直接前进。

## Step 3：按问题 refine

先诊断文本实际问题，再调用 mandatory `humanizer-zh` 清理 AI 写作痕迹；再决定
是否调用其它格式、语言或结构能力。humanizer 可零改动，但不能跳过。保住作者
已有的第一人称判断和自然毛边，不把全文统一成模板腔；不得凭空编造作者经历、
态度或情绪。确定性格式检查和最终内容协议由：

```bash
bun run .agents/skills/wechat-article-write/scripts/step3-polish.mjs <date-slug>
```

在运行 Step 3 前，必须先读取并应用 `humanizer-zh`，审阅 semantic drift，再运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/pre-humanizer-normalize.mjs <date-slug>
bun run .agents/skills/wechat-article-write/scripts/mark-humanized.mjs <date-slug>
bun run .agents/skills/wechat-article-write/scripts/step3-polish.mjs <date-slug>
```

`pre-humanizer-normalize.mjs` 负责所有可能改写 `draft.md` 的确定性图片/cover
规范化，必须发生在 humanizer receipt 之前。receipt 产生后至 Step 5 finalize
完成，`draft.md` 是 immutable；Step 4 若发现 MIME、路径或 `coverImage` 不一致，
直接失败并要求回到该预处理、重新 humanize，不得自行修正正文。

每次 Adaptive Stage 路线尝试完成 Gate 后，按 policy 默认 best-effort 使用
`scripts/orchestration-trace.mjs` 写入一条 JSONL 记录；它不属于 Stage
Contract，不会替代 artifact、state 或 Gate。没有调用 Skill 时记录
`selected=no-skill`，写盘失败只 warning。

## Step 4：Baoyu 视觉设计与图片资产

先运行 `baoyu-article-illustrator` 完成全文视觉规划：判断哪些位置真正有
视觉增益、正文密度和整体 controlled variation；即使正文插图为 0 张，也要
记录 `article_visual_design.skill=baoyu-article-illustrator`。随后使用
`baoyu-cover-image` 设计 cover，使用 `baoyu-infographic` 设计
`SLOT_IMG_00`。这三项是每篇文章的 Baoyu Core Design Layer。

再运行 metadata-only catalog，按当前结构需求渐进式读取专项能力。涉及组件
关系、架构、流程、时序、数据流、层级或状态转换时，Agent 可以选择
`baoyu-diagram`；它只贡献 diagram structure/topology，不生成 SVG/PNG，不做
SVG→PNG，也不成为最终 prompt authority。其它 Baoyu 或第三方能力也只能作为
Optional Contributor。所有设计委托都处于 DESIGN-ONLY MODE，不调用任何 raster
backend。

image-plan 使用一个现有文件，且每个最终 asset 必须有对应的 `baoyu_design`：
cover 为 `baoyu-cover-image`，SLOT00 为 `baoyu-infographic`，正文为
`baoyu-article-illustrator`；正文 `illustrations` 允许为空。Agent 自主组合
Type、Layout、Style、Palette、Rendering、Mood、Font，不由 `article_type`、
`direction`、关键词或代码路由决定。动态 adapter 直接验证当前 Baoyu 的稳定
reference 文件；旧 map 只供显式 `--allow-default-image-plan` 兼容模式。

图片拓扑必须满足：draft SLOT ↔ image-plan entry ↔ active canonical prompt ↔
image。生成全部 active prompt 后，先运行 prompt preflight，再运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/check-image-backend.mjs --runtime
bun run .agents/skills/wechat-article-write/scripts/render-images-serial.mjs <date-slug>
```

renderer 固定按 cover、SLOT00、正文数字升序逐张执行；每张等待并验证完成后
才启动下一张，失败即停，默认跳过已有且有效的当前 asset。唯一 raster 链路
是 `baoyu-image-gen → codex-cli`，禁止 batch、`--jobs`、并行 tool call、后台
任务和其它 provider。stale prompt/image 只 warning；active 缺失仍 FAIL。完整
规则见 `references/orchestration-policy.md`、`references/image-policy.md` 和
`references/image-backends.md`。

## Step 5：确定性双轨构建

先让脚本校验 `draft.md`、cover、`imgs/*` 和本地图片引用；随后由
`github-image-hosting` 根据业务目录和命名前缀发布图片并生成真实 map：

```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug> --prepare-only
```

prepare 只调用一次图床，参数等价于：

```bash
bun run .agents/skills/github-image-hosting/scripts/upload.ts \
  posts/<date-slug>/imgs \
  --folder wechat-articles \
  --name-prefix <date>-<blogSlug>-img \
  --output posts/<date-slug>/image-map.json
```

图床 Skill 独占仓库/分支配置、远端索引、blob 去重、命名冲突、重试、批量
commit/ref 和 CDN URL 构造。Step 5 只校验 `image-map.json` 覆盖 draft 实际
引用的图片，然后生成 `article.md` 和 `article-wechat-source.md`。博客保留
Markdown 链接和 CDN 图；微信源文件将普通链接展开为纯文本 URL，HTML 最终不
得有普通 `<a href>`。

得到两个中间产物后，由 Agent 调用 `gzh-design` 生成
`article-wechat.html`。然后运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug> --finalize-only
```

finalize（HTML finalize）会依次运行 gzh-design validator 和 structural parity
validator，并在两者都通过后记录 Step 5 状态。parity 只比较 substantive heading
顺序、图片数量/basename 顺序、图片所属 section 和 SLOT00 lead 归属，不限制主题
wrapper、CSS 或其它视觉表现。`--finalize-only` 只消费三个已准备的本地 artifact，
不调用图床、不读取 GitHub 配置、不访问网络。不能用 post 内临时渲染脚本替代
排版适配器。

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
