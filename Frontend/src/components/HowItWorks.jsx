const STEPS = [
  {
    n: '01',
    title: 'SMILES Input',
    sub: 'Molecular Structure',
    desc: 'Drug candidate molecules entered as SMILES strings — a standard textual representation of chemical structures used across pharmaceutical informatics.',
    detail: 'CC(=O)Oc1ccccc1C(=O)O',
    tag: 'Input',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" stroke="var(--cyan)" strokeWidth="1" opacity="0.3"/>
        <circle cx="16" cy="16" r="6" fill="none" stroke="var(--cyan)" strokeWidth="1.5"/>
        <circle cx="8" cy="10" r="3" fill="var(--cyan)" opacity="0.7"/>
        <circle cx="24" cy="10" r="3" fill="var(--purple)" opacity="0.7"/>
        <circle cx="16" cy="26" r="3" fill="var(--red)" opacity="0.7"/>
        <line x1="8" y1="10" x2="13" y2="14" stroke="var(--cyan)" strokeWidth="1"/>
        <line x1="24" y1="10" x2="19" y2="14" stroke="var(--cyan)" strokeWidth="1"/>
        <line x1="16" y1="22" x2="16" y2="26" stroke="var(--cyan)" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    n: '02',
    title: 'Morgan Fingerprint',
    sub: 'RDKit Featurization',
    desc: 'RDKit converts the molecule into a 2048-bit Morgan fingerprint, capturing atomic neighborhoods and molecular topology at radius-2 resolution.',
    detail: '1010001101000110…  [2048 bits]',
    tag: 'Feature Engineering',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        {[0,1,2,3,4,5,6,7].map(i=>(
          <rect key={i} x={2+i*3.6} y={12} width={2.8} height={Math.random()*12+6}
            fill="var(--cyan)" opacity={0.4+i*0.07} rx="1"/>
        ))}
        <rect x="2" y="26" width="28" height="1" fill="var(--cyan)" opacity="0.2"/>
      </svg>
    ),
  },
  {
    n: '03',
    title: 'Neural Network',
    sub: 'Multi-Task Deep Learning',
    desc: 'A shared dense backbone learns molecular representations, while 4 separate prediction heads independently estimate ADMET properties.',
    detail: 'Shared → [ESOL | BBBP | LogD | Tox21]',
    tag: 'Inference',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        {[8,16,24].map((y,i)=>(
          <circle key={i} cx="6" cy={y} r="2.5" fill="var(--cyan)" opacity="0.7"/>
        ))}
        {[8,16,24].map((y,i)=>(
          <circle key={i} cx="16" cy={y} r="2.5" fill="var(--purple)" opacity="0.7"/>
        ))}
        {[8,14,20,26].map((y,i)=>(
          <circle key={i} cx="26" cy={y} r="2" fill="var(--green)" opacity="0.7"/>
        ))}
        {[8,16,24].flatMap((y1,i)=>
          [8,16,24].map((y2,j)=>(
            <line key={`${i}-${j}`} x1="8" y1={y1} x2="14" y2={y2}
              stroke="var(--cyan)" strokeWidth="0.5" opacity="0.2"/>
          ))
        )}
        {[8,16,24].flatMap((y1,i)=>
          [8,14,20,26].map((y2,j)=>(
            <line key={`${i}-${j}`} x1="18" y1={y1} x2="24" y2={y2}
              stroke="var(--purple)" strokeWidth="0.5" opacity="0.2"/>
          ))
        )}
      </svg>
    ),
  },
  {
    n: '04',
    title: 'ADMET Scoring',
    sub: 'Property Prediction',
    desc: 'Model outputs are mapped to ADMET properties with confidence levels and pass/warning/fail verdicts per pharmacological threshold.',
    detail: 'Absorption · Distribution · Excretion · Toxicity',
    tag: 'Output',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <polygon points="16,4 28,28 4,28" fill="none" stroke="var(--cyan)" strokeWidth="1" opacity="0.3"/>
        <circle cx="16" cy="16" r="1.5" fill="var(--cyan)"/>
        {[0,1,2,3,4].map(i=>{
          const a = (i/5)*Math.PI*2 - Math.PI/2
          const r = 10 * [0.9,0.7,0.85,0.6,0.8][i]
          return <line key={i} x1="16" y1="16" x2={16+Math.cos(a)*r} y2={16+Math.sin(a)*r}
            stroke="var(--cyan)" strokeWidth="1.5" opacity="0.6"/>
        })}
      </svg>
    ),
  },
  {
    n: '05',
    title: 'Drug-Likeness',
    sub: 'Lipinski Ro5 + QED',
    desc: 'RDKit computes molecular descriptors: MW, LogP, HBD/HBA, TPSA, QED. The Lipinski Rule of Five validates oral bioavailability.',
    detail: 'MW ≤ 500  ·  LogP ≤ 5  ·  HBD ≤ 5  ·  HBA ≤ 10',
    tag: 'Cheminformatics',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        {[0,1,2,3].map(i=>(
          <g key={i}>
            <rect x="4" y={6+i*6} width="14" height="4" rx="2"
              fill="var(--green)" opacity={0.15+i*0.1}/>
            <rect x="4" y={6+i*6} width={[10,14,8,12][i]} height="4" rx="2"
              fill="var(--green)" opacity={0.5}/>
          </g>
        ))}
        <circle cx="25" cy="16" r="6" fill="none" stroke="var(--green)" strokeWidth="1.5" opacity="0.5"/>
        <text x="25" y="20" textAnchor="middle" fontSize="8" fill="var(--green)" fontFamily="monospace">✓</text>
      </svg>
    ),
  },
  {
    n: '06',
    title: 'Candidate Verdict',
    sub: 'Executive Decision',
    desc: 'All signals are aggregated into a final pass/warning/fail verdict with confidence indicators — enabling rapid candidate triage.',
    detail: 'Promising Candidate  ·  Requires Optimization  ·  Reject',
    tag: 'Decision',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="13" fill="none" stroke="var(--cyan)" strokeWidth="1" opacity="0.3"/>
        <circle cx="16" cy="16" r="8" fill="none" stroke="var(--cyan)" strokeWidth="1.5" opacity="0.5"/>
        <circle cx="16" cy="16" r="3" fill="var(--cyan)" opacity="0.9"/>
        <circle cx="16" cy="16" r="13" fill="none" stroke="var(--cyan)" strokeWidth="1" opacity="0.1"
          style={{ animation: 'ripple 2s ease-out infinite' }}/>
      </svg>
    ),
  },
]

export default function HowItWorks() {
  return (
    <section className="section" style={{ background: 'var(--bg1)', position: 'relative' }}>
      <div className="grid-bg" style={{ position:'absolute', inset:0, opacity:0.5 }}/>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>

        <div style={{ marginBottom: 60 }}>
          <div className="section-eyebrow">AI Pipeline</div>
          <h2 className="section-title">How the prediction<br/>
            <span style={{ color: 'var(--cyan)' }}>pipeline works</span>
          </h2>
          <p style={{ color: 'var(--text2)', marginTop: 16, maxWidth: 560, fontSize: 15 }}>
            From a single SMILES string to a full pharmacological profile in milliseconds.
            Six stages, one unified neural architecture.
          </p>
        </div>

        {/* Pipeline steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {STEPS.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 0, alignItems: 'stretch' }}>

              {/* Left: number + line */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 60, flexShrink: 0 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'var(--bg3)', border: '1px solid var(--border2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--cyan)', fontWeight: 500,
                  flexShrink: 0,
                }}>
                  {step.n}
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{
                    width: 1, flex: 1, minHeight: 24,
                    background: 'linear-gradient(180deg, var(--cyan) 0%, transparent 100%)',
                    opacity: 0.2, margin: '4px 0',
                  }} />
                )}
              </div>

              {/* Right: content */}
              <div className="card" style={{
                flex: 1, marginLeft: 16, marginBottom: 8,
                padding: '20px 24px',
                display: 'grid', gridTemplateColumns: '1fr auto',
                gap: 16, alignItems: 'start',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{
                      fontFamily: 'var(--mono)', fontSize: 10, padding: '2px 8px',
                      background: 'var(--cyan3)', color: 'var(--cyan)',
                      border: '1px solid rgba(0,212,255,0.2)', borderRadius: 4,
                    }}>{step.tag}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--display)', fontSize: 17, fontWeight: 700, marginBottom: 2 }}>
                    {step.title}
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', fontWeight: 400, marginLeft: 10 }}>
                      {step.sub}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>
                    {step.desc}
                  </p>
                  <div style={{
                    fontFamily: 'var(--mono)', fontSize: 12,
                    color: 'var(--cyan)', opacity: 0.7,
                    background: 'var(--bg3)', padding: '6px 12px', borderRadius: 6,
                    display: 'inline-block',
                  }}>
                    {step.detail}
                  </div>
                </div>
                <div style={{ opacity: 0.8 }}>{step.icon}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
