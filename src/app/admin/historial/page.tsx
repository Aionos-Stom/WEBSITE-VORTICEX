import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { AuditLog } from '@/lib/audit'

const PAGE_SIZE = 20

const ACTION_META: Record<string, { color: string; icon: string }> = {
  login:      { color: '#00FF88', icon: '→' },
  create:     { color: '#00E5FF', icon: '+' },
  update:     { color: '#F59E0B', icon: '~' },
  delete:     { color: '#FF4444', icon: '×' },
  upload:     { color: '#9B5CFF', icon: '↑' },
  toggle:     { color: '#9B5CFF', icon: '⬡' },
  send_email: { color: '#00E5FF', icon: '✉' },
  trash:      { color: '#FF6B6B', icon: '🗑' },
  restore:    { color: '#00FF88', icon: '↩' },
}

export default async function AdminHistorialPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; action?: string }>
}): Promise<JSX.Element> {
  const params   = await searchParams
  const page     = Math.max(1, parseInt(params.page ?? '1', 10))
  const filter   = params.action ?? 'todos'
  const offset   = (page - 1) * PAGE_SIZE
  const supabase = await createClient()

  // Build query with optional action filter
  let query = supabase
    .from('admin_audit_log')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (filter !== 'todos') {
    query = query.eq('action', filter)
  }

  const { data, count } = await query
  const audits     = (data ?? []) as AuditLog[]
  const total      = count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const formatTime = (iso: string): string =>
    new Date(iso).toLocaleString('es-ES', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    })

  const buildHref = (p: number, a?: string): string => {
    const q = new URLSearchParams()
    q.set('page', String(p))
    if ((a ?? filter) !== 'todos') q.set('action', a ?? filter)
    return `/admin/historial?${q.toString()}`
  }

  const ACTION_FILTERS = ['todos', 'create', 'update', 'delete', 'send_email', 'upload', 'trash', 'restore', 'login']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="font-mono-custom text-xs text-slate-500 opacity-60 mb-1">{'// admin_audit_log'}</p>
        <h1 className="font-mono-custom text-2xl font-black text-slate-100">Historial de Cambios</h1>
        <p className="font-mono-custom text-xs text-slate-500 mt-1">
          {total} registros totales · página {page} de {totalPages} · {PAGE_SIZE} por página
        </p>
      </div>

      {/* Action filters */}
      <div className="flex gap-2 flex-wrap">
        {ACTION_FILTERS.map((a) => {
          const meta = ACTION_META[a]
          return (
            <Link
              key={a}
              href={buildHref(1, a)}
              className="font-mono-custom text-xs px-3 py-1.5 rounded-lg border transition-all"
              style={filter === a ? {
                color: meta?.color ?? '#00E5FF',
                borderColor: `${meta?.color ?? '#00E5FF'}50`,
                background: `${meta?.color ?? '#00E5FF'}10`,
              } : {
                color: '#475569',
                borderColor: 'rgba(255,255,255,0.07)',
              }}
            >
              {meta?.icon ?? '·'} {a}
            </Link>
          )
        })}
      </div>

      {/* Log table */}
      <div className="glass-card overflow-hidden">
        {audits.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-mono-custom text-slate-600">{'> sin registros en esta página'}</p>
          </div>
        ) : (
          <div className="divide-y divide-[rgba(255,255,255,0.03)]">
            {audits.map((entry) => {
              const meta = ACTION_META[entry.action] ?? { color: '#64748B', icon: '·' }
              return (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                >
                  {/* Action badge */}
                  <span
                    className="font-mono-custom text-[0.6rem] font-bold px-2 py-0.5 rounded flex-shrink-0 min-w-[80px] text-center"
                    style={{ color: meta.color, background: `${meta.color}15`, border: `1px solid ${meta.color}30` }}
                  >
                    {meta.icon} {entry.action}
                  </span>

                  {/* Table */}
                  {entry.table_name && (
                    <span className="font-mono-custom text-[0.6rem] text-slate-600 flex-shrink-0 hidden sm:block w-36 truncate">
                      [{entry.table_name}]
                    </span>
                  )}

                  {/* Title */}
                  <span className="font-mono-custom text-xs text-slate-300 flex-1 truncate min-w-0">
                    {entry.record_title ?? '—'}
                  </span>

                  {/* User */}
                  {entry.user_email && (
                    <span className="font-mono-custom text-[0.6rem] text-slate-600 hidden lg:block flex-shrink-0 max-w-[140px] truncate">
                      {entry.user_email}
                    </span>
                  )}

                  {/* Time */}
                  <span className="font-mono-custom text-[0.6rem] text-slate-600 flex-shrink-0 hidden md:block">
                    {formatTime(entry.created_at)}
                  </span>
                  <span className="font-mono-custom text-[0.6rem] text-slate-600 flex-shrink-0 md:hidden">
                    {new Date(entry.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <span className="font-mono-custom text-xs text-slate-600">
          Mostrando {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} de {total}
        </span>

        <div className="flex items-center gap-2">
          {/* First */}
          {page > 2 && (
            <Link href={buildHref(1)} className="font-mono-custom text-xs px-3 py-1.5 rounded border border-[rgba(255,255,255,0.07)] text-slate-500 hover:text-slate-200 transition-colors">
              « primera
            </Link>
          )}

          {/* Prev */}
          {page > 1 ? (
            <Link href={buildHref(page - 1)} className="font-mono-custom text-xs px-3 py-1.5 rounded border border-[rgba(0,229,255,0.2)] text-[#00E5FF] hover:bg-[rgba(0,229,255,0.08)] transition-colors">
              ← anterior
            </Link>
          ) : (
            <span className="font-mono-custom text-xs px-3 py-1.5 rounded border border-[rgba(255,255,255,0.04)] text-slate-700 cursor-not-allowed">
              ← anterior
            </span>
          )}

          {/* Page numbers — show 5 around current */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
            .reduce<(number | '...')[]>((acc, p, idx, arr) => {
              if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...')
              acc.push(p)
              return acc
            }, [])
            .map((p, i) =>
              p === '...' ? (
                <span key={`e-${i}`} className="font-mono-custom text-xs text-slate-700 px-1">…</span>
              ) : (
                <Link
                  key={p}
                  href={buildHref(p as number)}
                  className="font-mono-custom text-xs px-3 py-1.5 rounded border transition-colors"
                  style={p === page ? {
                    color: '#00E5FF', borderColor: 'rgba(0,229,255,0.4)', background: 'rgba(0,229,255,0.1)',
                  } : {
                    color: '#475569', borderColor: 'rgba(255,255,255,0.07)',
                  }}
                >
                  {p}
                </Link>
              )
            )}

          {/* Next */}
          {page < totalPages ? (
            <Link href={buildHref(page + 1)} className="font-mono-custom text-xs px-3 py-1.5 rounded border border-[rgba(0,229,255,0.2)] text-[#00E5FF] hover:bg-[rgba(0,229,255,0.08)] transition-colors">
              siguiente →
            </Link>
          ) : (
            <span className="font-mono-custom text-xs px-3 py-1.5 rounded border border-[rgba(255,255,255,0.04)] text-slate-700 cursor-not-allowed">
              siguiente →
            </span>
          )}

          {/* Last */}
          {page < totalPages - 1 && (
            <Link href={buildHref(totalPages)} className="font-mono-custom text-xs px-3 py-1.5 rounded border border-[rgba(255,255,255,0.07)] text-slate-500 hover:text-slate-200 transition-colors">
              última »
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
