# 图片模板注册表实施方案

> 将第三方文生图技能（baoyu-infographic、baoyu-article-illustrator、baoyu-cover-image、gpt-image-2）的模板能力引入 wechat-article-write 管线，实现内容感知的图片模板自动选择。

## 实施进度（截至 2026-06-12）

| Phase | 状态 | 说明 |
|-------|------|------|
| Phase 1：创建模板注册表 | ✅ 完成 | `references/image-template-catalog.md` 已创建，SKILL.md 索引已更新 |
| Phase 2：修改 prompt 生成脚本 | ✅ 完成 | `generate-image-prompts.mjs` 已修改，3 项测试用例通过（fallback / 动态 / 无效 JSON） |
| Phase 3：集成到策略文件 | ✅ 完成 | `reader-response.md` Step 2 +`视觉规划`步骤；`tutorial.md` Step 1 +`视觉规划`步骤 |
| Phase 4：引入 gpt-image-2 模板 | ⏸ 待定 | 可选，待 Phase 1-3 经实战验证稳定后再考虑 |

**已验证的向后兼容性**：

- 无 `image-plan.json` → fallback 到原硬编码默认值（cool / flat-vector / bento-grid / craft-handmade / vector-illustration）
- 有 `image-plan.json` → 动态选择模板，未指定的 slot fallback 到 `inferIllustrationType()`
- 无效 JSON → 打印 WARN 并 fallback，不中断管线

**实施决策记录**：

- `news-digest.md` 策略文件未修改（标注为实验性，实施文档未包含）
- 第三方技能源码（baoyu-*）只读引用，未修改
- `image-plan.json` 的 `illustrations` 数组中 `description` 字段会被用作 prompt 文件名描述部分（`safeDesc()`），覆盖 draft.md 中的占位符描述

## 背景与问题

### 当前管线的图片生成流程

```
Step 2 (写作)                    Step 4 (图片生成)
─────────────────                ─────────────────────────
Agent 写 draft.md                generate-image-prompts.mjs
  插入 SLOT_IMG 占位符             硬编码模板选择:
  ↓                               - 信息图: bento-grid + craft-handmade (永远)
Agent 收工                        - 插图: comparison/flowchart/framework 三选一
                                  - 封面: conceptual + cool + flat-vector (永远)
                                ↓
                              生成 prompt 文件 → subagent 调用 baoyu-image-gen
```

### 核心问题

| 图片类型 | 当前硬编码 | 第三方技能可用模板池 | 利用率 |
|----------|-----------|---------------------|--------|
| 信息图 | `bento-grid` + `craft-handmade` | baoyu-infographic: 21 layouts × 22 styles = 462 种组合 | **0.4%** |
| 文内插图 | 3 种 type 硬推断 | baoyu-article-illustrator: 6 types × multiple styles；gpt-image-2: 18 categories, 80+ templates | **<5%** |
| 封面 | `conceptual` / `cool` / `flat-vector` | baoyu-cover-image: 6 types × 11 palettes × 7 renderings = 462 种组合 | **0.4%** |

### 根因

管线缺少一个**内容感知的模板选择层**。写文章的 Agent 在 Step 2 最理解文章内容，但这个知识没有传递到 Step 4 的模板选择。`generate-image-prompts.mjs` 只能硬编码固定的模板组合。

### 目标

1. Agent 在 Step 2 写作时，根据文章内容结构为每张图选择最匹配的模板组合
2. `generate-image-prompts.mjs` 读取 Agent 的选择，动态组装 prompt
3. 不修改任何第三方技能的源码
4. 向后兼容：`image-plan.json` 不存在时 fallback 到当前硬编码逻辑

---

## 架构设计

### 改进后的管线流程

```
Step 0                Step 2                     Step 4
┌──────────┐    ┌──────────────────┐    ┌────────────────────────┐
│ 写作策略   │    │ 文章创作           │    │ 图片 prompt 生成         │
│ 判定       │──→│ Agent 写 draft.md  │──→│ 读取 image-plan.json    │
│ (不变)     │    │ + 规划插图位置      │    │ 查 template catalog     │
└──────────┘    │ + 产出 image-plan  │    │ 动态组装 prompt 文件     │
                │   .json           │    │ (脚本)                   │
                └──────────────────┘    └────────────┬───────────┘
                                                      │
                                              引用 baoyu-* 模板文件
                                              (不复制，只读取路径)
```

### 改动清单

| 序号 | 文件 | 操作 | 说明 |
|------|------|------|------|
| 1 | `references/image-template-catalog.md` | **新建** | 内容类型→模板组合映射规则 |
| 2 | `scripts/generate-image-prompts.mjs` | **修改** | 支持读取 image-plan.json，动态选择模板 |
| 3 | `references/strategies/reader-response.md` | **修改** | Step 2 增加视觉规划指令 |
| 4 | `references/strategies/tutorial.md` | **修改** | Step 2 增加视觉规划指令 |

---

## 详细设计

### 改动 1：新建 `references/image-template-catalog.md`

这是**唯一的新增参考文件**，集中维护内容类型→模板组合的映射规则。

#### 文件位置

```
.agents/skills/wechat-article-write/references/image-template-catalog.md
```

#### 文件内容

```markdown
# 图片模板注册表

本文件定义文章内容类型与图片模板组合的映射规则。Agent 在 Step 2 写作时参考此文件，
为每张 SLOT_IMG 选择最匹配的模板组合，产出 `image-plan.json`。

## 内容类型 → 模板推荐

### technical-deep-dive（技术深度分析）

适用场景：系统架构、技术原理、工程实践、性能分析等深度技术文章。

| 图片位置 | source_skill | 推荐模板 | 推荐风格 | 说明 |
|---------|-------------|---------|---------|------|
| 信息图 | baoyu-infographic | layout: structural-breakdown | style: technical-schematic | 结构分解图适合展示系统分层 |
| 文内插图（架构） | baoyu-article-illustrator | type: framework | style: vector-illustration | 框架图展示组件关系 |
| 文内插图（流程） | baoyu-article-illustrator | type: flowchart | style: blueprint | 流程图展示数据/控制流 |
| 文内插图（对比） | baoyu-article-illustrator | type: comparison | style: blueprint | 方案对比 |
| 封面 | baoyu-cover-image | type: conceptual | palette: cool, rendering: flat-vector | 抽象概念视觉 |

### opinion-essay（观点文章）

适用场景：个人见解、评论、思辨、"为什么我认为 X"类型文章。

| 图片位置 | source_skill | 推荐模板 | 推荐风格 | 说明 |
|---------|-------------|---------|---------|------|
| 信息图 | baoyu-infographic | layout: hub-spoke | style: craft-handmade | 中心辐射适合"核心观点+支撑论据" |
| 文内插图 | baoyu-article-illustrator | type: scene / infographic | style: editorial / notion | 叙事场景或数据可视化 |
| 封面 | baoyu-cover-image | type: metaphor | palette: warm, rendering: hand-drawn | 隐喻式视觉 |

### tutorial（教程/操作指南）

适用场景：步骤教程、配置指南、How-to 文章。

| 图片位置 | source_skill | 推荐模板 | 推荐风格 | 说明 |
|---------|-------------|---------|---------|------|
| 信息图 | baoyu-infographic | layout: linear-progression | style: ikea-manual | 线性步骤流程 |
| 文内插图 | baoyu-article-illustrator | type: flowchart | style: minimal-flat | 简洁步骤图 |
| 封面 | baoyu-cover-image | type: hero | palette: vivid, rendering: digital | 吸引眼球的主视觉 |

### news-digest（资讯简报）

适用场景：AI 日报、行业动态、新闻汇总。

| 图片位置 | source_skill | 推荐模板 | 推荐风格 | 说明 |
|---------|-------------|---------|---------|------|
| 信息图 | baoyu-infographic | layout: bento-grid | style: retro-pop-grid | 多话题模块化概览 |
| 文内插图 | baoyu-article-illustrator | type: infographic | style: notion | 数据密集型可视化 |
| 封面 | baoyu-cover-image | type: typography | palette: mono, rendering: screen-print | 文字主导的现代感 |

### deep-analysis（深度分析/读后感）

适用场景：读后感、论文解读、书评、深度剖析。

| 图片位置 | source_skill | 推荐模板 | 推荐风格 | 说明 |
|---------|-------------|---------|---------|------|
| 信息图 | baoyu-infographic | layout: dense-modules | style: morandi-journal | 高密度知识模块 |
| 文内插图 | baoyu-article-illustrator | type: framework / comparison | style: warm / corporate-memphis | 框架图或对比图 |
| 封面 | baoyu-cover-image | type: scene | palette: elegant, rendering: painterly | 优雅叙事感 |

### listicle（清单/盘点）

适用场景：TOP N 排行、工具推荐、资源合集。

| 图片位置 | source_skill | 推荐模板 | 推荐风格 | 说明 |
|---------|-------------|---------|---------|------|
| 信息图 | baoyu-infographic | layout: comparison-matrix | style: bold-graphic | 矩阵式对比 |
| 文内插图 | baoyu-article-illustrator | type: infographic | style: vector-illustration | 信息密集可视化 |
| 封面 | baoyu-cover-image | type: hero | palette: vivid, rendering: flat-vector | 鲜明主视觉 |

## Slot 上下文 → 插图类型映射

当 Agent 为某个 SLOT_IMG 选择插图类型时，根据占位符附近文字的语义信号判断：

| 上下文信号关键词 | 推荐 illustration type | 推荐 infographic layout |
|----------------|----------------------|------------------------|
| 对比、比较、vs、两种方案、优劣、trade-off | comparison | binary-comparison |
| 流程、步骤、循环、转化、pipeline、workflow | flowchart | linear-progression |
| 架构、结构、层次、组件、模块、系统 | framework | structural-breakdown |
| 数据、指标、统计、占比、趋势 | infographic | dashboard |
| 时间线、演进、历史、发展、阶段 | timeline | linear-progression |
| 关系、利益相关方、生态、网络 | framework | hub-spoke |
| 概念、原理、机制、因果 | framework | hub-spoke |
| 多主题概览、全景、总览 | — | bento-grid |

## 风格一致性规则

1. **同一篇文章的信息图和文内插图应使用同一 style family**：
   - `technical-schematic` ↔ `blueprint`（技术类）
   - `craft-handmade` ↔ `editorial`（叙事类）
   - `ikea-manual` ↔ `minimal-flat`（教程类）
   - `corporate-memphis` ↔ `notion`（商业/数据类）

2. **封面可以独立于正文图片风格**：封面是"视觉锤"，风格可以更自由

3. **推荐组合中已内置风格一致性**，Agent 通常只需按表选择即可

## 封面自动选择规则

当 `image-plan.json` 中封面配置为 `auto` 时，按以下规则自动推断：

| 文章 category | 推荐 type | 推荐 palette | 推荐 rendering |
|--------------|-----------|-------------|---------------|
| ai-coding / engineering | conceptual | cool | flat-vector |
| ai-agents / ai-industry | metaphor | warm | hand-drawn |
| ai-models | conceptual | elegant | digital |
| security | minimal | dark | flat-vector |
| （其他） | scene | cool | flat-vector |

## 使用方式

Agent 在 Step 2 写完 draft.md 后：

1. 确定文章的内容类型（从上方"内容类型 → 模板推荐"中选择最匹配的）
2. 为每个 SLOT_IMG 根据上下文信号选择插图类型
3. 按风格一致性规则确认所有图片的 style family 一致
4. 将选择结果写入 `posts/{date-slug}/image-plan.json`
```

---

### 改动 2：修改 `generate-image-prompts.mjs`

#### 修改目标

脚本在生成 prompt 文件时，优先读取 `image-plan.json` 中的模板选择；若文件不存在，fallback 到当前硬编码逻辑。

#### 修改位置

文件：`.agents/skills/wechat-article-write/scripts/generate-image-prompts.mjs`

#### 修改内容

**Step A：在文件开头增加 `image-plan.json` 读取逻辑**

在 `const dir = postDir(slug);` 之后（约第 152 行），增加：

```javascript
// --- image-plan.json 读取 ---
const imagePlanPath = resolve(dir, "image-plan.json");
let imagePlan = null;
if (existsSync(imagePlanPath)) {
  try {
    imagePlan = JSON.parse(readFileSync(imagePlanPath, "utf8"));
  } catch (e) {
    process.stderr.write(`generate-image-prompts: WARN - invalid image-plan.json, falling back to defaults: ${e.message}\n`);
  }
}
```

**Step B：修改封面 prompt 生成逻辑（约第 188-218 行）**

当前代码硬编码了 `conceptual` / `cool` / `flat-vector`。改为优先从 `imagePlan.cover` 读取：

```javascript
const coverConfig = imagePlan?.cover ?? {};
const coverType = coverConfig.type ?? "conceptual";
const coverPalette = coverConfig.palette ?? "cool";
const coverRendering = coverConfig.rendering ?? "flat-vector";
const coverText = coverConfig.text ?? "none";
const coverMood = coverConfig.mood ?? "bold";

const coverPrompt = `---
type: cover
palette: ${coverPalette}
rendering: ${coverRendering}
---

# Content Context
Article title: ${fm.title}
Content summary: ${fm.summary ?? ""}
Keywords: ${labels.replace(/^- /gm, "").split("\n").filter(Boolean).slice(0, 8).join(", ")}

# Visual Design
Cover theme: conceptual visual hammer
Type: ${coverType}
Palette: ${coverPalette}
Rendering: ${coverRendering}
Font: none
Text level: ${coverText}
Mood: ${coverMood}
Aspect ratio: 16:9
Language: Chinese

# Text Elements
No text elements. Do not render title, labels, captions, logos, watermarks, color names, or hex codes.

# Composition
Type composition: abstract shapes representing the article's central tension; information hierarchy, clean zones.
Visual composition: one strong symbolic metaphor derived from the article, centered with generous negative space.
Color constraint: Color values (#hex) and color names are rendering guidance only — do NOT display color names, hex codes, or palette labels as visible text in the image.
Rendering notes: ${coverRendering}, clean outlines, bold contrast, no photorealism.
`;
```

**Step C：修改信息图 prompt 生成逻辑（约第 220-228 行）**

当前代码硬编码了 `bento-grid` + `craft-handmade`。改为优先从 `imagePlan.infographic` 读取：

```javascript
const infographicConfig = imagePlan?.infographic ?? {};
const infoLayout = infographicConfig.layout ?? "bento-grid";
const infoStyle = infographicConfig.style ?? "craft-handmade";
const infoAspect = infographicConfig.aspect ?? "16:9";

// 动态读取对应的布局和风格文件
function resolveTemplateFile(sourceSkill, subPath) {
  const candidates = [
    resolve(repoRoot(), ".agents/skills", sourceSkill, subPath),
    resolve(repoRoot(), ".claude/skills", sourceSkill, subPath),
  ];
  const found = candidates.find((p) => existsSync(p));
  if (!found) {
    process.stderr.write(`generate-image-prompts: WARN - template not found: ${sourceSkill}/${subPath}, using fallback\n`);
    return null;
  }
  return readFileSync(found, "utf8");
}

const infographicLayoutContent = resolveTemplateFile("baoyu-infographic", `references/layouts/${infoLayout}.md`);
const infographicStyleContent = resolveTemplateFile("baoyu-infographic", `references/styles/${infoStyle}.md`);

const infographicPrompt = infographicBase
  .replaceAll("{{LAYOUT}}", infoLayout)
  .replaceAll("{{STYLE}}", infoStyle)
  .replaceAll("{{ASPECT_RATIO}}", infoAspect)
  .replaceAll("{{LANGUAGE}}", "Chinese")
  .replaceAll("{{LAYOUT_GUIDELINES}}", infographicLayoutContent?.trim() ?? bentoGrid.trim())
  .replaceAll("{{STYLE_GUIDELINES}}", infographicStyleContent?.trim() ?? craftHandmade.trim())
  .replaceAll("{{CONTENT}}", coreContent)
  .replaceAll("{{TEXT_LABELS}}", labels);
```

**Step D：修改文内插图 prompt 生成逻辑（约第 241-282 行）**

当前代码用 `inferIllustrationType()` 硬推断 type。改为优先从 `imagePlan.illustrations` 读取：

```javascript
for (const slot of slots.filter((s) => s.slot > 0)) {
  const context = sectionContext(body, slot.index);

  // 优先从 image-plan.json 读取
  const planEntry = imagePlan?.illustrations?.find((e) => e.slot === slot.slot);
  const type = planEntry?.type ?? inferIllustrationType(context, slot.desc);
  const style = planEntry?.style ?? "vector-illustration";

  const nn = String(slot.slot).padStart(2, "0");
  const desc = safeDesc(planEntry?.description ?? slot.desc, "illustration");

  // 读取对应的风格文件（如有）
  const styleContent = resolveTemplateFile("baoyu-article-illustrator", `references/styles/${style}.md`);

  const prompt = `---
illustration_id: ${nn}
type: ${type}
style: ${style}
---

# Article Illustration Prompt

Article title: ${fm.title}
Slot: SLOT_IMG_${nn}${slot.desc ? `_${slot.desc}` : ""}
Purpose: explain the nearby argument with a high-information visual aid, not decoration.

${typeTemplate(type)}

## Source Context

${context}

${defaultComposition}

${textRequirements}

${commonChineseRule}

${colorRules}

## Style: ${style}

${styleContent?.trim() ?? vectorStyle.trim()}

## Final Rendering Instructions

Clean composition with generous white space. Text should be large, prominent, and readable. Color values (#hex) and color names are rendering guidance only — do NOT display color names, hex codes, or palette labels as visible text in the image. Aspect ratio: 16:9.
`;
  const name = `${nn}-${desc}.md`;
  if (writePrompt(resolve(promptsDir, name), prompt)) outputs.push(name);
}
```

#### 修改要点总结

| 改动 | 位置 | 说明 |
|------|------|------|
| 读取 image-plan.json | 第 152 行后 | 新增约 10 行 |
| 封面 prompt | 第 188-218 行 | 从硬编码改为读取 imagePlan.cover |
| 信息图 prompt | 第 220-228 行 | 从硬编码改为读取 imagePlan.infographic + 动态加载模板文件 |
| 文内插图 prompt | 第 241-282 行 | 从 inferIllustrationType() 改为优先读取 imagePlan.illustrations |
| 新增辅助函数 | 文件中部 | `resolveTemplateFile()` 用于动态定位第三方技能模板文件 |

---

### 改动 3：修改 `references/strategies/reader-response.md`

#### 修改位置

Step 2 "文章创作" 章节，在第 5 步（`set-frontmatter.mjs` 写入 category/blogSlug）之后。

#### 新增内容

在 Step 2 末尾（约第 87 行，`**脚本验证**` 之前）插入：

```markdown
6. **视觉规划**：写完 draft.md 后，分析文章内容结构，为每张 SLOT_IMG 选择最匹配的图片模板组合。
   读取 `references/image-template-catalog.md` 获取推荐规则，产出 `posts/{date-slug}/image-plan.json`。

   **产出要求**：
   - `article_type`：从 catalog 中选择最匹配的内容类型（technical-deep-dive / opinion-essay / deep-analysis / 等）
   - `cover`：根据文章主题选择 type/palette/rendering（参考 catalog 的"封面自动选择规则"）
   - `infographic`：根据核心数据类型选择 layout/style
   - `illustrations`：为每个 SLOT_IMG 根据上下文语义选择 type/style
   - 所有图片保持风格一致（同一 style family，参考 catalog 的"风格一致性规则"）

   **image-plan.json 格式**：

   ```json
   {
     "article_type": "deep-analysis",
     "cover": {
       "source_skill": "baoyu-cover-image",
       "type": "scene",
       "palette": "elegant",
       "rendering": "painterly",
       "text": "none",
       "mood": "balanced"
     },
     "infographic": {
       "source_skill": "baoyu-infographic",
       "layout": "dense-modules",
       "style": "morandi-journal",
       "aspect": "16:9"
     },
     "illustrations": [
       {
         "slot": 1,
         "source_skill": "baoyu-article-illustrator",
         "type": "framework",
         "style": "warm",
         "description": "核心概念框架图"
       }
     ]
   }
   ```

   **约束**：
   - `illustrations` 数组中的 `slot` 编号必须与 draft.md 中的 `SLOT_IMG_XX` 占位符一一对应
   - 若某个 slot 在 draft.md 中存在但 image-plan.json 中缺失，脚本将 fallback 到自动推断
   - 若 image-plan.json 整体缺失，脚本 fallback 到当前硬编码逻辑（向后兼容）
```

---

### 改动 4：修改 `references/strategies/tutorial.md`

#### 修改位置

与 reader-response.md 类似，在 Step 2 末尾增加视觉规划指令。

#### 新增内容

```markdown
6. **视觉规划**：写完 draft.md 后，分析文章内容结构，为每张 SLOT_IMG 选择最匹配的图片模板组合。
   读取 `references/image-template-catalog.md` 获取推荐规则，产出 `posts/{date-slug}/image-plan.json`。

   教程类文章的推荐默认值：
   - `article_type`: `tutorial`
   - `infographic`: `linear-progression` + `ikea-manual`（步骤流程图）
   - 文内插图：`flowchart` + `minimal-flat`（简洁步骤图）
   - 封面：`hero` + `vivid` + `digital`

   详见 catalog 中"tutorial"类型的推荐组合。Agent 应根据文章实际内容调整，不必拘泥于默认值。
```

---

## 实施步骤

### Phase 1：创建模板注册表 ✅ 已完成

1. ✅ 创建 `.agents/skills/wechat-article-write/references/image-template-catalog.md`，内容见上方"改动 1"
2. ✅ 在 `wechat-article-write/SKILL.md` 的参考文档索引表中增加一行：

   ```markdown
   | `references/image-template-catalog.md` | 内容类型→图片模板组合映射规则 |
   ```

3. ✅ **验证方式**：Agent 在下次写文章时，参考 catalog 选择模板组合，手工 fallback 路径中使用推荐的 layout/style。确认生成的 prompt 质量优于当前硬编码

### Phase 2：修改 prompt 生成脚本 ✅ 已完成

1. ✅ 按上方"改动 2"修改 `generate-image-prompts.mjs`
2. ✅ **测试用例**：

   **用例 A（向后兼容）** ✅：不创建 image-plan.json，运行脚本，确认 fallback 到硬编码逻辑，输出与修改前一致

   **用例 B（新功能）** ✅：创建 image-plan.json，运行脚本，确认 prompt 文件使用了 json 中指定的 layout/style/type
   - 封面：warm + hand-drawn ✓
   - 信息图：hub-spoke + craft-handmade ✓
   - 插图 slot 1（在 json 中）：framework + editorial ✓
   - 插图 slot 2（不在 json 中）：自动推断 comparison + vector-illustration ✓

   **用例 C（部分覆盖）** ✅：image-plan.json 只指定部分 illustrations。未在 json 中的 slot fallback 到 inferIllustrationType()

   **用例 D（无效 JSON）** ✅：image-plan.json 内容非法。确认脚本打印 WARN 并 fallback

### Phase 3：集成到策略文件 ✅ 已完成

1. ✅ 按上方"改动 3"修改 `references/strategies/reader-response.md`
2. ✅ 按上方"改动 4"修改 `references/strategies/tutorial.md`
3. ⏳ **验证方式**：完整走一遍 wechat-article-write 管线（Step 0-6），确认 image-plan.json 被正确产出和消费

### Phase 4（可选）：引入 gpt-image-2 模板 ⏸ 待定

当 Phase 1-3 稳定后，可将 gpt-image-2 的部分模板引入 catalog 作为补充：

- **学术图**：gpt-image-2 的 `academic-figures/` 模板（method-pipeline-overview、neural-network-architecture 等）适合 AI/ML 类文章
- **技术架构图**：gpt-image-2 的 `technical-diagrams/` 模板（system-architecture、flowchart-decision 等）适合工程类文章

引入方式：在 catalog 中增加对应的推荐条目，`source_skill` 设为 `gpt-image-2`，脚本中 `resolveTemplateFile()` 需适配 gpt-image-2 的目录结构（`references/{category}/{template}.md`）。

---

## 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| Agent 产出的 image-plan.json 模板选择不当 | 图片与文章内容不匹配 | catalog 中的推荐规则覆盖 80% 场景；Agent 可根据实际情况调整；prompt 质量检查清单不变 |
| 第三方技能模板文件路径变更 | resolveTemplateFile() 找不到文件 | 函数有 fallback 逻辑，找不到时使用默认模板并打印 WARN |
| image-plan.json 格式错误 | 脚本解析失败 | try-catch 包裹，失败时 fallback 到硬编码 |
| 风格不一致（信息图和插图用了不同 style family） | 视觉不协调 | catalog 中内置风格一致性规则；Agent 在 Step 2 负责检查 |
| 性能影响（动态读取更多模板文件） | 脚本执行变慢 | 模板文件都是小 Markdown（<5KB），读取开销可忽略 |

---

## 文件依赖图

```
wechat-article-write/
├── SKILL.md                                    ← 增加 catalog 索引
├── references/
│   ├── image-template-catalog.md               ← 新增：模板注册表
│   ├── image-backends.md                       ← 不变
│   ├── strategies/
│   │   ├── reader-response.md                  ← 修改：Step 2 增加视觉规划（第 6 步）
│   │   └── tutorial.md                         ← 修改：Step 1 增加视觉规划（第 10 步）
│   └── ...
├── scripts/
│   ├── generate-image-prompts.mjs              ← 修改：读取 image-plan.json
│   └── ...
└── ...

第三方技能（只读引用，不修改）：
├── .agents/skills/baoyu-infographic/references/
│   ├── base-prompt.md                          ← 被脚本读取
│   ├── layouts/*.md                            ← 被脚本按需读取
│   └── styles/*.md                             ← 被脚本按需读取
├── .agents/skills/baoyu-article-illustrator/references/
│   ├── prompt-construction.md                  ← 被脚本读取
│   └── styles/*.md                             ← 被脚本按需读取
└── .agents/skills/baoyu-cover-image/references/
    └── workflow/prompt-template.md             ← 被脚本读取
```

---

## 变更文件清单（2026-06-12 实施）

### 新增文件

| 路径 | 说明 |
|------|------|
| `.agents/skills/wechat-article-write/references/image-template-catalog.md` | 图片模板注册表：6 种内容类型→模板组合映射 |

### 修改文件

| 路径 | 改动摘要 |
|------|---------|
| `.agents/skills/wechat-article-write/SKILL.md` | 参考文档索引表 +1 行 `image-template-catalog.md` |
| `.agents/skills/wechat-article-write/scripts/generate-image-prompts.mjs` | +`resolveTemplateFile()` 函数；+`image-plan.json` 读取（带 fallback）；封面/信息图/插图三类 prompt 从硬编码改为动态读取 |
| `.agents/skills/wechat-article-write/references/strategies/reader-response.md` | Step 2 增加第 6 步"视觉规划"（image-plan.json 格式、产出要求、约束） |
| `.agents/skills/wechat-article-write/references/strategies/tutorial.md` | Step 1 增加第 10 步"视觉规划"（教程类推荐默认值） |

### 验证命令

```bash
# 语法检查
node --check .agents/skills/wechat-article-write/scripts/generate-image-prompts.mjs

# Fallback 路径测试（无 image-plan.json 时使用默认值）
bun run .agents/skills/wechat-article-write/scripts/generate-image-prompts.mjs <date-slug> --overwrite

# 动态路径测试（创建 image-plan.json 后验证 prompt 使用指定模板）
# 创建 posts/<date-slug>/image-plan.json → 运行脚本 → 检查输出 prompt 中的 layout/style/type 值
```

### 后续工作

1. **Phase 3 端到端验证**：完整走一遍 wechat-article-write 管线（Step 0-6），确认 Agent 能正确参考 catalog 产出 image-plan.json，且脚本消费该文件生成高质量 prompt
2. **模板质量评估**：对比使用 catalog 推荐 vs 硬编码默认的生成图片质量，确认模板选择合理
3. **Phase 4（可选）**：引入 gpt-image-2 的 academic-figures 和 technical-diagrams 模板到 catalog
