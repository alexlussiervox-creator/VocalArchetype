/**
 * Canonical Conflict Rules for VocalArchetype Constraint Engine
 *
 * This module defines all vocal trait conflicts and resolution strategies.
 * Conflicts are detected when incompatible traits are present in the same IR.
 */

/**
 * Types of conflict relationships
 */
export type ConflictRelation = "compatible" | "tension_productive" | "context_dependent" | "direct_conflict";

/**
 * Resolution strategies for conflicts
 */
export type ResolutionStrategy = "allow" | "compress" | "prioritize" | "refuse" | "sectionalize";

/**
 * Severity levels for conflict issues
 */
export type ConflictSeverity = "info" | "warning" | "strong";

/**
 * A conflict rule definition
 */
export interface ConflictRule {
  /** Unique identifier for this rule */
  id: string;
  /** First trait involved in the conflict */
  trait1: string;
  /** Second trait involved in the conflict */
  trait2: string;
  /** Type of relationship between traits */
  relation: ConflictRelation;
  /** Strategy for resolving the conflict */
  strategy: ResolutionStrategy;
  /** Severity of the conflict */
  severity: ConflictSeverity;
  /** Human-readable message explaining the conflict */
  message: string;
  /** Explanation of the resolution strategy */
  explanation: string;
}

/**
 * Canonical conflict rules for vocal traits
 *
 * These rules define which vocal traits are incompatible and how to resolve conflicts.
 * The conflict detection engine uses these rules to analyze IR nodes.
 */
export const CONFLICT_RULES: ConflictRule[] = [
  // ============================================================================
  // RULE 1: Intimate + Huge (Direct Conflict)
  // ============================================================================
  {
    id: "conflict_intimate_huge",
    trait1: "surface_intimate",
    trait2: "core_huge",
    relation: "direct_conflict",
    strategy: "prioritize",
    severity: "strong",
    message: "Intimate and huge are contradictory vocal qualities",
    explanation:
      "Intimate (close-miked, vulnerable) and huge (massive, expansive) are fundamentally incompatible. " +
      "The resolver will prioritize the higher-priority trait and remove the other.",
  },

  // ============================================================================
  // RULE 2: Fragile + Belt-Driven (Direct Conflict)
  // ============================================================================
  {
    id: "conflict_fragile_belt",
    trait1: "core_fragile",
    trait2: "core_belt_driven",
    relation: "direct_conflict",
    strategy: "prioritize",
    severity: "strong",
    message: "Fragile and belt-driven are contradictory core qualities",
    explanation:
      "Fragile (delicate, tender) and belt-driven (powerful, supported) are opposing vocal techniques. " +
      "The resolver will keep the higher-priority trait.",
  },

  // ============================================================================
  // RULE 3: Breathy + Commanding (Context-Dependent Conflict)
  // ============================================================================
  {
    id: "conflict_breathy_commanding",
    trait1: "surface_breathy",
    trait2: "delivery_commanding",
    relation: "context_dependent",
    strategy: "sectionalize",
    severity: "warning",
    message: "Breathy and commanding delivery are contradictory",
    explanation:
      "Breathy (airy, soft) and commanding (authoritative, strong) are typically incompatible. " +
      "The resolver will attempt to place them in different sections (e.g., breathy verse, commanding chorus).",
  },

  // ============================================================================
  // RULE 4: Detached + Confessional (Context-Dependent Conflict)
  // ============================================================================
  {
    id: "conflict_detached_confessional",
    trait1: "delivery_restrained",
    trait2: "constraint_emotional",
    relation: "context_dependent",
    strategy: "sectionalize",
    severity: "warning",
    message: "Detached and confessional are contradictory emotional states",
    explanation:
      "Restrained (detached, controlled) and emotional (expressive, vulnerable) are opposing emotional approaches. " +
      "The resolver will attempt to sectionalize them.",
  },

  // ============================================================================
  // RULE 5: Soft + Explosive (Tension Productive)
  // ============================================================================
  {
    id: "conflict_soft_explosive",
    trait1: "surface_smooth",
    trait2: "motion_explosive",
    relation: "tension_productive",
    strategy: "allow",
    severity: "info",
    message: "Soft and explosive can create dynamic contrast",
    explanation:
      "Soft (smooth, gentle) and explosive (sudden, powerful) can create interesting dynamic contrast. " +
      "The resolver will allow both traits to coexist.",
  },

  // ============================================================================
  // RULE 6: No Falsetto + Falsetto Lift (Direct Conflict - Refusal)
  // ============================================================================
  {
    id: "conflict_no_falsetto_falsetto_lift",
    trait1: "rule_no_falsetto",
    trait2: "delivery_belting",
    relation: "direct_conflict",
    strategy: "refuse",
    severity: "strong",
    message: "Cannot use belting when falsetto is forbidden",
    explanation:
      "If the user explicitly forbids falsetto, belting (which may require falsetto) becomes problematic. " +
      "The resolver will refuse both traits and request clarification.",
  },

  // ============================================================================
  // RULE 7: No Diva + Theatrical Belt (Direct Conflict - Refusal)
  // ============================================================================
  {
    id: "conflict_no_diva_theatrical_belt",
    trait1: "rule_no_diva",
    trait2: "delivery_belting",
    relation: "direct_conflict",
    strategy: "refuse",
    severity: "strong",
    message: "Cannot use theatrical belting when diva quality is forbidden",
    explanation:
      "No diva (avoiding theatrical quality) and belting (which often involves theatrical delivery) conflict. " +
      "The resolver will refuse both and request clarification.",
  },

  // ============================================================================
  // RULE 8: Intimate + Commanding (Context-Dependent)
  // ============================================================================
  {
    id: "conflict_intimate_commanding",
    trait1: "surface_intimate",
    trait2: "delivery_commanding",
    relation: "context_dependent",
    strategy: "sectionalize",
    severity: "warning",
    message: "Intimate and commanding are contradictory delivery styles",
    explanation:
      "Intimate (close, personal) and commanding (authoritative, strong) are opposing delivery styles. " +
      "The resolver will attempt to place them in different sections.",
  },

  // ============================================================================
  // RULE 9: Breathy + Clear Diction (Tension Productive)
  // ============================================================================
  {
    id: "conflict_breathy_clear_diction",
    trait1: "surface_breathy",
    trait2: "constraint_clear_diction",
    relation: "tension_productive",
    strategy: "allow",
    severity: "info",
    message: "Breathy with clear diction can create an interesting contrast",
    explanation:
      "Breathy (airy) and clear diction (articulate) can work together to create a distinctive sound. " +
      "The resolver will allow both traits.",
  },

  // ============================================================================
  // RULE 10: Powerful + Intimate (Context-Dependent)
  // ============================================================================
  {
    id: "conflict_powerful_intimate",
    trait1: "core_powerful",
    trait2: "surface_intimate",
    relation: "context_dependent",
    strategy: "sectionalize",
    severity: "warning",
    message: "Powerful and intimate are contradictory qualities",
    explanation:
      "Powerful (strong, expansive) and intimate (close, vulnerable) are opposing qualities. " +
      "The resolver will attempt to place them in different sections.",
  },
];

/**
 * Find conflict rules involving a specific trait
 */
export function findConflictRules(trait: string): ConflictRule[] {
  return CONFLICT_RULES.filter((rule) => rule.trait1 === trait || rule.trait2 === trait);
}

/**
 * Find a specific conflict rule between two traits
 */
export function findConflictBetween(trait1: string, trait2: string): ConflictRule | undefined {
  return CONFLICT_RULES.find(
    (rule) => (rule.trait1 === trait1 && rule.trait2 === trait2) || (rule.trait1 === trait2 && rule.trait2 === trait1)
  );
}

/**
 * Get all direct conflict rules
 */
export function getDirectConflicts(): ConflictRule[] {
  return CONFLICT_RULES.filter((rule) => rule.relation === "direct_conflict");
}

/**
 * Get all productive tension rules
 */
export function getProductiveTensions(): ConflictRule[] {
  return CONFLICT_RULES.filter((rule) => rule.relation === "tension_productive");
}

/**
 * Get all context-dependent conflict rules
 */
export function getContextDependentConflicts(): ConflictRule[] {
  return CONFLICT_RULES.filter((rule) => rule.relation === "context_dependent");
}

/**
 * Get rules by resolution strategy
 */
export function getRulesByStrategy(strategy: ResolutionStrategy): ConflictRule[] {
  return CONFLICT_RULES.filter((rule) => rule.strategy === strategy);
}

/**
 * Get rules by severity
 */
export function getRulesBySeverity(severity: ConflictSeverity): ConflictRule[] {
  return CONFLICT_RULES.filter((rule) => rule.severity === severity);
}
