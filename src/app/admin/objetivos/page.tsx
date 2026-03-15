'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { z } from 'zod'
import { CrudTable } from '@/components/admin/CrudTable'
import { AdminModal } from '@/components/admin/AdminModal'
import type { Objetivo } from '@/types/database'

const Schema = z.object({
  titulo: z.string().min(1).max(200),
  descripcion: z.string().min(1).max(1000),
  progreso: z.number().min(0),
  meta: z.number().min(1),
  unidad: z.string().min(1).max(50),
  categoria: z.string().min(1).max(50),
  fecha_limite: z.string().optional().or(z.literal('')),
  completado: z.boolean(),
  orden: z.number().int().min(0),
  activo: z.boolean(),
})

type FormData = z.infer<typeof Schema>

const DEFAULT: FormData = {
  titulo: '', descripcion: '', progreso: 0, meta: 100,
  unidad: '%', categoria: 'Certificación',
  fecha_limite: '', completado: false, orden: 0, activo: true,
}

const CATEGORIAS = ['Seguridad','Certificación','Desarrollo','Cloud','Redes','Aprendizaje','Fitness','Otro']

export default function AdminObjetivosPage(): JSX.Element {
  const [data, setData] = useState<Objetivo[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Objetivo | null>(null)
  const [form, setForm] = useState<FormData>(DEFAULT)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const load = useCallback(async (): Promise<void> => {
    const { data: rows } = await supabase.from('objetivos').select('*').order('completado').order('orden')
    setData(rows ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { void load() }, [load])

  const openCreate = (): void => { setEditing(null); setForm(DEFAULT); setOpen(true) }
  const openEdit = (row: Objetivo): void => {
    setEditing(row)
    setForm({ titulo: row.titulo, descripcion: row.descripcion, progreso: row.progreso, meta: row.meta, unidad: row.unidad, categoria: row.categoria, fecha_limite: row.fecha_limite ?? '', completado: row.completado, orden: row.orden, activo: row.activo })
    setOpen(true)
  }

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    const result = Schema.safeParse({ ...form, progreso: Number(form.progreso), meta: Number(form.meta), orden: Number(form.orden) })
    if (!result.success) { toast.error(result.error.issues[0]?.message ?? 'Datos inválidos'); return }
    setSaving(true)
    try {
      if (editing) {
        const { error } = await supabase.from('objetivos').update({ ...result.data, updated_at: new Date().toISOString() }).eq('id', editing.id)
        if (error) throw error
        toast.success('Objetivo actualizado')
      } else {
        const { error } = await supabase.from('objetivos').insert(result.data)
        if (error) throw error
        toast.success('Objetivo creado')
      }
      setOpen(false); await load()
    } catch { toast.error('Error al guardar') } finally { setSaving(false) }
  }

  const handleDelete = async (id: string): Promise<void> => {
    const { error } = await supabase.from('objetivos').delete().eq('id', id)
    if (error) { toast.error('Error'); return }
    toast.success('Eliminado'); await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono-custom text-xs text-[#00FF88] opacity-60 mb-1">{'// mission_objectives.yaml'}</p>
          <h1 className="font-mono-custom text-2xl font-black text-[#00FF88]">Objetivos</h1>
        </div>
        <button onClick={openCreate} className="btn-primary" style={{ borderColor: 'rgba(0,255,136,0.4)', color: '#00FF88' }}>&gt; nuevo_objetivo()</button>
      </div>

      <div className="glass-card p-6">
        <CrudTable
          data={data} loading={loading} onEdit={openEdit} onDelete={handleDelete}
          columns={[
            { key: 'titulo', label: 'Objetivo' },
            { key: 'categoria', label: 'Categoría' },
            { key: 'progreso', label: 'Progreso', render: (r) => {
              const pct = Math.round((r.progreso / r.meta) * 100)
              return <span className={pct >= 100 ? 'text-[#00FF88]' : 'text-[#00E5FF]'}>{pct}% ({r.progreso}/{r.meta} {r.unidad})</span>
            }},
            { key: 'completado', label: 'Estado', render: (r) => <span className={r.completado ? 'text-[#00FF88]' : 'text-[#00E5FF]'}>{r.completado ? '✓ COMPLETADO' : '◎ ACTIVO'}</span> },
            { key: 'fecha_limite', label: 'Límite', render: (r) => r.fecha_limite ? new Date(r.fecha_limite).toLocaleDateString('es-ES') : '—' },
          ]}
        />
      </div>

      <AdminModal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar Objetivo' : 'Nuevo Objetivo'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="font-mono-custom text-xs text-slate-400 block mb-1">Título *</label>
            <input value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} className="input-field" required />
          </div>
          <div>
            <label className="font-mono-custom text-xs text-slate-400 block mb-1">Descripción *</label>
            <textarea value={form.descripcion} onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} className="input-field resize-none" rows={2} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Categoría</label>
              <select value={form.categoria} onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))} className="input-field">
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Unidad</label>
              <input value={form.unidad} onChange={(e) => setForm((f) => ({ ...f, unidad: e.target.value }))} className="input-field" placeholder="%, horas, certs..." />
            </div>
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Progreso actual</label>
              <input type="number" min="0" value={form.progreso} onChange={(e) => setForm((f) => ({ ...f, progreso: Number(e.target.value) }))} className="input-field" />
            </div>
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Meta</label>
              <input type="number" min="1" value={form.meta} onChange={(e) => setForm((f) => ({ ...f, meta: Number(e.target.value) }))} className="input-field" />
            </div>
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Fecha límite</label>
              <input type="date" value={form.fecha_limite ?? ''} onChange={(e) => setForm((f) => ({ ...f, fecha_limite: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Orden</label>
              <input type="number" min="0" value={form.orden} onChange={(e) => setForm((f) => ({ ...f, orden: Number(e.target.value) }))} className="input-field" />
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-3">
              <label className="font-mono-custom text-xs text-slate-400">Completado</label>
              <button type="button" onClick={() => setForm((f) => ({ ...f, completado: !f.completado }))} className={`w-12 h-6 rounded-full transition-colors relative ${form.completado ? 'bg-[#00FF88]' : 'bg-slate-700'}`}>
                <span className={`absolute top-1 w-4 h-4 bg-black rounded-full transition-transform ${form.completado ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <label className="font-mono-custom text-xs text-slate-400">Activo</label>
              <button type="button" onClick={() => setForm((f) => ({ ...f, activo: !f.activo }))} className={`w-12 h-6 rounded-full transition-colors relative ${form.activo ? 'bg-[#00E5FF]' : 'bg-slate-700'}`}>
                <span className={`absolute top-1 w-4 h-4 bg-black rounded-full transition-transform ${form.activo ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full py-3 disabled:opacity-50">
            {saving ? '> guardando...' : '> guardar()'}
          </button>
        </form>
      </AdminModal>
    </div>
  )
}
