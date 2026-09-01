#!/usr/bin/env bun
/**
 * validate-architecture.mjs — wechat-article-write 架构静态校验
 *
 * 校验本技能及其依赖技能的架构契约（实施文档 §10/§11）：
 *   1. 自建 Skill frontmatter 合规（author / version 位于 metadata，不残留在顶层）
 *   2. workflow 声明的 hard engineering Skill 已安装
 *   3. docs 中出现的 Skill 引用无悬空依赖（不存在已删除的旧 Skill 名）
 *   4. strategy 文件存在
 *   5. .claude/skills symlink 完整且指向 .agents/skills
 *   6. SKILL.md 引用的脚本存在
 *   7. skills-lock.json 覆盖 managed 第三方技能安装
 *
 * 纯静态：不联网、不读凭据、不写文件、无发布副作用。
 *
 * 用法:
 *   bun run validate-architecture.mjs [--json]
 */

import { existsSync, readFileSync, readdirSync, realpathSync } from "node:fs";
import { basename, resolve } from "node:path";
import {
  HARD_DEPENDENCIES,
  HARD_SKILLS as WORKFLOW_HARD_SKILLS,
  STRATEGIES,
  STAGE_CONTRACTS,
  STAGE_ORDER,
  validateWorkflow,
} from "./workflow.mjs";
import { runImageBackendChecks } from "./check-image-backend.mjs";

/**
 * 专用 frontmatter 解析（Skill spec 版）
 *
 * 支持顶层标量 + metadata: 一层嵌套 + description: > 折叠块。
 * 与 frontmatter-lib.mjs 的扁平解析不同：它会把 metadata 内层键读作顶层，
 * 不适合模拟 Skill spec。此解析器仅用于架构校验，不改变文章 frontmatter 语义。
 */
function parseSkillFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const fm = {};
  let meta = null;
  let foldedKey = null; // 正在收集 description: > 折叠块
  for (const raw of m[1].split(/\r?\n/)) {
    if (raw.trim() === "" || raw.trim().startsWith("#")) continue;
    if (foldedKey) {
      const indent = raw.match(/^\s*/)[0].length;
      if (indent > foldedKey.indent) continue; // 折叠续行，忽略内容
      foldedKey = null;
    }
    const kv = raw.match(/^(\s*)([\w-]+):(?:\s*(.*))?$/);
    if (!kv) continue;
    const indent = kv[1].length;
    const key = kv[2];
    let value = (kv[3] ?? "").trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    // 顶层 metadata: 块（下一层缩进更大）
    if (indent === 0 && key === "metadata" && value === "") {
      meta = {};
      fm.metadata = meta;
      continue;
    }
    // metadata 子键
    if (indent > 0 && meta) {
      meta[key] = value;
      continue;
    }
    // 顶层标量
    if (value === ">") {
      foldedKey = { indent };
      continue; // description 折叠块内容已有形，不参与校验
    }
    fm[key] = value;
  }
  return fm;
}

const SKILL_DIR = resolve(import.meta.dir, "..");
const REPO_ROOT = resolve(SKILL_DIR, "../../..");
const SKILLS_ROOT = resolve(REPO_ROOT, ".agents/skills");
const CLAUDE_SKILLS = resolve(REPO_ROOT, ".claude/skills");
const LOCK_PATH = resolve(REPO_ROOT, "skills-lock.json");

/** 自建技能判定：frontmatter 中 metadata.author 或顶层 author 为 NTLx */
const CUSTOM_AUTHOR = "NTLx";

/** workflow 的 hard engineering Skill（缺失 = 阻断），唯一来源是 workflow.mjs */
const HARD_SKILLS = WORKFLOW_HARD_SKILLS;

/** 已被删除、不应再被任何文档引用的旧 Skill 名 */
const RETIRED_SKILL_NAMES = ["ljg-paper-river"];

/** 精确名技能（不满足 <prefix>-<word> 形态，需单独列出） */
const EXACT_SKILL_NAMES = [
  "aihot",
  "gzh-design",
  "last30days",
  "beautiful-article",
  "github-image-hosting",
  "website-observe",
  "wechat-article-write",
];

/** 已知第三方技能前缀（<prefix>-<word> 形态） */
const KNOWN_SKILL_PREFIXES = ["baoyu", "ljg", "renwei", "humanizer"];

/**
 * 从文档文本提取“看起来是第三方技能名”的候选。
 * 只接受纯技能名形态：全小写 kebab-case、第一段命中已知前缀、
 * 不含路径分隔符、不以 . 开头（避免 .baoyu-skills/、~/.cache/... 这类误报）。
 */
function skillNameCandidates(text) {
  const found = new Set();

  // ① 反引号块内的第一个 word（覆盖 `baoyu-image-gen --provider codex-cli` 这类带参数的引用）
  for (const m of text.matchAll(/`([^`\n]+)`/g)) {
    const items = m[1].trim().split(/\s+/);
    for (const raw of items) {
      const name = raw.replace(/^[./]+/, "");
      if (EXACT_SKILL_NAMES.includes(name)) found.add(name);
      else if (isPrefixedSkillName(name)) found.add(name);
    }
  }

  // ② 无反引号的裸词（如正文直接提 "调用 ljg-paper"）；排除路径残片
  for (const m of text.matchAll(/[`\s()[\]，,：:]([a-z][a-z0-9]*(-[a-z0-9]+)+)/g)) {
    const name = m[1];
    if (EXACT_SKILL_NAMES.includes(name)) found.add(name);
    else if (isPrefixedSkillName(name)) found.add(name);
  }

  return found;
}

function isPrefixedSkillName(name) {
  if (name.includes("/") || name.includes(".")) return false;
  if (name.endsWith("-*") || name.endsWith("-")) return false; // 通配符泛称，如 `baoyu-*` / `ljg-*`
  const prefix = name.split("-")[0];
  return KNOWN_SKILL_PREFIXES.includes(prefix);
}

function skillDir(name) {
  return resolve(SKILLS_ROOT, name);
}

function installedSkills() {
  return readdirSync(SKILLS_ROOT)
    .filter((name) => existsSync(resolve(skillDir(name), "SKILL.md")))
    .sort();
}

/** 读取技能 frontmatter（含 metadata 嵌套，用于校验） */
function readSkillFrontmatter(name) {
  const p = resolve(skillDir(name), "SKILL.md");
  if (!existsSync(p)) return null;
  return parseSkillFrontmatter(readFileSync(p, "utf8"));
}

/**
 * 1. 自建 Skill frontmatter 合规
 * 自定义 author / version 必须位于 metadata；顶层不得残留 author / version。
 */
function checkCustomSkillFrontmatter(errors, warnings) {
  const state = { errors, warnings };
  for (const name of installedSkills()) {
    const fm = readSkillFrontmatter(name);
    if (!fm) continue;

    const isCustom =
      fm.metadata?.author === CUSTOM_AUTHOR || fm["author"] === CUSTOM_AUTHOR;

    if (!isCustom) {
      // 第三方技能保持上游原样：即使有顶层 author 也不视为违规（例如上游自带作者字段）
      continue;
    }
    if (Object.prototype.hasOwnProperty.call(fm, "author")) {
      state.errors.push(`${name}: 自建技能 author 必须位于 metadata.author，顶层 author 已弃用`);
    }
    if (Object.prototype.hasOwnProperty.call(fm, "version")) {
      state.errors.push(`${name}: 自建技能 version 必须位于 metadata.version，顶层 version 已弃用`);
    }
    if (fm.metadata?.author !== CUSTOM_AUTHOR) {
      state.errors.push(`${name}: 自建技能缺少 metadata.author: ${CUSTOM_AUTHOR}`);
    }
    if (!fm.metadata?.version) {
      state.errors.push(`${name}: 自建技能缺少 metadata.version`);
    }
    if (!fm["license"]) {
      state.warnings.push(`${name}: 建议补 license 字段`);
    }
    if (fm["name"] && fm["name"] !== name) {
      state.errors.push(`${name}: frontmatter name 与目录名不一致（frontmatter=${fm["name"]}）`);
    }
  }
  return state;
}

/**
 * 2. workflow 声明的 hard engineering Skill 已安装
 */
function checkHardSkills(errors, warnings) {
  const state = { errors, warnings };
  for (const name of HARD_SKILLS) {
    if (!existsSync(resolve(skillDir(name), "SKILL.md"))) {
      state.errors.push(`hard engineering Skill 缺失: ${name}`);
    }
  }
  return state;
}

/**
 * 2b. Stage Contract 机器源合法，且不携带 adaptive Skill 注册表。
 */
function checkWorkflowContracts(errors, warnings) {
  const state = { errors, warnings };
  for (const error of validateWorkflow()) state.errors.push(`workflow contract: ${error}`);

  for (const [name, strategy] of Object.entries(STRATEGIES)) {
    if (!strategy.objective || !Array.isArray(strategy.stages)) continue;
    for (const stage of strategy.stages) {
      if (!Object.prototype.hasOwnProperty.call(STAGE_CONTRACTS, stage)) {
        state.errors.push(`strategy ${name} 引用不存在 Stage Contract: ${stage}`);
      }
    }
  }
  return state;
}

/**
 * 2a. Stage Contract 引用的文档和 Gate 脚本必须存在。
 * 这一步只验证协议边界，不执行任何 Gate。
 */
function checkWorkflowArtifacts(errors, warnings) {
  const state = { errors, warnings };
  for (const [stage, contract] of Object.entries(STAGE_CONTRACTS)) {
    for (const reference of contract.references ?? []) {
      if (!existsSync(resolve(SKILL_DIR, reference))) {
        state.errors.push(`Stage ${stage} 引用文件不存在: ${reference}`);
      }
    }
    const gates = contract.gates ?? (contract.gate ? [contract.gate] : []);
    for (const gate of gates) {
      if (gate?.script && !existsSync(resolve(SKILL_DIR, "scripts", gate.script))) {
        state.errors.push(`Stage ${stage} Gate 脚本不存在: scripts/${gate.script}`);
      }
    }
  }
  return state;
}

/**
 * 2d. 自适应/视觉边界防回归：正文图片没有固定数量阈值，视觉 producer
 * 不通过名称 dispatch，illustrate 的 Baoyu design layer 与 renderer 边界稳定。
 */
function checkAdaptiveVisualBoundaries(errors, warnings) {
  const state = { errors, warnings };
  const illustrateDeps = HARD_DEPENDENCIES.illustrate ?? [];
  const expectedIllustrateDeps = [
    "baoyu-article-illustrator",
    "baoyu-cover-image",
    "baoyu-infographic",
    "baoyu-diagram",
    "baoyu-image-gen",
  ];
  if (JSON.stringify(illustrateDeps) !== JSON.stringify(expectedIllustrateDeps)) {
    state.errors.push(`illustrate hard dependencies must be ${expectedIllustrateDeps.join(", ")}`);
  }

  const protocolFiles = [
    "scripts/validation-lib.mjs",
    "scripts/step2-write.mjs",
    "scripts/step3-polish.mjs",
    "scripts/step4-images.mjs",
    "scripts/workflow.mjs",
    "scripts/generate-image-prompts.mjs",
    "references/content-invariants.md",
    "references/image-policy.md",
  ];
  for (const rel of protocolFiles) {
    const path = resolve(SKILL_DIR, rel);
    if (!existsSync(path)) continue;
    const text = readFileSync(path, "utf8");
    const fixedQuantityTokens = [
      ["MIN_BODY_", "ILLUSTRATIONS"].join(""),
      ["bodyIllustration", "Count"].join(""),
      ["countBodyIllustration", "Slots"].join(""),
    ];
    if (fixedQuantityTokens.some((token) => text.includes(token))) {
      state.errors.push(`fixed body illustration quantity rule remains in ${rel}`);
    }
  }

  const generator = readFileSync(resolve(SKILL_DIR, "scripts/generate-image-prompts.mjs"), "utf8");
  if (/\bproducer\s*(?:===|!==|==|!=)\s*["'`]/.test(generator)) {
    state.errors.push("generate-image-prompts must not dispatch on producer name");
  }
  const backend = readFileSync(resolve(SKILL_DIR, "scripts/check-image-backend.mjs"), "utf8");
  if (/HIGH_LEVEL_RASTER_SKILLS|checkHighLevelConfigs/.test(backend)) {
    state.errors.push("image backend check must not keep a high-level visual Skill registry");
  }

  const rendererPath = resolve(SKILL_DIR, "scripts/render-images-serial.mjs");
  if (!existsSync(rendererPath)) {
    state.errors.push("serial image renderer missing: scripts/render-images-serial.mjs");
  } else {
    const renderer = readFileSync(rendererPath, "utf8");
    for (const token of ["--batchfile", "--jobs", "Promise.all(", "Promise.allSettled(", "worker_threads", "p-map"]) {
      if (renderer.includes(token)) state.errors.push(`serial renderer must not contain ${token}`);
    }
    if (!renderer.includes('"--provider", "codex-cli"')) {
      state.errors.push("serial renderer must explicitly invoke provider=codex-cli");
    }
    if (!renderer.includes("BAOYU_IMAGE_GEN_MAX_WORKERS: \"1\"") ||
        !renderer.includes("BAOYU_IMAGE_GEN_CODEX_CLI_CONCURRENCY: \"1\"")) {
      state.errors.push("serial renderer must cap child image workers at 1");
    }
  }

  const productionFiles = [
    resolve(SKILL_DIR, "scripts/pipeline.mjs"),
    resolve(SKILL_DIR, "scripts/visual-plan-lib.mjs"),
    resolve(SKILL_DIR, "scripts/generate-image-prompts.mjs"),
    rendererPath,
  ];
  const forbiddenRouterIdentifiers = [
    "requiredSkills",
    "optionalSkills",
    "preferredSkills",
    "skillRoutes",
    "ARTICLE_SKILL_MAP",
    "VISUAL_SKILL_MAP",
    "STYLE_SKILL_MAP",
    "ARTICLE_STYLE_MAP",
  ];
  for (const path of productionFiles) {
    if (!existsSync(path)) continue;
    const source = readFileSync(path, "utf8");
    for (const identifier of forbiddenRouterIdentifiers) {
      if (source.includes(identifier)) state.errors.push(`static Skill router identifier remains in ${basename(path)}: ${identifier}`);
    }
  }
  return state;
}

/**
 * 2e. Mandatory humanization, visual coverage, and WeChat parity boundaries.
 * These are protocol invariants, not dynamic Skill routing rules.
 */
function checkQualityProtocolBoundaries(errors, warnings) {
  const state = { errors, warnings };
  for (const stage of ["adapt", "refine"]) {
    if (!(HARD_DEPENDENCIES[stage] ?? []).includes("humanizer-zh")) {
      state.errors.push(`hard dependency ${stage} must include humanizer-zh`);
    }
  }

  const productionFiles = [
    "scripts/step2-write.mjs",
    "scripts/step3-polish.mjs",
    "scripts/step4-images.mjs",
    "scripts/step5-build.mjs",
    "scripts/step5-lib.mjs",
    "scripts/pipeline.mjs",
  ];
  const forbiddenHumanizerTokens = [
    "--no-humanizer",
    "humanizer=skip",
    "humanizer: \"skip\"",
    "humanizer === \"skip\"",
    "allowHumanizerSkip",
    "skipHumanizer",
  ];
  for (const rel of productionFiles) {
    const path = resolve(SKILL_DIR, rel);
    if (!existsSync(path)) continue;
    const source = readFileSync(path, "utf8");
    for (const token of forbiddenHumanizerTokens) {
      if (source.includes(token)) state.errors.push(`legacy humanizer skip semantic remains in ${rel}: ${token}`);
    }
  }

  const schema = readFileSync(resolve(SKILL_DIR, "references/image-plan.schema.json"), "utf8");
  for (const token of ["coverage_review", "source_image_review"]) {
    if (!schema.includes(token)) state.errors.push(`image-plan schema missing ${token} contract`);
  }
  const visualPlan = readFileSync(resolve(SKILL_DIR, "scripts/visual-plan-lib.mjs"), "utf8");
  if (!visualPlan.includes("validateVisualCoverage") || !visualPlan.includes("validateSlotHeadInvariant")) {
    state.errors.push("visual plan library must enforce coverage_review and SLOT00 head invariant");
  }

  const step5Lib = readFileSync(resolve(SKILL_DIR, "scripts/step5-lib.mjs"), "utf8");
  const step5 = readFileSync(resolve(SKILL_DIR, "scripts/step5-build.mjs"), "utf8");
  if (!step5Lib.includes("assertWechatStructuralParity") || !step5.includes("wechatSourcePath")) {
    state.errors.push("Step5 finalize must call structural parity with source Markdown and HTML");
  }

  const contentConfig = resolve(REPO_ROOT, "src/content.config.ts");
  if (existsSync(contentConfig) && readFileSync(contentConfig, "utf8").includes("infographicPosition")) {
    state.errors.push("retired infographicPosition remains in src/content.config.ts");
  }
  return state;
}

/**
 * 2c. 图片成本边界的静态配置合同。CLI 登录状态属于显式
 * check-image-backend --runtime preflight，不在此处执行。
 */
function checkImageBackendContract(errors, warnings) {
  const result = runImageBackendChecks({ root: REPO_ROOT, checkCli: false, checkEnv: false });
  for (const error of result.errors) errors.push(`image backend contract: ${error}`);
  for (const warning of result.warnings) warnings.push(`image backend contract: ${warning}`);
}

/**
 * 3. docs 中出现的 Skill 引用无悬空依赖
 * 扫描 SKILL.md + references，提取技能名候选；缺失的给 warning（可选技能），
 * 已删旧名给出 error。
 */
function checkDanglingSkillReferences(errors, warnings) {
  const state = { errors, warnings };
  const scanRoot = resolve(SKILL_DIR, "references");
  const docs = [
    resolve(SKILL_DIR, "SKILL.md"),
    ...readdirSync(scanRoot)
      .filter((f) => f.endsWith(".md"))
      .map((f) => resolve(scanRoot, f)),
  ];
  const installed = new Set(installedSkills());

  const mentioned = new Set();
  let allText = "";
  for (const p of docs) {
    if (!existsSync(p)) continue;
    const text = readFileSync(p, "utf8");
    allText += text;
    for (const s of skillNameCandidates(text)) mentioned.add(s);
  }

  for (const name of RETIRED_SKILL_NAMES) {
    // 精确匹配反引号引用，避免把「不要使用 xxx」的否定句也算进去
    if (allText.includes(`\`${name}\``) || allText.includes(`${name}`)) {
      state.errors.push(`已删除技能名仍被引用: ${name}（请迁移到替代技能组合）`);
    }
  }

  for (const name of mentioned) {
    if (!installed.has(name) && !HARD_SKILLS.includes(name)) {
      state.warnings.push(`文档引用未安装技能: ${name}`);
    }
  }
  return state;
}

/**
 * 4. strategy 文件存在
 */
function checkStrategyFiles(errors, warnings) {
  const state = { errors, warnings };
  for (const s of ["reader-response", "tutorial", "news-digest"]) {
    const p = resolve(SKILL_DIR, "references", `strategy-${s}.md`);
    if (!existsSync(p)) state.errors.push(`strategy 文件缺失: references/strategy-${s}.md`);
  }
  return state;
}

/**
 * 5. .claude/skills symlink 完整
 * 已有 symlink 必须指向 .agents/skills/<name>；缺失的给 warning。
 */
function checkSymlinks(errors, warnings) {
  const state = { errors, warnings };
  if (!existsSync(CLAUDE_SKILLS)) {
    state.warnings.push(".claude/skills 不存在，无法校验 symlink");
    return state;
  }
  for (const name of installedSkills()) {
    const link = resolve(CLAUDE_SKILLS, name);
    if (!existsSync(link)) {
      state.warnings.push(`缺少 .claude/skills/${name} symlink`);
      continue;
    }
    try {
      const target = realpathSync(link);
      if (!target.startsWith(resolve(SKILLS_ROOT, name))) {
        state.errors.push(`.claude/skills/${name} 指向错误: ${target}`);
      }
    } catch (e) {
      state.errors.push(`.claude/skills/${name} 为断链: ${e.message}`);
    }
  }
  return state;
}

/**
 * 6. SKILL.md 引用的脚本存在
 */
function checkReferencedScripts(errors, warnings) {
  const state = { errors, warnings };
  const skill = readFileSync(resolve(SKILL_DIR, "SKILL.md"), "utf8");
  const scriptsDir = resolve(SKILL_DIR, "scripts");
  const re = /\.agents\/skills\/wechat-article-write\/scripts\/([\w-]+\.(?:mjs|ts|py))/g;
  const seen = new Set();
  for (const m of skill.matchAll(re)) {
    const f = m[1];
    if (seen.has(f)) continue;
    seen.add(f);
    if (!existsSync(resolve(scriptsDir, f))) {
      state.errors.push(`SKILL.md 引用脚本不存在: scripts/${f}`);
    }
  }
  return state;
}

/**
 * 7. skills-lock.json 覆盖 managed 第三方技能安装
 */
function checkLockCoverage(errors, warnings) {
  const state = { errors, warnings };
  if (!existsSync(LOCK_PATH)) {
    state.errors.push("skills-lock.json 缺失");
    return state;
  }
  let lock;
  try {
    lock = JSON.parse(readFileSync(LOCK_PATH, "utf8"));
  } catch (e) {
    state.errors.push(`skills-lock.json 解析失败: ${e.message}`);
    return state;
  }
  for (const name of Object.keys(lock.skills ?? {})) {
    if (["wechat-article-write", "github-image-hosting", "website-observe"].includes(name)) {
      continue; // 自建技能不入 lock
    }
    if (!existsSync(resolve(skillDir(name), "SKILL.md"))) {
      state.errors.push(`skills-lock.json 中技能未安装: ${name}`);
    }
  }
  return state;
}

/** 合并各检查结果 */
export function runArchitectureChecks() {
  const errors = [];
  const warnings = [];
  checkCustomSkillFrontmatter(errors, warnings);
  checkWorkflowContracts(errors, warnings);
  checkWorkflowArtifacts(errors, warnings);
  checkAdaptiveVisualBoundaries(errors, warnings);
  checkQualityProtocolBoundaries(errors, warnings);
  checkHardSkills(errors, warnings);
  checkImageBackendContract(errors, warnings);
  checkDanglingSkillReferences(errors, warnings);
  checkStrategyFiles(errors, warnings);
  checkSymlinks(errors, warnings);
  checkReferencedScripts(errors, warnings);
  checkLockCoverage(errors, warnings);
  return { ok: errors.length === 0, errors, warnings };
}

if (import.meta.main) {
  const json = process.argv.includes("--json");
  const result = runArchitectureChecks();
  if (json) {
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  } else {
    for (const w of result.warnings) process.stdout.write(`validate-architecture: WARN ${w}\n`);
    for (const e of result.errors) process.stdout.write(`validate-architecture: FAIL ${e}\n`);
    if (result.warnings.length > 0 || result.errors.length > 0) process.stdout.write("\n");
    if (result.ok) {
      process.stdout.write(`validate-architecture: OK (${result.warnings.length} warnings)\n`);
    }
  }
  process.exit(result.ok ? 0 : 2);
}
