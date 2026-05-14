#!/usr/bin/env bash
# 阶段化校验脚本：在每个 Step 出口处统一执行
#
# 用法:
#   validate-pipeline.sh <date-slug> <stage>
#
# 支持 stage:
#   draft         : Step 2.4.1 质量门控（字数 / 互动 / 原文参考 / frontmatter / category 必填）
#   images        : Step 4 + 4.5 图片完整性
#   cdn           : Step 5 出口；article.md 内不残留本地 imgs/ 路径
#   html          : Step 8 出口；article.html 非空、含 inline CSS、所有 <img> 走 CDN
#   publish-blog  : Step 9 出口；src/content/docs/articles/<blogSlug>.md frontmatter 已转 Starlight 字段
#   publish-wechat: Step 10 进入前；cover 存在、sourceUrl 已部署
#
# 退出码: 0 通过；非 0 失败并打印原因

set -uo pipefail

slug="${1:-}"
stage="${2:-}"
if [[ -z "$slug" || -z "$stage" ]]; then
  echo "usage: validate-pipeline.sh <date-slug> <stage>" >&2
  exit 64
fi

posts_root="${PIPELINE_POSTS_ROOT:-posts}"
base="$posts_root/$slug"

fail() { echo "FAIL[$stage]: $*" >&2; exit 1; }
ok()   { echo "OK[$stage]: $*"; }

VALID_CATEGORIES=("ai-coding" "ai-agents" "ai-industry" "ai-models" "security" "engineering")

is_valid_category() {
  local c="$1"
  for v in "${VALID_CATEGORIES[@]}"; do [[ "$v" == "$c" ]] && return 0; done
  return 1
}

read_fm() {
  local file="$1" key="$2"
  [[ -f "$file" ]] || { echo ""; return; }
  bun run "$(dirname "$0")/set-frontmatter.mjs" "$file" get "$key" 2>/dev/null || echo ""
}

count_chars() {
  # 中文字符数：去掉 frontmatter 与代码块后，使用 Python 按 Unicode 码点计数。
  # 不再使用 `tr -d '[:space:]' | wc -m`：在 macOS 默认 locale 下 tr 会按字节切分 UTF-8
  # 多字节序列，导致中文字符被严重低估（实测 2250 字 → 210 字）。
  local file="$1"
  awk '
    /^---$/ { fm = !fm; next }
    fm { next }
    /^```/ { code = !code; next }
    !code { print }
  ' "$file" | python3 -c '
import sys, re
text = sys.stdin.read()
# 去掉所有空白字符（含全角空格、零宽字符等），再按 Unicode 码点计数
text = re.sub(r"\s+", "", text)
print(len(text))
'
}

case "$stage" in
  draft)
    f="$base/draft.md"
    [[ -f "$f" ]] || fail "draft.md missing: $f"
    title=$(read_fm "$f" title);    [[ -n "$title" ]] || fail "frontmatter.title 为空"
    date=$(read_fm  "$f" date);     [[ "$date" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]] || fail "frontmatter.date 不合法: $date"
    summary=$(read_fm "$f" summary);[[ -n "$summary" ]] || fail "frontmatter.summary 为空"
    cover=$(read_fm   "$f" coverImage);[[ -n "$cover" ]] || fail "frontmatter.coverImage 为空"
    src=$(read_fm     "$f" sourceUrl); [[ "$src" =~ ^https://ntlx\.github\.io/articles/.+ ]] || fail "frontmatter.sourceUrl 不合法: $src"
    category=$(read_fm "$f" category)
    [[ -n "$category" ]] || fail "frontmatter.category 缺失，请先执行 Step 2.5（suggest-category.mjs + set-frontmatter.mjs）"
    is_valid_category "$category" || fail "frontmatter.category=$category 不在白名单 ${VALID_CATEGORIES[*]}"
    grep -q '^## 原文参考' "$f" || fail "正文缺少 ## 原文参考 区块"
    chars=$(count_chars "$f")
    [[ "$chars" -ge 2500 ]] || fail "字数 $chars 少于 2500（硬性下限，扩展模式上限 3500）"
    grep -q '^# ' "$f" && fail "正文出现 H1 标题（Starlight 会重复渲染）"
    ok "draft 通过：title='$title' date=$date category=$category 字数≈$chars"
    ;;
  images)
    [[ -d "$base/imgs" ]] || fail "imgs/ 目录不存在"
    img_count=$(ls -1 "$base"/imgs/*.{png,jpg,jpeg,webp} 2>/dev/null | wc -l | tr -d ' ')
    [[ "$img_count" -ge 1 ]] || fail "imgs/ 内无图片"
    grep -q '<!-- SLOT_IMG_00' "$base/draft.md" || fail "draft.md 顶部未引用信息图占位符 SLOT_IMG_00"
    # 占位符与图片数量对齐
    slot_count=$(grep -cE '<!--\s*SLOT_IMG_' "$base/draft.md" || true)
    [[ "$slot_count" -le "$img_count" ]] || fail "占位符数 $slot_count > 实际图片数 $img_count"
    ok "images 通过：imgs=$img_count slots=$slot_count"
    ;;
  cdn)
    a="$base/article.md"
    [[ -f "$a" ]] || fail "article.md 不存在；先跑 apply-image-map.mjs"
    if grep -nE '!\[[^]]*\]\(imgs/' "$a"; then
      fail "article.md 仍有本地 imgs/ 路径残留"
    fi
    grep -qE '!\[[^]]*\]\(https?://' "$a" || fail "article.md 中未发现 CDN 图片链接"
    grep -q '<!-- SLOT_IMG_' "$a" && fail "article.md 中残留 SLOT_IMG_ 占位符"
    ok "cdn 通过：article.md 全部图片已替换为 CDN"
    ;;
  publish-blog)
    # blogSlug = date-slug 去掉 YYYY-MM-DD- 前缀
    blog_slug=$(echo "$slug" | sed -E 's/^[0-9]{4}-[0-9]{2}-[0-9]{2}-//')
    blog_root="${PIPELINE_BLOG_ROOT:-src/content/docs/articles}"
    f="$blog_root/$blog_slug.md"
    [[ -f "$f" ]] || fail "Starlight 目标文件不存在: $f （publish-blog.mjs 是否已执行？）"
    schema=$(read_fm "$f" '$schema')
    [[ "$schema" == "starlight" ]] || fail "frontmatter.\$schema 必须为 starlight，当前=$schema"
    desc=$(read_fm "$f" description); [[ -n "$desc" ]] || fail "frontmatter.description 缺失（应由 summary 重命名得到）"
    category=$(read_fm "$f" category); is_valid_category "$category" || fail "category 不合法: $category"
    coverImage=$(read_fm "$f" coverImage)
    [[ -z "$coverImage" ]] || fail "publish-blog 阶段不应保留 coverImage（仅微信侧使用）"
    src=$(read_fm "$f" sourceUrl)
    [[ -z "$src" ]] || fail "publish-blog 阶段不应保留 sourceUrl（仅微信侧使用）"
    # 正文不得残留本地 imgs/ 路径
    if grep -nE '!\[[^]]*\]\(imgs/' "$f"; then
      fail "$f 仍有本地 imgs/ 路径（应为 CDN URL）"
    fi
    ok "publish-blog 通过：$f description / category=$category 已就绪"
    ;;
  html)
    h="$base/article.html"
    [[ -f "$h" ]] || fail "article.html 不存在"
    [[ -s "$h" ]] || fail "article.html 为空"
    grep -q 'style=' "$h" || fail "article.html 缺少 inline CSS"
    if grep -nE '<img[^>]+src="imgs/' "$h"; then
      fail "article.html 仍含本地 imgs/ 路径（CDN 降级 rewrite 未生效？）"
    fi
    ok "html 通过：article.html 非空且 <img> 全部走 CDN"
    ;;
  publish-wechat)
    f="$base/article.md"
    [[ -f "$f" ]] || fail "article.md 不存在"
    [[ -f "$base/cover.png" || -f "$base/cover.jpg" ]] || fail "cover.png/cover.jpg 不存在"
    [[ -f "$base/article.html" ]] || fail "article.html 不存在"
    src=$(read_fm "$f" sourceUrl)
    [[ "$src" =~ ^https://ntlx\.github\.io/articles/.+/?$ ]] || fail "sourceUrl 非法: $src"
    # 探活 sourceUrl
    code=$(curl -fsSLI -o /dev/null -w '%{http_code}' --max-time 15 "$src" || echo 000)
    [[ "$code" == "200" ]] || fail "sourceUrl=$src 未就绪 (HTTP $code)；先跑 wait-pages-deployed.mjs"
    ok "publish-wechat 通过：cover / html / sourceUrl=$src (HTTP 200)"
    ;;
  *)
    echo "validate-pipeline.sh: unknown stage '$stage'" >&2
    exit 64
    ;;
esac
