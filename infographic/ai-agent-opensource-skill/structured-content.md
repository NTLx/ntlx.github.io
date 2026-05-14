# AI Agent 时代的开源贡献问题：Hugging Face 用一份 Skill 教 AI 学会「不写」

## Overview
AI Agent 正在淹没开源社区。PR 量暴增十倍，维护者审查带宽没有增长。Hugging Face 用一份 15000 字的 Skill 教 Agent 学会「不写」——核心是约束而非指令。

## Learning Objectives
The viewer will understand:
1. AI Agent 带来的开源危机：贡献量 vs 审查带宽的失衡
2. Skill 的「不」字诀：通过约束而非指令解决质量问题
3. 独立测试与验证机制：不信任 Agent 的自我评估

---

## Section 1: 10 亿程序员的代价（Hero Cell）

**Key Concept**: AI 让人人都能写代码，但维护者的审查带宽没有跟着涨。

**Content**:
- "我们瞬间从 3000 万程序员变成 10 亿程序员" — Jensen Huang
- cURL 漏赏计划：运行 6 年、支付 8.6 万美元，因 AI slop 终止
- 16 小时内收到 7 份 AI 生成的漏洞报告，全部是垃圾
- 92% 开发者已在使用 AI 编程工具
- 45% AI 生成代码未通过安全测试

**Visual Element**:
- Type: 大数字 + 警示图标
- Subject: 3000万 → 10亿 的巨大跃迁，配以 PR 洪流的视觉隐喻
- Treatment: 大字号突出关键数据，sepia 色调

**Text Labels**:
- Headline: "10 亿程序员的代价"
- Big Number: "3000万 → 10亿"
- Sub-label: "PR 量暴增十倍，审查带宽没涨"
- Data point: "92% 开发者已用 AI 编程"
- Data point: "45% AI 代码未通过安全测试"

---

## Section 2: 不是代码的问题，是理解的问题

**Key Concept**: Agent 缺的不是写代码能力，是理解代码库隐式约定的能力。

**Content**:
- transformers 库的代码是人与人之间的沟通方式
- 设计哲学：扁平层级、清晰可读、不过度抽象
- transformers 已成为模型定义的"事实来源"（source of truth）
- Agent 不知道代码库的设计哲学，会按"最佳实践"改得面目全非

**Visual Element**:
- Type: 对比图 — 人理解代码库 vs Agent 理解代码库
- Subject: 左侧：人拿着放大镜看代码结构；右侧：Agent 只看到表面
- Treatment: 分栏对比，aged-academia 风格的手绘插图

**Text Labels**:
- Headline: "不是代码的问题，是理解的问题"
- Left: "人：理解设计哲学"
- Right: "Agent：只看代码能跑"
- Caption: "transformers = 事实来源"

---

## Section 3: Skill 的「不」字诀

**Key Concept**: 15000 字的 Skill，大部分是约束——教 Agent 学会说不。

**Content**:
- 不改共享工具——除非维护者明确同意
- 不加注释解释代码——审查者要同时读注释和代码更累
- 不提重构——没有被要求的改进就是添乱
- 不过早抽象——自包含的模型文件比精巧的继承结构好维护
- 不接受任何想法——维护者会 push back，你也要学会 push back
- Skill 包含近 15000 字

**Visual Element**:
- Type: 禁止符号列表 + 大数字
- Subject: 5 个「不」配以禁止符号，中间大字 "15000 字"
- Treatment: 每个「不」一个独立小格，sepia 禁止图标

**Text Labels**:
- Headline: "Skill 的「不」字诀"
- Big Number: "15000 字"
- Sub-label: "大部分是约束"
- List items: "不改共享工具" / "不加多余注释" / "不提重构" / "不过早抽象" / "不接受任何想法"

---

## Section 4: 审查者也是用户

**Key Concept**: 开源的瓶颈不是代码生成，是注意力。Skill 同时为贡献者和审查者设计。

**Content**:
- PR 代码严格遵循 mlx-lm 惯例——不是 Agent 自己喜欢，是 Skill 写的
- PR body 包含：架构差异总结、生成示例、数值对比、dtype 验证、逐层对比
- PR 必须披露是 agent 辅助的
- 不要把审查者意见直接丢回 Agent 处理
- "Agent 能一小时写十个 PR，但维护者要的是那一个值得读的"

**Visual Element**:
- Type: 注意力漏斗 / 箭头
- Subject: 十个 PR 洪流 → 一个值得读的 PR
- Treatment: 从多到少的视觉筛选

**Text Labels**:
- Headline: "审查者也是用户"
- Flow: "10 个 PR/小时 → 1 个值得读"
- Key point: "瓶颈不是代码生成，是注意力"
- Rule: "PR 必须披露 agent 辅助"

---

## Section 5: 独立测试：不信任自我评估

**Key Concept**: 不信任 Agent 的自我评估，设计独立验证机制。

**Content**:
- 独立于 Agent 的测试工具，消除 LLM 幻觉或过于乐观的疑虑
- 任何人都可下载并运行，保证可复现性
- 所有结果保存为 JSON 文件，包括逐层对比
- Claude Code 贡献了 49 个 CVE（11 个严重级别）
- "不是不信任你，是不信任任何自我评估"

**Visual Element**:
- Type: 验证链条 / 双重检查图标
- Subject: Agent 自评 → 独立验证 → 人工确认
- Treatment: 三步验证流程图

**Text Labels**:
- Headline: "独立测试：不信任自我评估"
- Flow: "Agent 自评 → 独立工具验证 → 人工确认"
- Data: "49 个 CVE，11 个严重级别"
- Quote: "不是不信任你，是不信任任何自我评估"

---

## Data Points (Verbatim)

### Statistics
- "3000万程序员变成10亿程序员" — Jensen Huang
- cURL 漏赏计划：运行6年、支付8.6万美元
- 16小时内收到7份 AI 生成的漏洞报告
- 92% 开发者已在使用 AI 编程工具
- 45% AI 生成代码未通过安全测试
- Claude Code 贡献了 49 个 CVE（11 个严重级别）
- Skill 包含近 15000 字

### Key Terms
- **Skill**: AI Agent 的配方文件，定义约束和行为规则
- **AI slop**: AI 生成的低质量内容/代码
- **事实来源 (source of truth)**: transformers 作为模型定义的权威参考
- **Test Harness**: 独立于 Agent 的测试验证工具

---

## Design Instructions

### Style Preferences
- aged-academia: 复古学术风格，sepia 色调，羊皮纸质感
- 手绘插图感，科学插画精度
- 编号标注，手写体标签

### Layout Preferences
- bento-grid: 模块化网格，混合格子大小
- Hero cell 用于核心论点（Section 1）
- 其余 4 个 section 均匀分布

### Other Requirements
- 16:9 宽高比
- 中文文本
- 输出路径：/Users/lx/Projects/ntlx.github.io/posts/2026-05-11-transformers-to-mlx/imgs/00-infographic-core-summary.png
