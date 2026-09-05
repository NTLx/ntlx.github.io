/** Deterministic primary-source provenance mechanics. */

const TRACKING_PARAMETERS = new Set([
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "gclid", "fbclid", "mc_cid", "mc_eid",
]);
const URL_RE = /https?:\/\/[^\s)\]>"']+/giu;

function sectionLines(markdown, heading) {
  const lines = String(markdown ?? "").split(/\r?\n/u);
  const headingIndex = lines.findIndex((line) => new RegExp(`^##\\s+${heading}\\s*$`, "u").test(line));
  if (headingIndex === -1) return null;
  const content = [];
  for (const line of lines.slice(headingIndex + 1)) {
    if (/^##\s+/u.test(line) || /^---\s*$/u.test(line)) break;
    content.push(line);
  }
  return content;
}

function sourceText(article) {
  if (typeof article === "string") return article;
  if (article && typeof article === "object") return article.raw ?? article.body ?? article.content ?? "";
  return "";
}

function isTrackingParameter(name) {
  const lower = name.toLowerCase();
  return TRACKING_PARAMETERS.has(lower) || lower.startsWith("utm_");
}

/**
 * Return a conservative identity URL. Scheme and fragment are excluded from
 * identity; path casing and non-tracking query parameters remain significant.
 * Invalid or non-http(s) values return null.
 */
export function normalizeSourceUrl(value) {
  if (typeof value !== "string" || value.trim() === "") return null;
  let parsed;
  try {
    parsed = new URL(value.trim());
  } catch {
    return null;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;

  const pathname = (parsed.pathname || "/").replace(/\/+$/u, "") || "/";
  const query = [...parsed.searchParams.entries()]
    .filter(([name]) => !isTrackingParameter(name))
    .sort(([nameA, valueA], [nameB, valueB]) => nameA.localeCompare(nameB) || valueA.localeCompare(valueB));
  const search = new URLSearchParams(query).toString();
  return `https://${parsed.host}${pathname}${search ? `?${search}` : ""}`;
}

/** Normalize, discard invalid values, deduplicate, and sort a source set. */
export function normalizeSourceUrlSet(values) {
  return [...new Set(
    (Array.isArray(values) ? values : [])
      .map((value) => normalizeSourceUrl(value))
      .filter(Boolean),
  )].sort();
}

/** Compare source identities without considering input order. */
export function sameNormalizedSourceSet(left, right) {
  const normalizedLeft = normalizeSourceUrlSet(left);
  const normalizedRight = normalizeSourceUrlSet(right);
  return normalizedLeft.length === normalizedRight.length
    && normalizedLeft.every((value, index) => value === normalizedRight[index]);
}

/** Return typed entries from the dedicated 原始来源 section. */
export function extractPrimarySourceEntriesFromMaterials(materials) {
  const lines = sectionLines(materials, "原始来源");
  if (!lines) return [];
  return lines
    .map((line) => line.match(/^\s*-\s+(url|file|pasted):\s*(.*?)\s*$/u))
    .filter(Boolean)
    .map(([, type, value]) => ({ type, value }));
}

/** Extract normalized URL provenance, never URLs from 背景调研 or 参考资料. */
export function extractPrimarySourceUrlsFromMaterials(materials) {
  return [...new Set(
    extractPrimarySourceEntriesFromMaterials(materials)
      .filter((entry) => entry.type === "url")
      .map((entry) => normalizeSourceUrl(entry.value))
      .filter(Boolean),
  )];
}

/** Parse and normalize primarySourceUrls' required inline JSON array value. */
export function parsePrimarySourceUrlsValue(rawValue) {
  if (rawValue === undefined || rawValue === null) return [];
  if (typeof rawValue !== "string" || rawValue.trim() === "") {
    throw new Error("primarySourceUrls must be a non-empty inline JSON array");
  }
  let parsed;
  try {
    parsed = JSON.parse(rawValue);
  } catch (error) {
    throw new Error(`primarySourceUrls must be a JSON-compatible inline array: ${error.message}`);
  }
  if (!Array.isArray(parsed)) {
    throw new Error("primarySourceUrls must be an inline JSON array");
  }
  if (parsed.length === 0) {
    throw new Error("primarySourceUrls must contain at least one URL when present");
  }
  const normalized = [];
  for (const value of parsed) {
    if (typeof value !== "string" || !normalizeSourceUrl(value)) {
      throw new Error("primarySourceUrls entries must be non-empty http(s) URLs");
    }
    normalized.push(normalizeSourceUrl(value));
  }
  return [...new Set(normalized)];
}

export const parsePrimarySourceUrlsFrontmatter = parsePrimarySourceUrlsValue;

function isImageCdnUrl(value) {
  let parsed;
  try { parsed = new URL(value); } catch { return false; }
  const host = parsed.hostname.toLowerCase();
  return host.startsWith("cdn.")
    || /\.(?:png|jpe?g|gif|webp|svg|avif)(?:$|[?#])/iu.test(parsed.pathname)
    || host === "cdn.jsdelivr.net"
    || host === "images.unsplash.com"
    || host === "i.imgur.com"
    || host === "res.cloudinary.com"
    || host === "images.ctfassets.net"
    || host === "pbs.twimg.com";
}

function isLegacyExternalUrl(value) {
  let parsed;
  try { parsed = new URL(value); } catch { return false; }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
  if (parsed.hostname.toLowerCase() === "ntlx.github.io") return false;
  return !isImageCdnUrl(value);
}

/**
 * Conservative compatibility bridge for articles without explicit metadata:
 * inspect only the first reference list item and never scan arbitrary URLs.
 */
export function inferLegacyPrimarySource(article) {
  const lines = sectionLines(sourceText(article), "参考资料");
  if (!lines) return null;
  const firstItem = lines.find((line) => /^\s*(?:[-*+]\s+|\d+[.)]\s+)/u.test(line));
  if (!firstItem) return null;
  const url = firstItem.match(URL_RE)?.[0] ?? null;
  if (!url || !isLegacyExternalUrl(url)) return null;
  const normalizedUrl = normalizeSourceUrl(url);
  if (!normalizedUrl) return null;
  return { url, normalizedUrl, provenance: "legacy-first-reference" };
}

function articleSources(article) {
  if (Array.isArray(article?.primarySourceUrls)) {
    return {
      urls: article.primarySourceUrls.map(normalizeSourceUrl).filter(Boolean),
      provenance: article.primarySourceProvenance ?? "frontmatter",
    };
  }
  const inferred = inferLegacyPrimarySource(article);
  return inferred
    ? { urls: [inferred.normalizedUrl], provenance: inferred.provenance }
    : { urls: [], provenance: null };
}

/** Match normalized exact identities and return one diagnostic per article/source pair. */
export function findSameSourceMatches(currentSourceUrls, publishedArticles) {
  const current = [...new Set((currentSourceUrls ?? []).map(normalizeSourceUrl).filter(Boolean))];
  const matches = [];
  for (const article of publishedArticles ?? []) {
    const sources = articleSources(article);
    for (const source of sources.urls) {
      if (!current.includes(source)) continue;
      matches.push({
        source,
        slug: article.slug,
        article_slug: article.slug,
        title: article.title ?? article.slug,
        url: article.url ?? `https://ntlx.github.io/articles/${article.slug}`,
        provenance: sources.provenance,
      });
    }
  }
  return matches;
}
