# 第三方技能本地补丁

`baoyu-post-to-wechat` 由 `npx skills` 管理，升级后可能覆盖本地补丁。当前项目依赖：

- 基准版本：`baoyu-post-to-wechat` SKILL frontmatter `version: 1.118.0`
- 补丁文件：`.agents/skills/baoyu-post-to-wechat/scripts/wechat-api.ts`
- 补丁能力：支持 CLI 参数 `--source-url`，并写入微信公众号草稿 API 字段 `content_source_url`
- 调用方：`scripts/publish-wechat.mjs` 从 `article.md` frontmatter 读取 `sourceUrl` 并传入

检查：

```bash
bun run .agents/skills/wechat-article-write/scripts/check-deps.mjs --stage publish
```

缺少补丁时禁止发布微信草稿。
