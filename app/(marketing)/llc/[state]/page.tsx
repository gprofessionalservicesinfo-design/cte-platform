import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingNav } from '@/components/marketing/marketing-nav'
import { MarketingFooter } from '@/components/marketing/marketing-footer'
import { FaqAccordion } from '@/components/marketing/faq-accordion'
import { STATE_DATA, STATES_LIST, WA_URL, PRICING_URL } from '@/lib/marketing/state-data'

interface Props {
  params: { state: string }
}

export function generateStaticParams() {
  return STATES_LIST.map(s => ({ state: s.slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const data = STATE_DATA[params.state]
  if (!data) return {}
  return {
    title: data.metaTitle,
    description: data.metaDescription,
    alternates: { canonical: `/llc/${data.slug}` },
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      type: 'website',
    },
  }
}

const NAVY = '#0A2540'
const RED  = '#DC2626'

const STEPS = [
  { n: '01', title: 'Eliges tu plan', desc: 'Starter, Pro o Premium según los servicios que necesitas. Precio transparente, sin sorpresas.' },
  { n: '02', title: 'Completamos el papeleo', desc: 'Preparamos y presentamos los Articles of Organization ante el estado. No necesitas firmar nada físico.' },
  { n: '03', title: 'Obtienes tu EIN', desc: 'Gestionamos tu Employer Identification Number ante el IRS. Sin SSN, sin presencia en EE.UU.' },
  { n: '04', title: 'Tu empresa está activa', desc: 'Recibes tus documentos de formación, carta del IRS y acceso a tu portal de cliente para gestionar todo.' },
]

export default function StateLLCPage({ params }: Props) {
  const data = STATE_DATA[params.state]
  if (!data) notFound()

  const otherStates = STATES_LIST.filter(s => s.slug !== data.slug)

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
          <div style={{ background: 'radial-gradient(circle, rgba(37,211,102,0.07) 0%, transparent 70%)', width: 300, height: 300, position: 'absolute', bottom: -60, left: -60 }} />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '0.14em' }}>
            Guía de formación · {data.abbr}
          </p>
          <h1
            style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: 'white', lineHeight: 1.15 }}
            className="mb-5"
          >
            Cómo crear una LLC en{' '}
            <span style={{ color: RED }}>{data.name}</span>
          </h1>
          <p className="text-base mb-8 max-w-xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.70)' }}>
            {data.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Link
              href={PRICING_URL}
              style={{ background: RED, color: 'white', borderRadius: '10px', fontWeight: 700, fontSize: '1rem' }}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 hover:-translate-y-0.5 hover:opacity-95 transition-transform"
            >
              Comenzar ahora
            </Link>
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: '#25D366', color: 'white', borderRadius: '10px', fontWeight: 600, fontSize: '0.95rem' }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 hover:-translate-y-0.5 transition-transform"
            >
              Hablar por WhatsApp
            </a>
          </div>
          {/* Trust chips */}
          <div className="flex flex-wrap gap-2 justify-center">
            {['Sin visa ni SSN', '100% remoto', 'En español', 'EIN incluido'].map(chip => (
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

      {/* ── QUICK FACTS BAR ───────────────────────────────────────────── */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-3 gap-4 divide-x divide-slate-200">
          {[
            { label: 'State fee', value: `$${data.stateFee}` },
            { label: 'Tiempo de formación', value: data.processingTime },
            { label: 'Annual Report', value: typeof data.annualFee === 'number' ? `$${data.annualFee}/año` : data.annualFee },
          ].map(fact => (
            <div key={fact.label} className="text-center px-4">
              <p
                style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: NAVY }}
              >
                {fact.value}
              </p>
              <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wide">{fact.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY THIS STATE ────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: RED }}>
                Por qué {data.name}
              </p>
              <h2
                style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontWeight: 800, fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', color: NAVY, lineHeight: 1.2 }}
                className="mb-4"
              >
                {data.tagline}
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-8">
                {data.description}
              </p>
              <ul className="space-y-3">
                {data.advantages.map(adv => (
                  <li key={adv} className="flex items-start gap-3">
                    <span
                      style={{ background: 'rgba(10,37,64,0.06)', borderRadius: '50%', flexShrink: 0, marginTop: 2, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke={NAVY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="text-sm text-slate-700">{adv}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgba(10,37,64,0.4)' }}>
                Ideal para
              </p>
              <div className="flex flex-wrap gap-2 mb-10">
                {data.bestFor.map(tag => (
                  <span
                    key={tag}
                    style={{ border: `1.5px solid ${NAVY}`, color: NAVY, borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600 }}
                    className="px-3 py-1.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Comparison to other states */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px' }} className="p-5 bg-slate-50">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Comparar estados</p>
                <div className="space-y-3">
                  {[data, ...otherStates].map((s, i) => (
                    <div key={s.slug} className={`flex items-center justify-between text-sm ${i === 0 ? 'font-semibold' : ''}`}>
                      <span style={{ color: i === 0 ? NAVY : '#64748b' }}>
                        {i === 0 ? `${s.name} (seleccionado)` : (
                          <Link href={`/llc/${s.slug}`} className="hover:underline" style={{ color: '#64748b' }}>
                            {s.name}
                          </Link>
                        )}
                      </span>
                      <span style={{ color: i === 0 ? RED : '#94a3b8', fontWeight: i === 0 ? 700 : 500 }}>
                        ${s.stateFee}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── A TENER EN CUENTA ─────────────────────────────────────────── */}
      <section className="py-16 px-6" style={{ background: '#fafafa', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#64748b' }}>
              Antes de decidir
            </p>
            <h2
              style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontWeight: 800, fontSize: 'clamp(1.3rem, 2.2vw, 1.7rem)', color: NAVY }}
            >
              A tener en cuenta sobre {data.name}
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              No todo son ventajas. Esto es lo que debes saber antes de elegir este estado.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.considerations.map(item => (
              <div
                key={item.title}
                style={{ border: '1px solid #e2e8f0', borderRadius: '12px', borderLeft: `3px solid ${NAVY}` }}
                className="p-5 bg-white"
              >
                <p className="text-sm font-semibold mb-1.5" style={{ color: NAVY }}>{item.title}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: RED }}>
              El proceso
            </p>
            <h2
              style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontWeight: 800, fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', color: NAVY }}
            >
              De cero a empresa activa en días
            </h2>
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

      {/* ── CTA MID-PAGE ──────────────────────────────────────────────── */}
      <section className="py-14 px-6" style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontWeight: 800, fontSize: '1.15rem', color: NAVY }} className="mb-1">
              Listo para abrir tu LLC en {data.name}?
            </p>
            <p className="text-sm text-slate-500">Comenzamos hoy. Sin visa, sin SSN, 100% remoto.</p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ border: `1.5px solid ${NAVY}`, color: NAVY, borderRadius: '8px' }}
              className="text-sm font-semibold px-4 py-2.5 hover:bg-slate-50 transition-colors"
            >
              WhatsApp
            </a>
            <Link
              href={PRICING_URL}
              style={{ background: NAVY, color: 'white', borderRadius: '8px' }}
              className="text-sm font-semibold px-5 py-2.5 hover:opacity-90 transition-opacity"
            >
              Ver planes
            </Link>
          </div>
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
              LLC en {data.name} — lo que más nos preguntan
            </h2>
          </div>
          <FaqAccordion items={data.faqs} accentColor={NAVY} />
        </div>
      </section>

      {/* ── BOTTOM CTA ────────────────────────────────────────────────── */}
      <section
        style={{ background: `linear-gradient(160deg, #071a2e 0%, ${NAVY} 60%, #0f3460 100%)` }}
        className="py-20 px-6 text-center"
      >
        <div className="max-w-xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Emprendedores de toda Latinoamérica confían en nosotros
          </p>
          <h2
            style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontWeight: 800, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: 'white', lineHeight: 1.2 }}
            className="mb-4"
          >
            Tu LLC en {data.name} empieza hoy
          </h2>
          <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Sin visa. Sin SSN. Sin viajes. Proceso 100% en línea y en español.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={PRICING_URL}
              style={{ background: RED, color: 'white', borderRadius: '10px', fontWeight: 700, fontSize: '1rem' }}
              className="inline-flex items-center justify-center px-8 py-3.5 hover:-translate-y-0.5 hover:opacity-95 transition-transform"
            >
              Ver planes y precios
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
