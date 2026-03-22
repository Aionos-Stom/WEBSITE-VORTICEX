import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const ContactSchema = z.object({
  name:         z.string().min(1).max(120).trim(),
  email:        z.string().email().max(255).trim().toLowerCase(),
  project_type: z.string().max(80).optional().default(''),
  budget:       z.string().max(80).optional().default(''),
  brief:        z.string().min(1).max(2000).trim(),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await req.json()
    const parsed = ContactSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const supabase = await createClient()
    const { error } = await supabase.from('contact_messages').insert([parsed.data])

    if (error) {
      console.error('[contact] Supabase error:', error.message)
      return NextResponse.json({ error: 'Error al guardar mensaje' }, { status: 500 })
    }

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    console.error('[contact] Unexpected error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
