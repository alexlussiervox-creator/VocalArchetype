/**
 * Target compilation backend.
 * Currently only Suno is supported.
 */
export type TargetModel = "suno";

/**
 * Semantic classification of IR nodes.
 * Determines how a node is processed through the pipeline.
 *
 * - trait: Core vocal characteristic (e.g., "intimate", "huge")
 * - preference: Rendering preference (e.g., "close-mic")
 * - hard_rule: Non-negotiable constraint (e.g., "no falsetto")
 * - soft_constraint: Flexible constraint that may be relaxed
 * - render_hint: Guidance for rendering without being a trait
 * - multi_voice: Multi-voice configuration and patterns
 */
export type SemanticClass =
  | "trait"
  | "preference"
  | "hard_rule"
  | "soft_constraint"
  | "render_hint"
  | "multi_voice";

/**
 * Semantic domain categorizing the type of vocal characteristic.
 * Used for organizing nodes and applying domain-specific rules.
 *
 * - genre: Musical genre (e.g., "modern R&B", "jazz")
 * - role: Vocal role/register (e.g., "male lead", "female harmony")
 * - surface: Vocal texture/quality (e.g., "intimate", "breathy")
 * - core: Vocal essence/power (e.g., "belt-driven", "fragile")
 * - delivery: Manner of delivery (e.g., "conversational", "commanding")
 * - motion: Vocal dynamics/movement (e.g., "gradual rise", "explosive")
 * - production: Production elements (e.g., "reverb", "compression")
 * - sectional: Section-specific directives (internal use)
 * - multiVoice: Multi-voice configuration (internal use)
 */
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

/**
 * Priority level determines importance in conflict resolution.
 * Higher priority nodes are kept when conflicts occur.
 */
export type Priority = "dominant" | "blended" | "subtle";

/**
 * Robustness level indicates how stable/reliable a node is.
 * Higher robustness nodes are preferred in conflicts.
 */
export type RobustnessLevel = "low" | "medium" | "high";

/**
 * Support level indicates backend support for a characteristic.
 * - direct: Fully supported by backend
 * - approximate: Supported with approximation
 * - unsupported: Not supported, will be dropped
 * - rejected: Explicitly rejected, cannot be used
 */
export type SupportLevel = "direct" | "approximate" | "unsupported" | "rejected";

/**
 * Severity level for warnings and issues.
 */
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

/**
 * An IR node represents a single semantic unit in the compilation.
 * Nodes flow through the pipeline: verify → constraint → resolve → package.
 */
export interface IRNode {
  /** Unique identifier within the IR */
  id: string;

  /** Canonical key for capability lookup and conflict detection */
  canonicalKey: string;

  /** Semantic classification (trait, hard_rule, etc.) */
  semanticClass: SemanticClass;

  /** Domain categorization (genre, role, surface, etc.) */
  domain: TraitDomain;

  /** Human-readable text representation */
  text: string;

  /** Priority in conflict resolution (dominant > blended > subtle) */
  priority: Priority;

  /** Intensity level (0-100) */
  intensity: number;

  /** Robustness/stability (low < medium < high) */
  robustness: RobustnessLevel;

  /** Backend support level */
  support: SupportLevel;

  /** Optional section targeting for sectional directives */
  target?: IRSectionTarget;

  /** Optional tags for categorization */
  tags?: string[];

  /** Optional source tracking (e.g., "user", "archetype") */
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

/**
 * Compiler IR (Intermediate Representation) is the canonical input format.
 * It represents user intent as a flat list of semantic nodes.
 * The pipeline transforms this into backend-specific outputs.
 */
export interface CompilerIR {
  /** Target backend (currently only "suno") */
  targetModel: TargetModel;

  /** Optional locale/language specification */
  locale?: string;

  /** Flat list of semantic nodes */
  nodes: IRNode[];

  /** Optional multi-voice configuration */
  multiVoice?: MultiVoiceConfig | null;

  /** Optional notes for tracking/debugging */
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

/**
 * Resolved IR is the output of the constraint resolution phase.
 * Nodes are categorized into global, sectional, and removed buckets.
 */
export interface ResolvedIR {
  /** Target backend */
  targetModel: TargetModel;

  /** Optional locale */
  locale?: string;

  /** Nodes that apply globally to all sections */
  globalNodes: IRNode[];

  /** Nodes that apply to specific sections */
  sectionalNodes: IRNode[];

  /** Nodes removed due to conflicts or unsupported status */
  removedNodes: IRNode[];

  /** Warnings generated during resolution */
  warnings: ResolverWarning[];

  /** Capability map showing support levels */
  capabilityMap: CapabilityMapEntry[];

  /** Trace of compilation decisions */
  compileTrace: CompileTraceEntry[];

  /** Optional multi-voice configuration */
  multiVoice?: MultiVoiceConfig | null;

  /** Optional notes */
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

/**
 * Suno package is the final output ready for Suno API.
 * Contains multiple prompt variants and metadata.
 */
export interface SunoPackage {
  /** Full prompt with all global nodes */
  strict_prompt: string;

  /** Compressed prompt with semantic compression */
  compressed_prompt: string;

  /** Fallback prompt using removed/weak nodes */
  fallback_prompt: string;

  /** Sectioned payload for section-specific directives */
  sectioned_prompt_payload: SectionedPromptPayload;

  /** Summary of compilation statistics */
  compile_summary: CompileSummary;

  /** Warnings from resolution phase */
  warnings: ResolverWarning[];

  /** Full compilation trace */
  compileTrace: CompileTraceEntry[];
}

/**
 * Pipeline result is the output of the complete compilation pipeline.
 * Contains results from each stage or error information.
 */
export interface PipelineResult {
  /** Whether compilation succeeded */
  ok: boolean;

  /** Verification results (always present) */
  verification: VerificationResult;

  /** Constraint analysis results (present if verification passed) */
  constraints?: ConstraintEngineResult;

  /** Resolution results (present if constraints passed) */
  resolved?: ResolvedIR;

  /** Final packaged output (present if resolution passed) */
  packaged?: SunoPackage;
}
