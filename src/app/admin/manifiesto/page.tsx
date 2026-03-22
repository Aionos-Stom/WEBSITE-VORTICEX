'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import type { ManifestoItem } from '@/types/database'
import { logAction } from '@/lib/audit'

const ICON_OPTIONS = ['lock', 'palette', 'gauge', 'eye', 'bot', 'shield', 'zap', 'code', 'star', 'cpu']
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

const EMPTY: Omit<ManifestoItem, 'id'> = {
  number: '01',
  title: '',
  body: '',
  color: '#00E5FF',
  icon_name: 'lock',
  sort_order: 0,
}

export default function AdminManifiestoPage(): JSX.Element {
  const [items, setItems] = useState<ManifestoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ManifestoItem | null>(null)
  const [form, setForm] = useState<Omit<ManifestoItem, 'id'>>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const supabase = createClient()

  const load = useCallback(async (): Promise<void> => {
    const { data } = await supabase.from('manifesto_items').select('*').order('sort_order')
    setItems((data ?? []) as ManifestoItem[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { void load() }, [load])

  const openCreate = (): void => {
    setEditing(null)
    setForm({ ...EMPTY, sort_order: items.length + 1 })
    setOpen(true)
  }

  const openEdit = (item: ManifestoItem): void => {
    setEditing(item)
    setForm({ number: item.number, title: item.title, body: item.body, color: item.color, icon_name: item.icon_name, sort_order: item.sort_order })
    setOpen(true)
  }

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!form.title.trim() || !form.body.trim()) { toast.error('Título y cuerpo requeridos'); return }
    setSaving(true)
    try {
      if (editing) {
        const { error } = await supabase.from('manifesto_items').update(form).eq('id', editing.id)
        if (error) throw error
        void logAction(supabase, 'update', 'manifesto_items', form.title)
        toast.success('Ley actualizada')
      } else {
        const { error } = await supabase.from('manifesto_items').insert(form)
        if (error) throw error
        void logAction(supabase, 'create', 'manifesto_items', form.title)
        toast.success('Ley creada')
      }
      setOpen(false)
      await load()
    } catch { toast.error('Error al guardar') } finally { setSaving(false) }
  }

  const handleDelete = async (id: string): Promise<void> => {
    const { error } = await supabase.from('manifesto_items').delete().eq('id', id)
    if (error) { toast.error('Error al eliminar'); return }
    void logAction(supabase, 'delete', 'manifesto_items', id)
    toast.success('Ley eliminada')
    setDeleteId(null)
    await load()
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="font-mono-custom text-xs text-[#00FF88] opacity-60 mb-1">{'// manifesto_items'}</p>
          <h1 className="font-mono-custom text-2xl font-black text-[#00FF88]">El Manifiesto</h1>
          <p className="font-mono-custom text-xs text-slate-500 mt-1">Las leyes de ingeniería que rigen el portfolio</p>
        </div>
        <button
          onClick={openCreate}
          className="btn-primary"
          style={{ borderColor: 'rgba(0,255,136,0.4)', color: '#00FF88' }}
        >
          &gt; nueva_ley()
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <span className="font-mono-custom text-slate-500 animate-pulse">{'> cargando...'}</span>
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="font-mono-custom text-slate-500">{'> sin leyes — crea la primera'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5 border group hover:border-[rgba(255,255,255,0.08)] transition-all"
              style={{ borderLeftColor: item.color, borderLeftWidth: 3 }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-mono-custom font-black text-sm"
                  style={{ background: `${item.color}15`, border: `1px solid ${item.color}40`, color: item.color }}
                >
                  {item.number}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-mono-custom font-bold text-sm text-slate-200 mb-1 truncate" style={{ color: item.color }}>
                    {item.title}
                  </h3>
                  <p className="font-mono-custom text-xs text-slate-500 line-clamp-2">{item.body}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-mono-custom text-xs text-slate-600">orden: {item.sort_order}</span>
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
                    eliminar
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Confirm delete */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 max-w-sm w-full border border-[rgba(255,68,68,0.3)]"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-mono-custom text-slate-200 mb-4">¿Eliminar esta ley del manifiesto?</p>
              <div className="flex gap-3">
                <button onClick={() => void handleDelete(deleteId)} className="btn-primary flex-1 py-2" style={{ borderColor: 'rgba(255,68,68,0.5)', color: '#FF4444' }}>
                  Eliminar
                </button>
                <button onClick={() => setDeleteId(null)} className="btn-primary flex-1 py-2">
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 w-full max-w-2xl border border-[rgba(0,255,136,0.2)] max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-mono-custom font-black text-[#00FF88] mb-6">
                {editing ? '> editar_ley()' : '> nueva_ley()'}
              </h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono-custom text-xs text-slate-400 block mb-1">Número (ej: 01) *</label>
                    <input
                      value={form.number}
                      onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
                      className="input-field"
                      placeholder="01"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-mono-custom text-xs text-slate-400 block mb-1">Orden</label>
                    <input
                      type="number"
                      min="0"
                      value={form.sort_order}
                      onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-mono-custom text-xs text-slate-400 block mb-1">Título de la ley *</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="input-field"
                    placeholder="La Seguridad no es una característica..."
                    required
                  />
                </div>

                <div>
                  <label className="font-mono-custom text-xs text-slate-400 block mb-1">Cuerpo / descripción *</label>
                  <textarea
                    value={form.body}
                    onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                    className="input-field resize-none"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono-custom text-xs text-slate-400 block mb-1">Color</label>
                    <select
                      value={form.color}
                      onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                      className="input-field"
                    >
                      {COLOR_OPTIONS.map((c) => (
                        <option key={c.value} value={c.value}>{c.label} ({c.value})</option>
                      ))}
                    </select>
                    <div className="mt-2 h-2 rounded-full" style={{ background: form.color }} />
                  </div>
                  <div>
                    <label className="font-mono-custom text-xs text-slate-400 block mb-1">Icono</label>
                    <select
                      value={form.icon_name}
                      onChange={(e) => setForm((f) => ({ ...f, icon_name: e.target.value }))}
                      className="input-field"
                    >
                      {ICON_OPTIONS.map((ic) => (
                        <option key={ic} value={ic}>{ic}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Preview */}
                <div
                  className="rounded-xl border p-4"
                  style={{ borderColor: `${form.color}30`, background: `${form.color}06` }}
                >
                  <p className="font-mono-custom text-xs text-slate-500 mb-2">// preview</p>
                  <p className="font-mono-custom font-bold text-sm mb-1" style={{ color: form.color }}>
                    [{form.number}] {form.title || '...'}
                  </p>
                  <p className="font-mono-custom text-xs text-slate-500 line-clamp-2">{form.body || '...'}</p>
                </div>

                <div className="flex gap-3">
                  <button type="submit" disabled={saving} className="btn-primary flex-1 py-3 disabled:opacity-50" style={{ borderColor: 'rgba(0,255,136,0.4)', color: '#00FF88' }}>
                    {saving ? '> guardando...' : '> guardar()'}
                  </button>
                  <button type="button" onClick={() => setOpen(false)} className="btn-primary flex-1 py-3">
                    cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
