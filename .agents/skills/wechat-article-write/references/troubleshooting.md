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
| step4 只输出 normalize 后报 cover missing | 封面必须在 post 根目录 `cover.png` / `cover.jpg`。若生成到 `imgs/00-cover.png` 或 `imgs/cover.png`，重跑 `step4-images.mjs` 会自动归位；若根目录已有封面，重复封面会移入 `imgs/_discard/` |
| Codex CLI `lock_busy` | 若报 `Failed to acquire lock` 且指向 `/home/lx/.cache/baoyu-codex-imagegen/codex-exec.lock`，先确认没有 `codex exec` / `baoyu-image-gen` 进程仍在跑，再 `rm -f /home/lx/.cache/baoyu-codex-imagegen/codex-exec.lock` 并串行重试 |
| 发现 `batch.json` | 本管线禁止 batch 模式。删除 post 根目录或 `imgs/` 下的 `batch.json`，按 `image-policy.md` 的逐张串行命令重跑 |
| prompt/image basename mismatch | 生图输出名必须与 `imgs/prompts/NN-desc.md` 去掉 `.md` 后一致；例如 `00-infographic-core-summary.md` 对应 `imgs/00-infographic-core-summary.png`，不能写成 `00-infographic.png` |
| prompt 模板缺失 | 先跑 `check-deps.mjs --stage images`，不要静默降级 |
| 图床 ETIMEDOUT | Step 5 内置重试；若 `image-map.json` 完整，用 `--reuse-image-map` |
| CWD 错误 | 回项目根目录 `/home/lx/ntlx.github.io` 后重跑 |

## 依赖检查

```bash
bun run .agents/skills/wechat-article-write/scripts/check-deps.mjs --stage all
```

`images` 阶段只检查图片模板和图片技能；`publish` 阶段只检查微信发布依赖。
