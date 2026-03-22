'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Shield, Layers, Cloud, Cpu, Code2, Zap } from 'lucide-react'
import { SectionWrapper } from '@/components/ui/SectionWrapper'
import type { SiteConfigMap } from '@/types/database'

const PILLARS = [
  {
    icon: Shield,
    color: '#00E5FF',
    border: 'rgba(0,229,255,0.2)',
    glow: 'rgba(0,229,255,0.08)',
    number: '01',
    title: 'Ciberseguridad por Diseño',
    subtitle: 'Zero Trust · OWASP Top 10 · DevSecOps',
    body: 'No implemento seguridad como un parche de último minuto. Diseño sistemas basados en Zero Trust, cumplimiento de OWASP Top 10 y validación estricta de datos en cada capa. Cada línea de código es un vector de ataque potencial que neutralizo antes de desplegar.',
    tags: ['Threat Modeling', 'AES-256-GCM', 'OAuth 2.0 / PKCE', 'WAF', 'SBOM'],
  },
  {
    icon: Layers,
    color: '#9B5CFF',
    border: 'rgba(155,92,255,0.2)',
    glow: 'rgba(155,92,255,0.08)',
    number: '02',
    title: 'UI/UX Sensorial & 3D',
    subtitle: 'Three.js · React Three Fiber · GSAP',
    body: 'La web debe ser experimentada, no solo navegada. Especialista en Three.js y React Three Fiber, transformo interfaces planas en entornos tridimensionales fluidos que respetan los estándares más exigentes de accesibilidad, rendimiento y diseño emocional.',
    tags: ['GLSL Shaders', 'WebGPU', 'Framer Motion', 'Design Tokens', 'WCAG AA'],
  },
  {
    icon: Cloud,
    color: '#00FF88',
    border: 'rgba(0,255,136,0.2)',
    glow: 'rgba(0,255,136,0.08)',
    number: '03',
    title: 'Escalabilidad Multi-Cloud',
    subtitle: 'AWS · GCP · Azure · Huawei Cloud',
    body: 'Con dominio experto en las cuatro grandes plataformas cloud, orquesto infraestructuras mediante Terraform y Kubernetes, asegurando que el producto escale globalmente con latencia mínima, resiliencia máxima y costos optimizados.',
    tags: ['Terraform IaC', 'Kubernetes', 'Edge Computing', 'CI/CD', 'Observability'],
  },
]

interface SobreMiSectionProps {
  config?: Pick<SiteConfigMap, 'bio_quote' | 'bio_description' | 'bio_years' | 'bio_languages' | 'bio_clouds'>
}

export function SobreMiSection({ config }: SobreMiSectionProps = {}): JSX.Element {
  const pillarsRef = useRef<HTMLDivElement>(null)
  const inView = useInView(pillarsRef, { once: true, margin: '-60px' })

  const quote = config?.bio_quote ?? 'Donde la seguridad es el cimiento, el diseño es la religión y el rendimiento es innegociable.'
  const description = config?.bio_description ?? 'En un ecosistema digital saturado, no basta con que una aplicación funcione. Mi enfoque se centra en la intersección de tres pilares críticos que definen cada decisión de arquitectura.'
  const years = config?.bio_years ?? '4+'
  const languages = config?.bio_languages ?? '12+'
  const clouds = config?.bio_clouds ?? '5'

  const MICRO_STATS = [
    { icon: Cpu, label: 'Años de experiencia', value: years },
    { icon: Code2, label: 'Lenguajes dominados', value: languages },
    { icon: Zap, label: 'Plataformas cloud', value: clouds },
    { icon: Shield, label: 'Stack de seguridad', value: 'OWASP' },
  ]

  return (
    <SectionWrapper
      id="sobre-mi"
      label="// filosofia_de_ingenieria.md"
      title="El Arte y la Guerra"
      titleColor="purple"
      centered
    >
      {/* Quote */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="font-mono-custom text-base md:text-lg text-slate-400 max-w-3xl mx-auto mb-4 leading-relaxed"
      >
        &quot;{quote}&quot;
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.35 }}
        className="font-mono-custom text-sm text-slate-500 max-w-2xl mx-auto mb-16 leading-relaxed"
      >
        {description}
      </motion.p>

      {/* Pillars */}
      <div ref={pillarsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {PILLARS.map((p, i) => {
          const Icon = p.icon
          return (
            <motion.div
              key={p.number}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="relative group rounded-2xl p-6 border text-left flex flex-col gap-4 transition-all duration-300"
              style={{
                borderColor: p.border,
                background: p.glow,
              }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              {/* Number watermark */}
              <span
                className="absolute top-4 right-5 font-mono-custom font-black text-5xl opacity-[0.06] select-none"
                style={{ color: p.color }}
              >
                {p.number}
              </span>

              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${p.glow}`, border: `1px solid ${p.border}` }}
              >
                <Icon size={22} style={{ color: p.color }} strokeWidth={1.5} />
              </div>

              <div>
                <p className="font-mono-custom font-black text-base mb-0.5" style={{ color: p.color }}>
                  {p.title}
                </p>
                <p className="font-mono-custom text-[0.65rem] text-slate-500 mb-3 tracking-wider">
                  {p.subtitle}
                </p>
                <p className="font-mono-custom text-xs text-slate-400 leading-relaxed">
                  {p.body}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-auto">
                {p.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono-custom text-[0.6rem] px-2 py-0.5 rounded-full border"
                    style={{ color: p.color, borderColor: p.border, background: 'rgba(0,0,0,0.3)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Micro stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
        {MICRO_STATS.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i, duration: 0.4 }}
              className="glass-card p-4 text-center flex flex-col items-center gap-2"
            >
              <Icon size={16} className="text-slate-500" strokeWidth={1.5} />
              <p
                className="font-mono-custom font-black text-2xl"
                style={{
                  background: 'linear-gradient(135deg, #00E5FF, #9B5CFF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {s.value}
              </p>
              <p className="font-mono-custom text-[0.6rem] text-slate-600 leading-tight">{s.label}</p>
            </motion.div>
          )
        })}
      </div>
    </SectionWrapper>
  )
}
