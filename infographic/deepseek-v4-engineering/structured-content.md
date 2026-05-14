# 不发明轮子的人：DeepSeek V4 的工程整合哲学

## Overview

DeepSeek V4 不发明轮子，而是把别人的轮子装到自己的车上，跑得比发明轮子的人还远。这份信息图展示其整合策略、关键数字、创始人背景、芯片适配与核心哲学。

## Learning Objectives
The viewer will understand:
1. V4 如何通过"借轮子+改造"实现技术突破
2. 量化投资思维如何塑造 DeepSeek 的工程文化
3. 国产芯片适配的战略意义

---

## Section 1: 借来的轮子——技术整合拼装

**Key Concept**: 没有一项是"从零发明"，但拼在一起效果惊人。

**Content**:
- mHC = 字节 Seed 团队 Hyper-Connections + DeepSeek 加的双随机矩阵约束（行和列的和都等于 1，保证数值稳定性）
- Muon = Kimi 团队优化器，替代 AdamW，接管绝大多数参数训练
- CSA（压缩稀疏注意力）继承自 V3.2 DeepSeek Sparse Attention
- HCA（密集压缩注意力）借鉴长上下文领域已有思路
- 放弃自家 MLA，重回 MQA

**Visual Element**:
- Type: 拼装示意图
- Subject: 四个来源箭头汇聚到中心"V4"
- Treatment: 每个来源标注公司名和原始技术名，中心标注改造后的名字

**Text Labels**:
- Headline: "借来的轮子"
- Labels: "字节HC → mHC", "Kimi Muon → 优化器", "CSA (自家)", "HCA (借鉴)", "放弃MLA → MQA"

---

## Section 2: 核心数字——性能指标

**Key Concept**: 一组数字定义了 V4 的实用价值。

**Content**:
- 单 token 推理 FLOPs 只有 V3.2 的 27%
- KV 缓存砍到 10%
- 百万 token 上下文
- SWE Verified 跑出 80.6，跟 Opus-4.6-Max 的 80.8 只差 0.2

**Visual Element**:
- Type: 数字仪表盘 / 大数字展示
- Subject: 四个核心数字并列，大字号突出
- Treatment: 27% 和 10% 用"削减"视觉（向下箭头），80.6 和 1M 用"达到"视觉（向上）

**Text Labels**:
- Headline: "关键指标"
- Labels: "FLOPs 27%", "KV Cache 10%", "上下文 1M token", "SWE Verified 80.6"

---

## Section 3: 梁文锋——量化出身的造局者

**Key Concept**: 量化交易的本质是把已有信号拼成能跑的系统，DeepSeek 一脉相承。

**Content**:
- 1985 年生，广东湛江吴川，浙大本硕（信息与通信工程）
- 幻方量化创始人，管 700 多亿盘子，2025 年收益率 56.55%
- 270 人团队
- 首轮融资个人出资 200 亿，占 40%，实际控制权 89.5%
- "三不"：不接受外部融资、不稀释股权、不被商业化时间表绑架

**Visual Element**:
- Type: 人物信息卡片
- Subject: 梁文锋的关键数据标签
- Treatment: 复古学术风格的"人物档案"卡片

**Text Labels**:
- Headline: "梁文锋"
- Labels: "量化出身", "270人团队", "个人出资200亿", "控制权89.5%"

---

## Section 4: 国产芯片适配——自评落后

**Key Concept**: 在英伟达 CUDA 生态之外，适配华为昇腾芯片，从底层搭自主训练体系。

**Content**:
- 华为昇腾 950PR，单卡算力比 H20 提升 2.87 倍，采购价 H200 的 1/3 到 1/4
- V4 首次在官方技术报告里把国产芯片和英伟达 GPU 写进同一份硬件验证清单
- 技术报告自评"落后前沿闭源模型 3 至 6 个月"
- 黄仁勋："要是哪天像 DeepSeek 这样的成果先在华为平台上出现，那对美国会是非常糟糕的结果"

**Visual Element**:
- Type: 芯片对比图
- Subject: 昇腾 950PR vs H20 的算力/价格对比
- Treatment: 复古科学插图风格的芯片剖面图

**Text Labels**:
- Headline: "国产芯片适配"
- Labels: "昇腾950PR", "算力↑2.87x", "价格↓1/3~1/4", "自评落后3-6个月"

---

## Section 5: 组牌局哲学

**Key Concept**: 不在"谁最强"上掰手腕，而是组局。

**Content**:
- "你造轮子，我装车。你开赛道，我组局。"
- "不诱于誉，不恐于诽，率道而行，端然正己。"
- 270 人团队做出 SWE Verified 80.6 的开源模型

**Visual Element**:
- Type: 引言卡片 / 哲学标签
- Subject: 核心引言大字展示
- Treatment: 书法/手写体，复古纸张底纹

**Text Labels**:
- Headline: "组牌局的人"
- Labels: "你造轮子，我装车", "不诱于誉，不恐于诽"

---

## Data Points (Verbatim)

### Statistics
- "单 token 推理 FLOPs 只有 V3.2 的 27%"
- "KV 缓存砍到 10%"
- "百万 token 上下文"
- "SWE Verified 跑出 80.6"
- "270 人的团队"
- "梁文锋自己掏 200 亿，占 40%"
- "实际控制权 89.5%"
- "单卡算力比英伟达对华特供版 H20 提升 2.87 倍"
- "采购价只有 H200 的三分之一到四分之一"

### Quotes
- "发展轨迹大约滞后前沿闭源模型 3 至 6 个月" — DeepSeek V4 技术报告
- "不诱于誉，不恐于诽，率道而行，端然正己" — DeepSeek V4 技术报告
- "你造轮子，我装车。你开赛道，我组局。" — 文章作者总结

---

## Design Instructions

### Style Preferences
- aged-academia: 复古学术风格，泛黄纸张底纹，棕色/深褐色调，科学插图质感
- 手写/衬线字体，研究笔记感

### Layout Preferences
- bento-grid: 不等大格子，主格放核心数字，周围格子放技术来源、人物、芯片、哲学
- 清晰的格子边界，每个格子独立主题

### Other Requirements
- 16:9 横版
- 中文
- 输出为 PNG
