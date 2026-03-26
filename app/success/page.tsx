import { stripe } from '@/lib/stripe'
import Link from 'next/link'

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
  const sessionId = searchParams.session_id

  let customerName = 'Cliente'
  let customerEmail = ''
  let amountTotal = 0
  let packageName = 'Professional'

  if (sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['customer_details'],
      })
      customerName  = session.customer_details?.name  ?? 'Cliente'
      customerEmail = session.customer_details?.email ?? ''
      amountTotal   = (session.amount_total ?? 0) / 100

      const pkgMap: Record<number, string> = {
        259: 'Starter', 299: 'Starter',
        499: 'Professional', 487: 'Professional',
        799: 'Premium', 787: 'Premium',
      }
      packageName = pkgMap[amountTotal] ?? 'Professional'
    } catch {}
  }

  const orderRef = 'CTE-' + Date.now().toString(36).toUpperCase()

  const steps = [
    { icon: '✅', label: 'Pago recibido',         done: true  },
    { icon: '📋', label: 'Revisión de documentos', done: false },
    { icon: '📤', label: 'Filing estatal',          done: false },
    { icon: '🔢', label: 'Obtención de EIN',        done: false },
    { icon: '📦', label: 'Entrega de documentos',   done: false },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 600, width: '100%' }}>

        {/* Header */}
        <div style={{ background: '#0A2540', borderRadius: 16, padding: '40px 36px', color: '#fff', textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px' }}>¡Recibimos tu pago!</h1>
          <p style={{ fontSize: 16, opacity: 0.75, margin: 0 }}>Tu caso fue creado. Nuestro equipo ya está trabajando en tu LLC.</p>
        </div>

        {/* Order summary */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', marginBottom: 24, border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0A2540', marginBottom: 16 }}>Resumen del pedido</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Row label="Cliente"       value={customerName} />
            <Row label="Email"         value={customerEmail} />
            <Row label="Paquete"       value={packageName} />
            <Row label="Monto pagado"  value={`$${amountTotal} USD`} />
            <Row label="Número de orden" value={orderRef} highlight />
          </div>
        </div>

        {/* Next steps */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', marginBottom: 24, border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0A2540', marginBottom: 16 }}>¿Qué sigue?</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
                <span style={{ fontSize: 14, color: s.done ? '#16a34a' : '#64748b', fontWeight: s.done ? 700 : 400 }}>{s.label}</span>
                {s.done && <span style={{ marginLeft: 'auto', fontSize: 12, background: '#dcfce7', color: '#16a34a', padding: '2px 10px', borderRadius: 99, fontWeight: 600 }}>Completado</span>}
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a href="https://wa.me/19046248859" target="_blank" style={{ flex: 1, display: 'block', background: '#25D366', color: '#fff', textAlign: 'center', padding: '14px 24px', borderRadius: 12, fontWeight: 700, textDecoration: 'none', fontSize: 15 }}>
            💬 Hablar por WhatsApp
          </a>
          <Link href="/" style={{ flex: 1, display: 'block', background: '#0A2540', color: '#fff', textAlign: 'center', padding: '14px 24px', borderRadius: 12, fontWeight: 700, textDecoration: 'none', fontSize: 15 }}>
            🏠 Volver al inicio
          </Link>
        </div>

        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, marginTop: 24 }}>
          Recibirás un email de confirmación en <strong>{customerEmail || 'tu correo'}</strong> en los próximos minutos.
        </p>
      </div>
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
      <span style={{ fontSize: 14, color: '#64748b' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: highlight ? 700 : 500, color: highlight ? '#2563eb' : '#0A2540' }}>{value}</span>
    </div>
  )
}
