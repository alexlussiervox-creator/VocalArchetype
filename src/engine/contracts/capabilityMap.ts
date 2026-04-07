import { CapabilityMapEntry } from "./packageTypes";

function exact(entry: CapabilityMapEntry): CapabilityMapEntry {
  if (entry.support !== "direct" && !entry.reason) {
    throw new Error(`Capability entry ${entry.canonicalKey} must include a reason when support is not direct.`);
  }
  return entry;
}

export const SUNO_CAPABILITY_DEFAULTS: Record<string, CapabilityMapEntry> = {
  intimate: exact({
    canonicalKey: "intimate",
    support: "direct",
  }),
  huge: exact({
    canonicalKey: "huge",
    support: "approximate",
    reason: "Large-scale vocal size is only approximate in single-pass Suno rendering.",
  }),
  belt_driven: exact({
    canonicalKey: "belt_driven",
    support: "approximate",
    reason: "Belt-driven behavior is more reliable when localized sectionally than guaranteed globally.",
  }),
  breathy: exact({
    canonicalKey: "breathy",
    support: "direct",
  }),
  commanding: exact({
    canonicalKey: "commanding",
    support: "direct",
  }),
  cinematic: exact({
    canonicalKey: "cinematic",
    support: "direct",
  }),
  conversational: exact({
    canonicalKey: "conversational",
    support: "direct",
  }),
  alternated_voices: exact({
    canonicalKey: "alternated_voices",
    support: "unsupported",
    reason: "Alternated voices are fragile in a single pass unless heavily simplified at coarse boundaries.",
  }),
  simultaneous_duet: exact({
    canonicalKey: "simultaneous_duet",
    support: "rejected",
    reason: "Distinct simultaneous dual-agent routing is not robust enough to promise directly.",
  }),
};

export function getCapabilityEntry(canonicalKey: string): CapabilityMapEntry | undefined {
  return SUNO_CAPABILITY_DEFAULTS[canonicalKey];
}
