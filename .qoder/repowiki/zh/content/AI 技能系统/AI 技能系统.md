# AI 技能系统

<cite>
**本文引用的文件**
- [README.md](file://README.md)
- [AGENTS.md](file://AGENTS.md)
- [astro.config.mjs](file://astro.config.mjs)
- [package.json](file://package.json)
- [skills-lock.json](file://skills-lock.json)
- [.agents/skills/baoyu-article-illustrator/SKILL.md](file://.agents/skills/baoyu-article-illustrator/SKILL.md)
- [.agents/skills/baoyu-imagine/SKILL.md](file://.agents/skills/baoyu-imagine/SKILL.md)
- [.agents/skills/wechat-article-write/EXTEND.md](file://.agents/skills/wechat-article-write/EXTEND.md)
- [src/content/docs/articles/idea-stage-validate-first.md](file://src/content/docs/articles/idea-stage-validate-first.md)
- [src/content/docs/articles/launch-scale-founder-bottleneck.md](file://src/content/docs/articles/launch-scale-founder-bottleneck.md)
- [src/content/docs/articles/ai-economics-doesnt-work.md](file://src/content/docs/articles/ai-economics-doesnt-work.md)
- [src/content/docs/articles/ai-industry.mdx](file://src/content/docs/articles/ai-industry.mdx)
- [src/content/docs/articles/ai-coding.mdx](file://src/content/docs/articles/ai-coding.mdx)
- [src/content/docs/articles/ai-agents.mdx](file://src/content/docs/articles/ai-agents.mdx)
</cite>

## 更新摘要
**所做更改**
- 重大内容结构调整：从技术技能文档转向AI创业方法论内容
- 新增AI创业系列文章：Idea阶段验证、Launch&Scale创始人瓶颈、AI经济学分析
- 技能系统文档重点重新定位：从技术实现转向创业实践指导
- 内容分类体系更新：新增AI行业洞察、AI编程实践、Agent与工具链分类

## 目录
1. [简介](#简介)
2. [项目结构](#项目结构)
3. [核心组件](#核心组件)
4. [架构总览](#架构总览)
5. [详细组件分析](#详细组件分析)
6. [AI创业方法论](#ai创业方法论)
7. [依赖分析](#依赖分析)
8. [性能考虑](#性能考虑)
9. [故障排除指南](#故障排除指南)
10. [结论](#结论)
11. [附录](#附录)

## 简介
本文件为 NTLx's Blog 的 AI 技能系统提供全面技术文档。该系统采用模块化设计，围绕"技能"（Skill）构建，每个技能以独立目录形式组织，包含运行说明、配置文件、参考文档与脚本等。系统通过 EXTEND.md 实现运行时配置与偏好管理，并通过 skills-lock.json 锁定技能来源与版本，确保可复现性与一致性。

**重要更新** 项目内容结构已发生重大转变，从单纯的技术技能文档转向AI创业方法论内容。现在系统不仅包含技术实现，更重要的是提供AI时代的创业指导和行业洞察。

## 项目结构
技能系统主要位于 .agents/skills 与 .baoyu-skills 两个目录中，前者为面向用户的技能集合，后者为 baoyu 系列技能的官方仓库映射。每个技能目录下通常包含：
- SKILL.md：技能说明与工作流规范
- EXTEND.md：运行时配置（部分技能）
- references/：参考文档（配置模板、样式库、工作流等）
- scripts/：可执行脚本（如主程序、批处理、工具函数）

```mermaid
graph TB
A[".agents/skills"] --> B["baoyu-article-illustrator"]
A --> C["baoyu-imagine"]
A --> D["baoyu-translate"]
A --> E["baoyu-post-to-wechat"]
A --> F["wechat-article-write"]
subgraph "baoyu 系列映射(.baoyu-skills)"
G[".baoyu-skills/baoyu-article-illustrator"]
H[".baoyu-skills/baoyu-imagine"]
I[".baoyu-skills/baoyu-post-to-wechat"]
J[".baoyu-skills/baoyu-translate"]
end
K["skills-lock.json"] --> L["技能来源与哈希锁定"]
M["package.json"] --> N["项目依赖与运行环境"]
O["astro.config.mjs"] --> P["Starlight 主题集成"]
Q["AI 创业文章"] --> R["Idea 验证"]
Q --> S["Launch&Scale 瓶颈"]
Q --> T["AI 经济学分析"]
```

**图表来源**
- [skills-lock.json:1-234](file://skills-lock.json#L1-L234)
- [package.json:1-19](file://package.json#L1-L19)
- [astro.config.mjs:1-285](file://astro.config.mjs#L1-L285)

**章节来源**
- [skills-lock.json:1-234](file://skills-lock.json#L1-L234)
- [package.json:1-19](file://package.json#L1-L19)
- [astro.config.mjs:1-285](file://astro.config.mjs#L1-L285)

## 核心组件
- 技能（Skill）：每个技能是一个独立功能单元，包含工作流、输入输出约定、依赖与配置项。例如 baoyu-article-illustrator 负责文章插图生成；baoyu-imagine 提供多提供商图像生成；baoyu-translate 支持三种翻译模式；baoyu-post-to-wechat 支持公众号文章与图文发布。
- EXTEND.md：技能运行时配置文件，用于保存偏好设置、默认参数与环境变量。不同技能的 EXTEND.md 结构与键名不同，但均遵循"优先级：CLI > EXTEND.md > 环境变量"的覆盖规则。
- 参考文档（references/）：提供首选项模板、样式库、工作流细节、首次配置流程等，支撑技能的正确使用与扩展。
- 脚本（scripts/）：技能的可执行入口与工具集，如图像生成、批处理、浏览器自动化、API 调用等。
- **新增** AI创业内容：涵盖Idea阶段验证、Launch&Scale创始人瓶颈、AI经济学分析等创业指导内容。

**章节来源**
- [.agents/skills/baoyu-article-illustrator/SKILL.md:1-241](file://.agents/skills/baoyu-article-illustrator/SKILL.md#L1-L241)
- [.agents/skills/baoyu-imagine/SKILL.md:1-238](file://.agents/skills/baoyu-imagine/SKILL.md#L1-L238)
- [.agents/skills/wechat-article-write/EXTEND.md:1-61](file://.agents/skills/wechat-article-write/EXTEND.md#L1-L61)

## 架构总览
系统采用"技能即服务"的模块化架构，各技能相对独立，通过统一的配置与依赖声明协同工作。核心流程包括：
- 加载 EXTEND.md 与环境变量，确定运行偏好
- 解析用户输入与前置条件（如参考图片、目标语言、主题等）
- 执行工作流步骤（分析、确认、生成、后处理）
- 输出结果与中间产物（如插图、翻译稿、HTML/Markdown）

**重要更新** 基础设施层面，系统现已集成 Astro 6.3.1 和 Starlight 主题，提供现代化的文档站点体验，支持 SEO 优化、社交媒体集成和响应式设计。同时新增AI创业内容分类体系，形成技术技能与创业方法论并重的内容架构。

```mermaid
sequenceDiagram
participant U as "用户"
participant S as "技能(Skill)"
participant C as "配置(EXTEND.md)"
participant E as "环境变量"
participant P as "外部提供商/API"
U->>S : 触发技能请求
S->>C : 读取并合并配置
S->>E : 读取环境变量
S->>S : 解析输入与前置条件
S->>S : 执行工作流步骤
alt 需要外部生成
S->>P : 调用提供商接口
P-->>S : 返回结果
else 本地处理
S->>S : 本地脚本执行
end
S-->>U : 输出最终产物与摘要
```

**图表来源**
- [.agents/skills/baoyu-imagine/SKILL.md:32-50](file://.agents/skills/baoyu-imagine/SKILL.md#L32-L50)
- [.agents/skills/baoyu-article-illustrator/SKILL.md:95-113](file://.agents/skills/baoyu-article-illustrator/SKILL.md#L95-L113)

## 详细组件分析

### 技能版本锁定与来源管理（skills-lock.json）
skills-lock.json 记录了已安装技能的来源、类型、路径与哈希值，用于保证技能版本可复现与来源可信。其结构要点：
- version：锁版本号
- skills：技能清单，每项包含 source、sourceType、skillPath、computedHash
- 建议在 CI/CD 或部署前校验 computedHash，防止篡改

```mermaid
flowchart TD
A["开始"] --> B["读取 skills-lock.json"]
B --> C{"技能存在且来源匹配?"}
C --> |是| D["校验 computedHash"]
C --> |否| E["提示来源不一致或缺失"]
D --> F{"哈希匹配?"}
F --> |是| G["继续加载技能"]
F --> |否| H["警告版本不一致，建议更新/回滚"]
E --> I["结束"]
G --> I
H --> I
```

**图表来源**
- [skills-lock.json:1-234](file://skills-lock.json#L1-L234)

**章节来源**
- [skills-lock.json:1-234](file://skills-lock.json#L1-L234)

### Astro 框架现代化升级
系统现已升级至 Astro 6.3.1，集成 Starlight 主题，提供现代化的文档站点体验：

- **框架版本**：Astro 6.3.1，支持最新的静态站点生成特性和性能优化
- **主题集成**：Starlight 主题提供专业的文档网站外观，支持多语言、侧边栏导航和搜索功能
- **SEO 优化**：内置 SEO 支持，包括 Open Graph 图像、RSS 订阅和结构化数据
- **响应式设计**：完全响应式的界面设计，适配各种设备和屏幕尺寸
- **性能优化**：自动代码分割、资源优化和懒加载支持

**章节来源**
- [astro.config.mjs:1-285](file://astro.config.mjs#L1-L285)
- [package.json:1-19](file://package.json#L1-L19)

### 文章插图生成（baoyu-article-illustrator）
- 功能概述：分析文章结构，识别插图位置，基于"类型×风格×调色板"三维组合生成插图，并支持参考图片与批量生成。
- 配置与偏好：通过 EXTEND.md 管理水印、默认输出目录、首选图像后端、语言等；首次运行需完成"首次配置"流程。
- 工作流：预检查 → 分析 → 确认设置 → 生成大纲 → 生成插图 → 最终化。
- 关键特性：
  - 三维度选择：类型（信息图、场景、流程图等）、风格（手绘、极简、水彩等）、调色板（可选覆盖）。
  - 插图生成前必须保存 prompt 文件，作为可复现记录与跨后端兼容依据。
  - 后端选择顺序：当前请求覆盖 → 已保存偏好 → 自动选择（优先运行时原生工具）。
  - 输出目录策略：支持多种布局（同目录、子目录、独立目录），并计算相对插入路径。

```mermaid
flowchart TD
S1["开始"] --> S2["加载 EXTEND.md 与偏好"]
S2 --> S3["分析文章并识别插图位置"]
S3 --> S4["用户确认设置(类型/密度/风格/调色板/语言)"]
S4 --> S5["生成插图大纲(outline.md)"]
S5 --> S6["逐个生成插图(保存 prompt 文件)"]
S6 --> S7["应用水印/参考图片/批量策略"]
S7 --> S8["插入 Markdown 并输出摘要"]
```

**图表来源**
- [.agents/skills/baoyu-article-illustrator/SKILL.md:84-183](file://.agents/skills/baoyu-article-illustrator/SKILL.md#L84-L183)

**章节来源**
- [.agents/skills/baoyu-article-illustrator/SKILL.md:1-241](file://.agents/skills/baoyu-article-illustrator/SKILL.md#L1-L241)

### 多提供商图像生成（baoyu-imagine）
- 功能概述：支持 OpenAI、Azure、Google、OpenRouter、DashScope、Z.AI、MiniMax、Jimeng、Seedream、Replicate 等多家提供商的文本到图像、参考图、批量生成。
- 配置与优先级：EXTEND.md 中的 default_provider、default_model.*、质量与尺寸等；CLI 参数优先于 EXTEND.md，ENV 次之。
- 使用方式：命令行入口 scripts/main.ts，支持单图与批量（--batchfile），自动并发与重试。
- 错误处理：缺少密钥时报错引导设置；生成失败自动重试；无效宽高比给出警告并回退默认。

```mermaid
sequenceDiagram
participant U as "用户"
participant M as "main.ts"
participant CFG as "EXTEND.md/ENV"
participant PR as "提供商API"
U->>M : 传入 --prompt/--promptfiles/--ref/--provider/--model
M->>CFG : 解析默认提供商/模型/质量/尺寸
M->>PR : 发起图像生成请求
PR-->>M : 返回图像数据/URL
M-->>U : 保存图像并输出统计
```

**图表来源**
- [.agents/skills/baoyu-imagine/SKILL.md:51-124](file://.agents/skills/baoyu-imagine/SKILL.md#L51-L124)

**章节来源**
- [.agents/skills/baoyu-imagine/SKILL.md:1-238](file://.agents/skills/baoyu-imagine/SKILL.md#L1-L238)

### 微信文章写作流水线（wechat-article-write）
- 功能概述：提供微信文章写作的运行时配置，支持全自动（跳过中间确认）、默认发布方式等。
- 依赖技能：明确列出依赖的 EXTEND.md 配置项，如 baoyu-cover-image、baoyu-article-illustrator、baoyu-markdown-to-html、baoyu-post-to-wechat。
- 环境变量：集中于 ~/.baoyu-skills/.env，包含微信公众号 API、GitHub 图床、OpenAI 等。

```mermaid
flowchart TD
W1["开始"] --> W2["读取 wechat-article-write/EXTEND.md"]
W2 --> W3["检查依赖技能 EXTEND.md 配置"]
W3 --> W4["加载 ~/.baoyu-skills/.env"]
W4 --> W5["按 quick_mode 执行(全自动/交互式)"]
W5 --> W6["调用依赖技能(封面/插图/转换/发布)"]
W6 --> W7["输出总结与下一步"]
```

**图表来源**
- [.agents/skills/wechat-article-write/EXTEND.md:1-61](file://.agents/skills/wechat-article-write/EXTEND.md#L1-L61)

**章节来源**
- [.agents/skills/wechat-article-write/EXTEND.md:1-61](file://.agents/skills/wechat-article-write/EXTEND.md#L1-L61)

## AI创业方法论

### Idea阶段验证：四个关键问题
AI时代创业的首要挑战不是技术实现，而是验证价值主张。Anthropic创始人手册提出了四个关键问题：

1. **问题是否真实、具体、频繁**：避免抽象的"效率提升"，要量化到具体的场景和频率
2. **谁确切地有问题**：明确目标用户群体和市场规模
3. **是否已有解决方案**：客观评估现有替代方案的有效性
4. **解决方案需要做什么**：识别实施边界和技术要求

```mermaid
flowchart TD
A["Idea 验证流程"] --> B["问题真实性评估"]
B --> C["目标用户画像"]
C --> D["竞争格局分析"]
D --> E["解决方案可行性"]
E --> F["离场标准决策"]
```

**图表来源**
[src/content/docs/articles/idea-stage-validate-first.md:39-67](file://src/content/docs/articles/idea-stage-validate-first.md#L39-L67)

**章节来源**
[src/content/docs/articles/idea-stage-validate-first.md:1-140](file://src/content/docs/articles/idea-stage-validate-first.md#L1-L140)

### Launch&Scale创始人瓶颈
找到产品市场契合度（PMF）只是开始，真正的挑战是创始人自身的转型：

- **技术债到期**：快速原型期的权宜之计需要系统性重构
- **创始人成为瓶颈**：从亲力亲为转向授权和流程化
- **安全合规压力**：从理论风险转为现实约束
- **过早扩张陷阱**：新市场的不确定性可能吞噬增长

**章节来源**
[src/content/docs/articles/launch-scale-founder-bottleneck.md:1-120](file://src/content/docs/articles/launch-scale-founder-bottleneck.md#L1-L120)

### AI经济学分析
AI服务的商业模式存在根本性问题：

- **订阅制的欺骗性**：切断行为与成本的直接联系
- **数据中心的经济困境**：高昂的建设成本与微薄的利润率
- **算力成本的不可持续性**：推理成本不降反升
- **行业假设的脆弱性**：建立在"未来会便宜"基础上的商业模式

**章节来源**
[src/content/docs/articles/ai-economics-doesnt-work.md:1-170](file://src/content/docs/articles/ai-economics-doesnt-work.md#L1-L170)

## 依赖分析
- 技能间依赖：wechat-article-write 明确声明对多个 baoyu 系列技能的 EXTEND.md 依赖；baoyu-article-illustrator 在生成阶段依赖 baoyu-imagine 或运行时原生图像工具。
- 外部依赖：各技能通过 ENV 变量访问第三方 API；baoyu-imagine 支持多提供商；baoyu-post-to-wechat 依赖微信 API 或浏览器自动化。
- 版本与来源：skills-lock.json 锁定技能来源与哈希，避免版本漂移与供应链风险。
- **新增** 内容分类依赖：AI创业文章与技术技能文章形成互补的内容生态。

**重要更新** 依赖管理现已现代化，使用 Astro 6.3.1 和 Starlight 主题，提供更好的性能和开发体验。同时新增的内容分类体系形成了技术技能与创业方法论的双重依赖关系。

```mermaid
graph LR
WA["wechat-article-write"] --> AC["baoyu-article-illustrator"]
WA --> CI["baoyu-cover-image"]
WA --> MT["baoyu-markdown-to-html"]
WA --> PW["baoyu-post-to-wechat"]
AC --> IM["baoyu-imagine"]
AC --> ENV["EXTEND.md/ENV"]
PW --> ENV
IM --> ENV
MT --> ENV
AI["AI 创业文章"] --> TECH["技术技能文章"]
TECH --> WA
AI --> WA
```

**图表来源**
[.agents/skills/wechat-article-write/EXTEND.md:29-38](file://.agents/skills/wechat-article-write/EXTEND.md#L29-L38)
[.agents/skills/baoyu-article-illustrator/SKILL.md:24-40](file://.agents/skills/baoyu-article-illustrator/SKILL.md#L24-L40)

**章节来源**
[.agents/skills/wechat-article-write/EXTEND.md:1-61](file://.agents/skills/wechat-article-write/EXTEND.md#L1-L61)
[.agents/skills/baoyu-article-illustrator/SKILL.md:1-241](file://.agents/skills/baoyu-article-illustrator/SKILL.md#L1-L241)

## 性能考虑
- 批量生成：当已有保存的 prompt 文件时，优先使用批量接口以提升吞吐并减少协调成本；否则采用顺序生成便于调试。
- 并发与限流：批量模式下按提供商限制与配置上限并发，避免 RPM 突发；默认最大 worker 数可调整。
- 重试策略：单图最多重试若干次；合理设置重试间隔与失败原因记录，便于排障。
- I/O 与缓存：prompt 文件作为可复现记录，避免重复生成；输出目录结构清晰，利于后续处理与归档。
- **新增** 内容性能：AI创业文章的SEO优化和分类体系提升了内容发现效率。

**重要更新** 现代化基础设施提供了更好的性能表现，Astro 6.3.1 的静态站点生成优化和 Starlight 主题的响应式设计提升了整体用户体验。同时新增的AI创业内容分类体系优化了用户的内容获取路径。

**章节来源**
[.agents/skills/baoyu-imagine/SKILL.md:194-214](file://.agents/skills/baoyu-imagine/SKILL.md#L194-L214)

## 故障排除指南
- 缺少 EXTEND.md：多数技能在首次运行前会触发"首次配置"，完成后方可继续；未完成配置会导致阻断。
- 缺失 API 密钥：baoyu-imagine 与 baoyu-post-to-wechat 在缺少密钥时会报错并引导设置；请检查 ENV 与 EXTEND.md。
- 生成失败：查看失败原因与重试次数；必要时切换提供商或调整模型/尺寸。
- 参考图不支持：某些提供商不支持参考图编辑，需更换支持的模型或上游能力。
- 微信发布问题：核对 AppID/AppSecret、评论开关、封面图、Chrome 配置；使用预检脚本排查环境。
- **新增** 创业验证问题：Idea阶段验证失败时，重新审视四个关键问题的解答质量。

**重要更新** 基础设施层面的问题通常与 Astro 配置和 Starlight 主题设置相关，建议检查 astro.config.mjs 中的主题配置和依赖版本。同时AI创业内容的组织结构也需要定期优化以提升用户体验。

**章节来源**
[.agents/skills/baoyu-imagine/SKILL.md:215-221](file://.agents/skills/baoyu-imagine/SKILL.md#L215-L221)
[.agents/skills/wechat-article-write/EXTEND.md:1-61](file://.agents/skills/wechat-article-write/EXTEND.md#L1-L61)

## 结论
NTLx's Blog 的 AI 技能系统通过模块化设计实现了高度可组合与可扩展的能力。EXTEND.md 与参考文档提供了完善的配置与使用指南，skills-lock.json 确保了版本与来源的可追溯性。

**重要更新** 项目内容结构的重大转变标志着从技术技能文档向AI创业方法论内容的转型。系统现在不仅提供技术实现指导，更重要的是提供AI时代的创业智慧和行业洞察。通过标准化的工作流与错误处理策略，系统在复杂任务（如文章插图、翻译、公众号发布）中保持稳定与高效。

建议在生产环境中严格遵循"先验证、再配置、后执行"的流程，并结合批量与缓存策略优化性能。同时充分利用现代化基础设施提供的 SEO 优化、响应式设计和性能增强功能。对于AI创业内容，建议采用"验证-执行-迭代"的闭环模式，持续优化创业决策质量。

## 附录

### EXTEND.md 配置文件格式与优先级
- 通用优先级：CLI 参数 > EXTEND.md > 环境变量 > 当前目录 .baoyu-skills/.env > 用户目录 ~/.baoyu-skills/.env
- 不同技能的 EXTEND.md 字段差异较大，应参考对应技能的 references/schema 文档
- 示例：
  - baoyu-article-illustrator：水印、首选风格、默认输出目录、首选图像后端、语言等
  - baoyu-imagine：默认提供商、默认模型、质量、尺寸、API 方言、并发限制等
  - baoyu-post-to-wechat：默认主题/颜色、默认发布方式、默认作者、评论控制、Chrome 配置等

**章节来源**
[.agents/skills/baoyu-article-illustrator/SKILL.md:100-115](file://.agents/skills/baoyu-article-illustrator/SKILL.md#L100-L115)

### 技能扩展开发流程
- 新增技能目录与 SKILL.md，明确功能、输入输出、工作流与依赖
- 提供 references/ 下的配置模板、样式库与首次配置文档
- 在 scripts/ 中实现可执行入口与工具函数
- 在 skills-lock.json 中登记来源与哈希，确保可复现性
- 在 wechat-article-write/EXTEND.md 中声明依赖与最小配置项

**重要更新** 开发流程现已与现代化基础设施兼容，支持 Astro 6.3.1 的模块化开发和 Starlight 主题的文档编写规范。同时新增的AI创业内容开发需要遵循创业验证和内容营销的最佳实践。

**章节来源**
[.agents/skills/wechat-article-write/EXTEND.md:29-38](file://.agents/skills/wechat-article-write/EXTEND.md#L29-L38)
[skills-lock.json:1-234](file://skills-lock.json#L1-L234)

### Astro 框架现代化配置
系统现已集成 Astro 6.3.1 和 Starlight 主题，提供以下现代化特性：

- **静态站点生成**：Astro 6.3.1 提供了更高效的静态站点生成能力和更好的性能表现
- **Starlight 主题**：专业的文档网站主题，支持多语言、侧边栏导航、搜索和响应式设计
- **SEO 优化**：内置 SEO 支持，包括 Open Graph 图像、RSS 订阅和结构化数据
- **开发体验**：现代化的开发工具链，支持热重载和快速迭代
- **性能优化**：自动代码分割、资源优化和懒加载支持

**章节来源**
[astro.config.mjs:1-285](file://astro.config.mjs#L1-L285)
[package.json:1-19](file://package.json#L1-L19)

### AI创业内容分类体系
项目现已建立完整的AI创业内容分类体系：

- **AI行业洞察**：商业模型、公司战略、产业经济学、行业趋势
- **AI编程实践**：AI编码工具、工程方法论、开发提效与技术债务  
- **Agent与工具链**：Agent架构设计、MCP协议、测试验证、记忆系统
- **AI创业方法论**：Idea阶段验证、Launch&Scale创始人瓶颈、AI经济学分析

**章节来源**
[src/content/docs/articles/ai-industry.mdx](file://src/content/docs/articles/ai-industry.mdx)
[src/content/docs/articles/ai-coding.mdx](file://src/content/docs/articles/ai-coding.mdx)
[src/content/docs/articles/ai-agents.mdx](file://src/content/docs/articles/ai-agents.mdx)