#!/usr/bin/env bun
/**
 * workflow.mjs — 机器可读的写作流程单一来源
 *
 * 这里描述的是策略、阶段合同和确定性工程依赖，不是第三方 Skill
 * 路由表。内容理解、写作和视觉方法在运行时由 Agent 根据
 * references/orchestration-policy.md 与 skill-catalog.mjs 自主选择。
 *
 * 数字 Step 和 state 文件保持 v2 兼容；命名阶段只是读时推导的视图。
 */

/** 默认策略（state 未记录 strategy 时用于展示/推导） */
export const DEFAULT_STRATEGY = "reader-response";

/** 所有阶段的展示顺序；策略可以使用其中的子集。 */
export const STAGE_ORDER = [
  "prepare", "research", "synthesize", "adapt", "draft", "refine",
  "illustrate", "build", "publish",
];

// Adaptive stage 只描述目标和验收合同；这些字段一旦出现，就会把合同
// 退化成静态 Skill registry。illustrate 的 hard backend policy 仍通过
// mode/acceptance 表达，不需要在合同中登记候选 Skill。
const ADAPTIVE_ROUTING_FIELDS = new Set([
  "dependencies",
  "requiredSkills",
  "optionalSkills",
  "preferredSkills",
  "skills",
  "skill",
  "skillRoutes",
  "routes",
  "router",
]);

/**
 * 阶段合同：定义目标、输入、产物、验收标准和 Gate。
 *
 * mode=adaptive 的阶段允许 Agent 原生完成、选择一个 Skill，或组合少量
 * 互补 Skill；stage contract 而不是某个 Skill 的返回值定义成功。
 */
export const STAGE_CONTRACTS = {
  prepare: {
    mode: "deterministic",
    goal: "确定编辑策略、文章目录和可续跑的初始状态。",
    inputs: ["用户目标", "原始材料"],
    outputs: [],
    acceptance: [
      "策略属于已登记的三种编辑任务",
      "date-slug 与工作目录已明确",
      "状态文件可以从当前断点恢复",
    ],
    references: ["references/pipeline-overview.md", "references/originality-policy.md"],
  },
  research: {
    mode: "adaptive",
    goal: "补齐完成文章判断所需的事实、背景和时效性材料。",
    inputs: ["用户目标", "原始材料", "当前 strategy", "已有 artifacts"],
    outputs: ["materials.md"],
    acceptance: [
      "关键事实有可追溯来源",
      "重要背景缺口已经处理，无法确认的部分被标明",
      "事实、推断和观点可以区分",
    ],
    gate: { script: "step1-collect.mjs" },
    references: ["references/orchestration-policy.md", "references/pipeline-overview.md"],
  },
  synthesize: {
    mode: "adaptive",
    goal: "把材料压缩成可执行的理解和写作契约。",
    inputs: ["materials.md", "blog-memory.md", "用户意图", "前一步 Gate 结果"],
    outputs: ["understanding-brief.md"],
    acceptance: [
      "核心问题明确",
      "中心判断明确且能区分证据与解释",
      "重要边界、反方和可视觉化节点明确",
      "形成可执行写作契约，并列出至少三条原创增量承诺",
    ],
    gate: { script: "validate-understanding.mjs" },
    references: ["references/orchestration-policy.md", "references/material-understanding.md"],
  },
  adapt: {
    mode: "adaptive",
    goal: "把已有内容适配成满足仓库协议的双轨文章草稿。",
    inputs: ["已有博文或文档", "用户目标", "当前 strategy", "已有 artifacts"],
    outputs: ["draft.md", "image-plan.json"],
    acceptance: [
      "知识内容准确保留，仓库 frontmatter 和链接协议完整",
      "正文结构、SLOT 语义和视觉计划服务于读者理解",
      "教程特有的 sourceUrl/targetPath 规则已明确",
      "最终适配稿经过 mandatory humanizer-zh，且当前 draft 与 receipt 一致",
    ],
    gates: [
      {
        script: "step2-write.mjs",
        args: ["--allow-no-references", "--allow-no-interaction", "--allow-no-related"],
      },
      { script: "step3-polish.mjs" },
    ],
    references: ["references/orchestration-policy.md", "references/strategy-tutorial.md"],
  },
  draft: {
    mode: "adaptive",
    goal: "围绕写作契约形成完整、可发布的 draft.md 与视觉计划。",
    inputs: ["materials.md", "blog-memory.md", "understanding-brief.md", "用户意图"],
    outputs: ["draft.md", "image-plan.json"],
    acceptance: [
      "正文回答写作契约中的问题并保留作者判断",
      "frontmatter、summary、sourceUrl、参考资料和互动区块满足内容不变量",
      "每个 substantive H2 都完成视觉覆盖审阅；SLOT_IMG_00 位于 lead 区域且是正文第一张视觉",
      "正文 SLOT 只在能降低理解成本时创建，数量由 image-plan 决定；正文图片数量仍可为 0..N",
    ],
    gate: { script: "step2-write.mjs" },
    references: ["references/orchestration-policy.md", "references/content-invariants.md"],
  },
  refine: {
    mode: "adaptive",
    goal: "诊断实际表达问题，并强制经过 humanizer-zh 做最终 AI 痕迹清理，同时保持作者声音和事实完整。",
    inputs: ["draft.md", "当前 strategy", "source_provenance", "前一步 Gate 结果"],
    outputs: ["draft.md"],
    acceptance: [
      "修改解决已诊断的问题而非套用固定润色链",
      "第一人称判断、疑问和读后感式表达仍然可见",
      "正文协议、SLOT 和 frontmatter 仍通过门控",
      "humanizer-zh 已应用于当前 draft，draft hash 与 humanizer receipt 一致",
      "humanization 没有损失事实、引用、技术语义或 H2/SLOT topology",
    ],
    gate: { script: "step3-polish.mjs" },
    references: ["references/orchestration-policy.md", "references/content-invariants.md"],
  },
  illustrate: {
    mode: "adaptive-with-hard-backend-policy",
    goal: "先经过 Baoyu 核心视觉设计层确定每个视觉节点，再按需吸收专项能力并生成可审阅的图片资产。",
    inputs: ["draft.md", "image-plan.json", "图片 prompt", "当前 Skill catalog"],
    outputs: ["cover.png", "imgs/*"],
    acceptance: [
      "视觉资产解释正文中的信息、关系或结论，而非只满足数量",
      "draft SLOT、image-plan、prompt 和最终 image 一一对应，所有可见文字已复核",
      "baoyu-article-illustrator 完成文章级视觉规划；cover、SLOT 00 和正文分别由对应 Baoyu 核心设计能力负责",
      "baoyu-diagram 只作为按需的结构语法 contributor，不成为最终文章图片 renderer",
      "所有 raster rendering 都经过 baoyu-image-gen 且显式使用 codex-cli，按单图串行执行",
      "Codex CLI 不可用或失败时保留可诊断的阻塞状态",
    ],
    gate: { script: "step4-images.mjs" },
    references: [
      "references/orchestration-policy.md",
      "references/image-policy.md",
      "references/image-backends.md",
    ],
  },
  build: {
    mode: "deterministic",
    goal: "生成博客轨和微信轨产物，并完成微信 HTML 的终态校验。",
    inputs: ["draft.md", "cover.png", "imgs/*", "image-map.json"],
    outputs: ["article.md", "article-wechat-source.md", "article-wechat.html"],
    acceptance: [
      "博客轨使用 CDN 图片和 Markdown 链接",
      "微信轨使用本地图片、纯文本 URL 且没有普通 href 锚点",
      "gzh-design validator 和 WeChat structural parity validator 都通过，双轨内容没有交叉污染",
      "微信 substantive heading 顺序、图片顺序、数量和章节归属与 article-wechat-source.md 一致，SLOT00 仍在 lead 区域",
    ],
    gate: { script: "step5-build.mjs" },
    references: ["references/pipeline-overview.md", "references/publishing.md"],
  },
  publish: {
    mode: "deterministic",
    goal: "按博客先行、微信草稿后行的顺序发布，并保留可恢复状态。",
    inputs: ["article.md", "article-wechat.html", "cover.png", "sourceUrl"],
    outputs: ["published blog", "WeChat draft"],
    acceptance: [
      "博客发布状态已记录，失败时保留本地提交并可重试",
      "微信草稿使用 article-wechat.html 和带 UTM 的 canonical sourceUrl",
      "两条发布状态可以独立恢复",
    ],
    gates: [
      { script: "publish-blog.mjs" },
      { script: "publish-wechat.mjs", args: ["--skip-deploy-check"] },
    ],
    references: ["references/pipeline-overview.md", "references/publishing.md"],
  },
};

/**
 * 确定性工程依赖。这里不登记基于文章内容的内容/写作/视觉路由，也不登记
 * 条件式视觉 adapter 模板；illustrate 还登记 mandatory Baoyu design layer、
 * specialized capability 和最终 raster renderer。
 */
export const HARD_DEPENDENCIES = {
  adapt: ["humanizer-zh"],
  refine: ["humanizer-zh"],
  illustrate: [
    "baoyu-article-illustrator",
    "baoyu-cover-image",
    "baoyu-infographic",
    "baoyu-diagram",
    "baoyu-image-gen",
  ],
  build: ["github-image-hosting", "gzh-design"],
  publish: ["baoyu-post-to-wechat"],
};

export const HARD_SKILLS = [
  ...new Set(Object.values(HARD_DEPENDENCIES).flat()),
].sort();

/** 旧调用方兼容别名；它现在只表示 hard engineering dependencies。 */
export const REQUIRED_SKILLS = HARD_SKILLS;

export function stageContractFor(stage) {
  return STAGE_CONTRACTS[stage] ?? null;
}

export function hardDependenciesForStage(stage) {
  return [...(HARD_DEPENDENCIES[stage] ?? [])];
}

/** 旧调用方兼容：不会返回任何 adaptive Skill。 */
export function requiredSkillsFor(_strategy, stage) {
  return hardDependenciesForStage(stage);
}

/** 旧调用方兼容：按阶段返回 hard 依赖，不聚合 adaptive 路由。 */
export function requiredSkillsForStage(stage) {
  return hardDependenciesForStage(stage);
}

/** 旧调用方兼容：adaptive Skill 不在 workflow 中注册，因此始终为空。 */
export function optionalSkillsFor() {
  return [];
}

export const STRATEGIES = {
  "reader-response": {
    objective: "从材料出发形成真正属于作者的判断、认知增量和延伸思考。",
    stages: ["prepare", "research", "synthesize", "draft", "refine", "illustrate", "build", "publish"],
    // 0=策略选定，1=资料收集完成，2=创作完成，3=后处理完成，4=图片完成，5=构建完成，6=发布
    stepToStage: {
      0: "prepare", 1: "research", 2: "draft", 3: "refine",
      4: "illustrate", 5: "build", 6: "publish",
    },
  },
  tutorial: {
    objective: "准确保留原知识，同时提高解释性、可读性和可执行性。",
    stages: ["prepare", "adapt", "illustrate", "build", "publish"],
    stepToStage: {
      0: "prepare", 1: "adapt", 2: "adapt", 3: "adapt", 4: "illustrate",
      5: "build", 6: "publish",
    },
  },
  "news-digest": {
    objective: "发现事件、核实事实、判断重要性，并压缩成读者可以快速决策的信息。",
    stages: ["prepare", "research", "draft", "refine", "illustrate", "build", "publish"],
    stepToStage: {
      0: "prepare", 1: "research", 2: "draft", 3: "refine",
      4: "illustrate", 5: "build", 6: "publish",
    },
  },
};

export function strategyFor(name) {
  return STRATEGIES[name] ?? null;
}

export function isKnownStrategy(name) {
  return name != null && Object.prototype.hasOwnProperty.call(STRATEGIES, name);
}

/** 初始化全阶段 pending 视图（不写盘）。 */
export function initStages(strategy) {
  const s = strategyFor(strategy);
  if (!s) return null;
  return Object.fromEntries(s.stages.map((stage) => [stage, "pending"]));
}

/** last_complete_step → 已完成阶段名（读时推导）。 */
export function stageForStep(strategy, lastCompleteStep) {
  const s = strategyFor(strategy);
  if (!s) return lastCompleteStep >= 6 ? "publish" : "unknown";
  return s.stepToStage[lastCompleteStep] ?? (lastCompleteStep >= 6 ? "publish" : s.stages[0]);
}

/**
 * 推导下一个命名阶段。
 * state 仍以数字 Step 为准；publish 的两个子状态继续独立处理。
 */
export function nextStageFromStep(strategy, lastCompleteStep, publish = {}) {
  const s = strategyFor(strategy);
  if (!s) return "unknown";

  const current = stageForStep(strategy, lastCompleteStep);
  if (current === "publish") {
    const blogDone = publish.blog === "done" || publish.blog === "blocked";
    const wechatDone = publish.wechat === "done";
    return blogDone && wechatDone ? "done" : "publish";
  }

  const idx = s.stages.indexOf(current);
  if (idx === -1) return s.stages[0];
  return s.stages[idx + 1] ?? "done";
}

/**
 * 一个数字 Step 可能覆盖多个命名阶段（reader-response 的 Step 2
 * 同时包含 synthesize 和 draft）。用于向 Agent 展开完整当前合同。
 */
export function stagesForStep(strategy, lastCompleteStep, nextStep, publish = {}) {
  const s = strategyFor(strategy);
  if (!s) return [];
  const currentStage = s.stepToStage[lastCompleteStep];
  const targetStage = s.stepToStage[Number(nextStep)];
  if (currentStage && currentStage === targetStage) return [currentStage];
  const start = nextStageFromStep(strategy, lastCompleteStep, publish);
  if (start === "unknown" || start === "done") return [];

  const targetStep = Number(nextStep);
  const end = s.stepToStage[targetStep] ?? start;
  const startIndex = s.stages.indexOf(start);
  const endIndex = s.stages.indexOf(end);
  if (startIndex === -1) return [];
  if (endIndex < startIndex) return [start];
  return s.stages.slice(startIndex, endIndex + 1);
}

/** 阶段需要读取的文档；policy 对 adaptive stage 始终优先。 */
export function stageReadRefs(strategy, stage) {
  const contract = stageContractFor(stage);
  if (!contract) return [];

  const refs = [];
  if (contract.mode.startsWith("adaptive")) refs.push("references/orchestration-policy.md");
  if (isKnownStrategy(strategy)) refs.push(`references/strategy-${strategy}.md`);
  refs.push(...(contract.references ?? []));
  return [...new Set(refs)];
}

/** 保留单引用 API，供旧 state CLI 使用；完整列表由 stageReadRefs 提供。 */
export function stageReadRef(strategy, stage) {
  const refs = stageReadRefs(strategy, stage);
  if (refs.length === 0) return null;
  if (["build", "publish"].includes(stage)) return "references/pipeline-overview.md";
  return refs.find((ref) => ref.startsWith("references/strategy-")) ?? refs[0];
}

/**
 * 校验机器源本身，供 validate-architecture.mjs 使用。
 * 返回错误文本而不是抛异常，便于 JSON 报告。
 */
export function validateWorkflow() {
  const errors = [];
  const validModes = new Set(["deterministic", "adaptive", "adaptive-with-hard-backend-policy"]);

  for (const stage of STAGE_ORDER) {
    const contract = stageContractFor(stage);
    if (!contract) {
      errors.push(`缺少阶段合同: ${stage}`);
      continue;
    }
    if (!validModes.has(contract.mode)) errors.push(`阶段 ${stage} mode 无效: ${contract.mode}`);
    if (contract.mode?.startsWith("adaptive")) {
      for (const field of Object.keys(contract)) {
        if (ADAPTIVE_ROUTING_FIELDS.has(field)) {
          errors.push(`adaptive 阶段 ${stage} 不得声明静态 Skill 路由字段: ${field}`);
        }
      }
    }
    for (const field of ["goal", "inputs", "outputs", "acceptance"]) {
      const value = contract[field];
      if ((field === "goal" && typeof value !== "string") ||
          (field !== "goal" && (!Array.isArray(value) || (field === "acceptance" && value.length === 0)))) {
        errors.push(`阶段 ${stage} 缺少合法 ${field}`);
      }
    }
    const gates = contract.gates ?? (contract.gate ? [contract.gate] : []);
    if (stage !== "prepare" && gates.length === 0) errors.push(`阶段 ${stage} 缺少 Gate`);
    for (const gate of gates) {
      if (!gate || typeof gate.script !== "string" || !/^[\w-]+\.mjs$/.test(gate.script)) {
        errors.push(`阶段 ${stage} Gate 无效`);
      }
      if (gate?.args && !Array.isArray(gate.args)) errors.push(`阶段 ${stage} Gate args 必须是数组`);
    }
  }

  for (const [name, strategy] of Object.entries(STRATEGIES)) {
    if (!strategy.objective) errors.push(`strategy ${name} 缺少 objective`);
    if (!Array.isArray(strategy.stages) || strategy.stages.length < 3) {
      errors.push(`strategy ${name} 阶段序列无效`);
      continue;
    }
    for (const stage of strategy.stages) {
      if (!stageContractFor(stage)) errors.push(`strategy ${name} 引用不存在阶段: ${stage}`);
    }
    for (const stage of Object.values(strategy.stepToStage ?? {})) {
      if (!strategy.stages.includes(stage)) errors.push(`strategy ${name} step 映射越界: ${stage}`);
    }
  }

  for (const [stage, skills] of Object.entries(HARD_DEPENDENCIES)) {
    if (!STAGE_ORDER.includes(stage)) errors.push(`hard dependency 使用未知阶段: ${stage}`);
    if (!Array.isArray(skills) || skills.some((name) => typeof name !== "string" || !name)) {
      errors.push(`hard dependency 列表无效: ${stage}`);
    }
  }
  return errors;
}
