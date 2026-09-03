#!/usr/bin/env bun

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";

const processor = unified()
  .use(remarkParse)
  .use(remarkFrontmatter, ["yaml"])
  .use(remarkGfm)
  .use(remarkStringify, {
    bullet: "-",
    fences: true,
    rule: "-",
  });

function textNode(value) {
  return { type: "text", value };
}

function toPlainText(nodes = []) {
  let out = "";
  for (const node of nodes) {
    if (node.type === "text" || node.type === "inlineCode") out += node.value;
    else if (node.children) out += toPlainText(node.children);
  }
  return out.trim();
}

function isWhitespaceText(node) {
  return node.type === "text" && node.value.trim() === "";
}

function isStandaloneListLink(linkNode, parent, ancestors) {
  const listItem = ancestors[ancestors.length - 1];
  if (!parent || parent.type !== "paragraph") return false;
  if (!listItem || listItem.type !== "listItem") return false;
  return parent.children.every((child) => child === linkNode || isWhitespaceText(child));
}

function replacementForLink(linkNode, parent, ancestors) {
  const label = toPlainText(linkNode.children) || linkNode.url;
  const url = linkNode.url;
  if (label === url) return [textNode(url)];
  if (isStandaloneListLink(linkNode, parent, ancestors)) {
    // Expand standalone list links: label + line break + plain URL.
    // This ensures gzh-design receives plain text, not Markdown link syntax,
    // so it cannot produce <a href> tags in the WeChat HTML output.
    return [textNode(label), { type: "break" }, textNode(url)];
  }
  return [textNode(`${label}（链接：${url}）`)];
}

function transformChildren(node, ancestors = []) {
  if (!Array.isArray(node.children)) return;
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (child.type === "link") {
      const replacement = replacementForLink(child, node, ancestors);
      if (replacement !== null) {
        node.children.splice(i, 1, ...replacement);
        i += replacement.length - 1;
        continue;
      }
    }
    transformChildren(child, [...ancestors, node]);
  }
}

function normalizeReferenceSectionSpacing(markdown) {
  return String(markdown).replace(
    /(## 参考资料\s*\n\n)([\s\S]*?)(?=\n## |\n# |$)/g,
    (_full, heading, sectionBody) => {
      const lines = sectionBody
        .split("\n")
        .map((line) => line.trimEnd())
        .filter((line) => line !== "");
      return `${heading}${lines.join("\n")}`;
    },
  );
}

export function normalizeLinksForWechat(markdown) {
  const tree = processor.parse(markdown);
  transformChildren(tree, []);
  return normalizeReferenceSectionSpacing(
    String(processor.stringify(tree))
      .replace(/\b(https?)\\:\/\//g, "$1://")
      // remark-stringify escapes URL-legal punctuation (\_ \. etc.) so the *markdown*
      // stays valid; but wechat-source URLs are VISIBLE plain text that the gzh-design /
      // agent step copies verbatim into HTML <span leaf> nodes, where a stray backslash
      // renders literally (www\.xxx, \_extras). The blog track is untouched (it keeps
      // [label](url)), and no markdown *parser* consumes wechat-source in this pipeline,
      // so stripping these escapes is safe and removes the footgun.
      .replace(/\\([*_{}\[\]()#+\-.!~:\/?@&=;$,%])/g, "$1"),
  );
}

function runCli(argv) {
  const input = argv[0];
  let output = null;
  for (let i = 1; i < argv.length; i++) {
    if (argv[i] === "--output") output = argv[++i];
    else {
      process.stderr.write(`wechat-link-normalizer: unknown arg ${argv[i]}\n`);
      process.exit(1);
    }
  }
  if (!input) {
    process.stderr.write("usage: wechat-link-normalizer.mjs <input.md> [--output output.md]\n");
    process.exit(1);
  }
  if (!existsSync(input)) {
    process.stderr.write(`wechat-link-normalizer: file not found: ${input}\n`);
    process.exit(2);
  }
  const normalized = normalizeLinksForWechat(readFileSync(input, "utf8"));
  if (output) writeFileSync(output, normalized);
  else process.stdout.write(normalized);
}

if (import.meta.main) runCli(process.argv.slice(2));
