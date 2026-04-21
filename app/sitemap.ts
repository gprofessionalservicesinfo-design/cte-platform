import type { MetadataRoute } from 'next'
import { posts } from '@/lib/blog/posts'

const BASE_URL = 'https://creatuempresausa.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.modified),
    priority: 0.8,
    changeFrequency: 'monthly',
  }))

  return [
    // ── Core pages ───────────────────────────────────────────────────────────
    {
      url: `${BASE_URL}/`,
      priority: 1.0,
      changeFrequency: 'weekly',
      lastModified: new Date('2026-04-19'),
    },
    {
      url: `${BASE_URL}/blog`,
      priority: 0.9,
      changeFrequency: 'weekly',
      lastModified: new Date('2026-04-19'),
    },
    // ── Marketing / comparison pages ─────────────────────────────────────────
    {
      url: `${BASE_URL}/comparar`,
      priority: 0.9,
      changeFrequency: 'monthly',
      lastModified: new Date('2026-04-19'),
    },
    {
      url: `${BASE_URL}/que-estado-elegir`,
      priority: 0.9,
      changeFrequency: 'monthly',
      lastModified: new Date('2026-04-19'),
    },
    {
      url: `${BASE_URL}/ein-extranjeros`,
      priority: 0.9,
      changeFrequency: 'weekly',
      lastModified: new Date('2026-04-19'),
    },
    // ── LLC state landing pages ───────────────────────────────────────────────
    {
      url: `${BASE_URL}/llc/wyoming`,
      priority: 0.9,
      changeFrequency: 'monthly',
      lastModified: new Date('2026-04-19'),
    },
    {
      url: `${BASE_URL}/llc/florida`,
      priority: 0.85,
      changeFrequency: 'monthly',
      lastModified: new Date('2026-04-19'),
    },
    {
      url: `${BASE_URL}/llc/delaware`,
      priority: 0.85,
      changeFrequency: 'monthly',
      lastModified: new Date('2026-04-19'),
    },
    {
      url: `${BASE_URL}/llc/new-mexico`,
      priority: 0.85,
      changeFrequency: 'monthly',
      lastModified: new Date('2026-04-19'),
    },
    {
      url: `${BASE_URL}/llc/colorado`,
      priority: 0.8,
      changeFrequency: 'monthly',
      lastModified: new Date('2026-04-19'),
    },
    {
      url: `${BASE_URL}/llc/texas`,
      priority: 0.8,
      changeFrequency: 'monthly',
      lastModified: new Date('2026-04-19'),
    },
    // ── Blog posts (auto-generated from posts array) ──────────────────────────
    ...blogEntries,
  ]
}
