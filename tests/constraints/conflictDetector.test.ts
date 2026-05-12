import { describe, expect, it } from "vitest";
import { CompilerIR } from "../../src/engine/contracts/packageTypes";
import {
  detectConflicts,
  hasConflict,
  getNodeConflicts,
  getConflictsBySeverity,
  getConflictsByStrategy,
  hasStrongConflicts,
  generateConflictReport,
} from "../../src/engine/constraints/conflictDetector";

describe("Conflict Detector - Constraint Engine", () => {
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

  describe("Direct Conflicts", () => {
    it("detects intimate + huge conflict", () => {
      const ir = createIRWithTraits("surface_intimate", "core_huge");
      const result = detectConflicts(ir);

      expect(result.hasConflicts).toBe(true);
      expect(result.conflicts.length).toBe(1);
      expect(result.conflicts[0].rule.id).toBe("conflict_intimate_huge");
      expect(result.conflicts[0].rule.severity).toBe("strong");
    });

    it("detects fragile + belt-driven conflict", () => {
      const ir = createIRWithTraits("core_fragile", "core_belt_driven");
      const result = detectConflicts(ir);

      expect(result.hasConflicts).toBe(true);
      expect(result.conflicts.length).toBe(1);
      expect(result.conflicts[0].rule.id).toBe("conflict_fragile_belt");
      expect(result.conflicts[0].rule.severity).toBe("strong");
    });

    it("detects no falsetto + belting conflict", () => {
      const ir = createIRWithTraits("rule_no_falsetto", "delivery_belting");
      const result = detectConflicts(ir);

      expect(result.hasConflicts).toBe(true);
      expect(result.conflicts.length).toBe(1);
      expect(result.conflicts[0].rule.strategy).toBe("refuse");
    });

    it("detects no diva + belting conflict", () => {
      const ir = createIRWithTraits("rule_no_diva", "delivery_belting");
      const result = detectConflicts(ir);

      expect(result.hasConflicts).toBe(true);
      expect(result.conflicts.length).toBe(1);
      expect(result.conflicts[0].rule.strategy).toBe("refuse");
    });
  });

  describe("Context-Dependent Conflicts", () => {
    it("detects breathy + commanding conflict", () => {
      const ir = createIRWithTraits("surface_breathy", "delivery_commanding");
      const result = detectConflicts(ir);

      expect(result.hasConflicts).toBe(true);
      expect(result.conflicts.length).toBe(1);
      expect(result.conflicts[0].rule.relation).toBe("context_dependent");
      expect(result.conflicts[0].rule.strategy).toBe("sectionalize");
    });

    it("detects detached + emotional conflict", () => {
      const ir = createIRWithTraits("delivery_restrained", "constraint_emotional");
      const result = detectConflicts(ir);

      expect(result.hasConflicts).toBe(true);
      expect(result.conflicts.length).toBe(1);
      expect(result.conflicts[0].rule.relation).toBe("context_dependent");
    });

    it("detects intimate + commanding conflict", () => {
      const ir = createIRWithTraits("surface_intimate", "delivery_commanding");
      const result = detectConflicts(ir);

      expect(result.hasConflicts).toBe(true);
      expect(result.conflicts.length).toBe(1);
      expect(result.conflicts[0].rule.id).toBe("conflict_intimate_commanding");
    });

    it("detects powerful + intimate conflict", () => {
      const ir = createIRWithTraits("core_powerful", "surface_intimate");
      const result = detectConflicts(ir);

      expect(result.hasConflicts).toBe(true);
      expect(result.conflicts.length).toBe(1);
      expect(result.conflicts[0].rule.id).toBe("conflict_powerful_intimate");
    });
  });

  describe("Productive Tensions", () => {
    it("detects soft + explosive as productive tension", () => {
      const ir = createIRWithTraits("surface_smooth", "motion_explosive");
      const result = detectConflicts(ir);

      expect(result.hasConflicts).toBe(true);
      expect(result.conflicts.length).toBe(1);
      expect(result.conflicts[0].rule.relation).toBe("tension_productive");
      expect(result.conflicts[0].rule.strategy).toBe("allow");
    });

    it("detects breathy + clear diction as productive tension", () => {
      const ir = createIRWithTraits("surface_breathy", "constraint_clear_diction");
      const result = detectConflicts(ir);

      expect(result.hasConflicts).toBe(true);
      expect(result.conflicts.length).toBe(1);
      expect(result.conflicts[0].rule.relation).toBe("tension_productive");
      expect(result.conflicts[0].rule.severity).toBe("info");
    });
  });

  describe("No Conflicts", () => {
    it("detects no conflicts with compatible traits", () => {
      const ir = createIRWithTraits("genre_modern_rnb", "role_male_lead", "surface_intimate");
      const result = detectConflicts(ir);

      expect(result.hasConflicts).toBe(false);
      expect(result.conflicts.length).toBe(0);
    });

    it("detects no conflicts with single trait", () => {
      const ir = createIRWithTraits("surface_intimate");
      const result = detectConflicts(ir);

      expect(result.hasConflicts).toBe(false);
      expect(result.conflicts.length).toBe(0);
    });

    it("detects no conflicts with empty IR", () => {
      const ir: CompilerIR = {
        targetModel: "suno",
        nodes: [],
      };
      const result = detectConflicts(ir);

      expect(result.hasConflicts).toBe(false);
      expect(result.conflicts.length).toBe(0);
    });
  });

  describe("Statistics", () => {
    it("calculates correct statistics for multiple conflicts", () => {
      const ir = createIRWithTraits(
        "surface_intimate",
        "core_huge",
        "surface_breathy",
        "delivery_commanding",
        "surface_smooth",
        "motion_explosive"
      );
      const result = detectConflicts(ir);

      expect(result.stats.totalConflicts).toBeGreaterThanOrEqual(3);
      expect(result.stats.directConflicts).toBeGreaterThanOrEqual(1);
      expect(result.stats.contextDependentConflicts).toBeGreaterThanOrEqual(1);
      expect(result.stats.productiveTensions).toBeGreaterThanOrEqual(1);
    });

    it("counts severity levels correctly", () => {
      const ir = createIRWithTraits("surface_intimate", "core_huge", "surface_breathy", "delivery_commanding");
      const result = detectConflicts(ir);

      expect(result.stats.strongSeverity).toBeGreaterThanOrEqual(1);
      expect(result.stats.warningSeverity).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Conflicting Nodes Tracking", () => {
    it("tracks all conflicting nodes", () => {
      const ir = createIRWithTraits("surface_intimate", "core_huge", "surface_breathy", "delivery_commanding");
      const result = detectConflicts(ir);

      expect(result.conflictingNodes.size).toBe(4);
      expect(result.conflictingNodes.has("node-0")).toBe(true);
      expect(result.conflictingNodes.has("node-1")).toBe(true);
      expect(result.conflictingNodes.has("node-2")).toBe(true);
      expect(result.conflictingNodes.has("node-3")).toBe(true);
    });

    it("excludes non-conflicting nodes", () => {
      const ir = createIRWithTraits("surface_intimate", "core_huge", "genre_modern_rnb");
      const result = detectConflicts(ir);

      expect(result.conflictingNodes.size).toBe(2);
      expect(result.conflictingNodes.has("node-2")).toBe(false);
    });
  });

  describe("Query Functions", () => {
    it("hasConflict returns true for conflicting traits", () => {
      const ir = createIRWithTraits("surface_intimate", "core_huge");
      expect(hasConflict(ir, "surface_intimate", "core_huge")).toBe(true);
    });

    it("hasConflict returns false for non-conflicting traits", () => {
      const ir = createIRWithTraits("surface_intimate", "genre_modern_rnb");
      expect(hasConflict(ir, "surface_intimate", "genre_modern_rnb")).toBe(false);
    });

    it("getNodeConflicts returns conflicts for a specific node", () => {
      const ir = createIRWithTraits("surface_intimate", "core_huge", "genre_modern_rnb");
      const conflicts = getNodeConflicts(ir, "node-0");

      expect(conflicts.length).toBe(1);
      expect(conflicts[0].node1.id).toBe("node-0");
    });

    it("getConflictsBySeverity filters by severity", () => {
      const ir = createIRWithTraits(
        "surface_intimate",
        "core_huge",
        "surface_breathy",
        "delivery_commanding",
        "surface_smooth",
        "motion_explosive"
      );

      const strongConflicts = getConflictsBySeverity(ir, "strong");
      expect(strongConflicts.length).toBe(1);

      const infoConflicts = getConflictsBySeverity(ir, "info");
      expect(infoConflicts.length).toBe(1);
    });

    it("getConflictsByStrategy filters by strategy", () => {
      const ir = createIRWithTraits(
        "surface_intimate",
        "core_huge",
        "surface_breathy",
        "delivery_commanding",
        "surface_smooth",
        "motion_explosive"
      );

      const sectionalize = getConflictsByStrategy(ir, "sectionalize");
      expect(sectionalize.length).toBeGreaterThanOrEqual(1);

      const allow = getConflictsByStrategy(ir, "allow");
      expect(allow.length).toBeGreaterThanOrEqual(1);
    });

    it("hasStrongConflicts returns true when strong conflicts exist", () => {
      const ir = createIRWithTraits("surface_intimate", "core_huge");
      expect(hasStrongConflicts(ir)).toBe(true);
    });

    it("hasStrongConflicts returns false when no strong conflicts", () => {
      const ir = createIRWithTraits("surface_smooth", "motion_explosive");
      expect(hasStrongConflicts(ir)).toBe(false);
    });
  });

  describe("Conflict Report Generation", () => {
    it("generates report for no conflicts", () => {
      const ir = createIRWithTraits("genre_modern_rnb");
      const report = generateConflictReport(ir);

      expect(report).toContain("No conflicts detected");
    });

    it("generates detailed report for conflicts", () => {
      const ir = createIRWithTraits("surface_intimate", "core_huge");
      const report = generateConflictReport(ir);

      expect(report).toContain("Conflict Detection Report");
      expect(report).toContain("Total Conflicts: 1");
      expect(report).toContain("Direct Conflicts: 1");
      expect(report).toContain("conflict_intimate_huge");
      expect(report).toContain("STRONG");
    });

    it("includes all conflict details in report", () => {
      const ir = createIRWithTraits("surface_intimate", "core_huge");
      const report = generateConflictReport(ir);

      expect(report).toContain("surface_intimate");
      expect(report).toContain("core_huge");
      expect(report).toContain("prioritize");
    });
  });

  describe("Bidirectional Conflict Detection", () => {
    it("detects conflict regardless of trait order", () => {
      const ir1 = createIRWithTraits("surface_intimate", "core_huge");
      const ir2 = createIRWithTraits("core_huge", "surface_intimate");

      const result1 = detectConflicts(ir1);
      const result2 = detectConflicts(ir2);

      expect(result1.hasConflicts).toBe(true);
      expect(result2.hasConflicts).toBe(true);
      expect(result1.conflicts[0].rule.id).toBe(result2.conflicts[0].rule.id);
    });
  });

  describe("Multiple Conflicts", () => {
    it("detects all conflicts in complex IR", () => {
      const ir = createIRWithTraits(
        "surface_intimate",
        "core_huge",
        "core_fragile",
        "core_belt_driven",
        "surface_breathy",
        "delivery_commanding"
      );
      const result = detectConflicts(ir);

      expect(result.stats.totalConflicts).toBeGreaterThanOrEqual(3);
    });

    it("correctly categorizes multiple conflicts", () => {
      const ir = createIRWithTraits(
        "surface_intimate",
        "core_huge",
        "core_fragile",
        "core_belt_driven",
        "surface_breathy",
        "delivery_commanding"
      );
      const result = detectConflicts(ir);

      expect(result.stats.directConflicts).toBeGreaterThan(0);
      expect(result.stats.contextDependentConflicts).toBeGreaterThan(0);
    });
  });
});
