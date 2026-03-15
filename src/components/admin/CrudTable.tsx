'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Column<T> {
  key: keyof T | string
  label: string
  render?: (row: T) => React.ReactNode
}

interface CrudTableProps<T extends { id: string }> {
  data: T[]
  columns: Column<T>[]
  onEdit: (row: T) => void
  onDelete: (id: string) => Promise<void>
  loading?: boolean
}

export function CrudTable<T extends { id: string }>({
  data,
  columns,
  onEdit,
  onDelete,
  loading = false,
}: CrudTableProps<T>): JSX.Element {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm('¿Confirmar eliminación? Esta acción no se puede deshacer.')) return
    setDeletingId(id)
    await onDelete(id)
    setDeletingId(null)
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 glass-card animate-pulse" />
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <p className="font-mono-custom text-slate-500">{'> tabla_vacia — agrega el primer registro'}</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[rgba(0,229,255,0.1)]">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-4 py-3 text-left font-mono-custom text-xs text-[#00E5FF] uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
            <th className="px-4 py-3 text-right font-mono-custom text-xs text-slate-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {data.map((row, i) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: i * 0.03 }}
                className={cn(
                  'border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(0,229,255,0.03)] transition-colors',
                  deletingId === row.id && 'opacity-50'
                )}
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3 font-mono-custom text-xs text-slate-300">
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[String(col.key)] ?? '')}
                  </td>
                ))}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(row)}
                      className="font-mono-custom text-xs text-[#00E5FF] hover:underline transition-colors px-2 py-1 rounded hover:bg-[rgba(0,229,255,0.1)]"
                    >
                      [editar]
                    </button>
                    <button
                      onClick={() => handleDelete(row.id)}
                      disabled={deletingId === row.id}
                      className="font-mono-custom text-xs text-[#FF4444] hover:underline transition-colors px-2 py-1 rounded hover:bg-[rgba(239,68,68,0.1)] disabled:opacity-50"
                    >
                      {deletingId === row.id ? '[...]' : '[eliminar]'}
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  )
}
