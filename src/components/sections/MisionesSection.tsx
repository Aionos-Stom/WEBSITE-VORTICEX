'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SectionWrapper } from '@/components/ui/SectionWrapper'
import { GlassCard } from '@/components/ui/GlassCard'
import type { Mision } from '@/types/database'
import { getEstadoColor, formatDate } from '@/lib/utils'

interface MisionesSectionProps {
  misiones: Mision[]
}

const ESTADO_LABELS: Record<string, string> = {
  COMPLETADA: '✓ COMPLETADA',
  EN_PROGRESO: '◎ EN PROGRESO',
  PLANIFICADA: '○ PLANIFICADA',
}

function DifficultyBars({ nivel }: { nivel: number }): JSX.Element {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="w-4 h-1 rounded-full"
          style={{
            background: i < nivel ? '#FF4444' : 'rgba(255,68,68,0.15)',
            boxShadow: i < nivel ? '0 0 4px rgba(255,68,68,0.5)' : 'none',
          }}
        />
      ))}
    </div>
  )
}

function MisionesSection({ misiones }: MisionesSectionProps): JSX.Element {
  const [filter, setFilter] = useState<string>('TODAS')
  const filters = ['TODAS', 'EN_PROGRESO', 'COMPLETADA', 'PLANIFICADA']

  const filtered = filter === 'TODAS' ? misiones : misiones.filter((m) => m.estado === filter)

  return (
    <SectionWrapper
      id="misiones"
      label="// operations.log"
      title="Misiones"
      titleColor="green"
    >
      {misiones.length === 0 ? (
        <div className="text-center text-slate-500 font-mono-custom py-12">
          {'> sin_misiones_activas — inicia desde /admin'}
        </div>
      ) : (
        <>
          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {filters.map((f) => {
              const color = f === 'TODAS' ? '#00E5FF' : getEstadoColor(f)
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="font-mono-custom text-xs px-3 py-1.5 rounded border transition-all duration-200"
                  style={
                    filter === f
                      ? { background: `${color}20`, borderColor: color, color }
                      : { borderColor: 'rgba(255,255,255,0.1)', color: '#64748B' }
                  }
                >
                  {f === 'TODAS' ? 'TODAS' : ESTADO_LABELS[f]}
                </button>
              )
            })}
          </div>

          {/* Missions grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filtered.map((mision, i) => {
                const color = getEstadoColor(mision.estado)
                return (
                  <motion.div
                    key={mision.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <GlassCard
                      hover
                      glow="none"
                      className="h-full flex flex-col group"
                      style={{ borderColor: `${color}25` } as React.CSSProperties}
                    >
                      {/* Status badge */}
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className="font-mono-custom text-xs px-2 py-1 rounded"
                          style={{ background: `${color}15`, color }}
                        >
                          {ESTADO_LABELS[mision.estado]}
                        </span>
                        <DifficultyBars nivel={mision.dificultad} />
                      </div>

                      {/* Mission image */}
                      {mision.imagen_url ? (
                        <div className="relative h-40 mb-4 rounded-lg overflow-hidden border border-[rgba(0,229,255,0.1)]">
                          <img
                            src={mision.imagen_url}
                            alt={mision.titulo}
                            className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D1A] to-transparent" />
                        </div>
                      ) : (
                        <div className="h-2 mb-4 rounded-full" style={{ background: `linear-gradient(90deg, ${color}40, transparent)` }} />
                      )}

                      {/* Content */}
                      <h3 className="font-mono-custom font-bold text-slate-200 mb-2 group-hover:text-[#00E5FF] transition-colors">
                        {mision.titulo}
                      </h3>
                      <p className="font-mono-custom text-xs text-slate-500 leading-relaxed flex-1 mb-4">
                        {mision.descripcion}
                      </p>

                      {/* Technologies */}
                      {mision.tecnologias.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {mision.tecnologias.map((tech) => (
                            <span
                              key={tech}
                              className="font-mono-custom text-xs px-2 py-0.5 rounded bg-[rgba(0,229,255,0.05)] border border-[rgba(0,229,255,0.1)] text-slate-400"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      {/* Dates */}
                      {mision.fecha_inicio ? (
                        <p className="font-mono-custom text-xs text-slate-600 mb-4">
                          {formatDate(mision.fecha_inicio)}
                          {mision.fecha_fin ? ` → ${formatDate(mision.fecha_fin)}` : ' → presente'}
                        </p>
                      ) : null}

                      {/* Links */}
                      <div className="flex gap-3 pt-3 border-t border-[rgba(255,255,255,0.05)]">
                        {mision.github_url ? (
                          <a
                            href={mision.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono-custom text-xs text-[#00E5FF] hover:underline transition-all"
                            onClick={(e) => e.stopPropagation()}
                          >
                            [github]
                          </a>
                        ) : null}
                        {mision.demo_url ? (
                          <a
                            href={mision.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono-custom text-xs text-[#00FF88] hover:underline transition-all"
                            onClick={(e) => e.stopPropagation()}
                          >
                            [demo]
                          </a>
                        ) : null}
                      </div>
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

export { MisionesSection }
