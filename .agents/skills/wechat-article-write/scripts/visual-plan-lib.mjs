/**
 * image-plan / draft SLOT 的最小拓扑协议。
 *
 * 这里只验证计划图的连通性和唯一性，不选择 Skill、不读取第三方 Skill、
 * 不生成 prompt，也不调用模型。视觉字段的 adapter-specific 校验由
 * generate-image-prompts.mjs 负责。
 */

import { existsSync, readFileSync } from "node:fs";
import { SLOT_EXTRACT_RE, normalizeSlotDesc, resolveSlotImg } from "./validation-lib.mjs";

export const VALID_PROMPT_SOURCES = new Set(["adapter", "external"]);
export const BAOYU_CORE_DESIGN_SKILLS = Object.freeze([
  "baoyu-article-illustrator",
  "baoyu-cover-image",
  "baoyu-infographic",
]);

export const BAOYU_DESIGN_AUTHORITIES = Object.freeze({
  article: "baoyu-article-illustrator",
  cover: "baoyu-cover-image",
  infographic: "baoyu-infographic",
  body: "baoyu-article-illustrator",
});

/** 缺失的旧字段按当前兼容规则解释为 adapter。 */
export function normalizePromptSource(value) {
  if (value === undefined || value === null || String(value).trim() === "") return "adapter";
  const source = String(value).trim();
  if (!VALID_PROMPT_SOURCES.has(source)) {
    throw new Error(`prompt_source must be "adapter" or "external"`);
  }
  return source;
}

/** 读取一个 image-plan.json；缺失文件返回 null，JSON 损坏由调用方显示为 Gate 错误。 */
export function readImagePlan(path) {
  if (!existsSync(path)) return null;
  const raw = readFileSync(path, "utf8");
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`invalid image-plan.json: ${error.message}`);
  }
}

/** 从 draft 正文提取 SLOT 的出现顺序、编号、描述和字符位置。 */
export function collectDraftSlots(draftBody) {
  const slots = [];
  const text = String(draftBody ?? "");
  SLOT_EXTRACT_RE.lastIndex = 0;
  let match;
  while ((match = SLOT_EXTRACT_RE.exec(text)) !== null) {
    const parsed = resolveSlotImg(match[0]);
    if (parsed) slots.push({ ...parsed, index: match.index, raw: match[0] });
  }
  return slots;
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function checkPromptSource(node, label, errors) {
  if (!isObject(node)) return;
  try {
    const source = normalizePromptSource(node.prompt_source);
    if (source === "external" && (typeof node.producer !== "string" || node.producer.trim() === "")) {
      errors.push(`${label}.producer is required when prompt_source=external`);
    }
  } catch (error) {
    errors.push(`${label}.${error.message}`);
  }
}

function checkContributors(node, label, errors) {
  if (!isObject(node) || node.contributors === undefined) return;
  if (!Array.isArray(node.contributors) || node.contributors.some((item) => typeof item !== "string" || item.trim() === "")) {
    errors.push(`${label}.contributors must be an array of non-empty strings`);
  }
}

function checkDesignAuthority(node, label, authority, errors) {
  if (!isObject(node)) return;
  const design = node.baoyu_design;
  if (!isObject(design)) {
    errors.push(`${label}.baoyu_design is required`);
  } else if (design.skill !== authority) {
    errors.push(`${label}.baoyu_design.skill must be ${authority}`);
  }
  checkContributors(node, label, errors);

  try {
    if (normalizePromptSource(node.prompt_source) === "external" &&
        node.producer !== undefined && node.producer !== authority) {
      const detail = authority === BAOYU_DESIGN_AUTHORITIES.body
        ? "baoyu-diagram may contribute diagram structure, but final body raster prompt authority must remain baoyu-article-illustrator."
        : `final ${label.replace(/^image-plan\./, "")} raster prompt authority must remain ${authority}.`;
      errors.push(`${label}.producer must be ${authority}; ${detail}`);
    }
  } catch {
    // checkPromptSource reports the invalid source and missing producer separately.
  }
}

/**
 * Validate the mandatory Baoyu design layer without selecting a Skill.
 * `allowLegacy` is reserved for explicitly requested old-plan compatibility.
 */
export function validateBaoyuDesign(imagePlan, { allowLegacy = false } = {}) {
  const errors = [];
  if (allowLegacy) return errors;
  if (!isObject(imagePlan)) return ["image-plan.json must contain an object"];

  const articleDesign = imagePlan.article_visual_design;
  if (!isObject(articleDesign)) {
    errors.push("image-plan.article_visual_design is required");
  } else if (articleDesign.skill !== BAOYU_DESIGN_AUTHORITIES.article) {
    errors.push(`image-plan.article_visual_design.skill must be ${BAOYU_DESIGN_AUTHORITIES.article}`);
  }

  checkDesignAuthority(imagePlan.cover, "image-plan.cover", BAOYU_DESIGN_AUTHORITIES.cover, errors);
  checkDesignAuthority(imagePlan.infographic, "image-plan.infographic", BAOYU_DESIGN_AUTHORITIES.infographic, errors);
  for (const [index, entry] of (imagePlan.illustrations ?? []).entries()) {
    checkDesignAuthority(entry, `image-plan.illustrations[${index}]`, BAOYU_DESIGN_AUTHORITIES.body, errors);
  }
  return errors;
}

/**
 * 验证 draft SLOT ↔ image-plan entry 的拓扑。
 *
 * 返回 { ok, errors, slots, bodySlots, entriesBySlot }，不抛出业务校验错误，
 * 便于 CLI 在不写 state 的情况下把所有诊断一次性交给 Agent。
 */
export function validateVisualPlanTopology(imagePlan, draftBody) {
  const errors = [];
  const slots = collectDraftSlots(draftBody);
  const counts = new Map();
  for (const slot of slots) counts.set(slot.slot, (counts.get(slot.slot) ?? 0) + 1);

  const slot00Count = counts.get(0) ?? 0;
  if (slot00Count !== 1) {
    errors.push(`draft must contain SLOT_IMG_00 exactly once (found ${slot00Count})`);
  }
  for (const [slot, count] of counts) {
    if (count > 1) errors.push(`draft SLOT_IMG_${String(slot).padStart(2, "0")} appears ${count} times; SLOT numbers must be unique`);
  }

  if (!isObject(imagePlan)) {
    errors.push("image-plan.json must contain an object");
    return { ok: false, errors, slots, bodySlots: slots.filter((slot) => slot.slot > 0), entriesBySlot: new Map() };
  }

  if (!isObject(imagePlan.cover)) errors.push("image-plan.cover is required");
  if (!isObject(imagePlan.infographic)) errors.push("image-plan.infographic is required");
  checkPromptSource(imagePlan.cover, "image-plan.cover", errors);
  checkPromptSource(imagePlan.infographic, "image-plan.infographic", errors);

  if (!Array.isArray(imagePlan.illustrations)) {
    errors.push("image-plan.illustrations must be an array (use [] when no body visual is needed)");
    return { ok: false, errors, slots, bodySlots: slots.filter((slot) => slot.slot > 0), entriesBySlot: new Map() };
  }

  const bodySlots = slots.filter((slot) => slot.slot > 0);
  const draftSlotNumbers = new Set(bodySlots.map((slot) => slot.slot));
  const entriesBySlot = new Map();
  for (const [index, entry] of imagePlan.illustrations.entries()) {
    const label = `image-plan.illustrations[${index}]`;
    if (!isObject(entry)) {
      errors.push(`${label} must be an object`);
      continue;
    }
    if (!Number.isInteger(entry.slot) || entry.slot < 1) {
      errors.push(`${label}.slot must be a positive integer`);
      continue;
    }
    if (!draftSlotNumbers.has(entry.slot)) {
      errors.push(`image-plan.illustrations slot ${entry.slot} has no matching body SLOT`);
    }
    if (entriesBySlot.has(entry.slot)) {
      errors.push(`image-plan.illustrations contains duplicate slot ${entry.slot}`);
    } else {
      entriesBySlot.set(entry.slot, entry);
    }
    checkPromptSource(entry, label, errors);
  }

  for (const slot of bodySlots) {
    if (!entriesBySlot.has(slot.slot)) {
      errors.push(`image-plan.illustrations is missing a plan for SLOT_IMG_${String(slot.slot).padStart(2, "0")}`);
    }
  }

  return { ok: errors.length === 0, errors, slots, bodySlots, entriesBySlot };
}

/** 与 prompt 生成器一致的正文 prompt/image basename。 */
export function visualPromptDescription(entry, draftSlot) {
  return normalizeSlotDesc(entry?.description ?? draftSlot?.desc) || "illustration";
}

/** Return only assets selected by the current draft/image-plan topology. */
export function collectActiveAssets(imagePlan, draftBody, { blogSlug, slug } = {}) {
  const topology = validateVisualPlanTopology(imagePlan, draftBody);
  const coverSlug = normalizeSlotDesc(blogSlug ?? slug) || "article";
  const assets = [
    {
      key: "cover",
      label: "cover",
      promptBasename: `00-cover-${coverSlug}`,
      outputBasename: "cover",
      outputCandidates: ["cover.png", "cover.jpg"],
      design: imagePlan?.cover?.baoyu_design ?? {},
    },
    {
      key: "SLOT_IMG_00",
      label: "SLOT_IMG_00",
      promptBasename: "00-infographic-core-summary",
      outputBasename: "00-infographic-core-summary",
      outputCandidates: ["00-infographic-core-summary.png", "00-infographic-core-summary.jpg", "00-infographic-core-summary.jpeg", "00-infographic-core-summary.webp", "00-infographic-core-summary.gif"],
      design: imagePlan?.infographic?.baoyu_design ?? {},
    },
  ];

  for (const slot of [...topology.bodySlots].sort((a, b) => a.slot - b.slot)) {
    const entry = topology.entriesBySlot.get(slot.slot) ?? {};
    const desc = visualPromptDescription(entry, slot);
    const nn = String(slot.slot).padStart(2, "0");
    assets.push({
      key: `SLOT_IMG_${nn}`,
      label: `SLOT_IMG_${nn}`,
      promptBasename: `${nn}-${desc}`,
      outputBasename: `${nn}-${desc}`,
      outputCandidates: [`${nn}-${desc}.png`, `${nn}-${desc}.jpg`, `${nn}-${desc}.jpeg`, `${nn}-${desc}.webp`, `${nn}-${desc}.gif`],
      design: entry.baoyu_design ?? {},
      slot: slot.slot,
    });
  }
  return assets;
}

export function activePromptBasenames(assets) {
  return new Set(assets.map((asset) => asset.promptBasename));
}

export function activeImageBasenames(assets) {
  return new Set(assets.flatMap((asset) => asset.outputCandidates.map((name) => name.replace(/\.(?:png|jpe?g|webp|gif)$/i, ""))));
}
