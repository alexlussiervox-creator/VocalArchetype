// src/engine/resolve/compilerAwareResolver.ts

import type {
  CapabilityEntry,
  CompileTrace,
  CompileWarning,
  CompilerIR,
  ConflictRecord,
  Domain,
  MultiVoiceMode,
  MultiVoicePattern,
  ResolvedCompilerIR,
  ResolutionDecision,
  SectionPatch,
  SemanticAtom,
  SupportLevel,
} from "../types/packageTypes";
import { detectConflicts } from "../constraints/conflictRules";

const SUNO_CAPABILITY_MAP: Record<string, CapabilityEntry> = {
  cinematic_pop: { key: "cinematic_pop", support: "direct" },
  alt_pop: { key: "alt_pop", support: "direct" },
  modern_rnb: { key: "modern_rnb", support: "direct" },

  male_lead: { key: "male_lead", support: "direct" },
  female_lead: { key: "female_lead", support: "direct" },
  duet: { key: "duet", support: "approximate" },

  intimate_close_mic: { key: "intimate_close_mic", support: "direct" },
  huge_anthemic: { key: "huge_anthemic", support: "approximate" },
  breathy_surface: { key: "breathy_surface", support: "approximate" },
  fragile_core: { key: "fragile_core", support: "approximate" },
  elegant_control: { key: "elegant_control", support: "approximate" },
  commanding_delivery: { key: "commanding_delivery", support: "approximate" },
  conversational_phrasing: { key: "conversational_phrasing", support: "direct" },
  gradual_rise: { key: "gradual_rise", support: "approximate" },
  clear_diction: { key: "clear_diction", support: "direct" },
  restrained_delivery: { key: "restrained_delivery", support: "direct" },

  anti_falsetto: { key: "anti_falsetto", support: "approximate" },
  no_church_runs: { key: "no_church_runs", support: "approximate" },

  verse_intimate: { key: "verse_intimate", support: "direct" },
  chorus_expanded: { key: "chorus_expanded", support: "direct" },

  call_response: { key: "call_response", support: "approximate" },
  simultaneous_duet: {
    key: "simultaneous_duet",
    support: "rejected",
    notes: ["Suno single-pass output is not reliable for simultaneous duet precision."],
  },
};

const STYLE_DOMAINS = [
  "genre",
  "vocal_role",
  "surface",
  "core",
  "delivery",
  "motion",
  "production",
] as const;

function getSupportLevel(key: string): SupportLevel {
  return SUNO_CAPABILITY_MAP[key]?.support ?? "unsupported";
}

function rankForRetention(atom: SemanticAtom): number {
  // resolution order: priority > robustness > support > intensity
  const support = getSupportLevel(atom.key);

  const supportScore =
    support === "direct" ? 3 :
    support === "approximate" ? 2 :
    support === "unsupported" ? 1 :
    0;

  return (
    atom.priority * 10_000 +
    atom.robustness * 1_000 +
    supportScore * 100 +
    atom.intensity * 10
  );
}

function clonePatch(patch: SectionPatch): SectionPatch {
  return {
    section: patch.section,
    add: [...patch.add],
    removeKeys: patch.removeKeys ? [...patch.removeKeys] : undefined,
    notes: patch.notes ? [...patch.notes] : undefined,
  };
}

function createWarning(code: CompileWarning["code"], message: string): CompileWarning {
  return { code, message };
}

function createDecision(
  type: ResolutionDecision["type"],
  reason: string,
  atomKey?: string,
  section?: ResolutionDecision["section"],
): ResolutionDecision {
  return { type, reason, atomKey, section };
}

function removeByKey(atoms: SemanticAtom[], key: string): SemanticAtom[] {
  return atoms.filter((atom) => atom.key !== key);
}

function hasHardRuleAgainst(atom: SemanticAtom, hardRules: SemanticAtom[]): boolean {
  return hardRules.some((rule) => {
    if (rule.key === "anti_falsetto" && atom.key === "falsetto_lift") return true;
    if (rule.key === "no_church_runs" && atom.key === "gospel_runs") return true;
    return false;
  });
}

function ensureSectionPatch(
  sectionPatches: SectionPatch[],
  section: SectionPatch["section"],
): SectionPatch {
  let patch = sectionPatches.find((item) => item.section === section);
  if (!patch) {
    patch = { section, add: [] };
    sectionPatches.push(patch);
  }
  return patch;
}

function applyHardRuleFiltering(
  styleAtoms: SemanticAtom[],
  hardRules: SemanticAtom[],
  decisions: ResolutionDecision[],
): SemanticAtom[] {
  const kept: SemanticAtom[] = [];

  for (const atom of styleAtoms) {
    if (hasHardRuleAgainst(atom, hardRules)) {
      decisions.push(
        createDecision(
          "dropped",
          `Dropped because it violates a hard rule.`,
          atom.key,
        ),
      );
      continue;
    }

    kept.push(atom);
  }

  return kept;
}

function applyConflictResolution(
  styleAtoms: SemanticAtom[],
  sectionPatches: SectionPatch[],
  conflicts: ConflictRecord[],
  decisions: ResolutionDecision[],
  warnings: CompileWarning[],
): SemanticAtom[] {
  let current = [...styleAtoms];

  for (const conflict of conflicts) {
    const left = current.find((atom) => atom.key === conflict.leftKey);
    const right = current.find((atom) => atom.key === conflict.rightKey);

    if (!left || !right) continue;

    if (conflict.recommendedStrategy === "refuse") {
      const loser = rankForRetention(left) >= rankForRetention(right) ? right : left;
      current = removeByKey(current, loser.key);

      warnings.push(
        createWarning(
          "RAW_CONTRADICTION_AVOIDED",
          `Refused raw contradiction between "${left.key}" and "${right.key}".`,
        ),
      );

      decisions.push(
        createDecision(
          "dropped",
          `Dropped due to direct conflict with higher-ranked competing atom.`,
          loser.key,
        ),
      );

      continue;
    }

    if (conflict.recommendedStrategy === "prioritize") {
      const winner = rankForRetention(left) >= rankForRetention(right) ? left : right;
      const loser = winner.key === left.key ? right : left;

      current = removeByKey(current, loser.key);

      decisions.push(
        createDecision(
          "dropped",
          `Dropped because "${winner.key}" won conflict arbitration by resolution order.`,
          loser.key,
        ),
      );

      continue;
    }

    if (conflict.recommendedStrategy === "compress") {
      const loser = rankForRetention(left) >= rankForRetention(right) ? right : left;
      current = removeByKey(current, loser.key);

      decisions.push(
        createDecision(
          "compressed",
          `Compressed tension by retaining the stronger representative signal.`,
          loser.key,
        ),
      );

      warnings.push(
        createWarning(
          "LOW_CONTROLLABILITY",
          `Compressed "${left.key}" and "${right.key}" into a simplified renderable bundle.`,
        ),
      );

      continue;
    }

    if (conflict.recommendedStrategy === "sectionalize") {
      const lowerRanked = rankForRetention(left) >= rankForRetention(right) ? right : left;

      const targetSection =
        lowerRanked.key.includes("chorus") ? "chorus" :
        lowerRanked.key.includes("verse") ? "verse" :
        "chorus";

      current = removeByKey(current, lowerRanked.key);

      const patch = ensureSectionPatch(sectionPatches, targetSection);
      patch.add.push(lowerRanked);

      decisions.push(
        createDecision(
          "moved_to_section",
          `Moved from global style into section patch to avoid raw contradiction.`,
          lowerRanked.key,
          targetSection,
        ),
      );

      warnings.push(
        createWarning(
          "RAW_CONTRADICTION_AVOIDED",
          `Moved "${lowerRanked.key}" into section-specific rendering.`,
        ),
      );
    }
  }

  return current;
}

function applySupportFiltering(
  styleAtoms: SemanticAtom[],
  decisions: ResolutionDecision[],
  warnings: CompileWarning[],
): SemanticAtom[] {
  const kept: SemanticAtom[] = [];

  for (const atom of styleAtoms) {
    const support = getSupportLevel(atom.key);

    if (support === "rejected") {
      decisions.push(
        createDecision(
          "dropped",
          `Dropped because target support is rejected.`,
          atom.key,
        ),
      );

      warnings.push(
        createWarning(
          "REJECTED_REQUEST",
          `Dropped "${atom.key}" because the Suno backend rejects it in this form.`,
        ),
      );
      continue;
    }

    if (support === "unsupported") {
      decisions.push(
        createDecision(
          "approximated",
          `No direct support. Left out of strict style rendering and expected to degrade.`,
          atom.key,
        ),
      );

      warnings.push(
        createWarning(
          "UNSUPPORTED_TRAIT",
          `Trait "${atom.key}" is unsupported and may not render reliably.`,
        ),
      );
      continue;
    }

    if (support === "approximate") {
      decisions.push(
        createDecision(
          "approximated",
          `Kept with approximate support.`,
          atom.key,
        ),
      );
    } else {
      decisions.push(createDecision("kept", `Kept with direct support.`, atom.key));
    }

    kept.push(atom);
  }

  return kept;
}

function enforceStyleBudget(
  atoms: SemanticAtom[],
  budget: CompilerIR["renderGuidanceLayer"]["styleBudget"],
  decisions: ResolutionDecision[],
  warnings: CompileWarning[],
): SemanticAtom[] {
  const kept: SemanticAtom[] = [];

  for (const domain of STYLE_DOMAINS) {
    const allowed = budget[domain];
    const domainAtoms = atoms
      .filter((atom) => atom.domain === domain)
      .sort((a, b) => rankForRetention(b) - rankForRetention(a));

    kept.push(...domainAtoms.slice(0, allowed));

    for (const dropped of domainAtoms.slice(allowed)) {
      decisions.push(
        createDecision(
          "dropped",
          `Dropped because style budget for domain "${domain}" was exceeded.`,
          dropped.key,
        ),
      );
      warnings.push(
        createWarning(
          "STYLE_BUDGET_EXCEEDED",
          `Dropped "${dropped.key}" to respect the style budget for "${domain}".`,
        ),
      );
    }
  }

  // keep non-style-domain atoms out of global style
  return kept;
}

function computeMVCS(pattern: MultiVoicePattern): number {
  switch (pattern) {
    case "lead_harmony":
      return 2;
    case "lead_chorus_response":
      return 4;
    case "alternated_sectional":
      return 5;
    case "call_response":
      return 7;
    case "simultaneous_duet":
      return 9;
  }
}

function recommendedMultiVoiceMode(score: number): MultiVoiceMode {
  if (score <= 2) return "prompt_direct";
  if (score <= 5) return "prompt_simplified";
  if (score <= 7) return "prompt_simplified";
  return "split_generation";
}

function resolveMultiVoice(
  ir: CompilerIR,
  warnings: CompileWarning[],
  decisions: ResolutionDecision[],
): CompilerIR["interactionLayer"]["multiVoice"] | undefined {
  const mv = ir.interactionLayer.multiVoice;
  if (!mv || !mv.enabled) return undefined;

  const score = mv.complexityScore ?? computeMVCS(mv.pattern);
  const mode = recommendedMultiVoiceMode(score);

  const next = {
    ...mv,
    complexityScore: score,
    recommendedMode: mode,
  };

  if (mode === "prompt_simplified") {
    warnings.push(
      createWarning(
        "MULTI_VOICE_SIMPLIFIED",
        `Multi-voice request "${mv.pattern}" was simplified due to controllability risk.`,
      ),
    );
    decisions.push(
      createDecision(
        "warning",
        `Multi-voice pattern "${mv.pattern}" should be simplified for the Suno backend.`,
      ),
    );
  }

  if (mode === "split_generation") {
    warnings.push(
      createWarning(
        "MULTI_VOICE_SPLIT_RECOMMENDED",
        `Pattern "${mv.pattern}" should default to split generation.`,
      ),
    );
    decisions.push(
      createDecision(
        "warning",
        `Multi-voice pattern "${mv.pattern}" exceeds reliable single-pass controllability.`,
      ),
    );
  }

  return next;
}

export function resolveForSuno(ir: CompilerIR): ResolvedCompilerIR {
  const conflicts = detectConflicts(ir);
  const decisions: ResolutionDecision[] = [];
  const warnings: CompileWarning[] = [];

  const initialStyleAtoms = [...ir.identityLayer, ...ir.behaviorLayer];
  const hardRules = [...ir.constraintLayer.hardRules];
  const softConstraints = [...ir.constraintLayer.softConstraints];
  const sectionPatches = ir.sectionLayer.map(clonePatch);

  let styleAtoms = applyHardRuleFiltering(initialStyleAtoms, hardRules, decisions);
  styleAtoms = applyConflictResolution(
    styleAtoms,
    sectionPatches,
    conflicts,
    decisions,
    warnings,
  );
  styleAtoms = applySupportFiltering(styleAtoms, decisions, warnings);
  styleAtoms = enforceStyleBudget(
    styleAtoms,
    ir.renderGuidanceLayer.styleBudget,
    decisions,
    warnings,
  );

  const multiVoice = resolveMultiVoice(ir, warnings, decisions);

  const compileTrace: CompileTrace = {
    target: "suno",
    conflicts,
    decisions,
    warnings,
  };

  return {
    target: "suno",
    styleAtoms,
    hardRules,
    softConstraints,
    sectionPatches,
    renderHints: [...ir.renderGuidanceLayer.hints],
    multiVoice,
    compileTrace,
  };
  }
