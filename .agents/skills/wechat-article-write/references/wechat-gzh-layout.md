# 微信排版（gzh-design）

Step 5 的微信排版不是脚本内建渲染，而是 **`step5-build.mjs` 预处理 + Agent 调用 `gzh-design` + `step5-build.mjs --finalize-only` 收尾**。

## 触发时机

- `step5-build.mjs` 输出 `phase: prepared`
- `posts/<date-slug>/article-wechat-source.md` 已生成
- `posts/<date-slug>/article-wechat.html` 还不存在

此时不要跳到 Step 6；必须先完成 `gzh-design` 排版。

## 执行顺序

1. 运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug> --prepare-only
```

2. 读取：

```text
posts/<date-slug>/article-wechat-source.md
```

3. 调用 `gzh-design`，输入：
- `article-wechat-source.md`
- `posts/<date-slug>/imgs/` 下的本地图片
- `cover.png` / `cover.jpg`（如主题需要首图感）

4. 排版判断规则：
- 默认优先 `留白禅意风`（`zen-whitespace`）
- 工具盘点、清单、轻量方法论优先考虑 `摸鱼绿`（`moyu-green`）
- 若文章明显更适合其他 `gzh-design` 内置主题，允许 Agent 自主切换
- 保留文章信息完整性，不删结论、不缩减事实材料
- 使用 `gzh-design` 自带组件与流程，不手写裸 HTML
- **作者签名**：gzh-design 的签名区默认使用 `{{作者名}}` / `{{简介}}` 占位符。本项目的固定作者信息：
  - 作者名：`NTLx`
  - 一句话简介：`热衷于分享 AI 观察与干货`
  
  调用 gzh-design 时，明确告知 Agent 将签名区的 `{{作者名}}` 替换为 `NTLx`、`{{简介}}` 替换为上述简介。不要用占位符，也不要让 Agent 自行猜测作者信息。

5. 保存产物：

```text
posts/<date-slug>/article-wechat.html
```

6. finalize：

```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug> --finalize-only
```

## 判定标准

- 以 `.agents/skills/gzh-design/scripts/validate_gzh_html.py` 的退出码为准
- validator 通过后才允许 `markStepDone(5)`
- 若开启预览，finalize 会生成 `article-wechat_预览.html`

## 禁止事项

- 不修改 `.agents/skills/gzh-design/` 下任何文件
- 不回退到 `baoyu-markdown-to-html`
- 不把 `article-wechat-source.md` 直接拿去发布
