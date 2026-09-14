import { describe, test, expect } from "bun:test";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import sharp from "sharp";
import { validateVisualDraft, assertVisualTextParity, initializeVisualDraft, collectVisualImages } from "../scripts/visual-draft-lib.mjs";
import { sha256File } from "../scripts/artifact-integrity-lib.mjs";

const lead = "![文章核心信息图](imgs/00-infographic-core-summary.png)";
const bodyImage = "![机制](imgs/mechanism.png)";
const draft = '---\ntitle: 示例\ncoverImage: cover.png\n---\n\n开头。\n\n## 机制\n\n正文 [来源](https://example.com/a)。\n\n```js\nconst value = 42;\n```\n';
const insertLead = text => text.replace("## 机制", `${lead}\n\n## 机制`);
async function fixture(run) {
  const base = mkdtempSync(join(tmpdir(), "visual-v4-"));
  mkdirSync(join(base, "imgs"));
  await sharp({ create: { width: 235, height: 100, channels: 3, background: "white" } }).png().toFile(join(base, "cover.png"));
  writeFileSync(join(base, "imgs/00-infographic-core-summary.png"), readFileSync(join(base, "cover.png")));
  try { await run(base); } finally { rmSync(base, { recursive: true, force: true }); }
}

describe("visual integration", () => {
  test("copies frozen draft exactly and refuses to overwrite on resume", () => fixture(async base => {
    writeFileSync(join(base, "draft.md"), draft);
    initializeVisualDraft(base);
    expect(readFileSync(join(base, "visual-draft.md"), "utf8")).toBe(draft);
    expect(() => initializeVisualDraft(base)).toThrow("already exists");
  }));
  test("accepts image-only additions and a short article without body illustrations", () => fixture(async base => {
    expect((await validateVisualDraft(draft, insertLead(draft), base)).length).toBe(1);
  }));
  for (const [name, before, after] of [
    ["prose", "正文", "改写"], ["H2", "## 机制", "## 新标题"],
    ["URL", "https://example.com/a", "https://example.com/b"],
    ["code", "value = 42", "value = 43"], ["frontmatter", "title: 示例", "title: 改写"],
  ]) test(`rejects ${name} mutation`, () => {
    expect(() => assertVisualTextParity(draft, insertLead(draft).replace(before, after))).toThrow("changes frozen article");
  });
  test("keeps code containing image syntax literal", () => {
    const text = draft + '\n~~~md\n![example](imgs/no-file.png)\n~~~\n\n`![inline](imgs/no-file.png)`\n';
    expect(collectVisualImages(insertLead(text)).length).toBe(1);
    expect(() => assertVisualTextParity(text, insertLead(text).replace('no-file.png', 'changed.png'))).toThrow();
  });
  test("preserves existing source images", () => {
    expect(() => assertVisualTextParity(draft + '\n' + bodyImage, insertLead(draft))).toThrow("preserve existing");
  });
  test("fenced headings do not determine lead position or long-form coverage", () => fixture(async base => {
    const text = draft.replace("## 机制", "~~~md\n## 假标题一\n## 假标题二\n## 假标题三\n~~~\n\n## 机制");
    expect((await validateVisualDraft(text, insertLead(text), base)).length).toBe(1);
  }));
  test("uses substantive length and excludes trailing references", () => fixture(async base => {
    const long = draft + "\n" + "正".repeat(1400);
    await expect(validateVisualDraft(long, insertLead(long), base)).rejects.toThrow("at least 1 body visual");
    const short = draft + "\n## 参考资料\n\n" + "参".repeat(1500);
    expect((await validateVisualDraft(short, insertLead(short), base)).length).toBe(1);
  }));
  test("requires exactly one header infographic", () => fixture(async base => {
    await expect(validateVisualDraft(draft, draft, base)).rejects.toThrow("exactly one");
    await expect(validateVisualDraft(draft, insertLead(draft) + `\n${lead}\n`, base)).rejects.toThrow("exactly one");
  }));
  test("requires header before first substantive H2", () => fixture(async base => {
    await expect(validateVisualDraft(draft, draft + `\n${lead}\n`, base)).rejects.toThrow("before the first substantive H2");
  }));
  test("requires header to be first body visual", () => fixture(async base => {
    await expect(validateVisualDraft(draft, insertLead(draft).replace(lead, `${bodyImage}\n\n${lead}`), base)).rejects.toThrow("first body visual");
  }));
  test("rejects missing local image", () => fixture(async base => {
    await expect(validateVisualDraft(draft, insertLead(draft) + `\n${bodyImage}\n`, base)).rejects.toThrow("missing local image");
  }));
  test("rejects truncated raster even with a PNG signature", () => fixture(async base => {
    writeFileSync(join(base, "imgs/00-infographic-core-summary.png"), readFileSync(join(base, "cover.png")).subarray(0, 24));
    await expect(validateVisualDraft(draft, insertLead(draft), base)).rejects.toThrow("usable raster");
  }));
  test("normal long-form needs one body visual", () => fixture(async base => {
    const long = draft + '\n## 对比\n\n对比。\n\n## 边界\n\n边界。\n';
    await expect(validateVisualDraft(long, insertLead(long), base)).rejects.toThrow("at least 1 body visual");
    writeFileSync(join(base, "imgs/mechanism.png"), readFileSync(join(base, "cover.png")));
    expect((await validateVisualDraft(long, insertLead(long) + `\n${bodyImage}\n`, base)).length).toBe(2);
  }));
  test("rejects traversal and escaped symlinks", () => fixture(async base => {
    await expect(validateVisualDraft(draft, insertLead(draft) + '\n![bad](imgs/../cover.png)\n', base)).rejects.toThrow("inside imgs/");
    symlinkSync(join(base, "cover.png"), join(base, "imgs/mechanism.png"));
    await expect(validateVisualDraft(draft, insertLead(draft) + `\n${bodyImage}\n`, base)).rejects.toThrow("escapes imgs/");
  }));
  test("excludes private auxiliaries and candidates but rejects unreferenced top-level raster", () => fixture(async base => {
    mkdirSync(join(base, "imgs/candidates"));
    writeFileSync(join(base, "imgs/candidates/bad.png"), "candidate");
    writeFileSync(join(base, "imgs/outline.md"), "private outline");
    expect((await validateVisualDraft(draft, insertLead(draft), base)).length).toBe(1);
    writeFileSync(join(base, "imgs/stale.png"), readFileSync(join(base, "cover.png")));
    await expect(validateVisualDraft(draft, insertLead(draft), base)).rejects.toThrow("unreferenced final rasters");
  }));
  test("CLI checks Step 3 freshness and completes Step 4 without changing state version", () => fixture(async base => {
    const textPath = join(base, "draft.md");
    writeFileSync(textPath, draft);
    writeFileSync(join(base, "visual-draft.md"), insertLead(draft));
    const slug = base.split('/').at(-1);
    writeFileSync(join(base, ".pipeline-state.json"), JSON.stringify({ version: 2, slug, last_complete_step: 3, step3_draft_sha256: sha256File(textPath), publish: { blog: "pending", wechat: "pending" } }));
    const run = () => spawnSync("bun", [resolve(import.meta.dir, "../scripts/step4-images.mjs"), slug], { env: { ...process.env, PIPELINE_POSTS_ROOT: tmpdir() }, encoding: "utf8" });
    const result = run();
    expect(result.status, result.stderr).toBe(0);
    expect(JSON.parse(readFileSync(join(base, ".pipeline-state.json"))).last_complete_step).toBe(4);
    writeFileSync(textPath, draft + "改写");
    expect(run().stderr).toContain("changed after Step 3");
  }));
});
