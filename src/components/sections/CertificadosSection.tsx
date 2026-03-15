'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SectionWrapper } from '@/components/ui/SectionWrapper'
import type { Certificado } from '@/types/database'
import { formatDate } from '@/lib/utils'

interface CertificadosSectionProps {
  certificados: Certificado[]
}

function CertModal({ cert, onClose }: { cert: Certificado; onClose: () => void }): JSX.Element {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative z-10 glass-card p-6 max-w-2xl w-full border border-[rgba(0,229,255,0.3)]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 font-mono-custom text-slate-400 hover:text-[#00E5FF] transition-colors"
          >
            [X]
          </button>

          <p className="section-label mb-2">CERTIFICADO</p>
          <h3 className="font-mono-custom font-bold text-xl text-[#00E5FF] mb-4">{cert.titulo}</h3>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm font-mono-custom">
            <div>
              <span className="text-slate-500">Emisor:</span>
              <span className="text-slate-200 ml-2">{cert.emisor}</span>
            </div>
            <div>
              <span className="text-slate-500">Fecha:</span>
              <span className="text-slate-200 ml-2">{formatDate(cert.fecha_emision)}</span>
            </div>
            {cert.fecha_expiracion ? (
              <div>
                <span className="text-slate-500">Expira:</span>
                <span className="text-slate-200 ml-2">{formatDate(cert.fecha_expiracion)}</span>
              </div>
            ) : null}
            {cert.credencial_id ? (
              <div>
                <span className="text-slate-500">ID:</span>
                <span className="text-[#00E5FF] ml-2">{cert.credencial_id}</span>
              </div>
            ) : null}
          </div>

          {cert.pdf_url ? (
            <div className="mt-4">
              <p className="font-mono-custom text-xs text-slate-500 mb-2">{'// preview'}</p>
              <iframe
                src={cert.pdf_url}
                className="w-full h-96 rounded-lg border border-[rgba(0,229,255,0.2)]"
                title={cert.titulo}
              />
            </div>
          ) : cert.imagen_url ? (
            <img src={cert.imagen_url} alt={cert.titulo} className="w-full rounded-lg" />
          ) : null}

          <div className="flex gap-3 mt-6">
            {cert.credencial_url ? (
              <a
                href={cert.credencial_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-sm"
              >
                [verificar_credencial]
              </a>
            ) : null}
            {cert.pdf_url ? (
              <a
                href={cert.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-sm"
                style={{ borderColor: 'rgba(0,255,136,0.4)', color: '#00FF88' }}
              >
                [descargar_pdf]
              </a>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export function CertificadosSection({ certificados }: CertificadosSectionProps): JSX.Element {
  const [selected, setSelected] = useState<Certificado | null>(null)
  const categorias = ['Todas', ...Array.from(new Set(certificados.map((c) => c.categoria)))]
  const [filter, setFilter] = useState('Todas')

  const filtered = filter === 'Todas' ? certificados : certificados.filter((c) => c.categoria === filter)

  return (
    <SectionWrapper
      id="certificados"
      label="// credentials.db"
      title="Certificados"
      titleColor="cyan"
    >
      {certificados.length === 0 ? (
        <div className="text-center text-slate-500 font-mono-custom py-12">
          {'> certificados_no_cargados — agrega desde /admin'}
        </div>
      ) : (
        <>
          {/* Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className="font-mono-custom text-xs px-3 py-1.5 rounded border transition-all duration-200"
                style={
                  filter === cat
                    ? { background: 'rgba(0,229,255,0.1)', borderColor: '#00E5FF', color: '#00E5FF' }
                    : { borderColor: 'rgba(255,255,255,0.1)', color: '#64748B' }
                }
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((cert, i) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(cert)}
                className="glass-card p-5 cursor-pointer group hover:border-[rgba(0,229,255,0.35)] hover:shadow-[0_0_25px_rgba(0,229,255,0.1)] transition-all duration-300"
              >
                {/* Icon/Image */}
                {cert.imagen_url ? (
                  <div className="h-32 mb-4 rounded-lg overflow-hidden">
                    <img
                      src={cert.imagen_url}
                      alt={cert.titulo}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                ) : (
                  <div className="h-12 w-12 mb-4 rounded-lg bg-[rgba(0,229,255,0.1)] border border-[rgba(0,229,255,0.2)] flex items-center justify-center">
                    <span className="font-mono-custom text-lg text-[#00E5FF]">🏆</span>
                  </div>
                )}

                <span className="font-mono-custom text-xs text-[#9B5CFF] bg-[rgba(155,92,255,0.1)] px-2 py-0.5 rounded">
                  {cert.categoria}
                </span>

                <h3 className="font-mono-custom font-bold text-sm text-slate-200 mt-2 mb-1 group-hover:text-[#00E5FF] transition-colors line-clamp-2">
                  {cert.titulo}
                </h3>
                <p className="font-mono-custom text-xs text-slate-500">{cert.emisor}</p>
                <p className="font-mono-custom text-xs text-slate-600 mt-1">{formatDate(cert.fecha_emision)}</p>

                <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.05)]">
                  <span className="font-mono-custom text-xs text-[#00E5FF] group-hover:underline">
                    [ver_detalle →]
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {selected ? <CertModal cert={selected} onClose={() => setSelected(null)} /> : null}
        </>
      )}
    </SectionWrapper>
  )
}
