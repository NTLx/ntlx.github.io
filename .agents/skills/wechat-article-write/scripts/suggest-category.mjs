#!/usr/bin/env bun
/**
 * 基于关键词命中给文章推荐分类（v2 — 外部 JSON 关键词 + anti-keyword + N-gram + tags 加权 + gap 置信度）
 *
 * 用法:
 *   bun run suggest-category.mjs <draft.md> [--json]
 * 输出（stdout, JSON）:
 *   {"recommended":"ai-coding","confidence":0.78,"low_confidence":false,"alternative":"ai-agents","blogSlug":"langchain-interrupt","scores":{...}}
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
import { ASCII_SLUG_RE } from "./validation-lib.mjs";

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

function cleanAnalysisText(text) {
  return text
    .replace(/^## 参考资料[\s\S]*$/m, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/\bSLOT_IMG_\d{2}(?:_[A-Za-z0-9_-]+)?\b/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/https?:\/\/[^\s)]+/g, " ")
    .replace(/\b(?:title|date|summary|category|blogSlug|coverImage|sourceUrl|targetPath)\b/gi, " ");
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
  if (top[1] <= 0) return { recommended: "ai-industry", confidence: 0, low_confidence: true, alternative: entries[1]?.[0] ?? null };

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

const CN_SLUG_TERMS = [
  { re: /\bAGI\b|通用人工智能/i, words: ["agi"] },
  { re: /稀缺|稀缺性/i, words: ["scarcity"] },
  { re: /关系部门|关系型部门|关系型产业|关系行业/i, words: ["relational", "sector"] },
  { re: /劳动|劳动力/i, words: ["labor"] },
  { re: /资本/i, words: ["capital"] },
  { re: /经济|经济学/i, words: ["economics"] },
  { re: /自动化/i, words: ["automation"] },
  { re: /生产率|生产力/i, words: ["productivity"] },
  { re: /增长/i, words: ["growth"] },
  { re: /分配/i, words: ["allocation"] },
  { re: /智能体|代理/i, words: ["agents"] },
  { re: /模型/i, words: ["models"] },
  { re: /安全|风险/i, words: ["security"] },
  { re: /编程|代码/i, words: ["coding"] },
  { re: /工程|架构/i, words: ["engineering"] },
];

function mappedSlugWords(text) {
  const words = [];
  const seen = new Set();
  for (const { re, words: mapped } of CN_SLUG_TERMS) {
    if (!re.test(text)) continue;
    for (const word of mapped) {
      if (!seen.has(word)) {
        seen.add(word);
        words.push(word);
      }
    }
  }
  return words;
}

function uniqueWords(...groups) {
  const seen = new Set();
  const words = [];
  for (const group of groups) {
    for (const word of group) {
      if (seen.has(word)) continue;
      seen.add(word);
      words.push(word);
    }
  }
  return words;
}

function generateBlogSlug({ body, title, summary, tags, fmBlogSlug }) {
  if (ASCII_SLUG_RE.test(fmBlogSlug)) return fmBlogSlug;

  const STOP_WORDS = new Set([
    "the", "and", "for", "with", "from", "that", "this", "have", "been",
    "into", "your", "will", "what", "when", "where", "which", "about",
    "their", "there", "would", "could", "should", "using", "makes", "more",
    "some", "than", "then", "also", "just", "like", "over", "very", "much",
    "such", "only", "other", "into", "article", "draft", "markdown", "html",
    "slot", "img", "image", "infographic", "cover", "coverimage", "sourceurl",
    "blogslug", "targetpath", "github", "ntlx", "http", "https", "www", "com",
    "org", "net", "cdn", "url", "png", "jpg", "jpeg", "md",
  ]);

  function extractEnglishWords(text) {
    const matches = text.match(/[a-zA-Z][a-zA-Z0-9]{1,}/g) ?? [];
    const seen = new Set();
    const result = [];
    for (const w of matches) {
      const lower = w.toLowerCase();
      if (!STOP_WORDS.has(lower) && !seen.has(lower)) {
        seen.add(lower);
        result.push(lower);
      }
    }
    return result;
  }

  const cleanBody = cleanAnalysisText(body);
  const titleContext = [title, summary, tags.join(" ")].join(" ");
  const headings = (cleanBody.match(/^##\s+.+$/gm) ?? []).join(" ");

  let words = uniqueWords(
    mappedSlugWords(titleContext),
    extractEnglishWords(titleContext),
    mappedSlugWords(cleanBody),
  );

  if (words.length < 2) {
    words = uniqueWords(words, extractEnglishWords(headings));
  }

  if (words.length < 2) {
    words = uniqueWords(words, extractEnglishWords(cleanBody));
  }

  const slug = words.slice(0, 4).join("-");

  if (ASCII_SLUG_RE.test(slug) && slug.length >= 2) {
    return slug;
  }

  return "article";
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
const fmBlogSlug = extractFmField(fm, "blogSlug");
const tags = extractTags(fm);
const analysisBody = cleanAnalysisText(body);
const headings = (analysisBody.match(/^##\s+.+$/gm) ?? []).join("\n");

const scores = {};
score(title + " " + summary, WEIGHTS.title, scores, rules);
score(headings, WEIGHTS.heading, scores, rules);
score(analysisBody, WEIGHTS.body, scores, rules);

// E4: frontmatter tags 加权（+6）——tags 是作者显式标注，信号强度远高于正文偶现
if (tags.length > 0) {
  const tagsText = tags.join(" ");
  score(tagsText, WEIGHTS.tags, scores, rules);
}

const result = {
  ...rank(scores),
  blogSlug: generateBlogSlug({ body, title, summary, tags, fmBlogSlug }),
  scores,
};
process.stdout.write(JSON.stringify(result) + "\n");
