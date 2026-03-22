'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import type { ArmeriaLayer } from '@/types/database'
import { logAction } from '@/lib/audit'

const ICON_OPTIONS = ['monitor', 'box', 'server', 'database', 'cloud', 'shield', 'zap', 'code', 'cpu', 'globe']
const COLOR_OPTIONS = [
  { label: 'Cyan', value: '#00E5FF' },
  { label: 'Purple', value: '#9B5CFF' },
  { label: 'Green', value: '#00FF88' },
  { label: 'Red', value: '#FF6B6B' },
  { label: 'Amber', value: '#F59E0B' },
  { label: 'Blue', value: '#60A5FA' },
  { label: 'Pink', value: '#FF6B9D' },
  { label: 'Orange', value: '#FF8C42' },
]

const EMPTY: Omit<ArmeriaLayer, 'id'> = {
  layer_name: '',
  color: '#00E5FF',
  icon_name: 'monitor',
  techs: '',
  philosophy: '',
  sort_order: 0,
}

export default function AdminArmeriaPage(): JSX.Element {
  const [items, setItems] = useState<ArmeriaLayer[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ArmeriaLayer | null>(null)
  const [form, setForm] = useState<Omit<ArmeriaLayer, 'id'>>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const supabase = createClient()

  const load = useCallback(async (): Promise<void> => {
    const { data } = await supabase.from('armeria_layers').select('*').order('sort_order')
    setItems((data ?? []) as ArmeriaLayer[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { void load() }, [load])

  const openCreate = (): void => {
    setEditing(null)
    setForm({ ...EMPTY, sort_order: items.length + 1 })
    setOpen(true)
  }

  const openEdit = (item: ArmeriaLayer): void => {
    setEditing(item)
    setForm({
      layer_name: item.layer_name, color: item.color, icon_name: item.icon_name,
      techs: item.techs, philosophy: item.philosophy, sort_order: item.sort_order,
    })
    setOpen(true)
  }

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!form.layer_name.trim()) { toast.error('Nombre de capa requerido'); return }
    setSaving(true)
    try {
      if (editing) {
        const { error } = await supabase.from('armeria_layers').update(form).eq('id', editing.id)
        if (error) throw error
        void logAction(supabase, 'update', 'armeria_layers', form.layer_name)
        toast.success('Capa actualizada')
      } else {
        const { error } = await supabase.from('armeria_layers').insert(form)
        if (error) throw error
        void logAction(supabase, 'create', 'armeria_layers', form.layer_name)
        toast.success('Capa creada')
      }
      setOpen(false)
      await load()
    } catch { toast.error('Error al guardar') } finally { setSaving(false) }
  }

  const handleDelete = async (id: string): Promise<void> => {
    const { error } = await supabase.from('armeria_layers').delete().eq('id', id)
    if (error) { toast.error('Error al eliminar'); return }
    void logAction(supabase, 'delete', 'armeria_layers', id)
    toast.success('Capa eliminada')
    setDeleteId(null)
    await load()
  }

  const techList = (techs: string): string[] =>
    techs.split(',').map((t) => t.trim()).filter(Boolean)

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="font-mono-custom text-xs text-[#9B5CFF] opacity-60 mb-1">{'// armeria_layers'}</p>
          <h1 className="font-mono-custom text-2xl font-black text-[#9B5CFF]">La Armería</h1>
          <p className="font-mono-custom text-xs text-slate-500 mt-1">Capas del stack tecnológico</p>
        </div>
        <button onClick={openCreate} className="btn-primary" style={{ borderColor: 'rgba(155,92,255,0.4)', color: '#9B5CFF' }}>
          &gt; nueva_capa()
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <span className="font-mono-custom text-slate-500 animate-pulse">{'> cargando...'}</span>
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="font-mono-custom text-slate-500">{'> sin capas — crea la primera'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass-card p-5 border transition-all"
              style={{ borderColor: `${item.color}25` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center font-mono-custom text-sm font-bold flex-shrink-0"
                  style={{ background: `${item.color}15`, border: `1px solid ${item.color}40`, color: item.color }}
                >
                  {item.sort_order}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono-custom font-black text-sm truncate" style={{ color: item.color }}>
                    {item.layer_name}
                  </p>
                  <p className="font-mono-custom text-xs text-slate-600">{item.icon_name}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEdit(item)}
                    className="px-3 py-1.5 rounded font-mono-custom text-xs border border-[rgba(0,229,255,0.2)] text-[#00E5FF] hover:bg-[rgba(0,229,255,0.08)] transition-colors"
                  >
                    editar
                  </button>
                  <button
                    onClick={() => setDeleteId(item.id)}
                    className="px-3 py-1.5 rounded font-mono-custom text-xs border border-[rgba(255,68,68,0.2)] text-[#FF4444] hover:bg-[rgba(255,68,68,0.08)] transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {techList(item.techs).map((tech) => (
                  <span
                    key={tech}
                    className="font-mono-custom text-[0.6rem] px-2 py-0.5 rounded-md border"
                    style={{ color: item.color, borderColor: `${item.color}30`, background: 'rgba(0,0,0,0.3)' }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
              {item.philosophy && (
                <p className="font-mono-custom text-[0.62rem] text-slate-600 border-t pt-2" style={{ borderColor: `${item.color}15` }}>
                  {item.philosophy}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Confirm delete */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 max-w-sm w-full border border-[rgba(255,68,68,0.3)]"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-mono-custom text-slate-200 mb-4">¿Eliminar esta capa del arsenal?</p>
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
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 w-full max-w-2xl border border-[rgba(155,92,255,0.2)] max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-mono-custom font-black text-[#9B5CFF] mb-6">
                {editing ? '> editar_capa()' : '> nueva_capa()'}
              </h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono-custom text-xs text-slate-400 block mb-1">Nombre de la capa *</label>
                    <input
                      value={form.layer_name}
                      onChange={(e) => setForm((f) => ({ ...f, layer_name: e.target.value }))}
                      className="input-field"
                      placeholder="Frontend Core"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-mono-custom text-xs text-slate-400 block mb-1">Orden</label>
                    <input
                      type="number" min="0"
                      value={form.sort_order}
                      onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-mono-custom text-xs text-slate-400 block mb-1">
                    Tecnologías (separadas por coma) *
                  </label>
                  <input
                    value={form.techs}
                    onChange={(e) => setForm((f) => ({ ...f, techs: e.target.value }))}
                    className="input-field"
                    placeholder="React 19, Next.js, TypeScript, Tailwind CSS"
                    required
                  />
                  {form.techs && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {form.techs.split(',').map((t) => t.trim()).filter(Boolean).map((t) => (
                        <span key={t} className="font-mono-custom text-[0.6rem] px-2 py-0.5 rounded border" style={{ color: form.color, borderColor: `${form.color}30` }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-mono-custom text-xs text-slate-400 block mb-1">Filosofía / descripción</label>
                  <textarea
                    value={form.philosophy}
                    onChange={(e) => setForm((f) => ({ ...f, philosophy: e.target.value }))}
                    className="input-field resize-none"
                    rows={3}
                    placeholder="Tipado estricto, Server Components..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono-custom text-xs text-slate-400 block mb-1">Color</label>
                    <select value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} className="input-field">
                      {COLOR_OPTIONS.map((c) => (
                        <option key={c.value} value={c.value}>{c.label} ({c.value})</option>
                      ))}
                    </select>
                    <div className="mt-2 h-2 rounded-full" style={{ background: form.color }} />
                  </div>
                  <div>
                    <label className="font-mono-custom text-xs text-slate-400 block mb-1">Icono</label>
                    <select value={form.icon_name} onChange={(e) => setForm((f) => ({ ...f, icon_name: e.target.value }))} className="input-field">
                      {ICON_OPTIONS.map((ic) => (
                        <option key={ic} value={ic}>{ic}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="submit" disabled={saving} className="btn-primary flex-1 py-3 disabled:opacity-50" style={{ borderColor: 'rgba(155,92,255,0.4)', color: '#9B5CFF' }}>
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
