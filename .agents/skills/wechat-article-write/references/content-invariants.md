# 内容不变量

## Frontmatter

`draft.md` 与博客发布前的 `article.md` 保留 `title`、`date`、`summary`、`category`、
`blogSlug`、`coverImage`、`sourceUrl`；存在外部原始来源时保留 inline array 字段
`primarySourceUrls`。`summary` 是微信 digest 唯一来源，控制在 120 字内；
`blogSlug` 为 ASCII kebab-case；默认 `sourceUrl` 是
`https://ntlx.github.io/articles/{blogSlug}`。教程可有 `targetPath`，但 sourceUrl 仍须是合法公网 URL。

`sourceUrl` 是本站 article canonical URL，供 pipeline / WeChat publishing 使用；
`primarySourceUrls` 是本文直接原始写作材料的 provenance，用于跨文章 exact identity 去重。两者
不能互换。`primarySourceUrls` 不是 `## 参考资料` 的全部 URL：背景资料、站内文章、补充 benchmark、
图片 URL 和其它 supporting references 不得放入该字段。
该字段为 optional；字段存在时必须至少包含一个合法 URL。没有 URL 类型 primary source 时应省略字段，
而不是写空数组。

`publish-blog.mjs` 仍按现有规则从公开博客 Markdown 删除 `sourceUrl`、`blogSlug`、`coverImage`；
`primarySourceUrls` 必须持久化在公开 Markdown 中。

正文不写 H1；Markdown 链接使用 inline 形式。博客轨保留可点击链接，微信 source 将链接转为可见纯文本 URL。
正文代码围栏及 whitespace-sensitive code 的内容和行序保持不变；博客构建遵守 MDX 安全，正文避免裸 `<` / `>`。

## Visual facts

`draft.md` contains no Markdown image nodes and is the immutable textual artifact after Step 3.
Source figures stay in materials until Step 4 integration; image syntax in code examples remains code. Step 4 starts by copying it exactly
into `visual-draft.md`; the latter contains the same article plus local Markdown image insertions.
Step 4 may add Markdown images but must not rewrite article prose, headings, URLs, quotes, code,
references, interaction, or semantic frontmatter fields. Removing the added image nodes must
recover the textual source; code and other whitespace-sensitive content remain intact.

Final body image references point inside `imgs/`, for example:

```markdown
![文章核心信息图](imgs/00-infographic-core-summary.png)

![机制示例](imgs/mechanism-example.png)
```

The lead infographic is unique, the first body image, and precedes the first substantive H2.
Body images are selected and inserted by `baoyu-article-illustrator`; source evidence provenance
remains in materials, the understanding brief, and article context. Final local rasters are the
visual facts; Specialist outline and prompt files are not business state.

## Humanization

Step 2 通过后，所有正常文章都实际执行 `humanizer-zh`。父 Agent 审阅 semantic drift；
Step 3 Gate 将最终 draft SHA256 写入 state。当前 draft hash 改变就重新打开 Step 3，
不得用任何 receipt 或“曾经调用过”的标记替代 fresh draft。

调用前将当前 draft 的事实、数字、URL、专名、引用、代码、关键判断、H2 作为保留合同
交给 Humanizer；完成后 Main 对照调用前内容检查，漂移处交回同一 Skill 定点恢复。Step 3 hash
只证明下游使用同一份最终 draft，不证明润色前后事实一致，也不替代这次内容审阅。

事实基线不在 draft 内部：漂移检查以润色前的 `draft.md` 为基准，因此无法发现「写进 draft 时
就没有来源支持」的主张。冻结前必须把 `draft.md` 的正文、标题和 frontmatter `summary` 与
`understanding-brief.md` 的事实账本对账，由 `validate-claims.mjs` 检查覆盖：账本之外的可证伪
主张（数量、时长、倍数、时间线、状态承诺、反事实基线、跨源同一性）只能改写或先登记来源片段。
该 Gate 证明覆盖、不证明真假，来源核对仍是 Main 的责任。

## Site memory and originality

Step 1.5 必须执行站内检索。写作时自然消费相关旧文，若无合适内容明确说明。原创增量、近期文章形式差异和策略例外以 `references/originality-policy.md` 与 `references/strategy-*.md` 为准。

## Gates

每个脚本只判断可可靠机器判断的事实：frontmatter、visual-draft parity、文件、MIME、cover 比例、
链接形态、代码/段落/H2 parity、HTML validator、artifact freshness 和 state。视觉语义、
文字正确性、构图和“是否值得配图”由 Agent 实际查看并判断。结尾是否互动、正文需要几张图、
原创增量多少和是否存在研究缺口由 Main / Specialist 判断，不以形式特征阻断。
