'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import type { Gallery } from '@/types/database'
import { GALLERY_CATEGORIES } from '@/types/database'
import { uploadImage } from '@/lib/storage'
import { logAction } from '@/lib/audit'

const EMPTY: Omit<Gallery, 'id' | 'created_at'> = {
  title: '',
  category: null,
  description: null,
  image_url: null,
  tools: null,
  featured: false,
  sort_order: 0,
}

export default function AdminGaleriaPage(): JSX.Element {
  const [items, setItems] = useState<Gallery[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<Omit<Gallery, 'id' | 'created_at'>>(EMPTY)
  const [editing, setEditing] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const load = useCallback(async (): Promise<void> => {
    const { data } = await supabase.from('gallery').select('*').order('sort_order')
    setItems((data ?? []) as Gallery[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { void load() }, [load])

  const openNew = (): void => {
    setEditing(null)
    setForm({ ...EMPTY, sort_order: items.length })
    setShowForm(true)
  }

  const openEdit = (item: Gallery): void => {
    setEditing(item.id)
    setForm({
      title: item.title,
      category: item.category,
      description: item.description,
      image_url: item.image_url,
      tools: item.tools,
      featured: item.featured,
      sort_order: item.sort_order,
    })
    setShowForm(true)
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const result = await uploadImage(supabase, file, 'gallery')
      setForm((f) => ({ ...f, image_url: result.url }))
      toast.success('Imagen subida')
    } catch {
      toast.error('Error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('El título es obligatorio'); return }
    setSaving(true)
    try {
      if (editing) {
        const { error } = await supabase.from('gallery').update({
          ...form,
          updated_at: new Date().toISOString(),
        } as never).eq('id', editing)
        if (error) throw error
        void logAction(supabase, 'update', 'gallery', form.title)
        toast.success('Trabajo actualizado')
      } else {
        const { error } = await supabase.from('gallery').insert([form] as never)
        if (error) throw error
        void logAction(supabase, 'create', 'gallery', form.title)
        toast.success('Trabajo agregado')
      }
      setShowForm(false)
      await load()
    } catch { toast.error('Error al guardar') } finally { setSaving(false) }
  }

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm('¿Eliminar este trabajo?')) return
    const { error } = await supabase.from('gallery').delete().eq('id', id)
    if (error) { toast.error('Error al eliminar'); return }
    void logAction(supabase, 'delete', 'gallery', id)
    toast.success('Eliminado')
    await load()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <span className="font-mono-custom text-slate-500 animate-pulse">{'> cargando_galeria...'}</span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono-custom text-xs text-[#9B5CFF] opacity-60 mb-1">{'// gallery'}</p>
          <h1 className="font-mono-custom text-2xl font-black text-[#9B5CFF]">Galería Creativa</h1>
          <p className="font-mono-custom text-xs text-slate-500 mt-1">{items.length} trabajos en portafolio</p>
        </div>
        <button onClick={openNew} className="btn-primary py-2 px-4" style={{ borderColor: 'rgba(155,92,255,0.4)', color: '#9B5CFF' }}>
          + nuevo_trabajo()
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
              className="glass-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-[rgba(155,92,255,0.25)]"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-mono-custom font-bold text-[#9B5CFF]">
                  {editing ? '> editar_trabajo()' : '> nuevo_trabajo()'}
                </h2>
                <button onClick={() => setShowForm(false)} className="font-mono-custom text-slate-400 hover:text-[#FF4444] transition-colors">[×]</button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="font-mono-custom text-xs text-slate-400 block mb-1">Título *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="input-field"
                    placeholder="Mi diseño épico"
                  />
                </div>

                <div>
                  <label className="font-mono-custom text-xs text-slate-400 block mb-1">Categoría</label>
                  <select
                    value={form.category ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value || null }))}
                    className="input-field"
                  >
                    <option value="">Sin categoría</option>
                    {GALLERY_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-mono-custom text-xs text-slate-400 block mb-1">Descripción</label>
                  <textarea
                    value={form.description ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value || null }))}
                    className="input-field min-h-[80px] resize-none"
                    placeholder="Descripción del trabajo..."
                  />
                </div>

                <div>
                  <label className="font-mono-custom text-xs text-slate-400 block mb-2">Imagen</label>
                  {form.image_url && (
                    <div className="mb-2 relative group">
                      <img src={form.image_url} alt="preview" className="h-32 w-full object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, image_url: null }))}
                        className="absolute top-2 right-2 bg-black/70 text-[#FF4444] font-mono-custom text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.image_url ?? ''}
                      onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value || null }))}
                      className="input-field flex-1"
                      placeholder="https://... o sube una imagen"
                    />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="btn-primary px-3 py-2 text-xs disabled:opacity-50 whitespace-nowrap"
                      style={{ borderColor: 'rgba(155,92,255,0.4)', color: '#9B5CFF' }}
                    >
                      {uploading ? '...' : '↑ subir'}
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                  </div>
                </div>

                <div>
                  <label className="font-mono-custom text-xs text-slate-400 block mb-1">Herramientas (separadas por coma)</label>
                  <input
                    type="text"
                    value={form.tools ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, tools: e.target.value || null }))}
                    className="input-field"
                    placeholder="Figma, Photoshop, After Effects"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono-custom text-xs text-slate-400 block mb-1">Orden</label>
                    <input
                      type="number"
                      min={0}
                      value={form.sort_order}
                      onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                      className="input-field"
                    />
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div
                        onClick={() => setForm((f) => ({ ...f, featured: !f.featured }))}
                        className={`w-10 h-5 rounded-full transition-colors ${form.featured ? 'bg-[rgba(245,158,11,0.5)]' : 'bg-[rgba(255,255,255,0.08)]'} relative`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${form.featured ? 'translate-x-5 bg-[#F59E0B]' : 'translate-x-0.5 bg-slate-500'}`} />
                      </div>
                      <span className="font-mono-custom text-xs text-slate-400">Destacado</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5 disabled:opacity-50" style={{ borderColor: 'rgba(155,92,255,0.4)', color: '#9B5CFF' }}>
                    {saving ? '> guardando...' : (editing ? '> actualizar()' : '> crear()')}
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

      {/* Grid */}
      {items.length === 0 ? (
        <div className="text-center py-16 font-mono-custom text-slate-600">
          {'> galeria_vacia — agrega tu primer trabajo'}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="glass-card overflow-hidden group border border-[rgba(155,92,255,0.12)] hover:border-[rgba(155,92,255,0.35)] transition-all duration-300"
            >
              <div className="relative overflow-hidden h-36">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[rgba(155,92,255,0.08)] to-[rgba(0,229,255,0.04)] flex items-center justify-center">
                    <span className="text-3xl">🎨</span>
                  </div>
                )}
                {item.featured && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[rgba(245,158,11,0.2)] border border-[rgba(245,158,11,0.4)] flex items-center justify-center">
                    <span className="text-[#F59E0B] text-[0.6rem]">★</span>
                  </div>
                )}
                {item.category && (
                  <span className="absolute bottom-2 left-2 font-mono-custom text-[0.6rem] bg-[rgba(155,92,255,0.3)] text-[#9B5CFF] px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="font-mono-custom text-xs text-slate-200 font-bold line-clamp-1 mb-2">{item.title}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(item)}
                    className="flex-1 font-mono-custom text-[0.6rem] py-1.5 rounded border border-[rgba(0,229,255,0.2)] text-[#00E5FF] hover:bg-[rgba(0,229,255,0.08)] transition-colors"
                  >
                    editar
                  </button>
                  <button
                    onClick={() => void handleDelete(item.id)}
                    className="flex-1 font-mono-custom text-[0.6rem] py-1.5 rounded border border-[rgba(255,68,68,0.2)] text-[#FF4444] hover:bg-[rgba(255,68,68,0.08)] transition-colors"
                  >
                    eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
