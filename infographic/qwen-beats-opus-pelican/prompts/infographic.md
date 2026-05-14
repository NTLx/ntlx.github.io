---
type: infographic
layout: bento-grid
style: aged-academia
aspect_ratio: "16:9"
language: zh
---

Create a professional infographic following these specifications:

## Image Specifications

- **Type**: Infographic
- **Layout**: bento-grid
- **Style**: aged-academia
- **Aspect Ratio**: 16:9
- **Language**: zh

## Core Principles

- Follow the layout structure precisely for information architecture
- Apply style aesthetics consistently throughout
- Keep information concise, highlight keywords and core concepts
- Use ample whitespace for visual clarity
- Maintain clear visual hierarchy

## Text Requirements

- All text must match the specified style treatment
- Main titles should be prominent and readable
- Key concepts should be visually emphasized
- Labels should be clear and appropriately sized
- Use Chinese (zh) for all text content

## Layout Guidelines

Modular grid layout with varied cell sizes, like a bento box.

- Grid of rectangular cells with mixed cell sizes (1x1, 2x1, 1x2, 2x2)
- No strict symmetry required
- Hero cell for main point, supporting cells around it
- Clear cell boundaries with varied cell backgrounds
- Icons or illustrations per cell
- Consistent padding/margins
- Visual hierarchy through size
- Main title at top
- Cell titles within each cell
- Brief content per cell, minimal text, maximum visual

## Style Guidelines

Historical scientific illustration with aged paper aesthetic.

- Color Palette: Sepia brown (#704214), aged ink, muted earth tones; Background: Parchment (#F4E4BC), yellowed paper texture; Accents: Faded red annotations, iron gall ink spots
- Aged paper texture overlay
- Detailed cross-hatching and line work
- Scientific illustration precision
- Study notes and annotations in margins
- Specimen plate or sketch aesthetic
- Numbered diagram elements
- Handwritten cursive or serif fonts
- Scientific annotations style
- Small caps for labels
- Italics for emphasis

---

Generate the infographic based on the content below:

# 笔记本上的21GB模型，画鹈鹕赢了最贵的闭源旗舰

## 4 个 Bento Grid 模块

### 模块 1（Hero，2x2 大格）：鹈鹕测试结果

核心：21GB 本地量化模型在 SVG 生成任务上击败了定价 $75/M tokens 的闭源旗舰

内容要点：
- Qwen3.6-35B-A3B 量化后 21GB，跑在 MacBook Pro M5 上
- 鹈鹕 SVG 对比：Qwen 自行车框架正确、有云、喉囊鼓鼓；Opus 框架歪了、没有云
- 火烈鸟测试也赢了：Qwen 有墨镜、领结、注释 "<!-- Sunglasses on flamingo! -->"
- "I have enormous respect for Qwen, but I very much doubt that a 21GB quantized version of their latest model is more powerful or useful than Anthropic's latest proprietary release." — Simon Willison

视觉：两只鹈鹕 SVG 的对比图，标注关键差异

### 模块 2（1x2 竖格）：三条线同时成熟

核心：MoE 架构 + 量化技术 + 开源迭代速度在 2026 年 4 月同时汇到一点

内容要点：
- MoE 架构：总参数 350 亿，每次推理只激活 30 亿——成本结构的根本改变
- 量化技术：UD-Q4_K_S 格式压到 21GB，MacBook Pro M5 跑得起来
- 开源迭代：Qwen 2.5→3.6 半年，Hugging Face 下载 7 亿次，超越 Llama，已开源近 400 个模型

视觉：三条线汇合到一个交点的示意图

### 模块 3（1x1 方格）："够用"的天花板

核心：很多任务的"好"有一个上限，到了上限再加能力用户感知不到差别

内容要点：
- 画鹈鹕：腿没断、框架对、看着像鹈鹕——30 亿激活参数能做到
- 拧螺丝比喻：电钻比螺丝刀快 10 倍，但螺丝只需拧 5 圈
- "够用"的标准正在被本地模型击穿

视觉：水平虚线标注"够用"标准，两个模型图标都在线上方

### 模块 4（1x1 方格）：选择逻辑变了

核心：从"哪个最强用哪个"变为"这个任务需要多强"

内容要点：
- 以前：能力差距是代际的，闭源是默认项
- 现在：差距是边际的，旗舰从"默认选项"变成"特殊需求"
- "如果你需要的恰好是一只骑自行车的鹈鹕，那现在在笔记本上跑 Qwen 3.6 就是比 Opus 4.7 更好的选择" — Simon Willison

视觉：旧逻辑→新逻辑的箭头转变图

---

Text labels (in zh):

主标题: "笔记本上的21GB模型，画鹈鹕赢了最贵的闭源旗舰"
副标题: "当"够用"的天花板就是"对"，本地模型已经够得着了"

模块1标题: "鹈鹕骑车基准测试"
模块1标签: "Qwen3.6 本地模型", "Opus 4.7 旗舰", "21GB", "$75/M tokens", "自行车框架正确", "框架歪了"

模块2标题: "三条线同时汇到一点"
模块2标签: "MoE 架构", "350亿参数/30亿激活", "量化技术", "21GB 本地运行", "开源迭代速度", "半年一代 / 7亿次下载"

模块3标题: ""够用"的天花板"
模块3标签: "本地模型", "旗舰模型", "够用标准线", "感知差异趋近于零"

模块4标题: "选择逻辑变了"
模块4标签: "旧：最强", "新：匹配任务", "默认选项→特殊需求", "代际差距→边际差距"

底部署名: "数据来源：Simon Willison's Weblog, 2026-04-16"
