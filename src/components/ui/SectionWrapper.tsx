'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SectionWrapperProps {
  id: string
  children: React.ReactNode
  className?: string
  label?: string
  title?: string
  titleColor?: 'cyan' | 'purple' | 'green'
  centered?: boolean
}

export function SectionWrapper({
  id,
  children,
  className,
  label,
  title,
  titleColor = 'cyan',
  centered = false,
}: SectionWrapperProps): JSX.Element {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  const colors = {
    cyan: { text: '#00E5FF', glow: 'rgba(0,229,255,0.5)', gradient: '#00E5FF' },
    purple: { text: '#9B5CFF', glow: 'rgba(155,92,255,0.5)', gradient: '#9B5CFF' },
    green: { text: '#00FF88', glow: 'rgba(0,255,136,0.5)', gradient: '#00FF88' },
  }

  const c = colors[titleColor]

  return (
    <section
      id={id}
      ref={ref}
      className={cn('relative z-10 py-24 px-4 md:px-8', className)}
    >
      <div className={cn('max-w-7xl mx-auto w-full', centered && 'flex flex-col items-center text-center')}>
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        >
          {(label ?? title) ? (
            <div className={cn('mb-14', centered && 'flex flex-col items-center')}>
              {label ? (
                <motion.p
                  className="section-label mb-3 font-mono-custom"
                  style={{ color: c.text }}
                  initial={{ opacity: 0, x: centered ? 0 : -20 }}
                  animate={isInView ? { opacity: 0.55, x: 0 } : { opacity: 0, x: centered ? 0 : -20 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  {label}
                </motion.p>
              ) : null}
              {title ? (
                <motion.h2
                  className="section-title font-mono-custom"
                  style={{ color: c.text, textShadow: `0 0 40px ${c.glow}` }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.7, delay: 0.15 }}
                >
                  {title}
                </motion.h2>
              ) : null}

              {/* Animated underline */}
              <motion.div
                className="mt-4 h-px rounded-full"
                style={{ background: `linear-gradient(90deg, ${c.gradient}, transparent)` }}
                initial={{ width: 0 }}
                animate={isInView ? { width: centered ? 120 : 80 } : { width: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          ) : null}

          {children}
        </motion.div>
      </div>
    </section>
  )
}
