'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { SectionWrapper } from '@/components/ui/SectionWrapper'
import type { Skill } from '@/types/database'
import { COLOR_MAP } from '@/types/database'

interface ArsenalTecnicoSectionProps {
  skills: Skill[]
}

function SkillCard({ skill, index }: { skill: Skill; index: number }): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const color = COLOR_MAP[skill.color_class] ?? '#9B5CFF'

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.06, ease: [0.4, 0, 0.2, 1] }}
      className="group relative"
    >
      {/* Card */}
      <div className="glass-card p-4 transition-all duration-300 group-hover:border-opacity-40"
        style={{ borderColor: `${color}25` }}
      >
        <div className="flex justify-between items-center mb-3">
          <span
            className="font-mono-custom text-sm font-bold transition-all duration-300"
            style={{ color: 'rgba(226,232,240,0.9)' }}
          >
            {skill.name}
          </span>
          <span
            className="font-mono-custom text-xs font-black px-2 py-0.5 rounded-md"
            style={{
              color,
              background: `${color}15`,
              boxShadow: `0 0 8px ${color}30`,
            }}
          >
            {skill.percentage}%
          </span>
        </div>

        {/* Bar */}
        <div className="relative h-1.5 bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={inView ? { width: `${skill.percentage}%` } : { width: 0 }}
            transition={{ duration: 1.4, ease: [0.4, 0, 0.2, 1], delay: index * 0.06 + 0.2 }}
            className="absolute h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${color}70, ${color})`,
              boxShadow: `0 0 12px ${color}60`,
            }}
          />
          {/* Shimmer on hover */}
          <motion.div
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `linear-gradient(90deg, transparent, ${color}50, transparent)`,
              backgroundSize: '200% 100%',
            }}
            animate={{ backgroundPosition: ['200% center', '-200% center'] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        {/* Hover glow line */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-px rounded-b-[16px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }}
        />
      </div>
    </motion.div>
  )
}

export function ArsenalTecnicoSection({ skills }: ArsenalTecnicoSectionProps): JSX.Element {
  const sorted = [...skills].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <SectionWrapper
      id="arsenal"
      label="// skills.json"
      title="Arsenal Técnico"
      titleColor="purple"
    >
      {skills.length === 0 ? (
        <div className="text-center text-slate-500 font-mono-custom py-12">
          {'> arsenal_vacio — agrega skills desde /admin'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl">
          {sorted.map((skill, i) => (
            <SkillCard key={skill.id} skill={skill} index={i} />
          ))}
        </div>
      )}
    </SectionWrapper>
  )
}
