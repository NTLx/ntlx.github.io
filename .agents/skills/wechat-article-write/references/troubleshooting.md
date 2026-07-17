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
| Step 5 卡在 prepared | 这是正常状态，表示 `article.md` 和 `article-wechat-source.md` 已生成，但还没跑 `gzh-design`。先生成 `article-wechat.html`，再执行 `step5-build.mjs --finalize-only` |
| gzh validator 失败 | 直接看 `.agents/skills/gzh-design/scripts/validate_gzh_html.py` 输出，修正 `article-wechat.html` 后重跑 `--finalize-only` |
| `_预览.html` 缺失 | 检查 `gzh-design/scripts/wrap_preview.py` 是否存在，或确认 `wechat_layout_generate_preview` 是否被关闭 |
| CWD 错误 | 回项目根目录 `/home/lx/ntlx.github.io` 后重跑 |

## Step 6.2 publish-wechat 退出码速查

| 退出码 | 含义 | 修复方法 |
|---|---|---|
| 2 | 前置条件缺失（article.md / article-wechat.html / cover / frontmatter 字段缺失） | 按错误提示补全文件或字段，重跑 `publish-wechat.mjs` |
| 3 | sourceUrl 探活失败（仅 `--no-skip-deploy-check` 时触发） | 等待 GitHub Pages 部署完成后重试；默认 `--skip-deploy-check` 不会触发此码 |
| 4 | 发布脚本（wechat-api.ts）失败或依赖检查失败 | 查看 wechat-api 输出；若依赖缺失先跑 `check-deps.mjs --stage publish` |
| 5 | HTML 属性含 Unicode 花弯引号（U+201C/U+201D），或 img src 不可解析 | 见下方"花弯引号修复"流程 |

### 花弯引号修复（exit 5）

**症状**：`publish-wechat.mjs` 报 `HTML 属性中含 Unicode 花弯引号` 并 exit 5。

**根因**：编辑 `article-wechat.html` 时引入了 Unicode 花弯引号 `""`（U+201C/U+201D）到 HTML 属性中，导致 `wechat-api.ts` 的 regex 无法匹配 `<img src="...">` 标签，图片全部上传失败。

**修复方法**（只替换 HTML 标签属性内的引号，不动正文文本）：

```python
python3 -c "
import re
fp = 'posts/<date-slug>/article-wechat.html'
html = open(fp).read()
def fix(m):
    return m.group(0).replace('“','\"').replace('”','\"').replace('‘',\"'\").replace('’',\"'\")
html = re.sub(r'<[^>]+>', fix, html)
open(fp, 'w').write(html)
"
```

**禁止**：全局替换整个 HTML 文件中的引号。正文 `<span leaf="">` 内的中文弯引号 `""` 是正确的中文排版标点，不要动。

### 修复后重发布标准路径

当 `article-wechat.html` 需要修复（无论是花弯引号、`<a href>` 残留还是 validator 错误）时：

1. 修复 `article-wechat.html` 中的问题
2. 重新运行 finalize 校验：
   ```bash
   bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug> --finalize-only
   ```
3. finalize 通过后，重新发布：
   ```bash
   bun run .agents/skills/wechat-article-write/scripts/publish-wechat.mjs <date-slug>
   ```

不要跳过 `--finalize-only` 直接发布——它会运行 `validate_gzh_html.py` 和 `stripWechatAnchors` 防护确认修复有效。

## 依赖检查

```bash
bun run .agents/skills/wechat-article-write/scripts/check-deps.mjs --stage all
```

`images` 阶段只检查图片模板和图片技能；`build` 阶段检查 Step 5 的 `gzh-design` / 图床依赖；`publish` 阶段只检查微信发布依赖。
