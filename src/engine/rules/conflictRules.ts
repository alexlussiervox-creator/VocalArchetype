import { ConflictMatch, IRNode, ResolutionStrategy, WarningSeverity } from "../contracts/packageTypes";

type Relation = "compatible" | "tension_productive" | "context_dependent" | "direct_conflict";

interface ConflictRule {
  pair: [string, string];
  relation: Relation;
  strategy: ResolutionStrategy;
  severity: WarningSeverity;
  message: string;
}

const RULES: ConflictRule[] = [
  {
    pair: ["intimate", "huge"],
    relation: "context_dependent",
    strategy: "sectionalize",
    severity: "warning",
    message: "‘intimate’ and ‘huge’ are more robust when separated by section or function.",
  },
  {
    pair: ["fragile", "belt_driven"],
    relation: "direct_conflict",
    strategy: "prioritize",
    severity: "strong",
    message: "‘fragile’ and ‘belt-driven’ conflict unless explicitly separated by section.",
  },
  {
    pair: ["breathy", "commanding"],
    relation: "tension_productive",
    strategy: "compress",
    severity: "warning",
    message: "‘breathy’ and ‘commanding’ should be rendered as surface/core contrast, not raw adjective stacking.",
  },
  {
    pair: ["cinematic", "conversational"],
    relation: "tension_productive",
    strategy: "compress",
    severity: "info",
    message: "‘cinematic’ and ‘conversational’ can coexist when allocated to different domains.",
  },
  {
    pair: ["soft", "explosive"],
    relation: "context_dependent",
    strategy: "sectionalize",
    severity: "warning",
    message: "‘soft’ and ‘explosive’ are safer as sectional contrast than simultaneous global claims.",
  },
];

function pairKey(a: string, b: string): string {
  return [a, b].sort().join("::");
}

const LOOKUP = new Map<string, ConflictRule>(RULES.map((rule) => [pairKey(rule.pair[0], rule.pair[1]), rule]));

export function findConflictMatches(nodes: IRNode[]): ConflictMatch[] {
  const matches: ConflictMatch[] = [];
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const left = nodes[i];
      const right = nodes[j];
      const rule = LOOKUP.get(pairKey(left.canonicalKey, right.canonicalKey));
      if (!rule) continue;
      matches.push({
        leftNodeId: left.id,
        rightNodeId: right.id,
        relation: rule.relation,
        strategy: rule.strategy,
        message: rule.message,
        severity: rule.severity,
      });
    }
  }
  return matches;
}
