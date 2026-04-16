// src/engine/types/packageTypes.ts

export type SemanticClass =
  | "trait"
  | "preference"
  | "hard_rule"
  | "soft_constraint"
  | "render_hint"
  | "multi_voice";

export type Domain =
  | "genre"
  | "vocal_role"
  | "surface"
  | "core"
  | "delivery"
  | "motion"
  | "production"
  | "phrasing"
  | "articulation"
  | "dynamics"
  | "register_behavior"
  | "constraint"
  | "multi_voice";

export type SectionName =
  | "global"
  | "intro"
  | "verse"
  | "pre_chorus"
  | "chorus"
  | "bridge"
  | "outro";

export type SourceType = "intent" | "expert_mode" | "archetype" | "system";

export type SupportLevel =
  | "direct"
  | "approximate"
  | "unsupported"
  | "rejected";

export type ConflictRelation =
  | "compatible"
  | "tension_productive"
  | "context_dependent"
  | "direct_conflict";

export type ConflictStrategy =
  | "allow"
  | "compress"
  | "prioritize"
  | "refuse"
  | "sectionalize";

export type ResolutionDecisionType =
  | "kept"
  | "compressed"
  | "dropped"
  | "moved_to_section"
  | "approximated"
  | "warning";

export type WarningCode =
  | "LOW_CONTROLLABILITY"
  | "RAW_CONTRADICTION_AVOIDED"
  | "UNSUPPORTED_TRAIT"
  | "REJECTED_REQUEST"
  | "STYLE_BUDGET_EXCEEDED"
  | "MULTI_VOICE_SIMPLIFIED"
  | "MULTI_VOICE_SPLIT_RECOMMENDED"
  | "INVALID_IR";

export type MultiVoicePattern =
  | "lead_harmony"
  | "lead_chorus_response"
  | "alternated_sectional"
  | "call_response"
  | "simultaneous_duet";

export type MultiVoiceMode =
  | "prompt_direct"
  | "prompt_simplified"
  | "split_generation";

export type PriorityLevel = 1 | 2 | 3;
export type IntensityLevel = 1 | 2 | 3;
export type RobustnessLevel = 1 | 2 | 3 | 4 | 5;

export interface SemanticAtom {
  id: string;
  key: string;
  label: string;
  value: string;
  semanticClass: SemanticClass;
  domain: Domain;
  priority: PriorityLevel;
  intensity: IntensityLevel;
  robustness: RobustnessLevel;
  source: SourceType;
  notes?: string[];
}

export interface SectionPatch {
  section: Exclude<SectionName, "global">;
  add: SemanticAtom[];
  removeKeys?: string[];
  notes?: string[];
}

export interface MultiVoiceRole {
  roleId: string;
  label: string;
  assignedSections: SectionName[];
  traits: SemanticAtom[];
}

export interface MultiVoiceRequest {
  enabled: boolean;
  pattern: MultiVoicePattern;
  roles: MultiVoiceRole[];
  complexityScore?: number;
  recommendedMode?: MultiVoiceMode;
  notes?: string[];
}

export interface StyleBudget {
  genre: number;
  vocal_role: number;
  surface: number;
  core: number;
  delivery: number;
  motion: number;
  production: number;
}

export interface CompilerIR {
  identityLayer: SemanticAtom[];
  behaviorLayer: SemanticAtom[];
  sectionLayer: SectionPatch[];
  interactionLayer: {
    multiVoice?: MultiVoiceRequest;
  };
  constraintLayer: {
    hardRules: SemanticAtom[];
    softConstraints: SemanticAtom[];
  };
  renderGuidanceLayer: {
    target: "suno";
    hints: SemanticAtom[];
    styleBudget: StyleBudget;
  };
}

export interface ConflictRecord {
  leftKey: string;
  rightKey: string;
  relation: ConflictRelation;
  recommendedStrategy: ConflictStrategy;
  reason: string;
}

export interface ResolutionDecision {
  type: ResolutionDecisionType;
  atomKey?: string;
  section?: SectionName;
  reason: string;
}

export interface CompileWarning {
  code: WarningCode;
  message: string;
}

export interface CapabilityEntry {
  key: string;
  support: SupportLevel;
  notes?: string[];
}

export interface ResolvedCompilerIR {
  target: "suno";
  styleAtoms: SemanticAtom[];
  hardRules: SemanticAtom[];
  softConstraints: SemanticAtom[];
  sectionPatches: SectionPatch[];
  renderHints: SemanticAtom[];
  multiVoice?: MultiVoiceRequest;
  compileTrace: CompileTrace;
}

export interface CompileTrace {
  target: "suno";
  conflicts: ConflictRecord[];
  decisions: ResolutionDecision[];
  warnings: CompileWarning[];
}

export interface SectionedPromptPayload {
  globalDirectives: string[];
  sections: Array<{
    section: Exclude<SectionName, "global">;
    directives: string[];
  }>;
}

export interface CompileSummary {
  keptKeys: string[];
  droppedKeys: string[];
  approximatedKeys: string[];
  sectionalizedKeys: string[];
  warnings: string[];
}

export interface PackagedCompilerOutput {
  strict_prompt: string;
  compressed_prompt: string;
  fallback_prompt: string;
  sectioned_prompt_payload: SectionedPromptPayload;
  compile_summary: CompileSummary;
  compile_trace: CompileTrace;
}

export interface PipelineResult {
  input: CompilerIR;
  resolved: ResolvedCompilerIR;
  output: PackagedCompilerOutput;
}

export interface VerifierResult {
  ok: boolean;
  errors: string[];
}

export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${String(value)}`);
}
