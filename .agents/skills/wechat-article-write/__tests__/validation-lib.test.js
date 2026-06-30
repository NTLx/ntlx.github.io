#!/usr/bin/env bun
/**
 * validation-lib.mjs regression tests.
 */

import { describe, test, expect } from "bun:test";
import { resolveSlotImageFile } from "../scripts/validation-lib.mjs";

describe("resolveSlotImageFile", () => {
  test("slot 00 resolves only to the infographic image", () => {
    const file = resolveSlotImageFile("<!-- SLOT_IMG_00_INFOGRAPHIC -->", [
      "00-cover.png",
      "00-infographic-core-summary.png",
      "01-detail.png",
    ]);

    expect(file).toBe("00-infographic-core-summary.png");
  });

  test("slot 00 rejects legacy generic infographic names", () => {
    const file = resolveSlotImageFile("<!-- SLOT_IMG_00_INFOGRAPHIC -->", [
      "00-infographic.png",
      "01-detail.png",
    ]);

    expect(file).toBe(null);
  });

  test("body slots prefer the normalized placeholder description", () => {
    const file = resolveSlotImageFile("<!-- SLOT_IMG_01_CODE_VS_CONTEXT_DIVIDE -->", [
      "01-other.png",
      "01-code_vs_context_divide.png",
    ]);

    expect(file).toBe("01-code_vs_context_divide.png");
  });
});
