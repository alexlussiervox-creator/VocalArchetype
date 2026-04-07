import { runConstraintEngine } from "../constraintEngine/constraintEngine";
import { CompilerIR, PipelineResult } from "../contracts/packageTypes";
import { packageSuno } from "../packaging/packageSuno";
import { resolveCompilerIR } from "../resolver/compilerAwareResolver";
import { verifyCompilerIR } from "../verifier/verifier";

export function runPackagedSunoPipeline(ir: CompilerIR): PipelineResult {
  const verification = verifyCompilerIR(ir);
  if (!verification.ok) {
    return {
      ok: false,
      verification,
    };
  }

  const constraints = runConstraintEngine(ir);
  const resolved = resolveCompilerIR(constraints);
  const packaged = packageSuno(resolved);

  return {
    ok: true,
    verification,
    constraints,
    resolved,
    packaged,
  };
}
