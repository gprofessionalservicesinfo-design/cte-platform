import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPost, getAllSlugs, type Section } from '@/lib/blog/posts'
import BlogNav from '../components/BlogNav'

// ── Static params ─────────────────────────────────────────────────────────────
export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = getPost(params.slug)
  if (!post) return {}

  const url = `https://creatuempresausa.com/blog/${post.slug}`

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      siteName: 'CreaTuEmpresaUSA',
      locale: 'es_MX',
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.modified,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  }
}

// ── Article schema markup ─────────────────────────────────────────────────────
function ArticleSchema({ post }: { post: ReturnType<typeof getPost> }) {
  if (!post) return null
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.headline,
    description: post.description,
    datePublished: post.date,
    dateModified: post.modified,
    author: {
      '@type': 'Organization',
      name: 'CreaTuEmpresaUSA',
      url: 'https://creatuempresausa.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'CreaTuEmpresaUSA',
      url: 'https://creatuempresausa.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://creatuempresausa.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://creatuempresausa.com/blog/${post.slug}`,
    },
    inLanguage: 'es',
    keywords: post.keyword,
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// ── Section renderer ──────────────────────────────────────────────────────────
function RenderSection({ section }: { section: Section }) {
  switch (section.type) {
    case 'p':
      return <p className="text-gray-700 leading-relaxed mb-5">{section.text}</p>

    case 'h2':
      return (
        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">{section.text}</h2>
      )

    case 'h3':
      return (
        <h3 className="text-xl font-semibold text-gray-800 mt-7 mb-3">{section.text}</h3>
      )

    case 'ul':
      return (
        <ul className="list-disc list-outside pl-5 space-y-2 mb-5 text-gray-700">
          {section.items.map((item, i) => (
            <li key={i} className="leading-relaxed">{item}</li>
          ))}
        </ul>
      )

    case 'ol':
      return (
        <ol className="list-decimal list-outside pl-5 space-y-3 mb-5 text-gray-700">
          {section.items.map((item, i) => (
            <li key={i} className="leading-relaxed">{item}</li>
          ))}
        </ol>
      )

    case 'table':
      return (
        <div className="overflow-x-auto mb-6 rounded-xl border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {section.headers.map((h, i) => (
                  <th key={i} className="px-4 py-3 font-semibold text-gray-800">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {section.rows.map((row, ri) => (
                <tr key={ri} className="hover:bg-gray-50">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 text-gray-700">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case 'cta':
      return (
        <div className="my-8 bg-gray-900 rounded-2xl p-6 text-center">
          <p className="text-white font-semibold text-lg mb-3">{section.text}</p>
          <a
            href={section.href}
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-7 py-3 rounded-xl transition-colors"
          >
            {section.label}
          </a>
        </div>
      )

    case 'faq':
      return (
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Preguntas frecuentes
          </h2>
          <div className="space-y-5">
            {section.items.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-5">
                <p className="font-semibold text-gray-900 mb-2">{item.q}</p>
                <p className="text-gray-600 leading-relaxed text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      )

    default:
      return null
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug)
  if (!post) notFound()

  return (
    <>
      <BlogNav />
      <ArticleSchema post={post} />
      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-600 transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-gray-600 transition-colors">
            Blog
          </Link>
          <span>/</span>
          <span className="text-gray-600 truncate">{post.headline}</span>
        </nav>

        {/* Header */}
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
            {post.headline}
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed mb-5">{post.description}</p>
          <div className="flex items-center gap-3 text-sm text-gray-400 border-t border-gray-100 pt-5">
            <span>
              Publicado el{' '}
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
            </span>
            <span>·</span>
            <span>{post.readTime} min de lectura</span>
            <span>·</span>
            <span>CreaTuEmpresaUSA</span>
          </div>
        </header>

        {/* Content */}
        <article>
          {post.sections.map((section, i) => (
            <RenderSection key={i} section={section} />
          ))}
        </article>

        {/* Footer CTA */}
        <div className="mt-16 border-t border-gray-100 pt-10">
          <div className="bg-gray-900 rounded-2xl p-8 text-center">
            <p className="text-sm font-semibold text-red-400 uppercase tracking-widest mb-2">
              ¿Listo para dar el siguiente paso?
            </p>
            <h2 className="text-2xl font-bold text-white mb-3">
              Forma tu LLC con nuestro equipo
            </h2>
            <p className="text-gray-400 mb-6 max-w-sm mx-auto text-sm">
              Sin visa, sin SSN, sin viajes. Todo el proceso en español con seguimiento
              en tiempo real desde tu portal.
            </p>
            <a
              href="/index_final.html?page=wizard"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
            >
              Iniciar el proceso →
            </a>
          </div>
          <div className="text-center mt-8">
            <Link
              href="/blog"
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← Ver todos los artículos
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
