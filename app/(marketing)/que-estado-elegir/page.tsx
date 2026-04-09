import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingNav } from '@/components/marketing/marketing-nav'
import { MarketingFooter } from '@/components/marketing/marketing-footer'
import { BusinessProfileSelector } from '@/components/marketing/business-profile-selector'
import { USMap } from '@/components/marketing/us-map'
import { COMPARISON_STATES, FEATURED_STATES } from '@/lib/marketing/decision-data'
import { WA_URL } from '@/lib/marketing/state-data'

export const metadata: Metadata = {
  title: '¿Qué estado elegir para tu LLC en EE.UU.? | CreaTuEmpresaUSA',
  description:
    'Guía para elegir el mejor estado para abrir tu LLC en EE.UU. según tu tipo de negocio. Florida, Texas, Wyoming, Delaware y más. Trabajamos con los 50 estados.',
  alternates: { canonical: '/que-estado-elegir' },
  openGraph: {
    title: '¿Qué estado elegir para tu LLC en EE.UU.?',
    description: 'Elige el estado correcto según tu negocio. Guía práctica para no residentes y emprendedores latinoamericanos.',
    type: 'website',
  },
}

const NAVY = '#0A2540'
const RED  = '#DC2626'


const COMPLEXITY_COLOR: Record<string, string> = {
  'Muy baja': 'bg-green-50 text-green-700 border-green-200',
  'Baja':     'bg-blue-50 text-blue-700 border-blue-200',
  'Media':    'bg-amber-50 text-amber-700 border-amber-200',
  'Alta':     'bg-red-50 text-red-700 border-red-200',
}

const WHY_FACTORS = [
  {
    title: 'Tu residencia',
    detail: 'Si vives fuera de EE.UU., Wyoming y Florida son los más accesibles para no residentes. Si tendrás presencia física, forma la LLC en el estado donde operas.',
  },
  {
    title: 'Modelo de negocio',
    detail: 'E-commerce y servicios digitales funcionan bien en Wyoming. Importación y exportación en Florida o Texas. Startups con fondeo externo, Delaware.',
  },
  {
    title: 'Costo de mantenimiento',
    detail: 'Wyoming y New Mexico tienen los costos anuales más bajos. Florida y Texas tienen Annual Report o Franchise Tax que varía según ingresos.',
  },
  {
    title: 'Privacidad de socios',
    detail: 'Wyoming y New Mexico no publican nombres de miembros. Florida y Texas sí. Si la privacidad es prioritaria, Wyoming tiene la mejor protección legal.',
  },
  {
    title: 'Planes de inversión',
    detail: 'Si planeas levantar capital con inversionistas externos, Delaware C-Corp es el estándar del sector. Para operar sin fondeo, una LLC en Wyoming o Florida es suficiente.',
  },
  {
    title: 'Mercado objetivo',
    detail: 'Si tus clientes están en Latinoamérica o el mercado hispano de EE.UU., Florida da mejor imagen y conexión. Si apuntas a México, Texas tiene la ventaja geográfica.',
  },
]

export default function QueEstadoElegirPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section
        style={{ background: `linear-gradient(160deg, #071a2e 0%, ${NAVY} 55%, #0f3460 100%)` }}
        className="py-20 px-6 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.12) 0%, transparent 70%)', width: 500, height: 500, position: 'absolute', top: -100, right: -100 }} />
          <div style={{ background: 'radial-gradient(circle, rgba(37,211,102,0.06) 0%, transparent 70%)', width: 300, height: 300, position: 'absolute', bottom: -60, left: -60 }} />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.14em' }}>
            Guía de decisión
          </p>
          <h1
            style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 2.9rem)', color: 'white', lineHeight: 1.12 }}
            className="mb-5"
          >
            ¿Qué estado te conviene para{' '}
            <span style={{ color: RED }}>abrir tu empresa</span>{' '}
            en EE.UU.?
          </h1>
          <p className="text-base mb-8 max-w-xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.68)' }}>
            Trabajamos con los 50 estados, pero no todos convienen igual. La elección correcta depende de tu tipo de negocio, tu perfil y tus objetivos. Esta guía te ayuda a decidir.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <a
              href="#selector"
              style={{ background: RED, color: 'white', borderRadius: '10px', fontWeight: 700, fontSize: '1rem' }}
              className="inline-flex items-center justify-center px-8 py-3.5 hover:-translate-y-0.5 transition-transform"
            >
              Ver opciones recomendadas
            </a>
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ border: '1.5px solid rgba(255,255,255,0.4)', color: 'white', borderRadius: '10px', fontWeight: 600 }}
              className="inline-flex items-center justify-center px-6 py-3.5 hover:bg-white/10 transition-colors"
            >
              Consultar con un experto
            </a>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {['50 estados disponibles', 'Sin visa ni SSN', 'Guía en español', '100% remoto'].map(chip => (
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

      {/* ── 50 STATES BLOCK ───────────────────────────────────────────── */}
      <section className="py-14 px-6" style={{ background: '#fafafa', borderBottom: '1px solid #e2e8f0' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Map */}
          <USMap />
          {/* Copy */}
          <div>
            <p
              style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: NAVY }}
              className="mb-3"
            >
              Podemos abrir tu empresa en cualquier estado de EE.UU.
            </p>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              No estamos limitados a Florida, Texas o Wyoming. Trabajamos con los 50 estados. Pero te mostramos primero las opciones que más convienen según tu tipo de negocio — para que no pierdas tiempo ni dinero eligiendo mal desde el principio.
            </p>
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: RED, fontWeight: 600, fontSize: '0.875rem' }}
              className="hover:underline"
            >
              ¿Tu estado no aparece aquí? Consúltanos →
            </a>
          </div>
        </div>
      </section>

      {/* ── PROFILE SELECTOR ──────────────────────────────────────────── */}
      <section id="selector" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: RED }}>
              Encuentra tu estado ideal
            </p>
            <h2
              style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontWeight: 800, fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', color: NAVY }}
              className="mb-3"
            >
              ¿Cuál describe mejor tu negocio?
            </h2>
            <p className="text-sm text-slate-500 max-w-lg mx-auto">
              Selecciona tu perfil y te mostramos los estados más recomendados para tu caso.
            </p>
          </div>
          <BusinessProfileSelector />
        </div>
      </section>

      {/* ── WHY IT MATTERS ────────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: '#fafafa', borderTop: '1px solid #e2e8f0' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: RED }}>
              Por qué importa la elección
            </p>
            <h2
              style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontWeight: 800, fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', color: NAVY }}
              className="mb-3"
            >
              No todos los estados convienen igual
            </h2>
            <p className="text-sm text-slate-500 max-w-lg mx-auto">
              Elegir el estado equivocado no es ilegal, pero sí puede costarte más dinero, más burocracia y más complicaciones a largo plazo.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHY_FACTORS.map(f => (
              <div
                key={f.title}
                style={{ border: '1px solid #e2e8f0', borderRadius: '14px', borderTop: `3px solid ${NAVY}` }}
                className="p-5 bg-white"
              >
                <p
                  style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: NAVY }}
                  className="mb-2"
                >
                  {f.title}
                </p>
                <p className="text-sm text-slate-500 leading-relaxed">{f.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MID CTA ───────────────────────────────────────────────────── */}
      <section className="py-12 px-6" style={{ borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: NAVY }} className="mb-1">
              ¿Ya sabes qué estado quieres?
            </p>
            <p className="text-sm text-slate-500">Empieza hoy. Sin visa, sin SSN, 100% remoto.</p>
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
              href="/index_final.html#pricing"
              style={{ background: NAVY, color: 'white', borderRadius: '8px' }}
              className="text-sm font-semibold px-5 py-2.5 hover:opacity-90 transition-opacity"
            >
              Ver planes
            </Link>
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ──────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: RED }}>
              Comparativa rápida
            </p>
            <h2
              style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontWeight: 800, fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', color: NAVY }}
            >
              Los estados más usados por emprendedores internacionales
            </h2>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Estado', 'Ideal para', 'State fee', 'Mantenimiento', 'Popular entre', 'Complejidad'].map(h => (
                    <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {COMPARISON_STATES.map(s => (
                  <tr key={s.slug} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5">
                      {s.hasPage ? (
                        <Link
                          href={`/llc/${s.slug}`}
                          style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontWeight: 700, color: NAVY }}
                          className="text-sm hover:underline"
                        >
                          {s.name} →
                        </Link>
                      ) : (
                        <span style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontWeight: 700, color: NAVY }} className="text-sm">
                          {s.name}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-600">{s.idealFor}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold" style={{ color: NAVY }}>{s.stateFee}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-600">{s.maintenance}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-500">{s.popularAmong}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${COMPLEXITY_COLOR[s.complexity]}`}>
                        {s.complexity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 mt-3 text-center">
            Los estados sin página dedicada están disponibles — consúltanos por WhatsApp para tu caso específico.
          </p>
        </div>
      </section>

      {/* ── STATE CARDS ───────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: RED }}>
              Guías por estado
            </p>
            <h2
              style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontWeight: 800, fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', color: NAVY }}
            >
              Explora los estados más recomendados
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURED_STATES.map(s => (
              <div
                key={s.slug}
                style={{ border: '1.5px solid #e2e8f0', borderRadius: '18px' }}
                className="bg-white p-6 flex flex-col gap-4"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <p
                      style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontWeight: 800, fontSize: '1.3rem', color: NAVY }}
                    >
                      {s.name}
                    </p>
                    <span
                      style={{ background: 'rgba(10,37,64,0.06)', color: NAVY, borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }}
                      className="px-2 py-1"
                    >
                      {s.abbr}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.tagline}</p>
                </div>
                <div style={{ borderTop: '1px solid #f1f5f9' }} className="pt-3 space-y-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Destacado</p>
                  <p className="text-xs text-slate-600">{s.highlight}</p>
                </div>
                <div style={{ borderTop: '1px solid #f1f5f9' }} className="pt-3 space-y-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Ideal para</p>
                  <p className="text-xs text-slate-600">{s.bestFor}</p>
                </div>
                <Link
                  href={`/llc/${s.slug}`}
                  style={{ background: NAVY, color: 'white', borderRadius: '8px' }}
                  className="mt-auto inline-flex items-center justify-center text-sm font-semibold py-2.5 hover:opacity-90 transition-opacity"
                >
                  Ver guía de {s.name} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTERNAL LINKS STRIP ──────────────────────────────────────── */}
      <section className="py-10 px-6 border-t border-slate-200">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4 text-center">
            También te puede interesar
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { label: 'LLC vs Corporation vs DBA', href: '/comparar' },
              { label: 'EIN para extranjeros sin SSN', href: '/ein-extranjeros' },
              { label: 'Ver planes y precios', href: '/index_final.html#pricing' },
            ].map(l => (
              <Link
                key={l.href}
                href={l.href}
                style={{ border: '1.5px solid #e2e8f0', color: '#334155', borderRadius: '8px' }}
                className="text-sm font-medium px-4 py-2 hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                {l.label} →
              </Link>
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
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Empieza hoy — sin moverte de tu país
          </p>
          <h2
            style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontWeight: 800, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: 'white', lineHeight: 1.2 }}
            className="mb-4"
          >
            Ya sabes qué estado. Abramos tu empresa.
          </h2>
          <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Sin visa. Sin SSN. Sin viajes. Proceso 100% en línea, guiado en español.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/index_final.html#pricing"
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
