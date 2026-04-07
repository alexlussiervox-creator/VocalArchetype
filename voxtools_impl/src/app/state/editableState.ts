export interface EditableSectionDirective {
  section: "intro" | "verse" | "preChorus" | "chorus" | "bridge" | "outro" | "custom";
  label?: string;
  directive: string;
  canonicalKey?: string;
}

export interface EditableHardRule {
  canonicalKey: string;
  text: string;
}

export interface EditableMultiVoiceRequest {
  pattern:
    | "lead_harmony"
    | "lead_chorus_response"
    | "alternated_sectional"
    | "call_response"
    | "simultaneous_duet";
  strictRoleSeparation?: boolean;
}

export interface EditableVoxToolsState {
  archetypes: string[];
  intensity: number;
  priority: "dominant" | "blended" | "subtle";
  voiceType?: string;
  genre?: string;
  role?: string;
  surface?: string;
  core?: string;
  delivery?: string;
  motion?: string;
  production: string[];
  sections: EditableSectionDirective[];
  hardRules: EditableHardRule[];
  multiVoiceRequest?: EditableMultiVoiceRequest | null;
}

export const DEFAULT_EDITABLE_STATE: EditableVoxToolsState = {
  archetypes: [],
  intensity: 60,
  priority: "blended",
  voiceType: undefined,
  genre: undefined,
  role: undefined,
  surface: undefined,
  core: undefined,
  delivery: undefined,
  motion: undefined,
  production: [],
  sections: [],
  hardRules: [],
  multiVoiceRequest: null,
};
