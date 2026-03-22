'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { z } from 'zod'
import { CrudTable } from '@/components/admin/CrudTable'
import { AdminModal } from '@/components/admin/AdminModal'
import type { Stat } from '@/types/database'

const Schema = z.object({
  label: z.string().min(1).max(100),
  value: z.string().min(1).max(50),
  suffix: z.string().max(20).optional().or(z.literal('')),
  sort_order: z.number().int().min(0),
})

type FormData = z.infer<typeof Schema>

const DEFAULT: FormData = {
  label: '',
  value: '',
  suffix: '',
  sort_order: 0,
}

export default function AdminStatsPage(): JSX.Element {
  const [data, setData] = useState<Stat[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Stat | null>(null)
  const [form, setForm] = useState<FormData>(DEFAULT)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const load = useCallback(async (): Promise<void> => {
    const { data: rows } = await supabase.from('stats').select('*').order('sort_order')
    setData((rows ?? []) as Stat[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { void load() }, [load])

  const openCreate = (): void => { setEditing(null); setForm(DEFAULT); setOpen(true) }
  const openEdit = (row: Stat): void => {
    setEditing(row)
    setForm({ label: row.label, value: row.value, suffix: row.suffix ?? '', sort_order: row.sort_order })
    setOpen(true)
  }

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    const payload = { ...form, suffix: form.suffix || null, sort_order: Number(form.sort_order) }
    const result = Schema.safeParse(form)
    if (!result.success) { toast.error(result.error.issues[0]?.message ?? 'Datos inválidos'); return }
    setSaving(true)
    try {
      if (editing) {
        const { error } = await supabase.from('stats').update(payload).eq('id', editing.id)
        if (error) throw error
        toast.success('Stat actualizada')
      } else {
        const { error } = await supabase.from('stats').insert(payload)
        if (error) throw error
        toast.success('Stat creada')
      }
      setOpen(false); await load()
    } catch { toast.error('Error al guardar') } finally { setSaving(false) }
  }

  const handleDelete = async (id: string): Promise<void> => {
    const { error } = await supabase.from('stats').delete().eq('id', id)
    if (error) { toast.error('Error'); return }
    toast.success('Eliminado'); await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono-custom text-xs text-[#00FF88] opacity-60 mb-1">{'// hero_stats'}</p>
          <h1 className="font-mono-custom text-2xl font-black text-[#00FF88]">Stats Hero</h1>
        </div>
        <button onClick={openCreate} className="btn-primary" style={{ borderColor: 'rgba(0,255,136,0.4)', color: '#00FF88' }}>&gt; nueva_stat()</button>
      </div>

      <div className="glass-card p-6">
        <CrudTable
          data={data} loading={loading} onEdit={openEdit} onDelete={handleDelete}
          columns={[
            { key: 'sort_order', label: '#', render: (r) => <span className="text-slate-600">{r.sort_order}</span> },
            { key: 'label', label: 'Label', render: (r) => <span className="text-slate-300">{r.label}</span> },
            { key: 'value', label: 'Valor', render: (r) => <span className="text-[#00FF88] font-bold">{r.value}{r.suffix}</span> },
          ]}
        />
      </div>

      <AdminModal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar Stat' : 'Nueva Stat'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="font-mono-custom text-xs text-slate-400 block mb-1">Label *</label>
            <input value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} className="input-field" placeholder="p.ej. Proyectos completados" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Valor *</label>
              <input value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} className="input-field" placeholder="42" required />
            </div>
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Sufijo</label>
              <input value={form.suffix ?? ''} onChange={(e) => setForm((f) => ({ ...f, suffix: e.target.value }))} className="input-field" placeholder="+" />
            </div>
          </div>
          <div>
            <label className="font-mono-custom text-xs text-slate-400 block mb-1">Orden</label>
            <input type="number" min="0" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))} className="input-field" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full py-3 disabled:opacity-50">
            {saving ? '> guardando...' : '> guardar()'}
          </button>
        </form>
      </AdminModal>
    </div>
  )
}
