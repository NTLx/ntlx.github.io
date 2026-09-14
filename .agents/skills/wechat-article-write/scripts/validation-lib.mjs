export const VALID_CATEGORIES = ["ai-coding", "ai-agents", "ai-industry", "ai-models", "security", "engineering"];

export const ASCII_SLUG_RE = /^[a-z][a-z0-9-]*[a-z0-9]$/;

const CJK_RE = /[一-鿿]/g;

/** 中文字符数 + 英文单词数 */
export function countWords(text) {
  const chineseChars = (text.match(CJK_RE) ?? []).length;
  const englishWords = text.replace(CJK_RE, " ").split(/\s+/).filter(w => /^[a-zA-Z]/.test(w)).length;
  return { total: chineseChars + englishWords, chineseChars, englishWords };
}
