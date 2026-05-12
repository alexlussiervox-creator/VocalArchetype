/**
 * Canonical Phrase Registry for VocalArchetype Normalizer
 *
 * This registry maps natural language vocal descriptions to semantic IR nodes.
 * Each entry supports:
 * - Multiple phrase variants and synonyms
 * - Emotional-to-technical mapping
 * - Confidence scoring
 * - Ambiguity detection
 * - Priority weighting
 * - Deduplication rules
 */

import { IRNode, SemanticClass, TraitDomain, Priority, RobustnessLevel, SupportLevel } from "../contracts/packageTypes";

/**
 * Metadata for phrase normalization
 */
export interface PhraseMetadata {
  /** Confidence score for this normalization (0.0 - 1.0) */
  confidence: number;
  /** Whether this phrase is ambiguous (could have multiple interpretations) */
  isAmbiguous: boolean;
  /** Phrases that should be deduplicated with this one */
  deduplicateWith?: string[];
  /** Archetype priority for this phrase */
  archetypePriority: "high" | "medium" | "low";
  /** Weight for phrase frequency (1.0 = normal) */
  weight: number;
}

/**
 * A canonical phrase registry entry
 */
export interface CanonicalRegistryEntry {
  /** Exact phrase and synonyms that trigger this entry */
  phrases: string[];
  /** IR node to emit when matched */
  node: Omit<IRNode, "id">;
  /** Metadata about this normalization */
  metadata: PhraseMetadata;
}

/**
 * Canonical phrase registry with comprehensive vocal vocabulary
 */
export const CANONICAL_REGISTRY: CanonicalRegistryEntry[] = [
  // ============================================================================
  // GENRE DOMAIN
  // ============================================================================

  {
    phrases: ["modern r&b", "r&b", "contemporary r&b", "rnb"],
    node: {
      canonicalKey: "genre_modern_rnb",
      semanticClass: "trait",
      domain: "genre",
      text: "modern R&B vocal character",
      priority: "dominant",
      intensity: 75,
      robustness: "high",
      support: "direct",
    },
    metadata: {
      confidence: 1.0,
      isAmbiguous: false,
      archetypePriority: "high",
      weight: 1.0,
    },
  },

  {
    phrases: ["pop", "pop music", "contemporary pop"],
    node: {
      canonicalKey: "genre_pop",
      semanticClass: "trait",
      domain: "genre",
      text: "contemporary pop vocal",
      priority: "dominant",
      intensity: 70,
      robustness: "high",
      support: "direct",
    },
    metadata: {
      confidence: 1.0,
      isAmbiguous: false,
      archetypePriority: "high",
      weight: 1.0,
    },
  },

  {
    phrases: ["jazz", "jazz vocal", "jazz singing"],
    node: {
      canonicalKey: "genre_jazz",
      semanticClass: "trait",
      domain: "genre",
      text: "jazz vocal phrasing",
      priority: "blended",
      intensity: 65,
      robustness: "high",
      support: "approximate",
    },
    metadata: {
      confidence: 0.9,
      isAmbiguous: false,
      archetypePriority: "medium",
      weight: 1.0,
    },
  },

  {
    phrases: ["classical", "opera", "classical vocal", "operatic"],
    node: {
      canonicalKey: "genre_classical",
      semanticClass: "trait",
      domain: "genre",
      text: "classical vocal technique",
      priority: "blended",
      intensity: 60,
      robustness: "high",
      support: "approximate",
    },
    metadata: {
      confidence: 0.9,
      isAmbiguous: false,
      archetypePriority: "medium",
      weight: 1.0,
    },
  },

  {
    phrases: ["rock", "rock vocal", "rock singing"],
    node: {
      canonicalKey: "genre_rock",
      semanticClass: "trait",
      domain: "genre",
      text: "rock vocal character",
      priority: "dominant",
      intensity: 75,
      robustness: "high",
      support: "direct",
    },
    metadata: {
      confidence: 1.0,
      isAmbiguous: false,
      archetypePriority: "high",
      weight: 1.0,
    },
  },

  {
    phrases: ["hip-hop", "rap", "hip hop", "hiphop"],
    node: {
      canonicalKey: "genre_hiphop",
      semanticClass: "trait",
      domain: "genre",
      text: "hip-hop vocal delivery",
      priority: "dominant",
      intensity: 70,
      robustness: "high",
      support: "direct",
    },
    metadata: {
      confidence: 1.0,
      isAmbiguous: false,
      archetypePriority: "high",
      weight: 1.0,
    },
  },

  // ============================================================================
  // ROLE DOMAIN
  // ============================================================================

  {
    phrases: ["male lead", "male voice", "male vocal", "male singer"],
    node: {
      canonicalKey: "role_male_lead",
      semanticClass: "trait",
      domain: "role",
      text: "male lead vocal",
      priority: "dominant",
      intensity: 80,
      robustness: "high",
      support: "direct",
    },
    metadata: {
      confidence: 1.0,
      isAmbiguous: false,
      archetypePriority: "high",
      weight: 1.0,
    },
  },

  {
    phrases: ["female lead", "female voice", "female vocal", "female singer"],
    node: {
      canonicalKey: "role_female_lead",
      semanticClass: "trait",
      domain: "role",
      text: "female lead vocal",
      priority: "dominant",
      intensity: 80,
      robustness: "high",
      support: "direct",
    },
    metadata: {
      confidence: 1.0,
      isAmbiguous: false,
      archetypePriority: "high",
      weight: 1.0,
    },
  },

  {
    phrases: ["tenor", "tenor voice"],
    node: {
      canonicalKey: "role_tenor",
      semanticClass: "trait",
      domain: "role",
      text: "tenor vocal range",
      priority: "blended",
      intensity: 70,
      robustness: "high",
      support: "approximate",
    },
    metadata: {
      confidence: 0.95,
      isAmbiguous: false,
      archetypePriority: "medium",
      weight: 1.0,
    },
  },

  {
    phrases: ["soprano", "soprano voice"],
    node: {
      canonicalKey: "role_soprano",
      semanticClass: "trait",
      domain: "role",
      text: "soprano vocal range",
      priority: "blended",
      intensity: 70,
      robustness: "high",
      support: "approximate",
    },
    metadata: {
      confidence: 0.95,
      isAmbiguous: false,
      archetypePriority: "medium",
      weight: 1.0,
    },
  },

  {
    phrases: ["baritone", "baritone voice"],
    node: {
      canonicalKey: "role_baritone",
      semanticClass: "trait",
      domain: "role",
      text: "baritone vocal range",
      priority: "blended",
      intensity: 70,
      robustness: "high",
      support: "approximate",
    },
    metadata: {
      confidence: 0.95,
      isAmbiguous: false,
      archetypePriority: "medium",
      weight: 1.0,
    },
  },

  {
    phrases: ["harmony", "harmony vocal", "harmonic"],
    node: {
      canonicalKey: "role_harmony",
      semanticClass: "trait",
      domain: "role",
      text: "harmony vocal support",
      priority: "blended",
      intensity: 60,
      robustness: "medium",
      support: "approximate",
    },
    metadata: {
      confidence: 0.9,
      isAmbiguous: false,
      archetypePriority: "medium",
      weight: 1.0,
    },
  },

  // ============================================================================
  // SURFACE DOMAIN
  // ============================================================================

  {
    phrases: ["intimate", "close mic", "close-mic", "close-miked", "close mic'd"],
    node: {
      canonicalKey: "surface_intimate",
      semanticClass: "trait",
      domain: "surface",
      text: "intimate close-miked vocal",
      priority: "dominant",
      intensity: 85,
      robustness: "high",
      support: "direct",
    },
    metadata: {
      confidence: 1.0,
      isAmbiguous: false,
      deduplicateWith: ["surface_vulnerable", "surface_personal"],
      archetypePriority: "high",
      weight: 1.0,
    },
  },

  {
    phrases: ["breathy", "airy", "breath"],
    node: {
      canonicalKey: "surface_breathy",
      semanticClass: "trait",
      domain: "surface",
      text: "breathy vocal quality",
      priority: "blended",
      intensity: 70,
      robustness: "high",
      support: "direct",
    },
    metadata: {
      confidence: 1.0,
      isAmbiguous: false,
      archetypePriority: "high",
      weight: 1.0,
    },
  },

  {
    phrases: ["harsh", "harsh tone", "aggressive"],
    node: {
      canonicalKey: "surface_harsh",
      semanticClass: "trait",
      domain: "surface",
      text: "harsh vocal quality",
      priority: "blended",
      intensity: 75,
      robustness: "high",
      support: "direct",
    },
    metadata: {
      confidence: 1.0,
      isAmbiguous: false,
      archetypePriority: "high",
      weight: 1.0,
    },
  },

  {
    phrases: ["smooth", "smooth vocal", "silky"],
    node: {
      canonicalKey: "surface_smooth",
      semanticClass: "trait",
      domain: "surface",
      text: "smooth vocal quality",
      priority: "blended",
      intensity: 65,
      robustness: "high",
      support: "direct",
    },
    metadata: {
      confidence: 1.0,
      isAmbiguous: false,
      archetypePriority: "high",
      weight: 1.0,
    },
  },

  {
    phrases: ["raspy", "rough", "gritty"],
    node: {
      canonicalKey: "surface_raspy",
      semanticClass: "trait",
      domain: "surface",
      text: "raspy vocal quality",
      priority: "blended",
      intensity: 70,
      robustness: "high",
      support: "direct",
    },
    metadata: {
      confidence: 1.0,
      isAmbiguous: false,
      archetypePriority: "high",
      weight: 1.0,
    },
  },

  // ============================================================================
  // CORE DOMAIN
  // ============================================================================

  {
    phrases: ["belt-driven", "belt driven", "belted", "belting"],
    node: {
      canonicalKey: "core_belt_driven",
      semanticClass: "trait",
      domain: "core",
      text: "belt-driven vocal core",
      priority: "dominant",
      intensity: 85,
      robustness: "high",
      support: "direct",
    },
    metadata: {
      confidence: 1.0,
      isAmbiguous: false,
      deduplicateWith: ["core_powerful", "core_huge"],
      archetypePriority: "high",
      weight: 1.0,
    },
  },

  {
    phrases: ["fragile", "delicate", "tender", "soft core"],
    node: {
      canonicalKey: "core_fragile",
      semanticClass: "trait",
      domain: "core",
      text: "fragile vocal core",
      priority: "dominant",
      intensity: 60,
      robustness: "medium",
      support: "direct",
    },
    metadata: {
      confidence: 1.0,
      isAmbiguous: false,
      deduplicateWith: ["core_delicate", "core_tender"],
      archetypePriority: "high",
      weight: 1.0,
    },
  },

  {
    phrases: ["powerful", "strong", "powerful voice"],
    node: {
      canonicalKey: "core_powerful",
      semanticClass: "trait",
      domain: "core",
      text: "powerful vocal core",
      priority: "dominant",
      intensity: 80,
      robustness: "high",
      support: "direct",
    },
    metadata: {
      confidence: 1.0,
      isAmbiguous: true, // Can mean core or intensity
      deduplicateWith: ["core_belt_driven", "core_huge"],
      archetypePriority: "high",
      weight: 1.0,
    },
  },

  {
    phrases: ["huge", "massive", "big"],
    node: {
      canonicalKey: "core_huge",
      semanticClass: "trait",
      domain: "core",
      text: "huge vocal core",
      priority: "dominant",
      intensity: 85,
      robustness: "high",
      support: "direct",
    },
    metadata: {
      confidence: 0.9,
      isAmbiguous: true, // Can mean core or intensity
      deduplicateWith: ["core_powerful", "core_belt_driven"],
      archetypePriority: "high",
      weight: 1.0,
    },
  },

  // ============================================================================
  // DELIVERY DOMAIN
  // ============================================================================

  {
    phrases: ["conversational", "spoken", "natural", "relaxed"],
    node: {
      canonicalKey: "delivery_conversational",
      semanticClass: "trait",
      domain: "delivery",
      text: "conversational vocal delivery",
      priority: "blended",
      intensity: 65,
      robustness: "high",
      support: "direct",
    },
    metadata: {
      confidence: 1.0,
      isAmbiguous: false,
      archetypePriority: "high",
      weight: 1.0,
    },
  },

  {
    phrases: ["commanding", "authoritative", "commanding voice"],
    node: {
      canonicalKey: "delivery_commanding",
      semanticClass: "trait",
      domain: "delivery",
      text: "commanding vocal delivery",
      priority: "dominant",
      intensity: 80,
      robustness: "high",
      support: "direct",
    },
    metadata: {
      confidence: 1.0,
      isAmbiguous: false,
      archetypePriority: "high",
      weight: 1.0,
    },
  },

  {
    phrases: ["whispering", "whisper", "whispered"],
    node: {
      canonicalKey: "delivery_whispering",
      semanticClass: "trait",
      domain: "delivery",
      text: "whispering vocal delivery",
      priority: "blended",
      intensity: 50,
      robustness: "medium",
      support: "approximate",
    },
    metadata: {
      confidence: 0.95,
      isAmbiguous: false,
      archetypePriority: "medium",
      weight: 1.0,
    },
  },

  {
    phrases: ["belting", "belt", "belted delivery"],
    node: {
      canonicalKey: "delivery_belting",
      semanticClass: "trait",
      domain: "delivery",
      text: "belting vocal delivery",
      priority: "dominant",
      intensity: 85,
      robustness: "high",
      support: "direct",
    },
    metadata: {
      confidence: 1.0,
      isAmbiguous: false,
      archetypePriority: "high",
      weight: 1.0,
    },
  },

  {
    phrases: ["restrained", "controlled", "held back"],
    node: {
      canonicalKey: "delivery_restrained",
      semanticClass: "trait",
      domain: "delivery",
      text: "restrained vocal delivery",
      priority: "blended",
      intensity: 55,
      robustness: "high",
      support: "direct",
    },
    metadata: {
      confidence: 1.0,
      isAmbiguous: false,
      archetypePriority: "medium",
      weight: 1.0,
    },
  },

  // ============================================================================
  // MOTION DOMAIN
  // ============================================================================

  {
    phrases: ["gradual rise", "building", "gradual"],
    node: {
      canonicalKey: "motion_gradual_rise",
      semanticClass: "trait",
      domain: "motion",
      text: "gradual rise in vocal energy",
      priority: "blended",
      intensity: 65,
      robustness: "medium",
      support: "approximate",
    },
    metadata: {
      confidence: 0.9,
      isAmbiguous: false,
      archetypePriority: "medium",
      weight: 1.0,
    },
  },

  {
    phrases: ["explosive", "sudden", "explosive start"],
    node: {
      canonicalKey: "motion_explosive",
      semanticClass: "trait",
      domain: "motion",
      text: "explosive vocal entry",
      priority: "dominant",
      intensity: 80,
      robustness: "high",
      support: "direct",
    },
    metadata: {
      confidence: 1.0,
      isAmbiguous: false,
      archetypePriority: "high",
      weight: 1.0,
    },
  },

  {
    phrases: ["smooth transition", "smooth", "flowing"],
    node: {
      canonicalKey: "motion_smooth",
      semanticClass: "trait",
      domain: "motion",
      text: "smooth vocal transition",
      priority: "blended",
      intensity: 60,
      robustness: "high",
      support: "direct",
    },
    metadata: {
      confidence: 1.0,
      isAmbiguous: false,
      archetypePriority: "medium",
      weight: 1.0,
    },
  },

  {
    phrases: ["staccato", "choppy", "articulated"],
    node: {
      canonicalKey: "motion_staccato",
      semanticClass: "trait",
      domain: "motion",
      text: "staccato vocal articulation",
      priority: "blended",
      intensity: 70,
      robustness: "high",
      support: "direct",
    },
    metadata: {
      confidence: 1.0,
      isAmbiguous: false,
      archetypePriority: "medium",
      weight: 1.0,
    },
  },

  {
    phrases: ["energetic", "energized", "high energy"],
    node: {
      canonicalKey: "motion_energetic",
      semanticClass: "trait",
      domain: "motion",
      text: "energetic vocal motion",
      priority: "dominant",
      intensity: 80,
      robustness: "high",
      support: "direct",
    },
    metadata: {
      confidence: 1.0,
      isAmbiguous: false,
      archetypePriority: "high",
      weight: 1.0,
    },
  },

  // ============================================================================
  // PRODUCTION DOMAIN
  // ============================================================================

  {
    phrases: ["reverb", "with reverb", "reverby"],
    node: {
      canonicalKey: "production_reverb",
      semanticClass: "render_hint",
      domain: "production",
      text: "add reverb effect",
      priority: "subtle",
      intensity: 50,
      robustness: "medium",
      support: "direct",
    },
    metadata: {
      confidence: 1.0,
      isAmbiguous: false,
      archetypePriority: "low",
      weight: 0.8,
    },
  },

  {
    phrases: ["compression", "compressed", "with compression"],
    node: {
      canonicalKey: "production_compression",
      semanticClass: "render_hint",
      domain: "production",
      text: "add compression",
      priority: "subtle",
      intensity: 50,
      robustness: "medium",
      support: "direct",
    },
    metadata: {
      confidence: 1.0,
      isAmbiguous: false,
      archetypePriority: "low",
      weight: 0.8,
    },
  },

  {
    phrases: ["eq", "equalization", "with eq"],
    node: {
      canonicalKey: "production_eq",
      semanticClass: "render_hint",
      domain: "production",
      text: "apply EQ",
      priority: "subtle",
      intensity: 50,
      robustness: "medium",
      support: "approximate",
    },
    metadata: {
      confidence: 0.9,
      isAmbiguous: false,
      archetypePriority: "low",
      weight: 0.8,
    },
  },

  {
    phrases: ["delay", "with delay"],
    node: {
      canonicalKey: "production_delay",
      semanticClass: "render_hint",
      domain: "production",
      text: "add delay effect",
      priority: "subtle",
      intensity: 50,
      robustness: "medium",
      support: "direct",
    },
    metadata: {
      confidence: 1.0,
      isAmbiguous: false,
      archetypePriority: "low",
      weight: 0.8,
    },
  },

  // ============================================================================
  // HARD RULES (Negative Cues)
  // ============================================================================

  {
    phrases: ["no falsetto", "no falsetto voice", "avoid falsetto"],
    node: {
      canonicalKey: "rule_no_falsetto",
      semanticClass: "hard_rule",
      domain: "core",
      text: "do not use falsetto",
      priority: "dominant",
      intensity: 100,
      robustness: "high",
      support: "direct",
    },
    metadata: {
      confidence: 1.0,
      isAmbiguous: false,
      archetypePriority: "high",
      weight: 1.0,
    },
  },

  {
    phrases: ["no diva", "not diva", "no diva vocals", "avoid diva"],
    node: {
      canonicalKey: "rule_no_diva",
      semanticClass: "hard_rule",
      domain: "delivery",
      text: "avoid diva theatrics",
      priority: "dominant",
      intensity: 100,
      robustness: "high",
      support: "direct",
    },
    metadata: {
      confidence: 1.0,
      isAmbiguous: false,
      archetypePriority: "high",
      weight: 1.0,
    },
  },

  {
    phrases: ["no breathy", "not breathy", "avoid breathy"],
    node: {
      canonicalKey: "rule_no_breathy",
      semanticClass: "hard_rule",
      domain: "surface",
      text: "avoid breathy quality",
      priority: "dominant",
      intensity: 100,
      robustness: "high",
      support: "direct",
    },
    metadata: {
      confidence: 1.0,
      isAmbiguous: false,
      archetypePriority: "medium",
      weight: 1.0,
    },
  },

  {
    phrases: ["no harsh", "not harsh", "avoid harsh"],
    node: {
      canonicalKey: "rule_no_harsh",
      semanticClass: "hard_rule",
      domain: "surface",
      text: "avoid harsh quality",
      priority: "dominant",
      intensity: 100,
      robustness: "high",
      support: "direct",
    },
    metadata: {
      confidence: 1.0,
      isAmbiguous: false,
      archetypePriority: "medium",
      weight: 1.0,
    },
  },

  // ============================================================================
  // SOFT CONSTRAINTS
  // ============================================================================

  {
    phrases: ["clear diction", "clear articulation"],
    node: {
      canonicalKey: "constraint_clear_diction",
      semanticClass: "soft_constraint",
      domain: "delivery",
      text: "prioritize clear diction",
      priority: "blended",
      intensity: 70,
      robustness: "high",
      support: "direct",
    },
    metadata: {
      confidence: 1.0,
      isAmbiguous: false,
      archetypePriority: "medium",
      weight: 1.0,
    },
  },

  {
    phrases: ["soulful", "soulful vocal"],
    node: {
      canonicalKey: "constraint_soulful",
      semanticClass: "soft_constraint",
      domain: "core",
      text: "add soulful character",
      priority: "blended",
      intensity: 65,
      robustness: "medium",
      support: "approximate",
    },
    metadata: {
      confidence: 0.9,
      isAmbiguous: false,
      archetypePriority: "medium",
      weight: 1.0,
    },
  },

  {
    phrases: ["emotional", "emotionally expressive"],
    node: {
      canonicalKey: "constraint_emotional",
      semanticClass: "soft_constraint",
      domain: "delivery",
      text: "emotionally expressive delivery",
      priority: "blended",
      intensity: 70,
      robustness: "medium",
      support: "approximate",
    },
    metadata: {
      confidence: 0.9,
      isAmbiguous: false,
      archetypePriority: "medium",
      weight: 1.0,
    },
  },
];

/**
 * Helper function to find registry entries by phrase
 * Prioritizes exact matches and longer phrase matches
 */
export function findRegistryEntries(phrase: string): CanonicalRegistryEntry[] {
  const normalized = phrase.toLowerCase().trim();

  // First, try exact matches
  const exactMatches = CANONICAL_REGISTRY.filter((entry) =>
    entry.phrases.some((p) => normalized === p)
  );

  if (exactMatches.length > 0) {
    return exactMatches;
  }

  // Then, try substring matches, sorted by phrase length (longest first)
  const substringMatches = CANONICAL_REGISTRY.filter((entry) =>
    entry.phrases.some((p) => normalized.includes(p))
  ).sort((a, b) => {
    // Sort by longest matching phrase length
    const aLen = Math.max(...a.phrases.map((p) => p.length));
    const bLen = Math.max(...b.phrases.map((p) => p.length));
    return bLen - aLen;
  });

  return substringMatches;
}

/**
 * Helper function to get deduplication rules
 */
export function getDeduplicationRules(): Map<string, string[]> {
  const rules = new Map<string, string[]>();
  for (const entry of CANONICAL_REGISTRY) {
    if (entry.metadata.deduplicateWith) {
      rules.set(entry.node.canonicalKey, entry.metadata.deduplicateWith);
    }
  }
  return rules;
}
