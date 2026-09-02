import { getWechatAuthorProfile } from "./config-lib.mjs";

const AUTHOR_TEMPLATE_RE = /\{\{\s*(?:作者名|author|简介|bio|signature|profile|[^{}]*简介[^{}]*)\s*\}\}/giu;

export function replaceKnownAuthorPlaceholders(text, profile = getWechatAuthorProfile()) {
  let output = String(text ?? "");
  output = output.replace(/\{\{\s*作者名\s*\}\}/gu, profile.name);
  output = output.replace(/\{\{\s*(?:简介|bio)\s*\}\}/giu, profile.bio);
  output = output.replace(/\{\{\s*一句话简介(?:\s*[,，]\s*如[:：][^{}]*)?\s*\}\}/gu, profile.bio);
  return output;
}

export function findAuthorPlaceholders(text) {
  return [...String(text ?? "").matchAll(AUTHOR_TEMPLATE_RE)].map((match) => match[0]);
}

export function assertNoAuthorPlaceholders(text) {
  return findAuthorPlaceholders(text).map((placeholder) => `unresolved author placeholder: ${placeholder}`);
}

function visibleText(text) {
  return String(text ?? "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/giu, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/giu, "")
    .replace(/<!--[\s\S]*?-->/gu, "")
    .replace(/<[^>]+>/gu, "")
    .replace(/&nbsp;/giu, " ")
    .replace(/&amp;/giu, "&")
    .replace(/&lt;/giu, "<")
    .replace(/&gt;/giu, ">")
    .replace(/&quot;/giu, '"')
    .replace(/\s+/gu, " ")
    .trim();
}

export function assertCanonicalSignature(text, profile = getWechatAuthorProfile()) {
  const source = /<[a-z][^>]*>/iu.test(String(text ?? "")) ? visibleText(text) : String(text ?? "");
  const count = source.split(profile.signature).length - 1;
  return count === 1 ? [] : [`canonical author signature must exist exactly once (found ${count})`];
}
