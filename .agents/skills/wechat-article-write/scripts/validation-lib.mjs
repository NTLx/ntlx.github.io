/**
 * 共享验证常量、字数统计、SLOT_IMG 占位符统一模式
 *
 * 消除 step2-write / step3-polish / step4-images / step5-build /
 * apply-image-map 中对分类、slug、字数、SLOT_IMG 正则的重复定义。
 *
 * SLOT_IMG 占位符格式：<!-- SLOT_IMG_NN_DESC -->
 *   NN   = 两位数字（00-99）
 *   DESC = 可选描述，以 _ 开头，仅含 [A-Za-z0-9_-]
 *
 * 统一正则说明：
 *   检测  — 匹配完整注释，不捕获 → 用于"是否存在"
 *   提取  — 捕获 NN → 用于"哪些编号"
 *   解析  — 捕获 NN + DESC → 用于替换与映射
 *   残留  — 匹配未替换的注释开头 → 用于终态校验
 */

export const VALID_CATEGORIES = ["ai-coding", "ai-agents", "ai-industry", "ai-models", "security", "engineering"];

export const ASCII_SLUG_RE = /^[a-z][a-z0-9-]*[a-z0-9]$/;

/* ── SLOT_IMG 统一正则 ── */

/** 完整注释检测，不捕获 */
export const SLOT_DETECT_RE = /<!--\s*SLOT_IMG_\d{2}(?:_[A-Za-z0-9_-]+)?\s*-->/;

/** 提取占位符，捕获 NN */
export const SLOT_EXTRACT_RE = /<!--\s*SLOT_IMG_(\d{2})(?:_[A-Za-z0-9_-]+)?\s*-->/g;

/** 解析编号+描述，捕获 NN 和可选 DESC（不含前导 _） */
export const SLOT_RESOLVE_RE = /SLOT_IMG_(\d{2})(?:_([A-Za-z0-9_-]+))?/;

/** 残留检测：终态校验时确认无未替换的占位符 */
export const SLOT_RESIDUAL_RE = /<!--\s*SLOT_IMG_/;

/* ── SLOT_IMG 辅助函数 ── */

/** 正文是否包含至少一个 SLOT_IMG 占位符 */
export function hasSlotPlaceholders(text) {
  SLOT_EXTRACT_RE.lastIndex = 0;
  return SLOT_EXTRACT_RE.test(text);
}

/** 从文本中提取所有占位符编号（去重、升序） */
export function extractSlotNumbers(text) {
  SLOT_EXTRACT_RE.lastIndex = 0;
  const nums = new Set();
  let m;
  while ((m = SLOT_EXTRACT_RE.exec(text)) !== null) {
    nums.add(parseInt(m[1], 10));
  }
  return [...nums].sort((a, b) => a - b);
}

/**
 * 解析单个占位符字符串，返回 { slot, desc }。
 * desc 为 null 表示无描述后缀。
 */
export function resolveSlotImg(placeholder) {
  const m = placeholder.match(SLOT_RESOLVE_RE);
  if (!m) return null;
  return { slot: parseInt(m[1], 10), desc: m[2] ?? null };
}

/**
 * 替换文本中所有 SLOT_IMG 占位符。
 * @param {string} text - 源文本
 * @param {(match: string, slot: number, desc: string|null) => string} replacer
 * @returns {string}
 */
export function replaceSlotPlaceholders(text, replacer) {
  return text.replace(SLOT_EXTRACT_RE, (match, nn) => {
    const { desc } = resolveSlotImg(match);
    return replacer(match, parseInt(nn, 10), desc);
  });
}

const CJK_RE = /[一-鿿]/g;

/** 中文字符数 + 英文单词数 */
export function countWords(text) {
  const chineseChars = (text.match(CJK_RE) ?? []).length;
  const englishWords = text.replace(CJK_RE, " ").split(/\s+/).filter(w => /^[a-zA-Z]/.test(w)).length;
  return { total: chineseChars + englishWords, chineseChars, englishWords };
}