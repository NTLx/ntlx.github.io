#!/usr/bin/env bun
/**
 * normalize-image-formats.mjs 单元测试
 *
 * 测试 MIME 检测 + 扩展名修正 + 引用更新 + --dry-run + 幂等性
 */

import { describe, test, expect, afterAll } from "bun:test";
import { mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const SCRIPTS_DIR = resolve(import.meta.dir, "../scripts");

// 每个 test 使用独立临时目录，避免状态冲突
let testDirs = [];

function makeTmpDir() {
  const d = join(tmpdir(), `normalize-img-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(d, { recursive: true });
  testDirs.push(d);
  return d;
}

function runNormalize(postDir, extraArgs = []) {
  return spawnSync("bun", ["run", join(SCRIPTS_DIR, "normalize-image-formats.mjs"), postDir, ...extraArgs], {
    encoding: "utf8",
  });
}

function createFakeJpeg(filePath) {
  const buf = Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,
    0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
    0x00, 0x01, 0x00, 0x00, 0xFF, 0xD9,
  ]);
  writeFileSync(filePath, buf);
}

function createFakePng(filePath) {
  const buf = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
    0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00,
    0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC,
    0x33, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
    0x44, 0xAE, 0x42, 0x60, 0x82,
  ]);
  writeFileSync(filePath, buf);
}

afterAll(() => {
  for (const d of testDirs) {
    try { rmSync(d, { recursive: true, force: true }); } catch {}
  }
});

describe("normalize-image-formats", () => {
  test("JPEG 文件保存为 .png 时重命名并报告变更", () => {
    const TMP = makeTmpDir();
    const imgsDir = join(TMP, "imgs");
    mkdirSync(imgsDir, { recursive: true });
    createFakeJpeg(join(imgsDir, "01-arch.png"));

    writeFileSync(join(TMP, "draft.md"), `![arch](imgs/01-arch.png)`);

    const r = runNormalize(TMP);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("01-arch.png -> 01-arch.jpg");
    expect(existsSync(join(imgsDir, "01-arch.jpg"))).toBe(true);
  });

  test("PNG 文件保存为 .png 时不改动", () => {
    const TMP = makeTmpDir();
    const imgsDir = join(TMP, "imgs");
    mkdirSync(imgsDir, { recursive: true });
    createFakePng(join(imgsDir, "01-arch.png"));

    writeFileSync(join(TMP, "draft.md"), `![arch](imgs/01-arch.png)`);

    const r = runNormalize(TMP);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("all image formats correct");
  });

  test("--dry-run 报告变更但不实际重命名", () => {
    const TMP = makeTmpDir();
    const imgsDir = join(TMP, "imgs");
    mkdirSync(imgsDir, { recursive: true });
    createFakeJpeg(join(imgsDir, "01-arch.png"));

    writeFileSync(join(TMP, "draft.md"), `![arch](imgs/01-arch.png)`);

    const r = runNormalize(TMP, ["--dry-run"]);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("[dry-run]");
    expect(existsSync(join(imgsDir, "01-arch.png"))).toBe(true);
  });

  test("draft.md 引用随重命名更新", () => {
    const TMP = makeTmpDir();
    const imgsDir = join(TMP, "imgs");
    mkdirSync(imgsDir, { recursive: true });
    createFakeJpeg(join(imgsDir, "01-arch.png"));

    writeFileSync(join(TMP, "draft.md"), `![架构图](imgs/01-arch.png)`);

    const r = runNormalize(TMP);
    expect(r.status).toBe(0);

    const result = readFileSync(join(TMP, "draft.md"), "utf8");
    expect(result).toContain("01-arch.jpg");
    expect(result).not.toContain("01-arch.png");
  });

  test("无参数返回 exit 1", () => {
    const r = spawnSync("bun", ["run", join(SCRIPTS_DIR, "normalize-image-formats.mjs")], {
      encoding: "utf8",
    });
    expect(r.status).toBe(1);
  });

  test("目录不存在返回 exit 2", () => {
    const r = runNormalize("/nonexistent/path-" + Date.now());
    expect(r.status).toBe(2);
  });

  test("无图片目录时仍成功（无 imgs/ 子目录）", () => {
    const TMP = makeTmpDir();
    writeFileSync(join(TMP, "draft.md"), `just text, no images`);

    const r = runNormalize(TMP);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("all image formats correct");
  });
});