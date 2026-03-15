'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SectionWrapper } from '@/components/ui/SectionWrapper'
import { GlassCard } from '@/components/ui/GlassCard'
import type { ArsenalTecnico } from '@/types/database'
import { cn } from '@/lib/utils'

interface ArsenalTecnicoSectionProps {
  arsenal: ArsenalTecnico[]
}

const CATEGORIA_COLORS: Record<string, string> = {
  'Lenguajes': '#00E5FF',
  'Frameworks': '#9B5CFF',
  'Seguridad': '#FF4444',
  'Cloud': '#F59E0B',
  'DevOps': '#00FF88',
  'Bases de Datos': '#FF6B6B',
  'Herramientas': '#64748B',
  'default': '#00E5FF',
}

function SkillBar({ nivel, color }: { nivel: number; color: string }): JSX.Element {
  return (
    <div className="flex gap-1 mt-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          className="flex-1 h-1 rounded-full"
          style={{
            background: i < nivel
              ? `${color}`
              : 'rgba(255,255,255,0.05)',
            boxShadow: i < nivel ? `0 0 4px ${color}80` : 'none',
          }}
        />
      ))}
    </div>
  )
}

export function ArsenalTecnicoSection({ arsenal }: ArsenalTecnicoSectionProps): JSX.Element {
  const categorias = ['Todas', ...Array.from(new Set(arsenal.map((a) => a.categoria)))]
  const [selected, setSelected] = useState('Todas')

  const filtered = selected === 'Todas'
    ? arsenal
    : arsenal.filter((a) => a.categoria === selected)

  return (
    <SectionWrapper
      id="arsenal"
      label="// tech_stack.json"
      title="Arsenal Técnico"
      titleColor="purple"
    >
      {arsenal.length === 0 ? (
        <div className="text-center text-slate-500 font-mono-custom py-12">
          {'> arsenal_vacio — carga tus tecnologías desde /admin'}
        </div>
      ) : (
        <>
          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categorias.map((cat) => {
              const color = CATEGORIA_COLORS[cat] ?? CATEGORIA_COLORS['default']
              return (
                <button
                  key={cat}
                  onClick={() => setSelected(cat)}
                  className={cn(
                    'font-mono-custom text-xs px-3 py-1.5 rounded border transition-all duration-200',
                    selected === cat
                      ? 'text-black font-bold'
                      : 'text-slate-400 border-[rgba(255,255,255,0.1)] hover:border-[rgba(0,229,255,0.3)]'
                  )}
                  style={
                    selected === cat
                      ? { background: color, borderColor: color }
                      : {}
                  }
                >
                  {cat}
                </button>
              )
            })}
          </div>

          {/* Skills grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {filtered.map((skill, i) => {
                const color = skill.color ?? CATEGORIA_COLORS[skill.categoria] ?? CATEGORIA_COLORS['default']!
                return (
                  <motion.div
                    key={skill.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <GlassCard
                      hover
                      glow="none"
                      className="p-4 group transition-all duration-300"
                      style={{
                        borderColor: `${color}20`,
                      } as React.CSSProperties}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {skill.icono ? (
                            <span className="text-2xl mb-2 block">{skill.icono}</span>
                          ) : null}
                          <h3
                            className="font-mono-custom font-bold text-sm"
                            style={{ color }}
                          >
                            {skill.nombre}
                          </h3>
                          <p className="font-mono-custom text-xs text-slate-600 mt-0.5">
                            {skill.categoria}
                          </p>
                        </div>
                        <span
                          className="font-mono-custom text-xs font-black px-2 py-0.5 rounded"
                          style={{ color, background: `${color}15` }}
                        >
                          {skill.nivel * 10}%
                        </span>
                      </div>
                      <SkillBar nivel={skill.nivel} color={color} />
                      {skill.descripcion ? (
                        <p className="font-mono-custom text-xs text-slate-500 mt-3 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {skill.descripcion}
                        </p>
                      ) : null}
                    </GlassCard>
                  </motion.div>
                )
              })}
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </SectionWrapper>
  )
}
