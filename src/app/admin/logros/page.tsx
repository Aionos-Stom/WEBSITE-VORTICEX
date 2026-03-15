'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { z } from 'zod'
import { CrudTable } from '@/components/admin/CrudTable'
import { AdminModal } from '@/components/admin/AdminModal'
import type { Logro } from '@/types/database'
import { getRarezaColor, formatDate } from '@/lib/utils'

const Schema = z.object({
  titulo: z.string().min(1).max(100),
  descripcion: z.string().min(1).max(500),
  icono: z.string().min(1).max(10),
  tipo: z.enum(['BADGE','TROPHY','STAR','SHIELD']),
  fecha: z.string().min(1),
  puntos_xp: z.number().int().min(0),
  rareza: z.enum(['COMUN','RARO','EPICO','LEGENDARIO']),
  orden: z.number().int().min(0),
  activo: z.boolean(),
})

type FormData = z.infer<typeof Schema>

const DEFAULT: FormData = {
  titulo: '', descripcion: '', icono: '🏅', tipo: 'BADGE',
  fecha: new Date().toISOString().split('T')[0]!, puntos_xp: 100,
  rareza: 'COMUN', orden: 0, activo: true,
}

export default function AdminLogrosPage(): JSX.Element {
  const [data, setData] = useState<Logro[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Logro | null>(null)
  const [form, setForm] = useState<FormData>(DEFAULT)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const load = useCallback(async (): Promise<void> => {
    const { data: rows } = await supabase.from('logros').select('*').order('orden')
    setData(rows ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { void load() }, [load])

  const openCreate = (): void => { setEditing(null); setForm(DEFAULT); setOpen(true) }
  const openEdit = (row: Logro): void => {
    setEditing(row)
    setForm({ titulo: row.titulo, descripcion: row.descripcion, icono: row.icono, tipo: row.tipo, fecha: row.fecha, puntos_xp: row.puntos_xp, rareza: row.rareza, orden: row.orden, activo: row.activo })
    setOpen(true)
  }

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    const result = Schema.safeParse({ ...form, puntos_xp: Number(form.puntos_xp), orden: Number(form.orden) })
    if (!result.success) { toast.error(result.error.issues[0]?.message ?? 'Datos inválidos'); return }
    setSaving(true)
    try {
      if (editing) {
        const { error } = await supabase.from('logros').update({ ...result.data, updated_at: new Date().toISOString() }).eq('id', editing.id)
        if (error) throw error
        toast.success('Logro actualizado')
      } else {
        const { error } = await supabase.from('logros').insert(result.data)
        if (error) throw error
        toast.success('Logro creado')
      }
      setOpen(false); await load()
    } catch { toast.error('Error al guardar') } finally { setSaving(false) }
  }

  const handleDelete = async (id: string): Promise<void> => {
    const { error } = await supabase.from('logros').delete().eq('id', id)
    if (error) { toast.error('Error'); return }
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
            { key: 'icono', label: '', render: (r) => <span className="text-xl">{r.icono}</span> },
            { key: 'titulo', label: 'Logro' },
            { key: 'rareza', label: 'Rareza', render: (r) => <span style={{ color: getRarezaColor(r.rareza) }}>{r.rareza}</span> },
            { key: 'puntos_xp', label: 'XP', render: (r) => <span className="text-[#00FF88]">+{r.puntos_xp}</span> },
            { key: 'fecha', label: 'Fecha', render: (r) => formatDate(r.fecha) },
          ]}
        />
      </div>

      <AdminModal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar Logro' : 'Nuevo Logro'}>
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
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Ícono (emoji)</label>
              <input value={form.icono} onChange={(e) => setForm((f) => ({ ...f, icono: e.target.value }))} className="input-field" placeholder="🏆" required />
            </div>
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Tipo</label>
              <select value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as Logro['tipo'] }))} className="input-field">
                {['BADGE','TROPHY','STAR','SHIELD'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Rareza</label>
              <select value={form.rareza} onChange={(e) => setForm((f) => ({ ...f, rareza: e.target.value as Logro['rareza'] }))} className="input-field">
                {['COMUN','RARO','EPICO','LEGENDARIO'].map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">XP</label>
              <input type="number" min="0" value={form.puntos_xp} onChange={(e) => setForm((f) => ({ ...f, puntos_xp: Number(e.target.value) }))} className="input-field" />
            </div>
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Fecha</label>
              <input type="date" value={form.fecha} onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))} className="input-field" required />
            </div>
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Orden</label>
              <input type="number" min="0" value={form.orden} onChange={(e) => setForm((f) => ({ ...f, orden: Number(e.target.value) }))} className="input-field" />
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
