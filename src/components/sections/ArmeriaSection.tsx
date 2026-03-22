'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Monitor, Box, Server, Database, Cloud, Shield, Zap, Code, Cpu, Globe } from 'lucide-react'
import { SectionWrapper } from '@/components/ui/SectionWrapper'
import type { ArmeriaLayer } from '@/types/database'

const ICON_MAP: Record<string, React.ElementType> = {
  monitor: Monitor, box: Box, server: Server, database: Database,
  cloud: Cloud, shield: Shield, zap: Zap, code: Code, cpu: Cpu, globe: Globe,
}

interface ArmeriaSectionProps {
  layers?: ArmeriaLayer[]
}

export function ArmeriaSection({ layers = [] }: ArmeriaSectionProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const techList = (techs: string): string[] =>
    techs.split(',').map((t) => t.trim()).filter(Boolean)

  return (
    <SectionWrapper
      id="armeria"
      label="// tech_stack.layers"
      title="La Armería"
      titleColor="purple"
      centered
    >
      <p className="font-mono-custom text-sm text-slate-500 max-w-xl mx-auto mb-14">
        Tecnologías organizadas por capas de ejecución. Cada herramienta elegida por criterio técnico,
        no por tendencia.
      </p>

      {layers.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-mono-custom text-slate-600">{'> sin_capas — agrega desde /admin/armeria'}</p>
        </div>
      ) : (
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {layers.map((l, i) => {
            const Icon = ICON_MAP[l.icon_name] ?? Monitor
            const techs = techList(l.techs)
            return (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: i * 0.1, ease: [0.4, 0, 0.2, 1] }}
                className="relative rounded-xl border p-5 text-left transition-all duration-300 group"
                style={{ borderColor: `${l.color}25`, background: `${l.color}04` }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${l.color}12`, border: `1px solid ${l.color}25` }}
                  >
                    <Icon size={16} style={{ color: l.color }} strokeWidth={1.5} />
                  </div>
                  <p className="font-mono-custom font-black text-sm" style={{ color: l.color }}>
                    {l.layer_name}
                  </p>
                </div>

                {/* Tech tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {techs.map((tech) => (
                    <span
                      key={tech}
                      className="font-mono-custom text-[0.62rem] px-2.5 py-0.5 rounded-md border transition-colors duration-200"
                      style={{ color: l.color, borderColor: `${l.color}25`, background: 'rgba(0,0,0,0.3)' }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Philosophy */}
                {l.philosophy && (
                  <p
                    className="font-mono-custom text-[0.65rem] text-slate-500 leading-relaxed border-t pt-3"
                    style={{ borderColor: `${l.color}15` }}
                  >
                    {l.philosophy}
                  </p>
                )}

                {/* Glow corner */}
                <div
                  className="absolute top-0 right-0 w-16 h-16 rounded-tr-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ background: `radial-gradient(circle at top right, ${l.color}20, transparent 70%)` }}
                />
              </motion.div>
            )
          })}
        </div>
      )}
    </SectionWrapper>
  )
}
