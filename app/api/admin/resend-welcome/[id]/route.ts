import { NextRequest, NextResponse } from 'next/server'
import { createAdminServerClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { buildWelcomeEmailHtml } from '@/lib/welcome/email-html'

const resend = new Resend(process.env.RESEND_API_KEY)

// Service-role client — bypasses RLS, guaranteed for writes
function adminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminServerClient()

  const { data: company, error } = await supabase
    .from('companies')
    .select(`
      id, company_name, state, package, order_reference,
      clients ( users ( full_name, email ) )
    `)
    .eq('id', params.id)
    .single()

  if (error || !company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  }

  const client        = (company as any).clients
  const user          = client?.users
  const customerEmail = user?.email
  const customerName  = user?.full_name || 'Cliente'

  if (!customerEmail) {
    return NextResponse.json({ error: 'No email found for client' }, { status: 400 })
  }

  // Resolve display values — never hardcode state fallback
  const companyName = (company as any).company_name || customerName + ' LLC'
  const stateName   = (company as any).state || ''   // empty if unknown, never 'Wyoming (WY)'
  const orderRef    = (company as any).order_reference || undefined

  const pkgNames: Record<string, string> = {
    starter:      'Plan Starter',
    professional: 'Plan Pro',
    premium:      'Plan Premium',
  }
  const packageName = pkgNames[(company as any).package] ?? (company as any).package ?? 'Plan Starter'

  console.log('[resend-welcome] company_id:    ', company.id)
  console.log('[resend-welcome] company_name:  ', companyName)
  console.log('[resend-welcome] state_name:    ', stateName || '(empty)')
  console.log('[resend-welcome] customer_name: ', customerName)
  console.log('[resend-welcome] customer_email:', customerEmail)
  console.log('[resend-welcome] package:       ', packageName)

  const toEmail = process.env.NODE_ENV === 'development'
    ? 'gprofessionalservices.info@gmail.com'
    : customerEmail

  try {
    await resend.emails.send({
      from:    'CreaTuEmpresaUSA <noreply@creatuempresausa.com>',
      replyTo: 'soporte@creatuempresausa.com',
      to:      toEmail,
      subject: `Tu empresa en EE.UU. está en marcha 🚀`,
      html:    buildWelcomeEmailHtml({
        customerName,
        customerEmail,
        companyName,
        stateName,
        packageName,
        orderRef,
        portalUrl: 'https://creatuempresausa.com/dashboard',
      }),
    })
    console.log('[resend-welcome] email sent to:', toEmail)

    // Save to mail_items — use service-role client to bypass RLS
    const db = adminClient()
    const { error: mailError } = await db.from('mail_items').insert({
      company_id:  company.id,
      title:       '¡Tu empresa en EE.UU. está en marcha! 🚀',
      sender:      'CreaTuEmpresaUSA <noreply@creatuempresausa.com>',
      description: 'Email de bienvenida reenviado manualmente desde admin.',
      category:    'general',
      is_read:     false,
    })
    if (mailError) console.error('[resend-welcome] mail_items error:', mailError)

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('[admin/resend-welcome]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
