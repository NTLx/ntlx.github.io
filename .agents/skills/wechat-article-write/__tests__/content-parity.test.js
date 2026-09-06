#!/usr/bin/env bun

import { describe, expect, test } from "bun:test";
import { validateMarkdownParity } from "../scripts/content-parity-lib.mjs";

describe("content parity normalization", () => {
  test("normalizes links whose labels contain nested square brackets", () => {
    const article = `---
title: parity test
---

## 参考资料

- [R[L]ing Qwen to Paint with Code（原始项目说明）](https://surya.website/rling-qwen-to-paint-with-code)
`;
    const wechatSource = `---
title: parity test
---

## 参考资料

- R[L]ing Qwen to Paint with Code（原始项目说明）\\
  https://surya.website/rling-qwen-to-paint-with-code
`;

    expect(validateMarkdownParity(article, wechatSource).ok).toBe(true);
  });
});
