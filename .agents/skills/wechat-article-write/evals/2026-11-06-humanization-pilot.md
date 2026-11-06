# 2026-11-06 自然写作试点复盘

## 变更假设

- **Problem observed:** 相邻技术与读后感文章虽然有事实和独立判断，开头、过渡及结尾仍容易形成重复的修辞骨架；策略要求 3–6 个 H2 和“金句式 summary”，会强化这个倾向。
- **Affected editorial dimensions:** Language、Structure、Reader value；Fidelity 是不可回退的约束。
- **Expected improvement:** 让段落通过事实和读者问题推进，保留自然作者语气，减少模板化章节与摘要。
- **Likely tradeoff / regression risk:** 过度“去 AI 味”会削弱论证、技术词汇和证据边界；重写可能比原稿更机械。

## Skill 状态

- 使用 `npx skills update humanizer-zh -p -y` 更新 `op7418/Humanizer-zh`。安装文件的 revision 标识为 `2026-09-23`，更新侧重事实保真、风格边界和允许零改动。
- 使用 `npx skills add https://github.com/KKKKhazix/human-writing --skill human-writing -y` 安装候选 v1.1.0 到项目级 `.agents/skills/human-writing/`。未加入强制调用链；未安装 `shuorenhua`。
- 第三方 Skill 文件均由 `npx skills` 管理，不在本地改写。

## 受限 A/B/C 对照

在 `scratch/editorial-humanization-eval-20261106/` 内保留五篇文章的开头样本，每篇含 A/B/C 与差异记录：

| 案例 | 类型 | B（新版 Humanizer） | C（Human Writing + 新版 Humanizer） |
| --- | --- | --- | --- |
| `2026-11-06-better-work-better-workers` | 科研/管理 | 基本同等；少量改写更普通 | 改动顺序但“作者是否学会”收窄原意，未见明显阅读收益 |
| `2026-11-06-ai-context-blindness` | 技术分析 | 近似同等；“做错事”变成“做错决定”缩窄语义 | 来源前置，弱化了“AI 判断公司处境”这个核心问题 |
| `2026-11-05-supabase-agent-database` | 产品技术 | 少量语言简化，归因措辞出现歧义风险 | 重新排序但未增加实质认识，部分目标归因更强 |
| `2026-10-25-block-fable-review` | 观点/工程 | 变化很小 | 开头更像访谈摘要，反而失去 A 的个人切入感 |
| `2026-10-16-llm-eval-ci-gates` | 技术实践 | 句面略简，未改变论证 | 改写后的否决权比喻更直白，但仍重复已有观点；限定略弱 |

本次对照只覆盖开头数段，不包括完整文章、正文后半段、最终 HTML、读者盲评，也不能证明独立模型/不同采样的统计效果。五个案例已存在成熟原稿；重写既有好稿不能完全代表从零起草的收益。

### 编辑判断

- **Fidelity:** B 多数保留，仍有细微语义位移；C 存在更明显的限定与归因风险。
- **Reader value:** 未观察到 C 相对 B 的稳定增量。
- **Structure:** C 可更换信息顺序，但重排本身并不等于改善。
- **Language:** B 可作克制的局部润色；C 有时损失原稿的自然语气。
- **Visual explanation / Platform delivery:** 本次未评估；相关流程不修改。

**决定：不把 `human-writing` 设为自动/强制 Step 2 路由。** 后续如要试验从零起草，应对照同一事实账本做全篇成稿盲评，且不得强制执行候选中的标点、引语、关键词禁令。安装不意味着正式集成。

## 已采纳的低风险管线修改

`wechat-article-write` v4.13.1 将 reader-response 原本固定 3–6 个 H2、强制金句式 `summary` 的要求改为内容驱动，并统一放宽 tutorial、news-digest 的摘要修辞。保留必要 frontmatter、120 字建议、材料事实账本及原始来源要求；Step 3 仍强制读取和应用 Humanizer，但允许零改动。未动视觉、HTML 和发布链路。

## 验收

- `validate-architecture.mjs --json`：exit 0，ok。
- `check-deps.mjs --stage all --json`：exit 0，ok。
- `npm run test:agent`：exit 0，255 passed，0 failed（wechat 241，github-image-hosting 14）。
- `git diff --check`：exit 0。
- `bun test .agents/skills/wechat-article-write/__tests__`：Bun 将点目录路径当过滤条件，未发现测试（0 run，exit 1）；不作为测试失败，使用仓库现有 runner 完成回归。

## 尚未验证

真实新文章的自然度提升尚未被证明；需在后续一篇从零起草的文章中检查完整正文以及读者体验，再决定是否追加新的写作能力依赖。未提交或推送。
