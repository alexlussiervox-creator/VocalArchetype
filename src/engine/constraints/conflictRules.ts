// src/engine/constraints/conflictRules.ts

import type {
  CompilerIR,
  ConflictRecord,
  ConflictRelation,
  ConflictStrategy,
  SemanticAtom,
} from "../types/packageTypes";

interface ConflictRule {
  left: string;
  right: string;
  relation: ConflictRelation;
  strategy: ConflictStrategy;
  reason: string;
}

const CONFLICT_RULES: ConflictRule[] = [
  {
    left: "intimate_close_mic",
    right: "huge_anthemic",
    relation: "context_dependent",
    strategy: "sectionalize",
    reason: "Intimate and huge should be split across sections instead of emitted as one global contradiction.",
  },
  {
    left: "fragile_core",
    right: "belt_driven",
    relation: "direct_conflict",
    strategy: "prioritize",
    reason: "Fragile core and belt-driven delivery compete unless a higher-priority section-specific override exists.",
  },
  {
    left: "breathy_surface",
    right: "commanding_delivery",
    relation: "tension_productive",
    strategy: "compress",
    reason: "Breathy surface with firm control can be approximated as a domain-separated contrast.",
  },
  {
    left: "cinematic_scope",
    right: "conversational_phrasing",
    relation: "tension_productive",
    strategy: "compress",
    reason: "Cinematic scale and conversational phrasing can coexist if rendered compactly.",
  },
  {
    left: "detached_cool",
    right: "confessional_intimacy",
    relation: "context_dependent",
    strategy: "prioritize",
    reason: "Detached and confessional imply competing emotional stances.",
  },
  {
    left: "soft_restrained",
    right: "explosive_impact",
    relation: "context_dependent",
    strategy: "sectionalize",
    reason: "Soft restraint versus explosive impact is usually a sectional contrast, not a single global state.",
  },
  {
    left: "anti_falsetto",
    right: "falsetto_lift",
    relation: "direct_conflict",
    strategy: "refuse",
    reason: "No-falsetto and falsetto-lift are mutually incompatible.",
  },
  {
    left: "call_response",
    right: "single_agent_lead",
    relation: "context_dependent",
    strategy: "prioritize",
    reason: "Call-and-response may need simplification if the backend cannot support clear role routing.",
  },
];

function normalizePair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

function collectCandidateAtoms(ir: CompilerIR): SemanticAtom[] {
  return [
    ...ir.identityLayer,
    ...ir.behaviorLayer,
    ...ir.constraintLayer.hardRules,
    ...ir.constraintLayer.softConstraints,
  ];
}

function findRule(leftKey: string, rightKey: string): ConflictRule | undefined {
  const [a, b] = normalizePair(leftKey, rightKey);

  return CONFLICT_RULES.find((rule) => {
    const [ruleA, ruleB] = normalizePair(rule.left, rule.right);
    return ruleA === a && ruleB === b;
  });
}

export function detectConflicts(ir: CompilerIR): ConflictRecord[] {
  const atoms = collectCandidateAtoms(ir);
  const conflicts: ConflictRecord[] = [];

  for (let i = 0; i < atoms.length; i += 1) {
    for (let j = i + 1; j < atoms.length; j += 1) {
      const left = atoms[i];
      const right = atoms[j];

      if (left.key === right.key) continue;

      const rule = findRule(left.key, right.key);
      if (!rule) continue;

      conflicts.push({
        leftKey: left.key,
        rightKey: right.key,
        relation: rule.relation,
        recommendedStrategy: rule.strategy,
        reason: rule.reason,
      });
    }
  }

  return conflicts;
}

export function getConflictStrategy(
  leftKey: string,
  rightKey: string,
): ConflictStrategy | null {
  const rule = findRule(leftKey, rightKey);
  return rule?.strategy ?? null;
}

export function isDirectConflict(leftKey: string, rightKey: string): boolean {
  const rule = findRule(leftKey, rightKey);
  return rule?.relation === "direct_conflict";
    }
