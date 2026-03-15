'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { CSSProperties } from 'react'
import type { MotionStyle } from 'framer-motion'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: 'cyan' | 'purple' | 'green' | 'none'
  delay?: number
  onClick?: () => void
  style?: CSSProperties | MotionStyle
}

export function GlassCard({
  children,
  className,
  hover = true,
  glow = 'cyan',
  delay = 0,
  onClick,
  style,
}: GlassCardProps): JSX.Element {
  const glowMap = {
    cyan: 'hover:shadow-[0_0_30px_rgba(0,229,255,0.15)] hover:border-[rgba(0,229,255,0.35)]',
    purple: 'hover:shadow-[0_0_30px_rgba(155,92,255,0.15)] hover:border-[rgba(155,92,255,0.35)]',
    green: 'hover:shadow-[0_0_30px_rgba(0,255,136,0.15)] hover:border-[rgba(0,255,136,0.35)]',
    none: '',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={hover ? { y: -4, scale: 1.01 } : {}}
      onClick={onClick}
      style={style}
      className={cn(
        'glass-card p-6 transition-all duration-300',
        hover && 'cursor-pointer',
        glowMap[glow],
        className
      )}
    >
      {children}
    </motion.div>
  )
}
