# 内容不变量

## Frontmatter

`draft.md` 与博客 `article.md` 保留 `title`、`date`、`summary`、`category`、
`blogSlug`、`coverImage`、`sourceUrl`。`summary` 是微信 digest 唯一来源，控制在 120 字内；
`blogSlug` 为 ASCII kebab-case；默认 `sourceUrl` 是
`https://ntlx.github.io/articles/{blogSlug}`。教程可有 `targetPath`，但 sourceUrl 仍须是合法公网 URL。

正文不写 H1；Markdown 链接使用 inline 形式。博客轨保留可点击链接，微信 source 将链接转为可见纯文本 URL。
正文代码围栏及 whitespace-sensitive code 的内容和行序保持不变；博客构建遵守 MDX 安全，正文避免裸 `<` / `>`。

## SLOT topology

`<!-- SLOT_IMG_00_INFOGRAPHIC -->` 必须恰好一次，位于第一个 substantive H2 前，且是正文第一张视觉。
`SLOT_IMG_01+` 是正文 visual SLOT，使用 `01..N`，每个编号只能出现一次。正常长文
至少一个 body visual SLOT；典型 3-6 H2 reader-response 推荐 2-4 个。source 与
generated 都计入正文视觉覆盖，cover 与 SLOT00 不计入。真正短、结构简单且没有明显
对比、流程、机制或复杂关系的内容允许 0 个，但正常长文不能静默 0 图通过。
正式正文视觉统一由 `SLOT_IMG_01+` 表达；普通 Markdown 图片不计入 Visual Coverage
Gate。`SLOT` 表示正文中的语义视觉位置，`kind` 表示资产来源（`source` 或 `generated`）。
占位符描述具体说明附近内容，不使用泛化的 `chart`、`diagram` 或 `illustration`。

## Visual facts

Step 2 只记录 `draft.md` 中的 SLOT topology，不创建最终图片计划。Step 4 的
`image-plan.json` 只记录最终资产事实：

```json
{
  "cover": "cover.png",
  "images": [
    {"slot": "SLOT_IMG_00", "kind": "generated", "file": "imgs/00-infographic-core-summary.png"},
    {"slot": "SLOT_IMG_01", "kind": "source", "file": "imgs/01-source-example.png", "source": "https://example.com/source.png", "reason": "原图直接展示讨论的结果"}
  ]
}
```

`kind` 只能是 `source` 或 `generated`；source entry 必须有 source URL 和 reason。Gate 只验证 SLOT、basename、文件存在和 cover topology。

## Humanization

Step 2 通过后，所有正常文章都实际执行 `humanizer-zh`。父 Agent 审阅 semantic drift；
Step 3 Gate 将最终 draft SHA256 写入 state。当前 draft hash 改变就重新打开 Step 3，
不得用任何 receipt 或“曾经调用过”的标记替代 fresh draft。

## Site memory and originality

Step 1.5 必须执行站内检索。写作时自然消费相关旧文，若无合适内容明确说明。原创增量、近期文章形式差异和策略例外以 `references/originality-policy.md` 与 `references/strategy-*.md` 为准。

## Gates

每个脚本只判断可可靠机器判断的事实：frontmatter、SLOT、文件、MIME、cover 比例、
链接形态、代码/段落/H2 parity、HTML validator、artifact freshness 和 state。视觉语义、
文字正确性、构图和“是否值得配图”由 Agent 实际查看并判断。
