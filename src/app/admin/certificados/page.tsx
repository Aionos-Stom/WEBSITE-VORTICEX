'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { z } from 'zod'
import { CrudTable } from '@/components/admin/CrudTable'
import { AdminModal } from '@/components/admin/AdminModal'
import type { Certificado } from '@/types/database'
import { formatDate } from '@/lib/utils'

const Schema = z.object({
  titulo: z.string().min(1).max(200),
  emisor: z.string().min(1).max(100),
  fecha_emision: z.string().min(1),
  fecha_expiracion: z.string().optional().or(z.literal('')),
  credencial_id: z.string().max(200).optional().or(z.literal('')),
  credencial_url: z.string().url().optional().or(z.literal('')),
  pdf_url: z.string().url().optional().or(z.literal('')),
  imagen_url: z.string().url().optional().or(z.literal('')),
  categoria: z.string().min(1).max(50),
  orden: z.number().int().min(0),
  activo: z.boolean(),
})

type FormData = z.infer<typeof Schema>

const DEFAULT: FormData = {
  titulo: '', emisor: '', fecha_emision: '', fecha_expiracion: '',
  credencial_id: '', credencial_url: '', pdf_url: '', imagen_url: '',
  categoria: 'Seguridad', orden: 0, activo: true,
}

const CATEGORIAS = ['Seguridad','Cloud','Desarrollo','Redes','Base de Datos','DevOps','IA/ML','Otro']

export default function AdminCertificadosPage(): JSX.Element {
  const [data, setData] = useState<Certificado[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Certificado | null>(null)
  const [form, setForm] = useState<FormData>(DEFAULT)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  const load = useCallback(async (): Promise<void> => {
    const { data: rows } = await supabase.from('certificados').select('*').order('orden').order('fecha_emision', { ascending: false })
    setData(rows ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { void load() }, [load])

  const openCreate = (): void => { setEditing(null); setForm(DEFAULT); setOpen(true) }
  const openEdit = (row: Certificado): void => {
    setEditing(row)
    setForm({ titulo: row.titulo, emisor: row.emisor, fecha_emision: row.fecha_emision, fecha_expiracion: row.fecha_expiracion ?? '', credencial_id: row.credencial_id ?? '', credencial_url: row.credencial_url ?? '', pdf_url: row.pdf_url ?? '', imagen_url: row.imagen_url ?? '', categoria: row.categoria, orden: row.orden, activo: row.activo })
    setOpen(true)
  }

  const handleFileUpload = async (file: File, tipo: 'pdf' | 'imagen'): Promise<void> => {
    setUploading(true)
    try {
      const ext = file.name.split('.').pop() ?? 'pdf'
      const path = `certificados/${Date.now()}-${tipo}.${ext}`
      const { error: uploadError } = await supabase.storage.from('portfolio').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('portfolio').getPublicUrl(path)
      const key = tipo === 'pdf' ? 'pdf_url' : 'imagen_url'
      setForm((f) => ({ ...f, [key]: urlData.publicUrl }))
      toast.success(`${tipo.toUpperCase()} subido`)
    } catch { toast.error('Error al subir archivo') } finally { setUploading(false) }
  }

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    const result = Schema.safeParse({ ...form, orden: Number(form.orden) })
    if (!result.success) { toast.error(result.error.issues[0]?.message ?? 'Datos inválidos'); return }
    setSaving(true)
    try {
      if (editing) {
        const { error } = await supabase.from('certificados').update({ ...result.data, updated_at: new Date().toISOString() }).eq('id', editing.id)
        if (error) throw error
        toast.success('Certificado actualizado')
      } else {
        const { error } = await supabase.from('certificados').insert(result.data)
        if (error) throw error
        toast.success('Certificado agregado')
      }
      setOpen(false); await load()
    } catch { toast.error('Error al guardar') } finally { setSaving(false) }
  }

  const handleDelete = async (id: string): Promise<void> => {
    const { error } = await supabase.from('certificados').delete().eq('id', id)
    if (error) { toast.error('Error'); return }
    toast.success('Eliminado'); await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono-custom text-xs text-[#F59E0B] opacity-60 mb-1">{'// credentials.db'}</p>
          <h1 className="font-mono-custom text-2xl font-black text-[#F59E0B]">Certificados</h1>
        </div>
        <button onClick={openCreate} className="btn-primary" style={{ borderColor: 'rgba(245,158,11,0.4)', color: '#F59E0B' }}>&gt; nuevo_cert()</button>
      </div>

      <div className="glass-card p-6">
        <CrudTable
          data={data} loading={loading} onEdit={openEdit} onDelete={handleDelete}
          columns={[
            { key: 'titulo', label: 'Título' },
            { key: 'emisor', label: 'Emisor' },
            { key: 'categoria', label: 'Categoría' },
            { key: 'fecha_emision', label: 'Fecha', render: (r) => formatDate(r.fecha_emision) },
            { key: 'pdf_url', label: 'PDF', render: (r) => r.pdf_url ? <span className="text-[#00FF88]">✓</span> : <span className="text-slate-600">✗</span> },
          ]}
        />
      </div>

      <AdminModal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar Certificado' : 'Nuevo Certificado'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="font-mono-custom text-xs text-slate-400 block mb-1">Título *</label>
            <input value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} className="input-field" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Emisor *</label>
              <input value={form.emisor} onChange={(e) => setForm((f) => ({ ...f, emisor: e.target.value }))} className="input-field" required />
            </div>
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Categoría</label>
              <select value={form.categoria} onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))} className="input-field">
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Fecha emisión *</label>
              <input type="date" value={form.fecha_emision} onChange={(e) => setForm((f) => ({ ...f, fecha_emision: e.target.value }))} className="input-field" required />
            </div>
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Fecha expiración</label>
              <input type="date" value={form.fecha_expiracion ?? ''} onChange={(e) => setForm((f) => ({ ...f, fecha_expiracion: e.target.value }))} className="input-field" />
            </div>
          </div>
          <div>
            <label className="font-mono-custom text-xs text-slate-400 block mb-1">ID Credencial</label>
            <input value={form.credencial_id ?? ''} onChange={(e) => setForm((f) => ({ ...f, credencial_id: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="font-mono-custom text-xs text-slate-400 block mb-1">URL Credencial (verificación)</label>
            <input type="url" value={form.credencial_url ?? ''} onChange={(e) => setForm((f) => ({ ...f, credencial_url: e.target.value }))} className="input-field" />
          </div>

          {/* File uploads */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Subir PDF</label>
              <input type="file" accept=".pdf" disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFileUpload(f, 'pdf') }} className="input-field text-xs file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[rgba(0,229,255,0.1)] file:text-[#00E5FF] file:font-mono-custom file:text-xs cursor-pointer" />
              {form.pdf_url ? <p className="font-mono-custom text-xs text-[#00FF88] mt-1 truncate">✓ {form.pdf_url.split('/').pop()}</p> : null}
            </div>
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Subir imagen</label>
              <input type="file" accept="image/*" disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFileUpload(f, 'imagen') }} className="input-field text-xs file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[rgba(0,229,255,0.1)] file:text-[#00E5FF] file:font-mono-custom file:text-xs cursor-pointer" />
              {form.imagen_url ? <p className="font-mono-custom text-xs text-[#00FF88] mt-1 truncate">✓ cargada</p> : null}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="font-mono-custom text-xs text-slate-400">Activo</label>
            <button type="button" onClick={() => setForm((f) => ({ ...f, activo: !f.activo }))} className={`w-12 h-6 rounded-full transition-colors relative ${form.activo ? 'bg-[#00FF88]' : 'bg-slate-700'}`}>
              <span className={`absolute top-1 w-4 h-4 bg-black rounded-full transition-transform ${form.activo ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
          <button type="submit" disabled={saving || uploading} className="btn-primary w-full py-3 disabled:opacity-50">
            {saving ? '> guardando...' : uploading ? '> subiendo...' : '> guardar()'}
          </button>
        </form>
      </AdminModal>
    </div>
  )
}
