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

  test("stops URL protection at fullwidth parens so following emphasis survives", () => {
    const article = `---
title: parity test
---

## 正文

OpenAI 在[公告](https://openai.com/index/navier-stokes-solution/)里说得很明确：它声称证明的是**命题 C（并同时给出 D）**，方向是「证明方程会崩溃」。
`;
    const wechatSource = `---
title: parity test
---

## 正文

OpenAI 在公告（链接：https://openai.com/index/navier-stokes-solution/）里说得很明确：它声称证明的是**命题 C（并同时给出 D）**，方向是「证明方程会崩溃」。
`;

    expect(validateMarkdownParity(article, wechatSource).ok).toBe(true);
  });
});
