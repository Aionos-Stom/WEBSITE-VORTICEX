'use client'

import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function CursorOrb(): JSX.Element {
  const cursorX = useMotionValue(-200)
  const cursorY = useMotionValue(-200)
  const isHoveringRef = useRef(false)
  const scaleMotion = useMotionValue(1)

  // Main dot — nearly instant follow
  const dotX = useSpring(cursorX, { stiffness: 1200, damping: 18, mass: 0.05 })
  const dotY = useSpring(cursorY, { stiffness: 1200, damping: 18, mass: 0.05 })

  // Outer ring — smooth follow
  const ringX = useSpring(cursorX, { stiffness: 160, damping: 22, mass: 0.6 })
  const ringY = useSpring(cursorY, { stiffness: 160, damping: 22, mass: 0.6 })

  // Glow — slowest, most ambient
  const glowX = useSpring(cursorX, { stiffness: 55, damping: 16, mass: 1.2 })
  const glowY = useSpring(cursorY, { stiffness: 55, damping: 16, mass: 1.2 })

  const ringScale = useSpring(scaleMotion, { stiffness: 400, damping: 20 })

  useEffect(() => {
    const move = (e: MouseEvent): void => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    }

    const over = (e: MouseEvent): void => {
      const target = e.target as HTMLElement
      const clickable = target.closest('a, button, [role="button"], input, select, textarea, label, [data-cursor]')
      if (clickable && !isHoveringRef.current) {
        isHoveringRef.current = true
        scaleMotion.set(2.4)
      } else if (!clickable && isHoveringRef.current) {
        isHoveringRef.current = false
        scaleMotion.set(1)
      }
    }

    window.addEventListener('mousemove', move)
    window.addEventListener('mouseover', over)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseover', over)
    }
  }, [cursorX, cursorY, scaleMotion])

  return (
    <>
      {/* Ambient glow — slowest */}
      <motion.div
        style={{
          position: 'fixed',
          left: glowX,
          top: glowY,
          x: '-50%',
          y: '-50%',
          zIndex: 9994,
          pointerEvents: 'none',
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,229,255,0.05) 0%, transparent 70%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Outer ring — medium speed */}
      <motion.div
        style={{
          position: 'fixed',
          left: ringX,
          top: ringY,
          x: '-50%',
          y: '-50%',
          scale: ringScale,
          zIndex: 9997,
          pointerEvents: 'none',
          width: 38,
          height: 38,
          borderRadius: '50%',
          border: '1px solid rgba(0,229,255,0.55)',
          boxShadow: '0 0 14px rgba(0,229,255,0.35), inset 0 0 10px rgba(0,229,255,0.06)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Inner dot — near instant */}
      <motion.div
        style={{
          position: 'fixed',
          left: dotX,
          top: dotY,
          x: '-50%',
          y: '-50%',
          zIndex: 9999,
          pointerEvents: 'none',
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#00E5FF',
          boxShadow: '0 0 8px rgba(0,229,255,1), 0 0 20px rgba(0,229,255,0.7)',
          mixBlendMode: 'screen',
        }}
      />
    </>
  )
}
