import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');

const pages = [
  { name: 'home', path: 'index.html', htmlBudget: 60_000, jsBudget: 500_000 },
  { name: 'archive', path: 'archive/index.html', htmlBudget: 320_000, jsBudget: 500_000 },
  { name: 'topics', path: 'topics/index.html', htmlBudget: 80_000, jsBudget: 500_000 },
  { name: 'notes', path: 'notes/index.html', htmlBudget: 80_000, jsBudget: 500_000 },
  {
    name: 'representative article',
    path: 'articles/recursive-self-improvement-bottleneck/index.html',
    htmlBudget: 90_000,
    jsBudget: 500_000,
  },
];

let failures = 0;

async function fileSize(path) {
  return (await stat(path)).size;
}

async function referencedJsBytes(html) {
  const refs = new Set(
    [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+\.js)"/g)]
      .map((match) => match[1])
      .filter((src) => src.startsWith('/_astro/')),
  );

  let total = 0;
  for (const src of refs) {
    total += await fileSize(resolve(dist, src.replace(/^\//, '')));
  }
  return total;
}

for (const page of pages) {
  const path = resolve(dist, page.path);
  const html = await readFile(path, 'utf8');
  const htmlBytes = Buffer.byteLength(html);
  const jsBytes = await referencedJsBytes(html);

  console.log(
    `${page.name}: HTML ${htmlBytes} B / ${page.htmlBudget} B; referenced JS ${jsBytes} B / ${page.jsBudget} B`,
  );

  if (htmlBytes > page.htmlBudget) {
    console.error(`Performance budget exceeded: ${page.name} HTML`);
    failures += 1;
  }
  if (jsBytes > page.jsBudget) {
    console.error(`Performance budget exceeded: ${page.name} referenced JS`);
    failures += 1;
  }
}

const articlePath = resolve(
  dist,
  'articles/recursive-self-improvement-bottleneck/index.html',
);
const articleHtml = await readFile(articlePath, 'utf8');
const images = [...articleHtml.matchAll(/<img\b[^>]*>/g)].map((match) => match[0]);

if (images.length > 0) {
  if (!/decoding="async"/.test(images[0]) || !/fetchpriority="high"/.test(images[0])) {
    console.error('Performance image policy failed: first article image must decode async and have high fetch priority.');
    failures += 1;
  }

  for (const [index, image] of images.entries()) {
    if (!/decoding="async"/.test(image)) {
      console.error(`Performance image policy failed: image #${index + 1} is missing decoding="async".`);
      failures += 1;
    }
    if (index > 0 && !/loading="lazy"/.test(image)) {
      console.error(`Performance image policy failed: image #${index + 1} is missing loading="lazy".`);
      failures += 1;
    }
  }
}

if (failures > 0) {
  console.error(`Performance check failed: ${failures} issue(s).`);
  process.exit(1);
}

console.log('Performance budgets and image loading policy passed.');
