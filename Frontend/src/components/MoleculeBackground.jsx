import { useEffect, useRef } from 'react'

export default function MoleculeBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId
    let t = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Nodes representing atoms
    const nodes = Array.from({ length: 28 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2.5 + 1.5,
      type: ['C','N','O','S','F'][Math.floor(Math.random()*5)],
      phase: Math.random() * Math.PI * 2,
    }))

    const typeColor = { C:'#00d4ff', N:'#a855f7', O:'#ff4060', S:'#ffb800', F:'#00ff88' }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t += 0.005

      nodes.forEach(n => {
        n.x += n.vx + Math.sin(t + n.phase) * 0.15
        n.y += n.vy + Math.cos(t + n.phase) * 0.15
        if (n.x < 0) n.x = canvas.width
        if (n.x > canvas.width) n.x = 0
        if (n.y < 0) n.y = canvas.height
        if (n.y > canvas.height) n.y = 0
      })

      // Bonds
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const d = Math.sqrt(dx*dx + dy*dy)
          if (d < 130) {
            const alpha = (1 - d/130) * 0.18
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = `rgba(0,212,255,${alpha})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }

      // Atoms
      nodes.forEach(n => {
        const col = typeColor[n.type]
        const alpha = 0.5 + Math.sin(t * 2 + n.phase) * 0.2

        // Glow
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 6)
        grd.addColorStop(0, col + '33')
        grd.addColorStop(1, col + '00')
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r * 6, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()

        // Core dot
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = col + Math.floor(alpha * 255).toString(16).padStart(2,'0')
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        opacity: 0.7,
      }}
    />
  )
}
