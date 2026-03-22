/**
 * Storage utility — centraliza todos los uploads
 *
 * Buckets en Supabase:
 *   uploads  → todas las imágenes (logros, proyectos, perfil, thumbnails)
 *   arcpdf   → todos los archivos PDF
 *
 * IMPORTANTE: Crear los buckets en Supabase antes de usar:
 *   Dashboard → Storage → New bucket → "uploads" (public: true)
 *   Dashboard → Storage → New bucket → "arcpdf"  (public: true)
 */

import type { SupabaseClient } from '@supabase/supabase-js'

export const BUCKET_IMAGES = 'uploads'
export const BUCKET_PDF    = 'arcpdf'

export type UploadResult = { url: string; path: string }

function buildPath(prefix: string, file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
  const ts  = Date.now()
  const rnd = Math.random().toString(36).slice(2, 6)
  return `${prefix}/${ts}-${rnd}.${ext}`
}

/** Sube una imagen al bucket "uploads" */
export async function uploadImage(
  supabase: SupabaseClient,
  file: File,
  prefix = 'general',
): Promise<UploadResult> {
  const path = buildPath(prefix, file)
  const { error } = await supabase.storage
    .from(BUCKET_IMAGES)
    .upload(path, file, {
      upsert: true,
      cacheControl: '31536000', // 1 año
      contentType: file.type || 'image/jpeg',
    })
  if (error) throw new Error(`Upload imagen: ${error.message}`)

  const { data } = supabase.storage.from(BUCKET_IMAGES).getPublicUrl(path)
  return { url: data.publicUrl, path }
}

/** Sube un PDF al bucket "arcpdf" */
export async function uploadPDF(
  supabase: SupabaseClient,
  file: File,
  prefix = 'general',
): Promise<UploadResult> {
  const path = buildPath(prefix, file)
  const { error } = await supabase.storage
    .from(BUCKET_PDF)
    .upload(path, file, {
      upsert: true,
      cacheControl: '31536000',
      contentType: 'application/pdf',
    })
  if (error) throw new Error(`Upload PDF: ${error.message}`)

  const { data } = supabase.storage.from(BUCKET_PDF).getPublicUrl(path)
  return { url: data.publicUrl, path }
}

/** Detecta si el archivo es PDF y lo sube al bucket correcto */
export async function uploadFile(
  supabase: SupabaseClient,
  file: File,
  prefix = 'general',
): Promise<UploadResult & { type: 'image' | 'pdf' }> {
  const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  if (isPDF) {
    const result = await uploadPDF(supabase, file, prefix)
    return { ...result, type: 'pdf' }
  }
  const result = await uploadImage(supabase, file, prefix)
  return { ...result, type: 'image' }
}
