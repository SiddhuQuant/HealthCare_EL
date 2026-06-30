import { useEffect, useState } from 'react'

export default function VerdictBanner({ result }) {
  const [show, setShow] = useState(false)
  useEffect(() => { if (result) setTimeout(() => setShow(true), 200) }, [result])

  if (!result) return null

  const v = result.overall_verdict
  const col = v === 'pass' ? 'var(--green)' : v === 'warning' ? 'var(--amber)' : 'var(--red)'
  const bg  = v === 'pass' ? 'rgba(0,255,136,0.05)' : v === 'warning' ? 'rgba(255,184,0,0.05)' : 'rgba(255,64,96,0.05)'
  const bdr = v === 'pass' ? 'rgba(0,255,136,0.2)' : v === 'warning' ? 'rgba(255,184,0,0.2)' : 'rgba(255,64,96,0.2)'

  const passCount = result.pass_count
  const total = result.total_heads

  return (
    <div style={{
      background: bg, border: `1px solid ${bdr}`,
      borderRadius: 20, padding: '32px 40px',
      textAlign: 'center',
      opacity: show ? 1 : 0,
      transform: show ? 'scale(1)' : 'scale(0.97)',
      transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Ripple effect */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at 50% 50%, ${col}08 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Icon */}
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: bg, border: `2px solid ${bdr}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28, margin: '0 auto 20px',
        boxShadow: `0 0 30px ${col}33`,
        animation: 'pulse-glow 2s ease-in-out infinite',
      }}>
        {v === 'pass' ? '◎' : v === 'warning' ? '◇' : '◆'}
      </div>

      {/* Title */}
      <div style={{
        fontFamily: 'var(--display)', fontSize: 28, fontWeight: 800,
        color: col, marginBottom: 8, letterSpacing: '-0.02em',
        textShadow: `0 0 40px ${col}66`,
      }}>
        {result.overall_label}
      </div>

      {/* Sub */}
      <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text2)', marginBottom: 24 }}>
        {passCount} of {total} ADMET properties within acceptable range
      </div>

      {/* Score strip */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        {Object.entries(result.admet).map(([key, d]) => {
          const c = d.verdict === 'pass' ? 'var(--green)' : d.verdict === 'warning' ? 'var(--amber)' : 'var(--red)'
          return (
            <div key={key} style={{
              padding: '6px 16px', borderRadius: 8,
              background: `${c}11`, border: `1px solid ${c}33`,
              fontFamily: 'var(--mono)', fontSize: 11,
            }}>
              <span style={{ color: 'var(--text2)' }}>{d.name} </span>
              <span style={{ color: c }}>{d.verdict.toUpperCase()}</span>
            </div>
          )
        })}
      </div>

      {/* Lipinski summary */}
      {result.drug_likeness?.lipinski && (
        <div style={{
          marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)',
          fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text2)',
        }}>
          Lipinski Ro5: {' '}
          <span style={{ color: result.drug_likeness.lipinski.pass ? 'var(--green)' : 'var(--red)' }}>
            {result.drug_likeness.lipinski.summary}
          </span>
          {' · '} QED: {' '}
          <span style={{ color: 'var(--cyan)' }}>{result.drug_likeness.qed?.toFixed(3)}</span>
        </div>
      )}
    </div>
  )
}
