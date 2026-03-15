'use client'

import { useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function CursorOrb(): JSX.Element {
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 }
  const springX = useSpring(cursorX, springConfig)
  const springY = useSpring(cursorY, springConfig)

  const trailX = useSpring(cursorX, { damping: 50, stiffness: 100, mass: 1 })
  const trailY = useSpring(cursorY, { damping: 50, stiffness: 100, mass: 1 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent): void => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [cursorX, cursorY])

  return (
    <>
      {/* Main orb */}
      <motion.div
        style={{
          position: 'fixed',
          left: springX,
          top: springY,
          x: '-50%',
          y: '-50%',
          zIndex: 9998,
          pointerEvents: 'none',
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,229,255,0.9) 0%, rgba(0,229,255,0) 70%)',
          boxShadow: '0 0 20px rgba(0,229,255,0.8), 0 0 40px rgba(0,229,255,0.4), 0 0 80px rgba(0,229,255,0.2)',
          mixBlendMode: 'screen',
        }}
      />
      {/* Trail orb */}
      <motion.div
        style={{
          position: 'fixed',
          left: trailX,
          top: trailY,
          x: '-50%',
          y: '-50%',
          zIndex: 9997,
          pointerEvents: 'none',
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(155,92,255,0.15) 0%, rgba(155,92,255,0) 70%)',
          mixBlendMode: 'screen',
        }}
      />
    </>
  )
}
