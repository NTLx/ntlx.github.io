Create a professional infographic following these specifications:

## Image Specifications

- **Type**: Infographic
- **Layout**: bento-grid
- **Style**: aged-academia
- **Aspect Ratio**: 16:9
- **Language**: zh (Chinese)

## Core Principles

- Follow the layout structure precisely for information architecture
- Apply style aesthetics consistently throughout
- Keep information concise, highlight keywords and core concepts
- Use ample whitespace for visual clarity
- Maintain clear visual hierarchy
- Preserve all data faithfully — no summarization or rephrasing

## Text Requirements

- All text must be in Chinese (zh)
- Main titles should be prominent and readable
- Key concepts should be visually emphasized
- Labels should be clear and appropriately sized
- Use handwritten cursive or serif fonts per aged-academia style
- Scientific annotations style, small caps for labels

## Layout Guidelines (bento-grid)

Modular grid layout with varied cell sizes, like a bento box:
- Grid of rectangular cells with mixed sizes (1x1, 2x1, 1x2, 2x2)
- No strict symmetry required
- Hero cell for main point (top-left or center, largest cell)
- Supporting cells around it
- Clear cell boundaries with varied cell backgrounds
- Icons or illustrations per cell
- Consistent padding/margins
- Visual hierarchy through size
- Main title at top
- Cell titles within each cell
- Brief content per cell
- Minimal text, maximum visual

## Style Guidelines (aged-academia)

Historical scientific illustration with aged paper aesthetic:
- **Primary Colors**: Sepia brown (#704214), aged ink, muted earth tones
- **Background**: Parchment (#F4E4BC), yellowed paper texture
- **Accents**: Faded red annotations, iron gall ink spots
- **Visual Elements**:
  - Aged paper texture overlay
  - Detailed cross-hatching and line work
  - Scientific illustration precision
  - Study notes and annotations
  - Specimen plate or sketch aesthetic
  - Numbered diagram elements
- **Typography**:
  - Handwritten cursive or serif fonts
  - Scientific annotations
  - Small caps for labels
  - Italics for scientific names

---

Generate the infographic based on the content below:

# AI Agent 时代的开源贡献问题：Hugging Face 用一份 Skill 教 AI 学会「不写」

5 个核心论点，bento-grid 布局，aged-academia 风格。

## Hero Cell (Section 1): 10 亿程序员的代价

核心矛盾：AI 让人人都能写代码，但维护者的审查带宽没有跟着涨。

关键数据：
- "3000万程序员变成10亿程序员" — Jensen Huang
- cURL 漏赏计划：运行 6 年、支付 8.6 万美元，因 AI slop 终止
- 16 小时内收到 7 份 AI 生成的漏洞报告，全部是垃圾
- 92% 开发者已在使用 AI 编程工具
- 45% AI 生成代码未通过安全测试

视觉：大数字 3000万→10亿 突出显示，PR 洪流隐喻，sepia 色调警示

## Cell 2: 不是代码的问题，是理解的问题

Agent 缺的不是写代码能力，是理解代码库隐式约定的能力。

- transformers 的代码是人与人之间的沟通方式
- 设计哲学：扁平层级、清晰可读、不过度抽象
- transformers 已成为模型定义的"事实来源"

视觉：人理解代码库 vs Agent 只看表面的对比图

## Cell 3: Skill 的「不」字诀

15000 字的 Skill，大部分是约束——教 Agent 学会说不。

5 个「不」：
- 不改共享工具
- 不加多余注释
- 不提重构
- 不过早抽象
- 不接受任何想法

视觉：5 个禁止符号配以大字 "15000 字"，sepia 禁止图标

## Cell 4: 审查者也是用户

开源的瓶颈不是代码生成，是注意力。

- PR 必须披露是 agent 辅助的
- "Agent 能一小时写十个 PR，但维护者要的是那一个值得读的"

视觉：注意力漏斗，10 个 PR → 1 个值得读

## Cell 5: 独立测试：不信任自我评估

设计独立验证机制，不信任 Agent 的自我评估。

- 独立测试工具，可复现，所有结果保存为 JSON
- Claude Code 贡献了 49 个 CVE（11 个严重级别）
- "不是不信任你，是不信任任何自我评估"

视觉：Agent 自评 → 独立验证 → 人工确认的三步流程

Text labels (in zh):
- 主标题: "AI Agent 时代的开源贡献问题"
- 副标题: "Hugging Face 用一份 Skill 教 AI 学会「不写」"
- Hero 大字: "3000万 → 10亿"
- Hero 副文: "PR 量暴增十倍，审查带宽没涨"
- Cell 2 标题: "不是代码的问题，是理解的问题"
- Cell 2 副文: "transformers = 事实来源"
- Cell 3 标题: "Skill 的「不」字诀"
- Cell 3 大字: "15000 字"
- Cell 3 副文: "大部分是约束"
- Cell 4 标题: "审查者也是用户"
- Cell 4 流程: "10 PR/小时 → 1 个值得读"
- Cell 4 副文: "瓶颈不是代码生成，是注意力"
- Cell 5 标题: "独立测试：不信任自我评估"
- Cell 5 流程: "Agent 自评 → 独立验证 → 人工确认"
- Cell 5 数据: "49 CVE，11 严重级别"
