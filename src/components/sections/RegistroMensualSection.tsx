'use client'

import { motion } from 'framer-motion'
import { SectionWrapper } from '@/components/ui/SectionWrapper'
import { GlassCard } from '@/components/ui/GlassCard'
import type { MonthlyEntry } from '@/types/database'
import { MONTH_NAMES, STATUS_COLORS, STATUS_LABELS } from '@/types/database'

interface RegistroMensualSectionProps {
  entries: MonthlyEntry[]
}

function formatMonth(month: string): string {
  const [year, m] = month.split('-')
  const num = parseInt(m ?? '0', 10)
  return `${MONTH_NAMES[num] ?? month} ${year ?? ''}`
}

export function RegistroMensualSection({ entries }: RegistroMensualSectionProps): JSX.Element {
  const sorted = [...entries].sort((a, b) => b.month.localeCompare(a.month))
  const latest = sorted[0]
  const rest = sorted.slice(1)

  return (
    <SectionWrapper
      id="registro"
      label="// monthly_entries.log"
      title="Registro Mensual"
      titleColor="cyan"
    >
      {entries.length === 0 ? (
        <div className="text-center text-slate-500 font-mono-custom py-12">
          {'> no_entries_found — agrega registros desde /admin'}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Latest entry featured */}
          {latest ? (
            <GlassCard glow="cyan" hover={false} className="border-[rgba(0,229,255,0.3)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {latest.image_url ? (
                  <div className="h-56 rounded-xl overflow-hidden border border-[rgba(0,229,255,0.15)]">
                    <img src={latest.image_url} alt={latest.title} className="w-full h-full object-cover" />
                  </div>
                ) : null}
                <div className={latest.image_url ? '' : 'md:col-span-2'}>
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="font-mono-custom text-xs px-2 py-1 rounded"
                      style={{
                        color: STATUS_COLORS[latest.status] ?? '#00E5FF',
                        background: `${STATUS_COLORS[latest.status] ?? '#00E5FF'}15`,
                      }}
                    >
                      {STATUS_LABELS[latest.status]}
                    </span>
                    <span className="font-mono-custom text-xs text-slate-500">
                      {formatMonth(latest.month)}
                    </span>
                  </div>
                  <h3 className="font-mono-custom text-2xl font-bold mb-2">
                    {latest.highlight_word ? (
                      <>
                        <span className="text-slate-300">{latest.title.replace(latest.highlight_word, '')}</span>
                        <span className="text-[#00E5FF]" style={{ textShadow: '0 0 20px rgba(0,229,255,0.5)' }}>
                          {latest.highlight_word}
                        </span>
                      </>
                    ) : (
                      <span className="text-[#00E5FF]">{latest.title}</span>
                    )}
                  </h3>
                  {latest.description ? (
                    <p className="font-mono-custom text-sm text-slate-400 leading-relaxed">
                      {latest.description}
                    </p>
                  ) : null}
                </div>
              </div>
            </GlassCard>
          ) : null}

          {/* Rest of entries grid */}
          {rest.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rest.map((entry, i) => {
                const color = STATUS_COLORS[entry.status] ?? '#00E5FF'
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <GlassCard
                      hover
                      glow="none"
                      className="h-full"
                      style={{ borderColor: `${color}20` } as React.CSSProperties}
                    >
                      {entry.image_url ? (
                        <div className="h-32 rounded-lg overflow-hidden mb-3 border border-[rgba(255,255,255,0.05)]">
                          <img src={entry.image_url} alt={entry.title} className="w-full h-full object-cover opacity-80" />
                        </div>
                      ) : null}
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono-custom text-xs text-slate-500">{formatMonth(entry.month)}</span>
                        <span
                          className="font-mono-custom text-xs px-2 py-0.5 rounded"
                          style={{ color, background: `${color}15` }}
                        >
                          {entry.status}
                        </span>
                      </div>
                      <h3 className="font-mono-custom font-bold text-sm text-slate-200 mb-1 line-clamp-2">
                        {entry.highlight_word ? (
                          <>
                            {entry.title.split(entry.highlight_word)[0]}
                            <span style={{ color }}>{entry.highlight_word}</span>
                            {entry.title.split(entry.highlight_word)[1]}
                          </>
                        ) : entry.title}
                      </h3>
                      {entry.description ? (
                        <p className="font-mono-custom text-xs text-slate-500 line-clamp-2 mt-1">
                          {entry.description}
                        </p>
                      ) : null}
                    </GlassCard>
                  </motion.div>
                )
              })}
            </div>
          ) : null}
        </div>
      )}
    </SectionWrapper>
  )
}
