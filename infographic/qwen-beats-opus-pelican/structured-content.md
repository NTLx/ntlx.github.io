# 笔记本上的21GB模型，画鹈鹕赢了最贵的闭源旗舰

## Overview

Qwen3.6 本地量化模型在 Simon Willison 的鹈鹕骑车 SVG 基准测试中击败 Claude Opus 4.7，揭示三条技术线同时成熟后"够用"标准被击穿的趋势。

## Learning Objectives

The viewer will understand:
1. 鹈鹕骑车基准测试：本地小模型在特定任务上击败最贵闭源旗舰
2. MoE 架构 + 量化技术 + 开源迭代速度三条线同时成熟
3. 选择模型的逻辑从"最强"变为"匹配任务"

---

## Section 1: 鹈鹕测试结果

**Key Concept**: 21GB 本地量化模型在 SVG 生成任务上击败了定价 $75/M tokens 的闭源旗舰

**Content**:
- Qwen3.6-35B-A3B 量化后 21GB，跑在 MacBook Pro M5 上
- 鹈鹕 SVG：自行车框架对、有云、喉囊鼓鼓、写了字
- Opus 4.7 鹈鹕：框架歪、没有云、喉囊不明显
- 开 thinking_level: max 再试——还是不行
- 火烈鸟骑独轮车测试：Qwen 赢，有墨镜、领结、烟，注释 `<!-- Sunglasses on flamingo! -->`

**Visual Element**:
- Type: 对比图
- Subject: 两只鹈鹕 SVG 的差异
- Treatment: 左右对比，标注关键差异点

**Text Labels**:
- Headline: "鹈鹕骑车基准测试"
- Subhead: "Qwen3.6 本地模型 vs Opus 4.7 旗舰"
- Labels: "21GB 本地运行", "$75/M tokens", "自行车框架正确", "框架歪了"

---

## Section 2: 三条线同时成熟

**Key Concept**: MoE 架构、量化技术、开源迭代速度三条线在 2026 年 4 月同时汇到一点

**Content**:
- MoE 架构成熟了：Qwen3.6-35B-A3B，总参数 350 亿，每次推理只激活 30 亿。成本结构的根本改变
- 量化技术成熟了：Unsloth 的 UD-Q4_K_S 格式把模型压到 21GB。MacBook Pro M5、RTX 4090 跑得起来
- 开源社区迭代速度成熟了：Qwen 从 2.5 到 3.6 半年，闭源更新周期是季度。Hugging Face 累计下载 7 亿次，超越 Llama，已开源近 400 个模型

**Visual Element**:
- Type: 三条线汇合图
- Subject: 三条独立的技术线汇到一个交点
- Treatment: 每条线用不同标记，汇合点高亮

**Text Labels**:
- Headline: "三条线同时汇到一点"
- Labels: "MoE 架构", "350亿参数/30亿激活", "量化技术", "21GB 本地运行", "开源迭代速度", "半年一代/7亿次下载"

---

## Section 3: "够用"的天花板

**Key Concept**: 很多任务的"好"有一个上限，到了那个上限再加能力用户感知不到差别

**Content**:
- 画鹈鹕的标准：腿没断、框架对、看着像鹈鹕。30 亿激活参数能做到
- 写 CRUD 接口：能跑、没 bug、逻辑对。很多模型都能达到
- 像拧螺丝：电钻比螺丝刀快 10 倍，但螺丝只需拧 5 圈
- "够用"的标准正在被本地模型击穿

**Visual Element**:
- Type: 天花板示意
- Subject: 一条水平线标注"够用"标准，本地模型和旗舰模型都在线上方
- Treatment: 用虚线表示天花板，两个模型图标都在上方

**Text Labels**:
- Headline: ""够用"的天花板"
- Labels: "本地模型", "旗舰模型", "够用标准线", "感知差异趋近于零"

---

## Section 4: 选择逻辑变了

**Key Concept**: 从"哪个最强用哪个"变为"这个任务需要多强"

**Content**:
- 以前：强的模型能做到的事，弱的模型做不到。能力差距是代际的
- 现在：对于大多数任务，能力差距不是代际的，是边际的
- 旗舰模型的使用场景在收窄——从"默认选项"变成"特殊需求"
- "如果你需要的恰好是一只骑自行车的鹈鹕，那现在在笔记本上跑 Qwen 3.6 就是比 Opus 4.7 更好的选择" — Simon Willison

**Visual Element**:
- Type: 思维转变图
- Subject: 两个思维模型的对比
- Treatment: 箭头从旧逻辑指向新逻辑

**Text Labels**:
- Headline: "选择逻辑变了"
- Labels: "旧逻辑：最强", "新逻辑：匹配任务", "默认选项 → 特殊需求", "代际差距 → 边际差距"

---

## Data Points (Verbatim)

### Statistics
- "Qwen3.6-35B-A3B，总参数 350 亿，但每次推理只激活 30 亿"
- "Unsloth 的 UD-Q4_K_S 格式把模型压到 21GB"
- "Claude Opus 4.7，每百万输出 token 75 美元"
- "阿里的 Qwen 系列在 Hugging Face 上累计下载 7 亿次，超越 Meta 的 Llama"
- "已开源近 400 个模型"
- "Qwen 从 2.5 到 3.6，半年"
- "一台 MacBook Pro M5，一张 RTX 4090，跑得起来"
- "合计 1,363 分、516 条评论"

### Quotes
- "I have enormous respect for Qwen, but I very much doubt that a 21GB quantized version of their latest model is more powerful or useful than Anthropic's latest proprietary release." — Simon Willison
- "如果你需要的恰好是一只骑自行车的鹈鹕，那现在在笔记本上跑 Qwen 3.6 就是比 Opus 4.7 更好的选择" — Simon Willison

### Key Terms
- **MoE (Mixture of Experts)**: 混合专家架构，模型总参数量大但每次推理只激活一小部分参数
- **UD-Q4_K_S**: Unsloth 提供的量化格式，将模型压缩到消费级设备可运行的大小
- **鹈鹕骑车基准**: Simon Willison 从 2024 年 10 月开始的 SVG 生成测试，测试 34+ 个模型

---

## Design Instructions

### Style Preferences
- 复古学术风格：羊皮纸质感、棕色调、手写笔记感
- 色彩：棕褐色主色 (#704214)、羊皮纸背景 (#F4E4BC)、褪色红标注
- 线条：精细交叉阴影线、科学插图精度

### Layout Preferences
- bento-grid 模块化网格
- 4 个主要模块对应 4 个核心观点
- 主模块（鹈鹕测试结果）占 2x1 或 2x2
- 辅助模块 1x1

### Other Requirements
- 语言：中文
- 宽高比：16:9
- 输出路径：/Users/lx/Projects/ntlx.github.io/posts/2026-04-16-qwen-beats-opus-pelican/imgs/00-infographic-core-summary.png
