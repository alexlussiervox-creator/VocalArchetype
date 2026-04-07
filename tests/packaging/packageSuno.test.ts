import { describe, expect, it } from "vitest";
import { exampleIRs } from "../../src/engine/fixtures/exampleIRs";
import { packageSuno } from "../../src/engine/packaging/packageSuno";
import { resolveCompilerIR } from "../../src/engine/resolver/compilerAwareResolver";
import { runConstraintEngine } from "../../src/engine/constraintEngine/constraintEngine";

describe("packageSuno", () => {
  it("includes all contractual fields", () => {
    const resolved = resolveCompilerIR(runConstraintEngine(exampleIRs.intimateHuge));
    const result = packageSuno(resolved);
    expect(result.strict_prompt).toBeDefined();
    expect(result.compressed_prompt).toBeDefined();
    expect(result.fallback_prompt).toBeDefined();
    expect(result.sectioned_prompt_payload).toBeDefined();
    expect(result.compile_summary).toBeDefined();
    expect(result.warnings).toBeDefined();
    expect(result.compileTrace).toBeDefined();
  });

  it("respects style vs sectioned payload separation", () => {
    const resolved = resolveCompilerIR(runConstraintEngine(exampleIRs.intimateHuge));
    const result = packageSuno(resolved);
    expect(result.strict_prompt.includes("chorus")).toBe(false);
    expect(result.sectioned_prompt_payload.sections.length).toBeGreaterThan(0);
  });

  it("produces fallback when support is weaker or trimmed", () => {
    const resolved = resolveCompilerIR(runConstraintEngine(exampleIRs.fragileBelt));
    const result = packageSuno(resolved);
    expect(result.fallback_prompt.length).toBeGreaterThan(0);
  });

  it("stabilizes compile_summary", () => {
    const resolved = resolveCompilerIR(runConstraintEngine(exampleIRs.fragileBelt));
    const result = packageSuno(resolved);
    expect(result.compile_summary.globalNodeCount).toBe(resolved.globalNodes.length);
    expect(result.compile_summary.removedNodeCount).toBe(resolved.removedNodes.length);
  });
});
