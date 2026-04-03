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
  addons?: { label: string; price: number }[]
}): string {
  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CreaTuEmpresaUSA - Bienvenida</title>
    <style>
      body{margin:0;padding:0;background:#edf4fb;font-family:Arial,Helvetica,sans-serif;color:#17324d}
      .wrapper{width:100%;padding:26px 12px 40px;box-sizing:border-box}
      .email{max-width:680px;margin:0 auto;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 18px 50px rgba(17,35,66,0.10)}
      .topbar{background:#133b6c;color:#deebf8;text-align:center;font-size:11px;font-weight:700;letter-spacing:0.11em;text-transform:uppercase;padding:12px 20px}
      .hero{background:radial-gradient(circle at top center,rgba(255,255,255,0.18),transparent 34%),linear-gradient(180deg,#275b96 0%,#1b4a82 58%,#163f71 100%);padding:34px 34px 28px;position:relative}
      .logo-lockup{text-align:center}
      .logo{margin:0;font-size:34px;line-height:1;font-weight:800;color:#ffffff;letter-spacing:-0.02em}
      .logo .usa{color:#ef5567}
      .hero-status{width:fit-content;margin:22px auto 0;background:rgba(20,156,121,0.18);border:1px solid rgba(159,241,212,0.34);color:#e7fff6;border-radius:999px;padding:10px 16px;font-size:14px;font-weight:700}
      .hero-title{margin:22px auto 0;max-width:540px;text-align:center;color:#ffffff;font-size:42px;line-height:1.14;font-weight:800;letter-spacing:-0.03em}
      .hero-sub{margin:16px auto 0;max-width:520px;text-align:center;color:#e3edf8;font-size:19px;line-height:1.68}
      .trust{background:#ffffff;padding:0 26px 24px;margin-top:-1px}
      .trust-inner{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
      .trust-card{background:#ffffff;border:1px solid #e7eef7;border-radius:20px;padding:18px 14px;text-align:center;box-shadow:0 8px 20px rgba(17,35,66,0.04)}
      .trust-icon{width:52px;height:52px;margin:0 auto 12px;border-radius:16px;display:flex;align-items:center;justify-content:center;background:#ffffff;border:2px solid #ffffff;box-shadow:0 0 0 1px rgba(208,220,235,0.9),0 8px 18px rgba(17,35,66,0.06)}
      .trust-title{margin:0;color:#17324d;font-size:15px;font-weight:800}
      .trust-text{margin:5px 0 0;color:#748495;font-size:12px;line-height:1.45}
      .section{padding:28px 34px 0}
      .eyebrow{margin:0 0 14px;color:#71839a;font-size:11px;font-weight:800;letter-spacing:0.22em;text-transform:uppercase}
      .order-card{border:1px solid #e5edf6;border-radius:24px;overflow:hidden;background:#ffffff;box-shadow:0 14px 30px rgba(17,35,66,0.06)}
      .order-top{background:linear-gradient(180deg,#2c5c96 0%,#1c467b 100%);padding:20px 22px;color:#ffffff}
      .order-name{margin:0;font-size:28px;line-height:1.1;font-weight:800}
      .order-meta{margin-top:6px;font-size:13px;line-height:1.5;color:#dce9f8}
      .pill{display:inline-block;border-radius:999px;padding:8px 12px;font-size:12px;font-weight:800}
      .pill.processing{background:rgba(255,205,96,0.18);color:#ffd67c;border:1px solid rgba(255,224,150,0.24)}
      .pill.included{background:#ecfbf5;color:#169c79;border:1px solid #ccf2e3}
      .order-body{padding:4px 22px 8px}
      .row{display:grid;grid-template-columns:1fr auto;gap:16px;align-items:center;padding:18px 0;border-bottom:1px solid #edf2f7}
      .row:last-child{border-bottom:none}
      .label{color:#76879a;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;font-weight:800}
      .value{color:#17324d;font-size:18px;font-weight:800;text-align:right}
      .total-wrap{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;padding:20px 0 6px}
      .total-label{color:#7a899a;font-size:12px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase}
      .total-note{margin-top:6px;color:#8a96a3;font-size:12px}
      .total-amount{color:#0b2342;font-size:34px;font-weight:800}
      .timeline{margin-top:8px;border:1px solid #e5edf6;border-radius:24px;background:#ffffff;padding:8px 22px;box-shadow:0 14px 30px rgba(17,35,66,0.04)}
      .step{position:relative;padding:18px 0 18px 56px;border-bottom:1px solid #edf2f7}
      .step:last-child{border-bottom:none}
      .step:before{content:"";position:absolute;left:17px;top:0;bottom:0;width:2px;background:#e5edf6}
      .step:last-child:before{bottom:28px}
      .dot{position:absolute;left:0;top:19px;width:34px;height:34px;border-radius:999px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;box-sizing:border-box}
      .dot.done{background:#eafaf3;border:2px solid #97dfbc;color:#14966f}
      .dot.active{background:#edf3ff;border:2px solid #8fb0ea;color:#234d85}
      .dot.pending{background:#f8fafc;border:2px solid #d9e3ee;color:#8e9baa}
      .step-title-row{display:flex;align-items:center;justify-content:space-between;gap:12px}
      .step-title{color:#17324d;font-size:19px;font-weight:800}
      .step-text{margin-top:6px;color:#7a8897;font-size:14px;line-height:1.55}
      .tag{border-radius:999px;padding:7px 12px;font-size:11px;font-weight:800;letter-spacing:0.04em;white-space:nowrap}
      .tag.done{background:#ecfbf5;color:#169c79}
      .tag.active{background:#eef3ff;color:#355da0}
      .tag.pending{background:#f3f6f9;color:#8b97a5}
      .assigned{margin-top:28px;border:1px solid #e5edf6;border-radius:24px;background:linear-gradient(180deg,#ffffff 0%,#fbfdff 100%);padding:24px;box-shadow:0 14px 30px rgba(17,35,66,0.04)}
      .assigned-grid{display:grid;grid-template-columns:74px 1fr;gap:18px;align-items:center}
      .avatar{width:74px;height:74px;border-radius:20px;background:linear-gradient(180deg,#3b6caa 0%,#1d4f89 100%);display:flex;align-items:center;justify-content:center;box-shadow:inset 0 1px 0 rgba(255,255,255,0.2)}
      .assigned-title{margin:0;color:#17324d;font-size:24px;font-weight:800}
      .assigned-text{margin:8px 0 0;color:#607286;font-size:16px;line-height:1.65}
      .mini-card{margin-top:14px;display:inline-flex;align-items:center;gap:10px;border:1px solid #e5edf6;border-radius:16px;background:#ffffff;padding:12px 14px;box-shadow:0 8px 18px rgba(17,35,66,0.04)}
      .mini-text{color:#607286;font-size:12px;line-height:1.4}
      .mini-text strong{display:block;color:#17324d;font-size:14px}
      .cta-section{margin-top:28px;background:linear-gradient(180deg,#2b609c 0%,#1a487e 100%);border-radius:28px;padding:34px 26px;text-align:center}
      .cta-kicker{color:#c3d8f0;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.22em}
      .cta-title{margin:12px auto 0;max-width:470px;color:#ffffff;font-size:36px;line-height:1.2;font-weight:800}
      .cta-text{margin:12px auto 0;max-width:500px;color:#e1ecf8;font-size:16px;line-height:1.65}
      .button{display:inline-block;margin-top:22px;background:linear-gradient(180deg,#e85466 0%,#c6283e 100%);color:#ffffff;text-decoration:none;font-size:18px;font-weight:800;letter-spacing:0.01em;padding:18px 34px;border-radius:16px;box-shadow:0 12px 24px rgba(198,40,62,0.22)}
      .support{padding:28px 34px 34px}
      .support-title{margin:0;text-align:center;color:#17324d;font-size:18px;font-weight:800}
      .support-text{margin:10px auto 0;max-width:520px;text-align:center;color:#66788a;font-size:15px;line-height:1.65}
      .contact-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-top:22px}
      .contact-card{border:1px solid #e5edf6;border-radius:18px;background:#ffffff;padding:18px 16px;text-align:center;box-shadow:0 10px 20px rgba(17,35,66,0.04)}
      .contact-icon-wrap{width:52px;height:52px;margin:0 auto;border-radius:16px;background:#ffffff;border:2px solid #ffffff;box-shadow:0 0 0 1px rgba(208,220,235,0.9),0 8px 18px rgba(17,35,66,0.06);display:flex;align-items:center;justify-content:center}
      .contact-label{margin-top:10px;color:#7b8897;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.16em}
      .contact-value{margin-top:6px;color:#17324d;font-size:15px;font-weight:800;line-height:1.5}
      .footer{background:#1c467b;padding:24px 20px 26px;text-align:center}
      .footer-logo{color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.02em}
      .footer-logo .usa{color:#ef5567}
      .footer-links{margin-top:10px;color:#e1ebf7;font-size:13px}
      .footer-links span{margin:0 8px}
      .footer-note{margin-top:10px;color:#d0dff1;font-size:12px;line-height:1.55}
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="email">
        <div class="topbar">Tu camino empresarial en EE.UU. comienza aquí</div>

        <div class="hero">
          <div class="logo-lockup">
            <h1 class="logo">CreaTuEmpresa<span class="usa">USA</span></h1>
          </div>
          <div class="hero-status">● Orden procesada y confirmada</div>
          <div class="hero-title">Tu empresa en EE.UU. está en marcha, ${opts.customerName}.</div>
          <div class="hero-sub">
            Hemos recibido tu orden para <strong style="color:#ffffff">${opts.companyName}</strong> en el estado de
            <strong style="color:#ffffff">${opts.stateName}</strong>. Nuestro equipo ya está trabajando en tu caso.
          </div>
        </div>

        <div class="trust">
          <div class="trust-inner">
            <div class="trust-card">
              <div class="trust-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M20 7L10 17L5 12" stroke="#169C79" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <p class="trust-title">Pago confirmado</p>
              <p class="trust-text">Transacción validada correctamente.</p>
            </div>
            <div class="trust-card">
              <div class="trust-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3L18 6V11C18 15 15.5 18.2 12 19C8.5 18.2 6 15 6 11V6L12 3Z" stroke="#234D85" stroke-width="2.1"/>
                  <path d="M10.5 11.5L12 13L14.8 10.2" stroke="#234D85" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <p class="trust-title">Datos protegidos</p>
              <p class="trust-text">Información resguardada en cada etapa.</p>
            </div>
            <div class="trust-card">
              <div class="trust-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M4 20H20" stroke="#C6283E" stroke-width="2.1" stroke-linecap="round"/>
                  <path d="M6 20V10M10 20V10M14 20V10M18 20V10" stroke="#C6283E" stroke-width="2.1" stroke-linecap="round"/>
                  <path d="M3 10L12 4L21 10" stroke="#C6283E" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <p class="trust-title">Proceso estructurado en EE.UU.</p>
              <p class="trust-text">Seguimiento claro para cada fase de tu incorporación.</p>
            </div>
          </div>
        </div>

        <div class="section">
          <p class="eyebrow">Resumen de tu orden</p>
          <div class="order-card">
            <div class="order-top">
              <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap">
                <div>
                  <p class="order-name">${opts.companyName}</p>
                  <div class="order-meta">Ref. ${opts.orderRef} &nbsp;·&nbsp; ${opts.stateName}</div>
                </div>
                <div class="pill processing">● Procesando</div>
              </div>
            </div>
            <div class="order-body">
              <div class="row">
                <div class="label">Estado de formación</div>
                <div class="value">${opts.stateName}</div>
              </div>
              <div class="row">
                <div class="label">Paquete</div>
                <div class="value">${opts.packageName}</div>
              </div>
              <div class="row">
                <div class="label">EIN federal</div>
                <div class="value"><span class="pill included">✓ Incluido</span></div>
              </div>
              <div class="total-wrap">
                <div>
                  <div class="total-label">Total pagado</div>
                  <div class="total-note">Pago procesado de forma segura.</div>
                </div>
                <div class="total-amount">$${opts.amountTotal} USD</div>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <p class="eyebrow">Tu proceso · 5 pasos</p>
          <div class="timeline">
            <div class="step">
              <div class="dot done">✓</div>
              <div class="step-title-row">
                <div class="step-title">Pago recibido</div>
                <div class="tag done">Completado</div>
              </div>
              <div class="step-text">Tu pago fue procesado y verificado correctamente.</div>
            </div>
            <div class="step">
              <div class="dot active">2</div>
              <div class="step-title-row">
                <div class="step-title">Revisión de documentos</div>
                <div class="tag active">En proceso</div>
              </div>
              <div class="step-text">Nuestro equipo está preparando tu expediente de incorporación.</div>
            </div>
            <div class="step">
              <div class="dot pending">3</div>
              <div class="step-title-row">
                <div class="step-title">Filing estatal</div>
                <div class="tag pending">Pendiente</div>
              </div>
              <div class="step-text">Presentaremos tu formación oficialmente en el estado de ${opts.stateName}.</div>
            </div>
            <div class="step">
              <div class="dot pending">4</div>
              <div class="step-title-row">
                <div class="step-title">Obtención de EIN</div>
                <div class="tag pending">Pendiente</div>
              </div>
              <div class="step-text">Gestionaremos tu número de identificación fiscal federal cuando corresponda.</div>
            </div>
            <div class="step">
              <div class="dot pending">5</div>
              <div class="step-title-row">
                <div class="step-title">Entrega de documentos finales</div>
                <div class="tag pending">Pendiente</div>
              </div>
              <div class="step-text">Recibirás tus documentos oficiales y próximos pasos para operar con confianza.</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="assigned">
            <div class="assigned-grid">
              <div class="avatar">
                <svg width="38" height="38" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="16" r="8" fill="#DCE9FA"/>
                  <path d="M12 37C12 30.9249 16.9249 26 23 26H25C31.0751 26 36 30.9249 36 37V39H12V37Z" fill="#9EBBE3"/>
                  <path d="M18 10H30" stroke="#F3F8FF" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <div>
                <p class="assigned-title">Ya tienes un especialista asignado</p>
                <p class="assigned-text">
                  Revisaremos tu expediente en las próximas <strong style="color:#17324d">24 horas hábiles</strong>
                  y te mantendremos informado por email y WhatsApp.
                </p>
                <div class="mini-card">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L20 6V12C20 17 16.5 20.5 12 22C7.5 20.5 4 17 4 12V6L12 2Z" fill="#F7FAFF" stroke="#123B6D" stroke-width="1.8"/>
                    <path d="M10 11.5L11.7 13.2L14.8 10.1" stroke="#123B6D" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <div class="mini-text">
                    <strong>Equipo de Incorporaciones</strong>
                    CreaTuEmpresaUSA · L–V 9am–6pm EST
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="cta-section">
            <div class="cta-kicker">Tu portal está activo</div>
            <div class="cta-title">Accede para ver el estado de tu caso en tiempo real</div>
            <div class="cta-text">
              Desde tu portal podrás revisar avances, próximos pasos y actualizaciones de tu proceso en un solo lugar.
            </div>
            <a href="${opts.portalUrl}" class="button">Acceder a mi portal →</a>
          </div>
        </div>

        <div class="support">
          <p class="support-title">¿Tienes preguntas sobre tu proceso?</p>
          <p class="support-text">Nuestro equipo está aquí para ayudarte con una experiencia clara, rápida y profesional.</p>
          <div class="contact-grid">
            <div class="contact-card">
              <div class="contact-icon-wrap">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <rect x="3.2" y="5.2" width="17.6" height="13.6" rx="2.8" fill="#EEF4FF" stroke="#1B4A82" stroke-width="1.8"/>
                  <path d="M6 8L12 12.8L18 8" stroke="#1B4A82" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="contact-label">Email</div>
              <div class="contact-value">soporte@creatuempresausa.com</div>
            </div>
            <div class="contact-card">
              <div class="contact-icon-wrap">
                <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="13" fill="#EAF9F0" stroke="#169C79" stroke-width="1.8"/>
                  <path d="M12.2 10.9C12.5 10.5 12.9 10.4 13.3 10.6L14.9 11.3C15.3 11.5 15.5 11.9 15.4 12.3L15 14C14.9 14.4 15 14.7 15.3 15C16.2 15.9 17.2 16.8 18.3 17.4C18.6 17.6 18.9 17.6 19.2 17.4L20.6 16.6C21 16.4 21.4 16.4 21.8 16.7L23.1 17.9C23.4 18.2 23.5 18.7 23.2 19.1C22.5 20.1 21.5 20.7 20.3 20.7C18.7 20.7 16.8 19.8 14.7 18C12.5 16.1 11.1 13.9 11.1 12.1C11.1 11.6 11.5 11.2 12.2 10.9Z" fill="#169C79"/>
                </svg>
              </div>
              <div class="contact-label">WhatsApp</div>
              <div class="contact-value">+1 (949) 346-1806</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <div class="footer-logo">CreaTuEmpresa<span class="usa">USA</span></div>
          <div class="footer-links">Guía <span>|</span> Preguntas frecuentes <span>|</span> Contacto</div>
          <div class="footer-note">La forma más clara, moderna y confiable para crear y operar un negocio en Estados Unidos.</div>
        </div>
      </div>
    </div>
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
  addons?: { label: string; price: number }[]
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
        portalUrl:    appUrl + '/dashboard',
        addons:       opts.addons,
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
    `Accede a tu portal: https://creatuempresausa.com/dashboard\n\n` +
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
          const email       = session.customer_details?.email ?? ''

          // Audit: payment_received
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

                console.log('[webhook] company insert result:', companyData?.id, companyError?.message)
                if (companyError) {
                  console.error('[webhook] Company insert error:', companyError)
                } else {
                  console.log('[webhook] New client created:', email, '| pkg:', pkg, '| company:', companyData?.id)

                // Pull wizard data from pending_orders and enrich company record
                let wizardCompanyName: string | undefined
                let wizardStateName: string | undefined
                let wizardAddons: { label: string; price: number }[] | undefined
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

                // Send WhatsApp notification — prefer phone from client_reference_id (wizard), fallback to Stripe
                const phone = phoneFromRef || session.metadata?.phone || session.customer_details?.phone || ''
                console.log('[webhook] REACHING WHATSAPP SECTION - phone:', phone || '(empty)')
                console.log('[webhook] phone sources — ref:', phoneFromRef, '| metadata:', session.metadata?.phone, '| details:', session.customer_details?.phone)
                console.log('[webhook] final phone for WhatsApp:', phone || '(none — skipping)')
                if (phone) {
                  const waResult = await sendWhatsApp({
                    phone,
                    customerName: fullName,
                    companyName:  companyData?.id ? (fullName + ' LLC') : fullName,
                    stateName:    wizardStateName || session.metadata?.state_name || session.metadata?.state_code || 'EE.UU.',
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

                // ── cases: insert first to capture cases.id for downstream refs ──
                const { data: caseData } = await supabase
                  .from('cases')
                  .insert({ agent_id: 'intake', status: 'pending' })
                  .select('id')
                  .single()

                const caseRef = caseData?.id ?? null

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
