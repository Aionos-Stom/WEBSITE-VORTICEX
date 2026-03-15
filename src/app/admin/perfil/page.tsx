'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { z } from 'zod'
import type { Perfil } from '@/types/database'

const PerfilSchema = z.object({
  nombre: z.string().min(1).max(100),
  alias: z.string().min(1).max(50),
  titulo: z.string().min(1).max(200),
  bio: z.string().min(1).max(1000),
  avatar_url: z.string().url().optional().or(z.literal('')),
  github_url: z.string().url().optional().or(z.literal('')),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  ubicacion: z.string().max(100).optional().or(z.literal('')),
  disponible: z.boolean(),
  total_xp: z.number().int().min(0),
  nivel: z.number().int().min(1).max(100),
})

const DEFAULT: Partial<Perfil> = {
  nombre: '', alias: '', titulo: '', bio: '',
  avatar_url: '', github_url: '', linkedin_url: '',
  email: '', ubicacion: '', disponible: true, total_xp: 0, nivel: 1,
}

export default function AdminPerfilPage(): JSX.Element {
  const [perfil, setPerfil] = useState<Partial<Perfil>>(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const loadPerfil = async (): Promise<void> => {
    const { data } = await supabase.from('perfil').select('*').single()
    if (data) setPerfil(data as Partial<Perfil>)
    setLoading(false)
  }

  useEffect(() => {
    void loadPerfil()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    const result = PerfilSchema.safeParse({
      ...perfil,
      total_xp: Number(perfil.total_xp),
      nivel: Number(perfil.nivel),
    })
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? 'Datos inválidos')
      return
    }

    setSaving(true)
    try {
      if (perfil.id) {
        const { error } = await supabase
          .from('perfil')
          .update({ ...result.data, updated_at: new Date().toISOString() })
          .eq('id', perfil.id)
        if (error) throw error
        toast.success('Perfil actualizado')
      } else {
        const { data, error } = await supabase.from('perfil').insert(result.data).select().single()
        if (error) throw error
        if (data) setPerfil(data)
        toast.success('Perfil creado')
      }
      await loadPerfil()
    } catch {
      toast.error('Error al guardar perfil')
    } finally {
      setSaving(false)
    }
  }

  const fields: Array<{ key: keyof typeof DEFAULT; label: string; type?: string; rows?: number }> = [
    { key: 'nombre', label: 'Nombre completo' },
    { key: 'alias', label: 'Alias / Handle' },
    { key: 'titulo', label: 'Título profesional' },
    { key: 'bio', label: 'Bio / Quote', type: 'textarea', rows: 3 },
    { key: 'ubicacion', label: 'Ubicación' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'github_url', label: 'GitHub URL', type: 'url' },
    { key: 'linkedin_url', label: 'LinkedIn URL', type: 'url' },
    { key: 'avatar_url', label: 'Avatar URL', type: 'url' },
    { key: 'total_xp', label: 'Total XP', type: 'number' },
    { key: 'nivel', label: 'Nivel', type: 'number' },
  ]

  if (loading) {
    return <div className="font-mono-custom text-slate-500 animate-pulse">{'> cargando_perfil...'}</div>
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <p className="font-mono-custom text-xs text-[#00E5FF] opacity-60 mb-1">{'// identity.json'}</p>
        <h1 className="font-mono-custom text-2xl font-black text-[#00E5FF]">Perfil</h1>
      </div>

      <form onSubmit={handleSave} className="glass-card p-6 space-y-5">
        {fields.map(({ key, label, type = 'text', rows }) => (
          <div key={key}>
            <label className="font-mono-custom text-xs text-slate-400 block mb-1.5">{label}</label>
            {type === 'textarea' ? (
              <textarea
                value={String(perfil[key] ?? '')}
                onChange={(e) => setPerfil((p) => ({ ...p, [key]: e.target.value }))}
                className="input-field resize-none"
                rows={rows ?? 3}
              />
            ) : (
              <input
                type={type}
                value={String(perfil[key] ?? '')}
                onChange={(e) => setPerfil((p) => ({ ...p, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                className="input-field"
              />
            )}
          </div>
        ))}

        <div className="flex items-center gap-3">
          <label className="font-mono-custom text-xs text-slate-400">Disponible para trabajo</label>
          <button
            type="button"
            onClick={() => setPerfil((p) => ({ ...p, disponible: !p.disponible }))}
            className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${perfil.disponible ? 'bg-[#00FF88]' : 'bg-slate-700'}`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-black rounded-full transition-transform duration-200 ${perfil.disponible ? 'translate-x-7' : 'translate-x-1'}`}
            />
          </button>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full py-3 disabled:opacity-50"
        >
          {saving ? '> guardando...' : '> guardar_perfil()'}
        </button>
      </form>
    </div>
  )
}
