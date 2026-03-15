'use client'

import { motion } from 'framer-motion'
import { SectionWrapper } from '@/components/ui/SectionWrapper'
import type { Logro } from '@/types/database'
import { getRarezaColor, formatDate } from '@/lib/utils'

interface LogrosSectionProps {
  logros: Logro[]
}

const TIPO_ICONS: Record<string, string> = {
  BADGE: '🏅',
  TROPHY: '🏆',
  STAR: '⭐',
  SHIELD: '🛡️',
}

const RAREZA_LABELS: Record<string, string> = {
  COMUN: 'COMÚN',
  RARO: 'RARO',
  EPICO: 'ÉPICO',
  LEGENDARIO: 'LEGENDARIO',
}

export function LogrosSection({ logros }: LogrosSectionProps): JSX.Element {
  return (
    <SectionWrapper
      id="logros"
      label="// achievements.dat"
      title="Logros"
      titleColor="purple"
    >
      {logros.length === 0 ? (
        <div className="text-center text-slate-500 font-mono-custom py-12">
          {'> sin_logros_registrados — completa misiones para desbloquear'}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {logros.map((logro, i) => {
            const color = getRarezaColor(logro.rareza)
            const icon = TIPO_ICONS[logro.tipo] ?? '🏅'

            return (
              <motion.div
                key={logro.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 200, damping: 20 }}
                whileHover={{ scale: 1.05, y: -4 }}
                className="group relative glass-card p-4 flex flex-col items-center text-center cursor-default transition-all duration-300"
                style={{ borderColor: `${color}20` }}
              >
                {/* Glow effect */}
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `radial-gradient(circle at center, ${color}08 0%, transparent 70%)` }}
                />

                {/* Rareza badge */}
                <span
                  className="font-mono-custom text-xs px-2 py-0.5 rounded mb-3 font-bold"
                  style={{ color, background: `${color}15`, fontSize: '0.6rem' }}
                >
                  {RAREZA_LABELS[logro.rareza]}
                </span>

                {/* Icon */}
                <motion.div
                  className="text-4xl mb-3"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                >
                  {icon}
                </motion.div>

                {/* Title */}
                <h3
                  className="font-mono-custom font-bold text-xs mb-1 group-hover:opacity-100 transition-colors"
                  style={{ color }}
                >
                  {logro.titulo}
                </h3>
                <p className="font-mono-custom text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {logro.descripcion}
                </p>

                {/* XP */}
                <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.05)] w-full">
                  <span className="font-mono-custom text-xs" style={{ color }}>
                    +{logro.puntos_xp} XP
                  </span>
                </div>

                {/* Date tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#0D0D1A] border border-[rgba(0,229,255,0.2)] rounded text-xs font-mono-custom text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {formatDate(logro.fecha)}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </SectionWrapper>
  )
}
