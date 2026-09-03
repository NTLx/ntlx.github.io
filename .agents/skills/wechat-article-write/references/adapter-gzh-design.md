# 微信排版：gzh-design

当 Step 5 prepare 已生成 `article-wechat-source.md` 且需要 HTML 时，读取并完整执行
`.agents/skills/gzh-design/SKILL.md`。输入是微信 source 与本地图片，输出固定为
`posts/<date-slug>/article-wechat.html`；让它自己选择主题、组件、HTML 结构并运行 validator/preview。

项目边界：保留全部 substantive H2、paragraph/list/code semantics、图片顺序和 section placement；
`SLOT_IMG_00` 继续是 lead visual。封面只作为微信缩略图，不重复嵌入正文。微信正文链接使用可见纯文本 URL，
HTML 不使用普通 `<a href>`。作者事实从本技能 `EXTEND.md` 读取：`NTLx`、`热衷于分享 AI 观察与干货`。

排版完成后运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug> --finalize-only
```

gzh-design 委托必须先完成其原生 validator 和 preview；随后 finalize 只运行本仓库的
structural/integrity Gate，并且只读 `article-wechat.html`。任何失败都回到 gzh-design
重新生成，不在父层修补 child 输出。
不要用 post-local renderer 替代 gzh-design，也不要把微信 source 直接发布。
