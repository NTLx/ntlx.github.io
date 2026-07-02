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

function isReferenceHeading(node) {
  return node?.type === "heading" && toPlainText(node.children) === "原文参考";
}

function isReferenceOnlyLinkListItem(node) {
  if (node?.type !== "listItem") return false;
  if (!Array.isArray(node.children) || node.children.length !== 1) return false;
  const paragraph = node.children[0];
  if (paragraph?.type !== "paragraph") return false;
  const significant = paragraph.children.filter((child) => !isWhitespaceText(child));
  return significant.length === 1 && significant[0]?.type === "link";
}

function paragraphNode(value) {
  return { type: "paragraph", children: [textNode(value)] };
}

function replacementForLink(linkNode, parent, ancestors) {
  const label = toPlainText(linkNode.children) || linkNode.url;
  const url = linkNode.url;
  if (label === url) return [textNode(url)];
  if (isStandaloneListLink(linkNode, parent, ancestors)) {
    return [
      textNode(label),
      { type: "break" },
      textNode(url),
    ];
  }
  return [textNode(`${label}（链接：${url}）`)];
}

function expandReferenceList(node) {
  const out = [];
  for (const item of node.children ?? []) {
    if (!isReferenceOnlyLinkListItem(item)) return null;
    const linkNode = item.children[0].children.find((child) => child.type === "link");
    const label = toPlainText(linkNode.children) || linkNode.url;
    out.push(paragraphNode(label), paragraphNode(linkNode.url));
  }
  return out;
}

function transformChildren(node, ancestors = [], context = { inReferenceSection: false }) {
  if (!Array.isArray(node.children)) return;
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (node.type === "root" && child.type === "heading") {
      context.inReferenceSection = isReferenceHeading(child);
    }
    if (context.inReferenceSection && child.type === "list") {
      const expanded = expandReferenceList(child);
      if (expanded) {
        node.children.splice(i, 1, ...expanded);
        i += expanded.length - 1;
        continue;
      }
    }
    if (child.type === "link") {
      const replacement = replacementForLink(child, node, ancestors);
      node.children.splice(i, 1, ...replacement);
      i += replacement.length - 1;
      continue;
    }
    transformChildren(child, [...ancestors, node], context);
  }
}

function normalizeReferenceSectionSpacing(markdown) {
  return String(markdown).replace(
    /(## 原文参考\s*\n\n)([\s\S]*?)(?=\n## |\n# |$)/g,
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
  transformChildren(tree, [], { inReferenceSection: false });
  return normalizeReferenceSectionSpacing(
    String(processor.stringify(tree)).replace(/\b(https?)\\:\/\//g, "$1://"),
  );
}

function stripTags(html) {
  return String(html ?? "").replace(/<[^>]+>/g, "").trim();
}

function decodeBasicEntities(text) {
  return String(text ?? "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function stripWechatAnchors(html) {
  return String(html ?? "").replace(
    /<a\b[^>]*\bhref=(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi,
    (_full, _quote, href, inner) => {
      const url = decodeBasicEntities(href);
      const label = decodeBasicEntities(stripTags(inner));
      if (!label || label === url || label.includes(url)) return url;
      return `${label}（链接：${url}）`;
    },
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
