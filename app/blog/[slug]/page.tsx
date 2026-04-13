import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPost, getAllSlugs, type Section, type Post } from '@/lib/blog/posts'
import BlogNav from '../components/BlogNav'
import BlogCTA from '@/components/blog/BlogCTA'
import BlogFAQ from '@/components/blog/BlogFAQ'
import ComparisonTable from '@/components/blog/ComparisonTable'
import TableOfContents, { type TOCItem } from '@/components/blog/TableOfContents'
import BlogStickyBar from '@/components/blog/BlogStickyBar'

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
      images: [{ url: post.photo, width: 1200, height: 630, alt: post.headline }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [post.photo],
    },
  }
}

// ── Article schema ─────────────────────────────────────────────────────────────
function ArticleSchema({ post }: { post: Post }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.headline,
    description: post.description,
    image: post.photo,
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
      logo: { '@type': 'ImageObject', url: 'https://creatuempresausa.com/logo.png' },
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

// ── Build TOC from sections ────────────────────────────────────────────────────
function buildTOC(sections: Section[]): TOCItem[] {
  const items: TOCItem[] = []
  sections.forEach((s) => {
    if (s.type === 'h2' || s.type === 'h3') {
      items.push({
        id: s.text.toLowerCase().replace(/[^a-z0-9áéíóúñü ]/g, '').replace(/ +/g, '-'),
        text: s.text,
        level: s.type,
      })
    }
  })
  return items
}

function headingId(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9áéíóúñü ]/g, '').replace(/ +/g, '-')
}

// ── Section renderer ──────────────────────────────────────────────────────────
function RenderSection({ section }: { section: Section }) {
  switch (section.type) {
    case 'p':
      return <p className="text-gray-700 leading-relaxed mb-5">{section.text}</p>

    case 'h2':
      return (
        <h2
          id={headingId(section.text)}
          className="text-2xl font-bold text-gray-900 mt-10 mb-4 scroll-mt-24"
        >
          {section.text}
        </h2>
      )

    case 'h3':
      return (
        <h3
          id={headingId(section.text)}
          className="text-xl font-semibold text-gray-800 mt-7 mb-3 scroll-mt-24"
        >
          {section.text}
        </h3>
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
      return <ComparisonTable headers={section.headers} rows={section.rows} />

    case 'cta':
      return <BlogCTA text={section.text} href={section.href} label={section.label} />

    case 'faq':
      return <BlogFAQ items={section.items} />

    default:
      return null
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug)
  if (!post) notFound()

  const toc = buildTOC(post.sections)

  return (
    <>
      <BlogNav />
      <ArticleSchema post={post} />
      <BlogStickyBar title={post.headline} ctaHref="/index_final.html?page=wizard" />

      {/* Hero */}
      <div className="relative h-64 sm:h-80 overflow-hidden bg-gray-900">
        <img
          src={post.photo}
          alt={post.headline}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 max-w-4xl mx-auto">
          <span className="inline-block text-xs font-semibold text-white px-3 py-1 rounded-full mb-3" style={{ background: '#4DB39A' }}>
            {post.badge}
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-600 transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-gray-600 transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-gray-600 truncate">{post.headline}</span>
        </nav>

        {/* 2-col layout */}
        <div className="flex gap-12">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            <header className="mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
                {post.headline}
              </h1>
              <p className="text-lg text-gray-500 leading-relaxed mb-5">{post.description}</p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 border-t border-gray-100 pt-5">
                <span>
                  Publicado el{' '}
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString('es-MX', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </time>
                </span>
                <span>·</span>
                <span>{post.readTime} min de lectura</span>
                <span>·</span>
                <span>CreaTuEmpresaUSA</span>
              </div>
            </header>

            <article>
              {post.sections.map((section, i) => (
                <RenderSection key={i} section={section} />
              ))}
            </article>

            {/* Footer CTA */}
            <div className="mt-16 border-t border-gray-100 pt-10">
              <div className="rounded-2xl p-8 text-center" style={{ background: '#2A3544' }}>
                <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: '#2CB98A' }}>
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
                  className="inline-block text-white font-semibold px-8 py-3 rounded-xl transition-colors"
                  style={{ background: '#2CB98A' }}
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
          </div>

          {/* Sticky sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <TableOfContents items={toc} />

              {/* CTA card */}
              <div className="rounded-2xl p-6 text-center" style={{ background: '#2A3544' }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#2CB98A' }}>
                  ¿Listo para empezar?
                </p>
                <p className="text-white font-bold mb-1">Forma tu LLC hoy</p>
                <p className="text-gray-400 text-xs mb-4 leading-relaxed">
                  Sin visa, sin SSN, sin viajar.
                </p>
                <a
                  href="/index_final.html?page=wizard"
                  className="block text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                  style={{ background: '#2CB98A' }}
                >
                  Iniciar →
                </a>
              </div>

              {/* Related category */}
              <div className="bg-gray-50 rounded-2xl p-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                  Categoría
                </p>
                <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full text-white" style={{ background: '#4DB39A' }}>
                  {post.category}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
