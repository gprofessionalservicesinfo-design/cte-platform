import { Resend } from 'resend'

const FROM_ADDRESS  = 'CreaTuEmpresaUSA <soporte@creatuempresausa.com>'
const REPLY_TO      = 'soporte@creatuempresausa.com'
const DEV_OVERRIDE  = 'gprofessionalservices.info@gmail.com'

function wrapInBrandedHtml(name: string, bodyText: string): string {
  // Escape user-supplied content before injecting into HTML
  const safeBody = bodyText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br />')

  return `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:32px 20px;background:#f8fafc">
      <div style="background:#0A2540;border-radius:12px;padding:24px 32px;margin-bottom:20px;text-align:center">
        <span style="color:#fff;font-size:20px;font-weight:800;letter-spacing:-0.5px">CreaTuEmpresaUSA</span>
      </div>
      <div style="background:#fff;border-radius:12px;padding:28px;border:1px solid #e2e8f0">
        <p style="margin:0 0 16px;font-size:15px;color:#374151">Hola ${name},</p>
        <div style="font-size:14px;color:#374151;line-height:1.8">${safeBody}</div>
        <hr style="margin:24px 0;border:none;border-top:1px solid #e2e8f0" />
        <div style="text-align:center;margin-bottom:16px">
          <a href="https://creatuempresausa.com/login"
             style="display:inline-block;background:#0A2540;color:#fff;padding:12px 28px;border-radius:10px;font-weight:700;text-decoration:none;font-size:14px">
            Acceder a mi portal
          </a>
        </div>
        <p style="text-align:center;margin:0">
          <a href="https://wa.me/19046248859"
             style="display:inline-block;background:#25D366;color:#fff;padding:10px 24px;border-radius:10px;font-weight:600;text-decoration:none;font-size:13px">
            Escribir por WhatsApp
          </a>
        </p>
      </div>
      <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px">
        CreaTuEmpresaUSA ·
        <a href="mailto:${REPLY_TO}" style="color:#94a3b8">${REPLY_TO}</a>
      </p>
    </div>
  `
}

export async function sendEmailMessage(opts: {
  to:       string
  name:     string
  subject:  string
  bodyText: string
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const resend = new Resend(process.env.RESEND_API_KEY)

  const toAddress = process.env.NODE_ENV === 'development' ? DEV_OVERRIDE : opts.to

  try {
    const result = await resend.emails.send({
      from:    FROM_ADDRESS,
      replyTo: REPLY_TO,
      to:      toAddress,
      subject: opts.subject,
      html:    wrapInBrandedHtml(opts.name, opts.bodyText),
    })
    console.log(`[comunicacion/email] SUCCESS — id: ${result.data?.id} | to: ${toAddress}`)
    return { success: true, id: result.data?.id }
  } catch (err: any) {
    console.error(`[comunicacion/email] FAILED — message: ${err?.message}`)
    return { success: false, error: err?.message ?? 'Unknown Resend error' }
  }
}
