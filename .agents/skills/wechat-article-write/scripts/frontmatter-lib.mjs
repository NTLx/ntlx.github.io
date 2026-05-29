/**
 * 共享 frontmatter 解析
 *
 * 消除 step2-write（readFm via set-frontmatter spawn）、step3-polish（parseFrontmatter 内联）、
 * publish-blog（splitFm + parseFm 内联）、step5-build（readFmValue 内联）中的重复实现。
 *
 * 提供 parseFrontmatter（从文本解析）和 readFmValue（从文本提取单字段）两种接口。
 */

/** 从 Markdown 文本解析完整 frontmatter 对象 */
export function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^(\w[\w-]*):\s*(.+)/);
    if (!kv) continue;
    let v = kv[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    fm[kv[1]] = v;
  }
  return fm;
}

/** 从 Markdown 文本提取单个 frontmatter 值 */
export function readFmValue(text, key) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return "";
  const line = m[1].split(/\r?\n/).find(l => l.startsWith(`${key}:`));
  if (!line) return "";
  return line.slice(key.length + 1).trim().replace(/^["']|["']$/g, "");
}

/** 从 Markdown 文文提取正文（frontmatter 之后的内容） */
export function extractBody(text) {
  const m = text.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return m ? text.slice(m[0].length) : text;
}