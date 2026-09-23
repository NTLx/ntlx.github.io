import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const articlesDir = resolve(root, 'src/content/docs/articles');
const baselinePath = resolve(root, 'scripts/public-article-urls.json');

const categoryPages = new Set([
  'ai-coding.mdx',
  'ai-agents.mdx',
  'ai-industry.mdx',
  'ai-models.mdx',
  'security.mdx',
  'engineering.mdx',
]);

const entries = await readdir(articlesDir, { withFileTypes: true });
const currentUrls = entries
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .filter((name) => /\.(md|mdx)$/.test(name) && !categoryPages.has(name))
  .map((name) => `/articles/${name.replace(/\.(md|mdx)$/, '')}/`)
  .sort();

if (process.argv.includes('--write-baseline')) {
  await writeFile(
    baselinePath,
    JSON.stringify(
      {
        generatedFrom: 'src/content/docs/articles',
        articleCount: currentUrls.length,
        urls: currentUrls,
      },
      null,
      2,
    ) + '\n',
    'utf8',
  );
  console.log(`Wrote URL baseline: ${currentUrls.length} articles`);
  process.exit(0);
}

const baseline = JSON.parse(await readFile(baselinePath, 'utf8'));
const currentSet = new Set(currentUrls);
const missing = baseline.urls.filter((url) => !currentSet.has(url));

if (missing.length > 0) {
  console.error('Public article URL compatibility check failed.');
  console.error(`${missing.length} baseline URL(s) disappeared:`);
  for (const url of missing) console.error(`- ${url}`);
  process.exit(1);
}

console.log(
  `Public article URL compatibility check passed: ${baseline.urls.length} baseline URL(s) preserved; ${currentUrls.length} current article(s).`,
);
