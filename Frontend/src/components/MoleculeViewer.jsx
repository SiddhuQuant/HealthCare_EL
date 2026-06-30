import { useEffect, useRef } from 'react'

// Simple SMILES → visual SVG renderer
// Uses a heuristic ring/chain layout for demonstration
const ATOM_COLORS = {
  C: '#94a3b8', N: '#a78bfa', O: '#f87171',
  S: '#fbbf24', F: '#34d399', Cl: '#86efac',
  Br: '#fb923c', P: '#f97316', default: '#e2e8f0'
}

function parseSmilesAtoms(smiles) {
  const atoms = []
  const bonds = []
  let i = 0, prevIdx = -1, ringOpens = {}

  while (i < smiles.length) {
    let sym = smiles[i]
    if (sym === '(' || sym === ')' || sym === '/' || sym === '\\') { i++; continue }
    if (sym === '.') { prevIdx = -1; i++; continue }

    // Detect 2-char atoms
    let atom = sym
    if (i+1 < smiles.length && smiles[i+1].match(/[a-z]/)) {
      atom = smiles[i] + smiles[i+1]
      i++
    }

    if (sym.match(/[A-Z]/) || sym === '[') {
      if (sym === '[') {
        const close = smiles.indexOf(']', i)
        atom = smiles.slice(i+1, close).replace(/[0-9+\-:@H]/g,'') || 'C'
        i = close
      }
      const idx = atoms.length
      atoms.push({ symbol: atom.charAt(0).toUpperCase() + atom.slice(1).toLowerCase().replace(/h\d*/,''), idx })
      if (prevIdx >= 0) bonds.push([prevIdx, idx])
      prevIdx = idx
    } else if (sym.match(/[0-9]/)) {
      const n = parseInt(sym)
      if (ringOpens[n] !== undefined) {
        bonds.push([ringOpens[n], prevIdx])
        delete ringOpens[n]
      } else { ringOpens[n] = prevIdx }
    }
    i++
  }
  return { atoms, bonds }
}

function layoutAtoms(atoms, bonds) {
  if (atoms.length === 0) return []
  const pos = new Array(atoms.length).fill(null)
  const placed = new Set()
  const adj = Array.from({ length: atoms.length }, () => [])
  bonds.forEach(([a,b]) => { adj[a].push(b); adj[b].push(a) })

  const cx = 200, cy = 150, step = 38
  pos[0] = { x: cx, y: cy }
  placed.add(0)

  const queue = [0]
  let angleBase = 0
  while (queue.length) {
    const cur = queue.shift()
    const neighbors = adj[cur].filter(n => !placed.has(n))
    neighbors.forEach((nb, ni) => {
      const angle = angleBase + (ni - (neighbors.length-1)/2) * (Math.PI / (neighbors.length + 1)) * 1.8
      const px = pos[cur].x + Math.cos(angle) * step
      const py = pos[cur].y + Math.sin(angle) * step
      pos[nb] = { x: Math.max(20, Math.min(380, px)), y: Math.max(20, Math.min(280, py)) }
      placed.add(nb)
      queue.push(nb)
    })
    angleBase += 0.3
  }
  return pos
}

export default function MoleculeViewer({ smiles }) {
  if (!smiles) {
    return (
      <div style={{
        width: '100%', height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg1)', borderRadius: 12, border: '1px dashed var(--border2)',
        color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 12
      }}>
        Enter a SMILES string to render structure
      </div>
    )
  }

  let parsed
  try { parsed = parseSmilesAtoms(smiles) }
  catch { parsed = { atoms: [], bonds: [] } }

  const { atoms, bonds } = parsed
  const pos = layoutAtoms(atoms, bonds)

  if (atoms.length === 0) {
    return (
      <div style={{
        width: '100%', height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg1)', borderRadius: 12, border: '1px solid rgba(255,64,96,0.2)',
        color: 'var(--red)', fontFamily: 'var(--mono)', fontSize: 12
      }}>
        Invalid SMILES — cannot render
      </div>
    )
  }

  const padX = 40, padY = 40
  const allX = pos.filter(Boolean).map(p=>p.x)
  const allY = pos.filter(Boolean).map(p=>p.y)
  const minX = Math.min(...allX) - padX
  const minY = Math.min(...allY) - padY
  const maxX = Math.max(...allX) + padX
  const maxY = Math.max(...allY) + padY
  const vw = Math.max(300, maxX - minX)
  const vh = Math.max(200, maxY - minY)

  return (
    <div style={{ width:'100%', background:'var(--bg1)', borderRadius:12, border:'1px solid var(--border2)', overflow:'hidden', padding: 8 }}>
      <svg
        viewBox={`${minX} ${minY} ${vw} ${vh}`}
        style={{ width:'100%', height: 200 }}
      >
        {/* Bonds */}
        {bonds.map(([a,b], i) => {
          if (!pos[a] || !pos[b]) return null
          return (
            <line key={i}
              x1={pos[a].x} y1={pos[a].y} x2={pos[b].x} y2={pos[b].y}
              stroke="rgba(0,212,255,0.35)" strokeWidth="2"
              strokeLinecap="round"
              className="mol-bond"
              style={{ animationDelay: `${i*0.06}s` }}
            />
          )
        })}

        {/* Atoms */}
        {atoms.map((atom, i) => {
          if (!pos[i]) return null
          const col = ATOM_COLORS[atom.symbol] || ATOM_COLORS.default
          const isCarbon = atom.symbol === 'C'
          return (
            <g key={i} style={{ animation: `fade-up 0.4s ease ${i*0.04}s both` }}>
              {!isCarbon && (
                <>
                  <circle cx={pos[i].x} cy={pos[i].y} r={11} fill={col} opacity={0.15} />
                  <circle cx={pos[i].x} cy={pos[i].y} r={7} fill={col} opacity={0.8} />
                  <text
                    x={pos[i].x} y={pos[i].y + 4}
                    textAnchor="middle"
                    fontSize={8}
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="600"
                    fill="#000"
                  >{atom.symbol}</text>
                </>
              )}
              {isCarbon && (
                <circle cx={pos[i].x} cy={pos[i].y} r={3} fill="rgba(0,212,255,0.6)" />
              )}
            </g>
          )
        })}
      </svg>

      {/* Atom legend */}
      <div style={{ display:'flex', gap:12, padding:'6px 8px 2px', flexWrap:'wrap' }}>
        {Object.entries(ATOM_COLORS).filter(([k])=>k!=='default').slice(0,6).map(([sym,col])=>(
          <span key={sym} style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, fontFamily:'var(--mono)', color:'var(--text3)' }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:col, display:'inline-block' }}/>
            {sym}
          </span>
        ))}
      </div>
    </div>
  )
}
