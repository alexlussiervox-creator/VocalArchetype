import { CompilerIR } from "../contracts/packageTypes";
import { EditableVoxToolsState } from "../../app/state/editableState";

export interface RegressionFixture {
  name: string;
  input: EditableVoxToolsState;
  expected?: {
    warningCodes?: string[];
    removedCanonicalKeys?: string[];
    outputType?: "strict" | "compressed" | "fallback" | "sectioned";
    mustHaveSectional?: boolean;
  };
  notes?: string[];
}

export const exampleIRs: Record<string, CompilerIR> = {
  intimateHuge: {
    targetModel: "suno",
    nodes: [
      {
        id: "genre-1",
        canonicalKey: "modern_rnb",
        semanticClass: "trait",
        domain: "genre",
        text: "modern R&B",
        priority: "dominant",
        intensity: 65,
        robustness: "high",
        support: "direct",
      },
      {
        id: "role-1",
        canonicalKey: "male_lead",
        semanticClass: "trait",
        domain: "role",
        text: "male lead",
        priority: "dominant",
        intensity: 65,
        robustness: "high",
        support: "direct",
      },
      {
        id: "surface-1",
        canonicalKey: "intimate",
        semanticClass: "trait",
        domain: "surface",
        text: "intimate",
        priority: "dominant",
        intensity: 70,
        robustness: "high",
        support: "direct",
      },
      {
        id: "motion-1",
        canonicalKey: "huge",
        semanticClass: "trait",
        domain: "motion",
        text: "huge emotional rise",
        priority: "blended",
        intensity: 60,
        robustness: "medium",
        support: "approximate",
      },
    ],
  },
  fragileBelt: {
    targetModel: "suno",
    nodes: [
      {
        id: "surface-1",
        canonicalKey: "fragile",
        semanticClass: "trait",
        domain: "surface",
        text: "fragile",
        priority: "blended",
        intensity: 60,
        robustness: "medium",
        support: "direct",
      },
      {
        id: "core-1",
        canonicalKey: "belt_driven",
        semanticClass: "trait",
        domain: "core",
        text: "belt-driven",
        priority: "dominant",
        intensity: 80,
        robustness: "medium",
        support: "approximate",
      },
    ],
  },
};

export const regressionFixtures: RegressionFixture[] = [
  {
    name: "intimate + huge",
    input: {
      archetypes: [],
      intensity: 70,
      priority: "dominant",
      genre: "modern_rnb",
      role: "male_lead",
      surface: "intimate",
      motion: "huge",
      production: [],
      sections: [],
      hardRules: [],
      multiVoiceRequest: null,
    },
    expected: {
      warningCodes: ["CONFLICT_SECTIONALIZED"],
      mustHaveSectional: true,
      outputType: "sectioned",
    },
  },
  {
    name: "fragile + belt_lift",
    input: {
      archetypes: [],
      intensity: 80,
      priority: "dominant",
      surface: "fragile",
      core: "belt_driven",
      production: [],
      sections: [],
      hardRules: [],
      multiVoiceRequest: null,
    },
    expected: {
      warningCodes: ["CONFLICT_PRIORITIZED"],
      removedCanonicalKeys: ["fragile"],
      outputType: "strict",
    },
  },
  {
    name: "no_falsetto",
    input: {
      archetypes: [],
      intensity: 60,
      priority: "dominant",
      core: "belt_driven",
      production: [],
      sections: [],
      hardRules: [{ canonicalKey: "no_falsetto", text: "no falsetto" }],
      multiVoiceRequest: null,
    },
    expected: {
      warningCodes: ["HARD_RULE_TENSION"],
      outputType: "sectioned",
    },
  },
  {
    name: "call_response",
    input: {
      archetypes: [],
      intensity: 55,
      priority: "blended",
      role: "male_lead",
      production: [],
      sections: [{ section: "chorus", directive: "call and response", canonicalKey: "call_response" }],
      hardRules: [],
      multiVoiceRequest: { pattern: "call_response" },
    },
    expected: {
      warningCodes: ["MULTIVOICE_SPLIT_CONSIDER"],
      outputType: "sectioned",
      mustHaveSectional: true,
    },
  },
  {
    name: "chorus tighter than verse",
    input: {
      archetypes: [],
      intensity: 60,
      priority: "blended",
      delivery: "conversational",
      motion: "gradual_rise",
      production: [],
      sections: [
        { section: "chorus", directive: "chorus tighter than verse", canonicalKey: "chorus_tighter_than_verse" },
      ],
      hardRules: [],
      multiVoiceRequest: null,
    },
    expected: {
      outputType: "sectioned",
      mustHaveSectional: true,
    },
  },
];
