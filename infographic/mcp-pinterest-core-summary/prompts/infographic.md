---
type: infographic
layout: bento-grid
style: aged-academia
aspect: "16:9"
language: zh
topic: "MCP 生态构建：Pinterest 的实践与洞察"
generated: "2026-05-12"
---

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
- If content involves sensitive or copyrighted figures, create stylistically similar alternatives
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

Bento-grid layout: Modular grid with varied cell sizes (1x1, 2x1, 1x2, 2x2). No strict symmetry required. Hero cell for main point, supporting cells around it. Clear cell boundaries, varied cell backgrounds, icons or illustrations per cell, consistent padding/margins, visual hierarchy through size.

Structure:
- Grid of 5-6 rectangular cells of mixed sizes
- Hero cell (2x2 or 2x1) for the main concept (MCP 本质: N×M → N+M)
- 4-5 supporting cells arranged around the hero cell
- Each cell has its own title, key content, and visual element
- Main title at top spanning full width

## Style Guidelines

Aged-academia style: Historical scientific illustration with aged paper aesthetic.

- Color Palette: Sepia brown (#704214), aged ink, muted earth tones. Background: Parchment (#F4E4BC), yellowed paper texture. Accents: Faded red annotations, iron gall ink spots.
- Visual Elements: Aged paper texture overlay, detailed cross-hatching and line work, scientific illustration precision, study notes and annotations, specimen plate or sketch aesthetic, numbered diagram elements.
- Typography: Handwritten cursive or serif fonts, scientific annotations, small caps for labels, italics for scientific names.

---

Generate the infographic based on the content below:

# MCP 生态构建：Pinterest 的实践与洞察

## 全局主题

Pinterest 将 MCP 从"听起来有意思"变为生产级系统的真实实践。核心观点：协议本身不值钱，围绕协议建立的工程纪律才值钱。

---

## Cell 1 (Hero, 2x2): MCP 的本质——从 Function Calling 到统一协议

**Key Concept**: Function Calling 是 N×M 的紧耦合，MCP 是 N+M 的松耦合。

**Content**:
- 2023 年 Function Calling: 每接一个工具，就要写一套适配逻辑。N 个模型 × M 个工具 = N×M 种对接方式。
- MCP 的本质: 工具端写一次 MCP Server，模型端写一次 MCP Client，中间用标准协议连起来。把 N×M 变成 N+M。
- Pinterest 实测: 2024 年初试用 Function Calling，年底 system prompt 膨胀到 8,000+ token，响应质量断崖下跌。

**Visual**: 左侧展示 N 个模型 × M 个工具的混乱连线网格，右侧展示简洁的 MCP 协议中间层星型拓扑。对比鲜明。

---

## Cell 2 (2x1): 架构选择——多小服务器 + 中心注册表

**Key Concept**: 不是技术偏好驱动，是组织现实驱动。

**Content**:
- Presto 一个、Spark 一个、Airflow 一个，各管各的
- 每个 MCP Server 背后是一个团队，团队知道自己的痛点在哪
- 统一部署管道：团队只定义工具逻辑，平台管部署和扩缩容
- MCP Registry: 哪些服务器被批准以及如何连接的唯一事实来源

**Visual**: Hub-spoke 架构图，中心是 Registry，四周是 Presto/Spark/Airflow/Knowledge 四个 Server，下方连接 IDE、AI Chat、Bot 三个消费端。

---

## Cell 3 (1x1): 双层安全模型——JWT + SPIFFE

**Key Concept**: 安全不是附加题，从第一天就是联合项目。

**Content**:
- 第一层 JWT: 用户登录内部系统拿到 token，Envoy 验证，映射身份和组信息
- 第二层 SPIFFE: CNCF 毕业项目，给服务发身份证书，低风险只读场景用
- 业务组访问控制: 只有 Ads、Finance 等被批准的组才能建立会话
- 某些 Server 在工具发现阶段就要求 JWT — 全链路审计基础

**Visual**: 双层安全模型示意图，上层 JWT（用户身份），下层 SPIFFE（服务身份），中间业务组访问控制。

---

## Cell 4 (1x1): 核心数据

**Key Concept**: 度量才是北极星。

**Content**:
- 66,000 月调用量 (2025.1)
- 7,000 月节省工时 (小时)
- 844 月活跃用户
- 公式: 66,000 × 6.4 分钟 ≈ 7,000 小时

**Visual**: 三个大数字并排展示，每个带简短标签。下方公式推导。使用 specimen plate 风格的大数字。

---

## Cell 5 (2x1): Human-in-the-loop 设计

**Key Concept**: 不是保守，是现实。自动化提效，人工兜底。

**Content**:
- 硬规则: 任何敏感或高成本操作，必须人类批准才能执行
- 流程: Agent 提议操作 → 人类审批 (可批量) → 执行
- elicitation 机制: Agent 必须解释为什么做、预期结果是什么
- "7,000 小时 = Agent 在人监督下干活省的，不是 Agent 替人干活省的"

**Visual**: 三步流程图，中间"人类审批"步骤高亮为关键节点。使用手绘箭头和标注。

---

## Additional Context

### Pinterest 公司背景
- 视觉发现和灵感平台（图片社交 + 电商导购）
- 2026 年 Q1 营收 10.1 亿美元，全球月活 6.31 亿
- CEO Bill Ready（前 Google Commerce 负责人）

### MCP 生态现状
- 大公司采用: Anthropic（发起）、OpenAI（2025.3 支持）、Block、Pinterest
- 社区超 1000-7000 个 MCP Server
- 安全争议: 43% 的 MCP 服务器存在命令注入漏洞

### 关键架构决策
- 领域专有 MCP 服务器（非单体）: Presto、Spark、Airflow 各一个
- 中心 MCP 注册表: 服务发现 + 权限校验 + 治理策略
- 双层授权: 人工 JWT + 服务 SPIFFE
- 敏感操作人工审批（elicitation 机制）

Text labels (in zh):

- 主标题: "MCP 生态构建：Pinterest 的实践与洞察"
- 副标题: "协议本身不值钱，围绕协议建立的工程纪律才值钱"
- Cell 1 标题: "MCP 的本质"
- Cell 1 副标题: "从 N×M 到 N+M"
- Cell 1 标签: "Function Calling: N×M 紧耦合", "MCP: N+M 松耦合", "system prompt 膨胀到 8,000+ token"
- Cell 2 标题: "多小服务器 + 中心注册表"
- Cell 2 副标题: "不是技术决策，是组织决策"
- Cell 2 标签: "Presto MCP", "Spark MCP", "Airflow MCP", "Knowledge MCP", "MCP Registry", "IDE", "AI Chat", "Bot", "统一部署管道"
- Cell 3 标题: "双层安全模型"
- Cell 3 标签: "JWT — 用户身份", "SPIFFE — 服务身份", "业务组访问控制", "43% MCP 服务器存在命令注入漏洞", "工具发现阶段即要求 JWT"
- Cell 4 标题: "核心数据"
- Cell 4 标签: "66,000", "月调用量", "7,000", "月节省工时", "844", "月活跃用户", "66,000 × 6.4 分钟 ≈ 7,000 小时", "你度量什么，就得到什么"
- Cell 5 标题: "Human-in-the-loop"
- Cell 5 副标题: "不是保守，是现实"
- Cell 5 标签: "Agent 提议操作", "人类审批 (可批量)", "执行", "elicitation: Agent 必须解释为什么做", "自动化提效，人工兜底", "7,000 小时 = 人监督下省的"
