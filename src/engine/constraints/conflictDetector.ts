/**
 * Conflict Detector for VocalArchetype Constraint Engine
 *
 * This module detects conflicts between vocal traits in a CompilerIR
 * and provides information about resolution strategies.
 */

import { CompilerIR, IRNode } from "../contracts/packageTypes";
import { ConflictRule, findConflictBetween, CONFLICT_RULES } from "./conflictRulesCanonical";

/**
 * A detected conflict between two nodes
 */
export interface DetectedConflict {
  /** The conflict rule that was triggered */
  rule: ConflictRule;
  /** First node involved in the conflict */
  node1: IRNode;
  /** Second node involved in the conflict */
  node2: IRNode;
  /** Canonical keys of the conflicting traits */
  traitKeys: [string, string];
}

/**
 * Conflict detection result
 */
export interface ConflictDetectionResult {
  /** Whether any conflicts were detected */
  hasConflicts: boolean;
  /** List of detected conflicts */
  conflicts: DetectedConflict[];
  /** Nodes involved in conflicts */
  conflictingNodes: Set<string>;
  /** Summary statistics */
  stats: {
    totalConflicts: number;
    directConflicts: number;
    productiveTensions: number;
    contextDependentConflicts: number;
    strongSeverity: number;
    warningSeverity: number;
    infoSeverity: number;
  };
}

/**
 * Detect conflicts in a CompilerIR
 */
export function detectConflicts(ir: CompilerIR): ConflictDetectionResult {
  const conflicts: DetectedConflict[] = [];
  const conflictingNodes = new Set<string>();

  // Check all pairs of nodes for conflicts
  for (let i = 0; i < ir.nodes.length; i++) {
    for (let j = i + 1; j < ir.nodes.length; j++) {
      const node1 = ir.nodes[i];
      const node2 = ir.nodes[j];

      // Look for a conflict rule between these traits
      const rule = findConflictBetween(node1.canonicalKey, node2.canonicalKey);

      if (rule) {
        conflicts.push({
          rule,
          node1,
          node2,
          traitKeys: [node1.canonicalKey, node2.canonicalKey],
        });

        conflictingNodes.add(node1.id);
        conflictingNodes.add(node2.id);
      }
    }
  }

  // Calculate statistics
  const stats = {
    totalConflicts: conflicts.length,
    directConflicts: conflicts.filter((c) => c.rule.relation === "direct_conflict").length,
    productiveTensions: conflicts.filter((c) => c.rule.relation === "tension_productive").length,
    contextDependentConflicts: conflicts.filter((c) => c.rule.relation === "context_dependent").length,
    strongSeverity: conflicts.filter((c) => c.rule.severity === "strong").length,
    warningSeverity: conflicts.filter((c) => c.rule.severity === "warning").length,
    infoSeverity: conflicts.filter((c) => c.rule.severity === "info").length,
  };

  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
    conflictingNodes,
    stats,
  };
}

/**
 * Check if a specific conflict exists
 */
export function hasConflict(ir: CompilerIR, trait1: string, trait2: string): boolean {
  const result = detectConflicts(ir);
  return result.conflicts.some(
    (c) => (c.traitKeys[0] === trait1 && c.traitKeys[1] === trait2) || (c.traitKeys[0] === trait2 && c.traitKeys[1] === trait1)
  );
}

/**
 * Get conflicts for a specific node
 */
export function getNodeConflicts(ir: CompilerIR, nodeId: string): DetectedConflict[] {
  const result = detectConflicts(ir);
  return result.conflicts.filter((c) => c.node1.id === nodeId || c.node2.id === nodeId);
}

/**
 * Get conflicts by severity
 */
export function getConflictsBySeverity(ir: CompilerIR, severity: "strong" | "warning" | "info"): DetectedConflict[] {
  const result = detectConflicts(ir);
  return result.conflicts.filter((c) => c.rule.severity === severity);
}

/**
 * Get conflicts by strategy
 */
export function getConflictsByStrategy(
  ir: CompilerIR,
  strategy: "allow" | "compress" | "prioritize" | "refuse" | "sectionalize"
): DetectedConflict[] {
  const result = detectConflicts(ir);
  return result.conflicts.filter((c) => c.rule.strategy === strategy);
}

/**
 * Check if there are any strong (hard error) conflicts
 */
export function hasStrongConflicts(ir: CompilerIR): boolean {
  const result = detectConflicts(ir);
  return result.stats.strongSeverity > 0;
}

/**
 * Generate a human-readable conflict report
 */
export function generateConflictReport(ir: CompilerIR): string {
  const result = detectConflicts(ir);

  if (!result.hasConflicts) {
    return "No conflicts detected.";
  }

  let report = `Conflict Detection Report\n`;
  report += `========================\n\n`;
  report += `Total Conflicts: ${result.stats.totalConflicts}\n`;
  report += `  - Direct Conflicts: ${result.stats.directConflicts}\n`;
  report += `  - Productive Tensions: ${result.stats.productiveTensions}\n`;
  report += `  - Context-Dependent: ${result.stats.contextDependentConflicts}\n\n`;

  report += `By Severity:\n`;
  report += `  - Strong: ${result.stats.strongSeverity}\n`;
  report += `  - Warning: ${result.stats.warningSeverity}\n`;
  report += `  - Info: ${result.stats.infoSeverity}\n\n`;

  report += `Conflicts:\n`;
  report += `----------\n`;

  for (const conflict of result.conflicts) {
    report += `\n[${conflict.rule.severity.toUpperCase()}] ${conflict.rule.message}\n`;
    report += `  Rule: ${conflict.rule.id}\n`;
    report += `  Traits: ${conflict.node1.canonicalKey} <-> ${conflict.node2.canonicalKey}\n`;
    report += `  Strategy: ${conflict.rule.strategy}\n`;
    report += `  Explanation: ${conflict.rule.explanation}\n`;
  }

  return report;
}
