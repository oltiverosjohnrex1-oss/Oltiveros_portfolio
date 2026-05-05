import { useRef, useEffect } from 'react'

interface Particle {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  r: number
}

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = canvas.offsetWidth
    let h = canvas.offsetHeight
    canvas.width = w
    canvas.height = h

    const NUM = 80
    const particles: Particle[] = Array.from({ length: NUM }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.random() * 2 + 0.2,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      vz: (Math.random() - 0.5) * 0.005,
      r: Math.random() * 1.5 + 0.5,
    }))

    let mouseX = w / 2
    let mouseY = h / 2

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }
    window.addEventListener('mousemove', onMove, { passive: true })

    let raf: number
    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, w, h)

      particles.forEach((p) => {
        const dx = p.x - mouseX
        const dy = p.y - mouseY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 120) {
          const force = (120 - dist) / 120
          p.vx += (dx / dist) * force * 0.05
          p.vy += (dy / dist) * force * 0.05
        }

        p.vx *= 0.98
        p.vy *= 0.98
        p.x += p.vx
        p.y += p.vy
        p.z += p.vz
        p.z = Math.max(0.2, Math.min(2.2, p.z))

        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0

        const alpha = (p.z / 2.2) * 0.45
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * p.z, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(26,24,20,${alpha})`
        ctx.fill()
      })

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            const alpha = (1 - dist / 100) * 0.08
            ctx.beginPath()
            ctx.strokeStyle = `rgba(26,24,20,${alpha})`
            ctx.lineWidth = 0.5
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      raf = requestAnimationFrame(draw)
    }

    draw()

    const onResize = () => {
      w = canvas.offsetWidth
      h = canvas.offsetHeight
      canvas.width = w
      canvas.height = h
    }
    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="particle-canvas"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0.5,
      }}
    />
  )
}
