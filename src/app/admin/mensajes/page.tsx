'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, Send, X, Clock, CheckCircle, Eye, Zap,
  Trash2, RotateCcw, AlertTriangle,
} from 'lucide-react'
import type { ContactMessage } from '@/types/database'

// ── Status meta (no incluye 'eliminado' en las tabs normales) ──────
const FALLBACK_META = { label: 'Leído', color: '#00E5FF', icon: Eye as React.ElementType }

const STATUS_META: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  nuevo:      { label: 'Nuevo',      color: '#F59E0B', icon: Mail },
  leido:      { label: 'Leído',      color: '#00E5FF', icon: Eye },
  respondido: { label: 'Respondido', color: '#00FF88', icon: CheckCircle },
  eliminado:  { label: 'Eliminado',  color: '#FF4444', icon: Trash2 },
}

const getMeta = (status: string) => STATUS_META[status] ?? FALLBACK_META

interface ReplyState { message: ContactMessage; subject: string; body: string }
type InboxFilter = 'todos' | 'nuevo' | 'leido' | 'respondido'
type TabView    = 'inbox' | 'trash'

const DEFAULT_SUBJECT = (_name: string) => `Re: Tu mensaje — mellamobrau portfolio`
const DEFAULT_BODY    = (name: string)  => `Hola ${name},\n\nGracias por ponerte en contacto.\n\n`

export default function AdminMensajesPage(): JSX.Element {
  const [messages,    setMessages]    = useState<ContactMessage[]>([])
  const [loading,     setLoading]     = useState(true)
  const [tab,         setTab]         = useState<TabView>('inbox')
  const [filter,      setFilter]      = useState<InboxFilter>('todos')
  const [selected,    setSelected]    = useState<ContactMessage | null>(null)
  const [checkedIds,  setCheckedIds]  = useState<Set<string>>(new Set())
  const [reply,       setReply]       = useState<ReplyState | null>(null)
  const [sending,     setSending]     = useState(false)
  const [operating,   setOperating]   = useState(false)
  const [testingSmtp, setTestingSmtp] = useState(false)
  const [confirmPerm, setConfirmPerm] = useState<string[] | null>(null) // ids to permanently delete
  const fetchedRef = useRef(false)
  const supabase   = createClient()

  // ── Load ────────────────────────────────────────────────────────
  const load = useCallback(async (): Promise<void> => {
    const { data } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
    setMessages((data ?? []) as ContactMessage[])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    void load()
  }, [load])

  // Clear selection on tab change
  useEffect(() => { setCheckedIds(new Set()); setSelected(null) }, [tab])

  // ── Derived lists ────────────────────────────────────────────────
  const inbox   = messages.filter((m) => m.status !== 'eliminado')
  const trash   = messages.filter((m) => m.status === 'eliminado')
  const visible = tab === 'trash'
    ? trash
    : (filter === 'todos' ? inbox : inbox.filter((m) => m.status === filter))

  const inboxCounts = {
    todos:      inbox.length,
    nuevo:      inbox.filter((m) => m.status === 'nuevo').length,
    leido:      inbox.filter((m) => m.status === 'leido').length,
    respondido: inbox.filter((m) => m.status === 'respondido').length,
  }

  // ── Selection helpers ─────────────────────────────────────────────
  const toggleCheck = (id: string): void => {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  const allChecked   = visible.length > 0 && visible.every((m) => checkedIds.has(m.id))
  const toggleAll    = (): void => {
    if (allChecked) { setCheckedIds(new Set()) }
    else { setCheckedIds(new Set(visible.map((m) => m.id))) }
  }

  // ── Mark read on open ────────────────────────────────────────────
  const openMessage = async (msg: ContactMessage): Promise<void> => {
    setSelected(msg)
    if (msg.status === 'nuevo') {
      await supabase.from('contact_messages').update({ status: 'leido' }).eq('id', msg.id)
      setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, status: 'leido' } : m))
    }
  }

  // ── Move to trash (soft delete) ──────────────────────────────────
  const moveToTrash = async (ids: string[]): Promise<void> => {
    if (!ids.length) return
    setOperating(true)
    const { error } = await supabase
      .from('contact_messages')
      .update({ status: 'eliminado' })
      .in('id', ids)
    if (error) { toast.error('Error al mover a eliminados'); setOperating(false); return }
    setMessages((prev) => prev.map((m) => ids.includes(m.id) ? { ...m, status: 'eliminado' } : m))
    if (selected && ids.includes(selected.id)) setSelected(null)
    setCheckedIds(new Set())
    toast.success(`${ids.length > 1 ? `${ids.length} mensajes movidos` : 'Mensaje movido'} a eliminados`)
    setOperating(false)
  }

  // ── Restore from trash ───────────────────────────────────────────
  const restoreFromTrash = async (ids: string[]): Promise<void> => {
    if (!ids.length) return
    setOperating(true)
    const { error } = await supabase
      .from('contact_messages')
      .update({ status: 'leido' })
      .in('id', ids)
    if (error) { toast.error('Error al restaurar'); setOperating(false); return }
    setMessages((prev) => prev.map((m) => ids.includes(m.id) ? { ...m, status: 'leido' } : m))
    if (selected && ids.includes(selected.id)) setSelected(null)
    setCheckedIds(new Set())
    toast.success(`${ids.length > 1 ? `${ids.length} mensajes restaurados` : 'Mensaje restaurado'}`)
    setOperating(false)
  }

  // ── Permanent delete (only from trash) ──────────────────────────
  const permanentDelete = async (ids: string[]): Promise<void> => {
    if (!ids.length) return
    setOperating(true)
    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .in('id', ids)
    if (error) { toast.error('Error al eliminar'); setOperating(false); return }
    setMessages((prev) => prev.filter((m) => !ids.includes(m.id)))
    if (selected && ids.includes(selected.id)) setSelected(null)
    setCheckedIds(new Set())
    setConfirmPerm(null)
    toast.success(`${ids.length > 1 ? `${ids.length} mensajes eliminados` : 'Mensaje eliminado'} permanentemente`)
    setOperating(false)
  }

  // ── Send reply ───────────────────────────────────────────────────
  const handleSendReply = async (): Promise<void> => {
    if (!reply || !reply.body.trim()) return
    setSending(true)
    try {
      const res = await fetch('/api/send-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: reply.message.id,
          to_email:   reply.message.email,
          to_name:    reply.message.name,
          subject:    reply.subject,
          body:       reply.body,
        }),
      })
      const data = await res.json().catch(() => ({})) as { ok?: boolean; error?: string; hint?: string }
      if (!res.ok) {
        toast.error(data.hint ?? data.error ?? 'Error desconocido al enviar', { duration: 8000 })
        return
      }
      toast.success(`✓ Respuesta enviada a ${reply.message.email}`)
      setMessages((prev) => prev.map((m) =>
        m.id === reply.message.id
          ? { ...m, status: 'respondido', replied_at: new Date().toISOString() }
          : m,
      ))
      if (selected?.id === reply.message.id)
        setSelected((s) => s ? { ...s, status: 'respondido', replied_at: new Date().toISOString() } : s)
      setReply(null)
    } catch (err) {
      console.error('[mensajes] fetch error:', err)
      toast.error('Error de red al contactar el servidor')
    } finally { setSending(false) }
  }

  // ── Test SMTP ────────────────────────────────────────────────────
  const handleTestSmtp = async (): Promise<void> => {
    setTestingSmtp(true)
    try {
      const res  = await fetch('/api/test-smtp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      const data = await res.json() as { status?: string; messageId?: string; to?: string; error?: string; smtpResponse?: string }
      if (data.status === 'SENT') toast.success(`✅ Email de prueba enviado → ${data.to}`, { duration: 8000 })
      else toast.error(`❌ SMTP: ${data.error ?? data.smtpResponse ?? 'error desconocido'}`, { duration: 8000 })
    } catch { toast.error('Error de red') } finally { setTestingSmtp(false) }
  }

  const formatDate = (iso: string): string =>
    new Date(iso).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="font-mono-custom text-xs text-[#F59E0B] opacity-60 mb-1">{'// contact_messages'}</p>
          <h1 className="font-mono-custom text-2xl font-black text-[#F59E0B]">Mensajes</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => void handleTestSmtp()} disabled={testingSmtp}
            className="font-mono-custom text-xs flex items-center gap-1.5 px-3 py-1.5 border rounded transition-colors disabled:opacity-50"
            style={{ color: '#F59E0B', borderColor: 'rgba(245,158,11,0.3)' }}>
            <Zap size={11} />{testingSmtp ? 'enviando...' : 'test SMTP'}
          </button>
          <button onClick={() => { fetchedRef.current = false; setLoading(true); void load() }}
            className="font-mono-custom text-xs text-slate-500 hover:text-[#00E5FF] px-3 py-1.5 border border-[rgba(255,255,255,0.06)] rounded transition-colors">
            ↻ actualizar
          </button>
        </div>
      </div>

      {/* Tab: Bandeja | Eliminados */}
      <div className="flex gap-1 p-1 rounded-xl border border-[rgba(255,255,255,0.06)] bg-black/30 w-fit">
        {([['inbox', `Bandeja (${inbox.length})`, '#F59E0B'], ['trash', `Eliminados (${trash.length})`, '#FF4444']] as const).map(([t, label, color]) => (
          <button key={t} onClick={() => setTab(t)}
            className="font-mono-custom text-xs px-4 py-1.5 rounded-lg transition-all"
            style={tab === t
              ? { color, background: `${color}15`, border: `1px solid ${color}30` }
              : { color: '#475569' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Inbox filters */}
      {tab === 'inbox' && (
        <div className="flex gap-2 flex-wrap">
          {(['todos', 'nuevo', 'leido', 'respondido'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="font-mono-custom text-xs px-3 py-1.5 rounded-lg border transition-all"
              style={filter === f
                ? { color: '#F59E0B', borderColor: 'rgba(245,158,11,0.5)', background: 'rgba(245,158,11,0.1)' }
                : { color: '#475569', borderColor: 'rgba(255,255,255,0.07)' }}>
              {f} ({inboxCounts[f]})
            </button>
          ))}
        </div>
      )}

      {/* Bulk action bar */}
      <AnimatePresence>
        {checkedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 p-3 rounded-xl border flex-wrap"
            style={{ borderColor: 'rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.04)' }}
          >
            <span className="font-mono-custom text-xs text-[#F59E0B]">{checkedIds.size} seleccionado{checkedIds.size > 1 ? 's' : ''}</span>
            <div className="flex gap-2 ml-auto flex-wrap">
              {tab === 'inbox' && (
                <button onClick={() => void moveToTrash(Array.from(checkedIds))} disabled={operating}
                  className="font-mono-custom text-xs flex items-center gap-1.5 px-3 py-1.5 rounded border transition-colors disabled:opacity-50"
                  style={{ color: '#FF4444', borderColor: 'rgba(255,68,68,0.3)' }}>
                  <Trash2 size={11} /> Mover a eliminados ({checkedIds.size})
                </button>
              )}
              {tab === 'trash' && (
                <>
                  <button onClick={() => void restoreFromTrash(Array.from(checkedIds))} disabled={operating}
                    className="font-mono-custom text-xs flex items-center gap-1.5 px-3 py-1.5 rounded border transition-colors disabled:opacity-50"
                    style={{ color: '#00FF88', borderColor: 'rgba(0,255,136,0.3)' }}>
                    <RotateCcw size={11} /> Restaurar ({checkedIds.size})
                  </button>
                  <button onClick={() => setConfirmPerm(Array.from(checkedIds))} disabled={operating}
                    className="font-mono-custom text-xs flex items-center gap-1.5 px-3 py-1.5 rounded border transition-colors disabled:opacity-50"
                    style={{ color: '#FF4444', borderColor: 'rgba(255,68,68,0.4)', background: 'rgba(255,68,68,0.06)' }}>
                    <AlertTriangle size={11} /> Eliminar permanentemente ({checkedIds.size})
                  </button>
                </>
              )}
              <button onClick={() => setCheckedIds(new Set())}
                className="font-mono-custom text-xs text-slate-500 hover:text-slate-300 px-2 transition-colors">
                cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* List */}
        <div className="space-y-1">
          {loading ? (
            <div className="h-32 flex items-center justify-center">
              <span className="font-mono-custom text-slate-500 animate-pulse">{'> cargando...'}</span>
            </div>
          ) : visible.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <p className="font-mono-custom text-slate-500">
                {tab === 'trash' ? '> bandeja de eliminados vacía' : '> sin mensajes'}
              </p>
            </div>
          ) : (
            <>
              {/* Select all row */}
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-[rgba(255,255,255,0.04)]">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  className="w-3.5 h-3.5 accent-[#F59E0B] cursor-pointer"
                />
                <span className="font-mono-custom text-[0.6rem] text-slate-600">
                  {allChecked ? 'Deseleccionar todo' : `Seleccionar todo (${visible.length})`}
                </span>
              </div>

              {visible.map((msg, i) => {
                const meta = getMeta(msg.status)
                const Icon = meta.icon
                const isChecked = checkedIds.has(msg.id)
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-start gap-2 glass-card p-3 border transition-all"
                    style={{
                      borderLeftWidth: 3,
                      borderLeftColor: meta.color,
                      background: selected?.id === msg.id ? `${meta.color}06` : undefined,
                    }}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCheck(msg.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-3.5 h-3.5 accent-[#F59E0B] cursor-pointer flex-shrink-0 mt-1"
                    />

                    {/* Content — clickable */}
                    <button onClick={() => void openMessage(msg)} className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Icon size={12} style={{ color: meta.color, flexShrink: 0 }} />
                        <p className="font-mono-custom font-bold text-xs text-slate-200 truncate flex-1">{msg.name}</p>
                        <span className="font-mono-custom text-[0.55rem] text-slate-600 flex-shrink-0">{formatDate(msg.created_at)}</span>
                      </div>
                      <p className="font-mono-custom text-[0.62rem] text-slate-500 truncate">{msg.email}</p>
                      <p className="font-mono-custom text-[0.62rem] text-slate-600 line-clamp-1 mt-0.5">{msg.brief}</p>
                    </button>

                    {/* Row actions */}
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      {tab === 'inbox' ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); void moveToTrash([msg.id]) }}
                          title="Mover a eliminados"
                          className="p-1 rounded text-slate-600 hover:text-[#FF4444] transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); void restoreFromTrash([msg.id]) }}
                            title="Restaurar"
                            className="p-1 rounded text-slate-600 hover:text-[#00FF88] transition-colors"
                          >
                            <RotateCcw size={12} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setConfirmPerm([msg.id]) }}
                            title="Eliminar permanentemente"
                            className="p-1 rounded text-slate-600 hover:text-[#FF4444] transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </>
          )}
        </div>

        {/* Detail panel */}
        <div className="sticky top-4">
          {selected ? (
            <motion.div key={selected.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6 border border-[rgba(245,158,11,0.15)]">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="font-mono-custom font-black text-base text-slate-100">{selected.name}</p>
                  <p className="font-mono-custom text-xs text-[#00E5FF] mt-0.5">{selected.email}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-600 hover:text-slate-300 transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-2.5 mb-5">
                {selected.project_type && (
                  <div className="flex gap-2">
                    <span className="font-mono-custom text-[0.62rem] text-slate-600 w-20 flex-shrink-0">Proyecto</span>
                    <span className="font-mono-custom text-xs text-slate-300">{selected.project_type}</span>
                  </div>
                )}
                {selected.budget && (
                  <div className="flex gap-2">
                    <span className="font-mono-custom text-[0.62rem] text-slate-600 w-20 flex-shrink-0">Budget</span>
                    <span className="font-mono-custom text-xs text-slate-300">{selected.budget}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <span className="font-mono-custom text-[0.62rem] text-slate-600 w-20 flex-shrink-0">Estado</span>
                  <span className="font-mono-custom text-xs" style={{ color: getMeta(selected.status).color }}>
                    {getMeta(selected.status).label}
                    {selected.replied_at && ` · ${formatDate(selected.replied_at)}`}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="font-mono-custom text-[0.62rem] text-slate-600 w-20 flex-shrink-0">Recibido</span>
                  <span className="font-mono-custom text-xs text-slate-500">{formatDate(selected.created_at)}</span>
                </div>
              </div>

              <div className="rounded-xl border border-[rgba(255,255,255,0.05)] p-4 mb-5 bg-black/30">
                <p className="font-mono-custom text-[0.62rem] text-slate-600 mb-2">// brief</p>
                <p className="font-mono-custom text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{selected.brief}</p>
              </div>

              <div className="flex gap-2">
                {selected.status !== 'eliminado' && (
                  <button onClick={() => setReply({ message: selected, subject: DEFAULT_SUBJECT(selected.name), body: DEFAULT_BODY(selected.name) })}
                    className="flex-1 py-2.5 rounded-xl font-mono-custom text-sm font-bold flex items-center justify-center gap-2 border transition-all"
                    style={{ color: '#F59E0B', borderColor: 'rgba(245,158,11,0.4)', background: 'rgba(245,158,11,0.06)' }}>
                    <Send size={13} /> Responder
                  </button>
                )}
                {tab === 'inbox' && (
                  <button onClick={() => void moveToTrash([selected.id])}
                    className="py-2.5 px-4 rounded-xl font-mono-custom text-xs border transition-all flex items-center gap-1.5"
                    style={{ color: '#FF4444', borderColor: 'rgba(255,68,68,0.3)' }}>
                    <Trash2 size={12} /> Eliminar
                  </button>
                )}
                {tab === 'trash' && (
                  <button onClick={() => void restoreFromTrash([selected.id])}
                    className="py-2.5 px-4 rounded-xl font-mono-custom text-xs border transition-all flex items-center gap-1.5"
                    style={{ color: '#00FF88', borderColor: 'rgba(0,255,136,0.3)' }}>
                    <RotateCcw size={12} /> Restaurar
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="glass-card p-12 text-center border border-[rgba(255,255,255,0.04)]">
              <Mail size={28} className="text-slate-700 mx-auto mb-3" strokeWidth={1.2} />
              <p className="font-mono-custom text-xs text-slate-600">Selecciona un mensaje para ver el detalle</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Confirm permanent delete modal ────────────────────────── */}
      <AnimatePresence>
        {confirmPerm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setConfirmPerm(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="glass-card p-6 max-w-sm w-full border border-[rgba(255,68,68,0.4)]"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle size={20} className="text-[#FF4444] flex-shrink-0" />
                <p className="font-mono-custom font-black text-slate-100">Eliminar permanentemente</p>
              </div>
              <p className="font-mono-custom text-xs text-slate-400 mb-5">
                Vas a eliminar <span className="text-[#FF4444] font-bold">{confirmPerm.length} mensaje{confirmPerm.length > 1 ? 's' : ''}</span> de forma permanente.
                Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button onClick={() => void permanentDelete(confirmPerm)} disabled={operating}
                  className="btn-primary flex-1 py-2.5 disabled:opacity-50" style={{ borderColor: 'rgba(255,68,68,0.5)', color: '#FF4444' }}>
                  {operating ? 'eliminando...' : 'Eliminar para siempre'}
                </button>
                <button onClick={() => setConfirmPerm(null)} className="btn-primary flex-1 py-2.5">Cancelar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Reply modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {reply && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
            onClick={() => setReply(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 w-full max-w-2xl border border-[rgba(245,158,11,0.25)] max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-mono-custom font-black text-[#F59E0B]">&gt; reply_to()</h2>
                  <p className="font-mono-custom text-xs text-slate-500 mt-0.5">
                    Para: <span className="text-[#00E5FF]">{reply.message.email}</span>
                  </p>
                </div>
                <button onClick={() => setReply(null)} className="text-slate-600 hover:text-slate-300"><X size={16} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="font-mono-custom text-xs text-slate-400 block mb-1">Asunto</label>
                  <input value={reply.subject} onChange={(e) => setReply((r) => r ? { ...r, subject: e.target.value } : r)} className="input-field" />
                </div>
                <div>
                  <label className="font-mono-custom text-xs text-slate-400 block mb-1">Mensaje</label>
                  <textarea value={reply.body} onChange={(e) => setReply((r) => r ? { ...r, body: e.target.value } : r)}
                    className="input-field resize-none" rows={10} autoFocus />
                </div>
                <div className="p-3 rounded-lg border border-[rgba(245,158,11,0.15)] bg-[rgba(245,158,11,0.04)]">
                  <p className="font-mono-custom text-[0.6rem] text-slate-600">
                    <Clock size={10} className="inline mr-1" />
                    Marcará como <span className="text-[#00FF88]">Respondido</span> · quedará en historial
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => void handleSendReply()} disabled={sending || !reply.body.trim()}
                    className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ borderColor: 'rgba(245,158,11,0.4)', color: '#F59E0B' }}>
                    {sending ? (
                      <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-3.5 h-3.5 border border-[#F59E0B] border-t-transparent rounded-full" />enviando...</>
                    ) : (
                      <><Send size={13} /> Enviar respuesta</>
                    )}
                  </button>
                  <button onClick={() => setReply(null)} className="btn-primary py-3 px-6">cancelar</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
