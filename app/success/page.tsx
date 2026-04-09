import { stripe } from '@/lib/stripe'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Mail, MessageCircle, Building2, MapPin, Package, Clock, ChevronRight } from 'lucide-react'

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
  const sessionId = searchParams.session_id

  // Resolved order data — metadata-first, same precedence as webhook
  let clientFullName  = ''
  let clientEmail     = ''
  let companyName     = ''
  let stateName       = ''
  let stateCode       = ''
  let planRaw         = ''
  let amountTotal     = 0
  let orderRef        = ''
  let sessionOk       = false

  if (sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['customer_details'],
      })

      // Metadata-first resolution (same rule as webhook)
      const pick = (v: string | null | undefined) => (v && v.trim()) ? v.trim() : undefined

      clientFullName = (
        pick(session.metadata?.client_full_name) ||
        pick(session.customer_details?.name)     ||
        'Cliente'
      )
      clientEmail = (
        pick(session.metadata?.client_email) ||
        session.customer_email               ||
        session.customer_details?.email      ||
        ''
      )
      companyName = pick(session.metadata?.company_name) || (clientFullName + ' LLC')
      stateName   = pick(session.metadata?.state_name)   || pick(session.metadata?.state_code) || ''
      stateCode   = pick(session.metadata?.state_code)   || ''
      planRaw     = pick(session.metadata?.plan)         || ''
      amountTotal = (session.amount_total ?? 0) / 100

      // Generate order ref matching webhook pattern (will be replaced by real one in future)
      orderRef  = 'CTE-' + sessionId.slice(-8).toUpperCase()
      sessionOk = true
    } catch {
      sessionOk = false
    }
  }

  const planLabels: Record<string, string> = {
    basic:        'Plan Starter',
    starter:      'Plan Starter',
    growth:       'Plan Pro',
    professional: 'Plan Pro',
    premium:      'Plan Premium',
  }
  const planLabel = planLabels[planRaw] ?? 'Plan Profesional'

  const portalUrl = '/dashboard'
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? 'https://creatuempresausa.com'

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Analytics events — fires once on mount */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if (typeof window !== 'undefined') {
              window.dataLayer = window.dataLayer || [];
              window.dataLayer.push({
                event: 'checkout_success',
                plan: '${planRaw}',
                amount: ${amountTotal},
                company_name: '${companyName.replace(/'/g, "\\'")}',
                state: '${stateCode}',
              });
              window.dataLayer.push({ event: 'thankyou_view' });
              window.dataLayer.push({ event: 'handoff_created' });
            }
          `,
        }}
      />

      {/* Top bar */}
      <div style={{ background: '#0f2d52', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#ffffff', fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>
          CreaTuEmpresa<span style={{ color: '#dc2626' }}>USA</span>
        </span>
        <span style={{ color: '#94b8d4', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Confirmación de pedido
        </span>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 16px 64px' }}>

        {/* Section A — Confirmation Header */}
        <div style={{
          background: 'linear-gradient(160deg, #0f2d52 0%, #1a4a7e 100%)',
          borderRadius: 20,
          padding: '40px 36px',
          marginBottom: 20,
          textAlign: 'center',
        }}>
          {/* Status chip */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(110,231,183,0.3)',
            borderRadius: 999, padding: '8px 16px', marginBottom: 24,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: 999, background: '#34d399' }} />
            <span style={{ color: '#a7f3d0', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Pedido confirmado
            </span>
          </div>

          <h1 style={{ color: '#ffffff', fontSize: 28, fontWeight: 800, margin: '0 0 12px', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            Tu pedido ha sido recibido correctamente
          </h1>
          <p style={{ color: '#94b8d4', fontSize: 16, margin: 0, lineHeight: 1.6 }}>
            Ya comenzamos el proceso de tu empresa en Estados Unidos.{clientFullName && clientFullName !== 'Cliente' ? ` Gracias, ${clientFullName.split(' ')[0]}.` : ''}
          </p>
        </div>

        {/* Section B — Order Summary */}
        <div style={{
          background: '#ffffff', borderRadius: 16, border: '1px solid #e2eaf4',
          overflow: 'hidden', marginBottom: 20,
          boxShadow: '0 2px 16px rgba(15,45,82,0.06)',
        }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7a90a8' }}>
              Resumen del pedido
            </span>
          </div>
          <div style={{ padding: '8px 0' }}>
            <SummaryRow
              icon="building"
              label="Empresa"
              value={companyName || '—'}
              strong
            />
            {stateName && (
              <SummaryRow icon="map" label="Estado de formación" value={stateName} />
            )}
            <SummaryRow icon="package" label="Plan" value={planLabel} />
            <SummaryRow icon="ref" label="Número de pedido" value={orderRef} mono />
            {clientEmail && (
              <SummaryRow icon="mail" label="Confirmación enviada a" value={clientEmail} />
            )}
          </div>
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: '#f8fafc',
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#7a90a8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Total pagado</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: '#0f2d52' }}>
              ${amountTotal > 0 ? amountTotal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '—'} USD
            </span>
          </div>
        </div>

        {/* Section C — What happens next */}
        <div style={{
          background: '#ffffff', borderRadius: 16, border: '1px solid #e2eaf4',
          overflow: 'hidden', marginBottom: 20,
          boxShadow: '0 2px 16px rgba(15,45,82,0.06)',
        }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7a90a8' }}>
              Qué sucede ahora
            </span>
          </div>
          <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { step: '1', label: 'Pago recibido', desc: 'Tu transacción fue procesada y verificada correctamente.', done: true },
              { step: '2', label: 'Revisamos tu pedido', desc: 'Nuestro equipo revisa tu orden en las próximas 24 horas hábiles.', done: false },
              { step: '3', label: 'Contacto si es necesario', desc: 'Te avisaremos si necesitamos documentos o información adicional.', done: false },
              { step: '4', label: 'Iniciamos tu proceso', desc: 'Presentamos tu empresa ante el estado seleccionado.', done: false },
              { step: '5', label: 'Seguimiento en tu portal', desc: 'Podrás ver el avance en tiempo real desde tu cuenta.', done: false },
            ].map((s, i, arr) => (
              <div key={s.step} style={{ display: 'flex', gap: 16, paddingBottom: i < arr.length - 1 ? 20 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 999, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: s.done ? '#0f2d52' : '#f1f5f9',
                    border: s.done ? 'none' : '1.5px solid #dde6f0',
                    fontSize: 12, fontWeight: 800,
                    color: s.done ? '#ffffff' : '#94a3b8',
                  }}>
                    {s.done ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : s.step}
                  </div>
                  {i < arr.length - 1 && (
                    <div style={{ width: 1.5, flex: 1, background: '#e9eef5', marginTop: 4 }} />
                  )}
                </div>
                <div style={{ paddingTop: 4 }}>
                  <p style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 700, color: s.done ? '#0f2d52' : '#374151' }}>
                    {s.label}
                    {s.done && (
                      <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: 999 }}>
                        Completado
                      </span>
                    )}
                  </p>
                  <p style={{ margin: 0, fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section D — Communication */}
        <div style={{
          background: '#ffffff', borderRadius: 16, border: '1px solid #e2eaf4',
          overflow: 'hidden', marginBottom: 28,
          boxShadow: '0 2px 16px rgba(15,45,82,0.06)',
        }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7a90a8' }}>
              Cómo nos comunicaremos
            </span>
          </div>
          <div style={{ padding: '12px 24px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <CommRow icon="mail" text={clientEmail ? `Recibirás un email de bienvenida en ${clientEmail}` : 'Revisa tu email para la confirmación de bienvenida'} />
            <CommRow icon="whatsapp" text="Si compartiste tu número, recibirás un mensaje de WhatsApp con los próximos pasos" />
            <CommRow icon="portal" text="Desde tu portal podrás seguir el avance de tu proceso en tiempo real" />
          </div>
        </div>

        {/* Section E + F — CTA Block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <a
            href={portalUrl}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              background: '#dc2626',
              color: '#ffffff', textDecoration: 'none',
              padding: '17px 28px', borderRadius: 14,
              fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em',
              boxShadow: '0 4px 16px rgba(220,38,38,0.25)',
            }}
            >
            Acceder a mi portal
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M13 6L19 12L13 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>

          <div style={{ display: 'flex', gap: 10 }}>
            <a
              href={`mailto:soporte@creatuempresausa.com`}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: '#ffffff', color: '#0f2d52', textDecoration: 'none',
                padding: '13px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600,
                border: '1.5px solid #dde6f0',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="#0f2d52" strokeWidth="2"/>
                <path d="M3 9L12 14L21 9" stroke="#0f2d52" strokeWidth="2"/>
              </svg>
              Email soporte
            </a>
            <a
              href="https://wa.me/19493461806"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: '#ffffff', color: '#16a34a', textDecoration: 'none',
                padding: '13px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600,
                border: '1.5px solid #bbf7d0',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="13" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.8"/>
                <path d="M11.2 9.9C11.5 9.5 11.9 9.4 12.3 9.6L13.9 10.3C14.3 10.5 14.5 10.9 14.4 11.3L14 13C13.9 13.4 14 13.7 14.3 14C15.2 14.9 16.2 15.8 17.3 16.4C17.6 16.6 17.9 16.6 18.2 16.4L19.6 15.6C20 15.4 20.4 15.4 20.8 15.7L22.1 16.9C22.4 17.2 22.5 17.7 22.2 18.1C21.5 19.1 20.5 19.7 19.3 19.7C17.7 19.7 15.8 18.8 13.7 17C11.5 15.1 10.1 12.9 10.1 11.1C10.1 10.6 10.5 10.2 11.2 9.9Z" fill="#16a34a"/>
              </svg>
              WhatsApp
            </a>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: '#9baab8', fontSize: 12, marginTop: 28, lineHeight: 1.6 }}>
          Número de pedido <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#6b7280' }}>{orderRef}</span>
          {clientEmail && <> · Confirmación enviada a <strong style={{ color: '#6b7280' }}>{clientEmail}</strong></>}
        </p>
      </div>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function SummaryRow({
  label, value, strong, mono, icon,
}: {
  label: string; value: string; strong?: boolean; mono?: boolean; icon?: string;
}) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 24px', borderBottom: '1px solid #f8fafc', gap: 16,
    }}>
      <span style={{ fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap' }}>{label}</span>
      <span style={{
        fontSize: strong ? 15 : 13, fontWeight: strong ? 700 : 500,
        color: strong ? '#0f2d52' : '#374151',
        fontFamily: mono ? 'monospace' : 'inherit',
        textAlign: 'right',
      }}>
        {value}
      </span>
    </div>
  )
}

function CommRow({ icon, text }: { icon: string; text: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    mail: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="#1a4a7e" strokeWidth="1.8"/>
        <path d="M3 9L12 14L21 9" stroke="#1a4a7e" strokeWidth="1.8"/>
      </svg>
    ),
    whatsapp: (
      <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="13" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.6"/>
        <path d="M11.2 9.9C11.5 9.5 11.9 9.4 12.3 9.6L13.9 10.3C14.3 10.5 14.5 10.9 14.4 11.3L14 13C13.9 13.4 14 13.7 14.3 14C15.2 14.9 16.2 15.8 17.3 16.4C17.6 16.6 17.9 16.6 18.2 16.4L19.6 15.6C20 15.4 20.4 15.4 20.8 15.7L22.1 16.9C22.4 17.2 22.5 17.7 22.2 18.1C21.5 19.1 20.5 19.7 19.3 19.7C17.7 19.7 15.8 18.8 13.7 17C11.5 15.1 10.1 12.9 10.1 11.1C10.1 10.6 10.5 10.2 11.2 9.9Z" fill="#16a34a"/>
      </svg>
    ),
    portal: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="#1a4a7e" strokeWidth="1.8"/>
        <path d="M3 9H21" stroke="#1a4a7e" strokeWidth="1.8"/>
        <circle cx="7" cy="6" r="1" fill="#1a4a7e"/>
        <circle cx="11" cy="6" r="1" fill="#1a4a7e"/>
      </svg>
    ),
  }

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: '#f0f5fb', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {iconMap[icon]}
      </div>
      <p style={{ margin: 0, fontSize: 13, color: '#4b5563', lineHeight: 1.55 }}>{text}</p>
    </div>
  )
}
