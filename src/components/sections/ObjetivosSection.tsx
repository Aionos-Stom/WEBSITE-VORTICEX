'use client'

import { motion } from 'framer-motion'
import { SectionWrapper } from '@/components/ui/SectionWrapper'
import { GlassCard } from '@/components/ui/GlassCard'
import type { Objetivo } from '@/types/database'
import { formatDate } from '@/lib/utils'

interface ObjetivosSectionProps {
  objetivos: Objetivo[]
}

function ProgressRing({
  pct,
  color,
  size = 64,
}: {
  pct: number
  color: string
  size?: number
}): JSX.Element {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={4} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        whileInView={{ strokeDashoffset: offset }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
    </svg>
  )
}

const CATEGORIA_COLORS: Record<string, string> = {
  Seguridad: '#FF4444',
  Certificación: '#9B5CFF',
  Desarrollo: '#00E5FF',
  Cloud: '#F59E0B',
  Fitness: '#00FF88',
  Aprendizaje: '#00E5FF',
  default: '#00E5FF',
}

export function ObjetivosSection({ objetivos }: ObjetivosSectionProps): JSX.Element {
  const activos = objetivos.filter((o) => !o.completado)
  const completados = objetivos.filter((o) => o.completado)

  return (
    <SectionWrapper
      id="objetivos"
      label="// mission_objectives.yaml"
      title="Objetivos"
      titleColor="green"
    >
      {objetivos.length === 0 ? (
        <div className="text-center text-slate-500 font-mono-custom py-12">
          {'> objetivos_pendientes — define tus metas desde /admin'}
        </div>
      ) : (
        <div className="space-y-12">
          {/* Active objectives */}
          {activos.length > 0 ? (
            <div>
              <h3 className="font-mono-custom text-sm text-[#00FF88] mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00FF88] inline-block shadow-[0_0_8px_#00FF88]" />
                OBJETIVOS ACTIVOS ({activos.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activos.map((obj, i) => {
                  const pct = Math.round((obj.progreso / obj.meta) * 100)
                  const color = CATEGORIA_COLORS[obj.categoria] ?? CATEGORIA_COLORS['default']!

                  return (
                    <GlassCard
                      key={obj.id}
                      delay={i * 0.07}
                      glow="none"
                      hover={false}
                      style={{ borderColor: `${color}20` } as React.CSSProperties}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <span
                            className="font-mono-custom text-xs px-2 py-0.5 rounded mb-2 inline-block"
                            style={{ color, background: `${color}15` }}
                          >
                            {obj.categoria}
                          </span>
                          <h3 className="font-mono-custom font-bold text-sm text-slate-200 mb-2">
                            {obj.titulo}
                          </h3>
                          <p className="font-mono-custom text-xs text-slate-500 leading-relaxed">
                            {obj.descripcion}
                          </p>
                        </div>
                        <div className="relative flex-shrink-0">
                          <ProgressRing pct={pct} color={color} />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span
                              className="font-mono-custom text-xs font-black"
                              style={{ color }}
                            >
                              {pct}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-mono-custom text-xs text-slate-600">
                            {obj.progreso} / {obj.meta} {obj.unidad}
                          </span>
                          {obj.fecha_limite ? (
                            <span className="font-mono-custom text-xs text-slate-600">
                              ⏱ {formatDate(obj.fecha_limite)}
                            </span>
                          ) : null}
                        </div>
                        <div className="skill-bar">
                          <motion.div
                            className="skill-bar-fill"
                            initial={{ width: 0 }}
                            whileInView={{ width: `${pct}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, delay: i * 0.07 }}
                            style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
                          />
                        </div>
                      </div>
                    </GlassCard>
                  )
                })}
              </div>
            </div>
          ) : null}

          {/* Completed objectives */}
          {completados.length > 0 ? (
            <div>
              <h3 className="font-mono-custom text-sm text-slate-500 mb-6 flex items-center gap-2">
                <span className="text-[#00FF88]">✓</span>
                OBJETIVOS COMPLETADOS ({completados.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {completados.map((obj) => (
                  <div
                    key={obj.id}
                    className="glass-card p-4 opacity-50 hover:opacity-80 transition-opacity"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[#00FF88] text-lg">✓</span>
                      <span className="font-mono-custom text-sm text-slate-400 line-through">
                        {obj.titulo}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </SectionWrapper>
  )
}
