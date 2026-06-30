import { useState, useEffect } from 'react'

const PROP_META = {
  ESOL:          { label: 'Absorption',    icon: '◎', sub: 'ESOL Solubility',      axis: 'A' },
  BBBP:          { label: 'Distribution',  icon: '⬡', sub: 'Blood-Brain Barrier',  axis: 'D' },
  Lipophilicity: { label: 'Excretion',     icon: '◈', sub: 'Lipophilicity logD',   axis: 'E' },
  Tox21:         { label: 'Toxicity',      icon: '⚠', sub: 'Tox21 Nuclear Assay',  axis: 'T' },
}

function AnimatedScore({ target }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = 0
    const end = target
    const step = end / 40
    const interval = setInterval(() => {
      start += step
      if (start >= end) { setVal(end); clearInterval(interval) }
      else setVal(start)
    }, 20)
    return () => clearInterval(interval)
  }, [target])
  return <>{(val * 100).toFixed(1)}%</>
}

function ConfidenceDots({ level }) {
  const levels = { High: 3, Moderate: 2, Low: 1 }
  const filled = levels[level] || 1
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {[1,2,3].map(n => (
        <span key={n} style={{
          width: 6, height: 6, borderRadius: '50%',
          background: n <= filled ? 'var(--cyan)' : 'var(--bg3)',
          boxShadow: n <= filled ? '0 0 6px var(--cyan)' : 'none',
          transition: 'all 0.3s',
        }} />
      ))}
      <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)', marginLeft: 4 }}>
        {level}
      </span>
    </div>
  )
}

export default function ADMETCards({ admet }) {
  if (!admet) return null

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: 16,
    }}>
      {Object.entries(PROP_META).map(([key, meta]) => {
        const d = admet[key]
        if (!d) return null

        const verdict = d.verdict
        const col = verdict === 'pass' ? 'var(--green)' : verdict === 'warning' ? 'var(--amber)' : 'var(--red)'
        const bg  = verdict === 'pass' ? 'var(--green2)' : verdict === 'warning' ? 'var(--amber2)' : 'var(--red2)'

        return (
          <div key={key} className="card animate-fade-up" style={{
            padding: 20,
            borderColor: verdict === 'pass' ? 'rgba(0,255,136,0.15)' : verdict === 'warning' ? 'rgba(255,184,0,0.15)' : 'rgba(255,64,96,0.15)',
          }}>
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{
                  fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)',
                  letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4
                }}>
                  {meta.axis} — {meta.sub}
                </div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
                  {meta.label}
                </div>
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, color: col,
              }}>
                {meta.icon}
              </div>
            </div>

            {/* Score */}
            <div style={{
              fontFamily: 'var(--mono)', fontSize: 32, fontWeight: 500,
              color: col, lineHeight: 1, marginBottom: 12,
              textShadow: `0 0 20px ${col}66`,
            }}>
              <AnimatedScore target={d.score} />
            </div>

            {/* Progress bar */}
            <div className="progress-track" style={{ marginBottom: 12 }}>
              <div className="progress-fill" style={{
                width: `${d.score * 100}%`,
                background: `linear-gradient(90deg, ${col}88, ${col})`,
                boxShadow: `0 0 8px ${col}66`,
              }} />
            </div>

            {/* Status + confidence */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className={`badge-${verdict}`}>
                {verdict.toUpperCase()}
              </span>
              <ConfidenceDots level={d.confidence} />
            </div>

            {/* Label */}
            <div style={{
              marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)',
              fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text2)',
              lineHeight: 1.4,
            }}>
              {d.label}
            </div>
          </div>
        )
      })}
    </div>
  )
}
