import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const d = payload[0].payload
    return (
      <div style={{
        background: 'var(--bg3)', border: '1px solid var(--border2)',
        borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--mono)', fontSize: 12
      }}>
        <div style={{ color: 'var(--cyan)', fontWeight: 600 }}>{d.axis}</div>
        <div style={{ color: 'var(--text)', marginTop: 4 }}>Score: {(d.score * 100).toFixed(1)}%</div>
      </div>
    )
  }
  return null
}

const CustomDot = (props) => {
  const { cx, cy, value } = props
  if (!cx || !cy) return null
  return (
    <circle cx={cx} cy={cy} r={5} fill="var(--cyan)" stroke="var(--bg)"
      strokeWidth={2} style={{ filter: 'drop-shadow(0 0 6px var(--cyan))' }} />
  )
}

export default function ADMETRadar({ data, compareData, compareName }) {
  if (!data) return null

  const keyMap = {
    ESOL: 'Absorption', BBBP: 'Distribution', Lipophilicity: 'Excretion', Tox21: 'Toxicity'
  }

  const chartData = Object.entries(keyMap).map(([key, label]) => ({
    axis: label,
    score: data[key]?.score || 0,
    compareScore: compareData?.[key]?.score || 0,
  }))

  // Add Metabolism as 0.5 placeholder (not directly predicted)
  chartData.splice(2, 0, {
    axis: 'Metabolism',
    score: 0.5,
    compareScore: compareData ? 0.5 : 0,
  })

  return (
    <div style={{ width: '100%', height: 340 }}>
      <ResponsiveContainer>
        <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <PolarGrid
            stroke="rgba(0,212,255,0.08)"
            strokeDasharray="3 3"
          />
          <PolarAngleAxis
            dataKey="axis"
            tick={{
              fill: 'var(--text2)',
              fontFamily: 'var(--mono)',
              fontSize: 11,
              fontWeight: 500,
            }}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Main molecule */}
          <Radar
            name="Molecule"
            dataKey="score"
            stroke="var(--cyan)"
            fill="var(--cyan)"
            fillOpacity={0.12}
            strokeWidth={2}
            dot={<CustomDot />}
          />

          {/* Compare molecule */}
          {compareData && (
            <Radar
              name={compareName || 'Compare'}
              dataKey="compareScore"
              stroke="var(--amber)"
              fill="var(--amber)"
              fillOpacity={0.08}
              strokeWidth={2}
              dot={(props) => (
                <circle {...props} r={4} fill="var(--amber)" stroke="var(--bg)"
                  strokeWidth={2} style={{ filter: 'drop-shadow(0 0 4px var(--amber))' }} />
              )}
            />
          )}
        </RadarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: -8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text2)' }}>
          <span style={{ width: 24, height: 2, background: 'var(--cyan)', borderRadius: 1, display: 'inline-block' }} />
          Molecule A
        </div>
        {compareData && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text2)' }}>
            <span style={{ width: 24, height: 2, background: 'var(--amber)', borderRadius: 1, display: 'inline-block' }} />
            {compareName || 'Molecule B'}
          </div>
        )}
      </div>
    </div>
  )
}
