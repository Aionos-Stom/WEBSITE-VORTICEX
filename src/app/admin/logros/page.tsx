'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { z } from 'zod'
import { CrudTable } from '@/components/admin/CrudTable'
import { AdminModal } from '@/components/admin/AdminModal'
import type { Achievement } from '@/types/database'
import { uploadImage } from '@/lib/storage'
import { logAction } from '@/lib/audit'

const Schema = z.object({
  title: z.string().min(1).max(100),
  category: z.string().max(50).optional().or(z.literal('')),
  description: z.string().max(500).optional().or(z.literal('')),
  image_url: z.string().url().optional().or(z.literal('')),
  event_url: z.string().url().optional().or(z.literal('')),
})

type FormData = z.infer<typeof Schema>

const DEFAULT: FormData = {
  title: '',
  category: '',
  description: '',
  image_url: '',
  event_url: '',
}

export default function AdminLogrosPage(): JSX.Element {
  const [data, setData] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Achievement | null>(null)
  const [form, setForm] = useState<FormData>(DEFAULT)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  const load = useCallback(async (): Promise<void> => {
    const { data: rows } = await supabase.from('achievements').select('*').order('created_at', { ascending: false })
    setData((rows ?? []) as Achievement[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { void load() }, [load])

  const openCreate = (): void => { setEditing(null); setForm(DEFAULT); setOpen(true) }
  const openEdit = (row: Achievement): void => {
    setEditing(row)
    setForm({
      title: row.title,
      category: row.category ?? '',
      description: row.description ?? '',
      image_url: row.image_url ?? '',
      event_url: row.event_url ?? '',
    })
    setOpen(true)
  }

  const handleImageUpload = async (file: File): Promise<void> => {
    setUploading(true)
    try {
      const { url } = await uploadImage(supabase, file, 'logros')
      setForm((f) => ({ ...f, image_url: url }))
      toast.success('Imagen guardada en /uploads')
    } catch { toast.error('Error al subir imagen') } finally { setUploading(false) }
  }

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    const payload = {
      ...form,
      category: form.category || null,
      description: form.description || null,
      image_url: form.image_url || null,
      event_url: form.event_url || null,
    }
    const result = Schema.safeParse(form)
    if (!result.success) { toast.error(result.error.issues[0]?.message ?? 'Datos inválidos'); return }
    setSaving(true)
    try {
      if (editing) {
        const { error } = await supabase.from('achievements').update(payload).eq('id', editing.id)
        if (error) throw error
        void logAction(supabase, 'update', 'achievements', form.title)
        toast.success('Logro actualizado')
      } else {
        const { error } = await supabase.from('achievements').insert(payload)
        if (error) throw error
        void logAction(supabase, 'create', 'achievements', form.title)
        toast.success('Logro creado')
      }
      setOpen(false); await load()
    } catch { toast.error('Error al guardar') } finally { setSaving(false) }
  }

  const handleDelete = async (id: string): Promise<void> => {
    const { error } = await supabase.from('achievements').delete().eq('id', id)
    if (error) { toast.error('Error'); return }
    void logAction(supabase, 'delete', 'achievements', id)
    toast.success('Eliminado'); await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono-custom text-xs text-[#9B5CFF] opacity-60 mb-1">{'// achievements.dat'}</p>
          <h1 className="font-mono-custom text-2xl font-black text-[#9B5CFF]">Logros</h1>
        </div>
        <button onClick={openCreate} className="btn-primary" style={{ borderColor: 'rgba(155,92,255,0.4)', color: '#9B5CFF' }}>&gt; nuevo_logro()</button>
      </div>

      <div className="glass-card p-6">
        <CrudTable
          data={data} loading={loading} onEdit={openEdit} onDelete={handleDelete}
          columns={[
            { key: 'title', label: 'Logro', render: (r) => <span className="text-slate-200">{r.title}</span> },
            { key: 'category', label: 'Categoría', render: (r) => r.category ? <span className="text-[#9B5CFF]">{r.category}</span> : <span className="text-slate-600">—</span> },
            { key: 'image_url', label: 'Imagen', render: (r) => r.image_url ? <span className="text-[#00FF88]">✓</span> : <span className="text-slate-600">✗</span> },
            { key: 'event_url', label: 'Evento', render: (r) => r.event_url ? <a href={r.event_url} target="_blank" rel="noopener noreferrer" className="text-[#00E5FF] text-xs">ver →</a> : <span className="text-slate-600">—</span> },
          ]}
        />
      </div>

      <AdminModal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar Logro' : 'Nuevo Logro'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="font-mono-custom text-xs text-slate-400 block mb-1">Título *</label>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="input-field" required />
          </div>
          <div>
            <label className="font-mono-custom text-xs text-slate-400 block mb-1">Categoría</label>
            <input value={form.category ?? ''} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="input-field" placeholder="Hackathon, CTF, Curso..." />
          </div>
          <div>
            <label className="font-mono-custom text-xs text-slate-400 block mb-1">Descripción</label>
            <textarea value={form.description ?? ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input-field resize-none" rows={3} />
          </div>
          <div>
            <label className="font-mono-custom text-xs text-slate-400 block mb-1">URL del evento</label>
            <input value={form.event_url ?? ''} onChange={(e) => setForm((f) => ({ ...f, event_url: e.target.value }))} className="input-field" placeholder="https://..." />
          </div>
          <div>
            <label className="font-mono-custom text-xs text-slate-400 block mb-2">Imagen del logro</label>
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleImageUpload(f) }}
              className="input-field text-xs file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[rgba(155,92,255,0.1)] file:text-[#9B5CFF] file:font-mono-custom file:text-xs cursor-pointer"
            />
            {form.image_url ? (
              <div className="mt-2">
                <img src={form.image_url} alt="preview" className="h-20 rounded-lg object-cover" />
              </div>
            ) : null}
          </div>
          <button type="submit" disabled={saving || uploading} className="btn-primary w-full py-3 disabled:opacity-50" style={{ borderColor: 'rgba(155,92,255,0.4)', color: '#9B5CFF' }}>
            {saving ? '> guardando...' : uploading ? '> subiendo...' : '> guardar()'}
          </button>
        </form>
      </AdminModal>
    </div>
  )
}
