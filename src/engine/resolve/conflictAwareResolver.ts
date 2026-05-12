/**
 * Conflict-Aware Resolver for VocalArchetype
 *
 * This module integrates the canonical conflict rules with the resolution engine.
 * It detects conflicts using the conflict detector and applies resolution strategies.
 */

import { CompilerIR, IRNode, ResolvedIR, CompileTraceEntry, ResolverWarning } from "../contracts/packageTypes";
import { detectConflicts, DetectedConflict } from "../constraints/conflictDetector";

/**
 * Resolution context for tracking state during conflict resolution
 */
export interface ResolutionContext {
  /** Global nodes (not yet assigned to sections) */
  globalNodes: IRNode[];
  /** Sectional nodes (assigned to specific sections) */
  sectionalNodes: IRNode[];
  /** Removed nodes (due to conflicts or unsupported) */
  removedNodes: IRNode[];
  /** Resolution trace for debugging */
  trace: CompileTraceEntry[];
  /** Warnings generated during resolution */
  warnings: ResolverWarning[];
}

/**
 * Resolve conflicts in a CompilerIR using canonical conflict rules
 */
export function resolveConflictsCanonical(ir: CompilerIR): ResolvedIR {
  // Detect all conflicts
  const conflictResult = detectConflicts(ir);

  // Initialize resolution context
  const context: ResolutionContext = {
    globalNodes: [...ir.nodes],
    sectionalNodes: [],
    removedNodes: [],
    trace: [],
    warnings: [],
  };

  // Add initial trace
  context.trace.push({
    step: "resolve",
    code: "CONFLICT_DETECTION_START",
    message: `Detected ${conflictResult.stats.totalConflicts} conflicts`,
  });

  // Process conflicts by severity (strong first, then warning, then info)
  const strongConflicts = conflictResult.conflicts.filter((c) => c.rule.severity === "strong");
  const warningConflicts = conflictResult.conflicts.filter((c) => c.rule.severity === "warning");
  const infoConflicts = conflictResult.conflicts.filter((c) => c.rule.severity === "info");

  for (const conflict of [...strongConflicts, ...warningConflicts, ...infoConflicts]) {
    resolveConflict(conflict, context);
  }

  // Add final trace
  context.trace.push({
    step: "resolve",
    code: "CONFLICT_RESOLUTION_COMPLETE",
    message: `Resolution complete: ${context.globalNodes.length} global, ${context.sectionalNodes.length} sectional, ${context.removedNodes.length} removed`,
  });

  // Build ResolvedIR
  return {
    targetModel: ir.targetModel,
    globalNodes: context.globalNodes,
    sectionalNodes: context.sectionalNodes,
    removedNodes: context.removedNodes,
    capabilityMap: [],
    compileTrace: context.trace,
    warnings: context.warnings,
  };
}

/**
 * Resolve a single conflict
 */
function resolveConflict(conflict: DetectedConflict, context: ResolutionContext): void {
  const { rule, node1, node2 } = conflict;

  context.trace.push({
    step: "resolve",
    code: `CONFLICT_${rule.strategy.toUpperCase()}`,
    message: `Resolving ${rule.id}: ${rule.message}`,
    nodeIds: [node1.id, node2.id],
  });

  switch (rule.strategy) {
    case "allow":
      // Both traits are allowed to coexist
    context.warnings.push({
      code: rule.id,
      severity: rule.severity,
      message: `${rule.message} Both traits will be included.`,
      strategy: "allow",
      nodeIds: [node1.id, node2.id],
    });
      break;

    case "compress":
      // Mark both nodes for compression during packaging
      markForCompression(node1, context);
      markForCompression(node2, context);
      context.warnings.push({
        code: rule.id,
        severity: "warning",
        message: `${rule.message} Both traits will be compressed during packaging.`,
        strategy: "compress",
        nodeIds: [node1.id, node2.id],
      });
      break;

    case "prioritize":
      // Keep the higher-priority node, remove the other
      const { winner, loser } = choosePriority(node1, node2);
      removeNode(loser, context);
      context.warnings.push({
        code: rule.id,
        severity: rule.severity,
        message: `${rule.message} Kept "${winner.canonicalKey}" over "${loser.canonicalKey}".`,
        strategy: "prioritize",
        nodeIds: [winner.id, loser.id],
      });
      break;

    case "refuse":
      // Remove both nodes - the combination is not allowed
      removeNode(node1, context);
      removeNode(node2, context);
      context.warnings.push({
        code: rule.id,
        severity: "strong",
        message: `${rule.message} Both traits have been removed as the combination is not supported.`,
        strategy: "refuse",
        nodeIds: [node1.id, node2.id],
      });
      break;

    case "sectionalize":
      // Move both nodes to sectional rendering
      sectionalize(node1, context);
      sectionalize(node2, context);
      context.warnings.push({
        code: rule.id,
        severity: rule.severity,
        message: `${rule.message} Both traits moved to sectional rendering.`,
        strategy: "sectionalize",
        nodeIds: [node1.id, node2.id],
      });
      break;
  }
}

/**
 * Choose which node has higher priority
 */
function choosePriority(node1: IRNode, node2: IRNode): { winner: IRNode; loser: IRNode } {
  const priorityOrder = { dominant: 3, blended: 2, subtle: 1 };
  const robustnessOrder = { high: 3, medium: 2, low: 1 };
  const supportOrder = { direct: 4, approximate: 3, unsupported: 2, rejected: 1 };

  // Compare by priority
  const p1 = priorityOrder[node1.priority];
  const p2 = priorityOrder[node2.priority];
  if (p1 !== p2) {
    return p1 > p2 ? { winner: node1, loser: node2 } : { winner: node2, loser: node1 };
  }

  // Compare by robustness
  const r1 = robustnessOrder[node1.robustness];
  const r2 = robustnessOrder[node2.robustness];
  if (r1 !== r2) {
    return r1 > r2 ? { winner: node1, loser: node2 } : { winner: node2, loser: node1 };
  }

  // Compare by support
  const s1 = supportOrder[node1.support];
  const s2 = supportOrder[node2.support];
  if (s1 !== s2) {
    return s1 > s2 ? { winner: node1, loser: node2 } : { winner: node2, loser: node1 };
  }

  // Compare by intensity
  if (node1.intensity !== node2.intensity) {
    return node1.intensity > node2.intensity ? { winner: node1, loser: node2 } : { winner: node2, loser: node1 };
  }

  // Default: keep node1
  return { winner: node1, loser: node2 };
}

/**
 * Mark a node for compression
 */
function markForCompression(node: IRNode, context: ResolutionContext): void {
  const idx = context.globalNodes.findIndex((n) => n.id === node.id);
  if (idx >= 0) {
    context.globalNodes[idx] = {
      ...context.globalNodes[idx],
      tags: [...new Set([...(context.globalNodes[idx].tags ?? []), "compress_candidate"])],
    };
  }
}

/**
 * Remove a node from global nodes and add to removed nodes
 */
function removeNode(node: IRNode, context: ResolutionContext): void {
  const idx = context.globalNodes.findIndex((n) => n.id === node.id);
  if (idx >= 0) {
    const removed = context.globalNodes.splice(idx, 1)[0];
    context.removedNodes.push(removed);

    context.trace.push({
      step: "resolve",
      code: "NODE_REMOVED",
      message: `Removed node ${removed.canonicalKey}`,
      nodeIds: [removed.id],
    });
  }
}

/**
 * Move a node to sectional rendering
 */
function sectionalize(node: IRNode, context: ResolutionContext): void {
  const idx = context.globalNodes.findIndex((n) => n.id === node.id);
  if (idx >= 0) {
    const removed = context.globalNodes.splice(idx, 1)[0];
    const sectional = {
      ...removed,
      domain: "sectional" as const,
      target: removed.target ?? { section: "chorus" as const },
    };
    context.sectionalNodes.push(sectional);

    context.trace.push({
      step: "resolve",
      code: "NODE_SECTIONALIZED",
      message: `Moved node ${sectional.canonicalKey} to sectional rendering`,
      nodeIds: [sectional.id],
    });
  }
}

/**
 * Generate a human-readable resolution report
 */
export function generateResolutionReport(resolved: ResolvedIR): string {
  let report = `Resolution Report\n`;
  report += `=================\n\n`;

  report += `Results:\n`;
  report += `  Global Nodes: ${resolved.globalNodes.length}\n`;
  report += `  Sectional Nodes: ${resolved.sectionalNodes.length}\n`;
  report += `  Removed Nodes: ${resolved.removedNodes.length}\n\n`;

  if (resolved.warnings.length > 0) {
    report += `Warnings (${resolved.warnings.length}):\n`;
    for (const warning of resolved.warnings) {
      report += `  [${warning.severity.toUpperCase()}] ${warning.message}\n`;
    }
    report += `\n`;
  }

  if (resolved.compileTrace.length > 0) {
    report += `Trace:\n`;
    for (const entry of resolved.compileTrace) {
      report += `  ${entry.step}: ${entry.code} - ${entry.message}\n`;
    }
  }

  return report;
}
