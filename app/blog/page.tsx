import type { Metadata } from 'next'
import Link from 'next/link'
import { posts } from '@/lib/blog/posts'
import BlogNav from './components/BlogNav'

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

const CATEGORY: Record<string, { label: string; color: string; bg: string }> = {
  'abrir LLC en USA desde México':        { label: 'LLC en USA',     color: '#1d4ed8', bg: '#eff6ff' },
  'mejor estado para abrir LLC extranjero': { label: 'Elegir Estado', color: '#7c3aed', bg: '#f5f3ff' },
  'sacar EIN sin SSN':                    { label: 'EIN',            color: '#0891b2', bg: '#ecfeff' },
  'abrir cuenta bancaria USA sin SSN':    { label: 'Banca USA',      color: '#059669', bg: '#ecfdf5' },
  'impuestos LLC no residentes':          { label: 'Impuestos',      color: '#d97706', bg: '#fffbeb' },
}

export default function BlogPage() {
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

      <main className="max-w-5xl mx-auto px-6 py-14">
        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4 mb-14 text-center">
          {[
            { value: '5', label: 'Guías especializadas' },
            { value: '23K+', label: 'Búsquedas mensuales cubiertos' },
            { value: '100%', label: 'Gratis y en español' },
          ].map((s) => (
            <div key={s.label} className="bg-gray-50 rounded-2xl py-5 px-4">
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Featured first article */}
        {posts[0] && (() => {
          const cat = CATEGORY[posts[0].keyword]
          return (
            <Link
              href={`/blog/${posts[0].slug}`}
              className="group block mb-10 rounded-2xl border border-gray-200 p-8 hover:border-gray-400 hover:shadow-lg transition-all duration-200"
            >
              <span
                className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
                style={{ color: cat?.color ?? '#DC2626', background: cat?.bg ?? '#fff1f2' }}
              >
                {cat?.label ?? 'Guía'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
                {posts[0].headline}
              </h2>
              <p className="text-gray-500 leading-relaxed mb-5 max-w-2xl">
                {posts[0].description}
              </p>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <time dateTime={posts[0].date}>
                  {new Date(posts[0].date).toLocaleDateString('es-MX', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </time>
                <span>·</span>
                <span>{posts[0].readTime} min de lectura</span>
                <span className="ml-auto text-red-600 font-semibold group-hover:underline">
                  Leer artículo →
                </span>
              </div>
            </Link>
          )
        })()}

        {/* Remaining articles grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          {posts.slice(1).map((post) => {
            const cat = CATEGORY[post.keyword]
            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col border border-gray-100 rounded-2xl p-6 hover:border-gray-300 hover:shadow-md transition-all duration-200"
              >
                <span
                  className="inline-block self-start text-xs font-semibold px-3 py-1 rounded-full mb-4"
                  style={{ color: cat?.color ?? '#DC2626', background: cat?.bg ?? '#fff1f2' }}
                >
                  {cat?.label ?? 'Guía'}
                </span>
                <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors flex-1">
                  {post.headline}
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">
                  {post.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-auto">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString('es-MX', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </time>
                  <span>·</span>
                  <span>{post.readTime} min</span>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 bg-gray-900 rounded-2xl p-10 text-center">
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
