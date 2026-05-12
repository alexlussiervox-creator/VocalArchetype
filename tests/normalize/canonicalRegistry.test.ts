import { describe, expect, it } from "vitest";
import { CANONICAL_REGISTRY, findRegistryEntries, getDeduplicationRules } from "../../src/engine/normalize/canonicalRegistry";

describe("Canonical Registry - Normalizer Expansion", () => {
  describe("Registry Structure", () => {
    it("has entries for all major domains", () => {
      const domains = new Set(CANONICAL_REGISTRY.map((e) => e.node.domain));
      expect(domains.has("genre")).toBe(true);
      expect(domains.has("role")).toBe(true);
      expect(domains.has("surface")).toBe(true);
      expect(domains.has("core")).toBe(true);
      expect(domains.has("delivery")).toBe(true);
      expect(domains.has("motion")).toBe(true);
      expect(domains.has("production")).toBe(true);
    });

    it("has entries for all semantic classes", () => {
      const classes = new Set(CANONICAL_REGISTRY.map((e) => e.node.semanticClass));
      expect(classes.has("trait")).toBe(true);
      expect(classes.has("hard_rule")).toBe(true);
      expect(classes.has("soft_constraint")).toBe(true);
      expect(classes.has("render_hint")).toBe(true);
    });

    it("all entries have valid metadata", () => {
      for (const entry of CANONICAL_REGISTRY) {
        expect(entry.metadata.confidence).toBeGreaterThan(0);
        expect(entry.metadata.confidence).toBeLessThanOrEqual(1);
        expect(["high", "medium", "low"]).toContain(entry.metadata.archetypePriority);
        expect(entry.metadata.weight).toBeGreaterThan(0);
      }
    });

    it("all entries have at least one phrase", () => {
      for (const entry of CANONICAL_REGISTRY) {
        expect(entry.phrases.length).toBeGreaterThan(0);
        for (const phrase of entry.phrases) {
          expect(phrase.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("Genre Domain", () => {
    it("recognizes modern R&B", () => {
      const entries = findRegistryEntries("modern r&b");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("genre_modern_rnb");
    });

    it("recognizes pop", () => {
      const entries = findRegistryEntries("pop");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("genre_pop");
    });

    it("recognizes rock", () => {
      const entries = findRegistryEntries("rock");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("genre_rock");
    });

    it("recognizes hip-hop", () => {
      const entries = findRegistryEntries("hip-hop");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("genre_hiphop");
    });

    it("recognizes jazz", () => {
      const entries = findRegistryEntries("jazz");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("genre_jazz");
    });
  });

  describe("Role Domain", () => {
    it("recognizes male lead", () => {
      const entries = findRegistryEntries("male lead");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("role_male_lead");
    });

    it("recognizes female lead", () => {
      const entries = findRegistryEntries("female lead");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("role_female_lead");
    });

    it("recognizes tenor", () => {
      const entries = findRegistryEntries("tenor");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("role_tenor");
    });

    it("recognizes harmony", () => {
      const entries = findRegistryEntries("harmony");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("role_harmony");
    });
  });

  describe("Surface Domain", () => {
    it("recognizes intimate", () => {
      const entries = findRegistryEntries("intimate");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("surface_intimate");
    });

    it("recognizes breathy", () => {
      const entries = findRegistryEntries("breathy");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("surface_breathy");
    });

    it("recognizes harsh", () => {
      const entries = findRegistryEntries("harsh");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("surface_harsh");
    });

    it("recognizes smooth", () => {
      const entries = findRegistryEntries("smooth");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("surface_smooth");
    });

    it("recognizes raspy", () => {
      const entries = findRegistryEntries("raspy");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("surface_raspy");
    });
  });

  describe("Core Domain", () => {
    it("recognizes belt-driven", () => {
      const entries = findRegistryEntries("belt-driven");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("core_belt_driven");
    });

    it("recognizes fragile", () => {
      const entries = findRegistryEntries("fragile");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("core_fragile");
    });

    it("recognizes powerful", () => {
      const entries = findRegistryEntries("powerful");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("core_powerful");
    });

    it("recognizes huge", () => {
      const entries = findRegistryEntries("huge");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("core_huge");
    });
  });

  describe("Delivery Domain", () => {
    it("recognizes conversational", () => {
      const entries = findRegistryEntries("conversational");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("delivery_conversational");
    });

    it("recognizes commanding", () => {
      const entries = findRegistryEntries("commanding");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("delivery_commanding");
    });

    it("recognizes whispering", () => {
      const entries = findRegistryEntries("whispering");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("delivery_whispering");
    });

    it("recognizes restrained", () => {
      const entries = findRegistryEntries("restrained");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("delivery_restrained");
    });
  });

  describe("Motion Domain", () => {
    it("recognizes gradual rise", () => {
      const entries = findRegistryEntries("gradual rise");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("motion_gradual_rise");
    });

    it("recognizes explosive", () => {
      const entries = findRegistryEntries("explosive");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("motion_explosive");
    });

    it("recognizes smooth transition", () => {
      const entries = findRegistryEntries("smooth transition");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("motion_smooth");
    });

    it("recognizes staccato", () => {
      const entries = findRegistryEntries("staccato");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("motion_staccato");
    });

    it("recognizes energetic", () => {
      const entries = findRegistryEntries("energetic");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("motion_energetic");
    });
  });

  describe("Production Domain", () => {
    it("recognizes reverb", () => {
      const entries = findRegistryEntries("reverb");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("production_reverb");
    });

    it("recognizes compression", () => {
      const entries = findRegistryEntries("compression");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("production_compression");
    });

    it("recognizes eq", () => {
      const entries = findRegistryEntries("eq");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("production_eq");
    });

    it("recognizes delay", () => {
      const entries = findRegistryEntries("delay");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("production_delay");
    });
  });

  describe("Hard Rules (Negative Cues)", () => {
    it("recognizes no falsetto", () => {
      const entries = findRegistryEntries("no falsetto");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("rule_no_falsetto");
      expect(entries[0].node.semanticClass).toBe("hard_rule");
    });

    it("recognizes no diva", () => {
      const entries = findRegistryEntries("no diva");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("rule_no_diva");
      expect(entries[0].node.semanticClass).toBe("hard_rule");
    });

    it("recognizes no breathy", () => {
      const entries = findRegistryEntries("no breathy");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("rule_no_breathy");
      expect(entries[0].node.semanticClass).toBe("hard_rule");
    });

    it("recognizes no harsh", () => {
      const entries = findRegistryEntries("no harsh");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("rule_no_harsh");
      expect(entries[0].node.semanticClass).toBe("hard_rule");
    });
  });

  describe("Soft Constraints", () => {
    it("recognizes clear diction", () => {
      const entries = findRegistryEntries("clear diction");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("constraint_clear_diction");
      expect(entries[0].node.semanticClass).toBe("soft_constraint");
    });

    it("recognizes soulful", () => {
      const entries = findRegistryEntries("soulful");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("constraint_soulful");
      expect(entries[0].node.semanticClass).toBe("soft_constraint");
    });

    it("recognizes emotional", () => {
      const entries = findRegistryEntries("emotional");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("constraint_emotional");
      expect(entries[0].node.semanticClass).toBe("soft_constraint");
    });
  });

  describe("Synonyms and Variants", () => {
    it("recognizes close-mic as intimate", () => {
      const entries = findRegistryEntries("close-mic");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("surface_intimate");
    });

    it("recognizes airy as breathy", () => {
      const entries = findRegistryEntries("airy");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("surface_breathy");
    });

    it("recognizes delicate as fragile", () => {
      const entries = findRegistryEntries("delicate");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("core_fragile");
    });

    it("recognizes spoken as conversational", () => {
      const entries = findRegistryEntries("spoken");
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].node.canonicalKey).toBe("delivery_conversational");
    });
  });

  describe("Confidence Scoring", () => {
    it("exact matches have confidence 1.0", () => {
      const entries = findRegistryEntries("intimate");
      expect(entries[0].metadata.confidence).toBe(1.0);
    });

    it("approximate matches have lower confidence", () => {
      const entries = findRegistryEntries("jazz");
      expect(entries[0].metadata.confidence).toBeLessThan(1.0);
    });
  });

  describe("Ambiguity Detection", () => {
    it("marks powerful as ambiguous", () => {
      const entries = findRegistryEntries("powerful");
      expect(entries[0].metadata.isAmbiguous).toBe(true);
    });

    it("marks huge as ambiguous", () => {
      const entries = findRegistryEntries("huge");
      expect(entries[0].metadata.isAmbiguous).toBe(true);
    });

    it("marks intimate as not ambiguous", () => {
      const entries = findRegistryEntries("intimate");
      expect(entries[0].metadata.isAmbiguous).toBe(false);
    });
  });

  describe("Deduplication Rules", () => {
    it("provides deduplication rules", () => {
      const rules = getDeduplicationRules();
      expect(rules.size).toBeGreaterThan(0);
    });

    it("intimate deduplicates with vulnerable and personal", () => {
      const rules = getDeduplicationRules();
      const intimateRules = rules.get("surface_intimate");
      expect(intimateRules).toBeDefined();
      expect(intimateRules).toContain("surface_vulnerable");
      expect(intimateRules).toContain("surface_personal");
    });

    it("belt-driven deduplicates with powerful and huge", () => {
      const rules = getDeduplicationRules();
      const beltRules = rules.get("core_belt_driven");
      expect(beltRules).toBeDefined();
      expect(beltRules).toContain("core_powerful");
      expect(beltRules).toContain("core_huge");
    });
  });

  describe("Archetype Priority", () => {
    it("high priority phrases include belt-driven", () => {
      const entries = findRegistryEntries("belt-driven");
      expect(entries[0].metadata.archetypePriority).toBe("high");
    });

    it("high priority phrases include intimate", () => {
      const entries = findRegistryEntries("intimate");
      expect(entries[0].metadata.archetypePriority).toBe("high");
    });

    it("low priority phrases include production effects", () => {
      const entries = findRegistryEntries("reverb");
      expect(entries[0].metadata.archetypePriority).toBe("low");
    });
  });

  describe("Weight Scaling", () => {
    it("production effects have reduced weight", () => {
      const entries = findRegistryEntries("reverb");
      expect(entries[0].metadata.weight).toBeLessThan(1.0);
    });

    it("core traits have normal weight", () => {
      const entries = findRegistryEntries("intimate");
      expect(entries[0].metadata.weight).toBe(1.0);
    });
  });
});
