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
const SECTIONS = new Set(["global", "intro", "verse", "preChorus", "chorus", "bridge", "outro", "custom"]);
const MULTIVOICE_PATTERNS = new Set(["lead_harmony", "lead_chorus_response", "alternated_sectional", "call_response", "simultaneous_duet"]);
const MULTIVOICE_MODES = new Set(["prompt_direct", "prompt_simplified", "split_generation"]);

function nonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Validate a single IR node against all constraints.
 */
function validateNode(node: IRNode, issues: VerificationIssue[]): void {
  // Validate required fields
  if (!nonEmpty(node.id)) {
    issues.push({ code: "NODE_ID_MISSING", message: "IR node id is required.", severity: "strong" });
  }
  if (!nonEmpty(node.canonicalKey)) {
    issues.push({ code: "CANONICAL_KEY_MISSING", message: `Node ${node.id || "<unknown>"} is missing canonicalKey.`, severity: "strong", nodeIds: [node.id].filter(Boolean) });
  }
  if (!nonEmpty(node.text)) {
    issues.push({ code: "TEXT_MISSING", message: `Node ${node.id} must have text.`, severity: "strong", nodeIds: [node.id] });
  }

  // Validate semantic classification
  if (!SEMANTIC_CLASSES.has(node.semanticClass)) {
    issues.push({ code: "INVALID_SEMANTIC_CLASS", message: `Node ${node.id} has invalid semanticClass: ${String(node.semanticClass)}.`, severity: "strong", nodeIds: [node.id] });
  }

  // Validate domain
  if (!DOMAINS.has(node.domain)) {
    issues.push({ code: "INVALID_DOMAIN", message: `Node ${node.id} has invalid domain: ${String(node.domain)}.`, severity: "strong", nodeIds: [node.id] });
  }

  // Validate priority
  if (!PRIORITIES.has(node.priority)) {
    issues.push({ code: "INVALID_PRIORITY", message: `Node ${node.id} has invalid priority: ${String(node.priority)}.`, severity: "strong", nodeIds: [node.id] });
  }

  // Validate robustness
  if (!ROBUSTNESS.has(node.robustness)) {
    issues.push({ code: "INVALID_ROBUSTNESS", message: `Node ${node.id} has invalid robustness: ${String(node.robustness)}.`, severity: "strong", nodeIds: [node.id] });
  }

  // Validate support level
  if (!SUPPORT.has(node.support)) {
    issues.push({ code: "INVALID_SUPPORT", message: `Node ${node.id} has invalid support: ${String(node.support)}.`, severity: "strong", nodeIds: [node.id] });
  }

  // Validate intensity range (0-100)
  if (typeof node.intensity !== "number" || Number.isNaN(node.intensity) || node.intensity < 0 || node.intensity > 100) {
    issues.push({ code: "INVALID_INTENSITY", message: `Node ${node.id} intensity must be between 0 and 100, got ${node.intensity}.`, severity: "strong", nodeIds: [node.id] });
  }

  // Validate section targeting for sectional nodes
  if (node.domain === "sectional" && !node.target) {
    issues.push({ code: "SECTION_TARGET_MISSING", message: `Sectional node ${node.id} must have a target section.`, severity: "strong", nodeIds: [node.id] });
  }

  // Validate section target if present
  if (node.target) {
    if (!SECTIONS.has(node.target.section)) {
      issues.push({ code: "INVALID_SECTION", message: `Node ${node.id} has invalid target section: ${node.target.section}.`, severity: "strong", nodeIds: [node.id] });
    }
  }

  // Validate semantic class constraints
  if (node.semanticClass === "hard_rule" && node.domain !== "sectional") {
    issues.push({ code: "HARD_RULE_DOMAIN_MISMATCH", message: `Hard rule ${node.id} should typically be in sectional domain.`, severity: "warning", nodeIds: [node.id] });
  }

  if (node.semanticClass === "render_hint" && node.domain === "sectional") {
    issues.push({ code: "RENDER_HINT_SECTION_CONFLICT", message: `Render hint ${node.id} should not be in sectional domain.`, severity: "warning", nodeIds: [node.id] });
  }
}

/**
 * Verify a CompilerIR for structural and semantic validity.
 * This is the first stage of the compilation pipeline.
 */
export function verifyCompilerIR(ir: CompilerIR): VerificationResult {
  const issues: VerificationIssue[] = [];

  // Validate target model
  if (ir.targetModel !== "suno") {
    issues.push({ code: "UNSUPPORTED_TARGET_MODEL", message: `Unsupported target model: ${String(ir.targetModel)}.`, severity: "strong" });
  }

  // Validate nodes array
  if (!Array.isArray(ir.nodes) || ir.nodes.length === 0) {
    issues.push({ code: "NODES_MISSING", message: "CompilerIR must contain at least one node.", severity: "strong" });
    return { ok: false, issues };
  }

  // Track seen IDs and canonical keys for duplicate detection
  const seenIds = new Set<string>();
  const seenCanonicalKeys = new Map<string, string[]>();

  // Validate each node
  for (const node of ir.nodes) {
    validateNode(node, issues);

    // Check for duplicate node IDs
    if (seenIds.has(node.id)) {
      issues.push({ code: "DUPLICATE_NODE_ID", message: `Duplicate node id: ${node.id}.`, severity: "strong", nodeIds: [node.id] });
    }
    seenIds.add(node.id);

    // Track canonical keys for duplicate detection (warning only)
    if (node.canonicalKey) {
      const existing = seenCanonicalKeys.get(node.canonicalKey) ?? [];
      if (existing.length > 0) {
        issues.push({ code: "DUPLICATE_CANONICAL_KEY", message: `Canonical key '${node.canonicalKey}' appears in multiple nodes: ${[...existing, node.id].join(", ")}.`, severity: "warning", nodeIds: [...existing, node.id] });
      }
      seenCanonicalKeys.set(node.canonicalKey, [...existing, node.id]);
    }
  }

  // Validate multi-voice configuration if present
  if (ir.multiVoice) {
    if (!MULTIVOICE_PATTERNS.has(ir.multiVoice.pattern)) {
      issues.push({ code: "INVALID_MULTIVOICE_PATTERN", message: `Invalid multi-voice pattern: ${ir.multiVoice.pattern}.`, severity: "strong" });
    }

    if (ir.multiVoice.mode) {
      if (!MULTIVOICE_MODES.has(ir.multiVoice.mode)) {
        issues.push({ code: "INVALID_MULTIVOICE_MODE", message: `Invalid multi-voice mode: ${ir.multiVoice.mode}.`, severity: "strong" });
      }
    }
  }

  return { ok: !issues.some((i) => i.severity === "strong"), issues };
}
