/**
 * POST /api/client/notify-onboarding
 *
 * Called by the client after completing the onboarding wizard.
 * Sends a WhatsApp notification to the admin number using the
 * service-role Twilio credentials — bypasses the admin-only
 * /api/whatsapp/send route.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import twilio from 'twilio'

const ADMIN_WA = '+18669958013'
const APP_URL  = process.env.NEXT_PUBLIC_APP_URL ?? 'https://creatuempresausa.com'

export async function POST(req: NextRequest) {
  // Verify the caller is an authenticated client (cookie-based, ES256 workaround)
  const { cookies } = await import('next/headers')
  const cookieStore = cookies()
  let userId: string | null = null
  try {
    const tokenName = 'sb-rhprcuqhuesorrncswjs-auth-token'
    const raw = cookieStore.get(tokenName)?.value
      || cookieStore.get(`${tokenName}.0`)?.value
    if (raw) {
      const d = JSON.parse(decodeURIComponent(raw))
      const token = d?.access_token || raw
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
      userId = payload?.sub ?? null
    }
  } catch {}
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { company_id, full_name, company_name, state, package: pkg } = await req.json()
  if (!company_id) return NextResponse.json({ error: 'Missing company_id' }, { status: 400 })

  // Verify the company belongs to this user
  const db = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
  const { data: company } = await db
    .from('companies')
    .select('id, clients!inner(user_id)')
    .eq('id', company_id)
    .eq('clients.user_id', userId)
    .maybeSingle()

  if (!company) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Send WhatsApp to admin
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken  = process.env.TWILIO_AUTH_TOKEN
  const from       = process.env.TWILIO_WHATSAPP_FROM ?? 'whatsapp:+14155238886'

  if (!accountSid || !authToken) {
    // Non-fatal — log and continue
    console.warn('[notify-onboarding] Twilio not configured, skipping WA notification')
    return NextResponse.json({ ok: true, wa: false })
  }

  const planLabel: Record<string, string> = {
    basic: 'Starter', starter: 'Starter',
    growth: 'Pro', professional: 'Pro',
    premium: 'Premium',
  }
  const planDisplay = planLabel[(pkg ?? '').toLowerCase()] ?? pkg ?? '—'

  const body = [
    '🔔 *Nuevo onboarding completado*',
    '',
    `Cliente: ${full_name ?? '—'}`,
    `Empresa: ${company_name ?? '—'}`,
    `Estado: ${state ?? '—'}`,
    `Plan: ${planDisplay}`,
    '',
    'Revisa el caso en:',
    `${APP_URL}/admin/clients/${company_id}`,
  ].join('\n')

  try {
    const client = twilio(accountSid, authToken)
    await client.messages.create({
      from,
      to: `whatsapp:${ADMIN_WA}`,
      body,
    })

    // Persist to conversation log
    await db.from('whatsapp_conversations').insert({
      phone_number: ADMIN_WA,
      company_id:   company_id,
      role:         'assistant',
      content:      body,
    })
  } catch (err: any) {
    // Non-fatal — log but don't fail the onboarding
    console.error('[notify-onboarding] WA send error:', err?.message ?? err)
    return NextResponse.json({ ok: true, wa: false, warn: err?.message })
  }

  return NextResponse.json({ ok: true, wa: true })
}
