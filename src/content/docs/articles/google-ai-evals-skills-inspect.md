---
$schema: starlight
title: 给 Agent 加技能反而变蠢？Google 这套开源评测框架，把“体感测试”逼进了工业死角
description: 给智能体堆砌技能不是赋予超能力，而是拿宝贵的上下文带宽做确定性博弈。缺乏严密评测矩阵的 Skill，本质上是在用暴增的 Token 账单掩盖架构的平庸。
date: 2026-08-20
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-20-google-ai-evals-skills-inspect-img-00-infographic-core-summary.jpg)

在智能体开发圈子里，大家正在经历一场熟悉的狂欢：就像当年疯狂给 IDE 装插件、给浏览器塞扩展一样，开发者们也迫不及待地给 Agent 挂载各种 MCP Server、Agent Skill 和外部 Plugin。很多人的工作流极其粗放——写一个 `SKILL.md`，在本地终端里随手敲两句提示词测测，只要模型在某一次对话中成功调出了预期工具，就心满意足地宣布“大功告成”。

但这种基于“体感测试”（Vibes-based Testing）的错觉，往往在生产环境的真实负载面前瞬间瓦解。当你把包含数十个技能的 Agent 推向真实任务时，迎面而来的常常不是无所不能的超级助手，而是飙升 5 倍的 Token 账单、频繁触发的 300 秒容器超时，甚至原本基线模型能轻松答对的常识题，因为技能指令的上下文污染而频频翻车。

Google Cloud AI 的资深布道师 Katie McLaughlin 与团队近期在 Google DevRel 专栏发布了一份极具实战价值的评测方法论与开源套件，直面这个长久以来被忽视的痛点：**如何用严密的工程化手段，客观证明一个 Agent Skill 到底是在带来真实的能力跃升，还是在制造昂贵的系统负债？**

结合我们在站内探讨过的 [《1.5 万 Stars 背后：Google 揭秘 Agent Skills 的工业化构建与治理真相》](https://ntlx.github.io/articles/google-agent-skills-behind-the-scenes) 与 [《Agent 能跑 demo 不算本事，能跑一年才是》](https://ntlx.github.io/articles/agent-development-lifecycle)，这篇文章把 Agent 评测推向了真正的工业化基准线。

## 从“感觉良好”到“生产翻车”：为什么 Agent 开发必须告别“体感测试”？

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-20-google-ai-evals-skills-inspect-img-01-eval_matrix_dimensions.png)

大语言模型本质上是随机且具备非确定性的系统。单次对话给出的完美回答，很可能只是落在概率分布高处的侥幸；而一次微小的提示词调整，就可能在特定边界条件下引发不可预知的连锁故障。

对于普通的单轮问答（Chatbot），传统的基准测试（如 MMLU、GSM8K）尚能通过海量题库进行统计；但对于 Agent 而言，评估维度变得异常复杂。Agent 解决问题依赖的是在动态沙箱中进行的多轮工具调用（Tool Calls）、错误恢复、状态管理与环境交互。如果只看“最终有没有输出答案”，就会掩盖掉大量致命的系统裂纹：

- **无感知的成本爆炸**：模型为了回答一个简单配置，在容器里反复执行了 10 次冗余命令，消耗了 2000 个 Output Token；
- **隐性技能退化（Skill Regression）**：挂载了专业技能之后，由于技能文档中的描述与系统主提示词发生语义冲突，导致模型对基础任务的判断力反而下降；
- **休眠式假象（Dormant Skills）**：评测分数看似很高，但深入 Trace 发现模型根本没有加载该技能，完全在依赖自身预训练记忆作答。

Google 方案选择基于英国 AI 安全研究所（UK AISI）官方开源的 **Inspect AI** 框架与 **Inspect SWE** 扩展，将评测从一维的单点问答升级为一个三维矩阵空间：**被测模型（Models）× 技能挂载状态（Skill Conditions）× 任务样本（Samples）× 重复轮次（Epochs）**。

通过多轮次（N=2 及以上）的并发扫描（Sweep），把原本模糊的“体感好坏”收敛为具备置信区间的定量数据。

## 三层架构防御：如何用“弱模型”搭出一套不把主力配额打穿的评测流水线？

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-20-google-ai-evals-skills-inspect-img-02-macro_model_comparison.png)

在自动化评测系统中，最棘手的问题往往不是“怎么打分”，而是“如何避免评测系统自身因基础设施脆弱而崩溃”。在并行扫描数十个配置时，API 速率限制（Rate Limits）与配额耗尽（Quota Starvation）是每个开发团队的噩梦。

Google 在 `skills-eval.py` 的设计中确立了三层至关重要的工程防御架构：

### 1. 外部配置与提示词节约（Thrifty Execution）
评测逻辑与测试数据集必须物理隔离。所有测试题目、提示词与原子事实统一存放在 `questions.json` 中。动态系统提示词模板（`thrifty_system_prompt.txt`）在运行时完成严格的边界插值：
- 通过 `--time-limit 300` 强制注入 300 秒超时预算，掐断无休止的卡死重试；
- 通过 `-T web_access=false` 强行切断 Agent 的外部公网访问权限，彻底杜绝模型因抓不到有效页面而陷入无底洞般的递归搜索。

### 2. 算力保护与版本锁定（Fail-Fast & Pinning）
在大并发扫描下，微小的默认行为差异可能引发雪崩。例如，Gemini CLI 被测求解器若未显式指定版本（缺省为 `version="auto"`），每个并行子任务初始化时都会向 GitHub Release API 发送未认证的 HTTP 请求以探测最新版，瞬间触发 GitHub 的 `HTTP 403 Rate Limit Exceeded`。在评测脚本中显式将其固定为 `version="0.51.0"`，是保障高并发稳定运行的关键细节。同时，配套的日志清洗脚本维护了硬编码的 `MODEL_PRICING` 计费表，遇到未登记模型直接快速报错（Fail-Fast），绝不让脏数据污染成本报表。

### 3. 裁判模型解耦与二次方评分惩罚（Quadratic Score Curving）
很多团队评测 Agent 时喜欢“用最贵的模型评测一切”，但这会导致评测成本高昂且迅速耗尽生产配额。Google 的方案展现了一种极度务实的架构解耦：
- **被测模型（Solvers）** 使用前沿主力模型（如 `gemini-3.5-flash-lite` 和 `gemini-3.6-flash`）；
- **裁判模型（Grader）** 则固定降级使用轻量级上一代模型（如 `gemini-3.1-flash-lite`）。

为什么弱模型能当好考官？因为 Google 放弃了传统大段文本整体打分（Monolithic `model_graded_qa`）的模糊方式，将评判标准拆解为一组独立的**二元原子事实（Atomic Facts，Yes/No）**。弱模型判定单一事实是否成立的准确率极高，且完全消耗独立的次级配额池。

更精妙的是其评分衰减数学公式：
平均得分公式：mean score = (Σ score_i) / N，其中 score_i 为 0.0 或 1.0
二次方压缩公式：curved score = (mean score)²


通过平方衰减（Quadratic Curving），部分答对的半吊子方案会被施加严重的非线性惩罚。例如，一项包含 6 个原子事实的任务，若模型答对了 5 个（原始算术均值为 5/6 ≈ 0.8333），经二次方压缩后最终得分仅为 **0.65**。这种机制彻底粉碎了“看似差不多、实则埋着雷”的侥幸得分，逼迫开发者必须把 Skill 的 SOP 提炼得足够精准，唯有全对才能冲击 1.0 满分。

## 技能 vs 基线的 5 种诊断形态：你的 Skill 到底在提效还是在“负优化”？

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-20-google-ai-evals-skills-inspect-img-03-skill_activation_trace.png)

当运行完跨模型、跨技能的矩阵扫描后，对比搭载 Skill 的实验组与未搭载技能的 Baseline 对照组，数据通常会落入 5 种截然不同的诊断心智模型。学会识别这 5 种形态，是优化 Agent 架构的核心前提：

1. 🥇 **高效能力跃升（High-Efficiency Capability Lift - 最佳形态）**：准确率大幅提升，同时 Token 消耗与执行耗时显著下降。这表明 `SKILL.md` 提供了极其精准的标准作业程序，直接消除了模型盲目摸索与试错调试的死循环。
2. 🟢 **中效能力跃升（High-Efficiency Capability Lift - 良好形态）**：准确率明显提升，Token 消耗与耗时有温和增长。这说明 Skill 增强了模型的推理深度与检索覆盖面，增加的少许开销属于合理代价。
3. ⚠️ **代价膨胀的惨胜（Cost-Bloated Pyrrhic Victory - 危险信号）**：准确率仅微弱提升 5%~10%，但 Token 消耗与执行时间暴增数倍。这通常意味着 Agent 虽用上了技能，但在沙箱容器内陷入了低效的轮询或反复重试路径。
4. ⚪ **基线持平 / 多余技能（Baseline Parity / Superfluous Skill - 无效投入）**：搭载技能与未搭载技能的得分、延迟几乎完全一致。此时必须进入微观 Trace 检查：如果模型从未调用 `activate_skill`，说明技能的触发词与描述设计失败；如果调用了却无提升，说明技能内容与模型内置知识高度重叠。
5. 🔴 **上下文过载与技能负退化（Context Overload & Skill Regression - 最差形态）**：准确率不升反降，Token 账单与延迟同步飙升。这说明技能文档写得过于冗长、语义含糊，或者与系统基础指令冲突，反向干扰了模型的注意力聚焦。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-20-google-ai-evals-skills-inspect-img-04-quadratic_scoring_breakdown.png)

在 Inspect View 的微观 Trace 审计中，开发者必须养成“两看两查”的习惯：
- **查环境噪声 vs 模型死循环**：沙箱容器初始化崩溃、依赖未安装属于环境噪声，必须修复环境后重测；同一命令相同参数被重复调用则属于模型推理死循环；
- **查技能摄入（Skill Ingestion）与原子扣分**：确认每一道题到底是卡在哪个具体原子事实上，从而对症下药修改 `SKILL.md`。

## 从单机终端到团队看板：让 Agent 评测成为现代 CI/CD 的第一等公民

在单机开发时，`inspect view` 的交互式 Web 界面足以让工程师深入单个 Sample 进行精细调试。但当面临架构选型、多模型对比与团队汇报时，孤立的终端日志无法支撑群体协作。

Google 方案通过 `tocsv.py` 将所有非结构化评测日志提炼为平铺的增强型数据集（`data_mega_export.csv`），并注入了两个关键的数据科学审计指标：

1. **`completed`（排除了基础设施噪声的真实完备率）**：将因网络超时、容器退出导致的中断与纯模型能力解耦，精准暴露在配额受限条件下的幸存者偏差；
2. **`is_baseline_or_has_activated_skill`（贝叶斯技能采纳率）**：基于 Trace 事实判定模型是否主动激活了技能，从统计学上剔除“假装搭载、实则裸跑”的无效样本。

这份清洗后的数据可以直接对接到 Google Sheets（自动生成行内 Sparkline 迷你走势图）或 Looker Studio 看板。从此，向团队决策者或财务主管汇报选型理由时，拿出的不再是“我觉得这个模型加上这个技能挺好用”的主观推断，而是包含准确率增益、Token 边际成本、延迟分布与技能采纳率的完整 Pareto 前沿矩阵。

给智能体编写技能不是写散文，而是在为 LLM 编写确定性的状态机与执行契约。正如软件工程从“手工点点测”走向自动化单元测试一样，Agent 开发也正在跨越它的野蛮生长期。只有当我们将每一个 Skill 置于 Docker 沙箱、原子事实与二次方惩罚的严酷考验下，构建出的智能体才能真正走出玩具演示，具备跑满一整年的工业级韧性。

*你在给智能体开发或引入外部技能（Skill / MCP）时，是否遇到过搭载技能后反而调用超时或逻辑混乱的窘境？欢迎在评论区分享你的实测排坑经验。*

## 参考资料

- [Katie McLaughlin (@glasnt) — DEV Community Profile](https://dev.to/glasnt)
- [Inspect AI Repository — GitHub](https://github.com/UKGovernmentBEIS/inspect_ai)
- [Google Agent Skills Repository — GitHub](https://github.com/google/skills)
- [Designing AI Evals: Clarity Now and Visualization Next — DEV Community](https://dev.to/googleai/designing-ai-evals-clarity-now-and-visualization-next-4eii)
- [devrel-demos/inspect-agent-skills-eval — GitHub](https://github.com/GoogleCloudPlatform/devrel-demos/tree/main/agents/inspect-agent-skills-eval)
- [Inspect AI — UK AI Safety Institute](https://inspect.aisi.org.uk/)
- [Evaluate agent skills using open source frameworks — Google Codelabs](https://codelabs.developers.google.com/codelabs/evaluate-agent-skills-using-open-source-frameworks)
- [Agent Plugins Specification](https://agent-plugins.org/specification)
- [Harbor Framework — GitHub](https://github.com/harbor-framework/harbor)

## 延伸阅读

- [《1.5 万 Stars 背后：Google 揭秘 Agent Skills 的工业化构建与治理真相》](https://ntlx.github.io/articles/google-agent-skills-behind-the-scenes)
- [《Agent 能跑 demo 不算本事，能跑一年才是》](https://ntlx.github.io/articles/agent-development-lifecycle)
- [《Google 给 RAG 加的不是更多 Agent，而是停手判断》](https://ntlx.github.io/articles/google-agentic-rag-sufficient-context)
- [《别把 BioMCP 当成普通 MCP Server：AI Agent 的生物医学证据访问层解析》](https://ntlx.github.io/articles/biomcp-biomedical-evidence-layer)
