#!/usr/bin/env node
// backfill-categories.mjs
// 用法：
//   node backfill-categories.mjs            # 回填所有缺失 category 的文章
//   node backfill-categories.mjs --dry-run  # 仅打印计划，不写文件
//
// 行为：
//   1. 读取 src/content/docs/articles/{ai-coding,ai-agents,ai-industry,ai-models,security,engineering}.mdx
//   2. 对每个索引页提取 <LinkCard ... href="/articles/<slug>/" /> 中的 slug
//   3. 在 src/content/docs/articles/<slug>.md 的 frontmatter 中插入 `category: <索引页名>`
//      - 已有 category 字段：跳过（不覆盖）
//   4. 列出未被任何索引页收录的孤儿文章（由用户手动指定分类）

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : process.cwd());
const ARTICLES = path.join(ROOT, 'src/content/docs/articles');
const DRY = process.argv.includes('--dry-run');

const CATEGORIES = ['ai-coding', 'ai-agents', 'ai-industry', 'ai-models', 'security', 'engineering'];

function extractSlugs(mdxPath) {
  const txt = fs.readFileSync(mdxPath, 'utf8');
  const slugs = [];
  const re = /href=["'`]\/articles\/([^"'`/]+)\/?["'`]/g;
  let m;
  while ((m = re.exec(txt)) !== null) slugs.push(m[1]);
  return slugs;
}

function readFm(file) {
  const txt = fs.readFileSync(file, 'utf8');
  const m = txt.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { fm: '', body: txt, raw: txt };
  return { fm: m[1], body: txt.slice(m[0].length), raw: txt };
}

function hasField(fm, key) {
  const re = new RegExp(`^${key.replace('$', '\\$')}\\s*:`, 'm');
  return re.test(fm);
}

function injectField(file, key, value) {
  const { fm, body } = readFm(file);
  if (!fm) {
    console.warn(`  SKIP (no frontmatter): ${path.relative(ROOT, file)}`);
    return false;
  }
  if (hasField(fm, key)) return false;
  const newFm = fm.replace(/\s*$/, '') + `\n${key}: ${value}`;
  const out = `---\n${newFm}\n---\n${body}`;
  if (DRY) {
    console.log(`  WOULD-SET ${path.relative(ROOT, file)} ${key}=${value}`);
  } else {
    fs.writeFileSync(file, out);
    console.log(`  SET ${path.relative(ROOT, file)} ${key}=${value}`);
  }
  return true;
}

function listArticleFiles() {
  const out = new Set();
  for (const f of fs.readdirSync(ARTICLES)) {
    const full = path.join(ARTICLES, f);
    const stat = fs.statSync(full);
    if (!stat.isFile()) continue;
    if (f.endsWith('.md')) out.add(f.replace(/\.md$/, ''));
  }
  return out;
}

function main() {
  if (!fs.existsSync(ARTICLES)) {
    console.error(`Articles directory not found: ${ARTICLES}`);
    process.exit(2);
  }

  const allArticles = listArticleFiles();
  const claimed = new Set();
  let touched = 0;

  for (const cat of CATEGORIES) {
    const mdx = path.join(ARTICLES, `${cat}.mdx`);
    if (!fs.existsSync(mdx)) {
      console.warn(`MISSING index page: ${path.relative(ROOT, mdx)}`);
      continue;
    }
    const slugs = extractSlugs(mdx);
    console.log(`\n[${cat}] ${slugs.length} entries in ${path.basename(mdx)}`);
    for (const slug of slugs) {
      claimed.add(slug);
      const md = path.join(ARTICLES, `${slug}.md`);
      if (!fs.existsSync(md)) {
        console.warn(`  WARN: ${slug}.md not found (LinkCard 指向不存在的文章)`);
        continue;
      }
      if (injectField(md, 'category', cat)) touched++;
    }
  }

  // 孤儿
  const orphans = [...allArticles].filter((s) => !claimed.has(s));
  if (orphans.length) {
    console.log(`\n[orphans] ${orphans.length} 篇文章未被任何索引页收录，请手动指定 category：`);
    for (const s of orphans) console.log(`  - ${s}`);
  }

  console.log(`\nDone. ${DRY ? 'WOULD-SET' : 'SET'}=${touched}, total articles=${allArticles.size}, claimed=${claimed.size}, orphans=${orphans.length}`);
  if (orphans.length && !DRY) process.exitCode = 0; // 仅警告
}

main();
