// src/engine/resolver/index.ts
// Canonical export point for resolution logic
// This module handles conflict resolution and IR transformation.

export { resolveCompilerIR } from "./compilerAwareResolver";
export type { ResolvedIR, ResolverWarning } from "../contracts";
