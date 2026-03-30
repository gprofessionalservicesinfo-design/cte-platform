import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

async function sendWelcomeEmail(opts: {
  customerName: string
  customerEmail: string
  packageName: string
  amountTotal: number
  orderRef: string
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://creatuempresausa.com'
  try {
    const { error } = await resend.emails.send({
      from: 'CreaTuEmpresaUSA <noreply@creatuempresausa.com>',
      to: opts.customerEmail,
      subject: `✅ Recibimos tu orden — ${opts.packageName} LLC Formation`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;background:#f8fafc">
          <div style="background:#0A2540;border-radius:16px;padding:40px;color:#fff;text-align:center;margin-bottom:24px">
            <div style="font-size:48px;margin-bottom:12px">🎉</div>
            <h1 style="font-size:24px;font-weight:800;margin:0 0 8px">Recibimos tu pago</h1>
            <p style="opacity:.75;margin:0">Tu caso fue creado exitosamente.</p>
          </div>
          <div style="background:#fff;border-radius:16px;padding:28px;margin-bottom:20px;border:1px solid #e2e8f0">
            <h2 style="font-size:16px;font-weight:700;color:#0A2540;margin:0 0 16px">Resumen del pedido</h2>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px 0;color:#64748b;font-size:14px;border-bottom:1px solid #f1f5f9">Cliente</td><td style="padding:8px 0;font-weight:600;color:#0A2540;font-size:14px;text-align:right;border-bottom:1px solid #f1f5f9">${opts.customerName}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;font-size:14px;border-bottom:1px solid #f1f5f9">Paquete</td><td style="padding:8px 0;font-weight:600;color:#0A2540;font-size:14px;text-align:right;border-bottom:1px solid #f1f5f9">${opts.packageName}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;font-size:14px;border-bottom:1px solid #f1f5f9">Monto pagado</td><td style="padding:8px 0;font-weight:600;color:#0A2540;font-size:14px;text-align:right;border-bottom:1px solid #f1f5f9">$${opts.amountTotal} USD</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Número de orden</td><td style="padding:8px 0;font-weight:700;color:#2563eb;font-size:14px;text-align:right">${opts.orderRef}</td></tr>
            </table>
          </div>
          <div style="background:#fff;border-radius:16px;padding:28px;margin-bottom:20px;border:1px solid #e2e8f0">
            <h2 style="font-size:16px;font-weight:700;color:#0A2540;margin:0 0 16px">Qué sigue</h2>
            <p style="padding:6px 0;font-size:14px;color:#16a34a;font-weight:700">✅ Pago recibido y caso creado</p>
            <p style="padding:6px 0;font-size:14px;color:#64748b">📋 Revisión de documentos (24-48 hrs)</p>
            <p style="padding:6px 0;font-size:14px;color:#64748b">📤 Filing estatal (3-7 días hábiles)</p>
            <p style="padding:6px 0;font-size:14px;color:#64748b">🔢 Obtención de EIN</p>
            <p style="padding:6px 0;font-size:14px;color:#64748b">📦 Entrega de documentos finales</p>
          </div>
          <div style="text-align:center;margin-bottom:16px">
            <a href="${appUrl}/login" style="display:inline-block;background:#0A2540;color:#fff;padding:14px 32px;border-radius:12px;font-weight:700;text-decoration:none;font-size:15px;margin-bottom:12px">🚀 Acceder a mi portal</a>
          </div>
          <div style="text-align:center;margin-bottom:24px">
            <a href="https://wa.me/19046248859" style="display:inline-block;background:#25D366;color:#fff;padding:14px 32px;border-radius:12px;font-weight:700;text-decoration:none;font-size:15px">💬 Hablar por WhatsApp</a>
          </div>
          <p style="text-align:center;color:#94a3b8;font-size:12px">CreaTuEmpresaUSA · Si tienes preguntas escríbenos por WhatsApp</p>
        </div>
      `,
    })
    if (error) console.error('[webhook] Resend error:', error)
    else console.log('[webhook] Welcome email sent to:', opts.customerEmail)
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

          // Extract terms acceptance timestamp from client_reference_id (ta_<ISO>)
          const clientRef      = session.client_reference_id ?? ''
          const termsAcceptedAt = clientRef.startsWith('ta_')
            ? (() => { try { return new Date(decodeURIComponent(clientRef.slice(3))).toISOString() } catch { return null } })()
            : null

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

                // Send welcome email directly via Resend
                const pkgNames: Record<string, string> = {
                  starter: 'Plan Starter', professional: 'Plan Professional', premium: 'Plan Premium'
                }
                await sendWelcomeEmail({
                  customerName:  fullName,
                  customerEmail: email,
                  packageName:   pkgNames[pkg] ?? pkg,
                  amountTotal:   amountTotal / 100,
                  orderRef,
                })
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
