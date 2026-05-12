// src/engine/constraintEngine/index.ts
// Canonical export point for constraint analysis
// This module analyzes constraints and violations in the CompilerIR.

export { runConstraintEngine } from "./constraintEngine";
export type { ConstraintEngineResult, ConstraintViolation } from "../contracts";
