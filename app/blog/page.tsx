import type { Metadata } from 'next'
import { posts } from '@/lib/blog/posts'
import BlogNav from './components/BlogNav'
import BlogCard from '@/components/blog/BlogCard'

export const metadata: Metadata = {
  title: 'Blog — Guías para Emprendedores Latinoamericanos | CreaTuEmpresaUSA',
  description:
    'Guías prácticas sobre LLC, EIN, cuentas bancarias e impuestos en EE.UU. para emprendedores de México, Colombia, Argentina y toda LATAM.',
  alternates: { canonical: 'https://creatuempresausa.com/blog' },
  openGraph: {
    title: 'Blog — Guías para Emprendedores Latinoamericanos | CreaTuEmpresaUSA',
    description:
      'Guías prácticas sobre LLC, EIN, cuentas bancarias e impuestos en EE.UU. para emprendedores de México, Colombia, Argentina y toda LATAM.',
    url: 'https://creatuempresausa.com/blog',
    siteName: 'CreaTuEmpresaUSA',
    locale: 'es_MX',
    type: 'website',
  },
}

const CATEGORIES = ['Todos', 'Formación LLC', 'Elegir Estado', 'EIN', 'Banca USA', 'Impuestos', 'Privacidad', 'ITIN']

export default function BlogPage() {
  const featured = posts[0]
  const rest = posts.slice(1)

  return (
    <>
      <BlogNav />

      {/* Hero — foto + overlay */}
      <section
        style={{
          position: 'relative',
          minHeight: '420px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundImage: 'url(https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        {/* Overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(30,48,64,0.82)' }} />
        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '72px 24px' }}>
          <p style={{
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: '#2CB98A', marginBottom: '14px',
          }}>
            Recursos Gratuitos
          </p>
          <h1 style={{
            fontFamily: "'Syne',sans-serif", fontWeight: 800,
            fontSize: 'clamp(32px, 5vw, 52px)',
            color: '#ffffff', lineHeight: 1.1, marginBottom: '18px',
            maxWidth: '600px', margin: '0 auto 18px',
          }}>
            Guías para emprendedores latinoamericanos
          </h1>
          <p style={{
            fontSize: '17px', color: 'rgba(255,255,255,0.78)',
            lineHeight: 1.65, maxWidth: '480px', margin: '0 auto',
          }}>
            Todo lo que necesitas saber para abrir y operar tu empresa en USA
            — sin visa, sin SSN, en español.
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 py-14">
        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4 mb-14 text-center">
          {[
            { value: '10', label: 'Guías especializadas' },
            { value: '30K+', label: 'Búsquedas mensuales cubiertas' },
            { value: '100%', label: 'Gratis y en español' },
          ].map((s) => (
            <div key={s.label} className="bg-gray-50 rounded-2xl py-5 px-4">
              <p className="text-2xl font-bold" style={{ color: '#2A3544' }}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Category filters — "Todos" active in teal */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map((cat, i) => (
            <span
              key={cat}
              style={i === 0
                ? { padding: '8px 18px', borderRadius: '30px', fontSize: '13px', fontWeight: 600, cursor: 'default', border: '1.5px solid #4DB39A', background: '#4DB39A', color: '#fff' }
                : { padding: '8px 18px', borderRadius: '30px', fontSize: '13px', fontWeight: 600, cursor: 'default', border: '1.5px solid #E8E7E2', background: '#fff', color: '#6B7A8D' }
              }
            >
              {cat}
            </span>
          ))}
        </div>

        {/* Featured article */}
        {featured && (
          <div className="mb-10">
            <BlogCard post={featured} featured />
          </div>
        )}

        {/* Rest of articles grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 rounded-2xl p-10 text-center" style={{ background: '#2A3544' }}>
          <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: '#2CB98A' }}>
            ¿Listo para empezar?
          </p>
          <h2 className="text-2xl font-bold text-white mb-3">
            Tu LLC en EE.UU. en menos de una semana
          </h2>
          <p className="text-gray-400 mb-7 max-w-md mx-auto text-sm leading-relaxed">
            Sin visa, sin SSN, sin viajar. Nuestro equipo hace todo por ti y te
            mantiene informado en tiempo real desde tu portal.
          </p>
          <a
            href="/index_final.html?page=wizard"
            className="inline-block text-white font-semibold px-8 py-3 rounded-xl transition-colors"
            style={{ background: '#2CB98A' }}
          >
            Iniciar el proceso →
          </a>
        </div>
      </main>
    </>
  )
}
