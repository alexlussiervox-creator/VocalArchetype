// src/engine/compile/suno/packageSuno.ts

import type {
  CompileSummary,
  PackagedCompilerOutput,
  ResolvedCompilerIR,
  SectionedPromptPayload,
  SemanticAtom,
} from "../../types/packageTypes";

const STYLE_RENDER_ORDER = [
  "genre",
  "vocal_role",
  "surface",
  "core",
  "delivery",
  "motion",
  "production",
] as const;

function dedupe(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function formatAtom(atom: SemanticAtom): string {
  return atom.value.trim();
}

function sortStyleAtoms(atoms: SemanticAtom[]): SemanticAtom[] {
  const domainIndex = new Map<string, number>(
    STYLE_RENDER_ORDER.map((domain, index) => [domain, index]),
  );

  return [...atoms].sort((a, b) => {
    const aIndex = domainIndex.get(a.domain) ?? 999;
    const bIndex = domainIndex.get(b.domain) ?? 999;

    if (aIndex !== bIndex) return aIndex - bIndex;
    if (a.priority !== b.priority) return b.priority - a.priority;
    if (a.robustness !== b.robustness) return b.robustness - a.robustness;
    return a.label.localeCompare(b.label);
  });
}

function buildStrictPrompt(ir: ResolvedCompilerIR): string {
  const ordered = sortStyleAtoms(ir.styleAtoms);
  const styleTerms = ordered.map(formatAtom);

  const hardRuleTerms = ir.hardRules.map(formatAtom);
  const hintTerms = ir.renderHints.map(formatAtom);

  return dedupe([...styleTerms, ...hardRuleTerms, ...hintTerms]).join(", ");
}

function compressPhrase(phrase: string): string {
  return phrase
    .replace(/\bvery\b/gi, "")
    .replace(/\breally\b/gi, "")
    .replace(/\s+/g, " ")
    .replace(/\s+,/g, ",")
    .trim();
}

function buildCompressedPrompt(strictPrompt: string): string {
  const parts = strictPrompt.split(",").map((part) => compressPhrase(part)).filter(Boolean);
  return dedupe(parts).join(", ");
}

function buildFallbackPrompt(ir: ResolvedCompilerIR): string {
  const highestValueAtoms = sortStyleAtoms(ir.styleAtoms).slice(0, 5);
  const fallbackTerms = highestValueAtoms.map(formatAtom);

  return dedupe(fallbackTerms).join(", ");
}

function buildSectionedPromptPayload(ir: ResolvedCompilerIR): SectionedPromptPayload {
  const globalDirectives = dedupe([
    ...ir.hardRules.map(formatAtom),
    ...ir.renderHints.map(formatAtom),
  ]);

  const sections = ir.sectionPatches.map((patch) => ({
    section: patch.section,
    directives: dedupe([
      ...(patch.removeKeys ?? []).map((key) => `avoid ${key}`),
      ...patch.add.map(formatAtom),
      ...(patch.notes ?? []),
    ]),
  }));

  return {
    globalDirectives,
    sections,
  };
}

function buildCompileSummary(ir: ResolvedCompilerIR): CompileSummary {
  const keptKeys = ir.styleAtoms.map((atom) => atom.key);

  const droppedKeys = ir.compileTrace.decisions
    .filter((decision) => decision.type === "dropped" && decision.atomKey)
    .map((decision) => decision.atomKey!) ;

  const approximatedKeys = ir.compileTrace.decisions
    .filter((decision) => decision.type === "approximated" && decision.atomKey)
    .map((decision) => decision.atomKey!);

  const sectionalizedKeys = ir.compileTrace.decisions
    .filter((decision) => decision.type === "moved_to_section" && decision.atomKey)
    .map((decision) => decision.atomKey!);

  const warnings = ir.compileTrace.warnings.map((warning) => warning.message);

  return {
    keptKeys: dedupe(keptKeys),
    droppedKeys: dedupe(droppedKeys),
    approximatedKeys: dedupe(approximatedKeys),
    sectionalizedKeys: dedupe(sectionalizedKeys),
    warnings: dedupe(warnings),
  };
}

export function packageSuno(ir: ResolvedCompilerIR): PackagedCompilerOutput {
  const strict_prompt = buildStrictPrompt(ir);
  const compressed_prompt = buildCompressedPrompt(strict_prompt);
  const fallback_prompt = buildFallbackPrompt(ir);
  const sectioned_prompt_payload = buildSectionedPromptPayload(ir);
  const compile_summary = buildCompileSummary(ir);

  return {
    strict_prompt,
    compressed_prompt,
    fallback_prompt,
    sectioned_prompt_payload,
    compile_summary,
    compile_trace: ir.compileTrace,
  };
      }
