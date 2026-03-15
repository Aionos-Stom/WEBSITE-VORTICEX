'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { z } from 'zod'
import { CrudTable } from '@/components/admin/CrudTable'
import { AdminModal } from '@/components/admin/AdminModal'
import type { RegistroMensual } from '@/types/database'
import { formatMonth } from '@/lib/utils'

const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

const Schema = z.object({
  mes: z.string().min(1),
  ano: z.number().int().min(2020).max(2100),
  horas_estudio: z.number().int().min(0),
  certs_completados: z.number().int().min(0),
  proyectos_activos: z.number().int().min(0),
  vulnerabilidades_encontradas: z.number().int().min(0),
  nivel_xp: z.number().int().min(0),
  notas: z.string().max(1000).optional(),
})

type FormData = z.infer<typeof Schema>

const DEFAULT: FormData = {
  mes: 'enero', ano: new Date().getFullYear(),
  horas_estudio: 0, certs_completados: 0,
  proyectos_activos: 0, vulnerabilidades_encontradas: 0,
  nivel_xp: 0, notas: '',
}

export default function AdminRegistroPage(): JSX.Element {
  const [data, setData] = useState<RegistroMensual[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<RegistroMensual | null>(null)
  const [form, setForm] = useState<FormData>(DEFAULT)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const load = useCallback(async (): Promise<void> => {
    const { data: rows } = await supabase
      .from('registro_mensual')
      .select('*')
      .order('ano', { ascending: false })
      .order('mes', { ascending: false })
    setData(rows ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { void load() }, [load])

  const openCreate = (): void => { setEditing(null); setForm(DEFAULT); setOpen(true) }
  const openEdit = (row: RegistroMensual): void => {
    setEditing(row)
    setForm({
      mes: row.mes, ano: row.ano,
      horas_estudio: row.horas_estudio,
      certs_completados: row.certs_completados,
      proyectos_activos: row.proyectos_activos,
      vulnerabilidades_encontradas: row.vulnerabilidades_encontradas,
      nivel_xp: row.nivel_xp, notas: row.notas ?? '',
    })
    setOpen(true)
  }

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    const numForm = {
      ...form,
      ano: Number(form.ano),
      horas_estudio: Number(form.horas_estudio),
      certs_completados: Number(form.certs_completados),
      proyectos_activos: Number(form.proyectos_activos),
      vulnerabilidades_encontradas: Number(form.vulnerabilidades_encontradas),
      nivel_xp: Number(form.nivel_xp),
    }
    const result = Schema.safeParse(numForm)
    if (!result.success) { toast.error(result.error.issues[0]?.message ?? 'Datos inválidos'); return }

    setSaving(true)
    try {
      if (editing) {
        const { error } = await supabase.from('registro_mensual').update({ ...result.data, updated_at: new Date().toISOString() }).eq('id', editing.id)
        if (error) throw error
        toast.success('Registro actualizado')
      } else {
        const { error } = await supabase.from('registro_mensual').insert(result.data)
        if (error) throw error
        toast.success('Registro creado')
      }
      setOpen(false)
      await load()
    } catch { toast.error('Error al guardar') } finally { setSaving(false) }
  }

  const handleDelete = async (id: string): Promise<void> => {
    const { error } = await supabase.from('registro_mensual').delete().eq('id', id)
    if (error) { toast.error('Error al eliminar'); return }
    toast.success('Eliminado')
    await load()
  }

  const numField = (key: keyof FormData, label: string): JSX.Element => (
    <div key={key}>
      <label className="font-mono-custom text-xs text-slate-400 block mb-1">{label}</label>
      <input type="number" value={String(form[key] ?? 0)} onChange={(e) => setForm((f) => ({ ...f, [key]: Number(e.target.value) }))} className="input-field" min="0" />
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono-custom text-xs text-[#00E5FF] opacity-60 mb-1">{'// registro_mensual'}</p>
          <h1 className="font-mono-custom text-2xl font-black text-[#00E5FF]">Registro Mensual</h1>
        </div>
        <button onClick={openCreate} className="btn-primary">&gt; nuevo_registro()</button>
      </div>

      <div className="glass-card p-6">
        <CrudTable
          data={data}
          loading={loading}
          onEdit={openEdit}
          onDelete={handleDelete}
          columns={[
            { key: 'mes', label: 'Período', render: (r) => formatMonth(r.mes, r.ano) },
            { key: 'horas_estudio', label: 'Horas', render: (r) => `${r.horas_estudio}h` },
            { key: 'certs_completados', label: 'Certs' },
            { key: 'proyectos_activos', label: 'Proyectos' },
            { key: 'vulnerabilidades_encontradas', label: 'Vulns' },
            { key: 'nivel_xp', label: 'XP', render: (r) => <span className="text-[#00FF88]">+{r.nivel_xp}</span> },
          ]}
        />
      </div>

      <AdminModal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar Registro' : 'Nuevo Registro'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Mes</label>
              <select value={form.mes} onChange={(e) => setForm((f) => ({ ...f, mes: e.target.value }))} className="input-field">
                {MESES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            {numField('ano', 'Año')}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {numField('horas_estudio', 'Horas de estudio')}
            {numField('certs_completados', 'Certs completados')}
            {numField('proyectos_activos', 'Proyectos activos')}
            {numField('vulnerabilidades_encontradas', 'Vulns encontradas')}
            {numField('nivel_xp', 'XP ganado')}
          </div>
          <div>
            <label className="font-mono-custom text-xs text-slate-400 block mb-1">Notas</label>
            <textarea value={form.notas ?? ''} onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))} className="input-field resize-none" rows={3} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full py-3 disabled:opacity-50">
            {saving ? '> guardando...' : '> guardar()'}
          </button>
        </form>
      </AdminModal>
    </div>
  )
}
