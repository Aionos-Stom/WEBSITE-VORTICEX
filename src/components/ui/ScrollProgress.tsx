'use client'

import { useEffect, useRef } from 'react'

export function ScrollProgress(): JSX.Element {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const update = (): void => {
      const el = barRef.current
      if (!el) return
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      el.style.transform = `scaleX(${pct / 100})`
    }

    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <div
      ref={barRef}
      className="scroll-progress"
      style={{ width: '100%', transformOrigin: 'left', transform: 'scaleX(0)' }}
    />
  )
}
