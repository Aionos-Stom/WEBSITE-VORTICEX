'use client'

import { useState, useEffect, useRef, useCallback, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { SiteConfigMap } from '@/types/database'

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type LineType = 'output' | 'cmd' | 'error' | 'success' | 'cyan' | 'purple' | 'green' | 'amber' | 'dim' | 'separator'

interface Line {
  text: string
  type: LineType
}

/* ─────────────────────────────────────────────
   Command registry
───────────────────────────────────────────── */
const CMD_LIST = [
  ['help / ?', 'Lista de comandos disponibles'],
  ['neofetch', 'Información del sistema al estilo Linux'],
  ['whoami', 'Identidad y perfil del operador'],
  ['skills', 'Arsenal técnico cargado'],
  ['stack', 'Capas de tecnología por categoría'],
  ['services', 'Servicios de ingeniería disponibles'],
  ['contact', 'Protocolo de contacto'],
  ['social', 'Redes y perfiles públicos'],
  ['manifesto', 'Las 5 leyes de ingeniería'],
  ['clear / cls', 'Limpiar la terminal'],
  ['exit / q', 'Cerrar terminal'],
]

function buildHelp(): Line[] {
  return [
    { text: '┌─────────────────────────────────────────────────┐', type: 'cyan' },
    { text: '│           COMANDOS DISPONIBLES                  │', type: 'cyan' },
    { text: '└─────────────────────────────────────────────────┘', type: 'cyan' },
    { text: '', type: 'output' },
    ...CMD_LIST.flatMap(([cmd = '', desc = '']) => [
      { text: `  ${cmd.padEnd(16)}  ${desc}`, type: 'cyan' as LineType },
    ]),
    { text: '', type: 'output' },
    { text: '  Escribe un comando y presiona [ENTER]', type: 'dim' },
  ]
}

function buildNeofetch(): Line[] {
  return [
    { text: '', type: 'output' },
    { text: '        ████████████        ', type: 'cyan' },
    { text: '      ████░░░░░░░░████      ', type: 'cyan' },
    { text: '    ████░░  SYSTEM  ░░████  ', type: 'cyan' },
    { text: '    ████░░  ONLINE  ░░████  ', type: 'cyan' },
    { text: '      ████░░░░░░░░████      ', type: 'cyan' },
    { text: '        ████████████        ', type: 'cyan' },
    { text: '', type: 'output' },
    { text: '  OS           Next.js 14 + React 19', type: 'output' },
    { text: '  Host         Vercel Edge Network', type: 'output' },
    { text: '  Kernel       TypeScript 5 (strict mode)', type: 'output' },
    { text: '  Shell        zsh + oh-my-zsh', type: 'output' },
    { text: '  Terminal     Alacritty / Warp', type: 'output' },
    { text: '  DB           Supabase (PostgreSQL 16)', type: 'output' },
    { text: '  Storage      Supabase Storage', type: 'output' },
    { text: '  Auth         Supabase Auth + RLS', type: 'output' },
    { text: '  CPU          Full Stack × 12 langs', type: 'output' },
    { text: '  GPU          Three.js + WebGPU', type: 'output' },
    { text: '  RAM          Redis L1/L2 cache', type: 'output' },
    { text: '  Security     OWASP Top 10 compliant', type: 'success' },
    { text: '', type: 'output' },
    { text: '  ■ ■ ■ ■ ■ ■ ■ ■  STATUS: OPERACIONAL', type: 'success' },
  ]
}

function buildWhoami(config?: Partial<SiteConfigMap>): Line[] {
  const name  = config?.terminal_name  ?? 'Johan Torres'
  const alias = config?.terminal_alias ?? 'The Monarch Of Chaos'
  const role  = config?.terminal_role  ?? 'Arquitecto de Software & Defensor Digital'
  return [
    { text: '', type: 'output' },
    { text: `  IDENTIDAD     ${name}`, type: 'cyan' },
    { text: `  ALIAS         ${alias}`, type: 'purple' },
    { text: `  ROL           ${role}`, type: 'output' },
    { text: '', type: 'output' },
    { text: '  ESPECIALIDADES:', type: 'dim' },
    { text: '    ├─ Full Stack Engineering (React · Node · Go · Rust)', type: 'output' },
    { text: '    ├─ Ciberseguridad Ofensiva & Defensiva', type: 'output' },
    { text: '    ├─ Experiencias 3D Inmersivas (Three.js · R3F · GLSL)', type: 'output' },
    { text: '    ├─ Cloud Architecture (AWS · GCP · Azure · Huawei)', type: 'output' },
    { text: '    └─ DBA & Data Engineering (PostgreSQL · Redis · ClickHouse)', type: 'output' },
    { text: '', type: 'output' },
    { text: '  FILOSOFÍA     Pensar como atacante. Construir como defensor.', type: 'amber' },
    { text: '                Diseñar como artista. Desplegar como ingeniero.', type: 'amber' },
    { text: '', type: 'output' },
    { text: '  STATUS        [■■■■■■■■■■] SISTEMA ACTIVO', type: 'success' },
  ]
}

function buildSkills(): Line[] {
  const skills: [string, number, string][] = [
    ['TypeScript / JavaScript', 96, 'cyan'],
    ['React / Next.js', 94, 'cyan'],
    ['Node.js / NestJS', 90, 'green'],
    ['Go (Golang)', 82, 'green'],
    ['Ciberseguridad', 88, 'purple'],
    ['Three.js / R3F / WebGL', 85, 'purple'],
    ['AWS / Cloud Architecture', 87, 'amber'],
    ['PostgreSQL / Redis', 89, 'amber'],
    ['Python / FastAPI', 80, 'green'],
    ['Docker / Kubernetes', 83, 'cyan'],
  ]
  return [
    { text: '', type: 'output' },
    { text: '  ARSENAL TÉCNICO CARGADO:', type: 'dim' },
    { text: '', type: 'output' },
    ...skills.map(([name, pct, color]) => {
      const filled = Math.round(pct / 5)
      const bar = '█'.repeat(filled) + '░'.repeat(20 - filled)
      return { text: `  ${name.padEnd(28)} [${bar}] ${pct}%`, type: color as LineType }
    }),
  ]
}

function buildStack(): Line[] {
  const layers: [string, string[]][] = [
    ['Frontend Core', ['React 19', 'Next.js App Router', 'TypeScript', 'Tailwind v4', 'Angular 18']],
    ['Visual Computing', ['Three.js', 'React Three Fiber', 'WebGPU', 'GLSL Shaders', 'GSAP']],
    ['Backend & APIs', ['NestJS', 'Go Fiber', 'Rust', 'FastAPI', 'Laravel 11']],
    ['Data Engine', ['PostgreSQL + pgvector', 'Redis', 'ClickHouse', 'Prisma', 'Drizzle']],
    ['Cloud & Ops', ['AWS', 'Terraform', 'Kubernetes', 'Docker', 'GitHub Actions']],
    ['Security Suite', ['OWASP ZAP', 'Semgrep', 'Argon2id', 'JWT/RS256', 'Trivy']],
  ]
  const colors: LineType[] = ['cyan', 'purple', 'green', 'amber', 'cyan', 'purple']
  const result: Line[] = [{ text: '', type: 'output' }]
  layers.forEach(([layer, techs], i) => {
    result.push({ text: `  ▶ ${layer}`, type: colors[i] ?? 'output' })
    result.push({ text: `    ${techs.join('  ·  ')}`, type: 'dim' })
    result.push({ text: '', type: 'output' })
  })
  return result
}

function buildServices(): Line[] {
  return [
    { text: '', type: 'output' },
    { text: '  01. DESARROLLO FULL-STACK & CLOUD', type: 'cyan' },
    { text: '      Ecosistemas digitales escalables de punta a punta.', type: 'output' },
    { text: '      Stack: Next.js · NestJS · Go · Rust · Laravel', type: 'dim' },
    { text: '', type: 'output' },
    { text: '  02. CIBERSEGURIDAD OFENSIVA & DEFENSIVA', type: 'purple' },
    { text: '      Protejo tu capital digital desde el sprint cero.', type: 'output' },
    { text: '      Stack: OWASP ZAP · Burp Suite · Semgrep · WAF', type: 'dim' },
    { text: '', type: 'output' },
    { text: '  03. EXPERIENCIAS INMERSIVAS 3D & UI/UX', type: 'green' },
    { text: '      Interfaces que se experimentan, no solo se navegan.', type: 'output' },
    { text: '      Stack: Three.js · R3F · WebGPU · GLSL · Framer Motion', type: 'dim' },
    { text: '', type: 'output' },
    { text: '  Usa [contact] para iniciar un proyecto.', type: 'amber' },
  ]
}

function buildContact(config?: Partial<SiteConfigMap>): Line[] {
  const email = config?.contact_email ?? 'contacto@portfolio.dev'
  const ghRaw = config?.github_url    ?? 'https://github.com/mellamobrau'
  const liRaw = config?.linkedin_url  ?? ''
  const gh = ghRaw.replace('https://github.com/', '/').replace('https://www.github.com/', '/')
  const li = liRaw.replace('https://linkedin.com/in/', '/in/').replace('https://www.linkedin.com/in/', '/in/')
  return [
    { text: '', type: 'output' },
    { text: '  PROTOCOLO DE CONTACTO INICIADO...', type: 'cyan' },
    { text: '', type: 'output' },
    { text: '  ┌─ CANALES SEGUROS ─────────────────────────────┐', type: 'dim' },
    { text: '  │                                               │', type: 'dim' },
    { text: `  │  Email    ${email.padEnd(33)}│`, type: 'output' },
    ...(gh ? [{ text: `  │  GitHub   ${gh.padEnd(33)}│`, type: 'output' as LineType }] : []),
    ...(li ? [{ text: `  │  LinkedIn ${li.padEnd(33)}│`, type: 'output' as LineType }] : []),
    { text: '  │                                               │', type: 'dim' },
    { text: '  │  Respuesta garantizada en < 48h               │', type: 'success' },
    { text: '  │                                               │', type: 'dim' },
    { text: '  └───────────────────────────────────────────────┘', type: 'dim' },
    { text: '', type: 'output' },
    { text: '  O ve a la sección #contacto del portfolio.', type: 'amber' },
  ]
}

function buildSocial(config?: Partial<SiteConfigMap>): Line[] {
  const gh = config?.github_url    ?? 'https://github.com/mellamobrau'
  const li = config?.linkedin_url  ?? ''
  const tw = config?.twitter_url   ?? ''
  const lines: Line[] = [
    { text: '', type: 'output' },
    { text: '  REDES & PERFILES PÚBLICOS:', type: 'dim' },
    { text: '', type: 'output' },
  ]
  if (gh) {
    lines.push({ text: `  [gh]    ${gh.replace('https://', '')}`, type: 'cyan' })
    lines.push({ text: '          Repos públicos, OSS contributions, dotfiles', type: 'dim' })
    lines.push({ text: '', type: 'output' })
  }
  if (li) {
    lines.push({ text: `  [li]    ${li.replace('https://', '')}`, type: 'purple' })
    lines.push({ text: '          Experiencia profesional y recomendaciones', type: 'dim' })
    lines.push({ text: '', type: 'output' })
  }
  if (tw) {
    lines.push({ text: `  [tw]    ${tw.replace('https://', '')}`, type: 'cyan' })
    lines.push({ text: '', type: 'output' })
  }
  lines.push({ text: '  Disponible para freelance y colaboraciones.', type: 'success' })
  return lines
}

function buildManifesto(): Line[] {
  const laws = [
    ['01', 'La Seguridad no es una característica — es el cimiento.', 'cyan'],
    ['02', 'UI/UX es una Religión.', 'purple'],
    ['03', 'Rendimiento No-Negociable (60fps · API < 100ms).', 'green'],
    ['04', 'Pensar como Atacante, Construir como Defensor.', 'amber'],
    ['05', 'Automatización u Obsolescencia.', 'cyan'],
  ]
  return [
    { text: '', type: 'output' },
    { text: '  ⚡ MANIFIESTO DE INGENIERÍA — 5 LEYES:', type: 'dim' },
    { text: '', type: 'output' },
    ...laws.map(([n = '', law = '', color = 'output']) => ({
      text: `  [${n}] ${law}`,
      type: color as LineType,
    })),
    { text: '', type: 'output' },
    { text: '  "Think like an attacker. Build like a defender.', type: 'dim' },
    { text: '   Design like an artist. Ship like an engineer."', type: 'dim' },
  ]
}

function buildCommands(config?: Partial<SiteConfigMap>): Record<string, () => Line[]> {
  return {
    help: buildHelp,
    '?': buildHelp,
    neofetch: buildNeofetch,
    whoami: () => buildWhoami(config),
    skills: buildSkills,
    stack: buildStack,
    services: buildServices,
    contact: () => buildContact(config),
    social: () => buildSocial(config),
    manifesto: buildManifesto,
  }
}

/* ─────────────────────────────────────────────
   Color mapper
───────────────────────────────────────────── */
function lineClass(type: LineType): string {
  switch (type) {
    case 'cmd':       return 'text-[#00E5FF]'
    case 'success':   return 'text-[#00FF88]'
    case 'error':     return 'text-[#FF4444]'
    case 'cyan':      return 'text-[#00E5FF]'
    case 'purple':    return 'text-[#9B5CFF]'
    case 'green':     return 'text-[#00FF88]'
    case 'amber':     return 'text-[#F59E0B]'
    case 'dim':       return 'text-slate-600'
    case 'separator': return 'text-[rgba(0,229,255,0.2)]'
    default:          return 'text-slate-300'
  }
}

/* ─────────────────────────────────────────────
   Boot sequence
───────────────────────────────────────────── */
const BOOT: Line[] = [
  { text: 'portfolio_terminal v2.6.0 — Conectado', type: 'success' },
  { text: 'Cifrado TLS 1.3 activo. Sesión anónima.', type: 'dim' },
  { text: '', type: 'output' },
  { text: '  Escribe [help] para ver los comandos disponibles.', type: 'amber' },
  { text: '', type: 'output' },
]

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
interface TerminalProps {
  onClose: () => void
  config?: Partial<SiteConfigMap>
}

export function TerminalWindow({ onClose, config }: TerminalProps): JSX.Element {
  const [lines, setLines] = useState<Line[]>(BOOT)
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const [minimized, setMinimized] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const COMMANDS = buildCommands(config)

  // Auto-scroll only within the terminal output — never scrolls the page
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [lines])

  // Focus input on open
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [minimized])

  const run = useCallback((raw: string) => {
    const cmd = raw.trim().toLowerCase()
    if (!cmd) return

    const newLines: Line[] = [
      { text: `visitor@portfolio:~$ ${raw}`, type: 'cmd' },
    ]

    if (cmd === 'clear' || cmd === 'cls') {
      setLines([])
      setHistory((h) => [raw, ...h])
      setHistIdx(-1)
      return
    }

    if (cmd === 'exit' || cmd === 'q') {
      newLines.push({ text: 'Cerrando sesión...', type: 'dim' })
      setLines((l) => [...l, ...newLines])
      setTimeout(onClose, 600)
    } else if (COMMANDS[cmd]) {
      newLines.push(...COMMANDS[cmd]())
    } else {
      newLines.push({ text: `  command not found: ${cmd}`, type: 'error' })
      newLines.push({ text: '  Escribe [help] para ver los comandos disponibles.', type: 'dim' })
    }

    newLines.push({ text: '', type: 'output' })
    setLines((l) => [...l, ...newLines])
    setHistory((h) => [raw, ...h.slice(0, 49)])
    setHistIdx(-1)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, config])

  const handleKey = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      run(input)
      setInput('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const idx = Math.min(histIdx + 1, history.length - 1)
      setHistIdx(idx)
      setInput(history[idx] ?? '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const idx = Math.max(histIdx - 1, -1)
      setHistIdx(idx)
      setInput(idx === -1 ? '' : (history[idx] ?? ''))
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const match = Object.keys(COMMANDS).find((k) => k.startsWith(input.toLowerCase()))
      if (match) setInput(match)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.96 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
      style={{
        border: '1px solid rgba(0,229,255,0.18)',
        background: 'rgba(2,2,12,0.97)',
        boxShadow: '0 0 60px rgba(0,229,255,0.08), 0 25px 60px rgba(0,0,0,0.7)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'rgba(0,229,255,0.1)', background: 'rgba(0,0,0,0.5)' }}
      >
        <div className="flex items-center gap-2">
          {/* Traffic lights */}
          <button
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-[#FF5F56] hover:bg-[#FF3B30] transition-colors"
            title="Cerrar"
          />
          <button
            onClick={() => setMinimized((m) => !m)}
            className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:bg-[#FF9F0A] transition-colors"
            title="Minimizar"
          />
          <button
            onClick={() => setLines(BOOT)}
            className="w-3 h-3 rounded-full bg-[#27C93F] hover:bg-[#28CD41] transition-colors"
            title="Limpiar"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-pulse" />
          <span className="font-mono-custom text-[0.62rem] text-slate-500">
            visitor@portfolio:~
          </span>
        </div>
        <button onClick={onClose} className="text-slate-600 hover:text-[#FF4444] transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* Output */}
      <AnimatePresence>
        {!minimized && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 320 }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            ref={outputRef}
            className="overflow-y-auto px-4 py-3 space-y-0.5"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', lineHeight: 1.6 }}
            onClick={() => inputRef.current?.focus()}
          >
            {lines.map((line, i) => (
              <div key={i} className={`whitespace-pre-wrap break-all ${lineClass(line.type)}`}>
                {line.text || '\u00A0'}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      {!minimized && (
        <div
          className="flex items-center gap-2 px-4 py-3 border-t"
          style={{ borderColor: 'rgba(0,229,255,0.08)', background: 'rgba(0,0,0,0.4)' }}
        >
          <span className="font-mono-custom text-[0.7rem] text-[#00E5FF] flex-shrink-0 select-none">
            visitor@portfolio:~$
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); setHistIdx(-1) }}
            onKeyDown={handleKey}
            className="flex-1 bg-transparent outline-none font-mono-custom text-[0.72rem] text-slate-200 placeholder:text-slate-700"
            placeholder="escribe un comando..."
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="w-1.5 h-3.5 bg-[#00E5FF] flex-shrink-0"
          />
        </div>
      )}
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   Button + portal wrapper (used in HeroSection)
───────────────────────────────────────────── */
interface TerminalTriggerProps {
  config?: Partial<SiteConfigMap>
}

export function TerminalTrigger({ config }: TerminalTriggerProps = {}): JSX.Element {
  const [open, setOpen] = useState(false)

  // Close on Escape
  useEffect(() => {
    const fn = (e: globalThis.KeyboardEvent): void => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [])

  return (
    <div className="w-full max-w-2xl">
      <button
        onClick={() => setOpen((o) => !o)}
        className="btn-primary text-sm flex items-center gap-2"
        style={{
          borderColor: open ? 'rgba(0,255,136,0.5)' : 'rgba(0,255,136,0.3)',
          color: '#00FF88',
          background: open ? 'rgba(0,255,136,0.08)' : 'transparent',
        }}
      >
        <motion.span
          animate={{ opacity: open ? 1 : [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: open ? 0 : Infinity }}
          className="w-1.5 h-1.5 rounded-full bg-[#00FF88] inline-block"
        />
        &gt; terminal()
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <TerminalWindow onClose={() => setOpen(false)} config={config} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
