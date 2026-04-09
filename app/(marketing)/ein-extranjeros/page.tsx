import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingNav } from '@/components/marketing/marketing-nav'
import { MarketingFooter } from '@/components/marketing/marketing-footer'
import { FaqAccordion } from '@/components/marketing/faq-accordion'
import { WA_URL, PRICING_URL } from '@/lib/marketing/state-data'

export const metadata: Metadata = {
  title: 'EIN para extranjeros sin SSN | CreaTuEmpresaUSA',
  description:
    'Obtén tu EIN (Employer Identification Number) en EE.UU. sin SSN, sin presencia física y desde cualquier país. Proceso 100% remoto en español.',
  alternates: { canonical: '/ein-extranjeros' },
}

const NAVY = '#0A2540'
const RED  = '#DC2626'

const STEPS = [
  {
    n: '01',
    title: 'Formas tu LLC',
    desc: 'El EIN se tramita después de tener la empresa formada. Si aún no tienes tu LLC, este es el primer paso.',
  },
  {
    n: '02',
    title: 'Nos envías tus datos',
    desc: 'Nombre legal completo, dirección física en tu país, y número de pasaporte. No necesitas documentos notarizados.',
  },
  {
    n: '03',
    title: 'Presentamos el Formulario SS-4',
    desc: 'Como Responsible Party de tu empresa, gestionamos el trámite ante el IRS. No requiere tu presencia ni visita a embajadas.',
  },
  {
    n: '04',
    title: 'Recibes tu carta del IRS',
    desc: 'En 4–8 semanas recibes la carta oficial del IRS con tu EIN. La subimos directamente a tu portal de cliente.',
  },
]

const USES = [
  'Abrir cuentas bancarias en EE.UU. (Mercury, Relay, Bluevine)',
  'Facturar a clientes y empresas en EE.UU.',
  'Registrarte en plataformas de pago como Stripe o PayPal Business',
  'Contratar empleados o contratistas en EE.UU.',
  'Presentar declaraciones fiscales ante el IRS',
  'Firmar contratos y acuerdos legales como empresa',
  'Aplicar a programas de crédito empresarial',
]

const FAQS = [
  {
    q: '¿Qué es el EIN exactamente?',
    a: 'El Employer Identification Number (EIN) es el equivalente al RFC o RUC en EE.UU. Es un número de 9 dígitos emitido por el IRS que identifica a tu empresa ante el gobierno federal. Sin él, tu LLC existe legalmente pero no puede operar completamente.',
  },
  {
    q: '¿Puedo obtener el EIN sin SSN?',
    a: 'Sí. Los extranjeros no residentes que forman una LLC en EE.UU. pueden obtener el EIN sin Social Security Number. El proceso se hace presentando el Formulario SS-4 ante el IRS con tu pasaporte como identificación.',
  },
  {
    q: '¿Cuánto tarda el proceso?',
    a: 'Entre 4 y 8 semanas desde que presentamos el formulario. El IRS lo emite por correo postal. Para empresas con responsable dentro de EE.UU. puede ser inmediato por teléfono, pero para no residentes la vía estándar es la más confiable.',
  },
  {
    q: '¿El EIN tiene costo adicional?',
    a: 'En nuestros planes Pro y Premium el EIN está incluido. En el plan Starter puedes agregarlo como add-on. El trámite ante el IRS no tiene costo gubernamental — solo se paga nuestro servicio de gestión.',
  },
  {
    q: '¿Necesito el EIN para abrir cuenta bancaria?',
    a: 'Sí. La mayoría de los bancos y neobancos (Mercury, Relay, Bluevine) requieren el EIN para abrir una cuenta empresarial. Sin él, no puedes completar el proceso de onboarding bancario.',
  },
  {
    q: '¿El EIN cambia si cambio de estado o restructuro mi LLC?',
    a: 'Generalmente no. El EIN está vinculado a la entidad, no al estado de formación. Si cierras la LLC y abres una nueva, necesitarás un nuevo EIN. Si solo cambias el nombre o el estado, usualmente puedes mantener el mismo.',
  },
]

export default function EINExtranjeros() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section
        style={{ background: `linear-gradient(160deg, #071a2e 0%, ${NAVY} 55%, #0f3460 100%)` }}
        className="py-20 px-6 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.12) 0%, transparent 70%)', width: 400, height: 400, position: 'absolute', top: -80, right: -80 }} />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '0.14em' }}>
            Guía · EIN para no residentes
          </p>
          <h1
            style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontWeight: 800, fontSize: 'clamp(1.9rem, 4vw, 2.7rem)', color: 'white', lineHeight: 1.15 }}
            className="mb-5"
          >
            Obtén tu{' '}
            <span style={{ color: RED }}>EIN en EE.UU.</span>
            <br />sin SSN ni residencia
          </h1>
          <p className="text-base mb-8 max-w-xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.70)' }}>
            El EIN es el número fiscal de tu empresa ante el IRS. Sin él no puedes abrir cuenta bancaria ni facturar formalmente. Lo gestionamos por ti, 100% remoto, sin que te muevas de tu país.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Link
              href={PRICING_URL}
              style={{ background: RED, color: 'white', borderRadius: '10px', fontWeight: 700, fontSize: '1rem' }}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 hover:-translate-y-0.5 transition-transform"
            >
              Ver planes con EIN incluido
            </Link>
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ border: '1.5px solid rgba(255,255,255,0.4)', color: 'white', borderRadius: '10px', fontWeight: 600 }}
              className="inline-flex items-center justify-center px-6 py-3.5 hover:bg-white/10 transition-colors"
            >
              Hablar por WhatsApp
            </a>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {['Sin SSN', 'Sin visita al IRS', '100% remoto', 'Incluido en Pro y Premium'].map(chip => (
              <span
                key={chip}
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.82)', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 500 }}
                className="px-3.5 py-1.5"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT IS EIN ───────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: RED }}>
              Qué es
            </p>
            <h2
              style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontWeight: 800, fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', color: NAVY, lineHeight: 1.2 }}
              className="mb-4"
            >
              El EIN es el RFC de tu empresa en EE.UU.
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-5">
              El Employer Identification Number es un número de 9 dígitos emitido por el IRS (la autoridad fiscal de EE.UU.). Funciona como el RFC, RUC o NIT de tu empresa, según tu país de origen.
            </p>
            <p className="text-sm text-slate-500 leading-relaxed">
              Sin el EIN, tu LLC existe legalmente pero tiene limitaciones operativas. Con él, puedes abrir cuentas bancarias, recibir pagos formales, contratar y declarar impuestos correctamente.
            </p>
          </div>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '18px' }} className="p-7 bg-slate-50">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Para qué sirve el EIN</p>
            <ul className="space-y-3">
              {USES.map(use => (
                <li key={use} className="flex items-start gap-3">
                  <span
                    style={{ background: 'rgba(10,37,64,0.06)', borderRadius: '50%', flexShrink: 0, marginTop: 2, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke={NAVY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-sm text-slate-700">{use}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── HOW WE GET IT ─────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: RED }}>
              El proceso
            </p>
            <h2
              style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontWeight: 800, fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', color: NAVY }}
            >
              Cómo obtenemos tu EIN
            </h2>
            <p className="text-sm text-slate-500 mt-3 max-w-lg mx-auto">
              Sin que visites una embajada, sin que llames al IRS, sin documentos notarizados. Solo necesitas tu pasaporte.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {STEPS.map(step => (
              <div
                key={step.n}
                style={{ border: '1px solid #e2e8f0', borderRadius: '14px', background: 'white' }}
                className="p-6"
              >
                <p
                  style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontWeight: 800, fontSize: '0.75rem', color: RED, letterSpacing: '0.1em' }}
                  className="mb-2 uppercase"
                >
                  {step.n}
                </p>
                <p style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontWeight: 700, fontSize: '1rem', color: NAVY }} className="mb-2">
                  {step.title}
                </p>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE CALLOUT ──────────────────────────────────────────── */}
      <section className="py-14 px-6" style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="max-w-3xl mx-auto text-center">
          <p style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: NAVY }} className="mb-2">
            Tiempo estimado del trámite: 4–8 semanas
          </p>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">
            El IRS emite el EIN por correo postal para no residentes. Una vez que lo recibimos, lo subimos directamente a tu portal. No necesitas esperar más para iniciar operaciones — el número llega primero por fax interno y luego la carta oficial.
          </p>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: RED }}>
              Preguntas frecuentes
            </p>
            <h2
              style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontWeight: 800, fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', color: NAVY }}
            >
              Todo sobre el EIN para extranjeros
            </h2>
          </div>
          <FaqAccordion items={FAQS} accentColor={NAVY} />
        </div>
      </section>

      {/* ── BOTTOM CTA ────────────────────────────────────────────────── */}
      <section
        style={{ background: `linear-gradient(160deg, #071a2e 0%, ${NAVY} 60%, #0f3460 100%)` }}
        className="py-20 px-6 text-center"
      >
        <div className="max-w-xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
            EIN incluido en los planes Pro y Premium
          </p>
          <h2
            style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontWeight: 800, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: 'white', lineHeight: 1.2 }}
            className="mb-4"
          >
            Tu EIN, gestionado sin que te muevas
          </h2>
          <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Forma tu LLC y obtén tu EIN desde Latinoamérica. Solo necesitas tu pasaporte.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={PRICING_URL}
              style={{ background: RED, color: 'white', borderRadius: '10px', fontWeight: 700, fontSize: '1rem' }}
              className="inline-flex items-center justify-center px-8 py-3.5 hover:-translate-y-0.5 transition-transform"
            >
              Ver planes con EIN incluido
            </Link>
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ border: '1.5px solid rgba(255,255,255,0.4)', color: 'white', borderRadius: '10px', fontWeight: 600 }}
              className="inline-flex items-center justify-center px-6 py-3.5 hover:bg-white/10 transition-colors"
            >
              Consultar gratis
            </a>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
