import { CompilerIR, IRNode, VerificationIssue, VerificationResult } from "../contracts/packageTypes";

const PRIORITIES = new Set(["dominant", "blended", "subtle"]);
const SEMANTIC_CLASSES = new Set([
  "trait",
  "preference",
  "hard_rule",
  "soft_constraint",
  "render_hint",
  "multi_voice",
]);
const DOMAINS = new Set([
  "genre",
  "role",
  "surface",
  "core",
  "delivery",
  "motion",
  "production",
  "sectional",
  "multiVoice",
]);
const ROBUSTNESS = new Set(["low", "medium", "high"]);
const SUPPORT = new Set(["direct", "approximate", "unsupported", "rejected"]);

function nonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateNode(node: IRNode, issues: VerificationIssue[]): void {
  if (!nonEmpty(node.id)) {
    issues.push({ code: "NODE_ID_MISSING", message: "IR node id is required.", severity: "strong" });
  }
  if (!nonEmpty(node.canonicalKey)) {
    issues.push({ code: "CANONICAL_KEY_MISSING", message: `Node ${node.id || "<unknown>"} is missing canonicalKey.`, severity: "strong", nodeIds: [node.id].filter(Boolean) });
  }
  if (!SEMANTIC_CLASSES.has(node.semanticClass)) {
    issues.push({ code: "INVALID_SEMANTIC_CLASS", message: `Node ${node.id} has invalid semanticClass.`, severity: "strong", nodeIds: [node.id] });
  }
  if (!DOMAINS.has(node.domain)) {
    issues.push({ code: "INVALID_DOMAIN", message: `Node ${node.id} has invalid domain.`, severity: "strong", nodeIds: [node.id] });
  }
  if (!nonEmpty(node.text)) {
    issues.push({ code: "TEXT_MISSING", message: `Node ${node.id} must have text.`, severity: "strong", nodeIds: [node.id] });
  }
  if (!PRIORITIES.has(node.priority)) {
    issues.push({ code: "INVALID_PRIORITY", message: `Node ${node.id} has invalid priority.`, severity: "strong", nodeIds: [node.id] });
  }
  if (!ROBUSTNESS.has(node.robustness)) {
    issues.push({ code: "INVALID_ROBUSTNESS", message: `Node ${node.id} has invalid robustness.`, severity: "strong", nodeIds: [node.id] });
  }
  if (!SUPPORT.has(node.support)) {
    issues.push({ code: "INVALID_SUPPORT", message: `Node ${node.id} has invalid support.`, severity: "strong", nodeIds: [node.id] });
  }
  if (typeof node.intensity !== "number" || Number.isNaN(node.intensity) || node.intensity < 0 || node.intensity > 100) {
    issues.push({ code: "INVALID_INTENSITY", message: `Node ${node.id} intensity must be between 0 and 100.`, severity: "strong", nodeIds: [node.id] });
  }
  if (node.domain === "sectional" && !node.target) {
    issues.push({ code: "SECTION_TARGET_MISSING", message: `Sectional node ${node.id} must have a target section.`, severity: "strong", nodeIds: [node.id] });
  }
}

export function verifyCompilerIR(ir: CompilerIR): VerificationResult {
  const issues: VerificationIssue[] = [];
  if (ir.targetModel !== "suno") {
    issues.push({ code: "UNSUPPORTED_TARGET_MODEL", message: `Unsupported target model: ${String(ir.targetModel)}.`, severity: "strong" });
  }
  if (!Array.isArray(ir.nodes) || ir.nodes.length === 0) {
    issues.push({ code: "NODES_MISSING", message: "CompilerIR must contain at least one node.", severity: "strong" });
    return { ok: false, issues };
  }
  const seen = new Set<string>();
  for (const node of ir.nodes) {
    validateNode(node, issues);
    if (seen.has(node.id)) {
      issues.push({ code: "DUPLICATE_NODE_ID", message: `Duplicate node id: ${node.id}.`, severity: "strong", nodeIds: [node.id] });
    }
    seen.add(node.id);
  }
  return { ok: !issues.some((i) => i.severity === "strong"), issues };
}
