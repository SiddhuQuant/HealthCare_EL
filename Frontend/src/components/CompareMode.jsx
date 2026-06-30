import { useState } from 'react'
import { predictMolecule } from '../utils/api'
import { EXAMPLE_MOLECULES } from '../utils/api'
import ADMETRadar from './ADMETRadar'
import MoleculeViewer from './MoleculeViewer'

function MoleculeSlot({ slot, label, color, onResult, onSmiles }) {
  const [smiles, setSmiles] = useState(EXAMPLE_MOLECULES[slot === 'A' ? 0 : 2].smiles)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const predict = async () => {
    setLoading(true)
    setError(null)
    try {
      const r = await predictMolecule(smiles)
      setResult(r)
      onResult(r)
      onSmiles(smiles)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em',
        color, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8
      }}>
        <span style={{
          width: 20, height: 20, borderRadius: '50%',
          background: `${color}22`, border: `1px solid ${color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10
        }}>{label}</span>
        MOLECULE {label}
      </div>

      <textarea
        className="smiles-input"
        value={smiles}
        onChange={e => { setSmiles(e.target.value); setResult(null) }}
        placeholder="Enter SMILES..."
        style={{ minHeight: 60, marginBottom: 10 }}
      />

      {/* Quick picks */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {EXAMPLE_MOLECULES.slice(0, 4).map(m => (
          <button key={m.name} onClick={() => setSmiles(m.smiles)}
            style={{
              padding: '3px 10px', fontSize: 11, fontFamily: 'var(--mono)',
              background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6,
              color: 'var(--text2)', cursor: 'pointer',
            }}>
            {m.name}
          </button>
        ))}
      </div>

      <button onClick={predict} className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: color, boxShadow: `0 0 20px ${color}44` }} disabled={loading}>
        {loading ? 'Analyzing…' : `Analyze ${label}`}
      </button>

      {error && <div style={{ color: 'var(--red)', fontSize: 12, fontFamily: 'var(--mono)', marginTop: 8 }}>{error}</div>}

      {result && (
        <div style={{ marginTop: 16 }}>
          <MoleculeViewer smiles={smiles} />
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Object.entries(result.admet).map(([key, d]) => {
              const vc = d.verdict === 'pass' ? 'var(--green)' : d.verdict === 'warning' ? 'var(--amber)' : 'var(--red)'
              return (
                <div key={key} style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 12, fontFamily: 'var(--mono)', padding: '4px 0',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <span style={{ color: 'var(--text2)' }}>{d.name}</span>
                  <span style={{ color: vc }}>{(d.score * 100).toFixed(1)}% — {d.verdict.toUpperCase()}</span>
                </div>
              )
            })}
          </div>
          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <span className={`badge-${result.overall_verdict}`} style={{ fontSize: 12 }}>
              {result.overall_label}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CompareMode() {
  const [resultA, setResultA] = useState(null)
  const [resultB, setResultB] = useState(null)
  const [smilesA, setSmilesA] = useState('')
  const [smilesB, setSmilesB] = useState('')

  return (
    <section className="section" id="compare">
      <div className="container">
        <div style={{ marginBottom: 48 }}>
          <div className="section-eyebrow">Comparison Mode</div>
          <h2 className="section-title">
            Compare two<br/>
            <span style={{ color: 'var(--amber)' }}>molecules head-to-head</span>
          </h2>
          <p style={{ color: 'var(--text2)', marginTop: 12, fontSize: 14 }}>
            Analyze two drug candidates side-by-side across all ADMET properties.
          </p>
        </div>

        {/* Side by side inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
          <MoleculeSlot slot="A" label="A" color="var(--cyan)" onResult={setResultA} onSmiles={setSmilesA} />
          <MoleculeSlot slot="B" label="B" color="var(--amber)" onResult={setResultB} onSmiles={setSmilesB} />
        </div>

        {/* Combined radar */}
        {(resultA || resultB) && (
          <div className="card" style={{ padding: 32 }}>
            <div style={{
              fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em',
              color: 'var(--cyan)', marginBottom: 24
            }}>
              ADMET Profile Overlay — Radar Comparison
            </div>
            <ADMETRadar
              data={resultA?.admet}
              compareData={resultB?.admet}
              compareName="Molecule B"
            />

            {/* Delta table */}
            {resultA && resultB && (
              <div style={{ marginTop: 24, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'var(--mono)' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Property', 'Molecule A', 'Molecule B', 'Delta', 'Winner'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text3)', fontWeight: 500 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(resultA.admet).map(key => {
                      const a = resultA.admet[key]
                      const b = resultB.admet[key]
                      const delta = (a.score - b.score)
                      const winner = Math.abs(delta) < 0.03 ? 'Tie' : delta > 0 ? 'A' : 'B'
                      const wCol = winner === 'A' ? 'var(--cyan)' : winner === 'B' ? 'var(--amber)' : 'var(--text3)'
                      return (
                        <tr key={key} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '8px 12px', color: 'var(--text2)' }}>{a.name}</td>
                          <td style={{ padding: '8px 12px', color: 'var(--cyan)' }}>{(a.score*100).toFixed(1)}%</td>
                          <td style={{ padding: '8px 12px', color: 'var(--amber)' }}>{(b.score*100).toFixed(1)}%</td>
                          <td style={{ padding: '8px 12px', color: delta > 0 ? 'var(--green)' : 'var(--red)' }}>
                            {delta > 0 ? '+' : ''}{(delta*100).toFixed(1)}%
                          </td>
                          <td style={{ padding: '8px 12px', color: wCol, fontWeight: 600 }}>{winner}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
