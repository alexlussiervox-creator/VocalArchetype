import {
  CompilerIR,
  CompileTraceEntry,
  ConstraintEngineResult,
  ConstraintViolation,
  IRNode,
} from "../contracts/packageTypes";
import { getCapabilityEntry } from "../contracts/capabilityMap";
import { findConflictMatches } from "../rules/conflictRules";

const DOMAIN_LIMITS: Partial<Record<IRNode["domain"], number>> = {
  genre: 1,
  role: 1,
  surface: 1,
  core: 1,
  delivery: 1,
  motion: 1,
  production: 2,
};

function trace(entry: CompileTraceEntry, bucket: CompileTraceEntry[]): void {
  bucket.push(entry);
}

function buildDomainCollisions(nodes: IRNode[]): ConstraintViolation[] {
  const grouped = new Map<IRNode["domain"], IRNode[]>();
  for (const node of nodes) {
    if (node.domain === "sectional") continue;
    const current = grouped.get(node.domain) ?? [];
    current.push(node);
    grouped.set(node.domain, current);
  }

  const collisions: ConstraintViolation[] = [];
  for (const [domain, domainNodes] of grouped.entries()) {
    const limit = DOMAIN_LIMITS[domain] ?? domainNodes.length;
    if (domainNodes.length > limit) {
      collisions.push({
        type: "domain_collision",
        code: "DOMAIN_LIMIT_EXCEEDED",
        message: `Domain \"${domain}\" exceeded limit ${limit}.`,
        nodeIds: domainNodes.map((node) => node.id),
        severity: "warning",
        suggestedStrategy: "prioritize",
      });
    }
  }
  return collisions;
}

function buildHardRuleViolations(nodes: IRNode[]): ConstraintViolation[] {
  const violations: ConstraintViolation[] = [];
  const hasFalsettoBan = nodes.some((node) => node.canonicalKey === "no_falsetto");
  const hasHeadVoiceBan = nodes.some((node) => node.canonicalKey === "no_head_voice");
  const hasBeltDriven = nodes.some((node) => node.canonicalKey === "belt_driven");

  if ((hasFalsettoBan || hasHeadVoiceBan) && hasBeltDriven) {
    violations.push({
      type: "hard_rule_violation",
      code: "HARD_RULE_TENSION",
      message: "Hard bans on falsetto/head voice may constrain belt-driven requests and require prioritization or sectionalization.",
      nodeIds: nodes.filter((node) => ["no_falsetto", "no_head_voice", "belt_driven"].includes(node.canonicalKey)).map((node) => node.id),
      severity: "warning",
      suggestedStrategy: "prioritize",
    });
  }

  return violations;
}

function buildSectionalCandidates(nodes: IRNode[]): ConstraintViolation[] {
  const candidates: ConstraintViolation[] = [];
  for (const node of nodes) {
    if (node.domain === "sectional" || node.target) continue;
    if (["belt_chorus_only", "call_response", "drop_reentry", "chorus_tighter_than_verse"].includes(node.canonicalKey)) {
      candidates.push({
        type: "sectional_candidate",
        code: "MOVE_TO_SECTIONAL",
        message: `Node \"${node.canonicalKey}\" belongs in sectional control rather than global style identity.`,
        nodeIds: [node.id],
        severity: "warning",
        suggestedStrategy: "sectionalize",
      });
    }
  }
  return candidates;
}

function buildUnsupportedRequests(nodes: IRNode[]): ConstraintViolation[] {
  const violations: ConstraintViolation[] = [];
  for (const node of nodes) {
    const capability = getCapabilityEntry(node.canonicalKey);
    const support = capability?.support ?? node.support;
    if (support === "unsupported" || support === "rejected") {
      violations.push({
        type: "unsupported_request",
        code: support === "rejected" ? "CAPABILITY_REJECTED" : "CAPABILITY_UNSUPPORTED",
        message: capability?.reason ?? `Node \"${node.canonicalKey}\" is not directly supported by backend capability constraints.`,
        nodeIds: [node.id],
        severity: support === "rejected" ? "strong" : "warning",
        suggestedStrategy: support === "rejected" ? "refuse" : "compress",
      });
    }
  }
  return violations;
}

export function runConstraintEngine(ir: CompilerIR): ConstraintEngineResult {
  const compileTrace: CompileTraceEntry[] = [];
  const conflicts = findConflictMatches(ir.nodes);
  const domainCollisions = buildDomainCollisions(ir.nodes);
  const hardRuleViolations = buildHardRuleViolations(ir.nodes);
  const sectionalCandidates = buildSectionalCandidates(ir.nodes);
  const unsupportedRequests = buildUnsupportedRequests(ir.nodes);

  trace({
    step: "constraint",
    code: "CONSTRAINT_ENGINE_START",
    message: `Constraint engine analyzing ${ir.nodes.length} nodes.`,
  }, compileTrace);

  for (const conflict of conflicts) {
    trace({
      step: "constraint",
      code: "EXPLICIT_CONFLICT_FOUND",
      message: conflict.message,
      nodeIds: [conflict.leftNodeId, conflict.rightNodeId],
      severity: conflict.severity,
    }, compileTrace);
  }

  for (const violation of [...domainCollisions, ...hardRuleViolations, ...sectionalCandidates, ...unsupportedRequests]) {
    trace({
      step: "constraint",
      code: violation.code,
      message: violation.message,
      nodeIds: violation.nodeIds,
      severity: violation.severity,
    }, compileTrace);
  }

  return {
    input: ir,
    conflicts,
    domainCollisions,
    hardRuleViolations,
    sectionalCandidates,
    unsupportedRequests,
    compileTrace,
  };
}
