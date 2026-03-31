import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)

function adminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const { to, name, subject, body, companyId } = await req.json()

  if (!to || !subject || !body) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  try {
    await resend.emails.send({
      from: 'CreaTuEmpresaUSA <soporte@creatuempresausa.com>',
      replyTo: 'soporte@creatuempresausa.com',
      to: process.env.NODE_ENV === 'development' ? 'gprofessionalservices.info@gmail.com' : to,
      subject,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:32px 20px;background:#f8fafc">
          <div style="background:#fff;border-radius:12px;padding:28px;border:1px solid #e2e8f0">
            <p style="margin:0 0 16px;font-size:15px;color:#374151">Hola ${name ?? ''},</p>
            <div style="font-size:14px;color:#374151;line-height:1.7;white-space:pre-wrap">${body.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            <hr style="margin:24px 0;border:none;border-top:1px solid #e2e8f0" />
            <p style="margin:0;font-size:13px;color:#94a3b8">CreaTuEmpresaUSA · <a href="mailto:soporte@creatuempresausa.com" style="color:#2563eb">soporte@creatuempresausa.com</a></p>
          </div>
        </div>
      `,
    })

    // Save to mail_items so it appears in client portal and admin
    if (companyId) {
      const supabase = adminClient()
      const preview = body.length > 200 ? body.slice(0, 200) + '…' : body
      await supabase.from('mail_items').insert({
        company_id:  companyId,
        title:       subject,
        sender:      'soporte@creatuempresausa.com',
        description: preview,
        is_read:     false,
        received_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[admin/send-client-email]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
