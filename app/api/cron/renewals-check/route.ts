/**
 * GET /api/cron/renewals-check
 *
 * Cron job — run daily via Vercel Cron or external scheduler.
 * Protected by CRON_SECRET header.
 *
 * Responsibilities:
 *   1. Refresh all renewal statuses (upcoming → due_soon → overdue)
 *   2. Send due reminder emails/WhatsApp for each renewal that hits a schedule checkpoint
 *   3. Log each reminder sent to renewal_reminders table
 *
 * Add to vercel.json:
 * {
 *   "crons": [{ "path": "/api/cron/renewals-check", "schedule": "0 10 * * *" }]
 * }
 */

import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { getReminderTone, REMINDER_SCHEDULE } from '@/lib/renewals/state-obligations'

const db = () => createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY!)

const IS_DEV = process.env.NODE_ENV === 'development'
const DEV_EMAIL = 'gprofessionalservices.info@gmail.com'
const FROM = 'CreaTuEmpresaUSA <noreply@creatuempresausa.com>'
const WA_NUMBER = '19046248859'

export async function GET(req: Request) {
  // Auth check
  const secret = req.headers.get('x-cron-secret') || new URL(req.url).searchParams.get('secret')
  if (!IS_DEV && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = db()
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const log: string[] = []

  // ── Step 1: Refresh statuses ────────────────────────────────────
  const { error: refreshErr } = await supabase.rpc('refresh_renewal_statuses')
  if (refreshErr) {
    console.error('[cron/renewals] refresh error:', refreshErr)
    log.push(`STATUS REFRESH ERROR: ${refreshErr.message}`)
  } else {
    log.push('Status refresh: OK')
  }

  // ── Step 2: Fetch all active renewals with client contact info ──
  const { data: renewals, error: fetchErr } = await supabase
    .from('renewals')
    .select(`
      id, type, label, due_date, status, reminders_sent,
      companies (
        company_name, state,
        clients (
          language_pref,
          users ( full_name, email )
        )
      )
    `)
    .not('status', 'in', '("paid","waived","not_applicable")')

  if (fetchErr) {
    console.error('[cron/renewals] fetch error:', fetchErr)
    return NextResponse.json({ error: fetchErr.message }, { status: 500 })
  }

  let emailsSent = 0
  let skipped = 0

  for (const renewal of renewals ?? []) {
    const dueDate    = new Date(renewal.due_date)
    const daysOffset = Math.round((dueDate.getTime() - today.getTime()) / 86400000)
    // Flip sign: negative = before due, positive = after due
    const normalizedOffset = -daysOffset

    // Find if today matches a reminder checkpoint (within ±1 day tolerance)
    const matchedCheckpoint = REMINDER_SCHEDULE.find(
      cp => Math.abs(normalizedOffset - cp) <= 1
    )

    if (matchedCheckpoint === undefined) {
      skipped++
      continue
    }

    // Check if this checkpoint was already sent
    const sent: number[] = Array.isArray(renewal.reminders_sent) ? renewal.reminders_sent : []
    if (sent.includes(matchedCheckpoint)) {
      skipped++
      continue
    }

    // Resolve contact info
    const company = (renewal.companies as any)
    const client  = company?.clients
    const userObj = client?.users
    const email   = IS_DEV ? DEV_EMAIL : (userObj?.email || '')
    const name    = userObj?.full_name || 'Cliente'
    const companyName = company?.company_name || 'tu empresa'
    const tone    = getReminderTone(matchedCheckpoint)

    if (!email) {
      log.push(`SKIP ${renewal.id}: no email`)
      continue
    }

    // ── Build email content based on tone ──────────────────────
    const emailContent = buildReminderEmail({
      tone,
      name,
      companyName,
      renewalLabel: renewal.label,
      dueDate: renewal.due_date,
      normalizedOffset: matchedCheckpoint,
    })

    try {
      await resend.emails.send({
        from: FROM,
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
      })
      emailsSent++
      log.push(`EMAIL sent to ${email}: ${renewal.label} (${tone}, offset ${matchedCheckpoint})`)
    } catch (e: any) {
      log.push(`EMAIL ERROR ${renewal.id}: ${e.message}`)

      // Log failed reminder
      await supabase.from('renewal_reminders').insert({
        renewal_id: renewal.id,
        channel: 'email',
        days_offset: matchedCheckpoint,
        tone,
        recipient_email: email,
        delivery_status: 'error',
        error_message: e.message,
      })
      continue
    }

    // ── Log successful reminder ──────────────────────────────────
    await supabase.from('renewal_reminders').insert({
      renewal_id: renewal.id,
      channel: 'email',
      days_offset: matchedCheckpoint,
      tone,
      recipient_email: email,
      delivery_status: 'sent',
    })

    // Mark checkpoint as sent in reminders_sent JSON array
    await supabase
      .from('renewals')
      .update({
        reminders_sent:  [...sent, matchedCheckpoint],
        last_reminder_at: new Date().toISOString(),
      })
      .eq('id', renewal.id)
  }

  return NextResponse.json({
    date: todayStr,
    processed: (renewals ?? []).length,
    emailsSent,
    skipped,
    log,
  })
}

// ── Email builder ──────────────────────────────────────────────────

interface ReminderEmailParams {
  tone: 'educational' | 'preventive' | 'urgent' | 'recovery'
  name: string
  companyName: string
  renewalLabel: string
  dueDate: string
  normalizedOffset: number
}

function buildReminderEmail(p: ReminderEmailParams) {
  const { tone, name, companyName, renewalLabel, dueDate, normalizedOffset } = p

  const formattedDate = new Date(dueDate).toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  })

  const daysAbs = Math.abs(normalizedOffset)
  const isAfter = normalizedOffset > 0

  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://creatuempresausa.com'}/dashboard/renovaciones`
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hola, tengo una pregunta sobre la renovación de ${renewalLabel} para ${companyName}.`)}`

  const toneConfig: Record<string, { subject: string; headline: string; body: string; cta: string; ctaColor: string }> = {
    educational: {
      subject:   `📋 Información sobre tu obligación: ${renewalLabel}`,
      headline:  `Una obligación futura para ${companyName}`,
      body:      `Queremos mantenerte informado. En aproximadamente ${daysAbs} días vence <strong>${renewalLabel}</strong>. No necesitas hacer nada hoy — te iremos recordando a medida que se acerque la fecha. Mantener tu empresa al día con sus obligaciones protege tu estatus legal y evita penalidades.`,
      cta:       'Ver mis obligaciones',
      ctaColor:  '#0A2540',
    },
    preventive: {
      subject:   `⏳ Recordatorio: ${renewalLabel} vence en ${daysAbs} días`,
      headline:  `Próxima obligación en ${daysAbs} días`,
      body:      `Tu obligación <strong>${renewalLabel}</strong> para <strong>${companyName}</strong> vence el <strong>${formattedDate}</strong>. Este es un buen momento para prepararte y evitar cargos por entrega tardía. Puedes gestionar todo desde tu portal.`,
      cta:       'Ir a mi portal',
      ctaColor:  '#0A2540',
    },
    urgent: {
      subject:   `🚨 Acción requerida: ${renewalLabel} vence ${daysAbs === 0 ? 'HOY' : `en ${daysAbs} días`}`,
      headline:  `Acción urgente requerida`,
      body:      `Tu obligación <strong>${renewalLabel}</strong> para <strong>${companyName}</strong> vence el <strong>${formattedDate}</strong>${daysAbs === 0 ? ' — <u>HOY</u>' : ` en solo ${daysAbs} días`}. Omitir esta obligación puede resultar en multas, pérdida del buen estado de tu empresa, o su disolución. Actúa ahora.`,
      cta:       'Renovar ahora',
      ctaColor:  '#DC2626',
    },
    recovery: {
      subject:   `⚠️ Obligación vencida: ${renewalLabel} — ${daysAbs} días de retraso`,
      headline:  `Obligación vencida — actúa de inmediato`,
      body:      `La obligación <strong>${renewalLabel}</strong> para <strong>${companyName}</strong> venció el <strong>${formattedDate}</strong> (hace ${daysAbs} días). Tu empresa puede estar en riesgo de perder su estatus activo ante el estado. Contáctanos de inmediato para regularizar tu situación y evitar consecuencias mayores.`,
      cta:       'Regularizar ahora',
      ctaColor:  '#DC2626',
    },
  }

  const cfg = toneConfig[tone]

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${cfg.subject}</title></head>
<body style="margin:0;padding:0;background:#f4f6fa;font-family:'Inter',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fa;padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(10,37,64,.08)">

        <!-- Header -->
        <tr><td style="background:#0A2540;padding:24px 32px">
          <span style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#fff">CreaTuEmpresa<span style="color:#DC2626">USA</span></span>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px">
          <p style="font-size:14px;color:#6b7280;margin:0 0 8px">Hola, ${name}</p>
          <h1 style="font-size:22px;font-weight:800;color:#0A2540;margin:0 0 20px;line-height:1.3">${cfg.headline}</h1>
          <p style="font-size:15px;color:#374151;line-height:1.65;margin:0 0 24px">${cfg.body}</p>

          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:8px;border:1px solid #e5e7eb;margin-bottom:24px">
            <tr>
              <td style="padding:16px 20px;border-bottom:1px solid #e5e7eb">
                <span style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#9ca3af">Obligación</span><br>
                <span style="font-size:15px;font-weight:600;color:#0A2540">${renewalLabel}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 20px;border-bottom:1px solid #e5e7eb">
                <span style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#9ca3af">Empresa</span><br>
                <span style="font-size:15px;font-weight:600;color:#0A2540">${companyName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 20px">
                <span style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#9ca3af">Fecha límite</span><br>
                <span style="font-size:15px;font-weight:700;color:${isAfter ? '#DC2626' : '#0A2540'}">${formattedDate}${isAfter ? ` (${daysAbs} días vencida)` : ''}</span>
              </td>
            </tr>
          </table>

          <!-- CTAs -->
          <table cellpadding="0" cellspacing="0" style="margin-bottom:24px">
            <tr>
              <td style="padding-right:12px">
                <a href="${portalUrl}" style="display:inline-block;background:${cfg.ctaColor};color:#fff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 24px;border-radius:8px">${cfg.cta}</a>
              </td>
              <td>
                <a href="${waUrl}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 24px;border-radius:8px">Hablar con un agente</a>
              </td>
            </tr>
          </table>

          <p style="font-size:13px;color:#9ca3af;line-height:1.5">¿Tienes preguntas? Responde este email o escríbenos a <a href="mailto:soporte@creatuempresausa.com" style="color:#0A2540">soporte@creatuempresausa.com</a></p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8fafc;border-top:1px solid #e5e7eb;padding:20px 32px;text-align:center">
          <p style="font-size:12px;color:#9ca3af;margin:0">© 2026 CreaTuEmpresaUSA · <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://creatuempresausa.com'}/dashboard" style="color:#6b7280">Ir al portal</a></p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  return { subject: cfg.subject, html }
}
