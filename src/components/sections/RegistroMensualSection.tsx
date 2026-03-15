'use client'

import { motion } from 'framer-motion'
import { SectionWrapper } from '@/components/ui/SectionWrapper'
import { GlassCard } from '@/components/ui/GlassCard'
import type { RegistroMensual } from '@/types/database'
import { formatMonth } from '@/lib/utils'

interface RegistroMensualSectionProps {
  registros: RegistroMensual[]
}

interface StatItemProps {
  label: string
  value: number
  unit?: string
  color: string
  max?: number
}

function StatItem({ label, value, unit = '', color, max = 100 }: StatItemProps): JSX.Element {
  const pct = Math.min((value / max) * 100, 100)

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="font-mono-custom text-xs text-slate-400">{label}</span>
        <span className="font-mono-custom text-xs font-bold" style={{ color }}>
          {value}{unit}
        </span>
      </div>
      <div className="skill-bar">
        <motion.div
          className="skill-bar-fill"
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
        />
      </div>
    </div>
  )
}

export function RegistroMensualSection({ registros }: RegistroMensualSectionProps): JSX.Element {
  const latest = registros[0]

  return (
    <SectionWrapper
      id="registro"
      label="// data_stream.log"
      title="Registro Mensual"
      titleColor="cyan"
    >
      {registros.length === 0 ? (
        <div className="text-center text-slate-500 font-mono-custom py-12">
          {'> no_data_found — ejecutar /admin para cargar registros'}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Current month highlight */}
          {latest ? (
            <GlassCard glow="cyan" hover={false} className="border-[rgba(0,229,255,0.3)]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                <div>
                  <p className="section-label mb-1">PERÍODO ACTIVO</p>
                  <h3 className="font-mono-custom text-2xl font-bold text-[#00E5FF]">
                    {formatMonth(latest.mes, latest.ano)}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono-custom text-xs text-slate-500">XP ganado:</span>
                  <span
                    className="font-mono-custom text-xl font-black text-[#00FF88]"
                    style={{ textShadow: '0 0 20px rgba(0,255,136,0.5)' }}
                  >
                    +{latest.nivel_xp.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <StatItem label="Horas de estudio" value={latest.horas_estudio} unit="h" color="#00E5FF" max={200} />
                <StatItem label="Certs completados" value={latest.certs_completados} color="#9B5CFF" max={10} />
                <StatItem label="Proyectos activos" value={latest.proyectos_activos} color="#00FF88" max={20} />
                <StatItem label="Vulns encontradas" value={latest.vulnerabilidades_encontradas} color="#F59E0B" max={50} />
              </div>

              {latest.notas ? (
                <div className="mt-6 p-4 rounded-lg bg-[rgba(0,229,255,0.03)] border border-[rgba(0,229,255,0.1)]">
                  <p className="font-mono-custom text-xs text-slate-500 mb-1">{'// notas'}</p>
                  <p className="font-mono-custom text-sm text-slate-300">{latest.notas}</p>
                </div>
              ) : null}
            </GlassCard>
          ) : null}

          {/* History grid */}
          {registros.length > 1 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {registros.slice(1).map((reg, i) => (
                <GlassCard key={reg.id} delay={i * 0.05} glow="purple" className="p-4">
                  <p className="font-mono-custom text-xs text-slate-500 mb-2">
                    {formatMonth(reg.mes, reg.ano)}
                  </p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="font-mono-custom text-xs text-slate-600">hrs</span>
                      <span className="font-mono-custom text-xs text-[#00E5FF]">{reg.horas_estudio}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-mono-custom text-xs text-slate-600">xp</span>
                      <span className="font-mono-custom text-xs text-[#00FF88]">+{reg.nivel_xp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-mono-custom text-xs text-slate-600">vulns</span>
                      <span className="font-mono-custom text-xs text-[#F59E0B]">{reg.vulnerabilidades_encontradas}</span>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </SectionWrapper>
  )
}
