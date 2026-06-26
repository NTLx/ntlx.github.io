# 排错速查

## 通用原则

1. 先读报错对应脚本的校验函数，再改文件。
2. 验证失败后只重跑当前 Step，不跨过门控。
3. 复杂文本/HTML 修改优先使用解析器或现有脚本，不写临时内联脚本。
4. 路径使用绝对路径或从项目根目录运行。

## 常见问题

| 问题 | 处理 |
|---|---|
| `summary` 缺失 | 补 ≤120 字金句式摘要 |
| `sourceUrl` 缺失 | 按 blogSlug 写博客公网 URL；tutorial 用已有博文 URL |
| 文内图不足 | 补足至少 3 个 `SLOT_IMG_01+`，放在内容节点附近 |
| step4 报 Missing images 但 imgs/ 有图 | 生图落盘成随机名，命名断裂。多模态识别后跑 `align-image-names.mjs` 归位，勿重生 |
| prompt 模板缺失 | 先跑 `check-deps.mjs --stage images`，不要静默降级 |
| 图床 ETIMEDOUT | Step 5 内置重试；若 `image-map.json` 完整，用 `--reuse-image-map` |
| CWD 错误 | 回项目根目录 `/home/lx/ntlx.github.io` 后重跑 |

## 依赖检查

```bash
bun run .agents/skills/wechat-article-write/scripts/check-deps.mjs --stage all
```

`images` 阶段只检查图片模板和图片技能；`publish` 阶段只检查微信发布依赖。
