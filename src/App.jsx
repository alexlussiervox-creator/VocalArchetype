import { useMemo, useState } from 'react'
import { archetypes, artists, descriptors, promptTargets } from './data'

const defaultBuilder = {
  target: 'suno',
  primaryId: 'cinematic-surge',
  secondaryId: 'fragile-forward',
  modifierId: 'raspy-edge',
  intensity: 65,
  priority: 'blended',
}

const defaultSections = {
  builder: true,
  descriptors: false,
  artists: false,
  archetypes: false,
}

function Section({ title, open, onToggle, children }) {
  return (
    <section className="panel">
      <button className="panel-toggle" onClick={onToggle}>
        <span>{title}</span>
        <span>{open ? '−' : '+'}</span>
      </button>
      {open && <div className="panel-body">{children}</div>}
    </section>
  )
}

function formatPriority(priority) {
  if (priority === 'dominant') return 'Primary archetype dominates. Secondary and modifier stay subordinate.'
  if (priority === 'subtle') return 'Primary stays present, but supporting colors are intentionally light.'
  return 'Primary and secondary remain meaningfully blended, modifier stays light.'
}

function intensityNote(value) {
  if (value < 35) return 'kept restrained and understated'
  if (value < 70) return 'present but controlled'
  return 'clearly emphasized and more explicit'
}

function buildPrompt({ target, primaryId, secondaryId, modifierId, intensity, priority }) {
  const primary = archetypes.find((item) => item.id === primaryId)
  const secondary = archetypes.find((item) => item.id === secondaryId)
  const modifier = archetypes.find((item) => item.id === modifierId)

  const selected = [primary, secondary, modifier].filter(Boolean)
  const basePrompt = selected.map((item) => item.prompts[target]).join(', ')

  const parameterLines = [
    primary ? `Primary archetype: ${primary.label}.` : null,
    secondary ? `Secondary archetype: ${secondary.label}.` : null,
    modifier ? `Modifier archetype: ${modifier.label}.` : null,
    `Intensity: ${intensity}/100, ${intensityNote(intensity)}.`,
    `Priority logic: ${formatPriority(priority)}`,
    primary ? `Timbre focus: ${primary.parameters.timbre}.` : null,
    primary ? `Texture focus: ${primary.parameters.texture}.` : null,
    primary ? `Pressure and placement: ${primary.parameters.pressure}; ${primary.parameters.placement}.` : null,
    primary ? `Phrasing and dynamics: ${primary.parameters.phrasing}; ${primary.parameters.dynamics}.` : null,
    primary ? `Articulation and register behavior: ${primary.parameters.articulation}; ${primary.parameters.registerBehavior}.` : null,
  ].filter(Boolean)

  return `${basePrompt}. ${parameterLines.join(' ')}`
}

export default function App() {
  const [builder, setBuilder] = useState(defaultBuilder)
  const [sections, setSections] = useState(defaultSections)
  const [descriptorGroupsOpen, setDescriptorGroupsOpen] = useState(
    Object.fromEntries([...new Set(descriptors.map((item) => item.category))].map((category) => [category, false]))
  )

  const groupedDescriptors = useMemo(() => {
    return descriptors.reduce((accumulator, item) => {
      accumulator[item.category] = accumulator[item.category] || []
      accumulator[item.category].push(item)
      return accumulator
    }, {})
  }, [])

  const prompt = useMemo(() => buildPrompt(builder), [builder])

  const handleReset = () => {
    setBuilder(defaultBuilder)
    setSections(defaultSections)
    setDescriptorGroupsOpen(
      Object.fromEntries([...new Set(descriptors.map((item) => item.category))].map((category) => [category, false]))
    )
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Vocal identity engine</p>
          <h1>VoxTools</h1>
          <p className="hero-copy">
            Build machine-facing vocal prompts from descriptors, artist references, and contemporary vocal archetypes.
          </p>
        </div>
        <button className="reset-button" onClick={handleReset}>Reset</button>
      </header>

      <Section
        title="Prompt Builder"
        open={sections.builder}
        onToggle={() => setSections((state) => ({ ...state, builder: !state.builder }))}
      >
        <div className="builder-grid">
          <label>
            <span>Target</span>
            <select value={builder.target} onChange={(event) => setBuilder((state) => ({ ...state, target: event.target.value }))}>
              {promptTargets.map((target) => (
                <option key={target} value={target}>{target}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Primary archetype</span>
            <select value={builder.primaryId} onChange={(event) => setBuilder((state) => ({ ...state, primaryId: event.target.value }))}>
              {archetypes.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Secondary archetype</span>
            <select value={builder.secondaryId} onChange={(event) => setBuilder((state) => ({ ...state, secondaryId: event.target.value }))}>
              {archetypes.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Modifier archetype</span>
            <select value={builder.modifierId} onChange={(event) => setBuilder((state) => ({ ...state, modifierId: event.target.value }))}>
              {archetypes.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Intensity: {builder.intensity}</span>
            <input
              type="range"
              min="0"
              max="100"
              value={builder.intensity}
              onChange={(event) => setBuilder((state) => ({ ...state, intensity: Number(event.target.value) }))}
            />
          </label>

          <label>
            <span>Priority</span>
            <select value={builder.priority} onChange={(event) => setBuilder((state) => ({ ...state, priority: event.target.value }))}>
              <option value="dominant">Dominant</option>
              <option value="blended">Blended</option>
              <option value="subtle">Subtle support</option>
            </select>
          </label>
        </div>

        <div className="prompt-card">
          <div className="prompt-card-header">
            <h2>Generated prompt</h2>
            <button className="copy-button" onClick={() => navigator.clipboard.writeText(prompt)}>Copy</button>
          </div>
          <pre>{prompt}</pre>
        </div>
      </Section>

      <Section
        title="Descriptor Library"
        open={sections.descriptors}
        onToggle={() => setSections((state) => ({ ...state, descriptors: !state.descriptors }))}
      >
        <div className="stack-list">
          {Object.entries(groupedDescriptors).map(([category, items]) => (
            <div key={category} className="subpanel">
              <button
                className="subpanel-toggle"
                onClick={() => setDescriptorGroupsOpen((state) => ({ ...state, [category]: !state[category] }))}
              >
                <span>{category}</span>
                <span>{descriptorGroupsOpen[category] ? '−' : '+'}</span>
              </button>
              {descriptorGroupsOpen[category] && (
                <div className="descriptor-list">
                  {items.map((item) => (
                    <article key={item.id} className="card">
                      <h3>{item.label}</h3>
                      <p>{item.definition}</p>
                      <p><strong>Use:</strong> {item.usage_note}</p>
                      <p><strong>Caution:</strong> {item.caution}</p>
                      <p><strong>Refs:</strong> {item.artist_refs_primary.join(', ')} · {item.artist_refs_secondary.join(', ')}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Artist Profiles"
        open={sections.artists}
        onToggle={() => setSections((state) => ({ ...state, artists: !state.artists }))}
      >
        <div className="stack-list">
          {artists.map((artist) => (
            <article key={artist.artist_name} className="card">
              <h3>{artist.artist_name}</h3>
              <p>{artist.summary}</p>
              <p><strong>Descriptors:</strong> {artist.descriptor_ids.join(', ')}</p>
              <p><strong>Studio:</strong> {artist.prompts.studio}</p>
              <p><strong>Suno:</strong> {artist.prompts.suno}</p>
              <p><strong>Udio:</strong> {artist.prompts.udio}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section
        title="Vocal Archetypes"
        open={sections.archetypes}
        onToggle={() => setSections((state) => ({ ...state, archetypes: !state.archetypes }))}
      >
        <div className="stack-list">
          {archetypes.map((archetype) => (
            <article key={archetype.id} className="card">
              <h3>{archetype.label}</h3>
              <p>{archetype.definition}</p>
              <p><strong>Artist refs:</strong> {archetype.artist_refs.join(', ')}</p>
              <ul className="parameter-list">
                <li><strong>Timbre:</strong> {archetype.parameters.timbre}</li>
                <li><strong>Texture:</strong> {archetype.parameters.texture}</li>
                <li><strong>Pressure:</strong> {archetype.parameters.pressure}</li>
                <li><strong>Placement:</strong> {archetype.parameters.placement}</li>
                <li><strong>Phrasing:</strong> {archetype.parameters.phrasing}</li>
                <li><strong>Dynamics:</strong> {archetype.parameters.dynamics}</li>
                <li><strong>Articulation:</strong> {archetype.parameters.articulation}</li>
                <li><strong>Register behavior:</strong> {archetype.parameters.registerBehavior}</li>
              </ul>
            </article>
          ))}
        </div>
      </Section>
    </main>
  )
}
