import Link from 'next/link'
import type { Post } from '@/lib/blog/posts'

interface RelatedPostsProps {
  posts: Post[]
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts.length) return null

  return (
    <div className="mt-14">
      <h2
        className="text-xl font-bold mb-6 pb-3 border-b border-gray-100"
        style={{ color: '#2A3544' }}
      >
        Artículos relacionados
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-300 hover:shadow-md transition-all duration-300"
          >
            <div className="relative h-32 overflow-hidden bg-gray-100">
              {post.photo ? (
                <img
                  src={post.photo}
                  alt={post.headline}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full" style={{ background: '#2A3544' }} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            <div className="p-4">
              <p className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-[#2CB98A] transition-colors line-clamp-2">
                {post.headline}
              </p>
              <p className="text-xs text-gray-400 mt-2">{post.readTime} min de lectura</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
