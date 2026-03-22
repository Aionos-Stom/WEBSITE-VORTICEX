'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { z } from 'zod'
import { CrudTable } from '@/components/admin/CrudTable'
import { AdminModal } from '@/components/admin/AdminModal'
import type { MonthlyEntry } from '@/types/database'
import { ImageUploadField } from '@/components/admin/ImageUploadField'
import { logAction } from '@/lib/audit'

const STATUSES = ['activo', 'pendiente', 'completado'] as const

const Schema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Formato YYYY-MM requerido'),
  title: z.string().min(1).max(200),
  highlight_word: z.string().max(50).optional().or(z.literal('')),
  description: z.string().max(2000).optional().or(z.literal('')),
  status: z.enum(['activo', 'pendiente', 'completado']),
  image_url: z.string().url().optional().or(z.literal('')),
})

type FormData = z.infer<typeof Schema>

const currentMonth = (): string => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

const DEFAULT: FormData = {
  month: currentMonth(),
  title: '',
  highlight_word: '',
  description: '',
  status: 'activo',
  image_url: '',
}

export default function AdminRegistroPage(): JSX.Element {
  const [data, setData] = useState<MonthlyEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<MonthlyEntry | null>(null)
  const [form, setForm] = useState<FormData>(DEFAULT)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const load = useCallback(async (): Promise<void> => {
    const { data: rows } = await supabase
      .from('monthly_entries')
      .select('*')
      .order('month', { ascending: false })
    setData((rows ?? []) as MonthlyEntry[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { void load() }, [load])

  const openCreate = (): void => { setEditing(null); setForm(DEFAULT); setOpen(true) }
  const openEdit = (row: MonthlyEntry): void => {
    setEditing(row)
    setForm({
      month: row.month,
      title: row.title,
      highlight_word: row.highlight_word ?? '',
      description: row.description ?? '',
      status: row.status as 'activo' | 'pendiente' | 'completado',
      image_url: row.image_url ?? '',
    })
    setOpen(true)
  }

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    const payload = {
      ...form,
      highlight_word: form.highlight_word || null,
      description: form.description || null,
      image_url: form.image_url || null,
    }
    const result = Schema.safeParse(form)
    if (!result.success) { toast.error(result.error.issues[0]?.message ?? 'Datos inválidos'); return }

    setSaving(true)
    try {
      if (editing) {
        const { error } = await supabase.from('monthly_entries').update(payload).eq('id', editing.id)
        if (error) throw error
        void logAction(supabase, 'update', 'monthly_entries', form.title)
        toast.success('Entrada actualizada')
      } else {
        const { error } = await supabase.from('monthly_entries').insert(payload)
        if (error) throw error
        void logAction(supabase, 'create', 'monthly_entries', form.title)
        toast.success('Entrada creada')
      }
      setOpen(false)
      await load()
    } catch { toast.error('Error al guardar') } finally { setSaving(false) }
  }

  const handleDelete = async (id: string): Promise<void> => {
    const { error } = await supabase.from('monthly_entries').delete().eq('id', id)
    if (error) { toast.error('Error al eliminar'); return }
    void logAction(supabase, 'delete', 'monthly_entries', id)
    toast.success('Eliminado')
    await load()
  }

  const STATUS_COLOR: Record<string, string> = {
    activo: '#00FF88',
    pendiente: '#F59E0B',
    completado: '#9B5CFF',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono-custom text-xs text-[#00E5FF] opacity-60 mb-1">{'// monthly_entries'}</p>
          <h1 className="font-mono-custom text-2xl font-black text-[#00E5FF]">Registro Mensual</h1>
        </div>
        <button onClick={openCreate} className="btn-primary">&gt; nueva_entrada()</button>
      </div>

      <div className="glass-card p-6">
        <CrudTable
          data={data}
          loading={loading}
          onEdit={openEdit}
          onDelete={handleDelete}
          columns={[
            { key: 'month', label: 'Período', render: (r) => <span className="font-mono-custom">{r.month}</span> },
            { key: 'title', label: 'Título', render: (r) => <span className="text-slate-200">{r.title}</span> },
            { key: 'highlight_word', label: 'Palabra clave', render: (r) => r.highlight_word ? <span className="text-[#00E5FF]">{r.highlight_word}</span> : <span className="text-slate-600">—</span> },
            { key: 'status', label: 'Estado', render: (r) => <span style={{ color: STATUS_COLOR[r.status] ?? '#fff' }}>● {r.status}</span> },
          ]}
        />
      </div>

      <AdminModal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar Entrada' : 'Nueva Entrada'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Mes (YYYY-MM) *</label>
              <input
                value={form.month}
                onChange={(e) => setForm((f) => ({ ...f, month: e.target.value }))}
                className="input-field"
                placeholder="2026-03"
                required
              />
            </div>
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Estado *</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as FormData['status'] }))} className="input-field">
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="font-mono-custom text-xs text-slate-400 block mb-1">Título *</label>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="input-field" required />
          </div>
          <div>
            <label className="font-mono-custom text-xs text-slate-400 block mb-1">Palabra destacada (highlight)</label>
            <input value={form.highlight_word ?? ''} onChange={(e) => setForm((f) => ({ ...f, highlight_word: e.target.value }))} className="input-field" placeholder="p.ej. Rust" />
          </div>
          <div>
            <label className="font-mono-custom text-xs text-slate-400 block mb-1">Descripción</label>
            <textarea value={form.description ?? ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input-field resize-none" rows={4} />
          </div>
          <ImageUploadField
            label="Imagen"
            value={form.image_url ?? ''}
            onChange={(url) => setForm((f) => ({ ...f, image_url: url }))}
            prefix="registro"
          />
          <button type="submit" disabled={saving} className="btn-primary w-full py-3 disabled:opacity-50">
            {saving ? '> guardando...' : '> guardar()'}
          </button>
        </form>
      </AdminModal>
    </div>
  )
}
