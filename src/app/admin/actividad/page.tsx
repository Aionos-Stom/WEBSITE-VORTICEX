'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import type { ActivityLog } from '@/types/database'
import { ACTIVITY_TYPES } from '@/types/database'
import { logAction } from '@/lib/audit'

const ACTIVITY_TYPE_KEYS = Object.keys(ACTIVITY_TYPES) as ActivityLog['type'][]

const EMPTY: Omit<ActivityLog, 'id' | 'created_at'> = {
  date: new Date().toISOString().slice(0, 10),
  type: 'estudio',
  title: '',
  description: null,
  xp_gained: 50,
}

export default function AdminActividadPage(): JSX.Element {
  const [items, setItems] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<Omit<ActivityLog, 'id' | 'created_at'>>(EMPTY)
  const [editing, setEditing] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const supabase = createClient()

  const load = useCallback(async (): Promise<void> => {
    const { data } = await supabase.from('activity_log').select('*').order('date', { ascending: false })
    setItems((data ?? []) as ActivityLog[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { void load() }, [load])

  const totalXP = items.reduce((s, a) => s + (a.xp_gained ?? 0), 0)

  const openNew = (): void => {
    setEditing(null)
    setForm({ ...EMPTY })
    setShowForm(true)
  }

  const openEdit = (item: ActivityLog): void => {
    setEditing(item.id)
    setForm({
      date: item.date,
      type: item.type,
      title: item.title,
      description: item.description,
      xp_gained: item.xp_gained,
    })
    setShowForm(true)
  }

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('El título es obligatorio'); return }
    setSaving(true)
    try {
      if (editing) {
        const { error } = await supabase.from('activity_log').update(form as never).eq('id', editing)
        if (error) throw error
        void logAction(supabase, 'update', 'activity_log', form.title)
        toast.success('Actividad actualizada')
      } else {
        const { error } = await supabase.from('activity_log').insert([form] as never)
        if (error) throw error
        void logAction(supabase, 'create', 'activity_log', `${form.title} (+${form.xp_gained} xp)`)
        toast.success('Actividad registrada')
      }
      setShowForm(false)
      await load()
    } catch { toast.error('Error al guardar') } finally { setSaving(false) }
  }

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm('¿Eliminar esta actividad?')) return
    const { error } = await supabase.from('activity_log').delete().eq('id', id)
    if (error) { toast.error('Error al eliminar'); return }
    void logAction(supabase, 'delete', 'activity_log', id)
    toast.success('Eliminada')
    await load()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <span className="font-mono-custom text-slate-500 animate-pulse">{'> cargando_actividades...'}</span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono-custom text-xs text-[#00FF88] opacity-60 mb-1">{'// activity_log'}</p>
          <h1 className="font-mono-custom text-2xl font-black text-[#00FF88]">Actividad & XP</h1>
          <p className="font-mono-custom text-xs text-slate-500 mt-1">
            {items.length} actividades · <span className="text-[#00FF88]">{totalXP.toLocaleString()} XP total</span>
          </p>
        </div>
        <button onClick={openNew} className="btn-primary py-2 px-4" style={{ borderColor: 'rgba(0,255,136,0.4)', color: '#00FF88' }}>
          + registrar_actividad()
        </button>
      </div>

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-card p-6 w-full max-w-md border border-[rgba(0,255,136,0.2)]"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-mono-custom font-bold text-[#00FF88]">
                  {editing ? '> editar_actividad()' : '> nueva_actividad()'}
                </h2>
                <button onClick={() => setShowForm(false)} className="font-mono-custom text-slate-400 hover:text-[#FF4444] transition-colors">[×]</button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="font-mono-custom text-xs text-slate-400 block mb-1">Fecha *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="font-mono-custom text-xs text-slate-400 block mb-2">Tipo *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {ACTIVITY_TYPE_KEYS.map((key) => {
                      const meta = ACTIVITY_TYPES[key]
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, type: key }))}
                          className={`font-mono-custom text-xs py-2 px-3 rounded-lg border transition-all duration-200 flex items-center gap-1.5 ${form.type === key ? 'border-current opacity-100' : 'border-[rgba(255,255,255,0.06)] opacity-50 hover:opacity-75'}`}
                          style={{ color: meta.color, borderColor: form.type === key ? meta.color : undefined }}
                        >
                          <span>{meta.icon}</span>
                          <span className="truncate">{meta.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="font-mono-custom text-xs text-slate-400 block mb-1">Título *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="input-field"
                    placeholder="Completé curso de AWS..."
                  />
                </div>

                <div>
                  <label className="font-mono-custom text-xs text-slate-400 block mb-1">Descripción</label>
                  <textarea
                    value={form.description ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value || null }))}
                    className="input-field resize-none"
                    rows={2}
                    placeholder="Detalles adicionales..."
                  />
                </div>

                <div>
                  <label className="font-mono-custom text-xs text-slate-400 block mb-1">
                    XP Ganado: <span className="text-[#00FF88]">+{form.xp_gained}</span>
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={500}
                    step={10}
                    value={form.xp_gained}
                    onChange={(e) => setForm((f) => ({ ...f, xp_gained: Number(e.target.value) }))}
                    className="w-full accent-[#00FF88]"
                  />
                  <div className="flex justify-between font-mono-custom text-[0.6rem] text-slate-600 mt-1">
                    <span>10 xp</span>
                    <span>250 xp</span>
                    <span>500 xp</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5 disabled:opacity-50" style={{ borderColor: 'rgba(0,255,136,0.4)', color: '#00FF88' }}>
                    {saving ? '> guardando...' : (editing ? '> actualizar()' : '> registrar()')}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-primary px-4 py-2.5" style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#64748B' }}>
                    cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {items.length === 0 ? (
        <div className="text-center py-16 font-mono-custom text-slate-600">
          {'> sin_actividades — registra tu primer logro'}
        </div>
      ) : (
        <div className="space-y-2 max-w-3xl">
          {items.map((item) => {
            const meta = ACTIVITY_TYPES[item.type]
            return (
              <div
                key={item.id}
                className="glass-card p-4 flex items-center gap-4 group border transition-all duration-200"
                style={{ borderColor: `${meta.color}15` }}
              >
                <span className="text-xl flex-shrink-0">{meta.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono-custom text-sm text-slate-200 truncate">{item.title}</span>
                    <span className="font-mono-custom text-xs font-bold flex-shrink-0" style={{ color: meta.color }}>+{item.xp_gained} xp</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono-custom text-[0.65rem]" style={{ color: meta.color }}>{meta.label}</span>
                    <span className="font-mono-custom text-[0.6rem] text-slate-600">{item.date}</span>
                    {item.description && (
                      <span className="font-mono-custom text-[0.6rem] text-slate-500 truncate">{item.description}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => openEdit(item)}
                    className="font-mono-custom text-[0.6rem] px-2.5 py-1.5 rounded border border-[rgba(0,229,255,0.2)] text-[#00E5FF] hover:bg-[rgba(0,229,255,0.08)] transition-colors"
                  >
                    editar
                  </button>
                  <button
                    onClick={() => void handleDelete(item.id)}
                    className="font-mono-custom text-[0.6rem] px-2.5 py-1.5 rounded border border-[rgba(255,68,68,0.2)] text-[#FF4444] hover:bg-[rgba(255,68,68,0.08)] transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
