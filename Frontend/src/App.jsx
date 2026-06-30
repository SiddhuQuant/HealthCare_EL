import { useState, useRef, useCallback, useEffect } from 'react'
import { predictMolecule, validateSmiles, EXAMPLE_MOLECULES } from './utils/api'
import MoleculeBackground from './components/MoleculeBackground'
import MoleculeViewer from './components/MoleculeViewer'
import ADMETRadar from './components/ADMETRadar'
import ADMETCards from './components/ADMETCards'
import DrugLikenessPanel from './components/DrugLikenessPanel'
import VerdictBanner from './components/VerdictBanner'
import HowItWorks from './components/HowItWorks'
import WhyADMET from './components/WhyADMET'
import CompareMode from './components/CompareMode'

// ── Navbar ────────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <nav style={{ boxShadow: scrolled ? '0 1px 30px rgba(0,0,0,0.5)' : 'none' }}>
      <div className="nav-logo">ADMET<span>·</span>AI</div>
      <ul className="nav-links">
        {[['#analyze','Analyze'],['#why','Why ADMET'],['#how','Pipeline'],['#compare','Compare']].map(([h,l]) => (
          <li key={h}><a href={h}>{l}</a></li>
        ))}
      </ul>
      <a href="#analyze" className="btn-primary" style={{ padding: '8px 20px', fontSize: 12 }}>
        Try Demo
      </a>
    </nav>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero({ onAnalyze }) {
  return (
    <section style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      position: 'relative', overflow: 'hidden', paddingTop: 80,
    }}>
      <MoleculeBackground />

      {/* Horizontal scan line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, var(--cyan) 50%, transparent 100%)',
        opacity: 0.15,
        animation: 'scan 8s linear infinite',
      }} />

      {/* Grid */}
      <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />

      <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        {/* Eyebrow */}
        <div className="animate-fade-up" style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '6px 16px', borderRadius: 100,
          background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)',
          marginBottom: 32,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: 'var(--green)',
            boxShadow: '0 0 8px var(--green)',
            animation: 'pulse-glow 2s ease-in-out infinite',
            display: 'inline-block',
          }} />
          <span className="font-mono" style={{ fontSize: 11, color: 'var(--cyan)', letterSpacing: '0.1em' }}>
            AI-POWERED MOLECULAR INTELLIGENCE
          </span>
        </div>

        {/* Title */}
        <h1 className="animate-fade-up delay-100" style={{
          fontFamily: 'var(--display)', fontSize: 'clamp(48px, 8vw, 96px)',
          fontWeight: 800, lineHeight: 1.0, letterSpacing: '-0.03em',
          marginBottom: 28, opacity: 0,
        }}>
          ADMET<br/>
          <span style={{
            background: 'linear-gradient(135deg, var(--cyan) 0%, var(--purple) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Screening
          </span><br/>
          Platform
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-up delay-200" style={{
          color: 'var(--text2)', fontSize: 18, maxWidth: 560, margin: '0 auto 48px',
          lineHeight: 1.7, opacity: 0,
        }}>
          Virtual drug candidate filtering before wet-lab testing.
          Predict absorption, distribution, metabolism, excretion & toxicity
          from molecular structure using deep learning.
        </p>

        {/* CTA Buttons */}
        <div className="animate-fade-up delay-300" style={{
          display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', opacity: 0,
        }}>
          <button onClick={onAnalyze} className="btn-primary" style={{ fontSize: 15, padding: '14px 36px' }}>
            Analyze Molecule →
          </button>
          <a href="#why" className="btn-ghost" style={{ fontSize: 15, padding: '14px 36px' }}>
            Learn More
          </a>
        </div>

        {/* Mini stats */}
        <div className="animate-fade-up delay-400" style={{
          display: 'flex', gap: 48, justifyContent: 'center', marginTop: 72,
          flexWrap: 'wrap', opacity: 0,
        }}>
          {[
            { v: '5', u: 'ADMET properties', c: 'var(--cyan)' },
            { v: '2048', u: 'Morgan fingerprint bits', c: 'var(--purple)' },
            { v: '4', u: 'neural network heads', c: 'var(--green)' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--display)', fontSize: 36, fontWeight: 800,
                color: s.c, lineHeight: 1,
              }}>{s.v}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
                {s.u}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom gradient */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
        background: 'linear-gradient(transparent, var(--bg))',
        pointerEvents: 'none',
      }} />
    </section>
  )
}

// ── Molecule Input Panel ──────────────────────────────────────────────────────
function InputPanel({ smiles, setSmiles, onPredict, loading, validState }) {
  const [showExamples, setShowExamples] = useState(false)

  return (
    <div className="card" style={{ padding: 28 }}>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em',
        color: 'var(--cyan)', marginBottom: 16, opacity: 0.8, textTransform: 'uppercase',
      }}>
        Molecular Structure Input
      </div>

      {/* SMILES textarea */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <textarea
          className={`smiles-input ${validState}`}
          value={smiles}
          onChange={e => setSmiles(e.target.value)}
          placeholder="Enter SMILES string e.g. CC(=O)Oc1ccccc1C(=O)O"
          rows={3}
        />
        {validState && (
          <div style={{
            position: 'absolute', right: 12, top: 12,
            fontFamily: 'var(--mono)', fontSize: 11,
            color: validState === 'valid' ? 'var(--green)' : 'var(--red)',
          }}>
            {validState === 'valid' ? '✓ Valid SMILES' : '✗ Invalid'}
          </div>
        )}
      </div>

      {/* Example molecules */}
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => setShowExamples(v => !v)}
          style={{
            background: 'none', border: 'none', color: 'var(--cyan)',
            fontSize: 12, fontFamily: 'var(--mono)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          {showExamples ? '▲' : '▼'} Example molecules
        </button>

        {showExamples && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 8, marginTop: 10,
          }}>
            {EXAMPLE_MOLECULES.map(m => (
              <button
                key={m.name}
                onClick={() => { setSmiles(m.smiles); setShowExamples(false) }}
                style={{
                  padding: '8px 12px', background: 'var(--bg3)',
                  border: '1px solid var(--border)', borderRadius: 8,
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--cyan)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ fontFamily: 'var(--display)', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                  {m.name}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)' }}>
                  {m.desc}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Predict button */}
      <button
        onClick={onPredict}
        className="btn-primary"
        disabled={loading || !smiles.trim()}
        style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '14px', opacity: loading ? 0.7 : 1 }}
      >
        {loading ? (
          <>
            <span style={{ display: 'inline-block', animation: 'spin-slow 1s linear infinite', fontSize: 16 }}>◎</span>
            Analyzing molecular structure…
          </>
        ) : (
          '⬡  Predict ADMET Properties'
        )}
      </button>
    </div>
  )
}

// ── Full analysis section ─────────────────────────────────────────────────────
export default function App() {
  const analyzeRef = useRef(null)
  const [smiles, setSmiles]       = useState('CC(=O)Oc1ccccc1C(=O)O')
  const [result, setResult]       = useState(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const [validState, setValid]    = useState('')
  const [activeTab, setActiveTab] = useState('radar')

  // Debounced validation
  useEffect(() => {
    if (!smiles.trim()) { setValid(''); return }
    const t = setTimeout(async () => {
      try {
        const v = await validateSmiles(smiles)
        setValid(v.valid ? 'valid' : 'invalid')
      } catch { setValid('') }
    }, 600)
    return () => clearTimeout(t)
  }, [smiles])

  const predict = useCallback(async () => {
    if (!smiles.trim()) return
    setLoading(true)
    setError(null)
    try {
      const r = await predictMolecule(smiles)
      setResult(r)
      setActiveTab('radar')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [smiles])

  const scrollToAnalyze = () => analyzeRef.current?.scrollIntoView({ behavior: 'smooth' })

  return (
    <>
      <Nav />
      <Hero onAnalyze={scrollToAnalyze} />

      {/* ── Why ADMET + Applications ── */}
      <div id="why"><WhyADMET /></div>

      {/* ── How it Works ── */}
      <div id="how"><HowItWorks /></div>

      {/* ── Analyze Section ── */}
      <section id="analyze" ref={analyzeRef} className="section" style={{ background: 'var(--bg1)' }}>
        <div className="container-wide">
          <div style={{ marginBottom: 48 }}>
            <div className="section-eyebrow">Molecular Analysis</div>
            <h2 className="section-title">
              Analyze your<br/>
              <span style={{ color: 'var(--cyan)' }}>drug candidate</span>
            </h2>
            <p style={{ color: 'var(--text2)', marginTop: 12, fontSize: 14 }}>
              Enter any SMILES string and receive a full ADMET profile in seconds.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'start' }}>
            {/* Left: input + molecule viewer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <InputPanel
                smiles={smiles}
                setSmiles={setSmiles}
                onPredict={predict}
                loading={loading}
                validState={validState}
              />

              {/* Molecule Viewer */}
              <div className="card" style={{ padding: 16 }}>
                <div style={{
                  fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em',
                  color: 'var(--cyan)', marginBottom: 12, opacity: 0.8, textTransform: 'uppercase',
                }}>
                  2D Structure Render
                </div>
                <MoleculeViewer smiles={smiles} />
                <div style={{
                  fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)',
                  marginTop: 8, wordBreak: 'break-all',
                }}>
                  {smiles || '—'}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  background: 'var(--red2)', border: '1px solid rgba(255,64,96,0.3)',
                  borderRadius: 12, padding: '14px 16px',
                  fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--red)',
                }}>
                  ✗ {error}
                </div>
              )}
            </div>

            {/* Right: results */}
            <div>
              {!result && !loading && (
                <div style={{
                  height: 400, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 13,
                  border: '1px dashed var(--border)', borderRadius: 16, gap: 12,
                }}>
                  <div style={{ fontSize: 40, opacity: 0.3 }}>⬡</div>
                  Enter a SMILES string and click Predict
                </div>
              )}

              {loading && (
                <div style={{
                  height: 400, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 20,
                }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: '50%',
                    border: '2px solid var(--border)',
                    borderTop: '2px solid var(--cyan)',
                    animation: 'spin-slow 0.8s linear infinite',
                  }} />
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text2)' }}>
                    Computing ADMET properties…
                  </div>
                </div>
              )}

              {result && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                  {/* Verdict banner */}
                  <VerdictBanner result={result} />

                  {/* Tab switcher */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[['radar','Radar Chart'],['cards','ADMET Cards'],['drug','Drug-Likeness']].map(([id, label]) => (
                      <button key={id} className={`tab-btn ${activeTab === id ? 'active' : ''}`}
                        onClick={() => setActiveTab(id)}>
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Radar tab */}
                  {activeTab === 'radar' && (
                    <div className="card" style={{ padding: 24 }}>
                      <div style={{
                        fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em',
                        color: 'var(--cyan)', marginBottom: 4, opacity: 0.8
                      }}>
                        ADMET MOLECULAR FINGERPRINT PROFILE
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16, fontFamily: 'var(--mono)' }}>
                        Radar axes represent normalised 0-1 scores per ADMET property
                      </p>
                      <ADMETRadar data={result.admet} />
                    </div>
                  )}

                  {/* Cards tab */}
                  {activeTab === 'cards' && (
                    <ADMETCards admet={result.admet} />
                  )}

                  {/* Drug-likeness tab */}
                  {activeTab === 'drug' && (
                    <DrugLikenessPanel drugLikeness={result.drug_likeness} />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Comparison Mode ── */}
      <CompareMode />

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '40px 40px', textAlign: 'center',
        fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)',
      }}>
        <div style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 700, color: 'var(--cyan)', marginBottom: 8 }}>
          ADMET·AI
        </div>
        <p>AI-Powered ADMET Screening Platform — Multi-Task Neural Network on Morgan Fingerprints</p>
        <p style={{ marginTop: 4 }}>
          FastAPI · PyTorch · RDKit · React · Recharts
        </p>
      </footer>
    </>
  )
}
