#!/usr/bin/env bash
# ⚠️ DEPRECATED — 此脚本已不再被任何 Step 调用。
#
# 原因：博客轨只消费 Markdown（article.md + CDN URL），不生成 HTML；
# 微信轨使用 article-wechat.html（本地路径版），wechat-api.ts 直接读本地文件上传，
# 全程零 CDN 依赖。CDN 超时降级场景已不存在。
#
# 保留此文件仅供参考，可安全删除。
#
# === 以下为原始文档（已废弃） ===
#
# CDN → 本地路径降级编排
#
# 用法（两种风格均支持）:
#   run-with-cdn-fallback.sh <date-slug> <stage> -- <command...>
#   run-with-cdn-fallback.sh --post-dir posts/<date-slug> --stage <stage> -- <command...>
#   run-with-cdn-fallback.sh --slug <date-slug> --stage <stage> -- <command...>
#
# 参数:
#   date-slug : posts/<date-slug> 目录名
#   --post-dir: posts/<date-slug>（脚本会从中提取末段目录名作为 slug）
#   --slug    : 与 date-slug 等价的命名参数
#   --stage   : html | wechat | publish (用于决定降级文件名 / 是否需要 html 回写)
#   command   : 实际要执行的命令；命令内出现的 {ARTICLE_MD} 将被替换为
#               article.md (CDN) 或 article-local.md (本地降级)
#
# 行为:
#   1. 用 article.md 跑命令；
#   2. 若退出码 != 0 且 stderr/stdout 命中 timeout/ETIMEDOUT/503/ECONNRESET，
#      改用 article-local.md 重试一次；
#   3. stage=html 时，重试成功后用 apply-image-map.mjs --html-rewrite 把
#      article.html 中的 imgs/xxx 路径回写为 CDN URL。
#
# 退出码:
#   命令实际退出码透传；参数错误返回 64

set -uo pipefail

usage() {
  cat >&2 <<'EOF'
usage:
  run-with-cdn-fallback.sh <date-slug> <stage> -- <command...>
  run-with-cdn-fallback.sh --post-dir posts/<date-slug> --stage <stage> -- <command...>
  run-with-cdn-fallback.sh --slug <date-slug> --stage <stage> -- <command...>
EOF
}

slug=""
stage=""

# 检测调用风格：如果首参以 -- 开头（除 `--` 分隔符外），走命名参数解析
if [[ $# -gt 0 && "$1" =~ ^--[a-z] ]]; then
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --post-dir)
        # posts/2026-05-14-foo → 取末段 2026-05-14-foo 作为 slug
        slug="$(basename "$2")"
        shift 2
        ;;
      --slug)
        slug="$2"
        shift 2
        ;;
      --stage)
        stage="$2"
        shift 2
        ;;
      --)
        shift
        break
        ;;
      *)
        echo "run-with-cdn-fallback.sh: unknown option '$1'" >&2
        usage
        exit 64
        ;;
    esac
  done
else
  # 位置参数模式
  if [[ $# -lt 4 ]]; then
    usage
    exit 64
  fi
  slug="$1"; shift
  stage="$1"; shift
  if [[ "$1" != "--" ]]; then
    echo "run-with-cdn-fallback.sh: missing '--' separator" >&2
    exit 64
  fi
  shift
fi

if [[ -z "$slug" || -z "$stage" || $# -eq 0 ]]; then
  echo "run-with-cdn-fallback.sh: missing slug/stage/command" >&2
  usage
  exit 64
fi

posts_root="${PIPELINE_POSTS_ROOT:-posts}"
base="$posts_root/$slug"
cdn_md="$base/article.md"
local_md="$base/article-local.md"

if [[ ! -f "$cdn_md" ]]; then
  echo "run-with-cdn-fallback.sh: $cdn_md missing; run apply-image-map.mjs first" >&2
  exit 65
fi

substitute() {
  local replacement="$1"; shift
  local out=()
  for arg in "$@"; do
    out+=("${arg//\{ARTICLE_MD\}/$replacement}")
  done
  printf '%q\n' "${out[@]}"
}

run_cmd() {
  local replacement="$1"; shift
  local -a expanded=()
  for arg in "$@"; do
    expanded+=("${arg//\{ARTICLE_MD\}/$replacement}")
  done
  "${expanded[@]}"
}

log_file="$(mktemp -t cdn-fallback-XXXXXX.log)"
trap 'rm -f "$log_file"' EXIT

echo "[cdn-fallback] try CDN article.md"
run_cmd "$cdn_md" "$@" 2>&1 | tee "$log_file"
status=${PIPESTATUS[0]}

if [[ $status -eq 0 ]]; then
  exit 0
fi

if grep -qiE 'timeout|etimedout|503|econnreset|connection reset|cdn.jsdelivr' "$log_file"; then
  if [[ ! -f "$local_md" ]]; then
    echo "[cdn-fallback] CDN failed but article-local.md missing; cannot fallback" >&2
    exit "$status"
  fi
  echo "[cdn-fallback] CDN timeout detected; retry with article-local.md"
  : > "$log_file"
  run_cmd "$local_md" "$@" 2>&1 | tee "$log_file"
  status=${PIPESTATUS[0]}
  if [[ $status -ne 0 ]]; then
    exit "$status"
  fi
  if [[ "$stage" == "html" ]]; then
    html="$base/article.html"
    local_html="$base/article-local.html"
    map="$base/image-map.json"
    # baoyu-markdown-to-html 把 article-local.md → article-local.html。
    # 我们的契约里 Step 8 的产物固定叫 article.html，因此需要 rename。
    if [[ -f "$local_html" ]]; then
      mv -f "$local_html" "$html"
    fi
    if [[ -f "$html" && -f "$map" ]]; then
      echo "[cdn-fallback] rewrite local imgs/ paths back to CDN in $html"
      bun run "$(dirname "$0")/apply-image-map.mjs" --html-rewrite "$html" "$map" || exit $?
    fi
  fi
  exit 0
fi

exit "$status"
