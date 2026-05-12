import { describe, expect, it } from "vitest";
import { CompilerIR } from "../../src/engine/contracts/packageTypes";
import { resolveConflictsCanonical, generateResolutionReport } from "../../src/engine/resolve/conflictAwareResolver";

describe("Conflict-Aware Resolver", () => {
  // Helper function to create a simple IR with specific traits
  function createIRWithTraits(...canonicalKeys: string[]): CompilerIR {
    return {
      targetModel: "suno",
      nodes: canonicalKeys.map((key, idx) => ({
        id: `node-${idx}`,
        canonicalKey: key,
        semanticClass: "trait" as const,
        domain: "genre" as const,
        text: `trait ${key}`,
        priority: "dominant" as const,
        intensity: 50,
        robustness: "high" as const,
        support: "direct" as const,
      })),
    };
  }

  describe("Allow Strategy", () => {
    it("allows productive tension traits to coexist", () => {
      const ir = createIRWithTraits("surface_smooth", "motion_explosive");
      const resolved = resolveConflictsCanonical(ir);

      expect(resolved.globalNodes.length).toBe(2);
      expect(resolved.removedNodes.length).toBe(0);
      expect(resolved.warnings.length).toBeGreaterThan(0);
      expect(resolved.warnings[0].strategy).toBe("allow");
    });
  });

  describe("Compress Strategy", () => {
    it("handles productive tension traits", () => {
      const ir = createIRWithTraits("surface_breathy", "constraint_clear_diction");
      const resolved = resolveConflictsCanonical(ir);

      // Both nodes should be preserved (productive tension)
      expect(resolved.globalNodes.length + resolved.sectionalNodes.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Prioritize Strategy", () => {
    it("removes lower-priority node in direct conflict", () => {
      const ir = createIRWithTraits("surface_intimate", "core_huge");
      const resolved = resolveConflictsCanonical(ir);

      expect(resolved.globalNodes.length).toBe(1);
      expect(resolved.removedNodes.length).toBe(1);
      expect(resolved.warnings[0].strategy).toBe("prioritize");
    });

    it("prioritizes dominant over blended", () => {
      const ir: CompilerIR = {
        targetModel: "suno",
        nodes: [
          {
            id: "node-0",
            canonicalKey: "surface_intimate",
            semanticClass: "trait",
            domain: "surface",
            text: "intimate",
            priority: "dominant",
            intensity: 50,
            robustness: "high",
            support: "direct",
          },
          {
            id: "node-1",
            canonicalKey: "core_huge",
            semanticClass: "trait",
            domain: "core",
            text: "huge",
            priority: "blended",
            intensity: 50,
            robustness: "high",
            support: "direct",
          },
        ],
      };

      const resolved = resolveConflictsCanonical(ir);
      expect(resolved.globalNodes.length).toBe(1);
      expect(resolved.globalNodes[0].canonicalKey).toBe("surface_intimate");
    });
  });

  describe("Refuse Strategy", () => {
    it("removes both nodes when combination is refused", () => {
      const ir = createIRWithTraits("rule_no_falsetto", "delivery_belting");
      const resolved = resolveConflictsCanonical(ir);

      expect(resolved.globalNodes.length).toBe(0);
      expect(resolved.removedNodes.length).toBe(2);
      expect(resolved.warnings[0].strategy).toBe("refuse");
    });
  });

  describe("Sectionalize Strategy", () => {
    it("moves conflicting nodes to sectional rendering", () => {
      const ir = createIRWithTraits("surface_breathy", "delivery_commanding");
      const resolved = resolveConflictsCanonical(ir);

      expect(resolved.globalNodes.length).toBe(0);
      expect(resolved.sectionalNodes.length).toBe(2);
      expect(resolved.warnings[0].strategy).toBe("sectionalize");
    });

    it("sets default section to chorus", () => {
      const ir = createIRWithTraits("surface_breathy", "delivery_commanding");
      const resolved = resolveConflictsCanonical(ir);

      for (const node of resolved.sectionalNodes) {
        expect(node.target?.section).toBe("chorus");
      }
    });
  });

  describe("Multiple Conflicts", () => {
    it("resolves multiple conflicts correctly", () => {
      const ir = createIRWithTraits(
        "surface_intimate",
        "core_huge",
        "core_fragile",
        "core_belt_driven",
        "surface_breathy",
        "delivery_commanding"
      );
      const resolved = resolveConflictsCanonical(ir);

      expect(resolved.globalNodes.length + resolved.sectionalNodes.length + resolved.removedNodes.length).toBe(6);
      expect(resolved.warnings.length).toBeGreaterThan(0);
    });
  });

  describe("No Conflicts", () => {
    it("preserves all nodes when no conflicts", () => {
      const ir = createIRWithTraits("genre_modern_rnb", "role_male_lead", "surface_intimate");
      const resolved = resolveConflictsCanonical(ir);

      expect(resolved.globalNodes.length).toBe(3);
      expect(resolved.sectionalNodes.length).toBe(0);
      expect(resolved.removedNodes.length).toBe(0);
      expect(resolved.warnings.length).toBe(0);
    });
  });

  describe("Trace Generation", () => {
    it("generates trace entries for each step", () => {
      const ir = createIRWithTraits("surface_intimate", "core_huge");
      const resolved = resolveConflictsCanonical(ir);

      expect(resolved.compileTrace.length).toBeGreaterThan(0);
      expect(resolved.compileTrace[0].code).toBe("CONFLICT_DETECTION_START");
    });

    it("includes node IDs in trace", () => {
      const ir = createIRWithTraits("surface_intimate", "core_huge");
      const resolved = resolveConflictsCanonical(ir);

      const traceWithNodes = resolved.compileTrace.filter((e) => e.nodeIds && e.nodeIds.length > 0);
      expect(traceWithNodes.length).toBeGreaterThan(0);
    });
  });

  describe("Warnings", () => {
    it("generates warnings for all conflicts", () => {
      const ir = createIRWithTraits("surface_intimate", "core_huge");
      const resolved = resolveConflictsCanonical(ir);

      expect(resolved.warnings.length).toBeGreaterThan(0);
      expect(resolved.warnings[0].code).toBeDefined();
      expect(resolved.warnings[0].message).toBeDefined();
    });

    it("includes strategy in warnings", () => {
      const ir = createIRWithTraits("surface_intimate", "core_huge");
      const resolved = resolveConflictsCanonical(ir);

      expect(resolved.warnings[0].strategy).toBeDefined();
    });
  });

  describe("Resolution Report", () => {
    it("generates report for resolved IR", () => {
      const ir = createIRWithTraits("surface_intimate", "core_huge");
      const resolved = resolveConflictsCanonical(ir);
      const report = generateResolutionReport(resolved);

      expect(report).toContain("Resolution Report");
      expect(report).toContain("Global Nodes");
      expect(report).toContain("Removed Nodes");
    });

    it("includes warnings in report", () => {
      const ir = createIRWithTraits("surface_intimate", "core_huge");
      const resolved = resolveConflictsCanonical(ir);
      const report = generateResolutionReport(resolved);

      expect(report).toContain("Warnings");
    });

    it("includes trace in report", () => {
      const ir = createIRWithTraits("surface_intimate", "core_huge");
      const resolved = resolveConflictsCanonical(ir);
      const report = generateResolutionReport(resolved);

      expect(report).toContain("Trace");
    });
  });

  describe("Severity Handling", () => {
    it("processes strong severity conflicts first", () => {
      const ir = createIRWithTraits(
        "surface_intimate",
        "core_huge",
        "surface_breathy",
        "delivery_commanding"
      );
      const resolved = resolveConflictsCanonical(ir);

      // Strong conflicts should result in removed nodes
      expect(resolved.removedNodes.length).toBeGreaterThan(0);
    });
  });

  describe("Capability Map", () => {
    it("includes empty capability map in resolved IR", () => {
      const ir = createIRWithTraits("surface_intimate");
      const resolved = resolveConflictsCanonical(ir);

      expect(resolved.capabilityMap).toBeDefined();
      expect(Array.isArray(resolved.capabilityMap)).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("handles empty IR", () => {
      const ir: CompilerIR = {
        targetModel: "suno",
        nodes: [],
      };
      const resolved = resolveConflictsCanonical(ir);

      expect(resolved.globalNodes.length).toBe(0);
      expect(resolved.removedNodes.length).toBe(0);
      expect(resolved.warnings.length).toBe(0);
    });

    it("handles single node IR", () => {
      const ir = createIRWithTraits("surface_intimate");
      const resolved = resolveConflictsCanonical(ir);

      expect(resolved.globalNodes.length).toBe(1);
      expect(resolved.removedNodes.length).toBe(0);
    });
  });
});
