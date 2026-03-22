'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface TimeLeft {
  days: number; hours: number; minutes: number; seconds: number
}

function useCountdown(target: string): TimeLeft {
  const [t, setT] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  useEffect(() => {
    const tick = (): void => {
      const diff = Math.max(0, new Date(target).getTime() - Date.now())
      setT({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [target])
  return t
}

function CountUnit({ value, label }: { value: number; label: string }): JSX.Element {
  const str = String(value).padStart(2, '0')
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={str}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="font-mono-custom font-black text-4xl md:text-6xl text-[#00E5FF]"
            style={{
              textShadow: '0 0 30px rgba(0,229,255,0.6), 0 0 60px rgba(0,229,255,0.2)',
            }}
          >
            {str}
          </motion.div>
        </AnimatePresence>
      </div>
      <span className="font-mono-custom text-[0.65rem] text-slate-500 tracking-[0.3em] uppercase">{label}</span>
    </div>
  )
}

// Floating stars via CSS
function Stars(): JSX.Element {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 120 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 2.5 + 0.5,
            height: Math.random() * 2.5 + 0.5,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: i % 5 === 0 ? '#9B5CFF' : i % 3 === 0 ? '#00FF88' : '#00E5FF',
            opacity: Math.random() * 0.7 + 0.1,
            animation: `twinkle ${2 + Math.random() * 4}s ease-in-out ${Math.random() * 4}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

export default function ComingSoonPage(): JSX.Element {
  const router = useRouter()
  const [launchDate, setLaunchDate] = useState('2026-12-01')
  const [title, setTitle] = useState('Sistema en Construcción')
  const [subtitle, setSubtitle] = useState('Regresando con algo épico')

  useEffect(() => {
    fetch('/api/launch-config')
      .then((r) => r.json())
      .then((d) => {
        // If launch mode was disabled, redirect back to portfolio
        if (d.launch_mode !== 'true') {
          router.replace('/')
          return
        }
        if (d.launch_date) setLaunchDate(d.launch_date)
        if (d.launch_title) setTitle(d.launch_title)
        if (d.launch_subtitle) setSubtitle(d.launch_subtitle)
      })
      .catch(() => {/* use defaults */})
  }, [router])

  const time = useCountdown(launchDate)

  const launchDateObj = new Date(launchDate)
  const launchFormatted = launchDateObj.toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Keyframes inline */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.5); }
        }
        @keyframes planet-glow {
          0%, 100% { box-shadow: 0 0 80px rgba(0,229,255,0.25), 0 0 160px rgba(155,92,255,0.15), inset -30px -20px 60px rgba(155,92,255,0.3); }
          50% { box-shadow: 0 0 120px rgba(0,229,255,0.4), 0 0 200px rgba(155,92,255,0.25), inset -30px -20px 60px rgba(155,92,255,0.4); }
        }
        @keyframes ring-pulse {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.5; }
        }
        @keyframes orbit1 { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes orbit2 { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        @keyframes orbit3 { from { transform: rotate(30deg); } to { transform: rotate(390deg); } }
        @keyframes float-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <Stars />

      {/* Grid bg */}
      <div className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,229,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.025) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Ambient glows */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.04) 0%, transparent 70%)' }} />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(155,92,255,0.05) 0%, transparent 70%)' }} />

      <div className="relative z-10 flex flex-col items-center gap-12 px-6 text-center max-w-4xl mx-auto">

        {/* Planet system */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative flex items-center justify-center"
          style={{ width: 340, height: 340 }}
        >
          {/* Outer orbit ring */}
          <div className="absolute rounded-full border border-dashed"
            style={{
              width: 320, height: 320,
              borderColor: 'rgba(0,229,255,0.15)',
              animation: 'orbit2 40s linear infinite',
            }}
          >
            {/* Moon 1 */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
              style={{ background: '#00E5FF', boxShadow: '0 0 12px rgba(0,229,255,0.8)' }} />
          </div>

          {/* Middle orbit ring */}
          <div className="absolute rounded-full"
            style={{
              width: 240, height: 240,
              border: '1px solid rgba(155,92,255,0.2)',
              animation: 'orbit1 22s linear infinite',
            }}
          >
            {/* Moon 2 */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 rounded-full"
              style={{ background: '#9B5CFF', boxShadow: '0 0 10px rgba(155,92,255,0.8)' }} />
          </div>

          {/* Inner orbit */}
          <div className="absolute rounded-full border border-dashed"
            style={{
              width: 180, height: 180,
              borderColor: 'rgba(0,255,136,0.15)',
              animation: 'orbit3 14s linear infinite',
            }}
          >
            {/* Moon 3 */}
            <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
              style={{ background: '#00FF88', boxShadow: '0 0 8px rgba(0,255,136,0.8)' }} />
          </div>

          {/* Saturn-like ring */}
          <div className="absolute rounded-full"
            style={{
              width: 160, height: 40,
              border: '3px solid rgba(0,229,255,0.15)',
              borderRadius: '50%',
              transform: 'rotateX(75deg)',
              animation: 'ring-pulse 3s ease-in-out infinite',
            }}
          />

          {/* Planet */}
          <div className="relative rounded-full overflow-hidden"
            style={{
              width: 120, height: 120,
              background: 'radial-gradient(ellipse at 35% 35%, #1a0a3a 0%, #0a0520 40%, #000010 100%)',
              animation: 'planet-glow 4s ease-in-out infinite',
            }}
          >
            {/* Surface details */}
            <div className="absolute inset-0 rounded-full opacity-30"
              style={{
                background: 'repeating-linear-gradient(20deg, transparent, transparent 8px, rgba(155,92,255,0.15) 8px, rgba(155,92,255,0.15) 10px)',
              }}
            />
            {/* Atmosphere */}
            <div className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(ellipse at 30% 30%, rgba(0,229,255,0.2) 0%, transparent 60%)',
              }}
            />
            {/* City lights effect */}
            <div className="absolute bottom-4 right-6 w-1 h-1 rounded-full bg-[#00E5FF] opacity-60"
              style={{ boxShadow: '4px 2px 0 rgba(0,229,255,0.4), 8px 5px 0 rgba(0,229,255,0.2)' }} />
          </div>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="space-y-3"
        >
          <p className="font-mono-custom text-xs text-[#00FF88] tracking-[0.3em] uppercase">
            ⬡ SISTEMA EN ESPERA ⬡
          </p>
          <h1
            className="font-mono-custom font-black leading-tight"
            style={{
              fontSize: 'clamp(2rem, 6vw, 4rem)',
              background: 'linear-gradient(135deg, #00E5FF 0%, #9B5CFF 50%, #00FF88 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 40px rgba(0,229,255,0.3))',
            }}
          >
            {title}
          </h1>
          <p className="font-mono-custom text-slate-400 text-sm md:text-base">{subtitle}</p>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="glass-card p-6 md:p-10 border border-[rgba(0,229,255,0.15)] w-full"
          style={{ boxShadow: '0 0 60px rgba(0,229,255,0.08), 0 0 120px rgba(155,92,255,0.05)' }}
        >
          <p className="font-mono-custom text-xs text-slate-600 mb-6">{'// tiempo_restante'}</p>
          <div className="grid grid-cols-4 gap-4 md:gap-8">
            <CountUnit value={time.days}    label="Días" />
            <CountUnit value={time.hours}   label="Horas" />
            <CountUnit value={time.minutes} label="Min" />
            <CountUnit value={time.seconds} label="Seg" />
          </div>

          {/* Separators */}
          <div className="absolute top-1/2 -translate-y-1/2 left-1/4 font-mono-custom text-slate-600 text-2xl select-none hidden md:block">:</div>
          <div className="absolute top-1/2 -translate-y-1/2 left-1/2 font-mono-custom text-slate-600 text-2xl select-none hidden md:block">:</div>
          <div className="absolute top-1/2 -translate-y-1/2 left-3/4 font-mono-custom text-slate-600 text-2xl select-none hidden md:block">:</div>
        </motion.div>

        {/* Launch date */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="space-y-2"
        >
          <p className="font-mono-custom text-xs text-slate-600">{'// fecha_de_lanzamiento'}</p>
          <p className="font-mono-custom text-sm text-[#00E5FF] capitalize"
            style={{ textShadow: '0 0 20px rgba(0,229,255,0.4)' }}>
            {launchFormatted}
          </p>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="w-full max-w-md space-y-2"
        >
          <div className="flex justify-between font-mono-custom text-[0.65rem] text-slate-600">
            <span>construccion.exe</span>
            <span className="text-[#00FF88]">● EN PROGRESO</span>
          </div>
          <div className="h-1 bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #00E5FF, #9B5CFF, #00FF88)', boxShadow: '0 0 10px rgba(0,229,255,0.6)' }}
              initial={{ width: '0%' }}
              animate={{ width: '73%' }}
              transition={{ delay: 1.8, duration: 2, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>
        </motion.div>

        {/* Footer link to login */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <a
            href="/login"
            className="font-mono-custom text-xs text-slate-700 hover:text-slate-500 transition-colors"
          >
            [acceso_admin]
          </a>
        </motion.div>
      </div>
    </main>
  )
}
