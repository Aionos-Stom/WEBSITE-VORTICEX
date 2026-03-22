'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SectionWrapper } from '@/components/ui/SectionWrapper'
import type { Certificate } from '@/types/database'

interface CertificadosSectionProps {
  certificates: Certificate[]
}

function CertModal({ cert, onClose }: { cert: Certificate; onClose: () => void }): JSX.Element {
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
          className="relative z-10 glass-card p-6 max-w-3xl w-full border border-[rgba(0,229,255,0.3)] max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 font-mono-custom text-slate-400 hover:text-[#FF4444] transition-colors text-lg"
          >
            [X]
          </button>

          <p className="section-label mb-2">CERTIFICADO</p>
          <h3 className="font-mono-custom font-bold text-xl text-[#00E5FF] mb-4">{cert.name}</h3>

          <div className="grid grid-cols-2 gap-3 mb-6 font-mono-custom text-sm">
            {cert.issuer ? (
              <div>
                <span className="text-slate-500">Emisor: </span>
                <span className="text-slate-200">{cert.issuer}</span>
              </div>
            ) : null}
            {cert.date ? (
              <div>
                <span className="text-slate-500">Fecha: </span>
                <span className="text-slate-200">{cert.date}</span>
              </div>
            ) : null}
          </div>

          {/* File viewer */}
          {cert.file_url ? (
            cert.file_type === 'pdf' ? (
              <div className="rounded-xl overflow-hidden border border-[rgba(0,229,255,0.15)]">
                <iframe
                  src={cert.file_url}
                  className="w-full h-96"
                  title={cert.name}
                />
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden border border-[rgba(0,229,255,0.15)]">
                <img src={cert.file_url} alt={cert.name} className="w-full object-contain max-h-96" />
              </div>
            )
          ) : cert.thumbnail_url ? (
            <img src={cert.thumbnail_url} alt={cert.name} className="w-full rounded-xl" />
          ) : null}

          {cert.file_url ? (
            <div className="mt-4 flex gap-3">
              <a
                href={cert.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-sm"
              >
                [abrir_{cert.file_type}]
              </a>
            </div>
          ) : null}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export function CertificadosSection({ certificates }: CertificadosSectionProps): JSX.Element {
  const [selected, setSelected] = useState<Certificate | null>(null)

  return (
    <SectionWrapper
      id="certificados"
      label="// certificates.db"
      title="Certificados"
      titleColor="cyan"
    >
      {certificates.length === 0 ? (
        <div className="text-center text-slate-500 font-mono-custom py-12">
          {'> sin_certificados — agrega desde /admin'}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {certificates.map((cert, i) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4, scale: 1.03 }}
                onClick={() => setSelected(cert)}
                className="glass-card p-4 cursor-pointer group hover:border-[rgba(0,229,255,0.35)] hover:shadow-[0_0_25px_rgba(0,229,255,0.1)] transition-all duration-300"
              >
                {/* Thumbnail */}
                <div className="h-28 mb-3 rounded-lg overflow-hidden border border-[rgba(0,229,255,0.1)] bg-[rgba(0,229,255,0.03)] flex items-center justify-center">
                  {cert.thumbnail_url ?? cert.file_url ? (
                    <img
                      src={cert.thumbnail_url ?? cert.file_url ?? ''}
                      alt={cert.name}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <span className="text-3xl opacity-30">{cert.file_type === 'pdf' ? '📄' : '🏆'}</span>
                  )}
                </div>

                <h3 className="font-mono-custom text-xs font-bold text-slate-200 group-hover:text-[#00E5FF] transition-colors line-clamp-2 mb-1">
                  {cert.name}
                </h3>
                {cert.issuer ? (
                  <p className="font-mono-custom text-xs text-slate-500 truncate">{cert.issuer}</p>
                ) : null}
                {cert.date ? (
                  <p className="font-mono-custom text-xs text-slate-600 mt-0.5">{cert.date}</p>
                ) : null}
                <div className="mt-2 pt-2 border-t border-[rgba(255,255,255,0.05)]">
                  <span className="font-mono-custom text-xs text-[#00E5FF] opacity-0 group-hover:opacity-100 transition-opacity">
                    [ver →]
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
