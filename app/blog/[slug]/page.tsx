import { Fragment } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPost, getAllSlugs, getAllPosts, type Section, type Post } from '@/lib/blog/posts'
import { fetchArticleImages, type UnsplashPhoto } from '@/lib/blog/unsplash'
import BlogNav from '../components/BlogNav'
import BlogCTA from '@/components/blog/BlogCTA'
import BlogFAQ from '@/components/blog/BlogFAQ'
import ComparisonTable from '@/components/blog/ComparisonTable'
import TableOfContents, { type TOCItem } from '@/components/blog/TableOfContents'
import BlogStickyBar from '@/components/blog/BlogStickyBar'
import LearnBox from '@/components/blog/LearnBox'
import WhatsAppCTA from '@/components/blog/WhatsAppCTA'
import HighlightBlock from '@/components/blog/HighlightBlock'
import AuthorCard from '@/components/blog/AuthorCard'
import RelatedPosts from '@/components/blog/RelatedPosts'
import ArticleImage from '@/components/blog/ArticleImage'

// ── Static params ─────────────────────────────────────────────────────────────
export async function generateStaticParams() {
  return (await getAllSlugs()).map((slug) => ({ slug }))
}

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = await getPost(params.slug)
  if (!post) return {}

  const url = `https://creatuempresausa.com/blog/${post.slug}`
  const seoTitle = post.metaTitle ?? post.title
  const seoDesc  = post.metaDescription ?? post.description

  return {
    title: seoTitle,
    description: seoDesc,
    keywords: post.focusKeyword,
    alternates: { canonical: url },
    openGraph: {
      title: seoTitle,
      description: seoDesc,
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
      title: seoTitle,
      description: seoDesc,
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

// ── Build TOC ─────────────────────────────────────────────────────────────────
function buildTOC(sections: Section[]): TOCItem[] {
  return sections
    .filter((s): s is Extract<Section, { type: 'h2' | 'h3' }> => s.type === 'h2' || s.type === 'h3')
    .map((s) => ({
      id: s.text.toLowerCase().replace(/[^a-z0-9áéíóúñü ]/g, '').replace(/ +/g, '-'),
      text: s.text,
      level: s.type,
    }))
}

function headingId(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9áéíóúñü ]/g, '').replace(/ +/g, '-')
}

// ── Bold markdown renderer ─────────────────────────────────────────────────────
function renderText(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/)
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  )
}

// ── Section renderer ──────────────────────────────────────────────────────────
function RenderSection({ section }: { section: Section }) {
  switch (section.type) {
    case 'p':
      return (
        <p className="text-gray-700 leading-relaxed mb-5 text-[15px] sm:text-base">
          {renderText(section.text)}
        </p>
      )

    case 'h2':
      return (
        <h2
          id={headingId(section.text)}
          className="text-2xl sm:text-3xl font-bold mt-12 mb-4 scroll-mt-24"
          style={{ color: '#2A3544' }}
        >
          {section.text}
        </h2>
      )

    case 'h3':
      return (
        <h3
          id={headingId(section.text)}
          className="text-xl font-semibold text-gray-800 mt-8 mb-3 scroll-mt-24"
        >
          {section.text}
        </h3>
      )

    case 'ul':
      return (
        <ul className="space-y-2.5 mb-6 text-gray-700">
          {section.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-[15px] sm:text-base leading-relaxed">
              <span className="mt-1 flex-shrink-0" style={{ color: '#00C896' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span>{renderText(item)}</span>
            </li>
          ))}
        </ul>
      )

    case 'ol':
      return (
        <ol className="space-y-3 mb-6 text-gray-700 counter-reset-[ol]">
          {section.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-[15px] sm:text-base leading-relaxed">
              <span
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5"
                style={{ background: '#2CB98A' }}
              >
                {i + 1}
              </span>
              <span>{renderText(item)}</span>
            </li>
          ))}
        </ol>
      )

    case 'table':
      return <ComparisonTable headers={section.headers} rows={section.rows} />

    case 'cta':
      return <BlogCTA text={section.text} href={section.href} label={section.label} />

    case 'faq':
      return <BlogFAQ items={section.items} />

    case 'highlight':
      return <HighlightBlock text={section.text} />

    case 'wa_cta':
      return (
        <WhatsAppCTA
          headline={section.headline}
          subtext={section.subtext}
          message={section.message}
        />
      )

    default:
      return null
  }
}

// ── Image insertion point calculator ─────────────────────────────────────────
function computeImagePoints(sections: Section[], maxImages: number): Set<number> {
  const CONTENT = new Set(['p', 'ul', 'ol', 'table', 'faq'])
  const HEADING = new Set(['h2', 'h3'])
  const INTERVAL = 4
  const points = new Set<number>()
  let count = 0

  for (let i = 0; i < sections.length && points.size < maxImages; i++) {
    if (CONTENT.has(sections[i].type)) {
      count++
      if (count % INTERVAL === 0) {
        const next = sections[i + 1]
        if (!next || !HEADING.has(next.type)) {
          points.add(i)
        }
      }
    }
  }
  return points
}

// ── Article sections renderer with image + WA CTA injection ──────────────────
function ArticleSections({
  sections,
  photos,
  waMessage,
}: {
  sections: Section[]
  photos: UnsplashPhoto[]
  waMessage: string
}) {
  const imagePoints = computeImagePoints(sections, photos.length)
  const midPoint = Math.floor(sections.length * 0.42)
  let waInjected = false
  let photoIdx = 0

  return (
    <>
      {sections.map((section, i) => {
        const isImagePoint = imagePoints.has(i) && photoIdx < photos.length
        const isWaPoint = !waInjected && i === midPoint

        if (isImagePoint || isWaPoint) {
          waInjected = waInjected || isWaPoint
          const photo = isImagePoint ? photos[photoIdx++] : null

          return (
            <Fragment key={i}>
              <RenderSection section={section} />
              {photo && (
                <ArticleImage
                  src={photo.urls.regular}
                  alt={photo.alt_description ?? ''}
                  caption={photo.description}
                  photographerName={photo.user.name}
                  photographerUrl={photo.user.links.html}
                />
              )}
              {isWaPoint && (
                <WhatsAppCTA
                  headline="¿Tienes preguntas sobre este tema?"
                  subtext="Escríbenos por WhatsApp y te respondemos en minutos, en español."
                  message={waMessage}
                />
              )}
            </Fragment>
          )
        }
        return <RenderSection key={i} section={section} />
      })}
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)
  if (!post) notFound()

  const toc = buildTOC(post.sections)
  const learnItems = toc.filter((t) => t.level === 'h2').slice(0, 5).map((t) => t.text)

  const [allPosts, unsplashPhotos] = await Promise.all([
    getAllPosts(),
    fetchArticleImages(post.keyword, post.focusKeyword, post.category),
  ])

  const related = (() => {
    const same = allPosts.filter((p) => p.category === post.category && p.slug !== post.slug).slice(0, 3)
    if (same.length < 3) {
      const others = allPosts.filter((p) => p.slug !== post.slug && !same.find((r) => r.slug === p.slug))
      return [...same, ...others].slice(0, 3)
    }
    return same
  })()

  const waMessage = `Hola, tengo una pregunta sobre: ${post.title}`

  const formattedDate = new Date(post.date).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <>
      <BlogNav />
      <ArticleSchema post={post} />
      <BlogStickyBar title={post.headline} ctaHref="https://wa.me/19493461806?text=Hola%2C+quiero+formar+mi+LLC" />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gray-900" style={{ height: 'clamp(280px, 50vw, 520px)' }}>
        {post.photo && (
          <img
            src={post.photo}
            alt={post.headline}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.55 }}
          />
        )}
        {/* Gradient overlay — heavier at bottom for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

        {/* Hero content */}
        <div className="absolute inset-x-0 bottom-0 px-5 sm:px-8 pb-8 sm:pb-10 max-w-5xl mx-auto">
          {/* Badge + meta row */}
          <div className="flex flex-wrap items-center gap-3 mb-3 sm:mb-4">
            <span
              className="text-xs font-semibold text-white px-3 py-1 rounded-full"
              style={{ background: '#2CB98A' }}
            >
              {post.badge}
            </span>
            <span className="flex items-center gap-1.5 text-white/70 text-xs">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              {post.readTime} min de lectura
            </span>
            <span className="text-white/50 text-xs hidden sm:block">{formattedDate}</span>
          </div>

          {/* Title */}
          <h1
            className="font-extrabold text-white leading-tight"
            style={{ fontSize: 'clamp(22px, 4vw, 44px)', fontFamily: 'var(--font-syne, sans-serif)' }}
          >
            {post.headline}
          </h1>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-600 transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-gray-600 transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-gray-500 truncate">{post.badge}</span>
        </nav>

        {/* 2-col layout */}
        <div className="flex gap-12 lg:gap-14">
          {/* ── Main content ─────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Description */}
            <p className="text-lg text-gray-500 leading-relaxed mb-6 border-l-4 pl-4"
               style={{ borderColor: '#00C896' }}>
              {post.description}
            </p>

            {/* "Lo que aprenderás" */}
            <LearnBox items={learnItems} />

            {/* Inline TOC — mobile only */}
            <div className="lg:hidden">
              <TableOfContents items={toc} inline />
            </div>

            {/* Article content with images + WA CTA */}
            <article className="mt-2">
              <ArticleSections
                sections={post.sections}
                photos={unsplashPhotos}
                waMessage={waMessage}
              />
            </article>

            {/* Author */}
            <AuthorCard />

            {/* Related posts */}
            <RelatedPosts posts={related} />

            {/* Final WA CTA */}
            <div className="mt-12">
              <WhatsAppCTA
                headline="¿Listo para crear tu empresa en EE.UU.?"
                subtext="Habla con nuestro equipo por WhatsApp. Sin visa, sin SSN, todo en español."
                message="Hola, quiero formar mi LLC en USA"
              />
            </div>

            {/* Footer CTA */}
            <div className="mt-6 border-t border-gray-100 pt-10">
              <div className="rounded-2xl p-7 sm:p-9 text-center" style={{ background: '#2A3544' }}>
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: '#2CB98A' }}
                >
                  ¿Listo para dar el siguiente paso?
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  Forma tu LLC con nuestro equipo
                </h2>
                <p className="text-gray-400 mb-7 max-w-sm mx-auto text-sm leading-relaxed">
                  Sin visa, sin SSN, sin viajes. Todo el proceso en español con seguimiento
                  en tiempo real desde tu portal.
                </p>
                <a
                  href="/index_final.html?page=wizard"
                  className="inline-block text-white font-semibold px-8 py-3.5 rounded-xl transition-opacity hover:opacity-90 text-sm"
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

          {/* ── Sticky sidebar ─────────────────────────────────────────────── */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-5">
              <TableOfContents items={toc} />

              {/* WA CTA sidebar card */}
              <div
                className="rounded-2xl p-5 text-center border"
                style={{ background: '#f0fdf9', borderColor: '#00C896' }}
              >
                <p className="text-sm font-bold text-gray-900 mb-1">¿Tienes dudas?</p>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                  Escríbenos por WhatsApp, respondemos en minutos.
                </p>
                <a
                  href="https://wa.me/19493461806?text=Hola%2C+quiero+formar+mi+LLC+en+USA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-opacity hover:opacity-90"
                  style={{ background: '#25D366' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
              </div>

              {/* Start button */}
              <div className="rounded-2xl p-5 text-center" style={{ background: '#2A3544' }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#2CB98A' }}>
                  ¿Listo para empezar?
                </p>
                <p className="text-white font-bold text-sm mb-1">Forma tu LLC hoy</p>
                <p className="text-gray-400 text-xs mb-4 leading-relaxed">
                  Sin visa, sin SSN, sin viajar.
                </p>
                <a
                  href="/index_final.html?page=wizard"
                  className="block text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-opacity hover:opacity-90"
                  style={{ background: '#2CB98A' }}
                >
                  Iniciar →
                </a>
              </div>

              {/* Category */}
              <div className="bg-gray-50 rounded-2xl p-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                  Categoría
                </p>
                <span
                  className="inline-block text-xs font-semibold px-3 py-1 rounded-full text-white"
                  style={{ background: '#4DB39A' }}
                >
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
