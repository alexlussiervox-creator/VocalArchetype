import { ResolvedIR, SectionName, SectionedPromptPayload, SunoPackage } from "../contracts/packageTypes";
import { compressPrompt } from "./compressPrompt";

const STYLE_ORDER = ["genre", "role", "surface", "core", "delivery", "motion", "production"] as const;
const SECTION_ORDER: Record<SectionName, number> = {
  global: 0,
  intro: 1,
  verse: 2,
  preChorus: 3,
  chorus: 4,
  bridge: 5,
  outro: 6,
  custom: 7,
};

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function renderStrictPrompt(resolved: ResolvedIR): string {
  const ordered: string[] = [];
  for (const domain of STYLE_ORDER) {
    ordered.push(...resolved.globalNodes.filter((node) => node.domain === domain).map((node) => node.text));
  }
  return unique(ordered).join(", ");
}

function renderSectionedPayload(resolved: ResolvedIR): SectionedPromptPayload {
  const sectionMap = new Map<string, { section: SectionName; label?: string; directives: string[] }>();

  for (const node of resolved.sectionalNodes) {
    const section = node.target?.section ?? "custom";
    const label = node.target?.label;
    const key = `${section}::${label ?? ""}`;
    const current = sectionMap.get(key) ?? { section, label, directives: [] };
    current.directives.push(node.text);
    sectionMap.set(key, current);
  }

  const sections = [...sectionMap.values()]
    .map((entry) => ({
      section: entry.section,
      label: entry.label,
      directives: unique(entry.directives),
    }))
    .sort((a, b) => {
      const orderDelta = SECTION_ORDER[a.section] - SECTION_ORDER[b.section];
      if (orderDelta !== 0) return orderDelta;
      return (a.label ?? "").localeCompare(b.label ?? "");
    });

  return {
    globalDirectives: unique([renderStrictPrompt(resolved), compressPrompt(resolved.globalNodes)].filter(Boolean) as string[]),
    sections,
  };
}

function renderFallbackPrompt(resolved: ResolvedIR): string {
  const direct = resolved.globalNodes.filter((node) => node.support === "direct");
  const narrowed = direct.filter((node) => ["genre", "role", "delivery", "motion"].includes(node.domain));
  return compressPrompt(narrowed.length > 0 ? narrowed : direct);
}

function buildMultiVoiceNotes(resolved: ResolvedIR): string[] {
  if (!resolved.multiVoice) return [];

  switch (resolved.multiVoice.pattern) {
    case "lead_harmony":
      return ["Multi-voice policy: direct prompt acceptable for lead + harmonies."];
    case "lead_chorus_response":
      return ["Multi-voice policy: direct possible, but simplified packaging is preferred when response behavior matters."];
    case "alternated_sectional":
      return ["Multi-voice policy: alternated sectional voices should remain coarse-boundary and simplified."];
    case "call_response":
      return ["Multi-voice policy: call-response is fragile and may need split-generation recommendation."];
    case "simultaneous_duet":
      return ["Multi-voice policy: simultaneous duet defaults to split-generation recommendation."];
    default:
      return [];
  }
}

export function packageSuno(resolved: ResolvedIR): SunoPackage {
  const strict_prompt = renderStrictPrompt(resolved);
  const compressed_prompt = compressPrompt(resolved.globalNodes);
  const fallback_prompt = renderFallbackPrompt(resolved);
  const sectioned_prompt_payload = renderSectionedPayload(resolved);
  const notes = [...(resolved.notes ?? []), ...buildMultiVoiceNotes(resolved)];

  const compileTrace = [
    ...resolved.compileTrace,
    {
      step: "package" as const,
      code: "SUNO_PACKAGE_CREATED",
      message: "Created strict, compressed, fallback, and sectioned Suno outputs.",
    },
  ];

  return {
    strict_prompt,
    compressed_prompt,
    fallback_prompt,
    sectioned_prompt_payload,
    compile_summary: {
      targetModel: resolved.targetModel,
      globalNodeCount: resolved.globalNodes.length,
      sectionalNodeCount: resolved.sectionalNodes.length,
      removedNodeCount: resolved.removedNodes.length,
      warningCount: resolved.warnings.length,
      usedFallback: fallback_prompt.length > 0 && fallback_prompt !== strict_prompt,
      notes,
    },
    warnings: resolved.warnings,
    compileTrace,
  };
}
