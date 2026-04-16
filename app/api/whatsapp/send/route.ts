/**
 * app/api/whatsapp/send/route.ts
 *
 * Admin outbound WhatsApp message sender.
 * POST { to: '+1234567890', body: 'Hello' }
 *
 * Required env vars (same as incoming):
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_WHATSAPP_FROM   (e.g. whatsapp:+14155238886)
 *   SUPABASE_SERVICE_ROLE_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import twilio from 'twilio'
import { createAdminServerClient } from '@/lib/supabase/server'

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(req: NextRequest) {
  // Auth check — must be logged-in admin
  const supabase = createAdminServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { to, body } = await req.json()
  if (!to || !body) {
    return NextResponse.json({ error: 'Missing to or body' }, { status: 400 })
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken  = process.env.TWILIO_AUTH_TOKEN
  const from       = process.env.TWILIO_WHATSAPP_FROM ?? 'whatsapp:+14155238886'

  if (!accountSid || !authToken) {
    return NextResponse.json({ error: 'Twilio not configured' }, { status: 500 })
  }

  const toWa = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`

  try {
    const client = twilio(accountSid, authToken)
    await client.messages.create({ from, to: toWa, body })

    // Persist as admin message in conversation history
    const db = adminDb()
    const phone = to.startsWith('whatsapp:') ? to.slice(9) : to

    const { data: company } = await db
      .from('companies')
      .select('id')
      .or(`whatsapp_phone_used.eq.${toWa},whatsapp_phone_used.eq.${phone}`)
      .maybeSingle()

    await db.from('whatsapp_conversations').insert({
      phone_number: phone,
      company_id:  company?.id ?? null,
      role:        'assistant',
      content:     body,
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[wa/send] error:', err?.message ?? err)
    return NextResponse.json({ error: err?.message ?? 'Send failed' }, { status: 500 })
  }
}
