// src/engine/normalize/normalizer.ts

import type {
  CompilerIR,
  SectionPatch,
  SemanticAtom,
} from "../types/packageTypes";

import { NORMALIZER_REGISTRY } from "./registry";

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeText(input: string): string {
  return input.toLowerCase().trim();
}

function atomFromEmit(
  emit: (typeof NORMALIZER_REGISTRY)[number]["emits"][number],
): SemanticAtom {
  return {
    id: createId(),
    key: emit.key,
    label: emit.label,
    value: emit.value,
    semanticClass: emit.semanticClass,
    domain: emit.domain,
    priority: emit.priority,
    intensity: emit.intensity,
    robustness: emit.robustness,
    source: emit.source ?? "intent",
  };
}

function dedupeAtoms(atoms: SemanticAtom[]): SemanticAtom[] {
  const seen = new Set<string>();
  const result: SemanticAtom[] = [];

  for (const atom of atoms) {
    if (seen.has(atom.key)) continue;
    seen.add(atom.key);
    result.push(atom);
  }

  return result;
}

function extractAtoms(input: string): SemanticAtom[] {
  const text = normalizeText(input);
  const atoms: SemanticAtom[] = [];

  for (const entry of NORMALIZER_REGISTRY) {
    const matched = entry.phrases.some((phrase) => text.includes(phrase));

    if (!matched) continue;

    for (const emit of entry.emits) {
      atoms.push(atomFromEmit(emit));
    }
  }

  return dedupeAtoms(atoms);
}

function splitAtoms(atoms: SemanticAtom[]) {
  const identityLayer: SemanticAtom[] = [];
  const behaviorLayer: SemanticAtom[] = [];
  const hardRules: SemanticAtom[] = [];
  const softConstraints: SemanticAtom[] = [];
  const hints: SemanticAtom[] = [];
  const sectionLayer: SectionPatch[] = [];

  for (const atom of atoms) {
    if (atom.semanticClass === "hard_rule") {
      hardRules.push(atom);
      continue;
    }

    if (atom.semanticClass === "soft_constraint") {
      softConstraints.push(atom);
      continue;
    }

    if (atom.semanticClass === "render_hint") {
      hints.push(atom);
      continue;
    }

    if (atom.key === "chorus_expanded") {
      sectionLayer.push({
        section: "chorus",
        add: [atom],
      });
      continue;
    }

    if (atom.key === "verse_intimate") {
      sectionLayer.push({
        section: "verse",
        add: [atom],
      });
      continue;
    }

    if (
      atom.domain === "genre" ||
      atom.domain === "vocal_role" ||
      atom.domain === "surface" ||
      atom.domain === "core"
    ) {
      identityLayer.push(atom);
      continue;
    }

    behaviorLayer.push(atom);
  }

  return {
    identityLayer,
    behaviorLayer,
    hardRules,
    softConstraints,
    hints,
    sectionLayer,
  };
}

export function normalizeIntentToIR(input: string): CompilerIR {
  const atoms = extractAtoms(input);

  const {
    identityLayer,
    behaviorLayer,
    hardRules,
    softConstraints,
    hints,
    sectionLayer,
  } = splitAtoms(atoms);

  return {
    identityLayer,
    behaviorLayer,
    sectionLayer,
    interactionLayer: {},
    constraintLayer: {
      hardRules,
      softConstraints,
    },
    renderGuidanceLayer: {
      target: "suno",
      hints,
      styleBudget: {
        genre: 1,
        vocal_role: 1,
        surface: 1,
        core: 1,
        delivery: 1,
        motion: 1,
        production: 2,
      },
    },
  };
}
