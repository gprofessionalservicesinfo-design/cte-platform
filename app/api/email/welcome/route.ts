import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { customerName, customerEmail, packageName, amountTotal, orderRef } = await req.json()

  const toEmail = process.env.NODE_ENV === 'development'
    ? 'gprofessionalservices.info@gmail.com'
    : customerEmail

  try {
    await resend.emails.send({
      from: 'CreaTuEmpresaUSA <noreply@creatuempresausa.com>',
      to: toEmail,
      subject: `✅ Recibimos tu orden — ${packageName} LLC Formation`,
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
              <tr><td style="padding:8px 0;color:#64748b;font-size:14px;border-bottom:1px solid #f1f5f9">Cliente</td><td style="padding:8px 0;font-weight:600;color:#0A2540;font-size:14px;text-align:right;border-bottom:1px solid #f1f5f9">${customerName}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;font-size:14px;border-bottom:1px solid #f1f5f9">Paquete</td><td style="padding:8px 0;font-weight:600;color:#0A2540;font-size:14px;text-align:right;border-bottom:1px solid #f1f5f9">${packageName}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;font-size:14px;border-bottom:1px solid #f1f5f9">Monto pagado</td><td style="padding:8px 0;font-weight:600;color:#0A2540;font-size:14px;text-align:right;border-bottom:1px solid #f1f5f9">$${amountTotal} USD</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;font-size:14px">Número de orden</td><td style="padding:8px 0;font-weight:700;color:#2563eb;font-size:14px;text-align:right">${orderRef}</td></tr>
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
            <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/login" style="display:inline-block;background:#0A2540;color:#fff;padding:14px 32px;border-radius:12px;font-weight:700;text-decoration:none;font-size:15px;margin-bottom:12px">🚀 Acceder a mi portal</a>
          </div>
          <div style="text-align:center;margin-bottom:24px">
            <a href="https://wa.me/19046248859" style="display:inline-block;background:#25D366;color:#fff;padding:14px 32px;border-radius:12px;font-weight:700;text-decoration:none;font-size:15px">💬 Hablar por WhatsApp</a>
          </div>
          <p style="text-align:center;color:#94a3b8;font-size:12px">CreaTuEmpresaUSA · Si tienes preguntas escríbenos por WhatsApp</p>
        </div>
      `,
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[email] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
