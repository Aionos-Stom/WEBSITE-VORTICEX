'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import type { SiteConfig } from '@/types/database'
import { ImageUploadField } from '@/components/admin/ImageUploadField'
import { logAction } from '@/lib/audit'

const HERO_KEYS: Array<{ key: string; label: string; placeholder: string; type?: string }> = [
  { key: 'hero_name', label: 'Nombre / handle', placeholder: 'mellamobrau' },
  { key: 'hero_year', label: 'Año (pie de página)', placeholder: '2026' },
  { key: 'hero_subtitle', label: 'Subtítulo typewriter', placeholder: 'Cybersecurity Engineer · Full Stack Developer' },
  { key: 'hero_photo_url', label: 'URL foto de perfil', placeholder: 'https://...', type: 'url' },
  { key: 'recap_video_url', label: 'URL video recap', placeholder: 'https://...', type: 'url' },
]

const LAUNCH_KEYS: Array<{ key: string; label: string; placeholder: string; type?: string }> = [
  { key: 'launch_title', label: 'Título de la página de espera', placeholder: 'Sistema en Construcción' },
  { key: 'launch_subtitle', label: 'Subtítulo de la página de espera', placeholder: 'Regresando con algo épico' },
  { key: 'launch_date', label: 'Fecha de lanzamiento', placeholder: '2026-12-01', type: 'date' },
]

const BIO_KEYS: Array<{ key: string; label: string; placeholder: string; textarea?: boolean }> = [
  { key: 'bio_quote', label: 'Frase / quote de la sección Sobre Mí', placeholder: 'Donde la seguridad es el cimiento...', textarea: true },
  { key: 'bio_description', label: 'Descripción introductoria', placeholder: 'En un ecosistema digital saturado...', textarea: true },
  { key: 'bio_years', label: 'Años de experiencia', placeholder: '4+' },
  { key: 'bio_languages', label: 'Lenguajes dominados', placeholder: '12+' },
  { key: 'bio_clouds', label: 'Plataformas cloud', placeholder: '5' },
]

const SOCIAL_KEYS: Array<{ key: string; label: string; placeholder: string }> = [
  { key: 'contact_email', label: 'Email de contacto', placeholder: 'tu@email.com' },
  { key: 'github_url', label: 'GitHub URL', placeholder: 'https://github.com/usuario' },
  { key: 'linkedin_url', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/...' },
  { key: 'twitter_url', label: 'Twitter / X URL (opcional)', placeholder: 'https://twitter.com/...' },
]

const TERMINAL_KEYS: Array<{ key: string; label: string; placeholder: string }> = [
  { key: 'terminal_name', label: 'Nombre real (comando whoami)', placeholder: 'Johan Torres' },
  { key: 'terminal_alias', label: 'Alias (comando whoami)', placeholder: 'The Monarch Of Chaos' },
  { key: 'terminal_role', label: 'Rol (comando whoami)', placeholder: 'Arquitecto de Software & Defensor Digital' },
]

async function upsertKey(
  supabase: ReturnType<typeof createClient>,
  key: string,
  value: string,
): Promise<void> {
  const { error } = await supabase
    .from('site_config')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
  if (error) throw error
}

export default function AdminConfigPage(): JSX.Element {
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingLaunch, setSavingLaunch] = useState(false)
  const [savingPhoto, setSavingPhoto] = useState(false)
  const [savingBio, setSavingBio] = useState(false)
  const [savingSocial, setSavingSocial] = useState(false)
  const [savingTerminal, setSavingTerminal] = useState(false)
  const [toggling, setToggling] = useState(false)
  const supabase = createClient()

  const load = useCallback(async (): Promise<void> => {
    const { data: rows } = await supabase.from('site_config').select('*')
    const map: Record<string, string> = {}
    ;((rows ?? []) as SiteConfig[]).forEach((r) => { if (r.key) map[r.key] = r.value ?? '' })
    setValues(map)
    setLoading(false)
  }, [supabase])

  useEffect(() => { void load() }, [load])

  const launchActive = values['launch_mode'] === 'true'

  const handleToggleLaunch = async (): Promise<void> => {
    setToggling(true)
    try {
      const next = launchActive ? 'false' : 'true'
      await upsertKey(supabase, 'launch_mode', next)
      setValues((v) => ({ ...v, launch_mode: next }))
      void logAction(supabase, 'toggle', 'site_config', `launch_mode → ${next}`)
      toast.success(next === 'true' ? '🚀 Modo espera ACTIVADO' : '✅ Portfolio ONLINE')
    } catch { toast.error('Error al cambiar modo') } finally { setToggling(false) }
  }

  // Auto-save photo immediately after upload/crop
  const handlePhotoChange = async (url: string): Promise<void> => {
    setValues((v) => ({ ...v, hero_photo_url: url }))
    if (!url) return
    setSavingPhoto(true)
    try {
      await upsertKey(supabase, 'hero_photo_url', url)
      void logAction(supabase, 'upload', 'site_config', 'hero_photo_url')
      toast.success('Foto de perfil guardada')
    } catch { toast.error('Error al guardar la foto') } finally { setSavingPhoto(false) }
  }

  const handleSaveHero = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setSaving(true)
    try {
      for (const { key } of HERO_KEYS.filter((k) => k.key !== 'hero_photo_url')) {
        await upsertKey(supabase, key, values[key] ?? '')
      }
      toast.success('Config Hero guardada')
    } catch { toast.error('Error al guardar') } finally { setSaving(false) }
  }

  const handleSaveLaunch = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setSavingLaunch(true)
    try {
      for (const { key } of LAUNCH_KEYS) {
        await upsertKey(supabase, key, values[key] ?? '')
      }
      toast.success('Config lanzamiento guardada')
    } catch { toast.error('Error al guardar') } finally { setSavingLaunch(false) }
  }

  const handleSaveBio = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setSavingBio(true)
    try {
      for (const { key } of BIO_KEYS) {
        await upsertKey(supabase, key, values[key] ?? '')
      }
      void logAction(supabase, 'update', 'site_config', 'bio_keys')
      toast.success('Bio guardada')
    } catch { toast.error('Error al guardar') } finally { setSavingBio(false) }
  }

  const handleSaveSocial = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setSavingSocial(true)
    try {
      for (const { key } of SOCIAL_KEYS) {
        await upsertKey(supabase, key, values[key] ?? '')
      }
      void logAction(supabase, 'update', 'site_config', 'social_keys')
      toast.success('Redes sociales guardadas')
    } catch { toast.error('Error al guardar') } finally { setSavingSocial(false) }
  }

  const handleSaveTerminal = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setSavingTerminal(true)
    try {
      for (const { key } of TERMINAL_KEYS) {
        await upsertKey(supabase, key, values[key] ?? '')
      }
      void logAction(supabase, 'update', 'site_config', 'terminal_keys')
      toast.success('Datos del terminal guardados')
    } catch { toast.error('Error al guardar') } finally { setSavingTerminal(false) }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <span className="font-mono-custom text-slate-500 animate-pulse">{'> cargando_config...'}</span>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <p className="font-mono-custom text-xs text-[#FF4444] opacity-60 mb-1">{'// site_config'}</p>
        <h1 className="font-mono-custom text-2xl font-black text-[#FF4444]">Config Hero</h1>
      </div>

      {/* Launch mode toggle */}
      <div className="glass-card p-6 border" style={{ borderColor: launchActive ? 'rgba(155,92,255,0.4)' : 'rgba(0,229,255,0.12)' }}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="font-mono-custom text-xs text-slate-500 mb-1">{'// modo_lanzamiento'}</p>
            <p className="font-mono-custom font-bold text-slate-200">Modo Espera / Coming Soon</p>
            <p className="font-mono-custom text-xs text-slate-500 mt-1">
              {launchActive
                ? 'El portfolio muestra la página de cuenta regresiva'
                : 'El portfolio está visible normalmente'}
            </p>
          </div>
          <motion.button
            onClick={() => void handleToggleLaunch()}
            disabled={toggling}
            animate={{ scale: toggling ? 0.97 : 1 }}
            className="flex items-center gap-3 px-5 py-3 rounded-xl border font-mono-custom text-sm font-bold transition-all duration-300 disabled:opacity-60"
            style={launchActive ? {
              background: 'rgba(155,92,255,0.15)',
              borderColor: 'rgba(155,92,255,0.5)',
              color: '#9B5CFF',
              boxShadow: '0 0 20px rgba(155,92,255,0.2)',
            } : {
              background: 'rgba(0,229,255,0.06)',
              borderColor: 'rgba(0,229,255,0.25)',
              color: '#00E5FF',
            }}
          >
            <div className={`w-10 h-5 rounded-full relative transition-colors ${launchActive ? 'bg-[rgba(155,92,255,0.6)]' : 'bg-[rgba(255,255,255,0.1)]'}`}>
              <motion.div
                animate={{ x: launchActive ? 20 : 2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className={`absolute top-0.5 w-4 h-4 rounded-full ${launchActive ? 'bg-[#9B5CFF]' : 'bg-slate-500'}`}
                style={{ boxShadow: launchActive ? '0 0 8px rgba(155,92,255,0.8)' : 'none' }}
              />
            </div>
            {toggling ? 'cambiando...' : (launchActive ? 'MODO ESPERA ON' : 'MODO ESPERA OFF')}
          </motion.button>
        </div>

        {launchActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-3 rounded-lg bg-[rgba(155,92,255,0.06)] border border-[rgba(155,92,255,0.15)]"
          >
            <p className="font-mono-custom text-xs text-[#9B5CFF]">
              ⬡ El portfolio redirige a <span className="font-bold">/coming-soon</span> para visitantes no autenticados.
              Los administradores siguen viendo el portfolio normal.
            </p>
          </motion.div>
        )}
      </div>

      {/* Launch settings form */}
      <div className="glass-card p-6 border border-[rgba(155,92,255,0.12)]">
        <p className="font-mono-custom text-xs text-slate-500 mb-4">{'// config_pagina_espera'}</p>
        <form onSubmit={handleSaveLaunch} className="space-y-4">
          {LAUNCH_KEYS.map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">{label}</label>
              <input
                type={type ?? 'text'}
                value={values[key] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                className="input-field"
                placeholder={placeholder}
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={savingLaunch}
            className="btn-primary w-full py-2.5 disabled:opacity-50"
            style={{ borderColor: 'rgba(155,92,255,0.4)', color: '#9B5CFF' }}
          >
            {savingLaunch ? '> guardando...' : '> guardar_launch_config()'}
          </button>
        </form>
      </div>

      {/* Photo — standalone auto-save card */}
      <div className="glass-card p-6 border border-[rgba(255,68,68,0.12)]">
        <p className="font-mono-custom text-xs text-slate-500 mb-4">{'// foto_de_perfil — se guarda automáticamente al subir'}</p>
        <div className="flex gap-6 items-start flex-wrap">
          {/* Avatar preview */}
          <div className="flex-shrink-0 flex flex-col items-center gap-3">
            <div
              className="relative rounded-full overflow-hidden border-2 flex-shrink-0"
              style={{
                width: 100, height: 100,
                borderColor: 'rgba(0,229,255,0.3)',
                boxShadow: '0 0 30px rgba(0,229,255,0.15)',
                background: 'rgba(0,229,255,0.04)',
              }}
            >
              {values['hero_photo_url'] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={values['hero_photo_url']}
                  alt="perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-mono-custom text-slate-600 text-3xl">?</span>
                </div>
              )}
              {savingPhoto && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="font-mono-custom text-[0.6rem] text-[#00E5FF] animate-pulse">guardando</span>
                </div>
              )}
            </div>
            <span className="font-mono-custom text-[0.6rem] text-slate-600">preview circular</span>
          </div>

          {/* Upload field */}
          <div className="flex-1 min-w-0">
            <ImageUploadField
              label="Foto de perfil"
              value={values['hero_photo_url'] ?? ''}
              onChange={(url) => void handlePhotoChange(url)}
              prefix="perfil"
            />
            {savingPhoto && (
              <p className="font-mono-custom text-xs text-[#00E5FF] mt-2 animate-pulse">
                ⟳ guardando en base de datos...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Hero text settings */}
      <div className="glass-card p-6 border border-[rgba(255,68,68,0.12)]">
        <p className="font-mono-custom text-xs text-slate-500 mb-4">{'// config_hero_portfolio'}</p>
        <form onSubmit={handleSaveHero} className="space-y-4">
          {HERO_KEYS.filter((k) => k.key !== 'hero_photo_url').map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">{label}</label>
              <input
                type={type ?? 'text'}
                value={values[key] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                className="input-field"
                placeholder={placeholder}
              />
            </div>
          ))}
          <button type="submit" disabled={saving} className="btn-primary w-full py-3 disabled:opacity-50" style={{ borderColor: 'rgba(255,68,68,0.4)', color: '#FF4444' }}>
            {saving ? '> guardando...' : '> guardar_hero_config()'}
          </button>
        </form>
      </div>

      {/* Bio / Sobre Mi */}
      <div className="glass-card p-6 border border-[rgba(155,92,255,0.12)]">
        <p className="font-mono-custom text-xs text-[#9B5CFF] opacity-60 mb-1">{'// sobre_mi'}</p>
        <p className="font-mono-custom font-bold text-slate-200 mb-4">Bio & Sobre Mí</p>
        <form onSubmit={handleSaveBio} className="space-y-4">
          {BIO_KEYS.map(({ key, label, placeholder, textarea }) => (
            <div key={key}>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">{label}</label>
              {textarea ? (
                <textarea
                  value={values[key] ?? ''}
                  onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                  className="input-field resize-none"
                  rows={3}
                  placeholder={placeholder}
                />
              ) : (
                <input
                  value={values[key] ?? ''}
                  onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                  className="input-field"
                  placeholder={placeholder}
                />
              )}
            </div>
          ))}
          <button type="submit" disabled={savingBio} className="btn-primary w-full py-2.5 disabled:opacity-50" style={{ borderColor: 'rgba(155,92,255,0.4)', color: '#9B5CFF' }}>
            {savingBio ? '> guardando...' : '> guardar_bio()'}
          </button>
        </form>
      </div>

      {/* Social / Contacto */}
      <div className="glass-card p-6 border border-[rgba(0,229,255,0.12)]">
        <p className="font-mono-custom text-xs text-[#00E5FF] opacity-60 mb-1">{'// redes_sociales'}</p>
        <p className="font-mono-custom font-bold text-slate-200 mb-4">Contacto & Redes Sociales</p>
        <form onSubmit={handleSaveSocial} className="space-y-4">
          {SOCIAL_KEYS.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">{label}</label>
              <input
                type="text"
                value={values[key] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                className="input-field"
                placeholder={placeholder}
              />
            </div>
          ))}
          <button type="submit" disabled={savingSocial} className="btn-primary w-full py-2.5 disabled:opacity-50">
            {savingSocial ? '> guardando...' : '> guardar_redes()'}
          </button>
        </form>
      </div>

      {/* Terminal identity */}
      <div className="glass-card p-6 border border-[rgba(0,255,136,0.12)]">
        <p className="font-mono-custom text-xs text-[#00FF88] opacity-60 mb-1">{'// terminal_identity'}</p>
        <p className="font-mono-custom font-bold text-slate-200 mb-1">Terminal — Comando whoami</p>
        <p className="font-mono-custom text-xs text-slate-500 mb-4">Datos que aparecen al ejecutar &apos;whoami&apos; en el terminal del portfolio</p>
        <form onSubmit={handleSaveTerminal} className="space-y-4">
          {TERMINAL_KEYS.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">{label}</label>
              <input
                value={values[key] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                className="input-field"
                placeholder={placeholder}
              />
            </div>
          ))}
          <button type="submit" disabled={savingTerminal} className="btn-primary w-full py-2.5 disabled:opacity-50" style={{ borderColor: 'rgba(0,255,136,0.4)', color: '#00FF88' }}>
            {savingTerminal ? '> guardando...' : '> guardar_terminal()'}
          </button>
        </form>
      </div>
    </div>
  )
}
