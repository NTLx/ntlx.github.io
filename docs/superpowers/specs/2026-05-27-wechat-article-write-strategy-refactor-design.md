# wechat-article-write 策略分离重构设计

> 状态：待评审 | 日期：2026-05-27 | 作者：NTLx

## 1. 问题陈述

### 1.1 当前架构

`wechat-article-write` 是一个 6 步流水线技能，将"微信公众号文章写作与双轨发布"自动化：

```
Step 1: 资料收集 → Step 2: ljg-writes 写作 → Step 3: humanizer-zh 后处理
→ Step 4: 图片生成 → Step 5: 产物构建 → Step 6: 双轨发布（博客 + 微信）
```

SKILL.md 共 456 行，Steps 1-3 硬编码为"读后感"写作流程。

### 1.2 实际使用暴露的问题

三次生产环境写作暴露了三类根因问题：

**A. 文章类型假设（Steps 1-3 硬编码）**

| 写作任务 | 文章类型 | Steps 1-3 适用性 | 实际处理 |
|----------|---------|-----------------|---------|
| "把 Claude 关进笼子" | 读后感 | 完全适用 | 正常 |
| "当 AI 越过恐怖谷" | 读后感 | 完全适用 | 正常 |
| "Claude Code 自定义配置" | 教程 | **不适用**（内容已存在于博客） | Agent 手动跳过 |

Agent 需要在没有清晰指引的情况下自行判断跳过哪些步骤，增加了出错概率和决策负担。

**B. 博客路径假设（publish-blog.mjs）**

`publish-blog.mjs` 硬编码目标路径为 `src/content/docs/articles/{blogSlug}.md`。教程类文章位于 `ai-tools/`、`guides/` 等非 `articles/` 路径，脚本无法处理。

**C. Step 4 prompt 构建脆弱性**

图片 prompt 构建依赖 Agent 自觉遵循 baoyu 技能模板。实际执行中 Agent 两次绕过模板手写 prompt（已通过 SKILL.md v1.1 加强约束缓解，但本质是文本约束对抗 Agent 的捷径倾向）。

### 1.3 设计目标

1. 支持多种文章类型（读后感、教程、资讯简报等），每种有独立的 Steps 1-3 策略
2. Agent 通过明确的"策略菜单"选择流程，而非在 456 行指令中自行判断
3. 发布脚本支持任意目标路径，不限于 `articles/`
4. 保持 Steps 4-6 脚本化不变（确定性步骤）
5. 100% 向后兼容现有读后感工作流

---

## 2. 架构概览

### 2.1 核心思想：Pipeline + Strategy 模式

```
                    ┌─────────────────────┐
                    │   Step 0 (新增)      │
                    │   文章类型判定        │
                    │   → 选择策略文件      │
                    └────────┬────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ reader-  │  │ tutorial │  │  news-   │
        │ response │  │   .md    │  │ digest   │
        │   .md    │  │          │  │   .md    │
        └────┬─────┘  └────┬─────┘  └────┬─────┘
             │              │              │
             └──────────────┼──────────────┘
                            │
              ┌─────────────┴─────────────┐
              │   Steps 4-6 (不变)        │
              │   图片 → 构建 → 发布       │
              │   全部由脚本执行           │
              └───────────────────────────┘
```

- **Step 0**（Agent 执行）：根据用户意图和材料性质，从策略目录中选择一个策略文件，读取并执行其中定义的 Steps 1-3
- **策略文件**（references/strategies/）：每种文章类型一个文件，定义该类型的 Steps 1-3 行为
- **Steps 4-6**（脚本执行）：保持不变，接收 draft.md + imgs/ 产出标准产物

### 2.2 文件结构

```
.agents/skills/wechat-article-write/
├── SKILL.md                              # 编排入口（~200 行）
├── references/
│   ├── strategies/
│   │   ├── reader-response.md            # 读后感策略
│   │   ├── tutorial.md                   # 教程/配置指南策略
│   │   └── news-digest.md                # 资讯简报策略（示例）
│   ├── category-keywords.json            # 已有，不变
│   └── image-backends.md                 # 已有，不变
├── scripts/
│   ├── step1-collect.mjs                 # 已有，不变
│   ├── step2-write.mjs                   # 已有，不变
│   ├── step3-polish.mjs                  # 已有，不变
│   ├── step4-generate.mjs                # 已有，不变
│   ├── step4-images.mjs                  # 已有，不变
│   ├── step5-build.mjs                   # 已有，不变
│   ├── publish-blog.mjs                  # 修改：支持自定义 targetPath
│   ├── publish-wechat.mjs                # 已有，不变
│   ├── state.mjs                         # 已有，不变
│   ├── state-lib.mjs                     # 已有，不变
│   ├── config-lib.mjs                    # 已有，不变
│   ├── path-resolver.mjs                 # 已有，不变
│   ├── suggest-category.mjs              # 已有，不变
│   ├── set-frontmatter.mjs               # 已有，不变
│   ├── normalize-image-formats.mjs       # 已有，不变
│   ├── apply-image-map.mjs               # 已有，不变
│   └── pipeline.mjs                      # 已有，不变
```

---

## 3. 组件规格

### 3.1 Step 0：文章类型判定与策略选择

**执行者**：Agent（在进入任何 Step 前执行）

**流程**：

1. Agent 分析当前写作任务的用户意图和材料性质
2. 从 `references/strategies/` 目录读取可用策略列表（文件名即策略名）
3. 按以下决策树选择策略：

```
用户提供了原始材料（URL/文件）且期望"读后感"？
  → reader-response

用户提供了已完成的文章内容（博客草稿/已有文档）且期望"转公众号/配图发布"？
  → tutorial

用户要求"AI 资讯简报"或"新闻汇总"？
  → news-digest

无法确定？
  → 默认 reader-response，并向用户确认
```

4. 读取选定的策略文件，按其中的 Steps 1-3 定义执行
5. 策略文件中的每个 Step 声明为以下三种行为之一：
   - `full`：执行完整流程（如 reader-response 的 Step 1 需要联网收集资料）
   - `skip`：跳过此步骤
   - `custom`：执行策略中定义的自定义行为

**关键约束**：
- 策略文件只影响 Steps 1-3（内容创作），Steps 4-6（工程管线）不受影响
- Agent 必须在进入 Step 1 之前完成策略选择
- 如果不确定策略选择，**必须**向用户确认，不得自行假设

### 3.2 策略文件格式

每个策略文件包含：

```markdown
---
name: <策略名>
description: <一句话描述，用于 Agent 匹配>
applies_when: <触发条件，人类可读>
---

# <策略名> 策略

## Step 1: <步骤名>
行为: full | skip | custom

<如果是 full 或 custom，此处是具体的 Agent 动作指令>
<如果是 skip，此处说明跳过原因>

## Step 2: <步骤名>
行为: full | skip | custom

...

## Step 3: <步骤名>
行为: full | skip | custom

...

## 特殊约束
<该策略特有的约束条件，如字数范围、技能选择、格式要求等>
```

### 3.3 策略文件规格

#### 3.3.1 reader-response.md（读后感策略）

```markdown
---
name: reader-response
description: 深度读后感，以原文为起点展开个人判断和延展思考
applies_when: 用户提供了一篇或多篇原始材料（URL/文件），要求写读后感、深度分析或观点文章
---

# reader-response 策略

## Step 1: 资料收集
行为: full

- 检测输入类型（URL / 文件路径 / 粘贴文本）
- 抓取原文内容，联网搜索背景资料
- 写入 `posts/{date-slug}/materials.md`，必须包含 `## 背景调研` 章节
- 运行 `step1-collect.mjs` 验证

## Step 2: 文章创作
行为: full

- 通过 Skill 工具调用 ljg-writes，传入 materials.md
- 字数下限 2000，目标 2500-3500
- 输出 draft.md（含 frontmatter、SLOT_IMG 占位符、summary）
- 运行 `suggest-category.mjs` 获取分类和 blogSlug
- 运行 `step2-write.mjs` 验证

## Step 3: 文本后处理
行为: full

- 通过 Skill 工具调用 humanizer-zh 处理正文
- 通过 Skill 工具调用 baoyu-format-markdown 格式化
- 运行 `step3-polish.mjs` 验证

## 特殊约束
- 必须采用读后感式原创表达，禁止写成翻译或摘要
- 必须包含文末互动问题和原文参考区块
- frontmatter summary 必须是金句式（≤120 字），publish-wechat.mjs 缺 summary 直接 fail
```

#### 3.3.2 tutorial.md（教程策略）

```markdown
---
name: tutorial
description: 教程/配置指南/知识库文章转微信公众号，内容已存在，只需配图和发布
applies_when: 用户已有完成的博文或文档内容，要求转为微信公众号文章或为已有内容配图发布
---

# tutorial 策略

## Step 1: 内容适配
行为: custom

本策略的 Steps 1-3 合并为一步"内容适配"：

1. 读取已有的博文/文档源文件
2. 适配为微信格式：
   - 写入 pipeline frontmatter（title, date, summary, category, blogSlug, coverImage, sourceUrl）
   - 移除 Starlight 专用语法（`:::tip`、`:::caution`、`:::note` 等），转换为 `> ` blockquote 或纯文本
   - 移除 `$schema: starlight` 等 Starlight 专用 frontmatter 字段
   - 正文中的 `![alt](url)` 图片引用转换为 SLOT_IMG 占位符（如果图片需要重新生成）
   - 正文中不得有 H1（Starlight 自动渲染 title 为 H1）
3. 插入 SLOT_IMG 占位符：
   - `<!-- SLOT_IMG_00_INFOGRAPHIC -->` 在 frontmatter 之后、正文第一个段落之前
   - 在其他合适的章节边界插入 `<!-- SLOT_IMG_0X_XXX -->`
4. 确定 sourceUrl：指向已有博文的公网地址（如 `https://ntlx.github.io/ai-tools/claude-code-config/`）
5. 生成金句式 summary（≤120 字）
6. 运行 `suggest-category.mjs` 获取分类
7. 手动设置 blogSlug 和 sourceUrl（不遵循 `articles/{blogSlug}` 规则——sourceUrl 直接指向博文实际地址）
8. 保存为 `posts/{date-slug}/draft.md`
9. 运行 `step2-write.mjs --no-humanizer --allow-no-references <date-slug>` 验证基础门控
   - `--no-humanizer`：跳过 humanizer-zh 相关检查（教程不需要去 AI 痕迹）
   - `--allow-no-references`：教程不要求"原文参考"区块

## Step 2: 跳过
行为: skip
内容已在 Step 1 中完成，无需独立写作步骤。

## Step 3: 门控验证（精简）
行为: custom

教程策略的 Step 3 不执行 humanizer-zh 和 baoyu-format-markdown，但**仍然运行 step3-polish.mjs 进行门控验证**：

1. 跳过 humanizer-zh 处理（保留技术文档风格）
2. 跳过 baoyu-format-markdown（内容在 Step 1 已完成适配）
3. 运行 `step3-polish.mjs <date-slug>`，该脚本会检测状态文件中的 `humanizer: skip` 标记，跳过 humanizer 专项检查但执行基础门控（frontmatter/SLOT_IMG/无 H1）

## 特殊约束
- sourceUrl 不遵循 `articles/{blogSlug}` 模式，直接使用博文实际 URL
- blogSlug 仅用于管线内部标识（文件名前缀、图片命名），不与博客 URL 绑定
- 不需要文末互动问题（教程不是读后感）
- 不需要原文参考区块
- 不需要 humanizer-zh 处理（保留技术文档风格）
```

#### 3.3.3 news-digest.md（资讯简报策略，示例）

```markdown
---
name: news-digest
description: AI 行业资讯简报，汇总当日/当周热点
applies_when: 用户要求汇总 AI 资讯、行业动态、新闻简报
---

# news-digest 策略

## Step 1: 资料收集
行为: full

- 联网搜索当日/当周 AI 行业热点
- 抓取相关文章和新闻
- 写入 `posts/{date-slug}/materials.md`

## Step 2: 文章创作
行为: full

- 通过 Skill 工具调用 ljg-writes，但指定"简报模式"：每条资讯 100-200 字概要
- 不需要深度分析和个人判断，重在信息密度和覆盖面
- 字数下限 1500，目标 2000-3000

## Step 3: 文本后处理
行为: full

- 通过 Skill 工具调用 humanizer-zh 处理正文
- 通过 Skill 工具调用 baoyu-format-markdown 格式化

## 特殊约束
- 每条资讯标注来源 URL
- 文末不需要互动问题，替换为"信息来源汇总"
- summary 侧重"今日要点速览"
```

### 3.4 SKILL.md 改写

**设计原则**：
- SKILL.md 降为编排入口，控制在 200 行以内
- 核心原则和工程管线说明保留
- Steps 1-3 的详细指令移到策略文件中
- Step 0 作为新增入口

**改写后的 SKILL.md 结构**：

```markdown
---
name: wechat-article-write
description: (保持不变)
---

# 微信公众号文章写作与双轨发布

## 核心原则
(保留现有的核心原则，精简至 ~15 条)

## 流水线概览

| Step | 动作 | 执行者 | 说明 |
|------|------|-------|------|
| 0 | 文章类型判定 | Agent | 新增：选择策略文件 |
| 1-3 | 内容创作 | Agent | 按策略文件执行 |
| 4 | 图片生成 | Agent + 脚本 | 不变 |
| 5 | 产物构建 | 脚本 | 不变 |
| 6 | 双轨发布 | 脚本 | 不变 |

## Step 0: 文章类型判定与策略选择

(参见 §3.1 的完整流程)

## Step 4-6: 工程管线

(保留现有的 Steps 4-6 内容，精简冗余，引用策略文件中的特殊约束)

## 失败处理
(保持不变)

## 已知约束
(保持不变)
```

### 3.5 publish-blog.mjs 改动

**当前行为**：
- 硬编码目标路径：`src/content/docs/articles/{blogSlug}.md`
- 无法处理 `ai-tools/`、`guides/` 等路径

**目标行为**：
- 支持自定义目标路径，优先级：CLI `--target-path` > frontmatter `targetPath` > 默认 `articles/{blogSlug}`

**改动要点**：

1. **新增 CLI 参数** `--target-path <path>`：
   - 接受相对于 `src/content/docs/` 的路径（不含 `.md` 扩展名）
   - 例如：`--target-path ai-tools/claude-code-config`
   - 如果不传，回退到 frontmatter 和默认值

2. **新增 frontmatter 字段** `targetPath`：
   - draft.md frontmatter 中可选字段
   - tutorial 策略会写入此字段（如 `targetPath: ai-tools/claude-code-config`）
   - reader-response 策略不写入（使用默认 articles/{blogSlug}）

3. **路径解析逻辑**：
   ```
   targetPath = CLI --target-path || frontmatter.targetPath || `articles/${blogSlug}`
   fullPath = `src/content/docs/${targetPath}.md`
   ```

4. **防覆盖检查**：
   - 如果目标文件已存在且未传 `--overwrite`，拒绝写入
   - `--overwrite` 允许覆盖已有文件（教程策略需要此能力——博文已存在，只是加图更新）

5. **备份机制**：
   - 覆盖已有文件前，自动备份到 `src/content/docs/${targetPath}.backup-${YYYYMMDDHHmmss}.md`
   - 备份文件名示例：`claude-code-config.backup-20260527T083000.md`
   - 备份文件不进 Git（添加到 `.gitignore` 模式 `*.backup-*.md`），仅作为紧急恢复手段

**向后兼容性**：
- 不传 `--target-path` 且 draft.md 无 `targetPath` 时，行为与当前版本完全一致
- 现有的 `--blog-slug` 参数继续工作，作为 blogSlug 的覆盖值

### 3.6 step2-write.mjs 改动

**新增 CLI 参数**：

| 参数 | 说明 | 默认值 |
|------|------|-------|
| `--no-humanizer` | 跳过 humanizer-zh 相关检查（教程策略使用）。注意：此标记会被 step3-polish.mjs 读取——当 draft.md 的前端状态文件（`.state.json`）中记录了 `humanizer: skip` 时，step3 跳过 humanizer 检查但保留基础门控（frontmatter/SLOT_IMG/字数） | — |
| `--allow-no-references` | 允许正文不含 `## 原文参考` 区块 | — |
| `--min-words <N>` | 覆盖默认字数下限 | `2000` |

**`--no-humanizer` 的跨步骤行为**：
- step2-write.mjs 接收此参数后，在状态文件中写入 `humanizer: skip`
- step3-polish.mjs 读取状态文件，发现 `humanizer: skip` 时跳过 humanizer 相关检查（字数下降容限从 1800 放宽到原 `--min-words` 值的 90%），但保留：
  - frontmatter 完整性检查
  - SLOT_IMG 占位符存在性检查
  - blogSlug/sourceUrl 一致性检查
  - 无 H1 检查

### 3.7 set-frontmatter.mjs 改动

无需改动。`targetPath` 字段可以通过现有的 `set` 子命令写入。

---

## 4. 实施计划

### Phase 1: 策略文件创建（无破坏性变更）

1. 创建 `references/strategies/` 目录
2. 编写 `reader-response.md`（从现有 SKILL.md 中提取 Steps 1-3 内容）
3. 编写 `tutorial.md`
4. 编写 `news-digest.md`（示例）
5. 验证：在现有读后感工作流中手动读取 reader-response.md 代替 SKILL.md 的 Steps 1-3 部分

### Phase 2: SKILL.md 改写

1. 重构 SKILL.md 为编排入口格式
2. 将 Steps 1-3 详细指令替换为"读取策略文件"指令
3. 新增 Step 0 章节
4. 验证：执行一次标准读后感工作流，确保行为不变

### Phase 3: publish-blog.mjs 改动

1. 添加 `--target-path` 参数
2. 添加 frontmatter `targetPath` 支持
3. 添加覆盖文件前的备份机制
4. 添加 `--overwrite` 参数
5. 验证：分别用 reader-response（默认路径）和 tutorial（自定义路径）发布

### Phase 4: step2-write.mjs 改动

1. 添加 `--no-humanizer` 参数
2. 添加 `--allow-no-references` 参数
3. 添加 `--min-words` 参数
4. 验证：教程策略下运行，确认门控检查适配新参数

### Phase 5: 文档与清理

1. 更新 SKILL.md 中的工具索引
2. 删除 SKILL.md 中已迁移到策略文件的冗余内容
3. 更新 `references/image-backends.md`（如有必要）
4. 端到端测试三种策略

---

## 5. 测试策略

### 5.1 回归测试（reader-response 策略）

使用已完成的两篇读后感文章重新执行管线：
- "把 Claude 关进笼子"：Step 1 → 6 全流程，验证输出一致
- "当 AI 越过恐怖谷"：同上

### 5.2 新功能测试（tutorial 策略）

使用已完成的教程文章重新执行管线：
- "Claude Code 自定义配置"：从现有博文 → tutorial 策略 → 微信草稿
- 验证 `targetPath: ai-tools/claude-code-config` 正确解析
- 验证 `--overwrite` 和备份机制

### 5.3 边界测试

| 场景 | 预期行为 |
|------|---------|
| 新策略文件格式错误（缺少 `行为:` 字段） | Agent 报告错误，回退到 reader-response |
| `targetPath` 指向不存在的目录 | publish-blog.mjs 自动创建目录或报清晰错误 |
| draft.md 同时有 `targetPath` 和 CLI `--target-path` | CLI 优先 |
| tutorial 策略下运行 step3-polish.mjs | 因 `--no-humanizer` 跳过 humanizer 检查，但保留基础门控（frontmatter/SLOT_IMG/字数） |

---

## 6. 开放问题

1. **`--overwrite` 的安全性**：教程策略下每次更新博文都会覆盖已有文件。当前设计依赖 Git 做版本控制（覆盖前 commit 已存在），但如果在非 Git 环境运行会丢历史。是否需要内置更完善的备份策略？

2. **策略发现机制**：当前设计是 Agent 读取 `references/strategies/` 目录列出可用策略。如果未来策略超过 5 个，是否需要"策略匹配提示"（Agent 根据用户输入推荐最可能的 2 个策略）？

3. **`news-digest` 策略的验证**：此策略尚未经过实战验证，仅作为示例。建议在首次使用后根据实际体验迭代。

4. **Step 4 prompt 构建的进一步自动化**：当前仍依赖 Agent 按 SKILL.md 中的详细指令读取模板、构建 prompt。是否值得编写一个 `step4-prepare.mjs` 脚本来自动生成符合模板的 prompt 骨架？（Agent 仍需填充内容，但格式和关键段落自动注入）

---

## 7. 变更文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `SKILL.md` | 重写 | ~456 → ~200 行，提取 Steps 1-3 到策略文件 |
| `references/strategies/reader-response.md` | 新建 | 读后感策略，内容来自 SKILL.md Steps 1-3 |
| `references/strategies/tutorial.md` | 新建 | 教程策略 |
| `references/strategies/news-digest.md` | 新建 | 资讯简报策略（示例） |
| `scripts/publish-blog.mjs` | 修改 | 新增 `--target-path`、`--overwrite` 参数；备份机制 |
| `scripts/step2-write.mjs` | 修改 | 新增 `--no-humanizer`、`--allow-no-references`、`--min-words` |
| `scripts/step3-polish.mjs` | 修改 | 支持 `--no-humanizer` 模式（跳过 humanizer 相关检查） |

---

## 附录 A：策略选择决策树（伪代码）

```
function select_strategy(user_intent, has_existing_content, has_source_materials):
    if user_intent == "读后感" or user_intent == "深度分析":
        return "reader-response"

    if has_existing_content and (user_intent == "转公众号" or user_intent == "配图发布"):
        return "tutorial"

    if user_intent == "资讯简报" or user_intent == "新闻汇总":
        return "news-digest"

    if has_source_materials and user_intent is ambiguous:
        return "reader-response"  // 安全默认值
        prompt_user_to_confirm()

    if no materials and no existing content:
        prompt_user("请提供原始材料或已有内容")
```

## 附录 B：向后兼容性保证

1. **默认策略**：不指定策略时使用 `reader-response`，行为与当前版本完全一致
2. **publish-blog.mjs**：不传 `--target-path` 时行为不变
3. **step2-write.mjs**：不传新参数时行为不变
4. **state.mjs**：状态文件和 CLI 接口不变
5. **现有 posts/ 目录**：不需要迁移
