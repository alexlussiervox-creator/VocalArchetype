import { EditableVoxToolsState } from "../state/editableState";
import { CompilerIR, IRNode, PipelineResult, SupportLevel } from "../../engine/contracts/packageTypes";
import { getCapabilityEntry } from "../../engine/contracts/capabilityMap";
import { runPackagedSunoPipeline } from "../../engine/pipeline/runPackagedSunoPipeline";

function defaultSupport(canonicalKey: string): SupportLevel {
  return getCapabilityEntry(canonicalKey)?.support ?? "direct";
}

function traitNode(
  id: string,
  canonicalKey: string,
  domain: IRNode["domain"],
  text: string,
  state: EditableVoxToolsState,
): IRNode {
  return {
    id,
    canonicalKey,
    semanticClass: "trait",
    domain,
    text,
    priority: state.priority,
    intensity: state.intensity,
    robustness: "medium",
    support: defaultSupport(canonicalKey),
  };
}

function hardRuleNode(id: string, canonicalKey: string, text: string): IRNode {
  return {
    id,
    canonicalKey,
    semanticClass: "hard_rule",
    domain: "sectional",
    text,
    priority: "dominant",
    intensity: 100,
    robustness: "high",
    support: "direct",
    target: { section: canonicalKey === "chorus_tighter_than_verse" ? "chorus" : "global" },
  };
}

function buildCompilerIR(state: EditableVoxToolsState): CompilerIR {
  const nodes: IRNode[] = [];

  if (state.genre) nodes.push(traitNode("genre-1", state.genre, "genre", state.genre, state));
  if (state.role) nodes.push(traitNode("role-1", state.role, "role", state.role, state));
  if (state.surface) nodes.push(traitNode("surface-1", state.surface, "surface", state.surface, state));
  if (state.core) nodes.push(traitNode("core-1", state.core, "core", state.core, state));
  if (state.delivery) nodes.push(traitNode("delivery-1", state.delivery, "delivery", state.delivery, state));
  if (state.motion) nodes.push(traitNode("motion-1", state.motion, "motion", state.motion, state));

  state.production.forEach((item, index) => {
    nodes.push(traitNode(`production-${index + 1}`, item, "production", item, state));
  });

  state.sections.forEach((directive, index) => {
    const key = directive.canonicalKey ?? directive.directive;
    nodes.push({
      id: `section-${index + 1}`,
      canonicalKey: key,
      semanticClass: "soft_constraint",
      domain: "sectional",
      text: directive.directive,
      priority: state.priority,
      intensity: state.intensity,
      robustness: "medium",
      support: defaultSupport(key),
      target: {
        section: directive.section,
        label: directive.label,
      },
    });
  });

  state.hardRules.forEach((rule, index) => {
    nodes.push(hardRuleNode(`hard-rule-${index + 1}`, rule.canonicalKey, rule.text));
  });

  if (state.multiVoiceRequest) {
    const patternKey =
      state.multiVoiceRequest.pattern === "alternated_sectional"
        ? "alternated_voices"
        : state.multiVoiceRequest.pattern;
    nodes.push({
      id: "multi-voice-1",
      canonicalKey: patternKey,
      semanticClass: "multi_voice",
      domain: "multiVoice",
      text: state.multiVoiceRequest.pattern,
      priority: "dominant",
      intensity: state.intensity,
      robustness: "medium",
      support: defaultSupport(patternKey),
    });
  }

  return {
    targetModel: "suno",
    nodes,
    multiVoice: state.multiVoiceRequest ?? null,
    notes: [`Archetypes: ${state.archetypes.join(", ")}`].filter(Boolean),
  };
}

export function compileFromSelections(state: EditableVoxToolsState): PipelineResult {
  const ir = buildCompilerIR(state);
  return runPackagedSunoPipeline(ir);
}
