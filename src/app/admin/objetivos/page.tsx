'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { z } from 'zod'
import { CrudTable } from '@/components/admin/CrudTable'
import { AdminModal } from '@/components/admin/AdminModal'
import type { Objective } from '@/types/database'
import { STATUS_COLORS, STATUS_LABELS } from '@/types/database'

const STATUSES = ['activo', 'pendiente', 'completado'] as const

const Schema = z.object({
  title: z.string().min(1).max(200),
  date_label: z.string().max(100).optional().or(z.literal('')),
  status: z.enum(['activo', 'pendiente', 'completado']),
  sort_order: z.number().int().min(0),
})

type FormData = z.infer<typeof Schema>

const DEFAULT: FormData = {
  title: '',
  date_label: '',
  status: 'pendiente',
  sort_order: 0,
}

export default function AdminObjetivosPage(): JSX.Element {
  const [data, setData] = useState<Objective[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Objective | null>(null)
  const [form, setForm] = useState<FormData>(DEFAULT)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const load = useCallback(async (): Promise<void> => {
    const { data: rows } = await supabase.from('objectives').select('*').order('sort_order')
    setData((rows ?? []) as Objective[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { void load() }, [load])

  const openCreate = (): void => { setEditing(null); setForm(DEFAULT); setOpen(true) }
  const openEdit = (row: Objective): void => {
    setEditing(row)
    setForm({
      title: row.title,
      date_label: row.date_label ?? '',
      status: row.status as 'activo' | 'pendiente' | 'completado',
      sort_order: row.sort_order,
    })
    setOpen(true)
  }

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    const payload = {
      ...form,
      date_label: form.date_label || null,
      sort_order: Number(form.sort_order),
    }
    const result = Schema.safeParse(form)
    if (!result.success) { toast.error(result.error.issues[0]?.message ?? 'Datos inválidos'); return }
    setSaving(true)
    try {
      if (editing) {
        const { error } = await supabase.from('objectives').update(payload).eq('id', editing.id)
        if (error) throw error
        toast.success('Objetivo actualizado')
      } else {
        const { error } = await supabase.from('objectives').insert(payload)
        if (error) throw error
        toast.success('Objetivo creado')
      }
      setOpen(false); await load()
    } catch { toast.error('Error al guardar') } finally { setSaving(false) }
  }

  const handleDelete = async (id: string): Promise<void> => {
    const { error } = await supabase.from('objectives').delete().eq('id', id)
    if (error) { toast.error('Error'); return }
    toast.success('Eliminado'); await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono-custom text-xs text-[#00FF88] opacity-60 mb-1">{'// objectives.yaml'}</p>
          <h1 className="font-mono-custom text-2xl font-black text-[#00FF88]">Objetivos</h1>
        </div>
        <button onClick={openCreate} className="btn-primary" style={{ borderColor: 'rgba(0,255,136,0.4)', color: '#00FF88' }}>&gt; nuevo_objetivo()</button>
      </div>

      <div className="glass-card p-6">
        <CrudTable
          data={data} loading={loading} onEdit={openEdit} onDelete={handleDelete}
          columns={[
            { key: 'sort_order', label: '#', render: (r) => <span className="text-slate-600">{r.sort_order}</span> },
            { key: 'title', label: 'Objetivo', render: (r) => <span className={r.status === 'completado' ? 'line-through text-slate-500' : 'text-slate-200'}>{r.title}</span> },
            { key: 'date_label', label: 'Fecha', render: (r) => r.date_label ? <span className="text-slate-400">{r.date_label}</span> : <span className="text-slate-600">—</span> },
            { key: 'status', label: 'Estado', render: (r) => (
              <span className="font-mono-custom text-xs px-2 py-0.5 rounded" style={{ color: STATUS_COLORS[r.status] ?? '#fff', background: `${STATUS_COLORS[r.status] ?? '#fff'}15` }}>
                {STATUS_LABELS[r.status] ?? r.status}
              </span>
            )},
          ]}
        />
      </div>

      <AdminModal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar Objetivo' : 'Nuevo Objetivo'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="font-mono-custom text-xs text-slate-400 block mb-1">Título *</label>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="input-field" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Estado</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as FormData['status'] }))} className="input-field">
                {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Orden</label>
              <input type="number" min="0" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))} className="input-field" />
            </div>
          </div>
          <div>
            <label className="font-mono-custom text-xs text-slate-400 block mb-1">Etiqueta de fecha</label>
            <input value={form.date_label ?? ''} onChange={(e) => setForm((f) => ({ ...f, date_label: e.target.value }))} className="input-field" placeholder="Q2 2026, Marzo 2026..." />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full py-3 disabled:opacity-50">
            {saving ? '> guardando...' : '> guardar()'}
          </button>
        </form>
      </AdminModal>
    </div>
  )
}
