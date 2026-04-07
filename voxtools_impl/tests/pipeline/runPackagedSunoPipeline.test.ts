import { describe, expect, it } from "vitest";
import { compileFromSelections } from "../../src/app/adapters/compileFromSelections";
import { regressionFixtures } from "../../src/engine/fixtures/exampleIRs";

describe("runPackagedSunoPipeline end-to-end", () => {
  it("handles simple input", () => {
    const result = compileFromSelections({
      archetypes: [],
      intensity: 60,
      priority: "blended",
      genre: "modern_rnb",
      role: "male_lead",
      production: [],
      sections: [],
      hardRules: [],
      multiVoiceRequest: null,
    });
    expect(result.ok).toBe(true);
    expect(result.packaged?.strict_prompt.length).toBeGreaterThan(0);
  });

  it("handles conflict input", () => {
    const fixture = regressionFixtures.find((item) => item.name === "fragile + belt_lift")!;
    const result = compileFromSelections(fixture.input);
    expect(result.ok).toBe(true);
    expect(result.packaged?.warnings.some((warning) => warning.code === "CONFLICT_PRIORITIZED")).toBe(true);
  });

  it("handles sectional input", () => {
    const fixture = regressionFixtures.find((item) => item.name === "chorus tighter than verse")!;
    const result = compileFromSelections(fixture.input);
    expect(result.packaged?.sectioned_prompt_payload.sections.length).toBeGreaterThan(0);
  });

  it("handles simple multi-voice input", () => {
    const fixture = regressionFixtures.find((item) => item.name === "call_response")!;
    const result = compileFromSelections(fixture.input);
    expect(result.packaged?.warnings.some((warning) => warning.code === "MULTIVOICE_SPLIT_CONSIDER")).toBe(true);
  });

  it("handles rejected input truthfully", () => {
    const result = compileFromSelections({
      archetypes: [],
      intensity: 60,
      priority: "dominant",
      production: [],
      sections: [],
      hardRules: [],
      multiVoiceRequest: { pattern: "simultaneous_duet" },
    });
    expect(result.ok).toBe(true);
    expect(result.packaged?.warnings.some((warning) => warning.code === "MULTIVOICE_SPLIT_REQUIRED")).toBe(true);
  });
});
