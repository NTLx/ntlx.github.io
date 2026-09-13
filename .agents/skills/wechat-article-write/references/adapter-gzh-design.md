# 微信排版：gzh-design

当 Step 5 prepare 已生成 `article-wechat-source.md` 且需要 HTML 时，Main 直接调用并完整执行
`.agents/skills/gzh-design/SKILL.md`。输入是微信 source 与本地图片，输出固定为
`posts/<date-slug>/article-wechat.html`；让 Skill 自己选择主题、组件、HTML 结构并运行 validator/preview。

## Content preservation contract

Presentation may change; visible article content may not. Theme/component may wrap existing content and add
styling, but MUST NOT replace source-visible text, invent body-visible placeholder text, insert keyword
placeholder labels, or replace paragraph text with generated labels。正文区域的可见文字必须来自
`article-wechat-source.md`，或来自明确允许的固定 metadata（`author`、`author bio`）。不得注入正文可见占位文字。

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
Input:
- article-wechat-source.md
- local imgs/

Output:
- article-wechat.html
- preview

Project constraints:
- preserve all substantive H2 order
- preserve paragraph/list/code semantics
- preserve image order
- preserve image section placement
- preserve source local image basenames
- img src must continue to use imgs/<basename>
- do not replace body image src with CDN URL
- SLOT00 remains lead visual
- no ordinary <a href>
- external links appear as visible plain-text URLs
```

HTML body images must preserve the same local `imgs/<basename>` used by `article-wechat-source.md`.

项目边界：保留全部 substantive H2、paragraph/list/code semantics、图片顺序和 section placement；
`SLOT_IMG_00` 继续是 lead visual。封面只作为微信缩略图，不重复嵌入正文。微信正文链接使用可见纯文本 URL，
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

gzh-design 调用必须先完成其原生 validator 和 preview；随后 finalize 只运行本仓库的
structural/integrity Gate，并且只读 `article-wechat.html`。

## Owner-local repair

如果 Parent finalize 首次报告 gzh-design 产生的 structural/integrity failure，Main 不丢弃当前 HTML。
Main 将以下输入交回同一 `gzh-design` Skill：

- frozen `article-wechat-source.md`；
- current `article-wechat.html`；
- full local parent diagnostic。

执行最小的 content-preserving repair，然后重新运行 native validator、preview 和 parent finalize。
不得重新设计未受影响的 section，不得改变 theme；除非局部 defect 无法安全修复，否则不得整页重新
生成。repair 不得修改 source、draft、image-map、image-plan 或 Step 3 / Step 4 artifact；若 diagnostic
证明错误来自上游，必须回到真正 owner，不能由 gzh-design 补写内容。

如果 local repair 仍失败，Main 可以从 frozen source 再调用一次 gzh-design；同一 failure class 再次
失败即 `BLOCKED`。这是同一 workflow 中的 Skill 重试，不创建新的 Agent context。不得第三次自动 retry
或轮换主题。Main 不得以脚本或手工编辑代替 gzh-design，也不得把微信 source 直接发布。

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
