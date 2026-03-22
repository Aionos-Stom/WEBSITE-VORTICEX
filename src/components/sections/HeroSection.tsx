'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import type { SiteConfigMap, Stat } from '@/types/database'
import Link from 'next/link'
import { TerminalTrigger } from '@/components/ui/InteractiveTerminal'

interface HeroSectionProps {
  config: SiteConfigMap
  stats: Stat[]
}

function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }): JSX.Element {
  const [displayed, setDisplayed] = useState('')
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  useEffect(() => {
    if (!started) return
    let i = 0
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1))
      i++
      if (i >= text.length) clearInterval(interval)
    }, 45)
    return () => clearInterval(interval)
  }, [started, text])

  return (
    <span>
      {displayed}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.7, repeat: Infinity }}
        className="inline-block w-0.5 h-[1em] bg-[#00E5FF] ml-0.5 align-middle"
      />
    </span>
  )
}

const NAV_LINKS = [
  { href: '#sobre-mi', label: 'sobre_mi' },
  { href: '#servicios', label: 'servicios' },
  { href: '#arsenal', label: 'skills' },
  { href: '#misiones', label: 'proyectos' },
  { href: '#manifiesto', label: 'manifiesto' },
  { href: '#contacto', label: 'contacto' },
]

function getSocialLinks(config: SiteConfigMap) {
  return [
    config.github_url   ? { label: 'gh', href: config.github_url }   : null,
    config.linkedin_url ? { label: 'li', href: config.linkedin_url } : null,
    config.twitter_url  ? { label: 'tw', href: config.twitter_url }  : null,
  ].filter(Boolean) as Array<{ label: string; href: string }>
}

function FloatingGeometry(): JSX.Element {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Top-right rotating hexagon */}
      <motion.div
        className="absolute top-20 right-10 opacity-10"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        style={{ width: 180, height: 180 }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon
            points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
            fill="none"
            stroke="#00E5FF"
            strokeWidth="0.8"
          />
        </svg>
      </motion.div>

      {/* Bottom-left triangle */}
      <motion.div
        className="absolute bottom-32 left-8 opacity-8"
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        style={{ width: 120, height: 120 }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon
            points="50,5 97,90 3,90"
            fill="none"
            stroke="#9B5CFF"
            strokeWidth="0.8"
          />
        </svg>
      </motion.div>

      {/* Center-right circles */}
      <motion.div
        className="absolute top-1/2 right-24 opacity-6"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        style={{ width: 260, height: 260, translateY: '-50%' }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#00FF88" strokeWidth="0.4" strokeDasharray="4 6" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="#00E5FF" strokeWidth="0.3" strokeDasharray="2 8" />
        </svg>
      </motion.div>
    </div>
  )
}

export function HeroSection({ config, stats }: HeroSectionProps): JSX.Element {
  const heroRef = useRef<HTMLElement>(null)
  const socialLinks = getSocialLinks(config)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -80])
  const opacityParallax = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <section ref={heroRef} className="relative z-10 min-h-screen flex flex-col overflow-hidden">
      <FloatingGeometry />

      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-20 flex items-center justify-between px-6 md:px-10 py-5 border-b border-[rgba(0,229,255,0.08)]"
      >
        <span className="font-mono-custom text-[#00E5FF] font-black text-lg tracking-wider">
          &gt; {config.hero_name.split(' ')[0]?.toLowerCase() ?? 'me'}_
        </span>
        <div className="hidden md:flex items-center gap-5">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-mono-custom text-xs text-slate-500 hover:text-[#00E5FF] transition-colors duration-200 tracking-wider"
            >
              /{link.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {socialLinks.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono-custom text-xs text-slate-600 hover:text-[#9B5CFF] transition-colors border border-[rgba(155,92,255,0.15)] hover:border-[rgba(155,92,255,0.4)] px-2.5 py-1.5 rounded-lg"
            >
              [{s.label}]
            </a>
          ))}
          <Link
            href="/admin"
            className="font-mono-custom text-xs text-slate-600 hover:text-[#9B5CFF] transition-colors border border-[rgba(155,92,255,0.15)] hover:border-[rgba(155,92,255,0.4)] px-2.5 py-1.5 rounded-lg"
          >
            [admin]
          </Link>
        </div>
      </motion.nav>

      {/* Hero content */}
      <motion.div
        style={{ y: yParallax, opacity: opacityParallax }}
        className="flex-1 flex items-center justify-center px-6 md:px-10 py-16"
      >
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — Text */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 mb-6"
            >
              <motion.span
                animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-[#00FF88] shadow-[0_0_10px_#00FF88]"
              />
              <span className="font-mono-custom text-xs text-[#00FF88] tracking-[0.2em] uppercase">
                SISTEMA ACTIVO — {config.hero_year}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.9 }}
              className="font-mono-custom font-black leading-[0.9] mb-3"
              style={{
                fontSize: 'clamp(3.2rem, 9vw, 7rem)',
                background: 'linear-gradient(135deg, #00E5FF 0%, #9B5CFF 50%, #00FF88 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 50px rgba(0,229,255,0.25))',
              }}
            >
              {config.hero_name}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="font-mono-custom font-black text-slate-300 mb-4 tracking-wide"
              style={{ fontSize: 'clamp(0.85rem, 2vw, 1.1rem)' }}
            >
              Arquitecto de Software &amp; Defensor Digital
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="font-mono-custom text-base md:text-lg text-[#00E5FF] mb-6 tracking-wide min-h-[1.8em]"
            >
              <TypewriterText text={config.hero_subtitle} delay={1100} />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="font-mono-custom text-xs text-slate-500 mb-8 max-w-sm leading-relaxed"
            >
              Donde la seguridad es el cimiento, el diseño es la religión y el rendimiento es innegociable.
              Construyo desde una premisa simple: pensar como atacante para construir como artesano.
            </motion.p>

            {/* Tags */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="flex flex-wrap gap-2 mb-8 justify-center lg:justify-start"
            >
              {['Full Stack', 'Cybersecurity', 'Cloud Arch', '3D Web'].map((tag) => (
                <span key={tag} className="tag-cyan">{tag}</span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="flex flex-wrap gap-4 justify-center lg:justify-start mb-6"
            >
              <a href="#misiones" className="btn-primary text-sm">&gt; ver_proyectos()</a>
              <a
                href="#certificados"
                className="btn-primary text-sm"
                style={{ borderColor: 'rgba(155,92,255,0.4)', color: '#9B5CFF' }}
              >
                &gt; ver_certs()
              </a>
            </motion.div>

            {/* Interactive terminal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.9 }}
              className="w-full flex justify-center lg:justify-start"
            >
              <TerminalTrigger config={config} />
            </motion.div>
          </div>

          {/* Right — Photo with 3D rings */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, rotateY: 15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ delay: 0.6, duration: 1, ease: [0.4, 0, 0.2, 1] }}
            className="flex justify-center"
            style={{ perspective: 1000 }}
          >
            <div className="relative flex items-center justify-center">
              {/* Outermost orbit */}
              <motion.div
                className="absolute rounded-full border border-dashed border-[rgba(0,229,255,0.12)]"
                style={{ width: 380, height: 380 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
              />
              {/* Middle orbit */}
              <motion.div
                className="absolute rounded-full border border-[rgba(155,92,255,0.15)]"
                style={{ width: 300, height: 300 }}
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              >
                {/* Orbiting dot */}
                <motion.div
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#9B5CFF] shadow-[0_0_12px_#9B5CFF]"
                />
              </motion.div>
              {/* Inner orbit */}
              <motion.div
                className="absolute rounded-full border border-dashed border-[rgba(0,255,136,0.1)]"
                style={{ width: 240, height: 240 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
              >
                <motion.div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-[#00FF88] shadow-[0_0_10px_#00FF88]"
                />
              </motion.div>

              {/* Photo container */}
              <div className="relative w-52 h-52 md:w-64 md:h-64 rounded-2xl overflow-hidden border border-[rgba(0,229,255,0.3)] shadow-[0_0_80px_rgba(0,229,255,0.15),0_0_30px_rgba(155,92,255,0.1)]">
                {config.hero_photo_url ? (
                  <img
                    src={config.hero_photo_url}
                    alt={config.hero_name}
                    className="w-full h-full object-cover"
                    style={{ imageRendering: 'auto' }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[rgba(0,229,255,0.05)] to-[rgba(155,92,255,0.05)] flex flex-col items-center justify-center gap-3">
                    <motion.span
                      className="text-5xl"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      🧑‍💻
                    </motion.span>
                    <span className="font-mono-custom text-xs text-slate-500">{'// foto_pendiente'}</span>
                  </div>
                )}
                {/* Scan line effect */}
                <motion.div
                  className="absolute left-0 right-0 h-px bg-[rgba(0,229,255,0.4)]"
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats bar */}
      {stats.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
          className="relative z-10 border-t border-[rgba(0,229,255,0.08)] py-7 px-6 md:px-10"
        >
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...stats].sort((a, b) => a.sort_order - b.sort_order).slice(0, 4).map((stat, i) => (
              <motion.div
                key={stat.id}
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.9 + i * 0.1 }}
              >
                <p
                  className="font-mono-custom font-black leading-none mb-1"
                  style={{
                    fontSize: 'clamp(1.6rem, 4vw, 2.5rem)',
                    background: i % 2 === 0
                      ? 'linear-gradient(135deg, #00E5FF, #9B5CFF)'
                      : 'linear-gradient(135deg, #9B5CFF, #00FF88)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {stat.value}{stat.suffix ?? ''}
                </p>
                <p className="font-mono-custom text-[0.65rem] text-slate-500 tracking-[0.15em] uppercase mt-1">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : null}

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
      >
        <span className="font-mono-custom text-[0.6rem] text-slate-600 tracking-widest">SCROLL</span>
        <motion.div
          animate={{ y: [0, 8, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="w-px h-10 bg-gradient-to-b from-[#00E5FF] to-transparent"
        />
      </motion.div>
    </section>
  )
}
