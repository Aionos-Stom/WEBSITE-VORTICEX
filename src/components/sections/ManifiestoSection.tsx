'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Lock, Palette, Gauge, Eye, Bot, Shield, Zap, Code, Star, Cpu, Globe } from 'lucide-react'
import type { ManifestoItem } from '@/types/database'

// Icon mapping — editable from admin
const ICON_MAP: Record<string, React.ElementType> = {
  lock: Lock, palette: Palette, gauge: Gauge, eye: Eye, bot: Bot,
  shield: Shield, zap: Zap, code: Code, star: Star, cpu: Cpu, globe: Globe,
}

interface ManifiestoSectionProps {
  items?: ManifestoItem[]
}

export function ManifiestoSection({ items = [] }: ManifiestoSectionProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="manifiesto" className="relative z-10 py-28 px-4 md:px-8 overflow-hidden">
      {/* Dark background panel */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(5,5,20,0.95) 8%, rgba(5,5,20,0.95) 92%, transparent 100%)' }}
      />

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] opacity-[0.04] blur-[80px] rounded-full"
        style={{ background: 'radial-gradient(ellipse, #00FF88 0%, #9B5CFF 60%, transparent 100%)' }}
      />

      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="font-mono-custom text-xs text-[#00FF88] opacity-60 mb-3 tracking-widest uppercase">
            // engineering_creed.manifest
          </p>
          <h2
            className="font-mono-custom font-black mb-4"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              background: 'linear-gradient(135deg, #00FF88 0%, #00E5FF 60%, #9B5CFF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: 'none',
            }}
          >
            El Manifiesto Técnico
          </h2>
          <p className="font-mono-custom text-sm text-slate-500 max-w-xl mx-auto">
            {items.length > 0
              ? `${items.length} leyes que gobiernan cada decisión técnica, arquitectónica y de diseño.`
              : 'Cinco leyes que gobiernan cada decisión técnica, arquitectónica y de diseño.'}
          </p>
          <div className="mt-5 h-px max-w-xs mx-auto rounded-full"
            style={{ background: 'linear-gradient(90deg, transparent, #00FF88, transparent)' }}
          />
        </motion.div>

        {/* Creeds */}
        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-mono-custom text-slate-600">{'> sin_leyes — agrega desde /admin/manifiesto'}</p>
          </div>
        ) : (
          <div ref={ref} className="space-y-4">
            {items.map((c, i) => {
              const Icon = ICON_MAP[c.icon_name] ?? Lock
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.12, ease: [0.4, 0, 0.2, 1] }}
                  className="group relative flex items-start gap-5 rounded-2xl p-6 border transition-all duration-300"
                  style={{
                    borderColor: `${c.color}18`,
                    background: `${c.color}04`,
                  }}
                  whileHover={{
                    borderColor: `${c.color}35`,
                    background: `${c.color}08`,
                    transition: { duration: 0.2 },
                  }}
                >
                  {/* Number + Icon */}
                  <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ background: `${c.color}12`, border: `1px solid ${c.color}30` }}
                    >
                      <Icon size={20} style={{ color: c.color }} strokeWidth={1.5} />
                    </div>
                    <span
                      className="font-mono-custom font-black text-[0.6rem] tracking-widest"
                      style={{ color: c.color, opacity: 0.5 }}
                    >
                      {c.number}
                    </span>
                  </div>

                  <div className="flex-1 pt-1 min-w-0">
                    <h3
                      className="font-mono-custom font-black text-base md:text-lg leading-tight mb-2"
                      style={{ color: c.color }}
                    >
                      {c.title}
                    </h3>
                    <p className="font-mono-custom text-xs md:text-sm text-slate-400 leading-relaxed">
                      {c.body}
                    </p>
                  </div>

                  {/* Side accent */}
                  <motion.div
                    className="absolute left-0 top-6 bottom-6 w-px rounded-full"
                    style={{ background: c.color }}
                    initial={{ scaleY: 0, originY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                  />
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Bottom quote */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="font-mono-custom text-xs text-slate-600 text-center mt-12 italic"
        >
          &ldquo;Think like an attacker. Build like a defender. Design like an artist. Ship like an engineer.&rdquo;
        </motion.p>
      </div>
    </section>
  )
}
