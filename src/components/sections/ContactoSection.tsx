'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Terminal, User, Mail, Briefcase, DollarSign, FileText, Send, CheckCircle } from 'lucide-react'
import { SectionWrapper } from '@/components/ui/SectionWrapper'

const PROJECT_TYPES = ['Full-Stack & Cloud', 'Security Audit', '3D Experience', 'DBA / Analytics', 'Otro']
const BUDGETS = ['< $1,000', '$1,000 – $5,000', '$5,000 – $15,000', '$15,000+', 'Conversemos']

interface FormState {
  name: string
  email: string
  type: string
  budget: string
  brief: string
}

const EMPTY: FormState = { name: '', email: '', type: '', budget: '', brief: '' }

export function ContactoSection(): JSX.Element {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!form.name || !form.email || !form.brief) return
    setSending(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string; details?: { fieldErrors?: Record<string, string[]> } }
        const fieldError = data.details?.fieldErrors
          ? Object.values(data.details.fieldErrors).flat()[0]
          : null
        toast.error(fieldError ?? data.error ?? 'Error al enviar. Inténtalo de nuevo.')
        return
      }
      setSent(true)
      setForm(EMPTY)
    } catch {
      toast.error('Error de red. Verifica tu conexión.')
    } finally {
      setSending(false)
    }
  }

  const set = (key: keyof FormState) => (val: string) => setForm((f) => ({ ...f, [key]: val }))

  return (
    <SectionWrapper
      id="contacto"
      label="// protocolo_de_colaboracion.init"
      title="Iniciar Protocolo"
      titleColor="cyan"
      centered
    >
      {/* Intro */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="max-w-2xl mx-auto mb-14 text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[rgba(0,229,255,0.15)] bg-[rgba(0,229,255,0.04)] mb-5">
          <Terminal size={14} className="text-[#00E5FF]" />
          <span className="font-mono-custom text-xs text-[#00E5FF]">[TERMINAL] &gt; iniciar_colaboracion --secure</span>
        </div>
        <p className="font-mono-custom text-sm text-slate-400 leading-relaxed">
          Si buscas un desarrollador convencional, estás en el lugar equivocado.{' '}
          <span className="text-slate-200">Si buscas ingeniería de alta disponibilidad, arquitecturas blindadas y
          experiencias visuales que desafíen el estándar</span>, has llegado al nodo correcto.
        </p>
      </motion.div>

      <div className="max-w-2xl mx-auto">
        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-12 text-center rounded-2xl border border-[rgba(0,255,136,0.2)]"
          >
            <CheckCircle size={48} className="text-[#00FF88] mx-auto mb-4" strokeWidth={1.5} />
            <p className="font-mono-custom font-black text-xl text-[#00FF88] mb-2">TRANSMISIÓN RECIBIDA</p>
            <p className="font-mono-custom text-sm text-slate-400">
              Mensaje en cola de procesamiento. Respondo en &lt; 48h.
            </p>
            <button
              onClick={() => setSent(false)}
              className="mt-6 font-mono-custom text-xs text-slate-500 hover:text-[#00E5FF] transition-colors"
            >
              &gt; nueva_transmisión()
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-[rgba(0,229,255,0.12)] overflow-hidden"
            style={{ background: 'rgba(3,3,15,0.9)' }}
          >
            {/* Terminal header */}
            <div className="border-b border-[rgba(0,229,255,0.08)] px-6 py-3 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B6B]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#00FF88]" />
              <span className="font-mono-custom text-[0.65rem] text-slate-600 ml-2">contacto.exe — Modo Seguro</span>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Name + Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 font-mono-custom text-[0.65rem] text-slate-500 mb-1.5">
                    <User size={11} />
                    identidad: string
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => set('name')(e.target.value)}
                    className="input-field text-sm"
                    placeholder="Nombre o Empresa"
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 font-mono-custom text-[0.65rem] text-slate-500 mb-1.5">
                    <Mail size={11} />
                    punto_de_enlace: email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set('email')(e.target.value)}
                    className="input-field text-sm"
                    placeholder="email@dominio.com"
                    required
                  />
                </div>
              </div>

              {/* Project type */}
              <div>
                <label className="flex items-center gap-1.5 font-mono-custom text-[0.65rem] text-slate-500 mb-2">
                  <Briefcase size={11} />
                  naturaleza_del_proyecto: ProjectType
                </label>
                <div className="flex flex-wrap gap-2">
                  {PROJECT_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => set('type')(t)}
                      className="font-mono-custom text-xs px-3 py-1.5 rounded-lg border transition-all"
                      style={form.type === t ? {
                        color: '#00E5FF', borderColor: 'rgba(0,229,255,0.5)', background: 'rgba(0,229,255,0.1)',
                      } : {
                        color: '#475569', borderColor: 'rgba(255,255,255,0.07)',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="flex items-center gap-1.5 font-mono-custom text-[0.65rem] text-slate-500 mb-2">
                  <DollarSign size={11} />
                  presupuesto_estimado: Budget
                </label>
                <div className="flex flex-wrap gap-2">
                  {BUDGETS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => set('budget')(b)}
                      className="font-mono-custom text-xs px-3 py-1.5 rounded-lg border transition-all"
                      style={form.budget === b ? {
                        color: '#9B5CFF', borderColor: 'rgba(155,92,255,0.5)', background: 'rgba(155,92,255,0.1)',
                      } : {
                        color: '#475569', borderColor: 'rgba(255,255,255,0.07)',
                      }}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brief */}
              <div>
                <label className="flex items-center gap-1.5 font-mono-custom text-[0.65rem] text-slate-500 mb-1.5">
                  <FileText size={11} />
                  brief_tecnico: string — Describe el desafío, no solo la idea
                </label>
                <textarea
                  value={form.brief}
                  onChange={(e) => set('brief')(e.target.value)}
                  className="input-field resize-none text-sm"
                  rows={4}
                  placeholder="Cuéntame el problema técnico que necesitas resolver..."
                  required
                />
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={sending}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl font-mono-custom font-black text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                style={{
                  color: '#00E5FF',
                  borderColor: 'rgba(0,229,255,0.4)',
                  border: '1px solid',
                  background: sending ? 'rgba(0,229,255,0.1)' : 'rgba(0,229,255,0.05)',
                  boxShadow: '0 0 30px rgba(0,229,255,0.06)',
                }}
              >
                {sending ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border border-[#00E5FF] border-t-transparent rounded-full"
                    />
                    transmitiendo...
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    EJECUTAR_ENVÍO (v1.0)
                  </>
                )}
              </motion.button>

              <p className="font-mono-custom text-[0.6rem] text-slate-600 text-center">
                Cifrado de extremo a extremo · Respuesta en &lt; 48h · Sin spam
              </p>
            </form>
          </motion.div>
        )}
      </div>
    </SectionWrapper>
  )
}
