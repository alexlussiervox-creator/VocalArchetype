export type TargetModel = "suno";

export type SemanticClass =
  | "trait"
  | "preference"
  | "hard_rule"
  | "soft_constraint"
  | "render_hint"
  | "multi_voice";

export type TraitDomain =
  | "genre"
  | "role"
  | "surface"
  | "core"
  | "delivery"
  | "motion"
  | "production"
  | "sectional"
  | "multiVoice";

export type Priority = "dominant" | "blended" | "subtle";
export type RobustnessLevel = "low" | "medium" | "high";
export type SupportLevel = "direct" | "approximate" | "unsupported" | "rejected";
export type WarningSeverity = "info" | "warning" | "strong";

export type ResolutionStrategy =
  | "allow"
  | "compress"
  | "prioritize"
  | "refuse"
  | "sectionalize";

export type SectionName =
  | "global"
  | "intro"
  | "verse"
  | "preChorus"
  | "chorus"
  | "bridge"
  | "outro"
  | "custom";

export interface IRSectionTarget {
  section: SectionName;
  label?: string;
}

export interface IRNode {
  id: string;
  canonicalKey: string;
  semanticClass: SemanticClass;
  domain: TraitDomain;
  text: string;
  priority: Priority;
  intensity: number;
  robustness: RobustnessLevel;
  support: SupportLevel;
  target?: IRSectionTarget;
  tags?: string[];
  source?: string;
}

export interface MultiVoiceConfig {
  pattern:
    | "lead_harmony"
    | "lead_chorus_response"
    | "alternated_sectional"
    | "call_response"
    | "simultaneous_duet";
  mode?: "prompt_direct" | "prompt_simplified" | "split_generation";
  strictRoleSeparation?: boolean;
  localized?: boolean;
}

export interface CompilerIR {
  targetModel: TargetModel;
  locale?: string;
  nodes: IRNode[];
  multiVoice?: MultiVoiceConfig | null;
  notes?: string[];
}

export interface VerificationIssue {
  code: string;
  message: string;
  severity: WarningSeverity;
  nodeIds?: string[];
}

export interface VerificationResult {
  ok: boolean;
  issues: VerificationIssue[];
}

export interface ConflictMatch {
  leftNodeId: string;
  rightNodeId: string;
  relation: "compatible" | "tension_productive" | "context_dependent" | "direct_conflict";
  strategy: ResolutionStrategy;
  message: string;
  severity: WarningSeverity;
}

export interface ResolverWarning {
  code: string;
  message: string;
  severity: WarningSeverity;
  strategy?: ResolutionStrategy;
  nodeIds?: string[];
}

export interface CompileTraceEntry {
  step:
    | "verify"
    | "constraint"
    | "resolve"
    | "compile"
    | "package"
    | "pipeline";
  code: string;
  message: string;
  nodeIds?: string[];
  severity?: WarningSeverity;
}

export interface CapabilityMapEntry {
  canonicalKey: string;
  support: SupportLevel;
  reason?: string;
}

export interface ConstraintViolation {
  type: "explicit_conflict" | "domain_collision" | "hard_rule_violation" | "sectional_candidate" | "unsupported_request";
  code: string;
  message: string;
  nodeIds?: string[];
  severity: WarningSeverity;
  suggestedStrategy: ResolutionStrategy;
}

export interface ConstraintEngineResult {
  input: CompilerIR;
  conflicts: ConflictMatch[];
  domainCollisions: ConstraintViolation[];
  hardRuleViolations: ConstraintViolation[];
  sectionalCandidates: ConstraintViolation[];
  unsupportedRequests: ConstraintViolation[];
  compileTrace: CompileTraceEntry[];
}

export interface ResolvedIR {
  targetModel: TargetModel;
  locale?: string;
  globalNodes: IRNode[];
  sectionalNodes: IRNode[];
  removedNodes: IRNode[];
  warnings: ResolverWarning[];
  capabilityMap: CapabilityMapEntry[];
  compileTrace: CompileTraceEntry[];
  multiVoice?: MultiVoiceConfig | null;
  notes?: string[];
}

export interface SectionedPromptPayload {
  globalDirectives: string[];
  sections: Array<{
    section: SectionName;
    label?: string;
    directives: string[];
  }>;
}

export interface CompileSummary {
  targetModel: TargetModel;
  globalNodeCount: number;
  sectionalNodeCount: number;
  removedNodeCount: number;
  warningCount: number;
  usedFallback: boolean;
  notes: string[];
}

export interface SunoPackage {
  strict_prompt: string;
  compressed_prompt: string;
  fallback_prompt: string;
  sectioned_prompt_payload: SectionedPromptPayload;
  compile_summary: CompileSummary;
  warnings: ResolverWarning[];
  compileTrace: CompileTraceEntry[];
}

export interface PipelineResult {
  ok: boolean;
  verification: VerificationResult;
  constraints?: ConstraintEngineResult;
  resolved?: ResolvedIR;
  packaged?: SunoPackage;
}
