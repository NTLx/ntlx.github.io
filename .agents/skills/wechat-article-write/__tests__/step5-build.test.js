import { describe, expect, test, afterEach } from "bun:test";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { validatePreparedArtifactFreshness } from "../scripts/artifact-integrity-lib.mjs";
import { applyImageMapToMarkdown } from "../scripts/step5-lib.mjs";

const SCRIPT = resolve(import.meta.dir, "../scripts/step5-build.mjs");
const PROJECT_ROOT = resolve(import.meta.dir, "../../../..");
import sharp from "sharp";
const PNG = await sharp({ create: { width: 940, height: 400, channels: 3, background: "white" } }).png().toBuffer();

function makeFixture(map = undefined) {
  const root = join(tmpdir(), `step5-build-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const postsRoot = join(root, "posts");
  const repoRoot = join(root, "repo");
  const slug = "2026-09-03-step5-native";
  const postDir = join(postsRoot, slug);
  mkdirSync(join(postDir, "imgs"), { recursive: true });
  mkdirSync(join(repoRoot, ".agents/skills/wechat-article-write"), { recursive: true });
  mkdirSync(join(repoRoot, ".agents/skills/github-image-hosting/scripts"), { recursive: true });
  mkdirSync(join(repoRoot, ".agents/skills/gzh-design/references"), { recursive: true });
  writeFileSync(join(repoRoot, ".agents/skills/wechat-article-write/EXTEND.md"), [
    "default_author: NTLx",
    "default_author_bio: 热衷于分享 AI 观察与干货",
  ].join("\n") + "\n");
  writeFileSync(join(repoRoot, ".agents/skills/github-image-hosting/scripts/upload.ts"), [
    "process.stderr.write('uploader must not be invoked\\n');",
    "process.exit(99);",
  ].join("\n"));
  writeFileSync(join(repoRoot, ".agents/skills/gzh-design/references/theme-index.md"), [
    "| 主题 | 主色 | 适用场景 | 组件库文件 | 正文下划线 CSS |",
    "|---|---|---|---|---|",
    "| 石墨极简风 | gray | test | `references/theme-graphite-minimal.md` | - |",
  ].join("\n") + "\n");
  writeFileSync(join(repoRoot, ".agents/skills/gzh-design/references/theme-graphite-minimal.md"), [
    "# Test theme",
    "",
    "## 完整文章模板骨架",
    "",
    "```html",
    "<section>{{正文}}</section>",
    "```",
    "",
    "## Markdown → 组件映射规则",
    "",
    "| Markdown 元素 | 对应组件 | 说明 |",
    "|---|---|---|",
    "| `## 章节标题` | plain | test only |",
  ].join("\n") + "\n");
  writeFileSync(join(postDir, "cover.png"), PNG);
  writeFileSync(join(postDir, "imgs/00-infographic-core-summary.png"), PNG);

  const draft = `---
title: Step 5 测试
date: 2026-09-03
summary: 测试确定性构建。
category: AI
blogSlug: step5-native
coverImage: cover.png
sourceUrl: https://ntlx.github.io/articles/step5-native
---

<!-- KEEP_THIS_COMMENT -->
## 机制

正文内容。
`;
  writeFileSync(join(postDir, "draft.md"), draft);
  writeFileSync(join(postDir, "visual-draft.md"), draft.replace("## 机制", "![](imgs/00-infographic-core-summary.png)\n\n## 机制"));
  writeFileSync(join(postDir, ".pipeline-state.json"), JSON.stringify({
    slug,
    last_complete_step: 3,
    step3_draft_sha256: createHash("sha256").update(draft).digest("hex"),
    publish: { blog: "pending", wechat: "pending" },
    failed_step: null,
  }) + "\n");
  if (map !== undefined) {
    writeFileSync(join(postDir, "image-map.json"), JSON.stringify(map) + "\n");
  }
  return { root, postsRoot, repoRoot, postDir, slug };
}

function run(fixture, ...args) {
  return spawnSync("bun", ["run", SCRIPT, fixture.slug, ...args], {
    cwd: PROJECT_ROOT,
    env: { ...process.env, PIPELINE_POSTS_ROOT: fixture.postsRoot, PIPELINE_REPO_ROOT: fixture.repoRoot },
    encoding: "utf8",
  });
}

function writeNativeGzh(fixture, html, { themeName = "石墨极简风", themeId = "graphite-minimal", preview = "<html>preview</html>\n" } = {}) {
  const cleanName = `article-wechat-source_排版_${themeName}(${themeId}).html`;
  const previewName = `article-wechat-source_排版_${themeName}(${themeId})_预览.html`;
  writeFileSync(join(fixture.postDir, cleanName), html);
  writeFileSync(join(fixture.postDir, previewName), preview);
  return { cleanName, previewName, cleanPath: join(fixture.postDir, cleanName), previewPath: join(fixture.postDir, previewName) };
}

describe("step5-build", () => {
  const cleanup = [];

  afterEach(() => {
    while (cleanup.length > 0) rmSync(cleanup.pop(), { recursive: true, force: true });
  });

  test("fails closed when native image hosting has not produced image-map.json", () => {
    const fixture = makeFixture();
    cleanup.push(fixture.root);
    const result = run(fixture, "--prepare-only");

    expect(result.status).toBe(3);
    expect(result.stderr).toContain("first complete native github-image-hosting delegation");
    expect(existsSync(join(fixture.postDir, "article.md"))).toBe(false);
  });

  test("consumes a complete image map without invoking an uploader", () => {
    const fixture = makeFixture({ "00-infographic-core-summary.png": "https://cdn.example.test/00-infographic-core-summary.png" });
    cleanup.push(fixture.root);
    const result = run(fixture, "--prepare-only");

    expect(result.status, result.stderr || result.stdout).toBe(0);
    expect(existsSync(join(fixture.postDir, "article.md"))).toBe(true);
    expect(existsSync(join(fixture.postDir, "article-wechat-source.md"))).toBe(true);
    const article = readFileSync(join(fixture.postDir, "article.md"), "utf8");
    const wechatSource = readFileSync(join(fixture.postDir, "article-wechat-source.md"), "utf8");
    expect(article).toContain("https://cdn.example.test/00-infographic-core-summary.png");
    expect(article).toContain("KEEP_THIS_COMMENT");
    expect(wechatSource).toContain("KEEP_THIS_COMMENT");
    expect(wechatSource).toContain("![](imgs/00-infographic-core-summary.png)");
  });

  test("fails closed when a local image has no CDN mapping", () => {
    const fixture = makeFixture({});
    cleanup.push(fixture.root);
    const result = run(fixture, "--prepare-only");

    expect(result.status).toBe(4);
    expect(result.stderr).toContain("missing valid CDN URL");
  });

  test("maps only the referenced infographic instead of a similarly named cover", () => {
    const fixture = makeFixture({
      "00-infographic-core-summary.png": "https://cdn.example.test/summary.png",
      "00-cover.png": "https://cdn.example.test/cover.png",
    });
    cleanup.push(fixture.root);
    writeFileSync(join(fixture.postDir, "imgs/00-cover.png"), PNG);
    const draft = readFileSync(join(fixture.postDir, "visual-draft.md"), "utf8");
    const output = applyImageMapToMarkdown(
      draft,
      join(fixture.postDir, "imgs"),
      JSON.parse(readFileSync(join(fixture.postDir, "image-map.json"), "utf8")),
    );

    expect(output).toContain("https://cdn.example.test/summary.png");
    expect(output).not.toContain("https://cdn.example.test/cover.png");
  });

  test("finalize validates the native gzh pair, then copies stable publish artifacts", () => {
    const fixture = makeFixture({ "00-infographic-core-summary.png": "https://cdn.example.test/summary.png" });
    cleanup.push(fixture.root);
    const prepare = run(fixture, "--prepare-only");
    expect(prepare.status, prepare.stderr || prepare.stdout).toBe(0);
    const native = writeNativeGzh(fixture, "<section><img src=\"imgs/00-infographic-core-summary.png\"><h2>机制</h2><p>正文内容。</p></section>\n");
    const before = createHash("sha256").update(readFileSync(native.cleanPath)).digest("hex");

    const finalized = run(fixture, "--finalize-only");

    expect(finalized.status, finalized.stderr || finalized.stdout).toBe(0);
    expect(createHash("sha256").update(readFileSync(native.cleanPath)).digest("hex")).toBe(before);
    expect(readFileSync(join(fixture.postDir, "article-wechat.html"), "utf8")).toBe(readFileSync(native.cleanPath, "utf8"));
    expect(readFileSync(join(fixture.postDir, "article-wechat_预览.html"), "utf8")).toBe(readFileSync(native.previewPath, "utf8"));
    expect(JSON.parse(readFileSync(join(fixture.postDir, ".pipeline-state.json"), "utf8")).gzh_theme).toBe("graphite-minimal");
  });

  test("stable article-wechat.html cannot bypass the native gzh-design contract", () => {
    const fixture = makeFixture({ "00-infographic-core-summary.png": "https://cdn.example.test/summary.png" });
    cleanup.push(fixture.root);
    expect(run(fixture, "--prepare-only").status).toBe(0);
    writeFileSync(join(fixture.postDir, "article-wechat.html"), "<section><img src=\"imgs/00-infographic-core-summary.png\"><h2>机制</h2><p>正文内容。</p></section>\n");
    const result = run(fixture, "--finalize-only");
    expect(result.status).toBe(4);
    expect(result.stderr).toContain("native gzh-design clean HTML missing");
  });

  test("requires the matching native preview before stable normalization", () => {
    const fixture = makeFixture({ "00-infographic-core-summary.png": "https://cdn.example.test/summary.png" });
    cleanup.push(fixture.root);
    expect(run(fixture, "--prepare-only").status).toBe(0);
    const native = writeNativeGzh(fixture, "<section><img src=\"imgs/00-infographic-core-summary.png\"><h2>机制</h2><p>正文内容。</p></section>\n");
    rmSync(native.previewPath);
    const noPreview = run(fixture, "--finalize-only");
    expect(noPreview.status).toBe(4);
    expect(noPreview.stderr).toContain("native gzh-design preview missing");
    expect(existsSync(join(fixture.postDir, "article-wechat.html"))).toBe(false);
  });

  test("rejects ordinary anchors in the native gzh artifact without rewriting it", () => {
    const fixture = makeFixture({ "00-infographic-core-summary.png": "https://cdn.example.test/summary.png" });
    cleanup.push(fixture.root);
    expect(run(fixture, "--prepare-only").status).toBe(0);
    const native = writeNativeGzh(fixture, "<section><img src=\"imgs/00-infographic-core-summary.png\"><a href=\"https://example.com\"><h2>机制</h2></a><p>正文内容。</p></section>\n");
    const before = readFileSync(native.cleanPath, "utf8");
    const rejected = run(fixture, "--finalize-only");
    expect(rejected.status).toBe(4);
    expect(rejected.stderr).toContain("ordinary <a href>");
    expect(readFileSync(native.cleanPath, "utf8")).toBe(before);
  });

  test("allows an existing native gzh artifact to be repaired and finalized", () => {
    const fixture = makeFixture({ "00-infographic-core-summary.png": "https://cdn.example.test/summary.png" });
    cleanup.push(fixture.root);
    expect(run(fixture, "--prepare-only").status).toBe(0);
    const failedHtml = "<section><img src=\"imgs/00-infographic-core-summary.png\"><h2>机制</h2><p></p></section>\n";
    const native = writeNativeGzh(fixture, failedHtml);

    const failed = run(fixture, "--finalize-only");
    expect(failed.status).toBe(4);
    expect(failed.stderr).toContain("substantive block");
    expect(readFileSync(native.cleanPath, "utf8")).toBe(failedHtml);

    writeFileSync(native.cleanPath, failedHtml.replace("<p></p>", "<p>正文内容。</p>"));
    expect(run(fixture, "--finalize-only").status).toBe(0);
  });

  test("fails finalize when a local image changed after prepare", () => {
    const fixture = makeFixture({ "00-infographic-core-summary.png": "https://cdn.example.test/summary.png" });
    cleanup.push(fixture.root);
    expect(run(fixture, "--prepare-only").status).toBe(0);
    writeFileSync(join(fixture.postDir, "imgs/00-infographic-core-summary.png"), "changed");
    writeNativeGzh(fixture, "<section><img src=\"imgs/00-infographic-core-summary.png\"><h2>机制</h2><p>正文内容。</p></section>\n");
    const finalized = run(fixture, "--finalize-only");
    expect(finalized.status).toBe(4);
    expect(finalized.stderr).toContain("imgs/");
  });

  test("fails finalize when image-map.json changed after prepare", () => {
    const fixture = makeFixture({ "00-infographic-core-summary.png": "https://cdn.example.test/summary.png" });
    cleanup.push(fixture.root);
    expect(run(fixture, "--prepare-only").status).toBe(0);
    writeFileSync(
      join(fixture.postDir, "image-map.json"),
      JSON.stringify({ "00-infographic-core-summary.png": "https://cdn.example.test/other.png" }) + "\n",
    );
    writeNativeGzh(fixture, "<section><img src=\"imgs/00-infographic-core-summary.png\"><h2>机制</h2><p>正文内容。</p></section>\n");
    const finalized = run(fixture, "--finalize-only");
    expect(finalized.status).toBe(4);
    expect(finalized.stderr).toContain("image-map.json");
  });

  test("freezes hosting dispatch once upstream visuals are already mapped", () => {
    const fixture = makeFixture({ "00-infographic-core-summary.png": "https://cdn.example.test/summary.png" });
    cleanup.push(fixture.root);
    expect(run(fixture, "--hosting-status").stdout.trim()).toBe("NEEDED");

    expect(run(fixture, "--prepare-only").status).toBe(0);
    expect(run(fixture, "--hosting-status").stdout.trim()).toBe("FROZEN");

    writeNativeGzh(fixture, "<section><img src=\"imgs/00-infographic-core-summary.png\"><h2>机制</h2><p>正文内容。</p></section>\n");
    expect(run(fixture, "--finalize-only").status).toBe(0);
    expect(run(fixture, "--hosting-status").stdout.trim()).toBe("FROZEN");

    const draftPath = join(fixture.postDir, "draft.md");
    writeFileSync(draftPath, readFileSync(draftPath, "utf8").replace("正文内容。", "正文内容改了。"));
    expect(run(fixture, "--hosting-status").stdout.trim()).toBe("FROZEN");
  });

  test("keeps prepare frozen even when only a downstream stable artifact changed", () => {
    const fixture = makeFixture({ "00-infographic-core-summary.png": "https://cdn.example.test/summary.png" });
    cleanup.push(fixture.root);
    expect(run(fixture, "--prepare-only").status).toBe(0);
    writeNativeGzh(fixture, "<section><img src=\"imgs/00-infographic-core-summary.png\"><h2>机制</h2><p>正文内容。</p></section>\n");
    expect(run(fixture, "--finalize-only").status).toBe(0);

    const stablePath = join(fixture.postDir, "article-wechat.html");
    writeFileSync(stablePath, "<section>downstream change</section>\n");
    const rerun = run(fixture, "--prepare-only");
    expect(rerun.status).toBe(2);
    expect(rerun.stderr).toContain("frozen");
    expect(run(fixture, "--hosting-status").stdout.trim()).toBe("FROZEN");
  });

  test("refuses to rebuild artifacts once Step 5 is finalized", () => {
    const fixture = makeFixture({ "00-infographic-core-summary.png": "https://cdn.example.test/summary.png" });
    cleanup.push(fixture.root);
    expect(run(fixture, "--prepare-only").status).toBe(0);
    writeNativeGzh(fixture, "<section><img src=\"imgs/00-infographic-core-summary.png\"><h2>机制</h2><p>正文内容。</p></section>\n");
    expect(run(fixture, "--finalize-only").status).toBe(0);

    const rerun = run(fixture, "--prepare-only");
    expect(rerun.status).toBe(2);
    expect(rerun.stderr).toContain("frozen");
  });

  test("rejects visual prose changes before preparing artifacts", () => {
    const fixture = makeFixture({ "00-infographic-core-summary.png": "https://cdn.example.test/summary.png" });
    cleanup.push(fixture.root);
    const path = join(fixture.postDir, "visual-draft.md");
    writeFileSync(path, readFileSync(path, "utf8").replace("正文内容。", "偷偷修改正文。"));
    const result = run(fixture, "--prepare-only");
    expect(result.status).toBe(4);
    expect(existsSync(join(fixture.postDir, "article.md"))).toBe(false);
  });

  test("visual edits reopen hosting and invalidate prepared artifacts", () => {
    const fixture = makeFixture({ "00-infographic-core-summary.png": "https://cdn.example.test/summary.png" });
    cleanup.push(fixture.root);
    expect(run(fixture, "--prepare-only").status).toBe(0);
    const path = join(fixture.postDir, "visual-draft.md");
    writeFileSync(path, readFileSync(path, "utf8").replace("![]", "![新的说明]"));
    expect(run(fixture, "--hosting-status").stdout.trim()).toBe("NEEDED");
    writeNativeGzh(fixture, "<section></section>");
    const result = run(fixture, "--finalize-only");
    expect(result.status).toBe(4);
    expect(result.stderr).toContain("visual-draft.md SHA256");
  });

  test("legacy artifact manifests require rebuilding without changing state version", () => {
    const fixture = makeFixture({ "00-infographic-core-summary.png": "https://cdn.example.test/summary.png" });
    cleanup.push(fixture.root);
    expect(run(fixture, "--prepare-only").status).toBe(0);
    const path = join(fixture.postDir, ".step5-artifacts.json");
    const manifest = JSON.parse(readFileSync(path, "utf8"));
    expect(manifest.version).toBe(4);
    expect(manifest.visual_draft_sha256).toBeTruthy();
    manifest.version = 2;
    writeFileSync(path, JSON.stringify(manifest));
    writeNativeGzh(fixture, "<section></section>");
    expect(run(fixture, "--hosting-status").stdout.trim()).toBe("NEEDED");
    const result = run(fixture, "--finalize-only");
    expect(result.status).toBe(4);
    expect(result.stderr).toContain("rerun Step 5 prepare");
  });

  test("maps Markdown image nodes while preserving code and ordinary shared references", () => {
    const markdown = [
      "![带标题](imgs/a.png \"图示\")",
      "![引用][shared]",
      "[普通链接][shared]",
      "[shared]: imgs/a.png",
      "`![示例](imgs/a.png)`",
      "```md",
      "![代码](imgs/a.png)",
      "```",
    ].join("\n\n");
    const output = applyImageMapToMarkdown(markdown, "/unused", { "a.png": "https://cdn.example.test/a.png" });
    expect(output).toContain('![带标题](https://cdn.example.test/a.png "图示")');
    expect(output).toContain("![引用](https://cdn.example.test/a.png)");
    expect(output).toContain("[普通链接][shared]");
    expect(output).toContain("[shared]: imgs/a.png");
    expect(output).toContain("`![示例](imgs/a.png)`");
    expect(output).toContain("![代码](imgs/a.png)");
  });


  test("WeChat-only finalize preserves an already published blog checkpoint", () => {
    const fixture = makeFixture({ "00-infographic-core-summary.png": "https://cdn.example.test/summary.png" });
    cleanup.push(fixture.root);
    expect(run(fixture, "--prepare-only").status).toBe(0);
    writeNativeGzh(fixture, '<section><img src="imgs/00-infographic-core-summary.png"><h2>机制</h2><p>正文内容。</p></section>');
    expect(run(fixture, "--finalize-only").status).toBe(0);
    const path = join(fixture.postDir, ".pipeline-state.json");
    const state = JSON.parse(readFileSync(path, "utf8"));
    writeFileSync(path, JSON.stringify({ ...state, last_complete_step: 6, publish: { blog: "done", wechat: "failed" }, failed_step: { step: 6.2, error: "delivery failed" } }));
    const blog = readFileSync(join(fixture.postDir, "article.md"), "utf8");
    expect(run(fixture, "--finalize-only").status).toBe(0);
    const recovered = JSON.parse(readFileSync(path, "utf8"));
    expect(recovered.last_complete_step).toBe(6);
    expect(recovered.publish).toEqual({ blog: "done", wechat: "failed" });
    expect(readFileSync(join(fixture.postDir, "article.md"), "utf8")).toBe(blog);
    expect(run(fixture, "--hosting-status").stdout.trim()).toBe("FROZEN");
  });

  test("invalid checkpoints fail closed without mutation in every Step 5 mode", () => {
    for (const invalid of ["{broken", JSON.stringify({ last_complete_step: 2, publish: { blog: "done", wechat: "pending" } })]) {
      const fixture = makeFixture({ "00-infographic-core-summary.png": "https://cdn.example.test/summary.png" });
      cleanup.push(fixture.root);
      const path = join(fixture.postDir, ".pipeline-state.json");
      writeFileSync(path, invalid);
      for (const mode of ["--hosting-status", "--prepare-only", "--finalize-only", "--dry-run"]) {
        const result = run(fixture, mode);
        expect(result.status).toBe(2);
        expect(result.stderr).toContain("STATE_INVALID");
        expect(readFileSync(path, "utf8")).toBe(invalid);
        expect(existsSync(join(fixture.postDir, "article.md"))).toBe(false);
      }
    }
  });

  test("cover replacement invalidates publication but reuses frozen hosting after Step 4", async () => {
    const fixture = makeFixture({ "00-infographic-core-summary.png": "https://cdn.example.test/summary.png" });
    cleanup.push(fixture.root);
    expect(run(fixture, "--prepare-only").status).toBe(0);
    writeNativeGzh(fixture, '<section><img src="imgs/00-infographic-core-summary.png"><h2>机制</h2><p>正文内容。</p></section>');
    expect(run(fixture, "--finalize-only").status).toBe(0);
    const originals = Object.fromEntries(["article.md", "article-wechat-source.md", "image-map.json"].map(name => [name, readFileSync(join(fixture.postDir, name), "utf8")]));
    writeFileSync(join(fixture.postDir, "cover.png"), await sharp({ create: { width: 940, height: 400, channels: 3, background: "blue" } }).png().toBuffer());
    expect(run(fixture, "--hosting-status").stdout.trim()).toBe("FROZEN");
    const stale = run(fixture, "--finalize-only");
    expect(stale.status).toBe(4);
    expect(stale.stderr).toContain("cover SHA256/name");
    expect(run(fixture, "--prepare-only").stderr).toContain("complete Step 4");
    const statePath = join(fixture.postDir, ".pipeline-state.json");
    const state = JSON.parse(readFileSync(statePath, "utf8"));
    writeFileSync(statePath, JSON.stringify({ ...state, last_complete_step: 4, failed_step: null }));
    expect(run(fixture, "--prepare-only").status).toBe(0);
    for (const [name, value] of Object.entries(originals)) expect(readFileSync(join(fixture.postDir, name), "utf8")).toBe(value);
    expect(run(fixture, "--finalize-only").status).toBe(0);
  });

  test("cover recovery cannot replace the frozen map or blog output", () => {
    for (const name of ["image-map.json", "article.md", "article-wechat-source.md"]) {
      const fixture = makeFixture({ "00-infographic-core-summary.png": "https://cdn.example.test/summary.png" });
      cleanup.push(fixture.root);
      expect(run(fixture, "--prepare-only").status).toBe(0);
      // A byte-level cover change is enough to invalidate its publication identity.
      writeFileSync(join(fixture.postDir, "cover.png"), Buffer.concat([PNG, Buffer.from("changed")]));
      const statePath = join(fixture.postDir, ".pipeline-state.json");
      const state = JSON.parse(readFileSync(statePath, "utf8"));
      writeFileSync(statePath, JSON.stringify({ ...state, last_complete_step: 4, failed_step: null }));
      writeFileSync(join(fixture.postDir, name), "changed");
      const result = run(fixture, "--prepare-only");
      expect(result.status).toBe(2);
      expect(result.stderr).toContain(name + " SHA256");
      expect(readFileSync(join(fixture.postDir, name), "utf8")).toBe("changed");
    }
  });

  test("cover deletion, duplication and missing or tampered identity fail closed", () => {
    for (const mutation of ["deleted", "duplicate", "missing-hash", "wrong-file"]) {
      const fixture = makeFixture({ "00-infographic-core-summary.png": "https://cdn.example.test/summary.png" });
      cleanup.push(fixture.root);
      expect(run(fixture, "--prepare-only").status).toBe(0);
      const path = join(fixture.postDir, ".step5-artifacts.json");
      const manifest = JSON.parse(readFileSync(path, "utf8"));
      if (mutation === "deleted") rmSync(join(fixture.postDir, "cover.png"));
      else if (mutation === "duplicate") writeFileSync(join(fixture.postDir, "cover.jpg"), PNG);
      else {
        if (mutation === "missing-hash") delete manifest.cover_sha256;
        else manifest.cover_file = "cover.jpg";
        writeFileSync(path, JSON.stringify(manifest));
      }
      expect(validatePreparedArtifactFreshness(fixture.postDir).join(" ")).toContain("cover");
      expect(run(fixture, "--hosting-status").stdout.trim()).toBe("FROZEN");
    }
  });

  test("v3 manifest retains hosting identity but requires publication preparation upgrade", () => {
    const fixture = makeFixture({ "00-infographic-core-summary.png": "https://cdn.example.test/summary.png" });
    cleanup.push(fixture.root);
    expect(run(fixture, "--prepare-only").status).toBe(0);
    const path = join(fixture.postDir, ".step5-artifacts.json");
    const manifest = JSON.parse(readFileSync(path, "utf8"));
    manifest.version = 3;
    delete manifest.cover_file;
    delete manifest.cover_sha256;
    writeFileSync(path, JSON.stringify(manifest));
    expect(run(fixture, "--hosting-status").stdout.trim()).toBe("FROZEN");
    const statePath = join(fixture.postDir, ".pipeline-state.json");
    const state = JSON.parse(readFileSync(statePath, "utf8"));
    writeFileSync(statePath, JSON.stringify({ ...state, last_complete_step: 4 }));
    expect(run(fixture, "--prepare-only").status).toBe(0);
    expect(JSON.parse(readFileSync(path, "utf8")).version).toBe(4);
  });

  test("does not contain the removed uploader bridge", () => {
    const source = readFileSync(SCRIPT, "utf8");
    expect(source).not.toContain("spawnSync");
    expect(source).not.toContain("github-image-hosting/scripts/upload");
    expect(source).not.toContain("upload.ts");
    const step5Lib = readFileSync(resolve(import.meta.dir, "../scripts/step5-lib.mjs"), "utf8");
    expect(step5Lib).not.toContain("spawnSync");
    expect(step5Lib).not.toContain("validate_gzh_html");
    expect(step5Lib).not.toContain("wrap_preview");
  });
});
