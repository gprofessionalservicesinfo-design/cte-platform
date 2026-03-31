import { NextRequest, NextResponse } from 'next/server'
import { createAdminServerClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminServerClient()

  const { data: company, error } = await supabase
    .from('companies')
    .select(`
      id, company_name, package, order_reference,
      clients ( users ( full_name, email ) )
    `)
    .eq('id', params.id)
    .single()

  if (error || !company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  }

  const client = (company as any).clients
  const user = client?.users
  const customerEmail = user?.email
  const customerName  = user?.full_name ?? 'Cliente'

  if (!customerEmail) {
    return NextResponse.json({ error: 'No email found for client' }, { status: 400 })
  }

  const toEmail = process.env.NODE_ENV === 'development'
    ? 'gprofessionalservices.info@gmail.com'
    : customerEmail

  try {
    const emailSubject = `Tu empresa en EE.UU. está en camino 🚀`
    await resend.emails.send({
      from: 'CreaTuEmpresaUSA <noreply@creatuempresausa.com>',
      replyTo: 'soporte@creatuempresausa.com',
      to: toEmail,
      subject: emailSubject,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;background:#f8fafc">
          <div style="background:#0A2540;border-radius:16px;padding:40px;color:#fff;text-align:center;margin-bottom:24px">
            <div style="font-size:48px;margin-bottom:12px">🎉</div>
            <h1 style="font-size:24px;font-weight:800;margin:0 0 8px">Bienvenido a CreaTuEmpresaUSA</h1>
            <p style="opacity:.75;margin:0">Este es tu portal de seguimiento.</p>
          </div>
          <div style="background:#fff;border-radius:16px;padding:28px;margin-bottom:20px;border:1px solid #e2e8f0">
            <p style="font-size:14px;color:#374151">Hola ${customerName},</p>
            <p style="font-size:14px;color:#374151">Tu caso para <strong>${company.company_name}</strong> está activo. Puedes acceder a tu portal para ver el estado de tu proceso.</p>
          </div>
          <div style="text-align:center;margin-bottom:16px">
            <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.creatuempresausa.com'}/login" style="display:inline-block;background:#0A2540;color:#fff;padding:14px 32px;border-radius:12px;font-weight:700;text-decoration:none;font-size:15px">🚀 Acceder a mi portal</a>
          </div>
          <p style="text-align:center;color:#94a3b8;font-size:12px">CreaTuEmpresaUSA · <a href="mailto:soporte@creatuempresausa.com" style="color:#94a3b8">soporte@creatuempresausa.com</a></p>
        </div>
      `,
    })

    // Save to mail_items so it appears in client portal and admin
    await supabase.from('mail_items').insert({
      company_id:  company.id,
      title:       emailSubject,
      sender:      'noreply@creatuempresausa.com',
      description: `Bienvenido ${customerName}. Tu caso para ${company.company_name} está activo.`,
      is_read:     false,
      received_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('[admin/resend-welcome]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
