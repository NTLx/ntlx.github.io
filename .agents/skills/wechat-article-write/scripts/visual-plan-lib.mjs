/**
 * image-plan / draft SLOT 的最小拓扑协议。
 *
 * 这里只验证计划图的连通性、producer authority 和项目视觉合同，不选择
 * Skill、不读取第三方 Skill、不调用模型。canonical prompt 由选定 producer
 * 先产出，再由 finalizeCanonicalPrompt 注入项目不可变约束。
 */

import { existsSync, readFileSync } from "node:fs";
import { SLOT_EXTRACT_RE, normalizeSlotDesc, resolveSlotImg } from "./validation-lib.mjs";

export const VALID_PROMPT_SOURCES = new Set(["external"]);
export const BAOYU_CORE_DESIGN_SKILLS = Object.freeze([
  "baoyu-cover-image",
  "baoyu-xhs-images",
  "baoyu-infographic",
]);

export const BAOYU_DESIGN_AUTHORITIES = Object.freeze({
  article: "wechat-article-write-agent",
  cover: "baoyu-cover-image",
  infographic: "baoyu-xhs-images",
  body: "baoyu-infographic",
});

const NON_SUBSTANTIVE_HEADINGS = new Set(["参考资料", "延伸阅读"]);
const COVERAGE_DECISIONS = new Set(["illustrate", "reuse-source", "text-only"]);
const SOURCE_IMAGE_DECISIONS = new Set(["cover-only", "body", "both", "discard"]);
const SOURCE_IMAGE_POLICIES = new Set(["prefer-reuse", "neutral", "no-reuse"]);
const SOURCE_EXCEPTION_CODES = new Set(["irrelevant", "duplicate", "redundant", "low-quality", "unreadable", "legal-risk", "incompatible"]);
const TEXT_DENSITIES = new Set(["none", "low", "medium"]);

export const VISUAL_CONTRACT_START = "<!-- WECHAT_ARTICLE_VISUAL_CONTRACT_START -->";
export const VISUAL_CONTRACT_END = "<!-- WECHAT_ARTICLE_VISUAL_CONTRACT_END -->";

function visualContractText(profile, { role, aspect, textDensity }) {
  const defaultStyleLines = profile.id === "bright-vivid-warm"
    ? [
      "- Bright high-key visual treatment.",
      "- Vivid, high-saturation colors.",
      "- Strong visual/color contrast.",
      "- Clean and uncluttered background.",
      "- Crisp, clear shapes and details.",
      "- Warm and optimistic overall atmosphere.",
      "- Energetic and positive rather than gloomy or oppressive.",
    ]
    : [
      `- Explicit user visual override: ${profile.override_reason ?? "custom direction"}.`,
      "- Follow the explicit user visual direction recorded in image-plan.json.",
    ];
  const lines = [
    VISUAL_CONTRACT_START,
    "",
    `Project visual profile: ${profile.id}`,
    "",
    ...defaultStyleLines,
    "",
    `Role: ${role}`,
    `Text density: ${textDensity}`,
  ];
  if (aspect) lines.push(`Aspect ratio: ${aspect}`);
  lines.push(
    role === "cover"
      ? "- No visible text by default; rely on visual metaphor, subject composition, color, and spatial relationships."
      : role === "header-infographic"
        ? "- Use short labels only; do not copy prose, paragraphs, dates, version numbers, or figure numbers."
        : "- Keep any text concise and information-bearing; do not use long copy, dates, version numbers, or figure numbers.",
    "- Do not add dimension lines, engineering borders, title blocks, or meaningless decorative English text.",
    // Style-neutral quality floor: holds for any visual direction, including an
    // explicit user override.
    "- Keep contrast and visual hierarchy clear; avoid dirty or over-complicated backgrounds.",
    // Palette and mood constraints belong to the project default profile only. Under a
    // custom override they would contradict the recorded user direction (for example an
    // explicitly requested dark cyberpunk look).
    ...(profile.id === "bright-vivid-warm"
      ? [
        "- Avoid dark dominant backgrounds, muddy or desaturated colors, and cold oppressive mood.",
        "- Unless the user explicitly overrides the project profile, preserve the bright, vivid, high-contrast, clean, crisp, warm-positive result.",
      ]
      : []),
    VISUAL_CONTRACT_END,
  );
  return lines.join("\n");
}

/** Add only project-owned immutable constraints to an external prompt. */
export function finalizeCanonicalPrompt(prompt, { profile, role, aspect, textDensity } = {}) {
  if (typeof prompt !== "string" || prompt.trim() === "") throw new Error("canonical prompt must be a non-empty string");
  if (!profile || typeof profile.id !== "string" || !role || !TEXT_DENSITIES.has(textDensity)) {
    throw new Error("visual prompt finalize requires profile, role, and a valid textDensity");
  }
  const source = prompt.trimEnd();
  const start = source.indexOf(VISUAL_CONTRACT_START);
  const end = source.indexOf(VISUAL_CONTRACT_END);
  if (start >= 0 && end >= start) return source.slice(0, start).trimEnd() + "\n\n" + visualContractText(profile, { role, aspect, textDensity }) + "\n";
  return `${source}\n\n${visualContractText(profile, { role, aspect, textDensity })}\n`;
}

export function validateCanonicalPrompt(prompt, { profile, role, aspect, textDensity } = {}) {
  const errors = [];
  if (typeof prompt !== "string" || prompt.trim() === "") return ["canonical prompt must be a non-empty string"];
  if (!profile?.id) errors.push("canonical prompt profile is missing");
  if ((prompt.match(new RegExp(VISUAL_CONTRACT_START, "g")) ?? []).length !== 1 ||
      (prompt.match(new RegExp(VISUAL_CONTRACT_END, "g")) ?? []).length !== 1) {
    errors.push("canonical prompt must contain exactly one project visual contract");
  }
  if (profile?.id && !prompt.includes(`Project visual profile: ${profile.id}`)) {
    errors.push(`canonical prompt must declare visual profile ${profile.id}`);
  }
  if (profile?.id === "bright-vivid-warm") {
    for (const line of [
      "Bright high-key visual treatment.",
      "Vivid, high-saturation colors.",
      "Strong visual/color contrast.",
      "Clean and uncluttered background.",
      "Crisp, clear shapes and details.",
      "Warm and optimistic overall atmosphere.",
      "Energetic and positive rather than gloomy or oppressive.",
    ]) {
      if (!prompt.includes(line)) errors.push(`canonical prompt must contain visual contract: ${line}`);
    }
  } else if (profile?.override_reason && !prompt.includes(`Explicit user visual override: ${profile.override_reason}.`)) {
    errors.push("custom canonical prompt must record the explicit visual override");
  }
  if (role === "cover") {
    if (!prompt.includes("Aspect ratio: 2.35:1")) errors.push("cover canonical prompt must contain Aspect ratio: 2.35:1");
    if (/Aspect ratio:\s*16:9/iu.test(prompt)) errors.push("cover canonical prompt must not contain Aspect ratio: 16:9");
  }
  if (aspect && !prompt.includes(`Aspect ratio: ${aspect}`)) errors.push(`canonical prompt must contain Aspect ratio: ${aspect}`);
  if (textDensity && !prompt.includes(`Text density: ${textDensity}`)) errors.push(`canonical prompt must declare text density ${textDensity}`);
  return errors;
}

function normalizedHeading(value) {
  return String(value ?? "")
    .replace(/\s+#+\s*$/u, "")
    .trim()
    .replace(/\s+/gu, " ");
}

/** Extract substantive H2 sections, ignoring fenced code and fixed tail blocks. */
export function collectSubstantiveSections(body) {
  const sections = [];
  const text = String(body ?? "");
  let offset = 0;
  let inFence = false;
  for (const line of text.match(/[^\r\n]*(?:\r?\n|$)/gu) ?? []) {
    const fence = /^\s*```/u.test(line);
    if (fence) {
      inFence = !inFence;
      offset += line.length;
      continue;
    }
    if (!inFence) {
      const match = line.match(/^\s*##(?!#)\s+(.+?)\s*$/u);
      if (match) {
        const heading = normalizedHeading(match[1]);
        if (heading && !NON_SUBSTANTIVE_HEADINGS.has(heading)) {
          sections.push({
            section_index: sections.length + 1,
            heading,
            start: offset,
          });
        }
      }
    }
    offset += line.length;
    if (line.length === 0) break;
  }
  return sections;
}

/** Extract Markdown image references, excluding fenced code blocks. */
export function collectMarkdownImages(body) {
  const images = [];
  const text = String(body ?? "");
  let offset = 0;
  let inFence = false;
  for (const line of text.match(/[^\r\n]*(?:\r?\n|$)/gu) ?? []) {
    if (/^\s*```/u.test(line)) {
      inFence = !inFence;
      offset += line.length;
      continue;
    }
    if (!inFence) {
      const imageRe = /!\[[^\]]*\]\(([^)\s]+)(?:\s+[^)]*)?\)/gu;
      let match;
      while ((match = imageRe.exec(line)) !== null) {
        images.push({ src: match[1], index: offset + match.index });
      }
    }
    offset += line.length;
    if (line.length === 0) break;
  }
  return images;
}

function sectionIndexAtPosition(position, sections) {
  let sectionIndex = 0;
  for (const section of sections) {
    if (section.start > position) break;
    sectionIndex = section.section_index;
  }
  return sectionIndex;
}

function sourceImageBasename(value) {
  let text = String(value ?? "").trim();
  try { text = decodeURIComponent(text); } catch {}
  text = text.split(/[?#]/u, 1)[0];
  return text.split("/").at(-1)?.toLowerCase() ?? "";
}

export function normalizeSourceImageKey(value) {
  return sourceImageBasename(value);
}

function sameSourceImage(left, right) {
  return sourceImageBasename(left) !== "" && sourceImageBasename(left) === sourceImageBasename(right);
}

function nonEmptyString(value) {
  return typeof value === "string" && value.trim() !== "";
}

/** Enforce SLOT00's lead position and first-body-visual invariant. */
export function validateSlotHeadInvariant(draftBody) {
  const errors = [];
  const slots = collectDraftSlots(draftBody);
  const slot00 = slots.filter((slot) => slot.slot === 0);
  if (slot00.length !== 1) return errors;

  const sections = collectSubstantiveSections(draftBody);
  const firstSection = sections[0];
  if (firstSection && slot00[0].index >= firstSection.start) {
    errors.push("SLOT_IMG_00_INFOGRAPHIC must appear before the first substantive H2 in the lead area");
  }

  const visuals = [
    ...slots.map((slot) => ({ index: slot.index, kind: `SLOT_IMG_${String(slot.slot).padStart(2, "0")}` })),
    ...collectMarkdownImages(draftBody).map((image) => ({ index: image.index, kind: "source-image" })),
  ].sort((left, right) => left.index - right.index);
  if (visuals[0]?.kind !== "SLOT_IMG_00") {
    errors.push("SLOT_IMG_00_INFOGRAPHIC must be the first body visual image");
  }
  return errors;
}

function validateSourceImageReview(imagePlan, draftBody, errors) {
  const review = imagePlan?.source_image_review;
  if (!Array.isArray(review)) {
    errors.push("image-plan.source_image_review must be an array (use [] when no original source images were supplied)");
    return [];
  }

  const images = collectMarkdownImages(draftBody);
  const seen = new Set();
  for (const [index, entry] of review.entries()) {
    const label = `image-plan.source_image_review[${index}]`;
    if (!isObject(entry)) {
      errors.push(`${label} must be an object`);
      continue;
    }
    if (!nonEmptyString(entry.source)) errors.push(`${label}.source must be a non-empty string`);
    if (typeof entry.reusable !== "boolean") errors.push(`${label}.reusable must be a boolean`);
    if (!SOURCE_IMAGE_DECISIONS.has(entry.decision)) errors.push(`${label}.decision must be one of cover-only, body, both, discard`);
    if (!nonEmptyString(entry.reason)) errors.push(`${label}.reason must be a non-empty string`);
    if (entry.exception_code !== undefined && !SOURCE_EXCEPTION_CODES.has(entry.exception_code)) {
      errors.push(`${label}.exception_code must be one of ${[...SOURCE_EXCEPTION_CODES].join(", ")}`);
    }
    if (entry.reusable === true && ["cover-only", "discard"].includes(entry.decision) && !SOURCE_EXCEPTION_CODES.has(entry.exception_code)) {
      errors.push(`${label} reusable=true with decision=${entry.decision} requires exception_code`);
    }
    if (["body", "both"].includes(entry.decision) && entry.reusable !== true) {
      errors.push(`${label} decision=${entry.decision} requires reusable=true`);
    }
    const sourceKey = sourceImageBasename(entry.source);
    if (sourceKey && seen.has(sourceKey)) errors.push(`${label}.source is duplicated`);
    if (sourceKey) seen.add(sourceKey);
    const refs = images.filter((image) => sameSourceImage(image.src, entry.source));
    if (["body", "both"].includes(entry.decision) && refs.length === 0) {
      errors.push(`${label} decision=${entry.decision} requires the source image to be referenced in draft.md`);
    }
    if (entry.decision === "cover-only" && refs.length > 0) {
      errors.push(`${label} decision=cover-only cannot be used as a body image; mark it body/both or remove the body reference`);
    }
  }
  return review;
}

/**
 * Validate that every substantive section received an explicit visual decision.
 * This is a completeness contract, not a recommendation about how many images
 * an article should contain.
 */
export function validateVisualCoverage(imagePlan, draftBody) {
  const errors = [];
  const sourcePolicy = imagePlan?.source_image_policy;
  if (!SOURCE_IMAGE_POLICIES.has(sourcePolicy)) {
    errors.push(`image-plan.source_image_policy must be one of prefer-reuse, neutral, no-reuse`);
  }
  const sections = collectSubstantiveSections(draftBody);
  const coverage = imagePlan?.article_visual_design?.coverage_review;
  const sourceReview = validateSourceImageReview(imagePlan, draftBody, errors);
  const sourceReviewByBasename = new Map(
    sourceReview
      .filter((entry) => isObject(entry))
      .map((entry) => [sourceImageBasename(entry.source), entry]),
  );

  if (sourcePolicy === "prefer-reuse" && sourceReview.some((entry) => isObject(entry) && entry.reusable === true)) {
    const reused = sourceReview.some((entry) => isObject(entry) && entry.reusable === true && ["body", "both"].includes(entry.decision));
    if (!reused) errors.push("source_image_policy=prefer-reuse requires at least one reusable source image decision=body or both");
  }

  if (!Array.isArray(coverage)) {
    errors.push("image-plan.article_visual_design.coverage_review must be an array with one entry per substantive H2");
  } else {
    if (coverage.length !== sections.length) {
      errors.push(`coverage_review must contain exactly one entry per substantive H2 (expected ${sections.length}, found ${coverage.length})`);
    }
    const byIndex = new Map();
    for (const [index, entry] of coverage.entries()) {
      const label = `image-plan.article_visual_design.coverage_review[${index}]`;
      if (!isObject(entry)) {
        errors.push(`${label} must be an object`);
        continue;
      }
      if (!Number.isInteger(entry.section_index) || entry.section_index < 1) {
        errors.push(`${label}.section_index must be a positive integer`);
        continue;
      }
      if (byIndex.has(entry.section_index)) errors.push(`coverage_review contains duplicate section_index ${entry.section_index}`);
      byIndex.set(entry.section_index, entry);
      if (!nonEmptyString(entry.heading)) errors.push(`${label}.heading must be a non-empty string`);
      if (!COVERAGE_DECISIONS.has(entry.decision)) errors.push(`${label}.decision must be one of illustrate, reuse-source, text-only`);
      if (!nonEmptyString(entry.reason)) errors.push(`${label}.reason must be a non-empty string`);
    }

    const slots = collectDraftSlots(draftBody).filter((slot) => slot.slot > 0);
    const plannedSlots = new Set((imagePlan?.illustrations ?? []).map((entry) => entry?.slot).filter((slot) => Number.isInteger(slot)));
    const usedCoverageSlots = new Set();
    for (const section of sections) {
      const entry = byIndex.get(section.section_index);
      if (!entry) {
        errors.push(`coverage_review is missing section_index ${section.section_index} (${section.heading})`);
        continue;
      }
      const nextSection = sections[section.section_index] ?? null;
      const inSection = (position) => position >= section.start && (!nextSection || position < nextSection.start);
      const sectionSlots = slots.filter((slot) => inSection(slot.index));
      const sectionImages = collectMarkdownImages(draftBody).filter((image) => inSection(image.index));

      if (entry.decision === "illustrate") {
        if (!Number.isInteger(entry.slot) || entry.slot < 1) {
          errors.push(`coverage section_index ${section.section_index} decision=illustrate requires slot >= 1`);
        } else {
          const slot = slots.find((candidate) => candidate.slot === entry.slot);
          if (!slot) {
            errors.push(`coverage section_index ${section.section_index} references missing SLOT_IMG_${String(entry.slot).padStart(2, "0")}`);
          } else if (!inSection(slot.index)) {
            errors.push(`coverage section_index ${section.section_index} SLOT_IMG_${String(entry.slot).padStart(2, "0")} belongs to section_index ${sectionIndexAtPosition(slot.index, sections)}`);
          }
          if (!plannedSlots.has(entry.slot)) errors.push(`coverage section_index ${section.section_index} SLOT_IMG_${String(entry.slot).padStart(2, "0")} has no image-plan.illustrations entry`);
          if (usedCoverageSlots.has(entry.slot)) errors.push(`coverage_review reuses SLOT_IMG_${String(entry.slot).padStart(2, "0")} more than once`);
          usedCoverageSlots.add(entry.slot);
        }
        if (sectionSlots.length === 0) {
          errors.push(`coverage section_index ${section.section_index} decision=illustrate must account for a body SLOT in that section`);
        }
        if (sectionImages.length > 0) errors.push(`coverage section_index ${section.section_index} cannot be illustrate while also containing a source image reference`);
      } else if (entry.decision === "reuse-source") {
        if (!nonEmptyString(entry.source)) errors.push(`coverage section_index ${section.section_index} decision=reuse-source requires source`);
        const sourceRefs = sectionImages.filter((image) => sameSourceImage(image.src, entry.source));
        if (sourceRefs.length === 0) errors.push(`coverage section_index ${section.section_index} source image ${entry.source ?? "(missing)"} is not referenced in that section`);
        const disposition = sourceReviewByBasename.get(sourceImageBasename(entry.source));
        if (!disposition || !["body", "both"].includes(disposition.decision)) {
          errors.push(`coverage section_index ${section.section_index} source ${entry.source ?? "(missing)"} needs source_image_review decision=body or both`);
        }
        if (sectionSlots.length > 0) errors.push(`coverage section_index ${section.section_index} cannot be reuse-source while containing a generated SLOT`);
      } else if (entry.decision === "text-only") {
        if (sectionSlots.length > 0 || sectionImages.length > 0) {
          errors.push(`coverage section_index ${section.section_index} decision=text-only conflicts with a body visual reference`);
        }
      }
    }
  }

  errors.push(...validateSlotHeadInvariant(draftBody));
  return { ok: errors.length === 0, errors, sections };
}

/** Prompt source is explicit so the external producer boundary cannot be skipped. */
export function normalizePromptSource(value) {
  if (value === undefined || value === null || String(value).trim() === "") {
    throw new Error(`prompt_source must be "external"`);
  }
  const source = String(value).trim();
  if (!VALID_PROMPT_SOURCES.has(source)) {
    throw new Error(`prompt_source must be "external"`);
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
  if (!nonEmptyString(node.intent)) errors.push(`${label}.intent must be a non-empty string`);
  const design = node.baoyu_design;
  if (!isObject(design)) {
    errors.push(`${label}.baoyu_design is required`);
  } else if (design.skill !== authority) {
    errors.push(`${label}.baoyu_design.skill must be ${authority}`);
  }
  if (typeof node.producer !== "string" || node.producer.trim() === "") {
    errors.push(`${label}.producer is required and must be ${authority}`);
  } else if (node.producer !== authority) {
    errors.push(`${label}.producer must be ${authority}`);
  }
  checkContributors(node, label, errors);
}

/**
 * Validate the mandatory Baoyu design layer without selecting a Skill.
 */
export function validateBaoyuDesign(imagePlan) {
  const errors = [];
  if (!isObject(imagePlan)) return ["image-plan.json must contain an object"];

  if (imagePlan.visual_profile !== "bright-vivid-warm" && imagePlan.visual_profile !== "custom") {
    errors.push("image-plan.visual_profile must be bright-vivid-warm or custom");
  }
  if (imagePlan.visual_profile === "custom" && !nonEmptyString(imagePlan.visual_override_reason)) {
    errors.push("image-plan.visual_override_reason is required when visual_profile=custom");
  }
  if (!SOURCE_IMAGE_POLICIES.has(imagePlan.source_image_policy)) {
    errors.push("image-plan.source_image_policy must be one of prefer-reuse, neutral, no-reuse");
  }

  const articleDesign = imagePlan.article_visual_design;
  if (!isObject(articleDesign)) {
    errors.push("image-plan.article_visual_design is required");
  } else if (articleDesign.planner !== BAOYU_DESIGN_AUTHORITIES.article) {
    errors.push(`image-plan.article_visual_design.planner must be ${BAOYU_DESIGN_AUTHORITIES.article}`);
  }

  checkDesignAuthority(imagePlan.cover, "image-plan.cover", BAOYU_DESIGN_AUTHORITIES.cover, errors);
  checkDesignAuthority(imagePlan.infographic, "image-plan.infographic", BAOYU_DESIGN_AUTHORITIES.infographic, errors);
  const coverDesign = imagePlan.cover?.baoyu_design;
  if (coverDesign?.aspect !== "2.35:1") errors.push("image-plan.cover.baoyu_design.aspect must be 2.35:1");
  if (coverDesign?.text !== "none") errors.push("image-plan.cover.baoyu_design.text must be none");
  const infoDesign = imagePlan.infographic?.baoyu_design;
  if (infoDesign?.card_count !== 1) errors.push("image-plan.infographic.baoyu_design.card_count must be 1");
  if (imagePlan.infographic?.text_density !== "low") errors.push("image-plan.infographic.text_density must be low");
  if (imagePlan.infographic?.has_long_copy !== false) errors.push("image-plan.infographic.has_long_copy must be false");
  if (!Array.isArray(imagePlan.illustrations)) {
    errors.push("image-plan.illustrations must be an array");
  } else {
    for (const [index, entry] of imagePlan.illustrations.entries()) {
      checkDesignAuthority(entry, `image-plan.illustrations[${index}]`, BAOYU_DESIGN_AUTHORITIES.body, errors);
      if (!TEXT_DENSITIES.has(entry?.text_density) || entry.text_density === "none" || entry.text_density === "high") {
        errors.push(`image-plan.illustrations[${index}].text_density must be low or medium`);
      }
      if (entry?.has_long_copy !== false) errors.push(`image-plan.illustrations[${index}].has_long_copy must be false`);
    }
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
      textDensity: "none",
    },
    {
      key: "SLOT_IMG_00",
      label: "SLOT_IMG_00",
      promptBasename: "00-infographic-core-summary",
      outputBasename: "00-infographic-core-summary",
      outputCandidates: ["00-infographic-core-summary.png", "00-infographic-core-summary.jpg", "00-infographic-core-summary.jpeg", "00-infographic-core-summary.webp", "00-infographic-core-summary.gif"],
      design: imagePlan?.infographic?.baoyu_design ?? {},
      textDensity: "low",
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
      // text_density 位于 illustration entry 根层，不在 baoyu_design 内；显式带出，
      // 使 renderer 能在消耗生图资源之前完成 text-density 契约校验。
      textDensity: entry.text_density ?? null,
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
