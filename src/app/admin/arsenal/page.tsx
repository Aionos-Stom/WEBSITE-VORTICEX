'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { z } from 'zod'
import { CrudTable } from '@/components/admin/CrudTable'
import { AdminModal } from '@/components/admin/AdminModal'
import type { ArsenalTecnico } from '@/types/database'

const Schema = z.object({
  nombre: z.string().min(1).max(100),
  categoria: z.string().min(1).max(50),
  nivel: z.number().int().min(1).max(10),
  icono: z.string().max(10).optional().or(z.literal('')),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().or(z.literal('')),
  descripcion: z.string().max(500).optional().or(z.literal('')),
  orden: z.number().int().min(0),
  activo: z.boolean(),
})

type FormData = z.infer<typeof Schema>

const DEFAULT: FormData = {
  nombre: '', categoria: 'Lenguajes', nivel: 5,
  icono: '', color: '#00E5FF', descripcion: '', orden: 0, activo: true,
}

const CATEGORIAS = ['Lenguajes','Frameworks','Seguridad','Cloud','DevOps','Bases de Datos','Herramientas','Redes','Mobile']

export default function AdminArsenalPage(): JSX.Element {
  const [data, setData] = useState<ArsenalTecnico[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ArsenalTecnico | null>(null)
  const [form, setForm] = useState<FormData>(DEFAULT)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const load = useCallback(async (): Promise<void> => {
    const { data: rows } = await supabase.from('arsenal_tecnico').select('*').order('orden').order('categoria')
    setData(rows ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { void load() }, [load])

  const openCreate = (): void => { setEditing(null); setForm(DEFAULT); setOpen(true) }
  const openEdit = (row: ArsenalTecnico): void => {
    setEditing(row)
    setForm({ nombre: row.nombre, categoria: row.categoria, nivel: row.nivel, icono: row.icono ?? '', color: row.color ?? '#00E5FF', descripcion: row.descripcion ?? '', orden: row.orden, activo: row.activo })
    setOpen(true)
  }

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    const result = Schema.safeParse({ ...form, nivel: Number(form.nivel), orden: Number(form.orden) })
    if (!result.success) { toast.error(result.error.issues[0]?.message ?? 'Datos inválidos'); return }
    setSaving(true)
    try {
      if (editing) {
        const { error } = await supabase.from('arsenal_tecnico').update({ ...result.data, updated_at: new Date().toISOString() }).eq('id', editing.id)
        if (error) throw error
        toast.success('Skill actualizada')
      } else {
        const { error } = await supabase.from('arsenal_tecnico').insert(result.data)
        if (error) throw error
        toast.success('Skill agregada')
      }
      setOpen(false); await load()
    } catch { toast.error('Error al guardar') } finally { setSaving(false) }
  }

  const handleDelete = async (id: string): Promise<void> => {
    const { error } = await supabase.from('arsenal_tecnico').delete().eq('id', id)
    if (error) { toast.error('Error'); return }
    toast.success('Eliminado'); await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono-custom text-xs text-[#9B5CFF] opacity-60 mb-1">{'// tech_stack.json'}</p>
          <h1 className="font-mono-custom text-2xl font-black text-[#9B5CFF]">Arsenal Técnico</h1>
        </div>
        <button onClick={openCreate} className="btn-primary" style={{ borderColor: 'rgba(155,92,255,0.4)', color: '#9B5CFF' }}>&gt; nueva_skill()</button>
      </div>

      <div className="glass-card p-6">
        <CrudTable
          data={data} loading={loading} onEdit={openEdit} onDelete={handleDelete}
          columns={[
            { key: 'icono', label: '', render: (r) => <span className="text-xl">{r.icono}</span> },
            { key: 'nombre', label: 'Skill', render: (r) => <span style={{ color: r.color ?? '#00E5FF' }}>{r.nombre}</span> },
            { key: 'categoria', label: 'Categoría' },
            { key: 'nivel', label: 'Nivel', render: (r) => `${r.nivel}/10` },
            { key: 'activo', label: 'Estado', render: (r) => <span className={r.activo ? 'text-[#00FF88]' : 'text-slate-600'}>{r.activo ? '● activo' : '○ inactivo'}</span> },
          ]}
        />
      </div>

      <AdminModal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar Skill' : 'Nueva Skill'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Nombre *</label>
              <input value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} className="input-field" required />
            </div>
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Categoría *</label>
              <select value={form.categoria} onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))} className="input-field">
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Ícono (emoji)</label>
              <input value={form.icono ?? ''} onChange={(e) => setForm((f) => ({ ...f, icono: e.target.value }))} className="input-field" placeholder="⚡" />
            </div>
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Color hex</label>
              <div className="flex gap-2">
                <input type="color" value={form.color ?? '#00E5FF'} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} className="w-12 h-10 rounded border border-[rgba(0,229,255,0.2)] bg-transparent cursor-pointer" />
                <input value={form.color ?? ''} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} className="input-field" placeholder="#00E5FF" />
              </div>
            </div>
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Nivel (1-10)</label>
              <input type="number" min="1" max="10" value={form.nivel} onChange={(e) => setForm((f) => ({ ...f, nivel: Number(e.target.value) }))} className="input-field" />
            </div>
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Orden</label>
              <input type="number" min="0" value={form.orden} onChange={(e) => setForm((f) => ({ ...f, orden: Number(e.target.value) }))} className="input-field" />
            </div>
          </div>
          <div>
            <label className="font-mono-custom text-xs text-slate-400 block mb-1">Descripción</label>
            <textarea value={form.descripcion ?? ''} onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} className="input-field resize-none" rows={2} />
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
