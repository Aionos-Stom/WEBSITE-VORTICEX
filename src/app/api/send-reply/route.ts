import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import nodemailer from 'nodemailer'
import { z } from 'zod'
import { logAction } from '@/lib/audit'

// ── SMTP config validation ────────────────────────────────────────
function getSmtpConfig() {
  const user     = process.env['SMTP_USER']
  const passRaw  = process.env['SMTP_PASS']
  const pass     = passRaw?.replace(/\s+/g, '') // strip spaces from Gmail App Password
  const host     = process.env['SMTP_HOST'] ?? 'smtp.gmail.com'
  const port     = Number(process.env['SMTP_PORT'] ?? 587)
  const fromName = process.env['SMTP_FROM_NAME'] ?? 'mellamobrau'

  const missing: string[] = []
  if (!user || user.includes('tu_correo') || user.includes('PON_TU')) missing.push('SMTP_USER')
  if (!pass || pass.includes('tu_app')    || pass.includes('PON_LOS'))  missing.push('SMTP_PASS')

  return { user, pass, host, port, fromName, missing }
}

const ReplySchema = z.object({
  message_id: z.string().uuid(),
  to_email:   z.string().email().max(255),
  to_name:    z.string().max(120),
  subject:    z.string().min(1).max(200).trim(),
  body:       z.string().min(1).max(5000).trim(),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── Auth guard ─────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // ── SMTP config check BEFORE parsing body ──────────────────────
  const smtp = getSmtpConfig()
  if (smtp.missing.length > 0) {
    const msg = `Variables SMTP no configuradas: ${smtp.missing.join(', ')}. Agrégalas en .env.local`
    console.error('[send-reply] CONFIG ERROR:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  // ── Validate body ──────────────────────────────────────────────
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido (no es JSON)' }, { status: 400 })
  }

  const parsed = ReplySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { message_id, to_email, to_name, subject, body: replyBody } = parsed.data

  // ── Build transporter ──────────────────────────────────────────
  const transporter = nodemailer.createTransport({
    host:   smtp.host,
    port:   smtp.port,
    secure: smtp.port === 465, // true solo para port 465
    auth:   { user: smtp.user, pass: smtp.pass },
    logger: true,  // nodemailer internal debug logs
    debug:  process.env['NODE_ENV'] !== 'production',
  })

  // ── Verify SMTP connection FIRST ───────────────────────────────
  try {
    await transporter.verify()
    console.log('[send-reply] SMTP verify OK — conectado a', smtp.host)
  } catch (verifyErr) {
    const e = verifyErr as NodeJS.ErrnoException & { code?: string; responseCode?: number; response?: string }
    const detail = [
      `code: ${e.code ?? 'UNKNOWN'}`,
      e.responseCode ? `responseCode: ${e.responseCode}` : null,
      e.response ? `response: ${e.response}` : null,
      `message: ${e.message}`,
    ].filter(Boolean).join(' | ')

    console.error('[send-reply] SMTP VERIFY FAILED:', detail)

    let hint = ''
    if (e.code === 'EAUTH' || e.responseCode === 535) {
      hint = 'Credenciales incorrectas. Para Gmail, usa una App Password (no tu contraseña normal). Actívala en: myaccount.google.com/apppasswords'
    } else if (e.code === 'ECONNREFUSED') {
      hint = `Conexión rechazada a ${smtp.host}:${smtp.port}. Verifica host y puerto.`
    } else if (e.code === 'ETIMEDOUT' || e.code === 'ESOCKET') {
      hint = 'Timeout de conexión. Posible bloqueo de firewall o puerto incorrecto.'
    } else if (e.responseCode === 534 || e.responseCode === 530) {
      hint = 'Gmail requiere App Password. Ve a: myaccount.google.com/apppasswords y genera una contraseña de aplicación.'
    }

    return NextResponse.json(
      { error: `SMTP error: ${detail}`, hint: hint || null },
      { status: 500 },
    )
  }

  // ── Send email ─────────────────────────────────────────────────
  try {
    const info = await transporter.sendMail({
      from:    `"${smtp.fromName}" <${smtp.user}>`,
      to:      `"${to_name}" <${to_email}>`,
      subject,
      html: `
        <div style="font-family:'Courier New',monospace;background:#050510;color:#e2e8f0;padding:32px;max-width:600px;margin:0 auto;border:1px solid rgba(0,229,255,0.2);border-radius:12px;">
          <div style="color:#00E5FF;font-size:12px;margin-bottom:24px;opacity:0.7;">
            // transmision_segura — ${smtp.fromName}
          </div>
          <div style="font-size:14px;line-height:1.8;white-space:pre-wrap;color:#cbd5e1;">
${replyBody}
          </div>
          <div style="margin-top:32px;padding-top:16px;border-top:1px solid rgba(0,229,255,0.1);font-size:11px;color:#475569;">
            Enviado desde el panel de administración · ${smtp.fromName}
          </div>
        </div>
      `,
      text: replyBody,
    })

    console.log('[send-reply] Email sent — messageId:', info.messageId, '| to:', to_email)

    // ── Mark as replied in DB ──────────────────────────────────
    const { error: dbError } = await supabase
      .from('contact_messages')
      .update({ status: 'respondido', replied_at: new Date().toISOString() })
      .eq('id', message_id)

    if (dbError) {
      console.error('[send-reply] DB update error (email sent but status not updated):', dbError.message)
    }

    // ── Audit log ──────────────────────────────────────────────
    void logAction(supabase, 'send_email', 'contact_messages', `→ ${to_email}`, { subject, messageId: info.messageId })

    return NextResponse.json({ ok: true, messageId: info.messageId })
  } catch (sendErr) {
    const e = sendErr as NodeJS.ErrnoException & { code?: string; responseCode?: number; response?: string }
    const detail = [
      `code: ${e.code ?? 'UNKNOWN'}`,
      e.responseCode ? `responseCode: ${e.responseCode}` : null,
      e.response ? `response: ${e.response}` : null,
      `message: ${e.message}`,
    ].filter(Boolean).join(' | ')

    console.error('[send-reply] SEND FAILED:', detail)
    return NextResponse.json({ error: `Error al enviar: ${detail}` }, { status: 500 })
  }
}
