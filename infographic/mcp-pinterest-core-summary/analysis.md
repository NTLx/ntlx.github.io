---
title: "MCP 生态构建：Pinterest 的实践与洞察"
topic: technical-engineering
data_type: system-overview
complexity: moderate
point_count: 5
source_language: en/zh
user_language: zh
---

## Main Topic

Pinterest 如何将 MCP（Model Context Protocol）从概念落地为生产级 AI 工具生态，涵盖架构设计、安全模型、度量体系和人机协作机制。

## Learning Objectives

After viewing this infographic, the viewer should understand:
1. MCP 的本质——从 Function Calling 的 N×M 问题到统一协议的 N+M 解法
2. Pinterest 的架构决策——多小服务器 + 中心注册表，以及背后的组织逻辑
3. 双层安全模型——JWT（用户身份）+ SPIFFE（服务身份）如何协同工作
4. 核心度量数据——66,000 月调用、7,000 小时节省、844 活跃用户的意义
5. Human-in-the-loop 设计——为什么"人在监督下省的 7,000 小时"比"完全自动化"更重要

## Target Audience

- **Knowledge Level**: Intermediate — 了解 AI/LLM 基础，对 MCP 有初步认知
- **Context**: 技术决策者、AI 工程师，评估是否在自己组织引入 MCP
- **Expectations**: 看到真实数据和架构决策逻辑，而非概念宣传

## Content Type Analysis

- **Data Structure**: 多维度并行（架构、安全、度量、协作），适合 bento-grid 模块化展示
- **Key Relationships**: 架构决策 ↔ 安全模型 ↔ 度量体系形成闭环
- **Visual Opportunities**: 大数字（66K/7K/844）、架构对比图（N×M vs N+M）、安全层级图

## Key Data Points (Verbatim)

- "66,000 invocations per month across 844 monthly active users"
- "saving on the order of 7,000 hours per month"
- "43% of the analyzed MCP servers have command injection vulnerabilities"
- "deploying 10 MCP plugins yields 92% attack probability"
- "system prompt 膨胀到 8,000 多 token，响应质量断崖下跌"
- "把这 N×M 变成 N+M"
- "任何敏感或高成本操作，必须人类批准才能执行"

## Layout × Style Signals

- Content type: system overview → bento-grid (multiple parallel topics)
- Tone: analytical, engineering-focused → aged-academia (vintage scientific precision)
- Audience: technical professionals → clean, data-forward presentation
- Complexity: moderate → 5 cells with clear hierarchy

## Design Instructions (from user input)

- Style: aged-academia (vintage science, sepia tones, specimen plate aesthetic)
- Layout: bento-grid (modular grid with varied cell sizes)
- Aspect: 16:9 landscape
- Language: zh (Chinese)
- Sections: 5 core topics as specified by user

## Recommended Combinations

1. **bento-grid + aged-academia** (User specified): Vintage scientific illustration meets modular grid — data-rich technical content presented with academic gravitas
2. **dense-modules + pop-laboratory**: High-density technical guide with lab precision
3. **bento-grid + technical-schematic**: Engineering blueprint style for architecture overview
