// src/engine/verify/verifier.ts

import type {
  CompilerIR,
  Domain,
  SectionName,
  SemanticAtom,
  VerifierResult,
} from "../types/packageTypes";

const STYLE_BUDGET_DOMAINS: Domain[] = [
  "genre",
  "vocal_role",
  "surface",
  "core",
  "delivery",
  "motion",
  "production",
];

const ALL_SECTIONS: SectionName[] = [
  "global",
  "intro",
  "verse",
  "pre_chorus",
  "chorus",
  "bridge",
  "outro",
];

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateAtom(atom: SemanticAtom, path: string): string[] {
  const errors: string[] = [];

  if (!isNonEmptyString(atom.id)) {
    errors.push(`${path}.id must be a non-empty string`);
  }

  if (!isNonEmptyString(atom.key)) {
    errors.push(`${path}.key must be a non-empty string`);
  }

  if (!isNonEmptyString(atom.label)) {
    errors.push(`${path}.label must be a non-empty string`);
  }

  if (!isNonEmptyString(atom.value)) {
    errors.push(`${path}.value must be a non-empty string`);
  }

  if (atom.priority < 1 || atom.priority > 3) {
    errors.push(`${path}.priority must be between 1 and 3`);
  }

  if (atom.intensity < 1 || atom.intensity > 3) {
    errors.push(`${path}.intensity must be between 1 and 3`);
  }

  if (atom.robustness < 1 || atom.robustness > 5) {
    errors.push(`${path}.robustness must be between 1 and 5`);
  }

  return errors;
}

function validateUniqueAtomIds(ir: CompilerIR): string[] {
  const allAtoms: SemanticAtom[] = [
    ...ir.identityLayer,
    ...ir.behaviorLayer,
    ...ir.constraintLayer.hardRules,
    ...ir.constraintLayer.softConstraints,
    ...ir.renderGuidanceLayer.hints,
    ...ir.sectionLayer.flatMap((patch) => patch.add),
    ...(ir.interactionLayer.multiVoice?.roles.flatMap((role) => role.traits) ?? []),
  ];

  const seen = new Set<string>();
  const errors: string[] = [];

  for (const atom of allAtoms) {
    if (seen.has(atom.id)) {
      errors.push(`Duplicate atom id detected: ${atom.id}`);
    }
    seen.add(atom.id);
  }

  return errors;
}

function validateSectionPatches(ir: CompilerIR): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();

  for (const [index, patch] of ir.sectionLayer.entries()) {
    const path = `sectionLayer[${index}]`;

    if (!ALL_SECTIONS.includes(patch.section)) {
      errors.push(`${path}.section is invalid`);
    }

    if (patch.section === "global") {
      errors.push(`${path}.section cannot be "global"`);
    }

    if (seen.has(patch.section)) {
      errors.push(`Duplicate section patch detected for section "${patch.section}"`);
    }
    seen.add(patch.section);

    for (const [atomIndex, atom] of patch.add.entries()) {
      errors.push(...validateAtom(atom, `${path}.add[${atomIndex}]`));
    }
  }

  return errors;
}

function validateStyleBudget(ir: CompilerIR): string[] {
  const budget = ir.renderGuidanceLayer.styleBudget;
  const errors: string[] = [];

  for (const key of STYLE_BUDGET_DOMAINS) {
    const value = budget[key];
    if (!Number.isInteger(value) || value < 0) {
      errors.push(`renderGuidanceLayer.styleBudget.${key} must be a non-negative integer`);
    }
  }

  return errors;
}

function validateHardRuleClasses(ir: CompilerIR): string[] {
  const errors: string[] = [];

  for (const [index, atom] of ir.constraintLayer.hardRules.entries()) {
    if (atom.semanticClass !== "hard_rule") {
      errors.push(`constraintLayer.hardRules[${index}] must have semanticClass "hard_rule"`);
    }
  }

  for (const [index, atom] of ir.constraintLayer.softConstraints.entries()) {
    if (atom.semanticClass !== "soft_constraint") {
      errors.push(
        `constraintLayer.softConstraints[${index}] must have semanticClass "soft_constraint"`,
      );
    }
  }

  return errors;
}

function validateTarget(ir: CompilerIR): string[] {
  return ir.renderGuidanceLayer.target === "suno"
    ? []
    : [`Unsupported target: ${String(ir.renderGuidanceLayer.target)}`];
}

function validateMultiVoice(ir: CompilerIR): string[] {
  const mv = ir.interactionLayer.multiVoice;
  if (!mv) return [];

  const errors: string[] = [];

  if (!mv.enabled) return [];

  if (!mv.pattern) {
    errors.push(`interactionLayer.multiVoice.pattern is required when multiVoice is enabled`);
  }

  if (!Array.isArray(mv.roles) || mv.roles.length === 0) {
    errors.push(`interactionLayer.multiVoice.roles must contain at least one role`);
  }

  for (const [roleIndex, role] of mv.roles.entries()) {
    const path = `interactionLayer.multiVoice.roles[${roleIndex}]`;

    if (!isNonEmptyString(role.roleId)) {
      errors.push(`${path}.roleId must be a non-empty string`);
    }

    if (!isNonEmptyString(role.label)) {
      errors.push(`${path}.label must be a non-empty string`);
    }

    if (!Array.isArray(role.assignedSections) || role.assignedSections.length === 0) {
      errors.push(`${path}.assignedSections must contain at least one section`);
    }

    for (const section of role.assignedSections) {
      if (!ALL_SECTIONS.includes(section)) {
        errors.push(`${path}.assignedSections contains invalid section "${section}"`);
      }
    }

    for (const [atomIndex, atom] of role.traits.entries()) {
      errors.push(...validateAtom(atom, `${path}.traits[${atomIndex}]`));
    }
  }

  return errors;
}

export function verifyIR(ir: CompilerIR): VerifierResult {
  const errors: string[] = [];

  if (!ir || typeof ir !== "object") {
    return {
      ok: false,
      errors: ["CompilerIR must be an object"],
    };
  }

  for (const [index, atom] of ir.identityLayer.entries()) {
    errors.push(...validateAtom(atom, `identityLayer[${index}]`));
  }

  for (const [index, atom] of ir.behaviorLayer.entries()) {
    errors.push(...validateAtom(atom, `behaviorLayer[${index}]`));
  }

  for (const [index, atom] of ir.constraintLayer.hardRules.entries()) {
    errors.push(...validateAtom(atom, `constraintLayer.hardRules[${index}]`));
  }

  for (const [index, atom] of ir.constraintLayer.softConstraints.entries()) {
    errors.push(...validateAtom(atom, `constraintLayer.softConstraints[${index}]`));
  }

  for (const [index, atom] of ir.renderGuidanceLayer.hints.entries()) {
    errors.push(...validateAtom(atom, `renderGuidanceLayer.hints[${index}]`));
  }

  errors.push(...validateUniqueAtomIds(ir));
  errors.push(...validateSectionPatches(ir));
  errors.push(...validateStyleBudget(ir));
  errors.push(...validateHardRuleClasses(ir));
  errors.push(...validateTarget(ir));
  errors.push(...validateMultiVoice(ir));

  return {
    ok: errors.length === 0,
    errors,
  };
}

export function assertValidIR(ir: CompilerIR): void {
  const result = verifyIR(ir);

  if (!result.ok) {
    throw new Error(
      `Invalid CompilerIR:\n${result.errors.map((error) => `- ${error}`).join("\n")}`,
    );
  }
      }
