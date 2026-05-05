import { useRef, useCallback, ReactNode } from 'react'

interface TiltCardProps {
  children: ReactNode
  className?: string
  max?: number
  perspective?: number
  scale?: number
}

export function TiltCard({
  children,
  className = '',
  max = 12,
  perspective = 900,
  scale = 1.03,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const cx = rect.width / 2
      const cy = rect.height / 2
      const rotX = ((y - cy) / cy) * -max
      const rotY = ((x - cx) / cx) * max

      el.style.transform = `perspective(${perspective}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(${scale},${scale},${scale})`
      el.style.transition = 'transform 0.05s linear'

      const shine = el.querySelector<HTMLElement>('.tilt-glare')
      if (shine) {
        const pctX = (x / rect.width) * 100
        const pctY = (y / rect.height) * 100
        shine.style.background = `radial-gradient(circle at ${pctX}% ${pctY}%, rgba(255,255,255,0.18) 0%, transparent 65%)`
        shine.style.opacity = '1'
      }
    },
    [max, perspective, scale]
  )

  const onMouseLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)`
    el.style.transition = 'transform 0.6s cubic-bezier(0.19,1,0.22,1)'

    const shine = el.querySelector<HTMLElement>('.tilt-glare')
    if (shine) shine.style.opacity = '0'
  }, [perspective])

  return (
    <div
      ref={ref}
      className={`tilt-card ${className}`}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
    >
      <div className="tilt-glare" />
      {children}
    </div>
  )
        }
