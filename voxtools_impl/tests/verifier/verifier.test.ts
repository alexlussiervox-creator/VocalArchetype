import { describe, expect, it } from "vitest";
import { verifyCompilerIR } from "../../src/engine/verifier/verifier";
import { CompilerIR } from "../../src/engine/contracts/packageTypes";

function baseIR(): CompilerIR {
  return {
    targetModel: "suno",
    nodes: [
      {
        id: "node-1",
        canonicalKey: "intimate",
        semanticClass: "trait",
        domain: "surface",
        text: "intimate",
        priority: "dominant",
        intensity: 60,
        robustness: "high",
        support: "direct",
      },
    ],
  };
}

describe("verifyCompilerIR", () => {
  it("rejects node without id", () => {
    const ir = baseIR();
    // @ts-expect-error test case
    ir.nodes[0].id = "";
    const result = verifyCompilerIR(ir);
    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.code === "NODE_ID_MISSING")).toBe(true);
  });

  it("rejects missing canonicalKey", () => {
    const ir = baseIR();
    // @ts-expect-error test case
    ir.nodes[0].canonicalKey = "";
    const result = verifyCompilerIR(ir);
    expect(result.issues.some((issue) => issue.code === "CANONICAL_KEY_MISSING")).toBe(true);
  });

  it("rejects invalid semanticClass", () => {
    const ir = baseIR();
    // @ts-expect-error test case
    ir.nodes[0].semanticClass = "banana";
    const result = verifyCompilerIR(ir);
    expect(result.issues.some((issue) => issue.code === "INVALID_SEMANTIC_CLASS")).toBe(true);
  });

  it("rejects invalid domain", () => {
    const ir = baseIR();
    // @ts-expect-error test case
    ir.nodes[0].domain = "banana";
    const result = verifyCompilerIR(ir);
    expect(result.issues.some((issue) => issue.code === "INVALID_DOMAIN")).toBe(true);
  });

  it("rejects out of range intensity", () => {
    const ir = baseIR();
    ir.nodes[0].intensity = 101;
    const result = verifyCompilerIR(ir);
    expect(result.issues.some((issue) => issue.code === "INVALID_INTENSITY")).toBe(true);
  });

  it("rejects sectional node without target", () => {
    const ir = baseIR();
    ir.nodes[0].domain = "sectional";
    const result = verifyCompilerIR(ir);
    expect(result.issues.some((issue) => issue.code === "SECTION_TARGET_MISSING")).toBe(true);
  });

  it("rejects duplicate ids", () => {
    const ir = baseIR();
    ir.nodes.push({ ...ir.nodes[0] });
    const result = verifyCompilerIR(ir);
    expect(result.issues.some((issue) => issue.code === "DUPLICATE_NODE_ID")).toBe(true);
  });
});
