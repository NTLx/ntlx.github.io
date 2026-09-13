import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const policy = readFileSync(resolve(import.meta.dir, "../references/originality-policy.md"), "utf8");

describe("originality policy", () => {
  test("requires recent five-article form review including rhetorical skeleton", () => {
    expect(policy).toContain("最近 5 篇");
    expect(policy).toContain("标题修辞骨架");
    expect(policy).toContain("开头模式");
    expect(policy).toContain("H2 数量");
  });

  test("makes repeated skeleton avoidance a soft recent-three default", () => {
    expect(policy).toContain("最近 3 篇");
    expect(policy).toContain("soft editorial default");
    expect(policy).toContain("不阻断");
  });

  test("requires diverse title candidates without turning words into a blacklist", () => {
    expect(policy).toContain("尝试不同修辞骨架");
    expect(policy).toContain("不使用关键词黑名单");
  });
});
