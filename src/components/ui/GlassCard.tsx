'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { CSSProperties } from 'react'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  tilt?: boolean
  glow?: 'cyan' | 'purple' | 'green' | 'amber' | 'none'
  delay?: number
  onClick?: () => void
  style?: CSSProperties
}

export function GlassCard({
  children,
  className,
  hover = true,
  tilt = false,
  glow = 'cyan',
  delay = 0,
  onClick,
  style,
}: GlassCardProps): JSX.Element {
  const cardRef = useRef<HTMLDivElement>(null)

  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const glowX = useMotionValue(50)
  const glowY = useMotionValue(50)

  const springRotX = useSpring(rotateX, { stiffness: 300, damping: 30 })
  const springRotY = useSpring(rotateY, { stiffness: 300, damping: 30 })

  const glowColors = {
    cyan: { hover: 'hover:border-[rgba(0,229,255,0.4)]', shadow: 'rgba(0,229,255,0.2)', color: '#00E5FF' },
    purple: { hover: 'hover:border-[rgba(155,92,255,0.4)]', shadow: 'rgba(155,92,255,0.2)', color: '#9B5CFF' },
    green: { hover: 'hover:border-[rgba(0,255,136,0.4)]', shadow: 'rgba(0,255,136,0.2)', color: '#00FF88' },
    amber: { hover: 'hover:border-[rgba(245,158,11,0.4)]', shadow: 'rgba(245,158,11,0.2)', color: '#F59E0B' },
    none: { hover: '', shadow: 'transparent', color: 'transparent' },
  }

  const gc = glowColors[glow]

  const shine = useTransform(
    [glowX, glowY],
    ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.06) 0%, transparent 60%)`
  )

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (!tilt || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const cx = (e.clientX - rect.left) / rect.width
    const cy = (e.clientY - rect.top) / rect.height
    rotateY.set((cx - 0.5) * 14)
    rotateX.set((0.5 - cy) * 14)
    glowX.set(cx * 100)
    glowY.set(cy * 100)
  }

  const handleMouseLeave = (): void => {
    rotateX.set(0)
    rotateY.set(0)
    glowX.set(50)
    glowY.set(50)
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={hover && !tilt ? { y: -5, scale: 1.015 } : undefined}
      style={
        tilt
          ? {
              rotateX: springRotX,
              rotateY: springRotY,
              transformStyle: 'preserve-3d',
              perspective: 1000,
              ...style,
            }
          : style
      }
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={cn(
        'glass-card p-6 transition-all duration-300 relative overflow-hidden',
        hover && 'cursor-pointer',
        glow !== 'none' && `hover:shadow-[0_0_40px_${gc.shadow}]`,
        gc.hover,
        className
      )}
    >
      {/* Shine layer for tilt effect */}
      {tilt ? (
        <motion.div
          className="absolute inset-0 rounded-[16px] pointer-events-none"
          style={{ background: shine }}
        />
      ) : null}
      <div style={tilt ? { transform: 'translateZ(20px)' } : undefined}>
        {children}
      </div>
    </motion.div>
  )
}
