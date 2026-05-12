import { describe, expect, it } from "vitest";
import { verifyCompilerIR } from "../../src/engine/verifier/verifier";
import { CompilerIR, IRNode } from "../../src/engine/contracts/packageTypes";

describe("verifyCompilerIR - Hardened Tests", () => {
  describe("Invalid IR - Missing Required Fields", () => {
    it("rejects IR with missing nodes", () => {
      const ir: CompilerIR = {
        targetModel: "suno",
        nodes: [],
      };
      const result = verifyCompilerIR(ir);
      expect(result.ok).toBe(false);
      expect(result.issues.some((i) => i.code === "NODES_MISSING")).toBe(true);
    });

    it("rejects node with missing id", () => {
      const ir: CompilerIR = {
        targetModel: "suno",
        nodes: [
          {
            id: "",
            canonicalKey: "test",
            semanticClass: "trait",
            domain: "genre",
            text: "test",
            priority: "dominant",
            intensity: 50,
            robustness: "medium",
            support: "direct",
          },
        ],
      };
      const result = verifyCompilerIR(ir);
      expect(result.ok).toBe(false);
      expect(result.issues.some((i) => i.code === "NODE_ID_MISSING")).toBe(true);
    });

    it("rejects node with missing canonicalKey", () => {
      const ir: CompilerIR = {
        targetModel: "suno",
        nodes: [
          {
            id: "test-1",
            canonicalKey: "",
            semanticClass: "trait",
            domain: "genre",
            text: "test",
            priority: "dominant",
            intensity: 50,
            robustness: "medium",
            support: "direct",
          },
        ],
      };
      const result = verifyCompilerIR(ir);
      expect(result.ok).toBe(false);
      expect(result.issues.some((i) => i.code === "CANONICAL_KEY_MISSING")).toBe(true);
    });

    it("rejects node with missing text", () => {
      const ir: CompilerIR = {
        targetModel: "suno",
        nodes: [
          {
            id: "test-1",
            canonicalKey: "test",
            semanticClass: "trait",
            domain: "genre",
            text: "",
            priority: "dominant",
            intensity: 50,
            robustness: "medium",
            support: "direct",
          },
        ],
      };
      const result = verifyCompilerIR(ir);
      expect(result.ok).toBe(false);
      expect(result.issues.some((i) => i.code === "TEXT_MISSING")).toBe(true);
    });
  });

  describe("Invalid IR - Invalid Values", () => {
    it("rejects invalid semanticClass", () => {
      const ir: CompilerIR = {
        targetModel: "suno",
        nodes: [
          {
            id: "test-1",
            canonicalKey: "test",
            semanticClass: "invalid" as any,
            domain: "genre",
            text: "test",
            priority: "dominant",
            intensity: 50,
            robustness: "medium",
            support: "direct",
          },
        ],
      };
      const result = verifyCompilerIR(ir);
      expect(result.ok).toBe(false);
      expect(result.issues.some((i) => i.code === "INVALID_SEMANTIC_CLASS")).toBe(true);
    });

    it("rejects invalid domain", () => {
      const ir: CompilerIR = {
        targetModel: "suno",
        nodes: [
          {
            id: "test-1",
            canonicalKey: "test",
            semanticClass: "trait",
            domain: "invalid" as any,
            text: "test",
            priority: "dominant",
            intensity: 50,
            robustness: "medium",
            support: "direct",
          },
        ],
      };
      const result = verifyCompilerIR(ir);
      expect(result.ok).toBe(false);
      expect(result.issues.some((i) => i.code === "INVALID_DOMAIN")).toBe(true);
    });

    it("rejects invalid priority", () => {
      const ir: CompilerIR = {
        targetModel: "suno",
        nodes: [
          {
            id: "test-1",
            canonicalKey: "test",
            semanticClass: "trait",
            domain: "genre",
            text: "test",
            priority: "invalid" as any,
            intensity: 50,
            robustness: "medium",
            support: "direct",
          },
        ],
      };
      const result = verifyCompilerIR(ir);
      expect(result.ok).toBe(false);
      expect(result.issues.some((i) => i.code === "INVALID_PRIORITY")).toBe(true);
    });

    it("rejects invalid robustness", () => {
      const ir: CompilerIR = {
        targetModel: "suno",
        nodes: [
          {
            id: "test-1",
            canonicalKey: "test",
            semanticClass: "trait",
            domain: "genre",
            text: "test",
            priority: "dominant",
            intensity: 50,
            robustness: "invalid" as any,
            support: "direct",
          },
        ],
      };
      const result = verifyCompilerIR(ir);
      expect(result.ok).toBe(false);
      expect(result.issues.some((i) => i.code === "INVALID_ROBUSTNESS")).toBe(true);
    });

    it("rejects invalid support", () => {
      const ir: CompilerIR = {
        targetModel: "suno",
        nodes: [
          {
            id: "test-1",
            canonicalKey: "test",
            semanticClass: "trait",
            domain: "genre",
            text: "test",
            priority: "dominant",
            intensity: 50,
            robustness: "medium",
            support: "invalid" as any,
          },
        ],
      };
      const result = verifyCompilerIR(ir);
      expect(result.ok).toBe(false);
      expect(result.issues.some((i) => i.code === "INVALID_SUPPORT")).toBe(true);
    });
  });

  describe("Invalid IR - Range Validation", () => {
    it("rejects intensity < 0", () => {
      const ir: CompilerIR = {
        targetModel: "suno",
        nodes: [
          {
            id: "test-1",
            canonicalKey: "test",
            semanticClass: "trait",
            domain: "genre",
            text: "test",
            priority: "dominant",
            intensity: -1,
            robustness: "medium",
            support: "direct",
          },
        ],
      };
      const result = verifyCompilerIR(ir);
      expect(result.ok).toBe(false);
      expect(result.issues.some((i) => i.code === "INVALID_INTENSITY")).toBe(true);
    });

    it("rejects intensity > 100", () => {
      const ir: CompilerIR = {
        targetModel: "suno",
        nodes: [
          {
            id: "test-1",
            canonicalKey: "test",
            semanticClass: "trait",
            domain: "genre",
            text: "test",
            priority: "dominant",
            intensity: 101,
            robustness: "medium",
            support: "direct",
          },
        ],
      };
      const result = verifyCompilerIR(ir);
      expect(result.ok).toBe(false);
      expect(result.issues.some((i) => i.code === "INVALID_INTENSITY")).toBe(true);
    });

    it("accepts intensity = 0", () => {
      const ir: CompilerIR = {
        targetModel: "suno",
        nodes: [
          {
            id: "test-1",
            canonicalKey: "test",
            semanticClass: "trait",
            domain: "genre",
            text: "test",
            priority: "dominant",
            intensity: 0,
            robustness: "medium",
            support: "direct",
          },
        ],
      };
      const result = verifyCompilerIR(ir);
      expect(result.ok).toBe(true);
    });

    it("accepts intensity = 100", () => {
      const ir: CompilerIR = {
        targetModel: "suno",
        nodes: [
          {
            id: "test-1",
            canonicalKey: "test",
            semanticClass: "trait",
            domain: "genre",
            text: "test",
            priority: "dominant",
            intensity: 100,
            robustness: "medium",
            support: "direct",
          },
        ],
      };
      const result = verifyCompilerIR(ir);
      expect(result.ok).toBe(true);
    });
  });

  describe("Duplicate Detection", () => {
    it("detects duplicate node IDs", () => {
      const ir: CompilerIR = {
        targetModel: "suno",
        nodes: [
          {
            id: "test-1",
            canonicalKey: "test1",
            semanticClass: "trait",
            domain: "genre",
            text: "test",
            priority: "dominant",
            intensity: 50,
            robustness: "medium",
            support: "direct",
          },
          {
            id: "test-1",
            canonicalKey: "test2",
            semanticClass: "trait",
            domain: "role",
            text: "test",
            priority: "dominant",
            intensity: 50,
            robustness: "medium",
            support: "direct",
          },
        ],
      };
      const result = verifyCompilerIR(ir);
      expect(result.ok).toBe(false);
      expect(result.issues.some((i) => i.code === "DUPLICATE_NODE_ID")).toBe(true);
    });

    it("warns on duplicate canonical keys", () => {
      const ir: CompilerIR = {
        targetModel: "suno",
        nodes: [
          {
            id: "test-1",
            canonicalKey: "same-key",
            semanticClass: "trait",
            domain: "genre",
            text: "test",
            priority: "dominant",
            intensity: 50,
            robustness: "medium",
            support: "direct",
          },
          {
            id: "test-2",
            canonicalKey: "same-key",
            semanticClass: "trait",
            domain: "role",
            text: "test",
            priority: "dominant",
            intensity: 50,
            robustness: "medium",
            support: "direct",
          },
        ],
      };
      const result = verifyCompilerIR(ir);
      expect(result.ok).toBe(true); // Warning only, not a hard error
      expect(result.issues.some((i) => i.code === "DUPLICATE_CANONICAL_KEY")).toBe(true);
    });
  });

  describe("Multi-Voice Validation", () => {
    it("rejects invalid multi-voice pattern", () => {
      const ir: CompilerIR = {
        targetModel: "suno",
        nodes: [
          {
            id: "test-1",
            canonicalKey: "test",
            semanticClass: "trait",
            domain: "genre",
            text: "test",
            priority: "dominant",
            intensity: 50,
            robustness: "medium",
            support: "direct",
          },
        ],
        multiVoice: {
          pattern: "invalid" as any,
        },
      };
      const result = verifyCompilerIR(ir);
      expect(result.ok).toBe(false);
      expect(result.issues.some((i) => i.code === "INVALID_MULTIVOICE_PATTERN")).toBe(true);
    });

    it("rejects invalid multi-voice mode", () => {
      const ir: CompilerIR = {
        targetModel: "suno",
        nodes: [
          {
            id: "test-1",
            canonicalKey: "test",
            semanticClass: "trait",
            domain: "genre",
            text: "test",
            priority: "dominant",
            intensity: 50,
            robustness: "medium",
            support: "direct",
          },
        ],
        multiVoice: {
          pattern: "lead_harmony",
          mode: "invalid" as any,
        },
      };
      const result = verifyCompilerIR(ir);
      expect(result.ok).toBe(false);
      expect(result.issues.some((i) => i.code === "INVALID_MULTIVOICE_MODE")).toBe(true);
    });

    it("accepts valid multi-voice configuration", () => {
      const ir: CompilerIR = {
        targetModel: "suno",
        nodes: [
          {
            id: "test-1",
            canonicalKey: "test",
            semanticClass: "trait",
            domain: "genre",
            text: "test",
            priority: "dominant",
            intensity: 50,
            robustness: "medium",
            support: "direct",
          },
        ],
        multiVoice: {
          pattern: "lead_harmony",
          mode: "prompt_direct",
        },
      };
      const result = verifyCompilerIR(ir);
      expect(result.ok).toBe(true);
    });
  });

  describe("Valid IR", () => {
    it("accepts minimal valid IR", () => {
      const ir: CompilerIR = {
        targetModel: "suno",
        nodes: [
          {
            id: "test-1",
            canonicalKey: "test",
            semanticClass: "trait",
            domain: "genre",
            text: "test",
            priority: "dominant",
            intensity: 50,
            robustness: "medium",
            support: "direct",
          },
        ],
      };
      const result = verifyCompilerIR(ir);
      expect(result.ok).toBe(true);
      expect(result.issues.length).toBe(0);
    });

    it("accepts IR with all valid semantic classes", () => {
      const classes = ["trait", "preference", "hard_rule", "soft_constraint", "render_hint", "multi_voice"];
      const nodes = classes.map((cls, idx) => ({
        id: `test-${idx}`,
        canonicalKey: `test-${idx}`,
        semanticClass: cls as any,
        domain: "genre",
        text: `test ${cls}`,
        priority: "dominant" as const,
        intensity: 50,
        robustness: "medium" as const,
        support: "direct" as const,
      }));

      const ir: CompilerIR = {
        targetModel: "suno",
        nodes,
      };
      const result = verifyCompilerIR(ir);
      expect(result.ok).toBe(true);
    });

    it("accepts IR with all valid domains", () => {
      const domains = ["genre", "role", "surface", "core", "delivery", "motion", "production"];
      const nodes = domains.map((domain, idx) => ({
        id: `test-${idx}`,
        canonicalKey: `test-${idx}`,
        semanticClass: "trait" as const,
        domain: domain as any,
        text: `test ${domain}`,
        priority: "dominant" as const,
        intensity: 50,
        robustness: "medium" as const,
        support: "direct" as const,
      }));

      const ir: CompilerIR = {
        targetModel: "suno",
        nodes,
      };
      const result = verifyCompilerIR(ir);
      expect(result.ok).toBe(true);
    });

    it("accepts IR with all valid priorities", () => {
      const priorities = ["dominant", "blended", "subtle"];
      const nodes = priorities.map((priority, idx) => ({
        id: `test-${idx}`,
        canonicalKey: `test-${idx}`,
        semanticClass: "trait" as const,
        domain: "genre" as const,
        text: `test ${priority}`,
        priority: priority as any,
        intensity: 50,
        robustness: "medium" as const,
        support: "direct" as const,
      }));

      const ir: CompilerIR = {
        targetModel: "suno",
        nodes,
      };
      const result = verifyCompilerIR(ir);
      expect(result.ok).toBe(true);
    });

    it("accepts IR with all valid support levels", () => {
      const supports = ["direct", "approximate", "unsupported", "rejected"];
      const nodes = supports.map((support, idx) => ({
        id: `test-${idx}`,
        canonicalKey: `test-${idx}`,
        semanticClass: "trait" as const,
        domain: "genre" as const,
        text: `test ${support}`,
        priority: "dominant" as const,
        intensity: 50,
        robustness: "medium" as const,
        support: support as any,
      }));

      const ir: CompilerIR = {
        targetModel: "suno",
        nodes,
      };
      const result = verifyCompilerIR(ir);
      expect(result.ok).toBe(true);
    });
  });
});
