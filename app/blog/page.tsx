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

      {/* Hero */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0A2540 0%, #1a3a5c 60%, #0e2f50 100%)',
        }}
        className="py-20 px-6"
      >
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block text-xs font-semibold text-red-400 uppercase tracking-widest mb-4">
            Recursos gratuitos
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5">
            Guías para emprendedores<br className="hidden sm:block" /> latinoamericanos
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Todo lo que necesitas saber para abrir y operar tu empresa en Estados Unidos —
            sin visa, sin SSN, en español.
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
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <span
              key={cat}
              className="text-xs font-semibold px-4 py-2 rounded-full border border-gray-200 text-gray-600 bg-white cursor-default select-none"
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
        <div className="mt-16 bg-[#0A2540] rounded-2xl p-10 text-center">
          <p className="text-sm font-semibold text-red-400 uppercase tracking-widest mb-2">
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
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Iniciar el proceso →
          </a>
        </div>
      </main>
    </>
  )
}
