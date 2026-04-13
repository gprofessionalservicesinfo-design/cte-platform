import Link from 'next/link'
import type { Post } from '@/lib/blog/posts'

const BADGE_COLORS: Record<string, { color: string; bg: string }> = {
  'Formación LLC': { color: '#1d4ed8', bg: '#eff6ff' },
  'Elegir Estado':  { color: '#7c3aed', bg: '#f5f3ff' },
  'EIN':            { color: '#0891b2', bg: '#ecfeff' },
  'Banca USA':      { color: '#059669', bg: '#ecfdf5' },
  'Impuestos':      { color: '#d97706', bg: '#fffbeb' },
  'Privacidad':     { color: '#64748b', bg: '#f8fafc' },
  'ITIN':           { color: '#2CB98A', bg: '#ecfdf5' },
  'Mercury Bank':   { color: '#059669', bg: '#ecfdf5' },
  'Form 5472':      { color: '#d97706', bg: '#fffbeb' },
  'Comparativa':    { color: '#7c3aed', bg: '#f5f3ff' },
}

interface BlogCardProps {
  post: Post
  featured?: boolean
}

export default function BlogCard({ post, featured = false }: BlogCardProps) {
  const badge = BADGE_COLORS[post.category] ?? { color: '#2CB98A', bg: '#ecfdf5' }

  if (featured) {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group block rounded-2xl border border-gray-200 overflow-hidden hover:border-gray-400 hover:shadow-xl transition-all duration-300"
      >
        <div className="relative h-56 sm:h-72 overflow-hidden bg-gray-100">
          <img
            src={post.photo}
            alt={post.headline}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <span
            className="absolute top-4 left-4 text-xs font-semibold px-3 py-1 rounded-full"
            style={{ color: badge.color, background: badge.bg }}
          >
            {post.badge}
          </span>
        </div>
        <div className="p-7">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#2CB98A] transition-colors leading-snug">
            {post.headline}
          </h2>
          <p className="text-gray-500 leading-relaxed mb-5 line-clamp-2">
            {post.description}
          </p>
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center gap-3">
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('es-MX', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </time>
              <span>·</span>
              <span>{post.readTime} min de lectura</span>
            </div>
            <span className="font-semibold group-hover:underline" style={{ color: '#2CB98A' }}>
              Leer →
            </span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col border border-gray-100 rounded-2xl overflow-hidden hover:border-gray-300 hover:shadow-lg transition-all duration-300"
    >
      <div className="relative h-40 overflow-hidden bg-gray-100">
        <img
          src={post.photo}
          alt={post.headline}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <span
          className="inline-block self-start text-xs font-semibold px-3 py-1 rounded-full mb-3"
          style={{ color: badge.color, background: badge.bg }}
        >
          {post.badge}
        </span>
        <h2 className="text-base font-bold text-gray-900 mb-2 group-hover:text-[#2CB98A] transition-colors leading-snug flex-1">
          {post.headline}
        </h2>
        <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">
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
      </div>
    </Link>
  )
}
