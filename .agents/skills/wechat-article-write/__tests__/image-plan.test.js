import { describe, expect, test } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { validateImagePlan } from "../scripts/image-plan-lib.mjs";

const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64");

function fixture() {
  const dir = join(tmpdir(), `image-plan-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(join(dir, "imgs"), { recursive: true });
  writeFileSync(join(dir, "imgs", "00-infographic-core-summary.png"), png);
  return dir;
}

describe("minimal image-plan facts", () => {
  test("accepts final asset facts without producer or review metadata", () => {
    const dir = fixture();
    try {
      const body = "<!-- SLOT_IMG_00_core -->\n\n## 结论\n内容。";
      const result = validateImagePlan({
        cover: "cover.png",
        images: [{ slot: "SLOT_IMG_00", kind: "generated", file: "imgs/00-infographic-core-summary.png" }],
      }, body, dir);
      expect(result.ok).toBe(true);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  test("rejects an image path escaping imgs/", () => {
    const dir = fixture();
    try {
      const result = validateImagePlan({
        cover: "cover.png",
        images: [{ slot: "SLOT_IMG_00", kind: "generated", file: "imgs/../draft.md" }],
      }, "<!-- SLOT_IMG_00_core -->\n\n## 结论\n内容。", dir);
      expect(result.ok).toBe(false);
      expect(result.errors.join("\n")).toContain("remain under imgs");
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
});
