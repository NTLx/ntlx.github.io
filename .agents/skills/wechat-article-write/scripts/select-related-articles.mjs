#!/usr/bin/env bun

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { postsRoot, repoRoot } from "./path-resolver.mjs";
import { parseFrontmatter, extractBody } from "./frontmatter-lib.mjs";
import {
  extractPrimarySourceUrlsFromMaterials,
  findSameSourceMatches,
  inferLegacyPrimarySource,
  parsePrimarySourceUrlsFrontmatter,
} from "./source-provenance-lib.mjs";

const DEFAULT_LIMIT = 8;
const HIGH_CONFIDENCE_SCORE = 6;

function fail(code, msg) {
  process.stderr.write(`select-related-articles: ${msg}\n`);
  process.exit(code);
}

export function tokenize(text) {
  const lower = String(text ?? "").toLowerCase();
  const english = lower.match(/[a-z][a-z0-9-]{2,}/g) ?? [];
  const cjk = lower.match(/[\u4e00-\u9fff]{2,6}/g) ?? [];
  const stop = new Set([
    "https", "http", "www", "com", "org", "net", "the", "and", "for",
    "with", "from", "that", "this", "article", "draft", "markdown",
    "材料", "背景调研", "原文", "来源", "文章", "这个", "一个",
  ]);
  return [...new Set([...english, ...cjk].filter((t) => !stop.has(t)))];
}

export function loadPublishedArticles(rootDir) {
  const articlesDir = resolve(rootDir, "src/content/docs/articles");
  if (!existsSync(articlesDir)) return [];

  return readdirSync(articlesDir)
    .filter((file) => file.endsWith(".md"))
    .filter((file) => !file.includes(".backup-"))
    .map((file) => {
      const fullPath = resolve(articlesDir, file);
      const raw = readFileSync(fullPath, "utf8");
      const fm = parseFrontmatter(raw) ?? {};
      const body = extractBody(raw);
      const hasExplicitProvenance = Object.prototype.hasOwnProperty.call(fm, "primarySourceUrls");
      let primarySourceUrls = [];
      let primarySourceProvenance = null;
      if (hasExplicitProvenance) {
        try {
          primarySourceUrls = parsePrimarySourceUrlsFrontmatter(fm.primarySourceUrls);
          primarySourceProvenance = "frontmatter";
        } catch (error) {
          throw new Error(`${file}: ${error.message}`);
        }
      } else {
        const inferred = inferLegacyPrimarySource(body);
        if (inferred) {
          primarySourceUrls = [inferred.normalizedUrl];
          primarySourceProvenance = inferred.provenance;
        }
      }
      const slug = basename(file, ".md");
      return {
        slug,
        title: fm.title ?? slug,
        description: fm.description ?? fm.summary ?? "",
        date: fm.date ?? "",
        category: fm.category ?? "",
        tags: fm.tags ?? "",
        primarySourceUrls,
        primarySourceProvenance,
        body,
      };
    })
    .filter((article) => article.title && article.date);
}

export function scoreArticle(queryTokens, article) {
  const haystack = [
    article.slug,
    article.title,
    article.description,
    article.category,
    article.tags,
    article.body.slice(0, 1600),
  ].join(" ").toLowerCase();
  const matches = queryTokens.filter((token) => haystack.includes(token));
  const titleMatches = matches.filter((token) => article.title.toLowerCase().includes(token));
  const categoryBoost = queryTokens.includes(article.category) ? 2 : 0;
  const score = matches.length * 2 + titleMatches.length * 3 + categoryBoost;
  return {
    score,
    matches: [...new Set(matches)].slice(0, 8),
  };
}

export function selectRelated({ materials, articles, limit = DEFAULT_LIMIT }) {
  const primarySourceUrls = extractPrimarySourceUrlsFromMaterials(materials);
  const queryTokens = tokenize(materials).slice(0, 80);
  const candidates = articles
    .map((article) => {
      const scored = scoreArticle(queryTokens, article);
      return {
        slug: article.slug,
        title: article.title,
        url: `https://ntlx.github.io/articles/${article.slug}`,
        date: article.date,
        category: article.category,
        score: scored.score,
        high_confidence: scored.score >= HIGH_CONFIDENCE_SCORE,
        reason: scored.matches.length
          ? `Shares terms: ${scored.matches.join(", ")}`
          : "Weak lexical relation",
      };
    })
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || String(b.date).localeCompare(String(a.date)))
    .slice(0, limit);

  return {
    queryTokens,
    candidates,
    primarySourceUrls,
    sameSourceMatches: findSameSourceMatches(primarySourceUrls, articles),
  };
}

export function renderMemoryMarkdown(data) {
  const lines = ["# 站内记忆包", ""];
  lines.push("## Primary Source Uniqueness", "");
  if (data.same_source_matches.length === 0) {
    lines.push("未发现同源已发布文章。", "");
  } else {
    lines.push("发现当前 primary source 已经用于以下已发布文章：", "");
    for (const [index, item] of data.same_source_matches.entries()) {
      lines.push(`${index + 1}. 《${item.title}》`);
      lines.push(`   URL: ${item.url}`);
      lines.push(`   Primary Source: ${item.source}`);
      lines.push(`   Provenance: ${item.provenance}`);
      lines.push("");
    }
    lines.push("结论：不得创建新的独立文章。", "");
  }
  if (data.candidates.length === 0) {
    lines.push("未找到明显相关的站内旧文。写作时可以跳过站内联动。");
    return lines.join("\n") + "\n";
  }

  lines.push("## 高相关旧文", "");
  for (const [index, item] of data.candidates.entries()) {
    lines.push(`${index + 1}. 《${item.title}》`);
    lines.push(`   URL: ${item.url}`);
    lines.push(`   分类: ${item.category || "unknown"}; 日期: ${item.date || "unknown"}; 分数: ${item.score}`);
    lines.push(`   关联理由: ${item.reason}`);
    lines.push("   建议用法: 正文自然联动或文末延伸阅读。");
    lines.push("");
  }
  return lines.join("\n");
}

function parseArgs(argv) {
  const o = { slug: null, limit: DEFAULT_LIMIT };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--limit") o.limit = Number(argv[++i]);
    else if (argv[i].startsWith("--")) fail(1, `unknown flag ${argv[i]}`);
    else if (!o.slug) o.slug = argv[i];
  }
  if (!o.slug) fail(1, "usage: select-related-articles.mjs <date-slug> [--limit N]");
  return o;
}

if (import.meta.main) {
  const opts = parseArgs(process.argv.slice(2));
  const base = resolve(postsRoot(), opts.slug);
  const materialsPath = resolve(base, "materials.md");
  if (!existsSync(materialsPath)) fail(2, `materials.md missing: ${materialsPath}`);

  const materials = readFileSync(materialsPath, "utf8");
  const articles = loadPublishedArticles(repoRoot());
  const selected = selectRelated({ materials, articles, limit: opts.limit });
  const data = {
    slug: opts.slug,
    generated_at: new Date().toISOString(),
    primary_source_urls: selected.primarySourceUrls,
    same_source_matches: selected.sameSourceMatches,
    query_terms: selected.queryTokens.slice(0, 20),
    candidates: selected.candidates,
  };

  mkdirSync(base, { recursive: true });
  writeFileSync(resolve(base, "blog-memory.json"), JSON.stringify(data, null, 2) + "\n");
  writeFileSync(resolve(base, "blog-memory.md"), renderMemoryMarkdown(data));
  process.stdout.write(JSON.stringify({
    slug: opts.slug,
    primary_source_urls: data.primary_source_urls.length,
    same_source_matches: data.same_source_matches.length,
    candidates: data.candidates.length,
    high_confidence: data.candidates.filter((c) => c.high_confidence).length,
    blog_memory_json: "blog-memory.json",
    blog_memory_md: "blog-memory.md",
  }) + "\n");
  if (data.same_source_matches.length > 0) {
    process.stderr.write(
      "select-related-articles: BLOCKED - primary source already has published article(s); do not create another article. Review blog-memory.md.\n",
    );
    for (const item of data.same_source_matches) {
      process.stderr.write(`  - 《${item.title}》: ${item.url} (${item.provenance})\n`);
    }
    process.exit(4);
  }
}
