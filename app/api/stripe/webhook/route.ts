import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { Resend } from 'resend'
import { buildWelcomeEmailHtml } from '@/lib/welcome/email-html'
import { sendWelcomeWhatsApp, persistWhatsAppResult } from '@/lib/welcome/whatsapp'
import { runIntake } from '@/lib/agents/intake/service'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Return the value trimmed if non-empty, otherwise undefined.
 * Used for metadata-first resolution: empty string == missing.
 */
function pick(v: string | null | undefined): string | undefined {
  const t = v?.trim()
  return t ? t : undefined
}

async function sendWelcomeEmail(opts: {
  customerName:  string
  customerEmail: string
  companyName:   string
  stateName:     string
  packageName:   string
  amountTotal:   number
  orderRef:      string
  addons?:       { label: string; price: number }[]
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://creatuempresausa.com'
  try {
    const { error } = await resend.emails.send({
      from:    'CreaTuEmpresaUSA <noreply@creatuempresausa.com>',
      replyTo: 'soporte@creatuempresausa.com',
      to:      opts.customerEmail,
      subject: `Tu empresa en EE.UU. está en camino 🚀`,
      html:    buildWelcomeEmailHtml({
        customerName: opts.customerName,
        customerEmail: opts.customerEmail,
        companyName:  opts.companyName,
        stateName:    opts.stateName,
        packageName:  opts.packageName,
        amountTotal:  opts.amountTotal,
        orderRef:     opts.orderRef,
        portalUrl:    appUrl + '/dashboard',
        addons:       opts.addons,
      }),
    })
    if (error) console.error('[webhook] Resend error:', error)
    else       console.log('[webhook] Welcome email sent to:', opts.customerEmail)
  } catch (err) {
    console.error('[webhook] Failed to send welcome email:', err)
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

  let agentRunId: string | null = null

  try {
    switch (event.type) {

      // ── Checkout completed ───────────────────────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        let promptVersionLabel: string | null = null

        // ── Idempotency gate ────────────────────────────────────────────────
        // Fast-path dedup: check for an existing completed or in-flight run.
        // The UNIQUE (agent_id, source_ref_id) constraint on agent_runs is the
        // final race-condition guard at the DB level.
        {
          const { data: existingRun } = await supabase
            .from('agent_runs')
            .select('id, status, retry_count')
            .eq('agent_id', 'intake')
            .eq('source_ref_id', session.id)
            .maybeSingle()

          if (existingRun?.status === 'completed') {
            console.log('[webhook] Session already processed — skipping:', session.id)
            await supabase.from('agent_logs').insert({
              agent_id:           'intake',
              action:             'checkout_session_skipped_duplicate',
              status:             'success',
              human_review_level: 'H1',
              input_summary:  { stripe_session_id: session.id, reason: 'already_processed' },
              output_summary: { existing_run_id: existingRun.id },
            })
            await supabase.from('audit_logs').insert({
              entity_type: 'agent_run',
              entity_id:   session.id,
              action:      'duplicate_prevented',
              actor:       'webhook',
              metadata:    { stripe_session_id: session.id, existing_run_id: existingRun.id },
            })
            break
          }

          if (existingRun?.status === 'running') {
            console.warn('[webhook] Run in-flight for session — possible race condition:', session.id)
            break
          }

          // Fetch active intake prompt for traceability (stored in agent_run)
          const { data: promptVersion } = await supabase
            .from('prompt_versions')
            .select('version_label')
            .eq('agent_id', 'intake')
            .eq('is_active', true)
            .maybeSingle()
          promptVersionLabel = promptVersion?.version_label ?? null

          // Insert new run, or update failed/pending run back to 'running' and increment retry_count.
          const { data: runData, error: runInsertError } = await supabase
            .from('agent_runs')
            .upsert({
              ...(existingRun ? { id: existingRun.id } : {}),
              agent_id:       'intake',
              version:        '2.0',
              status:         'running',
              trigger_type:   'webhook',
              source_ref_id:  session.id,
              retry_count:    existingRun ? existingRun.retry_count + 1 : 0,
              started_at:     new Date().toISOString(),
              input_raw_json: {
                stripe_session_id: session.id,
                payment_intent:    session.payment_intent ?? null,
                amount_total:      session.amount_total,
                currency:          session.currency,
                customer_email:    session.customer_details?.email ?? null,
              },
              input_normalized_json: { prompt_version: promptVersionLabel },
            }, { onConflict: 'agent_id,source_ref_id' })
            .select('id')
            .single()

          if (runInsertError) {
            console.error('[webhook] Failed to create agent_run — continuing anyway:', runInsertError)
          } else {
            agentRunId = runData.id
            await supabase.from('audit_logs').insert({
              entity_type: 'agent_run',
              entity_id:   agentRunId,
              action:      'intake_started',
              actor:       'webhook',
              metadata:    { stripe_session_id: session.id, prompt_version: promptVersionLabel },
            })
          }
        }
        // ───────────────────────────────────────────────────────────────────

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
          const amountTotal = session.amount_total ?? 0

          // ── Identity resolution — metadata beats Stripe defaults ──────
          // Precedence for each field is documented inline.
          // pending_orders values (wizardCompanyName etc.) are resolved later
          // and will further override these where available.
          // pick() treats empty string the same as missing — prevents '' falling through to Stripe cardholder
          const fullName = (
            pick(session.metadata?.client_full_name)    // 1. metadata (non-empty only)
            || pick(session.customer_details?.name)     // 2. Stripe checkout (non-empty only)
            || 'Cliente'                                // 3. hard fallback
          )
          const email = (
            session.metadata?.client_email              // 1. our metadata
            || session.customer_email                   // 2. Stripe session-level email
            || session.customer_details?.email          // 3. Stripe checkout form
            || ''                                       // 4. empty (will be caught later)
          )
          // Phone is resolved later (after client_reference_id is parsed)

          // ── AUDIT LOG: raw sources + resolved identity ─────────────────
          console.log('[webhook] ══════════════════════════════════════════')
          console.log('[webhook] NEW CLIENT SESSION — session:', session.id)
          console.log('[webhook] raw  customer_details.email  :', session.customer_details?.email || '(empty)')
          console.log('[webhook] raw  customer_details.name   :', session.customer_details?.name  || '(empty)')
          console.log('[webhook] meta client_email            :', session.metadata?.client_email     || '(empty)')
          console.log('[webhook] meta client_full_name        :', session.metadata?.client_full_name || '(empty)')
          console.log('[webhook] meta company_name            :', session.metadata?.company_name     || '(empty)')
          console.log('[webhook] meta state_code              :', session.metadata?.state_code       || '(empty)')
          console.log('[webhook] meta state_name              :', session.metadata?.state_name       || '(empty)')
          console.log('[webhook] meta plan                    :', session.metadata?.plan             || '(empty)')
          console.log('[webhook] resolved fullName            :', fullName)
          console.log('[webhook] resolved email               :', email || '(empty)')
          console.log('[webhook] ══════════════════════════════════════════')

          // Audit: payment_received — use resolved email
          await supabase.from('audit_logs').insert({
            entity_type: 'payment',
            entity_id:   session.id,
            action:      'payment_received',
            actor:       'webhook',
            metadata: {
              amount_total:   session.amount_total,
              currency:       session.currency,
              customer_email: email || null,
            },
          })

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

          // TODO [Phase 2]: Normalize internal plan IDs across the entire codebase to:
          //   starter | pro | premium
          // Currently the funnel uses 'basic' and 'growth' as internal IDs.
          // The DB package column accepts 'starter', 'professional', 'premium'.
          // This mapping bridges the gap until the rename is done end-to-end.

          // Map wizard internal plan IDs → DB package column values (companies_package_check)
          // DB accepts: 'starter' | 'professional' | 'premium'
          const planToDbPackage: Record<string, string> = {
            basic:    'starter',
            growth:   'professional',
            premium:  'premium',
            // legacy aliases (in case old sessions arrive)
            starter:      'starter',
            professional: 'professional',
          }
          // Amount-based fallback (last resort) — keyed to DB values
          const amountToDbPackage: Record<number, string> = {
            49900:  'starter',
            79900:  'professional',
            120000: 'premium',
          }
          const rawPlan = session.metadata?.plan || ''
          const pkg = planToDbPackage[rawPlan] || amountToDbPackage[amountTotal] || 'starter'

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
              console.log('[webhook] existing user flow - userId:', userId)
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

              console.log('[webhook] client upsert result:', clientData?.id, clientError?.message)
              if (clientData?.id) {
                // 3. Create company record
                const orderRef = 'CTE-' + Date.now().toString(36).toUpperCase()
                const insertCompanyName = session.metadata?.company_name || (fullName + ' LLC')
                const insertStateCode   = session.metadata?.state_code   || ''
                console.log('[webhook] company INSERT payload →', JSON.stringify({
                  company_name:  insertCompanyName,
                  state:         insertStateCode,
                  package_db:    pkg,
                  metadata_plan: rawPlan || '(none)',
                  source:        session.metadata?.company_name ? 'stripe_metadata' : 'fallback',
                }))
                const { data: companyData, error: companyError } = await supabase
                  .from('companies')
                  .insert({
                    client_id:          clientData.id,
                    company_name:       insertCompanyName,
                    state:              insertStateCode,
                    status:             'name_check',
                    package:            pkg,
                    stripe_customer_id: session.customer ?? '',
                    stripe_session_id:  session.id,
                    order_reference:    orderRef,
                  })
                  .select('id')
                  .single()

                console.log('[webhook] company insert result:', companyData?.id, companyError?.message)
                if (companyError) {
                  console.error('[webhook] Company insert error:', companyError)
                } else {
                  console.log('[webhook] New client created:', email, '| pkg:', pkg, '| company:', companyData?.id)

                // Pull wizard data from pending_orders and enrich company record
                let wizardCompanyName: string | undefined
                let wizardFullName:    string | undefined
                let wizardStateName:   string | undefined
                let wizardPhone:       string | undefined
                let wizardAddons:      { label: string; price: number }[] | undefined
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
                    // Capture for welcome email / WhatsApp
                    wizardCompanyName = pick(p.company_name)
                    wizardFullName    = pick(p.customer?.full_name)
                    wizardStateName   = p.state_name ?? p.state_code
                    wizardPhone       = p.customer?.phone || undefined
                    if (p.addons && typeof p.addons === 'object') {
                      wizardAddons = Object.values(p.addons as Record<string, any>)
                        .filter((a: any) => a?.label && a?.price)
                        .map((a: any) => ({ label: a.label, price: a.price }))
                    }
                    // Mark order as claimed
                    await supabase
                      .from('pending_orders')
                      .update({ claimed_at: new Date().toISOString() })
                      .eq('id', pendingOrder.id)
                  } else {
                    console.log('[webhook] No pending wizard order found for email:', email, '— falling back to Stripe metadata')
                  }
                }

                // ── Resolve final values with explicit source tracking ───────
                // Precedence: pending_orders > metadata > Stripe > fallback
                const finalClientName =
                  pick(session.metadata?.client_full_name) ||  // 1. metadata
                  wizardFullName                            ||  // 2. pending_orders
                  pick(session.customer_details?.name)     ||  // 3. Stripe cardholder
                  'Cliente'                                     // 4. neutral fallback

                const finalCompanyName =
                  wizardCompanyName                             ||  // 1. pending_orders
                  pick(session.metadata?.company_name)         ||  // 2. metadata
                  (finalClientName + ' LLC')                     // 3. derived

                const finalStateCode =
                  pick(session.metadata?.state_code) || ''

                const finalStateName =
                  wizardStateName                               ||  // 1. pending_orders
                  pick(session.metadata?.state_name)           ||  // 2. metadata state_name
                  pick(session.metadata?.state_code)           ||  // 3. metadata state_code (fallback display)
                  ''                                               // 4. empty — never WY

                // Source logs — proves exactly where each value came from
                console.log('[welcome] final_client_name       :', finalClientName)
                console.log('[welcome] final_client_name_source:', pick(session.metadata?.client_full_name) ? 'metadata' : wizardFullName ? 'pending_orders' : pick(session.customer_details?.name) ? 'stripe_cardholder' : 'fallback')
                console.log('[welcome] final_client_email      :', email)
                console.log('[welcome] final_client_email_src  :', pick(session.metadata?.client_email) ? 'metadata' : session.customer_email ? 'stripe_session' : 'stripe_details')
                console.log('[welcome] final_company_name      :', finalCompanyName)
                console.log('[welcome] final_company_source    :', wizardCompanyName ? 'pending_orders' : pick(session.metadata?.company_name) ? 'metadata' : 'derived_from_name')
                console.log('[welcome] final_state_code        :', finalStateCode || '(empty)')
                console.log('[welcome] final_state_name        :', finalStateName || '(empty)')
                console.log('[welcome] final_state_source      :', wizardStateName ? 'pending_orders' : pick(session.metadata?.state_name) ? 'metadata_state_name' : pick(session.metadata?.state_code) ? 'metadata_state_code' : 'empty')
                console.log('[welcome] final_plan              :', pkg)
                console.log('[welcome] final_plan_source       :', rawPlan ? 'metadata' : 'amount_fallback')

                // Send welcome email directly via Resend
                // DB package values → visible customer-facing labels (never show Basic/Growth)
                const pkgNames: Record<string, string> = {
                  starter:      'Plan Starter',
                  professional: 'Plan Pro',
                  premium:      'Plan Premium',
                }
                await sendWelcomeEmail({
                  customerName:  finalClientName,
                  customerEmail: email,
                  companyName:   finalCompanyName,
                  stateName:     finalStateName,
                  packageName:   pkgNames[pkg] ?? pkg,
                  amountTotal:   amountTotal / 100,
                  orderRef,
                  addons:        wizardAddons,
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

                // ── Phone resolution — metadata-first ───────────────────
                // Precedence: metadata > pending_orders > client_reference_id > Stripe form
                const phone = (
                  pick(session.metadata?.phone)           // 1. metadata
                  || wizardPhone                          // 2. pending_orders
                  || phoneFromRef                         // 3. client_reference_id
                  || session.customer_details?.phone      // 4. Stripe form (last resort)
                  || ''
                )
                console.log('[welcome] final_client_phone      :', phone || '(none)')
                console.log('[welcome] final_phone_source      :',
                  pick(session.metadata?.phone)      ? 'metadata'          :
                  wizardPhone                        ? 'pending_orders'    :
                  phoneFromRef                       ? 'client_reference_id' :
                  session.customer_details?.phone    ? 'stripe_details'    : 'none'
                )

                // ── Send WhatsApp via shared lib ─────────────────────────
                const waResult = await sendWelcomeWhatsApp({
                  phone,
                  customerName: finalClientName,
                  companyName:  finalCompanyName,
                  stateName:    finalStateName,
                })

                // ── Persist result via shared lib ────────────────────────
                if (companyData?.id) {
                  await persistWhatsAppResult(supabase, companyData.id, waResult, phone)

                  // Also log to mail_items for client portal visibility
                  const waTitle = waResult.success
                    ? 'WhatsApp enviado ✅'
                    : !waResult.send_attempted
                      ? `WhatsApp omitido — ${waResult.skip_reason}`
                      : `WhatsApp falló ❌ — código ${waResult.error_code}`
                  const waDesc = waResult.success
                    ? `Enviado a ${waResult.to} — SID: ${waResult.sid} — estado: ${waResult.status}`
                    : !waResult.send_attempted
                      ? `Omitido: ${waResult.skip_reason}`
                      : `Error al enviar a ${waResult.to ?? phone}: [${waResult.error_code}] ${waResult.error_message}`
                  await supabase.from('mail_items').insert({
                    company_id:  companyData.id,
                    title:       waTitle,
                    sender:      'sistema@creatuempresausa.com',
                    description: waDesc,
                    category:    'general',
                    is_read:     false,
                  })
                }

                // ── cases: insert first to capture cases.id for downstream refs ──
                const { data: caseData, error: caseInsertError } = await supabase
                  .from('cases')
                  .insert({
                    agent_id:   'intake',
                    status:     'pending',
                    company_id: companyData.id,
                  })
                  .select('id')
                  .single()

                if (caseInsertError) {
                  console.error('[webhook] CASE INSERT FAILED:', JSON.stringify(caseInsertError))
                }

                const caseRef = caseData?.id ?? null

                // ── Intake LLM — generate normalized_output with full client context ──
                // Must complete BEFORE agent_tasks so downstream agents see normalized_output.
                if (caseRef) {
                  try {
                    const intakeResult = await runIntake(
                      {
                        caseId:      caseRef,
                        clientName:  finalClientName,
                        clientEmail: email,
                        phone,
                        companyName: finalCompanyName,
                        stateCode:   finalStateCode,
                        stateName:   finalStateName,
                        packageKey:  pkg,
                        amountUsd:   amountTotal / 100,
                        source:      pick(session.metadata?.source) || pick(session.metadata?.utm_source) || undefined,
                      },
                      supabase
                    )

                    // status 'in_progress' = intake complete, awaiting clasificador
                    // status 'pending'     = requires human review before proceeding
                    const caseStatus = intakeResult.data.requires_human_review ? 'pending' : 'in_progress'
                    const { error: caseUpdateError } = await supabase
                      .from('cases')
                      .update({
                        normalized_output:     intakeResult.data,
                        status:                caseStatus,
                        confidence_score:      intakeResult.data.confidence_score,
                        requires_human_review: intakeResult.data.requires_human_review,
                        normalization_applied: intakeResult.normalized,
                        route_classification_pending: !intakeResult.data.requires_human_review,
                      })
                      .eq('id', caseRef)

                    if (caseUpdateError) {
                      console.error('[webhook] CASE UPDATE FAILED:', JSON.stringify(caseUpdateError))
                    } else if (intakeResult.normalized) {
                      console.warn('[webhook] Intake normalized (fallback applied) — issues:', intakeResult.issues)
                    } else {
                      console.log('[webhook] Intake OK — confidence:', intakeResult.data.confidence_score, '| score:', intakeResult.data.intake_score, '| service:', intakeResult.data.servicio_solicitado)
                    }
                  } catch (err) {
                    console.error('[webhook] Intake LLM call failed — case remains pending for human review:', err)
                    // Non-fatal: case row exists, human review catches it
                  }
                } else {
                  console.error('[webhook] caseRef is null — skipping runIntake. Check CASE INSERT error above.')
                }

                // Audit: case_created
                await supabase.from('audit_logs').insert({
                  entity_type: 'case',
                  entity_id:   caseRef,
                  action:      'case_created',
                  actor:       'webhook',
                  metadata:    { stripe_session_id: session.id, prompt_version: promptVersionLabel },
                })

                // ── agent_tasks ───────────────────────────────────────────────
                await supabase.from('agent_tasks').insert({
                  agent_id:  'intake',
                  case_id:   caseRef,
                  task_type: 'process_new_client',
                  status:    'pending',
                  priority:  1,
                  payload: {
                    case_id:           caseRef,
                    client_id:         clientData.id,
                    stripe_session_id: session.id,
                    amount:            amountTotal / 100,
                    currency:          session.currency ?? 'usd',
                    customer_email:    email,
                    created_at:        new Date().toISOString(),
                  },
                })

                // Audit: task_created (process_new_client)
                await supabase.from('audit_logs').insert({
                  entity_type: 'task',
                  entity_id:   caseRef,
                  action:      'task_created',
                  actor:       'webhook',
                  metadata:    { task_type: 'process_new_client', priority: 1, case_id: caseRef },
                })

                // ── agent_logs ────────────────────────────────────────────────
                await supabase.from('agent_logs').insert({
                  agent_id:           'intake',
                  case_id:            caseRef,
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
                console.log('[webhook] Agent intake task + log creados para case:', caseRef)

                // ── contacts: upsert = idempotent on stripe_session_id ────────
                await supabase.from('contacts').upsert({
                  full_name:          fullName,
                  email,
                  phone:              session.customer_details?.phone ?? '',
                  country:            session.customer_details?.address?.country ?? '',
                  stripe_customer_id: typeof session.customer === 'string' ? session.customer : '',
                  stripe_session_id:  session.id,
                }, { onConflict: 'stripe_session_id', ignoreDuplicates: true })

                // ── mark agent_run completed ──────────────────────────────────
                if (agentRunId) {
                  await supabase.from('agent_runs').update({
                    status:       'completed',
                    completed_at: new Date().toISOString(),
                  }).eq('id', agentRunId)
                }

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
    if (agentRunId) {
      await supabase.from('agent_runs').update({
        status:        'failed',
        completed_at:  new Date().toISOString(),
        error_message: err instanceof Error ? err.message : String(err),
      }).eq('id', agentRunId)
    }
    console.error('Webhook processing error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
