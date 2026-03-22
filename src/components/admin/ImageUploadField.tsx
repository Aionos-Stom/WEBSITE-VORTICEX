'use client'

import { useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import { uploadImage } from '@/lib/storage'
import { toast } from 'sonner'
import { ImageCropModal } from './ImageCropModal'

interface ImageUploadFieldProps {
  value: string
  onChange: (url: string) => void
  prefix?: string
  label?: string
}

const ACCEPT = 'image/*,.webp,.avif,.svg,.gif,.png,.jpg,.jpeg,.bmp,.tiff,.ico,.heic,.heif'

export function ImageUploadField({
  value,
  onChange,
  prefix = 'general',
  label = 'Imagen',
}: ImageUploadFieldProps): JSX.Element {
  const [uploading, setUploading]     = useState(false)
  const [cropSrc, setCropSrc]         = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const fileRef                       = useRef<HTMLInputElement>(null)
  const supabase                      = createClient()

  const doUpload = useCallback(async (blob: Blob, name: string): Promise<void> => {
    setUploading(true)
    setCropSrc(null)
    setPendingFile(null)
    try {
      const file   = new File([blob], name, { type: blob.type || 'image/jpeg' })
      const result = await uploadImage(supabase, file, prefix)
      onChange(result.url)
      toast.success('Imagen subida correctamente')
    } catch {
      toast.error('Error al subir la imagen')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }, [supabase, prefix, onChange])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (!file) return

    const isSVG = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')
    const isGIF = file.type === 'image/gif'      || file.name.toLowerCase().endsWith('.gif')

    if (isSVG || isGIF) {
      void doUpload(file, file.name)
      return
    }

    setCropSrc(URL.createObjectURL(file))
    setPendingFile(file)
  }

  const handleConfirm = (blob: Blob, fileName: string): void => {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    void doUpload(blob, fileName)
  }

  const handleSkip = (): void => {
    if (!pendingFile) return
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    void doUpload(pendingFile, pendingFile.name)
  }

  const handleCancel = (): void => {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    setPendingFile(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const cropModal = cropSrc && pendingFile
    ? createPortal(
        <ImageCropModal
          src={cropSrc}
          fileName={pendingFile.name}
          onConfirm={handleConfirm}
          onSkip={handleSkip}
          onCancel={handleCancel}
        />,
        document.body,
      )
    : null

  return (
    <>
      <div>
        <label className="font-mono-custom text-xs text-slate-400 block mb-2">{label}</label>

        {/* Preview */}
        {value ? (
          <div className="mb-2 relative group rounded-lg overflow-hidden border border-[rgba(255,255,255,0.08)]"
            style={{ background: 'rgba(255,255,255,0.02)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="preview"
              className="h-36 w-full object-contain"
            />
            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'rgba(0,0,0,0.6)' }}>
              <button type="button" onClick={() => fileRef.current?.click()}
                className="font-mono-custom text-xs px-3 py-1.5 rounded-lg border border-[rgba(0,229,255,0.4)] text-[#00E5FF] hover:bg-[rgba(0,229,255,0.1)] transition-colors">
                ✎ cambiar
              </button>
              <button type="button" onClick={() => onChange('')}
                className="font-mono-custom text-xs px-3 py-1.5 rounded-lg border border-[rgba(255,68,68,0.4)] text-[#FF4444] hover:bg-[rgba(255,68,68,0.1)] transition-colors">
                × quitar
              </button>
            </div>
          </div>
        ) : null}

        {/* URL + upload */}
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="input-field flex-1 text-sm"
            placeholder="https://... o sube un archivo"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex-shrink-0 font-mono-custom text-xs px-3 py-2 rounded-lg border transition-all disabled:opacity-50 whitespace-nowrap"
            style={{
              borderColor: 'rgba(0,229,255,0.3)',
              color: '#00E5FF',
              background: uploading ? 'rgba(0,229,255,0.1)' : 'transparent',
            }}
          >
            {uploading ? '⟳ subiendo...' : '↑ subir / recortar'}
          </button>
          <input ref={fileRef} type="file" accept={ACCEPT} className="hidden" onChange={handleFile} />
        </div>

        <p className="font-mono-custom text-[0.6rem] text-slate-600 mt-1">
          PNG · JPG · WebP · AVIF · GIF · SVG · HEIC · BMP · TIFF
        </p>
      </div>

      {/* Portal: mounts at document.body — bypasses ANY parent transform/stacking context */}
      {cropModal}
    </>
  )
}
