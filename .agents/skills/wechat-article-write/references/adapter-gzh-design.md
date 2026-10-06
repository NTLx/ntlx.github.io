# 微信排版：gzh-design

当 Step 5 prepare 已生成 `article-wechat-source.md` 且需要 HTML 时，Main 直接调用并完整执行
`.agents/skills/gzh-design/SKILL.md`，并在调用中明确“直接排版 / 全自动模式，不再提问”。输入是微信
source 与本地图片；主题选择、文章类型、组件配方、模板骨架、关键词标记、原生 validator、preview
和原生输出命名全部以当前安装的 `gzh-design` Skill 为权威。Main 不得手写一个简化 HTML 来代替它。

`gzh-design` 先按自己的输出契约在 post 目录生成：

```text
article-wechat-source_排版_<主题中文名>(<theme-id>).html
article-wechat-source_排版_<主题中文名>(<theme-id>)_预览.html
```

父管线 finalize 在验证通过后才把这一对原生产物复制为稳定发布名
`article-wechat.html` / `article-wechat_预览.html`。

## Content preservation contract

Presentation may change; substantive article content may not. Theme/component may wrap, split, or visually
promote source content, but MUST NOT replace source-visible claims, omit paragraphs, invent factual body text,
insert placeholder copy, or replace paragraph text with generated labels。`article-wechat-source.md` 中的实质正文、
代码、URL、数字和专名必须保留。

同时，**gzh-design 自己规范要求的 presentation metadata 明确允许新增**，不能再被父契约误判为“正文注入”。
允许范围仅限当前 Skill / 当前主题定义或由 source 直接派生的展示文字，例如：章节序号、由章节标题派生的
英文标签、导读/目录中的 source-derived 标题摘要、主题组件 label、`END`、作者区与固定 CTA。它们不得引入
新的事实主张，也不得替代原文内容。除此之外的新增正文仍然禁止。

## Parent validator policy

When gzh-design is invoked by `wechat-article-write`:

- Native gzh-design ERROR count must be 0.
- Native WARNING is advisory unless it indicates actual platform breakage.
- Do not mutate source-visible article text solely to eliminate a WARNING.
- Content preservation takes precedence over cosmetic warning cleanup.
- Source-derived punctuation and literal characters are immutable.

以下 source-derived visible content 必须逐字保持：ASCII apostrophe、ASCII quote、full-width / half-width
source punctuation、identifiers、environment variables、URLs、code literals、numbers、English proper
names 和 Markdown-derived visible text。例如 `Lenny's`、`OPENAI_API_KEY`、`foo_bar`、
`https://x.com/romanugarte_/...` 都不得为消除 WARNING 而改写字符。

ERROR 是 blocking Gate；包括 platform-breaking markup、unsupported CSS、缺失必要 markup 或 native
validator non-zero。WARNING 默认不阻断 Parent workflow；只要 source-visible text 与 source 一致，
半角标点、ASCII quote、英文 apostrophe 和中英文混排字符可以保留。

调用 capsule 必须明确包含：

```text
Mode:
- 直接排版 / 全自动模式，不再提问
- 完整执行当前 gzh-design/SKILL.md，不得简化为普通 Markdown→HTML 转换

Input:
- article-wechat-source.md
- local imgs/

Native output:
- article-wechat-source_排版_<主题中文名>(<theme-id>).html
- matching _预览.html

Project constraints:
- preserve all substantive H2 order
- preserve paragraph/list/code semantics
- preserve image order
- preserve image section placement
- preserve source local image basenames
- img src must continue to use imgs/<basename>
- do not replace body image src with CDN URL
- 00-infographic-core-summary remains the first body visual
- no ordinary <a href>
- external links appear as visible plain-text URLs
- presentation metadata required by the selected gzh theme is allowed and expected
```

HTML body images must preserve the same local `imgs/<basename>` used by `article-wechat-source.md`.

项目边界：保留全部 substantive H2、paragraph/list/code semantics、图片顺序和 section placement；
`00-infographic-core-summary` 继续是 lead visual。封面只作为微信缩略图，不重复嵌入正文。微信正文链接使用可见纯文本 URL，
HTML 不使用普通 `<a href>`。作者事实从本技能 `EXTEND.md` 读取：`NTLx`、`热衷于分享 AI 观察与干货`。

实测高频失败点（调用时必须写明）：

- 加载技能后必须继续执行到产出 `article-wechat.html`；只加载不交付视为未完成。
- source 的可见文字逐字保留：整段改造成引用卡片或金句卡时，不得丢弃归因句、引导句。
- 不得做字符级替换：不把 `'` 转成 `’`，不做全角/半角转换。gzh-design 自身对半角标点的 WARNING 在
  英文专名（如 `Lenny's`）处按本仓库 parity 契约保留原样，不要为消除 WARNING 改写字符。

排版完成后运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug> --finalize-only
```

gzh-design 调用必须先完成其原生 validator 和 preview。随后 finalize 会发现唯一一对原生 clean/preview
产物，并对原生 clean HTML 运行本仓库 structural/integrity 与 design-fidelity Gates；全部通过后才生成
稳定发布名。父管线不调用第三方 Skill 内部脚本，也不修饰、不重排、不重写 gzh HTML。

## Owner-local repair

如果 Parent finalize 首次报告 gzh-design 产生的 native-validator 或 structural/integrity failure，Main 不丢弃
当前原生 clean HTML。Main 将以下输入交回同一 `gzh-design` Skill：

- frozen `article-wechat-source.md`；
- current `article-wechat-source_排版_<主题中文名>(<theme-id>).html`；
- matching preview；
- bounded parent diagnostic（failure class、counts、samples）；需要更多上下文时按 section 查看本地 source/HTML。

执行最小的 content-preserving repair，然后重新运行 native validator、preview 和 parent finalize。
不得重新设计未受影响的 section，不得改变 theme；除非局部 defect 无法安全修复，否则不得整页重新
生成。repair 不得修改 source、draft、visual-draft、image-map 或 Step 3 / Step 4 artifact；若 diagnostic
证明错误来自上游，必须回到真正 owner，不能由 gzh-design 补写内容。

首次失败后只做一次局部修复并重跑 Gate。同一 failure class 再次失败即 `BLOCKED`，
报告 owner、原文片段和已尝试的修复，不继续盲目重做。只有诊断明确局部修复不可行、且已有不同
修复依据时，才允许从 frozen source 重建一次；仍失败即 `BLOCKED`。这是同一 workflow 中的
Skill 重试，不创建新的 Agent context，不轮换主题。Main 不得以脚本或手工编辑代替 gzh-design，也不得
把微信 source 直接发布；稳定名 `article-wechat.html` 只能由 finalize 从验证通过的原生产物生成。

## Repair priority

```text
1. preserve source text
2. restore missing content
3. restore structural placement
4. restore image topology
5. restore code literal content
6. satisfy platform HTML ERROR rules
7. presentation polish
8. advisory warnings
```

例如 missing substantive block 时定位对应 section 并恢复该 block；image 跨 section 时只移动该
image wrapper；字符或 code indentation 变化时只恢复 source literal。
