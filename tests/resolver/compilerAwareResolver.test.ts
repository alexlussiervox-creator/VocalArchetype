import { describe, expect, it } from "vitest";
import { runConstraintEngine } from "../../src/engine/constraintEngine/constraintEngine";
import { exampleIRs } from "../../src/engine/fixtures/exampleIRs";
import { resolveCompilerIR } from "../../src/engine/resolver/compilerAwareResolver";
import { CompilerIR } from "../../src/engine/contracts/packageTypes";

function resolve(ir: CompilerIR) {
  return resolveCompilerIR(runConstraintEngine(ir));
}

describe("compilerAwareResolver", () => {
  it("sectionalizes intimate + huge", () => {
    const result = resolve(exampleIRs.intimateHuge);
    expect(result.warnings.some((warning) => warning.code === "CONFLICT_SECTIONALIZED")).toBe(true);
    expect(result.sectionalNodes.length).toBeGreaterThan(0);
  });

  it("prioritizes fragile + belt_driven", () => {
    const result = resolve(exampleIRs.fragileBelt);
    expect(result.warnings.some((warning) => warning.code === "CONFLICT_PRIORITIZED")).toBe(true);
    expect(result.removedNodes.some((node) => node.canonicalKey === "fragile")).toBe(true);
  });

  it("compresses breathy + commanding", () => {
    const ir: CompilerIR = {
      targetModel: "suno",
      nodes: [
        {
          id: "surface-1",
          canonicalKey: "breathy",
          semanticClass: "trait",
          domain: "surface",
          text: "light breathy surface",
          priority: "dominant",
          intensity: 60,
          robustness: "high",
          support: "direct",
        },
        {
          id: "core-1",
          canonicalKey: "commanding",
          semanticClass: "trait",
          domain: "core",
          text: "firm centered delivery",
          priority: "dominant",
          intensity: 60,
          robustness: "high",
          support: "direct",
        },
      ],
    };
    const result = resolve(ir);
    expect(result.warnings.some((warning) => warning.code === "CONFLICT_COMPRESSED")).toBe(true);
  });

  it("compresses cinematic + conversational with trace", () => {
    const ir: CompilerIR = {
      targetModel: "suno",
      nodes: [
        {
          id: "delivery-1",
          canonicalKey: "conversational",
          semanticClass: "trait",
          domain: "delivery",
          text: "conversational phrasing",
          priority: "dominant",
          intensity: 60,
          robustness: "high",
          support: "direct",
        },
        {
          id: "motion-1",
          canonicalKey: "cinematic",
          semanticClass: "trait",
          domain: "motion",
          text: "cinematic rise",
          priority: "dominant",
          intensity: 60,
          robustness: "high",
          support: "direct",
        },
      ],
    };
    const result = resolve(ir);
    expect(result.compileTrace.some((entry) => entry.code === "CONFLICT_COMPRESSED")).toBe(true);
  });

  it("sectionalizes soft + explosive", () => {
    const ir: CompilerIR = {
      targetModel: "suno",
      nodes: [
        {
          id: "surface-1",
          canonicalKey: "soft",
          semanticClass: "trait",
          domain: "surface",
          text: "soft",
          priority: "dominant",
          intensity: 60,
          robustness: "high",
          support: "direct",
        },
        {
          id: "motion-1",
          canonicalKey: "explosive",
          semanticClass: "trait",
          domain: "motion",
          text: "explosive",
          priority: "dominant",
          intensity: 60,
          robustness: "high",
          support: "direct",
        },
      ],
    };
    const result = resolve(ir);
    expect(result.sectionalNodes.length).toBe(2);
    expect(result.compileTrace.some((entry) => entry.code === "CONFLICT_SECTIONALIZED")).toBe(true);
  });
});
