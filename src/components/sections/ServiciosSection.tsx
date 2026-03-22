'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Globe, ShieldCheck, Box, ChevronRight } from 'lucide-react'
import { SectionWrapper } from '@/components/ui/SectionWrapper'
import type { Service } from '@/types/database'

// Static icon for the first 3 service slots (backwards compat); admin can choose more
const ICON_SLOT = [Globe, ShieldCheck, Box]

function parseBullets(json: string): string[] {
  try { return JSON.parse(json) as string[] } catch { return json.split('\n').filter(Boolean) }
}

interface ServiciosSectionProps {
  services?: Service[]
}

export function ServiciosSection({ services = [] }: ServiciosSectionProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <SectionWrapper
      id="servicios"
      label="// engineering_services.ts"
      title="Servicios de Ingeniería Elite"
      titleColor="cyan"
      centered
    >
      <p className="font-mono-custom text-sm text-slate-500 max-w-2xl mx-auto mb-14">
        Tres disciplinas integradas. Un mismo estándar: seguro, performático, hermoso.
      </p>

      {services.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-mono-custom text-slate-600">{'> sin_servicios — agrega desde /admin/servicios'}</p>
        </div>
      ) : (
        <div ref={ref} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {services.map((s, i) => {
            const Icon = ICON_SLOT[i] ?? Globe
            const bullets = parseBullets(s.bullets)
            const stackArr = s.stack.split(',').map((t) => t.trim()).filter(Boolean)
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 50 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.65, delay: i * 0.15, ease: [0.4, 0, 0.2, 1] }}
                className="group relative rounded-2xl border p-7 flex flex-col text-left transition-all duration-300 hover:shadow-2xl"
                style={{ borderColor: `${s.color}25`, background: `${s.color}05` }}
                whileHover={{
                  y: -6,
                  boxShadow: `0 20px 60px ${s.color}25`,
                  transition: { duration: 0.25 },
                }}
              >
                {/* Number */}
                <span className="font-mono-custom font-black text-6xl leading-none mb-4 opacity-20 select-none" style={{ color: s.color }}>
                  {s.number}
                </span>

                {/* Icon + title */}
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${s.color}30` }}
                  >
                    <Icon size={18} style={{ color: s.color }} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-mono-custom font-black text-sm leading-tight text-slate-100">{s.title}</p>
                    <p className="font-mono-custom text-[0.62rem] mt-0.5" style={{ color: s.color }}>{s.tagline}</p>
                  </div>
                </div>

                <p className="font-mono-custom text-xs text-slate-400 leading-relaxed mb-5">{s.description}</p>

                {/* Bullets */}
                {bullets.length > 0 && (
                  <ul className="space-y-2 mb-6">
                    {bullets.map((b, bi) => (
                      <li key={bi} className="flex items-start gap-2">
                        <ChevronRight size={12} style={{ color: s.color, flexShrink: 0, marginTop: 2 }} />
                        <span className="font-mono-custom text-[0.68rem] text-slate-400 leading-relaxed">{b}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Stack tags */}
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {stackArr.map((tech) => (
                    <span
                      key={tech}
                      className="font-mono-custom text-[0.6rem] px-2 py-0.5 rounded border"
                      style={{ color: s.color, borderColor: `${s.color}25`, background: 'rgba(0,0,0,0.35)' }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Bottom accent line */}
                <motion.div
                  className="absolute bottom-0 left-7 right-7 h-px rounded-full"
                  style={{ background: `linear-gradient(90deg, ${s.color}, transparent)` }}
                  initial={{ scaleX: 0, originX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: 0.4 + i * 0.1 }}
                />
              </motion.div>
            )
          })}
        </div>
      )}
    </SectionWrapper>
  )
}
