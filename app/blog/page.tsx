import type { Metadata } from 'next'
import Link from 'next/link'
import { posts } from '@/lib/blog/posts'

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

const LABEL: Record<string, string> = {
  'abrir LLC en USA desde México': 'LLC en USA',
  'mejor estado para abrir LLC extranjero': 'Elegir Estado',
  'sacar EIN sin SSN': 'EIN',
  'abrir cuenta bancaria USA sin SSN': 'Banca USA',
  'impuestos LLC no residentes': 'Impuestos',
}

export default function BlogPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-12">
        <p className="text-sm font-semibold text-red-600 uppercase tracking-widest mb-3">
          Recursos
        </p>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Guías para emprendedores latinoamericanos
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl">
          Todo lo que necesitas saber para abrir y operar tu empresa en Estados Unidos —
          sin visa, sin SSN, en español.
        </p>
      </header>

      <div className="grid gap-8 sm:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block border border-gray-100 rounded-2xl p-6 hover:border-gray-300 hover:shadow-md transition-all duration-200"
          >
            <span className="inline-block text-xs font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full mb-4">
              {LABEL[post.keyword] ?? 'Guía'}
            </span>
            <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
              {post.headline}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3">
              {post.description}
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
              <span>·</span>
              <span>{post.readTime} min de lectura</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-16 bg-gray-900 rounded-2xl p-8 text-center">
        <p className="text-sm font-semibold text-red-400 uppercase tracking-widest mb-2">
          ¿Listo para empezar?
        </p>
        <h2 className="text-2xl font-bold text-white mb-3">
          Tu LLC en EE.UU. en menos de una semana
        </h2>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          Sin visa, sin SSN, sin viajar. Nuestro equipo hace todo por ti.
        </p>
        <a
          href="/index_final.html?page=wizard"
          className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          Iniciar el proceso →
        </a>
      </div>
    </main>
  )
}
