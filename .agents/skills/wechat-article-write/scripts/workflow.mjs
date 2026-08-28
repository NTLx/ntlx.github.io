#!/usr/bin/env bun
/**
 * workflow.mjs — 机器可读的写作流程单一来源
 *
 * 定义三个写作策略的命名阶段序列、step→stage 映射，以及各阶段依赖的 Skill。
 * SKILL.md 与 references 中的流程描述应引用本文件，不复述；pipeline.mjs、
 * state.mjs、check-deps.mjs、validate-architecture.mjs 从这里读取流程事实。
 *
 * 阶段（命名状态机，§8/§9）:
 *   prepare → research → synthesize → draft → refine → illustrate → build → publish
 *   （tutorial 用 adapt 合并 prepare→draft 之间的步骤；news-digest 无 synthesize）
 *
 * 兼容性：state 文件本体仍是 v2 数字格式（last_complete_step 1-6），
 * 命名阶段是“读时推导”的视图层，不引入新的持久化格式。旧 posts/ 状态不失效。
 */

/** 默认策略（state 未记录 strategy 时用于展示/推导） */
export const DEFAULT_STRATEGY = "reader-response";

/** 所有用到的命名阶段（去重，供依赖表引用） */
export const STAGE_ORDER = [
  "prepare", "research", "synthesize", "draft", "refine",
  "illustrate", "build", "publish",
];

/**
 * 每个策略的阶段序列与 step→stage 映射。
 * stepToStage[step] = 该 step（last_complete_step）完成后所处的阶段名；
 * last_complete_step 为数字（0=未开始，1-6=各步），兼容 v2 状态。
 *
 * dependencies：strategy-aware 的阶段依赖（§9）。
 *   required = 该策略该阶段主路径必然用到的技能（缺失 = 阻断）
 *   optional = 条件触发，不作为缺失阻断
 *   （illustrate/build/publish 是共享管线，各策略声明一致；research/draft/refine 按策略区分）
 */
export const STRATEGIES = {
  "reader-response": {
    stages: ["prepare", "research", "synthesize", "draft", "refine", "illustrate", "build", "publish"],
    // 0=策略选定，1=资料收集完成，2=创作完成，3=后处理完成，4=图片完成，5=构建完成，6=发布
    stepToStage: { 0: "prepare", 1: "research", 2: "draft", 3: "refine", 4: "illustrate", 5: "build", 6: "publish" },
    dependencies: {
      prepare: { required: [], optional: [] },
      research: {
        required: ["ljg-qa", "ljg-think"], // 强制核心问题链/论点下钻
        optional: ["aihot", "last30days", "ljg-read", "ljg-rank", "ljg-constraint", "ljg-plain", "ljg-learn", "ljg-paper", "ljg-book", "ljg-roundtable", "ljg-invest", "ljg-word", "baoyu-youtube-transcript", "baoyu-translate"],
      },
      synthesize: {
        required: [],
        optional: ["ljg-read", "ljg-rank", "ljg-constraint", "ljg-plain", "ljg-learn", "ljg-paper", "ljg-book"],
      },
      draft: {
        required: ["ljg-writes"], // 正文候选
        optional: [],
      },
      refine: {
        required: ["baoyu-format-markdown"], // Step 3 确定性 lint
        optional: ["renwei-writing", "humanizer-zh"],
      },
      illustrate: { required: ["baoyu-cover-image", "baoyu-article-illustrator", "baoyu-image-gen", "baoyu-infographic"], optional: [] },
      build: { required: ["github-image-hosting", "gzh-design"], optional: [] },
      publish: { required: ["baoyu-post-to-wechat"], optional: [] },
    },
  },
  tutorial: {
    stages: ["prepare", "adapt", "illustrate", "build", "publish"],
    // tutorial 的 Steps 1-3 合并为内容适配（adapt），无 research/synthesize/draft/refine 独立阶段
    stepToStage: { 0: "prepare", 1: "adapt", 2: "adapt", 4: "illustrate", 5: "build", 6: "publish" },
    dependencies: {
      prepare: { required: [], optional: [] },
      adapt: {
        required: [],
        optional: ["ljg-plain", "ljg-read"], // 内容适配按需白话化/理解
      },
      illustrate: { required: ["baoyu-cover-image", "baoyu-article-illustrator", "baoyu-image-gen", "baoyu-infographic"], optional: [] },
      build: { required: ["github-image-hosting", "gzh-design"], optional: [] },
      publish: { required: ["baoyu-post-to-wechat"], optional: [] },
    },
  },
  "news-digest": {
    stages: ["prepare", "research", "draft", "refine", "illustrate", "build", "publish"],
    stepToStage: { 0: "prepare", 1: "research", 2: "draft", 3: "refine", 4: "illustrate", 5: "build", 6: "publish" },
    dependencies: {
      prepare: { required: [], optional: [] },
      research: {
        required: ["aihot"], // 候选发现
        optional: ["last30days", "ljg-read"],
      },
      draft: {
        required: [], // 禁止 ljg-writes：简报由本策略的结构化写作合同直接产出
        optional: [],
      },
      refine: {
        required: ["baoyu-format-markdown"],
        optional: ["humanizer-zh"],
      },
      illustrate: { required: ["baoyu-cover-image", "baoyu-article-illustrator", "baoyu-image-gen", "baoyu-infographic"], optional: [] },
      build: { required: ["github-image-hosting", "gzh-design"], optional: [] },
      publish: { required: ["baoyu-post-to-wechat"], optional: [] },
    },
  },
};

/** 取某策略某阶段的依赖表；策略或阶段无效 → null */
export function dependenciesFor(strategy, stage) {
  const s = STRATEGIES[strategy];
  if (!s) return null;
  return s.dependencies?.[stage] ?? null;
}

/** 某策略某阶段 required 技能；无效 → [] */
export function requiredSkillsFor(strategy, stage) {
  return dependenciesFor(strategy, stage)?.required ?? [];
}

/** 某策略某阶段 optional 技能；无效 → [] */
export function optionalSkillsFor(strategy, stage) {
  return dependenciesFor(strategy, stage)?.optional ?? [];
}

/** 所有策略 required 技能的去重全集（任一策略运行都不得缺这些技能） */
export const REQUIRED_SKILLS = [
  ...new Set(
    Object.values(STRATEGIES).flatMap((s) =>
      Object.values(s.dependencies ?? {}).flatMap((d) => d.required ?? [])
    )
  ),
].sort();

/** 兼容旧引用：按 stage 聚合所有策略的 required（供 check-deps 等按 stage 检查用） */
export function requiredSkillsForStage(stage) {
  return [
    ...new Set(
      Object.values(STRATEGIES).flatMap((s) => (s.dependencies?.[stage]?.required ?? []))
    ),
  ].sort();
}

/** 阶段 → 应阅读的文档引用（§18 pipeline 只输出 next + read，不复述规则） */
export function stageReadRef(strategy, stage) {
  if (["illustrate", "build", "publish"].includes(stage)) {
    return "references/pipeline-overview.md";
  }
  return `references/strategy-${strategy}.md`;
}

/** 取策略定义；未知策略返回 null（调用方应显示 unknown，不要静默冒充默认策略） */
export function strategyFor(name) {
  return STRATEGIES[name] ?? null;
}

/** 策略名是否已知 */
export function isKnownStrategy(name) {
  return name != null && Object.prototype.hasOwnProperty.call(STRATEGIES, name);
}

/** 初始化全阶段 pending 视图（v3 展示用；不写盘）。未知策略 → null */
export function initStages(strategy) {
  const s = strategyFor(strategy);
  if (!s) return null;
  return Object.fromEntries(s.stages.map((st) => [st, "pending"]));
}

/** last_complete_step → 已完成阶段名（读时推导）。未知策略 → "unknown" */
export function stageForStep(strategy, lastCompleteStep) {
  const s = strategyFor(strategy);
  if (!s) return lastCompleteStep >= 6 ? "publish" : "unknown";
  const st = s.stepToStage[lastCompleteStep] ?? (lastCompleteStep >= 6 ? "publish" : s.stages[0]);
  return st;
}

/**
 * 推导“下一个”应执行的阶段。
 * - strategy 未知 → "unknown"（不冒充任何具体策略）
 * - publish 部分完成（blog/wechat 其一 done 而另一 pending）→ 仍是 publish
 * - 全部完成 → "done"
 * - 否则 → 返回完成阶段的下一个
 */
export function nextStageFromStep(strategy, lastCompleteStep, publish = {}) {
  const s = strategyFor(strategy);
  if (!s) return "unknown";

  const current = stageForStep(strategy, lastCompleteStep);

  if (current === "publish") {
    const blogDone = publish.blog === "done" || publish.blog === "blocked";
    const wechatDone = publish.wechat === "done";
    if (blogDone && wechatDone) return "done";
    return "publish";
  }

  const idx = s.stages.indexOf(current);
  if (idx === -1) return s.stages[0];
  return s.stages[idx + 1] ?? "done";
}