import { useMemo, useState } from "react";
import { compileFromSelections } from "./app/adapters/compileFromSelections";
import { InstallAppButton } from "./app/components/InstallAppButton";
import { deriveCompilerState } from "./app/selectors/derivedCompilerState";
import {
  DEFAULT_EDITABLE_STATE,
  EditableVoxToolsState,
  EditableSectionDirective,
  EditableMultiVoiceRequest,
} from "./app/state/editableState";

const PRESETS: Record<string, Partial<EditableVoxToolsState>> = {
  basic: {
    genre: "modern_rnb",
    role: "male lead",
    surface: "light breathy surface",
    core: "firm centered delivery",
    delivery: "conversational",
    motion: "gradual_rise",
    production: ["close_mic"],
    sections: [{ section: "chorus", directive: "localized harmonies in chorus only", canonicalKey: "lead_harmony_localized" }],
    hardRules: [{ canonicalKey: "no_falsetto", text: "no falsetto" }],
  },
  conflict: {
    genre: "cinematic pop",
    role: "female lead",
    surface: "intimate",
    core: "huge",
    delivery: "conversational",
    motion: "cinematic",
    production: ["close_mic", "wide bloom"],
    sections: [{ section: "chorus", directive: "belt lift only in chorus", canonicalKey: "belt_driven" }],
  },
  multivoice: {
    genre: "modern pop",
    role: "male lead",
    delivery: "conversational",
    motion: "cinematic",
    sections: [{ section: "chorus", directive: "group response after lead line", canonicalKey: "lead_chorus_response_local" }],
    multiVoiceRequest: { pattern: "lead_chorus_response" },
  },
};

function cloneDefault(): EditableVoxToolsState {
  return {
    ...DEFAULT_EDITABLE_STATE,
    production: [...DEFAULT_EDITABLE_STATE.production],
    sections: [...DEFAULT_EDITABLE_STATE.sections],
    hardRules: [...DEFAULT_EDITABLE_STATE.hardRules],
    archetypes: [...DEFAULT_EDITABLE_STATE.archetypes],
  };
}

function applyPreset(name: keyof typeof PRESETS): EditableVoxToolsState {
  const base = cloneDefault();
  const preset = PRESETS[name];
  return {
    ...base,
    ...preset,
    production: [...(preset.production ?? [])],
    sections: [...(preset.sections ?? [])],
    hardRules: [...(preset.hardRules ?? [])],
    archetypes: [...(preset.archetypes ?? [])],
    multiVoiceRequest: preset.multiVoiceRequest ?? null,
  };
}

function sectionLine(section: EditableSectionDirective): string {
  return `${section.section}${section.label ? `:${section.label}` : ""} -> ${section.directive}`;
}

export default function App() {
  const [state, setState] = useState<EditableVoxToolsState>(() => applyPreset("basic"));

  const result = useMemo(() => compileFromSelections(state), [state]);
  const derived = deriveCompilerState(result);

  const update = <K extends keyof EditableVoxToolsState>(key: K, value: EditableVoxToolsState[K]) => {
    setState((current) => ({ ...current, [key]: value }));
  };

  const setPreset = (name: keyof typeof PRESETS) => setState(applyPreset(name));

  const setSectionDirective = (directive: string) => {
    const sections: EditableSectionDirective[] = directive.trim()
      ? [{ section: "chorus", directive: directive.trim(), canonicalKey: directive.trim().toLowerCase().replace(/\s+/g, "_") }]
      : [];
    update("sections", sections);
  };

  const setMultiVoice = (pattern: EditableMultiVoiceRequest["pattern"] | "none") => {
    update("multiVoiceRequest", pattern === "none" ? null : { pattern });
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">VoxTools</p>
          <h1>Deployable Vite shell for the Suno compiler spine</h1>
          <p className="lede">
            This is a minimal React/Vite shell wired to the existing compiler pipeline so Netlify can build
            something real instead of choking on abstract virtue.
          </p>
        </div>
        <div className="hero-actions">
          <InstallAppButton className="primary-button" />
        </div>
      </header>

      <main className="grid">
        <section className="card controls">
          <h2>Editable input</h2>
          <div className="preset-row">
            <button onClick={() => setPreset("basic")}>Basic</button>
            <button onClick={() => setPreset("conflict")}>Conflict</button>
            <button onClick={() => setPreset("multivoice")}>Multi-voice</button>
          </div>

          <label>
            Genre
            <input value={state.genre ?? ""} onChange={(e) => update("genre", e.target.value || undefined)} />
          </label>
          <label>
            Role
            <input value={state.role ?? ""} onChange={(e) => update("role", e.target.value || undefined)} />
          </label>
          <label>
            Surface
            <input value={state.surface ?? ""} onChange={(e) => update("surface", e.target.value || undefined)} />
          </label>
          <label>
            Core
            <input value={state.core ?? ""} onChange={(e) => update("core", e.target.value || undefined)} />
          </label>
          <label>
            Delivery
            <input value={state.delivery ?? ""} onChange={(e) => update("delivery", e.target.value || undefined)} />
          </label>
          <label>
            Motion
            <input value={state.motion ?? ""} onChange={(e) => update("motion", e.target.value || undefined)} />
          </label>
          <label>
            Production cues (comma-separated)
            <input
              value={state.production.join(", ")}
              onChange={(e) =>
                update(
                  "production",
                  e.target.value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                )
              }
            />
          </label>
          <label>
            Chorus directive
            <input
              value={state.sections[0]?.directive ?? ""}
              onChange={(e) => setSectionDirective(e.target.value)}
            />
          </label>
          <label>
            Multi-voice policy
            <select
              value={state.multiVoiceRequest?.pattern ?? "none"}
              onChange={(e) => setMultiVoice(e.target.value as EditableMultiVoiceRequest["pattern"] | "none")}
            >
              <option value="none">none</option>
              <option value="lead_harmony">lead_harmony</option>
              <option value="lead_chorus_response">lead_chorus_response</option>
              <option value="alternated_sectional">alternated_sectional</option>
              <option value="call_response">call_response</option>
              <option value="simultaneous_duet">simultaneous_duet</option>
            </select>
          </label>
        </section>

        <section className="card outputs">
          <h2>Compiler output</h2>
          {!result.ok && (
            <div className="warning-box">
              <strong>Verifier blocked the pipeline.</strong>
              <ul>
                {result.verification.issues.map((issue) => (
                  <li key={`${issue.code}-${issue.message}`}>{issue.code}: {issue.message}</li>
                ))}
              </ul>
            </div>
          )}

          {derived && (
            <>
              <div className="output-block">
                <h3>strict_prompt</h3>
                <pre>{derived.strict_prompt}</pre>
              </div>
              <div className="output-block">
                <h3>compressed_prompt</h3>
                <pre>{derived.compressed_prompt}</pre>
              </div>
              <div className="output-block">
                <h3>fallback_prompt</h3>
                <pre>{derived.fallback_prompt}</pre>
              </div>
              <div className="output-block">
                <h3>sectioned_prompt_payload</h3>
                <pre>{JSON.stringify(derived.sectioned_prompt_payload, null, 2)}</pre>
              </div>
              <div className="output-block two-col">
                <div>
                  <h3>warnings</h3>
                  <ul>
                    {derived.warnings.length === 0 ? <li>none</li> : derived.warnings.map((warning) => (
                      <li key={`${warning.code}-${warning.message}`}>{warning.code}: {warning.message}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>compile_summary</h3>
                  <pre>{JSON.stringify(derived.compile_summary, null, 2)}</pre>
                </div>
              </div>
              <div className="output-block">
                <h3>compileTrace</h3>
                <pre>{JSON.stringify(derived.compileTrace, null, 2)}</pre>
              </div>
            </>
          )}
        </section>

        <section className="card small-card">
          <h2>Current editable state</h2>
          <ul className="plain-list">
            <li>genre: {state.genre ?? "-"}</li>
            <li>role: {state.role ?? "-"}</li>
            <li>surface: {state.surface ?? "-"}</li>
            <li>core: {state.core ?? "-"}</li>
            <li>delivery: {state.delivery ?? "-"}</li>
            <li>motion: {state.motion ?? "-"}</li>
            <li>production: {state.production.join(", ") || "-"}</li>
            <li>sections: {state.sections.map(sectionLine).join(" | ") || "-"}</li>
            <li>multiVoice: {state.multiVoiceRequest?.pattern ?? "none"}</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
