import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { Resend } from 'resend'
import twilio from 'twilio'

const resend = new Resend(process.env.RESEND_API_KEY)

function buildWelcomeEmailHtml(opts: {
  customerName: string
  customerEmail: string
  companyName: string
  stateName: string
  packageName: string
  amountTotal: number
  orderRef: string
  portalUrl: string
}): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px">
<tr><td align="center">
<table cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

  <!-- HEADER -->
  <tr><td style="background:#0A2540;border-radius:12px 12px 0 0;padding:36px 40px;text-align:center">
    <p style="margin:0 0 16px;font-size:12px;font-weight:700;letter-spacing:3px;color:#93c5fd;text-transform:uppercase">CreaTuEmpresaUSA</p>
    <h1 style="margin:0 0 8px;font-size:28px;font-weight:800;color:#ffffff;line-height:1.2">¡Hola ${opts.customerName}! 🎉</h1>
    <p style="margin:0;font-size:16px;color:#93c5fd;font-weight:500">Tu empresa en EE.UU. está en camino</p>
  </td></tr>

  <!-- ORDER SUMMARY -->
  <tr><td style="background:#ffffff;padding:32px 40px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0">
    <p style="margin:0 0 20px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1.5px">Resumen del pedido</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:11px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#64748b">Empresa</td>
        <td style="padding:11px 0;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:700;color:#0A2540;text-align:right">${opts.companyName}</td>
      </tr>
      <tr>
        <td style="padding:11px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#64748b">Estado de formación</td>
        <td style="padding:11px 0;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:700;color:#0A2540;text-align:right">${opts.stateName}</td>
      </tr>
      <tr>
        <td style="padding:11px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#64748b">Paquete</td>
        <td style="padding:11px 0;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:700;color:#0A2540;text-align:right">${opts.packageName}</td>
      </tr>
      <tr>
        <td style="padding:11px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#64748b">Número de orden</td>
        <td style="padding:11px 0;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:700;color:#2563eb;text-align:right">${opts.orderRef}</td>
      </tr>
      <tr>
        <td style="padding:11px 0;font-size:14px;color:#64748b">Total pagado</td>
        <td style="padding:11px 0;font-size:18px;font-weight:800;color:#0A2540;text-align:right">$${opts.amountTotal} USD</td>
      </tr>
    </table>
  </td></tr>

  <!-- NEXT STEPS -->
  <tr><td style="background:#f8fafc;padding:32px 40px;border:1px solid #e2e8f0;border-top:none">
    <p style="margin:0 0 20px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1.5px">Próximos pasos</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:8px 0">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="font-size:20px;padding-right:12px;vertical-align:middle">✅</td>
          <td style="vertical-align:middle"><span style="font-size:14px;font-weight:700;color:#16a34a">Pago recibido</span>&nbsp;&nbsp;<span style="font-size:11px;background:#dcfce7;color:#16a34a;padding:3px 10px;border-radius:20px;font-weight:700">Completado</span></td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:8px 0">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="font-size:20px;padding-right:12px;vertical-align:middle">📋</td>
          <td style="vertical-align:middle"><span style="font-size:14px;font-weight:600;color:#0A2540">Revisión de documentos</span>&nbsp;&nbsp;<span style="font-size:11px;background:#fef3c7;color:#d97706;padding:3px 10px;border-radius:20px;font-weight:700">En proceso</span></td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:8px 0">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="font-size:20px;padding-right:12px;vertical-align:middle">📤</td>
          <td style="vertical-align:middle"><span style="font-size:14px;color:#64748b">Filing estatal</span>&nbsp;&nbsp;<span style="font-size:11px;background:#f1f5f9;color:#94a3b8;padding:3px 10px;border-radius:20px;font-weight:700">Pendiente</span></td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:8px 0">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="font-size:20px;padding-right:12px;vertical-align:middle">🔢</td>
          <td style="vertical-align:middle"><span style="font-size:14px;color:#64748b">Obtención de EIN</span>&nbsp;&nbsp;<span style="font-size:11px;background:#f1f5f9;color:#94a3b8;padding:3px 10px;border-radius:20px;font-weight:700">Pendiente</span></td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:8px 0">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="font-size:20px;padding-right:12px;vertical-align:middle">📦</td>
          <td style="vertical-align:middle"><span style="font-size:14px;color:#64748b">Entrega de documentos</span>&nbsp;&nbsp;<span style="font-size:11px;background:#f1f5f9;color:#94a3b8;padding:3px 10px;border-radius:20px;font-weight:700">Pendiente</span></td>
        </tr></table>
      </td></tr>
    </table>
  </td></tr>

  <!-- CTA -->
  <tr><td style="background:#ffffff;padding:36px 40px;text-align:center;border:1px solid #e2e8f0;border-top:none">
    <a href="${opts.portalUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:16px 44px;border-radius:8px;font-size:16px;font-weight:700;text-decoration:none;letter-spacing:0.3px">Acceder a mi portal →</a>
    <p style="margin:28px 0 6px;font-size:13px;color:#64748b">¿Tienes preguntas? Estamos aquí para ayudarte:</p>
    <p style="margin:0;font-size:13px">
      <a href="mailto:soporte@creatuempresausa.com" style="color:#2563eb;text-decoration:none;font-weight:600">soporte@creatuempresausa.com</a>
      &nbsp;&nbsp;·&nbsp;&nbsp;
      <a href="https://wa.me/19046248859" style="color:#16a34a;text-decoration:none;font-weight:700">💬 WhatsApp</a>
    </p>
  </td></tr>

  <!-- FOOTER -->
  <tr><td style="background:#0A2540;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center">
    <p style="margin:0 0 4px;font-size:12px;color:#64748b">© 2026 CreaTuEmpresaUSA · Todos los derechos reservados</p>
    <p style="margin:0;font-size:11px;color:#334155">Este email fue enviado a ${opts.customerEmail} por haber realizado una compra en CreaTuEmpresaUSA.</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

async function sendWelcomeEmail(opts: {
  customerName: string
  customerEmail: string
  companyName?: string
  stateName?: string
  packageName: string
  amountTotal: number
  orderRef: string
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://creatuempresausa.com'
  try {
    const { error } = await resend.emails.send({
      from: 'CreaTuEmpresaUSA <noreply@creatuempresausa.com>',
      replyTo: 'soporte@creatuempresausa.com',
      to: opts.customerEmail,
      subject: `Tu empresa en EE.UU. está en camino 🚀`,
      html: buildWelcomeEmailHtml({
        customerName: opts.customerName,
        customerEmail: opts.customerEmail,
        companyName:  opts.companyName ?? opts.customerName + ' LLC',
        stateName:    opts.stateName ?? 'Wyoming (WY)',
        packageName:  opts.packageName,
        amountTotal:  opts.amountTotal,
        orderRef:     opts.orderRef,
        portalUrl:    appUrl + '/login',
      }),
    })
    if (error) console.error('[webhook] Resend error:', error)
    else console.log('[webhook] Welcome email sent to:', opts.customerEmail)
  } catch (err) {
    console.error('[webhook] Failed to send welcome email:', err)
  }
}

function formatWhatsAppNumber(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  // Strip everything except digits and leading +
  const digits = trimmed.replace(/[^\d+]/g, '')
  if (!digits) return null
  // Already valid E.164 (starts with + and has 10+ digits)
  if (digits.startsWith('+') && digits.length >= 11) return `whatsapp:${digits}`
  const bare = digits.replace(/^\+/, '')
  // 10-digit US number (no country code) → prepend +1
  if (bare.length === 10) return `whatsapp:+1${bare}`
  // 11-digit starting with 1 → US/Canada, add +
  if (bare.length === 11 && bare.startsWith('1')) return `whatsapp:+${bare}`
  // Any other 10+ digit string → assume already has country code, add +
  if (bare.length >= 10) return `whatsapp:+${bare}`
  return null
}

async function sendWhatsApp(opts: {
  phone: string
  customerName: string
  companyName: string
  stateName: string
}): Promise<{ success: boolean; to: string | null; sid?: string; error?: string; skipReason?: string }> {
  console.log('[whatsapp] sendWhatsApp called — raw phone:', opts.phone)

  const to = formatWhatsAppNumber(opts.phone)
  console.log('[whatsapp] formatted to:', to)
  if (!to) {
    console.warn('[whatsapp] SKIP — phone could not be formatted to E.164:', opts.phone)
    return { success: false, to: null, skipReason: `Número inválido: "${opts.phone}"` }
  }

  // Sandbox: whatsapp:+14155238886  |  Production: set TWILIO_WHATSAPP_FROM in Vercel
  const from = process.env.TWILIO_WHATSAPP_FROM ?? 'whatsapp:+14155238886'
  const sid  = process.env.TWILIO_ACCOUNT_SID
  const auth = process.env.TWILIO_AUTH_TOKEN
  console.log('[whatsapp] from:', from, '| sid present:', !!sid, '| auth present:', !!auth)
  if (!sid || !auth) {
    console.warn('[whatsapp] SKIP — TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN missing')
    return { success: false, to, skipReason: 'Variables TWILIO_ACCOUNT_SID o TWILIO_AUTH_TOKEN no configuradas' }
  }

  const msgBody =
    `Hola ${opts.customerName}! 🎉 Bienvenido a CreaTuEmpresaUSA.\n\n` +
    `Tu orden para *${opts.companyName}* en *${opts.stateName}* ha sido recibida exitosamente.\n\n` +
    `Nuestro equipo comenzará a procesar tu caso en las próximas 24 horas.\n\n` +
    `Accede a tu portal: https://creatuempresausa.com/login\n\n` +
    `¿Tienes alguna pregunta? Estamos aquí para ayudarte.\n\n` +
    `— Equipo CreaTuEmpresaUSA`

  try {
    const client = twilio(sid, auth)
    console.log('[whatsapp] Sending message — from:', from, '| to:', to)
    const msg = await client.messages.create({ from, to, body: msgBody })
    console.log('[whatsapp] SUCCESS — sid:', msg.sid, '| status:', msg.status, '| to:', to)
    return { success: true, to, sid: msg.sid }
  } catch (err: any) {
    console.error('[whatsapp] FAILED — code:', err?.code, '| status:', err?.status, '| message:', err?.message)
    return { success: false, to, error: `code:${err?.code} status:${err?.status} — ${err?.message}` }
  }
}

// Service-role client — bypasses RLS for webhook writes
function adminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Upsert a payment record from a Stripe invoice object
async function upsertPayment(supabase: ReturnType<typeof adminClient>, invoice: Stripe.Invoice) {
  if (!invoice.metadata?.company_id) return

  const lineItems = invoice.lines.data.map((line) => ({
    description: line.description ?? '',
    amount:      line.amount,
    currency:    line.currency,
  }))

  await supabase.from('payments').upsert(
    {
      company_id:           invoice.metadata.company_id,
      stripe_invoice_id:    invoice.id,
      stripe_payment_intent: typeof invoice.payment_intent === 'string'
                              ? invoice.payment_intent
                              : invoice.payment_intent?.id ?? null,
      stripe_customer_id:   typeof invoice.customer === 'string'
                              ? invoice.customer
                              : invoice.customer?.id ?? null,
      amount_paid:          invoice.amount_paid,
      amount_due:           invoice.amount_due,
      currency:             invoice.currency,
      invoice_number:       invoice.number ?? null,
      description:          invoice.description ?? null,
      status:               invoice.status ?? 'open',
      invoice_pdf_url:      invoice.invoice_pdf ?? null,
      hosted_invoice_url:   invoice.hosted_invoice_url ?? null,
      line_items:           lineItems,
      period_start:         invoice.period_start
                              ? new Date(invoice.period_start * 1000).toISOString()
                              : null,
      period_end:           invoice.period_end
                              ? new Date(invoice.period_end * 1000).toISOString()
                              : null,
      due_date:             invoice.due_date
                              ? new Date(invoice.due_date * 1000).toISOString()
                              : null,
      paid_at:              invoice.status_transitions?.paid_at
                              ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
                              : null,
    },
    { onConflict: 'stripe_invoice_id' }
  )
}

export async function POST(request: NextRequest) {
  const body      = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  console.log('[webhook] env check — TWILIO_ACCOUNT_SID:', !!process.env.TWILIO_ACCOUNT_SID, '| TWILIO_AUTH_TOKEN:', !!process.env.TWILIO_AUTH_TOKEN, '| TWILIO_WHATSAPP_FROM:', process.env.TWILIO_WHATSAPP_FROM ?? '(fallback sandbox)')

  const supabase = adminClient()

  try {
    switch (event.type) {

      // ── Checkout completed ───────────────────────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.customer && session.metadata?.company_id) {
          // Existing client: link Stripe customer to company
          await supabase
            .from('companies')
            .update({
              stripe_customer_id: session.customer as string,
              stripe_session_id:  session.id,
            })
            .eq('id', session.metadata.company_id)

          if (session.invoice) {
            const invoice = await stripe.invoices.retrieve(
              typeof session.invoice === 'string' ? session.invoice : session.invoice.id,
              { expand: ['lines', 'status_transitions'] }
            )
            if (!invoice.metadata?.company_id) {
              await stripe.invoices.update(invoice.id, {
                metadata: { ...invoice.metadata, company_id: session.metadata.company_id },
              })
              invoice.metadata = { ...invoice.metadata, company_id: session.metadata.company_id }
            }
            await upsertPayment(supabase, invoice)
          }

        } else {
          // New client from landing page: auto-create in CRM
          const email       = session.customer_details?.email ?? ''
          const fullName    = session.customer_details?.name  ?? 'Cliente'
          const amountTotal = session.amount_total ?? 0

          // Parse client_reference_id — format: "ta_<ISO>||ph_<phone>" (each part optional)
          const clientRef  = session.client_reference_id ?? ''
          console.log('[webhook] client_reference_id raw:', clientRef)
          const refDecoded = (() => { try { return decodeURIComponent(clientRef) } catch { return clientRef } })()
          console.log('[webhook] client_reference_id decoded:', refDecoded)
          const refParts   = refDecoded.split('||')
          const termsAcceptedAt = (() => {
            const part = refParts.find(p => p.startsWith('ta_'))
            if (!part) return null
            try { return new Date(part.slice(3)).toISOString() } catch { return null }
          })()
          const phoneFromRef = (() => {
            const part = refParts.find(p => p.startsWith('ph_'))
            return part ? part.slice(3) : null
          })()
          console.log('[webhook] termsAcceptedAt:', termsAcceptedAt, '| phoneFromRef:', phoneFromRef)

          const packageMap: Record<number, string> = {
            25900: 'starter',
            29900: 'starter',
            49900: 'professional',
            79900: 'premium',
          }
          const pkg = packageMap[amountTotal] ?? 'professional'

          if (email) {
            // 1. Check if user already exists
            const { data: existingUsers } = await supabase
              .from('users')
              .select('id')
              .eq('email', email)
              .limit(1)

            let userId: string | undefined

            if (existingUsers && existingUsers.length > 0) {
              userId = existingUsers[0].id
            } else {
              // Create auth user and send password setup email
              const { data: authData } = await supabase.auth.admin.createUser({
                email,
                email_confirm: true,
                user_metadata: { full_name: fullName },
              })
              // Send magic link so client can set password and access portal
              if (authData?.user?.id) {
                await supabase.auth.admin.generateLink({
                  type: 'recovery',
                  email,
                  options: {
                    redirectTo: (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000') + '/dashboard',
                  },
                })
              }
              userId = authData?.user?.id
            }

            if (userId) {
              // 2. Create client record (only columns that exist)
              const { data: clientData, error: clientError } = await supabase
                .from('clients')
                .upsert({
                  user_id:          userId,
                  phone:            session.customer_details?.phone ?? '',
                  country:          session.customer_details?.address?.country ?? '',
                  ...(termsAcceptedAt ? { terms_accepted_at: termsAcceptedAt } : {}),
                }, { onConflict: 'user_id' })
                .select('id')
                .single()

              if (clientData?.id) {
                // 3. Create company record
                const orderRef = 'CTE-' + Date.now().toString(36).toUpperCase()
                const { data: companyData, error: companyError } = await supabase
                  .from('companies')
                  .insert({
                    client_id:          clientData.id,
                    company_name:       fullName + ' LLC',
                    state:              'WY',
                    status:             'name_check',
                    package:            pkg,
                    stripe_customer_id: session.customer ?? '',
                    stripe_session_id:  session.id,
                    order_reference:    orderRef,
                  })
                  .select('id')
                  .single()

                if (companyError) {
                  console.error('[webhook] Company insert error:', companyError)
                } else {
                  console.log('[webhook] New client created:', email, '| pkg:', pkg, '| company:', companyData?.id)

                // Pull wizard data from pending_orders and enrich company record
                let wizardCompanyName: string | undefined
                let wizardStateName: string | undefined
                if (companyData?.id) {
                  const { data: pendingOrder } = await supabase
                    .from('pending_orders')
                    .select('id, payload')
                    .eq('email', email.toLowerCase().trim())
                    .is('claimed_at', null)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle()

                  if (pendingOrder?.payload) {
                    const p = pendingOrder.payload as any
                    const wizardUpdate: Record<string, any> = {}
                    if (p.company_name)     wizardUpdate.company_name     = p.company_name
                    if (p.entity_type)      wizardUpdate.entity_type      = p.entity_type
                    if (p.state_code)       wizardUpdate.state            = p.state_code
                    if (p.alternate_name_1) wizardUpdate.alternate_name_1 = p.alternate_name_1
                    if (p.alternate_name_2) wizardUpdate.alternate_name_2 = p.alternate_name_2
                    if (p.members_count)    wizardUpdate.members_count    = p.members_count
                    if (p.business_activity) wizardUpdate.business_activity = p.business_activity
                    // Detect address addon purchased in wizard
                    const addonIds: string[] = p.addons
                      ? Object.keys(p.addons)
                      : []
                    const hasAddrStd = addonIds.includes('addrStd')
                    const hasAddrVip = addonIds.includes('addrVip')
                    if (hasAddrStd || hasAddrVip) {
                      wizardUpdate.address_service_enabled = true
                      wizardUpdate.address_status          = 'pending'
                      wizardUpdate.address_plan_type       = hasAddrVip ? 'vip' : 'standard'
                      wizardUpdate.address_service_type    = hasAddrVip ? 'vip' : 'standard'
                      wizardUpdate.address_provider        = 'VPM'
                      const addrAddon = p.addons[hasAddrVip ? 'addrVip' : 'addrStd']
                      wizardUpdate.address_service_period  = addrAddon?.period === '/año' ? 'annual' : 'monthly'
                      console.log('[webhook] Address addon detected:', wizardUpdate.address_plan_type, wizardUpdate.address_service_period)
                    }
                    if (Object.keys(wizardUpdate).length > 0) {
                      await supabase.from('companies').update(wizardUpdate).eq('id', companyData.id)
                      console.log('[webhook] Wizard data applied to company:', wizardUpdate)
                    }
                    // Capture for welcome email
                    wizardCompanyName = p.company_name
                    wizardStateName   = p.state_name ?? p.state_code
                    // Mark order as claimed
                    await supabase
                      .from('pending_orders')
                      .update({ claimed_at: new Date().toISOString() })
                      .eq('id', pendingOrder.id)
                  } else {
                    console.log('[webhook] No pending wizard order found for:', email)
                  }
                }

                // Send welcome email directly via Resend
                const pkgNames: Record<string, string> = {
                  starter: 'Plan Starter', professional: 'Plan Professional', premium: 'Plan Premium'
                }
                await sendWelcomeEmail({
                  customerName:  fullName,
                  customerEmail: email,
                  companyName:   wizardCompanyName,
                  stateName:     wizardStateName,
                  packageName:   pkgNames[pkg] ?? pkg,
                  amountTotal:   amountTotal / 100,
                  orderRef,
                })

                // Save welcome email to mail_items for client portal visibility
                if (companyData?.id) {
                  await supabase.from('mail_items').insert({
                    company_id:  companyData.id,
                    title:       '¡Tu empresa en EE.UU. está en camino! 🚀',
                    sender:      'CreaTuEmpresaUSA <noreply@creatuempresausa.com>',
                    description: 'Email de bienvenida enviado automáticamente al completar tu orden.',
                    category:    'general',
                    is_read:     false,
                  })
                }

                // Send WhatsApp notification — prefer phone from client_reference_id (wizard), fallback to Stripe
                const phone = phoneFromRef || session.metadata?.phone || session.customer_details?.phone || ''
                console.log('[webhook] phone sources — ref:', phoneFromRef, '| metadata:', session.metadata?.phone, '| details:', session.customer_details?.phone)
                console.log('[webhook] final phone for WhatsApp:', phone || '(none — skipping)')
                if (phone) {
                  const waResult = await sendWhatsApp({
                    phone,
                    customerName: fullName,
                    companyName:  companyData?.id ? (fullName + ' LLC') : fullName,
                    stateName:    session.metadata?.state_name || 'USA',
                  })
                  // Persist WhatsApp result to mail_items for visibility in admin
                  if (companyData?.id) {
                    const waTitle = waResult.success ? 'WhatsApp enviado ✅' : 'WhatsApp falló ❌'
                    const waDesc  = waResult.success
                      ? `Mensaje enviado a ${waResult.to} — SID: ${waResult.sid}`
                      : waResult.skipReason
                        ? `Omitido — ${waResult.skipReason}`
                        : `Error al enviar a ${waResult.to ?? phone} — ${waResult.error}`
                    await supabase.from('mail_items').insert({
                      company_id:  companyData.id,
                      title:       waTitle,
                      sender:      'sistema@creatuempresausa.com',
                      description: waDesc,
                      category:    'general',
                      is_read:     false,
                    })
                  }
                } else {
                  // Log skip to mail_items so admin can see phone was missing
                  if (companyData?.id) {
                    await supabase.from('mail_items').insert({
                      company_id:  companyData.id,
                      title:       'WhatsApp no enviado — sin teléfono',
                      sender:      'sistema@creatuempresausa.com',
                      description: 'No se encontró número de teléfono en client_reference_id ni en los datos de Stripe.',
                      category:    'general',
                      is_read:     false,
                    })
                  }
                }

                // ── Agent System: registrar tarea y log para el agente intake ──
                await supabase.from('agent_tasks').insert({
                  agent_id:  'intake',
                  case_id:   companyData.id,
                  task_type: 'process_new_client',
                  status:    'pending',
                  priority:  1,
                  payload: {
                    case_id:           companyData.id,
                    client_id:         clientData.id,
                    stripe_session_id: session.id,
                    amount:            amountTotal / 100,
                    currency:          session.currency ?? 'usd',
                    customer_email:    email,
                    created_at:        new Date().toISOString(),
                  },
                })

                await supabase.from('agent_logs').insert({
                  agent_id:           'intake',
                  case_id:            companyData.id,
                  action:             'new_client_detected',
                  status:             'pending_review',
                  human_review_level: 'H1',
                  input_summary: {
                    stripe_session_id: session.id,
                    customer_email:    email,
                    amount:            amountTotal / 100,
                  },
                  output_summary: {},
                })
                console.log('[webhook] Agent intake task + log creados para case:', companyData.id)

                }
              }
            }
          }
        }
        break
      }

      // ── Invoice paid ─────────────────────────────────────────────────────
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        if (!invoice.metadata?.company_id) {
          // Try to find company via customer ID
          const { data: company } = await supabase
            .from('companies')
            .select('id')
            .eq('stripe_customer_id', typeof invoice.customer === 'string'
              ? invoice.customer
              : invoice.customer?.id ?? '')
            .maybeSingle()

          if (company) {
            invoice.metadata = { ...invoice.metadata, company_id: company.id }
          }
        }
        await upsertPayment(supabase, invoice)
        break
      }

      // ── Invoice updated (status change) ──────────────────────────────────
      case 'invoice.updated':
      case 'invoice.finalized': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.metadata?.company_id) {
          await upsertPayment(supabase, invoice)
        }
        break
      }

      // ── Invoice payment failed ────────────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.error(`Payment failed — invoice: ${invoice.id}, customer: ${invoice.customer}`)
        if (invoice.metadata?.company_id) {
          await upsertPayment(supabase, invoice)
        }
        break
      }

      // ── Subscription events ───────────────────────────────────────────────
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        console.log(`Subscription ${sub.id} updated — status: ${sub.status}`)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        console.log(`Subscription ${sub.id} cancelled for customer ${sub.customer}`)
        break
      }

      default:
        // Silently ignore unhandled events
        break
    }
  } catch (err) {
    console.error('Webhook processing error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
