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

4b. **参考资料与延伸阅读 HTML 输出规范**：

   `article-wechat-source.md` 中的 `## 参考资料` 和 `## 延伸阅读` 区域已经过 `wechat-link-normalizer.mjs` 处理——Markdown 链接 `[标题](URL)` 被展开为"标题 + 纯文本 URL"格式。调用 `gzh-design` 时，须确保这两个区域的 HTML 输出遵守以下规则：

   - **禁止** `<a href>` 标签。微信公众号不支持可点击超链接，`<a href>` 会导致 URL 信息丢失。
   - 每条参考/延伸阅读项渲染为两个 `<p>` 元素：标题行 + URL 行。
   - URL 必须是读者可见的纯文本，不能隐藏在属性中。

   **正确的 HTML 结构示例**：

   ```html
   <section style="padding: 14px 0;border-bottom: 1px solid #E8E8E8;">
     <p style="font-size: 13px;color: #2B2B2B;margin: 0 0 4px;line-height: 1.7;font-weight: 500;">
       <span leaf="">The Memory Heist — Ayush Paul</span>
     </p>
     <p style="font-size: 12px;color: #A3A3A3;margin: 0;line-height: 1.5;word-break: break-all;">
       <span leaf="">https://www.ayush.digital/blog/the-memory-heist</span>
     </p>
   </section>
   ```

   **错误示例**（会导致微信读者看不到链接）：

   ```html
   <!-- 禁止：URL 隐藏在 href 属性中 -->
   <p><a href="https://example.com">标题</a></p>
   ```

   如果 `gzh-design` 排版后发现参考资料区域仍有 `<a href>`，说明 `article-wechat-source.md` 的链接规范化失败，应回到 Step 5 预处理阶段排查 `wechat-link-normalizer.mjs`。

5. 保存产物：

```text
posts/<date-slug>/article-wechat.html
```

6. finalize：

```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug> --finalize-only
```

## 格式步（baoyu-format-markdown）的边界

Step 3 调 `baoyu-format-markdown` 时，只做**结构化最小格式化**（标题 / 段落空行、列表语法规范），**不要给正文加 inline 加粗**。原因：① 微信端的关键词强调由 Step 5 的 `gzh-design` 统一做（每段 1–3 个下划线标记），现在加粗 = 与主题强调叠加、双重强调；② 对 `留白禅意风` 这类克制主题，满篇加粗直接破坏留白气质。另该 format 脚本有已知副作用（改列表标记、转义下划线），所以越少让它动越好——能不动就不动是合格结果。

## 封面与参考区的固定约定

- **封面 `cover.png` 只作微信缩略图，不进正文**：正文首图用 SLOT 00 信息图。`article-wechat.html` 里不要嵌 cover，否则首屏重复一张图。
- **参考资料 / 延伸阅读 用"纯文本两行块"**：源文件里这两块已是 `标题 + 换行 + URL`（无 Markdown 链接）。排版时每条渲染成"标题 `<p>` + URL `<p>`"，URL 必须是肉眼可见的纯文本，**严禁 `<a href>`**（微信不支持可点超链接，href 会让 URL 丢失）。`gzh-design` 装配时，把 `（链接：URL）` 这类行内纯文本也原样当文本抄进 `<span leaf>`，**不要再包成锚点**。
- **从 wechat-source 抄文本进 HTML 时，URL 原样照抄、不要二次转义**：历史上 `wechat-link-normalizer` 会把 URL 里的 `.` / `_` 转义成 `\.` / `\_`（为保持 markdown 合法），但 HTML 里没有反斜杠转义，照抄就会显示一个多余的反斜杠（`www\.xxx`、`\_extras`）。该转义已修复；若仍看到，按"只改 `<span leaf>` 内文本"的原则去掉反斜杠，**绝不**对整篇做引号 / 转义全局替换（那会把 HTML 属性的 ASCII 引号也毁掉，导致 wechat-api 的 `<img>` 正则失配、图片全上传失败）。

## 判定标准

- 以 `.agents/skills/gzh-design/scripts/validate_gzh_html.py` 的退出码为准
- validator 通过后才允许 `markStepDone(5)`
- 若开启预览，finalize 会生成 `article-wechat_预览.html`

## 禁止事项

- 不修改 `.agents/skills/gzh-design/` 下任何文件
- 不回退到 `baoyu-markdown-to-html`
- 不把 `article-wechat-source.md` 直接拿去发布
