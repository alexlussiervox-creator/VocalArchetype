// src/engine/tests/normalizer.test.ts

import { describe, expect, it } from "vitest";
import { normalizeIntentToIR } from "../normalize/normalizer";

describe("normalizeIntentToIR", () => {
  it("maps huge chorus into chorus section patch", () => {
    const ir = normalizeIntentToIR("huge chorus");

    expect(ir.sectionLayer[0].section).toBe("chorus");
  });

  it("maps no falsetto into hard rules", () => {
    const ir = normalizeIntentToIR("no falsetto");

    expect(ir.constraintLayer.hardRules.some(
      (atom) => atom.key === "anti_falsetto",
    )).toBe(true);
  });

  it("maps male pop voice into identity layer", () => {
    const ir = normalizeIntentToIR("male pop voice");

    expect(ir.identityLayer.some(
      (atom) => atom.key === "male_lead",
    )).toBe(true);

    expect(ir.identityLayer.some(
      (atom) => atom.key === "cinematic_pop",
    )).toBe(true);
  });
});
