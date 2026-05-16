#!/usr/bin/env bun
/**
 * 基于关键词命中给文章推荐分类（v2 — 外部 JSON 关键词 + anti-keyword + N-gram + tags 加权 + gap 置信度）
 *
 * 用法:
 *   bun run suggest-category.mjs <draft.md> [--json]
 * 输出（stdout, JSON）:
 *   {"recommended":"ai-coding","confidence":0.78,"low_confidence":false,"alternative":"ai-agents","scores":{...}}
 *
 * 改进（v2）:
 *   - 关键词从 references/category-keywords.json 加载（可增量维护）
 *   - anti-keyword 惩罚：命中反关键词的类别扣分
 *   - N-gram 匹配：2 词短语得分更高（×1.5）
 *   - frontmatter tags 加权：每个 tag 命中关键词按 +6 计分
 *   - gap 置信度：top-2 差距 < 15% 标记 low_confidence
 *   - --json 标志：显式启用 JSON 输出（默认也是 JSON，保持向后兼容）
 *
 * 退出码: 0 成功；1 参数错误；2 文件不存在
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";

const SCRIPT_DIR = dirname(new URL(import.meta.url).pathname);
const KEYWORDS_PATH = resolve(SCRIPT_DIR, "../references/category-keywords.json");

const WEIGHTS = { title: 5, heading: 2, body: 1, tags: 6 };
const NGRAM_BONUS = 1.5;
const ANTI_PENALTY = 3;
const LOW_CONFIDENCE_GAP = 0.15;

function loadKeywords() {
  if (!existsSync(KEYWORDS_PATH)) {
    process.stderr.write(`suggest-category: keywords file not found: ${KEYWORDS_PATH}\n`);
    process.exit(2);
  }
  return JSON.parse(readFileSync(KEYWORDS_PATH, "utf8"));
}

function loadDoc(p) {
  if (!existsSync(p)) {
    process.stderr.write(`suggest-category.mjs: file not found: ${p}\n`);
    process.exit(2);
  }
  return readFileSync(p, "utf8");
}

function splitDoc(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { fm: "", body: raw };
  return { fm: m[1], body: m[2] };
}

function extractFmField(fm, key) {
  const prefix = `${key}:`;
  const line = fm.split("\n").find((l) => l.startsWith(prefix));
  if (!line) return "";
  const val = line.slice(prefix.length).trimStart();
  return val.replace(/^["']|["']$/g, "");
}

// 从 frontmatter tags 字段提取数组（支持 ["a", "b"] 和 YAML 流式 a, b 格式）
function extractTags(fm) {
  const raw = extractFmField(fm, "tags");
  if (!raw) return [];
  if (raw.startsWith("[") && raw.endsWith("]")) {
    return raw.slice(1, -1).split(",").map((t) => t.trim().replace(/^["']|["']$/g, ""));
  }
  return raw.split(",").map((t) => t.trim());
}

function score(text, weight, scores, rules) {
  const lower = text.toLowerCase();

  for (const [cat, rule] of Object.entries(rules)) {
    // 正向关键词
    for (const kw of rule.keywords ?? []) {
      if (lower.includes(kw.toLowerCase())) {
        scores[cat] = (scores[cat] ?? 0) + weight;
      }
    }

    // N-gram 匹配（2 词短语得分更高）
    for (const [w1, w2] of rule.ngrams ?? []) {
      const pattern = `${w1.toLowerCase()} ${w2.toLowerCase()}`;
      if (lower.includes(pattern)) {
        scores[cat] = (scores[cat] ?? 0) + weight * NGRAM_BONUS;
      }
    }

    // anti-keyword 惩罚
    for (const akw of rule.antiKeywords ?? []) {
      if (lower.includes(akw.toLowerCase())) {
        scores[cat] = (scores[cat] ?? 0) - ANTI_PENALTY * weight;
      }
    }
  }
}

function rank(scores) {
  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return { recommended: "ai-industry", confidence: 0, low_confidence: true, alternative: null };

  const top = entries[0];
  const total = entries.reduce((s, [, v]) => s + Math.max(v, 0), 0) || 1;
  const confidence = +(top[1] / total).toFixed(2);

  // gap 置信度：top-2 差距
  const second = entries[1];
  const gap = second ? (top[1] - second[1]) / total : 1;
  const lowConfidence = gap < LOW_CONFIDENCE_GAP;

  return {
    recommended: top[0],
    confidence,
    low_confidence: lowConfidence,
    alternative: second?.[0] ?? null,
  };
}

const args = process.argv.slice(2);
let file = null;
for (const a of args) {
  if (a === "--json") continue;
  else file = a;
}
if (!file) {
  process.stderr.write("usage: suggest-category.mjs <draft.md> [--json]\n");
  process.exit(1);
}

const rules = loadKeywords();
const raw = loadDoc(file);
const { fm, body } = splitDoc(raw);
const title = extractFmField(fm, "title");
const summary = extractFmField(fm, "summary");
const tags = extractTags(fm);
const headings = (body.match(/^##\s+.+$/gm) ?? []).join("\n");

const scores = {};
score(title + " " + summary, WEIGHTS.title, scores, rules);
score(headings, WEIGHTS.heading, scores, rules);
score(body, WEIGHTS.body, scores, rules);

// E4: frontmatter tags 加权（+6）——tags 是作者显式标注，信号强度远高于正文偶现
if (tags.length > 0) {
  const tagsText = tags.join(" ");
  score(tagsText, WEIGHTS.tags, scores, rules);
}

const result = { ...rank(scores), scores };
process.stdout.write(JSON.stringify(result) + "\n");