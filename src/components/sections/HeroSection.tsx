'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { Perfil } from '@/types/database'
import Link from 'next/link'

interface HeroSectionProps {
  perfil: Perfil | null
}

function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }): JSX.Element {
  const [displayed, setDisplayed] = useState('')
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(timeout)
  }, [delay])

  useEffect(() => {
    if (!started) return
    let i = 0
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1))
      i++
      if (i >= text.length) clearInterval(interval)
    }, 60)
    return () => clearInterval(interval)
  }, [started, text])

  return (
    <span>
      {displayed}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="inline-block w-0.5 h-[1em] bg-[#00E5FF] ml-0.5 align-middle"
      />
    </span>
  )
}

export function HeroSection({ perfil }: HeroSectionProps): JSX.Element {
  const nombre = perfil?.nombre ?? 'Carlos Efrain'
  const alias = perfil?.alias ?? 'mellamobrau'
  const titulo = perfil?.titulo ?? 'Cybersecurity Developer & Full Stack Engineer'
  const bio = perfil?.bio ?? 'Think like an attacker. Build like a defender. Design like an artist.'

  const navLinks = [
    { href: '#registro', label: 'registro' },
    { href: '#arsenal', label: 'arsenal' },
    { href: '#misiones', label: 'misiones' },
    { href: '#certificados', label: 'certs' },
    { href: '#logros', label: 'logros' },
    { href: '#objetivos', label: 'objetivos' },
  ]

  return (
    <section className="relative z-10 min-h-screen flex flex-col">
      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between px-6 py-5 border-b border-[rgba(0,229,255,0.1)]"
      >
        <span className="font-mono-custom text-[#00E5FF] font-bold text-lg tracking-wider">
          &gt; {alias}_
        </span>
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-mono-custom text-sm text-slate-400 hover:text-[#00E5FF] transition-colors duration-200"
            >
              /{link.label}
            </a>
          ))}
        </div>
        <Link
          href="/admin"
          className="font-mono-custom text-xs text-slate-600 hover:text-[#9B5CFF] transition-colors duration-200 border border-[rgba(155,92,255,0.2)] px-3 py-1.5 rounded hover:border-[rgba(155,92,255,0.5)]"
        >
          [admin]
        </Link>
      </motion.nav>

      {/* Hero content */}
      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-4xl w-full">
          {/* Status indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 mb-6"
          >
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-[#00FF88] inline-block shadow-[0_0_8px_#00FF88]"
            />
            <span className="font-mono-custom text-xs text-[#00FF88] tracking-widest uppercase">
              {perfil?.disponible !== false ? 'SISTEMA ACTIVO — DISPONIBLE' : 'SISTEMA ACTIVO — NO DISPONIBLE'}
            </span>
          </motion.div>

          {/* Main title */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mb-4"
          >
            <span className="font-mono-custom text-slate-500 text-sm">
              {'// Identity verified'}
            </span>
            <h1 className="font-mono-custom font-black leading-none mt-2">
              <span
                className="block text-5xl md:text-7xl lg:text-8xl"
                style={{
                  background: 'linear-gradient(135deg, #00E5FF 0%, #9B5CFF 50%, #00FF88 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 40px rgba(0,229,255,0.3))',
                }}
              >
                {nombre}
              </span>
            </h1>
          </motion.div>

          {/* Alias */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="font-mono-custom text-2xl md:text-3xl text-[#00E5FF] mb-6 tracking-wide"
          >
            <TypewriterText text={`@${alias}`} delay={1000} />
          </motion.div>

          {/* Title */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="font-mono-custom text-slate-400 text-lg md:text-xl mb-8 max-w-2xl"
          >
            {titulo}
          </motion.p>

          {/* Bio quote */}
          <motion.blockquote
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="border-l-2 border-[#9B5CFF] pl-4 mb-12"
          >
            <p className="font-mono-custom text-slate-500 italic text-sm md:text-base">{`"${bio}"`}</p>
          </motion.blockquote>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
            className="flex flex-wrap gap-4"
          >
            <a href="#misiones" className="btn-primary">
              &gt; ver_misiones()
            </a>
            <a href="#arsenal" className="btn-primary" style={{ borderColor: 'rgba(155,92,255,0.4)', color: '#9B5CFF' }}>
              &gt; ver_arsenal()
            </a>
            {perfil?.github_url ? (
              <a
                href={perfil.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ borderColor: 'rgba(0,255,136,0.4)', color: '#00FF88' }}
              >
                &gt; github.exe
              </a>
            ) : null}
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2 }}
            className="mt-16 grid grid-cols-3 gap-6 border-t border-[rgba(0,229,255,0.1)] pt-8"
          >
            {[
              { label: 'XP Total', value: perfil?.total_xp?.toLocaleString() ?? '0', color: '#00E5FF' },
              { label: 'Nivel', value: `LVL ${perfil?.nivel ?? 1}`, color: '#9B5CFF' },
              { label: 'Ubicación', value: perfil?.ubicacion ?? 'Unknown', color: '#00FF88' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-mono-custom text-xs text-slate-600 uppercase tracking-widest">{stat.label}</p>
                <p className="font-mono-custom font-bold text-lg mt-1" style={{ color: stat.color }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="font-mono-custom text-xs text-slate-600">scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-px h-8 bg-gradient-to-b from-[#00E5FF] to-transparent"
        />
      </motion.div>
    </section>
  )
}
