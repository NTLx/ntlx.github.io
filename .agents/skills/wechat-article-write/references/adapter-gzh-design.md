# 微信排版：gzh-design

当 Step 5 prepare 已生成 `article-wechat-source.md` 且需要 HTML 时，原生委托并完整执行
`.agents/skills/gzh-design/SKILL.md`。输入是微信 source 与本地图片，输出固定为
`posts/<date-slug>/article-wechat.html`；让它自己选择主题、组件、HTML 结构并运行 validator/preview。

委托 capsule 必须明确包含：

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

HTML body images must preserve the same local `imgs/<basename>` used by
`article-wechat-source.md`.

项目边界：保留全部 substantive H2、paragraph/list/code semantics、图片顺序和 section placement；
`SLOT_IMG_00` 继续是 lead visual。封面只作为微信缩略图，不重复嵌入正文。微信正文链接使用可见纯文本 URL，
HTML 不使用普通 `<a href>`。作者事实从本技能 `EXTEND.md` 读取：`NTLx`、`热衷于分享 AI 观察与干货`。

排版完成后运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug> --finalize-only
```

gzh-design 委托必须先完成其原生 validator 和 preview；随后 finalize 只运行本仓库的
structural/integrity Gate，并且只读 `article-wechat.html`。如果 validator/preview 或父层
Gate 失败，将实际诊断传回 gzh-design，从冻结的 `article-wechat-source.md` 重新生成；
失败的 HTML 是 disposable child output。Parent 不得 patch、`sed`、`perl` 或手工编辑
`article-wechat.html`，也不得用 post-local renderer 替代 gzh-design；不要把微信 source
直接发布。
