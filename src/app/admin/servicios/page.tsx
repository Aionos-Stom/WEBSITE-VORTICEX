'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import type { Service } from '@/types/database'
import { logAction } from '@/lib/audit'

const COLOR_OPTIONS = [
  { label: 'Cyan', value: '#00E5FF' },
  { label: 'Purple', value: '#9B5CFF' },
  { label: 'Green', value: '#00FF88' },
  { label: 'Red', value: '#FF6B6B' },
  { label: 'Amber', value: '#F59E0B' },
  { label: 'Blue', value: '#60A5FA' },
]

const EMPTY: Omit<Service, 'id'> = {
  number: '01',
  title: '',
  tagline: '',
  description: '',
  bullets: '[]',
  stack: '',
  color: '#00E5FF',
  sort_order: 0,
}

function parseBullets(json: string): string[] {
  try { return JSON.parse(json) as string[] } catch { return [] }
}

export default function AdminServiciosPage(): JSX.Element {
  const [items, setItems] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState<Omit<Service, 'id'>>(EMPTY)
  const [bulletsText, setBulletsText] = useState('')  // one per line
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const supabase = createClient()

  const load = useCallback(async (): Promise<void> => {
    const { data } = await supabase.from('services').select('*').order('sort_order')
    setItems((data ?? []) as Service[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { void load() }, [load])

  const openCreate = (): void => {
    setEditing(null)
    setForm({ ...EMPTY, sort_order: items.length + 1, number: `0${items.length + 1}` })
    setBulletsText('')
    setOpen(true)
  }

  const openEdit = (item: Service): void => {
    setEditing(item)
    setForm({ number: item.number, title: item.title, tagline: item.tagline, description: item.description, bullets: item.bullets, stack: item.stack, color: item.color, sort_order: item.sort_order })
    setBulletsText(parseBullets(item.bullets).join('\n'))
    setOpen(true)
  }

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('Título requerido'); return }
    const bulletsArr = bulletsText.split('\n').map((b) => b.trim()).filter(Boolean)
    const payload = { ...form, bullets: JSON.stringify(bulletsArr) }
    setSaving(true)
    try {
      if (editing) {
        const { error } = await supabase.from('services').update(payload).eq('id', editing.id)
        if (error) throw error
        void logAction(supabase, 'update', 'services', form.title)
        toast.success('Servicio actualizado')
      } else {
        const { error } = await supabase.from('services').insert(payload)
        if (error) throw error
        void logAction(supabase, 'create', 'services', form.title)
        toast.success('Servicio creado')
      }
      setOpen(false)
      await load()
    } catch { toast.error('Error al guardar') } finally { setSaving(false) }
  }

  const handleDelete = async (id: string): Promise<void> => {
    const { error } = await supabase.from('services').delete().eq('id', id)
    if (error) { toast.error('Error al eliminar'); return }
    void logAction(supabase, 'delete', 'services', id)
    toast.success('Servicio eliminado')
    setDeleteId(null)
    await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="font-mono-custom text-xs text-[#00E5FF] opacity-60 mb-1">{'// engineering_services'}</p>
          <h1 className="font-mono-custom text-2xl font-black text-[#00E5FF]">Servicios</h1>
          <p className="font-mono-custom text-xs text-slate-500 mt-1">Servicios de ingeniería mostrados en el portfolio</p>
        </div>
        <button onClick={openCreate} className="btn-primary">&gt; nuevo_servicio()</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <span className="font-mono-custom text-slate-500 animate-pulse">{'> cargando...'}</span>
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="font-mono-custom text-slate-500">{'> sin servicios — crea el primero'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="glass-card p-5 border"
              style={{ borderLeftColor: item.color, borderLeftWidth: 3 }}
            >
              <div className="flex items-start gap-4 flex-wrap">
                <div className="font-mono-custom font-black text-4xl opacity-25 select-none flex-shrink-0" style={{ color: item.color }}>
                  {item.number}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono-custom font-black text-sm mb-0.5" style={{ color: item.color }}>{item.title}</p>
                  <p className="font-mono-custom text-xs text-slate-500 mb-2">{item.tagline}</p>
                  <p className="font-mono-custom text-xs text-slate-600 line-clamp-2">{item.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {item.stack.split(',').map((t) => t.trim()).filter(Boolean).map((t) => (
                      <span key={t} className="font-mono-custom text-[0.6rem] px-2 py-0.5 rounded border" style={{ color: item.color, borderColor: `${item.color}30` }}>{t}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(item)} className="px-3 py-1.5 rounded font-mono-custom text-xs border border-[rgba(0,229,255,0.2)] text-[#00E5FF] hover:bg-[rgba(0,229,255,0.08)] transition-colors">editar</button>
                  <button onClick={() => setDeleteId(item.id)} className="px-3 py-1.5 rounded font-mono-custom text-xs border border-[rgba(255,68,68,0.2)] text-[#FF4444] hover:bg-[rgba(255,68,68,0.08)] transition-colors">×</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Confirm delete */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setDeleteId(null)}
          >
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="glass-card p-6 max-w-sm w-full border border-[rgba(255,68,68,0.3)]"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-mono-custom text-slate-200 mb-4">¿Eliminar este servicio?</p>
              <div className="flex gap-3">
                <button onClick={() => void handleDelete(deleteId)} className="btn-primary flex-1 py-2" style={{ borderColor: 'rgba(255,68,68,0.5)', color: '#FF4444' }}>Eliminar</button>
                <button onClick={() => setDeleteId(null)} className="btn-primary flex-1 py-2">Cancelar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form modal */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 w-full max-w-2xl border border-[rgba(0,229,255,0.2)] max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-mono-custom font-black text-[#00E5FF] mb-6">
                {editing ? '> editar_servicio()' : '> nuevo_servicio()'}
              </h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono-custom text-xs text-slate-400 block mb-1">Número (ej: 01)</label>
                    <input value={form.number} onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label className="font-mono-custom text-xs text-slate-400 block mb-1">Orden</label>
                    <input type="number" min="0" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))} className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="font-mono-custom text-xs text-slate-400 block mb-1">Título *</label>
                  <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="input-field" required />
                </div>
                <div>
                  <label className="font-mono-custom text-xs text-slate-400 block mb-1">Tagline (frase corta)</label>
                  <input value={form.tagline} onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="font-mono-custom text-xs text-slate-400 block mb-1">Descripción</label>
                  <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input-field resize-none" rows={3} />
                </div>
                <div>
                  <label className="font-mono-custom text-xs text-slate-400 block mb-1">
                    Bullets / puntos clave (uno por línea)
                  </label>
                  <textarea
                    value={bulletsText}
                    onChange={(e) => setBulletsText(e.target.value)}
                    className="input-field resize-none"
                    rows={4}
                    placeholder={'Punto 1\nPunto 2\nPunto 3'}
                  />
                </div>
                <div>
                  <label className="font-mono-custom text-xs text-slate-400 block mb-1">Stack (separado por coma)</label>
                  <input value={form.stack} onChange={(e) => setForm((f) => ({ ...f, stack: e.target.value }))} className="input-field" placeholder="Next.js, Go, PostgreSQL" />
                </div>
                <div>
                  <label className="font-mono-custom text-xs text-slate-400 block mb-1">Color</label>
                  <select value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} className="input-field">
                    {COLOR_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label} ({c.value})</option>)}
                  </select>
                  <div className="mt-2 h-2 rounded-full" style={{ background: form.color }} />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={saving} className="btn-primary flex-1 py-3 disabled:opacity-50">
                    {saving ? '> guardando...' : '> guardar()'}
                  </button>
                  <button type="button" onClick={() => setOpen(false)} className="btn-primary flex-1 py-3">cancelar</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
