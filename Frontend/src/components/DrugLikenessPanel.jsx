export default function DrugLikenessPanel({ drugLikeness }) {
  if (!drugLikeness) return null
  const dl = drugLikeness

  const props = [
    { label: 'Molecular Weight', value: `${dl.molecular_weight} Da`, key: 'mw' },
    { label: 'LogP',             value: dl.logP,                    key: 'logP' },
    { label: 'HBD',              value: dl.hbd,                     key: 'hbd' },
    { label: 'HBA',              value: dl.hba,                     key: 'hba' },
    { label: 'TPSA',             value: `${dl.tpsa} Å²`,           key: 'tpsa' },
    { label: 'Rotatable Bonds',  value: dl.rotatable_bonds,         key: 'rot' },
    { label: 'Ring Count',       value: dl.ring_count,              key: 'rings' },
    { label: 'Formula',          value: dl.mol_formula,             key: 'formula' },
    { label: 'QED Score',        value: dl.qed?.toFixed(3) ?? 'N/A', key: 'qed' },
  ]

  const rules = dl.lipinski?.rules || {}

  const verdictColor = (v) =>
    v === 'pass' ? 'var(--green)' : v === 'warning' ? 'var(--amber)' : 'var(--red)'

  const qedColor = dl.qed >= 0.67 ? 'var(--green)' : dl.qed >= 0.34 ? 'var(--amber)' : 'var(--red)'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

      {/* Descriptors table */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{
          fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: 16, opacity: 0.8
        }}>
          Molecular Descriptors
        </div>

        <table className="prop-table">
          <tbody>
            {props.map(p => (
              <tr key={p.key}>
                <td>{p.label}</td>
                <td style={{ color: p.key === 'formula' ? 'var(--purple)' : p.key === 'qed' ? qedColor : 'var(--cyan)' }}>
                  {p.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* QED gauge */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text2)' }}>
            <span>Drug-likeness (QED)</span>
            <span style={{ color: qedColor }}>{dl.qed_label}</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{
              width: `${(dl.qed || 0) * 100}%`,
              background: `linear-gradient(90deg, ${qedColor}88, ${qedColor})`,
            }} />
          </div>
        </div>
      </div>

      {/* Lipinski Ro5 */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{
          fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: 4, opacity: 0.8
        }}>
          Lipinski Rule of Five
        </div>

        {/* Overall badge */}
        <div style={{ marginBottom: 16 }}>
          <span className={dl.lipinski?.pass ? 'badge-pass' : 'badge-fail'}>
            {dl.lipinski?.summary}
          </span>
        </div>

        {/* Individual rules */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Object.entries(rules).map(([rule, data]) => (
            <div key={rule} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px', borderRadius: 8,
              background: data.pass ? 'rgba(0,255,136,0.05)' : 'rgba(255,64,96,0.05)',
              border: `1px solid ${data.pass ? 'rgba(0,255,136,0.15)' : 'rgba(255,64,96,0.15)'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: data.pass ? 'var(--green2)' : 'var(--red2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: data.pass ? 'var(--green)' : 'var(--red)',
                }}>
                  {data.pass ? '✓' : '✗'}
                </span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text)' }}>
                  {rule}
                </span>
              </div>
              <span style={{
                fontFamily: 'var(--mono)', fontSize: 12,
                color: data.pass ? 'var(--green)' : 'var(--red)',
              }}>
                {typeof data.value === 'number' ? data.value.toFixed(2) : data.value}
                {data.unit && <span style={{ color: 'var(--text3)', fontSize: 10, marginLeft: 2 }}>{data.unit}</span>}
              </span>
            </div>
          ))}
        </div>

        {/* Extended metrics */}
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'TPSA', verdict: dl.tpsa_verdict, text: dl.tpsa_label, value: `${dl.tpsa} Å²` },
            { label: 'Flexibility', verdict: dl.rot_verdict, text: dl.rot_label, value: `${dl.rotatable_bonds} bonds` },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text2)',
              paddingTop: 8, borderTop: '1px solid var(--border)',
            }}>
              <span>{item.text}</span>
              <span style={{ color: verdictColor(item.verdict) }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
