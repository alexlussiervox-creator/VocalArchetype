import {
  CapabilityMapEntry,
  CompileTraceEntry,
  ConflictMatch,
  ConstraintEngineResult,
  IRNode,
  ResolvedIR,
  ResolverWarning,
  SupportLevel,
} from "../contracts/packageTypes";
import { getCapabilityEntry } from "../contracts/capabilityMap";

const PRIORITY_WEIGHT: Record<IRNode["priority"], number> = {
  dominant: 4,
  blended: 3,
  subtle: 2,
};

const ROBUSTNESS_WEIGHT: Record<IRNode["robustness"], number> = {
  high: 4,
  medium: 3,
  low: 2,
};

const SUPPORT_WEIGHT: Record<SupportLevel, number> = {
  direct: 4,
  approximate: 3,
  unsupported: 2,
  rejected: 1,
};

const DOMAIN_LIMITS: Partial<Record<IRNode["domain"], number>> = {
  genre: 1,
  role: 1,
  surface: 1,
  core: 1,
  delivery: 1,
  motion: 1,
  production: 2,
};

function compareNodes(a: IRNode, b: IRNode): number {
  const byPriority = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
  if (byPriority !== 0) return byPriority;

  const byRobustness = ROBUSTNESS_WEIGHT[b.robustness] - ROBUSTNESS_WEIGHT[a.robustness];
  if (byRobustness !== 0) return byRobustness;

  const bySupport = SUPPORT_WEIGHT[b.support] - SUPPORT_WEIGHT[a.support];
  if (bySupport !== 0) return bySupport;

  return b.intensity - a.intensity;
}

function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}

function pushTrace(trace: CompileTraceEntry[], entry: CompileTraceEntry): void {
  trace.push(entry);
}

function pushWarning(warnings: ResolverWarning[], warning: ResolverWarning): void {
  warnings.push(warning);
}

function buildCapabilityMap(nodes: IRNode[]): CapabilityMapEntry[] {
  return dedupeById(
    nodes.map((node) => ({
      id: node.canonicalKey,
      canonicalKey: node.canonicalKey,
      support: getCapabilityEntry(node.canonicalKey)?.support ?? node.support,
      reason: getCapabilityEntry(node.canonicalKey)?.reason,
    })),
  ).map(({ id: _id, ...rest }) => rest);
}

function chooseWinner(left: IRNode, right: IRNode): { keep: IRNode; drop: IRNode } {
  const ordered = [left, right].sort(compareNodes);
  return { keep: ordered[0], drop: ordered[1] };
}

function getNodeMap(nodes: IRNode[]): Map<string, IRNode> {
  return new Map(nodes.map((node) => [node.id, node]));
}

function resolveConflict(
  match: ConflictMatch,
  state: {
    globalNodeMap: Map<string, IRNode>;
    sectionalNodeMap: Map<string, IRNode>;
    removedNodeMap: Map<string, IRNode>;
    warnings: ResolverWarning[];
    trace: CompileTraceEntry[];
  },
): void {
  const left = state.globalNodeMap.get(match.leftNodeId);
  const right = state.globalNodeMap.get(match.rightNodeId);
  if (!left || !right) return;

  switch (match.strategy) {
    case "allow": {
      pushTrace(state.trace, {
        step: "resolve",
        code: "CONFLICT_ALLOWED",
        message: match.message,
        nodeIds: [left.id, right.id],
        severity: match.severity,
      });
      break;
    }

    case "compress": {
      left.tags = [...new Set([...(left.tags ?? []), "compress_candidate"])] ;
      right.tags = [...new Set([...(right.tags ?? []), "compress_candidate"])] ;
      pushWarning(state.warnings, {
        code: "CONFLICT_COMPRESSED",
        message: `${match.message} The pair will be compressed during packaging rather than emitted literally.`,
        severity: match.severity,
        strategy: "compress",
        nodeIds: [left.id, right.id],
      });
      pushTrace(state.trace, {
        step: "resolve",
        code: "CONFLICT_COMPRESSED",
        message: `Marked ${left.canonicalKey} and ${right.canonicalKey} for compression.`,
        nodeIds: [left.id, right.id],
        severity: match.severity,
      });
      break;
    }

    case "prioritize": {
      const { keep, drop } = chooseWinner(left, right);
      state.globalNodeMap.delete(drop.id);
      state.removedNodeMap.set(drop.id, drop);
      pushWarning(state.warnings, {
        code: "CONFLICT_PRIORITIZED",
        message: `${match.message} Kept \"${keep.canonicalKey}\" over \"${drop.canonicalKey}\" using priority > robustness > support > intensity.`,
        severity: match.severity,
        strategy: "prioritize",
        nodeIds: [keep.id, drop.id],
      });
      pushTrace(state.trace, {
        step: "resolve",
        code: "CONFLICT_PRIORITIZED",
        message: `Removed ${drop.canonicalKey}, kept ${keep.canonicalKey}.`,
        nodeIds: [keep.id, drop.id],
        severity: match.severity,
      });
      break;
    }

    case "refuse": {
      for (const node of [left, right]) {
        state.globalNodeMap.delete(node.id);
        state.removedNodeMap.set(node.id, node);
      }
      pushWarning(state.warnings, {
        code: "CONFLICT_REFUSED",
        message: `${match.message} Request exceeds truthful backend controllability.`,
        severity: "strong",
        strategy: "refuse",
        nodeIds: [left.id, right.id],
      });
      pushTrace(state.trace, {
        step: "resolve",
        code: "CONFLICT_REFUSED",
        message: `Removed ${left.canonicalKey} and ${right.canonicalKey} as refused combination.`,
        nodeIds: [left.id, right.id],
        severity: "strong",
      });
      break;
    }

    case "sectionalize": {
      for (const node of [left, right]) {
        state.globalNodeMap.delete(node.id);
        const moved = {
          ...node,
          domain: "sectional" as const,
          target: node.target ?? { section: "chorus" as const },
        };
        state.sectionalNodeMap.set(moved.id, moved);
      }
      pushWarning(state.warnings, {
        code: "CONFLICT_SECTIONALIZED",
        message: `${match.message} Moved conflicting directives to sectional control.`,
        severity: match.severity,
        strategy: "sectionalize",
        nodeIds: [left.id, right.id],
      });
      pushTrace(state.trace, {
        step: "resolve",
        code: "CONFLICT_SECTIONALIZED",
        message: `Moved ${left.canonicalKey} and ${right.canonicalKey} to sectional rendering.`,
        nodeIds: [left.id, right.id],
        severity: match.severity,
      });
      break;
    }

    default: {
      const neverStrategy: never = match.strategy;
      throw new Error(`Unhandled strategy ${neverStrategy}`);
    }
  }
}

export function resolveCompilerIR(constraints: ConstraintEngineResult): ResolvedIR {
  const ir = constraints.input;
  const warnings: ResolverWarning[] = [];
  const compileTrace: CompileTraceEntry[] = [...constraints.compileTrace];

  const globalNodeMap = getNodeMap(ir.nodes.filter((node) => node.domain !== "sectional" && !node.target));
  const sectionalNodeMap = getNodeMap(ir.nodes.filter((node) => node.domain === "sectional" || !!node.target));
  const removedNodeMap = new Map<string, IRNode>();

  pushTrace(compileTrace, {
    step: "resolve",
    code: "RESOLVER_START",
    message: `Resolver started with ${globalNodeMap.size} global nodes and ${sectionalNodeMap.size} sectional nodes.`,
  });

  for (const violation of constraints.unsupportedRequests) {
    if (!violation.nodeIds?.length) continue;
    for (const nodeId of violation.nodeIds) {
      const node = globalNodeMap.get(nodeId);
      if (!node) continue;

      if (violation.suggestedStrategy === "refuse") {
        globalNodeMap.delete(nodeId);
        removedNodeMap.set(nodeId, node);
      } else if (violation.suggestedStrategy === "compress") {
        node.tags = [...new Set([...(node.tags ?? []), "compress_candidate"])];
      }
    }

    pushWarning(warnings, {
      code: violation.code,
      message: violation.message,
      severity: violation.severity,
      strategy: violation.suggestedStrategy,
      nodeIds: violation.nodeIds,
    });

    pushTrace(compileTrace, {
      step: "resolve",
      code: violation.code,
      message: violation.message,
      nodeIds: violation.nodeIds,
      severity: violation.severity,
    });
  }

  for (const violation of constraints.sectionalCandidates) {
    for (const nodeId of violation.nodeIds ?? []) {
      const node = globalNodeMap.get(nodeId);
      if (!node) continue;
      globalNodeMap.delete(nodeId);
      sectionalNodeMap.set(nodeId, {
        ...node,
        domain: "sectional",
        target: node.target ?? { section: "chorus" },
      });
    }
    pushWarning(warnings, {
      code: violation.code,
      message: violation.message,
      severity: violation.severity,
      strategy: violation.suggestedStrategy,
      nodeIds: violation.nodeIds,
    });
    pushTrace(compileTrace, {
      step: "resolve",
      code: violation.code,
      message: violation.message,
      nodeIds: violation.nodeIds,
      severity: violation.severity,
    });
  }

  for (const conflict of constraints.conflicts) {
    resolveConflict(conflict, {
      globalNodeMap,
      sectionalNodeMap,
      removedNodeMap,
      warnings,
      trace: compileTrace,
    });
  }

  for (const violation of constraints.hardRuleViolations) {
    pushWarning(warnings, {
      code: violation.code,
      message: violation.message,
      severity: violation.severity,
      strategy: violation.suggestedStrategy,
      nodeIds: violation.nodeIds,
    });
    pushTrace(compileTrace, {
      step: "resolve",
      code: violation.code,
      message: violation.message,
      nodeIds: violation.nodeIds,
      severity: violation.severity,
    });
  }

  for (const violation of constraints.domainCollisions) {
    const nodes = (violation.nodeIds ?? []).map((id) => globalNodeMap.get(id)).filter(Boolean) as IRNode[];
    if (nodes.length === 0) continue;
    const domain = nodes[0].domain;
    const limit = DOMAIN_LIMITS[domain] ?? nodes.length;
    const sorted = [...nodes].sort(compareNodes);
    const dropped = sorted.slice(limit);

    for (const node of dropped) {
      globalNodeMap.delete(node.id);
      removedNodeMap.set(node.id, node);
    }

    if (dropped.length > 0) {
      const message = `Domain \"${domain}\" trimmed to limit ${limit} using priority > robustness > support > intensity.`;
      pushWarning(warnings, {
        code: "DOMAIN_LIMIT_APPLIED",
        message,
        severity: "warning",
        strategy: "prioritize",
        nodeIds: dropped.map((node) => node.id),
      });
      pushTrace(compileTrace, {
        step: "resolve",
        code: "DOMAIN_LIMIT_APPLIED",
        message,
        nodeIds: dropped.map((node) => node.id),
        severity: "warning",
      });
    }
  }

  if (ir.multiVoice) {
    const pattern = ir.multiVoice.pattern;
    const multiVoiceMessageByPattern: Record<string, { code: string; severity: "info" | "warning" | "strong"; strategy: "allow" | "compress" | "refuse" }> = {
      lead_harmony: { code: "MULTIVOICE_DIRECT_OK", severity: "info", strategy: "allow" },
      lead_chorus_response: { code: "MULTIVOICE_SIMPLIFY_PREFERRED", severity: "warning", strategy: "compress" },
      alternated_sectional: { code: "MULTIVOICE_SIMPLIFY_REQUIRED", severity: "warning", strategy: "compress" },
      call_response: { code: "MULTIVOICE_SPLIT_CONSIDER", severity: "warning", strategy: "compress" },
      simultaneous_duet: { code: "MULTIVOICE_SPLIT_REQUIRED", severity: "strong", strategy: "refuse" },
    };
    const policy = multiVoiceMessageByPattern[pattern];
    const messageByCode: Record<string, string> = {
      MULTIVOICE_DIRECT_OK: "Lead + harmonies can be attempted directly.",
      MULTIVOICE_SIMPLIFY_PREFERRED: "Lead + chorus response should be simplified when possible.",
      MULTIVOICE_SIMPLIFY_REQUIRED: "Alternated sectional voices require coarse-boundary simplification.",
      MULTIVOICE_SPLIT_CONSIDER: "Call-response is fragile and may need split-generation recommendation.",
      MULTIVOICE_SPLIT_REQUIRED: "Simultaneous duet should default to split-generation recommendation.",
    };
    pushWarning(warnings, {
      code: policy.code,
      message: messageByCode[policy.code],
      severity: policy.severity,
      strategy: policy.strategy,
    });
    pushTrace(compileTrace, {
      step: "resolve",
      code: policy.code,
      message: messageByCode[policy.code],
      severity: policy.severity,
    });
  }

  // Guarantee that no unresolved explicit conflict survives with both nodes still global.
  for (const conflict of constraints.conflicts) {
    if (globalNodeMap.has(conflict.leftNodeId) && globalNodeMap.has(conflict.rightNodeId)) {
      if (conflict.strategy === "allow" || conflict.strategy === "compress") {
        continue;
      }
      throw new Error(`Unresolved conflict survived resolver: ${conflict.leftNodeId} / ${conflict.rightNodeId}`);
    }
  }

  return {
    targetModel: ir.targetModel,
    locale: ir.locale,
    globalNodes: [...globalNodeMap.values()].sort(compareNodes),
    sectionalNodes: [...sectionalNodeMap.values()].sort(compareNodes),
    removedNodes: [...removedNodeMap.values()].sort(compareNodes),
    warnings,
    capabilityMap: buildCapabilityMap(ir.nodes),
    compileTrace,
    multiVoice: ir.multiVoice ?? null,
    notes: ir.notes ?? [],
  };
}
