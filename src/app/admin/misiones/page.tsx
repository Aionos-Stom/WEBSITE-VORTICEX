'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { z } from 'zod'
import { CrudTable } from '@/components/admin/CrudTable'
import { AdminModal } from '@/components/admin/AdminModal'
import type { Mision } from '@/types/database'
import { getEstadoColor } from '@/lib/utils'

const Schema = z.object({
  titulo: z.string().min(1).max(200),
  descripcion: z.string().min(1).max(2000),
  estado: z.enum(['COMPLETADA', 'EN_PROGRESO', 'PLANIFICADA']),
  tecnologias: z.string(), // comma-separated input, parsed to array
  github_url: z.string().url().optional().or(z.literal('')),
  demo_url: z.string().url().optional().or(z.literal('')),
  imagen_url: z.string().url().optional().or(z.literal('')),
  fecha_inicio: z.string().optional().or(z.literal('')),
  fecha_fin: z.string().optional().or(z.literal('')),
  dificultad: z.number().int().min(1).max(5),
  orden: z.number().int().min(0),
  activo: z.boolean(),
})

type FormData = Omit<z.infer<typeof Schema>, 'tecnologias'> & { tecnologias: string }

const DEFAULT: FormData = {
  titulo: '', descripcion: '', estado: 'PLANIFICADA',
  tecnologias: '', github_url: '', demo_url: '', imagen_url: '',
  fecha_inicio: '', fecha_fin: '', dificultad: 3, orden: 0, activo: true,
}

export default function AdminMisionesPage(): JSX.Element {
  const [data, setData] = useState<Mision[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Mision | null>(null)
  const [form, setForm] = useState<FormData>(DEFAULT)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const load = useCallback(async (): Promise<void> => {
    const { data: rows } = await supabase.from('misiones').select('*').order('orden')
    setData(rows ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { void load() }, [load])

  const openCreate = (): void => { setEditing(null); setForm(DEFAULT); setOpen(true) }
  const openEdit = (row: Mision): void => {
    setEditing(row)
    setForm({ titulo: row.titulo, descripcion: row.descripcion, estado: row.estado, tecnologias: row.tecnologias.join(', '), github_url: row.github_url ?? '', demo_url: row.demo_url ?? '', imagen_url: row.imagen_url ?? '', fecha_inicio: row.fecha_inicio ?? '', fecha_fin: row.fecha_fin ?? '', dificultad: row.dificultad, orden: row.orden, activo: row.activo })
    setOpen(true)
  }

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    const result = Schema.safeParse({ ...form, dificultad: Number(form.dificultad), orden: Number(form.orden) })
    if (!result.success) { toast.error(result.error.issues[0]?.message ?? 'Datos inválidos'); return }
    const payload = { ...result.data, tecnologias: form.tecnologias.split(',').map((t) => t.trim()).filter(Boolean) }
    setSaving(true)
    try {
      if (editing) {
        const { error } = await supabase.from('misiones').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editing.id)
        if (error) throw error
        toast.success('Misión actualizada')
      } else {
        const { error } = await supabase.from('misiones').insert(payload)
        if (error) throw error
        toast.success('Misión creada')
      }
      setOpen(false); await load()
    } catch { toast.error('Error al guardar') } finally { setSaving(false) }
  }

  const handleDelete = async (id: string): Promise<void> => {
    const { error } = await supabase.from('misiones').delete().eq('id', id)
    if (error) { toast.error('Error'); return }
    toast.success('Eliminado'); await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono-custom text-xs text-[#00FF88] opacity-60 mb-1">{'// operations.log'}</p>
          <h1 className="font-mono-custom text-2xl font-black text-[#00FF88]">Misiones</h1>
        </div>
        <button onClick={openCreate} className="btn-primary" style={{ borderColor: 'rgba(0,255,136,0.4)', color: '#00FF88' }}>&gt; nueva_mision()</button>
      </div>

      <div className="glass-card p-6">
        <CrudTable
          data={data} loading={loading} onEdit={openEdit} onDelete={handleDelete}
          columns={[
            { key: 'titulo', label: 'Título' },
            { key: 'estado', label: 'Estado', render: (r) => <span style={{ color: getEstadoColor(r.estado) }}>{r.estado}</span> },
            { key: 'dificultad', label: 'Dificultad', render: (r) => '★'.repeat(r.dificultad) },
            { key: 'tecnologias', label: 'Tecnologías', render: (r) => r.tecnologias.slice(0, 3).join(', ') + (r.tecnologias.length > 3 ? '...' : '') },
            { key: 'activo', label: 'Estado', render: (r) => <span className={r.activo ? 'text-[#00FF88]' : 'text-slate-600'}>{r.activo ? '● activo' : '○ oculto'}</span> },
          ]}
        />
      </div>

      <AdminModal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar Misión' : 'Nueva Misión'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="font-mono-custom text-xs text-slate-400 block mb-1">Título *</label>
            <input value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} className="input-field" required />
          </div>
          <div>
            <label className="font-mono-custom text-xs text-slate-400 block mb-1">Descripción *</label>
            <textarea value={form.descripcion} onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} className="input-field resize-none" rows={3} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Estado</label>
              <select value={form.estado} onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value as Mision['estado'] }))} className="input-field">
                <option value="PLANIFICADA">PLANIFICADA</option>
                <option value="EN_PROGRESO">EN PROGRESO</option>
                <option value="COMPLETADA">COMPLETADA</option>
              </select>
            </div>
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Dificultad (1-5)</label>
              <input type="number" min="1" max="5" value={form.dificultad} onChange={(e) => setForm((f) => ({ ...f, dificultad: Number(e.target.value) }))} className="input-field" />
            </div>
          </div>
          <div>
            <label className="font-mono-custom text-xs text-slate-400 block mb-1">Tecnologías (separadas por coma)</label>
            <input value={form.tecnologias} onChange={(e) => setForm((f) => ({ ...f, tecnologias: e.target.value }))} className="input-field" placeholder="Next.js, Supabase, Three.js" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">GitHub URL</label>
              <input type="url" value={form.github_url ?? ''} onChange={(e) => setForm((f) => ({ ...f, github_url: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Demo URL</label>
              <input type="url" value={form.demo_url ?? ''} onChange={(e) => setForm((f) => ({ ...f, demo_url: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Imagen URL</label>
              <input type="url" value={form.imagen_url ?? ''} onChange={(e) => setForm((f) => ({ ...f, imagen_url: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Orden</label>
              <input type="number" min="0" value={form.orden} onChange={(e) => setForm((f) => ({ ...f, orden: Number(e.target.value) }))} className="input-field" />
            </div>
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Fecha inicio</label>
              <input type="date" value={form.fecha_inicio ?? ''} onChange={(e) => setForm((f) => ({ ...f, fecha_inicio: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Fecha fin</label>
              <input type="date" value={form.fecha_fin ?? ''} onChange={(e) => setForm((f) => ({ ...f, fecha_fin: e.target.value }))} className="input-field" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="font-mono-custom text-xs text-slate-400">Activo</label>
            <button type="button" onClick={() => setForm((f) => ({ ...f, activo: !f.activo }))} className={`w-12 h-6 rounded-full transition-colors relative ${form.activo ? 'bg-[#00FF88]' : 'bg-slate-700'}`}>
              <span className={`absolute top-1 w-4 h-4 bg-black rounded-full transition-transform ${form.activo ? 'translate-x-7' : 'translate-x-1'}`} />
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
