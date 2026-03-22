'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { z } from 'zod'
import { CrudTable } from '@/components/admin/CrudTable'
import { AdminModal } from '@/components/admin/AdminModal'
import type { Skill } from '@/types/database'
import { COLOR_MAP } from '@/types/database'

const COLOR_OPTIONS = Object.keys(COLOR_MAP) as Array<keyof typeof COLOR_MAP>

const Schema = z.object({
  name: z.string().min(1).max(100),
  percentage: z.number().int().min(0).max(100),
  color_class: z.string().min(1),
  sort_order: z.number().int().min(0),
})

type FormData = z.infer<typeof Schema>

const DEFAULT: FormData = {
  name: '',
  percentage: 80,
  color_class: 'cyan',
  sort_order: 0,
}

export default function AdminArsenalPage(): JSX.Element {
  const [data, setData] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Skill | null>(null)
  const [form, setForm] = useState<FormData>(DEFAULT)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const load = useCallback(async (): Promise<void> => {
    const { data: rows } = await supabase.from('skills').select('*').order('sort_order')
    setData((rows ?? []) as Skill[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { void load() }, [load])

  const openCreate = (): void => { setEditing(null); setForm(DEFAULT); setOpen(true) }
  const openEdit = (row: Skill): void => {
    setEditing(row)
    setForm({ name: row.name, percentage: row.percentage, color_class: row.color_class, sort_order: row.sort_order })
    setOpen(true)
  }

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    const result = Schema.safeParse({ ...form, percentage: Number(form.percentage), sort_order: Number(form.sort_order) })
    if (!result.success) { toast.error(result.error.issues[0]?.message ?? 'Datos inválidos'); return }
    setSaving(true)
    try {
      if (editing) {
        const { error } = await supabase.from('skills').update(result.data).eq('id', editing.id)
        if (error) throw error
        toast.success('Skill actualizada')
      } else {
        const { error } = await supabase.from('skills').insert(result.data)
        if (error) throw error
        toast.success('Skill agregada')
      }
      setOpen(false); await load()
    } catch { toast.error('Error al guardar') } finally { setSaving(false) }
  }

  const handleDelete = async (id: string): Promise<void> => {
    const { error } = await supabase.from('skills').delete().eq('id', id)
    if (error) { toast.error('Error'); return }
    toast.success('Eliminado'); await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono-custom text-xs text-[#9B5CFF] opacity-60 mb-1">{'// skills.json'}</p>
          <h1 className="font-mono-custom text-2xl font-black text-[#9B5CFF]">Skills</h1>
        </div>
        <button onClick={openCreate} className="btn-primary" style={{ borderColor: 'rgba(155,92,255,0.4)', color: '#9B5CFF' }}>&gt; nueva_skill()</button>
      </div>

      <div className="glass-card p-6">
        <CrudTable
          data={data} loading={loading} onEdit={openEdit} onDelete={handleDelete}
          columns={[
            { key: 'name', label: 'Skill', render: (r) => <span style={{ color: COLOR_MAP[r.color_class] ?? '#00E5FF' }}>{r.name}</span> },
            { key: 'percentage', label: '%', render: (r) => (
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${r.percentage}%`, background: COLOR_MAP[r.color_class] ?? '#00E5FF' }} />
                </div>
                <span className="text-xs text-slate-400">{r.percentage}%</span>
              </div>
            )},
            { key: 'color_class', label: 'Color', render: (r) => <span className="font-mono-custom text-xs" style={{ color: COLOR_MAP[r.color_class] ?? '#00E5FF' }}>{r.color_class}</span> },
            { key: 'sort_order', label: 'Orden' },
          ]}
        />
      </div>

      <AdminModal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar Skill' : 'Nueva Skill'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="font-mono-custom text-xs text-slate-400 block mb-1">Nombre *</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-field" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Porcentaje (0-100)</label>
              <input type="number" min="0" max="100" value={form.percentage} onChange={(e) => setForm((f) => ({ ...f, percentage: Number(e.target.value) }))} className="input-field" />
            </div>
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Orden</label>
              <input type="number" min="0" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))} className="input-field" />
            </div>
          </div>
          <div>
            <label className="font-mono-custom text-xs text-slate-400 block mb-1">Color</label>
            <select value={form.color_class} onChange={(e) => setForm((f) => ({ ...f, color_class: e.target.value }))} className="input-field">
              {COLOR_OPTIONS.map((c) => (
                <option key={c} value={c}>{c} ({COLOR_MAP[c]})</option>
              ))}
            </select>
            <div className="mt-2 h-2 rounded-full" style={{ background: COLOR_MAP[form.color_class] ?? '#00E5FF' }} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full py-3 disabled:opacity-50">
            {saving ? '> guardando...' : '> guardar()'}
          </button>
        </form>
      </AdminModal>
    </div>
  )
}
