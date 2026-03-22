'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { SectionWrapper } from '@/components/ui/SectionWrapper'
import type { ActivityLog, Certificate } from '@/types/database'
import { ACTIVITY_TYPES, XP_LEVELS } from '@/types/database'

interface ActivitySectionProps {
  activities: ActivityLog[]
  certificates: Certificate[]
}

function getLevel(xp: number) {
  return XP_LEVELS.find((l) => xp >= l.min && xp < l.max) ?? XP_LEVELS[XP_LEVELS.length - 1]!
}

function calcStreak(certs: Certificate[]): number {
  if (certs.length === 0) return 0
  const months = certs
    .map((c) => c.created_at.slice(0, 7))
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort()
    .reverse()

  let streak = 0
  const cursor = new Date()
  cursor.setDate(1)

  for (const m of months) {
    const [y, mo] = m.split('-').map(Number) as [number, number]
    if (cursor.getFullYear() === y && cursor.getMonth() + 1 === mo) {
      streak++
      cursor.setMonth(cursor.getMonth() - 1)
    } else {
      break
    }
  }
  return streak
}

function RingProgress({ pct, color, size = 100, stroke = 8, label, value }: {
  pct: number; color: string; size?: number; stroke?: number; label: string; value: string
}): JSX.Element {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <div ref={ref} className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={color} strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={inView ? { strokeDashoffset: circ - (pct / 100) * circ } : {}}
            transition={{ duration: 1.6, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono-custom font-black text-lg" style={{ color }}>{value}</span>
        </div>
      </div>
      <span className="font-mono-custom text-xs text-slate-500 text-center">{label}</span>
    </div>
  )
}

function XPBar({ xp, level }: { xp: number; level: ReturnType<typeof getLevel> }): JSX.Element {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const pct = level.max === Infinity ? 100 : Math.min(100, ((xp - level.min) / (level.max - level.min)) * 100)

  return (
    <div ref={ref} className="w-full">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono-custom text-xs text-slate-400">LVL {level.level}</span>
          <span className="font-mono-custom text-sm font-bold text-[#00E5FF]">{level.name}</span>
        </div>
        <span className="font-mono-custom text-xs text-slate-500">{xp.toLocaleString()} XP</span>
      </div>
      <div className="h-2 bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #00E5FF, #9B5CFF, #00FF88)',
            boxShadow: '0 0 12px rgba(0,229,255,0.5)',
          }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : {}}
          transition={{ duration: 1.8, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
        />
      </div>
      {level.max !== Infinity ? (
        <div className="flex justify-between mt-1">
          <span className="font-mono-custom text-[0.6rem] text-slate-600">{level.min.toLocaleString()}</span>
          <span className="font-mono-custom text-[0.6rem] text-slate-600">→ {level.max.toLocaleString()} XP para {XP_LEVELS[level.level]?.name ?? 'MAX'}</span>
        </div>
      ) : (
        <p className="font-mono-custom text-[0.6rem] text-[#00FF88] mt-1 text-center">★ NIVEL MÁXIMO ALCANZADO ★</p>
      )}
    </div>
  )
}

function TypeBar({ t, i, maxCount }: {
  t: { type: ActivityLog['type']; icon: string; label: string; color: string; count: number; xp: number }
  i: number
  maxCount: number
}): JSX.Element {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  return (
    <div ref={ref} className="flex items-center gap-4">
      <span className="text-base w-6 text-center">{t.icon}</span>
      <span className="font-mono-custom text-xs text-slate-400 w-24 flex-shrink-0">{t.label}</span>
      <div className="flex-1 h-1.5 bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: t.color, boxShadow: `0 0 8px ${t.color}50` }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${(t.count / maxCount) * 100}%` } : {}}
          transition={{ duration: 1.2, delay: i * 0.08, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
      <span className="font-mono-custom text-xs w-12 text-right" style={{ color: t.color }}>
        +{t.xp} xp
      </span>
    </div>
  )
}

export function ActivitySection({ activities, certificates }: ActivitySectionProps): JSX.Element {
  const totalXP = activities.reduce((s, a) => s + (a.xp_gained ?? 0), 0)
  const streak = calcStreak(certificates)
  const level = getLevel(totalXP)
  const recent = [...activities].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8)

  // Stats by type
  const byType = Object.entries(ACTIVITY_TYPES).map(([type, meta]) => ({
    type: type as ActivityLog['type'],
    ...meta,
    count: activities.filter((a) => a.type === type).length,
    xp: activities.filter((a) => a.type === type).reduce((s, a) => s + a.xp_gained, 0),
  })).filter((t) => t.count > 0)

  const maxCount = Math.max(...byType.map((t) => t.count), 1)

  return (
    <SectionWrapper id="actividad" label="// growth.log" title="Actividad & Crecimiento" titleColor="green">
      {activities.length === 0 && certificates.length === 0 ? (
        <div className="text-center text-slate-500 font-mono-custom py-12">
          {'> sin_actividad — registra actividades desde /admin'}
        </div>
      ) : (
        <div className="space-y-8 max-w-5xl">
          {/* HUD — rings + XP */}
          <div className="glass-card p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              {/* Rings */}
              <div className="flex gap-6 flex-shrink-0">
                <RingProgress
                  pct={Math.min(100, (totalXP / (XP_LEVELS[5]?.min ?? 12000)) * 100)}
                  color="#00E5FF"
                  size={96}
                  stroke={7}
                  label="Progreso Master"
                  value={`${Math.min(100, Math.round((totalXP / (XP_LEVELS[5]?.min ?? 12000)) * 100))}%`}
                />
                <RingProgress
                  pct={Math.min(100, streak * 10)}
                  color="#00FF88"
                  size={96}
                  stroke={7}
                  label="Racha certs"
                  value={`${streak}m`}
                />
                <RingProgress
                  pct={Math.min(100, (certificates.length / 20) * 100)}
                  color="#9B5CFF"
                  size={96}
                  stroke={7}
                  label="Certificados"
                  value={String(certificates.length)}
                />
              </div>

              {/* XP bar + info */}
              <div className="flex-1 w-full space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <motion.div
                    className="font-mono-custom text-xs px-3 py-1.5 rounded-full border"
                    style={{
                      color: '#00FF88',
                      borderColor: 'rgba(0,255,136,0.3)',
                      background: 'rgba(0,255,136,0.08)',
                      boxShadow: '0 0 15px rgba(0,255,136,0.15)',
                    }}
                    animate={{ boxShadow: ['0 0 15px rgba(0,255,136,0.15)', '0 0 25px rgba(0,255,136,0.3)', '0 0 15px rgba(0,255,136,0.15)'] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    ● MASTER EN SISTEMAS
                  </motion.div>
                  <span className="font-mono-custom text-xs text-slate-500">
                    {activities.length} actividades · {totalXP.toLocaleString()} XP total
                  </span>
                </div>
                <XPBar xp={totalXP} level={level} />
              </div>
            </div>
          </div>

          {/* Knowledge by type */}
          {byType.length > 0 ? (
            <div className="glass-card p-6">
              <p className="font-mono-custom text-xs text-slate-500 mb-5">{'// conocimiento_por_categoria'}</p>
              <div className="space-y-3">
                {byType.map((t, i) => (
                  <TypeBar key={t.type} t={t} i={i} maxCount={maxCount} />
                ))}
              </div>
            </div>
          ) : null}

          {/* Recent activity timeline */}
          {recent.length > 0 ? (
            <div>
              <p className="font-mono-custom text-xs text-slate-600 mb-4">{'// actividad_reciente'}</p>
              <div className="space-y-2">
                {recent.map((a, i) => {
                  const meta = ACTIVITY_TYPES[a.type]
                  return (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-start gap-3 group"
                    >
                      <div className="flex flex-col items-center flex-shrink-0">
                        <span className="text-sm">{meta.icon}</span>
                        {i < recent.length - 1 ? (
                          <div className="w-px flex-1 mt-1 min-h-[20px]" style={{ background: `${meta.color}20` }} />
                        ) : null}
                      </div>
                      <div className="glass-card p-3 flex-1 mb-1 group-hover:border-opacity-40 transition-all duration-200"
                        style={{ borderColor: `${meta.color}20` }}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono-custom text-sm text-slate-200">{a.title}</span>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="font-mono-custom text-xs" style={{ color: meta.color }}>+{a.xp_gained} xp</span>
                            <span className="font-mono-custom text-[0.6rem] text-slate-600">{a.date}</span>
                          </div>
                        </div>
                        {a.description ? (
                          <p className="font-mono-custom text-xs text-slate-500 mt-1">{a.description}</p>
                        ) : null}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </SectionWrapper>
  )
}
