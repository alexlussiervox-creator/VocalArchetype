import { PipelineResult } from "../../engine/contracts/packageTypes";

export interface DerivedCompilerState {
  strict_prompt: string;
  compressed_prompt: string;
  fallback_prompt: string;
  sectioned_prompt_payload: PipelineResult["packaged"] extends infer P
    ? P extends { sectioned_prompt_payload: infer S }
      ? S
      : never
    : never;
  warnings: NonNullable<PipelineResult["packaged"]>["warnings"];
  compile_summary: NonNullable<PipelineResult["packaged"]>["compile_summary"];
  compileTrace: NonNullable<PipelineResult["packaged"]>["compileTrace"];
}

export function deriveCompilerState(result: PipelineResult): DerivedCompilerState | null {
  if (!result.ok || !result.packaged) return null;
  return {
    strict_prompt: result.packaged.strict_prompt,
    compressed_prompt: result.packaged.compressed_prompt,
    fallback_prompt: result.packaged.fallback_prompt,
    sectioned_prompt_payload: result.packaged.sectioned_prompt_payload,
    warnings: result.packaged.warnings,
    compile_summary: result.packaged.compile_summary,
    compileTrace: result.packaged.compileTrace,
  };
}
