'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { z } from 'zod'
import { CrudTable } from '@/components/admin/CrudTable'
import { AdminModal } from '@/components/admin/AdminModal'
import type { Certificate } from '@/types/database'
import { uploadFile, uploadImage } from '@/lib/storage'
import { logAction } from '@/lib/audit'

const Schema = z.object({
  name: z.string().min(1).max(200),
  issuer: z.string().min(1).max(100),
  date: z.string().min(1).max(50),
  file_url: z.string().url().optional().or(z.literal('')),
  file_type: z.enum(['image', 'pdf']),
  thumbnail_url: z.string().url().optional().or(z.literal('')),
})

type FormData = z.infer<typeof Schema>

const DEFAULT: FormData = {
  name: '',
  issuer: '',
  date: '',
  file_url: '',
  file_type: 'image',
  thumbnail_url: '',
}

export default function AdminCertificadosPage(): JSX.Element {
  const [data, setData] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Certificate | null>(null)
  const [form, setForm] = useState<FormData>(DEFAULT)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  const load = useCallback(async (): Promise<void> => {
    const { data: rows } = await supabase.from('certificates').select('*').order('created_at', { ascending: false })
    setData((rows ?? []) as Certificate[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { void load() }, [load])

  const openCreate = (): void => { setEditing(null); setForm(DEFAULT); setOpen(true) }
  const openEdit = (row: Certificate): void => {
    setEditing(row)
    setForm({
      name: row.name,
      issuer: row.issuer,
      date: row.date,
      file_url: row.file_url ?? '',
      file_type: (row.file_type as 'image' | 'pdf') ?? 'image',
      thumbnail_url: row.thumbnail_url ?? '',
    })
    setOpen(true)
  }

  const handleFileUpload = async (file: File, tipo: 'file' | 'thumb'): Promise<void> => {
    setUploading(true)
    try {
      if (tipo === 'thumb') {
        // Thumbnails → bucket uploads
        const { url } = await uploadImage(supabase, file, 'certificados/thumbs')
        setForm((f) => ({ ...f, thumbnail_url: url }))
        toast.success('Thumbnail guardado en /uploads')
      } else {
        // Certificado principal: PDF → arcpdf, imagen → uploads
        const { url, type } = await uploadFile(supabase, file, 'certificados')
        setForm((f) => ({ ...f, file_url: url, file_type: type }))
        const bucket = type === 'pdf' ? '/arcpdf' : '/uploads'
        toast.success(`Archivo guardado en ${bucket}`)
      }
    } catch { toast.error('Error al subir archivo') } finally { setUploading(false) }
  }

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    const payload = {
      ...form,
      file_url: form.file_url || null,
      thumbnail_url: form.thumbnail_url || null,
    }
    const result = Schema.safeParse(form)
    if (!result.success) { toast.error(result.error.issues[0]?.message ?? 'Datos inválidos'); return }
    setSaving(true)
    try {
      if (editing) {
        const { error } = await supabase.from('certificates').update(payload).eq('id', editing.id)
        if (error) throw error
        void logAction(supabase, 'update', 'certificates', form.name)
        toast.success('Certificado actualizado')
      } else {
        const { error } = await supabase.from('certificates').insert(payload)
        if (error) throw error
        void logAction(supabase, 'create', 'certificates', form.name)
        toast.success('Certificado agregado')
      }
      setOpen(false); await load()
    } catch { toast.error('Error al guardar') } finally { setSaving(false) }
  }

  const handleDelete = async (id: string): Promise<void> => {
    const { error } = await supabase.from('certificates').delete().eq('id', id)
    if (error) { toast.error('Error'); return }
    void logAction(supabase, 'delete', 'certificates', id)
    toast.success('Eliminado'); await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono-custom text-xs text-[#00E5FF] opacity-60 mb-1">{'// credentials.db'}</p>
          <h1 className="font-mono-custom text-2xl font-black text-[#00E5FF]">Certificados</h1>
        </div>
        <button onClick={openCreate} className="btn-primary">&gt; nuevo_cert()</button>
      </div>

      <div className="glass-card p-6">
        <CrudTable
          data={data} loading={loading} onEdit={openEdit} onDelete={handleDelete}
          columns={[
            { key: 'name', label: 'Nombre', render: (r) => <span className="text-slate-200">{r.name}</span> },
            { key: 'issuer', label: 'Emisor', render: (r) => <span className="text-slate-400">{r.issuer}</span> },
            { key: 'date', label: 'Fecha' },
            { key: 'file_type', label: 'Tipo', render: (r) => <span className="font-mono-custom text-xs text-[#9B5CFF]">{r.file_type ?? '—'}</span> },
            { key: 'file_url', label: 'Archivo', render: (r) => r.file_url ? <span className="text-[#00FF88]">✓</span> : <span className="text-slate-600">✗</span> },
          ]}
        />
      </div>

      <AdminModal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar Certificado' : 'Nuevo Certificado'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="font-mono-custom text-xs text-slate-400 block mb-1">Nombre *</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-field" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Emisor *</label>
              <input value={form.issuer} onChange={(e) => setForm((f) => ({ ...f, issuer: e.target.value }))} className="input-field" required />
            </div>
            <div>
              <label className="font-mono-custom text-xs text-slate-400 block mb-1">Fecha *</label>
              <input value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="input-field" placeholder="Mar 2026" required />
            </div>
          </div>
          <div>
            <label className="font-mono-custom text-xs text-slate-400 block mb-1">Tipo de archivo</label>
            <select value={form.file_type} onChange={(e) => setForm((f) => ({ ...f, file_type: e.target.value as 'image' | 'pdf' }))} className="input-field">
              <option value="image">Imagen</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
          <div>
            <label className="font-mono-custom text-xs text-slate-400 block mb-2">Subir certificado (PDF o imagen)</label>
            <input
              type="file"
              accept=".pdf,image/*"
              disabled={uploading}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFileUpload(f, 'file') }}
              className="input-field text-xs file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[rgba(0,229,255,0.1)] file:text-[#00E5FF] file:font-mono-custom file:text-xs cursor-pointer"
            />
            {form.file_url ? <p className="font-mono-custom text-xs text-[#00FF88] mt-1">✓ archivo cargado</p> : null}
          </div>
          <div>
            <label className="font-mono-custom text-xs text-slate-400 block mb-2">Subir thumbnail (opcional)</label>
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFileUpload(f, 'thumb') }}
              className="input-field text-xs file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[rgba(0,229,255,0.1)] file:text-[#00E5FF] file:font-mono-custom file:text-xs cursor-pointer"
            />
            {form.thumbnail_url ? <p className="font-mono-custom text-xs text-[#00FF88] mt-1">✓ thumbnail cargado</p> : null}
          </div>
          <button type="submit" disabled={saving || uploading} className="btn-primary w-full py-3 disabled:opacity-50">
            {saving ? '> guardando...' : uploading ? '> subiendo...' : '> guardar()'}
          </button>
        </form>
      </AdminModal>
    </div>
  )
}
