import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

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

export async function POST(req: NextRequest) {
  const { customerName, customerEmail, companyName, stateName, packageName, amountTotal, orderRef } = await req.json()

  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? 'https://creatuempresausa.com'
  const toEmail = process.env.NODE_ENV === 'development'
    ? 'gprofessionalservices.info@gmail.com'
    : customerEmail

  try {
    await resend.emails.send({
      from:    'CreaTuEmpresaUSA <noreply@creatuempresausa.com>',
      replyTo: 'soporte@creatuempresausa.com',
      to:      toEmail,
      subject: `Tu empresa en EE.UU. está en camino 🚀`,
      html:    buildWelcomeEmailHtml({
        customerName,
        customerEmail,
        companyName: companyName ?? customerName + ' LLC',
        stateName:   stateName   ?? 'Wyoming (WY)',
        packageName,
        amountTotal,
        orderRef,
        portalUrl: appUrl + '/login',
      }),
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[email] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
