#!/usr/bin/env bash
# CDN → 本地路径降级编排
#
# 用法:
#   run-with-cdn-fallback.sh <date-slug> <stage> -- <command...>
#
# 参数:
#   date-slug : posts/<date-slug> 目录名
#   stage     : html | wechat (用于决定降级文件名 / 是否需要 html 回写)
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

if [[ $# -lt 4 ]]; then
  echo "usage: run-with-cdn-fallback.sh <date-slug> <stage> -- <command...>" >&2
  exit 64
fi

slug="$1"; shift
stage="$1"; shift
if [[ "$1" != "--" ]]; then
  echo "run-with-cdn-fallback.sh: missing '--' separator" >&2
  exit 64
fi
shift

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
    map="$base/image-map.json"
    if [[ -f "$html" && -f "$map" ]]; then
      echo "[cdn-fallback] rewrite local imgs/ paths back to CDN in $html"
      bun run "$(dirname "$0")/apply-image-map.mjs" --html-rewrite "$html" "$map" || exit $?
    fi
  fi
  exit 0
fi

exit "$status"
