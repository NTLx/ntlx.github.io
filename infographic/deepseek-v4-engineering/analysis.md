---
title: "不发明轮子的人：DeepSeek V4 的工程整合哲学"
topic: "科技评论 / AI 工程"
data_type: "overview / multi-topic summary"
complexity: "moderate"
point_count: 5
source_language: "zh"
user_language: "zh"
---

## Main Topic

DeepSeek V4 的核心竞争力不是原创发明，而是将行业已有技术（字节的 HC、Kimi 的 Muon、自家上一代稀疏注意力）进行工程整合与约束优化，以 270 人团队打造出 SWE Verified 80.6 的开源模型。

## Learning Objectives

After viewing this infographic, the viewer should understand:

1. DeepSeek V4 的"不发明轮子"整合策略——mHC、Muon、CSA+HCA 各自的来源与改造
2. V4 的关键性能数字——FLOPs 27%、KV Cache 10%、1M 上下文、SWE Verified 80.6
3. 梁文锋的背景与 DeepSeek 的组织特质——量化出身、270 人、自筹 200 亿
4. 国产芯片适配的战略意义——华为昇腾 950PR、自评落后 3-6 个月
5. "组牌局"哲学——你造轮子我装车

## Target Audience

- **Knowledge Level**: 中级——对 AI 大模型有基本了解，知道 DeepSeek、OpenAI 等公司
- **Context**: 阅读科技评论文章，了解 DeepSeek V4 的技术与商业策略
- **Expectations**: 快速抓住文章核心论点与关键数字

## Content Type Analysis

- **Data Structure**: 多主题并列（技术、数字、人物、战略、哲学），适合 bento-grid
- **Key Relationships**: "借来的技术" → "拼出的结果" → "背后的人" → "战略选择"
- **Visual Opportunities**: 数字放大展示、技术来源箭头图示、人物画像、芯片对比

## Key Data Points (Verbatim)

### Statistics
- "单 token 推理 FLOPs 只有 V3.2 的 27%"
- "KV 缓存砍到 10%"
- "百万 token 上下文"
- "SWE Verified 跑出 80.6，跟 Opus-4.6-Max 的 80.8 只差 0.2"
- "270 人的团队"
- "梁文锋自己掏 200 亿，占 40%"
- "实际控制权 89.5%"
- "单卡算力比英伟达对华特供版 H20 提升 2.87 倍"
- "采购价只有 H200 的三分之一到四分之一"
- "V4 的训练用了 32 万亿个 token"

### Quotes
- "落后于 GPT-5.4 和 Gemini-3.1-Pro，发展轨迹大约滞后前沿闭源模型 3 至 6 个月"
- "不诱于誉，不恐于诽，率道而行，端然正己"
- "你造轮子，我装车。你开赛道，我组局。"

## Layout x Style Signals

- Content type: multi-topic overview → suggests bento-grid
- Tone: 学术气质、历史感、有深度 → suggests aged-academia
- Audience: 科技爱好者 → aged-academia 的"研究笔记"质感契合
- Complexity: moderate → bento-grid 的 5-6 个格子刚好

## Recommended Combinations

1. **bento-grid + aged-academia** (用户指定): 多格子布局 + 复古学术风格，像一份研究笔记式的全景概览
2. **dense-modules + pop-laboratory**: 高密度模块 + 实验室蓝图纸风格，适合数据密集型技术概览
3. **hub-spoke + technical-schematic**: 中心辐射 + 工程蓝图风格，突出"整合"这一核心
