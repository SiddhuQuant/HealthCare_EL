const STATS = [
  { value: '90%', label: 'Drug candidates fail in development', color: 'var(--red)' },
  { value: '$2.6B', label: 'Average cost to bring one drug to market', color: 'var(--amber)' },
  { value: '12yr', label: 'Average development timeline', color: 'var(--purple)' },
  { value: '10×', label: 'Cost reduction with early AI screening', color: 'var(--green)' },
]

const APPS = [
  {
    icon: '⬡',
    color: 'var(--cyan)',
    bg: 'var(--cyan3)',
    title: 'Virtual Drug Candidate Screening',
    desc: 'Rapidly evaluate thousands of candidate molecules using AI before moving to costly wet-lab experiments. Filter low-quality compounds computationally.',
    metric: '~10,000 molecules/hr',
    metricLabel: 'screening throughput',
    tag: 'Primary Use Case',
  },
  {
    icon: '◎',
    color: 'var(--red)',
    bg: 'var(--red2)',
    title: 'Early Toxicity Detection',
    desc: 'Predict toxic or unsafe compounds before clinical testing, reducing risk in pharmaceutical development and protecting trial participants.',
    metric: '75%+',
    metricLabel: 'toxicity recall rate',
    tag: 'Safety',
  },
  {
    icon: '◈',
    color: 'var(--green)',
    bg: 'var(--green2)',
    title: 'Accelerated Drug Discovery',
    desc: 'AI-driven screening significantly reduces the time required to identify promising therapeutic molecules from years to weeks.',
    metric: '3–5×',
    metricLabel: 'faster hit identification',
    tag: 'Speed',
  },
  {
    icon: '◇',
    color: 'var(--amber)',
    bg: 'var(--amber2)',
    title: 'Reducing Wet-Lab Costs',
    desc: 'Filter low-quality molecules computationally before expensive laboratory synthesis and testing. Only the best candidates reach the bench.',
    metric: '60%',
    metricLabel: 'cost reduction potential',
    tag: 'Economics',
  },
]

const PIPELINE = [
  { label: 'Candidate Molecule', sub: 'SMILES / SDF input' },
  { label: 'AI ADMET Screening', sub: 'Multi-task neural network' },
  { label: 'Filter Unsafe Compounds', sub: 'Toxicity · Solubility · Metabolism' },
  { label: 'Reduce Wet-Lab Costs', sub: 'Only top candidates synthesized' },
  { label: 'Accelerate Discovery', sub: 'Weeks vs. years' },
]

export default function WhyADMET() {
  return (
    <>
      {/* ── Why this platform exists ── */}
      <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: -200, right: -200,
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            <div>
              <div className="section-eyebrow">The Problem</div>
              <h2 className="section-title" style={{ marginBottom: 24 }}>
                Why ADMET<br/>
                <span style={{ color: 'var(--red)' }}>screening matters</span>
              </h2>
              <p style={{ color: 'var(--text2)', fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
                Over <strong style={{ color: 'var(--red)' }}>90% of drug candidates fail</strong> during development
                due to toxicity, poor absorption, or metabolic instability — most of these failures are
                predictable from molecular structure alone.
              </p>
              <p style={{ color: 'var(--text2)', fontSize: 15, lineHeight: 1.8 }}>
                This platform uses AI-powered molecular analysis to identify high-risk compounds
                before expensive laboratory testing, dramatically reducing time and cost in
                the drug discovery pipeline.
              </p>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {STATS.map((s, i) => (
                <div key={i} className="card" style={{ padding: 24, textAlign: 'center' }}>
                  <div style={{
                    fontFamily: 'var(--display)', fontSize: 36, fontWeight: 800,
                    color: s.color, lineHeight: 1, marginBottom: 8,
                    textShadow: `0 0 30px ${s.color}44`,
                  }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.4 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Discovery pipeline visual */}
          <div style={{ marginTop: 80 }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 0, flexWrap: 'wrap',
            }}>
              {PIPELINE.map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    padding: '12px 20px', borderRadius: 10,
                    background: i === 1 ? 'rgba(0,212,255,0.08)' : 'var(--surface)',
                    border: `1px solid ${i === 1 ? 'rgba(0,212,255,0.25)' : 'var(--border)'}`,
                    textAlign: 'center', minWidth: 140,
                  }}>
                    <div style={{
                      fontFamily: 'var(--display)', fontSize: 13, fontWeight: 600,
                      color: i === 1 ? 'var(--cyan)' : 'var(--text)', marginBottom: 3,
                    }}>
                      {step.label}
                    </div>
                    <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>
                      {step.sub}
                    </div>
                  </div>
                  {i < PIPELINE.length - 1 && (
                    <div style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      color: 'var(--cyan)', opacity: 0.4, padding: '0 6px', fontSize: 14,
                    }}>
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Applications ── */}
      <section className="section" style={{ background: 'var(--bg1)' }}>
        <div className="container">
          <div style={{ marginBottom: 60 }}>
            <div className="section-eyebrow">Applications</div>
            <h2 className="section-title">
              Real-world<br/>
              <span style={{ color: 'var(--cyan)' }}>use cases</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {APPS.map((app, i) => (
              <div key={i} className="card" style={{ padding: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: app.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, color: app.color,
                  }}>
                    {app.icon}
                  </div>
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: 10, padding: '3px 8px',
                    background: app.bg, color: app.color,
                    border: `1px solid ${app.color}33`, borderRadius: 4,
                  }}>
                    {app.tag}
                  </span>
                </div>

                <h3 style={{
                  fontFamily: 'var(--display)', fontSize: 17, fontWeight: 700,
                  marginBottom: 10, lineHeight: 1.3,
                }}>
                  {app.title}
                </h3>

                <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
                  {app.desc}
                </p>

                <div style={{
                  paddingTop: 16, borderTop: '1px solid var(--border)',
                  display: 'flex', alignItems: 'baseline', gap: 8,
                }}>
                  <span style={{
                    fontFamily: 'var(--display)', fontSize: 24, fontWeight: 800, color: app.color,
                  }}>
                    {app.metric}
                  </span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>
                    {app.metricLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
