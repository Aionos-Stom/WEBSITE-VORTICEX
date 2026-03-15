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
}

export function SectionWrapper({
  id,
  children,
  className,
  label,
  title,
  titleColor = 'cyan',
}: SectionWrapperProps): JSX.Element {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const colorMap = {
    cyan: 'text-[#00E5FF] drop-shadow-[0_0_30px_rgba(0,229,255,0.5)]',
    purple: 'text-[#9B5CFF] drop-shadow-[0_0_30px_rgba(155,92,255,0.5)]',
    green: 'text-[#00FF88] drop-shadow-[0_0_30px_rgba(0,255,136,0.5)]',
  }

  return (
    <section
      id={id}
      ref={ref}
      className={cn('relative z-10 py-20 px-4 md:px-8 max-w-7xl mx-auto', className)}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
      >
        {(label ?? title) ? (
          <div className="mb-12">
            {label ? (
              <p className="section-label mb-2">{label}</p>
            ) : null}
            {title ? (
              <h2 className={cn('section-title font-mono-custom', colorMap[titleColor])}>
                {title}
              </h2>
            ) : null}
            <div
              className="mt-3 h-px w-24"
              style={{
                background: `linear-gradient(90deg, ${titleColor === 'cyan' ? '#00E5FF' : titleColor === 'purple' ? '#9B5CFF' : '#00FF88'}, transparent)`,
              }}
            />
          </div>
        ) : null}
        {children}
      </motion.div>
    </section>
  )
}
