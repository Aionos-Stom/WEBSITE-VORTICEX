'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SectionWrapper } from '@/components/ui/SectionWrapper'
import type { Gallery } from '@/types/database'
import { GALLERY_CATEGORIES } from '@/types/database'

interface GaleriaSectionProps {
  items: Gallery[]
}

function GalleryModal({ item, onClose }: { item: Gallery; onClose: () => void }): JSX.Element {
  const tools = item.tools?.split(',').map((t) => t.trim()).filter(Boolean) ?? []

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/92 backdrop-blur-xl" />
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 24 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          className="relative z-10 w-full max-w-6xl max-h-[95vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute -top-10 right-0 font-mono-custom text-slate-400 hover:text-white transition-colors text-sm z-20 flex items-center gap-2"
          >
            [ESC] cerrar
          </button>

          <div
            className="glass-card overflow-hidden border border-[rgba(155,92,255,0.3)] flex flex-col"
            style={{ boxShadow: '0 0 100px rgba(155,92,255,0.2), 0 0 40px rgba(0,229,255,0.08)' }}
          >
            {/* Full quality image — no fixed height, uses object-contain */}
            {item.image_url ? (
              <div className="relative bg-[rgba(5,5,15,0.95)] flex items-center justify-center overflow-hidden"
                style={{ maxHeight: '72vh' }}>
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-contain"
                  style={{
                    maxHeight: '72vh',
                    imageRendering: 'auto',
                    WebkitBackfaceVisibility: 'hidden' as const,
                  }}
                  draggable={false}
                />
                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {item.category ? (
                    <span className="tag-purple">{item.category}</span>
                  ) : null}
                  {item.featured ? (
                    <span className="font-mono-custom text-xs text-[#F59E0B] bg-[rgba(245,158,11,0.15)] border border-[rgba(245,158,11,0.35)] px-2 py-0.5 rounded-md">
                      ★ destacado
                    </span>
                  ) : null}
                </div>
                {/* Open full size link */}
                <a
                  href={item.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-4 right-4 font-mono-custom text-[0.65rem] text-slate-400 hover:text-[#00E5FF] transition-colors bg-black/60 px-2 py-1 rounded"
                >
                  ↗ ver_original
                </a>
              </div>
            ) : (
              <div className="h-40 bg-gradient-to-br from-[rgba(155,92,255,0.1)] to-[rgba(0,229,255,0.05)] flex items-center justify-center">
                <span className="text-5xl">🎨</span>
              </div>
            )}

            {/* Info bar */}
            <div className="p-5 border-t border-[rgba(155,92,255,0.12)] flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-mono-custom font-bold text-lg text-[#9B5CFF] mb-1">{item.title}</h3>
                {item.description ? (
                  <p className="font-mono-custom text-sm text-slate-400 leading-relaxed">{item.description}</p>
                ) : null}
                {tools.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-3 items-center">
                    <span className="font-mono-custom text-xs text-slate-600">tools:</span>
                    {tools.map((tool) => (
                      <span key={tool} className="tag-cyan text-[0.65rem]">{tool}</span>
                    ))}
                  </div>
                ) : null}
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 font-mono-custom text-slate-500 hover:text-[#FF4444] transition-colors text-lg"
              >
                [×]
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function GalleryCard({ item, index }: { item: Gallery; index: number }): JSX.Element {
  const tools = item.tools?.split(',').map((t) => t.trim()).filter(Boolean) ?? []

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07, duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="glass-card overflow-hidden group border border-[rgba(155,92,255,0.12)] hover:border-[rgba(155,92,255,0.35)] transition-all duration-300 cursor-pointer"
      style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.4)' }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: item.featured ? 220 : 160 }}>
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[rgba(155,92,255,0.08)] to-[rgba(0,229,255,0.04)] flex items-center justify-center">
            <span className="text-3xl">🎨</span>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,20,0.8)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Category */}
        {item.category ? (
          <span className="absolute top-3 left-3 tag-purple opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {item.category}
          </span>
        ) : null}
        {item.featured ? (
          <div className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-[rgba(245,158,11,0.2)] border border-[rgba(245,158,11,0.4)]">
            <span className="text-[#F59E0B] text-xs">★</span>
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <div className="p-4">
        <h3 className="font-mono-custom font-bold text-sm text-slate-200 group-hover:text-[#9B5CFF] transition-colors mb-1 line-clamp-1">
          {item.title}
        </h3>
        {tools.length > 0 ? (
          <div className="flex flex-wrap gap-1 mt-2">
            {tools.slice(0, 3).map((tool) => (
              <span key={tool} className="font-mono-custom text-[0.6rem] text-slate-600 bg-[rgba(255,255,255,0.03)] px-1.5 py-0.5 rounded">
                {tool}
              </span>
            ))}
            {tools.length > 3 ? (
              <span className="font-mono-custom text-[0.6rem] text-slate-600">+{tools.length - 3}</span>
            ) : null}
          </div>
        ) : null}
        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="font-mono-custom text-[0.65rem] text-[#9B5CFF]">[ver_trabajo →]</span>
        </div>
      </div>
    </motion.div>
  )
}

export function GaleriaSection({ items }: GaleriaSectionProps): JSX.Element {
  const [selected, setSelected] = useState<Gallery | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('Todos')

  const categories = ['Todos', ...GALLERY_CATEGORIES.filter((c) =>
    items.some((i) => i.category === c)
  )]

  const filtered = activeCategory === 'Todos'
    ? items
    : items.filter((i) => i.category === activeCategory)

  const featured = filtered.filter((i) => i.featured)
  const rest = filtered.filter((i) => !i.featured)

  return (
    <SectionWrapper id="galeria" label="// creative_work.psd" title="Galería Creativa" titleColor="purple">
      {items.length === 0 ? (
        <div className="text-center text-slate-500 font-mono-custom py-12">
          {'> galeria_vacia — sube tus trabajos desde /admin'}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Category filter */}
          {categories.length > 2 ? (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="font-mono-custom text-xs px-3 py-1.5 rounded-lg border transition-all duration-200"
                  style={activeCategory === cat ? {
                    color: '#9B5CFF',
                    borderColor: 'rgba(155,92,255,0.5)',
                    background: 'rgba(155,92,255,0.1)',
                    boxShadow: '0 0 15px rgba(155,92,255,0.15)',
                  } : {
                    color: '#64748B',
                    borderColor: 'rgba(255,255,255,0.06)',
                    background: 'transparent',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          ) : null}

          {/* Featured row */}
          {featured.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featured.map((item, i) => (
                <div key={item.id} onClick={() => setSelected(item)}>
                  <GalleryCard item={item} index={i} />
                </div>
              ))}
            </div>
          ) : null}

          {/* Regular grid */}
          {rest.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {rest.map((item, i) => (
                <div key={item.id} onClick={() => setSelected(item)}>
                  <GalleryCard item={item} index={i} />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {selected ? <GalleryModal item={selected} onClose={() => setSelected(null)} /> : null}
    </SectionWrapper>
  )
}
