import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingNav } from '@/components/marketing/marketing-nav'
import { MarketingFooter } from '@/components/marketing/marketing-footer'
import { FaqAccordion } from '@/components/marketing/faq-accordion'
import { WA_URL, PRICING_URL } from '@/lib/marketing/state-data'

export const metadata: Metadata = {
  title: 'LLC vs Corporation vs DBA en EE.UU. | CreaTuEmpresaUSA',
  description:
    'Diferencias entre LLC, Corporation y DBA para emprendedores latinoamericanos. Cuál estructura te conviene según tu negocio, fiscalidad y objetivos.',
  alternates: { canonical: '/comparar' },
}

const NAVY = '#0A2540'
const RED  = '#DC2626'

const ENTITIES = [
  {
    name: 'LLC',
    tagline: 'La más popular para emprendedores internacionales',
    forWho: 'E-commerce, servicios digitales, freelancers, importación, agencias',
    pros: [
      'Separación legal entre tú y tu empresa',
      'Pass-through taxation — no paga impuestos a nivel corporativo',
      'Mínima burocracia y costos de mantenimiento bajos',
      'Flexible para uno o varios socios',
      'Protección de activos personales frente a deudas de la empresa',
    ],
    cons: [
      'No puede emitir acciones (no ideal para fondeo con inversionistas)',
      'Algunos bancos y socios prefieren Corporations',
      'Self-employment tax si eres miembro activo y residente en EE.UU.',
    ],
    verdict: 'La opción correcta para el 90% de los emprendedores latinoamericanos que abren su primera empresa en EE.UU.',
    color: NAVY,
    featured: true,
  },
  {
    name: 'Corporation (C-Corp)',
    tagline: 'Para startups que buscan inversión externa',
    forWho: 'Startups con plan de fondeo, empresas con múltiples inversionistas',
    pros: [
      'Puede emitir acciones — ideal para fondeo con VCs o angels',
      'Estructura reconocida internacionalmente para inversionistas',
      'Acciones transferibles facilitan el equity y las salidas',
      'Delaware C-Corp es el estándar global para startups',
    ],
    cons: [
      'Double taxation: paga impuesto corporativo + impuesto personal sobre dividendos',
      'Mayor burocracia: juntas de directores, actas, reportes',
      'Costos de mantenimiento más altos que una LLC',
      'Más complejo sin contador especializado en EE.UU.',
    ],
    verdict: 'La elección correcta si tu objetivo es levantar capital con inversionistas. No la primera opción si solo quieres operar.',
    color: '#1e40af',
    featured: false,
  },
  {
    name: 'DBA (Doing Business As)',
    tagline: 'No es una entidad legal — es solo un nombre',
    forWho: 'Emprendedores que ya tienen otra entidad y quieren operar bajo un nombre diferente',
    pros: [
      'Muy fácil y barato de registrar',
      'Permite operar bajo un nombre distinto al legal de la empresa',
    ],
    cons: [
      'No ofrece protección legal — no separa activos personales',
      'No crea una entidad legal nueva',
      'No puede abrir cuentas bancarias como "empresa" en muchos bancos',
      'No tiene protección frente a deudas ni demandas',
    ],
    verdict: 'No es una alternativa a la LLC ni la Corporation. Solo útil como nombre comercial adicional para alguien que ya tiene una entidad legal.',
    color: '#64748b',
    featured: false,
  },
]

const COMPARISON_ROWS = [
  { label: 'Protección legal', llc: 'Sí', corp: 'Sí', dba: 'No' },
  { label: 'Entidad legal independiente', llc: 'Sí', corp: 'Sí', dba: 'No' },
  { label: 'Puede emitir acciones', llc: 'No', corp: 'Sí', dba: 'No' },
  { label: 'Pass-through tax', llc: 'Sí', corp: 'No (C-Corp)', dba: 'Sí (como persona)' },
  { label: 'Ideal para inversionistas', llc: 'Limitado', corp: 'Sí', dba: 'No' },
  { label: 'Costos de mantenimiento', llc: 'Bajos', corp: 'Medios-altos', dba: 'Muy bajos' },
  { label: 'Burocracia', llc: 'Mínima', corp: 'Alta', dba: 'Mínima' },
  { label: 'Popular para no residentes', llc: 'Muy popular', corp: 'Sí (Delaware)', dba: 'No aplica' },
]

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
      <path d="M2 6l3 3 5-5" stroke={NAVY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function X() {
  return (
    <svg width="14" height="14" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
      <path d="M3 3l6 6M9 3l-6 6" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function CompararPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section
        style={{ background: `linear-gradient(160deg, #071a2e 0%, ${NAVY} 55%, #0f3460 100%)` }}
        className="py-20 px-6 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.1) 0%, transparent 70%)', width: 400, height: 400, position: 'absolute', top: -80, right: -80 }} />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '0.14em' }}>
            Guía comparativa
          </p>
          <h1
            style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontWeight: 800, fontSize: 'clamp(1.9rem, 4vw, 2.7rem)', color: 'white', lineHeight: 1.15 }}
            className="mb-5"
          >
            LLC vs Corporation vs DBA:{' '}
            <span style={{ color: RED }}>¿cuál te conviene?</span>
          </h1>
          <p className="text-base mb-8 max-w-xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.70)' }}>
            Tres estructuras empresariales, tres realidades distintas. Esta guía te explica las diferencias reales para que tomes la decisión correcta desde el principio.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={PRICING_URL}
              style={{ background: RED, color: 'white', borderRadius: '10px', fontWeight: 700, fontSize: '1rem' }}
              className="inline-flex items-center justify-center px-8 py-3.5 hover:-translate-y-0.5 transition-transform"
            >
              Abrir mi LLC ahora
            </Link>
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ border: '1.5px solid rgba(255,255,255,0.4)', color: 'white', borderRadius: '10px', fontWeight: 600 }}
              className="inline-flex items-center justify-center px-6 py-3.5 hover:bg-white/10 transition-colors"
            >
              Hablar con un experto
            </a>
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ──────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: RED }}>Comparación rápida</p>
            <h2
              style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontWeight: 800, fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', color: NAVY }}
            >
              Las diferencias que importan
            </h2>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th className="text-left px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400 w-44">Característica</th>
                  <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wide" style={{ color: NAVY }}>LLC</th>
                  <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wide text-blue-700">Corp</th>
                  <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wide text-slate-500">DBA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {COMPARISON_ROWS.map(row => (
                  <tr key={row.label} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-700">{row.label}</td>
                    <td className="px-5 py-3.5 text-center text-sm" style={{ color: NAVY, fontWeight: 600 }}>{row.llc}</td>
                    <td className="px-5 py-3.5 text-center text-sm text-blue-700">{row.corp}</td>
                    <td className="px-5 py-3.5 text-center text-sm text-slate-400">{row.dba}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── ENTITY CARDS ──────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto space-y-10">
          {ENTITIES.map(entity => (
            <div
              key={entity.name}
              style={{
                border: entity.featured ? `2px solid ${NAVY}` : '1px solid #e2e8f0',
                borderRadius: '18px',
                position: 'relative',
              }}
              className="p-8 bg-white"
            >
              {entity.featured && (
                <span
                  style={{ background: NAVY, color: 'white', borderRadius: '100px', fontSize: '0.67rem', fontWeight: 700, letterSpacing: '0.04em', position: 'absolute', top: 16, right: 20 }}
                  className="px-3 py-1 uppercase"
                >
                  Más popular
                </span>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div>
                  <p
                    style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontWeight: 800, fontSize: '1.4rem', color: entity.color }}
                    className="mb-1"
                  >
                    {entity.name}
                  </p>
                  <p className="text-sm text-slate-500 mb-3">{entity.tagline}</p>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Ideal para</p>
                  <p className="text-sm text-slate-600">{entity.forWho}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Ventajas</p>
                  <ul className="space-y-2">
                    {entity.pros.map(p => (
                      <li key={p} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <Check />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Limitaciones</p>
                  <ul className="space-y-2 mb-5">
                    {entity.cons.map(c => (
                      <li key={c} className="flex items-start gap-2.5 text-sm text-slate-500">
                        <X />
                        {c}
                      </li>
                    ))}
                  </ul>
                  <div style={{ background: entity.featured ? 'rgba(10,37,64,0.04)' : '#f8fafc', borderRadius: '10px', borderLeft: `3px solid ${entity.color}` }} className="p-3">
                    <p className="text-xs font-semibold text-slate-700 leading-relaxed">{entity.verdict}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DECISION GUIDE ────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: RED }}>Guía de decisión</p>
            <h2
              style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontWeight: 800, fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', color: NAVY }}
            >
              ¿Cuál estructura eliges?
            </h2>
          </div>
          <div className="space-y-4">
            {[
              {
                condition: 'Si quieres abrir tu primera empresa en EE.UU. para operar',
                answer: 'LLC',
                why: 'Protección legal, costos mínimos, sin doble tributación.',
              },
              {
                condition: 'Si planeas levantar capital con VCs o angels',
                answer: 'Delaware C-Corp',
                why: 'Es el estándar que exigen la mayoría de fondos de inversión.',
              },
              {
                condition: 'Si solo quieres operar bajo un nombre distinto al tuyo',
                answer: 'DBA (sobre una LLC existente)',
                why: 'El DBA no es una empresa — necesitas una LLC base para tener protección.',
              },
              {
                condition: 'Si eres freelancer o proveedor de servicios digitales',
                answer: 'LLC (Wyoming o Florida)',
                why: 'Mínima burocracia, costos controlados y protección de activos.',
              },
            ].map(item => (
              <div key={item.condition} style={{ border: '1px solid #e2e8f0', borderRadius: '12px' }} className="p-5 bg-white flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex-1">
                  <p className="text-sm text-slate-600 mb-1">{item.condition}</p>
                  <p className="text-xs text-slate-400">{item.why}</p>
                </div>
                <div className="flex-shrink-0">
                  <span
                    style={{ background: NAVY, color: 'white', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-manrope), Manrope, sans-serif' }}
                    className="inline-block px-3 py-1.5"
                  >
                    {item.answer}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ────────────────────────────────────────────────── */}
      <section
        style={{ background: `linear-gradient(160deg, #071a2e 0%, ${NAVY} 60%, #0f3460 100%)` }}
        className="py-20 px-6 text-center"
      >
        <div className="max-w-xl mx-auto">
          <h2
            style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontWeight: 800, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: 'white', lineHeight: 1.2 }}
            className="mb-4"
          >
            Ya decidiste. Abre tu LLC hoy.
          </h2>
          <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Sin visa. Sin SSN. 100% remoto. Proceso guiado en español.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={PRICING_URL}
              style={{ background: RED, color: 'white', borderRadius: '10px', fontWeight: 700, fontSize: '1rem' }}
              className="inline-flex items-center justify-center px-8 py-3.5 hover:-translate-y-0.5 transition-transform"
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
