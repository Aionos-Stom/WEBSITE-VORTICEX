'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'

interface AdminModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function AdminModal({ open, onClose, title, children }: AdminModalProps): JSX.Element {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 glass-card border border-[rgba(0,229,255,0.3)] w-full max-w-2xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between p-6 pb-4 border-b border-[rgba(0,229,255,0.1)] bg-[rgba(13,13,26,0.95)] backdrop-blur-sm z-10">
              <div>
                <p className="font-mono-custom text-xs text-[#00E5FF] opacity-60 mb-0.5">{'// admin_panel'}</p>
                <h2 className="font-mono-custom text-lg font-bold text-[#00E5FF]">{title}</h2>
              </div>
              <button
                onClick={onClose}
                className="font-mono-custom text-slate-400 hover:text-[#FF4444] transition-colors text-lg"
              >
                [X]
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
