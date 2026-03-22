import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import nodemailer from 'nodemailer'

// GET /api/test-smtp — verifica config sin enviar
export async function GET(): Promise<NextResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const smtpUser = process.env['SMTP_USER']
  const smtpPass = process.env['SMTP_PASS']?.replace(/\s+/g, '') // strip spaces
  const smtpHost = process.env['SMTP_HOST'] ?? 'smtp.gmail.com'
  const smtpPort = Number(process.env['SMTP_PORT'] ?? 587)

  const config = {
    SMTP_HOST: smtpHost,
    SMTP_PORT: smtpPort,
    SMTP_USER: smtpUser ?? '❌ vacío',
    SMTP_PASS: smtpPass ? `✓ seteado (${smtpPass.length} chars sin espacios)` : '❌ vacío',
    SMTP_FROM_NAME: process.env['SMTP_FROM_NAME'] ?? '❌ vacío',
  }

  if (!smtpUser || !smtpPass) {
    return NextResponse.json({ status: 'CONFIG_MISSING', config })
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost, port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  })

  try {
    await transporter.verify()
    return NextResponse.json({
      status: 'VERIFY_OK',
      message: `✅ Conexión SMTP OK — ${smtpHost}:${smtpPort} como ${smtpUser}`,
      nota: 'verify() OK no garantiza entrega. Usa POST /api/test-smtp?to=email para enviar uno de prueba.',
      config,
    })
  } catch (err) {
    const e = err as Error & { code?: string; responseCode?: number; response?: string }
    return NextResponse.json({
      status: 'VERIFY_FAIL',
      error: e.message, code: e.code, responseCode: e.responseCode, smtpResponse: e.response,
      config,
    })
  }
}

// POST /api/test-smtp  body: { to: "email@ejemplo.com" }
// Envía un correo de prueba real y retorna el messageId o el error exacto
export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const smtpUser = process.env['SMTP_USER']
  const smtpPass = process.env['SMTP_PASS']?.replace(/\s+/g, '') // strip spaces
  const smtpHost = process.env['SMTP_HOST'] ?? 'smtp.gmail.com'
  const smtpPort = Number(process.env['SMTP_PORT'] ?? 587)
  const fromName = process.env['SMTP_FROM_NAME'] ?? 'mellamobrau'

  if (!smtpUser || !smtpPass) {
    return NextResponse.json({ error: 'SMTP_USER o SMTP_PASS no configurados en .env.local' }, { status: 500 })
  }

  let to: string
  try {
    const body = await req.json() as { to?: string }
    to = body.to ?? smtpUser // si no se especifica, se envía al mismo SMTP_USER
  } catch {
    to = smtpUser
  }

  console.log(`[test-smtp] Intentando enviar correo de prueba a: ${to}`)
  console.log(`[test-smtp] Desde: ${smtpUser} via ${smtpHost}:${smtpPort}`)

  const transporter = nodemailer.createTransport({
    host: smtpHost, port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
    logger: true,
    debug: true,
  })

  try {
    const info = await transporter.sendMail({
      from:    `"${fromName}" <${smtpUser}>`,
      to,
      subject: '[TEST] Portfolio SMTP funcionando ✓',
      text:    `Este es un correo de prueba del portfolio.\nEnviado: ${new Date().toISOString()}\nDesde: ${smtpUser}\nHacia: ${to}`,
      html:    `<div style="font-family:monospace;padding:24px;background:#0a0a1a;color:#e2e8f0;border-radius:8px;">
                  <p style="color:#00FF88;font-size:16px;">✅ SMTP funcionando correctamente</p>
                  <p>Enviado: <strong>${new Date().toISOString()}</strong></p>
                  <p>Desde: <strong>${smtpUser}</strong></p>
                  <p>Hacia: <strong>${to}</strong></p>
                  <hr style="border-color:#1e293b"/>
                  <p style="color:#475569;font-size:12px;">Portfolio mellamobrau — test de diagnóstico SMTP</p>
                </div>`,
    })

    console.log('[test-smtp] ✅ sendMail OK — messageId:', info.messageId)
    console.log('[test-smtp] accepted:', info.accepted)
    console.log('[test-smtp] rejected:', info.rejected)
    console.log('[test-smtp] response:', info.response)

    return NextResponse.json({
      status:    'SENT',
      messageId: info.messageId,
      accepted:  info.accepted,
      rejected:  info.rejected,
      response:  info.response,
      to,
      from:      smtpUser,
      nota:      `Revisa la bandeja de entrada Y la carpeta de SPAM de: ${to}`,
    })
  } catch (err) {
    const e = err as Error & { code?: string; responseCode?: number; response?: string }
    console.error('[test-smtp] ❌ sendMail FAILED:', e.message, '| code:', e.code, '| responseCode:', e.responseCode)
    return NextResponse.json({
      status:       'SEND_FAIL',
      error:        e.message,
      code:         e.code,
      responseCode: e.responseCode,
      smtpResponse: e.response,
    }, { status: 500 })
  }
}
