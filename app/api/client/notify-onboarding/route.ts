/**
 * POST /api/client/notify-onboarding
 *
 * Called by the client after completing the onboarding wizard.
 * Primary:   Resend email to admin inbox.
 * Secondary: WhatsApp to admin via Twilio (non-fatal fallback).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { Resend } from 'resend'
import twilio from 'twilio'

const ADMIN_EMAIL = 'gprofessionalservices.info@gmail.com'
const ADMIN_WA    = '+18669958013'
const APP_URL     = process.env.NEXT_PUBLIC_APP_URL ?? 'https://creatuempresausa.com'

const PLAN_LABEL: Record<string, string> = {
  basic: 'Starter', starter: 'Starter',
  growth: 'Pro', professional: 'Pro',
  premium: 'Premium',
}

export async function POST(req: NextRequest) {
  // ── Auth: cookie-based (ES256 workaround) ─────────────────────────────────
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

  // ── Verify company belongs to this user ───────────────────────────────────
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

  const planDisplay = PLAN_LABEL[(pkg ?? '').toLowerCase()] ?? pkg ?? '—'
  const adminUrl    = `${APP_URL}/admin/clients/${company_id}`

  // ── 1. Primary: Resend email ───────────────────────────────────────────────
  const resend  = new Resend(process.env.RESEND_API_KEY)
  const subject = `🔔 Nuevo onboarding completado — ${company_name ?? '—'}`
  const html    = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:32px 20px;background:#f8fafc">
      <div style="background:#0A2540;border-radius:12px;padding:20px 32px;margin-bottom:20px;text-align:center">
        <span style="color:#fff;font-size:20px;font-weight:800;letter-spacing:-0.5px">CreaTuEmpresa<span style="color:#ef4444">USA</span></span>
      </div>
      <div style="background:#fff;border-radius:12px;padding:28px;border:1px solid #e2e8f0">
        <h2 style="margin:0 0 20px;font-size:18px;color:#0A2540">🔔 Nuevo onboarding completado</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr style="border-bottom:1px solid #f1f5f9">
            <td style="padding:10px 0;color:#6b7280;width:140px">Cliente</td>
            <td style="padding:10px 0;font-weight:600;color:#111827">${full_name ?? '—'}</td>
          </tr>
          <tr style="border-bottom:1px solid #f1f5f9">
            <td style="padding:10px 0;color:#6b7280">Empresa</td>
            <td style="padding:10px 0;font-weight:600;color:#111827">${company_name ?? '—'}</td>
          </tr>
          <tr style="border-bottom:1px solid #f1f5f9">
            <td style="padding:10px 0;color:#6b7280">Estado</td>
            <td style="padding:10px 0;color:#374151">${state ?? '—'}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#6b7280">Plan</td>
            <td style="padding:10px 0;color:#374151">${planDisplay}</td>
          </tr>
        </table>
        <div style="margin-top:24px;text-align:center">
          <a href="${adminUrl}"
             style="display:inline-block;background:#0A2540;color:#fff;padding:12px 28px;border-radius:10px;font-weight:700;text-decoration:none;font-size:14px">
            Ver caso en el panel →
          </a>
        </div>
      </div>
      <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px">
        CreaTuEmpresaUSA · <a href="mailto:soporte@creatuempresausa.com" style="color:#94a3b8">soporte@creatuempresausa.com</a>
      </p>
    </div>
  `

  try {
    await resend.emails.send({
      from:    'CreaTuEmpresaUSA <soporte@creatuempresausa.com>',
      replyTo: 'soporte@creatuempresausa.com',
      to:      ADMIN_EMAIL,
      subject,
      html,
    })
    console.log('[notify-onboarding] email sent to', ADMIN_EMAIL)
  } catch (emailErr: any) {
    // Email failure is logged but non-fatal — still attempt WhatsApp
    console.error('[notify-onboarding] email error:', emailErr?.message ?? emailErr)
  }

  // ── 2. Secondary: WhatsApp (non-fatal) ────────────────────────────────────
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken  = process.env.TWILIO_AUTH_TOKEN
  const from       = process.env.TWILIO_WHATSAPP_FROM ?? 'whatsapp:+14155238886'

  if (accountSid && authToken) {
    const waBody = [
      '🔔 *Nuevo onboarding completado*',
      '',
      `Cliente: ${full_name ?? '—'}`,
      `Empresa: ${company_name ?? '—'}`,
      `Estado: ${state ?? '—'}`,
      `Plan: ${planDisplay}`,
      '',
      'Revisa el caso en:',
      adminUrl,
    ].join('\n')

    try {
      const twilioClient = twilio(accountSid, authToken)
      await twilioClient.messages.create({ from, to: `whatsapp:${ADMIN_WA}`, body: waBody })
      await db.from('whatsapp_conversations').insert({
        phone_number: ADMIN_WA,
        company_id,
        role:    'assistant',
        content: waBody,
      })
      console.log('[notify-onboarding] WhatsApp sent to', ADMIN_WA)
    } catch (waErr: any) {
      console.warn('[notify-onboarding] WhatsApp error (non-fatal):', waErr?.message ?? waErr)
    }
  }

  return NextResponse.json({ ok: true })
}
