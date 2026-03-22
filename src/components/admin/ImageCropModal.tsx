'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

interface ImageCropModalProps {
  src: string
  fileName: string
  onConfirm: (blob: Blob, fileName: string) => void
  onSkip: () => void
  onCancel: () => void
}

const ASPECTS = [
  { label: 'Libre', value: undefined },
  { label: '1:1',  value: 1 },
  { label: '4:3',  value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: '3:4',  value: 3 / 4 },
  { label: '9:16', value: 9 / 16 },
]

const TOP_H    = 48   // px — top bar
const BOTTOM_H = 116  // px — bottom controls bar
const IMG_H    = `calc(100vh - ${TOP_H}px - ${BOTTOM_H}px)`

function initCrop(w: number, h: number, asp?: number): Crop {
  if (asp) return centerCrop(makeAspectCrop({ unit: '%', width: 90 }, asp, w, h), w, h)
  return { unit: '%', x: 5, y: 5, width: 90, height: 90 }
}

async function cropToBlob(img: HTMLImageElement, crop: PixelCrop, quality: number, fileName: string): Promise<Blob> {
  const sx = img.naturalWidth  / img.width
  const sy = img.naturalHeight / img.height
  const canvas = document.createElement('canvas')
  canvas.width  = Math.round(crop.width  * sx)
  canvas.height = Math.round(crop.height * sy)
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, crop.x * sx, crop.y * sy, crop.width * sx, crop.height * sy, 0, 0, canvas.width, canvas.height)
  const mime = fileName.toLowerCase().endsWith('.png') ? 'image/png'
             : fileName.toLowerCase().endsWith('.webp') ? 'image/webp'
             : 'image/jpeg'
  return new Promise((res, rej) => canvas.toBlob((b) => b ? res(b) : rej(new Error('canvas empty')), mime, quality / 100))
}

export function ImageCropModal({ src, fileName, onConfirm, onSkip, onCancel }: ImageCropModalProps): JSX.Element {
  const imgRef = useRef<HTMLImageElement>(null)
  const [crop, setCrop]           = useState<Crop>()
  const [completed, setCompleted] = useState<PixelCrop>()
  const [aspect, setAspect]       = useState<number | undefined>(undefined)
  const [quality, setQuality]     = useState(100)
  const [processing, setProc]     = useState(false)
  const [nat, setNat]             = useState({ w: 0, h: 0 })
  const [out, setOut]             = useState({ w: 0, h: 0 })

  useEffect(() => {
    const fn = (e: KeyboardEvent): void => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onCancel])

  const onLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>): void => {
    const { naturalWidth: nw, naturalHeight: nh, width: w, height: h } = e.currentTarget
    setNat({ w: nw, h: nh })
    setOut({ w: nw, h: nh })
    setCrop(initCrop(w, h, aspect))
  }, [aspect])

  const onComplete = (c: PixelCrop): void => {
    setCompleted(c)
    if (!imgRef.current) return
    const sx = imgRef.current.naturalWidth  / imgRef.current.width
    const sy = imgRef.current.naturalHeight / imgRef.current.height
    setOut({ w: Math.round(c.width * sx), h: Math.round(c.height * sy) })
  }

  const changeAspect = (val: number | undefined): void => {
    setAspect(val)
    if (!imgRef.current) return
    setCrop(initCrop(imgRef.current.width, imgRef.current.height, val))
  }

  const confirm = async (): Promise<void> => {
    if (!imgRef.current || !completed) { onSkip(); return }
    setProc(true)
    try { onConfirm(await cropToBlob(imgRef.current, completed, quality, fileName), fileName) }
    catch { onSkip() }
    finally { setProc(false) }
  }

  return (
    /* Full viewport overlay */
    <div
      className="image-crop-modal fixed inset-0 z-[9999] flex flex-col"
      style={{ height: '100vh', background: '#03030a' }}
    >
      {/* ── TOP BAR ── */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-5 border-b border-[rgba(0,229,255,0.1)]"
        style={{ height: TOP_H, minHeight: TOP_H }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-mono-custom text-xs text-[#00E5FF] opacity-70 flex-shrink-0">// image_editor</span>
          <span className="font-mono-custom text-xs text-slate-500 truncate">{fileName}</span>
        </div>
        <button
          onClick={onCancel}
          className="flex-shrink-0 font-mono-custom text-xs text-slate-500 hover:text-[#FF4444] transition-colors ml-4"
        >
          [ESC] cancelar
        </button>
      </div>

      {/* ── IMAGE / CROP AREA — fills all remaining height ── */}
      <div
        className="flex-shrink-0 flex items-center justify-center overflow-auto"
        style={{ height: IMG_H, background: '#07070f' }}
      >
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={onComplete}
          aspect={aspect}
          minWidth={20}
          minHeight={20}
          keepSelection
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={src}
            alt="recortar"
            onLoad={onLoad}
            style={{
              /* Force image to fill the available height while keeping aspect ratio */
              height: IMG_H,
              width: 'auto',
              maxWidth: '100vw',
              objectFit: 'contain',
              display: 'block',
              userSelect: 'none',
            }}
            draggable={false}
          />
        </ReactCrop>
      </div>

      {/* ── BOTTOM CONTROLS ── */}
      <div
        className="flex-shrink-0 border-t border-[rgba(0,229,255,0.1)] px-5 flex flex-col justify-center gap-2"
        style={{ height: BOTTOM_H, minHeight: BOTTOM_H, background: '#050510' }}
      >
        {/* Row 1: aspect + quality + info */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          {/* Aspect */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono-custom text-[0.62rem] text-slate-600">proporción:</span>
            {ASPECTS.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={() => changeAspect(a.value)}
                className="font-mono-custom text-xs px-2 py-0.5 rounded border transition-all duration-150"
                style={aspect === a.value ? {
                  color: '#00E5FF', borderColor: 'rgba(0,229,255,0.5)', background: 'rgba(0,229,255,0.12)',
                } : {
                  color: '#475569', borderColor: 'rgba(255,255,255,0.07)',
                }}
              >
                {a.label}
              </button>
            ))}
          </div>

          {/* Quality */}
          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
            <span className="font-mono-custom text-[0.62rem] text-slate-600 whitespace-nowrap">calidad:</span>
            <input
              type="range" min={60} max={100} step={5} value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="flex-1 accent-[#00E5FF]"
              style={{ height: 4 }}
            />
            <span className="font-mono-custom text-xs text-[#00FF88] font-bold w-9 text-right">{quality}%</span>
          </div>

          {/* Dimensions */}
          <span className="font-mono-custom text-[0.58rem] text-slate-600 whitespace-nowrap">
            salida: <span className="text-slate-400">{out.w}×{out.h}px</span>
            <span className="ml-2 opacity-50">orig: {nat.w}×{nat.h}px</span>
          </span>
        </div>

        {/* Row 2: action buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void confirm()}
            disabled={processing}
            className="flex-1 font-mono-custom text-sm font-bold py-2 rounded-lg border transition-all disabled:opacity-50"
            style={{
              color: '#00E5FF',
              borderColor: 'rgba(0,229,255,0.4)',
              background: 'rgba(0,229,255,0.08)',
            }}
          >
            {processing ? '⟳ procesando...' : '✓ aplicar recorte y subir'}
          </button>
          <button
            type="button"
            onClick={onSkip}
            disabled={processing}
            className="font-mono-custom text-xs py-2 px-4 rounded-lg border transition-all disabled:opacity-50"
            style={{ color: '#475569', borderColor: 'rgba(255,255,255,0.07)' }}
          >
            subir sin recortar
          </button>
        </div>
      </div>
    </div>
  )
}
