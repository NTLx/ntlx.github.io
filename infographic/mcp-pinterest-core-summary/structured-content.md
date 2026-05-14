# MCP 生态构建：Pinterest 的实践与洞察

## Overview

Pinterest 将 MCP 从"听起来有意思"变为生产级系统的真实实践——架构、安全、度量、人机协作的完整图景。核心观点：协议本身不值钱，围绕协议建立的工程纪律才值钱。

## Learning Objectives

1. 理解 MCP 的本质——从 Function Calling 到统一协议的范式转换
2. 理解 Pinterest 的架构选择——多小服务器 + 中心注册表的组织逻辑
3. 理解双层安全模型——JWT + SPIFFE 的协同机制
4. 理解核心数据——66,000 月调用、7,000 小时节省、844 活跃用户
5. 理解 Human-in-the-loop 设计——人在监督下的自动化才是真正的效率

---

## Section 1: MCP 的本质——从 Function Calling 到统一协议

**Key Concept**: Function Calling 是 N×M 的紧耦合，MCP 是 N+M 的松耦合——协议的价值在于规模下的可维护性。

**Content**:
- 2023 年 Function Calling 火的时候，大家觉得"大模型能调工具了"，问题解决了。但很快发现不对——每接一个工具，就要写一套适配逻辑。你有 N 个模型、M 个工具，理论上有 N×M 种对接方式。
- MCP 的本质是把这 N×M 变成 N+M。工具端写一次 MCP Server，模型端写一次 MCP Client，中间用标准协议连起来。
- Pinterest 2024 年初试过用 Function Calling 方案搞 AI Agent。到年底，system prompt 膨胀到 8,000 多 token，响应质量断崖下跌。
- Function Calling 是"让大模型会用单个工具"，MCP 是"让大模型接入整个工具箱自己组合"。区别不在于技术先进性，在于规模下的可维护性。

**Visual Element**:
- Type: comparison diagram
- Subject: N×M 网格 vs N+M 星型拓扑
- Treatment: 左侧展示 N 个模型 × M 个工具的混乱连线，右侧展示简洁的 MCP 协议中间层

**Text Labels**:
- Headline: "MCP 的本质"
- Subhead: "从 N×M 到 N+M"
- Label left: "Function Calling: N×M 紧耦合"
- Label right: "MCP: N+M 松耦合"
- Bottom note: "system prompt 膨胀到 8,000+ token → 响应质量断崖下跌"

---

## Section 2: 架构选择——多小服务器 + 中心注册表

**Key Concept**: 不是技术偏好驱动，是组织现实驱动——每个 MCP Server 背后是一个团队，统一部署管道降低创建成本是让 MCP 从"几个人的玩具"变成"全公司基础设施"的关键。

**Content**:
- Pinterest 选了多小服务器——Presto 一个、Spark 一个、Airflow 一个，各管各的。
- 每个 MCP Server 背后是一个团队。Presto 的工具让数据工程师直接在 IDE 里查数据，Spark 的工具帮人诊断 Job 失败，Knowledge Server 让 Agent 能像调 API 一样调用公司内部文档。
- 早期反馈：创建一个新 MCP Server 太麻烦了——部署管道、服务配置、运维设置，还没写一行业务逻辑就被劝退了。
- Pinterest 的解法是搞统一部署管道：团队只定义工具逻辑，平台管部署和扩缩容。
- MCP 注册表是哪些 MCP 服务器被批准以及如何连接的唯一事实来源。

**Visual Element**:
- Type: architecture diagram
- Subject: 多个 MCP Server 围绕中心注册表的 hub-spoke 布局
- Treatment: 展示 Presto/Spark/Airflow/Knowledge 四个独立 Server 连接到中心 Registry，下方连接 IDE、AI Chat、Bot 三个消费端

**Text Labels**:
- Headline: "多小服务器 + 中心注册表"
- Subhead: "不是技术决策，是组织决策"
- Server labels: "Presto MCP", "Spark MCP", "Airflow MCP", "Knowledge MCP"
- Registry label: "MCP Registry (唯一事实来源)"
- Consumer labels: "IDE", "AI Chat", "Bot"
- Bottom note: "统一部署管道：团队只定义工具逻辑，平台管部署和扩缩容"

---

## Section 3: 双层安全模型——JWT + SPIFFE

**Key Concept**: 安全不是附加题——Pinterest 从第一天就把安全当联合项目来做，双层授权覆盖人和服务两种身份。

**Content**:
- 安全研究人员的数据显示，43% 的被分析 MCP 服务器存在命令注入漏洞，部署 10 个 MCP 插件产生 92% 的被攻击概率。
- 第一层是 JWT。用户登录内部系统时拿到一个 token，后面所有 MCP 调用都带着这个 token。Envoy 验证 token，映射出用户身份和组信息，执行粗粒度策略。
- 第二层是 SPIFFE。CNCF 毕业项目，给服务（不是人）发身份证书。对于低风险的只读场景，服务之间直接用 SPIFFE 身份互认。
- 业务组级别的访问控制：JWT 里提取业务组信息，只有 Ads、Finance 这些被批准的组才能建立会话。
- 某些 Server 在工具发现阶段就要求 JWT——你连"这个 Server 有哪些工具"都不知道，除非先证明你是谁。

**Visual Element**:
- Type: layered security diagram
- Subject: 双层安全模型的层级关系
- Treatment: 上层 JWT（用户身份，Envoy 验证），下层 SPIFFE（服务身份，mesh 验证），中间是业务组访问控制

**Text Labels**:
- Headline: "双层安全模型"
- Layer 1: "JWT — 用户身份 (Envoy 验证)"
- Layer 2: "SPIFFE — 服务身份 (Mesh 验证)"
- Gate: "业务组访问控制 (Ads, Finance...)"
- Warning: "43% MCP 服务器存在命令注入漏洞"
- Warning 2: "部署 10 个插件 → 92% 被攻击概率"
- Note: "工具发现阶段即要求 JWT — 全链路审计基础"

---

## Section 4: 核心数据——66,000 月调用、7,000 小时节省、844 活跃用户

**Key Concept**: 度量才是北极星——没有数字，MCP 就是个"听起来不错"的技术倡议；有了数字，它是"每月省 7,000 小时"的生产力工具。

**Content**:
- 66,000 invocations per month across 844 monthly active users (as of January 2025)
- saving on the order of 7,000 hours per month
- 66,000 次调用 × 每次约 6.4 分钟 ≈ 7,000 小时
- Server 维护者提供一个方向性"每次调用节省多少分钟"估算，乘以调用次数，得到月度工时节省
- 你度量什么，就得到什么。不度量，就只能靠感觉。

**Visual Element**:
- Type: large number highlight
- Subject: 三个核心指标的大数字展示
- Treatment: 三个大数字并排，每个带简短标签和上下文说明

**Text Labels**:
- Number 1: "66,000"
- Label 1: "月调用量 (2025.1)"
- Number 2: "7,000"
- Label 2: "月节省工时 (小时)"
- Number 3: "844"
- Label 3: "月活跃用户"
- Formula: "66,000 × 6.4 分钟 ≈ 7,000 小时"
- Bottom note: "你度量什么，就得到什么。不度量，就只能靠感觉。"

---

## Section 5: Human-in-the-loop 设计

**Key Concept**: 不是保守，是现实——"Agent 在人监督下干活省的 7,000 小时"比"完全自动化省的"更有意义，因为出错的代价也大得多。

**Content**:
- Pinterest 的 Agent 指南里有一条硬规则：任何敏感或高成本操作，必须人类批准才能执行。
- Agent 提出操作，人类审核（可以批量），然后才跑。
- "elicitation" 机制：Agent 不只是说"我要执行这个操作"，而是要解释为什么要这么做、预期结果是什么，人类据此判断。
- 回头看那 7,000 小时的节省，不是"Agent 替人干活省的"，是"Agent 在人监督下干活省的"。这个区别重要。
- 完全自动化省的时间更多，但出错的代价也更大。Pinterest 选了一个中间值：自动化提效，人工兜底。

**Visual Element**:
- Type: flow diagram
- Subject: Agent 提议 → 人类审批 → 执行的流程
- Treatment: 三步流程，中间"人类审批"步骤高亮为关键节点

**Text Labels**:
- Headline: "Human-in-the-loop"
- Subhead: "不是保守，是现实"
- Step 1: "Agent 提议操作"
- Step 2: "人类审批 (可批量)"
- Step 3: "执行"
- Mechanism: "elicitation: Agent 必须解释为什么做、预期结果"
- Quote: "自动化提效，人工兜底"
- Bottom note: "7,000 小时 = Agent 在人监督下干活省的，不是 Agent 替人干活省的"

---

## Data Points (Verbatim)

### Statistics
- "66,000 invocations per month across 844 monthly active users"
- "saving on the order of 7,000 hours per month"
- "43% of the analyzed MCP servers have command injection vulnerabilities"
- "deploying 10 MCP plugins yields 92% attack probability"
- "system prompt 膨胀到 8,000 多 token"

### Quotes
- "区别不在于技术先进性，在于规模下的可维护性" — 文章作者
- "你度量什么，就得到什么。不度量，就只能靠感觉。" — 文章作者
- "自动化提效，人工兜底" — 文章作者

### Key Terms
- **MCP (Model Context Protocol)**: 开源标准，让大语言模型通过统一的客户端-服务器协议与工具和数据源通信
- **SPIFFE**: CNCF 毕业项目，云原生安全身份标准，为工作负载分配统一可验证身份
- **JWT**: JSON Web Token，用户登录后获得的身份令牌
- **Elicitation**: Agent 在执行敏感操作前必须解释原因和预期结果的机制
- **MCP Registry**: 哪些 MCP 服务器被批准以及如何连接的唯一事实来源

---

## Design Instructions

### Style Preferences
- aged-academia: Vintage scientific illustration, sepia tones, parchment background
- Detailed cross-hatching and line work
- Scientific annotation style with numbered elements
- Cursive or serif typography

### Layout Preferences
- bento-grid: Modular grid with varied cell sizes (1x1, 2x1, 1x2, 2x2)
- Hero cell for main point (Section 1: MCP 的本质)
- Supporting cells around it
- Clear cell boundaries with varied backgrounds

### Other Requirements
- Language: Chinese (zh)
- Aspect ratio: 16:9 landscape
- Core summary — cover all 5 sections as a global overview
- Data-forward: large numbers, clear metrics
