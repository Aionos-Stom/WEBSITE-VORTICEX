'use client'

import { motion } from 'framer-motion'
import { SectionWrapper } from '@/components/ui/SectionWrapper'
import type { Objective } from '@/types/database'
import { STATUS_COLORS, STATUS_LABELS } from '@/types/database'

interface ObjetivosSectionProps {
  objectives: Objective[]
}

export function ObjetivosSection({ objectives }: ObjetivosSectionProps): JSX.Element {
  const sorted = [...objectives].sort((a, b) => a.sort_order - b.sort_order)

  const statusOrder = { activo: 0, pendiente: 1, completado: 2 }

  return (
    <SectionWrapper
      id="objetivos"
      label="// objectives.yaml"
      title="Objetivos"
      titleColor="green"
    >
      {objectives.length === 0 ? (
        <div className="text-center text-slate-500 font-mono-custom py-12">
          {'> sin_objetivos — define metas desde /admin'}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-3">
          {[...sorted].sort((a, b) => (statusOrder[a.status] ?? 2) - (statusOrder[b.status] ?? 2)).map((obj, i) => {
            const color = STATUS_COLORS[obj.status] ?? '#9B5CFF'
            const isCompleted = obj.status === 'completado'

            return (
              <motion.div
                key={obj.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-4 group"
              >
                {/* Timeline dot */}
                <div className="flex-shrink-0 flex flex-col items-center">
                  <motion.div
                    animate={!isCompleted && obj.status === 'activo' ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-3 h-3 rounded-full mt-1.5"
                    style={{
                      background: color,
                      boxShadow: `0 0 8px ${color}`,
                    }}
                  />
                  {i < sorted.length - 1 ? (
                    <div className="w-px flex-1 mt-2" style={{ background: `${color}20`, minHeight: '32px' }} />
                  ) : null}
                </div>

                {/* Content */}
                <div
                  className={`flex-1 glass-card p-4 mb-3 transition-all duration-300 group-hover:border-[${color}30]`}
                  style={{ opacity: isCompleted ? 0.55 : 1 }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3
                        className="font-mono-custom font-bold text-sm mb-1"
                        style={{
                          color: isCompleted ? '#64748B' : 'rgb(226, 232, 240)',
                          textDecoration: isCompleted ? 'line-through' : 'none',
                        }}
                      >
                        {obj.title}
                      </h3>
                      {obj.date_label ? (
                        <p className="font-mono-custom text-xs text-slate-600">{obj.date_label}</p>
                      ) : null}
                    </div>
                    <span
                      className="font-mono-custom text-xs px-2 py-1 rounded flex-shrink-0"
                      style={{ color, background: `${color}15` }}
                    >
                      {STATUS_LABELS[obj.status]}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </SectionWrapper>
  )
}
