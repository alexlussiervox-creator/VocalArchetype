// src/engine/normalize/registry.ts

import type {
  Domain,
  SemanticClass,
  SourceType,
} from "../types/packageTypes";

export interface RegistryEmit {
  key: string;
  label: string;
  value: string;
  semanticClass: SemanticClass;
  domain: Domain;
  priority: 1 | 2 | 3;
  intensity: 1 | 2 | 3;
  robustness: 1 | 2 | 3 | 4 | 5;
  source?: SourceType;
}

export interface RegistryEntry {
  phrases: string[];
  emits: RegistryEmit[];
}

export const NORMALIZER_REGISTRY: RegistryEntry[] = [
  {
    phrases: ["intimate", "close mic", "close-mic"],
    emits: [
      {
        key: "intimate_close_mic",
        label: "Intimate Close Mic",
        value: "close-mic intimate vocal",
        semanticClass: "trait",
        domain: "surface",
        priority: 3,
        intensity: 2,
        robustness: 5,
      },
    ],
  },

  {
    phrases: ["male voice", "male lead", "male vocal"],
    emits: [
      {
        key: "male_lead",
        label: "Male Lead",
        value: "male lead vocal",
        semanticClass: "trait",
        domain: "vocal_role",
        priority: 3,
        intensity: 2,
        robustness: 5,
      },
    ],
  },

  {
    phrases: ["female voice", "female lead", "female vocal"],
    emits: [
      {
        key: "female_lead",
        label: "Female Lead",
        value: "female lead vocal",
        semanticClass: "trait",
        domain: "vocal_role",
        priority: 3,
        intensity: 2,
        robustness: 5,
      },
    ],
  },

  {
    phrases: ["huge chorus", "big chorus", "anthemic chorus"],
    emits: [
      {
        key: "chorus_expanded",
        label: "Expanded Chorus",
        value: "huge chorus lift",
        semanticClass: "trait",
        domain: "dynamics",
        priority: 3,
        intensity: 3,
        robustness: 5,
      },
    ],
  },

  {
    phrases: ["intimate verse", "quiet verse"],
    emits: [
      {
        key: "verse_intimate",
        label: "Intimate Verse",
        value: "intimate restrained verse",
        semanticClass: "trait",
        domain: "dynamics",
        priority: 3,
        intensity: 2,
        robustness: 5,
      },
    ],
  },

  {
    phrases: ["no diva", "not diva", "no diva vocals"],
    emits: [
      {
        key: "anti_diva",
        label: "Avoid Diva",
        value: "avoid diva theatrics",
        semanticClass: "hard_rule",
        domain: "constraint",
        priority: 3,
        intensity: 3,
        robustness: 4,
      },
    ],
  },

  {
    phrases: ["no falsetto"],
    emits: [
      {
        key: "anti_falsetto",
        label: "No Falsetto",
        value: "no falsetto",
        semanticClass: "hard_rule",
        domain: "constraint",
        priority: 3,
        intensity: 3,
        robustness: 5,
      },
    ],
  },

  {
    phrases: ["clear diction"],
    emits: [
      {
        key: "clear_diction",
        label: "Clear Diction",
        value: "clear diction",
        semanticClass: "trait",
        domain: "articulation",
        priority: 2,
        intensity: 2,
        robustness: 4,
      },
    ],
  },

  {
    phrases: ["restrained"],
    emits: [
      {
        key: "restrained_delivery",
        label: "Restrained Delivery",
        value: "restrained delivery",
        semanticClass: "trait",
        domain: "delivery",
        priority: 2,
        intensity: 2,
        robustness: 5,
      },
    ],
  },

  {
    phrases: ["broken but elegant", "broken elegant"],
    emits: [
      {
        key: "fragile_core",
        label: "Fragile Core",
        value: "emotionally fragile core",
        semanticClass: "trait",
        domain: "core",
        priority: 3,
        intensity: 2,
        robustness: 4,
      },
      {
        key: "elegant_control",
        label: "Elegant Control",
        value: "elegant controlled delivery",
        semanticClass: "trait",
        domain: "delivery",
        priority: 2,
        intensity: 2,
        robustness: 3,
      },
    ],
  },

  {
    phrases: ["r&b", "modern r&b"],
    emits: [
      {
        key: "modern_rnb",
        label: "Modern R&B",
        value: "modern r&b",
        semanticClass: "trait",
        domain: "genre",
        priority: 2,
        intensity: 2,
        robustness: 5,
      },
    ],
  },

  {
    phrases: ["pop"],
    emits: [
      {
        key: "cinematic_pop",
        label: "Pop",
        value: "modern pop",
        semanticClass: "trait",
        domain: "genre",
        priority: 2,
        intensity: 2,
        robustness: 5,
      },
    ],
  },
];
