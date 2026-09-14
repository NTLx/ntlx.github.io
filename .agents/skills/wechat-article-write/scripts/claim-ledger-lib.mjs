#!/usr/bin/env bun
/**
 * claim-ledger-lib.mjs — 事实账本的共享解析与 claim 抽取
 *
 * 由 validate-understanding.mjs（检查账本内容领域是否存在）与 validate-claims.mjs
 * （检查 draft 的可证伪 claim 是否被账本覆盖）共用。两处必须使用同一常量，
 * 否则「Gate 要求账本」与「Gate 检查账本」会各自漂移。
 *
 * 本模块只做确定性文本处理：不读 state、不写文件、不产生 artifact。
 */

/** 账本节的标题判定。两个 Gate 共用，不得各自维护。 */
export const LEDGER_HEADINGS = /账本|允许援引|可援引|援引清单|ledger/i;

/**
 * claim 类与抽取正则。类标签只用于把失败输出分组，不改变判定。
 * 反事实基线（例：一个团队半年）没有词汇标记，只能靠「从一个 X 压缩到 Y」这类
 * 句式捕捉；这是本 Gate 已知的召回边界，不要假装它完备。
 */
const CLAIM_PATTERNS = [
  { cls: "quantity", source: String.raw`\d+\s*(?:万|亿|千|百|PB|TB|GB|MB|倍|个|名|人|台|次)` },
  { cls: "duration", source: String.raw`[几数半][周月年天日]|\d+\s*(?:周|月|天|小时|分钟|秒|个?季度)` },
  { cls: "year", source: String.raw`\d{4}\s*年` },
  {
    cls: "state",
    source: String.raw`都[^，。；\n]{0,8}了|已经[^，。；\n]{0,10}(?:还清|完成|下线|弃用|上线|发布)|即将|尚未|仍未|全部|唯一|首个|首次`,
  },
  { cls: "identity", source: String.raw`是同一件事|两种叫法|等同于|就是同一个|同一种东西` },
  {
    cls: "counterfactual",
    source: String.raw`从[^，。\n]{0,25}压缩到|本可以|本来需要|原本需要|从[^，。\n]{0,25}变成`,
  },
];

/** 全角折半角并去掉全部空白，用于覆盖判定；两侧用同一函数保证可比。 */
export function normalizeClaim(text) {
  return text
    .replace(/[！-～]/gu, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/\s+/gu, "");
}

/**
 * 扫描前剥离不承载事实主张的片段。
 * 必须剥掉链接 URL：`https://engineering.fb.com/2014/11/14/...` 会伪造 `2014 年` 命中。
 * 围栏代码块必须先于行内代码剥离，否则 ``` 会被当成行内代码对。
 */
export function stripDraftNoise(text) {
  return text
    .replace(/```[\s\S]*?```/gu, "")
    .replace(/`[^`\n]*`/gu, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/gu, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/gu, "$1");
}

/** 按 ATX 标题切分，返回 { heading, body } 列表。两个 Gate 共用的唯一实现。 */
export function contentSections(text) {
  const sections = [];
  let section;
  for (const line of text.split(/\r?\n/u)) {
    const heading = /^#{1,6}\s+(.+?)\s*#*\s*$/u.exec(line);
    if (heading) {
      section = { heading: heading[1], body: "" };
      sections.push(section);
    } else if (section) {
      section.body += line + "\n";
    }
  }
  return sections;
}

export function ledgerSection(briefText) {
  return contentSections(briefText).find((section) => LEDGER_HEADINGS.test(section.heading)) ?? null;
}

/**
 * 解析账本行。每行三选一：来源片段 / derived / rhetoric，claim 侧与来源侧以 ← 分隔。
 * 缺分隔符的行是结构错误，不能默认为「无来源」而放过。
 */
export function extractLedgerRows(briefText) {
  const section = ledgerSection(briefText);
  if (!section) return { found: false, rows: [], malformed: [] };
  const rows = [];
  const malformed = [];
  for (const line of section.body.split(/\r?\n/u)) {
    const item = /^\s*[-*]\s+(.*\S)\s*$/u.exec(line);
    if (!item) continue;
    const raw = item[1];
    const arrow = /←|<-/u.exec(raw);
    if (!arrow) {
      malformed.push(raw);
      continue;
    }
    rows.push({
      claim: raw.slice(0, arrow.index).trim(),
      source: raw.slice(arrow.index + arrow[0].length).trim(),
      raw,
    });
  }
  return { found: true, rows, malformed };
}

/** 抽取 draft 中的全部可证伪 claim，带类标签。 */
export function extractClaims(text) {
  const scanned = stripDraftNoise(text);
  const claims = [];
  for (const { cls, source } of CLAIM_PATTERNS) {
    for (const match of scanned.matchAll(new RegExp(source, "gu"))) {
      claims.push({ cls, text: match[0] });
    }
  }
  return claims;
}

/**
 * 覆盖判定。两类账本行语义不同，不能共用一套规则：
 *
 * - `source` / `derived` 行通过**子串包含**覆盖——账本写「协调耗时数天」，正文只出现
 *   「数天」是正常的。
 * - `rhetoric` 行不参与覆盖。它的字面意思是「这段文字不承载事实」，因此正确语义是在
 *   抽取前把该短语从正文中**移除**。若让它按子串去匹配，一条 `几周的悬案 ← rhetoric`
 *   会连带吞掉正文别处真实的 `几周`，把缺陷掩盖成通过。
 *
 * 只用精确子串，不做模糊或词重叠——判定必须能在一句话内解释清楚。
 */
export function uncoveredClaims(draftText, rows) {
  let scanned = stripDraftNoise(draftText);
  const factRows = [];
  for (const row of rows) {
    if (/^rhetoric\b/iu.test(row.source)) {
      if (row.claim) scanned = scanned.split(row.claim).join("");
    } else {
      factRows.push(row);
    }
  }
  const claimSides = factRows.map((row) => normalizeClaim(row.claim));
  const seen = new Map();
  for (const claim of extractClaims(scanned)) {
    const needle = normalizeClaim(claim.text);
    if (claimSides.some((side) => side.includes(needle))) continue;
    if (!seen.has(needle)) seen.set(needle, claim);
  }
  return [...seen.values()];
}