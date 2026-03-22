'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { z } from 'zod'
import { CrudTable } from '@/components/admin/CrudTable'
import { AdminModal } from '@/components/admin/AdminModal'
import type { Project } from '@/types/database'
import { ImageUploadField } from '@/components/admin/ImageUploadField'
import { logAction } from '@/lib/audit'

const Schema = z.object({
  name: z.string().min(1).max(200),
  category: z.string().max(50).optional().or(z.literal('')),
  description: z.string().max(2000).optional().or(z.literal('')),
  image_url: z.string().url().optional().or(z.literal('')),
  project_url: z.string().url().optional().or(z.literal('')),
  featured: z.boolean(),
  sort_order: z.number().int().min(0),
})

type FormData = z.infer<typeof Schema>

const DEFAULT: FormData = {
  name: '',
  category: '',
  description: '',
  image_url: '',
  project_url: '',
  featured: false,
  sort_order: 0,
}

export default function AdminMisionesPage(): JSX.Element {
  const [data, setData] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
  const [form, setForm] = useState<FormData>(DEFAULT)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const load = useCallback(async (): Promise<void> => {
    const { data: rows } = await supabase.from('projects').select('*').order('sort_order')
    setData((rows ?? []) as Project[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { void load() }, [load])

  const openCreate = (): void => { setEditing(null); setForm(DEFAULT); setOpen(true) }
  const openEdit = (row: Project): void => {
    setEditing(row)
    setForm({
      name: row.name,
      category: row.category ?? '',
      description: row.description ?? '',
      image_url: row.image_url ?? '',
      project_url: row.project_url ?? '',
      featured: row.featured,
      sort_order: row.sort_order,
    })
    setOpen(true)
  }

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    const payload = {
      ...form,
      category: form.category || null,
      description: form.description || null,
      image_url: form.image_url || null,
      project_url: form.project_url || null,
      sort_order: Number(form.sort_order),
    }
    const result = Schema.safeParse(form)
    if (!result.success) { toast.error(result.error.issues[0]?.message ?? 'Datos inválidos'); return }
    setSaving(true)
    try {
      if (editing) {
        const { error } = await supabase.from('projects').update(payload).eq('id', editing.id)
        if (error) throw error
        void logAction(supabase, 'update', 'projects', form.name)
        toast.success('Proyecto actualizado')
      } else {
        const { error } = await supabase.from('projects').insert(payload)
        if (error) throw error
        void logAction(supabase, 'create', 'projects', form.name)
        toast.success('Proyecto creado')
      }
      setOpen(false); await load()
    } catch { toast.error('Error al guardar') } finally { setSaving(false) }
  }

  const handleDelete = async (id: string): Promise<void> => {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) { toast.error('Error'); return }
    void logAction(supabase, 'delete', 'projects', id)
    toast.success('Eliminado'); await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono-custom text-xs text-[#F59E0B] opacity-60 mb-1">{'// projects.json'}</p>
          <h1 className="font-mono-custom text-2xl font-black text-[#F59E0B]">Proyectos</h1>
        </div>
        <button onClick={openCreate} className="btn-primary" style={{ borderColor: 'rgba(245,158,11,0.4)', color: '#F59E0B' }}>&gt; nuevo_proyecto()</button>
      </div>

      <div className="glass-card p-6">
        <CrudTable
          data={data} loading={loading} onEdit={openEdit} onDelete={handleDelete}
          columns={[
            { key: 'name', label: 'Nombre', render: (r) => <span className="text-slate-200">{r.name}</span> },
            { key: 'category', label: 'Categoría', render: (r) => r.category ? <span className="text-slate-400">{r.category}</span> : <span className="text-slate-600">—</span> },
            { key: 'featured', label: 'Destacado', render: (r) => r.featured ? <span className="text-[#F59E0B]">★ destacado</span> : <span className="text-slate-600">—</span> },
            { key: 'project_url', label: 'URL', render: (r) => r.project_url ? <span className="text-[#00FF88]">✓</span> : <span className="text-slate-600">✗</span> },
            { key: 'sort_order', label: '#' },
          ]}
        />
      </div>

      <AdminModal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar Proyecto' : 'Nuevo Proyecto'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="font-mono-custom text-xs text-slate-400 block mb-1">Nombre *</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-field" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Categoría</label>
              <input value={form.category ?? ''} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="input-field" placeholder="Web, Mobile, Security..." />
            </div>
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Orden</label>
              <input type="number" min="0" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))} className="input-field" />
            </div>
          </div>
          <div>
            <label className="font-mono-custom text-xs text-slate-400 block mb-1">Descripción</label>
            <textarea value={form.description ?? ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input-field resize-none" rows={3} />
          </div>
          <div>
            <label className="font-mono-custom text-xs text-slate-400 block mb-1">URL del proyecto</label>
            <input value={form.project_url ?? ''} onChange={(e) => setForm((f) => ({ ...f, project_url: e.target.value }))} className="input-field" placeholder="https://..." />
          </div>
          <ImageUploadField
            label="Imagen del proyecto"
            value={form.image_url ?? ''}
            onChange={(url) => setForm((f) => ({ ...f, image_url: url }))}
            prefix="proyectos"
          />
          <div className="flex items-center gap-3">
            <label className="font-mono-custom text-xs text-slate-400">Destacado</label>
            <button type="button" onClick={() => setForm((f) => ({ ...f, featured: !f.featured }))} className={`w-12 h-6 rounded-full transition-colors relative ${form.featured ? 'bg-[#F59E0B]' : 'bg-slate-700'}`}>
              <span className={`absolute top-1 w-4 h-4 bg-black rounded-full transition-transform ${form.featured ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full py-3 disabled:opacity-50">
            {saving ? '> guardando...' : '> guardar()'}
          </button>
        </form>
      </AdminModal>
    </div>
  )
}
