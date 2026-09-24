import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import YAML from 'yaml';

const root = resolve(import.meta.dirname, '..');
const articlesDir = resolve(root, 'src/content/docs/articles');
const writeMode = process.argv.includes('--write');

const canonical = new Map([
  ['write', null],
  ['reader-response', null],
  ['agent', 'AI Agents'],
  ['ai agent', 'AI Agents'],
  ['ai agents', 'AI Agents'],
  ['llm agents', 'AI Agents'],
  ['alignment', 'AI Alignment'],
  ['context engineering', 'Context Engineering'],
  ['recursive self-improvement', 'Recursive Self-Improvement'],
  ['benchmark', 'Benchmarks'],
  ['benchmarks', 'Benchmarks'],
  ['enterprise-ai', 'Enterprise AI'],
  ['enterprise ai', 'Enterprise AI'],
  ['ai-native', 'AI Native'],
  ['ai security', 'AI Security'],
  ['agent-skills', 'Agent Skills'],
  ['open-source', 'Open Source'],
  ['frontier ai', 'Frontier AI'],
  ['ai access', 'AI Access'],
  ['model lock-in', 'Model Lock-In'],
  ['open weights', 'Open Weights'],
  ['persistent ai', 'Persistent AI'],
  ['knowledge work', 'Knowledge Work'],
  ['multi-agent', 'Multi-Agent'],
  ['agent evaluation', 'Agent Evaluation'],
  ['procedural memory', 'Procedural Memory'],
  ['self-evolution', 'Self-Evolution'],
  ['vulnerability patching', 'Vulnerability Patching'],
  ['evaluation', 'Evaluation'],
  ['cost', 'Cost'],
  ['harness', 'Harness'],
  ['workflow', 'Workflow'],
  ['offline-life', 'Offline Life'],
  ['agent安全', 'Agent Safety'],
]);

function normalizeTags(tags) {
  const result = [];
  const seen = new Set();

  for (const raw of tags ?? []) {
    const trimmed = String(raw).trim();
    if (!trimmed) continue;
    const mapped = canonical.has(trimmed.toLocaleLowerCase('en'))
      ? canonical.get(trimmed.toLocaleLowerCase('en'))
      : trimmed;
    if (!mapped) continue;

    const key = mapped.toLocaleLowerCase('en');
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(mapped);
  }

  return result;
}

function sameTags(a, b) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function replaceTagsField(source, tags) {
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return source;

  const body = match[1];
  const lines = body.split('\n');
  const start = lines.findIndex((line) => /^tags:\s*/.test(line));
  if (start < 0) return source;

  let end = start + 1;
  if (/^tags:\s*$/.test(lines[start])) {
    while (end < lines.length && /^\s+-\s+/.test(lines[end])) end += 1;
  }

  const replacement = tags.length > 0
    ? [`tags: [${tags.map((tag) => JSON.stringify(tag)).join(', ')}]`]
    : [];

  lines.splice(start, end - start, ...replacement);
  const updatedFrontmatter = lines.join('\n');
  return source.replace(match[0], `---\n${updatedFrontmatter}\n---`);
}

const entries = (await readdir(articlesDir, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith('.md'));

let articleCount = 0;
let taggedCount = 0;
let changedCount = 0;
let invalidCount = 0;
const frequencies = new Map();

for (const entry of entries) {
  const path = resolve(articlesDir, entry.name);
  const source = await readFile(path, 'utf8');
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  if (!match) continue;

  const data = YAML.parse(match[1]) ?? {};
  if (!data.date || !data.category) continue;
  articleCount += 1;

  const tags = Array.isArray(data.tags) ? data.tags.map(String) : [];
  if (tags.length > 0) taggedCount += 1;

  const normalized = normalizeTags(tags);
  if (!sameTags(tags, normalized)) {
    changedCount += 1;
    if (writeMode) {
      await writeFile(path, replaceTagsField(source, normalized), 'utf8');
    } else {
      console.error(`${entry.name}: tags need normalization`);
      console.error(`  current: ${JSON.stringify(tags)}`);
      console.error(`  expected: ${JSON.stringify(normalized)}`);
      invalidCount += 1;
    }
  }

  if (normalized.length > 8) {
    console.error(`${entry.name}: too many tags (${normalized.length}; max 8)`);
    invalidCount += 1;
  }

  for (const tag of normalized) {
    frequencies.set(tag, (frequencies.get(tag) ?? 0) + 1);
  }
}

if (writeMode) {
  console.log(`Normalized tags in ${changedCount} article(s).`);
  process.exit(0);
}

const coverage = articleCount === 0 ? 0 : (taggedCount / articleCount) * 100;
console.log(
  `Tag policy: ${taggedCount}/${articleCount} article(s) tagged (${coverage.toFixed(1)}%); ${frequencies.size} canonical tag(s).`,
);

if (invalidCount > 0) {
  console.error(`Tag policy check failed: ${invalidCount} issue(s).`);
  process.exit(1);
}

console.log('Tag policy check passed.');
